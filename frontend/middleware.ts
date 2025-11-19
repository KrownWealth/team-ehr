import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtDecode } from "jwt-decode";
import { ROUTE_PERMISSIONS } from "./lib/constants/routes";
import { AuthTokenPayload, OnboardingStatus } from "./types";
import { parseCookieValue } from "./lib/helper";

const PUBLIC_ROUTES = [
  "/",
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

type FullUserData = AuthTokenPayload & {
  onboardingStatus: OnboardingStatus;
  role: string;
  clinicId?: string;
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for static files and Next.js internals
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
  let user: Partial<FullUserData> | null = null;
  const loginUrl = new URL("/auth/login", request.url);

  // Token validation
  if (token) {
    try {
      const decodedUser = jwtDecode<AuthTokenPayload>(token);
      const currentTime = Date.now() / 1000;

      if (decodedUser.exp < currentTime) {
        const response = NextResponse.redirect(loginUrl);
        response.cookies.delete("auth_token");
        response.cookies.delete("refresh_token");
        response.cookies.delete("user_data");
        return response;
      }
      user = decodedUser;
    } catch (error) {
      const response = NextResponse.redirect(loginUrl);
      response.cookies.delete("auth_token");
      response.cookies.delete("refresh_token");
      response.cookies.delete("user_data");
      return response;
    }
  }

  // Merge user data from cookie
  const userDataFromCookie = parseCookieValue(
    userDataStr
  ) as Partial<FullUserData> | null;
  if (user && userDataFromCookie) {
    user = { ...user, ...userDataFromCookie };
  } else if (!user && userDataFromCookie?.role) {
    user = userDataFromCookie as Partial<FullUserData>;
  }

  // Allow public routes for everyone
  if (isPublicRoute(pathname)) {
    return NextResponse.next();
  }

  // Check authentication (user must have userId and role)
  const isAuthenticated = user?.userId && user?.role;

  if (!isAuthenticated) {
    return NextResponse.redirect(loginUrl);
  }

  const fullUser = user as FullUserData;
  const onboardingUrl = new URL("/onboarding", request.url);
  const isOnboardingRoute = pathname.startsWith("/onboarding");

  // ✅ FIX 1: ADMIN-ONLY ONBOARDING
  // Only ADMINs need to complete onboarding
  const isAdmin = fullUser.role === "ADMIN";
  const isPending = fullUser.onboardingStatus === OnboardingStatus.PENDING;

  if (isAdmin && isPending && !isOnboardingRoute) {
    // Admin needs onboarding, redirect to onboarding
    return NextResponse.redirect(onboardingUrl);
  }

  if (isAdmin && !isPending && isOnboardingRoute) {
    // Admin completed onboarding, redirect to dashboard
    const dashboardUrl = new URL(
      `/clinic/${fullUser.clinicId}/dashboard`,
      request.url
    );
    return NextResponse.redirect(dashboardUrl);
  }

  // Non-admins should never see onboarding
  if (!isAdmin && isOnboardingRoute) {
    const dashboardUrl = new URL(
      `/clinic/${fullUser.clinicId}/dashboard`,
      request.url
    );
    return NextResponse.redirect(dashboardUrl);
  }

  // ✅ FIX 2: STOP REDIRECTING AUTHENTICATED USERS FROM LANDING PAGE
  // Allow authenticated users to view landing page
  if (pathname === "/") {
    return NextResponse.next();
  }

  // ✅ FIX 3: REDIRECT AUTHENTICATED USERS FROM AUTH PAGES
  // If user is logged in and tries to access auth pages, redirect to dashboard
  if (isAuthRoute(pathname)) {
    const dashboardUrl = new URL(
      `/clinic/${fullUser.clinicId}/dashboard`,
      request.url
    );
    return NextResponse.redirect(dashboardUrl);
  }

  // ✅ FIX 4: LESS AGGRESSIVE ROLE-BASED PROTECTION
  // Only check permissions for clinic routes
  if (pathname.startsWith("/clinic/")) {
    const pathParts = pathname.split("/").filter(Boolean);

    // Ensure user has clinicId
    if (!fullUser.clinicId) {
      return NextResponse.redirect(loginUrl);
    }

    const clinicId = pathParts[1];

    // Allow users to access their own clinic
    if (clinicId !== fullUser.clinicId) {
      const correctDashboard = new URL(
        `/clinic/${fullUser.clinicId}/dashboard`,
        request.url
      );
      return NextResponse.redirect(correctDashboard);
    }

    // Build route pattern for permission check
    const routeParts = pathParts.slice(2); // Remove 'clinic' and clinicId
    let routeToCheck = "/" + routeParts.join("/");

    // Replace dynamic segments with placeholders
    routeToCheck = routeToCheck.replace(/\/[a-f0-9-]{36}/gi, "/{id}");

    // Check if route has specific permissions
    const allowedRoles = ROUTE_PERMISSIONS[routeToCheck];

    if (allowedRoles && !allowedRoles.includes(fullUser.role)) {
      // User doesn't have permission, redirect to their dashboard
      const dashboardUrl = new URL(
        `/clinic/${fullUser.clinicId}/dashboard`,
        request.url
      );
      return NextResponse.redirect(dashboardUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
