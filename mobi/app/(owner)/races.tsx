import React, { useEffect, useState, useCallback } from 'react';
import { ScrollView, View, Text, StyleSheet, TouchableOpacity, RefreshControl, Modal, Alert, TextInput } from 'react-native';
import { AppScreen, Section } from '@/components/ui/premium';
import { premiumColors, premiumSpacing, premiumRadius } from '@/components/ui/premium-tokens';
import { LoadingState, EmptyState, statusLabel, formatDateTime } from '@/components/ui/shared';
import { tournamentsApi, racesApi, horsesApi, registrationsApi } from '@/lib/api-client';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

type ViewState = 'tournaments' | 'races';

export default function OwnerRaces() {
  const [view, setView] = useState<ViewState>('tournaments');
  const [tournaments, setTournaments] = useState<any[]>([]);
  const [races, setRaces] = useState<any[]>([]);
  const [horses, setHorses] = useState<any[]>([]);
  const [selectedTournament, setSelectedTournament] = useState<any>(null);
  const [selectedRace, setSelectedRace] = useState<any>(null);
  
  // Registration Modal State
  const [showRegModal, setShowRegModal] = useState(false);
  const [selectedHorseId, setSelectedHorseId] = useState('');
  const [regNote, setRegNote] = useState('');
  
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [tRes, hRes] = await Promise.all([
        tournamentsApi.list({ limit: 50 }).catch(() => ({ data: [] })),
        horsesApi.listMine({ limit: 100 }).catch(() => ({ data: [] })),
      ]);
      setTournaments((tRes as any).data || []);
      const horseData = (hRes as any).data || [];
      // Only approved horses can be registered
      setHorses(horseData.filter((h: any) => h.approvalStatus === 'APPROVED'));
    } catch {} finally { setLoading(false); }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    if (view === 'tournaments') {
      await loadData();
    } else if (view === 'races' && selectedTournament) {
      await selectTournament(selectedTournament);
    }
    setRefreshing(false);
  }, [view, selectedTournament, loadData]);

  const selectTournament = async (t: any) => {
    setSelectedTournament(t);
    setView('races');
    setLoading(true);
    try {
      const id = t._id || t.id;
      const res = await racesApi.listByTournament(id, { limit: 50 });
      setRaces((res as any).data || []);
    } catch {} finally { setLoading(false); }
  };

  const openRegModal = (race: any) => {
    if (horses.length === 0) {
      Alert.alert('Thông báo', 'Bạn chưa có chiến mã nào được duyệt. Vui lòng thêm chiến mã và đợi duyệt trước.');
      return;
    }
    setSelectedRace(race);
    setSelectedHorseId('');
    setRegNote('');
    setShowRegModal(true);
  };

  const handleRegister = async () => {
    if (!selectedHorseId) {
      Alert.alert('Lỗi', 'Vui lòng chọn chiến mã.');
      return;
    }
    setSubmitting(true);
    try {
      await registrationsApi.create({
        tournamentId: selectedTournament?._id || selectedTournament?.id,
        raceId: selectedRace?._id || selectedRace?.id,
        horseId: selectedHorseId,
        note: regNote || undefined,
      });
      Alert.alert('Thành công', 'Đã nộp hồ sơ đăng ký trận đua! Vui lòng chờ BTC duyệt.');
      setShowRegModal(false);
      // Reload race data to update participant count
      selectTournament(selectedTournament);
    } catch (err: any) {
      Alert.alert('Lỗi', err.message || 'Ghi danh thất bại.');
    } finally {
      setSubmitting(false);
    }
  };

  const goBack = () => {
    setView('tournaments');
    setRaces([]);
    setSelectedTournament(null);
  };

  if (loading && !refreshing) return <LoadingState />;

  return (
    <AppScreen scroll refreshing={refreshing} onRefresh={onRefresh}>
      <View style={s.content}>
        {view !== 'tournaments' && (
          <TouchableOpacity style={s.backBtn} onPress={goBack} activeOpacity={0.8}>
            <MaterialIcons name="arrow-back" size={20} color={premiumColors.textSecondary} />
            <Text style={s.backText}>Quay lại danh sách giải đấu</Text>
          </TouchableOpacity>
        )}

        {view === 'tournaments' ? (
          <Section title="Chọn giải đấu đang mở">
            {tournaments.length === 0 ? (
              <EmptyState icon="emoji-events" title="Chưa có giải đấu" subtitle="Không tìm thấy giải đấu nào." />
            ) : (
              tournaments.map(t => {
                const id = t._id || t.id;
                const ts = statusLabel(t.status);
                const isOpen = t.status === 'OPEN_REGISTRATION';
                return (
                  <TouchableOpacity key={id} style={[s.tCard, isOpen && s.tCardOpen]} onPress={() => selectTournament(t)} activeOpacity={0.8}>
                    <View style={{ flex: 1 }}>
                      <Text style={s.tName} numberOfLines={1}>{t.name}</Text>
                      <Text style={s.tDate}>{formatDateTime(t.startDate)} — {formatDateTime(t.endDate)}</Text>
                    </View>
                    <View style={[s.badge, { backgroundColor: ts.color + '20', borderColor: ts.color + '40' }]}>
                      <Text style={[s.badgeText, { color: ts.color }]}>{ts.label}</Text>
                    </View>
                    <MaterialIcons name="chevron-right" size={20} color={premiumColors.textMuted} />
                  </TouchableOpacity>
                );
              })
            )}
          </Section>
        ) : (
          <>
            <View style={s.tHero}>
              <Text style={s.eyebrow}>Đang mở ghi danh</Text>
              <Text style={s.pageTitle}>{selectedTournament?.name}</Text>
              <Text style={s.pageDesc}>{selectedTournament?.description || 'Chọn vòng đua nhỏ bên dưới để đăng ký chiến mã.'}</Text>
            </View>

            <Section title={`Các vòng đua (${races.length})`}>
              {races.length === 0 ? (
                <EmptyState icon="flag" title="Chưa có vòng đua" subtitle="Giải đấu này chưa có vòng đua nào được thiết lập." />
              ) : (
                races.map(race => {
                  const id = race._id || race.id;
                  const isFull = (race.participantsCount || 0) >= (race.maxParticipants || 20);
                  const isRegistrationOpen = selectedTournament?.status === 'OPEN_REGISTRATION';

                  return (
                    <View key={id} style={s.raceCard}>
                      <View style={s.raceHeader}>
                        <MaterialIcons name="flag" size={20} color={premiumColors.brand} />
                        <Text style={s.raceName} numberOfLines={1}>{race.name}</Text>
                      </View>

                      <View style={s.raceStats}>
                        <Text style={s.statText}>📏 Cự ly: {race.distanceMeters}m</Text>
                        <Text style={s.statText}>📅 Ngày: {formatDateTime(race.startTime)}</Text>
                        <Text style={s.statText}>🐴 Chiến mã: {race.participantsCount || 0}/{race.maxParticipants || 20}</Text>
                      </View>

                      <View style={s.raceActions}>
                        {isRegistrationOpen ? (
                          isFull ? (
                            <TouchableOpacity style={[s.btnOutline, { opacity: 0.5 }]} disabled>
                              <Text style={s.btnOutlineText}>Trận đấu đã đầy</Text>
                            </TouchableOpacity>
                          ) : (
                            <TouchableOpacity style={s.btnPrimary} onPress={() => openRegModal(race)} activeOpacity={0.8}>
                              <Text style={s.btnPrimaryText}>Ghi danh chiến mã</Text>
                            </TouchableOpacity>
                          )
                        ) : (
                          <TouchableOpacity style={[s.btnOutline, { opacity: 0.5 }]} disabled>
                            <Text style={s.btnOutlineText}>Giải đấu đã đóng đăng ký</Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    </View>
                  );
                })
              )}
            </Section>
          </>
        )}

        {/* Registration Modal */}
        <Modal visible={showRegModal} animationType="slide" transparent>
          <View style={s.modalOverlay}>
            <View style={s.modalContent}>
              <View style={s.modalHeader}>
                <Text style={s.modalTitle}>Ghi Danh Chiến Mã</Text>
                <TouchableOpacity onPress={() => setShowRegModal(false)}>
                  <MaterialIcons name="close" size={24} color={premiumColors.textSecondary} />
                </TouchableOpacity>
              </View>

              {selectedRace && (
                <View style={s.raceSummary}>
                  <MaterialIcons name="flag" size={20} color={premiumColors.brand} />
                  <View>
                    <Text style={s.summaryName}>{selectedRace.name}</Text>
                    <Text style={s.summaryStats}>{selectedRace.distanceMeters}m · {formatDateTime(selectedRace.startTime)}</Text>
                  </View>
                </View>
              )}

              <ScrollView style={{ maxHeight: 300 }} showsVerticalScrollIndicator={false}>
                <Text style={s.fieldLabel}>Chọn chiến mã của bạn *</Text>
                {horses.map(h => {
                  const id = h._id || h.id;
                  const selected = selectedHorseId === id;
                  return (
                    <TouchableOpacity
                      key={id}
                      style={[s.optionCard, selected && s.optionCardSelected]}
                      onPress={() => setSelectedHorseId(id)}
                      activeOpacity={0.8}
                    >
                      <MaterialIcons name={selected ? 'radio-button-checked' : 'radio-button-unchecked'} size={18} color={selected ? premiumColors.brand : premiumColors.textMuted} />
                      <Text style={s.optionText}>🐴 {h.name} ({h.breed || 'Chưa rõ'})</Text>
                    </TouchableOpacity>
                  );
                })}

                <Text style={[s.fieldLabel, { marginTop: 16 }]}>Ghi chú thêm</Text>
                <TextInput
                  style={[s.input, { height: 72, textAlignVertical: 'top', paddingTop: 12 }]}
                  placeholder="Ví dụ: Mong ban tổ chức phê duyệt sớm..."
                  placeholderTextColor={premiumColors.textMuted}
                  multiline
                  value={regNote}
                  onChangeText={setRegNote}
                />
              </ScrollView>

              <View style={s.modalActions}>
                <TouchableOpacity style={s.btnOutlineModal} onPress={() => setShowRegModal(false)} activeOpacity={0.8}>
                  <Text style={s.btnOutlineText}>Hủy</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[s.btnPrimaryModal, (!selectedHorseId || submitting) && s.btnDisabled]}
                  onPress={handleRegister}
                  disabled={!selectedHorseId || submitting}
                  activeOpacity={0.8}
                >
                  <Text style={s.btnPrimaryText}>{submitting ? 'Đang gửi...' : 'Nộp hồ sơ ghi danh'}</Text>
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
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: premiumColors.surface,
    borderRadius: premiumRadius[8],
    borderWidth: 1,
    borderColor: premiumColors.border,
    marginBottom: premiumSpacing[24],
  },
  backText: {
    color: premiumColors.textSecondary,
    fontSize: 12,
    fontWeight: '700',
  },
  tCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: premiumColors.surface,
    borderWidth: 1,
    borderColor: premiumColors.border,
    borderRadius: premiumRadius[12],
    padding: 14,
    marginBottom: 8,
  },
  tCardOpen: {
    borderColor: 'rgba(52, 211, 153, 0.4)',
    backgroundColor: 'rgba(52, 211, 153, 0.05)',
  },
  tName: {
    color: premiumColors.text,
    fontSize: 14,
    fontWeight: '800',
  },
  tDate: {
    color: premiumColors.textMuted,
    fontSize: 10,
    marginTop: 4,
  },
  badge: {
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  tHero: {
    backgroundColor: premiumColors.surface,
    borderWidth: 1,
    borderColor: premiumColors.border,
    borderRadius: premiumRadius[12],
    padding: 20,
    marginBottom: 24,
  },
  eyebrow: {
    color: premiumColors.brand,
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  pageTitle: {
    color: premiumColors.text,
    fontSize: 18,
    fontWeight: '900',
    marginTop: 4,
  },
  pageDesc: {
    color: premiumColors.textSecondary,
    fontSize: 11,
    marginTop: 6,
    lineHeight: 16,
  },
  raceCard: {
    backgroundColor: premiumColors.surface,
    borderWidth: 1,
    borderColor: premiumColors.border,
    borderRadius: premiumRadius[12],
    padding: 16,
    marginBottom: 12,
  },
  raceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  raceName: {
    color: premiumColors.text,
    fontSize: 14,
    fontWeight: '800',
  },
  raceStats: {
    gap: 4,
    marginBottom: 16,
  },
  statText: {
    color: premiumColors.textSecondary,
    fontSize: 11,
    fontWeight: '600',
  },
  raceActions: {
    marginTop: 4,
  },
  btnPrimary: {
    backgroundColor: premiumColors.brand,
    paddingVertical: 12,
    borderRadius: premiumRadius[8],
    alignItems: 'center',
  },
  btnPrimaryText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  btnOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: premiumColors.borderStrong,
    paddingVertical: 12,
    borderRadius: premiumRadius[8],
    alignItems: 'center',
  },
  btnOutlineText: {
    color: premiumColors.text,
    fontWeight: '700',
    fontSize: 13,
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
    padding: 20,
    borderWidth: 1,
    borderColor: premiumColors.border,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    color: premiumColors.text,
    fontSize: 18,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  raceSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: premiumColors.surface2,
    borderWidth: 1,
    borderColor: premiumColors.border,
    borderRadius: premiumRadius[12],
    padding: 12,
    marginBottom: 16,
  },
  summaryName: {
    color: premiumColors.text,
    fontSize: 13,
    fontWeight: '800',
  },
  summaryStats: {
    color: premiumColors.textMuted,
    fontSize: 10,
    marginTop: 2,
  },
  fieldLabel: {
    color: premiumColors.textSecondary,
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: premiumColors.border,
    borderRadius: premiumRadius[8],
    marginBottom: 6,
    backgroundColor: premiumColors.surface2,
  },
  optionCardSelected: {
    borderColor: 'rgba(225, 6, 0, 0.4)',
    backgroundColor: 'rgba(225, 6, 0, 0.1)',
  },
  optionText: {
    color: premiumColors.text,
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
  },
  input: {
    backgroundColor: premiumColors.surface2,
    borderWidth: 1,
    borderColor: premiumColors.border,
    color: premiumColors.text,
    borderRadius: premiumRadius[8],
    height: 44,
    paddingHorizontal: 16,
    fontSize: 13,
    marginBottom: 12,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  btnOutlineModal: {
    flex: 1,
    borderWidth: 1,
    borderColor: premiumColors.borderStrong,
    borderRadius: premiumRadius[8],
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  btnPrimaryModal: {
    flex: 2,
    backgroundColor: premiumColors.brand,
    borderRadius: premiumRadius[8],
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  btnDisabled: {
    opacity: 0.5,
  },
});
