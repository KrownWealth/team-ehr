"use client";

import { useAuth } from "@/lib/hooks/use-auth";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Sidebar from "@/components/shared/Sidebar";
import { canAccessRoute } from "@/lib/constants/routes";
import Image from "next/image";
import { OnboardingStatus } from "@/types";
import { AppNavbar } from "@/components/shared/Navbar";

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
      if (!user || user.role === "ADMIN") {
        router.push("/auth/login");
      }
      return;
    }

    if (!user?.role) {
      logout();
      return;
    }

    const isPendingOnboarding =
      user.onboardingStatus === OnboardingStatus.PENDING;
    const isOnboardingPage = pathname === "/onboarding";

    if (isPendingOnboarding && !isOnboardingPage) {
      router.push("/onboarding");
      return;
    }

    if (isPendingOnboarding && isOnboardingPage) {
      setIsLoading(false);
      return;
    }

    if (user && !canAccessRoute(user.role, pathname)) {
      if (user.clinicId) {
        const defaultRoute =
          user.role === "PATIENT"
            ? `/clinic/${user.clinicId}/portal/dashboard`
            : `/clinic/${user.clinicId}/dashboard`;
        router.push(defaultRoute);
      }
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
