"use client";

// Force dynamic rendering to prevent prerendering issues with Convex
export const dynamic = 'force-dynamic';

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Target,
  Activity,
  ArrowUp,
  ArrowDown,
  Crown,
  Lock,
  Sparkles
} from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function AnalyticsPage() {
  const { user } = useUser();
  const [timeRange, setTimeRange] = useState("7d");
  
  // Mock subscription check - in real app this would come from Convex
  const isProUser = false; // For demo, set to false to show upgrade prompt
  
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Pro Feature Gate
  if (!isProUser) {
    return (
      <div className="p-6">
        <motion.div 
          className="max-w-4xl mx-auto text-center py-16"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="relative">
            <motion.div
              className="w-32 h-32 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full mx-auto mb-8 flex items-center justify-center shadow-2xl"
              animate={{ 
                boxShadow: [
                  "0 0 0 0 rgba(251, 191, 36, 0.4)",
                  "0 0 0 20px rgba(251, 191, 36, 0)",
                ]
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Crown className="w-16 h-16 text-white" />
            </motion.div>
            
            <motion.div
              className="absolute -top-4 -right-4 w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center"
              animate={{ rotate: 360 }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            >
              <Sparkles className="w-4 h-4 text-white" />
            </motion.div>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-6">
            Analytics Dashboard
          </h1>
          
          <div className="bg-gradient-to-r from-yellow-100 to-orange-100 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-2xl p-8 mb-8 border border-yellow-200 dark:border-yellow-800">
            <div className="flex items-center justify-center mb-4">
              <Lock className="w-8 h-8 text-yellow-600 dark:text-yellow-400 mr-3" />
              <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-none px-4 py-2 text-lg">
                <Crown className="w-4 h-4 mr-2" />
                Pro Feature
              </Badge>
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Unlock Advanced Analytics
            </h2>
            
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-6 max-w-2xl mx-auto">
              Get detailed insights into your team&apos;s performance, project analytics, 
              and advanced reporting features with our Pro plan.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              {[
                { icon: <BarChart3 className="w-6 h-6" />, title: "Performance Metrics", desc: "Track team productivity" },
                { icon: <TrendingUp className="w-6 h-6" />, title: "Trend Analysis", desc: "Identify patterns over time" },
                { icon: <Target className="w-6 h-6" />, title: "Goal Tracking", desc: "Monitor objective progress" }
              ].map((feature, index) => (
                <motion.div
                  key={feature.title}
                  className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg border border-gray-200 dark:border-gray-700"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: index * 0.1 + 0.3 }}
                >
                  <div className="text-yellow-600 dark:text-yellow-400 mb-2">{feature.icon}</div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{feature.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{feature.desc}</p>
                </motion.div>
              ))}
            </div>

            <Link href="/billing">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button 
                  size="lg" 
                  className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white border-none px-8 py-4 text-lg font-semibold shadow-xl"
                >
                  <Crown className="w-5 h-5 mr-2" />
                  Upgrade to Pro
                  <ArrowUp className="w-5 h-5 ml-2" />
                </Button>
              </motion.div>
            </Link>
          </div>

          <p className="text-gray-500 dark:text-gray-400">
            Already have Pro? <Link href="/billing" className="text-blue-600 hover:underline">Manage your subscription</Link>
          </p>
        </motion.div>
      </div>
    );
  }

  // Pro Analytics Dashboard (this would show if user is Pro)
  const analyticsData = [
    {
      title: "Total Projects",
      value: "24",
      change: "+12%",
      changeText: "vs last month",
      icon: <Target className="w-8 h-8" />,
      color: "from-blue-500 to-indigo-500",
      bgColor: "bg-blue-50 dark:bg-blue-950/20"
    },
    {
      title: "Active Users",
      value: "156",
      change: "+8%",
      changeText: "vs last week",
      icon: <Users className="w-8 h-8" />,
      color: "from-green-500 to-teal-500",
      bgColor: "bg-green-50 dark:bg-green-950/20"
    },
    {
      title: "Completion Rate",
      value: "84%",
      change: "+3%",
      changeText: "vs last month",
      icon: <TrendingUp className="w-8 h-8" />,
      color: "from-purple-500 to-pink-500",
      bgColor: "bg-purple-50 dark:bg-purple-950/20"
    },
    {
      title: "Team Productivity",
      value: "92%",
      change: "-2%",
      changeText: "vs last week",
      icon: <Activity className="w-8 h-8" />,
      color: "from-orange-500 to-red-500",
      bgColor: "bg-orange-50 dark:bg-orange-950/20"
    }
  ];

  return (
    <div className="px-6 pt-2 pb-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Analytics Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Track your team&apos;s performance and progress</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <select 
            value={timeRange} 
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
          
          <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-none">
            <Crown className="w-4 h-4 mr-1" />
            Pro Analytics
          </Badge>
        </div>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {analyticsData.map((metric) => (
          <motion.div
            key={metric.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -5, scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <Card className={`glass-effect border-none shadow-xl hover:shadow-2xl transition-all duration-300 ${metric.bgColor}`}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                      {metric.title}
                    </p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                      {metric.value}
                    </p>
                    <div className="flex items-center text-sm">
                      <span className={`font-semibold ${metric.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                        {metric.change.startsWith('+') ? <ArrowUp className="w-4 h-4 mr-1" /> : <ArrowDown className="w-4 h-4 mr-1" />}
                        {metric.change}
                      </span>
                      <span className="text-gray-500 dark:text-gray-400 ml-2">
                        {metric.changeText}
                      </span>
                    </div>
                  </div>
                  <div className={`w-16 h-16 rounded-xl bg-gradient-to-r ${metric.color} flex items-center justify-center text-white shadow-lg`}>
                    {metric.icon}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Charts and detailed analytics would go here */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="glass-effect border-none shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="w-5 h-5 mr-2" />
              Project Progress
            </CardTitle>
            <CardDescription>Track completion rates across projects</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center text-gray-500">
              [Chart Component Would Go Here]
            </div>
          </CardContent>
        </Card>

        <Card className="glass-effect border-none shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="w-5 h-5 mr-2" />
              Team Performance
            </CardTitle>
            <CardDescription>Monitor productivity trends over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center text-gray-500">
              [Chart Component Would Go Here]
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
