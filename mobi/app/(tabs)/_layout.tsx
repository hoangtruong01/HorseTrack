import { Tabs } from 'expo-router';
import React from 'react';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useAuth } from '@/providers/auth-provider';
import { DockTabBar, useDockScreenOptions, DockAvatarIcon } from '@/components/ui/dock-tab-bar';

export default function TabLayout() {
  const dockOptions = useDockScreenOptions();
  const { user } = useAuth();

  return (
    <Tabs
      tabBar={(props) => <DockTabBar {...props} />}
      screenOptions={{ ...dockOptions }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Giải Đấu',
          headerTitle: 'HORSETRACK TOURNAMENTS',
          tabBarIcon: ({ color }) => <MaterialIcons size={24} name="emoji-events" color={color} />,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Lịch Đua',
          headerTitle: 'LỊCH TRÌNH GIẢI ĐUA',
          tabBarIcon: ({ color }) => <MaterialIcons size={24} name="directions-run" color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Cá Nhân',
          headerTitle: 'HỒ SƠ HỘI VIÊN',
          tabBarIcon: ({ focused }) => <DockAvatarIcon focused={focused} avatarUri={user?.avatar} />,
        }}
      />
    </Tabs>
  );
}
