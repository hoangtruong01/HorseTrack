import { test, expect } from '@playwright/test';

test.describe('HorseTrack Mobile App E2E Tests', () => {
  // Mobile tests assume Expo dev server runs on http://localhost:8081
  
  test('should load mobile login page and display quick access roles', async ({ page }) => {
    // Navigate to mobile app home (which should redirect to login if unauthenticated)
    await page.goto('/');
    
    // Playwright automatically waits for redirect
    // Verify login screen elements
    await expect(page.locator('text=TRUY CẬP NHANH')).toBeVisible();
    await expect(page.locator('text=KHÁN GIẢ')).toBeVisible();
    await expect(page.locator('text=TRỌNG TÀI')).toBeVisible();
  });

  test('should support quick login as Spectator (KHÁN GIẢ) on mobile', async ({ page }) => {
    await page.goto('/login');
    
    // Click the "KHÁN GIẢ" demo option
    const spectatorBtn = page.locator('text=KHÁN GIẢ').first();
    await spectatorBtn.click();
    
    // Expect redirecting to spectator home dashboard
    // React Native Expo Web uses client-side routing, check the URL
    await page.waitForURL(/\/\(spectator\)/);
    
    // Confirm layout elements specific to spectator dashboard are visible
    // Such as "Bảng xếp hạng" (Leaderboard) or "Wallet"
    const currentUrl = page.url();
    expect(currentUrl).toContain('(spectator)');
  });

  test('should support quick login as Referee (TRỌNG TÀI) on mobile', async ({ page }) => {
    await page.goto('/login');
    
    // Click the "TRỌNG TÀI" demo option
    const refereeBtn = page.locator('text=TRỌNG TÀI').first();
    await refereeBtn.click();
    
    // Expect redirecting to referee home dashboard
    await page.waitForURL(/\/\(referee\)/);
    
    // Verify we reached the referee section
    const currentUrl = page.url();
    expect(currentUrl).toContain('(referee)');
  });
});
