"use client";

import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";

interface AuthTestWrapperProps {
  children: React.ReactNode;
}

export default function AuthTestWrapper({ children }: AuthTestWrapperProps) {
  const { isLoaded, isSignedIn, user } = useUser();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent hydration mismatch
  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Show loading while Clerk is initializing
  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Debug information
  console.log("AuthTestWrapper Debug:", {
    isLoaded,
    isSignedIn,
    userId: user?.id,
    email: user?.emailAddresses[0]?.emailAddress,
    mounted
  });

  return <>{children}</>;
}
