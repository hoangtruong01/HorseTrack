import React, { useEffect, useState } from 'react';
import { ScrollView, View, Text, StyleSheet, TouchableOpacity, FlatList, TextInput, Alert, ActivityIndicator } from 'react-native';
import { C, Card, SectionHeader, ListItemCard, LoadingState, EmptyState, statusLabel, PrimaryButton } from '@/components/ui/shared';
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

  const loadAssignments = async () => {
    try {
      const res = await refereeAssignmentsApi.myAssignments({ limit: 50 });
      const list = (res as any).data || res || [];
      // Only show accepted assignments
      setAssignments(list.filter((a: any) => a.status === 'accepted'));
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => {
    loadAssignments();
  }, []);

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

  if (loading) return <LoadingState />;

  if (!selectedRaceId) {
    return (
      <ScrollView style={s.c} contentContainerStyle={s.p}>
        <SectionHeader title="Chọn trận đua cần điểm danh / kiểm tra" />
        {assignments.length === 0 ? (
          <EmptyState icon="checklist" title="Chưa có nhiệm vụ đã nhận" subtitle="Vui lòng nhận phân công ở tab Phân công trước." />
        ) : (
          assignments.map(a => {
            const race = a.raceId;
            if (!race) return null;
            return (
              <ListItemCard
                key={a._id}
                title={race.name}
                subtitle={`Trạng thái: ${race.status}`}
                onPress={() => selectRace(race._id, race.name)}
                icon="checklist"
              />
            );
          })
        )}
      </ScrollView>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => setSelectedRaceId(null)}>
          <MaterialIcons name="arrow-back" size={20} color={C.white} />
          <Text style={s.backTxt}>Quay lại</Text>
        </TouchableOpacity>
        <Text style={s.headerTitle} numberOfLines={1}>{selectedRaceName.toUpperCase()}</Text>
      </View>

      {loadingChecks ? <LoadingState /> : (
        <FlatList
          data={checks}
          keyExtractor={(item) => item._id}
          contentContainerStyle={s.p}
          ListEmptyComponent={
            <EmptyState icon="pets" title="Chưa chốt danh sách ngựa" subtitle="Cuộc đua này chưa có danh sách chiến mã tham gia." />
          }
          renderItem={({ item }) => {
            const horse = item.horseId;
            if (!horse) return null;
            const isUpdating = updatingId === item._id;
            return (
              <Card>
                <View style={s.cardHeader}>
                  <View>
                    <Text style={s.horseName}>{horse.name.toUpperCase()}</Text>
                    <Text style={s.jockeyName}>Nài ngựa: {item.jockeyUserId?.fullName || 'Chưa gán'}</Text>
                  </View>
                  <View style={[s.badge, { backgroundColor: item.status === 'passed' ? '#067E6A20' : item.status === 'failed' ? '#E1060020' : '#58585B20' }]}>
                    <Text style={[s.badgeText, { color: item.status === 'passed' ? '#067E6A' : item.status === 'failed' ? '#E10600' : C.textSecondary }]}>
                      {item.status === 'passed' ? 'ĐẠT CHUẨN' : item.status === 'failed' ? 'BỊ LOẠI' : 'CHƯA CHECK'}
                    </Text>
                  </View>
                </View>

                {isUpdating ? <ActivityIndicator color={C.red} style={{ marginTop: 12 }} /> : (
                  <View style={s.actionRow}>
                    {item.status !== 'passed' && (
                      <TouchableOpacity style={[s.btn, s.btnPass]} onPress={() => handleUpdateCheck(item._id, 'passed')}>
                        <Text style={s.btnTxt}>ĐẠT CHUẨN</Text>
                      </TouchableOpacity>
                    )}
                    {item.status !== 'failed' && (
                      <View style={{ flex: 1, flexDirection: 'row', gap: 8 }}>
                        <TextInput
                          style={s.input}
                          placeholder="Lý do..."
                          placeholderTextColor={C.textMuted}
                          value={failNotes[item._id] || ''}
                          onChangeText={txt => setFailNotes({ ...failNotes, [item._id]: txt })}
                        />
                        <TouchableOpacity style={[s.btn, s.btnFail]} onPress={() => handleUpdateCheck(item._id, 'failed')}>
                          <Text style={s.btnTxt}>LOẠI</Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                )}
              </Card>
            );
          }}
        />
      )}
    </View>
  );
}

const s = StyleSheet.create({
  c: { flex: 1, backgroundColor: C.bg }, p: { padding: 16, paddingBottom: 32 },
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
