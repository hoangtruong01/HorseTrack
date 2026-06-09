import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { C, ListItemCard, LoadingState, EmptyState, SectionHeader, statusLabel } from '@/components/ui/shared';
import { tournamentsApi } from '@/lib/api-client';

export default function SpectatorTournaments() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    tournamentsApi.list({ limit: 50 }).then(r => setData((r as any).data || [])).catch(() => {}).finally(() => setLoading(false));
  }, []);
  if (loading) return <LoadingState />;
  return (
    <ScrollView style={s.c} contentContainerStyle={s.p}>
      <SectionHeader title={`Tất cả giải đấu (${data.length})`} />
      {data.length === 0 ? <EmptyState icon="emoji-events" title="Chưa có giải đấu" subtitle="Hiện tại chưa có giải đấu nào trong hệ thống." /> :
        data.map(t => { const st = statusLabel(t.status); return <ListItemCard key={t._id} title={t.name} subtitle={`${t.location || ''} · Giải thưởng: ${t.prizePool?.toLocaleString() || 0} đ`} rightText={st.label} rightColor={st.color} icon="emoji-events" />; })}
    </ScrollView>
  );
}
const s = StyleSheet.create({ c: { flex: 1, backgroundColor: C.bg }, p: { padding: 16, paddingBottom: 32 } });
