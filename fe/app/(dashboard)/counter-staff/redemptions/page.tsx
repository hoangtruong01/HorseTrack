"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/layout/page-header";
import { CashoutApprovalQueue } from "@/features/wallet/components/cashout-approval-queue";
import { walletApi, type CashoutItem } from "@/lib/api-client";
import type { CashoutRequest } from "@/features/wallet/mock-wallet";

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

  // Map CashoutItem to CashoutRequest format required by the component
  const mappedRequests: CashoutRequest[] = cashouts.map((c) => {
    const userObj = typeof c.userId === "object" ? c.userId : null;
    const userFullName = userObj?.fullName ?? "Khách hàng";
    
    let userRole: "Owner" | "Jockey" | "Spectator" = "Spectator";
    if (userObj && Array.isArray((userObj as any).roles)) {
      const rolesList = (userObj as any).roles as string[];
      if (rolesList.includes("owner")) {
        userRole = "Owner";
      } else if (rolesList.includes("jockey")) {
        userRole = "Jockey";
      }
    }

    return {
      id: c._id,
      userId: typeof c.userId === "string" ? c.userId : (userObj?._id ?? ""),
      userFullName,
      userRole,
      points: c.pointsRedeemed,
      redemptionCode: c.redemptionCode,
      status: c.status as "PENDING" | "APPROVED" | "PAID" | "REJECTED",
      rejectReason: "",
      createdAt: c.createdAt ?? new Date().toISOString(),
    };
  });

  return (
    <main className="space-y-6">
      <PageHeader
        eyebrow="Redemption Queue"
        title="Duyệt Hàng Đợi Đổi Thưởng"
        description="Xử lý và hoàn tất các yêu cầu đổi điểm lấy quà tặng vật lý của người dùng khi họ đến quầy trực tiếp."
      />

      {loading ? (
        <div className="flex items-center justify-center py-20 text-muted-foreground text-sm font-semibold">
          Đang tải hàng đợi đổi thưởng từ hệ thống...
        </div>
      ) : (
        <CashoutApprovalQueue requests={mappedRequests} onAction={handleAction} />
      )}
    </main>
  );
}
