"use client";

import { X } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { RaceRegistration } from "@/features/registrations/mock-registrations";

export type ApprovalDialogProps = {
  registration: RaceRegistration | null;
  action: "approve" | "reject" | null;
  open: boolean;
  onClose: () => void;
};

export function ApprovalDialog({
  registration,
  action,
  open,
  onClose,
}: ApprovalDialogProps) {
  if (!open || !registration || !action) return null;

  const isReject = action === "reject";

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center dark:bg-black/70 bg-muted/20 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="approval-dialog-title"
    >
      <div className="w-full max-w-xl overflow-hidden rounded-2xl border dark:border-white/10 border-border dark:bg-[#15151E] bg-card shadow-[0_24px_90px_rgba(0,0,0,0.6)]">
        <div className="flex items-start justify-between border-b dark:border-white/10 border-border p-5">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-primary">
              {isReject ? "Reject registration" : "Approve registration"}
            </p>
            <h2
              id="approval-dialog-title"
              className="mt-2 text-2xl font-black uppercase dark:text-white text-foreground"
            >
              {registration.horse}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid size-10 place-items-center rounded-full border dark:border-white/10 border-border dark:text-white/70 text-muted-foreground transition hover:dark:bg-white/10 bg-muted/50 hover:dark:text-white text-foreground"
            aria-label="Close approval dialog"
          >
            <X className="size-4" />
          </button>
        </div>
        <div className="space-y-4 p-5">
          <div className="rounded-xl border dark:border-white/10 border-border dark:bg-black/25 bg-muted/20 p-4 text-sm text-muted-foreground">
            <p>
              <span className="font-bold dark:text-white text-foreground">Race:</span>{" "}
              {registration.race}
            </p>
            <p>
              <span className="font-bold dark:text-white text-foreground">Owner:</span>{" "}
              {registration.owner}
            </p>
            <p>
              <span className="font-bold dark:text-white text-foreground">Eligibility:</span>{" "}
              {registration.eligibility}
            </p>
          </div>
          {isReject ? (
            <label
              className="block text-sm font-bold dark:text-white text-foreground"
              htmlFor="reject-reason"
            >
              Reject reason placeholder
              <textarea
                id="reject-reason"
                className="mt-2 min-h-28 w-full rounded-xl border dark:border-white/10 border-border dark:bg-black/35 bg-muted/20 p-3 text-sm font-normal dark:text-white text-foreground outline-none transition placeholder:dark:text-white/35 text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/30"
                placeholder="Example: missing health clearance, duplicate entry, owner needs resubmission..."
              />
            </label>
          ) : (
            <div className="rounded-xl border border-emerald-400/25 bg-emerald-400/10 p-4 text-sm text-emerald-100">
              Approve action is mock-only. This confirms the registration
              visually for the admin moderation workflow.
            </div>
          )}
        </div>
        <div className="flex flex-col-reverse gap-3 border-t dark:border-white/10 border-border p-5 sm:flex-row sm:justify-end">
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
            variant={isReject ? "destructive" : "default"}
            className="min-h-11 rounded-full"
            onClick={onClose}
          >
            {isReject ? "Confirm reject" : "Confirm approve"}
          </Button>
        </div>
      </div>
    </div>
  );
}
