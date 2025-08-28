"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/../convex/_generated/api";
import { Id } from "@/../convex/_generated/dataModel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  UserRole, 
  getRoleDisplayName, 
  getRoleDescription, 
  validateRoleTransition,
  canChangeRole,
  PermissionContext
} from "@/lib/permissions";
import { SubscriptionTier } from "@/lib/feature-gates";
import { motion } from "framer-motion";
import { 
  Users, 
  Crown, 
  Shield, 
  User, 
  Eye, 
  AlertTriangle
} from "lucide-react";

interface TeamMember {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  role: UserRole;
  joinedAt: number;
}

interface RoleManagerProps {
  teamId: string;
  members: TeamMember[];
  currentUserRole: UserRole;
  subscriptionTier: SubscriptionTier;
  isTeamOwner: boolean;
  onRoleChange?: (memberId: string, newRole: UserRole) => void;
}

export function RoleManager({
  teamId,
  members,
  currentUserRole,
  subscriptionTier,
  isTeamOwner,
  onRoleChange
}: RoleManagerProps) {
  const [changingRoles, setChangingRoles] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);

  const updateMemberRole = useMutation(api.teams.updateMemberRole);

  const handleRoleChange = async (memberId: string, newRole: UserRole) => {
    const member = members.find(m => m._id === memberId);
    if (!member) return;

    // Validate transition
    const validation = validateRoleTransition(
      member.role,
      newRole,
      currentUserRole,
      subscriptionTier
    );

    if (!validation.valid) {
      setError(validation.reason || 'Invalid role change');
      return;
    }

    setChangingRoles(prev => new Set(prev).add(memberId));
    setError(null);

    try {
      await updateMemberRole({
        teamId: teamId as Id<"teams">,
        memberId: memberId as Id<"users">,
        newRole,
      });

      onRoleChange?.(memberId, newRole);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update role');
    } finally {
      setChangingRoles(prev => {
        const newSet = new Set(prev);
        newSet.delete(memberId);
        return newSet;
      });
    }
  };

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case 'owner': return <Crown className="w-4 h-4 text-yellow-500" />;
      case 'admin': return <Shield className="w-4 h-4 text-blue-500" />;
      case 'member': return <User className="w-4 h-4 text-green-500" />;
      case 'viewer': return <Eye className="w-4 h-4 text-gray-500" />;
    }
  };

  const getRoleBadgeColor = (role: UserRole) => {
    switch (role) {
      case 'owner': return 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white';
      case 'admin': return 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white';
      case 'member': return 'bg-gradient-to-r from-green-500 to-emerald-500 text-white';
      case 'viewer': return 'bg-gray-500 text-white';
    }
  };

  const canUserChangeRole = (targetMember: TeamMember) => {
    const context: PermissionContext = {
      userRole: currentUserRole,
      subscriptionTier,
      isTeamOwner,
      isProjectOwner: false,
      isTaskCreator: false,
    };

    return canChangeRole(context, targetMember.role, targetMember.role);
  };

  const getAvailableRoles = (currentRole: UserRole): UserRole[] => {
    const allRoles: UserRole[] = ['owner', 'admin', 'member', 'viewer'];
    
    return allRoles.filter(role => {
      // Skip current role
      if (role === currentRole) return false;
      
      // Only owner can assign/change owner role
      if (role === 'owner' && !isTeamOwner) return false;
      
      // Admin role requires paid subscription
      if (role === 'admin' && subscriptionTier === 'free') return false;
      
      return true;
    });
  };

  return (
    <Card className="glass-effect border-none shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center text-gray-900 dark:text-white">
          <Users className="w-5 h-5 mr-2 text-purple-600" />
          Team Roles & Permissions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {error && (
          <Alert className="border-red-200 bg-red-50 dark:bg-red-900/20">
            <AlertTriangle className="w-4 h-4 text-red-600" />
            <AlertDescription className="text-red-700 dark:text-red-400">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {/* Role Information */}
        {subscriptionTier === 'free' && (
          <Alert className="border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20">
            <Crown className="w-4 h-4 text-yellow-600" />
            <AlertDescription className="text-yellow-700 dark:text-yellow-400">
              Advanced role management requires a paid subscription. 
              <Button variant="link" className="p-0 h-auto text-yellow-700 dark:text-yellow-400 underline ml-1">
                Upgrade to unlock Admin roles
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Members List */}
        <div className="space-y-4">
          {members.map((member, index) => (
            <motion.div
              key={member._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg"
            >
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                  {member.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    {member.name}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {member.email}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500">
                    Joined {new Date(member.joinedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <Badge className={`${getRoleBadgeColor(member.role)} border-none`}>
                    <span className="mr-1">{getRoleIcon(member.role)}</span>
                    {getRoleDisplayName(member.role)}
                  </Badge>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-32">
                    {getRoleDescription(member.role)}
                  </p>
                </div>

                {canUserChangeRole(member) && (
                  <Select
                    value={member.role}
                    onValueChange={(newRole: UserRole) => handleRoleChange(member._id, newRole)}
                    disabled={changingRoles.has(member._id)}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={member.role} disabled>
                        {getRoleDisplayName(member.role)}
                      </SelectItem>
                      {getAvailableRoles(member.role).map(role => (
                        <SelectItem key={role} value={role}>
                          <div className="flex items-center">
                            {getRoleIcon(role)}
                            <span className="ml-2">{getRoleDisplayName(role)}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Role Descriptions */}
        <div className="mt-8 space-y-4">
          <h4 className="font-semibold text-gray-900 dark:text-white">Role Descriptions</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(['owner', 'admin', 'member', 'viewer'] as UserRole[]).map(role => (
              <div 
                key={role}
                className={`p-3 rounded-lg border ${
                  subscriptionTier === 'free' && role === 'admin' 
                    ? 'border-gray-300 bg-gray-100 dark:bg-gray-800 opacity-60' 
                    : 'border-gray-200 bg-white dark:bg-gray-800'
                }`}
              >
                <div className="flex items-center mb-2">
                  {getRoleIcon(role)}
                  <span className="ml-2 font-medium text-gray-900 dark:text-white">
                    {getRoleDisplayName(role)}
                  </span>
                  {subscriptionTier === 'free' && role === 'admin' && (
                    <Crown className="w-3 h-3 ml-auto text-yellow-500" />
                  )}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {getRoleDescription(role)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default RoleManager;
