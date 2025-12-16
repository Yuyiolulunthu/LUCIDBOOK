// ==========================================
// 檔案名稱: RegisterScreen.js
// 功能: 註冊頁面
// 🎨 統一設計風格
// ✅ 完整註冊流程
// ✅ 表單驗證（密碼即時警告）
// ✅ 隱私政策同意（導航到專屬頁面）
// ✅ 註冊後導向企業引薦碼頁面
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
import { CommonActions } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ApiService from '../../../api';

const RegisterScreen = ({ navigation, route }) => {
  // 🆕 從 route.params 恢復表單資料（從引薦碼頁面或隱私權頁面返回時）
  const { 
    savedFormData,
    agreedFromPrivacy = false, // 從隱私權政策頁面返回時帶入
  } = route.params || {};

  const [name, setName] = useState(savedFormData?.name || '');
  const [email, setEmail] = useState(savedFormData?.email || '');
  const [password, setPassword] = useState(savedFormData?.password || '');
  const [confirmPassword, setConfirmPassword] = useState(savedFormData?.confirmPassword || '');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreedToPrivacy, setAgreedToPrivacy] = useState(savedFormData?.agreedToPrivacy || agreedFromPrivacy);

  // 🆕 密碼不一致即時警告
  const [passwordMismatch, setPasswordMismatch] = useState(false);

  // 🆕 監聽隱私權政策頁面返回
  useEffect(() => {
    if (agreedFromPrivacy) {
      setAgreedToPrivacy(true);
    }
  }, [agreedFromPrivacy]);

  // 🆕 即時檢查密碼是否一致
  useEffect(() => {
    if (confirmPassword.length > 0 && password !== confirmPassword) {
      setPasswordMismatch(true);
    } else {
      setPasswordMismatch(false);
    }
  }, [password, confirmPassword]);

  // 🆕 開啟隱私政策頁面 - 導航到專屬頁面
  const openPrivacyPolicy = () => {
    // 儲存當前表單資料
    const formData = {
      name,
      email,
      password,
      confirmPassword,
      agreedToPrivacy,
    };
    
    navigation.navigate('PrivacyPolicy', {
      fromRegister: true,
      savedFormData: formData,
    });
  };

  const handleRegister = async () => {
    if (!name || !email || !password || !confirmPassword) {
      Alert.alert('錯誤', '請填寫所有欄位');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('錯誤', '請輸入有效的電子郵件格式');
      return;
    }

    if (password.length < 6) {
      Alert.alert('錯誤', '密碼至少需要 6 個字元');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('錯誤', '兩次輸入的密碼不一致');
      return;
    }

    if (!agreedToPrivacy) {
      Alert.alert('提醒', '請先閱讀並同意隱私權政策');
      return;
    }

    setIsLoading(true);
    try {
      // 註冊
      await ApiService.register(name, email, password);
      
      // 🆕 自動登入
      const loginResponse = await ApiService.login(email, password);
      
      // 儲存用戶資料
      const userData = {
        id: loginResponse.user.id,
        name: loginResponse.user.name,
        email: loginResponse.user.email,
        isGuest: false
      };
      await AsyncStorage.setItem('userData', JSON.stringify(userData));
      
      // 🆕 註冊成功後，導航到企業引薦碼頁面（必填模式）
      Alert.alert(
        '註冊成功！', 
        '請輸入企業引薦碼以完成設定', 
        [
          { 
            text: '繼續', 
            onPress: () => {
              // 儲存表單資料以便返回時恢復
              const formData = {
                name,
                email,
                password,
                confirmPassword,
                agreedToPrivacy: true,
              };
              
              navigation.navigate('EnterpriseCode', { 
                fromRegister: true,
                isRequired: true, // 標記為必填
                savedFormData: formData,
              });
            }
          }
        ],
        { cancelable: false }
      );
    } catch (error) {
      Alert.alert('註冊失敗', error.message || '註冊失敗，請稍後再試');
    } finally {
      setIsLoading(false);
    }
  };

  const goToLogin = () => {
    if (navigation) {
      if (navigation.canGoBack()) {
        navigation.goBack();
      } else {
        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: 'Login' }],
          })
        );
      }
    }
  };

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
                  <View style={styles.inputWrapper}>
                    <Ionicons name="person-outline" size={20} color="#9CA3AF" style={styles.inputIcon} />
                    <TextInput
                      style={styles.textInput}
                      value={name}
                      onChangeText={setName}
                      placeholder="請輸入您的姓名"
                      placeholderTextColor="#9CA3AF"
                      editable={!isLoading}
                      returnKeyType="next"
                    />
                  </View>
                </View>

                {/* 電子郵件輸入 */}
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>電子郵件</Text>
                  <View style={styles.inputWrapper}>
                    <Ionicons name="mail-outline" size={20} color="#9CA3AF" style={styles.inputIcon} />
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
                  </View>
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
                </View>

                {/* 確認密碼輸入 */}
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>確認密碼</Text>
                  <View style={[
                    styles.inputWrapper, 
                    passwordMismatch && styles.inputWrapperError
                  ]}>
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
                  </View>
                  {/* 🆕 密碼不一致即時警告 */}
                  {passwordMismatch && (
                    <View style={styles.errorContainer}>
                      <Ionicons name="alert-circle" size={14} color="#EF4444" />
                      <Text style={styles.errorText}>兩次輸入的密碼不一致</Text>
                    </View>
                  )}
                </View>

                {/* 🆕 隱私政策同意區塊 */}
                <View style={styles.privacyContainer}>
                  <View style={styles.checkboxContainer}>
                    {/* Checkbox - 可直接點擊勾選 */}
                    <TouchableOpacity 
                      onPress={() => setAgreedToPrivacy(!agreedToPrivacy)}
                      activeOpacity={0.7}
                    >
                      <View style={[styles.checkbox, agreedToPrivacy && styles.checkboxChecked]}>
                        {agreedToPrivacy && (
                          <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                        )}
                      </View>
                    </TouchableOpacity>
                    
                    {/* 文字區域 */}
                    <View style={styles.privacyTextContainer}>
                      <Text style={styles.privacyText}>我已閱讀並同意</Text>
                      {/* 隱私權政策連結 - 點擊導航到頁面 */}
                      <TouchableOpacity onPress={openPrivacyPolicy} activeOpacity={0.7}>
                        <Text style={styles.privacyLink}>隱私權政策</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                  {!agreedToPrivacy && (
                    <Text style={styles.privacyHint}>
                      請先閱讀隱私權政策後勾選同意
                    </Text>
                  )}
                </View>

                {/* 註冊按鈕 */}
                <TouchableOpacity 
                  style={[
                    styles.registerButtonContainer,
                    (!agreedToPrivacy || passwordMismatch) && styles.registerButtonDisabled
                  ]}
                  onPress={handleRegister}
                  disabled={isLoading || !agreedToPrivacy || passwordMismatch}
                  activeOpacity={0.9}
                >
                  <LinearGradient
                    colors={(!agreedToPrivacy || passwordMismatch) 
                      ? ['#9CA3AF', '#9CA3AF'] 
                      : ['#166CB5', '#31C6FE']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.registerButton}
                  >
                    {isLoading ? (
                      <ActivityIndicator color="white" />
                    ) : (
                      <>
                        <Text style={styles.registerButtonText}>註冊</Text>
                        <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
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

  // 🆕 密碼不一致錯誤提示
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
    color: '#9CA3AF',
    marginTop: 6,
    marginLeft: 34,
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