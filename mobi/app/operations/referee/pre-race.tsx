import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, ActivityIndicator, Alert, TextInput, SafeAreaView, Platform } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { raceChecksApi, racesApi, type RaceItem } from '../../../lib/api-client';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

export default function PreRaceChecksScreen() {
  const { raceId } = useLocalSearchParams<{ raceId: string }>();
  
  const [race, setRace] = useState<RaceItem | null>(null);
  const [checks, setChecks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Failure note state per check item ID
  const [failNotes, setFailNotes] = useState<Record<string, string>>({});
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const loadData = async () => {
    if (!raceId) return;
    try {
      // 1. Load race detail
      const raceRes = await racesApi.get(raceId);
      if (raceRes) setRace(raceRes);

      // 2. Load pre-race check items
      const checksRes = await raceChecksApi.listByRace(raceId);
      if (checksRes) {
        setChecks(checksRes.data || checksRes);
      }
    } catch (err) {
      console.error('Lỗi tải kiểm duyệt trước đua:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [raceId]);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleUpdateCheck = async (checkId: string, status: 'passed' | 'failed') => {
    const notes = status === 'failed' ? failNotes[checkId] || 'Không đạt chuẩn sức khỏe' : undefined;
    
    setUpdatingId(checkId);
    try {
      await raceChecksApi.update(checkId, status, notes);
      Alert.alert('Thành công', `Đã cập nhật trạng thái kiểm tra thành ${status === 'passed' ? 'ĐẠT' : 'KHÔNG ĐẠT'}.`);
      loadData();
    } catch (err: any) {
      Alert.alert('Thất bại', err.message || 'Lỗi cập nhật trạng thái.');
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'passed': return 'ĐẠT CHUẨN';
      case 'failed': return 'BỊ LOẠI';
      default: return 'CHƯA KIỂM TRA';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'passed': return '#067E6A';
      case 'failed': return '#E10600';
      default: return '#58585B';
    }
  };

  const renderItem = ({ item }: { item: any }) => {
    const horse = item.horseId;
    if (!horse) return null;
    const isUpdating = updatingId === item._id;

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View>
            <Text style={styles.horseName}>{horse.name.toUpperCase()}</Text>
            <Text style={styles.breedText}>{horse.breed || 'Thuần chủng'}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
            <Text style={styles.statusBadgeText}>{getStatusText(item.status)}</Text>
          </View>
        </View>

        <View style={styles.cardBody}>
          <Text style={styles.bodyText}>Nài ngựa (Jockey): <Text style={styles.whiteBold}>{item.jockeyUserId?.fullName || 'Chưa gán'}</Text></Text>
          {item.notes && (
            <Text style={styles.bodyText}>Ghi chú trước: <Text style={styles.noteText}>{item.notes}</Text></Text>
          )}
        </View>

        {isUpdating ? (
          <ActivityIndicator color="#E10600" style={{ marginVertical: 10 }} />
        ) : (
          <View style={styles.actionsBox}>
            {item.status !== 'passed' && (
              <TouchableOpacity 
                style={[styles.actionButton, styles.passedButton]}
                onPress={() => handleUpdateCheck(item._id, 'passed')}
              >
                <MaterialIcons name="check-circle" size={16} color="#FFFFFF" />
                <Text style={styles.actionText}>ĐẠT CHUẨN</Text>
              </TouchableOpacity>
            )}

            {item.status !== 'failed' && (
              <View style={styles.failActionContainer}>
                <TextInput
                  style={styles.notesInput}
                  value={failNotes[item._id] || ''}
                  onChangeText={(txt) => setFailNotes({ ...failNotes, [item._id]: txt })}
                  placeholder="Lý do loại..."
                  placeholderTextColor="#58585B"
                />
                <TouchableOpacity 
                  style={[styles.actionButton, styles.failedButton]}
                  onPress={() => handleUpdateCheck(item._id, 'failed')}
                >
                  <MaterialIcons name="cancel" size={16} color="#FFFFFF" />
                  <Text style={styles.actionText}>LOẠI</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#E10600" />
        <Text style={styles.loadingText}>Đang tải danh sách điểm danh...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {race && (
        <View style={styles.raceHeaderCard}>
          <Text style={styles.raceTitle}>{race.name.toUpperCase()}</Text>
          <Text style={styles.raceSub}>Hãy rà soát kỹ lưỡng trạng thái chấn thương của ngựa và thông tin nài ngựa trước giờ đua.</Text>
        </View>
      )}

      <FlatList
        data={checks}
        renderItem={renderItem}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContent}
        onRefresh={onRefresh}
        refreshing={refreshing}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialIcons name="pets" size={40} color="#58585B" />
            <Text style={styles.emptyText}>Chưa chốt danh sách chiến mã cho cuộc đua này.</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1C1C25',
  },
  listContent: {
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#1C1C25',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: '#AAAAAA',
    fontSize: 14,
    marginTop: 12,
  },
  raceHeaderCard: {
    backgroundColor: '#15151E',
    borderBottomWidth: 1,
    borderBottomColor: '#303037',
    padding: 16,
  },
  raceTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '900',
    fontFamily: Platform.OS === 'ios' ? 'HelveticaNeue-CondensedBold' : 'sans-serif-condensed',
  },
  raceSub: {
    color: '#AAAAAA',
    fontSize: 11,
    marginTop: 4,
    lineHeight: 14,
  },
  card: {
    backgroundColor: '#15151E',
    borderWidth: 1,
    borderColor: '#303037',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottomWidth: 1,
    borderBottomColor: '#1C1C25',
    paddingBottom: 10,
    marginBottom: 10,
  },
  horseName: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
  },
  breedText: {
    color: '#AAAAAA',
    fontSize: 11,
    marginTop: 2,
  },
  statusBadge: {
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  statusBadgeText: {
    color: '#FFFFFF',
    fontSize: 8,
    fontWeight: '900',
  },
  cardBody: {
    gap: 4,
    marginBottom: 14,
  },
  bodyText: {
    color: '#AAAAAA',
    fontSize: 12,
  },
  whiteBold: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  noteText: {
    color: '#E1A200',
    fontStyle: 'italic',
  },
  actionsBox: {
    borderTopWidth: 1,
    borderTopColor: '#1C1C25',
    paddingTop: 12,
    gap: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    height: 34,
    borderRadius: 6,
  },
  passedButton: {
    backgroundColor: '#067E6A',
  },
  failedButton: {
    backgroundColor: '#E10600',
    paddingHorizontal: 12,
  },
  actionText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  failActionContainer: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  notesInput: {
    flex: 1,
    backgroundColor: '#1C1C25',
    borderWidth: 1,
    borderColor: '#303037',
    borderRadius: 6,
    height: 34,
    paddingHorizontal: 10,
    color: '#FFFFFF',
    fontSize: 12,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyText: {
    color: '#AAAAAA',
    fontSize: 13,
    marginTop: 12,
  },
});
