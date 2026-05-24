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
      className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="approval-dialog-title"
    >
      <div className="w-full max-w-xl overflow-hidden rounded-2xl border border-white/10 bg-[#15151E] shadow-[0_24px_90px_rgba(0,0,0,0.6)]">
        <div className="flex items-start justify-between border-b border-white/10 p-5">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-primary">
              {isReject ? "Reject registration" : "Approve registration"}
            </p>
            <h2
              id="approval-dialog-title"
              className="mt-2 text-2xl font-black uppercase text-white"
            >
              {registration.horse}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid size-10 place-items-center rounded-full border border-white/10 text-white/70 transition hover:bg-white/10 hover:text-white"
            aria-label="Close approval dialog"
          >
            <X className="size-4" />
          </button>
        </div>
        <div className="space-y-4 p-5">
          <div className="rounded-xl border border-white/10 bg-black/25 p-4 text-sm text-muted-foreground">
            <p>
              <span className="font-bold text-white">Race:</span>{" "}
              {registration.race}
            </p>
            <p>
              <span className="font-bold text-white">Owner:</span>{" "}
              {registration.owner}
            </p>
            <p>
              <span className="font-bold text-white">Eligibility:</span>{" "}
              {registration.eligibility}
            </p>
          </div>
          {isReject ? (
            <label
              className="block text-sm font-bold text-white"
              htmlFor="reject-reason"
            >
              Reject reason placeholder
              <textarea
                id="reject-reason"
                className="mt-2 min-h-28 w-full rounded-xl border border-white/10 bg-black/35 p-3 text-sm font-normal text-white outline-none transition placeholder:text-white/35 focus:border-primary focus:ring-2 focus:ring-primary/30"
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
