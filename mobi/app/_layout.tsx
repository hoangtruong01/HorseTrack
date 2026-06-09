import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { AuthProvider, useAuth } from '../providers/auth-provider';

export const unstable_settings = {
  anchor: '(tabs)',
};

function RootLayoutContent() {
  const colorScheme = useColorScheme();
  const { user, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const [isMounted, setIsMounted] = React.useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted || isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';

    const timer = setTimeout(() => {
      // Nếu chưa đăng nhập và không nằm trong thư mục xác thực, chuyển hướng sang login
      if (!user && !inAuthGroup) {
        router.replace('/(auth)/login');
      } 
      // Nếu đã đăng nhập và đang ở màn hình login/register, chuyển hướng về trang chủ
      else if (user && inAuthGroup) {
        router.replace('/(tabs)');
      }
    }, 0);

    return () => clearTimeout(timer);
  }, [user, isLoading, segments, isMounted]);

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="competitor" options={{ headerShown: false }} />
        <Stack.Screen name="operations" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Chi tiết' }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootLayoutContent />
    </AuthProvider>
  );
}

