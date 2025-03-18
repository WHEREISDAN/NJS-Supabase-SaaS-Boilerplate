import { Subscription as DatabaseSubscription } from '@/types/database';

// Frontend representation of subscription with additional fields
export interface Subscription extends Omit<Partial<DatabaseSubscription>, 'current_period_end'> {
  // Override the string type with number for frontend use
  current_period_end: number | null;
  // Additional fields returned by getUserSubscription
  prices?: {
    products?: {
      name: string;
    };
  };
} 