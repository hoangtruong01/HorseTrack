import React, { useState, useEffect } from 'react';
import { ScrollView, View, Text, StyleSheet, TouchableOpacity, Alert, Platform, Image, ActivityIndicator, Modal, Dimensions, TextInput, Keyboard, TouchableWithoutFeedback, KeyboardAvoidingView, Animated, PanResponder } from 'react-native';
import { useRouter, Stack, Tabs } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '@/providers/auth-provider';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { refereeAssignmentsApi, usersApi, uploadsApi, rewardPointLedgerApi } from '@/lib/api-client';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useThemeColors, formatDate } from '@/components/ui/shared';

const { width } = Dimensions.get('window');

// Background Pattern
const GridBackground = ({ isDark }: { isDark: boolean }) => {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <View style={{ flex: 1, backgroundColor: isDark ? '#09090B' : '#F4F4F5' }} />
    </View>
  );
};

export default function RefereeProfile() {
  const { user, logout, updateUser } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = useThemeColors();
  const styles = React.useMemo(() => getStyles(isDark, theme, insets), [isDark, theme, insets]);

  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isAvatarModalVisible, setIsAvatarModalVisible] = useState(false);

  // Edit Profile modal state
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editFullName, setEditFullName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [editDob, setEditDob] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const translateY = React.useRef(new Animated.Value(0)).current;
  const keyboardHeight = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isEditModalVisible) {
      translateY.setValue(0);
      keyboardHeight.setValue(0);
    }
  }, [isEditModalVisible]);

  useEffect(() => {
    const showSubscription = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (e) => {
        Animated.timing(keyboardHeight, {
          toValue: e.endCoordinates.height,
          duration: e.duration || 250,
          useNativeDriver: true,
        }).start();
      }
    );
    const hideSubscription = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      (e) => {
        Animated.timing(keyboardHeight, {
          toValue: 0,
          duration: e.duration || 250,
          useNativeDriver: true,
        }).start();
      }
    );

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  const combinedTranslateY = Animated.add(translateY, Animated.multiply(keyboardHeight, -1));

  const panResponder = React.useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        if (gestureState.dy > 5) {
          Keyboard.dismiss();
          return true;
        }
        return false;
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          translateY.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 100 || gestureState.vy > 0.5) {
          Animated.timing(translateY, {
            toValue: Dimensions.get('window').height,
            duration: 200,
            useNativeDriver: true,
          }).start(() => {
            setIsEditModalVisible(false);
          });
        } else {
          Animated.spring(translateY, {
            toValue: 0,
            friction: 5,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  const openEditModal = () => {
    setEditFullName(user?.fullName || '');
    setEditPhone(user?.phone || '');
    setEditAddress(user?.address || '');

    let formattedDobInput = '';
    if (user?.dob) {
      const match = user.dob.match(/^(\d{4}-\d{2}-\d{2})/);
      formattedDobInput = match ? match[1] : user.dob;
    }
    setEditDob(formattedDobInput);
    setIsEditModalVisible(true);
  };

  const handleSaveProfile = async () => {
    if (!editFullName.trim()) {
      Alert.alert('Lỗi', 'Họ và tên không được để trống');
      return;
    }

    let dobToSave = editDob.trim();
    if (dobToSave) {
      const dobRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dobRegex.test(dobToSave)) {
        Alert.alert('Lỗi', 'Ngày sinh phải có định dạng YYYY-MM-DD (ví dụ: 1995-08-20)');
        return;
      }

      const parts = dobToSave.split('-');
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10);
      const day = parseInt(parts[2], 10);

      const date = new Date(year, month - 1, day);
      if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
        Alert.alert('Lỗi', 'Ngày sinh không hợp lệ');
        return;
      }

      if (date > new Date()) {
        Alert.alert('Lỗi', 'Ngày sinh không thể ở tương lai');
        return;
      }
    }

    setIsSaving(true);
    try {
      const userId = (user as any)?._id || (user as any)?.id;
      if (!userId) throw new Error('Không tìm thấy ID người dùng');

      const updatedData = {
        fullName: editFullName.trim(),
        phone: editPhone.trim(),
        address: editAddress.trim(),
        dob: dobToSave || undefined,
      };

      await usersApi.update(userId, updatedData);

      if (updateUser) {
        updateUser(updatedData);
      }

      Alert.alert('Thành công', 'Cập nhật thông tin cá nhân thành công');
      setIsEditModalVisible(false);
    } catch (error: any) {
      Alert.alert('Lỗi', error.message || 'Không thể cập nhật thông tin');
    } finally {
      setIsSaving(false);
    }
  };

  // Performance & Wallet state
  const [assignments, setAssignments] = useState<any[]>([]);
  const [balance, setBalance] = useState(0);
  const [loadingStats, setLoadingStats] = useState(true);

  // Dummy notification badge indicator
  const hasNotification = true;

  useEffect(() => {
    Promise.all([
      refereeAssignmentsApi.myAssignments({ limit: 100 }),
      rewardPointLedgerApi.myBalance()
    ])
      .then(([assRes, balRes]) => {
        setAssignments((assRes as any).data || []);
        setBalance((balRes as any).balance || 0);
      })
      .catch(() => { })
      .finally(() => setLoadingStats(false));
  }, []);

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

  const completedCount = assignments.filter(a => a.status === 'completed' || a.status === 'confirmed').length;

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
                <MaterialIcons name="sports-score" size={12} color={theme.textMuted} />
                <Text style={styles.roleText}>Trọng tài</Text>
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
              <Text style={styles.infoText}>Địa chỉ: <Text style={styles.infoValue}>{user?.address || 'Chưa cập nhật'}</Text></Text>
            </View>

            <View style={styles.infoRow}>
              <MaterialIcons name="cake" size={18} color={theme.textMuted} />
              <Text style={styles.infoText}>Ngày sinh: <Text style={styles.infoValue}>{user?.dob ? formatDate(user.dob) : 'Chưa cập nhật'}</Text></Text>
            </View>

            <TouchableOpacity style={styles.editBtn} activeOpacity={0.8} onPress={openEditModal}>
              <Text style={styles.editBtnText}>SỬA HỒ SƠ</Text>
            </TouchableOpacity>
          </View>

          {/* Referee Wallet */}
          <TouchableOpacity
            style={styles.walletCard}
            activeOpacity={0.9}
            onPress={() => router.push('/operations/referee/wallet')}
          >
            <Text style={styles.cardHeader}>VÍ TRỌNG TÀI</Text>
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

          {/* Performance Report */}
          <View style={styles.perfCard}>
            <Text style={styles.perfSub}>BÁO CÁO HIỆU SUẤT</Text>
            <Text style={styles.perfTitle}>Thành Tích Điều Hành</Text>

            <View style={styles.perfGrid}>
              <View style={styles.perfItem}>
                <View style={styles.perfIconWrap}>
                  <MaterialIcons name="assignment-turned-in" size={16} color="#000" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.perfLabel}>NHIỆM VỤ ĐƯỢC GIAO:</Text>
                  <Text style={styles.perfValue}>{loadingStats ? '-' : assignments.length}</Text>
                </View>
              </View>

              <View style={styles.perfDivider} />

              <View style={styles.perfItem}>
                <View style={styles.perfIconWrap}>
                  <MaterialIcons name="gavel" size={16} color="#000" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.perfLabel}>TRẬN ĐẤU ĐÃ ĐIỀU HÀNH:</Text>
                  <Text style={styles.perfValue}>{loadingStats ? '-' : completedCount}</Text>
                </View>
              </View>
            </View>
          </View>

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

      {/* Edit Profile Modal */}
      <Modal
        visible={isEditModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => {
          Keyboard.dismiss();
          setIsEditModalVisible(false);
        }}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.modalEditOverlay}>
            <TouchableOpacity
              style={StyleSheet.absoluteFillObject}
              activeOpacity={1}
              onPress={() => {
                Keyboard.dismiss();
                setIsEditModalVisible(false);
              }}
            />
            <Animated.View
              style={[
                styles.modalEditContent,
                { transform: [{ translateY: combinedTranslateY }] }
              ]}
            >
              {/* Indicator kéo xuống */}
              <View {...panResponder.panHandlers} style={styles.dragIndicatorWrap}>
                <View style={styles.dragIndicator} />
              </View>

              <Text style={styles.modalTitle}>CẬP NHẬT HỒ SƠ</Text>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Họ và tên *</Text>
                <TextInput
                  style={styles.textInput}
                  value={editFullName}
                  onChangeText={setEditFullName}
                  placeholder="Nhập họ và tên đầy đủ"
                  placeholderTextColor={theme.textMuted}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Số điện thoại</Text>
                <TextInput
                  style={styles.textInput}
                  value={editPhone}
                  onChangeText={setEditPhone}
                  placeholder="Nhập số điện thoại"
                  placeholderTextColor={theme.textMuted}
                  keyboardType="phone-pad"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Địa chỉ</Text>
                <TextInput
                  style={styles.textInput}
                  value={editAddress}
                  onChangeText={setEditAddress}
                  placeholder="Nhập địa chỉ"
                  placeholderTextColor={theme.textMuted}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Ngày sinh (YYYY-MM-DD)</Text>
                <TextInput
                  style={styles.textInput}
                  value={editDob}
                  onChangeText={setEditDob}
                  placeholder="Ví dụ: 1995-08-20"
                  placeholderTextColor={theme.textMuted}
                />
              </View>

              <View style={styles.modalActionRow}>
                <TouchableOpacity
                  style={styles.cancelBtn}
                  onPress={() => {
                    Keyboard.dismiss();
                    setIsEditModalVisible(false);
                  }}
                  disabled={isSaving}
                >
                  <Text style={styles.cancelBtnText}>Hủy</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.saveBtn}
                  onPress={handleSaveProfile}
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <ActivityIndicator size="small" color="#FFF" />
                  ) : (
                    <Text style={styles.saveBtnText}>Lưu thay đổi</Text>
                  )}
                </TouchableOpacity>
              </View>
            </Animated.View>
          </View>
        </TouchableWithoutFeedback>
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
    paddingBottom: 100, // Thêm padding bottom để tránh bị Dock Tab Bar che khuất
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

  // Perf Card (Luôn giữ theme sáng để nổi bật dữ liệu như yêu cầu UI/UX)
  perfCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
  },
  perfSub: {
    color: '#52525B',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  perfTitle: {
    color: '#09090B',
    fontSize: 20,
    fontWeight: '900',
    marginBottom: 16,
    marginTop: 4,
  },
  perfGrid: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E4E4E7',
    borderRadius: 12,
  },
  perfItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 12,
  },
  perfIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F4F4F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  perfLabel: {
    color: '#52525B',
    fontSize: 10,
    fontWeight: '800',
  },
  perfValue: {
    color: '#09090B',
    fontSize: 18,
    fontWeight: '900',
    marginTop: 2,
  },
  perfDivider: {
    width: 1,
    height: '100%',
    backgroundColor: '#E4E4E7',
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
  modalEditOverlay: {
    flex: 1,
    backgroundColor: isDark ? 'rgba(0,0,0,0.75)' : 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  modalEditContent: {
    width: '100%',
    height: '75%',
    backgroundColor: isDark ? '#18181B' : '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 0,
    borderWidth: 1,
    borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 10,
  },
  dragIndicatorWrap: {
    width: '100%',
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dragIndicator: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.15)',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: theme.textPrimary,
    marginBottom: 20,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.textSecondary,
    marginBottom: 8,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  textInput: {
    backgroundColor: isDark ? '#121214' : '#F4F4F5',
    borderWidth: 1,
    borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: theme.textPrimary,
  },
  modalActionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 12,
  },
  cancelBtn: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelBtnText: {
    color: theme.textSecondary,
    fontSize: 14,
    fontWeight: '700',
  },
  saveBtn: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    backgroundColor: '#E10600',
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});