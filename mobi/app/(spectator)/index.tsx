import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Platform, ScrollView, RefreshControl } from 'react-native';
import { useRouter, Stack, Tabs } from 'expo-router';
import { LoadingState, ErrorState, statusLabel, formatDateTime } from '@/components/ui/shared';
import { ActionGrid, Section } from '@/components/ui/premium';
import { premiumColors, premiumSpacing, premiumRadius, usePremiumColors } from '@/components/ui/premium-tokens';
import { tournamentsApi, racesApi, rewardPointLedgerApi } from '@/lib/api-client';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useAuth } from '@/providers/auth-provider';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useThemeColors } from '@/components/ui/shared';

// Background Pattern
const GridBackground = ({ isDark }: { isDark: boolean }) => {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <View style={{ flex: 1, backgroundColor: isDark ? '#09090B' : '#F4F4F5' }} />
    </View>
  );
};

export default function SpectatorHome() {
  const router = useRouter();
  const { user } = useAuth();
  
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = useThemeColors();
  const premiumColors = usePremiumColors();
  const styles = React.useMemo(() => getStyles(isDark, theme, insets, premiumColors), [isDark, theme, insets, premiumColors]);

  const [balance, setBalance] = useState(0);
  const [tournaments, setTournaments] = useState<any[]>([]);
  const [races, setRaces] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setError(null);
    try {
      const [balRes, tRes, rRes] = await Promise.all([
        rewardPointLedgerApi.myBalance().catch(() => ({ balance: 0 })),
        tournamentsApi.list({ limit: 5 }).catch(() => ({ data: [] })),
        racesApi.list({ limit: 5 }).catch(() => ({ data: [] })),
      ]);
      setBalance((balRes as any).balance || 0);
      setTournaments((tRes as any).data || []);
      setRaces((rRes as any).data || []);
    } catch (err: any) {
      setError(err.message || 'Lỗi tải dữ liệu');
    } finally {
      setLoading(false);
    }
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

  const formatCompact = (val: number) => {
    if (val >= 1000000) return (val / 1000000).toFixed(1) + 'M';
    if (val >= 10000) return (val / 1000).toFixed(1) + 'k';
    return val.toLocaleString('vi-VN');
  };

  if (error) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />
        <Tabs.Screen options={{ headerShown: false }} />
        <GridBackground isDark={isDark} />
        <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 16 }} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
          <ErrorState message={error} onRetry={loadData} />
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <Tabs.Screen options={{ headerShown: false }} />
      <GridBackground isDark={isDark} />

      {/* Custom Sleek Header */}
      <View style={styles.customHeader}>
        <View style={[StyleSheet.absoluteFill, { paddingTop: Math.max(insets.top, 16), paddingBottom: 12 }]} pointerEvents="none">
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text style={styles.headerTitleText}>HORSETRACK</Text>
          </View>
        </View>
        <View style={styles.headerLeft} />
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.headerWallet} activeOpacity={0.8} onPress={() => router.push('/(spectator)/profile')}>
            <MaterialIcons name="account-balance-wallet" size={16} color={theme.textPrimary} />
            <Text style={styles.headerWalletText}>{balance.toLocaleString()}</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView 
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={premiumColors.brand} />}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Hero – flat racing viewer ── */}
        <View style={styles.heroContainer}>
          <View style={styles.heroCard}>
            <Image 
              source={require('../../assets/images/hero_horse_racing.png')} 
              style={styles.heroImage}
              resizeMode="cover"
            />
            <View style={styles.heroContent}>
              <View style={styles.heroBadge}>
                <Text style={styles.heroBadgeText}>RACE VIEWER</Text>
              </View>
              <Text style={styles.heroTitle}>Đường đua hôm nay</Text>
              <Text style={styles.heroSubtitle}>Theo dõi lịch đua, dự đoán kết quả và nhận điểm thưởng hấp dẫn.</Text>
            </View>
          </View>
        </View>

        {/* ── Overview Card ── */}
        <TouchableOpacity 
          style={styles.overviewCard} 
          onPress={() => router.push('/(spectator)/tournaments')}
          activeOpacity={0.8}
        >
          <View style={styles.overviewIconContainer}>
            <MaterialIcons name="calendar-today" size={20} color="#FFFFFF" />
          </View>
          <View style={styles.overviewContent}>
            <Text style={styles.overviewTitle}>Tổng quan hôm nay</Text>
            <Text style={styles.overviewSubtitle}>
              {races.length} trận sắp tới · {tournaments.filter(t => t.status === 'ONGOING').length} giải đấu đang mở
            </Text>
          </View>
          <MaterialIcons name="chevron-right" size={20} color={premiumColors.textSecondary} />
        </TouchableOpacity>

        <View style={styles.content}>
          {/* ── Metrics 2×2 grid – telemetry style ── */}
          <View style={styles.metricsContainer}>
            <View style={[styles.metricCell, styles.cellBorderRight, styles.cellBorderBottom]}>
              <Text style={styles.metricLabel}>VÍ ĐIỂM</Text>
              <View style={styles.metricValueRow}>
                <Text style={styles.metricValue}>{formatCompact(balance)}</Text>
                <Text style={styles.metricUnit}> điểm</Text>
              </View>
            </View>
            <View style={[styles.metricCell, styles.cellBorderBottom]}>
              <Text style={styles.metricLabel}>GIẢI ĐANG DIỄN RA</Text>
              <View style={styles.metricValueRow}>
                <Text style={styles.metricValue}>
                  {tournaments.filter(t => t.status === 'ONGOING').length}
                </Text>
                <Text style={styles.metricUnit}> giải</Text>
              </View>
            </View>
            <View style={[styles.metricCell, styles.cellBorderRight]}>
              <Text style={styles.metricLabel}>GIẢI ĐẤU NỔI BẬT</Text>
              <View style={styles.metricValueRow}>
                <Text style={styles.metricValue}>{tournaments.length}</Text>
                <Text style={styles.metricUnit}> giải</Text>
              </View>
            </View>
            <View style={styles.metricCell}>
              <Text style={styles.metricLabel}>TRẬN ĐUA SẮP TỚI</Text>
              <View style={styles.metricValueRow}>
                <Text style={[styles.metricValue, styles.metricValueAccent]}>{races.length}</Text>
                <Text style={[styles.metricUnit, styles.metricUnitAccent]}> trận</Text>
              </View>
            </View>
          </View>

          {/* ── Quick Actions ── */}
          <Section title="Tiện ích">
            <ActionGrid
              columns={2}
              actions={[
                { title: 'Giải Đấu', subtitle: 'Xem giải đang mở', icon: 'emoji-events', tone: 'brand', onPress: () => router.push('/tournaments') },
                { title: 'Trận Đua', subtitle: 'Theo dõi trận sắp tới', icon: 'flag', tone: 'brand', onPress: () => router.push('/(spectator)/tournaments') },
                { title: 'Dự Đoán', subtitle: 'Quản lý lựa chọn', icon: 'online-prediction', tone: 'brand', onPress: () => router.push('/predictions') },
                { title: 'Ví Điểm', subtitle: 'Theo dõi phần thưởng', icon: 'account-balance-wallet', tone: 'brand', onPress: () => router.push('/(spectator)/profile') },
              ]}
            />
          </Section>

          {/* ── Featured Tournaments ── */}
          <Section
            title="Giải đấu nổi bật"
            actionLabel="Xem tất cả"
            onAction={() => router.push('/tournaments')}
          >
            {tournaments.length === 0 ? (
              <Text style={styles.empty}>Hiện tại không có giải đấu nào đang diễn ra.</Text>
            ) : (
              tournaments.slice(0, 3).map(t => {
                const s = statusLabel(t.status);
                return (
                  <TouchableOpacity
                    key={t._id || t.id}
                    style={styles.rowItem}
                    onPress={() => router.push('/tournaments')}
                    activeOpacity={0.7}
                  >
                    <View style={styles.rowAvatar}>
                      <MaterialIcons name="emoji-events" size={18} color={premiumColors.textSecondary} />
                    </View>
                    <View style={styles.rowInfo}>
                      <Text style={styles.rowTitle} numberOfLines={1}>{t.name}</Text>
                      <Text style={styles.rowSubtitle} numberOfLines={1}>{t.location || 'Chưa có địa điểm'}</Text>
                    </View>
                    <View style={[styles.rowBadge, { borderColor: s.color + '40', backgroundColor: s.color + '18' }]}>
                      <Text style={[styles.rowBadgeText, { color: s.color }]}>{s.label}</Text>
                    </View>
                    <MaterialIcons name="chevron-right" size={16} color={premiumColors.textMuted} />
                  </TouchableOpacity>
                );
              })
            )}
          </Section>

          {/* ── Upcoming Races ── */}
          <Section
            title="Trận đua sắp tới"
            actionLabel="Xem tất cả"
            onAction={() => router.push('/(spectator)/tournaments')}
          >
            {races.length === 0 ? (
              <Text style={styles.empty}>Hiện tại không có trận đua nào sắp diễn ra.</Text>
            ) : (
              races.slice(0, 3).map(r => {
                const s = statusLabel(r.status);
                return (
                  <TouchableOpacity
                    key={r._id || r.id}
                    style={styles.rowItem}
                    onPress={() => router.push('/(spectator)/tournaments')}
                    activeOpacity={0.7}
                  >
                    <View style={styles.rowAvatar}>
                      <MaterialIcons name="flag" size={18} color={premiumColors.textSecondary} />
                    </View>
                    <View style={styles.rowInfo}>
                      <Text style={styles.rowTitle} numberOfLines={1}>{r.name}</Text>
                      <Text style={styles.rowSubtitle} numberOfLines={1}>{formatDateTime(r.startTime)}</Text>
                    </View>
                    <View style={[styles.rowBadge, { borderColor: s.color + '40', backgroundColor: s.color + '18' }]}>
                      <Text style={[styles.rowBadgeText, { color: s.color }]}>{s.label}</Text>
                    </View>
                    <MaterialIcons name="chevron-right" size={16} color={premiumColors.textMuted} />
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

const getStyles = (isDark: boolean, theme: any, insets: any, premiumColors: any) => StyleSheet.create({
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
  headerWallet: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
    minWidth: 36,
    justifyContent: 'center',
  },
  headerWalletText: {
    color: theme.textPrimary,
    fontSize: 13,
    fontWeight: '800',
  },

  // ── Hero ──
  heroContainer: {
    paddingHorizontal: premiumSpacing[16],
    paddingTop: premiumSpacing[16],
    paddingBottom: premiumSpacing[24],
  },
  heroCard: {
    borderRadius: premiumRadius[16],
    overflow: 'hidden',
    backgroundColor: '#000000',
    minHeight: 180,
    justifyContent: 'center',
  },
  heroImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
    opacity: 0.35,
  },
  heroContent: {
    padding: premiumSpacing[20],
    zIndex: 2,
  },
  heroBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(225, 6, 0, 0.8)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: premiumRadius[4],
    marginBottom: premiumSpacing[12],
  },
  heroBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: premiumSpacing[8],
    letterSpacing: -0.5,
  },
  heroSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    lineHeight: 18,
  },

  overviewCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: isDark ? 'rgba(225, 6, 0, 0.08)' : 'rgba(225, 6, 0, 0.05)',
    borderWidth: 1,
    borderColor: isDark ? 'rgba(225, 6, 0, 0.2)' : 'rgba(225, 6, 0, 0.15)',
    marginHorizontal: premiumSpacing[16],
    marginBottom: premiumSpacing[24],
    borderRadius: premiumRadius[12],
    padding: premiumSpacing[16],
  },
  overviewIconContainer: {
    width: 48,
    height: 48,
    borderRadius: premiumRadius[8],
    backgroundColor: '#E10600',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#E10600',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  overviewContent: {
    flex: 1,
    paddingLeft: premiumSpacing[12],
  },
  overviewTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: premiumColors.text,
    marginBottom: 4,
  },
  overviewSubtitle: {
    fontSize: 12,
    color: premiumColors.textSecondary,
    fontWeight: '500',
  },

  // ── Content wrapper ──
  content: {
    paddingHorizontal: premiumSpacing[16],
    paddingBottom: 110,
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
    fontWeight: '800',
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
    fontWeight: '800',
    color: premiumColors.text,
  },
  metricValueAccent: {
    color: premiumColors.brand,
  },
  metricUnit: {
    fontSize: 11,
    color: premiumColors.textMuted,
    marginLeft: 2,
    fontWeight: '600',
  },
  metricUnitAccent: {
    color: premiumColors.brand,
    opacity: 0.8,
  },

  // ── Row Items (Tournaments & Races) ──
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
    fontWeight: '700',
    color: premiumColors.text,
    marginBottom: 4,
  },
  rowSubtitle: {
    fontSize: 12,
    color: premiumColors.textSecondary,
    fontWeight: '500',
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
    fontWeight: '800',
  },

  // ── Empty state ──
  empty: {
    color: premiumColors.textMuted,
    fontSize: 13,
    textAlign: 'center',
    marginVertical: premiumSpacing[16],
  },
});
