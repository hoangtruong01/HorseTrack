"use client";

import Link from "next/link";
import { LogOut, User } from "lucide-react";
import { useTranslation } from "react-i18next";

import { AppSidebar } from "@/components/layout/app-sidebar";
import { MobileBottomNav } from "@/components/navigation/mobile-bottom-nav";
import { dashboardNavigation } from "@/constants/navigation";
import { useAuth } from "@/providers/auth-provider";
import type { NavigationRole } from "@/types/navigation";

export type RoleDashboardShellProps = {
  role: NavigationRole;
  children: React.ReactNode;
};

export function RoleDashboardShell({
  role,
  children,
}: RoleDashboardShellProps) {
  const { t } = useTranslation();
  const roleItems = dashboardNavigation.filter((item) => item.role === role);
  const { user, logout } = useAuth();

  const roleKey = role.toLowerCase() as keyof typeof t;
  const descriptionKey = `shell.${role}.description` as const;

  return (
    <div className="flex min-h-[calc(100vh-76px)]">
      <AppSidebar role={role} />
      <section className="min-w-0 flex-1 pb-24 lg:pb-0">
        <div className="border-b border-border bg-secondary/20">
          <div className="px-4 py-5 sm:px-6 lg:px-8">
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-primary">
              {role} shell
            </p>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
              {t(descriptionKey)}
            </p>
          </div>
        </div>
        <div className="px-4 py-8 sm:px-6 lg:px-8">{children}</div>
      </section>
      <MobileBottomNav items={roleItems} />
    </div>
  );
}
