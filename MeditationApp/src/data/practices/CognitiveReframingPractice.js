// ==========================================
// 檔案名稱: CognitiveReframingPractice.js
// 思維調節練習 - ABCD 認知行為療法
// 版本: V2.3 - 修復返回導航與呼吸練習記錄
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
  Modal,
  Dimensions,
  PanResponder,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  X,
  HelpCircle,
  Brain,
  ArrowRight,
  ArrowLeft,
  Star,
  Check,
  Plus,
  Wind,
  Search,
  Settings,
  Zap,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Phone,
  Activity,
  PenTool,
  RefreshCw,
  BookOpen,
  Lightbulb,
  Heart,
} from 'lucide-react-native';
import ApiService from '../../../api';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// ==================== 自定義滑杆組件 ====================
const CustomSlider = ({ value, onValueChange, min = 1, max = 10 }) => {
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
    backgroundColor: '#DFE6E9',
    borderRadius: 8,
    ...Platform.select({
      android: {
        borderWidth: 1,
        borderColor: '#CBD5E0',
      },
    }),
  },
  fill: {
    position: 'absolute',
    left: 0,
    backgroundColor: '#29B6F6',
    borderRadius: 8,
    ...Platform.select({
      ios: {
        shadowColor: '#29B6F6',
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
    backgroundColor: '#0288D1',
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
  event: '',
  thought: '',
  emotions: [],
  bodyReactions: [],
  behaviors: [],
  selectedCard: null,
  newPerspective: '',
  selectedAction: null,
  customAction: '',
  postScore: 5,
  timestamp: 0,
};

// ==================== 預設選項 ====================
const DEFAULT_EMOTIONS = ['緊張', '生氣', '委屈', '焦慮', '煩躁', '悲傷', '害怕', '擔心'];
const DEFAULT_BODY_REACTIONS = ['心跳快', '胸悶', '發抖', '頭痛', '胃痛', '冒冷汗', '肌肉緊繃'];
const DEFAULT_BEHAVIORS = ['想逃走', '沈默', '大吼', '哭泣', '暴飲暴食', '拖延', '自我封閉'];

// 靈感小卡內容
const INSPIRATION_CARDS = [
  {
    id: 1,
    text: '剛才的想法，有哪些證據顯示可能不是事實？有哪些證據顯示可能是事實？',
  },
  {
    id: 2,
    text: '這件事後續發展最糟的結果是什麼？發生的機率是多少 %？最好的結果是什麼？發生的機率是多少 %？',
  },
  {
    id: 3,
    text: '如果是我最好的朋友遇到這件事，我會對他說什麼？',
  },
  {
    id: 4,
    text: '一年後的我回頭看這件事，會有什麼不同的想法？',
  },
  {
    id: 5,
    text: '這個想法對我有幫助嗎？它讓我更接近還是更遠離我想要的生活？',
  },
];

// 微小行動選項
const MICRO_ACTIONS = [
  { id: 'talk', icon: Phone, title: '找人聊聊', subtitle: '聽聽不同的想法' },
  { id: 'breathe', icon: Wind, title: '4-6 呼吸', subtitle: '減緩焦慮與緊繃' },
  { id: 'move', icon: Activity, title: '站起來動一動', subtitle: '給大腦休息與更新' },
  { id: 'write', icon: PenTool, title: '寫下此事我的努力', subtitle: '重建大腦迴路' },
];

// ==================== 進度條組件 ====================
const ProgressBar = ({ currentStep, totalSteps }) => {
  const progress = (currentStep / totalSteps) * 100;

  return (
    <View style={styles.progressContainer}>
      <Animated.View style={[styles.progressFill, { width: `${progress}%` }]} />
    </View>
  );
};

// ==================== 說明彈窗組件 ====================
const InfoModal = ({ visible, onClose }) => {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <TouchableOpacity
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPress={onClose}
        />

        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>關於思維調節</Text>
            <TouchableOpacity onPress={onClose} style={styles.modalCloseButton}>
              <X size={20} color="#64748b" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
            <View style={styles.modalSection}>
              <View style={[styles.modalIconContainer, { backgroundColor: '#e0f2fe' }]}>
                <Brain size={20} color="#0ea5e9" />
              </View>
              <View style={styles.modalTextContainer}>
                <Text style={styles.modalSectionTitle}>什麼是「思維調節」？</Text>
                <Text style={styles.modalSectionText}>
                  源自認知行為療法（CBT）的核心技術。研究發現，我們的情緒反應往往不是由事件本身引起，而是由我們對事件的「解讀」所決定。透過覺察並調整這些自動化想法，可以有效緩解負面情緒。
                </Text>
              </View>
            </View>

            <View style={styles.modalSection}>
              <View style={[styles.modalIconContainer, { backgroundColor: '#fef3c7' }]}>
                <Lightbulb size={20} color="#f59e0b" />
              </View>
              <View style={styles.modalTextContainer}>
                <Text style={styles.modalSectionTitle}>ABCD 模型是什麼？</Text>
                <Text style={styles.modalSectionText}>
                  A（事件）→ B（想法）→ C（反應）→ D（轉念）{'\n\n'}
                  當事件發生時，我們的大腦會自動產生想法，這些想法會觸發情緒和行為反應。透過「轉念」，我們可以用更平衡的角度看待事件，從而改變感受。
                </Text>
              </View>
            </View>

            <View style={styles.modalSection}>
              <View style={[styles.modalIconContainer, { backgroundColor: '#e0f2fe' }]}>
                <Heart size={20} color="#38bdf8" />
              </View>
              <View style={styles.modalTextContainer}>
                <Text style={styles.modalSectionTitle}>這不是否定情緒</Text>
                <Text style={styles.modalSectionText}>
                  思維調節並非否認你的感受或強迫正向思考。而是幫助你看見，除了第一時間的自動想法之外，還有其他可能的解讀方式。你可以選擇對自己更有幫助的角度。
                </Text>
              </View>
            </View>
          </ScrollView>

          <TouchableOpacity onPress={onClose} style={styles.modalButton}>
            <Text style={styles.modalButtonText}>我知道了</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

// ⭐星星動畫
const StarConfetti = ({ index }) => {
  const animatedValue = useRef(new Animated.Value(0)).current;
  
  const [meteorConfig] = useState(() => {
    const side = index % 4;
    let startX, startY, angle;
    
    if (side === 0) {
      startX = Math.random() * SCREEN_WIDTH;
      startY = -50;
      angle = 45 + (Math.random() - 0.5) * 60;
    } else if (side === 1) {
      startX = SCREEN_WIDTH + 50;
      startY = Math.random() * SCREEN_HEIGHT;
      angle = 135 + (Math.random() - 0.5) * 60;
    } else if (side === 2) {
      startX = Math.random() * SCREEN_WIDTH;
      startY = SCREEN_HEIGHT + 50;
      angle = 225 + (Math.random() - 0.5) * 60;
    } else {
      startX = -50;
      startY = Math.random() * SCREEN_HEIGHT;
      angle = 315 + (Math.random() - 0.5) * 60;
    }
    
    const angleInRadians = (angle * Math.PI) / 180;
    const distance = 800 + Math.random() * 400;
    
    return {
      startX,
      startY,
      endX: startX + Math.cos(angleInRadians) * distance,
      endY: startY + Math.sin(angleInRadians) * distance,
      starSize: 24 + Math.random() * 16,
      delay: Math.random() * 1000,
    };
  });
  
  useEffect(() => {
    setTimeout(() => {
      Animated.timing(animatedValue, {
        toValue: 1,
        duration: 2000 + Math.random() * 1000,
        useNativeDriver: true,
      }).start();
    }, meteorConfig.delay);
  }, []);
  
  const translateX = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [meteorConfig.startX, meteorConfig.endX],
  });
  
  const translateY = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [meteorConfig.startY, meteorConfig.endY],
  });
  
  const opacity = animatedValue.interpolate({
    inputRange: [0, 0.1, 0.7, 1],
    outputRange: [0, 1, 0.8, 0],
  });

  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: 'absolute',
        left: 0,
        top: 0,
        transform: [{ translateX }, { translateY }],
        opacity,
      }}
    >
      <Star size={meteorConfig.starSize} color="#60a5fa" fill="#bae6fd" />
    </Animated.View>
  );
};

// 箭頭向下圖標組件
const ArrowDown = ({ size, color }) => (
  <View style={{ transform: [{ rotate: '90deg' }] }}>
    <ArrowRight size={size} color={color} />
  </View>
);

// ==================== 主組件 ====================
export default function CognitiveReframingPractice({ onBack, navigation }) {
  const [currentPage, setCurrentPage] = useState('intro');
  const [formData, setFormData] = useState(INITIAL_FORM_DATA);
  const [showInfoModal, setShowInfoModal] = useState(false);

  // Practice 狀態
  const [practiceId, setPracticeId] = useState(null);
  const [startTime, setStartTime] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isTiming, setIsTiming] = useState(true);

  // 自訂選項
  const [customEmotions, setCustomEmotions] = useState([]);
  const [customBodyReactions, setCustomBodyReactions] = useState([]);
  const [customBehaviors, setCustomBehaviors] = useState([]);
  const [isAddingCustomEmotion, setIsAddingCustomEmotion] = useState(false);
  const [isAddingCustomBody, setIsAddingCustomBody] = useState(false);
  const [isAddingCustomBehavior, setIsAddingCustomBehavior] = useState(false);
  const [customEmotionInput, setCustomEmotionInput] = useState('');
  const [customBodyInput, setCustomBodyInput] = useState('');
  const [customBehaviorInput, setCustomBehaviorInput] = useState('');

  // 書寫提示展開狀態
  const [showEventTips, setShowEventTips] = useState(false);
  const [showThoughtTips, setShowThoughtTips] = useState(false);

  // 鍵盤狀態
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

  // 動畫值
  const iconScale = useRef(new Animated.Value(0)).current;
  const starBadgeScale = useRef(new Animated.Value(0)).current;
  const breathingScale = useRef(new Animated.Value(1)).current;

  const [hasCompleted, setHasCompleted] = useState(false);

  // 靈感小卡滾動
  const cardScrollRef = useRef(null);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);

  // 當前步驟計算
  const getCurrentStep = () => {
    const stepMap = {
      intro: 0,
      breathing: 0,
      event: 1,
      thought: 2,
      reaction: 3,
      reframe: 4,
      action: 5,
      assessment: 6,
      review: 7,
      completion: 8,
    };
    return stepMap[currentPage] || 0;
  };

  const totalSteps = 7;

  // ==================== Practice 管理 ====================
  const initializePractice = async () => {
    try {
      const response = await ApiService.startPractice('思維調節練習');
      if (response?.practiceId) {
        setPracticeId(response.practiceId);
        const restoredSeconds = response.accumulatedSeconds ? Number(response.accumulatedSeconds) : 0;
        setElapsedTime(restoredSeconds);

        if (response.formData) {
          try {
            const parsed = typeof response.formData === 'string'
              ? JSON.parse(response.formData)
              : response.formData;
            setFormData(prev => ({ ...prev, ...parsed }));
          } catch (e) {
            console.log('解析既有資料失敗:', e);
          }
        }
      }
    } catch (e) {
      console.log('初始化練習失敗:', e);
    } finally {
      setStartTime(Date.now());
    }
  };

  const saveProgress = async () => {
    if (!practiceId) return;
    try {
      const currentAllEmotions = [...new Set([...formData.emotions, ...customEmotions])];
      const currentAllBodyReactions = [...new Set([...formData.bodyReactions, ...customBodyReactions])];
      const currentAllBehaviors = [...new Set([...formData.behaviors, ...customBehaviors])];
      
      const progressFormData = {
        ...formData,
        emotions: currentAllEmotions,
        bodyReactions: currentAllBodyReactions,
        behaviors: currentAllBehaviors,
        customEmotions: customEmotions,
        customBodyReactions: customBodyReactions,
        customBehaviors: customBehaviors,
        fullReactions: {
          emotions: currentAllEmotions,
          bodyReactions: currentAllBodyReactions,
          behaviors: currentAllBehaviors,
        },
      };
      
      await ApiService.updatePracticeProgress(
        practiceId,
        getCurrentStep(),
        totalSteps,
        progressFormData,
        elapsedTime
      );
    } catch (err) {
      console.log('❌ 保存進度失敗:', err);
    }
  };

  const completeOnce = async () => {
    if (hasCompleted) {
      console.log('⚠️ 已完成過，略過重複 complete');
      return;
    }

    setHasCompleted(true);

    let totalSeconds = elapsedTime || 60;

    const allEmotions = [...new Set([...formData.emotions, ...customEmotions])];
    const allBodyReactions = [...new Set([...formData.bodyReactions, ...customBodyReactions])];
    const allBehaviors = [...new Set([...formData.behaviors, ...customBehaviors])];

    const payloadFormData = {
      ...formData,
      emotions: allEmotions,
      bodyReactions: allBodyReactions,
      behaviors: allBehaviors,
      customEmotions,
      customBodyReactions,
      customBehaviors,
      fullReactions: {
        emotions: allEmotions,
        bodyReactions: allBodyReactions,
        behaviors: allBehaviors,
      },
      postMood: allEmotions[0] || formData.emotions[0] || null,
      timestamp: Date.now(),
    };

    try {
      await ApiService.completePractice(practiceId, {
        practice_type: '思維調節練習',
        duration: Math.max(1, Math.ceil(totalSeconds / 60)),
        duration_seconds: totalSeconds,
        form_data: payloadFormData,
      });

      await ApiService.getPracticeStats();
      console.log('✅ 完成成功');
    } catch (err) {
      setHasCompleted(false);
      console.error('❌ 完成失敗:', err);
      throw err;
    }
  };

  // ==================== 生命週期 ====================
  useEffect(() => {
    initializePractice();
  }, []);

  useEffect(() => {
    if (!startTime || !isTiming) return;

    const timer = setInterval(() => {
      setElapsedTime(prev => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [startTime, isTiming]);

  useEffect(() => {
    if (!practiceId) return;
    if (currentPage === 'completion') return;

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

  // 呼吸動畫
  useEffect(() => {
    if (currentPage === 'breathing') {
      const breatheAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(breathingScale, {
            toValue: 1.3,
            duration: 5000,
            useNativeDriver: true,
          }),
          Animated.timing(breathingScale, {
            toValue: 1,
            duration: 5000,
            useNativeDriver: true,
          }),
        ])
      );
      breatheAnimation.start();

      const timer = setTimeout(() => {
        setCurrentPage('event');
      }, 10000);

      return () => {
        breatheAnimation.stop();
        clearTimeout(timer);
      };
    }
  }, [currentPage]);

  // 完成頁動畫
  useEffect(() => {
    if (currentPage === 'completion') {
      Animated.sequence([
        Animated.spring(iconScale, {
          toValue: 1,
          tension: 100,
          friction: 15,
          delay: 200,
          useNativeDriver: true,
        }),
        Animated.spring(starBadgeScale, {
          toValue: 1,
          delay: 400,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      iconScale.setValue(0);
      starBadgeScale.setValue(0);
    }
  }, [currentPage]);

  // ==================== 操作函數 ====================
  const handleBack = () => {
    const backMap = {
      intro: () => {
        if (navigation?.canGoBack()) {
          navigation.goBack();
        } else if (onBack) {
          onBack();
        }
      },
      breathing: () => setCurrentPage('intro'),
      event: () => setCurrentPage('intro'),
      thought: () => setCurrentPage('event'),
      reaction: () => setCurrentPage('thought'),
      reframe: () => setCurrentPage('reaction'),
      action: () => setCurrentPage('reframe'),
      assessment: () => setCurrentPage('action'),
      review: () => setCurrentPage('assessment'),
      completion: () => {
        if (navigation?.canGoBack()) {
          navigation.goBack();
        } else if (onBack) {
          onBack();
        }
      },
    };
    backMap[currentPage]?.();
  };

  const toggleSelection = (item, field) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].includes(item)
        ? prev[field].filter(i => i !== item)
        : [...prev[field], item]
    }));
  };

  const handleAddCustom = (type) => {
    let inputValue = '';
    
    switch (type) {
      case 'emotion':
        inputValue = customEmotionInput.trim();
        break;
      case 'body':
        inputValue = customBodyInput.trim();
        break;
      case 'behavior':
        inputValue = customBehaviorInput.trim();
        break;
    }
    
    if (!inputValue) return;

    switch (type) {
      case 'emotion':
        if (!DEFAULT_EMOTIONS.includes(inputValue) && !customEmotions.includes(inputValue)) {
          setCustomEmotions([...customEmotions, inputValue]);
        }
        if (!formData.emotions.includes(inputValue)) {
          setFormData(prev => ({
            ...prev,
            emotions: [...prev.emotions, inputValue]
          }));
        }
        setIsAddingCustomEmotion(false);
        setCustomEmotionInput('');
        break;
        
      case 'body':
        if (!DEFAULT_BODY_REACTIONS.includes(inputValue) && !customBodyReactions.includes(inputValue)) {
          setCustomBodyReactions([...customBodyReactions, inputValue]);
        }
        if (!formData.bodyReactions.includes(inputValue)) {
          setFormData(prev => ({
            ...prev,
            bodyReactions: [...prev.bodyReactions, inputValue]
          }));
        }
        setIsAddingCustomBody(false);
        setCustomBodyInput('');
        break;
        
      case 'behavior':
        if (!DEFAULT_BEHAVIORS.includes(inputValue) && !customBehaviors.includes(inputValue)) {
          setCustomBehaviors([...customBehaviors, inputValue]);
        }
        if (!formData.behaviors.includes(inputValue)) {
          setFormData(prev => ({
            ...prev,
            behaviors: [...prev.behaviors, inputValue]
          }));
        }
        setIsAddingCustomBehavior(false);
        setCustomBehaviorInput('');
        break;
    }
  };

  const selectInspirationCard = (card) => {
    setFormData(prev => ({ ...prev, selectedCard: card }));
  };

  const selectAction = (action) => {
    setFormData(prev => ({ ...prev, selectedAction: action }));
  };

  // 跳轉到呼吸練習
  const handleGoToBreathing = async () => {
    try {
      // 暫停計時
      setIsTiming(false);
      
      // 保存當前進度
      await saveProgress();
      
      // 導航到呼吸練習
      navigation.navigate('BreathingPractice', {
        fromPractice: 'CognitiveReframing',
        onReturn: () => {
          // 返回時恢復計時
          setIsTiming(true);
        }
      });
    } catch (error) {
      console.error('跳轉到呼吸練習失敗:', error);
      // 即使失敗也允許跳轉
      navigation.navigate('BreathingPractice');
    }
  };

  // ==================== 頁面渲染 ====================

  // 1. 介紹頁
  const renderIntroPage = () => (
    <View style={styles.fullScreen}>
      <LinearGradient
        colors={['#f0f9ff', '#e0f2fe']}
        style={styles.gradientBg}
      >
        <TouchableOpacity onPress={handleBack} style={styles.closeButton}>
          <View style={styles.closeButtonCircle}>
            <X size={20} color="#64748b" />
          </View>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setShowInfoModal(true)} style={styles.infoButton}>
          <HelpCircle size={16} color="#0ea5e9" />
          <Text style={styles.infoButtonText}>為什麼要做這個練習？</Text>
        </TouchableOpacity>

        <ScrollView
          contentContainerStyle={styles.introScrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.introIconContainer}>
            <View style={styles.introIconCircle}>
              <Brain size={40} color="#0ea5e9" />
            </View>
          </View>

          <Text style={styles.introTitle}>思維調節</Text>
          <Text style={styles.introSubtitle}>重整想法，緩解情緒</Text>

          <View style={styles.stepsContainer}>
            <View style={styles.stepItem}>
              <View style={[styles.stepIcon, { backgroundColor: '#fef3c7' }]}>
                <Search size={20} color="#f59e0b" />
              </View>
              <View style={styles.stepTextContainer}>
                <Text style={styles.stepLabel}>覺察：</Text>
                <Text style={styles.stepText}>看見引發情緒的來源</Text>
              </View>
            </View>

            <View style={styles.stepItem}>
              <View style={[styles.stepIcon, { backgroundColor: '#d1fae5' }]}>
                <Settings size={20} color="#10b981" />
              </View>
              <View style={styles.stepTextContainer}>
                <Text style={styles.stepLabel}>調整：</Text>
                <Text style={styles.stepText}>更新大腦慣性迴路</Text>
              </View>
            </View>

            <View style={styles.stepItem}>
              <View style={[styles.stepIcon, { backgroundColor: '#fce7f3' }]}>
                <Zap size={20} color="#ec4899" />
              </View>
              <View style={styles.stepTextContainer}>
                <Text style={styles.stepLabel}>行動：</Text>
                <Text style={styles.stepText}>重新找回掌控感</Text>
              </View>
            </View>
          </View>

          <TouchableOpacity
            style={styles.introStartButton}
            onPress={() => setCurrentPage('breathing')}
          >
            <LinearGradient
              colors={['#0ea5e9', '#0ea5e9']}
              style={styles.introStartGradient}
            >
              <Text style={styles.introStartText}>開始練習</Text>
              <ArrowRight size={20} color="#FFFFFF" />
            </LinearGradient>
          </TouchableOpacity>
        </ScrollView>

        <InfoModal visible={showInfoModal} onClose={() => setShowInfoModal(false)} />
      </LinearGradient>
    </View>
  );

  // 2. 呼吸準備頁
  const renderBreathingPage = () => (
    <View style={styles.fullScreen}>
      <LinearGradient
        colors={['#FFFFFF', '#F8F9FA']}
        style={styles.gradientBg}
      >
        <View style={styles.breathingContent}>
          <Animated.View
            style={[
              styles.breathingIconContainer,
              { transform: [{ scale: breathingScale }] }
            ]}
          >
            <View style={styles.breathingIconCircle}>
              <Wind size={40} color="#0ea5e9" />
            </View>
          </Animated.View>

          <Text style={styles.breathingTitle}>跟著畫面深呼吸</Text>
          <Text style={styles.breathingSubtitle}>圈圈變大時吸氣</Text>
          <Text style={styles.breathingSubtitle}>圈圈變小時吐氣</Text>

          <TouchableOpacity
            style={styles.skipButton}
            onPress={() => setCurrentPage('event')}
          >
            <Text style={styles.skipButtonText}>跳過</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </View>
  );

  // 3. 事件描述頁
  const renderEventPage = () => {
    const tips = [
      '只描述客觀發生的事情',
      '不加入你的感受或判斷',
      '像在寫新聞報導一樣',
    ];

    return (
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.fullScreen}>
            <LinearGradient
              colors={['#f0f9ff', '#e0f2fe']}
              style={styles.gradientBg}
            >
              <View style={styles.progressBarTop}>
                <ProgressBar currentStep={getCurrentStep()} totalSteps={totalSteps} />
              </View>

              <View style={styles.header}>
                <TouchableOpacity onPress={handleBack} style={styles.headerBackButton}>
                  <ArrowLeft size={24} color="#64748b" />
                </TouchableOpacity>
                <View style={{ width: 40 }} />
              </View>

              <View style={styles.titleSection}>
                <Text style={styles.pageTitle}>發生了什麼事？</Text>
                <Text style={styles.pageSubtitle}>
                  記錄一件「讓你感到擔心、生氣、委屈、焦慮或心中有點卡卡悶悶」的事件
                </Text>
                <View style={styles.noteContainer}>
                  <Star size={16} color="#fbbf24" fill="#fbbf24" />
                  <Text style={styles.noteText}>
                    只描述「發生什麼事」，不加入感受與想法
                  </Text>
                </View>
              </View>

              <ScrollView
                contentContainerStyle={[
                  styles.scrollContent,
                  { paddingBottom: isKeyboardVisible ? 200 : 120 }
                ]}
                keyboardShouldPersistTaps="handled"
              >
                <View style={styles.inputCard}>
                  <TextInput
                    style={styles.textarea}
                    multiline
                    placeholder="試著寫下這件事..."
                    placeholderTextColor="#cbd5e1"
                    value={formData.event}
                    onChangeText={text => setFormData(prev => ({ ...prev, event: text }))}
                    textAlignVertical="top"
                  />
                </View>

                <View style={styles.tipsSection}>
                  <TouchableOpacity
                    onPress={() => setShowEventTips(!showEventTips)}
                    style={styles.tipsToggle}
                  >
                    {showEventTips ? <ChevronUp size={16} color="#0ea5e9" /> : <ChevronDown size={16} color="#0ea5e9" />}
                    <Text style={styles.tipsToggleText}>書寫提示</Text>
                  </TouchableOpacity>

                  {showEventTips && (
                    <View style={styles.tipsContent}>
                      {tips.map((tip, i) => (
                        <View key={i} style={styles.tipItem}>
                          <View style={styles.tipBullet} />
                          <Text style={styles.tipText}>{tip}</Text>
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              </ScrollView>

              {!isKeyboardVisible && (
                <View style={styles.footer}>
                  <TouchableOpacity
                    style={[
                      styles.nextButton,
                      !formData.event.trim() && styles.nextButtonDisabled
                    ]}
                    onPress={() => {
                      if (formData.event.trim()) {
                        Keyboard.dismiss();
                        setTimeout(() => setCurrentPage('thought'), 100);
                      }
                    }}
                    disabled={!formData.event.trim()}
                  >
                    <LinearGradient
                      colors={formData.event.trim() ? ['#0ea5e9', '#0ea5e9'] : ['#cbd5e1', '#cbd5e1']}
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

  // 4. 想法描述頁
  const renderThoughtPage = () => {
    const tips = [
      '當時你的第一個念頭是什麼？',
      '你對自己說了什麼？',
      '你怎麼解讀這件事？',
    ];

    return (
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.fullScreen}>
            <LinearGradient
              colors={['#f0f9ff', '#e0f2fe']}
              style={styles.gradientBg}
            >
              <View style={styles.progressBarTop}>
                <ProgressBar currentStep={getCurrentStep()} totalSteps={totalSteps} />
              </View>

              <View style={styles.header}>
                <TouchableOpacity onPress={handleBack} style={styles.headerBackButton}>
                  <ArrowLeft size={24} color="#64748b" />
                </TouchableOpacity>
                <View style={{ width: 40 }} />
              </View>

              <View style={styles.titleSection}>
                <Text style={styles.pageTitle}>當下腦中的想法是？</Text>
                <Text style={styles.pageSubtitle}>這就是大腦慣性迴路的運作</Text>
                <View style={styles.noteContainer}>
                  <Star size={16} color="#fbbf24" fill="#fbbf24" />
                  <Text style={styles.noteText}>捕捉當下瞬間的念頭或聲音</Text>
                </View>
              </View>

              <ScrollView
                contentContainerStyle={[
                  styles.scrollContent,
                  { paddingBottom: isKeyboardVisible ? 200 : 120 }
                ]}
                keyboardShouldPersistTaps="handled"
              >
                <View style={styles.inputCard}>
                  <TextInput
                    style={styles.textarea}
                    multiline
                    placeholder="例如：慘了！他一定覺得我很差勁..."
                    placeholderTextColor="#cbd5e1"
                    value={formData.thought}
                    onChangeText={text => setFormData(prev => ({ ...prev, thought: text }))}
                    textAlignVertical="top"
                  />
                </View>

                <View style={styles.tipsSection}>
                  <TouchableOpacity
                    onPress={() => setShowThoughtTips(!showThoughtTips)}
                    style={styles.tipsToggle}
                  >
                    {showThoughtTips ? <ChevronUp size={16} color="#0ea5e9" /> : <ChevronDown size={16} color="#0ea5e9" />}
                    <Text style={styles.tipsToggleText}>書寫提示</Text>
                  </TouchableOpacity>

                  {showThoughtTips && (
                    <View style={styles.tipsContent}>
                      {tips.map((tip, i) => (
                        <View key={i} style={styles.tipItem}>
                          <View style={styles.tipBullet} />
                          <Text style={styles.tipText}>{tip}</Text>
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              </ScrollView>

              {!isKeyboardVisible && (
                <View style={styles.footer}>
                  <TouchableOpacity
                    style={[
                      styles.nextButton,
                      !formData.thought.trim() && styles.nextButtonDisabled
                    ]}
                    onPress={() => {
                      if (formData.thought.trim()) {
                        Keyboard.dismiss();
                        setTimeout(() => setCurrentPage('reaction'), 100);
                      }
                    }}
                    disabled={!formData.thought.trim()}
                  >
                    <LinearGradient
                      colors={formData.thought.trim() ? ['#0ea5e9', '#0ea5e9'] : ['#cbd5e1', '#cbd5e1']}
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

  // 5. 反應選擇頁
  const renderReactionPage = () => {
    const allEmotions = [...DEFAULT_EMOTIONS, ...customEmotions];
    const allBodyReactions = [...DEFAULT_BODY_REACTIONS, ...customBodyReactions];
    const allBehaviors = [...DEFAULT_BEHAVIORS, ...customBehaviors];

    const hasAnyReaction =
      formData.emotions.length > 0 ||
      formData.bodyReactions.length > 0 ||
      formData.behaviors.length > 0;

    const renderTagSection = (title, items, selectedItems, field, isAdding, setIsAdding, type) => (
      <View style={styles.reactionSection}>
        <Text style={styles.reactionSectionTitle}>{title}</Text>
        <View style={styles.tagsContainer}>
          {items.map(item => {
            const isSelected = selectedItems.includes(item);
            return (
              <TouchableOpacity
                key={item}
                style={[styles.tag, isSelected && styles.tagSelected]}
                onPress={() => toggleSelection(item, field)}
              >
                <Text style={[styles.tagText, isSelected && styles.tagTextSelected]}>
                  {item}
                </Text>
              </TouchableOpacity>
            );
          })}

          {!isAdding ? (
            <TouchableOpacity
              style={styles.customTagButton}
              onPress={() => setIsAdding(true)}
            >
              <Plus size={14} color="#94a3b8" />
              <Text style={styles.customTagButtonText}>自訂</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.customInputContainer}>
              <TextInput
                style={styles.customInput}
                value={
                  type === 'emotion' ? customEmotionInput : 
                  type === 'body' ? customBodyInput : 
                  customBehaviorInput
                }
                onChangeText={(text) => {
                  if (type === 'emotion') setCustomEmotionInput(text);
                  else if (type === 'body') setCustomBodyInput(text);
                  else setCustomBehaviorInput(text);
                }}
                placeholder="輸入..."
                placeholderTextColor="#cbd5e1"
                autoFocus
                onSubmitEditing={() => handleAddCustom(type)}
              />
              <TouchableOpacity
                onPress={() => handleAddCustom(type)}
                style={styles.customCheckButton}
              >
                <Check size={14} color="#FFFFFF" />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  setIsAdding(false);
                  if (type === 'emotion') setCustomEmotionInput('');
                  else if (type === 'body') setCustomBodyInput('');
                  else setCustomBehaviorInput('');
                }}
                style={styles.customCloseButton}
              >
                <X size={14} color="#94a3b8" />
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    );

    return (
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.fullScreen}>
            <LinearGradient
              colors={['#f0f9ff', '#e0f2fe']}
              style={styles.gradientBg}
            >
              <View style={styles.progressBarTop}>
                <ProgressBar currentStep={getCurrentStep()} totalSteps={totalSteps} />
              </View>

              <View style={styles.header}>
                <TouchableOpacity onPress={handleBack} style={styles.headerBackButton}>
                  <ArrowLeft size={24} color="#64748b" />
                </TouchableOpacity>
                <View style={{ width: 40 }} />
              </View>

              <Text style={styles.reactionTitle}>事情發生後你的反應是？</Text>

              <ScrollView
                contentContainerStyle={[
                  styles.scrollContent,
                  { paddingBottom: isKeyboardVisible ? 200 : 120 }
                ]}
                keyboardShouldPersistTaps="handled"
              >
                <View style={styles.reactionCard}>
                  {renderTagSection(
                    '情緒',
                    allEmotions,
                    formData.emotions,
                    'emotions',
                    isAddingCustomEmotion,
                    setIsAddingCustomEmotion,
                    'emotion'
                  )}

                  {renderTagSection(
                    '身體',
                    allBodyReactions,
                    formData.bodyReactions,
                    'bodyReactions',
                    isAddingCustomBody,
                    setIsAddingCustomBody,
                    'body'
                  )}

                  {renderTagSection(
                    '行為',
                    allBehaviors,
                    formData.behaviors,
                    'behaviors',
                    isAddingCustomBehavior,
                    setIsAddingCustomBehavior,
                    'behavior'
                  )}
                </View>
              </ScrollView>

              {!isKeyboardVisible && (
                <View style={styles.footer}>
                  <TouchableOpacity
                    style={[
                      styles.nextButton,
                      !hasAnyReaction && styles.nextButtonDisabled
                    ]}
                    onPress={() => {
                      if (hasAnyReaction) {
                        Keyboard.dismiss();
                        setTimeout(() => setCurrentPage('reframe'), 100);
                      }
                    }}
                    disabled={!hasAnyReaction}
                  >
                    <LinearGradient
                      colors={hasAnyReaction ? ['#0ea5e9', '#0ea5e9'] : ['#cbd5e1', '#cbd5e1']}
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

  // 6. 換個角度想頁
  const renderReframePage = () => {
    const scrollToCard = (index) => {
      cardScrollRef.current?.scrollTo({
        x: index * (SCREEN_WIDTH - 80),
        animated: true,
      });
      setCurrentCardIndex(index);
    };

    return (
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.fullScreen}>
            <LinearGradient
              colors={['#f0f9ff', '#e0f2fe']}
              style={styles.gradientBg}
            >
              <View style={styles.progressBarTop}>
                <ProgressBar currentStep={getCurrentStep()} totalSteps={totalSteps} />
              </View>

              <View style={styles.header}>
                <TouchableOpacity onPress={handleBack} style={styles.headerBackButton}>
                  <ArrowLeft size={24} color="#64748b" />
                </TouchableOpacity>
                <View style={{ width: 40 }} />
              </View>

              <View style={styles.titleSection}>
                <Text style={styles.pageTitle}>試著換個角度想...</Text>
                <View style={styles.noteContainer}>
                  <Star size={16} color="#fbbf24" fill="#fbbf24" />
                  <Text style={styles.noteText}>選擇一張你最有感的靈感小卡</Text>
                </View>
              </View>

              <ScrollView
                contentContainerStyle={[
                  styles.scrollContent,
                  { paddingBottom: isKeyboardVisible ? 200 : 120 }
                ]}
                keyboardShouldPersistTaps="handled"
              >
                <View style={styles.inputCard}>
                  <TextInput
                    style={styles.textarea}
                    multiline
                    placeholder="寫下你的新觀點..."
                    placeholderTextColor="#cbd5e1"
                    value={formData.newPerspective}
                    onChangeText={text => setFormData(prev => ({ ...prev, newPerspective: text }))}
                    textAlignVertical="top"
                  />
                </View>

                <View style={styles.cardsSection}>
                  <View style={styles.cardsSectionHeader}>
                    <RefreshCw size={16} color="#0ea5e9" />
                    <Text style={styles.cardsSectionTitle}>靈感小卡 (點擊填入)</Text>
                  </View>

                  <ScrollView
                    ref={cardScrollRef}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    pagingEnabled
                    snapToInterval={SCREEN_WIDTH - 80}
                    decelerationRate="fast"
                    contentContainerStyle={styles.cardsScrollContent}
                    onMomentumScrollEnd={(e) => {
                      const index = Math.round(e.nativeEvent.contentOffset.x / (SCREEN_WIDTH - 80));
                      setCurrentCardIndex(index);
                    }}
                  >
                    {INSPIRATION_CARDS.map((card) => (
                      <TouchableOpacity
                        key={card.id}
                        style={[
                          styles.inspirationCard,
                          formData.selectedCard?.id === card.id && styles.inspirationCardSelected
                        ]}
                        onPress={() => {
                          selectInspirationCard(card);
                          setFormData(prev => ({
                            ...prev,
                            newPerspective: prev.newPerspective
                              ? `${prev.newPerspective}\n\n${card.text}`
                              : card.text
                          }));
                        }}
                      >
                        <Text style={styles.inspirationCardText}>{card.text}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>

                  <View style={styles.cardsNavigation}>
                    <TouchableOpacity
                      onPress={() => scrollToCard(Math.max(0, currentCardIndex - 1))}
                      disabled={currentCardIndex === 0}
                      style={[styles.navButton, currentCardIndex === 0 && styles.navButtonDisabled]}
                    >
                      <ChevronLeft size={20} color={currentCardIndex === 0 ? '#cbd5e1' : '#64748b'} />
                    </TouchableOpacity>

                    <View style={styles.cardsDots}>
                      {INSPIRATION_CARDS.map((_, index) => (
                        <View
                          key={index}
                          style={[
                            styles.cardDot,
                            currentCardIndex === index && styles.cardDotActive
                          ]}
                        />
                      ))}
                    </View>

                    <TouchableOpacity
                      onPress={() => scrollToCard(Math.min(INSPIRATION_CARDS.length - 1, currentCardIndex + 1))}
                      disabled={currentCardIndex === INSPIRATION_CARDS.length - 1}
                      style={[styles.navButton, currentCardIndex === INSPIRATION_CARDS.length - 1 && styles.navButtonDisabled]}
                    >
                      <ChevronRight size={20} color={currentCardIndex === INSPIRATION_CARDS.length - 1 ? '#cbd5e1' : '#64748b'} />
                    </TouchableOpacity>
                  </View>
                </View>
              </ScrollView>

              {!isKeyboardVisible && (
                <View style={styles.footer}>
                  <TouchableOpacity
                    style={[
                      styles.nextButton,
                      !formData.newPerspective.trim() && styles.nextButtonDisabled
                    ]}
                    onPress={() => {
                      if (formData.newPerspective.trim()) {
                        Keyboard.dismiss();
                        setTimeout(() => setCurrentPage('action'), 100);
                      }
                    }}
                    disabled={!formData.newPerspective.trim()}
                  >
                    <LinearGradient
                      colors={formData.newPerspective.trim() ? ['#0ea5e9', '#0ea5e9'] : ['#cbd5e1', '#cbd5e1']}
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

  // 7. 微小行動頁
  const renderActionPage = () => {
    const hasAction = formData.selectedAction || formData.customAction.trim();

    return (
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.fullScreen}>
            <LinearGradient
              colors={['#f0f9ff', '#e0f2fe']}
              style={styles.gradientBg}
            >
              <View style={styles.progressBarTop}>
                <ProgressBar currentStep={getCurrentStep()} totalSteps={totalSteps} />
              </View>

              <View style={styles.header}>
                <TouchableOpacity onPress={handleBack} style={styles.headerBackButton}>
                  <ArrowLeft size={24} color="#64748b" />
                </TouchableOpacity>
                <View style={{ width: 40 }} />
              </View>

              <View style={styles.titleSection}>
                <Text style={styles.pageTitle}>現在可以做的微小行動</Text>
                <Text style={styles.pageSubtitle}>不需要完美，只要一個小動作。</Text>
              </View>

              <ScrollView
                contentContainerStyle={[
                  styles.scrollContent,
                  { paddingBottom: isKeyboardVisible ? 200 : 120 }
                ]}
                keyboardShouldPersistTaps="handled"
              >
                <View style={styles.actionsGrid}>
                  {MICRO_ACTIONS.map(action => {
                    const Icon = action.icon;
                    const isSelected = formData.selectedAction === action.id;
                    return (
                      <TouchableOpacity
                        key={action.id}
                        style={[
                          styles.actionCard,
                          isSelected && styles.actionCardSelected
                        ]}
                        onPress={() => {
                          selectAction(action.id);
                          setFormData(prev => ({ ...prev, customAction: '' }));
                        }}
                      >
                        <View style={[
                          styles.actionIconContainer,
                          isSelected && styles.actionIconContainerSelected
                        ]}>
                          <Icon size={24} color={isSelected ? '#FFFFFF' : '#0ea5e9'} />
                        </View>
                        <Text style={[
                          styles.actionTitle,
                          isSelected && styles.actionTitleSelected
                        ]}>{action.title}</Text>
                        <Text style={styles.actionSubtitle}>{action.subtitle}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                <View style={styles.customActionCard}>
                  <Text style={styles.customActionLabel}>或是，你想做什麼？</Text>
                  <TextInput
                    style={styles.customActionInput}
                    placeholder="輸入你的行動..."
                    placeholderTextColor="#cbd5e1"
                    value={formData.customAction}
                    onChangeText={text => {
                      setFormData(prev => ({
                        ...prev,
                        customAction: text,
                        selectedAction: text.trim() ? null : prev.selectedAction
                      }));
                    }}
                  />
                </View>
              </ScrollView>

              {!isKeyboardVisible && (
                <View style={styles.footer}>
                  <TouchableOpacity
                    style={[
                      styles.nextButton,
                      !hasAction && styles.nextButtonDisabled
                    ]}
                    onPress={() => {
                      if (hasAction) {
                        Keyboard.dismiss();
                        setTimeout(() => setCurrentPage('assessment'), 100);
                      }
                    }}
                    disabled={!hasAction}
                  >
                    <LinearGradient
                      colors={hasAction ? ['#0ea5e9', '#0ea5e9'] : ['#cbd5e1', '#cbd5e1']}
                      style={styles.nextButtonGradient}
                    >
                      <Text style={styles.nextButtonText}>完成練習</Text>
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

  // 8. 情緒評估頁（使用自定義滑杆）
  const renderAssessmentPage = () => (
    <View style={styles.fullScreen}>
      <LinearGradient
        colors={['#f0f9ff', '#e0f2fe']}
        style={styles.gradientBg}
      >
        <View style={styles.progressBarTop}>
          <ProgressBar currentStep={getCurrentStep()} totalSteps={totalSteps} />
        </View>

        <View style={styles.assessmentContent}>
          <View style={styles.assessmentCard}>
            <LinearGradient
              colors={['#29B6F6', '#0288D1']}
              style={styles.assessmentAccentBar}
            />

            <TouchableOpacity onPress={handleBack} style={styles.assessmentBackButton}>
              <ArrowLeft size={20} color="#64748b" />
            </TouchableOpacity>

            <Text style={styles.assessmentTitle}>感覺有好一點嗎？</Text>
            <Text style={styles.assessmentSubtitle}>請評估原本不舒服情緒的減緩程度</Text>

            <View style={styles.scoreDisplay}>
              <Text style={styles.scoreNumber}>{formData.postScore}</Text>
              <Text style={styles.scoreLabel}>分</Text>
            </View>

            <View style={styles.sliderWrapper}>
              <CustomSlider
                value={formData.postScore}
                onValueChange={(value) => setFormData(prev => ({ ...prev, postScore: value }))}
                min={1}
                max={10}
              />
              
              <View style={styles.sliderLabels}>
                <Text style={styles.sliderLabel}>1 (沒有減緩)</Text>
                <Text style={styles.sliderLabel}>10 (完全消失)</Text>
              </View>
            </View>

            {formData.postScore <= 3 && (
              <View style={styles.breathingSuggestionCard}>
                <View style={styles.breathingSuggestionHeader}>
                  <Wind size={20} color="#0ea5e9" />
                  <Text style={styles.breathingSuggestionTitle}>需要更多幫助嗎？</Text>
                </View>
                <Text style={styles.breathingSuggestionText}>
                  情緒還是有點緊繃，要不要先做個呼吸練習，讓身心都緩和下來？
                </Text>
                <TouchableOpacity
                  style={styles.breathingSuggestionButton}
                  onPress={handleGoToBreathing}
                >
                  <Wind size={16} color="#FFFFFF" />
                  <Text style={styles.breathingSuggestionButtonText}>開始呼吸練習</Text>
                </TouchableOpacity>
              </View>
            )}

            <TouchableOpacity
              style={styles.assessmentButton}
              onPress={() => setCurrentPage('review')}
            >
              <LinearGradient
                colors={['#29B6F6', '#0288D1']}
                style={styles.assessmentButtonGradient}
              >
                <Text style={styles.assessmentButtonText}>完成紀錄</Text>
                <ArrowRight size={20} color="#FFFFFF" />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>
    </View>
  );

  // 9. 練習回顧頁
  const renderReviewPage = () => {
    const displayEmotions = [...new Set([...formData.emotions, ...customEmotions])];
    const displayBodyReactions = [...new Set([...formData.bodyReactions, ...customBodyReactions])];
    const displayBehaviors = [...new Set([...formData.behaviors, ...customBehaviors])];

    const getSelectedActionText = () => {
      if (formData.customAction.trim()) return formData.customAction;
      const action = MICRO_ACTIONS.find(a => a.id === formData.selectedAction);
      return action?.title || '';
    };

    return (
      <View style={styles.fullScreen}>
        <LinearGradient
          colors={['#f0f9ff', '#e0f2fe']}
          style={styles.gradientBg}
        >
          <View style={styles.reviewHeader}>
            <TouchableOpacity onPress={handleBack} style={styles.headerBackButton}>
              <ArrowLeft size={24} color="#64748b" />
            </TouchableOpacity>
            <Text style={styles.reviewHeaderTitle}>練習回顧</Text>
            <View style={{ width: 40 }} />
          </View>

          <ScrollView
            contentContainerStyle={styles.reviewScrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.reviewSection}>
              <Text style={styles.reviewLabel}>事件</Text>
              <Text style={styles.reviewText}>{formData.event}</Text>
            </View>

            <View style={styles.reviewSection}>
              <View style={styles.reviewLabelRow}>
                <View style={styles.reviewDot} />
                <Text style={styles.reviewLabel}>當時的想法</Text>
              </View>
              <Text style={styles.reviewText}>{formData.thought}</Text>
            </View>

            {(displayEmotions.length > 0 || displayBodyReactions.length > 0 || displayBehaviors.length > 0) && (
              <View style={styles.reviewSection}>
                <View style={styles.reviewLabelRow}>
                  <View style={[styles.reviewDot, { backgroundColor: '#f59e0b' }]} />
                  <Text style={styles.reviewLabel}>情緒反應</Text>
                </View>
                
                {displayEmotions.length > 0 && (
                  <View style={styles.reviewReactionGroup}>
                    <Text style={styles.reviewReactionLabel}>情緒：</Text>
                    <View style={styles.reviewTagsContainer}>
                      {displayEmotions.map((emotion, index) => (
                        <View key={index} style={styles.reviewTag}>
                          <Text style={styles.reviewTagText}>{emotion}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}

                {displayBodyReactions.length > 0 && (
                  <View style={styles.reviewReactionGroup}>
                    <Text style={styles.reviewReactionLabel}>身體：</Text>
                    <View style={styles.reviewTagsContainer}>
                      {displayBodyReactions.map((reaction, index) => (
                        <View key={index} style={styles.reviewTag}>
                          <Text style={styles.reviewTagText}>{reaction}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}

                {displayBehaviors.length > 0 && (
                  <View style={styles.reviewReactionGroup}>
                    <Text style={styles.reviewReactionLabel}>行為：</Text>
                    <View style={styles.reviewTagsContainer}>
                      {displayBehaviors.map((behavior, index) => (
                        <View key={index} style={styles.reviewTag}>
                          <Text style={styles.reviewTagText}>{behavior}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}
              </View>
            )}

            <View style={styles.reviewArrow}>
              <View style={styles.reviewArrowCircle}>
                <ArrowDown size={20} color="#0ea5e9" />
              </View>
            </View>

            <View style={styles.reviewSection}>
              <View style={styles.reviewLabelRow}>
                <View style={[styles.reviewDot, { backgroundColor: '#10b981' }]} />
                <Text style={styles.reviewLabel}>轉念後的觀點</Text>
              </View>
              <Text style={styles.reviewText}>{formData.newPerspective}</Text>
            </View>

            <View style={styles.reviewActionSection}>
              <Text style={styles.reviewActionLabel}>接下來的微小行動</Text>
              <View style={styles.reviewActionItem}>
                <View style={styles.reviewActionCheck}>
                  <Check size={14} color="#FFFFFF" />
                </View>
                <Text style={styles.reviewActionText}>{getSelectedActionText()}</Text>
              </View>
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.nextButton}
              onPress={async () => {
                try {
                  setIsTiming(false);
                  await completeOnce();
                  await new Promise(resolve => setTimeout(resolve, 300));
                  setCurrentPage('completion');
                } catch (error) {
                  console.error('❌ 完成練習失敗:', error);
                  setCurrentPage('completion');
                }
              }}
            >
              <LinearGradient
                colors={['#0ea5e9', '#0ea5e9']}
                style={styles.nextButtonGradient}
              >
                <BookOpen size={20} color="#FFFFFF" />
                <Text style={styles.nextButtonText}>存入日記</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </View>
    );
  };

  // 10. 完成頁
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
        <LinearGradient
          colors={['#f0f9ff', '#e0f2fe']}
          style={styles.gradientBg}
        >
          <TouchableOpacity onPress={handleBack} style={styles.completionCloseButton}>
            <View style={styles.closeButtonCircle}>
              <X size={20} color="#64748b" />
            </View>
          </TouchableOpacity>

          <View style={styles.completionContent}>
            <View 
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
              }}
              pointerEvents="none"
            >
              {[...Array(20)].map((_, i) => (
                <StarConfetti key={i} index={i} />
              ))}
            </View>

            <Animated.View
              style={[
                styles.completionIconContainer,
                { transform: [{ scale: iconScale }] }
              ]}
            >
              <LinearGradient
                colors={['#60a5fa', '#38bdf8']}
                style={styles.completionIconGradient}
              >
                <Brain size={64} color="rgba(255,255,255,0.9)" />
              </LinearGradient>

              <Animated.View
                style={[
                  styles.starBadge,
                  { transform: [{ scale: starBadgeScale }] }
                ]}
              >
                <Star size={24} color="#FFFFFF" fill="#FFFFFF" />
              </Animated.View>
            </Animated.View>

            <Text style={styles.completionTitle}>做得很好！</Text>
            <Text style={styles.completionSubtitle}>你成功暫停了自動導航，</Text>
            <Text style={styles.completionSubtitle}>拿回了思維的主控權。</Text>

            <View style={styles.decorativeStars}>
              <Star size={16} color="#fbbf24" fill="#fbbf24" style={{ opacity: 0.6 }} />
              <Star size={12} color="#fbbf24" fill="#fbbf24" style={{ opacity: 0.4, marginLeft: 40, marginTop: -20 }} />
              <Star size={14} color="#fbbf24" fill="#fbbf24" style={{ opacity: 0.5, marginLeft: -60, marginTop: 10 }} />
            </View>

            <TouchableOpacity
              style={styles.viewJournalButton}
              onPress={handleViewJournal}
            >
              <BookOpen size={16} color="#0ea5e9" />
              <Text style={styles.viewJournalText}>查看日記</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </View>
    );
  };

  // ==================== 主渲染 ====================
  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f0f9ff" />
      {currentPage === 'intro' && renderIntroPage()}
      {currentPage === 'breathing' && renderBreathingPage()}
      {currentPage === 'event' && renderEventPage()}
      {currentPage === 'thought' && renderThoughtPage()}
      {currentPage === 'reaction' && renderReactionPage()}
      {currentPage === 'reframe' && renderReframePage()}
      {currentPage === 'action' && renderActionPage()}
      {currentPage === 'assessment' && renderAssessmentPage()}
      {currentPage === 'review' && renderReviewPage()}
      {currentPage === 'completion' && renderCompletionPage()}
    </View>
  );
}

// ==================== 樣式 ====================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f9ff',
  },
  fullScreen: {
    flex: 1,
  },
  gradientBg: {
    flex: 1,
  },

  // ========== 進度條 ==========
  progressBarTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: '#dbeafe',
    zIndex: 10,
  },
  progressContainer: {
    height: '100%',
    backgroundColor: 'transparent',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#0ea5e9',
  },

  // ========== 介紹頁 ==========
  closeButton: {
    position: 'absolute',
    top: 49,
    left: 24,
    zIndex: 20,
  },
  closeButtonCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  infoButton: {
    position: 'absolute',
    top: 49,
    right: 24,
    zIndex: 20,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#dbeafe',
  },
  infoButtonText: {
    fontSize: 14,
    color: '#0ea5e9',
    fontWeight: '600',
  },
  introScrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 100,
    paddingBottom: 80,
  },
  introIconContainer: {
    marginBottom: 24,
  },
  introIconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#bae6fd',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  introTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  introSubtitle: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 32,
  },
  stepsContainer: {
    width: '100%',
    marginBottom: 32,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#bae6fd',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 2,
  },
  stepIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  stepTextContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
  },
  stepText: {
    fontSize: 14,
    color: '#64748b',
  },
  introStartButton: {
    width: '100%',
    maxWidth: 400,
    height: 56,
    borderRadius: 28,
    overflow: 'hidden',
    shadowColor: '#bae6fd',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  introStartGradient: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  introStartText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#FFFFFF',
    letterSpacing: 1,
  },

  // ========== 說明彈窗 ==========
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.3)',
  },
  modalContent: {
    width: 360,
    maxHeight: 600,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.3,
    shadowRadius: 40,
    elevation: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1e293b',
  },
  modalCloseButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBody: {
    maxHeight: 400,
    marginBottom: 24,
  },
  modalSection: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  modalIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  modalTextContainer: {
    flex: 1,
  },
  modalSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 4,
  },
  modalSectionText: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 22,
  },
  modalButton: {
    width: '100%',
    height: 48,
    backgroundColor: '#0ea5e9',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#bae6fd',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
  },

  // ========== 呼吸準備頁 ==========
  breathingContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  breathingIconContainer: {
    marginBottom: 48,
  },
  breathingIconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#e0f2fe',
    justifyContent: 'center',
    alignItems: 'center',
  },
  breathingTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 12,
    textAlign: 'center',
  },
  breathingSubtitle: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 24,
  },
  skipButton: {
    marginTop: 48,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  skipButtonText: {
    fontSize: 14,
    color: '#94a3b8',
    fontWeight: '500',
  },

  // ========== 頭部 ==========
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 24,
  },
  headerBackButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // ========== 標題區域 ==========
  titleSection: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  pageSubtitle: {
    fontSize: 16,
    color: '#64748b',
    fontWeight: '500',
    marginBottom: 12,
    lineHeight: 24,
  },
  noteContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  noteText: {
    flex: 1,
    fontSize: 12,
    color: '#64748b',
    lineHeight: 18,
  },

  // ========== 內容區域 ==========
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 120,
  },
  inputCard: {
    minHeight: 200,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    shadowColor: '#bae6fd',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 4,
  },
  textarea: {
    flex: 1,
    fontSize: 16,
    color: '#334155',
    lineHeight: 24,
  },

  // ========== 書寫提示 ==========
  tipsSection: {
    marginTop: 16,
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
    color: '#0ea5e9',
  },
  tipsContent: {
    backgroundColor: 'rgba(224, 242, 254, 0.5)',
    borderRadius: 16,
    padding: 16,
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
    backgroundColor: '#60a5fa',
    marginTop: 6,
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    color: '#64748b',
    lineHeight: 22,
  },

  // ========== 反應選擇頁 ==========
  reactionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1e293b',
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  reactionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#bae6fd',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 4,
  },
  reactionSection: {
    marginBottom: 24,
  },
  reactionSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
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
    backgroundColor: '#0ea5e9',
    borderColor: '#0ea5e9',
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
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: '#bfdbfe',
    gap: 6,
  },
  customInput: {
    fontSize: 14,
    color: '#334155',
    paddingHorizontal: 8,
    paddingVertical: 4,
    minWidth: 60,
    maxWidth: 120,
  },
  customCheckButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#0ea5e9',
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

  // ========== 靈感小卡 ==========
  cardsSection: {
    marginTop: 24,
  },
  cardsSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  cardsSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0ea5e9',
  },
  cardsScrollContent: {
    paddingRight: 40,
  },
  inspirationCard: {
    width: SCREEN_WIDTH - 100,
    marginRight: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#bae6fd',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 2,
  },
  inspirationCardSelected: {
    borderColor: '#0ea5e9',
    backgroundColor: '#f0f9ff',
  },
  inspirationCardText: {
    fontSize: 14,
    color: '#334155',
    lineHeight: 22,
  },
  cardsNavigation: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    gap: 16,
  },
  navButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  navButtonDisabled: {
    opacity: 0.5,
  },
  cardsDots: {
    flexDirection: 'row',
    gap: 6,
  },
  cardDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#cbd5e1',
  },
  cardDotActive: {
    backgroundColor: '#0ea5e9',
    width: 18,
  },

  // ========== 微小行動頁 ==========
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  actionCard: {
    width: (SCREEN_WIDTH - 60) / 2,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#bae6fd',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 2,
  },
  actionCardSelected: {
    borderColor: '#0ea5e9',
    backgroundColor: '#f0f9ff',
  },
  actionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#e0f2fe',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  actionIconContainerSelected: {
    backgroundColor: '#0ea5e9',
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 4,
    textAlign: 'center',
  },
  actionTitleSelected: {
    color: '#0ea5e9',
  },
  actionSubtitle: {
    fontSize: 12,
    color: '#94a3b8',
    textAlign: 'center',
  },
  customActionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  customActionLabel: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 12,
  },
  customActionInput: {
    fontSize: 16,
    color: '#334155',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    paddingVertical: 8,
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
    color: '#0288D1',
    lineHeight: 72,
  },
  scoreLabel: {
    fontSize: 24,
    fontWeight: '600',
    color: '#94a3b8',
    marginTop: 20,
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
  breathingSuggestionCard: {
    backgroundColor: '#f0f9ff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#bae6fd',
  },
  breathingSuggestionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  breathingSuggestionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0369a1',
  },
  breathingSuggestionText: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 22,
    marginBottom: 16,
  },
  breathingSuggestionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#0ea5e9',
    paddingVertical: 12,
    borderRadius: 12,
  },
  breathingSuggestionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  assessmentButton: {
    width: '100%',
    height: 56,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#bae6fd',
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
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  // ========== 練習回顧頁 ==========
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 48,
    paddingBottom: 16,
  },
  reviewHeaderTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
  },
  reviewScrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 120,
  },
  reviewSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#bae6fd',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 2,
  },
  reviewLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  reviewDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#0ea5e9',
  },
  reviewLabel: {
    fontSize: 12,
    color: '#94a3b8',
    fontWeight: '500',
    marginBottom: 8,
  },
  reviewText: {
    fontSize: 16,
    color: '#334155',
    lineHeight: 24,
  },
  reviewReactionGroup: {
    marginBottom: 12,
  },
  reviewReactionLabel: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '600',
    marginBottom: 8,
  },
  reviewTagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  reviewTag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: '#e0f2fe',
    borderWidth: 1,
    borderColor: '#bae6fd',
  },
  reviewTagText: {
    fontSize: 13,
    color: '#0369a1',
    fontWeight: '500',
  },
  reviewArrow: {
    alignItems: 'center',
    marginVertical: 8,
  },
  reviewArrowCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e0f2fe',
    justifyContent: 'center',
    alignItems: 'center',
  },
  reviewActionSection: {
    backgroundColor: '#e0f2fe',
    borderRadius: 16,
    padding: 20,
    marginTop: 8,
  },
  reviewActionLabel: {
    fontSize: 12,
    color: '#0ea5e9',
    fontWeight: '600',
    marginBottom: 12,
  },
  reviewActionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  reviewActionCheck: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#10b981',
    justifyContent: 'center',
    alignItems: 'center',
  },
  reviewActionText: {
    fontSize: 16,
    color: '#334155',
    fontWeight: '500',
  },

  // ========== 完成頁 ==========
  completionCloseButton: {
    position: 'absolute',
    top: 49,
    left: 24,
    zIndex: 20,
  },
  completionContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  completionIconContainer: {
    position: 'relative',
    width: 128,
    height: 128,
    marginBottom: 32,
  },
  completionIconGradient: {
    width: 128,
    height: 128,
    borderRadius: 64,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#bae6fd',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  starBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#fbbf24',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  completionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 8,
  },
  completionSubtitle: {
    fontSize: 15,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 28,
  },
  decorativeStars: {
    flexDirection: 'row',
    marginVertical: 24,
  },
  viewJournalButton: {
    width: '100%',
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(14, 165, 233, 0.2)',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  viewJournalText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0ea5e9',
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
    shadowColor: '#bae6fd',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  nextButtonDisabled: {
    shadowOpacity: 0,
    elevation: 0,
  },
  nextButtonGradient: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  nextButtonText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
});