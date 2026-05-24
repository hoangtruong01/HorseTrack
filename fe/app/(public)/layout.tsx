import { AppHeader } from "@/components/layout/app-header";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen overflow-hidden">
      <AppHeader />
      <div className="f1-container py-10 sm:py-14">{children}</div>
    </main>
  );
}
