# Kết quả Thực nghiệm (Dự thảo)

> **Trạng thái**: Dự thảo — các giá trị số sẽ được cập nhật sau khi hoàn thành chạy thử và thu thập dữ liệu.

## 1. Tóm tắt

- Phạm vi: `AI prediction` (30 race) và `AI arrangement` (20 kịch bản).
- Đánh giá bao gồm: độ chính xác dự đoán, RMSE xác suất, điểm cân bằng phân bổ, số lỗi phân bổ, thời gian tạo output, và SUS.

## 2. Kết quả `AI prediction`

### 2.1. Độ chính xác xếp hạng

| Metríc | Giá trị AI | Giá trị Baseline (tay) | Chênh lệch | p-value |
|---|---:|---:|---:|---:|
| Top-1 accuracy | TBD | TBD | TBD | TBD |
| Top-3 accuracy | TBD | TBD | TBD | TBD |

### 2.2. Phân tích xác suất (RMSE)

| Metríc | Giá trị AI | Giá trị Baseline | Chênh lệch |
|---|---:|---:|---:|
| RMSE (win probability) | TBD | TBD | TBD |

### 2.3. Mức độ hợp lý (reasoning)

- Điểm trung bình (Likert 1–5): AI = TBD, Baseline = TBD
- Mô tả: chuyên gia đánh giá tính rõ ràng và logic của explanation do AI sinh.

### 2.4. Thời gian tạo đề xuất

| Điều kiện | Thời gian TB | Đơn vị |
|---|---:|---:|
| AI prediction | TBD | giây |
| Thủ công | TBD | phút |

## 3. Kết quả `AI arrangement`

### 3.1. Điểm cân bằng và tính thực thi

| Metríc | Giá trị AI | Giá trị Baseline | Ghi chú |
|---|---:|---:|---|
| Điểm cân bằng (Likert 1–5) | TBD | TBD | Đánh giá bởi chuyên gia |
| Tính thực thi (Likert 1–5) | TBD | TBD | Có/không khả thi |

### 3.2. Lỗi phân bổ

| Loại lỗi | Số lỗi (AI) | Số lỗi (Baseline) |
|---|---:|---:|
| Ngựa trùng lặp | TBD | TBD |
| Slot thiếu | TBD | TBD |
| Vi phạm ràng buộc | TBD | TBD |

### 3.3. Thời gian tạo đề xuất

| Điều kiện | Thời gian TB | Đơn vị |
|---|---:|---:|
| AI arrangement | TBD | giây |
| Thủ công | TBD | phút |

## 4. Hiệu quả Thời gian và Tác động Vận hành

- Thời gian tiết kiệm trung bình cho prediction: TBD (%)
- Thời gian tiết kiệm trung bình cho arrangement: TBD (%)

## 5. Khả năng Sử dụng (SUS)

| Vai trò | Điểm SUS (TB) | Số người |
|---|---:|---:|
| Admin | TBD | TBD |
| Referee / Mentor | TBD | TBD |
| Spectator | TBD | TBD |

## 6. Phân tích Thống kê và Kiểm định

- Kiểm định so sánh AI vs. Baseline: t-test hoặc Mann–Whitney U tùy phân phối.
- Kích thước hiệu ứng: Cohen's d.
- Độ tin cậy giữa người chấm: Fleiss' kappa.

## 7. Ví dụ minh hoạ

- Đính kèm một vài item mẫu (input + output AI + output baseline + đánh giá chuyên gia) trong phụ lục khi có dữ liệu thực tế.

## 8. Ghi chú

- Các giá trị TBD sẽ được điền sau khi thu thập logs từ các endpoint `POST /api/ai/prediction` và `POST /api/ai/arrangement` theo `experimental_setup1.md`.
