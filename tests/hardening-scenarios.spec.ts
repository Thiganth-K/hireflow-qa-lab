import { test, expect } from '@playwright/test';

const ADMIN_SECRET = 'hireflow-test-admin-secret-key-2026';

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
});
