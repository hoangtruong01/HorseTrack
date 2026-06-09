"use client";

import { useState } from "react";
import { Loader2, AlertCircle, XOctagon, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { toast } from "sonner";

export type Registration = {
  id: string;
  tournamentId: string;
  tournamentName?: string;
  raceId: string;
  raceName?: string;
  horseId: string;
  horseName?: string;
  ownerId: string;
  status: "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED" | "WITHDRAWN";
  note?: string;
  rejectedReason?: string;
  createdAt: string;
};

type OwnerRegistrationTableProps = {
  registrations: Registration[];
  onRefresh: () => void;
};

const statusMeta: Record<
  Registration["status"],
  { label: string; tone: "yellow" | "green" | "red" | "slate" | "teal" }
> = {
  PENDING: { label: "Chờ duyệt", tone: "yellow" },
  APPROVED: { label: "Đã duyệt", tone: "green" },
  REJECTED: { label: "Từ chối", tone: "red" },
  CANCELLED: { label: "Đã hủy", tone: "slate" },
  WITHDRAWN: { label: "Đã rút", tone: "slate" },
};

export function OwnerRegistrationTable({
  registrations,
  onRefresh,
}: OwnerRegistrationTableProps) {
  const [processingId, setProcessingId] = useState<string | null>(null);

  const handleAction = async (id: string, actionType: "cancel" | "withdraw") => {
    setProcessingId(id);
    try {
      const response = await fetch(`/api/owner/registrations/${id}/${actionType}`, {
        method: "PATCH",
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Thao tác thất bại.");
      }

      toast.success(actionType === "cancel" ? "Đã hủy đăng ký thành công" : "Đã rút đăng ký thành công");
      onRefresh();
    } catch (err) {
      toast.error((err as Error).message || "Có lỗi xảy ra. Vui lòng thử lại.");
    } finally {
      setProcessingId(null);
    }
  };

  if (registrations.length === 0) {
    return (
      <div className="rounded-2xl border border-border bg-card p-8 text-center shadow-sm">
        <AlertCircle className="size-10 text-muted-foreground/60 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-foreground mb-1">Chưa có đăng ký nào</h3>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          Chiến mã của bạn chưa đăng ký tham gia trận đua nào. Hãy vào mục &quot;Đăng ký giải đấu&quot; để lựa chọn trận đấu phù hợp!
        </p>
      </div>
    );
  }

  return (
    <section className="rounded-2xl border border-border bg-card p-4 shadow-lg sm:p-6">
      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="min-w-[900px] w-full text-left text-sm">
          <thead className="bg-muted/60 text-xs uppercase tracking-[0.18em] text-muted-foreground">
            <tr>
              <th className="px-5 py-4">Chiến mã</th>
              <th className="px-5 py-4">Trận đua / Giải đấu</th>
              <th className="px-5 py-4">Ngày đăng ký</th>
              <th className="px-5 py-4">Trạng thái</th>
              <th className="px-5 py-4">Ghi chú duyệt</th>
              <th className="px-5 py-4">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border bg-card">
            {registrations.map((registration) => {
              const meta = statusMeta[registration.status] || { label: registration.status, tone: "slate" };
              const showCancel = registration.status === "PENDING" || registration.status === "REJECTED";
              const showWithdraw = registration.status === "APPROVED";

              return (
                <tr
                  key={registration.id}
                  className="transition hover:bg-muted/[0.02]"
                >
                  <td className="px-5 py-4 font-black uppercase text-foreground">
                    {registration.horseName || "Không rõ tên"}
                  </td>
                  <td className="px-5 py-4">
                    <p className="font-bold text-foreground">{registration.raceName || "Không rõ trận đua"}</p>
                    <p className="text-xs text-muted-foreground/60 mt-0.5">{registration.tournamentName || "Giải đấu tự do"}</p>
                  </td>
                  <td className="px-5 py-4 font-mono text-muted-foreground">
                    {new Date(registration.createdAt).toLocaleDateString("vi-VN", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </td>
                  <td className="px-5 py-4">
                    <StatusBadge
                      label={meta.label}
                      tone={meta.tone}
                      pulse={registration.status === "PENDING"}
                    />
                  </td>
                  <td className="px-5 py-4 text-muted-foreground max-w-[200px] truncate">
                    {registration.status === "REJECTED" ? (
                      <span className="text-red-400 font-semibold">{registration.rejectedReason || "Bị từ chối"}</span>
                    ) : (
                      registration.note || "—"
                    )}
                  </td>
                  <td className="px-5 py-4">
                    {showCancel && (
                      <Button
                        size="sm"
                        disabled={processingId === registration.id}
                        onClick={() => handleAction(registration.id, "cancel")}
                        className="rounded-lg text-xs py-1.5 h-8 bg-muted/5 hover:bg-red-950/40 text-foreground border border-border/10 hover:text-[#E10600]"
                      >
                        {processingId === registration.id ? (
                          <Loader2 className="size-3.5 animate-spin" />
                        ) : (
                          <>
                            <XOctagon className="size-3.5 mr-1" />
                            Hủy đăng ký
                          </>
                        )}
                      </Button>
                    )}
                    {showWithdraw && (
                      <Button
                        size="sm"
                        disabled={processingId === registration.id}
                        onClick={() => handleAction(registration.id, "withdraw")}
                        className="rounded-lg text-xs py-1.5 h-8 bg-muted/5 hover:bg-red-950/40 text-foreground border border-border/10 hover:text-red-400"
                      >
                        {processingId === registration.id ? (
                          <Loader2 className="size-3.5 animate-spin" />
                        ) : (
                          <>
                            <RotateCcw className="size-3.5 mr-1" />
                            Rút tên
                          </>
                        )}
                      </Button>
                    )}
                    {!showCancel && !showWithdraw && (
                      <span className="text-xs text-muted-foreground/60 italic">Không thể thay đổi</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
