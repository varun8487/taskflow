"use client";

import { useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/../convex/_generated/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import ErrorBoundary from "@/components/ErrorBoundary";
import { ThemeToggle } from "@/components/ThemeToggle";
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
  Sparkles,
  Crown
} from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

function DashboardPageContent() {
  const { user } = useUser();
  const createUser = useMutation(api.users.createUser);
  
  useEffect(() => {
    if (user) {
      createUser({
        clerkId: user.id,
        email: user.emailAddresses[0]?.emailAddress || "",
        name: user.fullName || user.emailAddresses[0]?.emailAddress || "",
        avatar: user.imageUrl,
      });
    }
  }, [user, createUser]);

  // Re-enabled Convex queries with JWT template configured
  const convexUser = useQuery(api.users.getUserByClerkId, user ? { clerkId: user.id } : "skip");
  const teams = useQuery(api.teams.getTeamsByUser, convexUser ? { userId: convexUser._id } : "skip");
  const userTasks = useQuery(api.tasks.getTasksByUser, convexUser ? { userId: convexUser._id } : "skip");

  if (!user) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
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
              <Zap className="w-10 h-10 text-white" />
            </motion.div>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Loading your workspace
          </h3>
          <p className="text-gray-600 dark:text-gray-300">
            Please wait while we prepare everything for you
          </p>
        </motion.div>
      </div>
    );
  }

  // Show loading while convex user is being fetched
  if (user && convexUser === undefined) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
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
              <Sparkles className="w-10 h-10 text-white" />
            </motion.div>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Loading dashboard...
          </h3>
          <p className="text-gray-600 dark:text-gray-300">
            Setting up your personalized experience
          </p>
        </motion.div>
      </div>
    );
  }

  const isProUser = convexUser?.subscriptionTier === "pro";
  
  const completedTasks = userTasks?.filter(task => task.status === "completed").length || 0;
  const pendingTasks = userTasks?.filter(task => task.status !== "completed").length || 0;
  const totalTasks = completedTasks + pendingTasks;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

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
    <div className="min-h-screen gradient-bg">
      {/* Header */}
      <motion.header 
        className="glass-effect border-b sticky top-0 z-50"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <motion.div 
                className="flex items-center space-x-2"
                whileHover={{ scale: 1.05 }}
              >
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center animate-glow">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  TaskFlow
                </span>
              </motion.div>
              <div className="h-8 w-px bg-gray-300 dark:bg-gray-600" />
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5, type: "spring" }}
              >
                <Badge 
                  variant={isProUser ? "default" : "secondary"} 
                  className={`${
                    isProUser 
                      ? "bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-none" 
                      : "glass-effect"
                  }`}
                >
                  {isProUser ? (
                    <>
                      <Crown className="w-3 h-3 mr-1" />
                      Pro
                    </>
                  ) : (
                    "Starter"
                  )}
                </Badge>
              </motion.div>
            </div>
            
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link href="/settings">
                  <Button variant="ghost" size="sm">
                    <img
                      src={user.imageUrl}
                      alt={user.fullName || "Profile"}
                      className="w-8 h-8 rounded-full"
                    />
                  </Button>
                </Link>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Welcome Section */}
          <motion.div className="mb-8" variants={itemVariants}>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-2">
              Welcome back, {user.firstName || "there"}! 👋
            </h2>
            <p className="text-gray-600 dark:text-gray-300 text-lg">
              Here&apos;s what&apos;s happening with your projects today.
            </p>
          </motion.div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[
              {
                title: "Total Tasks",
                value: totalTasks,
                icon: <Target className="w-6 h-6" />,
                color: "from-blue-500 to-cyan-500",
                change: "+12%"
              },
              {
                title: "Completed",
                value: completedTasks,
                icon: <CheckCircle2 className="w-6 h-6" />,
                color: "from-green-500 to-emerald-500",
                change: "+8%"
              },
              {
                title: "In Progress",
                value: pendingTasks,
                icon: <Clock className="w-6 h-6" />,
                color: "from-orange-500 to-red-500",
                change: "+3%"
              },
              {
                title: "Completion Rate",
                value: `${completionRate}%`,
                icon: <TrendingUp className="w-6 h-6" />,
                color: "from-purple-500 to-pink-500",
                change: "+5%"
              }
            ].map((stat, index) => (
              <motion.div
                key={stat.title}
                variants={itemVariants}
                whileHover={{ y: -5, scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Card className="glass-effect border-none shadow-xl glow-effect hover:shadow-2xl transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                          {stat.title}
                        </p>
                        <p className="text-3xl font-bold text-gray-900 dark:text-white">
                          {stat.value}
                        </p>
                        <div className="flex items-center mt-2">
                          <span className="text-sm text-green-600 dark:text-green-400 font-medium">
                            {stat.change}
                          </span>
                          <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">
                            from last week
                          </span>
                        </div>
                      </div>
                      <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${stat.color} flex items-center justify-center text-white animate-float`}>
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
                <CardTitle className="flex items-center text-gray-900 dark:text-white">
                  <Zap className="w-5 h-5 mr-2" />
                  Quick Actions
                </CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-300">
                  Get started with these common tasks
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    {
                      title: "Create Team",
                      description: "Invite members and start collaborating",
                      icon: <Users className="w-5 h-5" />,
                      href: "/teams/new",
                      color: "from-blue-500 to-cyan-500"
                    },
                    {
                      title: "View Analytics",
                      description: "Track your team's performance",
                      icon: <BarChart3 className="w-5 h-5" />,
                      href: "/analytics",
                      color: "from-purple-500 to-pink-500",
                      isPro: true
                    },
                    {
                      title: "Manage Billing",
                      description: "Update your subscription",
                      icon: <Crown className="w-5 h-5" />,
                      href: "/billing",
                      color: "from-yellow-500 to-orange-500"
                    }
                  ].map((action, index) => (
                    <motion.div
                      key={action.title}
                      whileHover={{ y: -2, scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Link href={action.href}>
                        <Card className="h-full glass-effect border-none hover:shadow-lg transition-all duration-300 cursor-pointer group">
                          <CardContent className="p-4">
                            <div className="flex items-start space-x-3">
                              <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${action.color} flex items-center justify-center text-white flex-shrink-0`}>
                                {action.icon}
                              </div>
                              <div className="flex-1">
                                <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                  {action.title}
                                  {action.isPro && !isProUser && (
                                    <Badge className="ml-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-none text-xs">
                                      Pro
                                    </Badge>
                                  )}
                                </h3>
                                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                                  {action.description}
                                </p>
                              </div>
                              <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
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

          {/* Teams and Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Teams */}
            <motion.div variants={itemVariants}>
              <Card className="glass-effect border-none shadow-xl glow-effect h-full">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center text-gray-900 dark:text-white">
                      <Users className="w-5 h-5 mr-2" />
                      My Teams ({teams && teams.length > 0 ? teams.length : 0})
                    </CardTitle>
                    <Link href="/teams">
                      <Button variant="ghost" size="sm" className="hover:bg-blue-50 dark:hover:bg-gray-800">
                        View All
                        <ArrowRight className="w-4 h-4 ml-1" />
                      </Button>
                    </Link>
                  </div>
                </CardHeader>
                <CardContent>
                  {teams && teams.length > 0 ? (
                    <div className="space-y-3">
                      {teams.slice(0, 3).map((team) => (
                        <motion.div
                          key={team._id}
                          className="flex items-center space-x-3 p-3 glass-effect rounded-lg hover:bg-blue-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                          whileHover={{ x: 5 }}
                          initial={{ x: -20, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          transition={{ delay: 0.1 }}
                        >
                          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center text-white font-semibold">
                            {team.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1">
                            <h3 className="font-medium text-gray-900 dark:text-white">{team.name}</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {team.memberIds?.length || 0} members
                            </p>
                          </div>
                          <Badge variant="outline" className="glass-effect">
                            Active
                          </Badge>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                        No teams yet
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300 mb-4">
                        Create your first team to start collaborating
                      </p>
                      <Link href="/teams/new">
                        <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">
                          <Plus className="w-4 h-4 mr-2" />
                          Create Team
                        </Button>
                      </Link>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Recent Activity */}
            <motion.div variants={itemVariants}>
              <Card className="glass-effect border-none shadow-xl glow-effect h-full">
                <CardHeader>
                  <CardTitle className="flex items-center text-gray-900 dark:text-white">
                    <Activity className="w-5 h-5 mr-2" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      {
                        action: "Created new task",
                        target: "Design homepage",
                        time: "2 hours ago",
                        color: "from-green-500 to-emerald-500"
                      },
                      {
                        action: "Completed task",
                        target: "Review wireframes",
                        time: "4 hours ago",
                        color: "from-blue-500 to-cyan-500"
                      },
                      {
                        action: "Updated project",
                        target: "TaskFlow v2.0",
                        time: "Yesterday",
                        color: "from-purple-500 to-pink-500"
                      }
                    ].map((activity, activityIndex) => (
                      <motion.div
                        key={activityIndex}
                        className="flex items-center space-x-3"
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: activityIndex * 0.1 + 0.5 }}
                      >
                        <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${activity.color}`} />
                        <div className="flex-1">
                          <p className="text-sm text-gray-900 dark:text-white">
                            <span className="font-medium">{activity.action}</span>{" "}
                            <span className="text-gray-600 dark:text-gray-300">{activity.target}</span>
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {activity.time}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <ErrorBoundary>
      <DashboardPageContent />
    </ErrorBoundary>
  );
}