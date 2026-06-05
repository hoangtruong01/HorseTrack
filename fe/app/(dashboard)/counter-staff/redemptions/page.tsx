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
      toast.error(err.message || "Lá»—i khi láº¥y danh sÃ¡ch Ä‘á»•i thÆ°á»Ÿng.");
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
      toast.success(`Cáº­p nháº­t giao dá»‹ch thÃ nh cÃ´ng sang tráº¡ng thÃ¡i ${action}`);
      await fetchCashouts();
    } catch (err: any) {
      toast.error(err.message || `Lá»—i khi cáº­p nháº­t giao dá»‹ch sang ${action}`);
      // Reload to ensure state is in sync
      await fetchCashouts();
    }
  };

  const mappedRequests = cashouts.map(mapCashoutToQueueRequest);

  return (
    <main className="space-y-6">
      <PageHeader
        eyebrow="Redemption Queue"
        title="Duyá»‡t HÃ ng Äá»£i Äá»•i ThÆ°á»Ÿng"
        description="Xá»­ lÃ½ vÃ  hoÃ n táº¥t cÃ¡c yÃªu cáº§u Ä‘á»•i Ä‘iá»ƒm láº¥y quÃ  táº·ng váº­t lÃ½ cá»§a ngÆ°á»i dÃ¹ng khi há» Ä‘áº¿n quáº§y trá»±c tiáº¿p."
      />

      {loading ? (
        <div className="flex items-center justify-center py-20 text-muted-foreground text-sm font-semibold">
          Äang táº£i hÃ ng Ä‘á»£i Ä‘á»•i thÆ°á»Ÿng tá»« há»‡ thá»‘ng...
        </div>
      ) : (
        <CashoutApprovalQueue requests={mappedRequests} onAction={handleAction} />
      )}
    </main>
  );
}
