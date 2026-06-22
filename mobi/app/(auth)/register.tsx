import React, { useState } from 'react';
import { StyleSheet, View, TextInput, TouchableOpacity, Text, ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView, Image, ImageBackground, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../providers/auth-provider';
import { premiumColors, premiumSpacing, premiumRadius, premiumTypography } from '@/components/ui/premium-tokens';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function RegisterScreen() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [dob, setDob] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState('spectator');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const { register } = useAuth();
  const router = useRouter();

  const handleRegister = async () => {
    if (!fullName.trim() || !email.trim() || !password) {
      Alert.alert('Lỗi', 'Họ tên, email và mật khẩu là các trường bắt buộc.');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      Alert.alert('Lỗi', 'Địa chỉ email không hợp lệ. Vui lòng kiểm tra lại.');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Lỗi', 'Mật khẩu phải có ít nhất 6 ký tự.');
      return;
    }
    setLoading(true);
    try {
      const backendRoles = [selectedRole];
      await register({
        fullName,
        email,
        phone,
        address,
        dob,
        roles: backendRoles,
        password,
      });
      Alert.alert('Thành công', 'Đăng ký tài khoản thành công! Bạn có thể đăng nhập ngay.', [
        { text: 'OK', onPress: () => router.push('/(auth)/login') }
      ]);
    } catch (err: any) {
      Alert.alert('Đăng ký thất bại', err.message || 'Lỗi kết nối server.');
    } finally {
      setLoading(false);
    }
  };

  const rolesList = [
    { label: 'KHÁN GIẢ', value: 'spectator', icon: 'people-outline' },
    { label: 'CHỦ NGỰA', value: 'owner', icon: 'horse' },
    { label: 'NÀI NGỰA', value: 'jockey', icon: 'body-outline' },
    { label: 'TRỌNG TÀI', value: 'referee', icon: 'shield-checkmark-outline' },
  ];

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
                <Text style={styles.brandTitle}>ĐĂNG KÝ HỘI VIÊN</Text>
                <View style={styles.accentLine} />
                <Text style={styles.brandSubtitle}>GIA NHẬP TRƯỜNG ĐUA HORSETRACK</Text>
              </View>

              <View style={styles.formContainer}>
                
                <Text style={styles.label}>HỌ VÀ TÊN *</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons name="person-outline" size={20} color={premiumColors.textMuted} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    value={fullName}
                    onChangeText={setFullName}
                    placeholder="nhập họ tên đầy đủ"
                    placeholderTextColor={premiumColors.textMuted}
                  />
                </View>

                <Text style={styles.label}>EMAIL ĐĂNG KÝ *</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons name="mail-outline" size={20} color={premiumColors.textMuted} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    value={email}
                    onChangeText={setEmail}
                    placeholder="ví dụ: email@gmail.com"
                    placeholderTextColor={premiumColors.textMuted}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>

                <Text style={styles.label}>VAI TRÒ THI ĐẤU / VẬN HÀNH *</Text>
                <View style={styles.roleGrid}>
                  <View style={styles.row}>
                    {rolesList.slice(0, 2).map((item) => {
                      const isSelected = selectedRole === item.value;
                      return (
                        <TouchableOpacity
                          key={item.value}
                          style={[
                            styles.roleCard,
                            isSelected && styles.selectedRoleCard
                          ]}
                          onPress={() => setSelectedRole(item.value)}
                          activeOpacity={0.7}
                        >
                          {item.icon === 'horse' ? (
                            <MaterialCommunityIcons 
                              name="horse-variant" 
                              size={18} 
                              color={isSelected ? premiumColors.brand : premiumColors.textMuted} 
                            />
                          ) : (
                            <Ionicons 
                              name={item.icon as any} 
                              size={18} 
                              color={isSelected ? premiumColors.brand : premiumColors.textMuted} 
                            />
                          )}
                          <Text style={[styles.roleCardText, isSelected && styles.selectedRoleCardText]}>
                            {item.label}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                  <View style={styles.row}>
                    {rolesList.slice(2, 4).map((item) => {
                      const isSelected = selectedRole === item.value;
                      return (
                        <TouchableOpacity
                          key={item.value}
                          style={[
                            styles.roleCard,
                            isSelected && styles.selectedRoleCard
                          ]}
                          onPress={() => setSelectedRole(item.value)}
                          activeOpacity={0.7}
                        >
                          {item.icon === 'horse' ? (
                            <MaterialCommunityIcons 
                              name="horse-variant" 
                              size={18} 
                              color={isSelected ? premiumColors.brand : premiumColors.textMuted} 
                            />
                          ) : (
                            <Ionicons 
                              name={item.icon as any} 
                              size={18} 
                              color={isSelected ? premiumColors.brand : premiumColors.textMuted} 
                            />
                          )}
                          <Text style={[styles.roleCardText, isSelected && styles.selectedRoleCardText]}>
                            {item.label}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>

                <Text style={styles.label}>MẬT KHẨU KHỞI TẠO *</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons name="lock-closed-outline" size={20} color={premiumColors.textMuted} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    value={password}
                    onChangeText={setPassword}
                    placeholder="tối thiểu 6 ký tự"
                    placeholderTextColor={premiumColors.textMuted}
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
                      color={premiumColors.textMuted} 
                    />
                  </TouchableOpacity>
                </View>

                <Text style={styles.label}>SỐ ĐIỆN THOẠI</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons name="call-outline" size={20} color={premiumColors.textMuted} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    value={phone}
                    onChangeText={setPhone}
                    placeholder="nhập số điện thoại"
                    placeholderTextColor={premiumColors.textMuted}
                    keyboardType="phone-pad"
                  />
                </View>

                <Text style={styles.label}>ĐỊA CHỈ</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons name="location-outline" size={20} color={premiumColors.textMuted} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    value={address}
                    onChangeText={setAddress}
                    placeholder="nhập địa chỉ thường trú"
                    placeholderTextColor={premiumColors.textMuted}
                  />
                </View>

                <Text style={styles.label}>NGÀY SINH (YYYY-MM-DD)</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons name="calendar-outline" size={20} color={premiumColors.textMuted} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    value={dob}
                    onChangeText={setDob}
                    placeholder="ví dụ: 1995-08-20"
                    placeholderTextColor={premiumColors.textMuted}
                  />
                </View>

                <TouchableOpacity 
                  style={[styles.registerButton, loading && styles.disabledButton]} 
                  onPress={handleRegister}
                  disabled={loading}
                  activeOpacity={0.8}
                >
                  {loading ? (
                    <ActivityIndicator color={premiumColors.text} size="small" />
                  ) : (
                    <Text style={styles.registerButtonText}>GỬI YÊU CẦU ĐĂNG KÝ</Text>
                  )}
                </TouchableOpacity>

                <TouchableOpacity 
                  onPress={() => router.push('/(auth)/login')} 
                  style={styles.loginLink}
                  activeOpacity={0.7}
                >
                  <Text style={styles.loginLinkText}>
                    Đã có tài khoản? <Text style={styles.highlightText}>Đăng nhập</Text>
                  </Text>
                </TouchableOpacity>
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
    backgroundColor: 'rgba(9, 11, 17, 0.92)', 
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
    width: 60,
    height: 60,
    marginBottom: 10,
  },
  brandTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: premiumColors.text,
    letterSpacing: 1,
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
    fontSize: 9,
    fontWeight: '700',
    color: premiumColors.textSecondary,
    letterSpacing: 1.5,
  },

  // ── Form ──
  formContainer: {
    width: '100%',
    marginBottom: premiumSpacing[24],
  },
  label: {
    color: premiumColors.textSecondary,
    fontSize: 11,
    fontWeight: '700',
    marginBottom: premiumSpacing[8],
    letterSpacing: 1,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: premiumColors.surface,
    borderWidth: 1,
    borderColor: premiumColors.border,
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
    color: premiumColors.text,
    height: '100%',
  },
  eyeButton: {
    padding: 6,
  },

  // ── Role Selector (Grid) ──
  roleGrid: {
    gap: 10,
    marginBottom: premiumSpacing[16],
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  roleCard: {
    backgroundColor: premiumColors.surfaceGlass,
    borderWidth: 1,
    borderColor: premiumColors.borderSoft,
    borderRadius: premiumRadius[8],
    paddingVertical: 12,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  selectedRoleCard: {
    borderColor: premiumColors.brand,
    backgroundColor: premiumColors.brand + '15',
  },
  roleCardText: {
    color: premiumColors.textMuted,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  selectedRoleCardText: {
    color: premiumColors.brand,
  },

  // ── Button ──
  registerButton: {
    backgroundColor: premiumColors.brand,
    borderRadius: premiumRadius[8],
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: premiumSpacing[16],
  },
  disabledButton: {
    backgroundColor: premiumColors.surface2,
  },
  registerButtonText: {
    color: premiumColors.text,
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.5,
  },

  // ── Links ──
  loginLink: {
    alignItems: 'center',
    marginTop: premiumSpacing[24],
    paddingVertical: premiumSpacing[8],
  },
  loginLinkText: {
    color: premiumColors.textSecondary,
    fontSize: 13,
  },
  highlightText: {
    color: premiumColors.brand,
    fontWeight: '700',
  },
});
