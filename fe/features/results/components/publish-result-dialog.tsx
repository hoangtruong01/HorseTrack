/* eslint-disable react-hooks/immutability */
"use client";

import { Award, Sparkles, X } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import type { RaceResultReview } from "@/features/results/mock-results";
import {
  mockWalletBalances,
  mockTransactions,
  addAuditLog,
} from "@/features/wallet/mock-wallet";

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
  const { t } = useTranslation();
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishedSuccess, setPublishedSuccess] = useState(false);

  if (!open || !result) return null;

  const canPublish = result.status === "referee_confirmed";
  const refereeSummary = t(
    `pages.admin.resultReview.mock.${result.raceId}.refereeSummary`,
    { defaultValue: result.refereeSummary },
  );

  const statusLabel = t(`pages.admin.publishDialog.status.${result.status}`, {
    defaultValue: result.status.replace("_", " "),
  });

  const handlePublish = async () => {
    setIsPublishing(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsPublishing(false);

    result.status = "published";

    const totalPrizePoints = 10000;
    const ownerPoints = totalPrizePoints * 0.7;
    const jockeyPoints = totalPrizePoints * 0.3;

    if (mockWalletBalances["user-owner-1"] !== undefined) {
      mockWalletBalances["user-owner-1"] += ownerPoints;
    }
    if (mockWalletBalances["user-jockey-1"] !== undefined) {
      mockWalletBalances["user-jockey-1"] += jockeyPoints;
    }

    const newOwnerTx = {
      id: `tx-${mockTransactions.length + 1}`,
      type: "prize_owner" as const,
      amount: ownerPoints,
      amountVnd: ownerPoints * 100,
      description: `Winner prize split (70%) - Crimson Bolt in ${result.race}`,
      createdAt: new Date().toISOString(),
      status: "completed" as const,
    };

    const newJockeyTx = {
      id: `tx-${mockTransactions.length + 2}`,
      type: "prize_jockey" as const,
      amount: jockeyPoints,
      amountVnd: jockeyPoints * 100,
      description: `Winner prize split (30%) - Jockey assignment for Crimson Bolt in ${result.race}`,
      createdAt: new Date().toISOString(),
      status: "completed" as const,
    };

    mockTransactions.unshift(newOwnerTx, newJockeyTx);

    addAuditLog(
      "RACE_PUBLISHED",
      "admin@horsetrack.com",
      `Published results for ${result.race}. Crimson Bolt placed 1st.`,
    );
    addAuditLog(
      "PRIZE_SPLIT",
      "SYSTEM",
      `Allocated 70% prize (${ownerPoints} pts) to Owner Linh Tran Stable and 30% (${jockeyPoints} pts) to Jockey Minh Khoa`,
    );
    addAuditLog(
      "PREDICTION_PAYOUT",
      "SYSTEM",
      `Processed spectator prediction win payout multiplier for users who predicted Crimson Bolt.`,
    );

    setPublishedSuccess(true);
    toast.success(t("pages.admin.publishDialog.toastSuccess"));
  };

  const handleClose = () => {
    setPublishedSuccess(false);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center dark:bg-black/80 bg-muted/20 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="publish-dialog-title"
    >
      <div className="w-full max-w-xl overflow-hidden rounded-2xl border dark:border-white/10 border-border dark:bg-[#15151E] bg-card shadow-[0_24px_90px_rgba(0,0,0,0.8)]">
        {!publishedSuccess ? (
          <>
            <div className="flex items-start justify-between border-b dark:border-white/10 border-border p-5">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.24em] text-primary">
                  {t("pages.admin.publishDialog.eyebrow")}
                </p>
                <h2
                  id="publish-dialog-title"
                  className="mt-2 text-2xl font-black uppercase dark:text-white text-foreground"
                >
                  {result.race}
                </h2>
              </div>
              <button
                type="button"
                onClick={handleClose}
                className="grid size-10 place-items-center rounded-full border dark:border-white/10 border-border dark:text-white/70 text-muted-foreground transition hover:dark:bg-white/10 bg-muted/50 hover:dark:text-white text-foreground cursor-pointer"
                aria-label={t("pages.admin.publishDialog.close")}
              >
                <X className="size-4" />
              </button>
            </div>
            <div className="space-y-4 p-5">
              <StatusBadge
                label={statusLabel}
                tone={
                  canPublish
                    ? "green"
                    : result.status === "published"
                      ? "teal"
                      : "yellow"
                }
              />
              <p className="text-sm leading-6 text-muted-foreground">
                {t("pages.admin.publishDialog.description")}
              </p>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
                  <div className="flex items-center gap-2">
                    <Award className="size-5 text-primary" />
                    <span className="text-xs font-black uppercase dark:text-white text-foreground tracking-wider">
                      {t("pages.admin.publishDialog.ownerSplit")}
                    </span>
                  </div>
                  <p className="mt-2 font-mono text-2xl font-black dark:text-white text-foreground">
                    {t("pages.admin.publishDialog.ownerPoints")}
                  </p>
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    {t("pages.admin.publishDialog.ownerCredits")}
                  </p>
                </div>

                <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-4">
                  <div className="flex items-center gap-2">
                    <Award className="size-5 text-blue-400" />
                    <span className="text-xs font-black uppercase dark:text-white text-foreground tracking-wider">
                      {t("pages.admin.publishDialog.jockeySplit")}
                    </span>
                  </div>
                  <p className="mt-2 font-mono text-2xl font-black dark:text-white text-foreground">
                    {t("pages.admin.publishDialog.jockeyPoints")}
                  </p>
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    {t("pages.admin.publishDialog.jockeyCredits")}
                  </p>
                </div>
              </div>

              <div className="rounded-xl border dark:border-white/10 border-border dark:bg-black/25 bg-muted/20 p-4 text-xs dark:text-white/80 text-muted-foreground leading-relaxed">
                <strong className="text-primary font-black uppercase tracking-wide mr-1.5">
                  {t("pages.admin.publishDialog.refereeSummaryLabel")}
                </strong>
                {refereeSummary}
              </div>
            </div>
            <div className="flex flex-col-reverse gap-3 border-t dark:border-white/10 border-border p-5 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="outline"
                className="min-h-11 rounded-full dark:border-white/10 border-border dark:text-white text-foreground"
                onClick={handleClose}
                disabled={isPublishing}
              >
                {t("pages.admin.publishDialog.cancel")}
              </Button>
              <Button
                type="button"
                className="min-h-11 rounded-full font-black uppercase tracking-wide bg-primary hover:bg-[#B80500] px-5"
                disabled={!canPublish || isPublishing}
                onClick={handlePublish}
              >
                {isPublishing
                  ? t("pages.admin.publishDialog.publishing")
                  : t("pages.admin.publishDialog.confirm")}
              </Button>
            </div>
          </>
        ) : (
          <div className="p-8 text-center space-y-5">
            <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <Sparkles className="size-8" />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-black uppercase dark:text-white text-foreground tracking-tight">
                {t("pages.admin.publishDialog.successTitle")}
              </h3>
              <p className="text-sm text-muted-foreground max-w-sm mx-auto leading-relaxed">
                {t("pages.admin.publishDialog.successDescription")}
              </p>
            </div>
            <div className="rounded-xl border dark:border-white/5 border-border dark:bg-white/[0.02] bg-muted/50 p-4 text-left font-mono text-xs max-w-sm mx-auto space-y-1 dark:text-white/80 text-muted-foreground">
              <p className="text-emerald-400 font-bold">
                {t("pages.admin.publishDialog.successOwnerCredit")}
              </p>
              <p className="text-blue-400 font-bold">
                {t("pages.admin.publishDialog.successJockeyCredit")}
              </p>
              <p className="dark:text-white/40 text-muted-foreground mt-2">
                {t("pages.admin.publishDialog.successAudit")}
              </p>
            </div>
            <Button
              onClick={handleClose}
              className="h-12 w-full rounded-full font-black uppercase tracking-wider text-white bg-primary hover:bg-[#B80500]"
            >
              {t("pages.admin.publishDialog.done")}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
