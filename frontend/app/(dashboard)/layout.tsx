"use client";

import { useState } from "react";
import { useAuth } from "@/lib/hooks/use-auth";
import Sidebar from "@/components/shared/Sidebar";
import { AppNavbar } from "@/components/shared/Navbar";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { DashboardSkeleton } from "@/components/shared/loading/DashboardSkeleton";
import Loader from "@/components/shared/Loader";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, isLoading } = useAuth();

  // Show loading while auth is initializing
  if (isLoading) {
    return <Loader />;
  }

  // Don't redirect here - middleware handles auth
  // Just show loading if no user yet (will be redirected by middleware)
  if (!user) {
    return <Loader />;
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
