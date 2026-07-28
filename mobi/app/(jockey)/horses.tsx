import React, { useEffect, useState, useCallback } from 'react';
import { StyleSheet, View, Text, FlatList, RefreshControl, ScrollView, Image, Modal, TouchableOpacity } from 'react-native';
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
  const [selectedHorse, setSelectedHorse] = useState<any | null>(null);
  const [showDetail, setShowDetail] = useState(false);

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
    const trackColor = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)';

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => {
          setSelectedHorse(horseObj);
          setShowDetail(true);
        }}
        activeOpacity={0.9}
      >
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
      </TouchableOpacity>
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

      {/* Modal chi tiết Chiến mã */}
      <Modal visible={showDetail && !!selectedHorse} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Chi Tiết Chiến Mã</Text>
              <TouchableOpacity onPress={() => { setShowDetail(false); setSelectedHorse(null); }} style={styles.closeIconBox} activeOpacity={0.8}>
                <MaterialIcons name="close" size={24} color={theme.textSecondary} />
              </TouchableOpacity>
            </View>

            {selectedHorse && (
              <ScrollView style={{ maxHeight: 480 }} showsVerticalScrollIndicator={false}>
                {/* Image Section */}
                <View style={styles.detailImageContainer}>
                  {selectedHorse.image ? (
                    <Image source={{ uri: selectedHorse.image }} style={styles.detailImage} />
                  ) : (
                    <View style={styles.detailImagePlaceholder}>
                      <MaterialIcons name="pets" size={64} color={premiumColors.brand} />
                      <Text style={{ color: theme.textSecondary, marginTop: 8, fontSize: 13, fontWeight: '600' }}>Không có hình ảnh</Text>
                    </View>
                  )}
                </View>

                {/* Name */}
                <Text style={styles.detailName}>{selectedHorse.name?.toUpperCase()}</Text>

                {/* Stats Grid */}
                <Text style={styles.sectionLabel}>Thông số kỹ thuật</Text>
                <View style={styles.detailGrid}>
                  <View style={styles.detailGridItem}>
                    <Text style={styles.gridLabel}>Tốc độ cơ bản</Text>
                    <Text style={styles.gridValue}>{selectedHorse.baseSpeed || 50} km/h</Text>
                  </View>
                  <View style={styles.detailGridItem}>
                    <Text style={styles.gridLabel}>Thể lực</Text>
                    <Text style={styles.gridValue}>{selectedHorse.staminaScore || 70}/100</Text>
                  </View>
                  <View style={styles.detailGridItem}>
                    <Text style={styles.gridLabel}>Trạng thái</Text>
                    <Text style={[styles.gridValue, { color: selectedHorse.healthStatus?.toLowerCase() === 'healthy' ? '#10B981' : '#EF4444' }]}>
                      {selectedHorse.healthStatus?.toLowerCase() === 'healthy' ? 'Khỏe mạnh' : 'Chấn thương'}
                    </Text>
                  </View>
                  <View style={styles.detailGridItem}>
                    <Text style={styles.gridLabel}>Giống</Text>
                    <Text style={styles.gridValue}>{selectedHorse.breed || 'Chưa rõ'}</Text>
                  </View>
                  <View style={styles.detailGridItem}>
                    <Text style={styles.gridLabel}>Tuổi</Text>
                    <Text style={styles.gridValue}>{selectedHorse.age ? `${selectedHorse.age} tuổi` : 'Chưa rõ'}</Text>
                  </View>
                  <View style={styles.detailGridItem}>
                    <Text style={styles.gridLabel}>Màu lông</Text>
                    <Text style={styles.gridValue}>{selectedHorse.color || 'Chưa rõ'}</Text>
                  </View>
                  <View style={styles.detailGridItem}>
                    <Text style={styles.gridLabel}>Cân nặng</Text>
                    <Text style={styles.gridValue}>{selectedHorse.weightKg ? `${selectedHorse.weightKg} kg` : 'Chưa rõ'}</Text>
                  </View>
                  <View style={styles.detailGridItem}>
                    <Text style={styles.gridLabel}>Chiều cao</Text>
                    <Text style={styles.gridValue}>{selectedHorse.heightCm ? `${selectedHorse.heightCm} cm` : 'Chưa rõ'}</Text>
                  </View>
                </View>

                {/* Description */}
                {selectedHorse.description && (
                  <View style={{ marginTop: 16 }}>
                    <Text style={styles.sectionLabel}>Mô tả</Text>
                    <View style={styles.detailDescBox}>
                      <Text style={styles.detailDescText}>{selectedHorse.description}</Text>
                    </View>
                  </View>
                )}
              </ScrollView>
            )}

            <View style={{ marginTop: 16 }}>
              <TouchableOpacity style={styles.btnOutlineModal} onPress={() => { setShowDetail(false); setSelectedHorse(null); }} activeOpacity={0.8}>
                <Text style={styles.btnOutlineText}>Đóng</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    backgroundColor: isDark ? '#1E1D23' : premiumColors.surface,
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
    backgroundColor: isDark ? '#3F1A22' : 'rgba(225, 6, 0, 0.05)',
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
    backgroundColor: isDark ? 'rgba(0,0,0,0.4)' : 'rgba(0,0,0,0.05)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  codeBadgeText: {
    color: isDark ? '#FFFFFF' : premiumColors.text,
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
    color: isDark ? 'rgba(255,255,255,0.7)' : premiumColors.textSecondary,
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  horseName: {
    color: isDark ? '#FFFFFF' : premiumColors.text,
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
    color: isDark ? '#FFFFFF' : premiumColors.text,
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
    backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)',
    borderWidth: 1,
    borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
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
    color: isDark ? '#FFFFFF' : premiumColors.text,
    fontSize: 12,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: isDark ? '#0F0F12' : '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    borderWidth: 1,
    borderColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    color: theme.textPrimary,
    fontSize: 18,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  closeIconBox: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnOutlineModal: {
    borderWidth: 1,
    borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
  },
  btnOutlineText: {
    color: theme.textPrimary,
    fontWeight: '700',
    fontSize: 14,
  },
  detailImageContainer: {
    width: '100%',
    height: 180,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
    backgroundColor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
    marginBottom: 16,
  },
  detailImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  detailImagePlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailName: {
    color: theme.textPrimary,
    fontSize: 20,
    fontWeight: '900',
    textTransform: 'uppercase',
    textAlign: 'center',
    marginBottom: 16,
  },
  sectionLabel: {
    color: theme.textSecondary,
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  detailGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  detailGridItem: {
    width: '48%',
    backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : '#F4F4F5',
    borderWidth: 1,
    borderColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
    borderRadius: 12,
    padding: 10,
  },
  gridLabel: {
    color: theme.textSecondary,
    fontSize: 9,
    fontWeight: '800',
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  gridValue: {
    color: theme.textPrimary,
    fontSize: 13,
    fontWeight: '700',
  },
  detailDescBox: {
    backgroundColor: isDark ? 'rgba(255,255,255,0.02)' : '#F9F9FB',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
  },
  detailDescText: {
    color: theme.textSecondary,
    fontSize: 13,
    lineHeight: 20,
    fontStyle: 'italic',
  },
});
