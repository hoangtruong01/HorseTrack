import React from 'react';
import { ScrollView, View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { C, Card } from '@/components/ui/shared';
import { useAuth } from '@/providers/auth-provider';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    Alert.alert('Đăng xuất', 'Bạn có chắc muốn đăng xuất?', [
      { text: 'Hủy', style: 'cancel' },
      { text: 'Đăng xuất', style: 'destructive', onPress: async () => {
        await logout();
        router.replace('/(auth)/login');
      }},
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

  return (
    <ScrollView style={s.c} contentContainerStyle={s.p}>
      <View style={s.avatarWrap}>
        <View style={s.avatar}>
          <MaterialIcons name="person" size={40} color={C.red} />
        </View>
        <Text style={s.name}>{user?.fullName || 'Người dùng'}</Text>
        <Text style={s.email}>{user?.email}</Text>
        <View style={s.rolesRow}>
          {user?.roles.map(r => (
            <View key={r} style={s.roleBadge}>
              <Text style={s.roleText}>{roleMap[r] || r}</Text>
            </View>
          ))}
        </View>
      </View>

      <Card>
        <InfoRow icon="phone" label="Số điện thoại" value={user?.phone || 'Chưa cập nhật'} />
        <InfoRow icon="location-on" label="Địa chỉ" value={user?.address || 'Chưa cập nhật'} />
        <InfoRow icon="cake" label="Ngày sinh" value={user?.dob || 'Chưa cập nhật'} />
      </Card>

      <TouchableOpacity style={s.logoutBtn} onPress={handleLogout}>
        <MaterialIcons name="logout" size={20} color="#EF4444" />
        <Text style={s.logoutText}>Đăng xuất</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

function InfoRow({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <View style={s.infoRow}>
      <MaterialIcons name={icon as any} size={18} color={C.textMuted} />
      <View style={{ flex: 1 }}>
        <Text style={s.infoLabel}>{label}</Text>
        <Text style={s.infoValue}>{value}</Text>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  c: { flex: 1, backgroundColor: C.bg }, p: { padding: 16, paddingBottom: 48 },
  avatarWrap: { alignItems: 'center', marginBottom: 24 },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: C.red + '15', borderWidth: 2, borderColor: C.red, alignItems: 'center', justifyContent: 'center' },
  name: { color: C.white, fontSize: 18, fontWeight: '900', marginTop: 12 },
  email: { color: C.textSecondary, fontSize: 12, marginTop: 4 },
  rolesRow: { flexDirection: 'row', gap: 8, marginTop: 12 },
  roleBadge: { backgroundColor: C.red + '15', borderWidth: 1, borderColor: C.red + '40', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 4 },
  roleText: { color: C.red, fontSize: 11, fontWeight: '700' },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: C.cardBorder },
  infoLabel: { color: C.textMuted, fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  infoValue: { color: C.white, fontSize: 13, fontWeight: '600', marginTop: 2 },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 24, padding: 14, borderRadius: 16, borderWidth: 1, borderColor: '#EF444440', backgroundColor: '#EF444410' },
  logoutText: { color: '#EF4444', fontSize: 14, fontWeight: '700' },
});
