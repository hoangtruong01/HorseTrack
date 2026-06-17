import Image from "next/image";
import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen overflow-x-hidden bg-background text-foreground">
      {/* Background Horse Racing Image with opacity and blur */}
      <div
        className="pointer-events-none fixed inset-0 bg-cover bg-center bg-no-repeat opacity-[0.06] mix-blend-lighten blur-[4px]"
        style={{ backgroundImage: "url('/hero_horse_racing.png')" }}
      />
      {/* Background gradients and grid lines to build F1 cockpit depth */}
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_16%_8%,rgba(225,6,0,0.18),transparent_28rem),radial-gradient(circle_at_86%_28%,rgba(6,126,106,0.08),transparent_26rem),linear-gradient(135deg,rgba(128,128,128,0.03)_0_1px,transparent_1px_48px)] opacity-60" />
      <div className="pointer-events-none fixed inset-x-0 top-0 h-48 bg-gradient-to-b from-primary/8 to-transparent" />

      <div className="relative mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 py-6 sm:px-6 lg:px-8">
        {/* Header Section */}
        <header className="flex items-center justify-between gap-4 py-4 border-b border-border">
          <Link
            href="/"
            className="group flex items-center gap-3 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70"
            aria-label="HorseTrack home"
          >
            {/* Custom high-fidelity horse head SVG outline logo */}
            <Image
              src="/logo.png"
              alt="HorseTrack Logo"
              width={44}
              height={44}
              className="size-11 rounded-2xl object-cover border border-border shadow-[0_0_24px_rgba(225,6,0,0.22)] transition group-hover:scale-105"
            />
            <span>
              <span className="block text-lg font-black uppercase tracking-[0.2em] text-foreground leading-none">
                HorseTrack
              </span>
              <span className="block text-[0.66rem] font-bold uppercase tracking-[0.22em] text-foreground/40 mt-1">
                Race Control System
              </span>
            </span>
          </Link>
        </header>

        {/* Two-Column Split Screen Panel */}
        <div className="grid flex-1 gap-12 py-10 lg:grid-cols-[1.12fr_0.88fr] lg:items-center lg:py-14">
          
          {/* Left Panel: Race operations bento highlights */}
          <aside className="space-y-8">
            <div className="space-y-6">
              <h1 className="text-4xl font-black leading-[1.08] tracking-tight text-foreground sm:text-5xl lg:text-6xl uppercase">
                Horse Racing <br />
                Tournament <br />
                <span className="text-primary">Management</span> System
              </h1>
              
              <p className="max-w-xl text-sm sm:text-base leading-7 text-foreground/55">
                Manage tournaments, horse registrations, jockey assignments, race schedules, referee reports, results, rankings and prediction rewards in one platform.
              </p>
            </div>
          </aside>

          {/* Right Panel: Glassmorphic Auth Form */}
          <div className="w-full flex justify-center lg:justify-end">
            <div className="w-full max-w-[460px]">
              {children}
            </div>
          </div>
          
        </div>

        {/* Footer info bars */}
        <footer className="py-6 border-t border-border flex flex-col sm:flex-row items-center justify-center gap-2 text-xs font-semibold text-foreground/35 uppercase tracking-[0.16em]">
          <span className="flex items-center gap-1.5">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="size-3.5 text-chart-2"
            >
              <rect width="20" height="11" x="2" y="9" rx="2" ry="2" />
              <path d="M5 9V7a7 7 0 0 1 14 0v2" />
            </svg>
            Secure login
          </span>
          <span className="hidden sm:inline">•</span>
          <span>Protected by JWT</span>
          <span className="hidden sm:inline">•</span>
          <span>Your data is safe with us</span>
        </footer>

      </div>
    </main>
  );
}