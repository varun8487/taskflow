"use client";

import { ReactNode } from "react";
import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@/../convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Crown, Lock, Zap, ArrowRight } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { canAccessFeature, SubscriptionTier, FeatureLimits, getFeatureLimits } from "@/lib/feature-gates";

interface FeatureGateProps {
  children: ReactNode;
  feature: keyof FeatureLimits;
  requiredTier?: SubscriptionTier;
  fallback?: ReactNode;
  showUpgrade?: boolean;
}

export function FeatureGate({ 
  children, 
  feature, 
  requiredTier = "pro",
  fallback,
  showUpgrade = true 
}: FeatureGateProps) {
  const { user } = useUser();
  const convexUser = useQuery(
    api.users.getUserByClerkId,
    user ? { clerkId: user.id } : "skip"
  );

  if (!user || !convexUser) {
    return null;
  }

  const userTier = (convexUser.subscriptionTier as SubscriptionTier) || "free";
  const hasAccess = canAccessFeature(userTier, feature);

  if (hasAccess) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  if (!showUpgrade) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="glass-effect border border-yellow-200 dark:border-yellow-700/50 bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Crown className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="flex items-center justify-center text-gray-900 dark:text-white">
            <Lock className="w-5 h-5 mr-2" />
            Premium Feature
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-gray-600 dark:text-gray-300">
            This feature requires a {requiredTier} subscription or higher.
          </p>
          <div className="flex items-center justify-center space-x-2">
            <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-none">
              <Crown className="w-3 h-3 mr-1" />
              {requiredTier.toUpperCase()}
            </Badge>
            <span className="text-sm text-gray-500 dark:text-gray-400">required</span>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/billing">
              <Button className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white shadow-lg">
                <Zap className="w-4 h-4 mr-2" />
                Upgrade Now
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Button variant="outline" className="glass-effect">
              Learn More
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// Usage limit checker component
interface UsageLimitProps {
  children: ReactNode;
  feature: keyof FeatureLimits;
  currentUsage: number;
  showWarning?: boolean;
}

export function UsageLimit({ 
  children, 
  feature, 
  currentUsage,
  showWarning = true 
}: UsageLimitProps) {
  const { user } = useUser();
  const convexUser = useQuery(
    api.users.getUserByClerkId,
    user ? { clerkId: user.id } : "skip"
  );

  if (!user || !convexUser) {
    return null;
  }

  const userTier = (convexUser.subscriptionTier as SubscriptionTier) || "free";
  
  // Get the limit for this feature
  const limits = getFeatureLimits(userTier);
  const limit = limits[feature] as number;
  
  if (limit === -1) {
    // Unlimited
    return <>{children}</>;
  }

  const hasReachedLimit = currentUsage >= limit;
  const nearLimit = currentUsage >= limit * 0.8; // 80% of limit

  if (hasReachedLimit) {
    return (
      <FeatureGate 
        feature={feature} 
        fallback={
          <Card className="glass-effect border border-red-200 dark:border-red-700/50 bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lock className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Limit Reached
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                You&apos;ve reached your {feature} limit ({currentUsage}/{limit}).
              </p>
              <Link href="/billing">
                <Button className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white">
                  Upgrade to Continue
                </Button>
              </Link>
            </CardContent>
          </Card>
        }
      >
        {children}
      </FeatureGate>
    );
  }

  return (
    <div className="space-y-4">
      {showWarning && nearLimit && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700/50 rounded-lg"
        >
          <div className="flex items-center space-x-2">
            <Crown className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
            <span className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
              Usage Warning: {currentUsage}/{limit} {feature} used
            </span>
            <Link href="/billing" className="ml-auto">
              <Button variant="outline" size="sm" className="text-xs">
                Upgrade
              </Button>
            </Link>
          </div>
        </motion.div>
      )}
      {children}
    </div>
  );
}
