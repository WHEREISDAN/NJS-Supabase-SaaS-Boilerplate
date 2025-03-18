export interface Profile {
  id: string;
  updated_at: string;
  created_at: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  website: string | null;
  email: string | null;
  stripe_customer_id?: string | null;
}

export interface ProfileUpdateRequest {
  username?: string;
  full_name?: string;
  avatar_url?: string;
  website?: string;
}

export interface ProfileResponse extends Profile {
  // Add any additional fields that might be needed in responses
}

export interface ProfilesListResponse {
  profiles: ProfileResponse[];
  count: number;
  page: number;
  pageSize: number;
}

export interface ProfilesListParams {
  page?: number;
  pageSize?: number;
  search?: string;
}

export interface Subscription {
  id: string;
  user_id: string;
  status: string;
  price_id: string;
  quantity: number;
  cancel_at_period_end: boolean;
  cancel_at: string | null;
  canceled_at: string | null;
  current_period_start: string;
  current_period_end: string;
  created_at: string;
  ended_at: string | null;
  trial_start: string | null;
  trial_end: string | null;
  stripe_subscription_id: string;
  stripe_customer_id: string;
}

export interface Price {
  id: string;
  product_id: string;
  active: boolean;
  description: string | null;
  unit_amount: number | null;
  currency: string;
  type: string;
  interval: string | null;
  interval_count: number | null;
  trial_period_days: number | null;
  metadata: Record<string, any> | null;
  created_at: string;
}

export interface Product {
  id: string;
  active: boolean;
  name: string;
  description: string | null;
  image: string | null;
  metadata: Record<string, any> | null;
  created_at: string;
}

export interface ProductWithPrices extends Product {
  prices: Price[];
}

export interface Customer {
  id: string;
  stripe_customer_id: string;
} 