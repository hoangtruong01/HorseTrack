import { Tabs, useRouter } from 'expo-router';
import React from 'react';
import { View, TouchableOpacity, Image, Alert } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { premiumColors } from '@/components/ui/premium-tokens';
import { useAuth } from '@/providers/auth-provider';
import { DockTabBar, useDockScreenOptions, DockAvatarIcon } from '@/components/ui/dock-tab-bar';

export default function OwnerLayout() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const t = Colors[colorScheme ?? 'dark'];
  const { user } = useAuth();
  const router = useRouter();
  const dockOptions = useDockScreenOptions();

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
        onPress={() => router.push('/(owner)/profile' as any)}
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
      screenOptions={{ ...dockOptions, headerShown: false }}
    >
      <Tabs.Screen name="index" options={{ title: 'Trang chủ', headerTitle: 'HORSETRACK', headerRight: renderHeaderRight, tabBarIcon: ({ color }) => <MaterialIcons size={24} name="home" color={color} /> }} />
      <Tabs.Screen name="horses" options={{ title: 'Chiến mã', headerTitle: 'CHIẾN MÃ', tabBarIcon: ({ color }) => <MaterialIcons size={24} name="pets" color={color} /> }} />
      <Tabs.Screen name="registrations" options={{ title: 'Giải đấu', headerTitle: 'GIẢI ĐẤU', tabBarIcon: ({ color }) => <MaterialIcons size={24} name="emoji-events" color={color} /> }} />
      <Tabs.Screen name="invitations" options={{ title: 'Mời Jockey', headerTitle: 'MỜI JOCKEY', tabBarIcon: ({ color }) => <MaterialIcons size={24} name="person-add" color={color} /> }} />
      <Tabs.Screen name="notifications" options={{ title: 'Thông báo', headerTitle: 'THÔNG BÁO', tabBarIcon: ({ color }) => <MaterialIcons size={24} name="notifications" color={color} /> }} />
      <Tabs.Screen name="profile" options={{ title: 'Cá nhân', headerTitle: 'CÁ NHÂN', tabBarIcon: ({ focused }) => <DockAvatarIcon focused={focused} avatarUri={user?.avatar} /> }} />
      <Tabs.Screen name="results" options={{ href: null, title: 'Kết quả', headerTitle: 'KẾT QUẢ THI ĐẤU' }} />
      <Tabs.Screen name="rankings" options={{ href: null, title: 'Bảng xếp hạng', headerTitle: 'BẢNG XẾP HẠNG' }} />
      <Tabs.Screen name="races" options={{ href: null, title: 'Đăng ký thi đấu', headerTitle: 'ĐĂNG KÝ THI ĐẤU' }} />
    </Tabs>
  );
}
