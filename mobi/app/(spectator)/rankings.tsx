import React, { useEffect, useState, useCallback } from 'react';
import { ScrollView, StyleSheet, Text, View, TouchableOpacity, RefreshControl, Image } from 'react-native';
import { LoadingState, EmptyState, ErrorState } from '@/components/ui/shared';
import { rankingsApi } from '@/lib/api-client';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { premiumColors, premiumSpacing, premiumRadius, usePremiumColors } from '@/components/ui/premium-tokens';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useThemeColors } from '@/components/ui/shared';
import { Stack, Tabs, useRouter } from 'expo-router';

// Background Pattern
const GridBackground = ({ isDark }: { isDark: boolean }) => {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <View style={{ flex: 1, backgroundColor: isDark ? '#09090B' : '#F4F4F5' }} />
    </View>
  );
};

export default function SpectatorRankings() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = useThemeColors();
  const pc = usePremiumColors();
  const styles = React.useMemo(() => getStyles(isDark, theme, insets, pc), [isDark, theme, insets, pc]);

  const [activeTab, setActiveTab] = useState<'horses' | 'jockeys'>('horses');
  const [horses, setHorses] = useState<any[]>([]);
  const [jockeys, setJockeys] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setError(null);
    try {
      const [horsesRes, jockeysRes] = await Promise.all([
        rankingsApi.globalHorses().catch(() => []),
        rankingsApi.globalJockeys().catch(() => []),
      ]);

      // Sort and map ranks manually if not present
      const mappedHorses = (horsesRes || []).map((h: any, idx: number) => ({
        ...h,
        rank: h.rank || idx + 1,
      }));
      const mappedJockeys = (jockeysRes || []).map((j: any, idx: number) => ({
        ...j,
        rank: j.rank || idx + 1,
      }));

      setHorses(mappedHorses);
      setJockeys(mappedJockeys);
    } catch (err: any) {
      setError(err.message || 'Không thể tải bảng xếp hạng. Vui lòng thử lại.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData();
  }, [loadData]);

  const formatAvgTime = (totalMs?: number, totalRaces?: number) => {
    if (!totalMs || !totalRaces) return '—';
    const avgMs = totalMs / totalRaces;
    const totalSeconds = avgMs / 1000;
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = (totalSeconds % 60).toFixed(2);
    return `${minutes}:${seconds.padStart(5, '0')}`;
  };

  const getSkillLevelText = (level?: string) => {
    if (!level) return 'Chưa xác định';
    const map: Record<string, string> = {
      beginner: 'Nài tập sự',
      intermediate: 'Nài trung cấp',
      advanced: 'Nài cao cấp',
      professional: 'Chuyên nghiệp',
    };
    return map[level.toLowerCase()] || level;
  };

  const renderRankBadge = (rank: number) => {
    let bg = pc.surface2;
    let textCol = pc.textSecondary;

    if (rank === 1) {
      bg = '#F59E0B'; // Gold
      textCol = '#09090B';
    } else if (rank === 2) {
      bg = '#94A3B8'; // Silver
      textCol = '#09090B';
    } else if (rank === 3) {
      bg = '#B45309'; // Bronze
      textCol = '#FFFFFF';
    }

    return (
      <View style={[styles.rankBadge, { backgroundColor: bg }]}>
        <Text style={[styles.rankText, { color: textCol }]}>{rank}</Text>
      </View>
    );
  };

  const renderPodium = (list: any[], isHorse: boolean) => {
    const top1 = list.find((i: any) => i.rank === 1);
    const top2 = list.find((i: any) => i.rank === 2);
    const top3 = list.find((i: any) => i.rank === 3);

    const getName = (item: any) => isHorse ? (item.horseName || 'Chiến mã ẩn danh') : (item.jockeyName || 'Nài ẩn danh');
    const getSubtext = (item: any) => isHorse ? `${item.wins} thắng` : `${item.totalPoints?.toLocaleString()} pts`;
    const getIcon = () => isHorse ? "pets" : "person";

    return (
      <View style={styles.podiumContainer}>
        {top2 ? (
          <View style={styles.podiumCol}>
            <View style={styles.podiumInfo}>
              {top2.avatar ? <Image source={{ uri: top2.avatar }} style={[styles.podiumAvatar, { borderColor: 'rgba(225,6,0,0.7)' }]} /> : <View style={[styles.podiumAvatarPlaceholder, { borderColor: 'rgba(225,6,0,0.7)' }]}><MaterialIcons name={getIcon()} size={24} color={pc.textMuted} /></View>}
              <Text style={styles.podiumName} numberOfLines={1}>{getName(top2).toUpperCase()}</Text>
              <Text style={styles.podiumTime}>{getSubtext(top2)}</Text>
            </View>
            <View style={[styles.podiumBlock, { height: 110, backgroundColor: 'rgba(225,6,0,0.7)' }]}>
              <Text style={styles.podiumRankText}>2</Text>
            </View>
          </View>
        ) : <View style={styles.podiumCol} />}

        {top1 ? (
          <View style={styles.podiumCol}>
            <View style={styles.podiumInfo}>
              {top1.avatar ? <Image source={{ uri: top1.avatar }} style={[styles.podiumAvatar, { borderColor: pc.brand }]} /> : <View style={[styles.podiumAvatarPlaceholder, { borderColor: pc.brand }]}><MaterialIcons name={getIcon()} size={24} color={pc.textMuted} /></View>}
              <Text style={styles.podiumName} numberOfLines={1}>{getName(top1).toUpperCase()}</Text>
              <Text style={styles.podiumTime}>{getSubtext(top1)}</Text>
            </View>
            <View style={[styles.podiumBlock, { height: 150, backgroundColor: pc.brand, zIndex: 10, shadowColor: pc.brand, shadowOpacity: 0.5, shadowRadius: 10, shadowOffset: { width: 0, height: -2 } }]}>
              <Text style={styles.podiumRankText}>1</Text>
            </View>
          </View>
        ) : <View style={styles.podiumCol} />}

        {top3 ? (
          <View style={styles.podiumCol}>
            <View style={styles.podiumInfo}>
              {top3.avatar ? <Image source={{ uri: top3.avatar }} style={[styles.podiumAvatar, { borderColor: 'rgba(225,6,0,0.4)' }]} /> : <View style={[styles.podiumAvatarPlaceholder, { borderColor: 'rgba(225,6,0,0.4)' }]}><MaterialIcons name={getIcon()} size={24} color={pc.textMuted} /></View>}
              <Text style={styles.podiumName} numberOfLines={1}>{getName(top3).toUpperCase()}</Text>
              <Text style={styles.podiumTime}>{getSubtext(top3)}</Text>
            </View>
            <View style={[styles.podiumBlock, { height: 80, backgroundColor: 'rgba(225,6,0,0.4)' }]}>
              <Text style={styles.podiumRankText}>3</Text>
            </View>
          </View>
        ) : <View style={styles.podiumCol} />}
      </View>
    );
  };

  if (loading) return <LoadingState />;

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <Tabs.Screen options={{ headerShown: false }} />
      <GridBackground isDark={isDark} />

      {/* Custom Sleek Header */}
      <View style={styles.customHeader}>
        <View style={[StyleSheet.absoluteFill, { paddingTop: Math.max(insets.top, 16), paddingBottom: 12 }]} pointerEvents="none">
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text style={styles.headerTitleText}>XẾP HẠNG</Text>
          </View>
        </View>
        <View style={styles.headerLeft} />
        <View style={styles.headerRight} />
      </View>

      {/* Segment Tabs */}
      <View style={styles.segmentContainer}>
        <TouchableOpacity
          style={[styles.segmentBtn, activeTab === 'horses' && styles.segmentBtnActive]}
          onPress={() => setActiveTab('horses')}
          activeOpacity={0.8}
        >
          <Text style={[styles.segmentText, activeTab === 'horses' && styles.segmentTextActive]}>Chiến mã</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.segmentBtn, activeTab === 'jockeys' && styles.segmentBtnActive]}
          onPress={() => setActiveTab('jockeys')}
          activeOpacity={0.8}
        >
          <Text style={[styles.segmentText, activeTab === 'jockeys' && styles.segmentTextActive]}>Nài ngựa</Text>
        </TouchableOpacity>
      </View>

      {/* List content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={pc.brand} />}
        showsVerticalScrollIndicator={false}
      >
        {error ? (
          <ErrorState message={error} onRetry={loadData} />
        ) : activeTab === 'horses' ? (
          horses.length === 0 ? (
            <EmptyState icon="military-tech" title="Chưa có xếp hạng" subtitle="Dữ liệu chiến mã sẽ cập nhật sau khi giải đấu diễn ra." />
          ) : (
            <>
              {renderPodium(horses, true)}
              <View style={styles.leaderboardList}>
                {horses.filter(h => h.rank > 3).map((item) => (
                  <View key={item.horseId} style={styles.leaderboardRow}>
                    {renderRankBadge(item.rank)}
                    {item.avatar ? (
                      <Image source={{ uri: item.avatar }} style={styles.leaderboardAvatar} />
                    ) : (
                      <View style={styles.leaderboardAvatarPlaceholder}>
                        <MaterialIcons name="pets" size={16} color={pc.textMuted} />
                      </View>
                    )}
                    <View style={styles.leaderboardInfo}>
                      <View style={styles.nameRow}>
                        <Text style={styles.leaderboardName} numberOfLines={1}>{item.horseName || 'Chiến mã ẩn danh'}</Text>
                        {item.rank === 1 && <MaterialIcons name="local-fire-department" size={14} color="#E10600" />}
                      </View>
                      <Text style={styles.leaderboardSubtext}>{item.breed || 'Thuần chủng'} · Chủ: {item.ownerName || '—'}</Text>
                      <View style={styles.statsRow}>
                        <Text style={styles.statsText}>Trận: <Text style={styles.statsVal}>{item.totalRaces}</Text></Text>
                        <Text style={styles.statsText}>Thắng: <Text style={[styles.statsVal, { color: '#E10600' }]}>{item.wins}</Text></Text>
                        <Text style={styles.statsText}>TB: <Text style={styles.statsVal}>{formatAvgTime(item.totalFinishTimeMs, item.totalRaces)}</Text></Text>
                      </View>
                    </View>
                    <View style={styles.pointsCol}>
                      <Text style={styles.pointsVal}>{item.totalPoints?.toLocaleString()}</Text>
                      <Text style={styles.pointsLabel}>Pts</Text>
                    </View>
                  </View>
                ))}
              </View>
            </>
          )
        ) : (
          jockeys.length === 0 ? (
            <EmptyState icon="military-tech" title="Chưa có xếp hạng" subtitle="Dữ liệu nài ngựa sẽ cập nhật sau khi giải đấu diễn ra." />
          ) : (
            <>
              {renderPodium(jockeys, false)}
              <View style={styles.leaderboardList}>
                {jockeys.filter(j => j.rank > 3).map((item) => (
                  <View key={item.jockeyUserId} style={styles.leaderboardRow}>
                    {renderRankBadge(item.rank)}
                    {item.avatar ? (
                      <Image source={{ uri: item.avatar }} style={styles.leaderboardAvatar} />
                    ) : (
                      <View style={styles.leaderboardAvatarPlaceholder}>
                        <MaterialIcons name="person" size={16} color={pc.textMuted} />
                      </View>
                    )}
                    <View style={styles.leaderboardInfo}>
                      <View style={styles.nameRow}>
                        <Text style={styles.leaderboardName} numberOfLines={1}>{item.jockeyName || 'Jockey ẩn danh'}</Text>
                        {item.rank === 1 && <MaterialIcons name="emoji-events" size={14} color="#F59E0B" />}
                      </View>
                      <Text style={styles.leaderboardSubtext}>{getSkillLevelText(item.skillLevel)} · {item.experienceYears ? `${item.experienceYears} năm KN` : '—'}</Text>
                      <View style={styles.statsRow}>
                        <Text style={styles.statsText}>Tổng trận: <Text style={styles.statsVal}>{item.totalRaces}</Text></Text>
                        <Text style={styles.statsText}>Thắng: <Text style={[styles.statsVal, { color: '#E10600' }]}>{item.wins}</Text></Text>
                      </View>
                    </View>
                    <View style={styles.pointsCol}>
                      <Text style={styles.pointsVal}>{item.totalPoints?.toLocaleString()}</Text>
                      <Text style={styles.pointsLabel}>Pts</Text>
                    </View>
                  </View>
                ))}
              </View>
            </>
          ))}
      </ScrollView>
    </View>
  );
}

const getStyles = (isDark: boolean, theme: any, insets: any, pc: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: isDark ? '#09090B' : '#F4F4F5',
  },
  // Custom Header
  customHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Math.max(insets.top, 16),
    paddingBottom: 12,
    paddingHorizontal: 16,
    minHeight: Math.max(insets.top, 16) + 48,
    backgroundColor: isDark ? 'rgba(9, 9, 11, 0.85)' : 'rgba(255, 255, 255, 0.85)',
    borderBottomWidth: 1,
    borderBottomColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
    zIndex: 10,
  },
  headerLeft: {
    flex: 1,
    alignItems: 'flex-start',
  },
  headerRight: {
    flex: 1,
    alignItems: 'flex-end',
  },
  headerTitleText: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.textPrimary,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },

  segmentContainer: {
    flexDirection: 'row',
    backgroundColor: pc.surface,
    borderRadius: premiumRadius[12],
    padding: 4,
    marginHorizontal: 16,
    marginVertical: 12,
    borderWidth: 1,
    borderColor: pc.border,
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: premiumRadius[8],
    backgroundColor: 'transparent',
  },
  segmentBtnActive: {
    backgroundColor: pc.surface2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: isDark ? 0.3 : 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  segmentText: {
    fontSize: 13,
    color: pc.textSecondary,
    fontWeight: '600',
  },
  segmentTextActive: {
    color: pc.text,
    fontWeight: '800',
  },

  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 110,
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
    backgroundColor: pc.surface2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  podiumName: {
    color: pc.text,
    fontSize: 11,
    fontWeight: '800',
    textAlign: 'center',
  },
  podiumTime: {
    color: pc.brand,
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
    paddingBottom: 16,
  },

  leaderboardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: pc.surface,
    borderWidth: 1,
    borderColor: pc.border,
    borderRadius: premiumRadius[16],
    padding: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: isDark ? 0.2 : 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  rankBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankText: {
    fontSize: 13,
    fontWeight: '900',
  },
  leaderboardAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginHorizontal: 12,
  },
  leaderboardAvatarPlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginHorizontal: 12,
    backgroundColor: pc.surface2,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: pc.border,
  },
  leaderboardInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  leaderboardName: {
    fontSize: 14,
    fontWeight: '800',
    color: pc.text,
  },
  leaderboardSubtext: {
    fontSize: 11,
    color: pc.textSecondary,
    marginTop: 2,
  },
  statsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 6,
  },
  statsText: {
    fontSize: 10,
    color: pc.textMuted,
  },
  statsVal: {
    fontWeight: '800',
    color: pc.text,
  },
  pointsCol: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    paddingLeft: 8,
  },
  pointsVal: {
    fontSize: 16,
    fontWeight: '900',
    color: pc.success, // typically a greenish color for points
  },
  pointsLabel: {
    fontSize: 9,
    color: pc.textMuted,
    fontWeight: '800',
    marginTop: 2,
  },
});
