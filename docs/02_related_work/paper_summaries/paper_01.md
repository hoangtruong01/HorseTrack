# Paper 01 Summary

## Citation

Tên bài:
Enhancing Textual Textbook Question Answering with Large Language Models and Retrieval-Augmented Generation

Tác giả:
H. A. Alawwad và cộng sự

Năm:
2024

Nguồn:
arXiv

DOI/Link:
https://arxiv.org/abs/2402.05128

---

## Problem

Bài báo giải quyết vấn đề gì?

Các hệ thống Question Answering trên textbook thường gặp khó khăn khi phải xử lý:

* Nội dung dài.
* Nhiều chương học khác nhau.
* Kiến thức phân tán trong nhiều bài học.
* Các câu hỏi yêu cầu suy luận vượt ra ngoài một đoạn văn duy nhất.

Trong các bài toán Textbook QA, thông tin cần thiết để trả lời thường nằm ở nhiều phần khác nhau của giáo trình, khiến các mô hình truyền thống khó retrieve đầy đủ ngữ cảnh liên quan.

Ngoài ra, các LLM tổng quát thường gặp vấn đề:

* Hallucination.
* Thiếu grounding vào nội dung sách giáo khoa.
* Giảm độ chính xác khi gặp kiến thức ngoài dữ liệu huấn luyện.

Bài báo hướng tới việc cải thiện khả năng trả lời câu hỏi học thuật bằng cách kết hợp Retrieval-Augmented Generation (RAG) với các kỹ thuật transfer learning và long-context reasoning.

---

## Method

Bài báo dùng phương pháp/model/hệ thống nào?

Tác giả đề xuất framework:

# PLRTQA

(Prompt-based Long-context Retrieval Textbook Question Answering)

Framework kết hợp:

```text
Textbook
↓
Retrieval
↓
Relevant Context
↓
LLM
↓
Question Answering
```

---

### Thành phần Retrieval

Hệ thống sử dụng Retrieval-Augmented Generation để:

* Retrieve các đoạn văn liên quan từ textbook.
* Giảm context noise.
* Ground câu trả lời vào tài liệu học tập.

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