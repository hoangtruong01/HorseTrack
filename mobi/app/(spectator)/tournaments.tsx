import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LoadingState, EmptyState, statusLabel } from '@/components/ui/shared';
import { tournamentsApi, racesApi, registrationsApi, predictionsApi, rewardPointLedgerApi } from '@/lib/api-client';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import RaceResultsModal from '@/components/ui/race-results-modal';

export default function SpectatorTournaments() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'open' | 'upcoming' | 'draft'>('all');
  const scrollViewRef = useRef<ScrollView>(null);

  // Level 2 Selection (Tournament Details)
  const [selectedTour, setSelectedTour] = useState<any | null>(null);
  const [selectedTourRaces, setSelectedTourRaces] = useState<any[]>([]);
  const [loadingTourRaces, setLoadingTourRaces] = useState(false);

  // Level 3 Selection (Race Details)
  const [selectedRace, setSelectedRace] = useState<any | null>(null);
  const [selectedRaceRegistrations, setSelectedRaceRegistrations] = useState<any[]>([]);
  const [loadingRaceDetails, setLoadingRaceDetails] = useState(false);

  // Prediction states
  const [balance, setBalance] = useState(0);
  const [myPredictions, setMyPredictions] = useState<any[]>([]);
  const [selectedHorseId, setSelectedHorseId] = useState('');
  const [betPointsInput, setBetPointsInput] = useState('1');
  const [submittingPrediction, setSubmittingPrediction] = useState(false);

  // Results Modal State
  const [showResultsModal, setShowResultsModal] = useState(false);
  const [resultsRaceId, setResultsRaceId] = useState<string | null>(null);
  const [resultsRaceName, setResultsRaceName] = useState<string | null>(null);

  const openResultsModal = (race: any) => {
    setResultsRaceId(race._id || race.id);
    setResultsRaceName(race.name);
    setShowResultsModal(true);
  };

  useEffect(() => {
    tournamentsApi
      .list({ limit: 50 })
      .then((r) => setData((r as any).data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filteredData = data.filter((t) => {
    if (selectedFilter === 'all') return true;
    if (selectedFilter === 'open') return t.status === 'ONGOING' || t.status === 'OPEN_REGISTRATION';
    if (selectedFilter === 'upcoming') return t.status === 'UPCOMING' || t.status === 'CLOSED_REGISTRATION' || t.status === 'SCHEDULED';
    if (selectedFilter === 'draft') return t.status === 'DRAFT';
    return true;
  });

  const scrollToBottom = () => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  };

  // Selection handlers
  const handleSelectTournament = async (tour: any) => {
    setSelectedTour(tour);
    setSelectedRace(null);
    setLoadingTourRaces(true);
    try {
      const res = await racesApi.listByTournament(tour._id, { limit: 100 });
      const publicRaces = (res.data || []).filter((r: any) => r.status !== 'DRAFT');
      setSelectedTourRaces(publicRaces);
    } catch (e) {
      console.error(e);
      setSelectedTourRaces([]);
    } finally {
      setLoadingTourRaces(false);
    }
  };

  const handleSelectRace = async (race: any) => {
    setSelectedRace(race);
    setLoadingRaceDetails(true);
    try {
      // 1. Fetch approved registrations
      const regRes = await registrationsApi.list({ raceId: race._id, status: 'APPROVED', limit: 100 });
      setSelectedRaceRegistrations(regRes.data || []);

      // 2. Fetch my predictions
      const predRes = await predictionsApi.listMyPredictions({ limit: 100 }).catch(() => ({ data: [] }));
      setMyPredictions(predRes.data || []);

      // 3. Fetch points balance
      const balRes = await rewardPointLedgerApi.myBalance().catch(() => ({ balance: 0 }));
      setBalance(balRes.balance || 0);

      // Reset selection
      setSelectedHorseId('');
      setBetPointsInput(balRes.balance === 0 ? '1' : '2');
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingRaceDetails(false);
    }
  };

  const handlePredictSubmit = async () => {
    if (!selectedRace || !selectedHorseId) return;

    const betPoints = parseInt(betPointsInput, 10);
    if (isNaN(betPoints) || betPoints < 1) {
      Alert.alert('Lỗi', 'Số điểm cược không hợp lệ');
      return;
    }

    if (balance > 0 && betPoints < 2) {
      Alert.alert('Lỗi', 'Bạn đang có điểm, vui lòng cược từ 2 Pts trở lên!');
      return;
    }
    if (betPoints > balance && balance > 0) {
      Alert.alert('Lỗi', 'Số dư điểm không đủ!');
      return;
    }

    setSubmittingPrediction(true);
    try {
      await predictionsApi.create({
        raceId: selectedRace._id,
        predictedHorseId: selectedHorseId,
        betPoints: betPoints,
      });
      Alert.alert('Thành công', 'Đặt dự đoán thành công!');
      
      // Reload predictions & balance
      const predRes = await predictionsApi.listMyPredictions({ limit: 100 }).catch(() => ({ data: [] }));
      setMyPredictions(predRes.data || []);
      const balRes = await rewardPointLedgerApi.myBalance().catch(() => ({ balance: 0 }));
      setBalance(balRes.balance || 0);
    } catch (e: any) {
      Alert.alert('Lỗi', e.message || 'Đặt dự đoán thất bại!');
    } finally {
      setSubmittingPrediction(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ONGOING': return '#E10600';
      case 'OPEN_REGISTRATION': return '#34D399';
      case 'CLOSED_REGISTRATION': return '#F59E0B';
      case 'COMPLETED': return '#8B5CF6';
      default: return '#6F7785';
    }
  };

  // Render Level 3: Race Details & Predictions
  const renderRaceDetail = () => {
    if (!selectedRace) return null;
    const currentPrediction = myPredictions.find((p) => {
      const pRaceId = typeof p.raceId === 'object' ? p.raceId?._id : p.raceId;
      return pRaceId === selectedRace._id;
    });

    return (
      <SafeAreaView style={s.safeArea} edges={['top', 'left', 'right']}>
        <TouchableOpacity
          style={s.backButton}
          onPress={() => setSelectedRace(null)}
          activeOpacity={0.7}
        >
          <MaterialIcons name="arrow-back" size={20} color="#AEB6C2" />
          <Text style={s.backButtonText}>Quay lại giải đấu</Text>
        </TouchableOpacity>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.detailContent}>
          {/* Race Header Info */}
          <View style={s.raceDetailHeader}>
            <Text style={s.raceDetailLabel}>
              {typeof selectedRace.tournamentId === 'object' ? selectedRace.tournamentId?.name : 'Vòng Đua'}
            </Text>
            <Text style={s.raceDetailName}>{selectedRace.name}</Text>
            <View style={s.raceDetailMeta}>
              <View style={[s.badge, { borderColor: statusLabel(selectedRace.status).color + '40', backgroundColor: statusLabel(selectedRace.status).color + '15' }]}>
                <Text style={[s.badgeText, { color: statusLabel(selectedRace.status).color }]}>{statusLabel(selectedRace.status).label}</Text>
              </View>
              <Text style={s.raceDetailMetaText}>Cự ly: {selectedRace.distanceMeters}m</Text>
            </View>
          </View>

          {/* Info Blocks */}
          <View style={s.infoSection}>
            <View style={s.infoRow}>
              <MaterialIcons name="place" size={16} color="#E10600" />
              <Text style={s.infoLabel}>Địa điểm:</Text>
              <Text style={s.infoValue}>{selectedRace.location || 'Trường đua chính'}</Text>
            </View>
            <View style={s.infoRow}>
              <MaterialIcons name="schedule" size={16} color="#E10600" />
              <Text style={s.infoLabel}>Xuất phát:</Text>
              <Text style={s.infoValue}>
                {new Date(selectedRace.startTime).toLocaleString('vi-VN')}
              </Text>
            </View>
            <View style={s.infoRow}>
              <MaterialIcons name="cloud" size={16} color="#E10600" />
              <Text style={s.infoLabel}>Thời tiết:</Text>
              <Text style={s.infoValue}>{selectedRace.weatherSnapshot || 'Sunny'} ({selectedRace.trackCondition || 'Dry turf'})</Text>
            </View>
          </View>

          {/* Prediction Box */}
          <View style={s.predictionBox}>
            <Text style={s.predictionBoxTitle}>DỰ ĐOÁN KẾT QUẢ</Text>
            {currentPrediction ? (
              <View style={s.predictedContainer}>
                <View style={s.predictedHeader}>
                  <MaterialIcons name="check-circle" size={18} color="#34D399" />
                  <Text style={s.predictedTitle}>Bạn đã gửi dự đoán</Text>
                </View>
                <View style={s.predictedDetail}>
                  <View>
                    <Text style={s.predictedHorseName}>
                      {typeof currentPrediction.predictedHorseId === 'object' ? currentPrediction.predictedHorseId?.name : 'Chiến mã'}
                    </Text>
                    <Text style={s.predictedStatus}>
                      Kết quả: {
                        currentPrediction.status === 'WON' ? 'Thắng cược' :
                        currentPrediction.status === 'LOST' ? 'Thua cược' :
                        currentPrediction.status === 'PENDING' ? 'Chờ kết quả' : 'Đã hủy'
                      }
                    </Text>
                  </View>
                  <View style={s.predictedReward}>
                    <Text style={[s.predictedRewardText, { color: currentPrediction.status === 'WON' ? '#34D399' : '#E10600' }]}>
                      {currentPrediction.status === 'WON' ? `+${currentPrediction.rewardPoints || 0} Pts` :
                       currentPrediction.status === 'LOST' ? `-${currentPrediction.betPoints || 0} Pts` : 'Chờ kết quả'}
                    </Text>
                    {currentPrediction.betPoints > 0 && (
                      <Text style={s.predictedBetText}>Cược: {currentPrediction.betPoints} Pts</Text>
                    )}
                  </View>
                </View>
              </View>
            ) : (
              ['SCHEDULED', 'CHECKING', 'READY'].includes(selectedRace.status) ? (
                <View style={s.predictionForm}>
                  <Text style={s.formLabel}>Chọn chiến mã bạn dự kiến sẽ về nhất:</Text>
                  {selectedRaceRegistrations.length === 0 ? (
                    <Text style={s.emptyFormText}>Chưa có danh sách chiến mã chính thức tham gia.</Text>
                  ) : (
                    <>
                      {/* Selection Cards of Horses */}
                      <View style={s.horseList}>
                        {selectedRaceRegistrations.map((reg) => {
                          const horseId = typeof reg.horseId === 'object' ? reg.horseId?._id : reg.horseId;
                          const horseName = typeof reg.horseId === 'object' ? reg.horseId?.name : 'Chiến mã';
                          const breed = typeof reg.horseId === 'object' ? reg.horseId?.breed : 'Thuần chủng';
                          const jockeyName = typeof reg.jockeyUserId === 'object' ? reg.jockeyUserId?.fullName : 'Chưa đăng ký';
                          const isSelected = selectedHorseId === horseId;

                          return (
                            <TouchableOpacity
                              key={reg._id}
                              style={[s.horseSelectCard, isSelected && s.horseSelectCardActive]}
                              onPress={() => setSelectedHorseId(horseId)}
                              activeOpacity={0.8}
                            >
                              <View style={[s.radioCircle, isSelected && s.radioCircleActive]}>
                                {isSelected && <View style={s.radioCircleInner} />}
                              </View>
                              <View style={s.horseSelectInfo}>
                                <Text style={[s.horseSelectName, isSelected && s.horseSelectNameActive]}>{horseName}</Text>
                                <Text style={s.horseSelectJockey}>Nài: {jockeyName} · {breed}</Text>
                              </View>
                            </TouchableOpacity>
                          );
                        })}
                      </View>

                      {/* Bet Points Input */}
                      <View style={s.betPointsSection}>
                        <View style={s.betPointsLabelRow}>
                          <Text style={s.betPointsLabel}>Số điểm cược:</Text>
                          <Text style={s.betPointsBalance}>Số dư: {balance.toLocaleString('vi-VN')} Pts</Text>
                        </View>
                        <View style={s.betInputWrapper}>
                          <TextInput
                            keyboardType="numeric"
                            value={betPointsInput}
                            onChangeText={(text) => {
                              const cleaned = text.replace(/[^0-9]/g, '');
                              setBetPointsInput(cleaned);
                            }}
                            style={s.textInput}
                            placeholder={balance === 0 ? "1 (Cược miễn phí)" : "Nhập số điểm cược"}
                            placeholderTextColor="#58585B"
                            editable={balance > 0}
                          />
                          <Text style={s.betPointsSuffix}>Pts</Text>
                        </View>
                      </View>

                      {/* Quick buttons */}
                      {balance > 0 && (
                        <View style={s.quickBetRow}>
                          <TouchableOpacity style={s.quickBetBtn} onPress={() => setBetPointsInput('2')}>
                            <Text style={s.quickBetBtnText}>Min (2)</Text>
                          </TouchableOpacity>
                          <TouchableOpacity style={s.quickBetBtn} onPress={() => setBetPointsInput('10')}>
                            <Text style={s.quickBetBtnText}>10 Pts</Text>
                          </TouchableOpacity>
                          <TouchableOpacity style={s.quickBetBtn} onPress={() => setBetPointsInput('50')}>
                            <Text style={s.quickBetBtnText}>50 Pts</Text>
                          </TouchableOpacity>
                          <TouchableOpacity style={s.quickBetBtn} onPress={() => setBetPointsInput('100')}>
                            <Text style={s.quickBetBtnText}>100 Pts</Text>
                          </TouchableOpacity>
                          <TouchableOpacity style={[s.quickBetBtn, s.quickBetAllIn]} onPress={() => setBetPointsInput(String(balance))}>
                            <Text style={[s.quickBetBtnText, { color: '#FFFFFF' }]}>All In</Text>
                          </TouchableOpacity>
                        </View>
                      )}

                      {/* Warning */}
                      {parseInt(betPointsInput, 10) > balance && balance > 0 && (
                        <View style={s.warningBox}>
                          <Text style={s.warningTitle}>⚠️ KHÔNG ĐỦ SỐ DƯ</Text>
                          <Text style={s.warningText}>Bạn chỉ có {balance} Pts, không thể cược {betPointsInput} Pts.</Text>
                        </View>
                      )}

                      <TouchableOpacity
                        style={[s.submitBtn, (!selectedHorseId || (parseInt(betPointsInput, 10) > balance && balance > 0)) && s.submitBtnDisabled]}
                        onPress={handlePredictSubmit}
                        disabled={submittingPrediction || !selectedHorseId || (parseInt(betPointsInput, 10) > balance && balance > 0)}
                        activeOpacity={0.8}
                      >
                        <Text style={s.submitBtnText}>{submittingPrediction ? 'ĐANG GỬI DỰ ĐOÁN...' : 'GỬI DỰ ĐOÁN'}</Text>
                      </TouchableOpacity>
                    </>
                  )}
                </View>
              ) : (
                <View style={s.closedPredictionBox}>
                  <Text style={s.closedPredictionText}>Cổng dự đoán đã đóng cho cuộc đua này.</Text>
                  {selectedRace.status === 'FINISHED' && (
                    <TouchableOpacity
                      style={s.resultBtnBlock}
                      onPress={() => openResultsModal(selectedRace)}
                      activeOpacity={0.8}
                    >
                      <MaterialIcons name="emoji-events" size={18} color="#FFFFFF" />
                      <Text style={s.resultBtnBlockText}>Xem kết quả cuộc đua</Text>
                    </TouchableOpacity>
                  )}
                </View>
              )
            )}
          </View>

          {/* Participant Horses List */}
          <View style={s.sectionHeader}>
            <MaterialIcons name="people" size={20} color="#E10600" />
            <Text style={s.sectionTitle}>Chiến mã xuất kích ({selectedRaceRegistrations.length})</Text>
          </View>

          {selectedRaceRegistrations.length === 0 ? (
            <EmptyState icon="shield" title="Chưa có nài & chiến mã" subtitle="Chưa có đội hình chính thức cho trận đua này." />
          ) : (
            <View style={s.tableCard}>
              <View style={s.tableHeaderRow}>
                <Text style={[s.tableHeaderCell, { flex: 0.15 }]}>Cổng</Text>
                <Text style={[s.tableHeaderCell, { flex: 0.5 }]}>Chiến Mã / Nài</Text>
                <Text style={[s.tableHeaderCell, { flex: 0.35, textAlign: 'right' }]}>Trạng thái</Text>
              </View>
              {selectedRaceRegistrations.map((reg, idx) => {
                const horseName = typeof reg.horseId === 'object' ? reg.horseId?.name : 'Chiến mã';
                const jockeyName = typeof reg.jockeyUserId === 'object' ? reg.jockeyUserId?.fullName : 'Chưa đăng ký';
                return (
                  <View key={reg._id} style={s.tableRow}>
                    <Text style={[s.laneText, { flex: 0.15 }]}>{idx + 1}</Text>
                    <View style={{ flex: 0.5 }}>
                      <Text style={s.horseNameText}>{horseName}</Text>
                      <Text style={s.jockeyNameText}>Nài: {jockeyName}</Text>
                    </View>
                    <View style={{ flex: 0.35, alignItems: 'flex-end' }}>
                      <View style={s.approvedBadge}>
                        <Text style={s.approvedBadgeText}>Đã duyệt</Text>
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    );
  };

  // Render Level 2: Tournament Details & Sub-races list
  const renderTournamentDetail = () => {
    if (!selectedTour) return null;
    return (
      <SafeAreaView style={s.safeArea} edges={['top', 'left', 'right']}>
        <TouchableOpacity
          style={s.backButton}
          onPress={() => setSelectedTour(null)}
          activeOpacity={0.7}
        >
          <MaterialIcons name="arrow-back" size={20} color="#AEB6C2" />
          <Text style={s.backButtonText}>Quay lại giải đấu</Text>
        </TouchableOpacity>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.detailContent}>
          {/* Tournament Poster Card */}
          <View style={s.tourDetailCard}>
            {selectedTour.imageUrl ? (
              <Image source={{ uri: selectedTour.imageUrl }} style={s.tourDetailImage} />
            ) : (
              <View style={s.tourDetailPlaceholder}>
                <MaterialIcons name="emoji-events" size={48} color="rgba(255,255,255,0.05)" />
              </View>
            )}
            <View style={s.tourDetailOverlay} />
            <View style={s.tourDetailTextContent}>
              <View style={[s.badge, { borderColor: getStatusColor(selectedTour.status) + '40', backgroundColor: getStatusColor(selectedTour.status) + '15', alignSelf: 'flex-start' }]}>
                <Text style={[s.badgeText, { color: getStatusColor(selectedTour.status) }]}>{statusLabel(selectedTour.status).label}</Text>
              </View>
              <Text style={s.tourDetailName}>{selectedTour.name}</Text>
              <Text style={s.tourDetailDesc}>{selectedTour.description || 'Giải đấu kịch tính với phần thưởng hấp dẫn.'}</Text>
            </View>
          </View>

          {/* Info Rows */}
          <View style={s.infoSection}>
            <View style={s.infoRow}>
              <MaterialIcons name="place" size={16} color="#E10600" />
              <Text style={s.infoLabel}>Địa điểm:</Text>
              <Text style={s.infoValue}>{selectedTour.location || 'Chưa thiết lập'}</Text>
            </View>
            <View style={s.infoRow}>
              <MaterialIcons name="event" size={16} color="#E10600" />
              <Text style={s.infoLabel}>Thời gian:</Text>
              <Text style={s.infoValue}>
                {selectedTour.startDate ? new Date(selectedTour.startDate).toLocaleDateString('vi-VN') : '?'} - {selectedTour.endDate ? new Date(selectedTour.endDate).toLocaleDateString('vi-VN') : '?'}
              </Text>
            </View>
            <View style={s.infoRow}>
              <MaterialIcons name="monetization-on" size={16} color="#F59E0B" />
              <Text style={s.infoLabel}>Quỹ giải thưởng:</Text>
              <Text style={[s.infoValue, { color: '#E10600', fontWeight: '900' }]}>
                {(selectedTour.prizePool || 0).toLocaleString('vi-VN')} Pts
              </Text>
            </View>
          </View>

          {/* Sub-Races Section */}
          <View style={s.sectionHeader}>
            <MaterialIcons name="directions-run" size={20} color="#E10600" />
            <Text style={s.sectionTitle}>Các vòng đua ({selectedTourRaces.length})</Text>
          </View>

          {loadingTourRaces ? (
            <LoadingState />
          ) : selectedTourRaces.length === 0 ? (
            <EmptyState icon="directions-run" title="Chưa có vòng đua" subtitle="Giải đấu này hiện chưa được thiết lập lịch đua." />
          ) : (
            selectedTourRaces.map((race) => {
              const st = statusLabel(race.status);
              return (
                <View key={race._id} style={s.raceListItemContainer}>
                  <TouchableOpacity
                    style={s.raceListItem}
                    onPress={() => handleSelectRace(race)}
                    activeOpacity={0.8}
                  >
                    <View style={s.raceListInfo}>
                      <Text style={s.raceListName}>{race.name}</Text>
                      <Text style={s.raceListDetails}>
                        Cự ly: {race.distanceMeters}m · Bắt đầu: {new Date(race.startTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} {new Date(race.startTime).toLocaleDateString('vi-VN')}
                      </Text>
                    </View>
                    <View style={[s.badge, { borderColor: st.color + '40', backgroundColor: st.color + '15' }]}>
                      <Text style={[s.badgeText, { color: st.color }]}>{st.label}</Text>
                    </View>
                    <MaterialIcons name="chevron-right" size={20} color="#6F7785" />
                  </TouchableOpacity>
                  {race.status === 'FINISHED' && (
                    <TouchableOpacity
                      style={s.resultBtnInline}
                      onPress={() => openResultsModal(race)}
                      activeOpacity={0.8}
                    >
                      <MaterialIcons name="emoji-events" size={14} color="#34D399" />
                      <Text style={s.resultBtnInlineText}>Xem kết quả</Text>
                    </TouchableOpacity>
                  )}
                </View>
              );
            })
          )}
        </ScrollView>
      </SafeAreaView>
    );
  };

  if (loading) return <LoadingState />;
  if (selectedRace) return renderRaceDetail();
  if (selectedTour) return renderTournamentDetail();

  // Render Level 1: Tournaments List
  return (
    <SafeAreaView style={s.safeArea} edges={['top', 'left', 'right']}>
      {/* ── Header Row ── */}
      <View style={s.headerRow}>
        <Text style={s.headerTitle}>Giải đấu</Text>
        <View style={s.headerActions}>
          <TouchableOpacity style={s.iconButton} activeOpacity={0.7}>
            <MaterialIcons name="search" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <TouchableOpacity style={s.iconButton} activeOpacity={0.7}>
            <MaterialIcons name="filter-list" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Filters Row ── */}
      <View style={s.filtersContainer}>
        <TouchableOpacity
          style={[s.chip, selectedFilter === 'all' && s.chipSelected]}
          onPress={() => setSelectedFilter('all')}
          activeOpacity={0.8}
        >
          <Text style={[s.chipText, selectedFilter === 'all' && s.chipTextSelected]}>Tất cả</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[s.chip, selectedFilter === 'open' && s.chipSelected]}
          onPress={() => setSelectedFilter('open')}
          activeOpacity={0.8}
        >
          <Text style={[s.chipText, selectedFilter === 'open' && s.chipTextSelected]}>Đang mở</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[s.chip, selectedFilter === 'upcoming' && s.chipSelected]}
          onPress={() => setSelectedFilter('upcoming')}
          activeOpacity={0.8}
        >
          <Text style={[s.chipText, selectedFilter === 'upcoming' && s.chipTextSelected]}>Sắp diễn ra</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[s.chip, selectedFilter === 'draft' && s.chipSelected]}
          onPress={() => setSelectedFilter('draft')}
          activeOpacity={0.8}
        >
          <Text style={[s.chipText, selectedFilter === 'draft' && s.chipTextSelected]}>Bản nháp</Text>
        </TouchableOpacity>
      </View>

      {/* ── Scrollable Content ── */}
      <ScrollView
        ref={scrollViewRef}
        style={s.scrollView}
        contentContainerStyle={s.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Count Row */}
        <View style={s.countRow}>
          <View style={s.countDot} />
          <Text style={s.countText}>{filteredData.length} giải đấu đang hiển thị</Text>
        </View>

        {filteredData.length === 0 ? (
          <EmptyState
            icon="emoji-events"
            title="Chưa có giải đấu"
            subtitle="Hiện tại không có giải đấu nào phù hợp với bộ lọc này."
          />
        ) : (
          <>
            {/* Featured Tournament Banner */}
            <TouchableOpacity style={s.featuredCard} activeOpacity={0.9}>
              <Image
                source={require('../../assets/images/hero_horse_racing.png')}
                style={s.featuredImage}
                resizeMode="cover"
              />
              <View style={s.featuredOverlay} />
              <View style={s.featuredContent}>
                <View style={s.featuredBadgeContainer}>
                  <MaterialIcons name="star" size={14} color="#E10600" style={s.starIcon} />
                  <Text style={s.featuredBadgeText}>Giải đấu nổi bật</Text>
                </View>
                <Text style={s.featuredTitle} numberOfLines={1}>
                  Chinh phục đường đua
                </Text>
                <Text style={s.featuredSubtitle} numberOfLines={2}>
                  Tham gia ngay để nhận những phần thưởng hấp dẫn và vinh quang.
                </Text>
              </View>
              <View style={s.featuredChevronContainer}>
                <MaterialIcons name="chevron-right" size={18} color="#FFFFFF" />
              </View>
            </TouchableOpacity>

            {/* List all tournaments */}
            {filteredData.map((t) => {
              const st = statusLabel(t.status);
              return (
                <TouchableOpacity
                  key={t._id || t.id}
                  style={s.card}
                  onPress={() => handleSelectTournament(t)}
                  activeOpacity={0.8}
                >
                  <View style={s.cardIconContainer}>
                    <MaterialIcons name="emoji-events" size={24} color="#E10600" />
                  </View>
                  <View style={s.cardContent}>
                    <Text style={s.cardTitle} numberOfLines={1}>
                      {t.name}
                    </Text>
                    <Text style={s.cardSubtitle} numberOfLines={1}>
                      {t.location || 'Saigon Racecourse'} · Giải thưởng: {t.prizePool?.toLocaleString('vi-VN') || 0} đ
                    </Text>
                  </View>
                  <View style={[s.badge, { borderColor: st.color + '40', backgroundColor: st.color + '15' }]}>
                    <Text style={[s.badgeText, { color: st.color }]}>{st.label}</Text>
                  </View>
                  <MaterialIcons name="chevron-right" size={20} color="#6F7785" />
                </TouchableOpacity>
              );
            })}
          </>
        )}
      </ScrollView>

      {/* Floating Scroll Button */}
      {filteredData.length > 3 && (
        <TouchableOpacity style={s.floatingButton} onPress={scrollToBottom} activeOpacity={0.8}>
          <MaterialIcons name="arrow-downward" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      )}
      <RaceResultsModal
        visible={showResultsModal}
        onClose={() => setShowResultsModal(false)}
        raceId={resultsRaceId}
        raceName={resultsRaceName}
      />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0B0D12',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconButton: {
    padding: 4,
  },
  filtersContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 8,
  },
  chip: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#171B24',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  chipSelected: {
    borderColor: '#E10600',
    backgroundColor: 'rgba(225, 6, 0, 0.15)',
  },
  chipText: {
    fontSize: 12,
    color: '#AEB6C2',
    fontWeight: '500',
  },
  chipTextSelected: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 80,
  },
  countRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 6,
  },
  countDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#E10600',
  },
  countText: {
    fontSize: 12,
    color: '#AEB6C2',
  },
  featuredCard: {
    height: 160,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
    marginBottom: 20,
  },
  featuredImage: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  featuredOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(11, 13, 18, 0.65)',
  },
  featuredContent: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
    zIndex: 2,
    width: '80%',
  },
  featuredBadgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 4,
  },
  starIcon: {
    marginRight: 2,
  },
  featuredBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#E10600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  featuredTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 6,
  },
  featuredSubtitle: {
    fontSize: 12,
    color: '#AEB6C2',
    lineHeight: 16,
  },
  featuredChevronContainer: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#11141B',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
  },
  cardIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 10,
    backgroundColor: 'rgba(225, 6, 0, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardContent: {
    flex: 1,
    paddingLeft: 12,
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 12,
    color: '#AEB6C2',
  },
  badge: {
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 6,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  floatingButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#202633',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },

  // Level 2 & 3 Detail Styles
  detailContainer: {
    flex: 1,
    backgroundColor: '#0B0D12',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 6,
  },
  backButtonText: {
    fontSize: 14,
    color: '#AEB6C2',
    fontWeight: '500',
  },
  detailContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  tourDetailCard: {
    height: 180,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
    marginBottom: 20,
  },
  tourDetailImage: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  tourDetailPlaceholder: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: '#171B24',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tourDetailOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(11, 13, 18, 0.7)',
  },
  tourDetailTextContent: {
    flex: 1,
    padding: 16,
    justifyContent: 'flex-end',
  },
  tourDetailName: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    marginTop: 8,
    marginBottom: 4,
  },
  tourDetailDesc: {
    fontSize: 12,
    color: '#AEB6C2',
    lineHeight: 16,
  },
  infoSection: {
    backgroundColor: '#11141B',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    padding: 16,
    marginBottom: 20,
    gap: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoLabel: {
    fontSize: 13,
    color: '#AEB6C2',
    width: 110,
  },
  infoValue: {
    fontSize: 13,
    color: '#FFFFFF',
    fontWeight: '600',
    flex: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 10,
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  raceListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#11141B',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
  },
  raceListInfo: {
    flex: 1,
  },
  raceListName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  raceListDetails: {
    fontSize: 11,
    color: '#AEB6C2',
  },

  // Race Details & Predictions
  raceDetailHeader: {
    backgroundColor: '#11141B',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    padding: 16,
    marginBottom: 20,
  },
  raceDetailLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#E10600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  raceDetailName: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  raceDetailMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  raceDetailMetaText: {
    fontSize: 12,
    color: '#AEB6C2',
  },
  predictionBox: {
    backgroundColor: '#11141B',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    padding: 16,
    marginBottom: 20,
  },
  predictionBoxTitle: {
    fontSize: 13,
    fontWeight: '900',
    color: '#E10600',
    letterSpacing: 1,
    marginBottom: 14,
  },
  predictedContainer: {
    backgroundColor: 'rgba(52, 211, 153, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(52, 211, 153, 0.15)',
    borderRadius: 8,
    padding: 12,
  },
  predictedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  predictedTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#34D399',
  },
  predictedDetail: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  predictedHorseName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  predictedStatus: {
    fontSize: 11,
    color: '#AEB6C2',
    marginTop: 2,
  },
  predictedReward: {
    alignItems: 'flex-end',
  },
  predictedRewardText: {
    fontSize: 14,
    fontWeight: '800',
  },
  predictedBetText: {
    fontSize: 10,
    color: '#AEB6C2',
    marginTop: 2,
  },
  predictionForm: {
    gap: 12,
  },
  formLabel: {
    fontSize: 12,
    color: '#AEB6C2',
  },
  emptyFormText: {
    fontSize: 12,
    color: '#6F7785',
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 12,
  },
  horseList: {
    gap: 8,
  },
  horseSelectCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#171B24',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    borderRadius: 8,
    padding: 12,
    gap: 10,
  },
  horseSelectCardActive: {
    borderColor: '#E10600',
    backgroundColor: 'rgba(225,6,0,0.05)',
  },
  radioCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: '#6F7785',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioCircleActive: {
    borderColor: '#E10600',
  },
  radioCircleInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E10600',
  },
  horseSelectInfo: {
    flex: 1,
  },
  horseSelectName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#AEB6C2',
  },
  horseSelectNameActive: {
    color: '#FFFFFF',
  },
  horseSelectJockey: {
    fontSize: 11,
    color: '#6F7785',
    marginTop: 2,
  },
  betPointsSection: {
    gap: 6,
    marginTop: 8,
  },
  betPointsLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  betPointsLabel: {
    fontSize: 12,
    color: '#AEB6C2',
  },
  betPointsBalance: {
    fontSize: 12,
    color: '#34D399',
    fontWeight: '600',
  },
  betInputWrapper: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
  },
  textInput: {
    flex: 1,
    height: 40,
    backgroundColor: '#171B24',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingRight: 40,
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: 'bold',
  },
  betPointsSuffix: {
    position: 'absolute',
    right: 12,
    fontSize: 12,
    color: '#6F7785',
    fontWeight: 'bold',
  },
  quickBetRow: {
    flexDirection: 'row',
    gap: 6,
  },
  quickBetBtn: {
    flex: 1,
    height: 30,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    backgroundColor: '#171B24',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickBetAllIn: {
    borderColor: '#E10600',
    backgroundColor: 'rgba(225,6,0,0.15)',
  },
  quickBetBtnText: {
    fontSize: 10,
    color: '#AEB6C2',
    fontWeight: 'bold',
  },
  warningBox: {
    backgroundColor: 'rgba(239, 68, 68, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.15)',
    borderRadius: 8,
    padding: 10,
    marginTop: 4,
  },
  warningTitle: {
    fontSize: 10,
    fontWeight: '900',
    color: '#EF4444',
  },
  warningText: {
    fontSize: 11,
    color: '#AEB6C2',
    marginTop: 2,
  },
  submitBtn: {
    height: 44,
    borderRadius: 22,
    backgroundColor: '#E10600',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    shadowColor: '#E10600',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  submitBtnDisabled: {
    opacity: 0.5,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  closedPredictionBox: {
    backgroundColor: '#171B24',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  closedPredictionText: {
    fontSize: 12,
    color: '#6F7785',
    fontStyle: 'italic',
  },
  tableCard: {
    backgroundColor: '#11141B',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    overflow: 'hidden',
  },
  tableHeaderRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.02)',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  tableHeaderCell: {
    fontSize: 10,
    fontWeight: '700',
    color: '#6F7785',
    textTransform: 'uppercase',
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderColor: 'rgba(255,255,255,0.02)',
  },
  laneText: {
    fontSize: 14,
    fontWeight: '900',
    color: '#E10600',
  },
  horseNameText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  jockeyNameText: {
    fontSize: 10,
    color: '#AEB6C2',
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
  raceListItemContainer: {
    backgroundColor: '#11141B',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    marginBottom: 8,
    overflow: 'hidden',
  },
  resultBtnInline: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    backgroundColor: 'rgba(52, 211, 153, 0.08)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(52, 211, 153, 0.15)',
  },
  resultBtnInlineText: {
    color: '#34D399',
    fontSize: 12,
    fontWeight: '800',
  },
  resultBtnBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#34D399',
    borderRadius: 8,
    paddingVertical: 10,
    marginTop: 12,
    width: '100%',
  },
  resultBtnBlockText: {
    color: '#0B0D12',
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
});
