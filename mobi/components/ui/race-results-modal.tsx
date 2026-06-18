import React, { useEffect, useState } from 'react';
import { Modal, View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Platform } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { C, OutlineButton } from './shared';
import { raceResultsApi } from '@/lib/api-client';

interface RaceResultsModalProps {
  visible: boolean;
  onClose: () => void;
  raceId: string | null;
  raceName: string | null;
}

export default function RaceResultsModal({ visible, onClose, raceId, raceName }: RaceResultsModalProps) {
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (visible && raceId) {
      const fetchResults = async () => {
        setLoading(true);
        setError(null);
        try {
          const res = await raceResultsApi.getByRace(raceId);
          const rawResults = res.data || res || [];
          // Sort by rank ascending
          const sorted = [...rawResults].sort((a: any, b: any) => {
            const rA = a.rank ?? 999;
            const rB = b.rank ?? 999;
            return rA - rB;
          });
          setResults(sorted);
        } catch (err: any) {
          setError(err.message || 'Không thể tải kết quả trận đua.');
        } finally {
          setLoading(false);
        }
      };
      fetchResults();
    } else {
      setResults([]);
    }
  }, [visible, raceId]);

  const formatTime = (ms?: number) => {
    if (!ms) return '—';
    const totalSeconds = ms / 1000;
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = (totalSeconds % 60).toFixed(2);
    return `${minutes}:${seconds.padStart(5, '0')}`;
  };

  const getRankBadge = (rank?: number) => {
    if (rank === 1) return { text: '🥇', bg: 'rgba(245, 158, 11, 0.15)', textCol: '#F59E0B' };
    if (rank === 2) return { text: '🥈', bg: 'rgba(156, 163, 175, 0.15)', textCol: '#9CA3AF' };
    if (rank === 3) return { text: '🥉', bg: 'rgba(205, 127, 50, 0.15)', textCol: '#CD7F32' };
    return { text: `#${rank || '—'}`, bg: 'rgba(255, 255, 255, 0.05)', textCol: '#AEB6C2' };
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={s.overlay}>
        <View style={s.content}>
          <View style={s.header}>
            <View style={s.headerTitleWrap}>
              <MaterialIcons name="emoji-events" size={22} color={C.red} />
              <View>
                <Text style={s.title}>Kết Quả Trận Đua</Text>
                <Text style={s.subtitle} numberOfLines={1}>{raceName || 'Chi tiết kết quả xếp hạng'}</Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} activeOpacity={0.8} style={s.closeBtn}>
              <MaterialIcons name="close" size={24} color="#AEB6C2" />
            </TouchableOpacity>
          </View>

          {loading ? (
            <View style={s.center}>
              <ActivityIndicator size="large" color={C.red} />
              <Text style={s.loadingText}>Đang tải bảng điểm...</Text>
            </View>
          ) : error ? (
            <View style={s.center}>
              <MaterialIcons name="error-outline" size={40} color="#EF4444" />
              <Text style={[s.loadingText, { color: '#EF4444' }]}>{error}</Text>
              <TouchableOpacity style={s.retryBtn} onPress={() => onClose()}>
                <Text style={s.retryText}>Đóng</Text>
              </TouchableOpacity>
            </View>
          ) : results.length === 0 ? (
            <View style={s.center}>
              <MaterialIcons name="flag" size={40} color="#AEB6C2" />
              <Text style={s.loadingText}>Chưa có kết quả chính thức cho trận đấu này.</Text>
            </View>
          ) : (
            <ScrollView style={s.list} showsVerticalScrollIndicator={false}>
              {results.map((res, index) => {
                const badge = getRankBadge(res.rank || index + 1);
                const horseName = typeof res.horseId === 'object' ? res.horseId?.name : 'Chiến mã';
                const breed = typeof res.horseId === 'object' ? res.horseId?.breed : 'Chưa rõ';
                const jockeyName = typeof res.jockeyUserId === 'object' ? res.jockeyUserId?.fullName : 'Nài ngựa';

                return (
                  <View key={res._id || res.id || index} style={[s.itemCard, res.rank === 1 && s.itemCardFirst]}>
                    <View style={[s.rankBadge, { backgroundColor: badge.bg }]}>
                      <Text style={[s.rankText, { color: badge.textCol }]}>{badge.text}</Text>
                    </View>

                    <View style={s.details}>
                      <Text style={s.horseName} numberOfLines={1}>🐴 {horseName}</Text>
                      <Text style={s.jockeyName} numberOfLines={1}>🏇 Nài: {jockeyName}</Text>
                      {breed && breed !== 'Chưa rõ' ? <Text style={s.breedText}>{breed}</Text> : null}
                    </View>

                    <View style={s.rightCol}>
                      <Text style={s.timeText}>⏱️ {res.outcome === 'finished' ? formatTime(res.finishTimeMs) : 'DNF'}</Text>
                      {res.points != null && (
                        <Text style={s.pointsText}>+{res.points} Pts</Text>
                      )}
                      {res.incident && res.incident !== 'NONE' ? (
                        <View style={s.violationBadge}>
                          <Text style={s.violationText} numberOfLines={1}>⚠️ {res.note || res.incident}</Text>
                        </View>
                      ) : null}
                    </View>
                  </View>
                );
              })}
            </ScrollView>
          )}

          <View style={s.footer}>
            <OutlineButton title="Đóng" onPress={onClose} />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'flex-end',
  },
  content: {
    backgroundColor: '#11141B',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  subtitle: {
    color: '#AEB6C2',
    fontSize: 12,
    marginTop: 2,
  },
  closeBtn: {
    padding: 4,
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    gap: 12,
  },
  loadingText: {
    color: '#AEB6C2',
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
  retryBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#202633',
    borderRadius: 8,
  },
  retryText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  list: {
    marginVertical: 8,
  },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#171B24',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.03)',
    borderRadius: 14,
    padding: 12,
    marginBottom: 8,
    gap: 12,
  },
  itemCardFirst: {
    borderColor: 'rgba(245, 158, 11, 0.25)',
    backgroundColor: 'rgba(245, 158, 11, 0.02)',
  },
  rankBadge: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankText: {
    fontSize: 14,
    fontWeight: '900',
  },
  details: {
    flex: 1,
    gap: 3,
  },
  horseName: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  jockeyName: {
    color: '#AEB6C2',
    fontSize: 11,
    fontWeight: '600',
  },
  breedText: {
    color: '#6F7785',
    fontSize: 10,
  },
  rightCol: {
    alignItems: 'flex-end',
    gap: 4,
  },
  timeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  pointsText: {
    color: '#34D399',
    fontSize: 11,
    fontWeight: '800',
  },
  violationBadge: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    maxWidth: 100,
  },
  violationText: {
    color: '#EF4444',
    fontSize: 9,
    fontWeight: '700',
  },
  footer: {
    marginTop: 12,
  },
});
