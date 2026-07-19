# Kế hoạch Đánh giá

## 1. Mục tiêu Đánh giá

1. Đo chất lượng đề xuất AI prediction so với phương pháp thủ công.
2. Đo chất lượng đề xuất AI arrangement so với phân bổ race thủ công.
3. Đánh giá hiệu quả thời gian khi sử dụng AI prediction và AI arrangement.
4. Đánh giá trải nghiệm người dùng khi truy cập những tính năng AI mới trong HorseTrack.

## 2. Tóm tắt Dữ liệu

- 30 race có dữ liệu đủ để đánh giá prediction.
- 20 tournament để đánh giá đề xuất arrangement.
- Trường hợp baseline gồm dự đoán thủ công và phân bổ race thủ công/quy tắc đơn giản.
- ≥ 20 người tham gia trải nghiệm người dùng SUS.

## 3. Baseline

Xem [baseline.md](baseline.md) để biết chi tiết các đối tượng baseline.

## 4. Chỉ số Đánh giá

### 4.1. Chỉ số Chất lượng AI Prediction (RQ1)

| Chỉ số | Thang đo | Mô tả | Lý do sử dụng |
|---|---|---|---|
| Độ chính xác xếp hạng | % | Tỷ lệ dự đoán thứ tự ngựa trùng với kết quả thực tế | Đo trực tiếp giá trị dự báo |
| Độ chính xác xác suất | RMSE | Sai số giữa xác suất dự đoán và kết quả thực tế | Đánh giá chất lượng phân phối win probability |
| Mức độ hợp lý | Likert 1–5 | Cập nhật reasoning có giải thích hợp lý và dễ hiểu không? | Quyết định độ tin tưởng vào đề xuất AI |
| Tính tin cậy | Likert 1–5 | AI prediction có rõ ràng và đáng tin cậy để dùng không? | Đo mức độ ứng dụng thực tế |
| Thời gian tạo đề xuất | Giây | Thời gian backend sinh prediction | Đo hiệu quả kỹ thuật |

### 4.2. Chỉ số Chất lượng AI Arrangement (RQ2)

| Chỉ số | Thang đo | Mô tả | Lý do sử dụng |
|---|---|---|---|
| Tính cân bằng | Likert 1–5 | Đề xuất sắp xếp race có cân bằng lực lượng giữa các race không? | Đo chất lượng bản đồ phân bổ |
| Tính thực tiễn | Likert 1–5 | Đề xuất có thể triển khai được trên thực tế không? | Đo mức độ hữu dụng của đề xuất |
| Tính rõ ràng | Likert 1–5 | Giải thích lý do phân bổ có rõ ràng và phù hợp không? | AI cần giải thích để được tin dùng |
| Thời gian tạo đề xuất | Giây | Thời gian backend sinh arrangement suggestion | Đo hiệu quả kỹ thuật |

### 4.3. Chỉ số Hiệu quả Hệ thống (RQ3)

| Chỉ số | Đo lường cho | Phương pháp |
|---|---|---|
| Thời gian tiết kiệm prediction | Admin/Referee | So sánh thời gian tạo dự đoán thủ công với thời gian AI |
| Thời gian tiết kiệm arrangement | Admin | So sánh thời gian sắp xếp race thủ công với thời gian AI |
| Giảm thời gian (%) | Admin/Referee | (Thời gian thủ công − thời gian AI) / thời gian thủ công × 100 |

### 4.4. Khả năng sử dụng Hệ thống (SUS)

| Vai trò | Cách tiến hành SUS | Số người tối thiểu |
|---|---|---|
| Quản trị viên | Tạo tournament, xem đề xuất AI arrangement, và đánh giá | 10 |
| Spectator | Xem đề xuất prediction và phản hồi tính hữu ích | 5 |
| Referee/Horse Owner | Xem prediction và đánh giá tính tin cậy | 5 |

Giải thích điểm SUS:
- < 51 = không chấp nhận được
- 51–67 = biên
- 68 = trung bình
- > 80 = xuất sắc

## 5. Quy trình Đánh giá

### Bước 1 — Chuẩn bị dữ liệu

- Chuẩn bị 30 race có dữ liệu kết quả thực tế để đánh giá prediction.
- Chuẩn bị 20 tournament để đánh giá arrangement suggestion.
- Xác định baseline dự đoán thủ công và sắp xếp race thủ công/quy tắc đơn giản.

### Bước 2 — Đánh giá mù chuyên gia

- Tuyển 3–5 chuyên gia FPT hoặc người quản lý giải đấu.
- Cung cấp rubric đánh giá cho prediction và arrangement.
- Chuyên gia đánh giá kết quả mà không biết đó là AI hay baseline.
- Mỗi mục được đánh giá bởi ít nhất 2 người để kiểm tra độ nhất quán.

### Bước 3 — Đo độ chính xác prediction

- So sánh xếp hạng dự đoán với kết quả race thực tế.
- Tính RMSE và phần trăm trùng khớp xếp hạng.
- So sánh với baseline tay và baseline quy tắc.

### Bước 4 — Đo chất lượng arrangement

- Cung cấp đề xuất sắp xếp AI và phân bổ baseline cho chuyên gia.
- Đánh giá cân bằng, thực tiễn và rõ ràng.
- So sánh mức độ ưu tiên giữa AI và baseline.

### Bước 5 — Đo hiệu quả thời gian

- 5 admin thực hiện nhiệm vụ sắp xếp race với và không có AI.
- 5 referee/admin thực hiện đánh giá prediction với và không có AI.
- Ghi lại thời gian thực tế cho mỗi trường hợp.

### Bước 6 — Khảo sát SUS

- Ít nhất 20 người tham gia hoàn thành tác vụ theo vai trò.
- Phát bảng khảo sát SUS sau khi hoàn thành.
- Ghi lại nhận xét về tính dễ dùng và mức độ hữu ích của AI.

### Bước 7 — Phân tích dữ liệu

- Tính trung bình và độ lệch chuẩn cho mỗi chỉ số.
- So sánh AI với baseline bằng kiểm định phù hợp (t-test hoặc Mann–Whitney U).
- Tính kích thước hiệu ứng bằng Cohen's d nếu có thể.
- Kiểm tra độ nhất quán giữa người đánh giá (Fleiss' kappa).

## 6. Kết quả Dự kiến

| Chỉ số | Kết quả dự kiến | Cơ sở |
|---|---|---|
| Độ chính xác xếp hạng prediction | ≥ 65% | AI giúp cải thiện so với dự đoán tay thông thường |
| Mức độ hợp lý prediction | ≥ 3,5/5 | AI cần giải thích rõ ràng và đáng tin cậy |
| Tính cân bằng arrangement | ≥ 3,5/5 | Dựa trên các tiêu chí phân bổ fair |
| Tiết kiệm thời gian prediction | ≥ 30% | AI tự động hoá phân tích lịch sử |
| Tiết kiệm thời gian arrangement | ≥ 40% | AI giảm thời gian so sánh và lựa chọn phân bổ |
| SUS tổng thể | ≥ 68 | Mục tiêu trải nghiệm người dùng trên trung bình |
