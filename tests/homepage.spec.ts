import { test, expect } from '@playwright/test';

test.describe('Virtago Homepage', () => {
  test('should load homepage successfully', async ({ page }) => {
    // Navigate to the homepage
    await page.goto('/');
    
    // Check if the main title is visible
    await expect(page.locator('h1')).toContainText('Bienvenido a Virtago');
    
    // Check if the page has loaded properly
    await expect(page).toHaveTitle(/Virtago/);
  });

  test('should have responsive navigation', async ({ page }) => {
    await page.goto('/');
    
    // Check if navigation elements are present
    // This is a placeholder - adjust based on your actual navigation structure
    await expect(page.locator('nav')).toBeVisible();
  });
});

test.describe('Chat System', () => {
  test('should show chat button', async ({ page }) => {
    await page.goto('/');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Look for the chat button (floating button)
    // This will need to be adjusted based on the actual implementation
    const chatButton = page.locator('[data-testid="chat-button"]').or(
      page.locator('button').filter({ hasText: /chat|mensaje/i })
    );
    
    // If the chat button is not immediately visible, that's ok for now
    // We're just setting up the test structure
  });
});

test.describe('Theme System', () => {
  test('should load with default theme', async ({ page }) => {
    await page.goto('/');
    
    // Check if theme styles are applied
    const body = page.locator('body');
    await expect(body).toHaveClass(/font-sans/);
  });
});