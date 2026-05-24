import { RoleDashboardShell } from "@/components/layout/role-dashboard-shell";

export default function OwnerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <RoleDashboardShell role="Owner">{children}</RoleDashboardShell>;
}
