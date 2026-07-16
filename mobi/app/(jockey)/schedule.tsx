import React, { useCallback, useEffect, useState } from 'react';
import { View, StyleSheet, Text, SectionList, RefreshControl, TouchableOpacity } from 'react-native';
import { AppScreen } from '@/components/ui/premium';
import { premiumColors, premiumSpacing, premiumRadius } from '@/components/ui/premium-tokens';
import { LoadingState, EmptyState, ErrorState, statusLabel, formatDateTime } from '@/components/ui/shared';
import { SleekHeader } from '@/components/ui/sleek-header';
import { jockeyInvitationsApi } from '@/lib/api-client';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import RaceResultsModal from '@/components/ui/race-results-modal';

export default function JockeySchedule() {
  const [pendingData, setPendingData] = useState<any[]>([]);
  const [acceptedData, setAcceptedData] = useState<any[]>([]);
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
      setPendingData(list.filter((i: any) => i.status === 'PENDING'));
      setAcceptedData(list.filter((i: any) => i.status === 'ACCEPTED'));
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

  if (loading && !refreshing) return <LoadingState />;

  const renderItem = ({ item }: { item: any }) => {
    const st = statusLabel(item.status);
    const raceName = typeof item.raceId === 'object' ? item.raceId?.name : 'Trận đua';
    const horseName = typeof item.horseId === 'object' ? item.horseId?.name : 'Ngựa';
    const startTime = typeof item.raceId === 'object' ? item.raceId?.startTime : undefined;
    const raceStatus = typeof item.raceId === 'object' ? item.raceId?.status : undefined;
    const isFinished = raceStatus === 'FINISHED';

    if (isFinished) {
      return (
        <View style={styles.cardFinished}>
          <View style={styles.cardFinishedMain}>
            <View style={styles.iconContainerFinished}>
              <MaterialIcons name="event-available" size={20} color={premiumColors.success} />
            </View>
            <View style={styles.cardInfo}>
              <Text style={styles.raceTitle} numberOfLines={1}>{raceName}</Text>
              <Text style={styles.detailText} numberOfLines={1}>
                Chiến mã: <Text style={styles.highlight}>{horseName}</Text>
              </Text>
              <Text style={styles.detailText} numberOfLines={1}>
                Thời gian: {formatDateTime(startTime)}
              </Text>
            </View>
            <View style={styles.statusBadgeFinished}>
              <Text style={styles.statusBadgeFinishedText}>Hoàn thành</Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.resultsBtn}
            onPress={() => openResultsModal(item.raceId)}
            activeOpacity={0.8}
          >
            <MaterialIcons name="emoji-events" size={16} color={premiumColors.success} />
            <Text style={styles.resultsBtnText}>Xem kết quả thi đấu</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={styles.card}>
        <View style={styles.cardIcon}>
          <MaterialIcons name="event" size={24} color={premiumColors.textSecondary} />
        </View>
        <View style={styles.cardInfo}>
          <Text style={styles.raceTitle} numberOfLines={1}>{raceName}</Text>
          <Text style={styles.detailText} numberOfLines={1}>
            Chiến mã: <Text style={styles.highlight}>{horseName}</Text>
          </Text>
          <Text style={styles.detailText} numberOfLines={1}>
            Thời gian: {formatDateTime(startTime)}
          </Text>
        </View>
        <View style={[styles.badge, { borderColor: st.color + '40', backgroundColor: st.color + '18' }]}>
          <Text style={[styles.badgeText, { color: st.color }]}>{st.label}</Text>
        </View>
      </View>
    );
  };

  const sections = [
    ...(pendingData.length > 0 ? [{ title: `Lời mời chờ xử lý (${pendingData.length})`, data: pendingData, isPending: true }] : []),
    ...(acceptedData.length > 0 ? [{ title: `Lịch đã nhận (${acceptedData.length})`, data: acceptedData, isPending: false }] : []),
  ];

  const isEmpty = pendingData.length === 0 && acceptedData.length === 0;

  return (
    <AppScreen scroll={false} safeArea={false}>
      <SleekHeader title="LỊCH THI ĐẤU" showWallet={true} />

      {error ? (
        <View style={{ paddingHorizontal: premiumSpacing[16], marginTop: premiumSpacing[16] }}>
          <ErrorState message={error} onRetry={loadData} />
        </View>
      ) : isEmpty ? (
        <View style={styles.emptyWrap}>
          <EmptyState
            icon="event"
            title="Chưa có lịch thi đấu"
            subtitle="Nhận lời mời từ chủ ngựa trong tab Hòm thư để điền tên vào lịch trình."
          />
        </View>
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(item) => item._id || item.id}
          contentContainerStyle={styles.listContent}
          stickySectionHeadersEnabled={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={premiumColors.brand} colors={[premiumColors.brand]} />
          }
          renderSectionHeader={({ section }) => (
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{section.title}</Text>
              {section.isPending && (
                <Text style={styles.sectionNote}>Vào Hòm thư để chấp nhận/từ chối</Text>
              )}
            </View>
          )}
          renderItem={({ item }) => renderItem({ item })}
        />
      )}

      <RaceResultsModal
        visible={showResultsModal}
        onClose={() => setShowResultsModal(false)}
        raceId={resultsRaceId}
        raceName={resultsRaceName}
      />
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: premiumSpacing[16],
    paddingTop: premiumSpacing[24],
    paddingBottom: premiumSpacing[16],
  },
  eyebrow: {
    fontSize: 11,
    fontWeight: '700',
    color: premiumColors.brand,
    letterSpacing: 1,
    marginBottom: premiumSpacing[8],
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: premiumColors.text,
    marginBottom: premiumSpacing[8],
  },
  accentLine: {
    width: 36,
    height: 3,
    backgroundColor: premiumColors.brand,
    borderRadius: 2,
  },
  listContent: {
    paddingHorizontal: premiumSpacing[16],
    paddingBottom: premiumSpacing[48],
  },
  emptyWrap: {
    marginTop: premiumSpacing[24],
    paddingHorizontal: premiumSpacing[16],
  },
  sectionHeader: {
    paddingVertical: premiumSpacing[8],
    marginBottom: premiumSpacing[8],
    marginTop: premiumSpacing[8],
    borderBottomWidth: 1,
    borderBottomColor: premiumColors.border,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: premiumColors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sectionNote: {
    fontSize: 11,
    color: premiumColors.brand,
    marginTop: 2,
  },

  // ── Card ──
  card: {
    backgroundColor: premiumColors.surface,
    borderWidth: 1,
    borderColor: premiumColors.border,
    borderRadius: premiumRadius[12],
    padding: premiumSpacing[16],
    marginBottom: premiumSpacing[16],
    flexDirection: 'row',
    alignItems: 'center',
    gap: premiumSpacing[12],
  },
  cardIcon: {
    width: 48,
    height: 48,
    borderRadius: premiumRadius[8],
    backgroundColor: premiumColors.surface2,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: premiumColors.border,
  },
  cardInfo: {
    flex: 1,
    minWidth: 0,
  },
  raceTitle: {
    color: premiumColors.text,
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4,
  },
  detailText: {
    color: premiumColors.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  highlight: {
    color: premiumColors.text,
    fontWeight: '600',
  },
  badge: {
    borderWidth: 1,
    borderRadius: premiumRadius[4],
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
  },

  // ── Finished Card ──
  cardFinished: {
    backgroundColor: premiumColors.surface,
    borderWidth: 1,
    borderColor: premiumColors.borderSoft,
    borderRadius: premiumRadius[12],
    marginBottom: premiumSpacing[16],
    overflow: 'hidden',
  },
  cardFinishedMain: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: premiumSpacing[16],
    gap: premiumSpacing[12],
  },
  iconContainerFinished: {
    width: 48,
    height: 48,
    borderRadius: premiumRadius[8],
    backgroundColor: premiumColors.success + '15',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: premiumColors.success + '30',
  },
  statusBadgeFinished: {
    backgroundColor: premiumColors.success + '15',
    borderRadius: premiumRadius[4],
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: premiumColors.success + '30',
  },
  statusBadgeFinishedText: {
    fontSize: 10,
    fontWeight: '800',
    color: premiumColors.success,
    textTransform: 'uppercase',
  },
  resultsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    backgroundColor: premiumColors.success + '10',
    borderTopWidth: 1,
    borderTopColor: premiumColors.success + '20',
  },
  resultsBtnText: {
    color: premiumColors.success,
    fontSize: 13,
    fontWeight: '800',
  },
});
