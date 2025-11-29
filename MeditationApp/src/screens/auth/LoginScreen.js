// ==========================================
// 檔案名稱: LoginScreen.js
// 功能: 登入頁面
// 🎨 統一設計風格
// ✅ 電子郵件登入
// ✅ 訪客登入
// ✅ 登入成功後詢問企業引薦碼（只在沒有引薦碼時）
// ✅ 忘記密碼
// ==========================================

import React, { useState } from 'react';
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
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ApiService from '../../../api';

const LoginScreen = ({ navigation, route }) => {
  const { onLoginSuccess: parentOnLoginSuccess, canGoBack = false } = route.params || {};
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('錯誤', '請輸入電子郵件和密碼');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('錯誤', '請輸入有效的電子郵件格式');
      return;
    }

    setIsLoading(true);
    try {
      // ⭐ 修改點 1: 登入
      const response = await ApiService.login(email, password);
      
      const userData = {
        id: response.user.id,
        name: response.user.name,
        email: response.user.email,
        isGuest: false
      };

      await AsyncStorage.setItem('userData', JSON.stringify(userData));
      
      // ⭐ 修改點 2: 獲取完整用戶資料（包含企業引薦碼）
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
        // 如果獲取失敗，假設沒有企業引薦碼
        hasEnterpriseCode = false;
      }
      
      // ⭐ 修改點 3: 根據是否有企業引薦碼決定是否顯示提示
      if (hasEnterpriseCode) {
        // 已有企業引薦碼，直接登入成功
        console.log('✅ [LoginScreen] 用戶已有企業引薦碼，直接登入');
        
        Alert.alert(
          '登入成功！',
          '歡迎回來',
          [
            {
              text: '確定',
              onPress: () => {
                if (parentOnLoginSuccess) {
                  parentOnLoginSuccess(userData);
                }
                
                handleGoBack();
              }
            }
          ],
          { cancelable: false }
        );
      } else {
        // 沒有企業引薦碼，詢問是否要輸入
        console.log('📝 [LoginScreen] 用戶尚未設定企業引薦碼，顯示提示');
        
        Alert.alert(
          '登入成功！',
          '您是否有企業引薦碼？\n輸入引薦碼可解鎖專屬功能',
          [
            {
              text: '輸入引薦碼',
              onPress: () => {
                if (parentOnLoginSuccess) {
                  parentOnLoginSuccess(userData);
                }
                
                if (navigation) {
                  navigation.navigate('EnterpriseCode', { 
                    fromLogin: true,
                  });
                }
              }
            },
            {
              text: '稍後再說',
              style: 'cancel',
              onPress: () => {
                if (parentOnLoginSuccess) {
                  parentOnLoginSuccess(userData);
                }
                
                handleGoBack();
              }
            }
          ],
          { cancelable: false }
        );
      }
    } catch (error) {
      console.error('❌ [LoginScreen] 登入失敗:', error);
      Alert.alert('登入失敗', error.message || '請檢查您的電子郵件和密碼');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuestLogin = async () => {
    const guestData = { 
      email: 'guest@example.com', 
      name: '訪客', 
      isGuest: true 
    };

    try {
      await AsyncStorage.setItem('userData', JSON.stringify(guestData));
      
      if (parentOnLoginSuccess) {
        parentOnLoginSuccess(guestData);
      }
      
      handleGoBack();
    } catch (error) {
      console.error('訪客登入失敗:', error);
    }
  };

  const handleForgotPassword = () => {
    if (navigation) {
      navigation.navigate('ForgotPassword', { email });
    }
  };

  const goToRegister = () => {
    if (navigation) {
      navigation.navigate('Register');
    }
  };

  const handleGoBack = () => {
    if (navigation) {
      if (canGoBack || navigation.canGoBack()) {
        navigation.goBack();
      } else {
        navigation.reset({
          index: 0,
          routes: [{ name: 'Home' }],
        });
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
                <Text style={styles.logoText}>LucidBook</Text>
                <Text style={styles.logoSubtext}>找到內心的平靜</Text>
              </View>

              {/* 表單卡片 */}
              <View style={styles.formCard}>
                <Text style={styles.formTitle}>歡迎回來</Text>
                <Text style={styles.formSubtitle}>登入以繼續您的練習之旅</Text>
                
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
                      editable={!isLoading}
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
                </View>

                {/* 忘記密碼 */}
                <TouchableOpacity 
                  style={styles.forgotPassword}
                  onPress={handleForgotPassword}
                  disabled={isLoading}
                  activeOpacity={0.7}
                >
                  <Text style={styles.forgotPasswordText}>忘記密碼？</Text>
                </TouchableOpacity>

                {/* 登入按鈕 */}
                <TouchableOpacity 
                  style={styles.loginButtonContainer}
                  onPress={handleLogin}
                  disabled={isLoading}
                  activeOpacity={0.9}
                >
                  <LinearGradient
                    colors={['#166CB5', '#31C6FE']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.loginButton}
                  >
                    {isLoading ? (
                      <ActivityIndicator color="white" />
                    ) : (
                      <>
                        <Text style={styles.loginButtonText}>登入</Text>
                        <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
                      </>
                    )}
                  </LinearGradient>
                </TouchableOpacity>

                {/* 分隔線 */}
                <View style={styles.divider}>
                  <View style={styles.dividerLine} />
                  <Text style={styles.dividerText}>或</Text>
                  <View style={styles.dividerLine} />
                </View>

                {/* 訪客登入按鈕 */}
                <TouchableOpacity 
                  style={styles.guestButton}
                  onPress={handleGuestLogin}
                  disabled={isLoading}
                  activeOpacity={0.8}
                >
                  <Ionicons name="person-outline" size={20} color="#6B7280" />
                  <Text style={styles.guestButtonText}>以訪客身份繼續</Text>
                </TouchableOpacity>

                {/* 註冊連結 */}
                <View style={styles.signupContainer}>
                  <Text style={styles.signupText}>還沒有帳戶？</Text>
                  <TouchableOpacity onPress={goToRegister} activeOpacity={0.7}>
                    <Text style={styles.signupLink}>立即註冊</Text>
                  </TouchableOpacity>
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

  // 忘記密碼
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
  forgotPasswordText: {
    fontSize: 14,
    color: '#166CB5',
    fontWeight: '600',
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

  // 分隔線
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  dividerText: {
    paddingHorizontal: 16,
    fontSize: 14,
    color: '#9CA3AF',
    fontWeight: '500',
  },

  // 訪客按鈕
  guestButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingVertical: 14,
    marginBottom: 24,
    gap: 8,
  },
  guestButtonText: {
    color: '#6B7280',
    fontSize: 15,
    fontWeight: '600',
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