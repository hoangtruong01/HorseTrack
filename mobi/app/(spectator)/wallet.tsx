import React, { useEffect, useState } from 'react';
import { ScrollView, Text, StyleSheet } from 'react-native';
import { C, Card, ListItemCard, LoadingState, SectionHeader, formatDateTime } from '@/components/ui/shared';
import { rewardPointLedgerApi } from '@/lib/api-client';

export default function SpectatorWallet() {
  const [balance, setBalance] = useState(0);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    (async () => {
      try {
        const [b, h] = await Promise.all([
          rewardPointLedgerApi.myBalance().catch(() => ({ balance: 0 })),
          rewardPointLedgerApi.myHistory({ limit: 20 }).catch(() => ({ data: [] })),
        ]);
        setBalance((b as any).balance || 0);
        setHistory((h as any).data || []);
      } catch {} finally { setLoading(false); }
    })();
  }, []);
  const withdrawals = history.filter(
    h => h.sourceType === 'redemption' ||
         h.note?.toLowerCase().includes('quy đổi') ||
         h.note?.toLowerCase().includes('rút') ||
         h.note?.toLowerCase().includes('redemption')
  );

  if (loading) return <LoadingState />;
  return (
    <ScrollView style={s.c} contentContainerStyle={s.p}>
      <Card>
        <Text style={s.label}>ĐIỂM HIỆN TẠI</Text>
        <Text style={s.balance}>{balance.toLocaleString()} <Text style={s.unit}>Pts</Text></Text>
        <Text style={s.hint}>Dự đoán đúng +1đ · Sai -1đ · Không thể âm</Text>
      </Card>
      <SectionHeader title="Lịch sử rút" />
      {withdrawals.length === 0 ? <Text style={s.empty}>Chưa có lịch sử rút điểm nào.</Text> :
        withdrawals.map(h => (
          <ListItemCard key={h._id}
            title={h.note || 'Rút điểm thưởng'}
            subtitle={formatDateTime(h.createdAt)}
            rightText={`${h.pointsDelta > 0 ? '+' : ''}${h.pointsDelta}`}
            rightColor={h.pointsDelta > 0 ? '#34D399' : '#EF4444'}
            icon="swap-vert"
          />
        ))}
    </ScrollView>
  );
}
const s = StyleSheet.create({
  c: { flex: 1, backgroundColor: C.bg }, p: { padding: 16, paddingBottom: 32 },
  label: { color: C.textSecondary, fontSize: 10, fontWeight: '800', letterSpacing: 1.5 },
  balance: { color: C.white, fontSize: 36, fontWeight: '900', marginTop: 8 },
  unit: { fontSize: 18, color: C.textSecondary },
  hint: { color: C.textMuted, fontSize: 11, marginTop: 8 },
  empty: { color: C.textMuted, textAlign: 'center', marginTop: 24, fontSize: 12 },
});
