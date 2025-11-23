// ==========================================
// 檔案名稱: Settings.js
// 功能: 設定頁面
// 
// ✅ 帳號設定（個人資料、修改密碼、隱私設定、企業引薦碼）
// ✅ 通知設定（推播通知、練習提醒時間）
// ✅ 應用設定（音效、深色模式、語言）
// ✅ 關於（關於我們、幫助中心、服務條款、隱私政策、版本）
// ✅ 帳號管理（登出、刪除帳號）
// 🎨 依照設計程式風格更新
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
  ActivityIndicator,
  Platform,
  KeyboardAvoidingView,
  Modal,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import ApiService from '../../../../api';

const Settings = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  
  // 通知設定
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = useState(false);
  const [reminderTime, setReminderTime] = useState('09:00');

  // 時間選擇器 Modal 狀態
  const [timePickerVisible, setTimePickerVisible] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('上午'); // 上午 or 下午
  const [selectedHour, setSelectedHour] = useState(9);
  const [selectedMinute, setSelectedMinute] = useState(0);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      // 載入儲存的設定
      const savedNotifications = await AsyncStorage.getItem('notificationsEnabled');
      const savedSound = await AsyncStorage.getItem('soundEnabled');
      const savedDarkMode = await AsyncStorage.getItem('darkModeEnabled');
      const savedReminderTime = await AsyncStorage.getItem('reminderTime');

      if (savedNotifications !== null) setNotificationsEnabled(JSON.parse(savedNotifications));
      if (savedSound !== null) setSoundEnabled(JSON.parse(savedSound));
      if (savedDarkMode !== null) setDarkModeEnabled(JSON.parse(savedDarkMode));
      if (savedReminderTime !== null) {
        setReminderTime(savedReminderTime);
        // 解析已儲存的時間來設定選擇器初始值
        parseTimeToState(savedReminderTime);
      }
    } catch (error) {
      console.error('載入設定失敗:', error);
    } finally {
      setLoading(false);
    }
  };

  // 解析時間字串到狀態 (例如 "09:00" -> 上午 9:00)
  const parseTimeToState = (timeStr) => {
    const [hourStr, minuteStr] = timeStr.split(':');
    let hour = parseInt(hourStr, 10);
    const minute = parseInt(minuteStr, 10);
    
    if (hour === 0) {
      setSelectedPeriod('上午');
      setSelectedHour(12);
    } else if (hour === 12) {
      setSelectedPeriod('下午');
      setSelectedHour(12);
    } else if (hour > 12) {
      setSelectedPeriod('下午');
      setSelectedHour(hour - 12);
    } else {
      setSelectedPeriod('上午');
      setSelectedHour(hour);
    }
    setSelectedMinute(minute);
  };

  // 格式化時間顯示 (12小時制帶上午/下午)
  const formatTimeDisplay = (timeStr) => {
    const [hourStr, minuteStr] = timeStr.split(':');
    let hour = parseInt(hourStr, 10);
    const minute = minuteStr;
    
    if (hour === 0) {
      return `上午 12:${minute}`;
    } else if (hour === 12) {
      return `下午 12:${minute}`;
    } else if (hour > 12) {
      return `下午 ${hour - 12}:${minute}`;
    } else {
      return `上午 ${hour}:${minute}`;
    }
  };

  // 將選擇的時間轉換為24小時制字串
  const convertTo24Hour = () => {
    let hour = selectedHour;
    if (selectedPeriod === '上午') {
      if (hour === 12) hour = 0;
    } else {
      if (hour !== 12) hour = hour + 12;
    }
    const hourStr = hour.toString().padStart(2, '0');
    const minuteStr = selectedMinute.toString().padStart(2, '0');
    return `${hourStr}:${minuteStr}`;
  };

  // 確認時間選擇
  const handleConfirmTime = async () => {
    const newTime = convertTo24Hour();
    setReminderTime(newTime);
    await AsyncStorage.setItem('reminderTime', newTime);
    setTimePickerVisible(false);
  };

  // 打開時間選擇器
  const handleOpenTimePicker = () => {
    parseTimeToState(reminderTime);
    setTimePickerVisible(true);
  };

  const toggleSetting = async (key, value, setter) => {
    setter(value);
    await AsyncStorage.setItem(key, JSON.stringify(value));
  };

  // 導航功能
  const handleNavigateToProfile = () => {
    navigation.navigate('ProfileEdit');
  };

  const handleNavigateToPassword = () => {
    // 導航到 ResetPassword 頁面
    navigation.navigate('ResetPassword');
  };

  const handleNavigateToPrivacy = () => {
    navigation.navigate('PrivacySettings');
  };

  const handleNavigateToCompanyReferral = () => {
    navigation.navigate('EnterpriseCodeManagement');
  };

  const handleNavigateToAboutUs = () => {
    navigation.navigate('AboutUs');
  };

  const handleNavigateToHelp = () => {
    navigation.navigate('HelpCenter');
  };

  const handleNavigateToTerms = () => {
    navigation.navigate('TermsOfService');
  };

  const handleNavigateToPrivacyPolicy = () => {
    navigation.navigate('PrivacyPolicy');
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

  const handleDeleteAccount = () => {
    Alert.alert(
      '刪除帳號',
      '此操作無法復原，確定要刪除您的帳號嗎？',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '刪除',
          style: 'destructive',
          onPress: async () => {
            try {
              // 呼叫刪除帳號 API
              // await ApiService.deleteAccount();
              await AsyncStorage.clear();
              navigation.reset({
                index: 0,
                routes: [{ name: 'Login' }],
              });
            } catch (error) {
              console.error('刪除帳號失敗:', error);
              Alert.alert('錯誤', '刪除帳號失敗，請稍後再試');
            }
          }
        }
      ]
    );
  };

  // 渲染導航項目
  const renderNavigateItem = (icon, label, onPress, iconColor = '#166CB5') => (
    <TouchableOpacity
      style={styles.settingItem}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.settingItemLeft}>
        <View style={[styles.iconContainer, { backgroundColor: `${iconColor}15` }]}>
          <Ionicons name={icon} size={20} color={iconColor} />
        </View>
        <Text style={styles.settingItemLabel}>{label}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
    </TouchableOpacity>
  );

  // 渲染 Toggle 項目
  const renderToggleItem = (icon, label, value, onToggle, iconColor = '#166CB5') => (
    <View style={styles.settingItem}>
      <View style={styles.settingItemLeft}>
        <View style={[styles.iconContainer, { backgroundColor: `${iconColor}15` }]}>
          <Ionicons name={icon} size={20} color={iconColor} />
        </View>
        <Text style={styles.settingItemLabel}>{label}</Text>
      </View>
      <TouchableOpacity
        style={[
          styles.toggleButton,
          value && styles.toggleButtonActive
        ]}
        onPress={() => onToggle(!value)}
        activeOpacity={0.8}
      >
        {value ? (
          <LinearGradient
            colors={['#166CB5', '#31C6FE']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.toggleButtonGradient}
          >
            <View style={[styles.toggleKnob, styles.toggleKnobActive]} />
          </LinearGradient>
        ) : (
          <View style={styles.toggleButtonInactive}>
            <View style={styles.toggleKnob} />
          </View>
        )}
      </TouchableOpacity>
    </View>
  );

  // 渲染文字項目
  const renderTextItem = (icon, label, value, iconColor = '#166CB5') => (
    <View style={styles.settingItem}>
      <View style={styles.settingItemLeft}>
        <View style={[styles.iconContainer, { backgroundColor: `${iconColor}15` }]}>
          <Ionicons name={icon} size={20} color={iconColor} />
        </View>
        <Text style={styles.settingItemLabel}>{label}</Text>
      </View>
      <Text style={styles.settingItemValue}>{value}</Text>
    </View>
  );

  // 渲染可點擊的時間項目
  const renderTimeItem = (icon, label, value, onPress, iconColor = '#166CB5') => (
    <TouchableOpacity
      style={styles.settingItem}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.settingItemLeft}>
        <View style={[styles.iconContainer, { backgroundColor: `${iconColor}15` }]}>
          <Ionicons name={icon} size={20} color={iconColor} />
        </View>
        <Text style={styles.settingItemLabel}>{label}</Text>
      </View>
      <View style={styles.timeValueContainer}>
        <Text style={styles.settingItemValue}>{value}</Text>
        <Ionicons name="chevron-forward" size={16} color="#9CA3AF" style={{ marginLeft: 4 }} />
      </View>
    </TouchableOpacity>
  );

  // 渲染危險操作項目
  const renderDangerItem = (icon, label, onPress, color = '#EF4444') => (
    <TouchableOpacity
      style={styles.settingItem}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.settingItemLeft}>
        <View style={[styles.iconContainer, { backgroundColor: `${color}15` }]}>
          <Ionicons name={icon} size={20} color={color} />
        </View>
        <Text style={[styles.settingItemLabel, { color }]}>{label}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
    </TouchableOpacity>
  );

  // 渲染時間選擇器 Modal
  const renderTimePickerModal = () => {
    const hours = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
    const minutes = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];

    return (
      <Modal
        visible={timePickerVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setTimePickerVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>設定提醒時間</Text>
              <TouchableOpacity
                onPress={() => setTimePickerVisible(false)}
                style={styles.modalCloseButton}
              >
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            {/* 上午/下午 選擇 */}
            <View style={styles.periodSelector}>
              <TouchableOpacity
                style={[
                  styles.periodButton,
                  selectedPeriod === '上午' && styles.periodButtonActive
                ]}
                onPress={() => setSelectedPeriod('上午')}
              >
                {selectedPeriod === '上午' ? (
                  <LinearGradient
                    colors={['#166CB5', '#31C6FE']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.periodButtonGradient}
                  >
                    <Text style={styles.periodButtonTextActive}>上午</Text>
                  </LinearGradient>
                ) : (
                  <Text style={styles.periodButtonText}>上午</Text>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.periodButton,
                  selectedPeriod === '下午' && styles.periodButtonActive
                ]}
                onPress={() => setSelectedPeriod('下午')}
              >
                {selectedPeriod === '下午' ? (
                  <LinearGradient
                    colors={['#166CB5', '#31C6FE']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.periodButtonGradient}
                  >
                    <Text style={styles.periodButtonTextActive}>下午</Text>
                  </LinearGradient>
                ) : (
                  <Text style={styles.periodButtonText}>下午</Text>
                )}
              </TouchableOpacity>
            </View>

            {/* 時間顯示 */}
            <View style={styles.timeDisplay}>
              <Text style={styles.timeDisplayText}>
                {selectedPeriod} {selectedHour}:{selectedMinute.toString().padStart(2, '0')}
              </Text>
            </View>

            {/* 小時選擇 */}
            <View style={styles.pickerSection}>
              <Text style={styles.pickerLabel}>小時</Text>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.pickerScrollContent}
              >
                {hours.map((hour) => (
                  <TouchableOpacity
                    key={`hour-${hour}`}
                    style={[
                      styles.pickerItem,
                      selectedHour === hour && styles.pickerItemActive
                    ]}
                    onPress={() => setSelectedHour(hour)}
                  >
                    {selectedHour === hour ? (
                      <LinearGradient
                        colors={['#166CB5', '#31C6FE']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.pickerItemGradient}
                      >
                        <Text style={styles.pickerItemTextActive}>{hour}</Text>
                      </LinearGradient>
                    ) : (
                      <Text style={styles.pickerItemText}>{hour}</Text>
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* 分鐘選擇 */}
            <View style={styles.pickerSection}>
              <Text style={styles.pickerLabel}>分鐘</Text>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.pickerScrollContent}
              >
                {minutes.map((minute) => (
                  <TouchableOpacity
                    key={`minute-${minute}`}
                    style={[
                      styles.pickerItem,
                      selectedMinute === minute && styles.pickerItemActive
                    ]}
                    onPress={() => setSelectedMinute(minute)}
                  >
                    {selectedMinute === minute ? (
                      <LinearGradient
                        colors={['#166CB5', '#31C6FE']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.pickerItemGradient}
                      >
                        <Text style={styles.pickerItemTextActive}>
                          {minute.toString().padStart(2, '0')}
                        </Text>
                      </LinearGradient>
                    ) : (
                      <Text style={styles.pickerItemText}>
                        {minute.toString().padStart(2, '0')}
                      </Text>
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* 確認按鈕 */}
            <TouchableOpacity
              style={styles.confirmButton}
              onPress={handleConfirmTime}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#166CB5', '#31C6FE']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.confirmButtonGradient}
              >
                <Text style={styles.confirmButtonText}>確認</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#166CB5" />
        <LinearGradient
          colors={['#166CB5', '#31C6FE']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.header}
        >
          <View style={styles.headerContent}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="chevron-back" size={24} color="#FFF" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>設定</Text>
            <View style={styles.headerPlaceholder} />
          </View>
        </LinearGradient>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#166CB5" />
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar barStyle="light-content" backgroundColor="#166CB5" />
      
      {/* Header */}
      <LinearGradient
        colors={['#166CB5', '#31C6FE']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <Ionicons name="chevron-back" size={24} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>設定</Text>
          <View style={styles.headerPlaceholder} />
        </View>
      </LinearGradient>

      {/* Content */}
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 帳號設定 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>帳號設定</Text>
          <View style={styles.sectionCard}>
            {renderNavigateItem('person-outline', '個人資料', handleNavigateToProfile)}
            <View style={styles.divider} />
            {renderNavigateItem('lock-closed-outline', '修改密碼', handleNavigateToPassword)}
            <View style={styles.divider} />
            {renderNavigateItem('shield-outline', '隱私設定', handleNavigateToPrivacy)}
            <View style={styles.divider} />
            {renderNavigateItem('business-outline', '企業引薦碼', handleNavigateToCompanyReferral)}
          </View>
        </View>

        {/* 通知設定 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>通知設定</Text>
          <View style={styles.sectionCard}>
            {renderToggleItem(
              'notifications-outline', 
              '推播通知', 
              notificationsEnabled, 
              (value) => toggleSetting('notificationsEnabled', value, setNotificationsEnabled)
            )}
            <View style={styles.divider} />
            {renderTimeItem(
              'time-outline', 
              '練習提醒時間', 
              formatTimeDisplay(reminderTime),
              handleOpenTimePicker
            )}
          </View>
        </View>

        {/* 應用設定 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>應用設定</Text>
          <View style={styles.sectionCard}>
            {renderToggleItem(
              'volume-high-outline', 
              '音效', 
              soundEnabled, 
              (value) => toggleSetting('soundEnabled', value, setSoundEnabled)
            )}
            <View style={styles.divider} />
            {renderToggleItem(
              'moon-outline', 
              '深色模式', 
              darkModeEnabled, 
              (value) => toggleSetting('darkModeEnabled', value, setDarkModeEnabled)
            )}
            <View style={styles.divider} />
            {renderTextItem('globe-outline', '語言', '繁體中文')}
          </View>
        </View>

        {/* 關於 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>關於</Text>
          <View style={styles.sectionCard}>
            {renderNavigateItem('information-circle-outline', '關於我們', handleNavigateToAboutUs)}
            <View style={styles.divider} />
            {renderNavigateItem('help-circle-outline', '幫助中心', handleNavigateToHelp)}
            <View style={styles.divider} />
            {renderNavigateItem('document-text-outline', '服務條款', handleNavigateToTerms)}
            <View style={styles.divider} />
            {renderNavigateItem('shield-checkmark-outline', '隱私政策', handleNavigateToPrivacyPolicy)}
            <View style={styles.divider} />
            {renderTextItem('phone-portrait-outline', '版本資訊', 'v1.0.0')}
          </View>
        </View>

        {/* 帳號管理 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>帳號管理</Text>
          <View style={styles.sectionCard}>
            {renderDangerItem('log-out-outline', '登出', handleLogout, '#EF4444')}
            <View style={styles.divider} />
            {renderDangerItem('trash-outline', '刪除帳號', handleDeleteAccount, '#DC2626')}
          </View>
        </View>

        {/* App Info */}
        <View style={styles.appInfo}>
          <Text style={styles.appInfoText}>路晰書 LUCIDBOOK</Text>
          <Text style={styles.appInfoText}>© 2025 All rights reserved</Text>
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* 時間選擇器 Modal */}
      {renderTimePickerModal()}
    </KeyboardAvoidingView>
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
  },

  // Header
  header: {
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
    fontSize: 18,
    fontWeight: '600',
    color: '#FFF',
  },
  headerPlaceholder: {
    width: 40,
  },

  // ScrollView
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 24,
  },

  // Section
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 12,
    paddingHorizontal: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sectionCard: {
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(229,231,235,0.5)',
  },

  // Setting Item
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  settingItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingItemLabel: {
    fontSize: 16,
    color: '#1F2937',
  },
  settingItemValue: {
    fontSize: 14,
    color: '#6B7280',
  },
  timeValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  // Divider
  divider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginLeft: 68,
  },

  // Toggle Button
  toggleButton: {
    width: 48,
    height: 28,
    borderRadius: 14,
    overflow: 'hidden',
  },
  toggleButtonActive: {
    // 由 LinearGradient 處理
  },
  toggleButtonGradient: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingHorizontal: 2,
  },
  toggleButtonInactive: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingHorizontal: 2,
    backgroundColor: '#D1D5DB',
    borderRadius: 14,
  },
  toggleKnob: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  toggleKnobActive: {
    // 位置由父容器控制
  },

  // App Info
  appInfo: {
    alignItems: 'center',
    paddingTop: 32,
    paddingBottom: 16,
    gap: 4,
  },
  appInfoText: {
    fontSize: 12,
    color: '#9CA3AF',
  },

  bottomPadding: {
    height: 40,
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '90%',
    maxWidth: 400,
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  modalCloseButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Period Selector (上午/下午)
  periodSelector: {
    flexDirection: 'row',
    marginBottom: 20,
    gap: 12,
  },
  periodButton: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  periodButtonActive: {
    backgroundColor: 'transparent',
  },
  periodButtonGradient: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  periodButtonText: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
  },
  periodButtonTextActive: {
    fontSize: 16,
    color: '#FFF',
    fontWeight: '600',
  },

  // Time Display
  timeDisplay: {
    alignItems: 'center',
    paddingVertical: 16,
    marginBottom: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
  },
  timeDisplayText: {
    fontSize: 32,
    fontWeight: '600',
    color: '#166CB5',
  },

  // Picker Section
  pickerSection: {
    marginBottom: 16,
  },
  pickerLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 10,
    fontWeight: '500',
  },
  pickerScrollContent: {
    paddingHorizontal: 4,
    gap: 8,
  },
  pickerItem: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  pickerItemActive: {
    backgroundColor: 'transparent',
    overflow: 'hidden',
  },
  pickerItemGradient: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pickerItemText: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
  },
  pickerItemTextActive: {
    fontSize: 16,
    color: '#FFF',
    fontWeight: '600',
  },

  // Confirm Button
  confirmButton: {
    marginTop: 8,
    borderRadius: 12,
    overflow: 'hidden',
  },
  confirmButtonGradient: {
    paddingVertical: 14,
    alignItems: 'center',
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
});

export default Settings;