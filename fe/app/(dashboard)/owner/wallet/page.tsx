"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

import { PageHeader } from "@/components/layout/page-header";
import { WalletBalance } from "@/features/wallet/components/wallet-balance";
import { TransactionHistory } from "@/features/wallet/components/transaction-history";
import { CashoutRequestForm } from "@/features/wallet/components/cashout-request-form";
import { mapLedgerTransactions, type WalletUiTransaction } from "@/features/wallet/backend-wallet";
import { walletApi, rewardPointLedgerApi, dashboardApi } from "@/lib/api-client";

export default function OwnerWalletPage() {
  const { t } = useTranslation();
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState<WalletUiTransaction[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showCashoutForm, setShowCashoutForm] = useState(false);

  const fetchWalletData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [historyRes, balanceRes, statsRes] = await Promise.all([
        rewardPointLedgerApi.myHistory({ page: 1, limit: 100 }),
        rewardPointLedgerApi.myBalance(),
        dashboardApi.getOwnerStats(),
      ]);
      setBalance(balanceRes.balance ?? 0);
      setTransactions(mapLedgerTransactions(historyRes.data || []));
      setStats(statsRes);
    } catch (err: any) {
      toast.error(err.message || t("wallet.errors.fetchFailed", "Không thể tải thông tin ví từ hệ thống."));
    } finally {
      setIsLoading(false);
    }
  }, [t]);

  useEffect(() => {
    void fetchWalletData();
  }, [fetchWalletData]);

  const handleCashoutSubmit = async (points: number) => {
    try {
      await walletApi.requestCashout({ pointsToRedeem: points });
      toast.success(t("wallet.cashoutForm.successMsg", { points: points.toLocaleString("vi-VN") }));
      setShowCashoutForm(false);
      await fetchWalletData();
    } catch (err: any) {
      toast.error(err.message || t("wallet.cashoutForm.errInvalid", "Đã xảy ra lỗi khi tạo yêu cầu rút điểm."));
    }
  };

  return (
    <main className="space-y-6 w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
      <PageHeader
        eyebrow={t("owner.hero.wallet")}
        title={t("owner.quickActions.wallet.title")}
        description={t("owner.quickActions.wallet.desc")}
      />

      {isLoading && transactions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-foreground/55">
          <Loader2 className="size-8 animate-spin text-[#E10600]" />
          <p className="mt-4 text-xs font-mono uppercase tracking-widest">{t("counterStaff.recentRedemptions.loading", "Đang tải lịch sử tài chính...")}</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Hàng thẻ KPI nghiệp vụ thực tế */}
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
              <p className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">Điểm khả dụng</p>
              <p className="mt-1 font-mono text-xl font-black text-amber-500">{balance.toLocaleString("vi-VN")} PTS</p>
            </div>
            <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
              <p className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">Tổng điểm đã đổi quà</p>
              <p className="mt-1 font-mono text-xl font-black text-emerald-400">
                {transactions.filter(tx => tx.type === "withdrawal_paid").reduce((acc, tx) => acc + tx.amount, 0).toLocaleString("vi-VN")} PTS
              </p>
            </div>
            <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
              <p className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">Điểm đang chờ duyệt đổi</p>
              <p className="mt-1 font-mono text-xl font-black text-amber-500">
                {transactions.filter(tx => tx.type === "withdrawal_requested" || tx.type === "withdrawal_approved").reduce((acc, tx) => acc + tx.amount, 0).toLocaleString("vi-VN")} PTS
              </p>
            </div>
            <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
              <p className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">Tổng thưởng thắng giải đua</p>
              <p className="mt-1 font-mono text-xl font-black text-primary">{(stats?.winnings?.total ?? 0).toLocaleString("vi-VN")} PTS</p>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-12 items-start">
            <div className="lg:col-span-4 xl:col-span-3 space-y-6">
              <WalletBalance
                points={balance}
                role="Owner"
                onRefresh={fetchWalletData}
                onRequestCashout={() => setShowCashoutForm(true)}
              />

              {showCashoutForm && (
                <div className="animate-in fade-in slide-in-from-bottom-5 duration-300">
                  <CashoutRequestForm
                    availablePoints={balance}
                    onSubmit={handleCashoutSubmit}
                    onCancel={() => setShowCashoutForm(false)}
                  />
                </div>
              )}
            </div>

            <div className="lg:col-span-8 xl:col-span-9">
              <TransactionHistory transactions={transactions} role="owner" />
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
