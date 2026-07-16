import React, { useCallback, useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View, ScrollView, RefreshControl } from 'react-native';
import { Section } from '@/components/ui/premium';
import { premiumSpacing, premiumRadius, usePremiumColors } from '@/components/ui/premium-tokens';
import { EmptyState, ErrorState, LoadingState, formatDateTime, useThemeColors } from '@/components/ui/shared';
import { rewardPointLedgerApi, walletApi } from '@/lib/api-client';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Stack, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColorScheme } from '@/hooks/use-color-scheme';

// Background Pattern
const GridBackground = ({ isDark }: { isDark: boolean }) => {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <View style={{ flex: 1, backgroundColor: isDark ? '#09090B' : '#F4F4F5' }} />
    </View>
  );
};

export default function RefereeWallet() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const theme = useThemeColors();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const premiumColors = usePremiumColors();
  const styles = React.useMemo(() => getStyles(premiumColors, isDark, theme, insets), [premiumColors, isDark, theme, insets]);

  const [balance, setBalance] = useState(0);
  const [history, setHistory] = useState<any[]>([]);
  const [cashouts, setCashouts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [redeemAmount, setRedeemAmount] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<'transactions' | 'cashouts'>('transactions');

  const loadData = useCallback(async () => {
    setError(null);
    try {
      const [balanceRes, historyRes, cashoutsRes] = await Promise.all([
        rewardPointLedgerApi.myBalance(),
        rewardPointLedgerApi.myHistory({ limit: 50 }),
        walletApi.myCashouts({ limit: 20 }).catch(() => ({ data: [] })),
      ]);
      setBalance(balanceRes.balance ?? 0);
      setHistory(historyRes.data || []);
      setCashouts((cashoutsRes as any).data || []);
    } catch (err: any) {
      setError(err.message || 'Không thể tải ví thưởng. Vui lòng thử lại.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData();
  }, [loadData]);

  const handleRedeem = async () => {
    const pts = parseInt(redeemAmount, 10);
    if (!pts || pts <= 0) {
      Alert.alert('Lỗi', 'Vui lòng nhập số điểm hợp lệ.');
      return;
    }
    if (pts > balance) {
      Alert.alert('Lỗi', 'Không đủ điểm để quy đổi.');
      return;
    }

    setSubmitting(true);
    try {
      await walletApi.requestCashout({ pointsToRedeem: pts });
      Alert.alert('Thành công', `Yêu cầu rút ${pts.toLocaleString()} điểm đã được gửi.`);
      setRedeemAmount('');
      loadData();
    } catch (err: any) {
      Alert.alert('Lỗi', err.message || 'Không thể tạo yêu cầu rút điểm.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading && !refreshing) {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <LoadingState />
      </>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <GridBackground isDark={isDark} />

      {/* Custom Sleek Header */}
      <View style={styles.customHeader}>
        <View style={[StyleSheet.absoluteFill, { paddingTop: Math.max(insets.top, 16), paddingBottom: 12 }]} pointerEvents="none">
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text style={styles.headerTitle}>VÍ TRỌNG TÀI</Text>
          </View>
        </View>
        <View style={styles.headerLeft}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} activeOpacity={0.8}>
            <MaterialIcons name="arrow-back" size={20} color={theme.textPrimary} />
          </TouchableOpacity>
        </View>
        <View style={styles.headerRight} />
      </View>

      <ScrollView 
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={premiumColors.brand}
            colors={[premiumColors.brand]}
          />
        }
      >
        
        {/* ── Balance Card ── */}
        <View style={styles.balanceCard}>
          <Text style={styles.balanceEyebrow}>ĐIỂM HIỆN TẠI</Text>
          <View style={styles.balanceRow}>
            <Text style={styles.balanceValue}>{balance.toLocaleString()}</Text>
            <Text style={styles.balanceUnit}> Pts</Text>
          </View>
        </View>

        {/* ── Segments Options ── */}
        <View style={styles.segmentContainer}>
          <TouchableOpacity
            style={[styles.segmentBtn, activeTab === 'transactions' && styles.segmentBtnActive]}
            onPress={() => setActiveTab('transactions')}
            activeOpacity={0.8}
          >
            <Text style={[styles.segmentText, activeTab === 'transactions' && styles.segmentTextActive]}>Lịch sử giao dịch</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.segmentBtn, activeTab === 'cashouts' && styles.segmentBtnActive]}
            onPress={() => setActiveTab('cashouts')}
            activeOpacity={0.8}
          >
            <Text style={[styles.segmentText, activeTab === 'cashouts' && styles.segmentTextActive]}>Yêu cầu quy đổi</Text>
          </TouchableOpacity>
        </View>

        {error ? (
          <ErrorState message={error} onRetry={loadData} />
        ) : activeTab === 'transactions' ? (
          <Section title={`Lịch sử giao dịch (${history.length})`}>
            {history.length === 0 ? (
              <EmptyState icon="history" title="Chưa có giao dịch" subtitle="Lịch sử điểm thưởng sẽ hiển thị tại đây." />
            ) : (
              <View style={styles.listContainer}>
                {history.map((item) => {
                  const delta = item.pointsDelta ?? 0;
                  const isPositive = delta >= 0;
                  
                  return (
                    <View key={item._id || item.id} style={styles.rowItem}>
                      <View style={styles.rowAvatar}>
                        <MaterialIcons name="payment" size={20} color={premiumColors.textSecondary} />
                      </View>
                      <View style={styles.rowInfo}>
                        <Text style={styles.rowTitle} numberOfLines={1}>{item.note || 'Giao dịch điểm thưởng'}</Text>
                        <Text style={styles.rowSubtitle} numberOfLines={1}>
                          {`${formatDateTime(item.createdAt)} · Số dư sau: ${(item.balanceAfter ?? 0).toLocaleString()} Pts`}
                        </Text>
                      </View>
                      <View style={styles.rowRight}>
                        <Text style={[styles.deltaText, { color: isPositive ? premiumColors.success : premiumColors.danger }]}>
                          {isPositive ? '+' : ''}{delta.toLocaleString()} Pts
                        </Text>
                      </View>
                    </View>
                  );
                })}
              </View>
            )}
          </Section>
        ) : (
          <View>
            {/* ── Redeem Card ── */}
            <View style={styles.redeemCard}>
              <Text style={styles.redeemTitle}>Yêu cầu rút điểm / quy đổi</Text>
              <TextInput
                style={styles.input}
                placeholder="Nhập số điểm cần rút..."
                placeholderTextColor={premiumColors.textMuted}
                keyboardType="numeric"
                value={redeemAmount}
                onChangeText={setRedeemAmount}
              />
              <TouchableOpacity
                style={[styles.btn, (balance <= 0 || submitting) && styles.btnDisabled]}
                onPress={handleRedeem}
                disabled={balance <= 0 || submitting}
                activeOpacity={0.8}
              >
                <Text style={styles.btnText}>{submitting ? 'Đang xử lý...' : 'Yêu cầu rút điểm'}</Text>
              </TouchableOpacity>
            </View>

            {/* ── Cashout Requests History ── */}
            <Section title={`Yêu cầu quy đổi đã gửi (${cashouts.length})`}>
              {cashouts.length === 0 ? (
                <EmptyState icon="receipt-long" title="Chưa có yêu cầu" subtitle="Bạn chưa gửi yêu cầu quy đổi điểm nào." />
              ) : (
                <View style={styles.listContainer}>
                  {cashouts.map((c) => {
                    const isPending = c.status === 'PENDING';
                    const statusColor = isPending ? premiumColors.warning : premiumColors.success;
                    const statusLabel = isPending ? 'Chờ xử lý' : c.status === 'COMPLETED' ? 'Hoàn thành' : c.status;
                    return (
                      <View key={c._id || c.id} style={styles.rowItem}>
                        <View style={styles.rowAvatar}>
                          <MaterialIcons name="swap-horiz" size={20} color={statusColor} />
                        </View>
                        <View style={styles.rowInfo}>
                          <Text style={styles.rowTitle} numberOfLines={1}>
                            Mã: {c.redemptionCode || c._id?.slice(-6)?.toUpperCase() || '---'}
                          </Text>
                          <Text style={styles.rowSubtitle} numberOfLines={1}>
                            {c.pointsRedeemed?.toLocaleString() || 0} Điểm · {formatDateTime(c.createdAt)}
                          </Text>
                        </View>
                        <View style={[styles.rowRight, { backgroundColor: statusColor + '18', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4 }]}>
                          <Text style={[styles.deltaText, { color: statusColor, fontSize: 11 }]}>{statusLabel}</Text>
                        </View>
                      </View>
                    );
                  })}
                </View>
              )}
            </Section>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const getStyles = (premiumColors: any, isDark: boolean, theme: any, insets: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: isDark ? '#09090B' : '#F4F4F5',
  },
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
  content: {
    paddingHorizontal: premiumSpacing[16],
    paddingTop: premiumSpacing[16],
    paddingBottom: premiumSpacing[48],
  },
  
  // ── Balance Card ──
  balanceCard: {
    backgroundColor: premiumColors.surface,
    borderRadius: premiumRadius[12],
    borderWidth: 1,
    borderColor: premiumColors.border,
    padding: premiumSpacing[20],
    marginBottom: premiumSpacing[24],
    alignItems: 'center',
  },
  balanceEyebrow: {
    fontSize: 11,
    fontWeight: '800',
    color: premiumColors.brand,
    letterSpacing: 1.5,
    marginBottom: premiumSpacing[12],
  },
  balanceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  balanceValue: {
    fontSize: 48,
    fontWeight: '900',
    color: premiumColors.text,
  },
  balanceUnit: {
    fontSize: 20,
    fontWeight: '700',
    color: premiumColors.textSecondary,
    marginLeft: 4,
  },

  // ── Segments ──
  segmentContainer: {
    flexDirection: 'row',
    backgroundColor: premiumColors.surface,
    borderRadius: premiumRadius[8],
    padding: 4,
    marginBottom: premiumSpacing[24],
    borderWidth: 1,
    borderColor: premiumColors.border,
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: premiumRadius[8],
    backgroundColor: 'transparent',
  },
  segmentBtnActive: {
    backgroundColor: premiumColors.surface2,
    borderWidth: 1,
    borderColor: premiumColors.borderSoft,
  },
  segmentText: {
    fontSize: 13,
    color: premiumColors.textSecondary,
    fontWeight: '500',
  },
  segmentTextActive: {
    color: premiumColors.text,
    fontWeight: '700',
  },

  // ── Redeem Card ──
  redeemCard: {
    backgroundColor: premiumColors.surface,
    borderRadius: premiumRadius[12],
    borderWidth: 1,
    borderColor: premiumColors.border,
    padding: premiumSpacing[16],
    marginBottom: premiumSpacing[32],
  },
  redeemTitle: {
    color: premiumColors.text,
    fontSize: 13,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: premiumSpacing[12],
  },
  input: {
    backgroundColor: premiumColors.surface2,
    borderWidth: 1,
    borderColor: premiumColors.borderSoft,
    color: premiumColors.text,
    borderRadius: premiumRadius[8],
    height: 48,
    paddingHorizontal: premiumSpacing[16],
    fontSize: 14,
    marginBottom: premiumSpacing[16],
  },
  btn: {
    backgroundColor: premiumColors.brand,
    height: 48,
    borderRadius: premiumRadius[8],
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnDisabled: {
    opacity: 0.5,
  },
  btnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },

  // ── Transaction List ──
  listContainer: {
    backgroundColor: premiumColors.surface,
    borderRadius: premiumRadius[12],
    borderWidth: 1,
    borderColor: premiumColors.border,
    overflow: 'hidden',
  },
  rowItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: premiumSpacing[16],
    borderBottomWidth: 1,
    borderBottomColor: premiumColors.border,
    gap: premiumSpacing[12],
  },
  rowAvatar: {
    width: 44,
    height: 44,
    borderRadius: premiumRadius[8],
    backgroundColor: premiumColors.surface2,
    borderWidth: 1,
    borderColor: premiumColors.border,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  rowInfo: {
    flex: 1,
    minWidth: 0,
  },
  rowTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: premiumColors.text,
    marginBottom: 4,
  },
  rowSubtitle: {
    fontSize: 12,
    color: premiumColors.textMuted,
  },
  rowRight: {
    flexShrink: 0,
    marginLeft: premiumSpacing[8],
  },
  deltaText: {
    fontSize: 14,
    fontWeight: '700',
  },
});
