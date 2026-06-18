import React, { useEffect, useState, useCallback } from 'react';
import { ScrollView, View, Text, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native';
import { LoadingState, EmptyState } from '@/components/ui/shared';
import { AppScreen } from '@/components/ui/premium';
import { premiumColors, premiumSpacing, premiumRadius, premiumTypography } from '@/components/ui/premium-tokens';
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
    <AppScreen padded={false}>
      {/* Tab Bar */}
      <View style={s.tabBar}>
        <TouchableOpacity style={[s.tab, tab === 'horses' && s.tabActive]} onPress={() => setTab('horses')}>
          <Text style={[s.tabText, tab === 'horses' && { color: premiumColors.brand }]}>🐎 Chiến Mã</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[s.tab, tab === 'jockeys' && s.tabActive]} onPress={() => setTab('jockeys')}>
          <Text style={[s.tabText, tab === 'jockeys' && { color: premiumColors.brand }]}>🏇 Nài Ngựa</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={s.p}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={premiumColors.brand} colors={[premiumColors.brand]} />}
      >
        <View style={s.headerBox}>
          <Text style={s.eyebrow}>Đại sảnh vinh danh</Text>
          <Text style={s.pageTitle}>Bảng Xếp Hạng Vô Địch</Text>
        </View>

        {tab === 'horses' ? (
          horses.length === 0 ? (
            <EmptyState icon="emoji-events" title="Chưa có dữ liệu" subtitle="Chưa có dữ liệu xếp hạng chiến mã." />
          ) : (
            horses.map((h, idx) => (
              <View key={h.horseId || idx} style={[s.rankCard, h.rank === 1 && s.rankCardGold]}>
                <View style={s.rankNumBox}>
                  <Text style={s.rankBig}>{rankIcon(h.rank || idx + 1)}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.rankName} numberOfLines={1}>{h.horseName || 'Chiến mã ẩn'}</Text>
                  <Text style={s.rankSub}>{h.breed || 'Chưa rõ giống'} · {h.ownerName || 'Chủ ẩn'}</Text>
                  <View style={s.statsRow}>
                    <Text style={s.statBadge}>🏁 {h.totalRaces || 0} trận</Text>
                    <Text style={[s.statBadge, { color: premiumColors.success }]}>🏆 {h.wins || 0} vô địch</Text>
                    <Text style={[s.statBadge, { color: premiumColors.gold }]}>⚡ {h.totalPoints || 0} PTS</Text>
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
                <View style={s.rankNumBox}>
                  <Text style={s.rankBig}>{rankIcon(j.rank || idx + 1)}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.rankName} numberOfLines={1}>{j.jockeyName || 'Nài ẩn'}</Text>
                  <Text style={s.rankSub}>{j.skillLevel || 'Chưa rõ'} · {j.experienceYears || 0} năm KN</Text>
                  <View style={s.statsRow}>
                    <Text style={s.statBadge}>🏁 {j.totalRaces || 0} trận</Text>
                    <Text style={[s.statBadge, { color: premiumColors.success }]}>🏆 {j.wins || 0} vô địch</Text>
                    <Text style={[s.statBadge, { color: premiumColors.gold }]}>⚡ {j.totalPoints || 0} PTS</Text>
                  </View>
                </View>
              </View>
            ))
          )
        )}
      </ScrollView>
    </AppScreen>
  );
}

const s = StyleSheet.create({
  p: { padding: premiumSpacing[16], paddingBottom: premiumSpacing[32] },
  tabBar: { flexDirection: 'row', backgroundColor: premiumColors.surfaceGlassStrong, borderBottomWidth: 1, borderBottomColor: premiumColors.borderGlass },
  tab: { flex: 1, paddingVertical: premiumSpacing[16], alignItems: 'center', borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabActive: { borderBottomColor: premiumColors.brand },
  tabText: { color: premiumColors.textMuted, fontSize: premiumTypography.sizes[14], fontWeight: premiumTypography.weights.bold },
  headerBox: { marginBottom: premiumSpacing[24] },
  eyebrow: { color: premiumColors.brand, fontSize: premiumTypography.sizes[12], fontWeight: premiumTypography.weights.bold, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: premiumSpacing[4] },
  pageTitle: { color: premiumColors.text, fontSize: premiumTypography.sizes[24], fontWeight: premiumTypography.weights.black },
  rankCard: { 
    flexDirection: 'row', alignItems: 'center', gap: premiumSpacing[16], 
    backgroundColor: premiumColors.surfaceGlass, 
    borderWidth: 1, borderColor: premiumColors.borderSoft, 
    borderRadius: premiumRadius[16], 
    padding: premiumSpacing[16], 
    marginBottom: premiumSpacing[12] 
  },
  rankCardGold: { 
    backgroundColor: premiumColors.gold + '1A', 
    borderColor: premiumColors.gold + '4D' 
  },
  rankNumBox: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center', backgroundColor: premiumColors.surfaceGlassStrong, borderRadius: premiumRadius[12] },
  rankBig: { fontSize: 24, textAlign: 'center' },
  rankName: { color: premiumColors.text, fontSize: premiumTypography.sizes[16], fontWeight: premiumTypography.weights.bold, marginBottom: 2 },
  rankSub: { color: premiumColors.textMuted, fontSize: premiumTypography.sizes[13], marginBottom: premiumSpacing[8] },
  statsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: premiumSpacing[8] },
  statBadge: { color: premiumColors.textSecondary, fontSize: premiumTypography.sizes[12], fontWeight: premiumTypography.weights.bold },
});
