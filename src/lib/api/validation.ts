import { NextRequest } from 'next/server';
import { z } from 'zod';
import { errorResponse } from './response';

export const profileSchema = z.object({
  username: z.string().min(3).max(50).optional(),
  full_name: z.string().max(100).optional(),
  avatar_url: z.string().url().optional().nullable(),
  website: z.string().url().optional().nullable(),
});

export const profileUpdateSchema = profileSchema.partial();

export async function validateRequest<T>(
  req: NextRequest,
  schema: z.ZodType<T>
): Promise<{ data: T; isValid: true } | { error: ReturnType<typeof errorResponse>; isValid: false }> {
  try {
    const body = await req.json();
    const data = schema.parse(body);
    return { data, isValid: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        error: errorResponse('Validation error', 400, 'VALIDATION_ERROR', error.format()),
        isValid: false,
      };
    }
    return {
      error: errorResponse('Invalid request body', 400, 'INVALID_REQUEST'),
      isValid: false,
    };
  }
}

export function validateQueryParams<T>(
  searchParams: URLSearchParams,
  schema: z.ZodType<T>
): { data: T; isValid: true } | { error: ReturnType<typeof errorResponse>; isValid: false } {
  try {
    const params: Record<string, string> = {};
    searchParams.forEach((value, key) => {
      params[key] = value;
    });
    
    const data = schema.parse(params);
    return { data, isValid: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        error: errorResponse('Validation error', 400, 'VALIDATION_ERROR', error.format()),
        isValid: false,
      };
    }
    return {
      error: errorResponse('Invalid query parameters', 400, 'INVALID_PARAMS'),
      isValid: false,
    };
  }
} 