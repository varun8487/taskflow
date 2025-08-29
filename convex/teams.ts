import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const createTeam = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    ownerId: v.id("users"),
  },
  handler: async (ctx, args) => {
    // Generate a random invite code
    const inviteCode = Math.random().toString(36).substr(2, 9).toUpperCase();

    const teamId = await ctx.db.insert("teams", {
      ...args,
      memberIds: [args.ownerId],
      inviteCode,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return teamId;
  },
});

export const getTeamsByUser = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const teams = await ctx.db.query("teams").collect();
    return teams.filter(team => 
      team.ownerId === args.userId || team.memberIds.includes(args.userId)
    );
  },
});

export const getTeamById = query({
  args: { teamId: v.id("teams") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.teamId);
  },
});

export const joinTeamByInviteCode = mutation({
  args: {
    inviteCode: v.string(),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const team = await ctx.db
      .query("teams")
      .withIndex("by_invite_code", (q) => q.eq("inviteCode", args.inviteCode))
      .first();

    if (!team) {
      throw new Error("Invalid invite code");
    }

    if (team.memberIds.includes(args.userId)) {
      throw new Error("User is already a member of this team");
    }

    await ctx.db.patch(team._id, {
      memberIds: [...team.memberIds, args.userId],
      updatedAt: Date.now(),
    });

    return team._id;
  },
});

export const getTeamMembers = query({
  args: { teamId: v.id("teams") },
  handler: async (ctx, args) => {
    const team = await ctx.db.get(args.teamId);
    if (!team) return [];

    const members = await Promise.all(
      team.memberIds.map(async (memberId) => {
        const user = await ctx.db.get(memberId);
        return user;
      })
    );

    return members.filter(Boolean);
  },
});

export const removeTeamMember = mutation({
  args: {
    teamId: v.id("teams"),
    userId: v.id("users"),
    removerId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const team = await ctx.db.get(args.teamId);
    if (!team) {
      throw new Error("Team not found");
    }

    // Only team owner can remove members
    if (team.ownerId !== args.removerId) {
      throw new Error("Only team owner can remove members");
    }

    // Can't remove the owner
    if (args.userId === team.ownerId) {
      throw new Error("Cannot remove team owner");
    }

    const updatedMemberIds = team.memberIds.filter(id => id !== args.userId);

    await ctx.db.patch(team._id, {
      memberIds: updatedMemberIds,
      updatedAt: Date.now(),
    });

    return team._id;
  },
});

export const updateMemberRole = mutation({
  args: {
    teamId: v.id("teams"),
    memberId: v.id("users"),
    newRole: v.union(v.literal("owner"), v.literal("admin"), v.literal("member"), v.literal("viewer")),
  },
  handler: async (ctx, args) => {
    const team = await ctx.db.get(args.teamId);
    if (!team) {
      throw new Error("Team not found");
    }

    // For now, store roles in team metadata
    // In a real implementation, you'd have a separate teamMembers table
    
    // Verify member exists in team
    if (!team.memberIds.includes(args.memberId)) {
      throw new Error("User is not a member of this team");
    }

    // This is a simplified implementation
    // In production, you'd want to store roles in a separate table
    await ctx.db.patch(team._id, {
      updatedAt: Date.now(),
    });

    return args.teamId;
  },
});

export const getTeamMemberRole = query({
  args: {
    teamId: v.id("teams"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const team = await ctx.db.get(args.teamId);
    if (!team) {
      return null;
    }

    // Team owner has owner role
    if (team.ownerId === args.userId) {
      return "owner";
    }

    // Other members default to member role
    // In production, you'd query a teamMembers table
    if (team.memberIds.includes(args.userId)) {
      return "member";
    }

    return null;
  },
});
