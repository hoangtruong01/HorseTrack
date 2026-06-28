import React, { useCallback, useEffect, useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Alert, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { AppScreen, Section } from '@/components/ui/premium';
import { premiumColors, premiumSpacing, premiumRadius } from '@/components/ui/premium-tokens';
import { EmptyState, ErrorState, LoadingState, formatDateTime, statusLabel } from '@/components/ui/shared';
import { rewardPointLedgerApi, predictionsApi, walletApi } from '@/lib/api-client';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

export default function SpectatorWallet() {
  const router = useRouter();
  const [balance, setBalance] = useState(0);
  const [history, setHistory] = useState<any[]>([]);
  const [predictions, setPredictions] = useState<any[]>([]);
  const [cashouts, setCashouts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [redeemAmount, setRedeemAmount] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<'transactions' | 'predictions' | 'cashouts'>('transactions');

  const loadData = useCallback(async () => {
    setError(null);
    try {
      const [balanceRes, historyRes, predictionsRes, cashoutsRes] = await Promise.all([
        rewardPointLedgerApi.myBalance(),
        rewardPointLedgerApi.myHistory({ limit: 50 }),
        predictionsApi.listMyPredictions({ limit: 50 }).catch(() => ({ data: [] })),
        walletApi.myCashouts({ limit: 20 }).catch(() => ({ data: [] })),
      ]);
      setBalance(balanceRes.balance ?? 0);
      setHistory(historyRes.data || []);
      setPredictions((predictionsRes as any).data || []);
      setCashouts((cashoutsRes as any).data || []);
    } catch (err: any) {
      setError(err.message || 'Không thể tải thông tin ví điểm. Vui lòng thử lại.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

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

  if (loading && !refreshing) return <LoadingState />;

  return (
    <AppScreen scroll refreshing={refreshing} onRefresh={onRefresh}>
      <View style={styles.content}>
        
        {/* ── Header Card ── */}
        <View style={styles.balanceCard}>
          <Text style={styles.balanceEyebrow}>ĐIỂM HIỆN TẠI</Text>
          <View style={styles.balanceRow}>
            <Text style={styles.balanceValue}>{balance.toLocaleString()}</Text>
            <Text style={styles.balanceUnit}> Pts</Text>
          </View>
          <Text style={styles.balanceHint}>Dự đoán đúng nhận thưởng điểm, sai trừ điểm theo cấu hình hệ thống.</Text>
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
          <TouchableOpacity
            style={[styles.segmentBtn, activeTab === 'predictions' && styles.segmentBtnActive]}
            onPress={() => setActiveTab('predictions')}
            activeOpacity={0.8}
          >
            <Text style={[styles.segmentText, activeTab === 'predictions' && styles.segmentTextActive]}>Dự đoán</Text>
          </TouchableOpacity>
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
                      <View style={styles.rowAvatar}>
                        <MaterialIcons name="swap-vert" size={20} color={premiumColors.textSecondary} />
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
        ) : activeTab === 'predictions' ? (
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
                      <View style={styles.rowAvatar}>
                        <MaterialIcons name="psychology" size={20} color={premiumColors.textSecondary} />
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

      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: premiumSpacing[16],
    paddingTop: premiumSpacing[24],
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
    marginBottom: premiumSpacing[12],
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
  balanceHint: {
    fontSize: 12,
    color: premiumColors.textMuted,
    textAlign: 'center',
    lineHeight: 18,
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
