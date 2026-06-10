import React, { useEffect, useState, useCallback } from 'react';
import { ScrollView, View, Text, StyleSheet, Alert, TextInput, RefreshControl } from 'react-native';
import { C, Card, ListItemCard, LoadingState, SectionHeader, PrimaryButton, StatCard, formatDateTime } from '@/components/ui/shared';
import { rewardPointLedgerApi, walletApi } from '@/lib/api-client';

export default function OwnerWallet() {
  const [balance, setBalance] = useState(0);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [redeemAmount, setRedeemAmount] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [balanceRes, historyRes] = await Promise.all([
        rewardPointLedgerApi.myBalance().catch(() => ({ balance: 0 })),
        rewardPointLedgerApi.myHistory({ limit: 50 }).catch(() => ({ data: [] })),
      ]);
      setBalance((balanceRes as any).balance ?? 0);
      setHistory((historyRes as any).data || []);
    } catch {} finally { setLoading(false); }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
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
      Alert.alert('Thành công', `Yêu cầu rút ${pts.toLocaleString()} điểm đã được gửi thành công.`);
      setRedeemAmount('');
      loadData();
    } catch (err: any) {
      Alert.alert('Lỗi', err.message || 'Đã xảy ra lỗi khi tạo yêu cầu rút điểm.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingState />;

  // Tính toán KPI
  const totalRedeemed = history.filter(h => h.pointsDelta < 0).reduce((acc, h) => acc + Math.abs(h.pointsDelta), 0);
  const totalEarned = history.filter(h => h.pointsDelta > 0).reduce((acc, h) => acc + h.pointsDelta, 0);

  return (
    <ScrollView
      style={s.c}
      contentContainerStyle={s.p}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.red} colors={[C.red]} />}
    >
      {/* KPI Cards */}
      <View style={s.statsRow}>
        <StatCard label="Điểm khả dụng" value={`${balance.toLocaleString()} PTS`} icon="stars" color="#F59E0B" />
        <StatCard label="Tổng tích lũy" value={`${totalEarned.toLocaleString()} PTS`} icon="trending-up" color={C.tealLight} />
      </View>
      <View style={s.statsRow}>
        <StatCard label="Đã đổi thưởng" value={`${totalRedeemed.toLocaleString()} PTS`} icon="redeem" color="#A855F7" />
        <StatCard label="Giao dịch" value={`${history.length}`} icon="receipt-long" color={C.textSecondary} />
      </View>

      {/* Cashout Form */}
      <Card style={{ gap: 12 }}>
        <Text style={s.sectionSubTitle}>Yêu Cầu Rút Điểm / Quy Đổi</Text>
        <TextInput
          style={s.input}
          placeholder="Nhập số điểm cần rút..."
          placeholderTextColor={C.textMuted}
          keyboardType="numeric"
          value={redeemAmount}
          onChangeText={setRedeemAmount}
        />
        <PrimaryButton title="Yêu cầu rút điểm" onPress={handleRedeem} loading={submitting} disabled={balance <= 0} />
      </Card>

      {/* Transaction History */}
      <SectionHeader title="Lịch sử giao dịch" />
      {history.length === 0 ? <Text style={s.empty}>Chưa có lịch sử giao dịch nào.</Text> :
        history.map(h => (
          <ListItemCard key={h._id}
            title={h.note || 'Giao dịch ví'}
            subtitle={formatDateTime(h.createdAt)}
            rightText={`${h.pointsDelta > 0 ? '+' : ''}${h.pointsDelta?.toLocaleString() || 0} PTS`}
            rightColor={h.pointsDelta > 0 ? '#34D399' : '#EF4444'}
            icon="payment"
          />
        ))}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  c: { flex: 1, backgroundColor: C.bg }, p: { padding: 16, paddingBottom: 32 },
  statsRow: { flexDirection: 'row', gap: 8 },
  sectionSubTitle: { color: C.white, fontSize: 13, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.5 },
  input: { backgroundColor: C.inputBg, borderWidth: 1, borderColor: C.cardBorder, color: C.white, borderRadius: 12, height: 44, paddingHorizontal: 16, fontSize: 13 },
  empty: { color: C.textMuted, textAlign: 'center', marginTop: 24, fontSize: 12 },
});
