# Stripe Integration Guide for Next.js SaaS Boilerplate

This guide provides a step-by-step approach to integrate Stripe payments into your Next.js SaaS boilerplate project. The integration will work with the existing Supabase authentication system.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Project Setup](#project-setup)
3. [Database Schema Updates](#database-schema-updates)
4. [Backend Implementation](#backend-implementation)
5. [Frontend Implementation](#frontend-implementation)
6. [Webhooks](#webhooks)
7. [Testing](#testing)
8. [Going Live](#going-live)

## Prerequisites

- Stripe account (create one at [stripe.com](https://stripe.com))
- Stripe API keys (available in your Stripe dashboard)
- Supabase project (already set up in your boilerplate)
- Node.js and npm/yarn (already installed)

## Project Setup

### 1. Install Required Packages

```bash
npm install @stripe/stripe-js stripe @supabase/supabase-js
```

### 2. Set Up Environment Variables

Add the following to your `.env.local` file:

```
# Stripe
STRIPE_SECRET_KEY=sk_test_your_test_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_test_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
```

## Database Schema Updates

### 1. Create Subscription Tables

Create a new SQL file in `supabase/sql files/subscriptions.sql`:

```sql
-- Create a subscriptions table
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  status TEXT NOT NULL,
  price_id TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  cancel_at_period_end BOOLEAN NOT NULL DEFAULT FALSE,
  cancel_at TIMESTAMP WITH TIME ZONE,
  canceled_at TIMESTAMP WITH TIME ZONE,
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  ended_at TIMESTAMP WITH TIME ZONE,
  trial_start TIMESTAMP WITH TIME ZONE,
  trial_end TIMESTAMP WITH TIME ZONE,
  stripe_subscription_id TEXT UNIQUE NOT NULL,
  stripe_customer_id TEXT NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Create security policies
CREATE POLICY "Users can view their own subscriptions"
  ON public.subscriptions
  FOR SELECT
  USING (auth.uid() = user_id);

-- Create a prices table
CREATE TABLE IF NOT EXISTS public.prices (
  id TEXT PRIMARY KEY,
  product_id TEXT NOT NULL,
  active BOOLEAN NOT NULL,
  description TEXT,
  unit_amount INTEGER,
  currency TEXT NOT NULL,
  type TEXT NOT NULL,
  interval TEXT,
  interval_count INTEGER,
  trial_period_days INTEGER,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.prices ENABLE ROW LEVEL SECURITY;

-- Create security policies
CREATE POLICY "Prices are viewable by everyone"
  ON public.prices
  FOR SELECT
  USING (true);

-- Create a products table
CREATE TABLE IF NOT EXISTS public.products (
  id TEXT PRIMARY KEY,
  active BOOLEAN NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  image TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Create security policies
CREATE POLICY "Products are viewable by everyone"
  ON public.products
  FOR SELECT
  USING (true);

-- Add stripe_customer_id to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT UNIQUE;
```

### 2. Apply the SQL Migration

Run the SQL file in your Supabase project using the SQL editor in the Supabase dashboard.

## Backend Implementation

### 1. Create Stripe Client Utility

Create a file at `src/lib/stripe/index.ts`:

```typescript
import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16', // Use the latest API version
  appInfo: {
    name: 'Next.js SaaS Boilerplate',
    version: '0.1.0',
  },
});
```

### 2. Create API Routes for Stripe

#### Checkout API Route

Create a file at `src/app/api/stripe/checkout/route.ts`:

```typescript
import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'You must be logged in to create a checkout session' },
        { status: 401 }
      );
    }

    const { price_id, success_url, cancel_url } = await req.json();
    
    if (!price_id || !success_url || !cancel_url) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // Get or create the customer
    const { data: profiles } = await supabase
      .from('profiles')
      .select('stripe_customer_id')
      .eq('id', session.user.id)
      .single();

    let customerId = profiles?.stripe_customer_id;

    if (!customerId) {
      // Create a new customer
      const customer = await stripe.customers.create({
        email: session.user.email,
        metadata: {
          supabase_id: session.user.id,
        },
      });
      
      customerId = customer.id;
      
      // Update the user with the Stripe customer ID
      await supabase
        .from('profiles')
        .update({ stripe_customer_id: customerId })
        .eq('id', session.user.id);
    }

    // Create a checkout session
    const checkoutSession = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [
        {
          price: price_id,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: success_url,
      cancel_url: cancel_url,
      metadata: {
        user_id: session.user.id,
      },
    });

    return NextResponse.json({ sessionId: checkoutSession.id });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json(
      { error: 'An error occurred while creating the checkout session' },
      { status: 500 }
    );
  }
}
```

#### Customer Portal API Route

Create a file at `src/app/api/stripe/portal/route.ts`:

```typescript
import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'You must be logged in to access the customer portal' },
        { status: 401 }
      );
    }

    const { return_url } = await req.json();
    
    if (!return_url) {
      return NextResponse.json(
        { error: 'Missing return_url parameter' },
        { status: 400 }
      );
    }

    // Get the customer
    const { data: profiles } = await supabase
      .from('profiles')
      .select('stripe_customer_id')
      .eq('id', session.user.id)
      .single();

    const customerId = profiles?.stripe_customer_id;

    if (!customerId) {
      return NextResponse.json(
        { error: 'No associated Stripe customer found' },
        { status: 404 }
      );
    }

    // Create a billing portal session
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url,
    });

    return NextResponse.json({ url: portalSession.url });
  } catch (error) {
    console.error('Error creating portal session:', error);
    return NextResponse.json(
      { error: 'An error occurred while creating the portal session' },
      { status: 500 }
    );
  }
}
```

### 3. Create Webhook Handler

Create a file at `src/app/api/webhooks/stripe/route.ts`:

```typescript
import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { stripe } from '@/lib/stripe';
import { createClient } from '@/lib/supabase/server';
import Stripe from 'stripe';

export async function POST(req: Request) {
  const body = await req.text();
  const signature = headers().get('Stripe-Signature') as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error) {
    console.error('Webhook signature verification failed:', error);
    return NextResponse.json(
      { error: 'Webhook signature verification failed' },
      { status: 400 }
    );
  }

  const supabase = await createClient();

  try {
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await handleSubscriptionChange(event.data.object as Stripe.Subscription, supabase);
        break;
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription, supabase);
        break;
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Error handling webhook event:', error);
    return NextResponse.json(
      { error: 'Error handling webhook event' },
      { status: 500 }
    );
  }
}

async function handleSubscriptionChange(subscription: Stripe.Subscription, supabase: any) {
  const customerId = subscription.customer as string;
  
  // Get the user ID from the customer ID
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id')
    .eq('stripe_customer_id', customerId)
    .single();
  
  if (!profiles) {
    console.error('No user found with Stripe customer ID:', customerId);
    return;
  }
  
  const userId = profiles.id;
  
  // Upsert the subscription in the database
  const subscriptionData = {
    user_id: userId,
    status: subscription.status,
    price_id: subscription.items.data[0].price.id,
    quantity: subscription.items.data[0].quantity,
    cancel_at_period_end: subscription.cancel_at_period_end,
    cancel_at: subscription.cancel_at ? new Date(subscription.cancel_at * 1000).toISOString() : null,
    canceled_at: subscription.canceled_at ? new Date(subscription.canceled_at * 1000).toISOString() : null,
    current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
    current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
    created_at: new Date(subscription.created * 1000).toISOString(),
    ended_at: subscription.ended_at ? new Date(subscription.ended_at * 1000).toISOString() : null,
    trial_start: subscription.trial_start ? new Date(subscription.trial_start * 1000).toISOString() : null,
    trial_end: subscription.trial_end ? new Date(subscription.trial_end * 1000).toISOString() : null,
    stripe_subscription_id: subscription.id,
    stripe_customer_id: customerId,
  };
  
  const { error } = await supabase
    .from('subscriptions')
    .upsert(subscriptionData, { onConflict: 'stripe_subscription_id' });
  
  if (error) {
    console.error('Error upserting subscription:', error);
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription, supabase: any) {
  const { error } = await supabase
    .from('subscriptions')
    .update({ status: 'canceled', ended_at: new Date().toISOString() })
    .eq('stripe_subscription_id', subscription.id);
  
  if (error) {
    console.error('Error updating subscription to canceled:', error);
  }
}
```

### 4. Create a Subscription Service

Create a file at `src/lib/subscription/index.ts`:

```typescript
import { createClient } from '@/lib/supabase/server';

export async function getUserSubscription(userId: string) {
  const supabase = await createClient();
  
  const { data: subscription, error } = await supabase
    .from('subscriptions')
    .select('*, prices(*, products(*))')
    .eq('user_id', userId)
    .in('status', ['trialing', 'active'])
    .single();
  
  if (error) {
    return null;
  }
  
  return subscription;
}

export async function getActiveProductsWithPrices() {
  const supabase = await createClient();
  
  const { data: products, error } = await supabase
    .from('products')
    .select('*, prices(*)')
    .eq('active', true)
    .eq('prices.active', true)
    .order('metadata->index')
    .order('unit_amount', { foreignTable: 'prices' });
  
  if (error) {
    console.error('Error fetching products and prices:', error);
    return [];
  }
  
  return products;
}
```

## Frontend Implementation

### 1. Create Stripe Client-Side Provider

Create a file at `src/components/stripe/stripe-provider.tsx`:

```tsx
"use client";

import { loadStripe, Stripe } from '@stripe/stripe-js';
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

type StripeContextType = {
  stripe: Stripe | null;
  isLoading: boolean;
};

const StripeContext = createContext<StripeContextType | undefined>(undefined);

let stripePromise: Promise<Stripe | null>;

export function StripeProvider({ children }: { children: ReactNode }) {
  const [stripe, setStripe] = useState<Stripe | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!stripePromise) {
      stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
    }

    stripePromise.then(stripe => {
      setStripe(stripe);
      setIsLoading(false);
    });
  }, []);

  const value = {
    stripe,
    isLoading,
  };

  return <StripeContext.Provider value={value}>{children}</StripeContext.Provider>;
}

export function useStripe() {
  const context = useContext(StripeContext);
  if (context === undefined) {
    throw new Error('useStripe must be used within a StripeProvider');
  }
  return context;
}
```

### 2. Update Root Layout

Update `src/app/layout.tsx` to include the Stripe provider:

```tsx
// ... existing imports
import { StripeProvider } from '@/components/stripe/stripe-provider';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <StripeProvider>
            {children}
          </StripeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
```

### 3. Create Pricing Component

Create a file at `src/components/stripe/pricing.tsx`:

```tsx
"use client";

import { useState } from 'react';
import { useAuth } from '@/components/auth/auth-provider';
import { useRouter } from 'next/navigation';

interface Price {
  id: string;
  product_id: string;
  unit_amount: number;
  currency: string;
  interval: string;
  interval_count: number;
  trial_period_days: number | null;
  products: {
    name: string;
    description: string | null;
  };
}

interface PricingProps {
  prices: Price[];
}

export function Pricing({ prices }: PricingProps) {
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const { user } = useAuth();
  const router = useRouter();

  const handleCheckout = async (priceId: string) => {
    if (!user) {
      router.push('/auth/signin');
      return;
    }

    setIsLoading(priceId);

    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          price_id: priceId,
          success_url: `${window.location.origin}/dashboard?checkout=success`,
          cancel_url: `${window.location.origin}/pricing?checkout=canceled`,
        }),
      });

      const { sessionId } = await response.json();
      
      // Redirect to Stripe Checkout
      const stripe = (window as any).Stripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);
      await stripe.redirectToCheckout({ sessionId });
    } catch (error) {
      console.error('Error during checkout:', error);
    } finally {
      setIsLoading(null);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-12">
      {prices.map((price) => (
        <div key={price.id} className="card bg-base-200 shadow-xl">
          <div className="card-body">
            <h2 className="card-title">{price.products.name}</h2>
            <p>{price.products.description}</p>
            <div className="mt-4">
              <p className="text-3xl font-bold">
                {new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: price.currency,
                  minimumFractionDigits: 0,
                }).format(price.unit_amount / 100)}
                <span className="text-sm font-normal">
                  /{price.interval}
                </span>
              </p>
              {price.trial_period_days && (
                <p className="text-sm mt-1">
                  {price.trial_period_days} days free trial
                </p>
              )}
            </div>
            <div className="card-actions justify-end mt-6">
              <button
                className="btn btn-primary"
                onClick={() => handleCheckout(price.id)}
                disabled={isLoading === price.id}
              >
                {isLoading === price.id ? 'Loading...' : 'Subscribe'}
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
```

### 4. Create Pricing Page

Create a file at `src/app/pricing/page.tsx`:

```tsx
import { getActiveProductsWithPrices } from '@/lib/subscription';
import { Pricing } from '@/components/stripe/pricing';

export default async function PricingPage() {
  const products = await getActiveProductsWithPrices();

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold text-center mb-8">Pricing Plans</h1>
      <Pricing prices={products.flatMap(product => product.prices)} />
    </div>
  );
}
```

### 5. Create Subscription Management Component

Create a file at `src/components/stripe/manage-subscription.tsx`:

```tsx
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function ManageSubscription() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handlePortalSession = async () => {
    setIsLoading(true);

    try {
      const response = await fetch('/api/stripe/portal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          return_url: window.location.origin + '/dashboard',
        }),
      });

      const { url } = await response.json();
      router.push(url);
    } catch (error) {
      console.error('Error creating portal session:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      className="btn btn-outline"
      onClick={handlePortalSession}
      disabled={isLoading}
    >
      {isLoading ? 'Loading...' : 'Manage Subscription'}
    </button>
  );
}
```

### 6. Update Dashboard Page

Update your dashboard page to show subscription status:

```tsx
import { getUserSubscription } from '@/lib/subscription';
import { createClient } from '@/lib/supabase/server';
import { ManageSubscription } from '@/components/stripe/manage-subscription';
import { redirect } from 'next/navigation';

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    redirect('/auth/signin');
  }
  
  const subscription = await getUserSubscription(session.user.id);
  
  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      
      <div className="card bg-base-200 shadow-xl mb-8">
        <div className="card-body">
          <h2 className="card-title">Subscription Status</h2>
          
          {subscription ? (
            <div>
              <p className="mb-2">
                <span className="font-semibold">Plan:</span> {subscription.prices.products.name}
              </p>
              <p className="mb-2">
                <span className="font-semibold">Status:</span> {subscription.status}
              </p>
              <p className="mb-4">
                <span className="font-semibold">Current period ends:</span>{' '}
                {new Date(subscription.current_period_end).toLocaleDateString()}
              </p>
              
              <ManageSubscription />
            </div>
          ) : (
            <div>
              <p className="mb-4">You don't have an active subscription.</p>
              <a href="/pricing" className="btn btn-primary">View Plans</a>
            </div>
          )}
        </div>
      </div>
      
      {/* Rest of your dashboard content */}
    </div>
  );
}
```

## Webhooks

### 1. Set Up Stripe CLI for Local Testing

Install the Stripe CLI from [https://stripe.com/docs/stripe-cli](https://stripe.com/docs/stripe-cli)

Login to your Stripe account:

```bash
stripe login
```

Forward webhooks to your local server:

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

This will provide you with a webhook secret. Add it to your `.env.local` file:

```
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
```

### 2. Sync Products and Prices

Create a script to sync products and prices from Stripe to your Supabase database:

Create a file at `scripts/sync-stripe-products.js`:

```javascript
require('dotenv').config({ path: '.env.local' });
const Stripe = require('stripe');
const { createClient } = require('@supabase/supabase-js');

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function syncProducts() {
  console.log('Syncing products and prices...');
  
  // Fetch all products from Stripe
  const products = await stripe.products.list({ active: true });
  
  // Upsert products to Supabase
  for (const product of products.data) {
    const { error } = await supabase
      .from('products')
      .upsert({
        id: product.id,
        active: product.active,
        name: product.name,
        description: product.description,
        image: product.images?.[0] || null,
        metadata: product.metadata,
      });
    
    if (error) {
      console.error(`Error upserting product ${product.id}:`, error);
    }
  }
  
  // Fetch all prices from Stripe
  const prices = await stripe.prices.list({ active: true });
  
  // Upsert prices to Supabase
  for (const price of prices.data) {
    const { error } = await supabase
      .from('prices')
      .upsert({
        id: price.id,
        product_id: price.product,
        active: price.active,
        currency: price.currency,
        description: price.nickname,
        type: price.type,
        unit_amount: price.unit_amount,
        interval: price.recurring?.interval || null,
        interval_count: price.recurring?.interval_count || null,
        trial_period_days: price.recurring?.trial_period_days || null,
        metadata: price.metadata,
      });
    
    if (error) {
      console.error(`Error upserting price ${price.id}:`, error);
    }
  }
  
  console.log('Sync completed!');
}

syncProducts()
  .catch(error => {
    console.error('Error syncing products and prices:', error);
    process.exit(1);
  });
```

Add a script to your `package.json`:

```json
"scripts": {
  "sync-stripe": "node scripts/sync-stripe-products.js"
}
```

Run the script to sync products and prices:

```bash
npm run sync-stripe
```

## Testing

### 1. Test Checkout Flow

1. Create test products and prices in your Stripe dashboard
2. Run the sync script to import them to your database
3. Navigate to your pricing page
4. Click on a subscription plan
5. Complete the checkout using Stripe test card numbers:
   - Success: 4242 4242 4242 4242
   - Requires Authentication: 4000 0025 0000 3155
   - Declined: 4000 0000 0000 9995

### 2. Test Webhook Handling

1. Use the Stripe CLI to trigger test webhook events:

```bash
stripe trigger customer.subscription.created
stripe trigger customer.subscription.updated
stripe trigger customer.subscription.deleted
```

2. Check your database to verify that the subscription data is updated correctly

## Going Live

### 1. Update Environment Variables

Update your environment variables with your live Stripe API keys:

```
STRIPE_SECRET_KEY=sk_live_your_live_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_your_live_key
```

### 2. Set Up Webhook Endpoint in Stripe Dashboard

1. Go to the Stripe Dashboard > Developers > Webhooks
2. Add an endpoint with your production URL: `https://yourdomain.com/api/webhooks/stripe`
3. Select the events to listen for:
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
4. Get the webhook signing secret and update your environment variable:

```
STRIPE_WEBHOOK_SECRET=whsec_your_live_webhook_secret
```

### 3. Deploy Your Application

Deploy your application to your hosting provider with the updated environment variables.

## Additional Considerations

### 1. Subscription Status Middleware

You might want to create middleware to check subscription status for protected routes:

```typescript
// src/middleware/subscription.ts
import { NextResponse } from 'next/server';
import { getUserSubscription } from '@/lib/subscription';
import { createClient } from '@/lib/supabase/server';

export async function withSubscription(request) {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    return NextResponse.redirect(new URL('/auth/signin', request.url));
  }
  
  const subscription = await getUserSubscription(session.user.id);
  
  if (!subscription) {
    return NextResponse.redirect(new URL('/pricing', request.url));
  }
  
  return NextResponse.next();
}
```

### 2. Error Handling

Implement proper error handling and user feedback for payment failures and other edge cases.

### 3. Subscription Tiers

Implement different access levels based on subscription tiers by checking the price ID or product ID.

### 4. Cancellation and Upgrades

Implement logic to handle subscription cancellations, upgrades, and downgrades.

### 5. Invoices and Receipts

Add functionality to display invoices and receipts to users.

---

This guide provides a comprehensive approach to integrating Stripe with your Next.js SaaS boilerplate. Adjust the implementation as needed to fit your specific requirements and business logic. 