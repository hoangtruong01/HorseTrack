# Paper 01 Summary

## Citation

**Tên bài:**
[cite_start]Horse Racing Prediction Using Artificial Neural Networks [cite: 2]

**Tác giả:**
[cite_start]Elnaz Davoodi, Ali Reza Khanteymoori [cite: 3]

**Năm:**
[cite_start]2010 [cite: 10]

**Nguồn:**
[cite_start]Recent Advances in Neural Networks, Fuzzy Systems & Evolutionary Computing (ISSN: 1790-5109, ISBN: 978-960-474-195-3) [cite: 1, 37, 39]

---

## Problem

Bài báo giải quyết vấn đề gì?

[cite_start]Dự đoán kết quả đua ngựa là một bài toán cực kỳ phức tạp và có tính phi tuyến cao do chịu ảnh hưởng từ nhiều yếu tố môi trường và sinh trắc học[cite: 7, 174]. Các phương pháp truyền thống bộc lộ nhiều hạn chế:

* [cite_start]**Mô hình Hồi quy tuyến tính (Linear Regression):** Thường ép các mối quan hệ phức tạp về dạng tuyến tính, dễ bị sai lệch nghiêm trọng chỉ bởi một điểm dữ liệu xấu (noise) và phương trình hồi quy phải áp dụng rập khuôn cho toàn bộ không gian đầu vào[cite: 21, 22, 153].
* [cite_start]**Mô hình Chuỗi thời gian (ARIMA):** Đòi hỏi tối thiểu phải có 40 điểm dữ liệu liên tục cho mỗi thực thể, khiến nó không khả thi để ứng dụng cho từng con ngựa cụ thể trong các chặng đua ngắn[cite: 145].

[cite_start]Nghiên cứu này ứng dụng Mạng nơ-ron nhân tạo (ANN) để vượt qua các rào cản trên nhằm tự động học hỏi các mối quan hệ ẩn từ dữ liệu quá khứ, tăng khả năng tổng quát hóa và chống nhiễu để dự đoán chính xác thời gian hoàn thành chặng đua của từng con ngựa[cite: 8, 23, 30, 156, 157].

---

## Method

Bài báo dùng phương pháp/model/hệ thống nào?

[cite_start]Tác giả đề xuất mô hình mạng nơ-ron truyền thẳng đa lớp (Multilayer Feedforward Neural Network - MLFF) kết hợp với kỹ thuật phát triển mạng (Network Growing Method) để tìm ra kiến trúc tối ưu nhất[cite: 185, 193].

### Quy trình xử lý hệ thống:
1. [cite_start]Dữ liệu cuộc đua gồm 8 đặc trưng đầu vào[cite: 169, 174].
2. [cite_start]Chuẩn hóa dữ liệu và mã hóa các giá trị ký tự sang số thực[cite: 171].
3. [cite_start]Đưa vào mạng nơ-ron truyền thẳng đa lớp (MLFF)[cite: 185, 193].
4. [cite_start]Huấn luyện thử nghiệm song song qua 5 thuật toán học có giám sát[cite: 9, 60].
5. [cite_start]Dự đoán thời gian về đích (Finishing Time) của từng chiến mã[cite: 30, 167].
6. [cite_start]Sắp xếp thời gian tăng dần để đưa ra bảng xếp hạng thứ hạng cuối cùng[cite: 168].

### Thuật toán huấn luyện được so sánh:
[cite_start]Nghiên cứu tiến hành cài đặt và so sánh hiệu năng của 5 thuật toán học giám sát (Supervised Learning Algorithms) khác nhau trên cùng một tập dữ liệu[cite: 9, 51, 60]:
1. [cite_start]Gradient Descent Back-Propagation (BP)[cite: 9, 61].
2. [cite_start]Gradient Descent BP với hệ số Quán tính / Momentum (BPM)[cite: 208].
3. [cite_start]Quasi-Newton BFGS (BFG)[cite: 106, 208].
4. [cite_start]Levenberg-Marquardt (LM)[cite: 107, 208].
5. [cite_start]Conjugate Gradient Descent (CGD)[cite: 134, 208].

### Kiến trúc Mạng tối ưu:
[cite_start]Qua phương pháp thử nghiệm tăng dần số lượng nơ-ron (Growing Method), cấu trúc mang lại chỉ số sai số bình phương trung bình (MSE) thấp nhất là mạng **8-5-7-1**[cite: 193, 200]:
* [cite_start]**Tầng vào (Input Layer):** 8 nơ-ron tương ứng với 8 đặc trưng đầu vào[cite: 174, 194].
* [cite_start]**Tầng ẩn (Hidden Layers):** Gồm 2 tầng ẩn, tầng thứ nhất có 5 nơ-ron và tầng thứ hai có 7 nơ-ron sử dụng hàm kích hoạt Sigmoid chuẩn[cite: 76, 195, 200].
* [cite_start]**Tầng ra (Output Layer):** 1 nơ-ron duy nhất biểu thị thời gian hoàn thành chặng đua[cite: 167, 196, 207].

---

## Dataset

Bài báo dùng dữ liệu gì?

[cite_start]Dữ liệu nghiên cứu được thu thập thực tế từ trường đua **AQUEDUCT Race Track tại New York, USA**[cite: 10, 29, 164].
* [cite_start]**Quy mô:** Gồm 100 trận đua diễn ra từ ngày 1 tháng 1 đến ngày 29 tháng 1 năm 2010[cite: 10, 205].
* [cite_start]**Tiền xử lý:** Các dữ liệu dạng ký tự (như thời tiết, trạng thái đường đua) được mã hóa sang dạng số[cite: 171, 181]. [cite_start]Dữ liệu được chuẩn hóa theo công thức toán học để đưa về cùng một khoảng giá trị nhằm tối ưu hóa quá trình hội tụ[cite: 171, 172].

[cite_start]Mỗi con ngựa được trích xuất dữ liệu dựa trên **8 đặc trưng chính (Inputs)**[cite: 169, 174]:
1. [cite_start]Khối lượng ngựa mang (Horse weight - tính theo pound)[cite: 174, 175].
2. [cite_start]Loại trận đua (Type of race)[cite: 174, 176].
3. [cite_start]Huấn luyện viên của ngựa (Horse's trainer)[cite: 174, 177].
4. [cite_start]Nài ngựa điều khiển (Horse's jockey)[cite: 174, 178].
5. [cite_start]Tổng số lượng ngựa tham gia trong trận đó (Number of horses in the race)[cite: 174].
6. [cite_start]Khoảng cách đường đua (Race distance - được quy đổi từ Furlong/Mile sang mét)[cite: 174, 179, 180].
7. [cite_start]Điều kiện bề mặt đường đua (Track condition)[cite: 174, 181].
8. [cite_start]Tình hình thời tiết lúc đua (Weather)[cite: 174, 181].

---

## Evaluation

Bài báo đánh giá bằng metric nào?

### Mean Squared Error (MSE)
[cite_start]Sử dụng Sai số bình phương trung bình qua 10 lần chạy độc lập để đánh giá và lựa chọn cấu trúc tầng ẩn tối ưu cho mạng nơ-ron[cite: 31, 32].

### Vị trí xếp hạng thực tế (Placement Accuracy)
[cite_start]Đánh giá hiệu năng thực tế của các thuật toán dựa trên số lượng trận đấu đoán chính xác tuyệt đối các vị trí[cite: 204, 248, 252]:
* [cite_start]Số trận đoán trúng ngựa về nhất (First Position)[cite: 252].
* [cite_start]Số trận đoán trúng ngựa về bét (Last Position)[cite: 252].
* [cite_start]Tỷ lệ số lượng ngựa trong cùng một trận đoán đúng thứ hạng (Đoán đúng 1 con, đúng từ 2 con trở lên, hoặc không đúng con nào)[cite: 252].

---

## Results

Kết quả chính là gì?

### Độ chính xác tổng thể
[cite_start]Mô hình mạng nơ-ron đạt độ chính xác dự đoán trung bình rơi vào khoảng **77%** trên toàn tập dữ liệu, minh chứng ANN hoàn toàn phù hợp cho bối cảnh phân tích đua ngựa[cite: 214, 256, 257].

### Hiệu năng chi tiết của các thuật toán huấn luyện (Trên 100 trận test):
* [cite_start]**Thuật toán BP và BPM:** Đạt hiệu quả tốt nhất trong việc tìm ra nhà vô địch (ngựa về nhất) với **39/100** trận chính xác tuyệt đối[cite: 213, 252]. [cite_start]Hệ số quán tính (Momentum) tối ưu nhất được tìm thấy ở mức **0.7**[cite: 213, 220].
* [cite_start]**Thuật toán CGD:** Đạt hiệu năng vượt trội trong việc xác định con ngựa sẽ về vị trí cuối cùng với **37/100** trận chính xác[cite: 212, 252].
* [cite_start]**Thuật toán LM (Levenberg-Marquardt):** Có tốc độ xử lý và thời gian huấn luyện nhanh nhất hệ thống, tiến gần đến tốc độ tối ưu bậc hai mà không cần tính toán ma trận Hessian cồng kềnh[cite: 12, 108, 127, 260].
* [cite_start]**Thuật toán BP truyền thống:** Cho kết quả chính xác tổng thể nhỉnh hơn một chút ở các chỉ số phụ nhưng đánh đổi lại bằng thời gian huấn luyện rất lâu và đòi hỏi tinh chỉnh tham số phức tạp[cite: 11, 259].

---

## Limitations

Hạn chế của bài báo là gì?

### 1. Vấn đề dữ liệu lịch sử thưa thớt (Data Sparsity)
[cite_start]Nhiều con ngựa trong tập dữ liệu có lịch sử thi đấu quá ít (chỉ mới đua 1 hoặc 2 trận trước đó)[cite: 223, 224]. [cite_start]Lượng lịch sử này không đủ độ dày để mạng nơ-ron học được hành vi, buộc tác giả phải loại bỏ các con ngựa này khỏi tập dữ liệu hoặc phải xáo trộn (shuffle) các trận đấu quá khứ để lấy kết quả ổn định[cite: 225, 226].

### 2. Thiếu các chỉ số sinh trắc học thời gian thực
[cite_start]Mô hình mới chỉ dựa vào các thông số hành chính công khai (nài ngựa, huấn luyện viên, cân nặng mang thêm...) mà chưa thể tiếp cận các chỉ số sinh học động như nhịp tim, tần suất chấn thương gần nhất hoặc phong độ phục hồi thực tế của ngựa[cite: 174].

---

## Relevance to our topic

Bài báo liên quan gì đến đề tài của nhóm?

Mức độ liên quan: **Cực kỳ cao (Core Analytics Backbone)**

Đề tài: **HorseTrack – Hệ thống quản lý và điều hành đường đua ngựa**

Bài báo này chính là cơ sở lý thuyết khoa học nền tảng cho phân hệ **Dự đoán và Phân tích hiệu suất (Race Analytics/Prediction Sub-system)** trong dự án HorseTrack của nhóm:
* [cite_start]**Hỗ trợ thiết kế DB/Schema:** Giúp nhóm xác định rõ 8 trường dữ liệu bắt buộc phải thu thập cho thực thể Ngựa, Trận đấu, Kết quả (Cân nặng, Khoảng cách chặng, Thời tiết, Nài ngựa...) để làm đầu vào cho các mô hình AI sau này[cite: 174].
* [cite_start]**Định hình tính năng cho Admin/Khán giả:** Giúp hệ thống HorseTrack có thể cung cấp thêm tính năng "Gợi ý phân tích tỷ lệ" cho khán giả dựa trên thuật toán BP/BPM để đoán ngựa thắng, hoặc thuật toán CGD để lọc ngựa yếu nhằm tối ưu hóa trải nghiệm người dùng trên Dashboard[cite: 212, 213].

---

## Possible improvement

Nhóm có thể cải tiến hoặc mở rộng điểm nào từ bài báo?

### 1. Thay thế mạng MLFF cổ điển bằng các kiến trúc Deep Learning hiện đại
[cite_start]Thay vì dùng mạng MLP 4 tầng đơn giản của năm 2010 [cite: 194][cite_start], nhóm có thể đề xuất thử nghiệm các mô hình như **TabNet** (chuyên trị dữ liệu bảng) hoặc **LightGBM / XGBoost** để xử lý 8 đặc trưng đầu vào giúp tăng tốc độ hội tụ và giảm thiểu việc phải xóa bỏ dữ liệu của những con ngựa ít lịch sử đấu[cite: 174, 223].

### 2. Xây dựng Pipeline xử lý Real-time tích hợp hệ thống
[cite_start]Ứng dụng trực tiếp kết quả của thuật toán Levenberg-Marquardt (LM) vì có tốc độ xử lý nhanh nhất [cite: 12, 260][cite_start], tích hợp nó chạy ngầm thông qua Backend (NestJS + MongoDB) để trả về kết quả dự đoán thời gian về đích dự kiến trực tiếp lên màn hình Live Tracker của khán giả qua WebSockets[cite: 167].