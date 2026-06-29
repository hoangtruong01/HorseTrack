import React, { useEffect, useState, useCallback } from 'react';
import { StyleSheet, View, Text, FlatList, RefreshControl } from 'react-native';
import { AppScreen } from '@/components/ui/premium';
import { premiumColors, premiumSpacing, premiumRadius } from '@/components/ui/premium-tokens';
import { LoadingState, ErrorState, EmptyState } from '@/components/ui/shared';
import { SleekHeader } from '@/components/ui/sleek-header';
import { jockeyInvitationsApi } from '@/lib/api-client';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function JockeyHorsesScreen() {
  const [horsesData, setHorsesData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadHorses = useCallback(async () => {
    setError(null);
    try {
      const res = await jockeyInvitationsApi.listReceived({ page: 1, limit: 100 });
      const list = (res as any).data || res || [];
      const acceptedInvites = list.filter((i: any) => i.status === 'ACCEPTED');
      setHorsesData(acceptedInvites);
    } catch (err: any) {
      console.error('Lỗi lấy danh sách chiến mã của Jockey:', err);
      setError(err.message || 'Không thể tải danh sách chiến mã.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadHorses();
  }, [loadHorses]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadHorses();
  }, [loadHorses]);

  const renderItem = ({ item }: { item: any }) => {
    // Ưu tiên hiển thị horse object/name
    let horseObj = item.invitation?.registration?.horse || item.invitation?.horse || item.horseId;
    
    // Tên ngựa có thể nằm ở các trường khác
    let horseName = horseObj?.name || item.horseName || item.registration?.horseName || 'Chiến mã chưa rõ tên';
    
    // Thuộc tính khác (giữ fallback nếu có real data)
    const breed = horseObj?.breed || 'Thuần chủng';
    const baseSpeed = horseObj?.baseSpeed;
    const staminaScore = horseObj?.staminaScore;
    const age = horseObj?.age;
    const healthStatus = horseObj?.healthStatus;

    const ownerName = item.ownerId?.fullName || item.invitation?.registration?.owner?.fullName || 'Chủ ngựa';
    const raceName = item.raceId?.name || item.invitation?.registration?.race?.name || 'Trận đua';
    const tourName = item.tournamentId?.name || item.invitation?.registration?.tournament?.name || 'Giải đua';

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View>
            <Text style={styles.horseName}>{horseName.toUpperCase()}</Text>
            <Text style={styles.breedText}>{breed}</Text>
          </View>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>ĐÃ LIÊN KẾT</Text>
          </View>
        </View>

        {/* Chỉ hiển thị StatGrid nếu thật sự tồn tại ít nhất 1 thuộc tính thật sự (kiểm tra baseSpeed) */}
        {baseSpeed !== undefined && (
          <View style={styles.statsGrid}>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>TỐC ĐỘ</Text>
              <Text style={styles.statValue}>{baseSpeed} km/h</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>THỂ LỰC</Text>
              <Text style={styles.statValue}>{staminaScore}/100</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>TUỔI</Text>
              <Text style={styles.statValue}>{age} Tuổi</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>SỨC KHỎE</Text>
              <Text style={[styles.statValue, { color: healthStatus === 'healthy' ? premiumColors.success : premiumColors.danger }]}>
                {healthStatus === 'healthy' ? 'Khỏe mạnh' : 'Chấn thương'}
              </Text>
            </View>
          </View>
        )}

        <View style={styles.infoSection}>
          <Text style={styles.infoText}>Chủ ngựa: <Text style={styles.infoHighlight}>{ownerName}</Text></Text>
          <Text style={styles.infoText}>Giải đua: <Text style={styles.infoHighlight}>{tourName}</Text></Text>
          <Text style={styles.infoText}>Trận đua: <Text style={styles.infoHighlight}>{raceName}</Text></Text>
        </View>
      </View>
    );
  };

  if (loading && !refreshing) {
    return <LoadingState />;
  }

  return (
    <AppScreen safeArea={false} style={styles.container}>
      <SleekHeader title="CHIẾN MÃ" showWallet={true} />

      <FlatList
        data={horsesData}
        renderItem={renderItem}
        keyExtractor={(item, idx) => item._id || idx.toString()}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={premiumColors.brand} colors={[premiumColors.brand]} />
        }
        ListEmptyComponent={
          error ? (
            <ErrorState message={error} onRetry={loadHorses} />
          ) : (
            <View style={styles.emptyWrap}>
              <EmptyState
                icon="pets"
                title="Chưa có chiến mã được phân công"
                subtitle="Nhận lời mời từ chủ ngựa trong tab Hòm thư để liên kết chiến mã của bạn."
              />
            </View>
          )
        }
      />
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: premiumColors.bg,
  },
  header: {
    paddingHorizontal: premiumSpacing[16],
    paddingTop: premiumSpacing[24],
    paddingBottom: premiumSpacing[16],
  },
  eyebrow: {
    fontSize: 11,
    fontWeight: '700',
    color: premiumColors.brand,
    letterSpacing: 1,
    marginBottom: premiumSpacing[8],
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: premiumColors.text,
    marginBottom: premiumSpacing[8],
  },
  accentLine: {
    width: 36,
    height: 3,
    backgroundColor: premiumColors.brand,
    borderRadius: 2,
  },
  listContent: {
    paddingHorizontal: premiumSpacing[16],
    paddingBottom: premiumSpacing[48],
  },
  emptyWrap: {
    marginTop: premiumSpacing[24],
  },

  // ── Card ──
  card: {
    backgroundColor: premiumColors.surface,
    borderWidth: 1,
    borderColor: premiumColors.border,
    borderRadius: premiumRadius[12],
    padding: premiumSpacing[16],
    marginBottom: premiumSpacing[16],
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottomWidth: 1,
    borderBottomColor: 'transparent',
    paddingBottom: premiumSpacing[8],
    marginBottom: premiumSpacing[12],
  },
  horseName: {
    fontSize: 16,
    fontWeight: '800',
    color: premiumColors.text,
    marginBottom: 4,
  },
  breedText: {
    fontSize: 12,
    color: premiumColors.textSecondary,
  },
  badge: {
    borderWidth: 1,
    borderRadius: premiumRadius[4],
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: premiumColors.success + '15',
    borderColor: premiumColors.success + '40',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
    color: premiumColors.success,
  },
  
  // ── Stats Grid ──
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: premiumSpacing[16],
  },
  statBox: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: premiumColors.surface2,
    borderWidth: 1,
    borderColor: premiumColors.border,
    borderRadius: premiumRadius[8],
    padding: premiumSpacing[8],
  },
  statLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: premiumColors.textMuted,
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  statValue: {
    fontSize: 13,
    fontWeight: '700',
    color: premiumColors.text,
  },

  // ── Info Section ──
  infoSection: {
    borderTopWidth: 1,
    borderTopColor: premiumColors.border,
    paddingTop: premiumSpacing[12],
    gap: 4,
  },
  infoText: {
    fontSize: 13,
    color: premiumColors.textSecondary,
  },
  infoHighlight: {
    color: premiumColors.text,
    fontWeight: '700',
  },
});
