import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { usePremiumColors, premiumRadius, premiumSpacing } from '@/components/ui/premium-tokens';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useRouter } from 'expo-router';

interface WalletCardProps {
  balance: number;
}

export function WalletCard({ balance }: WalletCardProps) {
  const router = useRouter();
  const premiumColors = usePremiumColors();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <TouchableOpacity
      style={[
        styles.walletCard,
        {
          backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.03)',
          borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
        }
      ]}
      activeOpacity={0.8}
      onPress={() => router.push('/operations/wallet')}
    >
      <View style={styles.walletContent}>
        <View style={styles.walletHeader}>
          <MaterialIcons name="account-balance-wallet" size={20} color={premiumColors.brand} />
          <Text style={[styles.walletLabel, { color: premiumColors.textSecondary }]}>VÍ ĐIỂM THƯỞNG</Text>
        </View>
        <View style={styles.balanceRow}>
          <Text style={[styles.balanceValue, { color: premiumColors.text }]}>
            {balance.toLocaleString('vi-VN')}
          </Text>
          <Text style={[styles.balanceUnit, { color: premiumColors.brand }]}>PTS</Text>
        </View>
      </View>
      <View style={[styles.walletAction, { backgroundColor: premiumColors.brand }]}>
        <MaterialIcons name="add" size={24} color="#FFFFFF" />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  walletCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: premiumSpacing[20],
    borderRadius: premiumRadius[16],
    borderWidth: 1,
    marginHorizontal: premiumSpacing[16],
    marginBottom: premiumSpacing[24],
  },
  walletContent: {
    flex: 1,
  },
  walletHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: premiumSpacing[8],
  },
  walletLabel: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  balanceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  balanceValue: {
    fontSize: 28,
    fontWeight: '800',
  },
  balanceUnit: {
    fontSize: 14,
    fontWeight: '700',
  },
  walletAction: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#E10600',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  }
});
