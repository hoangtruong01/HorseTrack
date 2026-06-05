import { Platform } from 'react-native';

/**
 * Cấu hình kết nối tới NestJS Backend API.
 * 
 * LƯU Ý KHI CHẠY THỰC TẾ:
 * - Trên iOS Simulator: Bạn có thể giữ nguyên 'localhost' (127.0.0.1).
 * - Trên Android Emulator: Phải đổi thành '10.0.2.2' (IP máy chủ của Android).
 * - Trên điện thoại thật (Expo Go): Phải đổi thành IP cục bộ của máy tính của bạn (ví dụ: '192.168.1.15').
 */
const DEV_HOST = Platform.select({
  android: '10.0.2.2',
  ios: 'localhost',
  default: 'localhost',
});

export const BASE_URL = `http://${DEV_HOST}:3000/api/v1`;
