"use client";

import Link from "next/link";
import { LogOut, User } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { dashboardNavigation } from "@/constants/navigation";
import { cn } from "@/lib/utils";
import { useAuth } from "@/providers/auth-provider";
import type { NavigationItem, NavigationRole } from "@/types/navigation";

export type AppSidebarProps = {
  className?: string;
  items?: NavigationItem[];
  activeHref?: string;
  role?: NavigationRole;
};

export function AppSidebar({
  className,
  items = dashboardNavigation,
  activeHref,
  role,
}: AppSidebarProps) {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [currentHref, setCurrentHref] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      // Hàm cập nhật URL bao gồm cả query params
      const updateHref = () => {
        setCurrentHref(window.location.pathname + window.location.search);
      };
      
      updateHref();
      
      // Lắng nghe các sự kiện thay đổi URL (chuyển đổi trang)
      window.addEventListener("popstate", updateHref);
      return () => window.removeEventListener("popstate", updateHref);
    }
  }, [pathname]);

  const visibleItems = role
    ? items.filter((item) => item.role === role)
    : items;

  return (
    <aside
      className={cn(
        "hidden w-72 shrink-0 border-r border-sidebar-border bg-sidebar p-4 text-sidebar-foreground lg:flex flex-col justify-between min-h-[calc(100vh-76px)]",
        className,
      )}
      aria-label="Dashboard navigation"
    >
      <div className="space-y-6">
        <div className="rounded-lg border border-white/10 bg-white/[0.03] p-4">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-primary">
            Race ops
          </p>
          <h2 className="mt-2 text-xl font-black uppercase text-white">
            Independent race flow
          </h2>
          <p className="mt-2 text-sm leading-5 text-muted-foreground">
            Tournament contains races. Each race owns participants, referee,
            result, ranking.
          </p>
        </div>

        <nav className="space-y-2">
          {visibleItems.map((item) => {
            const Icon = item.icon;
            // Xác định active dựa trên cả path và query param
            const isActive =
              currentHref === item.href ||
              activeHref === item.href ||
              (item.href === pathname && !currentHref.includes("?tab="));

            return (
              <Link
                key={item.href + item.title}
                href={item.href}
                className={cn(
                  "group flex gap-3 rounded-lg border border-transparent p-3 text-sm transition hover:border-white/15 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                  isActive && "border-primary/60 bg-primary/10 text-white",
                )}
              >
                {Icon ? (
                  <Icon
                    className="mt-0.5 size-4 text-primary"
                    aria-hidden="true"
                  />
                ) : null}
                <span>
                  <span className="block font-bold uppercase tracking-[0.08em]">
                    {item.title}
                  </span>
                  {item.description ? (
                    <span className="mt-1 block text-xs leading-4 text-muted-foreground">
                      {item.description}
                    </span>
                  ) : null}
                </span>
              </Link>
            );
          })}
        </nav>
      </div>

      {user ? (
        <div className="mt-auto pt-6 border-t border-white/10 space-y-4">
          <Link
            href="/profile"
            className="flex items-center gap-3 group rounded-xl p-2 border border-transparent hover:border-white/5 hover:bg-white/[0.02] transition"
          >
            <div className="flex size-9 items-center justify-center rounded-xl bg-[#E10600]/10 border border-[#E10600]/20 text-[#E10600] group-hover:scale-105 transition-transform">
              <User className="size-4.5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-black uppercase tracking-wider text-white truncate">
                {user.fullName}
              </p>
              <p className="text-[9px] font-black uppercase tracking-wider text-primary mt-0.5">
                {user.roles[0] || "spectator"}
              </p>
            </div>
          </Link>
          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#E10600] px-4 py-2.5 text-xs font-black uppercase tracking-wider text-white shadow-[0_4px_12px_rgba(225,6,0,0.2)] transition hover:scale-[1.02] hover:bg-[#B80500] active:scale-[0.98] cursor-pointer"
          >
            <LogOut className="size-3.5" />
            Đăng xuất
          </button>
        </div>
      ) : null}
    </aside>
  );
}
