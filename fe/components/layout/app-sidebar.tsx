"use client";

import Link from "next/link";
import { LogOut, User, ChevronLeft, ChevronRight } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { dashboardNavigation } from "@/constants/navigation";
import { cn } from "@/lib/utils";
import { useAuth } from "@/providers/auth-provider";
import type { NavigationItem, NavigationRole } from "@/types/navigation";
import { Tooltip } from "radix-ui";

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
  const [isCollapsed, setIsCollapsed] = useState(false);

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
    <Tooltip.Provider delayDuration={350}>
      <aside
        className={cn(
          "hidden shrink-0 border-r border-border bg-card p-4 text-foreground lg:flex flex-col justify-between h-[calc(100vh-76px)] transition-all duration-300 ease-in-out sticky top-[76px] z-40",
          isCollapsed ? "w-20" : "w-72",
          className,
        )}
        aria-label="Dashboard navigation"
      >
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3 top-1/2 -translate-y-1/2 flex size-6 items-center justify-center rounded-full border border-border bg-card text-foreground shadow-sm transition-all hover:bg-secondary hover:text-foreground z-50 cursor-pointer"
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? <ChevronRight className="size-5" /> : <ChevronLeft className="size-5" />}
        </button>

        <div className="flex flex-col flex-1 overflow-hidden">
          <nav className="space-y-2 max-h-[calc(100vh-200px)] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {visibleItems.map((item) => {
              const Icon = item.icon;
              // Xác định active dựa trên cả path và query param
              const isActive =
                currentHref === item.href ||
                activeHref === item.href ||
                (item.href === pathname && !currentHref.includes("?tab="));

              return (
                <Tooltip.Root key={item.href + item.title}>
                  <Tooltip.Trigger asChild>
                    <Link
                      href={item.href}
                      scroll={false}
                      className={cn(
                        "group relative flex items-center rounded-lg border border-transparent p-3 text-sm transition-all duration-300 ease-in-out hover:border-border hover:bg-secondary hover:text-foreground",
                        isCollapsed ? "justify-center gap-0" : "gap-3",
                        isActive && "border-primary/60 bg-primary/10 text-foreground",
                      )}
                    >
                      {Icon ? (
                        <Icon
                          className={cn("shrink-0 text-primary transition-all duration-300", isCollapsed ? "size-5 mx-auto" : "mt-0.5 size-4")}
                          aria-hidden="true"
                        />
                      ) : null}
                      <span className={cn("overflow-hidden transition-all duration-300 ease-in-out whitespace-nowrap flex flex-col justify-center", isCollapsed ? "max-w-0 opacity-0" : "max-w-[200px] opacity-100")}>
                        <span className="block font-bold uppercase tracking-[0.08em]">
                          {item.title}
                        </span>
                        {item.description ? (
                          <span className="mt-1 block text-xs leading-4 text-muted-foreground truncate">
                            {item.description}
                          </span>
                        ) : null}
                      </span>
                    </Link>
                  </Tooltip.Trigger>
                  {isCollapsed && (
                    <Tooltip.Portal>
                      <Tooltip.Content
                        side="right"
                        align="center"
                        sideOffset={12}
                        className="z-50 rounded-md bg-card/95 backdrop-blur-sm border border-border px-3 py-1.5 text-foreground shadow-xl select-none max-w-xs flex flex-col gap-0.5"
                      >
                        <span className="text-xs font-bold uppercase tracking-wider">{item.title}</span>
                        {item.description && (
                          <span className="text-[10px] text-muted-foreground normal-case font-normal leading-snug">
                            {item.description}
                          </span>
                        )}
                      </Tooltip.Content>
                    </Tooltip.Portal>
                  )}
                </Tooltip.Root>
              );
            })}
          </nav>
        </div>

        {user ? (
          <div className={cn("mt-auto pt-6 border-t border-border space-y-4 transition-all duration-300", isCollapsed ? "flex flex-col items-center" : "")}>
            <Tooltip.Root>
              <Tooltip.Trigger asChild>
                <Link
                  href="/profile"
                  scroll={false}
                  className={cn("flex items-center group relative rounded-xl border border-transparent hover:border-border hover:bg-secondary transition-all duration-300", isCollapsed ? "justify-center gap-0 p-0" : "gap-3 p-2")}
                >
                  <div className={cn("flex shrink-0 items-center justify-center rounded-xl bg-primary/10 border border-primary/20 text-primary group-hover:scale-105 transition-transform", isCollapsed ? "size-10 mx-auto" : "size-9")}>
                    <User className="size-4.5" />
                  </div>
                  <div className={cn("min-w-0 flex-1 overflow-hidden transition-all duration-300 ease-in-out whitespace-nowrap", isCollapsed ? "max-w-0 opacity-0" : "max-w-[150px] opacity-100")}>
                    <p className="text-xs font-black uppercase tracking-wider text-foreground truncate">
                      {user.fullName}
                    </p>
                    <p className="text-[9px] font-black uppercase tracking-wider text-primary mt-0.5">
                      {user.roles[0] || "spectator"}
                    </p>
                  </div>
                </Link>
              </Tooltip.Trigger>
              {isCollapsed && (
                <Tooltip.Portal>
                  <Tooltip.Content
                    side="right"
                    align="center"
                    sideOffset={12}
                    className="z-50 rounded-md bg-card/95 backdrop-blur-sm border border-border px-3 py-1.5 text-foreground shadow-xl select-none max-w-xs flex flex-col gap-0.5"
                  >
                    <span className="text-xs font-bold uppercase tracking-wider">{user.fullName}</span>
                    <span className="text-[10px] text-primary uppercase font-bold tracking-wider">
                      {user.roles[0] || "spectator"}
                    </span>
                  </Tooltip.Content>
                </Tooltip.Portal>
              )}
            </Tooltip.Root>

            <Tooltip.Root>
              <Tooltip.Trigger asChild>
                <button
                  onClick={logout}
                  className={cn("w-full flex items-center rounded-xl bg-primary text-xs font-black uppercase tracking-wider text-primary-foreground shadow-[0_4px_12px_rgba(225,6,0,0.2)] transition-all duration-300 hover:scale-[1.02] hover:bg-primary/90 active:scale-[0.98] cursor-pointer relative group", isCollapsed ? "justify-center gap-0 p-2.5" : "justify-center gap-2 px-4 py-2.5")}
                >
                  <LogOut className={cn("shrink-0 transition-all duration-300", isCollapsed ? "size-4.5 mx-auto" : "size-3.5")} />
                  <span className={cn("overflow-hidden transition-all duration-300 ease-in-out whitespace-nowrap", isCollapsed ? "max-w-0 opacity-0" : "max-w-full opacity-100")}>
                    Đăng xuất
                  </span>
                </button>
              </Tooltip.Trigger>
              {isCollapsed && (
                <Tooltip.Portal>
                  <Tooltip.Content
                    side="right"
                    align="center"
                    sideOffset={12}
                    className="z-50 rounded-md bg-card/90 backdrop-blur-sm border border-border px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-foreground shadow-xl select-none"
                  >
                    Đăng xuất
                  </Tooltip.Content>
                </Tooltip.Portal>
              )}
            </Tooltip.Root>
          </div>
        ) : null}
      </aside>
    </Tooltip.Provider>
  );
}