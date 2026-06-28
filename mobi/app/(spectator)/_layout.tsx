import { Tabs, useRouter } from 'expo-router';
import React from 'react';
import { View, TouchableOpacity, Image, Alert } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuth } from '@/providers/auth-provider';
import { DockTabBar, useDockScreenOptions, DockAvatarIcon } from '@/components/ui/dock-tab-bar';

export default function SpectatorLayout() {
  const colorScheme = useColorScheme();
  const t = Colors[colorScheme ?? 'dark'];
  const { user } = useAuth();
  const router = useRouter();
  const dockOptions = useDockScreenOptions();

  const renderHeaderRight = () => (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16, paddingRight: 16 }}>
      <TouchableOpacity
        activeOpacity={0.7}
        style={{ position: 'relative' }}
        onPress={() => router.push('/(spectator)/notifications' as any)}
      >
        <View style={{ position: 'relative', padding: 4 }}>
          <MaterialIcons name="notifications-none" size={24} color={t.text} />
        </View>
      </TouchableOpacity>
      <TouchableOpacity 
        style={{ width: 36, height: 36, borderRadius: 18, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.2)', alignItems: 'center', justifyContent: 'center' }} 
        onPress={() => router.push('/(spectator)/profile' as any)}
        activeOpacity={0.7}
      >
        {user?.avatar ? (
          <Image source={{ uri: user.avatar }} style={{ width: '100%', height: '100%', borderRadius: 18 }} />
        ) : (
          <View style={{ width: '100%', height: '100%', borderRadius: 18, backgroundColor: '#202633', alignItems: 'center', justifyContent: 'center' }}>
            <MaterialIcons name="person" size={20} color="#FFFFFF" />
          </View>
        )}
      </TouchableOpacity>
    </View>
  );

  return (
    <Tabs 
      tabBar={(props) => <DockTabBar {...props} />}
      screenOptions={{ ...dockOptions }}
    >
      <Tabs.Screen name="index" options={{ title: 'Trang chủ', headerShown: false, tabBarIcon: ({ color }) => <MaterialIcons size={24} name="home" color={color} /> }} />
      <Tabs.Screen name="tournaments" options={{ title: 'Giải đấu', headerShown: false, tabBarIcon: ({ color }) => <MaterialIcons size={24} name="emoji-events" color={color} /> }} />
      <Tabs.Screen name="races" options={{ href: null }} />
      <Tabs.Screen name="predictions" options={{ href: null }} />
      <Tabs.Screen name="rankings" options={{ title: 'Xếp hạng', headerShown: false, tabBarIcon: ({ color }) => <MaterialIcons size={24} name="military-tech" color={color} /> }} />
      <Tabs.Screen name="wallet" options={{ href: null, title: 'Ví điểm', headerShown: false }} />
      <Tabs.Screen name="notifications" options={{ title: 'Thông báo', headerShown: false, tabBarIcon: ({ color }) => <MaterialIcons size={24} name="notifications-none" color={color} /> }} />
      <Tabs.Screen name="profile" options={{ title: 'Cá nhân', headerShown: false, tabBarIcon: ({ focused }) => <DockAvatarIcon focused={focused} avatarUri={user?.avatar} /> }} />
      <Tabs.Screen name="race/[id]" options={{ href: null, headerShown: false }} />
    </Tabs>
  );
}
