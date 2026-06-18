import { Tabs } from 'expo-router';
import React from 'react';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function SpectatorLayout() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const t = Colors[colorScheme ?? 'dark'];
  return (
    <Tabs screenOptions={{
      tabBarActiveTintColor: t.tint,
      tabBarInactiveTintColor: t.tabIconDefault,
      headerShown: true,
      headerStyle: { backgroundColor: isDark ? '#15151E' : '#FFFFFF', borderBottomWidth: 1, borderBottomColor: isDark ? '#303037' : '#D3DADE' },
      headerTitleStyle: { color: t.text, fontWeight: '900', fontSize: 15, letterSpacing: 1 },
      tabBarStyle: { backgroundColor: isDark ? '#15151E' : '#FFFFFF', borderTopWidth: 1, borderTopColor: isDark ? '#303037' : '#D3DADE', height: 60, paddingBottom: 8, paddingTop: 8 },
    }}>
      <Tabs.Screen name="index" options={{ title: 'Trang chủ', headerTitle: 'HORSETRACK', tabBarIcon: ({ color }) => <MaterialIcons size={24} name="home" color={color} /> }} />
      <Tabs.Screen name="tournaments" options={{ title: 'Giải đấu', headerShown: false, tabBarIcon: ({ color }) => <MaterialIcons size={24} name="emoji-events" color={color} /> }} />
      <Tabs.Screen name="races" options={{ title: 'Lịch đua', headerTitle: 'LỊCH ĐUA', tabBarIcon: ({ color }) => <MaterialIcons size={24} name="directions-run" color={color} /> }} />
      <Tabs.Screen name="predictions" options={{ title: 'Dự đoán', headerTitle: 'DỰ ĐOÁN', tabBarIcon: ({ color }) => <MaterialIcons size={24} name="psychology" color={color} /> }} />
      <Tabs.Screen name="wallet" options={{ title: 'Ví điểm', headerTitle: 'VÍ ĐIỂM', tabBarIcon: ({ color }) => <MaterialIcons size={24} name="account-balance-wallet" color={color} /> }} />
      <Tabs.Screen name="profile" options={{ title: 'Cá nhân', headerTitle: 'CÁ NHÂN', tabBarIcon: ({ color }) => <MaterialIcons size={24} name="person" color={color} /> }} />
      <Tabs.Screen name="race/[id]" options={{ href: null, headerTitle: 'CHI TIẾT TRẬN ĐUA' }} />
    </Tabs>
  );
}
