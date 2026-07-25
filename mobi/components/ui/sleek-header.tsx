import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter, Stack, Tabs } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useThemeColors } from '@/components/ui/shared';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { rewardPointLedgerApi } from '@/lib/api-client';

interface SleekHeaderProps {
  title: string;
  showWallet?: boolean;
  rightIcon?: keyof typeof MaterialIcons.glyphMap;
  onRightPress?: () => void;
  hasNotification?: boolean;
  showBack?: boolean;
  onBack?: () => void;
}

export function SleekHeader({ title, showWallet = true, rightIcon, onRightPress, hasNotification, showBack, onBack }: SleekHeaderProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = useThemeColors();
  const [balance, setBalance] = useState<number>(0);

  useEffect(() => {
    if (showWallet) {
      rewardPointLedgerApi.myBalance()
        .then((res: any) => {
          setBalance(res.balance || 0);
        })
        .catch((err) => {
          console.error('Lỗi tải số dư ví ở header:', err);
        });
    }
  }, [showWallet]);

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <Tabs.Screen options={{ headerShown: false }} />

      <View style={[
        styles.customHeader,
        {
          paddingTop: Math.max(insets.top, 16),
          minHeight: Math.max(insets.top, 16) + 48,
          backgroundColor: isDark ? 'rgba(9, 9, 11, 0.85)' : 'rgba(255, 255, 255, 0.85)',
          borderBottomColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
        }
      ]}>
        {/* Title center absolute */}
        <View style={[StyleSheet.absoluteFill, { paddingTop: Math.max(insets.top, 16), paddingBottom: 12 }]} pointerEvents="none">
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text style={[styles.headerTitleText, { color: theme.textPrimary }]}>{title}</Text>
          </View>
        </View>

        <View style={styles.headerLeft}>
          {showBack && (
            <TouchableOpacity
              style={[
                styles.backBtn,
                { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)' }
              ]}
              onPress={() => onBack ? onBack() : router.back()}
              activeOpacity={0.8}
            >
              <MaterialIcons name="arrow-back" size={20} color={theme.textPrimary} />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.headerRight}>
          {rightIcon && (
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={onRightPress}
              activeOpacity={0.8}
            >
              <MaterialIcons name={rightIcon} size={22} color={theme.textPrimary} />
              {hasNotification && <View style={styles.notificationBadge} />}
            </TouchableOpacity>
          )}
          {showWallet && (
            <TouchableOpacity
              style={[
                styles.walletBtn,
                { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)' }
              ]}
              onPress={() => router.push('/operations/wallet')}
              activeOpacity={0.8}
            >
              <MaterialIcons name="account-balance-wallet" size={16} color={theme.textPrimary} />
              <Text style={[styles.walletText, { color: theme.textPrimary }]}>
                {balance.toLocaleString()}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  customHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    zIndex: 10,
  },
  headerLeft: {
    flex: 1,
    alignItems: 'flex-start',
  },
  headerRight: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 8,
  },
  headerTitleText: {
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  walletBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
    justifyContent: 'center',
  },
  walletText: {
    fontSize: 13,
    fontWeight: '800',
  },
  actionBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
    borderWidth: 1.5,
    borderColor: '#FFF',
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
