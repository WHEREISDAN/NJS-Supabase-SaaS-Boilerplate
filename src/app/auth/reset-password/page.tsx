'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { z } from 'zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AlertCircle, CheckCircle, Lock } from 'lucide-react';

// Form validation schema
const resetPasswordSchema = z.object({
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type ResetPasswordFormState = {
  password: string;
  confirmPassword: string;
};

export default function ResetPasswordPage() {
  const [formState, setFormState] = useState<ResetPasswordFormState>({
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isValidSession, setIsValidSession] = useState<boolean | null>(null);
  
  const supabase = createClient();
  const router = useRouter();

  // Check if user has a valid session from the password reset link
  useEffect(() => {
    const checkSession = async () => {
      const { data, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Error checking session:', error.message);
        setIsValidSession(false);
        return;
      }
      
      setIsValidSession(!!data.session);
    };
    
    checkSession();
  }, []);

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
      const result = resetPasswordSchema.safeParse(formState);
      if (!result.success) {
        const newErrors: { [key: string]: string } = {};
        result.error.issues.forEach((issue) => {
          newErrors[issue.path[0].toString()] = issue.message;
        });
        setErrors(newErrors);
        setIsLoading(false);
        return;
      }

      // Update password
      const { error } = await supabase.auth.updateUser({
        password: formState.password,
      });

      if (error) {
        throw error;
      }

      setIsSuccess(true);
      
      // Redirect to login after a short delay
      setTimeout(() => {
        router.push('/auth/signin?message=Your password has been reset successfully');
      }, 3000);
      
    } catch (error: any) {
      console.error('Password reset failed:', error.message);
      setErrorMessage(error.message || 'An error occurred while resetting your password. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isValidSession === null) {
    // Loading state while checking session
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6">
        <div className="loading loading-spinner text-primary"></div>
      </div>
    );
  }

  if (isValidSession === false) {
    // Invalid or expired session
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6">
        <div className="bg-base-200 p-8 rounded-lg shadow-lg max-w-md w-full text-center">
          <AlertCircle className="mx-auto text-error w-16 h-16 mb-4" />
          <h1 className="text-2xl font-bold mb-2">Invalid or expired link</h1>
          <p className="text-base-content/70 mb-6">
            The password reset link is invalid or has expired. Please request a new password reset link.
          </p>
          <Link href="/auth/forgot-password" className="btn btn-primary w-full">
            Request new reset link
          </Link>
        </div>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6">
        <div className="bg-base-200 p-8 rounded-lg shadow-lg max-w-md w-full text-center">
          <CheckCircle className="mx-auto text-success w-16 h-16 mb-4" />
          <h1 className="text-2xl font-bold mb-2">Password reset successful</h1>
          <p className="text-base-content/70 mb-6">
            Your password has been reset successfully. You'll be redirected to the sign in page shortly.
          </p>
          <Link href="/auth/signin" className="btn btn-primary w-full">
            Sign in now
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6">
      <div className="bg-base-200 p-8 rounded-lg shadow-lg max-w-md w-full">
        <div className="flex flex-col items-center text-center mb-6">
          <Lock className="text-primary w-12 h-12 mb-4" />
          <h1 className="text-2xl font-bold mb-2">Reset your password</h1>
          <p className="text-base-content/70">
            Please enter a new password for your account
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
              <span className="label-text">New Password</span>
            </label>
            <input
              type="password"
              name="password"
              placeholder="••••••••"
              value={formState.password}
              onChange={handleChange}
              className={`input input-bordered w-full ${errors.password ? 'input-error' : ''}`}
              disabled={isLoading}
            />
            {errors.password && (
              <label className="label">
                <span className="label-text-alt text-error">{errors.password}</span>
              </label>
            )}
          </div>
          
          <div className="form-control mb-6">
            <label className="label">
              <span className="label-text">Confirm New Password</span>
            </label>
            <input
              type="password"
              name="confirmPassword"
              placeholder="••••••••"
              value={formState.confirmPassword}
              onChange={handleChange}
              className={`input input-bordered w-full ${errors.confirmPassword ? 'input-error' : ''}`}
              disabled={isLoading}
            />
            {errors.confirmPassword && (
              <label className="label">
                <span className="label-text-alt text-error">{errors.confirmPassword}</span>
              </label>
            )}
          </div>
          
          <button
            type="submit"
            className="btn btn-primary w-full"
            disabled={isLoading}
          >
            {isLoading ? <span className="loading loading-spinner"></span> : 'Reset Password'}
          </button>
        </form>
      </div>
    </div>
  );
} 