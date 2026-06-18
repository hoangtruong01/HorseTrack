import React, { useEffect, useState, useCallback } from 'react';
import { ScrollView, StyleSheet, Text, View, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { C, LoadingState, EmptyState, ErrorState } from '@/components/ui/shared';
import { rankingsApi } from '@/lib/api-client';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

export default function SpectatorRankings() {
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
    let bg = '#1F2430';
    let textCol = '#AEB6C2';
    let isPodium = false;

    if (rank === 1) {
      bg = '#F59E0B'; // Gold
      textCol = '#0B0D12';
      isPodium = true;
    } else if (rank === 2) {
      bg = '#94A3B8'; // Silver
      textCol = '#0B0D12';
      isPodium = true;
    } else if (rank === 3) {
      bg = '#B45309'; // Bronze
      textCol = '#FFFFFF';
      isPodium = true;
    }

    return (
      <View style={[s.rankBadge, { backgroundColor: bg }, isPodium && s.podiumBadge]}>
        <Text style={[s.rankText, { color: textCol }]}>{rank}</Text>
      </View>
    );
  };

  if (loading) return <LoadingState />;

  return (
    <SafeAreaView style={s.safeArea} edges={['top', 'left', 'right']}>
      {/* Header */}
      <View style={s.headerRow}>
        <Text style={s.headerTitle}>Bảng xếp hạng</Text>
        <MaterialIcons name="military-tech" size={28} color="#F59E0B" />
      </View>
      <Text style={s.headerDesc}>Vinh danh chiến mã và nài ngựa xuất sắc nhất</Text>

      {/* Segment Tabs */}
      <View style={s.segmentContainer}>
        <TouchableOpacity
          style={[s.segmentBtn, activeTab === 'horses' && s.segmentBtnActive]}
          onPress={() => setActiveTab('horses')}
          activeOpacity={0.8}
        >
          <Text style={[s.segmentText, activeTab === 'horses' && s.segmentTextActive]}>🐎 Chiến mã</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[s.segmentBtn, activeTab === 'jockeys' && s.segmentBtnActive]}
          onPress={() => setActiveTab('jockeys')}
          activeOpacity={0.8}
        >
          <Text style={[s.segmentText, activeTab === 'jockeys' && s.segmentTextActive]}>🏇 Nài ngựa</Text>
        </TouchableOpacity>
      </View>

      {/* List content */}
      <ScrollView
        style={s.scrollView}
        contentContainerStyle={s.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.red} colors={[C.red]} />}
      >
        {error ? (
          <ErrorState message={error} onRetry={loadData} />
        ) : activeTab === 'horses' ? (
          horses.length === 0 ? (
            <EmptyState icon="military-tech" title="Chưa có xếp hạng" subtitle="Dữ liệu chiến mã sẽ cập nhật sau khi giải đấu diễn ra." />
          ) : (
            horses.map((item) => (
              <View key={item.horseId} style={s.rankCard}>
                {renderRankBadge(item.rank)}
                <View style={s.cardBody}>
                  <View style={s.nameRow}>
                    <Text style={s.cardName} numberOfLines={1}>{item.horseName || 'Chiến mã ẩn danh'}</Text>
                    {item.rank === 1 && <MaterialIcons name="local-fire-department" size={16} color="#E10600" />}
                  </View>
                  <Text style={s.cardSubtext}>{item.breed || 'Thuần chủng'} · Chủ: {item.ownerName || '—'}</Text>
                  <View style={s.statsRow}>
                    <Text style={s.statsText}>Số trận: <Text style={s.statsVal}>{item.totalRaces}</Text></Text>
                    <Text style={s.statsText}>Thắng: <Text style={[s.statsVal, { color: '#E10600' }]}>{item.wins}</Text></Text>
                    <Text style={s.statsText}>T/gian TB: <Text style={s.statsVal}>{formatAvgTime(item.totalFinishTimeMs, item.totalRaces)}</Text></Text>
                  </View>
                </View>
                <View style={s.pointsCol}>
                  <Text style={s.pointsVal}>{item.totalPoints?.toLocaleString()}</Text>
                  <Text style={s.pointsLabel}>Pts</Text>
                </View>
              </View>
            ))
          )
        ) : (
          jockeys.length === 0 ? (
            <EmptyState icon="military-tech" title="Chưa có xếp hạng" subtitle="Dữ liệu nài ngựa sẽ cập nhật sau khi giải đấu diễn ra." />
          ) : (
            jockeys.map((item) => (
              <View key={item.jockeyUserId} style={s.rankCard}>
                {renderRankBadge(item.rank)}
                <View style={s.cardBody}>
                  <View style={s.nameRow}>
                    <Text style={s.cardName} numberOfLines={1}>{item.jockeyName || 'Jockey ẩn danh'}</Text>
                    {item.rank === 1 && <MaterialIcons name="emoji-events" size={16} color="#F59E0B" />}
                  </View>
                  <Text style={s.cardSubtext}>{getSkillLevelText(item.skillLevel)} · {item.experienceYears ? `${item.experienceYears} năm KN` : '—'}</Text>
                  <View style={s.statsRow}>
                    <Text style={s.statsText}>Tổng trận cưỡi: <Text style={s.statsVal}>{item.totalRaces}</Text></Text>
                    <Text style={s.statsText}>Thắng: <Text style={[s.statsVal, { color: '#E10600' }]}>{item.wins}</Text></Text>
                  </View>
                </View>
                <View style={s.pointsCol}>
                  <Text style={s.pointsVal}>{item.totalPoints?.toLocaleString()}</Text>
                  <Text style={s.pointsLabel}>Pts</Text>
                </View>
              </View>
            ))
          )
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#000000',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  headerDesc: {
    fontSize: 12,
    color: '#AEB6C2',
    paddingHorizontal: 16,
    marginTop: 4,
    marginBottom: 16,
  },
  segmentContainer: {
    flexDirection: 'row',
    backgroundColor: '#171B24',
    borderRadius: 8,
    padding: 4,
    marginHorizontal: 16,
    marginBottom: 12,
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  rankCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#11141B',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    gap: 12,
  },
  rankBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  podiumBadge: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 2,
  },
  rankText: {
    fontSize: 12,
    fontWeight: '900',
  },
  cardBody: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  cardName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  cardSubtext: {
    fontSize: 11,
    color: '#6F7785',
    marginTop: 2,
  },
  statsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 6,
  },
  statsText: {
    fontSize: 10,
    color: '#AEB6C2',
  },
  statsVal: {
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  pointsCol: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    paddingLeft: 4,
  },
  pointsVal: {
    fontSize: 15,
    fontWeight: '900',
    color: '#34D399',
  },
  pointsLabel: {
    fontSize: 9,
    color: '#6F7785',
    fontWeight: 'bold',
    marginTop: 2,
  },
});
