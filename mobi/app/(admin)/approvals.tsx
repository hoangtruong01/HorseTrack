import React, { useEffect, useState } from 'react';
import { ScrollView, View, Text, StyleSheet, Alert, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';
import { C, Card, SectionHeader, ListItemCard, LoadingState, EmptyState, statusLabel, PrimaryButton, OutlineButton } from '@/components/ui/shared';
import { walletApi } from '@/lib/api-client';

export default function AdminApprovals() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const loadData = async () => {
    try {
      const res = await walletApi.allCashouts({ limit: 50 });
      setData((res as any).data || res || []);
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleProcess = async (id: string, status: 'PAID' | 'REJECTED') => {
    setProcessingId(id);
    try {
      await walletApi.processCashout(id, status);
      Alert.alert('Thành công', `Đã chuyển trạng thái yêu cầu sang: ${status === 'PAID' ? 'Đã thanh toán' : 'Từ chối'}`);
      loadData();
    } catch (err: any) {
      Alert.alert('Thất bại', err.message || 'Lỗi xử lý yêu cầu.');
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) return <LoadingState />;

  const pendingList = data.filter(c => c.status === 'PENDING');

  return (
    <ScrollView style={s.c} contentContainerStyle={s.p}>
      <SectionHeader title={`Yêu cầu rút tiền chờ duyệt (${pendingList.length})`} />
      {pendingList.length === 0 ? (
        <EmptyState icon="done-all" title="Hoàn thành phê duyệt" subtitle="Tất cả các yêu cầu đổi thưởng / rút tiền đã được xử lý." />
      ) : (
        pendingList.map(c => {
          const user = typeof c.userId === 'object' ? c.userId?.fullName : 'Khách hàng';
          const email = typeof c.userId === 'object' ? c.userId?.email : '';
          const isProcessing = processingId === c._id;
          return (
            <Card key={c._id} style={{ gap: 8 }}>
              <View style={s.row}>
                <View>
                  <Text style={s.title}>{user}</Text>
                  <Text style={s.sub}>{email}</Text>
                </View>
                <Text style={s.amount}>{c.pointsRedeemed.toLocaleString()} Pts</Text>
              </View>
              <Text style={s.code}>Mã đổi thưởng: {c.redemptionCode}</Text>
              {isProcessing ? <ActivityIndicator color={C.red} style={{ marginTop: 12 }} /> : (
                <View style={s.btnRow}>
                  <View style={{ flex: 1 }}>
                    <OutlineButton title="Từ chối" onPress={() => handleProcess(c._id, 'REJECTED')} color="#EF4444" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <PrimaryButton title="Phê duyệt" onPress={() => handleProcess(c._id, 'PAID')} color={C.teal} />
                  </View>
                </View>
              )}
            </Card>
          );
        })
      )}
    </ScrollView>
  );
}

interface Styles {
  c: ViewStyle;
  p: ViewStyle;
  row: ViewStyle;
  title: TextStyle;
  sub: TextStyle;
  amount: TextStyle;
  code: TextStyle;
  btnRow: ViewStyle;
}

const s = StyleSheet.create<Styles>({
  c: { flex: 1, backgroundColor: C.bg },
  p: { padding: 16, paddingBottom: 32 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { color: C.white, fontSize: 14, fontWeight: '800' },
  sub: { color: C.textSecondary, fontSize: 11, marginTop: 2 },
  amount: { color: C.tealLight, fontSize: 16, fontWeight: '900' },
  code: { color: C.textMuted, fontSize: 11, fontStyle: 'italic', marginTop: 4 },
  btnRow: { flexDirection: 'row', gap: 10, marginTop: 10 },
});
