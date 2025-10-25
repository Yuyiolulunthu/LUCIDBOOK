// ==========================================
// 檔案名稱: ForgotPasswordScreen.js (改進版 v2)
// 功能: 支持後端開發模式令牌直接回傳
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
  Linking,
} from 'react-native';
import ApiService from './api';

const ForgotPasswordScreen = ({ navigation, route }) => {
  const [email, setEmail] = useState(route?.params?.email || '');
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [resetToken, setResetToken] = useState('');
  const [resetUrl, setResetUrl] = useState('');
  const [errorDetails, setErrorDetails] = useState('');
  const [isDevelopmentMode, setIsDevelopmentMode] = useState(false);

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
    setResetToken('');
    setResetUrl('');
    
    try {
      console.log('🔍 嘗試發送忘記密碼請求...');
      console.log('📧 電子郵件:', email);
      console.log('🌐 API 端點: https://curiouscreate.com/api/forgot-password.php');
      
      const response = await ApiService.forgotPassword(email);
      
      console.log('✅ API 回應成功:', response);
      
      setEmailSent(true);
      
      // 檢查是否為開發模式
      if (response.dev_mode && response.token) {
        // 🔧 開發模式：後端直接回傳令牌
        setIsDevelopmentMode(true);
        setResetToken(response.token);
        setResetUrl(response.reset_url || '');
        
        console.log('🔧 開發模式偵測到');
        console.log('🔑 重設令牌:', response.token);
        console.log('🔗 重設網址:', response.reset_url);
        
        Alert.alert(
          '🔧 開發模式', 
          response.note || '重設令牌已生成！\n\n由於是開發模式，令牌會直接顯示在畫面上。',
          [{ text: '確定' }]
        );
      } else {
        // 📧 正式模式：郵件已發送
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
      }
      
    } catch (error) {
      console.error('❌ 忘記密碼 API 錯誤:', error);
      
      let errorMessage = error.message || '未知錯誤';
      let detailedError = '';
      
      // 分析錯誤類型
      if (errorMessage.includes('404') || errorMessage.includes('Not Found')) {
        detailedError = '❌ 錯誤: API 端點不存在\n\n';
        detailedError += '💡 解決方案:\n';
        detailedError += '1. 確認 forgot-password.php 已上傳\n';
        detailedError += '2. 檢查檔案是否在 /api/ 目錄\n';
        detailedError += '3. 確認檔案權限正確（644 或 755）\n\n';
        detailedError += '🔍 測試: 在瀏覽器訪問\n';
        detailedError += 'https://curiouscreate.com/api/forgot-password.php';
      } else if (errorMessage.includes('500')) {
        detailedError = '❌ 錯誤: 伺服器內部錯誤\n\n';
        detailedError += '💡 可能原因:\n';
        detailedError += '• 資料庫連線問題\n';
        detailedError += '• PHP 語法錯誤\n';
        detailedError += '• 郵件服務設定問題\n';
        detailedError += '• config.php 設定錯誤';
      } else if (errorMessage.includes('Network request failed') || errorMessage.includes('Failed to fetch')) {
        detailedError = '❌ 錯誤: 無法連接到伺服器\n\n';
        detailedError += '💡 可能原因:\n';
        detailedError += '1. API 檔案不存在（最常見）\n';
        detailedError += '2. 網路連線問題\n';
        detailedError += '3. API 網址設定錯誤\n';
        detailedError += '4. CORS 設定問題\n\n';
        detailedError += '🔍 快速檢查:\n';
        detailedError += '在瀏覽器訪問:\n';
        detailedError += 'https://curiouscreate.com/api/test-connection.php';
      } else {
        detailedError = `❌ 錯誤訊息: ${errorMessage}\n\n`;
        detailedError += '💡 建議:\n';
        detailedError += '• 檢查後端日誌\n';
        detailedError += '• 確認 API 檔案已上傳\n';
        detailedError += '• 測試 API 連線';
      }
      
      setErrorDetails(detailedError);
      
      Alert.alert(
        '❌ 發送失敗',
        errorMessage + '\n\n請查看畫面上的詳細錯誤資訊。'
      );
      
    } finally {
      setIsLoading(false);
    }
  };

  const copyToken = () => {
    if (resetToken) {
      Clipboard.setString(resetToken);
      Alert.alert('✅ 成功', '令牌已複製到剪貼簿');
    }
  };

  const openResetUrl = () => {
    if (resetUrl) {
      Linking.openURL(resetUrl).catch(err => {
        console.error('無法開啟連結:', err);
        Alert.alert('錯誤', '無法開啟重設密碼頁面');
      });
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
      
      {/* 開發模式指示器 */}
      {isDevelopmentMode && (
        <View style={styles.devModeBanner}>
          <Text style={styles.devModeText}>🔧 後端開發模式</Text>
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
                {errorDetails && (
                  <View style={styles.errorDetailsContainer}>
                    <Text style={styles.errorDetailsTitle}>🔍 錯誤詳情</Text>
                    <ScrollView style={styles.errorDetailsScroll}>
                      <Text style={styles.errorDetailsText} selectable>
                        {errorDetails}
                      </Text>
                    </ScrollView>
                  </View>
                )}

                {/* 開發模式：顯示令牌 */}
                {isDevelopmentMode && resetToken && (
                  <View style={styles.devTokenContainer}>
                    <Text style={styles.devTokenTitle}>🔑 重設令牌（開發模式）</Text>
                    
                    <View style={styles.tokenBox}>
                      <Text style={styles.tokenLabel}>令牌：</Text>
                      <Text style={styles.tokenText} selectable>
                        {resetToken}
                      </Text>
                    </View>

                    <View style={styles.buttonRow}>
                      <TouchableOpacity 
                        style={[styles.actionButton, styles.copyButton]}
                        onPress={copyToken}
                      >
                        <Text style={styles.actionButtonText}>📋 複製令牌</Text>
                      </TouchableOpacity>

                      {resetUrl && (
                        <TouchableOpacity 
                          style={[styles.actionButton, styles.openButton]}
                          onPress={openResetUrl}
                        >
                          <Text style={styles.actionButtonText}>🔗 開啟重設頁面</Text>
                        </TouchableOpacity>
                      )}
                    </View>

                    <View style={styles.devNote}>
                      <Text style={styles.devNoteText}>
                        ⚠️ 這是開發模式，令牌直接顯示。{'\n'}
                        正式環境會透過郵件發送。
                      </Text>
                    </View>
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
    paddingVertical: 6,
    alignItems: 'center',
  },
  devModeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#92400E',
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
  errorDetailsContainer: {
    backgroundColor: '#FEE2E2',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#FCA5A5',
    maxHeight: 250,
  },
  errorDetailsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#991B1B',
    marginBottom: 8,
  },
  errorDetailsScroll: {
    maxHeight: 200,
  },
  errorDetailsText: {
    fontSize: 12,
    color: '#991B1B',
    lineHeight: 18,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  devTokenContainer: {
    backgroundColor: '#FEF3C7',
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#FCD34D',
  },
  devTokenTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#92400E',
    marginBottom: 12,
  },
  tokenBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 6,
    padding: 12,
    marginBottom: 12,
  },
  tokenLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  tokenText: {
    fontSize: 11,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    color: '#1F2937',
    lineHeight: 16,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  actionButton: {
    flex: 1,
    borderRadius: 6,
    paddingVertical: 10,
    alignItems: 'center',
  },
  copyButton: {
    backgroundColor: 'rgba(22, 109, 181, 0.95)',
  },
  openButton: {
    backgroundColor: '#10B981',
  },
  actionButtonText: {
    color: 'white',
    fontSize: 13,
    fontWeight: '600',
  },
  devNote: {
    backgroundColor: '#FFFBEB',
    borderRadius: 6,
    padding: 10,
  },
  devNoteText: {
    fontSize: 11,
    color: '#92400E',
    lineHeight: 16,
    textAlign: 'center',
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