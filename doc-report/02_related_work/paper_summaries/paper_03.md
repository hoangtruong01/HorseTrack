# Citation
* **Tác giả:** Yavuzkan Paksoy, Uğur Duruk, Ahmet Akay, Ahmet Koluman.
* **Đơn vị công tác:** Department of Plant and Animal Production, Necmettin Erbakan University; Biomedical Engineering Department, Pamukkale University, Türkiye.
* **Tên bài báo:** Machine learning modeling for environmental factors affecting horse racing.
* **Nguồn xuất bản:** Large Animal Review, Year 2025, Vol. 31, pp. 383-390.
* **Link:** https://www.largeanimalreview.com/index.php/lar/article/view/1007/354

# Problem
* Hiệu suất và kết quả thi đấu của ngựa đua chịu ảnh hưởng sâu sắc từ các điều kiện ngoại cảnh như nhiệt độ, độ ẩm, bề mặt sân và hướng gió, nhưng các phương pháp phân tích thống kê truyền thống thường thất bại trong việc ghi nhận các mối quan hệ phi tuyến phức tạp này.
* Khác với các môn thể thao của con người nơi vận động viên có thể chủ động kiểm soát hoặc điều chỉnh một phần môi trường thi đấu, ngựa đua buộc phải thích nghi thụ động với ngoại cảnh, dẫn đến sự biến động phong độ rất lớn và khó lường.
* Việc thiếu các mô hình động có khả năng tích hợp dữ liệu thời tiết và trạng thái sân đua theo thời gian thực làm hạn chế năng lượng đưa ra quyết định chiến lược của các huấn luyện viên, nhà tổ chức giải đấu và người tham gia cá cược.

# Method
* **Ứng dụng học máy:** Nghiên cứu thử nghiệm và ứng dụng 5 thuật toán học máy phổ biến để mô hình hóa và dự đoán hiệu suất cuộc đua bao gồm: Support Vector Machines (SVM), Decision Trees, K-Nearest Neighbors (KNN), Random Forest, và AdaBoost.
* **Tiền xử lý dữ liệu:** * *Xử lý dị biệt:* Áp dụng phương pháp biên khoảng cách 1.5 × IQR (Interquartile Range) để phát hiện, loại bỏ hoặc điều chỉnh các điểm dữ liệu bất thường nhằm duy trì tính toàn vẹn của tập dữ liệu.
  * *Mã hóa đặc trưng:* Chuyển đổi các biến phân loại (như loại sân đua, mùa giải thi đấu, thuộc tính định danh của ngựa) thành các biểu diễn số thông qua kỹ thuật Label Encoding và One-hot Encoding.
  * *Chuẩn hóa dữ liệu (Feature Scaling):* Do các biến số (nhiệt độ, độ ẩm, khoảng cách đua) có phạm vi giá trị rất khác nhau, kỹ thuật Min-Max Scaling đã được áp dụng để đưa dữ liệu về khoảng [0, 1]. Thử nghiệm cho thấy Min-Max Scaling mang lại sự ổn định dự đoán tốt hơn phương pháp chuẩn hóa Z-score.

# Dataset
* Tập dữ liệu nghiên cứu sử dụng dữ liệu lịch sử các giải đua ngựa thực tế kết hợp với các thông số môi trường ghi nhận tại thời điểm diễn ra trận đấu.
* Các thuộc tính dữ liệu bao gồm: Loại sân đua (Sân cát - dirt, sân cỏ - turf, sân tổng hợp - synthetic từ hỗn hợp cát đúc sáp, cao su và sợi), cự ly chặng đua, mùa giải, nhiệt độ, độ ẩm và tốc độ gió.
* Phân chia tập dữ liệu: Toàn bộ dữ liệu được chia theo tỷ lệ nghiêm ngặt: 70% dành cho tập huấn luyện (Training Set), 15% dành cho tập kiểm định (Validation Set - dùng để tinh chỉnh siêu tham số và tránh quá khớp), và 15% dành cho tập kiểm thử độc lập (Test Set).

# Evaluation
* **Mô hình đối chứng:** Tiến hành so sánh chéo hiệu năng dự đoán trực tiếp giữa các thuật toán SVM, Decision Trees, KNN, Random Forest và AdaBoost.
* **Chỉ số đánh giá:** Hiệu quả của mô hình được chấm điểm dựa trên độ chính xác dự đoán (Accuracy), mức độ ổn định (Stability) và khả năng thích ứng linh hoạt với các biến số thời tiết động.
* **Phân tích độ quan trọng:** Sử dụng thuật toán Random Forest để thực hiện phân tích "Feature Importance", bóc tách và xếp hạng mức độ ảnh hưởng của từng yếu tố môi trường đối với kết quả cuối cùng của cuộc đua.

# Results
* **Mô hình tối ưu nhất:** SVM (Support Vector Machines) đạt độ chính xác cao nhất với **46.8%**. Thuật toán chứng minh khả năng xử lý xuất sắc dữ liệu cấu trúc phức tạp chứa các biến số môi trường phi tuyến. Ngược lại, Decision Trees và KNN cho kết quả thấp nhất do gặp khó khăn trong việc khái quát hóa điều kiện cuộc đua.
* **Tầm quan trọng của các yếu tố ngoại cảnh:** Phân tích trọng số chỉ ra rằng **Điều kiện bề mặt sân đua (Track condition)** là yếu tố có sức ảnh hưởng lớn nhất đến kết quả trận đấu. Sân đua tổng hợp (Synthetic tracks) được chứng minh là cho kết quả đua ổn định và ít bị biến động bởi thời tiết nhất do khả năng chống nước và chịu nhiệt tốt hơn sân tự nhiên.
* **Ngưỡng thời tiết lý tưởng:** * *Nhiệt độ:* Khoảng nhiệt độ từ **10°C đến 21°C** là môi trường lý tưởng nhất để ngựa tối ưu hóa tốc độ. Nhiệt độ cực đoan (quá nóng gây mất nước và mệt mỏi, quá lạnh gây co cứng cơ cơ học).
  * *Độ ẩm & Gió:* Độ ẩm càng cao càng làm tăng căng thẳng sinh học và làm giảm khả năng tự làm mát của ngựa. Các mô hình hướng gió có thể cản trở hoặc hỗ trợ trực tiếp đến vận tốc bứt phá ở chặng nước rút.

# Limitations
* **Giới hạn trần độ chính xác:** Độ chính xác tối đa đạt được là 46.8% (của SVM). Con số này phản ánh thực tế rằng đua ngựa là một môn thể thao có độ bất định cực kỳ cao; mô hình hiện tại chỉ mới xử lý các yếu tố môi trường tĩnh và động cơ bản mà chưa thể kiểm soát được các yếu tố sinh học nội tại của ngựa (tâm trạng, chấn thương ẩn) hoặc chiến thuật thời gian thực của kỵ sĩ.
* **Độ phức tạp tính toán:** Các mô hình thuật toán dạng cây như Random Forest và AdaBoost mang lại kết quả trung bình khá nhưng lại đòi hỏi tài nguyên tính toán cao, gây rủi ro nghẽn mạch khi áp dụng vào các kịch bản phân tích thời gian thực (real-time scenarios) trên ứng dụng Web/Mobile.

# Relevance to our topic
* Bài báo liên quan trực tiếp đến cấu phần **Xây dựng mô hình AI dự đoán kết quả và Thiết kế hệ thống dữ liệu** cho dự án Hệ thống quản lý giải đua ngựa của nhóm bạn.
* Cung cấp cơ sở khoa học vững chắc để nhóm tích hợp mô-đun API Thời tiết (Weather API) và Thuộc tính bề mặt sân vào cơ sở dữ liệu hệ thống, giúp tính năng dự đoán trận đấu trở nên thực tế và chuyên nghiệp.
* Đặt ra một "cột mốc tham chiếu" thực tế về độ chính xác (gần 47% nếu chỉ dùng đặc trưng môi trường), giúp nhóm định hình kỳ vọng sản phẩm và hiểu được tầm quan trọng của việc kết hợp đa dạng nhóm thuộc tính.

# Possible improvement
* **Tự động hóa đồng bộ dữ liệu (IoT & API):** Tích hợp hệ thống với các trạm quan trắc khí tượng tự động tại trường đua và nhật ký bảo trì sân (lịch trình tưới nước, độ nén chặt của đất) để cập nhật dữ liệu đầu vào cho AI theo thời gian thực thay vì sử dụng dữ liệu lịch sử cố định.
* **Kết hợp đa nhóm đặc trưng (Hybrid Modeling):** Để phá vỡ mức trần 46.8%, cần kết hợp các yếu tố môi trường của bài báo này với 13 yếu tố kỹ thuật nội tại của ngựa đua từ bài báo trước của tác giả Shuang Zhang (như tuổi ngựa, cân nặng, lịch sử thành tích, thứ hạng kỵ sĩ, và uy tín huấn luyện viên).
* **Nâng cấp thuật toán học sâu và Ensemble:** Thử nghiệm thay thế hoặc bổ sung các kiến trúc học máy phân tầng tiên tiến hơn như XGBoost, LightGBM, hoặc mạng nơ-ron tích hợp (Deep Neural Networks) để cải thiện độ chính xác và giảm thiểu độ phức tạp tính toán thời gian thực ở phần Backend hệ thống.
