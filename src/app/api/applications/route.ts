import { NextRequest, NextResponse } from 'next/server';
import { getJobById } from '@/lib/jobs/service';
import { validateApplicationInput } from '@/lib/applications/validation';
import {
  findApplication,
  getAllApplications,
  saveApplication
} from '@/lib/applications/repository';
import {
  ApiResponse,
  DuplicateApplicationError,
  DatabaseUnavailableError
} from '@/lib/applications/types';

/**
 * Access Control Helper:
 * Restricts administrative endpoints (e.g., viewing candidate PII) to authorized requests.
 * Fails closed if ADMIN_API_KEY is not configured.
 */
function isAuthorizedAdmin(request: NextRequest): boolean {
  const configuredKey = process.env.ADMIN_API_KEY;
  if (!configuredKey) {
    return false; // Fail closed: secure by default
  }

  // 1. Authorization: Bearer <key>
  const authHeader = request.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7).trim();
    if (token === configuredKey) {
      return true;
    }
  }

  // 2. Custom header: x-admin-key: <key>
  const adminKeyHeader = request.headers.get('x-admin-key');
  if (adminKeyHeader && adminKeyHeader.trim() === configuredKey) {
    return true;
  }

  return false;
}

/**
 * Helper to validate Content-Type header matches application/json.
 * Accepts optional parameters such as charset (e.g., application/json; charset=utf-8).
 */
function isApplicationJson(contentType: string | null): boolean {
  if (!contentType) return false;
  const mimeType = contentType.split(';')[0].trim().toLowerCase();
  return mimeType === 'application/json';
}

export async function POST(request: NextRequest) {
  try {
    // 1. Controlled Test Simulation Checks (Strictly disabled in Production)
    if (process.env.NODE_ENV !== 'production') {
      const simulateDelayHeader = request.headers.get('x-test-simulate-delay');
      if (simulateDelayHeader) {
        const delayMs = parseInt(simulateDelayHeader, 10);
        if (!isNaN(delayMs) && delayMs > 0 && delayMs <= 15000) {
          await new Promise((resolve) => setTimeout(resolve, delayMs));
        }
      }

      const simulateErrorHeader = request.headers.get('x-test-simulate-error');
      if (simulateErrorHeader === '500') {
        const responsePayload: ApiResponse = {
          success: false,
          error: 'Simulated internal server error for QA resilience verification.'
        };
        return NextResponse.json(responsePayload, { status: 500 });
      }

      const forceRejectHeader = request.headers.get('x-test-force-reject');
      if (forceRejectHeader === '400') {
        const responsePayload: ApiResponse = {
          success: false,
          error: 'Simulated client rejection for QA test scenario.'
        };
        return NextResponse.json(responsePayload, { status: 400 });
      }
    }

    // 2. Content-Type Media Type Enforcement (AUD-P2-05)
    // Strictly requires application/json. Rejects absent, text/plain, or unsupported media types with 415.
    const contentType = request.headers.get('content-type');
    if (!isApplicationJson(contentType)) {
      const responsePayload: ApiResponse = {
        success: false,
        error: 'Unsupported Media Type: Content-Type must be application/json'
      };
      return NextResponse.json(responsePayload, { status: 415 });
    }

    // 3. Safe JSON parsing (handles malformed JSON payloads)
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      const responsePayload: ApiResponse = {
        success: false,
        error: 'Malformed JSON payload in request body'
      };
      return NextResponse.json(responsePayload, { status: 400 });
    }

    // 4. Server-side validation
    const validation = validateApplicationInput(body);
    if (!validation.isValid || !validation.sanitized) {
      const responsePayload: ApiResponse = {
        success: false,
        error: 'Validation failed for one or more fields',
        errors: validation.errors
      };
      return NextResponse.json(responsePayload, { status: 400 });
    }

    const { sanitized } = validation;

    // 5. Job verification
    const job = getJobById(sanitized.jobId);
    if (!job) {
      const responsePayload: ApiResponse = {
        success: false,
        error: `Invalid application target: Job ID '${sanitized.jobId}' does not exist`
      };
      return NextResponse.json(responsePayload, { status: 404 });
    }

    // 6. Pre-insertion deduplication check (application-level fast check)
    const existing = await findApplication(sanitized.jobId, sanitized.email);
    if (existing) {
      const responsePayload: ApiResponse = {
        success: false,
        error: `Duplicate application detected: Candidate '${sanitized.email}' has already applied for role '${job.title}'`
      };
      return NextResponse.json(responsePayload, { status: 409 });
    }

    // 7. Persistence with Atomic Uniqueness Enforcement
    let savedRecord;
    try {
      savedRecord = await saveApplication(sanitized);
    } catch (saveError: unknown) {
      if (saveError instanceof DuplicateApplicationError) {
        const responsePayload: ApiResponse = {
          success: false,
          error: `Duplicate application detected: Candidate '${sanitized.email}' has already applied for role '${job.title}'`
        };
        return NextResponse.json(responsePayload, { status: 409 });
      }
      throw saveError;
    }

    const responsePayload: ApiResponse = {
      success: true,
      message: 'Application successfully received and recorded',
      data: {
        applicationId: savedRecord.id,
        jobId: savedRecord.jobId,
        jobTitle: job.title,
        company: job.company,
        candidateName: savedRecord.fullName,
        candidateEmail: savedRecord.email,
        createdAt: savedRecord.createdAt
      }
    };

    return NextResponse.json(responsePayload, { status: 201 });
  } catch (error: unknown) {
    if (error instanceof DuplicateApplicationError) {
      const responsePayload: ApiResponse = {
        success: false,
        error: `Duplicate application detected: Candidate '${error.email}' has already applied for role '${error.jobId}'`
      };
      return NextResponse.json(responsePayload, { status: 409 });
    }

    if (error instanceof DatabaseUnavailableError) {
      const responsePayload: ApiResponse = {
        success: false,
        error: 'Database service is currently unavailable. Please retry later.'
      };
      return NextResponse.json(responsePayload, { status: 503 });
    }

    // Prevent leaking internal error stack traces or database connection details
    console.error('[API /api/applications] Unexpected server exception:', error);
    const responsePayload: ApiResponse = {
      success: false,
      error: 'An unexpected internal server error occurred while processing the application.'
    };
    return NextResponse.json(responsePayload, { status: 500 });
  }
}

/**
 * GET /api/applications
 * Protected administrator endpoint. Exposes candidate records only to authenticated callers.
 */
export async function GET(request: NextRequest) {
  if (!isAuthorizedAdmin(request)) {
    const unauthorizedPayload: ApiResponse = {
      success: false,
      error: 'Unauthorized: Administrator authentication required to view applicant records.'
    };
    return NextResponse.json(unauthorizedPayload, { status: 401 });
  }

  try {
    const applications = await getAllApplications();
    const responsePayload: ApiResponse = {
      success: true,
      data: applications
    };
    return NextResponse.json(responsePayload, { status: 200 });
  } catch (error: unknown) {
    if (error instanceof DatabaseUnavailableError) {
      const responsePayload: ApiResponse = {
        success: false,
        error: 'Database service is currently unavailable. Please retry later.'
      };
      return NextResponse.json(responsePayload, { status: 503 });
    }

    console.error('[API /api/applications] Failed to fetch applications:', error);
    const responsePayload: ApiResponse = {
      success: false,
      error: 'Unable to retrieve applications at this time.'
    };
    return NextResponse.json(responsePayload, { status: 500 });
  }
}
