import React, { useState } from 'react';
import { StyleSheet, View, TextInput, TouchableOpacity, Text, ActivityIndicator, Alert, SafeAreaView, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../providers/auth-provider';
import { premiumColors, premiumSpacing, premiumRadius } from '@/components/ui/premium-tokens';

export default function LoginScreen() {
  const [email, setEmail] = useState('spectator@horsetrack.local');
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
            <View style={styles.accentLine} />
            <Text style={styles.brandSubtitle}>RACING MANAGEMENT PLATFORM</Text>
          </View>

          <View style={styles.formContainer}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>EMAIL ĐĂNG NHẬP</Text>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="nhập email của bạn"
                placeholderTextColor={premiumColors.textMuted}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>MẬT KHẨU</Text>
              <TextInput
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                placeholder="nhập mật khẩu"
                placeholderTextColor={premiumColors.textMuted}
                secureTextEntry
                autoCapitalize="none"
              />
            </View>

            <TouchableOpacity 
              style={[styles.loginButton, loading && styles.disabledButton]} 
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={styles.loginButtonText}>ĐĂNG NHẬP CHÍNH THỨC</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity onPress={() => router.push('/(auth)/register')} style={styles.registerLink} activeOpacity={0.6}>
              <Text style={styles.registerLinkText}>
                Chưa có tài khoản? <Text style={styles.highlightText}>Đăng ký ngay</Text>
              </Text>
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
              {[
                { title: 'KHÁN GIẢ', email: 'spectator@horsetrack.local' },
                { title: 'CHỦ NGỰA', email: 'owner@horsetrack.local' },
                { title: 'NÀI NGỰA', email: 'jockey@horsetrack.local' },
                { title: 'TRỌNG TÀI', email: 'referee@horsetrack.local' }
              ].map((role) => (
                <TouchableOpacity 
                  key={role.email}
                  style={styles.quickCard} 
                  onPress={() => loginAsRole(role.email)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.quickCardTitle}>{role.title}</Text>
                  <Text style={styles.quickCardEmail} numberOfLines={1} ellipsizeMode="tail">
                    {role.email}
                  </Text>
                </TouchableOpacity>
              ))}
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
    backgroundColor: premiumColors.bg,
  },
  scrollContent: {
    paddingHorizontal: premiumSpacing[24],
    paddingTop: premiumSpacing[48],
    paddingBottom: premiumSpacing[48],
  },
  
  // ── Header ──
  headerContainer: {
    alignItems: 'flex-start',
    marginBottom: premiumSpacing[40],
  },
  brandTitle: {
    fontSize: 32,
    fontWeight: '900',
    color: premiumColors.text,
    letterSpacing: 1.5,
  },
  accentLine: {
    width: 48,
    height: 4,
    backgroundColor: premiumColors.brand,
    borderRadius: 2,
    marginTop: premiumSpacing[8],
    marginBottom: premiumSpacing[12],
  },
  brandSubtitle: {
    fontSize: 11,
    fontWeight: '700',
    color: premiumColors.textSecondary,
    letterSpacing: 2,
  },

  // ── Form ──
  formContainer: {
    width: '100%',
    marginBottom: premiumSpacing[32],
  },
  inputGroup: {
    marginBottom: premiumSpacing[20],
  },
  label: {
    color: premiumColors.textSecondary,
    fontSize: 11,
    fontWeight: '700',
    marginBottom: premiumSpacing[8],
    letterSpacing: 1,
  },
  input: {
    backgroundColor: premiumColors.surface,
    borderWidth: 1,
    borderColor: premiumColors.border,
    borderRadius: premiumRadius[8],
    paddingHorizontal: premiumSpacing[16],
    height: 52,
    fontSize: 14,
    color: premiumColors.text,
  },
  
  // ── Button ──
  loginButton: {
    backgroundColor: premiumColors.brand,
    borderRadius: premiumRadius[8],
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: premiumSpacing[8],
  },
  disabledButton: {
    backgroundColor: premiumColors.surface2,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 1,
  },
  
  // ── Links ──
  registerLink: {
    alignItems: 'center',
    marginTop: premiumSpacing[24],
    paddingVertical: premiumSpacing[8],
  },
  registerLinkText: {
    color: premiumColors.textSecondary,
    fontSize: 13,
  },
  highlightText: {
    color: premiumColors.brand,
    fontWeight: '700',
  },

  // ── Divider ──
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: premiumSpacing[24],
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: premiumColors.border,
  },
  dividerText: {
    color: premiumColors.textMuted,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.5,
    marginHorizontal: premiumSpacing[16],
  },

  // ── Demo Section ──
  quickLoginContainer: {
    width: '100%',
  },
  quickLoginHelp: {
    color: premiumColors.textMuted,
    fontSize: 12,
    textAlign: 'center',
    marginBottom: premiumSpacing[16],
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: premiumSpacing[12],
  },
  quickCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: premiumColors.surface,
    borderWidth: 1,
    borderColor: premiumColors.border,
    borderRadius: premiumRadius[8],
    padding: premiumSpacing[12],
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickCardTitle: {
    color: premiumColors.text,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  quickCardEmail: {
    color: premiumColors.textMuted,
    fontSize: 10,
  },
});
