import Link from "next/link";
import {
  CalendarDays,
  Compass,
  UserCheck,
  Trophy,
  Target,
} from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen overflow-x-hidden bg-background text-foreground">
      {/* Background gradients and grid lines to build F1 cockpit depth */}
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_16%_8%,rgba(225,6,0,0.18),transparent_28rem),radial-gradient(circle_at_86%_28%,rgba(6,126,106,0.08),transparent_26rem),linear-gradient(135deg,rgba(255,255,255,0.03)_0_1px,transparent_1px_48px)] opacity-60" />
      <div className="pointer-events-none fixed inset-x-0 top-0 h-48 bg-gradient-to-b from-[#E10600]/8 to-transparent" />

      <div className="relative mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 py-6 sm:px-6 lg:px-8">
        {/* Header Section */}
        <header className="flex items-center justify-between gap-4 py-4 border-b border-border">
          <Link
            href="/"
            className="group flex items-center gap-3 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E10600]/70"
            aria-label="HorseTrack home"
          >
            {/* Custom high-fidelity horse head SVG outline logo */}
            <img
              src="/logo.png"
              alt="HorseTrack Logo"
              className="size-11 rounded-2xl object-cover border border-border shadow-[0_0_24px_rgba(225,6,0,0.22)] transition group-hover:scale-105"
            />
            <span>
              <span className="block text-lg font-black uppercase tracking-[0.2em] text-foreground leading-none">
                HorseTrack
              </span>
              <span className="block text-[0.66rem] font-bold uppercase tracking-[0.22em] text-muted-foreground mt-1">
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
                <span className="text-[#E10600]">Management</span> System
              </h1>
              
              <p className="max-w-xl text-sm sm:text-base leading-7 text-muted-foreground">
                Manage tournaments, horse registrations, jockey assignments, race schedules, referee reports, results, rankings and prediction rewards in one platform.
              </p>
            </div>

            {/* Bento Grid layout matching the mockup */}
            <div className="grid gap-4 sm:grid-cols-2 max-w-2xl">
              
              {/* Card 1: Tournament Scheduling */}
              <div className="group flex items-start gap-4 rounded-[1.25rem] border border-border bg-card/70 p-5 shadow-[0_8px_32px_rgba(0,0,0,0.12)] hover:border-border hover:bg-muted transition-all duration-300">
                <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[#E10600]/10 text-[#E10600] border border-[#E10600]/15 group-hover:scale-105 transition-transform">
                  <CalendarDays className="size-5.5" />
                </div>
                <div>
                  <h3 className="font-black text-sm uppercase text-foreground tracking-wide">
                    Tournament Scheduling
                  </h3>
                  <p className="mt-2 text-xs text-muted-foreground leading-relaxed font-medium">
                    Create and manage race tournaments, rounds and race schedules.
                  </p>
                </div>
              </div>

              {/* Card 2: Horse Registration */}
              <div className="group flex items-start gap-4 rounded-[1.25rem] border border-border bg-card/70 p-5 shadow-[0_8px_32px_rgba(0,0,0,0.12)] hover:border-border hover:bg-muted transition-all duration-300">
                <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[#E10600]/10 text-[#E10600] border border-[#E10600]/15 group-hover:scale-105 transition-transform">
                  <Compass className="size-5.5" />
                </div>
                <div>
                  <h3 className="font-black text-sm uppercase text-foreground tracking-wide">
                    Horse Registration
                  </h3>
                  <p className="mt-2 text-xs text-muted-foreground leading-relaxed font-medium">
                    Register horses, manage profiles, history and performance.
                  </p>
                </div>
              </div>

              {/* Card 3: Jockey Assignment */}
              <div className="group flex items-start gap-4 rounded-[1.25rem] border border-border bg-card/70 p-5 shadow-[0_8px_32px_rgba(0,0,0,0.12)] hover:border-border hover:bg-muted transition-all duration-300">
                <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[#E10600]/10 text-[#E10600] border border-[#E10600]/15 group-hover:scale-105 transition-transform">
                  <UserCheck className="size-5.5" />
                </div>
                <div>
                  <h3 className="font-black text-sm uppercase text-foreground tracking-wide">
                    Jockey Assignment
                  </h3>
                  <p className="mt-2 text-xs text-muted-foreground leading-relaxed font-medium">
                    Invite jockeys, assign rides and manage participation.
                  </p>
                </div>
              </div>

              {/* Card 4: Race Results */}
              <div className="group flex items-start gap-4 rounded-[1.25rem] border border-border bg-card/70 p-5 shadow-[0_8px_32px_rgba(0,0,0,0.12)] hover:border-border hover:bg-muted transition-all duration-300">
                <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[#E10600]/10 text-[#E10600] border border-[#E10600]/15 group-hover:scale-105 transition-transform">
                  <Trophy className="size-5.5" />
                </div>
                <div>
                  <h3 className="font-black text-sm uppercase text-foreground tracking-wide">
                    Race Results
                  </h3>
                  <p className="mt-2 text-xs text-muted-foreground leading-relaxed font-medium">
                    Record results, calculate rankings and manage prize money.
                  </p>
                </div>
              </div>

              {/* Card 5: Full Width Prediction Management */}
              <div className="group flex items-start gap-4 rounded-[1.25rem] border border-border bg-card/70 p-5 shadow-[0_8px_32px_rgba(0,0,0,0.12)] hover:border-border hover:bg-muted transition-all duration-300 sm:col-span-2">
                <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[#E10600]/10 text-[#E10600] border border-[#E10600]/15 group-hover:scale-105 transition-transform">
                  <Target className="size-5.5" />
                </div>
                <div>
                  <h3 className="font-black text-sm uppercase text-foreground tracking-wide">
                    Prediction Management
                  </h3>
                  <p className="mt-2 text-xs text-muted-foreground leading-relaxed font-medium">
                    Allow spectators to make predictions and reward accurate predictors.
                  </p>
                </div>
              </div>

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
        <footer className="py-6 border-t border-border flex flex-col sm:flex-row items-center justify-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-[0.16em]">
          <span className="flex items-center gap-1.5">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="size-3.5 text-[#067E6A]"
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

