export interface Profile {
  id: string;
  updated_at: string;
  created_at: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  website: string | null;
  email: string | null;
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