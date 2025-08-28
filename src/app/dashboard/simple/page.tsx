"use client";

import { useUser } from "@clerk/nextjs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  CheckCircle2, 
  Clock, 
  Plus,
  BarChart3,
  TrendingUp,
  Zap,
  Target,
  Activity,
  ArrowRight,
  Crown
} from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function SimpleDashboard() {
  const { user, isSignedIn, isLoaded } = useUser();

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <div className="text-center">
          <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full mx-auto mb-4 flex items-center justify-center animate-spin">
            <Zap className="w-10 h-10 text-white" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Loading...
          </h3>
          <p className="text-gray-600 dark:text-gray-300">
            Please wait while we load your dashboard
          </p>
        </div>
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <div className="text-center">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Please sign in
          </h3>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            You need to be signed in to access the dashboard
          </p>
          <Link href="/sign-in">
            <Button>Sign In</Button>
          </Link>
        </div>
      </div>
    );
  }

  // Mock data for demo
  const stats = [
    {
      title: "Total Tasks",
      value: "0",
      change: "+12%",
      changeText: "vs last week",
      icon: <Target className="w-8 h-8" />,
      color: "from-blue-500 to-cyan-500",
      bgColor: "bg-blue-50 dark:bg-blue-900/20"
    },
    {
      title: "Completed",
      value: "0",
      change: "+8%", 
      changeText: "vs last week",
      icon: <CheckCircle2 className="w-8 h-8" />,
      color: "from-green-500 to-emerald-500",
      bgColor: "bg-green-50 dark:bg-green-900/20"
    },
    {
      title: "In Progress",
      value: "0",
      change: "+3%",
      changeText: "vs last week", 
      icon: <Clock className="w-8 h-8" />,
      color: "from-orange-500 to-red-500",
      bgColor: "bg-orange-50 dark:bg-orange-900/20"
    },
    {
      title: "Completion Rate",
      value: "0%",
      change: "+5%",
      changeText: "vs last week",
      icon: <TrendingUp className="w-8 h-8" />,
      color: "from-purple-500 to-pink-500",
      bgColor: "bg-purple-50 dark:bg-purple-900/20"
    }
  ];

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
        {/* Welcome Section */}
        <motion.div className="mb-12" variants={itemVariants}>
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-4">
              Welcome back, {user.firstName || "there"}! 👋
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-6">
              Here&apos;s what&apos;s happening with your projects today.
            </p>
            <Badge className="text-lg px-6 py-3 glass-effect">
              <Zap className="w-5 h-5 mr-2" />
              Starter Plan
            </Badge>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.title}
              variants={itemVariants}
              whileHover={{ y: -5, scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Card className={`glass-effect border-none shadow-xl glow-effect hover:shadow-2xl transition-all duration-300 ${stat.bgColor}`}>
                <CardContent className="p-8">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-base font-semibold text-gray-600 dark:text-gray-400 mb-3 uppercase tracking-wide">
                        {stat.title}
                      </p>
                      <p className="text-5xl font-bold text-gray-900 dark:text-white mb-3 font-mono">
                        {stat.value}
                      </p>
                      <div className="flex items-center text-base">
                        <span className="text-green-600 dark:text-green-400 font-bold">
                          {stat.change}
                        </span>
                        <span className="text-gray-500 dark:text-gray-400 ml-2 font-medium">
                          {stat.changeText}
                        </span>
                      </div>
                    </div>
                    <div className={`w-20 h-20 rounded-2xl bg-gradient-to-r ${stat.color} flex items-center justify-center text-white animate-float ml-6 shadow-lg`}>
                      {stat.icon}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Quick Actions */}
        <motion.div className="mb-8" variants={itemVariants}>
          <Card className="glass-effect border-none shadow-xl glow-effect">
            <CardHeader>
              <CardTitle className="flex items-center text-gray-900 dark:text-white text-xl">
                <Zap className="w-6 h-6 mr-3 text-blue-600" />
                Quick Actions
              </CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-300">
                Get started with these common tasks
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  {
                    title: "Create Team",
                    description: "Invite members and start collaborating",
                    icon: <Users className="w-6 h-6" />,
                    href: "/teams/new",
                    color: "from-blue-500 to-cyan-500"
                  },
                  {
                    title: "View Analytics",
                    description: "Track your team's performance",
                    icon: <BarChart3 className="w-6 h-6" />,
                    href: "/analytics",
                    color: "from-purple-500 to-pink-500",
                    isPro: true
                  },
                  {
                    title: "Manage Billing",
                    description: "Update your subscription",
                    icon: <Crown className="w-6 h-6" />,
                    href: "/billing",
                    color: "from-yellow-500 to-orange-500"
                  }
                ].map((action, index) => (
                  <motion.div
                    key={action.title}
                    whileHover={{ y: -3, scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 + 0.5 }}
                  >
                    <Link href={action.href}>
                      <Card className="h-full glass-effect border-none hover:shadow-lg transition-all duration-300 cursor-pointer group">
                        <CardContent className="p-6">
                          <div className="flex items-start space-x-4">
                            <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${action.color} flex items-center justify-center text-white flex-shrink-0 group-hover:scale-110 transition-transform`}>
                              {action.icon}
                            </div>
                            <div className="flex-1">
                              <h3 className="font-semibold text-lg text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                {action.title}
                                {action.isPro && (
                                  <Badge className="ml-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-none text-xs">
                                    Pro
                                  </Badge>
                                )}
                              </h3>
                              <p className="text-gray-600 dark:text-gray-300 mt-1">
                                {action.description}
                              </p>
                            </div>
                            <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors group-hover:translate-x-1" />
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Debug Info */}
        <motion.div variants={itemVariants}>
          <Card className="glass-effect border-none shadow-xl glow-effect">
            <CardHeader>
              <CardTitle className="flex items-center text-gray-900 dark:text-white text-xl">
                <Activity className="w-6 h-6 mr-3 text-green-600" />
                System Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-300">Authentication</span>
                  <Badge className="bg-green-500 text-white">✅ Connected</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-300">User ID</span>
                  <span className="text-sm font-mono text-gray-900 dark:text-white">{user.id}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-300">Email</span>
                  <span className="text-sm text-gray-900 dark:text-white">{user.emailAddresses[0]?.emailAddress}</span>
                </div>
                <div className="pt-4 border-t">
                  <Link href="/debug">
                    <Button variant="outline" className="w-full">
                      View Debug Information
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
}
