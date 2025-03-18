import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import SettingsTabs from './components/settings-tabs';
import { getUserSubscription } from '@/lib/subscription';

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    redirect('/auth/signin');
  }
  
  // Fetch the user's profile data
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', session.user.id)
    .single();
  
  // Fetch the user's subscription data
  const subscription = await getUserSubscription(session.user.id);
  
  return (
    <div className="">
      <h1 className="text-3xl font-bold mb-6">Profile Settings</h1>
      
      <SettingsTabs
        userId={session.user.id} 
        email={session.user.email || ''} 
        initialFullName={profile?.full_name || ''} 
        initialWebsite={profile?.website || ''} 
        avatarUrl={profile?.avatar_url || ''}
        subscription={subscription}
      />
    </div>
  );
}