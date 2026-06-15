import React, { useCallback, useEffect, useState } from 'react';
import { ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { C, ListItemCard, LoadingState, EmptyState, ErrorState, SectionHeader, statusLabel, formatDateTime } from '@/components/ui/shared';
import { jockeyInvitationsApi } from '@/lib/api-client';

export default function JockeySchedule() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setError(null);
    try {
      const r = await jockeyInvitationsApi.listReceived({ limit: 50 });
      const list = (r as any).data || [];
      setData(list.filter((i: any) => i.status === 'ACCEPTED'));
    } catch (err: any) {
      setError(err.message || 'Khong the tai lich trinh.');
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
      <SectionHeader title={`Lịch thi đấu đã xác nhận (${data.length})`} />
      {error ? (
        <ErrorState message={error} onRetry={loadData} />
      ) : data.length === 0 ? (
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
