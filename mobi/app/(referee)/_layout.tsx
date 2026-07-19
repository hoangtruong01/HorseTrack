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
      pathname.startsWith('/pre-race') ||
      pathname.startsWith('/judging') ||
      pathname.startsWith('/violations') ||
      pathname.startsWith('/results')
    ) {
      setLocalPath(pathname);
    }
  }, [pathname]);

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

  // Tính toán headerTitle dựa vào localPath thay vì pathname
  let headerTitle = 'REFEREE DASHBOARD';
  if (localPath.includes('/assignments')) headerTitle = 'NHIỆM VỤ PHÂN CÔNG';
  else if (localPath.includes('/pre-race')) headerTitle = 'KIỂM TRA TRẬN ĐUA';
  else if (localPath.includes('/judging')) headerTitle = 'THẨM ĐỊNH KẾT QUẢ';
  else if (localPath.includes('/wallet')) headerTitle = 'VÍ ĐIỆN TỬ';
  else if (localPath.includes('/profile')) headerTitle = 'CÁ NHÂN';

  return (
    <Tabs
      tabBar={(props) => <DockTabBar {...props} />}
      screenOptions={{ ...dockOptions }}
    >
      <Tabs.Screen name="index" options={{ title: 'Trang chủ', headerTitle: 'REFEREE DASHBOARD', tabBarIcon: ({ color }) => <MaterialIcons size={24} name="home" color={color} /> }} />
      <Tabs.Screen name="assignments" options={{ title: 'Phân công', headerTitle: 'NHIỆM VỤ PHÂN CÔNG', tabBarIcon: ({ color }) => <MaterialIcons size={24} name="assignment-turned-in" color={color} /> }} />
      <Tabs.Screen name="judging" options={{ title: 'Thẩm định', headerTitle: 'THẨM ĐỊNH KẾT QUẢ', tabBarIcon: ({ color }) => <MaterialIcons size={24} name="gavel" color={color} /> }} />
      <Tabs.Screen name="pre-race" options={{ title: 'Kiểm tra', headerTitle: 'KIỂM TRA TRẬN ĐUA', tabBarIcon: ({ color }) => <MaterialIcons size={24} name="checklist" color={color} /> }} />
      <Tabs.Screen name="notifications" options={{ title: 'Thông báo', headerTitle: 'THÔNG BÁO', tabBarIcon: ({ focused }) => <DockNotificationIcon focused={focused} count={unreadCount} /> }} />
      <Tabs.Screen name="profile" options={{ headerShown: false, title: 'Cá nhân', headerTitle: 'CÁ NHÂN', tabBarIcon: ({ focused }) => <DockAvatarIcon focused={focused} avatarUri={user?.avatar} /> }} />

      {/* Ẩn các trang không hiện trong tab bar */}
      <Tabs.Screen name="violations" options={{ href: null, tabBarItemStyle: { display: 'none' }, title: 'Vi phạm', headerTitle: 'GHI NHẬN VI PHẠM' }} />
      <Tabs.Screen name="results" options={{ href: null, tabBarItemStyle: { display: 'none' }, title: 'Kết quả', headerTitle: 'KẾT QUẢ TRẬN ĐUA' }} />
    </Tabs>
  );
}
