import { createClient } from '@/lib/supabase/server';

export async function getUserSubscription(userId: string) {
  const supabase = await createClient();
  
  try {
    // First get the subscription
    const { data: subscriptions, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .in('status', ['trialing', 'active'])
      .order('created_at', { ascending: false })
      .limit(1);
    
    if (error) {
      console.error('Error fetching user subscription:', error.message);
      return null;
    }
    
    // If no subscriptions found
    if (!subscriptions || subscriptions.length === 0) {
      console.log(`No active subscriptions found for user ${userId}`);
      return null;
    }
    
    // Use the most recent subscription
    const subscription = subscriptions[0];
    
    // Then get the price
    const { data: price, error: priceError } = await supabase
      .from('prices')
      .select('*, products(*)')
      .eq('id', subscription.price_id)
      .single();
    
    if (priceError) {
      console.error('Error fetching price:', priceError.message);
      return subscription;
    }
    
    // Combine the data
    return {
      ...subscription,
      prices: price
    };
  } catch (err) {
    console.error('Unexpected error in getUserSubscription:', err);
    return null;
  }
}

export async function getActiveProductsWithPrices() {
  try {
    const supabase = await createClient();
    
    // First, get all active products
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('*')
      .eq('active', true);
    
    if (productsError) {
      console.error('Error fetching products:', {
        message: productsError.message,
        details: productsError.details,
        hint: productsError.hint
      });
      return [];
    }
    
    if (!products || products.length === 0) {
      console.warn('No active products found');
      return [];
    }
    
    // Then, for each product, get its prices
    const productsWithPrices = await Promise.all(
      products.map(async (product) => {
        const { data: prices, error: pricesError } = await supabase
          .from('prices')
          .select('*')
          .eq('product_id', product.id)
          .eq('active', true)
          .order('unit_amount');
        
        if (pricesError) {
          console.error(`Error fetching prices for product ${product.id}:`, {
            message: pricesError.message,
            details: pricesError.details,
            hint: pricesError.hint
          });
          return { ...product, prices: [] };
        }
        
        return { ...product, prices: prices || [] };
      })
    );
    
    // Sort products by metadata index if available
    return productsWithPrices.sort((a, b) => {
      const indexA = a.metadata?.index ? parseInt(a.metadata.index) : 0;
      const indexB = b.metadata?.index ? parseInt(b.metadata.index) : 0;
      return indexA - indexB;
    });
  } catch (err) {
    console.error('Unexpected error in getActiveProductsWithPrices:', err);
    return [];
  }
}