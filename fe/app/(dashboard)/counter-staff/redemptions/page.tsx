"use client";

import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

import { PageHeader } from "@/components/layout/page-header";
import { CashoutApprovalQueue } from "@/features/wallet/components/cashout-approval-queue";
import { mapCashoutToQueueRequest, type CashoutQueueRequest } from "@/features/wallet/backend-wallet";
import { walletApi, type CashoutItem } from "@/lib/api-client";
import { Filter, Calendar } from "lucide-react";

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

  // Filters
  const [filterStatus, setFilterStatus] = useState("PAID,REJECTED,FAILED"); // DEFAULT ALL
  const [filterDate, setFilterDate] = useState("");

  const fetchCashouts = useCallback(async (currentPage: number, forceStatus?: string, forceDate?: string) => {
    setLoading(true);
    try {
      const qStatus = forceStatus !== undefined ? forceStatus : filterStatus;
      const qDate = forceDate !== undefined ? forceDate : filterDate;
      const res = await walletApi.allCashouts({ page: currentPage, limit: 10, status: qStatus, date: qDate || undefined });
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
  }, [t, filterStatus, filterDate]);

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

      {/* Filters Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 p-3 bg-white/5 dark:bg-black/20 backdrop-blur-md rounded-2xl border border-white/10 dark:border-white/5 shadow-sm">
        <div className="flex items-center gap-2 flex-1 sm:max-w-xs">
          <Calendar className="size-4 text-muted-foreground/70 hidden sm:block" />
          <input
            type="date"
            value={filterDate}
            onChange={(e) => {
              setFilterDate(e.target.value);
              fetchCashouts(1, undefined, e.target.value);
            }}
            className="h-10 w-full px-3 py-2 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-muted-foreground/50"
          />
        </div>
        
        <div className="flex items-center gap-2 shrink-0">
          <Filter className="size-4 text-muted-foreground/70 hidden sm:block" />
          <select
            value={filterStatus}
            onChange={(e) => {
              setFilterStatus(e.target.value);
              fetchCashouts(1, e.target.value, undefined);
            }}
            className="h-10 px-3 py-2 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all appearance-none pr-8 relative cursor-pointer"
            style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round' className='lucide lucide-chevron-down'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`, backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1rem' }}
          >
            <option value="PAID,REJECTED,FAILED" className="bg-background text-foreground">Tất cả lịch sử</option>
            <option value="PAID" className="bg-background text-foreground">Đã duyệt chi</option>
            <option value="REJECTED" className="bg-background text-foreground">Từ chối</option>
            <option value="FAILED" className="bg-background text-foreground">Lỗi / Thất bại</option>
          </select>
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
