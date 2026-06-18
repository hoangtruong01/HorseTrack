import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { AppScreen, Section } from '@/components/ui/premium';
import { premiumColors, premiumSpacing, premiumRadius } from '@/components/ui/premium-tokens';
import { LoadingState, EmptyState, statusLabel } from '@/components/ui/shared';
import { tournamentsApi } from '@/lib/api-client';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

export default function SpectatorTournaments() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    tournamentsApi.list({ limit: 50 })
      .then(r => setData((r as any).data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingState />;

  return (
    <AppScreen scroll>
      <View style={styles.content}>
        {/* Header Flat */}
        <View style={styles.header}>
          <Text style={styles.eyebrow}>HỆ THỐNG GIẢI ĐẤU</Text>
          <Text style={styles.title}>Danh sách giải đấu</Text>
          <View style={styles.accentLine} />
          <Text style={styles.subtitle}>Cập nhật thông tin các giải đấu chính thức.</Text>
        </View>

        <Section title={`Tất cả giải đấu (${data.length})`}>
          {data.length === 0 ? (
            <EmptyState icon="emoji-events" title="Chưa có giải đấu" subtitle="Hiện tại chưa có giải đấu nào trong hệ thống." />
          ) : (
            <View style={styles.listContainer}>
              {data.map(t => {
                const st = statusLabel(t.status);
                return (
                  <View key={t._id || t.id} style={styles.rowItem}>
                    <View style={styles.rowAvatar}>
                      <MaterialIcons name="emoji-events" size={20} color={premiumColors.textSecondary} />
                    </View>
                    <View style={styles.rowInfo}>
                      <Text style={styles.rowTitle} numberOfLines={1}>{t.name}</Text>
                      <Text style={styles.rowSubtitle} numberOfLines={1}>
                        {`${t.location || 'Chưa cập nhật'} · Giải thưởng: ${t.prizePool?.toLocaleString() || 0} đ`}
                      </Text>
                    </View>
                    <View style={[styles.rowBadge, { borderColor: st.color + '40', backgroundColor: st.color + '18' }]}>
                      <Text style={[styles.rowBadgeText, { color: st.color }]}>{st.label}</Text>
                    </View>
                  </View>
                );
              })}
            </View>
          )}
        </Section>
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
  header: {
    marginBottom: premiumSpacing[32],
  },
  eyebrow: {
    fontSize: 11,
    fontWeight: '700',
    color: premiumColors.brand,
    letterSpacing: 1,
    marginBottom: premiumSpacing[8],
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: premiumColors.text,
    marginBottom: premiumSpacing[8],
  },
  accentLine: {
    width: 36,
    height: 3,
    backgroundColor: premiumColors.brand,
    borderRadius: 2,
    marginBottom: premiumSpacing[12],
  },
  subtitle: {
    fontSize: 14,
    color: premiumColors.textSecondary,
    lineHeight: 20,
  },
  listContainer: {
    backgroundColor: premiumColors.surface,
    borderRadius: premiumRadius[12],
    borderWidth: 1,
    borderColor: premiumColors.border,
    overflow: 'hidden',
  },
  rowItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: premiumSpacing[16],
    borderBottomWidth: 1,
    borderBottomColor: premiumColors.border,
    gap: premiumSpacing[12],
  },
  rowAvatar: {
    width: 44,
    height: 44,
    borderRadius: premiumRadius[8],
    backgroundColor: premiumColors.surface2,
    borderWidth: 1,
    borderColor: premiumColors.border,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  rowInfo: {
    flex: 1,
    minWidth: 0,
  },
  rowTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: premiumColors.text,
    marginBottom: 4,
  },
  rowSubtitle: {
    fontSize: 12,
    color: premiumColors.textMuted,
  },
  rowBadge: {
    borderWidth: 1,
    borderRadius: premiumRadius[4],
    paddingHorizontal: 8,
    paddingVertical: 4,
    flexShrink: 0,
  },
  rowBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
});
