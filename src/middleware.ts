import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/projects(.*)',
  '/teams(.*)',
  '/settings(.*)',
  '/analytics(.*)',
  '/billing(.*)',
]);

export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth();
  
  // Only redirect from homepage if coming from authentication
  const fromAuth = req.nextUrl.searchParams.has('after_sign_in') || 
                   req.nextUrl.searchParams.has('after_sign_up') ||
                   req.nextUrl.searchParams.has('redirect_url');
  
  if (userId && req.nextUrl.pathname === '/' && fromAuth) {
    console.log('User authenticated, redirecting to dashboard from auth flow');
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }
  
  // Handle sign-in success redirects
  if (userId && (req.nextUrl.pathname === '/sign-in' || req.nextUrl.pathname === '/sign-up')) {
    console.log('User authenticated on auth page, redirecting to dashboard');
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }
  
  // Protect authenticated routes
  if (isProtectedRoute(req)) {
    try {
      await auth.protect();
      console.log(`Access granted to protected route: ${req.nextUrl.pathname}`);
    } catch {
      console.log(`Access denied to ${req.nextUrl.pathname}, redirecting to sign-in`);
      const signInUrl = new URL('/sign-in', req.url);
      signInUrl.searchParams.set('redirect_url', req.nextUrl.pathname);
      return NextResponse.redirect(signInUrl);
    }
  }
  
  return NextResponse.next();
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};