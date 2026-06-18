import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, TextInput, Alert, ActivityIndicator } from 'react-native';
import { AppScreen, Section } from '@/components/ui/premium';
import { premiumColors, premiumSpacing, premiumRadius } from '@/components/ui/premium-tokens';
import { LoadingState, EmptyState } from '@/components/ui/shared';
import { refereeAssignmentsApi, raceChecksApi } from '@/lib/api-client';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

export default function RefereePreRace() {
  const [assignments, setAssignments] = useState<any[]>([]);
  const [selectedRaceId, setSelectedRaceId] = useState<string | null>(null);
  const [selectedRaceName, setSelectedRaceName] = useState<string>('');
  const [checks, setChecks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingChecks, setLoadingChecks] = useState(false);
  const [failNotes, setFailNotes] = useState<Record<string, string>>({});
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadAssignments = useCallback(async () => {
    try {
      const res = await refereeAssignmentsApi.myAssignments({ limit: 50 });
      const list = (res as any).data || res || [];
      // Only show accepted assignments
      setAssignments(list.filter((a: any) => a.status === 'accepted'));
    } catch {} finally { setLoading(false); }
  }, []);

  useEffect(() => {
    loadAssignments();
  }, [loadAssignments]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    if (!selectedRaceId) {
      await loadAssignments();
    } else {
      await selectRace(selectedRaceId, selectedRaceName);
    }
    setRefreshing(false);
  }, [selectedRaceId, selectedRaceName, loadAssignments]);

  const selectRace = async (raceId: string, raceName: string) => {
    setSelectedRaceId(raceId);
    setSelectedRaceName(raceName);
    setLoadingChecks(true);
    try {
      const checksRes = await raceChecksApi.listByRace(raceId);
      setChecks(checksRes.data || checksRes || []);
    } catch {
      setChecks([]);
    } finally {
      setLoadingChecks(false);
    }
  };

  const handleUpdateCheck = async (checkId: string, status: 'passed' | 'failed') => {
    const notes = status === 'failed' ? failNotes[checkId] || 'Không đạt chuẩn sức khỏe' : undefined;
    setUpdatingId(checkId);
    try {
      await raceChecksApi.update(checkId, { status, healthNote: notes, jockeyCheckedIn: true });
      Alert.alert('Thành công', 'Đã cập nhật trạng thái kiểm tra.');
      // Refresh checks
      if (selectedRaceId) {
        const checksRes = await raceChecksApi.listByRace(selectedRaceId);
        setChecks(checksRes.data || checksRes || []);
      }
    } catch (err: any) {
      Alert.alert('Lỗi', err.message || 'Lỗi cập nhật trạng thái.');
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading && !refreshing) return <LoadingState />;

  if (!selectedRaceId) {
    return (
      <AppScreen scroll refreshing={refreshing} onRefresh={onRefresh}>
        <View style={s.content}>
          <Section title="Chọn trận đua cần điểm danh / kiểm tra">
            {assignments.length === 0 ? (
              <EmptyState icon="checklist" title="Chưa có nhiệm vụ đã nhận" subtitle="Vui lòng nhận phân công ở tab Phân công trước." />
            ) : (
              assignments.map(a => {
                const race = a.raceId;
                if (!race) return null;
                return (
                  <TouchableOpacity
                    key={a._id || a.id}
                    style={s.assignmentCard}
                    onPress={() => selectRace(race._id || race.id, race.name)}
                    activeOpacity={0.8}
                  >
                    <View style={s.cardIconWrap}>
                      <MaterialIcons name="checklist" size={20} color={premiumColors.brand} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={s.assignmentTitle} numberOfLines={1}>{race.name}</Text>
                      <Text style={s.assignmentSubtitle} numberOfLines={1}>Trạng thái: {race.status}</Text>
                    </View>
                    <MaterialIcons name="chevron-right" size={20} color={premiumColors.textMuted} />
                  </TouchableOpacity>
                );
              })
            )}
          </Section>
        </View>
      </AppScreen>
    );
  }

  return (
    <AppScreen refreshing={refreshing} onRefresh={onRefresh}>
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => setSelectedRaceId(null)} activeOpacity={0.8}>
          <MaterialIcons name="arrow-back" size={20} color={premiumColors.textSecondary} />
          <Text style={s.backTxt}>Quay lại</Text>
        </TouchableOpacity>
        <Text style={s.headerTitle} numberOfLines={1}>{selectedRaceName.toUpperCase()}</Text>
      </View>

      {loadingChecks && !refreshing ? <LoadingState /> : (
        <FlatList
          data={checks}
          keyExtractor={(item) => item._id || item.id}
          contentContainerStyle={s.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <EmptyState icon="pets" title="Chưa chốt danh sách ngựa" subtitle="Cuộc đua này chưa có danh sách chiến mã tham gia." />
          }
          renderItem={({ item }) => {
            const horse = item.horseId;
            if (!horse) return null;
            const isUpdating = updatingId === (item._id || item.id);
            const isPassed = item.status === 'passed';
            const isFailed = item.status === 'failed';
            
            return (
              <View style={s.checkCard}>
                <View style={s.cardHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={s.horseName}>{horse.name.toUpperCase()}</Text>
                    <Text style={s.jockeyName}>Nài ngựa: {item.jockeyUserId?.fullName || 'Chưa gán'}</Text>
                  </View>
                  <View style={[
                    s.badge,
                    isPassed && s.badgePassed,
                    isFailed && s.badgeFailed
                  ]}>
                    <Text style={[
                      s.badgeText,
                      isPassed && s.badgeTextPassed,
                      isFailed && s.badgeTextFailed
                    ]}>
                      {isPassed ? 'ĐẠT CHUẨN' : isFailed ? 'BỊ LOẠI' : 'CHƯA CHECK'}
                    </Text>
                  </View>
                </View>

                {isUpdating ? <ActivityIndicator color={premiumColors.brand} style={{ marginVertical: 12 }} /> : (
                  <View style={s.actionRow}>
                    {!isPassed && (
                      <TouchableOpacity 
                        style={[s.btn, s.btnPass]} 
                        onPress={() => handleUpdateCheck(item._id || item.id, 'passed')}
                        activeOpacity={0.8}
                      >
                        <Text style={s.btnTxt}>ĐẠT CHUẨN</Text>
                      </TouchableOpacity>
                    )}
                    {!isFailed && (
                      <View style={s.failContainer}>
                        <TextInput
                          style={s.input}
                          placeholder="Lý do loại..."
                          placeholderTextColor={premiumColors.textMuted}
                          value={failNotes[item._id || item.id] || ''}
                          onChangeText={txt => setFailNotes({ ...failNotes, [item._id || item.id]: txt })}
                        />
                        <TouchableOpacity 
                          style={[s.btn, s.btnFail]} 
                          onPress={() => handleUpdateCheck(item._id || item.id, 'failed')}
                          activeOpacity={0.8}
                        >
                          <Text style={s.btnTxt}>LOẠI</Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                )}
              </View>
            );
          }}
        />
      )}
    </AppScreen>
  );
}

const s = StyleSheet.create({
  content: {
    paddingHorizontal: premiumSpacing[16],
    paddingTop: premiumSpacing[16],
    paddingBottom: premiumSpacing[48],
  },
  listContent: {
    padding: premiumSpacing[16],
    paddingBottom: premiumSpacing[48],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    backgroundColor: premiumColors.headerBg,
    borderBottomWidth: 1,
    borderBottomColor: premiumColors.headerBorder,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: premiumColors.surface2,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: premiumRadius[8],
    borderWidth: 1,
    borderColor: premiumColors.borderSoft,
  },
  backTxt: {
    color: premiumColors.textSecondary,
    fontSize: 12,
    fontWeight: '700',
  },
  headerTitle: {
    color: premiumColors.text,
    fontSize: 14,
    fontWeight: '900',
    flex: 1,
  },
  assignmentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: premiumColors.surface,
    borderWidth: 1,
    borderColor: premiumColors.border,
    borderRadius: premiumRadius[12],
    padding: 16,
    marginBottom: 12,
  },
  cardIconWrap: {
    width: 44,
    height: 44,
    borderRadius: premiumRadius[8],
    backgroundColor: 'rgba(225, 6, 0, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  assignmentTitle: {
    color: premiumColors.text,
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 4,
  },
  assignmentSubtitle: {
    color: premiumColors.textSecondary,
    fontSize: 12,
  },
  checkCard: {
    backgroundColor: premiumColors.surface,
    borderWidth: 1,
    borderColor: premiumColors.border,
    borderRadius: premiumRadius[12],
    padding: 16,
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottomWidth: 1,
    borderBottomColor: premiumColors.border,
    paddingBottom: 12,
    marginBottom: 12,
  },
  horseName: {
    color: premiumColors.text,
    fontSize: 14,
    fontWeight: '800',
  },
  jockeyName: {
    color: premiumColors.textSecondary,
    fontSize: 12,
    marginTop: 4,
  },
  badge: {
    borderRadius: premiumRadius[4],
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: premiumColors.surface2,
  },
  badgePassed: {
    backgroundColor: 'rgba(52, 211, 153, 0.15)',
  },
  badgeFailed: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '900',
    color: premiumColors.textSecondary,
  },
  badgeTextPassed: {
    color: premiumColors.success,
  },
  badgeTextFailed: {
    color: premiumColors.danger,
  },
  actionRow: {
    flexDirection: 'column',
    gap: 12,
  },
  failContainer: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  btn: {
    height: 44,
    borderRadius: premiumRadius[8],
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  btnPass: {
    backgroundColor: premiumColors.success,
  },
  btnFail: {
    backgroundColor: premiumColors.danger,
  },
  btnTxt: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  input: {
    flex: 1,
    backgroundColor: premiumColors.surface2,
    borderWidth: 1,
    borderColor: premiumColors.border,
    color: premiumColors.text,
    borderRadius: premiumRadius[8],
    height: 44,
    paddingHorizontal: 12,
    fontSize: 13,
  },
  c: { flex: 1, backgroundColor: C.bg }, p: { padding: 16, paddingBottom: 110 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16, backgroundColor: C.card, borderBottomWidth: 1, borderBottomColor: C.cardBorder },
  backBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  backTxt: { color: C.white, fontSize: 13, fontWeight: '700' },
  headerTitle: { color: C.white, fontSize: 14, fontWeight: '900', flex: 1 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: C.cardBorder, paddingBottom: 10, marginBottom: 12 },
  horseName: { color: C.white, fontSize: 14, fontWeight: '800' },
  jockeyName: { color: C.textSecondary, fontSize: 11, marginTop: 2 },
  badge: { borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2 },
  badgeText: { fontSize: 8, fontWeight: '900' },
  actionRow: { flexDirection: 'row', gap: 8, marginTop: 4, alignItems: 'center' },
  btn: { height: 32, borderRadius: 6, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 12 },
  btnPass: { backgroundColor: '#067E6A' },
  btnFail: { backgroundColor: '#E10600' },
  btnTxt: { color: C.white, fontSize: 10, fontWeight: '800' },
  input: { flex: 1, backgroundColor: C.inputBg, borderWidth: 1, borderColor: C.cardBorder, color: C.white, borderRadius: 6, height: 32, paddingHorizontal: 8, fontSize: 11 },
});
