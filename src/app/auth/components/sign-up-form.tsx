"use client";

import { useState } from 'react';
import { useAuth } from '@/contexts/auth-provider';
import { useRouter } from 'next/navigation';
import { Github, Sparkles } from 'lucide-react';
import Image from 'next/image';

export function SignUpForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { signUp } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    setIsLoading(true);

    try {
      await signUp(email, password);
      router.push('/dashboard'); // Redirect to dashboard after sign up
      router.refresh(); // Refresh to update auth state in server components
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to sign up');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Create an Account</h2>
      
      {error && (
        <div className="alert alert-error mb-4">
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
        </div>
        
        <div className="form-control">
          <label className="label">
            <span className="label-text">Confirm Password</span>
          </label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="input input-bordered w-full"
            required
          />
        </div>
        
        <button
          type="submit"
          className="btn btn-primary w-full"
          disabled={isLoading}
        >
          {isLoading ? 'Creating account...' : 'Sign Up'}
        </button>
      </form>

      <div className="divider my-6">OR</div>
      
      <div className="flex justify-between w-full">
        <div className="tooltip flex-1 mx-1" data-tip="Sign up with GitHub">
          <button className="btn btn-lg h-16 w-full bg-gray-800 hover:bg-gray-900 border-none">
            <Github className="w-7 h-7 text-white" />
          </button>
        </div>
        
        <div className="tooltip flex-1 mx-1" data-tip="Sign up with Google">
          <button className="btn btn-lg h-16 w-full bg-white hover:bg-gray-100 border-gray-300">
            <Image 
              src="/google-icon.svg" 
              alt="Google" 
              width={28} 
              height={28} 
            />
          </button>
        </div>
        
        <div className="tooltip flex-1 mx-1" data-tip="Sign up with Magic Link">
          <button className="btn btn-lg h-16 w-full bg-purple-600 hover:bg-purple-700 border-none">
            <Sparkles className="w-7 h-7 text-white" />
          </button>
        </div>
      </div>
    </div>
  );
}
