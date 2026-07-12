# Baseline

## 1. Mục đích của Baseline

Baseline xác định trạng thái hiện tại của từng thành phần AI trong HorseTrack dựa trên các tính năng thực tế đã có trong repository. Mục tiêu là so sánh giá trị của AI prediction và AI arrangement với cách vận hành thủ công hoặc quy tắc đơn giản.

## 2. Baseline cho Các Thành phần AI

### 2.1. Baseline AI Prediction

**Baseline chính**: Dự đoán xếp hạng do admin/referee soạn tay

- Admin hoặc referee sử dụng kinh nghiệm cùng dữ liệu lịch sử để ước lượng thứ tự xuất sắc của ngựa.
- Họ dựa trên các chỉ số như thành tích trước đây, tốc độ, sức khoẻ, và kỹ năng jockey.
- Đầu ra: bảng xếp hạng dự đoán và nhận xét thô do con người đưa ra.

**Baseline phụ**: Quy tắc tĩnh dựa trên điểm sức mạnh

- Tính điểm sơ bộ từ các chỉ số có sẵn (thành tích, tốc độ, sức khoẻ).
- Xếp hạng các ngựa theo điểm tổng mà không có phần giải thích ngôn ngữ tự nhiên.
- Dùng để phân biệt phần giá trị của AI về mặt ngữ cảnh và reasoning.

**Lý do chọn baseline này**: HorseTrack hiện có tính năng AI prediction; so sánh với dự đoán con người và tính toán quy tắc giúp đánh giá đúng lợi ích của AI.

### 2.2. Baseline AI Arrangement

**Baseline chính**: Phân bổ race thủ công bởi admin

- Admin sắp xếp các ngựa vào race dựa trên đánh giá cá nhân và dữ liệu ban đầu.
- Họ cân nhắc kỹ năng, phong độ và số lượng race để tạo phân bổ.
- Đầu ra: kế hoạch phân bổ race được ghi lại theo kiểu thủ công.

**Baseline phụ**: Phân bổ theo thuật toán đơn giản

- Sắp xếp ngựa theo thứ tự điểm sức mạnh rồi chia lần lượt vào các race.
- Không tối ưu hoá cân bằng giữa các race, chỉ áp dụng quy tắc ``snake draft`` cơ bản.
- Dùng để so sánh mức độ công bằng và logic với đề xuất AI.

**Lý do chọn baseline này**: Vì repository hiện có `AiService.generateArrangement`, nên baseline cần phản ánh cách làm thủ công và cách làm quy tắc đơn giản.

## 3. Bảng So sánh Đánh giá

| Thành phần | HorseTrack AI | Baseline chính | Baseline phụ | Chỉ số |
|---|---|---|---|---|
| Dự đoán race | AI prediction có reasoning từ LLM và strength score | Dự đoán tay bởi admin/referee | Xếp hạng theo điểm sức mạnh trả về | Tính chính xác, mức độ hợp lý, độ tin cậy, thời gian |
| Sắp xếp race | AI arrangement đề xuất phân bổ phân bổ race | Sắp xếp tay bởi admin | Phân bổ theo quy tắc đơn giản | Tính cân bằng, tính thực tiễn, thời gian |

## 4. Lưu ý về So sánh Công bằng

- Cả AI và baseline dùng cùng dữ liệu đầu vào: thông tin race, ngựa, jockey, kết quả lịch sử.
- Người đánh giá không biết đâu là kết quả AI và đâu là baseline.
- Thời gian được đo từ lúc bắt đầu đến khi hoàn thành cho cả phương án AI và phương án baseline.
- Các tiêu chí đánh giá gồm: chất lượng reasoning, tính chính xác, tính thực tiễn và thời gian hoàn thành.
