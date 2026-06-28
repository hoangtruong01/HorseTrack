import React, { useEffect, useState, useCallback } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ActivityIndicator, TextInput, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { racesApi, registrationsApi, predictionsApi, walletApi, type RaceItem, type RegistrationItem } from '../../../lib/api-client';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { ErrorState } from '../../../components/ui/shared';
import { AppScreen } from '@/components/ui/premium';
import { premiumColors, premiumSpacing, premiumRadius, usePremiumColors } from '@/components/ui/premium-tokens';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColorScheme } from 'react-native';
import { useThemeColors } from '@/components/ui/shared';

export default function SpectatorRaceDetail() {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = useThemeColors();
  const pc = usePremiumColors();
  const styles = React.useMemo(() => getStyles(isDark, theme, insets, pc), [isDark, theme, insets, pc]);

  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const [race, setRace] = useState<RaceItem | null>(null);
  const [participants, setParticipants] = useState<RegistrationItem[]>([]);
  const [walletBalance, setWalletBalance] = useState(0);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedHorseId, setSelectedHorseId] = useState('');
  const [betPoints, setBetPoints] = useState('10');
  const [placingPrediction, setPlacingPrediction] = useState(false);

  const loadData = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const raceRes = await racesApi.get(id);
      if (raceRes) setRace(raceRes);

      const regRes = await registrationsApi.list({ raceId: id, status: 'APPROVED' });
      if (regRes && regRes.data) {
        setParticipants(regRes.data);
      }

      const walletRes = await walletApi.myHistory();
      setWalletBalance(walletRes.points ?? 0);
    } catch (err: any) {
      console.error('Lỗi tải chi tiết trận đua:', err);
      setError(err.message || 'Lỗi tải chi tiết trận đua.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handlePlacePrediction = async () => {
    if (!race) return;
    if (!selectedHorseId) {
      Alert.alert('Lỗi', 'Vui lòng chọn một chiến mã.');
      return;
    }
    
    const points = parseInt(betPoints, 10);
    if (isNaN(points) || points <= 0) {
      Alert.alert('Lỗi', 'Số điểm cược không hợp lệ.');
      return;
    }

    // EXACT VALIDATION PRESERVATION
    if (walletBalance === 0) {
      if (points !== 1) {
        Alert.alert('Lỗi', 'Tài khoản 0 Pts chỉ được cược đúng 1 điểm (miễn phí).');
        return;
      }
    } else {
      if (points < 2) {
        Alert.alert('Lỗi', 'Tối thiểu 2 điểm cho mỗi lần cược.');
        return;
      }
      if (points > walletBalance) {
        Alert.alert('Lỗi', `Số dư không đủ. Tối đa ${walletBalance} Pts.`);
        return;
      }
    }

    setPlacingPrediction(true);
    try {
      await predictionsApi.create({
        raceId: race._id,
        predictedHorseId: selectedHorseId,
        betPoints: points,
      });
      Alert.alert('Thành công', 'Đặt dự đoán kết quả thành công!', [
        { text: 'OK', onPress: () => router.push('/(spectator)/predictions') }
      ]);
    } catch (err: any) {
      Alert.alert('Lỗi', 'Không thể tạo dự đoán. Vui lòng thử lại.');
    } finally {
      setPlacingPrediction(false);
    }
  };

  // PRESERVE Exact error / fail behavior
  if (loading) {
    return (
      <View style={styles.failContainer}>
        <ActivityIndicator size="large" color={premiumColors.brand} />
        <Text style={styles.failText}>Đang tải chi tiết cuộc đua...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.failContainer}>
        <ErrorState message={error} onRetry={loadData} />
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={[styles.backButtonText, { marginTop: 20 }]}>QUAY LẠI</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!race) {
    return (
      <View style={styles.failContainer}>
        <MaterialIcons name="error-outline" size={48} color={premiumColors.brand} />
        <Text style={styles.failText}>Không tìm thấy thông tin cuộc đua.</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={[styles.backButtonText, { marginTop: 20 }]}>QUAY LẠI</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const isScheduled = ['SCHEDULED', 'CHECKING', 'READY'].includes(race.status);
  const tourName = typeof race.tournamentId === 'object' ? race.tournamentId?.name : 'Giải đấu lẻ';
  const startTimeStr = new Date(race.startTime).toLocaleString('vi-VN');

  return (
    <AppScreen scroll>
      <View style={styles.content}>
        
        <TouchableOpacity style={styles.navBack} onPress={() => router.back()}>
          <MaterialIcons name="arrow-back" size={20} color={premiumColors.textMuted} />
          <Text style={styles.navBackText}>QUAY LẠI LỊCH ĐUA</Text>
        </TouchableOpacity>

        <View style={styles.header}>
          <Text style={styles.eyebrow}>{tourName?.toUpperCase()}</Text>
          <Text style={styles.title}>{race.name.toUpperCase()}</Text>
          <View style={styles.accentLine} />
          <Text style={styles.subtitle}>Khởi tranh lúc: {startTimeStr}</Text>
        </View>

        <View style={styles.cardContainer}>
          <View style={styles.walletHeader}>
            <Text style={styles.walletTitle}>DỰ ĐOÁN KẾT QUẢ</Text>
            <View style={styles.walletBadge}>
              <Text style={styles.walletBadgeText}>Ví: {walletBalance} Pts</Text>
            </View>
          </View>

          {!isScheduled ? (
            <View style={styles.emptyStateContainer}>
               <MaterialIcons name="lock-clock" size={32} color={premiumColors.textMuted} />
               <Text style={styles.emptyStateText}>Đã đóng dự đoán.</Text>
            </View>
          ) : participants.length === 0 ? (
            <View style={styles.emptyStateContainer}>
               <Text style={styles.emptyStateText}>Không có chiến mã nào đăng ký tham gia trận này.</Text>
            </View>
          ) : (
            <View style={styles.formContent}>
              <Text style={styles.instruction}>Chọn một chiến mã và nhập điểm dự đoán:</Text>
              
              <View style={styles.optionsList}>
                {participants.map((p) => {
                  const horse = p.horseId as any;
                  if (!horse) return null;
                  const isSelected = selectedHorseId === horse._id;
                  
                  return (
                    <TouchableOpacity 
                      key={horse._id} 
                      style={[styles.radioCard, isSelected && styles.radioCardSelected]}
                      onPress={() => setSelectedHorseId(horse._id)}
                      activeOpacity={0.7}
                    >
                      <MaterialIcons 
                        name={isSelected ? "radio-button-checked" : "radio-button-unchecked"} 
                        size={20} 
                        color={isSelected ? premiumColors.brand : premiumColors.textMuted} 
                      />
                      <View style={styles.radioInfo}>
                        <Text style={[styles.radioName, isSelected && styles.radioNameSelected]}>{horse.name.toUpperCase()}</Text>
                        <Text style={styles.radioBreed}>{horse.breed || 'Thuần chủng'}</Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>SỐ ĐIỂM DỰ ĐOÁN:</Text>
                <TextInput
                  style={styles.input}
                  value={betPoints}
                  onChangeText={setBetPoints}
                  keyboardType="number-pad"
                  placeholder="nhập điểm"
                  placeholderTextColor={premiumColors.textMuted}
                />
              </View>

              <TouchableOpacity 
                style={[styles.primaryBtn, placingPrediction && styles.primaryBtnDisabled]} 
                onPress={handlePlacePrediction}
                disabled={placingPrediction}
                activeOpacity={0.8}
              >
                {placingPrediction ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={styles.primaryBtnText}>GỬI DỰ ĐOÁN</Text>
                )}
              </TouchableOpacity>
            </View>
          )}
        </View>

      </View>
    </AppScreen>
  );
}

const getStyles = (isDark: boolean, theme: any, insets: any, pc: any) => StyleSheet.create({
  content: {
    paddingHorizontal: premiumSpacing[16],
    paddingTop: premiumSpacing[24],
    paddingBottom: premiumSpacing[48],
  },
  
  // ── Error & Fallbacks ──
  failContainer: {
    flex: 1,
    backgroundColor: pc.bg,
    alignItems: 'center',
    justifyContent: 'center',
    padding: premiumSpacing[24],
  },
  failText: {
    color: pc.text,
    fontSize: 14,
    marginTop: premiumSpacing[16],
  },
  backButton: {
    marginTop: premiumSpacing[16],
  },
  backButtonText: {
    color: pc.brand,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1,
  },

  // ── Navigation ──
  navBack: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: premiumSpacing[24],
  },
  navBackText: {
    color: pc.textMuted,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
  },

  // ── Header ──
  header: {
    marginBottom: premiumSpacing[32],
  },
  eyebrow: {
    fontSize: 11,
    fontWeight: '700',
    color: pc.brand,
    letterSpacing: 1,
    marginBottom: premiumSpacing[8],
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: pc.text,
    marginBottom: premiumSpacing[8],
  },
  accentLine: {
    width: 36,
    height: 3,
    backgroundColor: pc.brand,
    borderRadius: 2,
    marginBottom: premiumSpacing[12],
  },
  subtitle: {
    fontSize: 14,
    color: pc.textSecondary,
    lineHeight: 20,
  },

  // ── Form Card ──
  cardContainer: {
    backgroundColor: pc.surface,
    borderRadius: premiumRadius[12],
    borderWidth: 1,
    borderColor: pc.border,
    overflow: 'hidden',
    paddingBottom: premiumSpacing[24],
  },
  walletHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: premiumSpacing[16],
    borderBottomWidth: 1,
    borderBottomColor: pc.border,
    backgroundColor: pc.surface2,
  },
  walletTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: pc.text,
    letterSpacing: 0.5,
  },
  walletBadge: {
    backgroundColor: pc.brand + '20',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: pc.brand + '50',
  },
  walletBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: pc.brand,
  },

  // ── Empty / Blocked state ──
  emptyStateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: premiumSpacing[32],
    gap: premiumSpacing[12],
  },
  emptyStateText: {
    fontSize: 13,
    color: pc.textMuted,
    textAlign: 'center',
  },

  // ── Form content ──
  formContent: {
    padding: premiumSpacing[16],
  },
  instruction: {
    fontSize: 13,
    color: pc.textSecondary,
    marginBottom: premiumSpacing[16],
  },
  optionsList: {
    gap: premiumSpacing[12],
    marginBottom: premiumSpacing[24],
  },
  radioCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: premiumSpacing[16],
    borderRadius: premiumRadius[8],
    borderWidth: 1,
    borderColor: pc.border,
    backgroundColor: pc.surface2,
    gap: premiumSpacing[12],
  },
  radioCardSelected: {
    borderColor: pc.brand,
    backgroundColor: pc.brand + '10',
  },
  radioInfo: {
    flex: 1,
  },
  radioName: {
    fontSize: 14,
    fontWeight: '700',
    color: pc.text,
    marginBottom: 4,
  },
  radioNameSelected: {
    color: pc.brand,
  },
  radioBreed: {
    fontSize: 12,
    color: pc.textMuted,
  },
  
  // ── Input ──
  inputGroup: {
    marginBottom: premiumSpacing[24],
  },
  inputLabel: {
    color: pc.textSecondary,
    fontSize: 11,
    fontWeight: '700',
    marginBottom: premiumSpacing[8],
    letterSpacing: 1,
  },
  input: {
    backgroundColor: pc.surface2,
    borderWidth: 1,
    borderColor: pc.border,
    borderRadius: premiumRadius[8],
    paddingHorizontal: premiumSpacing[16],
    height: 52,
    fontSize: 14,
    color: pc.text,
  },

  // ── CTA ──
  primaryBtn: {
    backgroundColor: pc.brand,
    borderRadius: premiumRadius[8],
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBtnDisabled: {
    backgroundColor: pc.surface2,
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 1,
  },
});
