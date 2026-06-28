import { usePremiumColors, premiumSpacing, premiumRadius } from '@/components/ui/premium-tokens';
import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, ActivityIndicator, Alert, Platform } from 'react-native';
import { refereeAssignmentsApi, rewardPointLedgerApi } from '../../../lib/api-client';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useThemeColors } from '@/components/ui/shared';
import { Stack, Tabs, useRouter } from 'expo-router';

// Background Pattern
const GridBackground = ({ isDark }: { isDark: boolean }) => {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <View style={{ flex: 1, backgroundColor: isDark ? '#09090B' : '#F4F4F5' }} />
    </View>
  );
};

export default function AssignedRacesScreen() {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = useThemeColors();
  const premiumColors = usePremiumColors();
  const styles = React.useMemo(() => getStyles(isDark, theme, insets, premiumColors), [isDark, theme, insets, premiumColors]);

  const [assignments, setAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [balance, setBalance] = useState(0);
  const router = useRouter();

  const loadAssignments = React.useCallback(async () => {
    setError(null);
    try {
      const [res, balRes] = await Promise.all([
        refereeAssignmentsApi.myAssignments({ limit: 50 }),
        rewardPointLedgerApi.myBalance().catch(() => ({ balance: 0 }))
      ]);
      if (res) {
        setAssignments((res as any).data || res);
      }
      setBalance((balRes as any).balance || 0);
    } catch (err: any) {
      console.error('Lỗi lấy phân công trọng tài:', err);
      setError(err.message || 'Không thể tải danh sách phân công.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadAssignments();
  }, [loadAssignments]);

  const onRefresh = () => {
    setRefreshing(true);
    loadAssignments();
  };

  const handleRespond = async (assignmentId: string, response: 'accepted' | 'declined') => {
    const actionLabel = response === 'accepted' ? 'nhận phân công' : 'từ chối phân công';
    Alert.alert('Xác nhận', `Bạn có chắc muốn ${actionLabel} này?`, [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Đồng ý',
        onPress: async () => {
          try {
            await refereeAssignmentsApi.respond(assignmentId, response);
            Alert.alert('Thành công', 'Đã lưu phản hồi của bạn.');
            loadAssignments();
          } catch (err: any) {
            Alert.alert('Thất bại', err.message || 'Lỗi xử lý phản hồi.');
          }
        },
      },
    ]);
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'assigned': return 'ĐANG CHỜ NHẬN';
      case 'accepted': return 'ĐÃ NHẬN NHIỆM VỤ';
      case 'declined': return 'ĐÃ TỪ CHỐI';
      default: return status.toUpperCase();
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted': return premiumColors.success;
      case 'declined': return premiumColors.danger;
      default: return premiumColors.warning;
    }
  };

  const renderItem = ({ item }: { item: any }) => {
    const race = item.raceId;
    if (!race) return null;

    const isPending = item.status === 'assigned';
    const isAccepted = item.status === 'accepted';

    const startTimeStr = new Date(race.startTime).toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View>
            <Text style={styles.raceName}>{race.name.toUpperCase()}</Text>
            <Text style={styles.startTimeText}>Bắt đầu: {startTimeStr}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
            <Text style={[styles.statusBadgeText, { color: getStatusColor(item.status) }]}>{getStatusText(item.status)}</Text>
          </View>
        </View>

        <View style={styles.cardBody}>
          <Text style={styles.bodyText}>Vai trò: <Text style={styles.whiteBold}>{item.role === 'main' ? 'TRỌNG TÀI CHÍNH' : 'TRỢ LÝ TRỌNG TÀI'}</Text></Text>
          <Text style={styles.bodyText}>Trạng thái trận: <Text style={styles.whiteBold}>{race.status}</Text></Text>
        </View>

        {isPending && (
          <View style={styles.actionsContainer}>
            <TouchableOpacity
              style={[styles.actionButton, styles.rejectButton]}
              onPress={() => handleRespond(item._id, 'declined')}
              activeOpacity={0.8}
            >
              <Text style={styles.rejectButtonText}>TỪ CHỐI</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.acceptButton]}
              onPress={() => handleRespond(item._id, 'accepted')}
              activeOpacity={0.8}
            >
              <Text style={styles.acceptButtonText}>CHẤP NHẬN</Text>
            </TouchableOpacity>
          </View>
        )}

        {isAccepted && (
          <View style={styles.acceptedWorkContainer}>
            <TouchableOpacity
              style={styles.opsButton}
              onPress={() => router.push({ pathname: '/operations/referee/pre-race', params: { raceId: race._id } })}
              activeOpacity={0.8}
            >
              <MaterialIcons name="fact-check" size={18} color={premiumColors.brand} />
              <Text style={styles.opsButtonText}>ĐIỂM DANH</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.opsButton}
              onPress={() => router.push({ pathname: '/operations/referee/violation-log', params: { raceId: race._id } })}
              activeOpacity={0.8}
            >
              <MaterialIcons name="warning" size={18} color={premiumColors.warning} />
              <Text style={[styles.opsButtonText, { color: premiumColors.warning }]}>VI PHẠM</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.opsButton}
              onPress={() => router.push({ pathname: '/operations/referee/result-entry', params: { raceId: race._id } })}
              activeOpacity={0.8}
            >
              <MaterialIcons name="emoji-events" size={18} color={premiumColors.success} />
              <Text style={[styles.opsButtonText, { color: premiumColors.success }]}>KẾT QUẢ</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={premiumColors.brand} />
        <Text style={styles.loadingText}>Đang tải danh sách phân công...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <Tabs.Screen options={{ headerShown: false }} />

      <GridBackground isDark={isDark} />

      {/* Custom Sleek Header */}
      <View style={styles.customHeader}>
        <View style={[StyleSheet.absoluteFill, { paddingTop: Math.max(insets.top, 16), paddingBottom: 12 }]} pointerEvents="none">
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text style={styles.headerTitle}>NHIỆM VỤ</Text>
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

      <FlatList
        data={assignments}
        renderItem={renderItem}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContent}
        onRefresh={onRefresh}
        refreshing={refreshing}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          error ? (
            <View style={styles.emptyContainer}>
              <MaterialIcons name="error-outline" size={48} color={premiumColors.danger} />
              <Text style={[styles.emptyText, { color: premiumColors.danger }]}>{error}</Text>
            </View>
          ) : (
            <View style={styles.emptyContainer}>
              <MaterialIcons name="assignment-late" size={48} color={premiumColors.textMuted} />
              <Text style={styles.emptyText}>Bạn chưa nhận được phân công nào gần đây.</Text>
            </View>
          )
        }
      />
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
  listContent: {
    padding: premiumSpacing[16],
    paddingBottom: 110,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: premiumColors.textSecondary,
    fontSize: 14,
    marginTop: 12,
  },
  card: {
    backgroundColor: premiumColors.surface,
    borderWidth: 1,
    borderColor: premiumColors.border,
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
    alignItems: 'flex-start',
    borderBottomWidth: 1,
    borderBottomColor: premiumColors.border,
    paddingBottom: 12,
    marginBottom: 12,
  },
  raceName: {
    color: premiumColors.text,
    fontSize: 16,
    fontWeight: '900',
  },
  startTimeText: {
    color: premiumColors.textSecondary,
    fontSize: 12,
    marginTop: 4,
  },
  statusBadge: {
    borderRadius: premiumRadius[8],
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  statusBadgeText: {
    fontSize: 9,
    fontWeight: '900',
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
    fontWeight: '800',
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: premiumColors.border,
    paddingTop: 16,
  },
  actionButton: {
    flex: 1,
    height: 44,
    borderRadius: premiumRadius[24],
    alignItems: 'center',
    justifyContent: 'center',
  },
  rejectButton: {
    backgroundColor: premiumColors.surface2,
    borderWidth: 1,
    borderColor: premiumColors.border,
  },
  acceptButton: {
    backgroundColor: premiumColors.brand,
    shadowColor: premiumColors.brand,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  rejectButtonText: {
    color: premiumColors.textSecondary,
    fontSize: 12,
    fontWeight: '800',
  },
  acceptButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  acceptedWorkContainer: {
    flexDirection: 'row',
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: premiumColors.border,
    paddingTop: 16,
  },
  opsButton: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: premiumColors.surface2,
    borderWidth: 1,
    borderColor: premiumColors.border,
    borderRadius: premiumRadius[12],
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  opsButtonText: {
    color: premiumColors.brand,
    fontSize: 10,
    fontWeight: '800',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyText: {
    color: premiumColors.textSecondary,
    fontSize: 13,
    marginTop: 12,
    textAlign: 'center',
  },
});
