import { RoleDashboardShell } from "@/components/layout/role-dashboard-shell";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <RoleDashboardShell role="Admin">{children}</RoleDashboardShell>;
}
