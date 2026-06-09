import React, { useEffect, useState } from 'react';
import { ScrollView, View, Text, StyleSheet } from 'react-native';
import { C, Card, StatCard, ListItemCard, LoadingState, SectionHeader, PrimaryButton, formatDateTime } from '@/components/ui/shared';
import { rewardPointLedgerApi, walletApi } from '@/lib/api-client';

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
  if (loading) return <LoadingState />;
  return (
    <ScrollView style={s.c} contentContainerStyle={s.p}>
      <Card>
        <Text style={s.label}>SỐ DƯ VÍ ĐIỂM</Text>
        <Text style={s.balance}>{balance.toLocaleString()} <Text style={s.unit}>Pts</Text></Text>
        <Text style={s.hint}>Dự đoán đúng +1đ · Sai -1đ · Không thể âm</Text>
      </Card>
      <SectionHeader title="Lịch sử giao dịch" />
      {history.length === 0 ? <Text style={s.empty}>Chưa có giao dịch nào.</Text> :
        history.map(h => (
          <ListItemCard key={h._id}
            title={h.note || 'Giao dịch'}
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
