"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  FileText,
  User,
  Clock,
  ShieldAlert,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/layout/page-header";
import { StatusBadge } from "@/components/ui/status-badge";
import { toast } from "sonner";
import { refereeProfilesApi, refereeAssignmentsApi, type RefereeProfileItem, type AssignmentItem } from "@/lib/api-client";

type UserInfo = {
  _id: string;
  fullName: string;
  email: string;
  phone?: string;
  roles: string[];
};

type RefereeReport = {
  _id: string;
  raceId: {
    _id: string;
    name: string;
  };
  description: string;
  createdAt: string;
  type?: string;
};

type Violation = {
  _id: string;
  raceId: {
    _id: string;
    name: string;
  };
  horseId?: {
    _id: string;
    name: string;
  };
  description: string;
  violation?: string;
  createdAt: string;
};

export default function RefereeDashboardPage() {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [profile, setProfile] = useState<RefereeProfileItem | null>(null);
  const [assignments, setAssignments] = useState<AssignmentItem[]>([]);
  const [recentReports, setRecentReports] = useState<RefereeReport[]>([]);
  const [recentViolations, setRecentViolations] = useState<Violation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmittingProfile, setIsSubmittingProfile] = useState(false);
  const [submittingActionId, setSubmittingActionId] = useState<string | null>(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  // Profile form state
  const [licenseNumber, setLicenseNumber] = useState("");
  const [experienceYears, setExperienceYears] = useState(1);
  const [bio, setBio] = useState("");
  const [certificates, setCertificates] = useState("");

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const userRes = await fetch("/api/auth/me");
      if (!userRes.ok) throw new Error("Không thể tải thông tin cá nhân");
      const userData = await userRes.json();
      setUser(userData.user);

      try {
        const profileData = await refereeProfilesApi.getMe();
        setProfile(profileData);
        setLicenseNumber(profileData.licenseNo || "");
        setExperienceYears(profileData.experienceYears || 1);
        setBio(profileData.bio || "");
        setCertificates(profileData.certificates || "");
      } catch (err) {
        if ((err as Error).message?.toLowerCase().includes("not found")) {
          setProfile(null);
        } else {
          throw err;
        }
      }

      const assignmentsResult = await refereeAssignmentsApi.myAssignments({ limit: 50 });
      setAssignments(assignmentsResult.data || []);

      // Fetch recent reports
      try {
        const reportsRes = await fetch("/api/referee/referee-reports?limit=5&sort=-createdAt");
        if (reportsRes.ok) {
          const reportsData = await reportsRes.json();
          setRecentReports((reportsData.data || []).slice(0, 5));
        }
      } catch {
        // Silently fail for reports
      }

      // Fetch recent violations
      try {
        const violationsRes = await fetch("/api/referee/violations?limit=5&sort=-createdAt");
        if (violationsRes.ok) {
          const violationsData = await violationsRes.json();
          setRecentViolations((violationsData.data || []).slice(0, 5));
        }
      } catch {
        // Silently fail for violations
      }
    } catch (err) {
      console.error(err);
      toast.error((err as Error).message || "Không thể tải dữ liệu trọng tài.");
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
    if (!certificates.trim()) {
      toast.error("Vui lòng nhập đầy đủ thông tin hồ sơ bằng cấp chuyên môn");
      return;
    }

    setIsSubmittingProfile(true);
    try {
      const dto = {
        licenseNo: licenseNumber,
        experienceYears: Number(experienceYears),
        bio,
        certificates,
      };
      if (profile) {
        await refereeProfilesApi.updateProfile(profile._id, dto);
        toast.success("Cập nhật hồ sơ thành công! Chờ duyệt lại.");
        setIsEditingProfile(false);
      } else {
        await refereeProfilesApi.createProfile(dto);
        toast.success("Khởi tạo hồ sơ thành công! Đang chờ duyệt.");
      }
      await fetchData();
    } catch (err) {
      toast.error((err as Error).message || "Lỗi lưu hồ sơ.");
    } finally {
      setIsSubmittingProfile(false);
    }
  };

  const handleRespond = async (assignmentId: string, status: "ACCEPTED" | "REJECTED") => {
    setSubmittingActionId(assignmentId);
    const apiStatus = status === "ACCEPTED" ? "accepted" : "declined";
    const actionLabel = status === "ACCEPTED" ? "Chấp nhận" : "Từ chối";
    try {
      await refereeAssignmentsApi.respond(assignmentId, apiStatus);
      toast.success(`${actionLabel} phân công thi đấu thành công!`);
      await fetchData();
    } catch (err) {
      toast.error((err as Error).message || "Lỗi khi xử lý thao tác.");
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
    (a) => typeof a.raceId !== "string" && (a.raceId?.status === "READY" || a.raceId?.status === "LIVE" || a.raceId?.status === "CHECKING")
  ) || acceptedAssignments[0] || assignments[0];

  return (
    <main className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 pb-12">
      <PageHeader
        eyebrow="Trạm điều hành trọng tài"
        title="Hội Đồng Giám Sát"
        description="Quản lý phân công thi đấu và ghi nhận kết quả"
      />

      {/* Profile Check / Greeting / Approval Banners */}
      {(!profile || profile.approvalStatus === "REJECTED") ? (
        <section className="relative overflow-hidden rounded-3xl border border-border bg-card/60 backdrop-blur-xl p-8 shadow-sm">
          <div className="space-y-4 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                profile?.approvalStatus === "REJECTED"
                  ? "bg-red-500/10 text-red-500 border border-red-500/20"
                  : "bg-primary/10 text-primary border border-primary/20"
              }`}>
                {profile?.approvalStatus === "REJECTED" ? "Hồ sơ bị từ chối" : "Cần hoàn thiện hồ sơ"}
              </span>
            </div>

            {profile?.approvalStatus === "REJECTED" && (
              <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-3 text-sm text-red-500 space-y-1">
                <p className="font-semibold">Lý do từ chối:</p>
                <p className="italic">&quot;{profile.rejectionReason || "Không có lý do chi tiết"}&quot;</p>
              </div>
            )}

            <h2 className="text-xl font-bold text-foreground">
              {profile?.approvalStatus === "REJECTED" ? "Cập nhật lại hồ sơ" : "Khởi tạo hồ sơ"}
            </h2>
            <p className="text-sm text-muted-foreground">
              Xin chào <span className="font-medium text-foreground">{user?.fullName}</span>, vui lòng hoàn thiện hồ sơ để bắt đầu tác nghiệp.
            </p>

            <form onSubmit={handleCreateProfile} className="mt-4 grid gap-3 sm:grid-cols-2 bg-muted/30 p-4 rounded-lg border border-border">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Số giấy phép</label>
                <input
                  type="text"
                  value={licenseNumber}
                  onChange={(e) => setLicenseNumber(e.target.value)}
                  placeholder="RF-7799"
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Kinh nghiệm (năm)</label>
                <input
                  type="number"
                  min={1}
                  max={50}
                  value={experienceYears}
                  onChange={(e) => setExperienceYears(Number(e.target.value))}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                  required
                />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-semibold text-muted-foreground">Bằng cấp & Chứng chỉ</label>
                <textarea
                  value={certificates}
                  onChange={(e) => setCertificates(e.target.value)}
                  placeholder="Bằng Trọng tài Quốc gia, Chứng nhận giám sát..."
                  rows={2}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all resize-none"
                  required
                />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-semibold text-muted-foreground">Tiểu sử (tùy chọn)</label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Thêm thông tin về kinh nghiệm..."
                  rows={2}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all resize-none"
                />
              </div>
              <div className="sm:col-span-2 flex justify-end">
                <Button
                  type="submit"
                  disabled={isSubmittingProfile}
                  className="rounded-lg bg-primary hover:bg-primary/90 font-semibold text-sm h-9 px-6 text-primary-foreground transition-all"
                >
                  {isSubmittingProfile ? "Đang xử lý..." : "Gửi hồ sơ"}
                </Button>
              </div>
            </form>
          </div>
        </section>
      ) : profile.approvalStatus === "PENDING" ? (
        <section className="relative overflow-hidden rounded-lg border border-amber-500/20 bg-amber-500/5 p-5 shadow-sm">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="inline-flex rounded-full bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 text-xs font-semibold text-amber-500">
                Đang chờ phê duyệt
              </span>
            </div>
            <h2 className="text-lg font-bold text-foreground">
              Hồ sơ của bạn đang được kiểm duyệt
            </h2>
            <p className="text-sm text-muted-foreground">
              Cảm ơn <span className="font-medium text-foreground">{user?.fullName}</span>, hồ sơ của bạn đã được gửi thành công. Khi được phê duyệt, các tính năng sẽ được mở khóa.
            </p>
          </div>
        </section>
      ) : (
        <div className="space-y-6">
          {/* Welcome & Profile Summary */}
          <section className="flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-lg border border-border bg-card p-5 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="size-12 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20 shrink-0">
                <User className="size-5 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-foreground">{user?.fullName}</h2>
                <p className="text-xs text-muted-foreground mt-1 flex items-center gap-2 flex-wrap">
                  License: <span className="text-primary font-semibold">{profile.licenseNo}</span>
                  <span className="text-border">•</span>
                  {profile.experienceYears} năm kinh nghiệm
                </p>
              </div>
            </div>
            
            <Button
              variant="outline"
              onClick={() => setIsEditingProfile((v) => !v)}
              className="rounded-lg border-border hover:bg-muted text-xs font-medium h-9 px-4 shrink-0"
            >
              {isEditingProfile ? "Hủy" : "Sửa"}
            </Button>
          </section>

          {isEditingProfile && (
            <form onSubmit={handleCreateProfile} className="grid gap-3 bg-card p-4 rounded-lg border border-border shadow-sm">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Số giấy phép</label>
                  <input
                    type="text"
                    value={licenseNumber}
                    onChange={(e) => setLicenseNumber(e.target.value)}
                    placeholder="RF-7799"
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Kinh nghiệm (năm)</label>
                  <input
                    type="number"
                    min={1}
                    max={50}
                    value={experienceYears}
                    onChange={(e) => setExperienceYears(Number(e.target.value))}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                    required
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Bằng cấp & Chứng chỉ</label>
                <textarea
                  value={certificates}
                  onChange={(e) => setCertificates(e.target.value)}
                  placeholder="Bằng Trọng tài Quốc gia..."
                  rows={2}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all resize-none"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Tiểu sử (tùy chọn)</label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Thêm thông tin..."
                  rows={2}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all resize-none"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="submit"
                  disabled={isSubmittingProfile}
                  className="rounded-lg bg-primary hover:bg-primary/90 font-semibold text-xs h-8 px-4 text-primary-foreground transition-all"
                >
                  {isSubmittingProfile ? "Đang..." : "Lưu"}
                </Button>
              </div>
            </form>
          )}

          {/* Alert Pending Assignments */}
          {pendingAssignments.length > 0 && (
            <section className="rounded-lg border border-amber-500/20 bg-amber-500/10 p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="size-8 rounded-full bg-amber-500/20 flex items-center justify-center border border-amber-500/30 shrink-0">
                  <ShieldAlert className="size-4 text-amber-500" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-foreground">Yêu cầu phân công mới</h4>
                  <p className="text-xs text-muted-foreground mt-0.5"><strong className="text-foreground">{pendingAssignments.length}</strong> cuộc đua cần phê duyệt</p>
                </div>
              </div>
              <Link href="/referee/assignments" className="shrink-0">
                <Button className="h-8 px-4 rounded-lg bg-amber-500 hover:bg-amber-600 text-amber-950 font-semibold text-xs shadow-sm transition-all">
                  Phê duyệt
                </Button>
              </Link>
            </section>
          )}

          {/* Next required action center */}
          {activeAssignment && (() => {
            const assignmentId = activeAssignment._id || (activeAssignment as { id?: string }).id || "";
            const raceIdRaw = activeAssignment.raceId;
            const raceId = typeof raceIdRaw === "string"
              ? raceIdRaw
              : raceIdRaw?._id || (raceIdRaw as unknown as { id?: string })?.id;
            const raceObj = typeof raceIdRaw !== "string" ? raceIdRaw : null;
            
            return (
              <section className="space-y-4">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-foreground">Nhiệm vụ tiếp theo</h3>
                </div>
                <article className="rounded-lg border border-border bg-card p-4 shadow-sm">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-base font-bold text-foreground">
                        {raceObj?.name || "Đang tải..."}
                      </h4>
                      <StatusBadge 
                        label={
                          activeAssignment.status === "assigned" ? "Chờ duyệt" :
                          activeAssignment.status === "accepted" ? "Đã nhận" :
                          activeAssignment.status === "declined" ? "Đã từ chối" : "Đã hủy"
                        }
                        tone={
                          activeAssignment.status === "accepted" ? "green" :
                          activeAssignment.status === "assigned" ? "yellow" :
                          activeAssignment.status === "declined" ? "red" : "slate"
                        }
                      />
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1.5 bg-muted/50 px-2.5 py-1 rounded-md border border-border/50">
                        <Clock className="size-3.5 text-primary" /> 
                        {formatDateTime(raceObj?.startTime)}
                      </span>
                      <span className="flex items-center gap-1.5 bg-muted/50 px-2.5 py-1 rounded-md border border-border/50">
                        <ShieldAlert className="size-3.5 text-primary" /> 
                        {activeAssignment.role === "main" ? "Trọng tài chính" : "Trọng tài phụ"}
                      </span>
                    </div>

                    {activeAssignment.status === "assigned" ? (
                      <div className="flex items-center gap-2 pt-2 border-t border-border">
                        <Button
                          onClick={() => handleRespond(assignmentId, "REJECTED")}
                          disabled={submittingActionId !== null}
                          variant="outline"
                          className="flex-1 rounded-lg border-border hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/20 text-xs font-medium h-8 transition-all"
                        >
                          Từ chối
                        </Button>
                        <Button
                          onClick={() => handleRespond(assignmentId, "ACCEPTED")}
                          disabled={submittingActionId !== null}
                          className="flex-1 rounded-lg bg-primary hover:bg-primary/90 text-xs font-semibold h-8 shadow-sm transition-all"
                        >
                          Chấp nhận
                        </Button>
                      </div>
                    ) : raceId ? (
                      <div className="grid grid-cols-3 gap-2 pt-2 border-t border-border">
                        <Button asChild className="h-8 rounded-lg bg-card border border-border hover:bg-muted text-foreground justify-center text-xs font-semibold transition-all">
                          <Link href={`/referee/races/${raceId}`}>
                            Kiểm tra
                          </Link>
                        </Button>
                        <Button asChild className="h-8 rounded-lg bg-card border border-border hover:bg-muted text-foreground justify-center text-xs font-semibold transition-all">
                          <Link href={`/referee/races/${raceId}/violations`}>
                            Vi phạm
                          </Link>
                        </Button>
                        <Button asChild className="h-8 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground justify-center text-xs font-semibold shadow-sm transition-all">
                          <Link href={`/referee/races/${raceId}/result-entry`}>
                            Kết quả
                          </Link>
                        </Button>
                      </div>
                    ) : null}
                  </div>
                </article>
              </section>
            );
          })()}

          {/* Recent Reports & Violations */}
          <section className="grid gap-4 md:grid-cols-2">
            {/* Recent Reports */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                  <FileText className="size-4 text-blue-500" />
                  Biên Bản Gần Đây
                </h3>
                <Button
                  asChild
                  variant="ghost"
                  className="h-8 px-2 text-xs font-medium hover:bg-primary/5"
                >
                  <Link href="/referee/reports">Xem tất cả</Link>
                </Button>
              </div>
              
              {recentReports.length > 0 ? (
                <div className="space-y-2">
                  {recentReports.map((report) => (
                    <article
                      key={report._id}
                      className="rounded-lg border border-border bg-card p-3 space-y-2 shadow-sm hover:shadow-md hover:border-blue-500/30 transition-all"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs font-bold text-foreground line-clamp-2">
                            {report.raceId?.name || "N/A"}
                          </h4>
                          <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                            {report.description}
                          </p>
                        </div>
                        <CheckCircle className="size-4 text-blue-500 shrink-0 mt-0.5" />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {new Date(report.createdAt).toLocaleDateString("vi-VN")}
                      </p>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="rounded-lg border border-dashed border-border bg-muted/30 p-4 text-center space-y-2">
                  <FileText className="size-5 text-muted-foreground/50 mx-auto" />
                  <p className="text-xs text-muted-foreground">Chưa có biên bản nào</p>
                </div>
              )}
            </div>

            {/* Recent Violations */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                  <AlertCircle className="size-4 text-amber-500" />
                  Vi Phạm Gần Đây
                </h3>
                <Button
                  asChild
                  variant="ghost"
                  className="h-8 px-2 text-xs font-medium hover:bg-primary/5"
                >
                  <Link href="/referee/violations">Xem tất cả</Link>
                </Button>
              </div>
              
              {recentViolations.length > 0 ? (
                <div className="space-y-2">
                  {recentViolations.map((violation) => (
                    <article
                      key={violation._id}
                      className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-3 space-y-2 shadow-sm hover:shadow-md hover:border-amber-500/40 transition-all"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs font-bold text-foreground line-clamp-1">
                            {violation.horseId?.name || "N/A"}
                          </h4>
                          <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                            {violation.violation || violation.description}
                          </p>
                        </div>
                        <AlertCircle className="size-4 text-amber-500 shrink-0 mt-0.5" />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {new Date(violation.createdAt).toLocaleDateString("vi-VN")}
                      </p>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="rounded-lg border border-dashed border-border bg-muted/30 p-4 text-center space-y-2">
                  <AlertCircle className="size-5 text-muted-foreground/50 mx-auto" />
                  <p className="text-xs text-muted-foreground">Chưa có vi phạm nào</p>
                </div>
              )}
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
