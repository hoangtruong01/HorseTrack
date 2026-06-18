import { Tabs } from 'expo-router';
import React from 'react';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function OwnerLayout() {
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
      <Tabs.Screen name="index" options={{ title: 'Trang chủ', headerShown: false, tabBarIcon: ({ color }) => <MaterialIcons size={24} name="home" color={color} /> }} />
      <Tabs.Screen name="horses" options={{ title: 'Chiến mã', headerTitle: 'CHIẾN MÃ', tabBarIcon: ({ color }) => <MaterialIcons size={24} name="pets" color={color} /> }} />
      <Tabs.Screen name="registrations" options={{ title: 'Ghi danh', headerTitle: 'HỒ SƠ GHI DANH', tabBarIcon: ({ color }) => <MaterialIcons size={24} name="assignment" color={color} /> }} />
      <Tabs.Screen name="invitations" options={{ title: 'Mời Jockey', headerTitle: 'MỜI JOCKEY', tabBarIcon: ({ color }) => <MaterialIcons size={24} name="person-add" color={color} /> }} />
      <Tabs.Screen name="wallet" options={{ title: 'Ví thưởng', headerTitle: 'VÍ THƯỞNG', tabBarIcon: ({ color }) => <MaterialIcons size={24} name="account-balance-wallet" color={color} /> }} />
      <Tabs.Screen name="profile" options={{ title: 'Cá nhân', headerTitle: 'CÁ NHÂN', tabBarIcon: ({ color }) => <MaterialIcons size={24} name="person" color={color} /> }} />
      <Tabs.Screen name="results" options={{ href: null, title: 'Kết quả', headerTitle: 'KẾT QUẢ THI ĐẤU' }} />
      <Tabs.Screen name="rankings" options={{ href: null, title: 'Bảng xếp hạng', headerTitle: 'BẢNG XẾP HẠNG' }} />
      <Tabs.Screen name="races" options={{ href: null, title: 'Đăng ký thi đấu', headerTitle: 'ĐĂNG KÝ THI ĐẤU' }} />
    </Tabs>
  );
}
