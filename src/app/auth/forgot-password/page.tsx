'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { z } from 'zod';
import Link from 'next/link';
import { AlertCircle, ArrowLeft, CheckCircle } from 'lucide-react';

// Form validation schema
const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

type ForgotPasswordFormState = {
  email: string;
};

export default function ForgotPasswordPage() {
  const [formState, setFormState] = useState<ForgotPasswordFormState>({ email: '' });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const supabase = createClient();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormState({
      ...formState,
      [e.target.name]: e.target.value,
    });
    
    // Clear error for this field when it changes
    if (errors[e.target.name]) {
      setErrors({
        ...errors,
        [e.target.name]: '',
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    try {
      // Validate form
      const result = forgotPasswordSchema.safeParse(formState);
      if (!result.success) {
        const newErrors: { [key: string]: string } = {};
        result.error.issues.forEach((issue) => {
          newErrors[issue.path[0].toString()] = issue.message;
        });
        setErrors(newErrors);
        setIsLoading(false);
        return;
      }

      // Send password reset email
      const { error } = await supabase.auth.resetPasswordForEmail(formState.email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });

      if (error) {
        throw error;
      }

      // Show success message even if email doesn't exist (security best practice)
      setIsSuccess(true);
    } catch (error: any) {
      console.error('Password reset request failed:', error.message);
      setErrorMessage('An error occurred while processing your request. Please try again later.');
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
            <h1 className="text-2xl font-bold mb-2">Check your inbox</h1>
            <p className="text-base-content/70">
              If an account exists for {formState.email}, we've sent a password reset link.
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
          <h1 className="text-2xl font-bold mb-2">Reset your password</h1>
          <p className="text-base-content/70">
            Enter your email address and we'll send you a link to reset your password.
          </p>
        </div>
        
        {errorMessage && (
          <div className="alert alert-error mb-6">
            <AlertCircle className="h-4 w-4" />
            <span>{errorMessage}</span>
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="form-control mb-4">
            <label className="label">
              <span className="label-text">Email</span>
            </label>
            <input
              type="email"
              name="email"
              placeholder="your@email.com"
              value={formState.email}
              onChange={handleChange}
              className={`input input-bordered w-full ${errors.email ? 'input-error' : ''}`}
              disabled={isLoading}
            />
            {errors.email && (
              <label className="label">
                <span className="label-text-alt text-error">{errors.email}</span>
              </label>
            )}
          </div>
          
          <button
            type="submit"
            className="btn btn-primary w-full"
            disabled={isLoading}
          >
            {isLoading ? <span className="loading loading-spinner"></span> : 'Send Reset Link'}
          </button>
        </form>
      </div>
    </div>
  );
} 