import React, { useState, useMemo } from 'react';
import { StyleSheet, View, TextInput, TouchableOpacity, Text, ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView, Image, ImageBackground, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../providers/auth-provider';
import { premiumColors, premiumSpacing, premiumRadius, premiumTypography, usePremiumColors } from '@/components/ui/premium-tokens';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';

const getPasswordStrength = (pass: string) => {
  let score = 0;
  if (pass.length >= 8) score += 1;
  if (/[A-Z]/.test(pass)) score += 1;
  if (/[a-z]/.test(pass)) score += 1;
  if (/[0-9]/.test(pass)) score += 1;
  return score;
};

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const getStrengthColor = (score: number, index: number, colors: any) => {
  if (score <= index) return colors.surface2;
  if (score === 1) return '#FF3B30';
  if (score === 2) return '#FF9500';
  if (score === 3) return '#FFCC00';
  return '#34C759';
};

export default function RegisterScreen() {
  const colors = usePremiumColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [dob, setDob] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState('spectator');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [date, setDate] = useState(new Date());
  const [submitAttempted, setSubmitAttempted] = useState(false);

  const isEmailValid = emailRegex.test(email.trim());
  const isFullNameValid = fullName.trim().length > 0;
  const isDobValid = dob.trim().length === 10;
  const strengthScore = getPasswordStrength(password);
  const hasMinLength = password.length >= 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);

  const { register } = useAuth();
  const router = useRouter();

  const handleDobChange = (text: string) => {
    let cleaned = text.replace(/\D/g, '');
    let formatted = cleaned;
    if (cleaned.length > 2) {
      formatted = `${cleaned.slice(0, 2)}/${cleaned.slice(2)}`;
    }
    if (cleaned.length > 4) {
      formatted = `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}/${cleaned.slice(4, 8)}`;
    }
    setDob(formatted);
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    if (selectedDate) {
      setDate(selectedDate);
      const day = selectedDate.getDate().toString().padStart(2, '0');
      const month = (selectedDate.getMonth() + 1).toString().padStart(2, '0');
      const year = selectedDate.getFullYear();
      setDob(`${day}/${month}/${year}`);
    }
  };

  const handleRegister = async () => {
    setSubmitAttempted(true);

    if (!isFullNameValid || !isEmailValid || strengthScore < 4 || !isDobValid) {
      return;
    }

    setLoading(true);
    try {
      const backendRoles = [selectedRole];

      let backendDob = dob;
      if (dob && dob.length === 10) {
        const [d, m, y] = dob.split('/');
        if (d && m && y) {
          backendDob = `${y}-${m}-${d}`;
        }
      }

      await register({
        fullName,
        email,
        phone,
        address,
        dob: backendDob,
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
                <View style={[
                  styles.inputWrapper,
                  submitAttempted && !isFullNameValid ? { borderColor: '#FF3B30', marginBottom: 6 } : undefined
                ]}>
                  <Ionicons name="person-outline" size={20} color={colors.textMuted} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    value={fullName}
                    onChangeText={setFullName}
                    placeholder="nhập họ tên đầy đủ"
                    placeholderTextColor={colors.textMuted}
                  />
                  {submitAttempted && !isFullNameValid && (
                    <Ionicons name="alert-circle" size={20} color="#FF3B30" />
                  )}
                </View>
                {submitAttempted && !isFullNameValid && (
                  <Text style={styles.errorText}>Họ tên là bắt buộc</Text>
                )}

                <Text style={styles.label}>EMAIL ĐĂNG KÝ *</Text>
                <View style={[
                  styles.inputWrapper,
                  (submitAttempted || email.length > 0) && !isEmailValid ? { borderColor: '#FF3B30', marginBottom: 6 } : undefined
                ]}>
                  <Ionicons name="mail-outline" size={20} color={colors.textMuted} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    value={email}
                    onChangeText={setEmail}
                    placeholder="ví dụ: email@gmail.com"
                    placeholderTextColor={colors.textMuted}
                    keyboardType="email-address"
                    spellCheck={false}
                    autoCapitalize="none"
                  />
                  {(submitAttempted || email.length > 0) && (
                    <Ionicons
                      name={isEmailValid ? "checkmark-circle" : "alert-circle"}
                      size={20}
                      color={isEmailValid ? '#34C759' : '#FF3B30'}
                    />
                  )}
                </View>
                {(submitAttempted || email.length > 0) && !isEmailValid && (
                  <Text style={styles.errorText}>
                    {email.length === 0 ? 'Email là bắt buộc' : 'Email chưa đúng định dạng'}
                  </Text>
                )}

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
                              color={isSelected ? colors.brand : colors.textMuted}
                            />
                          ) : (
                            <Ionicons
                              name={item.icon as any}
                              size={18}
                              color={isSelected ? colors.brand : colors.textMuted}
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
                              color={isSelected ? colors.brand : colors.textMuted}
                            />
                          ) : (
                            <Ionicons
                              name={item.icon as any}
                              size={18}
                              color={isSelected ? colors.brand : colors.textMuted}
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
                <View style={[
                  styles.inputWrapper,
                  (submitAttempted && strengthScore < 4) ? { borderColor: '#FF3B30', marginBottom: 8 } : (password.length > 0 ? { marginBottom: 8 } : undefined)
                ]}>
                  <Ionicons name="lock-closed-outline" size={20} color={colors.textMuted} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    value={password}
                    onChangeText={setPassword}
                    placeholder="tối thiểu 8 ký tự, hoa, thường, số"
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

                {(submitAttempted || password.length > 0) && (
                  <View style={styles.strengthContainer}>
                    <View style={styles.strengthBars}>
                      {[0, 1, 2, 3].map((index) => (
                        <View
                          key={index}
                          style={[
                            styles.strengthBar,
                            { backgroundColor: getStrengthColor(strengthScore, index, colors) }
                          ]}
                        />
                      ))}
                    </View>
                    <View style={styles.reqList}>
                      <View style={styles.reqItem}>
                        <Ionicons name={hasUpperCase ? "checkmark-circle" : "ellipse-outline"} size={14} color={hasUpperCase ? '#34C759' : colors.textMuted} />
                        <Text style={[styles.reqText, { color: hasUpperCase ? '#34C759' : colors.textMuted }]}>ít nhất 1 chữ in hoa</Text>
                      </View>
                      <View style={styles.reqItem}>
                        <Ionicons name={hasLowerCase ? "checkmark-circle" : "ellipse-outline"} size={14} color={hasLowerCase ? '#34C759' : colors.textMuted} />
                        <Text style={[styles.reqText, { color: hasLowerCase ? '#34C759' : colors.textMuted }]}>ít nhất 1 chữ thường</Text>
                      </View>
                      <View style={styles.reqItem}>
                        <Ionicons name={hasNumber ? "checkmark-circle" : "ellipse-outline"} size={14} color={hasNumber ? '#34C759' : colors.textMuted} />
                        <Text style={[styles.reqText, { color: hasNumber ? '#34C759' : colors.textMuted }]}>ít nhất 1 số</Text>
                      </View>
                      <View style={styles.reqItem}>
                        <Ionicons name={hasMinLength ? "checkmark-circle" : "ellipse-outline"} size={14} color={hasMinLength ? '#34C759' : colors.textMuted} />
                        <Text style={[styles.reqText, { color: hasMinLength ? '#34C759' : colors.textMuted }]}>ít nhất 8 kí tự</Text>
                      </View>
                    </View>
                  </View>
                )}

                <Text style={styles.label}>SỐ ĐIỆN THOẠI</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons name="call-outline" size={20} color={colors.textMuted} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    value={phone}
                    onChangeText={setPhone}
                    placeholder="nhập số điện thoại"
                    placeholderTextColor={colors.textMuted}
                    keyboardType="phone-pad"
                  />
                </View>

                <Text style={styles.label}>ĐỊA CHỈ</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons name="location-outline" size={20} color={colors.textMuted} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    value={address}
                    onChangeText={setAddress}
                    placeholder="nhập địa chỉ thường trú"
                    placeholderTextColor={colors.textMuted}
                  />
                </View>

                <Text style={styles.label}>NGÀY SINH (DD/MM/YYYY) *</Text>
                <View style={[
                  styles.inputWrapper,
                  submitAttempted && !isDobValid ? { borderColor: '#FF3B30', marginBottom: 6 } : undefined
                ]}>
                  <TouchableOpacity
                    onPress={() => setShowDatePicker(true)}
                    style={styles.inputIcon}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="calendar-outline" size={20} color={colors.textMuted} />
                  </TouchableOpacity>
                  <TextInput
                    style={styles.input}
                    value={dob}
                    onChangeText={handleDobChange}
                    placeholder="ví dụ: 20/08/1995"
                    placeholderTextColor={colors.textMuted}
                    keyboardType="numeric"
                    maxLength={10}
                  />
                  {submitAttempted && !isDobValid && (
                    <Ionicons name="alert-circle" size={20} color="#FF3B30" />
                  )}
                </View>
                {submitAttempted && !isDobValid && (
                  <Text style={styles.errorText}>Ngày sinh là bắt buộc và phải đúng định dạng</Text>
                )}

                {showDatePicker && (
                  <DateTimePicker
                    value={date}
                    mode="date"
                    display="default"
                    onChange={onDateChange}
                    maximumDate={new Date()}
                  />
                )}

                <TouchableOpacity
                  style={[styles.registerButton, loading && styles.disabledButton]}
                  onPress={handleRegister}
                  disabled={loading}
                  activeOpacity={0.8}
                >
                  {loading ? (
                    <ActivityIndicator color={colors.text} size="small" />
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

const createStyles = (colors: any) => StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.bg === '#000000' ? 'rgba(9, 11, 17, 0.92)' : 'rgba(255, 255, 255, 0.90)',
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
    color: colors.text,
    letterSpacing: 1,
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
    fontSize: 9,
    fontWeight: '700',
    color: colors.textSecondary,
    letterSpacing: 1.5,
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
    backgroundColor: colors.surfaceGlass,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    borderRadius: premiumRadius[8],
    paddingVertical: 12,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  selectedRoleCard: {
    borderColor: colors.brand,
    backgroundColor: colors.brand + '15',
  },
  roleCardText: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  selectedRoleCardText: {
    color: colors.brand,
  },

  errorText: {
    color: '#FF3B30',
    fontSize: 11,
    marginBottom: premiumSpacing[16],
    fontWeight: '500',
    paddingLeft: 4,
  },

  // ── Password Strength ──
  strengthContainer: {
    marginBottom: premiumSpacing[16],
  },
  strengthBars: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 8,
  },
  strengthBar: {
    flex: 1,
    height: 4,
    borderRadius: 2,
  },
  strengthText: {
    fontSize: 11,
    fontWeight: '500',
    letterSpacing: 0.5,
  },
  reqList: {
    marginTop: 4,
    gap: 6,
  },
  reqItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  reqText: {
    fontSize: 11,
    fontWeight: '500',
  },

  // ── Button ──
  registerButton: {
    backgroundColor: colors.brand,
    borderRadius: premiumRadius[8],
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: premiumSpacing[16],
  },
  disabledButton: {
    backgroundColor: colors.surface2,
  },
  registerButtonText: {
    color: colors.text,
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
    color: colors.textSecondary,
    fontSize: 13,
  },
  highlightText: {
    color: colors.brand,
    fontWeight: '700',
  },
});
