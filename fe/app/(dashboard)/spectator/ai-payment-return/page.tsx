"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import Link from "next/link";
import { CheckCircle, XCircle } from "lucide-react";

function PaymentReturnContent() {
  const params = useSearchParams();
  const status = params.get("status");
  const orderCode = params.get("orderCode");

  const isSuccess = status === "PAID";

  return (
    <main className="flex min-h-[60vh] items-center justify-center">
      <div className="rounded-2xl border border-border bg-card p-10 text-center space-y-5 max-w-md w-full">
        {isSuccess ? (
          <>
            <CheckCircle className="size-14 text-emerald-400 mx-auto" />
            <div>
              <h1 className="text-xl font-black text-foreground">Thanh toán thành công!</h1>
              <p className="text-sm text-muted-foreground mt-2">
                Gói AI của bạn đã được kích hoạt.
                {orderCode && <span className="block mt-1">Mã đơn hàng: <strong className="text-foreground font-mono">{orderCode}</strong></span>}
              </p>
            </div>
            <Link
              href="/spectator/ai-predictions"
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition"
            >
              Xem dự đoán AI ngay
            </Link>
          </>
        ) : (
          <>
            <XCircle className="size-14 text-red-400 mx-auto" />
            <div>
              <h1 className="text-xl font-black text-foreground">Thanh toán thất bại</h1>
              <p className="text-sm text-muted-foreground mt-2">
                Giao dịch bị hủy hoặc không thành công. Bạn có thể thử lại.
                {orderCode && <span className="block mt-1">Mã đơn hàng: <strong className="text-foreground font-mono">{orderCode}</strong></span>}
              </p>
            </div>
            <Link
              href="/spectator/ai-packages"
              className="inline-flex items-center gap-2 rounded-xl border border-border bg-muted px-6 py-2.5 text-sm font-semibold text-foreground hover:bg-white/[0.06] transition"
            >
              Quay lại trang gói AI
            </Link>
          </>
        )}
      </div>
    </main>
  );
}

export default function AiPaymentReturnPage() {
  return (
    <Suspense fallback={<div className="flex min-h-[60vh] items-center justify-center text-muted-foreground text-sm">Đang xử lý...</div>}>
      <PaymentReturnContent />
    </Suspense>
  );
}
