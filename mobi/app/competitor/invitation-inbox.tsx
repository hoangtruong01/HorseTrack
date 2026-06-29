import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, ActivityIndicator, Alert, RefreshControl } from 'react-native';
import { jockeyInvitationsApi } from '../../lib/api-client';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { AppScreen } from '@/components/ui/premium';
import { SleekHeader } from '@/components/ui/sleek-header';
import { premiumColors, premiumSpacing, premiumRadius } from '@/components/ui/premium-tokens';

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
      case 'ACCEPTED': return premiumColors.success;
      case 'REJECTED': return premiumColors.danger;
      default: return premiumColors.warning;
    }
  };

  const renderItem = ({ item }: { item: any }) => {
    const raceName = item.raceId?.name || 'Trận đấu';
    const tourName = item.tournamentId?.name || 'Giải đua';
    const horseName = item.horseId?.name || 'Chiến mã';
    const ownerName = item.ownerId?.fullName || 'Chủ trại';
    const isPending = item.status === 'PENDING';
    const statusColor = getStatusColor(item.status);

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.cardHeaderLeft}>
            <Text style={styles.tourLabel} numberOfLines={1}>{tourName.toUpperCase()}</Text>
            <Text style={styles.raceName} numberOfLines={1}>{raceName.toUpperCase()}</Text>
          </View>
          <View style={[styles.badge, { backgroundColor: statusColor + '15', borderColor: statusColor + '40' }]}>
            <Text style={[styles.badgeText, { color: statusColor }]}>{getStatusText(item.status)}</Text>
          </View>
        </View>

        <View style={styles.cardBody}>
          <View style={styles.infoRow}>
            <MaterialIcons name="pets" size={14} color={premiumColors.textMuted} />
            <Text style={styles.infoText}>Chiến mã: <Text style={styles.highlightText}>{horseName.toUpperCase()}</Text></Text>
          </View>
          <View style={styles.infoRow}>
            <MaterialIcons name="person" size={14} color={premiumColors.textMuted} />
            <Text style={styles.infoText}>Chủ ngựa: <Text style={styles.highlightText}>{ownerName}</Text></Text>
          </View>
        </View>

        {isPending && (
          <View style={styles.actionsRow}>
            <TouchableOpacity 
              style={[styles.btn, styles.btnReject]}
              onPress={() => handleRespond(item._id, 'REJECTED')}
              activeOpacity={0.7}
            >
              <Text style={styles.btnRejectText}>TỪ CHỐI</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.btn, styles.btnAccept]}
              onPress={() => handleRespond(item._id, 'ACCEPTED')}
              activeOpacity={0.7}
            >
              <Text style={styles.btnAcceptText}>CHẤP NHẬN</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={premiumColors.brand} />
        <Text style={styles.loadingText}>Đang tải danh sách lời mời...</Text>
      </View>
    );
  }

  return (
    <AppScreen safeArea={false} style={styles.container}>
      <SleekHeader title="HÒM THƯ LỜI MỜI" showWallet={true} />

      <FlatList
        data={invitations}
        renderItem={renderItem}
        keyExtractor={(item) => item._id || item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={premiumColors.brand} colors={[premiumColors.brand]} />
        }
        ListEmptyComponent={
          error ? (
            <View style={styles.emptyContainer}>
              <MaterialIcons name="error-outline" size={48} color={premiumColors.danger} />
              <Text style={[styles.emptyText, { color: premiumColors.danger, marginTop: 12 }]}>{error}</Text>
            </View>
          ) : (
            <View style={styles.emptyContainer}>
              <MaterialIcons name="mail-outline" size={48} color={premiumColors.textMuted} />
              <Text style={styles.emptyText}>Hòm thư lời mời của bạn đang trống.</Text>
            </View>
          )
        }
      />
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: premiumColors.bg,
  },
  centerContainer: {
    flex: 1,
    backgroundColor: premiumColors.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: premiumColors.textSecondary,
    fontSize: 14,
    marginTop: premiumSpacing[12],
  },
  
  // ── Header ──
  header: {
    paddingHorizontal: premiumSpacing[16],
    paddingTop: premiumSpacing[24],
    paddingBottom: premiumSpacing[16],
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
  },

  listContent: {
    paddingHorizontal: premiumSpacing[16],
    paddingBottom: premiumSpacing[48],
  },
  
  // ── Card ──
  card: {
    backgroundColor: premiumColors.surface,
    borderWidth: 1,
    borderColor: premiumColors.border,
    borderRadius: premiumRadius[12],
    padding: premiumSpacing[16],
    marginBottom: premiumSpacing[16],
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottomWidth: 1,
    borderBottomColor: premiumColors.border,
    paddingBottom: premiumSpacing[12],
    marginBottom: premiumSpacing[12],
  },
  cardHeaderLeft: {
    flex: 1,
    paddingRight: 8,
  },
  tourLabel: {
    color: premiumColors.brand,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  raceName: {
    color: premiumColors.text,
    fontSize: 15,
    fontWeight: '700',
  },
  badge: {
    borderWidth: 1,
    borderRadius: premiumRadius[4],
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
  },

  cardBody: {
    gap: premiumSpacing[8],
    marginBottom: premiumSpacing[4],
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  infoText: {
    color: premiumColors.textSecondary,
    fontSize: 13,
  },
  highlightText: {
    color: premiumColors.text,
    fontWeight: '600',
  },

  // ── Actions ──
  actionsRow: {
    flexDirection: 'row',
    gap: premiumSpacing[12],
    marginTop: premiumSpacing[16],
    paddingTop: premiumSpacing[12],
    borderTopWidth: 1,
    borderTopColor: premiumColors.border,
  },
  btn: {
    flex: 1,
    height: 36,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  btnReject: {
    backgroundColor: premiumColors.surface2,
    borderColor: premiumColors.border,
  },
  btnRejectText: {
    color: premiumColors.text,
    fontSize: 12,
    fontWeight: '700',
  },
  btnAccept: {
    backgroundColor: premiumColors.brand + '20',
    borderColor: premiumColors.brand + '50',
  },
  btnAcceptText: {
    color: premiumColors.brand,
    fontSize: 12,
    fontWeight: '700',
  },

  // ── Empty ──
  emptyContainer: {
    paddingVertical: premiumSpacing[48],
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    color: premiumColors.textMuted,
    fontSize: 13,
    marginTop: premiumSpacing[12],
    textAlign: 'center',
  },
});
