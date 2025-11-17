import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtDecode } from "jwt-decode";
import { ROUTE_PERMISSIONS } from "./lib/constants/routes";
import { AuthTokenPayload } from "./types";
import { parseCookieValue } from "./lib/helper";

const PUBLIC_ROUTES = [
  "/", // Landing page
  "/auth/login",
  "/auth/register",
  "/auth/verify-otp",
  "/auth/forgot-password",
  "/auth/reset-password",
  "/terms",
  "/privacy",
  "/about",
  "/contact",
];

const AUTH_ROUTES = ["/auth/login", "/auth/register", "/auth/verify-otp"];

function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(route + "/")
  );
}

function isAuthRoute(pathname: string): boolean {
  return AUTH_ROUTES.some((route) => pathname.startsWith(route));
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for Next.js internals, API routes, and static files
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/static") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  const token = request.cookies.get("auth_token")?.value;
  const userDataStr = request.cookies.get("user_data")?.value;
  let user: AuthTokenPayload | null = null;

  if (token) {
    try {
      user = jwtDecode<AuthTokenPayload>(token);
      const currentTime = Date.now() / 1000;

      if (user.exp < currentTime) {
        const response = NextResponse.redirect(
          new URL("/auth/login", request.url)
        );
        response.cookies.delete("auth_token");
        response.cookies.delete("user_data");
        return response;
      }
    } catch (error) {
      console.error("Invalid token:", error);
      const response = NextResponse.redirect(
        new URL("/auth/login", request.url)
      );
      response.cookies.delete("auth_token");
      response.cookies.delete("user_data");
      return response;
    }
  }

  user = parseCookieValue(userDataStr);

  if (user && isAuthRoute(pathname)) {
    const clinicId = user.clinicId;
    return NextResponse.redirect(
      new URL(`/clinic/${clinicId}/dashboard`, request.url)
    );
  }

  if (isPublicRoute(pathname)) {
    return NextResponse.next();
  }

  if (!user || !token) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  const pathParts = pathname.split("/").filter(Boolean);
  
  if (pathParts.length === 0) {
    return NextResponse.redirect(
      new URL(`/clinic/${user.clinicId}/dashboard`, request.url)
    );
  }

  const clinicId = pathParts[1];

  if (clinicId !== user.clinicId) {
    // Let Next.js handle the 404 naturally
    return NextResponse.next();
  }

  const routeParts = pathParts.slice(1);
  let baseRoute = "/" + routeParts.join("/");

  baseRoute = baseRoute.replace(/\/[a-zA-Z0-9-_]+$/, "");

  let allowedRoles: string[] | undefined;

  if (ROUTE_PERMISSIONS[baseRoute]) {
    allowedRoles = ROUTE_PERMISSIONS[baseRoute];
  } else {
    const parentRoute = baseRoute.split("/").slice(0, -1).join("/") || "/";
    allowedRoles = ROUTE_PERMISSIONS[parentRoute];
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return NextResponse.next();
  }

  const response = NextResponse.next();

  // if (userDataStr) {
  //   response.headers.set("x-user-data", userDataStr);
  // }
  // response.headers.set("x-user-role", user.role);
  // response.headers.set("x-clinic-id", user.clinicId);

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
