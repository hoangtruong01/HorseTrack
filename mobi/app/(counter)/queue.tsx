import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { C, ListItemCard, LoadingState, EmptyState, SectionHeader } from '@/components/ui/shared';
import { walletApi } from '@/lib/api-client';

export default function CounterQueue() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    walletApi.allCashouts({ limit: 50 })
      .then(r => {
        const list = (r as any).data || r || [];
        setData(list.filter((c: any) => c.status === 'PENDING'));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingState />;

  return (
    <ScrollView style={s.c} contentContainerStyle={s.p}>
      <SectionHeader title={`Danh sách hàng đợi chờ chi trả (${data.length})`} />
      {data.length === 0 ? (
        <EmptyState icon="done-all" title="Hàng đợi trống" subtitle="Tất cả các yêu cầu quy đổi điểm thưởng đã được thanh toán xong." />
      ) : (
        data.map(c => {
          const user = typeof c.userId === 'object' ? c.userId?.fullName : 'Khách hàng';
          return (
            <ListItemCard
              key={c._id}
              title={`Mã: ${c.redemptionCode}`}
              subtitle={`Khách: ${user} · Số tiền quy đổi: ${(c.pointsRedeemed * 1000).toLocaleString()} VNĐ`}
              rightText={`${c.pointsRedeemed} Pts`}
              rightColor={C.yellow}
              icon="hourglass-empty"
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
