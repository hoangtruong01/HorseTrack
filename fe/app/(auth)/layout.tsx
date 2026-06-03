import { AuthLayoutFooter } from "@/components/auth/auth-layout-footer";
import { AuthLayoutHeader } from "@/components/auth/auth-layout-header";
import { AuthMarketingPanel } from "@/components/auth/auth-marketing-panel";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen overflow-x-hidden bg-background text-foreground">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_16%_8%,rgba(225,6,0,0.18),transparent_28rem),radial-gradient(circle_at_86%_28%,rgba(6,126,106,0.08),transparent_26rem),linear-gradient(135deg,rgba(255,255,255,0.03)_0_1px,transparent_1px_48px)] opacity-60" />
      <div className="pointer-events-none fixed inset-x-0 top-0 h-48 bg-gradient-to-b from-[#E10600]/8 to-transparent" />

      <div className="relative mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 py-6 sm:px-6 lg:px-8">
        <AuthLayoutHeader />

        <div className="grid flex-1 gap-12 py-10 lg:grid-cols-[1.12fr_0.88fr] lg:items-center lg:py-14">
          <AuthMarketingPanel />
          <div className="w-full flex justify-center lg:justify-end">
            <div className="w-full max-w-[460px]">{children}</div>
          </div>
        </div>

        <AuthLayoutFooter />
      </div>
    </main>
  );
}
