"use client";

import { useEffect, useState } from "react";
import { Brain, CheckCircle, Clock, RefreshCw, ShieldCheck, Zap } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/layout/page-header";
import { aiApi, type AiPackageItem } from "@/lib/api-client";

type MySubscription = {
  _id: string;
  packageId: AiPackageItem | string;
  startDate: string;
  endDate: string;
  status: "ACTIVE" | "EXPIRED" | "CANCELLED";
};

function daysRemaining(endDate: string): number {
  return Math.max(0, Math.ceil((new Date(endDate).getTime() - Date.now()) / 86_400_000));
}

function getPackage(sub: MySubscription): AiPackageItem | null {
  if (typeof sub.packageId === "object") return sub.packageId as AiPackageItem;
  return null;
}

export default function SpectatorAiPackagesPage() {
  const [packages, setPackages] = useState<AiPackageItem[]>([]);
  const [subscription, setSubscription] = useState<MySubscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [subscribing, setSubscribing] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      aiApi.listPackages(),
      aiApi.getMySubscription().catch(() => null),
    ])
      .then(([pkgs, sub]) => {
        setPackages(pkgs.filter((p) => p.status === "ACTIVE"));
        setSubscription(sub as MySubscription | null);
      })
      .catch(() => toast.error("Không thể tải dữ liệu"))
      .finally(() => setLoading(false));
  }, []);

  const handleSubscribe = async (pkg: AiPackageItem) => {
    setSubscribing(pkg._id);
    try {
      const { checkoutUrl } = await aiApi.subscribe(pkg._id);
      window.location.assign(checkoutUrl);
    } catch (e) {
      toast.error((e as Error).message ?? "Không thể khởi tạo thanh toán");
      setSubscribing(null);
    }
  };

  const activePkg = subscription ? getPackage(subscription) : null;

  return (
    <main className="space-y-8">
      <PageHeader
        eyebrow="AI Service"
        title="Gói Dự Đoán AI"
        description="Đăng ký gói dự đoán AI để nhận phân tích kết quả cuộc đua từ hệ thống học máy với độ chính xác cao."
      />

      {/* Active subscription banner */}
      {!loading && subscription && (
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-5 flex flex-wrap items-center gap-4">
          <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-500/10 shrink-0">
            <ShieldCheck className="size-5 text-emerald-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-emerald-400">Subscription đang hoạt động</p>
            <p className="text-sm text-muted-foreground mt-0.5">
              {activePkg ? (
                <span>Gói <strong className="text-foreground">{activePkg.name}</strong> · </span>
              ) : null}
              Hết hạn{" "}
              <strong className="text-foreground">
                {new Date(subscription.endDate).toLocaleDateString("vi-VN")}
              </strong>{" "}
              <span className="text-emerald-400">
                ({daysRemaining(subscription.endDate)} ngày còn lại)
              </span>
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-400">
            <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
            ACTIVE
          </span>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20 text-muted-foreground text-sm">Đang tải gói AI...</div>
      ) : packages.length === 0 ? (
        <div className="flex items-center justify-center py-20 text-muted-foreground text-sm">
          Hiện chưa có gói AI nào. Vui lòng quay lại sau.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {packages.map((pkg) => {
            const isCurrentPkg = activePkg?._id === pkg._id;
            const hasAnySub = !!subscription;

            return (
              <div
                key={pkg._id}
                className={`relative flex flex-col rounded-2xl border bg-card p-6 transition-colors ${isCurrentPkg ? "border-emerald-500/40 ring-1 ring-emerald-500/20" : "border-border hover:border-primary/40"}`}
              >
                {isCurrentPkg && (
                  <div className="absolute -top-3 left-4">
                    <span className="rounded-full border border-emerald-500/40 bg-card px-2.5 py-0.5 text-[11px] font-bold text-emerald-400">
                      Đang dùng
                    </span>
                  </div>
                )}

                <div className="mb-4 flex items-center justify-between">
                  <div className={`flex size-10 items-center justify-center rounded-xl ${isCurrentPkg ? "bg-emerald-500/10" : "bg-primary/10"}`}>
                    <Brain className={`size-5 ${isCurrentPkg ? "text-emerald-400" : "text-primary"}`} />
                  </div>
                  {pkg.accuracyRate != null && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-400/10 px-2.5 py-1 text-[11px] font-bold text-emerald-400 border border-emerald-400/20">
                      <Zap className="size-3" />
                      {pkg.accuracyRate}% chính xác
                    </span>
                  )}
                </div>

                <h3 className="text-base font-bold text-foreground mb-1">{pkg.name}</h3>
                {pkg.description && (
                  <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{pkg.description}</p>
                )}

                <div className="mt-auto space-y-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="size-4 shrink-0" />
                    <span>Hiệu lực <strong className="text-foreground">{pkg.durationDays} ngày</strong></span>
                  </div>

                  <ul className="space-y-1.5 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2"><CheckCircle className="size-4 text-emerald-400 shrink-0" /> Dự đoán thứ hạng ngựa</li>
                    <li className="flex items-center gap-2"><CheckCircle className="size-4 text-emerald-400 shrink-0" /> Xác suất thắng từng ngựa</li>
                    <li className="flex items-center gap-2"><CheckCircle className="size-4 text-emerald-400 shrink-0" /> Phân tích điểm sức mạnh</li>
                  </ul>

                  <div className="pt-2 border-t border-border">
                    <p className="text-2xl font-black text-primary mb-3">
                      {pkg.price.toLocaleString("vi-VN")} <span className="text-sm font-normal text-muted-foreground">VND</span>
                    </p>
                    <button
                      onClick={() => { void handleSubscribe(pkg); }}
                      disabled={subscribing === pkg._id}
                      className={`w-full rounded-xl py-2.5 text-sm font-semibold transition disabled:opacity-50 flex items-center justify-center gap-2 ${isCurrentPkg ? "border border-emerald-500/40 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20" : "bg-primary text-primary-foreground hover:bg-primary/90"}`}
                    >
                      {subscribing === pkg._id ? (
                        "Đang chuyển hướng..."
                      ) : isCurrentPkg ? (
                        <><RefreshCw className="size-4" /> Gia hạn</>
                      ) : hasAnySub ? (
                        "Chuyển gói"
                      ) : (
                        "Mua ngay"
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
