// ==========================================
// 檔案名稱: ResetPasswordScreen.js
// 功能: 重設密碼頁面
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
import ApiService from './api';

const ResetPasswordScreen = ({ navigation, route }) => {
  const [token, setToken] = useState(route?.params?.token || '');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isValidating, setIsValidating] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);

  // 驗證令牌
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
      // 驗證令牌是否有效
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
    // 驗證輸入
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

    // 密碼強度檢查
    const hasUpperCase = /[A-Z]/.test(newPassword);
    const hasLowerCase = /[a-z]/.test(newPassword);
    const hasNumber = /[0-9]/.test(newPassword);

    if (!hasUpperCase || !hasLowerCase || !hasNumber) {
      Alert.alert(
        '密碼強度不足',
        '密碼必須包含大寫字母、小寫字母和數字',
        [
          { text: '我知道了' }
        ]
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
        <StatusBar barStyle="light-content" backgroundColor="rgba(22, 109, 181, 0.95)" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="rgba(22, 109, 181, 0.95)" />
          <Text style={styles.loadingText}>驗證重設令牌...</Text>
        </View>
      </View>
    );
  }

  // 令牌無效的畫面
  if (!tokenValid) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="rgba(22, 109, 181, 0.95)" />
        <View style={styles.errorContainer}>
          <Text style={styles.errorIcon}>⚠️</Text>
          <Text style={styles.errorTitle}>令牌無效</Text>
          <Text style={styles.errorText}>
            重設密碼連結已過期或無效
          </Text>
          <TouchableOpacity 
            style={styles.errorButton}
            onPress={() => navigation.navigate('ForgotPassword')}
          >
            <Text style={styles.errorButtonText}>重新申請</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // 重設密碼表單
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="rgba(22, 109, 181, 0.95)" />
      
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={goToLogin} style={styles.backButton}>
          <Text style={styles.backButtonText}>← 返回登入</Text>
        </TouchableOpacity>
      </View>

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
              <View style={styles.iconContainer}>
                <Text style={styles.iconText}>🔑</Text>
              </View>

              <Text style={styles.title}>重設密碼</Text>
              <Text style={styles.subtitle}>
                請輸入您的新密碼
              </Text>

              <View style={styles.formContainer}>
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>新密碼</Text>
                  <View style={styles.passwordContainer}>
                    <TextInput
                      style={styles.passwordInput}
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
                      <Text style={styles.eyeIcon}>
                        {showNewPassword ? '👁️' : '🙈'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>確認新密碼</Text>
                  <View style={styles.passwordContainer}>
                    <TextInput
                      style={styles.passwordInput}
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
                      <Text style={styles.eyeIcon}>
                        {showConfirmPassword ? '👁️' : '🙈'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* 密碼強度提示 */}
                <View style={styles.requirementsContainer}>
                  <Text style={styles.requirementsTitle}>密碼要求：</Text>
                  <View style={styles.requirementItem}>
                    <Text style={styles.requirementBullet}>•</Text>
                    <Text style={styles.requirementText}>
                      至少 8 個字元
                    </Text>
                  </View>
                  <View style={styles.requirementItem}>
                    <Text style={styles.requirementBullet}>•</Text>
                    <Text style={styles.requirementText}>
                      包含大寫字母 (A-Z)
                    </Text>
                  </View>
                  <View style={styles.requirementItem}>
                    <Text style={styles.requirementBullet}>•</Text>
                    <Text style={styles.requirementText}>
                      包含小寫字母 (a-z)
                    </Text>
                  </View>
                  <View style={styles.requirementItem}>
                    <Text style={styles.requirementBullet}>•</Text>
                    <Text style={styles.requirementText}>
                      包含數字 (0-9)
                    </Text>
                  </View>
                </View>

                <TouchableOpacity 
                  style={[
                    styles.resetButton, 
                    isLoading && styles.resetButtonDisabled
                  ]}
                  onPress={handleResetPassword}
                  disabled={isLoading}
                  activeOpacity={0.8}
                >
                  {isLoading ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <Text style={styles.resetButtonText}>重設密碼</Text>
                  )}
                </TouchableOpacity>

                <View style={styles.infoBox}>
                  <Text style={styles.infoIcon}>ℹ️</Text>
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
    backgroundColor: '#F9FAFB',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  errorIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  errorText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  errorButton: {
    backgroundColor: 'rgba(22, 109, 181, 0.95)',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 32,
  },
  errorButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  headerContainer: {
    backgroundColor: 'rgba(22, 109, 181, 0.95)',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 8,
  },
  backButton: {
    alignSelf: 'flex-start',
    paddingVertical: 8,
  },
  backButtonText: {
    fontSize: 16,
    color: 'white',
    fontWeight: '500',
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
    paddingHorizontal: 16,
    paddingTop: 40,
    paddingBottom: 40,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  iconText: {
    fontSize: 64,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 32,
  },
  formContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    backgroundColor: '#F9FAFB',
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#111827',
  },
  eyeButton: {
    padding: 12,
  },
  eyeIcon: {
    fontSize: 20,
  },
  requirementsContainer: {
    backgroundColor: '#EFF6FF',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
  },
  requirementsTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1E40AF',
    marginBottom: 8,
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  requirementBullet: {
    fontSize: 14,
    color: '#3B82F6',
    marginRight: 8,
  },
  requirementText: {
    fontSize: 13,
    color: '#1E40AF',
  },
  resetButton: {
    backgroundColor: 'rgba(22, 109, 181, 0.95)',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 20,
  },
  resetButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  resetButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    padding: 12,
  },
  infoIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 18,
  },
});

export default ResetPasswordScreen;