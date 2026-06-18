import React, { useCallback, useEffect, useState } from 'react';
import { ScrollView, StyleSheet, RefreshControl, View, Text, TouchableOpacity } from 'react-native';
import { C, ListItemCard, LoadingState, EmptyState, ErrorState, SectionHeader, statusLabel, formatDateTime } from '@/components/ui/shared';
import { jockeyInvitationsApi } from '@/lib/api-client';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import RaceResultsModal from '@/components/ui/race-results-modal';

export default function JockeySchedule() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Results Modal State
  const [showResultsModal, setShowResultsModal] = useState(false);
  const [resultsRaceId, setResultsRaceId] = useState<string | null>(null);
  const [resultsRaceName, setResultsRaceName] = useState<string | null>(null);

  const openResultsModal = (race: any) => {
    setResultsRaceId(race._id || race.id);
    setResultsRaceName(race.name);
    setShowResultsModal(true);
  };

  const loadData = useCallback(async () => {
    setError(null);
    try {
      const r = await jockeyInvitationsApi.listReceived({ limit: 50 });
      const list = (r as any).data || [];
      setData(list.filter((i: any) => i.status === 'ACCEPTED'));
    } catch (err: any) {
      setError(err.message || 'Không thể tải lịch trình.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData();
  }, [loadData]);

  if (loading) return <LoadingState />;

  return (
    <View style={s.container}>
      <ScrollView 
        style={s.c} 
        contentContainerStyle={s.p}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.red} colors={[C.red]} />}
      >
        <SectionHeader title={`Lịch thi đấu đã xác nhận (${data.length})`} />
        {error ? (
          <ErrorState message={error} onRetry={loadData} />
        ) : data.length === 0 ? (
          <EmptyState icon="event" title="Chưa có lịch thi đấu" subtitle="Nhận lời mời từ chủ ngựa trong tab Hòm thư để điền tên vào lịch trình." />
        ) : (
          data.map(i => {
            const st = statusLabel(i.status);
            const raceName = typeof i.raceId === 'object' ? i.raceId?.name : 'Trận đua';
            const horseName = typeof i.horseId === 'object' ? i.horseId?.name : 'Ngựa';
            const startTime = typeof i.raceId === 'object' ? i.raceId?.startTime : undefined;
            const raceStatus = typeof i.raceId === 'object' ? i.raceId?.status : undefined;
            const isFinished = raceStatus === 'FINISHED';

            if (isFinished) {
              return (
                <View key={i._id} style={s.jockeyCard}>
                  <View style={s.jockeyCardMain}>
                    <View style={s.iconContainer}>
                      <MaterialIcons name="event-available" size={20} color="#34D399" />
                    </View>
                    <View style={{ flex: 1, minWidth: 0 }}>
                      <Text style={s.cardTitle} numberOfLines={1}>{raceName}</Text>
                      <Text style={s.cardSubtitle} numberOfLines={1}>
                        Chiến mã: {horseName} · {formatDateTime(startTime)}
                      </Text>
                    </View>
                    <View style={s.statusBadgeFinished}>
                      <Text style={s.statusBadgeFinishedText}>Hoàn thành</Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    style={s.resultsBtn}
                    onPress={() => openResultsModal(i.raceId)}
                    activeOpacity={0.8}
                  >
                    <MaterialIcons name="emoji-events" size={14} color="#34D399" />
                    <Text style={s.resultsBtnText}>Xem kết quả thi đấu</Text>
                  </TouchableOpacity>
                </View>
              );
            }

            return (
              <ListItemCard
                key={i._id}
                title={raceName}
                subtitle={`Chiến mã: ${horseName} · Thời gian: ${formatDateTime(startTime)}`}
                rightText={st.label}
                rightColor={st.color}
                icon="event"
              />
            );
          })
        )}
      </ScrollView>

      <RaceResultsModal
        visible={showResultsModal}
        onClose={() => setShowResultsModal(false)}
        raceId={resultsRaceId}
        raceName={resultsRaceName}
      />
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B0D12' },
  c: { flex: 1 },
  p: { padding: 16, paddingBottom: 32 },
  jockeyCard: {
    backgroundColor: '#11141B',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    borderRadius: 14,
    marginBottom: 8,
    overflow: 'hidden',
  },
  jockeyCardMain: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 12,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(52, 211, 153, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  cardSubtitle: {
    color: '#AEB6C2',
    fontSize: 11,
    marginTop: 2,
  },
  statusBadgeFinished: {
    backgroundColor: 'rgba(52, 211, 153, 0.1)',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: 'rgba(52, 211, 153, 0.2)',
  },
  statusBadgeFinishedText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#34D399',
    textTransform: 'uppercase',
  },
  resultsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    backgroundColor: 'rgba(52, 211, 153, 0.08)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(52, 211, 153, 0.15)',
  },
  resultsBtnText: {
    color: '#34D399',
    fontSize: 12,
    fontWeight: '800',
  },
});
