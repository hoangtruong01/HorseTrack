import React, { useEffect, useState, useCallback } from 'react';
import { ScrollView, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { C, StatCard, Card, SectionHeader, ListItemCard, LoadingState, ErrorState, statusLabel, EmptyState } from '@/components/ui/shared';
import { jockeyInvitationsApi, rewardPointLedgerApi } from '@/lib/api-client';

export default function JockeyHome() {
  const router = useRouter();
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
      <Card style={styles.heroCard}>
        <View style={styles.heroHeader}>
          <MaterialIcons name="stars" size={20} color={C.red} />
          <Text style={styles.welcomeLabel}>JOCKEY PORTAL</Text>
        </View>
        <Text style={styles.welcomeTitle}>Nài Ngựa Chuyên Nghiệp</Text>
        <Text style={styles.welcomeSub}>Nhận lời mời từ chủ ngựa, quản lý lịch thi đấu và xem báo cáo kết quả thi đấu của bạn.</Text>
      </Card>

      <View style={styles.actionsGrid}>
        {[
          { title: 'Lịch Thi Đấu', icon: 'event', path: '/schedule', color: '#F59E0B' },
          { title: 'Lời Mời', icon: 'mail', path: '/invitations', color: '#38BDF8' },
          { title: 'Hiệu Suất', icon: 'trending-up', path: '/performance', color: '#34D399' },
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
        <StatCard label="Lời mời mới" value={`${invitesCount}`} icon="mail" color={C.red} />
        <StatCard label="Ví tích lũy" value={`${balance.toLocaleString()} Pts`} icon="account-balance-wallet" color={C.teal} />
      </View>

      <SectionHeader title="Lời mời gần đây" onSeeAll={() => router.push('/invitations')} />
      {error ? (
        <ErrorState message={error} onRetry={loadData} />
      ) : invitations.length === 0 ? (
        <EmptyState icon="mail-outline" title="Chưa có lời mời" subtitle="Bạn chưa có lời mời nào gần đây từ chủ ngựa." />
      ) : (
        invitations.slice(0, 3).map(i => {
          const s = statusLabel(i.status);
          const owner = typeof i.ownerId === 'object' ? i.ownerId?.fullName : 'Chủ ngựa';
          const horse = typeof i.horseId === 'object' ? i.horseId?.name : 'Ngựa';
          return <ListItemCard key={i._id} title={`Mời nài ngựa: ${horse}`} subtitle={`Từ: ${owner} · Thưởng: ${i.prizeSharePercentage}%`} rightText={s.label} rightColor={s.color} icon="mail" onPress={() => router.push('/invitations')} />;
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
