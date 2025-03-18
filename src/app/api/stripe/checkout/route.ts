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