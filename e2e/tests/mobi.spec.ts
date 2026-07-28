import { test, expect } from '@playwright/test';

test.describe('HorseTrack Mobile App E2E Tests', () => {
  // Mobile tests assume Expo dev server runs on http://localhost:8081
  
  test('should load mobile login page and display quick access roles', async ({ page }) => {
    // Set a tall viewport so all elements are visible without scrolling issues
    await page.setViewportSize({ width: 390, height: 1200 });
    
    // Navigate to mobile app home
    await page.goto('/');
    
    // Playwright automatically waits for redirect
    // Verify login screen elements
    await expect(page.locator('text=TRUY CẬP NHANH')).toBeVisible();
    await expect(page.locator('text=KHÁN GIẢ')).toBeVisible();
    await expect(page.locator('text=TRỌNG TÀI')).toBeVisible();
  });

  test('should support quick login as Spectator (KHÁN GIẢ) on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 1200 });
    await page.goto('/login');
    
    // Wait for hydration
    await page.waitForTimeout(1000);
    
    // Click the "KHÁN GIẢ" demo option
    const spectatorBtn = page.locator('text=KHÁN GIẢ').first();
    await spectatorBtn.click();
    
    // Confirm layout elements specific to spectator dashboard are visible
    // Such as "RACE VIEWER"
    await expect(page.locator('text=RACE VIEWER')).toBeVisible();
  });

  test('should support quick login as Referee (TRỌNG TÀI) on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 1200 });
    await page.goto('/login');
    
    // Wait for hydration
    await page.waitForTimeout(1000);
    
    // Click the "TRỌNG TÀI" demo option
    const refereeBtn = page.locator('text=TRỌNG TÀI').first();
    await refereeBtn.click();
    
    // Verify we reached the referee section
    // Such as "RACE CONTROL"
    await expect(page.locator('text=RACE CONTROL')).toBeVisible();
  });
});
