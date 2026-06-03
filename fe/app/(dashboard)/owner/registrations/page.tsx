"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { OwnerRegistrationTable, type Registration } from "@/features/registrations/components/owner-registration-table";
import { toast } from "sonner";

export default function OwnerRegistrationsPage() {
  const { t } = useTranslation();
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchRegistrations = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/owner/registrations");
      if (response.ok) {
        const resData = await response.json();
        if (resData.success) {
          const rawList = resData.data?.data || resData.data || [];
          const mapped: Registration[] = rawList.map((item: any) => ({
            id: item.id || item._id,
            tournamentId: item.tournamentId?._id || item.tournamentId?.id || "",
            tournamentName: item.tournamentId?.name || t("common.freeTournament"),
            raceId: item.raceId?._id || item.raceId?.id || "",
            raceName: item.raceId?.name || t("common.unknownRace"),
            horseId: item.horseId?._id || item.horseId?.id || "",
            horseName: item.horseId?.name || t("common.unknownHorse"),
            ownerId: item.ownerId?._id || item.ownerId || "",
            status: item.status,
            note: item.note,
            rejectedReason: item.rejectedReason,
            createdAt: item.createdAt || new Date().toISOString(),
          }));
          setRegistrations(mapped);
        }
      } else {
        toast.error(t("pages.owner.registrations.toast.fetchFailed"));
      }
    } catch (err) {
      console.error("Lỗi lấy lịch sử đăng ký:", err);
      toast.error(t("common.backendError"));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRegistrations();
  }, []);

  return (
    <main className="space-y-6 max-w-6xl mx-auto">

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 dark:text-white/55 text-muted-foreground">
          <Loader2 className="size-8 animate-spin text-[#E10600]" />
          <p className="mt-4 text-xs font-mono uppercase tracking-widest">{t("pages.owner.registrations.loading")}</p>
        </div>
      ) : (
        <OwnerRegistrationTable
          registrations={registrations}
          onRefresh={fetchRegistrations}
        />
      )}
    </main>
  );
}
