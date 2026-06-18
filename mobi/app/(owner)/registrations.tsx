import React, { useEffect, useState, useCallback } from 'react';
import { ScrollView, View, Text, StyleSheet, TouchableOpacity, RefreshControl, Modal, Alert, TextInput, ActivityIndicator } from 'react-native';
import { AppScreen, Section } from '@/components/ui/premium';
import { premiumColors, premiumSpacing, premiumRadius } from '@/components/ui/premium-tokens';
import { LoadingState, EmptyState, ErrorState, statusLabel, formatDateTime } from '@/components/ui/shared';
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
    <AppScreen scroll refreshing={refreshing} onRefresh={onRefresh}>
      <View style={s.content}>
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
          <>
            {viewState === 'races' && (
              <TouchableOpacity style={s.backBtn} onPress={goBackToTournaments} activeOpacity={0.8}>
                <MaterialIcons name="arrow-back" size={20} color={premiumColors.textSecondary} />
                <Text style={s.backText}>Quay lại danh sách giải đấu</Text>
              </TouchableOpacity>
            )}

            {error ? (
              <ErrorState message={error} onRetry={loadInitialData} />
            ) : viewState === 'tournaments' ? (
              // Tournament List Tab 
              <Section title="Chọn giải đấu đang mở">
                <View style={s.searchContainer}>
                  <MaterialIcons name="search" size={20} color={premiumColors.textMuted} style={s.searchIcon} />
                  <TextInput
                    style={s.searchInput}
                    placeholder="Tìm giải đấu..."
                    placeholderTextColor={premiumColors.textMuted}
                    value={search}
                    onChangeText={setSearch}
                  />
                </View>

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
                          <Text style={s.tDate}>{formatDateTime(t.startDate)} — {formatDateTime(t.endDate)}</Text>
                          {t.prize != null && (
                            <Text style={s.tPrize}>🏆 Quỹ thưởng: <Text style={{ color: premiumColors.success, fontWeight: '700' }}>{t.prize.toLocaleString()} Pts</Text></Text>
                          )}
                        </View>
                        <View style={[s.badge, { backgroundColor: ts.color + '15', borderColor: ts.color + '40' }]}>
                          <Text style={[s.badgeText, { color: ts.color }]}>{ts.label}</Text>
                        </View>
                        <MaterialIcons name="chevron-right" size={20} color={premiumColors.textMuted} />
                      </TouchableOpacity>
                    );
                  })
                )}
              </Section>
            ) : (
              // Races List Tab
              <>
                <View style={s.tHero}>
                  <Text style={s.eyebrow}>GIẢI ĐẤU ĐANG XEM</Text>
                  <Text style={s.pageTitle}>{selectedTournament?.name}</Text>
                  {selectedTournament?.description && (
                    <Text style={s.pageDesc}>{selectedTournament.description}</Text>
                  )}
                  <View style={s.tDetailsRow}>
                    <Text style={s.tDetailText}>📅 {formatDateTime(selectedTournament?.startDate)} — {formatDateTime(selectedTournament?.endDate)}</Text>
                    {selectedTournament?.prize != null && (
                      <Text style={s.tDetailText}>💰 Quỹ: {selectedTournament.prize.toLocaleString()} Pts</Text>
                    )}
                  </View>
                </View>

                <Section title={`Các vòng đua nhỏ (${races.length})`}>
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
                            <Text style={s.statText}>📅 Khởi tranh: {formatDateTime(race.startTime)}</Text>
                            <Text style={s.statText}>🐴 Chiến mã: {race.participantsCount || 0}/{race.maxParticipants || 20}</Text>
                            {race.prize != null && (
                              <Text style={s.statText}>🏆 Giải thưởng: <Text style={{ color: premiumColors.success, fontWeight: '700' }}>{race.prize.toLocaleString()} Pts</Text></Text>
                            )}
                          </View>

                          <View style={s.raceActions}>
                            {race.status === 'FINISHED' || race.status === 'RESULT_PUBLISHED' ? (
                              <TouchableOpacity style={[s.btnPrimary, { backgroundColor: premiumColors.success }]} onPress={() => openResultsModal(race)}>
                                <Text style={s.btnPrimaryText}>Xem kết quả</Text>
                              </TouchableOpacity>
                            ) : isRegistrationOpen ? (
                              isFull ? (
                                <TouchableOpacity style={[s.btnOutline, { opacity: 0.5 }]} disabled>
                                  <Text style={s.btnOutlineText}>Trận đấu đã đầy</Text>
                                </TouchableOpacity>
                              ) : (
                                <TouchableOpacity style={s.btnPrimary} onPress={() => openRegModal(race)}>
                                  <Text style={s.btnPrimaryText}>Ghi danh chiến mã</Text>
                                </TouchableOpacity>
                              )
                            ) : (
                              <TouchableOpacity style={s.btnOutline} onPress={() => openRaceDetailsModal(race)}>
                                <Text style={s.btnOutlineText}>Xem chi tiết vòng đua</Text>
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
          </>
        ) : (
          // Submitted Requests List View
          <>
            {error ? (
              <ErrorState message={error} onRetry={loadMyRegistrations} />
            ) : (
              <Section title={`Yêu cầu đã gửi (${myRegistrations.length})`}>
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
                            <MaterialIcons name="emoji-events" size={20} color={premiumColors.brand} />
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
                              <MaterialIcons name="cancel" size={14} color={premiumColors.danger} style={{ marginTop: -1 }} />
                              <Text style={s.cancelText}>{isCancelling ? '...' : canCancel ? 'Hủy' : 'Rút tên'}</Text>
                            </TouchableOpacity>
                          )}
                        </View>
                      </View>
                    );
                  })
                )}
              </Section>
            )}
          </>
        )}

        {/* Registration Modal Form */}
        <Modal visible={showRegModal} animationType="slide" transparent>
          <View style={s.modalOverlay}>
            <View style={s.modalContent}>
              <View style={s.modalHeader}>
                <Text style={s.modalTitle}>Ghi Danh Chiến Mã</Text>
                <TouchableOpacity onPress={() => setShowRegModal(false)} activeOpacity={0.8}>
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
                      <MaterialIcons name={selected ? 'radio-button-checked' : 'radio-button-unchecked'} size={18} color={selected ? premiumColors.brand : premiumColors.textMuted} />
                      <Text style={s.optionText}>🐴 {h.name} ({h.breed || 'Chưa rõ'})</Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              <Text style={[s.fieldLabel, { marginTop: 16 }]}>Ghi chú thêm</Text>
              <TextInput
                style={[s.input, { height: 72, textAlignVertical: 'top', paddingTop: 12 }]}
                placeholder="Ví dụ: Mong ban tổ chức phê duyệt sớm..."
                placeholderTextColor={premiumColors.textMuted}
                multiline
                value={regNote}
                onChangeText={setRegNote}
              />

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
                  <MaterialIcons name="close" size={24} color={premiumColors.textSecondary} />
                </TouchableOpacity>
              </View>

              {detailsRace && (
                <View style={s.raceSummary}>
                  <MaterialIcons name="flag" size={20} color={premiumColors.brand} />
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
                <ActivityIndicator size="small" color={premiumColors.brand} style={{ marginVertical: 20 }} />
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
                <TouchableOpacity style={s.btnOutlineModal} onPress={() => setShowRaceDetailsModal(false)} activeOpacity={0.8}>
                  <Text style={s.btnOutlineText}>Đóng</Text>
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: premiumColors.surface2,
    borderWidth: 1,
    borderColor: premiumColors.border,
    borderRadius: premiumRadius[12],
    paddingHorizontal: 12,
    height: 48,
    marginBottom: 16,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: premiumColors.text,
    fontSize: 14,
    height: '100%',
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
    marginBottom: 12,
  },
  tCardOpen: {
    borderColor: 'rgba(52, 211, 153, 0.4)',
    backgroundColor: 'rgba(52, 211, 153, 0.05)',
  },
  tName: {
    color: premiumColors.text,
    fontSize: 14,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  tDate: {
    color: premiumColors.textMuted,
    fontSize: 11,
    marginTop: 4,
  },
  tPrize: {
    color: premiumColors.textSecondary,
    fontSize: 11,
    marginTop: 4,
  },
  badge: {
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
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
    fontSize: 12,
    marginTop: 6,
    lineHeight: 18,
  },
  tDetailsRow: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: premiumColors.border,
  },
  tDetailText: {
    color: premiumColors.textSecondary,
    fontSize: 11,
    fontWeight: '700',
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
    marginBottom: 12,
  },
  raceName: {
    color: premiumColors.text,
    fontSize: 14,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  raceStats: {
    gap: 6,
    marginBottom: 16,
  },
  statText: {
    color: premiumColors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  raceActions: {
    marginTop: 4,
  },
  regCard: {
    backgroundColor: premiumColors.surface,
    borderWidth: 1,
    borderColor: premiumColors.border,
    borderRadius: premiumRadius[12],
    padding: 16,
    marginBottom: 12,
  },
  regHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  regIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(225, 6, 0, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  regHorse: {
    color: premiumColors.text,
    fontSize: 14,
    fontWeight: '800',
  },
  regRace: {
    color: premiumColors.brand,
    fontSize: 12,
    fontWeight: '700',
    marginTop: 4,
  },
  regTournament: {
    color: premiumColors.success,
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  reasonBox: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    borderRadius: premiumRadius[8],
    padding: 10,
    marginTop: 12,
  },
  reasonText: {
    color: premiumColors.danger,
    fontSize: 12,
    fontWeight: '600',
  },
  regFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: premiumColors.border,
  },
  regDate: {
    color: premiumColors.textMuted,
    fontSize: 11,
  },
  cancelBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: premiumRadius[8],
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.4)',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  cancelText: {
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
  raceSummary: {
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
  summaryPrize: {
    color: premiumColors.success,
    fontSize: 11,
    fontWeight: '700',
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
  optionCard: {
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
  optionCardSelected: {
    borderColor: 'rgba(225, 6, 0, 0.4)',
    backgroundColor: 'rgba(225, 6, 0, 0.05)',
  },
  optionText: {
    color: premiumColors.text,
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
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
  btnOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: premiumColors.borderStrong,
    paddingVertical: 12,
    borderRadius: premiumRadius[8],
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnOutlineText: {
    color: premiumColors.text,
    fontSize: 13,
    fontWeight: '700',
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
  btnPrimaryModal: {
    flex: 2,
    backgroundColor: premiumColors.brand,
    borderRadius: premiumRadius[8],
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
  },
  btnDisabled: {
    opacity: 0.5,
  },
  emptyDetailsText: {
    color: premiumColors.textMuted,
    fontSize: 13,
    textAlign: 'center',
    marginVertical: 16,
  },
  detailParticipantRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: premiumColors.surface2,
    borderWidth: 1,
    borderColor: premiumColors.border,
    borderRadius: premiumRadius[12],
    padding: 16,
    marginBottom: 8,
  },
  participantIndex: {
    fontSize: 16,
    fontWeight: '900',
    color: premiumColors.brand,
    width: 24,
    textAlign: 'center',
  },
  participantHorse: {
    color: premiumColors.text,
    fontSize: 13,
    fontWeight: '700',
  },
  participantJockey: {
    color: premiumColors.textSecondary,
    fontSize: 11,
    marginTop: 4,
  },
  approvedBadge: {
    backgroundColor: 'rgba(52, 211, 153, 0.1)',
    borderRadius: premiumRadius[4],
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  approvedBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: premiumColors.success,
    textTransform: 'uppercase',
  },
});
