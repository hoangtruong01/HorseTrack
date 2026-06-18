import { Tabs } from 'expo-router';
import React from 'react';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { premiumColors } from '@/components/ui/premium-tokens';

export default function JockeyLayout() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const t = Colors[colorScheme ?? 'dark'];
  return (
    <Tabs screenOptions={{
      tabBarActiveTintColor: t.tint,
      tabBarInactiveTintColor: t.tabIconDefault,
      headerShown: true,
      headerStyle: { backgroundColor: isDark ? premiumColors.headerBg : '#FFFFFF', borderBottomWidth: 1, borderBottomColor: isDark ? premiumColors.headerBorder : '#D3DADE' },
      headerTitleStyle: { color: t.text, fontWeight: '900', fontSize: 15, letterSpacing: 1 },
      tabBarStyle: { backgroundColor: isDark ? premiumColors.headerBg : '#FFFFFF', borderTopWidth: 1, borderTopColor: isDark ? premiumColors.headerBorder : '#D3DADE', height: 60, paddingBottom: 8, paddingTop: 8 },
    }}>
      <Tabs.Screen name="index" options={{ title: 'Trang chủ', headerTitle: 'JOCKEY DASHBOARD', tabBarIcon: ({ color }) => <MaterialIcons size={24} name="home" color={color} /> }} />
      <Tabs.Screen name="inbox" options={{ title: 'Hòm thư', headerTitle: 'LỜI MỜI NHẬN ĐUA', tabBarIcon: ({ color }) => <MaterialIcons size={24} name="mail" color={color} /> }} />
      <Tabs.Screen name="schedule" options={{ title: 'Lịch đua', headerTitle: 'LỊCH THI ĐẤU', tabBarIcon: ({ color }) => <MaterialIcons size={24} name="event" color={color} /> }} />
      <Tabs.Screen name="horses" options={{ title: 'Chiến mã', headerTitle: 'CHIẾN MÃ ĐIỀU KHIỂN', tabBarIcon: ({ color }) => <MaterialIcons size={24} name="pets" color={color} /> }} />
      <Tabs.Screen name="performance" options={{ title: 'Thành tích', headerTitle: 'BẢNG THÀNH TÍCH', tabBarIcon: ({ color }) => <MaterialIcons size={24} name="emoji-events" color={color} /> }} />
      <Tabs.Screen name="profile" options={{ title: 'Cá nhân', headerTitle: 'CÁ NHÂN', tabBarIcon: ({ color }) => <MaterialIcons size={24} name="person" color={color} /> }} />
    </Tabs>
  );
}
