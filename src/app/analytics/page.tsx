"use client";

import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@/../convex/_generated/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  CheckCircle2, 
  Target,
  Crown,
  Lock
} from "lucide-react";
import Link from "next/link";
import { useSubscription } from "@/lib/subscription";
import { Button } from "@/components/ui/button";

export default function AnalyticsPage() {
  const { user } = useUser();
  const { isPro } = useSubscription();

  const convexUser = useQuery(
    api.users.getUserByClerkId,
    user ? { clerkId: user.id } : "skip"
  );

  const teams = useQuery(
    api.teams.getTeamsByUser,
    convexUser ? { userId: convexUser._id } : "skip"
  );

  if (!user || !convexUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isPro) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <Lock className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Advanced Analytics</h1>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Get detailed insights into your team&apos;s productivity, project progress, and performance metrics with Pro analytics.
          </p>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <Card className="opacity-75">
              <CardHeader className="text-center">
                <BarChart3 className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <CardTitle className="text-lg">Team Performance</CardTitle>
                <CardDescription>Track completion rates and productivity trends</CardDescription>
              </CardHeader>
            </Card>
            
            <Card className="opacity-75">
              <CardHeader className="text-center">
                <TrendingUp className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <CardTitle className="text-lg">Project Insights</CardTitle>
                <CardDescription>Monitor project progress and bottlenecks</CardDescription>
              </CardHeader>
            </Card>
            
            <Card className="opacity-75">
              <CardHeader className="text-center">
                <Target className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                <CardTitle className="text-lg">Goal Tracking</CardTitle>
                <CardDescription>Set and track team and individual goals</CardDescription>
              </CardHeader>
            </Card>
          </div>

          <Card className="border-blue-200 bg-blue-50 max-w-md mx-auto">
            <CardContent className="pt-6 text-center">
              <Crown className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-blue-900 mb-2">Unlock Advanced Analytics</h3>
              <p className="text-blue-800 text-sm mb-4">
                Upgrade to Pro to access detailed analytics, custom reports, and team insights.
              </p>
              <Link href="/billing">
                <Button className="w-full">
                  Upgrade to Pro
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Mock data for Pro users (in a real app, this would come from the analytics API)
  const mockAnalytics = {
    totalTasks: 156,
    completedTasks: 134,
    tasksInProgress: 22,
    completionRate: 86,
    activeProjects: 8,
    teamMembers: teams?.reduce((acc, team) => acc + team.memberIds.length, 0) || 0,
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Analytics Dashboard</h1>
          <p className="text-gray-600">
            Comprehensive insights into your team&apos;s productivity and performance.
          </p>
        </div>
        <Badge className="bg-gradient-to-r from-blue-500 to-purple-600">
          <Crown className="w-4 h-4 mr-1" />
          Pro Feature
        </Badge>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockAnalytics.totalTasks}</div>
            <p className="text-xs text-muted-foreground">
              +12% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockAnalytics.completionRate}%</div>
            <Progress value={mockAnalytics.completionRate} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockAnalytics.activeProjects}</div>
            <p className="text-xs text-muted-foreground">
              Across all teams
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Team Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockAnalytics.teamMembers}</div>
            <p className="text-xs text-muted-foreground">
              Total across teams
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="projects">Projects</TabsTrigger>
          <TabsTrigger value="team">Team Performance</TabsTrigger>
          <TabsTrigger value="productivity">Productivity</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Task Status Distribution</CardTitle>
                <CardDescription>Current status of all tasks</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Completed</span>
                    <span className="text-sm font-medium">{mockAnalytics.completedTasks}</span>
                  </div>
                  <Progress value={(mockAnalytics.completedTasks / mockAnalytics.totalTasks) * 100} />
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm">In Progress</span>
                    <span className="text-sm font-medium">{mockAnalytics.tasksInProgress}</span>
                  </div>
                  <Progress value={(mockAnalytics.tasksInProgress / mockAnalytics.totalTasks) * 100} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Weekly Activity</CardTitle>
                <CardDescription>Tasks completed this week</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Interactive charts available in production</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="projects" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Project Performance</CardTitle>
              <CardDescription>Overview of project progress and completion rates</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Target className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Project analytics would be displayed here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="team" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Team Productivity</CardTitle>
              <CardDescription>Individual and team performance metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Team performance metrics would be shown here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="productivity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Productivity Trends</CardTitle>
              <CardDescription>Historical productivity data and trends</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <TrendingUp className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Productivity trends and insights would be displayed here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
