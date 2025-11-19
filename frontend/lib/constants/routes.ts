import { Role } from "./roles";

export const ROUTE_PERMISSIONS: Record<string, Role[]> = {
  // Dashboard routes - all authenticated users
  "/clinic/{id}/dashboard": ["ADMIN", "CLERK", "NURSE", "DOCTOR", "CASHIER"],

  // Patient management
  "/clinic/{id}/patients": ["ADMIN", "CLERK", "NURSE", "DOCTOR"],
  "/clinic/{id}/patients/{id}": ["ADMIN", "CLERK", "NURSE", "DOCTOR"],
  "/clinic/{id}/patients/register": ["ADMIN", "CLERK"],

  // Queue management
  "/clinic/{id}/queue": ["ADMIN", "CLERK", "NURSE", "DOCTOR"],

  // Vitals
  "/clinic/{id}/vitals": ["ADMIN", "NURSE", "DOCTOR"],

  // Consultations
  "/clinic/{id}/consultations": ["ADMIN", "DOCTOR"],
  "/clinic/{id}/consultations/{id}": ["ADMIN", "DOCTOR"],

  // Prescriptions
  "/clinic/{id}/prescriptions": ["ADMIN", "DOCTOR"],
  "/clinic/{id}/prescriptions/{id}": ["ADMIN", "DOCTOR"],
  "/clinic/{id}/prescriptions/create": ["ADMIN", "DOCTOR"],
  "/clinic/{id}/prescriptions/{id}/print": ["ADMIN", "DOCTOR"],

  // Lab orders (if implemented)
  "/clinic/{id}/lab-orders": ["ADMIN", "DOCTOR"],

  // Staff management
  "/clinic/{id}/staff": ["ADMIN"],

  // Settings
  "/clinic/{id}/settings": ["ADMIN"],

  // Billing
  "/clinic/{id}/billing": ["ADMIN", "CASHIER"],
};

export function canAccessRoute(
  userRole: Role | undefined,
  route: string
): boolean {
  if (!userRole) return false;

  // Allow access to base clinic route
  if (route.match(/^\/clinic\/[^\/]+$/)) {
    return true;
  }

  const segments = route.split("/").filter((s) => s.length > 0);

  // Must have at least: clinic, {id}, route
  if (segments.length < 3 || segments[0] !== "clinic") {
    return true; // Allow non-clinic routes
  }

  // Build the route pattern: /clinic/{id}/routeName/...
  const routeParts = segments.slice(2); // Remove 'clinic' and clinicId

  // Replace UUIDs with {id} placeholder
  const normalizedParts = routeParts.map((part) =>
    /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(part)
      ? "{id}"
      : part
  );

  const cleanRoute = "/clinic/{id}/" + normalizedParts.join("/");

  // Check exact match first
  const allowedRoles = ROUTE_PERMISSIONS[cleanRoute];
  if (allowedRoles) {
    return allowedRoles.includes(userRole);
  }

  // Check parent route (for nested routes)
  const parentRoute = "/clinic/{id}/" + normalizedParts[0];
  const parentAllowedRoles = ROUTE_PERMISSIONS[parentRoute];
  if (parentAllowedRoles) {
    return parentAllowedRoles.includes(userRole);
  }

  // If no specific permissions defined, allow access
  return true;
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
    case "CASHIER":
      return `/clinic/${clinicId}/dashboard`;
    case "PATIENT":
      return `/clinic/${clinicId}/portal/dashboard`;
    default:
      return `/clinic/${clinicId}/dashboard`;
  }
}
