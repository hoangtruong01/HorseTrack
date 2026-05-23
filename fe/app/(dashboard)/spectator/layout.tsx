import { RoleDashboardShell } from "@/components/layout/role-dashboard-shell";

export default function SpectatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <RoleDashboardShell role="Spectator">{children}</RoleDashboardShell>;
}
