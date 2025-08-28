"use client";

// Force dynamic rendering to prevent prerendering issues with Convex
export const dynamic = 'force-dynamic';

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@/../convex/_generated/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Users, 
  Plus, 
  Crown,
  Search,
  UserPlus
} from "lucide-react";
import Link from "next/link";
import nextDynamic from "next/dynamic";
// import { useSubscription, isWithinLimit } from "@/lib/subscription";

function TeamsContent() {
  const { user } = useUser();
  // const { isPro, tier } = useSubscription();
  const [searchTerm, setSearchTerm] = useState("");
  const [showJoinDialog, setShowJoinDialog] = useState(false);
  const [inviteCode, setInviteCode] = useState("");
  // const [copiedInvite, setCopiedInvite] = useState<string | null>(null); // Removed unused variable
  
  // Mock subscription data - Default to free plan
  const isPro = false;
  const tier = "free";

  const convexUser = useQuery(
    api.users.getUserByClerkId,
    user ? { clerkId: user.id } : "skip"
  );

  const teams = useQuery(
    api.teams.getTeamsByUser,
    convexUser ? { userId: convexUser._id } : "skip"
  );

  const filteredTeams = teams;

  const canCreateMoreTeams = true; // Mock for now

  // const copyInviteCode = (code: string) => {
  //   navigator.clipboard.writeText(code);
  //   setCopiedInvite(code);
  //   setTimeout(() => setCopiedInvite(null), 2000);
  // }; // Removed unused function

  if (!user || !convexUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600">      </div>
    </div>
  );
  }

  return (
    <div className="min-h-screen max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Teams</h1>
          <p className="text-gray-600 dark:text-gray-300">
            Collaborate with your team members on projects and tasks.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Dialog open={showJoinDialog} onOpenChange={setShowJoinDialog}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <UserPlus className="w-4 h-4 mr-2" />
                Join Team
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Join a Team</DialogTitle>
                <DialogDescription>
                  Enter the invite code to join an existing team.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="inviteCode">Invite Code</Label>
                  <Input
                    id="inviteCode"
                    placeholder="Enter invite code"
                    value={inviteCode}
                    onChange={(e) => setInviteCode(e.target.value)}
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setShowJoinDialog(false)}>
                    Cancel
                  </Button>
                  <Button>Join Team</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          
          {canCreateMoreTeams ? (
            <Link href="/teams/new">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Create Team
              </Button>
            </Link>
          ) : (
            <Button disabled title={`Maximum teams reached for ${tier} plan`}>
              <Plus className="w-4 h-4 mr-2" />
              Create Team
            </Button>
          )}
        </div>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search teams..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Convex Integration Status */}
      <Card className="border-blue-200 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-800 mb-6">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
              </div>
              <div>
                <p className="font-medium text-blue-800 dark:text-blue-200">
                  Real-time Collaboration Powered by Convex
                </p>
                <p className="text-sm text-blue-600 dark:text-blue-300">
                  Teams are synchronized in real-time across all devices using Convex database.
                </p>
              </div>
            </div>
            <div className="px-3 py-1 bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200 text-xs font-medium rounded-full">
              Live Updates
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Plan Limit Warning */}
      {!isPro && teams && teams.length >= 1 && (
        <Card className="border-amber-200 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-800 mb-6">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Crown className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                <div>
                  <p className="font-medium text-amber-800 dark:text-amber-200">
                    You have reached the team limit for Free plan
                  </p>
                  <p className="text-sm text-amber-600 dark:text-amber-300">
                    Upgrade to Starter, Pro, or Enterprise for more teams and advanced features.
                  </p>
                </div>
              </div>
              <Link href="/billing">
                <Button variant="outline" size="sm" className="border-amber-300 dark:border-amber-600 text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/50">
                  Upgrade Plan
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Teams Grid */}
      {filteredTeams && filteredTeams.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTeams.map((team: { _id: string; name: string; description?: string }) => (
            <Card key={team._id} className="glass-effect border-none shadow-xl glow-effect">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-1">
                      {team.name}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 text-sm">
                      {team.description || "No description"}
                    </p>
                  </div>
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="relative">
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
              <div className="w-2 h-2 bg-white rounded-full animate-ping"></div>
            </div>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Ready for Real-time Collaboration
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-2">
            Create your first team to start collaborating with others
          </p>
          <p className="text-sm text-blue-600 dark:text-blue-400 mb-6">
            Powered by Convex for instant synchronization across all devices
          </p>
          <Link href="/teams/new">
            <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-none shadow-lg hover:shadow-xl transition-all">
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Team
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}

// Dynamic import to prevent SSR issues with Convex
const DynamicTeamsContent = nextDynamic(() => Promise.resolve(TeamsContent), {
  ssr: false,
  loading: () => <div className="min-h-screen flex items-center justify-center"><div className="text-lg">Loading...</div></div>
});

export default function TeamsPage() {
  return <DynamicTeamsContent />;
}
