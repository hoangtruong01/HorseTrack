import { RoleDashboardShell } from "@/components/layout/role-dashboard-shell";

export default function CounterStaffLayout({ children }: { children: React.ReactNode }) {
  return <RoleDashboardShell role="CounterStaff">{children}</RoleDashboardShell>;
}
