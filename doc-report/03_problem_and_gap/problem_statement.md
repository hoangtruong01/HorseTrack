# Phát biểu vấn đề nghiên cứu (Problem Statement)

## 1. Practical Problem (Vấn đề thực tế)
Ngành công nghiệp thể thao giải trí đua ngựa chuyên nghiệp là một hệ sinh thái cực kỳ phức tạp, đòi hỏi sự phối hợp chính xác theo thời gian thực giữa nhiều bên: Ban tổ chức giải đấu, Chủ ngựa, Nài ngựa (Jockey), Trọng tài và Khán giả. Việc quản lý một giải đua tiêu tốn rất nhiều nguồn lực cho các công việc hành chính như: theo dõi phả hệ sinh học của ngựa, xác thực hồ sơ y tế, áp dụng quy định hạng cân và lập lịch thi đấu.

Mặc dù có độ phức tạp cao, nhiều hiệp hội đua ngựa hiện nay vẫn đang vận hành dựa trên các phần mềm cũ kỹ, rời rạc hoặc các quy trình thủ công. Sự yếu kém về mặt công nghệ này đã dẫn đến ba điểm nghẽn cốt lõi sau:

*   **Sự hỗn loạn trong lập lịch thi đấu (The Scheduling Chaos):** Lịch thi đấu hiện tại phần lớn được xếp dựa trên kinh nghiệm cá nhân. Ban tổ chức rất khó để tự cân đối cùng lúc một ma trận dày đặc các **ràng buộc cứng và mềm** (ví dụ: đảm bảo khoảng thời gian nghỉ hồi sức hợp lý cho ngựa, tránh trùng lịch chạy của nài ngựa và phân bổ trọng tài công bằng), dẫn đến việc lịch trình liên tục bị xung đột.
*   **Hồ sơ bị cô lập và rủi ro về sức khỏe chiến mã (Data Silos & Animal Welfare Risks):** Hồ sơ của ngựa (chỉ số sinh học, phong độ lịch sử, khoảng thời gian phục hồi) bị lưu trữ phân tán trên các file Excel độc lập. Sự phân mảnh dữ liệu này khiến việc kiểm soát lịch nghỉ ngơi bắt buộc của ngựa trở nên bất khả thi (gây nguy cơ ngựa bị kiệt sức), đồng thời tạo ra các lỗ hổng cho hành vi gian lận hồ sơ đăng ký (như làm giả tuổi hoặc phả hệ của ngựa).
*   **Trải nghiệm người xem mang nặng tính thương mại và cảm tính (Subjective Fan Engagement):** Khán giả và các nhà phân tích hoàn toàn thiếu cận các nguồn dữ liệu minh bạch, khách quan. Việc đánh giá trước trận đấu hiện nay phụ thuộc chủ yếu vào tỷ lệ cược tĩnh mang tính thương mại của nhà cái hoặc cảm tính cá nhân, chứ không dựa trên bất kỳ một hệ thống dự báo khoa học có kiểm chứng nào.

---

## 2. Importance of the Problem (Vì sao vấn đề này quan trọng?)
Việc loại bỏ các quy trình vận hành kém hiệu quả và lấp đầy khoảng trống phân tích dữ liệu này là nhiệm vụ cấp thiết để hiện đại hóa ngành đua ngựa, mang lại giá trị lớn cho tất cả các bên tham gia:

*   **Đối với Ban tổ chức giải đấu:** Chuyển đổi toàn bộ quy trình vận hành từ các tác vụ thủ công dễ sai sót sang một bảng điều khiển (Dashboard) tập trung; tự động hóa việc kiểm tra quy chế và triệt tiêu các rủi ro xung đột lợi ích khi phân công trọng tài hoặc sơ đồ đường đua.
*   **Đối với Chủ ngựa & Nài ngựa:** Đảm bảo một môi trường cạnh tranh công bằng, minh bạch thông qua việc chuẩn hóa quy trình đăng ký và áp dụng các thuật toán kiểm soát thời gian nghỉ ngơi bắt buộc để bảo vệ an toàn sức khỏe cho ngựa.
*   **Đối với Khán giả & Người hâm mộ:** Cách mạng hóa trải nghiệm xem giải đấu bằng cách thay thế việc "đoán mò" cảm tính bằng các phân tích dữ liệu khoa học, từ đó củng cố niềm tin lâu dài của người dùng và tăng tỷ lệ giữ chân khách hàng cho nền tảng.

Nếu không có các công cụ tự động hóa tối ưu ràng buộc, pipeline dữ liệu chuẩn hóa và hệ thống xếp hạng thông minh, việc vận hành một trường đua sẽ mãi là một mô hình chi phí cao, rủi ro lớn và phụ thuộc nghiêm trọng vào nhận định chủ quan của con người.

---

## 3. Core System Objectives (Mục tiêu cốt lõi của hệ thống)
Để giải quyết triệt để khoảng trống vận hành và phân tích này, dự án của chúng tôi xây dựng một nền tảng Web đa tác nhân (Multi-tenant) toàn diện dựa trên **kiến trúc Trình duyệt/Máy chủ (B/S)** bảo mật. Hệ thống sẽ chuyển hóa các tác vụ nhập liệu hành chính thông thường thành một hệ sinh thái thông minh thông qua hai đổi mới công nghệ cốt lõi:

*   **Tối ưu hóa lập lịch tự động (Automated Constraint Optimization):** Triển khai **Thuật toán Di truyền kết hợp heuristic (POX-Heuristic Genetic Algorithm)** để tự động xử lý các ràng buộc đa biến, từ đó xuất ra lịch thi đấu tối ưu, hoàn toàn không bị xung đột lịch trình và bảo đảm tuyệt đối cửa sổ thời gian phục hồi sức khỏe cho ngựa đua.
*   **Phân tích dự báo thông minh (Intelligent Predictive Analytics):** Xây dựng một pipeline dữ liệu tự động ứng dụng các thuật toán **Learning-to-Rank (LambdaRank) và Học máy bầy đàn (XGBoost/CatBoost)**. Pipeline này liên tục phân tích các dữ liệu sinh trắc học lịch sử, phong độ nài ngựa và điều kiện mặt sân theo thời gian thực để truyền phát (stream) các dự đoán chính xác về thứ hạng Top-k của cuộc đua trực tiếp lên giao diện của khán giả.