import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { SectionHeader, ListItemCard, LoadingState, ErrorState, statusLabel, useThemeColors } from '@/components/ui/shared';
import { AppScreen, ActionGrid, Section } from '@/components/ui/premium';
import { premiumColors, premiumSpacing, premiumRadius, usePremiumColors } from '@/components/ui/premium-tokens';
import { refereeAssignmentsApi, rankingsApi, rewardPointLedgerApi } from '@/lib/api-client';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColorScheme } from '@/hooks/use-color-scheme';

// Background Pattern
const GridBackground = ({ isDark }: { isDark: boolean }) => {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <View style={{ flex: 1, backgroundColor: isDark ? '#09090B' : '#F4F4F5' }} />
    </View>
  );
};

export default function RefereeHome() {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = useThemeColors();
  const premiumColors = usePremiumColors();
  const styles = React.useMemo(() => getStyles(isDark, theme, insets, premiumColors), [isDark, theme, insets, premiumColors]);

  const router = useRouter();
  const [assignments, setAssignments] = useState<any[]>([]);
  const [topHorses, setTopHorses] = useState<any[]>([]);
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setError(null);
    Promise.all([
      refereeAssignmentsApi.myAssignments({ limit: 10 }).catch(() => []),
      rankingsApi.globalHorses().catch(() => []),
      rewardPointLedgerApi.myBalance().catch(() => ({ balance: 0 }))
    ])
      .then(([aRes, hRes, bRes]) => {
        setAssignments((aRes as any).data || aRes || []);
        setTopHorses((hRes as any).data || hRes || []);
        setBalance((bRes as any).balance || 0);
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
    <View style={styles.container}>
      <GridBackground isDark={isDark} />

      {/* Custom Sleek Header */}
      <View style={styles.customHeader}>
        <View style={[StyleSheet.absoluteFill, { paddingTop: Math.max(insets.top, 16), paddingBottom: 12 }]} pointerEvents="none">
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text style={styles.headerTitle}>Trang chủ</Text>
          </View>
        </View>
        <View style={styles.headerLeft}>
          <View style={styles.profileBadge}>
            <MaterialIcons name="sports" size={18} color={premiumColors.brand} />
          </View>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.headerWallet} activeOpacity={0.8} onPress={() => router.push('/operations/referee/wallet')}>
            <MaterialIcons name="account-balance-wallet" size={16} color={theme.textPrimary} />
            <Text style={styles.headerWalletText}>{balance.toLocaleString()}</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingBottom: 120 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={premiumColors.brand} />}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Hero Card ── */}
        <View style={styles.heroContainer}>
          <View style={styles.heroCard}>
            <View style={styles.heroBadge}>
              <MaterialIcons name="radar" size={14} color="#FFFFFF" style={{ marginRight: 4 }} />
              <Text style={styles.heroBadgeText}>RACE CONTROL</Text>
            </View>
            <Text style={styles.heroTitle}>Trung Tâm Trọng Tài</Text>
            <Text style={styles.heroSubtitle}>Giám sát phân công, ghi nhận kiểm tra và cập nhật kết quả các trận đua một cách chuẩn xác.</Text>
          </View>
        </View>

        <View style={styles.content}>
          {/* ── Sleek Metrics Grid ── */}
          <Section title="Tổng quan nhiệm vụ">
            <View style={styles.statsGrid}>
              <View style={[styles.statCard, pendingCount > 0 && styles.statCardActive]}>
                <View style={[styles.statIconWrapper, pendingCount > 0 && styles.statIconWrapperActive]}>
                  <MaterialIcons name="fiber-new" size={20} color={pendingCount > 0 ? premiumColors.brand : premiumColors.textSecondary} />
                </View>
                <Text style={[styles.statValue, pendingCount > 0 && { color: premiumColors.brand }]}>{pendingCount}</Text>
                <Text style={styles.statLabel}>Phân công mới</Text>
              </View>

              <View style={styles.statCard}>
                <View style={styles.statIconWrapper}>
                  <MaterialIcons name="assignment-turned-in" size={20} color={premiumColors.textSecondary} />
                </View>
                <Text style={styles.statValue}>{acceptedCount}</Text>
                <Text style={styles.statLabel}>Đã tiếp nhận</Text>
              </View>

              <View style={styles.statCard}>
                <View style={styles.statIconWrapper}>
                  <MaterialIcons name="fact-check" size={20} color={premiumColors.textSecondary} />
                </View>
                <Text style={styles.statValue}>{totalCount}</Text>
                <Text style={styles.statLabel}>Tổng nhiệm vụ</Text>
              </View>
            </View>
          </Section>

          {/* ── Quick Actions ── */}
          <Section title="Điều hành">
            <ActionGrid
              columns={2}
              actions={[
                { title: 'Nhiệm vụ', subtitle: 'Xem phân công', icon: 'assignment', tone: 'brand', onPress: () => router.push('/assignments' as any) },
                { title: 'Xếp hạng', subtitle: 'Top chiến mã', icon: 'emoji-events', tone: 'brand', onPress: () => router.push('/(referee)/leaderboard' as any) },
                { title: 'Ví điện tử', subtitle: 'Thu nhập', icon: 'account-balance-wallet', tone: 'brand', onPress: () => router.push('/operations/referee/wallet') },
                { title: 'Cá nhân', subtitle: 'Hồ sơ', icon: 'person', tone: 'brand', onPress: () => router.push('/profile') },
              ]}
            />
          </Section>

          {/* ── Recent Assignments ── */}
          <View style={styles.sectionHeaderRow}>
            <SectionHeader title="Phân công mới nhất" />
            <TouchableOpacity onPress={() => router.push('/assignments')}>
              <Text style={styles.viewAllText}>Xem tất cả</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.listContainer}>
            {assignments.length === 0 ? (
              <View style={styles.emptyCard}>
                <MaterialIcons name="inbox" size={32} color={premiumColors.textMuted} />
                <Text style={styles.empty}>Chưa có phân công nào gần đây.</Text>
              </View>
            ) : (
              assignments.slice(0, 3).map(a => {
                const s = statusLabel(a.status);
                const raceName = a.raceId?.name || 'Trận đua';
                return (
                  <ListItemCard
                    key={a._id}
                    title={raceName}
                    subtitle={`Vai trò: ${a.role === 'main' ? 'Trọng tài chính' : 'Trợ lý'}`}
                    rightText={s.label}
                    rightColor={s.color}
                    icon="assignment-turned-in"
                  />
                );
              })
            )}
          </View>

          {/* ── Leaderboard ── */}
          <SectionHeader title="Top Chiến Mã" />
          <View style={styles.listContainer}>
            {topHorses.length === 0 ? (
              <View style={styles.emptyCard}>
                <Text style={styles.empty}>Chưa có dữ liệu xếp hạng.</Text>
              </View>
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
  headerTitle: {
    color: theme.textPrimary,
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 1,
  },
  profileBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: isDark ? 'rgba(225, 6, 0, 0.1)' : 'rgba(225, 6, 0, 0.05)',
    borderWidth: 1,
    borderColor: isDark ? 'rgba(225, 6, 0, 0.2)' : 'rgba(225, 6, 0, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerWallet: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
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
    backgroundColor: isDark ? 'rgba(225, 6, 0, 0.08)' : '#FFFFFF',
    borderRadius: premiumRadius[16],
    padding: premiumSpacing[24],
    borderWidth: 1,
    borderColor: isDark ? 'rgba(225, 6, 0, 0.2)' : 'rgba(0,0,0,0.05)',
    shadowColor: isDark ? '#E10600' : '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: isDark ? 0.2 : 0.05,
    shadowRadius: 16,
    elevation: 4,
    position: 'relative',
    overflow: 'hidden',
  },
  heroBadge: {
    flexDirection: 'row',
    alignSelf: 'flex-start',
    alignItems: 'center',
    backgroundColor: premiumColors.brand,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: premiumRadius[8],
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
    color: premiumColors.text,
    marginBottom: premiumSpacing[8],
    letterSpacing: -0.5,
  },
  heroSubtitle: {
    fontSize: 14,
    color: premiumColors.textSecondary,
    lineHeight: 22,
  },

  // ── Content wrapper ──
  content: {
    paddingHorizontal: premiumSpacing[16],
  },

  // ── Sleek Metrics Grid ──
  statsGrid: {
    flexDirection: 'row',
    gap: premiumSpacing[12],
    marginBottom: premiumSpacing[8],
  },
  statCard: {
    flex: 1,
    backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : '#FFFFFF',
    borderRadius: premiumRadius[12],
    padding: premiumSpacing[16],
    borderWidth: 1,
    borderColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
    alignItems: 'flex-start',
  },
  statCardActive: {
    backgroundColor: isDark ? 'rgba(225, 6, 0, 0.08)' : 'rgba(225, 6, 0, 0.03)',
    borderColor: isDark ? 'rgba(225, 6, 0, 0.2)' : 'rgba(225, 6, 0, 0.1)',
  },
  statIconWrapper: {
    width: 32,
    height: 32,
    borderRadius: premiumRadius[8],
    backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: premiumSpacing[12],
  },
  statIconWrapperActive: {
    backgroundColor: isDark ? 'rgba(225, 6, 0, 0.15)' : 'rgba(225, 6, 0, 0.08)',
  },
  statValue: {
    fontSize: 22,
    fontWeight: '800',
    color: premiumColors.text,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: premiumColors.textSecondary,
  },

  // ── Layout Helpers ──
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: premiumSpacing[4], // SectionHeader has its own margin
  },
  viewAllText: {
    fontSize: 13,
    fontWeight: '600',
    color: premiumColors.brand,
  },
  listContainer: {
    gap: premiumSpacing[12],
    marginBottom: premiumSpacing[24],
  },

  // ── Empty state ──
  emptyCard: {
    backgroundColor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
    borderRadius: premiumRadius[12],
    padding: premiumSpacing[24],
    borderWidth: 1,
    borderColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: premiumSpacing[12],
  },
  empty: {
    color: premiumColors.textMuted,
    fontSize: 13,
    textAlign: 'center',
  },
});

