import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { C, ListItemCard, LoadingState, EmptyState, SectionHeader, statusLabel, formatDateTime } from '@/components/ui/shared';
import { jockeyInvitationsApi } from '@/lib/api-client';

export default function JockeySchedule() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    jockeyInvitationsApi.list({ limit: 50 })
      .then(r => {
        const list = (r as any).data || [];
        // Show only accepted invitations (which represent scheduled runs)
        setData(list.filter((i: any) => i.status === 'accepted'));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingState />;

  return (
    <ScrollView style={s.c} contentContainerStyle={s.p}>
      <SectionHeader title={`Lịch thi đấu đã xác nhận (${data.length})`} />
      {data.length === 0 ? (
        <EmptyState icon="event" title="Chưa có lịch thi đấu" subtitle="Nhận lời mời từ chủ ngựa trong tab Hòm thư để điền tên vào lịch trình." />
      ) : (
        data.map(i => {
          const st = statusLabel(i.status);
          const raceName = typeof i.raceId === 'object' ? i.raceId?.name : 'Trận đua';
          const horseName = typeof i.horseId === 'object' ? i.horseId?.name : 'Ngựa';
          const startTime = typeof i.raceId === 'object' ? i.raceId?.startTime : undefined;
          return (
            <ListItemCard
              key={i._id}
              title={raceName}
              subtitle={`Chiến mã: ${horseName} · Thời gian: ${formatDateTime(startTime)}`}
              rightText={st.label}
              rightColor={st.color}
              icon="event"
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
