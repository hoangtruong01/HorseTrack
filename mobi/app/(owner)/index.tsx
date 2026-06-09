import React, { useEffect, useState } from 'react';
import { ScrollView, View, Text, StyleSheet } from 'react-native';
import { C, StatCard, Card, SectionHeader, ListItemCard, LoadingState, statusLabel } from '@/components/ui/shared';
import { horsesApi, registrationsApi, walletApi } from '@/lib/api-client';

export default function OwnerHome() {
  const [balance, setBalance] = useState(0);
  const [horsesCount, setHorsesCount] = useState(0);
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [horsesRes, regRes, walletRes] = await Promise.all([
          horsesApi.list({ limit: 1 }).catch(() => ({ meta: { total: 0 } })),
          registrationsApi.list({ limit: 5 }).catch(() => ({ data: [] })),
          walletApi.myHistory({ limit: 1 }).catch(() => ({ balance: 0 })),
        ]);
        setHorsesCount((horsesRes as any).meta?.total || 0);
        setRegistrations((regRes as any).data || []);
        setBalance((walletRes as any).balance || 0);
      } catch {} finally { setLoading(false); }
    })();
  }, []);

  if (loading) return <LoadingState />;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Card>
        <Text style={styles.welcomeLabel}>OWNER DASHBOARD</Text>
        <Text style={styles.welcomeTitle}>Quản Lý Chuồng Ngựa</Text>
        <Text style={styles.welcomeSub}>Xem chiến mã, đăng ký tham gia các trận đua và mời nài ngựa (Jockey) chuyên nghiệp.</Text>
      </Card>

      <View style={styles.statsRow}>
        <StatCard label="Tổng số ngựa" value={`${horsesCount}`} icon="pets" color={C.red} />
        <StatCard label="Ví thưởng" value={`${balance.toLocaleString()}đ`} icon="account-balance-wallet" color={C.teal} />
      </View>

      <SectionHeader title="Đăng ký đua gần đây" />
      {registrations.length === 0 ? (
        <Text style={styles.empty}>Chưa có lượt đăng ký đua nào.</Text>
      ) : (
        registrations.slice(0, 3).map(r => {
          const s = statusLabel(r.status);
          const horseName = typeof r.horseId === 'object' ? r.horseId?.name : 'Ngựa';
          const raceName = typeof r.raceId === 'object' ? r.raceId?.name : 'Trận đua';
          return <ListItemCard key={r._id} title={horseName} subtitle={`Đăng ký vào: ${raceName}`} rightText={s.label} rightColor={s.color} icon="assignment" />;
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
