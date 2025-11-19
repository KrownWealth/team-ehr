"use client";

import {
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  NavbarMenuToggle,
  NavbarMenu,
  NavbarMenuItem,
  Link,
  Button,
} from "@heroui/react";

import { useState } from "react";
import { useAuth } from "@/lib/hooks/use-auth";
import Image from "next/image";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, Settings, Mail } from "lucide-react";
import { getInitials } from "@/lib/utils/formatters";
import { getDefaultRouteForRole } from "@/lib/constants/routes";

export default function AppNavbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const clinicId = user?.clinicId;

  const dashboardUrl = user?.clinicId
    ? getDefaultRouteForRole(user.role, user.clinicId)
    : "/dashboard";

  return (
    <Navbar
      shouldHideOnScroll
      onMenuOpenChange={setIsMenuOpen}
      className="bg-white/90 backdrop-blur-md border-b border-green-100 shadow-sm py-3.5"
      maxWidth="xl"
    >
      <NavbarContent justify="start">
        <NavbarBrand>
          <Link href="/" className="flex items-center gap-2.5 cursor-pointer">
            <Image
              src={"/images/logo.png"}
              width={142}
              height={142}
              priority
              alt="WCE"
            />
          </Link>
        </NavbarBrand>
      </NavbarContent>

      <NavbarContent justify="end" className="hidden sm:flex gap-4">
        {user ? (
          <NavbarItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="flex items-center gap-3 h-13 p-2 cursor-pointer hover:bg-gray-50 rounded-xl border-none border-green-200"
                >
                  <div className="h-10 w-10 rounded-full bg-green-700 text-white flex items-center justify-center text-sm font-semibold">
                    {getInitials(user.firstName, user.lastName)}
                  </div>
                  <div className="flex-col hidden md:flex items-start">
                    <span className="text-[15px] font-medium text-gray-900 block">
                      {user.firstName} {user.lastName}
                    </span>
                    <p className="text-xs text-gray-500 font-normal mt-0.5">
                      {user.email}
                    </p>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64 mt-2">
                <DropdownMenuLabel className="py-3">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-sm font-semibold">
                      {getInitials(user.firstName, user.lastName)}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">
                        {user.firstName} {user.lastName}
                      </p>
                      <p className="text-xs text-gray-500 font-normal mt-0.5">
                        {user.email}
                      </p>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <Link href={dashboardUrl}>
                  <DropdownMenuItem className="cursor-pointer py-2.5">
                    <Settings className="mr-3 h-4 w-4 text-gray-500" />
                    Dashboard
                  </DropdownMenuItem>
                </Link>
                <DropdownMenuItem
                  className="cursor-pointer py-2.5"
                  onClick={() => {
                    window.location.href = "mailto:support@wecareehr.com";
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
          </NavbarItem>
        ) : (
          <>
            <NavbarItem>
              <Button
                as={Link}
                href="/auth/login"
                variant="bordered"
                className="border-green-700 text-green-700 hover:bg-green-50 font-semibold"
              >
                Sign In
              </Button>
            </NavbarItem>
            <NavbarItem>
              <Button
                as={Link}
                href="/auth/register"
                color="primary"
                variant="shadow"
                className="bg-green-700 hover:bg-green-800 text-white font-semibold"
              >
                Get Started
              </Button>
            </NavbarItem>
          </>
        )}
      </NavbarContent>

      {/* MOBILE TOGGLE */}
      <NavbarMenuToggle
        aria-label={isMenuOpen ? "Close menu" : "Open menu"}
        className="sm:hidden text-green-700"
      />

      <NavbarMenu className="bg-white/95 backdrop-blur-md pt-6">
        <div className="space-y-6 py-14 px-4">
          {user ? (
            <>
              <NavbarMenuItem>
                <Button
                  as={Link}
                  href={dashboardUrl}
                  className="w-full bg-green-700 hover:bg-green-800 text-white font-bold text-lg py-6"
                >
                  Dashboard
                </Button>
              </NavbarMenuItem>
              <NavbarMenuItem>
                <Button
                  onPress={logout}
                  className="w-full border-2 border-red-600 text-red-600 hover:bg-red-50 font-bold text-lg py-6"
                >
                  Logout
                </Button>
              </NavbarMenuItem>
            </>
          ) : (
            <>
              <NavbarMenuItem>
                <Link
                  href="/auth/login"
                  className="w-full text-green-700 font-bold text-lg py-3 block text-center border border-green-700 rounded-xl hover:bg-green-50"
                >
                  Sign In
                </Link>
              </NavbarMenuItem>
              <NavbarMenuItem>
                <Button
                  as={Link}
                  href="/auth/register"
                  className="w-full bg-green-700 hover:bg-green-800 text-white font-bold text-lg py-6"
                >
                  Get Started
                </Button>
              </NavbarMenuItem>
            </>
          )}
        </div>
      </NavbarMenu>
    </Navbar>
  );
}
