import React, { useState, useMemo } from 'react';
import { StyleSheet, View, TextInput, TouchableOpacity, Text, ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView, Image, ImageBackground, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../providers/auth-provider';
import { premiumColors, premiumSpacing, premiumRadius, usePremiumColors } from '@/components/ui/premium-tokens';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function LoginScreen() {
  const colors = usePremiumColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const { login } = useAuth();
  const router = useRouter();

  const handleLogin = async () => {
    let hasError = false;
    
    if (!email.trim()) {
      setEmailError('Vui lòng nhập email');
      hasError = true;
    } else {
      setEmailError('');
    }

    if (!password) {
      setPasswordError('Vui lòng nhập mật khẩu');
      hasError = true;
    } else {
      setPasswordError('');
    }

    if (hasError) return;

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
    <View style={styles.wrapper}>
      <StatusBar barStyle={colors.bg === '#000000' ? 'light-content' : 'dark-content'} />
      <ImageBackground 
        source={require('../../assets/images/hero_horse_racing.png')} 
        style={{ flex: 1, width: '100%', minHeight: (Platform.OS === 'web' ? '100vh' : '100%') as any }}
        resizeMode="cover"
      >
        <View style={styles.overlay} />

        <SafeAreaView style={styles.container}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{ flex: 1 }}
          >
            <ScrollView
              contentContainerStyle={styles.scrollContent}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >

              <View style={styles.headerContainer}>
                <Image
                  source={require('../../assets/images/logo.png')}
                  style={styles.logo}
                  resizeMode="contain"
                />
                <Text style={styles.brandTitle}>HORSETRACK</Text>
                <View style={styles.accentLine} />
                <Text style={styles.brandSubtitle}>RACING MANAGEMENT PLATFORM</Text>
                <Text style={styles.brandSlogan}>Quản lý giải đua. Dự đoán thông minh. Vươn tới chiến thắng.</Text>
              </View>

              <View style={styles.formContainer}>
                <Text style={styles.label}>EMAIL ĐĂNG NHẬP</Text>
                <View style={[styles.inputWrapper, emailError ? styles.inputWrapperError : null]}>
                  <Ionicons name="mail-outline" size={20} color={emailError ? (colors.danger || '#ef4444') : colors.textMuted} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    value={email}
                    onChangeText={(text) => {
                      setEmail(text);
                      if (emailError) setEmailError('');
                    }}
                    placeholder="email@example.com"
                    placeholderTextColor={colors.textMuted}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>
                {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}

                <Text style={styles.label}>MẬT KHẨU</Text>
                <View style={[styles.inputWrapper, passwordError ? styles.inputWrapperError : null]}>
                  <Ionicons name="lock-closed-outline" size={20} color={passwordError ? (colors.danger || '#ef4444') : colors.textMuted} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    value={password}
                    onChangeText={(text) => {
                      setPassword(text);
                      if (passwordError) setPasswordError('');
                    }}
                    placeholder="nhập mật khẩu"
                    placeholderTextColor={colors.textMuted}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    style={styles.eyeButton}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name={showPassword ? "eye-outline" : "eye-off-outline"}
                      size={20}
                      color={colors.textMuted}
                    />
                  </TouchableOpacity>
                </View>
                {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}

                <TouchableOpacity
                  onPress={() => Alert.alert('Quên mật khẩu', 'Vui lòng liên hệ quản trị viên hoặc kiểm tra email của bạn để thiết lập lại mật khẩu.')}
                  style={styles.forgotPasswordContainer}
                  activeOpacity={0.7}
                >
                  <Text style={styles.forgotPasswordText}>Quên mật khẩu?</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.loginButton, loading && styles.disabledButton]}
                  onPress={handleLogin}
                  disabled={loading}
                  activeOpacity={0.8}
                >
                  {loading ? (
                    <ActivityIndicator color={colors.text} size="small" />
                  ) : (
                    <Text style={styles.loginButtonText}>Đăng nhập hệ thống</Text>
                  )}
                </TouchableOpacity>

                <TouchableOpacity onPress={() => router.push('/(auth)/register')} style={styles.registerLink} activeOpacity={0.6}>
                  <Text style={styles.registerLinkText}>
                    Chưa có tài khoản? <Text style={styles.highlightText}>Đăng ký ngay</Text>
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.quickLoginContainer}>
                <View style={styles.dividerContainer}>
                  <View style={styles.dividerLine} />
                  <Text style={styles.dividerText}>TRUY CẬP NHANH</Text>
                  <View style={styles.dividerLine} />
                </View>
                <Text style={styles.quickLoginHelp}>Chọn vai trò để trải nghiệm hệ thống</Text>

                <View style={styles.grid}>
                  <View style={styles.row}>
                    <TouchableOpacity style={styles.quickCard} onPress={() => loginAsRole('spectator@horsetrack.local')} activeOpacity={0.7}>
                      <View style={styles.quickCardLeft}>
                        <View style={styles.quickIconWrapper}>
                          <Ionicons name="people-outline" size={18} color={colors.brand} />
                        </View>
                        <View style={styles.quickTextWrapper}>
                          <Text style={styles.quickCardTitle}>KHÁN GIẢ</Text>
                          <Text style={styles.quickCardEmail} numberOfLines={1}>spectator@horsetrack.local</Text>
                        </View>
                      </View>
                      <Ionicons name="chevron-forward" size={14} color={colors.textMuted} style={styles.chevron} />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.quickCard} onPress={() => loginAsRole('owner@horsetrack.local')} activeOpacity={0.7}>
                      <View style={styles.quickCardLeft}>
                        <View style={styles.quickIconWrapper}>
                          <MaterialCommunityIcons name="horse-variant" size={18} color={colors.brand} />
                        </View>
                        <View style={styles.quickTextWrapper}>
                          <Text style={styles.quickCardTitle}>CHỦ NGỰA</Text>
                          <Text style={styles.quickCardEmail} numberOfLines={1}>owner@horsetrack.local</Text>
                        </View>
                      </View>
                      <Ionicons name="chevron-forward" size={14} color={colors.textMuted} style={styles.chevron} />
                    </TouchableOpacity>
                  </View>

                  <View style={styles.row}>
                    <TouchableOpacity style={styles.quickCard} onPress={() => loginAsRole('jockey@horsetrack.local')} activeOpacity={0.7}>
                      <View style={styles.quickCardLeft}>
                        <View style={styles.quickIconWrapper}>
                          <Ionicons name="body-outline" size={18} color={colors.brand} />
                        </View>
                        <View style={styles.quickTextWrapper}>
                          <Text style={styles.quickCardTitle}>NÀI NGỰA</Text>
                          <Text style={styles.quickCardEmail} numberOfLines={1}>jockey@horsetrack.local</Text>
                        </View>
                      </View>
                      <Ionicons name="chevron-forward" size={14} color={colors.textMuted} style={styles.chevron} />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.quickCard} onPress={() => loginAsRole('referee@horsetrack.local')} activeOpacity={0.7}>
                      <View style={styles.quickCardLeft}>
                        <View style={styles.quickIconWrapper}>
                          <Ionicons name="shield-checkmark-outline" size={18} color={colors.brand} />
                        </View>
                        <View style={styles.quickTextWrapper}>
                          <Text style={styles.quickCardTitle}>TRỌNG TÀI</Text>
                          <Text style={styles.quickCardEmail} numberOfLines={1}>referee@horsetrack.local</Text>
                        </View>
                      </View>
                      <Ionicons name="chevron-forward" size={14} color={colors.textMuted} style={styles.chevron} />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>

              {/* Bottom Footer AI Info */}
              <View style={styles.footerContainer}>
                <MaterialCommunityIcons name="brain" size={16} color={colors.brand} />
                <Text style={styles.footerText}>AI-powered racing prediction</Text>
              </View>

            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </ImageBackground>
    </View>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.bg === '#000000' ? 'rgba(9, 11, 17, 0.90)' : 'rgba(255, 255, 255, 0.88)', // Theme responsive overlay
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: premiumSpacing[24],
    paddingTop: Platform.OS === 'ios' ? 20 : premiumSpacing[40],
    paddingBottom: premiumSpacing[40],
  },

  // ── Header ──
  headerContainer: {
    alignItems: 'center',
    marginBottom: premiumSpacing[32],
  },
  logo: {
    width: 70,
    height: 70,
    marginBottom: premiumSpacing[12],
  },
  brandTitle: {
    fontSize: 32,
    fontWeight: '900',
    color: colors.text,
    letterSpacing: 1.5,
  },
  accentLine: {
    width: 48,
    height: 4,
    backgroundColor: colors.brand,
    borderRadius: 2,
    marginTop: premiumSpacing[8],
    marginBottom: premiumSpacing[12],
  },
  brandSubtitle: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textSecondary,
    letterSpacing: 2,
    marginBottom: 8,
  },
  brandSlogan: {
    fontSize: 12,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 16,
  },

  // ── Form ──
  formContainer: {
    width: '100%',
    marginBottom: premiumSpacing[24],
  },
  label: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: '700',
    marginBottom: premiumSpacing[8],
    letterSpacing: 1,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: premiumRadius[8],
    marginBottom: premiumSpacing[16],
    height: 52,
    paddingHorizontal: premiumSpacing[16],
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
    height: '100%',
  },
  inputWrapperError: {
    borderColor: colors.danger || '#ef4444',
    marginBottom: 4,
  },
  errorText: {
    color: colors.danger || '#ef4444',
    fontSize: 11,
    marginBottom: premiumSpacing[16],
    marginLeft: 4,
  },
  eyeButton: {
    padding: 6,
  },
  forgotPasswordContainer: {
    alignSelf: 'flex-end',
    marginBottom: 20,
    marginTop: -4,
  },
  forgotPasswordText: {
    color: colors.brand,
    fontSize: 12,
    fontWeight: '600',
  },

  // ── Button ──
  loginButton: {
    backgroundColor: colors.brand,
    borderRadius: premiumRadius[8],
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: premiumSpacing[8],
  },
  disabledButton: {
    backgroundColor: colors.surface2,
  },
  loginButtonText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.5,
  },

  // ── Links ──
  registerLink: {
    alignItems: 'center',
    marginTop: premiumSpacing[24],
    paddingVertical: premiumSpacing[8],
  },
  registerLinkText: {
    color: colors.textSecondary,
    fontSize: 13,
  },
  highlightText: {
    color: colors.brand,
    fontWeight: '700',
  },

  // ── Divider ──
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  dividerText: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.5,
    marginHorizontal: premiumSpacing[16],
  },

  // ── Demo Section ──
  quickLoginContainer: {
    width: '100%',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    borderRadius: premiumRadius[12],
    padding: premiumSpacing[16],
    marginBottom: premiumSpacing[24],
  },
  quickLoginHelp: {
    color: colors.textMuted,
    fontSize: 11,
    textAlign: 'center',
    marginBottom: premiumSpacing[16],
  },
  grid: {
    gap: 10,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  quickCard: {
    backgroundColor: colors.surfaceGlass,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    borderRadius: premiumRadius[8],
    paddingVertical: 10,
    paddingHorizontal: 12,
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  quickCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  quickIconWrapper: {
    width: 28,
    height: 28,
    borderRadius: 6,
    backgroundColor: colors.brandSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  quickTextWrapper: {
    flex: 1,
  },
  quickCardTitle: {
    color: colors.text,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  quickCardEmail: {
    color: colors.textMuted,
    fontSize: 9,
    fontWeight: '400',
  },
  chevron: {
    marginLeft: 2,
  },
  footerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    gap: 6,
  },
  footerText: {
    color: colors.textMuted,
    fontSize: 11,
  },
});
