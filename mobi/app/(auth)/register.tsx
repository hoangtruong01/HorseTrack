import React, { useState } from 'react';
import { StyleSheet, View, TextInput, TouchableOpacity, Text, ActivityIndicator, Alert, SafeAreaView, KeyboardAvoidingView, Platform, ScrollView, Image, ImageBackground, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../providers/auth-provider';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

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
                <View style={styles.brandTextContainer}>
                  <Text style={styles.brandTitleWhite}>ĐĂNG KÝ</Text>
                  <Text style={styles.brandTitleRed}> HỘI VIÊN</Text>
                </View>
                <Text style={styles.brandSubtitle}>GIA NHẬP TRƯỜNG ĐUA HORSETRACK</Text>
              </View>

              {/* Form Input */}
              <View style={styles.formContainer}>
                
                <Text style={styles.label}>HỌ VÀ TÊN *</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons name="person-outline" size={20} color="#6F7785" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    value={fullName}
                    onChangeText={setFullName}
                    placeholder="nhập họ tên đầy đủ"
                    placeholderTextColor="#58585B"
                  />
                </View>

                <Text style={styles.label}>EMAIL ĐĂNG KÝ *</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons name="mail-outline" size={20} color="#6F7785" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    value={email}
                    onChangeText={setEmail}
                    placeholder="ví dụ: email@gmail.com"
                    placeholderTextColor="#58585B"
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
                              color={isSelected ? '#E10600' : '#6F7785'} 
                            />
                          ) : (
                            <Ionicons 
                              name={item.icon as any} 
                              size={18} 
                              color={isSelected ? '#E10600' : '#6F7785'} 
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
                              color={isSelected ? '#E10600' : '#6F7785'} 
                            />
                          ) : (
                            <Ionicons 
                              name={item.icon as any} 
                              size={18} 
                              color={isSelected ? '#E10600' : '#6F7785'} 
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
                  <Ionicons name="lock-closed-outline" size={20} color="#6F7785" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    value={password}
                    onChangeText={setPassword}
                    placeholder="tối thiểu 6 ký tự"
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

                <Text style={styles.label}>SỐ ĐIỆN THOẠI</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons name="call-outline" size={20} color="#6F7785" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    value={phone}
                    onChangeText={setPhone}
                    placeholder="nhập số điện thoại"
                    placeholderTextColor="#58585B"
                    keyboardType="phone-pad"
                  />
                </View>

                <Text style={styles.label}>ĐỊA CHỈ</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons name="location-outline" size={20} color="#6F7785" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    value={address}
                    onChangeText={setAddress}
                    placeholder="nhập địa chỉ thường trú"
                    placeholderTextColor="#58585B"
                  />
                </View>

                <Text style={styles.label}>NGÀY SINH (YYYY-MM-DD)</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons name="calendar-outline" size={20} color="#6F7785" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    value={dob}
                    onChangeText={setDob}
                    placeholder="ví dụ: 1995-08-20"
                    placeholderTextColor="#58585B"
                  />
                </View>

                {/* Register Button */}
                <TouchableOpacity 
                  style={[styles.registerButton, loading && styles.disabledButton]} 
                  onPress={handleRegister}
                  disabled={loading}
                  activeOpacity={0.8}
                >
                  {loading ? (
                    <ActivityIndicator color="#FFFFFF" size="small" />
                  ) : (
                    <Text style={styles.registerButtonText}>Gửi yêu cầu đăng ký</Text>
                  )}
                </TouchableOpacity>

                {/* Login Link */}
                <TouchableOpacity 
                  onPress={() => router.push('/(auth)/login')} 
                  style={styles.loginLink}
                  activeOpacity={0.7}
                >
                  <Text style={styles.loginLinkText}>
                    Đã có tài khoản? <Text style={styles.redText}>Đăng nhập</Text>
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
    backgroundColor: 'rgba(9, 11, 17, 0.92)', // Slightly darker overlay for forms with more text fields
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
    marginBottom: 24,
  },
  logo: {
    width: 60,
    height: 60,
    marginBottom: 10,
  },
  brandTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  brandTitleWhite: {
    fontSize: 24,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 1,
    fontFamily: Platform.OS === 'ios' ? 'HelveticaNeue-CondensedBold' : 'sans-serif-condensed',
  },
  brandTitleRed: {
    fontSize: 24,
    fontWeight: '900',
    color: '#E10600',
    letterSpacing: 1,
    fontFamily: Platform.OS === 'ios' ? 'HelveticaNeue-CondensedBold' : 'sans-serif-condensed',
  },
  brandSubtitle: {
    fontSize: 9,
    fontWeight: '700',
    color: '#E10600',
    letterSpacing: 2,
  },
  formContainer: {
    width: '100%',
    marginBottom: 20,
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
  roleGrid: {
    gap: 10,
    marginBottom: 18,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  roleCard: {
    backgroundColor: '#11141B',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 8,
    paddingVertical: 12,
    width: '48.5%',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  selectedRoleCard: {
    borderColor: '#E10600',
    backgroundColor: 'rgba(225, 6, 0, 0.08)',
  },
  roleCardText: {
    color: '#6F7785',
    fontSize: 11,
    fontWeight: '700',
  },
  selectedRoleCardText: {
    color: '#E10600',
  },
  registerButton: {
    backgroundColor: '#E10600',
    borderRadius: 24,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
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
  registerButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  loginLink: {
    alignItems: 'center',
    marginTop: 20,
  },
  loginLinkText: {
    color: '#AEB6C2',
    fontSize: 13,
  },
  redText: {
    color: '#E10600',
    fontWeight: '700',
  },
});
