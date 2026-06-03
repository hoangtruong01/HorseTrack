"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PlusCircle, Loader2, Award } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { HorseCard, type Horse } from "@/features/horses/components/horse-card";
import { toast } from "sonner";

export default function HorsesStablePage() {
  const { t } = useTranslation();
  const [horses, setHorses] = useState<Horse[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchHorses = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/owner/horses");
      if (response.ok) {
        const resData = await response.json();
        if (resData.success) {
          setHorses(resData.data?.data || resData.data || []);
        }
      } else {
        toast.error(t("pages.owner.horses.toast.fetchFailed"));
      }
    } catch (err) {
      console.error("Lỗi lấy danh sách ngựa:", err);
      toast.error(t("common.backendConnectionFailed"));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHorses();
  }, []);

  const handleDelete = async (id: string) => {
    const isConfirm = window.confirm(t("pages.owner.horses.toast.deleteConfirm"));
    if (!isConfirm) return;

    try {
      const response = await fetch(`/api/owner/horses/${id}`, {
        method: "DELETE",
      });

      const resData = await response.json();

      if (response.ok && resData.success) {
        toast.success(t("pages.owner.horses.toast.deleteSuccess"));
        fetchHorses();
      } else {
        toast.error(resData.message || t("pages.owner.horses.toast.deleteFailed"));
      }
    } catch (err) {
      console.error("Lỗi xóa ngựa:", err);
      toast.error(t("common.backendError"));
    }
  };

  return (
    <main className="space-y-6 max-w-6xl mx-auto">
      <PageHeader
        eyebrow={t("pages.owner.horses.eyebrow")}
        title={t("pages.owner.horses.title")}
        description={t("pages.owner.horses.description")}
        actions={
          <Button asChild className="rounded-full bg-[#E10600] hover:bg-[#B80500] text-white">
            <Link href="/owner/horses/new">
              {t("pages.owner.horses.addHorse")}
              <PlusCircle className="size-4 ml-1.5" />
            </Link>
          </Button>
        }
      />

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 dark:text-white/55 text-muted-foreground">
          <Loader2 className="size-8 animate-spin text-[#E10600]" />
          <p className="mt-4 text-xs font-mono uppercase tracking-widest">{t("pages.owner.horses.loading")}</p>
        </div>
      ) : horses.length === 0 ? (
        <div className="rounded-2xl border dark:border-white/10 border-border dark:bg-[#15151E]/85 bg-card p-12 text-center shadow-[0_18px_56px_rgba(0,0,0,0.28)]">
          <Award className="size-16 dark:text-white/15 text-muted-foreground mx-auto mb-4 stroke-[1]" />
          <h3 className="text-xl font-black dark:text-white text-foreground uppercase tracking-tight mb-2">{t("pages.owner.horses.emptyTitle")}</h3>
          <p className="text-sm dark:text-white/50 text-muted-foreground max-w-md mx-auto mb-6">
            {t("pages.owner.horses.emptyDescription")}
          </p>
          <Button asChild className="rounded-full bg-[#E10600] hover:bg-[#B80500] text-white">
            <Link href="/owner/horses/new">
              {t("pages.owner.horses.addHorseNow")}
              <PlusCircle className="size-4 ml-1.5" />
            </Link>
          </Button>
        </div>
      ) : (
        <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {horses.map((horse) => (
            <HorseCard key={horse.id} horse={horse} onDelete={handleDelete} />
          ))}
        </section>
      )}
    </main>
  );
}
