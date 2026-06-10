import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { C, ListItemCard, LoadingState, EmptyState, SectionHeader, statusLabel, formatDateTime } from '@/components/ui/shared';
import { predictionsApi } from '@/lib/api-client';

export default function SpectatorPredictions() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    predictionsApi.listMyPredictions({ limit: 50 }).then(r => setData((r as any).data || [])).catch(() => {}).finally(() => setLoading(false));
  }, []);
  if (loading) return <LoadingState />;
  return (
    <ScrollView style={s.c} contentContainerStyle={s.p}>
      <SectionHeader title={`Lịch sử dự đoán (${data.length})`} />
      {data.length === 0 ? <EmptyState icon="psychology" title="Chưa có dự đoán" subtitle="Bạn chưa đặt dự đoán cho trận đua nào. Hãy vào Lịch đua để bắt đầu!" /> :
        data.map(p => {
          const st = statusLabel(p.status);
          const horse = typeof p.predictedHorseId === 'object' ? p.predictedHorseId?.name : 'Ngựa';
          const race = typeof p.raceId === 'object' ? p.raceId?.name : 'Trận đua';
          return <ListItemCard key={p._id} title={`Dự đoán: ${horse}`} subtitle={`Trận: ${race} · ${formatDateTime(p.createdAt)}`} rightText={st.label} rightColor={st.color} icon="psychology" />;
        })}
    </ScrollView>
  );
}
const s = StyleSheet.create({ c: { flex: 1, backgroundColor: C.bg }, p: { padding: 16, paddingBottom: 32 } });
