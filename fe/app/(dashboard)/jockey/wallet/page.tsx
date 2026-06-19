"use client";
import Image from "next/image";

import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import { PageHeader } from "@/components/layout/page-header";
import {
  mapLedgerTransactions,
  type WalletUiTransaction,
} from "@/features/wallet/backend-wallet";
import { CashoutRequestForm } from "@/features/wallet/components/cashout-request-form";
import { TransactionHistory } from "@/features/wallet/components/transaction-history";
import { WalletBalance } from "@/features/wallet/components/wallet-balance";
import {
  dashboardApi,
  rewardPointLedgerApi,
  walletApi,
} from "@/lib/api-client";

export default function JockeyWalletPage() {
  const { t } = useTranslation();
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState<WalletUiTransaction[]>([]);
  const [stats, setStats] = useState<{
    totalPoints?: number;
    races?: { winRate?: number; participated?: number };
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showCashoutForm, setShowCashoutForm] = useState(false);

  const fetchWalletData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [historyRes, balanceRes, statsRes] = await Promise.all([
        rewardPointLedgerApi.myHistory({ page: 1, limit: 100 }),
        rewardPointLedgerApi.myBalance(),
        dashboardApi.getJockeyStats(),
      ]);
      setBalance(balanceRes.balance ?? 0);
      setTransactions(mapLedgerTransactions(historyRes.data || []));
      setStats(statsRes);
    } catch (err) {
      toast.error(
        (err as Error).message ||
          t(
            "wallet.errors.fetchFailed",
            "Không thể tải thông tin ví từ hệ thống.",
          ),
      );
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
      toast.success(
        t("wallet.cashoutForm.successMsg", {
          points: points.toLocaleString("vi-VN"),
        }),
      );
      setShowCashoutForm(false);
      await fetchWalletData();
    } catch (err) {
      toast.error(
        (err as Error).message ||
          t(
            "wallet.cashoutForm.errInvalid",
            "Đã xảy ra lỗi khi tạo yêu cầu rút điểm.",
          ),
      );
    }
  };

  return (
    <main className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6">
      <PageHeader
        eyebrow={t("jockey.ui.wallet", "Ví điểm thưởng")}
        title={t("jockey.ui.winningsTitle", "Quản lý thu nhập nài ngựa")}
        description={t(
          "jockey.ui.winningsDesc",
          "Theo dõi số dư điểm thưởng tích lũy từ kết quả giải đua và tạo mã đổi thưởng tại quầy.",
        )}
      />

      {isLoading && transactions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
          <Image
            src="/skeletonHorse.gif"
            alt="Đang tải..."
            width={80}
            height={80}
            unoptimized
            className="object-contain mx-auto"
          />
          <p className="mt-4 text-xs font-mono uppercase tracking-widest">
            {t(
              "counterStaff.recentRedemptions.loading",
              "Đang tải lịch sử tài chính...",
            )}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Hàng thẻ KPI nghiệp vụ thực tế */}
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
              <p className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">
                Điểm khả dụng
              </p>
              <p className="mt-1 font-mono text-xl font-black text-amber-500">
                {balance.toLocaleString("vi-VN")} PTS
              </p>
            </div>
            <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
              <p className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">
                Tổng thưởng nài ngựa
              </p>
              <p className="mt-1 font-mono text-xl font-black text-emerald-400">
                {(stats?.totalPoints ?? 0).toLocaleString("vi-VN")} PTS
              </p>
            </div>
            <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
              <p className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">
                Tỷ lệ thắng trận
              </p>
              <p className="mt-1 font-mono text-xl font-black text-amber-500">
                {stats?.races?.winRate ?? 0}%
              </p>
            </div>
            <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
              <p className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">
                Số trận đã tham gia
              </p>
              <p className="mt-1 font-mono text-xl font-black text-primary">
                {stats?.races?.participated ?? 0}
              </p>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-12 items-start">
            <div className="lg:col-span-4 space-y-6">
              <WalletBalance
                points={balance}
                role="Jockey"
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

            <div className="lg:col-span-8">
              <TransactionHistory transactions={transactions} role="jockey" />
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
