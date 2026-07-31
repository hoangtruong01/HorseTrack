"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  FileText,
  User,
  Clock,
  ShieldAlert,
  AlertCircle,
  CheckCircle,
  Upload,
  Camera,
  Image as ImageIcon,
  X,
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
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [licenseNumber, setLicenseNumber] = useState("");
  const [experienceYears, setExperienceYears] = useState(1);
  const [bio, setBio] = useState("");
  const [certificates, setCertificates] = useState("");
  const [licenseImage, setLicenseImage] = useState("");
  const [portraitImage, setPortraitImage] = useState("");
  const [certificateImage, setCertificateImage] = useState("");
  const [certificateImages, setCertificateImages] = useState<string[]>([]);
  const [uploadingPortrait, setUploadingPortrait] = useState(false);
  const [uploadingCertificate, setUploadingCertificate] = useState(false);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const userRes = await fetch("/api/auth/me");
      if (!userRes.ok) throw new Error("Không thể tải thông tin cá nhân");
      const userData = await userRes.json();
      setUser(userData.user);
      setFullName(userData.user?.fullName || "");
      setPhone(userData.user?.phone || "");

      try {
        const profileData = await refereeProfilesApi.getMe();
        setProfile(profileData);
        setLicenseNumber(profileData.licenseNo || "");
        setExperienceYears(profileData.experienceYears || 1);
        setBio(profileData.bio || "");
        setCertificates(profileData.certificates || "");
        setLicenseImage(profileData.licenseImage || "");
        const userAvatar = typeof profileData.userId === "object" ? profileData.userId.avatar : "";
        setPortraitImage(profileData.portraitImage || userAvatar || "");
        setCertificateImage(profileData.certificateImage || "");

        const existingImgs = profileData.certificateImages && profileData.certificateImages.length > 0
          ? profileData.certificateImages
          : ([profileData.certificateImage, profileData.licenseImage].filter(Boolean) as string[]);
        setCertificateImages(existingImgs.slice(0, 7));
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

  const handleUploadPortrait = async (file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Kích thước ảnh không được vượt quá 5MB.");
      return;
    }

    setUploadingPortrait(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/uploads", { method: "POST", body: formData });
      const resData = await res.json();
      if (!res.ok) throw new Error(resData.message || "Tải lên ảnh thất bại.");

      setPortraitImage(resData.url);
      toast.success("Tải ảnh chân dung thành công!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Lỗi khi tải ảnh.");
    } finally {
      setUploadingPortrait(false);
    }
  };

  const handleUploadCertificates = async (files: FileList) => {
    const fileArray = Array.from(files);
    if (certificateImages.length + fileArray.length > 7) {
      toast.error(`Bạn chỉ có thể tải tối đa 7 hình ảnh bằng cấp/giấy phép. (Hiện đã có ${certificateImages.length} ảnh)`);
      return;
    }

    setUploadingCertificate(true);
    try {
      const uploadedUrls: string[] = [];
      for (const file of fileArray) {
        if (file.size > 5 * 1024 * 1024) {
          toast.error(`Ảnh ${file.name} vượt quá 5MB.`);
          continue;
        }
        const formData = new FormData();
        formData.append("file", file);
        const res = await fetch("/api/uploads", { method: "POST", body: formData });
        const resData = await res.json();
        if (res.ok && resData.url) {
          uploadedUrls.push(resData.url);
        }
      }
      if (uploadedUrls.length > 0) {
        setCertificateImages((prev) => [...prev, ...uploadedUrls].slice(0, 7));
        toast.success(`Đã tải thêm ${uploadedUrls.length} ảnh bằng cấp thành công!`);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Lỗi khi tải ảnh.");
    } finally {
      setUploadingCertificate(false);
    }
  };

  const handleRemoveCertImage = (idx: number) => {
    setCertificateImages((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleCreateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      toast.error("Vui lòng nhập họ và tên đầy đủ");
      return;
    }
    if (!licenseNumber.trim()) {
      toast.error("Vui lòng nhập số giấy phép trọng tài");
      return;
    }
    if (!certificates.trim()) {
      toast.error("Vui lòng nhập đầy đủ thông tin bằng cấp chuyên môn");
      return;
    }

    setIsSubmittingProfile(true);
    try {
      const dto = {
        fullName: fullName.trim(),
        phone: phone.trim(),
        licenseNo: licenseNumber.trim(),
        experienceYears: Number(experienceYears),
        bio: bio.trim(),
        certificates: certificates.trim(),
        licenseImage: certificateImages[0] || licenseImage || "",
        portraitImage,
        certificateImage: certificateImages[0] || certificateImage || "",
        certificateImages,
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
        <Image src="/skeletonHorse.gif" alt="Đang tải..." width={80} height={80} unoptimized className="object-contain mx-auto" />
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
              <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${profile?.approvalStatus === "REJECTED"
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

            <form onSubmit={handleCreateProfile} className="mt-4 grid gap-4 bg-muted/30 p-5 rounded-2xl border border-border">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Họ tên đầy đủ *</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Nguyễn Văn A"
                    className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Số điện thoại *</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="0901234567"
                    className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Số giấy phép trọng tài *</label>
                  <input
                    type="text"
                    value={licenseNumber}
                    onChange={(e) => setLicenseNumber(e.target.value)}
                    placeholder="RF-7799"
                    className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Kinh nghiệm (năm) *</label>
                  <input
                    type="number"
                    min={1}
                    max={50}
                    value={experienceYears}
                    onChange={(e) => setExperienceYears(Number(e.target.value))}
                    className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Bằng cấp & Chứng chỉ chuyên môn *</label>
                <textarea
                  value={certificates}
                  onChange={(e) => setCertificates(e.target.value)}
                  placeholder="Bằng Trọng tài Quốc gia, Chứng nhận giám sát đường đua chuyên nghiệp..."
                  rows={2}
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all resize-none"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Tiểu sử / Tóm tắt quá trình (tùy chọn)</label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Mô tả các giải đấu lớn đã từng tham gia điều hành..."
                  rows={2}
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all resize-none"
                />
              </div>

              {/* Upload Ảnh chân dung & Ảnh bằng cấp (tối đa 7 ảnh) */}
              <div className="space-y-4 pt-2 border-t border-border/60">
                {/* Ảnh chân dung */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                    <Camera className="size-3.5 text-primary" /> Ảnh chân dung trọng tài
                  </label>
                  <div className="flex items-center gap-3">
                    {portraitImage ? (
                      <div className="relative size-16 rounded-xl overflow-hidden border border-border shrink-0">
                        <img src={portraitImage} alt="Ảnh chân dung" className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className="size-16 rounded-xl border border-dashed border-border bg-background/50 flex flex-col items-center justify-center text-muted-foreground text-xs shrink-0">
                        <User className="size-6 text-muted-foreground/40" />
                      </div>
                    )}
                    <label className="cursor-pointer inline-flex items-center gap-1.5 rounded-xl border border-border bg-background px-3 py-2 text-xs font-semibold text-foreground hover:bg-muted transition">
                      <Upload className="size-3.5" />
                      {uploadingPortrait ? "Đang tải..." : portraitImage ? "Thay ảnh chân dung" : "Tải ảnh chân dung"}
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) void handleUploadPortrait(file);
                        }}
                      />
                    </label>
                  </div>
                </div>

                {/* Ảnh bằng cấp & Giấy phép (Tối đa 7 hình) */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                      <ImageIcon className="size-3.5 text-teal-400" /> Ảnh bằng cấp & Giấy phép (Tối đa 7 hình)
                    </label>
                    <span className="text-[11px] font-mono text-muted-foreground font-semibold">
                      {certificateImages.length} / 7 hình
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    {certificateImages.map((imgUrl, idx) => (
                      <div key={idx} className="relative size-20 rounded-xl overflow-hidden border border-border group bg-background shrink-0">
                        <img src={imgUrl} alt={`Ảnh bằng cấp ${idx + 1}`} className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => handleRemoveCertImage(idx)}
                          className="absolute top-1 right-1 size-5 rounded-full bg-black/70 text-white flex items-center justify-center opacity-80 hover:opacity-100 hover:bg-red-600 transition"
                          title="Xóa ảnh này"
                        >
                          <X className="size-3" />
                        </button>
                      </div>
                    ))}

                    {certificateImages.length < 7 && (
                      <label className="cursor-pointer size-20 rounded-xl border border-dashed border-border bg-background/50 hover:bg-muted flex flex-col items-center justify-center text-muted-foreground text-xs transition p-2 text-center shrink-0">
                        <Upload className="size-5 mb-1 text-teal-400" />
                        <span className="text-[10px] font-semibold leading-tight">
                          {uploadingCertificate ? "Đang tải..." : "Thêm ảnh"}
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          disabled={uploadingCertificate}
                          className="hidden"
                          onChange={(e) => {
                            if (e.target.files && e.target.files.length > 0) {
                              void handleUploadCertificates(e.target.files);
                            }
                          }}
                        />
                      </label>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <Button
                  type="submit"
                  disabled={isSubmittingProfile || uploadingPortrait || uploadingCertificate}
                  className="rounded-xl bg-primary hover:bg-primary/90 font-bold text-sm h-10 px-6 text-primary-foreground transition-all shadow-md"
                >
                  {isSubmittingProfile ? "Đang xử lý..." : "Gửi hồ sơ kiểm duyệt"}
                </Button>
              </div>
            </form>
          </div>
        </section>
      ) : profile.approvalStatus === "PENDING" ? (
        <section className="relative overflow-hidden rounded-2xl border border-amber-500/20 bg-amber-500/5 p-6 shadow-sm">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="inline-flex rounded-full bg-amber-500/10 border border-amber-500/20 px-3 py-1 text-xs font-bold text-amber-500 uppercase tracking-wider">
                Đang chờ phê duyệt
              </span>
            </div>
            <h2 className="text-lg font-bold text-foreground">
              Hồ sơ của bạn đang được Ban Tổ Chức kiểm duyệt
            </h2>
            <p className="text-sm text-muted-foreground">
              Cảm ơn <span className="font-semibold text-foreground">{user?.fullName}</span>, hồ sơ đầy đủ thông tin và bằng cấp của bạn đã được gửi thành công. Admin sẽ sớm phê duyệt để kích hoạt quyền tác nghiệp.
            </p>
          </div>
        </section>
      ) : (
        <div className="space-y-6">
          {/* Welcome & Profile Summary */}
          <section className="flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="relative size-14 rounded-2xl bg-primary/10 overflow-hidden border border-primary/20 shrink-0 flex items-center justify-center">
                {portraitImage ? (
                  <img src={portraitImage} alt={user?.fullName} className="w-full h-full object-cover" />
                ) : (
                  <User className="size-6 text-primary" />
                )}
              </div>
              <div>
                <h2 className="text-lg font-bold text-foreground">{user?.fullName}</h2>
                <p className="text-xs text-muted-foreground mt-1 flex items-center gap-2 flex-wrap">
                  SĐT: <span className="text-foreground font-semibold">{user?.phone || "Chưa có"}</span>
                  <span className="text-border">•</span>
                  Giấy phép: <span className="text-primary font-semibold">{profile.licenseNo}</span>
                  <span className="text-border">•</span>
                  {profile.experienceYears} năm kinh nghiệm
                </p>
              </div>
            </div>

            <Button
              variant="outline"
              onClick={() => setIsEditingProfile((v) => !v)}
              className="rounded-xl border-border hover:bg-muted text-xs font-semibold h-9 px-4 shrink-0"
            >
              {isEditingProfile ? "Hủy chỉnh sửa" : "Chỉnh sửa hồ sơ"}
            </Button>
          </section>

          {isEditingProfile && (
            <form onSubmit={handleCreateProfile} className="grid gap-4 bg-card p-5 rounded-2xl border border-border shadow-sm">
              <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">Cập nhật lại thông tin hồ sơ</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Họ tên đầy đủ *</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Nguyễn Văn A"
                    className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Số điện thoại *</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="0901234567"
                    className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Số giấy phép *</label>
                  <input
                    type="text"
                    value={licenseNumber}
                    onChange={(e) => setLicenseNumber(e.target.value)}
                    placeholder="RF-7799"
                    className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Kinh nghiệm (năm) *</label>
                  <input
                    type="number"
                    min={1}
                    max={50}
                    value={experienceYears}
                    onChange={(e) => setExperienceYears(Number(e.target.value))}
                    className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                    required
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Bằng cấp & Chứng chỉ *</label>
                <textarea
                  value={certificates}
                  onChange={(e) => setCertificates(e.target.value)}
                  placeholder="Bằng Trọng tài Quốc gia..."
                  rows={2}
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all resize-none"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Tiểu sử (tùy chọn)</label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Thêm thông tin kinh nghiệm..."
                  rows={2}
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all resize-none"
                />
              </div>

              {/* Upload Ảnh chân dung & Ảnh bằng cấp (tối đa 7 ảnh) */}
              <div className="space-y-4 pt-2 border-t border-border">
                {/* Ảnh chân dung */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                    <Camera className="size-3.5 text-primary" /> Cập nhật Ảnh chân dung
                  </label>
                  <div className="flex items-center gap-3">
                    {portraitImage ? (
                      <div className="relative size-14 rounded-xl overflow-hidden border border-border shrink-0">
                        <img src={portraitImage} alt="Ảnh chân dung" className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className="size-14 rounded-xl border border-dashed border-border bg-background/50 flex flex-col items-center justify-center text-muted-foreground text-xs shrink-0">
                        <User className="size-5 text-muted-foreground/40" />
                      </div>
                    )}
                    <label className="cursor-pointer inline-flex items-center gap-1.5 rounded-xl border border-border bg-background px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-muted transition">
                      <Upload className="size-3.5" />
                      {uploadingPortrait ? "Đang tải..." : portraitImage ? "Thay ảnh chân dung" : "Tải ảnh chân dung"}
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) void handleUploadPortrait(file);
                        }}
                      />
                    </label>
                  </div>
                </div>

                {/* Ảnh bằng cấp & Giấy phép (Tối đa 7 hình) */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                      <ImageIcon className="size-3.5 text-teal-400" /> Cập nhật Ảnh bằng cấp & Giấy phép (Tối đa 7 hình)
                    </label>
                    <span className="text-[11px] font-mono text-muted-foreground font-semibold">
                      {certificateImages.length} / 7 hình
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    {certificateImages.map((imgUrl, idx) => (
                      <div key={idx} className="relative size-20 rounded-xl overflow-hidden border border-border group bg-background shrink-0">
                        <img src={imgUrl} alt={`Ảnh bằng cấp ${idx + 1}`} className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => handleRemoveCertImage(idx)}
                          className="absolute top-1 right-1 size-5 rounded-full bg-black/70 text-white flex items-center justify-center opacity-80 hover:opacity-100 hover:bg-red-600 transition"
                          title="Xóa ảnh này"
                        >
                          <X className="size-3" />
                        </button>
                      </div>
                    ))}

                    {certificateImages.length < 7 && (
                      <label className="cursor-pointer size-20 rounded-xl border border-dashed border-border bg-background/50 hover:bg-muted flex flex-col items-center justify-center text-muted-foreground text-xs transition p-2 text-center shrink-0">
                        <Upload className="size-5 mb-1 text-teal-400" />
                        <span className="text-[10px] font-semibold leading-tight">
                          {uploadingCertificate ? "Đang tải..." : "Thêm ảnh"}
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          disabled={uploadingCertificate}
                          className="hidden"
                          onChange={(e) => {
                            if (e.target.files && e.target.files.length > 0) {
                              void handleUploadCertificates(e.target.files);
                            }
                          }}
                        />
                      </label>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="submit"
                  disabled={isSubmittingProfile || uploadingPortrait || uploadingCertificate}
                  className="rounded-xl bg-primary hover:bg-primary/90 font-bold text-xs h-9 px-5 text-primary-foreground transition-all"
                >
                  {isSubmittingProfile ? "Đang xử lý..." : "Lưu thay đổi & gửi duyệt"}
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
