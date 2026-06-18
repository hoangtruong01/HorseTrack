import React, { useEffect, useState, useCallback } from 'react';
import { ScrollView, View, Text, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native';
import { LoadingState, EmptyState, statusLabel, formatDate } from '@/components/ui/shared';
import { AppScreen } from '@/components/ui/premium';
import { premiumColors, premiumSpacing, premiumRadius, premiumTypography } from '@/components/ui/premium-tokens';
import { tournamentsApi, racesApi, raceResultsApi } from '@/lib/api-client';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

type ViewState = 'tournaments' | 'races' | 'detail';

export default function OwnerResults() {
  const [view, setView] = useState<ViewState>('tournaments');
  const [tournaments, setTournaments] = useState<any[]>([]);
  const [races, setRaces] = useState<any[]>([]);
  const [results, setResults] = useState<any[]>([]);
  const [selectedTournament, setSelectedTournament] = useState<any>(null);
  const [selectedRace, setSelectedRace] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadTournaments = useCallback(async () => {
    try {
      const res = await tournamentsApi.list({ limit: 50 });
      setTournaments((res as any).data || []);
    } catch {} finally { setLoading(false); }
  }, []);

  useEffect(() => { loadTournaments(); }, [loadTournaments]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    if (view === 'tournaments') await loadTournaments();
    setRefreshing(false);
  }, [view, loadTournaments]);

  const selectTournament = async (t: any) => {
    setSelectedTournament(t);
    setView('races');
    setLoading(true);
    try {
      const id = t._id || t.id;
      const res = await racesApi.listByTournament(id, { limit: 50 });
      const raceList = (res as any).data || [];
      setRaces(raceList.filter((r: any) => r.status === 'FINISHED' || r.status === 'RESULT_PUBLISHED'));
    } catch {} finally { setLoading(false); }
  };

  const selectRace = async (race: any) => {
    setSelectedRace(race);
    setView('detail');
    setLoading(true);
    try {
      const id = race._id || race.id;
      const res = await raceResultsApi.getByRace(id);
      const resultData = Array.isArray(res) ? res : (res as any).data || [];
      setResults(resultData.sort((a: any, b: any) => (a.rank || 999) - (b.rank || 999)));
    } catch {} finally { setLoading(false); }
  };

  const goBack = () => {
    if (view === 'detail') { setView('races'); setResults([]); }
    else if (view === 'races') { setView('tournaments'); setRaces([]); setSelectedTournament(null); }
  };

  const formatTime = (ms?: number) => {
    if (!ms) return '—';
    const sec = ms / 1000;
    const min = Math.floor(sec / 60);
    const s = (sec % 60).toFixed(2);
    return `${min}:${s.padStart(5, '0')}`;
  };

  const rankIcon = (rank?: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank || '?'}`;
  };

  if (loading) return <LoadingState />;

  return (
    <AppScreen padded={false}>
      {view !== 'tournaments' && (
        <TouchableOpacity style={st.backBtn} onPress={goBack}>
          <MaterialIcons name="arrow-back" size={24} color={premiumColors.text} />
          <Text style={st.backText}>Quay lại</Text>
        </TouchableOpacity>
      )}

      <ScrollView
        contentContainerStyle={st.p}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={premiumColors.brand} colors={[premiumColors.brand]} />}
      >
        {view === 'tournaments' && (
          <>
            <View style={st.headerBox}>
              <Text style={st.eyebrow}>Kết quả giải đấu</Text>
              <Text style={st.pageTitle}>Chọn giải đấu</Text>
            </View>
            {tournaments.length === 0 ? (
              <EmptyState icon="emoji-events" title="Chưa có giải đấu" subtitle="Không tìm thấy giải đấu nào." />
            ) : (
              tournaments.map(t => {
                const id = t._id || t.id;
                const ts = statusLabel(t.status);
                return (
                  <TouchableOpacity key={id} style={st.cardItem} onPress={() => selectTournament(t)}>
                    <View style={{ flex: 1 }}>
                      <Text style={st.cardTitle} numberOfLines={1}>{t.name}</Text>
                      <Text style={st.cardSub}>{formatDate(t.startDate)} — {formatDate(t.endDate)}</Text>
                    </View>
                    <View style={[st.badge, { backgroundColor: ts.color + '20', borderColor: ts.color + '40' }]}>
                      <Text style={[st.badgeText, { color: ts.color }]}>{ts.label}</Text>
                    </View>
                    <MaterialIcons name="chevron-right" size={24} color={premiumColors.textMuted} />
                  </TouchableOpacity>
                );
              })
            )}
          </>
        )}

        {view === 'races' && (
          <>
            <View style={st.headerBox}>
              <Text style={st.eyebrow}>Kết quả thi đấu</Text>
              <Text style={st.pageTitle}>{selectedTournament?.name}</Text>
            </View>
            {races.length === 0 ? (
              <EmptyState icon="flag" title="Chưa có kết quả" subtitle="Chưa có trận đua nào kết thúc trong giải đấu này." />
            ) : (
              races.map(race => {
                const id = race._id || race.id;
                return (
                  <TouchableOpacity key={id} style={st.cardItem} onPress={() => selectRace(race)}>
                    <View style={st.iconBox}><MaterialIcons name="flag" size={24} color={premiumColors.brand} /></View>
                    <View style={{ flex: 1 }}>
                      <Text style={st.cardTitle} numberOfLines={1}>{race.name}</Text>
                      <Text style={st.cardSub}>{race.distanceMeters}m · {formatDate(race.startTime)}</Text>
                    </View>
                    <MaterialIcons name="chevron-right" size={24} color={premiumColors.textMuted} />
                  </TouchableOpacity>
                );
              })
            )}
          </>
        )}

        {view === 'detail' && (
          <>
            <View style={st.headerBox}>
              <Text style={st.eyebrow}>{selectedTournament?.name}</Text>
              <Text style={st.pageTitle}>{selectedRace?.name}</Text>
            </View>
            {results.length === 0 ? (
              <EmptyState icon="leaderboard" title="Chưa có kết quả" subtitle="Kết quả chưa được công bố." />
            ) : (
              <View style={st.resultsContainer}>
                {results.map((res, idx) => {
                  const horseName = typeof res.horseId === 'object' ? res.horseId?.name : 'Ngựa ẩn';
                  const jockeyName = typeof res.jockeyUserId === 'object' ? res.jockeyUserId?.fullName : 'Nài ẩn';
                  return (
                    <View key={res._id || idx} style={st.resultRow}>
                      <View style={st.rankBox}>
                        <Text style={st.rankText}>{rankIcon(res.rank)}</Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={st.horseText}>{horseName}</Text>
                        <Text style={st.jockeyText}>Nài: {jockeyName}</Text>
                      </View>
                      <View style={{ alignItems: 'flex-end' }}>
                        <Text style={st.timeText}>{formatTime(res.finishTimeMs)}</Text>
                        <Text style={st.ptsText}>+{res.points || 0} PTS</Text>
                      </View>
                    </View>
                  );
                })}
              </View>
            )}
          </>
        )}
      </ScrollView>
    </AppScreen>
  );
}

const st = StyleSheet.create({
  p: { padding: premiumSpacing[16], paddingBottom: premiumSpacing[32] },
  backBtn: { flexDirection: 'row', alignItems: 'center', gap: premiumSpacing[8], padding: premiumSpacing[16], backgroundColor: premiumColors.surfaceGlassStrong, borderBottomWidth: 1, borderBottomColor: premiumColors.borderGlass },
  backText: { color: premiumColors.text, fontSize: premiumTypography.sizes[14], fontWeight: premiumTypography.weights.bold },
  headerBox: { marginBottom: premiumSpacing[24] },
  eyebrow: { color: premiumColors.brand, fontSize: premiumTypography.sizes[12], fontWeight: premiumTypography.weights.bold, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: premiumSpacing[4] },
  pageTitle: { color: premiumColors.text, fontSize: premiumTypography.sizes[24], fontWeight: premiumTypography.weights.black },
  cardItem: { flexDirection: 'row', alignItems: 'center', gap: premiumSpacing[12], backgroundColor: premiumColors.surfaceGlass, borderWidth: 1, borderColor: premiumColors.borderSoft, borderRadius: premiumRadius[16], padding: premiumSpacing[16], marginBottom: premiumSpacing[12] },
  cardTitle: { color: premiumColors.text, fontSize: premiumTypography.sizes[16], fontWeight: premiumTypography.weights.bold, marginBottom: premiumSpacing[4] },
  cardSub: { color: premiumColors.textMuted, fontSize: premiumTypography.sizes[13] },
  badge: { borderWidth: 1, borderRadius: premiumRadius[8], paddingHorizontal: premiumSpacing[8], paddingVertical: 4 },
  badgeText: { fontSize: premiumTypography.sizes[11], fontWeight: premiumTypography.weights.bold, textTransform: 'uppercase', letterSpacing: 0.5 },
  iconBox: { width: 48, height: 48, borderRadius: premiumRadius[12], backgroundColor: premiumColors.brandSoft, alignItems: 'center', justifyContent: 'center' },
  resultsContainer: { gap: premiumSpacing[12] },
  resultRow: { flexDirection: 'row', alignItems: 'center', gap: premiumSpacing[12], backgroundColor: premiumColors.surfaceGlass, borderWidth: 1, borderColor: premiumColors.borderSoft, borderRadius: premiumRadius[16], padding: premiumSpacing[12] },
  rankBox: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center', backgroundColor: premiumColors.surfaceGlassStrong, borderRadius: premiumRadius[12] },
  rankText: { fontSize: 24, textAlign: 'center' },
  horseText: { color: premiumColors.text, fontSize: premiumTypography.sizes[16], fontWeight: premiumTypography.weights.bold, marginBottom: 2 },
  jockeyText: { color: premiumColors.textSecondary, fontSize: premiumTypography.sizes[13] },
  timeText: { color: premiumColors.text, fontSize: premiumTypography.sizes[16], fontWeight: premiumTypography.weights.black, fontVariant: ['tabular-nums'] },
  ptsText: { color: premiumColors.gold, fontSize: premiumTypography.sizes[13], fontWeight: premiumTypography.weights.bold, marginTop: 4 },
});
