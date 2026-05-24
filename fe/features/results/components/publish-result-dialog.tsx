"use client";

import { X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import type { RaceResultReview } from "@/features/results/mock-results";

export type PublishResultDialogProps = {
  result: RaceResultReview | null;
  open: boolean;
  onClose: () => void;
};

export function PublishResultDialog({
  result,
  open,
  onClose,
}: PublishResultDialogProps) {
  if (!open || !result) return null;

  const canPublish = result.status === "referee_confirmed";

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="publish-dialog-title"
    >
      <div className="w-full max-w-xl overflow-hidden rounded-2xl border border-white/10 bg-[#15151E] shadow-[0_24px_90px_rgba(0,0,0,0.6)]">
        <div className="flex items-start justify-between border-b border-white/10 p-5">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-primary">
              Publish race result
            </p>
            <h2
              id="publish-dialog-title"
              className="mt-2 text-2xl font-black uppercase text-white"
            >
              {result.race}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid size-10 place-items-center rounded-full border border-white/10 text-white/70 transition hover:bg-white/10 hover:text-white"
            aria-label="Close publish dialog"
          >
            <X className="size-4" />
          </button>
        </div>
        <div className="space-y-4 p-5">
          <StatusBadge
            label={result.status.replace("_", " ")}
            tone={
              canPublish
                ? "green"
                : result.status === "published"
                  ? "teal"
                  : "yellow"
            }
          />
          <p className="text-sm leading-6 text-muted-foreground">
            Publishing makes the mock race ranking visible as the final
            published result state. No API call, socket, notification, or
            leaderboard aggregation is performed.
          </p>
          <div className="rounded-xl border border-white/10 bg-black/25 p-4 text-sm text-white/80">
            {result.refereeSummary}
          </div>
        </div>
        <div className="flex flex-col-reverse gap-3 border-t border-white/10 p-5 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            className="min-h-11 rounded-full"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            type="button"
            className="min-h-11 rounded-full"
            disabled={!canPublish}
            onClick={onClose}
          >
            Confirm publish
          </Button>
        </div>
      </div>
    </div>
  );
}
