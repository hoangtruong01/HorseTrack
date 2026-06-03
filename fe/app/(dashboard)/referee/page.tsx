"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  ClipboardList,
  FileText,
  Flag,
  Home,
  ShieldCheck,
  Siren,
  Sparkles,
  User,
  CheckCircle2,
  XCircle,
  Clock,
  ShieldAlert,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/layout/page-header";
import { StatusBadge } from "@/components/ui/status-badge";
import { toast } from "sonner";

// Types
type UserInfo = {
  _id: string;
  fullName: string;
  email: string;
  phone?: string;
  roles: string[];
};

type RefereeProfileInfo = {
  _id: string;
  licenseNumber: string;
  experienceYears: number;
  bio?: string;
};

type RaceInfo = {
  _id: string;
  name: string;
  startTime: string;
  status: string;
};

type Assignment = {
  _id: string;
  role: "main" | "assistant";
  status: "assigned" | "accepted" | "declined" | "removed";
  raceId: RaceInfo;
  assignedBy: {
    _id: string;
    fullName: string;
  };
  createdAt: string;
};

export default function RefereeDashboardPage() {
  const { t } = useTranslation();
  const [user, setUser] = useState<UserInfo | null>(null);
  const [profile, setProfile] = useState<RefereeProfileInfo | null>(null);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmittingProfile, setIsSubmittingProfile] = useState(false);
  const [submittingActionId, setSubmittingActionId] = useState<string | null>(null);

  // Profile creation form state
  const [licenseNumber, setLicenseNumber] = useState("");
  const [experienceYears, setExperienceYears] = useState(1);
  const [bio, setBio] = useState("");

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // 1. Fetch user general info
      const userRes = await fetch("/api/auth/me");
      if (!userRes.ok) throw new Error("Không thể tải thông tin cá nhân");
      const userData = await userRes.json();
      setUser(userData.user);

      // 2. Fetch referee profile info
      const profileRes = await fetch("/api/referee/referee-profiles/me");
      if (profileRes.ok) {
        const profileData = await profileRes.json();
        setProfile(profileData.data);
      } else if (profileRes.status === 404) {
        setProfile(null); // No profile created yet
      }

      // 3. Fetch assignments
      const assigmentsRes = await fetch("/api/referee/referee-assignments/my-assignments?limit=50");
      if (assigmentsRes.ok) {
        const assignmentsData = await assigmentsRes.json();
        setAssignments(assignmentsData.data?.data || []);
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Không thể tải dữ liệu trọng tài.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!licenseNumber.trim()) {
      toast.error("Vui lòng nhập số giấy phép trọng tài");
      return;
    }

    setIsSubmittingProfile(true);
    try {
      const res = await fetch("/api/referee/referee-profiles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          licenseNumber,
          experienceYears: Number(experienceYears),
          bio,
        }),
      });

      const resData = await res.json();
      if (!res.ok) {
        throw new Error(resData.message || "Tạo hồ sơ trọng tài thất bại");
      }

      toast.success("Tạo hồ sơ trọng tài thành công!");
      await fetchData();
    } catch (err: any) {
      toast.error(err.message || "Lỗi tạo hồ sơ.");
    } finally {
      setIsSubmittingProfile(false);
    }
  };

  const handleRespond = async (assignmentId: string, status: "ACCEPTED" | "REJECTED") => {
    setSubmittingActionId(assignmentId);
    const actionLabel = status === "ACCEPTED" ? "Chấp nhận" : "Từ chối";
    try {
      const res = await fetch(`/api/referee/referee-assignments/${assignmentId}/respond`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      const resData = await res.json();
      if (!res.ok) {
        throw new Error(resData.message || `Thao tác ${actionLabel.toLowerCase()} thất bại`);
      }

      toast.success(`${actionLabel} phân công thi đấu thành công!`);
      await fetchData();
    } catch (err: any) {
      toast.error(err.message || "Lỗi khi xử lý thao tác.");
    } finally {
      setSubmittingActionId(null);
    }
  };

  const formatDateTime = (dateStr?: string) => {
    if (!dateStr) return "Chưa xác định";
    const d = new Date(dateStr);
    return `${d.toLocaleTimeString("vi-VN", { hour: '2-digit', minute: '2-digit' })} ngày ${d.toLocaleDateString("vi-VN")}`;
  };

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="size-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  // Filter assignments
  const pendingAssignments = assignments.filter((a) => a.status === "assigned");
  const acceptedAssignments = assignments.filter((a) => a.status === "accepted");
  const activeAssignment = acceptedAssignments.find(
    (a) => a.raceId?.status === "READY" || a.raceId?.status === "LIVE" || a.raceId?.status === "CHECKING"
  ) || acceptedAssignments[0] || assignments[0];

  return (
    <main className="space-y-6 max-w-6xl mx-auto px-4 sm:px-6">
      <PageHeader
        eyebrow={t("referee.header.eyebrow")}
        title={t("referee.header.title")}
        description={t("referee.header.description")}
      />

      {/* Profile Check / Greeting */}
      {!profile ? (
        <section className="relative overflow-hidden rounded-3xl border border-primary/30 dark:bg-[#15151E] bg-card p-6 shadow-2xl">
          <div className="absolute inset-0 dark:bg-[linear-gradient(120deg,rgba(225,6,0,0.1),transparent_35%)] bg-card" />
          <div className="relative space-y-4 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="inline-flex rounded-full border border-primary/40 bg-primary/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.18em] text-primary">
                {t("referee.profileCheck.badge")}
              </span>
            </div>
            <h2 className="text-xl font-black uppercase dark:text-white text-foreground sm:text-2xl">
              {t("referee.profileCheck.title")}
            </h2>
            <p className="text-xs dark:text-white/60 text-muted-foreground leading-relaxed">
              {t("referee.profileCheck.desc").replace("{name}", user?.fullName || "")}
            </p>
            <form onSubmit={handleCreateProfile} className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 items-end dark:bg-black/25 bg-muted/20 p-4 rounded-xl border dark:border-white/5 border-border">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase dark:text-white/50 text-muted-foreground">{t("referee.profileCheck.license")}</label>
                <input
                  type="text"
                  value={licenseNumber}
                  onChange={(e) => setLicenseNumber(e.target.value)}
                  placeholder="Ví dụ: RF-7799"
                  className="w-full rounded-lg border dark:border-white/10 border-border dark:bg-white/5 bg-muted/50 px-3 py-2 text-xs dark:text-white text-foreground placeholder-white/35 focus:border-primary focus:outline-none"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase dark:text-white/50 text-muted-foreground">{t("referee.profileCheck.experience")}</label>
                <input
                  type="number"
                  min={1}
                  max={50}
                  value={experienceYears}
                  onChange={(e) => setExperienceYears(Number(e.target.value))}
                  className="w-full rounded-lg border dark:border-white/10 border-border dark:bg-white/5 bg-muted/50 px-3 py-2 text-xs dark:text-white text-foreground focus:border-primary focus:outline-none"
                  required
                />
              </div>
              <div className="space-y-1.5 sm:col-span-2 lg:col-span-3">
                <label className="text-[10px] font-bold uppercase dark:text-white/50 text-muted-foreground">{t("referee.profileCheck.bio")}</label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Ghi chú về kinh nghiệm làm việc hoặc các trận chung kết quốc gia đã điều hành..."
                  rows={2}
                  className="w-full rounded-lg border dark:border-white/10 border-border dark:bg-white/5 bg-muted/50 px-3 py-2 text-xs dark:text-white text-foreground placeholder-white/35 focus:border-primary focus:outline-none resize-none"
                />
              </div>
              <div className="sm:col-span-2 lg:col-span-3 flex justify-end">
                <Button
                  type="submit"
                  disabled={isSubmittingProfile}
                  className="rounded-full bg-primary hover:bg-primary-dark font-black uppercase text-xs h-10 px-6 text-white"
                >
                  {isSubmittingProfile ? t("referee.profileCheck.submitting") : t("referee.profileCheck.submit")}
                </Button>
              </div>
            </form>
          </div>
        </section>
      ) : (
        <section className="relative overflow-hidden rounded-3xl border dark:border-white/10 border-border dark:bg-[#15151E] bg-card p-5 shadow-[0_24px_80px_rgba(0,0,0,0.36)] sm:p-7">
          <div className="absolute inset-0 dark:bg-[linear-gradient(125deg,rgba(225,6,0,0.22),transparent_35%),radial-gradient(circle_at_85%_20%,rgba(6,126,106,0.15),transparent_25rem)] bg-card" />
          <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <span className="inline-flex rounded-full border border-primary/40 bg-primary/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.18em] text-primary">
                {t("referee.dashboard.badge")}
              </span>
              <h2 className="mt-3 text-3xl font-black uppercase tracking-tight dark:text-white text-foreground leading-none">
                {t("referee.dashboard.title")}
              </h2>
              <p className="mt-2 text-xs dark:text-white/50 text-muted-foreground leading-relaxed max-w-xl">
                {t("referee.dashboard.desc")}
              </p>
            </div>
            <div className="rounded-2xl border dark:border-white/10 border-border dark:bg-black/25 bg-muted/20 p-4 shrink-0 min-w-[240px]">
              <p className="text-[10px] uppercase tracking-[0.18em] dark:text-white/45 text-muted-foreground">{t("referee.dashboard.licenseInfo")}</p>
              <p className="mt-1 text-lg font-black uppercase dark:text-white text-foreground flex items-center gap-1.5">
                <User className="size-4 text-primary" />
                {user?.fullName}
              </p>
              <p className="mt-1 text-xs dark:text-white/60 text-muted-foreground">
                License: <strong className="text-teal-400">{profile.licenseNumber}</strong> · {profile.experienceYears} năm kinh nghiệm
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Alert Pending Assignments */}
      {pendingAssignments.length > 0 && (
        <section className="rounded-2xl border border-yellow-500/30 bg-yellow-500/5 p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <ShieldAlert className="size-5 text-yellow-500 shrink-0" />
            <div>
              <h4 className="text-xs font-black uppercase dark:text-white text-foreground">Yêu cầu phân công mới!</h4>
              <p className="text-[10px] dark:text-white/60 text-muted-foreground mt-0.5">Bạn đang có {pendingAssignments.length} cuộc đua mới được Ban tổ chức chỉ định cần phê duyệt.</p>
            </div>
          </div>
          <Link href="/referee/assignments">
            <Button className="h-9 px-4 rounded-full bg-yellow-500 hover:bg-yellow-600 text-black text-xs font-bold uppercase">
              Phê duyệt ngay
            </Button>
          </Link>
        </section>
      )}

      {/* Next required action center */}
      {profile && activeAssignment && (
        <section className="grid gap-6 md:grid-cols-[1.2fr_0.8fr]">
          <article className="rounded-2xl border border-primary/25 dark:bg-[linear-gradient(135deg,rgba(225,6,0,0.12),rgba(21,21,30,0.95))] bg-card p-5 flex flex-col justify-between space-y-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-primary">
                NHIỆM VỤ TIẾP THEO
              </p>
              <h3 className="mt-2 text-2xl font-black uppercase dark:text-white text-foreground leading-tight">
                {activeAssignment.raceId?.name}
              </h3>
              <p className="mt-1 text-xs dark:text-white/50 text-muted-foreground flex items-center gap-1.5">
                <Clock className="size-3.5" />
                {formatDateTime(activeAssignment.raceId?.startTime)}
              </p>
              <div className="mt-2 flex items-center gap-2">
                <span className="text-xs dark:text-white/70 text-muted-foreground">Vai trò: <strong>{activeAssignment.role === "main" ? "Trọng tài chính" : "Trọng tài phụ"}</strong></span>
                <span className="dark:text-white/20 text-muted-foreground">•</span>
                <span className="text-xs dark:text-white/70 text-muted-foreground">Trạng thái:
                  <span className="ml-1 text-teal-400 font-bold uppercase">{activeAssignment.status}</span>
                </span>
              </div>
            </div>

            {activeAssignment.status === "assigned" ? (
              <div className="flex items-center gap-3 pt-2">
                <Button
                  onClick={() => handleRespond(activeAssignment._id, "REJECTED")}
                  disabled={submittingActionId !== null}
                  variant="outline"
                  className="rounded-full dark:border-white/10 border-border hover:dark:bg-white/5 bg-muted/50 text-xs h-10 px-6 uppercase font-bold dark:text-white text-foreground hover:dark:text-white text-foreground"
                >
                  Từ chối
                </Button>
                <Button
                  onClick={() => handleRespond(activeAssignment._id, "ACCEPTED")}
                  disabled={submittingActionId !== null}
                  className="rounded-full bg-primary hover:bg-primary/95 text-xs h-10 px-6 uppercase font-bold text-white"
                >
                  Chấp nhận phân công
                </Button>
              </div>
            ) : (
              <div className="grid gap-2.5 sm:grid-cols-3 pt-2">
                <Button asChild className="h-11 rounded-full dark:bg-white/5 bg-muted/50 border dark:border-white/10 border-border hover:dark:bg-white/10 bg-muted/50 hover:dark:border-white/20 border-border dark:text-white text-foreground">
                  <Link href={`/referee/races/${activeAssignment.raceId?._id}`}>
                    <ClipboardList className="size-4 text-primary shrink-0" />
                    <span className="ml-1.5 text-xs font-bold uppercase">Kiểm tra ngựa</span>
                  </Link>
                </Button>
                <Button asChild className="h-11 rounded-full dark:bg-white/5 bg-muted/50 border dark:border-white/10 border-border hover:dark:bg-white/10 bg-muted/50 hover:dark:border-white/20 border-border dark:text-white text-foreground">
                  <Link href={`/referee/races/${activeAssignment.raceId?._id}/violations`}>
                    <Siren className="size-4 text-primary shrink-0" />
                    <span className="ml-1.5 text-xs font-bold uppercase">Lỗi vi phạm</span>
                  </Link>
                </Button>
                <Button asChild className="h-11 rounded-full bg-[#E10600] hover:bg-[#B80500] text-white">
                  <Link href={`/referee/races/${activeAssignment.raceId?._id}/result-entry`}>
                    <Flag className="size-4 shrink-0" />
                    <span className="ml-1.5 text-xs font-bold uppercase">Nhập kết quả</span>
                  </Link>
                </Button>
              </div>
            )}
          </article>

          <article className="rounded-2xl border dark:border-white/10 border-border dark:bg-[#15151E]/90 bg-card p-5 flex flex-col justify-between">
            <div className="space-y-2">
              <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-primary">
                BIÊN BẢN TRẬN ĐẤU
              </p>
              <h3 className="text-lg font-black uppercase dark:text-white text-foreground">
                Khóa sổ & Đồng bộ
              </h3>
              <p className="text-xs leading-relaxed dark:text-white/50 text-muted-foreground">
                Khi trọng tài chính thực hiện bấm **Xác nhận kết quả**, BE sẽ tự động áp các hình phạt cộng giây từ bảng vi phạm, thực hiện tính toán lại thứ hạng thực tế của ngựa và khóa sửa đổi.
              </p>
            </div>
            <Button asChild variant="outline" className="mt-4 h-11 rounded-full dark:border-white/10 border-border hover:dark:bg-white/5 bg-muted/50 dark:text-white text-foreground hover:dark:text-white text-foreground w-full">
              <Link href="/referee/reports" className="flex items-center justify-center gap-1">
                <FileText className="size-4 shrink-0" />
                <span className="text-xs font-bold uppercase">Xem toàn bộ biên bản</span>
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </article>
        </section>
      )}

      {/* Grid of all assignments */}
      {profile && assignments.length > 0 && (
        <section className="space-y-4">
          <h3 className="text-sm font-black uppercase tracking-wider dark:text-white text-foreground">
            Danh sách cuộc đua được phân công ({assignments.length})
          </h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {assignments.map((assignment) => {
              if (!assignment.raceId) return null;
              return (
                <article
                  key={assignment._id}
                  className="rounded-2xl border dark:border-white/5 border-border dark:bg-[#15151E]/80 bg-card p-4 flex flex-col justify-between space-y-4 shadow hover:border-primary/20 transition"
                >
                  <div className="flex items-center justify-between">
                    <StatusBadge
                      label={
                        assignment.status === "assigned" ? "Chờ duyệt" :
                          assignment.status === "accepted" ? "Đã nhận" :
                            assignment.status === "declined" ? "Đã từ chối" : "Đã hủy"
                      }
                      tone={
                        assignment.status === "accepted" ? "green" :
                          assignment.status === "assigned" ? "yellow" :
                            assignment.status === "declined" ? "red" : "slate"
                      }
                      pulse={assignment.status === "assigned"}
                    />
                    <span className="text-[10px] dark:text-white/40 text-muted-foreground uppercase font-black">
                      {assignment.role === "main" ? "Trọng tài chính" : "Trọng tài phụ"}
                    </span>
                  </div>
                  <div>
                    <h4 className="text-sm font-black uppercase dark:text-white text-foreground leading-tight">
                      {assignment.raceId.name}
                    </h4>
                    <p className="text-[10px] dark:text-white/50 text-muted-foreground mt-1 flex items-center gap-1">
                      <Clock className="size-3 shrink-0" />
                      {formatDateTime(assignment.raceId.startTime)}
                    </p>
                    <p className="text-[10px] dark:text-white/40 text-muted-foreground mt-1 uppercase font-bold">
                      Trận đua: {
                        assignment.raceId.status === "SCHEDULED" ? "Đã lên lịch" :
                          assignment.raceId.status === "CHECKING" ? "Đang kiểm tra" :
                            assignment.raceId.status === "READY" ? "Sẵn sàng" :
                              assignment.raceId.status === "LIVE" ? "Đang đua" :
                                assignment.raceId.status === "FINISHED" ? "Hoàn thành" : "Đã công bố"
                      }
                    </p>
                  </div>
                  <div className="pt-2 border-t dark:border-white/5 border-border flex justify-end">
                    <Button
                      asChild
                      variant="outline"
                      className="h-9 px-4 rounded-full text-xs font-bold uppercase dark:border-white/10 border-border hover:dark:bg-white/5 bg-muted/50 dark:text-white text-foreground hover:dark:text-white text-foreground"
                    >
                      <Link href={`/referee/races/${assignment.raceId._id}`}>
                        Chi tiết <ArrowRight className="size-3.5 ml-1" />
                      </Link>
                    </Button>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      )}

      {profile && assignments.length === 0 && (
        <section className="flex flex-col items-center justify-center text-center p-12 rounded-2xl border border-dashed dark:border-white/10 border-border dark:bg-[#15151E]/50 bg-card max-w-lg mx-auto space-y-3">
          <div className="size-12 rounded-full border dark:border-white/10 border-border flex items-center justify-center dark:text-white/30 text-muted-foreground">
            <Flag className="size-6" />
          </div>
          <h4 className="font-bold dark:text-white text-foreground uppercase text-sm">Chưa có phân công nào</h4>
          <p className="text-xs dark:text-white/40 text-muted-foreground leading-relaxed">
            Danh sách trống. Khi Ban tổ chức chỉ định bạn vào tổ trọng tài giám sát một cuộc đua, thông tin cuộc đua và các API tác nghiệp sẽ hiển thị đầy đủ tại đây.
          </p>
        </section>
      )}
    </main>
  );
}
