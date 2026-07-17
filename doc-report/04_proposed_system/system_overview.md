# Tổng quan Hệ thống HorseTrack

## 1. Tên Hệ thống

**HorseTrack** — Hệ thống Quản lý Giải đua Ngựa và Giải pháp điều phối sự kiện thể thao số.

## 2. Mục đích

HorseTrack là nền tảng web/mobile cho phép tổ chức, quản lý và giám sát toàn bộ vòng đời giải đua ngựa: từ đăng ký ngựa/jockey, phân bổ race, theo dõi điểm số, ghi nhận kết quả, đến truyền thông thông báo và xếp hạng. Hệ thống hướng đến trải nghiệm phân quyền rõ ràng cho admin, owner, jockey, referee và spectator.

## 3. Giá trị cốt lõi

| Không có HorseTrack | Có HorseTrack |
|---|---|
| Quản lý phân tán bằng nhiều spreadsheet và chat | Quản lý tập trung qua một nền tảng duy nhất |
| Cập nhật điểm và kết quả chậm trễ | Thông báo, bảng xếp hạng và kết quả realtime |
| Phân quyền mơ hồ giữa admin, chủ ngựa và giám khảo | Quyền truy cập rõ ràng theo vai trò |
| Dữ liệu race, referee và wallet tách biệt | Dữ liệu hội tụ trong MongoDB, có audit và lịch sử |
| Không có hỗ trợ dự đoán | Có module AI dự đoán và gợi ý chiến lược |

## 4. Vai trò người dùng chính

| Vai trò | Quyền truy cập | Hành động chính |
|---|---|---|
| **Admin** | Toàn bộ backend | Tạo, cập nhật giải đấu/race, phân công referee, duyệt đăng ký, quản lý prize/wallet, xem audit |
| **Horse Owner** | Quản lý ngựa và jockey | Đăng ký ngựa, mời jockey, theo dõi lịch thi, xem kết quả |
| **Jockey** | Trình duyệt thông tin race | Nhận lời mời, xác nhận tham gia, xem lịch, tham gia race |
| **Race Referee** | Ghi nhận và chấm kiểm tra race | Nhập kết quả, báo cáo vi phạm, tính điểm và xếp hạng |
| **Spectator** | Xem leaderboard và thông báo | Theo dõi kết quả live, xem bảng xếp hạng, nhận thông báo |
| **Counter Staff** | Quản lý thanh toán và quỹ | Xử lý nạp rút, quản lý wallet |

## 5. Các module chính

| Module | Mô tả |
|---|---|
| Tournament & Race | Quản lý giải đấu, lịch thi đấu, trạng thái race, số lượng vòng thi |
| Horses & Jockeys | Quản lý hồ sơ ngựa/jockey, thông tin sức khoẻ, kỹ năng và trạng thái tham gia |
| Registrations | Đăng ký tham dự, xác nhận, hủy, kiểm tra điều kiện tham gia |
| Referee Assignment | Phân công giám khảo, theo dõi nhiệm vụ, chấm điểm và báo cáo |
| Race Results | Nhập kết quả, xử lý thời gian, penalty, tính xếp hạng và tổng hợp điểm |
| Rankings | Tính toán bảng xếp hạng toàn giải và theo race |
| Notifications | Gửi thông báo hệ thống và realtime socket.io đến user |
| Wallet | Quản lý nạp, rút, giao dịch nội bộ, cashout và lịch sử tài chính |
| Predictions / AI | Sinh dự đoán, gợi ý bằng AI theo dữ liệu race và ngựa |
| Uploads | Quản lý tài liệu, hình ảnh, upload file dùng trong race và hồ sơ |
| Audit Logs | Lưu nhật ký hoạt động, thay đổi dữ liệu và hành vi người dùng |

## 6. Các thành phần AI

HorseTrack tích hợp AI ở lớp backend để gia tăng giá trị thông tin:

| Thành phần AI | Công nghệ | Mô tả |
|---|---|---|
| AI Prediction | `@google/genai` | Sinh nhận xét dự đoán đối thủ và kết quả race dựa trên dữ liệu ngựa/jockey/điều kiện |
| AI Arrangement | `@google/genai` | Đánh giá đề xuất phân bổ race, cân bằng lực lượng và tính hợp lý |
| Subscription AI | PayOS | Quản lý gói AI và thanh toán cho người dùng nếu có yêu cầu |

## 7. Luồng dữ liệu chính

1. Người dùng web/mobile gửi yêu cầu đến backend NestJS.
2. Backend xác thực JWT hoặc Google ID token, kiểm tra quyền role.
3. Dữ liệu nghiệp vụ được truy vấn/ghi vào MongoDB qua Mongoose.
4. Nếu cần thông báo, backend tạo event và phát qua socket.io cho client.
5. Nếu cần truy vấn AI, backend gọi Google GenAI và trả kết quả về frontend.
6. Frontend web dùng Next.js để proxy các request, giữ token trong cookie và tối ưu UX.

## 8. Kiến trúc triển khai

- `be/` chứa backend NestJS API.
- `fe/` chứa frontend Next.js App Router.
- `mobi/` chứa mobile app Expo React Native.
- MongoDB là nguồn dữ liệu chính.
- Socket.io cung cấp kênh realtime cho notifications.

## 9. Bảo mật và cấu hình

- Xác thực: JWT cho API, Google OAuth2 ID token cho login Google.
- Phân quyền: `JwtAuthGuard` + `RolesGuard` bảo vệ endpoint quan trọng.
- CORS: cho phép frontend web và mobile kết nối tới backend.
- Biến môi trường: `MONGODB_URI`, `JWT_SECRET`, `GEMINI_API_KEY`, `NEXT_PUBLIC_API_URL`, `CORS_ORIGIN`.
- Rate limiting: `ThrottlerGuard` bảo vệ toàn bộ API.

## 10. Tóm tắt giá trị hệ thống

HorseTrack là nền tảng điều phối toàn diện cho giải đua ngựa, giúp:
- Tự động hóa quy trình tổ chức và chấm thi.
- Đồng bộ dữ liệu giữa web và mobile.
- Cung cấp thông tin realtime và bảng xếp hạng sinh động.
- Hỗ trợ AI để tăng chất lượng dự đoán và phân tích.
- Giảm tải quản lý thủ công và rủi ro sai sót khi lập lịch. 