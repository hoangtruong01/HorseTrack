/**
 * Shared Floating Dock Tab Bar - Dark Facebook-style
 * Dùng chung cho tất cả phân hệ: admin, jockey, owner, referee, counter, spectator, tabs
 */
/**
 * Shared Floating Dock Tab Bar - Dark Facebook-style
 * Dùng chung cho tất cả phân hệ: admin, jockey, owner, referee, counter, spectator, tabs
 */
import React from 'react';
import { View, Text, Image, StyleSheet, Platform, TouchableOpacity, Animated } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';

// Component icon bọc hiệu ứng Squircle khi active
export function DockTabIcon({
  focused,
  children,
}: {
  focused: boolean;
  children: React.ReactNode;
}) {
  const isDark = useColorScheme() === 'dark';
  const dockStyles = getDockStyles(isDark);
  return (
    <View style={[dockStyles.iconWrapper, focused && dockStyles.iconWrapperActive]}>
      {children}
    </View>
  );
}

// Component tab Avatar cho profile
export function DockAvatarIcon({
  focused,
  avatarUri,
}: {
  focused: boolean;
  avatarUri?: string | null;
}) {
  const isDark = useColorScheme() === 'dark';
  const dockStyles = getDockStyles(isDark);
  return (
    <DockTabIcon focused={focused}>
      {avatarUri ? (
        <Image
          source={{ uri: avatarUri }}
          style={[dockStyles.avatar, { borderColor: focused ? '#E10600' : '#ffffff' }]}
        />
      ) : (
        <View style={[dockStyles.avatarPlaceholder, { borderColor: focused ? '#E10600' : '#ffffff' }]}>
          <MaterialIcons size={20} name="person" color="#555" />
        </View>
      )}
    </DockTabIcon>
  );
}

// Component tab Notification với badge đỏ
export function DockNotificationIcon({
  focused,
  count,
}: {
  focused: boolean;
  count?: number;
}) {
  const isDark = useColorScheme() === 'dark';
  const dockStyles = getDockStyles(isDark);
  const inactiveColor = isDark ? '#b0b3b8' : '#65676B';
  const activeColor = isDark ? '#ffffff' : '#E10600';
  return (
    <DockTabIcon focused={focused}>
      <View>
        <MaterialIcons size={26} name="notifications" color={focused ? activeColor : inactiveColor} />
        {count != null && count > 0 && (
          <View style={dockStyles.badge}>
            <Text style={dockStyles.badgeText}>{count > 99 ? '99+' : String(count)}</Text>
          </View>
        )}
      </View>
    </DockTabIcon>
  );
}

// Hook trả về screenOptions chuẩn cho Floating Dock
export function useDockScreenOptions() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const t = Colors[colorScheme ?? 'dark'];
  const insets = useSafeAreaInsets();
  const dockBottom = Platform.OS === 'ios' ? Math.max(insets.bottom, 16) : 16;

  return {
    animation: 'shift' as const, // Added slide/shift animation for tab screens
    tabBarShowLabel: false,
    tabBarActiveTintColor: isDark ? '#ffffff' : '#E10600',
    tabBarInactiveTintColor: isDark ? '#b0b3b8' : '#65676B',
    headerShown: true,
    headerStyle: {
      backgroundColor: isDark ? '#15151E' : '#FFFFFF',
      borderBottomWidth: 1,
      borderBottomColor: isDark ? '#303037' : '#D3DADE',
    },
    headerTitleStyle: {
      color: t.text,
      fontWeight: '900' as const,
      fontSize: 15,
      letterSpacing: 1,
    },
    tabBarStyle: {
      position: 'absolute' as const,
      bottom: dockBottom,
      left: 16,
      right: 16,
      height: 60,
      minHeight: 60,
      maxHeight: 60,
      backgroundColor: isDark ? '#242526' : '#FFFFFF',
      borderRadius: 30,
      borderTopWidth: 0,
      paddingHorizontal: 8,
      paddingBottom: 0,
      paddingTop: 0,
      overflow: 'hidden' as const,
      elevation: 12,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.35,
      shadowRadius: 12,
    },
    // Kẹp chặt chiều cao của mỗi tab item, tránh React Navigation tự chèn padding Safe Area
    tabBarItemStyle: {
      height: 60,
      paddingTop: 0,
      paddingBottom: 0,
      justifyContent: 'center' as const,
      alignItems: 'center' as const,
    },
    // Cấu hình lại container chứa icon của React Navigation để căn giữa tuyệt đối
    tabBarIconStyle: {
      width: 60,
      height: 44,
      justifyContent: 'center' as const,
      alignItems: 'center' as const,
      alignSelf: 'center' as const,
      marginTop: 0,
      marginBottom: 0,
      top: 2.5, // Nudge nhẹ xuống dưới để căn chỉnh trên-dưới hoàn hảo
    },
  };
}

export const getDockStyles = (isDark: boolean) => StyleSheet.create({
  tabBarContainer: {
    flexDirection: 'row' as const,
    position: 'absolute' as const,
    alignSelf: 'center' as const,
    height: 60,
    backgroundColor: isDark ? '#242526' : '#FFFFFF',
    borderRadius: 30,
    borderWidth: 0,
    elevation: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    alignItems: 'center' as const,
    paddingHorizontal: 8,
  },
  tabItem: {
    flex: 1,
    height: 60,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
  container: {
    width: 60,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconWrapper: {
    width: 60, // Rộng hơn giống Facebook (Rounded Rectangle)
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 22, // Bo góc mềm mại tương ứng với chiều rộng mới
  },
  iconWrapperActive: {
    backgroundColor: isDark ? '#3a3b3c' : '#F0F2F5',
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -4,
    backgroundColor: '#e41e3f',
    borderRadius: 10,
    minWidth: 17,
    height: 17,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: isDark ? '#242526' : '#FFFFFF',
    paddingHorizontal: 2,
  },
  badgeText: {
    color: '#ffffff',
    fontSize: 9,
    fontWeight: 'bold' as const,
    lineHeight: 12,
  },
  avatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 1.5,
  },
  avatarPlaceholder: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 1.5,
    backgroundColor: '#e4e6eb',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

// Shared Custom Animated Bottom Tab Bar
export function DockTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const paddingBottom = Platform.OS === 'ios' ? Math.max(insets.bottom, 16) : 16;
  const TAB_WIDTH = 60;
  const isDark = useColorScheme() === 'dark';
  const dockStyles = getDockStyles(isDark);
  const activeColor = isDark ? '#ffffff' : '#E10600';
  const inactiveColor = isDark ? '#b0b3b8' : '#65676B';

  const visibleRoutes = state.routes.filter(route => {
    const { options } = descriptors[route.key];
    if ((options as any).href === null) return false;
    if ((options.tabBarItemStyle as any)?.display === 'none') return false;
    return true;
  });

  const slideAnim = React.useRef(new Animated.Value(0)).current;
  const currentVisibleIndex = visibleRoutes.findIndex(r => r.key === state.routes[state.index].key);

  React.useEffect(() => {
    if (currentVisibleIndex >= 0) {
      Animated.spring(slideAnim, {
        toValue: currentVisibleIndex * TAB_WIDTH,
        useNativeDriver: true,
        tension: 60,
        friction: 8,
      }).start();
    }
  }, [currentVisibleIndex, slideAnim]);

  return (
    <View style={[dockStyles.tabBarContainer, { bottom: paddingBottom, width: visibleRoutes.length * TAB_WIDTH + 16 }]}>
      <Animated.View
        style={[
          dockStyles.iconWrapperActive,
          {
            position: 'absolute',
            width: TAB_WIDTH,
            height: 44,
            borderRadius: 22,
            left: 8,
            transform: [{ translateX: slideAnim }],
          }
        ]}
      />

      {visibleRoutes.map((route, index) => {
        const { options } = descriptors[route.key];
        const isFocused = currentVisibleIndex === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name, route.params);
          }
        };

        const onLongPress = () => {
          navigation.emit({
            type: 'tabLongPress',
            target: route.key,
          });
        };

        return (
          <TouchableOpacity
            key={route.key}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            testID={(options as any).tabBarTestID}
            onPress={onPress}
            onLongPress={onLongPress}
            style={dockStyles.tabItem}
          >
            {options.tabBarIcon
              ? options.tabBarIcon({
                focused: isFocused,
                color: isFocused ? activeColor : inactiveColor,
                size: 24,
              })
              : <Text style={{ color: isFocused ? activeColor : inactiveColor }}>{options.title}</Text>}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
