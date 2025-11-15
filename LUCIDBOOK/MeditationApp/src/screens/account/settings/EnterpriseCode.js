// ==========================================
// 檔案名稱: EnterpriseCode.js
// 功能: 企業引薦碼輸入頁面
// 
// ✅ 4個驗證碼輸入框
// ✅ 自動焦點切換
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

const EnterpriseCode = ({ navigation }) => {
  const [code, setCode] = useState(['', '', '', '']);
  const [loading, setLoading] = useState(false);
  const inputRefs = [useRef(null), useRef(null), useRef(null), useRef(null)];

  useEffect(() => {
    // 自動聚焦第一個輸入框
    setTimeout(() => {
      inputRefs[0].current?.focus();
    }, 300);
  }, []);

  const handleCodeChange = (text, index) => {
    // 只允許數字
    if (text && !/^\d+$/.test(text)) {
      return;
    }

    const newCode = [...code];
    newCode[index] = text;
    setCode(newCode);

    // 自動跳到下一個輸入框
    if (text && index < 3) {
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
    
    if (fullCode.length !== 4) {
      Alert.alert('提示', '請輸入完整的4位數驗證碼');
      return;
    }

    setLoading(true);
    Keyboard.dismiss();

    try {
      // 驗證企業引薦碼
      const response = await ApiService.verifyEnterpriseCode(fullCode);
      
      if (response.success) {
        // 儲存企業引薦碼
        await AsyncStorage.setItem('enterpriseCode', fullCode);
        
        Alert.alert(
          '驗證成功！',
          `歡迎加入 ${response.enterprise?.name || '企業'} 專屬練習模組`,
          [
            {
              text: '開始使用',
              onPress: () => navigation.goBack()
            }
          ]
        );
      } else {
        Alert.alert('驗證失敗', response.message || '引薦碼無效，請檢查後重試');
        setCode(['', '', '', '']);
        inputRefs[0].current?.focus();
      }
    } catch (error) {
      console.error('驗證失敗:', error);
      Alert.alert('錯誤', '驗證失敗，請稍後再試');
      setCode(['', '', '', '']);
      inputRefs[0].current?.focus();
    } finally {
      setLoading(false);
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
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#FFF" />
          <Text style={styles.backText}>返回</Text>
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>企業引薦</Text>
        
        <TouchableOpacity 
          style={styles.skipButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.skipText}>跳過</Text>
        </TouchableOpacity>
      </LinearGradient>

      {/* Content */}
      <View style={styles.content}>
        <View style={styles.card}>
          <Text style={styles.title}>企業引薦碼</Text>
          
          <Text style={styles.description}>
            輸入驗證碼4個數字以解鎖企業為您準備的練習模組
          </Text>

          {/* 4個驗證碼輸入框 */}
          <View style={styles.codeContainer}>
            {code.map((digit, index) => (
              <View key={index} style={styles.inputWrapper}>
                <TextInput
                  ref={inputRefs[index]}
                  style={[
                    styles.codeInput,
                    digit && styles.codeInputFilled,
                    !digit && index === 0 && styles.codeInputActive,
                  ]}
                  value={digit}
                  onChangeText={(text) => handleCodeChange(text, index)}
                  onKeyPress={(e) => handleKeyPress(e, index)}
                  keyboardType="number-pad"
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
              !isComplete && styles.submitButtonDisabled
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
                !isComplete && styles.submitButtonTextDisabled
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
    gap: 16,
    marginBottom: 40,
    width: '100%',
  },
  inputWrapper: {
    flex: 1,
    maxWidth: 70,
  },
  codeInput: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFF',
    fontSize: 32,
    fontWeight: 'bold',
    color: '#111827',
    textAlign: 'center',
  },
  codeInputActive: {
    borderColor: '#166CB5',
    borderWidth: 3,
  },
  codeInputFilled: {
    borderColor: '#166CB5',
    backgroundColor: '#EFF6FF',
  },

  // Submit Button
  submitButton: {
    width: '100%',
    paddingVertical: 18,
    borderRadius: 16,
    backgroundColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  submitButtonDisabled: {
    backgroundColor: '#E5E7EB',
  },
  submitButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFF',
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
  },
});

export default EnterpriseCode;