'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, Lock } from 'lucide-react';

export default function VerifiedPage() {
  const searchParams = useSearchParams();
  const [source, setSource] = useState<'signup' | 'recovery' | null>(null);
  
  useEffect(() => {
    const sourceParam = searchParams.get('source') as 'signup' | 'recovery' | null;
    if (sourceParam) {
      setSource(sourceParam);
    }
  }, [searchParams]);

  const getTitle = () => {
    if (source === 'signup') {
      return 'Email Successfully Verified';
    }
    if (source === 'recovery') {
      return 'Password Successfully Reset';
    }
    return 'Verification Successful';
  };

  const getMessage = () => {
    if (source === 'signup') {
      return 'Your email has been verified. You can now sign in to your account.';
    }
    if (source === 'recovery') {
      return 'Your password has been successfully reset.';
    }
    return 'Your account has been verified.';
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6">
      <div className="bg-base-200 p-8 rounded-lg shadow-lg max-w-md w-full">
        <div className="flex flex-col items-center text-center mb-6">
          {source === 'recovery' ? (
            <Lock className="text-success w-16 h-16 mb-4" />
          ) : (
            <CheckCircle className="text-success w-16 h-16 mb-4" />
          )}
          <h1 className="text-2xl font-bold mb-2">{getTitle()}</h1>
          <p className="text-base-content/70 mb-6">
            {getMessage()}
          </p>
        </div>
        <Link href="/auth/signin" className="btn btn-primary w-full">
          Sign In Now
        </Link>
      </div>
    </div>
  );
} 