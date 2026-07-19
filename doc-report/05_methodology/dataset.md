# Dữ liệu

## 1. Tổng quan yêu cầu dữ liệu

| Thành phần | Dữ liệu cần có | Kích thước | Nguồn |
|---|---|---|---|
| Đánh giá email | Kịch bản thông báo cuộc thi + ngữ cảnh | 80 kịch bản | Mô phỏng hoặc dữ liệu thực từ cuộc thi trước |
| Baseline email | Email viết tay cho các kịch bản | 80 email | Viết bởi nhân viên quản trị |
| Đánh giá câu hỏi phỏng vấn | Bài review dự án | 30 bài review | Dữ liệu thực hoặc mô phỏng |
| Baseline câu hỏi | Bộ câu hỏi phỏng vấn do chuyên gia soạn | 30 bộ | Giám khảo/mentor có kinh nghiệm |
| Kiểm tra Timeline Agent | Sự kiện mốc thời gian và hành động mong đợi | 50 mốc | Kịch bản tổng hợp |
| Nghiên cứu khả năng sử dụng | Người tham gia ở các vai trò | ≥ 30 người | Nhân viên, giám khảo, sinh viên |

## 2. Dữ liệu đánh giá email

### 2.1. Số lượng và cấu trúc kịch bản

| Loại email | Số kịch bản | Thông số biến thể |
|---|---|---|
| Thông báo vào chung kết | 20 | tên đội, bảng, chủ đề, vị trí chung kết |
| Nhắc deadline | 20 | tên đội, thời gian còn lại (1, 3, 5, 7 ngày), trạng thái nộp bài |
| Cảnh báo chưa nộp bài | 20 | tên đội, số giờ còn lại, số thành viên chưa xác nhận |
| Phân công mentor | 20 | tên đội, tên mentor, bảng, kênh họp |

### 2.2. Thu thập baseline email

- Giao cùng 80 kịch bản cho 2–3 nhân viên quản trị.
- Yêu cầu viết email thủ công, không dùng AI.
- Ghi lại thời gian thực tế tạo mỗi email.
- Tập hợp 80 email baseline dùng làm đối chứng so sánh.

### 2.3. Thu thập dữ liệu AI email

- Dùng cùng 80 kịch bản đầu vào cho mô hình AI.
- Lưu kết quả đầu ra của AI theo từng kịch bản.
- Ghi lại thời gian xử lý và số lần chỉnh sửa cần thiết.

## 3. Dữ liệu câu hỏi phỏng vấn

### 3.1. Thu thập bài review dự án

**Phương án ưu tiên**: Dữ liệu thực tế

- Thu thập review thực từ các cuộc thi FPT trước đây.
- Ẩn danh hóa thông tin đội và giám khảo.
- Đảm bảo đa dạng loại dự án: web, mobile, AI, IoT.
- Mục tiêu tối thiểu 30 bài review.

**Phương án dự phòng**: Dữ liệu mô phỏng

- Sinh review theo cấu trúc rubric cuộc thi.
- Mô tả đủ nội dung: điểm mạnh, điểm yếu, nhận xét kỹ thuật, đề xuất cải tiến.
- Được giảng viên hoặc chuyên gia kiểm duyệt.

### 3.2. Sinh câu hỏi AI

- Chạy mô hình AI trên 30 bài review.
- Mỗi bài tạo 5–7 câu hỏi phỏng vấn.
- Lưu định dạng đầu ra gồm: câu hỏi, mục tiêu, mức độ ưu tiên.

### 3.3. Baseline câu hỏi phỏng vấn

- Giao 30 bài review cho 3–5 giám khảo hoặc mentor có kinh nghiệm.
- Yêu cầu tạo bộ câu hỏi phỏng vấn như cách thức thực tế.
- Ghi lại thời gian hoàn thành và ghi chú về lý do chọn câu hỏi.

## 4. Dữ liệu kiểm tra Timeline Agent

- Chuẩn bị 50 mốc sự kiện giả lập trên 5 kịch bản giải đấu.
- Mỗi mốc gồm: `thoi_gian_du_kien`, `hanh_dong_mong_doi`, `loai_hanh_dong`, `trang_thai_hien_tai`.
- Thử nghiệm trong cửa sổ kiểm thử ngắn (1–2 giờ) để đo sai lệch.
- Thu thập kết quả thực tế bao gồm: thời gian kích hoạt, hành động đã thực hiện, lỗi nếu có.

## 5. Dữ liệu nghiên cứu khả năng sử dụng

| Vai trò | Mục tiêu | Số lượng |
|---|---|---|
| Admin | Đánh giá luồng tạo giải đấu, kiểm soát email AI, quản lý | ≥ 10 |
| Giám khảo / Mentor | Đánh giá luồng review, câu hỏi AI, chấm điểm | ≥ 10 |
| Thí sinh | Đánh giá cổng thông tin người dùng, trải nghiệm xem race | ≥ 10 |
| **Tổng** |  | **≥ 30** |

### 5.1. Nhiệm vụ người tham gia

- Admin: tạo giải đấu, phân công referee, kiểm tra email AI, duyệt đăng ký.
- Giám khảo: nhập review, xem câu hỏi AI, chấm điểm, gửi phản hồi.
- Thí sinh: đăng nhập, xem thông tin đội, bảng, chủ đề, countdown.

### 5.2. Thu thập phản hồi

- Dùng bảng khảo sát sau nhiệm vụ.
- Ghi lại nhận xét về độ rõ ràng, độ tin cậy và mức độ hữu ích của AI.
- So sánh cảm nhận giữa cách làm hiện tại và với HorseTrack.

## 6. Quyền riêng tư và đạo đức dữ liệu

- Ẩn danh hóa toàn bộ dữ liệu thực tế trước khi lưu hoặc đánh giá.
- Không sử dụng thông tin nhận dạng cá nhân trong kịch bản hoặc output.
- Người tham gia nghiên cứu ký đồng ý tham gia, biết mục đích sử dụng dữ liệu.
- Dữ liệu cá nhân bị xóa khi kết thúc nghiên cứu.

## 7. Ghi chú về khả năng sẵn có dữ liệu

Nếu không thu thập được đủ dữ liệu thực tế, sử dụng dữ liệu mô phỏng được xây dựng theo rubric và mẫu review thực tế. Dữ liệu mô phỏng cần được xác nhận bởi chuyên gia để đảm bảo độ tin cậy của kết quả nghiên cứu.
