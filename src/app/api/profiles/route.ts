import { NextRequest } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { 
  successResponse, 
  errorResponse, 
  unauthorizedResponse, 
  serverErrorResponse 
} from '@/lib/api/response';
import { validateRequest, validateQueryParams, profileSchema } from '@/lib/api/validation';
import { ProfilesListParams, ProfilesListResponse, Profile } from '@/types/database';

const listParamsSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  pageSize: z.coerce.number().min(1).max(100).default(10),
  search: z.string().optional(),
});

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Check if user is authenticated
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return unauthorizedResponse();
    }
    
    // Validate and parse query parameters
    const validation = validateQueryParams<ProfilesListParams>(
      req.nextUrl.searchParams,
      listParamsSchema
    );
    
    if (!validation.isValid) {
      return validation.error;
    }
    
    const { page = 1, pageSize = 10, search } = validation.data;
    
    // Build the query
    let query = supabase
      .from('profiles')
      .select('*', { count: 'exact' });
    
    // Add search if provided
    if (search) {
      query = query.or(`username.ilike.%${search}%,full_name.ilike.%${search}%`);
    }
    
    // Add pagination
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    
    const { data: profiles, count, error } = await query
      .range(from, to)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching profiles:', error);
      return errorResponse(error.message, 400);
    }
    
    const response: ProfilesListResponse = {
      profiles: profiles || [],
      count: count || 0,
      page,
      pageSize,
    };
    
    return successResponse(response);
  } catch (error) {
    console.error('Error in profiles GET:', error);
    return serverErrorResponse();
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Check if user is authenticated
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return unauthorizedResponse();
    }
    
    // Validate request body
    const validation = await validateRequest(req, profileSchema);
    if (!validation.isValid) {
      return validation.error;
    }
    
    const profileData = validation.data;
    
    // Check if profile already exists
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .single();
    
    if (existingProfile) {
      // Update existing profile instead of creating a new one
      const { data: updatedProfile, error } = await supabase
        .from('profiles')
        .update(profileData)
        .eq('id', user.id)
        .select()
        .single();
      
      if (error) {
        console.error('Error updating profile:', error);
        return errorResponse(error.message, 400);
      }
      
      return successResponse(updatedProfile);
    }
    
    // Create new profile
    const { data: newProfile, error } = await supabase
      .from('profiles')
      .insert({
        id: user.id,
        ...profileData,
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error creating profile:', error);
      return errorResponse(error.message, 400);
    }
    
    return successResponse(newProfile, 201);
  } catch (error) {
    console.error('Error in profiles POST:', error);
    return serverErrorResponse();
  }
} 