import { useQuery } from "convex/react";
import { useUser } from "@clerk/nextjs";
import { api } from "@/../convex/_generated/api";

export function useSubscription() {
  const { user } = useUser();
  
  const subscriptionStatus = useQuery(
    api.users.getUserSubscriptionStatus,
    user ? { clerkId: user.id } : "skip"
  );

  const isLoading = subscriptionStatus === undefined;
  const isPro = subscriptionStatus?.tier === "pro" && subscriptionStatus?.status === "active";
  const isActive = subscriptionStatus?.status === "active";

  return {
    isLoading,
    isPro,
    isActive,
    tier: subscriptionStatus?.tier || "starter",
    status: subscriptionStatus?.status || "inactive",
    stripeCustomerId: subscriptionStatus?.stripeCustomerId,
  };
}

export const FEATURE_LIMITS = {
  starter: {
    maxTeamMembers: 3,
    maxProjects: 5,
    maxFileUploadMB: 1, // 1MB
    analyticsEnabled: false,
    prioritySupport: false,
  },
  pro: {
    maxTeamMembers: Infinity,
    maxProjects: Infinity,
    maxFileUploadMB: 10 * 1024, // 10GB in MB
    analyticsEnabled: true,
    prioritySupport: true,
  },
} as const;

export function getFeatureLimits(tier: "starter" | "pro") {
  return FEATURE_LIMITS[tier];
}

export function canAccessFeature(tier: "starter" | "pro", feature: keyof typeof FEATURE_LIMITS.starter) {
  const limits = getFeatureLimits(tier);
  
  switch (feature) {
    case "analyticsEnabled":
    case "prioritySupport":
      return limits[feature];
    default:
      return true; // Basic features are available to all
  }
}

export function isWithinLimit(
  tier: "starter" | "pro",
  feature: "maxTeamMembers" | "maxProjects",
  currentValue: number
) {
  const limits = getFeatureLimits(tier);
  return currentValue < limits[feature];
}
