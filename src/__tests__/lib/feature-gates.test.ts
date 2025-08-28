import { 
  getFeatureLimits,
  canAccessFeature,
  hasReachedLimit,
  FEATURE_LIMITS,
  SubscriptionTier
} from '@/lib/feature-gates'

describe('Feature Gates', () => {
  describe('getFeatureLimits', () => {
    it('should return correct limits for free tier', () => {
      const limits = getFeatureLimits('free')
      expect(limits.maxTeams).toBe(1)
      expect(limits.maxProjects).toBe(3)
      expect(limits.analyticsAccess).toBe(false)
    })

    it('should return correct limits for starter tier', () => {
      const limits = getFeatureLimits('starter')
      expect(limits.maxTeams).toBe(3)
      expect(limits.maxProjects).toBe(10)
      expect(limits.analyticsAccess).toBe(true)
    })

    it('should return correct limits for pro tier', () => {
      const limits = getFeatureLimits('pro')
      expect(limits.maxTeams).toBe(10)
      expect(limits.maxProjects).toBe(50)
      expect(limits.prioritySupport).toBe(true)
      expect(limits.apiAccess).toBe(true)
    })

    it('should return correct limits for enterprise tier', () => {
      const limits = getFeatureLimits('enterprise')
      expect(limits.maxTeams).toBe(-1) // Unlimited
      expect(limits.maxProjects).toBe(-1) // Unlimited
      expect(limits.customIntegrations).toBe(true)
      expect(limits.advancedSecurity).toBe(true)
    })
  })

  describe('canAccessFeature', () => {
    it('should deny analytics access for free tier', () => {
      expect(canAccessFeature('free', 'analyticsAccess')).toBe(false)
    })

    it('should allow analytics access for starter tier and above', () => {
      expect(canAccessFeature('starter', 'analyticsAccess')).toBe(true)
      expect(canAccessFeature('pro', 'analyticsAccess')).toBe(true)
      expect(canAccessFeature('enterprise', 'analyticsAccess')).toBe(true)
    })

    it('should deny priority support for free and starter tiers', () => {
      expect(canAccessFeature('free', 'prioritySupport')).toBe(false)
      expect(canAccessFeature('starter', 'prioritySupport')).toBe(false)
    })

    it('should allow priority support for pro and enterprise tiers', () => {
      expect(canAccessFeature('pro', 'prioritySupport')).toBe(true)
      expect(canAccessFeature('enterprise', 'prioritySupport')).toBe(true)
    })

    it('should deny API access for free and starter tiers', () => {
      expect(canAccessFeature('free', 'apiAccess')).toBe(false)
      expect(canAccessFeature('starter', 'apiAccess')).toBe(false)
    })

    it('should allow API access for pro and enterprise tiers', () => {
      expect(canAccessFeature('pro', 'apiAccess')).toBe(true)
      expect(canAccessFeature('enterprise', 'apiAccess')).toBe(true)
    })
  })

  describe('hasReachedLimit', () => {
    it('should return false for unlimited features', () => {
      expect(hasReachedLimit('enterprise', 'maxTeams', 999)).toBe(false)
      expect(hasReachedLimit('enterprise', 'maxProjects', 1000)).toBe(false)
    })

    it('should return true when limit is reached', () => {
      expect(hasReachedLimit('free', 'maxTeams', 1)).toBe(true)
      expect(hasReachedLimit('starter', 'maxProjects', 10)).toBe(true)
    })

    it('should return false when under limit', () => {
      expect(hasReachedLimit('free', 'maxTeams', 0)).toBe(false)
      expect(hasReachedLimit('starter', 'maxProjects', 5)).toBe(false)
      expect(hasReachedLimit('pro', 'maxTeams', 3)).toBe(false)
    })

    it('should handle edge cases correctly', () => {
      expect(hasReachedLimit('pro', 'maxProjects', 50)).toBe(true) // Exactly at limit
      expect(hasReachedLimit('pro', 'maxProjects', 49)).toBe(false) // Just under limit
      expect(hasReachedLimit('pro', 'maxProjects', 51)).toBe(true) // Over limit
    })
  })

  describe('FEATURE_LIMITS structure', () => {
    it('should have all required tiers', () => {
      expect(FEATURE_LIMITS).toHaveProperty('free')
      expect(FEATURE_LIMITS).toHaveProperty('starter')
      expect(FEATURE_LIMITS).toHaveProperty('pro')
      expect(FEATURE_LIMITS).toHaveProperty('enterprise')
    })

    it('should have consistent feature keys across all tiers', () => {
      const tiers: SubscriptionTier[] = ['free', 'starter', 'pro', 'enterprise']
      const expectedFeatures = [
        'maxTeams',
        'maxProjects',
        'maxTasksPerProject',
        'maxFileUploadMB',
        'maxStorageGB',
        'analyticsAccess',
        'prioritySupport',
        'customIntegrations',
        'advancedSecurity',
        'teamRoles',
        'apiAccess'
      ]

      tiers.forEach(tier => {
        expectedFeatures.forEach(feature => {
          expect(FEATURE_LIMITS[tier]).toHaveProperty(feature)
        })
      })
    })

    it('should have logical progression of limits', () => {
      // Teams should increase or stay unlimited
      expect(FEATURE_LIMITS.free.maxTeams).toBeLessThan(FEATURE_LIMITS.starter.maxTeams)
      expect(FEATURE_LIMITS.starter.maxTeams).toBeLessThan(FEATURE_LIMITS.pro.maxTeams)
      expect(FEATURE_LIMITS.enterprise.maxTeams).toBe(-1) // Unlimited

      // Projects should increase or stay unlimited
      expect(FEATURE_LIMITS.free.maxProjects).toBeLessThan(FEATURE_LIMITS.starter.maxProjects)
      expect(FEATURE_LIMITS.starter.maxProjects).toBeLessThan(FEATURE_LIMITS.pro.maxProjects)
      expect(FEATURE_LIMITS.enterprise.maxProjects).toBe(-1) // Unlimited

      // File upload size should increase
      expect(FEATURE_LIMITS.free.maxFileUploadMB).toBeLessThan(FEATURE_LIMITS.starter.maxFileUploadMB)
      expect(FEATURE_LIMITS.starter.maxFileUploadMB).toBeLessThan(FEATURE_LIMITS.pro.maxFileUploadMB)
      expect(FEATURE_LIMITS.pro.maxFileUploadMB).toBeLessThan(FEATURE_LIMITS.enterprise.maxFileUploadMB)
    })
  })
})
