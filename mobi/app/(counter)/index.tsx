import React, { useEffect, useState } from 'react';
import { ScrollView, View, Text, StyleSheet } from 'react-native';
import { C, StatCard, Card, SectionHeader, ListItemCard, LoadingState, statusLabel } from '@/components/ui/shared';
import { walletApi } from '@/lib/api-client';

export default function CounterHome() {
  const [cashouts, setCashouts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    walletApi.allCashouts({ limit: 20 })
      .then(r => setCashouts((r as any).data || r || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingState />;

  const pendingList = cashouts.filter(c => c.status === 'PENDING');
  const paidCount = cashouts.filter(c => c.status === 'COMPLETED').length;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Card>
        <Text style={styles.welcomeLabel}>COUNTER DESK</Text>
        <Text style={styles.welcomeTitle}>Quầy Giao Dịch & Đổi Thưởng</Text>
        <Text style={styles.welcomeSub}>Hỗ trợ khách hàng nạp điểm trực tiếp bằng tiền mặt và kiểm tra, đối soát chi trả tiền mặt dựa trên mã redemption.</Text>
      </Card>

      <View style={styles.statsRow}>
        <StatCard label="Hàng đợi chờ" value={`${pendingList.length}`} icon="hourglass-empty" color={C.red} />
        <StatCard label="Đã hoàn thành" value={`${paidCount}`} icon="done-all" color={C.teal} />
      </View>

      <SectionHeader title="Giao dịch mới nhất" />
      {cashouts.length === 0 ? (
        <Text style={styles.empty}>Chưa có giao dịch đổi thưởng nào.</Text>
      ) : (
        cashouts.slice(0, 3).map(c => {
          const user = typeof c.userId === 'object' ? c.userId?.fullName : 'Khách hàng';
          return <ListItemCard key={c._id} title={c.redemptionCode} subtitle={`Khách: ${user} · Thưởng: ${c.pointsRedeemed} Pts`} rightText={c.status} rightColor={c.status === 'PENDING' ? C.yellow : C.teal} icon="monetization-on" />;
        })
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  content: { padding: 16, paddingBottom: 32 },
  statsRow: { flexDirection: 'row', gap: 8 },
  welcomeLabel: { color: C.red, fontSize: 10, fontWeight: '800', letterSpacing: 1.5, marginBottom: 8 },
  welcomeTitle: { color: C.white, fontSize: 22, fontWeight: '900' },
  welcomeSub: { color: C.textSecondary, fontSize: 12, marginTop: 6, lineHeight: 18 },
  empty: { color: C.textMuted, fontSize: 12, textAlign: 'center', marginVertical: 16 },
});
