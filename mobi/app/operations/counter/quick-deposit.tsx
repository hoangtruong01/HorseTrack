import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert, SafeAreaView, Switch, Platform } from 'react-native';
import { walletApi } from '../../../lib/api-client';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';

export default function QuickDepositScreen() {
  const router = useRouter();
  const [spectatorId, setSpectatorId] = useState('');
  const [amountInput, setAmountInput] = useState('');
  const [demoMode, setDemoMode] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleDeposit = async () => {
    if (!demoMode) {
      Alert.alert(
        'Quyền truy cập bị vô hiệu hóa',
        'Theo quy chế nghiệp vụ mới nhất, chức năng nạp tiền trực tiếp tại quầy bị đóng để đảm bảo tính minh bạch tài chính. Vui lòng hướng dẫn khán giả tự nạp online qua cổng thanh toán.'
      );
      return;
    }

    const amount = parseInt(amountInput, 10);
    if (!spectatorId.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập mã User ID của khán giả.');
      return;
    }
    if (isNaN(amount) || amount < 10000) {
      Alert.alert('Lỗi', 'Số tiền nạp tối thiểu là 10.000 VNĐ.');
      return;
    }

    setSubmitting(true);
    try {
      await walletApi.depositForUser(spectatorId.trim(), amount);
      Alert.alert(
        'Nạp điểm thành công',
        `Đã nạp thành công ${(amount / 1000).toLocaleString()} Pts vào tài khoản khán giả.\n\nNhận tiền mặt đối ứng: ${amount.toLocaleString()} VNĐ.`
      );
      setSpectatorId('');
      setAmountInput('');
    } catch (err: any) {
      Alert.alert('Thất bại', err.message || 'Lỗi nạp điểm cho khán giả.');
    } finally {
      setSubmitting(false);
    }
  };

  const ptsCalculated = parseInt(amountInput, 10) ? Math.floor(parseInt(amountInput, 10) / 1000) : 0;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Compliance Warning Section */}
        <View style={[styles.warningBox, demoMode && styles.warningBoxDemo]}>
          <MaterialIcons 
            name={demoMode ? "construction" : "gavel"} 
            size={24} 
            color={demoMode ? "#E1A200" : "#E10600"} 
          />
          <View style={styles.warningInfo}>
            <Text style={[styles.warningTitle, demoMode && styles.warningTitleDemo]}>
              {demoMode ? "CHẾ ĐỘ THỬ NGHIỆM ĐANG BẬT" : "QUY CHẾ NGHIỆP VỤ MỚI"}
            </Text>
            <Text style={styles.warningDesc}>
              {demoMode 
                ? "Bạn đang chạy ở chế độ giả lập nhà phát triển. Cho phép nạp điểm trực tiếp để kiểm thử luồng đặt cược."
                : "Chức năng nạp ví trực tiếp tại quầy bị đóng theo quy chế kiểm toán. Nhân viên không được phép tự ý cộng điểm cho khách hàng."
              }
            </Text>
          </View>
        </View>

        {/* Form area */}
        <View style={styles.formCard}>
          <Text style={styles.sectionTitle}>NẠP ĐIỂM NHANH TẠI QUẦY</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>USER ID KHÁN GIẢ:</Text>
            <TextInput
              style={styles.textInput}
              value={spectatorId}
              onChangeText={setSpectatorId}
              placeholder="nhập mã user id"
              placeholderTextColor="#58585B"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>SỐ TIỀN MẶT NHẬN (VNĐ):</Text>
            <TextInput
              style={styles.textInput}
              value={amountInput}
              onChangeText={setAmountInput}
              placeholder="ví dụ: 100000"
              placeholderTextColor="#58585B"
              keyboardType="number-pad"
            />
          </View>

          {ptsCalculated > 0 && (
            <View style={styles.pointsInfoBox}>
              <Text style={styles.pointsLabel}>ĐIỂM SẼ QUY ĐỔI:</Text>
              <Text style={styles.pointsValue}>{ptsCalculated} Pts</Text>
            </View>
          )}

          <TouchableOpacity 
            style={[styles.submitButton, submitting && styles.disabledButton]}
            onPress={handleDeposit}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.submitButtonText}>
                {demoMode ? "TIẾN HÀNH NẠP ĐIỂM (DEMO)" : "XÁC NHẬN GIAO DỊCH"}
              </Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Sandbox Switcher Footer */}
        <View style={styles.sandboxContainer}>
          <Text style={styles.sandboxLabel}>KÍCH HOẠT CHẾ ĐỘ THỬ NGHIỆM</Text>
          <Switch
            value={demoMode}
            onValueChange={setDemoMode}
            trackColor={{ false: '#303037', true: '#E1A200' }}
            thumbColor={Platform.OS === 'ios' ? '#FFFFFF' : demoMode ? '#FFFFFF' : '#AAAAAA'}
          />
        </View>

        {/* Back Button */}
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <MaterialIcons name="arrow-back" size={18} color="#AAAAAA" />
          <Text style={styles.backButtonText}>QUAY LẠI HÀNG ĐỢI ĐỔI THƯỞNG</Text>
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
  content: {
    padding: 16,
    flex: 1,
  },
  warningBox: {
    flexDirection: 'row',
    backgroundColor: 'rgba(225, 6, 0, 0.05)',
    borderWidth: 1,
    borderColor: '#E10600',
    borderRadius: 12,
    padding: 14,
    gap: 12,
    marginBottom: 20,
  },
  warningBoxDemo: {
    borderColor: '#E1A200',
    backgroundColor: 'rgba(225, 162, 0, 0.05)',
  },
  warningInfo: {
    flex: 1,
  },
  warningTitle: {
    color: '#E10600',
    fontSize: 12,
    fontWeight: '900',
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  warningTitleDemo: {
    color: '#E1A200',
  },
  warningDesc: {
    color: '#AAAAAA',
    fontSize: 11,
    lineHeight: 15,
  },
  formCard: {
    backgroundColor: '#15151E',
    borderWidth: 1,
    borderColor: '#303037',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1,
    marginBottom: 16,
    borderLeftWidth: 2,
    borderLeftColor: '#E10600',
    paddingLeft: 8,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    color: '#AAAAAA',
    fontSize: 9,
    fontWeight: '800',
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  textInput: {
    backgroundColor: '#1C1C25',
    borderWidth: 1,
    borderColor: '#303037',
    borderRadius: 8,
    height: 44,
    paddingHorizontal: 12,
    color: '#FFFFFF',
    fontSize: 14,
  },
  pointsInfoBox: {
    backgroundColor: 'rgba(6, 126, 106, 0.05)',
    borderWidth: 1,
    borderColor: '#067E6A',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    alignItems: 'center',
  },
  pointsLabel: {
    color: '#AAAAAA',
    fontSize: 9,
    fontWeight: '800',
    marginBottom: 2,
  },
  pointsValue: {
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
    marginTop: 8,
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
  sandboxContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#15151E',
    borderWidth: 1,
    borderColor: '#303037',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 20,
  },
  sandboxLabel: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 44,
    borderWidth: 1,
    borderColor: '#303037',
    borderRadius: 22,
    backgroundColor: '#15151E',
    marginTop: 'auto',
  },
  backButtonText: {
    color: '#AAAAAA',
    fontSize: 11,
    fontWeight: '800',
  },
});
