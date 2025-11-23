// ==========================================
// 檔案名稱: RegisterScreen.js
// 功能: 註冊頁面
// 🎨 統一設計風格
// ✅ 完整註冊流程
// ✅ 表單驗證
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
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import ApiService from '../../../api';

const RegisterScreen = ({ navigation }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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

    setIsLoading(true);
    try {
      await ApiService.register(name, email, password);
      
      Alert.alert(
        '註冊成功', 
        '恭喜你！帳號已建立，請登入', 
        [
          { 
            text: '前往登入', 
            onPress: () => {
              if (navigation) {
                navigation.goBack();
              }
            }
          }
        ]
      );
    } catch (error) {
      Alert.alert('註冊失敗', error.message || '註冊失敗，請稍後再試');
    } finally {
      setIsLoading(false);
    }
  };

  const goToLogin = () => {
    if (navigation) {
      navigation.goBack();
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
                <Text style={styles.formTitle}>加入 LucidBook</Text>
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
                  <View style={styles.inputWrapper}>
                    <Ionicons name="lock-closed-outline" size={20} color="#9CA3AF" style={styles.inputIcon} />
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
                        color="#9CA3AF" 
                      />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* 註冊按鈕 */}
                <TouchableOpacity 
                  style={styles.registerButtonContainer}
                  onPress={handleRegister}
                  disabled={isLoading}
                  activeOpacity={0.9}
                >
                  <LinearGradient
                    colors={['#166CB5', '#31C6FE']}
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
                  <Ionicons name="bulb" size={20} color="#FF8C42" />
                  <Text style={styles.quoteText}>開始練習，讓心靈更強韌</Text>
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

  // 註冊按鈕
  registerButtonContainer: {
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 8,
    marginBottom: 24,
    shadowColor: '#166CB5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
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
    backgroundColor: '#FFF7ED',
    borderRadius: 16,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: '#FFEDD5',
  },
  quoteText: {
    fontSize: 13,
    color: '#78350F',
    fontWeight: '500',
  },
});

export default RegisterScreen;