import { RoleDashboardShell } from "@/components/layout/role-dashboard-shell";

export default function RefereeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <RoleDashboardShell role="Referee">{children}</RoleDashboardShell>;
}
