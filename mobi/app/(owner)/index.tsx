import React, { useEffect, useState, useCallback } from 'react';
import { ScrollView, View, Text, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { C, StatCard, Card, SectionHeader, ListItemCard, LoadingState, ErrorState, statusLabel } from '@/components/ui/shared';
import { horsesApi, registrationsApi, rewardPointLedgerApi, dashboardApi } from '@/lib/api-client';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

export default function OwnerHome() {
  const router = useRouter();
  const [balance, setBalance] = useState(0);
  const [horsesCount, setHorsesCount] = useState(0);
  const [regCount, setRegCount] = useState(0);
  const [winnings, setWinnings] = useState(0);
  const [recentRegistrations, setRecentRegistrations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setError(null);
    try {
      const [horsesRes, regRes, balanceRes, statsRes] = await Promise.all([
        horsesApi.listMine({ limit: 1 }),
        registrationsApi.listMine({ limit: 5 }),
        rewardPointLedgerApi.myBalance(),
        dashboardApi.getOwnerStats(),
      ]);
      
      setHorsesCount((horsesRes as any).meta?.total || 0);
      setRecentRegistrations((regRes as any).data || []);
      setRegCount((regRes as any).meta?.total || 0);
      setBalance((balanceRes as any).balance || 0);
      setWinnings(statsRes?.winnings?.total || 0);
    } catch (err: any) {
      setError(err.message || 'Lỗi tải dữ liệu');
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [loadData]);

  if (loading && !refreshing) return <LoadingState />;

  const quickActions = [
    { title: 'Chuồng Ngựa', icon: 'pets', path: '/horses', color: C.red },
    { title: 'Đăng Ký Đua', icon: 'flag', path: '/races', color: '#34D399' },
    { title: 'Hồ Sơ Ghi Danh', icon: 'assignment', path: '/registrations', color: '#F59E0B' },
    { title: 'Mời Jockey', icon: 'person-add', path: '/invitations', color: '#38BDF8' },
    { title: 'Ví Thưởng', icon: 'account-balance-wallet', path: '/wallet', color: '#A855F7' },
    { title: 'Kết Quả Đua', icon: 'emoji-events', path: '/results', color: '#EC4899' },
    { title: 'Bảng Xếp Hạng', icon: 'leaderboard', path: '/rankings', color: '#E10600' },
    { title: 'Cá Nhân', icon: 'person', path: '/profile', color: C.textSecondary },
  ];

  if (error) {
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.content} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.red} colors={[C.red]} />}>
        <ErrorState message={error} onRetry={loadData} />
      </ScrollView>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.red} colors={[C.red]} />}
    >
      <Card>
        <Text style={styles.welcomeLabel}>CHỦ SỞ HỮU CHIẾN MÃ</Text>
        <Text style={styles.welcomeTitle}>Bảng Quản Trị Owner</Text>
        <Text style={styles.welcomeSub}>Chào mừng trở lại! Quản lý các chiến mã vô địch, theo dõi các giải đấu đang diễn ra và quản lý tài chính chuồng đua của bạn.</Text>
      </Card>

      {/* KPI stats grid */}
      <View style={styles.statsRow}>
        <StatCard label="Chuồng ngựa" value={`${horsesCount}`} icon="pets" color="#38BDF8" />
        <StatCard label="Hồ sơ ghi danh" value={`${regCount}`} icon="assignment" color="#F59E0B" />
      </View>
      <View style={styles.statsRow}>
        <StatCard label="Ví thưởng" value={`${balance.toLocaleString()} PTS`} icon="account-balance-wallet" color="#34D399" />
        <StatCard label="Tổng tiền thắng" value={`${winnings.toLocaleString()} PTS`} icon="stars" color="#F43F5E" />
      </View>

      {/* Quick Actions Grid */}
      <SectionHeader title="Phím tắt nhanh" />
      <View style={styles.actionsGrid}>
        {quickActions.map((act, idx) => (
          <TouchableOpacity
            key={idx}
            style={styles.actionBtn}
            onPress={() => router.push(act.path as any)}
          >
            <View style={[styles.actionIconWrap, { backgroundColor: act.color + '15' }]}>
              <MaterialIcons name={act.icon as any} size={22} color={act.color} />
            </View>
            <Text style={styles.actionText}>{act.title}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Recent registrations list */}
      <SectionHeader title="Yêu cầu ghi danh mới nhất" />
      {recentRegistrations.length === 0 ? (
        <Text style={styles.empty}>Chưa có lượt đăng ký đua nào.</Text>
      ) : (
        recentRegistrations.slice(0, 3).map(r => {
          const s = statusLabel(r.status);
          const horseName = typeof r.horseId === 'object' ? r.horseId?.name : 'Ngựa';
          const raceName = typeof r.raceId === 'object' ? r.raceId?.name : 'Trận đua';
          return (
            <ListItemCard
              key={r._id || r.id}
              title={horseName}
              subtitle={`Trận: ${raceName}`}
              rightText={s.label}
              rightColor={s.color}
              icon="assignment"
              onPress={() => router.push('/registrations')}
            />
          );
        })
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  content: { padding: 16, paddingBottom: 48 },
  statsRow: { flexDirection: 'row', gap: 8 },
  welcomeLabel: { color: C.red, fontSize: 10, fontWeight: '800', letterSpacing: 1.5, marginBottom: 8 },
  welcomeTitle: { color: C.white, fontSize: 22, fontWeight: '900' },
  welcomeSub: { color: C.textSecondary, fontSize: 12, marginTop: 6, lineHeight: 18 },
  actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 16 },
  actionBtn: { width: '22%', aspectRatio: 1, backgroundColor: C.card, borderWidth: 1, borderColor: C.cardBorder, borderRadius: 16, alignItems: 'center', justifyContent: 'center', padding: 4 },
  actionIconWrap: { width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 6 },
  actionText: { color: C.white, fontSize: 9, fontWeight: '800', textAlign: 'center' },
  empty: { color: C.textMuted, fontSize: 12, textAlign: 'center', marginVertical: 16 },
});
