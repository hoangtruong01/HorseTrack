import { Platform } from 'react-native';

const DEFAULT_DEV_HOST = Platform.select({
  android: '10.0.2.2',
  ios: 'localhost',
  default: 'localhost',
});

export const BASE_URL =
  process.env.EXPO_PUBLIC_API_URL || `http://${DEFAULT_DEV_HOST}:3000/api/v1`;
