import React, { useState } from 'react';
import { StyleSheet, View, TextInput, TouchableOpacity, Text, ActivityIndicator, Alert, SafeAreaView, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../providers/auth-provider';

export default function LoginScreen() {
  const [email, setEmail] = useState('spectator@wdp.com');
  const [password, setPassword] = useState('password123');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const router = useRouter();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ email và mật khẩu.');
      return;
    }
    setLoading(true);
    try {
      await login(email, password);
    } catch (err: any) {
      Alert.alert('Đăng nhập thất bại', err.message || 'Lỗi kết nối server.');
    } finally {
      setLoading(false);
    }
  };

  const loginAsRole = async (roleEmail: string) => {
    setLoading(true);
    try {
      setEmail(roleEmail);
      setPassword('password123');
      await login(roleEmail, 'password123');
    } catch (err: any) {
      Alert.alert('Đăng nhập thất bại', err.message || 'Lỗi kết nối.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <View style={styles.headerContainer}>
            <Text style={styles.brandTitle}>HORSETRACK</Text>
            <Text style={styles.brandSubtitle}>RACING MANAGEMENT PLATFORM</Text>
          </View>

          <View style={styles.formContainer}>
            <Text style={styles.label}>EMAIL</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="nhập email của bạn"
              placeholderTextColor="#58585B"
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <Text style={styles.label}>MẬT KHẨU</Text>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder="nhập mật khẩu"
              placeholderTextColor="#58585B"
              secureTextEntry
              autoCapitalize="none"
            />

            <TouchableOpacity 
              style={[styles.loginButton, loading && styles.disabledButton]} 
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={styles.loginButtonText}>ĐĂNG NHẬP CHÍNH THỨC</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity onPress={() => router.push('/(auth)/register')} style={styles.registerLink}>
              <Text style={styles.registerLinkText}>Chưa có tài khoản? <Text style={styles.redText}>Đăng ký ngay</Text></Text>
            </TouchableOpacity>
          </View>

          <View style={styles.dividerContainer}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>DEMO QUICK LOGIN</Text>
            <View style={styles.dividerLine} />
          </View>

          <View style={styles.quickLoginContainer}>
            <Text style={styles.quickLoginHelp}>Chọn nhanh vai trò để thử nghiệm hệ thống:</Text>
            <View style={styles.grid}>
              <TouchableOpacity style={styles.quickCard} onPress={() => loginAsRole('spectator@wdp.com')}>
                <Text style={styles.quickCardTitle}>KHÁN GIẢ</Text>
                <Text style={styles.quickCardEmail}>spectator@wdp.com</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.quickCard} onPress={() => loginAsRole('owner@wdp.com')}>
                <Text style={styles.quickCardTitle}>CHỦ NGỰA</Text>
                <Text style={styles.quickCardEmail}>owner@wdp.com</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.quickCard} onPress={() => loginAsRole('jockey@wdp.com')}>
                <Text style={styles.quickCardTitle}>NÀI NGỰA (JOCKEY)</Text>
                <Text style={styles.quickCardEmail}>jockey@wdp.com</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.quickCard} onPress={() => loginAsRole('referee@wdp.com')}>
                <Text style={styles.quickCardTitle}>TRỌNG TÀI</Text>
                <Text style={styles.quickCardEmail}>referee@wdp.com</Text>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.quickCard, { width: '100%' }]} onPress={() => loginAsRole('counter@wdp.com')}>
                <Text style={styles.quickCardTitle}>NHÂN VIÊN QUẦY (COUNTER)</Text>
                <Text style={styles.quickCardEmail}>counter@wdp.com</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1C1C25',
  },
  scrollContent: {
    padding: 24,
    justifyContent: 'center',
  },
  headerContainer: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 32,
  },
  brandTitle: {
    fontSize: 36,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 2,
    fontFamily: Platform.OS === 'ios' ? 'HelveticaNeue-CondensedBold' : 'sans-serif-condensed',
  },
  brandSubtitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#E10600',
    letterSpacing: 3,
    marginTop: 4,
  },
  formContainer: {
    width: '100%',
    marginBottom: 32,
  },
  label: {
    color: '#E0DEDC',
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 6,
    letterSpacing: 1,
  },
  input: {
    backgroundColor: '#15151E',
    borderWidth: 1,
    borderColor: '#303037',
    borderRadius: 6,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    color: '#FFFFFF',
    marginBottom: 20,
    height: 48,
  },
  loginButton: {
    backgroundColor: '#E10600',
    borderRadius: 24,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  disabledButton: {
    backgroundColor: '#58585B',
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 1,
  },
  registerLink: {
    alignItems: 'center',
    marginTop: 16,
  },
  registerLinkText: {
    color: '#E0DEDC',
    fontSize: 13,
  },
  redText: {
    color: '#E10600',
    fontWeight: '700',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#303037',
  },
  dividerText: {
    color: '#58585B',
    fontSize: 11,
    fontWeight: '700',
    paddingHorizontal: 12,
    letterSpacing: 1,
  },
  quickLoginContainer: {
    width: '100%',
  },
  quickLoginHelp: {
    color: '#AAAAAA',
    fontSize: 12,
    marginBottom: 16,
    textAlign: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  quickCard: {
    backgroundColor: '#15151E',
    borderWidth: 1,
    borderColor: '#303037',
    borderRadius: 8,
    padding: 12,
    width: '47%',
    marginBottom: 4,
  },
  quickCardTitle: {
    color: '#E10600',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  quickCardEmail: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '500',
  },
});
