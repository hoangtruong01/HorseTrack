import React, { useCallback, useEffect, useState } from 'react';
import { ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { C, ListItemCard, LoadingState, EmptyState, ErrorState, SectionHeader, statusLabel, formatDateTime } from '@/components/ui/shared';
import { predictionsApi } from '@/lib/api-client';

export default function SpectatorPredictions() {
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
      setError(err.message || 'Khong the tai du lieu du doan. Vui long thu lai.');
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

  if (loading) return <LoadingState />;

  return (
    <ScrollView 
      style={s.c} 
      contentContainerStyle={s.p}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.red} colors={[C.red]} />}
    >
      <SectionHeader title={`Lịch sử dự đoán (${data.length})`} />
      {error ? (
        <ErrorState message={error} onRetry={loadData} />
      ) : data.length === 0 ? (
        <EmptyState icon="psychology" title="Chưa có dự đoán" subtitle="Bạn chưa đặt dự đoán cho trận đua nào. Hãy vào Lịch đua để bắt đầu!" />
      ) : (
        data.map(p => {
          const st = statusLabel(p.status);
          const horse = typeof p.predictedHorseId === 'object' ? p.predictedHorseId?.name : 'Ngựa';
          const race = typeof p.raceId === 'object' ? p.raceId?.name : 'Trận đua';
          return (
            <ListItemCard 
              key={p._id} 
              title={`Dự đoán: ${horse}`} 
              subtitle={`Trận: ${race} · ${formatDateTime(p.createdAt)}`} 
              rightText={st.label} 
              rightColor={st.color} 
              icon="psychology" 
            />
          );
        })
      )}
    </ScrollView>
  );
}
const s = StyleSheet.create({ c: { flex: 1, backgroundColor: C.bg }, p: { padding: 16, paddingBottom: 32 } });
