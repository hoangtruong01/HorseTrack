import React, { useEffect, useState } from 'react';
import { ScrollView, View, Text, StyleSheet } from 'react-native';
import { C, Card, StatCard, SectionHeader, ListItemCard, LoadingState } from '@/components/ui/shared';
import { walletApi } from '@/lib/api-client';

export default function CounterStats() {
  const [data, setData] = useState<any[]>([]);
  const [stats, setStats] = useState({ totalPoints: 0, totalCash: 0, count: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    walletApi.allCashouts({ limit: 50 })
      .then(r => {
        const list = (r as any).data || r || [];
        setData(list);
        const completed = list.filter((c: any) => c.status === 'COMPLETED');
        const totalPoints = completed.reduce((sum: number, c: any) => sum + c.pointsRedeemed, 0);
        setStats({
          count: completed.length,
          totalPoints,
          totalCash: totalPoints * 1000,
        });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingState />;

  return (
    <ScrollView style={s.c} contentContainerStyle={s.p}>
      <Card style={s.summaryCard}>
        <Text style={s.sub}>BÁO CÁO DOANH THU QUẦY</Text>
        <Text style={s.title}>Tổng Kết Giao Dịch Chi Trả</Text>
      </Card>

      <View style={s.statsRow}>
        <StatCard label="Số lượt đã đổi" value={`${stats.count}`} icon="done-all" color={C.red} />
        <StatCard label="Điểm đã đổi" value={`${stats.totalPoints.toLocaleString()} Pts`} icon="toll" color={C.yellow} />
        <StatCard label="Tiền mặt chi trả" value={`${stats.totalCash.toLocaleString()} đ`} icon="monetization-on" color={C.teal} />
      </View>

      <SectionHeader title="Nhật ký chi trả thành công" />
      {data.filter(c => c.status === 'COMPLETED').length === 0 ? (
        <Text style={s.empty}>Chưa ghi nhận giao dịch chi trả nào.</Text>
      ) : (
        data.filter(c => c.status === 'COMPLETED').map(c => {
          const user = typeof c.userId === 'object' ? c.userId?.fullName : 'Khách hàng';
          return (
            <ListItemCard
              key={c._id}
              title={c.redemptionCode}
              subtitle={`Khách: ${user} · Chi trả: ${(c.pointsRedeemed * 1000).toLocaleString()}đ`}
              rightText="THÀNH CÔNG"
              rightColor={C.teal}
              icon="check-circle"
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
  summaryCard: { backgroundColor: C.card },
  sub: { color: C.red, fontSize: 10, fontWeight: '800', letterSpacing: 1 },
  title: { color: C.white, fontSize: 20, fontWeight: '900', marginTop: 4 },
  statsRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  empty: { color: C.textMuted, fontSize: 12, textAlign: 'center', marginTop: 24 },
});
