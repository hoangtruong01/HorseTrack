import React, { useEffect, useState } from 'react';
import { ScrollView, View, Text, StyleSheet } from 'react-native';
import { C, StatCard, Card, SectionHeader, ListItemCard, LoadingState, statusLabel } from '@/components/ui/shared';
import { refereeAssignmentsApi } from '@/lib/api-client';

export default function RefereeHome() {
  const [assignments, setAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    refereeAssignmentsApi.myAssignments({ limit: 10 })
      .then(r => setAssignments((r as any).data || r || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingState />;

  const pendingCount = assignments.filter(a => a.status === 'assigned').length;
  const acceptedCount = assignments.filter(a => a.status === 'accepted').length;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Card>
        <Text style={styles.welcomeLabel}>REFEREE WORKSPACE</Text>
        <Text style={styles.welcomeTitle}>Giám Sát & Điều Hành Trận Đua</Text>
        <Text style={styles.welcomeSub}>Duyệt phân công trận đấu, thực hiện kiểm tra pre-race điểm danh, log vi phạm và công bố kết quả trận đấu.</Text>
      </Card>

      <View style={styles.statsRow}>
        <StatCard label="Chờ xác nhận" value={`${pendingCount}`} icon="hourglass-empty" color={C.yellow} />
        <StatCard label="Nhiệm vụ đã nhận" value={`${acceptedCount}`} icon="assignment-turned-in" color={C.teal} />
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
  statsRow: { flexDirection: 'row', gap: 8 },
  welcomeLabel: { color: C.red, fontSize: 10, fontWeight: '800', letterSpacing: 1.5, marginBottom: 8 },
  welcomeTitle: { color: C.white, fontSize: 22, fontWeight: '900' },
  welcomeSub: { color: C.textSecondary, fontSize: 12, marginTop: 6, lineHeight: 18 },
  empty: { color: C.textMuted, fontSize: 12, textAlign: 'center', marginVertical: 16 },
});
