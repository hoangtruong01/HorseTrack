import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, SafeAreaView, Platform, Alert, ScrollView } from 'react-native';
import { useAuth } from '../../providers/auth-provider';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const performLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      router.replace('/login');
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleLogout = async () => {
    if (isLoggingOut) return;
    if (Platform.OS === 'web') {
      void performLogout();
      return;
    }
    Alert.alert('Đăng xuất', 'Bạn có chắc chắn muốn đăng xuất tài khoản?', [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Đăng xuất',
        style: 'destructive',
        onPress: performLogout,
      },
    ]);
  };

  if (!user) return null;

  const normalizedRoles = user.roles.map((role) => role.toLowerCase());
  const isSpectator = normalizedRoles.includes('spectator');
  const isOwner = normalizedRoles.includes('owner');
  const isJockey = normalizedRoles.includes('jockey');
  const isReferee = normalizedRoles.includes('referee');

  const getRoleLabel = (role: string) => {
    switch (role.toLowerCase()) {
      case 'spectator': return 'KHÁN GIẢ';
      case 'owner': return 'CHỦ NGỰA';
      case 'jockey': return 'NÀI NGỰA (JOCKEY)';
      case 'referee': return 'TRỌNG TÀI';
      default: return role;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Profile Card */}
        <View style={styles.profileHeaderCard}>
          <View style={styles.avatarCircle}>
            <MaterialIcons name="person" size={48} color="#15151E" />
          </View>
          <Text style={styles.fullName}>{user.fullName.toUpperCase()}</Text>
          <Text style={styles.emailText}>{user.email}</Text>

          <View style={styles.roleContainer}>
            {user.roles.map((role) => (
              <View key={role} style={styles.roleBadge}>
                <Text style={styles.roleBadgeText}>{getRoleLabel(role)}</Text>
              </View>
            ))}
          </View>
        </View>
        {/* Specialized Workspaces Switcher Section */}
        {(isSpectator || isOwner || isJockey || isReferee) && (
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>PHAN HE CHUYEN BIET</Text>

            {isSpectator && (
              <TouchableOpacity
                style={styles.workspaceButton}
                onPress={() => router.push('/(spectator)' as any)}
              >
                <View style={styles.workspaceButtonLeft}>
                  <MaterialIcons name="emoji-events" size={24} color="#E10600" />
                  <View style={styles.workspaceButtonInfo}>
                    <Text style={styles.workspaceTitle}>KHAN GIA</Text>
                    <Text style={styles.workspaceDesc}>Tournament, race, result, wallet va prediction</Text>
                  </View>
                </View>
                <MaterialIcons name="chevron-right" size={24} color="#58585B" />
              </TouchableOpacity>
            )}

            {isOwner && (
              <TouchableOpacity
                style={styles.workspaceButton}
                onPress={() => router.push('/(owner)' as any)}
              >
                <View style={styles.workspaceButtonLeft}>
                  <MaterialIcons name="pets" size={24} color="#E10600" />
                  <View style={styles.workspaceButtonInfo}>
                    <Text style={styles.workspaceTitle}>CHU NGUA</Text>
                    <Text style={styles.workspaceDesc}>Ho so, ngua, ghi danh va loi moi jockey</Text>
                  </View>
                </View>
                <MaterialIcons name="chevron-right" size={24} color="#58585B" />
              </TouchableOpacity>
            )}

            {isJockey && (
              <TouchableOpacity
                style={styles.workspaceButton}
                onPress={() => router.push('/(jockey)' as any)}
              >
                <View style={styles.workspaceButtonLeft}>
                  <MaterialIcons name="sports" size={24} color="#E10600" />
                  <View style={styles.workspaceButtonInfo}>
                    <Text style={styles.workspaceTitle}>JOCKEY</Text>
                    <Text style={styles.workspaceDesc}>Invitation, schedule va performance</Text>
                  </View>
                </View>
                <MaterialIcons name="chevron-right" size={24} color="#58585B" />
              </TouchableOpacity>
            )}

            {isReferee && (
              <TouchableOpacity
                style={styles.workspaceButton}
                onPress={() => router.push('/(referee)' as any)}
              >
                <View style={styles.workspaceButtonLeft}>
                  <MaterialIcons name="fact-check" size={24} color="#E1A200" />
                  <View style={styles.workspaceButtonInfo}>
                    <Text style={styles.workspaceTitle}>TRONG TAI</Text>
                    <Text style={styles.workspaceDesc}>Assignment, pre-race check va result entry</Text>
                  </View>
                </View>
                <MaterialIcons name="chevron-right" size={24} color="#58585B" />
              </TouchableOpacity>
            )}
          </View>
        )}
        {/* Account Details */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>THÔNG TIN TÀI KHOẢN</Text>
          
          <View style={styles.infoField}>
            <Text style={styles.infoLabel}>SỐ ĐIỆN THOẠI</Text>
            <Text style={styles.infoValue}>{user.phone || 'Chưa thiết lập'}</Text>
          </View>

          <View style={styles.infoField}>
            <Text style={styles.infoLabel}>ĐỊA CHỈ</Text>
            <Text style={styles.infoValue}>{user.address || 'Chưa thiết lập'}</Text>
          </View>

          <View style={styles.infoField}>
            <Text style={styles.infoLabel}>NGÀY SINH</Text>
            <Text style={styles.infoValue}>{user.dob || 'Chưa thiết lập'}</Text>
          </View>
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout} disabled={isLoggingOut}>
          <MaterialIcons name="logout" size={20} color="#FFFFFF" />
          <Text style={styles.logoutButtonText}>ĐĂNG XUẤT TÀI KHOẢN</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1C1C25',
  },
  scrollContent: {
    padding: 16,
  },
  profileHeaderCard: {
    backgroundColor: '#15151E',
    borderWidth: 1,
    borderColor: '#303037',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E10600',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  fullName: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '900',
    marginBottom: 4,
    fontFamily: Platform.OS === 'ios' ? 'HelveticaNeue-CondensedBold' : 'sans-serif-condensed',
  },
  emailText: {
    color: '#AAAAAA',
    fontSize: 13,
    marginBottom: 16,
  },
  roleContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
  },
  roleBadge: {
    backgroundColor: 'rgba(225, 6, 0, 0.1)',
    borderWidth: 1,
    borderColor: '#E10600',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  roleBadgeText: {
    color: '#E10600',
    fontSize: 9,
    fontWeight: '800',
  },
  sectionContainer: {
    backgroundColor: '#15151E',
    borderWidth: 1,
    borderColor: '#303037',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1,
    marginBottom: 16,
    borderLeftWidth: 2,
    borderLeftColor: '#E10600',
    paddingLeft: 8,
  },
  workspaceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1C1C25',
    borderWidth: 1,
    borderColor: '#303037',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  workspaceButtonLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  workspaceButtonInfo: {
    flex: 1,
  },
  workspaceTitle: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  workspaceDesc: {
    color: '#AAAAAA',
    fontSize: 11,
    marginTop: 2,
  },
  infoField: {
    borderBottomWidth: 1,
    borderBottomColor: '#1C1C25',
    paddingVertical: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoLabel: {
    color: '#58585B',
    fontSize: 10,
    fontWeight: '800',
  },
  infoValue: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  logoutButton: {
    backgroundColor: '#E10600',
    borderRadius: 24,
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 8,
    marginBottom: 30,
  },
  logoutButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});
