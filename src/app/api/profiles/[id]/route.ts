import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { 
  successResponse, 
  errorResponse, 
  notFoundResponse, 
  unauthorizedResponse, 
  forbiddenResponse,
  serverErrorResponse 
} from '@/lib/api/response';
import { validateRequest, profileUpdateSchema } from '@/lib/api/validation';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const supabase = await createClient();
    
    // Check if user is authenticated
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return unauthorizedResponse();
    }
    
    // Fetch the profile
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        return notFoundResponse('Profile not found');
      }
      console.error('Error fetching profile:', error);
      return errorResponse(error.message, 400);
    }
    
    return successResponse(profile);
  } catch (error) {
    console.error('Error in profile GET:', error);
    return serverErrorResponse();
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const supabase = await createClient();
    
    // Check if user is authenticated
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return unauthorizedResponse();
    }
    
    // Check if user is authorized to update this profile
    if (user.id !== id) {
      return forbiddenResponse('You can only update your own profile');
    }
    
    // Validate request body
    const validation = await validateRequest(req, profileUpdateSchema);
    if (!validation.isValid) {
      return validation.error;
    }
    
    const profileData = validation.data;
    
    // Update the profile
    const { data: updatedProfile, error } = await supabase
      .from('profiles')
      .update(profileData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        return notFoundResponse('Profile not found');
      }
      console.error('Error updating profile:', error);
      return errorResponse(error.message, 400);
    }
    
    return successResponse(updatedProfile);
  } catch (error) {
    console.error('Error in profile PUT:', error);
    return serverErrorResponse();
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  // PATCH is handled the same as PUT in this case
  return PUT(req, { params });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const supabase = await createClient();
    
    // Check if user is authenticated
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return unauthorizedResponse();
    }
    
    // Check if user is authorized to delete this profile
    if (user.id !== id) {
      return forbiddenResponse('You can only delete your own profile');
    }
    
    // Delete the profile
    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting profile:', error);
      return errorResponse(error.message, 400);
    }
    
    return successResponse({ message: 'Profile deleted successfully' }, 200);
  } catch (error) {
    console.error('Error in profile DELETE:', error);
    return serverErrorResponse();
  }
} 