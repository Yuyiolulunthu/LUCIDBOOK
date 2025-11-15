import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  Image,
  Animated,
  TextInput,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';
import Slider from '@react-native-community/slider';
import { Audio } from 'expo-av';
import { LinearGradient } from 'expo-linear-gradient';
import MaskedView from '@react-native-masked-view/masked-view';
import StarsIcon from './components/StarsIcon';
import ClockIcon from './components/ClockIcon';
import AnxietyIcon from './components/AnxietyIcon';
import TiredIcon from './components/TiredIcon';
import RelaxedIcon from './components/RelaxedIcon';
import AngryIcon from './components/AngryIcon';
import DepressedIcon from './components/DepressedIcon';
import SatisfiedIcon from './components/SatisfiedIcon';
import StartPlayerIcon from './components/StartPlayerIcon';
import BreathingAnimateIcon from './components/BreathingAnimateIcon';

export default function BreathingExerciseCard({ onBack, navigation, route }) {
  // 頁面狀態：'selection' (第一頁) 或 'emotion' (第二頁) 或 'preparation' (第三頁) 或 'practice' (第四頁) 或 'completion' (第五頁)
  const [currentPage, setCurrentPage] = useState('selection');
  
  // 第一頁狀態
  const [selectedTags, setSelectedTags] = useState([]);
  const [selectedExercise, setSelectedExercise] = useState(null);
  
  // 第二頁狀態
  const [selectedState, setSelectedState] = useState(null);
  
  // 第四頁狀態
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [totalDuration, setTotalDuration] = useState(300); // 預設5分鐘
  const [breathPhase, setBreathPhase] = useState('inhale'); // inhale, hold, exhale
  const [phaseTimeLeft, setPhaseTimeLeft] = useState(4);
  const [guideText, setGuideText] = useState('跟著節奏，慢慢吸氣');
  const [cycleCount, setCycleCount] = useState(0);
  const [isMuted, setIsMuted] = useState(false); // 靜音狀態
  const [breathCycleIndex, setBreathCycleIndex] = useState(0); // 呼吸循環索引（用於文案切換）
  const [pausedAtCycle, setPausedAtCycle] = useState(0); // 記錄暫停時的循環位置
  
  // 第六頁狀態
  const [relaxLevel, setRelaxLevel] = useState(5); // 放鬆程度 0-10，預設5（中間值）
  const [selectedMoods, setSelectedMoods] = useState([]); // 選中的心情tags
  const [feelingNote, setFeelingNote] = useState(''); // 記錄文字
  const [isOtherMoodSelected, setIsOtherMoodSelected] = useState(false); // ⭐ 「其他」按鈕是否選中
  
  // 第七頁狀態
  const [completionData, setCompletionData] = useState(null); // 完成數據（練習天數等）
  
  const sound = useRef(null);
  const borderAnimation = useRef(new Animated.Value(108.5)).current; // 初始光圈半徑 108.5
  const scrollViewRef = useRef(null);
  const timerRef = useRef(null);
  const audioUpdateRef = useRef(null);
  const currentAnimationRef = useRef(null); // 記錄當前動畫
  
  // 動畫目標值常量（調整這些值來改變動畫速度感）
  const ANIMATION_VALUES = {
    MAX: 108.5,      // 最大光圈（吐氣結束）
    MEDIUM: 54,      // 中等光圈（4-6呼吸吸氣結束）- 保持原值
    MIN: 50,         // 最小光圈（屏息呼吸吸氣結束）- 從0改為30，讓動畫看起來更慢
  };
  
  // 獲取從上一頁傳來的參數（如果有）
  const previousScreen = route?.params?.from;

  // 練習數據
  const exercises = [
    {
      id: 1,
      title: '4-6呼吸練習',
      duration: '5 分鐘',
      description: '適合放鬆、減壓',
      tags: ['減壓', '助眠', '平靜'],
      gradientColors: ['#166CB5', '#31C6FE'],
      type: '4-6-breathing',
    },
    {
      id: 2,
      title: '屏息呼吸練習',
      duration: '5 分鐘',
      description: '適合提升專注與穩定',
      tags: ['專注', '穩態', '覺察'],
      gradientColors: ['#166CB5', '#31C6FE'],
      type: 'breath-holding',
    },
  ];

  // 情緒狀態數據
  const emotionalStates = [
    {
      id: 1,
      name: '焦慮緊張',
      icon: AnxietyIcon,
      color: '#FF9A8B',
      bgColor: 'rgba(255, 244, 242, 0.84)',
    },
    {
      id: 2,
      name: '疲憊困倦',
      icon: TiredIcon,
      color: '#A8C5DD',
      bgColor: 'rgba(246, 251, 255, 0.84)',
    },
    {
      id: 3,
      name: '平靜放鬆',
      icon: RelaxedIcon,
      color: '#7FC8A9',
      bgColor: 'rgba(246, 255, 251, 0.84)',
    },
    {
      id: 4,
      name: '憤怒不快',
      icon: AngryIcon,
      color: '#FF6B6B',
      bgColor: 'rgba(252, 244, 244, 0.84)',
    },
    {
      id: 5,
      name: '悲傷低落',
      icon: DepressedIcon,
      color: '#A0A0C0',
      bgColor: 'rgba(247, 247, 255, 0.84)',
    },
    {
      id: 6,
      name: '滿足愉悅',
      icon: SatisfiedIcon,
      color: '#FFD93D',
      bgColor: 'rgba(255, 253, 244, 0.84)',
    },
  ];

  // 第六頁：心情選項數據
  const moodOptions = [
    { id: 1, label: '平靜安定', color: '#31C6FF' },
    { id: 2, label: '情緒緩和了些', color: '#31C6FF' },
    { id: 3, label: '滿足愉悅', color: '#31C6FF' },
    { id: 4, label: '有趣新鮮', color: '#31C6FF' },
    { id: 5, label: '沒特別感受', color: '#31C6FF' },
    { id: 6, label: '其他', color: '#31C6FF', filled: true, isOther: true }, // ⭐ 標記為「其他」
  ];

  // 標籤選擇處理
  const toggleTag = (tag) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  // 處理第一頁的「跟著我呼吸」按鈕
  const handleStartExercise = (exercise) => {
    console.log('選擇練習:', exercise.title);
    setSelectedExercise(exercise);
    // 切換到第二頁
    setCurrentPage('emotion');
  };

  // 處理第二頁的情緒選擇（單選）
  const handleStateSelect = (stateId) => {
    setSelectedState(stateId);
  };

  // 處理第二頁的「準備好了」按鈕
  const handleReady = () => {
    if (!selectedState) {
      console.log('請選擇情緒狀態');
      return;
    }

    const state = emotionalStates.find(st => st.id === selectedState);
    
    console.log('開始練習:', selectedExercise.title);
    console.log('當前情緒:', state.name);
    
    // 切換到第三頁
    setCurrentPage('preparation');
  };

  // 重置第四頁所有狀態
  const resetPracticeState = () => {
    setIsPlaying(false);
    setCurrentTime(0);
    setBreathPhase('inhale');
    setPhaseTimeLeft(4);
    setGuideText('跟著節奏，慢慢吸氣');
    setCycleCount(0);
    setIsMuted(false); // 重置靜音狀態
    setBreathCycleIndex(0); // 重置呼吸循環索引
    borderAnimation.setValue(108.5); // 重置光圈到最大
    
    // 清除所有計時器
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (audioUpdateRef.current) {
      clearInterval(audioUpdateRef.current);
      audioUpdateRef.current = null;
    }
    
    // 清除動畫引用
    if (currentAnimationRef.current) {
      currentAnimationRef.current.stop();
      currentAnimationRef.current = null;
    }
  };

  // 第四頁：處理「進入下一階段」按鈕（從第三頁進入第四頁）
  const handleStartPractice = async () => {
    // 先重置所有狀態
    resetPracticeState();
    
    // 載入音頻但不播放
    try {
      const audioFile = selectedExercise.type === '4-6-breathing'
        ? require('../../../assets/audio/4-6呼吸音檔.mp3')
        : require('../../../assets/audio/屏息呼吸音檔.mp3');
      
      const { sound: audioSound } = await Audio.Sound.createAsync(audioFile);
      sound.current = audioSound;
      
      // 獲取音頻時長
      const status = await audioSound.getStatusAsync();
      if (status.isLoaded) {
        setTotalDuration(Math.floor(status.durationMillis / 1000));
      }
    } catch (error) {
      console.error('載入音頻錯誤:', error);
    }
    
    // 切換到第四頁
    setCurrentPage('practice');
  };

  // 停止練習
  const stopPractice = async () => {
    setIsPlaying(false);
    
    // 清除計時器
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (audioUpdateRef.current) {
      clearInterval(audioUpdateRef.current);
      audioUpdateRef.current = null;
    }
    
    // 停止並釋放音頻
    if (sound.current) {
      try {
        const status = await sound.current.getStatusAsync();
        if (status.isLoaded) {
          await sound.current.stopAsync();
          await sound.current.unloadAsync();
        }
      } catch (error) {
        console.error('停止音頻錯誤:', error);
      }
      sound.current = null;
    }
  };

  // 暫停/繼續
  const togglePlayPause = async () => {
    if (!sound.current) return;
    
    if (isPlaying) {
      // 暫停
      await sound.current.pauseAsync();
      setIsPlaying(false);
      
      // 立即停止動畫
      if (currentAnimationRef.current) {
        currentAnimationRef.current.stop();
        currentAnimationRef.current = null;
      }
      borderAnimation.stopAnimation();
      
      // 記錄暫停時的循環位置
      setPausedAtCycle(cycleCount);
      
      // 清除計時器
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      if (audioUpdateRef.current) {
        clearInterval(audioUpdateRef.current);
        audioUpdateRef.current = null;
      }
    } else {
      // 播放
      await sound.current.playAsync();
      setIsPlaying(true);
      
      // 恢復時立即重新開始當前階段的動畫
      restartCurrentPhaseAnimation();
      
      // 啟動計時器
      startTimers();
    }
  };

  // 恢復當前階段的動畫
  const restartCurrentPhaseAnimation = () => {
    const is46Breathing = selectedExercise.type === '4-6-breathing';
    const cycleDuration = is46Breathing ? 10 : 12;
    const currentCycle = cycleCount % cycleDuration;
    
    if (is46Breathing) {
      // 4-6呼吸
      if (currentCycle >= 0 && currentCycle <= 3) {
        // 吸氣階段：計算剩餘時間
        const remainingTime = (4 - currentCycle) * 1000;
        currentAnimationRef.current = Animated.timing(borderAnimation, {
          toValue: ANIMATION_VALUES.MEDIUM,
          duration: remainingTime,
          useNativeDriver: false,
        });
        currentAnimationRef.current.start();
      } else {
        // 吐氣階段：計算剩餘時間
        const remainingTime = (10 - currentCycle) * 1000;
        currentAnimationRef.current = Animated.timing(borderAnimation, {
          toValue: ANIMATION_VALUES.MAX,
          duration: remainingTime,
          useNativeDriver: false,
        });
        currentAnimationRef.current.start();
      }
    } else {
      // 屏息呼吸
      if (currentCycle >= 0 && currentCycle <= 3) {
        // 吸氣階段：計算剩餘時間
        const remainingTime = (4 - currentCycle) * 1000;
        currentAnimationRef.current = Animated.timing(borderAnimation, {
          toValue: ANIMATION_VALUES.MIN,
          duration: remainingTime,
          useNativeDriver: false,
        });
        currentAnimationRef.current.start();
      } else if (currentCycle >= 4 && currentCycle <= 7) {
        // 屏氣階段：保持在MIN，無動畫
      } else {
        // 吐氣階段：計算剩餘時間
        const remainingTime = (12 - currentCycle) * 1000;
        currentAnimationRef.current = Animated.timing(borderAnimation, {
          toValue: ANIMATION_VALUES.MAX,
          duration: remainingTime,
          useNativeDriver: false,
        });
        currentAnimationRef.current.start();
      }
    }
  };

  // 切換靜音
  const toggleMute = async () => {
    if (!sound.current) return;
    
    try {
      await sound.current.setVolumeAsync(isMuted ? 1.0 : 0.0);
      setIsMuted(!isMuted);
    } catch (error) {
      console.error('切換靜音錯誤:', error);
    }
  };

  // 啟動計時器
  const startTimers = () => {
    // **關鍵：先啟動動畫，再啟動計時器**
    // 這樣動畫就會在倒數顯示4的同時開始
    const is46Breathing = selectedExercise.type === '4-6-breathing';
    const cycleDuration = is46Breathing ? 10 : 12;
    const currentCycle = cycleCount % cycleDuration;
    
    // 根據當前所在階段，啟動對應的動畫
    if (currentCycle === 0) {
      // 在吸氣階段開始
      if (is46Breathing) {
        currentAnimationRef.current = Animated.timing(borderAnimation, {
          toValue: ANIMATION_VALUES.MEDIUM,
          duration: 4000, // 4秒
          useNativeDriver: false,
        });
      } else {
        currentAnimationRef.current = Animated.timing(borderAnimation, {
          toValue: ANIMATION_VALUES.MIN,
          duration: 4000, // 4秒
          useNativeDriver: false,
        });
      }
      currentAnimationRef.current.start();
    } else if (is46Breathing && currentCycle === 4) {
      // 4-6呼吸：在吐氣階段開始
      currentAnimationRef.current = Animated.timing(borderAnimation, {
        toValue: ANIMATION_VALUES.MAX,
        duration: 6000, // 6秒
        useNativeDriver: false,
      });
      currentAnimationRef.current.start();
    } else if (!is46Breathing && currentCycle === 8) {
      // 屏息呼吸：在吐氣階段開始
      currentAnimationRef.current = Animated.timing(borderAnimation, {
        toValue: ANIMATION_VALUES.MAX,
        duration: 4000, // 4秒
        useNativeDriver: false,
      });
      currentAnimationRef.current.start();
    } else {
      // 從中間恢復播放，使用剩餘時間
      restartCurrentPhaseAnimation();
    }
    
    // 呼吸循環計時器（每秒更新）
    timerRef.current = setInterval(() => {
      setCycleCount(prev => prev + 1);
    }, 1000);
    
    // 音頻進度更新計時器（每100毫秒更新一次）
    audioUpdateRef.current = setInterval(async () => {
      if (sound.current) {
        const status = await sound.current.getStatusAsync();
        if (status.isLoaded && status.isPlaying) {
          setCurrentTime(Math.floor(status.positionMillis / 1000));
          
          // 檢查是否播放完成
          if (status.didJustFinish) {
            setIsPlaying(false);
            if (timerRef.current) {
              clearInterval(timerRef.current);
              timerRef.current = null;
            }
            if (audioUpdateRef.current) {
              clearInterval(audioUpdateRef.current);
              audioUpdateRef.current = null;
            }
            
            // 音檔播放結束，自動進入下一階段
            handleFinishPractice();
          }
        }
      }
    }, 100);
  };

  // 處理練習結束（音檔播放完畢或用戶點擊進入下一階段）
  const handleFinishPractice = async () => {
    // 停止並清理音頻
    await stopPractice();
    
    // 跳轉到完成頁面（第五頁）
    setCurrentPage('completion');
  };

  // 處理返回按鈕
  const handleBack = () => {
    if (currentPage === 'success') {
      // 在第七頁，返回第六頁
      setCurrentPage('record');
    } else if (currentPage === 'record') {
      // 在第六頁，返回第五頁
      setCurrentPage('completion');
    } else if (currentPage === 'completion') {
      // 在第五頁，返回第四頁
      setCurrentPage('practice');
    } else if (currentPage === 'practice') {
      // 在第四頁，返回第三頁並停止音頻
      stopPractice();
      setCurrentPage('preparation');
    } else if (currentPage === 'preparation') {
      // 在第三頁，返回第二頁
      setCurrentPage('emotion');
    } else if (currentPage === 'emotion') {
      // 在第二頁，返回第一頁
      setCurrentPage('selection');
      setSelectedState(null);
    } else {
      // 在第一頁，返回上一頁
      if (onBack) {
        onBack();
      } else if (navigation) {
        if (previousScreen) {
          navigation.navigate(previousScreen);
        } else {
          navigation.goBack();
        }
      }
    }
  };

  // 處理 Home 按鈕
  const handleHome = () => {
    if (currentPage === 'practice') {
      stopPractice();
    }
    // 重置所有狀態
    setCurrentPage('selection');
    setSelectedExercise(null);
    setSelectedState(null);
    if (navigation) {
      navigation.navigate('Home');
    }
  };

  // 更新呼吸階段和引導文案
  useEffect(() => {
    if (currentPage !== 'practice' || !isPlaying) return;
    
    const is46Breathing = selectedExercise.type === '4-6-breathing';
    const cycleDuration = is46Breathing ? 10 : 12;
    const currentCycle = cycleCount % cycleDuration;
    
    if (is46Breathing) {
      // 4-6呼吸：吸4秒 + 吐6秒
      if (currentCycle >= 0 && currentCycle <= 3) {
        // 吸氣階段 (秒數0,1,2,3 顯示倒數4,3,2,1)
        setBreathPhase('inhale');
        setPhaseTimeLeft(4 - currentCycle);
        
        // 計算當前是第幾次吸氣（每10秒一循環）
        const breathIndex = Math.floor(cycleCount / 10);
        if (breathIndex % 2 === 0) {
          setGuideText('跟著節奏，慢慢吸氣');
        } else {
          setGuideText('手放腹部，感受腹部起伏(吸氣)');
        }
        
        // 吸氣動畫：只在 currentCycle === 0 時啟動
        if (currentCycle === 0) {
          currentAnimationRef.current = Animated.timing(borderAnimation, {
            toValue: ANIMATION_VALUES.MEDIUM,
            duration: 4000,
            useNativeDriver: false,
          });
          currentAnimationRef.current.start();
        }
        
      } else {
        // 吐氣階段 (秒數4,5,6,7,8,9 顯示倒數6,5,4,3,2,1)
        setBreathPhase('exhale');
        setPhaseTimeLeft(10 - currentCycle);
        
        const breathIndex = Math.floor(cycleCount / 10);
        if (breathIndex % 2 === 0) {
          setGuideText('很好，現在慢慢吐氣');
        } else {
          setGuideText('接著慢慢吐氣');
        }
        
        // 吐氣動畫：只在 currentCycle === 4 時啟動
        if (currentCycle === 4) {
          currentAnimationRef.current = Animated.timing(borderAnimation, {
            toValue: ANIMATION_VALUES.MAX,
            duration: 6000,
            useNativeDriver: false,
          });
          currentAnimationRef.current.start();
        }
      }
      
    } else {
      // 屏息呼吸：吸4秒 + 屏4秒 + 吐4秒
      
      if (currentCycle >= 0 && currentCycle <= 3) {
        // 吸氣階段 (秒數0,1,2,3 顯示倒數4,3,2,1)
        setBreathPhase('inhale');
        setPhaseTimeLeft(4 - currentCycle);
        
        const breathIndex = Math.floor(cycleCount / 12);
        if (breathIndex % 2 === 0) {
          setGuideText('跟著節奏，慢慢吸氣');
        } else {
          setGuideText('手放腹部，感受腹部起伏(吸氣)');
        }
        
        // 吸氣動畫：只在 currentCycle === 0 時啟動一次
        if (currentCycle === 0) {
          currentAnimationRef.current = Animated.timing(borderAnimation, {
            toValue: ANIMATION_VALUES.MIN,
            duration: 4000,
            useNativeDriver: false,
          });
          currentAnimationRef.current.start();
        }
        
      } else if (currentCycle >= 4 && currentCycle <= 7) {
        // 屏氣階段 (秒數4,5,6,7 顯示倒數4,3,2,1)
        setBreathPhase('hold');
        setPhaseTimeLeft(8 - currentCycle);
        setGuideText('屏氣~');
        // 屏氣：無動畫，光圈保持在MIN
        
      } else {
        // 吐氣階段 (秒數8,9,10,11 顯示倒數4,3,2,1)
        setBreathPhase('exhale');
        setPhaseTimeLeft(12 - currentCycle);
        
        const breathIndex = Math.floor(cycleCount / 12);
        if (breathIndex % 2 === 0) {
          setGuideText('很好，現在慢慢吐氣');
        } else {
          setGuideText('接著慢慢吐氣');
        }
        
        // 吐氣動畫：只在 currentCycle === 8 時啟動一次
        if (currentCycle === 8) {
          currentAnimationRef.current = Animated.timing(borderAnimation, {
            toValue: ANIMATION_VALUES.MAX,
            duration: 4000,
            useNativeDriver: false,
          });
          currentAnimationRef.current.start();
        }
      }
    }
  }, [cycleCount, currentPage, isPlaying, selectedExercise, borderAnimation]);

  // 清理音頻
  useEffect(() => {
    return () => {
      if (sound.current) {
        sound.current.unloadAsync();
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (audioUpdateRef.current) {
        clearInterval(audioUpdateRef.current);
      }
    };
  }, []);

  // 漸層文字組件
  const GradientText = ({ text, colors, style }) => (
    <MaskedView
      maskElement={
        <Text style={[styles.exerciseTitle, style]}>{text}</Text>
      }
    >
      <LinearGradient
        colors={colors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <Text style={[styles.exerciseTitle, style, { opacity: 0 }]}>{text}</Text>
      </LinearGradient>
    </MaskedView>
  );

  // 渲染第一頁（練習選擇頁）
  const renderSelectionPage = () => (
    <>
      {/* 主標題與副標題 */}
      <View style={styles.titleSection}>
        <Text style={styles.mainTitle}>你現在想要放鬆、專注，或是穩住自己呢？</Text>
      </View>

      {/* 練習卡片列表 */}
      <ScrollView 
        ref={scrollViewRef}
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {exercises.map((exercise) => (
          <View key={exercise.id} style={styles.exerciseCard}>
            {/* 標題 - 文字本身漸層 */}
            <View style={styles.titleContainer}>
              <GradientText 
                text={exercise.title}
                colors={exercise.gradientColors}
              />
            </View>
            
            <View style={styles.durationRow}>
              <ClockIcon width={16} height={16} color="#4A5565" />
              <Text style={styles.durationText}>{exercise.duration}</Text>
            </View>
            
            <Text style={styles.descriptionText}>{exercise.description}</Text>
            
            {/* 標籤顯示組（固定顯示，不可點擊）*/}
            <View style={styles.tagsContainer}>
              {exercise.tags.map((tag, tagIndex) => (
                <View
                  key={`${exercise.id}-tag-${tagIndex}`}
                  style={styles.tagButton}
                >
                  <Text style={styles.tagText}>
                    {tag}
                  </Text>
                </View>
              ))}
            </View>
            
            {/* 跟著我呼吸按鈕 */}
            <TouchableOpacity 
              style={styles.startButton}
              onPress={() => handleStartExercise(exercise)}
            >
              <StarsIcon width={18} height={18} color="#31C6FE" />
              <Text style={styles.startButtonText}>跟著我呼吸</Text>
              <Text style={styles.arrowText}>›</Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>

      {/* 底部 Home 按鈕 */}
      <View style={styles.bottomNav}>
        <TouchableOpacity 
          onPress={handleHome}
          style={styles.homeButtonContainer}
        >
          <View style={styles.homeButtonBackground}>
            <Image 
              source={require('../../../assets/images/Home_icon.png')}
              style={styles.bottomHomeIcon}
              resizeMode="contain"
            />
          </View>
        </TouchableOpacity>
      </View>
    </>
  );

  // 渲染第二頁（情緒選擇頁）
  const renderEmotionPage = () => (
    <>
      {/* 主標題與副標題 */}
      <View style={styles.titleSection}>
        <Text style={styles.mainTitle}>此刻的你，感覺如何呢？</Text>
        <Text style={styles.subTitle}>選擇最貼近你現在狀態的感受</Text>
      </View>

      {/* 情緒狀態選擇 */}
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.statesGrid}>
          {emotionalStates.map((state) => {
            const Icon = state.icon;
            const isSelected = selectedState === state.id;
            
            return (
              <TouchableOpacity
                key={state.id}
                style={[
                  styles.stateCard,
                  { 
                    backgroundColor: isSelected ? state.bgColor : '#FFFFFF',
                    borderColor: isSelected ? state.color : '#E5E7EB',
                  }
                ]}
                onPress={() => handleStateSelect(state.id)}
              >
                <View style={[
                  styles.iconContainer,
                  { backgroundColor: state.bgColor }
                ]}>
                  <Icon width={24} height={24} color={state.color} />
                </View>
                <Text style={styles.stateName}>{state.name}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {/* 底部按鈕區域 */}
      <View style={styles.bottomContainer}>
        {/* 準備好了按鈕 */}
        <TouchableOpacity 
          style={[
            styles.readyButton,
            !selectedState && styles.readyButtonDisabled
          ]}
          onPress={handleReady}
          disabled={!selectedState}
        >
          <Text style={[
            styles.readyButtonText,
            !selectedState && styles.readyButtonTextDisabled
          ]}>
            準備好了
          </Text>
          <Text style={[
            styles.readyArrowText,
            !selectedState && styles.readyButtonTextDisabled
          ]}>
            ›
          </Text>
        </TouchableOpacity>

        {/* Home 按鈕 */}
        <TouchableOpacity 
          onPress={handleHome}
          style={styles.homeButtonContainer}
        >
          <View style={styles.homeButtonBackground}>
            <Image 
              source={require('../../../assets/images/Home_icon.png')}
              style={styles.bottomHomeIcon}
              resizeMode="contain"
            />
          </View>
        </TouchableOpacity>
      </View>
    </>
  );

  // 渲染第三頁（準備頁面）
  const renderPreparationPage = () => (
    <>
      {/* 主標題與副標題 */}
      <View style={styles.preparationTitleSection}>
        <Text style={styles.preparationMainTitle}>請找一個舒服的姿勢</Text>
        <Text style={styles.preparationSubTitle}>可以是坐姿或躺姿</Text>
      </View>

      {/* 中間插圖 */}
      <View style={styles.illustrationContainer}>
        <Image 
          source={require('../../../assets/images/position_guide.png')}
          style={styles.illustrationImage}
          resizeMode="contain"
        />
      </View>

      {/* 底部提示文字 */}
      <View style={styles.hintTextContainer}>
        <Text style={styles.hintText}>練習可選擇靜音模式</Text>
        <Text style={styles.hintText}>跟隨畫面中指引練習</Text>
      </View>

      {/* 底部 Home 按鈕 */}
      <View style={styles.bottomNav}>
        <TouchableOpacity 
          onPress={handleHome}
          style={styles.homeButtonContainer}
        >
          <View style={styles.homeButtonBackground}>
            <Image 
              source={require('../../../assets/images/Home_icon.png')}
              style={styles.bottomHomeIcon}
              resizeMode="contain"
            />
          </View>
        </TouchableOpacity>
      </View>
    </>
  );

  // 渲染第四頁（練習進行頁面）
  const renderPracticePage = () => {
    const formatTime = (seconds) => {
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${mins}:${secs.toString().padStart(2, '0')}`;
    };
    
    const progress = totalDuration > 0 ? currentTime / totalDuration : 0;
    
    return (
      <>
        {/* 時間顯示 */}
        <View style={styles.practiceTimeContainer}>
          <Text style={styles.practiceTime}>{formatTime(totalDuration - currentTime)}</Text>
        </View>

        {/* 呼吸動畫 */}
        <View style={styles.breathingAnimationContainer}>
          <View style={styles.breathingCircleWrapper}>
            {/* 外層光圈 - 使用 Animated.View 來控制 border */}
            <Animated.View
              style={[
                styles.breathingCircleOuter,
                {
                  width: borderAnimation.interpolate({
                    inputRange: [0, 108.5],
                    outputRange: [0, 217],
                  }),
                  height: borderAnimation.interpolate({
                    inputRange: [0, 108.5],
                    outputRange: [0, 217],
                  }),
                  borderRadius: borderAnimation,
                  borderWidth: borderAnimation.interpolate({
                    inputRange: [0, 54, 108.5],
                    outputRange: [0, 27, 54.5],
                  }),
                },
              ]}
            />
            {/* 中間的表情球 - 固定不動 */}
            <View style={styles.breathingIconContainer}>
              <BreathingAnimateIcon width={217} height={217} />
            </View>
          </View>
        </View>

        {/* 引導文案 */}
        <View style={styles.guideTextContainer}>
          <Text style={styles.guideText}>{guideText}</Text>
        </View>

        {/* 階段倒數 */}
        <View style={styles.phaseCountContainer}>
          <Text style={styles.phaseCount}>{phaseTimeLeft}</Text>
        </View>

        {/* 進度條 */}
        <View style={styles.progressContainer}>
          <Text style={styles.timeText}>{formatTime(currentTime)}</Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
          </View>
          <Text style={styles.timeText}>{formatTime(totalDuration)}</Text>
        </View>

        {/* 控制按鈕 */}
        <View style={styles.controlsContainer}>
          <TouchableOpacity onPress={togglePlayPause} style={styles.playPauseButton}>
            {isPlaying ? (
              <View style={styles.pauseIcon}>
                <View style={styles.pauseBar} />
                <View style={styles.pauseBar} />
              </View>
            ) : (
              <StartPlayerIcon width={19} height={22} />
            )}
          </TouchableOpacity>
          
          <TouchableOpacity onPress={toggleMute} style={styles.volumeButton}>
            <Image 
              source={require('../../../assets/images/Volume_null.png')}
              style={[
                styles.volumeIcon,
                isMuted && styles.volumeIconMuted
              ]}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </View>

        {/* 狀態文字 */}
        <View style={styles.statusTextContainer}>
          <Text style={styles.statusText}>{isPlaying ? '暫停' : '撥放'}</Text>
        </View>

        {/* 底部 Home 按鈕 */}
        <View style={styles.bottomNav}>
          <TouchableOpacity 
            onPress={handleHome}
            style={styles.homeButtonContainer}
          >
            <View style={styles.homeButtonBackground}>
              <Image 
                source={require('../../../assets/images/Home_icon.png')}
                style={styles.bottomHomeIcon}
                resizeMode="contain"
              />
            </View>
          </TouchableOpacity>
        </View>
      </>
    );
  };

  // 第五頁：完成頁面
  const renderCompletionPage = () => (
    <View style={styles.completionContainer}>
      {/* 主要內容區域 */}
      <View style={styles.completionContent}>
        {/* 標題與圖標 */}
        <View style={styles.completionHeader}>
          <Text style={styles.completionTitle}>你做得很好</Text>
          <Text style={styles.completionEmoji}>🌱</Text>
        </View>

        {/* 副標題 */}
        <Text style={styles.completionSubtitle}>
          為自己的堅持感到驕傲吧{'\n'}穩定力和專注力又提升了！
        </Text>

        {/* 記錄此刻的感受按鈕 */}
        <TouchableOpacity 
          style={styles.recordButton}
          onPress={() => {
            // TODO: 導航到第六頁（記錄感受頁面）
            setCurrentPage('record');
            console.log('進入記錄感受頁面');
          }}
        >
          <Text style={styles.recordButtonText}>記錄此刻的感受</Text>
        </TouchableOpacity>

        {/* 靜靜結束練習按鈕 */}
        <TouchableOpacity 
          style={styles.quietButton}
          onPress={handleHome}
        >
          <Text style={styles.quietButtonText}>靜靜結束練習</Text>
        </TouchableOpacity>

        {/* 給自己一點時間，慢慢感受 */}
        <Text style={styles.completionFooter}>
          給自己一點時間，慢慢感受
        </Text>
      </View>

      {/* 底部 Home 按鈕 */}
      <View style={styles.bottomNav}>
        <TouchableOpacity 
          onPress={handleHome}
          style={styles.homeButtonContainer}
        >
          <View style={styles.homeButtonBackground}>
            <Image 
              source={require('../../../assets/images/Home_icon.png')}
              style={styles.bottomHomeIcon}
              resizeMode="contain"
            />
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );

  // 心情選擇處理函數
  const toggleMood = (moodId) => {
    // ⭐ 檢查是否點擊了「其他」
    const selectedMood = moodOptions.find(m => m.id === moodId);
    
    if (selectedMood?.isOther) {
      // 點擊「其他」按鈕，切換選中狀態
      setIsOtherMoodSelected(!isOtherMoodSelected);
      
      if (!isOtherMoodSelected) {
        // 選中「其他」，添加到已選列表
        setSelectedMoods([...selectedMoods, moodId]);
      } else {
        // 取消選中「其他」，從列表移除
        setSelectedMoods(selectedMoods.filter(id => id !== moodId));
        setFeelingNote(''); // 清空輸入
      }
    } else {
      // 普通心情選項
      if (selectedMoods.includes(moodId)) {
        setSelectedMoods(selectedMoods.filter(id => id !== moodId));
      } else {
        setSelectedMoods([...selectedMoods, moodId]);
      }
    }
  };

  // 第六頁：感受覺察/記錄頁面
  const renderRecordPage = () => (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.recordContainer}>
        <ScrollView 
          contentContainerStyle={styles.recordScrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          nestedScrollEnabled={true}
          scrollEnabled={true}
          bounces={true}
        >
          {/* 標題 */}
          <Text style={styles.recordMainTitle}>感受覺察</Text>
          <Text style={styles.recordSubtitle}>花1分鐘看現在的心情</Text>

          {/* 放鬆程度區塊 */}
          <View style={styles.relaxSection}>
            <Text style={styles.relaxTitle}>放鬆程度</Text>
            
            {/* Slider 容器 */}
            <View style={styles.sliderContainer}>
              <Slider
                style={styles.slider}
                minimumValue={0}
                maximumValue={10}
                step={0.1}
                value={relaxLevel}
                onValueChange={setRelaxLevel}
                minimumTrackTintColor="#31C6FF"
                maximumTrackTintColor="rgba(255, 255, 255, 0.40)"
                thumbTintColor="#FFFFFF"
              />
            </View>

            {/* 刻度標籤 */}
            <View style={styles.sliderLabels}>
              <Text style={styles.sliderLabelText}>0 仍緊繃</Text>
              <Text style={styles.sliderLabelText}>10 非常放鬆</Text>
            </View>
          </View>

          {/* 心情選擇區塊 */}
          <Text style={styles.moodPrompt}>練習完後，現在的心情是</Text>
          
          <View style={styles.moodTagsContainer}>
            {moodOptions.map((mood) => {
              const isSelected = selectedMoods.includes(mood.id);
              const isOther = mood.isOther;
              
              return (
                <TouchableOpacity
                  key={mood.id}
                  style={[
                    styles.moodTag,
                    // ⭐ 「其他」未選中時不填充背景
                    isOther && !isSelected && styles.moodTagOutline,
                    // ⭐ 「其他」選中時才填充背景
                    isOther && isSelected && styles.moodTagFilled,
                    // ⭐ 其他選項選中樣式（保持原樣）
                    !isOther && isSelected && styles.moodTagSelected,
                  ]}
                  onPress={() => toggleMood(mood.id)}
                >
                  <Text 
                    style={[
                      styles.moodTagText,
                      // ⭐ 「其他」選中後文字為白色
                      isOther && isSelected && styles.moodTagTextFilled,
                      // ⭐ 其他選項選中文字樣式
                      !isOther && isSelected && styles.moodTagTextSelected,
                    ]}
                  >
                    {mood.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* ⭐ 記錄區塊 - 只在選中「其他」時顯示 */}
          {isOtherMoodSelected && (
            <>
              <Text style={styles.recordPrompt}>記錄下來</Text>
              
              <TextInput
                style={styles.recordInput}
                multiline
                placeholder="在這裡寫下你的感受..."
                value={feelingNote}
                onChangeText={setFeelingNote}
                textAlignVertical="top"
              />
            </>
          )}

          {/* 記錄此刻的感受按鈕 */}
          <View style={styles.recordSubmitButtonContainer}>
            <TouchableOpacity 
              style={styles.recordSubmitButton}
              onPress={() => {
                // 保存記錄數據
                const practiceData = {
                  exerciseType: selectedExercise?.title || '呼吸練習',
                  duration: totalDuration,
                  preMood: selectedState?.name || '未記錄',
                  postMood: selectedMoods.length > 0 ? moodOptions.find(m => m.id === selectedMoods[0])?.label : '未記錄',
                  relaxLevel: relaxLevel,
                  journalEntry: feelingNote,
                  completedAt: new Date().toISOString(),
                };
                
                console.log('記錄感受:', practiceData);
                
                // TODO: 調用 API 保存數據
                
                // 導航到第七頁
                setCompletionData({
                  consecutiveDays: 3, // TODO: 從後端獲取
                  ...practiceData,
                });
                setCurrentPage('success');
              }}
            >
              <Text style={styles.recordSubmitButtonText}>記錄此刻的感受</Text>
              {/* 漸層疊加層 */}
              <LinearGradient
                colors={['rgba(0, 0, 0, 0.00)', 'rgba(49, 198, 254, 0.20)', 'rgba(0, 0, 0, 0.00)']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.recordSubmitButtonGradient}
                pointerEvents="none"
              />
            </TouchableOpacity>
          </View>

          {/* 底部間距，確保按鈕上方有足夠空間 */}
          <View style={{ height: 150 }} />
        </ScrollView>

        {/* 底部 Home 按鈕 */}
        <View style={styles.bottomNav}>
          <TouchableOpacity 
            onPress={handleHome}
            style={styles.homeButtonContainer}
          >
            <View style={styles.homeButtonBackground}>
              <Image 
                source={require('../../../assets/images/Home_icon.png')}
                style={styles.bottomHomeIcon}
                resizeMode="contain"
              />
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );

  // 第七頁：成功完成頁面
  const renderSuccessPage = () => (
    <View style={styles.successContainer}>
      <ScrollView 
        contentContainerStyle={styles.successScrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 主標題 */}
        <Text style={styles.successMainTitle}>太棒了！</Text>
        <Text style={styles.successSubtitle}>
          你完成了今天的呼吸練習，{'\n'}繼續保持這個美好的習慣吧！
        </Text>

        {/* 連續天數卡片 */}
        <View style={styles.streakCard}>
          <Image 
            source={require('../../../assets/images/champion.png')}
            style={styles.streakIcon}
            resizeMode="contain"
          />
          <Text style={styles.streakLabel}>你已經連續完成練習</Text>
          <Text style={styles.streakDays}>{completionData?.consecutiveDays || 0} 天</Text>
        </View>

        {/* 查看日記按鈕 */}
        <TouchableOpacity 
          style={styles.viewDiaryButton}
          onPress={() => {
            console.log('導航到日記頁面');
            if (navigation) {
              navigation.navigate('Daily');
            } else {
              handleHome();
            }
          }}
        >
          <Text style={styles.viewDiaryButtonText}>查看日記</Text>
          {/* 漸層疊加層 */}
          <LinearGradient
            colors={['rgba(0, 0, 0, 0.00)', 'rgba(49, 198, 254, 0.20)', 'rgba(0, 0, 0, 0.00)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.viewDiaryButtonGradient}
            pointerEvents="none"
          />
        </TouchableOpacity>

        {/* 底部間距 */}
        <View style={{ height: 150 }} />
      </ScrollView>

      {/* 底部 Home 按鈕 */}
      <View style={styles.bottomNav}>
        <TouchableOpacity 
          onPress={handleHome}
          style={styles.homeButtonContainer}
        >
          <View style={styles.homeButtonBackground}>
            <Image 
              source={require('../../../assets/images/Home_icon.png')}
              style={styles.bottomHomeIcon}
              resizeMode="contain"
            />
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#E9EFF6" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Image 
            source={require('../../../assets/images/Left_arrow.png')}
            style={styles.backArrowIcon}
            resizeMode="contain"
          />
        </TouchableOpacity>
        {currentPage === 'preparation' || currentPage === 'practice' ? (
            <>
            <Text style={styles.headerTitleCentered}>
                {selectedExercise?.title}
            </Text>
            <TouchableOpacity 
              onPress={currentPage === 'preparation' ? handleStartPractice : handleFinishPractice} 
              style={styles.nextButton}
            >
                <Text style={styles.nextButtonText}>進入{'\n'}下一階段</Text>
            </TouchableOpacity>
            </>
        ) : (
            <>
            <Text style={styles.headerTitle}>呼吸練習</Text>
            <View style={styles.headerRight} />
            </>
        )}
      </View>

      {/* 根據當前頁面狀態渲染不同內容 */}
      {currentPage === 'selection' 
        ? renderSelectionPage() 
        : currentPage === 'emotion' 
        ? renderEmotionPage() 
        : currentPage === 'preparation'
        ? renderPreparationPage()
        : currentPage === 'practice'
        ? renderPracticePage()
        : currentPage === 'completion'
        ? renderCompletionPage()
        : currentPage === 'record'
        ? renderRecordPage()
        : renderSuccessPage()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E9EFF6',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 12,
    backgroundColor: '#E9EFF6',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backArrowIcon: {
    width: 18,
    height: 24,
    tintColor: '#31C6FE',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#606060',
    flex: 1,
    textAlign: 'center',
    justifyContent: 'center',
  },
  headerTitleCentered: {
    fontSize: 24,
    fontWeight: '600',
    color: '#606060',
    position: 'absolute',
    left: 0,
    right: 0,
    textAlign: 'center',
    pointerEvents: 'none'
    },
  headerRight: {
    width: 40,
  },
  titleSection: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    alignItems: 'center',
  },
  mainTitle: {
    fontSize: 14,
    color: '#4A5565',
    textAlign: 'center',
    lineHeight: 22,
    fontWeight: '400',
  },
  subTitle: {
    fontSize: 14,
    color: '#4A5565',
    textAlign: 'center',
    fontWeight: '400',
    marginTop: 4,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 100,
  },
  
  // 第一頁樣式
  exerciseCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 12,
  },
  exerciseTitle: {
    fontSize: 18,
    fontWeight: '400',
    textAlign: 'center',
  },
  durationRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  durationText: {
    fontSize: 14,
    color: '#4A5565',
    fontWeight: '400',
    marginLeft: 6,
  },
  descriptionText: {
    fontSize: 14,
    color: '#4A5565',
    textAlign: 'center',
    marginBottom: 16,
    fontWeight: '400',
  },
  tagsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 20,
    flexWrap: 'wrap',
  },
  tagButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 100,
    backgroundColor: '#31C6FE',
  },
  tagButtonSelected: {
    backgroundColor: '#31C6FE',
  },
  tagText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.60)',
    fontWeight: '400',
  },
  tagTextSelected: {
    color: '#FFFFFF',
    fontWeight: '400',
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.60)',
    borderRadius: 100,
    borderWidth: 1,
    borderColor: '#31C6FE',
    paddingVertical: 12,
    paddingHorizontal: 27,
    gap: 8,
    height: 46,
    alignSelf: 'center',
    maxWidth: 280,
    position: 'relative',
  },
  startButtonText: {
    fontSize: 18,
    color: '#31C6FE',
    fontWeight: '400',
    marginRight: 15,
  },
  arrowText: {
    fontSize: 22,
    color: '#31C6FE',
    fontWeight: '300',
    position: 'absolute',
    right: 24,
  },
  
  // 第二頁樣式
  statesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 16,
    marginBottom: 32,
  },
  stateCard: {
    width: '47%',
    aspectRatio: 1.4,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    padding: 17,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  stateName: {
    fontSize: 14,
    color: '#4A5565',
    fontWeight: '400',
    textAlign: 'center',
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
    paddingBottom: 50,
    backgroundColor: 'transparent',
  },
  readyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.60)',
    borderRadius: 100,
    borderWidth: 1,
    borderColor: '#31C6FE',
    paddingVertical: 12,
    paddingHorizontal: 32,
    gap: 8,
    height: 46,
    width: '95%',
    alignSelf: 'center',
    marginBottom: 16,
  },
  readyButtonDisabled: {
    borderColor: '#A0A0C0',
    opacity: 0.5,
  },
  readyButtonText: {
    fontSize: 18,
    color: '#31C6FE',
    fontWeight: '400',
  },
  readyButtonTextDisabled: {
    color: '#A0A0C0',
  },
  readyArrowText: {
    fontSize: 22,
    color: '#31C6FE',
    fontWeight: '300',
    position: 'absolute',
    right: 20,
  },
  
  // 共用底部樣式
  bottomNav: {
    position: 'absolute',
    bottom: 50,
    left: 0,
    right: 0,
    height: 80,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 20,
  },
  homeButtonContainer: {
    width: 56,
    height: 56,
    alignSelf: 'center',
  },
  homeButtonBackground: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  bottomHomeIcon: {
    width: 32,
    height: 32,
    tintColor: '#31C6FE',
  },
  
  // 第三頁樣式
  nextButton: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  nextButtonText: {
    fontSize: 10,
    color: '#000000',
    fontWeight: '400',
    textAlign: 'center',
    lineHeight: 14,
  },
  preparationTitleSection: {
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 32,
    alignItems: 'center',
  },
  preparationMainTitle: {
    fontSize: 18,
    color: '#4A5565',
    textAlign: 'center',
    fontWeight: '400',
    marginBottom: 8,
  },
  preparationSubTitle: {
    fontSize: 18,
    color: '#4A5565',
    textAlign: 'center',
    fontWeight: '400',
  },
  illustrationContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  illustrationImage: {
    width: '100%',
    height: 261,
    aspectRatio: 16 / 9,
  },
  hintTextContainer: {
    paddingHorizontal: 24,
    paddingVertical: 18,
    alignItems: 'center',
    gap: 13,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    marginHorizontal: 72,
    marginBottom: 160,
  },
  hintText: {
    fontSize: 18,
    color: '#31C6FE',
    textAlign: 'center',
    fontWeight: '400',
  },
  
  // 第四頁樣式
  practiceTimeContainer: {
    paddingTop: 20,
    alignItems: 'center',
  },
  practiceTime: {
    fontSize: 36,
    color: '#31C6FE',
    fontWeight: '400',
  },
  breathingAnimationContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  breathingCircleWrapper: {
    width: 217,
    height: 217,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  breathingCircleOuter: {
    position: 'absolute',
    borderColor: 'rgba(49, 198, 254, 0.4)',
    backgroundColor: 'transparent',
  },
  breathingIconContainer: {
    width: 217,
    height: 217,
    justifyContent: 'center',
    alignItems: 'center',
  },
  guideTextContainer: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    alignItems: 'center',
  },
  guideText: {
    fontSize: 16,
    color: '#606060',
    textAlign: 'center',
    fontWeight: '400',
    marginTop: -8,
  },
  phaseCountContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  phaseCount: {
    fontSize: 36,
    color: '#31C6FE',
    fontWeight: '400',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 28,
    gap: 10,
  },
  timeText: {
    fontSize: 12,
    color: '#2B2B2B',
    fontWeight: '400',
  },
  progressBar: {
    flex: 1,
    height: 4,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#31C6FE',
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
    marginBottom: 28,
  },
  playPauseButton: {
    width: 67,
    height: 67,
    borderRadius: 100,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  pauseIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  pauseBar: {
    width: 5,
    height: 27,
    backgroundColor: '#31C6FE',
    borderRadius: 100,
  },
  volumeButton: {
    width: 46,
    height: 46,
    borderRadius: 100,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  volumeIcon: {
    width: 24,
    height: 24,
  },
  volumeIconMuted: {
    opacity: 0.4,
  },
  statusTextContainer: {
    alignItems: 'center',
    marginBottom: 80,
  },
  statusText: {
    fontSize: 10,
    color: '#000000',
    fontWeight: '400',
  },
  // 第五頁：完成頁面樣式
  completionContainer: {
    flex: 1,
    backgroundColor: '#E8EEF6',
  },
  completionContent: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
    alignItems: 'center',
  },
  completionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  completionTitle: {
    fontSize: 32,
    fontWeight: '400',
    color: '#2B2B2B',
    fontFamily: 'Inter',
    marginRight: 8,
  },
  completionEmoji: {
    fontSize: 34,
  },
  completionSubtitle: {
    fontSize: 17,
    fontWeight: '400',
    color: '#2B2B2B',
    textAlign: 'center',
    lineHeight: 29.25,
    marginBottom: 60,
    fontFamily: 'Inter',
  },
  recordButton: {
    width: 340,
    height: 74,
    backgroundColor: 'rgba(255, 255, 255, 0.60)',
    borderRadius: 100,
    borderWidth: 0.644,
    borderColor: 'rgba(255, 255, 255, 0.40)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  recordButtonText: {
    fontSize: 18,
    fontWeight: '400',
    color: '#166CB5',
    fontFamily: 'Inter',
  },
  quietButton: {
    width: 340,
    height: 65,
    backgroundColor: 'rgba(255, 255, 255, 0.20)',
    borderRadius: 100,
    borderWidth: 0.644,
    borderColor: 'rgba(255, 255, 255, 0.40)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  quietButtonText: {
    fontSize: 16,
    fontWeight: '400',
    color: '#808080',
    fontFamily: 'Inter',
  },
  completionFooter: {
    fontSize: 14,
    fontWeight: '400',
    color: '#2B2B2B',
    textAlign: 'center',
    fontFamily: 'Inter',
  },
  // 第六頁：感受覺察/記錄頁面樣式
  recordContainer: {
    flex: 1,
    backgroundColor: '#E8EEF6',
  },
  recordScrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 150,
  },
  recordMainTitle: {
    fontSize: 33,
    fontWeight: '400',
    color: '#2B2B2B',
    textAlign: 'center',
    fontFamily: 'Inter',
    marginBottom: 8,
  },
  recordSubtitle: {
    fontSize: 17,
    fontWeight: '400',
    color: '#2B2B2B',
    textAlign: 'center',
    lineHeight: 29.25,
    fontFamily: 'Inter',
    marginBottom: 32,
  },
  relaxSection: {
    width: 361,
    height: 128,
    backgroundColor: 'rgba(255, 255, 255, 0.60)',
    borderRadius: 24,
    padding: 24,
    marginBottom: 24,
    alignSelf: 'center',
  },
  relaxTitle: {
    fontSize: 18,
    fontWeight: '400',
    color: '#0A0A0A',
    fontFamily: 'Inter',
    marginBottom: 16,
  },
  sliderContainer: {
    height: 8,
    marginBottom: 8,
  },
  slider: {
    width: '100%',
    height: 8,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sliderLabelText: {
    fontSize: 12,
    fontWeight: '400',
    color: '#4A5565',
    fontFamily: 'Inter',
  },
  moodPrompt: {
    fontSize: 14,
    fontWeight: '400',
    color: '#4A5565',
    fontFamily: 'Inter',
    marginBottom: 16,
    width: 265,
  },
  moodTagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 24,
  },
  moodTag: {
    height: 48,
    paddingHorizontal: 14,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: '#31C6FF',
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  moodTagFilled: {
    backgroundColor: '#31C6FF',
  },
  moodTagSelected: {
    backgroundColor: 'rgba(49, 198, 255, 0.70)',
  },
  moodTagFilledSelected: {
    backgroundColor: 'rgba(49, 198, 255, 0.70)',
  },
  moodTagText: {
    fontSize: 14,
    fontWeight: '400',
    color: '#31C6FF',
    fontFamily: 'Inter',
  },
  moodTagTextFilled: {
    color: '#FFFFFF',
  },
  moodTagTextSelected: {
    color: '#FFFFFF',
  },
  // ⭐ 「其他」未選中時的輪廓樣式（和其他心情按鈕一致）
  moodTagOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#31C6FF',
  },
  recordPrompt: {
    fontSize: 14,
    fontWeight: '400',
    color: '#31C6FF',
    fontFamily: 'Inter',
    marginBottom: 12,
    width: 265,
  },
  recordInput: {
    width: '100%',
    height: 161,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1.464,
    borderColor: 'rgba(0, 0, 0, 0.00)',
    padding: 16,
    fontSize: 14,
    fontFamily: 'Inter',
    marginBottom: 32,
  },
  recordSubmitButtonContainer: {
    width: 340,
    alignSelf: 'center',
    marginBottom: 40,
  },
  recordSubmitButton: {
    width: '100%',
    height: 74,
    backgroundColor: '#FFFFFF',
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  recordSubmitButtonGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 100,
    opacity: 0.4702,
  },
  recordSubmitButtonText: {
    fontSize: 18,
    fontWeight: '400',
    color: '#166CB5',
    fontFamily: 'Inter',
    zIndex: 1,
  },
  // 第七頁：成功完成頁面樣式
  successContainer: {
    flex: 1,
    backgroundColor: '#E8EEF6',
  },
  successScrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 150,
    alignItems: 'center',
  },
  successMainTitle: {
    fontSize: 36,
    fontWeight: '400',
    color: '#2B2B2B',
    textAlign: 'center',
    fontFamily: 'Inter',
    marginBottom: 16,
  },
  successSubtitle: {
    fontSize: 18,
    fontWeight: '400',
    color: '#4A5565',
    textAlign: 'center',
    lineHeight: 29.25,
    fontFamily: 'Inter',
    marginBottom: 40,
  },
  streakCard: {
    width: '100%',
    maxWidth: 361,
    backgroundColor: 'rgba(255, 255, 255, 0.81)',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    marginBottom: 32,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  streakIcon: {
    width: 74,
    height: 74,
    marginBottom: 16,
  },
  streakLabel: {
    fontSize: 14,
    fontWeight: '400',
    color: '#4A5565',
    fontFamily: 'Inter',
    marginBottom: 8,
  },
  streakDays: {
    fontSize: 24,
    fontWeight: '400',
    color: '#31C6FF',
    fontFamily: 'Inter',
  },
  viewDiaryButton: {
    width: 340,
    height: 74,
    backgroundColor: '#FFFFFF',
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
    marginBottom: 40,
  },
  viewDiaryButtonGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 100,
    opacity: 0.4702,
  },
  viewDiaryButtonText: {
    fontSize: 18,
    fontWeight: '400',
    color: '#166CB5',
    fontFamily: 'Inter',
    zIndex: 1,
  },
});