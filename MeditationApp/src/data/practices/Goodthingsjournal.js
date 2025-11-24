// GoodThingsJournalNew.js - 完整修改版（已接 practice API）
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
  TextInput,
  Keyboard,
  TouchableWithoutFeedback,
  Animated,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Slider from '@react-native-community/slider';
import Svg, { Path } from 'react-native-svg';
import { Home } from 'lucide-react-native';
import MaskedView from '@react-native-masked-view/masked-view';
import ApiService from '../../../api'; // 使用你的 practice API

// 初始表單資料（方便重設／還原）
const INITIAL_FORM_DATA = {
  goodThing: '',
  whoWith: '',
  feelings: '',
  emotions: [],
  otherEmotion: '',
  reason: '',
  howToRepeat: '',
  futureAction: '',
  positiveScore: 5,
  moodEmotions: [],
  moodNotes: '',
  timestamp: 0,
};

// 進度條組件
const ProgressBar = ({ currentStep, totalSteps, style }) => {
  const progress = (currentStep / totalSteps) * 100;

  return (
    <View style={[styles.progressBarContainer, style]}>
      {/* Progress Track */}
      <View style={styles.progressTrack}>
        {/* Progress Fill */}
        <View
          style={[styles.progressFillContainer, { width: `${progress}%` }]}
        >
          <LinearGradient
            colors={['#166CB5', '#31C6FE']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.progressGradient}
          />
        </View>
      </View>

      {/* Step Counter */}
      <View style={styles.stepCounter}>
        <Text style={styles.stepText}>
          {currentStep} / {totalSteps}
        </Text>
      </View>
    </View>
  );
};

// 漸層文字組件
const GradientText = ({ text, style }) => (
  <MaskedView
    maskElement={<Text style={[styles.gradientTextMask, style]}>{text}</Text>}
  >
    <LinearGradient
      colors={['#166CB5', '#31C6FE']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
    >
      <Text
        style={[styles.gradientTextMask, style, { opacity: 0 }]}
      >
        {text}
      </Text>
    </LinearGradient>
  </MaskedView>
);

// 自定義箭頭圖標組件
const ArrowIcon = ({ direction = 'right', color = '#31C6FE', size = 24 }) => {
  const rotation = direction === 'left' ? '180' : '0';

  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      style={{ transform: [{ rotate: `${rotation}deg` }] }}
    >
      <Path
        d="M9 18l6-6-6-6"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </Svg>
  );
};

export default function GoodThingsJournalNew({ onBack, navigation, route }) {
  const [currentPage, setCurrentPage] = useState('welcome');

  // 表單數據
  const [formData, setFormData] = useState(INITIAL_FORM_DATA);

  // === practice 狀態 ===
  const [practiceId, setPracticeId] = useState(null);
  const [startTime, setStartTime] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0); // 秒數累積

  // 其他狀態
  const [showQ1Suggestions, setShowQ1Suggestions] = useState(false);
  const [showQ1bSuggestions, setShowQ1bSuggestions] = useState(false);
  const [showQ2Suggestions, setShowQ2Suggestions] = useState(false);
  const [showQ4Suggestions, setShowQ4Suggestions] = useState(false);
  const [showQ4bSuggestions, setShowQ4bSuggestions] = useState(false);
  const [showOtherEmotionInput, setShowOtherEmotionInput] = useState(false);
  const [showOtherActionInput, setShowOtherActionInput] = useState(false);
  const [showOtherMoodInput, setShowOtherMoodInput] = useState(false);

  const scrollViewRef = useRef(null);
  const previousScreen = route?.params?.from;

  // 動畫值
  const sparkle1Opacity = useRef(new Animated.Value(0)).current;
  const sparkle2Opacity = useRef(new Animated.Value(0)).current;
  const sparkle3Opacity = useRef(new Animated.Value(0)).current;
  const celebrationScale = useRef(new Animated.Value(0)).current;
  const celebrationRotate = useRef(new Animated.Value(0)).current;

  // 當前步驟計算
  const getCurrentStep = () => {
    const stepMap = {
      welcome: 0,
      intro: 1,
      question1: 2,
      question1b: 3,
      question2: 4,
      emotions: 5,
      transition: 6,
      question4: 7,
      question4b: 8,
      question5: 9,
      completion: 10,
      positiveFeeling: 10,
      mood: 11,
      streak: 11,
    };
    return stepMap[currentPage] || 1;
  };

  const totalSteps = 11;

  // 建議內容
  const question1Suggestions = [
    '收到朋友的一則暖心訊息',
    '吃到一份好吃的早餐',
    '完成了一項拖延已久的工作',
    '在路上看見可愛的貓咪',
    '睡了一個飽飽的覺',
    '抬頭看見美麗的雲朵',
  ];

  const question1bSuggestions = [
    '自己一個人,享受獨處時光',
    '家人(父母、兄弟姊妹、伴侶)',
    '好朋友、閨蜜、死黨',
    '同事、合作夥伴',
    '寵物(貓咪、狗狗)',
    '陌生人(店員、路人)',
  ];

  const question2Suggestions = [
    '覺得自己很幸運,事情進行得很順利',
    '覺得被愛著、被關心著,心裡暖暖的',
    '覺得努力有了回報,很有成就感',
    '覺得這世界其實很美好',
    '覺得充滿希望,對未來更有信心',
    '覺得很放鬆,壓力都釋放了',
  ];

  const emotionTags = ['平靜', '驕傲', '被支持', '開心', '感謝', '滿足', '其他'];

  const question4Suggestions = [
    '我有主動開啟對話',
    '平常有維持聯絡、互相關心',
    '手邊工作處理順利,心情輕鬆',
    '昨晚早睡、今天精神好',
  ];

  const question4bSuggestions = [
    '主動創造機會,例如:邀請朋友聚餐',
    '保持開放的心態,嘗試新事物',
    '多留意身邊的小事,練習感恩',
    '建立固定的儀式感,例如:每週一次',
    '調整自己的作息,例如:早睡早起',
    '給自己多一點鼓勵和肯定',
  ];

  const quickActions = [
    '下次主動約朋友吃飯',
    '明天提早 10 分鐘出門',
    '每天多閱讀 5 分鐘',
    '做一次呼吸練習',
    '睡前不滑手機 30 分鐘',
    '主動跟家人聊聊天',
  ];

  const moodOptions = [
    '平靜安定',
    '原本不舒服的情緒緩和了些',
    '滿足',
    '有趣',
    '溫暖',
    '沒特別感受',
    '其他',
  ];

  // 連續天數計算（之後可以改成從後端拉）
  const getStreakDays = () => {
    return 3;
  };

  // =============== practice 相關：初始化 / 自動累積時間 / 自動儲存 ===============

  // 儲存進度到後端
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
      console.log('好事書寫練習進度儲存失敗:', err);
    }
  };

  // 初始化練習
  const initializePractice = async () => {
    try {
      const response = await ApiService.startPractice('好事書寫練習');
      if (response && response.practiceId) {
        setPracticeId(response.practiceId);

        // 如果後端有回傳已累積秒數，可以接起來
        const restoredSeconds = response.accumulatedSeconds
          ? Number(response.accumulatedSeconds)
          : 0;
        setElapsedTime(restoredSeconds);

        // 如果有舊的 formData，也可以合併
        if (response.formData) {
          try {
            const parsed =
              typeof response.formData === 'string'
                ? JSON.parse(response.formData)
                : response.formData;
            setFormData(prev => ({
              ...prev,
              ...parsed,
            }));
          } catch (e) {
            console.log('解析既有好事書寫資料失敗，改用預設:', e);
          }
        }
      }
    } catch (e) {
      console.log('好事書寫練習初始化失敗:', e);
      Alert.alert('提示', '初始化練習時遇到問題，稍後再試試。');
    } finally {
      // 無論成功與否，都開始計時（至少前端有時間感）
      setStartTime(Date.now());
    }
  };

  // 完成好事書寫練習，送到後端 completePractice
  const handleCompleteJournal = async () => {
    try {
      let totalSeconds = elapsedTime;

      // 如果 elapsedTime 還是 0，用 startTime 算一次
      if (!totalSeconds && startTime) {
        totalSeconds = Math.floor((Date.now() - startTime) / 1000);
      }
      if (!totalSeconds) totalSeconds = 60; // 至少算一分鐘練習

      if (practiceId) {
        await ApiService.completePractice(practiceId, {
          practice_type: '好事書寫練習',
          duration: Math.max(1, Math.ceil(totalSeconds / 60)),
          duration_seconds: totalSeconds,
          formData, // 這裡整包丟給後端存 JSON
        });

        // 可以順便存最後一筆 progress
        await saveProgress();
      } else {
        console.log('⚠️ 沒有 practiceId，僅在前端完成好事書寫:', formData);
      }
    } catch (err) {
      console.log('完成好事書寫練習失敗:', err);
    } finally {
      // 完成後導回日記頁或 Home
      if (navigation) {
        navigation.navigate('Daily');
      } else if (onBack) {
        onBack();
      }
    }
  };

  // 初始化練習（component mount）
  useEffect(() => {
    initializePractice();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 每秒累加 elapsedTime
  useEffect(() => {
    if (!startTime) return;
    const timer = setInterval(() => {
      setElapsedTime(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [startTime]);

  // 每 10 秒自動保存一次進度
  useEffect(() => {
    if (!practiceId) return;
    const interval = setInterval(() => {
      saveProgress();
    }, 10000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [practiceId, currentPage, formData, elapsedTime]);

  // ======================== 既有動畫效果 ========================

  // 完成頁動畫效果
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
  }, [currentPage, sparkle1Opacity, sparkle2Opacity, sparkle3Opacity]);

  // 連續天數頁動畫效果
  useEffect(() => {
    if (currentPage === 'streak') {
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
  }, [currentPage, celebrationScale, celebrationRotate]);

  // ======================== 共用操作 ========================

  // 處理返回
  const handleBack = () => {
    const backMap = {
      welcome: () => onBack?.() || navigation?.goBack(),
      intro: () => setCurrentPage('welcome'),
      question1: () => setCurrentPage('intro'),
      question1b: () => setCurrentPage('question1'),
      question2: () => setCurrentPage('question1b'),
      emotions: () => setCurrentPage('question2'),
      transition: () => setCurrentPage('emotions'),
      question4: () => setCurrentPage('transition'),
      question4b: () => setCurrentPage('question4'),
      question5: () => setCurrentPage('question4b'),
      completion: () => setCurrentPage('question5'),
      positiveFeeling: () => setCurrentPage('completion'),
      mood: () => setCurrentPage('positiveFeeling'),
      streak: () => setCurrentPage('mood'),
    };

    const action = backMap[currentPage];
    if (action) action();
  };

  // 處理 Home 按鈕（順便存一次進度）
  const handleHome = async () => {
    try {
      if (practiceId) {
        await saveProgress();
      }
    } catch (e) {
      console.log('回首頁前儲存好事書寫進度失敗:', e);
    }

    setCurrentPage('welcome');
    if (navigation) {
      navigation.navigate('Home');
    }
  };

  // 切換情緒標籤
  const toggleEmotion = emotion => {
    if (emotion === '其他') {
      if (formData.emotions.includes('其他')) {
        setFormData(prev => ({
          ...prev,
          emotions: prev.emotions.filter(e => e !== '其他'),
          otherEmotion: '',
        }));
        setShowOtherEmotionInput(false);
      } else {
        setFormData(prev => ({
          ...prev,
          emotions: [...prev.emotions, '其他'],
        }));
        setShowOtherEmotionInput(true);
      }
    } else {
      setFormData(prev => ({
        ...prev,
        emotions: prev.emotions.includes(emotion)
          ? prev.emotions.filter(e => e !== emotion)
          : [...prev.emotions, emotion],
      }));
    }
  };

  // 選擇快速行動
  const handleActionSelect = action => {
    if (action === '其他') {
      setShowOtherActionInput(!showOtherActionInput);
      if (!showOtherActionInput) {
        setFormData(prev => ({ ...prev, futureAction: '' }));
      }
    } else {
      setFormData(prev => ({ ...prev, futureAction: action }));
      setShowOtherActionInput(false);
    }
  };

  // 切換心情標籤
  const toggleMood = mood => {
    if (mood === '其他') {
      if (formData.moodEmotions.includes('其他')) {
        setFormData(prev => ({
          ...prev,
          moodEmotions: prev.moodEmotions.filter(m => m !== '其他'),
          moodNotes: '',
        }));
        setShowOtherMoodInput(false);
      } else {
        setFormData(prev => ({
          ...prev,
          moodEmotions: [...prev.moodEmotions, '其他'],
        }));
        setShowOtherMoodInput(true);
      }
    } else {
      setFormData(prev => ({
        ...prev,
        moodEmotions: prev.moodEmotions.includes(mood)
          ? prev.moodEmotions.filter(m => m !== mood)
          : [...prev.moodEmotions, mood],
      }));
    }
  };

  // 滑桿處理
  const handlePositiveScoreChange = value => {
    const snappedValue = Math.round(value);
    setFormData(prev => ({ ...prev, positiveScore: snappedValue }));
  };

  // ========== 各頁面渲染函數 ==========

  // 1. 歡迎頁
  const renderWelcomePage = () => (
    <View style={styles.welcomeContainer}>
      <ScrollView
        contentContainerStyle={styles.welcomeScrollContent}
        showsVerticalScrollIndicator={false}
        bounces
        scrollEventThrottle={16}
      >
        <TouchableOpacity
          onPress={handleHome}
          style={styles.welcomeHomeButton}
        >
          <View style={styles.homeButtonCircle}>
            <Home size={20} color="#31C6FE" />
          </View>
        </TouchableOpacity>

        <View style={styles.welcomeContent}>
          <View style={styles.welcomeIconContainer}>
            <View style={styles.glowCircle1} />
            <View style={styles.glowCircle2} />
            <View style={styles.welcomeIconCore}>
              <Text style={styles.welcomeEmoji}>✨</Text>
            </View>
          </View>

          <Text style={styles.welcomeTitle}>歡迎來到好事書寫</Text>
          <Text style={styles.welcomeSubtitle}>
            透過書寫,讓美好被看見、被記得
          </Text>

          <View style={styles.welcomeInfoCards}>
            <View style={styles.infoCard}>
              <Text style={styles.infoCardEmoji}>🌟</Text>
              <Text style={styles.infoCardText}>
                捕捉生活中的美好時刻
              </Text>
            </View>
            <View style={styles.infoCard}>
              <Text style={styles.infoCardEmoji}>💛</Text>
              <Text style={styles.infoCardText}>
                培養感恩與正向心態
              </Text>
            </View>
            <View style={styles.infoCard}>
              <Text style={styles.infoCardEmoji}>📖</Text>
              <Text style={styles.infoCardText}>
                建立專屬於你的幸福日記
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.welcomeStartButton}
            onPress={() => setCurrentPage('intro')}
          >
            <LinearGradient
              colors={['#166CB5', '#31C6FE']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.welcomeStartGradient}
            >
              <Text style={styles.welcomeStartText}>開始書寫</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );

  // 2. 介紹頁
  const renderIntroPage = () => (
    <View style={styles.pageContainer}>
      <View style={styles.headerContainer}>
        <TouchableOpacity
          onPress={handleHome}
          style={styles.headerHomeButton}
        >
          <View style={styles.homeButtonCircle}>
            <Home size={20} color="#31C6FE" />
          </View>
        </TouchableOpacity>

        <Text style={styles.headerTitle}>好事書寫</Text>

        <ProgressBar
          currentStep={getCurrentStep()}
          totalSteps={totalSteps}
        />
      </View>

      <ScrollView
        contentContainerStyle={styles.introScrollContent}
        showsVerticalScrollIndicator={false}
        bounces
        scrollEventThrottle={16}
        removeClippedSubviews
      >
        <View style={styles.introIconContainer}>
          <LinearGradient
            colors={['#10b981', '#31C6FE']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.introIconGradient}
          >
            <Text style={styles.introIconHeart}>♥</Text>
          </LinearGradient>
        </View>

        <Text style={styles.introMainTitle}>培養正向注意力</Text>

        <View style={styles.introDuration}>
          <Text style={styles.introDurationText}> 10 分鐘</Text>
        </View>

        <View style={styles.introDescription}>
          <Text style={styles.introDescText}>
            大腦天生容易記住不開心的事,
          </Text>
          <Text style={styles.introDescText}>
            一起訓練大腦捕捉正向事務的能力,
          </Text>
          <Text style={styles.introDescText}>並且讓好事再花生!</Text>
        </View>

        <TouchableOpacity
          style={styles.introStartButton}
          onPress={() => setCurrentPage('question1')}
        >
          <Text style={styles.introStartButtonText}>
            記錄那些小小的好事
          </Text>
          <View style={styles.introStartArrow}>
            <ArrowIcon direction="right" color="#31C6FE" size={20} />
          </View>
        </TouchableOpacity>
      </ScrollView>

      <View style={styles.bottomNavigation}>
        <TouchableOpacity
          onPress={handleBack}
          style={styles.navButton}
        >
          <ArrowIcon direction="left" color="#31C6FE" size={24} />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setCurrentPage('question1')}
          style={styles.navButton}
        >
          <ArrowIcon direction="right" color="#31C6FE" size={24} />
        </TouchableOpacity>
      </View>
    </View>
  );

  // 3. 問題1-1頁
  const renderQuestion1Page = () => (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.pageContainer}>
          <View style={styles.headerContainer}>
            <TouchableOpacity
              onPress={handleHome}
              style={styles.headerHomeButton}
            >
              <View style={styles.homeButtonCircle}>
                <Home size={20} color="#31C6FE" />
              </View>
            </TouchableOpacity>

            <Text style={styles.headerTitle}>好事書寫</Text>

            <ProgressBar
              currentStep={getCurrentStep()}
              totalSteps={totalSteps}
            />

            <View style={styles.questionTitleSection}>
              <Text style={styles.questionMainTitle}>
                今天有發生什麼{'\n'}讓你心裡暖一下的事嗎?
              </Text>
              <Text style={styles.questionSubtitle}>
                任何讓你覺得舒服、安心、放鬆的小事都可以
              </Text>
            </View>
          </View>

          <ScrollView
            ref={scrollViewRef}
            contentContainerStyle={styles.questionScrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            bounces
            scrollEventThrottle={16}
            removeClippedSubviews
          >
            <Text style={styles.questionLabel}>
              那是在什麼時候、什麼情境下?
            </Text>
            <TextInput
              style={styles.questionTextarea}
              multiline
              placeholder="例如:今天下班時看到美麗的夕陽..."
              placeholderTextColor="#B0B0B0"
              value={formData.goodThing}
              onChangeText={text =>
                setFormData(prev => ({ ...prev, goodThing: text }))
              }
              textAlignVertical="top"
            />

            <TouchableOpacity
              style={styles.suggestionTrigger}
              onPress={() =>
                setShowQ1Suggestions(!showQ1Suggestions)
              }
            >
              <Image
                source={require('../../../assets/images/Fresh_idea.png')}
                style={[
                  styles.suggestionIcon,
                  showQ1Suggestions && styles.suggestionIconActive,
                ]}
                resizeMode="contain"
              />
              <Text
                style={[
                  styles.suggestionText,
                  !showQ1Suggestions &&
                    styles.suggestionTextInactive,
                ]}
              >
                需要靈感嗎?
              </Text>
            </TouchableOpacity>

            {showQ1Suggestions && (
              <View style={styles.suggestionBox}>
                <Text style={styles.suggestionBoxTitle}>
                  可以試試這些方向:
                </Text>
                {question1Suggestions.map((item, index) => (
                  <Text
                    key={index}
                    style={styles.suggestionBoxItem}
                  >
                    • {item}
                  </Text>
                ))}
              </View>
            )}
          </ScrollView>

          <View style={styles.bottomNavigation}>
            <TouchableOpacity
              onPress={handleBack}
              style={styles.navButton}
            >
              <ArrowIcon direction="left" color="#31C6FE" size={24} />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setCurrentPage('question1b')}
              style={styles.navButton}
            >
              <ArrowIcon direction="right" color="#31C6FE" size={24} />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );

  // 4. 問題1-2頁
  const renderQuestion1bPage = () => (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.pageContainer}>
          <View style={styles.headerContainer}>
            <TouchableOpacity
              onPress={handleHome}
              style={styles.headerHomeButton}
            >
              <View style={styles.homeButtonCircle}>
                <Home size={20} color="#31C6FE" />
              </View>
            </TouchableOpacity>

            <Text style={styles.headerTitle}>好事書寫</Text>

            <ProgressBar
              currentStep={getCurrentStep()}
              totalSteps={totalSteps}
            />

            <View style={styles.questionTitleSection}>
              <Text style={styles.questionMainTitle}>
                今天有發生什麼{'\n'}讓你心裡暖一下的事嗎?
              </Text>
              <Text style={styles.questionSubtitle}>
                任何讓你覺得舒服、安心、放鬆的小事都可以
              </Text>
            </View>
          </View>

          <ScrollView
            contentContainerStyle={styles.questionScrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            bounces
            scrollEventThrottle={16}
            removeClippedSubviews
          >
            <Text style={styles.questionLabel}>
              當時你跟誰在一起呢?
            </Text>
            <TextInput
              style={styles.questionTextarea}
              multiline
              placeholder="例如:和我的好朋友小明"
              placeholderTextColor="#B0B0B0"
              value={formData.whoWith}
              onChangeText={text =>
                setFormData(prev => ({ ...prev, whoWith: text }))
              }
              textAlignVertical="top"
            />

            <TouchableOpacity
              style={styles.suggestionTrigger}
              onPress={() =>
                setShowQ1bSuggestions(!showQ1bSuggestions)
              }
            >
              <Image
                source={require('../../../assets/images/Fresh_idea.png')}
                style={[
                  styles.suggestionIcon,
                  showQ1bSuggestions && styles.suggestionIconActive,
                ]}
                resizeMode="contain"
              />
              <Text
                style={[
                  styles.suggestionText,
                  !showQ1bSuggestions &&
                    styles.suggestionTextInactive,
                ]}
              >
                需要靈感嗎?
              </Text>
            </TouchableOpacity>

            {showQ1bSuggestions && (
              <View style={styles.suggestionBox}>
                <Text style={styles.suggestionBoxTitle}>
                  可以試試這些方向:
                </Text>
                {question1bSuggestions.map((item, index) => (
                  <Text
                    key={index}
                    style={styles.suggestionBoxItem}
                  >
                    • {item}
                  </Text>
                ))}
              </View>
            )}
          </ScrollView>

          <View style={styles.bottomNavigation}>
            <TouchableOpacity
              onPress={handleBack}
              style={styles.navButton}
            >
              <ArrowIcon direction="left" color="#31C6FE" size={24} />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setCurrentPage('question2')}
              style={styles.navButton}
            >
              <ArrowIcon direction="right" color="#31C6FE" size={24} />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );

  // 5. 問題1-3頁
  const renderQuestion2Page = () => (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.pageContainer}>
          <View style={styles.headerContainer}>
            <TouchableOpacity
              onPress={handleHome}
              style={styles.headerHomeButton}
            >
              <View style={styles.homeButtonCircle}>
                <Home size={20} color="#31C6FE" />
              </View>
            </TouchableOpacity>

            <Text style={styles.headerTitle}>好事書寫</Text>

            <ProgressBar
              currentStep={getCurrentStep()}
              totalSteps={totalSteps}
            />

            <View style={styles.questionTitleSection}>
              <Text style={styles.questionMainTitle}>
                今天有發生什麼{'\n'}讓你心裡暖一下的事嗎?
              </Text>
              <Text style={styles.questionSubtitle}>
                任何讓你覺得舒服、安心、放鬆的小事都可以
              </Text>
            </View>
          </View>

          <ScrollView
            contentContainerStyle={styles.questionScrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            bounces
            scrollEventThrottle={16}
            removeClippedSubviews
          >
            <Text style={styles.questionLabel}>
              當下你的想法是什麼呢?
            </Text>
            <TextInput
              style={styles.questionTextarea}
              multiline
              placeholder="例如:這件讓我感覺很感激與溫暖,覺得很幸福很感恩"
              placeholderTextColor="#B0B0B0"
              value={formData.feelings}
              onChangeText={text =>
                setFormData(prev => ({ ...prev, feelings: text }))
              }
              textAlignVertical="top"
            />

            <TouchableOpacity
              style={styles.suggestionTrigger}
              onPress={() =>
                setShowQ2Suggestions(!showQ2Suggestions)
              }
            >
              <Image
                source={require('../../../assets/images/Fresh_idea.png')}
                style={[
                  styles.suggestionIcon,
                  showQ2Suggestions && styles.suggestionIconActive,
                ]}
                resizeMode="contain"
              />
              <Text
                style={[
                  styles.suggestionText,
                  !showQ2Suggestions &&
                    styles.suggestionTextInactive,
                ]}
              >
                需要靈感嗎?
              </Text>
            </TouchableOpacity>

            {showQ2Suggestions && (
              <View style={styles.suggestionBox}>
                <Text style={styles.suggestionBoxTitle}>
                  可以試試這些方向:
                </Text>
                {question2Suggestions.map((item, index) => (
                  <Text
                    key={index}
                    style={styles.suggestionBoxItem}
                  >
                    • {item}
                  </Text>
                ))}
              </View>
            )}
          </ScrollView>

          <View style={styles.bottomNavigation}>
            <TouchableOpacity
              onPress={handleBack}
              style={styles.navButton}
            >
              <ArrowIcon direction="left" color="#31C6FE" size={24} />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setCurrentPage('emotions')}
              style={styles.navButton}
            >
              <ArrowIcon direction="right" color="#31C6FE" size={24} />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );

  // 6. 問題1-end頁(情緒標籤)
  const renderEmotionsPage = () => (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.pageContainer}>
          <View style={styles.headerContainer}>
            <TouchableOpacity
              onPress={handleHome}
              style={styles.headerHomeButton}
            >
              <View style={styles.homeButtonCircle}>
                <Home size={20} color="#31C6FE" />
              </View>
            </TouchableOpacity>

            <Text style={styles.headerTitle}>好事書寫</Text>

            <ProgressBar
              currentStep={getCurrentStep()}
              totalSteps={totalSteps}
            />

            <View style={styles.questionTitleSection}>
              <Text style={styles.questionMainTitle}>
                今天發生了什麼好事
              </Text>
              <Text style={styles.questionSubtitle}>
                任何讓你感覺好奇、安心、快樂的小事
              </Text>
            </View>
          </View>

          <ScrollView
            contentContainerStyle={styles.questionScrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            bounces
            scrollEventThrottle={16}
            removeClippedSubviews
          >
            <Text style={styles.questionLabel}>
              這件事讓你感覺⋯
            </Text>

            <View style={styles.emotionTagsContainer}>
              {emotionTags.map((emotion, index) => {
                const isSelected =
                  formData.emotions.includes(emotion);
                return (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.emotionTag,
                      isSelected && styles.emotionTagSelected,
                    ]}
                    onPress={() => toggleEmotion(emotion)}
                  >
                    <Text
                      style={[
                        styles.emotionTagText,
                        isSelected &&
                          styles.emotionTagTextSelected,
                      ]}
                    >
                      {emotion}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {showOtherEmotionInput && (
              <>
                <Text style={styles.recordPrompt}>記錄下來</Text>
                <TextInput
                  style={styles.recordTextarea}
                  multiline
                  placeholder="寫下我的感受"
                  placeholderTextColor="#B0B0B0"
                  value={formData.otherEmotion}
                  onChangeText={text =>
                    setFormData(prev => ({
                      ...prev,
                      otherEmotion: text,
                    }))
                  }
                  textAlignVertical="top"
                />
              </>
            )}
          </ScrollView>

          <View style={styles.bottomNavigation}>
            <TouchableOpacity
              onPress={handleBack}
              style={styles.navButton}
            >
              <ArrowIcon direction="left" color="#31C6FE" size={24} />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setCurrentPage('transition')}
              style={styles.navButton}
            >
              <ArrowIcon direction="right" color="#31C6FE" size={24} />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );

  // 7. 過渡頁
  const renderTransitionPage = () => (
    <View style={styles.pageContainer}>
      <View style={styles.headerContainer}>
        <TouchableOpacity
          onPress={handleHome}
          style={styles.headerHomeButton}
        >
          <View style={styles.homeButtonCircle}>
            <Home size={20} color="#31C6FE" />
          </View>
        </TouchableOpacity>

        <Text style={styles.headerTitle}>好事書寫</Text>

        <ProgressBar
          currentStep={getCurrentStep()}
          totalSteps={totalSteps}
        />
      </View>

      <View style={styles.transitionContent}>
        <Text style={styles.transitionEmoji}>✨</Text>

        <Text style={styles.transitionMainTitle}>
          想起美好的時光{'\n'}不錯吧!
        </Text>

        <View style={styles.transitionTextBlock}>
          <Text style={styles.transitionBigText}>
            好事可以被複製
          </Text>
          <Text style={styles.transitionSmallText}>
            找出讓好事發生的原因{'\n'}你會更容易抓到生活裡的亮點
          </Text>
        </View>
      </View>

      <View style={styles.bottomNavigationRight}>
        <TouchableOpacity
          onPress={() => setCurrentPage('question4')}
          style={styles.navButton}
        >
          <ArrowIcon direction="right" color="#31C6FE" size={24} />
        </TouchableOpacity>
      </View>
    </View>
  );

  // 8. 問題2-1頁
  const renderQuestion4Page = () => (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.pageContainer}>
          <View style={styles.headerContainer}>
            <TouchableOpacity
              onPress={handleHome}
              style={styles.headerHomeButton}
            >
              <View style={styles.homeButtonCircle}>
                <Home size={20} color="#31C6FE" />
              </View>
            </TouchableOpacity>

            <Text style={styles.headerTitle}>好事書寫</Text>

            <ProgressBar
              currentStep={getCurrentStep()}
              totalSteps={totalSteps}
            />

            <View style={styles.questionTitleSection}>
              <Text style={styles.questionMainTitle}>
                好事可以被複製
              </Text>
              <Text style={styles.questionSubtitle}>
                找出讓好事發生的原因{'\n'}你會更容易抓到生活裡的亮點
              </Text>
            </View>
          </View>

          <ScrollView
            contentContainerStyle={styles.questionScrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            bounces
            scrollEventThrottle={16}
            removeClippedSubviews
          >
            <Text style={styles.questionLabel}>
              是什麼原因,讓這件好事有機會發生呢?
            </Text>
            <TextInput
              style={styles.questionTextarea}
              multiline
              placeholder="例如:我當時想出門,用心觀察周遭環境"
              placeholderTextColor="#B0B0B0"
              value={formData.reason}
              onChangeText={text =>
                setFormData(prev => ({ ...prev, reason: text }))
              }
              textAlignVertical="top"
            />

            <TouchableOpacity
              style={styles.suggestionTrigger}
              onPress={() =>
                setShowQ4Suggestions(!showQ4Suggestions)
              }
            >
              <Image
                source={require('../../../assets/images/Fresh_idea.png')}
                style={[
                  styles.suggestionIcon,
                  showQ4Suggestions && styles.suggestionIconActive,
                ]}
                resizeMode="contain"
              />
              <Text
                style={[
                  styles.suggestionText,
                  !showQ4Suggestions &&
                    styles.suggestionTextInactive,
                ]}
              >
                需要靈感嗎?
              </Text>
            </TouchableOpacity>

            {showQ4Suggestions && (
              <View style={styles.suggestionBox}>
                <Text style={styles.suggestionBoxTitle}>
                  可以試試這些方向:
                </Text>
                {question4Suggestions.map((item, index) => (
                  <Text
                    key={index}
                    style={styles.suggestionBoxItem}
                  >
                    • {item}
                  </Text>
                ))}
              </View>
            )}
          </ScrollView>

          <View style={styles.bottomNavigation}>
            <TouchableOpacity
              onPress={handleBack}
              style={styles.navButton}
            >
              <ArrowIcon direction="left" color="#31C6FE" size={24} />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setCurrentPage('question4b')}
              style={styles.navButton}
            >
              <ArrowIcon direction="right" color="#31C6FE" size={24} />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );

  // 9. 問題2-2頁
  const renderQuestion4bPage = () => (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.pageContainer}>
          <View style={styles.headerContainer}>
            <TouchableOpacity
              onPress={handleHome}
              style={styles.headerHomeButton}
            >
              <View style={styles.homeButtonCircle}>
                <Home size={20} color="#31C6FE" />
              </View>
            </TouchableOpacity>

            <Text style={styles.headerTitle}>好事書寫</Text>

            <ProgressBar
              currentStep={getCurrentStep()}
              totalSteps={totalSteps}
            />

            <View style={styles.questionTitleSection}>
              <Text style={styles.questionMainTitle}>
                好事可以被複製
              </Text>
              <Text style={styles.questionSubtitle}>
                找出讓好事發生的原因{'\n'}你會更容易抓到生活裡的亮點
              </Text>
            </View>
          </View>

          <ScrollView
            contentContainerStyle={styles.questionScrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            bounces
            scrollEventThrottle={16}
            removeClippedSubviews
          >
            <Text style={styles.questionLabel}>
              可以怎麼做,讓這種好事更常出現?
            </Text>
            <TextInput
              style={styles.questionTextarea}
              multiline
              placeholder="例如:明天也早10分鐘出門"
              placeholderTextColor="#B0B0B0"
              value={formData.howToRepeat}
              onChangeText={text =>
                setFormData(prev => ({
                  ...prev,
                  howToRepeat: text,
                }))
              }
              textAlignVertical="top"
            />

            <TouchableOpacity
              style={styles.suggestionTrigger}
              onPress={() =>
                setShowQ4bSuggestions(!showQ4bSuggestions)
              }
            >
              <Image
                source={require('../../../assets/images/Fresh_idea.png')}
                style={[
                  styles.suggestionIcon,
                  showQ4bSuggestions && styles.suggestionIconActive,
                ]}
                resizeMode="contain"
              />
              <Text
                style={[
                  styles.suggestionText,
                  !showQ4bSuggestions &&
                    styles.suggestionTextInactive,
                ]}
              >
                需要靈感嗎?
              </Text>
            </TouchableOpacity>

            {showQ4bSuggestions && (
              <View style={styles.suggestionBox}>
                <Text style={styles.suggestionBoxTitle}>
                  可以試試這些方向:
                </Text>
                {question4bSuggestions.map((item, index) => (
                  <Text
                    key={index}
                    style={styles.suggestionBoxItem}
                  >
                    • {item}
                  </Text>
                ))}
              </View>
            )}
          </ScrollView>

          <View style={styles.bottomNavigation}>
            <TouchableOpacity
              onPress={handleBack}
              style={styles.navButton}
            >
              <ArrowIcon direction="left" color="#31C6FE" size={24} />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setCurrentPage('question5')}
              style={styles.navButton}
            >
              <ArrowIcon direction="right" color="#31C6FE" size={24} />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );

  // 10. 問題2-3頁(選擇小行動)
  const renderQuestion5Page = () => {
    const isCustomAction = showOtherActionInput;
    const selectedAction = formData.futureAction;

    return (
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.pageContainer}>
            <View style={styles.headerContainer}>
              <TouchableOpacity
                onPress={handleHome}
                style={styles.headerHomeButton}
              >
                <View style={styles.homeButtonCircle}>
                  <Home size={20} color="#31C6FE" />
                </View>
              </TouchableOpacity>

              <Text style={styles.headerTitle}>好事書寫</Text>

              <ProgressBar
                currentStep={getCurrentStep()}
                totalSteps={totalSteps}
              />

              <View style={styles.questionTitleSection}>
                <Text style={styles.questionMainTitle}>
                  好事可以被複製
                </Text>
                <Text style={styles.questionSubtitle}>
                  找出讓好事發生的原因{'\n'}讓它變成你心裡的答案
                </Text>
              </View>
            </View>

            <ScrollView
              contentContainerStyle={styles.questionScrollContent}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              bounces
              scrollEventThrottle={16}
              removeClippedSubviews
            >
              <Text style={styles.questionLabel}>
                選一個好事複製小行動
              </Text>

              <View style={styles.actionTagsContainer}>
                {quickActions.map((action, index) => {
                  const isSelected = selectedAction === action;
                  return (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.actionTag,
                        isSelected && styles.actionTagSelected,
                      ]}
                      onPress={() => handleActionSelect(action)}
                    >
                      <Text
                        style={[
                          styles.actionTagText,
                          isSelected &&
                            styles.actionTagTextSelected,
                        ]}
                      >
                        {action}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* 「其他」按鈕 */}
              <View style={styles.otherActionButtonContainer}>
                <TouchableOpacity
                  style={[
                    styles.actionTag,
                    styles.otherActionButton,
                    showOtherActionInput && styles.actionTagSelected,
                  ]}
                  onPress={() => handleActionSelect('其他')}
                >
                  <Text
                    style={[
                      styles.actionTagText,
                      showOtherActionInput &&
                        styles.actionTagTextSelected,
                    ]}
                  >
                    其他
                  </Text>
                </TouchableOpacity>
              </View>

              {showOtherActionInput && (
                <>
                  <Text style={styles.recordPrompt}>記錄下來</Text>
                  <TextInput
                    style={styles.recordTextarea}
                    multiline
                    placeholder="寫下你的想法..."
                    placeholderTextColor="#B0B0B0"
                    value={
                      isCustomAction ? formData.futureAction : ''
                    }
                    onChangeText={text =>
                      setFormData(prev => ({
                        ...prev,
                        futureAction: text,
                      }))
                    }
                    textAlignVertical="top"
                  />
                </>
              )}
            </ScrollView>

            <View style={styles.bottomNavigation}>
              <TouchableOpacity
                onPress={handleBack}
                style={styles.navButton}
              >
                <ArrowIcon direction="left" color="#31C6FE" size={24} />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setCurrentPage('completion')}
                style={styles.navButton}
              >
                <ArrowIcon direction="right" color="#31C6FE" size={24} />
              </TouchableOpacity>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    );
  };

  // 11. 你做得很好頁
  const renderCompletionPage = () => (
    <View style={styles.completionContainer}>
      {/* 裝飾元素 */}
      <Animated.Text
        style={[
          styles.decorativeSparkle1,
          { opacity: sparkle1Opacity },
        ]}
      >
        ✨
      </Animated.Text>
      <Animated.Text
        style={[
          styles.decorativeSparkle2,
          { opacity: sparkle2Opacity },
        ]}
      >
        💫
      </Animated.Text>
      <Animated.Text
        style={[
          styles.decorativeSparkle3,
          { opacity: sparkle3Opacity },
        ]}
      >
        🌟
      </Animated.Text>

      <View style={styles.headerContainer}>
        <TouchableOpacity
          onPress={handleHome}
          style={styles.headerHomeButton}
        >
          <View style={styles.homeButtonCircle}>
            <Home size={20} color="#31C6FE" />
          </View>
        </TouchableOpacity>

        <Text style={styles.headerTitle}>好事書寫</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.completionScrollContent}
        showsVerticalScrollIndicator={false}
        bounces
        scrollEventThrottle={16}
      >
        <Text style={styles.completionTitle}>
          你做得很好 🌿
        </Text>

        <View style={styles.completionDescription}>
          <Text style={styles.completionDescText}>
            願意停下來看看生活裡的好
          </Text>
          <Text style={styles.completionDescText}>
            是一件很值得被肯定的事
          </Text>
        </View>

        <TouchableOpacity
          style={styles.completionPrimaryButton}
          onPress={() => setCurrentPage('positiveFeeling')}
        >
          <Text style={styles.completionPrimaryText}>
            記錄此刻的感受
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.completionSecondaryButton}
          onPress={() => setCurrentPage('streak')}
        >
          <Text style={styles.completionSecondaryText}>
            靜靜結束練習
          </Text>
        </TouchableOpacity>

        <Text style={styles.completionBottomMessage}>
          你已慢慢發現,{'\n'}
          幸福往往是從日常中發現的,{'\n'}
          而不是創造的 ✨
        </Text>
      </ScrollView>
    </View>
  );

  // 12. 正向感受滑桿頁
  const renderPositiveFeelingPage = () => (
    <View style={styles.pageContainer}>
      <View style={styles.headerContainer}>
        <TouchableOpacity
          onPress={handleHome}
          style={styles.headerHomeButton}
        >
          <View style={styles.homeButtonCircle}>
            <Home size={20} color="#31C6FE" />
          </View>
        </TouchableOpacity>

        <Text style={styles.headerTitle}>好事書寫</Text>

        <View style={styles.feelingTitleSection}>
          <Text style={styles.questionMainTitle}>感受覺察</Text>
          <Text style={styles.questionSubtitle}>
            花幾秒看看現在的心情
          </Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.questionScrollContent}
        showsVerticalScrollIndicator={false}
        bounces
        scrollEventThrottle={16}
      >
        <View style={styles.sliderCard}>
          <Text style={styles.sliderCardTitle}>
            對自己或生活的正向感受
          </Text>

          {/* 分數顯示 */}
          <View style={styles.sliderScoreDisplay}>
            <GradientText
              text={String(formData.positiveScore)}
              style={styles.sliderScoreNumber}
            />
            <Text style={styles.sliderScoreTotal}>/10</Text>
          </View>

          {/* 刻度在滑桿上方 */}
          <View style={styles.sliderMarkersTop}>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
              <View key={num} style={styles.sliderMarkerItem}>
                <Text
                  style={[
                    styles.sliderMarkerTextTop,
                    num === formData.positiveScore &&
                      styles.sliderMarkerTextActive,
                  ]}
                >
                  {num}
                </Text>
                <View
                  style={[
                    styles.sliderMarkerLine,
                    num <= formData.positiveScore &&
                      styles.sliderMarkerLineActive,
                  ]}
                />
              </View>
            ))}
          </View>

          {/* 滑桿容器 */}
          <View style={styles.sliderContainerNew}>
            <View style={styles.sliderTrackBackground}>
              <LinearGradient
                colors={['#166CB5', '#31C6FE']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[
                  styles.sliderTrackFill,
                  {
                    width: `${
                      (formData.positiveScore / 10) * 100
                    }%`,
                  },
                ]}
              />
            </View>
            <Slider
              style={styles.sliderOverlay}
              minimumValue={0}
              maximumValue={10}
              step={1}
              value={formData.positiveScore}
              onValueChange={handlePositiveScoreChange}
              minimumTrackTintColor="transparent"
              maximumTrackTintColor="transparent"
              thumbTintColor="#FFFFFF"
            />
          </View>

          {/* 標籤 */}
          <View style={styles.sliderLabels}>
            <Text style={styles.sliderLabelTextBlack}>
              0 完全沒有
            </Text>
            <Text style={styles.sliderLabelTextBlack}>
              10 踏實愉悅
            </Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.bottomNavigation}>
        <TouchableOpacity
          onPress={handleBack}
          style={styles.navButton}
        >
          <ArrowIcon direction="left" color="#31C6FE" size={24} />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setCurrentPage('mood')}
          style={styles.navButton}
        >
          <ArrowIcon direction="right" color="#31C6FE" size={24} />
        </TouchableOpacity>
      </View>
    </View>
  );

  // 13. 書寫後心情頁
  const renderMoodPage = () => (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.pageContainer}>
          <View style={styles.headerContainer}>
            <TouchableOpacity
              onPress={handleHome}
              style={styles.headerHomeButton}
            >
              <View style={styles.homeButtonCircle}>
                <Home size={20} color="#31C6FE" />
              </View>
            </TouchableOpacity>

            <Text style={styles.headerTitle}>好事書寫</Text>

            <ProgressBar
              currentStep={getCurrentStep()}
              totalSteps={totalSteps}
            />

            <View style={styles.feelingTitleSection}>
              <Text style={styles.questionMainTitle}>
                感受覺察
              </Text>
              <Text style={styles.questionSubtitle}>
                花幾秒看看現在的心情
              </Text>
            </View>
          </View>

          <ScrollView
            contentContainerStyle={styles.questionScrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            bounces
            scrollEventThrottle={16}
          >
            <Text style={styles.questionLabel}>
              書寫完後,今天的心情是
            </Text>

            <View style={styles.moodTagsContainer}>
              {moodOptions.map((mood, index) => {
                const isSelected =
                  formData.moodEmotions.includes(mood);
                return (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.moodTag,
                      isSelected && styles.moodTagSelected,
                    ]}
                    onPress={() => toggleMood(mood)}
                  >
                    <Text
                      style={[
                        styles.moodTagText,
                        isSelected &&
                          styles.moodTagTextSelected,
                      ]}
                    >
                      {mood}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {showOtherMoodInput && (
              <>
                <Text style={styles.recordPrompt}>記錄下來</Text>
                <TextInput
                  style={styles.recordTextarea}
                  multiline
                  placeholder="寫下這裡好了..."
                  placeholderTextColor="#B0B0B0"
                  value={formData.moodNotes}
                  onChangeText={text =>
                    setFormData(prev => ({
                      ...prev,
                      moodNotes: text,
                    }))
                  }
                  textAlignVertical="top"
                />
              </>
            )}
          </ScrollView>

          <View style={styles.bottomNavigation}>
            <TouchableOpacity
              onPress={handleBack}
              style={styles.navButton}
            >
              <ArrowIcon direction="left" color="#31C6FE" size={24} />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={async () => {
                console.log('保存好事書寫數據:', formData);
                await saveProgress();
                setCurrentPage('streak');
              }}
              style={styles.navButton}
            >
              <ArrowIcon direction="right" color="#31C6FE" size={24} />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );

  // 14. 連續天數完成頁
  const renderStreakPage = () => {
    const streakDays = getStreakDays();
    const rotation = celebrationRotate.interpolate({
      inputRange: [0, 0.25, 0.75, 1, 1.1],
      outputRange: ['0deg', '-10deg', '10deg', '0deg', '0deg'],
    });

    return (
      <View style={styles.streakContainer}>
        <View style={styles.headerContainer}>
          <TouchableOpacity
            onPress={handleHome}
            style={styles.headerHomeButton}
          >
            <View style={styles.homeButtonCircle}>
              <Home size={20} color="#31C6FE" />
            </View>
          </TouchableOpacity>

          <Text style={styles.headerTitle}>好事書寫</Text>
        </View>

        <ScrollView
          contentContainerStyle={styles.streakScrollContent}
          showsVerticalScrollIndicator={false}
          bounces
          scrollEventThrottle={16}
        >
          <Text style={styles.streakTitle}>太棒了!</Text>

          <View style={styles.streakDescription}>
            <Text style={styles.streakDescText}>
              你完成了好事書寫練習
            </Text>
            <Text style={styles.streakDescText}>
              今天也替生活多留下一個亮亮的小片段
            </Text>
          </View>

          <View style={styles.streakCard}>
            <Animated.Text
              style={[
                styles.streakEmoji,
                {
                  transform: [
                    { scale: celebrationScale },
                    { rotate: rotation },
                  ],
                },
              ]}
            >
              🎉
            </Animated.Text>
            <Text style={styles.streakLabel}>
              你已經連續書寫
            </Text>
            <GradientText
              text={`${streakDays} 天`}
              style={styles.streakDays}
            />
          </View>

          <TouchableOpacity
            style={styles.streakButton}
            onPress={handleCompleteJournal}
          >
            <Text style={styles.streakButtonText}>查看日記</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  };

  // ========== 主渲染 ==========
  return (
    <LinearGradient
      colors={['#E8F4F9', '#F0F9FF', '#E0F2FE']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ flex: 1 }}
    >
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" />

        {currentPage === 'welcome' && renderWelcomePage()}
        {currentPage === 'intro' && renderIntroPage()}
        {currentPage === 'question1' && renderQuestion1Page()}
        {currentPage === 'question1b' && renderQuestion1bPage()}
        {currentPage === 'question2' && renderQuestion2Page()}
        {currentPage === 'emotions' && renderEmotionsPage()}
        {currentPage === 'transition' && renderTransitionPage()}
        {currentPage === 'question4' && renderQuestion4Page()}
        {currentPage === 'question4b' && renderQuestion4bPage()}
        {currentPage === 'question5' && renderQuestion5Page()}
        {currentPage === 'completion' && renderCompletionPage()}
        {currentPage === 'positiveFeeling' &&
          renderPositiveFeelingPage()}
        {currentPage === 'mood' && renderMoodPage()}
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

  // ========== 進度條樣式 ==========
  progressBarContainer: {
    width: '100%',
    paddingHorizontal: 0,
    marginBottom: 24,
  },
  progressTrack: {
    position: 'relative',
    width: '100%',
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(49, 198, 254, 0.2)',
    overflow: 'hidden',
  },
  progressFillContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    height: '100%',
    borderRadius: 4,
  },
  progressGradient: {
    width: '100%',
    height: '100%',
  },
  stepCounter: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 8,
  },
  stepText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '400',
  },

  // ========== 漸層文字樣式 ==========
  gradientTextMask: {
    fontSize: 48,
    fontWeight: '400',
    textAlign: 'center',
  },

  // ========== 歡迎頁樣式 ==========
  welcomeContainer: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  welcomeScrollContent: {
    flexGrow: 1,
    paddingBottom: 80,
  },
  welcomeHomeButton: {
    margin: 24,
    marginBottom: 0,
  },
  homeButtonCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: 'rgba(49, 198, 254, 0.3)',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 32,
    elevation: 8,
  },
  welcomeContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  welcomeIconContainer: {
    width: 128,
    height: 128,
    marginBottom: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glowCircle1: {
    position: 'absolute',
    width: 128,
    height: 128,
    borderRadius: 64,
    backgroundColor: 'rgba(49, 198, 254, 0.2)',
  },
  glowCircle2: {
    position: 'absolute',
    width: 128,
    height: 128,
    borderRadius: 64,
    backgroundColor: 'rgba(22, 108, 181, 0.25)',
  },
  welcomeIconCore: {
    width: 128,
    height: 128,
    borderRadius: 64,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: 'rgba(49, 198, 254, 0.2)',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 32,
    elevation: 8,
  },
  welcomeEmoji: {
    fontSize: 50,
  },
  welcomeTitle: {
    fontSize: 36,
    color: '#2F2F2F',
    textAlign: 'center',
    marginBottom: 16,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: '#5F6368',
    textAlign: 'center',
    marginBottom: 48,
  },
  welcomeInfoCards: {
    width: '100%',
    marginBottom: 48,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 24,
    padding: 16,
    marginBottom: 12,
  },
  infoCardEmoji: {
    fontSize: 24,
    marginRight: 16,
  },
  infoCardText: {
    fontSize: 14,
    color: '#4A5568',
    flex: 1,
  },
  welcomeStartButton: {
    width: '100%',
    maxWidth: 400,
    height: 56,
    borderRadius: 28,
    overflow: 'hidden',
  },
  welcomeStartGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  welcomeStartText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '500',
  },

  // ========== 通用頁面樣式 ==========
  pageContainer: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  headerContainer: {
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 16,
  },
  headerHomeButton: {
    marginBottom: 32,
  },
  headerTitle: {
    fontSize: 20,
    textAlign: 'center',
    color: '#2F2F2F',
    marginBottom: 24,
  },

  // ========== 介紹頁樣式 ==========
  introScrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 120,
  },
  introIconContainer: {
    width: 96,
    height: 96,
    marginBottom: 32,
    borderRadius: 48,
    overflow: 'hidden',
  },
  introIconGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  introIconHeart: {
    fontSize: 48,
    color: '#FFFFFF',
  },
  introMainTitle: {
    fontSize: 24,
    textAlign: 'center',
    color: '#2F2F2F',
    marginBottom: 24,
  },
  introDuration: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
  },
  introDurationText: {
    fontSize: 16,
    color: '#5F6368',
  },
  introDescription: {
    alignItems: 'center',
    marginBottom: 48,
  },
  introDescText: {
    fontSize: 16,
    color: '#4A5568',
    textAlign: 'center',
    lineHeight: 28,
  },
  introStartButton: {
    width: '100%',
    maxWidth: 400,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: '#31C6FE',
    backgroundColor: 'transparent',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  introStartButtonText: {
    fontSize: 16,
    color: '#31C6FE',
  },
  introStartArrow: {
    position: 'absolute',
    right: 24,
  },

  // ========== 問題頁樣式 ==========
  questionTitleSection: {
    marginBottom: 24,
  },
  questionMainTitle: {
    fontSize: 24,
    textAlign: 'center',
    color: '#2F2F2F',
    marginBottom: 12,
    lineHeight: 32,
  },
  questionSubtitle: {
    fontSize: 14,
    textAlign: 'center',
    color: '#5F6368',
    lineHeight: 22,
  },
  questionScrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 120,
  },
  questionLabel: {
    fontSize: 14,
    color: '#4A5568',
    marginBottom: 12,
  },
  questionTextarea: {
    width: '100%',
    minHeight: 180,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    padding: 20,
    fontSize: 14,
    color: '#4A5568',
    marginBottom: 24,
    shadowColor: 'rgba(0, 0, 0, 0.1)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 2,
  },

  // 建議提示
  suggestionTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  suggestionIcon: {
    width: 16,
    height: 16,
    marginRight: 8,
    tintColor: '#B0B0B0',
  },
  suggestionIconActive: {
    tintColor: '#31C6FE',
  },
  suggestionText: {
    fontSize: 14,
    color: '#31C6FE',
  },
  suggestionTextInactive: {
    color: '#B0B0B0',
  },
  suggestionBox: {
    backgroundColor: 'rgba(210, 237, 249, 0.6)',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    padding: 24,
    marginBottom: 24,
  },
  suggestionBoxTitle: {
    fontSize: 14,
    color: '#1A2633',
    marginBottom: 12,
  },
  suggestionBoxItem: {
    fontSize: 14,
    color: '#4A5568',
    lineHeight: 24,
    marginBottom: 4,
  },

  // 標籤容器
  emotionTagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  emotionTag: {
    height: 44,
    paddingHorizontal: 20,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: '#31C6FE',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emotionTagSelected: {
    backgroundColor: '#31C6FE',
    borderColor: '#31C6FE',
  },
  emotionTagText: {
    fontSize: 14,
    color: '#31C6FE',
  },
  emotionTagTextSelected: {
    color: '#FFFFFF',
  },

  actionTagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  actionTag: {
    height: 44,
    paddingHorizontal: 20,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: '#31C6FE',
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionTagSelected: {
    backgroundColor: '#31C6FE',
    borderColor: '#31C6FE',
  },
  actionTagText: {
    fontSize: 14,
    color: '#31C6FE',
  },
  actionTagTextSelected: {
    color: '#FFFFFF',
  },
  otherActionButtonContainer: {
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  otherActionButton: {
    alignSelf: 'flex-start',
  },

  moodTagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  moodTag: {
    height: 44,
    paddingHorizontal: 20,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: '#31C6FE',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  moodTagSelected: {
    backgroundColor: '#31C6FE',
    borderColor: '#31C6FE',
  },
  moodTagText: {
    fontSize: 14,
    color: '#31C6FE',
  },
  moodTagTextSelected: {
    color: '#FFFFFF',
  },

  // 記錄輸入框
  recordPrompt: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 8,
    marginTop: 16,
  },
  recordTextarea: {
    width: '100%',
    minHeight: 120,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    padding: 20,
    fontSize: 14,
    color: '#4A5568',
    marginBottom: 24,
  },

  // ========== 過渡頁樣式 ==========
  transitionContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingBottom: 120,
  },
  transitionEmoji: {
    fontSize: 70,
    marginBottom: 32,
  },
  transitionMainTitle: {
    fontSize: 24,
    textAlign: 'center',
    color: '#2F2F2F',
    marginBottom: 24,
    lineHeight: 34,
  },
  transitionTextBlock: {
    alignItems: 'center',
  },
  transitionBigText: {
    fontSize: 20,
    color: '#2F2F2F',
    marginBottom: 12,
  },
  transitionSmallText: {
    fontSize: 14,
    color: '#5F6368',
    textAlign: 'center',
    lineHeight: 22,
  },

  // ========== 完成頁樣式 ==========
  completionContainer: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  completionScrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 80,
  },
  completionTitle: {
    fontSize: 36,
    color: '#2F2F2F',
    textAlign: 'center',
    marginBottom: 32,
  },
  completionDescription: {
    alignItems: 'center',
    marginBottom: 64,
  },
  completionDescText: {
    fontSize: 16,
    color: '#4A5568',
    textAlign: 'center',
    lineHeight: 28,
  },
  completionPrimaryButton: {
    width: '100%',
    maxWidth: 400,
    height: 56,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: 'rgba(0, 0, 0, 0.1)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 3,
  },
  completionPrimaryText: {
    fontSize: 16,
    color: '#31C6FE',
  },
  completionSecondaryButton: {
    width: '100%',
    maxWidth: 400,
    paddingVertical: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 48,
  },
  completionSecondaryText: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  completionBottomMessage: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 24,
  },
  decorativeSparkle1: {
    position: 'absolute',
    top: 80,
    left: 40,
    fontSize: 48,
    zIndex: 1,
  },
  decorativeSparkle2: {
    position: 'absolute',
    top: 128,
    right: 64,
    fontSize: 40,
    zIndex: 1,
  },
  decorativeSparkle3: {
    position: 'absolute',
    bottom: 260,
    left: 80,
    fontSize: 32,
    zIndex: 1,
  },

  // ========== 感受覺察頁樣式 ==========
  feelingTitleSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  sliderCard: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 24,
    padding: 24,
    marginBottom: 32,
    shadowColor: 'rgba(0, 0, 0, 0.1)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 3,
  },
  sliderCardTitle: {
    fontSize: 16,
    color: '#2F2F2F',
    marginBottom: 24,
    textAlign: 'center',
  },
  sliderScoreDisplay: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
    marginBottom: 24,
  },
  sliderScoreNumber: {
    fontSize: 48,
    fontWeight: '600',
  },
  sliderScoreTotal: {
    fontSize: 18,
    color: '#9CA3AF',
    marginLeft: 4,
  },
  sliderMarkersTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    paddingHorizontal: 2,
  },
  sliderMarkerItem: {
    alignItems: 'center',
    flex: 1,
  },
  sliderMarkerTextTop: {
    fontSize: 10,
    color: '#9CA3AF',
    marginBottom: 4,
  },
  sliderMarkerLine: {
    width: 2,
    height: 8,
    backgroundColor: '#D1D5DB',
  },
  sliderMarkerLineActive: {
    backgroundColor: '#31C6FE',
    height: 10,
    width: 3,
  },
  sliderMarkerTextActive: {
    color: '#31C6FE',
    fontWeight: '600',
  },
  sliderContainerNew: {
    position: 'relative',
    height: 12,
    marginBottom: 16,
  },
  sliderTrackBackground: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: '50%',
    height: 12,
    backgroundColor: '#E5E7EB',
    borderRadius: 6,
    transform: [{ translateY: -6 }],
    overflow: 'hidden',
  },
  sliderTrackFill: {
    height: '100%',
    borderRadius: 6,
  },
  sliderOverlay: {
    width: '100%',
    height: 12,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sliderLabelTextBlack: {
    fontSize: 12,
    color: '#1F2937',
  },

  // ========== 連續天數頁樣式 ==========
  streakContainer: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  streakScrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 0,
    paddingBottom: 80,
  },
  streakTitle: {
    fontSize: 36,
    color: '#2F2F2F',
    textAlign: 'center',
    marginBottom: 14,
  },
  streakDescription: {
    alignItems: 'center',
    marginBottom: 48,
  },
  streakDescText: {
    fontSize: 16,
    color: '#4A5568',
    textAlign: 'center',
    lineHeight: 28,
  },
  streakCard: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 24,
    padding: 40,
    alignItems: 'center',
    marginBottom: 32,
  },
  streakEmoji: {
    fontSize: 60,
    marginBottom: 24,
  },
  streakLabel: {
    fontSize: 14,
    color: '#4A5568',
    marginBottom: 12,
  },
  streakDays: {
    fontSize: 48,
    fontWeight: '600',
  },
  streakButton: {
    width: '100%',
    maxWidth: 400,
    height: 62,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 31,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: 'rgba(0, 0, 0, 0.1)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 3,
  },
  streakButtonText: {
    fontSize: 18,
    color: '#31C6FE',
  },

  // ========== 底部導航樣式 ==========
  bottomNavigation: {
    position: 'absolute',
    bottom: 32,
    left: 24,
    right: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bottomNavigationRight: {
    position: 'absolute',
    bottom: 32,
    right: 24,
  },
  navButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: 'rgba(49, 198, 254, 0.3)',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 32,
    elevation: 8,
  },
});