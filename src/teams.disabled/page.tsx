"use client";

// Force dynamic rendering to prevent prerendering issues with Convex
export const dynamic = 'force-dynamic';

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@/../convex/_generated/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Users, 
  Plus, 
  Settings, 
  Crown,
  Search,
  UserPlus,
  Copy,
  CheckCircle
} from "lucide-react";
import Link from "next/link";
import { useSubscription, isWithinLimit } from "@/lib/subscription";

export default function TeamsPage() {
  const { user } = useUser();
  const { isPro, tier } = useSubscription();
  const [searchTerm, setSearchTerm] = useState("");
  const [showJoinDialog, setShowJoinDialog] = useState(false);
  const [inviteCode, setInviteCode] = useState("");
  const [copiedInvite, setCopiedInvite] = useState<string | null>(null);

  const convexUser = useQuery(
    api.users.getUserByClerkId,
    user ? { clerkId: user.id } : "skip"
  );

  const teams = useQuery(
    api.teams.getTeamsByUser,
    convexUser ? { userId: convexUser._id } : "skip"
  );

  const filteredTeams = teams?.filter(team =>
    team.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const canCreateMoreTeams = convexUser && teams 
    ? isWithinLimit(tier as "starter" | "pro", "maxTeamMembers", teams.length)
    : false;

  const copyInviteCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedInvite(code);
    setTimeout(() => setCopiedInvite(null), 2000);
  };

  if (!user || !convexUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Teams</h1>
          <p className="text-gray-600">
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

      {/* Plan Limit Warning */}
      {!isPro && teams && teams.length >= 1 && (
        <Card className="border-amber-200 bg-amber-50 mb-6">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Crown className="w-5 h-5 text-amber-600" />
                <div>
                  <p className="font-medium text-amber-800">
                    You&apos;ve reached the team limit for Starter plan
                  </p>
                  <p className="text-sm text-amber-600">
                    Upgrade to Pro for unlimited teams and advanced features.
                  </p>
                </div>
              </div>
              <Link href="/billing">
                <Button variant="outline" size="sm" className="border-amber-300 text-amber-700 hover:bg-amber-100">
                  Upgrade to Pro
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Teams Grid */}
      {filteredTeams && filteredTeams.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTeams.map((team) => (
            <Card key={team._id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-xl mb-2">{team.name}</CardTitle>
                    <CardDescription className="line-clamp-2">
                      {team.description || "No description provided"}
                    </CardDescription>
                  </div>
                  {team.ownerId === convexUser._id && (
                    <Badge variant="secondary" className="ml-2">
                      Owner
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <Users className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600">
                      {team.memberIds.length} member{team.memberIds.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                </div>

                {/* Invite Code */}
                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Invite Code</p>
                      <code className="text-sm font-mono">{team.inviteCode}</code>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyInviteCode(team.inviteCode)}
                      className="h-8 w-8 p-0"
                    >
                      {copiedInvite === team.inviteCode ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <Link href={`/teams/${team._id}`} className="flex-1">
                    <Button variant="outline" className="w-full">
                      View Team
                    </Button>
                  </Link>
                  {team.ownerId === convexUser._id && (
                    <Link href={`/teams/${team._id}/settings`}>
                      <Button variant="ghost" size="sm" className="px-3">
                        <Settings className="w-4 h-4" />
                      </Button>
                    </Link>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        /* Empty State */
        <Card className="text-center py-12">
          <CardContent>
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {searchTerm ? "No teams found" : "No teams yet"}
            </h3>
            <p className="text-gray-600 mb-6 max-w-sm mx-auto">
              {searchTerm 
                ? "Try adjusting your search terms or create a new team."
                : "Create your first team to start collaborating with others on projects."
              }
            </p>
            {!searchTerm && canCreateMoreTeams && (
              <Link href="/teams/new">
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Team
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
