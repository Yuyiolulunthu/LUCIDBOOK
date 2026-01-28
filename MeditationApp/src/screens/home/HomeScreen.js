// ==========================================
// 檔案名稱: src/screens/home/HomeScreen.js
// 首頁畫面 - 支持多個系列 + 全部概覽 + 權限過濾
// ⭐ V9.0 - 卡片式設計 + 動態數據
// ==========================================

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  StatusBar,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import ApiService from '../../services/index';
import BottomNavigation from '../../navigation/BottomNavigation';
import AppHeader from '../../navigation/AppHeader';
import LockedOverlay from '../../navigation/LockedOverlay';
import PlanDetailsModal from './components/PlanDetailsModal';
import PlanCompletionModal from './components/PlanCompletionModal';
import EmotionalResilienceSeries from './series/EmotionalResilienceSeries';
import WorkplaceCommunicationSeries from './series/WorkplaceCommunicationSeries';
import { 
  Heart, 
  MessageCircle,
  ChevronRight,
  Target,
  TrendingUp,
} from 'lucide-react-native';

// ==========================================
// ⭐ 計劃卡片組件 - 新設計
// ==========================================
const PlanCard = ({ plan, onPress }) => {
  const Icon = plan.icon;
  const dotColor = plan.id === 'emotional-resilience' ? '#166CB5' : '#FF8C42';
  
  return (
    <TouchableOpacity
      onPress={onPress}
      style={styles.planCard}
      activeOpacity={0.8}
    >
      <View style={styles.planCardContainer}>
        {/* 圖標和標題 */}
        <View style={styles.planCardHeader}>
          <View style={[styles.planIconBadge, { backgroundColor: plan.gradientColors[0] + '15' }]}>
            <Icon color={plan.gradientColors[0]} size={24} strokeWidth={2} />
          </View>
          <Text style={styles.planCardTitle}>{plan.title}</Text>
        </View>

        {/* 進度條 */}
        <View style={styles.planProgressContainer}>
          <View style={styles.planProgressBarBg}>
            <LinearGradient
              colors={plan.gradientColors}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[styles.planProgressBarFill, { width: `${plan.progress}%` }]}
            />
          </View>
        </View>

        {/* 底部資訊 */}
        <View style={styles.planCardFooter}>
          <View style={styles.planCardStat}>
            <Text style={[styles.planCardStatIcon, { color: dotColor }]}>●</Text>
            <Text style={styles.planCardStatText}>{plan.units}單元</Text>
          </View>
          <View style={styles.planCardPercentage}>
            <Text style={styles.planCardPercentageIcon}>↗</Text>
            <Text style={styles.planCardPercentageText}>{plan.progress}%完成</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const HomeScreen = ({ navigation }) => {
  // ========== 狀態管理 ==========
  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [hasEnterpriseCode, setHasEnterpriseCode] = useState(false);
  const [showPlanDetails, setShowPlanDetails] = useState(false);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  
  // ⭐ 用戶可用的訓練計畫
  const [availableTrainingPlans, setAvailableTrainingPlans] = useState([]);
  
  // ⭐ 練習統計數據
  const [practiceStats, setPracticeStats] = useState({
    'emotional-resilience': { units: 4, totalSessions: 1, progress: 25 },
    'workplace-communication': { units: 4, totalSessions: 1, progress: 25 },
  });

  // ========== ⭐ 完整系列配置（定義所有可能的計畫）==========
  const allSeriesConfig = [
    {
      id: 'emotional-resilience',
      name: '情緒抗壓力計劃',
      shortName: '情緒抗壓力',
      icon: Heart,
      gradientColors: ['#166CB5', '#31C6FE'],
      glowColor: 'rgba(49, 198, 254, 0.3)',
    },
    {
      id: 'workplace-communication',
      name: '職場溝通力計劃',
      shortName: '職場溝通力',
      icon: MessageCircle,
      gradientColors: ['#FF8C42', '#FF6B6B'],
      glowColor: 'rgba(255, 140, 66, 0.3)',
    },
  ];

  // ⭐ 計劃卡片配置（完整列表）
  const allPlanCards = [
    {
      id: 'emotional-resilience',
      title: '情緒抗壓力計畫',
      subtitle: '打造強韌的心理素質',
      tags: ['呼吸練習', '好事書寫', '思維調節'],
      icon: Heart,
      gradientColors: ['#166CB5', '#31C6FE'],
      glowColor: 'rgba(49, 198, 254, 0.3)',
      progress: 0,
      units: 4,
      totalSessions: 1,
    },
    {
      id: 'workplace-communication',
      title: '職場溝通力計畫',
      subtitle: '提升職場溝通效率',
      tags: ['同理讀心術', '溝通轉譯器', '理智回穩力'],
      icon: MessageCircle,
      gradientColors: ['#FF8C42', '#FF6B6B'],
      glowColor: 'rgba(255, 140, 66, 0.3)',
      progress: 0,
      units: 4,
      totalSessions: 1,
    },
  ];

  // ⭐ 根據權限過濾系列和計劃卡片，並添加實際數據
  const seriesConfig = allSeriesConfig.filter(series => 
    availableTrainingPlans.includes(series.id)
  );

  const planCards = allPlanCards
    .filter(plan => availableTrainingPlans.includes(plan.id))
    .map(plan => ({
      ...plan,
      units: practiceStats[plan.id]?.units || plan.units,
      totalSessions: practiceStats[plan.id]?.totalSessions || plan.totalSessions,
      progress: practiceStats[plan.id]?.progress || plan.progress,
    }));

  // ========== 生命週期 ==========

  useEffect(() => {
    checkLoginStatus();
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      console.log('🔄 [首頁] 頁面獲得焦點，重新載入數據');
      checkLoginStatus();
    });
    return unsubscribe;
  }, [navigation]);

  // ========== 核心功能函數 ==========

  /**
   * ⭐⭐⭐ 唯一修改的地方：檢查登入狀態並獲取訓練計畫權限
   */
  const checkLoginStatus = async () => {
    try {
      const loggedIn = await ApiService.isLoggedIn();
      if (loggedIn) {
        const response = await ApiService.getUserProfile();
        console.log('📋 [首頁] API 回應:', response);
        
        if (response && response.user) {
          const userData = {
            id: response.user.id,
            name: response.user.name,
            email: response.user.email,
          };
          
          setUser(userData);
          setIsLoggedIn(true);

          const hasCode = !!response.user.enterprise_code;
          console.log('📋 [首頁] 企業引薦碼:', hasCode ? response.user.enterprise_code : '無');
          setHasEnterpriseCode(hasCode);
          
          // ⭐⭐⭐ 修改處：直接從 profile 讀取 training_plans
          if (hasCode) {
            // 從 profile.php 返回的 training_plans 取得權限
            const trainingPlans = response.user.training_plans || [];
            
            console.log('✅ [首頁] 訓練計畫權限（從 profile）:', trainingPlans);
            setAvailableTrainingPlans(trainingPlans);
            
            // ⭐ 載入練習統計數據
            if (trainingPlans.includes('emotional-resilience')) {
              loadPracticeStats();
            }
            
            // 如果當前選中的分類不在可用列表中，切回「全部」
            if (selectedCategory !== 'all' && !trainingPlans.includes(selectedCategory)) {
              console.log('📋 [首頁] 當前分類不可用，切換到「全部」');
              setSelectedCategory('all');
            }
          } else {
            // 沒有引薦碼，清空可用計畫
            setAvailableTrainingPlans([]);
          }
        } else {
          resetUserState();
        }
      } else {
        resetUserState();
      }
    } catch (error) {
      console.log('❌ [首頁] 檢查登入失敗:', error);
      resetUserState();
    } finally {
      setIsInitializing(false);
      console.log('🏁 [首頁] 初始化完成');
    }
  };

  /**
   * 重置用戶狀態
   */
  const resetUserState = () => {
    setIsLoggedIn(false);
    setUser(null);
    setHasEnterpriseCode(false);
    setAvailableTrainingPlans([]);
  };

  /**
   * ⭐ 載入練習統計數據
   */
  const loadPracticeStats = async () => {
    try {
      console.log("📊 [首頁] 載入練習統計數據...");
      
      const response = await ApiService.getPracticeStats();
      
      if (response.success && response.stats) {
        const stats = response.stats;
        
        // 情緒抗壓力
        const emotionalPlan = stats.plans?.["emotional-resilience"];
        const emotionalProgress = emotionalPlan?.progress || 0;
        const emotionalSessions = emotionalPlan?.totalSessions || 0;
        
        // 職場溝通力（只算內耗終止鍵）
        const workplacePlan = stats.plans?.["workplace-communication"];
        const workplaceProgress = workplacePlan?.progress || 0; // 最高 25%
        const workplaceSessions = workplacePlan?.totalSessions || 0; // 實際累計次數
        
        console.log("✅ [首頁] 職場溝通力:", {
          progress: workplaceProgress,
          sessions: workplaceSessions
        });
        
        setPracticeStats({
          "emotional-resilience": {
            units: 4,
            totalSessions: emotionalSessions,
            progress: emotionalProgress,
          },
          "workplace-communication": {
            units: 4,
            totalSessions: workplaceSessions,
            progress: workplaceProgress,
          },
        });
      }
    } catch (error) {
      console.error("❌ [首頁] 載入練習統計失敗:", error);
    }
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
                checkLoginStatus(); // 重新檢查獲取權限
              },
            }),
        },
      ]);
      return true;
    }
    return false;
  };

  /**
   * ⭐ 處理計劃卡片點擊 - 切換分類而不是導航
   */
  const handlePlanCardPress = (plan) => {
    if (!isLoggedIn) {
      showLoginPrompt();
      return;
    }
    
    console.log('📋 [首頁] 切換到分類:', plan.id);
    // ⭐ 直接設置分類，不要導航
    setSelectedCategory(plan.id);
  };

  /**
   * 渲染當前選中的內容
   */
  const renderCurrentContent = () => {
    // ⭐ 全部分類：顯示計劃卡片（過濾後的）
    if (selectedCategory === 'all') {
      return (
        <View style={styles.allCategoryContainer}>
          {/* 歡迎標題 */}
          <View style={styles.welcomeSection}>
            <Text style={styles.welcomeTitle}>
              {user?.name || 'OO'}的練習計畫概覽
            </Text>
            <Text style={styles.welcomeSubtitle}>
              今天也是訓練心裡韌勁的好日子！
            </Text>
          </View>

          {/* ⭐ 計劃卡片列表（根據權限過濾）*/}
          {planCards.length > 0 ? (
            <View style={styles.planCardsContainer}>
              {planCards.map((plan) => (
                <PlanCard
                  key={plan.id}
                  plan={plan}
                  onPress={() => handlePlanCardPress(plan)}
                />
              ))}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>
                🔒 目前沒有可用的訓練計劃
              </Text>
              <Text style={styles.emptyStateHint}>
                請聯繫管理員開通權限
              </Text>
            </View>
          )}
        </View>
      );
    }

    // 特定系列：顯示對應組件
    switch (selectedCategory) {
      case 'emotional-resilience':
        return (
          <EmotionalResilienceSeries
            navigation={navigation}
            isLoggedIn={isLoggedIn}
            userName={user?.name}
            onShowPlanDetails={() => setShowPlanDetails(true)}
            onShowCompletionModal={() => setShowCompletionModal(true)}
          />
        );
      case 'workplace-communication':
        return (
          <WorkplaceCommunicationSeries 
            navigation={navigation}
            userName={user?.name}
          />
        );
      default:
        return null;
    }
  };

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
          <Text style={styles.sectionLabel}>選擇練習計劃</Text>
        </View>

        {/* ⭐ 分類標籤（根據權限過濾）*/}
        {planCards.length > 0 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categorySection}
          >
            {/* 全部 */}
            <TouchableOpacity
              onPress={() => setSelectedCategory('all')}
              activeOpacity={0.8}
            >
              {selectedCategory === 'all' ? (
                <LinearGradient
                  colors={['#166CB5', '#31C6FE']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.categoryButtonGradient}
                >
                  <Text style={styles.categoryTextGradient}>全部</Text>
                </LinearGradient>
              ) : (
                <View style={styles.categoryButton}>
                  <Text style={styles.categoryText}>全部</Text>
                </View>
              )}
            </TouchableOpacity>

            {/* ⭐ 根據權限顯示分類標籤 */}
            {seriesConfig.map((series) => {
              const isWorkplace = series.id === 'workplace-communication';
              const gradientColors = isWorkplace 
                ? ['#FF8C42', '#FF6B6B']
                : ['#166CB5', '#31C6FE'];
              const shadowColor = isWorkplace ? '#FF8C42' : '#166CB5';
              
              return (
                <TouchableOpacity
                  key={series.id}
                  onPress={() => {
                    console.log('📋 [首頁] 切換到系列:', series.name);
                    setSelectedCategory(series.id);
                  }}
                  activeOpacity={0.8}
                >
                  {selectedCategory === series.id ? (
                    <LinearGradient
                      colors={gradientColors}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={[
                        styles.categoryButtonGradient,
                        { shadowColor: shadowColor }
                      ]}
                    >
                      <Text style={styles.categoryTextGradient}>{series.shortName}</Text>
                    </LinearGradient>
                  ) : (
                    <View style={styles.categoryButton}>
                      <Text style={styles.categoryText}>{series.shortName}</Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        )}

        {/* ⭐ 渲染當前選中的內容 */}
        {renderCurrentContent()}

        {/* 底部間距 */}
        <View style={styles.bottomPadding} />
      </ScrollView>

      <BottomNavigation navigation={navigation} currentRoute="Home" />

      {/* 計劃詳情彈窗 */}
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
              if (!showLoginPrompt()) {
                navigation.navigate('PracticeNavigator', {
                  practiceType: '呼吸穩定力練習',
                });
              }
            }, 100);
          }}
        />
      )}

      {/* 計劃完成恭喜彈窗 */}
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
// 樣式定義
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
  sectionLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },

  // 分類標籤
  categorySection: {
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
  categoryTextGradient: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
  },

  // ========== ⭐ 全部分類容器 ==========
  allCategoryContainer: {
    paddingHorizontal: 20,
  },

  // 歡迎區域
  welcomeSection: {
    marginBottom: 24,
  },
  welcomeTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 6,
  },
  welcomeSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },

  // ========== ⭐ 空狀態 ==========
  emptyState: {
    paddingVertical: 60,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 8,
  },
  emptyStateHint: {
    fontSize: 14,
    color: '#9CA3AF',
  },

  // ========== ⭐ 計劃卡片樣式 - 新設計 ==========
  planCardsContainer: {
    gap: 16,
    marginBottom: 32,
  },
  planCard: {
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    // 多重陰影效果
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  planCardContainer: {
    padding: 20,
  },
  planCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  planIconBadge: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  planCardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  planProgressContainer: {
    marginBottom: 16,
  },
  planProgressBarBg: {
    height: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 4,
    overflow: 'hidden',
  },
  planProgressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  planCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  planCardStat: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  planCardStatIcon: {
    fontSize: 8,
    marginRight: 6,
  },
  planCardStatText: {
    fontSize: 13,
    color: '#6B7280',
  },
  planCardPercentage: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  planCardPercentageIcon: {
    fontSize: 14,
    color: '#6B7280',
    marginRight: 4,
  },
  planCardPercentageText: {
    fontSize: 13,
    color: '#6B7280',
  },

  // 底部間距
  bottomPadding: {
    height: 100,
  },
});

export default HomeScreen;