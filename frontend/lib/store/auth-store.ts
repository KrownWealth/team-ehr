// @/lib/stores/auth-store.ts

import { create } from "zustand";
import { User, OnboardingStatus } from "@/types";
import { getCookie, setCookie, deleteCookie } from "cookies-next";

type StoredUser = User;

interface AuthState {
  user: StoredUser | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isInitialized: boolean; // ADD THIS
  setAuth: (token: string, refreshToken: string, user: StoredUser) => void;
  updateToken: (token: string) => void;
  logout: () => void;
  updateUser: (user: Partial<StoredUser>) => void;
  initializeAuth: () => void;
  setOnboardingStatus: (status: OnboardingStatus, clinicId?: string) => void;
}

const COOKIE_OPTIONS = {
  maxAge: 60 * 60 * 24 * 7, // 7 days
  path: "/",
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  refreshToken: null,
  isAuthenticated: false,
  isInitialized: false, // ADD THIS

  setAuth: (token: string, refreshToken: string, user: StoredUser) => {
    try {
      setCookie("auth_token", token, COOKIE_OPTIONS);
      setCookie("refresh_token", refreshToken, COOKIE_OPTIONS);
      setCookie("user_data", JSON.stringify(user), COOKIE_OPTIONS);

      if (
        typeof window !== "undefined" &&
        process.env.NODE_ENV === "development"
      ) {
        const tokenSet = getCookie("auth_token");
        const userSet = getCookie("user_data");
        console.log("🔐 Auth cookies set:", {
          hasToken: !!tokenSet,
          hasRefreshToken: !!getCookie("refresh_token"),
          hasUser: !!userSet,
          clinicId: user.clinicId,
          role: user.role,
          userId: user.id,
        });
      }

      set({
        user,
        token,
        refreshToken,
        isAuthenticated: true,
        isInitialized: true, // ADD THIS
      });
    } catch (error) {
      console.error("❌ Failed to set auth cookies:", error);
      throw error;
    }
  },

  updateToken: (token: string) => {
    try {
      setCookie("auth_token", token, COOKIE_OPTIONS);
      set({ token });

      if (process.env.NODE_ENV === "development") {
        console.log("🔄 Token updated");
      }
    } catch (error) {
      console.error("❌ Failed to update token:", error);
    }
  },

  logout: () => {
    try {
      deleteCookie("auth_token", { path: "/" });
      deleteCookie("refresh_token", { path: "/" });
      deleteCookie("user_data", { path: "/" });

      set({
        user: null,
        token: null,
        refreshToken: null,
        isAuthenticated: false,
        isInitialized: true, // KEEP THIS TRUE - we know the auth state (logged out)
      });

      if (process.env.NODE_ENV === "development") {
        console.log("👋 User logged out");
      }
    } catch (error) {
      console.error("❌ Logout error:", error);
    }
  },

  updateUser: (userData: Partial<StoredUser>) => {
    set((state) => {
      if (!state.user) {
        console.warn("⚠️ Cannot update user: No user in state");
        return state;
      }

      try {
        const updatedUser: StoredUser = { ...state.user, ...userData };
        setCookie("user_data", JSON.stringify(updatedUser), COOKIE_OPTIONS);

        if (process.env.NODE_ENV === "development") {
          console.log("👤 User data updated:", userData);
        }

        return { user: updatedUser };
      } catch (error) {
        console.error("❌ Failed to update user:", error);
        return state;
      }
    });
  },

  setOnboardingStatus: (status: OnboardingStatus, clinicId?: string) => {
    set((state) => {
      if (!state.user) {
        console.warn("⚠️ Cannot set onboarding status: No user in state");
        return state;
      }

      try {
        const updatedUser: StoredUser = {
          ...state.user,
          onboardingStatus: status,
        };

        if (clinicId) {
          updatedUser.clinicId = clinicId;
        }

        setCookie("user_data", JSON.stringify(updatedUser), COOKIE_OPTIONS);

        if (process.env.NODE_ENV === "development") {
          console.log("🎯 Onboarding status updated:", { status, clinicId });
        }

        return { user: updatedUser };
      } catch (error) {
        console.error("❌ Failed to set onboarding status:", error);
        return state;
      }
    });
  },

  initializeAuth: () => {
    try {
      const token = getCookie("auth_token") as string | undefined;
      const refreshToken = getCookie("refresh_token") as string | undefined;
      const userDataStr = getCookie("user_data") as string | undefined;

      if (process.env.NODE_ENV === "development") {
        console.log("🚀 Initializing auth:", {
          hasToken: !!token,
          hasRefreshToken: !!refreshToken,
          hasUserData: !!userDataStr,
        });
      }

      if (token && userDataStr) {
        try {
          const user = JSON.parse(userDataStr) as StoredUser;

          set({
            user,
            token,
            refreshToken: refreshToken || null,
            isAuthenticated: true,
            isInitialized: true, // ADD THIS
          });

          if (process.env.NODE_ENV === "development") {
            console.log("✅ Auth initialized:", {
              userId: user.id,
              role: user.role,
              clinicId: user.clinicId,
              onboardingStatus: user.onboardingStatus,
            });
          }
        } catch (parseError) {
          console.error("❌ Failed to parse user data:", parseError);

          deleteCookie("auth_token", { path: "/" });
          deleteCookie("refresh_token", { path: "/" });
          deleteCookie("user_data", { path: "/" });

          set({
            user: null,
            token: null,
            refreshToken: null,
            isAuthenticated: false,
            isInitialized: true, // ADD THIS - initialization complete, just no user
          });
        }
      } else {
        if (process.env.NODE_ENV === "development") {
          console.log("ℹ️ No auth data found in cookies");
        }

        // ADD THIS - mark as initialized even when no auth data
        set({
          isInitialized: true,
        });
      }
    } catch (error) {
      console.error("❌ Auth initialization error:", error);

      set({
        user: null,
        token: null,
        refreshToken: null,
        isAuthenticated: false,
        isInitialized: true, // ADD THIS - initialization attempted
      });
    }
  },
}));

// Update helper functions
export const getAuthState = () => {
  const state = useAuthStore.getState();
  return {
    isAuthenticated: state.isAuthenticated,
    isInitialized: state.isInitialized, // ADD THIS
    hasUser: !!state.user,
    hasToken: !!state.token,
    userId: state.user?.id,
    clinicId: state.user?.clinicId,
    role: state.user?.role,
    onboardingStatus: state.user?.onboardingStatus,
  };
};

export const verifyCookies = () => {
  const token = getCookie("auth_token");
  const refreshToken = getCookie("refresh_token");
  const userData = getCookie("user_data");

  console.log("🍪 Cookie verification:", {
    hasToken: !!token,
    hasRefreshToken: !!refreshToken,
    hasUserData: !!userData,
    tokenLength: token ? String(token).length : 0,
    userDataLength: userData ? String(userData).length : 0,
  });

  if (userData) {
    try {
      const parsed = JSON.parse(String(userData));
      console.log("📦 Parsed user data:", {
        id: parsed.id,
        email: parsed.email,
        role: parsed.role,
        clinicId: parsed.clinicId,
        onboardingStatus: parsed.onboardingStatus,
      });
    } catch (e) {
      console.error("❌ Failed to parse user data:", e);
    }
  }

  return {
    token: !!token,
    refreshToken: !!refreshToken,
    userData: !!userData,
  };
};
