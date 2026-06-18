import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { AppScreen } from '@/components/ui/premium';
import { premiumColors, premiumSpacing, premiumRadius } from '@/components/ui/premium-tokens';
import { LoadingState, ErrorState, EmptyState } from '@/components/ui/shared';
import { jockeyInvitationsApi } from '@/lib/api-client';

export default function JockeyPerformance() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = () => {
    setLoading(true);
    setError(null);
    jockeyInvitationsApi.listReceived({ limit: 50 })
      .then(r => {
        const list = (r as any).data || [];
        const completed = list.filter((i: any) => i.status === 'ACCEPTED'); // Only accepted races count
        setData(completed);
      })
      .catch((err: any) => setError(err.message || 'Lỗi tải thành tích'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadData(); }, []);

  if (loading) return <LoadingState />;

  return (
    <AppScreen scroll>
      <View style={styles.content}>
        
        {/* ── Summary Card ── */}
        <View style={styles.summaryCard}>
          <Text style={styles.eyebrow}>BÁO CÁO VẬN ĐỘNG VIÊN</Text>
          <Text style={styles.title}>Thành Tích Thi Đấu</Text>
          <Text style={styles.subtitle}>Ghi nhận chính thức từ hệ thống dữ liệu đường đua.</Text>
        </View>

        {error ? (
          <ErrorState message={error} onRetry={loadData} />
        ) : (
          <>
            {/* ── Honest official stats (No fake performance) ── */}
            <View style={styles.statsContainer}>
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>SỐ TRẬN THAM GIA</Text>
                <Text style={styles.statValue}>{data.length}</Text>
              </View>
            </View>

            {/* ── Section Header ── */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Lịch sử thành tích</Text>
            </View>

            {/* ── Honest empty explainer ── */}
            <View style={styles.emptyContainer}>
              <EmptyState 
                icon="emoji-events" 
                title="Chưa có dữ liệu" 
                subtitle="Chưa có dữ liệu thành tích chính thức từ ban tổ chức đường đua." 
              />
            </View>
          </>
        )}

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
  
  // ── Summary Card ──
  summaryCard: {
    backgroundColor: premiumColors.surface,
    borderRadius: premiumRadius[12],
    borderWidth: 1,
    borderColor: premiumColors.border,
    padding: premiumSpacing[24],
    marginBottom: premiumSpacing[24],
    alignItems: 'center',
  },
  eyebrow: {
    color: premiumColors.brand,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.5,
    marginBottom: premiumSpacing[8],
  },
  title: {
    color: premiumColors.text,
    fontSize: 24,
    fontWeight: '900',
    marginBottom: premiumSpacing[8],
  },
  subtitle: {
    color: premiumColors.textMuted,
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
  },

  // ── Stat Box ──
  statsContainer: {
    flexDirection: 'row',
    marginBottom: premiumSpacing[32],
  },
  statBox: {
    flex: 1,
    backgroundColor: premiumColors.surface2,
    borderRadius: premiumRadius[8],
    borderWidth: 1,
    borderColor: premiumColors.border,
    padding: premiumSpacing[16],
    alignItems: 'center',
    justifyContent: 'center',
  },
  statLabel: {
    color: premiumColors.textSecondary,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 8,
  },
  statValue: {
    color: premiumColors.brand,
    fontSize: 32,
    fontWeight: '900',
  },

  // ── Section ──
  sectionHeader: {
    marginBottom: premiumSpacing[16],
    paddingBottom: premiumSpacing[8],
    borderBottomWidth: 1,
    borderBottomColor: premiumColors.border,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: premiumColors.text,
  },
  emptyContainer: {
    paddingVertical: premiumSpacing[24],
  },
});
