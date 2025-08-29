import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const createFile = mutation({
  args: {
    name: v.string(),
    url: v.string(),
    size: v.number(),
    type: v.string(),
    s3Key: v.string(),
    taskId: v.optional(v.id("tasks")),
    projectId: v.optional(v.id("projects")),
  },
  handler: async (ctx, args) => {
    // Get current user from Clerk
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    // Find user in our database
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    // Verify user has access to the project/task
    if (args.projectId) {
      const project = await ctx.db.get(args.projectId);
      if (!project) {
        throw new Error("Project not found");
      }

      const team = await ctx.db.get(project.teamId);
      if (!team) {
        throw new Error("Team not found");
      }

      if (!team.memberIds.includes(user._id) && team.ownerId !== user._id) {
        throw new Error("User is not authorized to upload files to this project");
      }
    }

    if (args.taskId) {
      const task = await ctx.db.get(args.taskId);
      if (!task) {
        throw new Error("Task not found");
      }

      const project = await ctx.db.get(task.projectId);
      if (!project) {
        throw new Error("Project not found");
      }

      const team = await ctx.db.get(project.teamId);
      if (!team) {
        throw new Error("Team not found");
      }

      if (!team.memberIds.includes(user._id) && team.ownerId !== user._id) {
        throw new Error("User is not authorized to upload files to this task");
      }
    }

    const fileId = await ctx.db.insert("files", {
      ...args,
      uploaderId: user._id,
      createdAt: Date.now(),
    });

    // Create analytics event
    if (args.projectId) {
      const project = await ctx.db.get(args.projectId);
      if (project) {
        await ctx.db.insert("analytics", {
          teamId: project.teamId,
          userId: user._id,
          eventType: "file_uploaded",
          metadata: { 
            projectId: args.projectId
          },
          timestamp: Date.now(),
        });
      }
    }

    return fileId;
  },
});

export const getFilesByProject = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("files")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .collect();
  },
});

export const getFilesByTask = query({
  args: { taskId: v.id("tasks") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("files")
      .withIndex("by_task", (q) => q.eq("taskId", args.taskId))
      .collect();
  },
});

export const getFileById = query({
  args: { fileId: v.id("files") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.fileId);
  },
});

export const deleteFile = mutation({
  args: {
    fileId: v.id("files"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    const file = await ctx.db.get(args.fileId);
    if (!file) {
      throw new Error("File not found");
    }

    // Check if user has permission to delete
    // User can delete if they uploaded it, or they have admin access to the project/task
    let hasPermission = file.uploaderId === user._id;

    if (!hasPermission && file.projectId) {
      const project = await ctx.db.get(file.projectId);
      if (project) {
        const team = await ctx.db.get(project.teamId);
        if (team && (team.ownerId === user._id || project.ownerId === user._id)) {
          hasPermission = true;
        }
      }
    }

    if (!hasPermission) {
      throw new Error("User is not authorized to delete this file");
    }

    await ctx.db.delete(file._id);
    return file._id;
  },
});

export const getFileUploadStats = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const files = await ctx.db
      .query("files")
      .withIndex("by_uploader", (q) => q.eq("uploaderId", args.userId))
      .collect();

    const totalFiles = files.length;
    const totalSize = files.reduce((sum, file) => sum + file.size, 0);
    const fileTypes = files.reduce((acc, file) => {
      const type = file.type.split('/')[0];
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalFiles,
      totalSize,
      fileTypes,
      recentFiles: files
        .sort((a, b) => b.createdAt - a.createdAt)
        .slice(0, 5),
    };
  },
});