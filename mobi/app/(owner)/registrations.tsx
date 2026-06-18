import React, { useEffect, useState, useCallback } from 'react';
import { ScrollView, View, Text, StyleSheet, TouchableOpacity, RefreshControl, Modal, Alert, TextInput, ActivityIndicator } from 'react-native';
import { C, LoadingState, EmptyState, ErrorState, SectionHeader, Card, PrimaryButton, OutlineButton, statusLabel, formatDate, formatDateTime } from '@/components/ui/shared';
import { tournamentsApi, racesApi, horsesApi, registrationsApi } from '@/lib/api-client';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import RaceResultsModal from '@/components/ui/race-results-modal';

type TabState = 'browse' | 'requests';
type ViewState = 'tournaments' | 'races';

export default function OwnerTournamentsAndRegistrations() {
  const [activeTab, setActiveTab] = useState<TabState>('browse');
  const [viewState, setViewState] = useState<ViewState>('tournaments');
  
  // Data State
  const [tournaments, setTournaments] = useState<any[]>([]);
  const [races, setRaces] = useState<any[]>([]);
  const [horses, setHorses] = useState<any[]>([]);
  const [myRegistrations, setMyRegistrations] = useState<any[]>([]);
  
  // Selection & Modal State
  const [selectedTournament, setSelectedTournament] = useState<any>(null);
  const [selectedRace, setSelectedRace] = useState<any>(null);
  const [showRegModal, setShowRegModal] = useState(false);
  const [selectedHorseId, setSelectedHorseId] = useState('');
  const [regNote, setRegNote] = useState('');

  // Results Modal State
  const [showResultsModal, setShowResultsModal] = useState(false);
  const [resultsRaceId, setResultsRaceId] = useState<string | null>(null);
  const [resultsRaceName, setResultsRaceName] = useState<string | null>(null);

  const openResultsModal = (race: any) => {
    setResultsRaceId(race._id || race.id);
    setResultsRaceName(race.name);
    setShowResultsModal(true);
  };

  // Race Details Modal State
  const [showRaceDetailsModal, setShowRaceDetailsModal] = useState(false);
  const [detailsRace, setDetailsRace] = useState<any | null>(null);
  const [detailsRegistrations, setDetailsRegistrations] = useState<any[]>([]);
  const [loadingDetails, setLoadingDetails] = useState(false);

  const openRaceDetailsModal = async (race: any) => {
    setDetailsRace(race);
    setShowRaceDetailsModal(true);
    setLoadingDetails(true);
    try {
      const res = await registrationsApi.list({ raceId: race._id || race.id, status: 'APPROVED', limit: 100 });
      setDetailsRegistrations(res.data || []);
    } catch (e) {
      console.error(e);
      setDetailsRegistrations([]);
    } finally {
      setLoadingDetails(false);
    }
  };
  
  // Loading & Action State
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [cancelling, setCancelling] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const loadInitialData = useCallback(async () => {
    setError(null);
    try {
      const [tRes, hRes] = await Promise.all([
        tournamentsApi.list({ limit: 100 }).catch(() => ({ data: [] })),
        horsesApi.listMine({ limit: 100 }).catch(() => ({ data: [] })),
      ]);
      setTournaments((tRes as any).data || []);
      const horseData = (hRes as any).data || [];
      // Only approved horses can register
      setHorses(horseData.filter((h: any) => h.approvalStatus === 'APPROVED'));
    } catch (err: any) {
      setError(err.message || 'Không thể tải dữ liệu giải đấu.');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadMyRegistrations = useCallback(async () => {
    setError(null);
    try {
      const res = await registrationsApi.listMine({ limit: 100 });
      setMyRegistrations((res as any).data || []);
    } catch (err: any) {
      setError(err.message || 'Không thể tải danh sách đăng ký.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'browse') {
      loadInitialData();
    } else {
      loadMyRegistrations();
    }
  }, [activeTab, loadInitialData, loadMyRegistrations]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    if (activeTab === 'browse') {
      if (viewState === 'tournaments') {
        await loadInitialData();
      } else if (viewState === 'races' && selectedTournament) {
        await selectTournament(selectedTournament);
      }
    } else {
      await loadMyRegistrations();
    }
    setRefreshing(false);
  }, [activeTab, viewState, selectedTournament, loadInitialData, loadMyRegistrations]);

  const selectTournament = async (t: any) => {
    setSelectedTournament(t);
    setViewState('races');
    setLoading(true);
    try {
      const id = t._id || t.id;
      const res = await racesApi.listByTournament(id, { limit: 50 });
      setRaces((res as any).data || []);
    } catch (err: any) {
      Alert.alert('Lỗi', 'Không thể tải danh sách vòng đua.');
    } finally {
      setLoading(false);
    }
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
      // Reload races to update counts
      selectTournament(selectedTournament);
    } catch (err: any) {
      Alert.alert('Lỗi', err.message || 'Ghi danh thất bại.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelRegistration = (id: string, status: string) => {
    const action = status === 'PENDING' ? 'hủy' : 'rút';
    Alert.alert(
      `Xác nhận ${action} đăng ký`,
      `Bạn có chắc muốn ${action} đăng ký này không?`,
      [
        { text: 'Không', style: 'cancel' },
        {
          text: `${action.charAt(0).toUpperCase() + action.slice(1)}`, style: 'destructive',
          onPress: async () => {
            setCancelling(id);
            try {
              if (status === 'PENDING') {
                await registrationsApi.cancel(id);
              } else {
                await registrationsApi.withdraw(id);
              }
              Alert.alert('Thành công', `Đã ${action} đăng ký thành công.`);
              loadMyRegistrations();
            } catch (err: any) {
              Alert.alert('Lỗi', err.message || `Không thể ${action} đăng ký.`);
            } finally {
              setCancelling(null);
            }
          },
        },
      ]
    );
  };

  const goBackToTournaments = () => {
    setViewState('tournaments');
    setRaces([]);
    setSelectedTournament(null);
  };

  const filteredTournaments = tournaments.filter(t =>
    !search || t.name.toLowerCase().includes(search.toLowerCase())
  );

  if (loading && !refreshing) return <LoadingState />;

  return (
    <View style={s.container}>
      {/* Segment tabs */}
      <View style={s.segmentContainer}>
        <TouchableOpacity
          style={[s.segmentBtn, activeTab === 'browse' && s.segmentBtnActive]}
          onPress={() => {
            setActiveTab('browse');
            setViewState('tournaments');
          }}
          activeOpacity={0.8}
        >
          <Text style={[s.segmentText, activeTab === 'browse' && s.segmentTextActive]}>Duyệt Giải Đấu</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[s.segmentBtn, activeTab === 'requests' && s.segmentBtnActive]}
          onPress={() => setActiveTab('requests')}
          activeOpacity={0.8}
        >
          <Text style={[s.segmentText, activeTab === 'requests' && s.segmentTextActive]}>Yêu Cầu Gửi Đi</Text>
        </TouchableOpacity>
      </View>

      {/* Main Content Area */}
      {activeTab === 'browse' ? (
        // Browse & Register Tournament View
        <View style={{ flex: 1 }}>
          {viewState === 'races' && (
            <TouchableOpacity style={s.backBtn} onPress={goBackToTournaments}>
              <MaterialIcons name="arrow-back" size={20} color={C.textSecondary} />
              <Text style={s.backText}>Quay lại danh sách giải đấu</Text>
            </TouchableOpacity>
          )}

          <ScrollView
            style={s.scrollView}
            contentContainerStyle={s.scrollContent}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.red} colors={[C.red]} />}
          >
            {error ? (
              <ErrorState message={error} onRetry={loadInitialData} />
            ) : viewState === 'tournaments' ? (
              // Tournament List Tab 
              <>
                <View style={s.searchContainer}>
                  <MaterialIcons name="search" size={20} color="#AEB6C2" style={s.searchIcon} />
                  <TextInput
                    style={s.searchInput}
                    placeholder="Tìm giải đấu..."
                    placeholderTextColor="#6F7785"
                    value={search}
                    onChangeText={setSearch}
                  />
                </View>

                <SectionHeader title="Chọn giải đấu đang mở" />
                {filteredTournaments.length === 0 ? (
                  <EmptyState icon="emoji-events" title="Chưa có giải đấu" subtitle="Không tìm thấy giải đấu nào." />
                ) : (
                  filteredTournaments.map(t => {
                    const id = t._id || t.id;
                    const ts = statusLabel(t.status);
                    const isOpen = t.status === 'OPEN_REGISTRATION';
                    return (
                      <TouchableOpacity key={id} style={[s.tCard, isOpen && s.tCardOpen]} onPress={() => selectTournament(t)} activeOpacity={0.9}>
                        <View style={{ flex: 1 }}>
                          <Text style={s.tName} numberOfLines={1}>{t.name}</Text>
                          <Text style={s.tDate}>{formatDate(t.startDate)} — {formatDate(t.endDate)}</Text>
                          {t.prize != null && (
                            <Text style={s.tPrize}>🏆 Quỹ thưởng: <Text style={{ color: C.tealLight, fontWeight: '700' }}>{t.prize.toLocaleString()} Pts</Text></Text>
                          )}
                        </View>
                        <View style={[s.badge, { backgroundColor: ts.color + '15', borderColor: ts.color + '40' }]}>
                          <Text style={[s.badgeText, { color: ts.color }]}>{ts.label}</Text>
                        </View>
                        <MaterialIcons name="chevron-right" size={20} color={C.textMuted} />
                      </TouchableOpacity>
                    );
                  })
                )}
              </>
            ) : (
              // Races List Tab
              <>
                <Card>
                  <Text style={s.eyebrow}>GIẢI ĐẤU ĐANG XEM</Text>
                  <Text style={s.pageTitle}>{selectedTournament?.name}</Text>
                  {selectedTournament?.description && (
                    <Text style={s.pageDesc}>{selectedTournament.description}</Text>
                  )}
                  <View style={s.tDetailsRow}>
                    <Text style={s.tDetailText}>📅 {formatDate(selectedTournament?.startDate)} — {formatDate(selectedTournament?.endDate)}</Text>
                    {selectedTournament?.prize != null && (
                      <Text style={s.tDetailText}>💰 Quỹ: {selectedTournament.prize.toLocaleString()} Pts</Text>
                    )}
                  </View>
                </Card>

                <SectionHeader title={`Các vòng đua nhỏ (${races.length})`} />
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
                          <Text style={s.statText}>📅 Khởi tranh: {formatDateTime(race.startTime)}</Text>
                          <Text style={s.statText}>🐴 Chiến mã: {race.participantsCount || 0}/{race.maxParticipants || 20}</Text>
                          {race.prize != null && (
                            <Text style={s.statText}>🏆 Giải thưởng: <Text style={{ color: C.tealLight, fontWeight: '700' }}>{race.prize.toLocaleString()} Pts</Text></Text>
                          )}
                        </View>

                        <View style={s.raceActions}>
                          {race.status === 'FINISHED' || race.status === 'RESULT_PUBLISHED' ? (
                            <PrimaryButton title="Xem kết quả" onPress={() => openResultsModal(race)} color="#34D399" />
                          ) : isRegistrationOpen ? (
                            isFull ? (
                              <OutlineButton title="Trận đấu đã đầy" onPress={() => {}} />
                            ) : (
                              <PrimaryButton title="Ghi danh chiến mã" onPress={() => openRegModal(race)} />
                            )
                          ) : (
                            <OutlineButton title="Xem chi tiết vòng đua" onPress={() => openRaceDetailsModal(race)} />
                          )}
                        </View>
                      </View>
                    );
                  })
                )}
              </>
            )}
          </ScrollView>
        </View>
      ) : (
        // Submitted Requests List View
        <ScrollView
          style={s.scrollView}
          contentContainerStyle={s.scrollContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.red} colors={[C.red]} />}
        >
          {error ? (
            <ErrorState message={error} onRetry={loadMyRegistrations} />
          ) : (
            <>
              <SectionHeader title={`Yêu cầu đã gửi (${myRegistrations.length})`} />
              {myRegistrations.length === 0 ? (
                <EmptyState icon="assignment" title="Chưa có yêu cầu" subtitle="Chọn tab Duyệt Giải Đấu để đăng ký chiến mã tham gia cuộc đua." />
              ) : (
                myRegistrations.map(r => {
                  const st = statusLabel(r.status);
                  const horse = typeof r.horseId === 'object' ? r.horseId?.name : 'Ngựa';
                  const race = typeof r.raceId === 'object' ? r.raceId?.name : 'Trận đua';
                  const tournament = typeof r.tournamentId === 'object' ? r.tournamentId?.name : '';
                  const canCancel = r.status === 'PENDING';
                  const canWithdraw = r.status === 'APPROVED';
                  const isCancelling = cancelling === (r._id || r.id);

                  return (
                    <View key={r._id || r.id} style={s.regCard}>
                      <View style={s.regHeader}>
                        <View style={s.regIconWrap}>
                          <MaterialIcons name="emoji-events" size={20} color={C.red} />
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={s.regHorse} numberOfLines={1}>🐴 {horse}</Text>
                          <Text style={s.regRace} numberOfLines={1}>🏁 {race}</Text>
                          {tournament ? <Text style={s.regTournament} numberOfLines={1}>🏆 {tournament}</Text> : null}
                        </View>
                        <View style={[s.badge, { backgroundColor: st.color + '15', borderColor: st.color + '40' }]}>
                          <Text style={[s.badgeText, { color: st.color }]}>{st.label}</Text>
                        </View>
                      </View>

                      {r.rejectedReason && (
                        <View style={s.reasonBox}>
                          <Text style={s.reasonText}>Lý do từ chối: {r.rejectedReason}</Text>
                        </View>
                      )}

                      <View style={s.regFooter}>
                        <Text style={s.regDate}>{formatDateTime(r.createdAt)}</Text>
                        {(canCancel || canWithdraw) && (
                          <TouchableOpacity
                            style={s.cancelBtn}
                            onPress={() => handleCancelRegistration(r._id || r.id, r.status)}
                            disabled={isCancelling}
                            activeOpacity={0.8}
                          >
                            <MaterialIcons name="cancel" size={14} color="#EF4444" style={{ marginTop: -1 }} />
                            <Text style={s.cancelText}>{isCancelling ? '...' : canCancel ? 'Hủy' : 'Rút tên'}</Text>
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
      )}

      {/* Registration Modal Form */}
      <Modal visible={showRegModal} animationType="slide" transparent>
        <View style={s.modalOverlay}>
          <View style={s.modalContent}>
            <View style={s.modalHeader}>
              <Text style={s.modalTitle}>Ghi Danh Chiến Mã</Text>
              <TouchableOpacity onPress={() => setShowRegModal(false)} activeOpacity={0.8}>
                <MaterialIcons name="close" size={24} color={C.textSecondary} />
              </TouchableOpacity>
            </View>

            {selectedRace && (
              <View style={s.raceSummary}>
                <MaterialIcons name="flag" size={20} color={C.red} />
                <View>
                  <Text style={s.summaryName}>{selectedRace.name}</Text>
                  <Text style={s.summaryStats}>{selectedRace.distanceMeters}m · {formatDateTime(selectedRace.startTime)}</Text>
                </View>
              </View>
            )}

            <ScrollView style={{ maxHeight: 260 }} showsVerticalScrollIndicator={false}>
              <Text style={s.fieldLabel}>Chọn chiến mã của bạn *</Text>
              {horses.map(h => {
                const id = h._id || h.id;
                const selected = selectedHorseId === id;
                return (
                  <TouchableOpacity
                    key={id}
                    style={[s.optionCard, selected && s.optionCardSelected]}
                    onPress={() => setSelectedHorseId(id)}
                    activeOpacity={0.9}
                  >
                    <MaterialIcons name={selected ? 'radio-button-checked' : 'radio-button-unchecked'} size={18} color={selected ? C.red : C.textMuted} />
                    <Text style={s.optionText}>🐴 {h.name} ({h.breed || 'Chưa rõ'})</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            <Text style={[s.fieldLabel, { marginTop: 16 }]}>Ghi chú thêm</Text>
            <TextInput
              style={[s.input, { height: 72, textAlignVertical: 'top', paddingTop: 8 }]}
              placeholder="Ví dụ: Mong ban tổ chức phê duyệt sớm..."
              placeholderTextColor={C.textMuted}
              multiline
              value={regNote}
              onChangeText={setRegNote}
            />

            <View style={s.modalActions}>
              <OutlineButton title="Hủy" onPress={() => setShowRegModal(false)} />
              <PrimaryButton title="Nộp hồ sơ ghi danh" onPress={handleRegister} loading={submitting} disabled={!selectedHorseId} />
            </View>
          </View>
        </View>
      </Modal>

      <RaceResultsModal
        visible={showResultsModal}
        onClose={() => setShowResultsModal(false)}
        raceId={resultsRaceId}
        raceName={resultsRaceName}
      />

      <Modal visible={showRaceDetailsModal} animationType="slide" transparent>
        <View style={s.modalOverlay}>
          <View style={s.modalContent}>
            <View style={s.modalHeader}>
              <Text style={s.modalTitle}>Chi Tiết Vòng Đua</Text>
              <TouchableOpacity onPress={() => setShowRaceDetailsModal(false)} activeOpacity={0.8}>
                <MaterialIcons name="close" size={24} color={C.textSecondary} />
              </TouchableOpacity>
            </View>

            {detailsRace && (
              <View style={s.raceSummary}>
                <MaterialIcons name="flag" size={20} color={C.red} />
                <View style={{ flex: 1 }}>
                  <Text style={s.summaryName}>{detailsRace.name}</Text>
                  <Text style={s.summaryStats}>Cự ly: {detailsRace.distanceMeters}m · Khởi tranh: {formatDateTime(detailsRace.startTime)}</Text>
                  {detailsRace.prize != null && (
                    <Text style={s.summaryPrize}>🏆 Giải thưởng: {detailsRace.prize.toLocaleString()} Pts</Text>
                  )}
                </View>
              </View>
            )}

            <Text style={s.fieldLabel}>Danh sách chiến mã tham gia ({detailsRegistrations.length})</Text>
            {loadingDetails ? (
              <ActivityIndicator size="small" color={C.red} style={{ marginVertical: 20 }} />
            ) : detailsRegistrations.length === 0 ? (
              <Text style={s.emptyDetailsText}>Chưa có chiến mã nào đăng ký thành công cho vòng đua này.</Text>
            ) : (
              <ScrollView style={{ maxHeight: 250 }} showsVerticalScrollIndicator={false}>
                {detailsRegistrations.map((reg, index) => {
                  const horseName = typeof reg.horseId === 'object' ? reg.horseId?.name : 'Chiến mã';
                  const breed = typeof reg.horseId === 'object' ? reg.horseId?.breed : 'Chưa rõ';
                  const jockeyName = typeof reg.jockeyUserId === 'object' ? reg.jockeyUserId?.fullName : 'Chưa đăng ký';
                  return (
                    <View key={reg._id || reg.id} style={s.detailParticipantRow}>
                      <Text style={s.participantIndex}>{index + 1}</Text>
                      <View style={{ flex: 1 }}>
                        <Text style={s.participantHorse}>🐴 {horseName} ({breed})</Text>
                        <Text style={s.participantJockey}>🏇 Nài: {jockeyName}</Text>
                      </View>
                      <View style={s.approvedBadge}>
                        <Text style={s.approvedBadgeText}>Đã duyệt</Text>
                      </View>
                    </View>
                  );
                })}
              </ScrollView>
            )}

            <View style={[s.modalActions, { marginTop: 20 }]}>
              <OutlineButton title="Đóng" onPress={() => setShowRaceDetailsModal(false)} />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B0D12',
  },
  segmentContainer: {
    flexDirection: 'row',
    backgroundColor: '#171B24',
    borderRadius: 8,
    padding: 4,
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 6,
    backgroundColor: 'transparent',
  },
  segmentBtnActive: {
    backgroundColor: '#202633',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  segmentText: {
    fontSize: 13,
    color: '#AEB6C2',
    fontWeight: '500',
  },
  segmentTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#171B24',
    backgroundColor: '#11141B',
  },
  backText: {
    color: C.textSecondary,
    fontSize: 12,
    fontWeight: '700',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#11141B',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
    marginBottom: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 13,
    height: '100%',
  },
  tCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#11141B',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    borderRadius: 14,
    padding: 14,
    marginBottom: 8,
  },
  tCardOpen: {
    borderColor: 'rgba(52, 211, 153, 0.25)',
    backgroundColor: 'rgba(52, 211, 153, 0.02)',
  },
  tName: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  tDate: {
    color: '#6F7785',
    fontSize: 10,
    marginTop: 4,
  },
  tPrize: {
    color: '#AEB6C2',
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
  eyebrow: {
    color: C.red,
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  pageTitle: {
    color: C.white,
    fontSize: 18,
    fontWeight: '900',
    marginTop: 4,
  },
  pageDesc: {
    color: C.textSecondary,
    fontSize: 11,
    marginTop: 6,
    lineHeight: 16,
  },
  tDetailsRow: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
  },
  tDetailText: {
    color: '#AEB6C2',
    fontSize: 11,
    fontWeight: '700',
  },
  raceCard: {
    backgroundColor: '#11141B',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
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
    color: C.white,
    fontSize: 14,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  raceStats: {
    gap: 4,
    marginBottom: 12,
  },
  statText: {
    color: C.textSecondary,
    fontSize: 11,
    fontWeight: '600',
  },
  raceActions: {
    marginTop: 4,
  },
  regCard: {
    backgroundColor: '#11141B',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
  },
  regHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  regIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(225, 6, 0, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  regHorse: {
    color: C.white,
    fontSize: 13,
    fontWeight: '800',
  },
  regRace: {
    color: C.red,
    fontSize: 11,
    fontWeight: '700',
    marginTop: 2,
  },
  regTournament: {
    color: C.tealLight,
    fontSize: 10,
    fontWeight: '600',
    marginTop: 1,
  },
  reasonBox: {
    backgroundColor: '#EF444415',
    borderWidth: 1,
    borderColor: '#EF444430',
    borderRadius: 8,
    padding: 8,
    marginTop: 10,
  },
  reasonText: {
    color: '#EF4444',
    fontSize: 11,
    fontWeight: '600',
  },
  regFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
  },
  regDate: {
    color: C.textMuted,
    fontSize: 10,
  },
  cancelBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#EF444440',
    backgroundColor: '#EF444410',
  },
  cancelText: {
    color: '#EF4444',
    fontSize: 11,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#11141B',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    color: C.white,
    fontSize: 18,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  raceSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#00000030',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  summaryName: {
    color: C.white,
    fontSize: 13,
    fontWeight: '800',
  },
  summaryStats: {
    color: C.textMuted,
    fontSize: 10,
    marginTop: 2,
  },
  fieldLabel: {
    color: C.textSecondary,
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
    borderColor: 'rgba(255,255,255,0.05)',
    borderRadius: 10,
    marginBottom: 6,
    backgroundColor: '#00000020',
  },
  optionCardSelected: {
    borderColor: 'rgba(225, 6, 0, 0.6)',
    backgroundColor: 'rgba(225, 6, 0, 0.1)',
  },
  optionText: {
    color: C.white,
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
  },
  input: {
    backgroundColor: '#171B24',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    color: C.white,
    borderRadius: 12,
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
  summaryPrize: {
    color: C.tealLight,
    fontSize: 10,
    fontWeight: '700',
    marginTop: 2,
  },
  emptyDetailsText: {
    color: C.textMuted,
    fontSize: 12,
    textAlign: 'center',
    marginVertical: 12,
  },
  detailParticipantRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#171B24',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.03)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 6,
  },
  participantIndex: {
    fontSize: 14,
    fontWeight: '900',
    color: C.red,
    width: 20,
    textAlign: 'center',
  },
  participantHorse: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  participantJockey: {
    color: '#AEB6C2',
    fontSize: 10,
    marginTop: 2,
  },
  approvedBadge: {
    backgroundColor: 'rgba(52, 211, 153, 0.1)',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  approvedBadgeText: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#34D399',
    textTransform: 'uppercase',
  },
});
