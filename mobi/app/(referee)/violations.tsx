import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, TextInput, Alert, ActivityIndicator, ViewStyle, TextStyle, Image } from 'react-native';
import { AppScreen, Section } from '@/components/ui/premium';
import { premiumColors, premiumSpacing, premiumRadius , usePremiumColors } from '@/components/ui/premium-tokens';
import { LoadingState, EmptyState } from '@/components/ui/shared';
import { refereeAssignmentsApi, raceChecksApi, raceViolationsApi } from '@/lib/api-client';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

export default function RefereeViolations({ nested }: { nested?: boolean }) {
  const premiumColors = usePremiumColors();
  const s = getStyles(premiumColors);

  const [assignments, setAssignments] = useState<any[]>([]);
  const [selectedRaceId, setSelectedRaceId] = useState<string | null>(null);
  const [selectedRaceName, setSelectedRaceName] = useState<string>('');
  const [selectedRaceStatus, setSelectedRaceStatus] = useState<string>('');
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

  const selectRace = async (raceId: string, raceName: string, raceStatus?: string) => {
    setSelectedRaceId(raceId);
    setSelectedRaceName(raceName);
    setSelectedRaceStatus(raceStatus || '');
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
    // Guard: chỉ cho phép ghi violation khi race đang ONGOING
    if (selectedRaceStatus !== 'ONGOING') {
      Alert.alert(
        'Không thể ghi vi phạm',
        `Trận đua đang ở trạng thái "${selectedRaceStatus || 'Chưa xác định'}". Chỉ có thể ghi biên bản vi phạm khi trận đua đang diễn ra (ONGOING).`
      );
      return;
    }
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
      <AppScreen scroll refreshing={refreshing} onRefresh={onRefresh} safeArea={!nested}>
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
                    onPress={() => selectRace(race._id || race.id, race.name, race.status)}
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
    <AppScreen refreshing={refreshing} onRefresh={onRefresh} safeArea={!nested}>
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => setSelectedRaceId(null)} activeOpacity={0.8}>
          <MaterialIcons name="arrow-back" size={20} color={premiumColors.textSecondary} />
          <Text style={s.backTxt}>QUAY LẠI</Text>
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
              {selectedRaceStatus !== 'ONGOING' && (
                <View style={s.statusWarning}>
                  <MaterialIcons name="info-outline" size={20} color={premiumColors.warning} style={{ marginTop: 2 }} />
                  <Text style={s.statusWarningText}>
                    {`Trận đua đang ở trạng thái "${selectedRaceStatus || 'Chưa xác định'}". Chỉ có thể ghi vi phạm khi race đang diễn ra (ONGOING).`}
                  </Text>
                </View>
              )}
              
              <Text style={s.label}>1. CHIẾN MÃ VI PHẠM</Text>
              <View style={s.selectorRow}>
                {horses.map(h => {
                  const horse = h.horseId;
                  if (!horse) return null;
                  const isSelected = selectedHorseId === horse._id;
                  return (
                    <TouchableOpacity
                      key={horse._id}
                      style={[s.horseChip, isSelected && s.horseChipActive]}
                      onPress={() => setSelectedHorseId(horse._id)}
                      activeOpacity={0.8}
                    >
                      {horse.image || horse.avatar ? (
                        <Image source={{ uri: horse.image || horse.avatar }} style={s.horseChipAvatar} resizeMode="cover" />
                      ) : (
                        <View style={s.horseChipAvatarPlaceholder}>
                          <MaterialIcons name="pets" size={14} color={isSelected ? premiumColors.brand : premiumColors.textMuted} />
                        </View>
                      )}
                      <Text style={[s.horseChipText, isSelected && s.horseChipTextActive]}>{horse.name.toUpperCase()}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <Text style={s.label}>2. LỖI VI PHẠM</Text>
              <View style={s.selectorGrid}>
                {[['track_violation', 'Đường đua', 'add-road'], ['false_start', 'Xuất phát sai', 'timer-off'], ['dangerous_riding', 'Ép làn', 'warning']].map(([k, l, icon]) => (
                  <TouchableOpacity
                    key={k}
                    style={[s.typeChip, type === k && s.typeChipActive]}
                    onPress={() => setType(k)}
                    activeOpacity={0.8}
                  >
                    <MaterialIcons name={icon as any} size={20} color={type === k ? premiumColors.brand : premiumColors.textMuted} />
                    <Text style={[s.typeChipText, type === k && s.typeChipTextActive]}>{l}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={s.label}>3. MỨC ĐỘ & HÌNH PHẠT</Text>
              <View style={s.selectorGrid}>
                {[['minor', 'Nhẹ', '+3s'], ['major', 'Vừa', '+6s'], ['critical', 'Nặng', '+12s']].map(([k, label, penaltyText]) => (
                  <TouchableOpacity
                    key={k}
                    style={[s.severityChip, severity === k && s.severityChipActive]}
                    onPress={() => setSeverity(k)}
                    activeOpacity={0.8}
                  >
                    <Text style={[s.severityChipText, severity === k && s.severityChipTextActive]}>{label}</Text>
                    <Text style={[s.severityChipPenalty, severity === k && s.severityChipPenaltyActive]}>{penaltyText}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={s.label}>4. MÔ TẢ CHI TIẾT</Text>
              <TextInput
                style={s.inputMultiline}
                placeholder="Nhập mô tả tình huống vi phạm (Bắt buộc)..."
                placeholderTextColor={premiumColors.textMuted}
                multiline
                numberOfLines={4}
                value={description}
                onChangeText={setDescription}
              />

              <TouchableOpacity 
                style={[s.submitBtn, submitting && { opacity: 0.7 }]} 
                onPress={handleSubmit}
                disabled={submitting}
                activeOpacity={0.9}
              >
                <Text style={s.submitBtnText}>{submitting ? 'ĐANG GỬI...' : 'XÁC NHẬN LẬP BIÊN BẢN'}</Text>
              </TouchableOpacity>
            </View>
          }
          renderItem={({ item }) => {
            const horseName = item.horseId?.name || 'Chiến mã';
            const horseAvatar = item.horseId?.image || item.horseId?.avatar;
            const isCritical = item.severity === 'critical';
            return (
              <View style={s.violationCard}>
                <View style={s.cardHeader}>
                  <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center', flex: 1 }}>
                    {horseAvatar ? (
                       <Image source={{ uri: horseAvatar }} style={s.violationAvatar} resizeMode="cover" />
                    ) : (
                       <View style={s.violationAvatarPlaceholder}>
                         <MaterialIcons name="pets" size={18} color={premiumColors.textMuted} />
                       </View>
                    )}
                    <View style={{ flex: 1 }}>
                      <Text style={s.horseNameList} numberOfLines={1}>{horseName.toUpperCase()}</Text>
                      <Text style={s.violationTypeTxt}>{item.type === 'track_violation' ? 'Đường đua' : item.type === 'false_start' ? 'Xuất phát sai' : item.type === 'dangerous_riding' ? 'Ép làn' : item.type}</Text>
                    </View>
                  </View>
                  <View style={{ alignItems: 'flex-end', marginLeft: 8 }}>
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
                    <Text style={s.penaltyTxt}>{item.penalty === 'time_penalty' ? '+ Giây' : 'Khác'}</Text>
                  </View>
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

const getStyles = (premiumColors: any) => StyleSheet.create({
  content: {
    paddingHorizontal: premiumSpacing[16],
    paddingTop: premiumSpacing[16],
    paddingBottom: 100,
  },
  listContent: {
    padding: premiumSpacing[16],
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    backgroundColor: 'transparent',
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: premiumColors.surface2,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: premiumRadius[24],
  },
  backTxt: {
    color: premiumColors.textSecondary,
    fontSize: 12,
    fontWeight: '800',
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
    borderRadius: premiumRadius[16],
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
    borderWidth: 1,
    borderColor: premiumColors.border,
  },
  statusWarning: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: 'rgba(234, 179, 8, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(234, 179, 8, 0.2)',
    borderRadius: premiumRadius[12],
    padding: 16,
    marginBottom: 20,
  },
  statusWarningText: {
    flex: 1,
    color: premiumColors.warning,
    fontSize: 13,
    lineHeight: 20,
    fontWeight: '500',
  },
  formTitle: {
    color: premiumColors.text,
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 0.5,
    marginBottom: 16,
    textAlign: 'center',
  },
  label: {
    color: premiumColors.text,
    fontSize: 11,
    fontWeight: '900',
    marginTop: 20,
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  selectorRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  selectorGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  horseChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: premiumColors.surface2,
    borderWidth: 1,
    borderColor: premiumColors.border,
    borderRadius: premiumRadius[24],
    paddingRight: 16,
    paddingLeft: 6,
    paddingVertical: 6,
    gap: 8,
  },
  horseChipActive: {
    backgroundColor: 'rgba(225, 6, 0, 0.08)',
    borderColor: premiumColors.brand,
  },
  horseChipAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  horseChipAvatarPlaceholder: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: premiumColors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  horseChipText: {
    color: premiumColors.textSecondary,
    fontSize: 12,
    fontWeight: '800',
  },
  horseChipTextActive: {
    color: premiumColors.brand,
  },
  typeChip: {
    flex: 1,
    backgroundColor: premiumColors.surface2,
    borderWidth: 1,
    borderColor: premiumColors.border,
    borderRadius: premiumRadius[12],
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  typeChipActive: {
    backgroundColor: 'rgba(225, 6, 0, 0.08)',
    borderColor: premiumColors.brand,
  },
  typeChipText: {
    color: premiumColors.textSecondary,
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
  },
  typeChipTextActive: {
    color: premiumColors.brand,
  },
  severityChip: {
    flex: 1,
    backgroundColor: premiumColors.surface2,
    borderWidth: 1,
    borderColor: premiumColors.border,
    borderRadius: premiumRadius[12],
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  severityChipActive: {
    backgroundColor: 'rgba(225, 6, 0, 0.08)',
    borderColor: premiumColors.brand,
  },
  severityChipText: {
    color: premiumColors.textSecondary,
    fontSize: 12,
    fontWeight: '700',
  },
  severityChipTextActive: {
    color: premiumColors.brand,
  },
  severityChipPenalty: {
    color: premiumColors.textMuted,
    fontSize: 11,
    fontWeight: '900',
  },
  severityChipPenaltyActive: {
    color: premiumColors.warning,
  },
  inputMultiline: {
    backgroundColor: premiumColors.surface2,
    borderWidth: 1,
    borderColor: premiumColors.border,
    color: premiumColors.text,
    borderRadius: premiumRadius[12],
    padding: 16,
    fontSize: 14,
    height: 120,
    textAlignVertical: 'top',
    marginTop: 4,
    marginBottom: 24,
  },
  submitBtn: {
    backgroundColor: premiumColors.brand,
    height: 52,
    borderRadius: premiumRadius[12],
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: premiumColors.brand,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  violationCard: {
    backgroundColor: premiumColors.surface,
    borderWidth: 1,
    borderColor: premiumColors.border,
    borderRadius: premiumRadius[16],
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: premiumColors.border,
    paddingBottom: 12,
    marginBottom: 12,
  },
  violationAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  violationAvatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: premiumColors.surface2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  horseNameList: {
    color: premiumColors.text,
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 2,
  },
  violationTypeTxt: {
    color: premiumColors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  badge: {
    borderRadius: premiumRadius[4],
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  badgeCritical: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
  },
  badgeWarning: {
    backgroundColor: 'rgba(234, 179, 8, 0.15)',
  },
  badgeText: {
    fontSize: 10,
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
    fontSize: 11,
    fontWeight: '900',
    marginTop: 6,
  },
  descText: {
    color: premiumColors.textSecondary,
    fontSize: 13,
    lineHeight: 20,
  },
});
