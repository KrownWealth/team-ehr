"use client";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/hooks/use-auth";
import { Bell, ChevronRight, LogOut, Mail, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getInitials } from "@/lib/utils/formatters";

export default function Navbar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const clinicId = user?.clinicId;

  const pathSegments = pathname.split("/").filter(Boolean);
  const breadcrumbs = pathSegments.slice(1).map((segment, index) => ({
    label: segment
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" "),
    href: `/${pathSegments.slice(0, index + 2).join("/")}`,
    isLast: index === pathSegments.length - 2,
  }));

  return (
    <header className="h-[80px] bg-white border-b border-gray-100 flex items-center justify-between px-8">
      <nav className="flex items-center gap-2 text-[18px]">
        {breadcrumbs.map((crumb, index) => (
          <div key={crumb.href} className="flex items-center gap-2">
            {index > 0 && <ChevronRight className="h-4 w-4 text-gray-300" />}
            <span
              className={
                crumb.isLast ? "font-semibold text-gray-900" : "text-gray-500"
              }
            >
              {crumb.label}
            </span>
          </div>
        ))}
      </nav>

      <div className="flex items-center gap-4">
        {/* <Button
          variant="ghost"
          size="icon"
          className="relative h-10 w-10 hover:bg-gray-50 rounded-xl"
        >
          <Bell className="h-5 w-5 text-gray-600" />
          <span className="absolute top-2 right-2 h-2 w-2 bg-red-500 rounded-full"></span>
        </Button> */}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="flex items-center gap-3 h-10 px-1 cursor-pointer hover:bg-gray-50 rounded-xl"
            >
              <div className="h-10 w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">
                {user && getInitials(user.firstName, user.lastName)}
              </div>
              <div className="flex-col hidden md:flex items-start">
                <span className="text-[15px] font-medium text-gray-900 block">
                  {user?.firstName} {user?.lastName}
                </span>
                <p className="text-xs text-gray-500 font-normal mt-0.5">
                  {user?.email}
                </p>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64 mt-2">
            <DropdownMenuLabel className="py-3">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-sm font-semibold">
                  {user && getInitials(user.firstName, user.lastName)}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p className="text-xs text-gray-500 font-normal mt-0.5">
                    {user?.email}
                  </p>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <Link href={`/clinic/${clinicId}/settings`}>
              <DropdownMenuItem className="cursor-pointer py-2.5">
                <Settings className="mr-3 h-4 w-4 text-gray-500" />
                Settings
              </DropdownMenuItem>
            </Link>
            <DropdownMenuItem
              className="cursor-pointer py-2.5"
              onClick={() => {
                window.location.href = "mailto:support@yourapp.com";
              }}
            >
              <Mail className="mr-3 h-4 w-4 text-gray-500" />
              Help & Support
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="cursor-pointer py-2.5 text-red-600 focus:text-red-600 focus:bg-red-50"
              onClick={logout}
            >
              <LogOut className="mr-3 h-4 w-4" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
