import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, ActivityIndicator, Alert, TextInput, Platform } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { raceChecksApi, raceResultsApi, racesApi, type RaceItem } from '../../../lib/api-client';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { ErrorState, useThemeColors } from '../../../components/ui/shared';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { premiumColors as defaultPremiumColors, premiumSpacing, premiumRadius, usePremiumColors } from '@/components/ui/premium-tokens';

// Background Pattern
const GridBackground = ({ isDark }: { isDark: boolean }) => {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <View style={{ flex: 1, backgroundColor: isDark ? '#09090B' : '#F4F4F5' }} />
    </View>
  );
};

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
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = useThemeColors();
  const premiumColors = usePremiumColors();
  const styles = React.useMemo(() => getStyles(isDark, theme, insets, premiumColors), [isDark, theme, insets, premiumColors]);

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

  if (!raceId) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />
        <GridBackground isDark={isDark} />
        <ErrorState message="Thiếu thông tin cuộc đua.\n\nVui lòng quay lại danh sách phân công và chọn một cuộc đua." onRetry={() => router.back()} />
      </View>
    );
  }

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
            placeholderTextColor={premiumColors.textMuted}
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
                  activeOpacity={0.8}
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
            placeholderTextColor={premiumColors.textMuted}
            editable={!isLocked}
          />
        </View>
      </View>
    );
  };

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
        return premiumColors.success;
      default:
        return premiumColors.warning;
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <GridBackground isDark={isDark} />

      {/* Custom Sleek Header */}
      <View style={styles.customHeader}>
        <View style={[StyleSheet.absoluteFill, { paddingTop: Math.max(insets.top, 16), paddingBottom: 12 }]} pointerEvents="none">
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text style={styles.headerTitle}>NHẬP KẾT QUẢ</Text>
          </View>
        </View>
        <View style={styles.headerLeft}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} activeOpacity={0.8}>
            <MaterialIcons name="arrow-back" size={20} color={theme.textPrimary} />
          </TouchableOpacity>
        </View>
        <View style={styles.headerRight} />
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={premiumColors.brand} />
          <Text style={styles.loadingText}>Đang tải danh sách kết quả...</Text>
        </View>
      ) : (
        <View style={{ flex: 1 }}>
          {/* Top Controller Bar */}
          <View style={styles.statusCard}>
            <View>
              <Text style={styles.statusLabel}>TRẠNG THÁI BIÊN BẢN</Text>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColorBadge() + '1A' }]}>
                <Text style={[styles.statusBadgeText, { color: getStatusColorBadge() }]}>{getStatusTextBadge()}</Text>
              </View>
            </View>

            {!isLocked && (
              <View style={styles.topActions}>
                <TouchableOpacity 
                  style={[styles.topActionBtn, { backgroundColor: 'rgba(234, 179, 8, 0.15)' }, simulating && styles.disabledBtn]}
                  onPress={handleSimulate}
                  disabled={simulating || saving || confirming}
                  activeOpacity={0.8}
                >
                  {simulating ? <ActivityIndicator size="small" color={premiumColors.warning} /> : <Text style={[styles.topActionBtnText, { color: premiumColors.warning }]}>GIẢ LẬP</Text>}
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[styles.topActionBtn, { backgroundColor: premiumColors.surface2, borderColor: premiumColors.border, borderWidth: 1 }, saving && styles.disabledBtn]}
                  onPress={handleBulkSave}
                  disabled={simulating || saving || confirming}
                  activeOpacity={0.8}
                >
                  {saving ? <ActivityIndicator size="small" color={premiumColors.text} /> : <Text style={[styles.topActionBtnText, { color: premiumColors.text }]}>LƯU NHÁP</Text>}
                </TouchableOpacity>
              </View>
            )}
          </View>

          <FlatList
            data={entryRows}
            renderItem={renderItem}
            keyExtractor={(item) => item.horseId}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <MaterialIcons name="sports" size={40} color={premiumColors.textMuted} />
                <Text style={styles.emptyText}>Chưa có ngựa đua được xác nhận kiểm duyệt để nhập kết quả.</Text>
              </View>
            }
          />

          {!isLocked && entryRows.length > 0 && (
            <View style={styles.footerWrap}>
              <TouchableOpacity 
                style={[styles.confirmButton, confirming && styles.disabledBtn]}
                onPress={handleConfirm}
                disabled={confirming}
                activeOpacity={0.9}
              >
                {confirming ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={styles.confirmButtonText}>XÁC NHẬN KHÓA KẾT QUẢ</Text>
                )}
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}
    </View>
  );
}

const getStyles = (isDark: boolean, theme: any, insets: any, premiumColors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: isDark ? '#09090B' : '#F4F4F5',
  },
  // Custom Header
  customHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Math.max(insets.top, 16),
    paddingBottom: 12,
    zIndex: 10,
    backgroundColor: isDark ? 'rgba(9, 9, 11, 0.85)' : 'rgba(244, 244, 245, 0.85)',
  },
  headerLeft: {
    flex: 1,
    alignItems: 'flex-start',
  },
  headerRight: {
    flex: 1,
    alignItems: 'flex-end',
  },
  headerTitle: {
    color: theme.textPrimary,
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: premiumColors.textSecondary,
    fontSize: 14,
    marginTop: 12,
  },
  statusCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: premiumColors.surface,
    borderBottomWidth: 1,
    borderBottomColor: premiumColors.border,
    padding: premiumSpacing[16],
  },
  statusLabel: {
    color: premiumColors.textSecondary,
    fontSize: 9,
    fontWeight: '800',
    marginBottom: 4,
  },
  statusBadge: {
    borderRadius: premiumRadius[4],
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  statusBadgeText: {
    fontSize: 9,
    fontWeight: '900',
  },
  topActions: {
    flexDirection: 'row',
    gap: 8,
  },
  topActionBtn: {
    borderRadius: premiumRadius[16],
    height: 32,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledBtn: {
    opacity: 0.6,
  },
  topActionBtnText: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  listContent: {
    padding: premiumSpacing[16],
    paddingBottom: 120,
  },
  card: {
    backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : '#FFFFFF',
    borderWidth: 1,
    borderColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
    borderRadius: premiumRadius[16],
    padding: premiumSpacing[16],
    marginBottom: premiumSpacing[16],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: isDark ? 0.2 : 0.05,
    shadowRadius: 12,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: premiumColors.border,
    paddingBottom: 10,
    marginBottom: 12,
  },
  horseName: {
    color: premiumColors.text,
    fontSize: 16,
    fontWeight: '900',
  },
  rankBadge: {
    backgroundColor: premiumColors.danger,
    borderRadius: premiumRadius[4],
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  rankText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '900',
  },
  formRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  label: {
    color: premiumColors.textSecondary,
    fontSize: 11,
    fontWeight: '800',
    width: 110,
  },
  timeInput: {
    flex: 1,
    backgroundColor: premiumColors.surface2,
    borderWidth: 1,
    borderColor: premiumColors.border,
    borderRadius: premiumRadius[8],
    height: 40,
    color: premiumColors.text,
    paddingHorizontal: 12,
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'right',
  },
  disabledInput: {
    backgroundColor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
    color: premiumColors.textMuted,
  },
  statusChips: {
    flexDirection: 'row',
    gap: 6,
  },
  chip: {
    backgroundColor: premiumColors.surface2,
    borderWidth: 1,
    borderColor: premiumColors.border,
    borderRadius: premiumRadius[16],
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  chipActive: {
    backgroundColor: isDark ? 'rgba(52, 211, 153, 0.15)' : 'rgba(52, 211, 153, 0.1)',
    borderColor: premiumColors.success,
  },
  chipLocked: {
    opacity: 0.7,
  },
  chipText: {
    color: premiumColors.textSecondary,
    fontSize: 10,
    fontWeight: '800',
  },
  chipTextActive: {
    color: premiumColors.success,
  },
  noteInput: {
    flex: 1,
    backgroundColor: premiumColors.surface2,
    borderWidth: 1,
    borderColor: premiumColors.border,
    borderRadius: premiumRadius[8],
    height: 40,
    color: premiumColors.text,
    paddingHorizontal: 12,
    fontSize: 13,
  },
  footerWrap: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: premiumColors.surface,
    borderTopWidth: 1,
    borderTopColor: premiumColors.border,
    paddingHorizontal: premiumSpacing[16],
    paddingTop: premiumSpacing[16],
    paddingBottom: Platform.OS === 'ios' ? 32 : 16,
  },
  confirmButton: {
    backgroundColor: premiumColors.danger,
    height: 48,
    borderRadius: premiumRadius[12],
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
    color: premiumColors.textMuted,
    fontSize: 13,
    marginTop: 12,
    textAlign: 'center',
  },
});
