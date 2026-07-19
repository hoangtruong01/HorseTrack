import React, { useEffect, useState, useCallback } from 'react';
import Animated, { FadeIn, FadeOut, SlideInRight, SlideOutRight } from 'react-native-reanimated';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, TextInput, Alert, ActivityIndicator, Image, ScrollView } from 'react-native';
import { AppScreen, Section } from '@/components/ui/premium';
import { premiumColors, premiumSpacing, premiumRadius, usePremiumColors } from '@/components/ui/premium-tokens';
import { LoadingState, EmptyState } from '@/components/ui/shared';
import { refereeAssignmentsApi, raceChecksApi, raceResultsApi } from '@/lib/api-client';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

interface EntryRow {
  raceRegistrationId: string;
  horseId: string;
  horseName: string;
  avatar: string;
  outcome: 'finished' | 'disqualified' | 'did_not_start' | 'did_not_finish';
  incident: string;
  finishTimeSecs: string;
  rank: string;
  note: string;
}

export default function RefereeResults({ nested }: { nested?: boolean }) {
  const premiumColors = usePremiumColors();
  const styles = getStyles(premiumColors);

  const [assignments, setAssignments] = useState<any[]>([]);
  const [selectedRaceId, setSelectedRaceId] = useState<string | null>(null);
  const [selectedRaceName, setSelectedRaceName] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [simulating, setSimulating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [resultsStatus, setResultsStatus] = useState('DRAFT');
  const [entryRows, setEntryRows] = useState<EntryRow[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadAssignments = useCallback(async () => {
    try {
      const res = await refereeAssignmentsApi.myAssignments({ limit: 50 });
      const list = (res as any).data || res || [];
      setAssignments(list.filter((a: any) => a.status === 'accepted'));
    } catch { } finally { setLoading(false); }
  }, []);

  useEffect(() => {
    loadAssignments();
  }, [loadAssignments]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    if (!selectedRaceId) {
      await loadAssignments();
    } else {
      await selectRace(selectedRaceId, selectedRaceName);
    }
    setRefreshing(false);
  }, [selectedRaceId, selectedRaceName, loadAssignments]);

  const selectRace = async (raceId: string, raceName: string) => {
    setSelectedRaceId(raceId);
    setSelectedRaceName(raceName);
    setLoadingDetails(true);
    try {
      const checksRes = await raceChecksApi.listByRace(raceId);
      const horsesList = checksRes?.data || checksRes || [];

      const resultsRes = await raceResultsApi.getByRace(raceId);
      const existingResults = resultsRes?.data || resultsRes || [];

      if (existingResults.length > 0) {
        setResultsStatus(existingResults[0].status || 'DRAFT');
      } else {
        setResultsStatus('DRAFT');
      }

      const rows = horsesList.map((h: any) => {
        const existing = existingResults.find((r: any) => {
          const rHorseId = typeof r.horseId === 'object' ? r.horseId?._id : r.horseId;
          return rHorseId === h.horseId?._id;
        });

        return {
          raceRegistrationId: h.raceRegistrationId?._id || h.raceRegistrationId,
          horseId: h.horseId?._id,
          horseName: h.horseId?.name || 'Chiến mã',
          avatar: h.horseId?.avatar || h.horseId?.image || '',
          outcome: existing?.outcome || 'finished',
          incident: existing?.incident || 'none',
          finishTimeSecs: existing?.finishTimeMs ? (existing.finishTimeMs / 1000).toString() : '',
          rank: existing?.rank ? existing.rank.toString() : '',
          note: existing?.note || '',
        };
      });

      setEntryRows(rows);
    } catch {
      setEntryRows([]);
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleRowChange = (index: number, field: keyof EntryRow, value: any) => {
    const updated = [...entryRows];
    updated[index] = { ...updated[index], [field]: value };
    setEntryRows(updated);
  };

  const handleSimulate = async () => {
    setSimulating(true);
    try {
      await raceResultsApi.simulate(selectedRaceId!);
      Alert.alert('Thành công', 'Đã giả lập cuộc đua và xếp hạng tự động.');
      await selectRace(selectedRaceId!, selectedRaceName);
    } catch (err: any) {
      Alert.alert('Lỗi', err.message || 'Lỗi chạy giả lập.');
    } finally {
      setSimulating(false);
    }
  };

  const handleBulkSave = async () => {
    setSaving(true);
    try {
      const payloadResults = entryRows.map((row) => {
        const secs = parseFloat(row.finishTimeSecs);
        return {
          raceRegistrationId: row.raceRegistrationId,
          horseId: row.horseId,
          outcome: row.outcome,
          incident: row.incident,
          finishTimeMs: isNaN(secs) ? undefined : Math.round(secs * 1000),
          rank: row.rank ? parseInt(row.rank, 10) : undefined,
          note: row.note,
        };
      });

      await raceResultsApi.bulkSave(selectedRaceId!, payloadResults);
      Alert.alert('Thành công', 'Đã lưu kết quả nháp.');
      await selectRace(selectedRaceId!, selectedRaceName);
    } catch (err: any) {
      Alert.alert('Lỗi', err.message || 'Lỗi lưu kết quả.');
    } finally {
      setSaving(false);
    }
  };

  const handleConfirm = async () => {
    Alert.alert('Khóa kết quả', 'Bạn có chắc chắn muốn khóa kết quả cuộc đua?', [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Khóa kết quả',
        style: 'destructive',
        onPress: async () => {
          setConfirming(true);
          try {
            await raceResultsApi.confirm(selectedRaceId!);
            Alert.alert('Thành công', 'Trận đấu đã chính thức hoàn thành!');
            await selectRace(selectedRaceId!, selectedRaceName);
          } catch (err: any) {
            Alert.alert('Lỗi', err.message || 'Lỗi khóa kết quả.');
          } finally {
            setConfirming(false);
          }
        },
      },
    ]);
  };

  const isLocked = resultsStatus === 'CONFIRMED' || resultsStatus === 'PUBLISHED';

  if (loading && !refreshing) return <LoadingState />;

  return (
    <View style={{ flex: 1 }}>
      {!selectedRaceId ? (
        <Animated.View style={{ flex: 1 }} entering={FadeIn} exiting={FadeOut}>
          <AppScreen scroll refreshing={refreshing} onRefresh={onRefresh} safeArea={!nested}>
            <View style={styles.content}>
              <Section title="Chọn trận đua cần nhập kết quả">
                {assignments.length === 0 ? (
                  <EmptyState icon="sports-score" title="Chưa có nhiệm vụ đã nhận" subtitle="Vui lòng nhận phân công ở tab Phân công trước." />
                ) : (
                  assignments.map(a => {
                    const race = a.raceId;
                    if (!race) return null;
                    return (
                      <TouchableOpacity
                        key={a._id || a.id}
                        style={styles.assignmentCard}
                        onPress={() => selectRace(race._id || race.id, race.name)}
                        activeOpacity={0.8}
                      >
                        <View style={styles.cardIconWrap}>
                          <MaterialIcons name="sports-score" size={20} color={premiumColors.brand} />
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.assignmentTitle} numberOfLines={1}>{race.name}</Text>
                          <Text style={styles.assignmentSubtitle} numberOfLines={1}>Trạng thái: {race.status}</Text>
                        </View>
                        <MaterialIcons name="chevron-right" size={20} color={premiumColors.textMuted} />
                      </TouchableOpacity>
                    );
                  })
                )}
              </Section>
            </View>
          </AppScreen>
        </Animated.View>
      ) : (
        <Animated.View style={{ flex: 1 }} entering={SlideInRight} exiting={SlideOutRight}>
          <AppScreen refreshing={refreshing} onRefresh={onRefresh} safeArea={!nested}>
            <View style={styles.header}>
              <TouchableOpacity style={styles.backBtn} onPress={() => setSelectedRaceId(null)} activeOpacity={0.8}>
                <MaterialIcons name="arrow-back" size={20} color={premiumColors.textSecondary} />
                <Text style={styles.backTxt}>Quay lại</Text>
              </TouchableOpacity>
              <Text style={styles.headerTitle} numberOfLines={1}>{selectedRaceName.toUpperCase()}</Text>
            </View>

            <View style={styles.statusCard}>
              <View>
                <Text style={styles.statusLabel}>TRẠNG THÁI BIÊN BẢN</Text>
                <View style={[styles.statusBadge, { backgroundColor: isLocked ? 'rgba(52, 211, 153, 0.15)' : 'rgba(234, 179, 8, 0.15)' }]}>
                  <Text style={[styles.statusBadgeText, { color: isLocked ? premiumColors.success : premiumColors.warning }]}>
                    {isLocked ? 'ĐÃ XÁC NHẬN (LOCKED)' : 'BẢN NHÁP (DRAFT)'}
                  </Text>
                </View>
              </View>
              {!isLocked && (
                <View style={styles.topActions}>
                  {/*
            <TouchableOpacity 
              style={[styles.topActionBtn, { backgroundColor: 'rgba(234, 179, 8, 0.15)', borderColor: 'rgba(234, 179, 8, 0.3)' }]} 
              onPress={handleSimulate} 
              disabled={simulating}
              activeOpacity={0.8}
            >
              <Text style={[styles.topActionBtnText, { color: premiumColors.warning }]}>{simulating ? '...' : 'GIẢ LẬP'}</Text>
            </TouchableOpacity>
            */}
                  <TouchableOpacity
                    style={styles.topActionBtnOutline}
                    onPress={handleBulkSave}
                    disabled={saving}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.topActionBtnOutlineText}>{saving ? '...' : 'LƯU NHÁP'}</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>

            {loadingDetails && !refreshing ? <LoadingState /> : (() => {
              const sortedRows = [...entryRows].sort((a, b) => {
                const rankA = a.rank ? parseInt(a.rank, 10) : 999;
                const rankB = b.rank ? parseInt(b.rank, 10) : 999;
                return rankA - rankB;
              });

              if (isLocked) {
                const top1 = sortedRows.find(r => r.rank === '1');
                const top2 = sortedRows.find(r => r.rank === '2');
                const top3 = sortedRows.find(r => r.rank === '3');
                const rest = sortedRows.filter(r => {
                  const rk = parseInt(r.rank, 10);
                  return !r.rank || isNaN(rk) || rk > 3;
                });

                return (
                  <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
                    <View style={styles.podiumContainer}>
                      {top2 ? (
                        <View style={styles.podiumCol}>
                          <View style={styles.podiumInfo}>
                            {top2.avatar ? <Image source={{ uri: top2.avatar }} style={[styles.podiumAvatar, { borderColor: 'rgba(225,6,0,0.7)' }]} /> : <View style={[styles.podiumAvatarPlaceholder, { borderColor: 'rgba(225,6,0,0.7)' }]}><MaterialIcons name="pets" size={24} color={premiumColors.textMuted} /></View>}
                            <Text style={styles.podiumName} numberOfLines={1}>{top2.horseName.toUpperCase()}</Text>
                            <Text style={styles.podiumTime}>{top2.finishTimeSecs}s</Text>
                          </View>
                          <View style={[styles.podiumBlock, { height: 110, backgroundColor: 'rgba(225,6,0,0.7)' }]}>
                            <Text style={styles.podiumRankText}>2</Text>
                          </View>
                        </View>
                      ) : <View style={styles.podiumCol} />}

                      {top1 ? (
                        <View style={styles.podiumCol}>
                          <View style={styles.podiumInfo}>
                            {top1.avatar ? <Image source={{ uri: top1.avatar }} style={[styles.podiumAvatar, { borderColor: premiumColors.brand }]} /> : <View style={[styles.podiumAvatarPlaceholder, { borderColor: premiumColors.brand }]}><MaterialIcons name="pets" size={24} color={premiumColors.textMuted} /></View>}
                            <Text style={styles.podiumName} numberOfLines={1}>{top1.horseName.toUpperCase()}</Text>
                            <Text style={styles.podiumTime}>{top1.finishTimeSecs}s</Text>
                          </View>
                          <View style={[styles.podiumBlock, { height: 150, backgroundColor: premiumColors.brand, zIndex: 10, shadowColor: premiumColors.brand, shadowOpacity: 0.5, shadowRadius: 10, shadowOffset: { width: 0, height: -2 } }]}>
                            <Text style={styles.podiumRankText}>1</Text>
                          </View>
                        </View>
                      ) : <View style={styles.podiumCol} />}

                      {top3 ? (
                        <View style={styles.podiumCol}>
                          <View style={styles.podiumInfo}>
                            {top3.avatar ? <Image source={{ uri: top3.avatar }} style={[styles.podiumAvatar, { borderColor: 'rgba(225,6,0,0.4)' }]} /> : <View style={[styles.podiumAvatarPlaceholder, { borderColor: 'rgba(225,6,0,0.4)' }]}><MaterialIcons name="pets" size={24} color={premiumColors.textMuted} /></View>}
                            <Text style={styles.podiumName} numberOfLines={1}>{top3.horseName.toUpperCase()}</Text>
                            <Text style={styles.podiumTime}>{top3.finishTimeSecs}s</Text>
                          </View>
                          <View style={[styles.podiumBlock, { height: 80, backgroundColor: 'rgba(225,6,0,0.4)' }]}>
                            <Text style={styles.podiumRankText}>3</Text>
                          </View>
                        </View>
                      ) : <View style={styles.podiumCol} />}
                    </View>

                    <View style={styles.leaderboardList}>
                      {rest.map((item) => (
                        <View key={item.horseId} style={styles.leaderboardRow}>
                          <Text style={styles.leaderboardRank}>{item.rank || '-'}</Text>
                          {item.avatar ? (
                            <Image source={{ uri: item.avatar }} style={styles.leaderboardAvatar} />
                          ) : (
                            <View style={styles.leaderboardAvatarPlaceholder}>
                              <MaterialIcons name="pets" size={16} color={premiumColors.textMuted} />
                            </View>
                          )}
                          <View style={styles.leaderboardInfo}>
                            <Text style={styles.leaderboardHorseName}>{item.horseName.toUpperCase()}</Text>
                            <Text style={styles.leaderboardStatus}>{item.outcome === 'finished' ? 'Về đích' : item.outcome === 'disqualified' ? 'Bị loại' : 'DNF'}</Text>
                          </View>
                          <Text style={styles.leaderboardTime}>{item.finishTimeSecs}s</Text>
                        </View>
                      ))}
                    </View>
                  </ScrollView>
                );
              }

              return (
                <FlatList
                  data={sortedRows}
                  keyExtractor={(item) => item.horseId}
                  contentContainerStyle={styles.listContent}
                  showsVerticalScrollIndicator={false}
                  ListEmptyComponent={
                    <EmptyState icon="sports" title="Không có chiến mã" subtitle="Chưa có ngựa đua được xác nhận kiểm duyệt để nhập kết quả." />
                  }
                  renderItem={({ item }) => {
                    const originalIndex = entryRows.findIndex(r => r.horseId === item.horseId);
                    return (
                      <View style={styles.resultCard}>
                        <View style={styles.cardHeader}>
                          <View style={styles.avatarContainer}>
                            {item.avatar ? (
                              <View style={{ width: 48, height: 48, borderRadius: 24, overflow: 'hidden', backgroundColor: premiumColors.surface2 }}>
                                <Image source={{ uri: item.avatar }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                              </View>
                            ) : (
                              <View style={styles.avatarPlaceholder}>
                                <MaterialIcons name="pets" size={24} color={premiumColors.textMuted} />
                              </View>
                            )}
                          </View>
                          <View style={styles.horseInfo}>
                            <Text style={styles.horseName}>{item.horseName.toUpperCase()}</Text>
                            {item.rank ? (
                              <View style={styles.rankBadge}>
                                <Text style={styles.rankText}>HẠNG {item.rank}</Text>
                              </View>
                            ) : null}
                          </View>
                        </View>

                        <View style={styles.formRow}>
                          <Text style={styles.label}>Thời gian (giây):</Text>
                          <TextInput
                            style={[styles.timeInput, isLocked && styles.disabledInput]}
                            value={item.finishTimeSecs}
                            onChangeText={txt => handleRowChange(originalIndex, 'finishTimeSecs', txt)}
                            placeholder="Ví dụ: 72.45"
                            placeholderTextColor={premiumColors.textMuted}
                            keyboardType="numeric"
                            editable={!isLocked}
                          />
                        </View>

                        <View style={styles.formRow}>
                          <Text style={styles.label}>Trạng thái:</Text>
                          <View style={styles.statusChips}>
                            {['finished', 'disqualified', 'did_not_finish'].map(out => {
                              const isActive = item.outcome === out;
                              const label = out === 'finished' ? 'Về đích' : out === 'disqualified' ? 'Loại' : 'DNF';
                              return (
                                <TouchableOpacity
                                  key={out}
                                  style={[styles.chip, isActive && styles.chipActive, isLocked && styles.chipLocked]}
                                  onPress={() => !isLocked && handleRowChange(originalIndex, 'outcome', out)}
                                  disabled={isLocked}
                                  activeOpacity={0.8}
                                >
                                  <Text style={[styles.chipText, isActive && styles.chipTextActive]}>{label}</Text>
                                </TouchableOpacity>
                              );
                            })}
                          </View>
                        </View>
                      </View>
                    );
                  }}
                />
              );
            })()}

            {!isLocked && entryRows.length > 0 && (
              <View style={styles.footer}>
                <TouchableOpacity
                  style={styles.confirmButton}
                  onPress={handleConfirm}
                  disabled={confirming}
                  activeOpacity={0.9}
                >
                  <Text style={styles.confirmButtonText}>{confirming ? 'ĐANG XỬ LÝ...' : 'XÁC NHẬN KHÓA KẾT QUẢ'}</Text>
                </TouchableOpacity>
              </View>
            )}
          </AppScreen>
        </Animated.View>
      )}
    </View>
  );
}

const getStyles = (premiumColors: any) => StyleSheet.create({
  content: {
    paddingHorizontal: premiumSpacing[16],
    paddingTop: premiumSpacing[16],
    paddingBottom: 100,
  },
  listContent: {
    padding: premiumSpacing[16],
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    backgroundColor: premiumColors.headerBg,
    borderBottomWidth: 1,
    borderBottomColor: premiumColors.headerBorder,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: premiumColors.surface2,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: premiumRadius[8],
    borderWidth: 1,
    borderColor: premiumColors.borderSoft,
  },
  backTxt: {
    color: premiumColors.textSecondary,
    fontSize: 12,
    fontWeight: '700',
  },
  headerTitle: {
    color: premiumColors.text,
    fontSize: 14,
    fontWeight: '900',
    flex: 1,
  },
  assignmentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: premiumColors.surface,
    borderWidth: 1,
    borderColor: premiumColors.border,
    borderRadius: premiumRadius[12],
    padding: 16,
    marginBottom: 12,
  },
  cardIconWrap: {
    width: 44,
    height: 44,
    borderRadius: premiumRadius[8],
    backgroundColor: 'rgba(225, 6, 0, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  assignmentTitle: {
    color: premiumColors.text,
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 4,
  },
  assignmentSubtitle: {
    color: premiumColors.textSecondary,
    fontSize: 12,
  },
  statusCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: premiumColors.surface,
    borderBottomWidth: 1,
    borderBottomColor: premiumColors.border,
    padding: 16,
  },
  statusLabel: {
    color: premiumColors.textMuted,
    fontSize: 10,
    fontWeight: '800',
  },
  statusBadge: {
    borderRadius: premiumRadius[4],
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginTop: 6,
    alignSelf: 'flex-start',
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '900',
  },
  topActions: {
    flexDirection: 'row',
    gap: 8,
  },
  topActionBtn: {
    borderRadius: premiumRadius[8],
    height: 32,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  topActionBtnText: {
    fontSize: 11,
    fontWeight: '800',
  },
  topActionBtnOutline: {
    borderRadius: premiumRadius[8],
    height: 32,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: premiumColors.borderStrong,
    backgroundColor: premiumColors.surface2,
  },
  topActionBtnOutlineText: {
    color: premiumColors.text,
    fontSize: 11,
    fontWeight: '800',
  },
  resultCard: {
    backgroundColor: premiumColors.surface,
    borderWidth: 1,
    borderColor: premiumColors.border,
    borderRadius: premiumRadius[12],
    padding: 16,
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: premiumColors.border,
    paddingBottom: 12,
    marginBottom: 12,
  },
  avatarContainer: {
    marginRight: 12,
  },
  avatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: premiumColors.surface2,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: premiumColors.border,
  },
  horseInfo: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  horseName: {
    color: premiumColors.text,
    fontSize: 14,
    fontWeight: '800',
  },
  rankBadge: {
    backgroundColor: 'rgba(225, 6, 0, 0.15)',
    borderRadius: premiumRadius[4],
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: 'rgba(225, 6, 0, 0.3)',
  },
  rankText: {
    color: premiumColors.brand,
    fontSize: 10,
    fontWeight: '900',
  },
  formRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  label: {
    color: premiumColors.textSecondary,
    fontSize: 12,
    fontWeight: '700',
  },
  timeInput: {
    width: 120,
    backgroundColor: premiumColors.surface2,
    borderWidth: 1,
    borderColor: premiumColors.border,
    color: premiumColors.text,
    borderRadius: premiumRadius[8],
    height: 40,
    paddingHorizontal: 12,
    fontSize: 14,
    textAlign: 'right',
  },
  disabledInput: {
    backgroundColor: premiumColors.surface,
    color: premiumColors.textMuted,
  },
  statusChips: {
    flexDirection: 'row',
    gap: 6,
  },
  chip: {
    backgroundColor: premiumColors.surface2,
    borderWidth: 1,
    borderColor: premiumColors.border,
    borderRadius: premiumRadius[8],
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  chipActive: {
    backgroundColor: 'rgba(52, 211, 153, 0.15)',
    borderColor: premiumColors.success,
  },
  chipLocked: {
    opacity: 0.6,
  },
  chipText: {
    color: premiumColors.textSecondary,
    fontSize: 11,
    fontWeight: '700',
  },
  chipTextActive: {
    color: premiumColors.success,
  },
  footer: {
    padding: 16,
    paddingBottom: 32,
    backgroundColor: premiumColors.bg,
  },
  confirmButton: {
    backgroundColor: premiumColors.brand,
    height: 54,
    borderRadius: premiumRadius[8],
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  podiumContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    marginTop: 32,
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  podiumCol: {
    alignItems: 'center',
    width: '30%',
    marginHorizontal: '1.5%',
  },
  podiumInfo: {
    alignItems: 'center',
    marginBottom: 8,
  },
  podiumAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    marginBottom: 8,
  },
  podiumAvatarPlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    marginBottom: 8,
    backgroundColor: premiumColors.surface2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  podiumName: {
    color: premiumColors.text,
    fontSize: 11,
    fontWeight: '800',
    textAlign: 'center',
  },
  podiumTime: {
    color: premiumColors.brand,
    fontSize: 11,
    fontWeight: '900',
    marginTop: 2,
  },
  podiumBlock: {
    width: '100%',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    alignItems: 'center',
    paddingTop: 12,
  },
  podiumRankText: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '900',
  },
  leaderboardList: {
    paddingHorizontal: 16,
  },
  leaderboardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: premiumColors.surface,
    borderWidth: 1,
    borderColor: premiumColors.border,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  leaderboardRank: {
    width: 30,
    color: premiumColors.textMuted,
    fontSize: 16,
    fontWeight: '900',
    textAlign: 'center',
  },
  leaderboardAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginHorizontal: 12,
  },
  leaderboardAvatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginHorizontal: 12,
    backgroundColor: premiumColors.surface2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  leaderboardInfo: {
    flex: 1,
  },
  leaderboardHorseName: {
    color: premiumColors.text,
    fontSize: 13,
    fontWeight: '800',
  },
  leaderboardStatus: {
    color: premiumColors.textSecondary,
    fontSize: 11,
    marginTop: 2,
  },
  leaderboardTime: {
    color: premiumColors.brand,
    fontSize: 14,
    fontWeight: '800',
  },
});
