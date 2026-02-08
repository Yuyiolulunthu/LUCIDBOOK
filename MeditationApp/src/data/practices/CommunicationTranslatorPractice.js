// ==========================================
// 檔案名稱: CommunicationTranslatorPractice.js
// 溝通轉譯器練習 - 非暴力溝通
// 版本: V2.1 - 精確還原設計稿版本
// 更新日期: 2026/02/08
// ==========================================

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  TextInput,
  Keyboard,
  TouchableWithoutFeedback,
  Animated,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  X,
  ArrowRight,
  ArrowLeft,
  Star,
  Check,
  Plus,
  Wind,
  ChevronDown,
  ChevronUp,
  MessageCircle,
  AlertCircle,
  User,
} from 'lucide-react-native';
import ApiService from '../../../api';

// ==========================================
// 自定義滑桿組件
// ==========================================
const CustomSlider = ({ value, onValueChange, min = 0, max = 10 }) => {
  const [containerWidth, setContainerWidth] = useState(300);
  const SLIDER_WIDTH = containerWidth;
  const THUMB_SIZE = 36;
  const TRACK_HEIGHT = 16;

  const [internalValue, setInternalValue] = useState(value);
  const position = useRef(new Animated.Value(((value - min) / (max - min)) * SLIDER_WIDTH)).current;
  const startPosition = useRef(0);
  const isDragging = useRef(false);
  const valueRef = useRef(value);

  useEffect(() => {
    valueRef.current = internalValue;
  }, [internalValue]);

  const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, n));
  const posToValue = (pos) => Math.round((pos / SLIDER_WIDTH) * (max - min) + min);
  const valueToPos = (v) => ((v - min) / (max - min)) * SLIDER_WIDTH;

  const panResponder = useRef(
    require('react-native').PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        isDragging.current = true;
        startPosition.current = valueToPos(valueRef.current);
      },
      onPanResponderMove: (_, gestureState) => {
        let newPos = startPosition.current + gestureState.dx;
        newPos = clamp(newPos, 0, SLIDER_WIDTH);
        position.setValue(newPos);
        const newValue = posToValue(newPos);
        if (newValue !== valueRef.current) {
          valueRef.current = newValue;
          setInternalValue(newValue);
          onValueChange?.(newValue);
        }
      },
      onPanResponderRelease: () => {
        const snapPos = valueToPos(valueRef.current);
        Animated.spring(position, {
          toValue: snapPos,
          damping: 15,
          stiffness: 150,
          useNativeDriver: false,
        }).start(() => {
          isDragging.current = false;
        });
      },
    })
  ).current;

  return (
    <View 
      style={customSliderStyles.container}
      onLayout={(event) => {
        const { width } = event.nativeEvent.layout;
        if (width > 0 && width !== containerWidth) {
          setContainerWidth(width);
        }
      }}
    >
      <View style={[customSliderStyles.track, { height: TRACK_HEIGHT }]} />
      <Animated.View
        style={[
          customSliderStyles.fill,
          {
            height: TRACK_HEIGHT,
            width: position.interpolate({
              inputRange: [0, SLIDER_WIDTH],
              outputRange: [THUMB_SIZE / 2, SLIDER_WIDTH + THUMB_SIZE / 2],
              extrapolate: 'clamp',
            }),
          },
        ]}
      />
      <Animated.View
        {...panResponder.panHandlers}
        style={[
          customSliderStyles.thumb,
          {
            width: THUMB_SIZE,
            height: THUMB_SIZE,
            borderRadius: THUMB_SIZE / 2,
            left: -THUMB_SIZE / 2,
            transform: [{
              translateX: position.interpolate({
                inputRange: [0, SLIDER_WIDTH],
                outputRange: [0, SLIDER_WIDTH],
                extrapolate: 'clamp',
              }),
            }],
          },
        ]}
      />
    </View>
  );
};

const customSliderStyles = StyleSheet.create({
  container: {
    width: '100%',
    maxWidth: 400,
    height: 60,
    justifyContent: 'center',
    position: 'relative',
    alignSelf: 'center',
  },
  track: {
    position: 'absolute',
    left: 0,
    right: 0,
    backgroundColor: '#F5E6DC',
    borderRadius: 8,
  },
  fill: {
    position: 'absolute',
    left: 0,
    backgroundColor: '#FF8C42',
    borderRadius: 8,
    ...Platform.select({
      ios: {
        shadowColor: '#FF8C42',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.4,
        shadowRadius: 4,
      },
      android: { elevation: 3 },
    }),
  },
  thumb: {
    position: 'absolute',
    top: 12,
    backgroundColor: '#FF6B35',
    borderWidth: 4,
    borderColor: '#FFFFFF',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: { elevation: 8 },
    }),
  },
});

// ==========================================
// 進度點組件
// ==========================================
const ProgressDots = ({ currentStep, totalSteps }) => {
  return (
    <View style={styles.progressDots}>
      {[...Array(totalSteps)].map((_, index) => (
        <View
          key={index}
          style={[
            styles.dot,
            index === currentStep && styles.dotActive,
          ]}
        />
      ))}
    </View>
  );
};

// ==========================================
// 主組件
// ==========================================
export default function CommunicationTranslatorPractice({ onBack, navigation }) {
  const [currentPage, setCurrentPage] = useState('welcome');
  const [formData, setFormData] = useState({
    facts: '',
    emotions: [],
    customEmotions: [],
    needs: '',
    request: '',
    postScore: 5,
  });
  const [practiceId, setPracticeId] = useState(null);
  const [startTime, setStartTime] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isTiming, setIsTiming] = useState(false);
  const [isAddingCustomEmotion, setIsAddingCustomEmotion] = useState(false);
  const [customEmotionInput, setCustomEmotionInput] = useState('');
  const [showNeedsTips, setShowNeedsTips] = useState(false);
  const [showRequestTips, setShowRequestTips] = useState(false);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const iconScale = useRef(new Animated.Value(0)).current;
  const [hasCompleted, setHasCompleted] = useState(false);

  // 情緒分類
  const emotionCategories = {
    lowEnergy: {
      label: '低能量',
      emotions: ['難過', '失望', '灰心', '疲憊', '孤單', '無力']
    },
    highIntensity: {
      label: '高漲力',
      emotions: ['生氣', '憤怒', '焦慮', '煩躁', '緊張', '恐慌']
    },
    guilt: {
      label: '內疚類',
      emotions: ['委屈', '尷尬', '內疚', '擔憂', '困惑', '慚愧']
    }
  };

  const needsHints = [
    '生存與安全',
    '關聯與歸屬',
    '自主與效能',
    '意義與價值'
  ];

  const getCurrentStep = () => {
    const stepMap = {
      'welcome': 0, 'intro': 1, 'situation-intro': 2,
      'breathing': 2,
      'facts': 0, 'emotions': 1, 'needs': 2,
      'request': 3, 'summary': 4, 'assessment': 5,
      'recommendations': 5, 'completion': 6,
    };
    return stepMap[currentPage] || 0;
  };

  // Practice 管理
  const initializePractice = async () => {
    try {
      const response = await ApiService.startPractice('溝通轉譯器');
      if (response?.practiceId) {
        setPracticeId(response.practiceId);
        const restoredSeconds = response.accumulatedSeconds ? Number(response.accumulatedSeconds) : 0;
        setElapsedTime(restoredSeconds);
      }
    } catch (e) {
      console.log('初始化練習失敗:', e);
    } finally {
      setStartTime(Date.now());
      setIsTiming(true);
    }
  };

  const saveProgress = async () => {
    if (!practiceId) return;
    try {
      await ApiService.updatePracticeProgress(
        practiceId,
        getCurrentStep(),
        6,
        formData,
        elapsedTime
      );
    } catch (err) {
      console.log('儲存進度失敗:', err);
    }
  };

  const handleComplete = async () => {
    if (hasCompleted) return;
    setHasCompleted(true);

    let totalSeconds = elapsedTime || 60;
    const payloadFormData = { ...formData, timestamp: Date.now() };

    await ApiService.completePractice(practiceId, {
      practice_type: '溝通轉譯器',
      duration: Math.max(1, Math.ceil(totalSeconds / 60)),
      duration_seconds: totalSeconds,
      form_data: payloadFormData,
    });
  };

  // 生命週期
  useEffect(() => {
    if (currentPage === 'intro') initializePractice();
  }, [currentPage]);

  useEffect(() => {
    if (!startTime || !isTiming) return;
    const timer = setInterval(() => setElapsedTime(prev => prev + 1), 1000);
    return () => clearInterval(timer);
  }, [startTime, isTiming]);

  useEffect(() => {
    if (!practiceId || ['completion', 'assessment', 'summary', 'recommendations'].includes(currentPage)) return;
    const interval = setInterval(() => saveProgress(), 10000);
    return () => clearInterval(interval);
  }, [practiceId, currentPage, formData, elapsedTime]);

  useEffect(() => {
    const showListener = Keyboard.addListener('keyboardDidShow', () => setIsKeyboardVisible(true));
    const hideListener = Keyboard.addListener('keyboardDidHide', () => setIsKeyboardVisible(false));
    return () => {
      showListener.remove();
      hideListener.remove();
    };
  }, []);

  useEffect(() => {
    if (currentPage === 'completion') {
      Animated.spring(iconScale, {
        toValue: 1,
        tension: 100,
        friction: 15,
        delay: 200,
        useNativeDriver: true,
      }).start();
    } else {
      iconScale.setValue(0);
    }
  }, [currentPage]);

  // 操作函數
  const handleBackToHome = () => {
    if (navigation) {
      navigation.navigate('MainTabs', { screen: 'Home' });
    } else if (onBack) {
      onBack();
    }
  };

  const handleBack = () => {
    const backMap = {
      'welcome': handleBackToHome,
      'intro': () => setCurrentPage('welcome'),
      'situation-intro': () => setCurrentPage('intro'),
      'breathing': () => setCurrentPage('situation-intro'),
      'facts': () => setCurrentPage('breathing'),
      'emotions': () => setCurrentPage('facts'),
      'needs': () => setCurrentPage('emotions'),
      'request': () => setCurrentPage('needs'),
      'summary': () => setCurrentPage('request'),
      'assessment': () => setCurrentPage('summary'),
      'recommendations': () => setCurrentPage('assessment'),
      'completion': handleBackToHome,
    };
    backMap[currentPage]?.();
  };

  const toggleEmotion = (emotion) => {
    setFormData(prev => ({
      ...prev,
      emotions: prev.emotions.includes(emotion)
        ? prev.emotions.filter(e => e !== emotion)
        : [...prev.emotions, emotion]
    }));
  };

  const handleAddCustomEmotion = () => {
    const inputValue = customEmotionInput.trim();
    if (!inputValue) return;
    const allEmotions = [...emotionCategories.lowEnergy.emotions, ...emotionCategories.highIntensity.emotions, ...emotionCategories.guilt.emotions];
    if (!allEmotions.includes(inputValue) && !formData.customEmotions.includes(inputValue)) {
      setFormData(prev => ({
        ...prev,
        customEmotions: [...prev.customEmotions, inputValue],
        emotions: [...prev.emotions, inputValue]
      }));
    }
    setIsAddingCustomEmotion(false);
    setCustomEmotionInput('');
  };

  // ==========================================
  // 頁面渲染
  // ==========================================

  // 1. 歡迎頁
  const renderWelcomePage = () => (
    <View style={styles.fullScreen}>
      <LinearGradient colors={['#FFF4ED', '#FFE8DB']} style={styles.gradientBg}>
        <TouchableOpacity onPress={handleBackToHome} style={styles.closeButtonAbsolute}>
          <X size={24} color="#FF8C42" />
        </TouchableOpacity>

        <View style={styles.welcomeContent}>
          <View style={styles.welcomeIconContainer}>
            <View style={styles.welcomeIconCircle}>
              <MessageCircle size={48} color="#FF8C42" />
            </View>
          </View>

          <ProgressDots currentStep={0} totalSteps={3} />

          <Text style={styles.welcomeTitle}>哈囉！{'\n'}歡迎來到溝通轉譯器</Text>

          <View style={styles.welcomeDescription}>
            <Text style={styles.welcomeText}>我們一起來練習</Text>
            <Text style={[styles.welcomeText, styles.highlightOrange]}>非暴力溝通</Text>
            <Text style={[styles.welcomeText, { marginTop: 16 }]}>
              透過練習把混亂的情緒{'\n'}
              化為具體觀察、感受、需求與表達
            </Text>
            <Text style={[styles.welcomeText, { marginTop: 16 }]}>
              這個練習能夠幫助你提升溝通效率{'\n'}
              也能降低溝通的攻擊性{'\n'}
              讓對方聽見你真實的心聲
            </Text>
          </View>

          <TouchableOpacity
            style={styles.nextButtonLarge}
            onPress={() => setCurrentPage('intro')}
          >
            <LinearGradient
              colors={['#FF8C42', '#FF6B6B']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.nextButtonGradient}
            >
              <Text style={styles.nextButtonText}>下一頁</Text>
              <ArrowRight size={20} color="#FFFFFF" />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </View>
  );

  // 2. 介紹頁
  const renderIntroPage = () => (
    <View style={styles.fullScreen}>
      <LinearGradient colors={['#FFF4ED', '#FFE8DB']} style={styles.gradientBg}>
        <View style={styles.topButtons}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <ArrowLeft size={24} color="#FF8C42" />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleBackToHome} style={styles.closeButton}>
            <X size={24} color="#FF8C42" />
          </TouchableOpacity>
        </View>

        <View style={styles.welcomeContent}>
          <View style={styles.welcomeIconContainer}>
            <View style={styles.welcomeIconCircle}>
              <MessageCircle size={48} color="#FF8C42" />
            </View>
          </View>

          <ProgressDots currentStep={1} totalSteps={3} />

          <Text style={styles.welcomeTitle}>接下來我們會一起{'\n'}走過這些練習步驟</Text>

          <View style={styles.stepsDescription}>
            <Text style={styles.stepsIntro}>接下來，我們將透過五個步驟</Text>
            <Text style={[styles.stepsIntro, styles.highlightOrange, { fontWeight: '600', marginTop: 8 }]}>
              情境回想　描述事實　表達感受{'\n'}釐清需求　提出請求
            </Text>
            <Text style={[styles.stepsIntro, { marginTop: 8 }]}>為你進行溝通轉譯</Text>
            <Text style={[styles.stepsIntro, { marginTop: 16 }]}>
              這能幫助你將想說的話{'\n'}
              轉譯成明確又不傷害關係的話語
            </Text>
          </View>

          <TouchableOpacity
            style={styles.nextButtonLarge}
            onPress={() => setCurrentPage('situation-intro')}
          >
            <LinearGradient
              colors={['#FF8C42', '#FF6B6B']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.nextButtonGradient}
            >
              <Text style={styles.nextButtonText}>下一頁</Text>
              <ArrowRight size={20} color="#FFFFFF" />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </View>
  );

  // 3. 情境回想介紹頁
  const renderSituationIntroPage = () => (
    <View style={styles.fullScreen}>
      <LinearGradient colors={['#FFF4ED', '#FFE8DB']} style={styles.gradientBg}>
        <View style={styles.topButtons}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <ArrowLeft size={24} color="#FF8C42" />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleBackToHome} style={styles.closeButton}>
            <X size={24} color="#FF8C42" />
          </TouchableOpacity>
        </View>

        <View style={styles.welcomeContent}>
          <View style={styles.welcomeIconContainer}>
            <View style={styles.welcomeIconCircle}>
              <MessageCircle size={48} color="#FF8C42" />
            </View>
          </View>

          <ProgressDots currentStep={2} totalSteps={3} />

          <Text style={styles.pageTitle}>情境回想</Text>

          <Text style={styles.pageDescription}>
            請先回想一個你{'\n'}
            <Text style={styles.highlightOrange}>「想開口溝通，卻不知從何說起」</Text>{'\n'}
            的互動場景
          </Text>

          <TouchableOpacity
            style={styles.nextButtonLarge}
            onPress={() => setCurrentPage('breathing')}
          >
            <LinearGradient
              colors={['#FF8C42', '#FF6B6B']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.nextButtonGradient}
            >
              <Text style={styles.nextButtonText}>下一頁</Text>
              <ArrowRight size={20} color="#FFFFFF" />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </View>
  );

  // 4. 深呼吸頁
  const renderBreathingPage = () => (
    <View style={styles.fullScreen}>
      <LinearGradient colors={['#FFF4ED', '#FFE8DB']} style={styles.gradientBg}>
        <View style={styles.topButtons}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <ArrowLeft size={24} color="#FF8C42" />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleBackToHome} style={styles.closeButton}>
            <X size={24} color="#FF8C42" />
          </TouchableOpacity>
        </View>

        <View style={styles.breathingContent}>
          <View style={styles.breathingIconContainer}>
            <View style={styles.breathingIconCircle}>
              <Wind size={48} color="#FF8C42" />
            </View>
          </View>

          <Text style={styles.breathingTitle}>深呼吸 放鬆</Text>

          <View style={styles.breathingInstructions}>
            <Text style={styles.breathingText}>進行3-5次腹式呼吸</Text>
            <Text style={styles.breathingText}>吸氣4秒，閉氣4秒，呼氣6秒</Text>
            <Text style={styles.breathingText}>讓理性腦回歸主宰</Text>
            <Text style={styles.breathingText}>幫助後面的練習更加順利</Text>
          </View>

          <TouchableOpacity
            style={styles.startBreathingButton}
            onPress={() => setCurrentPage('facts')}
          >
            <LinearGradient
              colors={['#FF8C42', '#FF6B6B']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.nextButtonGradient}
            >
              <Text style={styles.nextButtonText}>開始練習</Text>
              <ArrowRight size={20} color="#FFFFFF" />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </View>
  );

  // 5. 描述事實頁（無書寫提示）
  const renderFactsPage = () => {
    return (
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.fullScreen}>
            <LinearGradient colors={['#FFF4ED', '#FFE8DB']} style={styles.gradientBg}>
              <View style={styles.topButtons}>
                <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                  <ArrowLeft size={24} color="#FF8C42" />
                </TouchableOpacity>
                <TouchableOpacity onPress={handleBackToHome} style={styles.closeButton}>
                  <X size={24} color="#FF8C42" />
                </TouchableOpacity>
              </View>

              <View style={styles.titleSection}>
                <Text style={styles.pageTitleCentered}>描述事實</Text>
                <ProgressDots currentStep={0} totalSteps={6} />
              </View>

              <ScrollView
                contentContainerStyle={[styles.scrollContent, { paddingBottom: isKeyboardVisible ? 200 : 140 }]}
                keyboardShouldPersistTaps="handled"
              >
                <Text style={styles.inputInstruction}>
                  回想一個最近讓你{'\n'}
                  想開口溝通又不知從何說起的互動情境
                </Text>

                <Text style={[styles.inputSubInstruction, styles.highlightOrange]}>
                  試著用客觀的角度描寫{'\n'}
                  「你看到了什麼、你聽到了什麼」
                </Text>

                <Text style={styles.inputSubInstruction}>
                  我們先不使用形容詞標籤{'\n'}
                  只體描述對方的原話、動作、次數等{'\n'}
                  用第三方也會認同此事發生的方式描述
                </Text>

                <View style={styles.inputCard}>
                  <TextInput
                    style={styles.textarea}
                    multiline
                    placeholder="我看到/聽到..."
                    placeholderTextColor="#cbd5e1"
                    value={formData.facts}
                    onChangeText={text => setFormData(prev => ({ ...prev, facts: text }))}
                    textAlignVertical="top"
                  />
                </View>

                <View style={styles.exampleSection}>
                  <Star size={16} color="#fbbf24" fill="#fbbf24" />
                  <Text style={styles.exampleText}>
                    例如：「我看見桌上有三個沒洗的碗」{'\n'}
                    而非：「沒洗碗真的很懶惰」（評價）
                  </Text>
                </View>
              </ScrollView>

              {!isKeyboardVisible && (
                <View style={styles.footer}>
                  <TouchableOpacity
                    style={[styles.nextButton, !formData.facts.trim() && styles.nextButtonDisabled]}
                    onPress={() => {
                      if (formData.facts.trim()) {
                        Keyboard.dismiss();
                        setTimeout(() => setCurrentPage('emotions'), 100);
                      }
                    }}
                    disabled={!formData.facts.trim()}
                  >
                    <LinearGradient
                      colors={formData.facts.trim() ? ['#FF8C42', '#FF6B6B'] : ['#cbd5e1', '#cbd5e1']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.nextButtonGradient}
                    >
                      <Text style={styles.nextButtonText}>下一步</Text>
                      <ArrowRight size={20} color="#FFFFFF" />
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              )}
            </LinearGradient>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    );
  };

  // 6. 表達感受頁（完整分類版）
  const renderEmotionsPage = () => {
    const allEmotions = [
      ...emotionCategories.lowEnergy.emotions,
      ...emotionCategories.highIntensity.emotions,
      ...emotionCategories.guilt.emotions,
      ...formData.customEmotions
    ];
    const hasEmotions = formData.emotions.length > 0;

    return (
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.fullScreen}>
            <LinearGradient colors={['#FFF4ED', '#FFE8DB']} style={styles.gradientBg}>
              <View style={styles.topButtons}>
                <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                  <ArrowLeft size={24} color="#FF8C42" />
                </TouchableOpacity>
                <TouchableOpacity onPress={handleBackToHome} style={styles.closeButton}>
                  <X size={24} color="#FF8C42" />
                </TouchableOpacity>
              </View>

              <View style={styles.titleSection}>
                <Text style={styles.pageTitleCentered}>表達感受</Text>
                <ProgressDots currentStep={1} totalSteps={6} />
              </View>

              <ScrollView
                contentContainerStyle={[styles.scrollContent, { paddingBottom: isKeyboardVisible ? 200 : 140 }]}
                keyboardShouldPersistTaps="handled"
              >
                <Text style={styles.inputInstruction}>
                  對於剛剛寫下的事實{'\n'}
                  你的心裡有什麼感覺？
                </Text>

                <View style={styles.noteContainer}>
                  <AlertCircle size={16} color="#FF8C42" />
                  <Text style={styles.noteText}>
                    請區分感受與想法{'\n'}
                    「我覺得你很過分」是想法{'\n'}
                    「我覺到很傷心」是感受
                  </Text>
                </View>

                <View style={styles.reactionCard}>
                  {/* 低能量 */}
                  <Text style={styles.emotionCategoryLabel}>低能量</Text>
                  <View style={styles.tagsContainer}>
                    {emotionCategories.lowEnergy.emotions.map(emotion => {
                      const isSelected = formData.emotions.includes(emotion);
                      return (
                        <TouchableOpacity
                          key={emotion}
                          style={[styles.tag, isSelected && styles.tagSelected]}
                          onPress={() => toggleEmotion(emotion)}
                        >
                          <Text style={[styles.tagText, isSelected && styles.tagTextSelected]}>
                            {emotion}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>

                  {/* 高漲力 */}
                  <Text style={[styles.emotionCategoryLabel, { marginTop: 20 }]}>高漲力</Text>
                  <View style={styles.tagsContainer}>
                    {emotionCategories.highIntensity.emotions.map(emotion => {
                      const isSelected = formData.emotions.includes(emotion);
                      return (
                        <TouchableOpacity
                          key={emotion}
                          style={[styles.tag, isSelected && styles.tagSelected]}
                          onPress={() => toggleEmotion(emotion)}
                        >
                          <Text style={[styles.tagText, isSelected && styles.tagTextSelected]}>
                            {emotion}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>

                  {/* 內疚類 */}
                  <Text style={[styles.emotionCategoryLabel, { marginTop: 20 }]}>內疚類</Text>
                  <View style={styles.tagsContainer}>
                    {emotionCategories.guilt.emotions.map(emotion => {
                      const isSelected = formData.emotions.includes(emotion);
                      return (
                        <TouchableOpacity
                          key={emotion}
                          style={[styles.tag, isSelected && styles.tagSelected]}
                          onPress={() => toggleEmotion(emotion)}
                        >
                          <Text style={[styles.tagText, isSelected && styles.tagTextSelected]}>
                            {emotion}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>

                  {/* 其他 - 自訂 */}
                  <Text style={[styles.emotionCategoryLabel, { marginTop: 20 }]}>其他</Text>
                  <View style={styles.tagsContainer}>
                    {formData.customEmotions.map(emotion => {
                      const isSelected = formData.emotions.includes(emotion);
                      return (
                        <TouchableOpacity
                          key={emotion}
                          style={[styles.tag, isSelected && styles.tagSelected]}
                          onPress={() => toggleEmotion(emotion)}
                        >
                          <Text style={[styles.tagText, isSelected && styles.tagTextSelected]}>
                            {emotion}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}

                    {!isAddingCustomEmotion ? (
                      <TouchableOpacity
                        style={styles.customTagButton}
                        onPress={() => setIsAddingCustomEmotion(true)}
                      >
                        <Plus size={14} color="#94a3b8" />
                        <Text style={styles.customTagButtonText}>自訂</Text>
                      </TouchableOpacity>
                    ) : (
                      <View style={styles.customInputContainer}>
                        <TextInput
                          style={styles.customInput}
                          value={customEmotionInput}
                          onChangeText={setCustomEmotionInput}
                          placeholder="輸入..."
                          placeholderTextColor="#cbd5e1"
                          autoFocus
                          multiline={true}       
                          numberOfLines={1}            
                          onSubmitEditing={handleAddCustomEmotion}
                          blurOnSubmit={true}           
                        />
                        <TouchableOpacity onPress={handleAddCustomEmotion} style={styles.customCheckButton}>
                          <Check size={14} color="#FFFFFF" />
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => {
                            setIsAddingCustomEmotion(false);
                            setCustomEmotionInput('');
                          }}
                          style={styles.customCloseButton}
                        >
                          <X size={14} color="#94a3b8" />
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                </View>
              </ScrollView>

              {!isKeyboardVisible && (
                <View style={styles.footer}>
                  <TouchableOpacity
                    style={[styles.nextButton, !hasEmotions && styles.nextButtonDisabled]}
                    onPress={() => {
                      if (hasEmotions) {
                        Keyboard.dismiss();
                        setTimeout(() => setCurrentPage('needs'), 100);
                      }
                    }}
                    disabled={!hasEmotions}
                  >
                    <LinearGradient
                      colors={hasEmotions ? ['#FF8C42', '#FF6B6B'] : ['#cbd5e1', '#cbd5e1']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.nextButtonGradient}
                    >
                      <Text style={styles.nextButtonText}>下一步</Text>
                      <ArrowRight size={20} color="#FFFFFF" />
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              )}
            </LinearGradient>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    );
  };

  // 7. 釐清需求頁
  const renderNeedsPage = () => {
    return (
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.fullScreen}>
            <LinearGradient colors={['#FFF4ED', '#FFE8DB']} style={styles.gradientBg}>
              <View style={styles.topButtons}>
                <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                  <ArrowLeft size={24} color="#FF8C42" />
                </TouchableOpacity>
                <TouchableOpacity onPress={handleBackToHome} style={styles.closeButton}>
                  <X size={24} color="#FF8C42" />
                </TouchableOpacity>
              </View>

              <View style={styles.titleSection}>
                <Text style={styles.pageTitleCentered}>釐清需求</Text>
                <ProgressDots currentStep={2} totalSteps={6} />
              </View>

              <ScrollView
                contentContainerStyle={[styles.scrollContent, { paddingBottom: isKeyboardVisible ? 200 : 140 }]}
                keyboardShouldPersistTaps="handled"
              >
                <Text style={styles.inputInstruction}>
                  當你感到不舒服時{'\n'}
                  通常是因為心中某個重要的需求沒有被滿足{'\n'}
                  讓我們試著穿透情緒{'\n'}
                  一起探索你真正在意的是什麼呢？
                </Text>

                <View style={styles.inputCard}>
                  <TextInput
                    style={styles.textarea}
                    multiline
                    placeholder="我在意的點是..."
                    placeholderTextColor="#cbd5e1"
                    value={formData.needs}
                    onChangeText={text => setFormData(prev => ({ ...prev, needs: text }))}
                    textAlignVertical="top"
                  />
                </View>

                <View style={styles.exampleSection}>
                  <Star size={16} color="#fbbf24" fill="#fbbf24" />
                  <Text style={styles.exampleText}>
                    例如：我感到煩躁，因為我需要空間
                  </Text>
                </View>

                <View style={styles.tipsSection}>
                  <TouchableOpacity 
                    onPress={() => setShowNeedsTips(!showNeedsTips)} 
                    style={styles.tipsToggle}
                  >
                    {showNeedsTips ? <ChevronUp size={16} color="#FF8C42" /> : <ChevronDown size={16} color="#FF8C42" />}
                    <Text style={styles.tipsToggleText}>書寫靈感</Text>
                  </TouchableOpacity>

                  {showNeedsTips && (
                    <View style={styles.needsChipsContainer}>
                      {needsHints.map((hint, i) => (
                        <TouchableOpacity
                          key={i}
                          style={styles.needHintChip}
                          onPress={() => {
                            const current = formData.needs;
                            if (!current.includes(hint)) {
                              setFormData(prev => ({
                                ...prev,
                                needs: current ? `${current}、${hint}` : hint
                              }));
                            }
                          }}
                        >
                          <Text style={styles.needHintText}>+ {hint}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </View>
              </ScrollView>

              {!isKeyboardVisible && (
                <View style={styles.footer}>
                  <TouchableOpacity
                    style={[styles.nextButton, !formData.needs.trim() && styles.nextButtonDisabled]}
                    onPress={() => {
                      if (formData.needs.trim()) {
                        Keyboard.dismiss();
                        setTimeout(() => setCurrentPage('request'), 100);
                      }
                    }}
                    disabled={!formData.needs.trim()}
                  >
                    <LinearGradient
                      colors={formData.needs.trim() ? ['#FF8C42', '#FF6B6B'] : ['#cbd5e1', '#cbd5e1']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.nextButtonGradient}
                    >
                      <Text style={styles.nextButtonText}>下一步</Text>
                      <ArrowRight size={20} color="#FFFFFF" />
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              )}
            </LinearGradient>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    );
  };

  // 8. 提出請求頁
  const renderRequestPage = () => {
    const requestTips = [
      '用肯定的語句：說出「想要什麼」，而非「不想要什麼」。',
      '具體明確：包含時間、地點或具體動作。',
      '具體明確：保留彈性的空間：請求不是命令，若對方無法合應，我們的願意清通。',
    ];

    return (
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.fullScreen}>
            <LinearGradient colors={['#FFF4ED', '#FFE8DB']} style={styles.gradientBg}>
              <View style={styles.topButtons}>
                <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                  <ArrowLeft size={24} color="#FF8C42" />
                </TouchableOpacity>
                <TouchableOpacity onPress={handleBackToHome} style={styles.closeButton}>
                  <X size={24} color="#FF8C42" />
                </TouchableOpacity>
              </View>

              <View style={styles.titleSection}>
                <Text style={styles.pageTitleCentered}>提出請求</Text>
                <ProgressDots currentStep={3} totalSteps={6} />
              </View>

              <ScrollView
                contentContainerStyle={[styles.scrollContent, { paddingBottom: isKeyboardVisible ? 200 : 140 }]}
                keyboardShouldPersistTaps="handled"
              >
                <Text style={styles.inputInstruction}>
                  試著為你的需求提出{'\n'}
                  正向、具體、可執行的請求
                </Text>

                <View style={styles.inputCard}>
                  <TextInput
                    style={styles.textarea}
                    multiline
                    placeholder="可不可以請你..."
                    placeholderTextColor="#cbd5e1"
                    value={formData.request}
                    onChangeText={text => setFormData(prev => ({ ...prev, request: text }))}
                    textAlignVertical="top"
                  />
                </View>

                <View style={styles.exampleSection}>
                  <Star size={16} color="#fbbf24" fill="#fbbf24" />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.exampleText}>例如：</Text>
                    <Text style={styles.exampleText}>
                      模糊的說法：你可以主動洗碗嗎？{'\n'}
                      具體的說法：你可以在晚餐結束半小時內，把水槽裡的碗洗乾淨嗎？
                    </Text>
                  </View>
                </View>

                <View style={styles.tipsSection}>
                  <TouchableOpacity 
                    onPress={() => setShowRequestTips(!showRequestTips)} 
                    style={styles.tipsToggle}
                  >
                    {showRequestTips ? <ChevronUp size={16} color="#FF8C42" /> : <ChevronDown size={16} color="#FF8C42" />}
                    <Text style={styles.tipsToggleText}>書寫小撇步</Text>
                  </TouchableOpacity>

                  {showRequestTips && (
                    <View style={styles.hintsContent}>
                      {requestTips.map((hint, i) => (
                        <View key={i} style={styles.tipItem}>
                          <View style={styles.tipBullet} />
                          <Text style={styles.tipText}>{hint}</Text>
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              </ScrollView>

              {!isKeyboardVisible && (
                <View style={styles.footer}>
                  <TouchableOpacity
                    style={[styles.nextButton, !formData.request.trim() && styles.nextButtonDisabled]}
                    onPress={() => {
                      if (formData.request.trim()) {
                        Keyboard.dismiss();
                        setTimeout(() => setCurrentPage('summary'), 100);
                      }
                    }}
                    disabled={!formData.request.trim()}
                  >
                    <LinearGradient
                      colors={formData.request.trim() ? ['#FF8C42', '#FF6B6B'] : ['#cbd5e1', '#cbd5e1']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.nextButtonGradient}
                    >
                      <Text style={styles.nextButtonText}>下一步</Text>
                      <ArrowRight size={20} color="#FFFFFF" />
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              )}
            </LinearGradient>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    );
  };

  // 9. 記錄統整頁（保留）
  const renderSummaryPage = () => (
    <View style={styles.fullScreen}>
      <LinearGradient colors={['#FFF4ED', '#FFE8DB']} style={styles.gradientBg}>
        <View style={styles.topButtons}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <ArrowLeft size={24} color="#FF8C42" />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleBackToHome} style={styles.closeButton}>
            <X size={24} color="#FF8C42" />
          </TouchableOpacity>
        </View>

        <View style={styles.summaryContainer}>
          <Text style={styles.summaryTitle}>記錄統整</Text>

          <ScrollView 
            style={styles.summaryScrollView}
            contentContainerStyle={styles.summaryScrollContent}
            showsVerticalScrollIndicator={false}
          >
            {formData.facts && (
              <View style={styles.summarySection}>
                <Text style={styles.summarySectionTitle}>客觀描述</Text>
                <Text style={styles.summarySectionContent}>{formData.facts}</Text>
              </View>
            )}

            {formData.emotions.length > 0 && (
              <View style={styles.summarySection}>
                <Text style={styles.summarySectionTitle}>感受</Text>
                <Text style={styles.summarySectionContent}>{formData.emotions.join('、')}</Text>
              </View>
            )}

            {formData.needs && (
              <View style={styles.summarySection}>
                <Text style={styles.summarySectionTitle}>需求</Text>
                <Text style={styles.summarySectionContent}>{formData.needs}</Text>
              </View>
            )}

            {formData.request && (
              <View style={styles.summarySection}>
                <Text style={styles.summarySectionTitle}>請求</Text>
                <Text style={styles.summarySectionContent}>{formData.request}</Text>
              </View>
            )}
          </ScrollView>

          <View style={styles.summaryFooter}>
            <TouchableOpacity
              style={styles.summaryButton}
              onPress={() => setCurrentPage('assessment')}
            >
              <LinearGradient
                colors={['#FF8C42', '#FF6B6B']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.nextButtonGradient}
              >
                <Text style={styles.nextButtonText}>下一步</Text>
                <ArrowRight size={20} color="#FFFFFF" />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>
    </View>
  );

  // 10. 評估頁
  const renderAssessmentPage = () => (
    <View style={styles.fullScreen}>
      <LinearGradient colors={['#FFF4ED', '#FFE8DB']} style={styles.gradientBg}>
        <View style={styles.assessmentContent}>
          <View style={styles.assessmentCard}>
            <LinearGradient colors={['#FF8C42', '#FF6B35']} style={styles.assessmentAccentBar} />

            <TouchableOpacity onPress={handleBack} style={styles.assessmentBackButton}>
              <ArrowLeft size={20} color="#64748b" />
            </TouchableOpacity>

            <Text style={styles.assessmentTitle}>練習後的狀態核對</Text>
            <Text style={styles.assessmentSubtitle}>原本情緒張力的改善程度？</Text>

            <View style={styles.scoreDisplay}>
              <Text style={styles.scoreNumber}>{formData.postScore}</Text>
              <Text style={styles.scoreTotal}>/10</Text>
            </View>

            <View style={styles.sliderWrapper}>
              <CustomSlider
                value={formData.postScore}
                onValueChange={(value) => setFormData(prev => ({ ...prev, postScore: value }))}
                min={0}
                max={10}
              />

              <View style={styles.sliderLabels}>
                <Text style={styles.sliderLabel}>完全沒有</Text>
                <Text style={styles.sliderLabel}>顯著改善</Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.assessmentButton}
              onPress={() => {
                // ✅ 在進入 recommendations 前自動生成翻譯訊息
                const translatedMessage = [
                  formData.facts && `我看到/聽到：${formData.facts}`,
                  formData.emotions.length > 0 && `這讓我感到${formData.emotions.join('、')}`,
                  formData.needs && `因為我需要${formData.needs}`,
                  formData.request && `所以我想請你${formData.request}`
                ].filter(Boolean).join('。');
                
                // 更新 formData 包含 translation
                setFormData(prev => ({ ...prev, translation: translatedMessage }));
                
                // 進入下一頁
                setCurrentPage('recommendations');
              }}
            >
              <LinearGradient colors={['#FF8C42', '#FF6B35']} style={styles.assessmentButtonGradient}>
                <Text style={styles.assessmentButtonText}>完成紀錄</Text>
                <ArrowRight size={20} color="#FFFFFF" />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>
    </View>
  );

  // 11. 接下來你可以頁面（無白色卡片，圖片在最下方）
  const renderRecommendationsPage = () => (
    <View style={styles.fullScreen}>
      <LinearGradient colors={['#FFF4ED', '#FFE8DB']} style={styles.gradientBg}>
        <View style={styles.topButtons}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <ArrowLeft size={24} color="#FF8C42" />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleBackToHome} style={styles.closeButton}>
            <X size={24} color="#FF8C42" />
          </TouchableOpacity>
        </View>

        <View style={styles.recommendationsContainer}>
          <View style={styles.recommendationsTitleSection}>
            <Text style={styles.recommendationsTitle}>接下來，你可以...</Text>
            <ProgressDots currentStep={5} totalSteps={6} />
          </View>

          <ScrollView 
            style={styles.recommendationsScrollView}
            contentContainerStyle={styles.recommendationsScrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* 練習開口 */}
            <View style={styles.recommendationItem}>
              <View style={[styles.recommendationIconCircle, { backgroundColor: '#DBEAFE' }]}>
                <MessageCircle size={24} color="#3B82F6" />
              </View>
              <View style={styles.recommendationTextContainer}>
                <Text style={styles.recommendationTitle}>練習開口</Text>
                <Text style={styles.recommendationDescription}>
                  在心情平穩時，試著將這段話分享給對方。
                </Text>
              </View>
            </View>

            {/* 自我對話 */}
            <View style={styles.recommendationItem}>
              <View style={[styles.recommendationIconCircle, { backgroundColor: '#F3E8FF' }]}>
                <User size={24} color="#A855F7" />
              </View>
              <View style={styles.recommendationTextContainer}>
                <Text style={styles.recommendationTitle}>自我對話</Text>
                <Text style={styles.recommendationDescription}>
                  如果對方不在身邊或不適合溝通，這份翻譯也能幫助你安撫內在的委屈。
                </Text>
              </View>
            </View>

            {/* 4-6 呼吸練習 */}
            <View style={styles.recommendationItem}>
              <View style={[styles.recommendationIconCircle, { backgroundColor: '#D1FAE5' }]}>
                <Wind size={24} color="#10B981" />
              </View>
              <View style={styles.recommendationTextContainer}>
                <Text style={styles.recommendationTitle}>4-6 呼吸練習</Text>
                <Text style={styles.recommendationDescription}>
                  讓剛整理完思緒的身心徹底放鬆，慢慢吸氣四秒，吐氣六秒。
                </Text>
              </View>
            </View>

            {/* 圖片在最下方 */}
            <Image
              source={require('../../../assets/images/CommunicateTrensfor.jpg')}
              style={styles.recommendationImage}
              resizeMode="cover"
            />
          </ScrollView>

          <View style={styles.recommendationsFooter}>
            <TouchableOpacity
              style={styles.recommendationsButton}
              onPress={async () => {
                try {
                  setIsTiming(false);
                  await handleComplete();
                  await new Promise(resolve => setTimeout(resolve, 300));
                  setCurrentPage('completion');
                } catch (error) {
                  console.error('❌ 完成練習失敗:', error);
                  setCurrentPage('completion');
                }
              }}
            >
              <LinearGradient
                colors={['#FF8C42', '#FF6B6B']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.nextButtonGradient}
              >
                <Text style={styles.nextButtonText}>完成練習</Text>
                <ArrowRight size={20} color="#FFFFFF" />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>
    </View>
  );

  // 12. 完成頁
  const renderCompletionPage = () => {
    const handleViewJournal = () => {
      navigation.navigate('MainTabs', {
        screen: 'Daily',
        params: { 
          highlightPracticeId: practiceId,
          forceRefresh: true
        }
      });
    };

    return (
      <View style={styles.fullScreen}>
        <LinearGradient colors={['#FFF4ED', '#FFE8DB']} style={styles.gradientBg}>
          <View style={styles.completionContent}>
            <Animated.View
              style={[
                styles.completionIconContainer,
                { transform: [{ scale: iconScale }] }
              ]}
            >
              <View style={styles.completion2IconCircle}>
                <View style={styles.completion2StarBadge}>
                  <Star size={20} color="#FFFFFF" fill="#FFFFFF" />
                </View>
                <MessageCircle size={48} color="#FF8C42" />
              </View>
            </Animated.View>

            <Text style={styles.completion2Title}>你做得很好</Text>

            <Text style={styles.completion2Subtitle}>
              每一次練習{'\n'}
              都讓你更了解自己的需求{'\n'}
              也能更清晰的表達自己的想法與需要
            </Text>

            <TouchableOpacity
              style={styles.recordMoodButton}
              onPress={handleViewJournal}
            >
              <LinearGradient
                colors={['#FF8C42', '#FF6B6B']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.nextButtonGradient}
              >
                <Text style={styles.nextButtonText}>完成練習</Text>
                <ArrowRight size={20} color="#FFFFFF" />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </View>
    );
  };

  // ==========================================
  // 主渲染
  // ==========================================
  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF4ED" />
      
      {currentPage === 'welcome' && renderWelcomePage()}
      {currentPage === 'intro' && renderIntroPage()}
      {currentPage === 'situation-intro' && renderSituationIntroPage()}
      {currentPage === 'breathing' && renderBreathingPage()}
      {currentPage === 'facts' && renderFactsPage()}
      {currentPage === 'emotions' && renderEmotionsPage()}
      {currentPage === 'needs' && renderNeedsPage()}
      {currentPage === 'request' && renderRequestPage()}
      {currentPage === 'summary' && renderSummaryPage()}
      {currentPage === 'assessment' && renderAssessmentPage()}
      {currentPage === 'recommendations' && renderRecommendationsPage()}
      {currentPage === 'completion' && renderCompletionPage()}
    </View>
  );
}

// ==========================================
// 樣式定義
// ==========================================
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF4ED' },
  fullScreen: { flex: 1 },
  gradientBg: { flex: 1 },

  // 頂部按鈕
  topButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 56,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonAbsolute: {
    position: 'absolute',
    top: 56,
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 20,
  },

  // 進度點
  progressDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginVertical: 16,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E5E7EB',
  },
  dotActive: {
    backgroundColor: '#FF8C42',
  },

  // 歡迎頁
  welcomeContent: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingTop: 140,
  },
  welcomeIconContainer: {
    marginBottom: 24,
  },
  welcomeIconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FF8C42',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  welcomeTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1e293b',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 24,
    lineHeight: 32,
  },
  welcomeDescription: {
    alignItems: 'center',
    marginBottom: 40,
  },
  welcomeText: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 22,
  },
  highlightOrange: {
    color: '#FF8C42',
    fontWeight: '600',
  },

  // 步驟說明
  stepsDescription: {
    alignItems: 'center',
    marginBottom: 40,
  },
  stepsIntro: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 22,
  },

  // 頁面標題
  pageTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1e293b',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 24,
  },
  pageDescription: {
    fontSize: 15,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },

  // 深呼吸頁
  breathingContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  breathingIconContainer: {
    marginBottom: 32,
  },
  breathingIconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(255, 140, 66, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  breathingTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 32,
  },
  breathingInstructions: {
    alignItems: 'center',
    marginBottom: 48,
  },
  breathingText: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 8,
  },
  startBreathingButton: {
    width: '100%',
    maxWidth: 320,
    height: 56,
    borderRadius: 28,
    overflow: 'hidden',
    shadowColor: '#FF8C42',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },

  // 書寫頁面
  titleSection: {
    paddingHorizontal: 24,
    paddingTop: 120,
    marginBottom: 20,
    alignItems: 'center',
  },
  pageTitleCentered: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 8,
    textAlign: 'center',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 140,
  },
  inputInstruction: {
    fontSize: 16,
    color: '#1e293b',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 16,
  },
  inputSubInstruction: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 16,
  },
  inputCard: {
    minHeight: 200,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#FF8C42',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 3,
  },
  textarea: {
    flex: 1,
    fontSize: 16,
    color: '#334155',
    lineHeight: 24,
  },
  exampleSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    paddingHorizontal: 4,
    marginBottom: 16,
  },
  exampleText: {
    flex: 1,
    fontSize: 13,
    color: '#64748b',
    lineHeight: 20,
  },

  // 提示區域
  tipsSection: {
    marginTop: 8,
  },
  tipsToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  tipsToggleText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FF8C42',
  },
  hintsContent: {
    gap: 8,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 12,
  },
  tipBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FF8C42',
    marginTop: 6,
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    color: '#64748b',
    lineHeight: 22,
    textAlign: 'center',
  },

  // 感受選擇
  noteContainer: {
    flexDirection: 'column',  
    alignItems: 'center', 
    gap: 8,
    marginBottom: 20,
  },
  noteText: {
    flex: 1,
    fontSize: 12,
    color: '#64748b',
    lineHeight: 18,
    textAlign: 'center', 
  },
  reactionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#FF8C42',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 4,
  },
  emotionCategoryLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#94a3b8',
    marginBottom: 12,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: '#FFFFFF',
  },
  tagSelected: {
    backgroundColor: '#FF8C42',
    borderColor: '#FF8C42',
  },
  tagText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748b',
  },
  tagTextSelected: {
    color: '#FFFFFF',
  },
  customTagButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderStyle: 'dashed',
    backgroundColor: '#f8fafc',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  customTagButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#94a3b8',
  },
  customInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',      // ✅ 保持 'center' 讓按鈕垂直置中
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: '#FFE8DB',
    gap: 6,
    flexShrink: 1,
    maxWidth: '100%',
    minHeight: 36,              // ✅ 新增：最小高度
  },
  customInput: {
    fontSize: 14,
    color: '#334155',
    paddingHorizontal: 8,
    paddingVertical: 6,        // ✅ 稍微增加垂直padding
    minWidth: 80,
    maxWidth: 250,
    minHeight: 28,              // ✅ 新增：最小高度
    maxHeight: 60,              // ✅ 新增：最大高度（支援2-3行）
    textAlignVertical: 'center', // ✅ 新增：文字垂直置中
  },
  customCheckButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FF8C42',
    justifyContent: 'center',
    alignItems: 'center',
  },
  customCloseButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#e2e8f0',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // 需求提示
  needsChipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  needHintChip: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderWidth: 1,
    borderColor: '#FFE8DB',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  needHintText: {
    fontSize: 13,
    color: '#64748b',
  },

  // 記錄統整頁
  summaryContainer: {
    flex: 1,
    paddingTop: 120,
    paddingHorizontal: 24,
  },
  summaryTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1e293b',
    textAlign: 'center',
    marginBottom: 24,
  },
  summaryScrollView: {
    flex: 1,
  },
  summaryScrollContent: {
    paddingBottom: 24,
  },
  summarySection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#FF8C42',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  summarySectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#94a3b8',
    marginBottom: 8,
  },
  summarySectionContent: {
    fontSize: 15,
    color: '#334155',
    lineHeight: 22,
  },
  summaryFooter: {
    paddingVertical: 16,
    paddingBottom: 32,
  },
  summaryButton: {
    width: '100%',
    height: 56,
    borderRadius: 28,
    overflow: 'hidden',
    shadowColor: '#FF8C42',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },

  // 評估頁
  assessmentContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  assessmentCard: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#FFFFFF',
    borderRadius: 32,
    padding: 32,
    paddingTop: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
    position: 'relative',
    overflow: 'hidden',
  },
  assessmentAccentBar: {
    position: 'absolute',
    top: 0,
    left: '2%',
    right: '2%',
    height: 8,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
  },
  assessmentBackButton: {
    position: 'absolute',
    top: 32,
    left: 24,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  assessmentTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2D3436',
    textAlign: 'center',
    marginBottom: 8,
    marginTop: 16,
  },
  assessmentSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 32,
  },
  scoreDisplay: {
    alignItems: 'center',
    marginBottom: 40,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 4,
  },
  scoreNumber: {
    fontSize: 72,
    fontWeight: '700',
    color: '#FF6B35',
    lineHeight: 72,
  },
  scoreTotal: {
    fontSize: 20,
    color: '#9CA3AF',
    fontWeight: '500',
    marginLeft: 4,
    marginTop: 20,
  },
  sliderWrapper: {
    marginBottom: 32,
    alignItems: 'center',
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
    marginTop: 12,
  },
  sliderLabel: {
    fontSize: 12,
    color: '#636E72',
    fontWeight: '500',
  },
  assessmentButton: {
    width: '100%',
    height: 56,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#FF8C42',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  assessmentButtonGradient: {
    height: 56,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  assessmentButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  // 推薦頁面（無白色卡片）
  recommendationsContainer: {
    flex: 1,
    paddingTop: 120,
    paddingHorizontal: 24,
  },
  recommendationsTitleSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  recommendationsTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1e293b',
    textAlign: 'center',
    marginBottom: 12,
  },
  recommendationsScrollView: {
    flex: 1,
  },
  recommendationsScrollContent: {
    paddingBottom: 24,
  },
  recommendationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 24,
    gap: 16,
  },
  recommendationIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  recommendationTextContainer: {
    flex: 1,
  },
  recommendationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 6,
  },
  recommendationDescription: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 20,
  },
  recommendationImage: {
    width: 282,      
    height: 331,      
    borderRadius: 16, 
    marginTop: 12,
    alignSelf: 'center',
  },
  recommendationsFooter: {
    paddingVertical: 16,
    paddingBottom: 32,
  },
  recommendationsButton: {
    width: '100%',
    height: 56,
    borderRadius: 28,
    overflow: 'hidden',
    shadowColor: '#FF8C42',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },

  // 完成頁
  completionContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  completionIconContainer: {
    marginBottom: 24,
  },
  completion2IconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FF8C42',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
    position: 'relative',
  },
  completion2StarBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FF8C42',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  completion2Title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 16,
    textAlign: 'center',
  },
  completion2Subtitle: {
    fontSize: 15,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 40,
  },
  recordMoodButton: {
    width: '100%',
    maxWidth: 280,
    height: 56,
    borderRadius: 28,
    overflow: 'hidden',
    shadowColor: '#FF8C42',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },

  // 底部按鈕
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
    paddingVertical: 16,
    paddingBottom: 32,
  },
  nextButton: {
    width: '100%',
    height: 56,
    borderRadius: 28,
    overflow: 'hidden',
    shadowColor: '#FF8C42',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  nextButtonDisabled: {
    shadowOpacity: 0,
    elevation: 0,
  },
  nextButtonLarge: {
    width: '100%',
    maxWidth: 320,
    height: 56,
    borderRadius: 28,
    overflow: 'hidden',
    shadowColor: '#FF8C42',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  nextButtonGradient: {
    height: 56,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  nextButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});