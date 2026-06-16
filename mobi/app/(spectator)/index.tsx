import React, { useEffect, useState, useCallback } from 'react';
import { ScrollView, View, Text, StyleSheet } from 'react-native';
import { C, StatCard, Card, SectionHeader, ListItemCard, LoadingState, ErrorState, statusLabel, formatDateTime } from '@/components/ui/shared';
import { tournamentsApi, racesApi, rewardPointLedgerApi } from '@/lib/api-client';

export default function SpectatorHome() {
  const [balance, setBalance] = useState(0);
  const [tournaments, setTournaments] = useState<any[]>([]);
  const [races, setRaces] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [balRes, tRes, rRes] = await Promise.all([
        rewardPointLedgerApi.myBalance(),
        tournamentsApi.list({ limit: 5 }),
        racesApi.list({ limit: 5 }),
      ]);
      setBalance((balRes as any).balance || 0);
      setTournaments((tRes as any).data || []);
      setRaces((rRes as any).data || []);
    } catch (err: any) {
      setError(err.message || 'Lỗi tải dữ liệu');
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  if (loading) return <LoadingState />;

  if (error) {
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <ErrorState message={error} onRetry={loadData} />
      </ScrollView>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Card>
        <Text style={styles.welcomeLabel}>SPECTATOR CONTROL CENTER</Text>
        <Text style={styles.welcomeTitle}>Đường Đua & Dự Đoán</Text>
        <Text style={styles.welcomeSub}>Duyệt giải đấu, dự đoán ngựa chiến thắng, tích điểm đổi thưởng vật lý.</Text>
      </Card>

      <View style={styles.statsRow}>
        <StatCard label="Số dư ví" value={`${balance} Pts`} icon="account-balance-wallet" color={C.teal} />
        <StatCard label="Giải đang diễn ra" value={`${tournaments.filter(t => t.status === 'ONGOING').length}`} icon="emoji-events" color={C.red} />
      </View>

      <SectionHeader title="Giải đấu nổi bật" />
      {tournaments.slice(0, 3).map(t => {
        const s = statusLabel(t.status);
        return <ListItemCard key={t._id} title={t.name} subtitle={t.location || 'Chưa có địa điểm'} rightText={s.label} rightColor={s.color} icon="emoji-events" />;
      })}

      <SectionHeader title="Trận đua sắp tới" />
      {races.slice(0, 3).map(r => {
        const s = statusLabel(r.status);
        return <ListItemCard key={r._id} title={r.name} subtitle={formatDateTime(r.startTime)} rightText={s.label} rightColor={s.color} icon="flag" />;
      })}
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
});
