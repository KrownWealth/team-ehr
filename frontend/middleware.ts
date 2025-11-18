import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtDecode } from "jwt-decode";
import { ROUTE_PERMISSIONS } from "./lib/constants/routes";
import { AuthTokenPayload, OnboardingStatus, Role, User } from "./types";
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
  role: string
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

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

  if (token) {
    try {
      const decodedUser = jwtDecode<AuthTokenPayload>(token);
      const currentTime = Date.now() / 1000;

      if (decodedUser.exp < currentTime) {
        const response = NextResponse.redirect(
          new URL("/auth/login", request.url)
        );
        response.cookies.delete("auth_token");
        response.cookies.delete("user_data");
        return response;
      }

      user = decodedUser;
    } catch (error) {
      const response = NextResponse.redirect(
        new URL("/auth/login", request.url)
      );
      response.cookies.delete("auth_token");
      response.cookies.delete("user_data");
      return response;
    }
  }

  const userDataFromCookie = parseCookieValue(userDataStr) as Partial<FullUserData> | null;
  if (user && userDataFromCookie) {
    user = { ...user, ...userDataFromCookie }
  } else if (!user && userDataFromCookie?.role) {
    user = userDataFromCookie as Partial<FullUserData>;
  }

  if (isPublicRoute(pathname)) {
    return NextResponse.next();
  }

  const isAuthenticatedAndComplete =
    user?.userId && user?.role && user?.clinicId;

  if (!isAuthenticatedAndComplete) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  const fullUser = user as FullUserData;

  const isOnboardingRoute = pathname.startsWith("/onboarding");
  const isPending = fullUser.onboardingStatus === OnboardingStatus.PENDING;

  if (isPending && !isOnboardingRoute) {
    return NextResponse.redirect(new URL("/onboarding", request.url));
  }

  if (!isPending && isOnboardingRoute) {
    const clinicId = fullUser.clinicId;
    return NextResponse.redirect(
      new URL(`/clinic/${clinicId}/dashboard`, request.url)
    );
  }

  if (isAuthRoute(pathname)) {
    const clinicId = fullUser.clinicId;
    return NextResponse.redirect(
      new URL(`/clinic/${clinicId}/dashboard`, request.url)
    );
  }

  const pathParts = pathname.split("/").filter(Boolean);

  if (pathParts.length === 0) {
    return NextResponse.redirect(
      new URL(`/clinic/${fullUser.clinicId}/dashboard`, request.url)
    );
  }

  const clinicId = pathParts[1];

  if (clinicId !== fullUser.clinicId) {
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

  if (allowedRoles && !allowedRoles.includes(fullUser.role)) {
    return NextResponse.redirect(
      new URL(`/clinic/${fullUser.clinicId}/dashboard`, request.url)
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
