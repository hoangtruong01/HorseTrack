"use client";

import { useState } from "react";
import { Loader2, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Horse } from "@/features/horses/components/horse-card";

type RaceRegistrationFormProps = {
  race: {
    id: string;
    name: string;
    tournamentName?: string;
    distance?: string;
    surface?: string;
    date?: string;
    startTime?: string;
    location?: string;
    capacity?: number;
    participantsCount?: number;
  };
  horses: Horse[];
  onSubmit: (horseId: string) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
};

export function RaceRegistrationForm({
  race,
  horses,
  onSubmit,
  onCancel,
  isSubmitting,
}: RaceRegistrationFormProps) {
  const [selectedHorseId, setSelectedHorseId] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const eligibleHorses = horses.filter(
    (h) => h.healthStatus === "HEALTHY" && h.approvalStatus === "APPROVED"
  );
  
  const ineligibleHorses = horses.filter(
    (h) => h.healthStatus !== "HEALTHY" || h.approvalStatus !== "APPROVED"
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!selectedHorseId) {
      setErrorMsg("Vui lòng chọn chiến mã đăng ký.");
      return;
    }

    try {
      await onSubmit(selectedHorseId);
    } catch (err) {
      setErrorMsg((err as Error).message || "Đăng ký tham gia trận đua thất bại.");
    }
  };

  const selectedHorse = horses.find((h) => h.id === selectedHorseId);

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 bg-card border border-border rounded-2xl p-6 md:p-8 shadow-[0_18px_56px_rgba(0,0,0,0.28)] max-w-2xl mx-auto"
    >
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
          Đăng ký trận đua
        </p>
        <h2 className="mt-2 text-2xl font-black uppercase tracking-tight text-foreground">
          Thủ tục ghi tên chiến mã
        </h2>
      </div>

      {errorMsg && (
        <div className="rounded-xl border border-destructive bg-destructive/10 p-4 text-sm text-foreground">
          <span className="font-bold text-destructive uppercase block mb-1">Lỗi đăng ký</span>
          {errorMsg}
        </div>
      )}

      {/* Race Overview Card */}
      <div className="rounded-xl border border-border bg-muted/40 p-4 space-y-3">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-black text-lg text-foreground uppercase">{race.name}</h3>
            <p className="text-xs text-muted-foreground/60 uppercase tracking-widest">{race.tournamentName || "Giải tự do"}</p>
          </div>
          <span className="text-xs font-mono text-muted-foreground bg-muted border border-border px-2 py-1 rounded">
            {race.distance} · {race.surface}
          </span>
        </div>
        
        <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground pt-2 border-t border-border">
          <div>
            <span className="text-muted-foreground/60 block uppercase tracking-widest text-[9px] mb-0.5">Thời gian</span>
            <p className="text-foreground font-mono font-bold">{race.date} · {race.startTime}</p>
          </div>
          <div>
            <span className="text-muted-foreground/60 block uppercase tracking-widest text-[9px] mb-0.5">Số lượng tham gia</span>
            <p className="text-foreground font-mono font-bold">{race.participantsCount || 0}/{race.capacity || 20} chiến mã</p>
          </div>
        </div>
      </div>

      {/* Horse Selection Section */}
      <div className="space-y-3">
        <label className="text-xs font-black uppercase tracking-[0.16em] text-muted-foreground">
          Lựa chọn Chiến Mã Đăng Ký
        </label>
        
        {horses.length === 0 ? (
          <div className="rounded-xl border border-border bg-muted/40 p-6 text-center text-sm text-muted-foreground">
            Bạn chưa đăng ký chiến mã nào trong hệ thống. Vui lòng thêm chiến mã vào chuồng trước khi đăng ký trận đua.
          </div>
        ) : (
          <div className="space-y-4">
            <select
              value={selectedHorseId}
              onChange={(e) => setSelectedHorseId(e.target.value)}
              className="h-11 w-full rounded-xl border border-input bg-background px-4 text-sm text-foreground placeholder:text-muted-foreground/60 outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/15"
            >
              <option value="" className="bg-popover text-popover-foreground">-- Chọn chiến mã khỏe mạnh --</option>

              {/* Eligible Horses group */}
              {eligibleHorses.length > 0 && (
                <optgroup label="ĐỦ ĐIỀU KIỆN ĐĂNG KÝ" className="bg-popover text-green-400 font-bold">
                  {eligibleHorses.map((h) => (
                    <option key={h.id} value={h.id} className="text-foreground">
                      {h.name} ({h.breed || "Không rõ giống"}) - Tốc độ: {h.baseSpeed} km/h
                    </option>
                  ))}
                </optgroup>
              )}

              {/* Ineligible Horses group */}
              {ineligibleHorses.length > 0 && (
                <optgroup label="KHÔNG ĐỦ ĐIỀU KIỆN (CHƯA DUYỆT/CHẤN THƯƠNG/GIẢI NGHỆ)" className="bg-popover text-red-500 font-bold" disabled>
                  {ineligibleHorses.map((h) => (
                    <option key={h.id} value={h.id} disabled className="text-muted-foreground/60">
                      {h.name} - {
                        h.approvalStatus === "PENDING" ? "Đang chờ duyệt" :
                        h.approvalStatus === "REJECTED" ? "Bị từ chối duyệt" :
                        h.healthStatus === "INJURED" ? "Chấn thương" :
                        h.healthStatus === "RECOVERING" ? "Đang hồi phục" : "Giải nghệ"
                      }
                    </option>
                  ))}
                </optgroup>
              )}
            </select>

            {/* Selected Horse Details Preview */}
            {selectedHorse && (
              <div className="rounded-xl border border-green-500/20 bg-green-500/5 p-4 flex gap-4 animate-in fade-in slide-in-from-top-1 duration-200">
                <CheckCircle className="size-5 text-green-400 shrink-0 mt-0.5" />
                <div className="text-xs space-y-1">
                  <p className="font-bold text-foreground uppercase text-[13px]">{selectedHorse.name}</p>
                  <p className="text-muted-foreground">
                    Chiến mã ở trạng thái thể lực rất tốt. Đủ điều kiện kỹ thuật để ghi danh thi đấu.
                  </p>
                  <div className="grid grid-cols-2 gap-4 mt-2 pt-2 border-t border-border text-muted-foreground">
                    <p>Tốc độ nền: <span className="text-foreground font-bold">{selectedHorse.baseSpeed} km/h</span></p>
                    <p>Thể lực: <span className="text-foreground font-bold">{selectedHorse.staminaScore}/100</span></p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Buttons */}
      <div className="flex justify-end gap-3 pt-4 border-t border-border">
        <Button
          type="button"
          onClick={onCancel}
          variant="outline"
          className="rounded-xl px-5 h-11 border border-border hover:bg-muted text-foreground"
        >
          Hủy bỏ
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting || !selectedHorseId}
          className="rounded-xl px-6 h-11 bg-primary hover:bg-primary/90 text-primary-foreground flex items-center gap-2 font-bold uppercase text-xs tracking-wider disabled:opacity-40"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Đang gửi hồ sơ...
            </>
          ) : (
            "Gửi yêu cầu đăng ký"
          )}
        </Button>
      </div>
    </form>
  );
}
