import Link from "next/link";
import { ArrowUpRight, RadioTower, ShieldCheck, Timer } from "lucide-react";

import { authStats, rolePreviews } from "@/features/auth/mock-auth-data";
import { RolePreviewCard } from "@/features/auth/components/role-preview-card";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen overflow-hidden bg-[#07070A] text-white">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_16%_8%,rgba(225,6,0,0.22),transparent_24rem),radial-gradient(circle_at_86%_28%,rgba(6,126,106,0.12),transparent_26rem),linear-gradient(135deg,rgba(255,255,255,0.045)_0_1px,transparent_1px_42px)]" />
      <div className="pointer-events-none fixed inset-x-0 top-0 h-40 bg-gradient-to-b from-primary/15 to-transparent" />

      <div className="relative mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 py-5 sm:px-6 lg:px-8">
        <header className="flex items-center justify-between gap-4 py-3">
          <Link
            href="/"
            className="group flex items-center gap-3 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70"
            aria-label="HorseTrack home"
          >
            <span className="flex size-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-[0_0_36px_rgba(225,6,0,0.35)] transition group-hover:scale-105">
              <RadioTower className="size-5" aria-hidden="true" />
            </span>
            <span>
              <span className="block text-base font-black uppercase tracking-[0.2em] text-white">
                HorseTrack
              </span>
              <span className="block text-[0.68rem] font-bold uppercase tracking-[0.24em] text-white/42">
                Race control auth
              </span>
            </span>
          </Link>

          <Link
            href="/races"
            className="hidden items-center gap-2 rounded-full border border-white/12 bg-white/[0.04] px-4 py-2 text-sm font-bold text-white/72 transition hover:border-primary/50 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70 sm:inline-flex"
          >
            Preview races
            <ArrowUpRight className="size-4" aria-hidden="true" />
          </Link>
        </header>

        <div className="grid flex-1 gap-8 py-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:py-12">
          <aside className="space-y-6">
            <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[#15151E]/82 p-6 shadow-[0_24px_90px_rgba(0,0,0,0.46)] sm:p-8">
              <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-primary to-transparent" />
              <div className="absolute -right-16 -top-16 size-52 rounded-full bg-primary/12 blur-3xl" />
              <div className="relative">
                <p className="text-xs font-black uppercase tracking-[0.28em] text-primary">
                  Phase 3 · Mock auth
                </p>
                <h1 className="mt-4 text-4xl font-black uppercase leading-[0.95] tracking-tight text-white sm:text-5xl">
                  Role entry before the race lights.
                </h1>
                <p className="mt-5 max-w-xl text-sm leading-6 text-white/68">
                  Polished authentication UI for demo navigation only. The
                  session handoff is a placeholder redirect by selected role;
                  real backend auth remains deferred.
                </p>

                <div className="mt-6 grid grid-cols-3 gap-3">
                  {authStats.map((stat) => (
                    <div
                      key={stat.label}
                      className="rounded-2xl border border-white/10 bg-white/[0.045] p-3"
                    >
                      <p className="text-2xl font-black text-white">
                        {stat.value}
                      </p>
                      <p className="mt-1 text-[0.68rem] font-bold uppercase tracking-[0.16em] text-white/45">
                        {stat.label}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                <div className="flex items-center gap-3">
                  <span className="flex size-10 items-center justify-center rounded-xl bg-primary/15 text-primary">
                    <ShieldCheck className="size-5" aria-hidden="true" />
                  </span>
                  <div>
                    <p className="text-sm font-black uppercase text-white">
                      Security copy
                    </p>
                    <p className="mt-1 text-xs leading-5 text-white/55">
                      Future auth: httpOnly cookie session. Never localStorage
                      JWT.
                    </p>
                  </div>
                </div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                <div className="flex items-center gap-3">
                  <span className="flex size-10 items-center justify-center rounded-xl bg-primary/15 text-primary">
                    <Timer className="size-5" aria-hidden="true" />
                  </span>
                  <div>
                    <p className="text-sm font-black uppercase text-white">
                      Fast demo
                    </p>
                    <p className="mt-1 text-xs leading-5 text-white/55">
                      Pick a role → mock loading → dashboard placeholder.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="hidden gap-3 xl:grid xl:grid-cols-1">
              {rolePreviews.slice(0, 3).map((role) => (
                <RolePreviewCard key={role.role} role={role} compact />
              ))}
            </div>
          </aside>

          <div>{children}</div>
        </div>
      </div>
    </main>
  );
}
