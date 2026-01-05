// ==========================================
// 檔案名稱: EmotionThermometer.js
// 心情溫度計練習 - 完整流程
// 版本: V1.1 - 修復 UI 裝飾和文字置中
// ==========================================

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  Modal,
  Animated,
  Linking,
  Platform,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  X, 
  HelpCircle, 
  Activity,
  ChevronLeft,
  ChevronRight,
  Wind,
  Brain,
  Phone,
  MapPin,
  HeartHandshake,
  Home,
  ArrowRight,
  Sparkles,
} from 'lucide-react-native';
import * as Location from 'expo-location';
import ApiService from '../../../api';

// ==================== 常數定義 ====================
const QUESTIONS = [
  { id: 0, title: "睡眠困難", text: "睡眠困難，譬如難以入睡、易醒或早醒" },
  { id: 1, title: "緊張不安", text: "感覺緊張不安" },
  { id: 2, title: "容易動怒", text: "覺得容易動怒" },
  { id: 3, title: "憂鬱低落", text: "感覺憂鬱、心情低落" },
  { id: 4, title: "自卑感", text: "覺得比不上別人" },
  { id: 5, title: "自我傷害", text: "有自殺的想法", isRisk: true },
];

const RATING_OPTIONS = [
  { value: 0, label: "完全沒有", emoji: "😊", color: "#10b981" },
  { value: 1, label: "輕微", emoji: "😐", color: "#0ea5e9" },
  { value: 2, label: "中等程度", emoji: "😟", color: "#f59e0b" },
  { value: 3, label: "厲害", emoji: "😣", color: "#f97316" },
  { value: 4, label: "非常厲害", emoji: "😫", color: "#ef4444" },
];

// ==================== 主組件 ====================
const EmotionThermometer = ({ navigation, route }) => {
  const [currentScreen, setCurrentScreen] = useState('intro');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [practiceId, setPracticeId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    StatusBar.setBarStyle('dark-content');
    startPractice();
    
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, []);

  useEffect(() => {
    if (currentScreen !== 'intro') {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [currentScreen, currentQuestionIndex]);

  const startPractice = async () => {
    try {
      const response = await ApiService.startPractice('心情溫度計');
      const id = response.practiceId || response.practice_id;
        if (response.success && id) {
        setPracticeId(id);
        console.log('✅ 練習已開始, ID:', id);
        console.log('📋 總頁數:', response.totalPages || response.total_pages);
        } else {
        console.error('❌ 無法獲取練習 ID:', response);
        }
    } catch (error) {
      console.error('❌ 開始練習失敗:', error);
    }
  };

  const completePractice = async (formData) => {
    if (!practiceId) {
      console.warn('⚠️ 無練習 ID');
      return;
    }

    try {
      setIsLoading(true);
      const response = await ApiService.completePractice(practiceId, {
        duration_seconds: 60,
        form_data: formData,
      });

      if (response.success) {
        console.log('✅ 練習完成');
        if (route.params?.onPracticeComplete) {
          route.params.onPracticeComplete();
        }
      }
    } catch (error) {
      console.error('❌ 完成練習失敗:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    if (currentScreen === 'intro') {
      navigation.goBack();
    } else if (currentScreen === 'questionnaire' && currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    } else if (currentScreen === 'questionnaire') {
      setCurrentScreen('intro');
    }
  };

  const handleHomeNavigation = () => {
    navigation.navigate('MainTabs', { screen: 'Home' });
  };

  const handleSelectAnswer = (score) => {
    const currentQuestion = QUESTIONS[currentQuestionIndex];
    console.log(`📝 [問卷] 第 ${currentQuestionIndex + 1} 題 (ID: ${currentQuestion.id}) 選擇答案: ${score}`);
    
    const updatedAnswers = { ...answers, [currentQuestion.id]: score };
    console.log('📝 [問卷] 更新後的 answers:', updatedAnswers);
    
    setAnswers(updatedAnswers);
    
    // ⭐ 第六題（風險題）不自動跳轉，需要手動點擊「下一步」
    if (currentQuestion.isRisk) {
      console.log('⚠️  第六題已選擇，等待使用者手動確認');
      return;
    }
    
    // 其他題目（第 1-5 題）保持自動跳轉
    setTimeout(() => {
      if (currentQuestionIndex < QUESTIONS.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
      } else {
        handleQuestionnaireComplete(updatedAnswers);
      }
    }, 400);
  };

  const handleQuestionnaireComplete = (finalAnswers = answers) => {
    const scores = QUESTIONS.map(q => finalAnswers[q.id] || 0);
    const t1_t5_sum = scores.slice(0, 5).reduce((a, b) => a + b, 0);
    const riskScore = scores[5]; // 第六題分數

    console.log('📊 [心情溫度計] 問卷完成');
    console.log('📋 完整 answers 物件:', finalAnswers);
    console.log('📋 所有題目答案陣列:', scores);
    console.log('📋 前五題答案:', scores.slice(0, 5));
    console.log('📋 前五題總分 (Q1-Q5):', t1_t5_sum);
    console.log('⚠️  第六題分數 (Q6) - finalAnswers[5]:', finalAnswers[5]);
    console.log('⚠️  第六題分數 (Q6) - scores[5]:', riskScore);

    const formData = {
      scores,
      totalScore: t1_t5_sum,
      riskScore,
      timestamp: Date.now(),
    };

    // 邏輯判斷：
    // 1. 第六題 >= 2 分 → 安全優先頁面
    // 2. 前五題總分 >= 15 → 安全優先頁面
    // 3. 其他情況 → 結果頁面（會根據 0-5 或 6-14 分顯示不同內容）
    
    if (riskScore >= 2) {
      console.log('🚨 觸發條件：第六題 >= 2 分，跳轉安全頁面');
      setCurrentScreen('safety');
      completePractice({ ...formData, result: 'safety' });
    } else if (t1_t5_sum >= 15) {
      console.log('🚨 觸發條件：前五題總分 >= 15，跳轉安全頁面');
      setCurrentScreen('safety');
      completePractice({ ...formData, result: 'safety' });
    } else {
      console.log('✅ 跳轉結果頁面（總分:', t1_t5_sum, '）');
      setCurrentScreen('result');
      completePractice({ ...formData, result: 'normal' });
    }
  };

  const getTotalScore = () => {
    const scores = QUESTIONS.slice(0, 5).map(q => answers[q.id] || 0);
    return scores.reduce((a, b) => a + b, 0);
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'intro':
        return <IntroScreen />;
      case 'questionnaire':
        return <QuestionnaireScreen />;
      case 'result':
        return <ResultScreen />;
      case 'safety':
        return <SafetyScreen />;
      default:
        return <IntroScreen />;
    }
  };

  const IntroScreen = () => (
    <LinearGradient
      colors={['#f0f9ff', '#e0f2fe']}
      style={styles.container}
    >
      <TouchableOpacity style={styles.closeButton} onPress={handleBack}>
        <View style={styles.closeButtonInner}>
          <X size={20} color="#64748b" />
        </View>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.infoButton} 
        onPress={() => setShowInfoModal(true)}
      >
        <HelpCircle size={16} color="#0ea5e9" />
        <Text style={styles.infoButtonText}>為什麼要做這個練習?</Text>
      </TouchableOpacity>

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.iconContainer}>
          <Activity size={64} color="#0ea5e9" strokeWidth={2} />
        </View>

        <Text style={styles.title}>情緒檢測</Text>
        <Text style={styles.subtitle}>1分鐘，聽聽心裡的聲音</Text>

        <View style={styles.instructionCard}>
          <Text style={styles.instructionText}>
            請回想在最近一星期中(包括今天)，以下問題使您感到困擾的程度，根據你的真實感受進行評分。
          </Text>
          <Text style={styles.instructionNote}>
            * 這不是診斷，而是自我照顧的第一步。
          </Text>
        </View>

        <TouchableOpacity 
            style={styles.startButton} 
            onPress={() => setCurrentScreen('questionnaire')}
            >
            <LinearGradient
                colors={['#0ea5e9', '#0ea5e9']}
                style={styles.startButtonGradient}
            >
                <Text style={styles.startButtonText}>開始檢測</Text>
            </LinearGradient>
        </TouchableOpacity>
      </ScrollView>

      <InfoModal />
    </LinearGradient>
  );

  const QuestionnaireScreen = () => {
    const currentQuestion = QUESTIONS[currentQuestionIndex];
    const isRiskQuestion = currentQuestion.isRisk;
    const currentAnswer = answers[currentQuestion.id];

    return (
      <View style={[
        styles.container, 
        { backgroundColor: isRiskQuestion ? '#1e293b' : '#f8fafc' }
      ]}>
        <View style={styles.questionHeader}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <ChevronLeft 
              size={24} 
              color={isRiskQuestion ? '#fff' : '#94a3b8'} 
            />
          </TouchableOpacity>
          
          <Text style={[
            styles.questionProgress,
            { color: isRiskQuestion ? '#94a3b8' : '#94a3b8' }
          ]}>
            {currentQuestionIndex + 1} / {QUESTIONS.length}
          </Text>

          <View style={{ width: 40 }} />
        </View>

        <ScrollView 
          contentContainerStyle={styles.questionScrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View style={{ opacity: fadeAnim }}>
            <View style={styles.questionTitleContainer}>
              <View style={[
                styles.questionTag,
                { 
                  backgroundColor: isRiskQuestion ? 'rgba(244, 63, 94, 0.2)' : '#eff6ff',
                }
              ]}>
                {isRiskQuestion && <HeartHandshake size={12} color="#fecaca" />}
                <Text style={[
                  styles.questionTagText,
                  { color: isRiskQuestion ? '#fecaca' : '#0ea5e9' }
                ]}>
                  {currentQuestion.title}
                </Text>
              </View>

              <Text style={[
                styles.questionText,
                { color: isRiskQuestion ? '#fff' : '#1e293b' }
              ]}>
                {currentQuestion.text}
              </Text>
            </View>

            <View style={styles.optionsContainer}>
              {RATING_OPTIONS.map((option) => {
                const isSelected = currentAnswer === option.value;
                
                return (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.optionButton,
                      {
                        backgroundColor: isSelected 
                          ? getOptionBackgroundColor(option.value)
                          : isRiskQuestion ? 'rgba(255, 255, 255, 0.05)' : '#fff',
                        borderColor: isSelected 
                          ? option.color 
                          : isRiskQuestion ? '#334155' : '#e2e8f0',
                      }
                    ]}
                    onPress={() => handleSelectAnswer(option.value)}
                  >
                    <Text style={styles.optionEmoji}>{option.emoji}</Text>
                    <Text style={[
                      styles.optionLabel,
                      { 
                        color: isSelected 
                          ? '#1e293b' 
                          : isRiskQuestion ? '#cbd5e1' : '#64748b' 
                      }
                    ]}>
                      {option.label}
                    </Text>
                    <View style={[
                      styles.optionIndicator,
                      {
                        borderColor: isSelected ? option.color : isRiskQuestion ? '#475569' : '#cbd5e1',
                        backgroundColor: isSelected ? option.color : 'transparent',
                      }
                    ]}>
                      {isSelected && <View style={styles.optionIndicatorDot} />}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </Animated.View>
        </ScrollView>

        {currentAnswer !== undefined && (
          <TouchableOpacity 
            style={[
              styles.nextButton,
              { backgroundColor: isRiskQuestion ? '#fff' : '#0ea5e9' }
            ]}
            onPress={() => {
              if (currentQuestionIndex < QUESTIONS.length - 1) {
                setCurrentQuestionIndex(prev => prev + 1);
              } else {
                handleQuestionnaireComplete();
              }
            }}
          >
            <ChevronRight 
              size={24} 
              color={isRiskQuestion ? '#1e293b' : '#fff'} 
            />
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const ResultScreen = () => {
    const totalScore = getTotalScore();
    
    // 分數區間判斷
    // 0-5: 低分（綠色、狀態不錯）
    // 6-14: 中分（黃色、有些壓力）
    // 15+: 高分（應該已被導向 SafetyScreen，但這裡也做判斷以防萬一）
    const isLowScore = totalScore <= 5;
    const isMediumScore = totalScore >= 6 && totalScore <= 14;

    console.log('📊 [結果頁面] 總分:', totalScore, '| 低分:', isLowScore, '| 中分:', isMediumScore);

    const theme = isLowScore 
      ? {
          gradient: ['#f0f9ff', '#ccfbf1'],
          textMain: '#134e4a',
          textSub: '#0d9488',
          highlight: '#14b8a6',
          scoreBg: '#f0fdfa',
          mascot: '🌿',
        }
      : {
          gradient: ['#f0f9ff', '#fff7ed'],
          textMain: '#1e293b',
          textSub: '#64748b',
          highlight: '#0ea5e9',
          scoreBg: '#fdfbf4ff',
          mascot: '🌤️',
        };

    return (
      <LinearGradient colors={theme.gradient} style={styles.container}>
        <ScrollView 
          contentContainerStyle={styles.resultScrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.resultCard}>
            <Text style={styles.resultHeader}>檢測結果</Text>

            <View style={[styles.scoreCircle, { backgroundColor: theme.scoreBg }]}>
              <Text style={[styles.scoreNumber, { color: theme.textMain }]}>
                {totalScore}
              </Text>
              <Text style={[styles.scoreTotal, { color: theme.textSub }]}>
                總分 20
              </Text>
            </View>

            <View style={styles.resultTextContainer}>
              <View style={styles.resultTitleRow}>
                <Text style={styles.resultMascot}>{theme.mascot}</Text>
                <Text style={[styles.resultTitle, { color: theme.textMain }]}>
                  {isLowScore ? '你的狀態不錯' : '辛苦了，\n最近似乎有些壓力'}
                </Text>
              </View>
              <Text style={[styles.resultSubtitle, { color: theme.highlight }]}>
                {isLowScore ? '做點心理肌力訓練吧!' : '讓專業資源來陪你'}
              </Text>
              <Text style={[styles.resultDescription, { color: theme.textSub }]}>
                {isLowScore 
                  ? '目前的心理能量相當充足，這很棒!趁現在練習覺察與呼吸，能讓內在力量更穩固。'
                  : '承受這些情緒並不容易。請記得，\n你不必一個人面對，\n適時尋求協助是勇敢的表現。'
                }
              </Text>
            </View>

            <View style={styles.recommendationsContainer}>
              <Text style={styles.recommendationsTitle}>為你推薦</Text>
              
              {isLowScore ? (
                <RecommendationCard
                  icon={Wind}
                  title="呼吸練習"
                  description="平衡自律神經"
                  color="#14b8a6"
                  bgColor="#f0fdfa"
                  onPress={() => {
                    navigation.navigate('PracticeNavigator', {
                      practiceType: '呼吸穩定力練習',
                    });
                  }}
                />
              ) : (
                <>
                  <RecommendationCard
                    icon={Wind}
                    title="呼吸練習"
                    description="平靜放鬆身心"
                    color="#0ea5e9"
                    bgColor="#eff6ff"
                    onPress={() => {
                      navigation.navigate('PracticeNavigator', {
                        practiceType: '呼吸穩定力練習',
                      });
                    }}
                  />
                  <RecommendationCard
                    icon={Brain}
                    title="思維調節"
                    description="釐清壓力來源"
                    color="#f59e0b"
                    bgColor="#fffbeb"
                    onPress={() => {
                      navigation.navigate('PracticeNavigator', {
                        practiceType: '思維調節練習',
                      });
                    }}
                  />
                  <RecommendationCard
                    icon={HeartHandshake}
                    title="安排專業支持"
                    description="尋求諮商協助"
                    color="#ef4444"
                    bgColor="#fef2f2"
                    onPress={() => {
                      Alert.alert(
                        '專業支持資源',
                        '建議您考慮尋求專業心理諮商協助',
                        [{ text: '了解', style: 'default' }]
                      );
                    }}
                  />
                </>
              )}
            </View>

            <TouchableOpacity 
              style={styles.completeButton}
              onPress={handleHomeNavigation}
            >
                <LinearGradient
                    colors={
                        isLowScore
                        ? ['#0d9488', '#0d9488']
                        : ['#0ea5e9', '#0ea5e9']
                    }
                    style={styles.completeButtonGradient}
                    >
                    <Text style={styles.completeButtonText}>回到首頁</Text>
                </LinearGradient>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </LinearGradient>
    );
  };

  const SafetyScreen = () => {
    const handleCall = (number) => {
      const url = 'tel:' + number;
      Linking.canOpenURL(url)
        .then((supported) => {
          if (supported) {
            return Linking.openURL(url);
          } else {
            Alert.alert('無法撥號', '您的裝置不支援撥號功能');
          }
        })
        .catch((err) => console.error('撥號錯誤:', err));
    };

    const handleMapSearch = async () => {
        // ✅ 步驟 1：請求定位權限
        Alert.alert(
            '需要您的位置',
            '我們需要取得您的位置以搜尋附近的心理諮商所',
            [
            {
                text: '取消',
                style: 'cancel',
            },
            {
                text: '允許',
                onPress: async () => {
                try {
                    // ✅ 步驟 2：嘗試取得當前位置
                    if (Platform.OS === 'web') {
                    // Web 版本：使用瀏覽器 Geolocation API
                    if (navigator.geolocation) {
                        navigator.geolocation.getCurrentPosition(
                        (position) => {
                            const { latitude, longitude } = position.coords;
                            openGoogleMaps(latitude, longitude);
                        },
                        (error) => {
                            console.error('定位錯誤:', error);
                            // 定位失敗，使用預設搜尋
                            openGoogleMapsWithoutLocation();
                        }
                        );
                    } else {
                        // 瀏覽器不支援定位
                        openGoogleMapsWithoutLocation();
                    }
                    } else {
                    // 暫時使用不帶定位的搜尋
                    openGoogleMapsWithoutLocation();
                    const { status } = await Location.requestForegroundPermissionsAsync();
                    if (status === 'granted') {
                        const location = await Location.getCurrentPositionAsync({});
                        const { latitude, longitude } = location.coords;
                        openGoogleMaps(latitude, longitude);
                    } else {
                        openGoogleMapsWithoutLocation();
                    }
                    }
                } catch (error) {
                    console.error('取得位置失敗:', error);
                    openGoogleMapsWithoutLocation();
                }
                },
            },
            ]
        );
        };

        // ✅ 輔助函數：使用定位開啟 Google Maps
        const openGoogleMaps = async (latitude, longitude) => {
        try {
            const searchQuery = '心理諮商所';
            let url;
            
            if (Platform.OS === 'ios') {
                // iOS: 直接使用 Google Maps 網頁版
                url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(searchQuery)}&center=${latitude},${longitude}`;
            } else {
                // Android: 使用 geo URI scheme
                url = `geo:${latitude},${longitude}?q=${encodeURIComponent(searchQuery)}`;
            }
            
            console.log('🗺️ 開啟 Google Maps:', url);
            await Linking.openURL(url);
        } catch (err) {
            console.error('開啟地圖錯誤:', err);
            // 最終備用方案
            try {
                const fallbackUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent('心理諮商所')}`;
                await Linking.openURL(fallbackUrl);
            } catch (backupError) {
                Alert.alert('錯誤', '無法開啟地圖應用程式');
            }
        }
        };

        // ✅ 輔助函數：不使用定位開啟 Google Maps
        const openGoogleMapsWithoutLocation = async () => {
        try {
            const searchQuery = '心理諮商所';
            // 統一使用 Google Maps 網頁版
            const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(searchQuery)}`;
            
            console.log('🗺️ 開啟 Google Maps（無定位）:', url);
            await Linking.openURL(url);
        } catch (err) {
            console.error('開啟地圖錯誤:', err);
            Alert.alert('錯誤', '無法開啟地圖應用程式');
        }
        };

    return (
      <View style={styles.safetyContainer}>

        <ScrollView 
          contentContainerStyle={styles.safetyScrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.safetyIconContainer}>
            <View style={styles.safetyIconCircle}>
              <HeartHandshake size={40} color="#bfdbfe" strokeWidth={2} />
            </View>
          </View>

          <Text style={styles.safetyTitle}>此刻，你的安全{'\n'}是最重要的</Text>
          <Text style={styles.safetySubtitle}>
            你不需一個人撐過去。{'\n'}請讓我們陪你，試著與以下資源聯繫。
          </Text>

          <View style={styles.safetyActionsContainer}>
            <SafetyActionCard
              icon={Phone}
              title="撥打安心專線 (1925)"
              subtitle="24小時 免付費心理諮詢"
              isHighlight
              onPress={() => handleCall('1925')}
            />
            
            <SafetyActionCard
              icon={Phone}
              title="撥打生命線 (1995)"
              subtitle="24小時 協談專線"
              onPress={() => handleCall('1995')}
            />
            
            <SafetyActionCard
              icon={MapPin}
              title="查詢就近急診"
              subtitle="尋求專業醫療協助"
              onPress={handleMapSearch}
            />
            
            <SafetyActionCard
              icon={HeartHandshake}
              title="聯絡信任的人"
              subtitle="找一位朋友或家人說說話"
              isInfo
            />
          </View>

          <Text style={styles.safetyNote}>
            本檢測非醫療診斷，緊急狀況請速就醫。{'\n'}
            這些資源全天候為您提供專業協助。
          </Text>

          <TouchableOpacity 
            style={styles.safetyHomeButton}
            onPress={handleHomeNavigation}
          >
            <Home size={16} color="#bfdbfe" />
            <Text style={styles.safetyHomeButtonText}>回到首頁</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  };

  const InfoModal = () => (
    <Modal
      visible={showInfoModal}
      transparent
      animationType="fade"
      onRequestClose={() => setShowInfoModal(false)}
    >
      <View style={styles.modalOverlay}>
        <TouchableOpacity 
          style={styles.modalBackdrop} 
          activeOpacity={1}
          onPress={() => setShowInfoModal(false)}
        />
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>為什麼要做這個?</Text>
          <Text style={styles.modalText}>
            心情溫度計是大量用於醫院與社區的心理健康篩檢工具「簡式症狀量表」(Brief Symptom Rating Scale)，因為操作簡單、信效度良好，現在也常被用作大眾自我檢視情緒狀態的重要工具。
            {'\n\n'}
            透過定期追蹤，你可以更敏銳地覺察情緒變化，並在需要時及時採取行動，照顧自己的心理健康。
          </Text>
          <TouchableOpacity 
            style={styles.modalButton}
            onPress={() => setShowInfoModal(false)}
          >
            <Text style={styles.modalButtonText}>了解了</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  const RecommendationCard = ({ icon: Icon, title, description, color, bgColor, onPress }) => (
    <TouchableOpacity style={styles.recommendationCard} onPress={onPress}>
      <View style={[styles.recommendationIcon, { backgroundColor: bgColor }]}>
        <Icon size={20} color={color} />
      </View>
      <View style={styles.recommendationTextContainer}>
        <Text style={styles.recommendationTitle}>{title}</Text>
        <Text style={styles.recommendationDescription}>{description}</Text>
      </View>
      <View style={styles.recommendationArrow}>
        <ArrowRight size={16} color="#cbd5e1" />
      </View>
    </TouchableOpacity>
  );

  const SafetyActionCard = ({ icon: Icon, title, subtitle, onPress, isHighlight, isInfo }) => (
    <TouchableOpacity 
      style={[
        styles.safetyActionCard,
        isHighlight && styles.safetyActionCardHighlight,
        isInfo && styles.safetyActionCardInfo,
      ]}
      onPress={onPress}
      disabled={isInfo}
    >
      <View style={[
        styles.safetyActionIcon,
        isHighlight && styles.safetyActionIconHighlight,
      ]}>
        <Icon size={24} color={isHighlight ? '#f97316' : '#60a5fa'} />
      </View>
      <View style={styles.safetyActionTextContainer}>
        <Text style={[
          styles.safetyActionTitle,
          isHighlight && styles.safetyActionTitleHighlight,
        ]}>
          {title}
        </Text>
        <Text style={[
          styles.safetyActionSubtitle,
          isHighlight && styles.safetyActionSubtitleHighlight,
        ]}>
          {subtitle}
        </Text>
      </View>
      {isHighlight && (
        <View style={styles.safetyActionPulse}>
          <View style={styles.safetyActionPulseOuter} />
          <View style={styles.safetyActionPulseInner} />
        </View>
      )}
    </TouchableOpacity>
  );

  return renderScreen();
};

const getOptionBackgroundColor = (value) => {
  const colors = {
    0: '#d1fae5',
    1: '#dbeafe',
    2: '#fef3c7',
    3: '#fed7aa',
    4: '#fecaca',
  };
  return colors[value] || '#fff';
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 60,
  },

  closeButton: {
    position: 'absolute',
    top: 48,
    left: 24,
    zIndex: 20,
  },
  closeButtonInner: {
    width: 40,
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: 20,
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
    color: '#0ea5e9',
    fontSize: 14,
    fontWeight: '700',
  },

  iconContainer: {
    marginBottom: 32,
    alignItems: 'center',
  },

  title: {
    fontSize: 30,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '500',
    color: '#64748b',
    marginBottom: 40,
    textAlign: 'center',
  },

  instructionCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 24,
    marginBottom: 32,
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  instructionText: {
    fontSize: 15,
    color: '#334155',
    lineHeight: 24,
    fontWeight: '500',
    marginBottom: 16,
    textAlign: 'center',
  },
  instructionNote: {
    fontSize: 12,
    color: '#0ea5e9',
    fontWeight: '500',
    textAlign: 'center',
  },

  startButton: {
    width: '100%',
    borderRadius: 25,
    overflow: 'hidden',
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  startButtonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  startButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },

  questionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 48,
    paddingBottom: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  questionProgress: {
    fontSize: 14,
    fontWeight: '500',
  },

  questionScrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
  },

  questionTitleContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  questionTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 16,
  },
  questionTagText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  questionText: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 32,
  },

  optionsContainer: {
    gap: 12,
    paddingBottom: 32,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  optionEmoji: {
    fontSize: 24,
    marginRight: 16,
  },
  optionLabel: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
  },
  optionIndicator: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionIndicatorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#fff',
  },

  nextButton: {
    position: 'absolute',
    bottom: 32,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },

  resultScrollContent: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingVertical: 24,
    justifyContent: 'center',
  },
  resultCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 40,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  resultHeader: {
    fontSize: 16,
    fontWeight: '700',
    color: '#64748b',
    marginBottom: 32,
    letterSpacing: 1,
  },

  scoreCircle: {
    width: 128,
    height: 128,
    borderRadius: 64,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  scoreNumber: {
    fontSize: 48,
    fontWeight: '700',
  },
  scoreTotal: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 4,
  },

  resultTextContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  resultTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  resultMascot: {
    fontSize: 24,
  },
  resultTitle: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
  },
  resultSubtitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
  },
  resultDescription: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 8,
  },

  recommendationsContainer: {
    width: '100%',
    marginBottom: 32,
  },
  recommendationsTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#94a3b8',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  recommendationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    overflow: 'hidden',
  },
  recommendationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    overflow: 'hidden',
  },
  recommendationTextContainer: {
    flex: 1,
  },
  recommendationTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 2,
  },
  recommendationDescription: {
    fontSize: 12,
    color: '#94a3b8',
  },
  recommendationArrow: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },

  completeButton: {
    width: '100%',
    borderRadius: 25,
    overflow: 'hidden',
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  completeButtonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  completeButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },

  safetyContainer: {
    flex: 1,
    backgroundColor: '#1e3a8a',
  },

  safetyScrollContent: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingTop: 64,
    paddingBottom: 32,
  },

  safetyIconContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  safetyIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },

  safetyTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 32,
    letterSpacing: 0.5,
  },
  safetySubtitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#bfdbfe',
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 24,
    opacity: 0.9,
  },

  safetyActionsContainer: {
    gap: 16,
    marginBottom: 32,
  },
  safetyActionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#172554',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)',
  },
  safetyActionCardHighlight: {
    backgroundColor: '#fff7ed',
    borderWidth: 2,
    borderColor: '#fed7aa',
  },
  safetyActionCardInfo: {
    opacity: 0.7,
  },
  safetyActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: 'rgba(59, 130, 246, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 20,
  },
  safetyActionIconHighlight: {
    backgroundColor: '#fed7aa',
  },
  safetyActionTextContainer: {
    flex: 1,
  },
  safetyActionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#dbeafe',
    marginBottom: 4,
  },
  safetyActionTitleHighlight: {
    color: '#1e3a8a',
  },
  safetyActionSubtitle: {
    fontSize: 12,
    color: '#93c5fd',
    opacity: 0.7,
  },
  safetyActionSubtitleHighlight: {
    color: '#64748b',
  },
  safetyActionPulse: {
    position: 'absolute',
    right: 24,
    width: 12,
    height: 12,
  },
  safetyActionPulseOuter: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#f97316',
    opacity: 0.75,
  },
  safetyActionPulseInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#f97316',
  },

  safetyNote: {
    fontSize: 12,
    color: 'rgba(191, 219, 254, 0.6)',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 32,
    paddingHorizontal: 24,
  },

  safetyHomeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignSelf: 'center',
  },
  safetyHomeButtonText: {
    fontSize: 14,
    color: '#bfdbfe',
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBackdrop: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 32,
    marginHorizontal: 24,
    maxWidth: 360,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalText: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 22,
    marginBottom: 24,
  },
  modalButton: {
    backgroundColor: '#0ea5e9',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});

export default EmotionThermometer;