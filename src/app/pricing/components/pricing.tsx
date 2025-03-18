"use client";

import { useState } from 'react';
import { useAuth } from '@/components/auth/auth-provider';
import { useRouter } from 'next/navigation';

interface Product {
  id: string;
  name: string;
  description: string | null;
  active: boolean;
  image: string | null;
  metadata: Record<string, any> | null;
}

interface Price {
  id: string;
  product_id: string;
  unit_amount: number;
  currency: string;
  interval: string;
  interval_count: number;
  trial_period_days: number | null;
  active: boolean;
}

interface ProductWithPrices extends Product {
  prices: Price[];
}

interface PricingProps {
  products: ProductWithPrices[];
}

export function Pricing({ products }: PricingProps) {
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
      {products.flatMap(product => 
        product.prices.map(price => (
          <div key={price.id} className="card bg-base-200 shadow-xl">
            <div className="card-body">
              <h2 className="card-title">{product.name}</h2>
              <p>{product.description}</p>
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
        ))
      )}
    </div>
  );
}