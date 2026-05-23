import { RoleDashboardShell } from "@/components/layout/role-dashboard-shell";

export default function JockeyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <RoleDashboardShell role="Jockey">{children}</RoleDashboardShell>;
}
