import React, { useEffect, useState, useCallback } from 'react';
import { ScrollView, View, Text, StyleSheet, TouchableOpacity, RefreshControl, Modal, Alert, TextInput } from 'react-native';
import { C, LoadingState, EmptyState, SectionHeader, Card, PrimaryButton, OutlineButton, statusLabel, formatDate } from '@/components/ui/shared';
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

  if (loading) return <LoadingState />;

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      {view !== 'tournaments' && (
        <TouchableOpacity style={s.backBtn} onPress={goBack}>
          <MaterialIcons name="arrow-back" size={20} color={C.textSecondary} />
          <Text style={s.backText}>Quay lại danh sách giải đấu</Text>
        </TouchableOpacity>
      )}

      <ScrollView
        contentContainerStyle={s.p}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.red} colors={[C.red]} />}
      >
        {view === 'tournaments' ? (
          <>
            <SectionHeader title="Chọn giải đấu đang mở" />
            {tournaments.length === 0 ? (
              <EmptyState icon="emoji-events" title="Chưa có giải đấu" subtitle="Không tìm thấy giải đấu nào." />
            ) : (
              tournaments.map(t => {
                const id = t._id || t.id;
                const ts = statusLabel(t.status);
                const isOpen = t.status === 'OPEN_REGISTRATION';
                return (
                  <TouchableOpacity key={id} style={[s.tCard, isOpen && s.tCardOpen]} onPress={() => selectTournament(t)}>
                    <View style={{ flex: 1 }}>
                      <Text style={s.tName} numberOfLines={1}>{t.name}</Text>
                      <Text style={s.tDate}>{formatDate(t.startDate)} — {formatDate(t.endDate)}</Text>
                    </View>
                    <View style={[s.badge, { backgroundColor: ts.color + '20', borderColor: ts.color + '40' }]}>
                      <Text style={[s.badgeText, { color: ts.color }]}>{ts.label}</Text>
                    </View>
                    <MaterialIcons name="chevron-right" size={20} color={C.textMuted} />
                  </TouchableOpacity>
                );
              })
            )}
          </>
        ) : (
          <>
            <Card>
              <Text style={s.eyebrow}>Đang mở ghi danh</Text>
              <Text style={s.pageTitle}>{selectedTournament?.name}</Text>
              <Text style={s.pageDesc}>{selectedTournament?.description || 'Chọn vòng đua nhỏ bên dưới để đăng ký chiến mã.'}</Text>
            </Card>

            <SectionHeader title={`Các vòng đua (${races.length})`} />
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
                      <MaterialIcons name="flag" size={20} color={C.red} />
                      <Text style={s.raceName} numberOfLines={1}>{race.name}</Text>
                    </View>

                    <View style={s.raceStats}>
                      <Text style={s.statText}>📏 Cự ly: {race.distanceMeters}m</Text>
                      <Text style={s.statText}>📅 Ngày: {formatDate(race.startTime)}</Text>
                      <Text style={s.statText}>🐴 Chiến mã: {race.participantsCount || 0}/{race.maxParticipants || 20}</Text>
                    </View>

                    <View style={s.raceActions}>
                      {isRegistrationOpen ? (
                        isFull ? (
                          <OutlineButton title="Trận đấu đã đầy" onPress={() => {}} />
                        ) : (
                          <PrimaryButton title="Ghi danh chiến mã" onPress={() => openRegModal(race)} />
                        )
                      ) : (
                        <OutlineButton title="Giải đấu đã đóng đăng ký" onPress={() => {}} />
                      )}
                    </View>
                  </View>
                );
              })
            )}
          </>
        )}
      </ScrollView>

      {/* Registration Modal */}
      <Modal visible={showRegModal} animationType="slide" transparent>
        <View style={s.modalOverlay}>
          <View style={s.modalContent}>
            <View style={s.modalHeader}>
              <Text style={s.modalTitle}>Ghi Danh Chiến Mã</Text>
              <TouchableOpacity onPress={() => setShowRegModal(false)}>
                <MaterialIcons name="close" size={24} color={C.textSecondary} />
              </TouchableOpacity>
            </View>

            {selectedRace && (
              <View style={s.raceSummary}>
                <MaterialIcons name="flag" size={20} color={C.red} />
                <View>
                  <Text style={s.summaryName}>{selectedRace.name}</Text>
                  <Text style={s.summaryStats}>{selectedRace.distanceMeters}m · {formatDate(selectedRace.startTime)}</Text>
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
                  >
                    <MaterialIcons name={selected ? 'radio-button-checked' : 'radio-button-unchecked'} size={18} color={selected ? C.red : C.textMuted} />
                    <Text style={s.optionText}>🐴 {h.name} ({h.breed || 'Chưa rõ'})</Text>
                  </TouchableOpacity>
                );
              })}

              <Text style={[s.fieldLabel, { marginTop: 16 }]}>Ghi chú thêm</Text>
              <TextInput
                style={[s.input, { height: 72, textAlignVertical: 'top' }]}
                placeholder="Ví dụ: Mong ban tổ chức phê duyệt sớm..."
                placeholderTextColor={C.textMuted}
                multiline
                value={regNote}
                onChangeText={setRegNote}
              />
            </ScrollView>

            <View style={s.modalActions}>
              <OutlineButton title="Hủy" onPress={() => setShowRegModal(false)} />
              <PrimaryButton title="Nộp hồ sơ ghi danh" onPress={handleRegister} loading={submitting} disabled={!selectedHorseId} />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  p: { padding: 16, paddingBottom: 32 },
  backBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, padding: 12, borderBottomWidth: 1, borderBottomColor: C.cardBorder, backgroundColor: C.card },
  backText: { color: C.textSecondary, fontSize: 12, fontWeight: '700' },
  tCard: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: C.card, borderWidth: 1, borderColor: C.cardBorder, borderRadius: 14, padding: 14, marginBottom: 8 },
  tCardOpen: { borderColor: C.tealLight + '40', backgroundColor: C.tealLight + '03' },
  tName: { color: C.white, fontSize: 14, fontWeight: '800' },
  tDate: { color: C.textMuted, fontSize: 10, marginTop: 4 },
  badge: { borderWidth: 1, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  badgeText: { fontSize: 9, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.5 },
  eyebrow: { color: C.red, fontSize: 10, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1.5 },
  pageTitle: { color: C.white, fontSize: 18, fontWeight: '900', marginTop: 4 },
  pageDesc: { color: C.textSecondary, fontSize: 11, marginTop: 6, lineHeight: 16 },
  raceCard: { backgroundColor: C.card, borderWidth: 1, borderColor: C.cardBorder, borderRadius: 16, padding: 16, marginBottom: 12 },
  raceHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  raceName: { color: C.white, fontSize: 14, fontWeight: '800' },
  raceStats: { gap: 4, marginBottom: 12 },
  statText: { color: C.textSecondary, fontSize: 11, fontWeight: '600' },
  raceActions: { marginTop: 4 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: C.card, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, borderWidth: 1, borderColor: C.cardBorder },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  modalTitle: { color: C.white, fontSize: 18, fontWeight: '900', textTransform: 'uppercase' },
  raceSummary: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#00000030', borderWidth: 1, borderColor: C.cardBorder, borderRadius: 12, padding: 12, marginBottom: 16 },
  summaryName: { color: C.white, fontSize: 13, fontWeight: '800' },
  summaryStats: { color: C.textMuted, fontSize: 10, marginTop: 2 },
  fieldLabel: { color: C.textSecondary, fontSize: 10, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 },
  optionCard: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12, borderWidth: 1, borderColor: C.cardBorder, borderRadius: 10, marginBottom: 6, backgroundColor: '#00000020' },
  optionCardSelected: { borderColor: C.red + '60', backgroundColor: C.red + '10' },
  optionText: { color: C.white, fontSize: 12, fontWeight: '600', flex: 1 },
  input: { backgroundColor: C.inputBg, borderWidth: 1, borderColor: C.cardBorder, color: C.white, borderRadius: 12, height: 44, paddingHorizontal: 16, fontSize: 13, marginBottom: 12 },
  modalActions: { flexDirection: 'row', gap: 12, marginTop: 12 },
});
