import React, { useState } from 'react';
import { StyleSheet, View, TextInput, TouchableOpacity, Text, ActivityIndicator, Alert, SafeAreaView, KeyboardAvoidingView, Platform, ScrollView, Image, ImageBackground, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../providers/auth-provider';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

export default function LoginScreen() {
  const [email, setEmail] = useState('spectator@horsetrack.local');
  const [password, setPassword] = useState('password123');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
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
    <View style={styles.wrapper}>
      <StatusBar barStyle="light-content" />
      <ImageBackground 
        source={require('../../assets/images/hero_horse_racing.png')} 
        style={StyleSheet.absoluteFillObject}
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
              {/* Logo & Brand Header */}
              <View style={styles.headerContainer}>
                <Image 
                  source={require('../../assets/images/logo.png')} 
                  style={styles.logo} 
                  resizeMode="contain" 
                />
                <View style={styles.brandTextContainer}>
                  <Text style={styles.brandTitleWhite}>HORSE</Text>
                  <Text style={styles.brandTitleRed}>TRACK</Text>
                </View>
                <Text style={styles.brandSubtitle}>RACING MANAGEMENT PLATFORM</Text>
                <Text style={styles.brandSlogan}>Quản lý giải đua. Dự đoán thông minh. Vươn tới chiến thắng.</Text>
              </View>

              {/* Form Input */}
              <View style={styles.formContainer}>
                <Text style={styles.label}>EMAIL</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons name="mail-outline" size={20} color="#6F7785" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    value={email}
                    onChangeText={setEmail}
                    placeholder="spectator@horsetrack.local"
                    placeholderTextColor="#58585B"
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>

                <Text style={styles.label}>MẬT KHẨU</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons name="lock-closed-outline" size={20} color="#6F7785" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    value={password}
                    onChangeText={setPassword}
                    placeholder="••••••••••••"
                    placeholderTextColor="#58585B"
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
                      color="#6F7785" 
                    />
                  </TouchableOpacity>
                </View>

                <TouchableOpacity 
                  onPress={() => Alert.alert('Quên mật khẩu', 'Vui lòng liên hệ quản trị viên hoặc kiểm tra email của bạn để thiết lập lại mật khẩu.')} 
                  style={styles.forgotPasswordContainer}
                  activeOpacity={0.7}
                >
                  <Text style={styles.forgotPasswordText}>Quên mật khẩu?</Text>
                </TouchableOpacity>

                {/* Login Button */}
                <TouchableOpacity 
                  style={[styles.loginButton, loading && styles.disabledButton]} 
                  onPress={handleLogin}
                  disabled={loading}
                  activeOpacity={0.8}
                >
                  {loading ? (
                    <ActivityIndicator color="#FFFFFF" size="small" />
                  ) : (
                    <Text style={styles.loginButtonText}>Đăng nhập hệ thống</Text>
                  )}
                </TouchableOpacity>

                {/* Register Link */}
                <TouchableOpacity 
                  onPress={() => router.push('/(auth)/register')} 
                  style={styles.registerLink}
                  activeOpacity={0.7}
                >
                  <Text style={styles.registerLinkText}>
                    Bạn chưa có tài khoản? <Text style={styles.redText}>Tạo tài khoản</Text>
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Quick Login Section */}
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
                          <Ionicons name="people-outline" size={18} color="#E10600" />
                        </View>
                        <View style={styles.quickTextWrapper}>
                          <Text style={styles.quickCardTitle}>KHÁN GIẢ</Text>
                          <Text style={styles.quickCardEmail} numberOfLines={1}>spectator@horsetrack.local</Text>
                        </View>
                      </View>
                      <Ionicons name="chevron-forward" size={14} color="#6F7785" style={styles.chevron} />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.quickCard} onPress={() => loginAsRole('owner@horsetrack.local')} activeOpacity={0.7}>
                      <View style={styles.quickCardLeft}>
                        <View style={styles.quickIconWrapper}>
                          <MaterialCommunityIcons name="horse-variant" size={18} color="#E10600" />
                        </View>
                        <View style={styles.quickTextWrapper}>
                          <Text style={styles.quickCardTitle}>CHỦ NGỰA</Text>
                          <Text style={styles.quickCardEmail} numberOfLines={1}>owner@horsetrack.local</Text>
                        </View>
                      </View>
                      <Ionicons name="chevron-forward" size={14} color="#6F7785" style={styles.chevron} />
                    </TouchableOpacity>
                  </View>

                  <View style={styles.row}>
                    <TouchableOpacity style={styles.quickCard} onPress={() => loginAsRole('jockey@horsetrack.local')} activeOpacity={0.7}>
                      <View style={styles.quickCardLeft}>
                        <View style={styles.quickIconWrapper}>
                          <Ionicons name="body-outline" size={18} color="#E10600" />
                        </View>
                        <View style={styles.quickTextWrapper}>
                          <Text style={styles.quickCardTitle}>NÀI NGỰA</Text>
                          <Text style={styles.quickCardEmail} numberOfLines={1}>jockey@horsetrack.local</Text>
                        </View>
                      </View>
                      <Ionicons name="chevron-forward" size={14} color="#6F7785" style={styles.chevron} />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.quickCard} onPress={() => loginAsRole('referee@horsetrack.local')} activeOpacity={0.7}>
                      <View style={styles.quickCardLeft}>
                        <View style={styles.quickIconWrapper}>
                          <Ionicons name="shield-checkmark-outline" size={18} color="#E10600" />
                        </View>
                        <View style={styles.quickTextWrapper}>
                          <Text style={styles.quickCardTitle}>TRỌNG TÀI</Text>
                          <Text style={styles.quickCardEmail} numberOfLines={1}>referee@horsetrack.local</Text>
                        </View>
                      </View>
                      <Ionicons name="chevron-forward" size={14} color="#6F7785" style={styles.chevron} />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>

              {/* Bottom Footer AI Info */}
              <View style={styles.footerContainer}>
                <MaterialCommunityIcons name="brain" size={16} color="#E10600" />
                <Text style={styles.footerText}>AI-powered racing prediction</Text>
              </View>

            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(9, 11, 17, 0.90)', // Dark elegant overlay
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'ios' ? 20 : 40,
    paddingBottom: 40,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 28,
  },
  logo: {
    width: 70,
    height: 70,
    marginBottom: 12,
  },
  brandTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  brandTitleWhite: {
    fontSize: 28,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 1,
    fontFamily: Platform.OS === 'ios' ? 'HelveticaNeue-CondensedBold' : 'sans-serif-condensed',
  },
  brandTitleRed: {
    fontSize: 28,
    fontWeight: '900',
    color: '#E10600',
    letterSpacing: 1,
    fontFamily: Platform.OS === 'ios' ? 'HelveticaNeue-CondensedBold' : 'sans-serif-condensed',
  },
  brandSubtitle: {
    fontSize: 10,
    fontWeight: '700',
    color: '#AEB6C2',
    letterSpacing: 2.5,
    marginBottom: 10,
  },
  brandSlogan: {
    fontSize: 12,
    color: '#6F7785',
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 16,
  },
  formContainer: {
    width: '100%',
    marginBottom: 24,
  },
  label: {
    color: '#AEB6C2',
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 8,
    letterSpacing: 1.2,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#11141B',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 8,
    marginBottom: 18,
    height: 48,
    paddingHorizontal: 14,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: '#FFFFFF',
    height: '100%',
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
    color: '#E10600',
    fontSize: 12,
    fontWeight: '600',
  },
  loginButton: {
    backgroundColor: '#E10600',
    borderRadius: 24,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
    shadowColor: '#E10600',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 4,
  },
  disabledButton: {
    backgroundColor: '#58585B',
    shadowOpacity: 0,
    elevation: 0,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  registerLink: {
    alignItems: 'center',
    marginTop: 20,
  },
  registerLinkText: {
    color: '#AEB6C2',
    fontSize: 13,
  },
  redText: {
    color: '#E10600',
    fontWeight: '700',
  },
  quickLoginContainer: {
    width: '100%',
    backgroundColor: 'rgba(17, 20, 27, 0.4)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  dividerText: {
    color: '#AEB6C2',
    fontSize: 11,
    fontWeight: '700',
    paddingHorizontal: 12,
    letterSpacing: 1.2,
  },
  quickLoginHelp: {
    color: '#6F7785',
    fontSize: 11,
    marginBottom: 16,
    textAlign: 'center',
  },
  grid: {
    gap: 10,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quickCard: {
    backgroundColor: '#11141B',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    width: '48.5%',
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
    backgroundColor: 'rgba(225, 6, 0, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  quickTextWrapper: {
    flex: 1,
  },
  quickCardTitle: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  quickCardEmail: {
    color: '#6F7785',
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
    color: '#6F7785',
    fontSize: 11,
  },
});
