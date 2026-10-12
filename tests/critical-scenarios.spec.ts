import { test, expect } from '@playwright/test';

test.describe('HireFlow QA Lab - Critical Automated Scenarios', () => {
  // Ensure strict test isolation by clearing local applications storage before every test
  test.beforeEach(async ({ request }) => {
    const response = await request.post('/api/test-support/reset');
    expect(response.status()).toBe(200);
  });

  /**
   * Scenario 1: Job listings load and display required information.
   * Verifies that seed job cards render complete required metadata:
   * stable ID, title, company, salary range, experience, job type, location, description, and skills.
   */
  test('Scenario 1: Job listings render the required metadata', async ({ page }) => {
    await page.goto('/');

    // Verify main header and listings container are visible
    await expect(page.getByRole('heading', { level: 1 })).toContainText(
      'Explore Open Engineering & QA Opportunities'
    );

    const jobCards = page.getByTestId('job-card');
    await expect(jobCards).toHaveCount(6);

    // Verify specific metadata on the first deterministic role (Lead QA Automation Engineer)
    const leadRoleCard = page.locator('[data-job-id="job-qa-lead-001"]');
    await expect(leadRoleCard).toBeVisible();

    await expect(leadRoleCard.getByTestId('job-title')).toContainText('Lead QA Automation Engineer');
    await expect(leadRoleCard).toContainText('CloudScale Technologies');
    await expect(leadRoleCard.getByTestId('job-location')).toContainText('Remote (US/Canada)');
    await expect(leadRoleCard.getByTestId('job-type')).toContainText('Full-time');
    await expect(leadRoleCard.getByTestId('job-experience')).toContainText('5+ years');
    await expect(leadRoleCard.getByTestId('job-salary')).toContainText('$140,000 - $170,000 / year');
    await expect(leadRoleCard.getByTestId('job-status-badge')).toContainText(/open/i);
    await expect(leadRoleCard.getByTestId('job-description')).toBeVisible();

    // Verify required skills are rendered as tags
    await expect(leadRoleCard).toContainText('Playwright');
    await expect(leadRoleCard).toContainText('TypeScript');

    // Verify the action link exists
    await expect(leadRoleCard.getByTestId('view-job-link')).toBeVisible();
  });

  /**
   * Scenario 2: Selecting a job opens the matching detail page.
   * Verifies navigation, correct role ID resolution, detailed responsibilities,
   * matching data with the catalog, and back navigation.
   */
  test('Scenario 2: Clicking a job opens the matching details', async ({ page }) => {
    await page.goto('/');

    // Select the Senior SDET role
    const sdetCard = page.locator('[data-job-id="job-qa-sdet-002"]');
    await expect(sdetCard).toBeVisible();
    await sdetCard.getByTestId('view-job-link').click();

    // Verify URL navigation matches the selected role
    await expect(page).toHaveURL(/\/jobs\/job-qa-sdet-002$/);

    // Verify detail page content matches the selected role
    await expect(page.getByTestId('detail-job-title')).toHaveText(
      'Senior SDET (Software Development Engineer in Test)'
    );
    await expect(page.getByTestId('job-details-container')).toContainText('FinPulse Systems');
    await expect(page.getByTestId('detail-job-salary')).toHaveText('$130,000 - $160,000 / year');
    await expect(page.getByTestId('detail-job-status')).toContainText('Open Role');

    // Verify application form is present on the page and pre-associated with this job
    await expect(page.getByTestId('application-form-section')).toBeVisible();
    await expect(page.getByTestId('application-form-section')).toContainText(
      'Senior SDET (Software Development Engineer in Test)'
    );
    await expect(page.getByTestId('application-form-section')).toContainText('FinPulse Systems');

    // Verify back navigation returns to the catalog
    await page.getByTestId('back-nav-link').click();
    await expect(page).toHaveURL(/(\/$|\/jobs\/?$)/);
    await expect(page.getByTestId('job-listings-grid')).toBeVisible();
  });

  /**
   * Scenario 3: Required-field validation rejects an empty application.
   * Verifies that submitting an empty form triggers accessible field-level error messages
   * and prevents network submission.
   */
  test('Scenario 3: Empty required fields are rejected', async ({ page }) => {
    await page.goto('/jobs/job-qa-lead-001');

    await expect(page.getByTestId('application-form')).toBeVisible();

    // Click submit without entering any data
    await page.getByTestId('submit-button').click();

    // Verify accessible error messages for all required fields
    const nameError = page.getByTestId('error-fullName');
    const emailError = page.getByTestId('error-email');
    const phoneError = page.getByTestId('error-phone');
    const resumeError = page.getByTestId('error-resumeUrl');

    await expect(nameError).toBeVisible();
    await expect(nameError).toContainText('Full name is required');

    await expect(emailError).toBeVisible();
    await expect(emailError).toContainText('Email address is required');

    await expect(phoneError).toBeVisible();
    await expect(phoneError).toContainText('Phone number is required');

    await expect(resumeError).toBeVisible();
    await expect(resumeError).toContainText('Resume link or URL is required');

    // Verify accessibility ARIA attributes
    await expect(page.getByTestId('input-fullName')).toHaveAttribute('aria-invalid', 'true');
    await expect(page.getByTestId('input-email')).toHaveAttribute('aria-invalid', 'true');
    await expect(page.getByTestId('input-phone')).toHaveAttribute('aria-invalid', 'true');
    await expect(page.getByTestId('input-resumeUrl')).toHaveAttribute('aria-invalid', 'true');

    // Confirm that success confirmation is NOT displayed
    await expect(page.getByTestId('application-success-banner')).not.toBeVisible();
  });

  /**
   * Scenario 4: Invalid email input is rejected.
   * Verifies that entering a malformed email format triggers the specific email validation error,
   * preserves previously entered values, and rejects submission.
   */
  test('Scenario 4: Invalid email input is rejected', async ({ page }) => {
    await page.goto('/jobs/job-fe-dev-003');

    // Fill valid data for name, phone, resume, but invalid email syntax
    await page.getByTestId('input-fullName').fill('Taylor Swift');
    await page.getByTestId('input-email').fill('taylor-invalid-email-format');
    await page.getByTestId('input-phone').fill('+1 555-987-6543');
    await page.getByTestId('input-resumeUrl').fill('https://example.com/resumes/taylor.pdf');

    // Submit the form
    await page.getByTestId('submit-button').click();

    // Verify email error is displayed
    const emailError = page.getByTestId('error-email');
    await expect(emailError).toBeVisible();
    await expect(emailError).toContainText('Please provide a valid email address');
    await expect(page.getByTestId('input-email')).toHaveAttribute('aria-invalid', 'true');

    // Verify valid fields do not show errors
    await expect(page.getByTestId('error-fullName')).not.toBeVisible();
    await expect(page.getByTestId('error-phone')).not.toBeVisible();
    await expect(page.getByTestId('error-resumeUrl')).not.toBeVisible();

    // Verify entered values are preserved
    await expect(page.getByTestId('input-fullName')).toHaveValue('Taylor Swift');
    await expect(page.getByTestId('input-email')).toHaveValue('taylor-invalid-email-format');
    await expect(page.getByTestId('input-phone')).toHaveValue('+1 555-987-6543');

    // Verify form was not submitted
    await expect(page.getByTestId('application-success-banner')).not.toBeVisible();
  });

  /**
   * Scenario 5: A valid application is submitted and receives the correct confirmation.
   * Verifies complete end-to-end happy path: user fills valid inputs, submits,
   * receives 201 Created confirmation banner containing unique application ID,
   * candidate email, and job title.
   */
  test('Scenario 5: A valid application produces the expected success response', async ({ page }) => {
    await page.goto('/jobs/job-qa-lead-001');

    const testCandidate = {
      fullName: 'Morgan Freeman',
      email: 'morgan.freeman@example.com',
      phone: '+1 555-246-8100',
      resumeUrl: 'https://github.com/morgan/resume.pdf',
      coverLetter: 'I am highly passionate about Playwright E2E automation and quality engineering!'
    };

    // Fill form with deterministic test data
    await page.getByTestId('input-fullName').fill(testCandidate.fullName);
    await page.getByTestId('input-email').fill(testCandidate.email);
    await page.getByTestId('input-phone').fill(testCandidate.phone);
    await page.getByTestId('input-resumeUrl').fill(testCandidate.resumeUrl);
    await page.getByTestId('input-coverLetter').fill(testCandidate.coverLetter);

    // Submit application
    await page.getByTestId('submit-button').click();

    // Verify success confirmation card
    const successBanner = page.getByTestId('application-success-banner');
    await expect(successBanner).toBeVisible({ timeout: 10000 });
    await expect(successBanner).toContainText('Application Submitted Successfully!');
    await expect(successBanner).toContainText('Morgan Freeman');
    await expect(successBanner).toContainText('Lead QA Automation Engineer');

    // Verify Application ID was generated and displayed
    const appIdEl = page.getByTestId('confirmation-app-id');
    await expect(appIdEl).toBeVisible();
    const generatedId = await appIdEl.textContent();
    expect(generatedId).toMatch(/^app_\d+_[a-z0-9]+$/);

    // Verify Candidate Email is confirmed
    await expect(page.getByTestId('confirmation-email')).toHaveText('morgan.freeman@example.com');

    // Verify "Submit Another Application" resets the form
    await page.getByTestId('submit-another-btn').click();
    await expect(page.getByTestId('application-form')).toBeVisible();
    await expect(page.getByTestId('input-fullName')).toHaveValue('');
    await expect(page.getByTestId('input-email')).toHaveValue('');
  });
});
