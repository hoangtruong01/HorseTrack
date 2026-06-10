import React, { useEffect, useState } from 'react';
import { ScrollView, View, Text, StyleSheet } from 'react-native';
import { C, Card, StatCard, ListItemCard, LoadingState, SectionHeader } from '@/components/ui/shared';
import { horsesApi } from '@/lib/api-client';

export default function AdminRankings() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    horsesApi.list({ limit: 50 })
      .then(r => {
        const list = (r as any).data || [];
        // Sort horses by baseSpeed desc as mock rank
        const sorted = [...list].sort((a, b) => (b.baseSpeed || 0) - (a.baseSpeed || 0));
        setData(sorted);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingState />;

  return (
    <ScrollView style={s.c} contentContainerStyle={s.p}>
      <SectionHeader title="Bảng xếp hạng chiến mã (Tốc độ tối đa)" />
      {data.length === 0 ? (
        <Text style={s.empty}>Chưa có chiến mã nào để xếp hạng.</Text>
      ) : (
        data.map((h, index) => {
          const isTop3 = index < 3;
          const medalColor = index === 0 ? '#F59E0B' : index === 1 ? '#9CA3AF' : index === 2 ? '#D97706' : C.textMuted;
          return (
            <ListItemCard
              key={h._id}
              title={`${index + 1}. ${h.name.toUpperCase()}`}
              subtitle={`Giống: ${h.breed || 'Chưa rõ'} · Thể lực: ${h.staminaScore || 70}/100`}
              rightText={`${h.baseSpeed || 50} km/h`}
              rightColor={medalColor}
              icon="stars"
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
  empty: { color: C.textMuted, fontSize: 12, textAlign: 'center', marginTop: 24 },
});
