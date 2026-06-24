import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, ActivityIndicator, Alert, TextInput, Platform } from 'react-native';
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

  const loadData = React.useCallback(async () => {
    if (!raceId) return;
    setError(null);
    try {
      // 1. Load race detail
      const raceRes = await racesApi.get(raceId);
      if (raceRes) setRace(raceRes);

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
                <Text style={styles.emptyText}>Chưa chốt danh sách chiến mã cho cuộc đua này.</Text>
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
    borderRadius: premiumRadius[6],
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
