"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { WalletBalance } from "@/features/wallet/components/wallet-balance";
import { TransactionHistory } from "@/features/wallet/components/transaction-history";
import { CashoutRequestForm } from "@/features/wallet/components/cashout-request-form";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function RefereeWalletPage() {
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCashoutForm, setShowCashoutForm] = useState(false);

  const fetchWalletData = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/referee/wallet/history");
      if (response.ok) {
        const resData = await response.json();
        if (resData.success) {
          const { points, data } = resData.data;
          
          setBalance(points || 0);

          // Map database WalletTransaction representation to mock-wallet transaction types
          const mappedTxs = (data || []).map((tx: any) => {
            let mappedType: string = "deposit";
            if (tx.type === "REFEREE_SALARY" || tx.type === "PRIZE_EARNING") {
              mappedType = "prize_owner"; // displays with gold/earning icon
            } else if (tx.type === "REWARD_CASHOUT" || tx.type === "POINT_REDEMPTION") {
              if (tx.status === "PENDING") mappedType = "withdrawal_requested";
              else if (tx.status === "SUCCESS") mappedType = "withdrawal_paid";
              else mappedType = "withdrawal_rejected";
            } else if (tx.type === "DEPOSIT") {
              mappedType = "deposit";
            } else {
              mappedType = "deposit";
            }

            return {
              id: tx.id || tx._id,
              type: mappedType,
              amount: tx.points || tx.amount || 0,
              description: tx.description || "Giao dịch ví trọng tài",
              status: tx.status === "SUCCESS" ? "completed" : tx.status === "PENDING" ? "pending" : "failed",
              createdAt: tx.createdAt || new Date().toISOString(),
            };
          });

          setTransactions(mappedTxs);
        }
      } else {
        toast.error("Không thể tải thông tin ví từ Backend.");
      }
    } catch (err) {
      console.error("Lỗi lấy thông tin ví trọng tài:", err);
      toast.error("Kết nối ví thất bại.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWalletData();
  }, []);

  const handleCashoutSubmit = async (points: number) => {
    try {
      const response = await fetch("/api/referee/wallet/cashout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pointsToRedeem: points }),
      });

      const resData = await response.json();

      if (!response.ok) {
        throw new Error(resData.message || "Đổi lương thất bại.");
      }

      toast.success(`Yêu cầu đổi ${points} điểm đã được gửi! Hãy ra quầy nhận tiền mặt.`);
      setShowCashoutForm(false);
      fetchWalletData(); // Refresh balance and transaction log
    } catch (err: any) {
      toast.error(err.message || "Đã xảy ra lỗi khi tạo yêu cầu rút điểm.");
    }
  };

  return (
    <main className="space-y-6 max-w-5xl mx-auto px-4 sm:px-6">
      <PageHeader
        eyebrow="Ví điểm thưởng"
        title="Quản Lý Lương Trọng Tài"
        description="Theo dõi số dư điểm lương tích lũy từ việc điều hành và giám sát các vòng đua chính thức, và tạo phiếu yêu cầu quy đổi điểm tại quầy."
      />

      {isLoading && transactions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-white/55">
          <Loader2 className="size-8 animate-spin text-[#E10600]" />
          <p className="mt-4 text-xs font-mono uppercase tracking-widest">Đang tải lịch sử tài chính...</p>
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
            <TransactionHistory transactions={transactions} />
          </div>
        </div>
      )}
    </main>
  );
}
