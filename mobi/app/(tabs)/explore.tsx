import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, ActivityIndicator, SafeAreaView, Platform, TextInput, Alert, ScrollView } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { racesApi, registrationsApi, predictionsApi, walletApi, raceResultsApi, type RaceItem, type RegistrationItem } from '../../lib/api-client';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

export default function ExploreScreen() {
  const { tournamentId } = useLocalSearchParams<{ tournamentId?: string }>();
  
  const [races, setRaces] = useState<RaceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Filtering and Searching
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<'ALL' | 'LIVE' | 'SCHEDULED' | 'FINISHED'>('ALL');
  
  // Detail View State
  const [activeRace, setActiveRace] = useState<RaceItem | null>(null);
  const [activeRaceLoading, setActiveRaceLoading] = useState(false);
  const [participants, setParticipants] = useState<RegistrationItem[]>([]);
  const [results, setResults] = useState<any[]>([]);
  
  // Prediction placement state
  const [selectedHorseId, setSelectedHorseId] = useState('');
  const [betPoints, setBetPoints] = useState('10');
  const [walletBalance, setWalletBalance] = useState(0);
  const [placingPrediction, setPlacingPrediction] = useState(false);

  const loadRaces = async () => {
    try {
      let res;
      if (tournamentId) {
        res = await racesApi.listByTournament(tournamentId);
      } else {
        res = await racesApi.list();
      }
      
      if (res && res.data) {
        // Exclude DRAFT races for public explore view
        const publicRaces = res.data.filter(r => r.status !== 'DRAFT');
        setRaces(publicRaces);
      }
    } catch (err) {
      console.error('Lỗi lấy lịch đua:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadRaces();
  }, [tournamentId]);

  const onRefresh = () => {
    setRefreshing(true);
    loadRaces();
  };

  // Fetch detail information when an active race is set
  const loadRaceDetails = async (race: RaceItem) => {
    setActiveRace(race);
    setActiveRaceLoading(true);
    setParticipants([]);
    setResults([]);
    setSelectedHorseId('');
    
    try {
      // 1. Fetch participants (approved registrations)
      const regRes = await registrationsApi.list({ raceId: race._id, status: 'APPROVED' });
      if (regRes && regRes.data) {
        setParticipants(regRes.data);
      }

      // 2. Fetch wallet balance
      const walletRes = await walletApi.myHistory();
      setWalletBalance(walletRes.points ?? 0);

      // 3. Fetch results if finished
      if (race.status === 'FINISHED' || race.status === 'RESULT_PUBLISHED') {
        const resultsRes = await raceResultsApi.getByRace(race._id);
        if (resultsRes) {
          // Sort results by rank
          const sorted = (resultsRes.data || resultsRes).sort((a: any, b: any) => (a.rank || 99) - (b.rank || 99));
          setResults(sorted);
        }
      }
    } catch (err) {
      console.error('Lỗi tải chi tiết trận đua:', err);
    } finally {
      setActiveRaceLoading(false);
    }
  };

  const handlePlacePrediction = async () => {
    if (!activeRace) return;
    if (!selectedHorseId) {
      Alert.alert('Lỗi', 'Vui lòng chọn một chiến mã.');
      return;
    }
    
    const points = parseInt(betPoints, 10);
    if (isNaN(points) || points <= 0) {
      Alert.alert('Lỗi', 'Số điểm cược không hợp lệ.');
      return;
    }

    if (points > walletBalance) {
      Alert.alert('Lỗi', `Số dư điểm không đủ (Hiện có: ${walletBalance} Pts).`);
      return;
    }

    setPlacingPrediction(true);
    try {
      await predictionsApi.create({
        raceId: activeRace._id,
        predictedHorseId: selectedHorseId,
        betPoints: points,
      });
      Alert.alert('Thành công', 'Đặt dự đoán kết quả thành công!');
      // Reload wallet balance
      const walletRes = await walletApi.myHistory();
      setWalletBalance(walletRes.points ?? 0);
      setSelectedHorseId('');
    } catch (err: any) {
      Alert.alert('Thất bại', err.message || 'Lỗi đặt dự đoán.');
    } finally {
      setPlacingPrediction(false);
    }
  };

  const getRaceStatusColor = (status: string) => {
    switch (status) {
      case 'LIVE':
        return '#E10600';
      case 'FINISHED':
      case 'RESULT_PUBLISHED':
        return '#58585B';
      case 'READY':
      case 'CHECKING':
        return '#E1A200';
      default:
        return '#067E6A';
    }
  };

  const getRaceStatusText = (status: string) => {
    switch (status) {
      case 'LIVE':
        return 'TRỰC TIẾP (LIVE)';
      case 'FINISHED':
        return 'ĐÃ XONG (DRAFT)';
      case 'RESULT_PUBLISHED':
        return 'KẾT QUẢ CHÍNH THỨC';
      case 'READY':
        return 'SẴN SÀNG CHẠY';
      case 'CHECKING':
        return 'ĐANG KIỂM TRA';
      case 'SCHEDULED':
        return 'ĐÃ LÊN LỊCH';
      default:
        return status;
    }
  };

  // Filter logic
  const filteredRaces = races.filter(race => {
    const tourName = typeof race.tournamentId === 'object' ? race.tournamentId?.name || '' : '';
    const matchesSearch = race.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          tourName.toLowerCase().includes(searchQuery.toLowerCase());
    
    let matchesStatus = true;
    if (selectedStatus === 'LIVE') {
      matchesStatus = race.status === 'LIVE' || race.status === 'READY' || race.status === 'CHECKING';
    } else if (selectedStatus === 'SCHEDULED') {
      matchesStatus = race.status === 'SCHEDULED';
    } else if (selectedStatus === 'FINISHED') {
      matchesStatus = race.status === 'FINISHED' || race.status === 'RESULT_PUBLISHED';
    }
    
    return matchesSearch && matchesStatus;
  });

  const renderRaceItem = ({ item }: { item: RaceItem }) => {
    const tourName = typeof item.tournamentId === 'object' ? item.tournamentId?.name : 'Giải đấu lẻ';
    const dateStr = new Date(item.startTime).toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });

    return (
      <TouchableOpacity style={styles.raceCard} onPress={() => loadRaceDetails(item)}>
        <View style={styles.raceCardHeader}>
          <Text style={styles.tourLabel} numberOfLines={1}>{tourName?.toUpperCase()}</Text>
          <View style={[styles.statusIndicator, { backgroundColor: getRaceStatusColor(item.status) }]}>
            <Text style={styles.statusIndicatorText}>{getRaceStatusText(item.status)}</Text>
          </View>
        </View>

        <Text style={styles.raceName}>{item.name.toUpperCase()}</Text>

        <View style={styles.raceCardDetails}>
          <View style={styles.detailRow}>
            <MaterialIcons name="straighten" size={14} color="#AAAAAA" />
            <Text style={styles.detailText}>{item.distanceMeters} Mét</Text>
          </View>
          <View style={styles.detailRow}>
            <MaterialIcons name="cloud" size={14} color="#AAAAAA" />
            <Text style={styles.detailText} numberOfLines={1}>{item.weatherSnapshot || 'Nắng nhẹ'}</Text>
          </View>
          <View style={styles.detailRow}>
            <MaterialIcons name="access-time" size={14} color="#AAAAAA" />
            <Text style={styles.detailText}>{dateStr}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#E10600" />
        <Text style={styles.loadingText}>Đang tải lịch trình cuộc đua...</Text>
      </View>
    );
  }

  // ─── Render Detail View ──────────────────────────────────────────────────
  if (activeRace) {
    const isScheduled = activeRace.status === 'SCHEDULED';
    const isFinished = activeRace.status === 'FINISHED' || activeRace.status === 'RESULT_PUBLISHED';
    const tourName = typeof activeRace.tournamentId === 'object' ? activeRace.tournamentId?.name : 'Giải đấu lẻ';
    const startTimeStr = new Date(activeRace.startTime).toLocaleString('vi-VN');

    return (
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => {
              setActiveRace(null);
              setParticipants([]);
              setResults([]);
            }}
          >
            <MaterialIcons name="arrow-back" size={20} color="#FFFFFF" />
            <Text style={styles.backButtonText}>QUAY LẠI LỊCH ĐUA</Text>
          </TouchableOpacity>

          <View style={styles.detailHeaderCard}>
            <Text style={styles.detailTourName}>{tourName?.toUpperCase()}</Text>
            <Text style={styles.detailRaceName}>{activeRace.name.toUpperCase()}</Text>
            
            <View style={[styles.statusBadge, { backgroundColor: getRaceStatusColor(activeRace.status) }]}>
              <Text style={styles.statusBadgeText}>{getRaceStatusText(activeRace.status)}</Text>
            </View>

            <View style={styles.metadataGrid}>
              <View style={styles.metadataBox}>
                <Text style={styles.metadataLabel}>CỰ LY</Text>
                <Text style={styles.metadataValue}>{activeRace.distanceMeters}m</Text>
              </View>
              <View style={styles.metadataBox}>
                <Text style={styles.metadataLabel}>MẶT SÂN</Text>
                <Text style={styles.metadataValue}>{activeRace.trackCondition || 'Cát khô'}</Text>
              </View>
              <View style={styles.metadataBox}>
                <Text style={styles.metadataLabel}>THỜI TIẾT</Text>
                <Text style={styles.metadataValue}>{activeRace.weatherSnapshot || 'Nắng đẹp'}</Text>
              </View>
            </View>

            <Text style={styles.startTimeText}>Khởi tranh lúc: {startTimeStr}</Text>
          </View>

          {activeRaceLoading ? (
            <ActivityIndicator size="small" color="#E10600" style={{ marginVertical: 30 }} />
          ) : (
            <>
              {/* 1. Results Section (If Finished) */}
              {isFinished && (
                <View style={styles.sectionContainer}>
                  <Text style={styles.sectionTitle}>BẢNG XẾP HẠNG CHUNG CUỘC</Text>
                  {results.length === 0 ? (
                    <Text style={styles.emptyTextSmall}>Kết quả trận đấu đang được tính toán...</Text>
                  ) : (
                    results.map((res, index) => {
                      const horseName = typeof res.horseId === 'object' ? res.horseId?.name : 'Chiến mã';
                      const outcomeText = res.outcome === 'finished' ? `${(res.finishTimeMs / 1000).toFixed(2)}s` : res.outcome.toUpperCase();
                      const penaltySecs = res.penaltyTimeMs ? ` (+${res.penaltyTimeMs / 1000}s phạt)` : '';

                      return (
                        <View key={res._id || index} style={styles.resultRow}>
                          <View style={styles.resultLeft}>
                            <View style={[styles.rankCircle, index === 0 && styles.rankGold, index === 1 && styles.rankSilver, index === 2 && styles.rankBronze]}>
                              <Text style={styles.rankText}>{res.rank || index + 1}</Text>
                            </View>
                            <Text style={styles.resultHorseName}>{horseName.toUpperCase()}</Text>
                          </View>
                          <View style={styles.resultRight}>
                            <Text style={styles.resultTime}>{outcomeText}</Text>
                            {res.penaltyTimeMs > 0 && (
                              <Text style={styles.penaltyText}>{penaltySecs}</Text>
                            )}
                          </View>
                        </View>
                      );
                    })
                  )}
                </View>
              )}

              {/* 2. Place Prediction Section (If Scheduled) */}
              {isScheduled && (
                <View style={styles.sectionContainer}>
                  <View style={styles.walletHeader}>
                    <Text style={styles.sectionTitle}>DỰ ĐOÁN CHIẾN MÃ CHIẾN THẮNG</Text>
                    <Text style={styles.walletBalanceText}>Ví: <Text style={styles.redText}>{walletBalance} Pts</Text></Text>
                  </View>

                  {participants.length === 0 ? (
                    <Text style={styles.emptyTextSmall}>Không có chiến mã nào đăng ký tham gia trận này.</Text>
                  ) : (
                    <>
                      <Text style={styles.predictionInstructions}>Chọn một chiến mã và nhập điểm cược:</Text>
                      
                      <View style={styles.horseListContainer}>
                        {participants.map((p) => {
                          const horse = p.horseId as any;
                          if (!horse) return null;
                          const isSelected = selectedHorseId === horse._id;
                          
                          return (
                            <TouchableOpacity 
                              key={horse._id} 
                              style={[styles.horseSelectCard, isSelected && styles.horseSelectCardActive]}
                              onPress={() => setSelectedHorseId(horse._id)}
                            >
                              <MaterialIcons 
                                name={isSelected ? "radio-button-checked" : "radio-button-unchecked"} 
                                size={18} 
                                color={isSelected ? "#E10600" : "#AAAAAA"} 
                              />
                              <View style={styles.horseSelectCardInfo}>
                                <Text style={[styles.horseSelectName, isSelected && styles.redText]}>{horse.name.toUpperCase()}</Text>
                                <Text style={styles.horseSelectBreed}>{horse.breed || 'Thuần chủng'}</Text>
                              </View>
                            </TouchableOpacity>
                          );
                        })}
                      </View>

                      <View style={styles.betInputRow}>
                        <Text style={styles.betLabel}>SỐ ĐIỂM DỰ ĐOÁN:</Text>
                        <TextInput
                          style={styles.betInput}
                          value={betPoints}
                          onChangeText={setBetPoints}
                          keyboardType="number-pad"
                          placeholder="nhập điểm cược"
                          placeholderTextColor="#58585B"
                        />
                      </View>

                      <TouchableOpacity 
                        style={[styles.predictSubmitButton, placingPrediction && styles.disabledButton]}
                        onPress={handlePlacePrediction}
                        disabled={placingPrediction}
                      >
                        {placingPrediction ? (
                          <ActivityIndicator color="#FFFFFF" size="small" />
                        ) : (
                          <Text style={styles.predictSubmitButtonText}>XÁC NHẬN ĐẶT DỰ ĐOÁN</Text>
                        )}
                      </TouchableOpacity>
                    </>
                  )}
                </View>
              )}

              {/* 3. General Participant List */}
              <View style={styles.sectionContainer}>
                <Text style={styles.sectionTitle}>ĐỘI HÌNH THI ĐẤU ({participants.length})</Text>
                {participants.length === 0 ? (
                  <Text style={styles.emptyTextSmall}>Chưa chốt danh sách đội hình.</Text>
                ) : (
                  participants.map((p) => {
                    const horse = p.horseId as any;
                    const jockey = p.jockeyUserId as any;
                    
                    return (
                      <View key={p._id} style={styles.participantRow}>
                        <View style={styles.participantHorseInfo}>
                          <MaterialIcons name="pets" size={16} color="#E10600" />
                          <View>
                            <Text style={styles.participantHorseName}>{horse?.name?.toUpperCase() || 'CHƯA ĐĂNG KÝ NGỰA'}</Text>
                            <Text style={styles.participantHorseBreed}>{horse?.breed || 'Giống ngựa trống'}</Text>
                          </View>
                        </View>
                        <View style={styles.participantJockeyInfo}>
                          <MaterialIcons name="person" size={16} color="#AAAAAA" />
                          <Text style={styles.participantJockeyName}>{jockey?.fullName || 'Chưa gán nài ngựa'}</Text>
                        </View>
                      </View>
                    );
                  })
                )}
              </View>
            </>
          )}
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ─── Render List View ────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.searchFilterContainer}>
        <View style={styles.searchBarContainer}>
          <MaterialIcons name="search" size={20} color="#58585B" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Tìm trận đua, giải đấu..."
            placeholderTextColor="#58585B"
          />
        </View>

        <View style={styles.filterBar}>
          {(['ALL', 'LIVE', 'SCHEDULED', 'FINISHED'] as const).map((status) => {
            const isSelected = selectedStatus === status;
            let label = 'TẤT CẢ';
            if (status === 'LIVE') label = 'TRỰC TIẾP';
            if (status === 'SCHEDULED') label = 'LỊCH TRÌNH';
            if (status === 'FINISHED') label = 'KẾT QUẢ';

            return (
              <TouchableOpacity
                key={status}
                style={[styles.filterButton, isSelected && styles.filterButtonActive]}
                onPress={() => setSelectedStatus(status)}
              >
                <Text style={[styles.filterButtonText, isSelected && styles.filterButtonTextActive]}>{label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <FlatList
        data={filteredRaces}
        renderItem={renderRaceItem}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContent}
        onRefresh={onRefresh}
        refreshing={refreshing}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialIcons name="event-busy" size={48} color="#58585B" />
            <Text style={styles.emptyText}>Không tìm thấy trận đua nào phù hợp.</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1C1C25',
  },
  scrollContainer: {
    padding: 16,
  },
  listContent: {
    padding: 16,
    paddingTop: 8,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#1C1C25',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: '#AAAAAA',
    fontSize: 14,
    marginTop: 12,
  },
  searchFilterContainer: {
    padding: 16,
    backgroundColor: '#15151E',
    borderBottomWidth: 1,
    borderBottomColor: '#303037',
  },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1C1C25',
    borderWidth: 1,
    borderColor: '#303037',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 40,
    marginBottom: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 14,
    height: '100%',
  },
  filterBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  filterButton: {
    flex: 1,
    backgroundColor: '#1C1C25',
    borderWidth: 1,
    borderColor: '#303037',
    borderRadius: 6,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterButtonActive: {
    borderColor: '#E10600',
    backgroundColor: 'rgba(225, 6, 0, 0.1)',
  },
  filterButtonText: {
    color: '#AAAAAA',
    fontSize: 11,
    fontWeight: '700',
  },
  filterButtonTextActive: {
    color: '#E10600',
  },
  raceCard: {
    backgroundColor: '#15151E',
    borderWidth: 1,
    borderColor: '#303037',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  raceCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  tourLabel: {
    color: '#E10600',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
    flex: 1,
    marginRight: 8,
  },
  statusIndicator: {
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  statusIndicatorText: {
    color: '#FFFFFF',
    fontSize: 8,
    fontWeight: '900',
  },
  raceName: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '900',
    marginBottom: 12,
    fontFamily: Platform.OS === 'ios' ? 'HelveticaNeue-CondensedBold' : 'sans-serif-condensed',
  },
  raceCardDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailText: {
    color: '#AAAAAA',
    fontSize: 11,
    fontWeight: '500',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 16,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  detailHeaderCard: {
    backgroundColor: '#15151E',
    borderWidth: 1,
    borderColor: '#303037',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
  },
  detailTourName: {
    color: '#E10600',
    fontSize: 11,
    fontWeight: '800',
    marginBottom: 4,
  },
  detailRaceName: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '900',
    marginBottom: 10,
    textAlign: 'center',
    fontFamily: Platform.OS === 'ios' ? 'HelveticaNeue-CondensedBold' : 'sans-serif-condensed',
  },
  statusBadge: {
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginBottom: 16,
  },
  statusBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '900',
  },
  metadataGrid: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#303037',
    paddingTop: 12,
    width: '100%',
  },
  metadataBox: {
    flex: 1,
    alignItems: 'center',
  },
  metadataLabel: {
    color: '#58585B',
    fontSize: 9,
    fontWeight: '800',
    marginBottom: 2,
  },
  metadataValue: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  startTimeText: {
    color: '#AAAAAA',
    fontSize: 11,
    marginTop: 12,
  },
  sectionContainer: {
    backgroundColor: '#15151E',
    borderWidth: 1,
    borderColor: '#303037',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1,
    marginBottom: 12,
    borderLeftWidth: 2,
    borderLeftColor: '#E10600',
    paddingLeft: 8,
  },
  emptyText: {
    color: '#AAAAAA',
    fontSize: 14,
    marginTop: 12,
    textAlign: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTextSmall: {
    color: '#58585B',
    fontSize: 12,
    textAlign: 'center',
    paddingVertical: 12,
  },
  participantRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#1C1C25',
    paddingVertical: 8,
  },
  participantHorseInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  participantHorseName: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  participantHorseBreed: {
    color: '#58585B',
    fontSize: 11,
  },
  participantJockeyInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  participantJockeyName: {
    color: '#E0DEDC',
    fontSize: 12,
    fontWeight: '500',
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#1C1C25',
    paddingVertical: 10,
  },
  resultLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  rankCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#303037',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankGold: {
    backgroundColor: '#E1A200',
  },
  rankSilver: {
    backgroundColor: '#B5B5B5',
  },
  rankBronze: {
    backgroundColor: '#AD7145',
  },
  rankText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
  },
  resultHorseName: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  resultRight: {
    alignItems: 'flex-end',
  },
  resultTime: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
    fontFamily: Platform.OS === 'ios' ? 'Courier-Bold' : 'monospace',
  },
  penaltyText: {
    color: '#E10600',
    fontSize: 10,
    fontWeight: '600',
  },
  walletHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  walletBalanceText: {
    color: '#AAAAAA',
    fontSize: 12,
    fontWeight: '700',
  },
  redText: {
    color: '#E10600',
    fontWeight: '800',
  },
  predictionInstructions: {
    color: '#AAAAAA',
    fontSize: 12,
    marginBottom: 12,
  },
  horseListContainer: {
    gap: 8,
    marginBottom: 16,
  },
  horseSelectCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#1C1C25',
    borderWidth: 1,
    borderColor: '#303037',
    borderRadius: 8,
    padding: 10,
  },
  horseSelectCardActive: {
    borderColor: '#E10600',
    backgroundColor: 'rgba(225, 6, 0, 0.05)',
  },
  horseSelectCardInfo: {
    flex: 1,
  },
  horseSelectName: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  horseSelectBreed: {
    color: '#58585B',
    fontSize: 11,
  },
  betInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1C1C25',
    borderWidth: 1,
    borderColor: '#303037',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 48,
    marginBottom: 16,
  },
  betLabel: {
    color: '#AAAAAA',
    fontSize: 11,
    fontWeight: '800',
  },
  betInput: {
    flex: 1,
    textAlign: 'right',
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
    fontFamily: Platform.OS === 'ios' ? 'Courier-Bold' : 'monospace',
  },
  predictSubmitButton: {
    backgroundColor: '#E10600',
    borderRadius: 24,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledButton: {
    backgroundColor: '#58585B',
  },
  predictSubmitButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});
