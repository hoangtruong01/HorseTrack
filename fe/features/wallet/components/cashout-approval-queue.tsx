"use client";

import { AlertCircle, CheckCircle2, Copy, Gift } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import type { CashoutQueueRequest } from "../backend-wallet";

export type CashoutApprovalQueueProps = {
  requests: CashoutQueueRequest[];
  onAction: (id: string, action: "APPROVED" | "PAID" | "REJECTED", reason?: string) => void | Promise<void>;
};

const roleLabel = (role: string) => {
  if (role === "Owner") return "Chu Ngua";
  if (role === "Jockey") return "Nai Ngua";
  if (role === "Referee") return "Trong Tai";
  return "Khan Gia";
};

export function CashoutApprovalQueue({ requests, onAction }: CashoutApprovalQueueProps) {
  const [selectedRequest, setSelectedRequest] = useState<CashoutQueueRequest | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [isProcessing, setIsProcessing] = useState<string | null>(null);
  const [searchCode, setSearchCode] = useState("");

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
    toast.success(`Da sao chep ma quy doi: ${text}`);
  };

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
      <div className="rounded-2xl border border-border bg-card p-5 shadow-lg">
        <label htmlFor="search-code-input" className="block text-xs font-black uppercase tracking-[0.2em] text-primary">
          Tra cuu ma nhan thuong tai quay
        </label>
        <div className="mt-2 flex gap-3">
          <input
            id="search-code-input"
            type="text"
            placeholder="Nhap ma quy doi (vd: RWD-YHS9X3)..."
            value={searchCode}
            onChange={(e) => setSearchCode(e.target.value)}
            className="h-12 flex-1 rounded-xl border border-border bg-muted px-4 font-mono font-black text-foreground placeholder:text-muted-foreground outline-none focus:border-primary"
          />
          {searchCode && (
            <Button variant="outline" onClick={() => setSearchCode("")} className="h-12 rounded-xl border-border text-foreground">
              Xoa loc
            </Button>
          )}
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-4 shadow-lg sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.24em] text-primary">Danh sach cho xac nhan</p>
            <h2 className="mt-1 text-2xl font-black uppercase text-foreground">Hang doi doi thuong vat ly</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Tra cuu ma nhan qua tai quay, doi so du diem hien tai, phe duyet ma, roi xac nhan trao qua khi hoan tat.
            </p>
          </div>
        </div>

        <div className="mt-6 overflow-x-auto rounded-xl border border-border">
          {activeRequests.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center">
              <CheckCircle2 className="size-12 animate-bounce text-emerald-500" />
              <p className="mt-4 text-sm font-black uppercase tracking-wider text-foreground">Hang doi trong!</p>
              <p className="mt-1 text-xs text-muted-foreground">Khong tim thay yeu cau quy doi qua nao dang cho xu ly.</p>
            </div>
          ) : (
            <table className="min-w-[800px] w-full text-left text-sm">
              <thead className="bg-muted/[0.04] text-xs font-black uppercase tracking-[0.15em] text-muted-foreground">
                <tr>
                  <th className="px-4 py-3.5">Nguoi doi qua</th>
                  <th className="px-4 py-3.5">Ma quy doi</th>
                  <th className="px-4 py-3.5 text-right">So diem quy doi</th>
                  <th className="px-4 py-3.5">Trang thai</th>
                  <th className="px-4 py-3.5 text-right">Hanh dong quay</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border bg-card">
                {activeRequests.map((req) => (
                  <tr key={req.id} className="transition hover:bg-muted/[0.02]">
                    <td className="px-4 py-4.5">
                      <p className="font-black uppercase tracking-wider text-foreground">{req.userFullName}</p>
                      <p className="mt-0.5 text-[10px] font-black uppercase tracking-widest text-primary">{roleLabel(req.userRole)}</p>
                    </td>
                    <td className="px-4 py-4.5">
                      <div className="flex items-center gap-2">
                        <span className="rounded-lg border border-primary/20 bg-primary/10 px-3 py-1 font-mono text-sm font-black tracking-wider text-primary">
                          {req.redemptionCode}
                        </span>
                        <button
                          onClick={() => copyToClipboard(req.redemptionCode)}
                          className="cursor-pointer rounded p-1 text-muted-foreground/60 hover:bg-muted/5 hover:text-foreground"
                          title="Sao chep ma"
                        >
                          <Copy className="size-3.5" />
                        </button>
                      </div>
                      <p className="mt-1 font-mono text-[10px] text-muted-foreground">Tao luc: {new Date(req.createdAt).toLocaleString("vi-VN")}</p>
                    </td>
                    <td className="px-4 py-4.5 text-right font-mono text-base font-black text-foreground">{req.points.toLocaleString("vi-VN")}</td>
                    <td className="px-4 py-4.5">
                      <StatusBadge label={req.status === "APPROVED" ? "Da duyet" : "Cho tai quay"} tone={req.status === "APPROVED" ? "green" : "slate"} />
                    </td>
                    <td className="px-4 py-4.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {req.status === "PENDING" && (
                          <>
                            <Button onClick={() => handleAction(req.id, "PAID")} disabled={isProcessing !== null} size="sm" className="h-9 rounded-full bg-primary text-xs font-black uppercase shadow-[0_4px_12px_rgba(225,6,0,0.25)] hover:bg-[#B80500]">
                              <Gift className="mr-1.5 size-3.5" /> Xac nhan trao qua
                            </Button>
                            <Button
                              onClick={() => {
                                setSelectedRequest(req);
                                setShowRejectDialog(true);
                              }}
                              disabled={isProcessing !== null}
                              variant="destructive"
                              size="sm"
                              className="h-9 rounded-full text-xs font-bold"
                            >
                              Tu choi
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

      <div className="rounded-2xl border border-border bg-card p-4 shadow-lg sm:p-6">
        <div>
          <h3 className="text-lg font-black uppercase text-foreground">Nhat ky doi thuong da xu ly</h3>
          <p className="text-xs text-muted-foreground">Lich su cac ma doi qua da trao thanh cong hoac bi tu choi.</p>
        </div>

        <div className="mt-5 overflow-x-auto rounded-xl border border-border">
          {completedRequests.length === 0 ? (
            <div className="p-8 text-center text-xs text-muted-foreground">Khong tim thay lich su quy doi nao.</div>
          ) : (
            <table className="min-w-[900px] w-full text-left text-sm">
              <thead className="bg-muted/[0.02] text-xs font-black uppercase tracking-[0.15em] text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">Nguoi dung</th>
                  <th className="px-4 py-3">Ma qua tang</th>
                  <th className="px-4 py-3 text-right">Diem doi</th>
                  <th className="px-4 py-3">Nhan vien xu ly</th>
                  <th className="px-4 py-3">Thoi gian tao</th>
                  <th className="px-4 py-3">Thoi gian trao</th>
                  <th className="px-4 py-3">Trang thai</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border bg-muted/30">
                {completedRequests.map((req) => (
                  <tr key={req.id} className="opacity-70 transition hover:bg-muted/[0.02] hover:opacity-100">
                    <td className="px-4 py-3.5">
                      <p className="font-bold text-foreground">{req.userFullName}</p>
                      <p className="mt-0.5 font-mono text-[10px] text-muted-foreground">{roleLabel(req.userRole)}</p>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="rounded border border-border bg-muted/50 px-2 py-0.5 font-mono text-xs font-bold text-foreground">{req.redemptionCode}</span>
                    </td>
                    <td className="px-4 py-3.5 text-right font-mono font-black text-foreground">{req.points.toLocaleString("vi-VN")}</td>
                    <td className="px-4 py-3.5 font-mono text-xs text-muted-foreground">{req.paidBy || "-"}</td>
                    <td className="px-4 py-3.5 font-mono text-xs text-muted-foreground">{new Date(req.createdAt).toLocaleString("vi-VN")}</td>
                    <td className="px-4 py-3.5 font-mono text-xs text-muted-foreground">{req.paidAt ? new Date(req.paidAt).toLocaleString("vi-VN") : "-"}</td>
                    <td className="px-4 py-3.5">
                      <div className="space-y-1">
                        <StatusBadge label={req.status === "PAID" ? "Da trao qua" : "Da tu choi"} tone={req.status === "PAID" ? "teal" : "red"} />
                        {req.rejectReason && <p className="max-w-xs text-[10px] leading-4 text-primary">Ly do: {req.rejectReason}</p>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {showRejectDialog && selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl">
            <h3 className="flex items-center gap-2 text-xl font-black uppercase text-foreground">
              <AlertCircle className="size-5 text-primary" /> Tu choi yeu cau doi qua
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Ban co chac chan muon tu choi ma nhan qua <strong className="text-foreground">{selectedRequest.redemptionCode}</strong> cua{" "}
              <strong className="text-foreground">{selectedRequest.userFullName}</strong> ({selectedRequest.points.toLocaleString("vi-VN")} diem)?
            </p>
            <div className="mt-4 space-y-2">
              <label htmlFor="reason" className="block text-xs font-black uppercase tracking-wider text-muted-foreground">
                Ly do tu choi (bat buoc)
              </label>
              <textarea
                id="reason"
                required
                rows={3}
                placeholder="Vi du: Ma khong hop le, thong tin tai khoan khong trung khop..."
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
                className="h-11 rounded-full border-border text-foreground"
              >
                Huy bo
              </Button>
              <Button disabled={!rejectReason.trim()} onClick={() => handleAction(selectedRequest.id, "REJECTED", rejectReason)} variant="destructive" className="h-11 rounded-full px-5 font-black uppercase tracking-wide">
                Tu choi giao dich
              </Button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
