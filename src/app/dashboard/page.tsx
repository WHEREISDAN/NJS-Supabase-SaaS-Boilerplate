import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { getUserSubscription } from '@/services/subscription';
import { ManageSubscription } from './components/manage-subscription';

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect('/auth/signin');
  }

  const subscription = await getUserSubscription(session.user.id);

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      <div className="bg-base-200 p-6 rounded-lg">
        <p className="mb-4">Welcome, {session.user.email}</p>
        <h2 className="text-lg font-bold mb-4">Subscription Status: </h2>
        {subscription ? (
          <div>
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

            <ManageSubscription />
          </div>
        ) : (
          <div>
            <p className="mb-4">You don't have an active subscription.</p>
            <a href="/pricing" className="btn btn-primary">
              View Plans
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
