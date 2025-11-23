"use client";

import { useState } from "react";
import { useAuth } from "@/lib/hooks/use-auth";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/shared/Sidebar";
import { AppNavbar } from "@/components/shared/Navbar";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { DashboardSkeleton } from "@/components/shared/loading/DashboardSkeleton";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, isLoading } = useAuth();
  const router = useRouter();

  // Show loading while auth is initializing
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#fcfcfc]">
        <DashboardSkeleton />
      </div>
    );
  }

  // Redirect to login if not authenticated after loading
  if (!user) {
    router.push("/auth/login");
    return (
      <div className="flex h-screen items-center justify-center bg-[#fcfcfc]">
        <DashboardSkeleton />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#fcfcfc] overflow-hidden">
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="p-0 w-72">
          <Sidebar onNavigate={() => setSidebarOpen(false)} />
        </SheetContent>
      </Sheet>

      <div className="flex-1 flex flex-col overflow-hidden">
        <AppNavbar onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-[1600px] mx-auto p-4 md:p-6">{children}</div>
        </main>
      </div>
    </div>
  );
}