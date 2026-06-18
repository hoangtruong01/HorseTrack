import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { AppScreen, Section } from '@/components/ui/premium';
import { premiumColors, premiumSpacing, premiumRadius } from '@/components/ui/premium-tokens';
import { useAuth } from '@/providers/auth-provider';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const performLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      router.replace('/login');
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleLogout = () => {
    if (isLoggingOut) return;
    if (Platform.OS === 'web') {
      void performLogout();
      return;
    }
    Alert.alert('Đăng xuất', 'Bạn có chắc muốn đăng xuất?', [
      { text: 'Hủy', style: 'cancel' },
      { text: 'Đăng xuất', style: 'destructive', onPress: performLogout },
    ]);
  };

  const roleMap: Record<string, string> = {
    admin: 'Quản trị viên',
    owner: 'Chủ ngựa',
    jockey: 'Nài ngựa',
    referee: 'Trọng tài',
    spectator: 'Khán giả',
    counter_staff: 'Nhân viên quầy',
  };

  return (
    <AppScreen scroll>
      <View style={styles.content}>
        
        {/* ── Account Header ── */}
        <View style={styles.header}>
          <View style={styles.avatarWrap}>
            <MaterialIcons name="person" size={40} color={premiumColors.textMuted} />
          </View>
          <Text style={styles.name}>{user?.fullName || 'Người dùng'}</Text>
          <Text style={styles.email}>{user?.email}</Text>
          
          <View style={styles.rolesRow}>
            {user?.roles.map(r => (
              <View key={r} style={styles.roleBadge}>
                <Text style={styles.roleText}>{roleMap[r] || r}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* ── Information details ── */}
        <Section title="Thông tin cá nhân">
          <View style={styles.infoContainer}>
            <InfoRow icon="phone" label="Số điện thoại" value={user?.phone || 'Chưa cập nhật'} />
            <View style={styles.separator} />
            <InfoRow icon="location-on" label="Địa chỉ" value={user?.address || 'Chưa cập nhật'} />
            <View style={styles.separator} />
            <InfoRow icon="cake" label="Ngày sinh" value={user?.dob || 'Chưa cập nhật'} />
          </View>
        </Section>

        {/* ── Logout Action ── */}
        <TouchableOpacity 
          style={styles.logoutBtn} 
          onPress={handleLogout} 
          disabled={isLoggingOut}
          activeOpacity={0.7}
        >
          <MaterialIcons name="logout" size={20} color={premiumColors.danger} />
          <Text style={styles.logoutText}>Đăng xuất</Text>
        </TouchableOpacity>

      </View>
    </AppScreen>
  );
}

function InfoRow({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <MaterialIcons name={icon as any} size={20} color={premiumColors.textMuted} />
      <View style={styles.infoTextContainer}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: premiumSpacing[16],
    paddingTop: premiumSpacing[32],
    paddingBottom: premiumSpacing[48],
  },
  
  // ── Header ──
  header: {
    alignItems: 'center',
    marginBottom: premiumSpacing[32],
  },
  avatarWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: premiumColors.surface,
    borderWidth: 1,
    borderColor: premiumColors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: premiumSpacing[16],
  },
  name: {
    fontSize: 22,
    fontWeight: '800',
    color: premiumColors.text,
    marginBottom: 4,
  },
  email: {
    fontSize: 13,
    color: premiumColors.textSecondary,
    marginBottom: premiumSpacing[12],
  },
  rolesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: premiumSpacing[8],
  },
  roleBadge: {
    backgroundColor: premiumColors.surface2,
    borderWidth: 1,
    borderColor: premiumColors.border,
    borderRadius: premiumRadius[12],
    paddingHorizontal: premiumSpacing[12],
    paddingVertical: 6,
  },
  roleText: {
    color: premiumColors.text,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },

  // ── Info Card ──
  infoContainer: {
    backgroundColor: premiumColors.surface,
    borderRadius: premiumRadius[12],
    borderWidth: 1,
    borderColor: premiumColors.border,
    overflow: 'hidden',
  },
  separator: {
    height: 1,
    backgroundColor: premiumColors.border,
    marginLeft: 48, // Aligned with the text
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: premiumSpacing[16],
    gap: premiumSpacing[16],
  },
  infoTextContainer: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: premiumColors.textMuted,
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 14,
    color: premiumColors.text,
    fontWeight: '500',
  },

  // ── Logout Button ──
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: premiumSpacing[8],
    marginTop: premiumSpacing[24],
    paddingVertical: premiumSpacing[16],
    borderRadius: premiumRadius[8],
    borderWidth: 1,
    borderColor: premiumColors.danger + '40',
    backgroundColor: premiumColors.danger + '10',
  },
  logoutText: {
    color: premiumColors.danger,
    fontSize: 14,
    fontWeight: '700',
  },
});
