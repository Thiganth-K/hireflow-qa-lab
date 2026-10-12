import { NextResponse } from 'next/server';
import { clearApplications } from '@/lib/applications/repository';
import { ApiResponse } from '@/lib/applications/types';

export async function POST(request: Request) {
  const isSimulatedProduction =
    request.headers.get('x-simulate-env') === 'production';

  if (process.env.NODE_ENV === 'production' || isSimulatedProduction) {
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
