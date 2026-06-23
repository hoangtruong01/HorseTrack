import { premiumColors as defaultPremiumColors, premiumRadius, usePremiumColors } from '@/components/ui/premium-tokens';
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import RefereeResults from './results';
import RefereeViolations from './violations';
import { useThemeColors } from '@/components/ui/shared';
import { Stack, Tabs, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColorScheme } from '@/hooks/use-color-scheme';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { rewardPointLedgerApi } from '@/lib/api-client';

// Background Pattern
const GridBackground = ({ isDark }: { isDark: boolean }) => {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <View style={{ flex: 1, backgroundColor: isDark ? '#09090B' : '#F4F4F5' }} />
    </View>
  );
};

export default function RefereeJudging() {
  const premiumColors = usePremiumColors();
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = useThemeColors();
  const styles = React.useMemo(() => getStyles(isDark, theme, insets, premiumColors), [isDark, theme, insets, premiumColors]);

  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'results' | 'violations'>('results');
  const [balance, setBalance] = useState(0);

  React.useEffect(() => {
    rewardPointLedgerApi.myBalance()
      .then((res: any) => setBalance(res.balance || 0))
      .catch(() => { });
  }, []);

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <Tabs.Screen options={{ headerShown: false }} />

      <GridBackground isDark={isDark} />

      {/* Custom Sleek Header */}
      <View style={styles.customHeader}>
        <View style={[StyleSheet.absoluteFill, { paddingTop: Math.max(insets.top, 16), paddingBottom: 12 }]} pointerEvents="none">
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text style={styles.headerTitle}>GIÁM ĐỊNH</Text>
          </View>
        </View>
        <View style={styles.headerLeft} />
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.headerWallet} activeOpacity={0.8} onPress={() => router.push('/operations/referee/wallet')}>
            <MaterialIcons name="account-balance-wallet" size={16} color={theme.textPrimary} />
            <Text style={styles.headerWalletText}>{balance.toLocaleString()}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Segmented Control */}
      <View style={styles.segmentContainer}>
        <TouchableOpacity
          style={[styles.segmentBtn, activeTab === 'results' && styles.segmentBtnActive]}
          onPress={() => setActiveTab('results')}
        >
          <Text style={[styles.segmentTxt, activeTab === 'results' && styles.segmentTxtActive]}>
            KẾT QUẢ TRẬN ĐUA
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.segmentBtn, activeTab === 'violations' && styles.segmentBtnActive]}
          onPress={() => setActiveTab('violations')}
        >
          <Text style={[styles.segmentTxt, activeTab === 'violations' && styles.segmentTxtActive]}>
            GHI NHẬN VI PHẠM
          </Text>
        </TouchableOpacity>
      </View>

      {/* Main Content */}
      <View style={styles.content}>
        {activeTab === 'results' ? <RefereeResults nested /> : <RefereeViolations nested />}
      </View>
    </View>
  );
}

const getStyles = (isDark: boolean, theme: any, insets: any, premiumColors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: isDark ? '#09090B' : '#F4F4F5',
  },
  // Custom Header
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
  headerLeft: {
    flex: 1,
    alignItems: 'flex-start',
  },
  headerRight: {
    flex: 1,
    alignItems: 'flex-end',
  },
  headerTitle: {
    color: theme.textPrimary,
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  headerWallet: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
    minWidth: 36,
    justifyContent: 'center',
  },
  headerWalletText: {
    color: theme.textPrimary,
    fontSize: 13,
    fontWeight: '800',
  },
  segmentContainer: {
    flexDirection: 'row',
    backgroundColor: isDark ? 'rgba(9, 9, 11, 0.85)' : 'rgba(244, 244, 245, 0.85)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: premiumColors.borderSoft || premiumColors.border,
    zIndex: 10,
  },
  segmentBtn: {
    flex: 1,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: premiumRadius[12],
    backgroundColor: premiumColors.surface2,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: premiumColors.border,
  },
  segmentBtnActive: {
    backgroundColor: 'rgba(225, 6, 0, 0.1)',
    borderColor: premiumColors.brand,
  },
  segmentTxt: {
    color: premiumColors.textSecondary,
    fontSize: 12,
    fontWeight: '700',
  },
  segmentTxtActive: {
    color: premiumColors.brand,
    fontWeight: '800',
  },
  content: {
    flex: 1,
  },
});
