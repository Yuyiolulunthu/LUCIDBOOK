// ==========================================
// 檔案名稱: ForgotPasswordScreen.js
// 功能: 忘記密碼頁面
// 🎨 統一設計風格 + 鎖頭圖標
// ✅ 支持後端開發模式令牌直接回傳
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
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import ApiService from '../../../api';

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
      
      const response = await ApiService.forgotPassword(email);
      
      console.log('✅ API 回應成功:', response);
      
      setEmailSent(true);
      
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
      
      if (errorMessage.includes('404') || errorMessage.includes('Not Found')) {
        detailedError = '❌ 錯誤: API 端點不存在\n\n';
        detailedError += '💡 解決方案:\n';
        detailedError += '1. 確認 forgot-password.php 已上傳\n';
        detailedError += '2. 檢查檔案是否在 /api/ 目錄\n';
        detailedError += '3. 確認檔案權限正確（644 或 755）';
      } else if (errorMessage.includes('500')) {
        detailedError = '❌ 錯誤: 伺服器內部錯誤\n\n';
        detailedError += '💡 可能原因:\n';
        detailedError += '• 資料庫連線問題\n';
        detailedError += '• PHP 語法錯誤\n';
        detailedError += '• 郵件服務設定問題';
      } else if (errorMessage.includes('Network request failed')) {
        detailedError = '❌ 錯誤: 無法連接到伺服器\n\n';
        detailedError += '💡 可能原因:\n';
        detailedError += '1. API 檔案不存在（最常見）\n';
        detailedError += '2. 網路連線問題\n';
        detailedError += '3. API 網址設定錯誤';
      } else {
        detailedError = `❌ 錯誤訊息: ${errorMessage}\n\n`;
        detailedError += '💡 建議:\n';
        detailedError += '• 檢查後端日誌\n';
        detailedError += '• 確認 API 檔案已上傳';
      }
      
      setErrorDetails(detailedError);
      Alert.alert('❌ 發送失敗', errorMessage + '\n\n請查看畫面上的詳細錯誤資訊。');
      
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
      <StatusBar barStyle="light-content" backgroundColor="#166CB5" />
      
      {/* 開發模式指示器 */}
      {isDevelopmentMode && (
        <View style={styles.devModeBanner}>
          <Text style={styles.devModeText}>🔧 後端開發模式</Text>
        </View>
      )}
      
      {/* ⭐ Header - 漸層藍色設計 */}
      <LinearGradient
        colors={['#166CB5', '#31C6FE']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <TouchableOpacity onPress={goBack} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>忘記密碼</Text>
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
                    <Ionicons name="lock-open-outline" size={48} color="#FFFFFF" />
                  </LinearGradient>
                </View>
                <Text style={styles.logoText}>密碼重設</Text>
                <Text style={styles.logoSubtext}>
                  輸入您的電子郵件，我們將發送重設連結
                </Text>
              </View>

              {/* 表單卡片 */}
              <View style={styles.formCard}>
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
                      editable={!isLoading && !emailSent}
                      returnKeyType="done"
                      onSubmitEditing={handleSendResetEmail}
                    />
                  </View>
                </View>

                {/* 顯示錯誤詳情 */}
                {errorDetails && (
                  <View style={styles.errorDetailsContainer}>
                    <View style={styles.errorHeader}>
                      <Ionicons name="alert-circle" size={20} color="#DC2626" />
                      <Text style={styles.errorDetailsTitle}>錯誤詳情</Text>
                    </View>
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
                    <View style={styles.devTokenHeader}>
                      <Ionicons name="code-slash" size={20} color="#F59E0B" />
                      <Text style={styles.devTokenTitle}>重設令牌（開發模式）</Text>
                    </View>
                    
                    <View style={styles.tokenBox}>
                      <Text style={styles.tokenLabel}>令牌：</Text>
                      <Text style={styles.tokenText} selectable>
                        {resetToken}
                      </Text>
                    </View>

                    <View style={styles.buttonRow}>
                      <TouchableOpacity 
                        style={styles.copyButtonContainer}
                        onPress={copyToken}
                        activeOpacity={0.9}
                      >
                        <LinearGradient
                          colors={['#166CB5', '#31C6FE']}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 0 }}
                          style={styles.copyButton}
                        >
                          <Ionicons name="copy-outline" size={16} color="#FFFFFF" />
                          <Text style={styles.copyButtonText}>複製令牌</Text>
                        </LinearGradient>
                      </TouchableOpacity>

                      {resetUrl && (
                        <TouchableOpacity 
                          style={styles.openButtonContainer}
                          onPress={openResetUrl}
                          activeOpacity={0.9}
                        >
                          <LinearGradient
                            colors={['#10B981', '#34D399']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.openButton}
                          >
                            <Ionicons name="open-outline" size={16} color="#FFFFFF" />
                            <Text style={styles.openButtonText}>開啟頁面</Text>
                          </LinearGradient>
                        </TouchableOpacity>
                      )}
                    </View>

                    <View style={styles.devNote}>
                      <Ionicons name="information-circle-outline" size={16} color="#92400E" />
                      <Text style={styles.devNoteText}>
                        這是開發模式，令牌直接顯示。正式環境會透過郵件發送。
                      </Text>
                    </View>
                  </View>
                )}

                {/* 發送按鈕 */}
                <TouchableOpacity 
                  style={styles.sendButtonContainer}
                  onPress={handleSendResetEmail}
                  disabled={isLoading || emailSent}
                  activeOpacity={0.9}
                >
                  <LinearGradient
                    colors={isLoading || emailSent ? ['#9CA3AF', '#9CA3AF'] : ['#166CB5', '#31C6FE']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.sendButton}
                  >
                    {isLoading ? (
                      <ActivityIndicator color="white" />
                    ) : (
                      <>
                        <Text style={styles.sendButtonText}>
                          {emailSent ? '已發送' : '發送重設連結'}
                        </Text>
                        {emailSent && <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />}
                      </>
                    )}
                  </LinearGradient>
                </TouchableOpacity>

                {/* 提示訊息 */}
                <View style={styles.infoBox}>
                  <Ionicons name="information-circle" size={20} color="#166CB5" />
                  <Text style={styles.infoText}>
                    如果該電子郵件已註冊，您將在幾分鐘內收到重設密碼的郵件。請檢查您的垃圾郵件資料夾。
                  </Text>
                </View>

                {/* 返回登入 */}
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
    backgroundColor: '#F5F7FA',
  },

  // 開發模式橫幅
  devModeBanner: {
    backgroundColor: '#FCD34D',
    paddingVertical: 8,
    alignItems: 'center',
  },
  devModeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#92400E',
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

  // ⭐ Logo 區域 - 鎖頭圖標設計
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
    marginBottom: 8,
  },
  logoSubtext: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
    textAlign: 'center',
    paddingHorizontal: 20,
    lineHeight: 20,
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

  // 錯誤詳情
  errorDetailsContainer: {
    backgroundColor: '#FEE2E2',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#FCA5A5',
  },
  errorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  errorDetailsTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#DC2626',
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

  // 開發模式令牌
  devTokenContainer: {
    backgroundColor: '#FEF3C7',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#FCD34D',
  },
  devTokenHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  devTokenTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#92400E',
  },
  tokenBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  tokenLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
    fontWeight: '600',
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
  copyButtonContainer: {
    flex: 1,
    borderRadius: 8,
    overflow: 'hidden',
  },
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    gap: 6,
  },
  copyButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  openButtonContainer: {
    flex: 1,
    borderRadius: 8,
    overflow: 'hidden',
  },
  openButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    gap: 6,
  },
  openButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  devNote: {
    flexDirection: 'row',
    backgroundColor: '#FFFBEB',
    borderRadius: 8,
    padding: 12,
    gap: 8,
    alignItems: 'flex-start',
  },
  devNoteText: {
    flex: 1,
    fontSize: 12,
    color: '#92400E',
    lineHeight: 18,
  },

  // 發送按鈕
  sendButtonContainer: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 20,
    shadowColor: '#166CB5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  sendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  sendButtonText: {
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
    marginBottom: 20,
    gap: 12,
    alignItems: 'flex-start',
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: '#1E40AF',
    lineHeight: 20,
  },

  // 返回登入
  backToLoginButton: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  backToLoginText: {
    fontSize: 14,
    color: '#166CB5',
    fontWeight: '600',
  },
});

export default ForgotPasswordScreen;