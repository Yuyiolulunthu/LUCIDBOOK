// ==========================================
// 檔案名稱: ResetPasswordScreen.js
// 功能: 重設密碼頁面 - 新前端設計風格
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
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import ApiService from '../../../api';

const ResetPasswordScreen = ({ navigation, route }) => {
  const [token, setToken] = useState(route?.params?.token || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [tokenValid, setTokenValid] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState('');

  // 判斷是否從設定頁面來的（修改密碼）還是忘記密碼流程
  const isFromSettings = !route?.params?.token;

  useEffect(() => {
    if (!isFromSettings && token) {
      validateToken();
    }
  }, []);

  const validateToken = async () => {
    if (!token) {
      Alert.alert('錯誤', '缺少重設令牌', [
        {
          text: '返回登入',
          onPress: () => navigation.navigate('Login')
        }
      ]);
      return;
    }

    setIsValidating(true);
    try {
      const response = await ApiService.validateResetToken(token);
      if (response.success) {
        setTokenValid(true);
      } else {
        setTokenValid(false);
      }
    } catch (error) {
      setTokenValid(false);
    } finally {
      setIsValidating(false);
    }
  };

  // 密碼強度計算
  const getPasswordStrength = (password) => {
    if (password.length === 0) return { strength: 0, label: '', color: '#E5E7EB' };
    if (password.length < 6) return { strength: 1, label: '弱', color: '#EF4444' };
    if (password.length < 10) return { strength: 2, label: '中', color: '#F59E0B' };
    
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecial = /[@$!%*?&#^()_+\-=\[\]{};':"\\|,.<>\/]/.test(password);
    
    if (hasUpperCase && hasLowerCase && hasNumber && hasSpecial) {
      return { strength: 3, label: '強', color: '#10B981' };
    }
    if ((hasUpperCase || hasLowerCase) && hasNumber) {
      return { strength: 2, label: '中', color: '#F59E0B' };
    }
    return { strength: 1, label: '弱', color: '#EF4444' };
  };

  const passwordStrength = getPasswordStrength(newPassword);

  // 檢查密碼要求
  const checkRequirement = (type) => {
    switch (type) {
      case 'length':
        return newPassword.length >= 8;
      case 'uppercase':
        return /[A-Z]/.test(newPassword);
      case 'lowercase':
        return /[a-z]/.test(newPassword);
      case 'number':
        return /[0-9]/.test(newPassword);
      case 'special':
        return /[@$!%*?&#^()_+\-=\[\]{};':"\\|,.<>\/]/.test(newPassword);
      default:
        return false;
    }
  };

  const handleResetPassword = async () => {
    setError('');

    // 驗證輸入
    if (isFromSettings && !currentPassword) {
      setError('請輸入目前密碼');
      return;
    }

    if (!newPassword || !confirmPassword) {
      setError('請填寫所有欄位');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('新密碼與確認密碼不相符');
      return;
    }

    if (newPassword.length < 8) {
      setError('密碼長度至少需要 8 個字元');
      return;
    }

    const hasUpperCase = /[A-Z]/.test(newPassword);
    const hasLowerCase = /[a-z]/.test(newPassword);
    const hasNumber = /[0-9]/.test(newPassword);

    if (!hasUpperCase || !hasLowerCase || !hasNumber) {
      setError('密碼必須包含大寫字母、小寫字母和數字');
      return;
    }

    setIsLoading(true);
    try {
      let response;
      if (isFromSettings) {
        // ⭐ 從設定頁面來的,呼叫修改密碼 API
        response = await ApiService.changePassword(currentPassword, newPassword);
      } else {
        // ⭐ 忘記密碼流程,呼叫重設密碼 API (參考 ForgotPassword 的寫法)
        response = await ApiService.resetPassword(token, newPassword);
      }
      
      if (response.success) {
        setShowSuccess(true);
        Alert.alert(
          '✅ 成功',
          isFromSettings ? '密碼已成功變更！' : '密碼已成功重設！',
          [
            {
              text: '確定',
              onPress: () => {
                if (isFromSettings) {
                  navigation.goBack();
                } else {
                  navigation.navigate('Login');
                }
              }
            }
          ]
        );
      }
    } catch (error) {
      console.error('❌ 密碼變更失敗:', error);
      setError(error.message || '密碼變更失敗,請稍後再試');
      Alert.alert('❌ 變更失敗', error.message || '密碼變更失敗,請稍後再試');
    } finally {
      setIsLoading(false);
    }
  };

  const goBack = () => {
    if (navigation) {
      navigation.goBack();
    }
  };

  // 驗證中的畫面
  if (isValidating) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#166CB5" />
        <LinearGradient
          colors={['#166CB5', '#31C6FE']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.loadingContainer}
        >
          <View style={styles.loadingCard}>
            <View style={styles.loadingIconCircle}>
              <ActivityIndicator size="large" color="#166CB5" />
            </View>
            <Text style={styles.loadingText}>驗證重設令牌...</Text>
          </View>
        </LinearGradient>
      </View>
    );
  }

  // 令牌無效的畫面（僅限忘記密碼流程）
  if (!isFromSettings && !tokenValid) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#166CB5" />
        <LinearGradient
          colors={['#166CB5', '#31C6FE']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.errorContainerGradient}
        >
          <View style={styles.errorCard}>
            <View style={styles.errorIconCircle}>
              <Ionicons name="close-circle" size={64} color="#DC2626" />
            </View>
            <Text style={styles.errorTitle}>令牌無效</Text>
            <Text style={styles.errorText}>
              重設密碼連結已過期或無效
            </Text>
            <TouchableOpacity 
              style={styles.errorButtonContainer}
              onPress={() => navigation.navigate('ForgotPassword')}
              activeOpacity={0.9}
            >
              <LinearGradient
                colors={['#166CB5', '#31C6FE']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.errorButton}
              >
                <Text style={styles.errorButtonText}>重新申請</Text>
                <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </View>
    );
  }

  // 重設密碼表單
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
            onPress={goBack} 
            style={styles.backButton}
            activeOpacity={0.7}
          >
            <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {isFromSettings ? '修改密碼' : '重設密碼'}
          </Text>
          <View style={styles.headerPlaceholder} />
        </View>
        <Text style={styles.headerSubtitle}>
          為了您的帳號安全,請定期更新密碼
        </Text>
      </LinearGradient>

      <KeyboardAvoidingView 
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView 
            style={styles.scrollView} 
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollViewContent}
          >
            <View style={styles.contentContainer}>
              {/* 錯誤訊息 */}
              {error ? (
                <View style={styles.errorMessageContainer}>
                  <Ionicons name="alert-circle" size={20} color="#DC2626" />
                  <Text style={styles.errorMessageText}>{error}</Text>
                </View>
              ) : null}

              {/* 目前密碼（僅限從設定頁面來的） */}
              {isFromSettings && (
                <View style={styles.inputSection}>
                  <Text style={styles.inputLabel}>目前密碼</Text>
                  <View style={styles.inputWrapper}>
                    <View style={styles.inputIconContainer}>
                      <Ionicons name="lock-closed-outline" size={20} color="#9CA3AF" />
                    </View>
                    <TextInput
                      style={styles.textInput}
                      value={currentPassword}
                      onChangeText={(text) => {
                        setCurrentPassword(text);
                        setError('');
                      }}
                      placeholder="請輸入目前密碼"
                      placeholderTextColor="#9CA3AF"
                      secureTextEntry={!showCurrentPassword}
                      editable={!isLoading}
                      returnKeyType="next"
                    />
                    <TouchableOpacity 
                      style={styles.eyeButton}
                      onPress={() => setShowCurrentPassword(!showCurrentPassword)}
                      activeOpacity={0.7}
                    >
                      <Ionicons 
                        name={showCurrentPassword ? "eye-outline" : "eye-off-outline"} 
                        size={20} 
                        color="#9CA3AF" 
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              {/* 新密碼 */}
              <View style={styles.inputSection}>
                <Text style={styles.inputLabel}>新密碼</Text>
                <View style={styles.inputWrapper}>
                  <View style={styles.inputIconContainer}>
                    <Ionicons name="lock-closed-outline" size={20} color="#9CA3AF" />
                  </View>
                  <TextInput
                    style={styles.textInput}
                    value={newPassword}
                    onChangeText={(text) => {
                      setNewPassword(text);
                      setError('');
                    }}
                    placeholder="請輸入新密碼"
                    placeholderTextColor="#9CA3AF"
                    secureTextEntry={!showNewPassword}
                    editable={!isLoading}
                    returnKeyType="next"
                  />
                  <TouchableOpacity 
                    style={styles.eyeButton}
                    onPress={() => setShowNewPassword(!showNewPassword)}
                    activeOpacity={0.7}
                  >
                    <Ionicons 
                      name={showNewPassword ? "eye-outline" : "eye-off-outline"} 
                      size={20} 
                      color="#9CA3AF" 
                    />
                  </TouchableOpacity>
                </View>

                {/* 密碼強度指示器 */}
                {newPassword.length > 0 && (
                  <View style={styles.strengthContainer}>
                    <View style={styles.strengthLabelRow}>
                      <Text style={styles.strengthLabel}>密碼強度：</Text>
                      <Text style={[styles.strengthValue, { color: passwordStrength.color }]}>
                        {passwordStrength.label}
                      </Text>
                    </View>
                    <View style={styles.strengthBars}>
                      {[1, 2, 3].map((level) => (
                        <View
                          key={level}
                          style={[
                            styles.strengthBar,
                            {
                              backgroundColor: level <= passwordStrength.strength 
                                ? passwordStrength.color 
                                : '#E5E7EB'
                            }
                          ]}
                        />
                      ))}
                    </View>
                  </View>
                )}
              </View>

              {/* 確認新密碼 */}
              <View style={styles.inputSection}>
                <Text style={styles.inputLabel}>確認新密碼</Text>
                <View style={styles.inputWrapper}>
                  <View style={styles.inputIconContainer}>
                    <Ionicons name="lock-closed-outline" size={20} color="#9CA3AF" />
                  </View>
                  <TextInput
                    style={styles.textInput}
                    value={confirmPassword}
                    onChangeText={(text) => {
                      setConfirmPassword(text);
                      setError('');
                    }}
                    placeholder="請再次輸入新密碼"
                    placeholderTextColor="#9CA3AF"
                    secureTextEntry={!showConfirmPassword}
                    editable={!isLoading}
                    returnKeyType="done"
                    onSubmitEditing={handleResetPassword}
                  />
                  <TouchableOpacity 
                    style={styles.eyeButton}
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    activeOpacity={0.7}
                  >
                    <Ionicons 
                      name={showConfirmPassword ? "eye-outline" : "eye-off-outline"} 
                      size={20} 
                      color="#9CA3AF" 
                    />
                  </TouchableOpacity>
                </View>
                {/* 密碼不相符提示 */}
                {confirmPassword.length > 0 && newPassword !== confirmPassword && (
                  <Text style={styles.mismatchText}>密碼不相符</Text>
                )}
                {/* 密碼相符提示 */}
                {confirmPassword.length > 0 && newPassword === confirmPassword && (
                  <View style={styles.matchContainer}>
                    <Ionicons name="checkmark-circle" size={16} color="#10B981" />
                    <Text style={styles.matchText}>密碼相符</Text>
                  </View>
                )}
              </View>

              {/* 密碼要求提示卡片 */}
              <View style={styles.requirementsCard}>
                <Text style={styles.requirementsTitle}>密碼要求：</Text>
                <View style={styles.requirementsList}>
                  <View style={styles.requirementItem}>
                    <Ionicons 
                      name={checkRequirement('length') ? "checkmark-circle" : "ellipse-outline"} 
                      size={16} 
                      color={checkRequirement('length') ? "#10B981" : "#9CA3AF"} 
                    />
                    <Text style={[
                      styles.requirementText,
                      checkRequirement('length') && styles.requirementTextActive
                    ]}>
                      至少 8 個字元
                    </Text>
                  </View>
                  <View style={styles.requirementItem}>
                    <Ionicons 
                      name={checkRequirement('uppercase') ? "checkmark-circle" : "ellipse-outline"} 
                      size={16} 
                      color={checkRequirement('uppercase') ? "#10B981" : "#9CA3AF"} 
                    />
                    <Text style={[
                      styles.requirementText,
                      checkRequirement('uppercase') && styles.requirementTextActive
                    ]}>
                      包含大寫字母 (A-Z)
                    </Text>
                  </View>
                  <View style={styles.requirementItem}>
                    <Ionicons 
                      name={checkRequirement('lowercase') ? "checkmark-circle" : "ellipse-outline"} 
                      size={16} 
                      color={checkRequirement('lowercase') ? "#10B981" : "#9CA3AF"} 
                    />
                    <Text style={[
                      styles.requirementText,
                      checkRequirement('lowercase') && styles.requirementTextActive
                    ]}>
                      包含小寫字母 (a-z)
                    </Text>
                  </View>
                  <View style={styles.requirementItem}>
                    <Ionicons 
                      name={checkRequirement('number') ? "checkmark-circle" : "ellipse-outline"} 
                      size={16} 
                      color={checkRequirement('number') ? "#10B981" : "#9CA3AF"} 
                    />
                    <Text style={[
                      styles.requirementText,
                      checkRequirement('number') && styles.requirementTextActive
                    ]}>
                      包含數字 (0-9)
                    </Text>
                  </View>
                  <View style={styles.requirementItem}>
                    <Ionicons 
                      name={checkRequirement('special') ? "checkmark-circle" : "ellipse-outline"} 
                      size={16} 
                      color={checkRequirement('special') ? "#10B981" : "#9CA3AF"} 
                    />
                    <Text style={[
                      styles.requirementText,
                      checkRequirement('special') && styles.requirementTextActive
                    ]}>
                      建議包含特殊符號 (@$!%*?&)
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>

      {/* 底部按鈕區域 */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity 
          style={styles.submitButtonContainer}
          onPress={handleResetPassword}
          disabled={isLoading || showSuccess}
          activeOpacity={0.9}
        >
          <LinearGradient
            colors={
              (isLoading || showSuccess || 
               (isFromSettings && !currentPassword) || 
               !newPassword || !confirmPassword)
                ? ['#D1D5DB', '#D1D5DB'] 
                : ['#166CB5', '#31C6FE']
            }
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.submitButton}
          >
            {isLoading ? (
              <View style={styles.loadingButtonContent}>
                <ActivityIndicator color="#FFFFFF" size="small" />
                <Text style={styles.submitButtonText}>變更中...</Text>
              </View>
            ) : showSuccess ? (
              <View style={styles.successButtonContent}>
                <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
                <Text style={styles.submitButtonText}>變更成功！</Text>
              </View>
            ) : (
              <Text style={styles.submitButtonText}>確認變更</Text>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },

  // 載入畫面
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 40,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  loadingIconCircle: {
    marginBottom: 20,
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '600',
  },

  // 錯誤畫面
  errorContainerGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  errorCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  errorIconCircle: {
    marginBottom: 20,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
  },
  errorText: {
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  errorButtonContainer: {
    width: '100%',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#166CB5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  errorButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  errorButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },

  // Header
  header: {
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
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
    marginBottom: 8,
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
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  headerPlaceholder: {
    width: 40,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    paddingHorizontal: 20,
  },

  keyboardAvoidingView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },

  // 錯誤訊息
  errorMessageContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    gap: 12,
  },
  errorMessageText: {
    flex: 1,
    fontSize: 14,
    color: '#991B1B',
    lineHeight: 20,
  },

  // 輸入區塊
  inputSection: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 16,
    overflow: 'hidden',
  },
  inputIconContainer: {
    paddingLeft: 16,
  },
  textInput: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 12,
    fontSize: 15,
    color: '#1F2937',
  },
  eyeButton: {
    padding: 12,
    paddingRight: 16,
  },

  // 密碼強度指示器
  strengthContainer: {
    marginTop: 10,
    paddingHorizontal: 4,
  },
  strengthLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  strengthLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  strengthValue: {
    fontSize: 12,
    fontWeight: '600',
  },
  strengthBars: {
    flexDirection: 'row',
    gap: 4,
  },
  strengthBar: {
    flex: 1,
    height: 6,
    borderRadius: 3,
  },

  // 密碼相符/不相符提示
  mismatchText: {
    fontSize: 12,
    color: '#EF4444',
    marginTop: 6,
    paddingHorizontal: 4,
  },
  matchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    paddingHorizontal: 4,
    gap: 4,
  },
  matchText: {
    fontSize: 12,
    color: '#10B981',
    fontWeight: '600',
  },

  // 密碼要求卡片
  requirementsCard: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    borderRadius: 16,
    padding: 16,
    marginTop: 8,
  },
  requirementsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E40AF',
    marginBottom: 12,
  },
  requirementsList: {
    gap: 8,
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  requirementText: {
    fontSize: 13,
    color: '#6B7280',
  },
  requirementTextActive: {
    color: '#10B981',
    fontWeight: '600',
  },

  // 底部按鈕區域
  bottomContainer: {
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  submitButtonContainer: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#166CB5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  submitButton: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  loadingButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  successButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
});

export default ResetPasswordScreen;