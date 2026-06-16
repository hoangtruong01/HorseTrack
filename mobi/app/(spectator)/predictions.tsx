import React, { useCallback, useEffect, useState } from 'react';
import { ScrollView, StyleSheet, RefreshControl, View, TouchableOpacity, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { C, ListItemCard, LoadingState, EmptyState, ErrorState, SectionHeader, statusLabel, formatDateTime } from '@/components/ui/shared';
import { predictionsApi } from '@/lib/api-client';

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
        <View style={{ paddingVertical: 20 }}>
          <EmptyState icon="psychology" title="Chưa có dự đoán" subtitle="Bạn chưa đặt dự đoán cho trận đua nào. Hãy vào Lịch đua để bắt đầu!" />
          <TouchableOpacity 
            style={{ backgroundColor: C.red, padding: 12, borderRadius: 8, alignItems: 'center', marginTop: 16, marginHorizontal: 32 }}
            onPress={() => router.push('/(spectator)/races' as any)}
          >
            <Text style={{ color: C.white, fontWeight: '800', fontSize: 13 }}>Tạo dự đoán đầu tiên</Text>
          </TouchableOpacity>
        </View>
      ) : (
        data.map(p => {
          const st = statusLabel(p.status);
          const horse = typeof p.predictedHorseId === 'object' ? p.predictedHorseId?.name : 'Ngựa';
          const race = typeof p.raceId === 'object' ? p.raceId?.name : 'Trận đua';
          const rId = typeof p.raceId === 'object' ? p.raceId?._id : p.raceId;
          return (
            <ListItemCard 
              key={p._id} 
              title={`Dự đoán: ${horse}`} 
              subtitle={`Trận: ${race} · ${formatDateTime(p.createdAt)}`} 
              rightText={st.label} 
              rightColor={st.color} 
              icon="psychology" 
              onPress={rId ? () => router.push(`/(spectator)/race/${rId}` as any) : undefined}
            />
          );
        })
      )}
    </ScrollView>
  );
}
const s = StyleSheet.create({ c: { flex: 1, backgroundColor: C.bg }, p: { padding: 16, paddingBottom: 32 } });
