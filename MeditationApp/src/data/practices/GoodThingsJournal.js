// GoodThingsJournalNew.js - 完美修正版
import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
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
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Slider from '@react-native-community/slider';
import { Dimensions } from 'react-native';
import { 
  X, 
  HelpCircle, 
  PenTool, 
  ArrowRight, 
  ArrowLeft, 
  Star,
  Check,
  Plus,
  Mail,
  BookOpen,
  Heart,
  Lightbulb,
  ChevronDown,
  ChevronUp,
} from 'lucide-react-native';
import ApiService from '../../../api';

// ==================== 初始表單資料 ====================
const INITIAL_FORM_DATA = {
  goodThing: '',
  emotions: [],
  reason: '',
  postScore: 5,
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
          {/* 標題 */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>關於好事書寫</Text>
            <TouchableOpacity onPress={onClose} style={styles.modalCloseButton}>
              <X size={20} color="#64748b" />
            </TouchableOpacity>
          </View>

          {/* 內容 */}
          <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
            <View style={styles.modalSection}>
              <View style={[styles.modalIconContainer, { backgroundColor: '#e0f2fe' }]}>
                <BookOpen size={20} color="#0ea5e9" />
              </View>
              <View style={styles.modalTextContainer}>
                <Text style={styles.modalSectionTitle}>什麼是「好事書寫」？</Text>
                <Text style={styles.modalSectionText}>
                  源自正向心理學的經典練習「Three Good Things」。研究發現，連續一週在睡前寫下三件今天發生的好事以及「為什麼會發生」，能提升快樂感、降低憂鬱感，效果甚至可達六個月。
                </Text>
              </View>
            </View>

            <View style={styles.modalSection}>
              <View style={[styles.modalIconContainer, { backgroundColor: '#fef3c7' }]}>
                <Lightbulb size={20} color="#f59e0b" />
              </View>
              <View style={styles.modalTextContainer}>
                <Text style={styles.modalSectionTitle}>為什麼要寫原因？</Text>
                <Text style={styles.modalSectionText}>
                  分析「為什麼會發生」，能幫助大腦建立正向的神經迴路，讓你更容易看見自己的能力與價值。
                </Text>
              </View>
            </View>

            <View style={styles.modalSection}>
              <View style={[styles.modalIconContainer, { backgroundColor: '#e0f2fe' }]}>
                <Heart size={20} color="#38bdf8" />
              </View>
              <View style={styles.modalTextContainer}>
                <Text style={styles.modalSectionTitle}>好事書寫只是在強迫自己正向？</Text>
                <Text style={styles.modalSectionText}>
                  好事書寫的並非否認痛苦、強迫正向。我們的大腦有天生容易注意與記住「負面事件」的原始設定，透過刻意把注意力拉回到微小的正向感受，讓視角與大腦更平衡。你可以一面承認今天的疲憊與煩躁，也能同時看見今天支撐著你的小事。
                </Text>
              </View>
            </View>
          </ScrollView>

          {/* 底部按鈕 */}
          <TouchableOpacity onPress={onClose} style={styles.modalButton}>
            <Text style={styles.modalButtonText}>我知道了</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

// ==================== 常數資料 ====================
const EVENT_WRITING_TIPS = [
  "當時的情況是什麼？",
  "你當時的想法、念頭是什麼？"
];

const EVENT_EXAMPLES = [
  "吃到好吃的早餐",
  "天氣很好，看到了藍天",
  "完成了一件拖延很久的工作",
  "朋友傳來關心的訊息",
  "睡了一個好覺",
  "在路上看到可愛的貓咪",
  "準時下班",
  "讀到一本好書"
];

const REASON_WRITING_TIPS = [
  "是否可能因為你打開了好事覺察的視角？",
  "是否可能因為你願意注意他人的友善？",
  "是否可能因為你用不同的心情面對這一天？"
];

const REASON_EXAMPLES = [
  "試著嘗試新鮮事",
  "對待他人友善",
  "更注意周遭的人事物",
  "享受當下",
  "決定好好照顧自己",
  "努力讓自己心情好起來"
];

// ==================== 主組件 ====================
export default function GoodThingsJournalNew({ onBack, navigation, onHome }) {
  const [currentPage, setCurrentPage] = useState('intro');
  const [formData, setFormData] = useState(INITIAL_FORM_DATA);
  const [showInfoModal, setShowInfoModal] = useState(false);

  // Practice 狀態
  const [practiceId, setPracticeId] = useState(null);
  const [startTime, setStartTime] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isTiming, setIsTiming] = useState(true);


  // 情緒選擇相關
  const [customEmotions, setCustomEmotions] = useState([]);
  const [isAddingCustom, setIsAddingCustom] = useState(false);
  const [customInput, setCustomInput] = useState('');

  // 書寫提示展開狀態
  const [showTips, setShowTips] = useState(false);
  const [showExamples, setShowExamples] = useState(false);

  // 鍵盤狀態
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

  // 動畫值
  const iconScale = useRef(new Animated.Value(0)).current;
  const starBadgeScale = useRef(new Animated.Value(0)).current;

  // 預設情緒選項
  const DEFAULT_EMOTIONS = [
    '開心', '平靜', '滿足', '感激',
    '自信', '充滿希望', '被愛', '放鬆',
    '溫暖', '喜悅', '輕鬆', '感動'
  ];

  // 連續天數（可從後端獲取）
  const getStreakDays = () => 1;

  // 當前步驟
  const getCurrentStep = () => {
    const stepMap = {
      intro: 0,
      event: 1,
      emotion: 2,
      reason: 3,
      assessment: 4,
      completion: 5,
    };
    return stepMap[currentPage] || 0;
  };

  const totalSteps = 4;

  // ==================== 優化的回調函數 ====================
  const handleExampleClick = useCallback((example, isEvent) => {
    setFormData(prev => {
      const field = isEvent ? 'goodThing' : 'reason';
      const currentValue = prev[field];
      return {
        ...prev,
        [field]: currentValue ? `${currentValue}\n${example}` : example
      };
    });
  }, []);

  const handleTextChange = useCallback((field, text) => {
    setFormData(prev => ({ ...prev, [field]: text }));
  }, []);

  const toggleShowTips = useCallback(() => {
    setShowTips(prev => !prev);
  }, []);

  const toggleShowExamples = useCallback(() => {
    setShowExamples(prev => !prev);
  }, []);

  // ==================== Practice 管理 ====================
  const initializePractice = async () => {
    try {
      const response = await ApiService.startPractice('好事書寫練習');
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
      practice_type: '好事書寫練習',
      duration: Math.max(1, Math.ceil(totalSeconds / 60)),
      duration_seconds: totalSeconds,
      form_data: payloadFormData, // ✅ 關鍵：改成 form_data
    });
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
    if (currentPage === 'completion') return; // ⭐ 關鍵

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

      return () => clearTimeout(timer);
    } else {
      iconScale.setValue(0);
      starBadgeScale.setValue(0);
    }
  }, [currentPage]);

  // ==================== 操作函數 ====================
  const handleBack = () => {
    const backMap = {
      intro: () => onBack?.() || navigation?.goBack(),
      event: () => setCurrentPage('intro'),
      emotion: () => setCurrentPage('event'),
      reason: () => setCurrentPage('emotion'),
      assessment: () => setCurrentPage('reason'),
      completion: () => {
        // 從完成頁面返回就直接回首頁
        onBack?.() || navigation?.goBack();
      },
    };
    backMap[currentPage]?.();
  };

  const toggleEmotion = (emotion) => {
    if (formData.emotions.includes(emotion)) {
      setFormData(prev => ({
        ...prev,
        emotions: prev.emotions.filter(e => e !== emotion)
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        emotions: [...prev.emotions, emotion]
      }));
    }
  };

  const handleAddCustom = () => {
    if (customInput.trim()) {
      const newEmotion = customInput.trim();
      if (DEFAULT_EMOTIONS.includes(newEmotion)) {
        if (!formData.emotions.includes(newEmotion)) {
          setFormData(prev => ({
            ...prev,
            emotions: [...prev.emotions, newEmotion]
          }));
        }
      } else if (customEmotions.includes(newEmotion)) {
        if (!formData.emotions.includes(newEmotion)) {
          setFormData(prev => ({
            ...prev,
            emotions: [...prev.emotions, newEmotion]
          }));
        }
      } else {
        setCustomEmotions([...customEmotions, newEmotion]);
        setFormData(prev => ({
          ...prev,
          emotions: [...prev.emotions, newEmotion]
        }));
      }
      setCustomInput('');
      setIsAddingCustom(false);
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
        {/* 關閉按鈕 */}
        <TouchableOpacity onPress={handleBack} style={styles.closeButton}>
          <View style={styles.closeButtonCircle}>
            <X size={20} color="#64748b" />
          </View>
        </TouchableOpacity>

        {/* 說明按鈕 */}
        <TouchableOpacity onPress={() => setShowInfoModal(true)} style={styles.infoButton}>
          <HelpCircle size={16} color="#0ea5e9" />
          <Text style={styles.infoButtonText}>為什麼要做這個練習？</Text>
        </TouchableOpacity>

        <ScrollView 
          contentContainerStyle={styles.introScrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* 圖標 */}
          <View style={styles.introIconContainer}>
            <View style={styles.introIconCircle}>
              <PenTool size={40} color="#0ea5e9" />
            </View>
          </View>

          {/* 文字 */}
          <Text style={styles.introTitle}>好事書寫</Text>
          <Text style={styles.introSubtitle}>
            注意生活中的微小好事，{'\n'}
            改變大腦神經迴路的開始。
          </Text>

          {/* 開始按鈕 */}
          <TouchableOpacity 
            style={styles.introStartButton}
            onPress={() => setCurrentPage('event')}
          >
            <LinearGradient
              colors={['#0ea5e9', '#0ea5e9']}
              style={styles.introStartGradient}
            >
              <Text style={styles.introStartText}>開始書寫</Text>
              <ArrowRight size={20} color="#FFFFFF" />
            </LinearGradient>
          </TouchableOpacity>
        </ScrollView>

        <InfoModal visible={showInfoModal} onClose={() => setShowInfoModal(false)} />
      </LinearGradient>
    </View>
  );

  // 2. 好事發生頁
  const renderEventPage = () => {

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
              {/* 進度條 */}
              <View style={styles.progressBarTop}>
                <ProgressBar currentStep={getCurrentStep()} totalSteps={totalSteps} />
              </View>

              {/* 頭部 */}
              <View style={styles.header}>
                <TouchableOpacity onPress={handleBack} style={styles.headerBackButton}>
                  <ArrowLeft size={24} color="#64748b" />
                </TouchableOpacity>
                <View style={{ width: 40 }} />
              </View>

              {/* 標題 */}
              <View style={styles.titleSection}>
                <Text style={styles.pageTitle}>今天發生了什麼好事？</Text>
                <Text style={styles.pageSubtitle}>
                  寫下 1-3 個今天讓你感到順利或開心的小事
                </Text>
                <View style={styles.noteContainer}>
                  <Star size={16} color="#fbbf24" fill="#fbbf24" />
                  <Text style={styles.noteText}>
                    不需要驚天動地的大事，吃到好吃的早餐、準時下班都可以
                  </Text>
                </View>
              </View>

              <ScrollView
                contentContainerStyle={[
                  styles.scrollContent,
                  { paddingBottom: isKeyboardVisible ? 200 : 120 }
                ]}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
              >
                <View style={styles.inputCard}>
                  <TextInput
                    style={styles.textarea}
                    multiline
                    placeholder="今天因為坐過站而走了不同的路去公司，因此買了不同的早餐店，沒想到卻超級好吃，吃得當下想說：好險有做過站，不然永遠不知道這家店啊！"
                    placeholderTextColor="#cbd5e1"
                    value={formData.goodThing}
                    onChangeText={(text) => handleTextChange('goodThing', text)}
                    textAlignVertical="top"
                  />
                </View>

                {/* 書寫提示 */}
                {EVENT_WRITING_TIPS.length > 0 && (
                  <View style={styles.tipsSection}>
                    <TouchableOpacity
                      onPress={toggleShowTips} 
                      style={styles.tipsToggle}
                    >
                      {showTips ? <ChevronUp size={16} color="#0ea5e9" /> : <ChevronDown size={16} color="#0ea5e9" />}
                      <Text style={styles.tipsToggleText}>書寫提示</Text>
                    </TouchableOpacity>

                    {showTips && (
                      <View style={styles.tipsContent}>
                        {EVENT_WRITING_TIPS.map((tip, i) => (
                          <View key={i} style={styles.tipItem}>
                            <View style={styles.tipBullet} />
                            <Text style={styles.tipText}>{tip}</Text>
                          </View>
                        ))}
                      </View>
                    )}
                  </View>
                )}

                {/* 參考範例 */}
                {EVENT_EXAMPLES.length > 0 && (
                  <View style={styles.examplesSection}>
                    <TouchableOpacity
                      onPress={toggleShowExamples} 
                      style={styles.examplesToggle}
                    >
                      <Lightbulb size={16} color="#0ea5e9" />
                      <Text style={styles.examplesToggleText}>
                        {showExamples ? '收起參考範例' : '參考範例'}
                      </Text>
                    </TouchableOpacity>

                    {showExamples && (
                      <View style={styles.examplesContent}>
                        {EVENT_EXAMPLES.map((ex, i) => (
                          <TouchableOpacity
                            key={i}
                            style={styles.exampleChip}
                            onPress={() => handleExampleClick(ex, true)}
                          >
                            <Text style={styles.exampleText}>{ex}</Text>
                            <Plus size={14} color="#0ea5e9" />
                          </TouchableOpacity>
                        ))}
                      </View>
                    )}
                  </View>
                )}
              </ScrollView>

              {!isKeyboardVisible && (
                <View style={styles.footer}>
                  <TouchableOpacity
                    style={[
                      styles.nextButton,
                      !formData.goodThing.trim() && styles.nextButtonDisabled
                    ]}
                    onPress={() => {
                      if (formData.goodThing.trim()) {
                        Keyboard.dismiss();
                        setTimeout(() => setCurrentPage('emotion'), 100);
                      }
                    }}
                    disabled={!formData.goodThing.trim()}
                  >
                    <LinearGradient
                      colors={formData.goodThing.trim() ? ['#0ea5e9', '#0ea5e9'] : ['#cbd5e1', '#cbd5e1']}
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

  // 3. 感覺頁
  const renderEmotionPage = () => {
    const allEmotions = [...DEFAULT_EMOTIONS, ...customEmotions];

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

              <Text style={styles.emotionTitle}>這讓你感覺...？</Text>

              <ScrollView
                contentContainerStyle={[
                  styles.scrollContent,
                  { paddingBottom: isKeyboardVisible ? 450 : 120 }
                ]}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
                // ⭐ 新增性能優化設置
                removeClippedSubviews={true}           // 移除屏幕外的子視圖
                scrollEventThrottle={16}                // 每 16ms 觸發一次滾動事件
                overScrollMode="auto"                   // Android 專用
                bounces={true}                          // iOS 彈性效果
                bouncesZoom={false}                     // 禁用縮放彈性
                decelerationRate="normal"               // 正常減速率
              >
                <View style={styles.emotionCard}>
                  <View style={styles.emotionTagsContainer}>
                    {allEmotions.map((emotion) => {
                      const isSelected = formData.emotions.includes(emotion);
                      return (
                        <TouchableOpacity
                          key={emotion}
                          style={[
                            styles.emotionTag,
                            isSelected && styles.emotionTagSelected
                          ]}
                          onPress={() => toggleEmotion(emotion)}
                        >
                          <Text style={[
                            styles.emotionTagText,
                            isSelected && styles.emotionTagTextSelected
                          ]}>
                            {emotion}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}

                    {!isAddingCustom ? (
                      <TouchableOpacity
                        style={styles.customEmotionButton}
                        onPress={() => setIsAddingCustom(true)}
                      >
                        <Plus size={16} color="#94a3b8" />
                        <Text style={styles.customEmotionButtonText}>自定義</Text>
                      </TouchableOpacity>
                    ) : (
                      <View style={styles.customInputContainer}>
                        <TextInput
                          style={styles.customInput}
                          value={customInput}
                          onChangeText={setCustomInput}
                          placeholder="輸入感受..."
                          placeholderTextColor="#cbd5e1"
                          autoFocus
                          onSubmitEditing={handleAddCustom}
                          multiline={true}
                          numberOfLines={10}
                          maxLength={100} 
                        />
                        <TouchableOpacity onPress={handleAddCustom} style={styles.customCheckButton}>
                          <Check size={16} color="#FFFFFF" />
                        </TouchableOpacity>
                        <TouchableOpacity 
                          onPress={() => {
                            setIsAddingCustom(false);
                            setCustomInput('');
                          }} 
                          style={styles.customCloseButton}
                        >
                          <X size={16} color="#94a3b8" />
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                </View>
              </ScrollView>

              {!isKeyboardVisible && (
                <View style={styles.footer}>
                  <TouchableOpacity
                    style={[
                      styles.nextButton,
                      formData.emotions.length === 0 && styles.nextButtonDisabled
                    ]}
                    onPress={() => {
                      if (formData.emotions.length > 0) {
                        Keyboard.dismiss();
                        setTimeout(() => setCurrentPage('reason'), 100);
                      }
                    }}
                    disabled={formData.emotions.length === 0}
                  >
                    <LinearGradient
                      colors={formData.emotions.length > 0 ? ['#0ea5e9', '#0ea5e9'] : ['#cbd5e1', '#cbd5e1']}
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

  // 4. 好事再發生頁
  const renderReasonPage = () => {

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
                <Text style={styles.pageTitle}>好事再發生！</Text>
                <Text style={styles.pageSubtitle}>
                  可以怎麼讓這個好事有機會再發生
                </Text>
                <View style={styles.noteContainer}>
                  <Star size={16} color="#fbbf24" fill="#fbbf24" />
                  <Text style={styles.noteText}>
                    其實你也有主動創造幸福的能力
                  </Text>
                </View>
              </View>

              <ScrollView
                contentContainerStyle={[
                  styles.scrollContent,
                  { paddingBottom: isKeyboardVisible ? 450 : 120 }
                ]}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
                removeClippedSubviews={true}           // 移除屏幕外的子視圖
                scrollEventThrottle={16}                // 每 16ms 觸發一次滾動事件
                overScrollMode="auto"                   // Android 專用
                bounces={true}                          // iOS 彈性效果
                bouncesZoom={false}                     // 禁用縮放彈性
                decelerationRate="normal"               // 正常減速率
              >
                <View style={styles.inputCard}>
                  <TextInput
                    style={styles.textarea}
                    multiline
                    placeholder="1. 不要拖到最後一刻才出門，才有充裕的時間悠閒買早餐。2. 跨出舒適圈，勇於嘗試新的事物。"
                    placeholderTextColor="#cbd5e1"
                    value={formData.reason}
                    onChangeText={(text) => handleTextChange('reason', text)} 
                    textAlignVertical="top"
                  />
                </View>

                {/* 書寫提示 */}
                {REASON_WRITING_TIPS.length > 0 && (
                  <View style={styles.tipsSection}>
                    <TouchableOpacity
                      onPress={toggleShowTips} 
                      style={styles.tipsToggle}
                    >
                      {showTips ? <ChevronUp size={16} color="#0ea5e9" /> : <ChevronDown size={16} color="#0ea5e9" />}
                      <Text style={styles.tipsToggleText}>書寫提示</Text>
                    </TouchableOpacity>

                    {showTips && (
                      <View style={styles.tipsContent}>
                        {REASON_WRITING_TIPS.map((tip, i) => (
                          <View key={i} style={styles.tipItem}>
                            <View style={styles.tipBullet} />
                            <Text style={styles.tipText}>{tip}</Text>
                          </View>
                        ))}
                      </View>
                    )}
                  </View>
                )}

                {/* 參考範例 */}
                {REASON_EXAMPLES.length > 0 && (
                  <View style={styles.examplesSection}>
                    <TouchableOpacity
                      onPress={toggleShowExamples} 
                      style={styles.examplesToggle}
                    >
                      <Lightbulb size={16} color="#0ea5e9" />
                      <Text style={styles.examplesToggleText}>
                        {showExamples ? '收起參考範例' : '參考範例'}
                      </Text>
                    </TouchableOpacity>

                    {showExamples && (
                      <View style={styles.examplesContent}>
                        {REASON_EXAMPLES.map((ex, i) => (
                          <TouchableOpacity
                            key={i}
                            style={styles.exampleChip}
                            onPress={() => handleExampleClick(ex, false)}
                          >
                            <Text style={styles.exampleText}>{ex}</Text>
                            <Plus size={14} color="#0ea5e9" />
                          </TouchableOpacity>
                        ))}
                      </View>
                    )}
                  </View>
                )}
              </ScrollView>

              {!isKeyboardVisible && (
                <View style={styles.footer}>
                  <TouchableOpacity
                    style={[
                      styles.nextButton,
                      !formData.reason.trim() && styles.nextButtonDisabled
                    ]}
                    onPress={() => {
                      if (formData.reason.trim()) {
                        Keyboard.dismiss();
                        setTimeout(() => setCurrentPage('assessment'), 100);
                      }
                    }}
                    disabled={!formData.reason.trim()}
                  >
                    <LinearGradient
                      colors={formData.reason.trim() ? ['#0ea5e9', '#0ea5e9'] : ['#cbd5e1', '#cbd5e1']}
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

  // 5. 心情愉悅程度頁
  const renderAssessmentPage = () => (
    <View style={styles.fullScreen}>
      <LinearGradient
        colors={['#f0f9ff', '#e0f2fe']}
        style={styles.gradientBg}
      >
        <View style={styles.assessmentContent}>
          <View style={styles.assessmentCard}>
            {/* 頂部藍色橫條 */}
            <LinearGradient
              colors={['#29B6F6', '#0288D1']}
              style={styles.assessmentAccentBar}
            />
            
            <TouchableOpacity onPress={handleBack} style={styles.assessmentBackButton}>
              <ArrowLeft size={20} color="#64748b" />
            </TouchableOpacity>

            <Text style={styles.assessmentTitle}>心情愉悅程度</Text>

            <View style={styles.scoreDisplay}>
              <Text style={styles.scoreNumber}>{formData.postScore}</Text>
              <Text style={styles.scoreTotal}>/10</Text>
            </View>

            <Text style={styles.assessmentSubtitle}>寫完好事後，你現在的心情如何？</Text>

            <View style={styles.sliderContainer}>
              {/* ✅ 自訂軌道背景（灰色） */}
              <View style={styles.customSliderTrackBackground} />
              
              {/* ✅ 自訂填充軌道（藍色，動態寬度） */}
              <View 
                style={[
                  styles.customSliderTrackFilled, 
                  { width: `${(formData.postScore / 10) * 100}%` }
                ]} 
              />
              
              {/* ✅ 原生 Slider（設為透明，只用來接收觸摸） */}
              <Slider
                style={styles.slider}
                minimumValue={0}
                maximumValue={10}
                step={1}
                value={formData.postScore}
                onValueChange={value => setFormData(prev => ({ ...prev, postScore: value }))}
                minimumTrackTintColor="transparent"  // 改透明
                maximumTrackTintColor="transparent"  // 改透明
                thumbTintColor={Platform.OS === 'android' ? '#164b88ff' : '#FFFFFF'}  // ⭐ Android 使用深色 thumb
              />
              
              <View style={styles.sliderLabels}>
                <Text style={styles.sliderLabel}>0 心情低落</Text>
                <Text style={styles.sliderLabel}>10 心情愉悅</Text>
              </View>
            </View>

            <TouchableOpacity 
              style={styles.assessmentButton}
              onPress={() =>  {
                setIsTiming(false);
                setCurrentPage('completion');
              }}
            >
              <LinearGradient
                colors={['#29B6F6', '#0288D1']}
                style={styles.assessmentButtonGradient}
              >
                <Text style={styles.assessmentButtonText}>完成</Text>
                <ArrowRight size={20} color="#FFFFFF" />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>
    </View>
  );

  const handleViewJournal = async () => {
    try {
      // 1. 完成練習
      await handleComplete();
      
      // 2. 導航到 DailyScreen（在 MainTabs 裡）
      navigation.navigate('MainTabs', {
        screen: 'Daily',
        params: { highlightPracticeId: practiceId }
      });
    } catch (error) {
      console.error('完成練習失敗:', error);
      
      // 即使完成失敗，仍然導航回去
      navigation.navigate('MainTabs', {
        screen: 'Daily'
      });
    }
  };

  // 6. 完成頁
  const renderCompletionPage = () => {
    const streakDays = getStreakDays();
    const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

    const CENTER_X = 80;
    const CENTER_Y = 80; 

    // 星星流星动画（优化后的 Android 兼容版本）
    const StarConfetti = ({ index }) => {
      const animatedValue = useRef(new Animated.Value(0)).current;
      
      // ⭐ 使用 useState 替代 useMemo，更稳定
      const [meteorConfig] = useState(() => {
        // 从屏幕不同边缘开始
        const side = index % 4; // 0=上, 1=右, 2=下, 3=左
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
          pointerEvents="none"  // ✅ 添加这个，避免阻挡触摸
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

    return (
      <View style={styles.fullScreen}>
        <LinearGradient
          colors={['#f0f9ff', '#e0f2fe']}
          style={styles.gradientBg}
        >
          <View style={styles.completionContent}>
            <View style={styles.confettiCenter}>
              {/* ✅ 星星动画容器 - 放在最底层 */}
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

              {/* 中心圖標 */}
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
                  <Mail size={64} color="rgba(255,255,255,0.9)" />
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
            </View>

            {/* 紙屑星星動畫 */}
            {[...Array(20)].map((_, i) => (
              <StarConfetti key={i} index={i} />
            ))}

            <Text style={styles.completionTitle}>太棒了！</Text>
            <Text style={styles.completionSubtitle}>你已完成今日的好事書寫</Text>

            <View style={styles.streakCard}>
              <View style={styles.streakHeader}>
                <Star size={16} color="#fbbf24" fill="#fbbf24" />
                <Text style={styles.streakLabel}>連續練習</Text>
              </View>
              <View style={styles.streakNumberContainer}>
                <Text style={styles.streakNumber}>{streakDays}</Text>
                <Text style={styles.streakUnit}>天</Text>
              </View>
            </View>

            <TouchableOpacity 
              style={styles.viewJournalButton} 
              onPress={handleViewJournal}>
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
      {currentPage === 'intro' && renderIntroPage()}
      {currentPage === 'event' && renderEventPage()}
      {currentPage === 'emotion' && renderEmotionPage()}
      {currentPage === 'reason' && renderReasonPage()}
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
    marginBottom: 32,
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
    marginBottom: 16,
    letterSpacing: 0.5,
  },
  introSubtitle: {
    fontSize: 18,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 28,
    marginBottom: 32,
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
    marginBottom: 32,
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
    minHeight: 280,
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

  // ========== 參考範例 ==========
  examplesSection: {
    marginTop: 16,
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderWidth: 1,
    borderColor: '#dbeafe',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  exampleText: {
    fontSize: 14,
    color: '#64748b',
  },

  // ========== 情緒選擇 ==========
  emotionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1e293b',
    paddingHorizontal: 24,
    marginBottom: 32,
    lineHeight: 32,
  },
  emotionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    minHeight: 300,
    shadowColor: '#bae6fd',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 4,
  },
  emotionTagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  emotionTag: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: '#FFFFFF',
  },
  emotionTagSelected: {
    backgroundColor: '#0ea5e9',
    borderColor: '#0ea5e9',
  },
  emotionTagText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#64748b',
  },
  emotionTagTextSelected: {
    color: '#FFFFFF',
  },
  customEmotionButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderStyle: 'dashed',
    backgroundColor: '#f8fafc',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  customEmotionButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#94a3b8',
  },
  customInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#bfdbfe',
    gap: 8,
    flexShrink: 5,
    maxWidth: '100%',
  },
  customInput: {
    fontSize: 16,
    color: '#334155',
    paddingHorizontal: 8,
    paddingVertical: 4,
    minWidth: 80,
    maxWidth: 200,
    minHeight: 28,
    textAlignVertical: 'top',
  },
  customCheckButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#0ea5e9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  customCloseButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#e2e8f0',
    justifyContent: 'center',
    alignItems: 'center',
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
    left: '5%',
    right: '5%',
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
    marginBottom: 32,
    marginTop: 16,
  },
  scoreDisplay: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'baseline',
    marginBottom: 8,
  },
  scoreNumber: {
    fontSize: 64,
    fontWeight: '700',
    color: '#0288D1',
  },
  scoreTotal: {
    fontSize: 24,
    color: '#9CA3AF',
    fontWeight: '500',
    marginLeft: 4,
  },
  assessmentSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 40,
  },
  sliderContainer: {
    marginBottom: 32,
    position: 'relative',
    ...Platform.select({
      android: {
        paddingVertical: 4,  // 為邊框留空間
      },
    }),
  },
  customSliderTrackBackground: {
    position: 'absolute',
    top: 16,
    left: 0,
    right: 0,
    height: 24,
    backgroundColor: '#DFE6E9',
    borderRadius: 12,
    zIndex: 1,
    ...Platform.select({
      android: {
        borderWidth: 1,
        borderColor: '#CBD5E0',
        elevation: 2,
      },
    }),
  },
  customSliderTrackFilled: {
    position: 'absolute',
    top: 16,
    left: 0,
    height: 24,
    backgroundColor: '#29B6F6',
    borderRadius: 12,
    zIndex: 2,
    ...Platform.select({
      ios: {
        shadowColor: '#29B6F6',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.4,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,  // Android 使用 elevation
        borderWidth: 1,
        borderColor: '#1E88A8',  // 深色邊框增強效果
      },
    }),
  },
  slider: {
    width: '100%',
    height: 64,
    position: 'relative',
    zIndex: 3,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
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

  // ========== 完成頁 ==========
  completionContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  confettiCenter: {
    position: 'relative',
    width: 128,
    height: 128,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  completionIconContainer: {
    position: 'relative',
    width: 128,
    height: 128,
  },
  completionIconGradient: {
    width: 128,
    height: 128,
    borderRadius: 24,
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
    marginBottom: 28,
  },
  streakCard: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 16,
    padding: 24,
    marginBottom: 32,
    shadowColor: '#bae6fd',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 4,
  },
  streakHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 8,
  },
  streakLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
  },
  streakNumberContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: 8,
  },
  streakNumber: {
    fontSize: 36,
    fontWeight: '700',
    color: '#0ea5e9',
  },
  streakUnit: {
    fontSize: 18,
    color: '#9ca3af',
    marginBottom: 4,
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
