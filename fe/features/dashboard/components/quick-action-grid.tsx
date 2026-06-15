import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { useTranslation } from "react-i18next";

import { cn } from "@/lib/utils";
import type { QuickAction } from "@/features/dashboard/mock-admin-dashboard";

export type QuickActionGridProps = {
  actions: QuickAction[];
};

const toneConfig: Record<
  QuickAction["tone"],
  { icon: string; hover: string }
> = {
  primary: {
    icon: "border-border bg-muted/50 text-muted-foreground",
    hover: "hover:border-primary/40 hover:bg-primary/5",
  },
  teal: {
    icon: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
    hover: "hover:border-emerald-500/30 hover:bg-emerald-500/5",
  },
  yellow: {
    icon: "border-yellow-400/30 bg-yellow-400/10 text-yellow-300",
    hover: "hover:border-yellow-400/30 hover:bg-yellow-400/5",
  },
  neutral: {
    icon: "border-border bg-muted/50 text-muted-foreground",
    hover: "hover:border-primary/30 hover:bg-primary/5",
  },
};

export function QuickActionGrid({ actions }: QuickActionGridProps) {
  const { t } = useTranslation();

  return (
    <section className="rounded-lg border border-border bg-card">
      {/* Header */}
      <div className="border-b border-border px-4 py-3">
        <h2 className="text-sm font-semibold text-foreground">Thao tác nhanh</h2>
      </div>

      {/* Grid 2x2 */}
      <div className="grid grid-cols-2 divide-x divide-y divide-border">
        {actions.map((action) => {
          const Icon = action.icon;
          const cfg = toneConfig[action.tone];

          return (
            <Link
              key={action.key}
              href={action.href}
              className={cn(
                "group flex flex-col gap-3 p-4 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset",
                cfg.hover,
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <div
                  className={cn(
                    "rounded-md border p-2 transition-transform duration-150 group-hover:scale-105",
                    cfg.icon,
                  )}
                  aria-hidden="true"
                >
                  <Icon className="size-4" />
                </div>
                <ArrowUpRight className="size-4 text-muted-foreground/40 transition-all duration-150 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">
                  {t(`admin.quickActionsItems.${action.key}.title`, action.title)}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground leading-relaxed">
                  {t(`admin.quickActionsItems.${action.key}.description`, action.description)}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
