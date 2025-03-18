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
    } else {
      console.log(`Successfully upserted product ${product.id}: ${product.name}`);
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
    } else {
      console.log(`Successfully upserted price ${price.id} for product ${price.product}`);
    }
  }
  
  console.log('Sync completed!');
}

syncProducts()
  .catch(error => {
    console.error('Error syncing products and prices:', error);
    process.exit(1);
  });