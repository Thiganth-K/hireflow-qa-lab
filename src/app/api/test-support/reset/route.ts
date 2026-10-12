import { NextResponse } from 'next/server';
import { clearApplications } from '@/lib/applications/repository';
import { ApiResponse } from '@/lib/applications/types';

/**
 * POST /api/test-support/reset
 * Test fixture reset endpoint.
 *
 * Security Requirements:
 * 1. Absolute production lockdown: Permanently disabled in production mode.
 * 2. Unconditional rejection in production: Cannot be bypassed or enabled by any headers or query parameters.
 * 3. Safe test simulation: In non-production only, honors x-simulate-env: production for security verification.
 */
export async function POST(request: Request) {
  // Absolute production lockdown:
  // In production, no query parameter or header can bypass this check.
  if (process.env.NODE_ENV === 'production') {
    const forbiddenPayload: ApiResponse = {
      success: false,
      error: 'Test support endpoints are permanently disabled in production mode.'
    };
    return NextResponse.json(forbiddenPayload, { status: 403 });
  }

  // In non-production only: honor simulation header to verify security behavior
  const isSimulatedProduction = request.headers.get('x-simulate-env') === 'production';
  if (isSimulatedProduction) {
    const forbiddenPayload: ApiResponse = {
      success: false,
      error: 'Test support endpoints are disabled in production mode.'
    };
    return NextResponse.json(forbiddenPayload, { status: 403 });
  }

  try {
    await clearApplications();
    const successPayload: ApiResponse = {
      success: true,
      message: 'All test application records have been safely cleared.'
    };
    return NextResponse.json(successPayload, { status: 200 });
  } catch (error: unknown) {
    console.error('[API /api/test-support/reset] Reset error:', error);
    const errorPayload: ApiResponse = {
      success: false,
      error: 'Failed to reset test persistence store.'
    };
    return NextResponse.json(errorPayload, { status: 500 });
  }
}
