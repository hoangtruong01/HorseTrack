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

  return (
    <article className="group relative overflow-hidden rounded-2xl border border-white/10 bg-[#15151E] p-5 shadow-[0_18px_56px_rgba(0,0,0,0.28)] transition duration-200 hover:border-primary/40 hover:bg-[#1C1C25] flex flex-col justify-between min-h-[380px]">
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#E10600] via-white/20 to-transparent" />
      
      {/* Horse Image background blur or thumbnail */}
      <div className="relative w-full h-44 rounded-xl overflow-hidden bg-black/40 flex items-center justify-center border border-white/5 mb-4 shrink-0">
        {horse.image ? (
          <img
            src={horse.image}
            alt={horse.name}
            className="w-full h-full object-cover transition duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-white/20">
            <Award className="size-16 stroke-[1]" />
            <span className="text-xs uppercase tracking-widest mt-2">No Image Available</span>
          </div>
        )}
        <div className="absolute top-3 left-3">
          <StatusBadge label={meta.label} tone={meta.tone} />
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-start gap-2">
            <h2 className="text-xl font-black uppercase tracking-tight text-white line-clamp-1 group-hover:text-primary transition">
              {horse.name}
            </h2>
          </div>

          <p className="text-xs text-white/40 mt-1 uppercase tracking-wider font-semibold">
            {horse.breed || "Chưa rõ giống"} · {horse.color || "Chưa rõ màu"}
          </p>

          {/* Horse Stats Grid */}
          <div className="mt-4 grid grid-cols-2 gap-3 bg-white/[0.02] border border-white/5 rounded-xl p-3 text-xs">
            <div className="space-y-1">
              <span className="text-white/40 uppercase tracking-widest text-[10px]">Tốc độ nền</span>
              <p className="text-white font-mono font-bold text-sm">{horse.baseSpeed} km/h</p>
            </div>
            <div className="space-y-1">
              <span className="text-white/40 uppercase tracking-widest text-[10px]">Thể lực</span>
              <p className="text-white font-mono font-bold text-sm">{horse.staminaScore}/100</p>
            </div>
            <div className="space-y-1">
              <span className="text-white/40 uppercase tracking-widest text-[10px]">Tuổi / Giới</span>
              <p className="text-white uppercase font-bold text-[11px]">
                {horse.age ? `${horse.age} tuổi` : "N/A"} · {horse.gender === "MALE" ? "Đực" : horse.gender === "FEMALE" ? "Cái" : "Thiến"}
              </p>
            </div>
            <div className="space-y-1">
              <span className="text-white/40 uppercase tracking-widest text-[10px]">Cân nặng</span>
              <p className="text-white font-mono font-bold text-[11px]">
                {horse.weightKg ? `${horse.weightKg} kg` : "N/A"}
              </p>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="mt-5 flex gap-2 w-full pt-2 border-t border-white/5">
          <Button asChild className="rounded-xl flex-1 text-xs py-2 h-9 bg-white/5 hover:bg-white/10 text-white border border-white/10">
            <Link href={`/owner/horses/${horse.id}`}>
              Chi tiết
            </Link>
          </Button>
          <Button asChild variant="outline" className="rounded-xl p-2 size-9 shrink-0 bg-white/5 hover:bg-white/10 hover:text-yellow-400 border border-white/10 text-white/70">
            <Link href={`/owner/horses/${horse.id}?edit=true`}>
              <Edit2 className="size-4" />
            </Link>
          </Button>
          {onDelete && (
            <Button
              onClick={() => onDelete(horse.id)}
              variant="outline"
              className="rounded-xl p-2 size-9 shrink-0 bg-white/5 hover:bg-red-950/40 hover:text-[#E10600] border border-white/10 text-white/70 transition"
            >
              <Trash2 className="size-4" />
            </Button>
          )}
        </div>
      </div>
    </article>
  );
}
