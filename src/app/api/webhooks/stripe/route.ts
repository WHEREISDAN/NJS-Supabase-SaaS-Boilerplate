import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { stripe } from '@/lib/stripe';
import { createClient } from '@/lib/supabase/server';
import Stripe from 'stripe';

export async function POST(req: Request) {
  const body = await req.text();
  const signature = (await headers()).get('Stripe-Signature') as string;

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
  try {
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
      quantity: subscription.items.data[0].quantity || 1,
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
    } else {
      console.log(`Successfully updated subscription ${subscription.id} for user ${userId}`);
    }
  } catch (err) {
    console.error('Error in handleSubscriptionChange:', err);
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription, supabase: any) {
  try {
    const { error } = await supabase
      .from('subscriptions')
      .update({ 
        status: 'canceled', 
        ended_at: new Date().toISOString() 
      })
      .eq('stripe_subscription_id', subscription.id);
    
    if (error) {
      console.error('Error updating subscription to canceled:', error);
    } else {
      console.log(`Successfully marked subscription ${subscription.id} as canceled`);
    }
  } catch (err) {
    console.error('Error in handleSubscriptionDeleted:', err);
  }
}