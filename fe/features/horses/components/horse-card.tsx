import Image from "next/image";
import Link from "next/link";
import { Trash2, Edit2, ShieldAlert, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";

export type HorseGender = "MALE" | "FEMALE" | "GELDING";
export type HorseHealthStatus = "HEALTHY" | "INJURED" | "RECOVERING" | "RETIRED";

export type Horse = {
  id: string;
  name: string;
  breed?: string;
  age?: number;
  gender?: HorseGender;
  color?: string;
  weightKg?: number;
  heightCm?: number;
  healthStatus: HorseHealthStatus;
  baseSpeed: number;
  staminaScore: number;
  image?: string;
  description?: string;
  approvalStatus?: "PENDING" | "APPROVED" | "REJECTED";
  rejectionReason?: string;
  rejectedAt?: string;
  approvedAt?: string;
};

type HorseCardProps = {
  horse: Horse;
  onDelete?: (id: string) => void;
};

const healthMeta: Record<
  HorseHealthStatus,
  {
    label: string;
    tone: "red" | "yellow" | "green" | "slate" | "teal";
  }
> = {
  HEALTHY: { label: "Khỏe mạnh", tone: "green" },
  INJURED: { label: "Chấn thương", tone: "red" },
  RECOVERING: { label: "Hồi phục", tone: "yellow" },
  RETIRED: { label: "Giải nghệ", tone: "slate" },
};

export function HorseCard({ horse, onDelete }: HorseCardProps) {
  const meta = healthMeta[horse.healthStatus] || { label: horse.healthStatus, tone: "slate" };

  const getRemainingTimeText = (rejectedAtStr?: string) => {
    if (!rejectedAtStr) return "Sắp bị xóa";
    const rejectedAt = new Date(rejectedAtStr).getTime();
    const now = new Date().getTime();
    const diffMs = rejectedAt + 24 * 60 * 60 * 1000 - now;
    if (diffMs <= 0) return "Sắp bị xóa";
    const diffHours = Math.floor(diffMs / (60 * 60 * 1000));
    const diffMins = Math.floor((diffMs % (60 * 60 * 1000)) / (60 * 1000));
    return `Hệ thống tự động xóa sau ${diffHours}h ${diffMins}p`;
  };

  return (
    <article className="group relative flex min-h-[380px] flex-col justify-between overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-lg transition duration-200 hover:border-primary/40 hover:bg-muted/30">
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#E10600] via-white/20 to-transparent" />
      
      {/* Horse Image background blur or thumbnail */}
      <div className="relative mb-4 flex h-44 w-full shrink-0 items-center justify-center overflow-hidden rounded-xl border border-border bg-muted/50">
        {horse.image ? (
          <Image
            src={horse.image}
            alt={horse.name}
            fill
            className="object-cover transition duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-white/20">
            <Award className="size-16 stroke-[1]" />
            <span className="text-xs uppercase tracking-widest mt-2">No Image Available</span>
          </div>
        )}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 items-start">
          <StatusBadge label={meta.label} tone={meta.tone} />
          {horse.approvalStatus && horse.approvalStatus !== "APPROVED" && (
            <StatusBadge 
              label={horse.approvalStatus === "PENDING" ? "Chờ duyệt" : "Bị từ chối"} 
              tone={horse.approvalStatus === "PENDING" ? "yellow" : "red"} 
            />
          )}
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-start gap-2">
            <h2 className="text-xl font-black uppercase tracking-tight text-foreground line-clamp-1 group-hover:text-primary transition">
              {horse.name}
            </h2>
          </div>

          <p className="text-xs text-muted-foreground/60 mt-1 uppercase tracking-wider font-semibold">
            {horse.breed || "Chưa rõ giống"} · {horse.color || "Chưa rõ màu"}
          </p>

          {/* Horse Stats Grid */}
          <div className="mt-4 grid grid-cols-2 gap-3 bg-muted/[0.02] border border-border/5 rounded-xl p-3 text-xs">
            <div className="space-y-1">
              <span className="text-muted-foreground/60 uppercase tracking-widest text-[10px]">Tốc độ nền</span>
              <p className="text-foreground font-mono font-bold text-sm">{horse.baseSpeed} km/h</p>
            </div>
            <div className="space-y-1">
              <span className="text-muted-foreground/60 uppercase tracking-widest text-[10px]">Thể lực</span>
              <p className="text-foreground font-mono font-bold text-sm">{horse.staminaScore}/100</p>
            </div>
            <div className="space-y-1">
              <span className="text-muted-foreground/60 uppercase tracking-widest text-[10px]">Tuổi / Giới</span>
              <p className="text-foreground uppercase font-bold text-[11px]">
                {horse.age ? `${horse.age} tuổi` : "N/A"} · {horse.gender === "MALE" ? "Đực" : horse.gender === "FEMALE" ? "Cái" : "Thiến"}
              </p>
            </div>
            <div className="space-y-1">
              <span className="text-muted-foreground/60 uppercase tracking-widest text-[10px]">Cân nặng</span>
              <p className="text-foreground font-mono font-bold text-[11px]">
                {horse.weightKg ? `${horse.weightKg} kg` : "N/A"}
              </p>
            </div>
          </div>

          {horse.approvalStatus === "REJECTED" && (
            <div className="mt-3 rounded-xl bg-red-500/10 border border-red-500/20 p-3 text-xs text-red-400 space-y-1">
              <p className="font-bold flex items-center gap-1">
                <ShieldAlert className="size-3.5 shrink-0" />
                Lý do không duyệt:
              </p>
              <p className="text-white/80 italic">{horse.rejectionReason || "Không rõ lý do"}</p>
              <p className="text-[10px] font-mono text-red-300 font-bold uppercase tracking-wider">
                {getRemainingTimeText(horse.rejectedAt)}
              </p>
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className="mt-5 flex gap-2 w-full pt-2 border-t border-border/5">
          <Button asChild className="rounded-xl flex-1 text-xs py-2 h-9 bg-muted/5 hover:bg-muted/10 text-foreground border border-border/10">
            <Link href={`/owner/horses/${horse.id}`}>
              Chi tiết
            </Link>
          </Button>
          <Button asChild variant="outline" className="rounded-xl p-2 size-9 shrink-0 bg-muted/5 hover:bg-muted/10 hover:text-yellow-400 border border-border/10 text-white/70">
            <Link href={`/owner/horses/${horse.id}?edit=true`}>
              <Edit2 className="size-4" />
            </Link>
          </Button>
          {onDelete && (
            <Button
              onClick={() => onDelete(horse.id)}
              variant="outline"
              className="rounded-xl p-2 size-9 shrink-0 bg-muted/5 hover:bg-red-950/40 hover:text-[#E10600] border border-border/10 text-white/70 transition"
            >
              <Trash2 className="size-4" />
            </Button>
          )}
        </div>
      </div>
    </article>
  );
}
