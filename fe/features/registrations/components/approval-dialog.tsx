"use client";

import { X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { registrationsApi } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import type { RaceRegistration } from "@/features/registrations/mock-registrations";

export type ApprovalDialogProps = {
  registration: RaceRegistration | null;
  action: "approve" | "reject" | null;
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
};

export function ApprovalDialog({
  registration,
  action,
  open,
  onClose,
  onSuccess,
}: ApprovalDialogProps) {
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!open || !registration || !action) return null;

  const isReject = action === "reject";

  const handleConfirm = async () => {
    setIsSubmitting(true);
    try {
      if (isReject) {
        await registrationsApi.reject(registration.id, reason);
        toast.success(`Đã từ chối đơn đăng ký của ngựa ${registration.horse} thành công!`);
      } else {
        await registrationsApi.approve(registration.id);
        toast.success(`Đã phê duyệt đơn đăng ký của ngựa ${registration.horse} thành công!`);
      }
      onSuccess?.();
    } catch (err) {
      console.error(err);
      toast.error((err as Error).message || "Lỗi xử lý duyệt đơn đăng ký.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="approval-dialog-title"
    >
      <div className="w-full max-w-xl overflow-hidden rounded-2xl border border-border/10 bg-[#15151E] shadow-[0_24px_90px_rgba(0,0,0,0.6)]">
        <div className="flex items-start justify-between border-b border-border/10 p-5">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-primary">
              {isReject ? "Reject registration" : "Approve registration"}
            </p>
            <h2
              id="approval-dialog-title"
              className="mt-2 text-2xl font-black uppercase text-foreground"
            >
              {registration.horse}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="grid size-10 place-items-center rounded-full border border-border/10 text-white/70 transition hover:bg-muted/10 hover:text-foreground disabled:opacity-50"
            aria-label="Close approval dialog"
          >
            <X className="size-4" />
          </button>
        </div>
        <div className="space-y-4 p-5">
          <div className="rounded-xl border border-border/10 bg-black/25 p-4 text-sm text-muted-foreground">
            <p>
              <span className="font-bold text-foreground">Race:</span>{" "}
              {registration.race}
            </p>
            <p>
              <span className="font-bold text-foreground">Owner:</span>{" "}
              {registration.owner}
            </p>
            <p>
              <span className="font-bold text-foreground">Eligibility:</span>{" "}
              {registration.eligibility}
            </p>
          </div>
          {isReject ? (
            <label
              className="block text-sm font-bold text-foreground"
              htmlFor="reject-reason"
            >
              Lý do từ chối
              <textarea
                id="reject-reason"
                className="mt-2 min-h-28 w-full rounded-xl border border-border/10 bg-black/35 p-3 text-sm font-normal text-foreground outline-none transition placeholder:text-white/35 focus:border-primary focus:ring-2 focus:ring-primary/30"
                placeholder="Nhập lý do từ chối đăng ký..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                disabled={isSubmitting}
              />
            </label>
          ) : (
            <div className="rounded-xl border border-emerald-400/25 bg-emerald-400/10 p-4 text-sm text-emerald-100">
              Bạn có chắc chắn muốn phê duyệt đơn đăng ký của chiến mã này vào trận đấu không? Hành động này sẽ được ghi nhận và nài ngựa (nếu có) sẽ có thể được mời tham gia.
            </div>
          )}
        </div>
        <div className="flex flex-col-reverse gap-3 border-t border-border/10 p-5 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            className="min-h-11 rounded-full"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Hủy
          </Button>
          <Button
            type="button"
            variant={isReject ? "destructive" : "default"}
            className="min-h-11 rounded-full"
            onClick={handleConfirm}
            disabled={isSubmitting}
          >
            {isSubmitting
              ? "Đang xử lý..."
              : isReject
              ? "Xác nhận từ chối"
              : "Xác nhận phê duyệt"}
          </Button>
        </div>
      </div>
    </div>
  );
}
