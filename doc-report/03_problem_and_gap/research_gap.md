# Phân tích Khoảng trống Nghiên cứu (Research Gap Analysis)

## 1. Limitations of Existing Solutions (Hạn chế của các giải pháp hiện tại)
Dựa trên việc đánh giá và tổng hợp các nghiên cứu học thuật cùng hệ thống vận hành thực tế hiện nay, các giải pháp hiện có đang bộc lộ ba hạn chế lớn về mặt kỹ thuật và tính năng:

* **Sự cô lập giữa Mô hình Dự đoán và Luồng nghiệp vụ Vận hành (Siloed Predictors vs. Integrated Workflows):** Các nghiên cứu về AI đua ngựa hiện tại (như các mô hình mạng nơ-ron hoặc logit đa biến) chủ yếu tồn tại dưới dạng các tập lệnh thuật toán độc lập trong môi trường thử nghiệm (Sandbox). Chúng hoàn toàn tách rời khỏi hệ thống quản lý hành chính cốt lõi, dẫn đến việc dữ liệu sinh trắc học và phong độ của ngựa không được tự động đồng bộ vào mô hình khi chủ ngựa đăng ký giải đấu.
* **Lập lịch dựa trên Kinh nghiệm thủ công vs. Tối ưu hóa Ràng buộc Tự động (Manual Scheduling vs. Automated Constraint Optimization):** Các phần mềm quản lý trường đua truyền thống chỉ dừng lại ở mức cung cấp các biểu mẫu nhập liệu (CRUD) cơ bản. Khi xếp lịch thi đấu, hệ thống hoàn toàn phụ thuộc vào sự sắp xếp thủ công của con người, không có khả năng tính toán đồng thời ma trận ràng buộc phức tạp (như cửa sổ thời gian hồi sức bắt buộc của ngựa, tính công bằng của trọng tài và lịch trình của nài ngựa).
* **Dữ liệu Thống kê Mô tả Tĩnh vs. Pipeline Phân tích Dự báo Thời gian thực (Descriptive Static Data vs. Real-time Predictive Pipeline):** Các bảng điều khiển hiện tại chỉ hiển thị dữ liệu lịch sử dạng tĩnh hoặc tỷ lệ cược mang tính thương mại từ nhà cái. Hệ thống thiếu một pipeline xử lý dữ liệu động có khả năng làm sạch, trích xuất đặc trưng sinh học và áp dụng các thuật toán xếp hạng tiên tiến (Learning-to-Rank) để truyền phát trực tiếp các dự báo khoa học đến giao diện người dùng trước giờ bóng lăn.

---

## 2. Defined Research Gap (Khoảng trống nghiên cứu được xác định)
> **Khoảng trống nghiên cứu (Research Gap):** Mặc dù các hệ thống quản lý thể thao truyền thống đã thực hiện tốt vai trò số hóa hành chính và các mô hình toán học độc lập đã giải được bài toán dự báo xác suất, nhưng vẫn tồn tại một **khoảng trống công nghệ rõ rệt** trong việc kết hợp một **hệ thống quản lý luồng nghiệp vụ toàn diện (Kiến trúc B/S)** với **bộ lõi tối ưu hóa lập lịch tự động (POX-Heuristic GA)** và **pipeline dự báo thứ hạng thời gian thực (Learning-to-Rank)** nhằm tối ưu hóa đồng thời hiệu suất vận hành, an toàn sức khỏe vật nuôi và trải nghiệm của khán giả.

---

## 3. Our Proposed Improvements & Contributions (Cải tiến và Đóng góp của nhóm)
Dự án của chúng tôi trực tiếp giải quyết các hạn chế trên thông qua ba đóng góp công nghệ cốt lõi sau:

* **Kiến trúc Nền tảng Web Tích hợp Đa tác nhân (Dynamic Integrated B/S Architecture):** Xây dựng hệ thống trên kiến trúc Trình duyệt/Máy chủ (B/S) bảo mật, kết nối trực tiếp luồng dữ liệu giữa 4 phân hệ người dùng (Admin, Chủ ngựa, Nài ngựa, Trọng tài). Mọi thông tin đăng ký hồ sơ và kết quả trận đấu được chuẩn hóa vào Database Schema ngay lập tức, xóa bỏ hoàn toàn tình trạng cô lập dữ liệu.
* **Bộ lõi Tối ưu hóa Lập lịch theo Tiến hóa (Heuristic-Driven Optimization Engine):** Triển khai thuật toán **POX-Heuristic Genetic Algorithm** tích hợp sâu bộ luật cấu hình ràng buộc cứng/mềm. Hệ thống tự động tính toán và xuất lịch thi đấu tối ưu chỉ trong vài giây, kiểm soát chặt chẽ tần suất chạy để bảo vệ sức khỏe cho ngựa đua và tự động phân bổ trọng tài không trùng lịch.
* **Pipeline Dự báo Lai ghép và Truyền phát Dữ liệu (Hybrid Predictive Streaming Pipeline):** Tích hợp mô hình **CatBoost/XGBoost Ranker (Listwise LambdaRank)** vào hệ thống xử lý. Pipeline này tự động trích xuất các đặc trưng sinh học của ngựa và phong độ nài ngựa từ Database để tính toán, sau đó sử dụng giao thức thời gian thực (WebSocket) để đẩy bảng xếp hạng dự đoán Top-k trực quan lên màn hình của khán giả, mang lại trải nghiệm tương tác hoàn toàn mới.