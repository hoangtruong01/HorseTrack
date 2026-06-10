import React, { useEffect, useState, useCallback } from 'react';
import { ScrollView, View, Text, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native';
import { C, LoadingState, EmptyState, Card } from '@/components/ui/shared';
import { rankingsApi } from '@/lib/api-client';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

type TabKey = 'horses' | 'jockeys';

export default function OwnerRankings() {
  const [tab, setTab] = useState<TabKey>('horses');
  const [horses, setHorses] = useState<any[]>([]);
  const [jockeys, setJockeys] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [hRes, jRes] = await Promise.all([
        rankingsApi.globalHorses().catch(() => []),
        rankingsApi.globalJockeys().catch(() => []),
      ]);
      setHorses(Array.isArray(hRes) ? hRes : (hRes as any)?.data || []);
      setJockeys(Array.isArray(jRes) ? jRes : (jRes as any)?.data || []);
    } catch {} finally { setLoading(false); }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [loadData]);

  const rankIcon = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  if (loading) return <LoadingState />;

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      {/* Tab Bar */}
      <View style={s.tabBar}>
        <TouchableOpacity style={[s.tab, tab === 'horses' && s.tabActive]} onPress={() => setTab('horses')}>
          <Text style={[s.tabText, tab === 'horses' && { color: C.red }]}>🐎 Chiến Mã</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[s.tab, tab === 'jockeys' && s.tabActive]} onPress={() => setTab('jockeys')}>
          <Text style={[s.tabText, tab === 'jockeys' && { color: C.red }]}>🏇 Nài Ngựa</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={s.p}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.red} colors={[C.red]} />}
      >
        <Card>
          <Text style={s.eyebrow}>Đại sảnh vinh danh</Text>
          <Text style={s.pageTitle}>Bảng Xếp Hạng Vô Địch</Text>
        </Card>

        {tab === 'horses' ? (
          horses.length === 0 ? (
            <EmptyState icon="emoji-events" title="Chưa có dữ liệu" subtitle="Chưa có dữ liệu xếp hạng chiến mã." />
          ) : (
            horses.map((h, idx) => (
              <View key={h.horseId || idx} style={[s.rankCard, h.rank === 1 && s.rankCardGold]}>
                <Text style={s.rankBig}>{rankIcon(h.rank || idx + 1)}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={s.rankName} numberOfLines={1}>{h.horseName || 'Chiến mã ẩn'}</Text>
                  <Text style={s.rankSub}>{h.breed || 'Chưa rõ giống'} · {h.ownerName || 'Chủ ẩn'}</Text>
                  <View style={s.statsRow}>
                    <Text style={s.statBadge}>🏁 {h.totalRaces || 0} trận</Text>
                    <Text style={[s.statBadge, { color: C.tealLight }]}>🏆 {h.wins || 0} vô địch</Text>
                    <Text style={[s.statBadge, { color: '#F59E0B' }]}>⚡ {h.totalPoints || 0} PTS</Text>
                  </View>
                </View>
              </View>
            ))
          )
        ) : (
          jockeys.length === 0 ? (
            <EmptyState icon="emoji-events" title="Chưa có dữ liệu" subtitle="Chưa có dữ liệu xếp hạng nài ngựa." />
          ) : (
            jockeys.map((j, idx) => (
              <View key={j.jockeyUserId || idx} style={[s.rankCard, j.rank === 1 && s.rankCardGold]}>
                <Text style={s.rankBig}>{rankIcon(j.rank || idx + 1)}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={s.rankName} numberOfLines={1}>{j.jockeyName || 'Nài ẩn'}</Text>
                  <Text style={s.rankSub}>{j.skillLevel || 'Chưa rõ'} · {j.experienceYears || 0} năm KN</Text>
                  <View style={s.statsRow}>
                    <Text style={s.statBadge}>🏁 {j.totalRaces || 0} trận</Text>
                    <Text style={[s.statBadge, { color: C.tealLight }]}>🏆 {j.wins || 0} vô địch</Text>
                    <Text style={[s.statBadge, { color: '#F59E0B' }]}>⚡ {j.totalPoints || 0} PTS</Text>
                  </View>
                </View>
              </View>
            ))
          )
        )}
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  p: { padding: 16, paddingBottom: 32 },
  tabBar: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: C.cardBorder, backgroundColor: C.card },
  tab: { flex: 1, alignItems: 'center', paddingVertical: 12, borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabActive: { borderBottomColor: C.red },
  tabText: { color: C.textMuted, fontSize: 13, fontWeight: '800', textTransform: 'uppercase' },
  eyebrow: { color: C.red, fontSize: 10, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1.5 },
  pageTitle: { color: C.white, fontSize: 18, fontWeight: '900', marginTop: 4 },
  rankCard: { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: C.card, borderWidth: 1, borderColor: C.cardBorder, borderRadius: 16, padding: 14, marginBottom: 10 },
  rankCardGold: { borderColor: '#F59E0B40', backgroundColor: '#F59E0B08' },
  rankBig: { fontSize: 24, minWidth: 40, textAlign: 'center' },
  rankName: { color: C.white, fontSize: 14, fontWeight: '900', textTransform: 'uppercase' },
  rankSub: { color: C.textMuted, fontSize: 10, marginTop: 2 },
  statsRow: { flexDirection: 'row', gap: 10, marginTop: 6, flexWrap: 'wrap' },
  statBadge: { color: C.textSecondary, fontSize: 10, fontWeight: '700' },
});
