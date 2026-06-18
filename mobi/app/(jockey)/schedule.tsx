import React, { useCallback, useEffect, useState } from 'react';
import { View, StyleSheet, Text, FlatList, RefreshControl } from 'react-native';
import { AppScreen, Section } from '@/components/ui/premium';
import { premiumColors, premiumSpacing, premiumRadius } from '@/components/ui/premium-tokens';
import { LoadingState, EmptyState, ErrorState, statusLabel, formatDateTime } from '@/components/ui/shared';
import { jockeyInvitationsApi } from '@/lib/api-client';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

export default function JockeySchedule() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setError(null);
    try {
      const r = await jockeyInvitationsApi.listReceived({ limit: 50 });
      const list = (r as any).data || [];
      setData(list.filter((i: any) => i.status === 'ACCEPTED'));
    } catch (err: any) {
      setError(err.message || 'Không thể tải lịch trình.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData();
  }, [loadData]);

  if (loading && !refreshing) return <LoadingState />;

  const renderItem = ({ item }: { item: any }) => {
    const st = statusLabel(item.status);
    const raceName = typeof item.raceId === 'object' ? item.raceId?.name : 'Trận đua';
    const horseName = typeof item.horseId === 'object' ? item.horseId?.name : 'Ngựa';
    const startTime = typeof item.raceId === 'object' ? item.raceId?.startTime : undefined;

    return (
      <View style={styles.card}>
        <View style={styles.cardIcon}>
          <MaterialIcons name="event" size={24} color={premiumColors.textSecondary} />
        </View>
        <View style={styles.cardInfo}>
          <Text style={styles.raceTitle} numberOfLines={1}>{raceName}</Text>
          <Text style={styles.detailText} numberOfLines={1}>
            Chiến mã: <Text style={styles.highlight}>{horseName}</Text>
          </Text>
          <Text style={styles.detailText} numberOfLines={1}>
            Thời gian: {formatDateTime(startTime)}
          </Text>
        </View>
        <View style={[styles.badge, { borderColor: st.color + '40', backgroundColor: st.color + '18' }]}>
          <Text style={[styles.badgeText, { color: st.color }]}>{st.label}</Text>
        </View>
      </View>
    );
  };

  return (
    <AppScreen scroll={false}>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>LỊCH TRÌNH VẬN ĐỘNG VIÊN</Text>
        <Text style={styles.title}>Lịch thi đấu</Text>
        <View style={styles.accentLine} />
      </View>

      <FlatList
        data={data}
        renderItem={renderItem}
        keyExtractor={(item) => item._id || item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={premiumColors.brand} colors={[premiumColors.brand]} />
        }
        ListEmptyComponent={
          error ? (
            <ErrorState message={error} onRetry={loadData} />
          ) : (
            <View style={styles.emptyWrap}>
              <EmptyState 
                icon="event" 
                title="Chưa có lịch thi đấu" 
                subtitle="Nhận lời mời từ chủ ngựa trong tab Hòm thư để điền tên vào lịch trình." 
              />
            </View>
          )
        }
      />
    </AppScreen>
  );
}

const styles = StyleSheet.create({
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: premiumSpacing[12],
  },
  cardIcon: {
    width: 48,
    height: 48,
    borderRadius: premiumRadius[8],
    backgroundColor: premiumColors.surface2,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: premiumColors.border,
  },
  cardInfo: {
    flex: 1,
  },
  raceTitle: {
    color: premiumColors.text,
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4,
  },
  detailText: {
    color: premiumColors.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  highlight: {
    color: premiumColors.text,
    fontWeight: '600',
  },
  badge: {
    borderWidth: 1,
    borderRadius: premiumRadius[4],
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
});
