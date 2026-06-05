"use client";

import { useEffect, useState, useCallback } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/layout/page-header";
import { WalletBalance } from "@/features/wallet/components/wallet-balance";
import { TransactionHistory } from "@/features/wallet/components/transaction-history";
import { CashoutRequestForm } from "@/features/wallet/components/cashout-request-form";
import { walletApi } from "@/lib/api-client";

export default function SpectatorWalletPage() {
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCashoutForm, setShowCashoutForm] = useState(false);

  const fetchWalletData = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await walletApi.myHistory({ page: 1, limit: 100 });
      setBalance(res.points ?? 0);

      // Map backend WalletTransaction representation to mock-wallet transaction types
      const mappedTxs = (res.data || []).map((tx: any) => {
        let mappedType: string = "deposit";
        if (tx.type === "PREDICTION_REWARD") {
          mappedType = tx.points >= 0 ? "prediction_win" : "prediction_refund";
        } else if (tx.type === "REWARD_CASHOUT" || tx.type === "POINT_REDEMPTION") {
          if (tx.status === "PENDING") mappedType = "withdrawal_requested";
          else if (tx.status === "SUCCESS") mappedType = "withdrawal_paid";
          else mappedType = "withdrawal_rejected";
        } else if (tx.type === "DEPOSIT") {
          mappedType = "deposit";
        }

        return {
          id: tx.id || tx._id,
          type: mappedType,
          amount: Math.abs(tx.points || tx.amount || 0),
          description: tx.description || "Giao dịch ví điểm thưởng",
          status: tx.status === "SUCCESS" ? "completed" : tx.status === "PENDING" ? "pending" : "failed",
          createdAt: tx.createdAt || new Date().toISOString(),
        };
      });

      setTransactions(mappedTxs);
    } catch (e: any) {
      console.error("Lỗi khi tải lịch sử ví:", e);
      toast.error("Không thể tải thông tin ví điểm thưởng");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchWalletData();
  }, [fetchWalletData]);

  const handleCashoutSubmit = async (points: number) => {
    try {
      await walletApi.requestCashout({ pointsToRedeem: points });
      toast.success(`Yêu cầu quy đổi ${points.toLocaleString("vi-VN")} điểm thành công! Hãy lưu mã quy đổi và mang tới quầy để nhận quà.`);
      setShowCashoutForm(false);
      void fetchWalletData();
    } catch (err: any) {
      toast.error(err.message || "Yêu cầu quy đổi thất bại. Vui lòng thử lại.");
    }
  };

  return (
    <main className="space-y-6 max-w-5xl mx-auto px-4 sm:px-6">
      <PageHeader
        eyebrow="My Wallet"
        title="Spectator Points"
        description="Theo dõi điểm thưởng tích lũy từ các lượt dự đoán miễn phí (Đúng +1 điểm, Sai -1 điểm) và tiến hành tạo mã quy đổi nhận quà tại quầy vật lý."
      />

      {isLoading && transactions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
          <Loader2 className="size-8 animate-spin text-[#E10600]" />
          <p className="mt-4 text-xs font-mono uppercase tracking-widest">Đang tải thông tin tài chính...</p>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-12 items-start">
          <div className="lg:col-span-5 space-y-6">
            <WalletBalance
              points={balance}
              role="Spectator"
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
            <TransactionHistory transactions={transactions} />
          </div>
        </div>
      )}
    </main>
  );
}
