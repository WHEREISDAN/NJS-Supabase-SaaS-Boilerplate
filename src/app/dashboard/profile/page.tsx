import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import ProfileForm from './components/profile-form';

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
  
  return (
    <div className="max-w-screen mx-auto">
      <h1 className="text-3xl font-bold mb-6">Profile Settings</h1>
      
      <ProfileForm 
        userId={session.user.id} 
        email={session.user.email || ''} 
        initialFullName={profile?.full_name || ''} 
        initialWebsite={profile?.website || ''} 
        avatarUrl={profile?.avatar_url || ''}
      />
    </div>
  );
}