"use client";

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { WalletBalance } from "@/features/wallet/components/wallet-balance";
import { TransactionHistory } from "@/features/wallet/components/transaction-history";
import { CashoutRequestForm } from "@/features/wallet/components/cashout-request-form";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function OwnerWalletPage() {
  const { t } = useTranslation();
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCashoutForm, setShowCashoutForm] = useState(false);

  const fetchWalletData = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/owner/wallet/history");
      if (response.ok) {
        const resData = await response.json();
        if (resData.success) {
          const { points, data } = resData.data;
          
          setBalance(points || 0);

          const mappedTxs = (data || []).map((tx: any) => {
            let mappedType: string = "deposit";
            if (tx.type === "PRIZE_EARNING") {
              mappedType = "prize_owner";
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
              description: tx.description || t("common.walletTransaction"),
              status: tx.status === "SUCCESS" ? "completed" : tx.status === "PENDING" ? "pending" : "failed",
              createdAt: tx.createdAt || new Date().toISOString(),
            };
          });

          setTransactions(mappedTxs);
        }
      } else {
        toast.error(t("pages.owner.wallet.toast.fetchFailed"));
      }
    } catch (err) {
      console.error("Lỗi lấy thông tin ví:", err);
      toast.error(t("pages.owner.wallet.toast.connectionFailed"));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWalletData();
  }, []);

  const handleCashoutSubmit = async (points: number) => {
    try {
      const response = await fetch("/api/owner/wallet/cashout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pointsToRedeem: points }),
      });

      const resData = await response.json();

      if (!response.ok) {
        throw new Error(resData.message || t("pages.owner.wallet.toast.cashoutFailed"));
      }

      toast.success(t("pages.owner.wallet.toast.cashoutSuccess", { points }));
      setShowCashoutForm(false);
      fetchWalletData();
    } catch (err: any) {
      toast.error(err.message || t("pages.owner.wallet.toast.cashoutError"));
    }
  };

  return (
    <main className="space-y-6 max-w-6xl mx-auto">

      {isLoading && transactions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 dark:text-white/55 text-muted-foreground">
          <Loader2 className="size-8 animate-spin text-[#E10600]" />
          <p className="mt-4 text-xs font-mono uppercase tracking-widest">{t("pages.owner.wallet.loading")}</p>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-12 items-start">
          <div className="lg:col-span-4 space-y-6">
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

          <div className="lg:col-span-8">
            <TransactionHistory transactions={transactions} />
          </div>
        </div>
      )}
    </main>
  );
}
