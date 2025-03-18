"use client";

import { ManageSubscription } from '@/app/dashboard/components/manage-subscription';
import { Subscription } from '@/types/subscription';

interface SubscriptionTabProps {
  subscription: Subscription | null;
}

export default function SubscriptionTab({ subscription }: SubscriptionTabProps) {
  return (
    <div className="card bg-base-100 shadow-sm">
      <div className="card-body p-6">
        <h2 className="text-xl font-bold mb-4">Subscription Details</h2>
        
        {subscription ? (
          <div className="space-y-4">
            <div className="bg-base-200 p-4 rounded-lg">
              <p className="mb-2">
                <span className="font-semibold">Plan:</span> {subscription.prices?.products?.name || 'Unknown Plan'}
              </p>
              <p className="mb-2">
                <span className="font-semibold">Status:</span> {subscription.status}
              </p>
              <p className="mb-4">
                <span className="font-semibold">Current period ends:</span>{' '}
                {subscription.current_period_end ? new Date(subscription.current_period_end).toLocaleDateString() : 'N/A'}
              </p>
            </div>
            
            <ManageSubscription />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-base-200 p-4 rounded-lg">
              <p>You don't have an active subscription.</p>
            </div>
            
            <a href="/pricing" className="btn btn-primary">
              View Plans
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
