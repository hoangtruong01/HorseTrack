import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { C, ListItemCard, LoadingState, EmptyState, SectionHeader, statusLabel, formatDateTime } from '@/components/ui/shared';
import { racesApi } from '@/lib/api-client';

export default function AdminRaces() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    racesApi.list({ limit: 50 })
      .then(r => setData((r as any).data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingState />;

  return (
    <ScrollView style={s.c} contentContainerStyle={s.p}>
      <SectionHeader title={`Giám sát trận đua (${data.length})`} />
      {data.length === 0 ? (
        <EmptyState icon="flag" title="Chưa có trận đua" subtitle="Chưa có trận đua nào trong hệ thống." />
      ) : (
        data.map(r => {
          const st = statusLabel(r.status);
          return (
            <ListItemCard
              key={r._id}
              title={r.name}
              subtitle={`${formatDateTime(r.startTime)} · Cự ly: ${r.distanceMeters}m`}
              rightText={st.label}
              rightColor={st.color}
              icon="flag"
            />
          );
        })
      )}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  c: { flex: 1, backgroundColor: C.bg },
  p: { padding: 16, paddingBottom: 32 },
});
