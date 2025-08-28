import { test, expect } from '@playwright/test'

test.describe('Authentication Flow', () => {
  test('should redirect to sign-in when not authenticated', async ({ page }) => {
    await page.goto('/dashboard')
    
    // Should be redirected to sign-in page
    await expect(page).toHaveURL(/.*sign-in.*/)
  })

  test('should show sign-in page elements', async ({ page }) => {
    await page.goto('/sign-in')
    
    // Check for Clerk sign-in elements
    await expect(page.getByRole('main')).toBeVisible()
  })

  test('should show sign-up page elements', async ({ page }) => {
    await page.goto('/sign-up')
    
    // Check for Clerk sign-up elements
    await expect(page.getByRole('main')).toBeVisible()
  })

  test('should navigate between sign-in and sign-up', async ({ page }) => {
    await page.goto('/sign-in')
    
    // Look for a link to sign-up (exact selector depends on Clerk UI)
    const signUpLink = page.locator('a[href*="sign-up"]').first()
    if (await signUpLink.isVisible()) {
      await signUpLink.click()
      await expect(page).toHaveURL(/.*sign-up.*/)
    }
  })
})
