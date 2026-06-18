import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { LoadingState, ErrorState, statusLabel, formatDateTime } from '@/components/ui/shared';
import { AppScreen, ActionGrid, Section } from '@/components/ui/premium';
import { premiumColors, premiumSpacing, premiumRadius } from '@/components/ui/premium-tokens';
import { tournamentsApi, racesApi, rewardPointLedgerApi } from '@/lib/api-client';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useAuth } from '@/providers/auth-provider';

export default function SpectatorHome() {
  const router = useRouter();
  const { user } = useAuth();
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
        rewardPointLedgerApi.myBalance(),
        tournamentsApi.list({ limit: 5 }),
        racesApi.list({ limit: 5 }),
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
              <MaterialIcons name="notifications" size={24} color="#FFFFFF" />
              <View style={styles.bellDot} />
            </View>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.avatarButton} 
            onPress={() => router.push('/(tabs)/profile')}
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

      {/* ── Operational Intelligence ── */}
      <View style={styles.oiBlock}>
        <View style={styles.oiAccent} />
        <View style={styles.oiContent}>
          <Text style={styles.oiLabel}>OPERATIONAL INTELLIGENCE</Text>
          <Text style={styles.oiValue}>
            {races.length} trận đua sắp tới • {tournaments.length} giải đấu đang mở
          </Text>
        </View>
      </View>

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
              { title: 'Trận Đua', subtitle: 'Theo dõi trận sắp tới', icon: 'flag', tone: 'brand', onPress: () => router.push('/races') },
              { title: 'Dự Đoán', subtitle: 'Quản lý lựa chọn', icon: 'online-prediction', tone: 'brand', onPress: () => router.push('/predictions') },
              { title: 'Ví Điểm', subtitle: 'Theo dõi phần thưởng', icon: 'account-balance-wallet', tone: 'brand', onPress: () => router.push('/wallet') },
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
          onAction={() => router.push('/races')}
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
                  onPress={() => router.push('/races')}
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

  // ── Operational Intelligence ──
  oiBlock: {
    flexDirection: 'row',
    backgroundColor: premiumColors.surface2,
    marginHorizontal: premiumSpacing[16],
    marginBottom: premiumSpacing[24],
    borderRadius: premiumRadius[8],
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: premiumColors.border,
  },
  oiAccent: {
    width: 3,
    backgroundColor: premiumColors.brand,
  },
  oiContent: {
    flex: 1,
    padding: premiumSpacing[12],
  },
  oiLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: premiumColors.textMuted,
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  oiValue: {
    fontSize: 13,
    color: premiumColors.text,
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
  metricUnit: {
    fontSize: 11,
    color: premiumColors.textMuted,
    marginLeft: 2,
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
