"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import { PageHeader } from "@/components/layout/page-header";
import { CashoutApprovalQueue } from "@/features/wallet/components/cashout-approval-queue";
import { mapCashoutToQueueRequest, type CashoutQueueRequest } from "@/features/wallet/backend-wallet";
import { walletApi } from "@/lib/api-client";

export default function AdminCashoutsPage() {
  const [requests, setRequests] = useState<CashoutQueueRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCashouts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await walletApi.allCashouts({ page: 1, limit: 100 });
      setRequests((res.data || []).map(mapCashoutToQueueRequest));
    } catch (err: any) {
      toast.error(err.message || "Khong the tai hang doi doi thuong.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchCashouts();
  }, [fetchCashouts]);

  const handleAction = async (id: string, action: "APPROVED" | "PAID" | "REJECTED") => {
    try {
      await walletApi.processCashout(id, action);
      toast.success(`Da cap nhat giao dich sang ${action}`);
      await fetchCashouts();
    } catch (err: any) {
      toast.error(err.message || `Loi khi cap nhat giao dich sang ${action}`);
      await fetchCashouts();
    }
  };

  return (
    <main className="space-y-6 max-w-6xl mx-auto">
      <PageHeader
        eyebrow="Doi Thuong Vat Ly"
        title="Quan Ly Quay Doi Thuong"
        description="Xac nhan ma quy doi thuong tai quay va doi soat diem ledger he thong."
      />
      {loading ? (
        <div className="flex items-center justify-center py-20 text-muted-foreground text-sm font-semibold">
          Dang tai hang doi doi thuong tu Backend...
        </div>
      ) : (
        <CashoutApprovalQueue requests={requests} onAction={handleAction} />
      )}
    </main>
  );
}
