import { create } from "zustand";
import { User, OnboardingStatus } from "@/types";
import { getCookie, setCookie, deleteCookie } from "cookies-next";

type StoredUser = User;

interface AuthState {
  user: StoredUser | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  setAuth: (token: string, refreshToken: string, user: StoredUser) => void;
  updateToken: (token: string) => void;
  logout: () => void;
  updateUser: (user: Partial<StoredUser>) => void;
  initializeAuth: () => void;
  setOnboardingStatus: (status: OnboardingStatus, clinicId?: string) => void;
}

const COOKIE_OPTIONS = {
  maxAge: 60 * 60 * 24 * 7,
  path: "/",
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  refreshToken: null,
  isAuthenticated: false,

  setAuth: (token: string, refreshToken: string, user: StoredUser) => {
    setCookie("auth_token", token, COOKIE_OPTIONS);
    setCookie("refresh_token", refreshToken, COOKIE_OPTIONS);
    setCookie("user_data", JSON.stringify(user), COOKIE_OPTIONS);

    set({ user, token, refreshToken, isAuthenticated: true });
  },

  updateToken: (token: string) => {
    setCookie("auth_token", token, COOKIE_OPTIONS);
    set({ token });
  },

  logout: () => {
    deleteCookie("auth_token");
    deleteCookie("refresh_token");
    deleteCookie("user_data");

    set({
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
    });
  },

  updateUser: (userData: Partial<StoredUser>) => {
    set((state) => {
      if (!state.user) return state;

      const updatedUser: StoredUser = { ...state.user, ...userData };

      setCookie("user_data", JSON.stringify(updatedUser), COOKIE_OPTIONS);

      return { user: updatedUser };
    });
  },

  setOnboardingStatus: (status: OnboardingStatus, clinicId?: string) => {
    set((state) => {
      if (!state.user) return state;

      const updatedUser: StoredUser = {
        ...state.user,
        onboardingStatus: status,
      };

      if (clinicId) {
        updatedUser.clinicId = clinicId;
      }

      setCookie("user_data", JSON.stringify(updatedUser), COOKIE_OPTIONS);

      return { user: updatedUser };
    });
  },

  initializeAuth: () => {
    const token = getCookie("auth_token") as string | undefined;
    const refreshToken = getCookie("refresh_token") as string | undefined;
    const userDataStr = getCookie("user_data") as string | undefined;

    if (token && userDataStr) {
      try {
        const user = JSON.parse(userDataStr) as StoredUser;
        set({
          user,
          token,
          refreshToken: refreshToken || null,
          isAuthenticated: true,
        });
      } catch (error) {
        deleteCookie("auth_token");
        deleteCookie("refresh_token");
        deleteCookie("user_data");
      }
    }
  },
}));
