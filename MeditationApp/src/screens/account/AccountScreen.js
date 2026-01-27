// ==========================================
// 檔案名稱: AccountScreen.js
// 版本: V9.3 - 修正資料快取問題
// 
// ✅ 使用統一的 LockedOverlay
// ✅ 未登入顯示登入鎖定
// ✅ 無企業碼顯示企業碼鎖定
// ✅ 背景內容模糊但可見
// ✅ 練習時數顯示單位 "hr"
// ✅ 修正：登出時完整清除所有認證資料
// ✅✅✅ 修正：每次都強制重新抓取資料，避免快取問題 ✅✅✅
// ==========================================

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  StatusBar,
  Alert,
  ActivityIndicator,
  Image,
  RefreshControl, // ⭐ 新增：下拉刷新
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { LinearGradient } from 'expo-linear-gradient';
import BottomNavigation from '../../navigation/BottomNavigation';
import AppHeader from '../../navigation/AppHeader';
import ApiService from '../../../api';
import LockedOverlay from '../../navigation/LockedOverlay';
import { clearLoginState } from '../auth/AuthUtils';

const AccountScreen = ({ navigation, route }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false); // ⭐ 新增：下拉刷新狀態
  const [hasEnterpriseCode, setHasEnterpriseCode] = useState(false);
  
  const [practiceStats, setPracticeStats] = useState({
    totalPractices: 0,
    totalDays: 0,
    totalHours: 0,
    currentStreak: 0,
  });

  // ⭐ 修正：初次載入強制刷新
  useEffect(() => {
    loadUserData(true);
  }, []);

  // ⭐ 修正：頁面獲得焦點時強制重新抓取
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      console.log('🔄 [AccountScreen] 頁面獲得焦點，強制重新載入數據');
      loadUserData(true); // ⭐ 強制刷新
    });
    return unsubscribe;
  }, [navigation]);

  // ⭐ 新增：監聽 route.params 的 refresh 信號
  useEffect(() => {
    if (route.params?.refresh) {
      console.log('🔄 [AccountScreen] 收到刷新信號，重新載入數據');
      loadUserData(true);
      navigation.setParams({ refresh: undefined });
    }
  }, [route.params?.refresh]);

  // ⭐ 修正：加入 forceRefresh 參數和時間戳避免快取
  const loadUserData = async (forceRefresh = false) => {
    try {
      if (!refreshing) {
        setLoading(true);
      }
      
      console.log('🔍 [AccountScreen] 開始檢查登入狀態...', forceRefresh ? '(強制刷新)' : '');
      
      const loggedIn = await ApiService.isLoggedIn();
      
      if (loggedIn) {
        try {
          console.log('✅ [AccountScreen] 已登入，獲取用戶資料...');
          
          // ⭐ 加入時間戳避免快取
          const timestamp = Date.now();
          const response = await ApiService.getUserProfile({ 
            _t: timestamp,
            _nocache: forceRefresh ? 'true' : undefined 
          });
          
          console.log('📋 [AccountScreen] API 返回的完整用戶資料:', JSON.stringify(response.user, null, 2));
          
          const userData = {
            id: response.user.id,
            name: response.user.name,
            email: response.user.email,
            phone: response.user.phone || '',
            company: response.user.company || '',
            bio: response.user.bio || '',
            avatar: response.user.avatar || null,
            created_at: response.user.created_at,
            enterprise_code: response.user.enterprise_code || null,
            enterprise_name: response.user.enterprise_name || null,
            subscription_end_date: response.user.subscription_end_date || null,
          };
          
          console.log('📋 [AccountScreen] 處理後的用戶資料:', userData);
          
          setUser(userData);
          setIsLoggedIn(true);

          const hasCode = !!response.user.enterprise_code;
          console.log('📋 [AccountScreen] 企業引薦碼狀態:', {
            hasCode,
            codeValue: response.user.enterprise_code,
            enterpriseName: response.user.enterprise_name,
            subscriptionEndDate: response.user.subscription_end_date,
          });
          setHasEnterpriseCode(hasCode);
          
          // ⭐ 同樣強制刷新練習統計
          await loadPracticeStats(forceRefresh);
          
          console.log('✅ [AccountScreen] 用戶資料載入完成');
        } catch (error) {
          console.log('❌ [AccountScreen] Token 無效，清除登入狀態');
          await ApiService.clearToken();
          setIsLoggedIn(false);
          setUser(null);
          setHasEnterpriseCode(false);
        }
      } else {
        console.log('❌ [AccountScreen] 未登入');
        setIsLoggedIn(false);
        setUser(null);
        setHasEnterpriseCode(false);
      }
    } catch (error) {
      console.error('❌ [AccountScreen] 載入用戶資料失敗:', error);
      setIsLoggedIn(false);
      setUser(null);
      setHasEnterpriseCode(false);
    } finally {
      setLoading(false);
      setRefreshing(false);
      console.log('🏁 [AccountScreen] 載入完成');
    }
  };

  // ⭐ 修正：練習統計也加入強制刷新
  const loadPracticeStats = async (forceRefresh = false) => {
    try {
      const timestamp = Date.now();
      const response = await ApiService.getPracticeStats({ 
        _t: timestamp,
        _nocache: forceRefresh ? 'true' : undefined 
      });
      if (response.success) {
        setPracticeStats({
          totalPractices: response.stats.totalPractices || 0,
          totalDays: response.stats.totalDays || 0,
          totalHours: ((response.stats.totalMinutes || 0) / 60).toFixed(1),
          currentStreak: response.stats.currentStreak || 0,
        });
      }
    } catch (error) {
      console.error('載入練習統計失敗:', error);
    }
  };

  // ⭐ 新增：下拉刷新處理
  const onRefresh = useCallback(() => {
    console.log('🔄 [AccountScreen] 使用者下拉刷新');
    setRefreshing(true);
    loadUserData(true);
  }, []);

  const handleNavigateSettings = () => {
    navigation.navigate('Settings');
  };

  const handleLogout = async () => {
    Alert.alert(
      '登出確認',
      '確定要登出嗎？',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '登出',
          style: 'destructive',
          onPress: async () => {
            try {
              console.log('📤 [AccountScreen] 開始登出...');
              
              await clearLoginState(true);
              
              setIsLoggedIn(false);
              setUser(null);
              setHasEnterpriseCode(false);
              
              console.log('✅ [AccountScreen] 登出成功（已完整清除所有認證資料）');
            } catch (error) {
              console.error('❌ [AccountScreen] 登出失敗:', error);
              Alert.alert('錯誤', '登出失敗，請稍後再試');
            }
          },
        },
      ]
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return '未設定';
    const date = new Date(dateString);
    return `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')}`;
  };

  const getDaysJoined = () => {
    if (!user?.created_at) return 0;
    return Math.floor((new Date().getTime() - new Date(user.created_at).getTime()) / (1000 * 60 * 60 * 24));
  };

  const getDisplayCompany = () => {
    if (user?.enterprise_name) {
      return user.enterprise_name;
    }
    return user?.company || '';
  };

  const renderAvatar = () => {
    if (user?.avatar) {
      return (
        <Image 
          source={{ uri: user.avatar }} 
          style={styles.avatarImage}
        />
      );
    } else {
      return (
        <LinearGradient
          colors={['#31C6FE', '#166CB5']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.avatar}
        >
          <Text style={styles.avatarText}>
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </Text>
        </LinearGradient>
      );
    }
  };

  // ========================================
  // 渲染邏輯
  // ========================================

  if (loading) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#166CB5" />
        <AppHeader />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#166CB5" />
          <Text style={styles.loadingText}>載入中...</Text>
        </View>
        <BottomNavigation navigation={navigation} activeTab="profile" />
      </View>
    );
  }

  const renderContent = () => {
    if (!isLoggedIn) {
      return (
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.pageTitle}>個人檔案</Text>
            <View style={[styles.userCard, { height: 150 }]} />
          </View>
          <View style={styles.statsGrid}>
            <View style={[styles.statCard, { height: 80 }]} />
            <View style={[styles.statCard, { height: 80 }]} />
          </View>
        </View>
      );
    }

    if (isLoggedIn && !hasEnterpriseCode) {
      return (
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.pageTitle}>個人檔案</Text>
            <View style={styles.userCard}>
              <View style={styles.userCardContent}>
                <View style={styles.avatarContainer}>
                  {renderAvatar()}
                </View>
                <View style={styles.userInfo}>
                  <View style={styles.userInfoTop}>
                    <Text style={styles.userName}>{user.name}</Text>
                  </View>
                  <Text style={styles.userSubtitle}>
                    持續練習第 {getDaysJoined()} 天
                  </Text>
                  <View style={styles.userDetails}>
                    {getDisplayCompany() && (
                      <View style={styles.enterpriseTag}>
                        <MaterialCommunityIcons name="office-building" size={14} color="#166CB5" />
                        <Text style={styles.enterpriseTagText}>{getDisplayCompany()}</Text>
                      </View>
                    )}
                    {user.subscription_end_date && (
                      <View style={styles.expiryRow}>
                        <MaterialCommunityIcons 
                          name="calendar-blank" 
                          size={14} 
                          color="#9CA3AF" 
                        />
                        <Text style={styles.expiryText}>
                          方案到期日：{formatDate(user.subscription_end_date)}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <View style={styles.statValueContainer}>
                <Text style={styles.statValue}>{practiceStats.totalHours}</Text>
                <Text style={styles.statUnit}>hr</Text>
              </View>
              <Text style={styles.statLabel}>累積練習時數</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{practiceStats.totalPractices}</Text>
              <Text style={styles.statLabel}>完成練習次數</Text>
            </View>
          </View>
        </View>
      );
    }

    return (
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.pageTitle}>個人檔案</Text>

          <View style={styles.userCard}>
            <View style={styles.userCardContent}>
              <View style={styles.avatarContainer}>
                {renderAvatar()}
              </View>

              <View style={styles.userInfo}>
                <View style={styles.userInfoTop}>
                  <Text style={styles.userName}>{user.name}</Text>
                </View>
                <Text style={styles.userSubtitle}>
                  持續練習第 {getDaysJoined()} 天
                </Text>

                <View style={styles.userDetails}>
                  {getDisplayCompany() && (
                    <View style={styles.enterpriseTag}>
                      <MaterialCommunityIcons name="office-building" size={14} color="#166CB5" />
                      <Text style={styles.enterpriseTagText}>{getDisplayCompany()}</Text>
                    </View>
                  )}
                  
                  {user.subscription_end_date && (
                    <View style={styles.expiryRow}>
                      <MaterialCommunityIcons 
                        name="calendar-blank" 
                        size={14} 
                        color="#9CA3AF" 
                      />
                      <Text style={styles.expiryText}>
                        方案到期日：{formatDate(user.subscription_end_date)}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <View style={styles.statValueContainer}>
              <Text style={styles.statValue}>{practiceStats.totalHours}</Text>
              <Text style={styles.statUnit}>hr</Text>
            </View>
            <Text style={styles.statLabel}>累積練習時數</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{practiceStats.totalPractices}</Text>
            <Text style={styles.statLabel}>完成練習次數</Text>
          </View>
        </View>

        <View style={styles.menuContainer}>
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={handleNavigateSettings}
            activeOpacity={0.7}
          >
            <View style={styles.menuItemLeft}>
              <View style={styles.menuIconContainer}>
                <Ionicons name="settings-outline" size={16} color="#166CB5" />
              </View>
              <Text style={styles.menuLabel}>一般設定</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#D1D5DB" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          style={styles.logoutButton}
          onPress={handleLogout}
          activeOpacity={0.7}
        >
          <Ionicons name="log-out-outline" size={16} color="#EF4444" />
          <Text style={styles.logoutText}>登出帳號</Text>
        </TouchableOpacity>

        <View style={styles.bottomPadding} />
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#166CB5" />
      
      <AppHeader />

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        scrollEnabled={isLoggedIn && hasEnterpriseCode}
        // ⭐ 新增：下拉刷新功能
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#166CB5']}
            tintColor="#166CB5"
          />
        }
      >
        <View style={[
          { opacity: (!isLoggedIn || !hasEnterpriseCode) ? 0.3 : 1 }
        ]}>
          {renderContent()}
        </View>
      </ScrollView>

      <BottomNavigation navigation={navigation} activeTab="profile" />

      {!isLoggedIn && (
        <LockedOverlay 
          navigation={navigation} 
          reason="login"
          message="登入後查看你的個人資料"
        />
      )}
      
      {isLoggedIn && !hasEnterpriseCode && (
        <LockedOverlay 
          navigation={navigation} 
          reason="enterprise-code"
          message="輸入企業引薦碼以查看完整個人資料"
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F7FA',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6B7280',
  },

  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 100,
  },

  content: {
    paddingHorizontal: 20,
  },

  header: {
    marginBottom: 32,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
    marginTop: 22, 
    marginBottom: 24,
  },

  userCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  userCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#93C5FD',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 5,
  },
  avatarImage: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },
  avatarText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  userInfo: {
    flex: 1,
  },
  userInfoTop: {
    marginBottom: 4,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  userSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 12,
  },
  userDetails: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    gap: 6,
  },
  
  enterpriseTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  enterpriseTagText: {
    fontSize: 12,
    color: '#374151',
    fontWeight: '500',
  },
  
  expiryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 8,
  },
  expiryText: {
    fontSize: 12,
    fontWeight: '400',
    color: '#9CA3AF',
  },

  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 32,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    alignItems: 'center',
  },
  statValueContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#166CB5',
  },
  statUnit: {
    fontSize: 14,
    fontWeight: '600',
    color: '#9CA3AF',
    marginLeft: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },

  menuContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    overflow: 'hidden',
    marginBottom: 24,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  menuIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },

  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
  },
  logoutText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#EF4444',
  },

  bottomPadding: {
    height: 40,
  },
});

export default AccountScreen;