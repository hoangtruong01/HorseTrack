import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { C, ListItemCard, LoadingState, EmptyState, SectionHeader, statusLabel } from '@/components/ui/shared';
import { horsesApi } from '@/lib/api-client';

export default function OwnerHorses() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    horsesApi.list({ limit: 50 })
      .then(r => setData((r as any).data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingState />;

  return (
    <ScrollView style={s.c} contentContainerStyle={s.p}>
      <SectionHeader title={`Danh sách chiến mã (${data.length})`} />
      {data.length === 0 ? (
        <EmptyState icon="pets" title="Chưa có ngựa" subtitle="Vui lòng thêm ngựa của bạn trên cổng Web để bắt đầu ghi danh đua." />
      ) : (
        data.map(h => {
          const st = statusLabel(h.status);
          return (
            <ListItemCard
              key={h._id}
              title={h.name}
              subtitle={`Giống: ${h.breed || 'Chưa rõ'} · Tuổi: ${h.age || 'N/A'} · Sức khỏe: ${h.healthStatus || 'N/A'}`}
              rightText={st.label}
              rightColor={st.color}
              icon="pets"
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
