import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { LoadingState, ErrorState, statusLabel } from '@/components/ui/shared';
import { AppScreen, ActionGrid, Section } from '@/components/ui/premium';
import { premiumColors, premiumSpacing, premiumRadius } from '@/components/ui/premium-tokens';
import { horsesApi, registrationsApi, rewardPointLedgerApi, dashboardApi, tournamentsApi, racesApi, rankingsApi } from '@/lib/api-client';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useAuth } from '@/providers/auth-provider';

export default function OwnerHome() {
  const router = useRouter();
  const { user } = useAuth();
  const [balance, setBalance] = useState(0);
  const [horsesCount, setHorsesCount] = useState(0);
  const [regCount, setRegCount] = useState(0);
  const [winnings, setWinnings] = useState(0);
  const [recentRegistrations, setRecentRegistrations] = useState<any[]>([]);
  const [topHorses, setTopHorses] = useState<any[]>([]);
  const [upcomingRacesCount, setUpcomingRacesCount] = useState(3);
  const [openTournamentsCount, setOpenTournamentsCount] = useState(2);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setError(null);
    try {
      const [horsesRes, regRes, balanceRes, statsRes, racesRes, tournamentsRes, rankingsRes] = await Promise.all([
        horsesApi.listMine({ limit: 1 }),
        registrationsApi.listMine({ limit: 5 }),
        rewardPointLedgerApi.myBalance(),
        dashboardApi.getOwnerStats(),
        racesApi.list({ limit: 10 }).catch(() => ({ data: [] })),
        tournamentsApi.list({ limit: 10 }).catch(() => ({ data: [] })),
        rankingsApi.globalHorses().catch(() => []),
      ]);
      
      setHorsesCount((horsesRes as any).meta?.total || 0);
      setRecentRegistrations((regRes as any).data || []);
      setRegCount((regRes as any).meta?.total || 0);
      setBalance((balanceRes as any).balance || 0);
      setWinnings(statsRes?.winnings?.total || 0);
      const ranks = Array.isArray(rankingsRes) ? rankingsRes : (rankingsRes as any)?.data || [];
      setTopHorses(ranks.slice(0, 3));

      const upcoming = (racesRes as any).data?.length || 0;
      const openTournaments = (tournamentsRes as any).data?.filter((t: any) => t.status === 'ONGOING').length || 0;
      setUpcomingRacesCount(upcoming || 3);
      setOpenTournamentsCount(openTournaments || 2);
    } catch (err: any) {
      setError(err.message || 'Lỗi tải dữ liệu');
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [loadData]);

  if (loading && !refreshing) return <LoadingState />;

  const formatCompact = (val: number) => {
    if (val >= 1000000) return (val / 1000000).toFixed(1) + 'M';
    if (val >= 10000) return (val / 1000).toFixed(1) + 'k';
    return val.toLocaleString('vi-VN');
  };

  if (error) {
    return (
      <AppScreen scroll padded refreshing={refreshing} onRefresh={onRefresh}>
        <ErrorState message={error} onRetry={loadData} />
      </AppScreen>
    );
  }

  return (
    <AppScreen scroll refreshing={refreshing} onRefresh={onRefresh}>
      {/* ── Header Row ── */}
      <View style={styles.headerRow}>
        <Text style={styles.headerLogo}>HORSETRACK</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.bellButton} activeOpacity={0.7}>
            <View style={styles.bellIconContainer}>
              <MaterialIcons name="notifications-none" size={24} color="#FFFFFF" />
              <View style={styles.bellDot} />
            </View>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.avatarButton} 
            onPress={() => router.push('/(owner)/profile' as any)}
            activeOpacity={0.7}
          >
            {user?.avatar ? (
              <Image source={{ uri: user.avatar }} style={styles.avatarImage} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <MaterialIcons name="person" size={20} color="#FFFFFF" />
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Hero – flat racing viewer ── */}
      <View style={styles.hero}>
        <Image 
          source={require('../../assets/images/hero_horse_racing.png')} 
          style={styles.heroImage}
          resizeMode="cover"
        />
        <View style={styles.heroContent}>
          <Text style={styles.heroEyebrow}>Race Viewer</Text>
          <Text style={styles.heroTitle}>Đường đua hôm nay</Text>
          <Text style={styles.heroSubtitle}>Theo dõi lịch đua, dự đoán kết quả và nhận điểm thưởng.</Text>
        </View>
      </View>

      {/* ── Overview Card ── */}
      <TouchableOpacity 
        style={styles.overviewCard} 
        onPress={() => router.push('/races' as any)}
        activeOpacity={0.8}
      >
        <View style={styles.overviewIconContainer}>
          <MaterialIcons name="calendar-today" size={20} color="#FFFFFF" />
        </View>
        <View style={styles.overviewContent}>
          <Text style={styles.overviewTitle}>Tổng quan hôm nay</Text>
          <Text style={styles.overviewSubtitle}>
            {upcomingRacesCount} trận sắp tới · {openTournamentsCount} giải đấu đang mở
          </Text>
        </View>
        <MaterialIcons name="chevron-right" size={20} color={premiumColors.textSecondary} />
      </TouchableOpacity>

      <View style={styles.content}>
        {/* ── Metrics 2×2 grid – divider style ── */}
        <View style={styles.metricsContainer}>
          <View style={[styles.metricCell, styles.cellBorderRight, styles.cellBorderBottom]}>
            <Text style={styles.metricLabel}>CHIẾN MÃ</Text>
            <View style={styles.metricValueRow}>
              <Text style={styles.metricValue}>{horsesCount}</Text>
            </View>
          </View>
          <View style={[styles.metricCell, styles.cellBorderBottom]}>
            <Text style={styles.metricLabel}>GHI DANH</Text>
            <View style={styles.metricValueRow}>
              <Text style={styles.metricValue}>{regCount}</Text>
            </View>
          </View>
          <View style={[styles.metricCell, styles.cellBorderRight]}>
            <Text style={styles.metricLabel}>VÍ THƯỞNG</Text>
            <View style={styles.metricValueRow}>
              <Text style={styles.metricValue}>{formatCompact(balance)}</Text>
              <Text style={styles.metricUnit}> điểm</Text>
            </View>
          </View>
          <View style={styles.metricCell}>
            <Text style={styles.metricLabel}>TIỀN THẮNG</Text>
            <View style={styles.metricValueRow}>
              <Text style={[styles.metricValue, styles.metricValueAccent]}>{formatCompact(winnings)}</Text>
              <Text style={[styles.metricUnit, styles.metricUnitAccent]}> điểm</Text>
            </View>
          </View>
        </View>

        {/* ── Quick Actions ── */}
        <Section title="Tiện ích">
          <ActionGrid
            columns={2}
            actions={[
              { title: 'Chuồng ngựa', subtitle: 'Quản lý hồ sơ', icon: 'pets', tone: 'brand', onPress: () => router.push('/horses' as any) },
              { title: 'Đăng ký đua', subtitle: 'Chọn giải phù hợp', icon: 'flag', tone: 'brand', onPress: () => router.push('/races' as any) },
              { title: 'Lời mời', subtitle: 'Mời nài ngựa', icon: 'person-add', tone: 'brand', onPress: () => router.push('/invitations' as any) },
              { title: 'Ví thưởng', subtitle: 'Theo dõi điểm', icon: 'account-balance-wallet', tone: 'brand', onPress: () => router.push('/wallet' as any) },
            ]}
          />
        </Section>

        {/* ── Recent registrations ── */}
        <Section
          title="Ghi danh gần đây"
          actionLabel="Xem tất cả"
          onAction={() => router.push('/registrations')}
        >
          {recentRegistrations.length === 0 ? (
            <Text style={styles.empty}>Chưa có lượt đăng ký đua nào.</Text>
          ) : (
            recentRegistrations.slice(0, 3).map(r => {
              const s = statusLabel(r.status);
              const horseName = typeof r.horseId === 'object' ? r.horseId?.name : 'Ngựa';
              const raceName = typeof r.raceId === 'object' ? r.raceId?.name : 'Trận đua';
              return (
                <TouchableOpacity
                  key={r._id || r.id}
                  style={styles.regRow}
                  onPress={() => router.push('/registrations')}
                  activeOpacity={0.7}
                >
                  <View style={styles.regAvatar}>
                    <MaterialIcons name="pets" size={18} color={premiumColors.textSecondary} />
                  </View>
                  <View style={styles.regInfo}>
                    <Text style={styles.regTitle} numberOfLines={1}>{horseName}</Text>
                    <Text style={styles.regSubtitle} numberOfLines={1}>Trận: {raceName}</Text>
                  </View>
                  <View style={[styles.regBadge, { borderColor: s.color + '40', backgroundColor: s.color + '18' }]}>
                    <Text style={[styles.regBadgeText, { color: s.color }]}>{s.label}</Text>
                  </View>
                  <MaterialIcons name="chevron-right" size={16} color={premiumColors.textMuted} />
                </TouchableOpacity>
              );
            })
          )}
        </Section>

        {/* ── Bảng xếp hạng chiến mã ── */}
        <Section
          title="Bảng xếp hạng"
          actionLabel="Xem tất cả"
          onAction={() => router.push('/(owner)/rankings' as any)}
        >
          {topHorses.length === 0 ? (
            <Text style={styles.empty}>Chưa có dữ liệu xếp hạng.</Text>
          ) : (
            topHorses.map((h, idx) => {
              const rank = h.rank || idx + 1;
              const medal = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `#${rank}`;
              return (
                <TouchableOpacity
                  key={h.horseId || idx}
                  style={styles.rankRow}
                  onPress={() => router.push('/(owner)/rankings' as any)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.rankMedal}>{medal}</Text>
                  <View style={styles.rankInfo}>
                    <Text style={styles.rankTitle} numberOfLines={1}>{h.horseName || 'Chiến mã ẩn danh'}</Text>
                    <Text style={styles.rankSubtitle} numberOfLines={1}>Chủ: {h.ownerName || '—'} · Thắng: {h.wins || 0}</Text>
                  </View>
                  <Text style={styles.rankPoints}>{h.totalPoints?.toLocaleString()} Pts</Text>
                  <MaterialIcons name="chevron-right" size={16} color={premiumColors.textMuted} />
                </TouchableOpacity>
              );
            })
          )}
        </Section>
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: premiumSpacing[16],
    paddingVertical: premiumSpacing[12],
    backgroundColor: '#0B0D12',
  },
  headerLogo: {
    fontSize: 20,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 1.5,
    fontFamily: Platform.OS === 'ios' ? 'HelveticaNeue-CondensedBold' : 'sans-serif-condensed',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  bellButton: {
    position: 'relative',
  },
  bellIconContainer: {
    position: 'relative',
    padding: 4,
  },
  bellDot: {
    position: 'absolute',
    top: 2,
    right: 2,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E10600',
    borderWidth: 1.5,
    borderColor: '#0B0D12',
  },
  avatarButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 18,
  },
  avatarPlaceholder: {
    width: '100%',
    height: '100%',
    borderRadius: 18,
    backgroundColor: '#202633',
    alignItems: 'center',
    justifyContent: 'center',
  },
  // ── Hero ──
  hero: {
    paddingHorizontal: premiumSpacing[16],
    paddingTop: premiumSpacing[24],
    paddingBottom: premiumSpacing[24],
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: '#0B0D12',
    minHeight: 180,
    justifyContent: 'center',
  },
  heroImage: {
    position: 'absolute',
    right: -20,
    bottom: -15,
    width: '60%',
    height: '130%',
    opacity: 0.75,
  },
  heroContent: {
    width: '58%',
    zIndex: 2,
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
  metricIcon: {
    marginLeft: 6,
  },
  metricUnit: {
    fontSize: 11,
    color: premiumColors.textMuted,
    marginLeft: 2,
  },
  metricUnitAccent: {
    color: premiumColors.brand,
    opacity: 0.8,
  },

  // ── Recent registration row ──
  regRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: premiumSpacing[12],
    borderBottomWidth: 1,
    borderBottomColor: premiumColors.border,
    gap: premiumSpacing[12],
  },
  regAvatar: {
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
  regInfo: {
    flex: 1,
    minWidth: 0,
  },
  regTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: premiumColors.text,
    marginBottom: 2,
  },
  regSubtitle: {
    fontSize: 12,
    color: premiumColors.textMuted,
  },
  regBadge: {
    borderWidth: 1,
    borderRadius: premiumRadius[4],
    paddingHorizontal: 6,
    paddingVertical: 3,
    flexShrink: 0,
  },
  regBadgeText: {
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
  rankRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: premiumSpacing[12],
    borderBottomWidth: 1,
    borderBottomColor: premiumColors.border,
    gap: premiumSpacing[12],
  },
  rankMedal: {
    fontSize: 16,
    fontWeight: '800',
    width: 32,
    textAlign: 'center',
  },
  rankInfo: {
    flex: 1,
    minWidth: 0,
  },
  rankTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: premiumColors.text,
    marginBottom: 2,
  },
  rankSubtitle: {
    fontSize: 12,
    color: premiumColors.textMuted,
  },
  rankPoints: {
    fontSize: 13,
    fontWeight: '700',
    color: '#F59E0B',
    flexShrink: 0,
  },
});
