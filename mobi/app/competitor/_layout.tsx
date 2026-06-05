import React from 'react';
import { Stack } from 'expo-router';

export default function CompetitorLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: '#15151E',
        },
        headerTintColor: '#FFFFFF',
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
