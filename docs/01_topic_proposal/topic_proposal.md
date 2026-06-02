# Đề tài dự kiến: Hệ thống quản lý giải đua ngựa (HorseTrack)

* **Nhóm:** 7 (Lớp: SE1820)
* **Trưởng nhóm:** Trương Nguyễn Hoàng
* **Thành viên:** Nguyễn Quang Vinh, Nguyễn Hoài Anh, Lạc Huỳnh Vỹ, Phan Thế Trung

---

## 1. Tên đề tài dự kiến

**HorseTrack - Hệ thống quản lý giải đua ngựa và dự đoán kết quả bằng AI**

---

## 2. Lĩnh vực ứng dụng

* Quản lý vận hành giải đấu thể thao chuyên nghiệp
* Hệ thống hỗ trợ ra quyết định
* Ứng dụng truyền tải dữ liệu thời gian thực (Real-time Application)
* Trí tuệ nhân tạo & Phân tích dự báo phi tuyến tính (Machine Learning / Neural Networks)

---

## 3. Vấn đề thực tế

Quy trình tổ chức, vận hành và khai thác các giải đua ngựa hiện nay tại trường đua gặp phải các bài toán nan giải sau:

* **Lập lịch thi đấu thủ công phức tạp**: Tốn thời gian sắp xếp lịch đấu, dễ trùng lịch.
* **Trọng tài thiếu công cụ di động**: Việc kiểm tra thể trạng ngựa, ghi nhận vi phạm bằng biên bản giấy dễ sai sót.
* **Ghép cặp nhân sự cảm tính**: Việc ghép cặp nài ngựa với ngựa, ngựa với chủ trại chưa tối ưu.
* **Khán giả bị hạn chế trải nghiệm**: Thiếu các tính năng theo dõi trận đấu trực quan, sinh động.

---

## 4. Đối tượng người dùng

* Ban tổ chức giải đấu
* Chủ trại ngựa
* Nài ngựa
* Trọng tài trường đua
* Khán giả/Người hâm mộ

---

## 5. Lý do cần tích hợp AI

Việc tích hợp AI giúp giải quyết các bài toán tối ưu và nâng cao trải nghiệm, cụ thể:

* Tự động hóa xếp lịch tối ưu, tránh trùng lịch, giảm thời gian sắp xếp lịch đấu.
* Dự đoán phi tuyến tính chính xác về tỷ lệ thắng thua của mỗi nài ngựa với mỗi ngựa.
* Khắc phục lỗi thiếu dữ liệu, đưa ra đề xuất ghép cặp tối ưu ngay từ đầu.
* Tính tỷ lệ cược động theo thời gian thực.

---

## 6. Model AI dự kiến sử dụng

Hệ thống dự kiến sử dụng kết hợp các thuật toán và mô hình AI:

* **Multilayer Feedforward ANN (Kiến trúc 8-5-7-1)**: 8 node input (Cân nặng, loại giải, huấn luyện viên, nài ngựa, số ngựa, khoảng cách, mặt sân, thời tiết), 5 node hidden layer, 7 node hidden layer, 1 node output (thời gian về đích).
* **POX-heuristic GA (Genetic Algorithm)**: Thuật toán di truyền giúp sắp xếp lịch đua tối ưu, tránh trùng lặp nhờ kết hợp lai ghép và đột biến thông minh cho Admin.
* **Hybrid Recommendation Methods**: Cách gợi ý kết hợp giúp tìm kiếm phù hợp hơn, phân tích phong độ qua biểu đồ Radar và ghép cặp nhân sự hiệu quả.

### Kiến trúc xử lý chính

```text
Thu thập dữ liệu (thời tiết, phong độ, hồ sơ)
→ Tiền xử lý dữ liệu đầu vào
→ Áp dụng POX-heuristic GA để lập lịch thi đấu
→ Đưa dữ liệu trận đấu vào Multilayer Feedforward ANN
→ Dự đoán thời gian về đích và tính tỷ lệ cược
→ Hiển thị kết quả dự đoán và Live Tracker cho người dùng
```

---

## 7. Kết quả mong muốn

Hệ thống hướng tới các kết quả sau:

* Xây dựng hệ thống prototype cho quản lý giải đua ngựa hoạt động theo thời gian thực (Real-time).
* Đóng gói API AI ổn định: Triển khai mô hình AI thành API chạy trên NestJS với thời gian phản hồi xử lý thuật toán nhanh.
* Tích hợp Live Race Tracker: Cập nhật vị trí ngựa chạy liên tục với độ trễ thấp, mượt mà mà không cần tải lại trang (sử dụng WebSocket Socket.IO & Redis Adapter).
* Mô hình dự báo độ chính xác cao: Mô hình ANN 8-5-7-1 tích hợp trên web giúp dự đoán thứ hạng chặng đua với độ chính xác trung bình gần 77%.
* Cung cấp Dashboard quản trị trực quan, Kanban Board để quản lý trại ngựa cá nhân hóa.
* Hỗ trợ trọng tài lập biên bản vi phạm nhanh chóng bằng Tags và thu thập chữ ký điện tử trực tiếp.
* Đồng bộ đa ngôn ngữ (i18n): Tự động đổi URL và hiển thị giao diện Anh - Việt theo ngôn ngữ người dùng.
