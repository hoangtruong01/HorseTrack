import React, { useState } from 'react';
import { StyleSheet, View, TextInput, TouchableOpacity, Text, ActivityIndicator, Alert, SafeAreaView, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../providers/auth-provider';

export default function RegisterScreen() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [dob, setDob] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState('SPECTATOR');
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
      // Mapping role to standard backend roles
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
    { label: 'KHÁN GIẢ (SPECTATOR)', value: 'SPECTATOR' },
    { label: 'CHỦ NGỰA (HORSE OWNER)', value: 'HORSE_OWNER' },
    { label: 'NÀI NGỰA (JOCKEY)', value: 'JOCKEY' },
    { label: 'TRỌNG TÀI (REFEREE)', value: 'REFEREE' },
    { label: 'NHÂN VIÊN QUẦY (COUNTER STAFF)', value: 'COUNTER_STAFF' },
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
            <Text style={styles.brandSubtitle}>GIA NHẬP TRƯỜNG ĐUA HORSETRACK</Text>
          </View>

          <View style={styles.formContainer}>
            <Text style={styles.label}>HỌ VÀ TÊN *</Text>
            <TextInput
              style={styles.input}
              value={fullName}
              onChangeText={setFullName}
              placeholder="nhập họ tên đầy đủ"
              placeholderTextColor="#58585B"
            />

            <Text style={styles.label}>EMAIL ĐĂNG KÝ *</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="ví dụ: email@gmail.com"
              placeholderTextColor="#58585B"
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <Text style={styles.label}>VAI TRÒ THI ĐẤU / VẬN HÀNH</Text>
            <View style={styles.roleSelectorContainer}>
              {rolesList.map((item) => (
                <TouchableOpacity
                  key={item.value}
                  style={[
                    styles.roleOption,
                    selectedRole === item.value && styles.selectedRoleOption,
                  ]}
                  onPress={() => setSelectedRole(item.value)}
                >
                  <Text
                    style={[
                      styles.roleOptionText,
                      selectedRole === item.value && styles.selectedRoleOptionText,
                    ]}
                  >
                    {item.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>MẬT KHẨU KHỞI TẠO *</Text>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder="tối thiểu 6 ký tự"
              placeholderTextColor="#58585B"
              secureTextEntry
              autoCapitalize="none"
            />

            <Text style={styles.label}>SỐ ĐIỆN THOẠI</Text>
            <TextInput
              style={styles.input}
              value={phone}
              onChangeText={setPhone}
              placeholder="nhập số điện thoại liên hệ"
              placeholderTextColor="#58585B"
              keyboardType="phone-pad"
            />

            <Text style={styles.label}>ĐỊA CHỈ</Text>
            <TextInput
              style={styles.input}
              value={address}
              onChangeText={setAddress}
              placeholder="nhập địa chỉ thường trú"
              placeholderTextColor="#58585B"
            />

            <Text style={styles.label}>NGÀY SINH (YYYY-MM-DD)</Text>
            <TextInput
              style={styles.input}
              value={dob}
              onChangeText={setDob}
              placeholder="ví dụ: 1995-08-20"
              placeholderTextColor="#58585B"
            />

            <TouchableOpacity 
              style={[styles.registerButton, loading && styles.disabledButton]} 
              onPress={handleRegister}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={styles.registerButtonText}>GỬI YÊU CẦU ĐĂNG KÝ</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity onPress={() => router.push('/(auth)/login')} style={styles.loginLink}>
              <Text style={styles.loginLinkText}>Đã có tài khoản? <Text style={styles.redText}>Đăng nhập</Text></Text>
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
    backgroundColor: '#1C1C25',
  },
  scrollContent: {
    padding: 24,
  },
  headerContainer: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 24,
  },
  brandTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 2,
    fontFamily: Platform.OS === 'ios' ? 'HelveticaNeue-CondensedBold' : 'sans-serif-condensed',
  },
  brandSubtitle: {
    fontSize: 10,
    fontWeight: '700',
    color: '#E10600',
    letterSpacing: 2,
    marginTop: 4,
  },
  formContainer: {
    width: '100%',
    marginBottom: 40,
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
  roleSelectorContainer: {
    marginBottom: 20,
    gap: 8,
  },
  roleOption: {
    backgroundColor: '#15151E',
    borderWidth: 1,
    borderColor: '#303037',
    borderRadius: 6,
    padding: 12,
    alignItems: 'center',
  },
  selectedRoleOption: {
    borderColor: '#E10600',
    backgroundColor: 'rgba(225, 6, 0, 0.1)',
  },
  roleOptionText: {
    color: '#AAAAAA',
    fontSize: 12,
    fontWeight: '700',
  },
  selectedRoleOptionText: {
    color: '#E10600',
  },
  registerButton: {
    backgroundColor: '#E10600',
    borderRadius: 24,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
  },
  disabledButton: {
    backgroundColor: '#58585B',
  },
  registerButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 1,
  },
  loginLink: {
    alignItems: 'center',
    marginTop: 16,
  },
  loginLinkText: {
    color: '#E0DEDC',
    fontSize: 13,
  },
  redText: {
    color: '#E10600',
    fontWeight: '700',
  },
});
