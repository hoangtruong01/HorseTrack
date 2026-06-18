import { Tabs } from 'expo-router';
import React from 'react';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { premiumColors } from '@/components/ui/premium-tokens';

export default function RefereeLayout() {
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
      <Tabs.Screen name="index" options={{ title: 'Trang chủ', headerTitle: 'REFEREE DASHBOARD', tabBarIcon: ({ color }) => <MaterialIcons size={24} name="home" color={color} /> }} />
      <Tabs.Screen name="assignments" options={{ title: 'Phân công', headerTitle: 'NHIỆM VỤ PHÂN CÔNG', tabBarIcon: ({ color }) => <MaterialIcons size={24} name="assignment-turned-in" color={color} /> }} />
      <Tabs.Screen name="pre-race" options={{ title: 'Kiểm tra', headerTitle: 'KIỂM TRA TRẬN ĐUA', tabBarIcon: ({ color }) => <MaterialIcons size={24} name="checklist" color={color} /> }} />
      <Tabs.Screen name="violations" options={{ title: 'Vi phạm', headerTitle: 'GHI NHẬN VI PHẠM', tabBarIcon: ({ color }) => <MaterialIcons size={24} name="gavel" color={color} /> }} />
      <Tabs.Screen name="results" options={{ title: 'Kết quả', headerTitle: 'KẾT QUẢ TRẬN ĐUA', tabBarIcon: ({ color }) => <MaterialIcons size={24} name="sports-score" color={color} /> }} />
      <Tabs.Screen name="profile" options={{ title: 'Cá nhân', headerTitle: 'CÁ NHÂN', tabBarIcon: ({ color }) => <MaterialIcons size={24} name="person" color={color} /> }} />
    </Tabs>
  );
}
