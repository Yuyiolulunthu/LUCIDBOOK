// ==========================================
// 檔案名稱: EnterpriseCode.js
// 功能: 企業引薦碼輸入頁面
// 
// ✅ 6個英數字輸入框
// ✅ 自動焦點切換
// ✅ 效期檢查（1個月）
// ✅ 完成按鈕驗證
// ✅ 完全符合設計圖
// ==========================================

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Alert,
  ActivityIndicator,
  TextInput,
  Keyboard,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ApiService from '../../../../api';

const EnterpriseCode = ({ navigation, route }) => {
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(0);
  const inputRefs = [
    useRef(null), 
    useRef(null), 
    useRef(null), 
    useRef(null), 
    useRef(null), 
    useRef(null)
  ];

  // 是否來自登入流程
  const isFromLogin = route?.params?.fromLogin || false;

  useEffect(() => {
    // 自動聚焦第一個輸入框
    setTimeout(() => {
      inputRefs[0].current?.focus();
    }, 300);
  }, []);

  const handleCodeChange = (text, index) => {
    // 只允許英數字（大小寫）
    if (text && !/^[0-9a-zA-Z]$/.test(text)) {
      return;
    }

    const newCode = [...code];
    // 轉換為大寫（可選，根據您的需求）
    newCode[index] = text.toUpperCase();
    setCode(newCode);

    // 自動跳到下一個輸入框
    if (text && index < 5) {
      inputRefs[index + 1].current?.focus();
    }
  };

  const handleKeyPress = (e, index) => {
    // 按下刪除鍵且當前輸入框為空時，跳到上一個輸入框
    if (e.nativeEvent.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs[index - 1].current?.focus();
    }
  };

  const handleSubmit = async () => {
    const fullCode = code.join('');
    
    if (fullCode.length !== 6) {
      Alert.alert('提示', '請輸入完整的6位數驗證碼');
      return;
    }

    setLoading(true);
    Keyboard.dismiss();

    try {
      // 驗證企業引薦碼
      const response = await ApiService.verifyEnterpriseCode(fullCode);
      
      if (response.success) {
        // 計算效期（1個月後）
        const expiryDate = new Date();
        expiryDate.setMonth(expiryDate.getMonth() + 1);
        
        // 儲存企業引薦碼和效期
        await AsyncStorage.multiSet([
          ['enterpriseCode', fullCode],
          ['enterpriseCodeExpiry', expiryDate.toISOString()],
          ['enterpriseName', response.enterprise?.name || ''],
          ['enterpriseId', response.enterprise?.id || ''],
        ]);
        
        const expiryDateStr = expiryDate.toLocaleDateString('zh-TW', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });

        Alert.alert(
          '驗證成功！',
          `歡迎加入 ${response.enterprise?.name || '企業'} 專屬練習模組\n\n有效期限：${expiryDateStr}`,
          [
            {
              text: '開始使用',
              onPress: () => {
                if (isFromLogin) {
                  // 如果是從登入流程來的，導航到選擇目標頁面
                  navigation.navigate('SelectGoals');
                } else {
                  // 否則返回上一頁
                  navigation.goBack();
                }
              }
            }
          ]
        );
      } else {
        Alert.alert('驗證失敗', response.message || '引薦碼無效或已過期，請檢查後重試');
        setCode(['', '', '', '', '', '']);
        inputRefs[0].current?.focus();
      }
    } catch (error) {
      console.error('驗證失敗:', error);
      Alert.alert('錯誤', '驗證失敗，請稍後再試');
      setCode(['', '', '', '', '', '']);
      inputRefs[0].current?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    if (isFromLogin) {
      // 從登入流程跳過，繼續到選擇目標
      navigation.navigate('SelectGoals');
    } else {
      // 一般情況，返回上一頁
      navigation.goBack();
    }
  };

  const isComplete = code.every(digit => digit !== '');

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
        <TouchableOpacity 
          style={styles.backButton}
          onPress={handleSkip}
        >
          <Ionicons name="arrow-back" size={24} color="#FFF" />
          <Text style={styles.backText}>返回</Text>
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>企業引薦</Text>
        
        <TouchableOpacity 
          style={styles.skipButton}
          onPress={handleSkip}
        >
          <Text style={styles.skipText}>跳過</Text>
        </TouchableOpacity>
      </LinearGradient>

      {/* Content */}
      <View style={styles.content}>
        <View style={styles.card}>
          <Text style={styles.title}>企業引薦碼</Text>
          
          <Text style={styles.description}>
            輸入6位英數字驗證碼以解鎖企業為您準備的練習模組
          </Text>

          {/* 6個驗證碼輸入框 */}
          <View style={styles.codeContainer}>
            {code.map((digit, index) => (
              <View key={index} style={styles.inputWrapper}>
                <TextInput
                  ref={inputRefs[index]}
                  style={[
                    styles.codeInput,
                    digit && styles.codeInputFilled,
                    focusedIndex === index && !digit && styles.codeInputActive,
                  ]}
                  value={digit}
                  onChangeText={(text) => handleCodeChange(text, index)}
                  onKeyPress={(e) => handleKeyPress(e, index)}
                  onFocus={() => setFocusedIndex(index)}
                  onBlur={() => setFocusedIndex(-1)}
                  keyboardType="default"
                  autoCapitalize="characters"
                  maxLength={1}
                  selectTextOnFocus
                  editable={!loading}
                />
              </View>
            ))}
          </View>

          {/* 完成按鈕 */}
          <TouchableOpacity 
            style={[
              styles.submitButton,
              isComplete && styles.submitButtonActive,
            ]}
            onPress={handleSubmit}
            disabled={!isComplete || loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={[
                styles.submitButtonText,
                isComplete && { color: '#FFF' }
              ]}>
                完成
              </Text>
            )}
          </TouchableOpacity>

          {/* 提示文字 */}
          <Text style={styles.hintText}>
            沒有企業引薦碼？您仍可以使用所有基本練習功能
          </Text>

          {/* 效期說明 */}
          <View style={styles.expiryInfo}>
            <Ionicons name="information-circle-outline" size={16} color="#9CA3AF" />
            <Text style={styles.expiryText}>
              企業引薦碼有效期為1個月，到期後將無法存取專屬內容
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  backText: {
    fontSize: 16,
    color: '#FFF',
    fontWeight: '500',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
  },
  skipButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  skipText: {
    fontSize: 16,
    color: '#FFF',
    fontWeight: '500',
  },

  // Content
  content: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  card: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#FFF',
    borderRadius: 32,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 10,
  },

  // Title & Description
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
    textAlign: 'center',
  },
  description: {
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 40,
  },

  // Code Input
  codeContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 40,
    width: '100%',
    paddingHorizontal: 8,
  },
  inputWrapper: {
    flex: 1,
    maxWidth: 56,
  },
  codeInput: {
    width: '100%',
    height: 64,
    borderRadius: 16,
    borderWidth: 2.5,
    borderColor: '#E5E7EB',
    backgroundColor: '#FAFBFC',
    fontSize: 28,
    fontWeight: '700',
    color: '#1F2937',
    textAlign: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  codeInputActive: {
    borderColor: '#166CB5',
    borderWidth: 3,
    backgroundColor: '#FFF',
    shadowColor: '#166CB5',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  codeInputFilled: {
    borderColor: '#166CB5',
    backgroundColor: '#EFF6FF',
    borderWidth: 2.5,
    shadowColor: '#166CB5',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },

  // Submit Button
  submitButton: {
    width: '100%',
    paddingVertical: 18,
    borderRadius: 16,
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  submitButtonActive: {
    backgroundColor: '#166CB5',
    shadowColor: '#166CB5',
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  submitButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#9CA3AF',
  },
  submitButtonTextDisabled: {
    color: '#9CA3AF',
  },

  // Hint
  hintText: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 16,
  },

  // Expiry Info
  expiryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
  },
  expiryText: {
    fontSize: 12,
    color: '#9CA3AF',
    lineHeight: 16,
    flex: 1,
  },
});

export default EnterpriseCode;