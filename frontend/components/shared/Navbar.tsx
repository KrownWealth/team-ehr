"use client";

import {
  Bell,
  Settings,
  LogOut,
  User,
  ChevronDown,
  MenuIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/lib/hooks/use-auth";
import { useRouter, useParams } from "next/navigation";
import { getInitials } from "@/lib/utils/formatters";
import { toast } from "sonner";

export function AppNavbar() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const params = useParams();
  const clinicId = params.clinicId as string;

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully");
    router.push("/auth/login");
  };

  const handleSettings = () => {
    if (clinicId) {
      router.push(`/clinic/${clinicId}/settings`);
    }
  };

  const handleProfile = () => {
    if (clinicId && user?.id) {
      // Navigate to profile or settings based on role
      if (user.role === "PATIENT") {
        router.push(`/clinic/${clinicId}/portal/profile`);
      } else {
        router.push(`/clinic/${clinicId}/settings`);
      }
    }
  };

  if (!user) return null;

  const userInitials = getInitials(user.firstName, user.lastName);
  const userFullName = `${user.firstName} ${user.lastName}`;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-gray-200 bg-white/95 backdrop-blur supports-backdrop-filter:bg-white/60">
      <div className="flex h-20 items-center justify-between px-6">
        <div className="flex-1">
          <button className="w-5 h-5">
            <MenuIcon />
          </button>
        </div>
        <div className="flex items-center gap-4">
          {/* Notifications */}
          {/* <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-600 text-[10px] font-medium text-white flex items-center justify-center">
              3
            </span>
          </Button> */}

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="flex items-center gap-2 hover:bg-gray-100 p-2 py-6"
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user.photoUrl} alt={userFullName} />
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-medium text-gray-900">
                    {userFullName}
                  </p>
                  <p className="text-xs text-gray-500 capitalize">
                    {user.role.toLowerCase()}
                  </p>
                </div>
                <ChevronDown className="h-4 w-4 text-gray-500" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">{userFullName}</p>
                  <p className="text-xs text-gray-500">{user.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />

              <DropdownMenuItem onClick={handleProfile}>
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>

              {user.role === "ADMIN" && (
                <DropdownMenuItem onClick={handleSettings}>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
              )}

              <DropdownMenuSeparator />

              <DropdownMenuItem
                onClick={handleLogout}
                className="text-red-600 focus:text-red-600 focus:bg-red-50"
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
