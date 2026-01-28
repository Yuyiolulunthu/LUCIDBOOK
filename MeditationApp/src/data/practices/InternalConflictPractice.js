// ==========================================
// 檔案名稱: InternalConflictPractice.js
// 內耗終止鍵 - CBT練習
// 版本: V2.0 - 完整版本（按照設計稿實現）
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
  Dimensions,
  PanResponder,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  X,
  ArrowRight,
  ArrowLeft,
  Star,
  ChevronDown,
  ChevronUp,
  Heart,
  Wind,
} from 'lucide-react-native';
import ApiService from '../../../api';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// ==================== 自定義滑桿組件 ====================
const CustomSlider = ({ value, onValueChange, min = 0, max = 10 }) => {
  const SLIDER_WIDTH = SCREEN_WIDTH - 120;
  const THUMB_SIZE = 36;
  const TRACK_HEIGHT = 16;

  const [internalValue, setInternalValue] = useState(value);

  const position = useRef(
    new Animated.Value(((value - min) / (max - min)) * SLIDER_WIDTH)
  ).current;

  const startPosition = useRef(0);
  const isDragging = useRef(false);

  const valueRef = useRef(value);
  useEffect(() => {
    valueRef.current = internalValue;
  }, [internalValue]);

  const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, n));

  const posToValue = (pos) => {
    const raw = (pos / SLIDER_WIDTH) * (max - min) + min;
    return Math.round(raw);
  };

  const valueToPos = (v) => ((v - min) / (max - min)) * SLIDER_WIDTH;

  const panResponder = useRef(
    PanResponder.create({
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

      onPanResponderTerminate: () => {
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

  useEffect(() => {
    if (!isDragging.current && value !== valueRef.current) {
      valueRef.current = value;
      setInternalValue(value);
      Animated.timing(position, {
        toValue: valueToPos(value),
        duration: 200,
        useNativeDriver: false,
      }).start();
    }
  }, [value, min, max]);

  return (
    <View style={customSliderStyles.container}>
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
            transform: [
              {
                translateX: position.interpolate({
                  inputRange: [0, SLIDER_WIDTH],
                  outputRange: [0, SLIDER_WIDTH],
                  extrapolate: 'clamp',
                }),
              },
            ],
          },
        ]}
      />
    </View>
  );
};

const customSliderStyles = StyleSheet.create({
  container: {
    width: SCREEN_WIDTH - 120,
    height: 60,
    justifyContent: 'center',
    position: 'relative',
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
      android: {
        elevation: 3,
      },
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
      android: {
        elevation: 8,
      },
    }),
  },
});

// ==================== 初始表單資料 ====================
const INITIAL_FORM_DATA = {
  // 情境回想
  situation: '',
  // 捕捉想法
  thoughts: '',
  // 當下反應
  emotionReactions: [],
  physicalReactions: [],
  behaviorReactions: [],
  customEmotions: '',
  customPhysical: '',
  customBehavior: '',
  // 辨識需求
  needs: '',
  // 尋找證據
  supportingEvidence: '',
  opposingEvidence: '',
  // 轉換視角
  habitPattern: '',
  empathyPerspective: '',
  // 專注可控
  controllable: '',
  uncontrollable: '',
  // 心情評分
  moodScore: 5,
};

// ==================== 進度點組件 ====================
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

// ==================== 心形握手圖標組件 ====================
const HeartHandshakeIcon = ({ size = 48, color = '#FF8C42' }) => (
  <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
    <Heart size={size} color={color} />
  </View>
);

// ==================== 主組件 ====================
export default function InternalConflictPractice({ onBack, navigation, onHome }) {
  // 頁面狀態
  const [currentPage, setCurrentPage] = useState('welcome');
  const [formData, setFormData] = useState(INITIAL_FORM_DATA);

  // Practice 狀態
  const [practiceId, setPracticeId] = useState(null);
  const [startTime, setStartTime] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isTiming, setIsTiming] = useState(false);

  // 展開狀態
  const [showEmotionHints, setShowEmotionHints] = useState(false);
  const [showNeedsHints, setShowNeedsHints] = useState(false);
  
  // 鍵盤狀態
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

  // 動畫值
  const iconScale = useRef(new Animated.Value(0)).current;
  const heartBounce = useRef(new Animated.Value(1)).current;

  // ==================== 當前步驟計算 ====================
  const pageStepMap = {
    'welcome': 0,
    'intro': 0,
    'situation-intro': 0,
    'breathing': 0,
    'situation-write': 0,
    'capture-thoughts': 1,
    'reactions': 2,
    'identify-needs': 3,
    'evidence': 4,
    'perspective': 5,
    'controllable': 6,
    'completion': 7,
    'assessment': 8,
  };

  const getCurrentStep = () => pageStepMap[currentPage] || 0;
  const totalSteps = 9;

  // ==================== Practice 管理 ====================
  const initializePractice = async () => {
    try {
      const response = await ApiService.startPractice('內耗終止鍵');
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
        totalSteps,
        formData,
        elapsedTime
      );
    } catch (err) {
      console.log('儲存進度失敗:', err);
    }
  };

  const handleComplete = async () => {
    let totalSeconds = elapsedTime || 60;

    const payloadFormData = {
      ...formData,
      timestamp: Date.now(),
    };

    await ApiService.completePractice(practiceId, {
      practice_type: '內耗終止鍵',
      duration: Math.max(1, Math.ceil(totalSeconds / 60)),
      duration_seconds: totalSeconds,
      form_data: payloadFormData,
    });
  };

  // ==================== 生命週期 ====================
  useEffect(() => {
    if (currentPage === 'intro') {
      initializePractice();
    }
  }, [currentPage]);

  useEffect(() => {
    if (!startTime || !isTiming) return;
    const timer = setInterval(() => {
      setElapsedTime(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [startTime, isTiming]);

  useEffect(() => {
    if (!practiceId || currentPage === 'assessment') return;
    const interval = setInterval(() => {
      saveProgress();
    }, 10000);
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

  // 完成頁動畫
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

  // ==================== 操作函數 ====================
  const handleBackToHome = () => {
    if (onHome) {
      onHome();
    } else if (navigation) {
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
      'situation-write': () => setCurrentPage('breathing'),
      'capture-thoughts': () => setCurrentPage('situation-write'),
      'reactions': () => setCurrentPage('capture-thoughts'),
      'identify-needs': () => setCurrentPage('reactions'),
      'evidence': () => setCurrentPage('identify-needs'),
      'perspective': () => setCurrentPage('evidence'),
      'controllable': () => setCurrentPage('perspective'),
      'completion': () => setCurrentPage('controllable'),
      'assessment': () => setCurrentPage('completion'),
    };
    backMap[currentPage]?.();
  };

  // ==================== 反應選項數據 ====================
  const emotionOptions = [
    '緊張', '生氣', '委屈', '擔憂',
    '尷尬', '厭惡', '麻木', '丟臉',
  ];

  const physicalOptions = [
    '胸口悶', '心跳加速', '手心冒汗',
    '肌肉緊繃', '胃痛/反胃',
    '頭痛/頭暈', '呼吸急促', '發抖',
    '發熱/臉紅', '無力感',
  ];

  const behaviorOptions = [
    '說不出話', '離開現場',
    '為自己辯駁', '討好對方',
    '言語攻擊', '行為攻擊', '翻舊帳',
    '僵住不動', '大哭', '冷戰',
  ];

  const toggleReaction = (category, value) => {
    const key = category === 'emotion' ? 'emotionReactions' :
                 category === 'physical' ? 'physicalReactions' : 'behaviorReactions';
    
    const current = formData[key];
    if (current.includes(value)) {
      setFormData(prev => ({
        ...prev,
        [key]: current.filter(item => item !== value)
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [key]: [...current, value]
      }));
    }
  };

  // ==================== 需求提示選項 ====================
  const needsOptions = [
    '被理解', '被尊重', '被肯定',
    '被重視', '被認可', '被公平對待',
    '安全感', '界線', '合作',
    '效率', '親密', '信任',
  ];

  const addNeedToText = (need) => {
    const current = formData.needs;
    if (!current.includes(need)) {
      setFormData(prev => ({
        ...prev,
        needs: current ? `${current}、${need}` : need
      }));
    }
  };

  // ==================== 頁面渲染 ====================

  // 歡迎頁
  const renderWelcomePage = () => (
    <View style={styles.fullScreen}>
      <LinearGradient colors={['#FFF4ED', '#FFE8DB']} style={styles.gradientBg}>
        <TouchableOpacity onPress={handleBack} style={styles.closeButtonAbsolute}>
          <X size={24} color="#FF8C42" />
        </TouchableOpacity>

        <View style={styles.welcomeContent}>
          <View style={styles.welcomeIconContainer}>
            <View style={styles.welcomeIconCircle}>
              <Heart size={48} color="#FF8C42" />
            </View>
          </View>

          <ProgressDots currentStep={0} totalSteps={3} />

          <Text style={styles.welcomeTitle}>哈囉！{'\n'}歡迎來到內耗終止鍵</Text>

          <View style={styles.welcomeDescription}>
            <Text style={styles.welcomeText}>這是一個基於</Text>
            <Text style={styles.welcomeText}>認知行為治療（CBT）的練習</Text>
            <Text style={[styles.welcomeText, { marginTop: 16 }]}>
              有時候令人覺得受傷的{'\n'}
              不見得是他人說了什麼{'\n'}
              而是因為我們對訊息的解讀
            </Text>
            <Text style={[styles.welcomeText, { marginTop: 16 }]}>
              透過練習{'\n'}
              我們可以在情緒衝上來前{'\n'}
              先按下暫停鍵{'\n'}
              選擇更有幫助的理解方式
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

  // 介紹頁
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
              <Heart size={48} color="#FF8C42" />
            </View>
          </View>

          <ProgressDots currentStep={1} totalSteps={3} />

          <Text style={styles.welcomeTitle}>接下來我們會一起{'\n'}走過一些練習步驟</Text>

          <View style={styles.stepsDescription}>
            <Text style={styles.stepsIntro}>接下來的練習步驟包含了</Text>
            <View style={styles.stepsList}>
              <Text style={styles.stepHighlight}>情境回想</Text>
              <Text style={styles.stepHighlight}>捕捉想法</Text>
              <Text style={styles.stepHighlight}>辨識需求</Text>
              <Text style={styles.stepHighlight}>尋找證據</Text>
              <Text style={styles.stepHighlight}>轉換視角</Text>
              <Text style={styles.stepHighlight}>專注可控</Text>
            </View>
            <Text style={[styles.stepsIntro, { marginTop: 16 }]}>
              這些練習能幫助你跳脫負面假設{'\n'}
              看清事件的全貌{'\n'}
              回到平穩與平靜
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

  // 情境回想介紹頁
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
              <Heart size={48} color="#FF8C42" />
            </View>
          </View>

          <ProgressDots currentStep={2} totalSteps={3} />

          <Text style={styles.pageTitle}>情境回想</Text>

          <Text style={styles.pageDescription}>
            請先回想一個最近讓你{'\n'}
            感到<Text style={styles.highlightText}>「內耗、不愉快或衝突」</Text>{'\n'}
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

  // 深呼吸頁
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
            onPress={() => setCurrentPage('situation-write')}
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

  // 情境書寫頁
  const renderSituationWritePage = () => {
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
                <Text style={styles.pageTitleCentered}>情境回想</Text>
                <ProgressDots currentStep={0} totalSteps={9} />
              </View>

              <ScrollView
                contentContainerStyle={[styles.scrollContent, { paddingBottom: isKeyboardVisible ? 200 : 140 }]}
                keyboardShouldPersistTaps="handled"
              >
                <Text style={styles.inputInstruction}>
                  回想起一件讓你卡卡的、{'\n'}
                  不舒服、或是產生爭執的人際互動
                </Text>

                <Text style={styles.inputSubInstruction}>
                  <Text style={styles.highlightText}>試著用客觀的角度描寫發生了什麼</Text>{'\n'}
                  先不要加入形容詞輔助{'\n'}
                  把畫面具體的寫出來
                </Text>

                <View style={styles.inputCard}>
                  <TextInput
                    style={styles.textarea}
                    multiline
                    placeholder="試著寫下這件事..."
                    placeholderTextColor="#cbd5e1"
                    value={formData.situation}
                    onChangeText={text => setFormData(prev => ({ ...prev, situation: text }))}
                    textAlignVertical="top"
                  />
                </View>

                <View style={styles.exampleSection}>
                  <Star size={16} color="#fbbf24" fill="#fbbf24" />
                  <Text style={styles.exampleText}>
                    例如：我跟同事打招呼，他只看了我一眼，沒有回應我。
                  </Text>
                </View>
              </ScrollView>

              {!isKeyboardVisible && (
                <View style={styles.footer}>
                  <TouchableOpacity
                    style={[styles.nextButton, !formData.situation.trim() && styles.nextButtonDisabled]}
                    onPress={() => {
                      if (formData.situation.trim()) {
                        Keyboard.dismiss();
                        setTimeout(() => setCurrentPage('capture-thoughts'), 100);
                      }
                    }}
                    disabled={!formData.situation.trim()}
                  >
                    <LinearGradient
                      colors={formData.situation.trim() ? ['#FF8C42', '#FF6B6B'] : ['#cbd5e1', '#cbd5e1']}
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

  // 捕捉想法頁
  const renderCaptureThoughtsPage = () => (
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
              <Text style={styles.pageTitleCentered}>捕捉想法</Text>
              <ProgressDots currentStep={1} totalSteps={9} />
            </View>

            <ScrollView
              contentContainerStyle={[styles.scrollContent, { paddingBottom: isKeyboardVisible ? 200 : 140 }]}
              keyboardShouldPersistTaps="handled"
            >
              <Text style={styles.inputInstruction}>
                這件事發生之後{'\n'}
                腦中有反覆出現什麼想法或念頭嗎
              </Text>

              <View style={styles.inputCard}>
                <TextInput
                  style={styles.textarea}
                  multiline
                  placeholder="試著寫下這件事..."
                  placeholderTextColor="#cbd5e1"
                  value={formData.thoughts}
                  onChangeText={text => setFormData(prev => ({ ...prev, thoughts: text }))}
                  textAlignVertical="top"
                />
              </View>

              <View style={styles.exampleSection}>
                <Star size={16} color="#fbbf24" fill="#fbbf24" />
                <Text style={styles.exampleText}>
                  例如：他好冷淡，他討厭我嗎？
                </Text>
              </View>

              {/* 書寫靈感 */}
              <View style={styles.tipsSection}>
                <TouchableOpacity 
                  onPress={() => setShowEmotionHints(!showEmotionHints)} 
                  style={styles.tipsToggle}
                >
                  {showEmotionHints ? <ChevronUp size={16} color="#FF8C42" /> : <ChevronDown size={16} color="#FF8C42" />}
                  <Text style={styles.tipsToggleText}>書寫靈感</Text>
                </TouchableOpacity>

                {showEmotionHints && (
                  <View style={styles.hintsContent}>
                    {[
                      '他是不是覺得我講得很爛？',
                      '他又那副看不起我的樣子',
                      '又來了！他又想惡搞我',
                      '是不是我說錯什麼話，讓他不開心了？',
                      '他就是個爛人。',
                    ].map((hint, i) => (
                      <TouchableOpacity
                        key={i}
                        style={styles.hintChip}
                        onPress={() => setFormData(prev => ({
                          ...prev,
                          thoughts: prev.thoughts ? `${prev.thoughts}\n${hint}` : hint
                        }))}
                      >
                        <Text style={styles.hintText}>+ {hint}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
            </ScrollView>

            {!isKeyboardVisible && (
              <View style={styles.footer}>
                <TouchableOpacity
                  style={[styles.nextButton, !formData.thoughts.trim() && styles.nextButtonDisabled]}
                  onPress={() => {
                    if (formData.thoughts.trim()) {
                      Keyboard.dismiss();
                      setTimeout(() => setCurrentPage('reactions'), 100);
                    }
                  }}
                  disabled={!formData.thoughts.trim()}
                >
                  <LinearGradient
                    colors={formData.thoughts.trim() ? ['#FF8C42', '#FF6B6B'] : ['#cbd5e1', '#cbd5e1']}
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

  // 反應頁面
  const renderReactionsPage = () => (
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
          <Text style={styles.pageTitleCentered}>當下你的反應是？</Text>
          <ProgressDots currentStep={2} totalSteps={9} />
        </View>

        <ScrollView
          contentContainerStyle={styles.reactionsScrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* 情緒感受 */}
          <View style={styles.reactionCategory}>
            <Text style={styles.reactionCategoryTitle}>情緒感受</Text>
            <View style={styles.reactionChips}>
              {emotionOptions.map((emotion) => (
                <TouchableOpacity
                  key={emotion}
                  style={[
                    styles.reactionChip,
                    formData.emotionReactions.includes(emotion) && styles.reactionChipSelected
                  ]}
                  onPress={() => toggleReaction('emotion', emotion)}
                >
                  <Text style={[
                    styles.reactionChipText,
                    formData.emotionReactions.includes(emotion) && styles.reactionChipTextSelected
                  ]}>
                    {emotion}
                  </Text>
                </TouchableOpacity>
              ))}
              <TouchableOpacity style={styles.customChip}>
                <Text style={styles.customChipText}>+ 自訂</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* 身體感受 */}
          <View style={styles.reactionCategory}>
            <Text style={styles.reactionCategoryTitle}>身體感覺</Text>
            <View style={styles.reactionChips}>
              {physicalOptions.map((physical) => (
                <TouchableOpacity
                  key={physical}
                  style={[
                    styles.reactionChip,
                    formData.physicalReactions.includes(physical) && styles.reactionChipSelected
                  ]}
                  onPress={() => toggleReaction('physical', physical)}
                >
                  <Text style={[
                    styles.reactionChipText,
                    formData.physicalReactions.includes(physical) && styles.reactionChipTextSelected
                  ]}>
                    {physical}
                  </Text>
                </TouchableOpacity>
              ))}
              <TouchableOpacity style={styles.customChip}>
                <Text style={styles.customChipText}>+ 自訂</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* 行為反應 */}
          <View style={styles.reactionCategory}>
            <Text style={styles.reactionCategoryTitle}>行為反應</Text>
            <View style={styles.reactionChips}>
              {behaviorOptions.map((behavior) => (
                <TouchableOpacity
                  key={behavior}
                  style={[
                    styles.reactionChip,
                    formData.behaviorReactions.includes(behavior) && styles.reactionChipSelected
                  ]}
                  onPress={() => toggleReaction('behavior', behavior)}
                >
                  <Text style={[
                    styles.reactionChipText,
                    formData.behaviorReactions.includes(behavior) && styles.reactionChipTextSelected
                  ]}>
                    {behavior}
                  </Text>
                </TouchableOpacity>
              ))}
              <TouchableOpacity style={styles.customChip}>
                <Text style={styles.customChipText}>+ 自訂</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[
              styles.nextButton,
              (formData.emotionReactions.length === 0 &&
               formData.physicalReactions.length === 0 &&
               formData.behaviorReactions.length === 0) && styles.nextButtonDisabled
            ]}
            onPress={() => setCurrentPage('identify-needs')}
            disabled={
              formData.emotionReactions.length === 0 &&
              formData.physicalReactions.length === 0 &&
              formData.behaviorReactions.length === 0
            }
          >
            <LinearGradient
              colors={
                (formData.emotionReactions.length > 0 ||
                 formData.physicalReactions.length > 0 ||
                 formData.behaviorReactions.length > 0)
                  ? ['#FF8C42', '#FF6B6B']
                  : ['#cbd5e1', '#cbd5e1']
              }
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.nextButtonGradient}
            >
              <Text style={styles.nextButtonText}>下一步</Text>
              <ArrowRight size={20} color="#FFFFFF" />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </View>
  );

  // ==================== 辨識需求頁 ====================
  const renderIdentifyNeedsPage = () => (
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
              <Text style={styles.pageTitleCentered}>辨識需求</Text>
              <ProgressDots currentStep={3} totalSteps={9} />
            </View>

            <ScrollView
              contentContainerStyle={[styles.scrollContent, { paddingBottom: isKeyboardVisible ? 200 : 140 }]}
              keyboardShouldPersistTaps="handled"
            >
              <Text style={styles.inputInstruction}>
                我們來釐清為什麼會出現這些反應{'\n'}
                是不是我們的某些需求沒有被滿足
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
                  例如：我希望得到主管公平的對待
                </Text>
              </View>

              {/* 書寫靈感 */}
              <View style={styles.tipsSection}>
                <TouchableOpacity 
                  onPress={() => setShowNeedsHints(!showNeedsHints)} 
                  style={styles.tipsToggle}
                >
                  {showNeedsHints ? <ChevronUp size={16} color="#FF8C42" /> : <ChevronDown size={16} color="#FF8C42" />}
                  <Text style={styles.tipsToggleText}>書寫靈感</Text>
                </TouchableOpacity>

                {showNeedsHints && (
                  <View style={styles.needsChipsContainer}>
                    {needsOptions.map((need, i) => (
                      <TouchableOpacity
                        key={i}
                        style={styles.needHintChip}
                        onPress={() => addNeedToText(need)}
                      >
                        <Text style={styles.needHintText}>+ {need}</Text>
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
                      setTimeout(() => setCurrentPage('evidence'), 100);
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

  // ==================== 尋找證據頁 ====================
  const renderEvidencePage = () => (
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
              <Text style={styles.pageTitleCentered}>尋找證據</Text>
              <ProgressDots currentStep={4} totalSteps={9} />
            </View>

            <ScrollView
              contentContainerStyle={[styles.scrollContent, { paddingBottom: isKeyboardVisible ? 200 : 140 }]}
              keyboardShouldPersistTaps="handled"
            >
              <Text style={styles.inputInstruction}>
                讓我們來檢視一下{'\n'}
                你的想法有哪些證據支持或反對
              </Text>

              {/* 支持證據 */}
              <Text style={styles.evidenceLabel}>支持這個想法的證據</Text>
              <View style={styles.inputCardSmall}>
                <TextInput
                  style={styles.textareaSmall}
                  multiline
                  placeholder="有哪些事實支持你的想法..."
                  placeholderTextColor="#cbd5e1"
                  value={formData.supportingEvidence}
                  onChangeText={text => setFormData(prev => ({ ...prev, supportingEvidence: text }))}
                  textAlignVertical="top"
                />
              </View>

              {/* 反對證據 */}
              <Text style={styles.evidenceLabel}>反對這個想法的證據</Text>
              <View style={styles.inputCardSmall}>
                <TextInput
                  style={styles.textareaSmall}
                  multiline
                  placeholder="有哪些事實不支持你的想法..."
                  placeholderTextColor="#cbd5e1"
                  value={formData.opposingEvidence}
                  onChangeText={text => setFormData(prev => ({ ...prev, opposingEvidence: text }))}
                  textAlignVertical="top"
                />
              </View>

              <View style={styles.exampleSection}>
                <Star size={16} color="#fbbf24" fill="#fbbf24" />
                <Text style={styles.exampleText}>
                  反對例如：他最近工作壓力很大，可能只是太累了沒注意到我。
                </Text>
              </View>
            </ScrollView>

            {!isKeyboardVisible && (
              <View style={styles.footer}>
                <TouchableOpacity
                  style={[
                    styles.nextButton, 
                    (!formData.supportingEvidence.trim() && !formData.opposingEvidence.trim()) && styles.nextButtonDisabled
                  ]}
                  onPress={() => {
                    if (formData.supportingEvidence.trim() || formData.opposingEvidence.trim()) {
                      Keyboard.dismiss();
                      setTimeout(() => setCurrentPage('perspective'), 100);
                    }
                  }}
                  disabled={!formData.supportingEvidence.trim() && !formData.opposingEvidence.trim()}
                >
                  <LinearGradient
                    colors={(formData.supportingEvidence.trim() || formData.opposingEvidence.trim()) 
                      ? ['#FF8C42', '#FF6B6B'] 
                      : ['#cbd5e1', '#cbd5e1']}
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

  // ==================== 轉換視角頁 ====================
  const renderPerspectivePage = () => (
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
              <Text style={styles.pageTitleCentered}>轉換視角</Text>
              <ProgressDots currentStep={5} totalSteps={9} />
            </View>

            <ScrollView
              contentContainerStyle={[styles.scrollContent, { paddingBottom: isKeyboardVisible ? 200 : 140 }]}
              keyboardShouldPersistTaps="handled"
            >
              {/* 第一個問題 */}
              <Text style={styles.perspectiveQuestion}>
                這是他平常的習慣還是只有針對我呢？
              </Text>
              <View style={styles.inputCardSmall}>
                <TextInput
                  style={styles.textareaSmall}
                  multiline
                  placeholder="他平常好像..."
                  placeholderTextColor="#cbd5e1"
                  value={formData.habitPattern}
                  onChangeText={text => setFormData(prev => ({ ...prev, habitPattern: text }))}
                  textAlignVertical="top"
                />
              </View>

              {/* 第二個問題 */}
              <Text style={styles.perspectiveQuestion}>
                如果我是他，我當下可能會...
              </Text>
              <View style={styles.inputCardSmall}>
                <TextInput
                  style={styles.textareaSmall}
                  multiline
                  placeholder="我當下可能會..."
                  placeholderTextColor="#cbd5e1"
                  value={formData.empathyPerspective}
                  onChangeText={text => setFormData(prev => ({ ...prev, empathyPerspective: text }))}
                  textAlignVertical="top"
                />
              </View>
            </ScrollView>

            {!isKeyboardVisible && (
              <View style={styles.footer}>
                <TouchableOpacity
                  style={[
                    styles.nextButton, 
                    (!formData.habitPattern.trim() && !formData.empathyPerspective.trim()) && styles.nextButtonDisabled
                  ]}
                  onPress={() => {
                    if (formData.habitPattern.trim() || formData.empathyPerspective.trim()) {
                      Keyboard.dismiss();
                      setTimeout(() => setCurrentPage('controllable'), 100);
                    }
                  }}
                  disabled={!formData.habitPattern.trim() && !formData.empathyPerspective.trim()}
                >
                  <LinearGradient
                    colors={(formData.habitPattern.trim() || formData.empathyPerspective.trim()) 
                      ? ['#FF8C42', '#FF6B6B'] 
                      : ['#cbd5e1', '#cbd5e1']}
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

  // ==================== 專注可控頁 ====================
  const renderControllablePage = () => (
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
              <Text style={styles.pageTitleCentered}>專注可控</Text>
              <ProgressDots currentStep={6} totalSteps={9} />
            </View>

            <ScrollView
              contentContainerStyle={[styles.scrollContent, { paddingBottom: isKeyboardVisible ? 200 : 140 }]}
              keyboardShouldPersistTaps="handled"
            >
              {/* 可控部分 */}
              <Text style={styles.perspectiveQuestion}>
                這件事有哪些可控的部分嗎？
              </Text>
              <View style={styles.inputCardSmall}>
                <TextInput
                  style={styles.textareaSmall}
                  multiline
                  placeholder="這些事情我可以控制..."
                  placeholderTextColor="#cbd5e1"
                  value={formData.controllable}
                  onChangeText={text => setFormData(prev => ({ ...prev, controllable: text }))}
                  textAlignVertical="top"
                />
              </View>

              {/* 不可控部分 */}
              <Text style={styles.perspectiveQuestion}>
                又有哪些不可控的部分呢？
              </Text>
              <View style={styles.inputCardSmall}>
                <TextInput
                  style={styles.textareaSmall}
                  multiline
                  placeholder="這些事情我沒辦法控制..."
                  placeholderTextColor="#cbd5e1"
                  value={formData.uncontrollable}
                  onChangeText={text => setFormData(prev => ({ ...prev, uncontrollable: text }))}
                  textAlignVertical="top"
                />
              </View>
            </ScrollView>

            {!isKeyboardVisible && (
              <View style={styles.footer}>
                <TouchableOpacity
                  style={[
                    styles.nextButton, 
                    (!formData.controllable.trim() && !formData.uncontrollable.trim()) && styles.nextButtonDisabled
                  ]}
                  onPress={() => {
                    if (formData.controllable.trim() || formData.uncontrollable.trim()) {
                      Keyboard.dismiss();
                      setIsTiming(false);
                      setTimeout(() => setCurrentPage('completion'), 100);
                    }
                  }}
                  disabled={!formData.controllable.trim() && !formData.uncontrollable.trim()}
                >
                  <LinearGradient
                    colors={(formData.controllable.trim() || formData.uncontrollable.trim()) 
                      ? ['#FF8C42', '#FF6B6B'] 
                      : ['#cbd5e1', '#cbd5e1']}
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

  // ==================== 完成頁 ====================
  const renderCompletionPage = () => (
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

        <View style={styles.completionContent}>
          <Animated.View
            style={[
              styles.completionIconContainer,
              { transform: [{ scale: iconScale }] }
            ]}
          >
            <View style={styles.completionIconCircle}>
              <Heart size={48} color="#FF8C42" />
            </View>
          </Animated.View>

          <Text style={styles.completionTitle}>辛苦了！</Text>

          <Text style={styles.completionSubtitle}>
            不知道紀錄到這邊{'\n'}
            是否幫你釐清了一些思緒呢？{'\n'}
            有沒有感覺平靜一點了呢？
          </Text>

          <TouchableOpacity
            style={styles.recordMoodButton}
            onPress={() => setCurrentPage('assessment')}
          >
            <LinearGradient
              colors={['#FF8C42', '#FF6B6B']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.nextButtonGradient}
            >
              <Text style={styles.nextButtonText}>紀錄心情</Text>
              <ArrowRight size={20} color="#FFFFFF" />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </View>
  );

  // ==================== 心情評估頁 ====================
  const renderAssessmentPage = () => {
    const handleViewJournal = async () => {
      try {
        await handleComplete();
        navigation.navigate('MainTabs', {
          screen: 'Daily',
          params: { highlightPracticeId: practiceId }
        });
      } catch (error) {
        console.error('完成練習失敗:', error);
        navigation.navigate('MainTabs', { screen: 'Daily' });
      }
    };

    return (
      <View style={styles.fullScreen}>
        <LinearGradient colors={['#FFF4ED', '#FFE8DB']} style={styles.gradientBg}>
          <View style={styles.assessmentContent}>
            <View style={styles.assessmentCard}>
              <LinearGradient colors={['#FF8C42', '#FF6B35']} style={styles.assessmentAccentBar} />

              <TouchableOpacity onPress={handleBack} style={styles.assessmentBackButton}>
                <ArrowLeft size={20} color="#64748b" />
              </TouchableOpacity>

              <Text style={styles.assessmentTitle}>平靜程度</Text>

              <View style={styles.scoreDisplay}>
                <Text style={styles.scoreNumber}>{formData.moodScore}</Text>
                <Text style={styles.scoreTotal}>/10</Text>
              </View>

              <Text style={styles.assessmentSubtitle}>完成練習後，你感覺如何？</Text>

              <View style={styles.sliderWrapper}>
                <CustomSlider
                  value={formData.moodScore}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, moodScore: value }))}
                  min={0}
                  max={10}
                />

                <View style={styles.sliderLabels}>
                  <Text style={styles.sliderLabel}>0 (仍然焦慮)</Text>
                  <Text style={styles.sliderLabel}>10 (非常平靜)</Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.assessmentButton}
                onPress={handleViewJournal}
              >
                <LinearGradient colors={['#FF8C42', '#FF6B35']} style={styles.assessmentButtonGradient}>
                  <Text style={styles.assessmentButtonText}>完成</Text>
                  <ArrowRight size={20} color="#FFFFFF" />
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>
      </View>
    );
  };

  // ==================== 主渲染 ====================
  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF4ED" />
      
      {currentPage === 'welcome' && renderWelcomePage()}
      {currentPage === 'intro' && renderIntroPage()}
      {currentPage === 'situation-intro' && renderSituationIntroPage()}
      {currentPage === 'breathing' && renderBreathingPage()}
      {currentPage === 'situation-write' && renderSituationWritePage()}
      {currentPage === 'capture-thoughts' && renderCaptureThoughtsPage()}
      {currentPage === 'reactions' && renderReactionsPage()}
      {currentPage === 'identify-needs' && renderIdentifyNeedsPage()}
      {currentPage === 'evidence' && renderEvidencePage()}
      {currentPage === 'perspective' && renderPerspectivePage()}
      {currentPage === 'controllable' && renderControllablePage()}
      {currentPage === 'completion' && renderCompletionPage()}
      {currentPage === 'assessment' && renderAssessmentPage()}
    </View>
  );
}

// ==========================================
// 樣式定義
// ==========================================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF4ED',
  },
  fullScreen: {
    flex: 1,
  },
  gradientBg: {
    flex: 1,
  },

  // ========== 頂部按鈕 ==========
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

  // ========== 進度點 ==========
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

  // ========== 歡迎頁 ==========
  welcomeContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingTop: 80,
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

  // ========== 步驟說明 ==========
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
  stepsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
    marginTop: 16,
    marginBottom: 8,
  },
  stepHighlight: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FF8C42',
  },

  // ========== 頁面標題 ==========
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
  highlightText: {
    color: '#FF8C42',
    fontWeight: '600',
  },

  // ========== 深呼吸頁 ==========
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

  // ========== 書寫頁面 ==========
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
    marginBottom: 24,
  },
  inputSubInstruction: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
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
  inputCardSmall: {
    minHeight: 140,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
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
  textareaSmall: {
    flex: 1,
    fontSize: 15,
    color: '#334155',
    lineHeight: 22,
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

  // ========== 證據頁面 ==========
  evidenceLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
    marginBottom: 12,
  },

  // ========== 轉換視角頁面 ==========
  perspectiveQuestion: {
    fontSize: 15,
    color: '#1e293b',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 22,
  },

  // ========== 提示區域 ==========
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
  hintChip: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderWidth: 1,
    borderColor: '#FFE8DB',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  hintText: {
    fontSize: 13,
    color: '#64748b',
  },

  // ========== 需求提示 ==========
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

  // ========== 反應選擇頁 ==========
  reactionsScrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 180,
    paddingBottom: 120,
  },
  reactionCategory: {
    marginBottom: 24,
  },
  reactionCategoryTitle: {
    fontSize: 14,
    color: '#94a3b8',
    marginBottom: 12,
  },
  reactionChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  reactionChip: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  reactionChipSelected: {
    backgroundColor: '#FF8C42',
    borderColor: '#FF8C42',
  },
  reactionChipText: {
    fontSize: 14,
    color: '#64748b',
  },
  reactionChipTextSelected: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  customChip: {
    backgroundColor: 'rgba(255, 140, 66, 0.05)',
    borderWidth: 1,
    borderColor: '#FFE8DB',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  customChipText: {
    fontSize: 14,
    color: '#FF8C42',
  },

  // ========== 完成頁 ==========
  completionContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  completionIconContainer: {
    marginBottom: 24,
  },
  completionIconCircle: {
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
  completionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 16,
  },
  completionSubtitle: {
    fontSize: 15,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 24,
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

  // ========== 評估頁 ==========
  assessmentContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  assessmentCard: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    padding: 28,
    paddingTop: 36,
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
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
  },
  assessmentBackButton: {
    position: 'absolute',
    top: 28,
    left: 20,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  assessmentTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#2D3436',
    textAlign: 'center',
    marginBottom: 20,
    marginTop: 8,
  },
  scoreDisplay: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'baseline',
    marginBottom: 4,
  },
  scoreNumber: {
    fontSize: 56,
    fontWeight: '700',
    color: '#FF6B35',
  },
  scoreTotal: {
    fontSize: 20,
    color: '#9CA3AF',
    fontWeight: '500',
    marginLeft: 4,
  },
  assessmentSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 32,
  },
  sliderWrapper: {
    marginBottom: 32,
    alignItems: 'center',
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: SCREEN_WIDTH - 120,
    marginTop: 12,
  },
  sliderLabel: {
    fontSize: 12,
    color: '#636E72',
    fontWeight: '500',
  },
  assessmentButton: {
    width: '100%',
    height: 52,
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: '#FF8C42',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  assessmentButtonGradient: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  assessmentButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  // ========== 底部按鈕 ==========
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
    flex: 1,
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