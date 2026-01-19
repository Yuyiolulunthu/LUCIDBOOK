// ==========================================
// 檔案名稱: BiometricSettingsScreen.js
// 功能: 生物識別設定管理頁面
// 🎨 可獨立使用或整合到設定頁面
// ✅ 啟用/停用生物識別
// ✅ 顯示當前狀態
// ✅ 重新設定憑證
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
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import {
  checkBiometricAvailability,
  getBiometricTypeText,
  getBiometricTypeIcon,
  isBiometricEnabled,
  setupBiometric,
  disableBiometric,
} from './BiometricUtils';

const BiometricSettingsScreen = ({ navigation, route }) => {
  // 從登入頁傳入的用戶憑證（用於設定）
  const { userEmail, userPassword } = route.params || {};
  
  const [isLoading, setIsLoading] = useState(true);
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [biometricType, setBiometricType] = useState(null);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [unavailableReason, setUnavailableReason] = useState('');

  useEffect(() => {
    checkBiometricStatus();
  }, []);

  // 檢查生物識別狀態
  const checkBiometricStatus = async () => {
    setIsLoading(true);
    try {
      // 檢查可用性
      const availability = await checkBiometricAvailability();
      
      if (availability.available) {
        setBiometricAvailable(true);
        setBiometricType(availability.type);
        
        // 檢查是否已啟用
        const enabled = await isBiometricEnabled();
        setBiometricEnabled(enabled);
      } else {
        setBiometricAvailable(false);
        setUnavailableReason(availability.reason);
      }
    } catch (error) {
      console.error('檢查生物識別狀態失敗:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 切換生物識別開關
  const handleToggleBiometric = async (value) => {
    if (value) {
      // 啟用生物識別
      if (!userEmail || !userPassword) {
        Alert.alert(
          '需要重新登入',
          '啟用生物識別需要驗證您的身份\n請先登出後重新登入',
          [
            { text: '取消', style: 'cancel' },
            {
              text: '前往登入',
              onPress: () => {
                navigation.navigate('Login');
              }
            }
          ]
        );
        return;
      }
      
      setIsLoading(true);
      const result = await setupBiometric(userEmail, userPassword);
      setIsLoading(false);
      
      if (result.success) {
        setBiometricEnabled(true);
        Alert.alert(
          '設定成功！',
          result.message,
          [{ text: '太好了' }]
        );
      } else {
        Alert.alert('設定失敗', result.message);
      }
    } else {
      // 停用生物識別
      Alert.alert(
        '確認停用',
        `確定要停用${getBiometricTypeText(biometricType)}登入嗎？`,
        [
          { text: '取消', style: 'cancel' },
          {
            text: '停用',
            style: 'destructive',
            onPress: async () => {
              setIsLoading(true);
              const result = await disableBiometric();
              setIsLoading(false);
              
              if (result.success) {
                setBiometricEnabled(false);
                Alert.alert('已停用', `${getBiometricTypeText(biometricType)}登入已停用`);
              } else {
                Alert.alert('停用失敗', result.error);
              }
            }
          }
        ]
      );
    }
  };

  // 返回按鈕
  const handleGoBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    }
  };

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
        <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>生物識別登入</Text>
        <View style={styles.headerPlaceholder} />
      </LinearGradient>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.contentContainer}>
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#166CB5" />
              <Text style={styles.loadingText}>檢查中...</Text>
            </View>
          ) : (
            <>
              {/* 圖示區域 */}
              <View style={styles.iconContainer}>
                <View style={styles.iconCircle}>
                  <LinearGradient
                    colors={biometricAvailable 
                      ? ['#166CB5', '#31C6FE']
                      : ['#9CA3AF', '#9CA3AF']
                    }
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.iconGradient}
                  >
                    <Ionicons 
                      name={biometricAvailable 
                        ? getBiometricTypeIcon(biometricType)
                        : "lock-closed-outline"
                      } 
                      size={48} 
                      color="#FFFFFF" 
                    />
                  </LinearGradient>
                </View>
              </View>

              {/* 主要卡片 */}
              <View style={styles.mainCard}>
                {biometricAvailable ? (
                  <>
                    <Text style={styles.cardTitle}>
                      {getBiometricTypeText(biometricType)}登入
                    </Text>
                    <Text style={styles.cardSubtitle}>
                      使用{getBiometricTypeText(biometricType)}快速登入您的帳戶
                    </Text>

                    {/* 開關 */}
                    <View style={styles.switchContainer}>
                      <View style={styles.switchTextContainer}>
                        <Text style={styles.switchLabel}>
                          啟用{getBiometricTypeText(biometricType)}登入
                        </Text>
                        <Text style={styles.switchHint}>
                          {biometricEnabled 
                            ? `下次可直接使用${getBiometricTypeText(biometricType)}登入`
                            : '您的憑證將被安全加密儲存'
                          }
                        </Text>
                      </View>
                      <Switch
                        value={biometricEnabled}
                        onValueChange={handleToggleBiometric}
                        trackColor={{ false: '#D1D5DB', true: '#93C5FD' }}
                        thumbColor={biometricEnabled ? '#166CB5' : '#F3F4F6'}
                        ios_backgroundColor="#D1D5DB"
                      />
                    </View>

                    {/* 狀態提示 */}
                    {biometricEnabled && (
                      <View style={styles.statusCard}>
                        <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                        <Text style={styles.statusText}>
                          {getBiometricTypeText(biometricType)}登入已啟用
                        </Text>
                      </View>
                    )}

                    {/* 安全說明 */}
                    <View style={styles.infoCard}>
                      <View style={styles.infoHeader}>
                        <Ionicons name="shield-checkmark" size={20} color="#166CB5" />
                        <Text style={styles.infoTitle}>安全說明</Text>
                      </View>
                      <View style={styles.infoList}>
                        <View style={styles.infoItem}>
                          <Ionicons name="checkmark" size={16} color="#6B7280" />
                          <Text style={styles.infoText}>
                            憑證使用硬體級加密儲存
                          </Text>
                        </View>
                        <View style={styles.infoItem}>
                          <Ionicons name="checkmark" size={16} color="#6B7280" />
                          <Text style={styles.infoText}>
                            僅儲存在您的裝置上
                          </Text>
                        </View>
                        <View style={styles.infoItem}>
                          <Ionicons name="checkmark" size={16} color="#6B7280" />
                          <Text style={styles.infoText}>
                            可隨時停用並清除資料
                          </Text>
                        </View>
                      </View>
                    </View>
                  </>
                ) : (
                  <>
                    <Text style={styles.cardTitle}>生物識別不可用</Text>
                    <Text style={styles.cardSubtitle}>{unavailableReason}</Text>

                    <View style={styles.warningCard}>
                      <Ionicons name="information-circle" size={20} color="#F59E0B" />
                      <Text style={styles.warningText}>
                        請確認您的裝置支援生物識別功能，並已在系統設定中完成設定
                      </Text>
                    </View>
                  </>
                )}
              </View>
            </>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  headerPlaceholder: {
    width: 40,
  },

  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },

  // Loading
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 14,
    color: '#6B7280',
  },

  // Icon
  iconContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    overflow: 'hidden',
    shadowColor: '#166CB5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  iconGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Main Card
  mainCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 4,
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 8,
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },

  // Switch
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    marginBottom: 16,
  },
  switchTextContainer: {
    flex: 1,
    marginRight: 16,
  },
  switchLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  switchHint: {
    fontSize: 12,
    color: '#9CA3AF',
    lineHeight: 16,
  },

  // Status Card
  statusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  statusText: {
    fontSize: 14,
    color: '#15803D',
    fontWeight: '600',
    marginLeft: 8,
  },

  // Info Card
  infoCard: {
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#166CB5',
    marginLeft: 8,
  },
  infoList: {
    gap: 8,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  infoText: {
    fontSize: 13,
    color: '#4B5563',
    marginLeft: 8,
    flex: 1,
    lineHeight: 18,
  },

  // Warning Card
  warningCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFFBEB',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#FEF3C7',
  },
  warningText: {
    fontSize: 13,
    color: '#92400E',
    marginLeft: 8,
    flex: 1,
    lineHeight: 18,
  },
});

export default BiometricSettingsScreen;