"use client";

import { useState } from "react";
import { Loader2, Award, ShieldAlert, CheckCircle } from "lucide-react";
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
    (h) => h.healthStatus === "HEALTHY"
  );
  
  const ineligibleHorses = horses.filter(
    (h) => h.healthStatus !== "HEALTHY"
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
    } catch (err: any) {
      setErrorMsg(err.message || "Đăng ký tham gia trận đua thất bại.");
    }
  };

  const selectedHorse = horses.find((h) => h.id === selectedHorseId);

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 bg-[#15151E] border border-white/10 rounded-2xl p-6 md:p-8 shadow-[0_18px_56px_rgba(0,0,0,0.28)] max-w-2xl mx-auto"
    >
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
          Đăng ký trận đua
        </p>
        <h2 className="mt-2 text-2xl font-black uppercase tracking-tight text-white">
          Thủ tục ghi tên chiến mã
        </h2>
      </div>

      {errorMsg && (
        <div className="rounded-xl border border-[#E10600] bg-[#E10600]/10 p-4 text-sm text-[#E0DEDC]">
          <span className="font-bold text-[#E10600] uppercase block mb-1">Lỗi đăng ký</span>
          {errorMsg}
        </div>
      )}

      {/* Race Overview Card */}
      <div className="rounded-xl border border-white/5 bg-white/[0.01] p-4 space-y-3">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-black text-lg text-white uppercase">{race.name}</h3>
            <p className="text-xs text-white/40 uppercase tracking-widest">{race.tournamentName || "Giải tự do"}</p>
          </div>
          <span className="text-xs font-mono text-white/60 bg-white/5 border border-white/10 px-2 py-1 rounded">
            {race.distance} · {race.surface}
          </span>
        </div>
        
        <div className="grid grid-cols-2 gap-4 text-xs text-white/60 pt-2 border-t border-white/5">
          <div>
            <span className="text-white/30 block uppercase tracking-widest text-[9px] mb-0.5">Thời gian</span>
            <p className="text-white font-mono font-bold">{race.date} · {race.startTime}</p>
          </div>
          <div>
            <span className="text-white/30 block uppercase tracking-widest text-[9px] mb-0.5">Số lượng tham gia</span>
            <p className="text-white font-mono font-bold">{race.participantsCount || 0}/{race.capacity || 20} chiến mã</p>
          </div>
        </div>
      </div>

      {/* Horse Selection Section */}
      <div className="space-y-3">
        <label className="text-xs font-black uppercase tracking-[0.16em] text-white/55">
          Lựa chọn Chiến Mã Đăng Ký
        </label>
        
        {horses.length === 0 ? (
          <div className="rounded-xl border border-white/5 bg-white/[0.01] p-6 text-center text-sm text-white/40">
            Bạn chưa đăng ký chiến mã nào trong hệ thống. Vui lòng thêm chiến mã vào chuồng trước khi đăng ký trận đua.
          </div>
        ) : (
          <div className="space-y-4">
            <select
              value={selectedHorseId}
              onChange={(e) => setSelectedHorseId(e.target.value)}
              className="h-11 w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 text-sm text-white placeholder:text-white/30 outline-none transition focus:border-[#E10600] focus:ring-4 focus:ring-[#E10600]/15"
            >
              <option value="" className="bg-[#15151E]">-- Chọn chiến mã khỏe mạnh --</option>
              
              {/* Eligible Horses group */}
              {eligibleHorses.length > 0 && (
                <optgroup label="ĐỦ ĐIỀU KIỆN ĐĂNG KÝ" className="bg-[#15151E] text-green-400 font-bold">
                  {eligibleHorses.map((h) => (
                    <option key={h.id} value={h.id} className="text-white">
                      {h.name} ({h.breed || "Không rõ giống"}) - Tốc độ: {h.baseSpeed} km/h
                    </option>
                  ))}
                </optgroup>
              )}

              {/* Ineligible Horses group */}
              {ineligibleHorses.length > 0 && (
                <optgroup label="KHÔNG ĐỦ ĐIỀU KIỆN (CHẤN THƯƠNG/GIẢI NGHỆ)" className="bg-[#15151E] text-red-500 font-bold" disabled>
                  {ineligibleHorses.map((h) => (
                    <option key={h.id} value={h.id} disabled className="text-white/30">
                      {h.name} - {h.healthStatus === "INJURED" ? "Chấn thương" : h.healthStatus === "RECOVERING" ? "Đang hồi phục" : "Giải nghệ"}
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
                  <p className="font-bold text-white uppercase text-[13px]">{selectedHorse.name}</p>
                  <p className="text-white/60">
                    Chiến mã ở trạng thái thể lực rất tốt. Đủ điều kiện kỹ thuật để ghi danh thi đấu.
                  </p>
                  <div className="grid grid-cols-2 gap-4 mt-2 pt-2 border-t border-white/5 text-white/50">
                    <p>Tốc độ nền: <span className="text-white font-bold">{selectedHorse.baseSpeed} km/h</span></p>
                    <p>Thể lực: <span className="text-white font-bold">{selectedHorse.staminaScore}/100</span></p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Buttons */}
      <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
        <Button
          type="button"
          onClick={onCancel}
          variant="outline"
          className="rounded-xl px-5 h-11 border border-white/10 hover:bg-white/5 text-white"
        >
          Hủy bỏ
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting || !selectedHorseId}
          className="rounded-xl px-6 h-11 bg-[#E10600] hover:bg-[#B80500] text-white flex items-center gap-2 font-bold uppercase text-xs tracking-wider disabled:opacity-40"
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
