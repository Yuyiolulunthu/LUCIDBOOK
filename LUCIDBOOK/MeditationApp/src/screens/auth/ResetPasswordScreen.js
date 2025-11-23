// ==========================================
// 檔案名稱: ResetPasswordScreen.js
// 功能: 重設密碼頁面
// 🎨 統一設計風格 + 鎖頭圖標
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
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isValidating, setIsValidating] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);

  useEffect(() => {
    validateToken();
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
        Alert.alert(
          '令牌無效',
          '重設密碼連結已過期或無效。請重新申請。',
          [
            {
              text: '重新申請',
              onPress: () => navigation.navigate('ForgotPassword')
            },
            {
              text: '返回登入',
              onPress: () => navigation.navigate('Login')
            }
          ]
        );
      }
    } catch (error) {
      Alert.alert(
        '驗證失敗',
        error.message || '無法驗證重設令牌',
        [
          {
            text: '返回登入',
            onPress: () => navigation.navigate('Login')
          }
        ]
      );
    } finally {
      setIsValidating(false);
    }
  };

  const handleResetPassword = async () => {
    if (!newPassword || !confirmPassword) {
      Alert.alert('錯誤', '請輸入新密碼和確認密碼');
      return;
    }

    if (newPassword.length < 8) {
      Alert.alert('錯誤', '密碼長度至少需要 8 個字元');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('錯誤', '兩次輸入的密碼不一致');
      return;
    }

    const hasUpperCase = /[A-Z]/.test(newPassword);
    const hasLowerCase = /[a-z]/.test(newPassword);
    const hasNumber = /[0-9]/.test(newPassword);

    if (!hasUpperCase || !hasLowerCase || !hasNumber) {
      Alert.alert(
        '密碼強度不足',
        '密碼必須包含大寫字母、小寫字母和數字',
        [{ text: '我知道了' }]
      );
      return;
    }

    setIsLoading(true);
    try {
      const response = await ApiService.resetPassword(token, newPassword);
      
      if (response.success) {
        Alert.alert(
          '✅ 成功',
          '密碼已重設成功！請使用新密碼登入。',
          [
            {
              text: '前往登入',
              onPress: () => navigation.navigate('Login')
            }
          ]
        );
      }
    } catch (error) {
      Alert.alert(
        '重設失敗',
        error.message || '密碼重設失敗，請稍後再試'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const goToLogin = () => {
    if (navigation) {
      navigation.navigate('Login');
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

  // 令牌無效的畫面
  if (!tokenValid) {
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
      
      {/* ⭐ Header - 漸層藍色設計 */}
      <LinearGradient
        colors={['#166CB5', '#31C6FE']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <TouchableOpacity onPress={goToLogin} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>重設密碼</Text>
        <View style={styles.headerPlaceholder} />
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
              {/* ⭐ Logo 區域 - 使用鎖頭圖標 */}
              <View style={styles.logoContainer}>
                <View style={styles.logoCircle}>
                  <LinearGradient
                    colors={['#166CB5', '#31C6FE']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.logoGradient}
                  >
                    <Ionicons name="key-outline" size={48} color="#FFFFFF" />
                  </LinearGradient>
                </View>
                <Text style={styles.logoText}>設定新密碼</Text>
                <Text style={styles.logoSubtext}>請輸入您的新密碼</Text>
              </View>

              {/* 表單卡片 */}
              <View style={styles.formCard}>
                {/* 新密碼輸入 */}
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>新密碼</Text>
                  <View style={styles.inputWrapper}>
                    <Ionicons name="lock-closed-outline" size={20} color="#9CA3AF" style={styles.inputIcon} />
                    <TextInput
                      style={[styles.textInput, { flex: 1 }]}
                      value={newPassword}
                      onChangeText={setNewPassword}
                      placeholder="請輸入新密碼（至少 8 個字元）"
                      placeholderTextColor="#9CA3AF"
                      secureTextEntry={!showNewPassword}
                      editable={!isLoading}
                      returnKeyType="next"
                    />
                    <TouchableOpacity 
                      style={styles.eyeButton}
                      onPress={() => setShowNewPassword(!showNewPassword)}
                    >
                      <Ionicons 
                        name={showNewPassword ? "eye-outline" : "eye-off-outline"} 
                        size={20} 
                        color="#9CA3AF" 
                      />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* 確認密碼輸入 */}
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>確認新密碼</Text>
                  <View style={styles.inputWrapper}>
                    <Ionicons name="lock-closed-outline" size={20} color="#9CA3AF" style={styles.inputIcon} />
                    <TextInput
                      style={[styles.textInput, { flex: 1 }]}
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
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
                    >
                      <Ionicons 
                        name={showConfirmPassword ? "eye-outline" : "eye-off-outline"} 
                        size={20} 
                        color="#9CA3AF" 
                      />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* 密碼強度提示 */}
                <View style={styles.requirementsContainer}>
                  <View style={styles.requirementsHeader}>
                    <Ionicons name="shield-checkmark" size={18} color="#166CB5" />
                    <Text style={styles.requirementsTitle}>密碼要求</Text>
                  </View>
                  <View style={styles.requirementsList}>
                    <View style={styles.requirementItem}>
                      <Ionicons name="checkmark-circle" size={16} color="#10B981" />
                      <Text style={styles.requirementText}>至少 8 個字元</Text>
                    </View>
                    <View style={styles.requirementItem}>
                      <Ionicons name="checkmark-circle" size={16} color="#10B981" />
                      <Text style={styles.requirementText}>包含大寫字母 (A-Z)</Text>
                    </View>
                    <View style={styles.requirementItem}>
                      <Ionicons name="checkmark-circle" size={16} color="#10B981" />
                      <Text style={styles.requirementText}>包含小寫字母 (a-z)</Text>
                    </View>
                    <View style={styles.requirementItem}>
                      <Ionicons name="checkmark-circle" size={16} color="#10B981" />
                      <Text style={styles.requirementText}>包含數字 (0-9)</Text>
                    </View>
                  </View>
                </View>

                {/* 重設按鈕 */}
                <TouchableOpacity 
                  style={styles.resetButtonContainer}
                  onPress={handleResetPassword}
                  disabled={isLoading}
                  activeOpacity={0.9}
                >
                  <LinearGradient
                    colors={isLoading ? ['#9CA3AF', '#9CA3AF'] : ['#166CB5', '#31C6FE']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.resetButton}
                  >
                    {isLoading ? (
                      <ActivityIndicator color="white" />
                    ) : (
                      <>
                        <Text style={styles.resetButtonText}>重設密碼</Text>
                        <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
                      </>
                    )}
                  </LinearGradient>
                </TouchableOpacity>

                {/* 提示訊息 */}
                <View style={styles.infoBox}>
                  <Ionicons name="information-circle" size={20} color="#166CB5" />
                  <Text style={styles.infoText}>
                    重設密碼後，請使用新密碼登入您的帳戶。
                  </Text>
                </View>
              </View>
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
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
    borderRadius: 12,
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
    paddingVertical: 14,
    gap: 8,
  },
  errorButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
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

  keyboardAvoidingView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    flexGrow: 1,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },

  // ⭐ Logo 區域 - 鑰匙圖標設計
  logoContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 50,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: '#166CB5',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  logoGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  logoSubtext: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },

  // 表單卡片
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 4,
  },

  // 輸入框
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 16,
  },
  inputIcon: {
    marginRight: 12,
  },
  textInput: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 15,
    color: '#1F2937',
  },
  eyeButton: {
    padding: 8,
  },

  // 密碼要求
  requirementsContainer: {
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  requirementsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  requirementsTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#166CB5',
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
    color: '#1E40AF',
  },

  // 重設按鈕
  resetButtonContainer: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 20,
    shadowColor: '#166CB5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  resetButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },

  // 提示訊息
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    padding: 14,
    gap: 12,
    alignItems: 'flex-start',
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: '#1E40AF',
    lineHeight: 20,
  },
});

export default ResetPasswordScreen;