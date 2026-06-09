import React, { useEffect, useState } from 'react';
import { ScrollView, View, Text, StyleSheet, TouchableOpacity, FlatList, TextInput, Alert, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';
import { C, Card, SectionHeader, ListItemCard, LoadingState, EmptyState, statusLabel, PrimaryButton } from '@/components/ui/shared';
import { refereeAssignmentsApi, raceChecksApi, raceViolationsApi } from '@/lib/api-client';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

export default function RefereeViolations() {
  const [assignments, setAssignments] = useState<any[]>([]);
  const [selectedRaceId, setSelectedRaceId] = useState<string | null>(null);
  const [selectedRaceName, setSelectedRaceName] = useState<string>('');
  const [horses, setHorses] = useState<any[]>([]);
  const [violations, setViolations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form inputs
  const [selectedHorseId, setSelectedHorseId] = useState('');
  const [type, setType] = useState('track_violation');
  const [severity, setSeverity] = useState('minor');
  const [penalty, setPenalty] = useState('time_penalty');
  const [description, setDescription] = useState('');

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

  if (loading) return <LoadingState />;

  if (!selectedRaceId) {
    return (
      <ScrollView style={s.c} contentContainerStyle={s.p}>
        <SectionHeader title="Chọn trận đua cần lập biên bản vi phạm" />
        {assignments.length === 0 ? (
          <EmptyState icon="gavel" title="Chưa có nhiệm vụ đã nhận" subtitle="Vui lòng nhận phân công ở tab Phân công trước." />
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
                icon="gavel"
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

      {loadingDetails ? <LoadingState /> : (
        <FlatList
          data={violations}
          keyExtractor={(item) => item._id}
          contentContainerStyle={s.p}
          ListHeaderComponent={
            <Card style={{ gap: 12 }}>
              <Text style={s.formTitle}>Lập biên bản vi phạm</Text>
              
              <Text style={s.label}>Chiến mã vi phạm:</Text>
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
                    >
                      <Text style={[s.chipText, isSelected && s.chipTextActive]}>{horse.name.toUpperCase()}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <Text style={s.label}>Loại lỗi vi phạm:</Text>
              <View style={s.selectorRow}>
                {[['track_violation', 'Đường đua'], ['false_start', 'Xuất phát sai'], ['dangerous_riding', 'Ép làn']].map(([k, l]) => (
                  <TouchableOpacity
                    key={k}
                    style={[s.chip, type === k && s.chipActive]}
                    onPress={() => setType(k)}
                  >
                    <Text style={[s.chipText, type === k && s.chipTextActive]}>{l}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={s.label}>Mức độ & Cộng giây phạt:</Text>
              <View style={s.selectorRow}>
                {[['minor', 'Nhẹ (+3s)'], ['major', 'Vừa (+6s)'], ['critical', 'Nặng (+12s)']].map(([k, l]) => (
                  <TouchableOpacity
                    key={k}
                    style={[s.chip, severity === k && s.chipActive]}
                    onPress={() => setSeverity(k)}
                  >
                    <Text style={[s.chipText, severity === k && s.chipTextActive]}>{l}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TextInput
                style={s.inputMultiline}
                placeholder="Mô tả chi tiết vi phạm..."
                placeholderTextColor={C.textMuted}
                multiline
                numberOfLines={3}
                value={description}
                onChangeText={setDescription}
              />

              <PrimaryButton title="Lập biên bản vi phạm" onPress={handleSubmit} loading={submitting} />
            </Card>
          }
          renderItem={({ item }) => {
            const horseName = item.horseId?.name || 'Chiến mã';
            return (
              <Card>
                <View style={s.cardHeader}>
                  <View style={{ flexDirection: 'row', gap: 6, alignItems: 'center' }}>
                    <View style={[s.badge, { backgroundColor: item.severity === 'critical' ? '#E1060020' : '#E1A20020' }]}>
                      <Text style={[s.badgeText, { color: item.severity === 'critical' ? '#E10600' : '#E1A200' }]}>
                        {item.severity.toUpperCase()}
                      </Text>
                    </View>
                    <Text style={s.horseName}>{horseName.toUpperCase()}</Text>
                  </View>
                  <Text style={s.penaltyTxt}>{item.penalty === 'time_penalty' ? 'Cộng giây' : 'Khác'}</Text>
                </View>
                <Text style={s.descText}>{item.description}</Text>
              </Card>
            );
          }}
        />
      )}
    </View>
  );
}

interface Styles {
  c: ViewStyle;
  p: ViewStyle;
  header: ViewStyle;
  backBtn: ViewStyle;
  backTxt: TextStyle;
  headerTitle: TextStyle;
  formTitle: TextStyle;
  label: TextStyle;
  selectorRow: ViewStyle;
  chip: ViewStyle;
  chipActive: ViewStyle;
  chipText: TextStyle;
  chipTextActive: TextStyle;
  inputMultiline: TextStyle;
  cardHeader: ViewStyle;
  horseName: TextStyle;
  badge: ViewStyle;
  badgeText: TextStyle;
  penaltyTxt: TextStyle;
  descText: TextStyle;
}

const s = StyleSheet.create<Styles>({
  c: { flex: 1, backgroundColor: C.bg },
  p: { padding: 16, paddingBottom: 32 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16, backgroundColor: C.card, borderBottomWidth: 1, borderBottomColor: C.cardBorder },
  backBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  backTxt: { color: C.white, fontSize: 13, fontWeight: '700' },
  headerTitle: { color: C.white, fontSize: 14, fontWeight: '900', flex: 1 },
  formTitle: { color: C.white, fontSize: 13, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 0.5 },
  label: { color: C.textSecondary, fontSize: 9, fontWeight: '800' },
  selectorRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  chip: { backgroundColor: C.inputBg, borderWidth: 1, borderColor: C.cardBorder, borderRadius: 14, paddingHorizontal: 10, paddingVertical: 5 },
  chipActive: { backgroundColor: C.red, borderColor: C.red },
  chipText: { color: C.textSecondary, fontSize: 9, fontWeight: '800' },
  chipTextActive: { color: C.white },
  inputMultiline: { backgroundColor: C.inputBg, borderWidth: 1, borderColor: C.cardBorder, color: C.white, borderRadius: 8, padding: 10, fontSize: 12, height: 60, textAlignVertical: 'top' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: C.cardBorder, paddingBottom: 8, marginBottom: 8 },
  horseName: { color: C.white, fontSize: 13, fontWeight: '800' },
  badge: { borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2 },
  badgeText: { fontSize: 8, fontWeight: '900' },
  penaltyTxt: { color: '#E1A200', fontSize: 8, fontWeight: '900' },
  descText: { color: C.textSecondary, fontSize: 11, lineHeight: 14 },
});
