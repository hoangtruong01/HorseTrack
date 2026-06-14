import React, { useEffect, useState, useCallback } from 'react';
import { StyleSheet, View, Text, FlatList, RefreshControl, Platform, SafeAreaView } from 'react-native';
import { C, Card, LoadingState, ErrorState, EmptyState, useThemeColors } from '../../components/ui/shared';
import { jockeyInvitationsApi } from '../../lib/api-client';

export default function JockeyHorsesScreen() {
  const [horsesData, setHorsesData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const theme = useThemeColors();

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
    
    // Thuộc tính khác
    const breed = horseObj?.breed || 'Thuần chủng';
    const baseSpeed = horseObj?.baseSpeed || 50;
    const staminaScore = horseObj?.staminaScore || 70;
    const age = horseObj?.age || 4;
    const healthStatus = horseObj?.healthStatus || 'healthy';

    const ownerName = item.ownerId?.fullName || item.invitation?.registration?.owner?.fullName || 'Chủ ngựa';
    const raceName = item.raceId?.name || item.invitation?.registration?.race?.name || 'Trận đua';
    const tourName = item.tournamentId?.name || item.invitation?.registration?.tournament?.name || 'Giải đua';

    return (
      <Card style={styles.card}>
        <View style={styles.cardHeader}>
          <View>
            <Text style={[styles.horseName, { color: theme.textPrimary }]}>{horseName.toUpperCase()}</Text>
            <Text style={[styles.breedText, { color: theme.textSecondary }]}>{breed}</Text>
          </View>
          <View style={[styles.badge, { backgroundColor: theme.teal + '20', borderColor: theme.teal + '40' }]}>
            <Text style={[styles.badgeText, { color: theme.teal }]}>ĐÃ LIÊN KẾT</Text>
          </View>
        </View>

        <View style={styles.statsGrid}>
          <View style={[styles.statBox, { backgroundColor: theme.inputBg, borderColor: theme.cardBorder }]}>
            <Text style={[styles.statLabel, { color: theme.textMuted }]}>TỐC ĐỘ</Text>
            <Text style={[styles.statValue, { color: theme.textPrimary }]}>{baseSpeed} km/h</Text>
          </View>
          <View style={[styles.statBox, { backgroundColor: theme.inputBg, borderColor: theme.cardBorder }]}>
            <Text style={[styles.statLabel, { color: theme.textMuted }]}>THỂ LỰC</Text>
            <Text style={[styles.statValue, { color: theme.textPrimary }]}>{staminaScore}/100</Text>
          </View>
          <View style={[styles.statBox, { backgroundColor: theme.inputBg, borderColor: theme.cardBorder }]}>
            <Text style={[styles.statLabel, { color: theme.textMuted }]}>TUỔI</Text>
            <Text style={[styles.statValue, { color: theme.textPrimary }]}>{age} Tuổi</Text>
          </View>
          <View style={[styles.statBox, { backgroundColor: theme.inputBg, borderColor: theme.cardBorder }]}>
            <Text style={[styles.statLabel, { color: theme.textMuted }]}>SỨC KHỎE</Text>
            <Text style={[styles.statValue, { color: healthStatus === 'healthy' ? theme.teal : theme.red }]}>
              {healthStatus === 'healthy' ? 'Khỏe mạnh' : 'Chấn thương'}
            </Text>
          </View>
        </View>

        <View style={[styles.infoSection, { borderTopColor: theme.cardBorder }]}>
          <Text style={[styles.infoText, { color: theme.textSecondary }]}>
            Chủ ngựa: <Text style={{ color: theme.textPrimary, fontWeight: '700' }}>{ownerName}</Text>
          </Text>
          <Text style={[styles.infoText, { color: theme.textSecondary, marginTop: 4 }]}>
            Giải đua: <Text style={{ color: theme.textPrimary, fontWeight: '700' }}>{tourName}</Text>
          </Text>
          <Text style={[styles.infoText, { color: theme.textSecondary, marginTop: 4 }]}>
            Trận đua: <Text style={{ color: theme.textPrimary, fontWeight: '700' }}>{raceName}</Text>
          </Text>
        </View>
      </Card>
    );
  };

  if (loading) {
    return <LoadingState />;
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>
      <FlatList
        data={horsesData}
        renderItem={renderItem}
        keyExtractor={(item, idx) => item._id || idx.toString()}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.red} colors={[theme.red]} />
        }
        ListEmptyComponent={
          error ? (
            <ErrorState message={error} onRetry={loadHorses} />
          ) : (
            <EmptyState
              icon="pets"
              title="Chưa có chiến mã được phân công"
              subtitle="Nhận lời mời từ chủ ngựa trong tab Hòm thư để liên kết chiến mã của bạn."
            />
          )
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    padding: 16,
    paddingBottom: 32,
  },
  card: {
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottomWidth: 1,
    borderBottomColor: 'transparent',
    paddingBottom: 10,
    marginBottom: 12,
  },
  horseName: {
    fontSize: 16,
    fontWeight: '900',
    fontFamily: Platform.OS === 'ios' ? 'HelveticaNeue-CondensedBold' : 'sans-serif-condensed',
  },
  breedText: {
    fontSize: 12,
    marginTop: 2,
  },
  badge: {
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  statBox: {
    flex: 1,
    minWidth: '45%',
    borderWidth: 1,
    borderRadius: 8,
    padding: 8,
  },
  statLabel: {
    fontSize: 8,
    fontWeight: '800',
    marginBottom: 2,
    letterSpacing: 0.5,
  },
  statValue: {
    fontSize: 12,
    fontWeight: '700',
  },
  infoSection: {
    borderTopWidth: 1,
    paddingTop: 12,
    marginTop: 4,
  },
  infoText: {
    fontSize: 12,
  },
});
