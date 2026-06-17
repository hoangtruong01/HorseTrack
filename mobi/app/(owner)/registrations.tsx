import React, { useEffect, useState, useCallback } from 'react';
import { ScrollView, View, Text, StyleSheet, Alert, RefreshControl, TouchableOpacity } from 'react-native';
import { C, ListItemCard, LoadingState, EmptyState, ErrorState, SectionHeader, statusLabel, formatDateTime } from '@/components/ui/shared';
import { registrationsApi } from '@/lib/api-client';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

export default function OwnerRegistrations() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [cancelling, setCancelling] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setError(null);
    try {
      const res = await registrationsApi.listMine({ limit: 100 });
      setData((res as any).data || []);
    } catch (err: any) {
      setError(err.message || 'Không thể tải danh sách đăng ký.');
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  }, [fetchData]);

  const handleCancel = (id: string, status: string) => {
    const action = status === 'PENDING' ? 'hủy' : 'rút';
    Alert.alert(
      `Xác nhận ${action} đăng ký`,
      `Bạn có chắc muốn ${action} đăng ký này không?`,
      [
        { text: 'Không', style: 'cancel' },
        {
          text: `${action.charAt(0).toUpperCase() + action.slice(1)}`, style: 'destructive',
          onPress: async () => {
            setCancelling(id);
            try {
              if (status === 'PENDING') {
                await registrationsApi.cancel(id);
              } else {
                await registrationsApi.withdraw(id);
              }
              Alert.alert('Thành công', `Đã ${action} đăng ký thành công.`);
              fetchData();
            } catch (err: any) {
              Alert.alert('Lỗi', err.message || `Không thể ${action} đăng ký.`);
            } finally { setCancelling(null); }
          },
        },
      ]
    );
  };

  if (loading) return <LoadingState />;

  return (
    <ScrollView
      style={s.c}
      contentContainerStyle={s.p}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.red} colors={[C.red]} />}
    >
      <SectionHeader title={`Hồ sơ đăng ký (${data.length})`} />
      {error ? (
        <ErrorState message={error} onRetry={fetchData} />
      ) : data.length === 0 ? (
        <EmptyState icon="assignment" title="Chưa có đăng ký" subtitle="Đăng ký chiến mã vào cuộc đua thông qua trang Giải đấu." />
      ) : (
        data.map(r => {
          const st = statusLabel(r.status);
          const horse = typeof r.horseId === 'object' ? r.horseId?.name : 'Ngựa';
          const race = typeof r.raceId === 'object' ? r.raceId?.name : 'Trận đua';
          const tournament = typeof r.tournamentId === 'object' ? r.tournamentId?.name : '';
          const canCancel = r.status === 'PENDING';
          const canWithdraw = r.status === 'APPROVED';
          const isCancelling = cancelling === (r._id || r.id);

          return (
            <View key={r._id || r.id} style={s.regCard}>
              <View style={s.regHeader}>
                <View style={s.regIconWrap}>
                  <MaterialIcons name="emoji-events" size={20} color={C.red} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.regHorse} numberOfLines={1}>🐴 {horse}</Text>
                  <Text style={s.regRace} numberOfLines={1}>🏁 {race}</Text>
                  {tournament ? <Text style={s.regTournament} numberOfLines={1}>🏆 {tournament}</Text> : null}
                </View>
                <View style={[s.statusBadge, { backgroundColor: st.color + '20', borderColor: st.color + '40' }]}>
                  <Text style={[s.statusText, { color: st.color }]}>{st.label}</Text>
                </View>
              </View>

              {r.rejectedReason && (
                <View style={s.reasonBox}>
                  <Text style={s.reasonText}>Lý do từ chối: {r.rejectedReason}</Text>
                </View>
              )}

              <View style={s.regFooter}>
                <Text style={s.regDate}>{formatDateTime(r.createdAt)}</Text>
                {(canCancel || canWithdraw) && (
                  <TouchableOpacity
                    style={s.cancelBtn}
                    onPress={() => handleCancel(r._id || r.id, r.status)}
                    disabled={isCancelling}
                  >
                    <MaterialIcons name="cancel" size={14} color="#EF4444" />
                    <Text style={s.cancelText}>{isCancelling ? '...' : canCancel ? 'Hủy' : 'Rút tên'}</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          );
        })
      )}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  c: { flex: 1, backgroundColor: C.bg },
  p: { padding: 16, paddingBottom: 32 },
  regCard: { backgroundColor: C.card, borderWidth: 1, borderColor: C.cardBorder, borderRadius: 16, padding: 14, marginBottom: 10 },
  regHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  regIconWrap: { width: 40, height: 40, borderRadius: 12, backgroundColor: C.red + '15', alignItems: 'center', justifyContent: 'center' },
  regHorse: { color: C.white, fontSize: 13, fontWeight: '800' },
  regRace: { color: C.red, fontSize: 11, fontWeight: '700', marginTop: 2 },
  regTournament: { color: C.tealLight, fontSize: 10, fontWeight: '600', marginTop: 1 },
  statusBadge: { borderWidth: 1, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  statusText: { fontSize: 9, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.5 },
  reasonBox: { backgroundColor: '#EF444415', borderWidth: 1, borderColor: '#EF444430', borderRadius: 8, padding: 8, marginTop: 10 },
  reasonText: { color: '#EF4444', fontSize: 11, fontWeight: '600' },
  regFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: C.cardBorder },
  regDate: { color: C.textMuted, fontSize: 10 },
  cancelBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, borderWidth: 1, borderColor: '#EF444440', backgroundColor: '#EF444410' },
  cancelText: { color: '#EF4444', fontSize: 11, fontWeight: '700' },
});
