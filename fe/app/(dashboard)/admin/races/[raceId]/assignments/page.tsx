"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { AlertCircle, ChevronLeft, Loader2, ShieldCheck, UserRound } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import {
  racesApi,
  refereeAssignmentsApi,
  registrationsApi,
  type AssignmentItem,
  type RaceItem,
} from "@/lib/api-client";
import { toast } from "sonner";

export default function AdminRaceAssignmentsPage() {
  const params = useParams();
  const raceId = params.raceId as string;

  const [race, setRace] = useState<RaceItem | null>(null);
  const [assignments, setAssignments] = useState<AssignmentItem[]>([]);
  const [registrations, setRegistrations] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [raceRes, assignRes, regRes] = await Promise.all([
        racesApi.get(raceId),
        refereeAssignmentsApi.listByRace(raceId, { limit: 100 }),
        registrationsApi.list({ raceId, limit: 100 }),
      ]);
      setRace(raceRes);
      setAssignments(assignRes.data || []);
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
        <Loader2 className="size-8 animate-spin text-[#E10600]" />
        <p className="mt-4 text-xs font-mono uppercase tracking-widest">Đang tải thông tin phân công...</p>
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
          eyebrow="Assignment overview"
          title={`${race.name} — Phân Công`}
          description="Danh sách trọng tài được phân công và nài ngựa đã đăng ký vào vòng đua."
        />
      </div>

      <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        {/* Referee Assignments */}
        <div className="rounded-2xl border border-border bg-card p-5 sm:p-6 space-y-4 shadow-[0_18px_56px_rgba(0,0,0,0.28)] relative overflow-hidden">
          <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-primary to-transparent" />
          <div className="flex items-center gap-2">
            <ShieldCheck className="size-5 text-primary" />
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-primary">Trọng tài phân công</h3>
          </div>

          {assignments.length === 0 ? (
            <p className="text-xs text-muted-foreground/60 py-4 text-center">Chưa có trọng tài nào được phân công.</p>
          ) : (
            <div className="space-y-3">
              {assignments.map((a) => {
                const refName = typeof a.refereeUserId === "object" ? a.refereeUserId?.fullName : "—";
                const refEmail = typeof a.refereeUserId === "object" ? a.refereeUserId?.email : "";
                return (
                  <div key={a._id} className="rounded-xl border border-border bg-muted/50 p-4 space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-black text-foreground text-sm">{refName}</span>
                      <span className={`inline-flex rounded-full border px-2 py-0.5 text-[8px] font-bold uppercase tracking-wider ${
                        a.status === "ACCEPTED"
                          ? "text-emerald-400 border-emerald-500/20 bg-emerald-500/10"
                          : a.status === "PENDING"
                            ? "text-amber-400 border-amber-500/20 bg-amber-500/10"
                            : "text-red-400 border-red-500/20 bg-red-500/10"
                      }`}>
                        {a.status}
                      </span>
                    </div>
                    {refEmail && <p className="text-[10px] text-muted-foreground/60">{refEmail}</p>}
                    <p className="text-[10px] text-muted-foreground/50 uppercase tracking-wider">
                      Vai trò: <span className="font-bold text-muted-foreground">{a.role === "main" ? "Trọng tài chính" : "Trọng tài phụ"}</span>
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Jockey Lanes */}
        <div className="rounded-2xl border border-border bg-card p-5 sm:p-6 space-y-4 shadow-[0_18px_56px_rgba(0,0,0,0.28)] relative overflow-hidden">
          <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-teal-500 to-transparent" />
          <div className="flex items-center gap-2">
            <UserRound className="size-5 text-teal-400" />
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-teal-400">Nài ngựa & chiến mã</h3>
          </div>

          {registrations.length === 0 ? (
            <p className="text-xs text-muted-foreground/60 py-4 text-center">Chưa có chiến mã nào đăng ký.</p>
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              {registrations.map((reg, idx) => (
                <article key={reg._id} className="rounded-xl border border-border bg-muted/50 p-4 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] text-muted-foreground/50 bg-muted rounded px-1.5 py-0.5">
                      #{reg.gateNumber ?? idx + 1}
                    </span>
                    <span className="font-black text-foreground text-sm truncate">
                      {reg.jockeyUserId?.fullName || "Chưa gán nài"}
                    </span>
                  </div>
                  <p className="text-[10px] text-muted-foreground/60">
                    Ngựa: <span className="font-bold text-foreground/80">{reg.horseId?.name || "—"}</span>
                    {reg.horseId?.breed && ` · ${reg.horseId.breed}`}
                  </p>
                  <span className={`inline-flex rounded-full px-2 py-0.5 text-[8px] font-bold uppercase tracking-wider border ${
                    reg.status === "APPROVED"
                      ? "text-emerald-400 border-emerald-500/20 bg-emerald-500/10"
                      : "text-amber-400 border-amber-500/20 bg-amber-500/10"
                  }`}>
                    {reg.status === "APPROVED" ? "Đã duyệt" : reg.status}
                  </span>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
