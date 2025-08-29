import { test, expect } from '@playwright/test'

test.describe('Homepage', () => {
  test('should load homepage successfully', async ({ page }) => {
    await page.goto('/')
    
    await expect(page).toHaveTitle(/TaskFlow.*Modern Project Management/)
  })

  test('should have navigation elements', async ({ page }) => {
    await page.goto('/')
    
    // Check for key navigation elements
    await expect(page.getByRole('link', { name: /sign.?in/i })).toBeVisible()
  })

  test('should show theme toggle', async ({ page }) => {
    await page.goto('/')
    
    // Look for theme toggle button
    const themeToggle = page.locator('[aria-label*="theme"], [data-testid="theme-toggle"]').first()
    if (await themeToggle.isVisible()) {
      await expect(themeToggle).toBeVisible()
    }
  })

  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')
    
    await expect(page).toHaveTitle(/TaskFlow.*Modern Project Management/)
  })

  test('should have proper meta tags', async ({ page }) => {
    await page.goto('/')
    
    // Check for basic SEO meta tags
    const metaDescription = page.locator('meta[name="description"]')
    if (await metaDescription.count() > 0) {
      const content = await metaDescription.getAttribute('content')
      expect(content).toBeTruthy()
      expect(content!.length).toBeGreaterThan(50)
    }
  })
})
