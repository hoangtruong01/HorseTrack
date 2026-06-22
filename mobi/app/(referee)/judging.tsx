import { usePremiumColors } from '@/components/ui/premium-tokens';
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import RefereeResults from './results';
import RefereeViolations from './violations';
import { C, useThemeColors } from '@/components/ui/shared';
import { Stack, Tabs } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColorScheme } from '@/hooks/use-color-scheme';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

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

  const [activeTab, setActiveTab] = useState<'results' | 'violations'>('results');

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <Tabs.Screen options={{ headerShown: false }} />

      <GridBackground isDark={isDark} />

      {/* Custom Sleek Header */}
      <View style={styles.customHeader}>
        <View style={styles.headerSpacer} />
        <Text style={styles.headerTitle}>THẨM ĐỊNH KẾT QUẢ</Text>
        <View style={styles.headerSpacer} />
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
        {activeTab === 'results' ? <RefereeResults /> : <RefereeViolations />}
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
  headerSpacer: {
    width: 36,
  },
  headerTitle: {
    color: theme.textPrimary,
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  segmentContainer: {
    flexDirection: 'row',
    backgroundColor: C.card,
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: C.cardBorder,
  },
  segmentBtn: {
    flex: 1,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: C.inputBg,
    marginHorizontal: 4,
  },
  segmentBtnActive: {
    backgroundColor: C.red,
  },
  segmentTxt: {
    color: C.textMuted,
    fontSize: 11,
    fontWeight: '800',
  },
  segmentTxtActive: {
    color: C.white,
  },
  content: {
    flex: 1,
  },
});
