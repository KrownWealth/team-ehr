"use client";
import { useAuth } from "@/lib/hooks/use-auth";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import { siteConfig } from "@/lib/siteConfig";
import { getDefaultRouteForRole } from "@/lib/constants/routes";
import Loader from "@/components/shared/Loader";
import Image from "next/image";
import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (user) {
      if (pathname === "/auth/change-password") {
        return;
      }

      if (user.mustChangePassword) {
        router.push("/auth/change-password");
        return;
      }

      if (user.onboardingStatus === "PENDING") {
        router.push("/onboarding");
        return;
      }

      if (user.clinicId) {
        const defaultRoute = getDefaultRouteForRole(user.role, user.clinicId);
        router.push(defaultRoute);
      }
    }
  }, [user, router, pathname]);

  if (
    user?.clinicId &&
    pathname !== "/auth/change-password" &&
    !user?.mustChangePassword
  ) {
    return <Loader />;
  }

  if (user?.mustChangePassword && pathname !== "/auth/change-password") {
    return <Loader />;
  }

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 flex-col p-12 relative overflow-hidden bg-primary text-primary-foreground">
        <div className="absolute inset-0 bg-gradient-to-br from-primary to-accent opacity-30 pointer-events-none"></div>
        <div className="absolute -top-20 -left-20 w-72 h-72 bg-accent opacity-20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute top-40 right-0 w-96 h-96 bg-secondary opacity-15 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-10 left-10 w-64 h-64 bg-primary-foreground opacity-5 rounded-full blur-2xl pointer-events-none"></div>

        <div className="relative z-10">
          <Link href={"/"} className="block">
            <Image
              src={"/images/logo.png"}
              alt={siteConfig.name}
              width={409}
              height={142}
              className="w-60 filter brightness-0 invert"
              priority
            />
          </Link>
          <br />
          <p className="text-xl max-w-lg leading-relaxed font-semibold">
            Our goal is to continuously improve the quality and accessibility of
            public healthcare services using digital tools.
          </p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center bg-background p-6">
        <div className="flex-1 flex flex-col gap-5 max-w-lg mx-auto">
          <Link href={"/"} className="block">
            <Image
              src={"/images/logo.png"}
              alt={siteConfig.name}
              width={409}
              height={142}
              className="w-40 md:w-45 lg:hidden flex"
              priority
            />
          </Link>
          <div className="flex-1">{children}</div>
        </div>
      </div>
    </div>
  );
}
