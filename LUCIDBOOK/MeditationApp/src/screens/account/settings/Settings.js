// ==========================================
// 檔案名稱: Settings.js
// 功能: 帳號設定頁面
// 
// ✅ 個人資料編輯
// ✅ 企業引薦碼管理（登入/登出）
// ✅ 通知設定
// ✅ 隱私設定
// ✅ 登出帳號
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
  Switch,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ApiService from '../../../../api';

const Settings = ({ navigation }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // 企業引薦碼狀態
  const [enterpriseCode, setEnterpriseCode] = useState(null);
  const [enterpriseInfo, setEnterpriseInfo] = useState(null);
  
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
    loadEnterpriseInfo();
  }, []);

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
      const code = await AsyncStorage.getItem('enterpriseCode');
      if (code) {
        setEnterpriseCode(code);
        // 從 API 獲取企業資訊
        const response = await ApiService.getEnterpriseInfo(code);
        if (response.success) {
          setEnterpriseInfo(response.enterprise);
        }
      }
    } catch (error) {
      console.error('載入企業資訊失敗:', error);
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

  const handleEnterpriseLogin = () => {
    navigation.navigate('EnterpriseCode');
  };

  const handleEnterpriseLogout = () => {
    Alert.alert(
      '確認登出企業帳號',
      '登出後將無法使用企業專屬的練習模組',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '登出',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.removeItem('enterpriseCode');
              setEnterpriseCode(null);
              setEnterpriseInfo(null);
              Alert.alert('成功', '已登出企業帳號');
            } catch (error) {
              Alert.alert('錯誤', '登出失敗');
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
                routes: [{ name: 'Home' }],
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

        {/* 企業引薦區塊 */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons name="office-building" size={20} color="#166CB5" />
            <Text style={styles.sectionTitle}>企業引薦</Text>
          </View>
          
          {enterpriseCode ? (
            // 已登入企業帳號
            <View style={styles.enterpriseCard}>
              <LinearGradient
                colors={['#10B981', '#059669']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.enterpriseBadge}
              >
                <Ionicons name="shield-checkmark" size={24} color="#FFF" />
                <View style={styles.enterpriseBadgeText}>
                  <Text style={styles.enterpriseBadgeTitle}>企業會員</Text>
                  <Text style={styles.enterpriseBadgeSubtitle}>已啟用</Text>
                </View>
              </LinearGradient>

              <View style={styles.enterpriseInfo}>
                <View style={styles.enterpriseInfoRow}>
                  <Text style={styles.enterpriseInfoLabel}>企業名稱</Text>
                  <Text style={styles.enterpriseInfoValue}>
                    {enterpriseInfo?.name || '企業用戶'}
                  </Text>
                </View>
                <View style={styles.enterpriseInfoRow}>
                  <Text style={styles.enterpriseInfoLabel}>引薦碼</Text>
                  <Text style={styles.enterpriseInfoValue}>{enterpriseCode}</Text>
                </View>
                <View style={styles.enterpriseInfoRow}>
                  <Text style={styles.enterpriseInfoLabel}>專屬練習</Text>
                  <Text style={styles.enterpriseInfoValue}>
                    {enterpriseInfo?.moduleCount || 3} 個模組
                  </Text>
                </View>
              </View>

              <TouchableOpacity 
                style={styles.enterpriseLogoutButton}
                onPress={handleEnterpriseLogout}
              >
                <Ionicons name="log-out-outline" size={20} color="#EF4444" />
                <Text style={styles.enterpriseLogoutText}>登出企業帳號</Text>
              </TouchableOpacity>
            </View>
          ) : (
            // 未登入企業帳號
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
                  解鎖企業專屬練習模組
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
  enterpriseLogoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#FEF2F2',
    gap: 8,
  },
  enterpriseLogoutText: {
    fontSize: 16,
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