import React, { useEffect, useState, useCallback } from 'react';
import { StyleSheet, View, Text, FlatList, RefreshControl, ScrollView, Image } from 'react-native';
import { premiumSpacing, premiumRadius, usePremiumColors } from '@/components/ui/premium-tokens';
import { LoadingState, ErrorState, EmptyState, useThemeColors } from '@/components/ui/shared';
import { SleekHeader } from '@/components/ui/sleek-header';
import { jockeyInvitationsApi } from '@/lib/api-client';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Tabs } from 'expo-router';

const GridBackground = ({ isDark }: { isDark: boolean }) => (
  <View style={StyleSheet.absoluteFill} pointerEvents="none">
    <View style={{ flex: 1, backgroundColor: isDark ? '#09090B' : '#F4F4F5' }} />
  </View>
);

export default function JockeyHorsesScreen() {
  const [horsesData, setHorsesData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = useThemeColors();
  const premiumColors = usePremiumColors();
  
  // Mặc định giao diện card theo thiết kế (Dark theme card)
  const styles = React.useMemo(() => getStyles(isDark, theme, premiumColors), [isDark, theme, premiumColors]);

  const loadHorses = useCallback(async () => {
    setError(null);
    try {
      const res = await jockeyInvitationsApi.listReceived({ page: 1, limit: 100 });
      const list = (res as any).data || res || [];
      const acceptedInvites = list.filter((i: any) => i.status === 'ACCEPTED');
      setHorsesData(acceptedInvites);
    } catch (err: any) {
      console.error('Lỗi lấy danh sách chiến mã của Jockey:', err);
      setError(err.message || 'Không thể tải danh sách chiến mã.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadHorses();
  }, [loadHorses]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadHorses();
  }, [loadHorses]);

  const renderItem = ({ item }: { item: any }) => {
    let horseObj = item.invitation?.registration?.horse || item.invitation?.horse || item.horseId;
    let horseName = typeof horseObj === 'string' ? horseObj : (horseObj?.name || item.horseName || 'Chiến mã chưa rõ tên');
    const breed = horseObj?.breed || 'THOROUGHBRED';
    const origin = horseObj?.origin || 'USA';
    const imageUrl = horseObj?.image;
    const baseSpeed = horseObj?.baseSpeed || 80;
    const staminaScore = horseObj?.staminaScore || 90;
    const age = horseObj?.age || 4;
    const healthStatus = horseObj?.healthStatus?.toLowerCase() || 'healthy';

    const ownerName = item.ownerId?.fullName || item.invitation?.registration?.owner?.fullName || 'Chủ ngựa';
    const raceName = item.raceId?.name || item.invitation?.registration?.race?.name || 'Trận đua';
    const tourName = item.tournamentId?.name || item.invitation?.registration?.tournament?.name || 'Giải đua';

    const isHealthy = healthStatus === 'healthy';
    const healthColor = isHealthy ? '#10B981' : '#EF4444';
    const healthLabel = isHealthy ? 'Khỏe mạnh' : 'Chấn thương';

    const speedColor = '#0EA5E9'; // Sky blue
    const staminaColor = '#F59E0B'; // Amber
    const ageColor = '#8B5CF6'; // Violet
    const trackColor = 'rgba(255,255,255,0.1)';

    return (
      <View style={styles.card}>
        {/* ── Banner Section ── */}
        <View style={styles.banner}>
          {/* Background Image / Silhouette */}
          <View style={styles.bannerSilhouette}>
            {imageUrl ? (
              <Image source={{ uri: imageUrl }} style={styles.horseBgImage} resizeMode="cover" />
            ) : (
              <MaterialIcons name="pets" size={180} color="rgba(0,0,0,0.15)" style={{ transform: [{ rotate: '20deg' }, { scaleX: -1 }] }} />
            )}
          </View>

          {/* Top Badges */}
          <View style={styles.bannerTopRow}>
            <View style={styles.codeBadge}>
              <Text style={styles.codeBadgeText}>#{raceName.substring(0, 5).toUpperCase()}</Text>
            </View>
            <View style={styles.statusBadge}>
              <MaterialIcons name="check-circle-outline" size={12} color="#10B981" />
              <Text style={styles.statusBadgeText}>LIÊN KẾT</Text>
            </View>
          </View>

          {/* Title Area */}
          <View style={styles.bannerBottomRow}>
            <Text style={styles.eyebrowText}>{origin.toUpperCase()} • {breed.toUpperCase()}</Text>
            <Text style={styles.horseName} numberOfLines={1}>{horseName.toUpperCase()}</Text>
          </View>
        </View>

        {/* ── Stats Section ── */}
        <View style={styles.statsContainer}>
          {/* Speed: 75% ring (1 side track) */}
          <View style={styles.statColumn}>
            <View style={[styles.statRing, { borderColor: speedColor, borderTopColor: trackColor, transform: [{ rotate: '45deg' }] }]}>
              <View style={{ transform: [{ rotate: '-45deg' }] }}>
                <MaterialIcons name="speed" size={20} color={speedColor} />
              </View>
            </View>
            <Text style={styles.statLabel}>TỐC ĐỘ</Text>
            <Text style={styles.statValue}>{baseSpeed} <Text style={styles.statUnit}>km/h</Text></Text>
          </View>

          {/* Stamina: 75% ring (1 side track) */}
          <View style={styles.statColumn}>
            <View style={[styles.statRing, { borderColor: staminaColor, borderTopColor: trackColor, transform: [{ rotate: '25deg' }] }]}>
              <View style={{ transform: [{ rotate: '-25deg' }] }}>
                <MaterialIcons name="bolt" size={20} color={staminaColor} />
              </View>
            </View>
            <Text style={styles.statLabel}>THỂ LỰC</Text>
            <Text style={styles.statValue}>{staminaScore} <Text style={styles.statUnit}>pts</Text></Text>
          </View>

          {/* Age: 25% ring (3 sides track) */}
          <View style={styles.statColumn}>
            <View style={[styles.statRing, { borderColor: trackColor, borderTopColor: ageColor, transform: [{ rotate: '45deg' }] }]}>
              <View style={{ transform: [{ rotate: '-45deg' }] }}>
                <MaterialIcons name="cake" size={20} color={ageColor} />
              </View>
            </View>
            <Text style={styles.statLabel}>TUỔI</Text>
            <Text style={styles.statValue}>{age} <Text style={styles.statUnit}>tuổi</Text></Text>
          </View>

          {/* Health: Full ring */}
          <View style={styles.statColumn}>
            <View style={[styles.statRing, { borderColor: healthColor }]}>
              <MaterialIcons name="favorite-border" size={20} color={healthColor} />
            </View>
            <Text style={styles.statLabel}>SỨC KHỎE</Text>
            <Text style={[styles.statValue, { color: healthColor }]}>{healthLabel}</Text>
          </View>
        </View>

        {/* ── Info Pills Section ── */}
        <View style={styles.pillsContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.pillsScroll}>
            <View style={styles.infoPill}>
              <MaterialIcons name="person-outline" size={14} color="#9CA3AF" />
              <Text style={styles.infoPillLabel}>Chủ: </Text>
              <Text style={styles.infoPillValue}>{ownerName}</Text>
            </View>
            <View style={styles.infoPill}>
              <MaterialIcons name="emoji-events" size={14} color="#9CA3AF" />
              <Text style={styles.infoPillLabel}>Giải: </Text>
              <Text style={styles.infoPillValue}>{tourName}</Text>
            </View>
            <View style={styles.infoPill}>
              <MaterialIcons name="flag" size={14} color="#9CA3AF" />
              <Text style={styles.infoPillLabel}>Trận: </Text>
              <Text style={styles.infoPillValue}>{raceName}</Text>
            </View>
          </ScrollView>
        </View>
      </View>
    );
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.container}>
        <Tabs.Screen options={{ headerShown: false }} />
        <SleekHeader title="CHIẾN MÃ" showWallet={true} />
        <GridBackground isDark={isDark} />
        <LoadingState />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Tabs.Screen options={{ headerShown: false }} />
      <SleekHeader title="CHIẾN MÃ" showWallet={true} />
      <GridBackground isDark={isDark} />

      <FlatList
        data={horsesData}
        renderItem={renderItem}
        keyExtractor={(item, idx) => item._id || idx.toString()}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={premiumColors.brand} />}
        ListEmptyComponent={
          error ? (
            <ErrorState message={error} onRetry={loadHorses} />
          ) : (
            <View style={styles.emptyWrap}>
              <EmptyState
                icon="pets"
                title="Chưa có chiến mã được phân công"
                subtitle="Nhận lời mời từ chủ ngựa trong tab Hòm thư để liên kết chiến mã của bạn."
              />
            </View>
          )
        }
      />
    </View>
  );
}

const getStyles = (isDark: boolean, theme: any, premiumColors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: isDark ? '#09090B' : '#F4F4F5',
  },
  listContent: {
    paddingHorizontal: premiumSpacing[16],
    paddingTop: premiumSpacing[16],
    paddingBottom: premiumSpacing[96], // Space for dock
  },
  emptyWrap: {
    marginTop: premiumSpacing[32],
  },
  // ── Card Root ──
  card: {
    backgroundColor: '#1E1D23', // Dark slate bg directly matching design
    borderRadius: 16,
    marginBottom: premiumSpacing[16],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    overflow: 'hidden',
  },
  // ── Banner Section ──
  banner: {
    backgroundColor: '#3F1A22', // Dark burgundy
    padding: 16,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    minHeight: 140,
    justifyContent: 'space-between',
    position: 'relative',
    overflow: 'hidden',
  },
  bannerSilhouette: {
    position: 'absolute',
    right: -20,
    bottom: -20,
    opacity: 0.8,
  },
  horseBgImage: {
    width: 160,
    height: 160,
    borderRadius: 80,
    opacity: 0.3,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  bannerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 2,
  },
  codeBadge: {
    backgroundColor: 'rgba(0,0,0,0.4)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  codeBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderColor: 'rgba(16, 185, 129, 0.4)',
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  statusBadgeText: {
    color: '#10B981',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  bannerBottomRow: {
    marginTop: 32,
    zIndex: 2,
  },
  eyebrowText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  horseName: {
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: -0.5,
  },
  // ── Stats Section ──
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  statColumn: {
    alignItems: 'center',
    flex: 1,
  },
  statRing: {
    width: 46,
    height: 46,
    borderRadius: 23,
    borderWidth: 3,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statLabel: {
    color: '#9CA3AF',
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  statValue: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  statUnit: {
    fontSize: 11,
    fontWeight: '600',
    color: '#9CA3AF',
  },
  // ── Info Pills Section ──
  pillsContainer: {
    padding: 12,
  },
  pillsScroll: {
    gap: 8,
    paddingRight: 16,
  },
  infoPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 4,
  },
  infoPillLabel: {
    color: '#9CA3AF',
    fontSize: 12,
  },
  infoPillValue: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
});
