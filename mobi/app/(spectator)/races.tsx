import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { C, ListItemCard, LoadingState, EmptyState, SectionHeader, statusLabel, formatDateTime } from '@/components/ui/shared';
import { racesApi } from '@/lib/api-client';

export default function SpectatorRaces() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    racesApi.list({ limit: 50 }).then(r => setData((r as any).data || [])).catch(() => {}).finally(() => setLoading(false));
  }, []);
  if (loading) return <LoadingState />;
  return (
    <ScrollView style={s.c} contentContainerStyle={s.p}>
      <SectionHeader title={`Lịch trình đua (${data.length})`} />
      {data.length === 0 ? <EmptyState icon="flag" title="Chưa có trận đua" subtitle="Hệ thống chưa có trận đua nào được tạo." /> :
        data.map(r => { const st = statusLabel(r.status); return <ListItemCard key={r._id} title={r.name} subtitle={`${formatDateTime(r.startTime)} · ${r.distanceMeters}m`} rightText={st.label} rightColor={st.color} icon="flag" />; })}
    </ScrollView>
  );
}
const s = StyleSheet.create({ c: { flex: 1, backgroundColor: C.bg }, p: { padding: 16, paddingBottom: 32 } });
