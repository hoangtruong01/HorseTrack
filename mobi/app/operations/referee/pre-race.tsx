import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, ActivityIndicator, Alert, TextInput, Platform, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { raceChecksApi, racesApi, type RaceItem } from '../../../lib/api-client';
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

export default function PreRaceChecksScreen() {
  const { raceId } = useLocalSearchParams<{ raceId: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = useThemeColors();
  const premiumColors = usePremiumColors();
  const styles = React.useMemo(() => getStyles(isDark, theme, insets, premiumColors), [isDark, theme, insets, premiumColors]);

  const [race, setRace] = useState<RaceItem | null>(null);
  const [checks, setChecks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Failure note state per check item ID
  const [failNotes, setFailNotes] = useState<Record<string, string>>({});
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Conditions and status state
  const [trackCondition, setTrackCondition] = useState('');
  const [weatherSnapshot, setWeatherSnapshot] = useState('');
  const [isSubmittingConditions, setIsSubmittingConditions] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);

  const loadData = React.useCallback(async () => {
    if (!raceId) return;
    setError(null);
    try {
      // 1. Load race detail
      const raceRes = await racesApi.get(raceId);
      if (raceRes) {
        setRace(raceRes);
        setTrackCondition(raceRes.trackCondition || '');
        setWeatherSnapshot(raceRes.weatherSnapshot || '');
      }

      // 2. Load pre-race check items
      const checksRes = await raceChecksApi.listByRace(raceId);
      if (checksRes) {
        setChecks((checksRes as any).data || checksRes);
      }
    } catch (err: any) {
      console.error('Lỗi tải kiểm duyệt trước đua:', err);
      setError(err.message || 'Không thể tải kiểm duyệt trước đua.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [raceId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (!raceId) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />
        <GridBackground isDark={isDark} />
        <ErrorState message="Thiếu thông tin cuộc đua.\n\nVui lòng quay lại danh sách phân công và chọn một cuộc đua." onRetry={() => router.back()} />
      </View>
    );
  }

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleUpdateRaceStatus = async (newStatus: string) => {
    setIsUpdatingStatus(true);
    try {
      await racesApi.updateStatus(raceId, newStatus);
      Alert.alert('Thành công', `Chuyển trạng thái sang ${newStatus} thành công!`);
      loadData();
    } catch (err: any) {
      Alert.alert('Lỗi', err.message || 'Không thể cập nhật trạng thái');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleUpdateConditions = async () => {
    setIsSubmittingConditions(true);
    try {
      await racesApi.updateConditions(raceId, { trackCondition, weatherSnapshot });
      Alert.alert('Thành công', 'Cập nhật điều kiện đường đua thành công!');
      loadData();
    } catch (err: any) {
      Alert.alert('Lỗi', err.message || 'Không thể cập nhật điều kiện');
    } finally {
      setIsSubmittingConditions(false);
    }
  };

  const handleInitializeChecks = async () => {
    setIsInitializing(true);
    try {
      await raceChecksApi.initialize(raceId);
      Alert.alert('Thành công', 'Khởi tạo danh sách kiểm duyệt thành công!');
      loadData();
    } catch (err: any) {
      Alert.alert('Lỗi', err.message || 'Lỗi khởi tạo');
    } finally {
      setIsInitializing(false);
    }
  };

  const handleUpdateCheck = async (checkId: string, status: 'passed' | 'failed') => {
    const notes = status === 'failed' ? failNotes[checkId] || 'Không đạt chuẩn sức khỏe' : undefined;

    setUpdatingId(checkId);
    try {
      await raceChecksApi.update(checkId, { status, healthNote: notes, jockeyCheckedIn: true });
      loadData();
    } catch (err: any) {
      Alert.alert('Thất bại', err.message || 'Lỗi cập nhật trạng thái.');
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'passed': return 'ĐẠT CHUẨN';
      case 'failed': return 'BỊ LOẠI';
      default: return 'CHƯA KIỂM TRA';
    }
  };

  const renderItem = ({ item }: { item: any }) => {
    const horse = item.horseId;
    if (!horse) return null;
    const isUpdating = updatingId === item._id;
    const isPassed = item.status === 'passed';
    const isFailed = item.status === 'failed';

    return (
      <View style={[styles.card, isPassed && styles.cardPassed, isFailed && styles.cardFailed]}>
        <View style={styles.cardHeader}>
          <View style={{ flex: 1 }}>
            <Text style={styles.horseName}>{horse.name.toUpperCase()}</Text>
            <Text style={styles.breedText}>{horse.breed || 'Thuần chủng'}</Text>
          </View>
          <View style={[styles.badge, isPassed && styles.badgePassed, isFailed && styles.badgeFailed]}>
            <Text style={[styles.badgeText, isPassed && styles.badgeTextPassed, isFailed && styles.badgeTextFailed]}>
              {getStatusText(item.status)}
            </Text>
          </View>
        </View>

        <View style={styles.cardBody}>
          <Text style={styles.bodyText}>Nài ngựa (Jockey): <Text style={styles.whiteBold}>{item.jockeyUserId?.fullName || 'Chưa gán'}</Text></Text>
          {item.notes && (
            <Text style={styles.bodyText}>Ghi chú trước: <Text style={styles.noteText}>{item.notes}</Text></Text>
          )}
        </View>

        {isUpdating ? (
          <ActivityIndicator color={premiumColors.brand} style={{ marginVertical: 12 }} />
        ) : (
          <View style={styles.actionsBox}>
            {item.status !== 'passed' && (
              <TouchableOpacity
                style={[styles.actionButton, styles.passedButton]}
                onPress={() => handleUpdateCheck(item._id, 'passed')}
                activeOpacity={0.8}
              >
                <MaterialIcons name="check-circle" size={16} color="#FFFFFF" />
                <Text style={styles.actionText}>XÁC NHẬN ĐẠT</Text>
              </TouchableOpacity>
            )}

            {item.status !== 'failed' && (
              <View style={styles.failActionContainer}>
                <TextInput
                  style={styles.notesInput}
                  value={failNotes[item._id] || ''}
                  onChangeText={(txt) => setFailNotes({ ...failNotes, [item._id]: txt })}
                  placeholder="Lý do loại..."
                  placeholderTextColor={premiumColors.textMuted}
                />
                <TouchableOpacity
                  style={[styles.actionButton, styles.failedButton]}
                  onPress={() => handleUpdateCheck(item._id, 'failed')}
                  activeOpacity={0.8}
                >
                  <MaterialIcons name="cancel" size={16} color="#FFFFFF" />
                  <Text style={styles.actionText}>LOẠI</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
      </View>
    );
  };

  const renderHeader = () => {
    if (!race) return null;
    const allPassed = checks.length > 0 && checks.every(c => c.status === 'passed');

    return (
      <View style={{ marginBottom: 20, gap: 16 }}>
        {/* Race Status Control Panel */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>TRẠNG THÁI CUỘC ĐUA HIỆN TẠI</Text>
          <View style={styles.statusRow}>
            <View style={styles.statusBadgeWrapper}>
              <Text style={styles.statusBadgeText}>{race.status}</Text>
            </View>
            <Text style={styles.statusRaceName}>{race.name.toUpperCase()}</Text>
          </View>

          <View style={styles.statusActions}>
            {race.status === 'SCHEDULED' && (
              <TouchableOpacity
                style={[styles.btnAction, { backgroundColor: '#EAB308' }]}
                onPress={() => handleUpdateRaceStatus('CHECKING')}
                disabled={isUpdatingStatus}
              >
                <Text style={styles.btnActionText}>MỞ ĐỢT KIỂM DUYỆT NGỰA</Text>
              </TouchableOpacity>
            )}

            {race.status === 'CHECKING' && (
              <TouchableOpacity
                style={[styles.btnAction, allPassed ? { backgroundColor: premiumColors.success } : { backgroundColor: premiumColors.border }]}
                onPress={() => handleUpdateRaceStatus('READY')}
                disabled={isUpdatingStatus || !allPassed}
              >
                <Text style={[styles.btnActionText, !allPassed && { color: premiumColors.textMuted }]}>{allPassed ? 'THIẾT LẬP SẴN SÀNG' : 'CHỜ DUYỆT TẤT CẢ NGỰA'}</Text>
              </TouchableOpacity>
            )}

            {race.status === 'READY' && (
              <TouchableOpacity
                style={[styles.btnAction, { backgroundColor: '#DC2626' }]}
                onPress={() => handleUpdateRaceStatus('LIVE')}
                disabled={isUpdatingStatus}
              >
                <Text style={styles.btnActionText}>XUẤT PHÁT TRẬN ĐẤU!</Text>
              </TouchableOpacity>
            )}

            {race.status === 'LIVE' && (
              <Text style={{ color: premiumColors.brand, fontSize: 12, fontWeight: '700' }}>
                TRẬN ĐẤU ĐANG DIỄN RA TRỰC TIẾP.
              </Text>
            )}
          </View>
        </View>

        {/* Race Conditions */}
        {race.status !== 'LIVE' && race.status !== 'FINISHED' && race.status !== 'RESULT_PUBLISHED' && race.status !== 'CANCELLED' && (
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>ĐIỀU KIỆN ĐƯỜNG ĐUA</Text>
            <Text style={styles.sectionSub}>Ghi nhận tình trạng mặt đường và thời tiết trước khi xuất phát.</Text>

            <View style={{ gap: 12, marginTop: 12 }}>
              <View>
                <Text style={styles.inputLabel}>Tình trạng mặt đường</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, marginTop: 4 }}>
                  {[
                    { label: 'Cỏ khô', value: 'Dry turf' },
                    { label: 'Cỏ ướt', value: 'Wet turf' },
                    { label: 'Bùn đất', value: 'Muddy' },
                    { label: 'Nhân tạo', value: 'Synthetic' },
                  ].map(opt => (
                    <TouchableOpacity
                      key={opt.value}
                      style={[
                        styles.chipButton,
                        trackCondition === opt.value && { backgroundColor: premiumColors.brand, borderColor: premiumColors.brand }
                      ]}
                      onPress={() => setTrackCondition(opt.value)}
                    >
                      <Text style={[
                        styles.chipText,
                        trackCondition === opt.value && { color: '#000', fontWeight: '800' }
                      ]}>{opt.label}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
              <View>
                <Text style={styles.inputLabel}>Thời tiết</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, marginTop: 4 }}>
                  {[
                    { label: 'Nắng', value: 'Sunny' },
                    { label: 'Mây', value: 'Cloudy' },
                    { label: 'Mưa', value: 'Rainy' },
                    { label: 'Gió', value: 'Windy' },
                  ].map(opt => (
                    <TouchableOpacity
                      key={opt.value}
                      style={[
                        styles.chipButton,
                        weatherSnapshot === opt.value && { backgroundColor: premiumColors.brand, borderColor: premiumColors.brand }
                      ]}
                      onPress={() => setWeatherSnapshot(opt.value)}
                    >
                      <Text style={[
                        styles.chipText,
                        weatherSnapshot === opt.value && { color: '#000', fontWeight: '800' }
                      ]}>{opt.label}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
              <TouchableOpacity
                style={[styles.btnAction, { backgroundColor: premiumColors.brand, alignSelf: 'flex-end', paddingHorizontal: 20 }]}
                onPress={handleUpdateConditions}
                disabled={isSubmittingConditions}
              >
                <Text style={[styles.btnActionText, { color: '#000' }]}>{isSubmittingConditions ? 'ĐANG LƯU...' : 'LƯU ĐIỀU KIỆN'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Checklist Header */}
        <View style={styles.checklistHeaderRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.sectionTitle}>BÁO CÁO KIỂM DUYỆT</Text>
          </View>
          {checks.length === 0 && race.status === 'CHECKING' && (
            <TouchableOpacity
              style={[styles.btnAction, { backgroundColor: premiumColors.brand, paddingHorizontal: 12 }]}
              onPress={handleInitializeChecks}
              disabled={isInitializing}
            >
              <Text style={[styles.btnActionText, { color: '#000', fontSize: 10 }]}>{isInitializing ? 'ĐANG XỬ LÝ...' : 'KHỞI TẠO KIỂM DUYỆT'}</Text>
            </TouchableOpacity>
          )}
        </View>
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
            <Text style={styles.headerTitle}>KIỂM TRA TRƯỚC ĐUA</Text>
          </View>
        </View>
        <View style={styles.headerLeft}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} activeOpacity={0.8}>
            <MaterialIcons name="arrow-back" size={20} color={theme.textPrimary} />
          </TouchableOpacity>
        </View>
        <View style={styles.headerRight} />
      </View>

      {race && (
        <View style={styles.raceHeaderCard}>
          <View style={styles.raceBadge}>
            <Text style={styles.raceBadgeText}>ĐANG CHUẨN BỊ</Text>
          </View>
          <Text style={styles.raceTitle}>{race.name.toUpperCase()}</Text>
          <Text style={styles.raceSub}>Rà soát kỹ lưỡng trạng thái chấn thương của ngựa và thông tin nài ngựa trước giờ đua.</Text>
        </View>
      )}

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={premiumColors.brand} />
          <Text style={styles.loadingText}>Đang tải danh sách điểm danh...</Text>
        </View>
      ) : (
        <FlatList
          data={checks}
          renderItem={renderItem}
          ListHeaderComponent={renderHeader}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContent}
          onRefresh={onRefresh}
          refreshing={refreshing}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            error ? (
              <View style={styles.emptyContainer}>
                <MaterialIcons name="error-outline" size={48} color={premiumColors.brand} />
                <Text style={[styles.emptyText, { color: premiumColors.brand }]}>{error}</Text>
              </View>
            ) : (
              <View style={styles.emptyCard}>
                <MaterialIcons name="pets" size={40} color={premiumColors.textMuted} />
                <Text style={styles.emptyText}>
                  {race?.status === 'SCHEDULED'
                    ? "Cuộc đua chưa mở đợt kiểm duyệt.\nVui lòng bấm 'MỞ ĐỢT KIỂM DUYỆT NGỰA'."
                    : "Danh sách kiểm duyệt chưa được khởi tạo.\nVui lòng bấm 'KHỞI TẠO KIỂM DUYỆT'."}
                </Text>
              </View>
            )
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
    paddingBottom: 100,
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

  // Section and Action Styles
  sectionCard: {
    backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : '#FFFFFF',
    borderWidth: 1,
    borderColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
    borderRadius: premiumRadius[16],
    padding: premiumSpacing[16],
  },
  sectionTitle: {
    color: premiumColors.brand,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 4,
  },
  sectionSub: {
    color: premiumColors.textSecondary,
    fontSize: 12,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 8,
  },
  statusBadgeWrapper: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
  },
  statusBadgeText: {
    color: premiumColors.text,
    fontSize: 10,
    fontWeight: '800',
  },
  statusRaceName: {
    color: premiumColors.text,
    fontSize: 14,
    fontWeight: '900',
  },
  statusActions: {
    marginTop: 12,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  btnAction: {
    height: 36,
    paddingHorizontal: 16,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnActionText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  inputLabel: {
    color: premiumColors.textMuted,
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  inputField: {
    backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#F9FAFB',
    borderWidth: 1,
    borderColor: premiumColors.border,
    borderRadius: premiumRadius[8],
    height: 40,
    paddingHorizontal: 12,
    color: premiumColors.text,
    fontSize: 13,
  },
  chipButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: premiumColors.border,
    backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#FFF',
  },
  chipText: {
    color: premiumColors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  checklistHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },

  // Race Header
  raceHeaderCard: {
    backgroundColor: isDark ? 'rgba(225, 6, 0, 0.05)' : '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: premiumColors.border,
    padding: premiumSpacing[20],
    paddingTop: premiumSpacing[16],
  },
  raceBadge: {
    alignSelf: 'flex-start',
    backgroundColor: isDark ? 'rgba(225, 6, 0, 0.2)' : 'rgba(225, 6, 0, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: premiumRadius[4],
    marginBottom: 8,
  },
  raceBadgeText: {
    color: premiumColors.brand,
    fontSize: 10,
    fontWeight: '800',
  },
  raceTitle: {
    color: premiumColors.text,
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  raceSub: {
    color: premiumColors.textSecondary,
    fontSize: 13,
    marginTop: 6,
    lineHeight: 18,
  },

  // Check Card
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
  cardPassed: {
    borderColor: isDark ? 'rgba(52, 211, 153, 0.3)' : 'rgba(52, 211, 153, 0.5)',
    backgroundColor: isDark ? 'rgba(52, 211, 153, 0.05)' : 'rgba(52, 211, 153, 0.02)',
  },
  cardFailed: {
    borderColor: isDark ? 'rgba(239, 68, 68, 0.3)' : 'rgba(239, 68, 68, 0.5)',
    backgroundColor: isDark ? 'rgba(239, 68, 68, 0.05)' : 'rgba(239, 68, 68, 0.02)',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottomWidth: 1,
    borderBottomColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
    paddingBottom: 12,
    marginBottom: 12,
  },
  horseName: {
    color: premiumColors.text,
    fontSize: 16,
    fontWeight: '800',
  },
  breedText: {
    color: premiumColors.textSecondary,
    fontSize: 12,
    marginTop: 4,
  },
  badge: {
    borderRadius: premiumRadius[8],
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: premiumColors.surface2,
  },
  badgePassed: {
    backgroundColor: isDark ? 'rgba(52, 211, 153, 0.15)' : 'rgba(52, 211, 153, 0.1)',
  },
  badgeFailed: {
    backgroundColor: isDark ? 'rgba(239, 68, 68, 0.15)' : 'rgba(239, 68, 68, 0.1)',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: premiumColors.textMuted,
  },
  badgeTextPassed: {
    color: premiumColors.success,
  },
  badgeTextFailed: {
    color: premiumColors.danger,
  },
  cardBody: {
    gap: 6,
    marginBottom: 16,
  },
  bodyText: {
    color: premiumColors.textSecondary,
    fontSize: 13,
  },
  whiteBold: {
    color: premiumColors.text,
    fontWeight: '700',
  },
  noteText: {
    color: '#E1A200',
    fontStyle: 'italic',
  },
  actionsBox: {
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 40,
    borderRadius: premiumRadius[8],
  },
  passedButton: {
    backgroundColor: premiumColors.success,
  },
  failedButton: {
    backgroundColor: premiumColors.danger,
    paddingHorizontal: 16,
  },
  actionText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  failActionContainer: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  notesInput: {
    flex: 1,
    backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#F9FAFB',
    borderWidth: 1,
    borderColor: premiumColors.border,
    borderRadius: premiumRadius[8],
    height: 40,
    paddingHorizontal: 12,
    color: premiumColors.text,
    fontSize: 13,
  },

  emptyCard: {
    backgroundColor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
    borderRadius: premiumRadius[16],
    padding: premiumSpacing[32],
    borderWidth: 1,
    borderColor: premiumColors.border,
    alignItems: 'center',
    justifyContent: 'center',
    gap: premiumSpacing[12],
    marginTop: premiumSpacing[24],
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyText: {
    color: premiumColors.textMuted,
    fontSize: 13,
    textAlign: 'center',
  },
});
