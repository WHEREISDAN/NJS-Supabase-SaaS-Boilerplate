import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const type = requestUrl.searchParams.get('type');
  const next = requestUrl.searchParams.get('next');
  
  // Get the source from the URL (signup, recovery, etc.) for our verified page
  const source = type || requestUrl.searchParams.get('source');

  if (code) {
    const cookieStore = cookies();
    const supabase = await createClient();
    try {
      const { error, data } = await supabase.auth.exchangeCodeForSession(code);
      
      if (!error) {
        // Check if this looks like an email verification
        if (source === 'signup' || source === 'recovery') {
          return NextResponse.redirect(`${requestUrl.origin}/auth/verified?source=${source}`);
        }
        
        // If there's a next parameter, redirect there
        if (next) {
          return NextResponse.redirect(`${requestUrl.origin}${next}`);
        }
        
        // Default: redirect to dashboard
        return NextResponse.redirect(`${requestUrl.origin}/dashboard`);
      }
      
      console.error('Error exchanging code for session:', error.message);
    } catch(e) {
      console.error('Exception during code exchange:', e);
    }
  }

  // Fallback redirect to an error page if code exchange fails
  console.error('Auth callback error: Missing code or exchange failed');
  return NextResponse.redirect(`${requestUrl.origin}/auth/error?message=Authentication failed`);
} 