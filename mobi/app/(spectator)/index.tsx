import React, { useEffect, useState, useCallback } from 'react';
import { ScrollView, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { C, StatCard, Card, SectionHeader, ListItemCard, LoadingState, ErrorState, statusLabel, formatDateTime, EmptyState } from '@/components/ui/shared';
import { tournamentsApi, racesApi, rewardPointLedgerApi } from '@/lib/api-client';

export default function SpectatorHome() {
  const router = useRouter();
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
      <Card style={styles.heroCard}>
        <View style={styles.heroHeader}>
          <MaterialIcons name="stars" size={20} color={C.red} />
          <Text style={styles.welcomeLabel}>KHÁN GIẢ & NGƯỜI CHƠI</Text>
        </View>
        <Text style={styles.welcomeTitle}>Đường Đua & Dự Đoán</Text>
        <Text style={styles.welcomeSub}>Duyệt giải đấu, dự đoán ngựa chiến thắng, tích điểm đổi thưởng vật lý.</Text>
      </Card>

      <View style={styles.actionsGrid}>
        {[
          { title: 'Giải Đấu', icon: 'emoji-events', path: '/tournaments', color: '#F59E0B' },
          { title: 'Trận Đua', icon: 'flag', path: '/races', color: '#34D399' },
          { title: 'Dự Đoán', icon: 'online-prediction', path: '/predictions', color: '#38BDF8' },
          { title: 'Ví Điểm', icon: 'account-balance-wallet', path: '/wallet', color: '#A855F7' },
        ].map((act, idx) => (
          <TouchableOpacity key={idx} style={styles.actionBtn} onPress={() => router.push(act.path as any)}>
            <View style={[styles.actionIconWrap, { backgroundColor: act.color + '15' }]}>
              <MaterialIcons name={act.icon as any} size={24} color={act.color} />
            </View>
            <Text style={styles.actionText}>{act.title}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.statsRow}>
        <StatCard label="Số dư ví" value={`${balance} Pts`} icon="account-balance-wallet" color={C.teal} />
        <StatCard label="Giải đang diễn ra" value={`${tournaments.filter(t => t.status === 'ONGOING').length}`} icon="emoji-events" color={C.red} />
      </View>

      <SectionHeader title="Giải đấu nổi bật" onSeeAll={() => router.push('/tournaments')} />
      {tournaments.length === 0 ? (
        <EmptyState icon="event-busy" title="Chưa có giải đấu" subtitle="Hiện tại không có giải đấu nào đang diễn ra." />
      ) : (
        tournaments.slice(0, 3).map(t => {
          const s = statusLabel(t.status);
          return <ListItemCard key={t._id} title={t.name} subtitle={t.location || 'Chưa có địa điểm'} rightText={s.label} rightColor={s.color} icon="emoji-events" onPress={() => router.push('/tournaments')} />;
        })
      )}

      <SectionHeader title="Trận đua sắp tới" onSeeAll={() => router.push('/races')} />
      {races.length === 0 ? (
        <EmptyState icon="flag" title="Chưa có trận đua" subtitle="Hiện tại không có trận đua nào sắp diễn ra." />
      ) : (
        races.slice(0, 3).map(r => {
          const s = statusLabel(r.status);
          return <ListItemCard key={r._id} title={r.name} subtitle={formatDateTime(r.startTime)} rightText={s.label} rightColor={s.color} icon="flag" onPress={() => router.push('/races')} />;
        })
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  content: { padding: 16, paddingBottom: 32 },
  statsRow: { flexDirection: 'row', gap: 8, marginBottom: 20 },
  heroCard: { backgroundColor: C.card, padding: 20, marginBottom: 16, borderRadius: 16, borderWidth: 1, borderColor: C.cardBorder },
  heroHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  welcomeLabel: { color: C.red, fontSize: 11, fontWeight: '800', letterSpacing: 1.5 },
  welcomeTitle: { color: C.white, fontSize: 24, fontWeight: '900', marginBottom: 6 },
  welcomeSub: { color: C.textSecondary, fontSize: 13, lineHeight: 20 },
  actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 },
  actionBtn: { flex: 1, minWidth: '20%', backgroundColor: C.card, borderWidth: 1, borderColor: C.cardBorder, borderRadius: 16, alignItems: 'center', justifyContent: 'center', paddingVertical: 12 },
  actionIconWrap: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  actionText: { color: C.white, fontSize: 10, fontWeight: '700', textAlign: 'center' },
});
