// ==========================================
// 檔案名稱: src/screens/home/HomeScreen.js
// 首頁畫面 - 完整修復版 + 完成度計算 + 恭喜視窗
// 版本: V4.2 - 新增思維調節 + 感恩練習導航
// ==========================================

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Dimensions,
  StatusBar,
  Alert,
  ActivityIndicator,
  Pressable,
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
import ApiService from '../../services/index';
import BottomNavigation from '../../navigation/BottomNavigation';
import AppHeader from '../../navigation/AppHeader';
import LockedOverlay from '../../navigation/LockedOverlay';
import PlanDetailsModal from './components/PlanDetailsModal';
import PlanCompletionModal from './components/PlanCompletionModal';

const { width } = Dimensions.get('window');

const HomeScreen = ({ navigation }) => {
  // ========== 狀態管理 ==========
  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('plan');
  const [hasEnterpriseCode, setHasEnterpriseCode] = useState(false);
  const [showPlanDetails, setShowPlanDetails] = useState(false);
  const [showCompletionModal, setShowCompletionModal] = useState(false);

  // 進度數據 - 使用「永久累計」邏輯
  const [goals, setGoals] = useState({
    breathing: { current: 0, target: 3, label: '呼吸練習' },
    goodthings: { current: 0, target: 3, label: '好事書寫' },
    abcd: { current: 0, target: 3, label: '思維調節' },
    gratitude: { current: 0, target: 3, label: '感恩練習' }, // ⭐ 改為動態
    thermometer: { current: 0, target: 1, label: '心情溫度計' },
  });

  // 記錄上一次的完成度（用於判斷是否剛達標）
  const [previousProgress, setPreviousProgress] = useState(0);

  // ========== 生命週期 ==========

  useEffect(() => {
    checkLoginStatus();
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      console.log('🔄 [首頁] 頁面獲得焦點，重新載入數據');
      checkLoginStatus();
      setTimeout(() => {
        loadHomeProgress();
      }, 500);
    });
    return unsubscribe;
  }, [navigation]);

  useEffect(() => {
    if (isLoggedIn && user) {
      loadHomeProgress();
    }
  }, [isLoggedIn, user]);

  // ========== 核心功能函數 ==========

  /**
   * 檢查登入狀態
   */
  const checkLoginStatus = async () => {
    try {
      const loggedIn = await ApiService.isLoggedIn();
      if (loggedIn) {
        const response = await ApiService.getUserProfile();
        if (response && response.user) {
          setUser({
            id: response.user.id,
            name: response.user.name,
            email: response.user.email,
          });
          setIsLoggedIn(true);

          // 檢查企業引薦碼
          const hasCode = !!response.user.enterprise_code;
          console.log('📋 [HomeScreen] 企業引薦碼:', hasCode);
          setHasEnterpriseCode(hasCode);
        } else {
          setIsLoggedIn(false);
          setUser(null);
          setHasEnterpriseCode(false);
        }
      } else {
        setIsLoggedIn(false);
        setUser(null);
        setHasEnterpriseCode(false);
      }
    } catch (error) {
      console.log('未登入或 Token 已過期');
      setIsLoggedIn(false);
      setUser(null);
      setHasEnterpriseCode(false);
    } finally {
      setIsInitializing(false);
      console.log('🏁 [HomeScreen] 初始化完成');
    }
  };

  /**
   * 載入首頁進度數據 - 永久累計邏輯
   */
  const loadHomeProgress = async () => {
    try {
      console.log('📊 [首頁] 開始載入練習統計...');
      
      const res = await ApiService.getPracticeStats();
      const success = res?.success !== undefined ? res.success : true;
      const stats = res?.stats || res?.data?.stats || res?.data || (success ? res : null);

      if (!success || !stats) {
        console.log('⚠️ 練習統計 API 返回格式不符或失敗');
        return;
      }

      console.log('✅ [首頁] 統計數據載入成功');

      // ⭐ 使用 categoryStats 來獲取總次數（永久累計）
      const categoryStats = stats.categoryStats || [];
      
      // 呼吸練習總次數
      const breathingStat = categoryStats.find(
        c => c.type === '呼吸穩定力練習' || c.type === 'breathing'
      );
      const breathingCount = breathingStat?.sessions || 0;
      
      // 好事書寫總次數
      const goodthingsStat = categoryStats.find(
        c => c.type === '好事書寫練習' || c.type === '好事書寫' || c.type === 'goodthings'
      );
      const goodthingsCount = goodthingsStat?.sessions || 0;

      // 心情溫度計總次數
      const thermometerStat = categoryStats.find(
        c => c.type === '心情溫度計' || c.type === 'thermometer'
      );
      const thermometerCount = thermometerStat?.sessions || 0;

      // 思維調節總次數
      const abcdStat = categoryStats.find(
        c => c.type === '思維調節練習' || c.type === '思維調節' || c.type === 'abcd'
      );
      const abcdCount = abcdStat?.sessions || 0;

      // ⭐ 感恩練習總次數（包含三種子練習）
      const gratitudeStat = categoryStats.find(
        c => c.type === '感恩練習' || c.type === '感恩日記' || c.type === '迷你感謝信' || c.type === '如果練習' || c.type === 'gratitude'
      );
      const gratitudeCount = gratitudeStat?.sessions || 0;

      console.log('📋 [首頁] 總練習統計（永久累計）:', {
        breathing: breathingCount,
        goodthings: goodthingsCount,
        thermometer: thermometerCount,
        abcd: abcdCount,
        gratitude: gratitudeCount,
      });

      // 計算當前完成度（更新前）
      const currentProgress = calculateProgress({
        breathing: breathingCount,
        goodthings: goodthingsCount,
        thermometer: thermometerCount,
        abcd: abcdCount,
        gratitude: gratitudeCount,
      });

      // 更新進度
      setGoals(prev => ({
        ...prev,
        breathing: { ...prev.breathing, current: breathingCount },
        goodthings: { ...prev.goodthings, current: goodthingsCount },
        thermometer: { ...prev.thermometer, current: thermometerCount },
        abcd: { ...prev.abcd, current: abcdCount },
        gratitude: { ...prev.gratitude, current: gratitudeCount },
      }));

      // 🎉 檢查是否達標（>= 100%）且剛完成練習
      if (currentProgress >= 100 && previousProgress < 100) {
        console.log('🎉 [首頁] 首次達標，顯示恭喜視窗！');
        setTimeout(() => {
          setShowCompletionModal(true);
        }, 500);
      } else if (currentProgress >= 100 && previousProgress >= 100) {
        console.log('🎊 [首頁] 已達標，每次練習完成都顯示恭喜視窗！');
        setTimeout(() => {
          setShowCompletionModal(true);
        }, 500);
      }

      // 更新上一次的完成度
      setPreviousProgress(currentProgress);

      console.log('📊 [首頁] 進度數據更新完成');
    } catch (error) {
      console.error('❌ [首頁] 載入進度失敗:', error);
    }
  };

  /**
   * 計算完成度百分比
   */
  const calculateProgress = (counts) => {
    const totalTasks = 3 + 3 + 3 + 3 + 1; // 13
    const completedTasks = Math.min(counts.breathing || 0, 3) + 
                          Math.min(counts.goodthings || 0, 3) + 
                          Math.min(counts.abcd || 0, 3) +
                          Math.min(counts.gratitude || 0, 3) +
                          Math.min(counts.thermometer || 0, 1);
    
    const percentage = Math.round((completedTasks / totalTasks) * 100);
    return Math.min(percentage, 100); // 上限 100%
  };

  /**
   * 顯示登入提示
   */
  const showLoginPrompt = () => {
    if (!isLoggedIn) {
      Alert.alert('需要登入', '請登入以享受完整的冥想體驗', [
        { text: '取消', style: 'cancel' },
        {
          text: '登入',
          onPress: () =>
            navigation.navigate('Login', {
              onLoginSuccess: (userData) => {
                setUser(userData);
                setIsLoggedIn(true);
              },
            }),
        },
      ]);
      return true;
    }
    return false;
  };

  /**
   * 🔧 導航函數 - 確保關閉 Modal
   */
  const navigateToBreathing = () => {
    if (showLoginPrompt()) return;
    
    console.log('🎯 [首頁] 準備導航到呼吸練習，先關閉 Modal');
    setShowPlanDetails(false);
    
    setTimeout(() => {
      console.log('🎯 [首頁] 導航到呼吸練習');
      navigation.navigate('PracticeNavigator', {
        practiceType: '呼吸穩定力練習',
        onPracticeComplete: async () => {
          console.log('✅ [首頁] 呼吸練習完成，重新載入進度');
          await loadHomeProgress();
        },
      });
    }, 100);
  };

  const navigateToGoodThings = () => {
    if (showLoginPrompt()) return;
    
    console.log('🎯 [首頁] 準備導航到好事書寫，先關閉 Modal');
    setShowPlanDetails(false);
    
    setTimeout(() => {
      console.log('🎯 [首頁] 導航到好事書寫');
      navigation.navigate('PracticeNavigator', {
        practiceType: '好事書寫',
        onPracticeComplete: async () => {
          console.log('✅ [首頁] 好事書寫完成，重新載入進度');
          await loadHomeProgress();
        },
      });
    }, 100);
  };

  const navigateToEmotionThermometer = () => {
    if (showLoginPrompt()) return;
    
    console.log('🌡️ [首頁] 準備導航到心情溫度計');
    setShowPlanDetails(false);
    
    setTimeout(() => {
      console.log('🌡️ [首頁] 導航到心情溫度計');
      navigation.navigate('PracticeNavigator', {
        practiceType: '心情溫度計',
        onPracticeComplete: async () => {
          console.log('✅ [首頁] 心情溫度計完成，重新載入進度');
          await loadHomeProgress();
        },
      });
    }, 100);
  };

  /**
   * 🧠 導航到思維調節練習
   */
  const navigateToCognitiveReframing = () => {
    if (showLoginPrompt()) return;
    
    console.log('🧠 [首頁] 準備導航到思維調節練習');
    setShowPlanDetails(false);
    
    setTimeout(() => {
      console.log('🧠 [首頁] 導航到思維調節練習');
      navigation.navigate('PracticeNavigator', {
        practiceType: '思維調節練習',
        onPracticeComplete: async () => {
          console.log('✅ [首頁] 思維調節練習完成，重新載入進度');
          await loadHomeProgress();
        },
      });
    }, 100);
  };

  /**
   * 💝 導航到感恩練習
   */
  const navigateToGratitude = () => {
    if (showLoginPrompt()) return;
    
    console.log('💝 [首頁] 準備導航到感恩練習');
    setShowPlanDetails(false);
    
    setTimeout(() => {
      console.log('💝 [首頁] 導航到感恩練習');
      navigation.navigate('PracticeNavigator', {
        practiceType: '感恩練習',
        onPracticeComplete: async () => {
          console.log('✅ [首頁] 感恩練習完成，重新載入進度');
          await loadHomeProgress();
        },
      });
    }, 100);
  };

  const navigateToResiliencePlan = () => {
    navigation.navigate('EmotionalResiliencePlan');
  };

  // 暫不實作的功能
  const handleNotImplemented = (featureName) => {
    Alert.alert('功能開發中', `${featureName}功能即將推出,敬請期待！`);
  };

  // ========== 計算完成度 ==========
  const totalTasks = Object.values(goals).reduce((acc, curr) => acc + curr.target, 0);
  const completedTasks = Object.values(goals).reduce((acc, curr) => acc + Math.min(curr.current, curr.target), 0);
  const progressPercentage = Math.round((completedTasks / totalTasks) * 100);

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
      action: navigateToBreathing,
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
      action: navigateToGoodThings,
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
      action: navigateToCognitiveReframing,
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
      action: navigateToGratitude, // ⭐ 改為實際導航
      current: goals.gratitude.current,
      target: goals.gratitude.target
    },
  ];

  // ========== 渲染 ==========

  // 載入畫面
  if (isInitializing) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar barStyle="light-content" backgroundColor="#166CB5" />
        <AppHeader navigation={navigation} />
        
        <View style={styles.loadingContent}>
          <ActivityIndicator size="large" color="#166CB5" />
          <Text style={styles.loadingText}>載入中...</Text>
        </View>
        
        <BottomNavigation navigation={navigation} currentRoute="Home" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#166CB5" />

      <AppHeader navigation={navigation} />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* 主標題 */}
        <View style={styles.titleSection}>
          <Text style={styles.mainTitle}>
            {isLoggedIn && user ? user.name : 'Jennifer'} 心理肌力養成計劃
          </Text>
        </View>

        {/* 分類標籤 */}
        <View style={styles.categorySection}>
          <TouchableOpacity
            onPress={() => setSelectedCategory('all')}
            style={[
              styles.categoryButton,
              selectedCategory === 'all' && styles.categoryButtonActive,
            ]}
          >
            <Text
              style={[
                styles.categoryText,
                selectedCategory === 'all' && styles.categoryTextActive,
              ]}
            >
              全部
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              console.log('📋 [首頁] 點擊計劃標籤');
              if (selectedCategory === 'plan') {
                setShowPlanDetails(true);
              } else {
                setSelectedCategory('plan');
              }
            }}
            activeOpacity={0.8}
          >
            {selectedCategory === 'plan' ? (
              <LinearGradient
                colors={['#166CB5', '#31C6FE']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.categoryButtonGradient}
              >
                <Text style={styles.categoryTextGradient}>情緒抗壓力計劃</Text>
              </LinearGradient>
            ) : (
              <View style={styles.categoryButton}>
                <Text style={styles.categoryText}>情緒抗壓力計劃</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* 計劃標題 & 進度 */}
        <View style={styles.planHeader}>
          <TouchableOpacity
            style={styles.planInfo}
            onPress={() => {
              console.log('📋 [首頁] 點擊查看詳情');
              setShowPlanDetails(true);
            }}
            activeOpacity={0.8}
          >
            <View style={styles.planTitleRow}>
              <Text style={styles.planTitle}>情緒抗壓力計劃</Text>
              <View style={styles.infoButton}>
                <Info color="#166CB5" size={12} />
                <Text style={styles.infoText}>點我看詳情</Text>
              </View>
            </View>
            <Text style={styles.planSubtitle}>今天也是心理韌性訓練的好日子！</Text>
          </TouchableOpacity>

          <View style={styles.progressInfo}>
            <Text style={styles.progressNumber}>{progressPercentage}%</Text>
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
              style={[styles.progressBarFill, { width: `${progressPercentage}%` }]}
            />
          </View>
        </View>

        {/* 練習網格 */}
        <View style={styles.practiceGrid}>
          {practiceModules.map((module, index) => {
            const Icon = module.icon;
            const isBlue = module.color === 'blue';
            const isCompleted = module.current >= module.target;

            return (
              <TouchableOpacity
                key={module.id}
                onPress={module.action}
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
                    {/* 頂部 */}
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

                    {/* 底部 */}
                    <View style={styles.practiceCardBottom}>
                      <Text style={styles.practiceTitleBlue}>{module.title}</Text>
                      <Text style={styles.practiceSubtitleBlue}>
                        {isCompleted ? '已完成目標' : '點擊開始練習'}
                      </Text>
                    </View>
                  </LinearGradient>
                ) : (
                  <View style={styles.practiceCardWhite}>
                    {/* 頂部 */}
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

                    {/* 底部 */}
                    <View style={styles.practiceCardBottom}>
                      <Text style={styles.practiceTitle}>{module.title}</Text>
                      <Text style={styles.practiceSubtitle}>
                        {isCompleted ? '已完成目標' : '點擊開始練習'}
                      </Text>
                    </View>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* ⭐ 心情溫度計卡片 - 完整版 */}
        <Pressable
          onPress={navigateToEmotionThermometer}
          style={({ pressed }) => [
            styles.thermometerCard,
            pressed && styles.thermometerCardPressed,
          ]}
        >
          {({ pressed }) => (
            <>
              {/* ⭐ 右側漸層光暈 */}
              <LinearGradient
                colors={['rgba(254, 243, 199, 0)', 'rgba(254, 243, 199, 0.8)']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.thermometerGlow}
                pointerEvents="none"
              />

              {/* 圖標容器 */}
              <View style={styles.thermometerIconContainer}>
                <View style={styles.thermometerIcon}>
                  <ThermometerSun color="#F59E0B" size={24} />
                </View>
              </View>

              {/* 文字信息 */}
              <View style={styles.thermometerInfo}>
                <Text style={styles.thermometerTitle}>心情溫度計</Text>
                <Text style={styles.thermometerProgress}>
                  {goals.thermometer.current}/{goals.thermometer.target}
                </Text>
              </View>

              {/* ⭐ 箭頭容器（動態變色） */}
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

        {/* 底部間距 */}
        <View style={styles.bottomPadding} />
      </ScrollView>

      <BottomNavigation navigation={navigation} currentRoute="Home" />

      {/* 🔧 計劃詳情彈窗 */}
      {showPlanDetails && (
        <PlanDetailsModal
          isOpen={showPlanDetails}
          onClose={() => {
            console.log('📋 [首頁] 關閉 Modal');
            setShowPlanDetails(false);
          }}
          onStartPlan={() => {
            console.log('📋 [首頁] Modal 內點擊開始計劃');
            setShowPlanDetails(false);
            setTimeout(() => {
              navigateToBreathing();
            }, 100);
          }}
        />
      )}

      {/* 🎉 計劃完成恭喜彈窗 */}
      {showCompletionModal && (
        <PlanCompletionModal
          isOpen={showCompletionModal}
          onClose={() => {
            console.log('🎊 [首頁] 關閉恭喜視窗');
            setShowCompletionModal(false);
          }}
        />
      )}

      {/* LOCK 覆蓋層 */}
      {!isLoggedIn && (
        <LockedOverlay 
          navigation={navigation} 
          reason="login"
          message="登入後開始你的練習之旅"
        />
      )}
      
      {isLoggedIn && !hasEnterpriseCode && (
        <LockedOverlay 
          navigation={navigation} 
          reason="enterprise-code"
          message="輸入企業引薦碼以解鎖完整功能"
        />
      )}
    </View>
  );
};

// ==========================================
// 樣式定義（保持不變）
// ==========================================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },

  // 載入畫面
  loadingContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  loadingContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
  },

  // 主標題
  titleSection: {
    paddingHorizontal: 20,
    paddingTop: 24,
    marginBottom: 24,
  },
  mainTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
  },

  // 分類標籤
  categorySection: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 24,
    gap: 12,
  },
  categoryButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    backgroundColor: '#F0F4F8',
    borderRadius: 100,
  },
  categoryButtonActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  categoryButtonGradient: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 100,
    shadowColor: '#166CB5',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  categoryTextActive: {
    color: '#111827',
    fontWeight: '600',
  },
  categoryTextGradient: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
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
  planTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333333',
  },
  infoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 100,
    gap: 4,
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

  // ==========================================
  // ⭐ 心情溫度計卡片樣式
  // ==========================================
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

  // ⭐ 卡片按壓效果
  thermometerCardPressed: {
    transform: [{ scale: 0.98 }],
    shadowOpacity: 0.15,
  },

  // ⭐ 右側漸層光暈
  thermometerGlow: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 80,
    height: '200%',
  },

  // 圖標容器
  thermometerIconContainer: {
    marginRight: 16,
    zIndex: 1,
  },

  // 圖標背景
  thermometerIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: '#FEF3C7',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // 文字信息
  thermometerInfo: {
    flex: 1,
    zIndex: 1,
  },

  // 標題
  thermometerTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#333333',
    marginBottom: 2,
  },

  // 進度文字
  thermometerProgress: {
    fontSize: 12,
    color: '#9CA3AF',
  },

  // ⭐ 箭頭容器（未按壓：灰色）
  thermometerArrowContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F9FAFB',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },

  // ⭐ 箭頭容器（按壓時：黃色）
  thermometerArrowContainerPressed: {
    backgroundColor: '#FBBF24',
  },

  // 底部間距
  bottomPadding: {
    height: 100,
  },
});

export default HomeScreen;