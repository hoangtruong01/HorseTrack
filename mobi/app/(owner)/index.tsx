import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { LoadingState, ErrorState, statusLabel } from '@/components/ui/shared';
import { AppScreen, ActionGrid, Section } from '@/components/ui/premium';
import { premiumColors, premiumSpacing, premiumRadius } from '@/components/ui/premium-tokens';
import { horsesApi, registrationsApi, rewardPointLedgerApi, dashboardApi } from '@/lib/api-client';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

export default function OwnerHome() {
  const router = useRouter();
  const [balance, setBalance] = useState(0);
  const [horsesCount, setHorsesCount] = useState(0);
  const [regCount, setRegCount] = useState(0);
  const [winnings, setWinnings] = useState(0);
  const [recentRegistrations, setRecentRegistrations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setError(null);
    try {
      const [horsesRes, regRes, balanceRes, statsRes] = await Promise.all([
        horsesApi.listMine({ limit: 1 }),
        registrationsApi.listMine({ limit: 5 }),
        rewardPointLedgerApi.myBalance(),
        dashboardApi.getOwnerStats(),
      ]);
      
      setHorsesCount((horsesRes as any).meta?.total || 0);
      setRecentRegistrations((regRes as any).data || []);
      setRegCount((regRes as any).meta?.total || 0);
      setBalance((balanceRes as any).balance || 0);
      setWinnings(statsRes?.winnings?.total || 0);
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
      {/* ── Hero – flat, theo Stitch reference ── */}
      <View style={styles.hero}>
        <Text style={styles.heroEyebrow}>RACING OWNER</Text>
        <Text style={styles.heroTitle}>Quản lý chuồng đua</Text>
        <Text style={styles.heroSubtitle}>Theo dõi chiến mã, ghi danh và ví thưởng chuyên nghiệp.</Text>
      </View>

      {/* ── Operational Intelligence ── */}
      <View style={styles.oiBlock}>
        <View style={styles.oiAccent} />
        <View style={styles.oiContent}>
          <Text style={styles.oiLabel}>OPERATIONAL INTELLIGENCE</Text>
          <Text style={styles.oiValue}>{horsesCount} chiến mã đang quản lý • {regCount} ghi danh hoạt động</Text>
        </View>
      </View>

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
});
