// ==========================================
// 檔案名稱: AccountScreen.js
// ✅ 練習概況
// ✅ 成就徽章系統
// ✅ 練習統計
// ✅ 整合 ApiService
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
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import BottomNavigation from '../../navigation/BottomNavigation';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ApiService from '../../../api';

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
        }
      } else {
        setIsLoggedIn(false);
        setUser(null);
      }
    } catch (error) {
      console.error('載入用戶資料失敗:', error);
      setIsLoggedIn(false);
      setUser(null);
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
        setAchievements(response.achievements);
      }
    } catch (error) {
      console.error('載入成就失敗:', error);
      // 使用預設成就數據
      setAchievements(getDefaultAchievements());
    }
  };

  // 預設成就數據（如果後端還沒準備好）
  const getDefaultAchievements = () => [
    { 
      id: 1, 
      name: '初心者', 
      description: '完成第一次練習', 
      icon: '🌱', 
      unlocked: practiceStats.totalPractices >= 1, 
      color: '#10B981',
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
      color: '#F59E0B',
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
      color: '#FBBF24',
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
      color: '#3B82F6',
      requirement: '練習時保持專注度平均達到85%以上',
      progress: `${practiceStats.averageSatisfaction}/85%`,
    },
    { 
      id: 5, 
      name: '情緒管理師', 
      description: '完成所有情緒練習', 
      icon: '💎', 
      unlocked: false, 
      color: '#A855F7',
      requirement: '完成所有4種情緒理解練習',
      progress: '0/4',
    },
    { 
      id: 6, 
      name: '正念行者', 
      description: '連續7天打卡', 
      icon: '🏆', 
      unlocked: practiceStats.currentStreak >= 7, 
      color: '#06B6D4',
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

  // 導航到統計頁面
  const handleNavigateStats = () => {
    navigation.navigate('PracticeStats');
  };

  // 導航到收藏頁面
  const handleNavigateFavorites = () => {
    navigation.navigate('Favorites');
  };

  // 導航到設定頁面
  const handleNavigateSettings = () => {
    navigation.navigate('Settings');
  };

  // 導航到意見回饋
  const handleNavigateFeedback = () => {
    navigation.navigate('Feedback');
  };

  // 載入中
  if (loading) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#F9FAFB" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#40A1DD" />
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
        <StatusBar barStyle="dark-content" backgroundColor="#F9FAFB" />
        
        <View style={styles.header}>
          <Text style={styles.headerTitle}>我的練心書</Text>
        </View>

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
              <Text style={styles.loginButtonText}>立即登入</Text>
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
      
      {/* Header with gradient */}
      <View style={styles.gradientHeader}>
        <View style={styles.headerTop}>
          <TouchableOpacity 
            style={styles.settingsButton}
            onPress={handleNavigateSettings}
          >
            <Ionicons name="settings-outline" size={24} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>我的練心書</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.profileHeader}>
            {/* Avatar */}
            <View style={styles.avatarContainer}>
              {avatar ? (
                <Image source={{ uri: avatar }} style={styles.avatarImage} />
              ) : (
                <View style={styles.avatarCircle}>
                  <Text style={styles.avatarText}>
                    {user.name.charAt(0).toUpperCase()}
                  </Text>
                </View>
              )}
              <View style={styles.onlineIndicator} />
            </View>

            {/* User Info */}
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{user.name}</Text>
              <Text style={styles.joinDate}>
                加入 {Math.floor((new Date().getTime() - new Date(user.created_at || Date.now()).getTime()) / (1000 * 60 * 60 * 24))} 天
              </Text>
              <Text style={styles.userEmail}>{user.email}</Text>
            </View>
          </View>

          {/* Quick Stats */}
          <View style={styles.quickStats}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{practiceStats.totalPractices}</Text>
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
      </View>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Practice Overview */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons name="chart-line" size={20} color="#166CB5" />
            <Text style={styles.sectionTitle}>練習概況</Text>
          </View>
          
          <View style={styles.card}>
            <View style={[styles.overviewItem, { backgroundColor: '#EFF6FF' }]}>
              <Text style={styles.overviewLabel}>累積練習天數</Text>
              <Text style={[styles.overviewValue, { color: '#166CB5' }]}>
                {practiceStats.totalDays} 天
              </Text>
            </View>
            <View style={[styles.overviewItem, { backgroundColor: '#FAF5FF' }]}>
              <Text style={styles.overviewLabel}>最長連續紀錄</Text>
              <Text style={[styles.overviewValue, { color: '#A855F7' }]}>
                {practiceStats.longestStreak} 天
              </Text>
            </View>
            <View style={[styles.overviewItem, { backgroundColor: '#ECFDF5' }]}>
              <Text style={styles.overviewLabel}>最常練習</Text>
              <Text style={[styles.overviewValue, { color: '#10B981' }]}>
                {practiceStats.favoriteExercise}
              </Text>
            </View>
          </View>
        </View>

        {/* Achievements */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="trophy-outline" size={20} color="#166CB5" />
            <Text style={styles.sectionTitle}>成就徽章</Text>
            <Text style={styles.achievementCount}>
              {achievements.filter(a => a.unlocked).length}/{achievements.length}
            </Text>
          </View>
          
          <View style={styles.achievementGrid}>
            {achievements.map((achievement) => (
              <TouchableOpacity
                key={achievement.id}
                style={[
                  styles.achievementItem,
                  achievement.unlocked && styles.achievementUnlocked,
                  { backgroundColor: achievement.unlocked ? achievement.color : '#F3F4F6' }
                ]}
                onPress={() => setSelectedAchievement(achievement)}
                activeOpacity={0.8}
              >
                <Text style={styles.achievementIcon}>
                  {achievement.icon}
                </Text>
                <Text style={[
                  styles.achievementName,
                  { color: achievement.unlocked ? '#FFF' : '#9CA3AF' }
                ]}>
                  {achievement.name}
                </Text>
                {achievement.unlocked && (
                  <View style={styles.achievementBadge}>
                    <Ionicons name="star" size={12} color="#FFF" />
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Menu Items */}
        <View style={styles.section}>
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={handleNavigateSettings}
            activeOpacity={0.7}
          >
            <View style={[styles.menuIconContainer, { backgroundColor: '#EFF6FF' }]}>
              <Ionicons name="settings-outline" size={24} color="#166CB5" />
            </View>
            <Text style={styles.menuLabel}>帳號設定</Text>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.menuItem}
            onPress={handleNavigateFavorites}
            activeOpacity={0.7}
          >
            <View style={[styles.menuIconContainer, { backgroundColor: '#FEF3C7' }]}>
              <Ionicons name="bookmark-outline" size={24} color="#F59E0B" />
            </View>
            <Text style={styles.menuLabel}>練習收藏</Text>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.menuItem}
            onPress={handleNavigateStats}
            activeOpacity={0.7}
          >
            <View style={[styles.menuIconContainer, { backgroundColor: '#D1FAE5' }]}>
              <MaterialCommunityIcons name="chart-bar" size={24} color="#10B981" />
            </View>
            <Text style={styles.menuLabel}>練習統計</Text>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.menuItem}
            onPress={handleNavigateFeedback}
            activeOpacity={0.7}
          >
            <View style={[styles.menuIconContainer, { backgroundColor: '#FEE2E2' }]}>
              <Ionicons name="heart-outline" size={24} color="#EF4444" />
            </View>
            <Text style={styles.menuLabel}>意見回饋</Text>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>
        </View>

        {/* Logout Button */}
        <TouchableOpacity 
          style={styles.logoutButton}
          onPress={handleLogout}
          activeOpacity={0.8}
        >
          <Ionicons name="log-out-outline" size={20} color="#EF4444" />
          <Text style={styles.logoutButtonText}>登出</Text>
        </TouchableOpacity>

        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Achievement Detail Modal */}
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
            <View style={[
              styles.modalHeader,
              { backgroundColor: selectedAchievement?.color || '#166CB5' }
            ]}>
              <TouchableOpacity 
                style={styles.modalCloseButton}
                onPress={() => setSelectedAchievement(null)}
              >
                <Ionicons name="close" size={24} color="#FFF" />
              </TouchableOpacity>
              
              <Text style={styles.modalIcon}>{selectedAchievement?.icon}</Text>
              <Text style={styles.modalTitle}>{selectedAchievement?.name}</Text>
              <Text style={styles.modalDescription}>{selectedAchievement?.description}</Text>
            </View>

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

              {selectedAchievement?.unlocked && selectedAchievement?.unlockedDate && (
                <View style={styles.modalInfoCard}>
                  <Ionicons name="calendar" size={24} color="#F59E0B" />
                  <View style={styles.modalInfoText}>
                    <Text style={styles.modalInfoLabel}>解鎖時間</Text>
                    <Text style={styles.modalInfoValue}>
                      {new Date(selectedAchievement.unlockedDate).toLocaleDateString('zh-TW')}
                    </Text>
                  </View>
                </View>
              )}

              <TouchableOpacity 
                style={styles.modalButton}
                onPress={() => setSelectedAchievement(null)}
                activeOpacity={0.8}
              >
                <Text style={styles.modalButtonText}>關閉</Text>
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
  header: {
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 16,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
  },
  gradientHeader: {
    backgroundColor: '#166CB5',
    paddingTop: 50,
    paddingBottom: 100,
    paddingHorizontal: 20,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  settingsButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholder: {
    width: 40,
  },
  profileCard: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 24,
    padding: 20,
    marginTop: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 16,
  },
  avatarCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#166CB5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFF',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#10B981',
    borderWidth: 2,
    borderColor: '#FFF',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  joinDate: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#6B7280',
  },
  quickStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#166CB5',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#E5E7EB',
  },
  scrollView: {
    flex: 1,
    marginTop: -80,
  },
  scrollContent: {
    paddingBottom: 120,
  },
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
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginLeft: 8,
    flex: 1,
  },
  achievementCount: {
    fontSize: 12,
    color: '#6B7280',
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  overviewItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginVertical: 4,
  },
  overviewLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  overviewValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  achievementGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  achievementItem: {
    width: '31%',
    aspectRatio: 1,
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  achievementUnlocked: {
    borderWidth: 0,
  },
  achievementIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  achievementName: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  achievementBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#F59E0B',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
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
    color: '#111827',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 20,
    marginTop: 20,
    paddingVertical: 16,
    backgroundColor: '#FFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FEE2E2',
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#EF4444',
    marginLeft: 8,
  },
  bottomPadding: {
    height: 20,
  },
  
  // 未登入狀態
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
    backgroundColor: '#40A1DD',
    paddingVertical: 16,
    paddingHorizontal: 48,
    borderRadius: 12,
    shadowColor: '#40A1DD',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  loginButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },

  // Modal styles
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
    backgroundColor: '#166CB5',
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 8,
  },
  modalButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default AccountScreen;