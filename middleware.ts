import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

if (!process.env.NEXTAUTH_URL || process.env.NEXTAUTH_URL.trim() === '') {
  if (process.env.VERCEL_URL) {
    process.env.NEXTAUTH_URL = `https://${process.env.VERCEL_URL}`;
  } else {
    delete process.env.NEXTAUTH_URL;
  }
}

export default withAuth(
  function middleware(req) {
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
    pages: {
      signIn: '/login',
    },
    secret: process.env.NEXTAUTH_SECRET || 'your-secure-random-32-character-secret-key-here',
  }
);

export const config = {
  matcher: [
    '/',
    '/projects',
    '/projects/:path*',
    '/tasks',
    '/tasks/:path*',
    '/calendar',
    '/calendar/:path*',
    '/reports',
    '/reports/:path*',
    '/profile',
    '/profile/:path*',
    '/settings',
    '/settings/:path*',
    '/notifications',
    '/notifications/:path*',
  ],
};
