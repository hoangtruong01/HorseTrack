import { Tabs } from 'expo-router';
import React from 'react';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuth } from '@/providers/auth-provider';

import { DockTabBar, useDockScreenOptions, DockAvatarIcon } from '@/components/ui/dock-tab-bar';

export default function RefereeLayout() {
  const dockOptions = useDockScreenOptions();
  const { user } = useAuth();

  return (
    <Tabs
      tabBar={(props) => <DockTabBar {...props} />}
      screenOptions={{
        ...dockOptions,
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Trang chủ', headerTitle: 'REFEREE DASHBOARD', tabBarIcon: ({ color }) => <MaterialIcons size={24} name="home" color={color} /> }} />
      <Tabs.Screen name="assignments" options={{ title: 'Phân công', headerTitle: 'NHIỆM VỤ PHÂN CÔNG', tabBarIcon: ({ color }) => <MaterialIcons size={24} name="assignment-turned-in" color={color} /> }} />
      <Tabs.Screen name="pre-race" options={{ title: 'Kiểm tra', headerTitle: 'KIỂM TRA TRẬN ĐUA', tabBarIcon: ({ color }) => <MaterialIcons size={24} name="checklist" color={color} /> }} />
      <Tabs.Screen name="judging" options={{ title: 'Thẩm định', headerTitle: 'THẨM ĐỊNH KẾT QUẢ', tabBarIcon: ({ color }) => <MaterialIcons size={24} name="gavel" color={color} /> }} />
      <Tabs.Screen name="wallet" options={{ title: 'Ví', headerTitle: 'VÍ ĐIỆN TỬ', tabBarIcon: ({ color }) => <MaterialIcons size={24} name="account-balance-wallet" color={color} /> }} />
      <Tabs.Screen name="profile" options={{ title: 'Cá nhân', headerTitle: 'CÁ NHÂN', tabBarIcon: ({ focused }) => <DockAvatarIcon focused={focused} avatarUri={user?.avatar} /> }} />

      {/* Ẩn các trang con vì đã gộp vào Judging */}
      <Tabs.Screen name="violations" options={{ href: null, tabBarItemStyle: { display: 'none' }, title: 'Vi phạm', headerTitle: 'GHI NHẬN VI PHẠM' }} />
      <Tabs.Screen name="results" options={{ href: null, tabBarItemStyle: { display: 'none' }, title: 'Kết quả', headerTitle: 'KẾT QUẢ TRẬN ĐUA' }} />
    </Tabs>
  );
}
