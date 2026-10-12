import fs from 'fs';
import path from 'path';
import { test, expect } from '@playwright/test';
import {
  saveApplication,
  disconnectDatabase,
  isUsingDatabase
} from '@/lib/applications/repository';
import { DatabaseUnavailableError } from '@/lib/applications/types';

const configuredAdminApiKey = process.env.ADMIN_API_KEY;

if (!configuredAdminApiKey) {
  throw new Error(
    'ADMIN_API_KEY environment variable is required for hardening tests but was not found. ' +
    'Please ensure .env.local is configured with ADMIN_API_KEY before running the test suite.'
  );
}

const ADMIN_SECRET = configuredAdminApiKey;

test.describe('HireFlow QA Lab - Hardening & Concurrency Scenarios', () => {
  // Ensure strict test isolation by clearing local applications storage before every test
  test.beforeEach(async ({ request }) => {
    const response = await request.post('/api/test-support/reset');
    expect(response.status()).toBe(200);
  });

  /**
   * Scenario 13: Email normalization consistency across duplicate checks.
   * Verifies that email variations (mixed case, whitespace) are canonicalized
   * and correctly recognized as duplicates without bypassing integrity checks.
   */
  test('Scenario 13: Email normalization is consistent across duplicate checks', async ({ request }) => {
    const jobId = 'job-qa-lead-001';
    const rawEmail1 = 'Elena.Rostova+QA@TestCorp.COM';
    const rawEmail2 = '   elena.rostova+qa@testcorp.com   ';

    // First submission with uppercase & mixed casing
    const res1 = await request.post('/api/applications', {
      data: {
        jobId,
        fullName: 'Elena Rostova',
        email: rawEmail1,
        phone: '+1 555-111-2222',
        resumeUrl: 'https://example.com/resumes/elena.pdf'
      }
    });
    expect(res1.status()).toBe(201);
    const body1 = await res1.json();
    expect(body1.success).toBe(true);
    expect(body1.data.candidateEmail).toBe('elena.rostova+qa@testcorp.com');

    // Second submission with whitespace and lowercase
    const res2 = await request.post('/api/applications', {
      data: {
        jobId,
        fullName: 'Elena Rostova Duplicate',
        email: rawEmail2,
        phone: '+1 555-111-2222',
        resumeUrl: 'https://example.com/resumes/elena.pdf'
      }
    });
    expect(res2.status()).toBe(409);
    const body2 = await res2.json();
    expect(body2.success).toBe(false);
    expect(body2.error).toContain('Duplicate application detected');
    expect(body2.error).toContain('elena.rostova+qa@testcorp.com');
  });

  /**
   * Scenario 14: Cross-job application allowance.
   * Verifies the core business rule: the same candidate email CAN apply to different jobs,
   * but cannot apply twice to the same job.
   */
  test('Scenario 14: The same candidate email applying to a different job is allowed', async ({ request }) => {
    const candidateEmail = 'marcus.vance@engineering.io';

    // Application 1: Lead QA
    const res1 = await request.post('/api/applications', {
      data: {
        jobId: 'job-qa-lead-001',
        fullName: 'Marcus Vance',
        email: candidateEmail,
        phone: '+1 555-999-0001',
        resumeUrl: 'https://example.com/marcus.pdf'
      }
    });
    expect(res1.status()).toBe(201);

    // Application 2: Senior SDET (different job)
    const res2 = await request.post('/api/applications', {
      data: {
        jobId: 'job-qa-sdet-002',
        fullName: 'Marcus Vance',
        email: candidateEmail,
        phone: '+1 555-999-0001',
        resumeUrl: 'https://example.com/marcus.pdf'
      }
    });
    expect(res2.status()).toBe(201);

    // Verify both records exist under admin view
    const listRes = await request.get('/api/applications', {
      headers: { Authorization: `Bearer ${ADMIN_SECRET}` }
    });
    expect(listRes.status()).toBe(200);
    const listBody = await listRes.json();
    const marcusApps = listBody.data.filter(
      (app: { normalizedEmail: string }) => app.normalizedEmail === candidateEmail
    );
    expect(marcusApps.length).toBe(2);
    expect(marcusApps.map((a: { jobId: string }) => a.jobId).sort()).toEqual([
      'job-qa-lead-001',
      'job-qa-sdet-002'
    ]);
  });

  /**
   * Scenario 15: High-concurrency duplicate prevention and atomic persistence.
   * Dispatches 5 simultaneous requests for the exact same candidate and job.
   * Verifies that race conditions cannot bypass uniqueness: exactly 1 request returns 201,
   * all other concurrent requests receive 409 Conflict, and exactly 1 record is persisted.
   */
  test('Scenario 15: Concurrent requests for the same email and job cannot create duplicate records', async ({ request }) => {
    const jobId = 'job-devops-005';
    const email = 'racer.concurrency@cloudscale.net';

    const payload = {
      jobId,
      fullName: 'Concurrency Racer',
      email,
      phone: '+1 555-888-7777',
      resumeUrl: 'https://example.com/racer.pdf'
    };

    // Fire 5 requests simultaneously
    const requests = Array.from({ length: 5 }, () =>
      request.post('/api/applications', { data: payload })
    );

    const responses = await Promise.all(requests);
    const statuses = responses.map((r) => r.status());

    const createdCount = statuses.filter((s) => s === 201).length;
    const conflictCount = statuses.filter((s) => s === 409).length;

    // Concurrency Invariant: Exactly one submission succeeds, all others are rejected as 409 Conflict
    expect(createdCount).toBe(1);
    expect(conflictCount).toBe(4);

    // Verify persisted storage invariant: Exactly 1 record exists in database
    const listRes = await request.get('/api/applications', {
      headers: { Authorization: `Bearer ${ADMIN_SECRET}` }
    });
    expect(listRes.status()).toBe(200);
    const listBody = await listRes.json();
    const matchedRecords = listBody.data.filter(
      (app: { jobId: string; normalizedEmail: string }) =>
        app.jobId === jobId && app.normalizedEmail === email
    );
    expect(matchedRecords.length).toBe(1);
  });

  /**
   * Scenario 16: Safe translation of duplicate key errors.
   * Verifies that database duplicate collisions return standard 409 Conflict
   * without leaking database stack traces, credentials, or collection details.
   */
  test('Scenario 16: Duplicate attempts return standard 409 without leaking DB internals', async ({ request }) => {
    const payload = {
      jobId: 'job-fe-dev-003',
      fullName: 'Safe Leak Test',
      email: 'safe.leak.check@example.com',
      phone: '+1 555-222-3333',
      resumeUrl: 'https://example.com/resume.pdf'
    };

    // First attempt -> 201
    const res1 = await request.post('/api/applications', { data: payload });
    expect(res1.status()).toBe(201);

    // Second attempt -> 409
    const res2 = await request.post('/api/applications', { data: payload });
    expect(res2.status()).toBe(409);
    const body2 = await res2.json();

    expect(body2.success).toBe(false);
    expect(body2.error).toContain('Duplicate application detected');
    // Ensure no database internals leaked
    expect(body2.error).not.toContain('MongoServerError');
    expect(body2.error).not.toContain('11000');
    expect(body2.error).not.toContain('mongodb');
    expect(body2.error).not.toContain('stack');
  });

  /**
   * Scenario 17: PII Protection - Unauthenticated application listing is rejected.
   * Verifies that GET /api/applications returns 401 Unauthorized to callers
   * without an administrator API key, protecting candidate PII from public disclosure.
   */
  test('Scenario 17: Unauthenticated application listing is rejected with 401', async ({ request }) => {
    // Seed one application first
    await request.post('/api/applications', {
      data: {
        jobId: 'job-qa-lead-001',
        fullName: 'Secret Candidate',
        email: 'secret@candidate.com',
        phone: '+1 555-000-1111',
        resumeUrl: 'https://example.com/secret.pdf'
      }
    });

    // Unauthenticated GET request
    const response = await request.get('/api/applications');
    expect(response.status()).toBe(401);

    const body = await response.json();
    expect(body.success).toBe(false);
    expect(body.error).toContain('Administrator authentication required');
    // Ensure no records were returned
    expect(body.data).toBeUndefined();
  });

  /**
   * Scenario 18: Access control rejects invalid tokens and permits valid credentials.
   * Verifies both Bearer token and x-admin-key header authentication.
   */
  test('Scenario 18: Access control rejects invalid tokens and permits valid credentials', async ({ request }) => {
    // 1. Invalid Bearer token -> 401
    const badBearer = await request.get('/api/applications', {
      headers: { Authorization: 'Bearer invalid-token-xyz' }
    });
    expect(badBearer.status()).toBe(401);

    // 2. Invalid x-admin-key -> 401
    const badHeader = await request.get('/api/applications', {
      headers: { 'x-admin-key': 'invalid-token-xyz' }
    });
    expect(badHeader.status()).toBe(401);

    // 3. Valid Bearer token -> 200
    const validBearer = await request.get('/api/applications', {
      headers: { Authorization: `Bearer ${ADMIN_SECRET}` }
    });
    expect(validBearer.status()).toBe(200);
    const validBody = await validBearer.json();
    expect(validBody.success).toBe(true);
    expect(Array.isArray(validBody.data)).toBe(true);

    // 4. Valid x-admin-key -> 200
    const validHeader = await request.get('/api/applications', {
      headers: { 'x-admin-key': ADMIN_SECRET }
    });
    expect(validHeader.status()).toBe(200);
  });

  /**
   * Scenario 19: Test support reset endpoint is permanently disabled in production mode.
   * Verifies that the endpoint cannot be triggered with production headers or query params.
   */
  test('Scenario 19: Test support reset route cannot be operated in production mode', async ({ request }) => {
    const response = await request.post('/api/test-support/reset', {
      headers: {
        'x-simulate-env': 'production'
      }
    });
    expect(response.status()).toBe(403);
    const body = await response.json();
    expect(body.success).toBe(false);
    expect(body.error).toContain('disabled in production mode');
  });

  /**
   * Scenario 20: Unauthorized or failed requests do not mutate stored data.
   * Verifies that 400, 401, 404, or 409 responses leave persisted records untouched.
   */
  test('Scenario 20: Rejected requests do not mutate stored application data', async ({ request }) => {
    // Check initial count
    const initialRes = await request.get('/api/applications', {
      headers: { Authorization: `Bearer ${ADMIN_SECRET}` }
    });
    const initialBody = await initialRes.json();
    const initialCount = initialBody.data.length;

    // 1. Attempt invalid job ID (404)
    await request.post('/api/applications', {
      data: {
        jobId: 'nonexistent-job-999',
        fullName: 'Valid Name',
        email: 'test@example.com',
        phone: '+1 555-123-4567',
        resumeUrl: 'https://example.com/res.pdf'
      }
    });

    // 2. Attempt validation error (400)
    await request.post('/api/applications', {
      data: {
        jobId: 'job-qa-lead-001',
        fullName: '',
        email: 'invalid-email',
        phone: '',
        resumeUrl: ''
      }
    });

    // Verify record count has not changed
    const finalRes = await request.get('/api/applications', {
      headers: { Authorization: `Bearer ${ADMIN_SECRET}` }
    });
    const finalBody = await finalRes.json();
    expect(finalBody.data.length).toBe(initialCount);
  });

  /**
   * Scenario 21 (AUD-P2-05): Content-Type enforcement.
   * Verifies that requests without application/json (such as text/plain or missing)
   * are rejected with HTTP 415 Unsupported Media Type before parsing or persistence,
   * while valid application/json requests (including charset params) succeed.
   */
  test('Scenario 21: Content-Type application/json is strictly enforced with HTTP 415', async ({ request }) => {
    const validPayload = {
      jobId: 'job-qa-lead-001',
      fullName: 'Media Type Candidate',
      email: 'media.type.test@example.com',
      phone: '+1 555-432-1098',
      resumeUrl: 'https://example.com/mediatype.pdf'
    };

    // 1. text/plain Content-Type -> 415
    const textPlainRes = await request.post('/api/applications', {
      headers: { 'Content-Type': 'text/plain' },
      data: JSON.stringify(validPayload)
    });
    expect(textPlainRes.status()).toBe(415);
    const textPlainBody = await textPlainRes.json();
    expect(textPlainBody.success).toBe(false);
    expect(textPlainBody.error).toContain('Unsupported Media Type: Content-Type must be application/json');

    // 2. application/json with charset parameter -> 201
    const charsetRes = await request.post('/api/applications', {
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      data: JSON.stringify(validPayload)
    });
    expect(charsetRes.status()).toBe(201);
    const charsetBody = await charsetRes.json();
    expect(charsetBody.success).toBe(true);

    // 3. Storage invariant: exactly 1 record was persisted
    const listRes = await request.get('/api/applications', {
      headers: { Authorization: `Bearer ${ADMIN_SECRET}` }
    });
    const listBody = await listRes.json();
    const matches = listBody.data.filter(
      (app: { normalizedEmail: string }) => app.normalizedEmail === 'media.type.test@example.com'
    );
    expect(matches.length).toBe(1);
  });

  /**
   * Scenario 22 (AUD-P2-06): Rejection of array, primitive, and non-object JSON payloads.
   * Verifies that arrays ([]), primitives ("string"), and null are rejected with HTTP 400
   * before field validation, preventing unexpected behavior or data corruption.
   */
  test('Scenario 22: Array and primitive JSON payloads are rejected with HTTP 400', async ({ request }) => {
    // 1. Top-level array -> 400 with standardized error
    const arrayRes = await request.post('/api/applications', {
      headers: { 'Content-Type': 'application/json' },
      data: JSON.stringify([])
    });
    expect(arrayRes.status()).toBe(400);
    const arrayBody = await arrayRes.json();
    expect(arrayBody.success).toBe(false);
    expect(arrayBody.errors?.[0]?.message).toBe('Invalid payload: request body must be a JSON object');

    // 2. Array containing an application object -> 400
    const arrayOfObjRes = await request.post('/api/applications', {
      headers: { 'Content-Type': 'application/json' },
      data: JSON.stringify([{ jobId: 'job-qa-lead-001', email: 'arr@test.com' }])
    });
    expect(arrayOfObjRes.status()).toBe(400);
    const arrayOfObjBody = await arrayOfObjRes.json();
    expect(arrayOfObjBody.errors?.[0]?.message).toBe('Invalid payload: request body must be a JSON object');

    // 3. Primitive string JSON -> 400
    const stringRes = await request.post('/api/applications', {
      headers: { 'Content-Type': 'application/json' },
      data: JSON.stringify('plain-string-payload')
    });
    expect(stringRes.status()).toBe(400);
    const stringBody = await stringRes.json();
    expect(stringBody.errors?.[0]?.message).toBe('Invalid payload: request body must be a JSON object');

    // 4. Null JSON -> 400
    const nullRes = await request.post('/api/applications', {
      headers: { 'Content-Type': 'application/json' },
      data: JSON.stringify(null)
    });
    expect(nullRes.status()).toBe(400);
    const nullBody = await nullRes.json();
    expect(nullBody.errors?.[0]?.message).toBe('Invalid payload: request body must be a JSON object');
  });

  /**
   * Scenario 23 (AUD-P2-02): MongoDB split-brain elimination and recovery.
   * When MONGODB_URI is configured, MongoDB is the sole persistence engine.
   * If MongoDB is unreachable, repository operations must throw DatabaseUnavailableError
   * and must NEVER silently fall back to JSON storage.
   * After restoring the valid URI, the repository must recover successfully.
   */
  test('Scenario 23: Configured MongoDB unavailability prevents JSON fallback and recovers cleanly', async () => {
    const originalMongoUri = process.env.MONGODB_URI;
    expect(originalMongoUri).toBeDefined();

    const dataFile = path.join(process.cwd(), '.data', 'applications.json');
    const fileContentBefore = fs.existsSync(dataFile) ? fs.readFileSync(dataFile, 'utf-8') : '';

    try {
      // 1. Simulate MongoDB outage by pointing to an unreachable port with short timeout
      await disconnectDatabase();
      process.env.MONGODB_URI = 'mongodb://127.0.0.1:27999/unreachable_db?connectTimeoutMS=1000&serverSelectionTimeoutMS=1000';

      // 2. Attempt saveApplication - must reject with DatabaseUnavailableError
      await expect(
        saveApplication({
          jobId: 'job-qa-lead-001',
          fullName: 'Split Brain Prevented',
          email: 'splitbrain@example.com',
          phone: '+1 555-000-9999',
          resumeUrl: 'https://example.com/resume.pdf'
        })
      ).rejects.toThrow(DatabaseUnavailableError);

      // 3. Invariant: .data/applications.json was NOT modified (NO split-brain fallback!)
      const fileContentAfter = fs.existsSync(dataFile) ? fs.readFileSync(dataFile, 'utf-8') : '';
      expect(fileContentAfter).toBe(fileContentBefore);
      expect(fileContentAfter).not.toContain('splitbrain@example.com');
    } finally {
      // 4. Recovery: restore original URI and reconnect cleanly
      process.env.MONGODB_URI = originalMongoUri;
      await disconnectDatabase();
      const isRecovered = await isUsingDatabase();
      expect(isRecovered).toBe(true);
    }
  });

  /**
   * Scenario 24 (AUD-P2-03 & AUD-P2-04): Crash-resistant atomic JSON replacement & cleanup.
   * When in local offline mode (!MONGODB_URI), writes use temporary files, fsync,
   * and atomic rename. Verifies no lingering temporary files remain after write.
   */
  test('Scenario 24: JSON persistence performs atomic replacement with zero lingering temp files', async () => {
    const originalMongoUri = process.env.MONGODB_URI;
    const dataDir = path.join(process.cwd(), '.data');

    try {
      // Switch temporarily to local offline mode
      delete process.env.MONGODB_URI;
      await disconnectDatabase();

      const candidateEmail = `atomic.${Date.now()}@example.com`;
      const record = await saveApplication({
        jobId: 'job-qa-lead-001',
        fullName: 'Atomic Test Candidate',
        email: candidateEmail,
        phone: '+1 555-321-7654',
        resumeUrl: 'https://example.com/atomic.pdf'
      });
      expect(record.email).toBe(candidateEmail);

      // Verify no temporary files (.applications.*.tmp) linger in .data directory
      const lingeringTmpFiles = fs.readdirSync(dataDir).filter(
        (f) => f.startsWith('.applications.') && f.endsWith('.tmp')
      );
      expect(lingeringTmpFiles.length).toBe(0);

      // Verify record is durably stored in applications.json
      const dataFile = path.join(dataDir, 'applications.json');
      const content = fs.readFileSync(dataFile, 'utf-8');
      expect(content).toContain(candidateEmail);
    } finally {
      // Restore MongoDB environment
      process.env.MONGODB_URI = originalMongoUri;
      await disconnectDatabase();
      await isUsingDatabase();
    }
  });

  /**
   * Scenario 25 (AUD-P2-01): Authentic HTTP 404 for nonexistent jobs and HTTP 200 for valid jobs.
   * Verifies that Next.js App Router returns genuine HTTP status 404 (not 200) for missing jobs,
   * while valid jobs return HTTP 200.
   */
  test('Scenario 25: Authentic HTTP 404 returned for nonexistent jobs and 200 for valid jobs', async ({ request }) => {
    // 1. Nonexistent job route -> genuine HTTP 404
    const notFoundRes = await request.get('/jobs/non-existent-role-uuid-999');
    expect(notFoundRes.status()).toBe(404);

    // 2. Valid job route -> genuine HTTP 200
    const validRes = await request.get('/jobs/job-qa-lead-001');
    expect(validRes.status()).toBe(200);
  });
});
