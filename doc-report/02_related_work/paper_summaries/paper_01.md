# Citation
* **Tác giả:** Elnaz Davoodi, Ali Reza Khanteymoori.
* **Đơn vị công tác:** Khoa Toán và Khoa học Máy tính, Viện Nghiên cứu Nâng cao về Khoa học Cơ bản (IASBS), Zanjan, Iran.
* **Tên bài báo:** Horse Racing Prediction Using Artificial Neural Networks.
* **Nguồn xuất bản:** RECENT ADVANCES in NEURAL NETWORKS, FUZZY SYSTEMS & EVOLUTIONARY COMPUTING.
* **Link:** https://www.researchgate.net/publication/228847950_Horse_racing_prediction_using_artificial_neural_networks

# Problem
Bài báo giải quyết vấn đề gì?
* Bài báo giải quyết bài toán dự đoán thời gian hoàn thành cuộc đua và xếp hạng thứ tự của các con ngựa khi tham gia thi đấu.
* Khắc phục các hạn chế của phương pháp hồi quy tuyến tính truyền thống (vốn có xu hướng ép các mối quan hệ phức tạp thành dạng tuyến tính và áp dụng phương trình cồng kềnh trên toàn bộ không gian đầu vào).
* Thay thế mô hình chuỗi thời gian ARIMA – phương pháp đòi hỏi tối thiểu phải có 40 điểm dữ liệu lịch sử cho mỗi thực thể, một điều kiện hoàn toàn không khả thi và không phù hợp trong bối cảnh đua ngựa.

# Method
Bài báo dùng phương pháp/model/hệ thống nào?
* Kiến trúc mô hình: Sử dụng Mạng nơ-ron truyền thẳng đa lớp (Multilayer Feedforward Neural Network - MLFF). Mô hình áp dụng mạng độc lập cho từng con ngựa để dự đoán thời gian về đích, sau đó sắp xếp tăng dần để tìm ra thứ hạng cuộc đua.
* Cấu trúc mạng tối ưu: Được xác định bằng phương pháp phát triển mạng dần dần (network growing), mạng bao gồm 4 lớp theo cấu trúc hình học 8-5-7-1 (8 nơ-ron đầu vào, lớp ẩn thứ nhất có 5 nơ-ron, lớp ẩn thứ hai có 7 nơ-ron, lớp đầu ra có 1 nơ-ron trả về thời gian). Mạng ở trạng thái liên kết đầy đủ (fully connected).
* Thuật toán huấn luyện áp dụng: Bài báo thực hiện phân tích và so sánh hiệu năng của 5 thuật toán học có giám sát khác nhau:
  1. Lan truyền ngược độ dốc giảm dần tiêu chuẩn (Gradient Descent BP).
  2. Lan truyền ngược kết hợp hệ số động lượng (Gradient Descent BP with Momentum).
  3. Thuật toán Quasi-Newton BFGS.
  4. Thuật toán Levenberg-Marquardt (LM).
  5. Thuật toán Gradient liên hợp giảm dần (Conjugate Gradient Descent).
* Xử lý dữ liệu: Sử dụng hàm kích hoạt Sigmoid tiêu chuẩn. Thực hiện chuẩn hóa dữ liệu đầu vào dựa trên giá trị trung bình (mean) và phương sai (variance) để tối ưu hóa quá trình học. Chuyển đổi các dữ liệu biểu tượng dạng chữ (symbolic) sang dạng số liên tục.

# Dataset
Bài báo dùng dữ liệu gì?
* Nguồn dữ liệu: Dữ liệu đua ngựa thực tế thu thập từ trường đua AQUEDUCT Race Track tại New York, Mỹ.
* Quy mô: Bao gồm thông tin của 100 cuộc đua thực tế diễn ra liên tục từ ngày 1 tháng 1 đến ngày 29 tháng 1 năm 2010.
* Các đặc trưng đầu vào (8 đặc trưng): Cân nặng của ngựa (tính theo pound), loại cuộc đua, thông tin huấn luyện viên, thông tin nài ngựa (jockey), tổng số lượng ngựa tham gia trong cuộc đua đó, khoảng cách đường đua (được quy đổi từ Furlong và Mile sang mét), điều kiện mặt sân đua và tình hình thời tiết.

# Evaluation
Bài báo đánh giá bằng metric nào?
* Sai số bình phương trung bình (MSE - Mean Squared Error): Sử dụng làm thước đo chính để đánh giá và lựa chọn cấu trúc tầng ẩn tối ưu cho mạng nơ-ron thông qua 10 lần chạy thử nghiệm ngẫu nhiên.
* Độ chính xác phân vị trí (Ranking Accuracy Metrics): Thống kê số lượng trận đoán trúng dựa trên các tiêu chí thực tế:
  - Số trận dự đoán chính xác tuyệt đối ngựa về vị trí thứ nhất (First Position).
  - Số trận dự đoán chính xác tuyệt đối ngựa về vị trí cuối cùng (Last Position).
  - Số lượng trận đoán trúng chính xác 1 con ngựa, trúng từ 2 con ngựa trở lên, hoặc hoàn toàn không đoán đúng con ngựa nào trong bảng xếp hạng cuộc đua.

# Results
Kết quả chính là gì?
* Mạng nơ-ron nhân tạo chứng minh khả năng thích ứng và dự đoán rất tốt trong môi trường đua ngựa phức tạp, đạt độ chính xác dự đoán trung bình trên các thuật toán là 77%.
* Hiệu năng riêng biệt của từng thuật toán (trên 100 cuộc đua mẫu):
  - Dự đoán ngựa vô địch: Thuật toán Lan truyền ngược tiêu chuẩn (BP) và Lan truyền ngược kèm động lượng (BPM với hệ số động lượng 0.7) cho kết quả tối ưu nhất khi đoán chính xác vị trí đầu tiên trong 39 cuộc đua.
  - Dự đoán ngựa về chót: Thuật toán Gradient liên hợp giảm dần (CGD) đạt hiệu quả cao nhất khi đoán đúng vị trí cuối cùng trong 37 cuộc đua (đặc biệt hữu ích giúp người tham gia tránh đặt cược sai).
  - Tốc độ xử lý: Thuật toán Levenberg-Marquardt (LM) có tốc độ hội tụ và xử lý nhanh nhất.
  - Thuật toán BP có độ chính xác tổng thể nhỉnh hơn một chút nhưng đánh đổi lại thời gian huấn luyện lâu hơn và quy trình chọn tham số phức tạp.

# Limitations
Hạn chế của bài báo là gì?
* Vấn đề dữ liệu trống / Ngựa mới (Cold Start Problem): Nhiều con ngựa không có đủ lịch sử thi đấu trong quá khứ (chỉ mới đua 1 hoặc 2 trận), lượng thông tin này không đủ để mạng nơ-ron học tập. Nhóm nghiên cứu bắt buộc phải xóa bỏ các con ngựa này khỏi tập dữ liệu hoặc xáo trộn thứ tự thủ công để chạy thử nghiệm.
* Chi phí tính toán: Thuật toán có độ chính xác tốt nhất (BP) tốn nhiều thời gian xử lý khi mạng phình to. Đồng thời, mô hình nhạy cảm với việc chọn tỷ lệ học (learning rate), dễ rơi vào trạng thái mất ổn định hoặc hội tụ chậm.

# Relevance to our topic
Bài báo liên quan gì đến đề tài của nhóm?
* Đề tài của nhóm là "Hệ thống quản lý giải đua ngựa (Horse Racing Tournament Management System)". Trong đó, hệ thống bắt buộc phải giải quyết hai luồng nghiệp vụ cốt lõi: Khán giả (Spectator) thực hiện "Dự đoán kết quả", và Admin thực hiện "Quản lý dự đoán kết quả".
* Nghiên cứu này cung cấp mô hình toán học và cấu trúc dữ liệu đầu vào thực tế để hiện thực hóa tính năng "Dự đoán kết quả". Các thực thể cốt lõi mà hệ thống của nhóm đang quản lý bao gồm Horse Owner, Jockey, Horse, Tournament, và Race đều khớp hoàn toàn với các biến đầu vào (Inputs) của mạng nơ-ron (như cân nặng ngựa, thông tin jockey, huấn luyện viên, khoảng cách chặng đua, điều kiện sân bãi).
* Thay vì để Spectator dự đoán theo cảm tính, nghiên cứu này là cơ sở kỹ thuật giúp nhóm xây dựng một Trợ lý ảo / Phân hệ dự đoán thông minh (Prediction Module) tích hợp sẵn trong hệ thống quản lý, giúp tự động tính toán cơ hội chiến thắng của từng con ngựa dựa trên dữ liệu giải đấu đang lưu trữ.

# Possible improvement
Nhóm có thể cải tiến hoặc mở rộng điểm nào?
1. Giải quyết triệt để bài toán Ngựa mới (Cold Start): Thay vì xóa bỏ các con ngựa thiếu dữ liệu lịch sử như bài báo, hệ thống quản lý của nhóm có thể áp dụng các thuật toán gán giá trị mặc định thông minh (Imputation) dựa trên chỉ số trung bình của dòng giống ngựa, thứ hạng của chính Jockey điều khiển, hoặc uy tín của Horse Owner nhằm đảm bảo mọi con ngựa đăng ký tham gia hệ thống đều có thể đưa vào mô hình dự đoán.
2. Làm phong phú đặc trưng đầu vào nhờ dữ liệu hệ thống độc quyền: Bài báo chỉ sử dụng 8 đặc trưng tĩnh cơ bản. Vì nhóm làm hệ thống quản lý toàn diện, nhóm có thể bổ sung các trường dữ liệu động, có độ nhạy bén cao mà bài báo không có như:
   - Phong độ 3 trận gần nhất của nài ngựa (Jockey) và ngựa (Horse).
   - Lịch sử vi phạm kỷ luật của cặp ngựa - nài ngựa trích xuất từ thực thể Biên bản trọng tài (Referee Report).
   - Tần suất phối hợp thành công giữa chủ ngựa và jockey cụ thể.
3. Hiện đại hóa công nghệ tích hợp: Bài báo gốc thực hiện huấn luyện bằng công cụ Matlab cũ kỹ. Nhóm có thể cải tiến bằng cách xây dựng Phân hệ dự đoán này dưới dạng một dịch vụ độc lập (Microservice) bằng Python (sử dụng thư viện Scikit-learn hoặc PyTorch). Dịch vụ này sẽ kết nối trực tiếp với Cơ sở dữ liệu của hệ thống quản lý giải đấu để tự động cập nhật trọng số và đưa ra dự đoán theo thời gian thực (Real-time Prediction) ngay khi Admin công bố lịch thi đấu cuộc đua (Race).
