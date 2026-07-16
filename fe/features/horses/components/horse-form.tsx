"use client";

import { useState } from "react";
import Image from "next/image";
import { Loader2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Horse, HorseGender, HorseHealthStatus } from "./horse-card";

type HorseFormProps = {
  initialData?: Horse;
  onSubmit: (formData: FormData) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
};

const fieldClass =
  "h-11 w-full rounded-xl border border-border bg-muted px-4 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/15 disabled:cursor-not-allowed disabled:opacity-60";
const labelClass =
  "text-xs font-black uppercase tracking-[0.16em] text-muted-foreground";

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
  const [baseSpeed, setBaseSpeed] = useState(initialData?.baseSpeed?.toString() || "60");
  const [staminaScore, setStaminaScore] = useState(initialData?.staminaScore?.toString() || "70");

  const cleanNumberString = (val: string) => {
    if (val === "") return "";
    const num = parseInt(val, 10);
    return isNaN(num) ? "" : num.toString();
  };

  // Support multiple images
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>(
    initialData?.images || (initialData?.image ? [initialData.image] : [])
  );
  const [errorMsg, setErrorMsg] = useState("");

  const isApproved = initialData?.approvalStatus === "APPROVED";

  const handleImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const validFiles: File[] = [];
      const newPreviews: string[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (file.size > 5 * 1024 * 1024) {
          setErrorMsg("Kích thước mỗi ảnh không được vượt quá 5MB.");
          return;
        }
        validFiles.push(file);
      }

      setErrorMsg("");

      let loadedCount = 0;
      validFiles.forEach((file) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          newPreviews.push(reader.result as string);
          loadedCount++;
          if (loadedCount === validFiles.length) {
            setImageFiles((prev) => [...prev, ...validFiles]);
            setImagePreviews((prev) => [...prev, ...newPreviews]);
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const handleRemoveImage = (index: number) => {
    const previewToRemove = imagePreviews[index];

    // Remove from previews
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));

    // If it's a new file (data: URL), we need to remove it from imageFiles
    if (previewToRemove.startsWith("data:")) {
      let fileIndex = 0;
      for (let i = 0; i < index; i++) {
        if (imagePreviews[i].startsWith("data:")) {
          fileIndex++;
        }
      }
      setImageFiles((prev) => prev.filter((_, i) => i !== fileIndex));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!name.trim()) {
      setErrorMsg("Tên chiến mã không được để trống.");
      return;
    }

    const speedNum = parseInt(baseSpeed);
    const staminaNum = parseInt(staminaScore);

    if (isNaN(speedNum) || speedNum < 30 || speedNum > 100) {
      setErrorMsg("Tốc độ nền phải nằm trong khoảng 30 - 100.");
      return;
    }

    if (isNaN(staminaNum) || staminaNum < 30 || staminaNum > 100) {
      setErrorMsg("Thể lực phải nằm trong khoảng 30 - 100.");
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
      data.append("baseSpeed", baseSpeed);
      data.append("staminaScore", staminaScore);

      // Append new files
      imageFiles.forEach((file) => {
        data.append("image", file);
      });

      // Filter existing images (URLs starting with http/https) and append them
      const existingImages = imagePreviews.filter((p) => p.startsWith("http"));
      data.append("existingImages", JSON.stringify(existingImages));

      await onSubmit(data);
    } catch (err) {
      setErrorMsg((err as Error).message || "Đã xảy ra lỗi khi lưu thông tin ngựa.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 rounded-2xl border border-border bg-card p-6 shadow-lg md:p-8">
      {errorMsg && (
        <div className="rounded-xl border border-primary bg-primary/10 p-4 text-sm text-foreground">
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
                onChange={(e) => setAge(cleanNumberString(e.target.value))}
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
                onChange={(e) => setWeightKg(cleanNumberString(e.target.value))}
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
                onChange={(e) => setHeightCm(cleanNumberString(e.target.value))}
                className={fieldClass}
                placeholder="165"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className={labelClass}>Tốc độ nền (30-100) *</label>
              <input
                type="number"
                min="30"
                max="100"
                required
                value={baseSpeed}
                onChange={(e) => setBaseSpeed(cleanNumberString(e.target.value))}
                className={fieldClass}
                placeholder="60"
              />
            </div>
            <div className="space-y-2">
              <label className={labelClass}>Thể lực (30-100) *</label>
              <input
                type="number"
                min="30"
                max="100"
                required
                value={staminaScore}
                onChange={(e) => setStaminaScore(cleanNumberString(e.target.value))}
                className={fieldClass}
                placeholder="70"
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
                <option value="MALE">Đực (Male)</option>
                <option value="FEMALE">Cái (Female)</option>
                <option value="GELDING">Thiến (Gelding)</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className={labelClass}>Trạng Thái Sức Khỏe</label>
              <select
                value={healthStatus}
                onChange={(e) => setHealthStatus(e.target.value as HorseHealthStatus)}
                className={fieldClass}
              >
                <option value="HEALTHY">Khỏe mạnh</option>
                <option value="INJURED">Chấn thương</option>
                <option value="RECOVERING">Đang hồi phục</option>
                <option value="RETIRED">Giải nghệ</option>
              </select>
            </div>
          </div>
        </div>

        {/* Right Column: Image and Description */}
        <div className="space-y-4 flex flex-col">
          <div className="space-y-2 flex-1 flex flex-col">
            <label className={labelClass}>Hình ảnh chiến mã (Có thể tải lên nhiều ảnh)</label>
            <div className="grid grid-cols-3 gap-3 p-2 bg-muted/20 border border-border rounded-xl min-h-[120px]">
              {imagePreviews.map((preview, idx) => (
                <div key={idx} className="relative aspect-square rounded-xl overflow-hidden bg-muted border border-border group">
                  <Image
                    src={preview}
                    alt={`Preview ${idx + 1}`}
                    fill
                    className="object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(idx)}
                    className="absolute top-1 right-1 size-6 rounded-full bg-black/60 hover:bg-[#E10600] text-foreground text-xs flex items-center justify-center transition opacity-0 group-hover:opacity-100"
                    title="Xóa ảnh này"
                  >
                    ✕
                  </button>
                </div>
              ))}

              <div className="relative aspect-square flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/40 hover:border-primary/50 transition group cursor-pointer">
                <Upload className="size-6 text-muted-foreground group-hover:text-primary transition" />
                <span className="text-[10px] font-bold text-foreground mt-1 text-center">Thêm ảnh</span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImagesChange}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className={labelClass}>Mô tả / Ghi chú</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="min-h-[96px] w-full rounded-xl border border-border bg-muted p-4 text-sm text-foreground placeholder:text-muted-foreground outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/15"
              placeholder="Nhập mô tả về thế mạnh hoặc đặc điểm nổi bật của ngựa..."
            />
          </div>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex justify-end gap-3 pt-4 border-t border-border">
        <Button
          type="button"
          onClick={onCancel}
          variant="outline"
          className="rounded-xl px-5 h-11 border border-border hover:bg-muted text-foreground"
        >
          Hủy bỏ
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting}
          className="rounded-xl px-6 h-11 bg-primary hover:bg-primary/90 text-foreground flex items-center gap-2 font-bold uppercase text-xs tracking-wider"
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
