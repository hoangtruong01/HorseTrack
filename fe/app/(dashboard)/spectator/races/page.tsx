"use client";

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
      <Loader2 className="size-8 animate-spin text-[#E10600]" />
      <p className="mt-4 text-xs font-mono uppercase tracking-widest">Đang chuyển hướng sang trang Giải Đấu & Lịch Đua...</p>
    </div>
  );
}
