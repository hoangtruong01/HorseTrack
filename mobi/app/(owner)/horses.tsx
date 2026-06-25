import React, { useEffect, useState, useCallback } from 'react';
import { ScrollView, View, Text, StyleSheet, TouchableOpacity, Alert, TextInput, RefreshControl, Modal, Image, Platform, useColorScheme } from 'react-native';
import { LoadingState, EmptyState, ErrorState, statusLabel } from '@/components/ui/shared';
import { AppScreen } from '@/components/ui/premium';
import { SleekHeader } from '@/components/ui/sleek-header';
import { usePremiumColors, premiumSpacing, premiumRadius, premiumTypography, premiumShadows } from '@/components/ui/premium-tokens';
import { horsesApi } from '@/lib/api-client';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import * as ImagePicker from 'expo-image-picker';

type TabKey = 'approved' | 'pending';

const GridBackground = ({ isDark }: { isDark: boolean }) => {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <View style={{ flex: 1, backgroundColor: isDark ? '#09090B' : '#F4F4F5' }} />
    </View>
  );
};

export default function OwnerHorses() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = usePremiumColors();
  const styles = React.useMemo(() => getStyles(isDark, colors), [isDark, colors]);

  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabKey>('approved');
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ name: '', breed: '', age: '', color: '', weightKg: '', heightCm: '', description: '' });
  const [imageUri, setImageUri] = useState<string | null>(null);

  const fetchHorses = useCallback(async () => {
    setError(null);
    try {
      const res = await horsesApi.listMine({ limit: 100 });
      setData((res as any).data || []);
    } catch (err: any) {
      setError(err.message || 'Không thể tải danh sách chiến mã.');
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchHorses(); }, [fetchHorses]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchHorses();
    setRefreshing(false);
  }, [fetchHorses]);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Quyền truy cập', 'Ứng dụng cần quyền truy cập thư viện ảnh để tải hình ảnh chiến mã.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setImageUri(result.assets[0].uri);
    }
  };

  const handleCreate = async () => {
    if (!form.name.trim()) { Alert.alert('Lỗi', 'Vui lòng nhập tên chiến mã.'); return; }
    if (form.age) {
      const ageNum = parseInt(form.age, 10);
      if (isNaN(ageNum) || ageNum < 1 || ageNum > 30) {
        Alert.alert('Lỗi', 'Tuổi chiến mã phải là số nguyên từ 1 đến 30.');
        return;
      }
    }
    setCreating(true);
    try {
      let body: any;
      if (imageUri) {
        body = new FormData();
        body.append('name', form.name.trim());
        if (form.breed.trim()) body.append('breed', form.breed.trim());
        if (form.age) body.append('age', form.age);
        if (form.color.trim()) body.append('color', form.color.trim());
        if (form.weightKg) body.append('weightKg', form.weightKg);
        if (form.heightCm) body.append('heightCm', form.heightCm);
        if (form.description.trim()) body.append('description', form.description.trim());

        if (Platform.OS === 'web') {
          const response = await fetch(imageUri);
          const blob = await response.blob();
          body.append('image', blob, 'photo.jpg');
        } else {
          const filename = imageUri.split('/').pop() || 'photo.jpg';
          const match = /\.(\w+)$/.exec(filename);
          const type = match ? `image/${match[1]}` : `image/jpeg`;
          body.append('image', {
            uri: imageUri,
            name: filename,
            type,
          } as any);
        }
      } else {
        body = {
          name: form.name.trim(),
          breed: form.breed.trim() || undefined,
          age: form.age ? parseInt(form.age) : undefined,
          color: form.color.trim() || undefined,
          weightKg: form.weightKg ? parseFloat(form.weightKg) : undefined,
          heightCm: form.heightCm ? parseFloat(form.heightCm) : undefined,
          description: form.description.trim() || undefined,
        };
      }

      await horsesApi.create(body);
      Alert.alert('Thành công', 'Đã thêm chiến mã mới! Vui lòng đợi Admin phê duyệt.');
      setShowCreate(false);
      setForm({ name: '', breed: '', age: '', color: '', weightKg: '', heightCm: '', description: '' });
      setImageUri(null);
      fetchHorses();
    } catch (err: any) {
      Alert.alert('Lỗi', err.message || 'Không thể thêm chiến mã.');
    } finally { setCreating(false); }
  };

  const approvedHorses = data.filter(h => h.approvalStatus === 'APPROVED' || (!h.approvalStatus && h.status === 'active'));
  const pendingHorses = data.filter(h => h.approvalStatus === 'PENDING' || h.approvalStatus === 'REJECTED');
  const currentHorses = activeTab === 'approved' ? approvedHorses : pendingHorses;

  if (loading && !refreshing) return <LoadingState />;

  return (
    <AppScreen safeArea={false}>
      <SleekHeader title="CHIẾN MÃ" showWallet={true} />
      <GridBackground isDark={isDark} />

      {/* Tab Bar */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'approved' && styles.tabActiveApproved]}
          onPress={() => setActiveTab('approved')}
          activeOpacity={0.8}
        >
          <MaterialIcons name="verified" size={16} color={activeTab === 'approved' ? colors.success : colors.textMuted} />
          <Text style={[styles.tabText, activeTab === 'approved' && { color: colors.success }]}>
            Đã duyệt ({approvedHorses.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'pending' && styles.tabActivePending]}
          onPress={() => setActiveTab('pending')}
          activeOpacity={0.8}
        >
          <MaterialIcons name="pending" size={16} color={activeTab === 'pending' ? colors.warning : colors.textMuted} />
          <Text style={[styles.tabText, activeTab === 'pending' && { color: colors.warning }]}>
            Chờ duyệt ({pendingHorses.length})
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.brand} colors={[colors.brand]} />}
      >
        {/* Add Horse Button */}
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => { setShowCreate(true); setImageUri(null); }}
          activeOpacity={0.9}
        >
          <MaterialIcons name="add-circle" size={20} color="#FFFFFF" />
          <Text style={styles.addBtnText}>Thêm chiến mã mới</Text>
        </TouchableOpacity>

        {error ? (
          <ErrorState message={error} onRetry={fetchHorses} />
        ) : currentHorses.length === 0 ? (
          <EmptyState
            icon="pets"
            title={activeTab === 'approved' ? 'Chưa có ngựa được duyệt' : 'Không có hồ sơ chờ duyệt'}
            subtitle={activeTab === 'approved' ? 'Thêm chiến mã mới và đợi Admin phê duyệt.' : 'Tất cả chiến mã đã được duyệt hoặc phản hồi.'}
          />
        ) : (
          currentHorses.map(h => {
            const st = statusLabel(h.approvalStatus || h.status);
            return (
              <View key={h._id || h.id} style={styles.horseCard}>
                {/* Badge Trạng thái ở góc phải */}
                <View style={styles.cardHeaderRow}>
                  <View style={[styles.statusBadge, { backgroundColor: st.color + '15', borderColor: st.color + '40' }]}>
                    <Text style={[styles.statusBadgeText, { color: st.color }]}>{st.label}</Text>
                  </View>
                </View>

                <View style={styles.cardMain}>
                  {/* Ảnh hoặc Icon đại diện */}
                  <View style={styles.horseImageContainer}>
                    {h.image ? (
                      <Image source={{ uri: h.image }} style={styles.horseImage} />
                    ) : (
                      <View style={styles.horseIconPlaceholder}>
                        <MaterialIcons name="pets" size={32} color={colors.brand} />
                      </View>
                    )}
                  </View>

                  {/* Thông tin chính */}
                  <View style={styles.horseInfo}>
                    <Text style={styles.horseName} numberOfLines={1}>{h.name}</Text>

                    {/* Tags thông số */}
                    <View style={styles.tagsContainer}>
                      {h.breed && (
                        <View style={styles.tag}>
                          <Text style={styles.tagText}>{h.breed}</Text>
                        </View>
                      )}
                      {h.age && (
                        <View style={styles.tag}>
                          <Text style={styles.tagText}>{h.age} tuổi</Text>
                        </View>
                      )}
                      {h.color && (
                        <View style={styles.tag}>
                          <Text style={styles.tagText}>{h.color}</Text>
                        </View>
                      )}
                      {h.weightKg && (
                        <View style={styles.tag}>
                          <Text style={styles.tagText}>{h.weightKg} kg</Text>
                        </View>
                      )}
                      {h.heightCm && (
                        <View style={styles.tag}>
                          <Text style={styles.tagText}>{h.heightCm} cm</Text>
                        </View>
                      )}
                      {h.healthStatus && (
                        <View style={[styles.tag, { backgroundColor: colors.success + '10' }]}>
                          <Text style={[styles.tagText, { color: colors.success, fontWeight: '700' }]}>{h.healthStatus}</Text>
                        </View>
                      )}
                    </View>
                  </View>
                </View>

                {h.description && (
                  <View style={styles.descContainer}>
                    <Text style={styles.descText} numberOfLines={3}>
                      &quot;{h.description}&quot;
                    </Text>
                  </View>
                )}
              </View>
            );
          })
        )}
      </ScrollView>

      {/* Create Horse Modal */}
      <Modal visible={showCreate} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Thêm Chiến Mã Mới</Text>
              <TouchableOpacity onPress={() => setShowCreate(false)} style={styles.closeIconBox} activeOpacity={0.8}>
                <MaterialIcons name="close" size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ maxHeight: 450 }} showsVerticalScrollIndicator={false}>
              {/* Image Picker Section */}
              <Text style={styles.fieldLabel}>Hình ảnh chiến mã</Text>
              {imageUri ? (
                <View style={styles.imagePreviewContainer}>
                  <Image source={{ uri: imageUri }} style={styles.imagePreview} />
                  <TouchableOpacity style={styles.removeImageBtn} onPress={() => setImageUri(null)} activeOpacity={0.8}>
                    <MaterialIcons name="cancel" size={24} color={colors.danger} />
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity style={styles.uploadBtn} onPress={pickImage} activeOpacity={0.8}>
                  <MaterialIcons name="cloud-upload" size={32} color={colors.brand} />
                  <Text style={styles.uploadBtnText}>Tải lên hình ảnh chiến mã</Text>
                </TouchableOpacity>
              )}

              <Text style={styles.fieldLabel}>Tên chiến mã *</Text>
              <TextInput
                style={styles.input}
                placeholder="Ví dụ: Thiên Lý Mã"
                placeholderTextColor={colors.textMuted}
                value={form.name}
                onChangeText={v => setForm(f => ({ ...f, name: v }))}
              />

              <Text style={styles.fieldLabel}>Giống ngựa</Text>
              <TextInput
                style={styles.input}
                placeholder="Ví dụ: Thoroughbred"
                placeholderTextColor={colors.textMuted}
                value={form.breed}
                onChangeText={v => setForm(f => ({ ...f, breed: v }))}
              />

              <View style={styles.row}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.fieldLabel}>Tuổi</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="5"
                    placeholderTextColor={colors.textMuted}
                    keyboardType="numeric"
                    value={form.age}
                    onChangeText={v => setForm(f => ({ ...f, age: v }))}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.fieldLabel}>Màu lông</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Nâu đỏ"
                    placeholderTextColor={colors.textMuted}
                    value={form.color}
                    onChangeText={v => setForm(f => ({ ...f, color: v }))}
                  />
                </View>
              </View>

              <View style={styles.row}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.fieldLabel}>Cân nặng (kg)</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="480"
                    placeholderTextColor={colors.textMuted}
                    keyboardType="numeric"
                    value={form.weightKg}
                    onChangeText={v => setForm(f => ({ ...f, weightKg: v }))}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.fieldLabel}>Chiều cao (cm)</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="165"
                    placeholderTextColor={colors.textMuted}
                    keyboardType="numeric"
                    value={form.heightCm}
                    onChangeText={v => setForm(f => ({ ...f, heightCm: v }))}
                  />
                </View>
              </View>

              <Text style={styles.fieldLabel}>Mô tả</Text>
              <TextInput
                style={[styles.input, { height: 80, textAlignVertical: 'top', paddingTop: 12 }]}
                placeholder="Mô tả về chiến mã..."
                placeholderTextColor={colors.textMuted}
                multiline
                value={form.description}
                onChangeText={v => setForm(f => ({ ...f, description: v }))}
              />
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.btnOutlineModal} onPress={() => setShowCreate(false)} activeOpacity={0.8}>
                <Text style={styles.btnOutlineText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.btnPrimaryModal, (!form.name.trim() || creating) && styles.btnDisabled]}
                onPress={handleCreate}
                disabled={!form.name.trim() || creating}
                activeOpacity={0.8}
              >
                <Text style={styles.btnPrimaryText}>{creating ? 'Đang thêm...' : 'Thêm mới'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </AppScreen>
  );
}

const getStyles = (isDark: boolean, colors: any) => StyleSheet.create({
  scrollContent: {
    padding: premiumSpacing[16],
    paddingBottom: 100,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: isDark ? 'rgba(15, 15, 20, 0.8)' : '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingTop: 4,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: premiumSpacing[8],
    paddingVertical: 14,
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  tabActiveApproved: {
    borderBottomColor: colors.success,
  },
  tabActivePending: {
    borderBottomColor: colors.warning,
  },
  tabText: {
    color: colors.textMuted,
    fontSize: premiumTypography.sizes[13],
    fontWeight: premiumTypography.weights.bold,
    textTransform: 'uppercase',
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.brand,
    paddingVertical: 14,
    borderRadius: premiumRadius[12],
    gap: 8,
    marginBottom: 16,
    ...premiumShadows.redGlow,
  },
  addBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  horseCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: premiumRadius[16],
    padding: 16,
    marginBottom: 16,
    ...premiumShadows.subtle,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 8,
  },
  statusBadge: {
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  statusBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  cardMain: {
    flexDirection: 'row',
    gap: 16,
  },
  horseImageContainer: {
    width: 80,
    height: 80,
    borderRadius: premiumRadius[12],
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
  },
  horseImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  horseIconPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  horseInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  horseName: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '900',
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  tag: {
    backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
  },
  tagText: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: '600',
  },
  descContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  descText: {
    color: colors.textSecondary,
    fontSize: 12,
    fontStyle: 'italic',
    lineHeight: 18,
  },
  input: {
    backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : '#FFFFFF',
    borderWidth: 1,
    borderColor: colors.border,
    color: colors.text,
    borderRadius: premiumRadius[12],
    height: 48,
    paddingHorizontal: 16,
    fontSize: 14,
    marginBottom: 16,
  },
  fieldLabel: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: isDark ? '#0F0F12' : '#FFFFFF',
    borderTopLeftRadius: premiumRadius[28],
    borderTopRightRadius: premiumRadius[28],
    padding: premiumSpacing[24],
    borderWidth: 1,
    borderColor: colors.border,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  closeIconBox: {
    width: 36,
    height: 36,
    borderRadius: premiumRadius[8],
    backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  uploadBtn: {
    height: 100,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.border,
    backgroundColor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)',
    borderRadius: premiumRadius[16],
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 20,
  },
  uploadBtnText: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '700',
  },
  imagePreviewContainer: {
    position: 'relative',
    width: '100%',
    height: 160,
    borderRadius: premiumRadius[16],
    overflow: 'hidden',
    marginBottom: 20,
    borderColor: colors.border,
    borderWidth: 1,
  },
  imagePreview: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  removeImageBtn: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 12,
    padding: 4,
  },
  btnOutlineModal: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    borderRadius: premiumRadius[12],
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
  },
  btnOutlineText: {
    color: colors.text,
    fontWeight: '700',
    fontSize: 14,
  },
  btnPrimaryModal: {
    flex: 1.5,
    backgroundColor: colors.brand,
    borderRadius: premiumRadius[12],
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
  },
  btnPrimaryText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 14,
  },
  btnDisabled: {
    opacity: 0.5,
  },
});
