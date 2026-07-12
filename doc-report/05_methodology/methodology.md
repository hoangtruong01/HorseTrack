# Phương pháp Nghiên cứu

## 1. Hướng tiếp cận Nghiên cứu

Nghiên cứu áp dụng phương pháp **Design Science Research** kết hợp với **đánh giá thực nghiệm**. Mục tiêu là phát triển một hệ thống HorseTrack tích hợp AI để hỗ trợ dự đoán kết quả race và sắp xếp phân bổ race, rồi đánh giá hiệu quả thực tế của các tính năng này so với quá trình thao tác thủ công.

Phương pháp này không xây dựng mô hình ngôn ngữ mới, mà tập trung vào việc tích hợp và đánh giá AI prediction và AI arrangement dựa trên công nghệ hiện có trong repository.

## 2. Phương pháp Phát triển Hệ thống

### 2.1. Hướng tiếp cận Phát triển

- **Phát triển agile**: chia công việc theo sprint 2 tuần.
- **Phát triển theo module**: xây dựng, kiểm thử và hoàn thiện từng thành phần riêng biệt trước khi tích hợp.
- **Tích hợp lặp**: kiểm thử AI prediction, arrangement và UI riêng biệt, sau đó kết hợp chung với backend, frontend và mobile.
- **Đánh giá giá trị bằng dữ liệu thực tế**: so sánh đầu ra AI với baseline thủ công trên dữ liệu race/horse/jockey và kết quả lịch sử.

### 2.2. Công nghệ Sử dụng

| Tầng | Công nghệ |
|---|---|
| Frontend web | Next.js 16, React 19, Tailwind CSS |
| Frontend mobile | Expo React Native |
| Backend | NestJS 11, TypeScript |
| Database | MongoDB với Mongoose |
| AI | Google GenAI (`@google/genai`) |
| Xác thực | JWT, Passport |
| Thời gian thực | Socket.io |
| Bảo mật | Helmet, Throttler |
| Kiểm thử | Jest, Supertest, e2e tests |

## 3. Phát triển Các Thành phần AI

### 3.1. AI Prediction

**Mục tiêu**: tạo đề xuất xếp hạng ngựa và lý giải quyết định dựa trên dữ liệu race, horse, jockey và lịch sử thi đấu.

**Dữ liệu đầu vào**:
- Thông tin race, danh sách ngựa và jockey.
- Chỉ số lịch sử và trạng thái hiện tại của từng ngựa.
- Tiêu chí đánh giá, ví dụ: strength score, fairness.

**Luồng phát triển**:
- Thiết kế endpoint backend `POST /api/ai/prediction`.
- Thực thi logic trong `be/src/ai/ai.service.ts` và `be/src/ai/services/prediction-engine.service.ts`.
- Gọi Google GenAI để sinh reasoning kèm phân tích và xếp hạng.
- Xác thực đầu ra để đảm bảo có các trường bắt buộc như `ranking`, `reasoning`, `strengthScore`.
- Hiển thị kết quả trên giao diện web và mobile.

**Tối ưu hoá**:
- Dùng template prompt cố định nhằm giữ đầu ra nhất quán.
- Kiểm tra dữ liệu đầu vào và xử lý trường hợp thiếu thông tin.
- Giới hạn số lượng token và chuẩn hoá output trước khi trả về.

### 3.2. AI Arrangement

**Mục tiêu**: đề xuất phân bổ ngựa vào các race sao cho cân bằng và khả thi.

**Dữ liệu đầu vào**:
- Danh sách các race và số lượng slot.
- Danh sách ngựa, jockey, và điều kiện track.
- Các tiêu chí cân bằng lực lượng giữa các race.

**Luồng phát triển**:
- Thiết kế endpoint backend `POST /api/ai/arrangement`.
- Xử lý logic trong `be/src/ai/ai.service.ts` và các service liên quan.
- Kết hợp LLM với các đặc tả phân bổ để sinh đề xuất arrangement.
- Xác thực để đảm bảo mỗi ngựa chỉ xuất hiện một lần và phân bổ đầy đủ.
- Cho phép admin xem, duyệt và điều chỉnh đề xuất.

**Tối ưu hoá**:
- Tiền xử lý: tính điểm tạm thời cho từng ngựa để hỗ trợ reasoning.
- Hậu xử lý: kiểm tra trùng lặp, loại bỏ ngựa thiếu và sửa lỗi format.
- Giới hạn chiều dài giải thích để phù hợp giao diện hiển thị.

### 3.3. Tích hợp với hệ thống hiện tại

- Backend NestJS quản lý API AI và xác thực JWT.
- Frontend web `fe/` hiển thị đề xuất prediction và arrangement cho admin và referee.
- Mobile `mobi/` kết nối cùng API để người dùng trên điện thoại xem kết quả.
- Hệ thống sử dụng MongoDB để lưu dữ liệu race, horse, jockey và log AI khi cần.

## 4. Phương pháp Đánh giá

### 4.1. Phạm vi đánh giá

- Kiểm tra chất lượng output AI prediction so với dự đoán thủ công.
- Kiểm tra chất lượng output AI arrangement so với phân bổ race thủ công và quy tắc đơn giản.
- Đánh giá hiệu quả thời gian khi dùng AI thay cho công đoạn thủ công.
- Đánh giá tính khả thi và trải nghiệm người dùng khi tương tác với AI trên web và mobile.

### 4.2. Công cụ đánh giá và dữ liệu tham chiếu

- Dùng dữ liệu hiện có từ HorseTrack gồm race, horse, jockey, kết quả thi.
- Dùng baseline thủ công và quy tắc tĩnh làm tham chiếu.
- Dùng rubric định tính cho reasoning và phân bổ, đồng thời dùng điểm Likert cho đánh giá người dùng.
- Dùng SUS để đo trải nghiệm tổng thể.

### 4.3. Tài liệu hỗ trợ

- [baseline.md](baseline.md) — mô tả baseline phù hợp với HorseTrack.
- [evaluation_metrics.md](evaluation_metrics.md) — chỉ số và quy trình đánh giá.
- [dataset.md](dataset.md) — nguồn và kích thước dữ liệu.

## 5. Đặc điểm Triển khai và Kiểm thử

- Triển khai module AI trên backend NestJS và gọi từ frontend web/mobile.
- Kiểm thử chức năng bằng unit test, integration test và e2e test.
- Kiểm thử bảo mật API bằng JWT, rate limiting và kiểm tra xác thực.
- Giám sát log backend để phát hiện lỗi đầu ra AI và xử lý dữ liệu không hợp lệ.

## 6. Kết luận Phương pháp

Phương pháp xây dựng và đánh giá này đảm bảo nội dung phù hợp với thực tế HorseTrack: chỉ tập trung vào hai tính năng AI hiện có là prediction và arrangement. Mô hình phát triển module, đánh giá với dữ liệu thực tế và so sánh với baseline thủ công giúp xác định rõ giá trị của AI trong hệ thống.
