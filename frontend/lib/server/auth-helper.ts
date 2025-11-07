import { cookies } from "next/headers";
import { jwtDecode } from "jwt-decode";
import { User, AuthTokenPayload } from "@/types";

export async function getServerAuth(): Promise<{
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}> {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value || null;
  const userDataStr = cookieStore.get("user_data")?.value || null;

  if (!token || !userDataStr) {
    return { user: null, token: null, isAuthenticated: false };
  }

  try {
    const decoded = jwtDecode<AuthTokenPayload>(token);
    const currentTime = Date.now() / 1000;

    if (decoded.exp < currentTime) {
      return { user: null, token: null, isAuthenticated: false };
    }

    const user = JSON.parse(userDataStr) as User;

    return { user, token, isAuthenticated: true };
  } catch (error) {
    console.error("Failed to parse auth data:", error);
    return { user: null, token: null, isAuthenticated: false };
  }
}

export async function getServerUser(): Promise<User | null> {
  const { user } = await getServerAuth();
  return user;
}

export async function requireServerAuth() {
  const { user, isAuthenticated } = await getServerAuth();

  if (!isAuthenticated || !user) {
    throw new Error("Unauthorized");
  }

  return user;
}
