"use client";

// Force dynamic rendering to prevent prerendering issues with Convex
export const dynamic = 'force-dynamic';

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@/../convex/_generated/api";
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
  Users,
  BarChart3,
  Upload,
  Sparkles,
  Star
} from "lucide-react";
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export default function BillingPage() {
  const { user } = useUser();
  const [loading, setLoading] = useState(false);

  const convexUser = useQuery(
    api.users.getUserByClerkId,
    user ? { clerkId: user.id } : "skip"
  );

  const subscriptionStatus = useQuery(
    api.users.getUserSubscriptionStatus,
    user ? { clerkId: user.id } : "skip"
  );

  const handleSubscribe = async () => {
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
          priceId: 'price_pro_monthly', // We'll create this in Stripe
        }),
      });

      const { sessionId } = await response.json();
      
      const stripe = await stripePromise;
      if (stripe) {
        const { error } = await stripe.redirectToCheckout({ sessionId });
        if (error) {
          console.error('Stripe error:', error);
        }
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleManageBilling = async () => {
    if (!subscriptionStatus?.stripeCustomerId) return;
    
    setLoading(true);
    try {
      const response = await fetch('/api/stripe/create-portal-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerId: subscriptionStatus.stripeCustomerId,
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

  const isProUser = subscriptionStatus?.tier === "pro" && subscriptionStatus?.status === "active";

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
                      Status: <span className="text-green-600 dark:text-green-400 font-semibold capitalize">{subscriptionStatus?.status}</span>
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
        <motion.div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto mb-12" variants={itemVariants}>
          {/* Starter Plan */}
          <motion.div
            whileHover={{ y: -5, scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <Card className={`h-full glass-effect border-none shadow-xl glow-effect ${
              !isProUser ? "ring-2 ring-blue-500 dark:ring-blue-400" : ""
            }`}>
              <CardHeader className="text-center pb-6">
                <div className="w-20 h-20 bg-gradient-to-r from-gray-500 to-gray-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Zap className="w-10 h-10 text-white" />
                </div>
                <CardTitle className="text-3xl font-bold text-gray-900 dark:text-white">Starter</CardTitle>
                <div className="mt-6">
                  <span className="text-5xl font-bold text-gray-900 dark:text-white">Free</span>
                </div>
                <CardDescription className="text-lg mt-4 text-gray-600 dark:text-gray-300">
                  Perfect for small teams getting started
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <ul className="space-y-4">
                  {[
                    "Up to 3 team members",
                    "5 projects maximum", 
                    "Basic task management",
                    "Real-time collaboration",
                    "Email support"
                  ].map((feature, index) => (
                    <li key={index} className="flex items-center text-gray-700 dark:text-gray-300">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                      <span className="font-medium">{feature}</span>
                    </li>
                  ))}
                </ul>
                <div className="pt-6">
                  {!isProUser ? (
                    <Badge className="w-full text-center py-3 text-lg bg-blue-500 hover:bg-blue-600">
                      <Star className="w-4 h-4 mr-2" />
                      Current Plan
                    </Badge>
                  ) : (
                    <Button variant="outline" className="w-full py-3 text-lg glass-effect" disabled>
                      Downgrade (Contact Support)
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
            {!isProUser && (
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-white border-none px-4 py-2 text-sm">
                  <Sparkles className="w-4 h-4 mr-1" />
                  Recommended
                </Badge>
              </div>
            )}
            <Card className={`h-full glass-effect border-none shadow-xl glow-effect ${
              isProUser 
                ? "ring-2 ring-yellow-500 dark:ring-yellow-400 bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20" 
                : "ring-2 ring-blue-500 dark:ring-blue-400"
            }`}>
              <CardHeader className="text-center pb-6">
                <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 animate-glow">
                  <Crown className="w-10 h-10 text-white" />
                </div>
                <CardTitle className="text-3xl font-bold text-gray-900 dark:text-white">Pro</CardTitle>
                <div className="mt-6">
                  <span className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    $29
                  </span>
                  <span className="text-xl text-gray-600 dark:text-gray-400 font-normal">/month</span>
                </div>
                <CardDescription className="text-lg mt-4 text-gray-600 dark:text-gray-300">
                  For growing teams that need advanced features
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <ul className="space-y-4">
                  {[
                    { text: "Unlimited team members", icon: <Users className="w-4 h-4" /> },
                    { text: "Unlimited projects", icon: <Shield className="w-4 h-4" /> },
                    { text: "Advanced analytics & reports", icon: <BarChart3 className="w-4 h-4" /> },
                    { text: "File uploads & sharing (10GB)", icon: <Upload className="w-4 h-4" /> },
                    { text: "Priority support", icon: <Crown className="w-4 h-4" /> },
                    { text: "Custom integrations", icon: <Sparkles className="w-4 h-4" /> }
                  ].map((feature, index) => (
                    <li key={index} className="flex items-center text-gray-700 dark:text-gray-300">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                      <div className="flex items-center">
                        <span className="text-blue-500 mr-2">{feature.icon}</span>
                        <span className="font-medium">{feature.text}</span>
                      </div>
                    </li>
                  ))}
                </ul>
                <div className="pt-6">
                  {isProUser ? (
                    <Badge className="w-full text-center py-3 text-lg bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-none">
                      <Crown className="w-4 h-4 mr-2" />
                      Current Plan
                    </Badge>
                  ) : (
                    <Button 
                      className="w-full py-3 text-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg glow-effect" 
                      onClick={handleSubscribe}
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            className="mr-2"
                          >
                            <Sparkles className="w-4 h-4" />
                          </motion.div>
                          Processing...
                        </>
                      ) : (
                        <>
                          <Crown className="w-4 h-4 mr-2" />
                          Upgrade to Pro
                        </>
                      )}
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
                      <th className="text-left p-6 font-bold text-lg text-gray-900 dark:text-white">Feature</th>
                      <th className="text-center p-6 font-bold text-lg text-gray-900 dark:text-white">
                        <div className="flex items-center justify-center">
                          <Zap className="w-5 h-5 mr-2 text-gray-500" />
                          Starter
                        </div>
                      </th>
                      <th className="text-center p-6 font-bold text-lg text-gray-900 dark:text-white">
                        <div className="flex items-center justify-center">
                          <Crown className="w-5 h-5 mr-2 text-yellow-500" />
                          Pro
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { feature: "Team Members", starter: "3", pro: "Unlimited" },
                      { feature: "Projects", starter: "5", pro: "Unlimited" },
                      { feature: "File Storage", starter: "100MB", pro: "10GB" },
                      { feature: "Analytics", starter: "Basic", pro: "Advanced" },
                      { feature: "Support", starter: "Email", pro: "Priority" },
                      { feature: "Custom Integrations", starter: "❌", pro: "✅" }
                    ].map((row, index) => (
                      <tr key={index} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                        <td className="p-6 font-medium text-gray-900 dark:text-white">{row.feature}</td>
                        <td className="text-center p-6 text-gray-700 dark:text-gray-300">{row.starter}</td>
                        <td className="text-center p-6 font-semibold text-blue-600 dark:text-blue-400">{row.pro}</td>
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