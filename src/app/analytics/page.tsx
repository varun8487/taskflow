"use client";

import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@/../convex/_generated/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FeatureGate } from "@/components/FeatureGate";
import { motion } from "framer-motion";
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  CheckCircle2, 
  Target,
  Activity,
  Calendar,
  Zap,
  Crown
} from "lucide-react";

export default function AnalyticsPage() {
  const { user } = useUser();

  const convexUser = useQuery(
    api.users.getUserByClerkId,
    user ? { clerkId: user.id } : "skip"
  );

  const teams = useQuery(
    api.teams.getTeamsByUser,
    convexUser ? { userId: convexUser._id } : "skip"
  );

  const analytics = useQuery(
    api.analytics.getTeamAnalytics,
    convexUser && teams?.[0] ? { teamId: teams[0]._id } : "skip"
  );

  if (!user || !convexUser) {
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
              <BarChart3 className="w-10 h-10 text-white" />
            </motion.div>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Loading analytics...
          </h3>
          <p className="text-gray-600 dark:text-gray-300">
            Preparing your insights
          </p>
        </motion.div>
      </div>
    );
  }

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

  // Mock analytics data for demo
  const analyticsData = {
    totalTasks: 127,
    completedTasks: 89,
    activeTasks: 38,
    teamMembers: 12,
    completionRate: 70,
    productivity: 85,
    weeklyGrowth: 15,
    monthlyGrowth: 45,
  };

  return (
    <FeatureGate feature="analyticsAccess" requiredTier="starter">
      <div className="min-h-screen gradient-bg">
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {/* Header */}
            <motion.div className="mb-8" variants={itemVariants}>
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-2">
                    Analytics Dashboard
                  </h1>
                  <p className="text-gray-600 dark:text-gray-300 text-lg">
                    Insights into your team&apos;s performance and productivity
                  </p>
                </div>
                <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-none">
                  <Crown className="w-4 h-4 mr-2" />
                  Pro Feature
                </Badge>
              </div>
            </motion.div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[
                {
                  title: "Total Tasks",
                  value: analyticsData.totalTasks,
                  change: `+${analyticsData.weeklyGrowth}%`,
                  icon: <Target className="w-6 h-6" />,
                  color: "from-blue-500 to-cyan-500"
                },
                {
                  title: "Completed",
                  value: analyticsData.completedTasks,
                  change: `+${analyticsData.monthlyGrowth}%`,
                  icon: <CheckCircle2 className="w-6 h-6" />,
                  color: "from-green-500 to-emerald-500"
                },
                {
                  title: "Team Members",
                  value: analyticsData.teamMembers,
                  change: "+2 this month",
                  icon: <Users className="w-6 h-6" />,
                  color: "from-purple-500 to-pink-500"
                },
                {
                  title: "Productivity",
                  value: `${analyticsData.productivity}%`,
                  change: "+12% vs last month",
                  icon: <TrendingUp className="w-6 h-6" />,
                  color: "from-orange-500 to-red-500"
                }
              ].map((metric, index) => (
                <motion.div
                  key={metric.title}
                  variants={itemVariants}
                  whileHover={{ y: -5, scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Card className="glass-effect border-none shadow-xl glow-effect hover:shadow-2xl transition-all duration-300">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                            {metric.title}
                          </p>
                          <p className="text-3xl font-bold text-gray-900 dark:text-white">
                            {metric.value}
                          </p>
                          <p className="text-sm text-green-600 dark:text-green-400 mt-2">
                            {metric.change}
                          </p>
                        </div>
                        <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${metric.color} flex items-center justify-center text-white animate-float`}>
                          {metric.icon}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Analytics Tabs */}
            <motion.div variants={itemVariants}>
              <Tabs defaultValue="overview" className="space-y-6">
                <TabsList className="glass-effect border-none">
                  <TabsTrigger value="overview" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white">
                    Overview
                  </TabsTrigger>
                  <TabsTrigger value="performance" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white">
                    Performance
                  </TabsTrigger>
                  <TabsTrigger value="team" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white">
                    Team Insights
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Completion Rate */}
                    <Card className="glass-effect border-none shadow-xl glow-effect">
                      <CardHeader>
                        <CardTitle className="flex items-center text-gray-900 dark:text-white">
                          <Activity className="w-5 h-5 mr-2" />
                          Completion Rate
                        </CardTitle>
                        <CardDescription className="text-gray-600 dark:text-gray-300">
                          Task completion over time
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              Overall Progress
                            </span>
                            <span className="text-2xl font-bold text-gray-900 dark:text-white">
                              {analyticsData.completionRate}%
                            </span>
                          </div>
                          <Progress 
                            value={analyticsData.completionRate} 
                            className="h-3"
                          />
                          <div className="grid grid-cols-2 gap-4 pt-4">
                            <div className="text-center">
                              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                                {analyticsData.completedTasks}
                              </p>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                Completed
                              </p>
                            </div>
                            <div className="text-center">
                              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                {analyticsData.activeTasks}
                              </p>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                In Progress
                              </p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Weekly Activity */}
                    <Card className="glass-effect border-none shadow-xl glow-effect">
                      <CardHeader>
                        <CardTitle className="flex items-center text-gray-900 dark:text-white">
                          <Calendar className="w-5 h-5 mr-2" />
                          Weekly Activity
                        </CardTitle>
                        <CardDescription className="text-gray-600 dark:text-gray-300">
                          Task activity this week
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {[
                            { day: "Monday", tasks: 12, completed: 8 },
                            { day: "Tuesday", tasks: 15, completed: 12 },
                            { day: "Wednesday", tasks: 10, completed: 7 },
                            { day: "Thursday", tasks: 18, completed: 15 },
                            { day: "Friday", tasks: 14, completed: 10 },
                          ].map((day, index) => (
                            <div key={day.day} className="flex items-center space-x-4">
                              <span className="w-16 text-sm font-medium text-gray-700 dark:text-gray-300">
                                {day.day}
                              </span>
                              <div className="flex-1">
                                <div className="flex items-center space-x-2">
                                  <Progress 
                                    value={(day.completed / day.tasks) * 100} 
                                    className="flex-1 h-2"
                                  />
                                  <span className="text-sm text-gray-600 dark:text-gray-400 w-16">
                                    {day.completed}/{day.tasks}
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="performance" className="space-y-6">
                  <Card className="glass-effect border-none shadow-xl glow-effect">
                    <CardHeader>
                      <CardTitle className="flex items-center text-gray-900 dark:text-white">
                        <TrendingUp className="w-5 h-5 mr-2" />
                        Performance Metrics
                      </CardTitle>
                      <CardDescription className="text-gray-600 dark:text-gray-300">
                        Detailed performance analysis
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[
                          {
                            metric: "Avg. Task Duration",
                            value: "2.3 days",
                            trend: "↓ 15%",
                            trendColor: "text-green-600"
                          },
                          {
                            metric: "Team Velocity",
                            value: "23 tasks/week",
                            trend: "↑ 8%",
                            trendColor: "text-green-600"
                          },
                          {
                            metric: "Quality Score",
                            value: "94%",
                            trend: "↑ 3%",
                            trendColor: "text-green-600"
                          }
                        ].map((item, index) => (
                          <div key={item.metric} className="text-center p-4 glass-effect rounded-lg">
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                              {item.metric}
                            </p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                              {item.value}
                            </p>
                            <p className={`text-sm font-medium ${item.trendColor}`}>
                              {item.trend}
                            </p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="team" className="space-y-6">
                  <Card className="glass-effect border-none shadow-xl glow-effect">
                    <CardHeader>
                      <CardTitle className="flex items-center text-gray-900 dark:text-white">
                        <Users className="w-5 h-5 mr-2" />
                        Team Performance
                      </CardTitle>
                      <CardDescription className="text-gray-600 dark:text-gray-300">
                        Individual team member insights
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {[
                          { name: "John Doe", tasks: 23, completed: 18, avatar: "JD" },
                          { name: "Jane Smith", tasks: 19, completed: 16, avatar: "JS" },
                          { name: "Mike Johnson", tasks: 15, completed: 12, avatar: "MJ" },
                          { name: "Sarah Wilson", tasks: 21, completed: 19, avatar: "SW" },
                        ].map((member, index) => (
                          <div key={member.name} className="flex items-center space-x-4 p-3 glass-effect rounded-lg">
                            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                              {member.avatar}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-2">
                                <span className="font-medium text-gray-900 dark:text-white">
                                  {member.name}
                                </span>
                                <span className="text-sm text-gray-600 dark:text-gray-400">
                                  {member.completed}/{member.tasks} tasks
                                </span>
                              </div>
                              <Progress 
                                value={(member.completed / member.tasks) * 100} 
                                className="h-2"
                              />
                            </div>
                            <div className="text-right">
                              <span className="text-lg font-bold text-gray-900 dark:text-white">
                                {Math.round((member.completed / member.tasks) * 100)}%
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </motion.div>
          </motion.div>
        </main>
      </div>
    </FeatureGate>
  );
}