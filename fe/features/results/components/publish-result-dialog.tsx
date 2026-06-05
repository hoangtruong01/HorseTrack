/* eslint-disable react-hooks/immutability */
"use client";

import { Award, Sparkles, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

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
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishedSuccess, setPublishedSuccess] = useState(false);

  if (!open || !result) return null;

  const canPublish = result.status === "referee_confirmed";

  const handlePublish = async () => {
    setIsPublishing(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsPublishing(false);

    // 1. Update result status to published
    result.status = "published";
    
    // Backend result publication owns reward ledger credits and prediction payouts.\r\n
    setPublishedSuccess(true);
    toast.success("Race results published successfully! Backend will distribute winnings.");
  };

  const handleClose = () => {
    setPublishedSuccess(false);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="publish-dialog-title"
    >
      <div className="w-full max-w-xl overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
        {!publishedSuccess ? (
          <>
            <div className="flex items-start justify-between border-b border-border p-5">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.24em] text-primary">
                  Publish race result
                </p>
                <h2
                  id="publish-dialog-title"
                  className="mt-2 text-2xl font-black uppercase text-foreground"
                >
                  {result.race}
                </h2>
              </div>
              <button
                type="button"
                onClick={handleClose}
                className="grid size-10 place-items-center rounded-full border border-border text-muted-foreground transition hover:bg-muted hover:text-foreground cursor-pointer"
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
                Publishing makes this race ranking visible as the final official result. This action will automatically trigger the reward splits:
              </p>
              
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
                  <div className="flex items-center gap-2">
                    <Award className="size-5 text-primary" />
                    <span className="text-xs font-black uppercase text-foreground tracking-wider">Owner Split (70%)</span>
                  </div>
                  <p className="mt-2 font-mono text-2xl font-black text-foreground">7,000 pts</p>
                  <p className="mt-1 text-[11px] text-muted-foreground">Credits stable: Linh Tran Stable</p>
                </div>

                <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-4">
                  <div className="flex items-center gap-2">
                    <Award className="size-5 text-blue-400" />
                    <span className="text-xs font-black uppercase text-foreground tracking-wider">Jockey Split (30%)</span>
                  </div>
                  <p className="mt-2 font-mono text-2xl font-black text-foreground">3,000 pts</p>
                  <p className="mt-1 text-[11px] text-muted-foreground">Credits jockey: Minh Khoa</p>
                </div>
              </div>

              <div className="rounded-xl border border-border bg-muted/50 p-4 text-xs text-muted-foreground leading-relaxed">
                <strong className="text-primary font-black uppercase tracking-wide mr-1.5">Referee summary:</strong>
                {result.refereeSummary}
              </div>
            </div>
            <div className="flex flex-col-reverse gap-3 border-t border-border p-5 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="outline"
                className="min-h-11 rounded-full text-foreground"
                onClick={handleClose}
                disabled={isPublishing}
              >
                Cancel
              </Button>
              <Button
                type="button"
                className="min-h-11 rounded-full font-black uppercase tracking-wide bg-primary hover:bg-[#B80500] px-5"
                disabled={!canPublish || isPublishing}
                onClick={handlePublish}
              >
                {isPublishing ? "Distributing Prize..." : "Confirm & Publish"}
              </Button>
            </div>
          </>
        ) : (
          <div className="p-8 text-center space-y-5">
            <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <Sparkles className="size-8" />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-black uppercase text-foreground tracking-tight">Race Results Published!</h3>
              <p className="text-sm text-muted-foreground max-w-sm mx-auto leading-relaxed">
                Prize splits are handled by the backend ledger when official results are published.
              </p>
            </div>
            <div className="rounded-xl border border-border bg-muted/50 p-4 text-left font-mono text-xs max-w-sm mx-auto space-y-1 text-muted-foreground">
              <p className="text-emerald-400 font-bold">+7,000 pts credited to Owner wallet</p>
              <p className="text-blue-400 font-bold">+3,000 pts credited to Jockey wallet</p>
              <p className="text-muted-foreground/60 mt-2">Audit action: RACE_PUBLISHED, PRIZE_SPLIT</p>
            </div>
            <Button
              onClick={handleClose}
              className="h-12 w-full rounded-full font-black uppercase tracking-wider text-foreground bg-primary hover:bg-[#B80500]"
            >
              Done
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
