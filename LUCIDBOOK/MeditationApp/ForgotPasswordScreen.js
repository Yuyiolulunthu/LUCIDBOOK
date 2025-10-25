// ==========================================
// 檔案名稱: ForgotPasswordScreen.js (改進版)
// 功能: 開發模式 + 詳細錯誤診斷
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
  Clipboard,
} from 'react-native';
import ApiService from './api';

const ForgotPasswordScreen = ({ navigation, route }) => {
  const [email, setEmail] = useState(route?.params?.email || '');
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [devModeToken, setDevModeToken] = useState('');
  const [errorDetails, setErrorDetails] = useState('');

  // 🔧 開發模式：生成假的重設令牌
  const generateMockToken = () => {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
  };

  const handleSendResetEmail = async () => {
    if (!email) {
      Alert.alert('錯誤', '請輸入電子郵件');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('錯誤', '請輸入有效的電子郵件格式');
      return;
    }

    setIsLoading(true);
    setErrorDetails('');
    
    try {
      console.log('🔍 嘗試發送忘記密碼請求...');
      console.log('📧 電子郵件:', email);
      console.log('🌐 API 端點: https://curiouscreate.com/api/forgot-password.php');
      
      // 嘗試呼叫真實 API
      const response = await ApiService.forgotPassword(email);
      
      console.log('✅ API 回應成功:', response);
      
      setEmailSent(true);
      
      Alert.alert(
        '✅ 成功', 
        '重設密碼郵件已發送！\n\n請檢查您的信箱（包含垃圾郵件資料夾）',
        [
          {
            text: '確定',
            onPress: () => {
              if (navigation) {
                navigation.goBack();
              }
            }
          }
        ]
      );
      
    } catch (error) {
      console.error('❌ 忘記密碼 API 錯誤:', error);
      
      // 詳細的錯誤分析
      let errorMessage = error.message || '未知錯誤';
      let errorType = '未知問題';
      let suggestion = '';
      
      // 分析錯誤類型
      if (errorMessage.includes('404') || errorMessage.includes('Not Found')) {
        errorType = '後端 API 未實作';
        suggestion = '後端需要創建 /forgot-password.php 檔案';
        setErrorDetails(`❌ 錯誤類型: ${errorType}\n\n💡 解決方案:\n${suggestion}\n\n建議使用開發模式版本進行測試。`);
      } else if (errorMessage.includes('500') || errorMessage.includes('Internal Server Error')) {
        errorType = '伺服器內部錯誤';
        suggestion = '可能是郵件服務未配置或資料庫錯誤';
        setErrorDetails(`❌ 錯誤類型: ${errorType}\n\n💡 可能原因:\n• 郵件服務（SendGrid/Mailgun）未配置\n• 資料庫連線問題\n• PHP 錯誤\n\n建議檢查後端日誌。`);
      } else if (errorMessage.includes('Network request failed') || errorMessage.includes('Failed to fetch')) {
        errorType = '網路連線問題';
        suggestion = '請檢查網路連線或 API 網址';
        setErrorDetails(`❌ 錯誤類型: ${errorType}\n\n💡 解決方案:\n${suggestion}`);
      } else {
        setErrorDetails(`❌ 錯誤訊息: ${errorMessage}\n\n💡 這可能表示後端未完全實作忘記密碼功能。`);
      }
      
      // 🔧 開發模式：提供替代方案
      if (__DEV__) {
        Alert.alert(
          '⚠️ API 呼叫失敗',
          `${errorMessage}\n\n在開發階段，您可以：\n\n1️⃣ 使用開發模式版本（不需要真實郵件）\n2️⃣ 配置後端郵件服務\n3️⃣ 暫時跳過此功能`,
          [
            {
              text: '使用開發模式',
              onPress: () => {
                // 模擬成功
                const mockToken = generateMockToken();
                setDevModeToken(mockToken);
                setEmailSent(true);
                Alert.alert(
                  '🔧 開發模式',
                  `模擬重設令牌：\n${mockToken}\n\n複製此令牌用於測試`,
                  [
                    { 
                      text: '複製', 
                      onPress: () => {
                        Clipboard.setString(mockToken);
                        Alert.alert('✅', '已複製到剪貼簿');
                      }
                    },
                    { text: '確定' }
                  ]
                );
              }
            },
            { text: '取消', style: 'cancel' }
          ]
        );
      } else {
        Alert.alert(
          '❌ 發送失敗',
          `${errorMessage}\n\n請稍後再試或聯絡客服。`
        );
      }
      
    } finally {
      setIsLoading(false);
    }
  };

  const goBack = () => {
    if (navigation) {
      navigation.goBack();
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="rgba(22, 109, 181, 0.95)" />
      
      {/* 🔧 開發模式指示器 */}
      {__DEV__ && (
        <View style={styles.devModeBanner}>
          <Text style={styles.devModeText}>🔧 開發模式</Text>
        </View>
      )}
      
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={goBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>← 返回</Text>
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
                <Text style={styles.iconText}>🔒</Text>
              </View>

              <Text style={styles.title}>忘記密碼？</Text>
              <Text style={styles.subtitle}>
                請輸入您的電子郵件地址，我們將發送重設密碼的連結給您
              </Text>

              {/* 🔧 開發模式說明 */}
              {__DEV__ && (
                <View style={styles.devModeInfo}>
                  <Text style={styles.devModeInfoTitle}>💡 開發模式提示</Text>
                  <Text style={styles.devModeInfoText}>
                    • 會先嘗試呼叫真實 API{'\n'}
                    • 如果 API 失敗，可以使用模擬模式{'\n'}
                    • 正式環境會自動使用真實 API
                  </Text>
                </View>
              )}

              <View style={styles.formContainer}>
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>電子郵件</Text>
                  <TextInput
                    style={styles.textInput}
                    value={email}
                    onChangeText={setEmail}
                    placeholder="請輸入您的電子郵件"
                    placeholderTextColor="#9CA3AF"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    editable={!isLoading && !emailSent}
                    returnKeyType="done"
                    onSubmitEditing={handleSendResetEmail}
                  />
                </View>

                {/* 顯示錯誤詳情 */}
                {errorDetails && __DEV__ && (
                  <View style={styles.errorDetailsContainer}>
                    <Text style={styles.errorDetailsTitle}>🔍 錯誤詳情</Text>
                    <ScrollView style={styles.errorDetailsScroll}>
                      <Text style={styles.errorDetailsText} selectable>
                        {errorDetails}
                      </Text>
                    </ScrollView>
                  </View>
                )}

                {/* 顯示生成的令牌（開發模式） */}
                {__DEV__ && devModeToken && (
                  <View style={styles.tokenContainer}>
                    <Text style={styles.tokenLabel}>🔧 模擬重設令牌：</Text>
                    <View style={styles.tokenBox}>
                      <Text style={styles.tokenText} selectable>
                        {devModeToken}
                      </Text>
                    </View>
                    <TouchableOpacity 
                      style={styles.copyButton}
                      onPress={() => {
                        Clipboard.setString(devModeToken);
                        Alert.alert('✅', '令牌已複製');
                      }}
                    >
                      <Text style={styles.copyButtonText}>📋 複製令牌</Text>
                    </TouchableOpacity>
                  </View>
                )}

                <TouchableOpacity 
                  style={[
                    styles.sendButton, 
                    (isLoading || emailSent) && styles.sendButtonDisabled
                  ]}
                  onPress={handleSendResetEmail}
                  disabled={isLoading || emailSent}
                  activeOpacity={0.8}
                >
                  {isLoading ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <Text style={styles.sendButtonText}>
                      {emailSent ? '✓ 已發送' : '發送重設連結'}
                    </Text>
                  )}
                </TouchableOpacity>

                <View style={styles.infoBox}>
                  <Text style={styles.infoIcon}>ℹ️</Text>
                  <Text style={styles.infoText}>
                    如果該電子郵件已註冊，您將在幾分鐘內收到重設密碼的郵件。請檢查您的垃圾郵件資料夾。
                  </Text>
                </View>

                <TouchableOpacity 
                  style={styles.backToLoginButton}
                  onPress={goBack}
                  activeOpacity={0.7}
                >
                  <Text style={styles.backToLoginText}>返回登入頁面</Text>
                </TouchableOpacity>
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
  devModeBanner: {
    backgroundColor: '#FCD34D',
    paddingVertical: 4,
    alignItems: 'center',
  },
  devModeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#92400E',
  },
  devModeInfo: {
    backgroundColor: '#EFF6FF',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  devModeInfoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E40AF',
    marginBottom: 6,
  },
  devModeInfoText: {
    fontSize: 12,
    color: '#1E40AF',
    lineHeight: 18,
  },
  errorDetailsContainer: {
    backgroundColor: '#FEE2E2',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#FCA5A5',
    maxHeight: 200,
  },
  errorDetailsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#991B1B',
    marginBottom: 8,
  },
  errorDetailsScroll: {
    maxHeight: 150,
  },
  errorDetailsText: {
    fontSize: 12,
    color: '#991B1B',
    lineHeight: 18,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  tokenContainer: {
    marginBottom: 20,
    padding: 12,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
  },
  tokenLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  tokenBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 6,
    padding: 12,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    marginBottom: 8,
  },
  tokenText: {
    fontSize: 12,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    color: '#1F2937',
  },
  copyButton: {
    backgroundColor: 'rgba(22, 109, 181, 0.95)',
    borderRadius: 6,
    paddingVertical: 8,
    alignItems: 'center',
  },
  copyButtonText: {
    color: 'white',
    fontSize: 13,
    fontWeight: '500',
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
    lineHeight: 24,
    paddingHorizontal: 16,
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
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#111827',
    backgroundColor: '#F9FAFB',
  },
  sendButton: {
    backgroundColor: 'rgba(22, 109, 181, 0.95)',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 20,
  },
  sendButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  sendButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#EFF6FF',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
  },
  infoIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: '#1E40AF',
    lineHeight: 18,
  },
  backToLoginButton: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  backToLoginText: {
    fontSize: 14,
    color: 'rgba(22, 109, 181, 0.95)',
    fontWeight: '500',
  },
});

export default ForgotPasswordScreen;