import React, { useState, useEffect } from 'react';
import { ScrollView, View, Text, StyleSheet, TouchableOpacity, Alert, Platform, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { C, Card, useThemeColors, StatCard, SectionHeader, LoadingState, ErrorState, EmptyState } from '@/components/ui/shared';
import { useAuth } from '@/providers/auth-provider';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { refereeAssignmentsApi } from '@/lib/api-client';

export default function RefereeProfile() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const theme = useThemeColors();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  
  // Performance state
  const [assignments, setAssignments] = useState<any[]>([]);
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    refereeAssignmentsApi.myAssignments({ limit: 100 })
      .then(r => setAssignments((r as any).data || []))
      .catch(() => {})
      .finally(() => setLoadingStats(false));
  }, []);

  const performLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      router.replace('/login');
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleLogout = () => {
    if (isLoggingOut) return;
    if (Platform.OS === 'web') {
      void performLogout();
      return;
    }
    Alert.alert('Đăng xuất', 'Bạn có chắc muốn đăng xuất?', [
      { text: 'Hủy', style: 'cancel' },
      { text: 'Đăng xuất', style: 'destructive', onPress: performLogout },
    ]);
  };

  const roleMap: Record<string, string> = {
    admin: '👑 Quản trị viên',
    owner: '🐴 Chủ ngựa',
    jockey: '🏇 Nài ngựa',
    referee: '🏁 Trọng tài',
    spectator: '📣 Khán giả',
    counter_staff: '🏪 Nhân viên quầy',
  };

  const completedCount = assignments.filter(a => a.status === 'completed' || a.status === 'confirmed').length;

  return (
    <ScrollView style={[s.c, { backgroundColor: theme.bg }]} contentContainerStyle={s.p}>
      <View style={s.avatarWrap}>
        <View style={s.avatar}>
          {user?.avatar ? (
            <Image source={{ uri: user.avatar }} style={s.avatarImage} />
          ) : (
            <MaterialIcons name="person" size={40} color={theme.red} />
          )}
        </View>
        <Text style={[s.name, { color: theme.white }]}>{user?.fullName || 'Người dùng'}</Text>
        <Text style={[s.email, { color: theme.textSecondary }]}>{user?.email}</Text>
        <View style={s.rolesRow}>
          {user?.roles.map(r => (
            <View key={r} style={s.roleBadge}>
              <Text style={s.roleText}>{roleMap[r] || r}</Text>
            </View>
          ))}
        </View>
      </View>

      <Card style={{ marginBottom: 24 }}>
        <InfoRow icon="phone" label="Số điện thoại" value={user?.phone || 'Chưa cập nhật'} theme={theme} />
        <InfoRow icon="location-on" label="Địa chỉ" value={user?.address || 'Chưa cập nhật'} theme={theme} />
        <InfoRow icon="cake" label="Ngày sinh" value={user?.dob || 'Chưa cập nhật'} theme={theme} />
      </Card>

      <Card style={s.summaryCard}>
        <Text style={s.sub}>BÁO CÁO HIỆU SUẤT</Text>
        <Text style={s.title}>Thành Tích Điều Hành</Text>
      </Card>

      {loadingStats ? (
        <LoadingState />
      ) : (
        <>
          <View style={s.statsRow}>
            <StatCard label="Nhiệm vụ được giao" value={`${assignments.length}`} icon="assignment-turned-in" color={C.blue} />
            <StatCard label="Đã hoàn thành" value={`${completedCount}`} icon="verified" color={C.teal} />
          </View>
        </>
      )}

      <TouchableOpacity style={s.logoutBtn} onPress={handleLogout} disabled={isLoggingOut}>
        <MaterialIcons name="logout" size={20} color="#EF4444" />
        <Text style={s.logoutText}>Đăng xuất</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

function InfoRow({ icon, label, value, theme }: { icon: string; label: string; value: string; theme: any }) {
  return (
    <View style={[s.infoRow, { borderBottomColor: theme.cardBorder }]}>
      <MaterialIcons name={icon as any} size={18} color={theme.textMuted} />
      <View style={{ flex: 1 }}>
        <Text style={[s.infoLabel, { color: theme.textMuted }]}>{label}</Text>
        <Text style={[s.infoValue, { color: theme.white }]}>{value}</Text>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  c: { flex: 1 }, p: { padding: 16, paddingBottom: 110 },
  avatarWrap: { alignItems: 'center', marginBottom: 24 },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: C.red + '15', borderWidth: 2, borderColor: C.red, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  avatarImage: { width: '100%', height: '100%' },
  name: { fontSize: 18, fontWeight: '900', marginTop: 12 },
  email: { fontSize: 12, marginTop: 4 },
  rolesRow: { flexDirection: 'row', gap: 8, marginTop: 12 },
  roleBadge: { backgroundColor: C.red + '15', borderWidth: 1, borderColor: C.red + '40', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 4 },
  roleText: { color: C.red, fontSize: 11, fontWeight: '700' },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, borderBottomWidth: 1 },
  infoLabel: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  infoValue: { fontSize: 13, fontWeight: '600', marginTop: 2 },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 24, padding: 14, borderRadius: 16, borderWidth: 1, borderColor: '#EF444440', backgroundColor: '#EF444410' },
  logoutText: { color: '#EF4444', fontSize: 14, fontWeight: '700' },
  
  // Performance styles
  summaryCard: { backgroundColor: C.card, marginBottom: 12 },
  sub: { color: C.red, fontSize: 10, fontWeight: '800', letterSpacing: 1 },
  title: { color: C.white, fontSize: 20, fontWeight: '900', marginTop: 4 },
  statsRow: { flexDirection: 'column', gap: 8 },
});
