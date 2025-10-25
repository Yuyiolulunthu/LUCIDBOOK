// ==========================================
// 檔案名稱: ProfileScreen.js
// 用戶個人資料頁面
// ==========================================

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  StatusBar,
  Image,
  Alert,
  Switch,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import BottomNavigation from './BottomNavigation';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ProfileScreen = ({ navigation, route }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  
  // 用戶可編輯的資料
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [dailyGoal, setDailyGoal] = useState('15'); // 每日目標分鐘數
  const [notifications, setNotifications] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  // 載入用戶資料
  useEffect(() => {
    loadUserData();
  }, []);

  // 監聽路由參數變化
  useEffect(() => {
    if (route.params?.user) {
      const userData = route.params.user;
      handleLoginSuccess(userData);
    }
  }, [route.params?.user]);

  // 監聽導航焦點事件
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadUserData();
    });

    return unsubscribe;
  }, [navigation]);

  const loadUserData = async () => {
    try {
      const userDataString = await AsyncStorage.getItem('userData');
      if (userDataString) {
        const userData = JSON.parse(userDataString);
        setUser(userData);
        setIsLoggedIn(!userData.isGuest);
        setName(userData.name || '');
        setEmail(userData.email || '');
        
        // 載入其他設定
        const savedGoal = await AsyncStorage.getItem('dailyGoal');
        if (savedGoal) setDailyGoal(savedGoal);
        
        const savedNotifications = await AsyncStorage.getItem('notifications');
        if (savedNotifications !== null) setNotifications(JSON.parse(savedNotifications));
      }
    } catch (error) {
      console.error('載入用戶資料失敗:', error);
    }
  };

  const handleLoginSuccess = async (userData) => {
    try {
      await AsyncStorage.setItem('userData', JSON.stringify(userData));
      setUser(userData);
      setIsLoggedIn(!userData.isGuest);
      setName(userData.name || '');
      setEmail(userData.email || '');
    } catch (error) {
      console.error('保存用戶資料失敗:', error);
    }
  };

  const handleLogin = () => {
    navigation.navigate('Login', {
      onLoginSuccess: handleLoginSuccess
    });
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
              await AsyncStorage.removeItem('userData');
              setIsLoggedIn(false);
              setUser(null);
              setName('');
              setEmail('');
            } catch (error) {
              console.error('登出失敗:', error);
            }
          }
        }
      ]
    );
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('錯誤', '名稱不能為空');
      return;
    }

    const goalNum = parseInt(dailyGoal);
    if (isNaN(goalNum) || goalNum < 1 || goalNum > 120) {
      Alert.alert('錯誤', '每日目標需在 1-120 分鐘之間');
      return;
    }

    try {
      // 更新用戶資料
      const updatedUser = { ...user, name };
      await AsyncStorage.setItem('userData', JSON.stringify(updatedUser));
      await AsyncStorage.setItem('dailyGoal', dailyGoal);
      await AsyncStorage.setItem('notifications', JSON.stringify(notifications));
      
      setUser(updatedUser);
      Alert.alert('成功', '資料已保存');
      setIsEditing(false);
    } catch (error) {
      console.error('保存失敗:', error);
      Alert.alert('錯誤', '保存資料失敗');
    }
  };

  // 未登入狀態
  if (!isLoggedIn) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#F9FAFB" />
        
        <View style={styles.header}>
          <Text style={styles.headerTitle}>個人資料</Text>
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
      <StatusBar barStyle="dark-content" backgroundColor="#F9FAFB" />
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>個人資料</Text>
        <TouchableOpacity 
          style={styles.editButton}
          onPress={() => isEditing ? handleSave() : setIsEditing(true)}
        >
          <Text style={styles.editButtonText}>
            {isEditing ? '保存' : '編輯'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* 頭像區域 */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarText}>
                {name.charAt(0).toUpperCase() || 'U'}
              </Text>
            </View>
            {isEditing && (
              <TouchableOpacity style={styles.editAvatarButton}>
                <Ionicons name="camera" size={16} color="#FFF" />
              </TouchableOpacity>
            )}
          </View>
          <Text style={styles.userName}>{name || '用戶'}</Text>
          <Text style={styles.userEmail}>{email}</Text>
        </View>

        {/* 基本資料 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>基本資料</Text>
          
          <View style={styles.card}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>名稱</Text>
              <TextInput
                style={[styles.input, !isEditing && styles.inputDisabled]}
                value={name}
                onChangeText={setName}
                placeholder="請輸入名稱"
                placeholderTextColor="#9CA3AF"
                editable={isEditing}
              />
            </View>

            <View style={styles.divider} />

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>電子郵件</Text>
              <TextInput
                style={[styles.input, styles.inputDisabled]}
                value={email}
                placeholder="email@example.com"
                placeholderTextColor="#9CA3AF"
                editable={false}
              />
            </View>
          </View>
        </View>

        {/* 練習目標 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>練習目標</Text>
          
          <View style={styles.card}>
            <View style={styles.goalItem}>
              <View style={styles.goalInfo}>
                <View style={styles.goalIconContainer}>
                  <MaterialCommunityIcons name="target" size={24} color="#40A1DD" />
                </View>
                <View style={styles.goalTextContainer}>
                  <Text style={styles.goalLabel}>每日練習目標</Text>
                  <Text style={styles.goalDescription}>設定您的每日冥想時長</Text>
                </View>
              </View>
              <View style={styles.goalInputContainer}>
                <TextInput
                  style={[styles.goalInput, !isEditing && styles.inputDisabled]}
                  value={dailyGoal}
                  onChangeText={setDailyGoal}
                  keyboardType="numeric"
                  editable={isEditing}
                />
                <Text style={styles.goalUnit}>分鐘</Text>
              </View>
            </View>
          </View>
        </View>

        {/* 設定 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>設定</Text>
          
          <View style={styles.card}>
            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Ionicons name="notifications-outline" size={24} color="#6B7280" />
                <View style={styles.settingTextContainer}>
                  <Text style={styles.settingLabel}>推播通知</Text>
                  <Text style={styles.settingDescription}>提醒您每日練習</Text>
                </View>
              </View>
              <Switch
                value={notifications}
                onValueChange={setNotifications}
                trackColor={{ false: '#D1D5DB', true: '#93C5FD' }}
                thumbColor={notifications ? '#40A1DD' : '#F3F4F6'}
              />
            </View>
          </View>
        </View>

        {/* 登出按鈕 */}
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

      <BottomNavigation navigation={navigation} activeTab="profile" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
    color: '#111827',
  },
  editButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  editButtonText: {
    fontSize: 16,
    color: '#40A1DD',
    fontWeight: '500',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 120,
  },

  // 未登入狀態樣式
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

  // 已登入狀態樣式
  avatarSection: {
    alignItems: 'center',
    paddingVertical: 32,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatarCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#40A1DD',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#FFF',
  },
  editAvatarButton: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#6B7280',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#FFF',
  },
  userName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#6B7280',
  },
  section: {
    paddingTop: 24,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  inputGroup: {
    paddingVertical: 8,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
    marginBottom: 8,
  },
  input: {
    fontSize: 16,
    color: '#111827',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  inputDisabled: {
    backgroundColor: '#F3F4F6',
    color: '#9CA3AF',
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 12,
  },
  goalItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  goalInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  goalIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  goalTextContainer: {
    flex: 1,
  },
  goalLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 2,
  },
  goalDescription: {
    fontSize: 13,
    color: '#6B7280',
  },
  goalInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  goalInput: {
    width: 60,
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    textAlign: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginRight: 8,
  },
  goalUnit: {
    fontSize: 14,
    color: '#6B7280',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 13,
    color: '#6B7280',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 20,
    marginTop: 32,
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
});

export default ProfileScreen;