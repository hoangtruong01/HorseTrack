import { Tabs, Stack, usePathname } from 'expo-router';
import { Platform } from 'react-native';
import React from 'react';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useAuth } from '@/providers/auth-provider';
import { useThemeColors } from '@/components/ui/shared';
import { DockTabBar, useDockScreenOptions, DockAvatarIcon, DockNotificationIcon } from '@/components/ui/dock-tab-bar';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { notificationsApi } from '@/lib/api-client';

// Layout cho tất cả các nền tảng (iOS, Android, Web) - dùng DockTabBar tuỳ chỉnh
// Chỉ 5 tab: index, assignments, judging, pre-race, profile
export default function RefereeLayout() {
  const dockOptions = useDockScreenOptions();
  const { user } = useAuth();
  const theme = useThemeColors();
  const pathname = usePathname();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  // Lưu lại đường dẫn cuối cùng thuộc tab này để tránh lỗi chớp header (flashing navbar)
  // khi push một screen mới (như settings, wallet) và vuốt quay lại.
  const [localPath, setLocalPath] = React.useState(pathname);
  const [unreadCount, setUnreadCount] = React.useState(0);

  React.useEffect(() => {
    // Nếu pathname nằm trong các tab chính, ta cập nhật localPath.
    if (
      pathname === '/' ||
      pathname === '/profile' ||
      pathname.startsWith('/notifications') ||
      pathname.startsWith('/assignments') ||
      pathname.startsWith('/leaderboard')
    ) {
      setLocalPath(pathname);
    }
  }, [pathname]);

  React.useEffect(() => {
    let isMounted = true;
    const fetchUnreadCount = async () => {
      try {
        const res = await notificationsApi.list();
        const data = (res as any).data || res || [];
        const count = data.filter((n: any) => !n.isRead).length;
        if (isMounted) {
          setUnreadCount(count);
        }
      } catch (err) {
        // ignore
      }
    };

    fetchUnreadCount();

    const interval = setInterval(fetchUnreadCount, 5000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  // Tính toán headerTitle dựa vào localPath thay vì pathname
  let headerTitle = 'REFEREE DASHBOARD';
  if (localPath.includes('/assignments')) headerTitle = 'NHIỆM VỤ PHÂN CÔNG';
  else if (localPath.includes('/leaderboard')) headerTitle = 'KẾT QUẢ XẾP HẠNG';
  else if (localPath.includes('/wallet')) headerTitle = 'VÍ ĐIỆN TỬ';
  else if (localPath.includes('/profile')) headerTitle = 'CÁ NHÂN';

  return (
    <Tabs
      tabBar={(props) => <DockTabBar {...props} />}
      screenOptions={{ ...dockOptions, headerShown: false }}
    >
      <Tabs.Screen name="index" options={{ title: 'Trang chủ', headerTitle: 'REFEREE DASHBOARD', tabBarIcon: ({ color }) => <MaterialIcons size={24} name="home" color={color} /> }} />
      <Tabs.Screen name="assignments" options={{ title: 'Phân công', headerTitle: 'NHIỆM VỤ PHÂN CÔNG', tabBarIcon: ({ color }) => <MaterialIcons size={24} name="assignment-turned-in" color={color} /> }} />
      <Tabs.Screen name="leaderboard" options={{ title: 'Kết quả', headerTitle: 'KẾT QUẢ XẾP HẠNG', tabBarIcon: ({ color }) => <MaterialIcons size={24} name="emoji-events" color={color} /> }} />
      <Tabs.Screen name="notifications" options={{ title: 'Thông báo', headerTitle: 'THÔNG BÁO', tabBarIcon: ({ focused }) => <DockNotificationIcon focused={focused} count={unreadCount} /> }} />
      <Tabs.Screen name="profile" options={{ title: 'Cá nhân', headerTitle: 'CÁ NHÂN', tabBarIcon: ({ focused }) => <DockAvatarIcon focused={focused} avatarUri={user?.avatar} /> }} />
    </Tabs>
  );
}
