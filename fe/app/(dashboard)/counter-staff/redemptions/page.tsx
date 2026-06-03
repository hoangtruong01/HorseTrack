"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

import { CashoutApprovalQueue } from "@/features/wallet/components/cashout-approval-queue";
import { walletApi, type CashoutItem } from "@/lib/api-client";
import type { CashoutRequest } from "@/features/wallet/mock-wallet";

export default function RedemptionsQueuePage() {
  const { t } = useTranslation();
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
      toast.error(err.message || t("pages.counterStaff.redemptions.fetchError"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCashouts();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAction = async (id: string, action: "APPROVED" | "PAID" | "REJECTED", reason?: string) => {
    try {
      await walletApi.processCashout(id, action);
      toast.success(t("pages.counterStaff.redemptions.updateSuccess", { status: action }));
      await fetchCashouts();
    } catch (err: any) {
      toast.error(err.message || t("pages.counterStaff.redemptions.updateError", { status: action }));
      await fetchCashouts();
    }
  };

  const mappedRequests: CashoutRequest[] = cashouts.map((c) => {
    const userObj = typeof c.userId === "object" ? c.userId : null;
    const userFullName = userObj?.fullName ?? t("pages.counterStaff.redemptions.defaultCustomer");

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

      {loading ? (
        <div className="flex items-center justify-center py-20 text-muted-foreground text-sm font-semibold">
          {t("pages.counterStaff.redemptions.loading")}
        </div>
      ) : (
        <CashoutApprovalQueue requests={mappedRequests} onAction={handleAction} />
      )}
    </main>
  );
}
