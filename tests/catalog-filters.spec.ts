import { test, expect } from '@playwright/test';

test.describe('HireFlow QA Lab - Catalog Filtering & Search Scenarios', () => {
  // Ensure clean isolation before each test
  test.beforeEach(async ({ request }) => {
    const response = await request.post('/api/test-support/reset');
    expect(response.status()).toBe(200);
  });

  /**
   * Scenario 26: Search catalog by job title.
   * Verifies that typing a specific title substring filters the catalog
   * to matching positions and updates the displayed count.
   */
  test('Scenario 26: Search catalog by job title', async ({ page }) => {
    await page.goto('/');

    // Initial catalog renders all 6 seed positions
    await expect(page.getByTestId('job-card')).toHaveCount(6);

    // Search for 'Frontend'
    const searchInput = page.getByTestId('job-search-input');
    await searchInput.fill('Frontend');

    // Matches exactly 1 role: Senior Frontend Engineer
    const matchedCards = page.getByTestId('job-card');
    await expect(matchedCards).toHaveCount(1);
    await expect(matchedCards.first().getByTestId('job-title')).toContainText(
      'Senior Frontend Engineer (React / Next.js)'
    );
  });

  /**
   * Scenario 27: Search catalog by company name.
   * Verifies that searching by company name filters to positions at that employer.
   */
  test('Scenario 27: Search catalog by company', async ({ page }) => {
    await page.goto('/');

    const searchInput = page.getByTestId('job-search-input');
    await searchInput.fill('FinPulse');

    const matchedCards = page.getByTestId('job-card');
    await expect(matchedCards).toHaveCount(1);
    await expect(matchedCards.first()).toContainText('FinPulse Systems');
    await expect(matchedCards.first().getByTestId('job-title')).toContainText(
      'Senior SDET (Software Development Engineer in Test)'
    );
  });

  /**
   * Scenario 28: Search catalog by location.
   * Verifies matching by city/state, on-site, and remote locations.
   */
  test('Scenario 28: Search catalog by location', async ({ page }) => {
    await page.goto('/');

    const searchInput = page.getByTestId('job-search-input');

    // Search 'Austin' -> 1 on-site position at HealthSync
    await searchInput.fill('Austin');
    await expect(page.getByTestId('job-card')).toHaveCount(1);
    await expect(page.getByTestId('job-card').first().getByTestId('job-location')).toContainText(
      'Austin, TX (On-site)'
    );

    // Search 'Remote' -> 2 positions (CloudScale & Aegis)
    await searchInput.fill('Remote');
    await expect(page.getByTestId('job-card')).toHaveCount(2);
  });

  /**
   * Scenario 29: Search catalog by required skill tag.
   * Verifies that searching technical skill keywords matches jobs requiring that competency.
   */
  test('Scenario 29: Search catalog by required skill', async ({ page }) => {
    await page.goto('/');

    const searchInput = page.getByTestId('job-search-input');

    // Search 'Kubernetes' -> 1 role (DevOps & Reliability Engineer)
    await searchInput.fill('Kubernetes');
    const cards = page.getByTestId('job-card');
    await expect(cards).toHaveCount(1);
    await expect(cards.first().getByTestId('job-title')).toContainText(
      'DevOps & Reliability Engineer'
    );
  });

  /**
   * Scenario 30: Combined job-type and job-status dropdown filtering.
   * Verifies multi-faceted filtering combining job type and open/closed status.
   */
  test('Scenario 30: Combined job-type and job-status filtering', async ({ page }) => {
    await page.goto('/');

    const typeSelect = page.getByTestId('filter-job-type');
    const statusSelect = page.getByTestId('filter-job-status');

    // Filter: Contract + Open -> 1 role (DevOps Engineer)
    await typeSelect.selectOption('Contract');
    await statusSelect.selectOption('Open');
    await expect(page.getByTestId('job-card')).toHaveCount(1);
    await expect(page.getByTestId('job-card').first().getByTestId('job-title')).toContainText(
      'DevOps & Reliability Engineer'
    );

    // Filter: Part-time + Closed -> 1 role (Junior QA Tester)
    await typeSelect.selectOption('Part-time');
    await statusSelect.selectOption('Closed');
    await expect(page.getByTestId('job-card')).toHaveCount(1);
    await expect(page.getByTestId('job-card').first().getByTestId('job-title')).toContainText(
      'Junior QA Tester (Manual & Exploratory)'
    );

    // Filter: Part-time + Open -> 0 roles (empty set)
    await statusSelect.selectOption('Open');
    await expect(page.getByTestId('job-card')).toHaveCount(0);
    await expect(page.getByTestId('empty-jobs-state')).toBeVisible();
  });

  /**
   * Scenario 31: Empty search results renders accessible empty state container.
   * Verifies that when zero postings match the query, the catalog displays the
   * empty-jobs-state container with helpful messaging.
   */
  test('Scenario 31: Empty search results renders empty-state component', async ({ page }) => {
    await page.goto('/');

    const searchInput = page.getByTestId('job-search-input');
    await searchInput.fill('quantum-computing-specialist-xyz');

    // Zero cards rendered
    await expect(page.getByTestId('job-card')).toHaveCount(0);

    // Empty state container visible with correct messaging
    const emptyState = page.getByTestId('empty-jobs-state');
    await expect(emptyState).toBeVisible();
    await expect(emptyState).toContainText('No Job Postings Found');
    await expect(emptyState).toContainText('No open positions match your search criteria');
  });

  /**
   * Scenario 32: Clearing filters restores the complete catalog.
   * Verifies that clicking 'Reset All Filters' clears input values and restores all 6 positions.
   */
  test('Scenario 32: Clearing filters restores the complete catalog', async ({ page }) => {
    await page.goto('/');

    const searchInput = page.getByTestId('job-search-input');
    const typeSelect = page.getByTestId('filter-job-type');

    // Apply filtering
    await searchInput.fill('Playwright');
    await typeSelect.selectOption('Full-time');
    await expect(page.getByTestId('job-card')).toHaveCount(3);

    // Click 'Reset All Filters'
    const resetBtn = page.getByTestId('clear-filters-btn');
    await expect(resetBtn).toBeVisible();
    await resetBtn.click();

    // Verify search term is cleared and selects are reset to 'All'
    await expect(searchInput).toHaveValue('');
    await expect(typeSelect).toHaveValue('All');
    await expect(page.getByTestId('filter-job-status')).toHaveValue('All');

    // Verify full catalog is restored
    await expect(page.getByTestId('job-card')).toHaveCount(6);
  });
});
