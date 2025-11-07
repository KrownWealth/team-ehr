import { siteConfig } from "../siteConfig";

export const ROLES = siteConfig.roles;

export type Role = keyof typeof ROLES;

export const ROLE_HIERARCHY: Record<Role, number> = {
  ADMIN: 100,
  DOCTOR: 80,
  NURSE: 60,
  LAB_TECH: 50,
  CLERK: 40,
  CASHIER: 30,
  PATIENT: 10,
};

export function hasPermission(userRole: Role, requiredRole: Role): boolean {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
}

export function getRolesWithAccess(minimumRole: Role): Role[] {
  const minLevel = ROLE_HIERARCHY[minimumRole];
  return Object.entries(ROLE_HIERARCHY)
    .filter(([, level]) => level >= minLevel)
    .map(([role]) => role as Role);
}
