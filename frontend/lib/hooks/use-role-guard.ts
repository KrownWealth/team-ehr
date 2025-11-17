"use client";

import { useAuth } from "./use-auth";
import { Role } from "../constants/roles";

export function useRoleGuard(allowedRoles: Role[]) {
  const { user, isAuthenticated } = useAuth();

  const isAuthorized =
    isAuthenticated && user && allowedRoles.includes(user.role);

  return {
    isAuthorized,
    isLoading: false,
    user,
    hasRole: (role: Role) => user?.role === role,
    hasAnyRole: (roles: Role[]) => user && roles.includes(user.role),
  };
}
