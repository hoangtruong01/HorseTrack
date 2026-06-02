# Academic Search Keywords Matrix

Bảng dưới đây liệt kê các từ khóa tìm kiếm học thuật (Search Queries) và mô-đun ứng dụng tương ứng (Target Module) được rút ra từ 10 bài báo nghiên cứu nền tảng để phát triển dự án **Horse Racing Tournament Management System**:

| STT | Từ khóa tìm kiếm học thuật (Search Queries) | Mô-đun ứng dụng tương ứng (Target Module) |
|---|---|---|
| 01 | `"Retrieval-Augmented Generation"` `"educational question answering"` `"course-specific QA"` `"LLM"` | **Core-RAG:** Pipeline hỏi đáp tài liệu học tập dựa trên RAG |
| 02 | `"Dense Passage Retrieval"` `"open-domain question answering"` `"BERT dual encoder"` `"FAISS"` | **Retrieval-Core:** Truy xuất ngữ nghĩa bằng embedding và vector database |
| 03 | `"DPR"` `"semantic search"` `"vector database"` `"BM25 hard negatives"` | **Embedding-Service:** Lựa chọn và tối ưu mô hình embedding cho tài liệu học tập |
| 04 | `"RAG"` `"BART generator"` `"DPR retriever"` `"knowledge-intensive NLP"` | **Answer-Generation:** Sinh câu trả lời dựa trên context retrieved từ tài liệu |
| 05 | `"Dynamic Document Relevance"` `"DR-RAG"` `"multi-hop question answering"` `"Query Document Concatenation"` | **Advanced-Retrieval:** Truy xuất nhiều bước cho câu hỏi cần nhiều phần tài liệu |
| 06 | `"Self-RAG"` `"self-reflection"` `"reflection tokens"` `"citation accuracy"` | **Answer-Verification:** Tự đánh giá câu trả lời, giảm hallucination và tăng độ tin cậy |
| 07 | `"Corrective RAG"` `"retrieval evaluator"` `"corrective retrieval"` `"hallucination reduction"` | **Retrieval-Evaluation:** Đánh giá và sửa lỗi chunk retrieved trước khi sinh câu trả lời |
| 08 | `"Educational RAG"` `"LLM code interpreter"` `"STEM education"` `"reasoning capability"` | **STEM-Support:** Hỗ trợ câu hỏi học thuật cần tính toán, suy luận hoặc giải thích công thức |
| 09 | `"AI Tutor"` `"course-adaptive"` `"Retrieval-Augmented Generation"` `"grounded generation"` | **AI-Tutor:** Gia sư AI thích ứng theo từng môn học thông qua tài liệu được upload |
| 10 | `"RAG chatbots for education"` `"student satisfaction"` `"learning effectiveness"` `"hallucination rate"` | **Evaluation-Metric:** Đánh giá hiệu quả học tập, độ chính xác, hallucination và trải nghiệm sinh viên |
| 11 | `"citation-based answering"` `"retrieval relevance"` `"faithfulness"` `"source grounding"` | **Citation-Answering:** Hiển thị nguồn/chunk tham chiếu cho câu trả lời học tập |
| 12 | `"personalized learning assistant"` `"student learning history"` `"adaptive learning"` `"AI tutor personalization"` | **Personalized-Learning:** Cá nhân hóa gợi ý học tập dựa trên lịch sử và tiến độ của sinh viên |
| 13 | `"multi-hop retrieval"` `"academic documents"` `"syllabus question answering"` `"lecture notes retrieval"` | **Academic-QA:** Hỏi đáp trên syllabus, slide, lecture notes và PDF môn học |
| 14 | `"RAG evaluation benchmark"` `"Exact Match"` `"F1 score"` `"Recall"` `"response time"` | **Benchmarking:** Thiết kế bộ đánh giá LLM-only vs Basic RAG vs Enhanced RAG |