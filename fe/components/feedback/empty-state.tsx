import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export type EmptyStateProps = {
  title: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
  className?: string;
};

export function EmptyState({
  title,
  description,
  icon,
  action,
  className,
}: EmptyStateProps) {
  return (
    <section
      className={cn(
        "rounded-lg border border-dashed border-white/15 bg-white/[0.03] p-6 text-center sm:p-8",
        className,
      )}
    >
      {icon ? (
        <div className="mx-auto mb-4 flex justify-center text-primary">
          {icon}
        </div>
      ) : null}
      <h2 className="text-xl font-black uppercase text-white">{title}</h2>
      {description ? (
        <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-muted-foreground">
          {description}
        </p>
      ) : null}
      {action ? <div className="mt-5 flex justify-center">{action}</div> : null}
    </section>
  );
}
