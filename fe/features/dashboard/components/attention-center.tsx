"use client";

import Link from "next/link";
import {
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  Info,
} from "lucide-react";

import { cn } from "@/lib/utils";

export type AttentionSeverity = "critical" | "warning" | "info";

export type AttentionItem = {
  id: string;
  key?: string;
  severity: AttentionSeverity;
  title: string;
  description: string;
  count?: number;
  actionLabel: string;
  actionHref: string;
};

export type AttentionCenterProps = {
  items: AttentionItem[];
};

const severityConfig: Record<
  AttentionSeverity,
  {
    label: string;
    icon: typeof AlertCircle;
    border: string;
    dot: string;
    badge: string;
    iconColor: string;
  }
> = {
  critical: {
    label: "Critical",
    icon: AlertCircle,
    border: "border-l-2 border-l-red-500",
    dot: "bg-red-500",
    badge: "border-red-500/20 bg-red-500/10 text-red-400",
    iconColor: "text-red-400",
  },
  warning: {
    label: "Warning",
    icon: AlertTriangle,
    border: "border-l-2 border-l-yellow-400",
    dot: "bg-yellow-400",
    badge: "border-yellow-400/20 bg-yellow-400/10 text-yellow-300",
    iconColor: "text-yellow-400",
  },
  info: {
    label: "Info",
    icon: Info,
    border: "border-l-2 border-l-blue-400",
    dot: "bg-blue-400",
    badge: "border-blue-400/20 bg-blue-400/10 text-blue-300",
    iconColor: "text-blue-400",
  },
};

export function AttentionCenter({ items }: AttentionCenterProps) {
  if (items.length === 0) {
    return (
      <section className="rounded-lg border border-border bg-card p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-foreground">Trung tâm chú ý</h2>
        </div>
        <div className="flex items-center gap-2 py-4 text-muted-foreground">
          <Info className="size-4 shrink-0" />
          <p className="text-xs">Không có việc cần xử lý ngay.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-lg border border-border bg-card">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold text-foreground">
            Trung tâm chú ý
          </h2>
          <span className="inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide border border-red-500/20 bg-red-500/10 text-red-400">
            {items.filter((i) => i.severity === "critical").length} critical
          </span>
        </div>
        <p className="text-[10px] text-muted-foreground uppercase tracking-wide">
          Ưu tiên: Critical → Warning → Info
        </p>
      </div>

      {/* Items */}
      <ul className="divide-y divide-border">
        {items.map((item) => {
          const cfg = severityConfig[item.severity];
          const Icon = cfg.icon;

          return (
            <li
              key={item.id}
              className={cn(
                "flex items-center gap-4 px-4 py-3 transition-colors duration-150 hover:bg-muted/30",
                cfg.border,
              )}
            >
              {/* Severity icon */}
              <Icon
                className={cn("size-4 shrink-0", cfg.iconColor)}
                aria-hidden="true"
              />

              {/* Content */}
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={cn(
                      "inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide border",
                      cfg.badge,
                    )}
                  >
                    {cfg.label}
                  </span>
                  <p className="text-sm font-semibold text-foreground truncate">
                    {item.title}
                  </p>
                  {item.count !== undefined && (
                    <span className="ml-auto shrink-0 text-lg font-bold text-foreground">
                      {item.count}
                    </span>
                  )}
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground truncate">
                  {item.description}
                </p>
              </div>

              {/* Action */}
              <Link
                href={item.actionHref}
                className={cn(
                  "inline-flex shrink-0 items-center gap-1 rounded px-2.5 py-1.5 text-xs font-semibold border transition-colors duration-150 hover:bg-muted/50 whitespace-nowrap",
                  cfg.badge,
                )}
              >
                {item.actionLabel}
                <ArrowRight className="size-3" />
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
