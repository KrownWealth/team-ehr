"use client";
import { useAuth } from "@/lib/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { siteConfig } from "@/lib/siteConfig";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      console.log("Authenticated user:", user);

      // ✅ FIX: Only redirect ADMIN to onboarding
      if (user.role === "ADMIN" && user.onboardingStatus === "PENDING") {
        router.push("/onboarding");
        return;
      }

      // ✅ FIX: All authenticated users with clinicId go to dashboard
      if (user.clinicId) {
        const defaultRoute =
          user.role === "PATIENT"
            ? `/clinic/${user.clinicId}/portal/dashboard`
            : `/clinic/${user.clinicId}/dashboard`;

        router.push(defaultRoute);
      }
    }
  }, [user, router]);

  // Show loading only if authenticated AND has clinicId (ready to redirect)
  if (user?.clinicId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Redirecting...</p>
        </div>
      </div>
    );
  }

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