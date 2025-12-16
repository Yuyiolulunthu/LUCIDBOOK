// ==========================================
// 檔案名稱: OnboardingModal.js
// 功能: Onboarding 小視窗
// 🎨 統一設計風格
// ✅ 2 頁引導內容
// ✅ 「開始體驗」按鈕進入首頁
// ==========================================

import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Dimensions,
  FlatList,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const MODAL_WIDTH = SCREEN_WIDTH - 48;

// Onboarding 頁面內容
const ONBOARDING_PAGES = [
  {
    id: '1',
    icon: 'heart-outline',
    title: '歡迎加入 LUCIDBOOK',
    description: '這是一個專為您打造的心靈練習空間，\n幫助您找到內心的平靜與專注。',
    highlight: '每天只需幾分鐘，讓自己更好',
  },
  {
    id: '2',
    icon: 'sparkles-outline',
    title: '開始您的旅程',
    description: '透過冥想、呼吸練習和正念引導，\n逐步建立健康的心理習慣。',
    highlight: '準備好了嗎？讓我們開始吧！',
  },
];

const OnboardingModal = ({ visible, onComplete }) => {
  const [currentPage, setCurrentPage] = useState(0);
  const flatListRef = useRef(null);
  const scrollX = useRef(new Animated.Value(0)).current;

  // 處理頁面切換
  const handleNext = () => {
    if (currentPage < ONBOARDING_PAGES.length - 1) {
      flatListRef.current?.scrollToIndex({
        index: currentPage + 1,
        animated: true,
      });
      setCurrentPage(currentPage + 1);
    } else {
      // 最後一頁，完成 Onboarding
      onComplete();
    }
  };

  // 處理滾動結束
  const handleMomentumScrollEnd = (event) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / MODAL_WIDTH);
    setCurrentPage(index);
  };

  // 渲染單個頁面
  const renderPage = ({ item, index }) => (
    <View style={styles.pageContainer}>
      {/* 圖示 */}
      <View style={styles.iconContainer}>
        <LinearGradient
          colors={['#166CB5', '#31C6FE']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.iconGradient}
        >
          <Ionicons name={item.icon} size={48} color="#FFFFFF" />
        </LinearGradient>
      </View>

      {/* 標題 */}
      <Text style={styles.pageTitle}>{item.title}</Text>

      {/* 描述 */}
      <Text style={styles.pageDescription}>{item.description}</Text>

      {/* 重點提示 */}
      <View style={styles.highlightContainer}>
        <Ionicons name="star" size={16} color="#F59E0B" />
        <Text style={styles.highlightText}>{item.highlight}</Text>
      </View>
    </View>
  );

  // 渲染分頁指示器
  const renderPagination = () => (
    <View style={styles.pagination}>
      {ONBOARDING_PAGES.map((_, index) => {
        const inputRange = [
          (index - 1) * MODAL_WIDTH,
          index * MODAL_WIDTH,
          (index + 1) * MODAL_WIDTH,
        ];

        const dotWidth = scrollX.interpolate({
          inputRange,
          outputRange: [8, 24, 8],
          extrapolate: 'clamp',
        });

        const opacity = scrollX.interpolate({
          inputRange,
          outputRange: [0.4, 1, 0.4],
          extrapolate: 'clamp',
        });

        return (
          <Animated.View
            key={index}
            style={[
              styles.paginationDot,
              {
                width: dotWidth,
                opacity,
              },
            ]}
          />
        );
      })}
    </View>
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* 頁面內容 */}
          <Animated.FlatList
            ref={flatListRef}
            data={ONBOARDING_PAGES}
            renderItem={renderPage}
            keyExtractor={(item) => item.id}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            bounces={false}
            onMomentumScrollEnd={handleMomentumScrollEnd}
            onScroll={Animated.event(
              [{ nativeEvent: { contentOffset: { x: scrollX } } }],
              { useNativeDriver: false }
            )}
            scrollEventThrottle={16}
            getItemLayout={(_, index) => ({
              length: MODAL_WIDTH,
              offset: MODAL_WIDTH * index,
              index,
            })}
          />

          {/* 分頁指示器 */}
          {renderPagination()}

          {/* 按鈕區域 */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.nextButtonContainer}
              onPress={handleNext}
              activeOpacity={0.9}
            >
              <LinearGradient
                colors={['#166CB5', '#31C6FE']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.nextButton}
              >
                <Text style={styles.nextButtonText}>
                  {currentPage === ONBOARDING_PAGES.length - 1 
                    ? '開始體驗' 
                    : '下一步'}
                </Text>
                <Ionicons 
                  name={currentPage === ONBOARDING_PAGES.length - 1 
                    ? "checkmark-circle" 
                    : "arrow-forward"} 
                  size={20} 
                  color="#FFFFFF" 
                />
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* 頁碼指示 */}
          <Text style={styles.pageIndicator}>
            {currentPage + 1} / {ONBOARDING_PAGES.length}
          </Text>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: MODAL_WIDTH,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },

  // Page Content
  pageContainer: {
    width: MODAL_WIDTH,
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 24,
    alignItems: 'center',
  },

  // Icon
  iconContainer: {
    marginBottom: 24,
  },
  iconGradient: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#166CB5',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },

  // Title
  pageTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 16,
  },

  // Description
  pageDescription: {
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 20,
  },

  // Highlight
  highlightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  highlightText: {
    fontSize: 14,
    color: '#92400E',
    fontWeight: '600',
    marginLeft: 8,
  },

  // Pagination
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
  },
  paginationDot: {
    height: 8,
    borderRadius: 4,
    backgroundColor: '#166CB5',
    marginHorizontal: 4,
  },

  // Button
  buttonContainer: {
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
  nextButtonContainer: {
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#166CB5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },

  // Page Indicator
  pageIndicator: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
    paddingBottom: 20,
  },
});

export default OnboardingModal;