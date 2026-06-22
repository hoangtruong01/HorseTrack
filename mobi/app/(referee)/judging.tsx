import { usePremiumColors } from '@/components/ui/premium-tokens';
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import RefereeResults from './results';
import RefereeViolations from './violations';
import { C } from '@/components/ui/shared';

export default function RefereeJudging() {
  const premiumColors = usePremiumColors();
  const styles = getStyles(premiumColors);

  const [activeTab, setActiveTab] = useState<'results' | 'violations'>('results');

  return (
    <View style={styles.container}>
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

const getStyles = (premiumColors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: C.bg,
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
