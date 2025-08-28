"use client";

// Force dynamic rendering to prevent prerendering issues with Convex
export const dynamic = 'force-dynamic';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/../convex/_generated/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Users, Crown } from "lucide-react";
import Link from "next/link";
import nextDynamic from "next/dynamic";
// import { useSubscription, isWithinLimit } from "@/lib/subscription";

function NewTeamContent() {
  const router = useRouter();
  const { user } = useUser();
  // const { isPro, tier } = useSubscription();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });

  const convexUser = useQuery(
    api.users.getUserByClerkId,
    user ? { clerkId: user.id } : "skip"
  );

  const teams = useQuery(
    api.teams.getTeamsByUser,
    convexUser ? { userId: convexUser._id } : "skip"
  );

  const createTeam = useMutation(api.teams.createTeam);

  const isPro = false;
  // const tier = "starter"; // Removed unused variable
  const canCreateTeam = true;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!convexUser || !canCreateTeam) return;

    setIsLoading(true);
    try {
      await createTeam({
        name: formData.name,
        description: formData.description || undefined,
        ownerId: convexUser._id,
      });
      router.push("/teams");
    } catch (error) {
      console.error("Error creating team:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  if (!user || !convexUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!canCreateTeam) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Link href="/teams" className="flex items-center text-sm text-gray-500 hover:text-gray-700">
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Teams
          </Link>
        </div>

        <Card className="border-amber-200 bg-amber-50">
          <CardHeader>
            <div className="flex items-center space-x-3">
              <Crown className="w-8 h-8 text-amber-600" />
              <div>
                <CardTitle className="text-amber-800">Team Limit Reached</CardTitle>
                <CardDescription className="text-amber-600">
                  You&apos;ve reached the maximum number of teams for your current plan.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-amber-800 mb-4">
              Starter plan includes 1 team. Upgrade to Pro for unlimited teams and advanced features.
            </p>
            <div className="flex space-x-3">
              <Link href="/billing">
                <Button>Upgrade to Pro</Button>
              </Link>
              <Link href="/teams">
                <Button variant="outline">Back to Teams</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <Link href="/teams" className="flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4">
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Teams
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Create New Team</h1>
        <p className="text-gray-600">
          Set up a new team to collaborate with others on projects and tasks.
        </p>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="w-5 h-5 mr-2" />
            Team Details
          </CardTitle>
          <CardDescription>
            Provide basic information about your team.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="name">Team Name *</Label>
              <Input
                id="name"
                name="name"
                placeholder="Enter team name"
                value={formData.name}
                onChange={handleChange}
                required
                disabled={isLoading}
              />
              <p className="text-xs text-gray-500 mt-1">
                Choose a descriptive name for your team.
              </p>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Describe what this team works on (optional)"
                value={formData.description}
                onChange={handleChange}
                disabled={isLoading}
                rows={3}
              />
              <p className="text-xs text-gray-500 mt-1">
                Help team members understand the purpose of this team.
              </p>
            </div>

            {/* Plan Information */}
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-blue-900">
                    Current Plan: {isPro ? "Pro" : "Starter"}
                  </p>
                  <p className="text-sm text-blue-700">
                    {isPro 
                      ? "Unlimited teams and members"
                      : `${teams?.length || 0}/1 teams used`
                    }
                  </p>
                </div>
                {!isPro && (
                  <Link href="/billing">
                    <Button variant="outline" size="sm" className="border-blue-300 text-blue-700 hover:bg-blue-100">
                      Upgrade
                    </Button>
                  </Link>
                )}
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <Link href="/teams">
                <Button variant="outline" disabled={isLoading}>
                  Cancel
                </Button>
              </Link>
              <Button 
                type="submit" 
                disabled={isLoading || !formData.name.trim()}
              >
                {isLoading ? "Creating..." : "Create Team"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Help Text */}
      <div className="mt-8 text-center">
        <p className="text-sm text-gray-500">
          After creating your team, you&apos;ll receive an invite code to share with team members.
        </p>
      </div>
    </div>
  );
}

// Dynamic import to prevent SSR issues with Convex
const DynamicNewTeamContent = nextDynamic(() => Promise.resolve(NewTeamContent), {
  ssr: false,
  loading: () => <div className="min-h-screen flex items-center justify-center"><div className="text-lg">Loading...</div></div>
});

export default function NewTeamPage() {
  return <DynamicNewTeamContent />;
}
