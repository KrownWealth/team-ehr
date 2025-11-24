"use client";

import { cn } from "@/lib";
import { useAuth } from "@/lib/hooks/use-auth";
import { siteConfig } from "@/lib/siteConfig";
import { LogOutIcon, MailIcon, Menu, SettingsIcon, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getInitials } from "@/lib/utils/formatters";
import { getDefaultRouteForRole } from "@/lib/constants/routes";

const nlinks = [
  {
    name: "About",
    link: "#About",
  },
  {
    name: "Features",
    link: "#Features",
  },
  {
    name: "Pricing",
    link: "#Pricing",
  },
  {
    name: "How It Works",
    link: "#how-it-works",
  },
  {
    name: "Contact Us",
    link: "#Contact",
  },
];

function Navbar() {
  const { user, logout } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const dashboardUrl = user?.clinicId
    ? getDefaultRouteForRole(user.role, user.clinicId)
    : "/dashboard";

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    handleScroll();

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
  }, [isOpen]);

  return (
    <header
      className={cn(
        "header fixed top-5 z-[999] w-full left-0 right-0 h-20 rounded-full px-6 max-w-[calc(100%-28px)] mx-auto py-2 flex justify-between gap-5 items-center transition-all duration-300",
        scrolled || isOpen
          ? "bg-white text-black shadow-sm top-3"
          : "bg-white/0 text-white"
      )}
    >
      <Link href={"/"} className="block relative z-[1000] md:w-45">
        <Image
          src={"/images/logo.png"}
          alt={siteConfig.name}
          width={409}
          height={142}
          className={cn(
            "w-32 md:w-45 transition-all duration-300",
            scrolled || isOpen ? "md:w-36" : "filter brightness-0 invert"
          )}
          priority
        />
      </Link>

      <ul className="hidden lg:inline-flex gap-6 justify-center items-center">
        {nlinks.map((x) => (
          <li key={x.link}>
            <Link
              href={x.link}
              className="capitalize font-semibold hover:opacity-70 transition-opacity"
            >
              {x.name}
            </Link>
          </li>
        ))}
      </ul>

      {!!user ? (
        <div className="hidden lg:block">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-1.5 h-13 p-2 cursor-pointer hover:opacity-80 rounded-xl border-none border-green-200 bg-white">
                <div className="h-10 w-10 rounded-full bg-primary text-white flex items-center justify-center text-sm font-semibold">
                  {getInitials(user.firstName, user.lastName)}
                </div>
                <div className="flex-col hidden md:flex items-start">
                  <span
                    className={cn(
                      "text-[15px] font-medium text-gray-900 block max-w-36 truncate"
                    )}
                  >
                    {user.firstName} {user.lastName}
                  </span>
                  <p
                    className={cn(
                      "text-xs text-gray-500 font-normal mt-0 max-w-36 truncate"
                    )}
                  >
                    {user.email}
                  </p>
                </div>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64 mt-2">
              <DropdownMenuLabel className="py-3">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-green-100 text-primary flex items-center justify-center text-sm font-semibold">
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
              <Link href={dashboardUrl} className="w-full">
                <DropdownMenuItem className="cursor-pointer py-2.5">
                  <SettingsIcon className="mr-3 h-4 w-4 text-gray-500" />
                  Dashboard
                </DropdownMenuItem>
              </Link>
              <DropdownMenuItem
                className="cursor-pointer py-2.5"
                onClick={() => {
                  window.location.href = "mailto:support@wecareehr.com";
                }}
              >
                <MailIcon className="mr-3 h-4 w-4 text-gray-500" />
                Help & Support
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="cursor-pointer py-2.5 text-red-600 focus:text-red-600 focus:bg-red-50"
                onClick={logout}
              >
                <LogOutIcon className="mr-3 h-4 w-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ) : (
        <div className="hidden lg:flex gap-3 items-center">
          <Link
            className={cn(
              "block font-semibold px-6 transition-colors hover:opacity-70",
              scrolled ? "text-black" : "text-white"
            )}
            href={"/auth/login"}
          >
            Login
          </Link>

          <Link
            href={"/auth/register"}
            className={cn(
              "block font-semibold px-6 py-3 rounded-full transition-colors hover:bg-opacity-90",
              scrolled ? "bg-primary text-white" : "bg-white text-black"
            )}
          >
            Get Started
          </Link>
        </div>
      )}

      <button
        className="lg:hidden relative z-[1000] p-2"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? (
          <X className="w-6 h-6 text-black" />
        ) : (
          <Menu
            className={cn("w-6 h-6", scrolled ? "text-black" : "text-white")}
          />
        )}
      </button>

      <div
        className={cn(
          "fixed inset-0 bg-white z-[990] flex flex-col justify-center items-center gap-8 transition-transform duration-300 ease-in-out lg:hidden",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        <ul className="flex flex-col gap-6 text-center">
          {nlinks.map((x) => (
            <li key={x.link}>
              <Link
                href={x.link}
                className="text-2xl font-semibold text-black capitalize"
                onClick={() => setIsOpen(false)}
              >
                {x.name}
              </Link>
            </li>
          ))}
        </ul>

        <div className="flex flex-col gap-4 mt-4 w-full px-10 max-w-sm">
          {!!user ? (
            <>
              <Link
                href={dashboardUrl}
                className="w-full bg-primary hover:bg-green-800 text-white font-bold text-lg py-5 btn rounded-full"
              >
                Dashboard
              </Link>
              <button
                onClick={logout}
                className="w-full border-2 border-red-600 text-red-600 hover:bg-red-50 font-bold text-lg py-5 rounded-full"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                className="block w-full text-center font-semibold text-black py-3 border border-gray-200 rounded-full"
                href={"/auth/login"}
                onClick={() => setIsOpen(false)}
              >
                Login
              </Link>
              <Link
                href={"/auth/register"}
                className="block w-full text-center font-semibold bg-primary text-white px-6 py-3 rounded-full"
                onClick={() => setIsOpen(false)}
              >
                Get Started
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

export default Navbar;
