import { v } from "convex/values";
import { query } from "./_generated/server";

export const getTeamAnalytics = query({
  args: { 
    teamId: v.id("teams"),
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { teamId, startDate, endDate } = args;
    
    let analyticsQuery = ctx.db
      .query("analytics")
      .withIndex("by_team", (q) => q.eq("teamId", teamId));

    if (startDate && endDate) {
      analyticsQuery = analyticsQuery.filter((q) => 
        q.gte(q.field("timestamp"), startDate) && q.lte(q.field("timestamp"), endDate)
      );
    }

    const analytics = await analyticsQuery.collect();

    // Calculate metrics
    const totalEvents = analytics.length;
    const tasksCreated = analytics.filter(a => a.eventType === "task_created").length;
    const tasksCompleted = analytics.filter(a => a.eventType === "task_completed").length;
    const projectsCreated = analytics.filter(a => a.eventType === "project_created").length;
    const filesUploaded = analytics.filter(a => a.eventType === "file_uploaded").length;
    const commentsAdded = analytics.filter(a => a.eventType === "comment_added").length;

    // User activity breakdown
    const userActivity = analytics.reduce((acc, event) => {
      const userId = event.userId;
      if (!acc[userId]) {
        acc[userId] = {
          tasksCreated: 0,
          tasksCompleted: 0,
          commentsAdded: 0,
          filesUploaded: 0,
        };
      }
      
      switch (event.eventType) {
        case "task_created":
          acc[userId].tasksCreated++;
          break;
        case "task_completed":
          acc[userId].tasksCompleted++;
          break;
        case "comment_added":
          acc[userId].commentsAdded++;
          break;
        case "file_uploaded":
          acc[userId].filesUploaded++;
          break;
      }
      
      return acc;
    }, {} as Record<string, any>);

    // Daily activity over time
    const dailyActivity = analytics.reduce((acc, event) => {
      const date = new Date(event.timestamp).toISOString().split('T')[0];
      if (!acc[date]) {
        acc[date] = 0;
      }
      acc[date]++;
      return acc;
    }, {} as Record<string, number>);

    // Completion rate
    const completionRate = tasksCreated > 0 ? (tasksCompleted / tasksCreated) * 100 : 0;

    return {
      totalEvents,
      tasksCreated,
      tasksCompleted,
      projectsCreated,
      filesUploaded,
      commentsAdded,
      completionRate,
      userActivity,
      dailyActivity,
    };
  },
});

export const getUserProductivity = query({
  args: { 
    userId: v.id("users"),
    teamId: v.id("teams"),
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { userId, teamId, startDate, endDate } = args;
    
    let analyticsQuery = ctx.db
      .query("analytics")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .filter((q) => q.eq(q.field("teamId"), teamId));

    if (startDate && endDate) {
      analyticsQuery = analyticsQuery.filter((q) => 
        q.gte(q.field("timestamp"), startDate) && q.lte(q.field("timestamp"), endDate)
      );
    }

    const analytics = await analyticsQuery.collect();

    const tasksCreated = analytics.filter(a => a.eventType === "task_created").length;
    const tasksCompleted = analytics.filter(a => a.eventType === "task_completed").length;
    const commentsAdded = analytics.filter(a => a.eventType === "comment_added").length;
    const filesUploaded = analytics.filter(a => a.eventType === "file_uploaded").length;

    // Calculate average completion time (Pro feature)
    const completionTimes = analytics
      .filter(a => a.eventType === "task_completed" && a.metadata?.duration)
      .map(a => a.metadata!.duration!);
    
    const avgCompletionTime = completionTimes.length > 0 
      ? completionTimes.reduce((sum, time) => sum + time, 0) / completionTimes.length 
      : 0;

    return {
      tasksCreated,
      tasksCompleted,
      commentsAdded,
      filesUploaded,
      completionRate: tasksCreated > 0 ? (tasksCompleted / tasksCreated) * 100 : 0,
      avgCompletionTime,
      totalActivity: analytics.length,
    };
  },
});

export const getProjectProgress = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    const analytics = await ctx.db
      .query("analytics")
      .filter((q) => q.eq(q.field("metadata.projectId"), args.projectId))
      .collect();

    const dailyProgress = analytics.reduce((acc, event) => {
      const date = new Date(event.timestamp).toISOString().split('T')[0];
      if (!acc[date]) {
        acc[date] = {
          tasksCreated: 0,
          tasksCompleted: 0,
          commentsAdded: 0,
        };
      }
      
      switch (event.eventType) {
        case "task_created":
          acc[date].tasksCreated++;
          break;
        case "task_completed":
          acc[date].tasksCompleted++;
          break;
        case "comment_added":
          acc[date].commentsAdded++;
          break;
      }
      
      return acc;
    }, {} as Record<string, any>);

    return { dailyProgress };
  },
});
