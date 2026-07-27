import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  timeout: 30000,
  use: {
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'web-desktop',
      use: { 
        ...devices['Desktop Chrome'],
        baseURL: 'http://localhost:3001',
      },
      testMatch: /fe\.spec\.ts/,
    },
    {
      name: 'mobi-mobile',
      use: { 
        ...devices['iPhone 14'],
        baseURL: 'http://localhost:8081',
      },
      testMatch: /mobi\.spec\.ts/,
    },
  ],
});
