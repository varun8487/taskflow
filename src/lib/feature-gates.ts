// Feature gating system for subscription tiers
export type SubscriptionTier = "free" | "starter" | "pro" | "enterprise";

export interface FeatureLimits {
  maxTeams: number;
  maxProjects: number;
  maxTasksPerProject: number;
  maxFileUploadMB: number;
  maxStorageGB: number;
  analyticsAccess: boolean;
  prioritySupport: boolean;
  customIntegrations: boolean;
  advancedSecurity: boolean;
  teamRoles: boolean;
  apiAccess: boolean;
}

export const FEATURE_LIMITS: Record<SubscriptionTier, FeatureLimits> = {
  free: {
    maxTeams: 1,
    maxProjects: 3,
    maxTasksPerProject: 10,
    maxFileUploadMB: 5,
    maxStorageGB: 1,
    analyticsAccess: false,
    prioritySupport: false,
    customIntegrations: false,
    advancedSecurity: false,
    teamRoles: false,
    apiAccess: false,
  },
  starter: {
    maxTeams: 3,
    maxProjects: 10,
    maxTasksPerProject: 50,
    maxFileUploadMB: 25,
    maxStorageGB: 10,
    analyticsAccess: true,
    prioritySupport: false,
    customIntegrations: false,
    advancedSecurity: false,
    teamRoles: true,
    apiAccess: false,
  },
  pro: {
    maxTeams: 10,
    maxProjects: 50,
    maxTasksPerProject: 200,
    maxFileUploadMB: 100,
    maxStorageGB: 100,
    analyticsAccess: true,
    prioritySupport: true,
    customIntegrations: true,
    advancedSecurity: true,
    teamRoles: true,
    apiAccess: true,
  },
  enterprise: {
    maxTeams: -1, // Unlimited
    maxProjects: -1,
    maxTasksPerProject: -1,
    maxFileUploadMB: 500,
    maxStorageGB: 1000,
    analyticsAccess: true,
    prioritySupport: true,
    customIntegrations: true,
    advancedSecurity: true,
    teamRoles: true,
    apiAccess: true,
  },
};

export function getFeatureLimits(tier: SubscriptionTier): FeatureLimits {
  return FEATURE_LIMITS[tier];
}

export function canAccessFeature(
  userTier: SubscriptionTier,
  feature: keyof FeatureLimits
): boolean {
  const limits = getFeatureLimits(userTier);
  return Boolean(limits[feature]);
}

export function hasReachedLimit(
  userTier: SubscriptionTier,
  feature: keyof FeatureLimits,
  currentCount: number
): boolean {
  const limits = getFeatureLimits(userTier);
  const limit = limits[feature] as number;
  
  if (limit === -1) return false; // Unlimited
  return currentCount >= limit;
}

// Stripe price IDs for each tier
export const STRIPE_PRICE_IDS = {
  starter: "price_starter_monthly",
  pro: "price_pro_monthly", 
  enterprise: "price_enterprise_monthly",
} as const;

export const TIER_PRICES = {
  free: 0,
  starter: 12,
  pro: 29,
  enterprise: 99,
} as const;
