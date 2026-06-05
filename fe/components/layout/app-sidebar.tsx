"use client";

import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { dashboardNavigation } from "@/constants/navigation";
import { cn } from "@/lib/utils";
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
      </aside>
    </Tooltip.Provider>
  );
}