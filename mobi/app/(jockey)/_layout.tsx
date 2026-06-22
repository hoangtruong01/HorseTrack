import { Tabs } from 'expo-router';
import React from 'react';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useAuth } from '@/providers/auth-provider';
import { DockTabBar, useDockScreenOptions, DockAvatarIcon } from '@/components/ui/dock-tab-bar';

export default function JockeyLayout() {
  const dockOptions = useDockScreenOptions();
  const { user } = useAuth();

  return (
    <Tabs 
      tabBar={(props) => <DockTabBar {...props} />}
      screenOptions={{ ...dockOptions }}
    >
      <Tabs.Screen name="index" options={{ title: 'Trang chủ', headerTitle: 'JOCKEY DASHBOARD', tabBarIcon: ({ color }) => <MaterialIcons size={24} name="home" color={color} /> }} />
      <Tabs.Screen name="inbox" options={{ title: 'Hòm thư', headerTitle: 'LỜI MỜI NHẬN ĐUA', tabBarIcon: ({ color }) => <MaterialIcons size={24} name="mail" color={color} /> }} />
      <Tabs.Screen name="schedule" options={{ title: 'Lịch đua', headerTitle: 'LỊCH THI ĐẤU', tabBarIcon: ({ color }) => <MaterialIcons size={24} name="event" color={color} /> }} />
      <Tabs.Screen name="horses" options={{ title: 'Chiến mã', headerTitle: 'CHIẾN MÃ ĐIỀU KHIỂN', tabBarIcon: ({ color }) => <MaterialIcons size={24} name="pets" color={color} /> }} />
      <Tabs.Screen name="performance" options={{ title: 'Thành tích', headerTitle: 'BẢNG THÀNH TÍCH', tabBarIcon: ({ color }) => <MaterialIcons size={24} name="emoji-events" color={color} /> }} />
      <Tabs.Screen name="profile" options={{ title: 'Cá nhân', headerTitle: 'CÁ NHÂN', tabBarIcon: ({ focused }) => <DockAvatarIcon focused={focused} avatarUri={user?.avatar} /> }} />
    </Tabs>
  );
}
