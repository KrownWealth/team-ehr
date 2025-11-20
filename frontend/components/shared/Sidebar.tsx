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
import Image from "next/image";

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  roles: Role[];
}

interface SidebarProps {
  onNavigate?: () => void;
}

const navigation: NavItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    roles: ["ADMIN", "CLERK", "NURSE", "DOCTOR"],
  },
  {
    title: "Patients",
    href: "/patients",
    icon: Users,
    roles: ["ADMIN", "CLERK", "NURSE", "DOCTOR"],
  },
  {
    title: "Queue",
    href: "/queue",
    icon: ListChecks,
    roles: ["CLERK", "NURSE", "DOCTOR", "ADMIN"],
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
];

export default function Sidebar({ onNavigate }: SidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const clinicId = user?.clinicId;

  const allowedItems = navigation.filter((item) =>
    user?.role ? item.roles.includes(user.role) : false
  );

  const handleNavClick = () => {
    if (onNavigate) {
      onNavigate();
    }
  };

  return (
    <aside className="w-72 bg-white border-r border-gray-100 flex flex-col h-screen">
      <div className="h-16 md:h-20 flex items-center px-6 md:px-8 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <Image
            src={"/images/logo.png"}
            alt={siteConfig.name}
            width={409}
            height={142}
            className="w-32 md:w-40"
            priority
          />
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto py-6 md:py-8 px-4 md:px-5">
        <ul className="space-y-3 md:space-y-4">
          {allowedItems.map((item) => {
            const href = `/clinic/${clinicId}${item.href}`;
            const isActive = pathname.startsWith(href);
            const Icon = item.icon;

            return (
              <li key={item.href}>
                <Link
                  href={href}
                  onClick={handleNavClick}
                  className={cn(
                    "flex items-center gap-3 md:gap-4 px-3 md:px-4 py-2.5 md:py-3 rounded-xl text-base md:text-[19px] font-medium transition-all",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  )}
                >
                  <Icon className="h-4 w-4 md:h-5 md:w-5 flex-shrink-0" />
                  {item.title}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-4 md:p-5 border-t border-gray-100">
        <div className="flex items-center gap-3 mb-4 p-3 rounded-xl bg-gray-50">
          <div className="h-9 w-9 md:h-11 md:w-11 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-xs md:text-sm font-semibold flex-shrink-0">
            {user?.firstName?.[0]}
            {user?.lastName?.[0]}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs md:text-sm font-semibold text-gray-900 truncate">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-[10px] md:text-xs text-gray-500 capitalize mt-0.5">
              {user?.role.toLowerCase().replace("_", " ")}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
