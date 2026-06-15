"use client";
import Image from "next/image";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import {
  ArrowLeft,
  Flag,
  AlertTriangle,
  PlusCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/layout/page-header";
import { toast } from "sonner";
import { racesApi, raceChecksApi, raceViolationsApi, type ViolationItem } from "@/lib/api-client";

// Types
type Race = {
  _id: string;
  name: string;
  startTime: string;
  status: string;
};

type RaceCheck = {
  _id: string;
  raceRegistrationId: {
    _id: string;
    jockeyUserId: string | { _id: string; fullName: string };
  };
  horseId: {
    _id: string;
    name: string;
    breed: string;
  };
};

export default function RefereeViolationsPage() {
  const params = useParams();
  const raceId = params.raceId as string;
  const router = useRouter();

  const [race, setRace] = useState<Race | null>(null);
  const [horses, setHorses] = useState<RaceCheck[]>([]);
  const [violations, setViolations] = useState<ViolationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states
  const [selectedHorseId, setSelectedHorseId] = useState("");
  const [violationType, setViolationType] = useState("track_violation");
  const [violationSeverity, setViolationSeverity] = useState("minor");
  const [violationPenalty, setViolationPenalty] = useState("time_penalty");
  const [description, setDescription] = useState("");

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // 1. Fetch race info
      const raceData = await racesApi.get(raceId);
      setRace(raceData as unknown as Race);

      // 2. Fetch approved horses (from pre-race checks list)
      const checksData = await raceChecksApi.listByRace(raceId);
      setHorses((checksData || []) as unknown as RaceCheck[]);

      // 3. Fetch violations
      const violationsData = await raceViolationsApi.listByRace(raceId);
      setViolations(violationsData || []);
    } catch (err) {
      console.error(err);
      toast.error((err as Error).message || "Lỗi khi tải dữ liệu.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!raceId || raceId === "undefined") return;
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [raceId]);

  const handleSubmitViolation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedHorseId) {
      toast.error("Vui lòng chọn ngựa vi phạm");
      return;
    }

    setIsSubmitting(true);
    try {
      // Find the selected horse check to extract IDs
      const selectedHorse = horses.find((h) => h.horseId?._id === selectedHorseId);
      if (!selectedHorse) throw new Error("Không tìm thấy thông tin ngựa đã chọn");

      // Extract jockey ID
      const reg = selectedHorse.raceRegistrationId as { _id: string; jockeyUserId?: string | { _id: string } };
      const jockeyUserId = typeof reg?.jockeyUserId === "object" ? reg?.jockeyUserId?._id : reg?.jockeyUserId;

      const payload = {
        raceId,
        type: violationType,
        severity: violationSeverity,
        penalty: violationPenalty,
        raceRegistrationId: reg?._id,
        horseId: selectedHorseId,
        jockeyUserId,
        description,
      };

      const res = await fetch("/api/referee/race-violations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const resData = await res.json();
      if (!res.ok) {
        throw new Error(resData.message || "Ghi nhận vi phạm thất bại");
      }

      toast.success("Ghi nhận vi phạm thành công! Hệ thống sẽ tự động áp dụng phạt khi khóa kết quả.");
      // Reset form
      setSelectedHorseId("");
      setViolationType("track_violation");
      setViolationSeverity("minor");
      setViolationPenalty("time_penalty");
      setDescription("");
      
      // Reload violations
      await fetchData();
    } catch (err) {
      toast.error((err as Error).message || "Lỗi khi lưu vi phạm.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Image src="/skeletonHorse.gif" alt="Đang tải..." width={80} height={80} unoptimized className="object-contain mx-auto" />
      </div>
    );
  }

  if (!race) {
    return (
      <main className="max-w-4xl mx-auto p-8 space-y-4 text-center">
        <h2 className="text-xl font-bold text-white">Không tìm thấy cuộc đua</h2>
        <Button onClick={() => router.back()}>Quay lại</Button>
      </main>
    );
  }

  return (
    <main className="space-y-6 max-w-6xl mx-auto px-4 sm:px-6">
      {/* Back link */}
      <Link href={`/referee/races/${raceId}`} className="inline-flex items-center text-xs text-muted-foreground hover:text-foreground transition">
        <ArrowLeft className="size-3.5 mr-1" /> Quay lại kiểm duyệt ngựa
      </Link>

      <PageHeader
        eyebrow="Ghi nhận biên bản"
        title="Báo Cáo Vi Phạm (Violations)"
        description="Ghi nhận các lỗi phát sinh trong quá trình thi đấu như xuất phát sai, chạy chệch làn đường, hoặc va chạm cản trở đối thủ."
        actions={
          <div className="flex items-center gap-3">
            <Button asChild className="h-11 rounded-full bg-[#E10600] hover:bg-[#B80500] text-white">
              <Link href={`/referee/races/${raceId}/result-entry`}>
                <Flag className="size-4 mr-1" /> Nhập kết quả
              </Link>
            </Button>
          </div>
        }
      />

      {/* Violation Penalty Info Card */}
      <section className="rounded-2xl border border-amber-200 dark:border-amber-500/20 bg-amber-50/20 dark:bg-amber-500/5 p-5 flex flex-col md:flex-row gap-4 text-xs">
        <div className="flex items-start gap-3 w-full">
          <div className="p-2 rounded-xl bg-amber-100 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 shrink-0">
            <AlertTriangle className="size-5" />
          </div>
          <div className="space-y-3 flex-1">
            <div>
              <h4 className="font-bold text-foreground uppercase text-xs tracking-wider flex items-center gap-1.5">
                Hệ thống phạt tự động (Automatic Penalties)
              </h4>
              <p className="text-muted-foreground mt-1">
                Các vi phạm có hình phạt <span className="font-bold text-foreground">Cộng giây phạt (time_penalty)</span> sẽ được tự động cộng trực tiếp vào thời gian hoàn thành của ngựa khi trọng tài thực hiện khóa kết quả.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4">
              <div className="rounded-xl border border-teal-200 dark:border-teal-500/20 bg-teal-50/30 dark:bg-teal-500/5 p-3 space-y-1">
                <span className="text-[9px] font-extrabold uppercase tracking-wider text-teal-600 dark:text-teal-400">Nhẹ (Minor)</span>
                <p className="text-sm font-black text-teal-700 dark:text-teal-300">+3.000ms <span className="text-[10px] font-normal text-muted-foreground">(+3s)</span></p>
              </div>

              <div className="rounded-xl border border-amber-200 dark:border-amber-500/20 bg-amber-50/30 dark:bg-amber-500/5 p-3 space-y-1">
                <span className="text-[9px] font-extrabold uppercase tracking-wider text-amber-600 dark:text-amber-400">Trung bình (Major)</span>
                <p className="text-sm font-black text-amber-700 dark:text-amber-300">+6.000ms <span className="text-[10px] font-normal text-muted-foreground">(+6s)</span></p>
              </div>

              <div className="rounded-xl border border-red-200 dark:border-red-500/20 bg-red-50/30 dark:bg-red-500/5 p-3 space-y-1">
                <span className="text-[9px] font-extrabold uppercase tracking-wider text-red-600 dark:text-red-400">Nghiêm trọng (Critical)</span>
                <p className="text-sm font-black text-red-700 dark:text-red-300">+12.000ms <span className="text-[10px] font-normal text-muted-foreground">(+12s)</span></p>
              </div>

              <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-3 space-y-1">
                <span className="text-[9px] font-extrabold uppercase tracking-wider text-destructive">Truất quyền (Disqualified)</span>
                <p className="text-[10px] text-muted-foreground leading-snug">Hủy xếp hạng, Điểm = 0, Thưởng = 0</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[1fr_0.9fr] items-start">
        {/* Quick Add Form */}
        <section className="rounded-2xl border border-border dark:border-white/10 bg-card p-5 shadow-md space-y-4">
          <h3 className="text-sm font-black uppercase tracking-wider text-foreground flex items-center gap-1.5">
            <PlusCircle className="size-4 text-primary" />
            Ghi nhận vi phạm nhanh
          </h3>

          <form onSubmit={handleSubmitViolation} className="space-y-4 text-xs">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase text-muted-foreground">Chọn ngựa vi phạm</label>
                <select
                  value={selectedHorseId}
                  onChange={(e) => setSelectedHorseId(e.target.value)}
                  className="w-full rounded-lg border border-border bg-muted px-3 py-2 text-xs text-foreground focus:border-primary focus:outline-none"
                  required
                >
                  <option value="" className="bg-card">-- Chọn chiến mã --</option>
                  {horses.map((h) => (
                    <option key={h.horseId?._id} value={h.horseId?._id} className="bg-card">
                      {h.horseId?.name} ({h.horseId?.breed})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase text-muted-foreground">Loại vi phạm</label>
                <select
                  value={violationType}
                  onChange={(e) => setViolationType(e.target.value)}
                  className="w-full rounded-lg border border-border bg-muted px-3 py-2 text-xs text-foreground focus:border-primary focus:outline-none"
                >
                  <option value="track_violation" className="bg-card">Vi phạm đường đua (TRACK)</option>
                  <option value="false_start" className="bg-card">Xuất phát sai quy định (FALSE START)</option>
                  <option value="dangerous_riding" className="bg-card">Đua xe/kỵ sĩ nguy hiểm (DANGEROUS)</option>
                  <option value="equipment_violation" className="bg-card">Lỗi trang thiết bị bảo hộ (EQUIPMENT)</option>
                  <option value="other" className="bg-card">Lỗi vi phạm khác (OTHER)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase text-muted-foreground">Mức độ vi phạm</label>
                <select
                  value={violationSeverity}
                  onChange={(e) => setViolationSeverity(e.target.value)}
                  className="w-full rounded-lg border border-border bg-muted px-3 py-2 text-xs text-foreground focus:border-primary focus:outline-none"
                >
                  <option value="minor" className="bg-card">Nhẹ (MINOR - Phạt +3s)</option>
                  <option value="major" className="bg-card">Trung bình (MAJOR - Phạt +6s)</option>
                  <option value="critical" className="bg-card">Nghiêm trọng (CRITICAL - Phạt +12s)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase text-muted-foreground">Hình phạt áp dụng</label>
                <select
                  value={violationPenalty}
                  onChange={(e) => setViolationPenalty(e.target.value)}
                  className="w-full rounded-lg border border-border bg-muted px-3 py-2 text-xs text-foreground focus:border-primary focus:outline-none"
                >
                  <option value="time_penalty" className="bg-card">Cộng giây phạt (TIME PENALTY)</option>
                  <option value="warning" className="bg-card">Cảnh cáo nhắc nhở (WARNING)</option>
                  <option value="disqualified" className="bg-card">Truất quyền thi đấu (DISQUALIFIED)</option>
                  <option value="none" className="bg-card">Không phạt (NONE)</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase text-muted-foreground">Mô tả sự cố vi phạm chi tiết</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Ví dụ: Kỵ sĩ cố ý ép làn tại khúc cua thứ hai, chèn ép số hiệu 04 chệch khoảng 1.5m..."
                rows={3}
                className="w-full rounded-lg border border-border bg-muted px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none resize-none"
                required
              />
            </div>

            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={isSubmitting || !selectedHorseId}
                className="rounded-full bg-primary hover:bg-primary/90 font-black uppercase text-xs h-10 px-6 text-primary-foreground"
              >
                {isSubmitting ? "Đang ghi nhận..." : "Ghi nhận lỗi vi phạm"}
              </Button>
            </div>
          </form>
        </section>

        {/* Violations Log List */}
        <section className="space-y-4">
          <h3 className="text-sm font-black uppercase tracking-wider text-foreground">
            Nhật ký vi phạm đã ghi nhận ({violations.length})
          </h3>

          {violations.length === 0 ? (
            <div className="text-center py-12 rounded-2xl border border-dashed border-border bg-muted/40 text-muted-foreground text-xs">
              Chưa có vi phạm nào được ghi nhận cho cuộc đua này.
            </div>
          ) : (
            <div className="space-y-3">
              {violations.map((v) => (
                <article
                  key={v._id}
                  className="rounded-xl border border-border dark:border-white/5 bg-card p-4 space-y-3 shadow-sm"
                >
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase border ${
                        v.severity === "critical" ? "bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 border-red-200 dark:border-red-500/20" :
                        v.severity === "major" ? "bg-amber-50 dark:bg-yellow-500/10 text-amber-700 dark:text-yellow-400 border-amber-200 dark:border-yellow-500/20" :
                        "bg-teal-50 dark:bg-teal-500/10 text-teal-700 dark:text-teal-400 border-teal-200 dark:border-teal-500/20"
                      }`}>
                        {v.severity === "critical" ? "CRITICAL" : v.severity === "major" ? "MAJOR" : "MINOR"}
                      </span>
                      <span className="text-[10px] text-muted-foreground uppercase font-black tracking-wider">
                        · {v.type === "track_violation" ? "LỖI ĐƯỜNG ĐUA" :
                           v.type === "false_start" ? "XUẤT PHÁT SAI" :
                           v.type === "dangerous_riding" ? "KỴ SĨ ÉP LÀN" : "VI PHẠM KHÁC"}
                      </span>
                    </div>
                    <span className="text-[10px] text-muted-foreground font-bold uppercase bg-muted border border-border px-2 py-0.5 rounded">
                      {v.penalty === "time_penalty" ? "Phạt cộng giây" :
                       v.penalty === "warning" ? "Cảnh cáo" :
                       v.penalty === "disqualified" ? "TRUẤT QUYỀN" : "Không phạt"}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <p className="text-xs font-bold text-foreground uppercase">Chiến mã: {v.horseId?.name}</p>
                    {v.jockeyUserId && (
                      <p className="text-[10px] text-muted-foreground">Kỵ sĩ: <strong className="text-foreground">{v.jockeyUserId?.fullName}</strong></p>
                    )}
                    <p className="text-xs text-muted-foreground leading-relaxed mt-1">{v.description}</p>
                  </div>

                  <div className="h-px bg-border" />

                  <div className="flex justify-between items-center text-[9px] text-muted-foreground font-bold uppercase">
                    <span>Ghi nhận bởi: {v.reportedBy?.fullName}</span>
                    <span>{v.createdAt ? new Date(v.createdAt).toLocaleTimeString("vi-VN", { hour: '2-digit', minute: '2-digit' }) : "—"}</span>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
