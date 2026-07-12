# Baseline

## 1. Mục đích của Baseline

Baseline xác định trạng thái hiện tại của từng thành phần AI trước khi tích hợp vào HorseTrack. Mục đích là so sánh giá trị cải tiến do AI mang lại với cách làm thủ công hoặc kịch bản tối thiểu mà người dùng/người quản lý hiện nay đang dùng.

## 2. Baseline cho Từng Thành phần AI

### 2.1. Baseline AI Prediction

**Baseline chính**: Dự đoán do admin hoặc referee kỳ cựu soạn tay

- Người quản lý race hoặc referee có kinh nghiệm phân tích dữ liệu ngựa, jockey và lịch thi.
- Họ cân nhắc tay đôi, phong độ, trạng thái track và quyết định thứ tự dự đoán.
- Thời gian đo từ lúc nhận đủ dữ liệu đến khi hoàn thành báo cáo dự đoán.
- Đầu ra: nhận xét/tóm tắt dự đoán do con người soạn.

**Baseline phụ**: Quy tắc tĩnh dựa trên chỉ số cơ bản

- Dùng một công thức đơn giản: tổng điểm sức mạnh = tốc độ + stamina + kinh nghiệm.
- Các ngựa được xếp theo thứ tự tổng điểm này.
- Không có nhận xét ngữ nghĩa, chỉ có bảng xếp hạng dự đoán.
- Dùng để phân biệt cải tiến của AI về mặt nội dung, không chỉ xếp hạng.

**Lý do chọn baseline này**: Đây là hai cách tiếp cận thực tế nhất cho HorseTrack: dự đoán bằng chuyên gia và dự đoán dựa trên quy tắc tĩnh.

### 2.2. Baseline AI Arrangement Reasoning

**Baseline chính**: Sắp xếp race bằng tay bởi admin/race organizer

- Admin dựa trên kinh nghiệm và số liệu ban đầu để phân bổ ngựa vào từng race.
- Họ cân bằng lực lượng bằng cách so sánh điểm sức mạnh và danh sách jockey.
- Thời gian đo từ khi nhận dữ liệu tới khi hoàn thành đề xuất phân bổ.
- Đầu ra: kế hoạch phân bổ race do con người thiết kế.

**Baseline phụ**: Phân bổ theo mẫu cố định

- Chia ngựa theo thứ tự đăng ký hoặc theo thứ tự điểm sức mạnh.
- Không tối ưu công bằng giữa các race, chỉ áp dụng quy tắc đơn giản.
- Dùng để so sánh với AI về mức độ cân bằng và tính hợp lý.

**Lý do chọn baseline này**: Phân bổ bằng tay phản ánh thực tế vận hành hiện tại, còn phân bổ theo mẫu cố định là trường hợp đơn giản nhất.

### 2.3. Baseline Timeline / Notification

**Baseline chính**: Quản lý lịch và thông báo thủ công

- Staff sử dụng Google Calendar, nhắc lịch hoặc ghi chú để theo dõi mốc race, hạn đăng ký, và kết quả.
- Người quản lý tự gửi thông báo hoặc kích hoạt trạng thái race.
- Các hành động như mở đăng ký, cập nhật trạng thái race, gửi thông báo được làm thủ công.

**Baseline phụ**: Nhắc nhở tự động từ công cụ lịch nhưng không có logic nghiệp vụ

- Dùng email/calendar reminders để thông báo thời điểm.
- Không có kiểm tra trạng thái thực tế trong hệ thống.
- Hành động vẫn cần được nhân viên xác nhận và thực thi.

**Lý do chọn baseline này**: Đây là cách vận hành phổ biến của các tổ chức sự kiện thể thao chưa có hệ thống tự động.

## 3. Bảng So sánh Đánh giá

| Thành phần | HorseTrack AI | Baseline chính | Baseline phụ | Chỉ số |
|---|---|---|---|---|
| Dự đoán race | AI sinh nhận xét + xếp hạng dựa trên Google GenAI | Referee/admin soạn tay | Quy tắc tĩnh trên điểm sức mạnh | Chất lượng nội dung, thời gian thực hiện, tính khác biệt |
| Sắp xếp race | AI đánh giá và sinh lời giải phân bổ | Admin soạn đề xuất thủ công | Chia theo mẫu cố định | Tính công bằng, tính hợp lý, thời gian |
| Thông báo / timeline | Hệ thống backend tự động kích hoạt khi đến mốc | Theo dõi và thực hiện thủ công | Nhắc lịch đơn giản | Độ chính xác, sai lệch thời gian, tỷ lệ bỏ sót |

## 4. Lưu ý về So sánh Công bằng

- Các baseline và hệ thống AI nhận cùng dữ liệu đầu vào: thông tin ngựa, jockey, race và trạng thái hiện tại.
- Người soạn baseline không xem đầu ra AI trước khi hoàn thành bài của họ.
- Đánh giá nên thực hiện theo phương pháp mù: người đánh giá không biết nguồn nào là AI, nguồn nào là con người.
- Thời gian được đo đồng hồ thực tế từ khi bắt đầu đến lúc hoàn thành cho cả AI và baseline.
- Các chỉ số đo lường gồm: chất lượng nội dung/kế hoạch, độ chính xác công việc, thời gian hoàn thành và tính ổn định.
