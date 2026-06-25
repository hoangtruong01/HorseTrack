import React, { useEffect, useState, useCallback } from 'react';
import { ScrollView, View, Text, StyleSheet, Alert, RefreshControl, TouchableOpacity, Modal, TextInput, useColorScheme, Image } from 'react-native';
import { AppScreen, Section } from '@/components/ui/premium';
import { SleekHeader } from '@/components/ui/sleek-header';
import { usePremiumColors, premiumSpacing, premiumRadius, premiumTypography, premiumShadows } from '@/components/ui/premium-tokens';
import { LoadingState, EmptyState, statusLabel, formatDateTime } from '@/components/ui/shared';
import { jockeyInvitationsApi, jockeysApi, registrationsApi } from '@/lib/api-client';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

type TabKey = 'marketplace' | 'history';

const GridBackground = ({ isDark }: { isDark: boolean }) => {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <View style={{ flex: 1, backgroundColor: isDark ? '#09090B' : '#F4F4F5' }} />
    </View>
  );
};

export default function OwnerInvitations() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = usePremiumColors();
  const styles = React.useMemo(() => getStyles(isDark, colors), [isDark, colors]);

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
    } catch { } finally { setLoading(false); }
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
    <AppScreen refreshing={refreshing} onRefresh={onRefresh} safeArea={false}>
      <SleekHeader title="LỜI MỜI JOCKEY" showWallet={true} />
      <GridBackground isDark={isDark} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.brand} />}
      >
        {/* Segment Tabs */}
        <View style={styles.segmentContainer}>
          <TouchableOpacity
            style={[styles.segmentBtn, tab === 'marketplace' && styles.segmentBtnActive]}
            onPress={() => setTab('marketplace')}
            activeOpacity={0.8}
          >
            <Text style={[styles.segmentText, tab === 'marketplace' && styles.segmentTextActive]}>Thị trường</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.segmentBtn, tab === 'history' && styles.segmentBtnActive]}
            onPress={() => setTab('history')}
            activeOpacity={0.8}
          >
            <Text style={[styles.segmentText, tab === 'history' && styles.segmentTextActive]}>
              Đã gửi ({invitations.length})
            </Text>
          </TouchableOpacity>
        </View>

        {tab === 'marketplace' ? (
          <>
            <View style={styles.searchWrap}>
              <MaterialIcons name="search" size={20} color={colors.textMuted} />
              <TextInput
                style={styles.searchInput}
                placeholder="Tìm Jockey theo tên, sở trường..."
                placeholderTextColor={colors.textMuted}
                value={search}
                onChangeText={setSearch}
              />
            </View>
            <Text style={styles.countText}>{availableJockeys.length} Jockey sẵn sàng</Text>

            {availableJockeys.length === 0 ? (
              <EmptyState icon="person-search" title="Không tìm thấy" subtitle="Không có Jockey nào sẵn sàng phù hợp." />
            ) : (
              availableJockeys.map(j => {
                const name = j.userId?.fullName || 'Ẩn danh';
                const email = j.userId?.email || '';
                const avatar = j.userId?.avatar || j.userId?.avatarUrl || j.userId?.imageUrl || j.userId?.profilePicture;
                const winRate = j.totalRaces > 0 ? ((j.wins / j.totalRaces) * 100).toFixed(1) : '0';
                return (
                  <View key={j._id} style={styles.jockeyCard}>
                    {/* TOP ROW: Info & Badge */}
                    <View style={styles.jcTopRow}>
                      <View style={styles.jcAvatarWrap}>
                        {avatar ? (
                          <Image source={{ uri: avatar }} style={{ width: 56, height: 56, borderRadius: 28 }} resizeMode="cover" />
                        ) : (
                          <Text style={styles.jcAvatarInitial}>{name.charAt(0).toUpperCase()}</Text>
                        )}
                      </View>
                      <View style={styles.jcInfoWrap}>
                        <Text style={styles.jcName} numberOfLines={1}>{name}</Text>
                        <Text style={styles.jcEmail} numberOfLines={1}>{email}</Text>

                        <View style={styles.jcTagsRow}>
                          {j.heightCm > 0 && <Text style={styles.jcTagText}>{j.heightCm}cm</Text>}
                          {j.heightCm > 0 && j.weightKg > 0 && <Text style={styles.jcTagDot}>•</Text>}
                          {j.weightKg > 0 && <Text style={styles.jcTagText}>{j.weightKg}kg</Text>}
                        </View>
                      </View>
                      {j.specialty ? (
                        <View style={styles.jcSpecialtyBadge}>
                          <Text style={styles.jcSpecialtyText}>⭐ {j.specialty}</Text>
                        </View>
                      ) : null}
                    </View>

                    {/* STATS BANNER */}
                    <View style={styles.jcStatsBanner}>
                      <View style={styles.jcStatItem}>
                        <Text style={styles.jcStatValue}>{j.experienceYears || 0}</Text>
                        <Text style={styles.jcStatLabel}>NĂM KN</Text>
                      </View>
                      <View style={styles.jcStatDivider} />
                      <View style={styles.jcStatItem}>
                        <Text style={styles.jcStatValue}>{j.totalRaces || 0}</Text>
                        <Text style={styles.jcStatLabel}>TRẬN</Text>
                      </View>
                      <View style={styles.jcStatDivider} />
                      <View style={styles.jcStatItem}>
                        <Text style={[styles.jcStatValue, { color: colors.success }]}>{winRate}%</Text>
                        <Text style={styles.jcStatLabel}>TỶ LỆ THẮNG</Text>
                      </View>
                    </View>

                    {/* BIO */}
                    {j.bio && (
                      <Text style={styles.jcBio} numberOfLines={2}>
                        &quot;{j.bio}&quot;
                      </Text>
                    )}

                    <TouchableOpacity
                      style={styles.jcActionBtn}
                      onPress={() => openInviteModal(j)}
                      activeOpacity={0.8}
                    >
                      <MaterialIcons name="send" size={16} color={colors.brand} />
                      <Text style={styles.jcActionText}>Gửi Lời Mời Hợp Tác</Text>
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
                  <View key={id} style={styles.invCard}>
                    <View style={styles.invHeader}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.invJockey}>Jockey: {jockeyName}</Text>
                        <Text style={styles.invHorse}>🐴 {horseName} · 🏁 {raceName}</Text>
                        <Text style={styles.invShare}>Chia thưởng: {inv.jockeySharePercent || inv.prizeSharePercentage || 30}%</Text>
                      </View>
                      <View style={[styles.statusBadge, { backgroundColor: st.color + '15', borderColor: st.color + '40' }]}>
                        <Text style={[styles.statusBadgeText, { color: st.color }]}>{st.label}</Text>
                      </View>
                    </View>

                    <View style={styles.invFooter}>
                      <Text style={styles.invDate}>{formatDateTime(inv.createdAt)}</Text>
                      {isPending && (
                        <TouchableOpacity
                          style={styles.cancelBtn}
                          onPress={() => handleCancelInvite(id)}
                          disabled={cancelling === id}
                          activeOpacity={0.8}
                        >
                          <MaterialIcons name="cancel" size={14} color={colors.danger} />
                          <Text style={styles.cancelBtnText}>{cancelling === id ? '...' : 'Hủy lời mời'}</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                );
              })
            )}
          </Section>
        )}
      </ScrollView>

      {/* Send Invitation Modal */}
      <Modal visible={showInviteModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Gửi Lời Mời Hợp Tác</Text>
              <TouchableOpacity onPress={() => setShowInviteModal(false)} style={styles.closeIconBox} activeOpacity={0.8}>
                <MaterialIcons name="close" size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            {selectedJockey && (
              <View style={styles.jockeySummary}>
                <View style={styles.jockeySummaryAvatar}>
                  <MaterialIcons name="person" size={20} color={colors.brand} />
                </View>
                <View>
                  <Text style={styles.summaryName}>{selectedJockey.userId?.fullName || 'Jockey'}</Text>
                  <Text style={styles.summaryStats}>
                    {selectedJockey.experienceYears || 0} năm KN · {selectedJockey.totalRaces || 0} trận · {selectedJockey.wins || 0} thắng
                  </Text>
                </View>
              </View>
            )}

            <ScrollView style={{ maxHeight: 330 }} showsVerticalScrollIndicator={false}>
              <Text style={styles.fieldLabel}>Chọn chiến mã & trận đua của giải đấu *</Text>
              {approvedRegs.length === 0 ? (
                <Text style={styles.warningText}>
                  Không có trận đua khả dụng nào cần mời Jockey. Chỉ có thể mời Jockey trước khi cuộc đua bắt đầu.
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
                      style={[styles.regOption, selected && styles.regOptionSelected]}
                      onPress={() => setSelectedRegId(id)}
                      activeOpacity={0.8}
                    >
                      <MaterialIcons
                        name={selected ? 'radio-button-checked' : 'radio-button-unchecked'}
                        size={18}
                        color={selected ? colors.brand : colors.textMuted}
                      />
                      <View style={{ flex: 1, marginLeft: 12 }}>
                        <Text style={styles.regOptionText}>🐴 {horse}</Text>
                        <Text style={styles.regOptionSubText}>
                          🏁 {tournament ? `${tournament} - ` : ''}{race}{dateStr ? ` (${dateStr})` : ''}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  );
                })
              )}

              <Text style={[styles.fieldLabel, { marginTop: 16 }]}>% Chia thưởng cho Jockey (5-50%): {sharePercent}%</Text>
              <View style={styles.sliderRow}>
                <TouchableOpacity style={styles.stepBtn} onPress={() => setSharePercent(Math.max(5, sharePercent - 5))} activeOpacity={0.8}>
                  <Text style={styles.stepBtnText}>- 5%</Text>
                </TouchableOpacity>
                <View style={{ flex: 1 }}>
                  <TextInput
                    style={[styles.inputSmall, { textAlign: 'center' }]}
                    keyboardType="numeric"
                    value={String(sharePercent)}
                    onChangeText={v => {
                      const num = parseInt(v) || 5;
                      setSharePercent(Math.min(50, Math.max(5, num)));
                    }}
                  />
                </View>
                <TouchableOpacity style={styles.stepBtn} onPress={() => setSharePercent(Math.min(50, sharePercent + 5))} activeOpacity={0.8}>
                  <Text style={styles.stepBtnText}>+ 5%</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.shareInfo}>
                <Text style={styles.shareText}>Chủ ngựa nhận: {100 - sharePercent}%</Text>
                <Text style={styles.shareText}>Jockey nhận: {sharePercent}%</Text>
              </View>

              <Text style={[styles.fieldLabel, { marginTop: 16 }]}>Lời nhắn (tùy chọn)</Text>
              <TextInput
                style={[styles.input, { height: 72, textAlignVertical: 'top', paddingTop: 12 }]}
                placeholder="Ví dụ: Mong bạn đồng hành cùng chiến mã!"
                placeholderTextColor={colors.textMuted}
                multiline
                value={invMessage}
                onChangeText={setInvMessage}
              />
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.btnOutlineModal} onPress={() => setShowInviteModal(false)} activeOpacity={0.8}>
                <Text style={styles.btnOutlineText}>Đóng</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.btnPrimaryModal, (!selectedRegId || submitting) && styles.btnDisabled]}
                onPress={handleSendInvite}
                disabled={!selectedRegId || submitting}
                activeOpacity={0.8}
              >
                <Text style={styles.btnPrimaryText}>{submitting ? 'Đang xử lý...' : 'Gửi lời mời'}</Text>
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
    paddingHorizontal: premiumSpacing[16],
    paddingTop: premiumSpacing[16],
    paddingBottom: 100,
  },
  segmentContainer: {
    flexDirection: 'row',
    backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)',
    borderRadius: premiumRadius[12],
    padding: 4,
    marginBottom: premiumSpacing[20],
    borderWidth: 1,
    borderColor: colors.border,
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: premiumRadius[8],
    backgroundColor: 'transparent',
  },
  segmentBtnActive: {
    backgroundColor: isDark ? colors.surface3 : '#FFFFFF',
    ...premiumShadows.subtle,
  },
  segmentText: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  segmentTextActive: {
    color: colors.text,
    fontWeight: '800',
  },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: premiumRadius[24],
    paddingHorizontal: 16,
    marginBottom: 12,
    ...premiumShadows.subtle,
  },
  searchInput: {
    flex: 1,
    color: colors.text,
    fontSize: 14,
    height: 48,
  },
  countText: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 16,
    paddingLeft: 4,
  },
  jockeyCard: {
    backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: isDark ? 'rgba(255,255,255,0.05)' : colors.border,
    ...premiumShadows.glass,
  },
  jcTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  jcAvatarWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.brand,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
    ...premiumShadows.redGlow,
  },
  jcAvatarInitial: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '900',
  },
  jcInfoWrap: {
    flex: 1,
  },
  jcName: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: -0.5,
    marginBottom: 2,
    textTransform: 'uppercase',
  },
  jcEmail: {
    color: colors.textMuted,
    fontSize: 12,
    marginBottom: 6,
  },
  jcTagsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  jcTagText: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: '600',
  },
  jcTagDot: {
    color: colors.textMuted,
    marginHorizontal: 6,
    fontSize: 10,
  },
  jcSpecialtyBadge: {
    backgroundColor: 'rgba(214, 168, 79, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(214, 168, 79, 0.3)',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignSelf: 'flex-start',
  },
  jcSpecialtyText: {
    color: colors.gold,
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  jcStatsBanner: {
    flexDirection: 'row',
    backgroundColor: isDark ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.02)',
    borderRadius: 14,
    paddingVertical: 12,
    marginBottom: 16,
    alignItems: 'center',
  },
  jcStatItem: {
    flex: 1,
    alignItems: 'center',
  },
  jcStatValue: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '900',
    marginBottom: 2,
  },
  jcStatLabel: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  jcStatDivider: {
    width: 1,
    height: 30,
    backgroundColor: colors.border,
  },
  jcBio: {
    color: colors.textSecondary,
    fontSize: 13,
    fontStyle: 'italic',
    lineHeight: 20,
    marginBottom: 16,
    textAlign: 'center',
    paddingHorizontal: 8,
  },
  jcActionBtn: {
    flexDirection: 'row',
    backgroundColor: isDark ? 'rgba(225, 6, 0, 0.15)' : 'rgba(225, 6, 0, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(225, 6, 0, 0.3)',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  jcActionText: {
    color: colors.brand,
    fontSize: 14,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  btnDisabled: {
    opacity: 0.5,
  },
  invCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: premiumRadius[16],
    padding: 16,
    marginBottom: 16,
    ...premiumShadows.subtle,
  },
  invHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  invJockey: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '800',
  },
  invHorse: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 4,
  },
  invShare: {
    color: colors.success,
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
    borderTopColor: colors.border,
  },
  invDate: {
    color: colors.textMuted,
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
    color: colors.danger,
    fontSize: 12,
    fontWeight: '700',
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
  jockeySummary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: premiumRadius[12],
    padding: 12,
    marginBottom: 16,
  },
  jockeySummaryAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: isDark ? 'rgba(225, 6, 0, 0.1)' : 'rgba(225, 6, 0, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(225, 6, 0, 0.15)',
  },
  summaryName: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '800',
  },
  summaryStats: {
    color: colors.textMuted,
    fontSize: 11,
    marginTop: 2,
  },
  fieldLabel: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  regOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: premiumRadius[12],
    marginBottom: 8,
    backgroundColor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)',
  },
  regOptionSelected: {
    borderColor: 'rgba(225, 6, 0, 0.35)',
    backgroundColor: 'rgba(225, 6, 0, 0.05)',
  },
  regOptionText: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '700',
  },
  regOptionSubText: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 4,
  },
  sliderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  stepBtn: {
    backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
    borderWidth: 1,
    borderColor: colors.borderStrong,
    borderRadius: premiumRadius[8],
    width: 60,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepBtnText: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '800',
  },
  inputSmall: {
    backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.01)',
    borderWidth: 1,
    borderColor: colors.border,
    color: colors.text,
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
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: '600',
  },
  input: {
    backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : '#FFFFFF',
    borderWidth: 1,
    borderColor: colors.border,
    color: colors.text,
    borderRadius: 10,
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
    fontSize: 14,
    fontWeight: '800',
  },
  warningText: {
    color: colors.warning,
    fontSize: 13,
    marginVertical: 12,
    lineHeight: 20,
  },
  closeIconBox: {
    width: 36,
    height: 36,
    borderRadius: premiumRadius[8],
    backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
