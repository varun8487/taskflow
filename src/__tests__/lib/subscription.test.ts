import { getFeatureLimits, canAccessFeature, isWithinLimit, FEATURE_LIMITS } from '@/lib/subscription'

describe('Subscription utilities', () => {
  describe('getFeatureLimits', () => {
    it('should return correct limits for starter tier', () => {
      const limits = getFeatureLimits('starter')
      expect(limits).toEqual(FEATURE_LIMITS.starter)
      expect(limits.maxTeamMembers).toBe(3)
      expect(limits.maxProjects).toBe(5)
      expect(limits.analyticsEnabled).toBe(false)
    })

    it('should return correct limits for pro tier', () => {
      const limits = getFeatureLimits('pro')
      expect(limits).toEqual(FEATURE_LIMITS.pro)
      expect(limits.maxTeamMembers).toBe(Infinity)
      expect(limits.maxProjects).toBe(Infinity)
      expect(limits.analyticsEnabled).toBe(true)
    })
  })

  describe('canAccessFeature', () => {
    it('should allow starter users to access basic features', () => {
      expect(canAccessFeature('starter', 'maxTeamMembers')).toBe(true)
      expect(canAccessFeature('starter', 'maxProjects')).toBe(true)
    })

    it('should not allow starter users to access pro features', () => {
      expect(canAccessFeature('starter', 'analyticsEnabled')).toBe(false)
      expect(canAccessFeature('starter', 'prioritySupport')).toBe(false)
    })

    it('should allow pro users to access all features', () => {
      expect(canAccessFeature('pro', 'analyticsEnabled')).toBe(true)
      expect(canAccessFeature('pro', 'prioritySupport')).toBe(true)
      expect(canAccessFeature('pro', 'maxTeamMembers')).toBe(true)
    })
  })

  describe('isWithinLimit', () => {
    it('should return true when starter user is within team member limit', () => {
      expect(isWithinLimit('starter', 'maxTeamMembers', 2)).toBe(true)
      expect(isWithinLimit('starter', 'maxTeamMembers', 0)).toBe(true)
    })

    it('should return false when starter user exceeds team member limit', () => {
      expect(isWithinLimit('starter', 'maxTeamMembers', 3)).toBe(false)
      expect(isWithinLimit('starter', 'maxTeamMembers', 5)).toBe(false)
    })

    it('should return true when starter user is within project limit', () => {
      expect(isWithinLimit('starter', 'maxProjects', 4)).toBe(true)
      expect(isWithinLimit('starter', 'maxProjects', 0)).toBe(true)
    })

    it('should return false when starter user exceeds project limit', () => {
      expect(isWithinLimit('starter', 'maxProjects', 5)).toBe(false)
      expect(isWithinLimit('starter', 'maxProjects', 10)).toBe(false)
    })

    it('should always return true for pro users', () => {
      expect(isWithinLimit('pro', 'maxTeamMembers', 100)).toBe(true)
      expect(isWithinLimit('pro', 'maxProjects', 1000)).toBe(true)
    })
  })
})
