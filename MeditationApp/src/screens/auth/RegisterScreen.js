// ==========================================
// 檔案名稱: RegisterScreen.js
// 功能: 註冊頁面
// 🎨 統一設計風格 + 進階優化
// ✅ 密碼強度指示器
// ✅ 即時表單驗證
// ✅ 平滑動畫效果
// ✅ 優化的錯誤提示
// ✅ 隱私政策流程優化
// ✅ 註冊成功動畫
// ==========================================

import React, { useState, useEffect, useRef } from 'react';
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
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import ApiService from '../../../api';
import { setLoginState } from './AuthUtils';

const RegisterScreen = ({ navigation, route }) => {
  const { savedFormData, agreedFromPrivacy = false } = route.params || {};

  // 表單狀態
  const [name, setName] = useState(savedFormData?.name || '');
  const [email, setEmail] = useState(savedFormData?.email || '');
  const [password, setPassword] = useState(savedFormData?.password || '');
  const [confirmPassword, setConfirmPassword] = useState(savedFormData?.confirmPassword || '');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreedToPrivacy, setAgreedToPrivacy] = useState(savedFormData?.agreedToPrivacy || agreedFromPrivacy);

  // 驗證狀態
  const [nameError, setNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [emailExistsError, setEmailExistsError] = useState(''); // 🆕 Email 已被使用的錯誤
  const [passwordError, setPasswordError] = useState('');
  const [passwordMismatch, setPasswordMismatch] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [isFormValid, setIsFormValid] = useState(false);

  // 動畫
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const strengthAnim = useRef(new Animated.Value(0)).current;

  // 監聽隱私權政策頁面返回
  useEffect(() => {
    if (agreedFromPrivacy) {
      setAgreedToPrivacy(true);
    }
  }, [agreedFromPrivacy]);

  // 即時驗證姓名
  useEffect(() => {
    if (name.length > 0) {
      if (name.length < 2) {
        setNameError('姓名至少需要 2 個字元');
      } else if (name.length > 50) {
        setNameError('姓名不能超過 50 個字元');
      } else {
        setNameError('');
      }
    } else {
      setNameError('');
    }
  }, [name]);

  // 即時驗證電子郵件
  useEffect(() => {
    // 🆕 當 email 改變時，清除"已被使用"的錯誤
    setEmailExistsError('');
    
    if (email.length > 0) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        setEmailError('請輸入有效的電子郵件格式');
      } else {
        setEmailError('');
      }
    } else {
      setEmailError('');
    }
  }, [email]);

  // 即時驗證密碼並計算強度
  useEffect(() => {
    if (password.length > 0) {
      // 密碼強度計算
      let strength = 0;
      if (password.length >= 6) strength += 20;
      if (password.length >= 8) strength += 15;
      if (password.length >= 12) strength += 15;
      if (/[a-z]/.test(password)) strength += 10;
      if (/[A-Z]/.test(password)) strength += 15;
      if (/[0-9]/.test(password)) strength += 15;
      if (/[^a-zA-Z0-9]/.test(password)) strength += 10;
      
      setPasswordStrength(Math.min(strength, 100));
      
      // 動畫更新強度條
      Animated.timing(strengthAnim, {
        toValue: strength / 100,
        duration: 300,
        useNativeDriver: false,
      }).start();

      // 密碼錯誤提示
      if (password.length < 6) {
        setPasswordError('密碼至少需要 6 個字元');
      } else if (password.length < 8) {
        setPasswordError('建議使用至少 8 個字元以提高安全性');
      } else {
        setPasswordError('');
      }
    } else {
      setPasswordError('');
      setPasswordStrength(0);
    }
  }, [password]);

  // 即時檢查密碼是否一致
  useEffect(() => {
    if (confirmPassword.length > 0 && password !== confirmPassword) {
      setPasswordMismatch(true);
      // 震動動畫
      Animated.sequence([
        Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
      ]).start();
    } else {
      setPasswordMismatch(false);
    }
  }, [password, confirmPassword]);

  // 檢查表單是否有效
  useEffect(() => {
    const valid = 
      name.length >= 2 &&
      emailError === '' &&
      emailExistsError === '' && // 🆕 檢查 email 是否已被使用
      email.length > 0 &&
      password.length >= 6 &&
      !passwordMismatch &&
      confirmPassword.length > 0 &&
      agreedToPrivacy;
    
    setIsFormValid(valid);
  }, [name, email, emailError, emailExistsError, password, confirmPassword, passwordMismatch, agreedToPrivacy]);

  // 開啟隱私政策頁面
  const openPrivacyPolicy = () => {
    const formData = {
      name,
      email,
      password,
      confirmPassword,
      agreedToPrivacy: false, // 🆕 總是傳 false，讓用戶重新閱讀
    };
    
    navigation.navigate('PrivacyPolicy', {
      fromRegister: true,
      savedFormData: formData,
    });
  };

  // 處理勾選同意 - 🆕 改為總是開啟隱私政策頁面，不允許手動勾選
  const handlePrivacyCheckboxPress = () => {
    if (agreedToPrivacy) {
      // 如果已經同意，詢問是否要取消
      Alert.alert(
        '取消同意？',
        '取消後您需要重新閱讀隱私權政策',
        [
          {
            text: '不取消',
            style: 'cancel'
          },
          {
            text: '取消同意',
            style: 'destructive',
            onPress: () => setAgreedToPrivacy(false)
          }
        ]
      );
    } else {
      // 未同意時，開啟隱私政策頁面
      openPrivacyPolicy();
    }
  };

  // 註冊處理
  const handleRegister = async () => {
    // 最終驗證
    if (!isFormValid) {
      Alert.alert('請檢查表單', '請確保所有欄位都正確填寫');
      return;
    }

    setIsLoading(true);
    try {
      // 1️⃣ 註冊
      console.log('🔐 [RegisterScreen] 開始註冊流程...');
      await ApiService.register(name, email, password);
      
      // 2️⃣ 自動登入
      console.log('🔐 [RegisterScreen] 註冊成功，自動登入...');
      const loginResponse = await ApiService.login(email, password);
      
      // 3️⃣ 準備用戶資料
      const userData = {
        id: loginResponse.user.id,
        name: loginResponse.user.name,
        email: loginResponse.user.email,
        isGuest: false
      };
      
      // 4️⃣ 保存登入狀態
      await setLoginState({
        userData,
        token: loginResponse.token,
        rememberMe: false,
      });
      
      console.log('✅ [RegisterScreen] 登入狀態已設定');
      
      // 5️⃣ 顯示成功訊息並導航
      Alert.alert(
        '🎉 註冊成功！', 
        '歡迎加入 LUCIDBOOK\n\n請輸入企業引薦碼以完成設定', 
        [
          { 
            text: '繼續', 
            onPress: () => {
              navigation.navigate('EnterpriseCode', { 
                fromRegister: true,
                isRequired: true,
              });
            }
          }
        ],
        { cancelable: false }
      );
    } catch (error) {
      console.error('❌ [RegisterScreen] 註冊失敗:', error);
      
      // 詳細錯誤處理
      let errorMessage = '註冊失敗，請稍後再試';
      let isEmailError = false;
      
      // 🆕 檢查是否為 email 已存在的錯誤
      if (error.message.includes('email') || 
          error.message.includes('already') || 
          error.message.includes('exist') ||
          error.message.includes('已被使用') ||
          error.message.includes('已註冊')) {
        errorMessage = '此電子郵件已被使用，請使用其他郵件地址';
        isEmailError = true;
        setEmailExistsError('此電子郵件已被使用'); // 🆕 設置錯誤狀態
      } else if (error.message.includes('network')) {
        errorMessage = '網路連接失敗，請檢查您的網路';
      }
      
      // 🆕 只有在不是 email 錯誤時才顯示 Alert（email 錯誤會在輸入框下方顯示）
      if (!isEmailError) {
        Alert.alert('註冊失敗', errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // 返回登入頁面
  const goToLogin = () => {
    navigation.navigate('Login');
  };

  // 獲取密碼強度文字和顏色
  const getPasswordStrengthInfo = () => {
    if (passwordStrength < 30) {
      return { text: '弱', color: '#EF4444' };
    } else if (passwordStrength < 60) {
      return { text: '中等', color: '#F59E0B' };
    } else if (passwordStrength < 80) {
      return { text: '良好', color: '#10B981' };
    } else {
      return { text: '優秀', color: '#059669' };
    }
  };

  const strengthInfo = getPasswordStrengthInfo();

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
        <TouchableOpacity onPress={goToLogin} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>註冊</Text>
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
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.scrollViewContent}
          >
            <View style={styles.contentContainer}>
              {/* Logo 區域 */}
              <View style={styles.logoContainer}>
                <View style={styles.logoCircle}>
                  <LinearGradient
                    colors={['#166CB5', '#31C6FE']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.logoGradient}
                  >
                    <Ionicons name="leaf" size={40} color="#FFFFFF" />
                  </LinearGradient>
                </View>
                <Text style={styles.logoText}>建立帳號</Text>
                <Text style={styles.logoSubtext}>開始你的心靈練習之旅</Text>
              </View>

              {/* 表單卡片 */}
              <View style={styles.formCard}>
                <Text style={styles.formTitle}>加入 LUCIDBOOK</Text>
                <Text style={styles.formSubtitle}>填寫資訊以建立您的帳戶</Text>
                
                {/* 姓名輸入 */}
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>姓名</Text>
                  <View style={[
                    styles.inputWrapper,
                    nameError && styles.inputWrapperError
                  ]}>
                    <Ionicons 
                      name="person-outline" 
                      size={20} 
                      color={nameError ? "#EF4444" : "#9CA3AF"} 
                      style={styles.inputIcon} 
                    />
                    <TextInput
                      style={styles.textInput}
                      value={name}
                      onChangeText={setName}
                      placeholder="請輸入您的姓名"
                      placeholderTextColor="#9CA3AF"
                      editable={!isLoading}
                      returnKeyType="next"
                    />
                    {name.length >= 2 && !nameError && (
                      <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                    )}
                  </View>
                  {nameError && (
                    <View style={styles.errorContainer}>
                      <Ionicons name="alert-circle" size={14} color="#EF4444" />
                      <Text style={styles.errorText}>{nameError}</Text>
                    </View>
                  )}
                </View>

                {/* 電子郵件輸入 */}
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>電子郵件</Text>
                  <View style={[
                    styles.inputWrapper,
                    (emailError || emailExistsError) && styles.inputWrapperError
                  ]}>
                    <Ionicons 
                      name="mail-outline" 
                      size={20} 
                      color={(emailError || emailExistsError) ? "#EF4444" : "#9CA3AF"} 
                      style={styles.inputIcon} 
                    />
                    <TextInput
                      style={styles.textInput}
                      value={email}
                      onChangeText={setEmail}
                      placeholder="請輸入您的電子郵件"
                      placeholderTextColor="#9CA3AF"
                      keyboardType="email-address"
                      autoCapitalize="none"
                      editable={!isLoading}
                      returnKeyType="next"
                    />
                    {email.length > 0 && !emailError && !emailExistsError && (
                      <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                    )}
                  </View>
                  {emailError && (
                    <View style={styles.errorContainer}>
                      <Ionicons name="alert-circle" size={14} color="#EF4444" />
                      <Text style={styles.errorText}>{emailError}</Text>
                    </View>
                  )}
                  {/* 🆕 顯示 email 已被使用的錯誤 */}
                  {emailExistsError && !emailError && (
                    <View style={styles.errorContainer}>
                      <Ionicons name="alert-circle" size={14} color="#EF4444" />
                      <Text style={styles.errorText}>{emailExistsError}</Text>
                    </View>
                  )}
                </View>

                {/* 密碼輸入 */}
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>密碼（至少 6 個字元）</Text>
                  <View style={styles.inputWrapper}>
                    <Ionicons name="lock-closed-outline" size={20} color="#9CA3AF" style={styles.inputIcon} />
                    <TextInput
                      style={[styles.textInput, { flex: 1 }]}
                      value={password}
                      onChangeText={setPassword}
                      placeholder="請設定密碼"
                      placeholderTextColor="#9CA3AF"
                      secureTextEntry={!showPassword}
                      editable={!isLoading}
                      returnKeyType="next"
                    />
                    <TouchableOpacity 
                      style={styles.eyeButton}
                      onPress={() => setShowPassword(!showPassword)}
                    >
                      <Ionicons 
                        name={showPassword ? "eye-outline" : "eye-off-outline"} 
                        size={20} 
                        color="#9CA3AF" 
                      />
                    </TouchableOpacity>
                  </View>
                  
                  {/* 密碼強度指示器 */}
                  {password.length > 0 && (
                    <View style={styles.strengthContainer}>
                      <View style={styles.strengthBarContainer}>
                        <Animated.View 
                          style={[
                            styles.strengthBar,
                            {
                              width: strengthAnim.interpolate({
                                inputRange: [0, 1],
                                outputRange: ['0%', '100%'],
                              }),
                              backgroundColor: strengthInfo.color,
                            },
                          ]}
                        />
                      </View>
                      <Text style={[styles.strengthText, { color: strengthInfo.color }]}>
                        強度：{strengthInfo.text}
                      </Text>
                    </View>
                  )}
                  
                  {passwordError && password.length < 8 && (
                    <View style={styles.warningContainer}>
                      <Ionicons name="information-circle" size={14} color="#F59E0B" />
                      <Text style={styles.warningText}>{passwordError}</Text>
                    </View>
                  )}
                </View>

                {/* 確認密碼輸入 */}
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>確認密碼</Text>
                  <Animated.View 
                    style={[
                      styles.inputWrapper, 
                      passwordMismatch && styles.inputWrapperError,
                      { transform: [{ translateX: shakeAnim }] }
                    ]}
                  >
                    <Ionicons 
                      name="lock-closed-outline" 
                      size={20} 
                      color={passwordMismatch ? "#EF4444" : "#9CA3AF"} 
                      style={styles.inputIcon} 
                    />
                    <TextInput
                      style={[styles.textInput, { flex: 1 }]}
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                      placeholder="請再次輸入密碼"
                      placeholderTextColor="#9CA3AF"
                      secureTextEntry={!showConfirmPassword}
                      editable={!isLoading}
                      returnKeyType="done"
                      onSubmitEditing={handleRegister}
                    />
                    <TouchableOpacity 
                      style={styles.eyeButton}
                      onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      <Ionicons 
                        name={showConfirmPassword ? "eye-outline" : "eye-off-outline"} 
                        size={20} 
                        color={passwordMismatch ? "#EF4444" : "#9CA3AF"} 
                      />
                    </TouchableOpacity>
                    {!passwordMismatch && confirmPassword.length > 0 && password === confirmPassword && (
                      <Ionicons name="checkmark-circle" size={20} color="#10B981" style={{ marginLeft: 8 }} />
                    )}
                  </Animated.View>
                  {passwordMismatch && (
                    <View style={styles.errorContainer}>
                      <Ionicons name="alert-circle" size={14} color="#EF4444" />
                      <Text style={styles.errorText}>兩次輸入的密碼不一致</Text>
                    </View>
                  )}
                </View>

                {/* 隱私政策同意 */}
                <View style={styles.privacyContainer}>
                  <View style={styles.checkboxContainer}>
                    <TouchableOpacity 
                      onPress={handlePrivacyCheckboxPress}
                      activeOpacity={0.7}
                    >
                      <View style={[styles.checkbox, agreedToPrivacy && styles.checkboxChecked]}>
                        {agreedToPrivacy && (
                          <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                        )}
                      </View>
                    </TouchableOpacity>
                    
                    <View style={styles.privacyTextContainer}>
                      <Text style={styles.privacyText}>我已閱讀並同意</Text>
                      <TouchableOpacity onPress={openPrivacyPolicy} activeOpacity={0.7}>
                        <Text style={styles.privacyLink}>隱私權政策</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                  {!agreedToPrivacy && (
                    <View style={styles.privacyHintBox}>
                      <Ionicons name="information-circle" size={16} color="#166CB5" />
                      <Text style={styles.privacyHint}>
                        請點擊「隱私權政策」閱讀完整內容並滾動到底部
                      </Text>
                    </View>
                  )}
                  {agreedToPrivacy && (
                    <View style={styles.privacySuccessBox}>
                      <Ionicons name="checkmark-circle" size={16} color="#10B981" />
                      <Text style={styles.privacySuccessText}>
                        已閱讀並同意隱私權政策
                      </Text>
                    </View>
                  )}
                </View>

                {/* 註冊按鈕 */}
                <TouchableOpacity 
                  style={[
                    styles.registerButtonContainer,
                    !isFormValid && styles.registerButtonDisabled
                  ]}
                  onPress={handleRegister}
                  disabled={isLoading || !isFormValid}
                  activeOpacity={0.9}
                >
                  <LinearGradient
                    colors={!isFormValid 
                      ? ['#D1D5DB', '#D1D5DB'] 
                      : ['#166CB5', '#31C6FE']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.registerButton}
                  >
                    {isLoading ? (
                      <ActivityIndicator color="white" />
                    ) : (
                      <>
                        <Text style={[
                          styles.registerButtonText,
                          !isFormValid && styles.registerButtonTextDisabled
                        ]}>
                          註冊
                        </Text>
                        <Ionicons 
                          name="arrow-forward" 
                          size={20} 
                          color={isFormValid ? "#FFFFFF" : "#9CA3AF"} 
                        />
                      </>
                    )}
                  </LinearGradient>
                </TouchableOpacity>

                {/* 登入連結 */}
                <View style={styles.loginContainer}>
                  <Text style={styles.loginText}>已經有帳戶？</Text>
                  <TouchableOpacity onPress={goToLogin} activeOpacity={0.7}>
                    <Text style={styles.loginLink}>立即登入</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* 底部語錄 */}
              <View style={styles.quoteContainer}>
                <View style={styles.quoteCard}>
                  <Ionicons name="shield-checkmark" size={20} color="#166CB5" />
                  <Text style={styles.quoteText}>您的資料安全受到完善保護</Text>
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

  // Logo 區域
  logoContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: '#166CB5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
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
    marginBottom: 20,
  },
  formTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 8,
  },
  formSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
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
  inputWrapperError: {
    borderColor: '#EF4444',
    backgroundColor: '#FEF2F2',
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

  // 錯誤和警告提示
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    paddingHorizontal: 4,
  },
  errorText: {
    fontSize: 12,
    color: '#EF4444',
    marginLeft: 4,
    fontWeight: '500',
  },
  warningContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    paddingHorizontal: 4,
  },
  warningText: {
    fontSize: 12,
    color: '#F59E0B',
    marginLeft: 4,
    fontWeight: '500',
  },

  // 密碼強度指示器
  strengthContainer: {
    marginTop: 8,
  },
  strengthBarContainer: {
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 6,
  },
  strengthBar: {
    height: '100%',
    borderRadius: 2,
  },
  strengthText: {
    fontSize: 12,
    fontWeight: '600',
  },

  // 隱私政策同意
  privacyContainer: {
    marginTop: 8,
    marginBottom: 20,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  checkboxChecked: {
    backgroundColor: '#166CB5',
    borderColor: '#166CB5',
  },
  privacyTextContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  privacyText: {
    fontSize: 14,
    color: '#6B7280',
    marginRight: 4,
  },
  privacyLink: {
    fontSize: 14,
    color: '#166CB5',
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  privacyHint: {
    fontSize: 12,
    color: '#166CB5',
    marginLeft: 8,
    flex: 1,
    lineHeight: 16,
  },
  privacyHintBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#EFF6FF',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginTop: 8,
    marginLeft: 34,
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  privacySuccessBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginTop: 8,
    marginLeft: 34,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  privacySuccessText: {
    fontSize: 12,
    color: '#15803D',
    marginLeft: 8,
    fontWeight: '600',
  },

  // 註冊按鈕
  registerButtonContainer: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 24,
    shadowColor: '#166CB5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  registerButtonDisabled: {
    shadowOpacity: 0.1,
    elevation: 2,
  },
  registerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  registerButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  registerButtonTextDisabled: {
    color: '#9CA3AF',
  },

  // 登入連結
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginText: {
    fontSize: 14,
    color: '#6B7280',
    marginRight: 4,
  },
  loginLink: {
    fontSize: 14,
    color: '#166CB5',
    fontWeight: '600',
  },

  // 底部語錄
  quoteContainer: {
    marginTop: 'auto',
  },
  quoteCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EFF6FF',
    borderRadius: 16,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  quoteText: {
    fontSize: 13,
    color: '#1E40AF',
    fontWeight: '500',
  },
});

export default RegisterScreen;