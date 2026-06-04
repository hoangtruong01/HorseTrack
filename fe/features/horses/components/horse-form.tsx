"use client";

import { useState } from "react";
import { Loader2, Award, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Horse, HorseGender, HorseHealthStatus } from "./horse-card";

type HorseFormProps = {
  initialData?: Horse;
  onSubmit: (formData: FormData) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
};

const fieldClass =
  "h-11 w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 text-sm text-white placeholder:text-white/30 outline-none transition focus:border-[#E10600] focus:ring-4 focus:ring-[#E10600]/15 disabled:cursor-not-allowed disabled:opacity-60";
const labelClass =
  "text-xs font-black uppercase tracking-[0.16em] text-white/55";

export function HorseForm({
  initialData,
  onSubmit,
  onCancel,
  isSubmitting,
}: HorseFormProps) {
  const [name, setName] = useState(initialData?.name || "");
  const [breed, setBreed] = useState(initialData?.breed || "");
  const [age, setAge] = useState(initialData?.age?.toString() || "");
  const [gender, setGender] = useState<HorseGender>(initialData?.gender || "MALE");
  const [color, setColor] = useState(initialData?.color || "");
  const [weightKg, setWeightKg] = useState(initialData?.weightKg?.toString() || "");
  const [heightCm, setHeightCm] = useState(initialData?.heightCm?.toString() || "");
  const [healthStatus, setHealthStatus] = useState<HorseHealthStatus>(
    initialData?.healthStatus || "HEALTHY"
  );
  const [description, setDescription] = useState(initialData?.description || "");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>(initialData?.image || "");
  const [errorMsg, setErrorMsg] = useState("");

  const isApproved = initialData?.approvalStatus === "APPROVED";

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrorMsg("Kích thước ảnh không vượt quá 5MB.");
        return;
      }
      setImageFile(file);
      setErrorMsg("");
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!name.trim()) {
      setErrorMsg("Tên chiến mã không được để trống.");
      return;
    }

    try {
      const data = new FormData();
      data.append("name", name);
      data.append("breed", breed);
      if (age) data.append("age", age);
      data.append("gender", gender);
      data.append("color", color);
      if (weightKg) data.append("weightKg", weightKg);
      if (heightCm) data.append("heightCm", heightCm);
      data.append("healthStatus", healthStatus);
      data.append("description", description);
      if (imageFile) {
        data.append("image", imageFile);
      }

      await onSubmit(data);
    } catch (err: any) {
      setErrorMsg(err.message || "Đã xảy ra lỗi khi lưu thông tin ngựa.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-[#15151E] border border-white/10 rounded-2xl p-6 md:p-8 shadow-[0_18px_56px_rgba(0,0,0,0.28)]">
      {errorMsg && (
        <div className="rounded-xl border border-[#E10600] bg-[#E10600]/10 p-4 text-sm text-[#E0DEDC]">
          <span className="font-bold text-[#E10600] uppercase block mb-1">Lỗi nhập liệu</span>
          {errorMsg}
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {/* Left Column: Form Inputs */}
        <div className="space-y-4">
          <div className="space-y-2">
            <label className={labelClass}>Tên Chiến Mã *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={fieldClass}
              placeholder="Nhập tên ngựa (ví dụ: Thunder Bolt)"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className={labelClass}>Giống Ngựa</label>
              <input
                type="text"
                value={breed}
                onChange={(e) => setBreed(e.target.value)}
                className={fieldClass}
                placeholder="Thoroughbred"
                disabled={isApproved}
              />
            </div>
            <div className="space-y-2">
              <label className={labelClass}>Màu Sắc</label>
              <input
                type="text"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className={fieldClass}
                placeholder="Vàng cát, Đen tuyền"
                disabled={isApproved}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className={labelClass}>Tuổi</label>
              <input
                type="number"
                min="1"
                max="30"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                className={fieldClass}
                placeholder="5"
              />
            </div>
            <div className="space-y-2">
              <label className={labelClass}>Cân nặng (kg)</label>
              <input
                type="number"
                min="100"
                max="1000"
                value={weightKg}
                onChange={(e) => setWeightKg(e.target.value)}
                className={fieldClass}
                placeholder="450"
              />
            </div>
            <div className="space-y-2">
              <label className={labelClass}>Chiều cao (cm)</label>
              <input
                type="number"
                min="50"
                max="250"
                value={heightCm}
                onChange={(e) => setHeightCm(e.target.value)}
                className={fieldClass}
                placeholder="165"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className={labelClass}>Giới Tính</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value as HorseGender)}
                className={fieldClass}
                disabled={isApproved}
              >
                <option value="MALE" className="bg-[#15151e] text-white">Đực (Male)</option>
                <option value="FEMALE" className="bg-[#15151e] text-white">Cái (Female)</option>
                <option value="GELDING" className="bg-[#15151e] text-white">Thiến (Gelding)</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className={labelClass}>Trạng Thái Sức Khỏe</label>
              <select
                value={healthStatus}
                onChange={(e) => setHealthStatus(e.target.value as HorseHealthStatus)}
                className={fieldClass}
              >
                <option value="HEALTHY" className="bg-[#15151e] text-white">Khỏe mạnh</option>
                <option value="INJURED" className="bg-[#15151e] text-white">Chấn thương</option>
                <option value="RECOVERING" className="bg-[#15151e] text-white">Đang hồi phục</option>
                <option value="RETIRED" className="bg-[#15151e] text-white">Giải nghệ</option>
              </select>
            </div>
          </div>
        </div>

        {/* Right Column: Image and Description */}
        <div className="space-y-4 flex flex-col">
          <div className="space-y-2 flex-1 flex flex-col">
            <label className={labelClass}>Hình ảnh chiến mã</label>
            <div className={`relative border border-dashed border-white/10 hover:border-primary/50 bg-white/[0.02] rounded-xl flex-1 min-h-[200px] flex flex-col items-center justify-center p-4 transition group cursor-pointer ${isApproved ? 'pointer-events-none opacity-60' : ''}`}>
              {imagePreview ? (
                <div className="relative w-full h-full min-h-[180px] rounded-lg overflow-hidden">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                  {!isApproved && (
                    <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 flex items-center justify-center transition">
                      <span className="text-white text-xs font-black uppercase bg-[#E10600] px-3 py-1.5 rounded-md">Thay đổi ảnh</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center space-y-2">
                  <Upload className="size-10 text-white/35 mx-auto group-hover:text-primary transition" />
                  <p className="text-sm font-bold text-white">Tải lên hình ảnh</p>
                  <p className="text-xs text-white/45">Cho phép định dạng PNG, JPG, WEBP tối đa 5MB</p>
                </div>
              )}
              {!isApproved && (
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
              )}
            </div>
          </div>

          <div className="space-y-2">
            <label className={labelClass}>Mô tả / Ghi chú</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-white/[0.04] p-4 text-sm text-white placeholder:text-white/30 outline-none transition focus:border-[#E10600] focus:ring-4 focus:ring-[#E10600]/15 min-h-[96px]"
              placeholder="Nhập mô tả về thế mạnh hoặc đặc điểm nổi bật của ngựa..."
            />
          </div>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
        <Button
          type="button"
          onClick={onCancel}
          variant="outline"
          className="rounded-xl px-5 h-11 border border-white/10 hover:bg-white/5 text-white"
        >
          Hủy bỏ
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting}
          className="rounded-xl px-6 h-11 bg-[#E10600] hover:bg-[#B80500] text-white flex items-center gap-2 font-bold uppercase text-xs tracking-wider"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Đang lưu...
            </>
          ) : (
            "Lưu chiến mã"
          )}
        </Button>
      </div>
    </form>
  );
}
