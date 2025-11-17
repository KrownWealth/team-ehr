import { create } from "zustand";
import { jwtDecode } from "jwt-decode";
import { User, AuthTokenPayload } from "@/types";
import { getCookie, setCookie, deleteCookie } from "cookies-next";

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  setAuth: (token: string) => void;
  logout: () => void;
  updateUser: (user: Partial<User>) => void;
  initializeAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,

  setAuth: (token: string) => {
    try {
      const decoded: AuthTokenPayload = jwtDecode(token);

      const user: User = {
        id: decoded.userId,
        email: decoded.email,
        firstName: decoded.firstName,
        lastName: decoded.lastName,
        role: decoded.role,
        clinicId: decoded.clinicId,
        status: "active",
        createdAt: new Date().toISOString(),
      };

      setCookie("auth_token", token, {
        path: "/",
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
      });

      setCookie("user_data", JSON.stringify(user), {
        path: "/",
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
      });

      set({ user, token, isAuthenticated: true });
    } catch (error) {
      console.error("Invalid token", error);
      set({ user: null, token: null, isAuthenticated: false });
    }
  },

  logout: () => {
    deleteCookie("auth_token");
    deleteCookie("user_data");

    set({ user: null, token: null, isAuthenticated: false });

    if (typeof window !== "undefined") {
      window.location.href = "/auth/login";
    }
  },

  updateUser: (userData: Partial<User>) => {
    set((state) => {
      if (!state.user) return state;

      const updatedUser = { ...state.user, ...userData };

      setCookie("user_data", JSON.stringify(updatedUser), {
        maxAge: 60 * 60 * 24 * 7,
        path: "/",
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
      });

      return { user: updatedUser };
    });
  },

  initializeAuth: () => {
    const token = getCookie("auth_token") as string | undefined;
    const userDataStr = getCookie("user_data") as string | undefined;

    if (token && userDataStr) {
      try {
        const user = JSON.parse(userDataStr) as User;
        set({ user, token, isAuthenticated: true });
      } catch (error) {
        console.error("Failed to parse user data from cookie", error);
        deleteCookie("auth_token");
        deleteCookie("user_data");
      }
    }
  },
}));
