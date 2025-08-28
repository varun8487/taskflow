"use client";

// Force dynamic rendering to prevent prerendering issues with Convex
export const dynamic = 'force-dynamic';

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
// import { useQuery } from "convex/react";
// import { api } from "@/../convex/_generated/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { 
  CheckCircle, 
  CreditCard, 
  Crown, 
  Zap,
  Shield,
  Sparkles,
  Star
} from "lucide-react";
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export default function BillingPage() {
  const { user } = useUser();
  const [loading, setLoading] = useState(false);

  // Temporarily disable Convex queries to fix build issues
  // const convexUser = useQuery(
  //   api.users.getUserByClerkId,
  //   user ? { clerkId: user.id } : "skip"
  // );

  // Mock convex user for now
  const convexUser = { 
    subscriptionTier: "starter", 
    stripeCustomerId: null,
    stripeSubscriptionId: null 
  };

  // const subscriptionStatus = useQuery(
  //   api.users.getUserSubscriptionStatus,
  //   user ? { clerkId: user.id } : "skip"
  // );

  // Mock subscription status - removed unused variable

  const handleSubscribe = async (tier = 'pro') => {
    if (!user) return;
    
    setLoading(true);
    try {
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          userEmail: user.emailAddresses[0]?.emailAddress,
          tier: tier,
        }),
      });

      const { sessionId, url } = await response.json();
      
      if (url) {
        window.location.href = url;
      } else if (sessionId) {
        const stripe = await stripePromise;
        if (stripe) {
          const { error } = await stripe.redirectToCheckout({ sessionId });
          if (error) {
            console.error('Stripe error:', error);
          }
        }
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleManageBilling = async () => {
    if (!convexUser?.stripeCustomerId) return;
    
    setLoading(true);
    try {
      const response = await fetch('/api/stripe/create-portal-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerId: convexUser.stripeCustomerId,
        }),
      });

      const { url } = await response.json();
      window.location.href = url;
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!user || !convexUser) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <motion.div 
          className="text-center"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full mx-auto mb-4 flex items-center justify-center animate-glow">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              <CreditCard className="w-10 h-10 text-white" />
            </motion.div>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Loading billing information...
          </h3>
          <p className="text-gray-600 dark:text-gray-300">
            Please wait while we load your subscription details
          </p>
        </motion.div>
      </div>
    );
  }

  const isProUser = convexUser?.subscriptionTier === "pro";

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.2,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1
    }
  };

  return (
    <div className="p-6 space-y-8">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header */}
        <motion.div className="text-center mb-12" variants={itemVariants}>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-4">
            Billing & Subscription
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Manage your TaskFlow subscription and unlock powerful features for your team.
          </p>
        </motion.div>

        {/* Current Plan Status */}
        <motion.div className="mb-12" variants={itemVariants}>
          <Card className={`glass-effect border-none shadow-xl glow-effect ${
            isProUser 
              ? "bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border border-yellow-200 dark:border-yellow-700/50" 
              : "bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-700/50"
          }`}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className={`w-16 h-16 rounded-xl flex items-center justify-center ${
                    isProUser 
                      ? "bg-gradient-to-r from-yellow-500 to-orange-500" 
                      : "bg-gradient-to-r from-blue-500 to-indigo-500"
                  }`}>
                    {isProUser ? (
                      <Crown className="w-8 h-8 text-white" />
                    ) : (
                      <Zap className="w-8 h-8 text-white" />
                    )}
                  </div>
                  <div>
                    <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
                      Current Plan: {isProUser ? "Pro" : "Starter"}
                    </CardTitle>
                    <CardDescription className="text-lg text-gray-600 dark:text-gray-300 mt-1">
                      {isProUser 
                        ? "You have access to all premium features and priority support" 
                        : "You&apos;re on the free plan with limited features"
                      }
                    </CardDescription>
                  </div>
                </div>
                <Badge 
                  variant={isProUser ? "default" : "secondary"} 
                  className={`text-lg px-4 py-2 ${
                    isProUser 
                      ? "bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-none" 
                      : "glass-effect"
                  }`}
                >
                  {isProUser ? (
                    <>
                      <Crown className="w-4 h-4 mr-2" />
                      Pro
                    </>
                  ) : (
                    "Free"
                  )}
                </Badge>
              </div>
            </CardHeader>
            {isProUser && (
              <CardContent>
                <div className="flex items-center justify-between pt-4 border-t border-yellow-200 dark:border-yellow-700/30">
                  <div>
                    <p className="text-gray-700 dark:text-gray-300 font-medium">
                      Status: <span className="text-green-600 dark:text-green-400 font-semibold capitalize">active</span>
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Billing managed through Stripe
                    </p>
                  </div>
                  <Button 
                    variant="outline" 
                    onClick={handleManageBilling}
                    disabled={loading}
                    className="glass-effect hover:bg-yellow-50 dark:hover:bg-yellow-900/20"
                  >
                    <CreditCard className="w-4 h-4 mr-2" />
                    {loading ? "Loading..." : "Manage Billing"}
                  </Button>
                </div>
              </CardContent>
            )}
          </Card>
        </motion.div>

        {/* Pricing Plans */}
        <motion.div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto mb-12" variants={itemVariants}>
          {/* Free Plan */}
          <motion.div
            whileHover={{ y: -5, scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <Card className={`h-full glass-effect border-none shadow-xl glow-effect ${
              convexUser?.subscriptionTier === "free" ? "ring-2 ring-gray-500 dark:ring-gray-400" : ""
            }`}>
              <CardHeader className="text-center pb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-gray-400 to-gray-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Zap className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">Free</CardTitle>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-gray-900 dark:text-white">$0</span>
                  <span className="text-lg text-gray-600 dark:text-gray-400 font-normal">/month</span>
                </div>
                <CardDescription className="text-base mt-3 text-gray-600 dark:text-gray-300">
                  Perfect for individuals getting started
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-3">
                  {[
                    "1 team",
                    "3 projects", 
                    "10 tasks per project",
                    "5MB file uploads",
                    "Email support"
                  ].map((feature, index) => (
                    <li key={index} className="flex items-center text-gray-700 dark:text-gray-300 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <div className="pt-4">
                  {convexUser?.subscriptionTier === "free" ? (
                    <Badge className="w-full text-center py-2 text-sm bg-gray-500 text-white">
                      <Star className="w-3 h-3 mr-1" />
                      Current Plan
                    </Badge>
                  ) : (
                    <Button variant="outline" className="w-full py-2 text-sm glass-effect" disabled>
                      Downgrade
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Starter Plan */}
          <motion.div
            whileHover={{ y: -5, scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <Card className={`h-full glass-effect border-none shadow-xl glow-effect ${
              convexUser?.subscriptionTier === "starter" ? "ring-2 ring-blue-500 dark:ring-blue-400" : ""
            }`}>
              <CardHeader className="text-center pb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Zap className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">Starter</CardTitle>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-blue-600">$12</span>
                  <span className="text-lg text-gray-600 dark:text-gray-400 font-normal">/month</span>
                </div>
                <CardDescription className="text-base mt-3 text-gray-600 dark:text-gray-300">
                  Great for small teams
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-3">
                  {[
                    "3 teams",
                    "10 projects", 
                    "50 tasks per project",
                    "25MB file uploads",
                    "Basic analytics",
                    "Email support"
                  ].map((feature, index) => (
                    <li key={index} className="flex items-center text-gray-700 dark:text-gray-300 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <div className="pt-4">
                  {convexUser?.subscriptionTier === "starter" ? (
                    <Badge className="w-full text-center py-2 text-sm bg-blue-500 text-white">
                      <Star className="w-3 h-3 mr-1" />
                      Current Plan
                    </Badge>
                  ) : (
                    <Button 
                      className="w-full py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white" 
                      onClick={() => handleSubscribe("starter")}
                      disabled={loading}
                    >
                      {loading ? "Loading..." : "Choose Starter"}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Pro Plan */}
          <motion.div
            whileHover={{ y: -5, scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300 }}
            className="relative"
          >
            {convexUser?.subscriptionTier !== "pro" && convexUser?.subscriptionTier !== "enterprise" && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
                <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white border-none px-3 py-1 text-xs">
                  <Sparkles className="w-3 h-3 mr-1" />
                  Popular
                </Badge>
              </div>
            )}
            <Card className={`h-full glass-effect border-none shadow-xl glow-effect ${
              convexUser?.subscriptionTier === "pro" 
                ? "ring-2 ring-purple-500 dark:ring-purple-400 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20" 
                : "ring-2 ring-purple-500 dark:ring-purple-400"
            }`}>
              <CardHeader className="text-center pb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-glow">
                  <Crown className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">Pro</CardTitle>
                <div className="mt-4">
                  <span className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    $29
                  </span>
                  <span className="text-lg text-gray-600 dark:text-gray-400 font-normal">/month</span>
                </div>
                <CardDescription className="text-base mt-3 text-gray-600 dark:text-gray-300">
                  Perfect for growing teams
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-3">
                  {[
                    "10 teams",
                    "50 projects",
                    "200 tasks per project", 
                    "100MB file uploads",
                    "Advanced analytics",
                    "Priority support",
                    "API access"
                  ].map((feature, index) => (
                    <li key={index} className="flex items-center text-gray-700 dark:text-gray-300 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <div className="pt-4">
                  {convexUser?.subscriptionTier === "pro" ? (
                    <Badge className="w-full text-center py-2 text-sm bg-gradient-to-r from-purple-500 to-pink-500 text-white border-none">
                      <Crown className="w-3 h-3 mr-1" />
                      Current Plan
                    </Badge>
                  ) : (
                    <Button 
                      className="w-full py-2 text-sm bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg" 
                      onClick={() => handleSubscribe("pro")}
                      disabled={loading}
                    >
                      {loading ? "Loading..." : "Choose Pro"}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Enterprise Plan */}
          <motion.div
            whileHover={{ y: -5, scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <Card className={`h-full glass-effect border-none shadow-xl glow-effect ${
              convexUser?.subscriptionTier === "enterprise" 
                ? "ring-2 ring-yellow-500 dark:ring-yellow-400 bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20" 
                : ""
            }`}>
              <CardHeader className="text-center pb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">Enterprise</CardTitle>
                <div className="mt-4">
                  <span className="text-4xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
                    $99
                  </span>
                  <span className="text-lg text-gray-600 dark:text-gray-400 font-normal">/month</span>
                </div>
                <CardDescription className="text-base mt-3 text-gray-600 dark:text-gray-300">
                  For large organizations
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-3">
                  {[
                    "Unlimited teams",
                    "Unlimited projects",
                    "Unlimited tasks", 
                    "500MB file uploads",
                    "Advanced security",
                    "Dedicated support",
                    "Custom integrations",
                    "SSO & compliance"
                  ].map((feature, index) => (
                    <li key={index} className="flex items-center text-gray-700 dark:text-gray-300 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <div className="pt-4">
                  {convexUser?.subscriptionTier === "enterprise" ? (
                    <Badge className="w-full text-center py-2 text-sm bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-none">
                      <Shield className="w-3 h-3 mr-1" />
                      Current Plan
                    </Badge>
                  ) : (
                    <Button 
                      className="w-full py-2 text-sm bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white shadow-lg" 
                      onClick={() => handleSubscribe("enterprise")}
                      disabled={loading}
                    >
                      {loading ? "Loading..." : "Choose Enterprise"}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        {/* Feature Comparison */}
        <motion.div variants={itemVariants}>
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-4">
              Feature Comparison
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              See exactly what&apos;s included in each plan
            </p>
          </div>
          <Card className="glass-effect border-none shadow-xl glow-effect">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="text-left p-4 font-bold text-base text-gray-900 dark:text-white">Feature</th>
                      <th className="text-center p-4 font-bold text-base text-gray-900 dark:text-white">
                        <div className="flex items-center justify-center">
                          <Zap className="w-4 h-4 mr-1 text-gray-500" />
                          Free
                        </div>
                      </th>
                      <th className="text-center p-4 font-bold text-base text-gray-900 dark:text-white">
                        <div className="flex items-center justify-center">
                          <Zap className="w-4 h-4 mr-1 text-blue-500" />
                          Starter
                        </div>
                      </th>
                      <th className="text-center p-4 font-bold text-base text-gray-900 dark:text-white">
                        <div className="flex items-center justify-center">
                          <Crown className="w-4 h-4 mr-1 text-purple-500" />
                          Pro
                        </div>
                      </th>
                      <th className="text-center p-4 font-bold text-base text-gray-900 dark:text-white">
                        <div className="flex items-center justify-center">
                          <Shield className="w-4 h-4 mr-1 text-yellow-500" />
                          Enterprise
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { feature: "Teams", free: "1", starter: "3", pro: "10", enterprise: "Unlimited" },
                      { feature: "Projects", free: "3", starter: "10", pro: "50", enterprise: "Unlimited" },
                      { feature: "Tasks per Project", free: "10", starter: "50", pro: "200", enterprise: "Unlimited" },
                      { feature: "File Upload Size", free: "5MB", starter: "25MB", pro: "100MB", enterprise: "500MB" },
                      { feature: "Storage", free: "1GB", starter: "10GB", pro: "100GB", enterprise: "1TB" },
                      { feature: "Analytics", free: "❌", starter: "Basic", pro: "Advanced", enterprise: "Advanced" },
                      { feature: "Priority Support", free: "❌", starter: "❌", pro: "✅", enterprise: "✅" },
                      { feature: "API Access", free: "❌", starter: "❌", pro: "✅", enterprise: "✅" },
                      { feature: "Advanced Security", free: "❌", starter: "❌", pro: "Basic", enterprise: "Advanced" },
                      { feature: "Custom Integrations", free: "❌", starter: "❌", pro: "✅", enterprise: "✅" }
                    ].map((row, index) => (
                      <tr key={index} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                        <td className="p-4 font-medium text-gray-900 dark:text-white text-sm">{row.feature}</td>
                        <td className="text-center p-4 text-gray-700 dark:text-gray-300 text-sm">{row.free}</td>
                        <td className="text-center p-4 text-gray-700 dark:text-gray-300 text-sm">{row.starter}</td>
                        <td className="text-center p-4 font-semibold text-purple-600 dark:text-purple-400 text-sm">{row.pro}</td>
                        <td className="text-center p-4 font-semibold text-yellow-600 dark:text-yellow-400 text-sm">{row.enterprise}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
}