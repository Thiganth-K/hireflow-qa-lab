import { test, expect } from '@playwright/test';

test.describe('HireFlow QA Lab - Extended QA & Edge Scenarios', () => {
  // Reset applications before each test for absolute isolation
  test.beforeEach(async ({ request }) => {
    const response = await request.post('/api/test-support/reset');
    expect(response.status()).toBe(200);
  });

  /**
   * Scenario 6: Whitespace-only input rejection.
   * Verifies that fields filled with only whitespace characters ('   ')
   * are rejected with clear error messages.
   */
  test('Scenario 6: Whitespace-only input in required fields is rejected', async ({ page }) => {
    await page.goto('/jobs/job-qa-eng-004');

    await page.getByTestId('input-fullName').fill('   ');
    await page.getByTestId('input-email').fill('   ');
    await page.getByTestId('input-phone').fill('   ');
    await page.getByTestId('input-resumeUrl').fill('   ');

    await page.getByTestId('submit-button').click();

    // Verify whitespace-specific rejection feedback
    await expect(page.getByTestId('error-fullName')).toContainText(
      'Full name is required and cannot be empty or whitespace only'
    );
    await expect(page.getByTestId('error-email')).toContainText(
      'Email address is required and cannot be whitespace only'
    );
    await expect(page.getByTestId('error-phone')).toContainText(
      'Phone number is required and cannot be whitespace only'
    );
    await expect(page.getByTestId('error-resumeUrl')).toContainText(
      'Resume link or URL is required and cannot be whitespace only'
    );

    await expect(page.getByTestId('application-success-banner')).not.toBeVisible();
  });

  /**
   * Scenario 7: Boundary value limits enforcement.
   * Tests minimum character length (e.g. 1 character name) and resume URL protocol requirements.
   */
  test('Scenario 7: Boundary value limits are strictly validated', async ({ page }) => {
    await page.goto('/jobs/job-qa-eng-004');

    // Single character name (boundary limit is min: 2 chars)
    await page.getByTestId('input-fullName').fill('A');
    await page.getByTestId('input-email').fill('candidate@example.com');
    await page.getByTestId('input-phone').fill('12345'); // < 7 digits (boundary limit min: 7 digits)
    await page.getByTestId('input-resumeUrl').fill('ftp://invalid-protocol.com/resume.pdf');

    await page.getByTestId('submit-button').click();

    await expect(page.getByTestId('error-fullName')).toContainText('Full name must be at least 2 characters');
    await expect(page.getByTestId('error-phone')).toContainText('Phone number must contain at least 7 digits');
    await expect(page.getByTestId('error-resumeUrl')).toContainText('Resume URL must begin with http:// or https://');

    await expect(page.getByTestId('application-success-banner')).not.toBeVisible();
  });

  /**
   * Scenario 8: Duplicate application prevention.
   * Submits a valid application, then attempts to submit another application
   * with the same candidate email for the exact same job.
   * Verifies that the server returns HTTP 409 Conflict and the UI renders a duplicate error banner.
   */
  test('Scenario 8: Duplicate applications for the same candidate and job are prevented', async ({ page }) => {
    const roleUrl = '/jobs/job-devops-005';
    await page.goto(roleUrl);

    const candidateData = {
      fullName: 'Jordan Lee',
      email: 'jordan.lee@testcompany.org',
      phone: '+1 555-333-4444',
      resumeUrl: 'https://example.com/jordan-resume.pdf'
    };

    // First submission: should succeed
    await page.getByTestId('input-fullName').fill(candidateData.fullName);
    await page.getByTestId('input-email').fill(candidateData.email);
    await page.getByTestId('input-phone').fill(candidateData.phone);
    await page.getByTestId('input-resumeUrl').fill(candidateData.resumeUrl);
    await page.getByTestId('submit-button').click();

    await expect(page.getByTestId('application-success-banner')).toBeVisible({ timeout: 10000 });

    // Click "Submit Another Application" to return to form
    await page.getByTestId('submit-another-btn').click();
    await expect(page.getByTestId('application-form')).toBeVisible();

    // Second submission with identical email for same job: should be rejected as duplicate
    await page.getByTestId('input-fullName').fill('Jordan Lee Duplicate');
    await page.getByTestId('input-email').fill(candidateData.email.toUpperCase()); // Test case-insensitivity
    await page.getByTestId('input-phone').fill(candidateData.phone);
    await page.getByTestId('input-resumeUrl').fill(candidateData.resumeUrl);
    await page.getByTestId('submit-button').click();

    // Verify duplicate error alert banner
    const serverErrorBanner = page.getByTestId('form-server-error-banner');
    await expect(serverErrorBanner).toBeVisible({ timeout: 10000 });
    await expect(serverErrorBanner).toContainText('Duplicate application detected');
    await expect(serverErrorBanner).toContainText('jordan.lee@testcompany.org');

    // Confirm that success confirmation is NOT displayed for the duplicate attempt
    await expect(page.getByTestId('application-success-banner')).not.toBeVisible();
  });

  /**
   * Scenario 9: Accidental double-click and repeated-submission protection.
   * Verifies that when submission is in progress, the submit button is disabled
   * and displays a loading spinner, preventing rapid multiple submissions.
   */
  test('Scenario 9: Submit button is disabled and guarded during submission', async ({ page }) => {
    await page.goto('/jobs/job-qa-lead-001');

    await page.getByTestId('input-fullName').fill('Sam Fisher');
    await page.getByTestId('input-email').fill('sam.fisher@example.com');
    await page.getByTestId('input-phone').fill('+1 555-777-8888');
    await page.getByTestId('input-resumeUrl').fill('https://example.com/resumes/sam.pdf');

    // Open QA panel to add artificial delay of 1500ms
    await page.getByTestId('toggle-qa-controls').click();
    await page.getByTestId('qa-simulate-delay-select').selectOption('1500');

    // Click submit
    const submitBtn = page.getByTestId('submit-button');
    await submitBtn.click();

    // Verify button is disabled during submission
    await expect(submitBtn).toBeDisabled();
    await expect(submitBtn).toContainText('Submitting Application...');

    // Wait for submission to complete successfully
    await expect(page.getByTestId('application-success-banner')).toBeVisible({ timeout: 10000 });
  });

  /**
   * Scenario 10: Graceful handling of invalid or non-existent job ID.
   * Navigating to an invalid job ID must not crash or display another job's details.
   * Verifies accessible "Job Posting Not Found" card and working back navigation.
   */
  test('Scenario 10: Invalid job ID renders accessible error state gracefully', async ({ page }) => {
    const response = await page.goto('/jobs/non-existent-role-9999');

    // Assert authentic HTTP 404 status code
    expect(response?.status()).toBe(404);

    // Verify 404 container
    const notFoundContainer = page.getByTestId('job-not-found-container');
    await expect(notFoundContainer).toBeVisible();
    await expect(page.getByTestId('job-not-found-heading')).toHaveText('Job Posting Not Found');
    await expect(notFoundContainer).toContainText('non-existent-role-9999');

    // Verify back navigation link returns to catalog
    await page.getByTestId('back-to-jobs-link').click();
    await expect(page).toHaveURL(/(\/$|\/jobs\/?$)/);
    await expect(page.getByTestId('job-listings-grid')).toBeVisible();
  });

  /**
   * Scenario 11: Controlled server failure resilience.
   * Verifies that when a 500 error occurs on the server, the UI displays a clear
   * user-friendly error message, does NOT leak stack traces, and does NOT falsely report success.
   */
  test('Scenario 11: Controlled server error (500) displays friendly error banner', async ({ page }) => {
    await page.goto('/jobs/job-qa-lead-001');

    await page.getByTestId('input-fullName').fill('Casey Jones');
    await page.getByTestId('input-email').fill('casey.jones@example.com');
    await page.getByTestId('input-phone').fill('+1 555-444-9999');
    await page.getByTestId('input-resumeUrl').fill('https://example.com/casey.pdf');

    // Enable simulated 500 server error via QA controls
    await page.getByTestId('toggle-qa-controls').click();
    await page.getByTestId('qa-simulate-error-select').selectOption('500');

    await page.getByTestId('submit-button').click();

    // Verify server error alert is displayed
    const serverErrorBanner = page.getByTestId('form-server-error-banner');
    await expect(serverErrorBanner).toBeVisible({ timeout: 10000 });
    await expect(serverErrorBanner).toContainText('Simulated internal server error for QA resilience verification.');

    // Crucial QA check: verify UI does NOT claim success
    await expect(page.getByTestId('application-success-banner')).not.toBeVisible();

    // Verify entered inputs are preserved so user does not lose data
    await expect(page.getByTestId('input-fullName')).toHaveValue('Casey Jones');
    await expect(page.getByTestId('input-email')).toHaveValue('casey.jones@example.com');
  });

  /**
   * Scenario 12: Production safety audit for test endpoints.
   * Directly audits the API route handler logic to verify that test endpoints
   * return 403 Forbidden in production mode.
   */
  test('Scenario 12: Test support reset route is guarded against production use', async ({ request }) => {
    // Send simulated production header to verify 403 Forbidden is returned
    const response = await request.post('/api/test-support/reset', {
      headers: {
        'x-simulate-env': 'production'
      }
    });
    expect(response.status()).toBe(403);
    const json = await response.json();
    expect(json.success).toBe(false);
    expect(json.error).toContain('disabled in production mode');
  });
});
