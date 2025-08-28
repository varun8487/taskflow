import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const createFile = mutation({
  args: {
    name: v.string(),
    url: v.string(),
    size: v.number(),
    type: v.string(),
    taskId: v.optional(v.id("tasks")),
    projectId: v.optional(v.id("projects")),
    uploaderId: v.id("users"),
    s3Key: v.string(),
  },
  handler: async (ctx, args) => {
    // Verify user has access to the task/project
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

      if (!team.memberIds.includes(args.uploaderId) && team.ownerId !== args.uploaderId) {
        throw new Error("User is not authorized to upload files to this task");
      }
    } else if (args.projectId) {
      const project = await ctx.db.get(args.projectId);
      if (!project) {
        throw new Error("Project not found");
      }

      const team = await ctx.db.get(project.teamId);
      if (!team) {
        throw new Error("Team not found");
      }

      if (!team.memberIds.includes(args.uploaderId) && team.ownerId !== args.uploaderId) {
        throw new Error("User is not authorized to upload files to this project");
      }
    }

    const fileId = await ctx.db.insert("files", {
      ...args,
      createdAt: Date.now(),
    });

    // Create analytics event
    if (args.projectId) {
      const project = await ctx.db.get(args.projectId);
      if (project) {
        const team = await ctx.db.get(project.teamId);
        if (team) {
          await ctx.db.insert("analytics", {
            teamId: team._id,
            userId: args.uploaderId,
            eventType: "file_uploaded",
            metadata: { 
              projectId: args.projectId,
              taskId: args.taskId,
            },
            timestamp: Date.now(),
          });
        }
      }
    }

    return fileId;
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

export const getFilesByProject = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("files")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .collect();
  },
});

export const deleteFile = mutation({
  args: {
    fileId: v.id("files"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const file = await ctx.db.get(args.fileId);
    if (!file) {
      throw new Error("File not found");
    }

    // Check if user has permission to delete
    if (file.uploaderId === args.userId) {
      // File uploader can always delete
      await ctx.db.delete(file._id);
      return file._id;
    }

    // Check if user is team/project owner
    if (file.projectId) {
      const project = await ctx.db.get(file.projectId);
      if (project) {
        const team = await ctx.db.get(project.teamId);
        if (team && (team.ownerId === args.userId || project.ownerId === args.userId)) {
          await ctx.db.delete(file._id);
          return file._id;
        }
      }
    }

    throw new Error("User is not authorized to delete this file");
  },
});
