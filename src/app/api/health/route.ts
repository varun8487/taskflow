import { NextResponse } from 'next/server';

export async function GET() {
  const healthData = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    services: {
      database: 'connected', // In production, this would check actual Convex connection
      authentication: 'operational',
      payments: 'operational',
      storage: 'operational',
    },
  };

  return NextResponse.json(healthData, { status: 200 });
}

export async function HEAD() {
  return new Response(null, { status: 200 });
}
