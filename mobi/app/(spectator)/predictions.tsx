import React, { useCallback, useEffect, useState } from 'react';
import { StyleSheet, View, TouchableOpacity, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { AppScreen, Section } from '@/components/ui/premium';
import { premiumColors, premiumSpacing, premiumRadius } from '@/components/ui/premium-tokens';
import { LoadingState, EmptyState, ErrorState, statusLabel, formatDateTime } from '@/components/ui/shared';
import { predictionsApi } from '@/lib/api-client';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

export default function SpectatorPredictions() {
  const router = useRouter();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setError(null);
    try {
      const res = await predictionsApi.listMyPredictions({ limit: 50 });
      setData((res as any).data || []);
    } catch (err: any) {
      setError(err.message || 'Không thể tải dữ liệu dự đoán. Vui lòng thử lại.');
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

  return (
    <AppScreen scroll refreshing={refreshing} onRefresh={onRefresh}>
      <View style={styles.content}>
        
        <View style={styles.header}>
          <Text style={styles.eyebrow}>HOẠT ĐỘNG KHÁN GIẢ</Text>
          <Text style={styles.title}>Lịch sử dự đoán</Text>
          <View style={styles.accentLine} />
          <Text style={styles.subtitle}>Quản lý và theo dõi kết quả các dự đoán bạn đã tham gia.</Text>
        </View>

        <Section title={`Lịch sử dự đoán (${data.length})`}>
          {error ? (
            <ErrorState message={error} onRetry={loadData} />
          ) : data.length === 0 ? (
            <View style={styles.emptyContainer}>
              <EmptyState icon="history" title="Chưa có dự đoán" subtitle="Bạn chưa đặt dự đoán cho trận đua nào. Hãy vào Giải đấu để bắt đầu!" />
              <TouchableOpacity 
                style={styles.emptyCta}
                onPress={() => router.push('/(spectator)/tournaments' as any)}
                activeOpacity={0.8}
              >
                <Text style={styles.emptyCtaText}>Tạo dự đoán đầu tiên</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.listContainer}>
              {data.map(p => {
                const st = statusLabel(p.status);
                const horse = typeof p.predictedHorseId === 'object' ? p.predictedHorseId?.name : 'Ngựa';
                const race = typeof p.raceId === 'object' ? p.raceId?.name : 'Trận đua';
                const rId = typeof p.raceId === 'object' ? p.raceId?._id : p.raceId;
                
                return (
                  <TouchableOpacity
                    key={p._id || p.id}
                    style={styles.rowItem}
                    onPress={rId ? () => router.push(`/(spectator)/race/${rId}` as any) : undefined}
                    activeOpacity={rId ? 0.7 : 1}
                  >
                    <View style={styles.rowAvatar}>
                      <MaterialIcons name="psychology" size={20} color={premiumColors.textSecondary} />
                    </View>
                    <View style={styles.rowInfo}>
                      <Text style={styles.rowTitle} numberOfLines={1}>{horse}</Text>
                      <Text style={styles.rowSubtitle} numberOfLines={1}>
                        {`Trận: ${race} · ${formatDateTime(p.createdAt)}`}
                      </Text>
                    </View>
                    <View style={[styles.rowBadge, { borderColor: st.color + '40', backgroundColor: st.color + '18' }]}>
                      <Text style={[styles.rowBadgeText, { color: st.color }]}>{st.label}</Text>
                    </View>
                    {rId && (
                      <MaterialIcons name="chevron-right" size={16} color={premiumColors.textMuted} />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </Section>
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: premiumSpacing[16],
    paddingTop: premiumSpacing[24],
    paddingBottom: premiumSpacing[48],
  },
  header: {
    marginBottom: premiumSpacing[32],
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
    marginBottom: premiumSpacing[12],
  },
  subtitle: {
    fontSize: 14,
    color: premiumColors.textSecondary,
    lineHeight: 20,
  },
  emptyContainer: {
    paddingVertical: premiumSpacing[20],
  },
  emptyCta: {
    backgroundColor: premiumColors.brand,
    padding: premiumSpacing[16],
    borderRadius: premiumRadius[8],
    alignItems: 'center',
    marginTop: premiumSpacing[16],
    marginHorizontal: premiumSpacing[32],
  },
  emptyCtaText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 13,
  },
  listContainer: {
    backgroundColor: premiumColors.surface,
    borderRadius: premiumRadius[12],
    borderWidth: 1,
    borderColor: premiumColors.border,
    overflow: 'hidden',
  },
  rowItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: premiumSpacing[16],
    borderBottomWidth: 1,
    borderBottomColor: premiumColors.border,
    gap: premiumSpacing[12],
  },
  rowAvatar: {
    width: 44,
    height: 44,
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
    marginBottom: 4,
  },
  rowSubtitle: {
    fontSize: 12,
    color: premiumColors.textMuted,
  },
  rowBadge: {
    borderWidth: 1,
    borderRadius: premiumRadius[4],
    paddingHorizontal: 8,
    paddingVertical: 4,
    flexShrink: 0,
    marginLeft: premiumSpacing[8],
  },
  rowBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
});
