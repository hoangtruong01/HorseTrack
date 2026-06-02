"use client";

import Link from "next/link";
import { ShieldAlert, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CounterDepositPage() {
  return (
    <main className="flex min-h-[60vh] flex-col items-center justify-center space-y-6 text-center px-4 animate-[fadeIn_0.5s_ease-out]">
      <div className="relative">
        <div className="absolute inset-0 rounded-full bg-red-500/10 blur-2xl animate-pulse"></div>
        <div className="relative flex size-20 items-center justify-center rounded-full border border-red-500/30 bg-red-500/10 text-red-400">
          <ShieldAlert className="size-10" />
        </div>
      </div>

      <div className="max-w-md space-y-2">
        <h2 className="text-xl font-black uppercase tracking-widest text-white">
          Quyền Truy Cập Bị Vô Hiệu Hóa
        </h2>
        <p className="text-sm text-muted-foreground leading-relaxed font-semibold">
          Chức năng nạp ví trực tiếp tại quầy đã bị đóng hoàn toàn theo quy chế nghiệp vụ mới. Nhân viên quầy không được phép tự ý nạp điểm/tiền trực tuyến vào tài khoản.
        </p>
      </div>

      <div className="pt-2">
        <Link href="/counter-staff">
          <Button className="h-11 rounded-full bg-primary hover:bg-[#B80500] font-black uppercase tracking-wider text-white shadow-[0_4px_16px_rgba(225,6,0,0.3)] px-6 transition">
            <ArrowLeft className="mr-2 size-4" /> Quay lại bàn làm việc
          </Button>
        </Link>
      </div>
    </main>
  );
}
