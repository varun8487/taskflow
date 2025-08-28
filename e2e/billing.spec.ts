import { test, expect } from '@playwright/test'

test.describe('Billing Page', () => {
  test('should show pricing plans', async ({ page }) => {
    await page.goto('/billing')
    
    // Should show all subscription tiers
    await expect(page.getByText('Free')).toBeVisible()
    await expect(page.getByText('Starter')).toBeVisible()
    await expect(page.getByText('Pro')).toBeVisible()
    await expect(page.getByText('Enterprise')).toBeVisible()
  })

  test('should show feature comparison table', async ({ page }) => {
    await page.goto('/billing')
    
    // Should show feature comparison
    await expect(page.getByText('Feature Comparison')).toBeVisible()
    await expect(page.getByText('Teams')).toBeVisible()
    await expect(page.getByText('Projects')).toBeVisible()
    await expect(page.getByText('Analytics')).toBeVisible()
  })

  test('should show pricing information', async ({ page }) => {
    await page.goto('/billing')
    
    // Check for pricing information
    await expect(page.getByText('$12')).toBeVisible() // Starter price
    await expect(page.getByText('$29')).toBeVisible() // Pro price
    await expect(page.getByText('$99')).toBeVisible() // Enterprise price
  })

  test('should have upgrade buttons', async ({ page }) => {
    await page.goto('/billing')
    
    // Should have upgrade/choose buttons (exact text may vary)
    const upgradeButtons = page.locator('button').filter({ hasText: /choose|upgrade|current/i })
    await expect(upgradeButtons.first()).toBeVisible()
  })

  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/billing')
    
    // Should still show key elements on mobile
    await expect(page.getByText('Billing & Subscription')).toBeVisible()
    await expect(page.getByText('Free')).toBeVisible()
  })

  test('should show loading states', async ({ page }) => {
    // Intercept API calls to test loading states
    await page.route('/api/stripe/**', async route => {
      // Delay the response to see loading state
      await new Promise(resolve => setTimeout(resolve, 1000))
      await route.continue()
    })

    await page.goto('/billing')
    
    // Click on a plan button if not already current plan
    const upgradeButton = page.locator('button').filter({ hasText: /choose starter/i }).first()
    if (await upgradeButton.isVisible()) {
      await upgradeButton.click()
      
      // Should show loading state
      await expect(page.getByText(/loading|processing/i)).toBeVisible({ timeout: 2000 })
    }
  })
})
