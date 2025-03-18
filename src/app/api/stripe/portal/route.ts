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