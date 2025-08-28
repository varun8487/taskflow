"use client";

// Force dynamic rendering to prevent prerendering issues with Convex
export const dynamic = 'force-dynamic';
import { useUser } from "@clerk/nextjs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import ErrorBoundary from "@/components/ErrorBoundary";
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
import AuthTestWrapper from "@/components/AuthTestWrapper";

function DashboardPageContent() {
  const { user } = useUser();
  
  // Temporarily disable Convex queries to fix build issues
  // const createUser = useMutation(api.users.createUser);
  // const convexUser = useQuery(api.users.getUserByClerkId, user ? { clerkId: user.id } : "skip");
  // const teams = useQuery(api.teams.getTeamsByUser, convexUser ? { userId: convexUser._id } : "skip");
  // const userTasks = useQuery(api.tasks.getTasksByUser, convexUser ? { userId: convexUser._id } : "skip");
  
  // Mock data for now - Default to free plan
  const convexUser = { subscriptionTier: "free" };
  const teams: unknown[] = [];
  // const userTasks: unknown[] = []; // Removed unused variable

  if (!user) {
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
  
  // Mock data calculations
  const completedTasks = 0;
  const pendingTasks = 0;
  const totalTasks = 0;
  const completionRate = 0;

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
    <div className="min-h-screen px-8 py-6 space-y-8">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-8"
      >
        {/* Professional Welcome Section */}
        <motion.div variants={itemVariants} className="mb-10">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="mb-6 lg:mb-0">
              <h1 className="text-3xl lg:text-4xl font-bold text-gradient mb-3 tracking-tight">
                Welcome back, {user.firstName || "there"}
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl">
                Here&apos;s your productivity overview for today. Stay focused and achieve your goals.
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Badge 
                variant={isProUser ? "default" : "secondary"} 
                className={`px-4 py-2 text-sm font-medium ${
                  isProUser 
                    ? "bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-lg" 
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {isProUser ? (
                  <>
                    <Crown className="w-4 h-4 mr-2" />
                    Pro Plan
                  </>
                ) : convexUser?.subscriptionTier === "starter" ? (
                  <>
                    <Zap className="w-4 h-4 mr-2" />
                    Starter Plan
                  </>
                ) : convexUser?.subscriptionTier === "enterprise" ? (
                  <>
                    <Crown className="w-4 h-4 mr-2" />
                    Enterprise Plan
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 mr-2" />
                    Free Plan
                  </>
                )}
              </Badge>
              <div className="text-sm text-muted-foreground">
                {new Date().toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            {
              title: "Total Tasks",
              value: totalTasks.toString(),
              change: "+12%",
              changeText: "vs last week",
              icon: <Target className="w-8 h-8" />,
              color: "from-blue-500 to-cyan-500",
              bgColor: "bg-blue-50 dark:bg-blue-900/20"
            },
            {
              title: "Completed",
              value: completedTasks.toString(),
              change: "+8%", 
              changeText: "vs last week",
              icon: <CheckCircle2 className="w-8 h-8" />,
              color: "from-green-500 to-emerald-500",
              bgColor: "bg-green-50 dark:bg-green-900/20"
            },
            {
              title: "In Progress",
              value: pendingTasks.toString(),
              change: "+3%",
              changeText: "vs last week", 
              icon: <Clock className="w-8 h-8" />,
              color: "from-orange-500 to-red-500",
              bgColor: "bg-orange-50 dark:bg-orange-900/20"
            },
            {
              title: "Completion Rate",
              value: `${completionRate}%`,
              change: "+5%",
              changeText: "vs last week",
              icon: <TrendingUp className="w-8 h-8" />,
              color: "from-purple-500 to-pink-500",
              bgColor: "bg-purple-50 dark:bg-purple-900/20"
            }
          ].map((stat) => (
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
                                {action.isPro && !isProUser && (
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

        {/* Teams and Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Teams */}
          <motion.div variants={itemVariants}>
            <Card className="glass-effect border-none shadow-xl glow-effect h-full">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center text-gray-900 dark:text-white text-xl">
                    <Users className="w-6 h-6 mr-3 text-purple-600" />
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
                    <div className="space-y-4">
                      {/* Teams will be shown here when Convex is enabled */}
                      <p className="text-gray-600 dark:text-gray-300">Teams will appear here once connected to database.</p>
                    </div>
                  ) : (
                  <div className="text-center py-12">
                    <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                      No teams yet
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-6">
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
                <CardTitle className="flex items-center text-gray-900 dark:text-white text-xl">
                  <Activity className="w-6 h-6 mr-3 text-green-600" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {[
                    {
                      action: "Created new task",
                      target: "Design homepage",
                      time: "2 hours ago",
                      color: "from-green-500 to-emerald-500",
                      avatar: "JD"
                    },
                    {
                      action: "Completed task",
                      target: "Review wireframes",
                      time: "4 hours ago",
                      color: "from-blue-500 to-cyan-500",
                      avatar: "SM"
                    },
                    {
                      action: "Updated project",
                      target: "TaskFlow v2.0",
                      time: "Yesterday",
                      color: "from-purple-500 to-pink-500",
                      avatar: "MW"
                    },
                    {
                      action: "Added team member",
                      target: "Development Team",
                      time: "2 days ago",
                      color: "from-orange-500 to-red-500",
                      avatar: "AB"
                    }
                  ].map((activity, activityIndex) => (
                    <motion.div
                      key={activityIndex}
                      className="flex items-center space-x-4"
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: activityIndex * 0.1 + 0.5 }}
                    >
                      <div className={`w-10 h-10 rounded-full bg-gradient-to-r ${activity.color} flex items-center justify-center text-white font-semibold text-sm`}>
                        {activity.avatar}
                      </div>
                      <div className="flex-1">
                        <p className="text-gray-900 dark:text-white font-medium">
                          <span className="font-semibold">{activity.action}</span>{" "}
                          <span className="text-gray-600 dark:text-gray-300">{activity.target}</span>
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
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
    </div>
  );
}

export default function DashboardPage() {
  return (
    <AuthTestWrapper>
      <ErrorBoundary>
        <DashboardPageContent />
      </ErrorBoundary>
    </AuthTestWrapper>
  );
}