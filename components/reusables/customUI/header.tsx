"use client";

import {
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  NavbarMenuToggle,
  NavbarMenuItem,
  NavbarMenu,
  Link,
  Button,
} from "@heroui/react";

import { Heart } from "lucide-react";
import { useState } from "react";

export default function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <Navbar
      shouldHideOnScroll
      onMenuOpenChange={setIsMenuOpen}
      className="pt-4 bg-transparent w-full"
      maxWidth="xl"
    >
      <NavbarContent justify="start" className="gap-2">
        <NavbarBrand>
          <Link
            href="/"
            className="flex items-center space-x-2.5 cursor-pointer"
          >
            <Heart className="text-xl text-primary-400" />
            <p className="font-bold text-white text-2xl">HealthCare+</p>
          </Link>
        </NavbarBrand>
      </NavbarContent>

      <NavbarContent
        justify="end"
        className="text-lg font-semibold gap-6 sm:flex hidden"
      >
        <NavbarItem>
          <Link href="/login" className="text-white hover:text-primary-400">
            Login
          </Link>
        </NavbarItem>
        <NavbarItem>
          <Button as={Link} color="primary" href="/signup" variant="flat">
            Get Started
          </Button>
        </NavbarItem>
      </NavbarContent>

      <NavbarMenuToggle
        aria-label={isMenuOpen ? "Close menu" : "Open menu"}
        className="sm:hidden"
      />

      <NavbarMenu className="mt-4">
        <NavbarMenuItem className="space-y-6">
          <Link
            href="/login"
            className="w-full text-primary font-semibold"
            size="lg"
          >
            Login
          </Link>

          <Link
            href="/signup"
            className="w-full text-primary font-semibold"
            size="lg"
          >
            Get Started
          </Link>
        </NavbarMenuItem>
      </NavbarMenu>
    </Navbar>
  );
}
