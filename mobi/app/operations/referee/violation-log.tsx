import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, ActivityIndicator, Alert, TextInput, SafeAreaView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { raceChecksApi, raceViolationsApi, racesApi, type RaceItem } from '../../../lib/api-client';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { ErrorState } from '../../../components/ui/shared';

export default function ViolationLogScreen() {
  const { raceId } = useLocalSearchParams<{ raceId: string }>();
  const router = useRouter();

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
    return <ErrorState message="Thiếu thông tin cuộc đua.\n\nVui lòng quay lại danh sách phân công và chọn một cuộc đua." onRetry={() => router.back()} />;
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
      case 'critical': return '#E10600';
      case 'major': return '#E1A200';
      default: return '#067E6A';
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

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#E10600" />
        <Text style={styles.loadingText}>Đang tải dữ liệu vi phạm...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={violations}
        renderItem={renderViolationItem}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View style={styles.headerForm}>
            {/* Automatic Penalty Alert */}
            <View style={styles.alertBox}>
              <MaterialIcons name="info" size={18} color="#E1A200" />
              <Text style={styles.alertText}>
                {"Hình phạt \"Cộng giây\" được tự động tính vào thời gian đua: Nhẹ (+3s), Trung bình (+6s), Nặng (+12s)."}
              </Text>
            </View>

            {/* Quick Add Form */}
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
              placeholderTextColor="#58585B"
              multiline
              numberOfLines={3}
            />

            <TouchableOpacity 
              style={[styles.submitButton, submitting && styles.disabledButton]}
              onPress={handleSubmit}
              disabled={submitting}
            >
              {submitting ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={styles.submitButtonText}>LẬP BIÊN BẢN VI PHẠM</Text>
              )}
            </TouchableOpacity>

            <Text style={styles.historyTitle}>NHẬT KÝ VI PHẠM TRẬN ĐẤU</Text>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialIcons name="check-circle" size={40} color="#067E6A" />
            <Text style={styles.emptyText}>Trận đấu chưa ghi nhận lỗi vi phạm nào.</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1C1C25',
  },
  listContent: {
    padding: 16,
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
  headerForm: {
    marginBottom: 20,
  },
  alertBox: {
    flexDirection: 'row',
    backgroundColor: 'rgba(225, 162, 0, 0.05)',
    borderWidth: 1,
    borderColor: '#E1A200',
    borderRadius: 8,
    padding: 10,
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  alertText: {
    color: '#AAAAAA',
    fontSize: 11,
    flex: 1,
    lineHeight: 14,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1,
    marginBottom: 16,
    borderLeftWidth: 2,
    borderLeftColor: '#E10600',
    paddingLeft: 8,
  },
  label: {
    color: '#AAAAAA',
    fontSize: 9,
    fontWeight: '800',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  selectorsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 16,
  },
  selectorChip: {
    backgroundColor: '#15151E',
    borderWidth: 1,
    borderColor: '#303037',
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  selectorChipActive: {
    backgroundColor: '#E10600',
    borderColor: '#E10600',
  },
  selectorChipText: {
    color: '#AAAAAA',
    fontSize: 10,
    fontWeight: '800',
  },
  selectorChipTextActive: {
    color: '#FFFFFF',
  },
  textInput: {
    backgroundColor: '#15151E',
    borderWidth: 1,
    borderColor: '#303037',
    borderRadius: 8,
    padding: 12,
    color: '#FFFFFF',
    fontSize: 12,
    textAlignVertical: 'top',
    height: 70,
    marginBottom: 16,
  },
  submitButton: {
    backgroundColor: '#E10600',
    borderRadius: 24,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  disabledButton: {
    backgroundColor: '#58585B',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  historyTitle: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1,
    marginBottom: 12,
    borderLeftWidth: 2,
    borderLeftColor: '#E10600',
    paddingLeft: 8,
  },
  historyCard: {
    backgroundColor: '#15151E',
    borderWidth: 1,
    borderColor: '#303037',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  severityBadge: {
    borderRadius: 4,
    paddingHorizontal: 5,
    paddingVertical: 2,
  },
  severityText: {
    color: '#FFFFFF',
    fontSize: 7,
    fontWeight: '900',
  },
  typeText: {
    color: '#AAAAAA',
    fontSize: 8,
    fontWeight: '800',
  },
  penaltyText: {
    color: '#E1A200',
    fontSize: 8,
    fontWeight: '900',
  },
  horseLabel: {
    color: '#AAAAAA',
    fontSize: 11,
    marginBottom: 4,
  },
  whiteBold: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  descText: {
    color: '#AAAAAA',
    fontSize: 11,
    lineHeight: 14,
    marginBottom: 6,
  },
  timeText: {
    color: '#58585B',
    fontSize: 9,
    textAlign: 'right',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    color: '#AAAAAA',
    fontSize: 12,
    marginTop: 8,
  },
});
