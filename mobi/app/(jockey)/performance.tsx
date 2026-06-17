import React, { useEffect, useState } from 'react';
import { ScrollView, View, Text, StyleSheet } from 'react-native';
import { C, Card, StatCard, SectionHeader, LoadingState, ErrorState, EmptyState } from '@/components/ui/shared';
import { jockeyInvitationsApi } from '@/lib/api-client';

export default function JockeyPerformance() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = () => {
    setLoading(true);
    setError(null);
    jockeyInvitationsApi.listReceived({ limit: 50 })
      .then(r => {
        const list = (r as any).data || [];
        const completed = list.filter((i: any) => i.status === 'ACCEPTED'); // Only accepted races
        setData(completed);
      })
      .catch((err: any) => setError(err.message || 'Lỗi tải thành tích'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadData(); }, []);

  if (loading) return <LoadingState />;

  return (
    <ScrollView style={s.c} contentContainerStyle={s.p}>
      <Card style={s.summaryCard}>
        <Text style={s.sub}>BÁO CÁO HIỆU SUẤT</Text>
        <Text style={s.title}>Thành Tích Thi Đấu</Text>
      </Card>

      {error ? (
        <ErrorState message={error} onRetry={loadData} />
      ) : (
        <>
          <View style={s.statsRow}>
            <StatCard label="Số trận tham gia" value={`${data.length}`} icon="directions-run" color={C.teal} />
          </View>

          <SectionHeader title="Lịch sử thi đấu" />
          <EmptyState icon="emoji-events" title="Chưa có dữ liệu" subtitle="Chưa có dữ liệu thành tích chính thức." />
        </>
      )}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  c: { flex: 1, backgroundColor: C.bg },
  p: { padding: 16, paddingBottom: 32 },
  summaryCard: { backgroundColor: C.card },
  sub: { color: C.red, fontSize: 10, fontWeight: '800', letterSpacing: 1 },
  title: { color: C.white, fontSize: 20, fontWeight: '900', marginTop: 4 },
  statsRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  empty: { color: C.textMuted, fontSize: 12, textAlign: 'center', marginTop: 24 },
});
