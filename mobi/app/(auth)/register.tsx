import React, { useState } from 'react';
import { StyleSheet, View, TextInput, TouchableOpacity, Text, ActivityIndicator, Alert, SafeAreaView, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../providers/auth-provider';
import { premiumColors, premiumSpacing, premiumRadius } from '@/components/ui/premium-tokens';

export default function RegisterScreen() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [dob, setDob] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState('spectator');
  const [loading, setLoading] = useState(false);
  
  const { register } = useAuth();
  const router = useRouter();

  const handleRegister = async () => {
    if (!fullName || !email || !password) {
      Alert.alert('Lỗi', 'Họ tên, email và mật khẩu là các trường bắt buộc.');
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
      Alert.alert('Thành công', 'Đăng ký tài khoản thành công!');
    } catch (err: any) {
      Alert.alert('Đăng ký thất bại', err.message || 'Lỗi kết nối server.');
    } finally {
      setLoading(false);
    }
  };

  const rolesList = [
    { label: 'KHÁN GIẢ', value: 'spectator' },
    { label: 'CHỦ NGỰA', value: 'owner' },
    { label: 'NÀI NGỰA', value: 'jockey' },
    { label: 'TRỌNG TÀI', value: 'referee' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          
          <View style={styles.headerContainer}>
            <Text style={styles.brandTitle}>ĐĂNG KÝ HỘI VIÊN</Text>
            <View style={styles.accentLine} />
            <Text style={styles.brandSubtitle}>GIA NHẬP TRƯỜNG ĐUA HORSETRACK</Text>
          </View>

          <View style={styles.formContainer}>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>HỌ VÀ TÊN *</Text>
              <TextInput
                style={styles.input}
                value={fullName}
                onChangeText={setFullName}
                placeholder="nhập họ tên đầy đủ"
                placeholderTextColor={premiumColors.textMuted}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>EMAIL ĐĂNG KÝ *</Text>
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

            <View style={styles.inputGroup}>
              <Text style={styles.label}>VAI TRÒ THI ĐẤU / VẬN HÀNH *</Text>
              <View style={styles.roleGrid}>
                {rolesList.map((item) => {
                  const isSelected = selectedRole === item.value;
                  return (
                    <TouchableOpacity
                      key={item.value}
                      style={[styles.roleOption, isSelected && styles.roleOptionSelected]}
                      onPress={() => setSelectedRole(item.value)}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.roleOptionText, isSelected && styles.roleOptionTextSelected]}>
                        {item.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>MẬT KHẨU KHỞI TẠO *</Text>
              <TextInput
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                placeholder="tối thiểu 6 ký tự"
                placeholderTextColor={premiumColors.textMuted}
                secureTextEntry
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>SỐ ĐIỆN THOẠI</Text>
              <TextInput
                style={styles.input}
                value={phone}
                onChangeText={setPhone}
                placeholder="nhập số điện thoại liên hệ"
                placeholderTextColor={premiumColors.textMuted}
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>ĐỊA CHỈ</Text>
              <TextInput
                style={styles.input}
                value={address}
                onChangeText={setAddress}
                placeholder="nhập địa chỉ thường trú"
                placeholderTextColor={premiumColors.textMuted}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>NGÀY SINH (YYYY-MM-DD)</Text>
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
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={styles.registerButtonText}>GỬI YÊU CẦU ĐĂNG KÝ</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity onPress={() => router.push('/(auth)/login')} style={styles.loginLink} activeOpacity={0.6}>
              <Text style={styles.loginLinkText}>
                Đã có tài khoản? <Text style={styles.highlightText}>Đăng nhập</Text>
              </Text>
            </TouchableOpacity>

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
    marginBottom: premiumSpacing[32],
  },
  brandTitle: {
    fontSize: 28,
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
    fontSize: 10,
    fontWeight: '700',
    color: premiumColors.textSecondary,
    letterSpacing: 1.5,
  },

  // ── Form ──
  formContainer: {
    width: '100%',
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

  // ── Role Selector (Grid) ──
  roleGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: premiumSpacing[12],
  },
  roleOption: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: premiumColors.surface,
    borderWidth: 1,
    borderColor: premiumColors.border,
    borderRadius: premiumRadius[8],
    paddingVertical: premiumSpacing[12],
    alignItems: 'center',
    justifyContent: 'center',
  },
  roleOptionSelected: {
    backgroundColor: premiumColors.brand + '15',
    borderColor: premiumColors.brand,
  },
  roleOptionText: {
    color: premiumColors.textMuted,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  roleOptionTextSelected: {
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
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 1,
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
