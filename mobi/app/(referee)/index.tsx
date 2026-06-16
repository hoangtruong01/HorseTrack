import React, { useEffect, useState, useCallback } from 'react';
import { ScrollView, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { C, StatCard, Card, SectionHeader, ListItemCard, LoadingState, ErrorState, statusLabel } from '@/components/ui/shared';
import { refereeAssignmentsApi } from '@/lib/api-client';

export default function RefereeHome() {
  const router = useRouter();
  const [assignments, setAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(() => {
    setLoading(true);
    setError(null);
    refereeAssignmentsApi.myAssignments({ limit: 10 })
      .then(r => setAssignments((r as any).data || r || []))
      .catch((err: any) => setError(err.message || 'Lỗi tải phân công'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  if (loading) return <LoadingState />;

  if (error) {
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <ErrorState message={error} onRetry={loadData} />
      </ScrollView>
    );
  }

  const pendingCount = assignments.filter(a => a.status === 'assigned').length;
  const acceptedCount = assignments.filter(a => a.status === 'accepted').length;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Card style={styles.heroCard}>
        <View style={styles.heroHeader}>
          <MaterialIcons name="stars" size={20} color={C.red} />
          <Text style={styles.welcomeLabel}>REFEREE WORKSPACE</Text>
        </View>
        <Text style={styles.welcomeTitle}>Giám Sát & Điều Hành</Text>
        <Text style={styles.welcomeSub}>Duyệt phân công trận đấu, thực hiện kiểm tra điểm danh, log vi phạm và công bố kết quả trận đua.</Text>
      </Card>

      <View style={styles.actionsGrid}>
        {[
          { title: 'Phân Công', icon: 'assignment', path: '/assignments', color: '#F59E0B' },
          { title: 'Điểm Danh', icon: 'fact-check', path: '/pre-race', color: '#38BDF8' },
          { title: 'Vi Phạm', icon: 'gavel', path: '/violations', color: '#EF4444' },
          { title: 'Kết Quả', icon: 'emoji-events', path: '/results', color: '#34D399' },
        ].map((act, idx) => (
          <TouchableOpacity key={idx} style={styles.actionBtn} onPress={() => router.push(act.path as any)}>
            <View style={[styles.actionIconWrap, { backgroundColor: act.color + '15' }]}>
              <MaterialIcons name={act.icon as any} size={24} color={act.color} />
            </View>
            <Text style={styles.actionText}>{act.title}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.statsRow}>
        <StatCard label="Chờ xác nhận" value={`${pendingCount}`} icon="hourglass-empty" color={C.yellow} />
        <StatCard label="Đã nhận" value={`${acceptedCount}`} icon="assignment-turned-in" color={C.teal} />
      </View>

      <SectionHeader title="Phân công mới nhất" />
      {assignments.length === 0 ? (
        <Text style={styles.empty}>Chưa có phân công nào.</Text>
      ) : (
        assignments.slice(0, 3).map(a => {
          const s = statusLabel(a.status);
          const raceName = a.raceId?.name || 'Trận đua';
          return <ListItemCard key={a._id} title={raceName} subtitle={`Vai trò: ${a.role === 'main' ? 'Trọng tài chính' : 'Trợ lý'}`} rightText={s.label} rightColor={s.color} icon="assignment-turned-in" />;
        })
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  content: { padding: 16, paddingBottom: 32 },
  statsRow: { flexDirection: 'row', gap: 8, marginBottom: 20 },
  heroCard: { backgroundColor: C.card, padding: 20, marginBottom: 16, borderRadius: 16, borderWidth: 1, borderColor: C.cardBorder },
  heroHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  welcomeLabel: { color: C.red, fontSize: 11, fontWeight: '800', letterSpacing: 1.5 },
  welcomeTitle: { color: C.white, fontSize: 24, fontWeight: '900', marginBottom: 6 },
  welcomeSub: { color: C.textSecondary, fontSize: 13, lineHeight: 20 },
  actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 },
  actionBtn: { flex: 1, minWidth: '20%', backgroundColor: C.card, borderWidth: 1, borderColor: C.cardBorder, borderRadius: 16, alignItems: 'center', justifyContent: 'center', paddingVertical: 12 },
  actionIconWrap: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  actionText: { color: C.white, fontSize: 10, fontWeight: '700', textAlign: 'center' },
  empty: { color: C.textMuted, fontSize: 12, textAlign: 'center', marginVertical: 16 },
});
