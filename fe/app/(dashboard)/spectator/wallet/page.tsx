"use client";

import { useState } from "react";

import { useTranslation } from "react-i18next";

import { WalletBalance } from "@/features/wallet/components/wallet-balance";
import { TransactionHistory } from "@/features/wallet/components/transaction-history";
import { CashoutRequestForm } from "@/features/wallet/components/cashout-request-form";
import {
  mockWalletBalances,
  mockTransactions,
  addCashoutRequest,
} from "@/features/wallet/mock-wallet";

export default function SpectatorWalletPage() {
  const userId = "user-spectator-1";
  const userFullName = "Khán giả Đẹp Trai";
  const [balance, setBalance] = useState(mockWalletBalances[userId] || 0);
  const [transactions, setTransactions] = useState([...mockTransactions]);
  const [showCashoutForm, setShowCashoutForm] = useState(false);

  const handleCashoutSubmit = (points: number) => {
    addCashoutRequest(userId, userFullName, "Spectator", points);
    setBalance(mockWalletBalances[userId]);
    setTransactions([...mockTransactions]);
    setShowCashoutForm(false);
  };

  return (
    <main className="space-y-6 max-w-6xl mx-auto">

      <div className="grid gap-6 lg:grid-cols-12 items-start">
        <div className="lg:col-span-4 space-y-6">
          <WalletBalance
            points={balance}
            role="Spectator"
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

        <div className="lg:col-span-8">
          <TransactionHistory transactions={transactions} />
        </div>
      </div>
    </main>
  );
}
