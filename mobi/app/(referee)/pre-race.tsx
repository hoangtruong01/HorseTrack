import React, { useEffect, useState, useCallback } from 'react';
import Animated, { FadeIn, FadeOut, SlideInRight, SlideOutRight } from 'react-native-reanimated';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, TextInput, Alert, ActivityIndicator } from 'react-native';
import { AppScreen, Section } from '@/components/ui/premium';
import { premiumColors, premiumSpacing, premiumRadius, usePremiumColors } from '@/components/ui/premium-tokens';
import { LoadingState, EmptyState, useThemeColors } from '@/components/ui/shared';
import { refereeAssignmentsApi, raceChecksApi, rewardPointLedgerApi } from '@/lib/api-client';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Stack, Tabs, useRouter } from 'expo-router';

// Background Pattern
const GridBackground = ({ isDark }: { isDark: boolean }) => {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <View style={{ flex: 1, backgroundColor: isDark ? '#09090B' : '#F4F4F5' }} />
    </View>
  );
};

export default function RefereePreRace() {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = useThemeColors();
  const premiumColors = usePremiumColors();
  const styles = React.useMemo(() => getStyles(isDark, theme, insets, premiumColors), [isDark, theme, insets, premiumColors]);

  const [assignments, setAssignments] = useState<any[]>([]);
  const [selectedRaceId, setSelectedRaceId] = useState<string | null>(null);
  const [selectedRaceName, setSelectedRaceName] = useState<string>('');
  const [checks, setChecks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingChecks, setLoadingChecks] = useState(false);
  const [failNotes, setFailNotes] = useState<Record<string, string>>({});
  const [jockeyPresent, setJockeyPresent] = useState<Record<string, boolean>>({});
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [balance, setBalance] = useState(0);
  const router = useRouter();

  useEffect(() => {
    rewardPointLedgerApi.myBalance()
      .then((res: any) => setBalance(res.balance || 0))
      .catch(() => { });
  }, []);

  const loadAssignments = useCallback(async () => {
    try {
      const res = await refereeAssignmentsApi.myAssignments({ limit: 50 });
      const list = (res as any).data || res || [];
      // Only show accepted assignments
      setAssignments(list.filter((a: any) => a.status === 'accepted'));
    } catch { } finally { setLoading(false); }
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
    setLoadingChecks(true);
    try {
      const checksRes = await raceChecksApi.listByRace(raceId);
      setChecks(checksRes.data || checksRes || []);
    } catch {
      setChecks([]);
    } finally {
      setLoadingChecks(false);
    }
  };

  const handleUpdateCheck = async (checkId: string, status: 'passed' | 'failed') => {
    // Warn if marking as passed but jockey not confirmed present
    if (status === 'passed' && !jockeyPresent[checkId]) {
      Alert.alert(
        'Xác nhận điểm danh',
        'Jockey chưa được xác nhận có mặt. Bạn có muốn tiếp tục không?',
        [
          { text: 'Hủy', style: 'cancel' },
          {
            text: 'Tiếp tục',
            onPress: () => doUpdate(checkId, status, false),
          },
        ]
      );
      return;
    }
    doUpdate(checkId, status, jockeyPresent[checkId] ?? false);
  };

  const doUpdate = async (checkId: string, status: 'passed' | 'failed', checkedIn: boolean) => {
    const notes = status === 'failed' ? failNotes[checkId] || 'Không đạt chuẩn sức khỏe' : undefined;
    setUpdatingId(checkId);
    try {
      await raceChecksApi.update(checkId, { status, healthNote: notes, jockeyCheckedIn: checkedIn });
      Alert.alert('Thành công', 'Đã cập nhật trạng thái kiểm tra.');
      if (selectedRaceId) {
        const checksRes = await raceChecksApi.listByRace(selectedRaceId);
        setChecks(checksRes.data || checksRes || []);
      }
    } catch (err: any) {
      Alert.alert('Lỗi', err.message || 'Lỗi cập nhật trạng thái.');
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading && !refreshing) return <LoadingState />;

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <Tabs.Screen options={{ headerShown: false }} />
      <GridBackground isDark={isDark} />

      {!selectedRaceId ? (
        <Animated.View style={styles.flex1} entering={FadeIn} exiting={FadeOut}>
          {/* Custom Sleek Header */}
          <View style={styles.customHeader}>
            <View style={[StyleSheet.absoluteFill, { paddingTop: Math.max(insets.top, 16), paddingBottom: 12 }]} pointerEvents="none">
              <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <Text style={styles.headerTitle}>KIỂM TRA</Text>
              </View>
            </View>
            <View style={styles.headerLeft} />
            <View style={styles.headerRight}>
              <TouchableOpacity style={styles.headerWallet} activeOpacity={0.8} onPress={() => router.push('/operations/referee/wallet')}>
                <MaterialIcons name="account-balance-wallet" size={16} color={theme.textPrimary} />
                <Text style={styles.headerWalletText}>{balance.toLocaleString()}</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.content}>
            <Section title="Chọn trận đua cần điểm danh / kiểm tra">
              {assignments.length === 0 ? (
                <EmptyState icon="checklist" title="Chưa có nhiệm vụ đã nhận" subtitle="Vui lòng nhận phân công ở tab Phân công trước." />
              ) : (
                assignments.map(a => {
                  const race = a.raceId;
                  if (!race) return null;
                  return (
                    <TouchableOpacity
                      key={a._id || a.id}
                      style={styles.assignmentCard}
                      onPress={() => selectRace(race._id || race.id, race.name)}
                      activeOpacity={0.8}
                    >
                      <View style={styles.cardIconWrap}>
                        <MaterialIcons name="checklist" size={20} color={premiumColors.brand} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.assignmentTitle} numberOfLines={1}>{race.name}</Text>
                        <Text style={styles.assignmentSubtitle} numberOfLines={1}>Trạng thái: {race.status}</Text>
                      </View>
                      <MaterialIcons name="chevron-right" size={20} color={premiumColors.textMuted} />
                    </TouchableOpacity>
                  );
                })
              )}
            </Section>
          </View>
        </Animated.View>
      ) : (
        <Animated.View style={styles.flex1} entering={SlideInRight} exiting={SlideOutRight}>

      {/* Custom Sleek Header */}
      <View style={styles.customHeader}>
        <View style={[StyleSheet.absoluteFill, { paddingTop: Math.max(insets.top, 16), paddingBottom: 12 }]} pointerEvents="none">
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text style={styles.headerTitle} numberOfLines={1}>{selectedRaceName.toUpperCase()}</Text>
          </View>
        </View>
        <View style={styles.headerLeft}>
          <TouchableOpacity style={styles.backBtn} onPress={() => setSelectedRaceId(null)} activeOpacity={0.8}>
            <MaterialIcons name="arrow-back" size={20} color={theme.textPrimary} />
          </TouchableOpacity>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.headerWallet} activeOpacity={0.8} onPress={() => router.push('/operations/referee/wallet')}>
            <MaterialIcons name="account-balance-wallet" size={16} color={theme.textPrimary} />
            <Text style={styles.headerWalletText}>{balance.toLocaleString()}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {loadingChecks && !refreshing ? <LoadingState /> : (
        <FlatList
          data={checks}
          keyExtractor={(item) => item._id || item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <EmptyState icon="pets" title="Chưa chốt danh sách ngựa" subtitle="Cuộc đua này chưa có danh sách chiến mã tham gia." />
          }
          renderItem={({ item }) => {
            const horse = item.horseId;
            if (!horse) return null;
            const isUpdating = updatingId === (item._id || item.id);
            const isPassed = item.status === 'passed';
            const isFailed = item.status === 'failed';

            return (
              <View style={[styles.checkCard, isPassed && styles.cardPassed, isFailed && styles.cardFailed]}>
                <View style={styles.cardHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.horseName}>{horse.name.toUpperCase()}</Text>
                    <Text style={styles.jockeyName}>Nài ngựa: {item.jockeyUserId?.fullName || 'Chưa gán'}</Text>
                  </View>
                  <View style={[
                    styles.badge,
                    isPassed && styles.badgePassed,
                    isFailed && styles.badgeFailed
                  ]}>
                    <Text style={[
                      styles.badgeText,
                      isPassed && styles.badgeTextPassed,
                      isFailed && styles.badgeTextFailed
                    ]}>
                      {isPassed ? 'ĐẠT CHUẨN' : isFailed ? 'BỊ LOẠI' : 'CHƯA CHECK'}
                    </Text>
                  </View>
                </View>

                {isUpdating ? <ActivityIndicator color={premiumColors.brand} style={{ marginVertical: 12 }} /> : (
                  <View style={styles.actionRow}>
                    {/* Jockey Check-in toggle */}
                    {!isPassed && !isFailed && (
                      <TouchableOpacity
                        style={styles.checkInRow}
                        onPress={() => setJockeyPresent(prev => ({ ...prev, [item._id || item.id]: !prev[item._id || item.id] }))}
                        activeOpacity={0.8}
                      >
                        <View style={[styles.checkbox, jockeyPresent[item._id || item.id] && styles.checkboxChecked]}>
                          {jockeyPresent[item._id || item.id] && <MaterialIcons name="check" size={12} color="#FFFFFF" />}
                        </View>
                        <Text style={styles.checkInLabel}>Jockey đã có mặt tại khu vực xuất phát</Text>
                      </TouchableOpacity>
                    )}
                    {!isPassed && (
                      <TouchableOpacity
                        style={[styles.btn, styles.btnPass]}
                        onPress={() => handleUpdateCheck(item._id || item.id, 'passed')}
                        activeOpacity={0.8}
                      >
                        <MaterialIcons name="check-circle" size={16} color="#FFFFFF" style={{ marginRight: 8 }} />
                        <Text style={styles.btnTxt}>XÁC NHẬN ĐẠT</Text>
                      </TouchableOpacity>
                    )}
                    {!isFailed && (
                      <View style={styles.failContainer}>
                        <TextInput
                          style={styles.input}
                          placeholder="Lý do loại..."
                          placeholderTextColor={premiumColors.textMuted}
                          value={failNotes[item._id || item.id] || ''}
                          onChangeText={txt => setFailNotes({ ...failNotes, [item._id || item.id]: txt })}
                        />
                        <TouchableOpacity
                          style={[styles.btn, styles.btnFail]}
                          onPress={() => handleUpdateCheck(item._id || item.id, 'failed')}
                          activeOpacity={0.8}
                        >
                          <MaterialIcons name="cancel" size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
                          <Text style={styles.btnTxt}>LOẠI</Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                )}
              </View>
            );
          }}
        />
      )}
        </Animated.View>
      )}
    </View>
  );
}

const getStyles = (isDark: boolean, theme: any, insets: any, premiumColors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: isDark ? '#09090B' : '#F4F4F5',
  },
  flex1: {
    flex: 1,
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
  headerWallet: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
    minWidth: 36,
    justifyContent: 'center',
  },
  headerWalletText: {
    color: theme.textPrimary,
    fontSize: 13,
    fontWeight: '800',
  },
  content: {
    paddingHorizontal: premiumSpacing[16],
    paddingTop: premiumSpacing[16],
    paddingBottom: 100,
  },
  listContent: {
    padding: premiumSpacing[16],
    paddingBottom: 100,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
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
  checkCard: {
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
  jockeyName: {
    color: premiumColors.textSecondary,
    fontSize: 13,
    marginTop: 4,
  },
  badge: {
    borderRadius: premiumRadius[4],
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
  actionRow: {
    flexDirection: 'column',
    gap: 12,
  },
  failContainer: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  btn: {
    flexDirection: 'row',
    height: 40,
    borderRadius: premiumRadius[8],
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  btnPass: {
    backgroundColor: premiumColors.success,
  },
  btnFail: {
    backgroundColor: premiumColors.danger,
  },
  btnTxt: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  input: {
    flex: 1,
    backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#F9FAFB',
    borderWidth: 1,
    borderColor: premiumColors.border,
    color: premiumColors.text,
    borderRadius: premiumRadius[8],
    height: 40,
    paddingHorizontal: 12,
    fontSize: 13,
  },
  checkInRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: premiumColors.border,
    backgroundColor: premiumColors.surface2,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  checkboxChecked: {
    borderColor: premiumColors.success,
    backgroundColor: premiumColors.success,
  },
  checkInLabel: {
    flex: 1,
    color: premiumColors.textSecondary,
    fontSize: 13,
  },
});
