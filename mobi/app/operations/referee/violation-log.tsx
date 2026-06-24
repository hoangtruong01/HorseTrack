import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, ActivityIndicator, Alert, TextInput } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { raceChecksApi, raceViolationsApi, racesApi, type RaceItem } from '../../../lib/api-client';
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

export default function ViolationLogScreen() {
  const { raceId } = useLocalSearchParams<{ raceId: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = useThemeColors();
  const premiumColors = usePremiumColors();
  const styles = React.useMemo(() => getStyles(isDark, theme, insets, premiumColors), [isDark, theme, insets, premiumColors]);

  const [horses, setHorses] = useState<any[]>([]);
  const [violations, setViolations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form inputs
  const [selectedHorseId, setSelectedHorseId] = useState('');
  const [type, setType] = useState('track_violation');
  const [severity, setSeverity] = useState('minor');
  const [penalty, setPenalty] = useState('time_penalty');
  const [description, setDescription] = useState('');

  const loadData = async () => {
    if (!raceId) return;
    try {
      await racesApi.get(raceId);

      const checksRes = await raceChecksApi.listByRace(raceId);
      if (checksRes) {
        // filter checked / approved participant list
        setHorses(checksRes.data || checksRes);
      }

      const violationsRes = await raceViolationsApi.listByRace(raceId);
      if (violationsRes) {
        setViolations(violationsRes.data || violationsRes);
      }
    } catch (err) {
      console.error('Lỗi tải nhật ký vi phạm:', err);
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

  const handleSubmit = async () => {
    if (!selectedHorseId) {
      Alert.alert('Lỗi', 'Vui lòng chọn chiến mã vi phạm.');
      return;
    }
    if (!description.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập mô tả chi tiết lỗi vi phạm.');
      return;
    }

    setSubmitting(true);
    try {
      // Find matching check to resolve registration and jockey user ID
      const check = horses.find(h => h.horseId?._id === selectedHorseId);
      if (!check) throw new Error('Không tìm thấy thông tin chiến mã.');

      const regId = check.raceRegistrationId?._id || check.raceRegistrationId;
      const jockeyUser = check.jockeyUserId || check.raceRegistrationId?.jockeyUserId;
      const jockeyUserId = typeof jockeyUser === 'object' ? jockeyUser?._id : jockeyUser;

      await raceViolationsApi.create({
        raceId: raceId!,
        type,
        severity,
        penalty,
        raceRegistrationId: regId,
        horseId: selectedHorseId,
        jockeyUserId,
        description,
      });

      Alert.alert('Thành công', 'Đã lưu biên bản vi phạm. Hình phạt sẽ tự động áp dụng khi chốt kết quả.');
      
      // Reset form fields
      setSelectedHorseId('');
      setDescription('');
      
      // Reload violations list
      const violationsRes = await raceViolationsApi.listByRace(raceId!);
      if (violationsRes) {
        setViolations(violationsRes.data || violationsRes);
      }
    } catch (err: any) {
      Alert.alert('Thất bại', err.message || 'Lỗi lưu vi phạm.');
    } finally {
      setSubmitting(false);
    }
  };

  const getSeverityText = (sev: string) => {
    switch (sev) {
      case 'minor': return 'NHẸ (+3s)';
      case 'major': return 'TRUNG BÌNH (+6s)';
      case 'critical': return 'NẶNG (+12s)';
      default: return sev.toUpperCase();
    }
  };

  const getSeverityColor = (sev: string) => {
    switch (sev) {
      case 'critical': return premiumColors.danger;
      case 'major': return premiumColors.warning;
      default: return premiumColors.success;
    }
  };

  const renderViolationItem = ({ item }: { item: any }) => {
    const horseName = item.horseId?.name || 'Chiến mã';
    const dateStr = item.createdAt ? new Date(item.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : '';

    return (
      <View style={styles.historyCard}>
        <View style={styles.historyHeader}>
          <View style={styles.badgeRow}>
            <View style={[styles.severityBadge, { backgroundColor: getSeverityColor(item.severity) }]}>
              <Text style={styles.severityText}>{getSeverityText(item.severity)}</Text>
            </View>
            <Text style={styles.typeText}>{item.type === 'track_violation' ? 'ĐƯỜNG ĐUA' : item.type === 'false_start' ? 'XUẤT PHÁT' : 'KHÁC'}</Text>
          </View>
          <Text style={styles.penaltyText}>{item.penalty === 'time_penalty' ? 'Cộng giây' : item.penalty === 'disqualified' ? 'LOẠI' : 'Nhắc nhở'}</Text>
        </View>

        <Text style={styles.horseLabel}>Chiến mã: <Text style={styles.whiteBold}>{horseName.toUpperCase()}</Text></Text>
        <Text style={styles.descText}>{item.description}</Text>
        <Text style={styles.timeText}>{dateStr}</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <GridBackground isDark={isDark} />

      {/* Custom Sleek Header */}
      <View style={styles.customHeader}>
        <View style={[StyleSheet.absoluteFill, { paddingTop: Math.max(insets.top, 16), paddingBottom: 12 }]} pointerEvents="none">
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text style={styles.headerTitle}>NHẬT KÝ VI PHẠM</Text>
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
          <Text style={styles.loadingText}>Đang tải dữ liệu vi phạm...</Text>
        </View>
      ) : (
        <FlatList
          data={violations}
          renderItem={renderViolationItem}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <View style={styles.headerForm}>
              {/* Automatic Penalty Alert */}
              <View style={styles.alertBox}>
                <MaterialIcons name="info" size={18} color={premiumColors.warning} />
                <Text style={styles.alertText}>
                  {"Hình phạt \"Cộng giây\" được tự động tính vào thời gian đua: Nhẹ (+3s), Trung bình (+6s), Nặng (+12s)."}
                </Text>
              </View>

              {/* Quick Add Form */}
              <View style={styles.formCard}>
                <Text style={styles.sectionTitle}>BÁO CÁO VI PHẠM MỚI</Text>

                {/* Horse Selector */}
                <Text style={styles.label}>CHIẾN MÃ VI PHẠM:</Text>
                <View style={styles.selectorsRow}>
                  {horses.map((item) => {
                    const horse = item.horseId;
                    if (!horse) return null;
                    const isSelected = selectedHorseId === horse._id;
                    return (
                      <TouchableOpacity
                        key={horse._id}
                        style={[styles.selectorChip, isSelected && styles.selectorChipActive]}
                        onPress={() => setSelectedHorseId(horse._id)}
                        activeOpacity={0.8}
                      >
                        <Text style={[styles.selectorChipText, isSelected && styles.selectorChipTextActive]}>
                          {horse.name.toUpperCase()}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {/* Violation Type Selector */}
                <Text style={styles.label}>LOẠI VI PHẠM:</Text>
                <View style={styles.selectorsRow}>
                  {[
                    { key: 'track_violation', label: 'Đường đua' },
                    { key: 'false_start', label: 'Xuất phát sai' },
                    { key: 'dangerous_riding', label: 'Ép làn' },
                    { key: 'other', label: 'Lỗi khác' }
                  ].map((t) => {
                    const isSelected = type === t.key;
                    return (
                      <TouchableOpacity
                        key={t.key}
                        style={[styles.selectorChip, isSelected && styles.selectorChipActive]}
                        onPress={() => setType(t.key)}
                        activeOpacity={0.8}
                      >
                        <Text style={[styles.selectorChipText, isSelected && styles.selectorChipTextActive]}>
                          {t.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {/* Severity Selector */}
                <Text style={styles.label}>MỨC ĐỘ NẶNG NHẸ:</Text>
                <View style={styles.selectorsRow}>
                  {[
                    { key: 'minor', label: 'Nhẹ (+3s)' },
                    { key: 'major', label: 'Vừa (+6s)' },
                    { key: 'critical', label: 'Nặng (+12s)' }
                  ].map((s) => {
                    const isSelected = severity === s.key;
                    return (
                      <TouchableOpacity
                        key={s.key}
                        style={[styles.selectorChip, isSelected && styles.selectorChipActive]}
                        onPress={() => setSeverity(s.key)}
                        activeOpacity={0.8}
                      >
                        <Text style={[styles.selectorChipText, isSelected && styles.selectorChipTextActive]}>
                          {s.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {/* Penalty Option */}
                <Text style={styles.label}>HÌNH PHẠT:</Text>
                <View style={styles.selectorsRow}>
                  {[
                    { key: 'time_penalty', label: 'Cộng giây' },
                    { key: 'warning', label: 'Cảnh cáo' },
                    { key: 'disqualified', label: 'Bị loại' }
                  ].map((p) => {
                    const isSelected = penalty === p.key;
                    return (
                      <TouchableOpacity
                        key={p.key}
                        style={[styles.selectorChip, isSelected && styles.selectorChipActive]}
                        onPress={() => setPenalty(p.key)}
                        activeOpacity={0.8}
                      >
                        <Text style={[styles.selectorChipText, isSelected && styles.selectorChipTextActive]}>
                          {p.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {/* Description Text Input */}
                <Text style={styles.label}>MÔ TẢ BIÊN BẢN CHI TIẾT:</Text>
                <TextInput
                  style={styles.textInput}
                  value={description}
                  onChangeText={setDescription}
                  placeholder="Ghi rõ chi tiết vi phạm đường đua..."
                  placeholderTextColor={premiumColors.textMuted}
                  multiline
                  numberOfLines={3}
                />

                <TouchableOpacity 
                  style={[styles.submitButton, submitting && styles.disabledButton]}
                  onPress={handleSubmit}
                  disabled={submitting}
                  activeOpacity={0.9}
                >
                  {submitting ? (
                    <ActivityIndicator color="#FFFFFF" size="small" />
                  ) : (
                    <Text style={styles.submitButtonText}>LẬP BIÊN BẢN VI PHẠM</Text>
                  )}
                </TouchableOpacity>
              </View>

              <Text style={styles.historyTitle}>NHẬT KÝ VI PHẠM TRẬN ĐẤU</Text>
            </View>
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <MaterialIcons name="check-circle" size={40} color={premiumColors.success} />
              <Text style={styles.emptyText}>Trận đấu chưa ghi nhận lỗi vi phạm nào.</Text>
            </View>
          }
        />
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
  listContent: {
    padding: premiumSpacing[16],
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
  headerForm: {
    marginBottom: 20,
  },
  alertBox: {
    flexDirection: 'row',
    backgroundColor: 'rgba(234, 179, 8, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(234, 179, 8, 0.2)',
    borderRadius: premiumRadius[12],
    padding: 12,
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  alertText: {
    color: premiumColors.warning,
    fontSize: 12,
    flex: 1,
    lineHeight: 16,
    fontWeight: '500',
  },
  formCard: {
    backgroundColor: premiumColors.surface,
    borderWidth: 1,
    borderColor: premiumColors.border,
    borderRadius: premiumRadius[16],
    padding: premiumSpacing[16],
    marginBottom: premiumSpacing[24],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: isDark ? 0.2 : 0.05,
    shadowRadius: 12,
    elevation: 3,
  },
  sectionTitle: {
    color: premiumColors.text,
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 0.5,
    marginBottom: 16,
    borderLeftWidth: 3,
    borderLeftColor: premiumColors.brand,
    paddingLeft: 8,
  },
  label: {
    color: premiumColors.textSecondary,
    fontSize: 11,
    fontWeight: '800',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  selectorsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  selectorChip: {
    backgroundColor: premiumColors.surface2,
    borderWidth: 1,
    borderColor: premiumColors.border,
    borderRadius: premiumRadius[16],
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  selectorChipActive: {
    backgroundColor: 'rgba(225, 6, 0, 0.08)',
    borderColor: premiumColors.brand,
  },
  selectorChipText: {
    color: premiumColors.textSecondary,
    fontSize: 11,
    fontWeight: '700',
  },
  selectorChipTextActive: {
    color: premiumColors.brand,
    fontWeight: '800',
  },
  textInput: {
    backgroundColor: premiumColors.surface2,
    borderWidth: 1,
    borderColor: premiumColors.border,
    borderRadius: premiumRadius[8],
    padding: 12,
    color: premiumColors.text,
    fontSize: 13,
    textAlignVertical: 'top',
    height: 80,
    marginBottom: 20,
  },
  submitButton: {
    backgroundColor: premiumColors.brand,
    borderRadius: premiumRadius[12],
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: premiumColors.brand,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  disabledButton: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  historyTitle: {
    color: premiumColors.text,
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 0.5,
    marginBottom: 12,
    borderLeftWidth: 3,
    borderLeftColor: premiumColors.brand,
    paddingLeft: 8,
  },
  historyCard: {
    backgroundColor: premiumColors.surface,
    borderWidth: 1,
    borderColor: premiumColors.border,
    borderRadius: premiumRadius[12],
    padding: 16,
    marginBottom: 12,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: premiumColors.border,
    paddingBottom: 8,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  severityBadge: {
    borderRadius: premiumRadius[4],
    paddingHorizontal: 6,
    paddingVertical: 3,
  },
  severityText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '900',
  },
  typeText: {
    color: premiumColors.textSecondary,
    fontSize: 10,
    fontWeight: '800',
  },
  penaltyText: {
    color: premiumColors.warning,
    fontSize: 10,
    fontWeight: '900',
  },
  horseLabel: {
    color: premiumColors.textSecondary,
    fontSize: 12,
    marginBottom: 4,
  },
  whiteBold: {
    color: premiumColors.text,
    fontWeight: '800',
  },
  descText: {
    color: premiumColors.textSecondary,
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 8,
  },
  timeText: {
    color: premiumColors.textMuted,
    fontSize: 11,
    textAlign: 'right',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    color: premiumColors.textSecondary,
    fontSize: 13,
    marginTop: 12,
  },
});
