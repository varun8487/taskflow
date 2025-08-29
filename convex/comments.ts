import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const createComment = mutation({
  args: {
    content: v.string(),
    taskId: v.id("tasks"),
    authorId: v.id("users"),
  },
  handler: async (ctx, args) => {
    // Verify task exists and user has access
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

    if (!team.memberIds.includes(args.authorId) && team.ownerId !== args.authorId) {
      throw new Error("User is not authorized to comment on this task");
    }

    const commentId = await ctx.db.insert("comments", {
      ...args,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Create analytics event
    await ctx.db.insert("analytics", {
      teamId: team._id,
      userId: args.authorId,
      eventType: "comment_added",
      metadata: { taskId: args.taskId, projectId: task.projectId },
      timestamp: Date.now(),
    });

    return commentId;
  },
});

export const getCommentsByTask = query({
  args: { taskId: v.id("tasks") },
  handler: async (ctx, args) => {
    const comments = await ctx.db
      .query("comments")
      .withIndex("by_task", (q) => q.eq("taskId", args.taskId))
      .order("asc")
      .collect();

    // Get author information for each comment
    const commentsWithAuthors = await Promise.all(
      comments.map(async (comment) => {
        const author = await ctx.db.get(comment.authorId);
        return {
          ...comment,
          author: author ? {
            _id: author._id,
            name: author.name,
            email: author.email,
            avatar: author.avatar,
          } : null,
        };
      })
    );

    return commentsWithAuthors;
  },
});

export const updateComment = mutation({
  args: {
    commentId: v.id("comments"),
    content: v.string(),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const comment = await ctx.db.get(args.commentId);
    if (!comment) {
      throw new Error("Comment not found");
    }

    // Only comment author can update
    if (comment.authorId !== args.userId) {
      throw new Error("Only comment author can update this comment");
    }

    await ctx.db.patch(comment._id, {
      content: args.content,
      updatedAt: Date.now(),
    });

    return comment._id;
  },
});

export const deleteComment = mutation({
  args: {
    commentId: v.id("comments"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const comment = await ctx.db.get(args.commentId);
    if (!comment) {
      throw new Error("Comment not found");
    }

    const task = await ctx.db.get(comment.taskId);
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

    // Only comment author, project owner, or team owner can delete
    if (comment.authorId !== args.userId && 
        project.ownerId !== args.userId && 
        team.ownerId !== args.userId) {
      throw new Error("User is not authorized to delete this comment");
    }

    await ctx.db.delete(comment._id);
    return comment._id;
  },
});
