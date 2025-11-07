import { Role } from "./roles";

export const ROUTE_PERMISSIONS: Record<string, Role[]> = {
  "/dashboard": ["ADMIN", "CLERK", "NURSE", "DOCTOR", "LAB_TECH", "CASHIER"],
  "/patients": ["ADMIN", "CLERK", "NURSE", "DOCTOR"],
  "/patients/register": ["ADMIN", "CLERK"],
  "/queue": ["CLERK", "NURSE", "DOCTOR"],
  "/vitals": ["NURSE", "DOCTOR"],
  "/consultations": ["DOCTOR"],
  "/prescriptions": ["DOCTOR"],
  "/lab-orders": ["DOCTOR", "LAB_TECH"],
  "/staff": ["ADMIN"],
  "/settings": ["ADMIN"],
  "/billing": ["ADMIN", "CASHIER"],
};

export function canAccessRoute(
  userRole: Role | undefined,
  route: string
): boolean {
  if (!userRole) return false;
  const baseRoute = route.split("/").slice(0, 3).join("/");
  const cleanRoute = baseRoute.replace(/\/[a-f0-9-]{36}/gi, "");

  const allowedRoles = ROUTE_PERMISSIONS[cleanRoute];
  if (!allowedRoles) return true;

  return allowedRoles.includes(userRole);
}

export function getDefaultRouteForRole(role: Role, clinicId: string): string {
  switch (role) {
    case "ADMIN":
      return `/${clinicId}/dashboard`;
    case "CLERK":
      return `/${clinicId}/queue`;
    case "NURSE":
      return `/${clinicId}/queue`;
    case "DOCTOR":
      return `/${clinicId}/dashboard`;
    case "LAB_TECH":
      return `/${clinicId}/lab-orders`;
    case "CASHIER":
      return `/${clinicId}/billing`;
    case "PATIENT":
      return `/${clinicId}/portal/dashboard`;
    default:
      return `/${clinicId}/dashboard`;
  }
}
