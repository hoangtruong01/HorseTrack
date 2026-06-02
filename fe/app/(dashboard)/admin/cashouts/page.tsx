"use client";

import { useState } from "react";

import { PageHeader } from "@/components/layout/page-header";
import { CashoutApprovalQueue } from "@/features/wallet/components/cashout-approval-queue";
import {
  mockCashoutRequests,
  updateCashoutStatus,
} from "@/features/wallet/mock-wallet";

export default function AdminCashoutsPage() {
  const [requests, setRequests] = useState([...mockCashoutRequests]);
  const adminEmail = "admin@horsetrack.com";

  const handleAction = (id: string, action: "APPROVED" | "PAID" | "REJECTED", reason?: string) => {
    updateCashoutStatus(id, action, adminEmail, reason);
    setRequests([...mockCashoutRequests]);
  };

  return (
    <main className="space-y-6 max-w-6xl mx-auto">
      <PageHeader
        eyebrow="Đổi Thưởng Vật Lý"
        title="Quản Lý Quầy Đổi Thưởng"
        description="Xác nhận mã quy đổi thưởng của Khán giả, Chủ ngựa, Nài ngựa tại quầy giao dịch vật lý và đối soát điểm Ledger hệ thống."
      />
      <CashoutApprovalQueue requests={requests} onAction={handleAction} />
    </main>
  );
}
