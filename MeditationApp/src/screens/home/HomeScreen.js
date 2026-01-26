// ==========================================
// 檔案名稱: src/screens/home/HomeScreen.js
// 首頁畫面 - 支持多個系列
// 版本: V6.0 - 支持多系列切換
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

const HomeScreen = ({ navigation }) => {
  // ========== 狀態管理 ==========
  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('emotional-resilience');
  const [hasEnterpriseCode, setHasEnterpriseCode] = useState(false);
  const [showPlanDetails, setShowPlanDetails] = useState(false);
  const [showCompletionModal, setShowCompletionModal] = useState(false);

  // ========== 系列配置 ==========
  const seriesConfig = [
    {
      id: 'emotional-resilience',
      name: '情緒抗壓力計劃',
      shortName: '情緒抗壓力',
    },
    {
      id: 'workplace-communication',
      name: '職場溝通力計劃',
      shortName: '職場溝通力',
    },
  ];

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
   * 渲染當前選中的系列
   */
  const renderCurrentSeries = () => {
    switch (selectedCategory) {
      case 'emotional-resilience':
        return (
          <EmotionalResilienceSeries
            navigation={navigation}
            isLoggedIn={isLoggedIn}
            onShowPlanDetails={() => setShowPlanDetails(true)}
            onShowCompletionModal={() => setShowCompletionModal(true)}
          />
        );
      case 'workplace-communication':
        return <WorkplaceCommunicationSeries navigation={navigation} />;
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

        {/* 分類標籤 */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categorySection}
        >
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

          {seriesConfig.map((series) => {
            // ⭐ 根據系列決定顏色
            const isWorkplace = series.id === 'workplace-communication';
            const gradientColors = isWorkplace 
              ? ['#FF8C42', '#FF6B6B']  // 橘色漸層
              : ['#166CB5', '#31C6FE']; // 藍色漸層
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

          {/* 當前選中的系列 - 傳遞 userName */}
          {selectedCategory === 'emotional-resilience' ? (
            <EmotionalResilienceSeries
              navigation={navigation}
              isLoggedIn={isLoggedIn}
              userName={user?.name}
              onShowPlanDetails={() => setShowPlanDetails(true)}
              onShowCompletionModal={() => setShowCompletionModal(true)}
            />
          ) : selectedCategory === 'workplace-communication' ? (
            <WorkplaceCommunicationSeries 
              navigation={navigation}
              userName={user?.name}
            />
          ) : null}

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
  mainTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
  },
  sectionLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  categoryButtonGradient: {
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 100,
    shadowColor: '#FF8C42',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
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

  // 底部間距
  bottomPadding: {
    height: 100,
  },
});

export default HomeScreen;