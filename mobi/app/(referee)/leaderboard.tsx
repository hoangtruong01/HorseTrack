import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'expo-router';
import Animated, { FadeIn, FadeOut, SlideInRight, SlideOutRight } from 'react-native-reanimated';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Image, ScrollView, RefreshControl } from 'react-native';
import { AppScreen, Section } from '@/components/ui/premium';
import { premiumSpacing, premiumRadius, usePremiumColors } from '@/components/ui/premium-tokens';
import { LoadingState, EmptyState, useThemeColors } from '@/components/ui/shared';
import { refereeAssignmentsApi, raceResultsApi, rewardPointLedgerApi } from '@/lib/api-client';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColorScheme } from '@/hooks/use-color-scheme';

const GridBackground = ({ isDark }: { isDark: boolean }) => (
  <View style={StyleSheet.absoluteFill} pointerEvents="none">
    <View style={{ flex: 1, backgroundColor: isDark ? '#09090B' : '#F4F4F5' }} />
  </View>
);

export default function RefereeLeaderboardScreen({ nested }: { nested?: boolean }) {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = useThemeColors();
  const premiumColors = usePremiumColors();
  const styles = React.useMemo(() => getStyles(isDark, theme, insets, premiumColors), [isDark, theme, insets, premiumColors]);

  const router = useRouter();
  const [assignments, setAssignments] = useState<any[]>([]);
  const [selectedRaceId, setSelectedRaceId] = useState<string | null>(null);
  const [selectedRaceName, setSelectedRaceName] = useState<string>('');

  const [loading, setLoading] = useState(true);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const [resultsStatus, setResultsStatus] = useState('DRAFT');
  const [resultsData, setResultsData] = useState<any[]>([]);
  const [balance, setBalance] = useState(0);

  useEffect(() => {
    rewardPointLedgerApi.myBalance().then((res: any) => {
      setBalance(res?.data?.balance || res?.balance || 0);
    }).catch(() => {});
  }, []);

  const loadAssignments = useCallback(async () => {
    try {
      const res = await refereeAssignmentsApi.myAssignments({ limit: 50 });
      const list = (res as any).data || res || [];
      // Lấy tất cả các trận đã accepted (vì API có thể trả về status trận khác nhau tuỳ hệ thống)
      setAssignments(list.filter((a: any) => a.status === 'accepted' && a.raceId));
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
      const resultsRes = await raceResultsApi.getByRace(raceId);
      const existingResults = resultsRes?.data || resultsRes || [];

      if (existingResults.length > 0) {
        setResultsStatus(existingResults[0].status || 'DRAFT');
      } else {
        setResultsStatus('DRAFT');
      }

      const formatted = existingResults.map((r: any) => {
        const horseObj = typeof r.horseId === 'object' ? r.horseId : null;
        return {
          horseId: horseObj?._id || r.horseId,
          horseName: horseObj?.name || 'Chiến mã',
          avatar: horseObj?.avatar || horseObj?.image || '',
          outcome: r.outcome || 'finished',
          finishTimeSecs: r.finishTimeMs ? (r.finishTimeMs / 1000).toString() : '',
          rank: r.rank ? r.rank.toString() : '',
        };
      });

      setResultsData(formatted);
    } catch {
      setResultsData([]);
    } finally {
      setLoadingDetails(false);
    }
  };

  const isLocked = resultsStatus === 'CONFIRMED' || resultsStatus === 'PUBLISHED';

  if (loading && !refreshing) return <LoadingState />;

  return (
    <View style={{ flex: 1 }}>
      {!selectedRaceId ? (
        <Animated.View style={{ flex: 1 }} entering={FadeIn} exiting={FadeOut}>
          <GridBackground isDark={isDark} />

          {/* Custom Sleek Header cho màn hình List */}
          {!nested && (
            <View style={styles.customHeader}>
              <View style={[StyleSheet.absoluteFill, { paddingTop: Math.max(insets.top, 16), paddingBottom: 12 }]} pointerEvents="none">
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                  <Text style={styles.headerTitle}>KẾT QUẢ XẾP HẠNG</Text>
                </View>
              </View>
              <View style={styles.headerLeft}>
                <View style={{ height: 44 }} />
              </View>
              <View style={styles.headerRight}>
                <TouchableOpacity style={styles.headerWallet} activeOpacity={0.8} onPress={() => router.push('/operations/referee/wallet')}>
                  <MaterialIcons name="account-balance-wallet" size={16} color={theme.textPrimary} />
                  <Text style={styles.headerWalletText}>{balance.toLocaleString()}</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          <FlatList
            data={assignments}
            keyExtractor={(item) => item._id || item.id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            refreshing={refreshing}
            onRefresh={onRefresh}
            ListEmptyComponent={
              <EmptyState icon="sports-score" title="Chưa có nhiệm vụ đã nhận" subtitle="Vui lòng nhận phân công ở tab Phân công trước." />
            }
            renderItem={({ item: a }) => {
              const race = a.raceId;
              if (!race) return null;
              return (
                <TouchableOpacity
                  style={styles.assignmentCard}
                  onPress={() => selectRace(race._id || race.id, race.name)}
                  activeOpacity={0.8}
                >
                  <View style={styles.cardIconWrap}>
                    <MaterialIcons name="emoji-events" size={20} color={premiumColors.brand} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.assignmentTitle} numberOfLines={1}>{race.name}</Text>
                    <Text style={styles.assignmentSubtitle} numberOfLines={1}>Trạng thái: {race.status}</Text>
                  </View>
                  <MaterialIcons name="chevron-right" size={20} color={premiumColors.textMuted} />
                </TouchableOpacity>
              );
            }}
          />
        </Animated.View>
      ) : (
        <Animated.View style={{ flex: 1 }} entering={SlideInRight} exiting={SlideOutRight}>
          <GridBackground isDark={isDark} />
          <View style={styles.customHeader}>
            <View style={[StyleSheet.absoluteFill, { paddingTop: Math.max(insets.top, 16), paddingBottom: 12 }]} pointerEvents="none">
              <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <Text style={styles.headerTitle} numberOfLines={1}>{selectedRaceName.toUpperCase()}</Text>
              </View>
            </View>
            <View style={styles.headerLeft}>
              <TouchableOpacity style={styles.backBtn} onPress={() => setSelectedRaceId(null)} activeOpacity={0.8}>
                <MaterialIcons name="arrow-back" size={20} color={theme.textPrimary} />
              </TouchableOpacity>
            </View>
            <View style={styles.headerRight} />
          </View>

          {loadingDetails && !refreshing ? <LoadingState /> : (() => {
            if (resultsData.length === 0 || !isLocked) {
              return (
                <View style={{ paddingTop: 100 }}>
                  <EmptyState
                    icon="lock-clock"
                    title="Chưa có bảng xếp hạng chính thức"
                    subtitle="Trận đấu này chưa được khóa kết quả hoặc chưa có dữ liệu xếp hạng."
                  />
                </View>
              );
            }

            const sortedRows = [...resultsData].sort((a, b) => {
              const rankA = a.rank ? parseInt(a.rank, 10) : 999;
              const rankB = b.rank ? parseInt(b.rank, 10) : 999;
              return rankA - rankB;
            });

            const top1 = sortedRows.find(r => r.rank === '1');
            const top2 = sortedRows.find(r => r.rank === '2');
            const top3 = sortedRows.find(r => r.rank === '3');
            const rest = sortedRows.filter(r => {
              const rk = parseInt(r.rank, 10);
              return !r.rank || isNaN(rk) || rk > 3;
            });

            return (
              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 100 }}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={premiumColors.brand} />}
              >
                {/* Podium View */}
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

                {/* Rest List */}
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
          })()}
        </Animated.View>
      )}
    </View>
  );
}

const getStyles = (isDark: boolean, theme: any, insets: any, premiumColors: any) => StyleSheet.create({
  content: {
    paddingHorizontal: premiumSpacing[16],
    paddingTop: premiumSpacing[16],
    paddingBottom: 100,
  },
  listContent: {
    paddingHorizontal: premiumSpacing[16],
    paddingBottom: 100,
    paddingTop: 0,
  },
  customHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Math.max(insets.top, 16),
    paddingBottom: 12,
    zIndex: 10,
    backgroundColor: isDark ? 'rgba(9, 9, 11, 0.85)' : 'rgba(244, 244, 245, 0.85)',
  },
  headerLeft: {
    flex: 1,
    alignItems: 'flex-start',
  },
  headerRight: {
    flex: 1,
    alignItems: 'flex-end',
  },
  headerWallet: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },
  headerWalletText: {
    color: theme.textPrimary,
    fontSize: 12,
    fontWeight: '700',
  },
  headerTitle: {
    color: theme.textPrimary,
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
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
