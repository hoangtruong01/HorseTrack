import Link from "next/link";
import { Menu, RadioTower } from "lucide-react";

import { publicNavigation } from "@/constants/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export type AppHeaderProps = {
  className?: string;
  ctaHref?: string;
  ctaLabel?: string;
};

export function AppHeader({
  className,
  ctaHref = "/login",
  ctaLabel = "Enter paddock",
}: AppHeaderProps) {
  return (
    <header
      className={cn(
        "sticky top-0 z-40 border-b border-white/10 bg-[#1C1C25]/95 backdrop-blur",
        className,
      )}
    >
      <div className="f1-container flex min-h-[72px] items-center justify-between gap-4">
        <Link
          href="/"
          className="flex items-center gap-3"
          aria-label="HorseTrack home"
        >
          <span className="flex size-10 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-[0_0_22px_rgba(225,6,0,0.34)]">
            <RadioTower className="size-5" aria-hidden="true" />
          </span>
          <span className="leading-none">
            <span className="block text-base font-black uppercase tracking-[0.18em] text-white">
              HorseTrack
            </span>
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Race Control MVP
            </span>
          </span>
        </Link>

        <nav
          className="hidden items-center gap-1 lg:flex"
          aria-label="Primary navigation"
        >
          {publicNavigation.map((item) => (
            <Link
              key={item.href + item.title}
              href={item.href}
              className="px-4 py-3 text-sm font-bold uppercase tracking-[0.12em] text-[#E0DEDC] transition hover:text-white"
            >
              {item.title}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Button
            asChild
            className="hidden rounded-full bg-primary px-5 font-bold hover:bg-[#B80500] sm:inline-flex"
          >
            <Link href={ctaHref}>{ctaLabel}</Link>
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="rounded-full border-white/25 bg-transparent text-white hover:bg-white/10 lg:hidden"
            aria-label="Open navigation menu"
          >
            <Menu className="size-4" aria-hidden="true" />
          </Button>
        </div>
      </div>
    </header>
  );
}
