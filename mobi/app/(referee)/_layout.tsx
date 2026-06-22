import { Tabs, Stack, usePathname } from 'expo-router';
import { NativeTabs, Icon, Label } from 'expo-router/unstable-native-tabs';
import { Platform } from 'react-native';
import React from 'react';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useAuth } from '@/providers/auth-provider';
import { useThemeColors } from '@/components/ui/shared';
import { DockTabBar, useDockScreenOptions, DockAvatarIcon } from '@/components/ui/dock-tab-bar';
import { useColorScheme } from '@/hooks/use-color-scheme';

// Layout cho iOS - dùng NativeTabs (liquid glass effect)
// Chỉ 5 tab: index, assignments, judging, wallet, profile
// NativeTabs không tự render header nên ta dùng Stack.Screen để hiển thị Header từ RootLayout
function IOSRefereeLayout() {
  const theme = useThemeColors();
  const pathname = usePathname();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  // Tính toán headerTitle dựa vào route hiện tại
  let headerTitle = 'REFEREE DASHBOARD';
  if (pathname.includes('/assignments')) headerTitle = 'NHIỆM VỤ PHÂN CÔNG';
  else if (pathname.includes('/pre-race')) headerTitle = 'KIỂM TRA TRẬN ĐUA';
  else if (pathname.includes('/judging')) headerTitle = 'THẨM ĐỊNH KẾT QUẢ';
  else if (pathname.includes('/wallet')) headerTitle = 'VÍ ĐIỆN TỬ';
  else if (pathname.includes('/profile')) headerTitle = 'CÁ NHÂN';

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: headerTitle,
          headerStyle: {
            backgroundColor: isDark ? '#15151E' : '#FFFFFF',
          },
          headerTitleStyle: {
            color: theme.red,
            fontWeight: '800',
            fontSize: 17,
          },
          // Thêm border bottom cho header giống DockTabBar
          headerShadowVisible: true,
        }}
      />
      <NativeTabs
        // Props đúng theo NativeTabsProps
        iconColor={{ default: theme.textMuted as string, selected: theme.red as string }}
        minimizeBehavior="never"
      >
        {/* Tab 1: Trang chủ */}
        <NativeTabs.Trigger name="index">
          <Label hidden />
          <Icon sf={{ default: 'house', selected: 'house.fill' }} />
        </NativeTabs.Trigger>

        {/* Tab 2: Phân công */}
        <NativeTabs.Trigger name="assignments">
          <Label hidden />
          <Icon sf={{ default: 'list.bullet.rectangle', selected: 'list.bullet.rectangle.fill' }} />
        </NativeTabs.Trigger>

        {/* Tab 3: Thẩm định */}
        <NativeTabs.Trigger name="judging">
          <Label hidden />
          <Icon sf={{ default: 'hammer', selected: 'hammer.fill' }} />
        </NativeTabs.Trigger>

        {/* Tab 4: Kiểm tra */}
        <NativeTabs.Trigger name="pre-race">
          <Label hidden />
          <Icon sf={{ default: 'checklist', selected: 'checklist.checked' }} />
        </NativeTabs.Trigger>

        {/* Tab 5: Cá nhân */}
        <NativeTabs.Trigger name="profile">
          <Label hidden />
          <Icon sf={{ default: 'person.crop.circle', selected: 'person.crop.circle.fill' }} />
        </NativeTabs.Trigger>

        {/* Ẩn hoàn toàn các route phụ */}
        <NativeTabs.Trigger name="wallet" hidden />
        <NativeTabs.Trigger name="violations" hidden />
        <NativeTabs.Trigger name="results" hidden />
      </NativeTabs>
    </>
  );
}

// Layout cho Android/Web - dùng DockTabBar tuỳ chỉnh
// Chỉ 5 tab: index, assignments, judging, pre-race, profile
function DefaultRefereeLayout() {
  const dockOptions = useDockScreenOptions();
  const { user } = useAuth();

  return (
    <Tabs
      tabBar={(props) => <DockTabBar {...props} />}
      screenOptions={{ ...dockOptions }}
    >
      <Tabs.Screen name="index" options={{ title: 'Trang chủ', headerTitle: 'REFEREE DASHBOARD', tabBarIcon: ({ color }) => <MaterialIcons size={24} name="home" color={color} /> }} />
      <Tabs.Screen name="assignments" options={{ title: 'Phân công', headerTitle: 'NHIỆM VỤ PHÂN CÔNG', tabBarIcon: ({ color }) => <MaterialIcons size={24} name="assignment-turned-in" color={color} /> }} />
      <Tabs.Screen name="judging" options={{ title: 'Thẩm định', headerTitle: 'THẨM ĐỊNH KẾT QUẢ', tabBarIcon: ({ color }) => <MaterialIcons size={24} name="gavel" color={color} /> }} />
      <Tabs.Screen name="pre-race" options={{ title: 'Kiểm tra', headerTitle: 'KIỂM TRA TRẬN ĐUA', tabBarIcon: ({ color }) => <MaterialIcons size={24} name="checklist" color={color} /> }} />
      <Tabs.Screen name="profile" options={{ title: 'Cá nhân', headerTitle: 'CÁ NHÂN', tabBarIcon: ({ focused }) => <DockAvatarIcon focused={focused} avatarUri={user?.avatar} /> }} />

      {/* Ẩn các trang không hiện trong tab bar */}
      <Tabs.Screen name="wallet" options={{ href: null, tabBarItemStyle: { display: 'none' }, title: 'Ví', headerTitle: 'VÍ ĐIỆN TỬ' }} />
      <Tabs.Screen name="violations" options={{ href: null, tabBarItemStyle: { display: 'none' }, title: 'Vi phạm', headerTitle: 'GHI NHẬN VI PHẠM' }} />
      <Tabs.Screen name="results" options={{ href: null, tabBarItemStyle: { display: 'none' }, title: 'Kết quả', headerTitle: 'KẾT QUẢ TRẬN ĐUA' }} />
    </Tabs>
  );
}

export default function RefereeLayout() {
  if (Platform.OS === 'ios') {
    return <IOSRefereeLayout />;
  }
  return <DefaultRefereeLayout />;
}
