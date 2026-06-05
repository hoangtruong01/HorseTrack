import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, SafeAreaView, Platform, ActivityIndicator } from 'react-native';
import { useAuth } from '../../providers/auth-provider';
import { walletApi } from '../../lib/api-client';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';

export default function CompetitorDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [balance, setBalance] = useState({ points: 0, cash: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBalance = async () => {
      try {
        const res = await walletApi.myHistory();
        if (res) {
          setBalance({
            points: res.points ?? 0,
            cash: res.balance ?? 0,
          });
        }
      } catch (err) {
        console.error('Lỗi lấy thông tin ví đối tác:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchBalance();
  }, []);

  if (!user) return null;

  const isOwner = user.roles.includes('HORSE_OWNER') || user.roles.includes('ADMIN');
  const isJockey = user.roles.includes('JOCKEY') || user.roles.includes('ADMIN');

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Welcome Section */}
        <View style={styles.welcomeCard}>
          <Text style={styles.welcomeTitle}>CHÀO BẠN, {user.fullName.toUpperCase()}</Text>
          <Text style={styles.welcomeSub}>Chào mừng bạn quay lại khu vực quản lý đối tác chuyên nghiệp.</Text>
          
          {loading ? (
            <ActivityIndicator color="#E10600" style={{ marginTop: 12 }} />
          ) : (
            <View style={styles.balanceContainer}>
              <View style={styles.balanceBox}>
                <Text style={styles.balanceLabel}>SỐ DƯ ĐIỂM THƯỞNG</Text>
                <Text style={styles.balanceValue}>{balance.points} Pts</Text>
              </View>
              <View style={styles.balanceDivider} />
              <View style={styles.balanceBox}>
                <Text style={styles.balanceLabel}>TIỀN ĐÃ KHẢ DỤNG</Text>
                <Text style={styles.balanceValue}>{balance.cash.toLocaleString()} đ</Text>
              </View>
            </View>
          )}
        </View>

        {/* Dashboard Grid */}
        <View style={styles.gridContainer}>
          {isJockey && (
            <TouchableOpacity 
              style={styles.gridCard}
              onPress={() => router.push('/competitor/invitation-inbox')}
            >
              <MaterialIcons name="mail-outline" size={32} color="#E10600" />
              <Text style={styles.gridCardTitle}>LỜI MỜI JOCKEY</Text>
              <Text style={styles.gridCardDesc}>Xem danh sách lời mời nài ngựa từ các chủ trại và phản hồi.</Text>
            </TouchableOpacity>
          )}

          {isOwner && (
            <TouchableOpacity 
              style={styles.gridCard}
              onPress={() => router.push('/competitor/my-horses')}
            >
              <MaterialIcons name="pets" size={32} color="#E10600" />
              <Text style={styles.gridCardTitle}>QUẢN LÝ CHIẾN MÃ</Text>
              <Text style={styles.gridCardDesc}>Danh sách ngựa đua đăng ký thuộc quyền sở hữu của bạn.</Text>
            </TouchableOpacity>
          )}

          {isOwner && (
            <TouchableOpacity 
              style={styles.gridCard}
              onPress={() => router.push('/competitor/cashout-request')}
            >
              <MaterialIcons name="monetization-on" size={32} color="#E10600" />
              <Text style={styles.gridCardTitle}>YÊU CẦU RÚT TIỀN</Text>
              <Text style={styles.gridCardDesc}>Chuyển đổi số điểm thưởng nhận được thành tiền mặt.</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Back button */}
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.replace('/(tabs)')}
        >
          <MaterialIcons name="arrow-back" size={20} color="#AAAAAA" />
          <Text style={styles.backButtonText}>QUAY LẠI TRANG CHỦ KHÁN GIẢ</Text>
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
    justifyContent: 'space-between',
  },
  welcomeCard: {
    backgroundColor: '#15151E',
    borderWidth: 1,
    borderColor: '#303037',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  welcomeTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
    marginBottom: 4,
    fontFamily: Platform.OS === 'ios' ? 'HelveticaNeue-CondensedBold' : 'sans-serif-condensed',
  },
  welcomeSub: {
    color: '#AAAAAA',
    fontSize: 12,
    marginBottom: 16,
  },
  balanceContainer: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#303037',
    paddingTop: 16,
    alignItems: 'center',
  },
  balanceBox: {
    flex: 1,
    alignItems: 'center',
  },
  balanceLabel: {
    color: '#58585B',
    fontSize: 9,
    fontWeight: '800',
    marginBottom: 4,
  },
  balanceValue: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
    fontFamily: Platform.OS === 'ios' ? 'Courier-Bold' : 'monospace',
  },
  balanceDivider: {
    width: 1,
    height: 30,
    backgroundColor: '#303037',
  },
  gridContainer: {
    flex: 1,
    gap: 16,
    marginBottom: 20,
  },
  gridCard: {
    backgroundColor: '#15151E',
    borderWidth: 1,
    borderColor: '#303037',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    textAlign: 'center',
  },
  gridCardTitle: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
    marginTop: 10,
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  gridCardDesc: {
    color: '#AAAAAA',
    fontSize: 11,
    textAlign: 'center',
    lineHeight: 14,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#303037',
    borderRadius: 24,
    height: 48,
    backgroundColor: '#15151E',
  },
  backButtonText: {
    color: '#AAAAAA',
    fontSize: 12,
    fontWeight: '800',
  },
});
