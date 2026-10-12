import { test, expect } from '@playwright/test';

const configuredAdminApiKey = process.env.ADMIN_API_KEY;

if (!configuredAdminApiKey) {
  throw new Error(
    'ADMIN_API_KEY environment variable is required for API contract tests but was not found. ' +
    'Please ensure .env.local is configured with ADMIN_API_KEY before running the test suite.'
  );
}

const ADMIN_SECRET = configuredAdminApiKey;

test.describe('HireFlow QA Lab - API Response & Contract Scenarios', () => {
  test.beforeEach(async ({ request }) => {
    const response = await request.post('/api/test-support/reset');
    expect(response.status()).toBe(200);
  });

  /**
   * Scenario 38: Syntactically malformed JSON payload returns HTTP 400.
   * Verifies that sending unparseable JSON syntax returns a controlled HTTP 400
   * error message without crashing the server or exposing internal parser exceptions.
   */
  test('Scenario 38: Syntactically malformed JSON returns HTTP 400 Bad Request', async ({ request }) => {
    const malformedJsonBuffer = Buffer.from('{"jobId": "job-qa-lead-001", "unclosedKey": ');

    const response = await request.post('/api/applications', {
      headers: { 'Content-Type': 'application/json' },
      data: malformedJsonBuffer
    });

    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body.success).toBe(false);
    expect(body.error).toBe('Malformed JSON payload in request body');
  });

  /**
   * Scenario 39: Nonexistent target jobId in API payload returns HTTP 404.
   * Verifies that attempting to apply for a job ID not present in the catalog
   * returns HTTP 404 with a clear descriptive message.
   */
  test('Scenario 39: Nonexistent target jobId returns HTTP 404 Not Found', async ({ request }) => {
    const nonexistentJobId = 'job-nonexistent-role-999';

    const response = await request.post('/api/applications', {
      headers: { 'Content-Type': 'application/json' },
      data: {
        jobId: nonexistentJobId,
        fullName: 'Target Check Candidate',
        email: 'target.check@example.com',
        phone: '+1 555-123-4567',
        resumeUrl: 'https://example.com/resume.pdf'
      }
    });

    expect(response.status()).toBe(404);
    const body = await response.json();
    expect(body.success).toBe(false);
    expect(body.error).toContain(`Invalid application target: Job ID '${nonexistentJobId}' does not exist`);
  });

  /**
   * Scenario 40: Authenticated administrator listing follows descending creation order.
   * Verifies that GET /api/applications orders records by createdAt: -1 (newest first).
   */
  test('Scenario 40: Authenticated administrator listing follows descending creation order', async ({ request }) => {
    // 1. Submit Application A
    const resA = await request.post('/api/applications', {
      data: {
        jobId: 'job-qa-lead-001',
        fullName: 'First Applicant',
        email: 'first.applicant@example.com',
        phone: '+1 555-111-2222',
        resumeUrl: 'https://example.com/first.pdf'
      }
    });
    expect(resA.status()).toBe(201);

    // Brief deterministic pause to guarantee distinct ISO creation timestamps
    await new Promise((resolve) => setTimeout(resolve, 50));

    // 2. Submit Application B
    const resB = await request.post('/api/applications', {
      data: {
        jobId: 'job-qa-sdet-002',
        fullName: 'Second Applicant',
        email: 'second.applicant@example.com',
        phone: '+1 555-333-4444',
        resumeUrl: 'https://example.com/second.pdf'
      }
    });
    expect(resB.status()).toBe(201);

    // 3. Query GET /api/applications as Administrator
    const listResponse = await request.get('/api/applications', {
      headers: { Authorization: `Bearer ${ADMIN_SECRET}` }
    });
    expect(listResponse.status()).toBe(200);
    const listBody = await listResponse.json();
    expect(listBody.success).toBe(true);
    expect(Array.isArray(listBody.data)).toBe(true);

    const apps = listBody.data as Array<{ email: string; createdAt: string }>;
    expect(apps.length).toBeGreaterThanOrEqual(2);

    // Verify ordering contract: newest application (Application B) appears before Application A
    const appBIndex = apps.findIndex((a) => a.email === 'second.applicant@example.com');
    const appAIndex = apps.findIndex((a) => a.email === 'first.applicant@example.com');
    expect(appBIndex).toBeLessThan(appAIndex);

    // Verify timestamps are monotonically descending
    const timeB = new Date(apps[appBIndex].createdAt).getTime();
    const timeA = new Date(apps[appAIndex].createdAt).getTime();
    expect(timeB).toBeGreaterThanOrEqual(timeA);
  });

  /**
   * Scenario 41: MongoDB internal metadata is not exposed in public or API response objects.
   * Verifies that neither POST submission nor GET listing exposes database internals (_id, driver handles).
   */
  test('Scenario 41: Database internal metadata is excluded from API responses', async ({ request }) => {
    // 1. Check POST submission response contract
    const postRes = await request.post('/api/applications', {
      data: {
        jobId: 'job-fe-dev-003',
        fullName: 'Security Metadata Check',
        email: 'sec.metadata@example.com',
        phone: '+1 555-777-6666',
        resumeUrl: 'https://example.com/sec.pdf'
      }
    });
    expect(postRes.status()).toBe(201);
    const postBody = await postRes.json();

    // Verify public confirmation payload excludes internal database ID (_id) and internal IP
    expect(postBody.data).toBeDefined();
    expect(postBody.data._id).toBeUndefined();
    expect(postBody.data.ipAddress).toBeUndefined();
    expect(postBody.data.applicationId).toMatch(/^app_\d+_[a-z0-9]+$/);

    // 2. Check GET administrator listing response contract
    const listRes = await request.get('/api/applications', {
      headers: { Authorization: `Bearer ${ADMIN_SECRET}` }
    });
    expect(listRes.status()).toBe(200);
    const listBody = await listRes.json();

    for (const record of listBody.data) {
      // Must not leak MongoDB _id
      expect(record._id).toBeUndefined();
      // Public ID must be the stable application string identifier
      expect(record.id).toMatch(/^app_\d+_[a-z0-9]+$/);
    }
  });
});
