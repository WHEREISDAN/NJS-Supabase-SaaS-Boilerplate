import Link from 'next/link';
import { Sparkles } from 'lucide-react';

export default function MagicLinkSentPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-base-100">
      <div className="max-w-md w-full p-6 bg-base-200 rounded-lg shadow-lg text-center">
        <div className="mb-4 flex justify-center">
          <div className="bg-primary/10 p-3 rounded-full">
            <Sparkles className="w-8 h-8 text-primary" />
          </div>
        </div>
        
        <h1 className="text-2xl font-bold mb-2">Check your email</h1>
        <p className="mb-6">
          We've sent you a magic link to sign in to your account. Please check your 
          email and click the link to continue.
        </p>
        
        <div className="mt-4 text-sm text-base-content/70">
          <p>When developing locally, you can see emails at:</p>
          <a 
            href="http://localhost:54324" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            http://localhost:54324
          </a>
        </div>
        
        <div className="divider my-6">OR</div>
        
        <Link href="/auth/signin" className="btn btn-outline w-full">
          Try another method
        </Link>
      </div>
    </div>
  );
} 