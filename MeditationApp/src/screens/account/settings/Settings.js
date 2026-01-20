// ==========================================
// 檔案名稱: Settings.js
// 版本: V3.1 - 整合漸層開關組件
// 
// ✅ 簡化為兩大區塊：帳號管理、支援
// ✅ 新增生物識別登入開關（Face ID / 指紋）
// ✅ 藍色漸層開關（已整合，無需外部組件）
// ✅ 開關直接操作，不跳轉頁面
// ✅ 添加說明圖標和彈窗
// ✅ 底部顯示：登出、服務條款、隱私權政策、版本
// ==========================================

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  StatusBar,
  Alert,
  Platform,
  Modal,
  ActivityIndicator,
  Animated,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import ApiService from '../../../../api';
import {
  checkBiometricAvailability,
  getBiometricTypeText,
  getBiometricTypeIcon,
  isBiometricEnabled,
  setupBiometric,
  disableBiometric,
} from '../../auth/BiometricUtils';
import { getCurrentUserData } from '../../auth/AuthUtils';

// ==========================================
// 漸層開關組件（內建）
// ==========================================
const GradientSwitch = ({ value, onValueChange, disabled = false }) => {
  // 動畫值
  const translateX = useRef(new Animated.Value(value ? 22 : 2)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  // 當值改變時執行動畫
  useEffect(() => {
    Animated.spring(translateX, {
      toValue: value ? 22 : 2,
      friction: 7,
      tension: 80,
      useNativeDriver: true,
    }).start();
  }, [value]);

  const handlePress = () => {
    if (disabled) return;

    // 點擊動畫
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    onValueChange(!value);
  };

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={handlePress}
      disabled={disabled}
      style={[
        switchStyles.container,
        disabled && switchStyles.containerDisabled,
      ]}
    >
      {value ? (
        // 開啟狀態 - 藍色漸層背景
        <LinearGradient
          colors={['#166CB5', '#31C6FE']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={switchStyles.track}
        >
          <Animated.View
            style={[
              switchStyles.thumb,
              {
                transform: [
                  { translateX },
                  { scale: scaleAnim },
                ],
              },
            ]}
          />
        </LinearGradient>
      ) : (
        // 關閉狀態 - 灰色背景
        <View style={[switchStyles.track, switchStyles.trackOff]}>
          <Animated.View
            style={[
              switchStyles.thumb,
              {
                transform: [
                  { translateX },
                  { scale: scaleAnim },
                ],
              },
            ]}
          />
        </View>
      )}
    </TouchableOpacity>
  );
};

// 漸層開關樣式
const switchStyles = StyleSheet.create({
  container: {
    width: 51,
    height: 31,
  },
  containerDisabled: {
    opacity: 0.5,
  },
  track: {
    width: '100%',
    height: '100%',
    borderRadius: 16,
    justifyContent: 'center',
    shadowColor: '#166CB5',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  trackOff: {
    backgroundColor: '#D1D5DB',
    shadowColor: '#000',
    shadowOpacity: 0.1,
  },
  thumb: {
    width: 27,
    height: 27,
    borderRadius: 13.5,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
  },
});

// ==========================================
// 設定頁面主組件
// ==========================================
const Settings = ({ navigation }) => {
  // 生物識別狀態
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [biometricType, setBiometricType] = useState(null);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [isCheckingBiometric, setIsCheckingBiometric] = useState(true);
  
  // 說明彈窗
  const [showBiometricInfo, setShowBiometricInfo] = useState(false);

  useEffect(() => {
    checkBiometricStatus();
  }, []);

  // 檢查生物識別狀態
  const checkBiometricStatus = async () => {
    setIsCheckingBiometric(true);
    try {
      // 檢查可用性
      const availability = await checkBiometricAvailability();
      
      if (availability.available) {
        setBiometricAvailable(true);
        setBiometricType(availability.type);
        
        // 檢查是否已啟用
        const enabled = await isBiometricEnabled();
        setBiometricEnabled(enabled);
        
        console.log('✅ [Settings] 生物識別狀態:', {
          available: true,
          type: availability.type,
          enabled,
        });
      } else {
        setBiometricAvailable(false);
        console.log('❌ [Settings] 生物識別不可用:', availability.reason);
      }
    } catch (error) {
      console.error('檢查生物識別狀態失敗:', error);
      setBiometricAvailable(false);
    } finally {
      setIsCheckingBiometric(false);
    }
  };

  // 切換生物識別開關
  const handleToggleBiometric = async (value) => {
    if (value) {
      // 啟用生物識別
      try {
        // 獲取當前用戶資料
        const userData = await getCurrentUserData();
        
        if (!userData || !userData.email) {
          Alert.alert(
            '需要重新登入',
            '啟用生物識別需要驗證您的身份\n請先登出後重新登入',
            [
              { text: '取消', style: 'cancel' },
              {
                text: '前往登入',
                onPress: () => {
                  handleLogout();
                }
              }
            ]
          );
          return;
        }

        // 提示用戶需要重新登入以獲取密碼
        Alert.alert(
          '需要驗證身份',
          `啟用${getBiometricTypeText(biometricType)}登入需要您的密碼\n請重新登入以完成設定`,
          [
            { text: '取消', style: 'cancel' },
            {
              text: '重新登入',
              onPress: () => {
                navigation.navigate('Login', {
                  setupBiometric: true,
                  returnToSettings: true,
                });
              }
            }
          ]
        );
      } catch (error) {
        console.error('啟用生物識別失敗:', error);
        Alert.alert('錯誤', '無法啟用生物識別，請稍後再試');
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
              try {
                const result = await disableBiometric();
                
                if (result.success) {
                  setBiometricEnabled(false);
                  Alert.alert(
                    '已停用',
                    `${getBiometricTypeText(biometricType)}登入已停用`
                  );
                } else {
                  Alert.alert('停用失敗', result.error || '無法停用生物識別');
                }
              } catch (error) {
                console.error('停用生物識別失敗:', error);
                Alert.alert('錯誤', '停用失敗，請稍後再試');
              }
            }
          }
        ]
      );
    }
  };

  const handleNavigateToProfile = () => {
    navigation.navigate('ProfileEdit');
  };

  const handleNavigateToPassword = () => {
    navigation.navigate('ResetPassword');
  };

  const handleNavigateToDeleteAccount = () => {
    navigation.navigate('DeleteAccount');
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
      '登出確認',
      '確定要登出嗎？',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '登出',
          style: 'destructive',
          onPress: async () => {
            try {
              await ApiService.logout();
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

  // 渲染一般選項
  const renderMenuItem = (icon, label, subLabel, onPress, isDanger = false) => (
    <TouchableOpacity
      style={styles.menuItem}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.menuItemLeft}>
        <View style={[
          styles.iconContainer,
          { backgroundColor: isDanger ? 'rgba(239, 68, 68, 0.1)' : 'rgba(22, 108, 181, 0.1)' }
        ]}>
          <Ionicons 
            name={icon} 
            size={24} 
            color={isDanger ? '#EF4444' : '#166CB5'} 
          />
        </View>
        <View style={styles.menuItemTextContainer}>
          <Text style={[
            styles.menuItemLabel,
            isDanger && { color: '#EF4444' }
          ]}>
            {label}
          </Text>
          {subLabel && (
            <Text style={styles.menuItemSubLabel}>{subLabel}</Text>
          )}
        </View>
      </View>
      <Ionicons 
        name="chevron-forward" 
        size={20} 
        color={isDanger ? 'rgba(239, 68, 68, 0.3)' : '#D1D5DB'} 
      />
    </TouchableOpacity>
  );

  // 渲染生物識別開關選項
  const renderBiometricToggle = () => {
    if (!biometricAvailable || isCheckingBiometric) {
      return null;
    }

    return (
      <>
        <View style={styles.divider} />
        <View style={styles.menuItem}>
          <View style={styles.menuItemLeft}>
            <View style={[styles.iconContainer, { backgroundColor: 'rgba(22, 108, 181, 0.1)' }]}>
              <Ionicons 
                name={getBiometricTypeIcon(biometricType)} 
                size={24} 
                color="#166CB5" 
              />
            </View>
            <View style={styles.menuItemTextContainer}>
              <View style={styles.biometricLabelRow}>
                <Text style={styles.menuItemLabel}>
                  {getBiometricTypeText(biometricType)}登入
                </Text>
                <TouchableOpacity 
                  onPress={() => setShowBiometricInfo(true)}
                  style={styles.infoButton}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Ionicons name="information-circle-outline" size={20} color="#9CA3AF" />
                </TouchableOpacity>
              </View>
              <Text style={styles.menuItemSubLabel}>
                {biometricEnabled ? '已啟用快速登入' : '啟用後可快速登入'}
              </Text>
            </View>
          </View>
          <GradientSwitch
            value={biometricEnabled}
            onValueChange={handleToggleBiometric}
            disabled={false}
          />
        </View>
      </>
    );
  };

  // 說明彈窗
  const BiometricInfoModal = () => (
    <Modal
      visible={showBiometricInfo}
      transparent={true}
      animationType="fade"
      onRequestClose={() => setShowBiometricInfo(false)}
    >
      <TouchableOpacity 
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={() => setShowBiometricInfo(false)}
      >
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <View style={styles.modalIconContainer}>
              <Ionicons 
                name={getBiometricTypeIcon(biometricType)} 
                size={32} 
                color="#166CB5" 
              />
            </View>
            <Text style={styles.modalTitle}>
              {getBiometricTypeText(biometricType)}登入
            </Text>
          </View>

          <View style={styles.modalBody}>
            <View style={styles.infoItem}>
              <Ionicons name="checkmark-circle" size={20} color="#10B981" />
              <Text style={styles.infoText}>
                使用{getBiometricTypeText(biometricType)}快速登入您的帳戶
              </Text>
            </View>
            
            <View style={styles.infoItem}>
              <Ionicons name="checkmark-circle" size={20} color="#10B981" />
              <Text style={styles.infoText}>
                憑證使用硬體級加密儲存
              </Text>
            </View>
            
            <View style={styles.infoItem}>
              <Ionicons name="checkmark-circle" size={20} color="#10B981" />
              <Text style={styles.infoText}>
                僅儲存在您的裝置上
              </Text>
            </View>
            
            <View style={styles.infoItem}>
              <Ionicons name="checkmark-circle" size={20} color="#10B981" />
              <Text style={styles.infoText}>
                可隨時停用並清除資料
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.modalButton}
            onPress={() => setShowBiometricInfo(false)}
          >
            <Text style={styles.modalButtonText}>知道了</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );

  return (
    <View style={styles.container}>
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
          <View style={styles.headerSpacer} />
        </View>
      </LinearGradient>

      {/* Content */}
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 帳號管理 */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionIndicator} />
            <Text style={styles.sectionTitle}>帳號管理</Text>
          </View>
          <View style={styles.sectionCard}>
            {renderMenuItem(
              'person-outline',
              '個人資料',
              '包含頭像、姓名、所屬公司顯示',
              handleNavigateToProfile
            )}
            <View style={styles.divider} />
            {renderMenuItem(
              'lock-closed-outline',
              '修改密碼',
              null,
              handleNavigateToPassword
            )}
            {renderBiometricToggle()}
            <View style={styles.divider} />
            {renderMenuItem(
              'trash-outline',
              '刪除帳號',
              null,
              handleNavigateToDeleteAccount,
              true
            )}
          </View>
        </View>

        {/* 支援 */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionIndicator} />
            <Text style={styles.sectionTitle}>支援</Text>
          </View>
          <View style={styles.sectionCard}>
            {renderMenuItem(
              'help-circle-outline',
              '幫助中心',
              '聯絡客服',
              handleNavigateToHelp
            )}
          </View>
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <View style={styles.footerLinks}>
          <TouchableOpacity onPress={handleLogout}>
            <Text style={styles.footerLink}>登出</Text>
          </TouchableOpacity>
          
          <View style={styles.footerDivider} />
          
          <TouchableOpacity onPress={handleNavigateToTerms}>
            <Text style={styles.footerLink}>服務條款</Text>
          </TouchableOpacity>
          
          <View style={styles.footerDivider} />
          
          <TouchableOpacity onPress={handleNavigateToPrivacyPolicy}>
            <Text style={styles.footerLink}>隱私權政策</Text>
          </TouchableOpacity>
          
          <View style={styles.footerDivider} />
          
          <Text style={styles.footerVersion}>v1.0.0</Text>
        </View>
      </View>

      {/* 說明彈窗 */}
      <BiometricInfoModal />
    </View>
  );
};

// ==========================================
// 主要樣式
// ==========================================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },

  header: {
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
    }),
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
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFF',
  },
  headerSpacer: {
    width: 40,
  },

  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 100,
  },

  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  sectionIndicator: {
    width: 4,
    height: 16,
    backgroundColor: '#166CB5',
    borderRadius: 2,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
    }),
  },

  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 20,
    paddingHorizontal: 16,
    backgroundColor: 'transparent',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  menuItemTextContainer: {
    flex: 1,
  },
  menuItemLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
  },
  menuItemSubLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },

  // 生物識別專用樣式
  biometricLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  infoButton: {
    padding: 2,
  },

  divider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginHorizontal: 16,
  },

  // Modal 樣式
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  modalIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  modalBody: {
    gap: 16,
    marginBottom: 24,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  modalButton: {
    backgroundColor: '#166CB5',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },

  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingVertical: 32,
    backgroundColor: '#F5F7FA',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  footerLinks: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingHorizontal: 16,
  },
  footerLink: {
    fontSize: 12,
    fontWeight: '500',
    color: '#9CA3AF',
  },
  footerDivider: {
    width: 1,
    height: 12,
    backgroundColor: '#D1D5DB',
  },
  footerVersion: {
    fontSize: 12,
    color: '#9CA3AF',
  },
});

export default Settings;