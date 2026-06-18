import { Tabs } from 'expo-router';
import React from 'react';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { premiumColors } from '@/components/ui/premium-tokens';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const themeColors = Colors[colorScheme ?? 'dark'];

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: themeColors.tint,
        tabBarInactiveTintColor: themeColors.tabIconDefault,
        headerShown: true,
        headerStyle: {
          backgroundColor: colorScheme === 'dark' ? premiumColors.headerBg : '#FFFFFF',
          borderBottomWidth: 1,
          borderBottomColor: colorScheme === 'dark' ? premiumColors.headerBorder : '#D3DADE',
        },
        headerTitleStyle: {
          color: themeColors.text,
          fontWeight: '900',
          fontSize: 16,
          letterSpacing: 1,
        },
        tabBarStyle: {
          backgroundColor: colorScheme === 'dark' ? premiumColors.headerBg : '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: colorScheme === 'dark' ? premiumColors.headerBorder : '#D3DADE',
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
      }}>
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
        name="wallet"
        options={{
          title: 'Dự Đoán',
          headerTitle: 'VÍ ĐIỂM & DỰ ĐOÁN',
          tabBarIcon: ({ color }) => <MaterialIcons size={24} name="account-balance-wallet" color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Cá Nhân',
          headerTitle: 'HỒ SƠ HỘI VIÊN',
          tabBarIcon: ({ color }) => <MaterialIcons size={24} name="person" color={color} />,
        }}
      />
    </Tabs>
  );
}
