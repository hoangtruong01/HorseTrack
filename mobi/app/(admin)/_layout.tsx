import { Tabs } from 'expo-router';
import React from 'react';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { premiumColors } from '@/components/ui/premium-tokens';

export default function AdminLayout() {
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
      <Tabs.Screen name="index" options={{ title: 'Trang chủ', headerTitle: 'ADMIN OVERVIEW', tabBarIcon: ({ color }) => <MaterialIcons size={24} name="home" color={color} /> }} />
      <Tabs.Screen name="tournaments" options={{ title: 'Giải đấu', headerTitle: 'QUẢN LÝ GIẢI ĐẤU', tabBarIcon: ({ color }) => <MaterialIcons size={24} name="emoji-events" color={color} /> }} />
      <Tabs.Screen name="approvals" options={{ title: 'Phê duyệt', headerTitle: 'DUYỆT YÊU CẦU / ĐĂNG KÝ', tabBarIcon: ({ color }) => <MaterialIcons size={24} name="how-to-reg" color={color} /> }} />
      <Tabs.Screen name="races" options={{ title: 'Trận đua', headerTitle: 'QUẢN LÝ TRẬN ĐUA', tabBarIcon: ({ color }) => <MaterialIcons size={24} name="flag" color={color} /> }} />
      <Tabs.Screen name="rankings" options={{ title: 'Xếp hạng', headerTitle: 'BẢNG XẾP HẠNG', tabBarIcon: ({ color }) => <MaterialIcons size={24} name="leaderboard" color={color} /> }} />
      <Tabs.Screen name="profile" options={{ title: 'Cá nhân', headerTitle: 'CÁ NHÂN', tabBarIcon: ({ color }) => <MaterialIcons size={24} name="person" color={color} /> }} />
    </Tabs>
  );
}
