import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, ActivityIndicator, Alert, RefreshControl } from 'react-native';
import { jockeyInvitationsApi } from '../../lib/api-client';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { AppScreen } from '@/components/ui/premium';
import { SleekHeader } from '@/components/ui/sleek-header';
import { premiumSpacing, premiumRadius, usePremiumColors } from '@/components/ui/premium-tokens';
import { useThemeColors } from '@/components/ui/shared';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function InvitationInboxScreen() {
  const [invitations, setInvitations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = useThemeColors();
  const premiumColors = usePremiumColors();

  // Tạo styles với màu động
  const styles = React.useMemo(() => getStyles(isDark, theme, premiumColors), [isDark, theme, premiumColors]);

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
      case 'ACCEPTED': return '#10B981';
      case 'REJECTED': return '#EF4444';
      default: return '#F59E0B';
    }
  };

  const renderItem = ({ item }: { item: any }) => {
    const raceName = item.raceId?.name || 'Trận đấu';
    const tourName = item.tournamentId?.name || 'Giải đua';
    const horseName = item.horseId?.name || 'Chiến mã';
    const ownerName = item.ownerId?.fullName || 'Chủ trại';
    const isPending = item.status === 'PENDING';
    const statusColor = getStatusColor(item.status);

    // Tính toán thời gian tương đối
    const createdAt = item.createdAt ? new Date(item.createdAt) : new Date();
    const diffMs = new Date().getTime() - createdAt.getTime();
    const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
    const timeText = diffHrs > 0 ? `${diffHrs} giờ` : 'Vừa xong';

    const tourShort = tourName.split(' ')[0].toUpperCase();

    return (
      <View style={styles.card}>
        {/* Ticket Edge with Perforations */}
        <View style={styles.ticketEdge}>
          {[...Array(6)].map((_, i) => (
            <View key={i} style={styles.ticketHole} />
          ))}
        </View>

        <View style={styles.cardContent}>
          {/* Top Header Row */}
          <View style={styles.topRow}>
            <View style={styles.topLeft}>
              <View style={styles.tourBadge}>
                <Text style={styles.tourBadgeText}>{tourShort}</Text>
              </View>
              <View style={styles.timeInfo}>
                <MaterialIcons name="schedule" size={14} color="#9CA3AF" />
                <Text style={styles.timeText}>{timeText}</Text>
              </View>
            </View>

            {isPending ? (
              <View style={styles.actionButtons}>
                <TouchableOpacity style={styles.btnReject} onPress={() => handleRespond(item._id, 'REJECTED')} activeOpacity={0.7}>
                  <MaterialIcons name="close" size={16} color="#EF4444" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.btnAccept} onPress={() => handleRespond(item._id, 'ACCEPTED')} activeOpacity={0.7}>
                  <MaterialIcons name="check" size={14} color="#10B981" />
                  <Text style={styles.btnAcceptText}>CHẤP NHẬN</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={[styles.statusBadge, { backgroundColor: statusColor + '15', borderColor: statusColor + '40' }]}>
                <MaterialIcons name={item.status === 'ACCEPTED' ? 'check-circle' : 'cancel'} size={12} color={statusColor} style={{ marginRight: 4 }} />
                <Text style={[styles.statusBadgeText, { color: statusColor }]}>{getStatusText(item.status)}</Text>
              </View>
            )}
          </View>

          {/* Title */}
          <Text style={styles.raceName} numberOfLines={1}>{raceName.toUpperCase()}</Text>

          {/* Divider */}
          <View style={styles.divider} />

          {/* Details Row */}
          <View style={styles.detailsRow}>
            {/* Column 1: Horse */}
            <View style={styles.detailCol}>
              <View style={[styles.detailIconWrap, { backgroundColor: 'rgba(239, 68, 68, 0.1)' }]}>
                <MaterialIcons name="emoji-events" size={18} color="#EF4444" />
              </View>
              <View style={styles.detailTextContainer}>
                <Text style={styles.detailLabel}>CHIẾN MÃ</Text>
                <Text style={styles.detailValue} numberOfLines={1}>{horseName}</Text>
              </View>
            </View>

            {/* Column 2: Owner */}
            <View style={styles.detailCol}>
              <View style={[styles.detailIconWrap, { backgroundColor: 'rgba(156, 163, 175, 0.1)' }]}>
                <MaterialIcons name="flag" size={18} color="#9CA3AF" />
              </View>
              <View style={styles.detailTextContainer}>
                <Text style={styles.detailLabel}>CHỦ NGỰA</Text>
                <Text style={styles.detailValue} numberOfLines={1}>{ownerName}</Text>
              </View>
            </View>
          </View>
        </View>
      </View>
    );
  };

  if (loading && !refreshing) {
    return (
      <AppScreen safeArea={false} style={styles.container}>
        <SleekHeader title="HÒM THƯ" showWallet={true} />
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={premiumColors.brand} />
          <Text style={styles.loadingText}>Đang tải danh sách lời mời...</Text>
        </View>
      </AppScreen>
    );
  }

  return (
    <AppScreen safeArea={false} style={styles.container}>
      <SleekHeader title="HÒM THƯ" showWallet={true} />

      <FlatList
        data={invitations}
        renderItem={renderItem}
        keyExtractor={(item) => item._id || item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={premiumColors.brand} colors={[premiumColors.brand]} />}
        ListEmptyComponent={
          error ? (
            <View style={styles.emptyContainer}>
              <MaterialIcons name="error-outline" size={48} color={premiumColors.danger} />
              <Text style={[styles.emptyText, { color: premiumColors.danger }]}>{error}</Text>
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

const getStyles = (isDark: boolean, theme: any, premiumColors: any) => {
  const bgColor = isDark ? '#09090B' : '#F4F4F5'; // Map to screen bg
  const cardBgColor = isDark ? '#1C1D22' : '#FFFFFF';
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: bgColor,
    },
    centerContainer: {
      flex: 1,
      backgroundColor: bgColor,
      alignItems: 'center',
      justifyContent: 'center',
    },
    loadingText: {
      color: theme.textSecondary,
      fontSize: 14,
      marginTop: premiumSpacing[12],
    },
    listContent: {
      paddingHorizontal: premiumSpacing[16],
      paddingBottom: premiumSpacing[120], // Space for dock tab bar
      paddingTop: premiumSpacing[16],
    },
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

    // ── Ticket Card ──
    card: {
      backgroundColor: cardBgColor,
      borderRadius: 16,
      marginBottom: 16,
      flexDirection: 'row',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: isDark ? 0.3 : 0.05,
      shadowRadius: 12,
      elevation: 4,
      borderWidth: 1,
      borderColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
      overflow: 'hidden',
    },
    ticketEdge: {
      width: 12,
      backgroundColor: '#EF4444', // Highlight red color
      justifyContent: 'space-evenly',
      alignItems: 'flex-start',
      borderRightWidth: 1,
      borderRightColor: 'rgba(0,0,0,0.2)',
      paddingVertical: 12, // Margin top/bottom for holes
    },
    ticketHole: {
      width: 6,
      height: 10,
      backgroundColor: bgColor, // Maps to the screen background to simulate a hole
      borderTopRightRadius: 6,
      borderBottomRightRadius: 6,
      marginLeft: -1, // Ensure it cuts perfectly into the edge
    },
    cardContent: {
      flex: 1,
      padding: 16,
    },

    // ── Header Row ──
    topRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
    },
    topLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    tourBadge: {
      backgroundColor: 'rgba(239, 68, 68, 0.15)',
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 12,
    },
    tourBadgeText: {
      color: '#EF4444',
      fontSize: 11,
      fontWeight: '800',
      letterSpacing: 0.5,
    },
    timeInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    timeText: {
      color: '#9CA3AF',
      fontSize: 12,
      fontWeight: '500',
    },

    // ── Actions ──
    actionButtons: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    btnAccept: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: 'rgba(16, 185, 129, 0.1)',
      borderWidth: 1,
      borderColor: '#10B981',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 20,
      gap: 4,
    },
    btnAcceptText: {
      color: '#10B981',
      fontSize: 11,
      fontWeight: '700',
      letterSpacing: 0.5,
    },
    btnReject: {
      backgroundColor: 'rgba(255,255,255,0.05)',
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.1)',
      padding: 6,
      borderRadius: 20,
      justifyContent: 'center',
      alignItems: 'center',
    },
    statusBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 12,
    },
    statusBadgeText: {
      fontSize: 10,
      fontWeight: '700',
      letterSpacing: 0.5,
    },

    // ── Title ──
    raceName: {
      color: theme.textPrimary,
      fontSize: 26,
      fontWeight: '800',
      letterSpacing: -0.5,
      marginBottom: 16,
    },

    // ── Divider ──
    divider: {
      height: 1,
      borderTopWidth: 1,
      borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
      borderStyle: 'dashed',
      marginBottom: 16,
    },

    // ── Details ──
    detailsRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 16,
      gap: 8,
    },
    detailCol: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      flex: 1,
    },
    detailIconWrap: {
      width: 36,
      height: 36,
      borderRadius: 18,
      justifyContent: 'center',
      alignItems: 'center',
    },
    detailTextContainer: {
      flex: 1,
    },
    detailLabel: {
      color: '#9CA3AF',
      fontSize: 10,
      fontWeight: '600',
      letterSpacing: 0.5,
      marginBottom: 2,
    },
    detailValue: {
      color: theme.textPrimary,
      fontSize: 13,
      fontWeight: '700',
    }
  });
};
