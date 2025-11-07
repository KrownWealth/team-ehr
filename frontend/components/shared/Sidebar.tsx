"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  UserPlus,
  Heart,
  Stethoscope,
  Pill,
  FlaskConical,
  UserCog,
  Settings,
  CreditCard,
  LogOut,
  ListChecks,
} from "lucide-react";
import { useAuth } from "@/lib/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/lib/siteConfig";
import { Role } from "@/lib/constants/roles";

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  roles: Role[];
}

const navigation: NavItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    roles: ["ADMIN", "CLERK", "NURSE", "DOCTOR", "LAB_TECH", "CASHIER"],
  },
  {
    title: "Patients",
    href: "/patients",
    icon: Users,
    roles: ["ADMIN", "CLERK", "NURSE", "DOCTOR"],
  },
  {
    title: "Register Patient",
    href: "/patients/register",
    icon: UserPlus,
    roles: ["ADMIN", "CLERK"],
  },
  {
    title: "Queue",
    href: "/queue",
    icon: ListChecks,
    roles: ["CLERK", "NURSE", "DOCTOR"],
  },
  {
    title: "Vitals",
    href: "/vitals",
    icon: Heart,
    roles: ["NURSE", "DOCTOR"],
  },
  {
    title: "Consultations",
    href: "/consultations",
    icon: Stethoscope,
    roles: ["DOCTOR"],
  },
  {
    title: "Prescriptions",
    href: "/prescriptions",
    icon: Pill,
    roles: ["DOCTOR"],
  },
  {
    title: "Lab Orders",
    href: "/lab-orders",
    icon: FlaskConical,
    roles: ["DOCTOR", "LAB_TECH"],
  },
  {
    title: "Staff",
    href: "/staff",
    icon: UserCog,
    roles: ["ADMIN"],
  },
  {
    title: "Settings",
    href: "/settings",
    icon: Settings,
    roles: ["ADMIN"],
  },
  {
    title: "Billing",
    href: "/billing",
    icon: CreditCard,
    roles: ["ADMIN", "CASHIER"],
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const clinicId = user?.clinicId;

  // Filter navigation based on user role
  const allowedItems = navigation.filter((item) =>
    user?.role ? item.roles.includes(user.role) : false
  );

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col h-screen">
      {/* Logo */}
      <div className="h-16 flex items-center px-6 border-b">
        <h1 className="text-xl font-bold text-blue-600">{siteConfig.name}</h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3">
        <ul className="space-y-1">
          {allowedItems.map((item) => {
            const href = `/${clinicId}${item.href}`;
            const isActive = pathname.startsWith(href);
            const Icon = item.icon;

            return (
              <li key={item.href}>
                <Link
                  href={href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                    isActive
                      ? "bg-blue-50 text-blue-600"
                      : "text-gray-700 hover:bg-gray-50"
                  )}
                >
                  <Icon className="h-5 w-5" />
                  {item.title}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User Info & Logout */}
      <div className="p-4 border-t">
        <div className="mb-3">
          <p className="text-sm font-medium text-gray-900">
            {user?.firstName} {user?.lastName}
          </p>
          <p className="text-xs text-gray-500 capitalize">
            {user?.role.toLowerCase().replace("_", " ")}
          </p>
        </div>
        <Button variant="outline" size="sm" className="w-full" onClick={logout}>
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </div>
    </aside>
  );
}
