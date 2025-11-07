"use client";

import { useAuth } from "@/lib/hooks/use-auth";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Sidebar from "@/components/shared/Sidebar";
import Navbar from "@/components/shared/Navbar";
import { canAccessRoute } from "@/lib/constants/routes";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check authentication
    if (!isAuthenticated) {
      router.push("/auth/login");
      return;
    }

    // Check route permissions
    if (user && !canAccessRoute(user.role, pathname)) {
      router.push("/404");
      return;
    }

    setIsLoading(false);
  }, [isAuthenticated, user, pathname, router]);

  if (isLoading || !isAuthenticated) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
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
