# Luồng Dữ liệu (Data Flow) — Horse Racing Tournament Management System

## 1. Luồng Thiết lập Giải đua

Quản trị viên (Admin) đăng nhập vào hệ thống.

### Quy trình

1. Tạo giải đua mới:
   - Tên giải
   - Mô tả
   - Quy mô trường đua
   - Timeline (mở/đóng đăng ký chiến mã, vòng loại, chung kết)
   - Số lượng phân khúc/lượt đua (ví dụ: 5 lượt đua theo hạng cân)
   - Quy định cấu hình ràng buộc:
     - Thời gian nghỉ tối thiểu của ngựa
     - Cự ly chặng
     - Loại mặt sân

2. Backend lưu toàn bộ thông tin vào cơ sở dữ liệu.

3. Race Timeline Agent cấu hình các mốc thời gian của giải đấu.

4. Hệ thống tự động **MỞ** cổng đăng ký trực tuyến dành cho Chủ ngựa.

---

# 2. Luồng Đăng ký Tham gia của Chủ ngựa

Chủ ngựa truy cập cổng đăng ký công khai của giải đua.

### Quy trình

1. Điền thông tin:
   - Chủ sở hữu
   - Thông tin chiến mã:
     - Tên
     - Tuổi
     - Hạng cân
     - Phả hệ
   - Chọn Nài ngựa (Jockey)

2. Gửi đơn đăng ký.

3. Backend xử lý:

   1. Tạo bản ghi Ngựa và Nài ngựa trong CSDL với trạng thái:

      ```
      CHỜ XÁC THỰC Y TẾ
      ```

   2. Gửi thông báo xác nhận đến Email hoặc ứng dụng của Nài ngựa.

   3. Nài ngựa xác nhận tham gia.

   4. Bác sĩ thú y cập nhật kết quả kiểm tra sinh học.

4. Sau khi hoàn tất xác thực:

```
ĐÃ ĐĂNG KÝ THÀNH CÔNG
```

5. Khi đến hạn đóng đơn, hệ thống tự động khóa cổng đăng ký.

---

# 3. Luồng Lập Lịch Thi Đấu và Chia Lượt Tự động

Race Timeline Agent kích hoạt mốc:

```
DONG_DANG_KY
```

### Backend thực hiện

1. Truy vấn toàn bộ chiến mã và nài ngựa đã xác nhận.

2. Gọi AI Service (gRPC/REST).

3. AI Service chạy thuật toán:

- POX-Heuristic Genetic Algorithm
- Phân bổ chiến mã theo hạng cân
- Tối ưu thời gian nghỉ
- Tối ưu sơ đồ đường đua
- Gán trọng tài không trùng lịch và không xung đột lợi ích

4. AI trả về lịch thi đấu tối ưu.

5. Admin xem Dashboard và phê duyệt.

### Sau khi phê duyệt

Cổng thông tin công khai hiển thị:

- Lịch thi đấu
- Thời gian từng lượt đua
- Sơ đồ Track
- Đồng hồ đếm ngược

---

# 4. Luồng Sinh Nhận Định và Bình Luận AI

Race Timeline Agent kích hoạt:

```
KICH_HOA_DU_BAO
```

(15 phút trước giờ đua)

Backend tạo Context:

```json
{
  "loai_van_ban": "BINH_LUAN_TRUOC_TRAN",
  "ten_luot_dua": "...",
  "cu_ly_meters": 1200,
  "loai_mat_san": "Turf",
  "danh_sach_chien_ma": [],
  "ti_le_odds_thi_truong": "..."
}
```

Backend gọi:

```
POST /api/v1/ai/sinh-binh-luan
```

### AI Service

1. Đọc Prompt Template.

2. Ghép dữ liệu Context.

3. Gọi LLM:

- Gemini 1.5 Flash
- GPT-4o-mini

4. Guardrails kiểm tra:

- Độ dài
- Hallucination
- Sai số dữ liệu

5. Trả về:

```json
{
  "tieu_de_nhan_dinh": "...",
  "noi_dung_chi_tiet": "..."
}
```

Backend:

- Lưu CSDL
- Lưu Redis Cache
- Broadcast WebSocket

Khán giả nhận bài bình luận ngay lập tức.

---

# 5. Luồng Dữ liệu Cổng thông tin Khán giả

Khán giả truy cập Web Browser.

### Quy trình

1. Thiết lập kết nối WebSocket.

2. Frontend cập nhật liên tục:

- Danh sách lượt đua
- Danh sách chiến mã
- Danh sách nài ngựa
- Đồng hồ đếm ngược
- Top-k dự báo từ LambdaRank

3. Hiển thị biểu đồ xác suất chiến thắng.

4. Toàn bộ dữ liệu ở chế độ:

```
Read-Only
```

5. Khi Race Timeline Agent chuyển trạng thái:

```
LIVE
```

Cổng cược tự động khóa.

---

# 6. Luồng Phân công Trọng tài

Admin thực hiện phân công.

### Quy trình

1. Chọn lượt đua.

2. Chọn tài khoản Trọng tài.

3. Backend kiểm tra:

- Phả hệ
- Chủ sở hữu
- Quan hệ kinh tế
- Xung đột lợi ích

4. Nếu hợp lệ:

- Lưu CSDL
- Gửi thông báo

5. Trọng tài đăng nhập.

6. Dashboard chỉ hiển thị các lượt đua được phân công.

---

# 7. Luồng Ghi nhận Kết quả và Tái Huấn luyện AI

Sau khi chiến mã về đích.

### Trọng tài nhập

- Thời gian chạy
- Thứ hạng
- Nhịp tim
- Độ kiệt sức

Backend:

- Lưu kết quả
- Chuyển trạng thái:

```
ĐÃ KẾT THÚC
```

### Worker (Celery)

1. So sánh dự báo với kết quả thực tế.

2. Tính:

```
NDCG
```

3. Label dữ liệu.

4. Ghi vào Data Warehouse.

5. Nếu:

```
NDCG < 0.75
```

→ Kích hoạt:

```
Automated Model Retraining
```

Sau đó bảng điện tử cập nhật kết quả chính thức.

---

# 8. Luồng Tổng hợp Điểm và Chọn Nhà Vô địch

Sau khi kết thúc vòng loại.

Backend:

1. Đọc toàn bộ điểm tích lũy.

2. Sắp xếp giảm dần.

3. Chọn:

- Top 2
- Hoặc Top K

4. Cập nhật trạng thái:

```
VÀO_CHUNG_KẾT
```

hoặc

```
DỪNG_BƯỚC
```

Race Timeline Agent gửi thông báo lịch thi đấu chung kết.

---

# 9. Luồng Xử lý Khiếu nại

Chủ ngựa hoặc Nài ngựa gửi khiếu nại.

Thông tin gồm:

- race_id
- horse_id
- jockey_id
- Loại vi phạm
- Nội dung

Backend:

1. Lưu trạng thái:

```
CHỜ XỬ LÝ
```

2. Thông báo cho Ban tổ chức.

3. Trọng tài xem xét video.

4. Cập nhật trạng thái:

```
CHỜ XỬ LÝ
↓
ĐANG XÁC MINH
↓
ĐÃ GIẢI QUYẾT
```

5. Công bố kết quả ở chế độ Read-Only.

---

# 10. Luồng Truy cập Dữ liệu Lịch sử

Admin hoặc Analyst yêu cầu báo cáo.

Hệ thống kiểm tra quyền.

Nếu hợp lệ:

- Kết quả thi đấu
- Thành tích chiến mã
- Nhật ký y tế
- Số giờ thi đấu của nài ngựa
- Lịch sử độ chính xác của AI
- Log huấn luyện mô hình

Dữ liệu được hiển thị dưới dạng báo cáo tĩnh.

Toàn bộ báo cáo ở chế độ:

```
Read-Only
```