"use client";

import Link from "next/link";
import { LogOut, User } from "lucide-react";

import { AppSidebar } from "@/components/layout/app-sidebar";
import { MobileBottomNav } from "@/components/navigation/mobile-bottom-nav";
import { dashboardNavigation } from "@/constants/navigation";
import { useAuth } from "@/providers/auth-provider";
import type { NavigationRole } from "@/types/navigation";

export type RoleDashboardShellProps = {
  role: NavigationRole;
  children: React.ReactNode;
};

const roleCopy: Record<NavigationRole, string> = {
  Admin:
    "Race control, tournament containers, registration review, result publish.",
  Owner:
    "Stable operations, horse portfolio, race registration, jockey assignment.",
  Jockey: "Mobile-first assignments and personal race schedule.",
  Referee:
    "Tablet-first assigned races, checks, violations, result confirmation.",
  Spectator: "Race browsing, prediction status, public result follow-up.",
};

export function RoleDashboardShell({
  role,
  children,
}: RoleDashboardShellProps) {
  const roleItems = dashboardNavigation.filter((item) => item.role === role);
  const { user, logout } = useAuth();

  return (
    <div className="flex min-h-[calc(100vh-76px)]">
      <AppSidebar role={role} />
      <section className="min-w-0 flex-1 flex flex-col justify-between pb-24 lg:pb-0">
        <div>
          <div className="border-b border-white/10 bg-white/[0.02]">
            <div className="px-4 py-5 sm:px-6 lg:px-8">
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-primary">
                {role} shell
              </p>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
                {roleCopy[role]}
              </p>
            </div>
          </div>
          <div className="px-4 py-8 sm:px-6 lg:px-8">{children}</div>
        </div>

        {user ? (
          <footer className="mt-auto border-t border-white/10 bg-white/[0.01] px-4 py-4 sm:px-6 lg:px-8 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex size-9 items-center justify-center rounded-xl bg-[#E10600]/10 border border-[#E10600]/20 text-[#E10600]">
                <User className="size-4.5" />
              </div>
              <div>
                <p className="text-xs font-black uppercase tracking-wider text-white">
                  {user.fullName}
                </p>
                <Link
                  href="/profile"
                  className="text-[10px] font-bold text-muted-foreground hover:text-white transition uppercase tracking-wider"
                >
                  Xem chi tiết hồ sơ →
                </Link>
              </div>
            </div>
            <button
              onClick={logout}
              className="flex items-center gap-2 rounded-xl bg-[#E10600] px-4 py-2 text-xs font-black uppercase tracking-wider text-white shadow-[0_4px_12px_rgba(225,6,0,0.2)] transition hover:scale-[1.02] hover:bg-[#B80500] active:scale-[0.98] cursor-pointer"
            >
              <LogOut className="size-3.5" />
              Đăng xuất
            </button>
          </footer>
        ) : null}
      </section>
      <MobileBottomNav items={roleItems} />
    </div>
  );
}
