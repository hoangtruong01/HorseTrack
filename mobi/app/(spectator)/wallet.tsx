import React, { useCallback, useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { AppScreen, Section } from '@/components/ui/premium';
import { premiumColors, premiumSpacing, premiumRadius } from '@/components/ui/premium-tokens';
import { EmptyState, ErrorState, LoadingState, formatDateTime } from '@/components/ui/shared';
import { rewardPointLedgerApi } from '@/lib/api-client';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

export default function SpectatorWallet() {
  const [balance, setBalance] = useState(0);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setError(null);
    try {
      const [balanceRes, historyRes] = await Promise.all([
        rewardPointLedgerApi.myBalance(),
        rewardPointLedgerApi.myHistory({ limit: 50 }),
      ]);
      setBalance(balanceRes.balance ?? 0);
      setHistory(historyRes.data || []);
    } catch (err: any) {
      setError(err.message || 'Không thể tải ví điểm. Vui lòng thử lại.');
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

        {/* ── Transaction History ── */}
        <Section title={`Lịch sử giao dịch (${history.length})`}>
          {error ? (
            <ErrorState message={error} onRetry={loadData} />
          ) : history.length === 0 ? (
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
    marginBottom: premiumSpacing[32],
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
