"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/../convex/_generated/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import ErrorBoundary from "@/components/ErrorBoundary";
import { 
  Users, 
  FolderOpen, 
  CheckCircle2, 
  Clock, 
  Plus,
  BarChart3,
  TrendingUp 
} from "lucide-react";
import Link from "next/link";

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
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Show loading while convex user is being fetched
  if (user && convexUser === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const isProUser = convexUser?.subscription === "pro";
  
  const completedTasks = userTasks?.filter(task => task.status === "completed").length || 0;
  const pendingTasks = userTasks?.filter(task => task.status !== "completed").length || 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
              <Badge variant={isProUser ? "default" : "secondary"}>
                {isProUser ? "Pro" : "Starter"}
              </Badge>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/teams/new">
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  New Team
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user.firstName || "there"}! 👋
          </h2>
          <p className="text-gray-600">
            Here's what's happening with your projects today.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Teams</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{teams?.length || 0}</div>
              <p className="text-xs text-muted-foreground">
                {!isProUser && (teams?.length || 0) >= 1 && (
                  <span className="text-amber-600">Upgrade for unlimited</span>
                )}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
              <FolderOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {userTasks?.length || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Active projects
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed Tasks</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{completedTasks}</div>
              <p className="text-xs text-muted-foreground">
                +12% from last week
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Tasks</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingTasks}</div>
              <p className="text-xs text-muted-foreground">
                Needs attention
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Teams */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Your Teams</CardTitle>
                <CardDescription>
                  Collaborate with your team members on projects
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {teams?.length > 0 ? (
                    teams.map((team) => (
                      <div key={team._id} className="flex items-center justify-between p-4 border rounded-lg bg-blue-50">
                        <div>
                          <h3 className="font-semibold">{team.name}</h3>
                          <p className="text-sm text-gray-600">
                            {team.memberIds.length} member{team.memberIds.length !== 1 ? 's' : ''}
                          </p>
                        </div>
                        <Link href={`/teams/${team._id}`}>
                          <Button variant="outline" size="sm">
                            View Team
                          </Button>
                        </Link>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-500 mb-4">No teams yet</p>
                      <Link href="/teams/new">
                        <Button>
                          <Plus className="w-4 h-4 mr-2" />
                          Create your first team
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Upgrade Card */}
            {!isProUser && (
              <Card className="border-blue-200 bg-blue-50">
                <CardHeader>
                  <CardTitle className="text-blue-900">Upgrade to Pro</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-blue-800 text-sm mb-4">
                    Unlock unlimited teams, advanced analytics, and file uploads.
                  </p>
                  <Link href="/billing">
                    <Button className="w-full">
                      <TrendingUp className="w-4 h-4 mr-2" />
                      Upgrade Now
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}

            {/* Analytics Preview */}
            {isProUser && (
              <Card>
                <CardHeader>
                  <CardTitle>Analytics</CardTitle>
                  <CardDescription>Your productivity insights</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Completion Rate</span>
                      <span className="text-sm font-medium">
                        {completedTasks + pendingTasks > 0 
                          ? Math.round((completedTasks / (completedTasks + pendingTasks)) * 100)
                          : 0}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ 
                          width: `${completedTasks + pendingTasks > 0 
                            ? (completedTasks / (completedTasks + pendingTasks)) * 100 
                            : 0}%` 
                        }}
                      ></div>
                    </div>
                  </div>
                  <Link href="/analytics" className="block mt-4">
                    <Button variant="outline" size="sm" className="w-full">
                      <BarChart3 className="w-4 h-4 mr-2" />
                      View Analytics
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Link href="/teams/new">
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Team
                  </Button>
                </Link>
                <Link href="/projects/new">
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    <FolderOpen className="w-4 h-4 mr-2" />
                    New Project
                  </Button>
                </Link>
                {isProUser && (
                  <Link href="/analytics">
                    <Button variant="outline" size="sm" className="w-full justify-start">
                      <BarChart3 className="w-4 h-4 mr-2" />
                      View Analytics
                    </Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
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
