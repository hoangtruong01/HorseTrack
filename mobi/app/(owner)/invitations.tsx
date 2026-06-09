import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { C, ListItemCard, LoadingState, EmptyState, SectionHeader, statusLabel, formatDateTime } from '@/components/ui/shared';
import { jockeyInvitationsApi } from '@/lib/api-client';

export default function OwnerInvitations() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    jockeyInvitationsApi.list({ limit: 50 })
      .then(r => setData((r as any).data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingState />;

  return (
    <ScrollView style={s.c} contentContainerStyle={s.p}>
      <SectionHeader title={`Danh sách mời Jockey (${data.length})`} />
      {data.length === 0 ? (
        <EmptyState icon="person-add" title="Chưa có lời mời" subtitle="Chưa gửi lời mời nài ngựa nào." />
      ) : (
        data.map(i => {
          const st = statusLabel(i.status);
          const jockeyName = typeof i.jockeyUserId === 'object' ? i.jockeyUserId?.fullName : 'Jockey';
          const horseName = typeof i.horseId === 'object' ? i.horseId?.name : 'Ngựa';
          return (
            <ListItemCard
              key={i._id}
              title={`Mời Jockey: ${jockeyName}`}
              subtitle={`Ngựa: ${horseName} · Tỷ lệ chia thưởng: ${i.prizeSharePercentage}%`}
              rightText={st.label}
              rightColor={st.color}
              icon="person-add"
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
