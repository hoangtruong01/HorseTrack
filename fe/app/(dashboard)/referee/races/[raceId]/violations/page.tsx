"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Flag,
  Play,
  RotateCcw,
  Save,
  ShieldCheck,
  Siren,
  Sparkles,
  AlertTriangle,
  User,
  PlusCircle,
  Calendar,
  Clock,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/layout/page-header";
import { StatusBadge } from "@/components/ui/status-badge";
import { toast } from "sonner";

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

type Violation = {
  _id: string;
  type: string;
  severity: string;
  penalty: string;
  horseId?: {
    _id: string;
    name: string;
  };
  jockeyUserId?: {
    _id: string;
    fullName: string;
  };
  description?: string;
  reportedBy: {
    _id: string;
    fullName: string;
  };
  createdAt: string;
};

export default function RefereeViolationsPage({
  params,
}: {
  params: Promise<{ raceId: string }>;
}) {
  const { raceId } = use(params);
  const router = useRouter();

  const [race, setRace] = useState<Race | null>(null);
  const [horses, setHorses] = useState<RaceCheck[]>([]);
  const [violations, setViolations] = useState<Violation[]>([]);
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
      const raceRes = await fetch(`/api/referee/races/${raceId}`);
      if (!raceRes.ok) throw new Error("Không thể tải thông tin cuộc đua");
      const raceData = await raceRes.json();
      setRace(raceData.data);

      // 2. Fetch approved horses (from pre-race checks list)
      const checksRes = await fetch(`/api/referee/race-checks/race/${raceId}`);
      if (checksRes.ok) {
        const checksData = await checksRes.json();
        setHorses(checksData.data || []);
      }

      // 3. Fetch violations
      const violationsRes = await fetch(`/api/referee/race-violations/race/${raceId}`);
      if (violationsRes.ok) {
        const violationsData = await violationsRes.json();
        setViolations(violationsData.data || []);
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Lỗi khi tải dữ liệu.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
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
      const reg = selectedHorse.raceRegistrationId as any;
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
    } catch (err: any) {
      toast.error(err.message || "Lỗi khi lưu vi phạm.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDateTime = (dateStr?: string) => {
    if (!dateStr) return "Chưa xác định";
    const d = new Date(dateStr);
    return `${d.toLocaleTimeString("vi-VN", { hour: '2-digit', minute: '2-digit' })} ngày ${d.toLocaleDateString("vi-VN")}`;
  };

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="size-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!race) {
    return (
      <main className="max-w-4xl mx-auto p-8 space-y-4 text-center">
        <h2 className="text-xl font-bold dark:text-white text-foreground">Không tìm thấy cuộc đua</h2>
        <Button onClick={() => router.back()}>Quay lại</Button>
      </main>
    );
  }

  return (
    <main className="space-y-6 max-w-6xl mx-auto px-4 sm:px-6">
      {/* Back link */}
      <Link href={`/referee/races/${raceId}`} className="inline-flex items-center text-xs dark:text-white/50 text-muted-foreground hover:dark:text-white text-foreground transition">
        <ArrowLeft className="size-3.5 mr-1" /> Quay lại kiểm duyệt ngựa
      </Link>

      <PageHeader
        eyebrow="Ghi nhận biên bản"
        title="Báo Cáo Vi Phạm (Violations)"
        description="Ghi nhận các lỗi phát sinh trong quá trình thi đấu như xuất phát sai, chạy chệch làn đường, hoặc va chạm cản trở đối thủ."
        actions={
          <div className="flex items-center gap-3">
            <Button asChild className="h-11 rounded-full bg-[#E10600] hover:bg-[#B80500] text-white">
              <Link href={`/referee/races/${race._id}/result-entry`}>
                <Flag className="size-4 mr-1" /> Nhập kết quả
              </Link>
            </Button>
          </div>
        }
      />

      {/* Violation Penalty Info Card */}
      <section className="rounded-2xl border border-yellow-500/20 bg-yellow-500/5 p-4 flex gap-3 text-xs dark:text-white/70 text-muted-foreground">
        <AlertTriangle className="size-5 text-yellow-500 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h4 className="font-bold dark:text-white text-foreground uppercase text-[11px]">Hệ thống phạt tự động (Automatic Penalties)</h4>
          <p className="leading-relaxed">
            Các vi phạm có hình phạt **Cộng giây phạt (time_penalty)** sẽ được hệ thống tự động cộng trực tiếp vào thời gian hoàn thành của ngựa khi thực hiện khóa kết quả:
            <br />
            · Mức độ **Nhẹ (minor)**: +3.000ms (+3 giây) · **Trung bình (major)**: +6.000ms (+6 giây) · **Nghiêm trọng (critical)**: +12.000ms (+12 giây).
            <br />
            · Hình phạt **Truất quyền (disqualified)**: Xóa xếp hạng của ngựa, tính điểm thưởng và tiền thưởng = 0.
          </p>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[1fr_0.9fr] items-start">
        {/* Quick Add Form */}
        <section className="rounded-2xl border dark:border-white/10 border-border dark:bg-[#15151E] bg-card p-5 shadow-lg space-y-4">
          <h3 className="text-sm font-black uppercase tracking-wider dark:text-white text-foreground flex items-center gap-1.5">
            <PlusCircle className="size-4 text-primary" />
            Ghi nhận vi phạm nhanh
          </h3>

          <form onSubmit={handleSubmitViolation} className="space-y-4 text-xs">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase dark:text-white/50 text-muted-foreground">Chọn ngựa vi phạm</label>
                <select
                  value={selectedHorseId}
                  onChange={(e) => setSelectedHorseId(e.target.value)}
                  className="w-full rounded-lg border dark:border-white/10 border-border dark:bg-white/5 bg-muted/50 px-3 py-2 text-xs dark:text-white text-foreground focus:border-primary focus:outline-none"
                  required
                >
                  <option value="" className="dark:bg-[#15151E] bg-card">-- Chọn chiến mã --</option>
                  {horses.map((h) => (
                    <option key={h.horseId?._id} value={h.horseId?._id} className="dark:bg-[#15151E] bg-card">
                      {h.horseId?.name} ({h.horseId?.breed})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase dark:text-white/50 text-muted-foreground">Loại vi phạm</label>
                <select
                  value={violationType}
                  onChange={(e) => setViolationType(e.target.value)}
                  className="w-full rounded-lg border dark:border-white/10 border-border dark:bg-white/5 bg-muted/50 px-3 py-2 text-xs dark:text-white text-foreground focus:border-primary focus:outline-none"
                >
                  <option value="track_violation" className="dark:bg-[#15151E] bg-card">Vi phạm đường đua (TRACK)</option>
                  <option value="false_start" className="dark:bg-[#15151E] bg-card">Xuất phát sai quy định (FALSE START)</option>
                  <option value="dangerous_riding" className="dark:bg-[#15151E] bg-card">Đua xe/kỵ sĩ nguy hiểm (DANGEROUS)</option>
                  <option value="equipment_violation" className="dark:bg-[#15151E] bg-card">Lỗi trang thiết bị bảo hộ (EQUIPMENT)</option>
                  <option value="other" className="dark:bg-[#15151E] bg-card">Lỗi vi phạm khác (OTHER)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase dark:text-white/50 text-muted-foreground">Mức độ vi phạm</label>
                <select
                  value={violationSeverity}
                  onChange={(e) => setViolationSeverity(e.target.value)}
                  className="w-full rounded-lg border dark:border-white/10 border-border dark:bg-white/5 bg-muted/50 px-3 py-2 text-xs dark:text-white text-foreground focus:border-primary focus:outline-none"
                >
                  <option value="minor" className="dark:bg-[#15151E] bg-card">Nhẹ (MINOR - Phạt +3s)</option>
                  <option value="major" className="dark:bg-[#15151E] bg-card">Trung bình (MAJOR - Phạt +6s)</option>
                  <option value="critical" className="dark:bg-[#15151E] bg-card">Nghiêm trọng (CRITICAL - Phạt +12s)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase dark:text-white/50 text-muted-foreground">Hình phạt áp dụng</label>
                <select
                  value={violationPenalty}
                  onChange={(e) => setViolationPenalty(e.target.value)}
                  className="w-full rounded-lg border dark:border-white/10 border-border dark:bg-white/5 bg-muted/50 px-3 py-2 text-xs dark:text-white text-foreground focus:border-primary focus:outline-none"
                >
                  <option value="time_penalty" className="dark:bg-[#15151E] bg-card">Cộng giây phạt (TIME PENALTY)</option>
                  <option value="warning" className="dark:bg-[#15151E] bg-card">Cảnh cáo nhắc nhở (WARNING)</option>
                  <option value="disqualified" className="dark:bg-[#15151E] bg-card">Truất quyền thi đấu (DISQUALIFIED)</option>
                  <option value="none" className="dark:bg-[#15151E] bg-card">Không phạt (NONE)</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase dark:text-white/50 text-muted-foreground">Mô tả sự cố vi phạm chi tiết</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Ví dụ: Kỵ sĩ cố ý ép làn tại khúc cua thứ hai, chèn ép số hiệu 04 chệch khoảng 1.5m..."
                rows={3}
                className="w-full rounded-lg border dark:border-white/10 border-border dark:bg-white/5 bg-muted/50 px-3 py-2 text-xs dark:text-white text-foreground placeholder-white/20 focus:border-primary focus:outline-none resize-none"
                required
              />
            </div>

            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={isSubmitting || !selectedHorseId}
                className="rounded-full bg-primary hover:bg-primary-dark font-black uppercase text-xs h-10 px-6 text-white"
              >
                {isSubmitting ? "Đang ghi nhận..." : "Ghi nhận lỗi vi phạm"}
              </Button>
            </div>
          </form>
        </section>

        {/* Violations Log List */}
        <section className="space-y-4">
          <h3 className="text-sm font-black uppercase tracking-wider dark:text-white text-foreground">
            Nhật ký vi phạm đã ghi nhận ({violations.length})
          </h3>

          {violations.length === 0 ? (
            <div className="text-center py-12 rounded-2xl border border-dashed dark:border-white/10 border-border dark:bg-[#15151E]/40 bg-card dark:text-white/40 text-muted-foreground text-xs">
              Chưa có vi phạm nào được ghi nhận cho cuộc đua này.
            </div>
          ) : (
            <div className="space-y-3">
              {violations.map((v) => (
                <article
                  key={v._id}
                  className="rounded-xl border dark:border-white/5 border-border dark:bg-[#15151E]/90 bg-card p-4 space-y-3 shadow"
                >
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                        v.severity === "critical" ? "bg-red-500/10 text-red-400 border border-red-500/20" :
                        v.severity === "major" ? "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20" :
                        "bg-teal-500/10 text-teal-400 border border-teal-500/20"
                      }`}>
                        {v.severity === "critical" ? "CRITICAL" : v.severity === "major" ? "MAJOR" : "MINOR"}
                      </span>
                      <span className="text-[10px] dark:text-white/60 text-muted-foreground uppercase font-black tracking-wider">
                        · {v.type === "track_violation" ? "LỖI ĐƯỜNG ĐUA" :
                           v.type === "false_start" ? "XUẤT PHÁT SAI" :
                           v.type === "dangerous_riding" ? "KỴ SĨ ÉP LÀN" : "VI PHẠM KHÁC"}
                      </span>
                    </div>
                    <span className="text-[10px] dark:text-white/40 text-muted-foreground font-bold uppercase dark:bg-white/5 bg-muted/50 border dark:border-white/10 border-border px-2 py-0.5 rounded">
                      {v.penalty === "time_penalty" ? "Phạt cộng giây" :
                       v.penalty === "warning" ? "Cảnh cáo" :
                       v.penalty === "disqualified" ? "TRUẤT QUYỀN" : "Không phạt"}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <p className="text-xs font-bold dark:text-white text-foreground uppercase">Chiến mã: {v.horseId?.name}</p>
                    {v.jockeyUserId && (
                      <p className="text-[10px] dark:text-white/50 text-muted-foreground">Kỵ sĩ: <strong>{v.jockeyUserId?.fullName}</strong></p>
                    )}
                    <p className="text-xs dark:text-white/70 text-muted-foreground leading-relaxed mt-1">{v.description}</p>
                  </div>

                  <div className="h-px dark:bg-white/5 bg-muted/50" />

                  <div className="flex justify-between items-center text-[9px] dark:text-white/40 text-muted-foreground font-bold uppercase">
                    <span>Ghi nhận bởi: {v.reportedBy?.fullName}</span>
                    <span>{new Date(v.createdAt).toLocaleTimeString("vi-VN", { hour: '2-digit', minute: '2-digit' })}</span>
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
