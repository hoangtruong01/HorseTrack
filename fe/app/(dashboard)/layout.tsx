import { AppHeader } from "@/components/layout/app-header";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen">
      <AppHeader ctaHref="/" ctaLabel="Public site" />
      {children}
    </main>
  );
}
