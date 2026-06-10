# Paper Summary

## Citation

**Title:**
Machine Learning-based Learning-to-Rank Approach for Horse Race Prediction and Web Service Development

**Authors:**
Yubin So, Eunbi Woo, Hanjun Lee

**Year:**
2025

**Journal:**
Journal of The Korea Society of Computer and Information

**Volume / Issue:**
Vol. 30, No. 11, pp. 311–318

**DOI:**
10.9708/jksci.2025.30.11.311

---

## Problem

### Bài báo giải quyết vấn đề gì?

Dự đoán kết quả đua ngựa là một bài toán phức tạp do có nhiều yếu tố ảnh hưởng đồng thời như:

* Thành tích gần đây của ngựa
* Kinh nghiệm của jockey
* Tuổi ngựa
* Trọng lượng mang theo
* Điều kiện đường đua
* Lịch sử thi đấu

Phần lớn các hệ thống dự đoán hiện nay tập trung vào bài toán phân loại (classification), tức chỉ dự đoán ngựa thắng hoặc thua.

Tuy nhiên trong thực tế:

* Người xem thường quan tâm đến Top 3 hoặc Top 5 ngựa có khả năng chiến thắng.
* Nhà tổ chức cần đánh giá tương quan sức mạnh giữa các ngựa trong cùng một cuộc đua.
* Các hệ thống hỗ trợ cá cược cần cung cấp bảng xếp hạng thay vì chỉ dự đoán thắng/thua.

Do đó, tác giả đề xuất áp dụng phương pháp **Learning-to-Rank (LTR)** nhằm dự đoán thứ hạng tương đối của các ngựa trong cùng một cuộc đua thay vì chỉ dự đoán kết quả nhị phân.

Ngoài ra, nghiên cứu còn xây dựng một **Web-based Prediction Service** để trực quan hóa kết quả dự đoán cho người dùng cuối.

---

## Method

### Bài báo dùng phương pháp/model gì?

Nghiên cứu áp dụng phương pháp:

### Learning-to-Rank (LTR)

Đây là kỹ thuật Machine Learning chuyên dùng cho bài toán xếp hạng.

Thay vì dự đoán:

* Horse A = Win
* Horse B = Lose

Mô hình sẽ học:

* Horse A > Horse B > Horse C > Horse D

### Ranking Technique

Tác giả sử dụng:

**Listwise LambdaRank**

LambdaRank tối ưu trực tiếp chất lượng của toàn bộ bảng xếp hạng thay vì từng phần tử riêng lẻ.

### Các mô hình được so sánh

* LightGBM Ranker
* XGBoost Ranker
* CatBoost Ranker

Các mô hình đều thuộc nhóm:

**Gradient Boosted Decision Trees (GBDT)**

và được huấn luyện dưới framework **LambdaRank**.

### Quy trình hệ thống

1. Thu thập dữ liệu đua ngựa
2. Tiền xử lý dữ liệu
3. Trích xuất đặc trưng
4. Huấn luyện LightGBM / XGBoost / CatBoost
5. Sinh bảng xếp hạng dự đoán
6. Hiển thị kết quả trên Web Service

---

## Dataset

### Bài báo dùng dữ liệu gì?

**Nguồn dữ liệu:**

Korea Racing Authority (KRA)

**Khoảng thời gian:**

May 2024 – April 2025

**Tổng số bản ghi:**

9,140 race records

### Các thuộc tính chính

Dữ liệu bao gồm:

* Horse Age
* Assigned Weight
* Recent Race Performance
* Average Rank
* Race History
* Competition Statistics
* Historical Results

Sau khi tiền xử lý, dữ liệu được sử dụng làm đầu vào cho các mô hình Learning-to-Rank.

---

## Evaluation

### Bài báo đánh giá bằng metric nào?

Do đây là bài toán Ranking nên tác giả không chỉ sử dụng Accuracy.

### 1. NDCG (Normalized Discounted Cumulative Gain)

Đánh giá chất lượng toàn bộ bảng xếp hạng.

### 2. MAP (Mean Average Precision)

Đánh giá khả năng đưa các ngựa mạnh lên các vị trí đầu.

### 3. MRR (Mean Reciprocal Rank)

Đánh giá khả năng xác định chính xác ngựa có thứ hạng cao nhất.

### 4. Practical Betting Accuracy

Đánh giá khả năng ứng dụng trong các kịch bản dự đoán thực tế và hỗ trợ cá cược.

---

## Results

### Kết quả chính là gì?

Kết quả thực nghiệm cho thấy:

### CatBoost đạt kết quả tốt nhất

* NDCG = 0.8895
* MAP = 0.4204

và vượt trội hơn các mô hình còn lại.

### LightGBM và XGBoost

Mặc dù thấp hơn CatBoost ở các chỉ số ranking nhưng vẫn cho:

* Hiệu suất ổn định
* Khả năng ứng dụng tốt trong các tình huống dự đoán thực tế
* Kết quả khả quan trong kịch bản betting prediction

### Feature Importance Analysis

Các yếu tố ảnh hưởng mạnh nhất gồm:

1. Recent Race Performance
2. Overall Average Rank
3. Assigned Weight
4. Horse Age

Điều này cho thấy thành tích gần đây và lịch sử thi đấu đóng vai trò quan trọng nhất trong dự đoán kết quả đua ngựa.

### Web Service

Nghiên cứu đã triển khai thành công hệ thống Web hỗ trợ:

* Hiển thị ranking prediction
* Trực quan hóa kết quả dự đoán
* Hỗ trợ người dùng đưa ra quyết định dễ dàng hơn

---

## Limitations

### Hạn chế của bài báo là gì?

### 1. Chỉ tập trung vào Prediction

Nghiên cứu chủ yếu tập trung vào dự đoán kết quả đua ngựa.

Chưa giải quyết các nghiệp vụ quản lý giải đấu như:

* Đăng ký ngựa
* Quản lý jockey
* Quản lý giải đấu
* Xếp lịch thi đấu
* Quản lý trọng tài

### 2. Chưa tích hợp Tournament Management

Web service chỉ đóng vai trò là công cụ dự đoán.

Chưa phải một hệ thống quản lý giải đua hoàn chỉnh.

### 3. Dataset giới hạn tại Hàn Quốc

Dữ liệu chỉ lấy từ Korea Racing Authority (KRA).

Khả năng tổng quát hóa sang các quốc gia khác vẫn cần được nghiên cứu thêm.

### 4. Chưa hỗ trợ Explainable AI chuyên sâu

Mặc dù có Feature Importance nhưng nghiên cứu chưa giải thích chi tiết nguyên nhân cho từng dự đoán cụ thể.

---

## Relevance to our topic

### Liên quan thế nào đến đề tài:

**AI-powered Horse Racing Tournament Management System**

### Mức độ liên quan: Rất cao (Core AI Reference Paper)

Đây là một trong những bài báo phù hợp nhất với đề tài vì:

### 1. Cùng Domain

* Horse Racing
* Race Prediction
* Web-based System

### 2. Cung cấp AI Prediction Module

Bài báo có thể được sử dụng làm nền tảng cho:

**Race Result Prediction Module**

trong hệ thống Horse Racing Tournament Management System.

### 3. Cung cấp mô hình phù hợp

Nhóm có thể sử dụng trực tiếp:

* LightGBM Ranker
* XGBoost Ranker
* CatBoost Ranker

để xây dựng AI Service thay vì phải nghiên cứu thuật toán mới từ đầu.

### 4. Phù hợp định hướng Applied AI

Mục tiêu của đề tài không phải là đề xuất thuật toán mới mà là:

> Tích hợp các mô hình AI hiện có vào hệ thống quản lý giải đua ngựa.

Bài báo này chính là cơ sở học thuật mạnh mẽ cho hướng nghiên cứu đó.

---

## Possible Improvement

### Có thể mở rộng gì cho đề tài Horse Racing?

### 1. Tích hợp vào Tournament Management System

Khác với bài báo chỉ có Prediction Service, đề tài có thể mở rộng thành một nền tảng quản lý hoàn chỉnh gồm:

* Tournament Management
* Registration Management
* Race Scheduling
* Referee Management
* Ranking Management
* Prediction Management

### 2. Spectator Prediction Support

Cho phép khán giả:

* Xem AI Prediction
* Tạo dự đoán cá nhân
* So sánh kết quả với AI
* Nhận thưởng hoặc tích điểm

### 3. Jockey Recommendation System

AI có thể gợi ý jockey phù hợp cho từng ngựa:

```
Horse X
→ Recommended Jockey A
→ Confidence: 87%
```

dựa trên lịch sử phối hợp giữa ngựa và jockey.

### 4. Explainable AI

Tích hợp SHAP hoặc các kỹ thuật giải thích mô hình:

Ví dụ:

```
Horse A được dự đoán hạng 1 vì:

+ Recent Performance : +35%
+ Low Assigned Weight : +22%
+ Strong Jockey : +18%
```

giúp người dùng hiểu nguyên nhân của từng dự đoán.

### 5. AI-assisted Race Scheduling

Kết hợp thêm các nghiên cứu về Tournament Scheduling để:

* Tự động chia race
* Tự động tạo lịch thi đấu
* Tối ưu thời gian nghỉ của ngựa và jockey
* Tự động sắp xếp vòng đấu

Từ đó xây dựng một **AI-powered Horse Racing Tournament Management System** hoàn chỉnh, kết hợp giữa quản lý giải đấu và trí tuệ nhân tạo.
