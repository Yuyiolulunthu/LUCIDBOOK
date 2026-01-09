// BreathingExerciseCard.jsx
// ✅ 修復重點：
// 1) 音檔載入「跟著 activeTab 走」，切換練習類型一定會載入正確 URI
// 2) 不再使用 status.uri（expo-av status 通常沒有 uri），改用 loadedAudioUriRef 記錄目前載入的音檔
// 3) 支援 asserts/assets 兩種路徑自動 fallback（避免你後端路徑拼錯導致永遠載不到）
// 4) startPractice / switchMode 時避免用到 stale state，使用 refs 同步當下的時間/模式
// 5) 清理重複 useEffect（原本卸載清理寫了兩次）避免不小心 unload 掉剛載入的音檔

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
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ChevronLeft,
  ChevronRight,
  X,
  Headphones,
  Wind,
  BookOpen,
  Star,
  Play,
  Pause,
} from 'lucide-react-native';
import ApiService from '../../../api';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const PRACTICE_TYPE = '呼吸穩定力練習';

// 星星動畫
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
    const t = setTimeout(() => {
      Animated.timing(animatedValue, {
        toValue: 1,
        duration: 2000 + Math.random() * 1000,
        useNativeDriver: true,
      }).start();
    }, meteorConfig.delay);

    return () => clearTimeout(t);
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

export default function BreathingExerciseCard({ onBack, navigation, route, onHome }) {
  // ============================================
  // 狀態
  // ============================================
  const [currentPage, setCurrentPage] = useState('selection');
  const [activeTab, setActiveTab] = useState('stress');
  const [guideMode, setGuideMode] = useState('audio');

  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [showPauseModal, setShowPauseModal] = useState(false);

  const [currentTime, setCurrentTime] = useState(0);
  const [totalDuration, setTotalDuration] = useState(300);

  const [breathPhase, setBreathPhase] = useState('吸氣');
  const [relaxLevel, setRelaxLevel] = useState(5);

  const [selectedFeelings, setSelectedFeelings] = useState([]);
  const [customFeeling, setCustomFeeling] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);

  const [practiceId, setPracticeId] = useState(null);
  const [startTime, setStartTime] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);

  const [isLoadingStats, setIsLoadingStats] = useState(false);
  const [completionData, setCompletionData] = useState(null);

  const [isAudioLoading, setIsAudioLoading] = useState(false);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

  // ============================================
  // refs（避免 stale state）
  // ============================================
  const sound = useRef(null);
  const loadedAudioUriRef = useRef(null); // ✅ 目前載入的音檔 uri（取代 status.uri）
  const isLoadingAudioRef = useRef(false);
  const loadAudioTokenRef = useRef(0); // ✅ 避免 tab 快速切換造成舊 load 覆蓋新 load

  const timerRef = useRef(null);
  const breathTimerRef = useRef(null);
  const breathTimeoutRef = useRef(null);
  const breathAnimationRef = useRef(null);

  const hasInitialized = useRef(false);

  const currentTimeRef = useRef(0);
  const totalDurationRef = useRef(300);
  const guideModeRef = useRef('audio');
  const activeTabRef = useRef('stress');

  useEffect(() => { currentTimeRef.current = currentTime; }, [currentTime]);
  useEffect(() => { totalDurationRef.current = totalDuration; }, [totalDuration]);
  useEffect(() => { guideModeRef.current = guideMode; }, [guideMode]);
  useEffect(() => { activeTabRef.current = activeTab; }, [activeTab]);

  // ============================================
  // 動畫
  // ============================================
  const breathCircleScale = useRef(new Animated.Value(1)).current;
  const iconScale = useRef(new Animated.Value(0)).current;
  const starBadgeScale = useRef(new Animated.Value(0)).current;

  const waveHeights = [12, 20, 16, 28, 24, 32, 28, 20, 16, 24, 28, 32, 28, 24, 20];
  const waveAnimations = useRef(waveHeights.map(() => new Animated.Value(0.3))).current;

  // ============================================
  // 練習資料
  // ============================================
  const practiceTypes = {
    stress: {
      id: 'stress',
      title: '減壓放鬆',
      subtitle: '4-6 呼吸法',
      tags: ['焦慮', '會議前', '助眠'],
      description: '4秒吸氣，6秒吐氣。透過延長吐氣時間來啟動副交感神經，幫助您快速緩解緊張或焦慮，身心逐漸放鬆。',
      audioFile: { uri: 'https://curiouscreate.com/api/asserts/4-6.mp3' },
      breathPattern: { inhale: 4, exhale: 6 },
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

  const feelingOptions = [
    { id: 'calm', label: '平靜' },
    { id: 'focus', label: '專注' },
    { id: 'relaxed', label: '放鬆' },
    { id: 'clear', label: '清晰' },
    { id: 'sleepy', label: '想睡' },
    { id: 'energized', label: '更有力' },
  ];

  // ============================================
  // 工具
  // ============================================
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // ✅ 可能的路徑 fallback：asserts <-> assets
  const getCandidateUris = (uri) => {
    const set = new Set();
    if (uri) set.add(uri);

    // 常見錯字修復：asserts / assets
    if (uri?.includes('/api/asserts/')) set.add(uri.replace('/api/asserts/', '/api/assets/'));
    if (uri?.includes('/api/assets/')) set.add(uri.replace('/api/assets/', '/api/asserts/'));

    return Array.from(set);
  };

  // ============================================
  // Audio config
  // ============================================
  const configureAudio = async () => {
    await Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      staysActiveInBackground: true,
      shouldDuckAndroid: true,
      playThroughEarpieceAndroid: false,
      allowsRecordingIOS: false,
      interruptionModeIOS: 1,
      interruptionModeAndroid: 1,
    });
  };

  // ============================================
  // API
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
        practiceType: activeTabRef.current,
        guideMode: guideModeRef.current,
        relaxLevel,
        selectedFeelings,
        customFeeling,
        currentPage,
      };

      await ApiService.updatePracticeProgress(practiceId, 0, 6, formData, elapsedTime);
    } catch (error) {
      console.error('儲存進度失敗:', error);
    }
  }, [practiceId, relaxLevel, selectedFeelings, customFeeling, currentPage, elapsedTime]);

  const completePractice = async () => {
    if (!practiceId) {
      console.error('❌ [呼吸練習] practiceId 為空');
      return;
    }

    try {
      let totalSeconds = elapsedTime || Math.floor((Date.now() - startTime) / 1000) || 60;
      const totalMinutes = Math.max(1, Math.ceil(totalSeconds / 60));

      await saveProgress();

      const feelingsArray = selectedFeelings
        .map((id) => feelingOptions.find((f) => f.id === id)?.label)
        .filter(Boolean);

      if (customFeeling && customFeeling.trim()) feelingsArray.push(customFeeling.trim());

      const enhancedFormData = {
        practiceType: activeTabRef.current,
        practiceTitle: practiceTypes[activeTabRef.current].title,
        guideMode: guideModeRef.current,
        relaxLevel,
        relax_level: relaxLevel,
        feelings: feelingsArray,
        post_feelings: feelingsArray.join('、'),
        postFeelings: feelingsArray.join('、'),
        post_mood: feelingsArray.length > 0 ? feelingsArray[0] : '平靜',
        postMood: feelingsArray.length > 0 ? feelingsArray[0] : '平靜',
        customFeeling: customFeeling || '',
        hasCustomFeeling: !!customFeeling,
      };

      const completePayload = {
        practice_type: PRACTICE_TYPE,
        duration: totalMinutes,
        duration_seconds: totalSeconds,
        feeling: `練習類型：${practiceTypes[activeTabRef.current].title}，放鬆程度：${relaxLevel}/10，心情：${feelingsArray.join('、') || '未記錄'}`,
        noticed: feelingsArray.join('、') || '未記錄',
        reflection: customFeeling || '',
        form_data: enhancedFormData,
      };

      await ApiService.completePractice(practiceId, completePayload);
    } catch (error) {
      console.error('❌ [呼吸練習] 完成練習失敗:', error);
    }
  };

  const completeAndLoadStats = async () => {
    if (!practiceId) return;

    try {
      setIsLoadingStats(true);
      await completePractice();
      await new Promise((resolve) => setTimeout(resolve, 500));

      const statsResponse = await ApiService.getPracticeStats();
      const stats = statsResponse?.stats || statsResponse;

      setCompletionData({
        consecutiveDays: stats.currentStreak || 0,
        totalDays: stats.totalDays || 0,
        duration: currentTimeRef.current,
        relaxLevel,
      });
    } catch (error) {
      console.error('獲取統計失敗:', error);
      setCompletionData({
        consecutiveDays: 1,
        totalDays: 1,
        duration: currentTimeRef.current,
        relaxLevel,
      });
    } finally {
      setIsLoadingStats(false);
    }
  };

  // ============================================
  // ✅ 音檔載入（核心修正）
  // ============================================
  const unloadAudio = async () => {
    if (!sound.current) return;
    try {
      await sound.current.stopAsync().catch(() => {});
      await sound.current.unloadAsync().catch(() => {});
    } finally {
      sound.current = null;
      loadedAudioUriRef.current = null;
    }
  };

  const loadAudioForTab = async (tabKey) => {
    // ✅ 避免重入
    if (isLoadingAudioRef.current) return;
    isLoadingAudioRef.current = true;

    const token = ++loadAudioTokenRef.current;
    setIsAudioLoading(true);

    try {
      await configureAudio();

      const practice = practiceTypes[tabKey];
      const targetUri = practice?.audioFile?.uri;

      if (!targetUri) {
        throw new Error('audioFile.uri 為空');
      }

      // ✅ 如果已載入且是同一個 URI，直接 return
      if (sound.current && loadedAudioUriRef.current === targetUri) {
        setIsAudioLoading(false);
        isLoadingAudioRef.current = false;
        return;
      }

      // ✅ 卸載舊音檔（如果 tab 切換）
      if (sound.current) {
        await unloadAudio();
      }

      const candidates = getCandidateUris(targetUri);
      let lastError = null;

      for (const uri of candidates) {
        if (loadAudioTokenRef.current !== token) {
          // 有更新的 load 進來了，這次作廢
          return;
        }

        try {
          const { sound: audioSound } = await Audio.Sound.createAsync(
            { uri },
            { shouldPlay: false },
            (status) => {
              // ✅ 音檔播放中同步 currentTime / totalDuration
              if (status?.isLoaded) {
                const posSec = Math.floor((status.positionMillis || 0) / 1000);
                const durSec = Math.floor((status.durationMillis || 0) / 1000);

                if (status.isPlaying) {
                  setCurrentTime(posSec);
                }

                if (durSec > 0 && totalDurationRef.current !== durSec) {
                  setTotalDuration(durSec);
                }

                if (status.didJustFinish) {
                  handlePracticeComplete();
                }
              }
            }
          );

          // ✅ 確認載入成功後再設定 ref
          const st = await audioSound.getStatusAsync();
          if (!st.isLoaded) {
            await audioSound.unloadAsync().catch(() => {});
            throw new Error('音檔未成功載入');
          }

          sound.current = audioSound;
          loadedAudioUriRef.current = targetUri; // ✅ 記「目標」URI（不是 fallback 可能替換的 uri）
          if (st.durationMillis) setTotalDuration(Math.floor(st.durationMillis / 1000));

          lastError = null;
          break;
        } catch (e) {
          lastError = e;
        }
      }

      if (lastError) {
        throw lastError;
      }
    } catch (error) {
      console.error('❌ 音檔載入失敗:', error);
      Alert.alert('錯誤', '音檔載入失敗，請檢查網路或音檔路徑');
    } finally {
      if (loadAudioTokenRef.current === token) {
        setIsAudioLoading(false);
      }
      isLoadingAudioRef.current = false;
    }
  };

  // ============================================
  // 計時器 / 呼吸動畫
  // ============================================
  const startTimers = () => {
    if (timerRef.current) clearInterval(timerRef.current);

    timerRef.current = setInterval(() => {
      setCurrentTime((prev) => {
        const next = prev + 1;
        if (next >= totalDurationRef.current) {
          handlePracticeComplete();
          return prev;
        }
        return next;
      });
      setElapsedTime((prev) => prev + 1);
    }, 1000);
  };

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
    breathCircleScale.setValue(1);
  };

  const startBreathAnimation = () => {
    stopBreathAnimation();

    const pattern = practiceTypes[activeTabRef.current].breathPattern;
    const inhaleDuration = (pattern.inhale || 4) * 1000;
    const holdDuration = (pattern.hold || 0) * 1000;
    const exhaleDuration = (pattern.exhale || 6) * 1000;

    const runBreathCycle = () => {
      setBreathPhase('吸氣');
      breathAnimationRef.current = Animated.timing(breathCircleScale, {
        toValue: 1.5,
        duration: inhaleDuration,
        useNativeDriver: true,
      });

      breathAnimationRef.current.start(() => {
        if (holdDuration > 0) {
          setBreathPhase('屏息');
          breathTimeoutRef.current = setTimeout(() => {
            setBreathPhase('吐氣');
            breathAnimationRef.current = Animated.timing(breathCircleScale, {
              toValue: 1,
              duration: exhaleDuration,
              useNativeDriver: true,
            });
            breathAnimationRef.current.start();
          }, holdDuration);
        } else {
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

  // ============================================
  // 練習控制
  // ============================================
  const startPractice = async (mode) => {
    const tabKey = activeTabRef.current;

    setGuideMode(mode);
    guideModeRef.current = mode;

    try {
      await activateKeepAwakeAsync();
    } catch {}

    if (!hasInitialized.current) {
      await initializePractice();
      await new Promise((r) => setTimeout(r, 150));
    }

    // ✅ 進入音訊模式：確保載入的是「當前 tab」音檔
    if (mode === 'audio') {
      await loadAudioForTab(tabKey);
    }

    setCurrentPage('practice');
    setIsPlaying(true);
    setIsPaused(false);

    // ✅ 重設時間（開始新一輪）
    setCurrentTime(0);
    currentTimeRef.current = 0;

    if (mode === 'audio') {
      if (sound.current) {
        try {
          await sound.current.setPositionAsync(0);
          await sound.current.playAsync();
        } catch (error) {
          console.error('❌ 播放音頻失敗:', error);
          Alert.alert('錯誤', '音頻播放失敗，請重試');
        }
      } else {
        Alert.alert('錯誤', '音檔尚未載入完成');
      }
    } else {
      startTimers();
      startBreathAnimation();
    }
  };

  const pausePractice = async () => {
    setIsPlaying(false);
    setIsPaused(true);
    setShowPauseModal(true);

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    stopBreathAnimation();

    waveAnimations.forEach((anim) => {
      anim.stopAnimation();
      anim.setValue(0.3);
    });

    if (sound.current) {
      try {
        await sound.current.pauseAsync();
      } catch {}
    }
  };

  const resumePractice = async () => {
    setShowPauseModal(false);
    setIsPlaying(true);
    setIsPaused(false);

    const mode = guideModeRef.current;

    if (mode === 'audio') {
      if (!sound.current) {
        await loadAudioForTab(activeTabRef.current);
      }
      if (sound.current) {
        try {
          await sound.current.playAsync();
        } catch {}
      }
    } else {
      startTimers();
      startBreathAnimation();
    }
  };

  const stopPractice = async () => {
    setIsPlaying(false);
    setIsPaused(false);

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    stopBreathAnimation();

    waveAnimations.forEach((anim) => {
      anim.stopAnimation();
      anim.setValue(0.3);
    });

    await unloadAudio();

    try {
      deactivateKeepAwake();
    } catch {}
  };

  // ✅ 模式切換：保留時間，音訊切換會 seek 到正確秒數
  const switchMode = async () => {
    const prevMode = guideModeRef.current;
    const nextMode = prevMode === 'audio' ? 'visual' : 'audio';

    // 先停掉「當前模式」的東西
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    stopBreathAnimation();

    // 如果從 audio -> visual：讀取音訊目前時間
    if (prevMode === 'audio' && sound.current) {
      try {
        const status = await sound.current.getStatusAsync();
        if (status?.isLoaded) {
          const posSec = Math.floor((status.positionMillis || 0) / 1000);
          setCurrentTime(posSec);
          currentTimeRef.current = posSec;
        }
        await sound.current.pauseAsync();
      } catch {}
    }

    setGuideMode(nextMode);
    guideModeRef.current = nextMode;

    // 啟動新模式
    if (nextMode === 'audio') {
      await loadAudioForTab(activeTabRef.current);
      if (sound.current && isPlaying) {
        try {
          await sound.current.setPositionAsync(currentTimeRef.current * 1000);
          await sound.current.playAsync();
        } catch (e) {
          console.error('恢復播放失敗:', e);
        }
      }
    } else {
      if (isPlaying) {
        startTimers();
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

    if (onBack) onBack();
    else if (navigation) navigation.goBack();
  };

  const handleRelaxationComplete = async () => {
    try {
      setIsLoadingStats(true);
      await saveProgress();
      setCurrentPage('completion');
    } catch (error) {
      console.error('❌ [呼吸練習] 儲存失敗:', error);
      setCurrentPage('completion');
    } finally {
      setIsLoadingStats(false);
    }
  };

  const toggleFeeling = (id) => {
    if (id === 'custom') {
      setShowCustomInput(!showCustomInput);
      return;
    }
    if (selectedFeelings.includes(id)) {
      setSelectedFeelings(selectedFeelings.filter((f) => f !== id));
    } else {
      setSelectedFeelings([...selectedFeelings, id]);
    }
  };

  // ============================================
  // 導航
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
      if (onBack) onBack();
      else if (navigation) navigation.goBack();
    }
  };

  const handleHome = async () => {
    await stopPractice();
    if (practiceId) await saveProgress();

    if (onHome) onHome();
    else if (navigation) navigation.navigate('Home');
  };

  const handleClose = () => pausePractice();

  // ============================================
  // effects
  // ============================================
  // ✅ 音波動畫（audio 播放才動）
  useEffect(() => {
    if (isPlaying && guideModeRef.current === 'audio') {
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
      waveAnimations.forEach((anim) => anim.setValue(0.3));
    }
  }, [isPlaying, guideMode, waveAnimations]);

  // ✅ 預載音檔：selection 頁 + tab 切換時載入該 tab 音檔
  useEffect(() => {
    if (currentPage === 'selection') {
      loadAudioForTab(activeTab);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, activeTab]);

  // ✅ 成功頁動畫
  useEffect(() => {
    if (currentPage === 'success') {
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
  }, [currentPage, iconScale, starBadgeScale]);

  // ✅ 鍵盤
  useEffect(() => {
    const keyboardWillShow = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      () => setIsKeyboardVisible(true)
    );
    const keyboardWillHide = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => setIsKeyboardVisible(false)
    );
    return () => {
      keyboardWillShow.remove();
      keyboardWillHide.remove();
    };
  }, []);

  // ✅ 組件卸載清理（只留一份）
  useEffect(() => {
    return () => {
      try {
        if (timerRef.current) clearInterval(timerRef.current);
        if (breathTimerRef.current) clearInterval(breathTimerRef.current);
        if (breathTimeoutRef.current) clearTimeout(breathTimeoutRef.current);
        if (breathAnimationRef.current) breathAnimationRef.current.stop();
        waveAnimations.forEach((anim) => anim.stopAnimation());
      } catch {}

      unloadAudio().catch(() => {});
      try {
        deactivateKeepAwake();
      } catch {}
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ============================================
  // UI render
  // ============================================
  const renderSelectionPage = () => (
    <View style={styles.pageContainer}>
      <View style={styles.selectionHeader}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <ChevronLeft size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>呼吸練習</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'stress' && styles.tabActive]}
          onPress={() => setActiveTab('stress')}
        >
          <Text style={[styles.tabText, activeTab === 'stress' && styles.tabTextActive]}>減壓</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'focus' && styles.tabActive]}
          onPress={() => setActiveTab('focus')}
        >
          <Text style={[styles.tabText, activeTab === 'focus' && styles.tabTextActive]}>專注</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.practiceCard}>
          <View style={styles.iconArea}>
            <View style={styles.breathIcon}>
              <Text style={styles.breathIconText}>≋</Text>
            </View>
          </View>

          <Text style={styles.practiceTitle}>{currentPractice.title}</Text>
          <View style={styles.subtitleRow}>
            <Text style={styles.practiceSubtitleIcon}>≋</Text>
            <Text style={styles.practiceSubtitle}>{currentPractice.subtitle}</Text>
          </View>

          <View style={styles.tagsRow}>
            {currentPractice.tags.map((tag, idx) => (
              <View key={idx} style={styles.tagChip}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>

          <Text style={styles.practiceDescription}>{currentPractice.description}</Text>

          <View style={styles.guideModeButtons}>
            <TouchableOpacity
              style={styles.guideModeButton}
              onPress={() => startPractice('audio')}
              disabled={isAudioLoading}
            >
              <View style={styles.guideModeIconContainer}>
                {isAudioLoading ? (
                  <ActivityIndicator size="small" color="#4ECDC4" />
                ) : (
                  <Headphones size={24} color="#4ECDC4" />
                )}
              </View>
              <Text style={styles.guideModeTitle}>語音引導</Text>
              <View style={styles.guideModeAction}>
                <Text style={styles.guideModeActionText}>{isAudioLoading ? '載入中...' : '開始播放'}</Text>
                {!isAudioLoading && <Play size={12} color="#666" fill="#666" />}
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.guideModeButton} onPress={() => startPractice('visual')}>
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
            <Text style={styles.firstTimeTipText}>初次練習建議選擇語音引導</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );

  const renderPracticePage = () => (
    <View style={styles.practicePageContainer}>
      <StatusBar barStyle="light-content" />

      <View style={styles.practiceHeader}>
        <Text style={styles.practiceHeaderTitle}>{currentPractice.title}</Text>
        <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
          <X size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={styles.practiceContent}>
        {guideMode === 'audio' ? (
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
                    },
                  ]}
                />
              ))}
            </View>
          </View>
        ) : (
          <View style={styles.visualGuideContainer}>
            <Animated.View style={[styles.breathCircle, { transform: [{ scale: breathCircleScale }] }]}>
              <Text style={styles.breathPhaseText}>{breathPhase}</Text>
            </Animated.View>
          </View>
        )}

        <Text style={styles.timerText}>{formatTime(Math.max(0, totalDuration - currentTime))}</Text>

        <TouchableOpacity onPress={pausePractice} style={styles.pauseButton}>
          <Pause size={28} color="#fff" />
        </TouchableOpacity>

        <TouchableOpacity onPress={switchMode} style={styles.switchModeButton}>
          <Text style={styles.switchModeText}>切換至{guideMode === 'audio' ? '動畫' : '語音'}模式</Text>
        </TouchableOpacity>
      </View>

      <Modal visible={showPauseModal} transparent animationType="fade">
        <View style={styles.pauseModalOverlay}>
          <View style={styles.pauseModalContent}>
            <Text style={styles.pauseModalTitle}>暫停中</Text>

            <TouchableOpacity style={styles.pauseModalButtonPrimary} onPress={resumePractice}>
              <Text style={styles.pauseModalButtonPrimaryText}>繼續練習</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.pauseModalButtonSecondary} onPress={handleEndAndRecord}>
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

  const renderRelaxationPage = () => (
    <View style={styles.relaxationPageContainer}>
      <View style={styles.relaxationCard}>
        <LinearGradient colors={['#29B6F6', '#0288D1']} style={styles.relaxationAccentBar} />

        <TouchableOpacity onPress={handleBack} style={styles.relaxationBackButton}>
          <ChevronLeft size={24} color="#333" />
        </TouchableOpacity>

        <Text style={styles.relaxationTitle}>放鬆程度</Text>

        <View style={styles.relaxationScoreContainer}>
          <Text style={styles.relaxationScore}>{relaxLevel}</Text>
          <Text style={styles.relaxationScoreMax}>/10</Text>
        </View>

        <Text style={styles.relaxationPrompt}>練習後，你現在的放鬆程度如何?</Text>

        <View style={styles.sliderContainer}>
          <View style={styles.customSliderTrackBackground} />
          <View style={[styles.customSliderTrackFilled, { width: `${(relaxLevel / 10) * 100}%` }]} />
          <Slider
            style={styles.slider}
            minimumValue={0}
            maximumValue={10}
            step={1}
            value={relaxLevel}
            onValueChange={(value) => setRelaxLevel(Math.round(value))}
            minimumTrackTintColor="transparent"
            maximumTrackTintColor="transparent"
            thumbTintColor={Platform.OS === 'android' ? '#164b88ff' : '#FFFFFF'}
          />

          <View style={styles.sliderLabels}>
            <Text style={styles.sliderLabel}>0 (緊繃)</Text>
            <Text style={styles.sliderLabel}>10 (放鬆)</Text>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.relaxationCompleteButton, isLoadingStats && { opacity: 0.6 }]}
          onPress={handleRelaxationComplete}
          disabled={isLoadingStats}
          activeOpacity={0.8}
        >
          {isLoadingStats ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <>
              <Text style={styles.relaxationCompleteButtonText}>完成</Text>
              <ChevronRight size={20} color="#fff" />
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderCompletionPage = () => (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.completionPageContainer}>
          <ScrollView
            contentContainerStyle={[
              styles.completionScrollContent,
              { paddingBottom: isKeyboardVisible ? 200 : 100 },
            ]}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <Text style={styles.completionHeader}>練習完成</Text>

            <Text style={styles.completionTime}>{formatTime(currentTime)}</Text>
            <Text style={styles.completionTimeLabel}>專注時間</Text>

            <View style={styles.completionRelaxContainer}>
              <Text style={styles.completionRelaxLabel}>放鬆指數</Text>
              <View style={styles.completionRelaxScore}>
                <Text style={styles.completionRelaxNumber}>{relaxLevel}</Text>
                <Text style={styles.completionRelaxMax}>/10</Text>
              </View>
            </View>

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

              <TouchableOpacity
                style={[styles.feelingChip, showCustomInput && styles.feelingChipActive]}
                onPress={() => setShowCustomInput(!showCustomInput)}
              >
                <Text style={[styles.feelingChipText, showCustomInput && styles.feelingChipTextActive]}>
                  + 自定義
                </Text>
              </TouchableOpacity>
            </View>

            {showCustomInput && (
              <TextInput
                style={styles.customInput}
                placeholder="輸入你的感受..."
                placeholderTextColor="#999"
                value={customFeeling}
                onChangeText={setCustomFeeling}
                multiline
                maxLength={100}
                textAlignVertical="top"
              />
            )}
          </ScrollView>

          {!isKeyboardVisible && (
            <View style={styles.completionButtonContainer}>
              <TouchableOpacity
                style={styles.completionButton}
                onPress={async () => {
                  Keyboard.dismiss();
                  setIsLoadingStats(true);
                  await completeAndLoadStats();
                  setIsLoadingStats(false);
                  setTimeout(() => setCurrentPage('success'), 100);
                }}
                disabled={isLoadingStats}
              >
                {isLoadingStats ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.completionButtonText}>完成</Text>
                )}
              </TouchableOpacity>
            </View>
          )}
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );

  const renderSuccessPage = () => {
    const safeCompletionData = completionData || {
      consecutiveDays: 1,
      totalDays: 1,
      duration: currentTimeRef.current,
      relaxLevel,
    };

    const handleViewJournal = async () => {
      try {
        navigation.navigate('MainTabs', {
          screen: 'Daily',
          params: { highlightPracticeId: practiceId },
        });
      } catch (error) {
        navigation.navigate('MainTabs', { screen: 'Daily' });
      }
    };

    return (
      <View style={styles.successPageContainer}>
        <LinearGradient colors={['#f0f9ff', '#e0f2fe']} style={styles.gradientBg}>
          <View style={styles.successContent}>
            <View
              style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
              pointerEvents="none"
            >
              {[...Array(20)].map((_, i) => (
                <StarConfetti key={i} index={i} />
              ))}
            </View>

            <Animated.View style={[styles.successIconContainer, { transform: [{ scale: iconScale }] }]}>
              <LinearGradient colors={['#60a5fa', '#38bdf8']} style={styles.successIconGradient}>
                <Wind size={64} color="rgba(255,255,255,0.9)" />
              </LinearGradient>

              <Animated.View style={[styles.starBadge, { transform: [{ scale: starBadgeScale }] }]}>
                <Star size={24} color="#FFFFFF" fill="#FFFFFF" />
              </Animated.View>
            </Animated.View>

            <Text style={styles.successTitle}>太棒了！</Text>
            <Text style={styles.successSubtitle}>你完成了今天的呼吸練習</Text>

            <View style={styles.statsCard}>
              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{formatTime(currentTimeRef.current)}</Text>
                  <Text style={styles.statLabel}>練習時間</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{relaxLevel}/10</Text>
                  <Text style={styles.statLabel}>放鬆指數</Text>
                </View>
              </View>
            </View>

            <TouchableOpacity style={styles.viewJournalButton} onPress={handleViewJournal}>
              <BookOpen size={16} color="#0ea5e9" />
              <Text style={styles.viewJournalText}>查看日記</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </View>
    );
  };

  // ============================================
  // 主渲染
  // ============================================
  if (currentPage === 'practice') return renderPracticePage();
  if (currentPage === 'success') return renderSuccessPage();

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
// Styles（原樣保留）
// ============================================
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F8FA' },
  pageContainer: { flex: 1 },

  selectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '600', color: '#333' },

  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: '#E8EEF2',
    borderRadius: 25,
    padding: 4,
  },
  tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 22 },
  tabActive: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tabText: { fontSize: 15, color: '#666', fontWeight: '500' },
  tabTextActive: { color: '#1E88A8', fontWeight: '600' },

  scrollView: { flex: 1 },

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
  breathIcon: { width: 60, height: 60, justifyContent: 'center', alignItems: 'center' },
  breathIconText: { fontSize: 48, color: '#5DADE2' },

  practiceTitle: { fontSize: 24, fontWeight: '700', color: '#1E3A5F', marginBottom: 8 },
  subtitleRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  practiceSubtitleIcon: { fontSize: 16, color: '#5DADE2', marginRight: 6 },
  practiceSubtitle: { fontSize: 14, color: '#666' },

  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  tagChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#5DADE2',
  },
  tagText: { fontSize: 13, color: '#5DADE2' },

  practiceDescription: { fontSize: 14, color: '#666', lineHeight: 22, marginBottom: 24 },

  guideModeButtons: { flexDirection: 'row', gap: 12 },
  guideModeButton: { flex: 1, backgroundColor: '#F8FAFB', borderRadius: 16, padding: 16, alignItems: 'center' },
  guideModeIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E0F7F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  visualIcon: { fontSize: 24, color: '#4ECDC4' },
  guideModeTitle: { fontSize: 14, fontWeight: '600', color: '#333', marginBottom: 4 },
  guideModeAction: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  guideModeActionText: { fontSize: 12, color: '#666' },

  firstTimeTipContainer: {
    marginTop: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#E8F4F8',
    borderRadius: 12,
    alignItems: 'center',
  },
  firstTimeTipText: { fontSize: 13, color: '#1E88A8', lineHeight: 18 },

  practicePageContainer: { flex: 1, backgroundColor: '#1E5F8A' },
  practiceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
    paddingHorizontal: 20,
    position: 'relative',
  },
  practiceHeaderTitle: { fontSize: 18, fontWeight: '600', color: '#fff' },
  closeButton: {
    position: 'absolute',
    right: 20,
    top: 60,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  practiceContent: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingBottom: 100 },

  audioGuideContainer: { marginBottom: 60 },
  audioWaveContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, height: 60 },
  audioWaveBar: { width: 4, backgroundColor: 'rgba(255, 255, 255, 0.6)', borderRadius: 2 },

  visualGuideContainer: { marginBottom: 60 },
  breathCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  breathPhaseText: { fontSize: 20, color: '#fff', fontWeight: '500' },

  timerText: { fontSize: 72, fontWeight: '300', color: '#fff', marginBottom: 40 },
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
  switchModeButton: { paddingVertical: 8, paddingHorizontal: 16 },
  switchModeText: { fontSize: 14, color: 'rgba(255, 255, 255, 0.7)' },

  pauseModalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.85)', justifyContent: 'center', alignItems: 'center' },
  pauseModalContent: { width: SCREEN_WIDTH - 64, alignItems: 'center' },
  pauseModalTitle: { fontSize: 28, fontWeight: '600', color: '#fff', marginBottom: 40 },
  pauseModalButtonPrimary: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 30,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  pauseModalButtonPrimaryText: { fontSize: 16, fontWeight: '600', color: '#1E5F8A' },
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
  pauseModalButtonSecondaryText: { fontSize: 16, fontWeight: '500', color: '#fff' },
  pauseModalAbandonText: { fontSize: 14, color: 'rgba(255, 255, 255, 0.6)' },

  relaxationPageContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 24 },
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
    position: 'relative',
    overflow: 'hidden',
  },
  relaxationAccentBar: {
    position: 'absolute',
    top: 0,
    left: '2%',
    right: '2%',
    height: 8,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
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
  relaxationTitle: { fontSize: 22, fontWeight: '700', color: '#333', textAlign: 'center', marginBottom: 24 },
  relaxationScoreContainer: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'center', marginBottom: 12 },
  relaxationScore: { fontSize: 64, fontWeight: '700', color: '#2196F3' },
  relaxationScoreMax: { fontSize: 24, color: '#999', marginLeft: 4 },
  relaxationPrompt: { fontSize: 14, color: '#666', textAlign: 'center', marginBottom: 32 },

  sliderContainer: {
    marginBottom: 8,
    position: 'relative',
    ...Platform.select({ android: { paddingVertical: 4 } }),
  },
  customSliderTrackBackground: {
    position: 'absolute',
    top: 20,
    left: 0,
    right: 0,
    height: 16,
    backgroundColor: '#DFE6E9',
    borderRadius: 8,
    zIndex: 1,
    ...Platform.select({ android: { borderWidth: 1, borderColor: '#CBD5E0', elevation: 2 } }),
  },
  customSliderTrackFilled: {
    position: 'absolute',
    top: 20,
    left: 0,
    height: 16,
    backgroundColor: '#29B6F6',
    borderRadius: 8,
    zIndex: 2,
    ...Platform.select({
      ios: { shadowColor: '#29B6F6', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.4, shadowRadius: 4 },
      android: { elevation: 4, borderWidth: 1, borderColor: '#1E88A8' },
    }),
  },
  slider: { width: '100%', height: 56, position: 'relative', zIndex: 3, transform: [{ scale: 1.4 }] },
  sliderLabels: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 32, paddingHorizontal: 4, marginTop: 8 },
  sliderLabel: { fontSize: 12, color: '#636E72', fontWeight: '500' },

  relaxationCompleteButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#2196F3', borderRadius: 30, paddingVertical: 16, gap: 8 },
  relaxationCompleteButtonText: { fontSize: 16, fontWeight: '600', color: '#fff' },

  completionPageContainer: { flex: 1, backgroundColor: '#F5F8FA', paddingHorizontal: 24, paddingTop: 40 },
  completionHeader: { fontSize: 16, color: '#666', textAlign: 'center', marginBottom: 40 },
  completionTime: { fontSize: 72, fontWeight: '700', color: '#1E5F8A', textAlign: 'center' },
  completionTimeLabel: { fontSize: 14, color: '#666', textAlign: 'center', marginBottom: 60 },

  completionRelaxContainer: { alignItems: 'center', marginBottom: 40 },
  completionRelaxLabel: { fontSize: 14, color: '#666', marginBottom: 8 },
  completionRelaxScore: { flexDirection: 'row', alignItems: 'baseline' },
  completionRelaxNumber: { fontSize: 36, fontWeight: '700', color: '#2196F3' },
  completionRelaxMax: { fontSize: 18, color: '#999', marginLeft: 2 },

  feelingsTitle: { fontSize: 18, fontWeight: '700', color: '#333', marginBottom: 16 },
  feelingsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 24 },
  feelingChip: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, borderWidth: 1, borderColor: '#DDD', backgroundColor: '#fff' },
  feelingChipActive: { borderColor: '#2196F3', backgroundColor: '#E3F2FD' },
  feelingChipText: { fontSize: 14, color: '#666' },
  feelingChipTextActive: { color: '#2196F3' },

  customInput: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    color: '#333',
    marginBottom: 24,
    height: 50,
    maxHeight: 80,
  },

  completionButton: { backgroundColor: '#2196F3', borderRadius: 30, paddingVertical: 16, alignItems: 'center', marginTop: 'auto', marginBottom: 40 },
  completionButtonText: { fontSize: 16, fontWeight: '600', color: '#fff' },

  completionScrollContent: { flexGrow: 1, paddingHorizontal: 24, paddingTop: 40, paddingBottom: 100 },
  completionButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
    backgroundColor: '#F5F8FA',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },

  successPageContainer: { flex: 1 },
  gradientBg: { flex: 1 },
  successContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: Platform.OS === 'ios' ? 60 : 40,
  },
  successIconContainer: { position: 'relative', width: 128, height: 128, marginBottom: 32 },
  successIconGradient: {
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
  },
  successTitle: { fontSize: 24, fontWeight: '700', color: '#1f2937', marginBottom: 8 },
  successSubtitle: { fontSize: 16, color: '#6b7280', marginBottom: 28, textAlign: 'center' },

  statsCard: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statsRow: { flexDirection: 'row', alignItems: 'center' },
  statItem: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: 28, fontWeight: '700', color: '#2196F3', marginBottom: 4 },
  statLabel: { fontSize: 12, color: '#666' },
  statDivider: { width: 1, height: 40, backgroundColor: '#E0E0E0' },

  viewJournalButton: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(14, 165, 233, 0.2)',
  },
  viewJournalText: { fontSize: 15, fontWeight: '700', color: '#0ea5e9' },
});
