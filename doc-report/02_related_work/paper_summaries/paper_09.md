# Citation
 **Tác giả:** Faten K. Karim, Sara Ghorashi, Salem Alkhalaf, Anis Ben Ishak, Sameer AlShetewi.

**Đơn vị công tác:** Princess Nourah bint Abdulrahman University (Riyadh, Saudi Arabia); Qassim University (Buraydah, Saudi Arabia); University of Tunis (Tunis, Tunisia); Ministry of Defense (Riyadh, Saudi Arabia).

**Tên bài báo:** Modelling of Horse Herd Optimization Based Multi Objective Task Scheduling Approach in Cloud Computing Environment

**Nguồn xuất bản:** THERMAL SCIENCE: Year 2025, Vol. 29, No. 2B, pp. 1583-1595

**Link:** https://thermalscience.rs/pdfs/papers-2025/TSCI2502583K.pdf
# Problem
* Lập lịch tác vụ (Task Scheduling) trong môi trường điện toán đám mây là một thách thức lớn, ảnh hưởng trực tiếp đến hiệu năng hệ thống và mức độ hài lòng của người dùng .
* Đây là một bài toán thuộc lớp NP-khó (NP-hard / NP-complete) do việc ánh xạ các yêu cầu không đồng nhất từ người dùng vào tài nguyên ảo hóa theo thời gian thực vô cùng phức tạp .
* Nhiều phương pháp hiện tại chỉ tập trung vào việc tối ưu tổng thời gian hoàn thành (makespan) và tiêu thụ tài nguyên, mà bỏ qua các yếu tố quan trọng như điện năng tiêu thụ (energy usage) và chi phí vận hành (cost), điều này làm suy giảm chất lượng dịch vụ (QoS), tăng độ trễ và vi phạm thỏa thuận mức độ dịch vụ (SLA) .

# Method
* Bài báo đề xuất thuật toán tối ưu hóa bầy ngựa đa mục tiêu cho bài toán lập lịch tác vụ (HHO-MOTSA - Horse Herd Optimization-based Multi-Objective Task Scheduling Approach) .
* Thuật toán mô phỏng các hành vi xã hội độc đáo của loài ngựa theo 4 nhóm tuổi khác nhau bao gồm: gặm cỏ (grazing), phân cấp thứ bậc (hierarchy), tính xã hội (sociability), bắt chước (imitation), đi lang thang (roaming) và cơ chế phòng thủ (defense mechanism) .
* Xây dựng một hàm thích nghi đa mục tiêu (Multi-Objective Fitness Function) nhằm tối ưu hóa đồng thời ba thông số chính: giảm thiểu tổng thời gian hoàn thành tác vụ (makespan), điện năng tiêu thụ và chi phí tài nguyên, thông qua các trọng số thành phần thích hợp (γ1, γ2, γ3) .

# Dataset
* Nghiên cứu sử dụng môi trường mô phỏng CloudSim để thiết lập cấu hình trung tâm dữ liệu đám mây (CDC) và kiểm thử thuật toán .
* Dữ liệu thực nghiệm bao gồm tập hợp các tác vụ độc lập được tạo ngẫu nhiên hoặc theo các chuẩn benchmark với số lượng tác vụ thay đổi linh hoạt từ 50 đến 600 tác vụ, kết hợp với dải số lượng vòng lặp kiểm thử từ 25 đến 250 vòng lặp .

# Evaluation
* Các chỉ số hiệu năng được đưa vào đánh giá bao gồm: Tổng thời gian hoàn thành (makespan - MSP), thời gian phản hồi (response time - RT), thời gian thực thi (execution time - EXT) và năng lượng tiêu thụ (energy consumption) .
* Thuật toán đề xuất HHO-MOTSA được so sánh trực tiếp với 4 thuật toán lập lịch phổ biến và tiên tiến gần đây bao gồm: CCS, ICSA, CSRSA và EERS-CEPO .

# Results
* Thuật toán HHO-MOTSA đạt được tổng thời gian hoàn thành (makespan) thấp nhất một cách nhất quán trong tất cả các kịch bản số lượng tác vụ. Ví dụ, với 100 tác vụ, HHO-MOTSA đạt 126 ms so với mức từ 265-521 ms của các phương pháp khác; với 600 tác vụ, HHO-MOTSA chỉ tốn 1621 ms so với mức 1862-2605 ms của đối thủ .
* Thời gian phản hồi (RT) của HHO-MOTSA tối ưu nhất: tại 100 vòng lặp, RT chỉ là 792 ms trong khi các thuật toán khác mất từ 960 đến 1663 ms .
* Thời gian thực thi (EXT) được rút ngắn đáng kể: đối với 100 tác vụ là 2000 ms và 600 tác vụ là 5171 ms, vượt trội hơn hẳn so với các giải pháp đối sánh .
* Mức độ tiêu thụ năng lượng của hệ thống được cắt giảm tối đa, mang lại hiệu quả cao cho việc vận hành các trung tâm dữ liệu xanh .

# Limitations
* Thực nghiệm mới chỉ dừng lại ở môi trường mô phỏng CloudSim, chưa được triển khai và kiểm chứng trên các hệ thống đám mây phân tán thực tế (như AWS, Google Cloud hay Kubernetes cluster), nơi có sự bất ổn lớn về mạng và phần cứng .
* Việc thiết lập các tham số trọng số (γ1, γ2, γ3) trong hàm thích nghi vẫn mang tính cố định hoặc thủ công, chưa thể tự động điều chỉnh linh hoạt theo sự thay đổi động của lưu lượng tải trong thực tế .
* Độ phực tạp tính toán khi cập nhật vector vận tốc cho cả 4 nhóm tuổi ngựa với 6 hành vi khác nhau có thể trở thành gánh nặng tài nguyên khi quy mô bầy ngựa và số lượng tác vụ tăng lên mức cực đại .

# Relevance to our topic
* **Gợi ý mô hình hóa thực tế cho giải đua ngựa**: Thuật toán trong bài báo đã toán học hóa rất chi tiết các hành vi tự nhiên của loài ngựa (phân cấp lãnh đạo, bắt chước, phòng thủ, gặm cỏ). Đây là tư liệu quý giá để chúng ta thiết kế các thuật toán mô phỏng trận đấu giả lập hoặc xây dựng chỉ số thông minh (AI profile) cho từng con ngựa trong hệ thống quản lý giải đua, giúp các trận đấu ảo trở nên thực tế và có chiều sâu hơn.
* **Tối ưu hóa hạ tầng ứng dụng Web giải đua ngựa**: Hệ thống quản lý giải đua ngựa là một ứng dụng Web có lượng truy cập đồng thời lớn, xử lý nhiều tác vụ nặng theo thời gian thực (như tính toán tỷ lệ cược, giả lập cuộc đua, kết xuất báo cáo tài chính, xử lý giao dịch đặt cược). Chúng ta có thể ứng dụng tư duy lập lịch HHO-MOTSA này vào tầng Backend hoặc cấu hình cân bằng tải đám mây nhằm tối ưu hóa việc phân phối tài nguyên máy chủ, giảm thiểu thời gian phản hồi trang Web, đồng thời tiết kiệm chi phí thuê hạ tầng đám mây.

# Possible improvement
* Đưa mô hình vào thực nghiệm trên môi trường đám mây lai (Hybrid Cloud) hoặc kiến trúc Multi-tenant thực tế để đo lường chính xác ảnh hưởng của độ trễ mạng và overhead tính toán thực tế .
* Tích hợp thêm các kỹ thuật học máy giải thuật (như mạng nơ-ron hoặc logic mờ) để tự động hóa việc dò tìm và cập nhật bộ trọng số tối ưu cho hàm thích nghi tùy thuộc vào độ ưu tiên của hệ thống tại từng thời điểm .
* Cải tiến cấu trúc thuật toán bằng cách tinh giản bớt các hành vi trùng lặp hoặc áp dụng tính toán song song (Parallel Computing) khi cập nhật vị trí bầy ngựa để tăng tốc độ hội tụ và giảm độ phức tạp thời gian .