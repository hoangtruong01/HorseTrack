import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Platform, ScrollView, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { LoadingState, ErrorState, statusLabel } from '@/components/ui/shared';
import { AppScreen, ActionGrid, Section } from '@/components/ui/premium';
import { SleekHeader } from '@/components/ui/sleek-header';
import { WalletCard } from '@/components/ui/wallet-card';
import { premiumColors, premiumSpacing, premiumRadius, usePremiumColors } from '@/components/ui/premium-tokens';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { horsesApi, registrationsApi, rewardPointLedgerApi, dashboardApi, tournamentsApi, racesApi, rankingsApi } from '@/lib/api-client';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useAuth } from '@/providers/auth-provider';

export default function OwnerHome() {
  const router = useRouter();
  const { user } = useAuth();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const premiumColorsDynamic = usePremiumColors();
  const styles = React.useMemo(() => getStyles(isDark, premiumColorsDynamic), [isDark, premiumColorsDynamic]);
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
      setUpcomingRacesCount(upcoming);
      setOpenTournamentsCount(openTournaments);
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
    <View style={styles.container}>
      <SleekHeader title="TRANG CHỦ" showWallet={false} />

      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={premiumColorsDynamic.brand} />}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Hero – flat athlete operations ── */}
        <View style={styles.hero}>
          <Text style={styles.heroEyebrow}>OWNER PORTAL</Text>
          <Text style={styles.heroTitle}>Bảng điều khiển</Text>
          <View style={styles.heroAccentLine} />
          <Text style={styles.heroSubtitle}>Quản lý chiến mã, ghi danh giải đua và theo dõi kết quả.</Text>
        </View>

        {/* ── Overview Card ── */}
        <TouchableOpacity
          style={styles.overviewCard}
          onPress={() => router.push('/(owner)/registrations' as any)}
          activeOpacity={0.8}
        >
          <View style={styles.overviewIconContainer}>
            <MaterialIcons name="calendar-today" size={20} color="#FFFFFF" />
          </View>
          <View style={styles.overviewContent}>
            <Text style={styles.overviewTitle}>Tổng quan hôm nay</Text>
            <Text style={styles.overviewSubtitle}>
              {upcomingRacesCount} trận tới · {horsesCount} chiến mã · {regCount} ghi danh
            </Text>
          </View>
          <MaterialIcons name="chevron-right" size={20} color={premiumColorsDynamic.textSecondary} />
        </TouchableOpacity>

        <View style={styles.content}>
          <WalletCard balance={balance} />

          {/* ── Quick Actions ── */}
          <Section title="Tiện ích">
            <ActionGrid
              columns={3}
              actions={[
                { title: 'Chuồng ngựa', icon: 'pets', tone: 'brand', onPress: () => router.push('/horses' as any) },
                { title: 'Đăng ký đua', icon: 'flag', tone: 'brand', onPress: () => router.push('/(owner)/registrations' as any) },
                { title: 'Lời mời', icon: 'person-add', tone: 'brand', onPress: () => router.push('/invitations' as any) },
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
                return (
                  <TouchableOpacity
                    key={h.horseId || idx}
                    style={styles.rankCard}
                    onPress={() => router.push('/(owner)/rankings' as any)}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.rankBadge, rank === 1 ? { backgroundColor: '#F59E0B' } : rank === 2 ? { backgroundColor: '#94A3B8' } : rank === 3 ? { backgroundColor: '#B45309' } : { backgroundColor: premiumColorsDynamic.surface2 }]}>
                      <Text style={[styles.rankBadgeText, { color: rank <= 3 ? '#FFF' : premiumColorsDynamic.textSecondary }]}>{rank}</Text>
                    </View>

                    {h.avatar ? (
                      <Image source={{ uri: h.avatar }} style={styles.rankAvatar} />
                    ) : (
                      <View style={styles.rankAvatarPlaceholder}>
                        <MaterialIcons name="pets" size={16} color={premiumColorsDynamic.textMuted} />
                      </View>
                    )}

                    <View style={styles.rankInfo}>
                      <Text style={styles.rankTitle} numberOfLines={1}>{h.horseName || 'Chiến mã ẩn danh'}</Text>
                      <Text style={styles.rankSubtitle} numberOfLines={1}>Chủ: {h.ownerName || '—'}</Text>
                    </View>

                    <View style={styles.rankPointsCol}>
                      <Text style={styles.rankPoints}>{h.totalPoints?.toLocaleString()}</Text>
                      <Text style={styles.rankPointsLabel}>Pts</Text>
                    </View>
                  </TouchableOpacity>
                );
              })
            )}
          </Section>
        </View>
      </ScrollView>
    </View>
  );
}

const getStyles = (isDark: boolean, premiumColors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: isDark ? '#09090B' : '#F4F4F5',
  },
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
    backgroundColor: isDark ? 'rgba(225, 6, 0, 0.05)' : '#FEF2F2',
    borderWidth: 1,
    borderColor: isDark ? 'rgba(225, 6, 0, 0.15)' : 'rgba(225, 6, 0, 0.15)',
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
    color: premiumColors.text,
    marginBottom: 4,
  },
  overviewSubtitle: {
    fontSize: 12,
    color: premiumColors.textSecondary,
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
  rankCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: premiumSpacing[12],
    borderBottomWidth: 1,
    borderBottomColor: premiumColors.border,
    marginBottom: premiumSpacing[4],
  },
  rankBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  rankBadgeText: {
    fontSize: 12,
    fontWeight: '900',
  },
  rankAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 12,
  },
  rankAvatarPlaceholder: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 12,
    backgroundColor: premiumColors.surface2,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: premiumColors.border,
  },
  rankInfo: {
    flex: 1,
  },
  rankTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: premiumColors.text,
    marginBottom: 2,
  },
  rankSubtitle: {
    fontSize: 11,
    color: premiumColors.textSecondary,
  },
  rankPointsCol: {
    alignItems: 'flex-end',
  },
  rankPoints: {
    fontSize: 14,
    fontWeight: '800',
    color: premiumColors.brand,
  },
  rankPointsLabel: {
    fontSize: 9,
    color: premiumColors.textMuted,
    fontWeight: '700',
  },
});
