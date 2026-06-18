import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LoadingState, EmptyState, statusLabel } from '@/components/ui/shared';
import { tournamentsApi } from '@/lib/api-client';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

export default function SpectatorTournaments() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'open' | 'upcoming' | 'draft'>('all');
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    tournamentsApi
      .list({ limit: 50 })
      .then((r) => setData((r as any).data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingState />;

  const filteredData = data.filter((t) => {
    if (selectedFilter === 'all') return true;
    if (selectedFilter === 'open') return t.status === 'ONGOING' || t.status === 'OPEN_REGISTRATION';
    if (selectedFilter === 'upcoming') return t.status === 'UPCOMING' || t.status === 'CLOSED_REGISTRATION' || t.status === 'SCHEDULED';
    if (selectedFilter === 'draft') return t.status === 'DRAFT';
    return true;
  });

  const scrollToBottom = () => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  };

  return (
    <SafeAreaView style={s.safeArea} edges={['top', 'left', 'right']}>
      {/* ── Header Row ── */}
      <View style={s.headerRow}>
        <Text style={s.headerTitle}>Giải đấu</Text>
        <View style={s.headerActions}>
          <TouchableOpacity style={s.iconButton} activeOpacity={0.7}>
            <MaterialIcons name="search" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <TouchableOpacity style={s.iconButton} activeOpacity={0.7}>
            <MaterialIcons name="filter-list" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Filters Row ── */}
      <View style={s.filtersContainer}>
        <TouchableOpacity
          style={[s.chip, selectedFilter === 'all' && s.chipSelected]}
          onPress={() => setSelectedFilter('all')}
          activeOpacity={0.8}
        >
          <Text style={[s.chipText, selectedFilter === 'all' && s.chipTextSelected]}>Tất cả</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[s.chip, selectedFilter === 'open' && s.chipSelected]}
          onPress={() => setSelectedFilter('open')}
          activeOpacity={0.8}
        >
          <Text style={[s.chipText, selectedFilter === 'open' && s.chipTextSelected]}>Đang mở</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[s.chip, selectedFilter === 'upcoming' && s.chipSelected]}
          onPress={() => setSelectedFilter('upcoming')}
          activeOpacity={0.8}
        >
          <Text style={[s.chipText, selectedFilter === 'upcoming' && s.chipTextSelected]}>Sắp diễn ra</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[s.chip, selectedFilter === 'draft' && s.chipSelected]}
          onPress={() => setSelectedFilter('draft')}
          activeOpacity={0.8}
        >
          <Text style={[s.chipText, selectedFilter === 'draft' && s.chipTextSelected]}>Bản nháp</Text>
        </TouchableOpacity>
      </View>

      {/* ── Scrollable Content ── */}
      <ScrollView
        ref={scrollViewRef}
        style={s.scrollView}
        contentContainerStyle={s.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Count Row */}
        <View style={s.countRow}>
          <View style={s.countDot} />
          <Text style={s.countText}>{filteredData.length} giải đấu đang hiển thị</Text>
        </View>

        {filteredData.length === 0 ? (
          <EmptyState
            icon="emoji-events"
            title="Chưa có giải đấu"
            subtitle="Hiện tại không có giải đấu nào phù hợp với bộ lọc này."
          />
        ) : (
          <>
            {/* Featured Tournament Banner */}
            <TouchableOpacity style={s.featuredCard} activeOpacity={0.9}>
              <Image
                source={require('../../assets/images/hero_horse_racing.png')}
                style={s.featuredImage}
                resizeMode="cover"
              />
              <View style={s.featuredOverlay} />
              <View style={s.featuredContent}>
                <View style={s.featuredBadgeContainer}>
                  <MaterialIcons name="star" size={14} color="#E10600" style={s.starIcon} />
                  <Text style={s.featuredBadgeText}>Giải đấu nổi bật</Text>
                </View>
                <Text style={s.featuredTitle} numberOfLines={1}>
                  Chinh phục đường đua
                </Text>
                <Text style={s.featuredSubtitle} numberOfLines={2}>
                  Tham gia ngay để nhận những phần thưởng hấp dẫn và vinh quang.
                </Text>
              </View>
              <View style={s.featuredChevronContainer}>
                <MaterialIcons name="chevron-right" size={18} color="#FFFFFF" />
              </View>
            </TouchableOpacity>

            {/* List all tournaments */}
            {filteredData.map((t) => {
              const st = statusLabel(t.status);
              return (
                <TouchableOpacity key={t._id || t.id} style={s.card} activeOpacity={0.8}>
                  <View style={s.cardIconContainer}>
                    <MaterialIcons name="emoji-events" size={24} color="#E10600" />
                  </View>
                  <View style={s.cardContent}>
                    <Text style={s.cardTitle} numberOfLines={1}>
                      {t.name}
                    </Text>
                    <Text style={s.cardSubtitle} numberOfLines={1}>
                      {t.location || 'Saigon Racecourse'} · Giải thưởng: {t.prizePool?.toLocaleString('vi-VN') || 0} đ
                    </Text>
                  </View>
                  <View style={[s.badge, { borderColor: st.color + '40', backgroundColor: st.color + '15' }]}>
                    <Text style={[s.badgeText, { color: st.color }]}>{st.label}</Text>
                  </View>
                  <MaterialIcons name="chevron-right" size={20} color="#6F7785" />
                </TouchableOpacity>
              );
            })}
          </>
        )}
      </ScrollView>

      {/* Floating Scroll Button */}
      {filteredData.length > 3 && (
        <TouchableOpacity style={s.floatingButton} onPress={scrollToBottom} activeOpacity={0.8}>
          <MaterialIcons name="arrow-downward" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0B0D12',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconButton: {
    padding: 4,
  },
  filtersContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 8,
  },
  chip: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#171B24',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  chipSelected: {
    borderColor: '#E10600',
    backgroundColor: 'rgba(225, 6, 0, 0.15)',
  },
  chipText: {
    fontSize: 12,
    color: '#AEB6C2',
    fontWeight: '500',
  },
  chipTextSelected: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 80,
  },
  countRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 6,
  },
  countDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#E10600',
  },
  countText: {
    fontSize: 12,
    color: '#AEB6C2',
  },
  featuredCard: {
    height: 160,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
    marginBottom: 20,
  },
  featuredImage: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  featuredOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(11, 13, 18, 0.65)',
  },
  featuredContent: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
    zIndex: 2,
    width: '80%',
  },
  featuredBadgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 4,
  },
  starIcon: {
    marginRight: 2,
  },
  featuredBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#E10600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  featuredTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 6,
  },
  featuredSubtitle: {
    fontSize: 12,
    color: '#AEB6C2',
    lineHeight: 16,
  },
  featuredChevronContainer: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#11141B',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
  },
  cardIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 10,
    backgroundColor: 'rgba(225, 6, 0, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardContent: {
    flex: 1,
    paddingLeft: 12,
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 12,
    color: '#AEB6C2',
  },
  badge: {
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 6,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  floatingButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#202633',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
});
