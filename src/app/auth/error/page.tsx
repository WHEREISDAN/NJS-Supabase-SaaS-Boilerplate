'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function AuthErrorPage() {
  const searchParams = useSearchParams();
  const [errorMessage, setErrorMessage] = useState('An authentication error occurred');
  
  useEffect(() => {
    const message = searchParams.get('message');
    if (message) {
      setErrorMessage(message);
    }
  }, [searchParams]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6">
      <div className="bg-base-200 p-8 rounded-lg shadow-lg max-w-md w-full text-center">
        <h1 className="text-2xl font-bold text-error mb-4">Authentication Error</h1>
        <p className="mb-6">{errorMessage}</p>
        <div className="flex flex-col gap-3">
          <Link href="/auth/signin" className="btn btn-primary">
            Back to Sign In
          </Link>
          <Link href="/" className="btn btn-outline">
            Go to Homepage
          </Link>
        </div>
      </div>
    </div>
  );
} 