"use client";

import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@/../convex/_generated/api";

export default function DebugPage() {
  const { user, isSignedIn, isLoaded } = useUser();

  console.log("Debug Info:", {
    isLoaded,
    isSignedIn,
    user: user ? {
      id: user.id,
      firstName: user.firstName,
      email: user.emailAddresses[0]?.emailAddress
    } : null,
    convexUrl: process.env.NEXT_PUBLIC_CONVEX_URL
  });

  let convexUser;
  let convexError;
  
  try {
    convexUser = useQuery(api.users.getUserByClerkId, user ? { clerkId: user.id } : "skip");
  } catch (error) {
    convexError = error;
    console.error("Convex query error:", error);
  }

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-2xl font-bold">Debug Information</h1>
      
      <div className="space-y-4">
        <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
          <h2 className="font-semibold mb-2">Clerk Auth Status</h2>
          <p>Is Loaded: {isLoaded ? "✅" : "❌"}</p>
          <p>Is Signed In: {isSignedIn ? "✅" : "❌"}</p>
          <p>User ID: {user?.id || "None"}</p>
          <p>User Email: {user?.emailAddresses[0]?.emailAddress || "None"}</p>
        </div>

        <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
          <h2 className="font-semibold mb-2">Environment</h2>
          <p>Convex URL: {process.env.NEXT_PUBLIC_CONVEX_URL || "Not set"}</p>
          <p>Current URL: {typeof window !== 'undefined' ? window.location.href : "Server"}</p>
        </div>

        <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
          <h2 className="font-semibold mb-2">Convex Status</h2>
          {convexError ? (
            <div className="text-red-600">
              <p>❌ Convex Error:</p>
              <pre className="text-sm">{JSON.stringify(convexError, null, 2)}</pre>
            </div>
          ) : (
            <>
              <p>Convex User Query: {convexUser === undefined ? "Loading..." : convexUser ? "✅ Success" : "❌ No user"}</p>
              {convexUser && (
                <pre className="text-sm mt-2">{JSON.stringify(convexUser, null, 2)}</pre>
              )}
            </>
          )}
        </div>

        <div className="p-4 bg-blue-100 dark:bg-blue-900 rounded-lg">
          <h2 className="font-semibold mb-2">Quick Actions</h2>
          <div className="space-x-4">
            <a href="/dashboard" className="text-blue-600 underline">Go to Dashboard</a>
            <a href="/sign-in" className="text-blue-600 underline">Sign In</a>
            <a href="/sign-out" className="text-blue-600 underline">Sign Out</a>
          </div>
        </div>
      </div>
    </div>
  );
}
