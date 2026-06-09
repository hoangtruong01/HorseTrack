"use client";

import { PageHeader } from "@/components/layout/page-header";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { HorseCard, type Horse } from "@/features/horses/components/horse-card";
import { Award, Clock, Loader2, PlusCircle, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";

type TabKey = "approved" | "pending";

export default function HorsesStablePage() {
  const [horses, setHorses] = useState<Horse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabKey>("approved");
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  const fetchHorses = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/owner/horses");
      if (response.ok) {
        const resData = await response.json();
        if (resData.success) {
          const rawList = resData.data?.data || resData.data || [];
          const normalized = rawList.map((h: Horse & { _id?: string }) => ({
            ...h,
            id: h.id || h._id,
          }));
          setHorses(normalized);
        }
      } else {
        toast.error("Không thể lấy danh sách chiến mã từ server.");
      }
    } catch (err) {
      console.error("Lỗi lấy danh sách ngựa:", err);
      toast.error("Kết nối tới Backend thất bại.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void fetchHorses();
  }, []);

  const handleDelete = (id: string) => {
    setDeleteTargetId(id);
  };

  const confirmDelete = async () => {
    if (!deleteTargetId) return;
    try {
      const response = await fetch(`/api/owner/horses/${deleteTargetId}`, {
        method: "DELETE",
      });

      const resData = await response.json();

      if (response.ok && resData.success) {
        toast.success("Đã xóa chiến mã thành công.");
        fetchHorses();
      } else {
        toast.error(resData.message || "Xóa chiến mã thất bại.");
      }
    } catch (err) {
      console.error("Lỗi xóa ngựa:", err);
      toast.error("Lỗi kết nối tới Backend.");
    } finally {
      setDeleteTargetId(null);
    }
  };

  // Lọc danh sách chiến mã theo trạng thái duyệt
  const approvedHorses = horses.filter(
    (h) => h.approvalStatus === "APPROVED" || !h.approvalStatus,
  );
  const pendingOrRejectedHorses = horses.filter(
    (h) => h.approvalStatus === "PENDING" || h.approvalStatus === "REJECTED",
  );

  const currentHorses =
    activeTab === "approved" ? approvedHorses : pendingOrRejectedHorses;

  const tabs: {
    key: TabKey;
    label: string;
    count: number;
    icon: React.ReactNode;
    color: string;
    activeColor: string;
  }[] = [
    {
      key: "approved",
      label: "Chuồng đua chính thức",
      count: approvedHorses.length,
      icon: <ShieldCheck className="size-4" />,
      color: "text-muted-foreground",
      activeColor: "text-emerald-400 border-emerald-500 bg-emerald-500/5",
    },
    {
      key: "pending",
      label: "Chờ phê duyệt",
      count: pendingOrRejectedHorses.length,
      icon: <Clock className="size-4" />,
      color: "text-muted-foreground",
      activeColor: "text-yellow-400 border-yellow-500 bg-yellow-500/5",
    },
  ];

  return (
    <main className="space-y-6 max-w-6xl mx-auto">
      <PageHeader
        eyebrow="Quản lý chuồng đua"
        title="Danh Sách Chiến Mã"
        description="Quản lý hồ sơ kỹ thuật, trạng thái sức khỏe của từng chiến mã. Chiến mã phải được phê duyệt và khỏe mạnh mới đủ điều kiện đăng ký tham dự giải đấu."
        actions={
          <Button
            asChild
            className="rounded-full bg-[#E10600] hover:bg-[#B80500] text-foreground"
          >
            <Link href="/owner/horses/new">
              Thêm chiến mã
              <PlusCircle className="size-4 ml-1.5" />
            </Link>
          </Button>
        }
      />

      {/* ── Tab Navigation ── */}
      <div className="flex gap-2 border-b border-border pb-0">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`
                relative flex items-center gap-2 px-5 py-3 text-sm font-bold uppercase tracking-wider
                transition-all duration-200 border-b-2 -mb-[1px] rounded-t-xl
                ${
                  isActive
                    ? tab.activeColor
                    : `${tab.color} border-transparent hover:text-foreground/80 hover:bg-muted02]`
                }
              `}
            >
              {tab.icon}
              <span className="hidden sm:inline">{tab.label}</span>
              <span
                className={`
                inline-flex items-center justify-center min-w-[22px] h-[22px] rounded-full px-1.5
                text-[11px] font-black tabular-nums
                ${
                  isActive
                    ? tab.key === "approved"
                      ? "bg-emerald-500/20 text-emerald-300"
                      : "bg-yellow-500/20 text-yellow-300"
                    : "bg-muted06] text-muted-foreground/60"
                }
              `}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── Tab Content ── */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 text-foreground/55">
          <Loader2 className="size-8 animate-spin text-[#E10600]" />
          <p className="mt-4 text-xs font-mono uppercase tracking-widest">
            Đang tải dữ liệu chuồng ngựa...
          </p>
        </div>
      ) : currentHorses.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card/85 p-12 text-center shadow-[0_18px_56px_rgba(0,0,0,0.28)]">
          {activeTab === "approved" ? (
            <>
              <Award className="size-16 text-foreground/15 mx-auto mb-4 stroke-[1]" />
              <h3 className="text-xl font-black text-foreground uppercase tracking-tight mb-2">
                Chuồng chính trống
              </h3>
              <p className="text-sm text-muted-foreground max-w-md mx-auto mb-6">
                Bạn chưa có chiến mã nào được phê duyệt hoạt động. Vui lòng thêm
                chiến mã mới hoặc đợi Admin duyệt hồ sơ.
              </p>
              <Button
                asChild
                className="rounded-full bg-[#E10600] hover:bg-[#B80500] text-foreground"
              >
                <Link href="/owner/horses/new">
                  Thêm chiến mã ngay
                  <PlusCircle className="size-4 ml-1.5" />
                </Link>
              </Button>
            </>
          ) : (
            <>
              <Clock className="size-16 text-foreground/15 mx-auto mb-4 stroke-[1]" />
              <h3 className="text-xl font-black text-foreground uppercase tracking-tight mb-2">
                Không có hồ sơ chờ duyệt
              </h3>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                Tất cả chiến mã của bạn đã được phê duyệt hoặc bạn chưa đăng ký
                chiến mã mới.
              </p>
            </>
          )}
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {currentHorses.map((horse) => (
            <HorseCard key={horse.id} horse={horse} onDelete={handleDelete} />
          ))}
        </div>
      )}
      <AlertDialog
        open={!!deleteTargetId}
        onOpenChange={(open) => !open && setDeleteTargetId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa chiến mã</AlertDialogTitle>
            <AlertDialogDescription>
              Hành động này không thể hoàn tác. Chiến mã sẽ bị xóa vĩnh viễn
              khỏi chuồng của bạn.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy bỏ</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>
              Xóa chiến mã
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  );
}
