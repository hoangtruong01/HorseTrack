"use client";

import { AppSidebar } from "@/components/layout/app-sidebar";
import { MobileBottomNav } from "@/components/navigation/mobile-bottom-nav";
import { dashboardNavigation } from "@/constants/navigation";
import type { NavigationRole } from "@/types/navigation";

export type RoleDashboardShellProps = {
  role: NavigationRole;
  children: React.ReactNode;
};

export function RoleDashboardShell({
  role,
  children,
}: RoleDashboardShellProps) {
  const roleItems = dashboardNavigation.filter((item) => item.role === role);

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
