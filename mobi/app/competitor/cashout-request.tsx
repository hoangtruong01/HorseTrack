import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, ActivityIndicator, FlatList, Alert, SafeAreaView, Platform } from 'react-native';
import { walletApi, type CashoutItem } from '../../lib/api-client';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

export default function CashoutRequestScreen() {
  const [walletBalance, setWalletBalance] = useState({ points: 0, cash: 0 });
  const [pointsInput, setPointsInput] = useState('');
  const [cashouts, setCashouts] = useState<CashoutItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    try {
      // 1. Fetch wallet balance
      const walletRes = await walletApi.myHistory();
      if (walletRes) {
        setWalletBalance({
          points: walletRes.points ?? 0,
          cash: walletRes.balance ?? 0,
        });
      }

      // 2. Fetch past cashout requests
      const cashoutsRes = await walletApi.myCashouts({ page: 1, limit: 100 });
      if (cashoutsRes && cashoutsRes.data) {
        setCashouts(cashoutsRes.data);
      }
    } catch (err) {
      console.error('Lỗi tải thông tin rút điểm:', err);
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

  const handleRequestCashout = async () => {
    const points = parseInt(pointsInput, 10);
    if (isNaN(points) || points <= 0) {
      Alert.alert('Lỗi', 'Vui lòng nhập số điểm hợp lệ.');
      return;
    }

    if (points > walletBalance.points) {
      Alert.alert('Lỗi', 'Số dư điểm không đủ để rút.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await walletApi.requestCashout({ pointsToRedeem: points });
      
      Alert.alert(
        'Đã tạo yêu cầu rút điểm',
        `Mã quy đổi của bạn là:\n\n${res.redemptionCode}\n\nHãy xuất trình mã này cho Nhân viên quầy tại trường đua để nhận tiền mặt.`,
        [{ text: 'Đồng ý', onPress: () => loadData() }]
      );
      setPointsInput('');
    } catch (err: any) {
      Alert.alert('Thất bại', err.message || 'Lỗi tạo yêu cầu rút điểm.');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PENDING': return 'ĐANG CHỜ NHẬN';
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

  const renderItem = ({ item }: { item: CashoutItem }) => {
    const dateStr = item.createdAt ? new Date(item.createdAt).toLocaleDateString('vi-VN') : '—';
    const cashEquivalent = item.pointsRedeemed * 1000;

    return (
      <View style={styles.historyCard}>
        <View style={styles.historyHeader}>
          <View style={styles.codeContainer}>
            <Text style={styles.codeLabel}>MÃ QUY ĐỔI</Text>
            <Text style={styles.codeText}>{item.redemptionCode}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
            <Text style={styles.statusBadgeText}>{getStatusText(item.status)}</Text>
          </View>
        </View>

        <View style={styles.historyBody}>
          <Text style={styles.historySubText}>Điểm quy đổi: <Text style={styles.whiteBold}>{item.pointsRedeemed} Pts</Text></Text>
          <Text style={styles.historySubText}>Tiền mặt thực nhận: <Text style={styles.greenBold}>{cashEquivalent.toLocaleString()} đ</Text></Text>
          <Text style={styles.dateText}>{dateStr}</Text>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#E10600" />
        <Text style={styles.loadingText}>Đang tải thông tin rút điểm...</Text>
      </View>
    );
  }

  // Cashout conversion estimation
  const parsedPoints = parseInt(pointsInput, 10);
  const conversionEstimate = !isNaN(parsedPoints) && parsedPoints > 0 ? parsedPoints * 1000 : 0;

  return (
    <SafeAreaView style={styles.container}>
      {/* Balance Summary Header */}
      <View style={styles.balanceHeaderCard}>
        <View style={styles.balanceInfo}>
          <Text style={styles.balanceLabel}>ĐIỂM HIỆN TẠI</Text>
          <Text style={styles.balanceValue}>{walletBalance.points} <Text style={styles.ptsUnit}>Pts</Text></Text>
        </View>
        <MaterialIcons name="account-balance-wallet" size={32} color="#E10600" />
      </View>

      <FlatList
        data={cashouts}
        renderItem={renderItem}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContent}
        onRefresh={onRefresh}
        refreshing={refreshing}
        ListHeaderComponent={
          <View style={styles.formContainer}>
            <Text style={styles.sectionTitle}>TẠO YÊU CẦU RÚT ĐIỂM MỚI</Text>
            <Text style={styles.formInstructions}>Quy đổi điểm thưởng của bạn thành tiền mặt tại quầy (Tỷ lệ quy đổi: 1 Pts = 1,000 đ).</Text>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>SỐ ĐIỂM MUỐN RÚT:</Text>
              <TextInput
                style={styles.textInput}
                value={pointsInput}
                onChangeText={setPointsInput}
                keyboardType="number-pad"
                placeholder="nhập số điểm"
                placeholderTextColor="#58585B"
              />
            </View>

            {conversionEstimate > 0 && (
              <View style={styles.estimateBox}>
                <Text style={styles.estimateLabel}>TIỀN MẶT ƯỚC TÍNH NHẬN:</Text>
                <Text style={styles.estimateValue}>{conversionEstimate.toLocaleString()} VNĐ</Text>
              </View>
            )}

            <TouchableOpacity 
              style={[styles.submitButton, submitting && styles.disabledButton]}
              onPress={handleRequestCashout}
              disabled={submitting}
            >
              {submitting ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={styles.submitButtonText}>TẠO YÊU CẦU QUY ĐỔI</Text>
              )}
            </TouchableOpacity>

            <Text style={styles.historySectionTitle}>LỊCH SỬ RÚT ĐIỂM</Text>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialIcons name="history" size={40} color="#58585B" />
            <Text style={styles.emptyText}>Bạn chưa thực hiện yêu cầu rút điểm nào.</Text>
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
    paddingTop: 8,
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
  balanceHeaderCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#15151E',
    borderBottomWidth: 1,
    borderBottomColor: '#303037',
    padding: 20,
  },
  balanceInfo: {
    gap: 4,
  },
  balanceLabel: {
    color: '#58585B',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  balanceValue: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '900',
    fontFamily: Platform.OS === 'ios' ? 'Courier-Bold' : 'monospace',
  },
  ptsUnit: {
    fontSize: 14,
    fontWeight: '500',
    color: '#AAAAAA',
  },
  formContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1,
    marginTop: 16,
    marginBottom: 8,
    borderLeftWidth: 2,
    borderLeftColor: '#E10600',
    paddingLeft: 8,
  },
  formInstructions: {
    color: '#AAAAAA',
    fontSize: 12,
    lineHeight: 16,
    marginBottom: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#15151E',
    borderWidth: 1,
    borderColor: '#303037',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 48,
    marginBottom: 16,
  },
  inputLabel: {
    color: '#AAAAAA',
    fontSize: 11,
    fontWeight: '800',
  },
  textInput: {
    flex: 1,
    textAlign: 'right',
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
    fontFamily: Platform.OS === 'ios' ? 'Courier-Bold' : 'monospace',
  },
  estimateBox: {
    backgroundColor: 'rgba(6, 126, 106, 0.05)',
    borderWidth: 1,
    borderColor: '#067E6A',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    alignItems: 'center',
  },
  estimateLabel: {
    color: '#AAAAAA',
    fontSize: 9,
    fontWeight: '800',
    marginBottom: 4,
  },
  estimateValue: {
    color: '#067E6A',
    fontSize: 16,
    fontWeight: '900',
  },
  submitButton: {
    backgroundColor: '#E10600',
    borderRadius: 24,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  disabledButton: {
    backgroundColor: '#58585B',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  historySectionTitle: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1,
    marginBottom: 12,
    borderLeftWidth: 2,
    borderLeftColor: '#E10600',
    paddingLeft: 8,
  },
  historyCard: {
    backgroundColor: '#15151E',
    borderWidth: 1,
    borderColor: '#303037',
    borderRadius: 8,
    padding: 14,
    marginBottom: 12,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#1C1C25',
    paddingBottom: 8,
    marginBottom: 8,
  },
  codeContainer: {
    gap: 2,
  },
  codeLabel: {
    color: '#58585B',
    fontSize: 8,
    fontWeight: '800',
  },
  codeText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
    fontFamily: Platform.OS === 'ios' ? 'Courier-Bold' : 'monospace',
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
  historyBody: {
    gap: 4,
  },
  historySubText: {
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
    fontSize: 10,
    marginTop: 2,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    color: '#AAAAAA',
    fontSize: 13,
    marginTop: 10,
  },
});
