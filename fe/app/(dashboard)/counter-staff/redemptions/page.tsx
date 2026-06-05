"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/layout/page-header";
import { CashoutApprovalQueue } from "@/features/wallet/components/cashout-approval-queue";
import { mapCashoutToQueueRequest } from "@/features/wallet/backend-wallet";
import { walletApi, type CashoutItem } from "@/lib/api-client";

export default function RedemptionsQueuePage() {
  const [cashouts, setCashouts] = useState<CashoutItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCashouts = async () => {
    setLoading(true);
    try {
      const res = await walletApi.allCashouts({ page: 1, limit: 100 });
      if (res && res.data) {
        setCashouts(res.data);
      }
    } catch (err: any) {
      toast.error(err.message || "Lỗi khi lấy danh sách đổi thưởng.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCashouts();
  }, []);

  const handleAction = async (id: string, action: "APPROVED" | "PAID" | "REJECTED", reason?: string) => {
    try {
      await walletApi.processCashout(id, action);
      toast.success(`Cập nhật giao dịch thành công sang trạng thái ${action}`);
      await fetchCashouts();
    } catch (err: any) {
      toast.error(err.message || `Lỗi khi cập nhật giao dịch sang ${action}`);
      // Reload to ensure state is in sync
      await fetchCashouts();
    }
  };

  const mappedRequests = cashouts.map(mapCashoutToQueueRequest);

  return (
    <main className="space-y-6">
      <PageHeader
        eyebrow="Redemption"
        title="Xác nhận đổi thưởng"
        description="Xử lý và hoàn tất các yêu cầu đổi điểm lấy quà tặng vật lý của người dùng khi họ đến quầy trực tiếp."
      />

      {loading ? (
        <div className="flex items-center justify-center py-20 text-muted-foreground text-sm font-semibold">
          Đang tải dữ liệu từ hệ thống...
        </div>
      ) : (
        <CashoutApprovalQueue requests={mappedRequests} onAction={handleAction} />
      )}
    </main>
  );
}
