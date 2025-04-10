"use client";

import { useState } from 'react';
import { useAuth } from '@/contexts/auth-provider';
import { useRouter } from 'next/navigation';
import { Github, Sparkles, AlertCircle, CheckCircle } from 'lucide-react';
import Image from 'next/image';
import { z } from 'zod';

// Form validation schema
const signupSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
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

export function SignUpForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const auth = useAuth(); // Use auth directly to access all methods
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setErrors({});
    
    // Validate form
    const result = signupSchema.safeParse({ email, password, confirmPassword });
    if (!result.success) {
      const newErrors: { [key: string]: string } = {};
      result.error.issues.forEach((issue) => {
        newErrors[issue.path[0].toString()] = issue.message;
      });
      setErrors(newErrors);
      return;
    }
    
    setIsLoading(true);

    try {
      const response = await auth.signUp(email, password);
      
      // Check if email confirmations are enabled
      if (response.data.user && !response.data.session) {
        // User created but no session - verification required
        setIsSuccess(true);
      } else {
        // User created and session provided - no verification required
        router.push('/dashboard');
        router.refresh();
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to sign up');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="w-full max-w-md mx-auto p-6">
        <div className="flex flex-col items-center text-center mb-6">
          <CheckCircle className="text-success w-16 h-16 mb-4" />
          <h2 className="text-2xl font-bold mb-2">Verify your email</h2>
          <p className="text-base-content/70 mb-6">
            We've sent a verification link to <strong>{email}</strong>. 
            Please check your inbox and click the link to activate your account.
          </p>
          <div className="alert alert-info mb-4">
            <p>
              If you don't see the email after a few minutes, check your spam folder or
              <button 
                className="link link-primary ml-1"
                onClick={async () => {
                  try {
                    const { error } = await auth.resendEmailVerification(email);
                    if (error) throw error;
                    alert('Verification email sent again! Please check your inbox.');
                  } catch (error) {
                    alert('Failed to resend verification email. Please try again later.');
                  }
                }}
              >
                click here to resend it
              </button>.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Create an Account</h2>
      
      {error && (
        <div className="alert alert-error mb-4">
          <AlertCircle className="h-4 w-4" />
          <span>{error}</span>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="form-control">
          <label className="label">
            <span className="label-text">Email</span>
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={`input input-bordered w-full ${errors.email ? 'input-error' : ''}`}
            required
          />
          {errors.email && (
            <label className="label">
              <span className="label-text-alt text-error">{errors.email}</span>
            </label>
          )}
        </div>
        
        <div className="form-control">
          <label className="label">
            <span className="label-text">Password</span>
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={`input input-bordered w-full ${errors.password ? 'input-error' : ''}`}
            required
          />
          {errors.password && (
            <label className="label">
              <span className="label-text-alt text-error">{errors.password}</span>
            </label>
          )}
        </div>
        
        <div className="form-control">
          <label className="label">
            <span className="label-text">Confirm Password</span>
          </label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className={`input input-bordered w-full ${errors.confirmPassword ? 'input-error' : ''}`}
            required
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
          {isLoading ? <span className="loading loading-spinner"></span> : 'Sign Up'}
        </button>
      </form>

      <div className="divider my-6">OR</div>
      
      <div className="flex justify-between w-full">
        <div className="tooltip flex-1 mx-1" data-tip="Continue with GitHub">
          <button className="btn btn-lg h-16 w-full bg-gray-800 hover:bg-gray-900 border-none">
            <Github className="w-7 h-7 text-white" />
          </button>
        </div>
        
        <div className="tooltip flex-1 mx-1" data-tip="Continue with Google">
          <button className="btn btn-lg h-16 w-full bg-white hover:bg-gray-100 border-gray-300">
            <Image 
              src="/google-icon.svg" 
              alt="Google" 
              width={28} 
              height={28} 
            />
          </button>
        </div>
        
        <div className="tooltip flex-1 mx-1" data-tip="Continue with Magic Link">
          <button className="btn btn-lg h-16 w-full bg-purple-600 hover:bg-purple-700 border-none">
            <Sparkles className="w-7 h-7 text-white" />
          </button>
        </div>
      </div>
    </div>
  );
}
