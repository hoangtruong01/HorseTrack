import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, ActivityIndicator, SafeAreaView } from 'react-native';
import { horsesApi, type HorseItem } from '../../lib/api-client';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

export default function MyHorsesScreen() {
  const [horses, setHorses] = useState<HorseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'APPROVED' | 'PENDING'>('APPROVED');

  const loadHorses = async () => {
    try {
      const res = await horsesApi.list({ page: 1, limit: 100 });
      if (res && res.data) {
        setHorses(res.data);
      }
    } catch (err) {
      console.error('Lỗi lấy chuồng ngựa:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadHorses();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadHorses();
  };

  const getApprovalStatusColor = (status?: string) => {
    switch (status) {
      case 'APPROVED': return '#067E6A';
      case 'PENDING': return '#E1A200';
      case 'REJECTED': return '#E10600';
      default: return '#58585B';
    }
  };

  const getApprovalStatusText = (status?: string) => {
    switch (status) {
      case 'APPROVED': return 'ĐÃ PHÊ DUYỆT';
      case 'PENDING': return 'ĐANG CHỜ DUYỆT';
      case 'REJECTED': return 'BỊ TỪ CHỐI';
      default: return 'CHƯA PHÊ DUYỆT';
    }
  };

  // Filter horses based on tab selection
  const filteredHorses = horses.filter((horse) => {
    const isApproved = horse.approvalStatus === 'APPROVED' || !horse.approvalStatus;
    if (activeTab === 'APPROVED') return isApproved;
    return horse.approvalStatus === 'PENDING' || horse.approvalStatus === 'REJECTED';
  });

  const renderItem = ({ item }: { item: HorseItem }) => {
    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View>
            <Text style={styles.horseName}>{item.name.toUpperCase()}</Text>
            <Text style={styles.breedText}>{item.breed || 'Thuần chủng'}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: getApprovalStatusColor(item.approvalStatus) }]}>
            <Text style={styles.statusBadgeText}>{getApprovalStatusText(item.approvalStatus)}</Text>
          </View>
        </View>

        <View style={styles.statsGrid}>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>TỐC ĐỘ</Text>
            <Text style={styles.statValue}>{item.baseSpeed || 50} km/h</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>THỂ LỰC</Text>
            <Text style={styles.statValue}>{item.staminaScore || 70}/100</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>TUỔI</Text>
            <Text style={styles.statValue}>{item.age || 4} Tuổi</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>TRẠNG THÁI</Text>
            <Text style={[styles.statValue, { color: item.healthStatus === 'healthy' ? '#067E6A' : '#E10600' }]}>
              {item.healthStatus === 'healthy' ? 'Khỏe mạnh' : 'Chấn thương'}
            </Text>
          </View>
        </View>

        {item.rejectionReason && (
          <View style={styles.rejectionReasonBox}>
            <Text style={styles.rejectionReasonTitle}>LÝ DO TỪ CHỐI:</Text>
            <Text style={styles.rejectionReasonText}>{item.rejectionReason}</Text>
          </View>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#E10600" />
        <Text style={styles.loadingText}>Đang tải danh sách chiến mã...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.tabBar}>
        <TouchableOpacity 
          style={[styles.tabButton, activeTab === 'APPROVED' && styles.tabButtonActive]}
          onPress={() => setActiveTab('APPROVED')}
        >
          <Text style={[styles.tabText, activeTab === 'APPROVED' && styles.tabTextActive]}>CHUỒNG ĐUA CHÍNH THỨC</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.tabButton, activeTab === 'PENDING' && styles.tabButtonActive]}
          onPress={() => setActiveTab('PENDING')}
        >
          <Text style={[styles.tabText, activeTab === 'PENDING' && styles.tabTextActive]}>CHỜ PHÊ DUYỆT</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredHorses}
        renderItem={renderItem}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContent}
        onRefresh={onRefresh}
        refreshing={refreshing}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialIcons name="pets" size={48} color="#58585B" />
            <Text style={styles.emptyText}>Chuồng ngựa của bạn đang trống.</Text>
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
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#15151E',
    borderBottomWidth: 1,
    borderBottomColor: '#303037',
    height: 44,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabButtonActive: {
    borderBottomColor: '#E10600',
  },
  tabText: {
    color: '#AAAAAA',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  tabTextActive: {
    color: '#FFFFFF',
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
    alignItems: 'flex-start',
    borderBottomWidth: 1,
    borderBottomColor: '#1C1C25',
    paddingBottom: 10,
    marginBottom: 12,
  },
  horseName: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '900',
  },
  breedText: {
    color: '#AAAAAA',
    fontSize: 11,
    marginTop: 2,
  },
  statusBadge: {
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  statusBadgeText: {
    color: '#FFFFFF',
    fontSize: 8,
    fontWeight: '900',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  statBox: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#1C1C25',
    borderWidth: 1,
    borderColor: '#303037',
    borderRadius: 8,
    padding: 8,
  },
  statLabel: {
    color: '#58585B',
    fontSize: 8,
    fontWeight: '800',
    marginBottom: 2,
  },
  statValue: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  rejectionReasonBox: {
    backgroundColor: 'rgba(225, 6, 0, 0.05)',
    borderWidth: 1,
    borderColor: '#E10600',
    borderRadius: 8,
    padding: 10,
    marginTop: 12,
  },
  rejectionReasonTitle: {
    color: '#E10600',
    fontSize: 9,
    fontWeight: '900',
    marginBottom: 2,
  },
  rejectionReasonText: {
    color: '#AAAAAA',
    fontSize: 11,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyText: {
    color: '#AAAAAA',
    fontSize: 13,
    marginTop: 12,
    textAlign: 'center',
  },
});
