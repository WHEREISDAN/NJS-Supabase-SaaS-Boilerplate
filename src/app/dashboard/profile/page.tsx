import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    redirect('/auth/signin');
  }
  
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Profile</h1>
      
      <div className="card bg-base-100 shadow-sm">
        <div className="card-body p-0">
          <div className="p-6 border-b border-base-200">
            <h2 className="card-title">Account Information</h2>
          </div>
          
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="label">
                  <span className="label-text font-medium">Email</span>
                </label>
                <div className="input input-bordered bg-base-200 flex items-center h-auto py-3">{session.user.email}</div>
              </div>
              
              <div>
                <label className="label">
                  <span className="label-text font-medium">User ID</span>
                </label>
                <div className="input input-bordered bg-base-200 flex items-center h-auto py-3 truncate">{session.user.id}</div>
              </div>
            </div>
            
            <div>
              <label className="label">
                <span className="label-text font-medium">Last Sign In</span>
              </label>
              <div className="input input-bordered bg-base-200 flex items-center h-auto py-3">
                {new Date(session.user.last_sign_in_at || '').toLocaleString() || 'Not available'}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="card bg-base-100 shadow-sm mt-8">
        <div className="card-body p-0">
          <div className="p-6 border-b border-base-200">
            <h2 className="card-title">Profile Settings</h2>
            <p className="text-sm opacity-70 mt-1">
              These settings are placeholders and not connected to a backend yet.
            </p>
          </div>
          
          <div className="p-6 space-y-6">
            <div className="form-control w-full">
              <label className="label">
                <span className="label-text font-medium">Full Name</span>
              </label>
              <input 
                type="text" 
                className="input input-bordered w-full" 
                placeholder="Enter your Full name"
                disabled
              />
            </div>
            
            <div className="form-control w-full">
              <label className="label">
                <span className="label-text font-medium">Time Zone</span>
              </label>
              <select className="select select-bordered w-full" disabled>
                <option>Select your time zone</option>
                <option>UTC</option>
                <option>America/New_York</option>
                <option>Europe/London</option>
                <option>Asia/Tokyo</option>
              </select>
            </div>
            
            <div className="pt-4 border-t border-base-200">
              <button 
                className="btn btn-primary btn-disabled"
                disabled
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}