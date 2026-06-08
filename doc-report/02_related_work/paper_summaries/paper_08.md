# Citation
* **Tác giả:** Graham Kendall, Sigrid Knust, Celso C. Ribeiro, Sebastián Urrutia.
* **Đơn vị công tác:** University of Nottingham (UK); Technical University of Clausthal (Germany); Universidade Federal Fluminense (Brazil); Universidade Federal de Minas Gerais (Brazil).
* **Tên bài báo:** Scheduling in sports: An annotated bibliography.
* **Nguồn xuất bản:** Computers & Operations Research, Volume 37, Issue 1, 2010, pp. 1-19.
* **Link:** https://d1wqtxts1xzle7.cloudfront.net/90125114/corsportsbib-libre.pdf?1661243877=&response-content-disposition=inline%3B+filename%3DScheduling_in_sports_An_annotated_biblio.pdf&Expires=1780921880&Signature=XT~xGa4urlTsehMkS9eLysC3M0UmtxKrtD6nn-EtriadvUXhRkPAowQ1caI6u-BCXg8qvZCQe1Lqjd3qSkkUC1SDIDS8KNs2zDEkNeiEg~XdutbDojUqtHJ4M4Go3dBCogXPtTqk0iEnf7lXlBPplD~zzihl73Z0hcv~50OBkr5-sIENVPaftBOS4wqiG6nzUazPogbhRpBtou4LDdw4yCGs0u6tXZ-pCXnjzofA~ljMbgKKOe8YRcTn0C~J1lFzHlGuXFfwTgHJoKWmJYwug~ztRq27ll~oQio~BqEmdHAf9al06HpL3frqnOAMBq--2pTSkpfqPNAjMk3McL8qoA__&Key-Pair-Id=APKAJLOHF5GGSLRBV4ZA

# Problem
* Lập lịch thi đấu thể thao (Sports Scheduling) là một bài toán tối ưu hóa tổ hợp cực kỳ phức tạp (thường thuộc lớp NP-hard), thu hút sự chú ý lớn do ảnh hưởng trực tiếp đến doanh thu khổng lồ của các giải đấu và đài truyền hình.
* Việc sắp xếp lịch không chỉ đơn thuần là gán đội này đấu với đội kia, mà phải thỏa mãn hàng loạt ràng buộc khắt khe: Ràng buộc công bằng (số trận sân nhà/sân khách), logistic (tối ưu khoảng cách di chuyển), phân bổ thời gian nghỉ ngơi hợp lý, và tránh xung đột lợi ích (đặc biệt trong việc phân công trọng tài).
* Quản lý thủ công sẽ dẫn đến sai sót, thiên vị và không thể tối ưu hóa được chi phí/doanh thu khi quy mô giải đấu tăng lên.

# Method
* Đây là một bài báo **Tổng quan tài liệu (Annotated Bibliography)**. Các tác giả đã tổng hợp, phân loại và đánh giá có hệ thống toàn bộ nền tảng tài liệu khoa học về lập lịch thể thao (với hơn 162 bài báo được chọn lọc).
* Bài báo phân loại các kỹ thuật giải quyết bài toán lập lịch thành các nhóm phương pháp chính:
  * **Quy hoạch toán học (Mathematical Programming):** Quy hoạch nguyên (Integer Programming - IP) và Quy hoạch ràng buộc (Constraint Programming - CP) để giải quyết các ràng buộc cứng.
  * **Thuật toán Metaheuristics:** Tìm kiếm cục bộ (Local Search), Tìm kiếm Tabu (Tabu Search), Luyện kim nhân tạo (Simulated Annealing), và Thuật toán Di truyền (Genetic Algorithms) để giải các bài toán lớn trong thời gian thực.
* Bài báo phân mảng cụ thể thành các bài toán lõi: Lập lịch vòng tròn (Round-Robin), Bài toán giải đấu di chuyển (Traveling Tournament Problem - TTP), Các giải đấu vòng loại loại trực tiếp (Tournament Designs), và Phân công trọng tài (Referee Assignment).

# Dataset
* Bài báo không sử dụng một tập dữ liệu chuyên biệt để huấn luyện AI mà đánh giá dựa trên các bộ dữ liệu tiêu chuẩn (benchmark datasets) nổi tiếng trong giới học thuật như: Tập dữ liệu TTP Benchmark (NL8 đến NL16), và dữ liệu lịch sử thi đấu thực tế từ các giải nhà nghề (MLB, NHL, NBA) hoặc các giải bóng đá vô địch quốc gia (Áo, Brazil, Chile, Đan Mạch...).

# Evaluation
* Đánh giá sức mạnh của các thuật toán tối ưu hóa dựa trên:
  * **Khả năng tìm nghiệm tối ưu (Optimality):** Giảm thiểu tổng chi phí hoặc tổng quãng đường di chuyển.
  * **Thời gian tính toán (Computational time):** Tính khả thi của thuật toán khi áp dụng vào thực tế với hàng trăm đội bóng/vận động viên.
  * **Thỏa mãn ràng buộc (Constraints Satisfaction):** Tỷ lệ đáp ứng thành công các Ràng buộc cứng (Hard constraints - bắt buộc phải tuân thủ) và Ràng buộc mềm (Soft constraints - có thể vi phạm nhưng bị phạt điểm).

# Results
* Bài báo xây dựng thành công một thư mục phân loại toàn diện cho bài toán xếp lịch thể thao, trở thành tài liệu gối đầu giường cho các nhà phát triển hệ thống quản lý giải đấu.
* Chỉ ra rằng đối với các giải đấu quy mô nhỏ, Quy hoạch nguyên (Integer Programming) kết hợp với Quy hoạch ràng buộc mang lại kết quả tối ưu tuyệt đối.
* Tuy nhiên, với các giải đấu lớn phức tạp, các phương pháp lai (Hybrid methods) giữa thuật toán Metaheuristic và Quy hoạch toán học là giải pháp mang lại hiệu quả thực tiễn cao nhất.

# Limitations
* Các bài toán và ví dụ trong tài liệu chủ yếu tập trung vào các môn thể thao đối kháng theo cặp (đội A đấu với đội B như bóng đá, bóng rổ, bóng chày) hoặc giải đấu lưới (Tennis). Rất ít tài liệu đề cập sâu đến mô hình "Đua tốc độ" (Racing) như đua xe hay đua ngựa - nơi một cuộc đua có nhiều thực thể (8-14 con ngựa) cùng thi đấu tại một thời điểm.
* Do bài báo xuất bản từ năm 2010, các công nghệ hiện đại hóa xếp lịch dựa trên Học Sâu (Deep Learning) hay Học Tăng Cường (Reinforcement Learning) chưa được đề cập.

# Relevance to our topic
* Tài liệu này cung cấp **nền tảng lý thuyết và logic thuật toán vô giá** cho Admin trong hệ thống của bạn, đặc biệt để hiện thực hóa 2 Yêu cầu chức năng:
  1. *"Quản lý thông tin giải đấu đua ngựa, lập lịch thi đấu, sắp xếp cuộc đua và vòng đua"*.
  2. *"Phân công trọng tài"*.
* Đua ngựa cũng bị ràng buộc bởi các yếu tố thể lực và logistic rất gắt gao. Bạn có thể áp dụng tư duy "Hard constraints & Soft constraints" của bài báo để thiết kế logic backend. Ví dụ:
  * *Hard constraint:* Một con ngựa không được phép xếp đua 2 cuộc đua trong cùng 1 ngày (nếu vi phạm, hệ thống báo lỗi không cho Admin lưu).
  * *Soft constraint:* Hạn chế tối đa xếp một Jockey thi đấu liên tục 3 chặng không nghỉ (nếu vi phạm thì hệ thống chỉ cảnh báo).

# Possible improvement
* **Thiết kế thuật toán xếp lịch tự động (Auto-Scheduling):** Nhóm có thể áp dụng Thuật toán Di truyền (Genetic Algorithm) kết hợp hàm phạt (Penalty Function) để hệ thống tự động gợi ý lịch đua (nhóm ngựa nào đua chặng nào, giờ nào) thay vì bắt Admin phải tự nhặt từng con ngựa vào danh sách thi đấu một cách thủ công.
* **Mô-đun phân công trọng tài chống gian lận (Referee Assignment):** Áp dụng bài toán phân công trọng tài từ bài báo để tự động hóa việc gán Trọng tài (Race Referee) vào các chặng đua. Hệ thống sẽ có logic ngăn chặn việc một trọng tài bắt quá nhiều chặng đua có mặt một Chủ ngựa (Horse Owner) cụ thể, nhằm tăng tính công bằng, minh bạch và đáp ứng quy chuẩn của các giải đấu lớn.
