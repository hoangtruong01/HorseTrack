"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Bell, LogOut, Menu, User, X } from "lucide-react";
import { useTranslation } from "react-i18next";

import { publicNavigation } from "@/constants/navigation";
import { cn } from "@/lib/utils";
import { useAuth } from "@/providers/auth-provider";

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
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const { user, logout } = useAuth();
  const { t } = useTranslation();

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (!menuRef.current) {
        return;
      }

      if (!menuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setUserMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur-md",
        className,
      )}
    >
      <div className="f1-container flex min-h-[76px] items-center justify-between gap-4">
        <Link
          href="/"
          className="group flex items-center gap-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E10600] focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          aria-label="HorseTrack home"
        >
          <img
            src="/logo.png"
            alt="HorseTrack Logo"
            className="size-11 rounded-2xl border border-border object-cover shadow-[0_0_20px_rgba(225,6,0,0.25)] transition group-hover:scale-105"
          />
          <span className="text-xl font-black uppercase tracking-[0.16em] text-foreground">
            Horse<span className="text-[#E10600]">Track</span>
          </span>
        </Link>

        {!user && (
          <nav
            className="hidden items-center gap-1 font-semibold text-sm tracking-wide lg:flex"
            aria-label="Primary navigation"
          >
            {publicNavigation.map((item) => (
              <Link
                key={item.href + item.title}
                href={item.href}
                className="relative rounded-full px-4 py-2.5 text-[11px] font-black uppercase tracking-widest text-muted-foreground transition-all duration-150 hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E10600] focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                {item.title}
              </Link>
            ))}
          </nav>
        )}

        <div className="hidden items-center gap-4 lg:flex">
          {user ? (
            <div
              className="relative flex items-center gap-2"
              ref={menuRef}
            >
              <button
                type="button"
                className="flex size-9 items-center justify-center rounded-xl border border-border bg-card/70 text-muted-foreground transition hover:border-[#E10600]/30 hover:text-foreground"
                aria-label={t("nav.notifications")}
              >
                <Bell className="size-4.5" />
              </button>
              <button
                type="button"
                onClick={() => setUserMenuOpen((open) => !open)}
                className="flex items-center gap-3 group focus:outline-none"
                aria-haspopup="menu"
                aria-expanded={userMenuOpen}
              >
                <div className="flex flex-col items-end">
                  <span className="text-[11px] font-black uppercase tracking-wider text-foreground group-hover:text-[#E10600] transition">
                    {user.fullName}
                  </span>
                  <span className="text-[9px] font-black uppercase tracking-wider text-[#E10600]/80">
                    {user.roles[0] || "spectator"}
                  </span>
                </div>
                <div className="flex size-9 items-center justify-center rounded-xl bg-card/70 border border-border text-muted-foreground group-hover:border-[#E10600]/30 group-hover:text-foreground transition">
                  <User className="size-4.5" />
                </div>
              </button>
              {userMenuOpen ? (
                <div
                  className="absolute right-0 top-full mt-3 w-44 rounded-2xl border border-border bg-popover/95 p-2 shadow-[0_20px_40px_rgba(0,0,0,0.35)] backdrop-blur"
                  role="menu"
                >
                  <Link
                    href="/profile"
                    role="menuitem"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center rounded-xl px-3 py-2 text-xs font-bold uppercase tracking-wider text-muted-foreground transition hover:bg-muted hover:text-foreground"
                  >
                    {t("nav.profile")}
                  </Link>
                  <Link
                    href="/setting"
                    role="menuitem"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center rounded-xl px-3 py-2 text-xs font-bold uppercase tracking-wider text-muted-foreground transition hover:bg-muted hover:text-foreground"
                  >
                    {t("nav.settings")}
                  </Link>
                </div>
              ) : null}
            </div>
          ) : (
            <Link
              href="/login"
              className="rounded-xl border border-border bg-card/70 px-5 py-2 text-sm font-bold text-muted-foreground transition hover:bg-muted hover:text-foreground"
            >
              Login
            </Link>
          )}
        </div>

        <button
          type="button"
          onClick={() => setMobileMenuOpen((open) => !open)}
          className="flex size-10 items-center justify-center rounded-xl border border-border bg-card/70 text-foreground hover:bg-muted lg:hidden"
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
        <div className="border-t border-border bg-background px-4 py-5 lg:hidden">
          {!user && (
            <nav
              className="flex flex-col gap-2"
              aria-label="Mobile primary navigation"
            >
              {publicNavigation.map((item) => (
                <Link
                  key={item.href + item.title}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-xl px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  {item.title}
                </Link>
              ))}
            </nav>
          )}
          <div className="mt-4 flex flex-col gap-2 border-t border-border pt-4">
            {user ? (
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between px-2">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      className="flex size-7 items-center justify-center rounded-lg border border-border bg-card/70 text-muted-foreground"
                      aria-label={t("nav.notifications")}
                    >
                      <Bell className="size-4" />
                    </button>
                    <span className="text-xs font-black uppercase tracking-wider text-foreground">
                      {user.fullName}
                    </span>
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-[#E10600]">
                    {user.roles[0] || "spectator"}
                  </span>
                </div>
                <div className="flex flex-col gap-2">
                  <Link
                    href="/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className="rounded-xl border border-border px-4 py-2 text-left text-xs font-bold uppercase tracking-wider text-muted-foreground hover:bg-muted hover:text-foreground"
                  >
                    {t("nav.profile")}
                  </Link>
                  <Link
                    href="/setting"
                    onClick={() => setMobileMenuOpen(false)}
                    className="rounded-xl border border-border px-4 py-2 text-left text-xs font-bold uppercase tracking-wider text-muted-foreground hover:bg-muted hover:text-foreground"
                  >
                    {t("nav.settings")}
                  </Link>
                </div>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    logout();
                  }}
                  className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#E10600] text-sm font-bold text-white cursor-pointer"
                >
                  <LogOut className="size-4" />
                  Đăng xuất
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="flex h-11 w-full items-center justify-center rounded-xl border dark:border-white/5 border-border text-sm font-bold dark:text-white/70 text-muted-foreground"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
