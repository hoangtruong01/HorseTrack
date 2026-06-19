import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, ActivityIndicator, Alert, Platform } from 'react-native';
import { refereeAssignmentsApi } from '../../../lib/api-client';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function AssignedRacesScreen() {
  const [assignments, setAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const loadAssignments = React.useCallback(async () => {
    setError(null);
    try {
      const res = await refereeAssignmentsApi.myAssignments({ limit: 50 });
      if (res) {
        setAssignments((res as any).data || res);
      }
    } catch (err: any) {
      console.error('Lỗi lấy phân công trọng tài:', err);
      setError(err.message || 'Không thể tải danh sách phân công.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadAssignments();
  }, [loadAssignments]);

  const onRefresh = () => {
    setRefreshing(true);
    loadAssignments();
  };

  const handleRespond = async (assignmentId: string, response: 'accepted' | 'declined') => {
    const actionLabel = response === 'accepted' ? 'nhận phân công' : 'từ chối phân công';
    Alert.alert('Xác nhận', `Bạn có chắc muốn ${actionLabel} này?`, [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Đồng ý',
        onPress: async () => {
          try {
            await refereeAssignmentsApi.respond(assignmentId, response);
            Alert.alert('Thành công', 'Đã lưu phản hồi của bạn.');
            loadAssignments();
          } catch (err: any) {
            Alert.alert('Thất bại', err.message || 'Lỗi xử lý phản hồi.');
          }
        },
      },
    ]);
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'assigned': return 'ĐANG CHỜ NHẬN';
      case 'accepted': return 'ĐÃ NHẬN NHIỆM VỤ';
      case 'declined': return 'ĐÃ TỪ CHỐI';
      default: return status.toUpperCase();
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted': return '#067E6A';
      case 'declined': return '#E10600';
      default: return '#E1A200';
    }
  };

  const renderItem = ({ item }: { item: any }) => {
    const race = item.raceId;
    if (!race) return null;

    const isPending = item.status === 'assigned';
    const isAccepted = item.status === 'accepted';
    
    const startTimeStr = new Date(race.startTime).toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View>
            <Text style={styles.raceName}>{race.name.toUpperCase()}</Text>
            <Text style={styles.startTimeText}>Bắt đầu: {startTimeStr}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
            <Text style={styles.statusBadgeText}>{getStatusText(item.status)}</Text>
          </View>
        </View>

        <View style={styles.cardBody}>
          <Text style={styles.bodyText}>Vai trò: <Text style={styles.whiteBold}>{item.role === 'main' ? 'TRỌNG TÀI CHÍNH' : 'TRỢ LÝ TRỌNG TÀI'}</Text></Text>
          <Text style={styles.bodyText}>Trạng thái trận: <Text style={styles.whiteBold}>{race.status}</Text></Text>
        </View>

        {isPending && (
          <View style={styles.actionsContainer}>
            <TouchableOpacity 
              style={[styles.actionButton, styles.rejectButton]}
              onPress={() => handleRespond(item._id, 'declined')}
            >
              <Text style={styles.actionButtonText}>TỪ CHỐI</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.actionButton, styles.acceptButton]}
              onPress={() => handleRespond(item._id, 'accepted')}
            >
              <Text style={styles.actionButtonText}>CHẤP NHẬN</Text>
            </TouchableOpacity>
          </View>
        )}

        {isAccepted && (
          <View style={styles.acceptedWorkContainer}>
            <TouchableOpacity 
              style={styles.opsButton}
              onPress={() => router.push({ pathname: '/operations/referee/pre-race', params: { raceId: race._id } })}
            >
              <MaterialIcons name="fact-check" size={18} color="#FFFFFF" />
              <Text style={styles.opsButtonText}>ĐIỂM DANH</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.opsButton, { backgroundColor: 'rgba(255,255,255,0.09)', borderColor: '#E10600', borderWidth: 1 }]}
              onPress={() => router.push({ pathname: '/operations/referee/violation-log', params: { raceId: race._id } })}
            >
              <MaterialIcons name="warning" size={18} color="#E10600" />
              <Text style={[styles.opsButtonText, { color: '#E10600' }]}>VI PHẠM</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.opsButton, { backgroundColor: '#E1A200' }]}
              onPress={() => router.push({ pathname: '/operations/referee/result-entry', params: { raceId: race._id } })}
            >
              <MaterialIcons name="emoji-events" size={18} color="#FFFFFF" />
              <Text style={styles.opsButtonText}>KẾT QUẢ</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#E10600" />
        <Text style={styles.loadingText}>Đang tải danh sách phân công...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={assignments}
        renderItem={renderItem}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContent}
        onRefresh={onRefresh}
        refreshing={refreshing}
        ListEmptyComponent={
          error ? (
            <View style={styles.emptyContainer}>
              <MaterialIcons name="error-outline" size={48} color="#E10600" />
              <Text style={[styles.emptyText, { color: '#E10600' }]}>{error}</Text>
            </View>
          ) : (
            <View style={styles.emptyContainer}>
              <MaterialIcons name="assignment-late" size={48} color="#58585B" />
              <Text style={styles.emptyText}>Bạn chưa nhận được phân công nào gần đây.</Text>
            </View>
          )
        }
      />

      <TouchableOpacity 
        style={styles.backHomeButton}
        onPress={() => router.replace('/(referee)')}
      >
        <MaterialIcons name="arrow-back" size={18} color="#AAAAAA" />
        <Text style={styles.backHomeButtonText}>QUAY LẠI TRANG CHỦ</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  listContent: {
    padding: 16,
    paddingBottom: 110,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: '#AAAAAA',
    fontSize: 14,
    marginTop: 12,
  },
  card: {
    backgroundColor: 'rgba(18, 18, 22, 0.86)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.09)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottomWidth: 1,
    borderBottomColor: '#000000',
    paddingBottom: 10,
    marginBottom: 10,
  },
  raceName: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '900',
    fontFamily: Platform.OS === 'ios' ? 'HelveticaNeue-CondensedBold' : 'sans-serif-condensed',
  },
  startTimeText: {
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
  cardBody: {
    gap: 4,
    marginBottom: 12,
  },
  bodyText: {
    color: '#AAAAAA',
    fontSize: 12,
  },
  whiteBold: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#000000',
    paddingTop: 12,
  },
  actionButton: {
    flex: 1,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rejectButton: {
    backgroundColor: 'rgba(255,255,255,0.09)',
    borderWidth: 1,
    borderColor: '#E10600',
  },
  acceptButton: {
    backgroundColor: '#E10600',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  acceptedWorkContainer: {
    flexDirection: 'row',
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: '#000000',
    paddingTop: 12,
  },
  opsButton: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#067E6A',
    borderRadius: 6,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  opsButtonText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
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
  backHomeButton: {
    flexDirection: 'row',
    height: 48,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.09)',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(18, 18, 22, 0.86)',
    gap: 8,
    marginBottom: 80,
  },
  backHomeButtonText: {
    color: '#AAAAAA',
    fontSize: 12,
    fontWeight: '800',
  },
});
