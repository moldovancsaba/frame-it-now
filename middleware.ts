import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // Handle auth-related routes
  if (request.nextUrl.pathname.startsWith("/api/auth")) {
    return new NextResponse(null, { status: 404 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/api/:path*",
};
