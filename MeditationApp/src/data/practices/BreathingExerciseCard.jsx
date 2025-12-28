// BreathingExerciseCard.jsx - 根據設計稿重新設計
import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  Animated,
  TextInput,
  Keyboard,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
  Modal,
  Dimensions,
} from 'react-native';
import Slider from '@react-native-community/slider';
import { Audio } from 'expo-av';
import { LinearGradient } from 'expo-linear-gradient';
import MaskedView from '@react-native-masked-view/masked-view';
import { 
  Home, 
  ChevronLeft, 
  ChevronRight, 
  X, 
  Headphones, 
  Eye,
  Play,
  Pause,
} from 'lucide-react-native';
import ProgressBar from './components/ProgressBar';
import ApiService from '../../../api';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// 統一練習類型名稱
const PRACTICE_TYPE = '呼吸穩定力練習';

export default function BreathingExerciseCard({ onBack, navigation, route, onHome }) {
  // ============================================
  // 狀態管理
  // ============================================
  
  // 頁面狀態
  const [currentPage, setCurrentPage] = useState('selection'); // selection, practice, relaxation, completion
  
  // 練習類型 Tab
  const [activeTab, setActiveTab] = useState('stress'); // 'stress' or 'focus'
  
  // 引導模式
  const [guideMode, setGuideMode] = useState('audio'); // 'audio' or 'visual'
  
  // 練習進行狀態
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [showPauseModal, setShowPauseModal] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [totalDuration, setTotalDuration] = useState(300); // 5分鐘
  
  // 呼吸動畫狀態
  const [breathPhase, setBreathPhase] = useState('吸氣'); // 吸氣、吐氣
  
  // 放鬆程度
  const [relaxLevel, setRelaxLevel] = useState(5);
  
  // 完成頁面狀態
  const [selectedFeelings, setSelectedFeelings] = useState([]);
  const [customFeeling, setCustomFeeling] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  
  // API 相關
  const [practiceId, setPracticeId] = useState(null);
  const [startTime, setStartTime] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isLoadingStats, setIsLoadingStats] = useState(false);
  const [completionData, setCompletionData] = useState(null);
  
  // 音檔相關
  const [isAudioLoading, setIsAudioLoading] = useState(false);
  const sound = useRef(null);
  const timerRef = useRef(null);
  const breathTimerRef = useRef(null);
  const breathTimeoutRef = useRef(null);  // 用於存儲 setTimeout ID
  const breathAnimationRef = useRef(null); // 用於存儲當前動畫
  const hasInitialized = useRef(false);

  // ============================================
  // 動畫值
  // ============================================
  
  // 呼吸圓圈動畫
  const breathCircleScale = useRef(new Animated.Value(1)).current;
  const breathCircleOpacity = useRef(new Animated.Value(0.5)).current;
  
  // 音頻波形動畫
  const waveHeights = [12, 20, 16, 28, 24, 32, 28, 20, 16, 24, 28, 32, 28, 24, 20];
  const waveAnimations = useRef(
    waveHeights.map(() => new Animated.Value(0.3))
  ).current;

  const previousScreen = route?.params?.from;

  // ============================================
  // 練習數據
  // ============================================
  
  const practiceTypes = {
    stress: {
      id: 'stress',
      title: '減壓放鬆',
      subtitle: '4-6 呼吸法',
      tags: ['焦慮', '會議前', '助眠'],
      description: '4秒吸氣，6秒吐氣。透過延長吐氣時間來啟動副交感神經，幫助您快速緩解緊張或焦慮，身心逐漸放鬆。',
      audioFile: { uri: 'https://curiouscreate.com/api/asserts/4-6.mp3' },
      breathPattern: { inhale: 4, exhale: 6 }, // 4秒吸氣，6秒吐氣
    },
    focus: {
      id: 'focus',
      title: '專注穩定',
      subtitle: '4-7-8 呼吸法',
      tags: ['專注', '穩壓', '清晰'],
      description: '4秒吸氣，7秒屏息，8秒吐氣。透過屏息呼吸來提升專注力與穩定性，幫助您集中注意力，保持清晰的思維。',
      audioFile: { uri: 'https://curiouscreate.com/api/asserts/breath-holding.mp3' },
      breathPattern: { inhale: 4, hold: 7, exhale: 8 },
    },
  };
  
  const currentPractice = practiceTypes[activeTab];
  
  // 感受選項
  const feelingOptions = [
    { id: 'calm', label: '平靜' },
    { id: 'focus', label: '專注' },
    { id: 'relaxed', label: '放鬆' },
    { id: 'clear', label: '清晰' },
    { id: 'sleepy', label: '想睡' },
    { id: 'energized', label: '更有力' },
  ];

  // ============================================
  // API 串接函數
  // ============================================

  const initializePractice = async () => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;
    
    try {
      const response = await ApiService.startPractice(PRACTICE_TYPE);
      if (response?.practiceId) {
        setPracticeId(response.practiceId);
        const restoredSeconds = response.accumulatedSeconds ? Number(response.accumulatedSeconds) : 0;
        setElapsedTime(restoredSeconds);
      }
    } catch (error) {
      console.error('初始化練習失敗:', error);
      hasInitialized.current = false;
    } finally {
      setStartTime(Date.now());
    }
  };

  const saveProgress = useCallback(async () => {
    if (!practiceId) return;
    
    try {
      const formData = {
        practiceType: activeTab,
        guideMode,
        relaxLevel,
        selectedFeelings,
        customFeeling,
        currentPage,
      };
      
      await ApiService.updatePracticeProgress(
        practiceId, 0, 6, formData, elapsedTime
      );
    } catch (error) {
      console.error('儲存進度失敗:', error);
    }
  }, [practiceId, activeTab, guideMode, relaxLevel, selectedFeelings, customFeeling, currentPage, elapsedTime]);

  const completePractice = async () => {
    if (!practiceId) return;
    
    try {
      let totalSeconds = elapsedTime || Math.floor((Date.now() - startTime) / 1000) || 60;
      const totalMinutes = Math.max(1, Math.ceil(totalSeconds / 60));
      
      await saveProgress();
      
      const feelingsArray = selectedFeelings.map(id => 
        feelingOptions.find(f => f.id === id)?.label
      ).filter(Boolean);
      
      if (customFeeling) feelingsArray.push(customFeeling);
      
      const completePayload = {
        practice_type: PRACTICE_TYPE,
        duration: totalMinutes,
        duration_seconds: totalSeconds,
        feeling: `練習類型：${currentPractice.title}，放鬆程度：${relaxLevel}/10`,
        noticed: feelingsArray.join('、') || '未記錄',
        reflection: customFeeling || '',
        formData: {
          practiceType: activeTab,
          practiceTitle: currentPractice.title,
          guideMode,
          relaxLevel,
          feelings: feelingsArray,
        },
      };
      
      await ApiService.completePractice(practiceId, completePayload);
    } catch (error) {
      console.error('完成練習失敗:', error);
    }
  };

  const completeAndLoadStats = async () => {
    if (!practiceId) return;
    
    try {
      setIsLoadingStats(true);
      await completePractice();
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const statsResponse = await ApiService.getPracticeStats();
      const stats = statsResponse?.stats || statsResponse;
      
      setCompletionData({
        consecutiveDays: stats.currentStreak || 0,
        totalDays: stats.totalDays || 0,
        duration: currentTime,
        relaxLevel,
      });
    } catch (error) {
      console.error('獲取統計失敗:', error);
      setCompletionData({
        consecutiveDays: 1,
        totalDays: 1,
        duration: currentTime,
        relaxLevel,
      });
    } finally {
      setIsLoadingStats(false);
    }
  };

  // ============================================
  // 練習控制函數
  // ============================================

  const loadAudio = async () => {
    if (sound.current) {
      await sound.current.unloadAsync();
      sound.current = null;
    }
    
    setIsAudioLoading(true);
    try {
      const { sound: audioSound } = await Audio.Sound.createAsync(
        currentPractice.audioFile
      );
      sound.current = audioSound;
      
      const status = await audioSound.getStatusAsync();
      if (status.isLoaded) {
        setTotalDuration(Math.floor(status.durationMillis / 1000));
      }
    } catch (error) {
      console.error('音檔載入失敗:', error);
    } finally {
      setIsAudioLoading(false);
    }
  };

  const startPractice = async (mode) => {
    setGuideMode(mode);
    
    if (!hasInitialized.current) {
      await initializePractice();
    }
    
    if (mode === 'audio') {
      await loadAudio();
    }
    
    setCurrentPage('practice');
    setIsPlaying(true);
    setIsPaused(false);
    setCurrentTime(0);
    
    // 開始計時
    startTimers();
    
    if (mode === 'audio' && sound.current) {
      await sound.current.playAsync();
    }
    
    if (mode === 'visual') {
      startBreathAnimation();
    }
  };

  const startTimers = () => {
    // 清除舊的計時器
    if (timerRef.current) clearInterval(timerRef.current);
    
    timerRef.current = setInterval(() => {
      setCurrentTime(prev => {
        if (prev >= totalDuration) {
          handlePracticeComplete();
          return prev;
        }
        return prev + 1;
      });
      setElapsedTime(prev => prev + 1);
    }, 1000);
  };

  const startBreathAnimation = () => {
    // 先停止之前的動畫
    stopBreathAnimation();
    
    const pattern = currentPractice.breathPattern;
    const inhaleDuration = pattern.inhale * 1000;
    const exhaleDuration = pattern.exhale * 1000;
    const holdDuration = (pattern.hold || 0) * 1000;
    
    const runBreathCycle = () => {
      // 吸氣
      setBreathPhase('吸氣');
      breathAnimationRef.current = Animated.timing(breathCircleScale, {
        toValue: 1.5,
        duration: inhaleDuration,
        useNativeDriver: true,
      });
      
      breathAnimationRef.current.start(() => {
        if (holdDuration > 0) {
          // 屏息
          setBreathPhase('屏息');
          breathTimeoutRef.current = setTimeout(() => {
            // 吐氣
            setBreathPhase('吐氣');
            breathAnimationRef.current = Animated.timing(breathCircleScale, {
              toValue: 1,
              duration: exhaleDuration,
              useNativeDriver: true,
            });
            breathAnimationRef.current.start();
          }, holdDuration);
        } else {
          // 吐氣
          setBreathPhase('吐氣');
          breathAnimationRef.current = Animated.timing(breathCircleScale, {
            toValue: 1,
            duration: exhaleDuration,
            useNativeDriver: true,
          });
          breathAnimationRef.current.start();
        }
      });
    };
    
    runBreathCycle();
    const cycleTime = inhaleDuration + holdDuration + exhaleDuration;
    breathTimerRef.current = setInterval(runBreathCycle, cycleTime);
  };

  // 停止呼吸動畫
  const stopBreathAnimation = () => {
    if (breathTimerRef.current) {
      clearInterval(breathTimerRef.current);
      breathTimerRef.current = null;
    }
    
    if (breathTimeoutRef.current) {
      clearTimeout(breathTimeoutRef.current);
      breathTimeoutRef.current = null;
    }
    
    if (breathAnimationRef.current) {
      breathAnimationRef.current.stop();
      breathAnimationRef.current = null;
    }
    
    // 重置動畫值
    breathCircleScale.setValue(1);
  };

  const pausePractice = async () => {
    setIsPlaying(false);
    setIsPaused(true);
    setShowPauseModal(true);
    
    // 停止計時器
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    // 停止呼吸動畫
    stopBreathAnimation();
    
    // 停止音頻波形動畫
    waveAnimations.forEach((anim) => {
      anim.stopAnimation();
      anim.setValue(0.3);
    });
    
    // 暫停音頻
    if (sound.current) {
      try {
        await sound.current.pauseAsync();
      } catch (e) {
        console.log('暫停音頻失敗:', e);
      }
    }
  };

  const resumePractice = async () => {
    setShowPauseModal(false);
    setIsPlaying(true);
    setIsPaused(false);
    
    startTimers();
    
    if (guideMode === 'audio' && sound.current) {
      await sound.current.playAsync();
    }
    
    if (guideMode === 'visual') {
      startBreathAnimation();
    }
  };

  const stopPractice = async () => {
    setIsPlaying(false);
    setIsPaused(false);
    
    // 停止計時器
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    // 停止呼吸動畫
    stopBreathAnimation();
    
    // 停止音頻波形動畫
    waveAnimations.forEach((anim) => {
      anim.stopAnimation();
      anim.setValue(0.3);
    });
    
    // 停止並卸載音頻
    if (sound.current) {
      try {
        await sound.current.stopAsync();
        await sound.current.unloadAsync();
      } catch (e) {
        console.log('停止音頻失敗:', e);
      }
      sound.current = null;
    }
  };

  const switchMode = async () => {
    const newMode = guideMode === 'audio' ? 'visual' : 'audio';
    
    // 停止當前模式的動畫/音頻
    stopBreathAnimation();
    
    if (sound.current) {
      try {
        await sound.current.pauseAsync();
      } catch (e) {}
    }
    
    setGuideMode(newMode);
    
    if (newMode === 'audio') {
      if (!sound.current) {
        await loadAudio();
      }
      if (sound.current && isPlaying) {
        await sound.current.playAsync();
      }
    } else {
      if (isPlaying) {
        startBreathAnimation();
      }
    }
  };

  const handlePracticeComplete = async () => {
    await stopPractice();
    setShowPauseModal(false);
    setCurrentPage('relaxation');
  };

  const handleEndAndRecord = async () => {
    setShowPauseModal(false);
    await stopPractice();
    setCurrentPage('relaxation');
  };

  const handleAbandon = async () => {
    setShowPauseModal(false);
    await stopPractice();
    
    if (onBack) {
      onBack();
    } else if (navigation) {
      navigation.goBack();
    }
  };

  const handleRelaxationComplete = () => {
    setCurrentPage('completion');
  };

  const handleComplete = async () => {
    await completeAndLoadStats();
    
    if (onBack) {
      onBack();
    } else if (navigation) {
      navigation.navigate('Daily');
    }
  };

  const toggleFeeling = (id) => {
    if (id === 'custom') {
      setShowCustomInput(!showCustomInput);
      return;
    }
    
    if (selectedFeelings.includes(id)) {
      setSelectedFeelings(selectedFeelings.filter(f => f !== id));
    } else {
      setSelectedFeelings([...selectedFeelings, id]);
    }
  };

  // ============================================
  // 導航處理
  // ============================================

  const handleBack = () => {
    if (currentPage === 'completion') {
      setCurrentPage('relaxation');
    } else if (currentPage === 'relaxation') {
      setCurrentPage('practice');
      resumePractice();
    } else if (currentPage === 'practice') {
      pausePractice();
    } else {
      if (onBack) {
        onBack();
      } else if (navigation) {
        navigation.goBack();
      }
    }
  };

  const handleHome = async () => {
    await stopPractice();
    
    if (practiceId) {
      await saveProgress();
    }
    
    if (onHome) {
      onHome();
    } else if (navigation) {
      navigation.navigate('Home');
    }
  };

  const handleClose = () => {
    pausePractice();
  };

  // ============================================
  // useEffect
  // ============================================

  // 音頻波形動畫
  useEffect(() => {
    if (isPlaying && guideMode === 'audio') {
      waveAnimations.forEach((anim) => {
        Animated.loop(
          Animated.sequence([
            Animated.timing(anim, {
              toValue: 1,
              duration: 300 + Math.random() * 200,
              useNativeDriver: false,
            }),
            Animated.timing(anim, {
              toValue: 0.3,
              duration: 300 + Math.random() * 200,
              useNativeDriver: false,
            }),
          ])
        ).start();
      });
    } else {
      waveAnimations.forEach((anim) => {
        anim.setValue(0.3);
      });
    }
  }, [isPlaying, guideMode]);

  // 清理
  useEffect(() => {
    return () => {
      // 停止所有動畫和計時器
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (breathTimerRef.current) {
        clearInterval(breathTimerRef.current);
      }
      if (breathTimeoutRef.current) {
        clearTimeout(breathTimeoutRef.current);
      }
      if (breathAnimationRef.current) {
        breathAnimationRef.current.stop();
      }
      
      // 停止音頻波形動畫
      waveAnimations.forEach((anim) => {
        anim.stopAnimation();
      });
      
      // 卸載音頻
      if (sound.current) {
        sound.current.unloadAsync();
      }
    };
  }, []);

  // ============================================
  // 工具函數
  // ============================================

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // ============================================
  // 渲染函數
  // ============================================

  // 練習選擇頁面
  const renderSelectionPage = () => (
    <View style={styles.pageContainer}>
      {/* Header */}
      <View style={styles.selectionHeader}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <ChevronLeft size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>呼吸練習</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Tab 切換 */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'stress' && styles.tabActive]}
          onPress={() => setActiveTab('stress')}
        >
          <Text style={[styles.tabText, activeTab === 'stress' && styles.tabTextActive]}>
            減壓
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'focus' && styles.tabActive]}
          onPress={() => setActiveTab('focus')}
        >
          <Text style={[styles.tabText, activeTab === 'focus' && styles.tabTextActive]}>
            專注
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* 練習卡片 */}
        <View style={styles.practiceCard}>
          {/* 圖標區域 */}
          <View style={styles.iconArea}>
            <View style={styles.breathIcon}>
              <Text style={styles.breathIconText}>≋</Text>
            </View>
          </View>

          {/* 標題 */}
          <Text style={styles.practiceTitle}>{currentPractice.title}</Text>
          <View style={styles.subtitleRow}>
            <Text style={styles.practiceSubtitleIcon}>≋</Text>
            <Text style={styles.practiceSubtitle}>{currentPractice.subtitle}</Text>
          </View>

          {/* 標籤 */}
          <View style={styles.tagsRow}>
            {currentPractice.tags.map((tag, idx) => (
              <View key={idx} style={styles.tagChip}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>

          {/* 說明 */}
          <Text style={styles.practiceDescription}>
            {currentPractice.description}
          </Text>

          {/* 引導模式按鈕 */}
          <View style={styles.guideModeButtons}>
            <TouchableOpacity
              style={styles.guideModeButton}
              onPress={() => startPractice('audio')}
            >
              <View style={styles.guideModeIconContainer}>
                <Headphones size={24} color="#4ECDC4" />
              </View>
              <Text style={styles.guideModeTitle}>語音引導</Text>
              <View style={styles.guideModeAction}>
                <Text style={styles.guideModeActionText}>開始播放</Text>
                <Play size={12} color="#666" fill="#666" />
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.guideModeButton}
              onPress={() => startPractice('visual')}
            >
              <View style={styles.guideModeIconContainer}>
                <Text style={styles.visualIcon}>≋</Text>
              </View>
              <Text style={styles.guideModeTitle}>視覺引導</Text>
              <View style={styles.guideModeAction}>
                <Text style={styles.guideModeActionText}>開始練習</Text>
                <Play size={12} color="#666" fill="#666" />
              </View>
            </TouchableOpacity>
          </View>

          <View style={styles.firstTimeTipContainer}>
            <Text style={styles.firstTimeTipText}>
              初次練習建議選擇語音引導
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );

  // 練習進行頁面
  const renderPracticePage = () => (
    <View style={styles.practicePageContainer}>
      <StatusBar barStyle="light-content" />
      
      {/* Header */}
      <View style={styles.practiceHeader}>
        <Text style={styles.practiceHeaderTitle}>{currentPractice.title}</Text>
        <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
          <X size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* 主要內容區域 */}
      <View style={styles.practiceContent}>
        {guideMode === 'audio' ? (
          // 語音引導模式
          <View style={styles.audioGuideContainer}>
            <View style={styles.audioWaveContainer}>
              {waveAnimations.map((anim, i) => (
                <Animated.View
                  key={i}
                  style={[
                    styles.audioWaveBar,
                    {
                      height: anim.interpolate({
                        inputRange: [0.3, 1],
                        outputRange: [8, waveHeights[i]],
                      }),
                    }
                  ]}
                />
              ))}
            </View>
          </View>
        ) : (
          // 視覺引導模式
          <View style={styles.visualGuideContainer}>
            <Animated.View
              style={[
                styles.breathCircle,
                {
                  transform: [{ scale: breathCircleScale }],
                }
              ]}
            >
              <Text style={styles.breathPhaseText}>{breathPhase}</Text>
            </Animated.View>
          </View>
        )}

        {/* 倒計時 */}
        <Text style={styles.timerText}>
          {formatTime(totalDuration - currentTime)}
        </Text>

        {/* 暫停按鈕 */}
        <TouchableOpacity onPress={pausePractice} style={styles.pauseButton}>
          <Pause size={28} color="#fff" />
        </TouchableOpacity>

        {/* 切換模式 */}
        <TouchableOpacity onPress={switchMode} style={styles.switchModeButton}>
          <Text style={styles.switchModeText}>
            切換至{guideMode === 'audio' ? '動畫' : '語音'}模式
          </Text>
        </TouchableOpacity>
      </View>

      {/* 暫停彈窗 */}
      <Modal
        visible={showPauseModal}
        transparent
        animationType="fade"
      >
        <View style={styles.pauseModalOverlay}>
          <View style={styles.pauseModalContent}>
            <Text style={styles.pauseModalTitle}>暫停中</Text>
            
            <TouchableOpacity
              style={styles.pauseModalButtonPrimary}
              onPress={resumePractice}
            >
              <Text style={styles.pauseModalButtonPrimaryText}>繼續練習</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.pauseModalButtonSecondary}
              onPress={handleEndAndRecord}
            >
              <Text style={styles.pauseModalButtonSecondaryText}>結束並紀錄</Text>
            </TouchableOpacity>
            
            <TouchableOpacity onPress={handleAbandon}>
              <Text style={styles.pauseModalAbandonText}>放棄並離開</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );

  // 放鬆程度頁面
  const renderRelaxationPage = () => (
    <View style={styles.relaxationPageContainer}>
      <View style={styles.relaxationCard}>
        {/* 返回按鈕 */}
        <TouchableOpacity onPress={handleBack} style={styles.relaxationBackButton}>
          <ChevronLeft size={24} color="#333" />
        </TouchableOpacity>

        <Text style={styles.relaxationTitle}>放鬆程度</Text>

        <View style={styles.relaxationScoreContainer}>
          <Text style={styles.relaxationScore}>{relaxLevel}</Text>
          <Text style={styles.relaxationScoreMax}>/10</Text>
        </View>

        <Text style={styles.relaxationPrompt}>
          練習後，你現在的放鬆程度如何?
        </Text>

        {/* 滑桿 */}
        <View style={styles.sliderContainer}>
          <View style={styles.sliderTrack}>
            <View 
              style={[
                styles.sliderFill, 
                { width: `${(relaxLevel / 10) * 100}%` }
              ]} 
            />
          </View>
          <Slider
            style={styles.slider}
            minimumValue={0}
            maximumValue={10}
            step={1}
            value={relaxLevel}
            onValueChange={(value) => setRelaxLevel(Math.round(value))}
            minimumTrackTintColor="transparent"
            maximumTrackTintColor="transparent"
            thumbTintColor="#fff"
          />
        </View>

        <View style={styles.sliderLabels}>
          <Text style={styles.sliderLabel}>0 (緊繃)</Text>
          <Text style={styles.sliderLabel}>10 (放鬆)</Text>
        </View>

        {/* 完成按鈕 */}
        <TouchableOpacity
          style={styles.relaxationCompleteButton}
          onPress={handleRelaxationComplete}
        >
          <Text style={styles.relaxationCompleteButtonText}>完成</Text>
          <ChevronRight size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );

  // 完成頁面
  const renderCompletionPage = () => (
    <View style={styles.completionPageContainer}>
      <Text style={styles.completionHeader}>練習完成</Text>

      {/* 專注時間 */}
      <Text style={styles.completionTime}>{formatTime(currentTime)}</Text>
      <Text style={styles.completionTimeLabel}>專注時間</Text>

      {/* 放鬆指數 */}
      <View style={styles.completionRelaxContainer}>
        <Text style={styles.completionRelaxLabel}>放鬆指數</Text>
        <View style={styles.completionRelaxScore}>
          <Text style={styles.completionRelaxNumber}>{relaxLevel}</Text>
          <Text style={styles.completionRelaxMax}>/10</Text>
        </View>
      </View>

      {/* 此刻感受 */}
      <Text style={styles.feelingsTitle}>此刻感受</Text>
      <View style={styles.feelingsContainer}>
        {feelingOptions.map((feeling) => (
          <TouchableOpacity
            key={feeling.id}
            style={[
              styles.feelingChip,
              selectedFeelings.includes(feeling.id) && styles.feelingChipActive,
            ]}
            onPress={() => toggleFeeling(feeling.id)}
          >
            <Text
              style={[
                styles.feelingChipText,
                selectedFeelings.includes(feeling.id) && styles.feelingChipTextActive,
              ]}
            >
              {feeling.label}
            </Text>
          </TouchableOpacity>
        ))}
        
        {/* 自定義按鈕 */}
        <TouchableOpacity
          style={[styles.feelingChip, showCustomInput && styles.feelingChipActive]}
          onPress={() => setShowCustomInput(!showCustomInput)}
        >
          <Text style={[styles.feelingChipText, showCustomInput && styles.feelingChipTextActive]}>
            + 自定義
          </Text>
        </TouchableOpacity>
      </View>

      {/* 自定義輸入框 */}
      {showCustomInput && (
        <TextInput
          style={styles.customInput}
          placeholder="輸入你的感受..."
          placeholderTextColor="#999"
          value={customFeeling}
          onChangeText={setCustomFeeling}
        />
      )}

      {/* 完成按鈕 */}
      <TouchableOpacity
        style={styles.completionButton}
        onPress={handleComplete}
      >
        <Text style={styles.completionButtonText}>完成</Text>
      </TouchableOpacity>
    </View>
  );

  // ============================================
  // 主渲染
  // ============================================

  if (currentPage === 'practice') {
    return renderPracticePage();
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {currentPage === 'selection' && renderSelectionPage()}
      {currentPage === 'relaxation' && renderRelaxationPage()}
      {currentPage === 'completion' && renderCompletionPage()}
    </SafeAreaView>
  );
}

// ============================================
// 樣式
// ============================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F8FA',
  },
  pageContainer: {
    flex: 1,
  },

  // ============================================
  // 選擇頁面樣式
  // ============================================
  
  selectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },

  // Tab 樣式
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: '#E8EEF2',
    borderRadius: 25,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 22,
  },
  tabActive: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tabText: {
    fontSize: 15,
    color: '#666',
    fontWeight: '500',
  },
  tabTextActive: {
    color: '#1E88A8',
    fontWeight: '600',
  },

  scrollView: {
    flex: 1,
  },

  // 練習卡片
  practiceCard: {
    marginHorizontal: 16,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  iconArea: {
    alignItems: 'center',
    marginBottom: 20,
    paddingVertical: 40,
    backgroundColor: '#E8F4F8',
    borderRadius: 16,
  },
  breathIcon: {
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  breathIconText: {
    fontSize: 48,
    color: '#5DADE2',
  },
  practiceTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1E3A5F',
    marginBottom: 8,
  },
  subtitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  practiceSubtitleIcon: {
    fontSize: 16,
    color: '#5DADE2',
    marginRight: 6,
  },
  practiceSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  tagChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#5DADE2',
  },
  tagText: {
    fontSize: 13,
    color: '#5DADE2',
  },
  practiceDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 22,
    marginBottom: 24,
  },

  // 引導模式按鈕
  guideModeButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  guideModeButton: {
    flex: 1,
    backgroundColor: '#F8FAFB',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
  },
  guideModeIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E0F7F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  visualIcon: {
    fontSize: 24,
    color: '#4ECDC4',
  },
  guideModeTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  guideModeAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  guideModeActionText: {
    fontSize: 12,
    color: '#666',
  },
  firstTimeTipContainer: {
    marginTop: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#E8F4F8',  // 淡藍色背景
    borderRadius: 12,
    alignItems: 'center',
  },
  firstTimeTipText: {
    fontSize: 13,
    color: '#1E88A8',  // 深藍色文字
    lineHeight: 18,
  },

  // ============================================
  // 練習進行頁面樣式
  // ============================================
  
  practicePageContainer: {
    flex: 1,
    backgroundColor: '#1E5F8A',
  },
  practiceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
    paddingHorizontal: 20,
    position: 'relative',
  },
  practiceHeaderTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  closeButton: {
    position: 'absolute',
    right: 20,
    top: 60,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  practiceContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 100,
  },

  // 語音引導
  audioGuideContainer: {
    marginBottom: 60,
  },
  audioWaveContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    height: 60,
  },
  audioWaveBar: {
    width: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderRadius: 2,
  },

  // 視覺引導
  visualGuideContainer: {
    marginBottom: 60,
  },
  breathCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  breathPhaseText: {
    fontSize: 20,
    color: '#fff',
    fontWeight: '500',
  },

  // 計時器
  timerText: {
    fontSize: 72,
    fontWeight: '300',
    color: '#fff',
    marginBottom: 40,
  },

  // 暫停按鈕
  pauseButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    borderColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },

  // 切換模式
  switchModeButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  switchModeText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
  },

  // ============================================
  // 暫停彈窗樣式
  // ============================================
  
  pauseModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pauseModalContent: {
    width: SCREEN_WIDTH - 64,
    alignItems: 'center',
  },
  pauseModalTitle: {
    fontSize: 28,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 40,
  },
  pauseModalButtonPrimary: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 30,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  pauseModalButtonPrimaryText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E5F8A',
  },
  pauseModalButtonSecondary: {
    width: '100%',
    backgroundColor: 'transparent',
    borderRadius: 30,
    borderWidth: 1,
    borderColor: '#fff',
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 24,
  },
  pauseModalButtonSecondaryText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#fff',
  },
  pauseModalAbandonText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
  },

  // ============================================
  // 放鬆程度頁面樣式
  // ============================================
  
  relaxationPageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  relaxationCard: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  relaxationBackButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  relaxationTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#333',
    textAlign: 'center',
    marginBottom: 24,
  },
  relaxationScoreContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
    marginBottom: 12,
  },
  relaxationScore: {
    fontSize: 64,
    fontWeight: '700',
    color: '#2196F3',
  },
  relaxationScoreMax: {
    fontSize: 24,
    color: '#999',
    marginLeft: 4,
  },
  relaxationPrompt: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 32,
  },
  sliderContainer: {
    position: 'relative',
    height: 40,
    marginBottom: 8,
  },
  sliderTrack: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: '50%',
    height: 6,
    backgroundColor: '#E0E0E0',
    borderRadius: 3,
    transform: [{ translateY: -3 }],
    overflow: 'hidden',
  },
  sliderFill: {
    height: '100%',
    backgroundColor: '#2196F3',
    borderRadius: 3,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  sliderLabel: {
    fontSize: 12,
    color: '#999',
  },
  relaxationCompleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2196F3',
    borderRadius: 30,
    paddingVertical: 16,
    gap: 8,
  },
  relaxationCompleteButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },

  // ============================================
  // 完成頁面樣式
  // ============================================
  
  completionPageContainer: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
  },
  completionHeader: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 40,
  },
  completionTime: {
    fontSize: 72,
    fontWeight: '700',
    color: '#1E5F8A',
    textAlign: 'center',
  },
  completionTimeLabel: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 60,
  },
  completionRelaxContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  completionRelaxLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  completionRelaxScore: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  completionRelaxNumber: {
    fontSize: 36,
    fontWeight: '700',
    color: '#2196F3',
  },
  completionRelaxMax: {
    fontSize: 18,
    color: '#999',
    marginLeft: 2,
  },
  feelingsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 16,
  },
  feelingsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 24,
  },
  feelingChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#DDD',
    backgroundColor: '#fff',
  },
  feelingChipActive: {
    borderColor: '#2196F3',
    backgroundColor: '#E3F2FD',
  },
  feelingChipText: {
    fontSize: 14,
    color: '#666',
  },
  feelingChipTextActive: {
    color: '#2196F3',
  },
  customInput: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    color: '#333',
    marginBottom: 24,
  },
  completionButton: {
    backgroundColor: '#2196F3',
    borderRadius: 30,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 'auto',
    marginBottom: 40,
  },
  completionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});