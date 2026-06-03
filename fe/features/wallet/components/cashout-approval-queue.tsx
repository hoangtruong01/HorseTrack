"use client";

import { AlertCircle, CheckCircle2, Copy, Gift, Ticket } from "lucide-react";
import { useState } from "react";
import { useTranslation, Trans } from "react-i18next";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import type { CashoutRequest } from "../mock-wallet";

export type CashoutApprovalQueueProps = {
  requests: CashoutRequest[];
  onAction: (id: string, action: "APPROVED" | "PAID" | "REJECTED", reason?: string) => void;
};

export function CashoutApprovalQueue({ requests, onAction }: CashoutApprovalQueueProps) {
  const { t } = useTranslation();
  const [selectedRequest, setSelectedRequest] = useState<CashoutRequest | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [isProcessing, setIsProcessing] = useState<string | null>(null);
  const [searchCode, setSearchCode] = useState("");

  const handleAction = async (id: string, action: "APPROVED" | "PAID" | "REJECTED", reason?: string) => {
    setIsProcessing(`${id}-${action}`);
    // Simulate latency
    await new Promise((resolve) => setTimeout(resolve, 800));
    onAction(id, action, reason);
    setIsProcessing(null);
    setShowRejectDialog(false);
    setRejectReason("");
    setSelectedRequest(null);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success(t("pages.counterStaff.redemptions.copiedSuccess", { code: text }));
  };

  // Filter queue by search code (if entered)
  const activeRequests = requests.filter((r) => {
    const matchesSearch = searchCode.trim() === "" || r.redemptionCode.toLowerCase().includes(searchCode.toLowerCase());
    return (r.status === "PENDING" || r.status === "APPROVED") && matchesSearch;
  });

  const completedRequests = requests.filter((r) => {
    const matchesSearch = searchCode.trim() === "" || r.redemptionCode.toLowerCase().includes(searchCode.toLowerCase());
    return (r.status === "PAID" || r.status === "REJECTED") && matchesSearch;
  });

  return (
    <section className="space-y-6">
      {/* Search redemption code for counter staff */}
      <div className="rounded-2xl border dark:border-white/10 border-border dark:bg-[#15151E]/95 bg-card p-5 shadow-[0_12px_40px_rgba(0,0,0,0.5)]">
        <label htmlFor="search-code-input" className="block text-xs font-black uppercase tracking-[0.2em] text-primary">
          {t("pages.counterStaff.redemptions.searchLabel")}
        </label>
        <div className="mt-2 flex gap-3">
          <input
            id="search-code-input"
            type="text"
            placeholder={t("pages.counterStaff.redemptions.searchPlaceholder")}
            value={searchCode}
            onChange={(e) => setSearchCode(e.target.value)}
            className="h-12 flex-1 rounded-xl border dark:border-white/10 border-border dark:bg-black/45 bg-muted/20 px-4 font-mono font-black dark:text-white text-foreground placeholder:dark:text-white/20 text-muted-foreground outline-none focus:border-primary"
          />
          {searchCode && (
            <Button
              variant="outline"
              onClick={() => setSearchCode("")}
              className="h-12 rounded-xl dark:border-white/10 border-border dark:text-white text-foreground"
            >
              Xóa lọc
            </Button>
          )}
        </div>
      </div>

      {/* Pending Queue Card */}
      <div className="rounded-2xl border dark:border-white/10 border-border dark:bg-[#15151E]/95 bg-card p-4 sm:p-6 shadow-[0_12px_40px_rgba(0,0,0,0.5)]">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.24em] text-primary">
              {t("pages.counterStaff.redemptions.pendingListEyebrow")}
            </p>
            <h2 className="mt-1 text-2xl font-black uppercase dark:text-white text-foreground">
              {t("pages.counterStaff.redemptions.pendingListTitle")}
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {t("pages.counterStaff.redemptions.pendingListDesc")}
            </p>
          </div>
        </div>

        <div className="mt-6 overflow-x-auto rounded-xl border dark:border-white/10 border-border">
          {activeRequests.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center">
              <CheckCircle2 className="size-12 text-emerald-500 animate-bounce" />
              <p className="mt-4 text-sm font-black uppercase tracking-wider dark:text-white text-foreground">
                {t("pages.counterStaff.redemptions.queueEmptyTitle")}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {t("pages.counterStaff.redemptions.queueEmptyDesc")}
              </p>
            </div>
          ) : (
            <table className="min-w-[800px] w-full text-left text-sm">
              <thead className="dark:bg-white/[0.04] bg-muted/50 text-xs font-black uppercase tracking-[0.15em] text-muted-foreground">
                <tr>
                  <th className="px-4 py-3.5">{t("pages.counterStaff.redemptions.colUser")}</th>
                  <th className="px-4 py-3.5">{t("pages.counterStaff.redemptions.colCode")}</th>
                  <th className="px-4 py-3.5 text-right">{t("pages.counterStaff.redemptions.colPoints")}</th>
                  <th className="px-4 py-3.5">{t("pages.counterStaff.redemptions.colStatus")}</th>
                  <th className="px-4 py-3.5 text-right">{t("pages.counterStaff.redemptions.colActions")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10 dark:bg-black/10 bg-muted/20">
                {activeRequests.map((req) => (
                  <tr key={req.id} className="transition hover:dark:bg-white/[0.02] bg-muted/50">
                    {/* User */}
                    <td className="px-4 py-4.5">
                      <p className="font-black uppercase tracking-wider dark:text-white text-foreground">
                        {req.userFullName}
                      </p>
                      <p className="text-[10px] text-primary font-black uppercase mt-0.5 tracking-widest">
                        {req.userRole === "Owner" ? t("pages.counterStaff.redemptions.roleOwner") : req.userRole === "Jockey" ? t("pages.counterStaff.redemptions.roleJockey") : t("pages.counterStaff.redemptions.roleSpectator")}
                      </p>
                    </td>

                    {/* Redemption Code */}
                    <td className="px-4 py-4.5">
                      <div className="flex items-center gap-2">
                        <span className="rounded-lg bg-primary/10 border border-primary/20 px-3 py-1 font-mono font-black text-sm text-primary tracking-wider">
                          {req.redemptionCode}
                        </span>
                        <button
                          onClick={() => copyToClipboard(req.redemptionCode)}
                          className="dark:text-white/40 text-muted-foreground hover:dark:text-white text-foreground p-1 rounded hover:dark:bg-white/5 bg-muted/50 cursor-pointer"
                          title={t("pages.counterStaff.redemptions.btnApprove")}
                        >
                          <Copy className="size-3.5" />
                        </button>
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-1 font-mono">
                        {t("pages.counterStaff.redemptions.createdAt", { time: new Date(req.createdAt).toLocaleString('vi-VN') })}
                      </p>
                    </td>

                    {/* Points */}
                    <td className="px-4 py-4.5 text-right font-mono font-black dark:text-white text-foreground text-base">
                      {req.points.toLocaleString('vi-VN')}
                    </td>

                    {/* Status */}
                    <td className="px-4 py-4.5">
                      <StatusBadge
                        label={req.status === "APPROVED" ? t("pages.counterStaff.redemptions.statusApproved") : t("pages.counterStaff.redemptions.statusPending")}
                        tone={req.status === "APPROVED" ? "green" : "slate"}
                      />
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-4.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {req.status === "PENDING" && (
                          <>
                            <Button
                              onClick={() => handleAction(req.id, "APPROVED")}
                              disabled={isProcessing !== null}
                              size="sm"
                              className="h-9 rounded-full bg-emerald-500 hover:bg-emerald-600 font-bold text-xs"
                            >
                              Phê duyệt mã
                            </Button>
                            <Button
                              onClick={() => {
                                setSelectedRequest(req);
                                setShowRejectDialog(true);
                              }}
                              disabled={isProcessing !== null}
                              variant="destructive"
                              size="sm"
                              className="h-9 rounded-full font-bold text-xs"
                            >
                              Từ chối
                            </Button>
                          </>
                        )}
                        {req.status === "APPROVED" && (
                          <>
                            <Button
                              onClick={() => handleAction(req.id, "PAID")}
                              disabled={isProcessing !== null}
                              size="sm"
                              className="h-9 rounded-full bg-primary hover:bg-[#B80500] font-black uppercase text-xs shadow-[0_4px_12px_rgba(225,6,0,0.25)]"
                            >
                              <Gift className="mr-1.5 size-3.5" /> Xác nhận trao quà
                            </Button>
                            <Button
                              onClick={() => {
                                setSelectedRequest(req);
                                setShowRejectDialog(true);
                              }}
                              disabled={isProcessing !== null}
                              variant="outline"
                              size="sm"
                              className="h-9 rounded-full font-bold text-xs dark:border-white/10 border-border dark:text-white text-foreground hover:dark:bg-white/5 bg-muted/50"
                            >
                              Hủy bỏ duyệt
                            </Button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Processed History Card */}
      <div className="rounded-2xl border dark:border-white/10 border-border dark:bg-[#15151E]/95 bg-card p-4 sm:p-6 shadow-[0_12px_40px_rgba(0,0,0,0.5)]">
        <div>
          <h3 className="text-lg font-black uppercase dark:text-white text-foreground">
            {t("pages.counterStaff.redemptions.historyTitle")}
          </h3>
          <p className="text-xs text-muted-foreground">
            {t("pages.counterStaff.redemptions.historyDesc")}
          </p>
        </div>

        <div className="mt-5 overflow-x-auto rounded-xl border dark:border-white/10 border-border">
          {completedRequests.length === 0 ? (
            <div className="p-8 text-center text-xs text-muted-foreground">
              {t("pages.counterStaff.redemptions.historyEmpty")}
            </div>
          ) : (
            <table className="min-w-[800px] w-full text-left text-sm">
              <thead className="dark:bg-white/[0.02] bg-muted/50 text-xs font-black uppercase tracking-[0.15em] text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">{t("pages.counterStaff.redemptions.histColUser")}</th>
                  <th className="px-4 py-3">{t("pages.counterStaff.redemptions.histColCode")}</th>
                  <th className="px-4 py-3 text-right">{t("pages.counterStaff.redemptions.histColPoints")}</th>
                  <th className="px-4 py-3">{t("pages.counterStaff.redemptions.histColTime")}</th>
                  <th className="px-4 py-3">{t("pages.counterStaff.redemptions.histColStatus")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10 dark:bg-black/5 bg-muted/20">
                {completedRequests.map((req) => (
                  <tr key={req.id} className="opacity-70 transition hover:opacity-100 hover:dark:bg-white/[0.02] bg-muted/50">
                    <td className="px-4 py-3.5">
                      <p className="font-bold dark:text-white text-foreground">{req.userFullName}</p>
                      <p className="text-[10px] text-muted-foreground font-mono mt-0.5">
                        {req.userRole === "Owner" ? "Chủ Ngựa" : req.userRole === "Jockey" ? "Nài Ngựa" : "Khán Giả"}
                      </p>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="font-mono text-xs dark:text-white/90 text-muted-foreground font-bold dark:bg-white/5 bg-muted/50 border dark:border-white/10 border-border px-2 py-0.5 rounded">
                        {req.redemptionCode}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right font-mono font-black dark:text-white/90 text-muted-foreground">
                      {req.points.toLocaleString('vi-VN')}
                    </td>
                    <td className="px-4 py-3.5 text-xs dark:text-white/60 text-muted-foreground font-mono">
                      {new Date(req.createdAt).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="space-y-1">
                        <StatusBadge
                          label={req.status === "PAID" ? t("pages.counterStaff.redemptions.histStatusPaid") : t("pages.counterStaff.redemptions.histStatusRejected")}
                          tone={req.status === "PAID" ? "teal" : "red"}
                        />
                        {req.rejectReason && (
                          <p className="text-[10px] text-primary max-w-xs leading-4">
                            {t("pages.counterStaff.redemptions.histRejectReason", { reason: req.rejectReason })}
                          </p>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Reject Reason Dialog */}
      {showRejectDialog && selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center dark:bg-black/75 bg-muted/20 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border dark:border-white/10 border-border bg-[#1C1C25] p-6 shadow-[0_24px_64px_rgba(0,0,0,0.8)]">
            <h3 className="text-xl font-black uppercase dark:text-white text-foreground flex items-center gap-2">
              <AlertCircle className="size-5 text-primary" /> {t("pages.counterStaff.redemptions.dialogRejectTitle")}
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              <Trans i18nKey="pages.counterStaff.redemptions.dialogRejectDesc" values={{ code: selectedRequest.redemptionCode, name: selectedRequest.userFullName, points: selectedRequest.points }} components={{ 1: <strong className="dark:text-white text-foreground" />, 2: <strong className="dark:text-white text-foreground" /> }} />
            </p>
            <div className="mt-4 space-y-2">
              <label htmlFor="reason" className="block text-xs font-black uppercase tracking-wider text-muted-foreground">
                {t("pages.counterStaff.redemptions.dialogRejectReasonLabel")}
              </label>
              <textarea
                id="reason"
                required
                rows={3}
                placeholder={t("pages.counterStaff.redemptions.dialogRejectReasonPlaceholder")}
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="w-full rounded-xl border dark:border-white/10 border-border dark:bg-black/35 bg-muted/20 p-3 text-sm dark:text-white text-foreground outline-none focus:border-primary"
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
                className="h-11 rounded-full dark:border-white/10 border-border dark:text-white text-foreground"
              >
                Hủy bỏ
              </Button>
              <Button
                disabled={!rejectReason.trim()}
                onClick={() => handleAction(selectedRequest.id, "REJECTED", rejectReason)}
                variant="destructive"
                className="h-11 rounded-full font-black uppercase tracking-wide px-5"
              >
                Từ Chối Giao Dịch
              </Button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
