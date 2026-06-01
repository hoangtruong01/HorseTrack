"use client";

import { useState } from "react";

import { PageHeader } from "@/components/layout/page-header";
import { WalletBalance } from "@/features/wallet/components/wallet-balance";
import { TransactionHistory } from "@/features/wallet/components/transaction-history";
import { CashoutRequestForm } from "@/features/wallet/components/cashout-request-form";
import {
  mockWalletBalances,
  mockTransactions,
  addCashoutRequest,
} from "@/features/wallet/mock-wallet";

export default function JockeyWalletPage() {
  const userId = "user-jockey-1";
  const userFullName = "Nguyễn Văn Hải";
  const [balance, setBalance] = useState(mockWalletBalances[userId] || 0);
  const [transactions, setTransactions] = useState([...mockTransactions]);
  const [showCashoutForm, setShowCashoutForm] = useState(false);

  const handleCashoutSubmit = (points: number, bankAccount: string, bankName: string) => {
    addCashoutRequest(userId, userFullName, "Jockey", points, bankAccount, bankName);
    // Refresh states
    setBalance(mockWalletBalances[userId]);
    setTransactions([...mockTransactions]);
    setShowCashoutForm(false);
  };

  return (
    <main className="space-y-6 max-w-5xl mx-auto">
      <PageHeader
        eyebrow="My Wallet"
        title="Jockey Rewards"
        description="View points earned through winning jockey assignments (30% split) and process withdrawals."
      />

      <div className="grid gap-6 lg:grid-cols-12 items-start">
        <div className="lg:col-span-5 space-y-6">
          <WalletBalance
            points={balance}
            role="Jockey"
            onRefresh={() => setBalance(mockWalletBalances[userId])}
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
    </main>
  );
}
