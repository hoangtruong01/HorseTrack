import { Tabs, usePathname } from 'expo-router';
import React from 'react';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useAuth } from '@/providers/auth-provider';
import { DockTabBar, useDockScreenOptions, DockAvatarIcon, DockNotificationIcon } from '@/components/ui/dock-tab-bar';
import { notificationsApi } from '@/lib/api-client';

export default function JockeyLayout() {
  const dockOptions = useDockScreenOptions();
  const { user } = useAuth();
  const pathname = usePathname();
  const [unreadCount, setUnreadCount] = React.useState(0);

  React.useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const res = await notificationsApi.list();
        const data = (res as any).data || res || [];
        const count = data.filter((n: any) => !n.isRead).length;
        setUnreadCount(count);
      } catch (err) {
        // ignore
      }
    };
    
    fetchUnreadCount();
    
    const interval = setInterval(fetchUnreadCount, 5000);
    return () => clearInterval(interval);
  }, [pathname]);

  return (
    <Tabs
      tabBar={(props) => <DockTabBar {...props} />}
      screenOptions={{ ...dockOptions, headerShown: false }}
    >
      <Tabs.Screen name="index" options={{ title: 'Trang chủ', headerTitle: 'JOCKEY DASHBOARD', tabBarIcon: ({ color }) => <MaterialIcons size={24} name="home" color={color} /> }} />
      <Tabs.Screen name="inbox" options={{ title: 'Hòm thư', headerTitle: 'LỜI MỜI NHẬN ĐUA', tabBarIcon: ({ color }) => <MaterialIcons size={24} name="mail" color={color} /> }} />
      <Tabs.Screen name="schedule" options={{ title: 'Lịch đua', headerTitle: 'LỊCH THI ĐẤU', tabBarIcon: ({ color }) => <MaterialIcons size={24} name="event" color={color} /> }} />
      <Tabs.Screen name="horses" options={{ title: 'Chiến mã', headerTitle: 'CHIẾN MÃ ĐIỀU KHIỂN', tabBarIcon: ({ color }) => <MaterialCommunityIcons size={24} name="horse-variant-fast" color={color} /> }} />
      <Tabs.Screen name="notifications" options={{ title: 'Thông báo', headerTitle: 'THÔNG BÁO', tabBarIcon: ({ focused }) => <DockNotificationIcon focused={focused} count={unreadCount} /> }} />
      <Tabs.Screen name="profile" options={{ title: 'Cá nhân', headerTitle: 'CÁ NHÂN', tabBarIcon: ({ focused }) => <DockAvatarIcon focused={focused} avatarUri={user?.avatar} /> }} />
      <Tabs.Screen name="performance" options={{ href: null }} />
    </Tabs>
  );
}
