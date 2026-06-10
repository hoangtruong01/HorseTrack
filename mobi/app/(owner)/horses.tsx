import React, { useEffect, useState, useCallback } from 'react';
import { ScrollView, View, Text, StyleSheet, TouchableOpacity, Alert, TextInput, RefreshControl, Modal, Image, Platform } from 'react-native';
import { C, ListItemCard, LoadingState, EmptyState, SectionHeader, PrimaryButton, OutlineButton, Card, statusLabel } from '@/components/ui/shared';
import { horsesApi } from '@/lib/api-client';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import * as ImagePicker from 'expo-image-picker';

type TabKey = 'approved' | 'pending';

export default function OwnerHorses() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<TabKey>('approved');
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ name: '', breed: '', age: '', color: '', weightKg: '', heightCm: '', description: '' });
  const [imageUri, setImageUri] = useState<string | null>(null);

  const fetchHorses = useCallback(async () => {
    try {
      const res = await horsesApi.listMine({ limit: 100 });
      setData((res as any).data || []);
    } catch {} finally { setLoading(false); }
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

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      {/* Tab Bar */}
      <View style={s.tabBar}>
        <TouchableOpacity style={[s.tab, activeTab === 'approved' && s.tabActive]} onPress={() => setActiveTab('approved')}>
          <MaterialIcons name="verified" size={16} color={activeTab === 'approved' ? C.tealLight : C.textMuted} />
          <Text style={[s.tabText, activeTab === 'approved' && { color: C.tealLight }]}>Đã duyệt ({approvedHorses.length})</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[s.tab, activeTab === 'pending' && s.tabActivePending]} onPress={() => setActiveTab('pending')}>
          <MaterialIcons name="pending" size={16} color={activeTab === 'pending' ? C.yellow : C.textMuted} />
          <Text style={[s.tabText, activeTab === 'pending' && { color: C.yellow }]}>Chờ duyệt ({pendingHorses.length})</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={s.p}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.red} colors={[C.red]} />}
      >
        {/* Add Horse Button */}
        <PrimaryButton title="＋ Thêm chiến mã mới" onPress={() => { setShowCreate(true); setImageUri(null); }} />
        <View style={{ height: 12 }} />

        {currentHorses.length === 0 ? (
          <EmptyState
            icon="pets"
            title={activeTab === 'approved' ? 'Chưa có ngựa được duyệt' : 'Không có hồ sơ chờ duyệt'}
            subtitle={activeTab === 'approved' ? 'Thêm chiến mã mới và đợi Admin phê duyệt.' : 'Tất cả chiến mã đã được duyệt.'}
          />
        ) : (
          currentHorses.map(h => {
            const st = statusLabel(h.approvalStatus || h.status);
            return (
              <ListItemCard
                key={h._id}
                title={h.name}
                subtitle={`Giống: ${h.breed || 'Chưa rõ'} · Tuổi: ${h.age || 'N/A'} · Sức khỏe: ${h.healthStatus || 'N/A'}`}
                rightText={st.label}
                rightColor={st.color}
                icon="pets"
              />
            );
          })
        )}
      </ScrollView>

      {/* Create Horse Modal */}
      <Modal visible={showCreate} animationType="slide" transparent>
        <View style={s.modalOverlay}>
          <View style={s.modalContent}>
            <View style={s.modalHeader}>
              <Text style={s.modalTitle}>Thêm Chiến Mã Mới</Text>
              <TouchableOpacity onPress={() => setShowCreate(false)}>
                <MaterialIcons name="close" size={24} color={C.textSecondary} />
              </TouchableOpacity>
            </View>
            <ScrollView style={{ maxHeight: 400 }} showsVerticalScrollIndicator={false}>
              
              {/* Image Picker Section */}
              <Text style={s.fieldLabel}>Hình ảnh chiến mã</Text>
              {imageUri ? (
                <View style={s.imagePreviewContainer}>
                  <Image source={{ uri: imageUri }} style={s.imagePreview} />
                  <TouchableOpacity style={s.removeImageBtn} onPress={() => setImageUri(null)}>
                    <MaterialIcons name="cancel" size={22} color="#EF4444" />
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity style={s.uploadBtn} onPress={pickImage}>
                  <MaterialIcons name="cloud-upload" size={28} color={C.red} />
                  <Text style={s.uploadBtnText}>Tải lên hình ảnh chiến mã</Text>
                </TouchableOpacity>
              )}

              <Text style={s.fieldLabel}>Tên chiến mã *</Text>
              <TextInput style={s.input} placeholder="Ví dụ: Thiên Lý Mã" placeholderTextColor={C.textMuted} value={form.name} onChangeText={v => setForm(f => ({ ...f, name: v }))} />

              <Text style={s.fieldLabel}>Giống ngựa</Text>
              <TextInput style={s.input} placeholder="Ví dụ: Thoroughbred" placeholderTextColor={C.textMuted} value={form.breed} onChangeText={v => setForm(f => ({ ...f, breed: v }))} />

              <View style={s.row}>
                <View style={{ flex: 1 }}>
                  <Text style={s.fieldLabel}>Tuổi</Text>
                  <TextInput style={s.input} placeholder="5" placeholderTextColor={C.textMuted} keyboardType="numeric" value={form.age} onChangeText={v => setForm(f => ({ ...f, age: v }))} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.fieldLabel}>Màu lông</Text>
                  <TextInput style={s.input} placeholder="Nâu đỏ" placeholderTextColor={C.textMuted} value={form.color} onChangeText={v => setForm(f => ({ ...f, color: v }))} />
                </View>
              </View>

              <View style={s.row}>
                <View style={{ flex: 1 }}>
                  <Text style={s.fieldLabel}>Cân nặng (kg)</Text>
                  <TextInput style={s.input} placeholder="480" placeholderTextColor={C.textMuted} keyboardType="numeric" value={form.weightKg} onChangeText={v => setForm(f => ({ ...f, weightKg: v }))} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.fieldLabel}>Chiều cao (cm)</Text>
                  <TextInput style={s.input} placeholder="165" placeholderTextColor={C.textMuted} keyboardType="numeric" value={form.heightCm} onChangeText={v => setForm(f => ({ ...f, heightCm: v }))} />
                </View>
              </View>

              <Text style={s.fieldLabel}>Mô tả</Text>
              <TextInput style={[s.input, { height: 72, textAlignVertical: 'top' }]} placeholder="Mô tả về chiến mã..." placeholderTextColor={C.textMuted} multiline value={form.description} onChangeText={v => setForm(f => ({ ...f, description: v }))} />
            </ScrollView>

            <View style={s.modalActions}>
              <OutlineButton title="Hủy" onPress={() => setShowCreate(false)} />
              <PrimaryButton title="Thêm chiến mã" onPress={handleCreate} loading={creating} />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  p: { padding: 16, paddingBottom: 32 },
  tabBar: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: C.cardBorder, backgroundColor: C.card },
  tab: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 12, borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabActive: { borderBottomColor: C.tealLight },
  tabActivePending: { borderBottomColor: C.yellow },
  tabText: { color: C.textMuted, fontSize: 12, fontWeight: '800', textTransform: 'uppercase' },
  input: { backgroundColor: C.inputBg, borderWidth: 1, borderColor: C.cardBorder, color: C.white, borderRadius: 12, height: 44, paddingHorizontal: 16, fontSize: 13, marginBottom: 12 },
  fieldLabel: { color: C.textSecondary, fontSize: 10, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 },
  row: { flexDirection: 'row', gap: 12 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: C.card, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, borderWidth: 1, borderColor: C.cardBorder },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { color: C.white, fontSize: 18, fontWeight: '900', textTransform: 'uppercase' },
  modalActions: { flexDirection: 'row', gap: 12, marginTop: 8 },
  uploadBtn: { height: 100, borderWidth: 1, borderStyle: 'dashed', borderColor: C.red + '60', backgroundColor: C.red + '05', borderRadius: 12, alignItems: 'center', justifyContent: 'center', gap: 6, marginBottom: 16 },
  uploadBtnText: { color: C.textSecondary, fontSize: 11, fontWeight: '700' },
  imagePreviewContainer: { position: 'relative', width: '100%', height: 150, borderRadius: 12, overflow: 'hidden', marginBottom: 16, borderColor: C.cardBorder, borderWidth: 1 },
  imagePreview: { width: '100%', height: '100%', resizeMode: 'cover' },
  removeImageBtn: { position: 'absolute', top: 8, right: 8, backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: 12, padding: 2 },
});
