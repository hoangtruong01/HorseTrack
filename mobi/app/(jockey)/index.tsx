import React, { useEffect, useState, useCallback } from 'react';
import { ScrollView, View, Text, StyleSheet } from 'react-native';
import { C, StatCard, Card, SectionHeader, ListItemCard, LoadingState, ErrorState, statusLabel } from '@/components/ui/shared';
import { jockeyInvitationsApi, rewardPointLedgerApi } from '@/lib/api-client';

export default function JockeyHome() {
  const [balance, setBalance] = useState(0);
  const [invitesCount, setInvitesCount] = useState(0);
  const [invitations, setInvitations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setError(null);
    try {
      const [invRes, balRes] = await Promise.all([
        jockeyInvitationsApi.listReceived({ limit: 10 }),
        rewardPointLedgerApi.myBalance(),
      ]);
      const list = (invRes as any).data || [];
      setInvitations(list);
      setInvitesCount(list.filter((i: any) => i.status === 'PENDING').length);
      setBalance((balRes as any).balance || 0);
    } catch (err: any) {
      setError(err.message || 'Không thể tải dữ liệu dashboard.');
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  if (loading) return <LoadingState />;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Card>
        <Text style={styles.welcomeLabel}>JOCKEY PORTAL</Text>
        <Text style={styles.welcomeTitle}>Nài Ngựa Chuyên Nghiệp</Text>
        <Text style={styles.welcomeSub}>Nhận lời mời từ chủ ngựa, quản lý lịch thi đấu và xem báo cáo kết quả thi đấu của bạn.</Text>
      </Card>

      <View style={styles.statsRow}>
        <StatCard label="Lời mời mới" value={`${invitesCount}`} icon="mail" color={C.red} />
        <StatCard label="Ví tích lũy" value={`${balance.toLocaleString()} Pts`} icon="account-balance-wallet" color={C.teal} />
      </View>

      <SectionHeader title="Lời mời gần đây" />
      {error ? (
        <ErrorState message={error} onRetry={loadData} />
      ) : invitations.length === 0 ? (
        <Text style={styles.empty}>Chưa có lời mời nào gần đây.</Text>
      ) : (
        invitations.slice(0, 3).map(i => {
          const s = statusLabel(i.status);
          const owner = typeof i.ownerId === 'object' ? i.ownerId?.fullName : 'Chủ ngựa';
          const horse = typeof i.horseId === 'object' ? i.horseId?.name : 'Ngựa';
          return <ListItemCard key={i._id} title={`Mời nài ngựa: ${horse}`} subtitle={`Từ: ${owner} · Thưởng: ${i.prizeSharePercentage}%`} rightText={s.label} rightColor={s.color} icon="mail" />;
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
