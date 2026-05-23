import { AppSidebar } from "@/components/layout/app-sidebar";
import { MobileBottomNav } from "@/components/navigation/mobile-bottom-nav";
import { dashboardNavigation } from "@/constants/navigation";
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

  return (
    <div className="flex min-h-[calc(100vh-72px)]">
      <AppSidebar role={role} />
      <section className="min-w-0 flex-1 pb-24 lg:pb-0">
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
      </section>
      <MobileBottomNav items={roleItems} />
    </div>
  );
}
