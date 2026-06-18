import React, { useCallback, useEffect, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { C, Card, EmptyState, ErrorState, ListItemCard, LoadingState, SectionHeader, formatDateTime, statusLabel } from '@/components/ui/shared';
import { rewardPointLedgerApi, predictionsApi } from '@/lib/api-client';

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

  if (loading) return <LoadingState />;

  return (
    <ScrollView
      style={s.c}
      contentContainerStyle={s.p}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.red} colors={[C.red]} />}
    >
      {/* Wallet Balance Card */}
      <Card>
        <Text style={s.label}>ĐIỂM HIỆN TẠI</Text>
        <Text style={s.balance}>
          {balance.toLocaleString()} <Text style={s.unit}>Pts</Text>
        </Text>
        <Text style={s.hint}>Dự đoán đúng nhận điểm thưởng, sai trừ điểm cược tương ứng.</Text>
      </Card>

      {/* Segments Options */}
      <View style={s.segmentContainer}>
        <TouchableOpacity
          style={[s.segmentBtn, activeTab === 'transactions' && s.segmentBtnActive]}
          onPress={() => setActiveTab('transactions')}
          activeOpacity={0.8}
        >
          <Text style={[s.segmentText, activeTab === 'transactions' && s.segmentTextActive]}>Lịch sử giao dịch</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[s.segmentBtn, activeTab === 'predictions' && s.segmentBtnActive]}
          onPress={() => setActiveTab('predictions')}
          activeOpacity={0.8}
        >
          <Text style={[s.segmentText, activeTab === 'predictions' && s.segmentTextActive]}>Lịch sử dự đoán</Text>
        </TouchableOpacity>
      </View>

      {error ? (
        <ErrorState message={error} onRetry={loadData} />
      ) : activeTab === 'transactions' ? (
        // Transactions List Tab
        <View style={s.tabContent}>
          <SectionHeader title={`Lịch sử giao dịch (${history.length})`} />
          {history.length === 0 ? (
            <EmptyState icon="history" title="Chưa có giao dịch" subtitle="Lịch sử điểm thưởng sẽ hiển thị tại đây." />
          ) : (
            history.map((item) => {
              const delta = item.pointsDelta ?? 0;
              return (
                <ListItemCard
                  key={item._id}
                  title={item.note || 'Giao dịch điểm thưởng'}
                  subtitle={`${formatDateTime(item.createdAt)} · Số dư sau: ${(item.balanceAfter ?? 0).toLocaleString()} Pts`}
                  rightText={`${delta > 0 ? '+' : ''}${delta.toLocaleString()} Pts`}
                  rightColor={delta >= 0 ? C.tealLight : '#EF4444'}
                  icon="swap-vert"
                />
              );
            })
          )}
        </View>
      ) : (
        // Predictions List Tab
        <View style={s.tabContent}>
          <SectionHeader title={`Lịch sử dự đoán (${predictions.length})`} />
          {predictions.length === 0 ? (
            <View style={s.emptyContainer}>
              <EmptyState icon="history" title="Chưa có dự đoán" subtitle="Bạn chưa đặt dự đoán cho trận đua nào. Hãy vào Giải đấu để bắt đầu!" />
              <TouchableOpacity
                style={s.emptyBtn}
                onPress={() => router.push('/(spectator)/tournaments' as any)}
                activeOpacity={0.8}
              >
                <Text style={s.emptyBtnText}>Tạo dự đoán đầu tiên</Text>
              </TouchableOpacity>
            </View>
          ) : (
            predictions.map((p) => {
              const st = statusLabel(p.status);
              const horse = typeof p.predictedHorseId === 'object' ? p.predictedHorseId?.name : 'Ngựa';
              const race = typeof p.raceId === 'object' ? p.raceId?.name : 'Trận đua';
              const rId = typeof p.raceId === 'object' ? p.raceId?._id : p.raceId;
              
              // Calculate points gain/loss display
              let rewardDisplay = '';
              let rewardColor = C.textSecondary;
              if (p.status === 'WON') {
                rewardDisplay = `+${p.rewardPoints || 0} Pts`;
                rewardColor = C.tealLight;
              } else if (p.status === 'LOST') {
                rewardDisplay = `-${p.betPoints || 0} Pts`;
                rewardColor = '#EF4444';
              } else if (p.status === 'PENDING') {
                rewardDisplay = 'Đang chờ';
                rewardColor = '#F59E0B';
              }

              return (
                <ListItemCard
                  key={p._id}
                  title={`Dự đoán: ${horse}`}
                  subtitle={`Trận: ${race} · ${formatDateTime(p.createdAt)}`}
                  rightText={rewardDisplay || st.label}
                  rightColor={rewardColor}
                  icon="psychology"
                  onPress={rId ? () => router.push(`/(spectator)/race/${rId}` as any) : undefined}
                />
              );
            })
          )}
        </View>
      )}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  c: { flex: 1, backgroundColor: C.bg },
  p: { padding: 16, paddingBottom: 32 },
  label: { color: C.textSecondary, fontSize: 10, fontWeight: '800', letterSpacing: 1.5 },
  balance: { color: C.white, fontSize: 36, fontWeight: '900', marginTop: 8 },
  unit: { fontSize: 18, color: C.textSecondary },
  hint: { color: C.textMuted, fontSize: 11, marginTop: 8 },
  segmentContainer: {
    flexDirection: 'row',
    backgroundColor: '#171B24',
    borderRadius: 8,
    padding: 4,
    marginTop: 20,
    marginBottom: 8,
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 6,
    backgroundColor: 'transparent',
  },
  segmentBtnActive: {
    backgroundColor: '#202633',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  segmentText: {
    fontSize: 13,
    color: '#AEB6C2',
    fontWeight: '500',
  },
  segmentTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  tabContent: {
    marginTop: 10,
  },
  emptyContainer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  emptyBtn: {
    backgroundColor: C.red,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 22,
    alignItems: 'center',
    marginTop: 16,
  },
  emptyBtnText: {
    color: C.white,
    fontWeight: '800',
    fontSize: 13,
  },
});
