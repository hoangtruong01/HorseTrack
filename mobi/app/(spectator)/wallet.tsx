import React, { useCallback, useEffect, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text } from 'react-native';
import { C, Card, EmptyState, ErrorState, ListItemCard, LoadingState, SectionHeader, formatDateTime } from '@/components/ui/shared';
import { rewardPointLedgerApi } from '@/lib/api-client';

export default function SpectatorWallet() {
  const [balance, setBalance] = useState(0);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setError(null);
    try {
      const [balanceRes, historyRes] = await Promise.all([
        rewardPointLedgerApi.myBalance(),
        rewardPointLedgerApi.myHistory({ limit: 50 }),
      ]);
      setBalance(balanceRes.balance ?? 0);
      setHistory(historyRes.data || []);
    } catch (err: any) {
      setError(err.message || 'Không thể tải ví điểm. Vui lòng thử lại.');
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
      <Card>
        <Text style={s.label}>DIEM HIEN TAI</Text>
        <Text style={s.balance}>{balance.toLocaleString()} <Text style={s.unit}>Pts</Text></Text>
        <Text style={s.hint}>Du doan dung + diem, sai tru diem theo cau hinh he thong.</Text>
      </Card>

      <SectionHeader title={`Lich su giao dich (${history.length})`} />
      {error ? (
        <ErrorState message={error} onRetry={loadData} />
      ) : history.length === 0 ? (
        <EmptyState icon="history" title="Chua co giao dich" subtitle="Lich su diem thuong se hien thi tai day." />
      ) : (
        history.map((item) => {
          const delta = item.pointsDelta ?? 0;
          return (
            <ListItemCard
              key={item._id}
              title={item.note || 'Giao dich diem thuong'}
              subtitle={`${formatDateTime(item.createdAt)} · So du sau: ${(item.balanceAfter ?? 0).toLocaleString()} Pts`}
              rightText={`${delta > 0 ? '+' : ''}${delta.toLocaleString()} Pts`}
              rightColor={delta >= 0 ? C.tealLight : '#EF4444'}
              icon="swap-vert"
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
  label: { color: C.textSecondary, fontSize: 10, fontWeight: '800', letterSpacing: 1.5 },
  balance: { color: C.white, fontSize: 36, fontWeight: '900', marginTop: 8 },
  unit: { fontSize: 18, color: C.textSecondary },
  hint: { color: C.textMuted, fontSize: 11, marginTop: 8 },
});
