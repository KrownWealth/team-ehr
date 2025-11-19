"use client";

import { useAuth } from "@/lib/hooks/use-auth";
import { useRouter, usePathname, notFound } from "next/navigation";
import { useEffect, useState } from "react";
import Sidebar from "@/components/shared/Sidebar";
import { AppNavbar } from "@/components/shared/Navbar";
import { canAccessRoute } from "@/lib/constants/routes";
import Image from "next/image";
import { OnboardingStatus } from "@/types";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/auth/login");
      return;
    }

    if (!user?.role) {
      logout();
      return;
    }

    // ✅ FIX: Only ADMIN needs onboarding
    const isPendingOnboarding =
      user.role === "ADMIN" && user.onboardingStatus === OnboardingStatus.PENDING;
    const isOnboardingPage = pathname === "/onboarding";

    if (isPendingOnboarding && !isOnboardingPage) {
      router.push("/onboarding");
      return;
    }

    if (isPendingOnboarding && isOnboardingPage) {
      setIsLoading(false);
      return;
    }

    // ✅ FIX: Check route permissions, but don't throw 404 for valid clinic routes
    if (user && !canAccessRoute(user.role, pathname)) {
      console.log("Access denied for:", user.role, pathname);
      // Instead of notFound(), redirect to dashboard
      router.push(`/clinic/${user.clinicId}/dashboard`);
      return;
    }

    setIsLoading(false);
  }, [isAuthenticated, user, pathname, router, logout]);

  if (isLoading || !isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-[100svh] w-full">
        <div className="text-center">
          <Image
            src={"/images/icon.png"}
            width={142}
            height={142}
            priority
            alt="WCE"
            className="w-20 animate-pulse"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#fcfcfc] overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AppNavbar />
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-[1600px] mx-auto p-6">{children}</div>
        </main>
      </div>
    </div>
  );
}