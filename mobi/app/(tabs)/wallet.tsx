import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, FlatList, ActivityIndicator, Platform } from 'react-native';
import { walletApi, type WalletTxItem } from '../../lib/api-client';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function WalletScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const isDark = colorScheme === 'dark';

  const [balance, setBalance] = useState({ points: 0, cash: 0 });
  const [ledger, setLedger] = useState<WalletTxItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const themeContainer = { backgroundColor: isDark ? '#1C1C25' : '#F7F4F1' };
  const themeCard = { backgroundColor: isDark ? '#15151E' : '#FFFFFF', borderColor: isDark ? '#303037' : '#EAEAEA' };
  const themeText = { color: isDark ? '#FFFFFF' : '#1C1C25' };
  const themeSubText = { color: isDark ? '#AAAAAA' : '#58585B' };

  const loadWalletData = async () => {
    try {
      // 1. Load wallet history (contains balance and points)
      const walletRes = await walletApi.myHistory({ page: 1, limit: 100 });
      if (walletRes) {
        setBalance({
          points: walletRes.points ?? 0,
          cash: walletRes.balance ?? 0,
        });
        setLedger(walletRes.data || []);
      }
    } catch (err) {
      console.error('Lỗi tải dữ liệu ví:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadWalletData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadWalletData();
  };

  const renderLedgerItem = ({ item }: { item: WalletTxItem }) => {
    const dateStr = item.createdAt ? new Date(item.createdAt).toLocaleDateString('vi-VN') : '—';
    const isPositive = item.points > 0 || item.amount > 0;
    const valueText = item.points !== 0 ? `${isPositive ? '+' : ''}${item.points} Pts` : `${isPositive ? '+' : ''}${item.amount.toLocaleString()} VNĐ`;

    return (
      <View style={[styles.listItemCard, themeCard]}>
        <View style={styles.cardHeader}>
          <Text style={[styles.cardMainTitle, themeText]} numberOfLines={1}>{item.description || 'Giao dịch ví'}</Text>
          <Text style={[styles.ledgerValue, { color: isPositive ? '#067E6A' : '#E10600' }]}>{valueText}</Text>
        </View>

        <View style={styles.cardBody}>
          <Text style={[styles.cardSubText, themeSubText]}>Loại giao dịch: <Text style={[styles.whiteBoldText, themeText]}>{item.type.toUpperCase()}</Text></Text>
          <Text style={[styles.cardSubText, themeSubText]}>Trạng thái: <Text style={[styles.whiteBoldText, themeText]}>{item.status.toUpperCase()}</Text></Text>
          <Text style={styles.dateText}>{dateStr}</Text>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, themeContainer]}>
        <ActivityIndicator size="large" color="#E10600" />
        <Text style={[styles.loadingText, themeSubText]}>Đang tải lịch sử giao dịch...</Text>
      </View>
    );
  }

  const withdrawals = ledger.filter(
    item => item.type?.toLowerCase() === 'reward_cashout' ||
            item.description?.toLowerCase().includes('quy đổi') ||
            item.description?.toLowerCase().includes('rút') ||
            item.description?.toLowerCase().includes('cashout')
  );

  return (
    <SafeAreaView style={[styles.container, themeContainer]}>
      {/* Wallet Summary Card */}
      <View style={[styles.walletHeaderCard, themeCard]}>
        <View style={styles.walletBox}>
          <MaterialIcons name="stars" size={24} color="#E10600" />
          <Text style={styles.walletLabel}>ĐIỂM HIỆN TẠI</Text>
          <Text style={[styles.walletValue, themeText]}>{balance.points} <Text style={[styles.pointsUnit, themeSubText]}>Pts</Text></Text>
        </View>
      </View>

      <FlatList
        data={withdrawals}
        renderItem={renderLedgerItem}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContent}
        onRefresh={onRefresh}
        refreshing={refreshing}
        ListHeaderComponent={
          <Text style={[themeText, { fontSize: 13, fontWeight: '900', letterSpacing: 0.5, marginBottom: 12 }]}>LỊCH SỬ RÚT</Text>
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialIcons name="history" size={40} color={isDark ? '#AAAAAA' : '#58585B'} />
            <Text style={[styles.emptyText, themeSubText]}>Bạn chưa thực hiện yêu cầu rút điểm nào.</Text>
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
  walletHeaderCard: {
    flexDirection: 'row',
    backgroundColor: '#15151E',
    borderBottomWidth: 1,
    borderBottomColor: '#303037',
    paddingVertical: 20,
    alignItems: 'center',
  },
  walletBox: {
    flex: 1,
    alignItems: 'center',
  },
  walletLabel: {
    color: '#58585B',
    fontSize: 10,
    fontWeight: '800',
    marginTop: 6,
    letterSpacing: 0.5,
  },
  walletValue: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '900',
    marginTop: 4,
    fontFamily: Platform.OS === 'ios' ? 'Courier-Bold' : 'monospace',
  },
  pointsUnit: {
    fontSize: 12,
    fontWeight: '400',
    color: '#AAAAAA',
  },
  verticalDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#303037',
  },
  subTabBar: {
    flexDirection: 'row',
    backgroundColor: '#15151E',
    borderBottomWidth: 1,
    borderBottomColor: '#303037',
    height: 40,
  },
  subTabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  subTabButtonActive: {
    borderBottomColor: '#E10600',
  },
  subTabText: {
    color: '#AAAAAA',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  subTabTextActive: {
    color: '#FFFFFF',
  },
  listContent: {
    padding: 16,
  },
  listItemCard: {
    backgroundColor: '#15151E',
    borderWidth: 1,
    borderColor: '#303037',
    borderRadius: 8,
    padding: 14,
    marginBottom: 12,
    position: 'relative',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardMainTitle: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
    flex: 1,
    marginRight: 10,
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
  },
  cardSubText: {
    color: '#AAAAAA',
    fontSize: 11,
  },
  whiteBoldText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  dateText: {
    color: '#58585B',
    fontSize: 10,
    marginTop: 2,
  },
  rewardSection: {
    position: 'absolute',
    bottom: 14,
    right: 14,
  },
  rewardValue: {
    fontSize: 14,
    fontWeight: '900',
    fontFamily: Platform.OS === 'ios' ? 'Courier-Bold' : 'monospace',
  },
  ledgerValue: {
    fontSize: 13,
    fontWeight: '900',
    fontFamily: Platform.OS === 'ios' ? 'Courier-Bold' : 'monospace',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    color: '#AAAAAA',
    fontSize: 13,
    marginTop: 10,
    textAlign: 'center',
  },
});
