"use client";

import React, { useState } from "react";
import { AlertCircle, CheckCircle2, Copy, Gift, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
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
  const [expandedId, setExpandedId] = useState<string | null>(null);

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

  // Tính toán các chỉ số KPI tại quầy giao dịch (Processed Today & Pending Queue)
  const processedTodayCount = historyItems.filter(
    (item) => item.status === "PAID" || item.status === "REJECTED"
  ).length;

  const pendingQueueCount = historyItems.filter(
    (item) => item.status === "PENDING"
  ).length;

  return (
    <section className="animate-[fadeIn_0.5s_ease-out]">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 items-start">
        {/* CỘT TRÁI (col-span-5): Tra cứu & Xử lý nhanh */}
        <div className="lg:col-span-5 space-y-6">
          <div className="rounded-2xl border border-border bg-card p-5 shadow-lg sm:p-6">
            <h2 className="text-sm font-black uppercase tracking-[0.2em] text-primary">
              {t("wallet.redemption.lookupTitle")}
            </h2>
            <p className="mt-1 mb-4 text-xs text-muted-foreground">
              {t("wallet.redemption.lookupDesc")}
            </p>

            <form onSubmit={handleLookupSubmit} className="flex flex-col gap-3 sm:flex-row">
              <input
                id="search-code-input"
                type="text"
                placeholder={t("wallet.redemption.placeholder")}
                value={searchCode}
                onChange={(e) => setSearchCode(e.target.value)}
                disabled={isSearching}
                className="h-12 flex-1 rounded-xl border border-border bg-muted px-4 font-mono text-base font-black text-foreground placeholder:text-muted-foreground outline-none focus:border-primary transition disabled:opacity-50"
              />
              <div className="flex gap-2 shrink-0">
                <Button
                  type="submit"
                  disabled={isSearching || !searchCode.trim()}
                  className="h-12 rounded-xl px-5 font-black uppercase bg-primary hover:bg-[#B80500] text-white shadow-md transition-colors"
                >
                  {isSearching ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    t("wallet.redemption.btnLookup")
                  )}
                </Button>
                {(searchCode || lookupResult || searchError) && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleClear}
                    className="h-12 rounded-xl px-4 font-bold border-border text-foreground hover:bg-muted"
                  >
                    {t("wallet.redemption.btnClear")}
                  </Button>
                )}
              </div>
            </form>

            {/* Kết quả tra cứu */}
            <div className="mt-5">
              {isSearching && (
                <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                  <Loader2 className="size-6 animate-spin text-primary" />
                  <p className="mt-2 text-xs font-semibold">{t("wallet.redemption.loadingLookup")}</p>
                </div>
              )}

              {!isSearching && searchError && (
                <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/20 p-6 text-center animate-in fade-in duration-200">
                  <AlertCircle className="size-10 text-primary" />
                  <p className="mt-3 text-xs font-black uppercase tracking-wider text-foreground">
                    {t("wallet.redemption.emptyLookup")}
                  </p>
                </div>
              )}

              {!isSearching && lookupResult && (
                <div className="rounded-xl border border-border bg-muted/10 overflow-hidden shadow-sm animate-in fade-in duration-300">
                  <div className="bg-muted/30 px-4 py-3 border-b border-border flex justify-between items-center">
                    <h3 className="text-xs font-black uppercase text-foreground flex items-center gap-1.5">
                      <Gift className="size-4 text-primary" /> {t("wallet.redemption.resultTitle")}
                    </h3>
                    <StatusBadge
                      label={getStatusText(lookupResult.status)}
                      tone={getStatusTone(lookupResult.status)}
                    />
                  </div>

                  <div className="p-4 space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">
                          {t("wallet.redemption.userLabel")}
                        </p>
                        <p className="font-black text-sm text-foreground truncate">{lookupResult.userFullName}</p>
                        <p className="text-[10px] font-bold text-primary mt-0.5">{getRoleLabel(lookupResult.userRole)}</p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">
                          {t("wallet.redemption.codeLabel")}
                        </p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="rounded bg-primary/10 border border-primary/20 px-2 py-0.5 font-mono text-xs font-black text-primary">
                            {lookupResult.redemptionCode}
                          </span>
                          <button
                            onClick={() => copyToClipboard(lookupResult.redemptionCode)}
                            type="button"
                            className="cursor-pointer rounded p-0.5 text-muted-foreground/60 hover:bg-muted/10 hover:text-foreground transition"
                            title="Sao chép"
                          >
                            <Copy className="size-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-2 border-t border-border/40">
                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">
                          {t("wallet.redemption.pointsLabel")}
                        </p>
                        <p className="font-mono text-xl font-black text-foreground">
                          {lookupResult.points.toLocaleString("vi-VN")}{" "}
                          <span className="text-[10px] text-muted-foreground font-bold">
                            {t("wallet.redemption.pointsSuffix")}
                          </span>
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">
                          {t("wallet.redemption.timeLabel")}
                        </p>
                        <p className="font-mono text-xs text-foreground truncate">
                          {new Date(lookupResult.createdAt).toLocaleDateString("vi-VN")}
                        </p>
                      </div>
                    </div>
                  </div>

                  {(lookupResult.status === "PENDING" || lookupResult.status === "APPROVED") && (
                    <div className="bg-muted/20 px-4 py-2.5 border-t border-border flex justify-end gap-2">
                      <Button
                        onClick={() => {
                          setSelectedRequest(lookupResult);
                          setShowRejectDialog(true);
                        }}
                        disabled={isProcessing !== null}
                        variant="outline"
                        className="h-9 rounded-full px-4 text-xs font-bold text-foreground border-border hover:bg-muted hover:text-red-500 transition-colors"
                      >
                        {t("wallet.redemption.btnReject")}
                      </Button>
                      <Button
                        onClick={() => handleAction(lookupResult.id, "PAID")}
                        disabled={isProcessing !== null}
                        className="h-9 rounded-full px-5 text-xs font-black uppercase shadow-[0_2px_8px_rgba(225,6,0,0.25)] hover:bg-[#B80500] transition-colors"
                      >
                        {isProcessing === `${lookupResult.id}-PAID` ? (
                          <Loader2 className="size-3 animate-spin mr-1.5" />
                        ) : (
                          <Gift className="mr-1.5 size-3.5" />
                        )}
                        {t("wallet.redemption.btnConfirmPaid")}
                      </Button>
                    </div>
                  )}

                  {lookupResult.status === "REJECTED" && lookupResult.rejectReason && (
                    <div className="bg-red-500/10 px-4 py-2.5 border-t border-red-500/20">
                      <p className="text-xs font-bold text-red-500">
                        {t("wallet.redemption.btnReject")}: {lookupResult.rejectReason}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* CỘT PHẢI (col-span-7): Danh sách lịch sử giao dịch & KPI ca trực */}
        <div className="lg:col-span-7 space-y-6">
          {/* Thẻ KPI phụ dành cho Counter Staff */}
          <div className="grid grid-cols-1">
            <div className="rounded-xl border border-border bg-card p-4 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">Đã xử lý hôm nay</p>
                <p className="mt-1 font-mono text-2xl font-black text-emerald-400">{processedTodayCount}</p>
              </div>
              <CheckCircle2 className="size-8 text-emerald-500/20" />
            </div>
          </div>

          {/* Bảng lịch sử đổi thưởng */}
          <div className="rounded-2xl border border-border bg-card p-5 shadow-lg sm:p-6">
            <div>
              <h3 className="text-sm font-black uppercase tracking-wider text-foreground">
                {t("wallet.redemption.historyTitle")}
              </h3>
              <p className="mt-1 text-xs text-muted-foreground">
                {t("wallet.redemption.historyDesc")}
              </p>
            </div>

            <div className="mt-5 overflow-hidden rounded-xl border border-border bg-muted/30">
              {historyItems.length === 0 ? (
                <div className="py-10 text-center text-xs text-muted-foreground">
                  {t("wallet.transactions.emptyTitle") || "Không có giao dịch đổi thưởng nào."}
                </div>
              ) : (
                <div className="w-full overflow-hidden">
                  <table className="w-full text-left text-xs table-auto border-collapse">
                    <thead>
                      <tr className="border-b border-border bg-muted/20 text-[10px] font-black uppercase tracking-wider text-muted-foreground">
                        <th className="py-3 px-3">{t("wallet.redemption.colCode") || "Mã"}</th>
                        <th className="py-3 px-3">{t("wallet.redemption.colUser") || "Khách hàng"}</th>
                        <th className="py-3 px-3 text-center w-[120px]">{t("wallet.redemption.colPoints") || "Điểm"}</th>
                        <th className="py-3 px-3 w-[140px] text-center">{t("wallet.redemption.colStatus") || "Trạng thái"}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border text-foreground">
                      {historyItems.map((item) => (
                        <React.Fragment key={item.id}>
                          <tr 
                            className="hover:bg-muted/40 transition cursor-pointer"
                            onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
                          >
                            <td className="py-3 px-3 font-mono font-bold text-primary">
                              {item.redemptionCode}
                            </td>
                            <td className="py-3 px-3">
                              <p className="font-semibold text-foreground truncate">{item.userFullName}</p>
                              <p className="text-[10px] text-muted-foreground">{getRoleLabel(item.userRole)}</p>
                            </td>
                            <td className="py-3 px-3 text-center font-mono font-bold text-amber-500">
                              {item.points.toLocaleString("vi-VN")}
                            </td>
                            <td className="py-3 px-3 text-center">
                              <StatusBadge
                                label={getStatusText(item.status)}
                                tone={getStatusTone(item.status)}
                                className="w-full justify-center text-[9px] px-1 py-0.5 tracking-[0.02em]"
                              />
                            </td>
                          </tr>

                          {/* Chi tiết mở rộng */}
                          {expandedId === item.id && (
                            <tr>
                              <td colSpan={4} className="bg-muted/[0.02] p-0">
                                <div className="border-t border-border/50 px-4 py-4 sm:px-6">
                                  <div className="grid gap-6 sm:grid-cols-2">
                                    <div className="space-y-4">
                                      <div>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/70 mb-1">Mã quy đổi</p>
                                        <div className="inline-flex items-center gap-1.5 rounded bg-muted/50 px-2 py-1 font-mono text-xs font-bold border border-border">
                                          <span className="text-primary">{item.redemptionCode}</span>
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              copyToClipboard(item.redemptionCode);
                                            }}
                                            className="cursor-pointer rounded p-0.5 text-muted-foreground transition hover:bg-muted-foreground/20"
                                          >
                                            <Copy className="size-3" />
                                          </button>
                                        </div>
                                      </div>
                                      {item.status === "REJECTED" && item.rejectReason && (
                                        <div>
                                          <p className="text-[10px] font-black uppercase tracking-widest text-red-500/70 mb-1">Lý do từ chối</p>
                                          <p className="text-[11px] leading-relaxed text-red-400 font-medium bg-red-500/10 p-2 rounded-lg border border-red-500/20">
                                            {item.rejectReason}
                                          </p>
                                        </div>
                                      )}
                                    </div>
                                    <div className="space-y-4 sm:text-right">
                                      <div>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/70 mb-1">Người xử lý</p>
                                        <p className="font-semibold text-[11px] text-foreground">
                                          {item.paidBy || "—"}
                                        </p>
                                      </div>
                                      <div>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/70 mb-1">Thời gian tạo</p>
                                        <p className="font-mono text-[11px] text-muted-foreground">
                                          {item.createdAt ? new Date(item.createdAt).toLocaleString("vi-VN") : "—"}
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Phân trang */}
            {pagination && pagination.totalPages > 1 && (
              <div className="mt-4 flex items-center justify-between border-t border-border pt-4 text-[11px]">
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
                    className="flex items-center gap-1 rounded border border-border px-2.5 py-1.25 transition hover:bg-muted disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="size-3" />
                    {t("wallet.redemption.btnPrev")}
                  </button>
                  <button
                    disabled={pagination.page >= pagination.totalPages}
                    onClick={() => pagination.onPageChange(pagination.page + 1)}
                    className="flex items-center gap-1 rounded border border-border px-2.5 py-1.25 transition hover:bg-muted disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
                  >
                    {t("wallet.redemption.btnNext")}
                    <ChevronRight className="size-3" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
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
