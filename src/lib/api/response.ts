import { NextResponse } from 'next/server';

export type ApiResponse<T> = {
  data?: T;
  error?: {
    message: string;
    code?: string;
    details?: any;
  };
};

export function successResponse<T>(data: T, status = 200) {
  return NextResponse.json<ApiResponse<T>>({ data }, { status });
}

export function errorResponse(
  message: string,
  status = 400,
  code?: string,
  details?: any
) {
  return NextResponse.json<ApiResponse<null>>(
    {
      error: {
        message,
        code,
        details,
      },
    },
    { status }
  );
}

export function notFoundResponse(message = 'Resource not found') {
  return errorResponse(message, 404, 'NOT_FOUND');
}

export function unauthorizedResponse(message = 'Unauthorized') {
  return errorResponse(message, 401, 'UNAUTHORIZED');
}

export function forbiddenResponse(message = 'Forbidden') {
  return errorResponse(message, 403, 'FORBIDDEN');
}

export function serverErrorResponse(message = 'Internal server error') {
  return errorResponse(message, 500, 'INTERNAL_SERVER_ERROR');
} 