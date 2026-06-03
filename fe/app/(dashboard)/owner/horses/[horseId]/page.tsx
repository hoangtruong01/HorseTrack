"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Edit2, Loader2, Award, Zap, Heart, Trophy, Timer, Gauge, ShieldAlert } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { HorseForm } from "@/features/horses/components/horse-form";
import type { Horse, HorseHealthStatus } from "@/features/horses/components/horse-card";
import { toast } from "sonner";

type RaceResultRecord = {
  id: string;
  raceName: string;
  raceStartTime: string;
  position: number;
  finishTime: number;
  gateNumber: number;
  speed: number;
  distanceCovered: number;
  injuryNotes?: string;
};

export default function HorseDetailPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  
  const horseId = params.horseId as string;
  const isEditing = searchParams.get("edit") === "true";

  const [horse, setHorse] = useState<Horse | null>(null);
  const [results, setResults] = useState<RaceResultRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getHealthMeta = (status: HorseHealthStatus) => {
    const toneMap: Record<HorseHealthStatus, "red" | "yellow" | "green" | "slate" | "teal"> = {
      HEALTHY: "green",
      INJURED: "red",
      RECOVERING: "yellow",
      RETIRED: "slate",
    };
    return {
      label: t(`pages.owner.horseDetail.health.${status}`),
      tone: toneMap[status] || ("slate" as const),
    };
  };

  const fetchHorseAndResults = async () => {
    setIsLoading(true);
    try {
      const [horseRes, resultsRes] = await Promise.all([
        fetch(`/api/owner/horses/${horseId}`),
        fetch(`/api/owner/horses/${horseId}/results`),
      ]);

      if (horseRes.ok) {
        const resData = await horseRes.json();
        if (resData.success) {
          setHorse(resData.data);
        }
      } else {
        toast.error(t("pages.owner.horseDetail.toast.fetchFailed"));
        router.push("/owner/horses");
        return;
      }

      if (resultsRes.ok) {
        const resData = await resultsRes.json();
        if (resData.success) {
          const raw = resData.data || [];
          const mapped: RaceResultRecord[] = raw.map((item: any) => ({
            id: item.id || item._id,
            raceName: item.raceId?.name || t("common.freeTournament"),
            raceStartTime: item.raceId?.startTime || new Date().toISOString(),
            position: item.position,
            finishTime: item.finishTime,
            gateNumber: item.gateNumber,
            speed: item.speed,
            distanceCovered: item.distanceCovered,
            injuryNotes: item.injuryNotes,
          }));
          setResults(mapped);
        }
      }
    } catch (err) {
      console.error("Lỗi lấy chi tiết ngựa và lịch sử:", err);
      toast.error(t("common.backendError"));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (horseId) {
      fetchHorseAndResults();
    }
  }, [horseId]);

  const handleUpdate = async (formData: FormData) => {
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/owner/horses/${horseId}`, {
        method: "PATCH",
        body: formData,
      });

      const resData = await response.json();

      if (!response.ok) {
        throw new Error(resData.message || t("pages.owner.horseDetail.toast.updateFailed"));
      }

      toast.success(t("pages.owner.horseDetail.toast.updateSuccess"));
      router.push(`/owner/horses/${horseId}`);
      fetchHorseAndResults();
    } catch (err: any) {
      toast.error(err.message || t("pages.owner.horseDetail.toast.saveError"));
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 dark:text-white/55 text-muted-foreground">
        <Loader2 className="size-8 animate-spin text-[#E10600]" />
        <p className="mt-4 text-xs font-mono uppercase tracking-widest">{t("pages.owner.horseDetail.loading")}</p>
      </div>
    );
  }

  if (!horse) {
    return (
      <div className="rounded-2xl border dark:border-white/10 border-border dark:bg-[#15151E]/85 bg-card p-12 text-center max-w-xl mx-auto shadow-2xl">
        <p className="text-sm dark:text-white/50 text-muted-foreground mb-4">{t("pages.owner.horseDetail.notFound")}</p>
        <Button asChild className="rounded-full dark:bg-white/5 bg-muted/50 dark:text-white text-foreground">
          <Link href="/owner/horses">{t("common.backToStable")}</Link>
        </Button>
      </div>
    );
  }

  if (isEditing) {
    return (
      <main className="space-y-6 max-w-4xl mx-auto">
        <div>
          <Link
            href={`/owner/horses/${horseId}`}
            className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.16em] dark:text-white/50 text-muted-foreground hover:dark:text-white text-foreground transition mb-3"
          >
            <ChevronLeft className="size-4" /> {t("pages.owner.horseDetail.cancelEdit")}
          </Link>
          
        </div>

        <section className="mt-4">
          <HorseForm
            initialData={horse}
            onSubmit={handleUpdate}
            onCancel={() => router.push(`/owner/horses/${horseId}`)}
            isSubmitting={isSubmitting}
          />
        </section>
      </main>
    );
  }

  const meta = getHealthMeta(horse.healthStatus);

  return (
    <main className="space-y-8 max-w-4xl mx-auto">
      <div>
        <Link
          href="/owner/horses"
          className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.16em] dark:text-white/50 text-muted-foreground hover:dark:text-white text-foreground transition mb-3"
        >
          <ChevronLeft className="size-4" /> {t("common.backToStable")}
        </Link>
        
        
      </div>

      <section className="grid gap-6 md:grid-cols-12 dark:bg-[#15151E] bg-card border dark:border-white/10 border-border rounded-2xl overflow-hidden p-6 md:p-8 shadow-[0_18px_56px_rgba(0,0,0,0.28)]">
        <div className="md:col-span-5 flex flex-col gap-4">
          <div className="relative aspect-square w-full rounded-xl overflow-hidden dark:bg-black/40 bg-muted/20 border dark:border-white/5 border-border flex items-center justify-center">
            {horse.image ? (
              <img
                src={horse.image}
                alt={horse.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex flex-col items-center justify-center dark:text-white/20 text-muted-foreground">
                <Award className="size-20 stroke-[1]" />
                <span className="text-xs uppercase tracking-widest mt-3">{t("common.noImage")}</span>
              </div>
            )}
            <div className="absolute top-3 left-3">
              <StatusBadge label={meta.label} tone={meta.tone} />
            </div>
          </div>

          <div className="space-y-4 dark:bg-white/[0.02] bg-muted/50 border dark:border-white/5 border-border rounded-xl p-4">
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="dark:text-white/50 text-muted-foreground uppercase tracking-wider flex items-center gap-1 font-bold">
                  <Zap className="size-3.5 text-yellow-400" /> {t("pages.owner.horseDetail.baseSpeed")}
                </span>
                <span className="dark:text-white text-foreground font-mono font-bold">{horse.baseSpeed} km/h</span>
              </div>
              <div className="w-full h-2 rounded-full dark:bg-black/40 bg-muted/20 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-yellow-500 to-yellow-300 rounded-full"
                  style={{ width: `${Math.min(100, (horse.baseSpeed / 100) * 100)}%` }}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="dark:text-white/50 text-muted-foreground uppercase tracking-wider flex items-center gap-1 font-bold">
                  <Heart className="size-3.5 text-red-500" /> {t("pages.owner.horseDetail.stamina")}
                </span>
                <span className="dark:text-white text-foreground font-mono font-bold">{horse.staminaScore}/100</span>
              </div>
              <div className="w-full h-2 rounded-full dark:bg-black/40 bg-muted/20 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-red-500 to-red-400 rounded-full"
                  style={{ width: `${horse.staminaScore}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="md:col-span-7 flex flex-col justify-between space-y-6">
          <div className="space-y-5">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#E10600]">{t("pages.owner.horseDetail.bioSpecs")}</p>
              <h3 className="text-2xl font-black uppercase dark:text-white text-foreground tracking-tight mt-1">{horse.name}</h3>
            </div>

            <div className="grid grid-cols-2 gap-4 border-y dark:border-white/5 border-border py-4 text-sm">
              <div className="space-y-1">
                <span className="text-xs dark:text-white/40 text-muted-foreground uppercase tracking-widest">{t("pages.owner.horseDetail.breed")}</span>
                <p className="dark:text-white text-foreground font-bold">{horse.breed || t("common.unknownBreed")}</p>
              </div>
              <div className="space-y-1">
                <span className="text-xs dark:text-white/40 text-muted-foreground uppercase tracking-widest">{t("pages.owner.horseDetail.color")}</span>
                <p className="dark:text-white text-foreground font-bold">{horse.color || t("common.unknownColor")}</p>
              </div>
              <div className="space-y-1">
                <span className="text-xs dark:text-white/40 text-muted-foreground uppercase tracking-widest">{t("pages.owner.horseDetail.gender")}</span>
                <p className="dark:text-white text-foreground font-bold">
                  {horse.gender === "MALE"
                    ? t("pages.owner.horseDetail.genderMale")
                    : horse.gender === "FEMALE"
                      ? t("pages.owner.horseDetail.genderFemale")
                      : t("pages.owner.horseDetail.genderGelding")}
                </p>
              </div>
              <div className="space-y-1">
                <span className="text-xs dark:text-white/40 text-muted-foreground uppercase tracking-widest">{t("pages.owner.horseDetail.age")}</span>
                <p className="dark:text-white text-foreground font-bold">
                  {horse.age ? t("common.yearsOld", { age: horse.age }) : t("common.na")}
                </p>
              </div>
              <div className="space-y-1">
                <span className="text-xs dark:text-white/40 text-muted-foreground uppercase tracking-widest">{t("pages.owner.horseDetail.weight")}</span>
                <p className="dark:text-white text-foreground font-mono font-bold">{horse.weightKg ? `${horse.weightKg} kg` : t("common.na")}</p>
              </div>
              <div className="space-y-1">
                <span className="text-xs dark:text-white/40 text-muted-foreground uppercase tracking-widest">{t("pages.owner.horseDetail.height")}</span>
                <p className="dark:text-white text-foreground font-mono font-bold">{horse.heightCm ? `${horse.heightCm} cm` : t("common.na")}</p>
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-xs dark:text-white/40 text-muted-foreground uppercase tracking-widest">{t("pages.owner.horseDetail.descriptionLabel")}</span>
              <p className="text-sm dark:text-white/80 text-muted-foreground leading-relaxed dark:bg-white/[0.02] bg-muted/50 border dark:border-white/5 border-border rounded-xl p-4">
                {horse.description || t("pages.owner.horseDetail.noDescription")}
              </p>
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <Button asChild variant="outline" className="rounded-xl border dark:border-white/10 border-border hover:dark:bg-white/5 bg-muted/50 dark:text-white text-foreground">
              <Link href="/owner/horses">{t("common.backToStable")}</Link>
            </Button>
            <Button
              onClick={() => router.push(`/owner/races`)}
              className="rounded-xl bg-[#E10600] hover:bg-[#B80500] text-white font-bold uppercase text-xs tracking-wider"
            >
              {t("pages.owner.horseDetail.registerRace")}
            </Button>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="text-lg font-black uppercase tracking-wider dark:text-white text-foreground flex items-center gap-2">
          <Trophy className="size-5 text-[#E10600]" /> {t("pages.owner.horseDetail.raceHistoryTitle")}
        </h3>

        {results.length === 0 ? (
          <div className="rounded-2xl border dark:border-white/10 border-border dark:bg-[#15151E]/50 bg-card p-8 text-center dark:text-white/40 text-muted-foreground">
            <Trophy className="size-12 mx-auto mb-3 opacity-20" />
            <p className="font-bold text-xs uppercase tracking-widest">{t("pages.owner.horseDetail.noRaceData")}</p>
            <p className="text-xs mt-1">{t("pages.owner.horseDetail.noRaceDataDesc")}</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {results.map((rec) => {
              const isPodium = rec.position <= 3;
              const podiumColors = [
                "border-yellow-500/40 bg-yellow-500/5 text-yellow-400 shadow-[0_4px_20px_rgba(234,179,8,0.08)]",
                "border-slate-300/40 bg-slate-300/5 text-slate-300 shadow-[0_4px_20px_rgba(203,213,225,0.08)]",
                "border-amber-600/40 bg-amber-600/5 text-amber-500 shadow-[0_4px_20px_rgba(217,119,6,0.08)]",
              ];
              const cardBorder = isPodium ? podiumColors[rec.position - 1] : "dark:border-white/10 border-border dark:bg-[#15151E] bg-card dark:text-white/80 text-muted-foreground";

              return (
                <article
                  key={rec.id}
                  className={`relative rounded-xl border p-4 flex flex-col justify-between ${cardBorder}`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider dark:text-white/40 text-muted-foreground">
                        {new Date(rec.raceStartTime).toLocaleDateString("vi-VN", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                        })}
                      </p>
                      <h4 className="font-black uppercase text-sm dark:text-white text-foreground mt-1 line-clamp-1">{rec.raceName}</h4>
                    </div>

                    <div className={`size-10 rounded-lg flex items-center justify-center border font-black text-lg ${
                      rec.position === 1 ? "bg-yellow-500/20 border-yellow-500 text-yellow-400" :
                      rec.position === 2 ? "bg-slate-300/20 border-slate-300 text-slate-200" :
                      rec.position === 3 ? "bg-amber-600/20 border-amber-600 text-amber-500" :
                      "dark:bg-black/35 bg-muted/20 dark:border-white/10 border-border dark:text-white/60 text-muted-foreground"
                    }`}>
                      #{rec.position}
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-3 gap-2 text-[10px] border-t dark:border-white/5 border-border pt-3">
                    <div>
                      <span className="dark:text-white/40 text-muted-foreground uppercase block">{t("pages.owner.horseDetail.finishTime")}</span>
                      <span className="font-mono font-bold dark:text-white text-foreground flex items-center gap-1 mt-0.5">
                        <Timer className="size-3 text-primary" /> {rec.finishTime}s
                      </span>
                    </div>
                    <div>
                      <span className="dark:text-white/40 text-muted-foreground uppercase block">{t("pages.owner.horseDetail.avgSpeed")}</span>
                      <span className="font-mono font-bold dark:text-white text-foreground flex items-center gap-1 mt-0.5">
                        <Gauge className="size-3 text-primary" /> {rec.speed} km/h
                      </span>
                    </div>
                    <div>
                      <span className="dark:text-white/40 text-muted-foreground uppercase block">{t("pages.owner.horseDetail.startGate")}</span>
                      <span className="font-mono font-bold dark:text-white text-foreground block mt-0.5">
                        {t("common.gateNumber", { number: rec.gateNumber })}
                      </span>
                    </div>
                  </div>

                  {rec.injuryNotes && (
                    <div className="mt-3 rounded-lg bg-red-500/10 border border-red-500/20 p-2 text-[10px] text-red-400 flex items-start gap-1.5">
                      <ShieldAlert className="size-3.5 shrink-0 mt-0.5" />
                      <span>{rec.injuryNotes}</span>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
