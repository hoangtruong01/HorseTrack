# Phương pháp nghiên cứu

## 1. Phương pháp tiếp cận

Nghiên cứu này áp dụng phương pháp thiết kế hệ thống kết hợp với đánh giá thực nghiệm. Quy trình nghiên cứu bao gồm việc thiết kế và triển khai một nền tảng quản lý giải đua ngựa thông minh, tích hợp các mô-đun AI vào quy trình vận hành và đánh giá hiệu quả của chúng so với các phương án thủ công hoặc quy tắc đơn giản. Cách tiếp cận này phù hợp vì mục tiêu không chỉ là xây dựng hệ thống, mà còn kiểm chứng xem các tính năng AI có mang lại giá trị thực tiễn trong bối cảnh vận hành thật hay không.

## 2. Phương pháp phát triển hệ thống

Quá trình phát triển được thực hiện theo hướng mô-đun và lặp lại.

- Backend được triển khai bằng NestJS và TypeScript.
- Frontend web được triển khai bằng Next.js và React.
- Giao diện mobile được phát triển bằng Expo và React Native.
- MongoDB được dùng làm cơ sở dữ liệu chính cho tournament, race, horse, registration và các gợi ý AI.

Mỗi thành phần được phát triển và kiểm thử riêng trước khi tích hợp, giúp hệ thống phát triển theo hướng kiểm soát và dễ bảo trì.

## 3. Kiến trúc hệ thống

HorseTrack được tổ chức thành một hệ thống phần mềm nhiều tầng với các thành phần chính sau:

1. Tầng trình bày: giao diện dashboard web và ứng dụng mobile.
2. Tầng ứng dụng: API RESTful và dịch vụ thời gian thực.
3. Tầng nghiệp vụ: các mô-đun tournament, race, registration, horse, jockey và AI.
4. Tầng dữ liệu: lưu trữ bằng MongoDB và các schema có cấu trúc.

Hệ thống hỗ trợ nhiều vai trò người dùng bao gồm admin, chủ ngựa, jockey, trọng tài và khán giả. Mỗi vai trò đều có quyền truy cập và quy trình làm việc khác nhau.

## 4. Các mô-đun AI

### 4.1 Mô-đun dự đoán

Mô-đun dự đoán được thiết kế để sinh ra các gợi ý xếp hạng và lý giải cho kết quả race dựa trên dữ liệu về race, ngựa và lịch sử thi đấu. Quy trình bắt đầu bằng việc thu thập thông tin về race, ngựa, đăng ký, kết quả trước đó, dữ liệu record và các thuộc tính liên quan đến jockey. Một bước tính điểm sẽ tạo ra sức mạnh tương đối cho từng ngựa, sau đó là bước ước tính xác suất. Mô hình sau đó dùng reasoning từ LLM để tạo ra các giải thích dễ hiểu cho người dùng.

Đầu ra của mô-đun dự đoán bao gồm thông tin xếp hạng, xác suất thắng và phần giải thích. Điều này làm cho mô-đun phù hợp với mục tiêu hỗ trợ quyết định, thay vì chỉ phụ thuộc vào các con số khó giải thích.

### 4.2 Mô-đun sắp xếp race

Mô-đun sắp xếp tạo ra các đề xuất phân nhóm ngựa thành các race cho giải đấu. Nó sử dụng danh sách ngựa đã đăng ký và các thông tin ngữ cảnh liên quan để tạo ra các phân nhóm có tính cân bằng. Quá trình này xem xét sự phân bố sức mạnh và tiêu chí công bằng để đảm bảo đề xuất có tính thực thi. Mô-đun này cũng hỗ trợ việc áp dụng vào việc tạo race thật sau khi được admin xem xét.

## 5. Phương pháp đánh giá

Đánh giá tập trung vào ba góc độ chính:

- chất lượng dự đoán,
- chất lượng sắp xếp,
- và tính hữu ích trong thực tế.

Với mô-đun dự đoán, hệ thống được đánh giá qua độ chính xác xếp hạng, sai số xác suất, chất lượng lý giải và thời gian xử lý. Với mô-đun sắp xếp, đánh giá tập trung vào mức độ cân bằng, tính khả thi và số lỗi phân bổ. Trải nghiệm người dùng được đo bằng bảng khảo sát khả năng sử dụng và đánh giá theo tác vụ thực tế.

## 6. Dữ liệu và thiết lập thực nghiệm

Đánh giá sử dụng dữ liệu race và tournament thu thập từ hệ thống HorseTrack hoặc được mô phỏng theo cùng schema. Thử nghiệm so sánh đầu ra do AI sinh với baseline thủ công hoặc quy tắc đơn giản. Các chuyên gia đánh giá và người dùng cuối tham gia chấm điểm chất lượng và tính hữu ích của các đầu ra. Thiết kế này giúp bài báo vừa bàn về hiệu năng kỹ thuật vừa đề cập đến khả năng áp dụng thực tế.
