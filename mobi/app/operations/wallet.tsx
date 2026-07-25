import React, { useCallback, useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View, ScrollView, RefreshControl } from 'react-native';
import { Section } from '@/components/ui/premium';
import { premiumSpacing, premiumRadius, usePremiumColors } from '@/components/ui/premium-tokens';
import { EmptyState, ErrorState, LoadingState, formatDateTime, statusLabel, useThemeColors } from '@/components/ui/shared';
import { rewardPointLedgerApi, predictionsApi, walletApi } from '@/lib/api-client';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Stack, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuth } from '@/providers/auth-provider';

// Background Pattern
const GridBackground = ({ isDark }: { isDark: boolean }) => {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <View style={{ flex: 1, backgroundColor: isDark ? '#09090B' : '#F4F4F5' }} />
    </View>
  );
};

export default function SharedWallet() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const theme = useThemeColors();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const premiumColors = usePremiumColors();
  const styles = React.useMemo(() => getStyles(premiumColors, isDark, theme, insets), [premiumColors, isDark, theme, insets]);
  const { user } = useAuth();
  
  const isSpectator = user?.roles?.includes('spectator') || user?.roles?.[0] === 'spectator';

  const [balance, setBalance] = useState(0);
  const [history, setHistory] = useState<any[]>([]);
  const [cashouts, setCashouts] = useState<any[]>([]);
  const [predictions, setPredictions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [redeemAmount, setRedeemAmount] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<'transactions' | 'predictions' | 'cashouts'>('transactions');

  const loadData = useCallback(async () => {
    setError(null);
    try {
      const apiCalls: Promise<any>[] = [
        rewardPointLedgerApi.myBalance(),
        rewardPointLedgerApi.myHistory({ limit: 50 }),
        walletApi.myCashouts({ limit: 20 }).catch(() => ({ data: [] })),
      ];
      
      if (isSpectator) {
        apiCalls.push(predictionsApi.listMyPredictions({ limit: 50 }).catch(() => ({ data: [] })));
      } else {
        apiCalls.push(Promise.resolve({ data: [] })); // Dummy for non-spectators
      }

      const [balanceRes, historyRes, cashoutsRes, predictionsRes] = await Promise.all(apiCalls);
      
      setBalance(balanceRes.balance ?? 0);
      setHistory(historyRes.data || []);
      setCashouts((cashoutsRes as any).data || []);
      setPredictions((predictionsRes as any).data || []);
    } catch (err: any) {
      setError(err.message || 'Không thể tải ví thưởng. Vui lòng thử lại.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [isSpectator]);

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
            <Text style={styles.headerTitle}>VÍ ĐIỂM & GIAO DỊCH</Text>
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
          <MaterialIcons name="account-balance-wallet" size={140} color={isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)"} style={styles.balanceWatermark} />
          <View style={styles.balanceHeader}>
            <MaterialIcons name="stars" size={16} color={premiumColors.brand} />
            <Text style={styles.balanceEyebrow}>SỐ DƯ HIỆN TẠI</Text>
          </View>
          <View style={styles.balanceRow}>
            <Text style={styles.balanceValue}>{balance.toLocaleString()}</Text>
            <Text style={styles.balanceUnit}>Pts</Text>
          </View>
          {isSpectator && (
             <Text style={styles.balanceHint}>Dự đoán đúng nhận thưởng điểm, sai trừ điểm theo cấu hình hệ thống.</Text>
          )}
        </View>

        {/* ── Segments Options ── */}
        <View style={styles.segmentContainer}>
          <TouchableOpacity
            style={[styles.segmentBtn, activeTab === 'transactions' && styles.segmentBtnActive]}
            onPress={() => setActiveTab('transactions')}
            activeOpacity={0.8}
          >
            <Text style={[styles.segmentText, activeTab === 'transactions' && styles.segmentTextActive]}>Giao dịch</Text>
          </TouchableOpacity>
          {isSpectator && (
            <TouchableOpacity
              style={[styles.segmentBtn, activeTab === 'predictions' && styles.segmentBtnActive]}
              onPress={() => setActiveTab('predictions')}
              activeOpacity={0.8}
            >
              <Text style={[styles.segmentText, activeTab === 'predictions' && styles.segmentTextActive]}>Dự đoán</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={[styles.segmentBtn, activeTab === 'cashouts' && styles.segmentBtnActive]}
            onPress={() => setActiveTab('cashouts')}
            activeOpacity={0.8}
          >
            <Text style={[styles.segmentText, activeTab === 'cashouts' && styles.segmentTextActive]}>Quy đổi</Text>
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
                      <View style={[styles.rowAvatar, { backgroundColor: isPositive ? premiumColors.success + '15' : premiumColors.danger + '15', borderColor: isPositive ? premiumColors.success + '30' : premiumColors.danger + '30' }]}>
                        <MaterialIcons name={isPositive ? "arrow-downward" : "arrow-upward"} size={20} color={isPositive ? premiumColors.success : premiumColors.danger} />
                      </View>
                      <View style={styles.rowInfo}>
                        <Text style={styles.rowTitle} numberOfLines={1}>{item.note || 'Giao dịch điểm thưởng'}</Text>
                        <Text style={styles.rowSubtitle} numberOfLines={1}>
                          {`${formatDateTime(item.createdAt)} · Dư: ${(item.balanceAfter ?? 0).toLocaleString()}`}
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
        ) : activeTab === 'predictions' && isSpectator ? (
          <Section title={`Lịch sử dự đoán (${predictions.length})`}>
            {predictions.length === 0 ? (
              <View style={styles.emptyWrap}>
                <EmptyState icon="psychology" title="Chưa có dự đoán" subtitle="Bạn chưa đặt dự đoán cho trận đua nào. Hãy vào Giải đấu để bắt đầu!" />
                <TouchableOpacity
                  style={styles.emptyBtn}
                  onPress={() => router.push('/(spectator)/tournaments' as any)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.emptyBtnText}>Tạo dự đoán đầu tiên</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.listContainer}>
                {predictions.map((p) => {
                  const st = statusLabel(p.status);
                  const horse = typeof p.predictedHorseId === 'object' ? p.predictedHorseId?.name : 'Ngựa';
                  const race = typeof p.raceId === 'object' ? p.raceId?.name : 'Trận đua';
                  const rId = typeof p.raceId === 'object' ? p.raceId?._id : p.raceId;
                  
                  // Calculate points gain/loss display
                  let rewardDisplay = '';
                  let rewardColor = premiumColors.textSecondary;
                  if (p.status === 'WON') {
                    rewardDisplay = `+${p.rewardPoints || 0} Pts`;
                    rewardColor = premiumColors.success;
                  } else if (p.status === 'LOST') {
                    rewardDisplay = `-${p.betPoints || 0} Pts`;
                    rewardColor = premiumColors.danger;
                  } else if (p.status === 'PENDING') {
                    rewardDisplay = 'Đang chờ';
                    rewardColor = premiumColors.warning;
                  } else {
                    rewardDisplay = st.label;
                  }

                  return (
                    <TouchableOpacity
                      key={p._id || p.id}
                      style={styles.rowItem}
                      onPress={rId ? () => router.push(`/(spectator)/race/${rId}` as any) : undefined}
                      activeOpacity={rId ? 0.7 : 1}
                    >
                      <View style={[styles.rowAvatar, { backgroundColor: rewardColor + '15', borderColor: rewardColor + '30' }]}>
                        <MaterialIcons name="psychology" size={20} color={rewardColor} />
                      </View>
                      <View style={styles.rowInfo}>
                        <Text style={styles.rowTitle} numberOfLines={1}>{horse}</Text>
                        <Text style={styles.rowSubtitle} numberOfLines={1}>
                          {`Trận: ${race} · ${formatDateTime(p.createdAt)}`}
                        </Text>
                      </View>
                      <View style={styles.rowRight}>
                        <Text style={[styles.deltaText, { color: rewardColor }]}>
                          {rewardDisplay}
                        </Text>
                      </View>
                      {rId && (
                        <MaterialIcons name="chevron-right" size={16} color={premiumColors.textMuted} style={{ marginLeft: 4 }} />
                      )}
                    </TouchableOpacity>
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
                        <View style={[styles.rowAvatar, { backgroundColor: statusColor + '15', borderColor: statusColor + '30' }]}>
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
                        <View style={[styles.rowRight, { backgroundColor: statusColor + '18', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6 }]}>
                          <Text style={[styles.deltaText, { color: statusColor, fontSize: 12 }]}>{statusLabel}</Text>
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
    backgroundColor: isDark ? '#1E1D23' : premiumColors.surface,
    borderRadius: 24,
    padding: premiumSpacing[24],
    marginBottom: premiumSpacing[32],
    shadowColor: premiumColors.brand,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 10,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 1,
    borderColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
  },
  balanceWatermark: {
    position: 'absolute',
    right: -20,
    bottom: -20,
    transform: [{ rotate: '-15deg' }]
  },
  balanceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: premiumSpacing[12],
  },
  balanceEyebrow: {
    fontSize: 11,
    fontWeight: '800',
    color: isDark ? '#9CA3AF' : premiumColors.textSecondary,
    letterSpacing: 1.5,
  },
  balanceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: premiumSpacing[4],
  },
  balanceValue: {
    fontSize: 48,
    fontWeight: '900',
    color: isDark ? '#FFFFFF' : premiumColors.text,
    letterSpacing: -1,
  },
  balanceUnit: {
    fontSize: 20,
    fontWeight: '700',
    color: premiumColors.brand,
    marginLeft: 8,
  },
  balanceHint: {
    fontSize: 12,
    color: isDark ? 'rgba(255,255,255,0.6)' : premiumColors.textMuted,
    lineHeight: 18,
    marginTop: premiumSpacing[12],
  },

  // ── Segments ──
  segmentContainer: {
    flexDirection: 'row',
    backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
    borderRadius: 30,
    padding: 4,
    marginBottom: premiumSpacing[24],
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 26,
    backgroundColor: 'transparent',
  },
  segmentBtnActive: {
    backgroundColor: premiumColors.surface,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  segmentText: {
    fontSize: 13,
    color: premiumColors.textSecondary,
    fontWeight: '600',
  },
  segmentTextActive: {
    color: premiumColors.text,
    fontWeight: '800',
  },

  // ── Redeem Card ──
  redeemCard: {
    backgroundColor: premiumColors.surface,
    borderRadius: premiumRadius[16],
    borderWidth: 1,
    borderColor: premiumColors.border,
    padding: premiumSpacing[20],
    marginBottom: premiumSpacing[32],
  },
  redeemTitle: {
    color: premiumColors.text,
    fontSize: 13,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: premiumSpacing[16],
  },
  input: {
    backgroundColor: premiumColors.surface2,
    borderWidth: 1,
    borderColor: premiumColors.borderSoft,
    color: premiumColors.text,
    borderRadius: premiumRadius[12],
    height: 52,
    paddingHorizontal: premiumSpacing[16],
    fontSize: 15,
    marginBottom: premiumSpacing[16],
  },
  btn: {
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
  btnDisabled: {
    opacity: 0.5,
    shadowOpacity: 0,
  },
  btnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 15,
  },

  // ── Transaction List ──
  listContainer: {
    gap: premiumSpacing[12],
  },
  rowItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: premiumColors.surface,
    padding: premiumSpacing[16],
    borderRadius: premiumRadius[12],
    borderWidth: 1,
    borderColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
    gap: premiumSpacing[12],
  },
  rowAvatar: {
    width: 44,
    height: 44,
    borderRadius: premiumRadius[12],
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
    fontSize: 15,
    fontWeight: '700',
    color: premiumColors.text,
    marginBottom: 4,
  },
  rowSubtitle: {
    fontSize: 13,
    color: premiumColors.textMuted,
  },
  rowRight: {
    flexShrink: 0,
    alignItems: 'flex-end',
  },
  deltaText: {
    fontSize: 15,
    fontWeight: '800',
  },

  // ── Empty State ──
  emptyWrap: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  emptyBtn: {
    backgroundColor: premiumColors.brand,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 22,
    alignItems: 'center',
    marginTop: 16,
  },
  emptyBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 13,
  },
});
