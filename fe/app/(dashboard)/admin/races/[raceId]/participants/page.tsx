"use client";
import Image from "next/image";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { AlertCircle, ChevronLeft, Loader2, Users } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { racesApi, registrationsApi, type RaceItem, type RegistrationItem } from "@/lib/api-client";
import { toast } from "sonner";

export default function AdminRaceParticipantsPage() {
  const params = useParams();
  const raceId = params.raceId as string;

  const [race, setRace] = useState<RaceItem | null>(null);
  const [registrations, setRegistrations] = useState<RegistrationItem[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [raceRes, regRes] = await Promise.all([
        racesApi.get(raceId),
        registrationsApi.list({ raceId, limit: 100 }),
      ]);
      setRace(raceRes);
      setRegistrations(regRes.data || []);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Không thể tải dữ liệu");
    } finally {
      setLoading(false);
    }
  }, [raceId]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
        <Image src="/skeletonHorse.gif" alt="Đang tải..." width={80} height={80} unoptimized className="object-contain mx-auto" />
        <p className="mt-4 text-xs font-mono uppercase tracking-widest">Đang tải danh sách chiến mã...</p>
      </div>
    );
  }

  if (!race) {
    return (
      <div className="rounded-2xl border border-border bg-card p-12 text-center max-w-xl mx-auto shadow-2xl">
        <AlertCircle className="size-16 text-red-500 mx-auto mb-4 stroke-[1.5]" />
        <h3 className="text-xl font-black text-foreground uppercase tracking-tight mb-2">Vòng đua không tồn tại</h3>
        <Button asChild className="rounded-full bg-white/5 text-foreground mt-4">
          <Link href="/admin/races">Quay lại danh sách</Link>
        </Button>
      </div>
    );
  }

  return (
    <main className="space-y-6 max-w-5xl mx-auto pb-12">
      <div>
        <Link
          href={`/admin/races/${raceId}`}
          className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground hover:text-foreground transition mb-3"
        >
          <ChevronLeft className="size-4" /> Quay lại chi tiết vòng đua
        </Link>
        <PageHeader
          eyebrow="Race participants"
          title={`${race.name} — Chiến Mã Thi Đấu`}
          description="Danh sách chiến mã đã đăng ký tham gia vòng đua và trạng thái phê duyệt."
          actions={
            <Button
              onClick={loadData}
              variant="outline"
              className="rounded-full text-xs font-bold uppercase tracking-wider h-10 px-5"
            >
              <Loader2 className={`size-4 mr-1.5 ${loading ? "animate-spin" : "hidden"}`} />
              Làm mới
            </Button>
          }
        />
      </div>

      <div className="rounded-2xl border border-border bg-card shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h3 className="text-xs font-black uppercase tracking-[0.2em] text-foreground flex items-center gap-2">
            <Users className="size-4 text-primary" />
            Chiến mã đăng ký ({registrations.length} / {race.maxParticipants || 8})
          </h3>
          <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
            race.status === "LIVE" ? "text-rose-400 bg-rose-400/10 border-rose-400/20 animate-pulse" :
            race.status === "CHECKING" ? "text-amber-400 bg-amber-400/10 border-amber-400/20" :
            race.status === "READY" ? "text-emerald-400 bg-emerald-400/10 border-emerald-400/20" :
            "text-muted-foreground border-border bg-white/5"
          }`}>
            {race.status}
          </span>
        </div>

        {registrations.length === 0 ? (
          <div className="text-center py-16 text-xs text-muted-foreground/70">
            <Users className="size-10 text-muted-foreground/20 mx-auto mb-3 stroke-[1.5]" />
            Chưa có chiến mã nào được ghi danh tham gia vòng đua này.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-white/[0.02] text-muted-foreground font-black uppercase tracking-wider">
                  <th className="p-4 w-12">#</th>
                  <th className="p-4">Chiến mã</th>
                  <th className="p-4">Chủ ngựa</th>
                  <th className="p-4">Nài ngựa</th>
                  <th className="p-4">Ngày đăng ký</th>
                  <th className="p-4 text-right">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-foreground/70">
                {registrations.map((reg, idx) => (
                  <tr key={reg._id} className="hover:bg-white/[0.02]">
                    <td className="p-4 font-mono font-bold text-muted-foreground/70">
                      #{idx + 1}
                    </td>
                    <td className="p-4 font-bold text-foreground">
                      {(typeof reg.horseId === "object" ? reg.horseId?.name : null) || "Chiến mã ẩn"}
                      {typeof reg.horseId === "object" && reg.horseId?.breed && (
                        <span className="block text-[10px] text-muted-foreground/60 font-normal">{reg.horseId.breed}</span>
                      )}
                    </td>
                    <td className="p-4">
                      <span className="block font-bold text-foreground">{(typeof reg.ownerId === "object" ? reg.ownerId?.fullName : null) || "N/A"}</span>
                      {typeof reg.ownerId === "object" && reg.ownerId?.email && (
                        <span className="block text-[10px] text-muted-foreground/60">{reg.ownerId.email}</span>
                      )}
                    </td>
                    <td className="p-4">
                      <span className="block font-bold text-foreground">{(typeof reg.jockeyUserId === "object" ? reg.jockeyUserId?.fullName : null) || "Chưa gán"}</span>
                      {typeof reg.jockeyUserId === "object" && reg.jockeyUserId?.email && (
                        <span className="block text-[10px] text-muted-foreground/60">{reg.jockeyUserId.email}</span>
                      )}
                    </td>
                    <td className="p-4 font-mono text-muted-foreground/70">
                      {reg.createdAt ? new Date(reg.createdAt).toLocaleDateString("vi-VN") : "—"}
                    </td>
                    <td className="p-4 text-right">
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-[8px] font-bold uppercase tracking-wider border ${
                        reg.status === "APPROVED"
                          ? "text-emerald-400 border-emerald-500/20 bg-emerald-500/10"
                          : reg.status === "PENDING"
                            ? "text-amber-400 border-amber-500/20 bg-amber-500/10"
                            : "text-red-400 border-red-500/20 bg-red-500/10"
                      }`}>
                        {reg.status === "APPROVED" ? "Đã duyệt" : reg.status === "PENDING" ? "Chờ duyệt" : reg.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}
