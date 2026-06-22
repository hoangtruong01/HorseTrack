import { Tabs } from 'expo-router';
import React from 'react';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useAuth } from '@/providers/auth-provider';
import { DockTabBar, useDockScreenOptions, DockAvatarIcon } from '@/components/ui/dock-tab-bar';

export default function CounterLayout() {
  const dockOptions = useDockScreenOptions();
  const { user } = useAuth();

  return (
    <Tabs 
      tabBar={(props) => <DockTabBar {...props} />}
      screenOptions={{ ...dockOptions }}
    >
      <Tabs.Screen name="index" options={{ title: 'Trang chủ', headerTitle: 'COUNTER DASHBOARD', tabBarIcon: ({ color }) => <MaterialIcons size={24} name="home" color={color} /> }} />
      <Tabs.Screen name="scan" options={{ title: 'Đối soát', headerTitle: 'ĐỐI SOÁT MÃ QUY ĐỔI', tabBarIcon: ({ color }) => <MaterialIcons size={24} name="qr-code-scanner" color={color} /> }} />
      <Tabs.Screen name="queue" options={{ title: 'Hàng đợi', headerTitle: 'HÀNG ĐỢI CHI TRẢ', tabBarIcon: ({ color }) => <MaterialIcons size={24} name="queue" color={color} /> }} />
      <Tabs.Screen name="deposit" options={{ href: null }} />
      <Tabs.Screen name="stats" options={{ title: 'Báo cáo', headerTitle: 'BÁO CÁO DOANH THU', tabBarIcon: ({ color }) => <MaterialIcons size={24} name="bar-chart" color={color} /> }} />
      <Tabs.Screen name="profile" options={{ title: 'Cá nhân', headerTitle: 'CÁ NHÂN', tabBarIcon: ({ focused }) => <DockAvatarIcon focused={focused} avatarUri={user?.avatar} /> }} />
    </Tabs>
  );
}
