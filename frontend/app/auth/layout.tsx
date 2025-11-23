"use client";
import { useAuth } from "@/lib/hooks/use-auth";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import { siteConfig } from "@/lib/siteConfig";
import { getDefaultRouteForRole } from "@/lib/constants/routes";
import Loader from "@/components/shared/Loader";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // const { user } = useAuth();
  // const router = useRouter();
  // const pathname = usePathname();

  // useEffect(() => {
  //   if (user) {
  //     // Don't redirect if user is on change-password page
  //     if (pathname === "/auth/change-password") {
  //       return;
  //     }

  //     // If user must change password, redirect to change-password
  //     if (user.mustChangePassword) {
  //       router.push("/auth/change-password");
  //       return;
  //     }

  //     // redirect based on onboarding status
  //     if (user.onboardingStatus === "PENDING") {
  //       router.push("/onboarding");
  //       return;
  //     }

  //     // Redirect to dashboard if user has completed onboarding
  //     if (user.clinicId) {
  //       const defaultRoute = getDefaultRouteForRole(user.role, user.clinicId);
  //       router.push(defaultRoute);
  //     }
  //   }
  // }, [user, router, pathname]);

  // // Show loader only if redirecting (not on change-password page)
  // if (user?.clinicId && pathname !== "/auth/change-password" && !user?.mustChangePassword) {
  //   return <Loader />;
  // }

  // // Show loader if user must change password but not on the change-password page yet
  // if (user?.mustChangePassword && pathname !== "/auth/change-password") {
  //   return <Loader />;
  // }

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 flex-col p-12 relative overflow-hidden bg-primary text-primary-foreground">
        <div className="absolute inset-0 bg-gradient-to-br from-primary to-accent opacity-30 pointer-events-none"></div>
        <div className="absolute -top-20 -left-20 w-72 h-72 bg-accent opacity-20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute top-40 right-0 w-96 h-96 bg-secondary opacity-15 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-10 left-10 w-64 h-64 bg-primary-foreground opacity-5 rounded-full blur-2xl pointer-events-none"></div>

        <div className="relative z-10">
          <h1 className="text-7xl font-extrabold mb-6 leading-tight tracking-tight">
            {siteConfig.name}
          </h1>
          <p className="text-xl max-w-md leading-relaxed">
            Our goal is to continuously improve the quality and accessibility of
            public healthcare services using digital tools.
          </p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center bg-background">
        {children}
      </div>
    </div>
  );
}