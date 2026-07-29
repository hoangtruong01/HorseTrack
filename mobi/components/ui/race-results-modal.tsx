import React, { useEffect, useState } from 'react';
import { Modal, View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Platform } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { OutlineButton } from './shared';
import { raceResultsApi } from '@/lib/api-client';
import { premiumColors, premiumSpacing, premiumRadius, usePremiumColors } from '@/components/ui/premium-tokens';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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

  const isDark = useColorScheme() === 'dark';
  const pc = usePremiumColors();
  const insets = useSafeAreaInsets();
  const s = React.useMemo(() => getStyles(isDark, pc, insets), [isDark, pc, insets]);

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
    if (rank === 1) return { icon: 'emoji-events', bg: pc.warning + '15', iconCol: pc.warning, isIcon: true };
    if (rank === 2) return { icon: 'emoji-events', bg: pc.textMuted + '15', iconCol: pc.textMuted, isIcon: true };
    if (rank === 3) return { icon: 'emoji-events', bg: pc.brand + '15', iconCol: pc.brand, isIcon: true };
    return { text: `#${rank || '—'}`, bg: pc.surface2, textCol: pc.textSecondary, isIcon: false };
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={s.overlay}>
        <View style={s.content}>
          <View style={s.header}>
            <View style={s.headerTitleWrap}>
              <View style={s.headerIconBox}>
                <MaterialIcons name="emoji-events" size={24} color={pc.brand} />
              </View>
              <View style={s.headerTextCol}>
                <Text style={s.title}>Kết Quả Trận Đua</Text>
                <Text style={s.subtitle} numberOfLines={1}>{raceName || 'Chi tiết kết quả xếp hạng'}</Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} activeOpacity={0.8} style={s.closeBtn} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <MaterialIcons name="close" size={24} color={pc.textSecondary} />
            </TouchableOpacity>
          </View>

          {loading ? (
            <View style={s.center}>
              <ActivityIndicator size="large" color={pc.brand} />
              <Text style={s.loadingText}>Đang tải bảng điểm...</Text>
            </View>
          ) : error ? (
            <View style={s.center}>
              <MaterialIcons name="error-outline" size={48} color={pc.danger} />
              <Text style={[s.loadingText, { color: pc.danger, marginTop: premiumSpacing[8] }]}>{error}</Text>
              <View style={{ marginTop: premiumSpacing[16], width: '50%' }}>
                <OutlineButton title="Đóng" onPress={onClose} />
              </View>
            </View>
          ) : results.length === 0 ? (
            <View style={s.center}>
              <MaterialIcons name="flag" size={48} color={pc.textMuted} />
              <Text style={[s.loadingText, { marginTop: premiumSpacing[8] }]}>Chưa có kết quả chính thức cho trận đấu này.</Text>
            </View>
          ) : (
            <ScrollView style={s.list} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: premiumSpacing[16] }}>
              {results.map((res, index) => {
                const badge = getRankBadge(res.rank || index + 1);
                const horseName = typeof res.horseId === 'object' ? res.horseId?.name : 'Chiến mã';
                const breed = typeof res.horseId === 'object' ? res.horseId?.breed : 'Chưa rõ';
                const jockeyName = typeof res.jockeyUserId === 'object' ? res.jockeyUserId?.fullName : 'Nài ngựa';
                const isFirst = res.rank === 1;

                return (
                  <View key={res._id || res.id || index} style={[s.itemCard, isFirst && s.itemCardFirst]}>
                    <View style={[s.rankBadge, { backgroundColor: badge.bg }]}>
                      {badge.isIcon ? (
                        <MaterialIcons name={badge.icon as any} size={22} color={badge.iconCol} />
                      ) : (
                        <Text style={[s.rankText, { color: badge.textCol }]}>{badge.text}</Text>
                      )}
                    </View>

                    <View style={s.details}>
                      <View style={s.infoRow}>
                        <MaterialIcons name="pets" size={14} color={isFirst ? pc.warning : pc.textSecondary} />
                        <Text style={[s.horseName, isFirst && s.horseNameFirst]} numberOfLines={1}>{horseName}</Text>
                      </View>
                      <View style={s.infoRow}>
                        <MaterialIcons name="person" size={14} color={pc.textMuted} />
                        <Text style={s.jockeyName} numberOfLines={1}>Nài: {jockeyName}</Text>
                      </View>
                      {breed && breed !== 'Chưa rõ' ? <Text style={s.breedText}>{breed}</Text> : null}
                    </View>

                    <View style={s.rightCol}>
                      <View style={s.infoRowRight}>
                        <MaterialIcons name="timer" size={14} color={pc.textSecondary} />
                        <Text style={s.timeText}>{res.outcome === 'finished' ? formatTime(res.finishTimeMs) : 'DNF'}</Text>
                      </View>
                      {res.points != null && (
                        <View style={s.pointsBadge}>
                          <Text style={s.pointsText}>+{res.points} Pts</Text>
                        </View>
                      )}
                      {res.incident && res.incident !== 'NONE' ? (
                        <View style={s.violationBadge}>
                          <MaterialIcons name="warning" size={12} color={pc.danger} style={{ marginRight: 4 }} />
                          <Text style={s.violationText} numberOfLines={1}>{res.note || res.incident}</Text>
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

const getStyles = (isDark: boolean, pc: any, insets: any) => StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: isDark ? 'rgba(0, 0, 0, 0.75)' : 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  content: {
    backgroundColor: pc.surface,
    borderTopLeftRadius: premiumRadius[24],
    borderTopRightRadius: premiumRadius[24],
    paddingHorizontal: premiumSpacing[16],
    paddingTop: premiumSpacing[24],
    paddingBottom: Math.max(insets.bottom, premiumSpacing[24]),
    maxHeight: '85%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: premiumSpacing[24],
  },
  headerTitleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: premiumSpacing[12],
    flex: 1,
  },
  headerIconBox: {
    width: 48,
    height: 48,
    borderRadius: premiumRadius[12],
    backgroundColor: pc.brand + '15',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTextCol: {
    flex: 1,
  },
  title: {
    color: pc.text,
    fontSize: 18,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  subtitle: {
    color: pc.textSecondary,
    fontSize: 13,
    marginTop: 2,
  },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: premiumRadius[20],
    backgroundColor: pc.surface2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: premiumSpacing[48],
    paddingHorizontal: premiumSpacing[24],
  },
  loadingText: {
    color: pc.textSecondary,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: premiumSpacing[12],
  },
  list: {
    flexGrow: 0,
  },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: pc.bg,
    borderWidth: 1,
    borderColor: pc.borderSoft,
    borderRadius: premiumRadius[16],
    padding: premiumSpacing[16],
    marginBottom: premiumSpacing[12],
    gap: premiumSpacing[12],
  },
  itemCardFirst: {
    borderColor: pc.warning + '40',
    backgroundColor: pc.warning + '10',
    borderWidth: 1.5,
  },
  rankBadge: {
    width: 44,
    height: 44,
    borderRadius: premiumRadius[12],
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankText: {
    fontSize: 16,
    fontWeight: '900',
  },
  details: {
    flex: 1,
    gap: premiumSpacing[4],
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: premiumSpacing[4],
  },
  infoRowRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: premiumSpacing[4],
    justifyContent: 'flex-end',
  },
  horseName: {
    color: pc.text,
    fontSize: 15,
    fontWeight: '800',
    flexShrink: 1,
  },
  horseNameFirst: {
    color: pc.warning,
  },
  jockeyName: {
    color: pc.textSecondary,
    fontSize: 12,
    fontWeight: '600',
    flexShrink: 1,
  },
  breedText: {
    color: pc.textMuted,
    fontSize: 11,
    marginTop: 2,
  },
  rightCol: {
    alignItems: 'flex-end',
    gap: premiumSpacing[4],
  },
  timeText: {
    color: pc.text,
    fontSize: 13,
    fontWeight: '800',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  pointsBadge: {
    backgroundColor: pc.success + '15',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: premiumRadius[4],
  },
  pointsText: {
    color: pc.success,
    fontSize: 11,
    fontWeight: '900',
  },
  violationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: pc.danger + '15',
    borderRadius: premiumRadius[4],
    paddingHorizontal: 6,
    paddingVertical: 4,
    maxWidth: 110,
  },
  violationText: {
    color: pc.danger,
    fontSize: 10,
    fontWeight: '700',
    flexShrink: 1,
  },
  footer: {
    marginTop: premiumSpacing[8],
    borderTopWidth: 1,
    borderTopColor: pc.borderSoft,
    paddingTop: premiumSpacing[16],
  },
});
