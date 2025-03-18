"use client";

import { loadStripe, Stripe } from '@stripe/stripe-js';
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

type StripeContextType = {
  stripe: Stripe | null;
  isLoading: boolean;
};

const StripeContext = createContext<StripeContextType | undefined>(undefined);

let stripePromise: Promise<Stripe | null>;

export function StripeProvider({ children }: { children: ReactNode }) {
  const [stripe, setStripe] = useState<Stripe | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!stripePromise) {
      stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
    }

    stripePromise.then(stripe => {
      setStripe(stripe);
      setIsLoading(false);
    });
  }, []);

  const value = {
    stripe,
    isLoading,
  };

  return <StripeContext.Provider value={value}>{children}</StripeContext.Provider>;
}

export function useStripe() {
  const context = useContext(StripeContext);
  if (context === undefined) {
    throw new Error('useStripe must be used within a StripeProvider');
  }
  return context;
}