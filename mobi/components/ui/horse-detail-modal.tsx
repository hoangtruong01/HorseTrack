import React, { useEffect, useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Dimensions,
  ScrollView
} from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { horsesApi } from '@/lib/api-client';
import { premiumColors, premiumSpacing, premiumRadius } from './premium-tokens';

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');

interface HorseDetailModalProps {
  visible: boolean;
  onClose: () => void;
  horseId: string | null;
}

export function HorseDetailModal({ visible, onClose, horseId }: HorseDetailModalProps) {
  const [loading, setLoading] = useState(false);
  const [horse, setHorse] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (visible && horseId) {
      loadHorse();
    } else {
      setHorse(null);
      setError(null);
    }
  }, [visible, horseId]);

  const loadHorse = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await horsesApi.get(horseId!);
      setHorse((res as any).data || res);
    } catch (err: any) {
      setError('Không thể tải thông tin chiến mã.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.dragIndicator} />
            <View style={styles.headerTitleContainer}>
              <Text style={styles.title}>CHI TIẾT CHIẾN MÃ</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                <MaterialIcons name="close" size={24} color={premiumColors.textSecondary} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Content */}
          <ScrollView contentContainerStyle={styles.content}>
            {loading ? (
              <View style={styles.centerBox}>
                <ActivityIndicator size="large" color={premiumColors.brand} />
              </View>
            ) : error ? (
              <View style={styles.centerBox}>
                <MaterialIcons name="error-outline" size={48} color={premiumColors.danger} />
                <Text style={styles.errorText}>{error}</Text>
                <TouchableOpacity style={styles.retryBtn} onPress={loadHorse}>
                  <Text style={styles.retryBtnText}>Thử lại</Text>
                </TouchableOpacity>
              </View>
            ) : horse ? (
              <View>
                {/* Avatar / Image */}
                <View style={styles.imageContainer}>
                  {horse.avatar ? (
                    <Image source={{ uri: horse.avatar }} style={styles.avatar} />
                  ) : (
                    <View style={styles.placeholderAvatar}>
                      <MaterialIcons name="pets" size={48} color={premiumColors.textMuted} />
                    </View>
                  )}
                  <View style={styles.nameBadge}>
                    <Text style={styles.horseName}>{horse.name.toUpperCase()}</Text>
                  </View>
                </View>

                {/* Stats Grid */}
                <View style={styles.statsGrid}>
                  <View style={styles.statBox}>
                    <Text style={styles.statLabel}>Giống</Text>
                    <Text style={styles.statValue} numberOfLines={1}>{horse.breed || 'Không rõ'}</Text>
                  </View>
                  <View style={styles.statBox}>
                    <Text style={styles.statLabel}>Màu sắc</Text>
                    <Text style={styles.statValue}>{horse.color || 'Không rõ'}</Text>
                  </View>
                  <View style={styles.statBox}>
                    <Text style={styles.statLabel}>Tuổi</Text>
                    <Text style={styles.statValue}>{horse.age ? `${horse.age} tuổi` : 'Không rõ'}</Text>
                  </View>
                  <View style={styles.statBox}>
                    <Text style={styles.statLabel}>Cân nặng</Text>
                    <Text style={styles.statValue}>{horse.weight ? `${horse.weight} kg` : 'Không rõ'}</Text>
                  </View>
                </View>

                {/* Info Section */}
                <View style={styles.infoSection}>
                  <Text style={styles.sectionTitle}>Thông tin bổ sung</Text>
                  <View style={styles.infoRow}>
                    <MaterialIcons name="flag" size={20} color={premiumColors.textSecondary} />
                    <Text style={styles.infoText}>Quốc tịch: <Text style={styles.infoTextBold}>{horse.nationality || 'Không rõ'}</Text></Text>
                  </View>
                  <View style={styles.infoRow}>
                    <MaterialIcons name="star-rate" size={20} color={premiumColors.textSecondary} />
                    <Text style={styles.infoText}>Hệ số phong độ: <Text style={styles.infoTextBold}>{horse.rating || 'Chưa xếp hạng'}</Text></Text>
                  </View>
                  {horse.ownerUserId && (
                    <View style={styles.infoRow}>
                      <MaterialIcons name="person" size={20} color={premiumColors.textSecondary} />
                      <Text style={styles.infoText}>Chủ sở hữu: <Text style={styles.infoTextBold}>{horse.ownerUserId.fullName || 'Không rõ'}</Text></Text>
                    </View>
                  )}
                </View>

                {/* Bio / Description */}
                {horse.bio && (
                  <View style={styles.bioSection}>
                    <Text style={styles.sectionTitle}>Tiểu sử</Text>
                    <Text style={styles.bioText}>{horse.bio}</Text>
                  </View>
                )}
              </View>
            ) : null}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  container: {
    backgroundColor: '#09090B',
    borderTopLeftRadius: premiumRadius[24],
    borderTopRightRadius: premiumRadius[24],
    maxHeight: SCREEN_HEIGHT * 0.85,
    minHeight: SCREEN_HEIGHT * 0.5,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderBottomWidth: 0,
  },
  header: {
    padding: premiumSpacing[16],
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  dragIndicator: {
    width: 40,
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: premiumSpacing[16],
  },
  headerTitleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  closeBtn: {
    padding: 4,
  },
  content: {
    padding: premiumSpacing[16],
    paddingBottom: premiumSpacing[48],
  },
  centerBox: {
    paddingVertical: premiumSpacing[48],
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    color: premiumColors.danger,
    marginTop: premiumSpacing[16],
    textAlign: 'center',
  },
  retryBtn: {
    marginTop: premiumSpacing[16],
    paddingHorizontal: premiumSpacing[24],
    paddingVertical: premiumSpacing[8],
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: premiumRadius[8],
  },
  retryBtnText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  imageContainer: {
    height: 200,
    width: '100%',
    borderRadius: premiumRadius[12],
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.05)',
    marginBottom: premiumSpacing[24],
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatar: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  placeholderAvatar: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  nameBadge: {
    position: 'absolute',
    bottom: premiumSpacing[16],
    left: premiumSpacing[16],
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: premiumSpacing[12],
    paddingVertical: 6,
    borderRadius: premiumRadius[8],
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  horseName: {
    color: premiumColors.brand,
    fontSize: 18,
    fontWeight: '800',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: premiumSpacing[12],
    marginBottom: premiumSpacing[24],
  },
  statBox: {
    flex: 1,
    minWidth: (SCREEN_WIDTH - 64) / 2,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: premiumRadius[12],
    padding: premiumSpacing[16],
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  statLabel: {
    fontSize: 12,
    color: premiumColors.textMuted,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  infoSection: {
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderRadius: premiumRadius[12],
    padding: premiumSpacing[16],
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    marginBottom: premiumSpacing[24],
    gap: premiumSpacing[12],
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: premiumSpacing[8],
    letterSpacing: 1,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: premiumSpacing[12],
  },
  infoText: {
    fontSize: 14,
    color: premiumColors.textSecondary,
    flex: 1,
  },
  infoTextBold: {
    fontWeight: '700',
    color: '#FFFFFF',
  },
  bioSection: {
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderRadius: premiumRadius[12],
    padding: premiumSpacing[16],
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  bioText: {
    fontSize: 14,
    color: premiumColors.textSecondary,
    lineHeight: 22,
  },
});
