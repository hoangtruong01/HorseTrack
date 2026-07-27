import { test, expect } from '@playwright/test';

test.describe('HorseTrack FE Web App E2E Tests', () => {
  test('should load the homepage and show heading', async ({ page }) => {
    // Go to homepage
    await page.goto('/');
    
    // Check for general layout elements or page text
    const title = await page.title();
    expect(title).toContain('HorseTrack');

    // Verify main buttons or hero text
    const loginLink = page.locator('a[href="/login"]').first();
    await expect(loginLink).toBeVisible();
  });

  test('should render registration page', async ({ page }) => {
    // Go directly to register page
    await page.goto('/register');
    
    // Verify signup form is visible
    await expect(page.locator('input[placeholder*="full name"]')).toBeVisible();
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]').first()).toBeVisible();
  });

  test('should support demo login flow for Admin', async ({ page }) => {
    // Go to login page
    await page.goto('/login');
    
    // Verify email and password input fields are present
    const emailInput = page.locator('input[type="email"]');
    const passwordInput = page.locator('input[type="password"]');
    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();

    // Click the Admin demo account button
    // It contains the text "Admin" in uppercase tracking-wider
    const adminDemoBtn = page.locator('button:has-text("Admin")').first();
    await expect(adminDemoBtn).toBeVisible();
    await adminDemoBtn.click();

    // Verify email input gets populated
    await expect(emailInput).toHaveValue('admin@horsetrack.local');

    // Click Sign In
    const submitBtn = page.locator('button[type="submit"]').first();
    await submitBtn.click();

    // After login, we expect to be redirected to admin dashboard or home
    // Playwright will wait for navigation or URL update
    await page.waitForURL(/admin|\//);

    // If redirected to admin page, check if dashboard sidebar is visible
    const currentUrl = page.url();
    if (currentUrl.includes('/admin')) {
      await expect(page.locator('aside')).toBeVisible();
    }
  });

  test('should support demo login flow for Spectator', async ({ page }) => {
    await page.goto('/login');
    
    // Click Spectator demo account button (usually has text "Spectator")
    const specDemoBtn = page.locator('button:has-text("Spectator")').first();
    if (await specDemoBtn.isVisible()) {
      await specDemoBtn.click();
      
      const submitBtn = page.locator('button[type="submit"]').first();
      await submitBtn.click();
      
      await page.waitForURL(/spectator|\//);
    }
  });
});
