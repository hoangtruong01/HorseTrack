# Citation
* **Tác giả:** Sascha Kaltenpoth, Alexander Skolik,Oliver Müller,Daniel Beverungen.
* **Đơn vị công tác:** Paderborn University, Warburger Straße 100, 33098 Paderborn, Germany
* **Tên bài báo:** A Step Towards Cognitive Automation: Integrating LLM Agents with Process Rules
* **Nguồn xuất bản:** International Conference on Business Process Management - BPM 2025
* **Link:** https://www.researchgate.net/publication/395117765_A_Step_Towards_Cognitive_Automation_Integrating_LLM_Agents_with_Process_Rules

# Problem
Bài báo giải quyết vấn đề gì?
* Bài báo tập trung giải quyết hai vấn đề chính trong tự động hóa quy trình doanh nghiệp:
  + Tự động hóa bằng robot (RPA) truyền thống quản lý tốt các quy tắc nhưng không thể xử lý các tác vụ đòi hỏi nhận thức và ra quyết định.
  - Các hệ thống Agent LLM hiện tại giải quyết được các tác vụ nhận thức nhưng thiếu khả năng tái sử dụng quy trình và không tuân thủ nghiêm ngặt các bước (dễ sinh ra lỗi ảo tưởng hoặc bỏ sót quyết định khi xử lý văn bản tự do) giống như RPA.

# Method
Bài báo dùng phương pháp/model/hệ thống nào?

Bài báo đề xuất một hệ thống LLM Agent tích hợp với Cơ sở dữ liệu Quy tắc Quy trình (Process Rule Database). Hệ thống sử dụng các phương pháp:
* **LLM-driven Rule Generation:** Sử dụng LLM để chuyển đổi các mô hình luồng công việc (BPMN) do con người tạo ra thành các bộ quy tắc văn bản bán cấu trúc (semi-structured process rules).
* **ReAct Framework & RAG:** Agent hoạt động theo cơ chế Suy luận và Hành động (ReAct), kết hợp với RAG (Retrieval-Augmented Generation) để truy xuất quy tắc phù hợp nhất từ cơ sở dữ liệu dựa trên ngữ cảnh lỗi hoặc yêu cầu.

# Dataset
Bài báo dùng dữ liệu gì?

 Nghiên cứu sử dụng dữ liệu mô phỏng từ môi trường thực tế:
* Dữ liệu từ một nhà cung cấp lưới điện tại Đức, tập trung vào quy trình xử lý lỗi SAP IDoc.
* Sử dụng 118 thực thể quy trình thuộc 8 quy trình thực tế khác nhau để đánh giá khả năng lặp lại.
* Sử dụng 54 yêu cầu phức tạp tự tạo (với tối đa 15 tác vụ/yêu cầu) để đánh giá khả năng mở rộng với các quy trình mới.

# Evaluation
Bài báo đánh giá bằng metric nào?
* Các tác giả đánh giá mô hình dựa trên các metrics sau:
  - Tỷ lệ hoàn thành tự động (Automation success rate): Tỷ lệ phần trăm các quy trình và yêu cầu được tự động hóa thành công.
  - Tỷ lệ lỗi: Sự sụt giảm của các quyết định sai lầm hoặc ảo tưởng so với hệ thống LLM dùng văn bản tự do.
  - Hiệu quả kinh tế (Economic impact): So sánh chi phí (thời gian và tiền bạc) khi dùng Agent so với con người xử lý lỗi thủ công.

# Results
Kết quả chính là gì?
* Agent sử dụng quy tắc cấu trúc hoàn thành thành công 99% các thực thể quy trình cũ và 85% các yêu cầu mới, cao hơn hẳn mức 84% và 76% của Agent không dùng quy tắc.
* Tỷ lệ thất bại do ra quyết định sai hoặc ảo tưởng giảm mạnh từ 16% xuống chỉ còn 1%.
* Tiết kiệm gần 89% chi phí vận hành so với việc dùng nhân viên con người để xử lý thủ công các quy trình này.

# Limitations
Hạn chế của bài báo là gì?
* Nghiên cứu mới chỉ dừng ở mức mô phỏng kiểm soát (controlled simulation), có thể chưa phản ánh hết sự phức tạp và tương tác động trong môi trường thực tế.
* Hiệu quả hệ thống phụ thuộc nặng nề vào chất lượng của mô hình quy trình BPMN đầu vào do con người thiết kế.
* Hệ thống chưa có khả năng tự động học hỏi và lưu trữ các quy trình mới vừa được giải quyết vào cơ sở dữ liệu quy tắc một cách độc lập.

# Relevance to our topic
Bài báo liên quan gì đến đề tài của nhóm?
  - Đề tài "Hệ thống quản lý giải đua ngựa" của bạn đang đối mặt với bài toán lớn là sự thủ công, thiếu đồng bộ và mất thời gian trong công tác quản trị. Bài báo này rất liên quan vì nó cung cấp cách tiếp cận để tự động hóa các quy trình quản lý (BPA) thông qua AI.
  - Trong hệ thống đua ngựa, các chức năng của Admin (như duyệt đăng ký, xếp lịch thi đấu) và Race Referee (kiểm tra điều kiện ngựa, lập biên bản, ghi nhận vi phạm) đều là những quy trình có quy tắc chặt chẽ nhưng thỉnh thoảng đòi hỏi sự linh hoạt (ví dụ: xếp lại lịch khi có ngựa rút lui, xử lý vi phạm dựa trên luật lệ).
  - Nếu chỉ lập trình cứng (RPA/Rules), hệ thống sẽ không xử lý được các tình huống ngoại lệ. Nếu chỉ dùng AI thông thường, AI có thể xếp lịch sai hoặc phân xử sai luật. Hướng tiếp cận của bài báo giúp bạn hình dung cách kết hợp giữa "bộ luật cứng của giải đấu" và "tư duy mềm của AI".

# Possible improvement
Nhóm có thể cải tiến hoặc mở rộng điểm nào?
* Nhóm bạn có thể áp dụng tư tưởng của bài báo để mở rộng một tính năng cốt lõi hoặc tạo ra điểm nhấn (selling point) cho đồ án:
  * **Tích hợp "Trợ lý Trọng tài/Admin AI" bám sát quy tắc:** Bạn có thể xây dựng một tính năng cho phép Admin hoặc Trọng tài nhập báo cáo vi phạm hoặc điều kiện thi đấu bằng văn bản (text). Thay vì để AI tự do phán xét, hệ thống AI của bạn sẽ truy xuất "Cơ sở dữ liệu Luật Đua Ngựa" (giống Process Rules) để tự động hóa việc đưa ra quyết định: có cho phép ngựa thi đấu hay không, hoặc đề xuất mức phạt tự động cho Jockey.
  * **Tự động hóa luồng xếp lịch linh hoạt:** Sử dụng LLM Agent có cấu trúc luật lệ để hỗ trợ Admin tự động sắp xếp vòng đua và lịch thi đấu. Nếu có xung đột về Jockey (một Jockey bị trùng lịch), Agent sẽ tự phát hiện lỗi dựa trên quy tắc và đề xuất phương án thay thế.
  * **Cải tiến điểm yếu của bài báo:** Nhóm có thể thiết kế để mỗi khi Admin phê duyệt một tình huống xử lý ngoại lệ mới, hệ thống tự động lưu nó lại thành một "Quy tắc mới" cho các giải đấu sau (tính năng tự học mà bài báo chưa làm được).