"use client";

/**
 * ====================================================================
 * CHỨC NĂNG: DANH SÁCH CHIẾN MÃ CỦA TÔI (OWNER HORSES)
 * QUYỀN SỬ DỤNG: OWNER
 * MÔ TẢ:
 * - Hiển thị danh sách toàn bộ ngựa đua thuộc sở hữu của chủ ngựa.
 * ====================================================================
 */

import Image from "next/image";
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
import {
  Award,
  Clock,
  Loader2,
  PlusCircle,
  ShieldCheck,
  Search,
  Filter,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";

type TabKey = "approved" | "pending";

export default function HorsesStablePage() {
  const [horses, setHorses] = useState<Horse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabKey>("approved");
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  // Filter and Search states
  const [searchQuery, setSearchQuery] = useState("");
  const [filterHealth, setFilterHealth] = useState("ALL"); // ALL, HEALTHY, INJURED, SICK
  const [filterGender, setFilterGender] = useState("ALL"); // ALL, STALLION, MARE, GELDING

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

  const baseHorses =
    activeTab === "approved" ? approvedHorses : pendingOrRejectedHorses;

  // Lọc theo Search, Health, Gender
  const currentHorses = baseHorses.filter((h) => {
    // Search Filter
    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      const matchName = h.name?.toLowerCase().includes(q) || false;
      const matchBreed = h.breed?.toLowerCase().includes(q) || false;
      if (!matchName && !matchBreed) return false;
    }

    // Health Status Filter
    if (filterHealth !== "ALL" && h.healthStatus) {
      if (h.healthStatus.toUpperCase() !== filterHealth) return false;
    }

    // Gender Filter
    if (filterGender !== "ALL" && h.gender) {
      if (h.gender.toUpperCase() !== filterGender) return false;
    }

    return true;
  });

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
        activeColor:
          "text-emerald-700 dark:text-emerald-400 border-emerald-500 bg-emerald-500/10",
      },
      {
        key: "pending",
        label: "Chờ phê duyệt",
        count: pendingOrRejectedHorses.length,
        icon: <Clock className="size-4" />,
        color: "text-muted-foreground",
        activeColor:
          "text-amber-700 dark:text-yellow-400 border-amber-500 bg-amber-500/10",
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

      {/* Filter Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 p-3 bg-white/5 dark:bg-black/20 backdrop-blur-md rounded-2xl border border-white/10 dark:border-white/5 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/70" />
          <input
            type="text"
            placeholder="Tìm theo tên hoặc giống ngựa..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-10 pl-9 pr-4 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-muted-foreground/50"
          />
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Filter className="size-4 text-muted-foreground/70 hidden sm:block" />
          <select
            value={filterHealth}
            onChange={(e) => setFilterHealth(e.target.value)}
            className="h-10 px-3 py-2 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all appearance-none pr-8 relative cursor-pointer"
            style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round' className='lucide lucide-chevron-down'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`, backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1rem' }}
          >
            <option value="ALL" className="bg-background text-foreground">Tất cả tình trạng</option>
            <option value="HEALTHY" className="bg-background text-foreground">Khỏe mạnh</option>
            <option value="INJURED" className="bg-background text-foreground">Bị thương</option>
            <option value="SICK" className="bg-background text-foreground">Đang bệnh</option>
          </select>
          <select
            value={filterGender}
            onChange={(e) => setFilterGender(e.target.value)}
            className="h-10 px-3 py-2 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all appearance-none pr-8 relative cursor-pointer"
            style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round' className='lucide lucide-chevron-down'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`, backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1rem' }}
          >
            <option value="ALL" className="bg-background text-foreground">Tất cả giới tính</option>
            <option value="MALE" className="bg-background text-foreground">Ngựa đực</option>
            <option value="FEMALE" className="bg-background text-foreground">Ngựa cái</option>
            <option value="GELDING" className="bg-background text-foreground">Ngựa thiến</option>
          </select>
        </div>
      </div>

      {/* ── Tab Navigation ── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex bg-muted/30 p-1 rounded-xl border border-border">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === tab.key
                ? `bg-background shadow-sm border border-border ${tab.activeColor}`
                : `hover:bg-muted/50 ${tab.color}`
                }`}
            >
              {tab.icon}
              {tab.label}
              <span
                className={`ml-1 text-xs px-2 py-0.5 rounded-full ${activeTab === tab.key
                  ? "bg-primary/10 text-primary"
                  : "bg-muted-foreground/10"
                  }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Tab Content ── */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 text-foreground/55">
          <Image
            src="/skeletonHorse.gif"
            alt="Đang tải..."
            width={80}
            height={80}
            unoptimized
            className="object-contain mx-auto"
          />
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
