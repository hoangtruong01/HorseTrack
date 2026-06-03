"use client";

import Link from "next/link";
import { LogOut, User } from "lucide-react";

import { AppSidebar } from "@/components/layout/app-sidebar";
import { MobileBottomNav } from "@/components/navigation/mobile-bottom-nav";
import { dashboardNavigation } from "@/constants/navigation";
import { useAuth } from "@/providers/auth-provider";
import type { NavigationRole } from "@/types/navigation";
import { useTranslation } from "react-i18next";

export type RoleDashboardShellProps = {
  role: NavigationRole;
  children: React.ReactNode;
};

const shellRoleKeys: Record<NavigationRole, string> = {
  Admin: "Admin",
  Owner: "Owner",
  Jockey: "Jockey",
  Referee: "Referee",
  Spectator: "Spectator",
  CounterStaff: "CounterStaff",
};

export function RoleDashboardShell({
  role,
  children,
}: RoleDashboardShellProps) {
  const { t } = useTranslation();
  const roleItems = dashboardNavigation.filter((item) => item.role === role);
  const { user, logout } = useAuth();
  const shellKey = shellRoleKeys[role];

  return (
    <div className="flex min-h-[calc(100vh-76px)]">
      <AppSidebar role={role} />
      <section className="min-w-0 flex-1 pb-24 lg:pb-0">

        <div className="px-4 py-8 sm:px-6 lg:px-8">{children}</div>
      </section>
      <MobileBottomNav items={roleItems} />
    </div>
  );
}
