import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { AppScreen, Section } from '@/components/ui/premium';
import { premiumColors, premiumSpacing, premiumRadius } from '@/components/ui/premium-tokens';
import { LoadingState, EmptyState, ErrorState, statusLabel, formatDateTime } from '@/components/ui/shared';
import { racesApi } from '@/lib/api-client';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

export default function SpectatorRaces() {
  const router = useRouter();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = () => {
    setLoading(true);
    setError(null);
    racesApi.list({ limit: 50 })
      .then(r => setData((r as any).data || []))
      .catch((err: any) => setError(err.message || 'Lỗi tải lịch đua'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadData(); }, []);

  if (loading) return <LoadingState />;

  return (
    <AppScreen scroll>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.eyebrow}>LỊCH TRÌNH ĐƯỜNG ĐUA</Text>
          <Text style={styles.title}>Danh sách trận đua</Text>
          <View style={styles.accentLine} />
          <Text style={styles.subtitle}>Xem lịch trình và tham gia dự đoán kết quả cuộc đua.</Text>
        </View>

        <Section title={`Lịch trình đua (${data.length})`}>
          {error ? (
            <ErrorState message={error} onRetry={loadData} />
          ) : data.length === 0 ? (
            <EmptyState icon="flag" title="Chưa có trận đua" subtitle="Hệ thống chưa có trận đua nào được tạo." />
          ) : (
            <View style={styles.listContainer}>
              {data.map(r => {
                const st = statusLabel(r.status);
                // MUST PRESERVE EXPLICIT ARRAY
                const isEligible = ['SCHEDULED', 'CHECKING', 'READY'].includes(r.status);

                return (
                  <TouchableOpacity
                    key={r._id || r.id}
                    style={styles.rowItem}
                    onPress={isEligible ? () => router.push(`/(spectator)/race/${r._id}` as any) : undefined}
                    activeOpacity={isEligible ? 0.7 : 1}
                  >
                    <View style={styles.rowAvatar}>
                      <MaterialIcons name="flag" size={20} color={premiumColors.textSecondary} />
                    </View>
                    <View style={styles.rowInfo}>
                      <Text style={styles.rowTitle} numberOfLines={1}>{r.name}</Text>
                      <Text style={styles.rowSubtitle} numberOfLines={1}>
                        {`${formatDateTime(r.startTime)} · ${r.distanceMeters}m`}
                      </Text>
                    </View>

                    {isEligible ? (
                      <View style={[styles.rowBadge, { borderColor: premiumColors.brand + '40', backgroundColor: premiumColors.brand + '18' }]}>
                        <Text style={[styles.rowBadgeText, { color: premiumColors.brand }]}>Dự đoán</Text>
                      </View>
                    ) : (
                      <View style={[styles.rowBadge, { borderColor: st.color + '40', backgroundColor: st.color + '18' }]}>
                        <Text style={[styles.rowBadgeText, { color: st.color }]}>{st.label}</Text>
                      </View>
                    )}
                    
                    {isEligible && (
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
