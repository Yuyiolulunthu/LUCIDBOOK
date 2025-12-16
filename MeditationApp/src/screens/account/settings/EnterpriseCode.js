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
// 🆕 必填模式（從註冊/登入進入時不能跳過）
// 🆕 Onboarding Modal
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
  Modal,
  Dimensions,
  FlatList,
  Animated,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ApiService from '../../../../api';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const MODAL_WIDTH = SCREEN_WIDTH - 48;

// ==========================================
// Onboarding Modal 內容
// ==========================================
const ONBOARDING_PAGES = [
  {
    id: '1',
    icon: 'heart-outline',
    title: '歡迎加入 LUCIDBOOK',
    description: '這是一個專為您打造的心靈練習空間，\n幫助您找到內心的平靜與專注。',
    highlight: '每天只需幾分鐘，讓自己更好',
  },
  {
    id: '2',
    icon: 'sparkles-outline',
    title: '開始您的旅程',
    description: '透過冥想、呼吸練習和正念引導，\n逐步建立健康的心理習慣。',
    highlight: '準備好了嗎？讓我們開始吧！',
  },
];

// ==========================================
// Onboarding Modal Component
// ==========================================
const OnboardingModal = ({ visible, onComplete }) => {
  const [currentPage, setCurrentPage] = useState(0);
  const flatListRef = useRef(null);
  const scrollX = useRef(new Animated.Value(0)).current;

  const handleNext = () => {
    if (currentPage < ONBOARDING_PAGES.length - 1) {
      flatListRef.current?.scrollToIndex({
        index: currentPage + 1,
        animated: true,
      });
      setCurrentPage(currentPage + 1);
    } else {
      onComplete();
    }
  };

  const handleMomentumScrollEnd = (event) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / MODAL_WIDTH);
    setCurrentPage(index);
  };

  const renderPage = ({ item }) => (
    <View style={modalStyles.pageContainer}>
      <View style={modalStyles.iconContainer}>
        <LinearGradient
          colors={['#166CB5', '#31C6FE']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={modalStyles.iconGradient}
        >
          <Ionicons name={item.icon} size={48} color="#FFFFFF" />
        </LinearGradient>
      </View>
      <Text style={modalStyles.pageTitle}>{item.title}</Text>
      <Text style={modalStyles.pageDescription}>{item.description}</Text>
      <View style={modalStyles.highlightContainer}>
        <Ionicons name="star" size={16} color="#F59E0B" />
        <Text style={modalStyles.highlightText}>{item.highlight}</Text>
      </View>
    </View>
  );

  const renderPagination = () => (
    <View style={modalStyles.pagination}>
      {ONBOARDING_PAGES.map((_, index) => {
        const inputRange = [
          (index - 1) * MODAL_WIDTH,
          index * MODAL_WIDTH,
          (index + 1) * MODAL_WIDTH,
        ];
        const dotWidth = scrollX.interpolate({
          inputRange,
          outputRange: [8, 24, 8],
          extrapolate: 'clamp',
        });
        const opacity = scrollX.interpolate({
          inputRange,
          outputRange: [0.4, 1, 0.4],
          extrapolate: 'clamp',
        });
        return (
          <Animated.View
            key={index}
            style={[modalStyles.paginationDot, { width: dotWidth, opacity }]}
          />
        );
      })}
    </View>
  );

  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent>
      <View style={modalStyles.overlay}>
        <View style={modalStyles.modalContainer}>
          <Animated.FlatList
            ref={flatListRef}
            data={ONBOARDING_PAGES}
            renderItem={renderPage}
            keyExtractor={(item) => item.id}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            bounces={false}
            onMomentumScrollEnd={handleMomentumScrollEnd}
            onScroll={Animated.event(
              [{ nativeEvent: { contentOffset: { x: scrollX } } }],
              { useNativeDriver: false }
            )}
            scrollEventThrottle={16}
            getItemLayout={(_, index) => ({
              length: MODAL_WIDTH,
              offset: MODAL_WIDTH * index,
              index,
            })}
          />
          {renderPagination()}
          <View style={modalStyles.buttonContainer}>
            <TouchableOpacity
              style={modalStyles.nextButtonContainer}
              onPress={handleNext}
              activeOpacity={0.9}
            >
              <LinearGradient
                colors={['#166CB5', '#31C6FE']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={modalStyles.nextButton}
              >
                <Text style={modalStyles.nextButtonText}>
                  {currentPage === ONBOARDING_PAGES.length - 1 ? '開始體驗' : '下一步'}
                </Text>
                <Ionicons
                  name={currentPage === ONBOARDING_PAGES.length - 1 ? 'checkmark-circle' : 'arrow-forward'}
                  size={20}
                  color="#FFFFFF"
                />
              </LinearGradient>
            </TouchableOpacity>
          </View>
          <Text style={modalStyles.pageIndicator}>
            {currentPage + 1} / {ONBOARDING_PAGES.length}
          </Text>
        </View>
      </View>
    </Modal>
  );
};

// ==========================================
// Main Component
// ==========================================
const EnterpriseCode = ({ navigation, route }) => {
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(0);
  const [showOnboarding, setShowOnboarding] = useState(false);
  
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
  const isFromRegister = route?.params?.fromRegister || false;
  const isFromSettings = route?.params?.fromSettings || false;
  const isFromManagement = route?.params?.fromManagement || false;
  
  // 🆕 必填模式：從註冊或登入進入時，不能跳過
  const isRequired = route?.params?.isRequired || false;
  
  // 🆕 保存的表單資料（從註冊頁面返回時使用）
  const savedFormData = route?.params?.savedFormData || null;

  useEffect(() => {
    console.log('EnterpriseCode params:', { 
      isFromLogin, 
      isFromRegister,
      isFromSettings, 
      isFromManagement,
      isRequired,
    });
  }, [isFromLogin, isFromRegister, isFromSettings, isFromManagement, isRequired]);

  useEffect(() => {
    setTimeout(() => {
      inputRefs[0].current?.focus();
    }, 300);
  }, []);

  const handleCodeChange = (text, index) => {
    if (text && !/^[0-9a-zA-Z]$/.test(text)) {
      return;
    }

    const newCode = [...code];
    newCode[index] = text.toUpperCase();
    setCode(newCode);

    if (text && index < 5) {
      inputRefs[index + 1].current?.focus();
    }
  };

  const handleKeyPress = (e, index) => {
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
      const response = await ApiService.verifyEnterpriseCode(fullCode);
      
      if (response.success) {
        const expiryDate = new Date();
        expiryDate.setMonth(expiryDate.getMonth() + 1);
        
        await AsyncStorage.multiSet([
          ['enterpriseCode', fullCode],
          ['enterpriseCodeExpiry', expiryDate.toISOString()],
          ['enterpriseName', response.enterprise?.name || ''],
          ['enterpriseId', response.enterprise?.id || ''],
        ]);

        // 🆕 如果是從註冊或登入進入（必填模式），顯示 Onboarding
        if (isRequired || isFromRegister || isFromLogin) {
          setShowOnboarding(true);
        } else {
          // 其他情況顯示成功訊息
          const expiryDateStr = expiryDate.toLocaleDateString('zh-TW', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          });

          Alert.alert(
            '驗證成功！',
            `歡迎加入 ${response.enterprise?.name || '企業'} 專屬練習模組\n\n有效期限：${expiryDateStr}`,
            [{ text: '開始使用', onPress: () => handleNavigationAfterSuccess() }]
          );
        }
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

  // 🆕 Onboarding 完成後的處理
  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
    
    // 直接進入首頁
    navigation.reset({
      index: 0,
      routes: [{ name: 'Home' }],
    });
  };

  const handleNavigationAfterSuccess = () => {
    console.log('🎯 handleNavigationAfterSuccess called');
    
    if (isFromLogin || isFromRegister) {
      console.log('✅ From login/register → navigating to Home');
      navigation.reset({
        index: 0,
        routes: [{ name: 'Home' }],
      });
      
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
        navigation.reset({
          index: 0,
          routes: [{ name: 'Home' }],
        });
      }
    }
  };

  // 🆕 返回按鈕處理（必填模式需要確認）
  const handleBack = () => {
    if (isRequired) {
      // 必填模式：顯示確認對話框
      Alert.alert(
        '確認離開',
        '您尚未輸入企業引薦碼，若離開將無法使用完整功能。\n\n確定要離開嗎？',
        [
          { text: '繼續輸入', style: 'cancel' },
          { 
            text: '離開', 
            style: 'destructive',
            onPress: () => {
              if (isFromRegister && savedFormData) {
                // 返回註冊頁面，保留表單資料
                navigation.navigate('Register', { savedFormData });
              } else {
                navigation.goBack();
              }
            }
          }
        ]
      );
    } else {
      // 非必填模式：直接返回
      if (isFromRegister && savedFormData) {
        navigation.navigate('Register', { savedFormData });
      } else {
        navigation.goBack();
      }
    }
  };

  // 🆕 跳過按鈕處理
  const handleSkip = () => {
    if (isRequired) {
      // 必填模式：不能跳過，顯示提示
      Alert.alert(
        '需要企業引薦碼',
        '請輸入企業引薦碼以繼續使用。\n\n如果您沒有引薦碼，請聯繫您的企業管理員。',
        [{ text: '好的', style: 'default' }]
      );
      return;
    }
    
    // 非必填模式：可以跳過
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
        navigation.reset({
          index: 0,
          routes: [{ name: 'Home' }],
        });
      }
    }
  };

  const isComplete = code.every(digit => digit !== '');

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#166CB5" />
      
      <LinearGradient
        colors={['#166CB5', '#1E7BC7', '#31C6FE']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientBackground}
      >
        <View style={styles.backgroundPattern} />

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={handleBack}
          >
            <Ionicons name="arrow-back" size={20} color="rgba(255,255,255,0.8)" />
            <Text style={styles.backText}>返回</Text>
          </TouchableOpacity>
          
          <Text style={styles.headerTitle}>企業引薦</Text>
          
          {/* 🆕 必填模式時隱藏跳過按鈕 */}
          {!isRequired ? (
            <TouchableOpacity 
              style={styles.skipButton}
              onPress={handleSkip}
            >
              <Text style={styles.skipText}>跳過</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.skipButton}>
              <Text style={[styles.skipText, { opacity: 0 }]}>跳過</Text>
            </View>
          )}
        </View>

        {/* 白色卡片區域 */}
        <View style={styles.cardContainer}>
          <View style={styles.card}>
            <Text style={styles.title}>企業引薦碼</Text>
            
            <Text style={styles.description}>
              {isRequired 
                ? '請輸入6位英數字驗證碼以完成註冊流程'
                : '輸入6位英數字驗證碼以解鎖企業為您準備的練習模組'
              }
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

            {/* 🆕 提示文字根據模式不同 */}
            <Text style={styles.hintText}>
              {isRequired 
                ? '如果您沒有引薦碼，請聯繫您的企業管理員'
                : '沒有企業引薦碼？您仍可以使用所有基本練習功能'
              }
            </Text>
          </View>
        </View>
      </LinearGradient>

      {/* 🆕 Onboarding Modal */}
      <OnboardingModal
        visible={showOnboarding}
        onComplete={handleOnboardingComplete}
      />
    </View>
  );
};

// ==========================================
// Main Styles
// ==========================================
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradientBackground: {
    flex: 1,
  },
  backgroundPattern: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.3,
  },
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
  hintText: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 20,
  },
});

// ==========================================
// Modal Styles
// ==========================================
const modalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: MODAL_WIDTH,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  pageContainer: {
    width: MODAL_WIDTH,
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 24,
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: 24,
  },
  iconGradient: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#166CB5',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  pageTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 16,
  },
  pageDescription: {
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 20,
  },
  highlightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  highlightText: {
    fontSize: 14,
    color: '#92400E',
    fontWeight: '600',
    marginLeft: 8,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
  },
  paginationDot: {
    height: 8,
    borderRadius: 4,
    backgroundColor: '#166CB5',
    marginHorizontal: 4,
  },
  buttonContainer: {
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
  nextButtonContainer: {
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#166CB5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  pageIndicator: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
    paddingBottom: 20,
  },
});

export default EnterpriseCode;