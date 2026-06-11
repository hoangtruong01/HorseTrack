import React from 'react';
import { Stack } from 'expo-router';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';

export default function CompetitorLayout() {
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
      <Stack.Screen
        name="dashboard"
        options={{
          title: 'KHU ĐỐI TÁC',
          headerBackTitle: 'Trở lại',
        }}
      />
      <Stack.Screen
        name="invitation-inbox"
        options={{
          title: 'HÒM THƯ LỜI MỜI',
        }}
      />
      <Stack.Screen
        name="my-horses"
        options={{
          title: 'DANH SÁCH CHIẾN MÃ',
        }}
      />
      <Stack.Screen
        name="cashout-request"
        options={{
          title: 'YÊU CẦU RÚT ĐIỂM',
        }}
      />
    </Stack>
  );
}
