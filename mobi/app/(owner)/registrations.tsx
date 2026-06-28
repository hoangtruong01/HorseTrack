import React, { useEffect, useState, useCallback } from 'react';
import { ScrollView, View, Text, StyleSheet, TouchableOpacity, RefreshControl, Modal, Alert, TextInput, ActivityIndicator, useColorScheme } from 'react-native';
import { AppScreen, Section } from '@/components/ui/premium';
import { SleekHeader } from '@/components/ui/sleek-header';
import { usePremiumColors, premiumSpacing, premiumRadius, premiumTypography, premiumShadows } from '@/components/ui/premium-tokens';
import { LoadingState, EmptyState, ErrorState, statusLabel, formatDateTime } from '@/components/ui/shared';
import { tournamentsApi, racesApi, horsesApi, registrationsApi } from '@/lib/api-client';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import RaceResultsModal from '@/components/ui/race-results-modal';

type TabState = 'browse' | 'requests';
type ViewState = 'tournaments' | 'races';

const GridBackground = ({ isDark }: { isDark: boolean }) => {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <View style={{ flex: 1, backgroundColor: isDark ? '#09090B' : '#F4F4F5' }} />
    </View>
  );
};

export default function OwnerTournamentsAndRegistrations() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = usePremiumColors();
  const styles = React.useMemo(() => getStyles(isDark, colors), [isDark, colors]);

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
    <AppScreen refreshing={refreshing} onRefresh={onRefresh} safeArea={false}>
      <SleekHeader title="GIẢI ĐẤU & GHI DANH" showWallet={true} />
      <GridBackground isDark={isDark} />

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.brand} />}
      >
        {/* Segment tabs */}
        <View style={styles.segmentContainer}>
          <TouchableOpacity
            style={[styles.segmentBtn, activeTab === 'browse' && styles.segmentBtnActive]}
            onPress={() => {
              setActiveTab('browse');
              setViewState('tournaments');
            }}
            activeOpacity={0.8}
          >
            <Text style={[styles.segmentText, activeTab === 'browse' && styles.segmentTextActive]}>Duyệt Giải Đấu</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.segmentBtn, activeTab === 'requests' && styles.segmentBtnActive]}
            onPress={() => setActiveTab('requests')}
            activeOpacity={0.8}
          >
            <Text style={[styles.segmentText, activeTab === 'requests' && styles.segmentTextActive]}>Yêu Cầu Gửi Đi</Text>
          </TouchableOpacity>
        </View>

        {/* Main Content Area */}
        {activeTab === 'browse' ? (
          <>
            {viewState === 'races' && (
              <TouchableOpacity style={styles.backBtn} onPress={goBackToTournaments} activeOpacity={0.8}>
                <MaterialIcons name="arrow-back" size={20} color={colors.textSecondary} />
                <Text style={styles.backText}>Quay lại danh sách giải đấu</Text>
              </TouchableOpacity>
            )}

            {error ? (
              <ErrorState message={error} onRetry={loadInitialData} />
            ) : viewState === 'tournaments' ? (
              <Section title="Chọn giải đấu đang mở">
                <View style={styles.searchContainer}>
                  <MaterialIcons name="search" size={20} color={colors.textMuted} style={styles.searchIcon} />
                  <TextInput
                    style={styles.searchInput}
                    placeholder="Tìm kiếm giải đấu..."
                    placeholderTextColor={colors.textMuted}
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
                      <TouchableOpacity 
                        key={id} 
                        style={[styles.tCard, isOpen && styles.tCardOpen]} 
                        onPress={() => selectTournament(t)} 
                        activeOpacity={0.9}
                      >
                        <View style={{ flex: 1 }}>
                          <Text style={styles.tName} numberOfLines={1}>{t.name}</Text>
                          <Text style={styles.tDate}>{formatDateTime(t.startDate)} — {formatDateTime(t.endDate)}</Text>
                          {t.prize != null && (
                            <Text style={styles.tPrize}>
                              🏆 Quỹ thưởng: <Text style={{ color: colors.success, fontWeight: '800' }}>{t.prize.toLocaleString()} Pts</Text>
                            </Text>
                          )}
                        </View>
                        <View style={[styles.badge, { backgroundColor: ts.color + '15', borderColor: ts.color + '40' }]}>
                          <Text style={[styles.badgeText, { color: ts.color }]}>{ts.label}</Text>
                        </View>
                        <MaterialIcons name="chevron-right" size={20} color={colors.textMuted} />
                      </TouchableOpacity>
                    );
                  })
                )}
              </Section>
            ) : (
              <>
                <View style={styles.tHero}>
                  <Text style={styles.eyebrow}>GIẢI ĐẤU ĐANG XEM</Text>
                  <Text style={styles.pageTitle}>{selectedTournament?.name}</Text>
                  {selectedTournament?.description && (
                    <Text style={styles.pageDesc}>{selectedTournament.description}</Text>
                  )}
                  <View style={styles.tDetailsRow}>
                    <Text style={styles.tDetailText}>📅 {formatDateTime(selectedTournament?.startDate)} — {formatDateTime(selectedTournament?.endDate)}</Text>
                    {selectedTournament?.prize != null && (
                      <Text style={styles.tDetailText}>💰 Quỹ: {selectedTournament.prize.toLocaleString()} Pts</Text>
                    )}
                  </View>
                </View>

                <Section title={`Vòng đua của giải: ${selectedTournament?.name} (${races.length})`}>
                  {races.length === 0 ? (
                    <EmptyState icon="flag" title="Chưa có vòng đua" subtitle="Giải đấu này chưa có vòng đua nào được thiết lập." />
                  ) : (
                    races.map(race => {
                      const id = race._id || race.id;
                      const isFull = (race.participantsCount || 0) >= (race.maxParticipants || 20);
                      const isRegistrationOpen = selectedTournament?.status === 'OPEN_REGISTRATION';

                      return (
                        <View key={id} style={styles.raceCard}>
                          <View style={styles.raceHeader}>
                            <MaterialIcons name="flag" size={20} color={colors.brand} />
                            <Text style={styles.raceName} numberOfLines={1}>{race.name}</Text>
                          </View>

                          <View style={styles.raceStats}>
                            <Text style={styles.statText}>📏 Cự ly: {race.distanceMeters} m</Text>
                            <Text style={styles.statText}>📅 Khởi tranh: {formatDateTime(race.startTime)}</Text>
                            <Text style={styles.statText}>🐴 Chiến mã: {race.participantsCount || 0}/{race.maxParticipants || 20}</Text>
                            {race.prize != null && (
                              <Text style={styles.statText}>
                                🏆 Giải thưởng: <Text style={{ color: colors.success, fontWeight: '800' }}>{race.prize.toLocaleString()} Pts</Text>
                              </Text>
                            )}
                          </View>

                          <View style={styles.raceActions}>
                            {race.status === 'FINISHED' || race.status === 'RESULT_PUBLISHED' ? (
                              <TouchableOpacity 
                                style={[styles.btnPrimary, { backgroundColor: colors.success }]} 
                                onPress={() => openResultsModal(race)}
                                activeOpacity={0.8}
                              >
                                <Text style={styles.btnPrimaryText}>Xem kết quả cuộc đua</Text>
                              </TouchableOpacity>
                            ) : isRegistrationOpen ? (
                              isFull ? (
                                <TouchableOpacity style={[styles.btnOutline, { opacity: 0.5 }]} disabled activeOpacity={0.8}>
                                  <Text style={styles.btnOutlineText}>Trận đấu đã đầy</Text>
                                </TouchableOpacity>
                              ) : (
                                <TouchableOpacity style={styles.btnPrimary} onPress={() => openRegModal(race)} activeOpacity={0.8}>
                                  <Text style={styles.btnPrimaryText}>Ghi danh chiến mã</Text>
                                </TouchableOpacity>
                              )
                            ) : (
                              <TouchableOpacity style={styles.btnOutline} onPress={() => openRaceDetailsModal(race)} activeOpacity={0.8}>
                                <Text style={styles.btnOutlineText}>Xem chi tiết vòng đua</Text>
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
                      <View key={r._id || r.id} style={styles.regCard}>
                        <View style={styles.regHeader}>
                          <View style={styles.regIconWrap}>
                            <MaterialIcons name="emoji-events" size={22} color={colors.brand} />
                          </View>
                          <View style={{ flex: 1 }}>
                            <Text style={styles.regHorse} numberOfLines={1}>🐴 {horse}</Text>
                            <Text style={styles.regRace} numberOfLines={1}>🏁 {race}</Text>
                            {tournament ? <Text style={styles.regTournament} numberOfLines={1}>🏆 {tournament}</Text> : null}
                          </View>
                          <View style={[styles.badge, { backgroundColor: st.color + '15', borderColor: st.color + '40' }]}>
                            <Text style={[styles.badgeText, { color: st.color }]}>{st.label}</Text>
                          </View>
                        </View>

                        {r.rejectedReason && (
                          <View style={styles.reasonBox}>
                            <Text style={styles.reasonText}>Lý do từ chối: {r.rejectedReason}</Text>
                          </View>
                        )}

                        <View style={styles.regFooter}>
                          <Text style={styles.regDate}>{formatDateTime(r.createdAt)}</Text>
                          {(canCancel || canWithdraw) && (
                            <TouchableOpacity
                              style={styles.cancelBtn}
                              onPress={() => handleCancelRegistration(r._id || r.id, r.status)}
                              disabled={isCancelling}
                              activeOpacity={0.8}
                            >
                              <MaterialIcons name="cancel" size={14} color={colors.danger} />
                              <Text style={styles.cancelText}>{isCancelling ? '...' : canCancel ? 'Hủy yêu cầu' : 'Rút tên'}</Text>
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
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Ghi Danh Chiến Mã</Text>
                <TouchableOpacity onPress={() => setShowRegModal(false)} style={styles.closeIconBox} activeOpacity={0.8}>
                  <MaterialIcons name="close" size={24} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>

              {selectedRace && (
                <View style={styles.raceSummary}>
                  <View style={styles.raceSummaryIcon}>
                    <MaterialIcons name="flag" size={20} color={colors.brand} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.summaryName} numberOfLines={1}>{selectedTournament?.name} › {selectedRace.name}</Text>
                    <Text style={styles.summaryStats}>{selectedRace.distanceMeters}m · {formatDateTime(selectedRace.startTime)}</Text>
                  </View>
                </View>
              )}

              <ScrollView style={{ maxHeight: 220 }} showsVerticalScrollIndicator={false}>
                <Text style={styles.fieldLabel}>Chọn chiến mã của bạn *</Text>
                {horses.map(h => {
                  const id = h._id || h.id;
                  const selected = selectedHorseId === id;
                  return (
                    <TouchableOpacity
                      key={id}
                      style={[styles.optionCard, selected && styles.optionCardSelected]}
                      onPress={() => setSelectedHorseId(id)}
                      activeOpacity={0.9}
                    >
                      <MaterialIcons 
                        name={selected ? 'radio-button-checked' : 'radio-button-unchecked'} 
                        size={18} 
                        color={selected ? colors.brand : colors.textMuted} 
                      />
                      <Text style={styles.optionText} numberOfLines={1}>🐴 {h.name} ({h.breed || 'Chưa rõ'})</Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              <Text style={[styles.fieldLabel, { marginTop: 16 }]}>Ghi chú thêm</Text>
              <TextInput
                style={[styles.input, { height: 72, textAlignVertical: 'top', paddingTop: 12 }]}
                placeholder="Ví dụ: Mong ban tổ chức phê duyệt sớm..."
                placeholderTextColor={colors.textMuted}
                multiline
                value={regNote}
                onChangeText={setRegNote}
              />

              <View style={styles.modalActions}>
                <TouchableOpacity style={styles.btnOutlineModal} onPress={() => setShowRegModal(false)} activeOpacity={0.8}>
                  <Text style={styles.btnOutlineText}>Hủy</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.btnPrimaryModal, (!selectedHorseId || submitting) && styles.btnDisabled]}
                  onPress={handleRegister}
                  disabled={!selectedHorseId || submitting}
                  activeOpacity={0.8}
                >
                  <Text style={styles.btnPrimaryText}>{submitting ? 'Đang gửi...' : 'Nộp hồ sơ ghi danh'}</Text>
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
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Chi Tiết Vòng Đua</Text>
                <TouchableOpacity onPress={() => setShowRaceDetailsModal(false)} style={styles.closeIconBox} activeOpacity={0.8}>
                  <MaterialIcons name="close" size={24} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>

              {detailsRace && (
                <View style={styles.raceSummary}>
                  <View style={styles.raceSummaryIcon}>
                    <MaterialIcons name="flag" size={20} color={colors.brand} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.summaryName}>{detailsRace.name}</Text>
                    <Text style={styles.summaryStats}>Cự ly: {detailsRace.distanceMeters}m · Khởi tranh: {formatDateTime(detailsRace.startTime)}</Text>
                    {detailsRace.prize != null && (
                      <Text style={styles.summaryPrize}>🏆 Giải thưởng: {detailsRace.prize.toLocaleString()} Pts</Text>
                    )}
                  </View>
                </View>
              )}

              <Text style={styles.fieldLabel}>Danh sách chiến mã tham gia ({detailsRegistrations.length})</Text>
              {loadingDetails ? (
                <ActivityIndicator size="small" color={colors.brand} style={{ marginVertical: 20 }} />
              ) : detailsRegistrations.length === 0 ? (
                <Text style={styles.emptyDetailsText}>Chưa có chiến mã nào đăng ký thành công cho vòng đua này.</Text>
              ) : (
                <ScrollView style={{ maxHeight: 220 }} showsVerticalScrollIndicator={false}>
                  {detailsRegistrations.map((reg, index) => {
                    const horseName = typeof reg.horseId === 'object' ? reg.horseId?.name : 'Chiến mã';
                    const breed = typeof reg.horseId === 'object' ? reg.horseId?.breed : 'Chưa rõ';
                    const jockeyName = typeof reg.jockeyUserId === 'object' ? reg.jockeyUserId?.fullName : 'Chưa đăng ký';
                    return (
                      <View key={reg._id || reg.id} style={styles.detailParticipantRow}>
                        <Text style={styles.participantIndex}>{index + 1}</Text>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.participantHorse} numberOfLines={1}>🐴 {horseName} ({breed})</Text>
                          <Text style={styles.participantJockey}>🏇 Nài: {jockeyName}</Text>
                        </View>
                        <View style={styles.approvedBadge}>
                          <Text style={styles.approvedBadgeText}>Đã duyệt</Text>
                        </View>
                      </View>
                    );
                  })}
                </ScrollView>
              )}

              <View style={[styles.modalActions, { marginTop: 20 }]}>
                <TouchableOpacity style={styles.btnOutlineModal} onPress={() => setShowRaceDetailsModal(false)} activeOpacity={0.8}>
                  <Text style={styles.btnOutlineText}>Đóng</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </ScrollView>
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
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: colors.surface,
    borderRadius: premiumRadius[12],
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: premiumSpacing[16],
    ...premiumShadows.subtle,
  },
  backText: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '700',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: premiumRadius[24],
    paddingHorizontal: 16,
    height: 48,
    marginBottom: 16,
    ...premiumShadows.subtle,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: colors.text,
    fontSize: 14,
    height: '100%',
  },
  tCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: premiumRadius[16],
    padding: 16,
    marginBottom: 16,
    ...premiumShadows.subtle,
  },
  tCardOpen: {
    borderColor: 'rgba(52, 211, 153, 0.35)',
    backgroundColor: 'rgba(52, 211, 153, 0.05)',
  },
  tName: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  tDate: {
    color: colors.textMuted,
    fontSize: 11,
    marginTop: 4,
  },
  tPrize: {
    color: colors.textSecondary,
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
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: premiumRadius[16],
    padding: 16,
    marginBottom: 20,
    ...premiumShadows.subtle,
  },
  eyebrow: {
    color: colors.brand,
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  pageTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '900',
    marginTop: 6,
  },
  pageDesc: {
    color: colors.textSecondary,
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
    borderTopColor: colors.border,
  },
  tDetailText: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: '700',
  },
  raceCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: premiumRadius[16],
    padding: 16,
    marginBottom: 16,
    ...premiumShadows.subtle,
  },
  raceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  raceName: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  raceStats: {
    gap: 6,
    marginBottom: 16,
  },
  statText: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  raceActions: {
    marginTop: 4,
  },
  regCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: premiumRadius[16],
    padding: 16,
    marginBottom: 16,
    ...premiumShadows.subtle,
  },
  regHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  regIconWrap: {
    width: 44,
    height: 44,
    borderRadius: premiumRadius[12],
    backgroundColor: isDark ? 'rgba(225, 6, 0, 0.15)' : 'rgba(225, 6, 0, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(225, 6, 0, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  regHorse: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '800',
  },
  regRace: {
    color: colors.brand,
    fontSize: 12,
    fontWeight: '700',
    marginTop: 4,
  },
  regTournament: {
    color: colors.success,
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  reasonBox: {
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.2)',
    borderRadius: premiumRadius[8],
    padding: 10,
    marginTop: 12,
  },
  reasonText: {
    color: colors.danger,
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
    borderTopColor: colors.border,
  },
  regDate: {
    color: colors.textMuted,
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
  raceSummary: {
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
  raceSummaryIcon: {
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
  summaryPrize: {
    color: colors.success,
    fontSize: 11,
    fontWeight: '700',
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
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: premiumRadius[12],
    marginBottom: 8,
    backgroundColor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)',
  },
  optionCardSelected: {
    borderColor: 'rgba(225, 6, 0, 0.35)',
    backgroundColor: 'rgba(225, 6, 0, 0.05)',
  },
  optionText: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '700',
    flex: 1,
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
  btnPrimary: {
    flexDirection: 'row',
    backgroundColor: colors.brand,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    ...premiumShadows.redGlow,
  },
  btnPrimaryText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  btnOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.borderStrong,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnOutlineText: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '800',
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
  btnOutlineTextModal: {
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
  btnDisabled: {
    opacity: 0.5,
  },
  emptyDetailsText: {
    color: colors.textMuted,
    fontSize: 13,
    textAlign: 'center',
    marginVertical: 16,
  },
  detailParticipantRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: premiumRadius[12],
    padding: 12,
    marginBottom: 8,
  },
  participantIndex: {
    fontSize: 15,
    fontWeight: '900',
    color: colors.brand,
    width: 20,
    textAlign: 'center',
  },
  participantHorse: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '700',
  },
  participantJockey: {
    color: colors.textSecondary,
    fontSize: 11,
    marginTop: 2,
  },
  approvedBadge: {
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    borderRadius: premiumRadius[4],
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.2)',
  },
  approvedBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: colors.success,
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
});
