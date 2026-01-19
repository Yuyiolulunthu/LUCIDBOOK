// ==========================================
// 檔案名稱: LoginScreen.js
// 功能: 登入頁面
// 🎨 統一設計風格 + 進階優化
// ✅ 生物識別登入（指紋/Face ID）
// ✅ 登入失敗次數限制
// ✅ 改善的錯誤處理
// ✅ 表單即時驗證
// ✅ 平滑動畫效果
// ✅ 優化的記住我功能
// ✅ 社交登入預留接口
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
import { CommonActions } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import ApiService from '../../../api';
import { setLoginState, getRememberedEmail } from './AuthUtils';
import {
  checkBiometricAvailability,
  getBiometricTypeText,
  getBiometricTypeIcon,
  performBiometricLogin,
  setupBiometric,
  isBiometricEnabled,
} from './BiometricUtils';

const LoginScreen = ({ navigation, route }) => {
  const { onLoginSuccess: parentOnLoginSuccess, canGoBack = false } = route.params || {};
  
  // 表單狀態
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  
  // 驗證狀態
  const [emailError, setEmailError] = useState('');
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [lockoutEndTime, setLockoutEndTime] = useState(null);
  const [isFormValid, setIsFormValid] = useState(false);
  
  // 生物識別
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [biometricType, setBiometricType] = useState('');
  const [savedCredentials, setSavedCredentials] = useState(null);
  
  // 動畫
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const lockTimerRef = useRef(null);

  // 載入記住的帳號和檢查生物識別
  useEffect(() => {
    initializeScreen();
    
    return () => {
      if (lockTimerRef.current) {
        clearInterval(lockTimerRef.current);
      }
    };
  }, []);

  // 初始化畫面
  const initializeScreen = async () => {
    await loadRememberedEmail();
    await checkBiometricStatus();
    
    // 淡入動畫
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  };

  // 載入記住的帳號
  const loadRememberedEmail = async () => {
    try {
      const rememberedEmail = await getRememberedEmail();
      if (rememberedEmail) {
        setEmail(rememberedEmail);
        setRememberMe(true);
      }
    } catch (error) {
      console.error('載入記住的帳號失敗:', error);
    }
  };

  // 檢查生物識別狀態
  const checkBiometricStatus = async () => {
    try {
      // 檢查是否可用
      const availability = await checkBiometricAvailability();
      
      if (availability.available) {
        // 檢查是否已啟用
        const enabled = await isBiometricEnabled();
        
        if (enabled) {
          setBiometricAvailable(true);
          setBiometricType(availability.type);
          console.log('✅ 生物識別已啟用:', availability.type);
        }
      }
    } catch (error) {
      console.error('檢查生物識別狀態失敗:', error);
    }
  };

  // 即時驗證電子郵件
  useEffect(() => {
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

  // 檢查表單是否有效
  useEffect(() => {
    const valid = 
      email.length > 0 &&
      emailError === '' &&
      password.length >= 6 &&
      !isLocked;
    
    setIsFormValid(valid);
  }, [email, emailError, password, isLocked]);

  // 鎖定倒計時
  useEffect(() => {
    if (isLocked && lockoutEndTime) {
      lockTimerRef.current = setInterval(() => {
        const now = Date.now();
        if (now >= lockoutEndTime) {
          setIsLocked(false);
          setLockoutEndTime(null);
          setLoginAttempts(0);
          if (lockTimerRef.current) {
            clearInterval(lockTimerRef.current);
          }
        }
      }, 1000);
    }
    
    return () => {
      if (lockTimerRef.current) {
        clearInterval(lockTimerRef.current);
      }
    };
  }, [isLocked, lockoutEndTime]);

  // 生物識別登入
  const handleBiometricLogin = async () => {
    setIsLoading(true);
    try {
      console.log('🔐 [LoginScreen] 開始生物識別登入...');
      
      // 執行生物識別登入流程
      const result = await performBiometricLogin();
      
      if (!result.success) {
        if (result.reason === 'not_enabled') {
          Alert.alert(
            '尚未設定',
            '您尚未設定生物識別登入\n請先使用密碼登入後啟用此功能',
            [{ text: '了解' }]
          );
        } else {
          Alert.alert('登入失敗', result.message || '生物識別驗證失敗');
        }
        setIsLoading(false);
        return;
      }
      
      // 使用取得的憑證登入
      console.log('✅ [LoginScreen] 生物識別驗證成功，執行登入...');
      const response = await ApiService.login(result.email, result.password);
      
      const userData = {
        id: response.user.id,
        name: response.user.name,
        email: response.user.email,
        isGuest: false
      };

      await setLoginState({
        userData,
        token: response.token,
        rememberMe: true, // 生物識別登入預設記住
      });
      
      console.log('✅ [LoginScreen] 生物識別登入成功');
      
      // 檢查企業引薦碼並導航
      await checkEnterpriseCodeAndNavigate(userData);
      
    } catch (error) {
      console.error('❌ [LoginScreen] 生物識別登入失敗:', error);
      Alert.alert('登入失敗', '無法完成登入，請使用密碼登入');
    } finally {
      setIsLoading(false);
    }
  };

  // 檢查企業引薦碼並導航
  const checkEnterpriseCodeAndNavigate = async (userData) => {
    console.log('🔍 [LoginScreen] 檢查企業引薦碼狀態...');
    
    let hasEnterpriseCode = false;
    try {
      const userProfile = await ApiService.getUserProfile();
      hasEnterpriseCode = !!userProfile.user.enterprise_code;
      
      console.log('📋 [LoginScreen] 企業引薦碼狀態:', {
        hasCode: hasEnterpriseCode,
        codeValue: userProfile.user.enterprise_code,
      });
    } catch (error) {
      console.error('❌ [LoginScreen] 獲取用戶資料失敗:', error);
      hasEnterpriseCode = false;
    }
    
    // 根據是否有企業引薦碼決定流程
    if (hasEnterpriseCode) {
      console.log('✅ [LoginScreen] 用戶已有企業引薦碼，直接登入');
      
      if (parentOnLoginSuccess) {
        parentOnLoginSuccess(userData);
      }
      
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: 'MainTabs' }],
        })
      );
    } else {
      console.log('📝 [LoginScreen] 用戶尚未設定企業引薦碼，導航到引薦碼頁面');
      
      if (parentOnLoginSuccess) {
        parentOnLoginSuccess(userData);
      }
      
      navigation.navigate('EnterpriseCode', { 
        fromLogin: true,
        isRequired: true,
      });
    }
  };

  // 詢問用戶是否要啟用生物識別
  const promptBiometricSetup = async (email, password) => {
    try {
      // 檢查是否已經啟用
      const alreadyEnabled = await isBiometricEnabled();
      if (alreadyEnabled) {
        return; // 已經啟用，不再詢問
      }
      
      // 檢查可用性
      const availability = await checkBiometricAvailability();
      if (!availability.available) {
        return; // 不可用，不詢問
      }
      
      const biometricText = getBiometricTypeText(availability.type);
      
      Alert.alert(
        `啟用${biometricText}登入？`,
        `下次登入時可以使用${biometricText}快速登入`,
        [
          {
            text: '稍後再說',
            style: 'cancel'
          },
          {
            text: '立即啟用',
            onPress: async () => {
              const result = await setupBiometric(email, password);
              if (result.success) {
                // 更新狀態
                setBiometricAvailable(true);
                setBiometricType(availability.type);
                
                Alert.alert(
                  '設定成功！',
                  `${biometricText}登入已啟用\n下次可直接使用${biometricText}登入`,
                  [{ text: '太好了' }]
                );
              } else {
                Alert.alert('設定失敗', result.message);
              }
            }
          }
        ]
      );
    } catch (error) {
      console.error('詢問生物識別設定失敗:', error);
    }
  };

  // 登入處理
  const handleLogin = async () => {
    // 檢查是否被鎖定
    if (isLocked) {
      const remainingSeconds = Math.ceil((lockoutEndTime - Date.now()) / 1000);
      Alert.alert(
        '登入已鎖定',
        `由於多次登入失敗，請等待 ${remainingSeconds} 秒後再試`
      );
      return;
    }

    // 表單驗證
    if (!isFormValid) {
      Alert.alert('請檢查表單', '請確保所有欄位都正確填寫');
      return;
    }

    setIsLoading(true);
    try {
      // 登入
      console.log('🔐 [LoginScreen] 開始登入流程...');
      const response = await ApiService.login(email, password);
      
      // 登入成功，重置失敗次數
      setLoginAttempts(0);
      
      const userData = {
        id: response.user.id,
        name: response.user.name,
        email: response.user.email,
        isGuest: false
      };

      // 保存登入狀態
      await setLoginState({
        userData,
        token: response.token,
        rememberMe,
      });
      
      console.log('✅ [LoginScreen] 登入狀態已設定');
      console.log('   - Email:', userData.email);
      console.log('   - Token:', response.token ? '已提供' : '未提供');
      console.log('   - RememberMe:', rememberMe);
      
      // 🆕 詢問是否要啟用生物識別（在導航之前）
      await promptBiometricSetup(email, password);
      
      // 檢查企業引薦碼並導航
      await checkEnterpriseCodeAndNavigate(userData);
    } catch (error) {
      console.error('❌ [LoginScreen] 登入失敗:', error);
      
      // 增加失敗次數
      const newAttempts = loginAttempts + 1;
      setLoginAttempts(newAttempts);
      
      // 震動動畫
      Animated.sequence([
        Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
      ]).start();
      
      // 詳細錯誤處理
      let errorTitle = '登入失敗';
      let errorMessage = '請檢查您的電子郵件和密碼';
      
      if (error.message.includes('email') || error.message.includes('password')) {
        errorMessage = '電子郵件或密碼不正確';
      } else if (error.message.includes('network')) {
        errorMessage = '網路連接失敗，請檢查您的網路';
      } else if (error.message.includes('server')) {
        errorMessage = '伺服器暫時無法連接，請稍後再試';
      }
      
      // 檢查是否需要鎖定
      if (newAttempts >= 5) {
        const lockDuration = 60000; // 1 分鐘
        const endTime = Date.now() + lockDuration;
        setIsLocked(true);
        setLockoutEndTime(endTime);
        
        errorTitle = '登入已鎖定';
        errorMessage = '由於多次登入失敗，您的帳號已被暫時鎖定 1 分鐘';
      } else if (newAttempts >= 3) {
        errorMessage += `\n\n剩餘嘗試次數：${5 - newAttempts}`;
      }
      
      Alert.alert(errorTitle, errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // 忘記密碼
  const handleForgotPassword = () => {
    if (navigation) {
      navigation.navigate('ForgotPassword', { email });
    }
  };

  // 前往註冊
  const goToRegister = () => {
    if (navigation) {
      navigation.navigate('Register');
    }
  };

  // 返回
  const handleGoBack = () => {
    if (navigation) {
      if (navigation.canGoBack()) {
        navigation.goBack();
      } else {
        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: 'MainTabs' }],
          })
        );
      }
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
        <Text style={styles.headerTitle}>登入</Text>
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
            <Animated.View style={[
              styles.contentContainer,
              { opacity: fadeAnim }
            ]}>
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
                <Text style={styles.logoText}>LUCIDBOOK</Text>
                <Text style={styles.logoSubtext}>找到內心的平靜</Text>
              </View>

              {/* 表單卡片 */}
              <View style={styles.formCard}>
                <Text style={styles.formTitle}>歡迎回來</Text>
                <Text style={styles.formSubtitle}>登入以繼續您的練習之旅</Text>
                
                {/* 生物識別登入按鈕 */}
                {biometricAvailable && (
                  <TouchableOpacity 
                    style={styles.biometricButton}
                    onPress={handleBiometricLogin}
                    activeOpacity={0.8}
                    disabled={isLoading}
                  >
                    <View style={styles.biometricButtonContent}>
                      <Ionicons name={getBiometricTypeIcon(biometricType)} size={24} color="#166CB5" />
                      <Text style={styles.biometricButtonText}>
                        使用{getBiometricTypeText(biometricType)}登入
                      </Text>
                    </View>
                  </TouchableOpacity>
                )}

                {/* 分隔線 */}
                {biometricAvailable && (
                  <View style={styles.dividerContainer}>
                    <View style={styles.divider} />
                    <Text style={styles.dividerText}>或使用電子郵件登入</Text>
                    <View style={styles.divider} />
                  </View>
                )}
                
                {/* 電子郵件輸入 */}
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>電子郵件</Text>
                  <View style={[
                    styles.inputWrapper,
                    emailError && styles.inputWrapperError
                  ]}>
                    <Ionicons 
                      name="mail-outline" 
                      size={20} 
                      color={emailError ? "#EF4444" : "#9CA3AF"} 
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
                      editable={!isLoading && !isLocked}
                      returnKeyType="next"
                    />
                    {email.length > 0 && !emailError && (
                      <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                    )}
                  </View>
                  {emailError && (
                    <View style={styles.errorContainer}>
                      <Ionicons name="alert-circle" size={14} color="#EF4444" />
                      <Text style={styles.errorText}>{emailError}</Text>
                    </View>
                  )}
                </View>

                {/* 密碼輸入 */}
                <Animated.View 
                  style={[
                    styles.inputContainer,
                    { transform: [{ translateX: shakeAnim }] }
                  ]}
                >
                  <Text style={styles.inputLabel}>密碼</Text>
                  <View style={styles.inputWrapper}>
                    <Ionicons name="lock-closed-outline" size={20} color="#9CA3AF" style={styles.inputIcon} />
                    <TextInput
                      style={[styles.textInput, { flex: 1 }]}
                      value={password}
                      onChangeText={setPassword}
                      placeholder="請輸入您的密碼"
                      placeholderTextColor="#9CA3AF"
                      secureTextEntry={!showPassword}
                      editable={!isLoading && !isLocked}
                      returnKeyType="done"
                      onSubmitEditing={handleLogin}
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
                </Animated.View>

                {/* 記住我 & 忘記密碼 */}
                <View style={styles.rememberMeRow}>
                  <TouchableOpacity
                    style={styles.checkboxContainer}
                    onPress={() => setRememberMe(!rememberMe)}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.checkbox, rememberMe && styles.checkboxChecked]}>
                      {rememberMe && <Ionicons name="checkmark" size={14} color="#FFFFFF" />}
                    </View>
                    <Text style={styles.checkboxLabel}>記住我</Text>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    onPress={handleForgotPassword}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.forgotPasswordText}>忘記密碼？</Text>
                  </TouchableOpacity>
                </View>

                {/* 登入失敗警告 */}
                {loginAttempts > 0 && !isLocked && (
                  <View style={styles.warningBox}>
                    <Ionicons name="warning" size={16} color="#F59E0B" />
                    <Text style={styles.warningText}>
                      登入失敗 {loginAttempts} 次
                      {loginAttempts >= 3 && ` · 剩餘嘗試次數：${5 - loginAttempts}`}
                    </Text>
                  </View>
                )}

                {/* 鎖定警告 */}
                {isLocked && lockoutEndTime && (
                  <View style={styles.lockBox}>
                    <Ionicons name="lock-closed" size={16} color="#EF4444" />
                    <Text style={styles.lockText}>
                      帳號已鎖定，請稍後再試
                    </Text>
                  </View>
                )}

                {/* 自動登入提示 */}
                <View style={styles.autoLoginHint}>
                  <Ionicons 
                    name="information-circle-outline" 
                    size={14} 
                    color="#9CA3AF" 
                  />
                  <Text style={styles.autoLoginHintText}>
                    登入後將自動保持 30 天，可至設定登出
                  </Text>
                </View>

                {/* 登入按鈕 */}
                <TouchableOpacity 
                  style={[
                    styles.loginButtonContainer,
                    !isFormValid && styles.loginButtonDisabled
                  ]}
                  onPress={handleLogin}
                  disabled={isLoading || !isFormValid}
                  activeOpacity={0.9}
                >
                  <LinearGradient
                    colors={!isFormValid 
                      ? ['#D1D5DB', '#D1D5DB']
                      : ['#166CB5', '#31C6FE']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.loginButton}
                  >
                    {isLoading ? (
                      <ActivityIndicator color="white" />
                    ) : (
                      <>
                        <Text style={[
                          styles.loginButtonText,
                          !isFormValid && styles.loginButtonTextDisabled
                        ]}>
                          登入
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

                {/* 社交登入預留區域 */}
                {/* <View style={styles.socialLoginContainer}>
                  <Text style={styles.socialLoginText}>或使用以下方式登入</Text>
                  <View style={styles.socialButtons}>
                    <TouchableOpacity style={styles.socialButton}>
                      <Ionicons name="logo-google" size={24} color="#DB4437" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.socialButton}>
                      <Ionicons name="logo-apple" size={24} color="#000000" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.socialButton}>
                      <Ionicons name="logo-facebook" size={24} color="#4267B2" />
                    </TouchableOpacity>
                  </View>
                </View> */}

                {/* 註冊連結 */}
                <View style={styles.signupContainer}>
                  <Text style={styles.signupText}>還沒有帳戶？</Text>
                  <TouchableOpacity onPress={goToRegister} activeOpacity={0.7}>
                    <Text style={styles.signupLink}>立即註冊</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Animated.View>
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

  // 生物識別按鈕
  biometricButton: {
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    paddingVertical: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  biometricButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  biometricButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#166CB5',
  },

  // 分隔線
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  dividerText: {
    fontSize: 12,
    color: '#9CA3AF',
    marginHorizontal: 12,
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

  // 錯誤提示
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

  // 記住我區域
  rememberMeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  checkboxChecked: {
    backgroundColor: '#166CB5',
    borderColor: '#166CB5',
  },
  checkboxLabel: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  forgotPasswordText: {
    fontSize: 14,
    color: '#166CB5',
    fontWeight: '600',
  },

  // 警告框
  warningBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFBEB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginTop: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#FEF3C7',
  },
  warningText: {
    fontSize: 12,
    color: '#92400E',
    marginLeft: 8,
    flex: 1,
    fontWeight: '500',
  },

  // 鎖定框
  lockBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginTop: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  lockText: {
    fontSize: 12,
    color: '#991B1B',
    marginLeft: 8,
    flex: 1,
    fontWeight: '600',
  },

  // 自動登入提示
  autoLoginHint: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F9FF',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginTop: 8,
    marginBottom: 20,
  },
  autoLoginHintText: {
    fontSize: 12,
    color: '#0369A1',
    marginLeft: 8,
    flex: 1,
  },

  // 登入按鈕
  loginButtonContainer: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 24,
    shadowColor: '#166CB5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  loginButtonDisabled: {
    shadowOpacity: 0.1,
    elevation: 2,
  },
  loginButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  loginButtonTextDisabled: {
    color: '#9CA3AF',
  },

  // 社交登入（預留）
  socialLoginContainer: {
    marginBottom: 24,
  },
  socialLoginText: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
    marginBottom: 16,
  },
  socialButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
  },
  socialButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#F9FAFB',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },

  // 註冊連結
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signupText: {
    fontSize: 14,
    color: '#6B7280',
    marginRight: 4,
  },
  signupLink: {
    fontSize: 14,
    color: '#166CB5',
    fontWeight: '600',
  },
});

export default LoginScreen;