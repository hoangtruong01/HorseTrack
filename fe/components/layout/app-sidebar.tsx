import Link from "next/link";

import { dashboardNavigation } from "@/constants/navigation";
import { cn } from "@/lib/utils";
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
  const visibleItems = role
    ? items.filter((item) => item.role === role)
    : items;

  return (
    <aside
      className={cn(
        "hidden min-h-dvh w-72 shrink-0 border-r border-sidebar-border bg-sidebar p-4 text-sidebar-foreground lg:block",
        className,
      )}
      aria-label="Dashboard navigation"
    >
      <div className="mb-6 rounded-lg border border-white/10 bg-white/[0.03] p-4">
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
          const isActive = activeHref === item.href;

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
    </aside>
  );
}
