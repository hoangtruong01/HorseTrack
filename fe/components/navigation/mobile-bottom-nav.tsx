"use client";

import Link from "next/link";
import { useTranslation } from "react-i18next";

import { getNavTitle } from "@/lib/navigation-i18n";
import { cn } from "@/lib/utils";
import type { NavigationItem } from "@/types/navigation";

export type MobileBottomNavProps = {
  items: NavigationItem[];
  activeHref?: string;
  className?: string;
};

export function MobileBottomNav({
  items,
  activeHref,
  className,
}: MobileBottomNavProps) {
  const { t } = useTranslation();

  return (
    <nav
      className={cn(
        "fixed inset-x-0 bottom-0 z-40 border-t dark:border-white/10 border-border dark:bg-[#15151E]/95 bg-card px-3 py-2 backdrop-blur lg:hidden",
        className,
      )}
      aria-label="Mobile dashboard navigation"
    >
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
        {items.slice(0, 5).map((item) => {
          const Icon = item.icon;
          const active = activeHref === item.href;

          return (
            <Link
              key={item.href + item.title}
              href={item.href}
              className={cn(
                "flex min-h-11 flex-col items-center justify-center rounded-lg px-2 py-1 text-center text-[11px] font-bold uppercase tracking-[0.08em] text-muted-foreground",
                active && "bg-primary/15 text-white",
              )}
            >
              {Icon ? (
                <Icon className="mb-1 size-4 text-primary" aria-hidden="true" />
              ) : null}
              <span>{getNavTitle(t, item)}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
