import { Tabs } from 'expo-router';
import React from 'react';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useAuth } from '@/providers/auth-provider';
import { DockTabBar, useDockScreenOptions, DockAvatarIcon } from '@/components/ui/dock-tab-bar';

export default function AdminLayout() {
  const dockOptions = useDockScreenOptions();
  const { user } = useAuth();

  return (
    <Tabs 
      tabBar={(props) => <DockTabBar {...props} />}
      screenOptions={{ ...dockOptions }}
    >
      <Tabs.Screen name="index" options={{ title: 'Trang chủ', headerTitle: 'ADMIN OVERVIEW', tabBarIcon: ({ color }) => <MaterialIcons size={24} name="home" color={color} /> }} />
      <Tabs.Screen name="tournaments" options={{ title: 'Giải đấu', headerTitle: 'QUẢN LÝ GIẢI ĐẤU', tabBarIcon: ({ color }) => <MaterialIcons size={24} name="emoji-events" color={color} /> }} />
      <Tabs.Screen name="approvals" options={{ title: 'Phê duyệt', headerTitle: 'DUYỆT YÊU CẦU / ĐĂNG KÝ', tabBarIcon: ({ color }) => <MaterialIcons size={24} name="how-to-reg" color={color} /> }} />
      <Tabs.Screen name="races" options={{ title: 'Trận đua', headerTitle: 'QUẢN LÝ TRẬN ĐUA', tabBarIcon: ({ color }) => <MaterialIcons size={24} name="flag" color={color} /> }} />
      <Tabs.Screen name="rankings" options={{ title: 'Xếp hạng', headerTitle: 'BẢNG XẾP HẠNG', tabBarIcon: ({ color }) => <MaterialIcons size={24} name="leaderboard" color={color} /> }} />
      <Tabs.Screen name="profile" options={{ title: 'Cá nhân', headerTitle: 'CÁ NHÂN', tabBarIcon: ({ focused }) => <DockAvatarIcon focused={focused} avatarUri={user?.avatar} /> }} />
    </Tabs>
  );
}
