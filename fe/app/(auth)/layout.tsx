import Link from "next/link";
import { RadioTower } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(225,6,0,0.18),transparent_28rem)] px-4 py-8">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-5xl flex-col justify-center">
        <Link
          href="/"
          className="mb-8 flex items-center gap-3"
          aria-label="HorseTrack home"
        >
          <span className="flex size-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <RadioTower className="size-5" aria-hidden="true" />
          </span>
          <span className="text-base font-black uppercase tracking-[0.18em] text-white">
            HorseTrack
          </span>
        </Link>
        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <aside className="f1-card f1-gradient p-6">
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-primary">
              Mock auth shell
            </p>
            <h1 className="mt-4 text-3xl font-black uppercase text-white">
              Role entry point prepared.
            </h1>
            <p className="mt-4 text-sm leading-6 text-muted-foreground">
              No real auth, no JWT storage, no backend call. Phase 3 will
              replace placeholders with forms.
            </p>
          </aside>
          {children}
        </div>
      </div>
    </main>
  );
}
