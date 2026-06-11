import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { QuickAction } from "@/features/dashboard/mock-admin-dashboard";

export type QuickActionGridProps = {
  actions: QuickAction[];
};

const toneClassName: Record<QuickAction["tone"], string> = {
  primary: "border-primary/50 bg-primary/12 text-primary",
  teal: "border-[#067E6A]/50 bg-[#067E6A]/12 text-[#49D6BE]",
  yellow: "border-[#F8CD46]/50 bg-[#F8CD46]/12 text-[#F8CD46]",
  neutral: "border-border bg-muted text-foreground",
};

export function QuickActionGrid({ actions }: QuickActionGridProps) {
  const { t } = useTranslation();

  return (
    <section className="rounded-2xl border border-border bg-card p-4 shadow-[0_18px_56px_rgba(0,0,0,0.28)] dark:shadow-[0_18px_56px_rgba(0,0,0,0.28)] sm:p-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-primary">
            {t("admin.quickActions.eyebrow", "Admin command grid")}
          </p>
          <h2 className="mt-2 text-2xl font-black uppercase tracking-tight text-foreground">
            {t("admin.quickActions.title", "Quick actions")}
          </h2>
        </div>
        <p className="max-w-md text-sm leading-6 text-muted-foreground">
          {t("admin.quickActions.subtitle", "Entry points only. CRUD flows arrive in later phases.")}
        </p>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {actions.map((action) => {
          const Icon = action.icon;

          return (
            <Link
              key={action.title}
              href={action.href}
              className="group rounded-xl border border-border bg-muted p-4 transition duration-200 hover:-translate-y-0.5 hover:border-primary/45 hover:bg-muted/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <div className="flex items-start justify-between gap-3">
                <div
                  className={cn(
                    "rounded-lg border p-2.5 shadow-[0_10px_28px_rgba(0,0,0,0.18)]",
                    toneClassName[action.tone],
                  )}
                  aria-hidden="true"
                >
                  <Icon className="size-5" />
                </div>
                <ArrowUpRight className="size-4 text-muted-foreground transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-foreground" />
              </div>
              <h3 className="mt-4 text-lg font-black uppercase tracking-tight text-foreground">
                {t(`admin.quickActionsItems.${action.key}.title`, action.title)}
              </h3>
              <p className="mt-2 min-h-12 text-sm leading-5 text-muted-foreground">
                {t(`admin.quickActionsItems.${action.key}.description`, action.description)}
              </p>
              <Button
                asChild
                size="sm"
                variant={action.tone === "primary" ? "default" : "outline"}
                className="mt-4 pointer-events-none rounded-full"
              >
                <span>{t(`admin.quickActionsItems.${action.key}.label`, action.label)}</span>
              </Button>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
