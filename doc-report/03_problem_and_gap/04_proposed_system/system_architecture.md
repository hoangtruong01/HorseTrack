# Kiến trúc Hệ thống HorseTrack

## 1. Tổng quan

HorseTrack được xây dựng theo kiến trúc đa lớp với một backend API trung tâm, một frontend web Next.js và một ứng dụng mobile Expo React Native. Backend sử dụng NestJS, kết nối trực tiếp đến MongoDB bằng Mongoose và cung cấp REST API cùng WebSocket cho realtime.

- Frontend web: `fe/` (Next.js App Router, React 19, Tailwind CSS)
- Backend API: `be/` (NestJS, TypeScript, JWT, Passport, Mongoose)
- Mobile app: `mobi/` (Expo, React Native)
- Database: MongoDB
- AI: Google GenAI (`@google/genai`) cho tính năng dự đoán và sắp xếp race

## 2. Các thành phần chính

| Thành phần | Công nghệ | Vai trò |
|---|---|---|
| Backend API | NestJS, TypeScript | Xử lý nghiệp vụ cuộc thi, người dùng, đăng ký, race, điểm, referee, thông báo và AI |
| Database | MongoDB + Mongoose | Lưu trữ dữ liệu user, tournaments, races, horses, jockeys, registrations, race results, notifications, AI packages |
| Frontend Web | Next.js 16, React 19, Tailwind CSS | Giao diện dashboard quản trị, owner, jockey, spectator và proxy API đến backend |
| Mobile App | Expo, React Native | Ứng dụng di động đa nền tảng, chia sẻ dữ liệu từ backend qua REST API |
| Realtime | Socket.io | Đẩy thông báo realtime đến người dùng |
| AI Service | Google GenAI | Sinh nhận xét dự đoán, đánh giá sắp xếp racing plan và gợi ý AI |
| Auth | Passport, JWT, Google OAuth2 ID token | Xác thực email/password và đăng nhập Google |

## 3. Kiến trúc dữ liệu và giao tiếp

1. Frontend web gọi các route nội bộ của Next.js (`fe/app/api/*/route.ts`). Những route này đóng vai trò proxy, dùng token trong cookie và gọi backend NestJS tại `NEXT_PUBLIC_API_URL`/`/api/v1`.
2. Backend NestJS khai báo `setGlobalPrefix('api/v1')`, sử dụng `ValidationPipe`, `ResponseInterceptor`, `AllExceptionsFilter`, và `helmet` để bảo mật, validate và chuẩn hóa phản hồi.
3. Backend kết nối MongoDB bằng `MongooseModule.forRootAsync` và chia thành nhiều module nghiệp vụ:
   - `AuthModule` (JWT + LocalStrategy + Google login)
   - `UsersModule`, `HorsesModule`, `TournamentsModule`, `RacesModule`, `RegistrationsModule`, `RaceResultsModule`, `NotificationsModule`, v.v.
4. Backend cung cấp API REST cho tất cả các chức năng chính: đăng ký, đăng nhập, quản lý race, phân công referee, tính điểm, quản lý wallet, ghi nhận race results, thông báo.
5. `NotificationsGateway` dùng WebSocketGateway để gắn client vào phòng theo `userId` và gửi thông báo realtime bằng socket.io.

## 4. Luồng nghiệp vụ chính

- Người dùng đăng ký hoặc đăng nhập bằng email/password hoặc Google ID token.
- Sau khi xác thực, frontend gọi backend qua REST API với header `Authorization: Bearer <token>`.
- Admin/Owner/Jockey/Spectator sử dụng các endpoint phân quyền khác nhau do `JwtAuthGuard` và `RolesGuard` kiểm soát.
- Tournaments và race được tạo, cập nhật, và phân bổ thông tin qua backend module.
- Frontend web và ứng dụng mobile đều truy vấn dữ liệu từ backend, đồng bộ qua cùng API.

## 5. AI và tính năng thông minh

Backend có module AI (`be/src/ai`) dùng `@google/genai` để:

- Sinh lý giải dự đoán race dựa trên dữ liệu ngựa, jockey, điều kiện đường đua.
- Sinh nhận xét về plan sắp xếp race và độ cân bằng giữa các race.
- Quản lý gói AI và subscription cho spectator với PayOS.

AI không phải là một dịch vụ microservice riêng biệt trong repo này; nó được triển khai trực tiếp dưới dạng module NestJS trong backend.

## 6. Realtime và thông báo

- `NotificationsGateway` mở một gateway WebSocket với CORS cho các origin backend chấp nhận.
- Khi client kết nối, nếu có `userId` thì sẽ `join` vào phòng `user_<userId>`.
- Backend có thể phát thông báo đến người dùng cụ thể hoặc broadcast chung.

## 7. Cấu trúc thư mục

```text
HorseTrack/
├── be/      # NestJS backend API
├── fe/      # Next.js frontend
├── mobi/    # Expo React Native mobile app
└── docs/    # Tài liệu, kiến trúc, kế hoạch
```

## 8. Cấu hình và bảo mật

- Backend hỗ trợ CORS cho các origin localhost của frontend và mobile.
- Mọi thiết lập nhạy cảm như `MONGODB_URI`, `JWT_SECRET`, `GEMINI_API_KEY`, `GEMINI_MODEL` được lấy từ biến môi trường.
- Backend sử dụng `ThrottlerGuard` toàn cục để giới hạn request.
- Authentication dựa trên JWT, refresh token và Google OAuth2 ID token qua endpoint `POST /auth/google`.

## 9. Tóm tắt kiến trúc logic

```
[ FE Web Next.js ]      [ Mobile Expo React Native ]
         \                    /
          \                  /
          [ Backend NestJS REST API + WebSocket ]
                       |
                 [ MongoDB / Mongoose ]
                       |
                [ AI via Google GenAI ]
```

Điều này phản ánh kiến trúc hiện có trong repository: frontend/ mobile tiêu thụ backend API, backend quản lý toàn bộ nghiệp vụ và xử lý AI, dữ liệu lưu trong MongoDB.