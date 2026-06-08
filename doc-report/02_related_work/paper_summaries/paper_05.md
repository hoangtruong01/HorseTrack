# Citation
* **Tác giả:** Shuang Zhang .
* **Đơn vị công tác:** Wuhan Business University, Wuhan, Hubei, China .
* **Tên bài báo:** Optimal Model of Horse Racing Competition Decision Management Based on Association Rules and Neural Network .
* **Nguồn xuất bản:** Scientific Programming, Volume 2022, Article ID 4240244, 10 pages .
* **Link:** https://onlinelibrary.wiley.com/doi/epdf/10.1155/2022/4240244 

# Problem
* Các mô hình dự đoán đua ngựa truyền thống thường có độ chính xác thấp và thiết kế kiến trúc hệ thống chưa hoàn thiện, không đáp ứng được toàn diện nhu cầu quản lý giải đấu và dự đoán kết quả cuộc đua hiện đại.
* Khối lượng dữ liệu và số lượng chiều tính năng (feature dimensions) của các cuộc đua ngựa đang bùng nổ mạnh mẽ, gây ra thách thức mới cho việc quản lý giải đấu và nghiên cứu dự đoán.
* Các thuật toán dự đoán truyền thống không còn khả năng xử lý tốt các bài toán phân loại và dự đoán mối quan hệ phi tuyến phức tạp trong môi trường quản lý quyết định đua ngựa .

# Method
* **Kiến trúc hệ thống:** Xây dựng mô hình tối ưu hóa quản lý quyết định dựa trên cấu trúc B/S (Browser/Server) và mô hình phát triển Web App (hỗ trợ đa nền tảng gồm máy tính, thiết bị di động Android và iOS)  Kiến trúc gồm 4 tầng: Tầng thu thập dữ liệu (Data collection), Tầng dịch vụ dữ liệu (Data service), Tầng logic nghiệp vụ (Business logic), và Tầng giao diện người dùng (User interface) .
* **Thuật toán cốt lõi:** Kết hợp giữa **Luật kết hợp (Association Rules)** và **Mạng nơ-ron truyền ngược (BP Neural Network)** .
  * *Luật kết hợp:* Được sử dụng để khai phá mối liên hệ xác suất giữa các yếu tố ảnh hưởng, từ đó xác định trọng số/sức mạnh kết nối của từng nơ-ron . Phương pháp sử dụng phân phối Weibull 3 tham số để tính toán hàm độ tin cậy thể hiện trạng thái sức khỏe của ngựa đua, sau đó ánh xạ và chiếu vào mạng nơ-ron.
  * *Mạng nơ-ron BP:* Tiếp nhận dữ liệu đầu vào đã được chuẩn hóa về khoảng [0,1], thực hiện chức năng học máy học các ánh xạ phi tuyến phức tạp để đưa ra kết quả dự đoán thời gian hoặc kết quả thắng/thua . Số lượng nơ-ron tầng ẩn được tối ưu hóa liên tục để giảm thiểu sai số tối đa.
* **Hỗ trợ xử lý nâng cao:** Ở phía quản trị viên nền tảng, hệ thống còn áp dụng thuật toán ISSFS để lựa chọn đặc trưng dữ liệu giải đấu và thuật toán HGAPSO nhằm tối ưu hóa các tham số phạt C và tham số hàm g cho SVM phục vụ quá trình huấn luyện mô hình.

# Dataset
* Dữ liệu nghiên cứu bao gồm dữ liệu thi đấu và dữ liệu huấn luyện thực tế thu thập từ các mùa giải (cụ thể là mùa giải 2019 và 2020).
* Quy mô thử nghiệm trải dài trên hơn 5.000 lượt huấn luyện và thi đấu thuộc 9 loại cự ly/lịch trình khác nhau bao gồm: 1.000m, 1.200m, 1.400m, 1.600m, 1.650m, 1.800m, 2.000m, 2.200m, và 2.400m.

# Evaluation
* **Thuật toán đối chứng (Baselines):** Mô hình được so sánh hiệu năng trực tiếp với 3 phương pháp dự đoán truyền thống khác :
  * Thuật toán trung bình trượt bậc hai (Quadratic Moving Average - Algorithm A) 
  * Thuật toán san bằng mũ bậc ba (Triple Exponential Smoothing - Algorithm B) 
  * Mô hình xám (Gray Model - Algorithm C) 
* **Chỉ số đánh giá (Metrics):**
  * Độ chính xác dự đoán kết quả (Prediction Accuracy) .
  * Thời gian tiêu thụ trung bình của hệ thống khi dự đoán (Average Prediction Time Consumption) .
  * Tỷ lệ sai sót/đánh giá sai (Average Error Rate / Misappraisal Rate).
  * Sự cải thiện thành tích thực tế của ngựa đua qua các mùa giải sau khi áp dụng mô hình quản lý quyết định .

# Results
* **Trọng số các yếu tố ảnh hưởng:** Quá trình phân tích dữ liệu chỉ ra thứ tự tầm quan trọng của 13 yếu tố tác động đến thành tích đua ngựa từ lớn đến nhỏ như sau: Lịch trình/Cự ly đua (Race schedule) > Tuổi (Age) > Giới tính (Gender) > Trọng lượng ngựa (Weight) > Điểm số xếp hạng (Score/Rating) > Tỷ lệ lọt top 3 của ngựa (Horse top three rate) > Nài ngựa/Kỵ sĩ (Jockey) > Tải trọng gánh chịu (Weight load) > Trang bị/Dụng cụ (Harness) > Thứ hạng vòng loại (Ranking/Qualifying) > Tính chất sân đua (Field nature) > Sân đua (Field) > Huấn luyện viên (Trainer) .
* **Độ chính xác dự đoán:** Thuật toán mạng nơ-ron đạt độ chính xác cao nhất, vượt mức 90%, vượt trội rõ rệt so với mô hình Xám (>80%), thuật toán trung bình trượt và san bằng mũ .
* **Hiệu suất hệ thống:** Thời gian xử lý dự đoán trung bình của hệ thống đề xuất chỉ mất 2.01 giây (nhanh hơn đáng kể so với hệ thống cũ là 3.75 giây) . Tỷ lệ lỗi đánh giá trung bình cực thấp, chỉ ở mức 0.12% (so với 0.35% của hệ thống cũ) .
* **Cải thiện thành tích thực tế:** Khi áp dụng mô hình này vào quản lý và huấn luyện, thành tích thi đấu của top 3 trong mùa giải 2020 đã được cải thiện (giảm thời gian chạy) ở hầu hết các cự ly so với mùa giải 2019, với mức giảm thời gian lớn nhất lên tới 0.984 giây (ngoại trừ cự ly 2.000m) .

# Limitations
* **Rủi ro dữ liệu đầu vào thủ công:** Việc thu thập quỹ đạo chạy của ngựa trên sân thông qua ứng dụng di động vẫn phụ thuộc một phần vào thao tác của nhân viên nhập liệu, dễ dẫn đến xuất hiện dữ liệu bất thường hoặc sai lệch ở tầng thu thập ban đầu .
* **Khối lượng tính toán ở phần backend:** Việc liên tục tối ưu hóa số lượng nơ-ron tầng ẩn và xử lý probabilization tích hợp luật kết hợp đòi hỏi tài nguyên huấn luyện và chu kỳ tính toán lặp lại tương đối lớn .
* **Thiếu các đặc trưng động thời gian thực sâu:** Mô hình chủ yếu dựa vào các thông số tĩnh trước trận đấu hoặc thông số cố định của sân đua (tính chất sân, cự ly) mà chưa tích hợp sâu các chỉ số sinh học tức thời của ngựa trong lúc chạy hoặc biến động thời tiết chi tiết theo từng phút.

# Relevance to our topic
* Bài báo này liên quan trực tiếp đến đề tài hệ thống **Quản lý và Dự đoán Giải đua ngựa** mà nhóm đang thực hiện.
* Cung cấp một bộ khung kiến trúc phần mềm hoàn chỉnh (B/S, Web App đa thiết bị), hỗ trợ thiết kế các mô-đun chức năng thực tế như quản lý thông tin ngựa, kỵ sĩ, huấn luyện viên, tra cứu điểm số và lịch thi đấu .
* Đưa ra bảng xếp hạng 13 đặc trưng có trọng số thực nghiệm rõ ràng , giúp định hình trực tiếp giai đoạn kỹ nghệ đặc trưng (Feature Engineering) khi nhóm thiết kế mô hình AI dự đoán kết quả trận đấu.

# Possible improvement
* **Tự động hóa thu thập dữ liệu (IoT & Computer Vision):** Thay thế phương pháp ghi nhận thủ công bằng hệ thống chip định vị GPS/UWB gắn trên ngựa hoặc áp dụng công nghệ thị giác máy tính (Computer Vision) qua hệ thống camera trường đua để tự động theo dõi và trích xuất quỹ đạo chuyển động chính xác tuyệt đối.
* **Nâng cấp các mô hình học sâu hiện đại:** Thử nghiệm thay thế hoặc kết hợp mạng nơ-ron BP truyền thống bằng các thuật toán học máy mạnh mẽ chuyên trị dữ liệu dạng bảng/chuỗi thời gian hiện nay như XGBoost, LightGBM, CatBoost hoặc kiến trúc Transformer/LSTM để tối ưu hóa độ chính xác vượt qua cột mốc 90%.
* **Tích hợp cảm biến sinh học và dữ liệu môi trường thời gian thực:** Bổ sung các thiết bị IoT đeo thông minh trên ngựa để thu thập nhịp tim, thân nhiệt trực tiếp, kết hợp đồng bộ với API trạm khí tượng (độ ẩm, sức gió thực tế tại thời điểm đua) nhằm tăng độ nhạy bén và tính chính xác cho mô hình dự đoán.
