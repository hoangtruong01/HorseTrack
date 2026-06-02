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
        eyebrow="Trạm điều hành trọng tài"
        title="Hội Đồng Giám Sát"
        description="Quản lý lịch phân công điều hành cuộc đua, kiểm tra ngựa trước trận, ghi nhận vi phạm và xác nhận biên bản kết quả thi đấu chính thức."
      />

      {/* Profile Check / Greeting */}
      {!profile ? (
        <section className="relative overflow-hidden rounded-3xl border border-primary/30 bg-[#15151E] p-6 shadow-2xl">
          <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(225,6,0,0.1),transparent_35%)]" />
          <div className="relative space-y-4 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="inline-flex rounded-full border border-primary/40 bg-primary/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.18em] text-primary">
                CẦN HOÀN THIỆN HỒ SƠ
              </span>
            </div>
            <h2 className="text-xl font-black uppercase text-white sm:text-2xl">
              Khởi tạo hồ sơ Trọng tài của bạn
            </h2>
            <p className="text-xs text-white/60 leading-relaxed">
              Xin chào **{user?.fullName}**, bạn có vai trò Trọng tài nhưng chưa tạo hồ sơ thông số chuyên môn. Hãy điền số giấy phép hành nghề bên dưới để có thể nhận phân công giám sát các cuộc đua từ Ban tổ chức.
            </p>
            <form onSubmit={handleCreateProfile} className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 items-end bg-black/25 p-4 rounded-xl border border-white/5">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase text-white/50">Số giấy phép (License)</label>
                <input
                  type="text"
                  value={licenseNumber}
                  onChange={(e) => setLicenseNumber(e.target.value)}
                  placeholder="Ví dụ: RF-7799"
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-white placeholder-white/35 focus:border-primary focus:outline-none"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase text-white/50">Kinh nghiệm (Năm)</label>
                <input
                  type="number"
                  min={1}
                  max={50}
                  value={experienceYears}
                  onChange={(e) => setExperienceYears(Number(e.target.value))}
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-white focus:border-primary focus:outline-none"
                  required
                />
              </div>
              <div className="space-y-1.5 sm:col-span-2 lg:col-span-3">
                <label className="text-[10px] font-bold uppercase text-white/50">Tiểu sử ngắn / Bio (Tùy chọn)</label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Ghi chú về kinh nghiệm làm việc hoặc các trận chung kết quốc gia đã điều hành..."
                  rows={2}
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-white placeholder-white/35 focus:border-primary focus:outline-none resize-none"
                />
              </div>
              <div className="sm:col-span-2 lg:col-span-3 flex justify-end">
                <Button
                  type="submit"
                  disabled={isSubmittingProfile}
                  className="rounded-full bg-primary hover:bg-primary-dark font-black uppercase text-xs h-10 px-6 text-white"
                >
                  {isSubmittingProfile ? "Đang xử lý..." : "Khởi tạo hồ sơ ngay"}
                </Button>
              </div>
            </form>
          </div>
        </section>
      ) : (
        <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#15151E] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.36)] sm:p-7">
          <div className="absolute inset-0 bg-[linear-gradient(125deg,rgba(225,6,0,0.22),transparent_35%),radial-gradient(circle_at_85%_20%,rgba(6,126,106,0.15),transparent_25rem)]" />
          <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <span className="inline-flex rounded-full border border-primary/40 bg-primary/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.18em] text-primary">
                GIÁM SÁT TRỰC TUYẾN
              </span>
              <h2 className="mt-3 text-3xl font-black uppercase tracking-tight text-white leading-none">
                BÀN LÀM VIỆC CỦA TRỌNG TÀI
              </h2>
              <p className="mt-2 text-xs text-white/50 leading-relaxed max-w-xl">
                Quản lý các cuộc đua được ủy quyền. Thực hiện kiểm duyệt đầy đủ tình trạng thiết bị bảo hộ, sức khỏe ngựa, jockey điểm danh và xác lập thứ hạng chuẩn hóa sau khi trận đấu hoàn thành.
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/25 p-4 shrink-0 min-w-[240px]">
              <p className="text-[10px] uppercase tracking-[0.18em] text-white/45">Trọng tài được cấp phép</p>
              <p className="mt-1 text-lg font-black uppercase text-white flex items-center gap-1.5">
                <User className="size-4 text-primary" />
                {user?.fullName}
              </p>
              <p className="mt-1 text-xs text-white/60">
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
              <h4 className="text-xs font-black uppercase text-white">Yêu cầu phân công mới!</h4>
              <p className="text-[10px] text-white/60 mt-0.5">Bạn đang có {pendingAssignments.length} cuộc đua mới được Ban tổ chức chỉ định cần phê duyệt.</p>
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
          <article className="rounded-2xl border border-primary/25 bg-[linear-gradient(135deg,rgba(225,6,0,0.12),rgba(21,21,30,0.95))] p-5 flex flex-col justify-between space-y-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-primary">
                NHIỆM VỤ TIẾP THEO
              </p>
              <h3 className="mt-2 text-2xl font-black uppercase text-white leading-tight">
                {activeAssignment.raceId?.name}
              </h3>
              <p className="mt-1 text-xs text-white/50 flex items-center gap-1.5">
                <Clock className="size-3.5" />
                {formatDateTime(activeAssignment.raceId?.startTime)}
              </p>
              <div className="mt-2 flex items-center gap-2">
                <span className="text-xs text-white/70">Vai trò: <strong>{activeAssignment.role === "main" ? "Trọng tài chính" : "Trọng tài phụ"}</strong></span>
                <span className="text-white/20">•</span>
                <span className="text-xs text-white/70">Trạng thái: 
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
                  className="rounded-full border-white/10 hover:bg-white/5 text-xs h-10 px-6 uppercase font-bold text-white hover:text-white"
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
                <Button asChild className="h-11 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 text-white">
                  <Link href={`/referee/races/${activeAssignment.raceId?._id}`}>
                    <ClipboardList className="size-4 text-primary shrink-0" />
                    <span className="ml-1.5 text-xs font-bold uppercase">Kiểm tra ngựa</span>
                  </Link>
                </Button>
                <Button asChild className="h-11 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 text-white">
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

          <article className="rounded-2xl border border-white/10 bg-[#15151E]/90 p-5 flex flex-col justify-between">
            <div className="space-y-2">
              <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-primary">
                BIÊN BẢN TRẬN ĐẤU
              </p>
              <h3 className="text-lg font-black uppercase text-white">
                Khóa sổ & Đồng bộ
              </h3>
              <p className="text-xs leading-relaxed text-white/50">
                Khi trọng tài chính thực hiện bấm **Xác nhận kết quả**, BE sẽ tự động áp các hình phạt cộng giây từ bảng vi phạm, thực hiện tính toán lại thứ hạng thực tế của ngựa và khóa sửa đổi.
              </p>
            </div>
            <Button asChild variant="outline" className="mt-4 h-11 rounded-full border-white/10 hover:bg-white/5 text-white hover:text-white w-full">
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
          <h3 className="text-sm font-black uppercase tracking-wider text-white">
            Danh sách cuộc đua được phân công ({assignments.length})
          </h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {assignments.map((assignment) => {
              if (!assignment.raceId) return null;
              return (
                <article
                  key={assignment._id}
                  className="rounded-2xl border border-white/5 bg-[#15151E]/80 p-4 flex flex-col justify-between space-y-4 shadow hover:border-primary/20 transition"
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
                    <span className="text-[10px] text-white/40 uppercase font-black">
                      {assignment.role === "main" ? "Trọng tài chính" : "Trọng tài phụ"}
                    </span>
                  </div>
                  <div>
                    <h4 className="text-sm font-black uppercase text-white leading-tight">
                      {assignment.raceId.name}
                    </h4>
                    <p className="text-[10px] text-white/50 mt-1 flex items-center gap-1">
                      <Clock className="size-3 shrink-0" />
                      {formatDateTime(assignment.raceId.startTime)}
                    </p>
                    <p className="text-[10px] text-white/40 mt-1 uppercase font-bold">
                      Trận đua: {
                        assignment.raceId.status === "SCHEDULED" ? "Đã lên lịch" :
                        assignment.raceId.status === "CHECKING" ? "Đang kiểm tra" :
                        assignment.raceId.status === "READY" ? "Sẵn sàng" :
                        assignment.raceId.status === "LIVE" ? "Đang đua" :
                        assignment.raceId.status === "FINISHED" ? "Hoàn thành" : "Đã công bố"
                      }
                    </p>
                  </div>
                  <div className="pt-2 border-t border-white/5 flex justify-end">
                    <Button
                      asChild
                      variant="outline"
                      className="h-9 px-4 rounded-full text-xs font-bold uppercase border-white/10 hover:bg-white/5 text-white hover:text-white"
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
        <section className="flex flex-col items-center justify-center text-center p-12 rounded-2xl border border-dashed border-white/10 bg-[#15151E]/50 max-w-lg mx-auto space-y-3">
          <div className="size-12 rounded-full border border-white/10 flex items-center justify-center text-white/30">
            <Flag className="size-6" />
          </div>
          <h4 className="font-bold text-white uppercase text-sm">Chưa có phân công nào</h4>
          <p className="text-xs text-white/40 leading-relaxed">
            Danh sách trống. Khi Ban tổ chức chỉ định bạn vào tổ trọng tài giám sát một cuộc đua, thông tin cuộc đua và các API tác nghiệp sẽ hiển thị đầy đủ tại đây.
          </p>
        </section>
      )}
    </main>
  );
}
