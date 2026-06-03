import Link from "next/link";
import { ArrowRight, Flag } from "lucide-react";

import { EmptyState } from "@/components/feedback/empty-state";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";

export type RoutePlaceholderProps = {
  eyebrow: string;
  title: string;
  description: string;
  cards?: Array<{ label: string; value: string }>;
  ctaHref?: string;
  ctaLabel?: string;
  emptyTitle?: string;
  emptyDescription?: string;
};

export function RoutePlaceholder({
  eyebrow,
  title,
  description,
  cards = [],
  ctaHref,
  ctaLabel,
  emptyTitle = "Phase 2 shell only",
  emptyDescription = "Placeholder route with local mock copy only. Business screens, backend calls, auth guards, and restricted MVP concepts are intentionally not implemented yet.",
}: RoutePlaceholderProps) {
  return (
    <div className="space-y-8">
      <PageHeader eyebrow={eyebrow} title={title} description={description} />

      {cards.length ? (
        <div className="grid gap-4 md:grid-cols-3">
          {cards.map((card) => (
            <article key={card.label} className="f1-card">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-primary">
                {card.label}
              </p>
              <p className="mt-4 text-2xl font-black uppercase text-foreground">
                {card.value}
              </p>
            </article>
          ))}
        </div>
      ) : null}

      <EmptyState
        icon={<Flag className="size-8" aria-hidden="true" />}
        title={emptyTitle}
        description={emptyDescription}
        action={
          ctaHref && ctaLabel ? (
            <Button
              asChild
              className="rounded-full bg-primary font-bold hover:bg-[#B80500]"
            >
              <Link href={ctaHref}>
                {ctaLabel} <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </Button>
          ) : null
        }
      />
    </div>
  );
}
