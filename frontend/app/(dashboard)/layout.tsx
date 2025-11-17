"use client";

import { useAuth } from "@/lib/hooks/use-auth";
import { useRouter, usePathname, notFound } from "next/navigation";
import { useEffect, useState } from "react";
import Sidebar from "@/components/shared/Sidebar";
import Navbar from "@/components/shared/Navbar";
import { canAccessRoute } from "@/lib/constants/routes";
import { toast } from "sonner";
import Image from "next/image";

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

    console.log("user", user);

    if (!user?.role) {
      logout();
      return;
    }

    if (user && !canAccessRoute(user.role, pathname)) {
      notFound();
      return;
    }

    setIsLoading(false);
  }, [isAuthenticated, user, pathname, router]);

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
        <Navbar />
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-[1600px] mx-auto p-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
