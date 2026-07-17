# Thiết lập Thực nghiệm (HorseTrack — Prediction & Arrangement)

## 1. Mục tiêu Thực nghiệm

- Xác định hiệu năng và chất lượng của `AI prediction` (xếp hạng, xác suất thắng, reasoning).
- Đánh giá chất lượng và tính cân bằng của `AI arrangement` (phân bổ ngựa vào race).
- Đo hiệu quả thời gian và trải nghiệm người dùng khi sử dụng các đề xuất AI so với quy trình thủ công.

## 2. Môi trường

### 2.1. Môi trường Phần mềm (Kiểm thử cục bộ và trong container)

| Thành phần | Thông số (HorseTrack) |
|---|---|
| Hệ điều hành (máy chủ kiểm thử) | Ubuntu 22.04 LTS (Docker / Cloud VM) |
| Frontend | Next.js 16, React 19, Tailwind CSS |
| Backend | Node.js 20, NestJS 11, TypeScript |
| Database | MongoDB (phiên bản phù hợp) với Mongoose |
| AI integration | `@google/genai` được gọi từ backend (`be/src/ai` services) |
| Xác thực | JWT + Passport |
| Thời gian thực | Socket.io |
| Kiểm thử | Jest, Supertest, e2e tests (be/test, test folder) |

### 2.2. Môi trường Phần cứng

| Môi trường | Thông số |
|---|---|
| Phát triển | Windows 11 / macOS, 16GB RAM, Docker Desktop |
| Máy chủ kiểm thử | Cloud VM (2 vCPU, 8–16GB RAM) hoặc Docker host tương đương |

## 3. Dữ liệu và Quy mô Kiểm thử

### 3.1. Dữ liệu dùng cho `AI prediction`

- Số lượng race để đánh giá: 30 race có kết quả thực tế (đã diễn ra).
- Mỗi race bao gồm danh sách ngựa, jockey, và các chỉ số lịch sử (thành tích, tốc độ, trạng thái sức khỏe nếu có).
- Nguồn dữ liệu: export từ MongoDB của HorseTrack hoặc tập dữ liệu mô phỏng với schema tương tự.

### 3.2. Dữ liệu dùng cho `AI arrangement`

- Số lượng tournament/test-case: 20 tournament hoặc kịch bản phân bổ.
- Mỗi kịch bản bao gồm số lượng race, slot (lane), danh sách ngựa tham gia và ràng buộc (ví dụ: không cho phép cùng owner trong một race).

### 3.3. Tham gia đánh giá

- Người đánh giá chuyên gia: 3–5 admin/referee có kinh nghiệm.
- Thử nghiệm usability: ≥ 20 người (admin, referee, spectator) để hoàn thành SUS.

## 4. Cấu hình Thử nghiệm và Chỉ số Thu thập

### 4.1. Chỉ số cho `AI prediction`

| Chỉ số | Đơn vị | Ghi chú |
|---|---:|---|
| Độ chính xác xếp hạng | % | Tỷ lệ thứ tự dự đoán trùng với kết quả thực tế (top-k, e.g., top-3) |
| RMSE của xác suất | RMSE | Sai số giữa xác suất dự đoán (win prob) và kết quả thực tế (0/1) |
| Mức độ hợp lý (reasoning) | Likert 1–5 | Đánh giá chuyên gia về tính hợp lý/giải thích |
| Thời gian hoàn thành | Giây | Thời gian backend để trả về prediction |

### 4.2. Chỉ số cho `AI arrangement`

| Chỉ số | Đơn vị | Ghi chú |
|---|---:|---|
| Điểm cân bằng (balance score) | Likert 1–5 hoặc metric | Đánh giá chuyên gia về mức độ cân bằng giữa các race |
| Tính thực thi | Likert 1–5 | Đánh giá liệu phân bổ có khả thi khi triển khai thật hay không |
| Số lỗi phân bổ | Số lỗi | Ngựa trùng lặp, slot thiếu, vi phạm ràng buộc |
| Thời gian tạo đề xuất | Giây | Thời gian backend trả về arrangement |

### 4.3. Hiệu quả thời gian và SUS

- Thời gian tiết kiệm (prediction): so sánh thời gian admin/referee tạo dự đoán thủ công vs. thời gian dùng AI.
- Thời gian tiết kiệm (arrangement): so sánh thời gian sắp xếp thủ công vs. thời gian dùng AI.
- SUS: hệ thống đo trải nghiệm (10 câu) cho admin/referee/spectator.

## 5. Cấu hình API LLM (mặc định thử nghiệm)

| Cài đặt | Giá trị đề xuất |
|---|---|
| Model | Google GenAI model (định cấu hình qua `@google/genai`) |
| Temperature | 0.2–0.4 (ổn định cho reasoning có trật tự) |
| Max tokens | 512 |
| Top-p | 0.9–0.95 |
| Thử lại khi thất bại | 2 lần tối đa |

> Lưu ý: cấu hình thực tế phải khớp với thiết lập trong `be/src/ai` khi chạy test.

## 6. Quy trình Thử nghiệm

1. Chuẩn bị dữ liệu đầu vào (export từ MongoDB hoặc mô phỏng theo schema).
2. Chạy endpoint `POST /api/ai/prediction` cho từng race; lưu log đầu ra gồm `ranking`, `strengthScore`, `reasoning`, thời gian trả về.
3. Chạy endpoint `POST /api/ai/arrangement` cho từng kịch bản; lưu log phân bổ và thời gian trả về.
4. Cung cấp kết quả AI và baseline (tự tay) cho chuyên gia đánh giá theo phương pháp mù.
5. Thu thập SUS và số liệu thời gian từ người dùng thực nghiệm.
6. Phân tích số liệu (RMSE, accuracy, t-test / Mann–Whitney, Cohen's d) và chuẩn bị báo cáo.

## 7. Độ tin cậy giữa người đánh giá

- Huấn luyện ngắn (20–30 phút) cho chuyên gia trước khi chấm.
- Mỗi item được đánh bởi ít nhất 2 chuyên gia độc lập.
- Tính Fleiss' kappa để kiểm tra độ nhất quán; ngưỡng chấp nhận ≥ 0.6.

## 8. Ghi chú Thực thi

- Nếu dữ liệu thật không đủ, chuẩn hoá kịch bản mô phỏng với schema giống MongoDB.
- Lưu logs đầy đủ (request body, response, timestamps) để phục vụ phân tích sau này.
