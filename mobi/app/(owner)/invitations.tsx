import React, { useEffect, useState, useCallback } from 'react';
import { ScrollView, View, Text, StyleSheet, Alert, RefreshControl, TouchableOpacity, Modal, TextInput } from 'react-native';
import { AppScreen, Section } from '@/components/ui/premium';
import { premiumColors, premiumSpacing, premiumRadius } from '@/components/ui/premium-tokens';
import { LoadingState, EmptyState, statusLabel, formatDateTime } from '@/components/ui/shared';
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
        registrationsApi.listMine({ limit: 100 }).catch(() => ({ data: [] })),
      ]);
      setJockeys((jRes as any).data || []);
      const invData = (invRes as any).data || invRes || [];
      setInvitations(Array.isArray(invData) ? invData : []);
      const regData = (regRes as any).data || [];
      // Only show approved regs without jockey assigned and race is not finished
      const validRaceStatuses = ['SCHEDULED', 'CHECKING', 'READY'];
      setApprovedRegs(regData.filter((r: any) => {
        const isApprovedNoJockey = r.status === 'APPROVED' && !r.jockeyUserId;
        const rStatus = r.raceId?.status;
        const isRaceValid = validRaceStatuses.includes(rStatus);
        return isApprovedNoJockey && isRaceValid;
      }));
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
    
    // Guard: kiểm tra lại status của race trước khi gọi API
    const reg = approvedRegs.find(r => (r._id || r.id) === selectedRegId);
    if (reg) {
      const rStatus = reg.raceId?.status;
      if (!['SCHEDULED', 'CHECKING', 'READY'].includes(rStatus)) {
        Alert.alert('Lỗi', 'Không thể mời Jockey vì trận đua đã kết thúc hoặc đã công bố kết quả.');
        return;
      }
    }

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
      let msg = err.message || 'Gửi lời mời thất bại.';
      if (msg.includes('Cannot invite a jockey when race is in RESULT_PUBLISHED status')) {
        msg = 'Không thể mời Jockey vì trận đua đã công bố kết quả.';
      }
      Alert.alert('Lỗi', msg);
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
    setSelectedJockey(jockey);
    setSelectedRegId('');
    setSharePercent(30);
    setInvMessage('');
    setShowInviteModal(true);
  };

  if (loading && !refreshing) return <LoadingState />;

  const filteredJockeys = jockeys.filter(j => {
    if (!search) return true;
    const q = search.toLowerCase();
    const name = j.userId?.fullName || '';
    const specialty = j.specialty || '';
    return name.toLowerCase().includes(q) || specialty.toLowerCase().includes(q);
  });

  const availableJockeys = filteredJockeys.filter(j => j.status === 'available');

  return (
    <AppScreen scroll refreshing={refreshing} onRefresh={onRefresh}>
      <View style={s.content}>
        
        {/* Segment Tabs */}
        <View style={s.segmentContainer}>
          <TouchableOpacity
            style={[s.segmentBtn, tab === 'marketplace' && s.segmentBtnActive]}
            onPress={() => setTab('marketplace')}
            activeOpacity={0.8}
          >
            <Text style={[s.segmentText, tab === 'marketplace' && s.segmentTextActive]}>Thị trường</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[s.segmentBtn, tab === 'history' && s.segmentBtnActive]}
            onPress={() => setTab('history')}
            activeOpacity={0.8}
          >
            <Text style={[s.segmentText, tab === 'history' && s.segmentTextActive]}>Đã gửi ({invitations.length})</Text>
          </TouchableOpacity>
        </View>

        {tab === 'marketplace' ? (
          <>
            <View style={s.searchWrap}>
              <MaterialIcons name="search" size={20} color={premiumColors.textMuted} />
              <TextInput
                style={s.searchInput}
                placeholder="Tìm Jockey theo tên, sở trường..."
                placeholderTextColor={premiumColors.textMuted}
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
                        <MaterialIcons name="person" size={24} color={premiumColors.brand} />
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
                        <Text style={[s.statVal, { color: premiumColors.success }]}>{winRate}%</Text>
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

                    <TouchableOpacity
                      style={s.btnPrimary}
                      onPress={() => openInviteModal(j)}
                      activeOpacity={0.8}
                    >
                      <Text style={s.btnPrimaryText}>＋ Gửi lời mời</Text>
                    </TouchableOpacity>
                  </View>
                );
              })
            )}
          </>
        ) : (
          <Section title="Lời mời đã gửi">
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
                          activeOpacity={0.8}
                        >
                          <MaterialIcons name="cancel" size={14} color={premiumColors.danger} />
                          <Text style={s.cancelBtnText}>{cancelling === id ? '...' : 'Hủy lời mời'}</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                );
              })
            )}
          </Section>
        )}

        {/* Send Invitation Modal */}
        <Modal visible={showInviteModal} animationType="slide" transparent>
          <View style={s.modalOverlay}>
            <View style={s.modalContent}>
              <View style={s.modalHeader}>
                <Text style={s.modalTitle}>Gửi Lời Mời</Text>
                <TouchableOpacity onPress={() => setShowInviteModal(false)}>
                  <MaterialIcons name="close" size={24} color={premiumColors.textSecondary} />
                </TouchableOpacity>
              </View>

              {selectedJockey && (
                <View style={s.jockeySummary}>
                  <MaterialIcons name="person" size={20} color={premiumColors.brand} />
                  <View>
                    <Text style={s.summaryName}>{selectedJockey.userId?.fullName || 'Jockey'}</Text>
                    <Text style={s.summaryStats}>{selectedJockey.experienceYears || 0} năm KN · {selectedJockey.totalRaces || 0} trận · {selectedJockey.wins || 0} thắng</Text>
                  </View>
                </View>
              )}

              <ScrollView style={{ maxHeight: 350 }} showsVerticalScrollIndicator={false}>
                <Text style={s.fieldLabel}>Chọn ngựa & trận đua *</Text>
                {approvedRegs.length === 0 ? (
                  <Text style={{ color: premiumColors.warning, fontSize: 13, marginVertical: 12, lineHeight: 20 }}>
                    Không có trận đua nào còn có thể mời Jockey. Chỉ có thể mời trước khi trận đua kết thúc.
                  </Text>
                ) : (
                  approvedRegs.map(r => {
                    const horse = typeof r.horseId === 'object' ? r.horseId?.name : 'Ngựa';
                    const race = typeof r.raceId === 'object' ? r.raceId?.name : 'Trận đua';
                    const tournament = typeof r.tournamentId === 'object' ? r.tournamentId?.name : '';
                    const id = r._id || r.id;
                    const selected = selectedRegId === id;
                    const dateStr = r.raceId?.startTime ? formatDateTime(r.raceId.startTime) : '';

                    return (
                      <TouchableOpacity
                        key={id}
                        style={[s.regOption, selected && s.regOptionSelected]}
                        onPress={() => setSelectedRegId(id)}
                        activeOpacity={0.8}
                      >
                        <MaterialIcons name={selected ? 'radio-button-checked' : 'radio-button-unchecked'} size={18} color={selected ? premiumColors.brand : premiumColors.textMuted} />
                        <View style={{ flex: 1, marginLeft: 12 }}>
                          <Text style={s.regOptionText}>🐴 {horse}</Text>
                          <Text style={{ fontSize: 12, color: premiumColors.textSecondary, marginTop: 4 }}>
                            🏁 {tournament ? `${tournament} - ` : ''}{race}{dateStr ? ` (${dateStr})` : ''}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    );
                  })
                )}

                <Text style={[s.fieldLabel, { marginTop: 16 }]}>% Chia thưởng cho Jockey (5-50%): {sharePercent}%</Text>
                <View style={s.sliderRow}>
                  <TouchableOpacity style={s.stepBtn} onPress={() => setSharePercent(Math.max(5, sharePercent - 5))} activeOpacity={0.8}>
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
                  <TouchableOpacity style={s.stepBtn} onPress={() => setSharePercent(Math.min(50, sharePercent + 5))} activeOpacity={0.8}>
                    <Text style={s.stepBtnText}>+ 5%</Text>
                  </TouchableOpacity>
                </View>
                <View style={s.shareInfo}>
                  <Text style={s.shareText}>Chủ ngựa nhận: {100 - sharePercent}%</Text>
                  <Text style={s.shareText}>Jockey nhận: {sharePercent}%</Text>
                </View>

                <Text style={[s.fieldLabel, { marginTop: 16 }]}>Lời nhắn (tùy chọn)</Text>
                <TextInput
                  style={[s.input, { height: 72, textAlignVertical: 'top', paddingTop: 12 }]}
                  placeholder="Ví dụ: Mong bạn đồng hành cùng chiến mã!"
                  placeholderTextColor={premiumColors.textMuted}
                  multiline
                  value={invMessage}
                  onChangeText={setInvMessage}
                />
              </ScrollView>

              <View style={s.modalActions}>
                <TouchableOpacity style={s.btnOutlineModal} onPress={() => setShowInviteModal(false)} activeOpacity={0.8}>
                  <Text style={s.btnOutlineText}>Đóng</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[s.btnPrimaryModal, (!selectedRegId || submitting) && s.btnDisabled]}
                  onPress={handleSendInvite}
                  disabled={!selectedRegId || submitting}
                  activeOpacity={0.8}
                >
                  <Text style={s.btnPrimaryText}>{submitting ? 'Đang xử lý...' : 'Gửi lời mời'}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </AppScreen>
  );
}

const s = StyleSheet.create({
  content: {
    paddingHorizontal: premiumSpacing[16],
    paddingTop: premiumSpacing[16],
    paddingBottom: premiumSpacing[48],
  },
  segmentContainer: {
    flexDirection: 'row',
    backgroundColor: premiumColors.surface,
    borderRadius: premiumRadius[8],
    padding: 4,
    marginBottom: premiumSpacing[24],
    borderWidth: 1,
    borderColor: premiumColors.border,
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: premiumRadius[8],
    backgroundColor: 'transparent',
  },
  segmentBtnActive: {
    backgroundColor: premiumColors.surface2,
    borderWidth: 1,
    borderColor: premiumColors.borderSoft,
  },
  segmentText: {
    fontSize: 13,
    color: premiumColors.textSecondary,
    fontWeight: '500',
  },
  segmentTextActive: {
    color: premiumColors.text,
    fontWeight: '700',
  },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: premiumColors.surface2,
    borderWidth: 1,
    borderColor: premiumColors.border,
    borderRadius: premiumRadius[12],
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    color: premiumColors.text,
    fontSize: 14,
    height: 48,
  },
  countText: {
    color: premiumColors.textSecondary,
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 16,
  },
  jockeyCard: {
    backgroundColor: premiumColors.surface,
    borderWidth: 1,
    borderColor: premiumColors.border,
    borderRadius: premiumRadius[12],
    padding: 16,
    marginBottom: 12,
  },
  jockeyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  jockeyAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(225, 6, 0, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(225, 6, 0, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  jockeyName: {
    color: premiumColors.text,
    fontSize: 14,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  jockeyEmail: {
    color: premiumColors.textMuted,
    fontSize: 11,
    marginTop: 2,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  statItem: {
    flex: 1,
    backgroundColor: premiumColors.surface2,
    borderWidth: 1,
    borderColor: premiumColors.border,
    borderRadius: premiumRadius[8],
    padding: 10,
    alignItems: 'center',
  },
  statVal: {
    color: premiumColors.text,
    fontSize: 14,
    fontWeight: '900',
  },
  statLbl: {
    color: premiumColors.textMuted,
    fontSize: 9,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginTop: 4,
  },
  infoRow: {
    flexDirection: 'row',
    gap: 12,
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  infoText: {
    color: premiumColors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  bioText: {
    color: premiumColors.textSecondary,
    fontSize: 12,
    fontStyle: 'italic',
    backgroundColor: premiumColors.surface2,
    padding: 12,
    borderRadius: premiumRadius[8],
    marginBottom: 12,
  },
  btnPrimary: {
    backgroundColor: premiumColors.brand,
    paddingVertical: 12,
    borderRadius: premiumRadius[8],
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnPrimaryText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  btnDisabled: {
    opacity: 0.5,
  },
  invCard: {
    backgroundColor: premiumColors.surface,
    borderWidth: 1,
    borderColor: premiumColors.border,
    borderRadius: premiumRadius[12],
    padding: 16,
    marginBottom: 12,
  },
  invHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  invJockey: {
    color: premiumColors.text,
    fontSize: 14,
    fontWeight: '800',
  },
  invHorse: {
    color: premiumColors.textSecondary,
    fontSize: 12,
    marginTop: 4,
  },
  invShare: {
    color: premiumColors.success,
    fontSize: 11,
    fontWeight: '700',
    marginTop: 4,
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
  invFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: premiumColors.border,
  },
  invDate: {
    color: premiumColors.textMuted,
    fontSize: 11,
  },
  cancelBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: premiumRadius[8],
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.4)',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  cancelBtnText: {
    color: premiumColors.danger,
    fontSize: 12,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: premiumColors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: premiumColors.border,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    color: premiumColors.text,
    fontSize: 18,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  jockeySummary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: premiumColors.surface2,
    borderWidth: 1,
    borderColor: premiumColors.border,
    borderRadius: premiumRadius[12],
    padding: 16,
    marginBottom: 20,
  },
  summaryName: {
    color: premiumColors.text,
    fontSize: 14,
    fontWeight: '800',
  },
  summaryStats: {
    color: premiumColors.textMuted,
    fontSize: 11,
    marginTop: 4,
  },
  fieldLabel: {
    color: premiumColors.textSecondary,
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  regOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: premiumColors.border,
    borderRadius: premiumRadius[12],
    marginBottom: 8,
    backgroundColor: premiumColors.surface2,
  },
  regOptionSelected: {
    borderColor: 'rgba(225, 6, 0, 0.4)',
    backgroundColor: 'rgba(225, 6, 0, 0.05)',
  },
  regOptionText: {
    color: premiumColors.text,
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
  },
  sliderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  stepBtn: {
    backgroundColor: premiumColors.surface2,
    borderWidth: 1,
    borderColor: premiumColors.borderStrong,
    borderRadius: premiumRadius[8],
    width: 60,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepBtnText: {
    color: premiumColors.text,
    fontSize: 13,
    fontWeight: '800',
  },
  inputSmall: {
    backgroundColor: premiumColors.surface2,
    borderWidth: 1,
    borderColor: premiumColors.border,
    color: premiumColors.text,
    borderRadius: premiumRadius[8],
    height: 48,
    paddingHorizontal: 12,
    fontSize: 16,
    fontWeight: '800',
  },
  shareInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  shareText: {
    color: premiumColors.textSecondary,
    fontSize: 11,
  },
  input: {
    backgroundColor: premiumColors.surface2,
    borderWidth: 1,
    borderColor: premiumColors.border,
    color: premiumColors.text,
    borderRadius: premiumRadius[8],
    height: 48,
    paddingHorizontal: 16,
    fontSize: 14,
    marginBottom: 16,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  btnOutlineModal: {
    flex: 1,
    borderWidth: 1,
    borderColor: premiumColors.borderStrong,
    borderRadius: premiumRadius[8],
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
  },
  btnOutlineText: {
    color: premiumColors.text,
    fontWeight: '700',
    fontSize: 14,
  },
  btnPrimaryModal: {
    flex: 2,
    backgroundColor: premiumColors.brand,
    borderRadius: premiumRadius[8],
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
  },
});
