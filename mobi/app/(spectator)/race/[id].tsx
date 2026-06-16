import React, { useEffect, useState, useCallback } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ActivityIndicator, SafeAreaView, ScrollView, TextInput, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { racesApi, registrationsApi, predictionsApi, walletApi, type RaceItem, type RegistrationItem } from '../../../lib/api-client';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { C, ErrorState } from '../../../components/ui/shared';

export default function SpectatorRaceDetail() {
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

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={C.red} />
        <Text style={styles.loadingText}>Đang tải chi tiết cuộc đua...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.loadingContainer}>
        <ErrorState message={error} onRetry={loadData} />
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={[styles.backButtonText, { marginTop: 20 }]}>QUAY LẠI</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!race) {
    return (
      <View style={styles.loadingContainer}>
        <MaterialIcons name="error-outline" size={48} color={C.red} />
        <Text style={styles.loadingText}>Không tìm thấy thông tin cuộc đua.</Text>
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
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <MaterialIcons name="arrow-back" size={20} color={C.white} />
          <Text style={styles.backButtonText}>QUAY LẠI LỊCH ĐUA</Text>
        </TouchableOpacity>

        <View style={styles.detailHeaderCard}>
          <Text style={styles.detailTourName}>{tourName?.toUpperCase()}</Text>
          <Text style={styles.detailRaceName}>{race.name.toUpperCase()}</Text>
          <Text style={styles.startTimeText}>Khởi tranh lúc: {startTimeStr}</Text>
        </View>

        <View style={styles.sectionContainer}>
          <View style={styles.walletHeader}>
            <Text style={styles.sectionTitle}>DỰ ĐOÁN CHIẾN MÃ CHIẾN THẮNG</Text>
            <Text style={styles.walletBalanceText}>Ví: <Text style={styles.redText}>{walletBalance} Pts</Text></Text>
          </View>

          {!isScheduled ? (
            <View style={{ paddingVertical: 20, alignItems: 'center' }}>
               <MaterialIcons name="lock-clock" size={32} color={C.textMuted} />
               <Text style={[styles.emptyTextSmall, { marginTop: 8 }]}>Đã đóng dự đoán.</Text>
            </View>
          ) : participants.length === 0 ? (
            <Text style={styles.emptyTextSmall}>Không có chiến mã nào đăng ký tham gia trận này.</Text>
          ) : (
            <>
              <Text style={styles.predictionInstructions}>Chọn một chiến mã và nhập điểm cược:</Text>
              
              <View style={styles.horseListContainer}>
                {participants.map((p) => {
                  const horse = p.horseId as any;
                  if (!horse) return null;
                  const isSelected = selectedHorseId === horse._id;
                  
                  return (
                    <TouchableOpacity 
                      key={horse._id} 
                      style={[styles.horseSelectCard, isSelected && styles.horseSelectCardActive]}
                      onPress={() => setSelectedHorseId(horse._id)}
                    >
                      <MaterialIcons 
                        name={isSelected ? "radio-button-checked" : "radio-button-unchecked"} 
                        size={18} 
                        color={isSelected ? C.red : C.textMuted} 
                      />
                      <View style={styles.horseSelectCardInfo}>
                        <Text style={[styles.horseSelectName, isSelected && styles.redText]}>{horse.name.toUpperCase()}</Text>
                        <Text style={styles.horseSelectBreed}>{horse.breed || 'Thuần chủng'}</Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <View style={styles.betInputRow}>
                <Text style={styles.betLabel}>SỐ ĐIỂM DỰ ĐOÁN:</Text>
                <TextInput
                  style={styles.betInput}
                  value={betPoints}
                  onChangeText={setBetPoints}
                  keyboardType="number-pad"
                  placeholder="nhập điểm"
                  placeholderTextColor={C.textMuted}
                />
              </View>

              <TouchableOpacity 
                style={[styles.predictSubmitButton, placingPrediction && styles.disabledButton]}
                onPress={handlePlacePrediction}
                disabled={placingPrediction}
              >
                {placingPrediction ? (
                  <ActivityIndicator color={C.white} size="small" />
                ) : (
                  <Text style={styles.predictSubmitButtonText}>XÁC NHẬN ĐẶT DỰ ĐOÁN</Text>
                )}
              </TouchableOpacity>
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  scrollContainer: { padding: 16 },
  loadingContainer: { flex: 1, backgroundColor: C.bg, alignItems: 'center', justifyContent: 'center' },
  loadingText: { color: C.textSecondary, fontSize: 14, marginTop: 12 },
  backButton: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 16, marginTop: 10 },
  backButtonText: { color: C.white, fontSize: 12, fontWeight: '800', letterSpacing: 0.5 },
  detailHeaderCard: { backgroundColor: C.card, borderWidth: 1, borderColor: C.cardBorder, borderRadius: 12, padding: 16, marginBottom: 16, alignItems: 'center' },
  detailTourName: { color: C.red, fontSize: 11, fontWeight: '800', marginBottom: 4 },
  detailRaceName: { color: C.white, fontSize: 18, fontWeight: '900', marginBottom: 10, textAlign: 'center' },
  startTimeText: { color: C.textSecondary, fontSize: 11, marginTop: 4 },
  sectionContainer: { backgroundColor: C.card, borderWidth: 1, borderColor: C.cardBorder, borderRadius: 12, padding: 16, marginBottom: 16 },
  sectionTitle: { color: C.white, fontSize: 12, fontWeight: '900', letterSpacing: 1, marginBottom: 12, borderLeftWidth: 2, borderLeftColor: C.red, paddingLeft: 8 },
  walletHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  walletBalanceText: { color: C.white, fontSize: 12, fontWeight: '800' },
  redText: { color: C.red },
  emptyTextSmall: { color: C.textSecondary, fontSize: 12, textAlign: 'center', paddingVertical: 12 },
  predictionInstructions: { color: C.textSecondary, fontSize: 12, marginBottom: 12 },
  horseListContainer: { gap: 8, marginBottom: 16 },
  horseSelectCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.inputBg, borderWidth: 1, borderColor: C.cardBorder, borderRadius: 8, padding: 12, gap: 10 },
  horseSelectCardActive: { borderColor: C.red, backgroundColor: 'rgba(225, 6, 0, 0.05)' },
  horseSelectCardInfo: { flex: 1 },
  horseSelectName: { color: C.white, fontSize: 13, fontWeight: '800' },
  horseSelectBreed: { color: C.textSecondary, fontSize: 11, marginTop: 2 },
  betInputRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, backgroundColor: C.inputBg, padding: 12, borderRadius: 8, borderWidth: 1, borderColor: C.cardBorder },
  betLabel: { color: C.white, fontSize: 11, fontWeight: '800' },
  betInput: { backgroundColor: C.bg, borderWidth: 1, borderColor: C.cardBorder, borderRadius: 6, color: C.white, fontSize: 14, fontWeight: '700', width: 100, height: 36, textAlign: 'right', paddingHorizontal: 10 },
  predictSubmitButton: { backgroundColor: C.red, borderRadius: 24, height: 44, alignItems: 'center', justifyContent: 'center' },
  disabledButton: { opacity: 0.5 },
  predictSubmitButtonText: { color: C.white, fontSize: 12, fontWeight: '800', letterSpacing: 0.5 },
});
