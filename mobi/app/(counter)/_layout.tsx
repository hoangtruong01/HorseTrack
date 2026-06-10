import { Tabs } from 'expo-router';
import React from 'react';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function CounterLayout() {
  const colorScheme = useColorScheme();
  const t = Colors[colorScheme ?? 'dark'];
  return (
    <Tabs screenOptions={{
      tabBarActiveTintColor: t.tint,
      tabBarInactiveTintColor: t.tabIconDefault,
      headerShown: true,
      headerStyle: { backgroundColor: '#15151E', borderBottomWidth: 1, borderBottomColor: '#303037' },
      headerTitleStyle: { color: t.text, fontWeight: '900', fontSize: 15, letterSpacing: 1 },
      tabBarStyle: { backgroundColor: '#15151E', borderTopWidth: 1, borderTopColor: '#303037', height: 60, paddingBottom: 8, paddingTop: 8 },
    }}>
      <Tabs.Screen name="index" options={{ title: 'Trang chủ', headerTitle: 'COUNTER DASHBOARD', tabBarIcon: ({ color }) => <MaterialIcons size={24} name="home" color={color} /> }} />
      <Tabs.Screen name="scan" options={{ title: 'Đối soát', headerTitle: 'ĐỐI SOÁT MÃ QUY ĐỔI', tabBarIcon: ({ color }) => <MaterialIcons size={24} name="qr-code-scanner" color={color} /> }} />
      <Tabs.Screen name="queue" options={{ title: 'Hàng đợi', headerTitle: 'HÀNG ĐỢI CHI TRẢ', tabBarIcon: ({ color }) => <MaterialIcons size={24} name="queue" color={color} /> }} />
      <Tabs.Screen name="deposit" options={{ href: null }} />
      <Tabs.Screen name="stats" options={{ title: 'Báo cáo', headerTitle: 'BÁO CÁO DOANH THU', tabBarIcon: ({ color }) => <MaterialIcons size={24} name="bar-chart" color={color} /> }} />
      <Tabs.Screen name="profile" options={{ title: 'Cá nhân', headerTitle: 'CÁ NHÂN', tabBarIcon: ({ color }) => <MaterialIcons size={24} name="person" color={color} /> }} />
    </Tabs>
  );
}
