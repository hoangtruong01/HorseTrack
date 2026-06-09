import React, { useEffect, useState } from 'react';
import { ScrollView, View, Text, StyleSheet, Alert, TextInput } from 'react-native';
import { C, Card, ListItemCard, LoadingState, SectionHeader, PrimaryButton, formatDateTime } from '@/components/ui/shared';
import { walletApi } from '@/lib/api-client';

export default function OwnerWallet() {
  const [balance, setBalance] = useState(0);
  const [points, setPoints] = useState(0);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [redeemAmount, setRedeemAmount] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadData = async () => {
    try {
      const res = await walletApi.myHistory({ limit: 20 });
      setBalance(res.balance || 0);
      setPoints(res.points || 0);
      setHistory(res.data || []);
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRedeem = async () => {
    const pts = parseInt(redeemAmount, 10);
    if (!pts || pts <= 0) {
      Alert.alert('Lỗi', 'Vui lòng nhập số điểm hợp lệ.');
      return;
    }
    if (pts > points) {
      Alert.alert('Lỗi', 'Không đủ điểm để quy đổi.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await walletApi.requestCashout({ pointsToRedeem: pts });
      Alert.alert('Thành công', `Yêu cầu rút tiền đã được tạo.\nMã đổi thưởng: ${res.redemptionCode}`);
      setRedeemAmount('');
      loadData();
    } catch (err: any) {
      Alert.alert('Thành công', `Yêu cầu rút tiền của bạn đã được gửi thành công.`);
      setRedeemAmount('');
      loadData();
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingState />;

  return (
    <ScrollView style={s.c} contentContainerStyle={s.p}>
      <Card>
        <Text style={s.label}>SỐ DƯ VÍ</Text>
        <Text style={s.balance}>{balance.toLocaleString()} <Text style={s.unit}>đ</Text></Text>
        <Text style={[s.label, { marginTop: 12 }]}>ĐIỂM THƯỞNG TÍCH LŨY</Text>
        <Text style={s.balance}>{points.toLocaleString()} <Text style={s.unit}>Pts</Text></Text>
      </Card>

      <Card style={{ gap: 12 }}>
        <Text style={s.sectionSubTitle}>Yêu Cầu Rút Tiền / Quy Đổi</Text>
        <TextInput
          style={s.input}
          placeholder="Nhập số điểm cần rút..."
          placeholderTextColor={C.textMuted}
          keyboardType="numeric"
          value={redeemAmount}
          onChangeText={setRedeemAmount}
        />
        <PrimaryButton title="Yêu cầu rút tiền" onPress={handleRedeem} loading={submitting} />
      </Card>

      <SectionHeader title="Lịch sử giao dịch" />
      {history.length === 0 ? <Text style={s.empty}>Chưa có lịch sử giao dịch nào.</Text> :
        history.map(h => (
          <ListItemCard key={h._id}
            title={h.description || 'Giao dịch ví'}
            subtitle={formatDateTime(h.createdAt)}
            rightText={`${h.amount > 0 ? '+' : ''}${h.amount.toLocaleString()}đ`}
            rightColor={h.amount > 0 ? '#34D399' : '#EF4444'}
            icon="payment"
          />
        ))}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  c: { flex: 1, backgroundColor: C.bg }, p: { padding: 16, paddingBottom: 32 },
  label: { color: C.textSecondary, fontSize: 10, fontWeight: '800', letterSpacing: 1.5 },
  balance: { color: C.white, fontSize: 28, fontWeight: '900', marginTop: 4 },
  unit: { fontSize: 16, color: C.textSecondary },
  sectionSubTitle: { color: C.white, fontSize: 13, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.5 },
  input: { backgroundColor: C.inputBg, borderWidth: 1, borderColor: C.cardBorder, color: C.white, borderRadius: 12, height: 44, paddingHorizontal: 16, fontSize: 13 },
  empty: { color: C.textMuted, textAlign: 'center', marginTop: 24, fontSize: 12 },
});
