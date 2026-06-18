"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { User, Settings, ChevronDown, LogOut, LayoutDashboard } from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { useAuth } from "@/providers/auth-provider";
import { sileo } from "sileo";

const toast = {
  success: (msg: string) => sileo.success({ title: msg, duration: 1200 }),
  error: (msg: string) => sileo.error({ title: msg, duration: 1200 }),
};

export type UserDropdownMenuProps = {
  userName?: string;
  userRole?: string;
  userAvatar?: string;
};

export function UserDropdownMenu({
  userName = "User",
  userRole = "spectator",
  userAvatar,
}: UserDropdownMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { logout } = useAuth();
  const { t } = useTranslation();
  const menuRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const closeMenu = () => {
    setIsOpen(false);
  };

  const getDashboardHref = () => {
    let role = userRole;
    if (role === "counter_staff") {
      role = "counter-staff";
    }
    return `/${role}`;
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="group flex items-center gap-2 rounded-xl border border-border bg-card/50 px-3 py-2 text-sm font-semibold text-foreground/70 transition hover:border-primary/30 hover:bg-card hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        <div className="flex flex-col items-end">
          <span className="text-xs font-black uppercase tracking-wide">
            {userName}
          </span>
          <span className="text-[10px] font-bold uppercase tracking-wider text-primary/80">
            {!mounted ? userRole : t(`roles.${userRole}`, userRole)}
          </span>
        </div>
        <div
          className={cn(
            "flex size-8 items-center justify-center rounded-lg bg-card/50 border border-border text-foreground/60 group-hover:border-primary/30 group-hover:text-foreground transition",
            userAvatar && "bg-cover bg-center"
          )}
          style={
            userAvatar ? { backgroundImage: `url(${userAvatar})` } : undefined
          }
        >
          {!userAvatar && <User className="size-4" />}
        </div>
        <ChevronDown
          className={cn(
            "size-4 transition-transform duration-200",
            isOpen && "rotate-180"
          )}
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full z-50 mt-2 w-56 rounded-2xl border border-border bg-card shadow-2xl overflow-hidden">
          {/* Profile Link */}
          <Link
            href="/profile"
            onClick={closeMenu}
            className="flex items-center gap-3 border-b border-border px-5 py-3.5 text-sm font-semibold text-foreground/80 transition hover:bg-secondary hover:text-foreground"
          >
            <User className="size-4.5" />
            <span>{t("nav.profile", "Profile")}</span>
          </Link>

          {/* Dashboard Link */}
          <Link
            href={getDashboardHref()}
            onClick={closeMenu}
            className="flex items-center gap-3 border-b border-border px-5 py-3.5 text-sm font-semibold text-foreground/80 transition hover:bg-secondary hover:text-foreground"
          >
            <LayoutDashboard className="size-4.5" />
            <span>{t("nav.dashboard", "Dashboard")}</span>
          </Link>

          {/* Settings Link */}
          <Link
            href="/settings"
            onClick={closeMenu}
            className="flex items-center gap-3 px-5 py-3.5 text-sm font-semibold text-foreground/80 transition hover:bg-secondary hover:text-foreground"
          >
            <Settings className="size-4.5" />
            <span>{t("nav.settings", "Settings")}</span>
          </Link>

          {/* Logout Button */}
          <button
            onClick={() => {
              closeMenu();
              toast.success(t("auth.loginForm.logoutSuccess"));
              logout();
            }}
            className="w-full flex items-center gap-3 border-t border-border px-5 py-3.5 text-sm font-semibold text-red-500 hover:text-red-600 transition hover:bg-secondary text-left cursor-pointer"
          >
            <LogOut className="size-4.5" />
            <span>{t("nav.logout", "Logout")}</span>
          </button>
        </div>
      )}

    </div>
  );
}