import { test, expect } from '@playwright/test';
import { validateApplicationInput, BOUNDARIES } from '@/lib/applications/validation';

test.describe('HireFlow QA Lab - Form Boundaries & Accessibility Scenarios', () => {
  test.beforeEach(async ({ request }) => {
    const response = await request.post('/api/test-support/reset');
    expect(response.status()).toBe(200);
  });

  /**
   * Scenario 33: Boundary-value testing on maximum lengths and validation contract.
   * Tests the exact maximum length boundaries and values beyond them across all fields.
   */
  test('Scenario 33: Maximum boundary limits enforce validation contracts', async () => {
    const baseValid = {
      jobId: 'job-qa-lead-001',
      fullName: 'A'.repeat(BOUNDARIES.fullName.max), // 80 chars
      email: 'a'.repeat(88) + '@example.com', // 100 chars
      phone: '+1 555-' + '9'.repeat(18), // 25 chars, 19 digits
      resumeUrl: 'https://example.com/' + 'r'.repeat(230), // 250 chars
      coverLetter: 'C'.repeat(BOUNDARIES.coverLetter.max) // 2000 chars
    };

    // 1. Exact maximum values pass validation
    const validResult = validateApplicationInput(baseValid);
    expect(validResult.isValid).toBe(true);

    // 2. fullName beyond maximum (81 chars) -> rejected
    const longNameResult = validateApplicationInput({
      ...baseValid,
      fullName: 'A'.repeat(BOUNDARIES.fullName.max + 1)
    });
    expect(longNameResult.isValid).toBe(false);
    expect(longNameResult.errors.find((e) => e.field === 'fullName')?.message).toContain(
      `Full name cannot exceed ${BOUNDARIES.fullName.max} characters`
    );

    // 3. email beyond maximum (101 chars) -> rejected
    const longEmailResult = validateApplicationInput({
      ...baseValid,
      email: 'a'.repeat(89) + '@example.com' // 101 chars
    });
    expect(longEmailResult.isValid).toBe(false);
    expect(longEmailResult.errors.find((e) => e.field === 'email')?.message).toContain(
      `Email cannot exceed ${BOUNDARIES.email.max} characters`
    );

    // 4. phone beyond maximum (26 chars) -> rejected
    const longPhoneResult = validateApplicationInput({
      ...baseValid,
      phone: '+1 555-' + '9'.repeat(19) // 26 chars
    });
    expect(longPhoneResult.isValid).toBe(false);
    expect(longPhoneResult.errors.find((e) => e.field === 'phone')?.message).toContain(
      `Phone number cannot exceed ${BOUNDARIES.phone.max} characters`
    );

    // 5. resumeUrl beyond maximum (251 chars) -> rejected
    const longUrlResult = validateApplicationInput({
      ...baseValid,
      resumeUrl: 'https://example.com/' + 'r'.repeat(231) // 251 chars
    });
    expect(longUrlResult.isValid).toBe(false);
    expect(longUrlResult.errors.find((e) => e.field === 'resumeUrl')?.message).toContain(
      `Resume URL cannot exceed ${BOUNDARIES.resumeUrl.max} characters`
    );

    // 6. coverLetter beyond maximum (2001 chars) -> rejected
    const longCoverResult = validateApplicationInput({
      ...baseValid,
      coverLetter: 'C'.repeat(BOUNDARIES.coverLetter.max + 1)
    });
    expect(longCoverResult.isValid).toBe(false);
    expect(longCoverResult.errors.find((e) => e.field === 'coverLetter')?.message).toContain(
      `Cover letter cannot exceed ${BOUNDARIES.coverLetter.max} characters`
    );
  });

  /**
   * Scenario 34: Supported phone validation rules.
   * Verifies that phone validation strictly rejects alphabetic characters
   * and numbers with fewer than 7 digits, while accepting supported formats (+, -, (), spaces, dots).
   */
  test('Scenario 34: Phone validation rejects invalid characters and insufficient digits', async ({ page }) => {
    await page.goto('/jobs/job-qa-lead-001');

    await page.getByTestId('input-fullName').fill('Phone Validator');
    await page.getByTestId('input-email').fill('phone.validator@example.com');
    await page.getByTestId('input-resumeUrl').fill('https://example.com/resume.pdf');

    // 1. Phone containing invalid characters with sufficient digits
    const phoneInput = page.getByTestId('input-phone');
    await phoneInput.fill('+1 (555) 123-4567 ext');
    await page.getByTestId('submit-button').click();

    const phoneError = page.getByTestId('error-phone');
    await expect(phoneError).toBeVisible();
    await expect(phoneError).toContainText(
      'Phone number contains invalid characters. Use digits, +, -, ., (), and spaces.'
    );

    // 2. Phone containing fewer than 7 digits (e.g. 5 digits)
    await phoneInput.fill('12345');
    await page.getByTestId('submit-button').click();
    await expect(phoneError).toBeVisible();
    await expect(phoneError).toContainText(
      'Phone number must contain at least 7 digits (min 7 characters)'
    );

    // 3. Supported phone format with +, spaces, and parentheses passes
    await phoneInput.fill('+1 (555) 987-6543');
    await page.getByTestId('submit-button').click();
    await expect(phoneError).not.toBeVisible();
    await expect(page.getByTestId('application-success-banner')).toBeVisible({ timeout: 10000 });
  });

  /**
   * Scenario 35: Successful submission with empty optional cover letter.
   * Verifies that leaving the optional cover letter empty permits successful application.
   */
  test('Scenario 35: Successful submission with empty optional cover letter', async ({ page }) => {
    await page.goto('/jobs/job-qa-lead-001');

    await page.getByTestId('input-fullName').fill('Dana Scully');
    await page.getByTestId('input-email').fill('dana.scully@fbi-qa.gov');
    await page.getByTestId('input-phone').fill('+1 555-234-5678');
    await page.getByTestId('input-resumeUrl').fill('https://example.com/resumes/dana.pdf');

    // Cover letter explicitly empty
    await page.getByTestId('input-coverLetter').fill('');

    await page.getByTestId('submit-button').click();

    // Verify successful submission confirmation
    const successBanner = page.getByTestId('application-success-banner');
    await expect(successBanner).toBeVisible({ timeout: 10000 });
    await expect(successBanner).toContainText('Application Submitted Successfully!');
    await expect(page.getByTestId('confirmation-email')).toHaveText('dana.scully@fbi-qa.gov');
  });

  /**
   * Scenario 36: Dynamic clearing of field validation errors on keystroke.
   * Verifies that when a field has a validation error, the user editing that field
   * immediately clears the field error for improved user experience.
   */
  test('Scenario 36: Field validation error clears dynamically upon user keystroke', async ({ page }) => {
    await page.goto('/jobs/job-qa-lead-001');

    // Submit empty form to trigger field errors
    await page.getByTestId('submit-button').click();

    const nameError = page.getByTestId('error-fullName');
    await expect(nameError).toBeVisible();
    await expect(nameError).toContainText('Full name is required');

    // User begins typing into the fullName input
    await page.getByTestId('input-fullName').fill('Fox Mulder');

    // Field error is immediately cleared on change
    await expect(nameError).not.toBeVisible();
  });

  /**
   * Scenario 37: Accessibility focus management shifts to the first invalid field.
   * Verifies that when client-side validation fails, focus automatically moves
   * to the first invalid input element to assist keyboard and screen-reader users.
   */
  test('Scenario 37: Keyboard focus automatically shifts to the first invalid field', async ({ page }) => {
    await page.goto('/jobs/job-qa-lead-001');

    // 1. When form is completely empty, first invalid field is fullName (#fullName)
    await page.getByTestId('submit-button').click();
    await expect(page.locator('#fullName')).toBeFocused();

    // 2. Fill valid fullName, leaving email empty; focus should shift to #email
    await page.getByTestId('input-fullName').fill('Walter Skinner');
    await page.getByTestId('submit-button').click();
    await expect(page.locator('#email')).toBeFocused();
  });
});
