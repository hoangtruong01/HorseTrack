import React from 'react';
import { Stack } from 'expo-router';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';

export default function OperationsLayout() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const t = Colors[colorScheme ?? 'dark'];

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: isDark ? '#15151E' : '#FFFFFF',
        },
        headerTintColor: t.text,
        headerTitleStyle: {
          fontWeight: '900',
        },
        headerShadowVisible: false,
      }}
    >
      {/* Referee Operations */}
      <Stack.Screen
        name="referee/assigned-races"
        options={{
          title: 'TRẬN ĐẤU CỦA TÔI',
          headerBackTitle: 'Trở lại',
        }}
      />
      <Stack.Screen
        name="referee/pre-race"
        options={{
          title: 'ĐIỂM DANH CHIẾN MÃ',
        }}
      />
      <Stack.Screen
        name="referee/violation-log"
        options={{
          title: 'GHI NHẬN VI PHẠM',
        }}
      />
      <Stack.Screen
        name="referee/result-entry"
        options={{
          title: 'NHẬP KẾT QUẢ',
        }}
      />
      <Stack.Screen
        name="referee/wallet"
        options={{
          headerShown: false,
        }}
      />

      {/* Shared Operations */}
      <Stack.Screen
        name="wallet"
        options={{
          title: 'VÍ ĐIỂM & GIAO DỊCH',
          headerBackTitle: 'Cá nhân',
        }}
      />
    </Stack>
  );
}
