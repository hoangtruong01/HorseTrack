"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/layout/page-header";
import { WalletBalance } from "@/features/wallet/components/wallet-balance";
import { TransactionHistory } from "@/features/wallet/components/transaction-history";
import { CashoutRequestForm } from "@/features/wallet/components/cashout-request-form";
import { mapWalletTransactions, type WalletUiTransaction } from "@/features/wallet/backend-wallet";
import { walletApi } from "@/lib/api-client";

export default function SpectatorWalletPage() {
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState<WalletUiTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCashoutForm, setShowCashoutForm] = useState(false);

  const fetchWalletData = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await walletApi.myHistory({ page: 1, limit: 100 });
      setBalance(res.points ?? 0);
      setTransactions(mapWalletTransactions(res.data || []));
    } catch (err: any) {
      toast.error(err.message || "Khong the tai thong tin vi diem thuong");
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
      toast.success(`Yeu cau quy doi ${points.toLocaleString("vi-VN")} diem thanh cong.`);
      setShowCashoutForm(false);
      await fetchWalletData();
    } catch (err: any) {
      toast.error(err.message || "Yeu cau quy doi that bai. Vui long thu lai.");
    }
  };

  return (
    <main className="space-y-6 max-w-5xl mx-auto px-4 sm:px-6">
      <PageHeader
        eyebrow="My Wallet"
        title="Spectator Points"
        description="Theo doi diem thuong tich luy tu du doan va tao ma quy doi tai quay vat ly."
      />

      {isLoading && transactions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
          <Loader2 className="size-8 animate-spin text-[#E10600]" />
          <p className="mt-4 text-xs font-mono uppercase tracking-widest">Dang tai thong tin tai chinh...</p>
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
