import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSessionCookieName, verifySessionToken } from "@/lib/auth";

const PUBLIC_PATHS = new Set([
  "/",
  "/login",
  "/appointments",
  "/api/login",
  "/api/logout",
  "/api/auth/logout",
]);

function isPublicPath(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isPublicBookingApi =
    (pathname === "/api/services" && req.method === "GET") ||
    (pathname === "/api/appointments" && req.method === "POST") ||
    (pathname === "/api/appointments/taken" && req.method === "GET");

  return (
    isPublicBookingApi ||
    PUBLIC_PATHS.has(pathname) ||
    pathname.startsWith("/_next") ||
    pathname.includes(".")
  );
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (isPublicPath(req)) {
    return NextResponse.next();
  }

  const isLoggedIn = await verifySessionToken(
    req.cookies.get(getSessionCookieName())?.value
  );

  if (isLoggedIn) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/api")) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const loginUrl = new URL("/login", req.url);
  loginUrl.searchParams.set("next", pathname);

  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
