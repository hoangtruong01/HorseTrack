# Citation
* **Tác giả:** William Benter.
* **Đơn vị công tác:** HK Betting Syndicate, Hong Kong.
* **Tên bài báo:** Computer Based Horse Race Handicapping and Wagering Systems: A Report.
* **Nguồn xuất bản:** Efficiency of Racetrack Betting Markets (Book/Volume, 1994, pp. 183-198), World Scientific.
* **Link:** https://inthemoneypodcast.com/wp-content/uploads/2023/06/1994-benter.pdf

# Problem
* Việc dự đoán kết quả và chiến lược đặt cược tại các giải đua ngựa theo cách thủ công hoặc bằng cảm tính gặp rất nhiều hạn chế do sự cảm tính, thiếu kỷ luật (overbetting, underbetting) và sai sót phân tích của con người khi mệt mỏi.
* Thị trường cá cược đua ngựa (Pari-mutuel wagering) cực kỳ cạnh tranh và bị chiết khấu hoa hồng lớn (nhà cái thường giữ lại từ 15-20% quỹ cược). Để sinh lời, một hệ thống không chỉ cần dự đoán đúng con ngựa nào sẽ về nhất, mà còn phải xác định chính xác tỷ lệ cược thực tế (true odds) so với tỷ lệ cược của đám đông (public odds) để tìm ra "Value Bet" (cược có giá trị kỳ vọng dương).
* Câu hỏi đặt ra là liệu một hệ thống máy tính tự động lấy dữ liệu nền tảng (fundamental factors) có thể đánh bại thị trường cá cược (beat the races) một cách ổn định hay không?

# Method
Benter đã xây dựng một **Hệ thống đánh giá/phân tích tự động hóa (Computerized Handicapping System)** hoàn chỉnh thông qua 3 bước cốt lõi:
* **Mô hình toán học (Handicapping Model):** Sử dụng **Mô hình Multinomial Logit** do Bolton và Chapman đề xuất. Mô hình này rất phù hợp vì nó đánh giá xác suất thắng của mỗi con ngựa dựa trên sự so sánh đồng thời các biến số độc lập của tất cả các con ngựa cùng tham gia trong một cuộc đua (có tổng xác suất luôn bằng 1).
* **Kết hợp dự đoán (Combined Model):** Benter phát hiện ra rằng mô hình dữ liệu lịch sử (Fundamental Model) của ông bị "mù" trước các thông tin diễn ra vào sát giờ thi đấu (như ngựa bị hoảng loạn trong khu vực chuồng, thay chân móng, hoặc sức khỏe suy giảm đột ngột). Ngược lại, đám đông (Public/Crowd) lại có mặt tại sân và nắm được các thông tin thực tế này, được phản ánh qua *Public Odds* (Tỷ lệ cược đám đông). Do đó, tác giả đã sáng tạo ra một kỹ thuật Logit để kết hợp xác suất do máy tính tính ra với xác suất ước lượng từ đám đông (Public's Implied Probability) thành một Xác suất cuối cùng (Combined Probability).
* **Chiến lược phân bổ vốn (Wagering Strategy):** Thay vì đặt cược bằng số tiền cố định, Benter áp dụng **Tiêu chuẩn Kelly (Kelly Criterion)**. Phương pháp này chỉ ra chính xác số phần trăm vốn cần đánh dựa trên sự chênh lệch giữa Xác suất thực (Combined Probability) và Tỷ lệ cược của nhà cái, giúp tối đa hóa tốc độ tăng trưởng vốn theo cấp số nhân trong dài hạn và ngăn chặn rủi ro phá sản.

# Dataset
* Tập dữ liệu cực kỳ đồ sộ với lịch sử chi tiết của hàng nghìn con ngựa thi đấu thực tế được Royal Hong Kong Jockey Club thu thập từ tháng 9 năm 1986 đến tháng 6 năm 1993.
* Quy mô dữ liệu: Hơn 3.100 cuộc đua, với hơn 15.000 lượt ngựa chạy để tiến hành kiểm thử chéo và xác thực sức mạnh dự đoán. Theo Benter, mức tối thiểu tuyệt đối để huấn luyện mô hình dự đoán đua ngựa có ý nghĩa thống kê là từ 500 đến 1.000 cuộc đua đầy đủ.

# Evaluation
* Tác giả đánh giá mô hình không chỉ đơn thuần qua độ chính xác (Accuracy), mà qua một thước đo chuẩn tắc có tên là **Giá trị $R^2$ (McFadden's Pseudo R-Squared)** để đo lường "Sức mạnh giải thích" của hệ thống dự đoán.
* Một chỉ số heuristic quan trọng được Benter giới thiệu là sự gia tăng $R^2$ ($\Delta R^2$). Khi kết hợp mô hình AI của ông vào mô hình đám đông, nếu $\Delta R^2$ tăng lên, điều đó chứng tỏ hệ thống AI đã cung cấp những "thông tin ẩn" sinh lời mà đám đông ngoài sân vận động không nhìn thấy.

# Results
* **Cột mốc lịch sử về lợi nhuận:** Benter là người đầu tiên chứng minh công khai rằng hệ thống cá cược đua ngựa bằng máy tính hoàn toàn có thể sinh lời (beat the market). Ông đã vận hành hệ thống này thực tế tại Hong Kong trong 5 năm và ghi nhận lợi nhuận dương khổng lồ, là bằng chứng đanh thép cho sự kém hiệu quả (inefficiency) của thị trường cá cược đua ngựa pari-mutuel.
* **Bài học về biến số:** Quá trình huấn luyện cũng cho thấy mô hình tính toán "số lượng cuộc đua trong quá khứ" là một biến cực kỳ quan trọng, ngay cả khi con người không hiểu lý do "common sense" đằng sau nó.

# Limitations
* **Công sức tiền xử lý khổng lồ:** Việc làm sạch, đối chiếu và nhập liệu cho hàng nghìn cuộc đua là một quá trình vô cùng tốn thời gian (ở thời điểm năm 1994 là nhập tay hoặc dùng máy quét quang học OMR).
* **Quá khớp (Overfitting):** Việc thử và sai (trial and error) để nhồi nhét quá nhiều biến số có tính tương quan chéo cao vào mô hình thường dẫn đến hiện tượng quá khớp (mô hình dự đoán tốt trên dữ liệu quá khứ nhưng thất bại trong tương lai thực tế).
* **Nghịch lý Public Bias:** Mô hình dữ liệu lịch sử thường xuyên đánh giá quá cao (overestimate) những con ngựa mà đám đông đang "tẩy chay", và đánh giá quá thấp (underestimate) những con ngựa đám đông đang cực kỳ ưu ái.

# Relevance to our topic
* Tài liệu này là **"Kinh thánh"** đối với phân hệ **Dự đoán kết quả (Spectator/Admin)** trong hệ thống của bạn. Benter đặt nền móng kiến trúc thực tiễn cho một module dự đoán: Nó không chỉ được dùng để "đoán mò cho vui" mà là một hệ thống tính toán xác suất (True Odds) thực sự. 
* Kiến trúc kết hợp của Benter gợi ý một tính năng đắt giá cho hệ thống của bạn: Khi khán giả dự đoán kết quả trận đấu trên Web, hệ thống không chỉ hiển thị Tỷ lệ cược từ chuyên gia/Admin mà còn tổng hợp Tỷ lệ cược chung từ toàn bộ Spectator (Public Odds), sau đó lai ghép với AI Model để cho ra bảng dự đoán phong độ "AI + Crowd" (Mô hình kết hợp Trí tuệ nhân tạo và Trí tuệ đám đông) một cách chính xác tuyệt đối.

# Possible improvement
* **Nâng cấp mô hình Logistic bằng Học Sâu (Deep Learning):** Mô hình Multinomial Logit của Benter ở năm 1994 là bản lề, nhưng ngày nay nhóm bạn hoàn toàn có thể thay thế nó bằng Random Forest, LightGBM, hoặc XGBoost có khả năng xử lý phi tuyến tốt hơn gấp nhiều lần.
* **Thu thập "Thông tin sát giờ" tự động hóa:** Hạn chế lớn nhất của mô hình gốc là không biết được tình trạng "ngựa hoảng loạn tại chuồng trước khi đua". Nhóm bạn có thể xây dựng tính năng cho Trọng tài (Race Referee) cập nhật "Tình trạng sức khỏe ngựa tức thời" trước trận đấu trên ứng dụng Di động; dữ liệu này ngay lập tức được gửi vào API đẩy về mô hình AI để cập nhật Tỷ lệ cược mới nhất (Live Odds) trên Web cho khán giả.
* **Tích hợp Ví điện tử & Thuật toán Kelly:** Đối với tính năng "Dự đoán có thưởng" của Spectator, hệ thống của bạn có thể áp dụng thuật toán Kelly để đóng vai trò như một Trợ lý tài chính (Financial Bot): Gợi ý trực tiếp cho người dùng "Nên đặt cược bao nhiêu % số xu trong tài khoản vào con ngựa này để rủi ro bằng không mà lợi nhuận là lớn nhất".
