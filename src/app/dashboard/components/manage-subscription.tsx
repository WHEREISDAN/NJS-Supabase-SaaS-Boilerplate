"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function ManageSubscription() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handlePortalSession = async () => {
    setIsLoading(true);

    try {
      const response = await fetch('/api/stripe/portal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          return_url: window.location.origin + '/dashboard',
        }),
      });

      const { url } = await response.json();
      router.push(url);
    } catch (error) {
      console.error('Error creating portal session:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      className="btn btn-outline"
      onClick={handlePortalSession}
      disabled={isLoading}
    >
      {isLoading ? 'Loading...' : 'Manage Subscription'}
    </button>
  );
}