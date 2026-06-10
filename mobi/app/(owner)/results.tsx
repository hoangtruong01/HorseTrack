import React, { useEffect, useState, useCallback } from 'react';
import { ScrollView, View, Text, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native';
import { C, LoadingState, EmptyState, SectionHeader, Card, statusLabel, formatDate } from '@/components/ui/shared';
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
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      {view !== 'tournaments' && (
        <TouchableOpacity style={st.backBtn} onPress={goBack}>
          <MaterialIcons name="arrow-back" size={20} color={C.textSecondary} />
          <Text style={st.backText}>Quay lại</Text>
        </TouchableOpacity>
      )}

      <ScrollView
        contentContainerStyle={st.p}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.red} colors={[C.red]} />}
      >
        {view === 'tournaments' && (
          <>
            <SectionHeader title="Chọn giải đấu để xem kết quả" />
            {tournaments.length === 0 ? (
              <EmptyState icon="emoji-events" title="Chưa có giải đấu" subtitle="Không tìm thấy giải đấu nào." />
            ) : (
              tournaments.map(t => {
                const id = t._id || t.id;
                const ts = statusLabel(t.status);
                return (
                  <TouchableOpacity key={id} style={st.tournamentCard} onPress={() => selectTournament(t)}>
                    <View style={{ flex: 1 }}>
                      <Text style={st.tName} numberOfLines={1}>{t.name}</Text>
                      <Text style={st.tDate}>{formatDate(t.startDate)} — {formatDate(t.endDate)}</Text>
                    </View>
                    <View style={[st.badge, { backgroundColor: ts.color + '20', borderColor: ts.color + '40' }]}>
                      <Text style={[st.badgeText, { color: ts.color }]}>{ts.label}</Text>
                    </View>
                    <MaterialIcons name="chevron-right" size={20} color={C.textMuted} />
                  </TouchableOpacity>
                );
              })
            )}
          </>
        )}

        {view === 'races' && (
          <>
            <Card>
              <Text style={st.eyebrow}>Kết quả thi đấu</Text>
              <Text style={st.pageTitle}>{selectedTournament?.name}</Text>
            </Card>
            {races.length === 0 ? (
              <EmptyState icon="flag" title="Chưa có kết quả" subtitle="Chưa có trận đua nào kết thúc trong giải đấu này." />
            ) : (
              races.map(race => {
                const id = race._id || race.id;
                return (
                  <TouchableOpacity key={id} style={st.raceCard} onPress={() => selectRace(race)}>
                    <View style={st.raceIcon}><MaterialIcons name="flag" size={20} color={C.red} /></View>
                    <View style={{ flex: 1 }}>
                      <Text style={st.raceName} numberOfLines={1}>{race.name}</Text>
                      <Text style={st.raceInfo}>{race.distanceMeters}m · {formatDate(race.startTime)}</Text>
                    </View>
                    <MaterialIcons name="chevron-right" size={20} color={C.textMuted} />
                  </TouchableOpacity>
                );
              })
            )}
          </>
        )}

        {view === 'detail' && (
          <>
            <Card>
              <Text style={st.eyebrow}>{selectedTournament?.name}</Text>
              <Text style={st.pageTitle}>{selectedRace?.name}</Text>
            </Card>
            {results.length === 0 ? (
              <EmptyState icon="leaderboard" title="Chưa có kết quả" subtitle="Kết quả chưa được công bố." />
            ) : (
              results.map((res, idx) => {
                const horseName = typeof res.horseId === 'object' ? res.horseId?.name : 'Ngựa ẩn';
                const jockeyName = typeof res.jockeyUserId === 'object' ? res.jockeyUserId?.fullName : 'Nài ẩn';
                return (
                  <View key={res._id || idx} style={st.resultRow}>
                    <Text style={st.rankText}>{rankIcon(res.rank)}</Text>
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
              })
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const st = StyleSheet.create({
  p: { padding: 16, paddingBottom: 32 },
  backBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, padding: 12, borderBottomWidth: 1, borderBottomColor: C.cardBorder, backgroundColor: C.card },
  backText: { color: C.textSecondary, fontSize: 12, fontWeight: '700' },
  tournamentCard: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: C.card, borderWidth: 1, borderColor: C.cardBorder, borderRadius: 14, padding: 14, marginBottom: 8 },
  tName: { color: C.white, fontSize: 14, fontWeight: '800' },
  tDate: { color: C.textMuted, fontSize: 10, marginTop: 4 },
  badge: { borderWidth: 1, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  badgeText: { fontSize: 9, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.5 },
  eyebrow: { color: C.red, fontSize: 10, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1.5 },
  pageTitle: { color: C.white, fontSize: 18, fontWeight: '900', marginTop: 4 },
  raceCard: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: C.card, borderWidth: 1, borderColor: C.cardBorder, borderRadius: 14, padding: 14, marginBottom: 8 },
  raceIcon: { width: 40, height: 40, borderRadius: 12, backgroundColor: C.red + '15', alignItems: 'center', justifyContent: 'center' },
  raceName: { color: C.white, fontSize: 13, fontWeight: '800' },
  raceInfo: { color: C.textMuted, fontSize: 10, marginTop: 4 },
  resultRow: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: C.card, borderWidth: 1, borderColor: C.cardBorder, borderRadius: 14, padding: 14, marginBottom: 8 },
  rankText: { fontSize: 20, minWidth: 36, textAlign: 'center' },
  horseText: { color: C.white, fontSize: 13, fontWeight: '800' },
  jockeyText: { color: C.textSecondary, fontSize: 11, marginTop: 2 },
  timeText: { color: C.white, fontSize: 13, fontWeight: '900', fontVariant: ['tabular-nums'] },
  ptsText: { color: C.tealLight, fontSize: 11, fontWeight: '800', marginTop: 2 },
});
