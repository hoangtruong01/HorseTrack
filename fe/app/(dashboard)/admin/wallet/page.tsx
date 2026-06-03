"use client";

import { useEffect, useState, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<"transactions" | "cashouts">("cashouts");
  const [transactions, setTransactions] = useState<WalletTxItem[]>([]);
  const [cashouts, setCashouts] = useState<CashoutItem[]>([]);
  const [txMeta, setTxMeta] = useState({ total: 0, page: 1, limit: 20, totalPages: 1 });
  const [cashoutMeta, setCashoutMeta] = useState({ total: 0, page: 1, limit: 20, totalPages: 1 });
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: "ok" | "err" } | null>(null);

  const showToast = (msg: string, type: "ok" | "err" = "ok") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchTransactions = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const res = await walletApi.allTransactions({ page, limit: 20 });
      setTransactions(res.data);
      setTxMeta(res.meta);
    } catch (e: unknown) {
      showToast(e instanceof Error ? e.message : t("pages.admin.common.loadError"), "err");
    }
    finally { setLoading(false); }
  }, [t]);

  const fetchCashouts = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const res = await walletApi.allCashouts({ page, limit: 20 });
      setCashouts(res.data);
      setCashoutMeta(res.meta);
    } catch (e: unknown) {
      showToast(e instanceof Error ? e.message : t("pages.admin.common.loadError"), "err");
    }
    finally { setLoading(false); }
  }, [t]);

  useEffect(() => {
    if (activeTab === "transactions") fetchTransactions(1);
    else fetchCashouts(1);
  }, [activeTab, fetchTransactions, fetchCashouts]);

  const handleCashoutProcess = async (id: string, status: string) => {
    setActionLoading(id);
    try {
      await walletApi.processCashout(id, status);
      showToast(t("pages.admin.wallet.toastStatus", { status }));
      await fetchCashouts(cashoutMeta.page);
    } catch (e: unknown) {
      showToast(e instanceof Error ? e.message : t("pages.admin.common.loadError"), "err");
    }
    finally { setActionLoading(null); }
  };

  const getUserName = (u: WalletTxItem["userId"] | CashoutItem["userId"]) => {
    if (!u) return t("pages.admin.common.dash");
    if (typeof u === "object" && "fullName" in u) return u.fullName;
    return String(u);
  };

  const pagination = (page: number, totalPages: number, onPrev: () => void, onNext: () => void) => (
    <div className="flex items-center justify-center gap-3">
      <button onClick={onPrev} disabled={page <= 1}
        className="flex items-center gap-1.5 rounded-xl border dark:border-white/10 border-border dark:bg-white/[0.03] bg-muted/50 px-4 py-2 text-sm dark:text-white text-foreground hover:dark:bg-white/[0.06] bg-muted/50 disabled:opacity-40 transition">
        <ChevronLeft className="size-4" /> {t("pages.admin.common.prev")}
      </button>
      <span className="text-sm text-muted-foreground">
        {t("pages.admin.common.pageOf", { page, total: totalPages })}
      </span>
      <button onClick={onNext} disabled={page >= totalPages}
        className="flex items-center gap-1.5 rounded-xl border dark:border-white/10 border-border dark:bg-white/[0.03] bg-muted/50 px-4 py-2 text-sm dark:text-white text-foreground hover:dark:bg-white/[0.06] bg-muted/50 disabled:opacity-40 transition">
        {t("pages.admin.common.next")} <ChevronRight className="size-4" />
      </button>
    </div>
  );

  return (
    <main className="space-y-6">

      {toast && (
        <div className={`fixed top-6 right-6 z-50 rounded-xl border px-5 py-3 text-sm font-semibold shadow-2xl ${toast.type === "ok" ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300" : "border-red-500/40 bg-red-500/10 text-red-300"}`}>
          {toast.msg}
        </div>
      )}

      <div className="flex rounded-xl border dark:border-white/10 border-border dark:bg-white/[0.03] bg-muted/50 p-1 w-fit">
        <button
          onClick={() => setActiveTab("cashouts")}
          className={`rounded-lg px-5 py-2 text-sm font-semibold transition ${activeTab === "cashouts" ? "bg-primary text-white" : "text-muted-foreground hover:text-foreground dark:hover:text-white"}`}
        >
          {t("pages.admin.wallet.tabCashouts", { count: cashoutMeta.total })}
        </button>
        <button
          onClick={() => setActiveTab("transactions")}
          className={`rounded-lg px-5 py-2 text-sm font-semibold transition ${activeTab === "transactions" ? "bg-primary text-white" : "text-muted-foreground hover:text-foreground dark:hover:text-white"}`}
        >
          {t("pages.admin.wallet.tabTransactions", { count: txMeta.total })}
        </button>
      </div>

      <div className="rounded-2xl border dark:border-white/10 border-border dark:bg-[#15151E]/85 bg-card overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16 text-muted-foreground text-sm">{t("pages.admin.common.loading")}</div>
        ) : activeTab === "cashouts" ? (
          cashouts.length === 0 ? (
            <div className="flex items-center justify-center py-16 text-muted-foreground text-sm">{t("pages.admin.wallet.emptyCashouts")}</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b dark:border-white/10 border-border">
                    <th className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-widest text-muted-foreground">{t("pages.admin.wallet.colUser")}</th>
                    <th className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-widest text-muted-foreground">{t("pages.admin.wallet.colCode")}</th>
                    <th className="px-5 py-3.5 text-center text-xs font-bold uppercase tracking-widest text-muted-foreground">{t("pages.admin.wallet.colPoints")}</th>
                    <th className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-widest text-muted-foreground">{t("pages.admin.common.status")}</th>
                    <th className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-widest text-muted-foreground">{t("pages.admin.wallet.colDate")}</th>
                    <th className="px-5 py-3.5 text-right text-xs font-bold uppercase tracking-widest text-muted-foreground">{t("pages.admin.wallet.colAction")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {cashouts.map((c) => (
                    <tr key={c._id} className="hover:dark:bg-white/[0.02] bg-muted/50 transition-colors">
                      <td className="px-5 py-4">
                        <p className="text-sm font-semibold dark:text-white text-foreground">{getUserName(c.userId)}</p>
                        {typeof c.userId === "object" && "email" in c.userId && <p className="text-xs text-muted-foreground">{c.userId.email}</p>}
                      </td>
                      <td className="px-5 py-4">
                        <code className="rounded dark:bg-white/5 bg-muted/50 px-2 py-1 text-xs font-mono text-primary border border-primary/20">{c.redemptionCode}</code>
                      </td>
                      <td className="px-5 py-4 text-center font-mono font-black text-primary">{c.pointsRedeemed.toLocaleString()}</td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-bold uppercase ${cashoutStatusColors[c.status] ?? "text-gray-400 bg-gray-400/10 border-gray-400/20"}`}>
                          {c.status}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-xs text-muted-foreground">
                        {c.createdAt ? new Date(c.createdAt).toLocaleDateString("vi-VN") : t("pages.admin.common.dash")}
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
                                {t("pages.admin.wallet.approve")}
                              </button>
                              <button
                                onClick={() => handleCashoutProcess(c._id, "REJECTED")}
                                disabled={actionLoading === c._id}
                                className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-xs font-semibold text-red-400 hover:bg-red-500/20 transition disabled:opacity-40"
                              >
                                {t("pages.admin.wallet.reject")}
                              </button>
                            </>
                          )}
                          {c.status === "APPROVED" && (
                            <button
                              onClick={() => handleCashoutProcess(c._id, "PAID")}
                              disabled={actionLoading === c._id}
                              className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-400 hover:bg-emerald-500/20 transition disabled:opacity-40"
                            >
                              {t("pages.admin.wallet.markPaid")}
                            </button>
                          )}
                          {(c.status === "PAID" || c.status === "REJECTED") && (
                            <span className="text-xs text-muted-foreground">{t("pages.admin.wallet.done")}</span>
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
            <div className="flex items-center justify-center py-16 text-muted-foreground text-sm">{t("pages.admin.wallet.emptyTransactions")}</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b dark:border-white/10 border-border">
                    <th className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-widest text-muted-foreground">{t("pages.admin.wallet.colUser")}</th>
                    <th className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-widest text-muted-foreground">{t("pages.admin.wallet.colType")}</th>
                    <th className="px-5 py-3.5 text-center text-xs font-bold uppercase tracking-widest text-muted-foreground">{t("pages.admin.wallet.colPoints")}</th>
                    <th className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-widest text-muted-foreground">{t("pages.admin.wallet.colDescription")}</th>
                    <th className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-widest text-muted-foreground">{t("pages.admin.wallet.colDate")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {transactions.map((tx) => (
                    <tr key={tx._id} className="hover:dark:bg-white/[0.02] bg-muted/50 transition-colors">
                      <td className="px-5 py-4 text-sm dark:text-white text-foreground">{getUserName(tx.userId)}</td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase ${txTypeColors[tx.type] ?? "text-gray-400 bg-gray-400/10 border-gray-400/20"}`}>
                          {tx.type}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-center font-mono font-semibold text-primary">{tx.points}</td>
                      <td className="px-5 py-4 text-xs text-muted-foreground max-w-xs truncate">{tx.description}</td>
                      <td className="px-5 py-4 text-xs text-muted-foreground">
                        {tx.createdAt ? new Date(tx.createdAt).toLocaleDateString("vi-VN") : t("pages.admin.common.dash")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        )}
      </div>

      {activeTab === "cashouts" && cashoutMeta.totalPages > 1 && pagination(
        cashoutMeta.page,
        cashoutMeta.totalPages,
        () => fetchCashouts(cashoutMeta.page - 1),
        () => fetchCashouts(cashoutMeta.page + 1),
      )}
      {activeTab === "transactions" && txMeta.totalPages > 1 && pagination(
        txMeta.page,
        txMeta.totalPages,
        () => fetchTransactions(txMeta.page - 1),
        () => fetchTransactions(txMeta.page + 1),
      )}
    </main>
  );
}
