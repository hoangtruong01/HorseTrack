# Literature Review Matrix

**Topic:** Nghiên cứu phương pháp luận tối ưu hóa tổ hợp, học máy dự đoán thứ hạng và kiến trúc phân tầng xử lý dữ liệu thời gian thực ứng dụng trong hệ thống **Quản lý giải đua ngựa (Horse Racing Tournament Management System)**.

| STT | Bài báo / Tác giả | Năm / Nguồn | Lĩnh vực | Vấn đề nghiên cứu | AI / Phương pháp | Rubric / Tiêu chí | Dataset / Context | Metrics / Evaluation | Đóng góp cho dự án | Hạn chế | Relevance | Ứng dụng vào workflow |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 01 | Mu-Chun Su et al. | 2025 / IJITDM | Scheduling | Lập lịch giải đấu với nhiều ràng buộc chồng chéo. | Genetic Algorithm (POX-Heuristic) | Tối ưu thời gian nghỉ của ngựa, triệt tiêu xung đột lịch. | Dữ liệu giải đấu giả lập, phân hạng cân, danh sách ngựa. | Xung đột lịch = 0; Tốc độ hội tụ Fitness. | Thuật toán lõi tự động lập lịch thi đấu. | Chưa tính biến số thời tiết cực đoan đột xuất. | Core / Algorithm | Tích hợp vào module "Tạo giải đấu & Xếp lịch" của Admin. |
| 02 | Elnaz Davoodi et al. | 2010 / WSEAS | Prediction | Dự đoán kết quả phi tuyến tính. | Artificial Neural Networks (MLP) | Độ chính xác thời gian về đích dự kiến. | Dữ liệu lịch sử đua ngựa (Iran, Châu Á). | MSE; Accuracy xếp hạng Top 1-3. | Dự báo thời gian dựa trên sinh trắc học và phong độ. | Nhạy cảm với dữ liệu nhiễu. | Supporting / AI Component | Cập nhật Live Tracker chỉ số chênh lệch thời gian. |
| 03 | Yubin So et al. | 2025 / JKSCI | Learning-to-Rank | Dự đoán thứ hạng Top-k. | CatBoost / XGBoost Ranker | Khả năng tối ưu hóa danh sách thứ bậc toàn đoàn. | Dữ liệu đua ngựa Hàn Quốc (KRA). | NDCG; MAP; MRR. | Giải pháp thuật toán xếp hạng Top 3/5 chiến mã. | Gặp hiện tượng "Cold Start" cho ngựa mới. | Core / AI Component | Hiển thị đồ thị dự báo cho Spectator trước giờ đua. |
| 04 | NYC Data Science | 2023 / Blog | Data Pipeline | Tự động hóa pipeline dữ liệu. | Random Forest / XGBoost | Tốc độ xử lý dữ liệu thô và độ chính xác dự đoán. | Dữ liệu lịch sử Hồng Kông (HKJC). | Log Loss; ROC-AUC; F1-Score. | Khung Pipeline ETL làm sạch và trích xuất đặc trưng. | Xử lý dữ liệu Batch, chưa tối ưu Streaming. | High / Implementation | Phân hệ tiền xử lý hồ sơ đăng ký thi đấu. |
| 05 | Eva Sobotková et al. | 2023 / Acta Agr | Domain Analytics | Yếu tố sinh học & môi trường ảnh hưởng thành tích. | ANOVA; GLM | Mức độ tương quan (tuổi, giới tính, dòng giống). | Dữ liệu thuần chủng Thoroughbred (Séc). | P-value; R-squared; F-value. | Bộ tiêu chí khoa học cho Feature Engineering. | Không có tính năng dự đoán bằng AI. | Domain / Feature Eng | Thiết kế Database Schema cho bảng `Horse`. |
| 06 | ZhiGuo Zhu | 2025 / PeerJ | Architecture | Kiến trúc truyền dữ liệu streaming. | WSN / Mạng Nơ-ron | Độ trễ truyền tải; Tính toàn vẹn dữ liệu. | Hệ thống đo tốc độ và cảm biến sinh học. | Throughput; Packet Loss; Latency. | Bản thiết kế kiến trúc phân tầng 7 lớp. | Chi phí phần cứng WSN cao. | High / System Design | Tầng API Gateway xử lý WebSocket giữa Referee và Server. |
| 07 | William Benter | 1994 / World Sci | Betting Strategy | Kết hợp dữ liệu phong độ & tỷ lệ thị trường. | Multinomial Logit Model | Tỷ lệ sinh lời (ROI); Độ lệch so với đám đông. | Dữ liệu cá cược Hồng Kông lịch sử. | Information Coefficient; R-squared. | Phương pháp lai ghép AI nội bộ và dữ liệu đám đông. | Mô hình tĩnh, khó thay đổi linh hoạt. | Supporting / Strategy | Tính năng "AI + Crowd Prediction Matrix". |
| 08 | Graham Kendall et al. | 2010 / Comp & OR | Theory | Điều kiện biên trong lập lịch thể thao. | Constraint Logic | Tính toàn vẹn logic (không trùng lặp). | Khảo sát các giải thể thao chuyên nghiệp. | Tối thiểu vi phạm ràng buộc mềm. | Bộ khung lý thuyết phân định điều kiện biên cứng/mềm. | Chỉ là tổng quan lý thuyết, thiếu source code. | Supporting / Logic Backend | Bộ luật Validation Rules tại Backend ngăn chặn sai sót lịch. |
| 09 | Faten K. Karim et al. | 2025 / THERMAL | Optimization | Tối ưu hóa hạ tầng điện toán đám mây. | Horse Herd Optimization (HHO) | Makespan (Thời gian hoàn thành tác vụ). | Mô phỏng đám mây song song. | Makespan; Resource Utilization. | Thuật toán tối ưu hạ tầng, giảm độ trễ phản hồi. | HHO mới, phức tạp để cấu hình triển khai. | Supporting / Infra | Cấu hình Auto-scaling và cơ chế xử lý tác vụ ngầm. |
| 10 | Shuang Zhang | 2022 / Sci Prog | Decision Mgmt | Quản lý quyết định vận hành. | Web App (B/S) + BPNN | Độ tiện dụng UX; Tốc độ phê duyệt. | CSDL trường đua chuyên nghiệp. | Response Time; Tỷ lệ phê duyệt chính xác. | Mô hình kiến trúc Web App đa tác nhân. | Thuật toán luật kết hợp truyền thống, cũ. | High / Web Architecture | Số hóa luồng: Owner đăng ký -> Referee chấm điểm. |

---

## Kết luận: Nghiên cứu Khoa học & Đóng góp của Dự án

Thông qua việc lập ma trận literature review từ 10 bài báo khoa học chất lượng cao, chúng tôi rút ra những kết luận quan trọng về khoảng trống tri thức và giá trị thực tiễn mà hệ thống **Horse Racing Tournament Management System** mang lại:

### 1. Research Gap (Khoảng trống nghiên cứu)
Các nghiên cứu hiện tại về quản lý giải đua ngựa hoặc AI dự đoán thường tồn tại dưới dạng các module rời rạc, chưa có sự kết nối chặt chẽ:
* **Thiếu tính đồng bộ:** Các mô hình dự đoán (bài 02, 03, 07) thường tập trung vào bài toán toán học thuần túy hoặc dự đoán xác suất mà tách rời khỏi quy trình nghiệp vụ thực tế của một trường đua.
* **Quy trình vận hành lạc hậu:** Trong khi các hệ thống quản lý thể thao hiện đại (bài 06, 10) đã áp dụng kiến trúc phần mềm tiên tiến, thì phần lớn các trường đua vẫn vận hành thủ công, dẫn đến sai sót trong phân công trọng tài và lập lịch.
* **Thách thức về bài toán lập lịch:** Chưa có giải pháp nào kết hợp được giữa các ràng buộc logic khắt khe của con người (Hard/Soft Constraints - bài 08) với các thuật toán tối ưu hóa động (POX-Heuristic GA - bài 01) để xử lý tình trạng quá tải (kiệt sức) của ngựa trong thời gian thực.

### 2. Đóng góp của dự án (Our Contributions)
Hệ thống được thiết kế để lấp đầy các khoảng trống trên bằng một giải pháp tích hợp toàn diện (All-in-one platform):

* **Tối ưu hóa Vận hành:** Áp dụng **POX-Heuristic Genetic Algorithm** để tự động hóa lập lịch thi đấu, đảm bảo tính công bằng và an toàn sức khỏe cho ngựa (đóng góp từ Bài 01 & 08).
* **Hỗ trợ Ra quyết định:** Xây dựng module hỗ trợ Admin dựa trên mô hình kiến trúc B/S tiêu chuẩn (Bài 10) và tích hợp logic phân công trọng tài thông minh giúp loại bỏ xung đột lợi ích.
* **Trải nghiệm Dự đoán thông minh:** Tích hợp các mô hình **Learning-to-Rank (LambdaRank)** và **Ensemble Learning** (Bài 03, 04) để dự đoán Top-k ngựa chiến thắng. Đồng thời cung cấp tính năng "AI + Crowd Prediction Matrix" (Bài 07), kết hợp dữ liệu dự đoán từ AI với tỷ lệ cược của đám đông, tạo giá trị thực cho khán giả.
* **Tiêu chuẩn hóa Dữ liệu:** Thiết lập chuẩn Database Schema dựa trên các yếu tố ảnh hưởng trực tiếp đến thành tích ngựa (Bài 05), tạo nền tảng vững chắc cho phân tích dữ liệu chuyên sâu.

**Tổng kết:** Dự án của chúng tôi không chỉ dừng lại ở việc quản lý hành chính, mà là một hệ sinh thái thông minh (Intelligent Ecosystem) kết hợp giữa tối ưu hóa tổ hợp (Combinatorial Optimization) và học máy (Machine Learning) để hiện đại hóa toàn diện quy trình vận hành giải đua ngựa.