// ==========================================
// 檔案名稱: Settings.js
// 功能: 帳號設定頁面
// 
// ✅ 個人資料編輯
// ✅ 練習目標管理（新增）
// ✅ 企業引薦碼管理（包含效期顯示）
// ✅ 通知設定
// ✅ 隱私設定
// ✅ 登出帳號
// ✅ 自動刷新企業引薦碼資訊
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
  Switch,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import ApiService from '../../../../api';
import {
  getEnterpriseCodeInfo,
  clearEnterpriseCode,
  formatExpiryDate,
} from './utils/enterpriseCodeUtils';
import {
  getUserGoalsDetails,
} from './utils/userGoalsUtils';

const Settings = ({ navigation }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // 練習目標狀態
  const [userGoals, setUserGoals] = useState([]);
  
  // 企業引薦碼狀態（完整資訊）
  const [enterpriseCodeInfo, setEnterpriseCodeInfo] = useState({
    code: null,
    enterpriseName: null,
    expiryDate: null,
    daysRemaining: null,
  });
  
  // 通知設定
  const [notificationSettings, setNotificationSettings] = useState({
    practiceReminder: true,
    achievementNotification: true,
    weeklyReport: false,
  });

  // 編輯模式
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState('');

  useEffect(() => {
    loadUserData();
  }, []);

  // 當頁面獲得焦點時重新載入企業引薦碼資訊和目標
  useFocusEffect(
    useCallback(() => {
      loadEnterpriseInfo();
      loadUserGoals();
    }, [])
  );

  const loadUserData = async () => {
    try {
      const response = await ApiService.getUserProfile();
      setUser(response.user);
      setEditedName(response.user.name);
    } catch (error) {
      console.error('載入用戶資料失敗:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadEnterpriseInfo = async () => {
    try {
      const info = await getEnterpriseCodeInfo();
      setEnterpriseCodeInfo(info);
    } catch (error) {
      console.error('載入企業資訊失敗:', error);
    }
  };

  const loadUserGoals = async () => {
    try {
      const goals = await getUserGoalsDetails();
      setUserGoals(goals);
    } catch (error) {
      console.error('載入用戶目標失敗:', error);
    }
  };

  const handleSaveName = async () => {
    if (!editedName.trim()) {
      Alert.alert('提示', '名稱不能為空');
      return;
    }

    try {
      const response = await ApiService.updateProfile({ name: editedName });
      if (response.success) {
        setUser({ ...user, name: editedName });
        setIsEditingName(false);
        Alert.alert('成功', '名稱已更新');
      }
    } catch (error) {
      Alert.alert('錯誤', '更新失敗，請稍後再試');
    }
  };

  const handleGoalsManagement = () => {
    navigation.navigate('SelectGoals', { fromSettings: true });
  };

  const handleEnterpriseManagement = () => {
    navigation.navigate('EnterpriseCodeManagement');
  };

  const handleEnterpriseLogin = () => {
    navigation.navigate('EnterpriseCode', { fromSettings: true });
  };

  const handleEnterpriseLogout = () => {
    Alert.alert(
      '確認刪除企業引薦碼',
      '刪除後將無法存取企業專屬功能，確定要刪除嗎？',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '刪除',
          style: 'destructive',
          onPress: async () => {
            const success = await clearEnterpriseCode();
            if (success) {
              setEnterpriseCodeInfo({
                code: null,
                enterpriseName: null,
                expiryDate: null,
                daysRemaining: null,
              });
              Alert.alert('成功', '已刪除企業引薦碼');
            } else {
              Alert.alert('錯誤', '刪除失敗，請稍後再試');
            }
          }
        }
      ]
    );
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
              await AsyncStorage.clear();
              navigation.reset({
                index: 0,
                routes: [{ name: 'Login' }],
              });
            } catch (error) {
              console.error('登出失敗:', error);
            }
          }
        }
      ]
    );
  };

  const toggleNotification = (key) => {
    setNotificationSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#166CB5" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#166CB5" />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#166CB5" />
      
      {/* Header */}
      <LinearGradient
        colors={['#166CB5', '#31C6FE']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>帳號設定</Text>
        <View style={styles.headerPlaceholder} />
      </LinearGradient>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* 個人資料區塊 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>個人資料</Text>
          
          {/* 姓名 */}
          <View style={styles.settingCard}>
            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <Ionicons name="person-outline" size={20} color="#166CB5" />
                <Text style={styles.settingLabel}>姓名</Text>
              </View>
              {isEditingName ? (
                <View style={styles.editContainer}>
                  <TextInput
                    style={styles.editInput}
                    value={editedName}
                    onChangeText={setEditedName}
                    autoFocus
                  />
                  <TouchableOpacity onPress={handleSaveName}>
                    <Ionicons name="checkmark" size={24} color="#10B981" />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => {
                    setIsEditingName(false);
                    setEditedName(user.name);
                  }}>
                    <Ionicons name="close" size={24} color="#EF4444" />
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity 
                  style={styles.settingRight}
                  onPress={() => setIsEditingName(true)}
                >
                  <Text style={styles.settingValue}>{user?.name}</Text>
                  <Ionicons name="create-outline" size={20} color="#9CA3AF" />
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Email */}
          <View style={styles.settingCard}>
            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <Ionicons name="mail-outline" size={20} color="#166CB5" />
                <Text style={styles.settingLabel}>電子郵件</Text>
              </View>
              <Text style={styles.settingValueDisabled}>{user?.email}</Text>
            </View>
          </View>

          {/* 加入日期 */}
          <View style={styles.settingCard}>
            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <Ionicons name="calendar-outline" size={20} color="#166CB5" />
                <Text style={styles.settingLabel}>加入日期</Text>
              </View>
              <Text style={styles.settingValueDisabled}>
                {new Date(user?.created_at).toLocaleDateString('zh-TW')}
              </Text>
            </View>
          </View>
        </View>

        {/* 練習目標區塊 */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="flag-outline" size={20} color="#166CB5" />
            <Text style={styles.sectionTitle}>練習目標</Text>
          </View>
          
          {userGoals.length > 0 ? (
            // 已設定目標
            <View style={styles.goalsCard}>
              <View style={styles.goalsHeader}>
                <Text style={styles.goalsCount}>已設定 {userGoals.length} 個目標</Text>
              </View>
              
              <View style={styles.goalsGrid}>
                {userGoals.slice(0, 4).map((goal) => (
                  <View 
                    key={goal.id} 
                    style={[styles.goalChip, { backgroundColor: goal.bgColor }]}
                  >
                    <Ionicons name={goal.icon} size={16} color={goal.color} />
                    <Text style={[styles.goalChipText, { color: goal.color }]}>
                      {goal.title}
                    </Text>
                  </View>
                ))}
              </View>

              {userGoals.length > 4 && (
                <Text style={styles.moreGoalsText}>
                  還有 {userGoals.length - 4} 個目標...
                </Text>
              )}

              <TouchableOpacity 
                style={styles.editGoalsButton}
                onPress={handleGoalsManagement}
              >
                <Ionicons name="create-outline" size={18} color="#166CB5" />
                <Text style={styles.editGoalsText}>編輯目標</Text>
              </TouchableOpacity>
            </View>
          ) : (
            // 未設定目標
            <TouchableOpacity 
              style={styles.goalsPromptCard}
              onPress={handleGoalsManagement}
              activeOpacity={0.7}
            >
              <View style={styles.goalsPromptIcon}>
                <Ionicons name="flag" size={32} color="#166CB5" />
              </View>
              <View style={styles.goalsPromptContent}>
                <Text style={styles.goalsPromptTitle}>設定練習目標</Text>
                <Text style={styles.goalsPromptDesc}>
                  告訴我們你想改善的方向，獲得個人化推薦
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        </View>

        {/* 企業引薦區塊 */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons name="office-building" size={20} color="#166CB5" />
            <Text style={styles.sectionTitle}>企業引薦</Text>
          </View>
          
          {enterpriseCodeInfo.code ? (
            // 已設定企業引薦碼
            <View style={styles.enterpriseCard}>
              <LinearGradient
                colors={
                  enterpriseCodeInfo.daysRemaining <= 7
                    ? ['#F59E0B', '#EF4444'] // 即將過期：橘紅色
                    : ['#10B981', '#059669'] // 正常：綠色
                }
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.enterpriseBadge}
              >
                <Ionicons 
                  name={enterpriseCodeInfo.daysRemaining <= 7 ? "warning" : "shield-checkmark"} 
                  size={24} 
                  color="#FFF" 
                />
                <View style={styles.enterpriseBadgeText}>
                  <Text style={styles.enterpriseBadgeTitle}>企業會員</Text>
                  <Text style={styles.enterpriseBadgeSubtitle}>
                    {enterpriseCodeInfo.daysRemaining <= 7 
                      ? `剩餘 ${enterpriseCodeInfo.daysRemaining} 天`
                      : '已啟用'
                    }
                  </Text>
                </View>
              </LinearGradient>

              <View style={styles.enterpriseInfo}>
                {enterpriseCodeInfo.enterpriseName && (
                  <View style={styles.enterpriseInfoRow}>
                    <Text style={styles.enterpriseInfoLabel}>企業名稱</Text>
                    <Text style={styles.enterpriseInfoValue}>
                      {enterpriseCodeInfo.enterpriseName}
                    </Text>
                  </View>
                )}
                
                <View style={styles.enterpriseInfoRow}>
                  <Text style={styles.enterpriseInfoLabel}>引薦碼</Text>
                  <Text style={styles.enterpriseCodeValue}>
                    {enterpriseCodeInfo.code}
                  </Text>
                </View>

                {enterpriseCodeInfo.expiryDate && (
                  <View style={styles.enterpriseInfoRow}>
                    <Text style={styles.enterpriseInfoLabel}>有效期限</Text>
                    <Text style={[
                      styles.enterpriseInfoValue,
                      enterpriseCodeInfo.daysRemaining <= 7 && styles.expiryWarning
                    ]}>
                      {formatExpiryDate(enterpriseCodeInfo.expiryDate)}
                    </Text>
                  </View>
                )}

                {enterpriseCodeInfo.daysRemaining !== null && (
                  <View style={styles.enterpriseInfoRow}>
                    <Text style={styles.enterpriseInfoLabel}>剩餘天數</Text>
                    <Text style={[
                      styles.enterpriseInfoValue,
                      enterpriseCodeInfo.daysRemaining <= 7 && styles.expiryWarning
                    ]}>
                      {enterpriseCodeInfo.daysRemaining} 天
                    </Text>
                  </View>
                )}
              </View>

              {/* 即將過期警告 */}
              {enterpriseCodeInfo.daysRemaining <= 7 && (
                <View style={styles.warningBanner}>
                  <Ionicons name="warning-outline" size={20} color="#EF4444" />
                  <Text style={styles.warningText}>
                    企業引薦碼即將過期，請聯繫企業管理員取得新的引薦碼
                  </Text>
                </View>
              )}

              <View style={styles.enterpriseActions}>
                <TouchableOpacity 
                  style={styles.enterpriseManageButton}
                  onPress={handleEnterpriseManagement}
                >
                  <Ionicons name="settings-outline" size={18} color="#166CB5" />
                  <Text style={styles.enterpriseManageText}>管理</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.enterpriseLogoutButton}
                  onPress={handleEnterpriseLogout}
                >
                  <Ionicons name="trash-outline" size={18} color="#EF4444" />
                  <Text style={styles.enterpriseLogoutText}>刪除</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            // 未設定企業引薦碼
            <TouchableOpacity 
              style={styles.enterpriseLoginCard}
              onPress={handleEnterpriseLogin}
              activeOpacity={0.7}
            >
              <View style={styles.enterpriseLoginIcon}>
                <MaterialCommunityIcons name="key-variant" size={32} color="#166CB5" />
              </View>
              <View style={styles.enterpriseLoginContent}>
                <Text style={styles.enterpriseLoginTitle}>輸入企業引薦碼</Text>
                <Text style={styles.enterpriseLoginDesc}>
                  解鎖企業專屬練習模組和進階功能
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        </View>

        {/* 通知設定區塊 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>通知設定</Text>
          
          <View style={styles.settingCard}>
            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <Ionicons name="notifications-outline" size={20} color="#166CB5" />
                <Text style={styles.settingLabel}>練習提醒</Text>
              </View>
              <Switch
                value={notificationSettings.practiceReminder}
                onValueChange={() => toggleNotification('practiceReminder')}
                trackColor={{ false: '#D1D5DB', true: '#9CE7FE' }}
                thumbColor={notificationSettings.practiceReminder ? '#166CB5' : '#F3F4F6'}
              />
            </View>
          </View>

          <View style={styles.settingCard}>
            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <Ionicons name="trophy-outline" size={20} color="#F59E0B" />
                <Text style={styles.settingLabel}>成就通知</Text>
              </View>
              <Switch
                value={notificationSettings.achievementNotification}
                onValueChange={() => toggleNotification('achievementNotification')}
                trackColor={{ false: '#D1D5DB', true: '#9CE7FE' }}
                thumbColor={notificationSettings.achievementNotification ? '#166CB5' : '#F3F4F6'}
              />
            </View>
          </View>

          <View style={styles.settingCard}>
            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <Ionicons name="stats-chart-outline" size={20} color="#10B981" />
                <Text style={styles.settingLabel}>每週報告</Text>
              </View>
              <Switch
                value={notificationSettings.weeklyReport}
                onValueChange={() => toggleNotification('weeklyReport')}
                trackColor={{ false: '#D1D5DB', true: '#9CE7FE' }}
                thumbColor={notificationSettings.weeklyReport ? '#166CB5' : '#F3F4F6'}
              />
            </View>
          </View>
        </View>

        {/* 其他設定 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>其他</Text>
          
          <TouchableOpacity style={styles.settingCard}>
            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <Ionicons name="shield-checkmark-outline" size={20} color="#166CB5" />
                <Text style={styles.settingLabel}>隱私政策</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingCard}>
            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <Ionicons name="document-text-outline" size={20} color="#166CB5" />
                <Text style={styles.settingLabel}>使用條款</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingCard}>
            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <Ionicons name="information-circle-outline" size={20} color="#166CB5" />
                <Text style={styles.settingLabel}>關於我們</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </View>
          </TouchableOpacity>
        </View>

        {/* 登出按鈕 */}
        <View style={styles.section}>
          <TouchableOpacity 
            style={styles.logoutButton}
            onPress={handleLogout}
            activeOpacity={0.8}
          >
            <Ionicons name="log-out-outline" size={20} color="#EF4444" />
            <Text style={styles.logoutText}>登出帳號</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>
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

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
  },
  headerPlaceholder: {
    width: 40,
  },

  // ScrollView
  scrollView: {
    flex: 1,
  },

  // Section
  section: {
    paddingHorizontal: 20,
    marginTop: 24,
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
    marginBottom: 12,
    marginLeft: 8,
  },

  // Setting Card
  settingCard: {
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
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
    color: '#111827',
    marginLeft: 12,
    fontWeight: '500',
  },
  settingRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  settingValue: {
    fontSize: 16,
    color: '#6B7280',
  },
  settingValueDisabled: {
    fontSize: 16,
    color: '#9CA3AF',
  },

  // Edit Name
  editContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  editInput: {
    flex: 1,
    borderBottomWidth: 1,
    borderBottomColor: '#166CB5',
    paddingVertical: 4,
    fontSize: 16,
    color: '#111827',
    minWidth: 120,
  },

  // Goals Card
  goalsCard: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  goalsHeader: {
    marginBottom: 16,
  },
  goalsCount: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  goalsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  goalChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  goalChipText: {
    fontSize: 13,
    fontWeight: '600',
  },
  moreGoalsText: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 16,
    fontStyle: 'italic',
  },
  editGoalsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#EFF6FF',
    gap: 6,
  },
  editGoalsText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#166CB5',
  },

  // Goals Prompt Card
  goalsPromptCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  goalsPromptIcon: {
    width: 60,
    height: 60,
    borderRadius: 16,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  goalsPromptContent: {
    flex: 1,
  },
  goalsPromptTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  goalsPromptDesc: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },

  // Enterprise Card
  enterpriseCard: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  enterpriseBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
  },
  enterpriseBadgeText: {
    marginLeft: 12,
  },
  enterpriseBadgeTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
  },
  enterpriseBadgeSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
  },
  enterpriseInfo: {
    gap: 12,
    marginBottom: 16,
  },
  enterpriseInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  enterpriseInfoLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  enterpriseInfoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  enterpriseCodeValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#166CB5',
    letterSpacing: 2,
  },
  expiryWarning: {
    color: '#EF4444',
  },

  // Warning Banner
  warningBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FEF2F2',
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
    gap: 10,
  },
  warningText: {
    flex: 1,
    fontSize: 13,
    color: '#EF4444',
    lineHeight: 18,
  },

  // Enterprise Actions
  enterpriseActions: {
    flexDirection: 'row',
    gap: 12,
  },
  enterpriseManageButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#EFF6FF',
    gap: 6,
  },
  enterpriseManageText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#166CB5',
  },
  enterpriseLogoutButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#FEF2F2',
    gap: 6,
  },
  enterpriseLogoutText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#EF4444',
  },

  // Enterprise Login Card
  enterpriseLoginCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  enterpriseLoginIcon: {
    width: 60,
    height: 60,
    borderRadius: 16,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  enterpriseLoginContent: {
    flex: 1,
  },
  enterpriseLoginTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  enterpriseLoginDesc: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },

  // Logout Button
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: '#FEE2E2',
    gap: 8,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#EF4444',
  },

  bottomPadding: {
    height: 40,
  },
});

export default Settings;