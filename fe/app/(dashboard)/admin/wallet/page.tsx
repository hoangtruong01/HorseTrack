"use client";

import { useEffect, useState, useCallback } from "react";
import { ChevronLeft, ChevronRight, Wallet } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/layout/page-header";
import { walletApi, type WalletTxItem, type CashoutItem } from "@/lib/api-client";

const txTypeColors: Record<string, string> = {
  DEPOSIT: "text-blue-400 bg-blue-400/10 border-blue-400/20",
  REWARD_CASHOUT: "text-orange-400 bg-orange-400/10 border-orange-400/20",
  RACE_WIN_REWARD: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
  BET_WIN: "text-purple-400 bg-purple-400/10 border-purple-400/20",
};
const cashoutStatusColors: Record<string, string> = {
  PENDING: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20",
  APPROVED: "text-blue-400 bg-blue-400/10 border-blue-400/20",
  PAID: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
  REJECTED: "text-red-400 bg-red-400/10 border-red-400/20",
};

export default function AdminWalletPage() {
  const [activeTab, setActiveTab] = useState<"transactions" | "cashouts">("cashouts");
  const [transactions, setTransactions] = useState<WalletTxItem[]>([]);
  const [cashouts, setCashouts] = useState<CashoutItem[]>([]);
  const [txMeta, setTxMeta] = useState({ total: 0, page: 1, limit: 20, totalPages: 1 });
  const [cashoutMeta, setCashoutMeta] = useState({ total: 0, page: 1, limit: 20, totalPages: 1 });
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchTransactions = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const res = await walletApi.allTransactions({ page, limit: 20 });
      setTransactions(res.data);
      setTxMeta(res.meta);
    } catch (e: any) { toast.error(e.message); }
    finally { setLoading(false); }
  }, []);

  const fetchCashouts = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const res = await walletApi.allCashouts({ page, limit: 20 });
      setCashouts(res.data);
      setCashoutMeta(res.meta);
    } catch (e: any) { toast.error(e.message); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    if (activeTab === "transactions") fetchTransactions(1);
    else fetchCashouts(1);
  }, [activeTab, fetchTransactions, fetchCashouts]);

  const handleCashoutProcess = async (id: string, status: string) => {
    setActionLoading(id);
    try {
      await walletApi.processCashout(id, status);
      toast.success(`Đã cập nhật → ${status}`);
      await fetchCashouts(cashoutMeta.page);
    } catch (e: any) { toast.error(e.message); }
    finally { setActionLoading(null); }
  };

  const getUserName = (u: WalletTxItem["userId"] | CashoutItem["userId"]) => {
    if (!u) return "—";
    if (typeof u === "object" && "fullName" in u) return u.fullName;
    return String(u);
  };

  const getHandlerName = (c: CashoutItem) => {
    if (c.paidBy && typeof c.paidBy === "object" && "fullName" in c.paidBy) {
      return c.paidBy.fullName;
    }
    if (c.approvedBy && typeof c.approvedBy === "object" && "fullName" in c.approvedBy) {
      return c.approvedBy.fullName;
    }
    if (typeof c.paidBy === "string") return c.paidBy;
    if (typeof c.approvedBy === "string") return c.approvedBy;
    return "—";
  };

  return (
    <main className="space-y-6">
      <PageHeader
        eyebrow="Wallet Transactions"
        title="Quản Lý Giao Dịch Điểm"
        description="Xem tất cả giao dịch wallet và duyệt yêu cầu cashout/quy đổi điểm của users."
      />

      {/* Tabs */}
      <div className="flex rounded-xl border border-border bg-muted p-1 w-fit">
        <button
          onClick={() => setActiveTab("cashouts")}
          className={`rounded-lg px-5 py-2 text-sm font-semibold transition ${activeTab === "cashouts" ? "bg-primary text-foreground" : "text-muted-foreground hover:text-foreground"}`}
        >
          🎫 Cashout Queue ({cashoutMeta.total})
        </button>
        <button
          onClick={() => setActiveTab("transactions")}
          className={`rounded-lg px-5 py-2 text-sm font-semibold transition ${activeTab === "transactions" ? "bg-primary text-foreground" : "text-muted-foreground hover:text-foreground"}`}
        >
          📋 Tất cả Giao Dịch ({txMeta.total})
        </button>
      </div>

      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16 text-muted-foreground text-sm">Đang tải...</div>
        ) : activeTab === "cashouts" ? (
          cashouts.length === 0 ? (
            <div className="flex items-center justify-center py-16 text-muted-foreground text-sm">Không có cashout requests.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1000px]">
                <thead>
                  <tr className="border-b border-border">
                    <th className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-widest text-muted-foreground">Người rút</th>
                    <th className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-widest text-muted-foreground">Mã rút</th>
                    <th className="px-5 py-3.5 text-center text-xs font-bold uppercase tracking-widest text-muted-foreground">Số điểm rút</th>
                    <th className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-widest text-muted-foreground">Nhân viên duyệt rút</th>
                    <th className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-widest text-muted-foreground">Thời gian tạo lệnh</th>
                    <th className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-widest text-muted-foreground">Thời gian rút</th>
                    <th className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-widest text-muted-foreground">Trạng thái</th>
                    <th className="px-5 py-3.5 text-right text-xs font-bold uppercase tracking-widest text-muted-foreground">Hành động</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {cashouts.map((c) => (
                    <tr key={c._id} className="hover:bg-muted transition-colors">
                      <td className="px-5 py-4">
                        <p className="text-sm font-semibold text-foreground">{getUserName(c.userId)}</p>
                        {typeof c.userId === "object" && "email" in c.userId && <p className="text-xs text-muted-foreground">{c.userId.email}</p>}
                      </td>
                      <td className="px-5 py-4">
                        <code className="rounded bg-muted px-2 py-1 text-xs font-mono text-primary border border-primary/20">{c.redemptionCode}</code>
                      </td>
                      <td className="px-5 py-4 text-center font-mono font-black text-primary">{c.pointsRedeemed.toLocaleString()}</td>
                      <td className="px-5 py-4 text-sm text-foreground/70">
                        {getHandlerName(c)}
                      </td>
                      <td className="px-5 py-4 text-xs text-muted-foreground">
                        {c.createdAt ? new Date(c.createdAt).toLocaleString("vi-VN") : "—"}
                      </td>
                      <td className="px-5 py-4 text-xs text-muted-foreground">
                        {c.paidAt ? new Date(c.paidAt).toLocaleString("vi-VN") : "—"}
                      </td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-bold uppercase ${cashoutStatusColors[c.status] ?? "text-gray-400 bg-gray-400/10 border-gray-400/20"}`}>
                          {c.status}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-2">
                          {c.status === "PENDING" && (
                            <>
                              <button
                                onClick={() => handleCashoutProcess(c._id, "APPROVED")}
                                disabled={actionLoading === c._id}
                                className="rounded-lg border border-blue-500/30 bg-blue-500/10 px-3 py-1.5 text-xs font-semibold text-blue-400 hover:bg-blue-500/20 transition disabled:opacity-40"
                              >
                                Duyệt
                              </button>
                              <button
                                onClick={() => handleCashoutProcess(c._id, "REJECTED")}
                                disabled={actionLoading === c._id}
                                className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-xs font-semibold text-red-400 hover:bg-red-500/20 transition disabled:opacity-40"
                              >
                                Từ chối
                              </button>
                            </>
                          )}
                          {c.status === "APPROVED" && (
                            <button
                              onClick={() => handleCashoutProcess(c._id, "PAID")}
                              disabled={actionLoading === c._id}
                              className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-400 hover:bg-emerald-500/20 transition disabled:opacity-40"
                            >
                              ✓ Đã chi tiền
                            </button>
                          )}
                          {(c.status === "PAID" || c.status === "REJECTED") && (
                            <span className="text-xs text-muted-foreground">Hoàn tất</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        ) : (
          transactions.length === 0 ? (
            <div className="flex items-center justify-center py-16 text-muted-foreground text-sm">Chưa có giao dịch nào.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-widest text-muted-foreground">User</th>
                    <th className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-widest text-muted-foreground">Loại</th>
                    <th className="px-5 py-3.5 text-center text-xs font-bold uppercase tracking-widest text-muted-foreground">Điểm</th>
                    <th className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-widest text-muted-foreground">Mô tả</th>
                    <th className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-widest text-muted-foreground">Ngày</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {transactions.map((t) => (
                    <tr key={t._id} className="hover:bg-muted transition-colors">
                      <td className="px-5 py-4 text-sm text-foreground">{getUserName(t.userId)}</td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase ${txTypeColors[t.type] ?? "text-gray-400 bg-gray-400/10 border-gray-400/20"}`}>
                          {t.type}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-center font-mono font-semibold text-primary">{t.points}</td>
                      <td className="px-5 py-4 text-xs text-muted-foreground max-w-xs truncate">{t.description}</td>
                      <td className="px-5 py-4 text-xs text-muted-foreground">
                        {t.createdAt ? new Date(t.createdAt).toLocaleDateString("vi-VN") : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        )}
      </div>

      {/* Pagination */}
      {activeTab === "cashouts" && cashoutMeta.totalPages > 1 && (
        <div className="flex items-center justify-center gap-3">
          <button onClick={() => fetchCashouts(cashoutMeta.page - 1)} disabled={cashoutMeta.page <= 1}
            className="flex items-center gap-1.5 rounded-xl border border-border bg-muted px-4 py-2 text-sm text-foreground hover:bg-white/[0.06] disabled:opacity-40 transition">
            <ChevronLeft className="size-4" /> Trước
          </button>
          <span className="text-sm text-muted-foreground">Trang {cashoutMeta.page} / {cashoutMeta.totalPages}</span>
          <button onClick={() => fetchCashouts(cashoutMeta.page + 1)} disabled={cashoutMeta.page >= cashoutMeta.totalPages}
            className="flex items-center gap-1.5 rounded-xl border border-border bg-muted px-4 py-2 text-sm text-foreground hover:bg-white/[0.06] disabled:opacity-40 transition">
            Sau <ChevronRight className="size-4" />
          </button>
        </div>
      )}
      {activeTab === "transactions" && txMeta.totalPages > 1 && (
        <div className="flex items-center justify-center gap-3">
          <button onClick={() => fetchTransactions(txMeta.page - 1)} disabled={txMeta.page <= 1}
            className="flex items-center gap-1.5 rounded-xl border border-border bg-muted px-4 py-2 text-sm text-foreground hover:bg-white/[0.06] disabled:opacity-40 transition">
            <ChevronLeft className="size-4" /> Trước
          </button>
          <span className="text-sm text-muted-foreground">Trang {txMeta.page} / {txMeta.totalPages}</span>
          <button onClick={() => fetchTransactions(txMeta.page + 1)} disabled={txMeta.page >= txMeta.totalPages}
            className="flex items-center gap-1.5 rounded-xl border border-border bg-muted px-4 py-2 text-sm text-foreground hover:bg-white/[0.06] disabled:opacity-40 transition">
            Sau <ChevronRight className="size-4" />
          </button>
        </div>
      )}
    </main>
  );
}


