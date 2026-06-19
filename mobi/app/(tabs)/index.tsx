import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, ActivityIndicator, Platform } from 'react-native';
import { tournamentsApi, type TournamentItem } from '../../lib/api-client';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import { useThemeColors } from '@/components/ui/shared';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function TournamentsScreen() {
  const [tournaments, setTournaments] = useState<TournamentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();
  const theme = useThemeColors();

  const loadTournaments = async () => {
    try {
      const res = await tournamentsApi.list({ page: 1, limit: 100 });
      if (res && res.data) {
        setTournaments(res.data);
      }
    } catch (err) {
      console.error('Lỗi lấy danh sách giải đấu:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadTournaments();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadTournaments();
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'active':
      case 'ACTIVE':
        return styles.statusActive;
      case 'completed':
      case 'COMPLETED':
        return styles.statusCompleted;
      default:
        return [styles.statusScheduled, { backgroundColor: theme.cardBorder }];
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
      case 'ACTIVE':
        return 'ĐANG DIỄN RA';
      case 'completed':
      case 'COMPLETED':
        return 'ĐÃ KẾT THÚC';
      case 'scheduled':
      case 'SCHEDULED':
        return 'SẮP DIỄN RA';
      default:
        return status;
    }
  };

  const renderItem = ({ item }: { item: TournamentItem }) => {
    const totalPrize = item.prizePool ? `${(item.prizePool / 1000000).toFixed(1)}M Điểm` : '—';
    const startDate = item.startDate ? new Date(item.startDate).toLocaleDateString('vi-VN') : '—';
    const endDate = item.endDate ? new Date(item.endDate).toLocaleDateString('vi-VN') : '—';

    return (
      <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
        <View style={styles.cardHeader}>
          <Text style={[styles.tournamentName, { color: theme.white }]} numberOfLines={1}>{item.name.toUpperCase()}</Text>
          <View style={[styles.statusBadge, getStatusStyle(item.status)]}>
            <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
          </View>
        </View>

        <Text style={[styles.description, { color: theme.textSecondary }]} numberOfLines={2}>
          {item.description || 'Không có mô tả chi tiết cho giải đấu này.'}
        </Text>

        <View style={[styles.divider, { backgroundColor: theme.cardBorder }]} />

        <View style={styles.cardFooter}>
          <View style={styles.infoRow}>
            <MaterialIcons name="location-on" size={14} color="#E10600" />
            <Text style={[styles.infoText, { color: theme.white }]}>{item.location || 'Trường đua Quốc tế'}</Text>
          </View>

          <View style={styles.infoRow}>
            <MaterialIcons name="date-range" size={14} color={theme.textSecondary} />
            <Text style={[styles.infoText, { color: theme.white }]}>{startDate} - {endDate}</Text>
          </View>
        </View>

        <View style={styles.prizeSection}>
          <Text style={styles.prizeLabel}>TỔNG GIẢI THƯỞNG</Text>
          <Text style={[styles.prizeValue, { color: theme.white }]}>{totalPrize}</Text>
        </View>

        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => router.push({ pathname: '/(tabs)/explore', params: { tournamentId: item._id } })}
        >
          <Text style={styles.actionButtonText}>XEM LỊCH TRÌNH ĐUA</Text>
          <MaterialIcons name="arrow-forward" size={16} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.bg }]}>
        <ActivityIndicator size="large" color="#E10600" />
        <Text style={[styles.loadingText, { color: theme.textSecondary }]}>Đang tải danh sách giải đấu...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>
      <FlatList
        data={tournaments}
        renderItem={renderItem}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContent}
        onRefresh={onRefresh}
        refreshing={refreshing}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialIcons name="sentiment-dissatisfied" size={48} color={theme.textMuted} />
            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>Hiện chưa có giải đấu nào được công bố.</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1C1C25',
  },
  listContent: {
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#1C1C25',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: '#AAAAAA',
    fontSize: 14,
    marginTop: 12,
  },
  card: {
    backgroundColor: '#15151E',
    borderWidth: 1,
    borderColor: '#303037',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  tournamentName: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
    flex: 1,
    marginRight: 8,
    fontFamily: Platform.OS === 'ios' ? 'HelveticaNeue-CondensedBold' : 'sans-serif-condensed',
  },
  statusBadge: {
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  statusActive: {
    backgroundColor: '#E10600',
  },
  statusCompleted: {
    backgroundColor: '#067E6A',
  },
  statusScheduled: {
    backgroundColor: '#303037',
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  description: {
    color: '#AAAAAA',
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 14,
  },
  divider: {
    height: 1,
    backgroundColor: '#303037',
    marginBottom: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    flexWrap: 'wrap',
    gap: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  infoText: {
    color: '#E0DEDC',
    fontSize: 12,
    fontWeight: '500',
  },
  prizeSection: {
    backgroundColor: 'rgba(225, 6, 0, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(225, 6, 0, 0.2)',
    borderRadius: 8,
    padding: 10,
    alignItems: 'center',
    marginBottom: 16,
  },
  prizeLabel: {
    color: '#E10600',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 2,
  },
  prizeValue: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '900',
    fontFamily: Platform.OS === 'ios' ? 'Courier-Bold' : 'monospace',
  },
  actionButton: {
    backgroundColor: '#E10600',
    borderRadius: 20,
    height: 40,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    color: '#AAAAAA',
    fontSize: 14,
    marginTop: 12,
    textAlign: 'center',
  },
});
