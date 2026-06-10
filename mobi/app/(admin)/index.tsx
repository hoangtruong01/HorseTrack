import React, { useEffect, useState } from 'react';
import { ScrollView, View, Text, StyleSheet } from 'react-native';
import { C, StatCard, Card, SectionHeader, ListItemCard, LoadingState, statusLabel } from '@/components/ui/shared';
import { tournamentsApi, racesApi, usersApi } from '@/lib/api-client';

export default function AdminHome() {
  const [tournamentsCount, setTournamentsCount] = useState(0);
  const [racesCount, setRacesCount] = useState(0);
  const [usersCount, setUsersCount] = useState(0);
  const [recentRaces, setRecentRaces] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [tRes, rRes, uRes] = await Promise.all([
          tournamentsApi.list({ limit: 1 }).catch(() => ({ meta: { total: 0 } })),
          racesApi.list({ limit: 5 }).catch(() => ({ data: [], meta: { total: 0 } })),
          usersApi.list({ limit: 1 }).catch(() => ({ meta: { total: 0 } })),
        ]);
        setTournamentsCount((tRes as any).meta?.total || 0);
        setRacesCount((rRes as any).meta?.total || 0);
        setRecentRaces((rRes as any).data || []);
        setUsersCount((uRes as any).meta?.total || 0);
      } catch {} finally { setLoading(false); }
    })();
  }, []);

  if (loading) return <LoadingState />;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Card>
        <Text style={styles.welcomeLabel}>ADMIN OVERVIEW</Text>
        <Text style={styles.welcomeTitle}>Hệ Thống Đua Ngựa HorseTrack</Text>
        <Text style={styles.welcomeSub}>Quản lý dữ liệu giải đấu, trận đua, phê duyệt đăng ký ngựa đua & các yêu cầu quy đổi điểm thưởng.</Text>
      </Card>

      <View style={styles.statsRow}>
        <StatCard label="Giải đấu" value={`${tournamentsCount}`} icon="emoji-events" color={C.red} />
        <StatCard label="Trận đua" value={`${racesCount}`} icon="flag" color={C.yellow} />
        <StatCard label="Người dùng" value={`${usersCount}`} icon="people" color={C.teal} />
      </View>

      <SectionHeader title="Trận đua gần đây" />
      {recentRaces.length === 0 ? (
        <Text style={styles.empty}>Chưa có trận đua nào.</Text>
      ) : (
        recentRaces.slice(0, 3).map(r => {
          const s = statusLabel(r.status);
          return <ListItemCard key={r._id} title={r.name} subtitle={`Cự ly: ${r.distanceMeters}m`} rightText={s.label} rightColor={s.color} icon="flag" />;
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
