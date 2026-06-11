"use client";

import { useCallback, useEffect, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Loader2,
  Pencil,
  Save,
  User,
  X,
  Upload,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageHeader } from "@/components/layout/page-header";
import { jockeysApi, type JockeyItem } from "@/lib/api-client";
import { toast } from "sonner";

const SKILL_LEVELS = [
  { value: "beginner", label: "Mới bắt đầu (Beginner)" },
  { value: "intermediate", label: "Trung cấp (Intermediate)" },
  { value: "advanced", label: "Nâng cao (Advanced)" },
  { value: "professional", label: "Chuyên nghiệp (Professional)" },
];

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  available: { label: "Đang hoạt động", color: "text-emerald-400 border-emerald-500/20 bg-emerald-500/10" },
  unavailable: { label: "Không khả dụng", color: "text-amber-400 border-amber-500/20 bg-amber-500/10" },
  suspended: { label: "Bị tạm khóa", color: "text-red-400 border-red-500/20 bg-red-500/10" },
};

const APPROVAL_MAP: Record<string, { label: string; color: string }> = {
  PENDING: { label: "Đang chờ duyệt", color: "text-amber-400 border-amber-500/20 bg-amber-500/10" },
  APPROVED: { label: "Đã duyệt", color: "text-emerald-400 border-emerald-500/20 bg-emerald-500/10" },
  REJECTED: { label: "Bị từ chối", color: "text-red-400 border-red-500/20 bg-red-500/10" },
};

export default function JockeyProfilePage() {
  const [profile, setProfile] = useState<JockeyItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [editing, setEditing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState("");

  const [form, setForm] = useState({
    heightCm: 165,
    weightKg: 55,
    experienceYears: 0,
    skillLevel: "",
    bio: "",
    licenseNumber: "",
    certificates: "",
    licenseImage: "",
  });

  const loadProfile = useCallback(async () => {
    setLoading(true);
    try {
      const data = await jockeysApi.getMe();
      setProfile(data);
      setForm({
        heightCm: data.heightCm ?? 165,
        weightKg: data.weightKg ?? 55,
        experienceYears: data.experienceYears ?? 0,
        skillLevel: data.skillLevel ?? "",
        bio: data.bio ?? "",
        licenseNumber: data.licenseNumber ?? "",
        certificates: data.certificates ?? "",
        licenseImage: data.licenseImage ?? "",
      });
      setImagePreview(data.licenseImage ?? "");
      setNotFound(false);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "";
      if (msg.toLowerCase().includes("not found") || msg.includes("404")) {
        setNotFound(true);
      } else {
        toast.error("Không thể tải thông tin profile");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadProfile();
  }, [loadProfile]);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Kích thước ảnh không được vượt quá 5MB.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/uploads", {
        method: "POST",
        body: formData,
      });

      const resData = await res.json();
      if (!res.ok) {
        throw new Error(resData.message || "Tải lên ảnh thất bại.");
      }

      setForm((f) => ({ ...f, licenseImage: resData.url }));
      toast.success("Tải ảnh giấy phép thành công!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Lỗi khi tải ảnh lên.");
      setImagePreview("");
    } finally {
      setUploading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.licenseNumber.trim()) {
      toast.error("Vui lòng nhập số giấy phép nài ngựa");
      return;
    }
    setSubmitting(true);
    try {
      await jockeysApi.createProfile({
        heightCm: form.heightCm,
        weightKg: form.weightKg,
        experienceYears: form.experienceYears || undefined,
        skillLevel: form.skillLevel || undefined,
        bio: form.bio || undefined,
        licenseNumber: form.licenseNumber || undefined,
        certificates: form.certificates || undefined,
        licenseImage: form.licenseImage || undefined,
      });
      toast.success("Tạo profile nài ngựa thành công! Chờ Admin phê duyệt.");
      await loadProfile();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Tạo profile thất bại");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    if (!form.licenseNumber.trim()) {
      toast.error("Vui lòng nhập số giấy phép nài ngựa");
      return;
    }
    setSubmitting(true);
    try {
      const updated = await jockeysApi.updateProfile(profile._id, {
        heightCm: form.heightCm,
        weightKg: form.weightKg,
        experienceYears: form.experienceYears || undefined,
        skillLevel: form.skillLevel || undefined,
        bio: form.bio || undefined,
        licenseNumber: form.licenseNumber || undefined,
        certificates: form.certificates || undefined,
        licenseImage: form.licenseImage || undefined,
      });
      setProfile(updated);
      setEditing(false);
      toast.success("Cập nhật profile thành công! Hồ sơ sẽ được duyệt lại.");
      await loadProfile();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Cập nhật thất bại");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
        <Loader2 className="size-8 animate-spin text-[#E10600]" />
        <p className="mt-4 text-xs font-mono uppercase tracking-widest">Đang tải profile...</p>
      </div>
    );
  }

  return (
    <main className="space-y-6 max-w-2xl mx-auto pb-12">
      <PageHeader
        eyebrow="Hồ sơ nài ngựa"
        title="Profile Jockey"
        description="Thông tin thể chất và kinh nghiệm thi đấu của bạn. Chủ ngựa sẽ dựa vào hồ sơ này để gửi lời mời cưỡi."
      />

      {/* Chưa có profile → form tạo mới */}
      {notFound && (
        <div className="rounded-2xl border border-border bg-card shadow-lg overflow-hidden">
          <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-[#E10600] to-transparent" />
          <div className="p-6 space-y-2 border-b border-border bg-amber-500/5">
            <div className="flex items-center gap-2 text-amber-400">
              <AlertCircle className="size-4" />
              <span className="text-xs font-black uppercase tracking-wider">Chưa có hồ sơ nài ngựa</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Bạn cần tạo hồ sơ trước khi chủ ngựa có thể gửi lời mời thi đấu.
            </p>
          </div>

          <form onSubmit={handleCreate} className="p-6 space-y-5">
            <ProfileFormFields
              form={form}
              setForm={setForm}
              handleImageChange={handleImageChange}
              imagePreview={imagePreview}
              uploading={uploading}
            />
            <div className="flex justify-end pt-2">
              <Button
                type="submit"
                disabled={submitting || uploading}
                className="rounded-full bg-[#E10600] hover:bg-[#B80500] text-foreground font-bold uppercase tracking-wider text-xs h-10 px-6"
              >
                {submitting ? (
                  <><Loader2 className="size-4 animate-spin mr-1.5" /> Đang tạo...</>
                ) : (
                  <><CheckCircle2 className="size-4 mr-1.5" /> Tạo hồ sơ nài ngựa</>
                )}
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Đã có profile → hiển thị + chỉnh sửa */}
      {profile && (
        <div className="space-y-4">
          {profile.approvalStatus === "REJECTED" && (
            <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-4 text-xs text-red-400 font-bold space-y-1">
              <p className="uppercase tracking-wider text-[10px] text-red-500">Lý do từ chối từ Ban tổ chức:</p>
              <p className="italic text-foreground">&quot;{profile.rejectionReason || "Không có lý do chi tiết"}&quot;</p>
            </div>
          )}

          {/* Profile card */}
          <div className="rounded-2xl border border-border bg-card shadow-lg overflow-hidden relative">
            <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-[#E10600] to-transparent" />

            <div className="p-6 flex items-start justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="size-14 rounded-full border-2 border-primary bg-primary/10 flex items-center justify-center shrink-0">
                  <User className="size-7 text-primary" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-base font-black uppercase text-foreground">Hồ sơ nài ngựa</h2>
                    <span className={`inline-flex rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${STATUS_MAP[profile.status]?.color ?? "text-muted-foreground border-border bg-white/5"}`}>
                      {STATUS_MAP[profile.status]?.label ?? profile.status}
                    </span>
                    <span className={`inline-flex rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${APPROVAL_MAP[profile.approvalStatus || "PENDING"]?.color ?? "text-muted-foreground border-border bg-white/5"}`}>
                      {APPROVAL_MAP[profile.approvalStatus || "PENDING"]?.label ?? profile.approvalStatus}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Cấp độ: <span className="font-bold text-foreground capitalize">{profile.skillLevel || "Chưa xác định"}</span>
                    {" · "}Kinh nghiệm: <span className="font-bold text-foreground">{profile.experienceYears ?? 0} năm</span>
                  </p>
                </div>
              </div>

              {!editing && (
                <Button
                  onClick={() => setEditing(true)}
                  variant="outline"
                  className="rounded-full text-xs font-bold uppercase tracking-wider h-9 px-4 border-border shrink-0"
                >
                  <Pencil className="size-3.5 mr-1.5" /> Chỉnh sửa
                </Button>
              )}
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-border mx-6 mb-6 rounded-xl overflow-hidden border border-border">
              {[
                { label: "Chiều cao", value: `${profile.heightCm ?? "—"} cm` },
                { label: "Cân nặng", value: `${profile.weightKg ?? "—"} kg` },
                { label: "Số trận", value: profile.totalRaces ?? 0 },
                { label: "Chiến thắng", value: profile.wins ?? 0 },
              ].map((item) => (
                <div key={item.label} className="bg-card p-3 text-center">
                  <p className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">{item.label}</p>
                  <p className="text-sm font-black text-foreground mt-0.5">{item.value}</p>
                </div>
              ))}
            </div>

            <div className="px-6 pb-6 space-y-4">
              {profile.licenseNumber && (
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground mb-0.5">Số giấy phép (License)</p>
                  <p className="text-xs font-mono font-bold text-foreground">{profile.licenseNumber}</p>
                </div>
              )}

              {profile.certificates && (
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground mb-0.5">Bằng cấp & Chứng chỉ</p>
                  <p className="text-xs text-foreground bg-muted/40 border border-border rounded-xl p-3 whitespace-pre-line leading-relaxed">
                    {profile.certificates}
                  </p>
                </div>
              )}

              {profile.bio && !editing && (
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground mb-0.5">Giới thiệu</p>
                  <p className="text-xs text-muted-foreground leading-relaxed bg-muted/40 border border-border rounded-xl p-3">
                    {profile.bio}
                  </p>
                </div>
              )}

              {profile.licenseImage && (
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground mb-1">Ảnh chụp bằng cấp / Giấy phép</p>
                  <div className="relative max-w-sm h-48 rounded-lg overflow-hidden border border-border bg-muted/30">
                    <img src={profile.licenseImage} alt="License document" className="size-full object-contain" />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Form chỉnh sửa */}
          {editing && (
            <div className="rounded-2xl border border-border bg-card shadow-lg overflow-hidden relative">
              <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-teal-500 to-transparent" />
              <div className="p-5 border-b border-border flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-teal-400">Chỉnh sửa hồ sơ</span>
                <button
                  onClick={() => {
                    setEditing(false);
                    setForm({
                      heightCm: profile.heightCm ?? 165,
                      weightKg: profile.weightKg ?? 55,
                      experienceYears: profile.experienceYears ?? 0,
                      skillLevel: profile.skillLevel ?? "",
                      bio: profile.bio ?? "",
                      licenseNumber: profile.licenseNumber ?? "",
                      certificates: profile.certificates ?? "",
                      licenseImage: profile.licenseImage ?? "",
                    });
                    setImagePreview(profile.licenseImage ?? "");
                  }}
                  className="size-7 rounded-full bg-muted hover:bg-muted/80 flex items-center justify-center text-muted-foreground hover:text-foreground transition"
                >
                  <X className="size-3.5" />
                </button>
              </div>

              <form onSubmit={handleUpdate} className="p-6 space-y-5">
                <ProfileFormFields
                  form={form}
                  setForm={setForm}
                  handleImageChange={handleImageChange}
                  imagePreview={imagePreview}
                  uploading={uploading}
                />
                <div className="flex justify-end gap-3 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setEditing(false)}
                    className="rounded-full text-xs font-bold uppercase tracking-wider h-10 px-4 border-border"
                  >
                    Hủy
                  </Button>
                  <Button
                    type="submit"
                    disabled={submitting || uploading}
                    className="rounded-full bg-teal-600 hover:bg-teal-700 text-white font-bold uppercase tracking-wider text-xs h-10 px-6"
                  >
                    {submitting ? (
                      <><Loader2 className="size-4 animate-spin mr-1.5" /> Đang lưu...</>
                    ) : (
                      <><Save className="size-4 mr-1.5" /> Lưu thay đổi</>
                    )}
                  </Button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}
    </main>
  );
}

function ProfileFormFields({
  form,
  setForm,
  handleImageChange,
  imagePreview,
  uploading,
}: {
  form: {
    heightCm: number;
    weightKg: number;
    experienceYears: number;
    skillLevel: string;
    bio: string;
    licenseNumber: string;
    certificates: string;
    licenseImage: string;
  };
  setForm: React.Dispatch<React.SetStateAction<typeof form>>;
  handleImageChange: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
  imagePreview: string;
  uploading: boolean;
}) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>
            Chiều cao (cm) <span className="text-[#E10600]">*</span>
          </Label>
          <Input
            type="number"
            required
            min={100}
            value={form.heightCm}
            onChange={(e) => setForm((f) => ({ ...f, heightCm: parseInt(e.target.value) || 0 }))}
            className="font-mono"
          />
        </div>
        <div className="space-y-2">
          <Label>
            Cân nặng (kg) <span className="text-[#E10600]">*</span>
          </Label>
          <Input
            type="number"
            required
            min={30}
            value={form.weightKg}
            onChange={(e) => setForm((f) => ({ ...f, weightKg: parseInt(e.target.value) || 0 }))}
            className="font-mono"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Số năm kinh nghiệm</Label>
          <Input
            type="number"
            min={0}
            value={form.experienceYears}
            onChange={(e) => setForm((f) => ({ ...f, experienceYears: parseInt(e.target.value) || 0 }))}
            className="font-mono"
          />
        </div>
        <div className="space-y-2">
          <Label>Cấp độ kỹ năng</Label>
          <select
            value={form.skillLevel}
            onChange={(e) => setForm((f) => ({ ...f, skillLevel: e.target.value }))}
            className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          >
            <option value="">-- Chưa xác định --</option>
            {SKILL_LEVELS.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* License Number Input */}
      <div className="space-y-2">
        <Label>
          Số giấy phép nài ngựa (License Number) <span className="text-[#E10600]">*</span>
        </Label>
        <Input
          type="text"
          required
          placeholder="Ví dụ: JK-9988"
          value={form.licenseNumber}
          onChange={(e) => setForm((f) => ({ ...f, licenseNumber: e.target.value }))}
        />
      </div>

      {/* Certificates Description */}
      <div className="space-y-2">
        <Label>Bằng cấp & Chứng chỉ</Label>
        <textarea
          value={form.certificates}
          onChange={(e) => setForm((f) => ({ ...f, certificates: e.target.value }))}
          rows={3}
          placeholder="Ví dụ: Chứng chỉ nài ngựa chuyên nghiệp quốc gia, các lớp huấn luyện kỹ năng nâng cao..."
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 resize-none"
        />
      </div>

      <div className="space-y-2">
        <Label>Giới thiệu bản thân</Label>
        <textarea
          value={form.bio}
          onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
          rows={3}
          placeholder="Mô tả kinh nghiệm, phong cách thi đấu, thành tích nổi bật..."
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 resize-none"
        />
      </div>

      {/* License Image Upload */}
      <div className="space-y-2">
        <Label>Ảnh chụp bằng cấp / Giấy phép</Label>
        <div className="relative border border-dashed border-input hover:border-primary/50 bg-muted/20 rounded-xl min-h-[140px] flex flex-col items-center justify-center p-4 transition group cursor-pointer">
          {imagePreview ? (
            <div className="relative w-full max-w-sm h-[120px] rounded-lg overflow-hidden">
              <img src={imagePreview} alt="License Preview" className="size-full object-cover" />
              <div className="absolute inset-0 bg-black/45 opacity-0 hover:opacity-100 flex items-center justify-center transition">
                <span className="text-white text-xs font-black uppercase bg-primary px-3 py-1.5 rounded-md">
                  Thay đổi ảnh
                </span>
              </div>
            </div>
          ) : (
            <div className="text-center space-y-2">
              {uploading ? (
                <Loader2 className="size-8 text-[#E10600] mx-auto animate-spin" />
              ) : (
                <Upload className="size-8 text-muted-foreground group-hover:text-primary transition" />
              )}
              <p className="text-sm font-bold text-foreground">
                {uploading ? "Đang tải lên..." : "Tải ảnh giấy phép"}
              </p>
              <p className="text-xs text-muted-foreground">
                Cho phép PNG, JPG, WEBP tối đa 5MB
              </p>
            </div>
          )}
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            disabled={uploading}
            className="absolute inset-0 opacity-0 cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
}
