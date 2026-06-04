"use client";

import { useState } from "react";
import Link from "next/link";
import { User, Settings, ChevronDown, Globe, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

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
  const { theme, setTheme } = useTheme();
  const { i18n } = useTranslation();

  const closeMenu = () => {
    setIsOpen(false);
  };

  const toggleLanguage = () => {
    const newLanguage = i18n.language === "en" ? "vi" : "en";
    i18n.changeLanguage(newLanguage);
  };

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <div className="relative">
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
            {userRole}
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
             <span>Profile</span>
           </Link>

            {/* Settings Link */}
            <Link
              href="/settings"
              onClick={closeMenu}
              className="flex items-center gap-3 px-5 py-3.5 text-sm font-semibold text-foreground/80 transition hover:bg-secondary hover:text-foreground"
            >
              <Settings className="size-4.5" />
              <span>Settings</span>
            </Link>
          </div>
       )}

      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={closeMenu}
          aria-hidden="true"
        />
      )}
    </div>
  );
}