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
      // Clear search if successful
      if (action === "PAID" || action === "REJECTED") {
        setSearchCode("");
      }
    } finally {
      setIsProcessing(null);
      setShowRejectDialog(false);
      setRejectReason("");
      setSelectedRequest(null);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`Đã sao chép mã quy đổi: ${text}`);
  };

  // Find exact match or partial match if only one
  const searchResult = searchCode.trim() 
    ? requests.find((r) => r.redemptionCode.toLowerCase() === searchCode.trim().toLowerCase()) ||
      (requests.filter((r) => r.redemptionCode.toLowerCase().includes(searchCode.trim().toLowerCase())).length === 1
        ? requests.find((r) => r.redemptionCode.toLowerCase().includes(searchCode.trim().toLowerCase()))
        : null)
    : null;

  return (
    <section className="space-y-6">
      <div className="rounded-2xl border border-border bg-card p-5 shadow-lg sm:p-8">
        <label htmlFor="search-code-input" className="block text-sm font-black uppercase tracking-[0.2em] text-primary">
          Tra cứu mã nhận thưởng tại quầy
        </label>
        <p className="mt-1 mb-4 text-sm text-muted-foreground">
          Nhập mã quy đổi do người dùng cung cấp để kiểm tra thông tin và thực hiện phát quà.
        </p>
        <div className="flex gap-3">
          <input
            id="search-code-input"
            type="text"
            placeholder="Nhập mã quy đổi (vd: RWD-YHS9X3)..."
            value={searchCode}
            onChange={(e) => setSearchCode(e.target.value)}
            className="h-14 flex-1 rounded-xl border border-border bg-muted px-5 font-mono text-lg font-black text-foreground placeholder:text-muted-foreground outline-none focus:border-primary transition"
          />
          {searchCode && (
            <Button variant="outline" onClick={() => setSearchCode("")} className="h-14 rounded-xl px-6 font-bold border-border text-foreground hover:bg-muted">
              Xóa
            </Button>
          )}
        </div>

        {searchCode.trim() !== "" && (
          <div className="mt-8 animate-in fade-in slide-in-from-top-4 duration-300">
            {!searchResult ? (
              <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/20 p-12 text-center">
                <AlertCircle className="size-12 text-muted-foreground/50" />
                <p className="mt-4 text-sm font-black uppercase tracking-wider text-foreground">Không tìm thấy mã</p>
                <p className="mt-1 text-xs text-muted-foreground">Mã đổi quà không tồn tại hoặc bạn nhập chưa chính xác.</p>
              </div>
            ) : (
              <div className="rounded-xl border border-border bg-muted/10 overflow-hidden shadow-md">
                <div className="bg-muted/30 px-6 py-4 border-b border-border flex justify-between items-center">
                  <h3 className="font-black uppercase text-foreground flex items-center gap-2">
                    <Gift className="size-5 text-primary" /> Thông tin đổi thưởng
                  </h3>
                  <StatusBadge 
                    label={searchResult.status === "PAID" ? "Đã trao quà" : searchResult.status === "REJECTED" ? "Đã từ chối" : "Chờ xử lý"} 
                    tone={searchResult.status === "PAID" ? "teal" : searchResult.status === "REJECTED" ? "red" : "slate"} 
                  />
                </div>
                
                <div className="p-6 grid gap-6 sm:grid-cols-2">
                  <div className="space-y-4">
                    <div>
                      <p className="text-xs uppercase tracking-wider text-muted-foreground font-bold mb-1">Người đổi quà</p>
                      <p className="font-black text-lg text-foreground">{searchResult.userFullName}</p>
                      <p className="text-xs font-bold text-primary mt-0.5">{roleLabel(searchResult.userRole)}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wider text-muted-foreground font-bold mb-1">Mã quy đổi</p>
                      <div className="flex items-center gap-2">
                        <span className="rounded-lg border border-primary/20 bg-primary/10 px-3 py-1 font-mono text-base font-black tracking-wider text-primary">
                          {searchResult.redemptionCode}
                        </span>
                        <button
                          onClick={() => copyToClipboard(searchResult.redemptionCode)}
                          className="cursor-pointer rounded p-1 text-muted-foreground/60 hover:bg-muted/10 hover:text-foreground transition"
                          title="Sao chép mã"
                        >
                          <Copy className="size-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <p className="text-xs uppercase tracking-wider text-muted-foreground font-bold mb-1">Số điểm quy đổi</p>
                      <p className="font-mono text-3xl font-black text-foreground">{searchResult.points.toLocaleString("vi-VN")} <span className="text-sm text-muted-foreground font-bold">điểm</span></p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wider text-muted-foreground font-bold mb-1">Thời gian tạo</p>
                      <p className="font-mono text-sm text-foreground">{new Date(searchResult.createdAt).toLocaleString("vi-VN")}</p>
                    </div>
                  </div>
                </div>

                {searchResult.status === "PENDING" && (
                  <div className="bg-muted/20 px-6 py-4 border-t border-border flex justify-end gap-3">
                    <Button
                      onClick={() => {
                        setSelectedRequest(searchResult);
                        setShowRejectDialog(true);
                      }}
                      disabled={isProcessing !== null}
                      variant="outline"
                      className="h-11 rounded-full px-6 font-bold text-foreground border-border hover:bg-muted hover:text-red-500 transition-colors"
                    >
                      Từ chối
                    </Button>
                    <Button 
                      onClick={() => handleAction(searchResult.id, "PAID")} 
                      disabled={isProcessing !== null} 
                      className="h-11 rounded-full px-8 font-black uppercase shadow-[0_4px_12px_rgba(225,6,0,0.25)] hover:bg-[#B80500] transition-colors"
                    >
                      <Gift className="mr-2 size-4" /> Xác nhận trao quà
                    </Button>
                  </div>
                )}

                {searchResult.status === "REJECTED" && searchResult.rejectReason && (
                  <div className="bg-red-500/10 px-6 py-4 border-t border-red-500/20">
                    <p className="text-sm font-bold text-red-500">Lý do từ chối: {searchResult.rejectReason}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {showRejectDialog && selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <h3 className="flex items-center gap-2 text-xl font-black uppercase text-foreground">
              <AlertCircle className="size-5 text-primary" /> Từ chối yêu cầu đổi quà
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Bạn có chắc chắn muốn từ chối mã nhận quà <strong className="text-foreground">{selectedRequest.redemptionCode}</strong> của{" "}
              <strong className="text-foreground">{selectedRequest.userFullName}</strong> ({selectedRequest.points.toLocaleString("vi-VN")} điểm)?
            </p>
            <div className="mt-4 space-y-2">
              <label htmlFor="reason" className="block text-xs font-black uppercase tracking-wider text-muted-foreground">
                Lý do từ chối (bắt buộc)
              </label>
              <textarea
                id="reason"
                required
                rows={3}
                placeholder="Ví dụ: Mã không hợp lệ, thông tin tài khoản không trùng khớp..."
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
                Hủy bỏ
              </Button>
              <Button disabled={!rejectReason.trim()} onClick={() => handleAction(selectedRequest.id, "REJECTED", rejectReason)} variant="destructive" className="h-11 rounded-full px-6 font-black uppercase tracking-wide">
                Từ chối giao dịch
              </Button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
