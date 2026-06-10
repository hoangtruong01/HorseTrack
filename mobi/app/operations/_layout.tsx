import React from 'react';
import { Stack } from 'expo-router';

export default function OperationsLayout() {
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

      {/* Counter Operations */}
      <Stack.Screen
        name="counter/scan"
        options={{
          title: 'QUÉT MÃ QUY ĐỔI',
          headerBackTitle: 'Trở lại',
        }}
      />

    </Stack>
  );
}
