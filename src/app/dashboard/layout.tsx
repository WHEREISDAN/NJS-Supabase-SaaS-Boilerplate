import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { DashboardNav } from '../../components/dashboard/DashboardNav';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    redirect('/auth/signin');
  }
  
  return (
    <div className="flex h-screen">
      <DashboardNav />
      <div className="flex-1 flex flex-col overflow-hidden bg-base-200">
        <main className="flex-1 overflow-y-auto p-6 bg-base-100 rounded-tl-[3rem] border-base-200 border-2">
          {children}
        </main>
      </div>
    </div>
  );
} 