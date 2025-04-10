"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/auth-provider';
import { useRouter, useSearchParams } from 'next/navigation';
import { Github, Sparkles, AlertCircle } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export function SignInForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { signIn, signInWithGithub, signInWithGoogle, signInWithMagicLink } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Check for success message in URL params (e.g., from password reset)
  useEffect(() => {
    const message = searchParams.get('message');
    if (message) {
      setSuccessMessage(message);
      // Auto-hide success message after 5 seconds
      const timer = setTimeout(() => setSuccessMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await signIn(email, password);
      router.push('/dashboard');
      router.refresh();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to sign in');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGithubSignIn = async () => {
    setError(null);
    setIsLoading(true);
    try {
      console.log('Initiating GitHub sign in...');
      await signInWithGithub();
      // No need to redirect - OAuth will handle it
    } catch (error) {
      console.error('GitHub sign in error:', error);
      setError(error instanceof Error ? error.message : 'Failed to sign in with GitHub');
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setIsLoading(true);
    try {
      console.log('Initiating Google sign in...');
      await signInWithGoogle();
      // No need to redirect - OAuth will handle it
    } catch (error) {
      console.error('Google sign in error:', error);
      setError(error instanceof Error ? error.message : 'Failed to sign in with Google');
      setIsLoading(false);
    }
  };

  const handleMagicLinkSignIn = async () => {
    setError(null);
    if (!email) {
      setError('Please enter your email address to sign in with a magic link');
      return;
    }
    
    setIsLoading(true);
    try {
      await signInWithMagicLink(email);
      router.push('/auth/magic-link/sent');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to send magic link');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Sign In</h2>
      
      {successMessage && (
        <div className="alert alert-success mb-4">
          <span>{successMessage}</span>
        </div>
      )}
      
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
            className="input input-bordered w-full"
            required
          />
        </div>
        
        <div className="form-control">
          <label className="label">
            <span className="label-text">Password</span>
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input input-bordered w-full"
            required
          />
          <label className="label">
            <Link href="/auth/forgot-password" className="label-text-alt link link-hover text-primary">
              Forgot password?
            </Link>
          </label>
        </div>
        
        <button
          type="submit"
          className="btn btn-primary w-full"
          disabled={isLoading}
        >
          {isLoading ? <span className="loading loading-spinner"></span> : 'Sign In'}
        </button>
      </form>

      <div className="divider my-6">OR</div>
      
      <div className="flex justify-between w-full">
        <div className="tooltip flex-1 mx-1" data-tip="Continue with GitHub">
          <button 
            onClick={handleGithubSignIn}
            disabled={isLoading}
            className="btn btn-lg h-16 w-full bg-gray-800 hover:bg-gray-900 border-none"
          >
            <Github className="w-7 h-7 text-white" />
          </button>
        </div>
        
        <div className="tooltip flex-1 mx-1" data-tip="Continue with Google">
          <button 
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="btn btn-lg h-16 w-full bg-white hover:bg-gray-100 border-gray-300"
          >
            <Image 
              src="/google-icon.svg" 
              alt="Google" 
              width={28} 
              height={28} 
            />
          </button>
        </div>
        
        <div className="tooltip flex-1 mx-1" data-tip="Continue with Magic Link">
          <button 
            onClick={handleMagicLinkSignIn}
            disabled={isLoading}
            className="btn btn-lg h-16 w-full bg-purple-600 hover:bg-purple-700 border-none"
          >
            <Sparkles className="w-7 h-7 text-white" />
          </button>
        </div>
      </div>
    </div>
  );
}
