# Paper 01 Summary
## Citation
**Tên bài:**
[cite_start]Smart Tournament Scheduling Using a POX-Heuristic Genetic Algorithm [cite: 285]
**Tác giả:**
[cite_start]Mu-Chun Su [cite: 286][cite_start], Jieh-Haur Chen [cite: 289][cite_start], Achmad Muhyidin Arifai [cite: 292][cite_start], Che-Hsuan Chang [cite: 296][cite_start], Hsi-Hsien Wei [cite: 299]
**Năm:**
[cite_start]2025 [cite: 281]
**Nguồn:**
[cite_start]International Journal of Information Technology & Decision Making (Vol. 24, No. 6, pp. 1613-1629) [cite: 281]
**DOI/Link:**
[cite_start]https://doi.org/10.1142/S0219622025500221 [cite: 283]
---
## Problem
Bài báo giải quyết vấn đề gì?
[cite_start]Việc sắp xếp lịch thi đấu cho các giải đấu thể thao chuyên nghiệp lẫn phong trào (Tournament Scheduling) là một bài toán tối ưu hóa tổ hợp cực kỳ phức tạp với nhiều ràng buộc chồng chéo[cite: 318, 321]. Quy trình xếp lịch thủ công đối mặt với các thách thức lớn:
* [cite_start]**Tính công bằng và sức khỏe:** Phải đảm bảo mỗi đối thủ đều có cơ hội thi đấu công bằng, đồng thời ngăn chặn việc xếp các trận đấu liên tiếp (back-to-back) khiến người tham gia không có đủ thời gian nghỉ ngơi, dễ gây kiệt sức[cite: 318, 319, 320].
* [cite_start]**Sự bùng nổ quy mô:** Khi số lượng trận đấu và số lượng địa điểm (sân đấu) tăng lên, độ phức tạp của lịch trình tăng theo cấp số nhân, khiến việc xếp lịch thủ công tốn quá nhiều thời gian và nhân lực[cite: 321, 322, 323].
* [cite_start]**Hạn chế của thuật toán GA truyền thống:** Các toán tử di truyền truyền thống dựa trên chuỗi nhị phân không thể áp dụng trực tiếp do cấu trúc mã hóa đặc thù của lịch trình thi đấu[cite: 325, 326]. [cite_start]Điều này dễ tạo ra các nhiễm sắc thể chứa "gene lỗi/gene chất lượng kém", làm giảm hiệu suất tối ưu[cite: 315, 326].
Ngoài ra, các ứng dụng lập lịch trực tuyến hiện nay (như phần mềm LeagueLobster) bộc lộ nhiều điểm yếu:
* [cite_start]Chỉ hỗ trợ tốt các hệ thống giải đấu vòng tròn đơn giản hoặc phân bổ dựa trên số lượng người nhập vào[cite: 572, 576].
* [cite_start]Không tự động tối ưu hóa thời gian hồi sức, dễ ép người chơi thi đấu nhiều hơn 2 trận liên tục[cite: 585].
* [cite_start]Bị nghẽn hệ thống hoặc không thể xếp lịch khi số lượng đội đăng ký vượt quá giới hạn cấu hình, hoặc khi giải đấu trải rộng trên nhiều địa điểm, nhiều sân[cite: 582, 583].
[cite_start]Bài báo đề xuất giải quyết triệt để các vấn đề trên thông qua việc tích hợp thuật toán di truyền nâng cao (GA) kết hợp toán tử lai ghép bảo toàn thứ tự tiên quyết (POX) và kỹ thuật đột biến Heuristic để tối ưu lịch trình giải đấu đa quy mô[cite: 310, 330].
---
## Method
Bài báo dùng phương pháp/model/hệ thống nào?
Tác giả đề xuất framework tối ưu hóa thông minh:
# POX-Heuristic GA
(POX-Heuristic Genetic Algorithm) [cite_start][cite: 313, 330]
Framework hoạt động dựa trên quy trình tích hợp khép kín:
1. [cite_start]Xác định hệ thống ràng buộc giải đấu (Hard & Soft Constraints)[cite: 361].
2. [cite_start]Mã hóa Nhiễm sắc thể kép: Chuỗi lịch trình và Địa điểm[cite: 328, 422].
3. [cite_start]Khởi tạo quần thể và áp dụng lựa chọn cạnh tranh cải tiến kiểu roulette[cite: 339, 449, 596].
4. [cite_start]Tiến hành lai ghép POX và đột biến Heuristic (M3)[cite: 312, 457, 544].
5. [cite_start]Tối ưu hóa hàm mục tiêu nhằm giảm thiểu chỉ số trì hoãn tổng thể[cite: 381, 407].
6. [cite_start]Xuất lịch thi đấu thực tế tối ưu hoàn chỉnh[cite: 430, 595].
### 1. Hệ thống Ràng buộc (Constraints)
* [cite_start]**Ràng buộc cứng (Hard constraints):** Không xếp trùng trận tại cùng một sân trong một khung giờ (H1)[cite: 365]; [cite_start]Số trận một khung giờ không vượt quá số sân sẵn có (H2)[cite: 366]; [cite_start]Trận đấu phải nằm trong khung giờ quy định (H3)[cite: 367]; [cite_start]Mỗi trận chỉ xuất hiện đúng 1 lần (H4)[cite: 368]; [cite_start]Vòng sau chỉ đấu khi vòng trước đã kết thúc hoàn toàn (H5, H6)[cite: 369, 370].
* [cite_start]**Ràng buộc mềm (Soft constraints):** Thí sinh không đấu 2 trận cùng lúc (S1)[cite: 372]; [cite_start]Phải có đủ thời gian nghỉ giữa các trận (S2)[cite: 374]; [cite_start]Các trận cùng một vòng nên xếp cùng nhau (S3)[cite: 375]; [cite_start]Hạn chế việc một thí sinh phải di chuyển qua lại giữa nhiều sân khác nhau (S4)[cite: 376].
### 2. Cấu trúc Mã hóa Nhiễm sắc thể kép
* [cite_start]**Nhiễm sắc thể Chuỗi lịch trình (Schedule Sequence Chromosome):** Biểu diễn thứ tự sắp xếp và tổ chức của các trận đấu trong giải[cite: 328, 423].
* [cite_start]**Nhiễm sắc thể Địa điểm (Schedule Venue Chromosome):** Xác định việc phân bổ sân đấu/địa điểm cụ thể cho từng trận[cite: 328, 439].
### 3. Toán tử Di truyền cải tiến
* [cite_start]**Lai ghép POX (Precedence Preserving Order-based Crossover):** Tiến hành hoán đổi các gene vị trí trận đấu giữa hai nhiễm sắc thể cha mẹ nhưng vẫn bảo toàn nghiêm ngặt thứ tự ưu tiên của các vòng đấu, tránh tạo ra lịch thi đấu bất hợp lệ[cite: 452, 457, 597].
* [cite_start]**Đột biến Heuristic (M3 Mutation):** Phân tích và cô lập các gene có hiệu suất kém gây trễ lịch, sau đó dịch chuyển ngẫu nhiên vị trí của gene đó tiến hoặc lùi từ 1 đến 5 đơn vị thời gian để giải phóng xung đột lịch nghỉ[cite: 472, 478, 544].
* [cite_start]**Hàm mục tiêu (Objective Function):** Tập trung tối thiểu hóa giá trị DelayNum = One Round Delay + Two Round Delay (Tổng số trận bị hoãn do trùng lịch hoặc do đấu thủ phải đấu liên tiếp không kịp hồi sức)[cite: 381, 407].
---
## Dataset
Bài báo dùng dữ liệu gì?
[cite_start]Nghiên cứu tiến hành thu thập và kiểm nghiệm thuật toán trên tập dữ liệu thực tế từ **10 giải đấu cầu lông lớn nhỏ khác nhau** được công bố chính thức trên Internet (như giải iTaiwan Project Office Cup, Tissot Cup National Badminton, Wu Memorial Cup...)[cite: 313, 489, 492].
Dữ liệu bao gồm các quy mô từ siêu nhỏ đến quy mô lớn phức tạp:
* [cite_start]**Số lượng ngày thi đấu:** Trải dài từ giải ngắn ngày (1 ngày) đến các giải dài ngày (4 ngày)[cite: 492].
* [cite_start]**Số lượng sân đấu (Courts/Venues):** Điều phối từ 1 sân cố định cho đến cụm 3 sân hoạt động song song[cite: 492].
* [cite_start]**Số lượng trận đấu (Matches):** Quy mô từ 3 trận (giải nhỏ) cho tới **172 trận và 184 trận** (các giải đấu quốc gia quy mô lớn)[cite: 492].
* [cite_start]**Thể thức thi đấu đa dạng:** Bao gồm đấu loại trực tiếp (Single Elimination), đấu vòng tròn (Round Robin) và thể thức hỗn hợp (Mixed Competition - đá vòng tròn chia bảng rồi lấy đội vào đấu loại)[cite: 492].
---
## Evaluation
Bài báo đánh giá bằng metric nào?
### 1. Chỉ số Trì hoãn Tổng thể (Delay Minutes / Delay Num)
[cite_start]Tính toán tổng số phút hoặc số trận bị hoãn/chậm trễ do hệ thống không phân bổ đủ thời gian nghỉ ngơi tiêu chuẩn cho các vận động viên giữa các lượt đấu[cite: 381, 497, 500].
### 2. Thời gian Biên soạn Lịch trình (Arrangement Time)
[cite_start]Đo lường tốc độ xử lý và lập lịch từ lúc đóng cổng đăng ký dữ liệu cho đến khi xuất bản thành công một lịch trình thi đấu hoàn chỉnh không lỗi[cite: 562, 563, 564].
### 3. Hiệu suất Đối sánh Phần mềm (Software Comparison)
[cite_start]So sánh trực tiếp kết quả tối ưu của thuật toán với lịch trình xếp tay thực tế của ban tổ chức giải đấu (Actual Tournament) và lịch trình do phần mềm trực tuyến chuyên dụng LeagueLobster tạo ra[cite: 314, 527, 571, 576].
---
## Results
Kết quả chính là gì?
### 1. Tăng hiệu suất tối ưu vượt trội
[cite_start]Mô hình POX-Heuristic GA mang lại hiệu quả vượt trội so với lịch thực tế và phần mềm thương mại, với **mức cải tiến hiệu suất dao động từ 10.87% đến 335.03%**[cite: 314, 593, 602].
### 2. Cắt giảm thời gian xử lý từ "Ngày" xuống "Phút"
* [cite_start]**Lập lịch thủ công (Xếp tay):** Tiêu tốn của ban tổ chức từ **2 ngày cho đến 20 ngày** làm việc liên tục để rà soát xung đột đối với các giải đấu lớn từ 172 - 184 trận[cite: 579].
* [cite_start]**Thuật toán đề xuất:** Xử lý và xuất lịch trình tối ưu hoàn toàn tự động chỉ trong vòng **vài phút** (Ví dụ: Giải Wu Memorial Cup 184 trận chỉ mất khoảng 15 phút (927.2 phút xử lý máy tính so với 20 ngày xếp tay))[cite: 579, 580].
### 3. Giải quyết triệt để bài toán đa địa điểm
[cite_start]Khác với LeagueLobster bị giới hạn số đội và không thể xếp lịch phân bổ qua lại giữa nhiều sân, thuật toán của bài báo phân bổ mượt mà các trận đấu trên cụm nhiều sân mà vẫn đảm bảo 100% người chơi có đủ thời gian hồi sức, loại bỏ các "gene xấu" gây chậm trễ giải đấu[cite: 315, 582, 583].
---
## Limitations
Hạn chế của bài báo là gì?
### 1. Giới hạn về thể thức thi đấu hỗ trợ
[cite_start]Thuật toán hiện tại mới chỉ được thiết kế cấu hình bám sát **3 hệ thống thi đấu phổ biến** bao gồm loại trực tiếp, vòng tròn, và hỗn hợp vòng tròn - loại trực tiếp[cite: 604]. [cite_start]Hệ thống chưa được mở rộng để tự động nhận diện các thể thức tính điểm phức tạp khác[cite: 605].
### 2. Chưa tối ưu cho các bộ môn đua đường trường (Race Scheduling)
[cite_start]Cơ chế xếp lịch của bài báo dựa trên các mốc thời gian cố định tại các ô sân (Court/Venue slots)[cite: 434, 437]. [cite_start]Nó chưa tích hợp các thuật toán xếp lịch dạng chặng đua, lượt đua liên tục (Race scheduling) vốn đòi hỏi tính toán khoảng cách vật lý và thời gian phục hồi chuyên sâu của động vật hoặc phương tiện di chuyển[cite: 606].
---
## Relevance to our topic
Mức độ liên quan: **Cực kỳ cao (Core Algorithmic Backbone)**
Đề tài: **HorseTrack – Hệ thống quản lý và điều hành đường đua ngựa**
Bài báo này cung cấp nền tảng toán học và tư duy thuật toán cốt lõi để xây dựng phân hệ **Lập lịch cuộc đua tự động (Race Scheduling Sub-system)** trong dự án HorseTrack của nhóm:
### 1. Mô hình hóa Nhiễm sắc thể cho Hệ thống Đua Ngựa
* [cite_start]**Schedule Sequence Chromosome:** Ứng dụng để sắp xếp thứ tự các chặng đua (Races) trong một ngày hoặc một giải đấu lớn (Tournament)[cite: 328, 423].
* [cite_start]**Schedule Venue Chromosome:** Ứng dụng để phân bổ các đường đua công khai, các làn đua (Tracks/Venues) phù hợp cho từng chặng, tránh xung đột khung giờ thi đấu[cite: 328, 439].
### 2. Giải quyết bài toán bảo vệ sức khỏe Chiến mã và Nài ngựa (Jockey)
* [cite_start]Định nghĩa về `Two Round Delay` trong bài báo cực kỳ khớp với bài toán của HorseTrack: Đám bảo một con ngựa (Horse) hoặc một Nài ngựa (Jockey) sau khi kết thúc một chặng đua căng thẳng sẽ **bắt buộc phải có đủ khung giờ nghỉ ngơi/hồi sức tiêu chuẩn**[cite: 319, 374, 380]. [cite_start]Thuật toán di truyền này sẽ tự động đẩy chặng đua tiếp theo của họ xuống khung giờ an toàn, ngăn chặn tình trạng kiệt sức hoặc chấn thương trên đường đua[cite: 319, 320, 435].
---
## Possible improvement
Nhóm có thể cải tiến hoặc mở rộng điểm nào trong dự án HorseTrack?
### 1. Mở rộng Thuật toán sang "Race Scheduling" đặc thù
[cite_start]Phát triển tiếp từ gợi ý tương lai của bài báo, nhóm sẽ hiệu chỉnh toán tử Đột biến Heuristic để kiểm soát các biến số đặc thù của trường đua ngựa như: Trạng thái mặt sân (bùn, cát, cỏ), khoảng cách chặng đua (1000m, 1600m) và hạng cân của ngựa để tự động tính toán thời gian nghỉ động (Dynamic Rest Time) thay vì cố định thời gian[cite: 606].
### 2. Tích hợp trực tiếp vào Backend NestJS + MongoDB
Xây dựng một Worker Service chạy ngầm bằng TypeScript trong Backend NestJS. Khi Admin nhấn nút "Tự động lập lịch giải đấu", hệ thống sẽ truy xuất toàn bộ danh sách Ngựa và Nài ngựa đã đăng ký từ MongoDB, chạy thuật toán `POX-Heuristic GA` để xuất ra một Timeline trận đua tối ưu không lỗi chỉ trong vài giây.
### 3. Đẩy lịch thời gian thực qua WebSockets
Kết hợp kết quả đầu ra của lịch trình tối ưu này để kích hoạt hệ thống thông báo tự động (Notification Flows). Ngay khi lịch được thuật toán phê duyệt thành công, hệ thống sẽ lập tức gửi dữ liệu thời gian thực qua WebSockets tới màn hình Dashboard của chủ ngựa (Owner), nài ngựa (Jockey) và khán giả để họ nắm bắt chính xác giờ ra sân.
