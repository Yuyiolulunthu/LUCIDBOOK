// ==========================================
// 檔案名稱: src/screens/home/HomeScreen.js
// 首頁畫面 - 串接後端統計版
// ==========================================

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Dimensions,
  StatusBar,
  Alert,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import MaskedView from '@react-native-masked-view/masked-view';
import {
  Flame,
  Wind,
  PenLine,
  Check,
  Sparkles,
  Clock,
} from 'lucide-react-native';
import ApiService from '../../../api';
import BottomNavigation from '../../navigation/BottomNavigation';
import AppHeader from '../../navigation/AppHeader';

const { width } = Dimensions.get('window');

const HomeScreen = ({ navigation }) => {
  // ========== 狀態管理 ==========
  const [selectedMood, setSelectedMood] = useState(null);
  const [todayMoodRecord, setTodayMoodRecord] = useState(null);
  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [todayPracticeStatus, setTodayPracticeStatus] = useState({});
  const [selectedPractice, setSelectedPractice] = useState('breathing');
  const [selectedCategory, setSelectedCategory] = useState('employee');

  // 🔹 首頁統計：心情連續天數 / 總天數
  const [moodStats, setMoodStats] = useState({
    consecutiveDays: 0,
    totalDays: 0,
  });

  // 🔹 首頁統計：每個練習的月累計 / 週進度
  const [practiceStats, setPracticeStats] = useState({
    breathing: {
      streakDays: 0,
      monthlyTotal: 0,
      weeklyCheckIns: Array(7).fill(false),
    },
    goodthings: {
      streakDays: 0,
      monthlyTotal: 0,
      weeklyCheckIns: Array(7).fill(false),
    },
  });

  // ⚠️ 這兩個要跟你 MySQL practice_type 存的字串一致
  const PRACTICE_TYPE_BREATHING = 'breathing';
  const PRACTICE_TYPE_GOODTHINGS = 'goodthings';

  // ========== 資料定義 ==========

  // 情緒選項 - 使用正確的顏色
  const emotionCards = [
    {
      id: 'happy',
      label: '開心',
      icon: '☀️',
      color: '#FFBC42',
      particleType: 'up',
      delay: 0,
      level: 5,
    },
    {
      id: 'anxious',
      label: '焦慮',
      icon: '⚡',
      color: '#FF6B6B',
      particleType: 'burst',
      delay: 0.5,
      level: 4,
    },
    {
      id: 'calm',
      label: '平靜',
      icon: '🌱',
      color: '#4ECDC4',
      particleType: 'float',
      delay: 1,
      level: 3,
    },
    {
      id: 'sad',
      label: '難過',
      icon: '💧',
      color: '#556270',
      particleType: 'down',
      delay: 1.5,
      level: 2,
    },
  ];

  // ========== 工具函式（用 stats.php 的資料算週進度 / 月累計） ==========

  // 把 weeklyPractices 轉成 [日, 一, 二, 三, 四, 五, 六] 的 boolean 陣列
  const computeWeeklyCheckIns = (weeklyPractices, practiceType) => {
    const result = Array(7).fill(false);

    (weeklyPractices || []).forEach((item) => {
      const type = item.practice_type || item.practiceType;
      if (type !== practiceType) return;

      const created =
        item.created_at || item.createdAt || item.date || item.datetime;
      const d = new Date(created);
      if (isNaN(d)) return;

      // JS 的 getDay(): 0=日, 1=一, ... 6=六
      const dayIndex = d.getDay();
      result[dayIndex] = true;
    });

    return result;
  };

  // 把 monthlyPractices 轉成「本月有完成幾天」（以天數計算，不是次數）
  const computeMonthlyTotal = (monthlyPractices, practiceType) => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth(); // 0-11

    const daysSet = new Set();

    (monthlyPractices || []).forEach((item) => {
      const type = item.practice_type || item.practiceType;
      if (type !== practiceType) return;

      const created =
        item.created_at || item.createdAt || item.date || item.datetime;
      const d = new Date(created);
      if (isNaN(d)) return;

      if (d.getFullYear() === year && d.getMonth() === month) {
        const key = d.toISOString().slice(0, 10); // YYYY-MM-DD
        daysSet.add(key);
      }
    });

    return daysSet.size;
  };

  // ========== 生命週期 ==========

  useEffect(() => {
    checkLoginStatus();
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      checkLoginStatus();
      if (isLoggedIn) {
        loadTodayData();
        loadHomeStats();
      }
    });
    return unsubscribe;
  }, [navigation, isLoggedIn]);

  useEffect(() => {
    if (isLoggedIn && user && !user.isGuest) {
      loadTodayData();
      loadHomeStats();
    }
  }, [isLoggedIn, user]);

  // ========== 核心功能函數 ==========

  const checkLoginStatus = async () => {
    try {
      const loggedIn = await ApiService.isLoggedIn();
      if (loggedIn) {
        const response = await ApiService.getUserProfile();
        setUser({
          id: response.user.id,
          name: response.user.name,
          email: response.user.email,
        });
        setIsLoggedIn(true);
      } else {
        setIsLoggedIn(false);
        setUser(null);
      }
    } catch (error) {
      console.log('未登入或 Token 已過期');
      setIsLoggedIn(false);
      setUser(null);
    }
  };

  const loadTodayData = async () => {
    try {
      // 今日心情
      const moodResponse = await ApiService.getTodayMood();
      if (moodResponse.success && moodResponse.mood) {
        setTodayMoodRecord(moodResponse.mood);
        const moodIndex = emotionCards.findIndex(
          (m) => m.level === moodResponse.mood.mood_level
        );
        if (moodIndex !== -1) {
          setSelectedMood((current) => (current === null ? moodIndex : current));
        }
      } else {
        setTodayMoodRecord(null);
      }

      // 今日練習狀態（你原本的 today-status.php）
      const practiceResponse = await ApiService.getTodayPracticeStatus();
      if (practiceResponse.success) {
        setTodayPracticeStatus(practiceResponse.practices || {});
      }
    } catch (error) {
      console.error('載入今日數據失敗:', error);
    }
  };

  // 🔹 新增：從 /practice/stats.php 把「連續天數 / 週進度 / 月累計」抓進來
  const loadHomeStats = async () => {
    try {
      const res = await ApiService.getPracticeStats();
      // 容錯：可能是 {success, stats}，也可能是直接 stats
      const success = res?.success !== undefined ? res.success : true;

      const stats =
        res?.stats ||
        res?.data?.stats ||
        res?.data ||
        (success ? res : null);

      if (!success || !stats) {
        console.log('練習統計 API 返回格式不符或失敗:', res);
        return;
      }

      const weeklyPractices =
        stats.weeklyPractices || stats.weekly_practices || [];
      const monthlyPractices =
        stats.monthlyPractices || stats.monthly_practices || [];

      // 1) 上方卡片：已連續簽到 / 第幾天（先用「有完成任何練習就算簽到」）
      setMoodStats({
        consecutiveDays: stats.currentStreak || stats.current_streak || 0,
        totalDays: stats.totalDays || stats.total_days || 0,
      });

      // 2) 下方練習卡：呼吸 / 好事書寫的週進度 & 月累計
      setPracticeStats({
        breathing: {
          streakDays: stats.currentStreak || stats.current_streak || 0,
          monthlyTotal: computeMonthlyTotal(
            monthlyPractices,
            PRACTICE_TYPE_BREATHING
          ),
          weeklyCheckIns: computeWeeklyCheckIns(
            weeklyPractices,
            PRACTICE_TYPE_BREATHING
          ),
        },
        goodthings: {
          streakDays: stats.currentStreak || stats.current_streak || 0,
          monthlyTotal: computeMonthlyTotal(
            monthlyPractices,
            PRACTICE_TYPE_GOODTHINGS
          ),
          weeklyCheckIns: computeWeeklyCheckIns(
            weeklyPractices,
            PRACTICE_TYPE_GOODTHINGS
          ),
        },
      });
    } catch (error) {
      console.error('載入首頁統計資料失敗:', error);
    }
  };

  const showLoginPrompt = () => {
    if (!isLoggedIn || (user && user.isGuest)) {
      Alert.alert('需要登入', '請登入以享受完整的冥想體驗', [
        { text: '取消', style: 'cancel' },
        {
          text: '登入',
          onPress: () =>
            navigation.navigate('Login', {
              onLoginSuccess: (userData) => {
                setUser(userData);
                setIsLoggedIn(true);
              },
            }),
        },
      ]);
      return true;
    }
    return false;
  };

  const handleMoodSelect = async (emotion, index) => {
    if (showLoginPrompt()) return;

    // 如果已經選中同一個，直接返回
    if (selectedMood === index) {
      console.log('已經選中，跳過');
      return;
    }

    console.log('👆 點擊按鈕:', emotion.label, '(index:', index, ')');
    console.log('選中情緒:', emotion.label, 'index:', index);

    // 先設定選中狀態，觸發動畫
    setSelectedMood(index);

    try {
      const response = await ApiService.recordMood(
        emotion.level,
        emotion.label,
        ''
      );

      if (response.success) {
        setTodayMoodRecord({
          mood_level: emotion.level,
          mood_name: emotion.label,
          recorded_at: new Date().toISOString(),
        });
        console.log('✅ 心情記錄成功');
      } else {
        console.log('API 返回失敗');
        // API 失敗時回復到原狀態
        if (todayMoodRecord) {
          const originalIndex = emotionCards.findIndex(
            (m) => m.level === todayMoodRecord.mood_level
          );
          setSelectedMood(originalIndex !== -1 ? originalIndex : null);
        } else {
          setSelectedMood(null);
        }
      }
    } catch (error) {
      console.error('記錄心情失敗:', error);
      Alert.alert('錯誤', '心情記錄失敗，請稍後再試');
      // 錯誤時回復到原狀態
      if (todayMoodRecord) {
        const originalIndex = emotionCards.findIndex(
          (m) => m.level === todayMoodRecord.mood_level
        );
        setSelectedMood(originalIndex !== -1 ? originalIndex : null);
      } else {
        setSelectedMood(null);
      }
    }
  };

  const navigateToBreathing = () => {
    if (showLoginPrompt()) return;
    navigation.navigate('PracticeNavigator', {
      practiceType: '呼吸穩定力練習',
      onPracticeComplete: async () => {
        await loadTodayData();
        await loadHomeStats(); // 練習完成後更新首頁統計
      },
    });
  };

  const navigateToGoodThings = () => {
    if (showLoginPrompt()) return;
    navigation.navigate('PracticeNavigator', {
      practiceType: '好事書寫',
      onPracticeComplete: async () => {
        await loadTodayData();
        await loadHomeStats();
      },
    });
  };

  const navigateToResiliencePlan = () => {
    navigation.navigate('EmotionalResiliencePlan');
  };

  // ========= 從 state 推導出首頁要顯示的統計 =========

  const consecutiveDays = moodStats.consecutiveDays || 0;
  const totalDays = moodStats.totalDays || 0;

  const currentPracticeStats =
    selectedPractice === 'breathing'
      ? practiceStats.breathing
      : practiceStats.goodthings;

  const weeklyCheckIns = currentPracticeStats.weeklyCheckIns || [];
  const checkInCount = weeklyCheckIns.filter(Boolean).length;
  const monthlyTotal = currentPracticeStats.monthlyTotal || 0;

  // ========== 子組件 ==========

  /**
   * 情緒按鈕組件 - 簡化版（無動畫）
   */
  const MoodButton = React.memo(({ emotion, index, isSelected, onPress }) => {
    const handlePress = () => {
      console.log(`👆 點擊按鈕: ${emotion.label} (index: ${index})`);
      onPress();
    };

    return (
      <TouchableOpacity
        onPress={handlePress}
        style={styles.moodButtonContainer}
        activeOpacity={0.8}
      >
        <View
          style={[
            styles.moodButton,
            isSelected && {
              shadowColor: emotion.color,
              shadowOffset: { width: 0, height: 12 },
              shadowOpacity: 0.35,
              shadowRadius: 24,
              elevation: 10,
            },
          ]}
        >
          {/* 1. 底層：顏色填充（在 Emoji 下方） */}
          {isSelected && (
            <View
              style={[
                StyleSheet.absoluteFill,
                {
                  backgroundColor: emotion.color,
                  borderRadius: 32,
                  opacity: 0.5,
                },
              ]}
            />
          )}

          {/* 2. 中間層：白色半透明遮罩 */}
          {isSelected && (
            <View
              style={[
                StyleSheet.absoluteFill,
                {
                  backgroundColor: '#FFFFFF',
                  borderRadius: 32,
                  opacity: 0.6,
                },
              ]}
            />
          )}

          {/* 3. 邊框層 */}
          {isSelected && (
            <View
              style={[
                StyleSheet.absoluteFill,
                {
                  borderRadius: 32,
                  borderWidth: 2,
                  borderColor: emotion.color,
                },
              ]}
            />
          )}

          {/* 4. 最上層：Emoji 圖標 */}
          <Text style={styles.moodIcon}>{emotion.icon}</Text>
        </View>

        {/* 標籤文字 */}
        <Text
          style={[
            styles.moodText,
            {
              color: isSelected ? emotion.color : '#718096',
              fontWeight: isSelected ? '800' : '600',
            },
          ]}
        >
          {emotion.label}
        </Text>
      </TouchableOpacity>
    );
  });

  // ========== 主渲染 ==========

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#166CB5" />

      <AppHeader navigation={navigation} />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Greeting Section */}
        <View style={styles.greetingSection}>
          <Text style={styles.greetingText}>早安啊！</Text>
          <MaskedView
            maskElement={
              <Text style={styles.nameTextMask}>
                {isLoggedIn && user ? user.name : 'Jennifer'}
              </Text>
            }
          >
            <LinearGradient
              colors={['#166CB5', '#31C6FE']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.nameGradientMask}
            >
              <Text style={[styles.nameTextMask, { opacity: 0 }]}>
                {isLoggedIn && user ? user.name : 'Jennifer'}
              </Text>
            </LinearGradient>
          </MaskedView>
        </View>

        {/* Consecutive Days Card */}
        <View style={styles.consecutiveCard}>
          <View style={styles.consecutiveTextRow}>
            <Text style={styles.consecutiveText}>已連續簽到</Text>
            <Text style={styles.consecutiveNumber}>{consecutiveDays}</Text>
            <Text style={styles.consecutiveText}>天</Text>
          </View>
          <LinearGradient
            colors={['#FF6B35', '#FF8C42']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.flameCircle}
          >
            <Flame color="#FFFFFF" size={24} fill="#FFFFFF" />
          </LinearGradient>
        </View>

        {/* Total Days Card */}
        <TouchableOpacity
          style={styles.totalDaysCard}
          onPress={navigateToResiliencePlan}
          activeOpacity={0.9}
        >
          <LinearGradient
            colors={['#31C6FE', '#166CB5', '#1e3a8a']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.totalDaysGradient}
          >
            <View style={styles.totalDaysContent}>
              <View style={styles.totalDaysLeft}>
                <Text style={styles.totalDaysLabel}>心理肌力訓練</Text>
                <Text style={styles.totalDaysTitle}>持續堅持</Text>
              </View>

              <View style={styles.totalDaysRight}>
                <View style={styles.totalDaysNumberRow}>
                  <Text style={styles.totalDaysPrefix}>第</Text>
                  <Text style={styles.totalDaysNumber}>{totalDays}</Text>
                  <Text style={styles.totalDaysSuffix}>天</Text>
                </View>
              </View>
            </View>

            <View style={styles.progressSection}>
              <View style={styles.progressLabels}>
                <Text style={styles.progressLabel}>Current Level</Text>
                <Text style={styles.progressLabel}>Next Goal: 30天</Text>
              </View>
              <View style={styles.progressBarBg}>
                <View
                  style={[
                    styles.progressBarFill,
                    {
                      width: `${Math.min(
                        100,
                        (totalDays / 30) * 100 || 0
                      )}%`,
                    },
                  ]}
                />
              </View>
            </View>
          </LinearGradient>
        </TouchableOpacity>

        {/* Mood Question */}
        <Text style={styles.moodQuestion}>今天的心情如何呢？</Text>

        {/* Emotion Cards */}
        <View style={styles.emotionCardsRow}>
          {emotionCards.map((emotion, index) => (
            <MoodButton
              key={`${emotion.id}-${index}`}
              emotion={emotion}
              index={index}
              isSelected={selectedMood === index}
              onPress={() => handleMoodSelect(emotion, index)}
            />
          ))}
        </View>

        {/* Section Title */}
        <View style={styles.sectionTitleContainer}>
          <Text style={styles.sectionTitle}>屬於你的練心書</Text>
          <Text style={styles.sectionSubtitle}>今天想選擇什麼練習呢？</Text>
        </View>

        {/* Category Filters */}
        <View style={styles.categoryFilters}>
          <TouchableOpacity
            onPress={() => setSelectedCategory('all')}
            style={[
              styles.categoryButtonInactive,
              selectedCategory === 'all' &&
                styles.categoryButtonInactiveSelected,
            ]}
          >
            <Text
              style={[
                styles.categoryTextInactive,
                selectedCategory === 'all' &&
                  styles.categoryTextInactiveSelected,
              ]}
            >
              全部
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setSelectedCategory('employee')}
            activeOpacity={0.8}
          >
            {selectedCategory === 'employee' ? (
              <LinearGradient
                colors={['#166CB5', '#31C6FE']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.categoryButtonActive}
              >
                <Text style={styles.categoryTextActive}>情緒抗壓力計劃</Text>
              </LinearGradient>
            ) : (
              <View style={styles.categoryButtonInactive}>
                <Text style={styles.categoryTextInactive}>情緒抗壓力計劃</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Practice Module Title */}
        {selectedCategory === 'employee' && (
          <View style={styles.practiceModuleTitleContainer}>
            <Text style={styles.practiceModuleTitle}>情緒抗壓力計劃</Text>
            <Text style={styles.practiceModuleSubtitle}>
              今天也是心理韌性訓練的好日子！
            </Text>
          </View>
        )}

        {/* Practice Cards */}
        <View style={styles.practiceCardsGrid}>
          <TouchableOpacity
            onPress={() => setSelectedPractice('breathing')}
            style={styles.practiceCardContainer}
            activeOpacity={0.8}
          >
            {selectedPractice === 'breathing' ? (
              <LinearGradient
                colors={['#31C6FE', '#166CB5']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.practiceCardSelected}
              >
                <View style={styles.practiceIconCircleSelected}>
                  <Wind color="#FFFFFF" size={16} />
                </View>
                <Text style={styles.practiceNameSelected}>呼吸練習</Text>
                <Text style={styles.practiceSubtitleSelected}>3 分鐘平靜</Text>
              </LinearGradient>
            ) : (
              <View style={styles.practiceCard}>
                <View style={styles.practiceIconCircle}>
                  <Wind color="#166CB5" size={16} />
                </View>
                <Text style={styles.practiceName}>呼吸練習</Text>
                <Text style={styles.practiceSubtitle}>3 分鐘平靜</Text>
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setSelectedPractice('goodthings')}
            style={styles.practiceCardContainer}
            activeOpacity={0.8}
          >
            {selectedPractice === 'goodthings' ? (
              <LinearGradient
                colors={['#FFBC42', '#FF8C42']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.practiceCardSelected}
              >
                <View style={styles.practiceIconCircleSelected}>
                  <PenLine color="#FFFFFF" size={16} />
                </View>
                <Text style={styles.practiceNameSelected}>好事書寫</Text>
                <Text style={styles.practiceSubtitleSelected}>紀錄小確幸</Text>
              </LinearGradient>
            ) : (
              <View style={styles.practiceCard}>
                <View
                  style={[
                    styles.practiceIconCircle,
                    { backgroundColor: '#FFF7ED' },
                  ]}
                >
                  <PenLine color="#FF8C42" size={16} />
                </View>
                <Text style={styles.practiceName}>好事書寫</Text>
                <Text style={styles.practiceSubtitle}>紀錄小確幸</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Dynamic Practice Detail Card */}
        {selectedPractice === 'breathing' && (
          <View style={styles.practiceDetailCard}>
            <View style={styles.practiceDetailHeader}>
              <View>
                <Text style={styles.practiceDetailTitle}>呼吸練習</Text>
                <View style={styles.practiceDetailMeta}>
                  <Clock color="#6B7280" size={14} strokeWidth={2} />
                  <Text style={styles.practiceDetailMetaText}> 5 分鐘</Text>
                </View>
              </View>
              <LinearGradient
                colors={['#166CB5', '#31C6FE']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.monthlyBadge}
              >
                <Text style={styles.monthlyNumber}>{monthlyTotal}</Text>
                <Text style={styles.monthlyText}>天</Text>
                <Text style={styles.monthlyLabel}>月累計</Text>
              </LinearGradient>
            </View>

            <TouchableOpacity
              onPress={navigateToBreathing}
              style={styles.startButtonContainer}
              activeOpacity={0.9}
            >
              <LinearGradient
                colors={['#166CB5', '#31C6FE']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.startButton}
              >
                <Sparkles color="#FFFFFF" size={20} />
                <Text style={styles.startButtonText}>開始今日練習</Text>
              </LinearGradient>
            </TouchableOpacity>

            <Text style={styles.practiceDescription}>
              透過呼吸覺察練習,培養內心的平靜與專注力。每天只需 5
              分鐘,讓身心回到當下。
            </Text>

            <View style={styles.weeklyProgressContainer}>
              <View style={styles.weeklyProgressHeader}>
                <Text style={styles.weeklyProgressTitle}>本週進度</Text>
                <Text style={styles.weeklyProgressCount}>
                  {checkInCount}/7 次
                </Text>
              </View>

              <View style={styles.weeklyDaysRow}>
                {['日', '一', '二', '三', '四', '五', '六'].map(
                  (day, index) => (
                    <View key={index} style={styles.dayColumn}>
                      <View
                        style={[
                          styles.dayCircle,
                          weeklyCheckIns[index] && styles.dayCircleCompleted,
                        ]}
                      >
                        {weeklyCheckIns[index] ? (
                          <Check
                            color="#FFFFFF"
                            size={18}
                            strokeWidth={3}
                          />
                        ) : (
                          <View style={styles.dayCircleDot} />
                        )}
                      </View>
                      <Text
                        style={[
                          styles.dayText,
                          weeklyCheckIns[index] &&
                            styles.dayTextCompleted,
                        ]}
                      >
                        {day}
                      </Text>
                    </View>
                  )
                )}
              </View>
            </View>

            <View style={styles.motivationCard}>
              <Text style={styles.motivationText}>
                🌟 持續練習,讓心靈更強韌！每週至少完成一次練習。
              </Text>
            </View>
          </View>
        )}

        {selectedPractice === 'goodthings' && (
          <View style={styles.practiceDetailCard}>
            <View style={styles.practiceDetailHeader}>
              <View>
                <Text style={styles.practiceDetailTitle}>好事書寫</Text>
                <View style={styles.practiceDetailMeta}>
                  <Clock color="#6B7280" size={14} strokeWidth={2} />
                  <Text style={styles.practiceDetailMetaText}> 10 分鐘</Text>
                </View>
              </View>
              <LinearGradient
                colors={['#FFBC42', '#FF8C42']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.monthlyBadge}
              >
                <Text style={styles.monthlyNumber}>{monthlyTotal}</Text>
                <Text style={styles.monthlyText}>天</Text>
                <Text style={styles.monthlyLabel}>月累計</Text>
              </LinearGradient>
            </View>

            <TouchableOpacity
              onPress={navigateToGoodThings}
              style={styles.startButtonContainer}
              activeOpacity={0.9}
            >
              <LinearGradient
                colors={['#FFBC42', '#FF8C42']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.startButton}
              >
                <Sparkles color="#FFFFFF" size={20} />
                <Text style={styles.startButtonText}>開始今日練習</Text>
              </LinearGradient>
            </TouchableOpacity>

            <Text style={styles.practiceDescription}>
              記住做不好的事情是大腦的原廠設定,用好事書寫改變負向對話的神經迴路。
            </Text>

            <View style={styles.weeklyProgressContainer}>
              <View style={styles.weeklyProgressHeader}>
                <Text style={styles.weeklyProgressTitle}>本週進度</Text>
                <Text style={styles.weeklyProgressCount}>
                  {checkInCount}/7 次
                </Text>
              </View>

              <View style={styles.weeklyDaysRow}>
                {['日', '一', '二', '三', '四', '五', '六'].map(
                  (day, index) => (
                    <View key={index} style={styles.dayColumn}>
                      <LinearGradient
                        colors={
                          weeklyCheckIns[index]
                            ? ['#FFBC42', '#FF8C42']
                            : ['#F3F4F6', '#F3F4F6']
                        }
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.dayCircle}
                      >
                        {weeklyCheckIns[index] ? (
                          <Check
                            color="#FFFFFF"
                            size={18}
                            strokeWidth={3}
                          />
                        ) : (
                          <View style={styles.dayCircleDot} />
                        )}
                      </LinearGradient>
                      <Text
                        style={[
                          styles.dayText,
                          weeklyCheckIns[index] && {
                            color: '#FF8C42',
                            fontWeight: '600',
                          },
                        ]}
                      >
                        {day}
                      </Text>
                    </View>
                  )
                )}
              </View>
            </View>

            <LinearGradient
              colors={['#FFF7ED', '#FFEDD5']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.motivationCard}
            >
              <Text style={styles.motivationText}>
                ✨ 每天記錄好事,累積正向心理資本！
              </Text>
            </LinearGradient>
          </View>
        )}

        <View style={styles.bottomPadding} />
      </ScrollView>

      <BottomNavigation navigation={navigation} currentRoute="Home" />
    </View>
  );
};

// ==========================================
// 樣式定義
// ==========================================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },

  greetingSection: {
    paddingHorizontal: 20,
    paddingTop: 24,
    marginBottom: 24,
    flexDirection: 'row',
    alignItems: 'center',
  },
  greetingText: {
    fontSize: 30,
    color: '#111827',
    marginRight: 8,
  },
  nameTextMask: {
    fontSize: 30,
    fontWeight: '700',
    backgroundColor: 'transparent',
  },
  nameGradientMask: {
    height: 40,
  },

  consecutiveCard: {
    marginHorizontal: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  consecutiveTextRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  consecutiveText: {
    fontSize: 16,
    color: '#111827',
  },
  consecutiveNumber: {
    fontSize: 16,
    color: '#111827',
    marginHorizontal: 4,
    fontWeight: '600',
  },
  flameCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: 'rgba(255, 138, 76, 0.4)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 8,
  },

  totalDaysCard: {
    marginHorizontal: 20,
    borderRadius: 24,
    marginBottom: 24,
    shadowColor: '#166CB5',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
    overflow: 'hidden',
  },
  totalDaysGradient: {
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  totalDaysContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  totalDaysLeft: {
    flex: 1,
  },
  totalDaysLabel: {
    fontSize: 12,
    color: 'rgba(207, 232, 250, 0.9)',
    marginBottom: 6,
    fontWeight: '500',
    letterSpacing: 0.5,
  },
  totalDaysTitle: {
    fontSize: 22,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  totalDaysRight: {
    alignItems: 'flex-end',
  },
  totalDaysNumberRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  totalDaysPrefix: {
    fontSize: 19,
    color: 'rgba(207, 232, 250, 1)',
    fontWeight: '500',
    marginRight: 4,
  },
  totalDaysNumber: {
    fontSize: 67,
    color: '#FFFFFF',
    fontWeight: '900',
    lineHeight: 74,
  },
  totalDaysSuffix: {
    fontSize: 22,
    color: '#FFFFFF',
    fontWeight: '700',
    marginLeft: 4,
  },
  progressSection: {
    marginTop: 1,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
    paddingHorizontal: 4,
  },
  progressLabel: {
    fontSize: 12,
    color: 'rgba(207, 232, 250, 1)',
  },
  progressBarBg: {
    height: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 4,
    shadowColor: '#FFFFFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.7,
    shadowRadius: 10,
  },

  moodQuestion: {
    fontSize: 16,
    color: '#6B7280',
    paddingHorizontal: 20,
    marginBottom: 16,
  },

  emotionCardsRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  moodButtonContainer: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 6,
  },
  moodButton: {
    width: '100%',
    aspectRatio: 1 / 1.25,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    overflow: 'hidden',
    backgroundColor: '#F7FAFC', // 未選中時的背景色
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  moodIcon: {
    fontSize: 28,
    zIndex: 10,
  },
  moodText: {
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
  },

  sectionTitleContainer: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    color: '#111827',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },

  categoryFilters: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  categoryButtonInactive: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#E9F4FB',
    borderRadius: 100,
    marginRight: 8,
  },
  categoryButtonInactiveSelected: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  categoryTextInactive: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  categoryTextInactiveSelected: {
    color: '#111827',
    fontWeight: '600',
  },
  categoryButtonActive: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 100,
    shadowColor: '#166CB5',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  categoryTextActive: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '500',
  },

  practiceModuleTitleContainer: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  practiceModuleTitle: {
    fontSize: 18,
    color: '#111827',
    marginBottom: 4,
  },
  practiceModuleSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },

  practiceCardsGrid: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 24,
    justifyContent: 'flex-start',
  },
  practiceCardContainer: {
    width: 110,
    marginHorizontal: 4,
  },
  practiceCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 8,
    height: 140,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0F2FE',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  practiceCardSelected: {
    borderRadius: 12,
    padding: 8,
    height: 140,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#166CB5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  practiceIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 9,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  practiceIconCircleSelected: {
    width: 36,
    height: 36,
    borderRadius: 9,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  practiceName: {
    fontSize: 11,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 3,
  },
  practiceNameSelected: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 3,
  },
  practiceSubtitle: {
    fontSize: 9,
    color: '#6B7280',
    textAlign: 'center',
  },
  practiceSubtitleSelected: {
    fontSize: 9,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },

  practiceDetailCard: {
    marginHorizontal: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    marginBottom: 24,
  },
  practiceDetailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  practiceDetailTitle: {
    fontSize: 20,
    color: '#111827',
    marginBottom: 4,
  },
  practiceDetailMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  practiceDetailMetaText: {
    fontSize: 14,
    color: '#6B7280',
  },
  monthlyBadge: {
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  monthlyNumber: {
    fontSize: 24,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  monthlyText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  monthlyLabel: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
  },
  startButtonContainer: {
    marginBottom: 16,
    borderRadius: 100,
    overflow: 'hidden',
  },
  startButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 100,
  },
  startButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
    marginLeft: 8,
  },
  practiceDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 22,
    marginBottom: 20,
  },

  weeklyProgressContainer: {
    marginBottom: 20,
  },
  weeklyProgressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  weeklyProgressTitle: {
    fontSize: 16,
    color: '#111827',
  },
  weeklyProgressCount: {
    fontSize: 14,
    color: '#6B7280',
  },
  weeklyDaysRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dayColumn: {
    alignItems: 'center',
  },
  dayCircle: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  dayCircleCompleted: {
    backgroundColor: '#166CB5',
    shadowColor: '#166CB5',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  dayCircleDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#9CA3AF',
  },
  dayText: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  dayTextCompleted: {
    color: '#166CB5',
    fontWeight: '600',
  },

  motivationCard: {
    backgroundColor: '#E8F4F9',
    borderRadius: 12,
    padding: 12,
  },
  motivationText: {
    fontSize: 14,
    color: '#374151',
    textAlign: 'center',
    lineHeight: 20,
  },

  bottomPadding: {
    height: 100,
  },
});

export default HomeScreen;
