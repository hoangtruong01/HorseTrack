import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, ActivityIndicator, Alert, TextInput, SafeAreaView } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { raceChecksApi, raceResultsApi, racesApi, type RaceItem } from '../../../lib/api-client';
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

export default function ResultEntryScreen() {
  const { raceId } = useLocalSearchParams<{ raceId: string }>();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [simulating, setSimulating] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [resultsStatus, setResultsStatus] = useState('DRAFT');

  const [entryRows, setEntryRows] = useState<EntryRow[]>([]);

  const loadData = async () => {
    if (!raceId) return;
    try {
      // 1. Fetch race info
      await racesApi.get(raceId);

      // 2. Fetch approved horses
      const checksRes = await raceChecksApi.listByRace(raceId);
      const horsesList = checksRes?.data || checksRes || [];

      // 3. Fetch existing results
      const resultsRes = await raceResultsApi.getByRace(raceId);
      const existingResults = resultsRes?.data || resultsRes || [];

      if (existingResults.length > 0) {
        setResultsStatus(existingResults[0].status || 'DRAFT');
      } else {
        setResultsStatus('DRAFT');
      }

      // 4. Map or initialize blank rows
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
    } catch (err) {
      console.error('Lỗi tải dữ liệu nhập kết quả:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [raceId]);

  const handleRowChange = (index: number, field: keyof EntryRow, value: any) => {
    const updated = [...entryRows];
    updated[index] = {
      ...updated[index],
      [field]: value,
    };
    setEntryRows(updated);
  };

  const handleSimulate = async () => {
    setSimulating(true);
    try {
      await raceResultsApi.simulate(raceId!);
      Alert.alert('Thành công', 'Đã giả lập cuộc đua và xếp hạng tự động.');
      await loadData();
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

      await raceResultsApi.bulkSave(raceId!, payloadResults);
      Alert.alert('Thành công', 'Đã lưu kết quả nháp và xếp hạng tự động.');
      await loadData();
    } catch (err: any) {
      Alert.alert('Thất bại', err.message || 'Lỗi lưu nháp.');
    } finally {
      setSaving(false);
    }
  };

  const handleConfirm = async () => {
    Alert.alert(
      'Khóa kết quả',
      'Bạn có chắc chắn muốn khóa kết quả? Sau khi khóa, dữ liệu sẽ không thể chỉnh sửa và hệ thống sẽ bắt đầu chia điểm thưởng.',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Khóa kết quả',
          style: 'destructive',
          onPress: async () => {
            setConfirming(true);
            try {
              await raceResultsApi.confirm(raceId!);
              Alert.alert('Khóa thành công', 'Trận đấu đã chính thức hoàn thành!');
              await loadData();
            } catch (err: any) {
              Alert.alert('Lỗi', err.message || 'Không thể khóa kết quả.');
            } finally {
              setConfirming(false);
            }
          },
        },
      ]
    );
  };

  const isLocked = resultsStatus === 'CONFIRMED' || resultsStatus === 'PUBLISHED';

  const renderItem = ({ item, index }: { item: EntryRow; index: number }) => {
    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.horseName}>{item.horseName.toUpperCase()}</Text>
          {item.rank ? (
            <View style={styles.rankBadge}>
              <Text style={styles.rankText}>HẠNG {item.rank}</Text>
            </View>
          ) : null}
        </View>

        <View style={styles.formRow}>
          <Text style={styles.label}>THỜI GIAN (GIÂY):</Text>
          <TextInput
            style={[styles.timeInput, isLocked && styles.disabledInput]}
            value={item.finishTimeSecs}
            onChangeText={(txt) => handleRowChange(index, 'finishTimeSecs', txt)}
            placeholder="Ví dụ: 72.45"
            placeholderTextColor="#58585B"
            keyboardType="numeric"
            editable={!isLocked}
          />
        </View>

        <View style={styles.formRow}>
          <Text style={styles.label}>TRẠNG THÁI:</Text>
          <View style={styles.statusChips}>
            {['finished', 'disqualified', 'did_not_finish'].map((out) => {
              const isActive = item.outcome === out;
              const label = out === 'finished' ? 'Về đích' : out === 'disqualified' ? 'Loại' : 'DNF';
              return (
                <TouchableOpacity
                  key={out}
                  style={[
                    styles.chip,
                    isActive && styles.chipActive,
                    isLocked && styles.chipLocked
                  ]}
                  onPress={() => !isLocked && handleRowChange(index, 'outcome', out)}
                  disabled={isLocked}
                >
                  <Text style={[styles.chipText, isActive && styles.chipTextActive]}>{label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={styles.formRow}>
          <Text style={styles.label}>GHI CHÚ:</Text>
          <TextInput
            style={[styles.noteInput, isLocked && styles.disabledInput]}
            value={item.note}
            onChangeText={(txt) => handleRowChange(index, 'note', txt)}
            placeholder="Lỗi kỹ thuật, va chạm..."
            placeholderTextColor="#58585B"
            editable={!isLocked}
          />
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#E10600" />
        <Text style={styles.loadingText}>Đang tải danh sách kết quả...</Text>
      </View>
    );
  }

  const getStatusTextBadge = () => {
    switch (resultsStatus) {
      case 'CONFIRMED': return 'ĐÃ XÁC NHẬN (LOCKED)';
      case 'PUBLISHED': return 'ĐÃ CÔNG BỐ (LOCKED)';
      default: return 'BẢN NHÁP (DRAFT)';
    }
  };

  const getStatusColorBadge = () => {
    switch (resultsStatus) {
      case 'CONFIRMED':
      case 'PUBLISHED':
        return '#067E6A';
      default:
        return '#E1A200';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Controller Bar */}
      <View style={styles.statusCard}>
        <View>
          <Text style={styles.statusLabel}>TRẠNG THÁI BIÊN BẢN</Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColorBadge() }]}>
            <Text style={styles.statusBadgeText}>{getStatusTextBadge()}</Text>
          </View>
        </View>

        {!isLocked && (
          <View style={styles.topActions}>
            <TouchableOpacity 
              style={[styles.topActionBtn, { backgroundColor: '#E1A200' }, simulating && styles.disabledBtn]}
              onPress={handleSimulate}
              disabled={simulating || saving || confirming}
            >
              {simulating ? <ActivityIndicator size="small" color="#FFFFFF" /> : <Text style={styles.topActionBtnText}>GIẢ LẬP</Text>}
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.topActionBtn, { backgroundColor: '#15151E', borderColor: '#303037', borderWidth: 1 }, saving && styles.disabledBtn]}
              onPress={handleBulkSave}
              disabled={simulating || saving || confirming}
            >
              {saving ? <ActivityIndicator size="small" color="#FFFFFF" /> : <Text style={styles.topActionBtnText}>LƯU NHÁP</Text>}
            </TouchableOpacity>
          </View>
        )}
      </View>

      <FlatList
        data={entryRows}
        renderItem={renderItem}
        keyExtractor={(item) => item.horseId}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialIcons name="sports" size={40} color="#58585B" />
            <Text style={styles.emptyText}>Chưa có ngựa đua được xác nhận kiểm duyệt để nhập kết quả.</Text>
          </View>
        }
      />

      {!isLocked && entryRows.length > 0 && (
        <TouchableOpacity 
          style={[styles.confirmButton, confirming && styles.disabledBtn]}
          onPress={handleConfirm}
          disabled={confirming}
        >
          {confirming ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <Text style={styles.confirmButtonText}>XÁC NHẬN KHÓA KẾT QUẢ</Text>
          )}
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1C1C25',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#1C1C25',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: '#AAAAAA',
    fontSize: 14,
    marginTop: 12,
  },
  statusCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#15151E',
    borderBottomWidth: 1,
    borderBottomColor: '#303037',
    padding: 16,
  },
  statusLabel: {
    color: '#58585B',
    fontSize: 9,
    fontWeight: '800',
    marginBottom: 4,
  },
  statusBadge: {
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  statusBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '900',
  },
  topActions: {
    flexDirection: 'row',
    gap: 8,
  },
  topActionBtn: {
    borderRadius: 16,
    height: 32,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledBtn: {
    backgroundColor: '#58585B',
    borderColor: '#58585B',
  },
  topActionBtnText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  listContent: {
    padding: 16,
  },
  card: {
    backgroundColor: '#15151E',
    borderWidth: 1,
    borderColor: '#303037',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#1C1C25',
    paddingBottom: 10,
    marginBottom: 12,
  },
  horseName: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
  },
  rankBadge: {
    backgroundColor: '#E10600',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  rankText: {
    color: '#FFFFFF',
    fontSize: 8,
    fontWeight: '900',
  },
  formRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  label: {
    color: '#AAAAAA',
    fontSize: 10,
    fontWeight: '800',
    width: 110,
  },
  timeInput: {
    flex: 1,
    backgroundColor: '#1C1C25',
    borderWidth: 1,
    borderColor: '#303037',
    borderRadius: 6,
    height: 34,
    color: '#FFFFFF',
    paddingHorizontal: 10,
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'right',
  },
  disabledInput: {
    backgroundColor: '#15151E',
    color: '#58585B',
  },
  statusChips: {
    flexDirection: 'row',
    gap: 6,
  },
  chip: {
    backgroundColor: '#1C1C25',
    borderWidth: 1,
    borderColor: '#303037',
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  chipActive: {
    backgroundColor: '#067E6A',
    borderColor: '#067E6A',
  },
  chipLocked: {
    opacity: 0.7,
  },
  chipText: {
    color: '#AAAAAA',
    fontSize: 9,
    fontWeight: '800',
  },
  chipTextActive: {
    color: '#FFFFFF',
  },
  noteInput: {
    flex: 1,
    backgroundColor: '#1C1C25',
    borderWidth: 1,
    borderColor: '#303037',
    borderRadius: 6,
    height: 34,
    color: '#FFFFFF',
    paddingHorizontal: 10,
    fontSize: 12,
  },
  confirmButton: {
    backgroundColor: '#E10600',
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyText: {
    color: '#AAAAAA',
    fontSize: 13,
    marginTop: 12,
    textAlign: 'center',
  },
});
