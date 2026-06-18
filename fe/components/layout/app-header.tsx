"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Menu, X, LogOut, Wallet, User } from "lucide-react";
import { useTranslation } from "react-i18next";

import { publicNavigation } from "@/constants/navigation";
import { cn } from "@/lib/utils";
import { useAuth } from "@/providers/auth-provider";
import { NotificationsBell } from "@/components/layout/notifications-bell";
import { UserDropdownMenu } from "@/components/layout/user-dropdown-menu";
import { toast } from "sonner";

export type AppHeaderProps = {
  className?: string;
  ctaHref?: string;
  ctaLabel?: string;
};

export function AppHeader({ className }: AppHeaderProps) {
  const { t, i18n } = useTranslation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const [points, setPoints] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const getWalletHref = () => {
    if (!user) return "#";
    let role = user.roles[0] || "spectator";
    if (role === "counter_staff") {
      role = "counter-staff";
    }
    if (role === "counter-staff") {
      return "/counter-staff";
    }
    return `/${role}/wallet`;
  };

  useEffect(() => {
    if (!user) {
      setPoints(null);
      return;
    }

    async function fetchPoints() {
      try {
        const res = await fetch("/api/wallet");
        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            setPoints(data.points ?? 0);
          }
        }
      } catch (err) {
        console.error("Failed to fetch wallet points:", err);
      }
    }

    fetchPoints();
    const interval = setInterval(fetchPoints, 10000);
    return () => clearInterval(interval);
  }, [user]);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur-md w-full",
        className,
      )}
    >
      {/* Đã sửa f1-container thành w-full px-4 md:px-6 để bám sát 2 lề màn hình */}
      <div className="w-full px-6 md:px-6 flex min-h-[76px] items-center justify-between gap-4">
        <Link
          href="/"
          className="group flex items-center gap-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          aria-label="HorseTrack home"
        >
          <Image
            src="/logo.png"
            alt="HorseTrack Logo"
            width={44}
            height={44}
            className="size-11 rounded-2xl border border-border object-cover shadow-[0_0_20px_rgba(225,6,0,0.25)] transition group-hover:scale-105"
          />
          <span className="text-xl font-black uppercase tracking-[0.16em] text-foreground">
            Horse<span className="text-primary">Track</span>
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
                className="relative rounded-full px-4 py-2.5 text-[11px] font-black uppercase tracking-widest text-foreground/60 transition-all duration-150 hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                {!mounted
                  ? item.title
                  : item.itemKey
                    ? t(`navigation.${item.itemKey}.title`)
                    : item.title}
              </Link>
            ))}
          </nav>
        )}

        <div className="hidden items-center gap-3 lg:flex">
          <button
            onClick={() =>
              i18n.changeLanguage(i18n.language === "vi" ? "en" : "vi")
            }
            className="flex items-center justify-center rounded-xl border border-border bg-card/40 hover:bg-card px-3.5 py-2 text-xs font-black uppercase tracking-wider text-foreground transition duration-150 cursor-pointer h-[38px] min-w-[42px]"
            title="Switch Language / Đổi Ngôn Ngữ"
          >
            <span>
              {!mounted ? "EN" : i18n.language === "vi" ? "EN" : "VI"}
            </span>
          </button>
          {user ? (
            <>
              {user.roles[0] !== "admin" && (
                <Link
                  href={getWalletHref()}
                  className="flex items-center gap-2 rounded-xl border border-border bg-card/40 hover:bg-card px-4 py-2 text-xs font-black uppercase tracking-wider text-foreground transition duration-150"
                >
                  <Wallet className="size-4 text-primary" />
                  <span>
                    {points !== null
                      ? `${points.toLocaleString("vi-VN")} ${!mounted ? "Điểm" : t("wallet.balance.pointsUnit", "Điểm")}`
                      : !mounted
                        ? "Làm mới số dư"
                        : t("wallet.balance.refreshAria")}
                  </span>
                </Link>
              )}
              <NotificationsBell />
              <UserDropdownMenu
                userName={user.fullName}
                userRole={user.roles[0] || "spectator"}
                userAvatar={user.avatar}
              />
            </>
          ) : (
            <Link
              href="/login"
              className="rounded-xl border border-border bg-card/50 px-5 py-2 text-sm font-bold text-foreground/70 transition hover:bg-card hover:text-foreground"
            >
              {!mounted ? "Đăng nhập" : t("nav.login", "Login")}
            </Link>
          )}
        </div>

        <div className="flex items-center gap-2 lg:hidden">
          <button
            onClick={() =>
              i18n.changeLanguage(i18n.language === "vi" ? "en" : "vi")
            }
            className="flex items-center justify-center rounded-xl border border-border bg-card/40 hover:bg-card px-2.5 py-1.5 text-xs font-black uppercase tracking-wider text-foreground transition duration-150 cursor-pointer h-10 min-w-[38px]"
            title="Switch Language / Đổi Ngôn Ngữ"
          >
            <span>
              {!mounted ? "EN" : i18n.language === "vi" ? "EN" : "VI"}
            </span>
          </button>
          {user && (
            <>
              {user.roles[0] !== "admin" && (
                <Link
                  href={getWalletHref()}
                  className="flex items-center gap-1.5 rounded-xl border border-border bg-card/40 hover:bg-card px-3 py-1.5 text-xs font-black uppercase tracking-wider text-foreground transition duration-150"
                >
                  <Wallet className="size-3.5 text-primary" />
                  <span>
                    {points !== null ? points.toLocaleString("vi-VN") : "..."}
                  </span>
                </Link>
              )}
              <NotificationsBell />
            </>
          )}

          <button
            type="button"
            onClick={() => setMobileMenuOpen((open) => !open)}
            className="flex size-10 items-center justify-center rounded-xl border border-border bg-card/50 text-foreground hover:bg-card"
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
                  className="rounded-xl px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-foreground/60 hover:bg-secondary hover:text-foreground"
                >
                  {!mounted
                    ? item.title
                    : item.itemKey
                      ? t(`navigation.${item.itemKey}.title`)
                      : item.title}
                </Link>
              ))}
            </nav>
          )}
          <div className="mt-4 flex flex-col gap-2 border-t border-border pt-4">
            {user ? (
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between px-2">
                  <div className="flex items-center gap-3">
                    {user.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.fullName}
                        className="size-10 rounded-lg object-cover border border-border bg-card/50"
                      />
                    ) : (
                      <div className="flex size-10 items-center justify-center rounded-lg border border-border bg-card/50 text-foreground/60">
                        <User className="size-5" />
                      </div>
                    )}
                    <div className="flex flex-col">
                      <span className="text-xs font-black uppercase tracking-wider text-foreground">
                        {user.fullName}
                      </span>
                      <span className="text-[10px] font-black uppercase tracking-wider text-primary">
                        {user.roles[0] || "spectator"}
                      </span>
                    </div>
                  </div>
                  {points !== null && user.roles[0] !== "admin" && (
                    <Link
                      href={getWalletHref()}
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-1.5 rounded-xl border border-border bg-card/60 px-3 py-1.5 text-xs font-bold text-foreground transition"
                    >
                      <Wallet className="size-3.5 text-primary" />
                      <span>
                        {points.toLocaleString("vi-VN")}{" "}
                        {!mounted
                          ? "Điểm"
                          : t("wallet.balance.pointsUnit", "Điểm")}
                      </span>
                    </Link>
                  )}
                </div>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    toast.success(t("auth.logoutSuccess"));
                    logout();
                  }}
                  className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary text-sm font-bold text-primary-foreground cursor-pointer hover:bg-primary/90 transition"
                >
                  <LogOut className="size-4" />
                  {!mounted ? "Đăng xuất" : t("nav.logout", "Đăng xuất")}
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="flex h-11 w-full items-center justify-center rounded-xl border border-border text-sm font-bold text-foreground/70 hover:bg-secondary hover:text-foreground transition"
              >
                {!mounted ? "Đăng nhập" : t("nav.login", "Login")}
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
