"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

import { publicNavigation } from "@/constants/navigation";
import { cn } from "@/lib/utils";
export type AppHeaderProps = {
  className?: string;
  ctaHref?: string;
  ctaLabel?: string;
};

export function AppHeader({
  className,
  ctaHref = "/register",
  ctaLabel = "Get Started",
}: AppHeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header
      className={cn(
        "sticky top-0 z-40 border-b border-white/5 bg-[#07070A]/90 backdrop-blur-md",
        className,
      )}
    >
      <div className="f1-container flex min-h-[76px] items-center justify-between gap-4">
        <Link
          href="/"
          className="group flex items-center gap-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E10600] focus-visible:ring-offset-2 focus-visible:ring-offset-[#07070A]"
          aria-label="HorseTrack home"
        >
          <img
            src="/logo.png"
            alt="HorseTrack Logo"
            className="size-11 rounded-2xl border border-white/10 object-cover shadow-[0_0_20px_rgba(225,6,0,0.25)] transition group-hover:scale-105"
          />
          <span className="text-xl font-black uppercase tracking-[0.16em] text-white">
            Horse<span className="text-[#E10600]">Track</span>
          </span>
        </Link>

        <nav
          className="hidden items-center gap-1 font-semibold text-sm tracking-wide lg:flex"
          aria-label="Primary navigation"
        >
          {publicNavigation.map((item) => (
            <Link
              key={item.href + item.title}
              href={item.href}
              className="relative rounded-full px-4 py-2.5 text-[11px] font-black uppercase tracking-widest text-white/60 transition-all duration-150 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E10600] focus-visible:ring-offset-2 focus-visible:ring-offset-[#07070A]"
            >
              {item.title}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <Link
            href="/login"
            className="rounded-xl border border-white/5 bg-white/[0.02] px-5 py-2 text-sm font-bold text-white/70 transition hover:bg-white/[0.04] hover:text-white"
          >
            Login
          </Link>
          <Link
            href={ctaHref}
            className="rounded-xl bg-[#E10600] px-5 py-2 text-sm font-black uppercase tracking-wider text-white shadow-[0_4px_20px_rgba(225,6,0,0.25)] transition hover:scale-[1.02] hover:bg-[#B80500] active:scale-[0.98]"
          >
            {ctaLabel}
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setMobileMenuOpen((open) => !open)}
          className="flex size-10 items-center justify-center rounded-xl border border-white/5 bg-white/[0.02] text-white hover:bg-white/[0.05] lg:hidden"
          aria-label={
            mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"
          }
          aria-expanded={mobileMenuOpen}
        >
          {mobileMenuOpen ? (
            <X className="size-5" aria-hidden="true" />
          ) : (
            <Menu className="size-5" aria-hidden="true" />
          )}
        </button>
      </div>

      {mobileMenuOpen && (
        <div className="border-t border-white/5 bg-[#07070A] px-4 py-5 lg:hidden">
          <nav
            className="flex flex-col gap-2"
            aria-label="Mobile primary navigation"
          >
            {publicNavigation.map((item) => (
              <Link
                key={item.href + item.title}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-xl px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-white/60 hover:bg-white/[0.02] hover:text-white"
              >
                {item.title}
              </Link>
            ))}
          </nav>
          <div className="mt-4 flex flex-col gap-2 border-t border-white/5 pt-4">
            <Link
              href="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="flex h-11 w-full items-center justify-center rounded-xl border border-white/5 text-sm font-bold text-white/70"
            >
              Login
            </Link>
            <Link
              href={ctaHref}
              onClick={() => setMobileMenuOpen(false)}
              className="flex h-11 w-full items-center justify-center rounded-xl bg-[#E10600] text-sm font-bold text-white"
            >
              {ctaLabel}
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
