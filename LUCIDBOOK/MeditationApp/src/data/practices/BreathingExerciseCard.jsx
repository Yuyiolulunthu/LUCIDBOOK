// BreathingExerciseCard.jsx - 完全修正版
import React, { useState, useRef, useEffect } from 'react';
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
} from 'react-native';
import Slider from '@react-native-community/slider';
import { Audio } from 'expo-av';
import { LinearGradient } from 'expo-linear-gradient';
import MaskedView from '@react-native-masked-view/masked-view';
import { Home, ChevronLeft, ChevronRight, Clock, Sparkles, Volume2, VolumeX, Play, Pause } from 'lucide-react-native';
import ProgressBar from './components/ProgressBar';

// 導入自定義圖標
import AnxietyIcon from './components/AnxietyIcon';
import TiredIcon from './components/TiredIcon';
import RelaxedIcon from './components/RelaxedIcon';
import AngryIcon from './components/AngryIcon';
import DepressedIcon from './components/DepressedIcon';
import SatisfiedIcon from './components/SatisfiedIcon';

export default function BreathingExerciseCard({ onBack, navigation, route }) {
  // 頁面狀態
  const [currentPage, setCurrentPage] = useState('welcome');
  
  // 練習相關狀態
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [selectedState, setSelectedState] = useState(null);
  
  // 第五頁狀態
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [totalDuration, setTotalDuration] = useState(300);
  const [isMuted, setIsMuted] = useState(false);
  
  // 第七頁狀態
  const [relaxLevel, setRelaxLevel] = useState(5);
  const [selectedMoods, setSelectedMoods] = useState([]);
  const [feelingNote, setFeelingNote] = useState('');
  const [isOtherMoodSelected, setIsOtherMoodSelected] = useState(false);
  
  // 第九頁狀態
  const [completionData, setCompletionData] = useState(null);
  
  const sound = useRef(null);
  const timerRef = useRef(null);
  const audioUpdateRef = useRef(null);
  
  // 音頻波形動畫值 - 24個波形條
  const waveHeights = [12, 20, 16, 28, 24, 32, 28, 20, 16, 24, 28, 32, 28, 24, 20, 16, 24, 28, 32, 24, 16, 20, 16, 12];
  const waveAnimations = useRef(
    waveHeights.map(() => new Animated.Value(0.3))
  ).current;
  
  // 呼吸動畫
  const breathScale = useRef(new Animated.Value(1)).current;
  const breathOpacity1 = useRef(new Animated.Value(0.3)).current;
  const breathOpacity2 = useRef(new Animated.Value(0.4)).current;
  
  // 第六頁裝飾元素動畫
  const sparkle1Opacity = useRef(new Animated.Value(0)).current;
  const sparkle2Opacity = useRef(new Animated.Value(0)).current;
  const sparkle3Opacity = useRef(new Animated.Value(0)).current;
  
  // 第九頁慶祝動畫
  const celebrationScale = useRef(new Animated.Value(0)).current;
  const celebrationRotate = useRef(new Animated.Value(0)).current;
  
  const previousScreen = route?.params?.from;

  // 練習數據
  const exercises = [
    {
      id: 1,
      title: '4-6呼吸練習',
      duration: '5 分鐘',
      description: '適合放鬆、減壓',
      tags: ['減壓', '助眠', '平靜'],
      type: '4-6-breathing',
    },
    {
      id: 2,
      title: '屏息呼吸練習',
      duration: '5 分鐘',
      description: '適合提升專注與穩定',
      tags: ['專注', '穩壓', '緩緩'],
      type: 'breath-holding',
    },
  ];

  // 情緒狀態數據
  const emotionalStates = [
    { id: 1, name: '焦慮緊張', icon: AnxietyIcon, color: '#EF4444', bgColor: '#FEE2E2' },
    { id: 2, name: '疲倦困倦', icon: TiredIcon, color: '#3B82F6', bgColor: '#DBEAFE' },
    { id: 3, name: '平靜放鬆', icon: RelaxedIcon, color: '#10B981', bgColor: '#D1FAE5' },
    { id: 4, name: '煩悶不快', icon: AngryIcon, color: '#F97316', bgColor: '#FFEDD5' },
    { id: 5, name: '悲傷低落', icon: DepressedIcon, color: '#6B7280', bgColor: '#F3F4F6' },
    { id: 6, name: '滿足愉悅', icon: SatisfiedIcon, color: '#F59E0B', bgColor: '#FEF3C7' },
  ];

  // 心情選項數據
  const moodOptions = [
    { id: 1, label: '平靜安定' },
    { id: 2, label: '負面情緒緩和了些' },
    { id: 3, label: '減壓愉悅' },
    { id: 4, label: '有趣新鮮' },
    { id: 5, label: '沒特別感受' },
    { id: 6, label: '其他', isOther: true },
  ];

  // 啟動歡迎頁面呼吸動畫
  useEffect(() => {
    if (currentPage === 'welcome') {
      // 外圈動畫
      Animated.loop(
        Animated.sequence([
          Animated.timing(breathOpacity1, {
            toValue: 0.15,
            duration: 3000,
            useNativeDriver: true,
          }),
          Animated.timing(breathOpacity1, {
            toValue: 0.3,
            duration: 3000,
            useNativeDriver: true,
          }),
        ])
      ).start();

      // 中圈動畫
      Animated.loop(
        Animated.sequence([
          Animated.delay(500),
          Animated.timing(breathOpacity2, {
            toValue: 0.2,
            duration: 3000,
            useNativeDriver: true,
          }),
          Animated.timing(breathOpacity2, {
            toValue: 0.4,
            duration: 3000,
            useNativeDriver: true,
          }),
        ])
      ).start();

      // 核心動畫
      Animated.loop(
        Animated.sequence([
          Animated.delay(1000),
          Animated.timing(breathScale, {
            toValue: 1.05,
            duration: 3000,
            useNativeDriver: true,
          }),
          Animated.timing(breathScale, {
            toValue: 1,
            duration: 3000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [currentPage]);

  // 啟動音頻波形動畫
  useEffect(() => {
    if (isPlaying) {
      waveAnimations.forEach((anim, index) => {
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
  }, [isPlaying]);

  // 第六頁裝飾動畫
  useEffect(() => {
    if (currentPage === 'completion') {
      Animated.sequence([
        Animated.delay(1000),
        Animated.parallel([
          Animated.timing(sparkle1Opacity, {
            toValue: 0.1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(sparkle2Opacity, {
            toValue: 0.1,
            duration: 1000,
            delay: 200,
            useNativeDriver: true,
          }),
          Animated.timing(sparkle3Opacity, {
            toValue: 0.1,
            duration: 1000,
            delay: 400,
            useNativeDriver: true,
          }),
        ]),
      ]).start();
    } else {
      sparkle1Opacity.setValue(0);
      sparkle2Opacity.setValue(0);
      sparkle3Opacity.setValue(0);
    }
  }, [currentPage]);

  // 第九頁慶祝動畫
  useEffect(() => {
    if (currentPage === 'streak') {
      // 初始彈出動畫
      Animated.parallel([
        Animated.spring(celebrationScale, {
          toValue: 1,
          tension: 100,
          friction: 10,
          useNativeDriver: true,
        }),
        Animated.timing(celebrationRotate, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ]).start(() => {
        // 然後開始循環擺動
        Animated.loop(
          Animated.sequence([
            Animated.timing(celebrationRotate, {
              toValue: 1.1,
              duration: 500,
              useNativeDriver: true,
            }),
            Animated.timing(celebrationRotate, {
              toValue: 0.9,
              duration: 500,
              useNativeDriver: true,
            }),
            Animated.timing(celebrationRotate, {
              toValue: 1,
              duration: 500,
              useNativeDriver: true,
            }),
            Animated.delay(3000),
          ])
        ).start();
      });
    } else {
      celebrationScale.setValue(0);
      celebrationRotate.setValue(0);
    }
  }, [currentPage]);

  // 處理練習選擇
  const handleSelectPractice = (practiceType) => {
    const exercise = exercises.find(ex => ex.type === practiceType);
    setSelectedExercise(exercise);
    setCurrentPage('preState');
  };

  // 處理情緒選擇完成
  const handlePreStateComplete = (feeling) => {
    setSelectedState(feeling);
    setCurrentPage('prepare');
  };

  // 處理準備頁面繼續
  const handlePrepareContinue = async () => {
    try {
      const audioFile = selectedExercise.type === '4-6-breathing'
        ? require('../../../assets/audio/4-6呼吸音檔.mp3')
        : require('../../../assets/audio/屏息呼吸音檔.mp3');
      
      const { sound: audioSound } = await Audio.Sound.createAsync(audioFile);
      sound.current = audioSound;
      
      const status = await audioSound.getStatusAsync();
      if (status.isLoaded) {
        const durationInSeconds = Math.floor(status.durationMillis / 1000);
        setTotalDuration(durationInSeconds);
      }
    } catch (error) {
      console.error('載入音頻錯誤:', error);
    }
    
    setCurrentPage('practice');
  };

  // 停止練習
  const stopPractice = async () => {
    setIsPlaying(false);
    
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (audioUpdateRef.current) {
      clearInterval(audioUpdateRef.current);
      audioUpdateRef.current = null;
    }
    
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
      await sound.current.pauseAsync();
      setIsPlaying(false);
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      if (audioUpdateRef.current) {
        clearInterval(audioUpdateRef.current);
        audioUpdateRef.current = null;
      }
    } else {
      await sound.current.playAsync();
      setIsPlaying(true);
      startTimers();
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
    audioUpdateRef.current = setInterval(async () => {
      if (sound.current) {
        const status = await sound.current.getStatusAsync();
        if (status.isLoaded && status.isPlaying) {
          setCurrentTime(Math.floor(status.positionMillis / 1000));
          
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
            
            handlePracticeComplete();
          }
        }
      }
    }, 100);
  };

  // 處理練習完成
  const handlePracticeComplete = async () => {
    await stopPractice();
    setCurrentPage('completion');
  };

  // 處理記錄感受
  const handleRecordFeelings = () => {
    setCurrentPage('relaxation');
  };

  // 處理靜靜結束
  const handleFinishQuietly = () => {
    setCurrentPage('streak');
  };

  // 處理放鬆程度完成
  const handleRelaxationComplete = (level) => {
    setRelaxLevel(level);
    setCurrentPage('feelings');
  };

  // 處理感受記錄完成
  const handleFeelingsComplete = (data) => {
    const practiceData = {
      exerciseType: selectedExercise?.title || '呼吸練習',
      duration: totalDuration,
      preMood: emotionalStates.find(st => st.id === selectedState)?.name || '未記錄',
      postMood: data.feelings.length > 0 ? data.feelings.join(', ') : '未記錄',
      relaxLevel: relaxLevel,
      journalEntry: data.notes,
      completedAt: new Date().toISOString(),
    };
    
    setCompletionData({
      consecutiveDays: 1,
      ...practiceData,
    });
    
    setCurrentPage('streak');
  };

  // 處理查看日記
  const handleViewJournal = () => {
    if (navigation) {
      navigation.navigate('Daily');
    } else {
      handleHome();
    }
  };

  // 處理結束練習（從第五頁）
  const handleEndPractice = () => {
    stopPractice();
    setCurrentPage('completion');
  };

  // 處理返回
  const handleBack = () => {
    if (currentPage === 'streak') {
      setCurrentPage('feelings');
    } else if (currentPage === 'feelings') {
      setCurrentPage('relaxation');
    } else if (currentPage === 'relaxation') {
      setCurrentPage('completion');
    } else if (currentPage === 'completion') {
      setCurrentPage('practice');
    } else if (currentPage === 'practice') {
      stopPractice();
      setCurrentPage('prepare');
    } else if (currentPage === 'prepare') {
      setCurrentPage('preState');
    } else if (currentPage === 'preState') {
      setCurrentPage('selection');
      setSelectedState(null);
    } else if (currentPage === 'selection') {
      setCurrentPage('welcome');
    } else {
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

  // 處理 Home
  const handleHome = () => {
    if (currentPage === 'practice') {
      stopPractice();
    }
    setCurrentPage('welcome');
    setSelectedExercise(null);
    setSelectedState(null);
    if (navigation) {
      navigation.navigate('Home');
    }
  };

  // 心情選擇處理
  const toggleMood = (moodId) => {
    const selectedMood = moodOptions.find(m => m.id === moodId);
    
    if (selectedMood?.isOther) {
      setIsOtherMoodSelected(!isOtherMoodSelected);
      
      if (!isOtherMoodSelected) {
        setSelectedMoods([...selectedMoods, moodId]);
      } else {
        setSelectedMoods(selectedMoods.filter(id => id !== moodId));
        setFeelingNote('');
      }
    } else {
      if (selectedMoods.includes(moodId)) {
        setSelectedMoods(selectedMoods.filter(id => id !== moodId));
      } else {
        setSelectedMoods([...selectedMoods, moodId]);
      }
    }
  };

  // 滑桿處理
  const handleRelaxLevelChange = (value) => {
    const snappedValue = Math.round(value);
    setRelaxLevel(snappedValue);
  };

  // 獲取連續天數
  const getStreakCount = () => {
    return completionData?.consecutiveDays || 1;
  };

  // 清理
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
  const GradientText = ({ text, style }) => (
    <MaskedView
      maskElement={
        <Text style={[styles.gradientTextMask, style]}>{text}</Text>
      }
    >
      <LinearGradient
        colors={['#166CB5', '#31C6FE']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <Text style={[styles.gradientTextMask, style, { opacity: 0 }]}>{text}</Text>
      </LinearGradient>
    </MaskedView>
  );

  // 格式化時間
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // 渲染歡迎頁面 (第1頁)
  const renderWelcomePage = () => (
    <View style={styles.pageContainer}>
      {/* 呼吸動畫 */}
      <View style={styles.welcomeAnimationContainer}>
        {/* 外圈 */}
        <Animated.View
          style={[
            styles.breathingOuterRing,
            {
              opacity: breathOpacity1,
              transform: [
                {
                  scale: breathOpacity1.interpolate({
                    inputRange: [0.15, 0.3],
                    outputRange: [1.15, 1],
                  })
                }
              ]
            }
          ]}
        />
        
        {/* 中圈 */}
        <Animated.View
          style={[
            styles.breathingMiddleRing,
            {
              opacity: breathOpacity2,
              transform: [
                {
                  scale: breathOpacity2.interpolate({
                    inputRange: [0.2, 0.4],
                    outputRange: [1.1, 1],
                  })
                }
              ]
            }
          ]}
        />
        
        {/* 核心圓圈 */}
        <Animated.View 
          style={[
            styles.breathingBubble,
            { transform: [{ scale: breathScale }] }
          ]}
        >
          <Text style={styles.bubbleEmoji}>🫧</Text>
        </Animated.View>
      </View>

      {/* 標題 */}
      <Text style={styles.welcomeTitle}>歡迎來到呼吸練習</Text>
      <Text style={styles.welcomeSubtitle}>透過呼吸，找回內在的平靜與力量</Text>

      {/* 資訊卡片 */}
      <View style={styles.infoCards}>
        {[
          { icon: '💭', text: '覺察當下的身心狀態' },
          { icon: '🫁', text: '透過呼吸調節自律神經' },
          { icon: '✨', text: '找到屬於你的平靜時刻' },
        ].map((item, index) => (
          <View key={index} style={styles.infoCard}>
            <Text style={styles.infoIcon}>{item.icon}</Text>
            <Text style={styles.infoText}>{item.text}</Text>
          </View>
        ))}
      </View>

      {/* 開始按鈕 */}
      <TouchableOpacity 
        style={styles.welcomeStartButton}
        onPress={() => setCurrentPage('selection')}
      >
        <LinearGradient
          colors={['#166CB5', '#31C6FE']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.welcomeStartButtonGradient}
        >
          <Text style={styles.welcomeStartButtonText}>開始練習</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );

  // 渲染練習選擇頁面 (第2頁)
  const renderSelectionPage = () => (
    <View style={styles.pageContainer}>
      {/* 標題 */}
      <View style={styles.headerSection}>
        <Text style={styles.pageTitle}>呼吸練習</Text>
        <Text style={styles.pageSubtitle}>你想讓自己更放鬆一點還是更穩定呢？選一種呼吸練習吧！</Text>
        
        {/* 進度條 */}
        <ProgressBar currentStep={1} totalSteps={6} style={{ marginTop: 24 }} />
      </View>

      {/* 練習卡片 */}
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {exercises.map((exercise) => (
          <View key={exercise.id} style={styles.exerciseCard}>
            <GradientText text={exercise.title} style={styles.exerciseTitle} />
            
            <View style={styles.durationRow}>
              <Clock size={16} color="#4B5563" />
              <Text style={styles.durationText}>{exercise.duration}</Text>
            </View>
            
            <Text style={styles.descriptionText}>{exercise.description}</Text>
            
            <View style={styles.tagsContainer}>
              {exercise.tags.map((tag, idx) => (
                <View key={idx} style={styles.tag}>
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
            </View>
            
            <TouchableOpacity 
              style={styles.exerciseStartButton}
              onPress={() => handleSelectPractice(exercise.type)}
            >
              <Sparkles size={16} color="#31C6FE" />
              <Text style={styles.exerciseStartText}>跟著我呼吸</Text>
              <ChevronRight size={18} color="#31C6FE" />
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>

      {/* 底部導航 */}
      <View style={styles.bottomNavContainer}>
        <TouchableOpacity onPress={handleBack} style={styles.navButton}>
          <ChevronLeft size={24} color="#31C6FE" />
        </TouchableOpacity>
      </View>
    </View>
  );

  // 渲染情緒選擇頁面 (第3頁)
  const renderPreStatePage = () => (
    <View style={styles.pageContainer}>
      {/* 標題 */}
      <View style={styles.headerSection}>
        <Text style={styles.pageTitle}>呼吸練習</Text>
        <Text style={styles.pageMainTitle}>此刻的你，感覺如何呢？</Text>
        <Text style={styles.pageSubtitle}>選擇最貼近你現在狀態的感受</Text>
        
        {/* 進度條 */}
        <ProgressBar currentStep={2} totalSteps={6} style={{ marginTop: 24 }} />
      </View>

      {/* 情緒網格 */}
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.emotionGrid}>
          {emotionalStates.map((state) => {
            const Icon = state.icon;
            const isSelected = selectedState === state.id;
            
            return (
              <TouchableOpacity
                key={state.id}
                style={[
                  styles.emotionCard,
                  isSelected && { borderColor: state.color, borderWidth: 2 }
                ]}
                onPress={() => setSelectedState(state.id)}
              >
                <View style={[styles.emotionIconContainer, { backgroundColor: state.bgColor }]}>
                  <Icon size={32} color={state.color} />
                </View>
                <Text style={styles.emotionName}>{state.name}</Text>
                
                {isSelected && (
                  <View style={[styles.emotionCheckmark, { backgroundColor: state.color }]}>
                    <Text style={styles.checkmarkText}>✓</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* 準備好了按鈕 - 始終顯示 */}
        <TouchableOpacity 
          style={[
            styles.readyButton,
            !selectedState && styles.readyButtonDisabled
          ]}
          onPress={() => selectedState && handlePreStateComplete(selectedState)}
          disabled={!selectedState}
        >
          <Text style={[
            styles.readyButtonText,
            !selectedState && styles.readyButtonTextDisabled
          ]}>準備好了</Text>
          <ChevronRight size={18} color={selectedState ? "#31C6FE" : "#D1D5DB"} />
        </TouchableOpacity>
      </ScrollView>

      {/* 底部導航 */}
      <View style={styles.bottomNavContainer}>
        <TouchableOpacity onPress={handleBack} style={styles.navButton}>
          <ChevronLeft size={24} color="#31C6FE" />
        </TouchableOpacity>
        
        <TouchableOpacity 
          onPress={() => selectedState && handlePreStateComplete(selectedState)} 
          style={[
            styles.navButton,
            !selectedState && styles.navButtonDisabled
          ]}
          disabled={!selectedState}
        >
          <ChevronRight size={24} color={selectedState ? "#31C6FE" : "#D1D5DB"} />
        </TouchableOpacity>
      </View>
    </View>
  );

  // 渲染準備頁面 (第4頁)
  const renderPreparePage = () => (
    <View style={styles.pageContainer}>
      {/* 標題 */}
      <View style={styles.headerSection}>
        <Text style={styles.pageTitle}>{selectedExercise?.title}</Text>
        
        {/* 進度條 */}
        <ProgressBar currentStep={3} totalSteps={6} style={{ marginTop: 24 }} />
      </View>

      {/* 右上結束按鈕 - 與 Home 按鈕同高度 */}
      <TouchableOpacity 
        style={styles.endButtonTopRight}
        onPress={handleFinishQuietly}
      >
        <Text style={styles.endButtonText}>結束練習</Text>
      </TouchableOpacity>

      {/* 主要內容 */}
      <View style={styles.prepareContent}>
        <Text style={styles.prepareTitle}>
          找個舒服的姿勢吧，{'\n'}坐著、躺著都可以，輕鬆就好
        </Text>
      </View>

      {/* 底部導航 */}
      <View style={styles.bottomNavContainer}>
        <TouchableOpacity onPress={handleBack} style={styles.navButton}>
          <ChevronLeft size={24} color="#31C6FE" />
        </TouchableOpacity>
        
        <TouchableOpacity onPress={handlePrepareContinue} style={styles.navButton}>
          <ChevronRight size={24} color="#31C6FE" />
        </TouchableOpacity>
      </View>
    </View>
  );

  // 渲染練習進行頁面 (第5頁)
  const renderPracticePage = () => {
    const progress = totalDuration > 0 ? currentTime / totalDuration : 0;
    
    return (
      <View style={styles.pageContainer}>
        {/* 標題 */}
        <View style={styles.headerSection}>
          <Text style={styles.pageTitle}>{selectedExercise?.title}</Text>
          <Text style={styles.pageSubtitle}>
            {selectedExercise?.type === '4-6-breathing' ? '放鬆減壓' : '提升專注與穩定'}
          </Text>
          
          {/* 進度條 */}
          <ProgressBar currentStep={4} totalSteps={6} style={{ marginTop: 24 }} />
        </View>

        {/* 右上結束按鈕 - 與 Home 按鈕同高度 */}
        <TouchableOpacity 
          style={styles.endButtonTopRight}
          onPress={handleEndPractice}
        >
          <Text style={styles.endButtonText}>結束練習</Text>
        </TouchableOpacity>

        {/* 主要內容 */}
        <View style={styles.practiceMainContent}>
          {/* 時間顯示 - 下移 25px */}
          <View style={styles.practiceTimeContainer}>
            <GradientText 
              text={formatTime(totalDuration - currentTime)} 
              style={styles.practiceTime} 
            />
          </View>

          {/* 音頻播放器卡片 */}
          <View style={styles.audioPlayerCard}>
            {/* 進度條 */}
            <View style={styles.audioProgressRow}>
              <Text style={styles.audioProgressTime}>{formatTime(currentTime)}</Text>
              <View style={styles.audioProgressBarContainer}>
                <View style={[styles.audioProgressBarFill, { width: `${progress * 100}%` }]}>
                  <LinearGradient
                    colors={['#166CB5', '#31C6FE']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.audioProgressGradient}
                  />
                </View>
              </View>
              <Text style={styles.audioProgressTime}>{formatTime(totalDuration)}</Text>
            </View>

            {/* 控制按鈕 */}
            <View style={styles.audioControls}>
              <TouchableOpacity onPress={toggleMute} style={styles.audioControlButton}>
                {isMuted ? (
                  <VolumeX size={24} color="#6B7280" />
                ) : (
                  <Volume2 size={24} color="#31C6FE" />
                )}
              </TouchableOpacity>
              
              <TouchableOpacity onPress={togglePlayPause} style={styles.audioPlayButton}>
                <LinearGradient
                  colors={['#166CB5', '#31C6FE']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.audioPlayButtonGradient}
                >
                  {isPlaying ? (
                    <Pause size={24} color="#FFFFFF" fill="#FFFFFF" />
                  ) : (
                    <Play size={24} color="#FFFFFF" fill="#FFFFFF" />
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </View>

            {/* 音頻波形 - 動態響應 */}
            <View style={styles.audioWave}>
              {waveAnimations.map((anim, i) => (
                <Animated.View
                  key={i}
                  style={[
                    styles.audioBar,
                    {
                      height: anim.interpolate({
                        inputRange: [0.3, 1],
                        outputRange: [8, waveHeights[i]],
                      }),
                      backgroundColor: isPlaying ? '#31C6FE' : '#D1D5DB',
                    }
                  ]}
                />
              ))}
            </View>

            {/* 狀態提示 */}
            <Text style={styles.audioStatus}>
              {isPlaying ? '播放中...' : '已暫停'}
            </Text>
          </View>

          {/* 提示文字 */}
          <Text style={styles.practiceHint}>
            {isMuted ? '已靜音，請專注於自己的呼吸節奏' : '跟隨音軌引導進行呼吸練習'}
          </Text>
        </View>

        {/* 底部導航 */}
        <View style={styles.bottomNavContainer}>
          <TouchableOpacity onPress={handleBack} style={styles.navButton}>
            <ChevronLeft size={24} color="#31C6FE" />
          </TouchableOpacity>
          
          <TouchableOpacity onPress={handlePracticeComplete} style={styles.navButton}>
            <ChevronRight size={24} color="#31C6FE" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // 渲染完成頁面 (第6頁) - 加入裝飾元素
  const renderCompletionPage = () => (
    <View style={styles.pageContainer}>
      {/* 裝飾元素 */}
      <Animated.Text 
        style={[
          styles.decorativeSparkle1,
          { opacity: sparkle1Opacity }
        ]}
      >
        ✨
      </Animated.Text>
      <Animated.Text 
        style={[
          styles.decorativeSparkle2,
          { opacity: sparkle2Opacity }
        ]}
      >
        💫
      </Animated.Text>
      <Animated.Text 
        style={[
          styles.decorativeSparkle3,
          { opacity: sparkle3Opacity }
        ]}
      >
        🌟
      </Animated.Text>

      {/* 主要內容 */}
      <View style={styles.completionContent}>
        <Text style={styles.completionEmoji}>🌿</Text>
        <Text style={styles.completionTitle}>你做得很好</Text>
        <Text style={styles.completionSubtitle}>專注力、穩定力level up</Text>

        {/* 記錄按鈕 */}
        <TouchableOpacity 
          style={styles.completionButton}
          onPress={handleRecordFeelings}
        >
          <LinearGradient
            colors={['#166CB5', '#31C6FE']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.completionButtonGradient}
          >
            <Text style={styles.completionButtonText}>記錄此刻的感受</Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* 跳過按鈕 */}
        <TouchableOpacity onPress={handleFinishQuietly}>
          <Text style={styles.skipText}>靜靜結束練習</Text>
        </TouchableOpacity>

        {/* 底部提示 */}
        <Text style={styles.completionFooter}>
          謝謝你願意花時間陪自己，你的心又比剛剛更穩了一點
        </Text>
      </View>

      {/* 底部導航 */}
      <View style={styles.bottomNavContainerSingle}>
        <TouchableOpacity onPress={handleRecordFeelings} style={styles.navButton}>
          <ChevronRight size={24} color="#31C6FE" />
        </TouchableOpacity>
      </View>
    </View>
  );

  // 渲染放鬆程度頁面 (第7頁)
  const renderRelaxationPage = () => {
    const is46Breathing = selectedExercise?.type === '4-6-breathing';
    const title = is46Breathing 
      ? '練習過後你的放鬆程度' 
      : '練習完後，你覺得呼吸變得更穩定了嗎？';
    const leftLabel = is46Breathing ? '仍緊繃' : '沒有明顯感覺';
    const rightLabel = is46Breathing ? '非常放鬆' : '變得穩定';

    return (
      <View style={styles.pageContainer}>
        {/* 標題 */}
        <View style={styles.headerSectionRelaxation}>
          <Text style={styles.pageTitleRelaxation}>呼吸練習</Text>
          <Text style={styles.pageMainTitleRelaxation}>感受覺察</Text>
          <Text style={styles.pageSubtitle}>花幾秒看看現在的心情</Text>
          
          {/* 進度條 */}
          <ProgressBar currentStep={5} totalSteps={6} style={{ marginTop: 24 }} />
        </View>

        {/* 內容 */}
        <View style={styles.relaxationContentContainer}>
          <View style={styles.relaxationCard}>
            <Text style={styles.relaxationTitle}>{title}</Text>
            
            {/* 分數顯示 */}
            <View style={styles.scoreDisplay}>
              <GradientText text={String(relaxLevel)} style={styles.scoreNumber} />
              <Text style={styles.scoreMax}>/10</Text>
            </View>

            {/* 刻度在滑桿上方 */}
            <View style={styles.scaleContainer}>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                <View key={num} style={styles.scaleItem}>
                  <Text 
                    style={[
                      styles.scaleText,
                      num <= relaxLevel && styles.scaleTextActive
                    ]}
                  >
                    {num}
                  </Text>
                  <View 
                    style={[
                      styles.scaleMark,
                      num <= relaxLevel && styles.scaleMarkActive
                    ]} 
                  />
                </View>
              ))}
            </View>

            {/* 滑桿容器 */}
            <View style={styles.sliderContainer}>
              {/* 背景軌道 */}
              <View style={styles.sliderTrack}>
                {/* 漸層填充 */}
                <LinearGradient
                  colors={['#166CB5', '#31C6FE']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.sliderFill, { width: `${(relaxLevel / 10) * 100}%` }]}
                />
              </View>
              {/* 原生滑桿（透明軌道） */}
              <Slider
                style={styles.slider}
                minimumValue={0}
                maximumValue={10}
                step={1}
                value={relaxLevel}
                onValueChange={handleRelaxLevelChange}
                minimumTrackTintColor="transparent"
                maximumTrackTintColor="transparent"
                thumbTintColor="#FFFFFF"
              />
            </View>

            {/* 標籤 */}
            <View style={styles.scaleLabels}>
              <Text style={styles.scaleLabelText}>{leftLabel}</Text>
              <Text style={styles.scaleLabelText}>{rightLabel}</Text>
            </View>
          </View>
        </View>

        {/* 底部導航 */}
        <View style={styles.bottomNavContainer}>
          <TouchableOpacity onPress={handleBack} style={styles.navButton}>
            <ChevronLeft size={24} color="#31C6FE" />
          </TouchableOpacity>
          
          <TouchableOpacity 
            onPress={() => handleRelaxationComplete(relaxLevel)} 
            style={styles.navButton}
          >
            <ChevronRight size={24} color="#31C6FE" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // 渲染感受記錄頁面 (第8頁)
  const renderFeelingsPage = () => (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.pageContainer}>
          {/* 標題 */}
          <View style={styles.headerSection}>
            <Text style={styles.pageTitle}>呼吸練習</Text>
            <Text style={styles.pageMainTitle}>感受覺察</Text>
            <Text style={styles.pageSubtitle}>花幾秒看看現在的心情</Text>
            
            {/* 進度條 */}
            <ProgressBar currentStep={6} totalSteps={6} style={{ marginTop: 24 }} />
          </View>

          {/* 內容 */}
          <ScrollView 
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
            {/* 心情提示 */}
            <Text style={styles.feelingsPrompt}>練習完後你感覺...</Text>

            {/* 心情標籤 */}
            <View style={styles.moodTags}>
              {moodOptions.map((mood) => {
                const isSelected = selectedMoods.includes(mood.id);
                
                return (
                  <TouchableOpacity
                    key={mood.id}
                    style={[
                      styles.moodTag,
                      isSelected && styles.moodTagSelected,
                    ]}
                    onPress={() => toggleMood(mood.id)}
                  >
                    <Text 
                      style={[
                        styles.moodTagText,
                        isSelected && styles.moodTagTextSelected,
                      ]}
                    >
                      {mood.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* 記錄輸入 */}
            {isOtherMoodSelected && (
              <>
                <Text style={styles.recordPrompt}>記錄下來</Text>
                
                <TextInput
                  style={styles.recordInput}
                  multiline
                  placeholder="寫下你的感受..."
                  placeholderTextColor="#9CA3AF"
                  value={feelingNote}
                  onChangeText={setFeelingNote}
                  textAlignVertical="top"
                />
              </>
            )}

            {/* 提交按鈕 */}
            <TouchableOpacity 
              style={styles.feelingsButton}
              onPress={() => handleFeelingsComplete({
                feelings: selectedMoods.map(id => moodOptions.find(m => m.id === id)?.label).filter(Boolean),
                notes: feelingNote,
              })}
            >
              <LinearGradient
                colors={['#166CB5', '#31C6FE']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.feelingsButtonGradient}
              >
                <Text style={styles.feelingsButtonText}>記錄此刻的感受</Text>
              </LinearGradient>
            </TouchableOpacity>
          </ScrollView>

          {/* 底部導航 */}
          <View style={styles.bottomNavContainer}>
            <TouchableOpacity onPress={handleBack} style={styles.navButton}>
              <ChevronLeft size={24} color="#31C6FE" />
            </TouchableOpacity>
            
            <TouchableOpacity 
              onPress={() => handleFeelingsComplete({
                feelings: selectedMoods.map(id => moodOptions.find(m => m.id === id)?.label).filter(Boolean),
                notes: feelingNote,
              })}
              style={styles.navButton}
            >
              <ChevronRight size={24} color="#31C6FE" />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );

  // 渲染連續天數頁面 (第9頁) - 加入慶祝動畫
  const renderStreakPage = () => {
    const rotation = celebrationRotate.interpolate({
      inputRange: [0, 0.25, 0.75, 1, 1.1],
      outputRange: ['0deg', '-10deg', '10deg', '0deg', '0deg'],
    });

    return (
      <View style={styles.pageContainer}>
        {/* 標題 */}
        <View style={styles.streakHeaderSection}>
          <Text style={styles.pageTitleStreak}>呼吸練習</Text>
        </View>

        {/* 主要內容 */}
        <View style={styles.streakContent}>
          <Text style={styles.streakTitle}>太棒了！</Text>
          <Text style={styles.streakSubtitle}>
            你完成了今天的呼吸練習，{'\n'}繼續保持這個美好的習慣吧！
          </Text>

          {/* 連續天數卡片 */}
          <View style={styles.streakCard}>
            <Animated.Text 
              style={[
                styles.streakEmoji,
                {
                  transform: [
                    { scale: celebrationScale },
                    { rotate: rotation }
                  ]
                }
              ]}
            >
              🎉
            </Animated.Text>
            <Text style={styles.streakLabel}>你已經連續完成練習</Text>
            <GradientText text={`${getStreakCount()} 天`} style={styles.streakDays} />
          </View>

          {/* 查看日記按鈕 */}
          <TouchableOpacity 
            style={styles.streakButton}
            onPress={handleViewJournal}
          >
            <Text style={styles.streakButtonText}>查看日記</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // 主渲染 - 將 LinearGradient 放在最外層
  return (
    <LinearGradient
      colors={['#E8F4F9', '#F0F9FF', '#E0F2FE']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ flex: 1 }}
    >
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" />
        
        {/* Header - Home 按鈕在左上角 */}
        <View style={styles.header}>
          <TouchableOpacity 
            onPress={handleHome}
            style={styles.headerHomeButton}
          >
            <Home size={20} color="#31C6FE" />
          </TouchableOpacity>
        </View>

        {/* 頁面內容 */}
        {currentPage === 'welcome' && renderWelcomePage()}
        {currentPage === 'selection' && renderSelectionPage()}
        {currentPage === 'preState' && renderPreStatePage()}
        {currentPage === 'prepare' && renderPreparePage()}
        {currentPage === 'practice' && renderPracticePage()}
        {currentPage === 'completion' && renderCompletionPage()}
        {currentPage === 'relaxation' && renderRelaxationPage()}
        {currentPage === 'feelings' && renderFeelingsPage()}
        {currentPage === 'streak' && renderStreakPage()}
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 24,
    backgroundColor: 'transparent',
  },
  headerHomeButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#31C6FE',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 32,
    elevation: 8,
  },
  pageContainer: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  headerSection: {
    paddingHorizontal: 24,
    paddingTop: 0,
    paddingBottom: 24,
  },
  headerSectionRelaxation: {
    paddingHorizontal: 24,
    paddingTop: 0,
    paddingBottom: 12,
  },
  streakHeaderSection: {
    paddingHorizontal: 24,
    paddingTop: 0,
    paddingBottom: 8,
  },
  pageTitle: {
    fontSize: 20,
    fontWeight: '400',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 16,
  },
  pageTitleRelaxation: {
    fontSize: 20,
    fontWeight: '400',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 8,
  },
  pageTitleStreak: {
    fontSize: 20,
    fontWeight: '400',
    color: '#1F2937',
    textAlign: 'center',
  },
  pageMainTitle: {
    fontSize: 24,
    fontWeight: '400',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 8,
  },
  pageMainTitleRelaxation: {
    fontSize: 24,
    fontWeight: '400',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 16,
  },
  pageSubtitle: {
    fontSize: 16,
    fontWeight: '400',
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 120,
  },
  bottomNavContainer: {
    position: 'absolute',
    bottom: 32,
    left: 24,
    right: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  bottomNavContainerSingle: {
    position: 'absolute',
    bottom: 32,
    right: 24,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  navButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#31C6FE',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 32,
    elevation: 8,
  },
  navButtonDisabled: {
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    shadowOpacity: 0.1,
  },
  endButtonTopRight: {
    position: 'absolute',
    top: -66,
    right: 24,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 100,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    zIndex: 10,
  },
  endButtonText: {
    fontSize: 14,
    fontWeight: '400',
    color: '#6B7280',
  },
  
  // 歡迎頁面樣式
  welcomeAnimationContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 60,
    position: 'relative',
  },
  breathingOuterRing: {
    position: 'absolute',
    width: 128,
    height: 128,
    borderRadius: 64,
    backgroundColor: 'rgba(49, 198, 254, 0.2)',
  },
  breathingMiddleRing: {
    position: 'absolute',
    width: 128,
    height: 128,
    borderRadius: 64,
    backgroundColor: 'rgba(22, 108, 181, 0.25)',
  },
  breathingBubble: {
    width: 128,
    height: 128,
    borderRadius: 64,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#31C6FE',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 32,
    elevation: 8,
  },
  bubbleEmoji: {
    fontSize: 80,
  },
  welcomeTitle: {
    fontSize: 36,
    fontWeight: '400',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 16,
    marginTop: 48,
  },
  welcomeSubtitle: {
    fontSize: 16,
    fontWeight: '400',
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 48,
    paddingHorizontal: 32,
  },
  infoCards: {
    paddingHorizontal: 24,
    gap: 12,
    marginBottom: 48,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 16,
    padding: 16,
    gap: 16,
  },
  infoIcon: {
    fontSize: 24,
  },
  infoText: {
    fontSize: 14,
    fontWeight: '400',
    color: '#4B5563',
    flex: 1,
  },
  welcomeStartButton: {
    marginHorizontal: 24,
    marginBottom: 48,
    borderRadius: 100,
    overflow: 'hidden',
  },
  welcomeStartButtonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  welcomeStartButtonText: {
    fontSize: 16,
    fontWeight: '400',
    color: '#FFFFFF',
  },
  
  // 練習選擇頁面樣式
  exerciseCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  gradientTextMask: {
    fontSize: 20,
    fontWeight: '400',
    textAlign: 'center',
  },
  exerciseTitle: {
    marginBottom: 16,
  },
  durationRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  durationText: {
    fontSize: 14,
    fontWeight: '400',
    color: '#4B5563',
  },
  descriptionText: {
    fontSize: 14,
    fontWeight: '400',
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 16,
  },
  tagsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    flexWrap: 'wrap',
    marginBottom: 24,
  },
  tag: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 100,
    backgroundColor: '#31C6FE',
  },
  tagText: {
    fontSize: 14,
    fontWeight: '400',
    color: '#FFFFFF',
  },
  exerciseStartButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 100,
    borderWidth: 2,
    borderColor: '#31C6FE',
    backgroundColor: '#FFFFFF',
  },
  exerciseStartText: {
    fontSize: 14,
    fontWeight: '400',
    color: '#31C6FE',
  },
  
  // 情緒選擇樣式
  emotionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 16,
    marginBottom: 32,
  },
  emotionCard: {
    width: '47%',
    aspectRatio: 1.2,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    position: 'relative',
  },
  emotionIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  emotionName: {
    fontSize: 14,
    fontWeight: '400',
    color: '#4B5563',
  },
  emotionCheckmark: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmarkText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  readyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 100,
    borderWidth: 2,
    borderColor: '#31C6FE',
    backgroundColor: '#FFFFFF',
    alignSelf: 'center',
    marginTop: 16,
  },
  readyButtonDisabled: {
    borderColor: '#D1D5DB',
    backgroundColor: '#F9FAFB',
  },
  readyButtonText: {
    fontSize: 14,
    fontWeight: '400',
    color: '#31C6FE',
  },
  readyButtonTextDisabled: {
    color: '#D1D5DB',
  },
  
  // 準備頁面樣式
  prepareContent: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingTop: 120,
  },
  prepareTitle: {
    fontSize: 20,
    fontWeight: '400',
    color: '#1F2937',
    textAlign: 'center',
    lineHeight: 32,
  },
  
  // 練習進行頁面樣式
  practiceMainContent: {
    flex: 1,
    paddingHorizontal: 24,
    paddingBottom: 120,
    justifyContent: 'center',
  },
  practiceTimeContainer: {
    alignItems: 'center',
    marginBottom: 12,
    //marginTop: 25,
  },
  practiceTime: {
    fontSize: 80,
    fontWeight: '400',
    marginTop: 45,
  },
  audioPlayerCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 24,
    padding: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    marginTop: 5,
  },
  audioProgressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 32,
  },
  audioProgressTime: {
    fontSize: 12,
    fontWeight: '400',
    color: '#6B7280',
  },
  audioProgressBarContainer: {
    flex: 1,
    height: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  audioProgressBarFill: {
    height: '100%',
    borderRadius: 4,
    overflow: 'hidden',
  },
  audioProgressGradient: {
    width: '100%',
    height: '100%',
  },
  audioControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 24,
    marginBottom: 32,
  },
  audioControlButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  audioPlayButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    overflow: 'hidden',
  },
  audioPlayButtonGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  audioWave: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
    height: 40,
    marginBottom: 16,
  },
  audioBar: {
    width: 4,
    borderRadius: 2,
  },
  audioStatus: {
    fontSize: 12,
    fontWeight: '400',
    color: '#6B7280',
    textAlign: 'center',
  },
  practiceHint: {
    fontSize: 14,
    fontWeight: '400',
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 24,
  },
  
  // 完成頁面樣式
  completionContent: {
    flex: 1,
    paddingHorizontal: 32,
    paddingTop: 100,
    alignItems: 'center',
  },
  completionEmoji: {
    fontSize: 72,
    marginBottom: 24,
  },
  completionTitle: {
    fontSize: 36,
    fontWeight: '400',
    color: '#1F2937',
    marginBottom: 16,
  },
  completionSubtitle: {
    fontSize: 16,
    fontWeight: '400',
    color: '#4B5563',
    textAlign: 'center',
    marginBottom: 60,
  },
  completionButton: {
    width: '100%',
    maxWidth: 340,
    borderRadius: 100,
    overflow: 'hidden',
    marginBottom: 16,
  },
  completionButtonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  completionButtonText: {
    fontSize: 16,
    fontWeight: '400',
    color: '#FFFFFF',
  },
  skipText: {
    fontSize: 14,
    fontWeight: '400',
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 4,
  },
  completionFooter: {
    fontSize: 14,
    fontWeight: '400',
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 48,
    paddingHorizontal: 16,
    lineHeight: 22,
  },
  decorativeSparkle1: {
    position: 'absolute',
    top: 80,
    left: 40,
    fontSize: 48,
  },
  decorativeSparkle2: {
    position: 'absolute',
    top: 128,
    right: 64,
    fontSize: 40,
  },
  decorativeSparkle3: {
    position: 'absolute',
    bottom: 260,
    left: 80,
    fontSize: 32,
  },
  
  // 放鬆程度頁面樣式
  relaxationContentContainer: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 120,
  },
  relaxationCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 24,
    padding: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    marginTop: -20,
  },
  relaxationTitle: {
    fontSize: 16,
    fontWeight: '400',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 32,
  },
  scoreDisplay: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
    marginBottom: 32,
  },
  scoreNumber: {
    fontSize: 64,
    fontWeight: '400',
  },
  scoreMax: {
    fontSize: 20,
    fontWeight: '400',
    color: '#6B7280',
    marginLeft: 4,
  },
  scaleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    paddingHorizontal: 2,
  },
  scaleItem: {
    alignItems: 'center',
    flex: 1,
  },
  scaleText: {
    fontSize: 10,
    fontWeight: '400',
    color: '#6B7280',
    marginBottom: 4,
  },
  scaleTextActive: {
    color: '#31C6FF',
    fontWeight: '600',
  },
  scaleMark: {
    width: 2,
    height: 8,
    backgroundColor: '#D1D5DB',
  },
  scaleMarkActive: {
    backgroundColor: '#31C6FF',
    height: 10,
    width: 3,
  },
  sliderContainer: {
    position: 'relative',
    height: 40,
    marginBottom: 16,
  },
  sliderTrack: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: '50%',
    height: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: 4,
    transform: [{ translateY: -4 }],
    overflow: 'hidden',
  },
  sliderFill: {
    height: '100%',
    borderRadius: 4,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  scaleLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  scaleLabelText: {
    fontSize: 12,
    fontWeight: '400',
    color: '#6B7280',
  },
  
  // 感受記錄頁面樣式
  feelingsPrompt: {
    fontSize: 14,
    fontWeight: '400',
    color: '#4B5563',
    marginBottom: 16,
  },
  moodTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 32,
  },
  moodTag: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 100,
    borderWidth: 2,
    borderColor: '#31C6FF',
    backgroundColor: 'transparent',
  },
  moodTagSelected: {
    backgroundColor: '#31C6FF',
  },
  moodTagText: {
    fontSize: 14,
    fontWeight: '400',
    color: '#31C6FF',
  },
  moodTagTextSelected: {
    color: '#FFFFFF',
  },
  recordPrompt: {
    fontSize: 14,
    fontWeight: '400',
    color: '#31C6FF',
    marginBottom: 12,
  },
  recordInput: {
    width: '100%',
    height: 128,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 16,
    padding: 16,
    fontSize: 14,
    fontWeight: '400',
    color: '#4B5563',
    textAlignVertical: 'top',
    marginBottom: 32,
  },
  feelingsButton: {
    width: '100%',
    maxWidth: 340,
    alignSelf: 'center',
    borderRadius: 100,
    overflow: 'hidden',
  },
  feelingsButtonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  feelingsButtonText: {
    fontSize: 16,
    fontWeight: '400',
    color: '#FFFFFF',
  },
  
  // 連續天數頁面樣式
  streakContent: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
    alignItems: 'center',
  },
  streakTitle: {
    fontSize: 36,
    fontWeight: '400',
    color: '#1F2937',
    marginBottom: 12,
  },
  streakSubtitle: {
    fontSize: 18,
    fontWeight: '400',
    color: '#4B5563',
    textAlign: 'center',
    lineHeight: 28,
    marginBottom: 32,
  },
  streakCard: {
    width: '100%',
    maxWidth: 330,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 24,
    padding: 30,
    alignItems: 'center',
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  streakEmoji: {
    fontSize: 64,
    marginBottom: 24,
  },
  streakLabel: {
    fontSize: 16,
    fontWeight: '400',
    color: '#4B5563',
    marginBottom: 16,
  },
  streakDays: {
    fontSize: 64,
    fontWeight: '400',
  },
  streakButton: {
    width: '100%',
    maxWidth: 340,
    paddingVertical: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 100,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  streakButtonText: {
    fontSize: 16,
    fontWeight: '400',
    color: '#31C6FE',
  },
});