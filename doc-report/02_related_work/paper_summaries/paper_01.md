# Paper 01 Summary

## Citation

Tên bài:
Smart Tournament Scheduling Using a POX-HeuristicGenetic Algorithm

Tác giả:
Mu-Chun Su, Jieh-Haur Chen, Achmad Muhyidin Arifai, Che-Hsuan Chang, Hsi-Hsien Wei

Năm:
2025

Nguồn:
International Journal of Information Technology & Decision Making (Vol. 24, No. 6)

DOI/Link:
https://doi.org/10.1142/S0219622025500221

---

## Problem

Bài báo giải quyết vấn đề gì?

Các hệ thống sắp xếp lịch thi đấu giải đấu (Tournament Scheduling) thường gặp khó khăn khi phải xử lý:

* Đảm bảo tính công bằng cho tất cả các đối thủ tham gia.
* Tránh việc xếp các trận đấu liên tiếp khiến người tham gia không có đủ thời gian nghỉ ngơi.
* Khối lượng trận đấu lớn, nhiều ràng buộc phức tạp làm việc xếp lịch thủ công tốn quá nhiều thời gian và nhân lực.
* Các toán tử di truyền truyền thống không thể áp dụng trực tiếp do cấu trúc mã hóa đặc thù của nhiễm sắc thể trong bài toán lịch trình.

Trong bài toán lập lịch thi đấu, việc giải quyết các nhiễm sắc thể chứa "gene chất lượng kém" (poorly performing genes) thường làm giảm hiệu suất và tốc độ hội tụ của thuật toán tối ưu.

Ngoài ra, các app lập lịch online thông thường thường gặp vấn đề:

* Chỉ hỗ trợ các hệ thống giải đấu vòng tròn (league-type) đơn giản.
* Không tự động tối ưu hóa thời gian nghỉ của người chơi, dễ gây ra hiện tượng xếp lịch thi đấu liên tục
* Khi số lượng đăng ký vượt giới hạn hệ thống hoặc trải rộng trên nhiều địa điểm, độ chính xác và hiệu suất xử lý có thể giảm.

Bài báo đề xuất nâng cao hiệu quả tự động lập lịch giải đấu ở nhiều quy mô khác nhau thông qua việc kết hợp thuật toán di truyền (GA), toán tử lai POX và kỹ thuật đột biến Heuristic.

---

## Method

Bài báo dùng phương pháp/model/hệ thống nào?

Tác giả đề xuất framework:

# POX-heuristic GA

(POX-Heuristic Genetic Algorithm)

Framework kết hợp:

```text
Tournament Restrictions
↓
Chromosome Encoding (Sequence & Venue)
↓
POX Crossover & Heuristic Mutation
↓
Objective Function Optimization (Minimize Delays)
↓
Optimal Tournament Schedule
```

---

### Thành phần Mã hóa & Tối ưu hóa

Hệ thống sử dụng bộ đôi nhiễm sắc thể đặc thù để:

* Mã hóa chính xác thứ tự trận đấu (Schedule Sequence Chromosome) và mã hóa phân bổ địa điểm (Schedule Venue Chromosome).
* Thiết lập hàm mục tiêu tập trung vào việc giảm thiểu chỉ số trì hoãn tổng thể (DelayNum = One Round Delay + Two Round Delay).
* Ngăn chặn triệt để tình trạng chồng chéo khung giờ hoặc phân bổ thiếu thời gian hồi sức giữa các chặng đấu liên tiếp.

---

### Long-context Reasoning

Framework được thiết kế để xử lý:

```text
Information
spread across
multiple lessons
```

thay vì chỉ dựa vào một đoạn văn đơn lẻ.

---

### Transfer Learning

Mô hình tận dụng transfer learning để:

* Cải thiện khả năng hiểu ngữ cảnh học thuật.
* Tăng khả năng suy luận trên textbook QA.

---

## Dataset

Bài báo dùng dữ liệu gì?

Nghiên cứu tập trung vào:

### Textual Multiple-choice Question Answering

Dữ liệu gồm:

* Textbook.
* Educational Reading Materials.
* Multiple-choice Questions.

Các câu hỏi yêu cầu:

* Reading Comprehension.
* Knowledge Retrieval.
* Multi-section Reasoning.

---

## Evaluation

Bài báo đánh giá bằng metric nào?

### Accuracy

Đánh giá độ chính xác của câu trả lời.

---

### Validation Performance

So sánh:

* Baseline Models.
* LLM-only Systems.
* RAG-based Framework.

---

### Test Performance

Đánh giá khả năng tổng quát hóa trên tập kiểm tra.

---

## Results

Kết quả chính là gì?

Framework PLRTQA đạt:

### Validation Set

Tăng:

```text
+4.12%
```

Accuracy so với baseline.

---

### Test Set

Tăng:

```text
+9.84%
```

Accuracy so với baseline.

---

### Main Findings

Kết quả cho thấy:

* RAG giúp tăng khả năng grounding.
* Long-context retrieval cải thiện reasoning.
* Hệ thống hoạt động tốt hơn trên các câu hỏi mà kiến thức nằm ở nhiều phần khác nhau của textbook.

Tác giả kết luận rằng:

> Retrieval-Augmented Generation là hướng tiếp cận hiệu quả để nâng cao chất lượng Textbook Question Answering trong môi trường giáo dục.

---

## Limitations

Hạn chế của bài báo là gì?

### 1. Chỉ tập trung vào Textbook QA

Nghiên cứu chủ yếu đánh giá trên:

```text
Textbook
```

chưa mở rộng sang:

* PDF học tập đa dạng.
* Lecture Notes.
* Syllabus.
* Course Slides.

---

### 2. Chưa có Self-Evaluation

Framework:

```text
Retrieve
→ Generate
```

chưa có:

```text
Self-Critique
```

như Self-RAG.

---

### 3. Chưa có Retrieval Correction

Nếu retrieval sai:

```text
Bad Retrieval
→ Bad Answer
```

vẫn là vấn đề.

---

### 4. Chưa hỗ trợ Personalized Learning

Hệ thống chưa xem xét:

* Trình độ người học.
* Lịch sử học tập.
* Adaptive Learning.

---

## Relevance to our topic

Bài báo liên quan gì đến đề tài của nhóm?

Mức độ liên quan:

# Rất cao (Educational QA Paper)

Đề tài:

**AI Study Hub – Hệ thống hỏi đáp tài liệu học tập ứng dụng RAG**

Bài báo gần với AI Study Hub vì đều tập trung vào:

```text
Educational Question Answering
```

trên:

* Tài liệu học tập.
* Textbook.
* Hệ thống Retrieval.

---

### PLRTQA

```text
Textbook
↓
Retrieve
↓
LLM
↓
Answer
```

### AI Study Hub

```text
PDF
↓
Chunking
↓
Embedding
↓
Pinecone
↓
RAG
↓
Answer
```

---

Paper này là bằng chứng học thuật cho thấy:

> Retrieval-Augmented Generation giúp cải thiện đáng kể khả năng trả lời câu hỏi học thuật khi kiến thức nằm phân tán trong nhiều phần của tài liệu học tập.

---

## Possible improvement

Nhóm có thể cải tiến hoặc mở rộng điểm nào?

### 1. Kết hợp DR-RAG

Pipeline:

```text
Question
↓
Retrieve
↓
Dynamic Retrieval
↓
Answer
```

để xử lý các câu hỏi cần nhiều nguồn thông tin.

---

### 2. Kết hợp CRAG

Thêm:

```text
Retrieval Evaluation
```

giúp giảm retrieve sai chunk.

---

### 3. Kết hợp Self-RAG

Pipeline:

```text
Question
↓
Retrieve
↓
Generate
↓
Self-Evaluate
```

giúp tăng độ tin cậy của câu trả lời.

---

### 4. Hỗ trợ tài liệu học tập đa định dạng

Mở rộng từ:

```text
Textbook
```

sang:

* PDF.
* Slides.
* Lecture Notes.
* Course Materials.

---

### 5. Hướng nghiên cứu cho AI Study Hub

So sánh:

```text
LLM Only
vs
Basic RAG
vs
PLRTQA-style Educational RAG
vs
AI Study Hub
```

Đánh giá:

* Accuracy
* Recall
* Faithfulness
* Hallucination Rate
* Response Time

để chứng minh hệ thống hỏi đáp học tập sử dụng RAG mang lại hiệu quả cao hơn các chatbot AI tổng quát trong môi trường giáo dục.