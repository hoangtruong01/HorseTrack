"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";

import { CashoutApprovalQueue } from "@/features/wallet/components/cashout-approval-queue";
import {
  mockCashoutRequests,
  updateCashoutStatus,
} from "@/features/wallet/mock-wallet";

export default function AdminCashoutsPage() {
  const { t } = useTranslation();
  const [requests, setRequests] = useState([...mockCashoutRequests]);
  const adminEmail = "admin@horsetrack.com";

  const handleAction = (id: string, action: "APPROVED" | "PAID" | "REJECTED", reason?: string) => {
    updateCashoutStatus(id, action, adminEmail, reason);
    setRequests([...mockCashoutRequests]);
  };

  return (
    <main className="space-y-6 max-w-6xl mx-auto">
      <CashoutApprovalQueue requests={requests} onAction={handleAction} />
    </main>
  );
}
