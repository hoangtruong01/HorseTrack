# Citation
* **Tác giả:** ZhiGuo Zhu.
* **Đơn vị công tác:** College of Physical Education, Luoyang Normal University, Henan, China.
* **Tên bài báo:** Design and implementation of an intelligent sports management system (ISMS) using wireless sensor networks.
* **Nguồn xuất bản:** PeerJ Computer Science, Năm công bố: 2025.
* **Link:** https://www.researchgate.net/publication/388581140_Design_and_implementation_of_an_intelligent_sports_management_system_ISMS_using_wireless_sensor_networks

# Problem
* **Hạn chế của phương pháp truyền thống:** Việc thu thập dữ liệu sinh lý và cơ sinh học của vận động viên (như nhịp tim, nhiệt độ cơ thể, hoạt động của cơ) trước đây thường phải gắn cảm biến thủ công theo các khoảng thời gian cố định, không liên tục và thiếu tính thời gian thực.
* **Thách thức trong quản lý thể thao hiện đại:** Thiếu hụt một kiến trúc hệ thống toàn diện có khả năng giám sát đồng thời sức khỏe, dự đoán chấn thương, quản lý lịch trình, sự kiện và phân tích hiệu suất một cách thông minh và đồng bộ.
* **Bài toán kỹ thuật:** Rủi ro về tiêu thụ năng lượng cao của các nút IoT cảm biến và đảm bảo tính toàn vẹn, bảo mật của luồng dữ liệu lớn (Big Data) trong môi trường thể thao động và liên tục thay đổi.

# Method
Nghiên cứu đề xuất một **Hệ thống Quản lý Thể thao Thông minh (ISMS)** tích hợp Mạng Cảm biến Không dây (WSNs) và Mạng Nơ-ron (NNs) với kiến trúc phân tầng lớp chặt chẽ bao gồm:
* **Kiến trúc 7 tầng (Multi-layer Architecture):**
  * *Tầng giao diện người dùng (User Interface Layer):* Ứng dụng Web và Di động trực quan cho vận động viên, huấn luyện viên và quản trị viên.
  * *Tầng logic nghiệp vụ (Business Logic Layer):* Xử lý lịch trình, quản lý sự kiện và các quy tắc hệ thống.
  * *Tầng quản lý dữ liệu (Data Management Layer):* Quản lý lưu trữ lớn kết hợp Big Data (Hadoop/Spark).
  * *Tầng tích hợp (Integration Layer):* Kết nối phần cứng và phần mềm.
  * *Tầng phân tích và AI (Analytics and AI Layer):* Trọng tâm xử lý của các mô hình Học máy và Mạng nơ-ron để phát hiện bất thường và dự đoán chấn thương.
  * *Tầng IoT (IoT Layer):* Các nút cảm biến thu thập dữ liệu thô đeo trên người vận động viên.
  * *Tầng bảo mật (Security Layer):* Mã hóa và bảo vệ quyền riêng tư của dữ liệu sinh lý học.
* **Xử lý tín hiệu và Đồng bộ hóa:** Sử dụng bộ lọc trung bình trượt (Moving Average Filter) để làm mịn chuỗi dữ liệu thời gian thực; áp dụng các công thức tính toán tốc độ truyền dữ liệu (bps), hiệu suất năng lượng (bits per joule) và thuật toán đồng bộ hóa xung nhịp đồng hồ cục bộ để giảm thiểu sai số vật lý của cảm biến.
* **Mô hình AI Core:** Thử nghiệm nhiều thuật toán bao gồm Random Forest, Support Vector Machine (SVM), K-Nearest Neighbors (KNN), Logistic Regression, Autoencoders và Mạng Nơ-ron nhân tạo (Neural Networks) để phân loại dữ liệu và nhận diện các điểm bất thường (Anomaly Detection).

# Dataset
* **Nguồn dữ liệu:** Nghiên cứu sử dụng tập dữ liệu bên thứ ba (Third-party Dataset) được lưu trữ công khai trên Mendeley Data của nhóm tác giả Burns và cộng sự (2022): *"Dataset of physiological, behavioral, and self-report measures from a group decision-making lab study"*.
* **Thuộc tính đặc trưng:** Tập dữ liệu chuỗi thời gian chứa các phép đo sinh lý, hành vi bao gồm: Nhãn thời gian (Timestamp), Nhịp tim (Heart rate - bpm), Nhiệt độ cơ thể (Body temperature - °C), Gia tốc (Acceleration - g-forces) từ cảm biến chuyển động, và Tọa độ định vị GPS (Kinh độ, vĩ độ).

# Evaluation
Hệ thống và các mô hình dự đoán được đánh giá đa chiều thông qua ma trận hiệu năng tinh vi:
* **Các chỉ số đo lường chất lượng phân loại:** Độ chính xác (Accuracy), Độ chuẩn xác (Precision), Độ nhạy (Recall), Điểm F1 (F1-score), và Độ đặc hiệu (Specificity).
* **Các chỉ số đo lường sai số:** Sai số tuyệt đối trung bình (MAE), Sai số bình phương trung bình (MSE), và Căn sai số bình phương trung bình (RMSE).
* **Kiểm định thống kê:** Áp dụng kiểm định t-test để xác định ý nghĩa thống kê giữa các nhóm dữ liệu và đường cong ROC (Receiver Operating Characteristic) để so sánh năng lực phân loại của các thuật toán.
* **Biến số thử nghiệm:** Đánh giá độ ổn định của hệ thống dưới sự thay đổi của: Các tổ hợp cảm biến hỗn hợp khác nhau, Các khoảng thời gian thu thập dữ liệu (Time intervals từ 5s đến 30s), và Tải lượng dữ liệu đầu vào (Số lượng nút cảm biến mở rộng từ 10 đến 500 nút).

# Results
* **Thuật toán tối ưu nhất:** Mạng Nơ-ron (Neural Networks) vượt trội hơn hẳn các thuật toán khác trong tác vụ phát hiện bất thường với **Độ chính xác (Accuracy) đạt 0.94**, Precision: 0.93, Recall: 0.91, F1-score: 0.95, và Specificity: 0.97. Mô hình này cũng ghi nhận mức sai số thấp nhất (MAE: 0.06, MSE: 0.008, RMSE: 0.09).
* **Sức mạnh của tổ hợp cảm biến lai (Sensor Hybrids):** Hiệu năng của hệ thống tăng tiến tỷ lệ thuận với số lượng loại cảm biến tích hợp. Khi chỉ dùng cảm biến nhịp tim và gia tốc, độ chính xác đạt 0.88, nhưng khi bổ sung đầy đủ cảm biến huyết áp và nhiệt độ, độ chính xác hệ thống đạt mức trần 0.94.
* **Tác động của khoảng thời gian và tải lượng nút:** * Khoảng thời gian thu thập dài hơn (ví dụ 30 giây) cung cấp dữ liệu toàn diện hơn, giúp giảm lỗi hệ thống (MAE giảm từ 0.11 xuống 0.06).
  * Hệ thống hoạt động hoàn hảo nhất ở quy mô nhỏ (10 nút cảm biến đạt độ chính xác 0.98), và duy trì độ ổn định rất tốt khi mở rộng quy mô tải lớn (ở mức 500 nút cảm biến, độ chính xác vẫn giữ ở mức cao ổn định).

# Limitations
* **Yêu cầu phần cứng cao:** Việc huấn luyện và chạy các kiến trúc mạng nơ-ron xử lý dữ liệu lớn theo thời gian thực đòi hỏi tài nguyên tính toán mạnh (Cấu hình khuyến nghị tối thiểu chip Core i7/Ryzen 7, 16GB RAM và card đồ họa rời như NVIDIA GTX 1660), gây khó khăn cho việc triển khai trên các thiết bị nhúng giá rẻ hoặc thiết bị di động cấu hình thấp.
* **Sự phụ thuộc vào chất lượng dữ liệu đầu vào:** Mô hình có nguy cơ giảm hiệu năng hoặc đưa ra cảnh báo sai nếu dữ liệu cảm biến bị nhiễu do vận động mạnh hoặc lỗi mất kết nối mạng không dây (WSN).
* **Tính khái quát hóa theo bộ môn:** Bài báo tập trung nhiều vào khung kiến trúc tổng thể (Framework) cho thể thao nói chung và các chỉ số sinh lý cơ bản, chưa đi sâu vào phân tích cơ sinh học chuyên biệt sâu cho từng bộ môn đặc thù (ví dụ: tư thế chạy, sải chân cụ thể).

# Relevance to our topic
* **Tham chiếu kiến trúc phần mềm:** Bài báo này cực kỳ hữu ích cho phần **Thiết kế kiến trúc hệ thống và Quản lý cơ sở dữ liệu** cho dự án Hệ thống quản lý thể thao/đua ngựa. Mô hình phân tầng 7 lớp (từ IoT, Data Management với Hadoop/Spark đến Analytics AI và UI) là một bản thiết kế chuẩn mực để bạn xây dựng hệ thống Web/App có tính mở rộng cao.
* **Tích hợp mô-đun phân tích thông minh:** Cung cấp tư duy thiết kế luồng dữ liệu thời gian thực: từ việc tiếp nhận dữ liệu thô (GPS, nhịp tim) cho đến cách tổ chức tầng AI xử lý phân tích để đưa ra cảnh báo chấn thương hoặc dự đoán phong độ thi đấu.

# Possible improvement
* **Tối ưu hóa tính toán biên (Edge Computing):** Chuyển một phần tác vụ xử lý bộ lọc dữ liệu và phát hiện bất thường sơ cấp về ngay tại các thiết bị phần cứng đeo (Edge/IoT nodes) thay vì đẩy toàn bộ dữ liệu thô về đám mây, giúp giảm tải băng thông và độ trễ khi hệ thống vượt quá 500 nút cảm biến.
* **Ứng dụng thuật toán học máy nhẹ (Lightweight AI):** Thay thế mạng nơ-ron truyền thống bằng các mô hình Ensemble tối ưu hơn như LightGBM, XGBoost hoặc TinyML để có thể chạy trực tiếp trên Backend Web thông thường hoặc thiết bị di động mà không bắt buộc phải có GPU cấu hình mạnh.
* **Bản địa hóa cho bộ môn Đua ngựa (Equine Specifics):** Nếu áp dụng vào dự án đua ngựa, cần cải tiến tầng IoT để tương thích với các cảm biến chuyên dụng cho ngựa (thiết bị đo nhịp tim động vật, cảm biến gia tốc gắn ở móng guốc để đo sải chân - gait analysis) và thay đổi các ngưỡng cảnh báo sinh học phù hợp với thể trạng của ngựa đua thay vì con người.
