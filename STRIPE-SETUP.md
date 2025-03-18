# Stripe Integration Setup Guide

This guide provides instructions on how to properly set up and fix the Stripe integration in your Next.js SaaS boilerplate.

## Database Schema Fixes

The main issue with the current implementation is the missing relationship between the `products` and `prices` tables. To fix this:

1. Run the SQL script to add the foreign key constraint:

```bash
# Navigate to your Supabase dashboard
# Go to the SQL Editor
# Paste and run the following SQL:

-- Add foreign key constraint to prices table
ALTER TABLE public.prices
ADD CONSTRAINT prices_product_id_fkey
FOREIGN KEY (product_id)
REFERENCES public.products(id)
ON DELETE CASCADE;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS prices_product_id_idx ON public.prices(product_id);
```

Alternatively, you can run the `fix-relationships.sql` file in the `supabase/sql files/` directory.

## Syncing Products and Prices

To populate your database with products and prices from Stripe:

1. Make sure your environment variables are set up correctly in `.env.local`:

```
STRIPE_SECRET_KEY=sk_test_your_test_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_test_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

2. Run the sync script:

```bash
npm run sync-stripe
```

This will fetch all active products and prices from your Stripe account and upsert them into your Supabase database.

## Code Changes

The following code changes have been made to fix the integration:

1. Updated the subscription service to properly handle the relationship between products and prices:
   - Modified `getUserSubscription` to fetch subscription and price data separately and then combine them
   - Rewrote `getActiveProductsWithPrices` to fetch products and prices separately

2. Updated the pricing component to handle the new data structure:
   - Changed the interface to use `ProductWithPrices` instead of `Price[]`
   - Updated the rendering logic to map through products and their prices

3. Updated the dashboard page to safely access nested properties with optional chaining and added null checks

4. Enhanced the webhook handler with better error handling and logging

## Testing the Integration

To test the integration:

1. Create test products and prices in your Stripe dashboard
2. Run the sync script to import them to your database
3. Navigate to your pricing page to verify that the products and prices are displayed correctly
4. Test the checkout flow with a test card:
   - Success: 4242 4242 4242 4242
   - Requires Authentication: 4000 0025 0000 3155
   - Declined: 4000 0000 0000 9995

## Webhook Setup

For webhooks to work properly:

1. For local development, use the Stripe CLI:
   ```bash
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```

2. For production, set up a webhook endpoint in your Stripe dashboard:
   - URL: `https://yourdomain.com/api/webhooks/stripe`
   - Events to listen for:
     - `customer.subscription.created`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`

## Troubleshooting

If you encounter issues:

1. Check the browser console and server logs for errors
2. Verify that the database schema is set up correctly
3. Make sure your Stripe API keys are valid
4. Ensure that products and prices exist in your Stripe account and have been synced to your database
5. If you see relationship errors, check that the foreign key constraints are properly set up
6. Verify that the subscription data structure matches what your code expects

## Common Errors and Solutions

### "Could not find a relationship between 'subscriptions' and 'price_id' in the schema cache"

This error occurs when trying to use the Supabase join syntax with tables that don't have a foreign key relationship defined. The solution is to:

1. Fetch the subscription data first
2. Then fetch the related price data separately
3. Combine the data before returning it

### "Could not find a relationship between 'products' and 'prices' in the schema cache"

This error occurs when trying to join the products and prices tables without a foreign key constraint. The solution is to:

1. Add the foreign key constraint as described in the Database Schema Fixes section
2. Fetch products and prices separately if the constraint cannot be added

### "JSON object requested, multiple (or no) rows returned"

This error occurs when using the `.single()` method in Supabase queries but either no rows or multiple rows are returned. The solution is to:

1. Replace `.single()` with `.limit(1)` to get at most one row
2. Add proper ordering (e.g., `.order('created_at', { ascending: false })`) to get the most recent record
3. Check if the returned array is empty before accessing its elements
4. Handle the case where no records are found gracefully

For more detailed information, refer to the Stripe documentation: https://stripe.com/docs 