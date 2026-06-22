import React, { useState, useEffect } from 'react';
import { ScrollView, View, Text, StyleSheet, TouchableOpacity, Alert, Platform, Image, ActivityIndicator, Modal, Dimensions } from 'react-native';
import { useRouter, Stack, Tabs, useSegments } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '@/providers/auth-provider';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { usersApi, uploadsApi, rewardPointLedgerApi } from '@/lib/api-client';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useThemeColors } from '@/components/ui/shared';

const { width } = Dimensions.get('window');

// Background Pattern
const GridBackground = ({ isDark }: { isDark: boolean }) => {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <View style={{ flex: 1, backgroundColor: isDark ? '#09090B' : '#F4F4F5' }} />
    </View>
  );
};

export default function ProfileScreen() {
  const { user, logout, updateUser } = useAuth();
  const router = useRouter();
  const segments = useSegments();
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = useThemeColors();
  const styles = React.useMemo(() => getStyles(isDark, theme, insets), [isDark, theme, insets]);
  
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isAvatarModalVisible, setIsAvatarModalVisible] = useState(false);

  // Wallet state
  const [balance, setBalance] = useState(0);
  const [loadingStats, setLoadingStats] = useState(true);

  const hasNotification = true;

  // Check if current layout is owner or spectator to show wallet
  const currentGroup = segments[0] as string;
  const showWallet = currentGroup === '(owner)' || currentGroup === '(spectator)';
  
  useEffect(() => {
    if (showWallet) {
      rewardPointLedgerApi.myBalance()
        .then((balRes: any) => {
          setBalance(balRes.balance || 0);
        })
        .catch(() => { })
        .finally(() => setLoadingStats(false));
    } else {
      setLoadingStats(false);
    }
  }, [showWallet]);

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

  const pickAndUploadAvatar = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (result.canceled || !result.assets[0]) return;

      const asset = result.assets[0];
      setIsUploading(true);

      const formData = new FormData();
      const filename = asset.uri.split('/').pop() || 'avatar.jpg';
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : `image`;

      formData.append('file', {
        uri: asset.uri,
        name: filename,
        type,
      } as any);

      const uploadRes = await uploadsApi.uploadImage(formData);
      const imageUrl = uploadRes.url;

      const userId = (user as any)?._id || (user as any)?.id;
      if (userId) {
        await usersApi.update(userId, { avatar: imageUrl });
        if (updateUser) {
          updateUser({ avatar: imageUrl });
        }
        Alert.alert('Thành công', 'Cập nhật ảnh đại diện thành công');
      }
    } catch (error: any) {
      Alert.alert('Lỗi', error.message || 'Không thể tải ảnh lên');
    } finally {
      setIsUploading(false);
    }
  };

  const roleMap: Record<string, string> = {
    admin: 'Quản trị viên',
    owner: 'Chủ ngựa',
    jockey: 'Nài ngựa',
    referee: 'Trọng tài',
    spectator: 'Khán giả',
    counter_staff: 'Nhân viên quầy',
  };

  const primaryRole = user?.roles?.[0] || 'spectator';
  const displayRole = roleMap[primaryRole] || primaryRole;

  const handleWalletPress = () => {
    if (currentGroup === '(owner)') {
      router.push('/(owner)/wallet');
    } else if (currentGroup === '(spectator)') {
      router.push('/(spectator)/wallet');
    }
  };

  return (
    <View style={styles.container}>
      {/* Ẩn Header mặc định */}
      <Stack.Screen options={{ headerShown: false }} />
      <Tabs.Screen options={{ headerShown: false }} />

      <GridBackground isDark={isDark} />

      {/* Custom Sleek Header */}
      <View style={styles.customHeader}>
        <View style={styles.headerSpacer} />
        <Text style={styles.headerTitle}>CÁ NHÂN</Text>
        <TouchableOpacity 
          style={styles.settingsBtn} 
          onPress={() => router.push('/settings')}
          activeOpacity={0.8}
        >
          <MaterialIcons name="settings" size={22} color={theme.textPrimary} />
          {hasNotification && <View style={styles.notificationBadge} />}
        </TouchableOpacity>
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent} 
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.mainWrapperCard}>
          {/* Avatar Section */}
          <View style={styles.avatarSection}>
            <View style={styles.avatarWrap}>
              <TouchableOpacity onPress={() => setIsAvatarModalVisible(true)} disabled={isUploading}>
                {user?.avatar ? (
                  <Image source={{ uri: user.avatar }} style={styles.avatarImage} />
                ) : (
                  <View style={styles.avatarPlaceholder}>
                    <MaterialIcons name="person" size={50} color="#E10600" />
                  </View>
                )}
                {isUploading && (
                  <View style={[StyleSheet.absoluteFill, styles.avatarLoading]}>
                    <ActivityIndicator color="#FFF" />
                  </View>
                )}
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.cameraBadge} onPress={pickAndUploadAvatar} disabled={isUploading}>
                <MaterialIcons name="camera-alt" size={14} color="#FFF" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.nameRow}>
              <Text style={styles.nameText}>{user?.fullName || 'Người dùng'}</Text>
              <View style={styles.roleBadge}>
                <MaterialIcons name="verified-user" size={12} color={theme.textMuted} />
                <Text style={styles.roleText}>{displayRole}</Text>
              </View>
            </View>
            <Text style={styles.emailText}>{user?.email}</Text>
          </View>

          {/* Info Card with Edit Profile */}
          <View style={styles.carbonCard}>
            <Text style={styles.cardHeader}>HỒ SƠ CÁ NHÂN</Text>
            
            <View style={styles.infoRow}>
              <MaterialIcons name="phone" size={18} color={theme.textMuted} />
              <Text style={styles.infoText}>Số điện thoại: <Text style={styles.infoValue}>{user?.phone || 'Chưa cập nhật'}</Text></Text>
            </View>
            
            <View style={styles.infoRow}>
              <MaterialIcons name="location-on" size={18} color={theme.textMuted} />
              <Text style={styles.infoText}>Địa chỉ: <Text style={styles.infoValue}>{user?.address || 'Nhấn để cập nhật'}</Text></Text>
            </View>
            
            <View style={styles.infoRow}>
              <MaterialIcons name="cake" size={18} color={theme.textMuted} />
              <Text style={styles.infoText}>Ngày sinh: <Text style={styles.infoValue}>{user?.dob || 'Nhấn để cập nhật'}</Text></Text>
            </View>

            <TouchableOpacity style={styles.editBtn} activeOpacity={0.8}>
              <Text style={styles.editBtnText}>SỬA HỒ SƠ</Text>
            </TouchableOpacity>
          </View>

          {/* Wallet */}
          {showWallet && (
            <TouchableOpacity 
              style={styles.walletCard} 
              activeOpacity={0.9}
              onPress={handleWalletPress}
            >
              <Text style={styles.cardHeader}>VÍ ĐIỆN TỬ</Text>
              <View style={styles.walletInner}>
                <View style={styles.walletIconWrap}>
                  <MaterialIcons name="account-balance-wallet" size={24} color={theme.textMuted} />
                </View>
                <View>
                  <Text style={styles.walletSub}>SỐ DƯ VÍ</Text>
                  <Text style={styles.walletBalance}>
                    {loadingStats ? '...' : balance.toLocaleString()} <Text style={styles.ptsText}>PTS</Text>
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          )}

          {/* Logout */}
          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} disabled={isLoggingOut} activeOpacity={0.7}>
            <MaterialIcons name="logout" size={20} color="#EF4444" />
            <Text style={styles.logoutBtnText}>Đăng xuất</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Avatar Modal */}
      <Modal visible={isAvatarModalVisible} transparent={true} animationType="fade" onRequestClose={() => setIsAvatarModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={() => setIsAvatarModalVisible(false)} />
          <View style={styles.modalContent}>
            {user?.avatar ? (
              <Image source={{ uri: user.avatar }} style={styles.modalAvatarImage} resizeMode="cover" />
            ) : (
              <MaterialIcons name="person" size={160} color="#E10600" />
            )}
            <TouchableOpacity style={styles.modalCloseBtn} onPress={() => setIsAvatarModalVisible(false)}>
              <MaterialIcons name="close" size={24} color="#FFF" />
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </View>
  );
}

const getStyles = (isDark: boolean, theme: any, insets: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: isDark ? '#09090B' : '#F4F4F5',
  },
  
  // Custom Header
  customHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Math.max(insets.top, 16),
    paddingBottom: 12,
    zIndex: 10,
    backgroundColor: isDark ? 'rgba(9, 9, 11, 0.85)' : 'rgba(244, 244, 245, 0.85)',
  },
  headerSpacer: {
    width: 36, // To balance the gear icon
  },
  headerTitle: {
    color: theme.textPrimary,
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  settingsBtn: {
    width: 36,
    height: 36,
    borderRadius: 12, // Squircle-ish
    backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationBadge: {
    position: 'absolute',
    top: 6,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E10600',
    borderWidth: 1.5,
    borderColor: isDark ? '#09090B' : '#F4F4F5',
  },

  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 60, // Space for the overlapping avatar
    paddingBottom: 110,
  },

  // Main Wrapper Card
  mainWrapperCard: {
    backgroundColor: isDark ? '#18181B' : '#FFFFFF',
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 100, // Padding bottom để tránh bị Dock Tab Bar che khuất
    borderRadius: 24,
    borderWidth: 1,
    borderColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
  },

  // Avatar Section
  avatarSection: {
    alignItems: 'center',
    marginBottom: 24,
    marginTop: -50, // Offset to overlap the top border of the wrapper card
  },
  avatarWrap: {
    position: 'relative',
    marginBottom: 16,
  },
  avatarImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#E10600',
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#E10600',
    backgroundColor: isDark ? '#121214' : '#F4F4F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarLoading: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#E10600',
    borderWidth: 2,
    borderColor: isDark ? '#18181B' : '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  nameText: {
    color: theme.textPrimary,
    fontSize: 22,
    fontWeight: '900',
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  roleText: {
    color: theme.textMuted,
    fontSize: 12,
    fontWeight: '600',
  },
  emailText: {
    color: theme.textMuted,
    fontSize: 14,
  },

  // Carbon Card (Hồ sơ)
  carbonCard: {
    backgroundColor: isDark ? '#121214' : '#FAFAFA',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
    marginBottom: 16,
  },
  cardHeader: {
    color: theme.textPrimary,
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  infoText: {
    color: theme.textMuted,
    fontSize: 14,
  },
  infoValue: {
    color: theme.textPrimary,
    fontWeight: '500',
  },
  editBtn: {
    marginTop: 12,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#E10600',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  editBtnText: {
    color: '#E10600',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.5,
  },

  // Wallet Card (Neon Glow)
  walletCard: {
    backgroundColor: isDark ? '#121214' : '#FAFAFA',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(225,6,0,0.15)',
    marginBottom: 16,
    // Simulate Neon glow
    shadowColor: '#E10600',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: isDark ? 0.3 : 0.15,
    shadowRadius: 10,
    elevation: 5,
  },
  walletInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  walletIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  walletSub: {
    color: theme.textMuted,
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 2,
  },
  walletBalance: {
    color: theme.textPrimary,
    fontSize: 28,
    fontWeight: '900',
  },
  ptsText: {
    color: '#E10600',
    fontSize: 16,
    fontWeight: '800',
  },

  // Logout
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.2)',
    marginTop: 8,
  },
  logoutBtnText: {
    color: '#EF4444',
    fontSize: 14,
    fontWeight: '700',
  },

  // Modal
  modalOverlay: { 
    flex: 1, 
    backgroundColor: isDark ? 'rgba(0,0,0,0.85)' : 'rgba(0,0,0,0.6)', 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  modalContent: { 
    width: width * 0.8, 
    aspectRatio: 1, 
    backgroundColor: isDark ? '#18181B' : '#FFFFFF', 
    borderRadius: 24, 
    overflow: 'hidden', 
    alignItems: 'center', 
    justifyContent: 'center', 
    borderWidth: 1, 
    borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  modalAvatarImage: { 
    width: '100%', 
    height: '100%' 
  },
  modalCloseBtn: { 
    position: 'absolute', 
    top: 16, 
    right: 16, 
    backgroundColor: 'rgba(0,0,0,0.6)', 
    borderRadius: 20, 
    padding: 6 
  },
});
