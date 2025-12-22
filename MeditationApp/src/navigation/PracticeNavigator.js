// ==========================================
// 檔案名稱: src/navigation/PracticeNavigator.js
// 練習導航器 - 統一管理所有練習頁面的導航
// 版本: V2.2 - 新增思維調節 + 感恩練習
// ==========================================

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import BreathingExerciseCard from '../data/practices/BreathingExerciseCard';
import EmotionPractice from '../data/practices/EmotionPractice';
import MindfulnessPractice from '../data/practices/MindfulnessPractice';
import SelfAwarenessPractice from '../data/practices/SelfAwarenessPractice';
import GoodThingsJournal from '../data/practices/Goodthingsjournal';
import EmotionThermometer from '../data/practices/EmotionThermometer';
import CognitiveReframingPractice from '../data/practices/CognitiveReframingPractice';
import GratitudePractice from '../data/practices/GratitudePractice'; // ⭐ 新增

const PracticeNavigator = ({ route, navigation }) => {
  const { practiceType, onPracticeComplete } = route.params || {};

  console.log('🔀 [PracticeNavigator] 收到練習類型:', practiceType);

  /**
   * 統一的返回處理
   * 確保正確返回到首頁
   */
  const handleBack = () => {
    console.log('⬅️ [PracticeNavigator] 執行返回');
    
    // 執行完成回調（如果有）
    if (onPracticeComplete) {
      console.log('✅ [PracticeNavigator] 執行完成回調');
      onPracticeComplete();
    }
    
    // 返回上一頁
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      // 如果無法返回，直接導航到首頁
      navigation.navigate('Home');
    }
  };

  /**
   * 統一的 Home 按鈕處理
   * 直接返回首頁，不經過中間頁面
   */
  const handleHomeNavigation = () => {
    console.log('🏠 [PracticeNavigator] 返回首頁');
    
    // 先返回到 PracticeNavigator 層
    if (navigation.canGoBack()) {
      navigation.goBack();
    }
    
    // 延遲一點再導航到 Home，確保動畫流暢
    setTimeout(() => {
      navigation.navigate('Home');
    }, 100);
  };

  // 根據練習類型渲染對應組件
  switch (practiceType) {
    case '呼吸穩定力練習':
    case 'breathing':
      console.log('🫁 [PracticeNavigator] 渲染呼吸練習');
      return (
        <BreathingExerciseCard
          navigation={navigation}
          route={route}
          onBack={handleBack}
          onHome={handleHomeNavigation}
        />
      );

    case '好事書寫':
    case '好事書寫練習':
    case 'goodthings':
      console.log('✍️ [PracticeNavigator] 渲染好事書寫');
      return (
        <GoodThingsJournal
          navigation={navigation}
          route={route}
          onBack={handleBack}
          onHome={handleHomeNavigation}
        />
      );

    case '情緒理解力練習':
    case 'emotion':
      console.log('😊 [PracticeNavigator] 渲染情緒練習');
      return (
        <EmotionPractice
          navigation={navigation}
          route={route}
          onComplete={onPracticeComplete}
          onBack={handleBack}
        />
      );

    case '正念安定力練習':
    case 'mindfulness':
      console.log('🧘 [PracticeNavigator] 渲染正念練習');
      return (
        <MindfulnessPractice
          navigation={navigation}
          route={route}
          onComplete={onPracticeComplete}
          onBack={handleBack}
        />
      );

    case '自我覺察力練習':
    case 'self-awareness':
      console.log('🔍 [PracticeNavigator] 渲染自我覺察');
      return (
        <SelfAwarenessPractice
          navigation={navigation}
          route={route}
          onComplete={onPracticeComplete}
          onBack={handleBack}
        />
      );
    
    case '心情溫度計':
    case 'emotion-thermometer':
      console.log('🌡️ [PracticeNavigator] 渲染心情溫度計');
      return (
        <EmotionThermometer
          navigation={navigation}
          route={route}
          onComplete={onPracticeComplete}
          onBack={handleBack}
          onHome={handleHomeNavigation}
        />
      );

    // ⭐ 思維調節練習
    case '思維調節練習':
    case '思維調節':
    case 'cognitive-reframing':
    case 'abcd':
      console.log('🧠 [PracticeNavigator] 渲染思維調節練習');
      return (
        <CognitiveReframingPractice
          navigation={navigation}
          route={route}
          onBack={handleBack}
          onHome={handleHomeNavigation}
        />
      );

    // ⭐⭐⭐ 新增：感恩練習 ⭐⭐⭐
    case '感恩練習':
    case '感恩日記':
    case '迷你感謝信':
    case '如果練習':
    case 'gratitude':
      console.log('💝 [PracticeNavigator] 渲染感恩練習');
      return (
        <GratitudePractice
          navigation={navigation}
          route={route}
          onBack={handleBack}
          onHome={handleHomeNavigation}
        />
      );

    default:
      console.error('❌ [PracticeNavigator] 未知的練習類型:', practiceType);
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>練習類型錯誤</Text>
          <Text style={styles.errorMessage}>
            未找到對應的練習：{practiceType}
          </Text>
        </View>
      );
  }
};

// ==========================================
// 樣式定義
// ==========================================
const styles = StyleSheet.create({
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    padding: 24,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
});

export default PracticeNavigator;