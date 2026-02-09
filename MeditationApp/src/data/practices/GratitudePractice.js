// ==========================================
// 檔案名稱: GratitudePractice.js
// 感恩練習 - 三種子練習模式
// 版本: V1.3 - 內建 PracticeStorage
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
  ArrowRight,
  ArrowLeft,
  Star,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  BookOpen,
  Mail,
  Sparkles,
  Heart,
  Lightbulb,
  Send,
} from 'lucide-react-native';
import ApiService from '../../../api';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// ==================== 本地存儲工具 ====================
const PracticeStorage = {
  async saveDraft(practiceData) {
    try {
      const data = { ...practiceData, savedAt: new Date().toISOString() };
      await AsyncStorage.setItem('@gratitude_practice_draft', JSON.stringify(data));
      console.log('練習草稿已保存');
      return true;
    } catch (error) {
      console.error('保存練習草稿失敗:', error);
      return false;
    }
  },

  async getDraft() {
    try {
      const data = await AsyncStorage.getItem('@gratitude_practice_draft');
      if (!data) return null;
      const draft = JSON.parse(data);
      const savedTime = new Date(draft.savedAt).getTime();
      const now = Date.now();
      const hoursPassed = (now - savedTime) / (1000 * 60 * 60);
      if (hoursPassed > 24) {
        await this.clearDraft();
        return null;
      }
      return draft;
    } catch (error) {
      console.error('讀取練習草稿失敗:', error);
      return null;
    }
  },

  async clearDraft() {
    try {
      await AsyncStorage.removeItem('@gratitude_practice_draft');
      console.log('練習草稿已清除');
      return true;
    } catch (error) {
      console.error('清除練習草稿失敗:', error);
      return false;
    }
  },
};

// ==================== 自定義滑杆組件 ====================
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

// ==================== 練習類型配置 ====================
const PRACTICE_TYPES = {
  DIARY: 'diary',
  LETTER: 'letter',
  IF: 'if',
};

// ==================== 初始表單資料 ====================
const INITIAL_FORM_DATA = {
  // 感恩日記
  gratitudeItems: '',
  gratitudeFeeling: '',
  // 迷你感謝信
  recipient: '',
  thankMessage: '',
  // 如果練習
  ifImagine: '',
  ifAppreciate: '',
  // 共用
  postScore: 5,
  practiceType: null,
  timestamp: 0,
};

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
const InfoModal = ({ visible, onClose, type }) => {
  const getContent = () => {
    switch (type) {
      case 'main':
        return {
          title: '關於感恩練習',
          sections: [
            {
              icon: Heart,
              iconBg: '#fce7f3',
              iconColor: '#ec4899',
              title: '為什麼要練習感恩？',
              text: '研究顯示，每天花幾分鐘記錄感恩的事物，可以提升幸福感、改善睡眠品質、增強免疫系統，甚至能改善人際關係。感恩練習幫助我們把注意力從「缺乏」轉向「擁有」。',
            },
            {
              icon: Lightbulb,
              iconBg: '#fef3c7',
              iconColor: '#f59e0b',
              title: '三種練習方式',
              text: '感恩日記：記錄日常小確幸\n迷你感謝信：向他人表達感謝\n如果練習：透過想像失去來珍惜擁有',
            },
            {
              icon: Star,
              iconBg: '#e0f2fe',
              iconColor: '#0ea5e9',
              title: '持續練習的力量',
              text: '感恩就像肌肉，越練習越強壯。研究發現連續練習 21 天，大腦會開始自動搜尋生活中的美好事物。',
            },
          ],
        };
      case 'diary':
        return {
          title: '關於感恩日記',
          sections: [
            {
              icon: BookOpen,
              iconBg: '#e0f2fe',
              iconColor: '#0ea5e9',
              title: '什麼是感恩日記？',
              text: '每天記錄 1-3 件讓你感謝的人、事、物。不需要是驚天動地的大事，一杯好喝的咖啡、一個朋友的微笑、完成一件小任務，都值得被記錄。',
            },
            {
              icon: Heart,
              iconBg: '#fce7f3',
              iconColor: '#ec4899',
              title: '為什麼要寫感受?',
              text: '光是列出感恩的事還不夠，當我們深入思考「這件事帶給我什麼感受」，大腦會建立更深的正向連結，效果更持久。',
            },
          ],
        };
      case 'letter':
        return {
          title: '關於迷你感謝信',
          sections: [
            {
              icon: Mail,
              iconBg: '#e0f2fe',
              iconColor: '#0ea5e9',
              title: '什麼是迷你感謝信？',
              text: '用簡短的文字，向生命中重要的人表達感謝。可以是家人、朋友、同事，甚至是曾經幫助過你的陌生人。',
            },
            {
              icon: Send,
              iconBg: '#d1fae5',
              iconColor: '#10b981',
              title: '要真的寄出去嗎?',
              text: '寫完後，建議你試著把這段話傳給對方!研究發現，表達感謝不只讓自己更快樂，也能大幅提升對方的幸福感，溫暖關係。',
            },
          ],
        };
      case 'if':
        return {
          title: '關於如果練習',
          sections: [
            {
              icon: Sparkles,
              iconBg: '#ede9fe',
              iconColor: '#8b5cf6',
              title: '什麼是如果練習?',
              text: '透過想像「如果沒有某個人事物」,來覺察我們習以為常卻珍貴的擁有。這是一種「心理對比」技術,能有效提升感恩的深度。',
            },
            {
              icon: Heart,
              iconBg: '#fce7f3',
              iconColor: '#ec4899',
              title: '為什麼這麼有效?',
              text: '人類的大腦很容易「適應」美好的事物,久了就習以為常。透過想像失去,我們能重新感受到這些事物的珍貴,打破「理所當然」的慣性。',
            },
          ],
        };
      default:
        return { title: '', sections: [] };
    }
  };

  const content = getContent();

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
            <Text style={styles.modalTitle}>{content.title}</Text>
            <TouchableOpacity onPress={onClose} style={styles.modalCloseButton}>
              <X size={20} color="#64748b" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
            {content.sections.map((section, index) => {
              const Icon = section.icon;
              return (
                <View key={index} style={styles.modalSection}>
                  <View style={[styles.modalIconContainer, { backgroundColor: section.iconBg }]}>
                    <Icon size={20} color={section.iconColor} />
                  </View>
                  <View style={styles.modalTextContainer}>
                    <Text style={styles.modalSectionTitle}>{section.title}</Text>
                    <Text style={styles.modalSectionText}>{section.text}</Text>
                  </View>
                </View>
              );
            })}
          </ScrollView>

          <TouchableOpacity onPress={onClose} style={styles.modalButton}>
            <Text style={styles.modalButtonText}>我知道了</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

// ==================== 主組件 ====================
export default function GratitudePractice({ onBack, navigation, onHome }) {
  // 頁面狀態
  const [currentPage, setCurrentPage] = useState('menu');
  const [formData, setFormData] = useState(INITIAL_FORM_DATA);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [infoModalType, setInfoModalType] = useState('main');

  // Practice 狀態
  const [practiceId, setPracticeId] = useState(null);
  const [startTime, setStartTime] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isTiming, setIsTiming] = useState(false);

  // 恢復練習相關狀態
  const [showRestoreModal, setShowRestoreModal] = useState(false);
  const [savedPractice, setSavedPractice] = useState(null);

  // 書寫提示展開狀態
  const [showTips, setShowTips] = useState(false);
  const [showExamples, setShowExamples] = useState(false);

  // 鍵盤狀態
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

  // 動畫值
  const iconScale = useRef(new Animated.Value(0)).current;
  const starBadgeScale = useRef(new Animated.Value(0)).current;
  const menuItemsAnim = useRef([
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
  ]).current;

  // 當前步驟計算
  const getCurrentStep = () => {
    const stepMap = {
      'menu': 0,
      'diary-intro': 0,
      'diary-write': 1,
      'diary-feeling': 2,
      'letter-intro': 0,
      'letter-recipient': 1,
      'letter-message': 2,
      'if-intro': 0,
      'if-imagine': 1,
      'if-appreciate': 2,
      'assessment': 3,
      'completion': 4,
    };
    return stepMap[currentPage] || 0;
  };

  const totalSteps = 3;

  // ==================== Practice 管理 ====================
  const initializePractice = async (type) => {
    try {
      const practiceTypeMap = {
        [PRACTICE_TYPES.DIARY]: '感恩日記',
        [PRACTICE_TYPES.LETTER]: '迷你感謝信',
        [PRACTICE_TYPES.IF]: '如果練習',
      };
      
      const response = await ApiService.startPractice(practiceTypeMap[type] || '感恩練習');
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

  const handleComplete = async () => {
    let totalSeconds = elapsedTime || 60;

    const practiceTypeMap = {
      [PRACTICE_TYPES.DIARY]: '感恩日記',
      [PRACTICE_TYPES.LETTER]: '迷你感謝信',
      [PRACTICE_TYPES.IF]: '如果練習',
    };

    const payloadFormData = {
      ...formData,
      timestamp: Date.now(),
    };

    try {
      await ApiService.completePractice(practiceId, {
        practice_type: practiceTypeMap[formData.practiceType] || '感恩練習',
        duration: Math.max(1, Math.ceil(totalSeconds / 60)),
        duration_seconds: totalSeconds,
        form_data: payloadFormData,
      });

      // 完成後清除本地草稿
      await PracticeStorage.clearDraft();
      console.log('練習完成，本地草稿已清除');
    } catch (error) {
      console.error('完成練習失敗:', error);
      throw error;
    }
  };

  // 恢復練習
  const restorePractice = async () => {
    if (!savedPractice) return;
    
    console.log('恢復練習:', savedPractice);
    
    setFormData(savedPractice.formData);
    setPracticeId(savedPractice.practiceId);
    setElapsedTime(savedPractice.elapsedTime || 0);
    setStartTime(Date.now());
    setIsTiming(true);
    
    if (savedPractice.currentPage && savedPractice.currentPage !== 'menu') {
      setCurrentPage(savedPractice.currentPage);
    } else {
      const { practiceType, currentStep } = savedPractice;
      
      if (practiceType === PRACTICE_TYPES.DIARY) {
        if (currentStep >= 2) setCurrentPage('diary-feeling');
        else if (currentStep >= 1) setCurrentPage('diary-write');
        else setCurrentPage('diary-intro');
      } else if (practiceType === PRACTICE_TYPES.LETTER) {
        if (currentStep >= 2) setCurrentPage('letter-message');
        else if (currentStep >= 1) setCurrentPage('letter-recipient');
        else setCurrentPage('letter-intro');
      } else if (practiceType === PRACTICE_TYPES.IF) {
        if (currentStep >= 2) setCurrentPage('if-appreciate');
        else if (currentStep >= 1) setCurrentPage('if-imagine');
        else setCurrentPage('if-intro');
      }
    }
    
    setShowRestoreModal(false);
  };

  // 放棄恢復
  const discardSavedPractice = async () => {
    await PracticeStorage.clearDraft();
    setSavedPractice(null);
    setShowRestoreModal(false);
  };

  // ==================== 生命週期 ====================
  // 檢查本地草稿
  useEffect(() => {
    const checkLocalDraft = async () => {
      try {
        const draft = await PracticeStorage.getDraft();
        if (draft) {
          console.log('發現未完成的練習:', draft);
          setSavedPractice(draft);
          setShowRestoreModal(true);
        }
      } catch (error) {
        console.log('檢查本地草稿失敗:', error);
      }
    };
    
    checkLocalDraft();
  }, []);

  // 自動保存到本地
  useEffect(() => {
    if (!practiceId || currentPage === 'menu' || currentPage === 'completion') {
      return;
    }

    const autoSave = async () => {
      const draftData = {
        practiceId,
        practiceType: formData.practiceType,
        currentPage,
        currentStep: getCurrentStep(),
        formData,
        elapsedTime,
        savedAt: new Date().toISOString(),
      };

      await PracticeStorage.saveDraft(draftData);
    };

    autoSave();
    const interval = setInterval(autoSave, 10000);
    return () => clearInterval(interval);
  }, [practiceId, currentPage, formData, elapsedTime]);

  // 組件卸載時保存
  useEffect(() => {
    return () => {
      if (practiceId && currentPage !== 'completion' && currentPage !== 'menu') {
        PracticeStorage.saveDraft({
          practiceId,
          practiceType: formData.practiceType,
          currentPage,
          currentStep: getCurrentStep(),
          formData,
          elapsedTime,
          savedAt: new Date().toISOString(),
        });
      }
    };
  }, [practiceId, currentPage, formData, elapsedTime]);

  // 選單頁面動畫
  useEffect(() => {
    if (currentPage === 'menu') {
      menuItemsAnim.forEach((anim, index) => {
        Animated.spring(anim, {
          toValue: 1,
          tension: 80,
          friction: 12,
          delay: index * 100,
          useNativeDriver: true,
        }).start();
      });
    }
  }, [currentPage]);

  // 計時器
  useEffect(() => {
    if (!startTime || !isTiming) return;

    const timer = setInterval(() => {
      setElapsedTime(prev => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [startTime, isTiming]);

  // 鍵盤監聽
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
  const handleBackToHome = async () => {
    // 如果在練習過程中返回，保存草稿
    if (practiceId && currentPage !== 'completion' && currentPage !== 'menu') {
      await PracticeStorage.saveDraft({
        practiceId,
        practiceType: formData.practiceType,
        currentPage,
        currentStep: getCurrentStep(),
        formData,
        elapsedTime,
        savedAt: new Date().toISOString(),
      });
      console.log('返回前已保存草稿');
    }

    if (onHome) {
      onHome();
    } else if (navigation) {
      navigation.navigate('MainTabs', { screen: 'Home' });
    } else if (onBack) {
      onBack();
    } else if (navigation) {
      navigation.goBack();
    }
  };

  const handleBack = () => {
    const backMap = {
      'menu': handleBackToHome,
      'diary-intro': () => setCurrentPage('menu'),
      'diary-write': () => setCurrentPage('diary-intro'),
      'diary-feeling': () => setCurrentPage('diary-write'),
      'letter-intro': () => setCurrentPage('menu'),
      'letter-recipient': () => setCurrentPage('letter-intro'),
      'letter-message': () => setCurrentPage('letter-recipient'),
      'if-intro': () => setCurrentPage('menu'),
      'if-imagine': () => setCurrentPage('if-intro'),
      'if-appreciate': () => setCurrentPage('if-imagine'),
      'assessment': () => {
        if (formData.practiceType === PRACTICE_TYPES.DIARY) setCurrentPage('diary-feeling');
        else if (formData.practiceType === PRACTICE_TYPES.LETTER) setCurrentPage('letter-message');
        else if (formData.practiceType === PRACTICE_TYPES.IF) setCurrentPage('if-appreciate');
      },
      'completion': handleBackToHome,
    };
    backMap[currentPage]?.();
  };

  const selectPracticeType = (type) => {
    setFormData(prev => ({ ...prev, practiceType: type }));
    initializePractice(type);
    
    switch (type) {
      case PRACTICE_TYPES.DIARY:
        setCurrentPage('diary-intro');
        break;
      case PRACTICE_TYPES.LETTER:
        setCurrentPage('letter-intro');
        break;
      case PRACTICE_TYPES.IF:
        setCurrentPage('if-intro');
        break;
    }
  };

  const showInfo = (type) => {
    setInfoModalType(type);
    setShowInfoModal(true);
  };

  // ==================== 頁面渲染 ====================

  // 恢復練習彈窗
  const RestoreModal = () => {
    const getPracticeTypeName = () => {
      if (savedPractice?.practiceType === PRACTICE_TYPES.DIARY) return '感恩日記';
      if (savedPractice?.practiceType === PRACTICE_TYPES.LETTER) return '迷你感謝信';
      if (savedPractice?.practiceType === PRACTICE_TYPES.IF) return '如果練習';
      return '感恩練習';
    };

    const getTimeSince = () => {
      if (!savedPractice?.savedAt) return '';
      
      const savedTime = new Date(savedPractice.savedAt);
      const now = new Date();
      const diffMs = now - savedTime;
      const diffMins = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      
      if (diffMins < 1) return '剛剛';
      else if (diffMins < 60) return `${diffMins} 分鐘前`;
      else if (diffHours < 24) return `${diffHours} 小時前`;
      else return '昨天';
    };

    return (
      <Modal
        visible={showRestoreModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => {}}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={() => {}}
          />
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>發現未完成的練習</Text>
            </View>

            <View style={styles.modalBody}>
              <Text style={styles.restoreModalText}>
                你有一個{getTimeSince()}保存的{getPracticeTypeName()}，要繼續完成嗎？
              </Text>
            </View>

            <View style={styles.restoreModalButtons}>
              <TouchableOpacity 
                onPress={discardSavedPractice} 
                style={[styles.restoreModalButton, styles.restoreModalButtonSecondary]}
              >
                <Text style={styles.restoreModalButtonTextSecondary}>開始新的</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                onPress={restorePractice} 
                style={[styles.restoreModalButton, styles.restoreModalButtonPrimary]}
              >
                <LinearGradient 
                  colors={['#0ea5e9', '#0ea5e9']} 
                  style={styles.restoreModalButtonGradient}
                >
                  <Text style={styles.restoreModalButtonTextPrimary}>繼續完成</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  // 選單頁面
  const renderMenuPage = () => {
    const menuItems = [
      {
        id: PRACTICE_TYPES.DIARY,
        icon: BookOpen,
        iconBg: '#dbeafe',
        iconColor: '#3b82f6',
        title: '感恩日記',
        subtitle: '記錄日常小確幸',
      },
      {
        id: PRACTICE_TYPES.LETTER,
        icon: Mail,
        iconBg: '#dbeafe',
        iconColor: '#3b82f6',
        title: '迷你感謝信',
        subtitle: '傳遞溫暖給他人',
      },
      {
        id: PRACTICE_TYPES.IF,
        icon: Sparkles,
        iconBg: '#ede9fe',
        iconColor: '#8b5cf6',
        title: '如果練習',
        subtitle: '透過「失去」覺察「擁有」',
      },
    ];

    return (
      <View style={styles.fullScreen}>
        <LinearGradient
          colors={['#f0f9ff', '#e0f2fe']}
          style={styles.gradientBg}
        >
          <TouchableOpacity onPress={handleBack} style={styles.menuBackButton}>
            <ChevronLeft size={24} color="#64748b" />
          </TouchableOpacity>

          <TouchableOpacity onPress={() => showInfo('main')} style={styles.infoButton}>
            <HelpCircle size={16} color="#0ea5e9" />
            <Text style={styles.infoButtonText}>為什麼要練習感恩?</Text>
          </TouchableOpacity>

          <View style={styles.menuContent}>
            <Text style={styles.menuTitle}>今天想怎麼練習感恩?</Text>

            {menuItems.map((item, index) => {
              const Icon = item.icon;
              return (
                <Animated.View
                  key={item.id}
                  style={{
                    opacity: menuItemsAnim[index],
                    transform: [{
                      translateY: menuItemsAnim[index].interpolate({
                        inputRange: [0, 1],
                        outputRange: [30, 0],
                      }),
                    }],
                  }}
                >
                  <TouchableOpacity
                    style={styles.menuItem}
                    onPress={() => selectPracticeType(item.id)}
                    activeOpacity={0.8}
                  >
                    <View style={[styles.menuItemIcon, { backgroundColor: item.iconBg }]}>
                      <Icon size={24} color={item.iconColor} />
                    </View>
                    <View style={styles.menuItemText}>
                      <Text style={styles.menuItemTitle}>{item.title}</Text>
                      <Text style={styles.menuItemSubtitle}>{item.subtitle}</Text>
                    </View>
                    <ChevronLeft size={20} color="#cbd5e1" style={{ transform: [{ rotate: '180deg' }] }} />
                  </TouchableOpacity>
                </Animated.View>
              );
            })}
          </View>

          <InfoModal
            visible={showInfoModal}
            onClose={() => setShowInfoModal(false)}
            type={infoModalType}
          />
        </LinearGradient>
      </View>
    );
  };

  // ==================== 感恩日記 ====================
  const renderDiaryIntro = () => (
    <View style={styles.fullScreen}>
      <LinearGradient colors={['#f0f9ff', '#e0f2fe']} style={styles.gradientBg}>
        <ScrollView contentContainerStyle={styles.introScrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.introIconContainer}>
            <View style={styles.introIconCircle}>
              <BookOpen size={40} color="#3b82f6" />
            </View>
          </View>

          <Text style={styles.introTitle}>感恩日記</Text>
          <Text style={styles.introSubtitle}>
            記錄生活中的微小幸福,{'\n'}
            是建立心理韌性的第一步 。
          </Text>

          <TouchableOpacity onPress={() => showInfo('diary')} style={styles.introInfoLink}>
            <HelpCircle size={16} color="#0ea5e9" />
            <Text style={styles.introInfoLinkText}>為什麼要做這個練習?</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.introStartButton}
            onPress={() => setCurrentPage('diary-write')}
          >
            <LinearGradient colors={['#0ea5e9', '#0ea5e9']} style={styles.introStartGradient}>
              <Text style={styles.introStartText}>開始練習</Text>
              <ArrowRight size={20} color="#FFFFFF" />
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setCurrentPage('menu')} style={styles.returnMenuButton}>
            <Text style={styles.returnMenuText}>返回選單</Text>
          </TouchableOpacity>
        </ScrollView>

        <InfoModal visible={showInfoModal} onClose={() => setShowInfoModal(false)} type={infoModalType} />
      </LinearGradient>
    </View>
  );

  const renderDiaryWrite = () => {
    const tips = [
      '可以是很大、很日常的事',
      '也可以感謝自己的某個選擇或努力',
      '不用想太多,第一個浮現的就對了',
    ];

    const examples = [
      '今天的早餐很好吃',
      '同事幫我倒了一杯水',
      '準時完成了工作',
      '和朋友聊了開心的話題',
      '天氣很好,心情也跟著好',
      '身體健康,能夠正常生活',
    ];

    return (
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.fullScreen}>
            <LinearGradient colors={['#f0f9ff', '#e0f2fe']} style={styles.gradientBg}>
              <View style={styles.progressBarTop}>
                <ProgressBar currentStep={1} totalSteps={totalSteps} />
              </View>

              <View style={styles.header}>
                <TouchableOpacity onPress={handleBack} style={styles.headerBackButton}>
                  <ArrowLeft size={24} color="#64748b" />
                </TouchableOpacity>
                <View style={{ width: 40 }} />
              </View>

              <View style={styles.titleSection}>
                <Text style={styles.pageTitleCentered}>感恩日記</Text>
                <Text style={styles.pageSubtitleCentered}>寫下 1-3 個今天讓你感謝的人/事/物</Text>
                <View style={styles.noteCentered}>
                  <Star size={16} color="#fbbf24" fill="#fbbf24" />
                  <Text style={styles.noteTextCentered}>
                    可以是很大、很日常的事,也可以感謝自己的某個選擇或努力
                  </Text>
                </View>
              </View>

              <ScrollView
                contentContainerStyle={[styles.scrollContent, { paddingBottom: isKeyboardVisible ? 200 : 300 }]}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
              >
                <View style={styles.inputCard}>
                  <TextInput
                    style={styles.textarea}
                    multiline
                    placeholder="今天我感謝的是... (可寫1-3個)"
                    placeholderTextColor="#cbd5e1"
                    value={formData.gratitudeItems}
                    onChangeText={text => setFormData(prev => ({ ...prev, gratitudeItems: text }))}
                    textAlignVertical="top"
                  />
                </View>

                <View style={styles.tipsSection}>
                  <TouchableOpacity onPress={() => setShowTips(!showTips)} style={styles.tipsToggle}>
                    {showTips ? <ChevronUp size={16} color="#0ea5e9" /> : <ChevronDown size={16} color="#0ea5e9" />}
                    <Text style={styles.tipsToggleText}>書寫提示</Text>
                  </TouchableOpacity>

                  {showTips && (
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

                <View style={styles.examplesSection}>
                  <TouchableOpacity onPress={() => setShowExamples(!showExamples)} style={styles.examplesToggle}>
                    <Lightbulb size={16} color="#0ea5e9" />
                    <Text style={styles.examplesToggleText}>{showExamples ? '收起參考範例' : '參考範例'}</Text>
                  </TouchableOpacity>

                  {showExamples && (
                    <View style={styles.examplesContent}>
                      {examples.map((ex, i) => (
                        <TouchableOpacity
                          key={i}
                          style={styles.exampleChip}
                          onPress={() => setFormData(prev => ({
                            ...prev,
                            gratitudeItems: prev.gratitudeItems ? `${prev.gratitudeItems}\n${ex}` : ex
                          }))}
                        >
                          <Text style={styles.exampleText}>{ex}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </View>
              </ScrollView>

              {!isKeyboardVisible && (
                <View style={styles.footer}>
                  <TouchableOpacity
                    style={[styles.nextButton, !formData.gratitudeItems.trim() && styles.nextButtonDisabled]}
                    onPress={() => {
                      if (formData.gratitudeItems.trim()) {
                        Keyboard.dismiss();
                        setShowTips(false);
                        setShowExamples(false);
                        setTimeout(() => setCurrentPage('diary-feeling'), 100);
                      }
                    }}
                    disabled={!formData.gratitudeItems.trim()}
                  >
                    <LinearGradient
                      colors={formData.gratitudeItems.trim() ? ['#0ea5e9', '#0ea5e9'] : ['#cbd5e1', '#cbd5e1']}
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

  const renderDiaryFeeling = () => {
    const tips = [
      '這件事讓你有什麼感覺?',
      '它提醒了你什麼重要的事?',
      '你從中學到或體會到什麼?',
    ];

    return (
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.fullScreen}>
            <LinearGradient colors={['#f0f9ff', '#e0f2fe']} style={styles.gradientBg}>
              <View style={styles.progressBarTop}>
                <ProgressBar currentStep={2} totalSteps={totalSteps} />
              </View>

              <View style={styles.header}>
                <TouchableOpacity onPress={handleBack} style={styles.headerBackButton}>
                  <ArrowLeft size={24} color="#64748b" />
                </TouchableOpacity>
                <View style={{ width: 40 }} />
              </View>

              <View style={styles.titleSection}>
                <Text style={styles.pageTitleCentered}>感恩日記</Text>
                <Text style={styles.pageSubtitleCentered}>這件事帶給我的感受或提醒</Text>
                <View style={styles.noteCentered}>
                  <Star size={16} color="#fbbf24" fill="#fbbf24" />
                  <Text style={styles.noteTextCentered}>覺察這份感謝帶給你的正向感受</Text>
                </View>
              </View>

              <ScrollView
                contentContainerStyle={[styles.scrollContent, { paddingBottom: isKeyboardVisible ? 200 : 300 }]}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
              >
                <View style={styles.inputCard}>
                  <TextInput
                    style={styles.textarea}
                    multiline
                    placeholder="這件事帶給我...&#10;我覺得..."
                    placeholderTextColor="#cbd5e1"
                    value={formData.gratitudeFeeling}
                    onChangeText={text => setFormData(prev => ({ ...prev, gratitudeFeeling: text }))}
                    textAlignVertical="top"
                  />
                </View>

                <View style={styles.tipsSection}>
                  <TouchableOpacity onPress={() => setShowTips(!showTips)} style={styles.tipsToggle}>
                    {showTips ? <ChevronUp size={16} color="#0ea5e9" /> : <ChevronDown size={16} color="#0ea5e9" />}
                    <Text style={styles.tipsToggleText}>書寫提示</Text>
                  </TouchableOpacity>

                  {showTips && (
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
                    style={[styles.nextButton, !formData.gratitudeFeeling.trim() && styles.nextButtonDisabled]}
                    onPress={() => {
                      if (formData.gratitudeFeeling.trim()) {
                        Keyboard.dismiss();
                        setTimeout(() => setCurrentPage('assessment'), 100);
                      }
                    }}
                    disabled={!formData.gratitudeFeeling.trim()}
                  >
                    <LinearGradient
                      colors={formData.gratitudeFeeling.trim() ? ['#0ea5e9', '#0ea5e9'] : ['#cbd5e1', '#cbd5e1']}
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

  // ==================== 迷你感謝信 ====================
  const renderLetterIntro = () => (
    <View style={styles.fullScreen}>
      <LinearGradient colors={['#f0f9ff', '#e0f2fe']} style={styles.gradientBg}>
        <ScrollView contentContainerStyle={styles.introScrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.introIconContainer}>
            <View style={styles.introIconCircle}>
              <Mail size={40} color="#3b82f6" />
            </View>
          </View>

          <Text style={styles.introTitle}>迷你感謝信</Text>
          <Text style={styles.introSubtitle}>
            用一句簡單的謝謝,{'\n'}
            連結彼此的心,溫暖關係。
          </Text>

          <TouchableOpacity onPress={() => showInfo('letter')} style={styles.introInfoLink}>
            <HelpCircle size={16} color="#0ea5e9" />
            <Text style={styles.introInfoLinkText}>為什麼要做這個練習?</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.introStartButton}
            onPress={() => setCurrentPage('letter-recipient')}
          >
            <LinearGradient colors={['#0ea5e9', '#0ea5e9']} style={styles.introStartGradient}>
              <Text style={styles.introStartText}>開始練習</Text>
              <ArrowRight size={20} color="#FFFFFF" />
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setCurrentPage('menu')} style={styles.returnMenuButton}>
            <Text style={styles.returnMenuText}>返回選單</Text>
          </TouchableOpacity>
        </ScrollView>

        <InfoModal visible={showInfoModal} onClose={() => setShowInfoModal(false)} type={infoModalType} />
      </LinearGradient>
    </View>
  );

  const renderLetterRecipient = () => {
    const tips = [
      '可以是家人、朋友、同事',
      '也可以是曾經幫助過你的人',
      '甚至可以是過去或未來的自己',
    ];

    const examples = [
      '媽媽', '爸爸', '另一半', '好朋友',
      '同事', '老師', '陌生人', '過去的自己',
    ];

    return (
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.fullScreen}>
            <LinearGradient colors={['#f0f9ff', '#e0f2fe']} style={styles.gradientBg}>
              <View style={styles.progressBarTop}>
                <ProgressBar currentStep={1} totalSteps={totalSteps} />
              </View>

              <View style={styles.header}>
                <TouchableOpacity onPress={handleBack} style={styles.headerBackButton}>
                  <ArrowLeft size={24} color="#64748b" />
                </TouchableOpacity>
                <View style={{ width: 40 }} />
              </View>

              <View style={styles.titleSection}>
                <Text style={styles.pageTitleCentered}>迷你感謝信</Text>
                <Text style={styles.pageSubtitleCentered}>你想寫給誰?</Text>
                <View style={styles.noteCentered}>
                  <Star size={16} color="#fbbf24" fill="#fbbf24" />
                  <Text style={styles.noteTextCentered}>選一個你想傳遞感謝的對象</Text>
                </View>
              </View>

              <ScrollView
                contentContainerStyle={[styles.scrollContent, { paddingBottom: isKeyboardVisible ? 200 : 300 }]}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
              >
                <View style={styles.inputCard}>
                  <TextInput
                    style={styles.textarea}
                    multiline
                    placeholder="我想寫給..."
                    placeholderTextColor="#cbd5e1"
                    value={formData.recipient}
                    onChangeText={text => setFormData(prev => ({ ...prev, recipient: text }))}
                    textAlignVertical="top"
                  />
                </View>

                <View style={styles.tipsSection}>
                  <TouchableOpacity onPress={() => setShowTips(!showTips)} style={styles.tipsToggle}>
                    {showTips ? <ChevronUp size={16} color="#0ea5e9" /> : <ChevronDown size={16} color="#0ea5e9" />}
                    <Text style={styles.tipsToggleText}>書寫提示</Text>
                  </TouchableOpacity>

                  {showTips && (
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

                <View style={styles.examplesSection}>
                  <TouchableOpacity onPress={() => setShowExamples(!showExamples)} style={styles.examplesToggle}>
                    <Lightbulb size={16} color="#0ea5e9" />
                    <Text style={styles.examplesToggleText}>{showExamples ? '收起參考範例' : '參考範例'}</Text>
                  </TouchableOpacity>

                  {showExamples && (
                    <View style={styles.examplesContent}>
                      {examples.map((ex, i) => (
                        <TouchableOpacity
                          key={i}
                          style={styles.exampleChip}
                          onPress={() => setFormData(prev => ({ ...prev, recipient: ex }))}
                        >
                          <Text style={styles.exampleText}>{ex}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </View>
              </ScrollView>

              {!isKeyboardVisible && (
                <View style={styles.footer}>
                  <TouchableOpacity
                    style={[styles.nextButton, !formData.recipient.trim() && styles.nextButtonDisabled]}
                    onPress={() => {
                      if (formData.recipient.trim()) {
                        Keyboard.dismiss();
                        setShowTips(false);
                        setShowExamples(false);
                        setTimeout(() => setCurrentPage('letter-message'), 100);
                      }
                    }}
                    disabled={!formData.recipient.trim()}
                  >
                    <LinearGradient
                      colors={formData.recipient.trim() ? ['#0ea5e9', '#0ea5e9'] : ['#cbd5e1', '#cbd5e1']}
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

  const renderLetterMessage = () => {
    const tips = [
      '想想對方為你做過什麼',
      '這件事對你有什麼意義',
      '你想對對方說什麼',
    ];

    return (
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.fullScreen}>
            <LinearGradient colors={['#f0f9ff', '#e0f2fe']} style={styles.gradientBg}>
              <View style={styles.progressBarTop}>
                <ProgressBar currentStep={2} totalSteps={totalSteps} />
              </View>

              <View style={styles.header}>
                <TouchableOpacity onPress={handleBack} style={styles.headerBackButton}>
                  <ArrowLeft size={24} color="#64748b" />
                </TouchableOpacity>
                <View style={{ width: 40 }} />
              </View>

              <View style={styles.titleSection}>
                <Text style={styles.pageTitleCentered}>迷你感謝信</Text>
                <Text style={styles.pageSubtitleCentered}>寫下你的感謝</Text>
                <View style={styles.noteCentered}>
                  <Star size={16} color="#fbbf24" fill="#fbbf24" />
                  <Text style={styles.noteTextCentered}>寫完後,試著把這段話傳遞給對方吧!</Text>
                </View>
              </View>

              <ScrollView
                contentContainerStyle={[styles.scrollContent, { paddingBottom: isKeyboardVisible ? 200 : 300 }]}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
              >
                <View style={styles.inputCard}>
                  <TextInput
                    style={styles.textarea}
                    multiline
                    placeholder={`親愛的...\n謝謝你...`}
                    placeholderTextColor="#cbd5e1"
                    value={formData.thankMessage}
                    onChangeText={text => setFormData(prev => ({ ...prev, thankMessage: text }))}
                    textAlignVertical="top"
                  />
                </View>

                <View style={styles.tipsSection}>
                  <TouchableOpacity onPress={() => setShowTips(!showTips)} style={styles.tipsToggle}>
                    {showTips ? <ChevronUp size={16} color="#0ea5e9" /> : <ChevronDown size={16} color="#0ea5e9" />}
                    <Text style={styles.tipsToggleText}>書寫提示</Text>
                  </TouchableOpacity>

                  {showTips && (
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
                    style={[styles.nextButton, !formData.thankMessage.trim() && styles.nextButtonDisabled]}
                    onPress={() => {
                      if (formData.thankMessage.trim()) {
                        Keyboard.dismiss();
                        setTimeout(() => setCurrentPage('assessment'), 100);
                      }
                    }}
                    disabled={!formData.thankMessage.trim()}
                  >
                    <LinearGradient
                      colors={formData.thankMessage.trim() ? ['#0ea5e9', '#0ea5e9'] : ['#cbd5e1', '#cbd5e1']}
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

  // ==================== 如果練習 ====================
  const renderIfIntro = () => (
    <View style={styles.fullScreen}>
      <LinearGradient colors={['#f0f9ff', '#e0f2fe']} style={styles.gradientBg}>
        <ScrollView contentContainerStyle={styles.introScrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.introIconContainer}>
            <View style={[styles.introIconCircle, { backgroundColor: '#f5f3ff' }]}>
              <Sparkles size={40} color="#8b5cf6" />
            </View>
          </View>

          <Text style={styles.introTitle}>如果練習</Text>
          <Text style={styles.introSubtitle}>
            想像失去後的樣子,{'\n'}
            讓我們學會深度珍惜當下。
          </Text>

          <TouchableOpacity onPress={() => showInfo('if')} style={styles.introInfoLink}>
            <HelpCircle size={16} color="#0ea5e9" />
            <Text style={styles.introInfoLinkText}>為什麼要做這個練習?</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.introStartButton}
            onPress={() => setCurrentPage('if-imagine')}
          >
            <LinearGradient colors={['#0ea5e9', '#0ea5e9']} style={styles.introStartGradient}>
              <Text style={styles.introStartText}>開始練習</Text>
              <ArrowRight size={20} color="#FFFFFF" />
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setCurrentPage('menu')} style={styles.returnMenuButton}>
            <Text style={styles.returnMenuText}>返回選單</Text>
          </TouchableOpacity>
        </ScrollView>

        <InfoModal visible={showInfoModal} onClose={() => setShowInfoModal(false)} type={infoModalType} />
      </LinearGradient>
    </View>
  );

  const renderIfImagine = () => {
    const tips = [
      '選一個你很習慣、覺得理所當然的人事物',
      '可以是健康、家人、朋友、工作、某個能力',
      '想像如果突然沒有了,生活會變怎樣',
    ];

    const examples = [
      '我的健康', '媽媽的陪伴', '這份工作',
      '好朋友', '眼睛能看見', '有地方住',
      '能夠行走', '乾淨的水',
    ];

    return (
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.fullScreen}>
            <LinearGradient colors={['#f0f9ff', '#e0f2fe']} style={styles.gradientBg}>
              <View style={styles.progressBarTop}>
                <ProgressBar currentStep={1} totalSteps={totalSteps} />
              </View>

              <View style={styles.header}>
                <TouchableOpacity onPress={handleBack} style={styles.headerBackButton}>
                  <ArrowLeft size={24} color="#64748b" />
                </TouchableOpacity>
                <View style={{ width: 40 }} />
              </View>

              <View style={styles.titleSection}>
                <Text style={styles.pageTitleCentered}>如果練習</Text>
                <Text style={styles.pageSubtitleCentered}>想像如果沒有它...</Text>
                <View style={styles.noteCentered}>
                  <Star size={16} color="#fbbf24" fill="#fbbf24" />
                  <Text style={styles.noteTextCentered}>可以自由用你習慣的語言與表達方式書寫</Text>
                </View>
              </View>

              <ScrollView
                contentContainerStyle={[styles.scrollContent, { paddingBottom: isKeyboardVisible ? 200 : 300 }]}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
              >
                <View style={styles.inputCard}>
                  <TextInput
                    style={styles.textarea}
                    multiline
                    placeholder="如果沒有_____,我的生活會..."
                    placeholderTextColor="#cbd5e1"
                    value={formData.ifImagine}
                    onChangeText={text => setFormData(prev => ({ ...prev, ifImagine: text }))}
                    textAlignVertical="top"
                  />
                </View>

                <View style={styles.tipsSection}>
                  <TouchableOpacity onPress={() => setShowTips(!showTips)} style={styles.tipsToggle}>
                    {showTips ? <ChevronUp size={16} color="#0ea5e9" /> : <ChevronDown size={16} color="#0ea5e9" />}
                    <Text style={styles.tipsToggleText}>書寫提示</Text>
                  </TouchableOpacity>

                  {showTips && (
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

                <View style={styles.examplesSection}>
                  <TouchableOpacity onPress={() => setShowExamples(!showExamples)} style={styles.examplesToggle}>
                    <Lightbulb size={16} color="#0ea5e9" />
                    <Text style={styles.examplesToggleText}>{showExamples ? '收起參考範例' : '參考範例'}</Text>
                  </TouchableOpacity>

                  {showExamples && (
                    <View style={styles.examplesContent}>
                      {examples.map((ex, i) => (
                        <TouchableOpacity
                          key={i}
                          style={styles.exampleChip}
                          onPress={() => setFormData(prev => ({
                            ...prev,
                            ifImagine: `如果沒有${ex},我的生活會...`
                          }))}
                        >
                          <Text style={styles.exampleText}>{ex}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </View>
              </ScrollView>

              {!isKeyboardVisible && (
                <View style={styles.footer}>
                  <TouchableOpacity
                    style={[styles.nextButton, !formData.ifImagine.trim() && styles.nextButtonDisabled]}
                    onPress={() => {
                      if (formData.ifImagine.trim()) {
                        Keyboard.dismiss();
                        setShowTips(false);
                        setShowExamples(false);
                        setTimeout(() => setCurrentPage('if-appreciate'), 100);
                      }
                    }}
                    disabled={!formData.ifImagine.trim()}
                  >
                    <LinearGradient
                      colors={formData.ifImagine.trim() ? ['#0ea5e9', '#0ea5e9'] : ['#cbd5e1', '#cbd5e1']}
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

  const renderIfAppreciate = () => {
    const tips = [
      '現在把注意力轉回「擁有」',
      '因為它的存在,你能夠做什麼?',
      '它為你的生活帶來什麼?',
    ];

    return (
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.fullScreen}>
            <LinearGradient colors={['#f0f9ff', '#e0f2fe']} style={styles.gradientBg}>
              <View style={styles.progressBarTop}>
                <ProgressBar currentStep={2} totalSteps={totalSteps} />
              </View>

              <View style={styles.header}>
                <TouchableOpacity onPress={handleBack} style={styles.headerBackButton}>
                  <ArrowLeft size={24} color="#64748b" />
                </TouchableOpacity>
                <View style={{ width: 40 }} />
              </View>

              <View style={styles.titleSection}>
                <Text style={styles.pageTitleCentered}>如果練習</Text>
                <Text style={styles.pageSubtitleCentered}>轉念看見擁有的美好</Text>
                <View style={styles.noteCentered}>
                  <Star size={16} color="#fbbf24" fill="#fbbf24" />
                  <Text style={styles.noteTextCentered}>轉念思考,感受它的存在</Text>
                </View>
              </View>

              <ScrollView
                contentContainerStyle={[styles.scrollContent, { paddingBottom: isKeyboardVisible ? 200 : 300 }]}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
              >
                <View style={styles.inputCard}>
                  <TextInput
                    style={styles.textareaWithTemplate}
                    multiline
                    placeholder={`我想像如果_____沒有出現(或如果我現在沒有_____),我現在可能_____,正因為它/他/她在,我才能/我學會/我...`}
                    placeholderTextColor="#94a3b8"
                    value={formData.ifAppreciate}
                    onChangeText={text => setFormData(prev => ({ ...prev, ifAppreciate: text }))}
                    textAlignVertical="top"
                  />
                </View>

                <View style={styles.tipsSection}>
                  <TouchableOpacity onPress={() => setShowTips(!showTips)} style={styles.tipsToggle}>
                    {showTips ? <ChevronUp size={16} color="#0ea5e9" /> : <ChevronDown size={16} color="#0ea5e9" />}
                    <Text style={styles.tipsToggleText}>書寫提示</Text>
                  </TouchableOpacity>

                  {showTips && (
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
                    style={[styles.nextButton, !formData.ifAppreciate.trim() && styles.nextButtonDisabled]}
                    onPress={() => {
                      if (formData.ifAppreciate.trim()) {
                        Keyboard.dismiss();
                        setTimeout(() => setCurrentPage('assessment'), 100);
                      }
                    }}
                    disabled={!formData.ifAppreciate.trim()}
                  >
                    <LinearGradient
                      colors={formData.ifAppreciate.trim() ? ['#0ea5e9', '#0ea5e9'] : ['#cbd5e1', '#cbd5e1']}
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

  // ==================== 評估頁 ====================
  const renderAssessmentPage = () => (
    <View style={styles.fullScreen}>
      <LinearGradient colors={['#f0f9ff', '#e0f2fe']} style={styles.gradientBg}>
        <View style={styles.progressBarTop}>
          <ProgressBar currentStep={3} totalSteps={totalSteps} />
        </View>

        <View style={styles.assessmentContent}>
          <View style={styles.assessmentCard}>
            <LinearGradient colors={['#29B6F6', '#0288D1']} style={styles.assessmentAccentBar} />

            <TouchableOpacity onPress={handleBack} style={styles.assessmentBackButton}>
              <ChevronLeft size={20} color="#64748b" />
            </TouchableOpacity>

            <Text style={styles.assessmentTitle}>幸福感程度</Text>

            <View style={styles.scoreDisplay}>
              <Text style={styles.scoreNumber}>{formData.postScore}</Text>
              <Text style={styles.scoreTotal}>/10</Text>
            </View>

            <Text style={styles.assessmentSubtitle}>完成練習後,你感覺如何?</Text>

            <View style={styles.sliderWrapper}>
              <CustomSlider
                value={formData.postScore}
                onValueChange={(value) => setFormData(prev => ({ ...prev, postScore: value }))}
                min={0}
                max={10}
              />

              <View style={styles.sliderLabels}>
                <Text style={styles.sliderLabel}>0 (平淡)</Text>
                <Text style={styles.sliderLabel}>10 (充滿幸福)</Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.assessmentButton}
              onPress={() => {
                setIsTiming(false);
                setCurrentPage('completion');
              }}
            >
              <LinearGradient colors={['#29B6F6', '#0288D1']} style={styles.assessmentButtonGradient}>
                <Text style={styles.assessmentButtonText}>完成</Text>
                <ArrowRight size={20} color="#FFFFFF" />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>
    </View>
  );

  // ==================== 完成頁 ====================
  const renderCompletionPage = () => {
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
          style={[
            {
              position: 'absolute',
              left: 0,
              top: 0,
              transform: [
                { translateX },
                { translateY },
              ],
              opacity,
            }
          ]}
        >
          <Star 
            size={meteorConfig.starSize} 
            color="#60a5fa" 
            fill="#bae6fd" 
          />
        </Animated.View>
      );
    };

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

    const getCompletionIcon = () => {
      switch (formData.practiceType) {
        case PRACTICE_TYPES.DIARY:
          return BookOpen;
        case PRACTICE_TYPES.LETTER:
          return Mail;
        case PRACTICE_TYPES.IF:
          return Sparkles;
        default:
          return Heart;
      }
    };

    const Icon = getCompletionIcon();

    return (
      <View style={styles.fullScreen}>
        <LinearGradient colors={['#f0f9ff', '#e0f2fe']} style={styles.gradientBg}>
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
                <Icon size={48} color="rgba(255,255,255,0.9)" />
              </LinearGradient>

              <Animated.View
                style={[
                  styles.starBadge,
                  { transform: [{ scale: starBadgeScale }] }
                ]}
              >
                <Star size={20} color="#FFFFFF" fill="#FFFFFF" />
              </Animated.View>
            </Animated.View>

            <Text style={styles.completionTitle}>太棒了!</Text>
            <Text style={styles.completionSubtitle}>你已完成今日的感恩儀式</Text>

            <View style={styles.streakCard}>
              <View style={styles.streakHeader}>
                <Star size={16} color="#fbbf24" fill="#fbbf24" />
                <Text style={styles.streakLabel}>連續練習</Text>
              </View>
              <View style={styles.streakNumberContainer}>
                <Text style={styles.streakNumber}>1</Text>
                <Text style={styles.streakUnit}>天</Text>
              </View>
            </View>

            <TouchableOpacity style={styles.viewJournalButton} onPress={handleViewJournal}>
              <Text style={styles.viewJournalText}>查看日記</Text>
              <ArrowRight size={16} color="#0ea5e9" />
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
      
      <RestoreModal />
      
      {currentPage === 'menu' && renderMenuPage()}
      
      {currentPage === 'diary-intro' && renderDiaryIntro()}
      {currentPage === 'diary-write' && renderDiaryWrite()}
      {currentPage === 'diary-feeling' && renderDiaryFeeling()}
      
      {currentPage === 'letter-intro' && renderLetterIntro()}
      {currentPage === 'letter-recipient' && renderLetterRecipient()}
      {currentPage === 'letter-message' && renderLetterMessage()}
      
      {currentPage === 'if-intro' && renderIfIntro()}
      {currentPage === 'if-imagine' && renderIfImagine()}
      {currentPage === 'if-appreciate' && renderIfAppreciate()}
      
      {currentPage === 'assessment' && renderAssessmentPage()}
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

  // ========== 選單頁 ==========
  menuBackButton: {
    position: 'absolute',
    top: 56,
    left: 20,
    zIndex: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoButton: {
    position: 'absolute',
    top: 56,
    right: 20,
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
  menuContent: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingTop: 100,
  },
  menuTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1e293b',
    textAlign: 'center',
    marginBottom: 32,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#bae6fd',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  menuItemIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  menuItemText: {
    flex: 1,
  },
  menuItemTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 4,
  },
  menuItemSubtitle: {
    fontSize: 13,
    color: '#64748b',
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
    width: SCREEN_WIDTH - 48,
    maxHeight: SCREEN_HEIGHT * 0.7,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
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
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
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
    maxHeight: 350,
    marginBottom: 20,
  },
  modalSection: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  modalIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
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
    fontSize: 13,
    color: '#64748b',
    lineHeight: 20,
  },
  modalButton: {
    width: '100%',
    height: 44,
    backgroundColor: '#0ea5e9',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },

  // ========== 恢復練習彈窗 ==========
  restoreModalText: {
    fontSize: 15,
    color: '#64748b',
    lineHeight: 24,
    textAlign: 'center',
    marginBottom: 4,
  },
  restoreModalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  restoreModalButton: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    overflow: 'hidden',
  },
  restoreModalButtonSecondary: {
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  restoreModalButtonPrimary: {
    overflow: 'hidden',
  },
  restoreModalButtonGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  restoreModalButtonTextSecondary: {
    fontSize: 15,
    fontWeight: '600',
    color: '#64748b',
  },
  restoreModalButtonTextPrimary: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },

  // ========== 介紹頁 ==========
  introScrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 80,
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
    marginBottom: 12,
  },
  introSubtitle: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 26,
    marginBottom: 20,
  },
  introInfoLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 32,
  },
  introInfoLinkText: {
    fontSize: 14,
    color: '#0ea5e9',
    fontWeight: '500',
  },
  introStartButton: {
    width: '100%',
    maxWidth: 320,
    height: 56,
    borderRadius: 28,
    overflow: 'hidden',
    shadowColor: '#bae6fd',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 16,
  },
  introStartGradient: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  introStartText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  returnMenuButton: {
    paddingVertical: 12,
  },
  returnMenuText: {
    fontSize: 14,
    color: '#94a3b8',
  },

  // ========== 頭部 ==========
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 48,
    paddingBottom: 16,
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
  pageSubtitleCentered: {
    fontSize: 15,
    color: '#64748b',
    marginBottom: 12,
    textAlign: 'center',
  },
  noteCentered: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 16,
  },
  noteTextCentered: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
    flex: 1,
  },

  // ========== 內容區域 ==========
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 300,
  },
  inputCard: {
    minHeight: 200,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#bae6fd',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 3,
  },
  textarea: {
    flex: 1,
    fontSize: 16,
    color: '#334155',
    lineHeight: 24,
  },
  textareaWithTemplate: {
    flex: 1,
    fontSize: 15,
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
    marginBottom: 10,
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
    lineHeight: 20,
  },

  // ========== 參考範例 ==========
  examplesSection: {
    marginTop: 12,
  },
  examplesToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  examplesToggleText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#0ea5e9',
  },
  examplesContent: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  exampleChip: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderWidth: 1,
    borderColor: '#dbeafe',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  exampleText: {
    fontSize: 13,
    color: '#64748b',
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
    color: '#0288D1',
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
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  // ========== 完成頁 ==========
  completionContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  completionIconContainer: {
    position: 'relative',
    width: 112,
    height: 112,
    marginBottom: 28,
  },
  completionIconGradient: {
    width: 112,
    height: 112,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#bae6fd',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
    transform: [{ rotate: '6deg' }],
  },
  starBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fbbf24',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
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
    marginBottom: 28,
  },
  streakCard: {
    width: '80%',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#bae6fd',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 3,
  },
  streakHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 8,
  },
  streakLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: '#6b7280',
  },
  streakNumberContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: 6,
  },
  streakNumber: {
    fontSize: 32,
    fontWeight: '700',
    color: '#0ea5e9',
  },
  streakUnit: {
    fontSize: 16,
    color: '#9ca3af',
    marginBottom: 4,
  },
  viewJournalButton: {
    width: '80%',
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(14, 165, 233, 0.2)',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
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
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});