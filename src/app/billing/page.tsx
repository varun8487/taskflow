"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/../convex/_generated/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  CheckCircle, 
  CreditCard, 
  Crown, 
  Zap,
  Shield,
  Users,
  BarChart3,
  Upload
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const isProUser = subscriptionStatus?.tier === "pro" && subscriptionStatus?.status === "active";

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Billing & Subscription</h1>
        <p className="text-gray-600">
          Manage your TaskFlow subscription and billing information.
        </p>
      </div>

      {/* Current Plan */}
      <div className="mb-8">
        <Card className={isProUser ? "border-blue-500 bg-blue-50" : "border-gray-200"}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {isProUser ? (
                  <Crown className="w-8 h-8 text-yellow-500" />
                ) : (
                  <Zap className="w-8 h-8 text-gray-500" />
                )}
                <div>
                  <CardTitle className="text-xl">
                    Current Plan: {isProUser ? "Pro" : "Starter"}
                  </CardTitle>
                  <CardDescription>
                    {isProUser 
                      ? "You have access to all premium features" 
                      : "You're on the free plan with limited features"
                    }
                  </CardDescription>
                </div>
              </div>
              <Badge variant={isProUser ? "default" : "secondary"} className="text-sm">
                {isProUser ? "Pro" : "Free"}
              </Badge>
            </div>
          </CardHeader>
          {isProUser && (
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">
                    Status: <span className="font-medium capitalize">{subscriptionStatus?.status}</span>
                  </p>
                </div>
                <Button 
                  variant="outline" 
                  onClick={handleManageBilling}
                  disabled={loading}
                >
                  <CreditCard className="w-4 h-4 mr-2" />
                  Manage Billing
                </Button>
              </div>
            </CardContent>
          )}
        </Card>
      </div>

      {/* Pricing Plans */}
      <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {/* Starter Plan */}
        <Card className={!isProUser ? "border-2 border-blue-500" : "border-gray-200"}>
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Zap className="w-8 h-8 text-gray-600" />
            </div>
            <CardTitle className="text-2xl">Starter</CardTitle>
            <div className="text-4xl font-bold text-gray-900 mt-4">
              Free
            </div>
            <CardDescription className="text-lg mt-2">
              Perfect for small teams getting started
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3 mb-6">
              <li className="flex items-center">
                <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                Up to 3 team members
              </li>
              <li className="flex items-center">
                <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                5 projects maximum
              </li>
              <li className="flex items-center">
                <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                Basic task management
              </li>
              <li className="flex items-center">
                <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                Real-time collaboration
              </li>
              <li className="flex items-center">
                <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                Email support
              </li>
            </ul>
            {!isProUser ? (
              <Badge className="w-full text-center py-2">Current Plan</Badge>
            ) : (
              <Button variant="outline" className="w-full" disabled>
                Downgrade (Contact Support)
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Pro Plan */}
        <Card className={isProUser ? "border-2 border-blue-500 shadow-xl" : "border-2 border-blue-500 shadow-xl relative"}>
          {!isProUser && (
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
              <Badge className="bg-blue-500">Recommended</Badge>
            </div>
          )}
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Crown className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl">Pro</CardTitle>
            <div className="text-4xl font-bold text-gray-900 mt-4">
              $19
              <span className="text-lg text-gray-600 font-normal">/month</span>
            </div>
            <CardDescription className="text-lg mt-2">
              For growing teams that need advanced features
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3 mb-6">
              <li className="flex items-center">
                <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                <Users className="w-4 h-4 mr-2" />
                Unlimited team members
              </li>
              <li className="flex items-center">
                <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                <Shield className="w-4 h-4 mr-2" />
                Unlimited projects
              </li>
              <li className="flex items-center">
                <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                <BarChart3 className="w-4 h-4 mr-2" />
                Advanced analytics & reports
              </li>
              <li className="flex items-center">
                <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                <Upload className="w-4 h-4 mr-2" />
                File uploads & sharing (10GB)
              </li>
              <li className="flex items-center">
                <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                Priority support
              </li>
              <li className="flex items-center">
                <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                Custom integrations
              </li>
            </ul>
            {isProUser ? (
              <Badge className="w-full text-center py-2">Current Plan</Badge>
            ) : (
              <Button 
                className="w-full" 
                onClick={handleSubscribe}
                disabled={loading}
              >
                {loading ? "Processing..." : "Upgrade to Pro"}
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Feature Comparison */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          Feature Comparison
        </h2>
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-4 font-semibold">Feature</th>
                    <th className="text-center p-4 font-semibold">Starter</th>
                    <th className="text-center p-4 font-semibold">Pro</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="p-4">Team Members</td>
                    <td className="text-center p-4">3</td>
                    <td className="text-center p-4">Unlimited</td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-4">Projects</td>
                    <td className="text-center p-4">5</td>
                    <td className="text-center p-4">Unlimited</td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-4">File Storage</td>
                    <td className="text-center p-4">100MB</td>
                    <td className="text-center p-4">10GB</td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-4">Analytics</td>
                    <td className="text-center p-4">Basic</td>
                    <td className="text-center p-4">Advanced</td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-4">Support</td>
                    <td className="text-center p-4">Email</td>
                    <td className="text-center p-4">Priority</td>
                  </tr>
                  <tr>
                    <td className="p-4">Custom Integrations</td>
                    <td className="text-center p-4">-</td>
                    <td className="text-center p-4">✅</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
