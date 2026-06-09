"use client";

import { AlertCircle, CheckCircle2, Copy, Gift, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import type { CashoutQueueRequest } from "../backend-wallet";

export type CashoutApprovalQueueProps = {
  historyItems: CashoutQueueRequest[];
  lookupResult: CashoutQueueRequest | null;
  isSearching: boolean;
  searchError: string | null;
  onLookup: (code: string) => void;
  onClearLookup: () => void;
  onAction: (id: string, action: "APPROVED" | "PAID" | "REJECTED", reason?: string) => void | Promise<void>;
  pagination?: {
    page: number;
    totalPages: number;
    total: number;
    onPageChange: (page: number) => void;
  };
};

export function CashoutApprovalQueue({
  historyItems,
  lookupResult,
  isSearching,
  searchError,
  onLookup,
  onClearLookup,
  onAction,
  pagination,
}: CashoutApprovalQueueProps) {
  const { t } = useTranslation();
  const [selectedRequest, setSelectedRequest] = useState<CashoutQueueRequest | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [isProcessing, setIsProcessing] = useState<string | null>(null);
  const [searchCode, setSearchCode] = useState("");

  const handleLookupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchCode.trim()) {
      onLookup(searchCode.trim());
    }
  };

  const handleClear = () => {
    setSearchCode("");
    onClearLookup();
  };

  const handleAction = async (id: string, action: "APPROVED" | "PAID" | "REJECTED", reason?: string) => {
    setIsProcessing(`${id}-${action}`);
    try {
      await onAction(id, action, reason);
    } finally {
      setIsProcessing(null);
      setShowRejectDialog(false);
      setRejectReason("");
      setSelectedRequest(null);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success(t("wallet.balance.refreshSuccess") ? `Đã sao chép mã: ${text}` : `Copied code: ${text}`);
  };

  const getRoleLabel = (role: string) => {
    if (role === "Owner") return t("roles.owner");
    if (role === "Jockey") return t("roles.jockey");
    if (role === "Referee") return t("roles.referee");
    return t("roles.spectator");
  };

  const getStatusText = (status: string) => {
    if (status === "PAID") return t("wallet.redemption.statusPaid");
    if (status === "REJECTED") return t("wallet.redemption.statusRejected");
    if (status === "APPROVED") return t("wallet.redemption.btnApprove");
    return t("wallet.redemption.colStatus") ? t("wallet.redemption.statusPending") : "PENDING";
  };

  const getStatusTone = (status: string): "red" | "yellow" | "green" | "slate" | "teal" => {
    if (status === "PAID") return "teal";
    if (status === "REJECTED") return "red";
    if (status === "APPROVED") return "green";
    return "slate";
  };

  return (
    <section className="space-y-8 animate-[fadeIn_0.5s_ease-out]">
      {/* 1. Tra cứu mã đổi thưởng tại quầy */}
      <div className="rounded-2xl border border-border bg-card p-5 shadow-lg sm:p-8">
        <h2 className="text-sm font-black uppercase tracking-[0.2em] text-primary">
          {t("wallet.redemption.lookupTitle")}
        </h2>
        <p className="mt-1 mb-4 text-sm text-muted-foreground">
          {t("wallet.redemption.lookupDesc")}
        </p>

        <form onSubmit={handleLookupSubmit} className="flex gap-3">
          <input
            id="search-code-input"
            type="text"
            placeholder={t("wallet.redemption.placeholder")}
            value={searchCode}
            onChange={(e) => setSearchCode(e.target.value)}
            disabled={isSearching}
            className="h-14 flex-1 rounded-xl border border-border bg-muted px-5 font-mono text-lg font-black text-foreground placeholder:text-muted-foreground outline-none focus:border-primary transition disabled:opacity-50"
          />
          <Button
            type="submit"
            disabled={isSearching || !searchCode.trim()}
            className="h-14 rounded-xl px-8 font-black uppercase bg-primary hover:bg-[#B80500] text-white shadow-md transition-colors"
          >
            {isSearching ? (
              <Loader2 className="size-5 animate-spin" />
            ) : (
              t("wallet.redemption.btnLookup")
            )}
          </Button>
          {(searchCode || lookupResult || searchError) && (
            <Button
              type="button"
              variant="outline"
              onClick={handleClear}
              className="h-14 rounded-xl px-6 font-bold border-border text-foreground hover:bg-muted"
            >
              {t("wallet.redemption.btnClear")}
            </Button>
          )}
        </form>

        {/* Kết quả tra cứu */}
        <div className="mt-6">
          {isSearching && (
            <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
              <Loader2 className="size-8 animate-spin text-primary" />
              <p className="mt-2 text-xs font-semibold">{t("wallet.redemption.loadingLookup")}</p>
            </div>
          )}

          {!isSearching && searchError && (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/20 p-8 text-center animate-in fade-in duration-200">
              <AlertCircle className="size-12 text-primary" />
              <p className="mt-4 text-sm font-black uppercase tracking-wider text-foreground">
                {t("wallet.redemption.emptyLookup")}
              </p>
            </div>
          )}

          {!isSearching && lookupResult && (
            <div className="rounded-xl border border-border bg-muted/10 overflow-hidden shadow-md animate-in fade-in duration-300">
              <div className="bg-muted/30 px-6 py-4 border-b border-border flex justify-between items-center">
                <h3 className="font-black uppercase text-foreground flex items-center gap-2">
                  <Gift className="size-5 text-primary" /> {t("wallet.redemption.resultTitle")}
                </h3>
                <StatusBadge
                  label={getStatusText(lookupResult.status)}
                  tone={getStatusTone(lookupResult.status)}
                />
              </div>

              <div className="p-6 grid gap-6 sm:grid-cols-2">
                <div className="space-y-4">
                  <div>
                    <p className="text-xs uppercase tracking-wider text-muted-foreground font-bold mb-1">
                      {t("wallet.redemption.userLabel")}
                    </p>
                    <p className="font-black text-lg text-foreground">{lookupResult.userFullName}</p>
                    <p className="text-xs font-bold text-primary mt-0.5">{getRoleLabel(lookupResult.userRole)}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wider text-muted-foreground font-bold mb-1">
                      {t("wallet.redemption.codeLabel")}
                    </p>
                    <div className="flex items-center gap-2">
                      <span className="rounded-lg border border-primary/20 bg-primary/10 px-3 py-1 font-mono text-base font-black tracking-wider text-primary">
                        {lookupResult.redemptionCode}
                      </span>
                      <button
                        onClick={() => copyToClipboard(lookupResult.redemptionCode)}
                        type="button"
                        className="cursor-pointer rounded p-1 text-muted-foreground/60 hover:bg-muted/10 hover:text-foreground transition"
                        title="Sao chép"
                      >
                        <Copy className="size-4" />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <p className="text-xs uppercase tracking-wider text-muted-foreground font-bold mb-1">
                      {t("wallet.redemption.pointsLabel")}
                    </p>
                    <p className="font-mono text-3xl font-black text-foreground">
                      {lookupResult.points.toLocaleString("vi-VN")}{" "}
                      <span className="text-sm text-muted-foreground font-bold">
                        {t("wallet.redemption.pointsSuffix")}
                      </span>
                    </p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wider text-muted-foreground font-bold mb-1">
                      {t("wallet.redemption.timeLabel")}
                    </p>
                    <p className="font-mono text-sm text-foreground">
                      {new Date(lookupResult.createdAt).toLocaleString("vi-VN")}
                    </p>
                  </div>
                </div>
              </div>

              {(lookupResult.status === "PENDING" || lookupResult.status === "APPROVED") && (
                <div className="bg-muted/20 px-6 py-4 border-t border-border flex justify-end gap-3">
                  <Button
                    onClick={() => {
                      setSelectedRequest(lookupResult);
                      setShowRejectDialog(true);
                    }}
                    disabled={isProcessing !== null}
                    variant="outline"
                    className="h-11 rounded-full px-6 font-bold text-foreground border-border hover:bg-muted hover:text-red-500 transition-colors"
                  >
                    {t("wallet.redemption.btnReject")}
                  </Button>
                  <Button
                    onClick={() => handleAction(lookupResult.id, "PAID")}
                    disabled={isProcessing !== null}
                    className="h-11 rounded-full px-8 font-black uppercase shadow-[0_4px_12px_rgba(225,6,0,0.25)] hover:bg-[#B80500] transition-colors"
                  >
                    {isProcessing === `${lookupResult.id}-PAID` ? (
                      <Loader2 className="size-4 animate-spin mr-2" />
                    ) : (
                      <Gift className="mr-2 size-4" />
                    )}
                    {t("wallet.redemption.btnConfirmPaid")}
                  </Button>
                </div>
              )}

              {lookupResult.status === "REJECTED" && lookupResult.rejectReason && (
                <div className="bg-red-500/10 px-6 py-4 border-t border-red-500/20">
                  <p className="text-sm font-bold text-red-500">
                    {t("wallet.redemption.btnReject")}: {lookupResult.rejectReason}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 2. Lịch sử giao dịch đổi thưởng */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-lg">
        <div>
          <h3 className="text-sm font-black uppercase tracking-wider text-foreground">
            {t("wallet.redemption.historyTitle")}
          </h3>
          <p className="mt-1 text-xs text-muted-foreground">
            {t("wallet.redemption.historyDesc")}
          </p>
        </div>

        <div className="mt-6 overflow-hidden rounded-xl border border-border bg-muted/30">
          {historyItems.length === 0 ? (
            <div className="py-12 text-center text-xs text-muted-foreground">
              {t("wallet.transactions.emptyTitle") || "Không có giao dịch đổi thưởng nào."}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs min-w-[800px]">
                <thead>
                  <tr className="border-b border-border bg-muted/20 text-[10px] font-black uppercase tracking-wider text-muted-foreground">
                    <th className="py-3 px-4">{t("wallet.redemption.colCode")}</th>
                    <th className="py-3 px-4">{t("wallet.redemption.colUser")}</th>
                    <th className="py-3 px-4 text-center">{t("wallet.redemption.colPoints")}</th>
                    <th className="py-3 px-4">{t("wallet.redemption.colHandler")}</th>
                    <th className="py-3 px-4">{t("wallet.redemption.colTimeCreated")}</th>
                    <th className="py-3 px-4">{t("wallet.redemption.colTimeProcessed")}</th>
                    <th className="py-3 px-4">{t("wallet.redemption.colStatus")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border text-foreground">
                  {historyItems.map((item) => (
                    <tr key={item.id} className="hover:bg-muted/40 transition">
                      <td className="py-3 px-4 font-mono font-bold text-primary">
                        {item.redemptionCode}
                      </td>
                      <td className="py-3 px-4">
                        <p className="font-semibold text-foreground">{item.userFullName}</p>
                        <p className="text-[10px] text-muted-foreground">{getRoleLabel(item.userRole)}</p>
                      </td>
                      <td className="py-3 px-4 text-center font-mono font-bold text-amber-700 dark:text-yellow-500">
                        {item.points.toLocaleString("vi-VN")}
                      </td>
                      <td className="py-3 px-4 text-muted-foreground">
                        {item.paidBy || "—"}
                      </td>
                      <td className="py-3 px-4 text-muted-foreground font-mono">
                        {item.createdAt ? new Date(item.createdAt).toLocaleString("vi-VN") : "—"}
                      </td>
                      <td className="py-3 px-4 text-muted-foreground font-mono">
                        {item.paidAt ? new Date(item.paidAt).toLocaleString("vi-VN") : "—"}
                      </td>
                      <td className="py-3 px-4">
                        <StatusBadge
                          label={getStatusText(item.status)}
                          tone={getStatusTone(item.status)}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Phân trang */}
        {pagination && pagination.totalPages > 1 && (
          <div className="mt-4 flex items-center justify-between border-t border-border pt-4 text-xs">
            <span className="text-muted-foreground">
              {t("wallet.redemption.showing", {
                start: (pagination.page - 1) * 10 + 1,
                end: Math.min(pagination.page * 10, pagination.total),
                total: pagination.total,
              })}
            </span>
            <div className="flex gap-2">
              <button
                disabled={pagination.page <= 1}
                onClick={() => pagination.onPageChange(pagination.page - 1)}
                className="flex items-center gap-1 rounded border border-border px-3 py-1.5 transition hover:bg-muted disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
              >
                <ChevronLeft className="size-3.5" />
                {t("wallet.redemption.btnPrev")}
              </button>
              <button
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => pagination.onPageChange(pagination.page + 1)}
                className="flex items-center gap-1 rounded border border-border px-3 py-1.5 transition hover:bg-muted disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
              >
                {t("wallet.redemption.btnNext")}
                <ChevronRight className="size-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Dialog từ chối */}
      {showRejectDialog && selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <h3 className="flex items-center gap-2 text-xl font-black uppercase text-foreground">
              <AlertCircle className="size-5 text-primary" /> {t("wallet.redemption.rejectDialogTitle")}
            </h3>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
              {t("wallet.redemption.rejectConfirmText", {
                code: selectedRequest.redemptionCode,
                name: selectedRequest.userFullName,
                points: selectedRequest.points.toLocaleString("vi-VN"),
              })}
            </p>
            <div className="mt-4 space-y-2">
              <label htmlFor="reason" className="block text-xs font-black uppercase tracking-wider text-muted-foreground">
                {t("wallet.redemption.rejectReasonLabel")}
              </label>
              <textarea
                id="reason"
                required
                rows={3}
                placeholder={t("wallet.redemption.rejectReasonPlaceholder")}
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="w-full rounded-xl border border-border bg-muted p-3 text-sm text-foreground outline-none focus:border-primary"
              />
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setShowRejectDialog(false);
                  setSelectedRequest(null);
                  setRejectReason("");
                }}
                className="h-11 rounded-full border-border text-foreground font-bold"
              >
                {t("wallet.redemption.btnCancel")}
              </Button>
              <Button
                disabled={!rejectReason.trim() || isProcessing !== null}
                onClick={() => handleAction(selectedRequest.id, "REJECTED", rejectReason)}
                variant="destructive"
                className="h-11 rounded-full px-6 font-black uppercase tracking-wide"
              >
                {t("wallet.redemption.btnRejectSubmit")}
              </Button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
