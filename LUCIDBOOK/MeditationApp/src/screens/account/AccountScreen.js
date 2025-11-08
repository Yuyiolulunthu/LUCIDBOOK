// ==========================================
// 檔案名稱: AccountScreen.js
// 版本: V3.1 - 完全符合設計稿
// 
// ✅ Logo + 文字組合（路晰書 LUCIDBOOK）
// ✅ 漸層背景大幅縮短
// ✅ 練習概況白色卡片框架
// ✅ 成就徽章方形圓角設計（完全符合設計圖）
// ✅ 已解鎖徽章：彩色漸層 + 右上角金色星星
// ✅ 未解鎖徽章：灰白色虛線框
// ==========================================

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  StatusBar,
  Image,
  Alert,
  ActivityIndicator,
  Modal,
  Dimensions,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { LinearGradient } from 'expo-linear-gradient';
import BottomNavigation from '../../navigation/BottomNavigation';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ApiService from '../../../api';

const { width } = Dimensions.get('window');

const AccountScreen = ({ navigation, route }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [avatar, setAvatar] = useState(null);
  
  // 練習統計數據
  const [practiceStats, setPracticeStats] = useState({
    totalPractices: 0,
    totalDays: 0,
    currentStreak: 0,
    longestStreak: 0,
    averageSatisfaction: 0,
    favoriteExercise: '尚未開始練習',
  });

  // 成就數據
  const [achievements, setAchievements] = useState([]);
  const [selectedAchievement, setSelectedAchievement] = useState(null);

  // 載入用戶資料
  useEffect(() => {
    loadUserData();
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadUserData();
    });
    return unsubscribe;
  }, [navigation]);

  // 當 practiceStats 更新時，如果 achievements 為空或需要更新，重新設置預設成就
  useEffect(() => {
    if (isLoggedIn && achievements.length === 0) {
      setAchievements(getDefaultAchievements());
    }
  }, [practiceStats, isLoggedIn]);

  const loadUserData = async () => {
    try {
      setLoading(true);
      
      const loggedIn = await ApiService.isLoggedIn();
      
      if (loggedIn) {
        try {
          // 獲取用戶資料
          const response = await ApiService.getUserProfile();
          const userData = {
            id: response.user.id,
            name: response.user.name,
            email: response.user.email,
            created_at: response.user.created_at,
          };
          
          setUser(userData);
          setIsLoggedIn(true);
          
          // 載入頭像
          const savedAvatar = await AsyncStorage.getItem('userAvatar');
          if (savedAvatar) setAvatar(savedAvatar);
          
          // 載入練習統計
          await loadPracticeStats();
          
          // 載入成就數據
          await loadAchievements();
        } catch (error) {
          console.log('Token 無效，清除登入狀態');
          await ApiService.clearToken();
          setIsLoggedIn(false);
          setUser(null);
          setAchievements([]);
        }
      } else {
        setIsLoggedIn(false);
        setUser(null);
        // 未登入時也初始化空的成就數據
        setAchievements([]);
      }
    } catch (error) {
      console.error('載入用戶資料失敗:', error);
      setIsLoggedIn(false);
      setUser(null);
      // 錯誤時也初始化空的成就數據
      setAchievements([]);
    } finally {
      setLoading(false);
    }
  };

  // 載入練習統計
  const loadPracticeStats = async () => {
    try {
      const response = await ApiService.getPracticeStats();
      if (response.success) {
        setPracticeStats(response.stats);
      }
    } catch (error) {
      console.error('載入練習統計失敗:', error);
    }
  };

  // 載入成就數據
  const loadAchievements = async () => {
    try {
      const response = await ApiService.getAchievements();
      if (response.success) {
        // 轉換數據，添加 gradientColors
        const transformedAchievements = response.achievements.map(achievement => ({
          ...achievement,
          gradientColors: achievement.gradientColors || [
            achievement.color,
            achievement.color
          ]
        }));
        setAchievements(transformedAchievements);
      } else {
        setAchievements(getDefaultAchievements());
      }
    } catch (error) {
      console.error('載入成就失敗:', error);
      setAchievements(getDefaultAchievements());
    }
  };

  // 預設成就數據
  const getDefaultAchievements = () => [
    { 
      id: 1, 
      name: '初心者', 
      description: '完成第一次練習', 
      icon: '🌱', 
      unlocked: practiceStats.totalPractices >= 1, 
      gradientColors: ['#10B981', '#059669'],
      unlockedDate: practiceStats.totalPractices >= 1 ? new Date().toISOString() : null,
      requirement: '完成第一次呼吸練習',
      progress: `${Math.min(practiceStats.totalPractices, 1)}/1`,
    },
    { 
      id: 2, 
      name: '持續練習', 
      description: '連續3天打卡', 
      icon: '🔥', 
      unlocked: practiceStats.currentStreak >= 3, 
      gradientColors: ['#F59E0B', '#EF4444'],
      unlockedDate: practiceStats.currentStreak >= 3 ? new Date().toISOString() : null,
      requirement: '連續3天完成練習打卡',
      progress: `${practiceStats.currentStreak}/3`,
    },
    { 
      id: 3, 
      name: '練習達人', 
      description: '累積10次練習', 
      icon: '⭐', 
      unlocked: practiceStats.totalPractices >= 10, 
      gradientColors: ['#FBBF24', '#F59E0B'],
      unlockedDate: practiceStats.totalPractices >= 10 ? new Date().toISOString() : null,
      requirement: '累積完成10次練習',
      progress: `${practiceStats.totalPractices}/10`,
    },
    { 
      id: 4, 
      name: '專注大師', 
      description: '專注度平均85%以上', 
      icon: '🎯', 
      unlocked: practiceStats.averageSatisfaction >= 85, 
      gradientColors: ['#3B82F6', '#2563EB'],
      requirement: '練習時保持專注度平均達到85%以上',
      progress: `${practiceStats.averageSatisfaction}/85%`,
    },
    { 
      id: 5, 
      name: '情緒管理師', 
      description: '完成所有情緒練習', 
      icon: '💎', 
      unlocked: false, 
      gradientColors: ['#A855F7', '#9333EA'],
      requirement: '完成所有4種情緒理解練習',
      progress: '0/4',
    },
    { 
      id: 6, 
      name: '正念行者', 
      description: '連續7天打卡', 
      icon: '🏆', 
      unlocked: practiceStats.currentStreak >= 7, 
      gradientColors: ['#06B6D4', '#0891B2'],
      requirement: '連續7天完成練習打卡',
      progress: `${practiceStats.currentStreak}/7`,
    },
  ];

  const handleLogin = () => {
    navigation.navigate('Login');
  };

  const handleLogout = () => {
    Alert.alert(
      '確認登出',
      '確定要登出嗎？',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '登出',
          style: 'destructive',
          onPress: async () => {
            try {
              await ApiService.logout();
              await AsyncStorage.removeItem('userAvatar');
              setIsLoggedIn(false);
              setUser(null);
              setAvatar(null);
              Alert.alert('已登出', '期待下次再見！');
            } catch (error) {
              console.error('登出失敗:', error);
            }
          }
        }
      ]
    );
  };

  const handleNavigateStats = () => {
    navigation.navigate('PracticeStats');
  };

  const handleNavigateFavorites = () => {
    navigation.navigate('Favorites');
  };

  const handleNavigateSettings = () => {
    navigation.navigate('Settings');
  };

  const handleNavigateFeedback = () => {
    navigation.navigate('Feedback');
  };

  // 載入中
  if (loading) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#F9FAFB" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#166CB5" />
          <Text style={styles.loadingText}>載入中...</Text>
        </View>
        <BottomNavigation navigation={navigation} activeTab="profile" />
      </View>
    );
  }

  // 未登入狀態
  if (!isLoggedIn) {
    return (
      <View style={styles.container}>
        {/* 添加這些 Debug */}
        {console.log('=== 渲染前檢查 ===')}
        {console.log('isLoggedIn:', isLoggedIn)}
        {console.log('user:', user)}
        {console.log('achievements:', achievements)}
        {console.log('practiceStats:', practiceStats)}
        {console.log('=====================')}
        <StatusBar barStyle="light-content" backgroundColor="#166CB5" />
        
        {/* Header */}
        <LinearGradient
          colors={['#166CB5', '#31C6FE']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.loginHeader}
        >
          <Text style={styles.loginHeaderTitle}>我的練心書</Text>
        </LinearGradient>

        <ScrollView 
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.loginPromptContainer}>
            <View style={styles.iconCircle}>
              <Ionicons name="person-outline" size={64} color="#9CA3AF" />
            </View>
            
            <Text style={styles.loginPromptTitle}>登入以查看您的資料</Text>
            <Text style={styles.loginPromptText}>
              登入後可以同步您的練習記錄、設定個人目標，並享受更多個性化功能
            </Text>

            <TouchableOpacity 
              style={styles.loginButton}
              onPress={handleLogin}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#166CB5', '#31C6FE']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.loginButtonGradient}
              >
                <Text style={styles.loginButtonText}>立即登入</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </ScrollView>

        <BottomNavigation navigation={navigation} activeTab="profile" />
      </View>
    );
  }

  // 已登入狀態
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#166CB5" />
      
      {/* 藍色漸層背景區域 - 大幅縮短 */}
      <LinearGradient
        colors={['#166CB5', '#2B9FD9', '#31C6FE']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.gradientBackground}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={handleNavigateSettings}
          >
            <Ionicons name="settings-outline" size={24} color="#FFF" />
          </TouchableOpacity>

          {/* Logo + 文字 */}
          <View style={styles.logoContainer}>
            <Image 
              source={require('../../../assets/images/lucidlogo.png')}
              style={styles.logoImageSmall}
              resizeMode="contain"
            />
            <View style={styles.logoTextContainer}>
              <Text style={styles.logoTitle}>路晰書</Text>
              <Text style={styles.logoSubtitle}>LUCIDBOOK</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.headerButton}>
            <Ionicons name="notifications-outline" size={24} color="#FFF" />
            <View style={styles.notificationBadge}>
              <Text style={styles.notificationText}>2</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* 標題 */}
        <Text style={styles.pageTitle}>我的練心書</Text>

        {/* 個人資料卡片 */}
        <View style={styles.profileCard}>
          <View style={styles.profileHeader}>
            {/* 頭像 - 方形圓角 */}
            <View style={styles.avatarContainer}>
              {avatar ? (
                <Image source={{ uri: avatar }} style={styles.avatarImage} />
              ) : (
                <LinearGradient
                  colors={['#166CB5', '#31C6FE']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.avatarSquare}
                >
                  <Text style={styles.avatarText}>
                    {user.name.charAt(0).toUpperCase()}
                  </Text>
                </LinearGradient>
              )}
              <View style={styles.onlineIndicator} />
            </View>

            {/* 用戶信息 */}
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{user.name}</Text>
              <Text style={styles.joinDate}>
                加入 {Math.floor((new Date().getTime() - new Date(user.created_at || Date.now()).getTime()) / (1000 * 60 * 60 * 24))} 天
              </Text>
              
              <View style={styles.userDetailsContainer}>
                <View style={styles.userDetailRow}>
                  <Ionicons name="mail-outline" size={14} color="#6B7280" />
                  <Text style={styles.userDetail} numberOfLines={1}>{user.email}</Text>
                </View>
              </View>
            </View>
          </View>

          {/* 快速統計 - 3 個數字 */}
          <View style={styles.quickStats}>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: '#166CB5' }]}>
                {practiceStats.totalPractices}
              </Text>
              <Text style={styles.statLabel}>總練習</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: '#31C6FE' }]}>
                {practiceStats.currentStreak}
              </Text>
              <Text style={styles.statLabel}>連續天</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: '#A855F7' }]}>
                {practiceStats.averageSatisfaction}%
              </Text>
              <Text style={styles.statLabel}>滿意度</Text>
            </View>
          </View>
        </View>
      </LinearGradient>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* 練習概況 - 白色卡片框架 */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons name="chart-line" size={20} color="#166CB5" />
            <Text style={styles.sectionTitle}>練習概況</Text>
          </View>
          
          <View style={styles.overviewCard}>
            <View style={[styles.overviewRow, { backgroundColor: '#EFF6FF' }]}>
              <Text style={styles.overviewLabel}>累積練習天數</Text>
              <Text style={[styles.overviewValue, { color: '#31C6FE' }]}>
                {practiceStats.totalDays} 天
              </Text>
            </View>
            
            <View style={[styles.overviewRow, { backgroundColor: '#FAF5FF' }]}>
              <Text style={styles.overviewLabel}>最長連續紀錄</Text>
              <Text style={[styles.overviewValue, { color: '#A855F7' }]}>
                {practiceStats.longestStreak} 天
              </Text>
            </View>
            
            <View style={[styles.overviewRow, { backgroundColor: '#ECFDF5' }]}>
              <Text style={styles.overviewLabel}>最常練習</Text>
              <Text style={[styles.overviewValue, { color: '#10B981', fontSize: 14 }]} numberOfLines={1}>
                {practiceStats.favoriteExercise}
              </Text>
            </View>
          </View>
        </View>

        {/* 成就徽章 - 完全符合設計圖 */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons name="medal-outline" size={20} color="#1c61b1ff" />
            <Text style={styles.sectionTitle}>成就徽章</Text>
            <Text style={styles.achievementCount}>
              {achievements?.filter(a => a.unlocked).length || 0}/{achievements?.length || 0}
            </Text>
          </View>

          {/* 添加這個 Debug 代碼 */}
          {console.log('achievements 的值:', achievements)}
          {console.log('achievements 的類型:', typeof achievements)}
          {console.log('achievements 是否為陣列:', Array.isArray(achievements))}
          
          <View style={styles.achievementContainer}>
            <View style={styles.achievementGrid}>
              {(achievements || []).map((achievement) => (
                <TouchableOpacity
                  key={achievement.id}
                  style={styles.achievementItemContainer}
                  onPress={() => setSelectedAchievement(achievement)}
                  activeOpacity={0.8}
                >
                  {achievement.unlocked ? (
                    // 已解鎖：彩色漸層背景
                    <LinearGradient
                      colors={achievement.gradientColors}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.achievementCardUnlocked}
                    >
                      {/* 右上角金色星星徽章 */}
                      <View style={styles.achievementStarBadge}>
                        <Ionicons name="star" size={12} color="#FFF" />
                      </View>
                      
                      <Text style={styles.achievementEmojiUnlocked}>
                        {achievement.icon}
                      </Text>
                      <Text style={styles.achievementNameUnlocked}>
                        {achievement.name}
                      </Text>
                    </LinearGradient>
                  ) : (
                    // 未解鎖：灰白色虛線框
                    <View style={styles.achievementCardLocked}>
                      <Text style={styles.achievementEmojiLocked}>
                        {achievement.icon}
                      </Text>
                      <Text style={styles.achievementNameLocked}>
                        {achievement.name}
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* 功能按鈕區域 */}
        <View style={styles.section}>
          {/* 帳號設定 */}
          <TouchableOpacity 
            style={styles.menuCard}
            onPress={handleNavigateSettings}
            activeOpacity={0.7}
          >
            <View style={[styles.menuIconContainer, { backgroundColor: '#EFF6FF' }]}>
              <Ionicons name="settings-outline" size={20} color="#166CB5" />
            </View>
            <Text style={styles.menuLabel}>帳號設定</Text>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>

          {/* 練習收藏 */}
          <TouchableOpacity 
            style={styles.menuCard}
            onPress={handleNavigateFavorites}
            activeOpacity={0.7}
          >
            <View style={[styles.menuIconContainer, { backgroundColor: '#FEF3C7' }]}>
              <Ionicons name="bookmark-outline" size={20} color="#F59E0B" />
            </View>
            <Text style={styles.menuLabel}>練習收藏</Text>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>

          {/* 練習統計 */}
          <TouchableOpacity 
            style={styles.menuCard}
            onPress={handleNavigateStats}
            activeOpacity={0.7}
          >
            <View style={[styles.menuIconContainer, { backgroundColor: '#D1FAE5' }]}>
              <MaterialCommunityIcons name="chart-line" size={20} color="#10B981" />
            </View>
            <Text style={styles.menuLabel}>練習統計</Text>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>

          {/* 意見回饋 */}
          <TouchableOpacity 
            style={styles.menuCard}
            onPress={handleNavigateFeedback}
            activeOpacity={0.7}
          >
            <View style={[styles.menuIconContainer, { backgroundColor: '#FEE2E2' }]}>
              <Ionicons name="heart-outline" size={20} color="#EF4444" />
            </View>
            <Text style={styles.menuLabel}>意見回饋</Text>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* 成就詳情 Modal */}
      <Modal
        visible={selectedAchievement !== null}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setSelectedAchievement(null)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setSelectedAchievement(null)}
        >
          <View style={styles.modalContent}>
            <LinearGradient
              colors={selectedAchievement?.unlocked 
                ? selectedAchievement?.gradientColors || ['#166CB5', '#31C6FE']
                : ['#9CA3AF', '#6B7280']
              }
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.modalHeader}
            >
              <TouchableOpacity 
                style={styles.modalCloseButton}
                onPress={() => setSelectedAchievement(null)}
              >
                <Ionicons name="close" size={24} color="#FFF" />
              </TouchableOpacity>
              
              <Text style={styles.modalIcon}>{selectedAchievement?.icon}</Text>
              <Text style={styles.modalTitle}>{selectedAchievement?.name}</Text>
              <Text style={styles.modalDescription}>{selectedAchievement?.description}</Text>
            </LinearGradient>

            <View style={styles.modalBody}>
              <View style={[
                styles.modalStatusBadge,
                { backgroundColor: selectedAchievement?.unlocked ? '#10B981' : '#9CA3AF' }
              ]}>
                <Ionicons 
                  name={selectedAchievement?.unlocked ? "checkmark-circle" : "lock-closed"} 
                  size={20} 
                  color="#FFF" 
                />
                <Text style={styles.modalStatusText}>
                  {selectedAchievement?.unlocked ? '已解鎖' : '尚未解鎖'}
                </Text>
              </View>

              <View style={styles.modalInfoCard}>
                <MaterialCommunityIcons name="target" size={24} color="#166CB5" />
                <View style={styles.modalInfoText}>
                  <Text style={styles.modalInfoLabel}>達成條件</Text>
                  <Text style={styles.modalInfoValue}>{selectedAchievement?.requirement}</Text>
                </View>
              </View>

              <View style={styles.modalInfoCard}>
                <MaterialCommunityIcons name="chart-line" size={24} color="#A855F7" />
                <View style={styles.modalInfoText}>
                  <Text style={styles.modalInfoLabel}>進度</Text>
                  <Text style={styles.modalInfoValue}>{selectedAchievement?.progress}</Text>
                </View>
              </View>

              <TouchableOpacity 
                style={styles.modalButton}
                onPress={() => setSelectedAchievement(null)}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={['#166CB5', '#31C6FE']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.modalButtonGradient}
                >
                  <Text style={styles.modalButtonText}>知道了</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>

      <BottomNavigation navigation={navigation} activeTab="profile" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6B7280',
  },

  // === 藍色漸層背景區域（大幅縮短） ===
  gradientBackground: {
    paddingTop: 50,
    paddingBottom: 15,
    paddingHorizontal: 20,
  },

  // === Header ===
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#EF4444',
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: 'bold',
  },

  // === Logo + 文字組合 ===
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
    justifyContent: 'center',
  },
  logoImageSmall: {
    width: 32,
    height: 32,
  },
  logoTextContainer: {
    alignItems: 'flex-start',
  },
  logoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFF',
    letterSpacing: 0.5,
  },
  logoSubtitle: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.9)',
    letterSpacing: 1,
  },

  // === 頁面標題 ===
  pageTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 20,
  },

  // === 個人資料卡片 ===
  profileCard: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 16,
  },
  avatarSquare: {
    width: 80,
    height: 80,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#166CB5',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  avatarImage: {
    width: 80,
    height: 80,
    borderRadius: 16,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFF',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#10B981',
    borderWidth: 3,
    borderColor: '#FFF',
  },
  userInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 2,
  },
  joinDate: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 10,
  },
  userDetailsContainer: {
    gap: 6,
  },
  userDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  userDetail: {
    fontSize: 14,
    color: '#6B7280',
    flex: 1,
  },

  // === 快速統計 ===
  quickStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#E5E7EB',
  },

  // === ScrollView ===
  scrollView: {
    flex: 1,
    marginTop: -10,
  },
  scrollContent: {
    paddingBottom: 100,
  },

  // === Section ===
  section: {
    paddingHorizontal: 20,
    marginTop: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginLeft: 8,
    flex: 1,
  },
  achievementIcon: {
    fontSize: 20,
  },
  achievementCount: {
    fontSize: 12,
    color: '#6B7280',
  },

  // === 練習概況 - 白色卡片框架 ===
  overviewCard: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  overviewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 16,
    marginVertical: 4,
  },
  overviewLabel: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  overviewValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },

  // === 成就徽章 - 完全符合設計圖 ===
  achievementContainer: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  achievementGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  achievementItemContainer: {
    width: (width - 72)*4 / 13,
    aspectRatio: 1,
  },
  // 已解鎖：彩色漸層背景
  achievementCardUnlocked: {
    flex: 1,
    borderRadius: 20,
    padding: 12,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  achievementStarBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#F59E0B',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 3,
  },
  achievementEmojiUnlocked: {
    fontSize: 36,
    marginBottom: 6,
  },
  achievementNameUnlocked: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFF',
    textAlign: 'center',
    lineHeight: 16,
  },
  // 未解鎖：灰白色虛線框
  achievementCardLocked: {
    flex: 1,
    borderRadius: 20,
    padding: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#D1D5DB',
  },
  achievementEmojiLocked: {
    fontSize: 36,
    marginBottom: 6,
    opacity: 0.4,
  },
  achievementNameLocked: {
    fontSize: 12,
    fontWeight: '600',
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 16,
  },

  // === 功能按鈕 ===
  menuCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  menuLabel: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
  },

  bottomPadding: {
    height: 20,
  },

  // === 未登入狀態 ===
  loginHeader: {
    paddingTop: 50,
    paddingBottom: 24,
    paddingHorizontal: 20,
  },
  loginHeaderTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFF',
  },
  loginPromptContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingTop: 80,
  },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  loginPromptTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 12,
    textAlign: 'center',
  },
  loginPromptText: {
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  loginButton: {
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#166CB5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  loginButtonGradient: {
    paddingVertical: 16,
    paddingHorizontal: 48,
  },
  loginButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },

  // === Modal ===
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderRadius: 24,
    width: '100%',
    maxWidth: 400,
    overflow: 'hidden',
  },
  modalHeader: {
    padding: 32,
    alignItems: 'center',
    position: 'relative',
  },
  modalCloseButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 8,
  },
  modalDescription: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
  },
  modalBody: {
    padding: 24,
  },
  modalStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    alignSelf: 'center',
    marginBottom: 20,
  },
  modalStatusText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  modalInfoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  modalInfoText: {
    flex: 1,
    marginLeft: 12,
  },
  modalInfoLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  modalInfoValue: {
    fontSize: 14,
    color: '#6B7280',
  },
  modalButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 8,
  },
  modalButtonGradient: {
    paddingVertical: 16,
  },
  modalButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default AccountScreen;