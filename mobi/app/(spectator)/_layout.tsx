import { Tabs, useRouter } from 'expo-router';
import React from 'react';
import { View, TouchableOpacity, Image, Alert } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { premiumColors } from '@/components/ui/premium-tokens';
import { useAuth } from '@/providers/auth-provider';
export default function SpectatorLayout() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const t = Colors[colorScheme ?? 'dark'];
  const { user } = useAuth();
  const router = useRouter();

  const renderHeaderRight = () => (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16, paddingRight: 16 }}>
      <TouchableOpacity
        activeOpacity={0.7}
        style={{ position: 'relative' }}
        onPress={() => Alert.alert('Thông báo', 'Tính năng thông báo đang được phát triển.', [{ text: 'OK' }])}
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
    <Tabs screenOptions={{
      tabBarActiveTintColor: t.tint,
      tabBarInactiveTintColor: t.tabIconDefault,
      headerShown: true,
      headerStyle: { backgroundColor: isDark ? premiumColors.headerBg : '#FFFFFF', borderBottomWidth: 1, borderBottomColor: isDark ? premiumColors.headerBorder : '#D3DADE' },
      headerTitleStyle: { color: t.text, fontWeight: '900', fontSize: 15, letterSpacing: 1 },
      tabBarStyle: { backgroundColor: isDark ? premiumColors.headerBg : '#FFFFFF', borderTopWidth: 1, borderTopColor: isDark ? premiumColors.headerBorder : '#D3DADE', height: 60, paddingBottom: 8, paddingTop: 8 },
    }}>
      <Tabs.Screen name="index" options={{ title: 'Trang chủ', headerTitle: 'HORSETRACK', headerRight: renderHeaderRight, tabBarIcon: ({ color }) => <MaterialIcons size={24} name="home" color={color} /> }} />
      <Tabs.Screen name="tournaments" options={{ title: 'Giải đấu', headerShown: false, tabBarIcon: ({ color }) => <MaterialIcons size={24} name="emoji-events" color={color} /> }} />
      <Tabs.Screen name="races" options={{ href: null }} />
      <Tabs.Screen name="predictions" options={{ href: null }} />
      <Tabs.Screen name="rankings" options={{ title: 'Xếp hạng', headerShown: false, tabBarIcon: ({ color }) => <MaterialIcons size={24} name="military-tech" color={color} /> }} />
      <Tabs.Screen name="wallet" options={{ title: 'Ví điểm', headerTitle: 'VÍ ĐIỂM', tabBarIcon: ({ color }) => <MaterialIcons size={24} name="account-balance-wallet" color={color} /> }} />
      <Tabs.Screen name="profile" options={{ title: 'Cá nhân', headerTitle: 'CÁ NHÂN', tabBarIcon: ({ color }) => <MaterialIcons size={24} name="person" color={color} /> }} />
      <Tabs.Screen name="race/[id]" options={{ href: null, headerTitle: 'CHI TIẾT TRẬN ĐUA' }} />
    </Tabs>
  );
}
