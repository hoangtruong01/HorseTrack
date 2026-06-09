"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

import { PageHeader } from "@/components/layout/page-header";
import { CashoutApprovalQueue } from "@/features/wallet/components/cashout-approval-queue";
import { mapCashoutToQueueRequest, type CashoutQueueRequest } from "@/features/wallet/backend-wallet";
import { walletApi } from "@/lib/api-client";

export default function AdminCashoutsPage() {
  const { t } = useTranslation();
  const [requests, setRequests] = useState<CashoutQueueRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCashouts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await walletApi.allCashouts({ page: 1, limit: 100 });
      setRequests((res.data || []).map(mapCashoutToQueueRequest));
    } catch (err: any) {
      toast.error(err.message || t("wallet.errors.fetchFailed", "Không thể tải thông tin ví từ hệ thống."));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    void fetchCashouts();
  }, [fetchCashouts]);

  const handleAction = async (id: string, action: "APPROVED" | "PAID" | "REJECTED") => {
    try {
      await walletApi.processCashout(id, action);
      toast.success(
        t("wallet.redemption.showing")
          ? `Cập nhật giao dịch thành công sang trạng thái ${action}`
          : `Successfully updated transaction to ${action}`
      );
      await fetchCashouts();
    } catch (err: any) {
      toast.error(err.message || `Lỗi khi cập nhật giao dịch sang ${action}`);
      await fetchCashouts();
    }
  };

  return (
    <main className="space-y-6 max-w-6xl mx-auto">
      <PageHeader
        eyebrow="Redemption"
        title={t("counterStaff.actions.redemption.title", "Quản Lý Quầy Đổi Thưởng")}
        description={t("counterStaff.actions.redemption.desc", "Xác nhận mã quy đổi thưởng tại quầy và đối soát điểm ledger hệ thống.")}
      />
      {loading ? (
        <div className="flex items-center justify-center py-20 text-muted-foreground text-sm font-semibold">
          {t("counterStaff.recentRedemptions.loading", "Đang tải hàng đợi đổi thưởng từ hệ thống...")}
        </div>
      ) : (
        <CashoutApprovalQueue
          historyItems={requests}
          lookupResult={null}
          isSearching={false}
          searchError={null}
          onLookup={() => {}}
          onClearLookup={() => {}}
          onAction={handleAction}
        />
      )}
    </main>
  );
}
