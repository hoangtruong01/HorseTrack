import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { C, ListItemCard, LoadingState, EmptyState, SectionHeader, statusLabel, formatDateTime } from '@/components/ui/shared';
import { registrationsApi } from '@/lib/api-client';

export default function OwnerRegistrations() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    registrationsApi.list({ limit: 50 })
      .then(r => setData((r as any).data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingState />;

  return (
    <ScrollView style={s.c} contentContainerStyle={s.p}>
      <SectionHeader title={`Hồ sơ đăng ký trận đua (${data.length})`} />
      {data.length === 0 ? (
        <EmptyState icon="assignment" title="Chưa có đăng ký" subtitle="Đăng ký ngựa của bạn vào cuộc đua trực tuyến thông qua cổng Web." />
      ) : (
        data.map(r => {
          const st = statusLabel(r.status);
          const horse = typeof r.horseId === 'object' ? r.horseId?.name : 'Ngựa';
          const race = typeof r.raceId === 'object' ? r.raceId?.name : 'Trận đua';
          return (
            <ListItemCard
              key={r._id}
              title={horse}
              subtitle={`Trận: ${race} · Trạng thái đăng ký`}
              rightText={st.label}
              rightColor={st.color}
              icon="assignment"
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
