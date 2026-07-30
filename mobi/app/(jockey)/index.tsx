import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { LoadingState, ErrorState, statusLabel } from '@/components/ui/shared';
import { AppScreen, ActionGrid, Section } from '@/components/ui/premium';
import { SleekHeader } from '@/components/ui/sleek-header';
import { WalletCard } from '@/components/ui/wallet-card';
import { premiumColors, premiumSpacing, premiumRadius, usePremiumColors } from '@/components/ui/premium-tokens';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { jockeyInvitationsApi, rewardPointLedgerApi } from '@/lib/api-client';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

export default function JockeyHome() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const premiumColorsDynamic = usePremiumColors();
  const styles = React.useMemo(() => getStyles(isDark, premiumColorsDynamic), [isDark, premiumColorsDynamic]);

  const [balance, setBalance] = useState(0);

  const [invitations, setInvitations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setError(null);
    try {
      const [invRes, balRes] = await Promise.all([
        jockeyInvitationsApi.listReceived({ limit: 10 }),
        rewardPointLedgerApi.myBalance(),
      ]);
      const list = (invRes as any).data || [];
      setInvitations(list);

      setBalance((balRes as any).balance || 0);
    } catch (err: any) {
      setError(err.message || 'Không thể tải dữ liệu dashboard.');
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

  if (error) {
    return (
      <AppScreen scroll padded refreshing={refreshing} onRefresh={onRefresh}>
        <ErrorState message={error} onRetry={loadData} />
      </AppScreen>
    );
  }

  // Calculate truth metrics
  const pendingCount = invitations.filter(i => i.status === 'PENDING').length;
  const acceptedCount = invitations.filter(i => i.status === 'ACCEPTED').length;
  const totalCount = invitations.length;

  return (
    <View style={styles.container}>
      <SleekHeader title="TRANG CHỦ" showWallet={false} />
      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={premiumColorsDynamic.brand} />}
        showsVerticalScrollIndicator={false}
      >

        {pendingCount > 0 && (
          <TouchableOpacity
            style={[styles.alertCard, { backgroundColor: isDark ? 'rgba(239, 68, 68, 0.1)' : '#FEF2F2', borderColor: isDark ? 'rgba(239, 68, 68, 0.2)' : '#FEE2E2' }]}
            onPress={() => router.push('/inbox')}
            activeOpacity={0.8}
          >
            <View style={[styles.alertIcon, { backgroundColor: isDark ? 'rgba(239, 68, 68, 0.2)' : '#FECACA' }]}>
              <MaterialIcons name="notifications-active" size={24} color="#EF4444" />
            </View>
            <View style={styles.alertContent}>
              <Text style={[styles.alertTitle, { color: isDark ? '#FCA5A5' : '#991B1B' }]}>Bạn có {pendingCount} lời mời mới</Text>
              <Text style={[styles.alertSubtitle, { color: isDark ? '#FECACA' : '#DC2626' }]}>Nhấn vào đây để xem chi tiết và phản hồi ngay.</Text>
            </View>
            <MaterialIcons name="chevron-right" size={20} color="#EF4444" />
          </TouchableOpacity>
        )}

        {/* ── Overview Card ── */}
        <TouchableOpacity
          style={styles.overviewCard}
          onPress={() => router.push('/schedule')}
          activeOpacity={0.8}
        >
          <View style={styles.overviewIconContainer}>
            <MaterialIcons name="calendar-today" size={20} color="#FFFFFF" />
          </View>
          <View style={styles.overviewContent}>
            <Text style={styles.overviewTitle}>Tổng quan hôm nay</Text>
            <Text style={styles.overviewSubtitle}>
              {acceptedCount} lịch đã nhận · {totalCount} tổng lời mời
            </Text>
          </View>
          <MaterialIcons name="chevron-right" size={20} color={premiumColorsDynamic.textSecondary} />
        </TouchableOpacity>

        <View style={styles.content}>
          <WalletCard balance={balance} />

          {/* ── Quick Actions ── */}
          <Section title="Tiện ích">
            <ActionGrid
              columns={4}
              actions={[
                { title: 'Hòm thư', icon: 'mail', tone: 'brand', onPress: () => router.push('/inbox') },
                { title: 'Lịch đua', icon: 'event', tone: 'brand', onPress: () => router.push('/schedule') },
                { title: 'Thành tích', icon: 'trending-up', tone: 'brand', onPress: () => router.push('/performance') },
                { title: 'Chiến mã', icon: 'pets', tone: 'brand', onPress: () => router.push('/horses') },
              ]}
            />
          </Section>

          {/* ── Recent Invitations ── */}
          <Section
            title="Lời mời gần đây"
            actionLabel="Xem tất cả"
            onAction={() => router.push('/inbox')}
          >
            {invitations.length === 0 ? (
              <Text style={styles.empty}>Chưa có lời mời thi đấu nào gần đây.</Text>
            ) : (
              invitations.slice(0, 3).map(i => {
                const s = statusLabel(i.status);
                // Fallback an toàn như yêu cầu
                const itemTitle = i.horseId?.name || i.raceId?.name || i.tournamentId?.name || 'Lời mời thi đấu';
                const ownerName = typeof i.ownerId === 'object' ? i.ownerId?.fullName : 'Chủ ngựa';

                let subtitleParts = [];
                if (ownerName) subtitleParts.push(`Từ: ${ownerName}`);
                const sharePercent = i.jockeySharePercent ?? i.prizeSharePercentage;
                if (sharePercent !== undefined && sharePercent !== null) subtitleParts.push(`Thưởng: ${sharePercent}%`);
                const finalSubtitle = subtitleParts.join(' · ');

                return (
                  <TouchableOpacity
                    key={i._id || i.id}
                    style={styles.rowItem}
                    onPress={() => router.push('/inbox')}
                    activeOpacity={0.7}
                  >
                    <View style={styles.rowAvatar}>
                      <MaterialIcons name="mail" size={18} color={premiumColors.textSecondary} />
                    </View>
                    <View style={styles.rowInfo}>
                      <Text style={styles.rowTitle} numberOfLines={1}>{itemTitle}</Text>
                      <Text style={styles.rowSubtitle} numberOfLines={1}>{finalSubtitle}</Text>
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

const getStyles = (isDark: boolean, premiumColors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: isDark ? '#09090B' : '#F4F4F5',
  },
  alertCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: premiumSpacing[16],
    marginTop: premiumSpacing[16],
    marginBottom: premiumSpacing[8],
    padding: premiumSpacing[16],
    borderRadius: premiumRadius[12],
    borderWidth: 1,
  },
  alertIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  alertContent: {
    flex: 1,
    paddingHorizontal: premiumSpacing[12],
  },
  alertTitle: {
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 4,
  },
  alertSubtitle: {
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 18,
  },

  overviewCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: isDark ? 'rgba(225, 6, 0, 0.05)' : '#FEF2F2',
    borderWidth: 1,
    borderColor: isDark ? 'rgba(225, 6, 0, 0.15)' : '#FEF2F2',
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
  metricUnit: {
    fontSize: 11,
    color: premiumColors.textMuted,
    marginLeft: 2,
  },
  metricUnitAccent: {
    color: premiumColors.brand,
    opacity: 0.8,
  },

  // ── Row Items (Recent Invitations) ──
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
