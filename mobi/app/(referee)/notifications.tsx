import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, RefreshControl, Alert } from 'react-native';
import { usePremiumColors, premiumSpacing, premiumRadius } from '@/components/ui/premium-tokens';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useThemeColors, EmptyState, LoadingState } from '@/components/ui/shared';
import { Stack, Tabs } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { notificationsApi } from '@/lib/api-client';

const GridBackground = ({ isDark }: { isDark: boolean }) => {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <View style={{ flex: 1, backgroundColor: isDark ? '#09090B' : '#F4F4F5' }} />
    </View>
  );
};

export default function NotificationsScreen() {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = useThemeColors();
  const premiumColors = usePremiumColors();
  const styles = React.useMemo(() => getStyles(isDark, theme, insets, premiumColors), [isDark, theme, insets, premiumColors]);

  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const res = await notificationsApi.list();
      setNotifications((res as any).data || res || []);
    } catch (err: any) {
      console.error('Lỗi tải thông báo:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [loadData]);

  const handleMarkAsRead = async (item: any) => {
    if (item.isRead) return;
    try {
      await notificationsApi.markAsRead(item._id || item.id);
      setNotifications(prev => prev.map(n => 
        (n._id || n.id) === (item._id || item.id) ? { ...n, isRead: true } : n
      ));
    } catch (err: any) {
      Alert.alert('Lỗi', 'Không thể đánh dấu đã đọc.');
    }
  };

  const handleReadAll = async () => {
    const hasUnread = notifications.some(n => !n.isRead);
    if (!hasUnread) return;
    try {
      await notificationsApi.readAll();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (err: any) {
      Alert.alert('Lỗi', 'Không thể đánh dấu đã đọc tất cả.');
    }
  };

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity 
      style={[styles.notificationCard, !item.isRead && styles.notificationCardUnread]} 
      onPress={() => handleMarkAsRead(item)}
      activeOpacity={0.8}
    >
      <View style={styles.iconContainer}>
        <MaterialIcons 
          name={!item.isRead ? "notifications-active" : "notifications"} 
          size={24} 
          color={!item.isRead ? premiumColors.brand : premiumColors.textMuted} 
        />
      </View>
      <View style={styles.cardContent}>
        <Text style={[styles.cardTitle, !item.isRead && styles.cardTitleUnread]}>
          {item.title || 'Thông báo'}
        </Text>
        <Text style={styles.cardMessage} numberOfLines={2}>
          {item.message || item.body || ''}
        </Text>
        {item.createdAt && (
          <Text style={styles.cardTime}>
            {new Date(item.createdAt).toLocaleString('vi-VN')}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );

  if (loading && !refreshing) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />
        <Tabs.Screen options={{ headerShown: false }} />
        <GridBackground isDark={isDark} />
        <View style={styles.customHeader}>
          <View style={styles.headerSpacer} />
          <Text style={styles.headerTitle}>THÔNG BÁO</Text>
          <View style={styles.headerSpacer} />
        </View>
        <LoadingState />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <Tabs.Screen options={{ headerShown: false }} />
      <GridBackground isDark={isDark} />

      {/* Custom Sleek Header */}
      <View style={styles.customHeader}>
        <View style={styles.headerSpacer} />
        <Text style={styles.headerTitle}>THÔNG BÁO</Text>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.actionsBar}>
        <TouchableOpacity style={styles.readAllAction} onPress={handleReadAll} activeOpacity={0.8}>
          <MaterialIcons name="done-all" size={16} color={premiumColors.brand} />
          <Text style={styles.readAllActionText}>Đánh dấu đã đọc tất cả</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={notifications}
        keyExtractor={(item) => item._id || item.id || Math.random().toString()}
        contentContainerStyle={styles.listContent}
        renderItem={renderItem}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={premiumColors.brand} />}
        ListEmptyComponent={
          <EmptyState 
            icon="notifications-none" 
            title="Không có thông báo mới" 
            subtitle="Tất cả thông báo về phân công, trận đua sẽ xuất hiện tại đây." 
          />
        }
      />
    </View>
  );
}

const getStyles = (isDark: boolean, theme: any, insets: any, premiumColors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: isDark ? '#09090B' : '#F4F4F5',
  },
  customHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Math.max(insets.top, 16),
    paddingBottom: 12,
    zIndex: 10,
    backgroundColor: isDark ? 'rgba(9, 9, 11, 0.85)' : 'rgba(244, 244, 245, 0.85)',
  },
  headerSpacer: {
    width: 36,
  },
  headerTitle: {
    color: theme.textPrimary,
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  actionsBar: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 4,
  },
  readAllAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: isDark ? 'rgba(225, 6, 0, 0.1)' : 'rgba(225, 6, 0, 0.05)',
    borderRadius: premiumRadius[8],
    borderWidth: 1,
    borderColor: isDark ? 'rgba(225, 6, 0, 0.2)' : 'rgba(225, 6, 0, 0.1)',
  },
  readAllActionText: {
    color: premiumColors.brand,
    fontSize: 12,
    fontWeight: '700',
  },
  listContent: {
    padding: premiumSpacing[16],
    paddingBottom: 100,
  },
  notificationCard: {
    flexDirection: 'row',
    backgroundColor: isDark ? 'rgba(255,255,255,0.02)' : '#F9FAFB',
    borderRadius: premiumRadius[12],
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
  },
  notificationCardUnread: {
    backgroundColor: isDark ? 'rgba(225, 6, 0, 0.1)' : 'rgba(225, 6, 0, 0.05)',
    borderColor: isDark ? 'rgba(225, 6, 0, 0.3)' : 'rgba(225, 6, 0, 0.2)',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: premiumRadius[8],
    backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.textPrimary,
    marginBottom: 4,
  },
  cardTitleUnread: {
    fontWeight: '800',
  },
  cardMessage: {
    fontSize: 13,
    color: theme.textSecondary,
    marginBottom: 6,
    lineHeight: 18,
  },
  cardTime: {
    fontSize: 11,
    color: premiumColors.textMuted,
  },
});
