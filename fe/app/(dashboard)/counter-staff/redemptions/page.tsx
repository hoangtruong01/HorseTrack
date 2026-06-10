"use client";

import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

import { PageHeader } from "@/components/layout/page-header";
import { CashoutApprovalQueue } from "@/features/wallet/components/cashout-approval-queue";
import { mapCashoutToQueueRequest, type CashoutQueueRequest } from "@/features/wallet/backend-wallet";
import { walletApi, type CashoutItem } from "@/lib/api-client";

export default function RedemptionsQueuePage() {
  const { t } = useTranslation();
  const [cashouts, setCashouts] = useState<CashoutItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Pagination states
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Lookup states
  const [lookupResult, setLookupResult] = useState<CashoutQueueRequest | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  const fetchCashouts = useCallback(async (currentPage: number) => {
    setLoading(true);
    try {
      const res = await walletApi.allCashouts({ page: currentPage, limit: 10 });
      if (res && res.data) {
        setCashouts(res.data);
        setPage(res.meta?.page ?? currentPage);
        setTotalPages(res.meta?.totalPages ?? 1);
        setTotal(res.meta?.total ?? res.data.length);
      }
    } catch (err: any) {
      toast.error(err.message || t("wallet.errors.fetchFailed"));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    void fetchCashouts(1);
  }, [fetchCashouts]);

  const handleLookup = async (code: string) => {
    setIsSearching(true);
    setSearchError(null);
    try {
      const res = await walletApi.lookupCashout(code);
      if (res) {
        setLookupResult(mapCashoutToQueueRequest(res));
      } else {
        setLookupResult(null);
        setSearchError("Mã đổi thưởng không tồn tại.");
      }
    } catch (err: any) {
      setLookupResult(null);
      setSearchError(err.message || "Không tìm thấy mã đổi thưởng.");
    } finally {
      setIsSearching(false);
    }
  };

  const handleClearLookup = () => {
    setLookupResult(null);
    setSearchError(null);
  };

  const handleAction = async (id: string, action: "APPROVED" | "PAID" | "REJECTED", reason?: string) => {
    try {
      await walletApi.processCashout(id, action);
      toast.success(
        t("wallet.redemption.showing")
          ? `Cập nhật giao dịch thành công sang trạng thái ${action}`
          : `Successfully updated transaction to ${action}`
      );
      
      // Refresh history list
      await fetchCashouts(page);

      // Refresh lookup result if active
      if (lookupResult && lookupResult.id === id) {
        try {
          const res = await walletApi.lookupCashout(lookupResult.redemptionCode);
          if (res) {
            setLookupResult(mapCashoutToQueueRequest(res));
          }
        } catch {
          setLookupResult(null);
        }
      }
    } catch (err: any) {
      toast.error(err.message || `Lỗi khi cập nhật giao dịch sang ${action}`);
      await fetchCashouts(page);
    }
  };

  const mappedHistory = cashouts.map(mapCashoutToQueueRequest);

  return (
    <main className="space-y-6">
      <PageHeader
        eyebrow="Redemption"
        title={t("counterStaff.actions.redemption.title")}
        description={t("counterStaff.actions.redemption.desc")}
      />

      {loading && cashouts.length === 0 ? (
        <div className="flex items-center justify-center py-20 text-muted-foreground text-sm font-semibold">
          {t("counterStaff.recentRedemptions.loading")}
        </div>
      ) : (
        <CashoutApprovalQueue
          historyItems={mappedHistory}
          lookupResult={lookupResult}
          isSearching={isSearching}
          searchError={searchError}
          onLookup={handleLookup}
          onClearLookup={handleClearLookup}
          onAction={handleAction}
          pagination={{
            page,
            totalPages,
            total,
            onPageChange: (newPage) => void fetchCashouts(newPage),
          }}
        />
      )}
    </main>
  );
}
