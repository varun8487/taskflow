"use client";

// Force dynamic rendering to prevent prerendering issues
export const dynamic = 'force-dynamic';

import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function TestLoginPage() {
  const { user, isSignedIn, isLoaded } = useUser();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const debugInfo = {
    mounted,
    isLoaded,
    isSignedIn,
    userId: user?.id || null,
    email: user?.emailAddresses[0]?.emailAddress || null,
    firstName: user?.firstName || null,
    fullName: user?.fullName || null,
    currentUrl: typeof window !== 'undefined' ? window.location.href : 'Server',
    envVars: {
      clerkPublishableKey: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.slice(0, 10) + '...' || 'Not set',
      convexUrl: process.env.NEXT_PUBLIC_CONVEX_URL || 'Not set'
    }
  };

  console.log("Test Login Page Debug:", debugInfo);

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Mounting...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">🔧 Login Test & Debug</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-green-600">✅ Authentication Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p><strong>Mounted:</strong> <span className={mounted ? "text-green-600" : "text-red-600"}>{mounted ? "✅ Yes" : "❌ No"}</span></p>
                <p><strong>Clerk Loaded:</strong> <span className={isLoaded ? "text-green-600" : "text-yellow-600"}>{isLoaded ? "✅ Yes" : "⏳ Loading..."}</span></p>
                <p><strong>Signed In:</strong> <span className={isSignedIn ? "text-green-600" : "text-red-600"}>{isSignedIn ? "✅ Yes" : "❌ No"}</span></p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-blue-600">👤 User Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p><strong>User ID:</strong> {user?.id || "Not available"}</p>
                <p><strong>Email:</strong> {user?.emailAddresses[0]?.emailAddress || "Not available"}</p>
                <p><strong>Name:</strong> {user?.fullName || user?.firstName || "Not available"}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-purple-600">🔧 Environment & Config</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p><strong>Clerk Key:</strong> {debugInfo.envVars.clerkPublishableKey}</p>
                <p><strong>Convex URL:</strong> {debugInfo.envVars.convexUrl}</p>
              </div>
              <div>
                <p><strong>Current URL:</strong> {debugInfo.currentUrl}</p>
                <p><strong>Page Type:</strong> Dynamic Rendering</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-orange-600">🧪 Test Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link href="/" className="block">
                <div className="p-4 bg-blue-100 dark:bg-blue-900 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors text-center">
                  <span className="font-semibold text-blue-700 dark:text-blue-300">🏠 Home Page</span>
                </div>
              </Link>
              
              <Link href="/dashboard" className="block">
                <div className="p-4 bg-green-100 dark:bg-green-900 rounded-lg hover:bg-green-200 dark:hover:bg-green-800 transition-colors text-center">
                  <span className="font-semibold text-green-700 dark:text-green-300">📊 Dashboard</span>
                </div>
              </Link>
              
              <Link href="/dashboard/simple" className="block">
                <div className="p-4 bg-purple-100 dark:bg-purple-900 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-800 transition-colors text-center">
                  <span className="font-semibold text-purple-700 dark:text-purple-300">📋 Simple Dashboard</span>
                </div>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-gray-600">📋 Debug JSON</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg overflow-auto text-sm">
              {JSON.stringify(debugInfo, null, 2)}
            </pre>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
