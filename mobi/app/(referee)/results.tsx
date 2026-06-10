import React, { useEffect, useState } from 'react';
import { ScrollView, View, Text, StyleSheet, TouchableOpacity, FlatList, TextInput, Alert, ActivityIndicator } from 'react-native';
import { C, Card, SectionHeader, ListItemCard, LoadingState, EmptyState, statusLabel, PrimaryButton } from '@/components/ui/shared';
import { refereeAssignmentsApi, raceChecksApi, raceResultsApi } from '@/lib/api-client';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

interface EntryRow {
  raceRegistrationId: string;
  horseId: string;
  horseName: string;
  outcome: 'finished' | 'disqualified' | 'did_not_start' | 'did_not_finish';
  incident: string;
  finishTimeSecs: string;
  rank: string;
  note: string;
}

export default function RefereeResults() {
  const [assignments, setAssignments] = useState<any[]>([]);
  const [selectedRaceId, setSelectedRaceId] = useState<string | null>(null);
  const [selectedRaceName, setSelectedRaceName] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [simulating, setSimulating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [resultsStatus, setResultsStatus] = useState('DRAFT');
  const [entryRows, setEntryRows] = useState<EntryRow[]>([]);

  const loadAssignments = async () => {
    try {
      const res = await refereeAssignmentsApi.myAssignments({ limit: 50 });
      const list = (res as any).data || res || [];
      setAssignments(list.filter((a: any) => a.status === 'accepted'));
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => {
    loadAssignments();
  }, []);

  const selectRace = async (raceId: string, raceName: string) => {
    setSelectedRaceId(raceId);
    setSelectedRaceName(raceName);
    setLoadingDetails(true);
    try {
      const checksRes = await raceChecksApi.listByRace(raceId);
      const horsesList = checksRes?.data || checksRes || [];

      const resultsRes = await raceResultsApi.getByRace(raceId);
      const existingResults = resultsRes?.data || resultsRes || [];

      if (existingResults.length > 0) {
        setResultsStatus(existingResults[0].status || 'DRAFT');
      } else {
        setResultsStatus('DRAFT');
      }

      const rows = horsesList.map((h: any) => {
        const existing = existingResults.find((r: any) => {
          const rHorseId = typeof r.horseId === 'object' ? r.horseId?._id : r.horseId;
          return rHorseId === h.horseId?._id;
        });

        return {
          raceRegistrationId: h.raceRegistrationId?._id || h.raceRegistrationId,
          horseId: h.horseId?._id,
          horseName: h.horseId?.name || 'Chiến mã',
          outcome: existing?.outcome || 'finished',
          incident: existing?.incident || 'none',
          finishTimeSecs: existing?.finishTimeMs ? (existing.finishTimeMs / 1000).toString() : '',
          rank: existing?.rank ? existing.rank.toString() : '',
          note: existing?.note || '',
        };
      });

      setEntryRows(rows);
    } catch {
      setEntryRows([]);
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleRowChange = (index: number, field: keyof EntryRow, value: any) => {
    const updated = [...entryRows];
    updated[index] = { ...updated[index], [field]: value };
    setEntryRows(updated);
  };

  const handleSimulate = async () => {
    setSimulating(true);
    try {
      await raceResultsApi.simulate(selectedRaceId!);
      Alert.alert('Thành công', 'Đã giả lập cuộc đua và xếp hạng tự động.');
      await selectRace(selectedRaceId!, selectedRaceName);
    } catch (err: any) {
      Alert.alert('Lỗi', err.message || 'Lỗi chạy giả lập.');
    } finally {
      setSimulating(false);
    }
  };

  const handleBulkSave = async () => {
    setSaving(true);
    try {
      const payloadResults = entryRows.map((row) => {
        const secs = parseFloat(row.finishTimeSecs);
        return {
          raceRegistrationId: row.raceRegistrationId,
          horseId: row.horseId,
          outcome: row.outcome,
          incident: row.incident,
          finishTimeMs: isNaN(secs) ? undefined : Math.round(secs * 1000),
          rank: row.rank ? parseInt(row.rank, 10) : undefined,
          note: row.note,
        };
      });

      await raceResultsApi.bulkSave(selectedRaceId!, payloadResults);
      Alert.alert('Thành công', 'Đã lưu kết quả nháp.');
      await selectRace(selectedRaceId!, selectedRaceName);
    } catch (err: any) {
      Alert.alert('Lỗi', err.message || 'Lỗi lưu kết quả.');
    } finally {
      setSaving(false);
    }
  };

  const handleConfirm = async () => {
    Alert.alert('Khóa kết quả', 'Bạn có chắc chắn muốn khóa kết quả cuộc đua?', [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Khóa kết quả',
        onPress: async () => {
          setConfirming(true);
          try {
            await raceResultsApi.confirm(selectedRaceId!);
            Alert.alert('Thành công', 'Trận đấu đã chính thức hoàn thành!');
            await selectRace(selectedRaceId!, selectedRaceName);
          } catch (err: any) {
            Alert.alert('Lỗi', err.message || 'Lỗi khóa kết quả.');
          } finally {
            setConfirming(false);
          }
        },
      },
    ]);
  };

  const isLocked = resultsStatus === 'CONFIRMED' || resultsStatus === 'PUBLISHED';

  if (loading) return <LoadingState />;

  if (!selectedRaceId) {
    return (
      <ScrollView style={s.c} contentContainerStyle={s.p}>
        <SectionHeader title="Chọn trận đua cần nhập kết quả" />
        {assignments.length === 0 ? (
          <EmptyState icon="sports-score" title="Chưa có nhiệm vụ đã nhận" subtitle="Vui lòng nhận phân công ở tab Phân công trước." />
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
                icon="sports-score"
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

      <View style={s.statusCard}>
        <View>
          <Text style={s.statusLabel}>TRẠNG THÁI BIÊN BẢN</Text>
          <View style={[s.statusBadge, { backgroundColor: isLocked ? '#067E6A' : '#E1A200' }]}>
            <Text style={s.statusBadgeText}>{isLocked ? 'ĐÃ XÁC NHẬN (LOCKED)' : 'BẢN NHÁP (DRAFT)'}</Text>
          </View>
        </View>
        {!isLocked && (
          <View style={s.topActions}>
            <TouchableOpacity style={[s.topActionBtn, { backgroundColor: '#E1A200' }]} onPress={handleSimulate} disabled={simulating}>
              <Text style={s.topActionBtnText}>GIẢ LẬP</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[s.topActionBtn, { backgroundColor: C.card, borderColor: C.cardBorder, borderWidth: 1 }]} onPress={handleBulkSave} disabled={saving}>
              <Text style={s.topActionBtnText}>LƯU NHÁP</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {loadingDetails ? <LoadingState /> : (
        <FlatList
          data={entryRows}
          keyExtractor={(item) => item.horseId}
          contentContainerStyle={s.p}
          ListEmptyComponent={
            <EmptyState icon="sports" title="Không có chiến mã" subtitle="Chưa có ngựa đua được xác nhận kiểm duyệt để nhập kết quả." />
          }
          renderItem={({ item, index }) => (
            <Card>
              <View style={s.cardHeader}>
                <Text style={s.horseName}>{item.horseName.toUpperCase()}</Text>
                {item.rank ? (
                  <View style={s.rankBadge}>
                    <Text style={s.rankText}>HẠNG {item.rank}</Text>
                  </View>
                ) : null}
              </View>

              <View style={s.formRow}>
                <Text style={s.label}>Thời gian (giây):</Text>
                <TextInput
                  style={[s.timeInput, isLocked && s.disabledInput]}
                  value={item.finishTimeSecs}
                  onChangeText={txt => handleRowChange(index, 'finishTimeSecs', txt)}
                  placeholder="Ví dụ: 72.45"
                  placeholderTextColor={C.textMuted}
                  keyboardType="numeric"
                  editable={!isLocked}
                />
              </View>

              <View style={s.formRow}>
                <Text style={s.label}>Trạng thái:</Text>
                <View style={s.statusChips}>
                  {['finished', 'disqualified', 'did_not_finish'].map(out => {
                    const isActive = item.outcome === out;
                    const label = out === 'finished' ? 'Về đích' : out === 'disqualified' ? 'Loại' : 'DNF';
                    return (
                      <TouchableOpacity
                        key={out}
                        style={[s.chip, isActive && s.chipActive, isLocked && s.chipLocked]}
                        onPress={() => !isLocked && handleRowChange(index, 'outcome', out)}
                        disabled={isLocked}
                      >
                        <Text style={[s.chipText, isActive && s.chipTextActive]}>{label}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            </Card>
          )}
        />
      )}

      {!isLocked && entryRows.length > 0 && (
        <TouchableOpacity style={s.confirmButton} onPress={handleConfirm} disabled={confirming}>
          <Text style={s.confirmButtonText}>XÁC NHẬN KHÓA KẾT QUẢ</Text>
        </TouchableOpacity>
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
  statusCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: C.card, borderBottomWidth: 1, borderBottomColor: C.cardBorder, padding: 16 },
  statusLabel: { color: C.textMuted, fontSize: 8, fontWeight: '800' },
  statusBadge: { borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2, marginTop: 4 },
  statusBadgeText: { color: C.white, fontSize: 8, fontWeight: '900' },
  topActions: { flexDirection: 'row', gap: 8 },
  topActionBtn: { borderRadius: 16, height: 28, paddingHorizontal: 12, alignItems: 'center', justifyContent: 'center' },
  topActionBtnText: { color: C.white, fontSize: 9, fontWeight: '900' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: C.cardBorder, paddingBottom: 8, marginBottom: 8 },
  horseName: { color: C.white, fontSize: 13, fontWeight: '800' },
  rankBadge: { backgroundColor: C.red, borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2 },
  rankText: { color: C.white, fontSize: 8, fontWeight: '900' },
  formRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 },
  label: { color: C.textSecondary, fontSize: 11, fontWeight: '700' },
  timeInput: { width: 100, backgroundColor: C.inputBg, borderWidth: 1, borderColor: C.cardBorder, color: C.white, borderRadius: 6, height: 32, paddingHorizontal: 8, fontSize: 12, textAlign: 'right' },
  disabledInput: { backgroundColor: C.card, color: C.textMuted },
  statusChips: { flexDirection: 'row', gap: 6 },
  chip: { backgroundColor: C.inputBg, borderWidth: 1, borderColor: C.cardBorder, borderRadius: 12, paddingHorizontal: 8, paddingVertical: 4 },
  chipActive: { backgroundColor: '#067E6A', borderColor: '#067E6A' },
  chipLocked: { opacity: 0.6 },
  chipText: { color: C.textSecondary, fontSize: 9, fontWeight: '800' },
  chipTextActive: { color: C.white },
  confirmButton: { backgroundColor: C.red, height: 48, alignItems: 'center', justifyContent: 'center' },
  confirmButtonText: { color: C.white, fontSize: 13, fontWeight: '900' },
});
