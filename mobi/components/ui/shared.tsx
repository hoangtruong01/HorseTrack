import React from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, Platform, Appearance } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useColorScheme } from '@/hooks/use-color-scheme';

// ─── Shared Colors ──────────────────────────────────────────────────────────
export const C = {
  get bg() {
    return Appearance.getColorScheme() === 'light' ? '#F7F4F1' : '#1C1C25';
  },
  get card() {
    return Appearance.getColorScheme() === 'light' ? '#FFFFFF' : '#15151E';
  },
  get cardBorder() {
    return Appearance.getColorScheme() === 'light' ? '#EAEAEA' : '#303037';
  },
  red: '#E10600',
  teal: '#067E6A',
  tealLight: '#34D399',
  yellow: '#F59E0B',
  get white() {
    return Appearance.getColorScheme() === 'light' ? '#1C1C25' : '#FFFFFF';
  },
  get textPrimary() {
    return Appearance.getColorScheme() === 'light' ? '#1C1C25' : '#FFFFFF';
  },
  get textSecondary() {
    return Appearance.getColorScheme() === 'light' ? '#58585B' : '#AAAAAA';
  },
  get textMuted() {
    return Appearance.getColorScheme() === 'light' ? '#8A8A8E' : '#58585B';
  },
  get inputBg() {
    return Appearance.getColorScheme() === 'light' ? '#F2F2F7' : '#15151E';
  },
};

export function useThemeColors() {
  const colorScheme = useColorScheme() ?? 'light';
  const isDark = colorScheme === 'dark';
  return {
    bg: isDark ? '#1C1C25' : '#F7F4F1',
    card: isDark ? '#15151E' : '#FFFFFF',
    cardBorder: isDark ? '#303037' : '#EAEAEA',
    red: '#E10600',
    teal: '#067E6A',
    tealLight: '#34D399',
    yellow: '#F59E0B',
    white: isDark ? '#FFFFFF' : '#1C1C25',
    textPrimary: isDark ? '#FFFFFF' : '#1C1C25',
    textSecondary: isDark ? '#AAAAAA' : '#58585B',
    textMuted: isDark ? '#58585B' : '#8A8A8E',
    inputBg: isDark ? '#15151E' : '#F2F2F7',
  };
}

// ─── Stat Card ──────────────────────────────────────────────────────────────
export function StatCard({ label, value, icon, color }: { label: string; value: string; icon: string; color?: string }) {
  const theme = useThemeColors();
  const activeColor = color || theme.red;
  return (
    <View style={[styles.statCard, { backgroundColor: theme.card, borderColor: theme.cardBorder, borderLeftColor: activeColor }]}>
      <View style={styles.statRow}>
        <MaterialIcons name={icon as any} size={20} color={activeColor} />
        <Text style={[styles.statLabel, { color: theme.textSecondary }]}>{label}</Text>
      </View>
      <Text style={[styles.statValue, { color: activeColor }]}>{value}</Text>
    </View>
  );
}

// ─── Section Header ─────────────────────────────────────────────────────────
export function SectionHeader({ title, onSeeAll }: { title: string; onSeeAll?: () => void }) {
  const theme = useThemeColors();
  return (
    <View style={styles.sectionHeader}>
      <Text style={[styles.sectionTitle, { color: theme.white }]}>{title}</Text>
      {onSeeAll && (
        <TouchableOpacity onPress={onSeeAll}>
          <Text style={[styles.seeAllText, { color: theme.red }]}>Xem tất cả →</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

// ─── Empty State ────────────────────────────────────────────────────────────
export function EmptyState({ icon, title, subtitle }: { icon: string; title: string; subtitle: string }) {
  const theme = useThemeColors();
  return (
    <View style={styles.emptyState}>
      <MaterialIcons name={icon as any} size={48} color={theme.textMuted} />
      <Text style={[styles.emptyTitle, { color: theme.white }]}>{title}</Text>
      <Text style={[styles.emptySubtitle, { color: theme.textMuted }]}>{subtitle}</Text>
    </View>
  );
}

// ─── Loading State ──────────────────────────────────────────────────────────
export function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  const theme = useThemeColors();
  return (
    <View style={styles.emptyState}>
      <MaterialIcons name="error-outline" size={48} color={theme.red} />
      <Text style={[styles.emptyTitle, { color: theme.white }]}>Khong tai duoc du lieu</Text>
      <Text selectable style={[styles.emptySubtitle, { color: theme.textMuted }]}>{message}</Text>
      <OutlineButton title="Thu lai" onPress={onRetry} color={theme.red} />
    </View>
  );
}

export function LoadingState() {
  const theme = useThemeColors();
  return (
    <View style={[styles.loadingState, { backgroundColor: theme.bg }]}>
      <ActivityIndicator size="large" color={theme.red} />
    </View>
  );
}

// ─── Status Badge ───────────────────────────────────────────────────────────
export function StatusBadge({ label, color }: { label: string; color: string }) {
  return (
    <View style={[styles.badge, { backgroundColor: color + '20', borderColor: color + '40' }]}>
      <Text style={[styles.badgeText, { color }]}>{label}</Text>
    </View>
  );
}

// ─── Card Container ─────────────────────────────────────────────────────────
export function Card({ children, style }: { children: React.ReactNode; style?: any }) {
  const theme = useThemeColors();
  return <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.cardBorder }, style]}>{children}</View>;
}

// ─── Primary Button ─────────────────────────────────────────────────────────
export function PrimaryButton({ title, onPress, loading, disabled, color }: {
  title: string; onPress: () => void; loading?: boolean; disabled?: boolean; color?: string;
}) {
  const theme = useThemeColors();
  const activeColor = color || theme.red;
  return (
    <TouchableOpacity
      style={[styles.primaryBtn, { backgroundColor: activeColor }, (disabled || loading) && styles.disabledBtn]}
      onPress={onPress}
      disabled={disabled || loading}
    >
      {loading ? (
        <ActivityIndicator color="#FFF" size="small" />
      ) : (
        <Text style={styles.primaryBtnText}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

// ─── Outline Button ─────────────────────────────────────────────────────────
export function OutlineButton({ title, onPress, color }: {
  title: string; onPress: () => void; color?: string;
}) {
  const theme = useThemeColors();
  const activeColor = color || theme.textSecondary;
  return (
    <TouchableOpacity style={[styles.outlineBtn, { borderColor: activeColor + '60' }]} onPress={onPress}>
      <Text style={[styles.outlineBtnText, { color: activeColor }]}>{title}</Text>
    </TouchableOpacity>
  );
}

// ─── List Item Card ─────────────────────────────────────────────────────────
export function ListItemCard({ title, subtitle, rightText, rightColor, onPress, icon }: {
  title: string; subtitle?: string; rightText?: string; rightColor?: string; onPress?: () => void; icon?: string;
}) {
  const theme = useThemeColors();
  const content = (
    <View style={[styles.listItem, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
      {icon && (
        <View style={[styles.listItemIcon, { backgroundColor: theme.red + '15' }]}>
          <MaterialIcons name={icon as any} size={20} color={theme.red} />
        </View>
      )}
      <View style={{ flex: 1 }}>
        <Text style={[styles.listItemTitle, { color: theme.white }]} numberOfLines={1}>{title}</Text>
        {subtitle && <Text style={[styles.listItemSubtitle, { color: theme.textSecondary }]} numberOfLines={1}>{subtitle}</Text>}
      </View>
      {rightText && (
        <StatusBadge label={rightText} color={rightColor || theme.textMuted} />
      )}
      {onPress && <MaterialIcons name="chevron-right" size={20} color={theme.textMuted} />}
    </View>
  );
  if (onPress) {
    return <TouchableOpacity onPress={onPress}>{content}</TouchableOpacity>;
  }
  return content;
}

// ─── Format Helpers ─────────────────────────────────────────────────────────
export function formatDate(dateStr?: string): string {
  if (!dateStr) return 'Chưa xác định';
  const d = new Date(dateStr);
  return d.toLocaleDateString('vi-VN');
}

export function formatDateTime(dateStr?: string): string {
  if (!dateStr) return 'Chưa xác định';
  const d = new Date(dateStr);
  return `${d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} ${d.toLocaleDateString('vi-VN')}`;
}

export function statusLabel(status: string): { label: string; color: string } {
  const map: Record<string, { label: string; color: string }> = {
    DRAFT: { label: 'Bản nháp', color: C.textMuted },
    OPEN_REGISTRATION: { label: 'Mở đăng ký', color: C.tealLight },
    CLOSED_REGISTRATION: { label: 'Đóng đăng ký', color: C.yellow },
    ONGOING: { label: 'Đang diễn ra', color: C.red },
    COMPLETED: { label: 'Đã kết thúc', color: C.textSecondary },
    CANCELLED: { label: 'Đã hủy', color: '#EF4444' },
    SCHEDULED: { label: 'Đã lên lịch', color: C.textSecondary },
    PENDING: { label: 'Chờ duyệt', color: C.yellow },
    CHECKING: { label: 'Đang kiểm tra', color: C.yellow },
    READY: { label: 'Sẵn sàng', color: C.tealLight },
    LIVE: { label: 'ĐANG ĐUA', color: C.red },
    FINISHED: { label: 'Hoàn thành', color: C.tealLight },
    RESULT_PUBLISHED: { label: 'Đã công bố', color: C.textSecondary },
    APPROVED: { label: 'Đã duyệt', color: C.tealLight },
    REJECTED: { label: 'Từ chối', color: '#EF4444' },
    ACCEPTED: { label: 'Đã nhận', color: C.tealLight },
    WON: { label: 'Thắng', color: C.tealLight },
    LOST: { label: 'Thua', color: '#EF4444' },
    PAID: { label: 'Đã trao', color: C.tealLight },
    active: { label: 'Hoạt động', color: C.tealLight },
    inactive: { label: 'Ngừng', color: C.textMuted },
    assigned: { label: 'Chờ duyệt', color: C.yellow },
    accepted: { label: 'Đã nhận', color: C.tealLight },
    declined: { label: 'Từ chối', color: '#EF4444' },
  };
  return map[status] || { label: status, color: C.textMuted };
}

const styles = StyleSheet.create({
  statCard: {
    borderWidth: 1,
    borderLeftWidth: 3,
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  statRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  statLabel: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  statValue: { fontSize: 24, fontWeight: '900', marginTop: 8 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 20, marginBottom: 12 },
  sectionTitle: { fontSize: 14, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 0.5 },
  seeAllText: { fontSize: 11, fontWeight: '700' },
  emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: 48, gap: 12 },
  emptyTitle: { fontSize: 14, fontWeight: '700' },
  emptySubtitle: { fontSize: 12, textAlign: 'center', maxWidth: 260 },
  loadingState: { flex: 1, alignItems: 'center', justifyContent: 'center', minHeight: 200 },
  badge: { borderWidth: 1, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  badgeText: { fontSize: 9, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.5 },
  card: { borderWidth: 1, borderRadius: 16, padding: 16, marginBottom: 12 },
  primaryBtn: { borderRadius: 24, height: 44, alignItems: 'center', justifyContent: 'center', marginTop: 8 },
  disabledBtn: { opacity: 0.5 },
  primaryBtnText: { color: '#FFF', fontSize: 13, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.5 },
  outlineBtn: { borderRadius: 24, height: 44, alignItems: 'center', justifyContent: 'center', borderWidth: 1, marginTop: 8 },
  outlineBtnText: { fontSize: 13, fontWeight: '700' },
  listItem: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: C.card, borderWidth: 1, borderColor: C.cardBorder, borderRadius: 12,
    padding: 14, marginBottom: 8,
  },
  listItemIcon: {
    width: 36, height: 36, borderRadius: 10, backgroundColor: C.red + '15',
    alignItems: 'center', justifyContent: 'center',
  },
  listItemTitle: { color: C.white, fontSize: 13, fontWeight: '700' },
  listItemSubtitle: { color: C.textSecondary, fontSize: 11, marginTop: 2 },
});
