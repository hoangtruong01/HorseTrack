import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, TextInput, Alert, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';
import { AppScreen, Section } from '@/components/ui/premium';
import { premiumColors, premiumSpacing, premiumRadius , usePremiumColors } from '@/components/ui/premium-tokens';
import { LoadingState, EmptyState } from '@/components/ui/shared';
import { refereeAssignmentsApi, raceChecksApi, raceViolationsApi } from '@/lib/api-client';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

export default function RefereeViolations() {
  const premiumColors = usePremiumColors();
  const s = getStyles(premiumColors);

  const [assignments, setAssignments] = useState<any[]>([]);
  const [selectedRaceId, setSelectedRaceId] = useState<string | null>(null);
  const [selectedRaceName, setSelectedRaceName] = useState<string>('');
  const [horses, setHorses] = useState<any[]>([]);
  const [violations, setViolations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Form inputs
  const [selectedHorseId, setSelectedHorseId] = useState('');
  const [type, setType] = useState('track_violation');
  const [severity, setSeverity] = useState('minor');
  const [penalty, setPenalty] = useState('time_penalty');
  const [description, setDescription] = useState('');

  const loadAssignments = useCallback(async () => {
    try {
      const res = await refereeAssignmentsApi.myAssignments({ limit: 50 });
      const list = (res as any).data || res || [];
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
    setLoadingDetails(true);
    try {
      const [checksRes, violationsRes] = await Promise.all([
        raceChecksApi.listByRace(raceId).catch(() => ({ data: [] })),
        raceViolationsApi.listByRace(raceId).catch(() => ({ data: [] })),
      ]);
      setHorses(checksRes.data || checksRes || []);
      setViolations(violationsRes.data || violationsRes || []);
    } catch {
      setHorses([]);
      setViolations([]);
    } finally {
      setLoadingDetails(false);
    }
  };

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
      const check = horses.find(h => h.horseId?._id === selectedHorseId);
      if (!check) throw new Error('Không tìm thấy thông tin chiến mã.');

      const regId = check.raceRegistrationId?._id || check.raceRegistrationId;
      const jockeyUser = check.jockeyUserId || check.raceRegistrationId?.jockeyUserId;
      const jockeyUserId = typeof jockeyUser === 'object' ? jockeyUser?._id : jockeyUser;

      await raceViolationsApi.create({
        raceId: selectedRaceId!,
        type,
        severity,
        penalty,
        raceRegistrationId: regId,
        horseId: selectedHorseId,
        jockeyUserId,
        description,
      });

      Alert.alert('Thành công', 'Đã lưu biên bản vi phạm.');
      setSelectedHorseId('');
      setDescription('');
      
      // Reload violations
      const violationsRes = await raceViolationsApi.listByRace(selectedRaceId!);
      setViolations(violationsRes.data || violationsRes || []);
    } catch (err: any) {
      Alert.alert('Lỗi', err.message || 'Lỗi lập biên bản vi phạm.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading && !refreshing) return <LoadingState />;

  if (!selectedRaceId) {
    return (
      <AppScreen scroll refreshing={refreshing} onRefresh={onRefresh}>
        <View style={s.content}>
          <Section title="Chọn trận đua cần lập biên bản vi phạm">
            {assignments.length === 0 ? (
              <EmptyState icon="gavel" title="Chưa có nhiệm vụ đã nhận" subtitle="Vui lòng nhận phân công ở tab Phân công trước." />
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
                      <MaterialIcons name="gavel" size={20} color={premiumColors.brand} />
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

      {loadingDetails && !refreshing ? <LoadingState /> : (
        <FlatList
          data={violations}
          keyExtractor={(item) => item._id || item.id}
          contentContainerStyle={s.listContent}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <View style={s.formCard}>
              <Text style={s.formTitle}>LẬP BIÊN BẢN VI PHẠM</Text>
              
              <Text style={s.label}>CHIẾN MÁ VI PHẠM:</Text>
              <View style={s.selectorRow}>
                {horses.map(h => {
                  const horse = h.horseId;
                  if (!horse) return null;
                  const isSelected = selectedHorseId === horse._id;
                  return (
                    <TouchableOpacity
                      key={horse._id}
                      style={[s.chip, isSelected && s.chipActive]}
                      onPress={() => setSelectedHorseId(horse._id)}
                      activeOpacity={0.8}
                    >
                      <Text style={[s.chipText, isSelected && s.chipTextActive]}>{horse.name.toUpperCase()}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <Text style={s.label}>LOẠI LỖI VI PHẠM:</Text>
              <View style={s.selectorRow}>
                {[['track_violation', 'Đường đua'], ['false_start', 'Xuất phát sai'], ['dangerous_riding', 'Ép làn']].map(([k, l]) => (
                  <TouchableOpacity
                    key={k}
                    style={[s.chip, type === k && s.chipActive]}
                    onPress={() => setType(k)}
                    activeOpacity={0.8}
                  >
                    <Text style={[s.chipText, type === k && s.chipTextActive]}>{l}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={s.label}>MỨC ĐỘ & CỘNG GIÂY PHẠT:</Text>
              <View style={s.selectorRow}>
                {[['minor', 'Nhẹ (+3s)'], ['major', 'Vừa (+6s)'], ['critical', 'Nặng (+12s)']].map(([k, l]) => (
                  <TouchableOpacity
                    key={k}
                    style={[s.chip, severity === k && s.chipActive]}
                    onPress={() => setSeverity(k)}
                    activeOpacity={0.8}
                  >
                    <Text style={[s.chipText, severity === k && s.chipTextActive]}>{l}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TextInput
                style={s.inputMultiline}
                placeholder="Mô tả chi tiết vi phạm..."
                placeholderTextColor={premiumColors.textMuted}
                multiline
                numberOfLines={3}
                value={description}
                onChangeText={setDescription}
              />

              <TouchableOpacity 
                style={[s.submitBtn, submitting && { opacity: 0.7 }]} 
                onPress={handleSubmit}
                disabled={submitting}
                activeOpacity={0.9}
              >
                <Text style={s.submitBtnText}>{submitting ? 'ĐANG GỬI...' : 'LẬP BIÊN BẢN VI PHẠM'}</Text>
              </TouchableOpacity>
            </View>
          }
          renderItem={({ item }) => {
            const horseName = item.horseId?.name || 'Chiến mã';
            const isCritical = item.severity === 'critical';
            return (
              <View style={s.violationCard}>
                <View style={s.cardHeader}>
                  <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
                    <View style={[
                      s.badge, 
                      isCritical ? s.badgeCritical : s.badgeWarning
                    ]}>
                      <Text style={[
                        s.badgeText, 
                        isCritical ? s.badgeTextCritical : s.badgeTextWarning
                      ]}>
                        {item.severity.toUpperCase()}
                      </Text>
                    </View>
                    <Text style={s.horseNameList}>{horseName.toUpperCase()}</Text>
                  </View>
                  <Text style={s.penaltyTxt}>{item.penalty === 'time_penalty' ? 'Cộng giây' : 'Khác'}</Text>
                </View>
                <Text style={s.descText}>{item.description}</Text>
              </View>
            );
          }}
        />
      )}
    </AppScreen>
  );
}

interface Styles {
  content: ViewStyle;
  listContent: ViewStyle;
  header: ViewStyle;
  backBtn: ViewStyle;
  backTxt: TextStyle;
  headerTitle: TextStyle;
  assignmentCard: ViewStyle;
  cardIconWrap: ViewStyle;
  assignmentTitle: TextStyle;
  assignmentSubtitle: TextStyle;
  formCard: ViewStyle;
  formTitle: TextStyle;
  label: TextStyle;
  selectorRow: ViewStyle;
  chip: ViewStyle;
  chipActive: ViewStyle;
  chipText: TextStyle;
  chipTextActive: TextStyle;
  inputMultiline: TextStyle;
  submitBtn: ViewStyle;
  submitBtnText: TextStyle;
  violationCard: ViewStyle;
  cardHeader: ViewStyle;
  horseNameList: TextStyle;
  badge: ViewStyle;
  badgeCritical: ViewStyle;
  badgeWarning: ViewStyle;
  badgeText: TextStyle;
  badgeTextCritical: TextStyle;
  badgeTextWarning: TextStyle;
  penaltyTxt: TextStyle;
  descText: TextStyle;
}

const getStyles = (premiumColors: any) => StyleSheet.create<Styles>({
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
  formCard: {
    backgroundColor: premiumColors.surface,
    borderWidth: 1,
    borderColor: premiumColors.border,
    borderRadius: premiumRadius[12],
    padding: 20,
    marginBottom: 24,
  },
  formTitle: {
    color: premiumColors.text,
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 0.5,
    marginBottom: 16,
  },
  label: {
    color: premiumColors.textSecondary,
    fontSize: 10,
    fontWeight: '800',
    marginTop: 16,
    marginBottom: 8,
  },
  selectorRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    backgroundColor: premiumColors.surface2,
    borderWidth: 1,
    borderColor: premiumColors.border,
    borderRadius: premiumRadius[16],
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  chipActive: {
    backgroundColor: 'rgba(225, 6, 0, 0.15)',
    borderColor: premiumColors.brand,
  },
  chipText: {
    color: premiumColors.textSecondary,
    fontSize: 11,
    fontWeight: '700',
  },
  chipTextActive: {
    color: premiumColors.brand,
  },
  inputMultiline: {
    backgroundColor: premiumColors.surface2,
    borderWidth: 1,
    borderColor: premiumColors.border,
    color: premiumColors.text,
    borderRadius: premiumRadius[8],
    padding: 16,
    fontSize: 13,
    height: 100,
    textAlignVertical: 'top',
    marginTop: 20,
    marginBottom: 20,
  },
  submitBtn: {
    backgroundColor: premiumColors.brand,
    height: 48,
    borderRadius: premiumRadius[8],
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  violationCard: {
    backgroundColor: premiumColors.surface,
    borderWidth: 1,
    borderColor: premiumColors.border,
    borderRadius: premiumRadius[12],
    padding: 16,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: premiumColors.border,
    paddingBottom: 10,
    marginBottom: 10,
  },
  horseNameList: {
    color: premiumColors.text,
    fontSize: 13,
    fontWeight: '800',
  },
  badge: {
    borderRadius: premiumRadius[4],
    paddingHorizontal: 6,
    paddingVertical: 3,
  },
  badgeCritical: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
  },
  badgeWarning: {
    backgroundColor: 'rgba(234, 179, 8, 0.15)',
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '900',
  },
  badgeTextCritical: {
    color: premiumColors.danger,
  },
  badgeTextWarning: {
    color: premiumColors.warning,
  },
  penaltyTxt: {
    color: premiumColors.warning,
    fontSize: 10,
    fontWeight: '900',
  },
  descText: {
    color: premiumColors.textSecondary,
    fontSize: 12,
    lineHeight: 18,
  },
});
