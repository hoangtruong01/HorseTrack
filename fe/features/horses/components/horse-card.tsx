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
    <article className="group relative overflow-hidden rounded-2xl border dark:border-white/10 border-border dark:bg-[#15151E] bg-card p-5 shadow-[0_18px_56px_rgba(0,0,0,0.28)] transition duration-200 hover:border-primary/40 dark:hover:bg-[#1C1C25] hover:bg-muted/80 flex flex-col justify-between min-h-[380px]">
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#E10600] via-white/20 to-transparent" />
      
      {/* Horse Image background blur or thumbnail */}
      <div className="relative w-full h-44 rounded-xl overflow-hidden dark:bg-black/40 bg-muted/20 flex items-center justify-center border dark:border-white/5 border-border mb-4 shrink-0">
        {horse.image ? (
          <img
            src={horse.image}
            alt={horse.name}
            className="w-full h-full object-cover transition duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex flex-col items-center justify-center dark:text-white/20 text-muted-foreground">
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
            <h2 className="text-xl font-black uppercase tracking-tight dark:text-white text-foreground line-clamp-1 group-hover:text-primary transition">
              {horse.name}
            </h2>
          </div>

          <p className="text-xs dark:text-white/40 text-muted-foreground mt-1 uppercase tracking-wider font-semibold">
            {horse.breed || "Chưa rõ giống"} · {horse.color || "Chưa rõ màu"}
          </p>

          {/* Horse Stats Grid */}
          <div className="mt-4 grid grid-cols-2 gap-3 dark:bg-white/[0.02] bg-muted/50 border dark:border-white/5 border-border rounded-xl p-3 text-xs">
            <div className="space-y-1">
              <span className="dark:text-white/40 text-muted-foreground uppercase tracking-widest text-[10px]">Tốc độ nền</span>
              <p className="dark:text-white text-foreground font-mono font-bold text-sm">{horse.baseSpeed} km/h</p>
            </div>
            <div className="space-y-1">
              <span className="dark:text-white/40 text-muted-foreground uppercase tracking-widest text-[10px]">Thể lực</span>
              <p className="dark:text-white text-foreground font-mono font-bold text-sm">{horse.staminaScore}/100</p>
            </div>
            <div className="space-y-1">
              <span className="dark:text-white/40 text-muted-foreground uppercase tracking-widest text-[10px]">Tuổi / Giới</span>
              <p className="dark:text-white text-foreground uppercase font-bold text-[11px]">
                {horse.age ? `${horse.age} tuổi` : "N/A"} · {horse.gender === "MALE" ? "Đực" : horse.gender === "FEMALE" ? "Cái" : "Thiến"}
              </p>
            </div>
            <div className="space-y-1">
              <span className="dark:text-white/40 text-muted-foreground uppercase tracking-widest text-[10px]">Cân nặng</span>
              <p className="dark:text-white text-foreground font-mono font-bold text-[11px]">
                {horse.weightKg ? `${horse.weightKg} kg` : "N/A"}
              </p>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="mt-5 flex gap-2 w-full pt-2 border-t dark:border-white/5 border-border">
          <Button asChild className="rounded-xl flex-1 text-xs py-2 h-9 dark:bg-white/5 bg-muted/50 hover:dark:bg-white/10 bg-muted/50 dark:text-white text-foreground border dark:border-white/10 border-border">
            <Link href={`/owner/horses/${horse.id}`}>
              Chi tiết
            </Link>
          </Button>
          <Button asChild variant="outline" className="rounded-xl p-2 size-9 shrink-0 dark:bg-white/5 bg-muted/50 hover:dark:bg-white/10 bg-muted/50 hover:text-yellow-400 border dark:border-white/10 border-border dark:text-white/70 text-muted-foreground">
            <Link href={`/owner/horses/${horse.id}?edit=true`}>
              <Edit2 className="size-4" />
            </Link>
          </Button>
          {onDelete && (
            <Button
              onClick={() => onDelete(horse.id)}
              variant="outline"
              className="rounded-xl p-2 size-9 shrink-0 dark:bg-white/5 bg-muted/50 hover:bg-red-950/40 hover:text-[#E10600] border dark:border-white/10 border-border dark:text-white/70 text-muted-foreground transition"
            >
              <Trash2 className="size-4" />
            </Button>
          )}
        </div>
      </div>
    </article>
  );
}
