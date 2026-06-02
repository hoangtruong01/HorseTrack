# Academic Reference Paper List

Dưới đây là danh sách 10 bài báo khoa học nghiên cứu được trích xuất từ thư mục `paper` và được phân loại theo các nhóm chức năng đóng góp cho dự án **Horse Racing Tournament Management System** (Hệ thống hỏi đáp tài liệu học tập ứng dụng Retrieval-Augmented Generation).

## 1. Danh sách các bài báo nghiên cứu (Reference List)

| STT | Tên bài báo (Paper Title) | Tác giả (Authors) | Năm | Nguồn (Source) | Loại tài liệu | Vai trò / Đóng góp cho dự án |
|---|---|---|---|---|---|---|
| 01 | Smart Tournament Scheduling Using a POX-Heuristic Genetic Algorithm | Mu-Chun Su, Jieh-Haur Chen, Jieh-Haur Chen, Che-Hsuan Chang, Hsi-Hsien Wei | 2025 | WorldScientific | Core / Advanced Retrieval | Làm cơ sở cải tiến Basic RAG bằng truy xuất hai giai đoạn, giúp hệ thống tìm được các chunk liên quan động trong câu hỏi học thuật nhiều bước. |
| 02 | Dense Passage Retrieval for Open-Domain Question Answering | Vladimir Karpukhin, Barlas Oguz, Sewon Min, Patrick Lewis, Ledell Wu, Sergey Edunov, Danqi Chen, Wen-tau Yih | 2020 | EMNLP | Core / Methodology | Cung cấp nền tảng cho dense retrieval, embedding search và vector database trong pipeline hỏi đáp tài liệu học tập. |
| 03 | Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks | Patrick Lewis, Ethan Perez, Aleksandra Piktus, Fabio Petroni, Vladimir Karpukhin và cộng sự | 2020 | NeurIPS | Core / Framework | Bài báo nền tảng về RAG, làm cơ sở lý thuyết cho kiến trúc retrieve context rồi sinh câu trả lời bằng LLM. |
| 04 | Dense Passage Retrieval for Open-Domain Question Answering | Vladimir Karpukhin, Barlas Oguz, Sewon Min, Patrick Lewis, Ledell Wu, Sergey Edunov, Danqi Chen, Wen-tau Yih | 2020 | EMNLP | Core / Retrieval Foundation | Củng cố cơ sở kỹ thuật cho semantic search, FAISS/vector index, Top-k retrieval và so sánh với BM25. |
| 05 | DR-RAG: Applying Dynamic Document Relevance to Retrieval-Augmented Generation for Question-Answering | Zijian Hei, Weiling Liu, Wenjie Ou, Juyi Qiao, Junming Jiao, Guowen Song, Ting Tian, Yi Lin | 2024 | arXiv | Advanced / Multi-hop RAG | Minh chứng vai trò của dynamic-relevant documents trong QA nhiều bước, phù hợp với câu hỏi cần tổng hợp nhiều phần của PDF, slide hoặc syllabus. |
| 06 | Self-RAG: Learning to Retrieve, Generate, and Critique through Self-Reflection | Akari Asai, Zeqiu Wu, Yizhong Wang, Avirup Sil, Hannaneh Hajishirzi | 2023 / ICLR 2024 | ICLR / arXiv | Advanced / Self-Evaluation | Gợi ý cơ chế tự đánh giá retrieval, độ hỗ trợ của bằng chứng và chất lượng câu trả lời để giảm hallucination trong môi trường giáo dục. |
| 07 | Corrective Retrieval Augmented Generation | Shi-Qi Yan, Jia-Chen Gu, Yun Zhu, Zhen-Hua Ling | 2024 | arXiv | Advanced / Retrieval Reliability | Cung cấp hướng thiết kế tầng đánh giá và sửa lỗi retrieval trước khi generate, giúp hạn chế trả lời sai do retrieve nhầm chunk. |
| 08 | A Novel Framework for Educational Q&A: Leveraging RAG and LLM Code Interpreters | Nhiều tác giả | 2024 | PubMed Central | Domain / Educational RAG | Liên quan trực tiếp đến hỏi đáp giáo dục; chứng minh RAG kết hợp Code Interpreter giúp hỗ trợ câu hỏi học thuật và STEM tốt hơn. |
| 09 | How to Build an AI Tutor that Can Adapt to Any Course and Provide Accurate Answers Using Retrieval-Augmented Generation | Haritz Puerto, Gorkem Ozdemir, Imanol Schlag, Ethan Perez và cộng sự | 2023 | arXiv / Hugging Face Papers | Domain / AI Tutor | Gần với AI Study Hub nhất về mặt sản phẩm: upload tài liệu môn học, index, retrieve và trả lời mà không cần fine-tune cho từng môn. |
| 10 | Retrieval-Augmented Generation Chatbots for Education: A Survey of Applications | Nhiều tác giả | 2025 | Applied Sciences / MDPI | Survey / Literature Foundation | Tổng hợp các ứng dụng RAG trong giáo dục, cung cấp xu hướng, metric, challenge và research gap cho phần Literature Review. |

---

## 2. Phân loại bài báo theo yêu cầu (Required Grouping)

Để phục vụ tốt nhất cho việc nghiên cứu và viết bài báo khoa học cho đồ án AI Study Hub, 10 tài liệu trên được phân chia thành 3 nhóm rõ ràng theo hướng dẫn của Bước 2:

### Nhóm 1: Các bài báo liên quan trực tiếp đến đề tài (Directly Related Papers)
*Yêu cầu tối thiểu: 5 bài báo. Thực tế phân loại: 5 bài.*
- **Bài 03 (Lewis et al., 2020):** RAG Foundation — Trực tiếp đặt nền tảng cho kiến trúc hỏi đáp tài liệu bằng retrieval kết hợp generation.
- **Bài 08 (PMC, 2024):** Educational RAG + Code Interpreter — Ứng dụng RAG trong hỏi đáp giáo dục và hỗ trợ bài toán học thuật cần suy luận/tính toán.
- **Bài 09 (Puerto et al., 2023):** Course-Adaptive AI Tutor — Mô hình AI Tutor thích ứng với bất kỳ môn học nào bằng tài liệu được upload.
- **Bài 10 (MDPI, 2025):** Educational RAG Survey — Tổng quan trực tiếp về RAG chatbot trong giáo dục, metric và khoảng trống nghiên cứu.
- **Bài 06 (Asai et al., 2023/2024):** Self-RAG — Liên quan trực tiếp đến mục tiêu tăng độ tin cậy và giảm hallucination cho câu trả lời học tập.

### Nhóm 2: Các bài báo về Model AI hoặc Phương pháp AI (AI/Model/Method Papers)
*Yêu cầu tối thiểu: 3 bài báo. Thực tế phân loại: 6 bài.*
- **Bài 01 (Hei et al., 2024):** DR-RAG — Truy xuất hai giai đoạn và dynamic relevance classifier cho multi-hop QA.
- **Bài 02 (Karpukhin et al., 2020):** DPR — BERT dual encoder, dense vector retrieval, hard negatives và FAISS.
- **Bài 03 (Lewis et al., 2020):** RAG — Kết hợp DPR retriever và BART generator cho knowledge-intensive NLP.
- **Bài 05 (Hei et al., 2024):** DR-RAG — Cải tiến retrieval cho dynamic-relevant documents.
- **Bài 06 (Asai et al., 2023/2024):** Self-RAG — Adaptive retrieval, reflection tokens và self-critique.
- **Bài 07 (Yan et al., 2024):** CRAG — Retrieval evaluator, corrective retrieval và decompose-then-recompose.

### Nhóm 3: Các bài báo về Domain ứng dụng (Domain/Application Papers)
*Yêu cầu tối thiểu: 2 bài báo. Thực tế phân loại: 3 bài.*
- **Bài 08 (PMC, 2024):** Framework hỏi đáp giáo dục dựa trên RAG và Code Interpreter.
- **Bài 09 (Puerto et al., 2023):** AI Tutor theo môn học, sử dụng course materials để trả lời chính xác theo tài liệu.
- **Bài 10 (MDPI, 2025):** Survey về chatbot RAG trong giáo dục, bao gồm AI Tutor, academic QA, personalized learning và learning assistants.