import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { cookies } from "next/headers";

export async function middleware(request: NextRequest) {
  const isApiRoute = request.nextUrl.pathname.startsWith("/api/");
  const isAuthRoute = request.nextUrl.pathname.startsWith("/api/auth/");
  const isMutation = ["POST", "PUT", "PATCH", "DELETE"].includes(request.method);

  if (isApiRoute && !isAuthRoute && isMutation) {
    const auth = request.headers.get("authorization");
    const expected = `Bearer ${process.env.ADMIN_PASSWORD}`;

    if (auth === expected) {
      return NextResponse.next();
    }

    const cookieStore = await cookies();
    const session = cookieStore.get("admin_session");
    if (session) {
      return NextResponse.next();
    }

    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/api/:path*",
};
