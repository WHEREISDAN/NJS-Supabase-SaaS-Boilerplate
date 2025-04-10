'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth-provider';
import { z } from 'zod';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { AlertCircle, ArrowLeft, CheckCircle, Mail } from 'lucide-react';

// Form validation schema
const emailSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

export default function VerifyPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const auth = useAuth();
  const searchParams = useSearchParams();

  // Prefill email from URL query param if available
  useEffect(() => {
    const emailParam = searchParams.get('email');
    if (emailParam) {
      setEmail(emailParam);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    // Validate email
    const result = emailSchema.safeParse({ email });
    if (!result.success) {
      setError(result.error.issues[0].message);
      return;
    }
    
    setIsLoading(true);

    try {
      const { error } = await auth.resendEmailVerification(email);
      if (error) throw error;
      
      setIsSuccess(true);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to resend verification email');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6">
        <div className="bg-base-200 p-8 rounded-lg shadow-lg max-w-md w-full">
          <div className="flex flex-col items-center text-center mb-6">
            <CheckCircle className="text-success w-16 h-16 mb-4" />
            <h1 className="text-2xl font-bold mb-2">Verification email sent</h1>
            <p className="text-base-content/70">
              We've sent a verification link to <strong>{email}</strong>.
              Please check your inbox and click the link to activate your account.
            </p>
          </div>
          <div className="flex flex-col gap-3">
            <Link href="/auth/signin" className="btn btn-primary">
              Back to Sign In
            </Link>
            <button
              className="btn btn-outline"
              onClick={() => setIsSuccess(false)}
            >
              Try a different email
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6">
      <div className="bg-base-200 p-8 rounded-lg shadow-lg max-w-md w-full">
        <div className="mb-6">
          <Link href="/auth/signin" className="flex items-center text-sm mb-4 text-base-content/70 hover:text-primary">
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Sign In
          </Link>
          <div className="flex flex-col items-center text-center">
            <Mail className="text-primary w-16 h-16 mb-4" />
            <h1 className="text-2xl font-bold mb-2">Resend verification email</h1>
            <p className="text-base-content/70">
              Enter your email address and we'll send you a new verification link.
            </p>
          </div>
        </div>
        
        {error && (
          <div className="alert alert-error mb-6">
            <AlertCircle className="h-4 w-4" />
            <span>{error}</span>
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="form-control mb-4">
            <label className="label">
              <span className="label-text">Email</span>
            </label>
            <input
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input input-bordered w-full"
              disabled={isLoading}
            />
          </div>
          
          <button
            type="submit"
            className="btn btn-primary w-full"
            disabled={isLoading}
          >
            {isLoading ? <span className="loading loading-spinner"></span> : 'Resend Verification Email'}
          </button>
        </form>
      </div>
    </div>
  );
} 