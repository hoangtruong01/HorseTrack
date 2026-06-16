import React, { useCallback, useEffect, useState } from 'react';
import { Alert, RefreshControl, ScrollView, StyleSheet, Text, TextInput } from 'react-native';
import { C, Card, EmptyState, ErrorState, ListItemCard, LoadingState, PrimaryButton, SectionHeader, StatCard, formatDateTime } from '@/components/ui/shared';
import { rewardPointLedgerApi, walletApi } from '@/lib/api-client';

export default function OwnerWallet() {
  const [balance, setBalance] = useState(0);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [redeemAmount, setRedeemAmount] = useState('');
  const [submitting, setSubmitting] = useState(false);

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

  if (loading) return <LoadingState />;

  return (
    <ScrollView
      style={s.c}
      contentContainerStyle={s.p}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.red} colors={[C.red]} />}
    >
      <StatCard label="Diem hien tai" value={`${balance.toLocaleString()} PTS`} icon="stars" color="#F59E0B" />

      <Card style={{ gap: 12, marginTop: 12 }}>
        <Text style={s.sectionSubTitle}>Yeu cau rut diem / quy doi</Text>
        <TextInput
          style={s.input}
          placeholder="Nhap so diem can rut..."
          placeholderTextColor={C.textMuted}
          keyboardType="numeric"
          value={redeemAmount}
          onChangeText={setRedeemAmount}
        />
        <PrimaryButton title="Yeu cau rut diem" onPress={handleRedeem} loading={submitting} disabled={balance <= 0} />
      </Card>

      <SectionHeader title={`Lich su giao dich (${history.length})`} />
      {error ? (
        <ErrorState message={error} onRetry={loadData} />
      ) : history.length === 0 ? (
        <EmptyState icon="history" title="Chua co giao dich" subtitle="Lich su diem thuong se hien thi tai day." />
      ) : (
        history.map((item) => {
          const delta = item.pointsDelta ?? 0;
          return (
            <ListItemCard
              key={item._id}
              title={item.note || 'Giao dich diem thuong'}
              subtitle={`${formatDateTime(item.createdAt)} · So du sau: ${(item.balanceAfter ?? 0).toLocaleString()} PTS`}
              rightText={`${delta > 0 ? '+' : ''}${delta.toLocaleString()} PTS`}
              rightColor={delta >= 0 ? '#34D399' : '#EF4444'}
              icon="payment"
            />
          );
        })
      )}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  c: { flex: 1, backgroundColor: C.bg },
  p: { padding: 16, paddingBottom: 32 },
  sectionSubTitle: { color: C.white, fontSize: 13, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.5 },
  input: { backgroundColor: C.inputBg, borderWidth: 1, borderColor: C.cardBorder, color: C.white, borderRadius: 12, height: 44, paddingHorizontal: 16, fontSize: 13 },
});
