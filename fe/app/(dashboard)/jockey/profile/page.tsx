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

export default function JockeyProfilePage() {
  const [profile, setProfile] = useState<JockeyItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [editing, setEditing] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    heightCm: 165,
    weightKg: 55,
    experienceYears: 0,
    skillLevel: "",
    bio: "",
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
      });
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

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await jockeysApi.createProfile({
        heightCm: form.heightCm,
        weightKg: form.weightKg,
        experienceYears: form.experienceYears || undefined,
        skillLevel: form.skillLevel || undefined,
        bio: form.bio || undefined,
      });
      toast.success("Tạo profile nài ngựa thành công!");
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
    setSubmitting(true);
    try {
      const updated = await jockeysApi.updateProfile(profile._id, {
        heightCm: form.heightCm,
        weightKg: form.weightKg,
        experienceYears: form.experienceYears || undefined,
        skillLevel: form.skillLevel || undefined,
        bio: form.bio || undefined,
      });
      setProfile(updated);
      setEditing(false);
      toast.success("Cập nhật profile thành công!");
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
            <ProfileFormFields form={form} setForm={setForm} />
            <div className="flex justify-end pt-2">
              <Button
                type="submit"
                disabled={submitting}
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

            {profile.bio && !editing && (
              <div className="px-6 pb-6">
                <p className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground mb-1">Giới thiệu</p>
                <p className="text-xs text-muted-foreground leading-relaxed bg-muted/40 border border-border rounded-xl p-3">
                  {profile.bio}
                </p>
              </div>
            )}
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
                    });
                  }}
                  className="size-7 rounded-full bg-muted hover:bg-muted/80 flex items-center justify-center text-muted-foreground hover:text-foreground transition"
                >
                  <X className="size-3.5" />
                </button>
              </div>

              <form onSubmit={handleUpdate} className="p-6 space-y-5">
                <ProfileFormFields form={form} setForm={setForm} />
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
                    disabled={submitting}
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
}: {
  form: { heightCm: number; weightKg: number; experienceYears: number; skillLevel: string; bio: string };
  setForm: React.Dispatch<React.SetStateAction<typeof form>>;
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
    </div>
  );
}
