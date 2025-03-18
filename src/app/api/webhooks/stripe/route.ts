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
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session, supabase);
        break;
      case 'payment_intent.succeeded':
        await handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent, supabase);
        break;
      case 'invoice.paid':
        await handleInvoicePaid(event.data.object as Stripe.Invoice, supabase);
        break;
      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice, supabase);
        break;
      case 'customer.created':
        await handleCustomerCreated(event.data.object as Stripe.Customer, supabase);
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

async function handleCheckoutCompleted(session: Stripe.Checkout.Session, supabase: any) {
  try {
    // Get user_id from metadata (you should include this in your checkout session creation)
    const userId = session.metadata?.userId;
    
    if (!userId) {
      console.error('No user ID found in session metadata');
      return;
    }
    
    const customerId = session.customer as string;
    
    // Update profile with stripe_customer_id
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ stripe_customer_id: customerId })
      .eq('id', userId);
      
    if (profileError) {
      console.error('Error updating profile with customer ID:', profileError);
    }
    
    // If this was a subscription checkout
    if (session.mode === 'subscription' && session.subscription) {
      // Fetch subscription details
      const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
      
      // Handle subscription - reuse existing function
      await handleSubscriptionChange(subscription, supabase);
    }
  } catch (err) {
    console.error('Error in handleCheckoutCompleted:', err);
  }
}

async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent, supabase: any) {
  try {
    // If there's metadata linking this to a subscription
    if (paymentIntent.metadata?.subscription_id) {
      const subscriptionId = paymentIntent.metadata.subscription_id;
      
      // Update subscription status if needed
      const { error } = await supabase
        .from('subscriptions')
        .update({ status: 'active' })
        .eq('stripe_subscription_id', subscriptionId);
        
      if (error) {
        console.error('Error updating subscription status:', error);
      }
    }
    
    // Log successful payment
    console.log(`Payment succeeded: ${paymentIntent.id} for customer ${paymentIntent.customer}`);
  } catch (err) {
    console.error('Error in handlePaymentIntentSucceeded:', err);
  }
}

async function handleInvoicePaid(invoice: Stripe.Invoice, supabase: any) {
  try {
    const subscriptionId = invoice.subscription as string;
    const customerId = invoice.customer as string;
    
    if (subscriptionId) {
      // Update subscription status to active
      const { error } = await supabase
        .from('subscriptions')
        .update({ 
          status: 'active',
          current_period_end: new Date((invoice.lines.data[0].period.end as number) * 1000).toISOString()
        })
        .eq('stripe_subscription_id', subscriptionId);
        
      if (error) {
        console.error('Error updating subscription after invoice paid:', error);
      } else {
        console.log(`Successfully updated subscription ${subscriptionId} after invoice payment`);
      }
    }
  } catch (err) {
    console.error('Error in handleInvoicePaid:', err);
  }
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice, supabase: any) {
  try {
    const subscriptionId = invoice.subscription as string;
    
    if (subscriptionId) {
      // Update subscription status to past_due
      const { error } = await supabase
        .from('subscriptions')
        .update({ status: 'past_due' })
        .eq('stripe_subscription_id', subscriptionId);
        
      if (error) {
        console.error('Error updating subscription after payment failure:', error);
      } else {
        console.log(`Marked subscription ${subscriptionId} as past_due due to payment failure`);
      }
      
      // Get user information for notification (optional)
      const { data: subscription } = await supabase
        .from('subscriptions')
        .select('user_id')
        .eq('stripe_subscription_id', subscriptionId)
        .single();
        
      if (subscription) {
        // Here you would implement notification logic
        console.log(`Payment failed for user ${subscription.user_id}`);
      }
    }
  } catch (err) {
    console.error('Error in handleInvoicePaymentFailed:', err);
  }
}

async function handleCustomerCreated(customer: Stripe.Customer, supabase: any) {
  try {
    // The user ID should be in the customer metadata if you set it during customer creation
    const userId = customer.metadata?.userId;
    
    if (userId) {
      const { error } = await supabase
        .from('profiles')
        .update({ stripe_customer_id: customer.id })
        .eq('id', userId);
        
      if (error) {
        console.error('Error linking customer to profile:', error);
      } else {
        console.log(`Successfully linked customer ${customer.id} to user ${userId}`);
      }
    } else {
      console.log(`Customer created without user ID in metadata: ${customer.id}`);
    }
  } catch (err) {
    console.error('Error in handleCustomerCreated:', err);
  }
}