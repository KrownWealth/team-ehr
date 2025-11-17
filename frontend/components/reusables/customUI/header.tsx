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

export default function AppNavbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user } = useAuth(); // Get user from your auth context

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
            <Button
              as={Link}
              href="/dashboard"
              color="primary"
              variant="shadow"
              className="bg-green-700 hover:bg-green-800 text-white font-semibold"
            >
              Dashboard
            </Button>
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
            <NavbarMenuItem>
              <Button
                as={Link}
                href="/dashboard"
                className="w-full bg-green-700 hover:bg-green-800 text-white font-bold text-lg py-6"
              >
                Dashboard
              </Button>
            </NavbarMenuItem>
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
