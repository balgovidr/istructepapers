import { NextResponse } from 'next/server';

export function middleware(req) {
  const { pathname } = req.nextUrl;

  return NextResponse.next();
}

export const config = {
    matcher: [
      "/",
      "/((?!_next|api|.*\\.).*)",
      "/api/login",
      "/api/logout",
    ],
  };