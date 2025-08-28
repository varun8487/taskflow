import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const createTask = mutation({
  args: {
    title: v.string(),
    description: v.optional(v.string()),
    projectId: v.id("projects"),
    assigneeId: v.optional(v.id("users")),
    creatorId: v.id("users"),
    priority: v.union(
      v.literal("low"),
      v.literal("medium"),
      v.literal("high"),
      v.literal("urgent")
    ),
    dueDate: v.optional(v.number()),
    estimatedHours: v.optional(v.number()),
    tags: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    // Verify project exists and user has access
    const project = await ctx.db.get(args.projectId);
    if (!project) {
      throw new Error("Project not found");
    }

    const team = await ctx.db.get(project.teamId);
    if (!team) {
      throw new Error("Team not found");
    }

    if (!team.memberIds.includes(args.creatorId) && team.ownerId !== args.creatorId) {
      throw new Error("User is not authorized to create tasks in this project");
    }

    const taskId = await ctx.db.insert("tasks", {
      ...args,
      status: "todo",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Create analytics event
    await ctx.db.insert("analytics", {
      teamId: team._id,
      userId: args.creatorId,
      eventType: "task_created",
      metadata: { taskId, projectId: args.projectId },
      timestamp: Date.now(),
    });

    return taskId;
  },
});

export const getTasksByProject = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("tasks")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .collect();
  },
});

export const getTaskById = query({
  args: { taskId: v.id("tasks") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.taskId);
  },
});

export const updateTaskStatus = mutation({
  args: {
    taskId: v.id("tasks"),
    status: v.union(
      v.literal("todo"),
      v.literal("in_progress"),
      v.literal("review"),
      v.literal("completed")
    ),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
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

    if (!team.memberIds.includes(args.userId) && team.ownerId !== args.userId) {
      throw new Error("User is not authorized to update this task");
    }

    await ctx.db.patch(task._id, {
      status: args.status,
      updatedAt: Date.now(),
    });

    // Create analytics event for task completion
    if (args.status === "completed") {
      await ctx.db.insert("analytics", {
        teamId: team._id,
        userId: args.userId,
        eventType: "task_completed",
        metadata: { taskId: task._id, projectId: task.projectId },
        timestamp: Date.now(),
      });
    }

    return task._id;
  },
});

export const assignTask = mutation({
  args: {
    taskId: v.id("tasks"),
    assigneeId: v.optional(v.id("users")),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
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

    if (!team.memberIds.includes(args.userId) && team.ownerId !== args.userId) {
      throw new Error("User is not authorized to assign this task");
    }

    // Verify assignee is a team member
    if (args.assigneeId && !team.memberIds.includes(args.assigneeId)) {
      throw new Error("Assignee is not a member of this team");
    }

    await ctx.db.patch(task._id, {
      assigneeId: args.assigneeId,
      updatedAt: Date.now(),
    });

    return task._id;
  },
});

export const updateTaskDetails = mutation({
  args: {
    taskId: v.id("tasks"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    priority: v.optional(v.union(
      v.literal("low"),
      v.literal("medium"),
      v.literal("high"),
      v.literal("urgent")
    )),
    dueDate: v.optional(v.number()),
    estimatedHours: v.optional(v.number()),
    actualHours: v.optional(v.number()),
    tags: v.optional(v.array(v.string())),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
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

    if (!team.memberIds.includes(args.userId) && team.ownerId !== args.userId) {
      throw new Error("User is not authorized to update this task");
    }

    const updateData: any = {
      updatedAt: Date.now(),
    };

    if (args.title !== undefined) updateData.title = args.title;
    if (args.description !== undefined) updateData.description = args.description;
    if (args.priority !== undefined) updateData.priority = args.priority;
    if (args.dueDate !== undefined) updateData.dueDate = args.dueDate;
    if (args.estimatedHours !== undefined) updateData.estimatedHours = args.estimatedHours;
    if (args.actualHours !== undefined) updateData.actualHours = args.actualHours;
    if (args.tags !== undefined) updateData.tags = args.tags;

    await ctx.db.patch(task._id, updateData);

    return task._id;
  },
});

export const deleteTask = mutation({
  args: {
    taskId: v.id("tasks"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
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

    // Only task creator, project owner, or team owner can delete
    if (task.creatorId !== args.userId && 
        project.ownerId !== args.userId && 
        team.ownerId !== args.userId) {
      throw new Error("User is not authorized to delete this task");
    }

    // Delete all comments associated with this task
    const comments = await ctx.db
      .query("comments")
      .withIndex("by_task", (q) => q.eq("taskId", args.taskId))
      .collect();

    for (const comment of comments) {
      await ctx.db.delete(comment._id);
    }

    await ctx.db.delete(task._id);
    return task._id;
  },
});

export const getTasksByUser = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("tasks")
      .withIndex("by_assignee", (q) => q.eq("assigneeId", args.userId))
      .collect();
  },
});
