import { SubscriptionTier } from './feature-gates'

export type UserRole = 'owner' | 'admin' | 'member' | 'viewer'

export interface TeamMember {
  userId: string
  role: UserRole
  joinedAt: number
}

export interface PermissionContext {
  userRole: UserRole
  subscriptionTier: SubscriptionTier
  isTeamOwner: boolean
  isProjectOwner: boolean
  isTaskCreator: boolean
}

// Define what each role can do
export const ROLE_PERMISSIONS = {
  owner: {
    canManageTeam: true,
    canManageProjects: true,
    canManageTasks: true,
    canManageMembers: true,
    canViewAnalytics: true,
    canManageBilling: true,
    canDeleteTeam: true,
    canInviteMembers: true,
    canRemoveMembers: true,
    canChangeRoles: true,
    canManageSettings: true,
  },
  admin: {
    canManageTeam: true,
    canManageProjects: true,
    canManageTasks: true,
    canManageMembers: true,
    canViewAnalytics: true,
    canManageBilling: false,
    canDeleteTeam: false,
    canInviteMembers: true,
    canRemoveMembers: true,
    canChangeRoles: false, // Can't change owner role
    canManageSettings: true,
  },
  member: {
    canManageTeam: false,
    canManageProjects: true,
    canManageTasks: true,
    canManageMembers: false,
    canViewAnalytics: false,
    canManageBilling: false,
    canDeleteTeam: false,
    canInviteMembers: false,
    canRemoveMembers: false,
    canChangeRoles: false,
    canManageSettings: false,
  },
  viewer: {
    canManageTeam: false,
    canManageProjects: false,
    canManageTasks: false,
    canManageMembers: false,
    canViewAnalytics: false,
    canManageBilling: false,
    canDeleteTeam: false,
    canInviteMembers: false,
    canRemoveMembers: false,
    canChangeRoles: false,
    canManageSettings: false,
  },
} as const

export function hasPermission(
  context: PermissionContext,
  permission: keyof typeof ROLE_PERMISSIONS.owner
): boolean {
  // Team roles only available for Pro+ subscriptions
  if (context.subscriptionTier === 'free' && context.userRole !== 'owner') {
    return false
  }

  const rolePermissions = ROLE_PERMISSIONS[context.userRole]
  return rolePermissions[permission]
}

export function canManageTeam(context: PermissionContext): boolean {
  return hasPermission(context, 'canManageTeam')
}

export function canManageProject(context: PermissionContext): boolean {
  return hasPermission(context, 'canManageProjects') || context.isProjectOwner
}

export function canManageTask(context: PermissionContext): boolean {
  return hasPermission(context, 'canManageTasks') || context.isTaskCreator
}

export function canInviteMembers(context: PermissionContext): boolean {
  return hasPermission(context, 'canInviteMembers')
}

export function canRemoveMembers(context: PermissionContext): boolean {
  return hasPermission(context, 'canRemoveMembers')
}

export function canViewAnalytics(context: PermissionContext): boolean {
  // Analytics requires Starter+ subscription AND appropriate role
  if (context.subscriptionTier === 'free') return false
  return hasPermission(context, 'canViewAnalytics')
}

export function canManageBilling(context: PermissionContext): boolean {
  return hasPermission(context, 'canManageBilling')
}

export function canChangeRole(
  context: PermissionContext,
  targetRole: UserRole,
  currentRole: UserRole
): boolean {
  // Only team owner can change roles to/from owner
  if (targetRole === 'owner' || currentRole === 'owner') {
    return context.isTeamOwner
  }

  // Admins can change member/viewer roles (excluding owner)
  if (context.userRole === 'admin') {
    return true // Admin can change non-owner roles
  }

  return hasPermission(context, 'canChangeRoles')
}

export function getMaxRole(subscriptionTier: SubscriptionTier): UserRole {
  // Free tier only supports owner/member structure
  if (subscriptionTier === 'free') return 'member'
  
  // Paid tiers support full role hierarchy
  return 'admin'
}

export function getRoleDisplayName(role: UserRole): string {
  const displayNames = {
    owner: 'Team Owner',
    admin: 'Administrator',
    member: 'Member',
    viewer: 'Viewer',
  }
  return displayNames[role]
}

export function getRoleDescription(role: UserRole): string {
  const descriptions = {
    owner: 'Full access to team, billing, and all features',
    admin: 'Manage team, projects, and members (except billing)',
    member: 'Create and manage projects and tasks',
    viewer: 'Read-only access to team content',
  }
  return descriptions[role]
}

export function validateRoleTransition(
  fromRole: UserRole,
  toRole: UserRole,
  actorRole: UserRole,
  subscriptionTier: SubscriptionTier
): { valid: boolean; reason?: string } {
  // Can't change owner role
  if (fromRole === 'owner') {
    return { valid: false, reason: 'Cannot change team owner role' }
  }

  // Only owner can assign owner role
  if (toRole === 'owner' && actorRole !== 'owner') {
    return { valid: false, reason: 'Only team owner can assign ownership' }
  }

  // Check subscription tier limits
  const maxRole = getMaxRole(subscriptionTier)
  if (toRole === 'admin' && maxRole !== 'admin') {
    return { valid: false, reason: 'Admin role requires paid subscription' }
  }

  // Admin can change non-owner roles (already validated above that neither role is owner)
  if (actorRole === 'admin') {
    return { valid: true }
  }

  // Owner can change any role
  if (actorRole === 'owner') {
    return { valid: true }
  }

  return { valid: false, reason: 'Insufficient permissions' }
}
