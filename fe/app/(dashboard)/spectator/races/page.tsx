"use client";

/**
 * ====================================================================
 * CHỨC NĂNG: DANH SÁCH TRẬN ĐUA & ĐẶT CƯỢC (RACES & BETTING)
 * QUYỀN SỬ DỤNG: SPECTATOR
 * MÔ TẢ:
 * - Xem lịch đua trực tiếp và thực hiện các lệnh đặt cược (Betting) vào các con ngựa yêu thích.
 * ====================================================================
 */
import Image from "next/image";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function SpectatorRacesRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/spectator/tournaments?tab=races");
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center py-20 text-white/55">
      <Image src="/skeletonHorse.gif" alt="Đang tải..." width={80} height={80} unoptimized className="object-contain mx-auto" />
      <p className="mt-4 text-xs font-mono uppercase tracking-widest">Đang chuyển hướng sang trang Giải Đấu & Lịch Đua...</p>
    </div>
  );
}
