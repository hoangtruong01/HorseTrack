"use client";

import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { Filter } from "lucide-react";

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

  // Filter states
  const [filterStatus, setFilterStatus] = useState<string>("ALL");

  // Lookup states
  const [lookupResult, setLookupResult] = useState<CashoutQueueRequest | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  const fetchCashouts = useCallback(
    async (currentPage: number, statusParam = filterStatus) => {
      setLoading(true);
      try {
        const st = statusParam === "ALL" ? "PAID,REJECTED,FAILED" : statusParam;
        const res = await walletApi.allCashouts({
          page: currentPage,
          limit: 10,
          status: st,
        });
        if (res && res.data) {
          setCashouts(res.data);
          setPage(res.meta?.page ?? currentPage);
          setTotalPages(res.meta?.totalPages ?? 1);
          setTotal(res.meta?.total ?? res.data.length);
        }
      } catch (err) {
        toast.error((err as Error).message || t("wallet.errors.fetchFailed"));
      } finally {
        setLoading(false);
      }
    },
    [t, filterStatus]
  );

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
    } catch (err) {
      setLookupResult(null);
      setSearchError((err as Error).message || "Không tìm thấy mã đổi thưởng.");
    } finally {
      setIsSearching(false);
    }
  };

  const handleClearLookup = () => {
    setLookupResult(null);
    setSearchError(null);
  };

  const handleAction = async (id: string, action: "APPROVED" | "PAID" | "REJECTED" | "FAILED", reason?: string) => {
    try {
      await walletApi.processCashout(id, action, reason);
      toast.success(
        action === "FAILED"
          ? "Đã báo lỗi giao dịch thành công"
          : t("wallet.redemption.showing")
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
    } catch (err) {
      toast.error((err as Error).message || `Lỗi khi cập nhật giao dịch sang ${action}`);
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

      {/* Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-3 bg-white/5 dark:bg-black/20 backdrop-blur-md rounded-2xl border border-white/10 dark:border-white/5 shadow-sm">
        <div className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
          <Filter className="size-4 text-primary" /> Bộ lọc lịch sử đối soát
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground hidden sm:inline">Trạng thái:</span>
            <select
              value={filterStatus}
              onChange={(e) => {
                const val = e.target.value;
                setFilterStatus(val);
                void fetchCashouts(1, val);
              }}
              className="h-9 px-3 py-1.5 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all cursor-pointer"
            >
              <option value="ALL" className="bg-background text-foreground">Tất cả trạng thái</option>
              <option value="PAID" className="bg-background text-foreground">Đã duyệt chi (PAID)</option>
              <option value="REJECTED" className="bg-background text-foreground">Từ chối (REJECTED)</option>
              <option value="FAILED" className="bg-background text-foreground">Giao dịch lỗi (FAILED)</option>
            </select>
          </div>
        </div>
      </div>

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
