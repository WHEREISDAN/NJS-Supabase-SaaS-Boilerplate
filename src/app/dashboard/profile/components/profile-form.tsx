"use client";

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

interface ProfileFormProps {
  userId: string;
  email: string;
  initialFullName: string;
  initialWebsite: string;
}

export default function ProfileForm({ userId, email, initialFullName, initialWebsite }: ProfileFormProps) {
  const [fullName, setFullName] = useState(initialFullName);
  const [website, setWebsite] = useState(initialWebsite);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  
  const supabase = createClient();
  
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: fullName,
          website: website,
        })
        .eq('id', userId);
      
      if (error) throw error;
      
      setMessage({ text: 'Profile updated successfully!', type: 'success' });
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage({ text: 'Failed to update profile. Please try again.', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  }
  
  return (
    <div className="card bg-base-100 shadow-sm">
      <div className="card-body p-6 space-y-8">
        {/* Profile Picture */}
        <div className="flex flex-col items-center sm:flex-row sm:items-start gap-6">
          <div className="avatar">
            <div className="w-24 h-24 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2 bg-base-300 flex items-center justify-center overflow-hidden">
              {/* Placeholder avatar - replace with actual user avatar when connected to backend */}
              <span className="text-3xl">
                {email?.charAt(0).toUpperCase() || '?'}
              </span>
            </div>
          </div>
          
          <div className="flex flex-col gap-2">
            <h3 className="font-medium">Profile Picture</h3>
            <p className="text-sm opacity-70">Upload a new avatar. JPG, GIF or PNG. 1MB max.</p>
            <div className="flex gap-2 mt-2">
              <button className="btn btn-sm">Upload</button>
              <button className="btn btn-sm btn-outline">Remove</button>
            </div>
          </div>
        </div>
        
        <div className="divider"></div>
        
        {/* Form Fields */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Full Name */}
          <div className="form-control w-full">
            <label className="label">
              <span className="label-text font-medium">Full Name</span>
            </label>
            <input 
              type="text" 
              className="input input-bordered w-full" 
              placeholder="Enter your full name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>
          
          {/* Email */}
          <div className="form-control w-full">
            <label className="label">
              <span className="label-text font-medium">Email Address</span>
            </label>
            <input 
              type="email" 
              className="input input-bordered w-full bg-base-200" 
              value={email}
              disabled
            />
            <label className="label">
              <span className="label-text-alt">Email cannot be changed here</span>
            </label>
          </div>
          
          {/* Website */}
          <div className="form-control w-full">
            <label className="label">
              <span className="label-text font-medium">Website</span>
            </label>
            <input 
              type="url" 
              className="input input-bordered w-full" 
              placeholder="https://example.com"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
            />
          </div>
          
          {/* Status message */}
          {message && (
            <div className={`alert ${message.type === 'success' ? 'alert-success' : 'alert-error'}`}>
              <span>{message.text}</span>
            </div>
          )}
          
          <div className="pt-4">
            <button 
              type="submit" 
              className={`btn btn-primary ${isLoading ? 'loading' : ''}`}
              disabled={isLoading}
            >
              {isLoading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 