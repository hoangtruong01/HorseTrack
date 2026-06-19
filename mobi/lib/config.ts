import { Platform } from 'react-native';

const DEFAULT_DEV_HOST = Platform.select({
  android: '10.0.2.2',
  ios: 'localhost',
  default: 'localhost',
});

let apiURL = process.env.EXPO_PUBLIC_API_URL || `http://${DEFAULT_DEV_HOST}:3000/api/v1`;

if (Platform.OS !== 'android' && apiURL.includes('10.0.2.2')) {
  apiURL = apiURL.replace('10.0.2.2', 'localhost');
}

console.log(apiURL);

export const BASE_URL = apiURL;

