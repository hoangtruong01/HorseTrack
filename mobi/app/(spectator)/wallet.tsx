import React, { useCallback, useEffect, useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { AppScreen, Section } from '@/components/ui/premium';
import { premiumColors, premiumSpacing, premiumRadius } from '@/components/ui/premium-tokens';
import { EmptyState, ErrorState, LoadingState, formatDateTime, statusLabel } from '@/components/ui/shared';
import { rewardPointLedgerApi, predictionsApi } from '@/lib/api-client';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

export default function SpectatorWallet() {
  const router = useRouter();
  const [balance, setBalance] = useState(0);
  const [history, setHistory] = useState<any[]>([]);
  const [predictions, setPredictions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'transactions' | 'predictions'>('transactions');

  const loadData = useCallback(async () => {
    setError(null);
    try {
      const [balanceRes, historyRes, predictionsRes] = await Promise.all([
        rewardPointLedgerApi.myBalance(),
        rewardPointLedgerApi.myHistory({ limit: 50 }),
        predictionsApi.listMyPredictions({ limit: 50 }).catch(() => ({ data: [] })),
      ]);
      setBalance(balanceRes.balance ?? 0);
      setHistory(historyRes.data || []);
      setPredictions((predictionsRes as any).data || []);
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
            <Text style={[styles.segmentText, activeTab === 'transactions' && styles.segmentTextActive]}>Lịch sử giao dịch</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.segmentBtn, activeTab === 'predictions' && styles.segmentBtnActive]}
            onPress={() => setActiveTab('predictions')}
            activeOpacity={0.8}
          >
            <Text style={[styles.segmentText, activeTab === 'predictions' && styles.segmentTextActive]}>Lịch sử dự đoán</Text>
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
        ) : (
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
    borderRadius: premiumRadius[6],
    backgroundColor: 'transparent',
  },
  segmentBtnActive: {
    backgroundColor: premiumColors.surfaceStrong,
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
