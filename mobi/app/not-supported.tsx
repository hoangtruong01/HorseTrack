import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/providers/auth-provider';
import { premiumColors, premiumRadius } from '@/components/ui/premium-tokens';
import { MaterialIcons } from '@expo/vector-icons';

export default function NotSupportedScreen() {
  const { logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.replace('/login');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <MaterialIcons name="desktop-windows" size={64} color={premiumColors.warning} style={{ marginBottom: 24 }} />
        <Text style={styles.title}>Nền tảng không hỗ trợ</Text>
        <Text style={styles.desc}>
          Ứng dụng Mobile chưa hỗ trợ chức năng dành cho quyền của bạn (Admin / Counter). Vui lòng sử dụng Web Dashboard để trải nghiệm đầy đủ tính năng.
        </Text>
        <TouchableOpacity style={styles.btn} onPress={handleLogout} activeOpacity={0.8}>
          <Text style={styles.btnText}>Đăng xuất</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: premiumColors.bg,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: premiumColors.text,
    textAlign: 'center',
    marginBottom: 16,
  },
  desc: {
    fontSize: 14,
    color: premiumColors.textSecondary,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
  },
  btn: {
    backgroundColor: premiumColors.brand,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: premiumRadius[8],
  },
  btnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16,
  },
});
