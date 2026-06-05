import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, FlatList, ActivityIndicator, Alert, SafeAreaView, Platform } from 'react-native';
import { walletApi, type CashoutItem } from '../../../lib/api-client';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';

export default function CounterScanScreen() {
  const router = useRouter();
  const [codeInput, setCodeInput] = useState('');
  const [cashouts, setCashouts] = useState<CashoutItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCashout, setSelectedCashout] = useState<CashoutItem | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const loadData = async () => {
    try {
      const res = await walletApi.allCashouts({ page: 1, limit: 100 });
      if (res && res.data) {
        setCashouts(res.data);
      }
    } catch (err) {
      console.error('Lỗi tải danh sách yêu cầu đổi quà:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleSearchCode = () => {
    const code = codeInput.trim().toUpperCase();
    if (!code) {
      Alert.alert('Lỗi', 'Vui lòng nhập mã quy đổi.');
      return;
    }

    const match = cashouts.find(c => c.redemptionCode.toUpperCase() === code);
    if (match) {
      setSelectedCashout(match);
    } else {
      Alert.alert('Không tìm thấy', `Không tìm thấy mã quy đổi ${code} trong hàng đợi.`);
    }
  };

  const handleProcess = async (id: string, status: 'COMPLETED' | 'REJECTED') => {
    const actionLabel = status === 'COMPLETED' ? 'Phê duyệt & Chi trả' : 'Từ chối';
    Alert.alert('Xác nhận', `Bạn có chắc muốn ${actionLabel} yêu cầu này?`, [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Xác nhận',
        onPress: async () => {
          setProcessingId(id);
          try {
            await walletApi.processCashout(id, status);
            Alert.alert('Thành công', `Yêu cầu đổi thưởng đã được cập nhật thành ${status === 'COMPLETED' ? 'ĐÃ CHI TRẢ' : 'TỪ CHỐI'}.`);
            setSelectedCashout(null);
            setCodeInput('');
            loadData();
          } catch (err: any) {
            Alert.alert('Lỗi', err.message || 'Lỗi xử lý yêu cầu.');
          } finally {
            setProcessingId(null);
          }
        },
      },
    ]);
  };

  const pendingList = cashouts.filter(c => c.status === 'PENDING');

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PENDING': return 'ĐANG CHỜ';
      case 'COMPLETED': return 'ĐÃ CHI TRẢ';
      case 'REJECTED': return 'ĐÃ TỪ CHỐI';
      default: return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': return '#067E6A';
      case 'REJECTED': return '#E10600';
      default: return '#E1A200';
    }
  };

  const renderPendingItem = ({ item }: { item: CashoutItem }) => {
    const cashEquivalent = item.pointsRedeemed * 1000;
    const dateStr = item.createdAt ? new Date(item.createdAt).toLocaleDateString('vi-VN') : '—';
    const requesterName = typeof item.userId === 'object' ? item.userId?.fullName : 'Thành viên';

    return (
      <TouchableOpacity 
        style={styles.pendingCard}
        onPress={() => {
          setSelectedCashout(item);
          setCodeInput(item.redemptionCode);
        }}
      >
        <View style={styles.pendingHeader}>
          <Text style={styles.codeText}>{item.redemptionCode}</Text>
          <Text style={styles.pointsText}>{item.pointsRedeemed} Pts</Text>
        </View>
        <View style={styles.pendingBody}>
          <Text style={styles.pendingText}>Thành viên: <Text style={styles.whiteBold}>{requesterName}</Text></Text>
          <Text style={styles.pendingText}>Quy đổi: <Text style={styles.greenBold}>{cashEquivalent.toLocaleString()} đ</Text></Text>
          <Text style={styles.dateText}>{dateStr}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#E10600" />
        <Text style={styles.loadingText}>Đang tải danh sách đổi thưởng...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.searchSection}>
        <Text style={styles.searchLabel}>TRA CỨU MÃ ĐỐI SOÁT VẬT LÝ</Text>
        <View style={styles.searchRow}>
          <TextInput
            style={styles.searchInput}
            value={codeInput}
            onChangeText={setCodeInput}
            placeholder="Ví dụ: RWD-123456"
            placeholderTextColor="#58585B"
            autoCapitalize="characters"
          />
          <TouchableOpacity style={styles.searchButton} onPress={handleSearchCode}>
            <MaterialIcons name="search" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Selected Cashout Verification Card */}
      {selectedCashout && (
        <View style={styles.verificationCard}>
          <View style={styles.verifyHeader}>
            <Text style={styles.verifyTitle}>KẾT QUẢ ĐỐI SOÁT CHI TIẾT</Text>
            <TouchableOpacity onPress={() => setSelectedCashout(null)}>
              <MaterialIcons name="close" size={20} color="#AAAAAA" />
            </TouchableOpacity>
          </View>

          <View style={styles.verifyBody}>
            <View style={styles.verifyRow}>
              <Text style={styles.verifyLabel}>MÃ QUY ĐỔI:</Text>
              <Text style={styles.verifyValueCode}>{selectedCashout.redemptionCode}</Text>
            </View>

            <View style={styles.verifyRow}>
              <Text style={styles.verifyLabel}>THÀNH VIÊN:</Text>
              <Text style={styles.verifyValue}>
                {typeof selectedCashout.userId === 'object' ? selectedCashout.userId?.fullName : 'Chủ tài khoản'}
              </Text>
            </View>

            <View style={styles.verifyRow}>
              <Text style={styles.verifyLabel}>ĐIỂM ĐỔI QUÀ:</Text>
              <Text style={styles.verifyValue}>{selectedCashout.pointsRedeemed} Pts</Text>
            </View>

            <View style={styles.verifyRow}>
              <Text style={styles.verifyLabel}>TIỀN MẶT CẦN CHI TRẢ:</Text>
              <Text style={styles.verifyValueCash}>{(selectedCashout.pointsRedeemed * 1000).toLocaleString()} VNĐ</Text>
            </View>

            <View style={styles.verifyRow}>
              <Text style={styles.verifyLabel}>TRẠNG THÁI HIỆN TẠI:</Text>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(selectedCashout.status) }]}>
                <Text style={styles.statusBadgeText}>{getStatusText(selectedCashout.status)}</Text>
              </View>
            </View>
          </View>

          {selectedCashout.status === 'PENDING' && (
            <View style={styles.verifyActions}>
              <TouchableOpacity 
                style={[styles.actionBtn, styles.btnReject, processingId === selectedCashout._id && styles.btnDisabled]}
                onPress={() => handleProcess(selectedCashout._id, 'REJECTED')}
                disabled={processingId === selectedCashout._id}
              >
                <Text style={styles.actionBtnText}>TỪ CHỐI</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.actionBtn, styles.btnApprove, processingId === selectedCashout._id && styles.btnDisabled]}
                onPress={() => handleProcess(selectedCashout._id, 'COMPLETED')}
                disabled={processingId === selectedCashout._id}
              >
                <Text style={styles.actionBtnText}>DUYỆT & CHI TIỀN</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}

      {/* Pending Queue */}
      <View style={styles.queueContainer}>
        <Text style={styles.queueTitle}>DANH SÁCH CHỜ PHÊ DUYỆT ({pendingList.length})</Text>
        
        <FlatList
          data={pendingList}
          renderItem={renderPendingItem}
          keyExtractor={(item) => item._id}
          onRefresh={onRefresh}
          refreshing={refreshing}
          contentContainerStyle={styles.queueContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <MaterialIcons name="done-all" size={40} color="#067E6A" />
              <Text style={styles.emptyText}>Hàng đợi đổi thưởng trống. Không có yêu cầu nào chờ duyệt.</Text>
            </View>
          }
        />
      </View>

      {/* Switch to deposit */}
      <View style={styles.bottomNavContainer}>
        <TouchableOpacity 
          style={styles.depositButton}
          onPress={() => router.push('/operations/counter/quick-deposit')}
        >
          <MaterialIcons name="monetization-on" size={18} color="#FFFFFF" />
          <Text style={styles.depositButtonText}>NẠP ĐIỂM TIỀN MẶT CHO KHÁN GIẢ</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.backHomeBtn}
          onPress={() => router.replace('/(tabs)')}
        >
          <MaterialIcons name="arrow-back" size={16} color="#AAAAAA" />
          <Text style={styles.backHomeText}>QUAY LẠI CỔNG KHÁN GIẢ</Text>
        </TouchableOpacity>
      </View>
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
  searchSection: {
    backgroundColor: '#15151E',
    borderBottomWidth: 1,
    borderBottomColor: '#303037',
    padding: 16,
  },
  searchLabel: {
    color: '#58585B',
    fontSize: 9,
    fontWeight: '800',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  searchRow: {
    flexDirection: 'row',
    gap: 8,
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#1C1C25',
    borderWidth: 1,
    borderColor: '#303037',
    borderRadius: 8,
    height: 44,
    paddingHorizontal: 12,
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    fontFamily: Platform.OS === 'ios' ? 'Courier-Bold' : 'monospace',
  },
  searchButton: {
    backgroundColor: '#E10600',
    width: 44,
    height: 44,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  verificationCard: {
    backgroundColor: '#15151E',
    borderWidth: 1,
    borderColor: '#303037',
    borderRadius: 12,
    padding: 16,
    margin: 16,
  },
  verifyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#1C1C25',
    paddingBottom: 8,
    marginBottom: 12,
  },
  verifyTitle: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  verifyBody: {
    gap: 8,
    marginBottom: 16,
  },
  verifyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  verifyLabel: {
    color: '#AAAAAA',
    fontSize: 11,
  },
  verifyValueCode: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
    fontFamily: Platform.OS === 'ios' ? 'Courier-Bold' : 'monospace',
  },
  verifyValue: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  verifyValueCash: {
    color: '#067E6A',
    fontSize: 15,
    fontWeight: '900',
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
  verifyActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionBtn: {
    flex: 1,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnReject: {
    backgroundColor: '#303037',
    borderWidth: 1,
    borderColor: '#E10600',
  },
  btnApprove: {
    backgroundColor: '#067E6A',
  },
  btnDisabled: {
    backgroundColor: '#58585B',
  },
  actionBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  queueContainer: {
    flex: 1,
  },
  queueTitle: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1,
    paddingHorizontal: 16,
    marginTop: 12,
    marginBottom: 8,
  },
  queueContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  pendingCard: {
    backgroundColor: '#15151E',
    borderWidth: 1,
    borderColor: '#303037',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
  },
  pendingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  codeText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
    fontFamily: Platform.OS === 'ios' ? 'Courier-Bold' : 'monospace',
  },
  pointsText: {
    color: '#E10600',
    fontSize: 13,
    fontWeight: '900',
  },
  pendingBody: {
    gap: 2,
  },
  pendingText: {
    color: '#AAAAAA',
    fontSize: 11,
  },
  whiteBold: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  greenBold: {
    color: '#067E6A',
    fontWeight: '800',
  },
  dateText: {
    color: '#58585B',
    fontSize: 9,
    marginTop: 2,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    color: '#AAAAAA',
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 16,
  },
  bottomNavContainer: {
    backgroundColor: '#15151E',
    borderTopWidth: 1,
    borderTopColor: '#303037',
  },
  depositButton: {
    flexDirection: 'row',
    backgroundColor: '#E10600',
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  depositButtonText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  backHomeBtn: {
    flexDirection: 'row',
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  backHomeText: {
    color: '#AAAAAA',
    fontSize: 11,
    fontWeight: '700',
  },
});
