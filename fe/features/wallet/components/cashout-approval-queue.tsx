"use client";

import { AlertCircle, CheckCircle2, Copy, Gift, Ticket } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import type { CashoutRequest } from "../mock-wallet";

export type CashoutApprovalQueueProps = {
  requests: CashoutRequest[];
  onAction: (id: string, action: "APPROVED" | "PAID" | "REJECTED", reason?: string) => void;
};

export function CashoutApprovalQueue({ requests, onAction }: CashoutApprovalQueueProps) {
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
    toast.success(`Đã sao chép mã quy đổi: ${text}`);
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
      <div className="rounded-2xl border border-white/10 bg-[#15151E]/95 p-5 shadow-[0_12px_40px_rgba(0,0,0,0.5)]">
        <label htmlFor="search-code-input" className="block text-xs font-black uppercase tracking-[0.2em] text-primary">
          Tra cứu mã nhận thưởng tại quầy
        </label>
        <div className="mt-2 flex gap-3">
          <input
            id="search-code-input"
            type="text"
            placeholder="Nhập mã quy đổi (ví dụ: RWD-YHS9X3)..."
            value={searchCode}
            onChange={(e) => setSearchCode(e.target.value)}
            className="h-12 flex-1 rounded-xl border border-white/10 bg-black/45 px-4 font-mono font-black text-white placeholder:text-white/20 outline-none focus:border-primary"
          />
          {searchCode && (
            <Button
              variant="outline"
              onClick={() => setSearchCode("")}
              className="h-12 rounded-xl border-white/10 text-white"
            >
              Xóa lọc
            </Button>
          )}
        </div>
      </div>

      {/* Pending Queue Card */}
      <div className="rounded-2xl border border-white/10 bg-[#15151E]/95 p-4 sm:p-6 shadow-[0_12px_40px_rgba(0,0,0,0.5)]">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.24em] text-primary">
              Danh sách chờ xác nhận
            </p>
            <h2 className="mt-1 text-2xl font-black uppercase text-white">
              Hàng Đợi Đổi Thưởng Vật Lý
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Tra cứu mã nhận quà do Khán giả/Chủ ngựa/Nài ngựa cung cấp tại quầy, đối soát số dư điểm và tiến hành trao quà vật lý tương ứng.
            </p>
          </div>
        </div>

        <div className="mt-6 overflow-x-auto rounded-xl border border-white/10">
          {activeRequests.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center">
              <CheckCircle2 className="size-12 text-emerald-500 animate-bounce" />
              <p className="mt-4 text-sm font-black uppercase tracking-wider text-white">
                Hàng đợi trống!
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Không tìm thấy yêu cầu quy đổi quà nào đang chờ xử lý.
              </p>
            </div>
          ) : (
            <table className="min-w-[800px] w-full text-left text-sm">
              <thead className="bg-white/[0.04] text-xs font-black uppercase tracking-[0.15em] text-muted-foreground">
                <tr>
                  <th className="px-4 py-3.5">Người đổi quà</th>
                  <th className="px-4 py-3.5">Mã quy đổi</th>
                  <th className="px-4 py-3.5 text-right">Số điểm quy đổi</th>
                  <th className="px-4 py-3.5">Trạng thái</th>
                  <th className="px-4 py-3.5 text-right">Hành động quầy</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10 bg-black/10">
                {activeRequests.map((req) => (
                  <tr key={req.id} className="transition hover:bg-white/[0.02]">
                    {/* User */}
                    <td className="px-4 py-4.5">
                      <p className="font-black uppercase tracking-wider text-white">
                        {req.userFullName}
                      </p>
                      <p className="text-[10px] text-primary font-black uppercase mt-0.5 tracking-widest">
                        {req.userRole === "Owner" ? "Chủ Ngựa" : req.userRole === "Jockey" ? "Nài Ngựa" : "Khán Giả"}
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
                          className="text-white/40 hover:text-white p-1 rounded hover:bg-white/5 cursor-pointer"
                          title="Sao chép mã"
                        >
                          <Copy className="size-3.5" />
                        </button>
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-1 font-mono">
                        Tạo lúc: {new Date(req.createdAt).toLocaleString('vi-VN')}
                      </p>
                    </td>

                    {/* Points */}
                    <td className="px-4 py-4.5 text-right font-mono font-black text-white text-base">
                      {req.points.toLocaleString('vi-VN')}
                    </td>

                    {/* Status */}
                    <td className="px-4 py-4.5">
                      <StatusBadge
                        label={req.status === "APPROVED" ? "Đã Duyệt" : "Chờ tại quầy"}
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
                              className="h-9 rounded-full font-bold text-xs border-white/10 text-white hover:bg-white/5"
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
      <div className="rounded-2xl border border-white/10 bg-[#15151E]/95 p-4 sm:p-6 shadow-[0_12px_40px_rgba(0,0,0,0.5)]">
        <div>
          <h3 className="text-lg font-black uppercase text-white">
            Nhật Ký Đổi Thưởng Đã Xử Lý
          </h3>
          <p className="text-xs text-muted-foreground">
            Lịch sử giao dịch các mã đổi quà đã được trao thành công hoặc bị từ chối từ trước tới nay.
          </p>
        </div>

        <div className="mt-5 overflow-x-auto rounded-xl border border-white/10">
          {completedRequests.length === 0 ? (
            <div className="p-8 text-center text-xs text-muted-foreground">
              Không tìm thấy nhật ký quy đổi lịch sử nào.
            </div>
          ) : (
            <table className="min-w-[900px] w-full text-left text-sm">
              <thead className="bg-white/[0.02] text-xs font-black uppercase tracking-[0.15em] text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">Người dùng</th>
                  <th className="px-4 py-3">Mã quà tặng</th>
                  <th className="px-4 py-3 text-right">Điểm đổi</th>
                  <th className="px-4 py-3">Nhân viên duyệt</th>
                  <th className="px-4 py-3">Thời gian tạo</th>
                  <th className="px-4 py-3">Thời gian rút</th>
                  <th className="px-4 py-3">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10 bg-black/5">
                {completedRequests.map((req) => (
                  <tr key={req.id} className="opacity-70 transition hover:opacity-100 hover:bg-white/[0.02]">
                    <td className="px-4 py-3.5">
                      <p className="font-bold text-white">{req.userFullName}</p>
                      <p className="text-[10px] text-muted-foreground font-mono mt-0.5">
                        {req.userRole === "Owner" ? "Chủ Ngựa" : req.userRole === "Jockey" ? "Nài Ngựa" : "Khán Giả"}
                      </p>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="font-mono text-xs text-white/90 font-bold bg-white/5 border border-white/10 px-2 py-0.5 rounded">
                        {req.redemptionCode}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right font-mono font-black text-white/90">
                      {req.points.toLocaleString('vi-VN')}
                    </td>
                    <td className="px-4 py-3.5 text-xs text-white/70 font-mono">
                      {req.paidBy || "—"}
                    </td>
                    <td className="px-4 py-3.5 text-xs text-white/60 font-mono">
                      {new Date(req.createdAt).toLocaleString('vi-VN')}
                    </td>
                    <td className="px-4 py-3.5 text-xs text-white/60 font-mono">
                      {req.paidAt ? new Date(req.paidAt).toLocaleString('vi-VN') : "—"}
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="space-y-1">
                        <StatusBadge
                          label={req.status === "PAID" ? "Đã Trao Quà" : "Đã Từ Chối"}
                          tone={req.status === "PAID" ? "teal" : "red"}
                        />
                        {req.rejectReason && (
                          <p className="text-[10px] text-primary max-w-xs leading-4">
                            Lý do: {req.rejectReason}
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#1C1C25] p-6 shadow-[0_24px_64px_rgba(0,0,0,0.8)]">
            <h3 className="text-xl font-black uppercase text-white flex items-center gap-2">
              <AlertCircle className="size-5 text-primary" /> Từ chối yêu cầu đổi quà
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Bạn có chắc chắn muốn từ chối mã nhận quà <strong className="text-white">{selectedRequest.redemptionCode}</strong> của <strong className="text-white">{selectedRequest.userFullName}</strong> ({selectedRequest.points} điểm)?
            </p>
            <div className="mt-4 space-y-2">
              <label htmlFor="reason" className="block text-xs font-black uppercase tracking-wider text-muted-foreground">
                Lý do từ chối (Bắt buộc)
              </label>
              <textarea
                id="reason"
                required
                rows={3}
                placeholder="Ví dụ: Mã đã quá hạn sử dụng, thông tin tài khoản không trùng khớp..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-black/35 p-3 text-sm text-white outline-none focus:border-primary"
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
                className="h-11 rounded-full border-white/10 text-white"
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
