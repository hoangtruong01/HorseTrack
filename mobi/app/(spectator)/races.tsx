import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { C, ListItemCard, LoadingState, EmptyState, ErrorState, SectionHeader, statusLabel, formatDateTime } from '@/components/ui/shared';
import { racesApi } from '@/lib/api-client';

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
    <ScrollView style={s.c} contentContainerStyle={s.p}>
      <SectionHeader title={`Lịch trình đua (${data.length})`} />
      {error ? (
        <ErrorState message={error} onRetry={loadData} />
      ) : data.length === 0 ? (
        <EmptyState icon="flag" title="Chưa có trận đua" subtitle="Hệ thống chưa có trận đua nào được tạo." />
      ) : (
        data.map(r => {
          const st = statusLabel(r.status);
          const isEligible = ['SCHEDULED', 'CHECKING', 'READY'].includes(r.status);
          return (
            <ListItemCard
              key={r._id}
              title={r.name}
              subtitle={`${formatDateTime(r.startTime)} · ${r.distanceMeters}m`}
              rightText={isEligible ? 'Dự đoán' : st.label}
              rightColor={isEligible ? C.red : st.color}
              icon="flag"
              onPress={isEligible ? () => router.push(`/(spectator)/race/${r._id}` as any) : undefined}
            />
          );
        })
      )}
    </ScrollView>
  );
}
const s = StyleSheet.create({ c: { flex: 1, backgroundColor: C.bg }, p: { padding: 16, paddingBottom: 32 } });
