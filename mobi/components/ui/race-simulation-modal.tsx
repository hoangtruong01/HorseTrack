import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, StyleSheet, Modal, Dimensions } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  Easing,
} from 'react-native-reanimated';
import { Image } from 'expo-image';
import { premiumRadius } from './premium-tokens';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const RACE_MESSAGES = [
  "⚡ Đang khởi động cuộc đua...",
  "🏁 Các chiến mã đang tăng tốc...",
  "🔥 Cuộc đua đang diễn ra gay cấn...",
  "📊 Hệ thống đang phân tích chỉ số...",
  "🏆 Đang tính toán thứ hạng...",
  "🐎 Các kỵ sĩ đang nỗ lực...",
  "💨 Bụi đường đua tung bay...",
];

const LANE_BG = [
  "rgba(239, 68, 68, 0.1)",   // red
  "rgba(59, 130, 246, 0.1)",  // blue
  "rgba(16, 185, 129, 0.1)",  // emerald
  "rgba(245, 158, 11, 0.1)",  // amber
  "rgba(168, 85, 247, 0.1)",  // purple
  "rgba(236, 72, 153, 0.1)",  // pink
  "rgba(6, 182, 212, 0.1)",   // cyan
  "rgba(249, 115, 22, 0.1)",  // orange
];

const LANE_ACCENT = [
  "#ef4444", "#3b82f6", "#10b981", "#f59e0b",
  "#a855f7", "#ec4899", "#06b6d4", "#f97316",
];

export interface RaceSimulationModalProps {
  isOpen: boolean;
  horses: { id: string; name: string; breed?: string }[];
}

const TRACK_WIDTH = Math.min(SCREEN_WIDTH - 64 - 120, 250);

function HorseLane({ horse, index, isOpen, accentColor }: { horse: any, index: number, isOpen: boolean, accentColor: string }) {
  const pos = useSharedValue(0);
  
  const duration = useMemo(() => {
    const base = 3500;
    const variance = Math.random() * 2000;
    return base + variance;
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      pos.value = 0;
    } else {
      pos.value = 0;
      pos.value = withTiming(1, {
        duration,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      });
    }
  }, [isOpen, duration]);

  const animatedHorseStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: pos.value * TRACK_WIDTH }
      ]
    };
  });
  
  const animatedTrailStyle = useAnimatedStyle(() => {
    return {
      width: pos.value * TRACK_WIDTH,
      backgroundColor: accentColor,
    };
  });

  return (
    <View style={[s.lane, { backgroundColor: LANE_BG[index % LANE_BG.length], borderLeftColor: accentColor }]}>
      <View style={[s.laneNumberBadge, { borderColor: accentColor }]}>
        <Text style={[s.laneNumberText, { color: accentColor }]}>{index + 1}</Text>
      </View>
      
      <View style={s.horseInfo}>
        <Text style={s.horseName} numberOfLines={1}>{horse.name}</Text>
        {horse.breed && (
          <Text style={s.horseBreed} numberOfLines={1}>{horse.breed}</Text>
        )}
      </View>
      
      <View style={s.raceArea}>
        {isOpen && (
          <Animated.View style={[s.trail, animatedTrailStyle, { opacity: 0.5 }]} />
        )}
        {isOpen && (
          <Animated.View style={[s.horseSpriteWrap, animatedHorseStyle]}>
            <Image 
              source={require('../../assets/images/skeletonHorse.gif')} 
              style={s.horseSprite} 
              contentFit="contain"
            />
          </Animated.View>
        )}
      </View>
    </View>
  );
}

export function RaceSimulationModal({ isOpen, horses }: RaceSimulationModalProps) {
  const [progress, setProgress] = useState(0);
  const [messageIndex, setMessageIndex] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  // Animated values
  const progressAnim = useSharedValue(0);

  useEffect(() => {
    if (isOpen) {
      setProgress(0);
      setIsFinished(false);
      progressAnim.value = 0;

      const interval = setInterval(() => {
        setProgress((prev) => Math.min(prev + Math.random() * 12 + 3, 90));
      }, 400);

      const msgInterval = setInterval(() => {
        setMessageIndex((prev) => (prev + 1) % RACE_MESSAGES.length);
      }, 1500);

      return () => {
        clearInterval(interval);
        clearInterval(msgInterval);
      };
    } else {
      if (progress > 0 && !isFinished) {
        setProgress(100);
        setIsFinished(true);
        const timeout = setTimeout(() => {
          setProgress(0);
          setIsFinished(false);
        }, 600);
        return () => clearTimeout(timeout);
      } else {
        setProgress(0);
        setIsFinished(false);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  // Update animated progress bar
  useEffect(() => {
    progressAnim.value = withTiming(progress, { duration: 300 });
  }, [progress, progressAnim]);

  const progressBarAnimStyle = useAnimatedStyle(() => {
    return {
      width: `${progressAnim.value}%`,
    };
  });

  return (
    <Modal visible={isOpen || isFinished} transparent animationType="fade">
      <View style={s.overlay}>
        <View style={s.modalContainer}>
          <View style={s.decorativeGlow} />
          
          <View style={s.header}>
            <View style={s.badge}>
              <View style={s.badgeDot} />
              <Text style={s.badgeText}>ĐANG GIẢ LẬP</Text>
            </View>
            <Text style={s.title}>
              {isFinished ? "✅ GIẢ LẬP HOÀN TẤT!" : "CUỘC ĐUA ĐANG DIỄN RA..."}
            </Text>
            <Text style={s.subtitle}>
              {isFinished ? "Kết quả đã sẵn sàng để xem xét" : RACE_MESSAGES[messageIndex]}
            </Text>
          </View>

          <View style={s.trackContainer}>
            <View style={s.trackHeader}>
              <Text style={s.trackHeaderText}>🚩 START</Text>
              <Text style={[s.trackHeaderText, { color: 'rgba(250, 204, 21, 0.6)' }]}>🏁 FINISH</Text>
            </View>
            
            <View style={s.lanesContainer}>
              <View style={s.finishLine} />
              
              {horses.length === 0 ? (
                <Text style={s.noHorsesText}>Không có ngựa nào tham gia cuộc đua</Text>
              ) : (
                horses.map((horse, index) => (
                  <HorseLane 
                    key={horse.id} 
                    horse={horse} 
                    index={index} 
                    isOpen={isOpen} 
                    accentColor={LANE_ACCENT[index % LANE_ACCENT.length]} 
                  />
                ))
              )}
            </View>
          </View>

          <View style={s.progressSection}>
            <View style={s.progressBarTrack}>
              <Animated.View style={[s.progressBarFill, progressBarAnimStyle, { backgroundColor: progress >= 100 ? '#10b981' : '#eab308' }]} />
            </View>
            <Text style={s.progressText}>
              {progress >= 100 ? (
                <Text style={{ color: '#34d399' }}>HOÀN TẤT! 100%</Text>
              ) : (
                `ĐANG XỬ LÝ... ${Math.round(progress)}%`
              )}
            </Text>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 500,
    backgroundColor: '#0D0D14',
    borderRadius: premiumRadius[24],
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    overflow: 'hidden',
  },
  decorativeGlow: {
    position: 'absolute',
    top: -50,
    left: '25%',
    width: 200,
    height: 100,
    backgroundColor: 'rgba(225, 6, 0, 0.15)',
    borderRadius: 100,
    opacity: 0.8,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 16,
    alignItems: 'center',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(234, 179, 8, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(234, 179, 8, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
    marginBottom: 12,
  },
  badgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#facc15',
    marginRight: 6,
  },
  badgeText: {
    color: '#facc15',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
  },
  title: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 0.5,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
  trackContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  trackHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    borderBottomWidth: 0,
  },
  trackHeaderText: {
    color: 'rgba(255,255,255,0.3)',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 2,
  },
  lanesContainer: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    backgroundColor: '#0A0A10',
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    overflow: 'hidden',
  },
  finishLine: {
    position: 'absolute',
    right: 20,
    top: 0,
    bottom: 0,
    width: 2,
    backgroundColor: 'rgba(250, 204, 21, 0.3)',
    borderStyle: 'dashed',
    zIndex: 0,
  },
  noHorsesText: {
    color: 'rgba(255,255,255,0.3)',
    fontSize: 12,
    textAlign: 'center',
    paddingVertical: 40,
  },
  lane: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    paddingHorizontal: 12,
    borderLeftWidth: 3,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  laneNumberBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  laneNumberText: {
    fontSize: 10,
    fontWeight: '900',
  },
  horseInfo: {
    width: 70,
    marginRight: 8,
  },
  horseName: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 11,
    fontWeight: 'bold',
  },
  horseBreed: {
    color: 'rgba(255,255,255,0.3)',
    fontSize: 9,
    marginTop: 2,
  },
  raceArea: {
    flex: 1,
    height: '100%',
    justifyContent: 'center',
    position: 'relative',
    marginRight: 20,
  },
  trail: {
    position: 'absolute',
    left: 0,
    top: '50%',
    height: 2,
    marginTop: -1,
    borderRadius: 2,
  },
  horseSpriteWrap: {
    position: 'absolute',
    left: -15,
    top: '50%',
    marginTop: -15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  horseSprite: {
    width: 24,
    height: 24,
  },
  progressSection: {
    paddingHorizontal: 24,
    paddingVertical: 20,
    alignItems: 'center',
  },
  progressBarTrack: {
    width: '100%',
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 4,
    marginBottom: 10,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
});
