import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, ActivityIndicator, Alert, SafeAreaView } from 'react-native';
import { jockeyInvitationsApi } from '../../lib/api-client';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

export default function InvitationInboxScreen() {
  const [invitations, setInvitations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadInvitations = async () => {
    setError(null);
    try {
      const res = await jockeyInvitationsApi.listReceived({ page: 1, limit: 100 });
      if (res) {
        setInvitations((res as any).data || res);
      }
    } catch (err: any) {
      console.error('Lỗi lấy danh sách lời mời:', err);
      setError(err.message || 'Không thể tải danh sách lời mời.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadInvitations();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadInvitations();
  };

  const handleRespond = async (invitationId: string, response: 'ACCEPTED' | 'REJECTED') => {
    const actionLabel = response === 'ACCEPTED' ? 'chấp nhận' : 'từ chối';
    Alert.alert('Xác nhận', `Bạn có chắc muốn ${actionLabel} lời mời này?`, [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Đồng ý',
        onPress: async () => {
          try {
            await jockeyInvitationsApi.respond(invitationId, response);
            Alert.alert('Thành công', `Đã ${actionLabel} lời mời!`);
            loadInvitations();
          } catch (err: any) {
            Alert.alert('Lỗi', err.message || 'Không thể phản hồi lời mời.');
          }
        },
      },
    ]);
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PENDING': return 'ĐANG CHỜ';
      case 'ACCEPTED': return 'ĐÃ CHẤP NHẬN';
      case 'REJECTED': return 'ĐÃ TỪ CHỐI';
      default: return status.toUpperCase();
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACCEPTED': return '#067E6A';
      case 'REJECTED': return '#E10600';
      default: return '#E1A200';
    }
  };

  const renderItem = ({ item }: { item: any }) => {
    const raceName = item.raceId?.name || 'Trận đấu';
    const tourName = item.tournamentId?.name || 'Giải đua';
    const horseName = item.horseId?.name || 'Chiến mã';
    const ownerName = item.ownerId?.fullName || 'Chủ trại';
    const isPending = item.status === 'PENDING';

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View>
            <Text style={styles.tourLabel} numberOfLines={1}>{tourName.toUpperCase()}</Text>
            <Text style={styles.raceName} numberOfLines={1}>{raceName.toUpperCase()}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
            <Text style={styles.statusBadgeText}>{getStatusText(item.status)}</Text>
          </View>
        </View>

        <View style={styles.cardBody}>
          <View style={styles.infoRow}>
            <MaterialIcons name="pets" size={14} color="#E10600" />
            <Text style={styles.infoText}>Chiến mã: <Text style={styles.whiteText}>{horseName.toUpperCase()}</Text></Text>
          </View>
          <View style={styles.infoRow}>
            <MaterialIcons name="person" size={14} color="#AAAAAA" />
            <Text style={styles.infoText}>Chủ ngựa: <Text style={styles.whiteText}>{ownerName}</Text></Text>
          </View>
        </View>

        {isPending && (
          <View style={styles.actionsContainer}>
            <TouchableOpacity 
              style={[styles.actionButton, styles.rejectButton]}
              onPress={() => handleRespond(item._id, 'REJECTED')}
            >
              <Text style={styles.actionButtonText}>TỪ CHỐI</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.actionButton, styles.acceptButton]}
              onPress={() => handleRespond(item._id, 'ACCEPTED')}
            >
              <Text style={styles.actionButtonText}>CHẤP NHẬN</Text>
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
        <Text style={styles.loadingText}>Đang tải danh sách lời mời...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={invitations}
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
              <MaterialIcons name="mail-outline" size={48} color="#58585B" />
              <Text style={styles.emptyText}>Hòm thư lời mời của bạn đang trống.</Text>
            </View>
          )
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
    alignItems: 'flex-start',
    borderBottomWidth: 1,
    borderBottomColor: '#1C1C25',
    paddingBottom: 10,
    marginBottom: 10,
  },
  tourLabel: {
    color: '#E10600',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  raceName: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
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
    gap: 6,
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoText: {
    color: '#AAAAAA',
    fontSize: 12,
  },
  whiteText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#1C1C25',
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
    backgroundColor: '#303037',
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
    letterSpacing: 0.5,
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
