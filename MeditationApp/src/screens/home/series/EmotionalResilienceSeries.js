// ==========================================
// 檔案名稱: src/screens/home/series/EmotionalResilienceSeries.js
// 情緒抗壓力計畫系列組件
// 版本: V3.0 - 統一使用單元完成度
// 修正內容：
// 1) 圓環顯示「單元完成度」而非基於 13 次的計算
// 2) 使用後端返回的 completedUnits 和 progress
// 3) 與首頁卡片進度保持一致
// ==========================================

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Pressable,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Wind,
  PenLine,
  GitBranch,
  Heart,
  ThermometerSun,
  Info,
  ChevronRight,
} from 'lucide-react-native';
import ApiService from '../../../services/index';

const EmotionalResilienceSeries = ({ 
  navigation, 
  isLoggedIn,
  userName,
  onShowPlanDetails,
  onShowCompletionModal,
}) => {
  // ========== 狀態管理 ==========
  const [loading, setLoading] = useState(true);
  const [goals, setGoals] = useState({
    breathing: { current: 0, target: 3, label: '呼吸練習' },
    goodthings: { current: 0, target: 3, label: '好事書寫' },
    abcd: { current: 0, target: 3, label: '思維調節' },
    gratitude: { current: 0, target: 3, label: '感恩練習' },
    thermometer: { current: 0, target: 1, label: '心情溫度計' },
  });

  // ⭐ 新增：來自後端的計劃統計
  const [planProgress, setPlanProgress] = useState(0); // 後端計算的完成百分比（基於 13 次）

  const [previousProgress, setPreviousProgress] = useState(0);

  // ========== 生命週期 ==========
  useEffect(() => {
    if (isLoggedIn) {
      loadHomeProgress();
    }
  }, [isLoggedIn]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      console.log('🔄 [計劃系列] 頁面獲得焦點，重新載入進度');
      if (isLoggedIn) {
        loadHomeProgress();
      }
    });
    return unsubscribe;
  }, [navigation, isLoggedIn]);

  // ========== 核心功能函數 ==========

  /**
   * 載入首頁進度數據
   */
  const loadHomeProgress = async () => {
    try {
      setLoading(true);
      console.log('📊 [計劃系列] 開始載入練習統計...');
      
      const res = await ApiService.getPracticeStats(`?_t=${Date.now()}`);
      const success = res?.success !== undefined ? res.success : true;
      const stats = res?.stats || res?.data?.stats || res?.data || (success ? res : null);

      if (!success || !stats) {
        console.log('⚠️ [計劃系列] 練習統計 API 返回格式不符或失敗');
        return;
      }

      console.log('✅ [計劃系列] 統計數據載入成功');

      const categoryStats = stats.categoryStats || [];

      // 讀取各項練習次數
      const breathingStat = categoryStats.find(
        c => c.type === '呼吸穩定力練習' || c.type === 'breathing'
      );
      const breathingCount = breathingStat?.sessions || 0;

      const goodthingsStat = categoryStats.find(
        c => c.type === '好事書寫練習' || c.type === '好事書寫' || c.type === 'goodthings'
      );
      const goodthingsCount = goodthingsStat?.sessions || 0;

      const thermometerStat = categoryStats.find(
        c => c.type === '心情溫度計' || c.type === 'thermometer'
      );
      const thermometerCount = thermometerStat?.sessions || 0;

      const abcdStat = categoryStats.find(
        c => c.type === '思維調節練習' || c.type === '思維調節' || c.type === 'abcd'
      );
      const abcdCount = abcdStat?.sessions || 0;

      const gratitudeStats = categoryStats.filter(
        c => c.type === '感恩練習' || 
            c.type === '感恩日記' || 
            c.type === '迷你感謝信' || 
            c.type === '如果練習' || 
            c.type === 'gratitude'
      );
      const gratitudeCount = gratitudeStats.reduce((sum, stat) => sum + (stat.sessions || 0), 0);

      console.log('📋 [計劃系列] 總練習統計:', {
        breathing: breathingCount,
        goodthings: goodthingsCount,
        thermometer: thermometerCount,
        abcd: abcdCount,
        gratitude: gratitudeCount,
      });

      // ⭐ 讀取後端計算的計劃進度（基於 13 次目標：3+3+3+3+1）
      const plan = stats.plans?.['emotional-resilience'];
      if (plan) {
        const progress = plan.progress || 0;

        setPlanProgress(progress);

        console.log('📈 [情緒抗壓] 完成度:', progress, '%（基於 13 次目標）');
      } else {
        setPlanProgress(0);
      }

      // 更新各項目標
      setGoals(prev => ({
        ...prev,
        breathing: { ...prev.breathing, current: breathingCount },
        goodthings: { ...prev.goodthings, current: goodthingsCount },
        thermometer: { ...prev.thermometer, current: thermometerCount },
        abcd: { ...prev.abcd, current: abcdCount },
        gratitude: { ...prev.gratitude, current: gratitudeCount },
      }));

      // 檢查是否達到 100%
      if (progress >= 100 && previousProgress < 100) {
        setTimeout(() => onShowCompletionModal && onShowCompletionModal(), 500);
      }

      setPreviousProgress(progress);
      console.log('📊 [計劃系列] 進度數據更新完成，完成度:', progress + '%');
    } catch (error) {
      console.error('❌ [計劃系列] 載入進度失敗:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * 🔧 導航函數
   */
  const navigateToPractice = (practiceType, practiceId) => {
    if (!isLoggedIn) {
      Alert.alert('需要登入', '請登入以享受完整的冥想體驗');
      return;
    }

    console.log(`🎯 [計劃系列] 導航到 ${practiceType}`);
    
    navigation.navigate('PracticeNavigator', {
      practiceType: practiceType,
      onPracticeComplete: async () => {
        console.log(`✅ [計劃系列] ${practiceType} 完成`);
        await new Promise(resolve => setTimeout(resolve, 800));
        await loadHomeProgress();
      },
    });
  };

  // ========== 練習模組配置 ==========
  const practiceModules = [
    { 
      id: 'breathing', 
      title: '呼吸練習', 
      icon: Wind,
      color: 'blue',
      bgColor: '#EFF6FF',
      iconColor: '#3B82F6',
      gradientColors: ['#31C6FE', '#166CB5'],
      practiceType: '呼吸穩定力練習',
      current: goals.breathing.current,
      target: goals.breathing.target
    },
    { 
      id: 'goodthings', 
      title: '好事書寫', 
      icon: PenLine,
      color: 'orange',
      bgColor: '#FFF7ED',
      iconColor: '#F97316',
      gradientColors: ['#FFBC42', '#FF8C42'],
      practiceType: '好事書寫',
      current: goals.goodthings.current,
      target: goals.goodthings.target
    },
    { 
      id: 'abcd', 
      title: '思維調節', 
      icon: GitBranch,
      color: 'purple',
      bgColor: '#F5F3FF',
      iconColor: '#A855F7',
      gradientColors: ['#C084FC', '#A855F7'],
      practiceType: '思維調節練習',
      current: goals.abcd.current,
      target: goals.abcd.target
    },
    { 
      id: 'gratitude', 
      title: '感恩練習', 
      icon: Heart,
      color: 'pink',
      bgColor: '#FDF2F8',
      iconColor: '#EC4899',
      gradientColors: ['#F9A8D4', '#EC4899'],
      practiceType: '感恩練習',
      current: goals.gratitude.current,
      target: goals.gratitude.target
    },
  ];

  // ========== 渲染 ==========
  if (loading && isLoggedIn) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color="#166CB5" />
        <Text style={styles.loadingText}>載入計劃進度...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* 計劃標題 & 進度 */}
      <View style={styles.planHeader}>
        {/* 左側：標題 + i 按鈕 */}
        <View style={styles.planInfo}>
          {/* 用戶名（單獨一行）*/}
          <Text style={styles.planUserName}>{userName || 'OO'}的</Text>
          
          {/* ⭐ 標題和 i 按鈕在同一行 */}
          <View style={styles.planTitleRow}>
            <Text style={styles.planTitle}>情緒抗壓力計劃</Text>
            
            {/* i 按鈕 */}
            <TouchableOpacity
              onPress={() => onShowPlanDetails && onShowPlanDetails()}
              activeOpacity={0.8}
              style={styles.infoButton}
            >
              <Info color="#166CB5" size={12} />
              <Text style={styles.infoText}>點我看詳情</Text>
            </TouchableOpacity>
          </View>
          
          {/* 副標題 */}
          <Text style={styles.planSubtitle}>今天也是心理韌性訓練的好日子！</Text>
        </View>

        {/* 右側：完成度 */}
        <View style={styles.progressInfo}>
          <Text style={styles.progressNumber}>{planProgress}%</Text>
          <Text style={styles.progressLabel}>完成度</Text>
        </View>
      </View>

      {/* 進度條 */}
      <View style={styles.progressBarContainer}>
        <View style={styles.progressBarBg}>
          <LinearGradient
            colors={['#166CB5', '#31C6FE']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.progressBarFill, { width: `${planProgress}%` }]}
          />
        </View>
      </View>

      {/* 練習網格 */}
      <View style={styles.practiceGrid}>
        {practiceModules.map((module) => {
          const Icon = module.icon;
          const isBlue = module.color === 'blue';
          const isCompleted = module.current >= module.target;

          return (
            <TouchableOpacity
              key={module.id}
              onPress={() => navigateToPractice(module.practiceType, module.id)}
              activeOpacity={0.8}
              style={styles.practiceCardContainer}
            >
              {isBlue ? (
                <LinearGradient
                  colors={module.gradientColors}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.practiceCard}
                >
                  <View style={styles.practiceCardTop}>
                    <View style={styles.practiceIconBlue}>
                      <Icon color="#FFFFFF" size={20} />
                    </View>
                    <View style={styles.practiceProgressBlue}>
                      <Text style={styles.practiceProgressTextBlue}>
                        {module.current}/{module.target} 
                      </Text>
                    </View>
                  </View>

                  <View style={styles.practiceCardBottom}>
                    <Text style={styles.practiceTitleBlue}>{module.title}</Text>
                    <Text style={styles.practiceSubtitleBlue}>
                      {isCompleted ? '已完成目標 ✓' : '點擊開始練習'}
                    </Text>
                  </View>
                </LinearGradient>
              ) : (
                <View style={styles.practiceCardWhite}>
                  <View style={styles.practiceCardTop}>
                    <View
                      style={[
                        styles.practiceIcon,
                        { backgroundColor: module.bgColor },
                      ]}
                    >
                      <Icon color={module.iconColor} size={20} />
                    </View>
                    <View style={styles.practiceProgress}>
                      <Text style={styles.practiceProgressText}>
                        {module.current}/{module.target} 
                      </Text>
                    </View>
                  </View>

                  <View style={styles.practiceCardBottom}>
                    <Text style={styles.practiceTitle}>{module.title}</Text>
                    <Text style={styles.practiceSubtitle}>
                      {isCompleted ? '已完成目標 ✓' : '點擊開始練習'}
                    </Text>
                  </View>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* 心情溫度計卡片 */}
      <Pressable
        onPress={() => navigateToPractice('心情溫度計', 'thermometer')}
        style={({ pressed }) => [
          styles.thermometerCard,
          pressed && styles.thermometerCardPressed,
        ]}
      >
        {({ pressed }) => (
          <>
            <LinearGradient
              colors={['rgba(254, 243, 199, 0)', 'rgba(254, 243, 199, 0.8)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.thermometerGlow}
              pointerEvents="none"
            />

            <View style={styles.thermometerIconContainer}>
              <View style={styles.thermometerIcon}>
                <ThermometerSun color="#F59E0B" size={24} />
              </View>
            </View>

            <View style={styles.thermometerInfo}>
              <Text style={styles.thermometerTitle}>心情溫度計</Text>
              <Text style={styles.thermometerProgress}>
                {goals.thermometer.current}/{goals.thermometer.target}
                {goals.thermometer.current >= goals.thermometer.target && ' ✓'}
              </Text>
            </View>

            <View
              style={[
                styles.thermometerArrowContainer,
                pressed && styles.thermometerArrowContainerPressed,
              ]}
            >
              <ChevronRight 
                color={pressed ? '#FFFFFF' : '#9CA3AF'} 
                size={20} 
              />
            </View>
          </>
        )}
      </Pressable>
    </View>
  );
};

// ==========================================
// 樣式定義
// ==========================================
const styles = StyleSheet.create({
  container: {
    width: '100%',
  },

  // 載入狀態
  loadingContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6B7280',
  },

  // 計劃標題 & 進度
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: 20,
    marginBottom: 8,
 },
  planInfo: {
    flex: 1,
    marginRight: 16,
  },

  planTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 8,
  },

  planUserName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#333333',
    marginBottom: 2, 
  },
  planTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#333333',
    flexShrink: 1,
  },

  // ⭐ i 按鈕（在標題右側）
  infoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 100,
    gap: 4,
    flexShrink: 0,
  },
  infoText: {
    fontSize: 10,
    fontWeight: '500',
    color: '#166CB5',
  },

  planSubtitle: {
    fontSize: 12,
    color: '#6B7280',
  },

  // 完成度（右側）
  progressInfo: {
    alignItems: 'flex-end',
  },
  progressNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2CB3F0',
  },
  progressLabel: {
    fontSize: 12,
    color: '#9CA3AF',
  },

  // 進度條
  progressBarContainer: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  progressBarBg: {
    height: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },

  // 練習網格
  practiceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 14,
    marginBottom: 16,
  },
  practiceCardContainer: {
    width: '50%',
    padding: 6,
  },
  practiceCard: {
    aspectRatio: 1.4 / 1,
    borderRadius: 24,
    padding: 16,
    justifyContent: 'space-between',
    shadowColor: '#166CB5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  practiceCardWhite: {
    aspectRatio: 1.4 / 1,
    borderRadius: 24,
    padding: 16,
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F3F4F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  practiceCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  practiceCardBottom: {
    justifyContent: 'flex-end',
  },

  // 練習卡片 - 藍色版本
  practiceIconBlue: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  practiceProgressBlue: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 100,
  },
  practiceProgressTextBlue: {
    fontSize: 12,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  practiceTitleBlue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  practiceSubtitleBlue: {
    fontSize: 10,
    color: 'rgba(191, 219, 254, 0.9)',
  },

  // 練習卡片 - 白色版本
  practiceIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  practiceProgress: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 100,
  },
  practiceProgressText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6B7280',
  },
  practiceTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 2,
  },
  practiceSubtitle: {
    fontSize: 10,
    color: '#9CA3AF',
  },

  // 心情溫度計卡片
  thermometerCard: {
    marginHorizontal: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#FEF3C7',
    borderRadius: 24,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    position: 'relative',
    overflow: 'hidden',
  },
  thermometerCardPressed: {
    transform: [{ scale: 0.98 }],
    shadowOpacity: 0.15,
  },
  thermometerGlow: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 80,
    height: '200%',
  },
  thermometerIconContainer: {
    marginRight: 16,
    zIndex: 1,
  },
  thermometerIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: '#FEF3C7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  thermometerInfo: {
    flex: 1,
    zIndex: 1,
  },
  thermometerTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#333333',
    marginBottom: 2,
  },
  thermometerProgress: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  thermometerArrowContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F9FAFB',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  thermometerArrowContainerPressed: {
    backgroundColor: '#FBBF24',
  },
});

export default EmotionalResilienceSeries;