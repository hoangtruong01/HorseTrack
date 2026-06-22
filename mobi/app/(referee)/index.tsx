import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { SectionHeader, ListItemCard, LoadingState, ErrorState, statusLabel } from '@/components/ui/shared';
import { AppScreen, ActionGrid, Section } from '@/components/ui/premium';
import { premiumColors, premiumSpacing, premiumRadius } from '@/components/ui/premium-tokens';
import { refereeAssignmentsApi, rankingsApi } from '@/lib/api-client';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

export default function RefereeHome() {
  const router = useRouter();
  const [assignments, setAssignments] = useState<any[]>([]);
  const [topHorses, setTopHorses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setError(null);
    Promise.all([
      refereeAssignmentsApi.myAssignments({ limit: 10 }).catch(() => []),
      rankingsApi.globalHorses().catch(() => [])
    ])
      .then(([aRes, hRes]) => {
        setAssignments((aRes as any).data || aRes || []);
        setTopHorses((hRes as any).data || hRes || []);
      })
      .catch((err: any) => setError(err.message || 'Lỗi tải phân công'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [loadData]);

  if (loading && !refreshing) return <LoadingState />;

  if (error) {
    return (
      <AppScreen scroll padded refreshing={refreshing} onRefresh={onRefresh}>
        <ErrorState message={error} onRetry={loadData} />
      </AppScreen>
    );
  }

  // Calculate truth metrics maintaining exact existing status strings
  const pendingCount = assignments.filter(a => a.status === 'assigned').length;
  const acceptedCount = assignments.filter(a => a.status === 'accepted').length;
  const totalCount = assignments.length;

  return (
    <AppScreen scroll refreshing={refreshing} onRefresh={onRefresh}>
      {/* ── Hero – flat race control ── */}
      <View style={styles.hero}>
        <Text style={styles.heroEyebrow}>RACE CONTROL</Text>
        <Text style={styles.heroTitle}>Trung tâm trọng tài</Text>
        <View style={styles.heroAccentLine} />
        <Text style={styles.heroSubtitle}>Theo dõi phân công, kiểm tra và kết quả đường đua.</Text>
      </View>

      {/* ── Overview Card ── */}
      <TouchableOpacity 
        style={styles.overviewCard} 
        onPress={() => router.push('/(referee)/assignments')}
        activeOpacity={0.8}
      >
        <View style={styles.overviewIconContainer}>
          <MaterialIcons name="calendar-today" size={20} color="#FFFFFF" />
        </View>
        <View style={styles.overviewContent}>
          <Text style={styles.overviewTitle}>Tổng quan hôm nay</Text>
          <Text style={styles.overviewSubtitle}>
            {pendingCount} phân công mới · {acceptedCount} nhiệm vụ đã nhận
          </Text>
        </View>
        <MaterialIcons name="chevron-right" size={20} color={premiumColors.textSecondary} />
      </TouchableOpacity>

      <View style={styles.content}>
        {/* ── Metrics 2×2 grid – telemetry style ── */}
        <View style={styles.metricsContainer}>
          <View style={[styles.metricCell, styles.cellBorderRight, styles.cellBorderBottom]}>
            <Text style={styles.metricLabel}>PHÂN CÔNG MỚI</Text>
            <View style={styles.metricValueRow}>
              <Text style={styles.metricValue}>{pendingCount}</Text>
            </View>
          </View>
          <View style={[styles.metricCell, styles.cellBorderBottom]}>
            <Text style={styles.metricLabel}>ĐÃ NHẬN</Text>
            <View style={styles.metricValueRow}>
              <Text style={styles.metricValue}>{acceptedCount}</Text>
            </View>
          </View>
          <View style={[styles.metricCell, styles.cellBorderRight]}>
            <Text style={styles.metricLabel}>TỔNG NHIỆM VỤ</Text>
            <View style={styles.metricValueRow}>
              <Text style={styles.metricValue}>{totalCount}</Text>
            </View>
          </View>
          <View style={styles.metricCell}>
            <Text style={styles.metricLabel}>SẴN SÀNG XỬ LÝ</Text>
            <View style={styles.metricValueRow}>
              <Text style={[styles.metricValue, styles.metricValueAccent]}>
                {acceptedCount}
              </Text>
            </View>
          </View>
        </View>

        {/* ── Quick Actions ── */}
        <Section title="Tiện ích">
          <ActionGrid
            columns={2}
            actions={[
              { title: 'Phân công', subtitle: 'Xem phân công', icon: 'assignment', tone: 'brand', onPress: () => router.push('/assignments') },
              { title: 'Kiểm tra', subtitle: 'Điểm danh', icon: 'fact-check', tone: 'brand', onPress: () => router.push('/pre-race') },
              { title: 'Vi phạm', subtitle: 'Ghi nhận vi phạm', icon: 'gavel', tone: 'brand', onPress: () => router.push('/violations') },
              { title: 'Kết quả', subtitle: 'Công bố kết quả', icon: 'emoji-events', tone: 'brand', onPress: () => router.push('/results') },
            ]}
          />
        </Section>

      <SectionHeader title="Phân công mới nhất" />
      {assignments.length === 0 ? (
        <Text style={styles.empty}>Chưa có phân công nào.</Text>
      ) : (
        assignments.slice(0, 3).map(a => {
          const s = statusLabel(a.status);
          const raceName = a.raceId?.name || 'Trận đua';
          return <ListItemCard key={a._id} title={raceName} subtitle={`Vai trò: ${a.role === 'main' ? 'Trọng tài chính' : 'Trợ lý'}`} rightText={s.label} rightColor={s.color} icon="assignment-turned-in" />;
        })
      )}

      <SectionHeader title="Bảng xếp hạng chiến mã" />
      {topHorses.length === 0 ? (
        <Text style={styles.empty}>Chưa có dữ liệu xếp hạng.</Text>
      ) : (
        topHorses.slice(0, 5).map((horse, idx) => (
          <ListItemCard
            key={horse.horseId || idx}
            title={`${idx + 1}. ${(horse.horseName || 'Chiến mã').toUpperCase()}`}
            subtitle={`Giống: ${horse.breed || 'Chưa rõ'} · Điểm: ${horse.totalPoints || 0} PTS`}
            icon="emoji-events"
            rightText={`Thắng: ${horse.wins || 0}`}
            rightColor="#F59E0B"
          />
        ))
      )}
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  // ── Hero ──
  hero: {
    paddingHorizontal: premiumSpacing[16],
    paddingTop: premiumSpacing[24],
    paddingBottom: premiumSpacing[20],
  },
  heroEyebrow: {
    fontSize: 11,
    fontWeight: '700',
    color: premiumColors.brand,
    letterSpacing: 1,
    marginBottom: premiumSpacing[8],
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: premiumColors.text,
    marginBottom: premiumSpacing[8],
  },
  heroAccentLine: {
    width: 36,
    height: 3,
    backgroundColor: premiumColors.brand,
    borderRadius: 2,
    marginBottom: premiumSpacing[12],
  },
  heroSubtitle: {
    fontSize: 14,
    color: premiumColors.textSecondary,
    lineHeight: 20,
  },

  overviewCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(225, 6, 0, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(225, 6, 0, 0.15)',
    marginHorizontal: premiumSpacing[16],
    marginBottom: premiumSpacing[24],
    borderRadius: premiumRadius[12],
    padding: premiumSpacing[16],
    shadowColor: '#E10600',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  overviewIconContainer: {
    width: 48,
    height: 48,
    borderRadius: premiumRadius[8],
    backgroundColor: '#E10600',
    alignItems: 'center',
    justifyContent: 'center',
  },
  overviewContent: {
    flex: 1,
    paddingLeft: premiumSpacing[12],
  },
  overviewTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  overviewSubtitle: {
    fontSize: 12,
    color: '#AEB6C2',
  },

  // ── Content wrapper ──
  content: {
    paddingHorizontal: premiumSpacing[16],
    paddingBottom: premiumSpacing[48],
  },

  // ── Metrics grid ──
  metricsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    backgroundColor: premiumColors.surface,
    borderRadius: premiumRadius[12],
    borderWidth: 1,
    borderColor: premiumColors.border,
    overflow: 'hidden',
    marginBottom: premiumSpacing[24],
  },
  metricCell: {
    width: '50%',
    padding: premiumSpacing[16],
  },
  cellBorderRight: {
    borderRightWidth: 1,
    borderRightColor: premiumColors.border,
  },
  cellBorderBottom: {
    borderBottomWidth: 1,
    borderBottomColor: premiumColors.border,
  },
  metricLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: premiumColors.textMuted,
    letterSpacing: 0.5,
    marginBottom: premiumSpacing[8],
  },
  metricValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  metricValue: {
    fontSize: 22,
    fontWeight: '700',
    color: premiumColors.text,
  },
  metricValueAccent: {
    color: premiumColors.brand,
  },

  // ── Row Items (Recent Assignments) ──
  rowItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: premiumSpacing[12],
    borderBottomWidth: 1,
    borderBottomColor: premiumColors.border,
    gap: premiumSpacing[12],
  },
  rowAvatar: {
    width: 42,
    height: 42,
    borderRadius: premiumRadius[8],
    backgroundColor: premiumColors.surface2,
    borderWidth: 1,
    borderColor: premiumColors.border,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  rowInfo: {
    flex: 1,
    minWidth: 0,
  },
  rowTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: premiumColors.text,
    marginBottom: 2,
  },
  rowSubtitle: {
    fontSize: 12,
    color: premiumColors.textMuted,
  },
  rowBadge: {
    borderWidth: 1,
    borderRadius: premiumRadius[4],
    paddingHorizontal: 6,
    paddingVertical: 3,
    flexShrink: 0,
  },
  rowBadgeText: {
    fontSize: 10,
    fontWeight: '600',
  },

  // ── Empty state ──
  empty: {
    color: premiumColors.textMuted,
    fontSize: 13,
    textAlign: 'center',
    marginVertical: premiumSpacing[16],
  },
});
