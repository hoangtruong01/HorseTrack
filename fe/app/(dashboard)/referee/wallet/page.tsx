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
import { walletApi, rewardPointLedgerApi } from "@/lib/api-client";

export default function RefereeWalletPage() {
  const { t } = useTranslation();
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState<WalletUiTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCashoutForm, setShowCashoutForm] = useState(false);

  const fetchWalletData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [historyRes, balanceRes] = await Promise.all([
        rewardPointLedgerApi.myHistory({ page: 1, limit: 100 }),
        rewardPointLedgerApi.myBalance(),
      ]);
      setBalance(balanceRes.balance ?? 0);
      setTransactions(mapLedgerTransactions(historyRes.data || []));
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
    <main className="space-y-6 max-w-5xl mx-auto px-4 sm:px-6">
      <PageHeader
        eyebrow={t("wallet.balance.title", "Ví điểm thưởng")}
        title={t("referee.wallet.title", "Quản lý lương trọng tài")}
        description={t("referee.wallet.description", "Theo dõi số dư điểm lương tích lũy từ việc điều hành cuộc đua và tạo mã đổi thưởng tại quầy.")}
      />

      {isLoading && transactions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-white/55">
          <Loader2 className="size-8 animate-spin text-[#E10600]" />
          <p className="mt-4 text-xs font-mono uppercase tracking-widest">{t("counterStaff.recentRedemptions.loading", "Đang tải lịch sử tài chính...")}</p>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-12 items-start">
          <div className="lg:col-span-5 space-y-6">
            <WalletBalance
              points={balance}
              role="Referee"
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

          <div className="lg:col-span-7">
            <TransactionHistory transactions={transactions} role="referee" />
          </div>
        </div>
      )}
    </main>
  );
}
