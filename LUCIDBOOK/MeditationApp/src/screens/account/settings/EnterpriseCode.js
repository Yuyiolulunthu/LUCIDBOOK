// ==========================================
// 檔案名稱: EnterpriseCode.js
// 功能: 企業引薦碼輸入頁面
// 
// ✅ 6個英數字輸入框
// ✅ 自動焦點切換
// ✅ 效期檢查（1個月）
// ✅ 完成按鈕驗證
// ✅ 完全符合設計圖風格
// 🎨 白色圓角卡片設計
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

  // 獲取導航參數
  const isFromLogin = route?.params?.fromLogin || false;
  const isFromSettings = route?.params?.fromSettings || false;
  const isFromManagement = route?.params?.fromManagement || false;

  // 🔍 調試：打印參數
  useEffect(() => {
    console.log('EnterpriseCode params:', { 
      isFromLogin, 
      isFromSettings, 
      isFromManagement 
    });
  }, [isFromLogin, isFromSettings, isFromManagement]);

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
    // 轉換為大寫
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
              onPress: () => handleNavigationAfterSuccess()
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

  // 成功後導航邏輯
  const handleNavigationAfterSuccess = () => {
    console.log('🎯 handleNavigationAfterSuccess called');
    
    if (isFromLogin) {
      console.log('✅ From login → navigating to SelectGoals');
      navigation.navigate('SelectGoals', { fromLogin: true });
      
    } else if (isFromManagement) {
      console.log('✅ From management → going back');
      navigation.goBack();
      
    } else if (isFromSettings) {
      console.log('✅ From settings → going back');
      navigation.goBack();
      
    } else {
      console.log('✅ Default → attempting to navigate home');
      if (navigation.canGoBack()) {
        navigation.goBack();
      } else {
        try {
          navigation.reset({
            index: 0,
            routes: [{ name: 'MainTabs' }],
          });
        } catch (error) {
          console.error('Navigation failed:', error);
        }
      }
    }
  };

  // 跳過邏輯
  const handleSkip = () => {
    console.log('🔄 handleSkip called');
    
    if (isFromLogin) {
      console.log('✅ Skip from login → navigating to SelectGoals');
      navigation.navigate('SelectGoals', { fromLogin: true });
      
    } else if (isFromManagement) {
      console.log('✅ Skip from management → going back');
      navigation.goBack();
      
    } else if (isFromSettings) {
      console.log('✅ Skip from settings → going back');
      navigation.goBack();
      
    } else {
      console.log('✅ Default skip → attempting to navigate home');
      if (navigation.canGoBack()) {
        navigation.goBack();
      } else {
        try {
          navigation.reset({
            index: 0,
            routes: [{ name: 'MainTabs' }],
          });
        } catch (error) {
          console.error('Navigation failed:', error);
        }
      }
    }
  };

  const isComplete = code.every(digit => digit !== '');

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#166CB5" />
      
      {/* 漸層背景 */}
      <LinearGradient
        colors={['#166CB5', '#1E7BC7', '#31C6FE']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientBackground}
      >
        {/* 背景網格圖案 */}
        <View style={styles.backgroundPattern} />

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={handleSkip}
          >
            <Ionicons name="arrow-back" size={20} color="rgba(255,255,255,0.8)" />
            <Text style={styles.backText}>返回</Text>
          </TouchableOpacity>
          
          <Text style={styles.headerTitle}>企業引薦</Text>
          
          <TouchableOpacity 
            style={styles.skipButton}
            onPress={handleSkip}
          >
            <Text style={styles.skipText}>跳過</Text>
          </TouchableOpacity>
        </View>

        {/* 白色卡片區域 */}
        <View style={styles.cardContainer}>
          <View style={styles.card}>
            {/* 標題 */}
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
                <ActivityIndicator color={isComplete ? '#FFF' : '#9CA3AF'} />
              ) : (
                <Text style={[
                  styles.submitButtonText,
                  isComplete && styles.submitButtonTextActive
                ]}>
                  完成
                </Text>
              )}
            </TouchableOpacity>

            {/* 提示文字 */}
            <Text style={styles.hintText}>
              沒有企業引薦碼？您仍可以使用所有基本練習功能
            </Text>
          </View>
        </View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  // 漸層背景
  gradientBackground: {
    flex: 1,
  },

  // 背景圖案
  backgroundPattern: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.3,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingBottom: 24,
    paddingHorizontal: 20,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  backText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '400',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFF',
  },
  skipButton: {
    paddingHorizontal: 4,
    paddingVertical: 4,
  },
  skipText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '400',
  },

  // 白色卡片容器
  cardContainer: {
    flex: 1,
  },
  card: {
    flex: 1,
    backgroundColor: '#FFF',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 24,
    paddingTop: 48,
    shadowColor: '#212529',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 10,
  },

  // Title & Description
  title: {
    fontSize: 28,
    fontWeight: '400',
    color: '#212529',
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  description: {
    fontSize: 15,
    color: '#6B7280',
    lineHeight: 22,
    marginBottom: 48,
  },

  // Code Input
  codeContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 48,
    paddingHorizontal: 8,
  },
  inputWrapper: {
    flex: 1,
    maxWidth: 56,
  },
  codeInput: {
    width: '100%',
    height: 64,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#DEE2E6',
    backgroundColor: '#F8F9FA',
    fontSize: 24,
    fontWeight: '500',
    color: '#1F2937',
    textAlign: 'center',
  },
  codeInputActive: {
    borderColor: '#166CB5',
    backgroundColor: '#FFF',
    shadowColor: '#166CB5',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 8,
    elevation: 4,
    transform: [{ scale: 1.05 }],
  },
  codeInputFilled: {
    borderColor: 'rgba(22, 108, 181, 0.4)',
    backgroundColor: '#FFF',
  },

  // Submit Button
  submitButton: {
    width: '100%',
    paddingVertical: 18,
    borderRadius: 20,
    backgroundColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  submitButtonActive: {
    backgroundColor: '#166CB5',
    shadowColor: '#166CB5',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 6,
  },
  submitButtonText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#6B7280',
  },
  submitButtonTextActive: {
    color: '#FFF',
  },

  // Hint
  hintText: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default EnterpriseCode;