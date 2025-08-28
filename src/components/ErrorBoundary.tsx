"use client";

import React from 'react';
import { Button } from "@/components/ui/button";

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error?: Error; resetError: () => void }>;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by ErrorBoundary:', error, errorInfo);
  }

  resetError = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback || DefaultErrorFallback;
      return <FallbackComponent error={this.state.error} resetError={this.resetError} />;
    }

    return this.props.children;
  }
}

function DefaultErrorFallback({ error, resetError }: { error?: Error; resetError: () => void }) {
  const isJWTError = error?.message?.includes('JWT') || error?.message?.includes('convex');

  if (isJWTError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6 text-center">
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 19c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Database Connection Setup Required</h3>
          <p className="text-gray-600 mb-4">
            The application is working, but the database integration needs to be configured. 
            This requires creating a JWT template in Clerk.
          </p>
          <div className="space-y-3 text-sm text-left bg-gray-50 p-4 rounded-md mb-4">
            <p><strong>Quick Fix:</strong></p>
            <ol className="list-decimal list-inside space-y-1">
              <li>Go to <a href="https://dashboard.clerk.dev" className="text-blue-600 hover:underline">Clerk Dashboard</a></li>
              <li>Find your TaskFlow application</li>
              <li>Navigate to &quot;JWT Templates&quot;</li>
              <li>Create new template named &quot;convex&quot;</li>
              <li>Restart the application</li>
            </ol>
          </div>
          <div className="flex space-x-3">
            <Button onClick={resetError} variant="outline" className="flex-1">
              Try Again
            </Button>
            <Button 
              onClick={() => window.location.href = '/'} 
              className="flex-1"
            >
              Go Home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6 text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Something went wrong</h3>
        <p className="text-gray-600 mb-4">
          {error?.message || 'An unexpected error occurred. Please try again.'}
        </p>
        <div className="flex space-x-3">
          <Button onClick={resetError} variant="outline" className="flex-1">
            Try Again
          </Button>
          <Button 
            onClick={() => window.location.href = '/'} 
            className="flex-1"
          >
            Go Home
          </Button>
        </div>
      </div>
    </div>
  );
}

export default ErrorBoundary;
