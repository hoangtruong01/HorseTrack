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
}

export function SleekHeader({ title, showWallet = true }: SleekHeaderProps) {
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

        <View style={styles.headerLeft} />
        
        <View style={styles.headerRight}>
          {showWallet && (
            <TouchableOpacity 
              style={[
                styles.walletBtn,
                { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)' }
              ]} 
              onPress={() => router.push('/(owner)/wallet')}
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
    fontWeight: '700',
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
});
