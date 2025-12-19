// ==========================================
// 檔案名稱: PlanCompletionModal.js
// 計劃完成恭喜視窗 - React Native 版本
// 版本: V1.0 - 帶慶祝動畫
// ==========================================

import React, { useEffect, useRef } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { X, Trophy, RotateCcw } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');

const PlanCompletionModal = ({ isOpen, onClose }) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  
  // 彩帶動畫陣列（增加到 100 個）
  const confettiAnims = useRef(
    Array.from({ length: 100 }, () => ({
      translateY: new Animated.Value(-100),
      translateX: new Animated.Value(0),
      rotate: new Animated.Value(0),
      opacity: new Animated.Value(1),
    }))
  ).current;

  useEffect(() => {
    if (isOpen) {
      // 震動反饋
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }

      // Modal 彈出動畫
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();

      // 獎盃旋轉動畫
      Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 10000,
          useNativeDriver: true,
        })
      ).start();

      // 彩帶飄落動畫（優化版）
      confettiAnims.forEach((confetti, index) => {
        // 隨機延遲（0-2秒）
        const delay = Math.random() * 2000;
        
        // 飄落時間（3-6秒，更久）
        const duration = 3000 + Math.random() * 3000;
        
        // x 軸起始位置（隨機分布在整個寬度）
        const startX = Math.random() * width - width / 2;
        
        // x 軸終點位置（增加橫向飄移）
        const endX = startX + (Math.random() - 0.5) * width * 0.8;
        
        // 旋轉角度（增加旋轉次數）
        const rotate = Math.random() * 1440 - 720; // -720° to +720°

        // 設置起始 x 位置
        confetti.translateX.setValue(startX);

        Animated.sequence([
          Animated.delay(delay),
          Animated.parallel([
            // y 軸下落
            Animated.timing(confetti.translateY, {
              toValue: Dimensions.get('window').height + 100,
              duration: duration,
              useNativeDriver: true,
            }),
            // x 軸飄移
            Animated.timing(confetti.translateX, {
              toValue: endX,
              duration: duration,
              useNativeDriver: true,
            }),
            // 旋轉
            Animated.timing(confetti.rotate, {
              toValue: rotate,
              duration: duration,
              useNativeDriver: true,
            }),
            // 淡出（最後 1 秒才開始淡出）
            Animated.sequence([
              Animated.delay(duration - 1000),
              Animated.timing(confetti.opacity, {
                toValue: 0,
                duration: 1000,
                useNativeDriver: true,
              }),
            ]),
          ]),
        ]).start();
      });
    } else {
      // 重置動畫
      scaleAnim.setValue(0);
      fadeAnim.setValue(0);
      rotateAnim.setValue(0);
      confettiAnims.forEach(confetti => {
        confetti.translateY.setValue(-100);
        confetti.translateX.setValue(0); // 重置會在下次開啟時重新設置
        confetti.rotate.setValue(0);
        confetti.opacity.setValue(1);
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const confettiColors = [
    '#FFD700', // 金色
    '#FF6B6B', // 紅色
    '#4ECDC4', // 青色
    '#45B7D1', // 藍色
    '#F7DC6F', // 黃色
    '#BB8FCE', // 紫色
    '#FF8C42', // 橘色
    '#2ECC71', // 綠色
    '#E74C3C', // 深紅
    '#3498DB', // 藍色
    '#F39C12', // 橙黃
    '#9B59B6', // 深紫
  ];

  return (
    <Modal
      visible={isOpen}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      {/* 背景遮罩 */}
      <Animated.View style={[styles.backdrop, { opacity: fadeAnim }]}>
        <TouchableOpacity 
          style={styles.backdropTouchable}
          activeOpacity={1}
          onPress={onClose}
        />
      </Animated.View>

      {/* 彩帶動畫層 */}
      <View style={styles.confettiContainer} pointerEvents="none">
        {confettiAnims.map((confetti, index) => {
          const rotateConfetti = confetti.rotate.interpolate({
            inputRange: [-720, 720],
            outputRange: ['-720deg', '720deg'],
          });

          // 隨機大小（8-14px）
          const size = 8 + (index % 7);
          // 隨機形狀（圓形或方形）
          const isCircle = index % 3 === 0;

          return (
            <Animated.View
              key={index}
              style={[
                styles.confetti,
                {
                  width: size,
                  height: size,
                  borderRadius: isCircle ? size / 2 : 2,
                  backgroundColor: confettiColors[index % confettiColors.length],
                  transform: [
                    { translateY: confetti.translateY },
                    { translateX: confetti.translateX },
                    { rotate: rotateConfetti },
                  ],
                  opacity: confetti.opacity,
                },
              ]}
            />
          );
        })}
      </View>

      {/* Modal 內容 */}
      <View style={styles.modalContainer} pointerEvents="box-none">
        <Animated.View
          style={[
            styles.modalContent,
            {
              transform: [{ scale: scaleAnim }],
              opacity: fadeAnim,
            },
          ]}
        >
          {/* 關閉按鈕 */}
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <View style={styles.closeButtonInner}>
              <X color="#9CA3AF" size={20} />
            </View>
          </TouchableOpacity>

          {/* 漸層背景裝飾 */}
          <LinearGradient
            colors={['rgba(59, 130, 246, 0.05)', 'rgba(59, 130, 246, 0)']}
            style={styles.decorativeBg}
          />

          {/* 獎盃圖標 */}
          <View style={styles.iconContainer}>
            <LinearGradient
              colors={['#FFD700', '#FDB931']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.iconCircle}
            >
              <Trophy color="#FFFFFF" size={48} strokeWidth={2.5} />
              
              {/* 旋轉虛線邊框 */}
              <Animated.View
                style={[
                  styles.iconBorder,
                  { transform: [{ rotate }] },
                ]}
              />
            </LinearGradient>
          </View>

          {/* 文字內容 */}
          <View style={styles.textContainer}>
            <Text style={styles.title}>太棒了！計畫完成</Text>
            <Text style={styles.description}>
              恭喜你完成了所有的心理肌力訓練！{'\n'}
              即使計畫結束，你隨時都可以回來{'\n'}
              <Text style={styles.highlight}>重複練習</Text>，保持最佳狀態。
            </Text>
          </View>

          {/* 按鈕 */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.mainButton}
              onPress={onClose}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#166CB5', '#31C6FE']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.mainButtonGradient}
              >
                <Text style={styles.mainButtonText}>太好了，繼續保持！</Text>
              </LinearGradient>
            </TouchableOpacity>

            {/* 提示文字 */}
            <View style={styles.hintContainer}>
              <RotateCcw color="#9CA3AF" size={12} />
              <Text style={styles.hintText}>隨時都可以再次練習</Text>
            </View>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  // 背景遮罩
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  backdropTouchable: {
    flex: 1,
  },

  // 彩帶容器
  confettiContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 60,
  },
  confetti: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 2,
    top: -20,
    left: width / 2,
    // 添加陰影讓彩帶更立體
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },

  // Modal 容器
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    zIndex: 70,
  },

  // Modal 內容
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 32,
    width: '100%',
    maxWidth: 400,
    paddingTop: 40,
    paddingBottom: 32,
    paddingHorizontal: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.3,
    shadowRadius: 30,
    elevation: 10,
    position: 'relative',
    overflow: 'hidden',
  },

  // 關閉按鈕
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 10,
  },
  closeButtonInner: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // 裝飾背景
  decorativeBg: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 128,
  },

  // 圖標容器
  iconContainer: {
    marginBottom: 24,
    zIndex: 1,
  },
  iconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  iconBorder: {
    position: 'absolute',
    width: 104,
    height: 104,
    borderRadius: 52,
    borderWidth: 4,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    borderStyle: 'dashed',
  },

  // 文字容器
  textContainer: {
    alignItems: 'center',
    marginBottom: 32,
    paddingHorizontal: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333333',
    marginBottom: 12,
    textAlign: 'center',
  },
  description: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
  },
  highlight: {
    color: '#166CB5',
    fontWeight: '700',
  },

  // 按鈕容器
  buttonContainer: {
    width: '100%',
    gap: 12,
  },
  mainButton: {
    width: '100%',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#166CB5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  mainButtonGradient: {
    paddingVertical: 14,
    alignItems: 'center',
  },
  mainButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  // 提示容器
  hintContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  hintText: {
    fontSize: 12,
    color: '#9CA3AF',
  },
});

export default PlanCompletionModal;