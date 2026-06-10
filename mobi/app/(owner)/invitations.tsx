import React, { useEffect, useState, useCallback } from 'react';
import { ScrollView, View, Text, StyleSheet, Alert, RefreshControl, TouchableOpacity, Modal, TextInput, FlatList } from 'react-native';
import { C, LoadingState, EmptyState, SectionHeader, PrimaryButton, OutlineButton, Card, statusLabel, formatDateTime } from '@/components/ui/shared';
import { jockeyInvitationsApi, jockeysApi, registrationsApi } from '@/lib/api-client';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

type TabKey = 'marketplace' | 'history';

export default function OwnerInvitations() {
  const [tab, setTab] = useState<TabKey>('marketplace');
  const [jockeys, setJockeys] = useState<any[]>([]);
  const [invitations, setInvitations] = useState<any[]>([]);
  const [approvedRegs, setApprovedRegs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');

  // Modal states
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [selectedJockey, setSelectedJockey] = useState<any>(null);
  const [selectedRegId, setSelectedRegId] = useState('');
  const [sharePercent, setSharePercent] = useState(30);
  const [invMessage, setInvMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [cancelling, setCancelling] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      const [jRes, invRes, regRes] = await Promise.all([
        jockeysApi.list({ limit: 100 }).catch(() => ({ data: [] })),
        jockeyInvitationsApi.listSent({ limit: 100 }).catch(() => ({ data: [] })),
        registrationsApi.list({ limit: 100, status: 'APPROVED' }).catch(() => ({ data: [] })),
      ]);
      setJockeys((jRes as any).data || []);
      const invData = (invRes as any).data || invRes || [];
      setInvitations(Array.isArray(invData) ? invData : []);
      const regData = (regRes as any).data || [];
      // Only show approved regs without jockey assigned
      setApprovedRegs(regData.filter((r: any) => r.status === 'APPROVED' && !r.jockeyUserId));
    } catch {} finally { setLoading(false); }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [loadData]);

  const handleSendInvite = async () => {
    if (!selectedRegId || !selectedJockey) { Alert.alert('Lỗi', 'Vui lòng chọn trận đua.'); return; }
    setSubmitting(true);
    try {
      const jockeyId = selectedJockey.userId?._id || selectedJockey.userId?.id || selectedJockey.userId || selectedJockey._id;
      await jockeyInvitationsApi.create({
        registrationId: selectedRegId,
        jockeyId,
        message: invMessage || undefined,
        jockeySharePercent: sharePercent,
      });
      Alert.alert('Thành công', 'Đã gửi lời mời thành công!');
      setShowInviteModal(false);
      setSelectedJockey(null);
      setSelectedRegId('');
      setInvMessage('');
      setSharePercent(30);
      loadData();
    } catch (err: any) {
      Alert.alert('Lỗi', err.message || 'Gửi lời mời thất bại.');
    } finally { setSubmitting(false); }
  };

  const handleCancelInvite = (id: string) => {
    Alert.alert('Hủy lời mời', 'Bạn có chắc muốn hủy lời mời này?', [
      { text: 'Không', style: 'cancel' },
      {
        text: 'Hủy lời mời', style: 'destructive',
        onPress: async () => {
          setCancelling(id);
          try {
            await jockeyInvitationsApi.cancel(id);
            Alert.alert('Thành công', 'Đã hủy lời mời.');
            loadData();
          } catch (err: any) {
            Alert.alert('Lỗi', err.message || 'Không thể hủy lời mời.');
          } finally { setCancelling(null); }
        },
      },
    ]);
  };

  const openInviteModal = (jockey: any) => {
    if (approvedRegs.length === 0) {
      Alert.alert('Thông báo', 'Bạn chưa có slot đăng ký nào đã duyệt và chưa gán Jockey. Vui lòng đăng ký trận đua trước.');
      return;
    }
    setSelectedJockey(jockey);
    setSelectedRegId('');
    setSharePercent(30);
    setInvMessage('');
    setShowInviteModal(true);
  };

  if (loading) return <LoadingState />;

  const filteredJockeys = jockeys.filter(j => {
    if (!search) return true;
    const q = search.toLowerCase();
    const name = j.userId?.fullName || '';
    const specialty = j.specialty || '';
    return name.toLowerCase().includes(q) || specialty.toLowerCase().includes(q);
  });

  const availableJockeys = filteredJockeys.filter(j => j.status === 'available');

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      {/* Tab Bar */}
      <View style={s.tabBar}>
        <TouchableOpacity style={[s.tab, tab === 'marketplace' && s.tabActive]} onPress={() => setTab('marketplace')}>
          <MaterialIcons name="groups" size={16} color={tab === 'marketplace' ? C.red : C.textMuted} />
          <Text style={[s.tabText, tab === 'marketplace' && { color: C.red }]}>Thị trường</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[s.tab, tab === 'history' && s.tabActive]} onPress={() => setTab('history')}>
          <MaterialIcons name="send" size={16} color={tab === 'history' ? C.red : C.textMuted} />
          <Text style={[s.tabText, tab === 'history' && { color: C.red }]}>Đã gửi ({invitations.length})</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={s.p}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.red} colors={[C.red]} />}
      >
        {tab === 'marketplace' ? (
          <>
            {/* Search */}
            <View style={s.searchWrap}>
              <MaterialIcons name="search" size={18} color={C.textMuted} />
              <TextInput
                style={s.searchInput}
                placeholder="Tìm Jockey theo tên, sở trường..."
                placeholderTextColor={C.textMuted}
                value={search}
                onChangeText={setSearch}
              />
            </View>
            <Text style={s.countText}>{availableJockeys.length} Jockey sẵn sàng</Text>

            {availableJockeys.length === 0 ? (
              <EmptyState icon="person-search" title="Không tìm thấy" subtitle="Không có Jockey nào sẵn sàng phù hợp." />
            ) : (
              availableJockeys.map(j => {
                const name = j.userId?.fullName || 'Ẩn danh';
                const email = j.userId?.email || '';
                const winRate = j.totalRaces > 0 ? ((j.wins / j.totalRaces) * 100).toFixed(1) : '0';
                return (
                  <View key={j._id} style={s.jockeyCard}>
                    <View style={s.jockeyHeader}>
                      <View style={s.jockeyAvatar}>
                        <MaterialIcons name="person" size={24} color={C.red} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={s.jockeyName} numberOfLines={1}>{name}</Text>
                        <Text style={s.jockeyEmail} numberOfLines={1}>{email}</Text>
                      </View>
                    </View>

                    {/* Stats */}
                    <View style={s.statsGrid}>
                      <View style={s.statItem}>
                        <Text style={s.statVal}>{j.experienceYears || 0}</Text>
                        <Text style={s.statLbl}>Năm KN</Text>
                      </View>
                      <View style={s.statItem}>
                        <Text style={s.statVal}>{j.totalRaces || 0}</Text>
                        <Text style={s.statLbl}>Tổng trận</Text>
                      </View>
                      <View style={s.statItem}>
                        <Text style={s.statVal}>{j.wins || 0}</Text>
                        <Text style={s.statLbl}>Thắng</Text>
                      </View>
                      <View style={s.statItem}>
                        <Text style={[s.statVal, { color: C.tealLight }]}>{winRate}%</Text>
                        <Text style={s.statLbl}>Tỷ lệ</Text>
                      </View>
                    </View>

                    {/* Info */}
                    <View style={s.infoRow}>
                      {j.heightCm > 0 && <Text style={s.infoText}>📏 {j.heightCm}cm</Text>}
                      {j.weightKg > 0 && <Text style={s.infoText}>⚖️ {j.weightKg}kg</Text>}
                      {j.specialty && <Text style={s.infoText}>⭐ {j.specialty}</Text>}
                    </View>

                    {j.bio && <Text style={s.bioText} numberOfLines={2}>&quot;{j.bio}&quot;</Text>}

                    <PrimaryButton
                      title={approvedRegs.length > 0 ? '＋ Gửi lời mời' : 'Chưa có slot trống'}
                      onPress={() => openInviteModal(j)}
                      disabled={approvedRegs.length === 0}
                    />
                  </View>
                );
              })
            )}
          </>
        ) : (
          // History tab
          <>
            <SectionHeader title="Lời mời đã gửi" />
            {invitations.length === 0 ? (
              <EmptyState icon="send" title="Chưa gửi lời mời" subtitle="Vào Thị trường Jockey để tìm và gửi lời mời." />
            ) : (
              invitations.map(inv => {
                const st = statusLabel(inv.status);
                const jockeyName = typeof inv.jockeyUserId === 'object' ? inv.jockeyUserId?.fullName : 'Jockey';
                const horseName = typeof inv.horseId === 'object' ? inv.horseId?.name : 'Ngựa';
                const raceName = typeof inv.raceId === 'object' ? inv.raceId?.name : 'Trận đua';
                const id = inv._id || inv.id;
                const isPending = inv.status === 'PENDING';

                return (
                  <View key={id} style={s.invCard}>
                    <View style={s.invHeader}>
                      <View style={{ flex: 1 }}>
                        <Text style={s.invJockey}>Jockey: {jockeyName}</Text>
                        <Text style={s.invHorse}>🐴 {horseName} · 🏁 {raceName}</Text>
                        <Text style={s.invShare}>Chia thưởng: {inv.jockeySharePercent || inv.prizeSharePercentage || 30}%</Text>
                      </View>
                      <View style={[s.statusBadge, { backgroundColor: st.color + '20', borderColor: st.color + '40' }]}>
                        <Text style={[s.statusBadgeText, { color: st.color }]}>{st.label}</Text>
                      </View>
                    </View>
                    <View style={s.invFooter}>
                      <Text style={s.invDate}>{formatDateTime(inv.createdAt)}</Text>
                      {isPending && (
                        <TouchableOpacity
                          style={s.cancelBtn}
                          onPress={() => handleCancelInvite(id)}
                          disabled={cancelling === id}
                        >
                          <MaterialIcons name="cancel" size={14} color="#EF4444" />
                          <Text style={s.cancelBtnText}>{cancelling === id ? '...' : 'Hủy'}</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                );
              })
            )}
          </>
        )}
      </ScrollView>

      {/* Send Invitation Modal */}
      <Modal visible={showInviteModal} animationType="slide" transparent>
        <View style={s.modalOverlay}>
          <View style={s.modalContent}>
            <View style={s.modalHeader}>
              <Text style={s.modalTitle}>Gửi Lời Mời</Text>
              <TouchableOpacity onPress={() => setShowInviteModal(false)}>
                <MaterialIcons name="close" size={24} color={C.textSecondary} />
              </TouchableOpacity>
            </View>

            {selectedJockey && (
              <View style={s.jockeySummary}>
                <MaterialIcons name="person" size={20} color={C.red} />
                <View>
                  <Text style={s.summaryName}>{selectedJockey.userId?.fullName || 'Jockey'}</Text>
                  <Text style={s.summaryStats}>{selectedJockey.experienceYears || 0} năm KN · {selectedJockey.totalRaces || 0} trận · {selectedJockey.wins || 0} thắng</Text>
                </View>
              </View>
            )}

            <ScrollView style={{ maxHeight: 350 }} showsVerticalScrollIndicator={false}>
              <Text style={s.fieldLabel}>Chọn ngựa & trận đua *</Text>
              {approvedRegs.map(r => {
                const horse = typeof r.horseId === 'object' ? r.horseId?.name : 'Ngựa';
                const race = typeof r.raceId === 'object' ? r.raceId?.name : 'Trận đua';
                const id = r._id || r.id;
                const selected = selectedRegId === id;
                return (
                  <TouchableOpacity
                    key={id}
                    style={[s.regOption, selected && s.regOptionSelected]}
                    onPress={() => setSelectedRegId(id)}
                  >
                    <MaterialIcons name={selected ? 'radio-button-checked' : 'radio-button-unchecked'} size={18} color={selected ? C.red : C.textMuted} />
                    <Text style={s.regOptionText}>🐴 {horse} — 🏁 {race}</Text>
                  </TouchableOpacity>
                );
              })}

              <Text style={[s.fieldLabel, { marginTop: 16 }]}>% Chia thưởng cho Jockey (5-50%): {sharePercent}%</Text>
              <View style={s.sliderRow}>
                <TouchableOpacity
                  style={s.stepBtn}
                  onPress={() => setSharePercent(Math.max(5, sharePercent - 5))}
                >
                  <Text style={s.stepBtnText}>- 5%</Text>
                </TouchableOpacity>
                <View style={{ flex: 1 }}>
                  <TextInput
                    style={[s.inputSmall, { textAlign: 'center' }]}
                    keyboardType="numeric"
                    value={String(sharePercent)}
                    onChangeText={v => {
                      const num = parseInt(v) || 5;
                      setSharePercent(Math.min(50, Math.max(5, num)));
                    }}
                  />
                </View>
                <TouchableOpacity
                  style={s.stepBtn}
                  onPress={() => setSharePercent(Math.min(50, sharePercent + 5))}
                >
                  <Text style={s.stepBtnText}>+ 5%</Text>
                </TouchableOpacity>
              </View>
              <View style={s.shareInfo}>
                <Text style={s.shareText}>Chủ ngựa nhận: {100 - sharePercent}%</Text>
                <Text style={s.shareText}>Jockey nhận: {sharePercent}%</Text>
              </View>

              <Text style={[s.fieldLabel, { marginTop: 16 }]}>Lời nhắn (tùy chọn)</Text>
              <TextInput
                style={[s.input, { height: 72, textAlignVertical: 'top' }]}
                placeholder="Ví dụ: Mong bạn đồng hành cùng chiến mã!"
                placeholderTextColor={C.textMuted}
                multiline
                value={invMessage}
                onChangeText={setInvMessage}
              />
            </ScrollView>

            <View style={s.modalActions}>
              <OutlineButton title="Đóng" onPress={() => setShowInviteModal(false)} />
              <PrimaryButton title="Gửi lời mời" onPress={handleSendInvite} loading={submitting} disabled={!selectedRegId} />
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
  tabActive: { borderBottomColor: C.red },
  tabText: { color: C.textMuted, fontSize: 12, fontWeight: '800', textTransform: 'uppercase' },
  searchWrap: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: C.card, borderWidth: 1, borderColor: C.cardBorder, borderRadius: 12, paddingHorizontal: 12, marginBottom: 12 },
  searchInput: { flex: 1, color: C.white, fontSize: 13, height: 42 },
  countText: { color: C.textMuted, fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 },
  jockeyCard: { backgroundColor: C.card, borderWidth: 1, borderColor: C.cardBorder, borderRadius: 16, padding: 16, marginBottom: 12 },
  jockeyHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  jockeyAvatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: C.red + '15', borderWidth: 2, borderColor: C.red + '40', alignItems: 'center', justifyContent: 'center' },
  jockeyName: { color: C.white, fontSize: 14, fontWeight: '900', textTransform: 'uppercase' },
  jockeyEmail: { color: C.textMuted, fontSize: 10, marginTop: 2 },
  statsGrid: { flexDirection: 'row', gap: 6, marginBottom: 10 },
  statItem: { flex: 1, backgroundColor: '#00000030', borderWidth: 1, borderColor: C.cardBorder, borderRadius: 8, padding: 8, alignItems: 'center' },
  statVal: { color: C.white, fontSize: 14, fontWeight: '900' },
  statLbl: { color: C.textMuted, fontSize: 8, fontWeight: '700', textTransform: 'uppercase', marginTop: 2 },
  infoRow: { flexDirection: 'row', gap: 12, flexWrap: 'wrap', marginBottom: 8 },
  infoText: { color: C.textSecondary, fontSize: 11, fontWeight: '600' },
  bioText: { color: C.textSecondary, fontSize: 11, fontStyle: 'italic', backgroundColor: C.bg, padding: 8, borderRadius: 8, marginBottom: 4 },
  invCard: { backgroundColor: C.card, borderWidth: 1, borderColor: C.cardBorder, borderRadius: 16, padding: 14, marginBottom: 10 },
  invHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  invJockey: { color: C.white, fontSize: 13, fontWeight: '800' },
  invHorse: { color: C.textSecondary, fontSize: 11, marginTop: 4 },
  invShare: { color: C.tealLight, fontSize: 10, fontWeight: '700', marginTop: 2 },
  statusBadge: { borderWidth: 1, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  statusBadgeText: { fontSize: 9, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.5 },
  invFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: C.cardBorder },
  invDate: { color: C.textMuted, fontSize: 10 },
  cancelBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, borderWidth: 1, borderColor: '#EF444440', backgroundColor: '#EF444410' },
  cancelBtnText: { color: '#EF4444', fontSize: 11, fontWeight: '700' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: C.card, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, borderWidth: 1, borderColor: C.cardBorder, maxHeight: '85%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  modalTitle: { color: C.white, fontSize: 18, fontWeight: '900', textTransform: 'uppercase' },
  jockeySummary: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#00000030', borderWidth: 1, borderColor: C.cardBorder, borderRadius: 12, padding: 12, marginBottom: 16 },
  summaryName: { color: C.white, fontSize: 13, fontWeight: '800' },
  summaryStats: { color: C.textMuted, fontSize: 10, marginTop: 2 },
  fieldLabel: { color: C.textSecondary, fontSize: 10, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 },
  regOption: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12, borderWidth: 1, borderColor: C.cardBorder, borderRadius: 10, marginBottom: 6, backgroundColor: '#00000020' },
  regOptionSelected: { borderColor: C.red + '60', backgroundColor: C.red + '10' },
  regOptionText: { color: C.white, fontSize: 12, fontWeight: '600', flex: 1 },
  sliderRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  stepBtn: { backgroundColor: C.red + '15', borderWidth: 1, borderColor: C.red + '40', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8, alignItems: 'center', justifyContent: 'center' },
  stepBtnText: { color: C.red, fontSize: 12, fontWeight: '800' },
  inputSmall: { backgroundColor: C.inputBg, borderWidth: 1, borderColor: C.cardBorder, color: C.white, borderRadius: 8, height: 36, paddingHorizontal: 12, fontSize: 16, fontWeight: '800' },
  shareInfo: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  shareText: { color: C.textMuted, fontSize: 10 },
  input: { backgroundColor: C.inputBg, borderWidth: 1, borderColor: C.cardBorder, color: C.white, borderRadius: 12, height: 44, paddingHorizontal: 16, fontSize: 13, marginBottom: 12 },
  modalActions: { flexDirection: 'row', gap: 12, marginTop: 12 },
});
