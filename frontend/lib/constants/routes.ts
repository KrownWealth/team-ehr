import { Role } from "./roles";

export const ROUTE_PERMISSIONS: Record<string, Role[]> = {
  "/dashboard": ["ADMIN", "CLERK", "NURSE", "DOCTOR"],
  "/patients": ["ADMIN", "CLERK", "NURSE", "DOCTOR"],
  "/patients/register": ["ADMIN", "CLERK"],
  "/queue": ["CLERK", "NURSE", "DOCTOR"],
  "/vitals": ["NURSE", "DOCTOR"],
  "/consultations": ["DOCTOR"],
  "/prescriptions": ["DOCTOR"],
  "/lab-orders": ["DOCTOR"],
  "/staff": ["ADMIN"],
  "/settings": ["ADMIN"],
  "/billing": ["ADMIN"],
};;

export function canAccessRoute(
  userRole: Role | undefined,
  route: string
): boolean {
  if (!userRole) return false;

  const segments = route.split("/").filter((s) => s.length > 0);
  let cleanRoute = "";

  if (segments[0] === "clinic" && segments.length >= 2) {
    const relevantSegments = segments.slice(0, 4);

    if (relevantSegments.length > 1) {
      relevantSegments[1] = "{id}";
    }

    cleanRoute = "/" + relevantSegments.join("/");

    if (segments.length === 2) {
      cleanRoute = "/clinic/{id}";
    }
  } else {
    const baseRoute = segments.slice(0, 3).join("/");
    cleanRoute = "/" + baseRoute.replace(/[a-f0-9-]{7,36}/gi, "{id}");
  }

  const allowedRoles = ROUTE_PERMISSIONS[cleanRoute];

  if (!allowedRoles) {
    return true;
  }

  return allowedRoles.includes(userRole);
}

export function getDefaultRouteForRole(role: Role, clinicId: string): string {
  switch (role) {
    case "ADMIN":
      return `/clinic/${clinicId}/dashboard`;
    case "CLERK":
      return `/clinic/${clinicId}/queue`;
    case "NURSE":
      return `/clinic/${clinicId}/queue`;
    case "DOCTOR":
      return `/clinic/${clinicId}/dashboard`;
    case "PATIENT":
      return `/clinic/${clinicId}/portal/dashboard`;
    default:
      return `/clinic/${clinicId}/dashboard`;
  }
}
