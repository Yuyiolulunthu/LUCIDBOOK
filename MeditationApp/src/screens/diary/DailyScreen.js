// ==========================================
// DailyScreen.js - 最小改動版本
// 只添加心情快照功能，不改動任何其他邏輯
// ==========================================

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  StatusBar,
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Sparkles,
  Smile,
  Info,
  List,
  Grid3X3,
  Calendar as CalendarIcon,
  BookOpen,
  X,
} from 'lucide-react-native';
import ApiService from '../../../api';
import BottomNavigation from '../../navigation/BottomNavigation';
import AppHeader from '../../navigation/AppHeader';
import LockedOverlay from '../../navigation/LockedOverlay';
import { useFocusEffect } from '@react-navigation/native';

const { width } = Dimensions.get('window');

const moodColors = {
  開心: '#FFBC42',
  焦慮: '#FF6B6B',
  平靜: '#4ECDC4',
  難過: '#556270',
};

const DailyScreen = ({ navigation }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [allPracticeData, setAllPracticeData] = useState([]);
  const [displayData, setDisplayData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalPractices: 0,
    mentalMuscle: 0,
  });
  const [viewMode, setViewMode] = useState('list');
  const [showInfoCard, setShowInfoCard] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [hasEnterpriseCode, setHasEnterpriseCode] = useState(false);

  // ⭐⭐⭐ 新增：情緒日記統計 ⭐⭐⭐
  const [emotionDiaryStats, setEmotionDiaryStats] = useState([]);

  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedPractice, setSelectedPractice] = useState(null);

  const hasLoadedData = useRef(false);

  // ✅ 使用 useFocusEffect 替代 useEffect
  useFocusEffect(
    React.useCallback(() => {
      console.log('📱 [DailyScreen] 頁面獲得焦點');
      
      // 重新檢查權限
      checkAccess();
      
      // 重新載入數據
      if (!hasLoadedData.current) {
        fetchAllData();
      }
      
      return () => {
        console.log('📱 [DailyScreen] 頁面失去焦點');
      };
    }, [])
  );

  useEffect(() => {
    filterDataForCurrentMonth(allPracticeData);
    // ⭐ 新增：當月份改變時，重新獲取情緒日記統計
    fetchEmotionDiaryStats();
  }, [currentMonth]);

  // ✅ 改進的權限檢查函數
  const checkAccess = async () => {
    try {
      console.log('🔍 [DailyScreen] 開始檢查權限...');
      
      // 檢查登入狀態
      const loggedIn = await ApiService.isLoggedIn();
      console.log('📋 [DailyScreen] 登入狀態:', loggedIn);
      setIsLoggedIn(loggedIn);

      if (loggedIn) {
        // 檢查是否有企業引薦碼
        const profile = await ApiService.getUserProfile();
        const hasCode = !!profile.user.enterprise_code;
        console.log('📋 [DailyScreen] 企業引薦碼:', hasCode, '| 值:', profile.user.enterprise_code);
        setHasEnterpriseCode(hasCode);
      } else {
        console.log('⚠️ [DailyScreen] 用戶未登入，清除引薦碼狀態');
        setHasEnterpriseCode(false);
      }
      
      console.log('✅ [DailyScreen] 權限檢查完成');
    } catch (error) {
      console.error('❌ [DailyScreen] 檢查權限失敗:', error);
      setIsLoggedIn(false);
      setHasEnterpriseCode(false);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllData = async () => {
    try {
      setLoading(true);

      const practiceResponse = await ApiService.getPracticeHistory();

      if (practiceResponse.practices) {
        setAllPracticeData(practiceResponse.practices);
        hasLoadedData.current = true;
        filterDataForCurrentMonth(practiceResponse.practices);
      }

      // ⭐ 新增：獲取情緒日記統計
      await fetchEmotionDiaryStats();

    } catch (error) {
      console.error('❌ 獲取數據失敗:', error);
    } finally {
      setLoading(false);
    }
  };

  // ⭐⭐⭐ 新增：獲取情緒日記統計（優雅降級）⭐⭐⭐
  const fetchEmotionDiaryStats = async () => {
    try {
      const year = currentMonth.getFullYear();
      const month = currentMonth.getMonth() + 1;

      // 檢查 API 是否存在
      if (typeof ApiService.getEmotionDiaryMonthly !== 'function') {
        console.log('ℹ️ [DailyScreen] getEmotionDiaryMonthly API 不存在，跳過心情快照');
        setEmotionDiaryStats([]);
        return;
      }

      const response = await ApiService.getEmotionDiaryMonthly(year, month);

      if (!response || response.error) {
        console.log('ℹ️ [DailyScreen] 無法獲取心情快照，隱藏此功能');
        setEmotionDiaryStats([]);
        return;
      }

      if (response.success && response.diaries && response.diaries.length > 0) {
        // 統計情緒出現次數
        const emotionCount = {};
        
        response.diaries.forEach((diary) => {
          const emotion = diary.emotion || diary.mood;
          if (emotion) {
            emotionCount[emotion] = (emotionCount[emotion] || 0) + 1;
          }
        });

        // 取前三名
        const topEmotions = Object.entries(emotionCount)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 3)
          .map(([emotion, count]) => ({ emotion, count }));

        setEmotionDiaryStats(topEmotions);
      } else {
        setEmotionDiaryStats([]);
      }
    } catch (error) {
      console.log('ℹ️ [DailyScreen] 獲取心情快照失敗，隱藏此功能');
      setEmotionDiaryStats([]);
    }
  };
  // ⭐⭐⭐ 新增結束 ⭐⭐⭐

  const filterDataForCurrentMonth = (practices) => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    const filtered = practices.filter((practice) => {
      const practiceDate = new Date(practice.completed_at);
      const isCompleted =
        String(practice.completed) === '1' || practice.completed === 1;

      return (
        isCompleted &&
        practiceDate.getFullYear() === year &&
        practiceDate.getMonth() === month
      );
    });

    setDisplayData(filtered);
    calculateStats(filtered);
  };

  const calculateStats = (practices) => {
    const totalPractices = practices.length;

    let totalRelaxScore = 0;
    let relaxCount = 0;

    practices.forEach((p) => {
      if (p.relax_level !== null && p.relax_level !== undefined) {
        totalRelaxScore += parseFloat(p.relax_level);
        relaxCount++;
      } else if (p.positive_level !== null && p.positive_level !== undefined) {
        totalRelaxScore += parseFloat(p.positive_level);
        relaxCount++;
      }
    });

    const mentalMuscle =
      relaxCount > 0 ? Math.round(totalRelaxScore / relaxCount) : 0;

    setStats({
      totalPractices,
      mentalMuscle,
    });
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const day = date.getDate();
    const weekday = ['日', '一', '二', '三', '四', '五', '六'][date.getDay()];
    return { day, weekday };
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;

    if (mins > 0 && secs > 0) {
      return `${mins}分${secs}秒`;
    } else if (mins > 0) {
      return `${mins}分鐘`;
    } else {
      return `${secs}秒`;
    }
  };

  const getMoodColor = (mood) => {
    return moodColors[mood] || '#9CA3AF';
  };

  const handlePrevMonth = () => {
    const newMonth = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth() - 1
    );
    setCurrentMonth(newMonth);
  };

  const handleNextMonth = () => {
    const newMonth = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth() + 1
    );
    setCurrentMonth(newMonth);
  };

  const generateCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }
    return days;
  };

  const days = generateCalendarDays();

  const getRecordForDate = (day) => {
    const dateStr = `${currentMonth.getFullYear()}-${String(
      currentMonth.getMonth() + 1
    ).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return displayData.find((r) => r.completed_at?.startsWith(dateStr));
  };

  const hasRecordOnDate = (day) => {
    return !!getRecordForDate(day);
  };

  const handleDayClick = (day) => {
    const record = getRecordForDate(day);
    if (record) {
      setSelectedPractice(record);
      setDetailModalVisible(true);
    }
  };

  const openDetailModal = (practice) => {
    setSelectedPractice(practice);
    setDetailModalVisible(true);
  };

  const closeDetailModal = () => {
    setDetailModalVisible(false);
    setSelectedPractice(null);
  };

  const getPracticeType = (practiceTypeName) => {
    if (practiceTypeName?.includes('好事') || practiceTypeName?.includes('感恩')) {
      return 'good-things';
    }
    if (practiceTypeName?.includes('呼吸') || practiceTypeName?.includes('4-6') || practiceTypeName?.includes('屏息')) {
      return 'breathing';
    }
    return 'breathing';
  };

  const renderDetailModal = () => {
    if (!selectedPractice) return null;

    const totalSeconds = parseInt(selectedPractice.duration_seconds) || 0;
    const mood = selectedPractice.post_mood || selectedPractice.mood || '平靜';
    const practiceType = getPracticeType(selectedPractice.practice_type);

    // ⭐ 判斷是否為好事練習
    const isGoodThingsPractice = practiceType === 'good-things' || 
                                  selectedPractice.practice_type?.includes('好事') ||
                                  selectedPractice.practice_type?.includes('感恩');

    // ⭐ 好事練習的特殊欄位
    let goodThingData = null;
    if (isGoodThingsPractice) {
      // 嘗試從直接欄位讀取
      goodThingData = {
        goodThing: selectedPractice.good_thing || null,
        whoWith: selectedPractice.who_with || null,
        feelings: selectedPractice.feelings || null,
        emotions: selectedPractice.emotions || null,
        otherEmotion: selectedPractice.other_emotion || null,
        reason: selectedPractice.reason || null,
        howToRepeat: selectedPractice.how_to_repeat || null,
        futureAction: selectedPractice.future_action || null,
        positiveLevel: selectedPractice.positive_level || null,
        moodAfterWriting: selectedPractice.mood_after_writing || null,
        moodNotes: selectedPractice.mood_notes || null,
      };

      // 如果直接欄位都沒有，嘗試從 form_data 解析
      if (!goodThingData.goodThing && selectedPractice.form_data) {
        try {
          const formData = typeof selectedPractice.form_data === 'string' 
            ? JSON.parse(selectedPractice.form_data)
            : selectedPractice.form_data;
          
          if (formData && typeof formData === 'object') {
            goodThingData = {
              goodThing: formData.good_thing || formData.goodThing || null,
              whoWith: formData.who_with || formData.whoWith || null,
              feelings: formData.feelings || null,
              emotions: formData.emotions || null,
              otherEmotion: formData.other_emotion || formData.otherEmotion || null,
              reason: formData.reason || null,
              howToRepeat: formData.how_to_repeat || formData.howToRepeat || null,
              futureAction: formData.future_action || formData.futureAction || null,
              positiveLevel: formData.positive_level || formData.positiveLevel || null,
              moodAfterWriting: formData.mood_after_writing || formData.moodAfterWriting || null,
              moodNotes: formData.mood_notes || formData.moodNotes || null,
            };
          }
        } catch (e) {
          // 靜默失敗
        }
      }
    }

    // ⭐ 一般練習的筆記邏輯（呼吸練習等）
    let journalEntry = null;
    if (!isGoodThingsPractice) {
      journalEntry = selectedPractice.journal_entry || 
                     selectedPractice.note ||
                     selectedPractice.mood_notes ||
                     selectedPractice.moodNotes ||
                     selectedPractice.feeling || 
                     selectedPractice.noticed || 
                     selectedPractice.reflection;
      
      if (!journalEntry && selectedPractice.form_data) {
        try {
          const formData = typeof selectedPractice.form_data === 'string' 
            ? JSON.parse(selectedPractice.form_data)
            : selectedPractice.form_data;
          
          if (formData && typeof formData === 'object') {
            journalEntry = formData.journal_entry || 
                           formData.journalEntry || 
                           formData.feelingNote ||
                           formData.note ||
                           formData.mood_notes ||
                           formData.moodNotes ||
                           formData.feeling ||
                           formData.noticed ||
                           formData.reflection;
          }
        } catch (e) {
          // 靜默失敗
        }
      }
    }

    return (
      <Modal
        visible={detailModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={closeDetailModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.modalTitle}>
                  {selectedPractice.practice_type}
                </Text>
                <Text style={styles.modalDate}>
                  {selectedPractice.completed_at}
                </Text>
              </View>
              <TouchableOpacity
                onPress={closeDetailModal}
                style={styles.modalCloseButton}
              >
                <View style={styles.closeIconCircle}>
                  <X color="#9CA3AF" size={20} strokeWidth={2} />
                </View>
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.modalContent}
              showsVerticalScrollIndicator={false}
            >
              {/* 練習後情緒 */}
              <LinearGradient
                colors={['#EFF6FF', '#DBEAFE']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.moodCard}
              >
                <Text style={styles.moodCardLabel}>練習後情緒</Text>
                <View style={styles.moodBadgeContainer}>
                  <View
                    style={[
                      styles.moodBadge,
                      { backgroundColor: getMoodColor(mood) },
                    ]}
                  >
                    <Text style={styles.moodBadgeText}>{mood}</Text>
                  </View>
                </View>
              </LinearGradient>

              {/* 基本資訊 */}
              <View style={styles.infoSection}>
                <View style={styles.infoRow}>
                  <View style={styles.iconCircle}>
                    <CalendarIcon color="#6B7280" size={20} strokeWidth={2} />
                  </View>
                  <View style={styles.infoTextBlock}>
                    <Text style={styles.infoLabel}>完成日期</Text>
                    <Text style={styles.infoValue}>
                      {selectedPractice.completed_at}
                    </Text>
                  </View>
                </View>

                <View style={styles.infoDivider} />

                <View style={styles.infoRow}>
                  <View style={styles.iconCircle}>
                    <TrendingUp color="#6B7280" size={20} strokeWidth={2} />
                  </View>
                  <View style={styles.infoTextBlock}>
                    <Text style={styles.infoLabel}>投入時間</Text>
                    <Text style={styles.infoValue}>
                      {formatDuration(totalSeconds)}
                    </Text>
                  </View>
                </View>
              </View>

              {/* ⭐⭐⭐ 好事練習的詳細內容 ⭐⭐⭐ */}
              {isGoodThingsPractice && goodThingData && (
                <View style={styles.goodThingsContent}>
                  {/* 好事內容 */}
                  {goodThingData.goodThing && (
                    <LinearGradient
                      colors={['#FFF7ED', '#FFEDD5']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.goodThingCard}
                    >
                      <View style={styles.goodThingHeader}>
                        <View style={styles.goodThingIconCircle}>
                          <Text style={styles.goodThingEmoji}>✨</Text>
                        </View>
                        <Text style={styles.goodThingLabel}>發生了什麼好事</Text>
                      </View>
                      <Text style={styles.goodThingText}>{goodThingData.goodThing}</Text>
                    </LinearGradient>
                  )}

                  {/* 與誰一起 */}
                  {goodThingData.whoWith && (
                    <LinearGradient
                      colors={['#F0F9FF', '#E0F2FE']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.goodThingCard}
                    >
                      <View style={styles.goodThingHeader}>
                        <View style={styles.goodThingIconCircle}>
                          <Text style={styles.goodThingEmoji}>👥</Text>
                        </View>
                        <Text style={styles.goodThingLabel}>與誰一起</Text>
                      </View>
                      <Text style={styles.goodThingText}>{goodThingData.whoWith}</Text>
                    </LinearGradient>
                  )}

                  {/* 感受 */}
                  {goodThingData.feelings && (
                    <LinearGradient
                      colors={['#F5F3FF', '#EDE9FE']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.goodThingCard}
                    >
                      <View style={styles.goodThingHeader}>
                        <View style={styles.goodThingIconCircle}>
                          <Text style={styles.goodThingEmoji}>💭</Text>
                        </View>
                        <Text style={styles.goodThingLabel}>當時的感受</Text>
                      </View>
                      <Text style={styles.goodThingText}>{goodThingData.feelings}</Text>
                    </LinearGradient>
                  )}

                  {/* 情緒標籤 */}
                  {goodThingData.emotions && (
                    <LinearGradient
                      colors={['#FFF1F2', '#FFE4E6']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.goodThingCard}
                    >
                      <View style={styles.goodThingHeader}>
                        <View style={styles.goodThingIconCircle}>
                          <Text style={styles.goodThingEmoji}>😊</Text>
                        </View>
                        <Text style={styles.goodThingLabel}>情緒</Text>
                      </View>
                      <View style={styles.emotionTagsContainer}>
                        {(Array.isArray(goodThingData.emotions) 
                          ? goodThingData.emotions 
                          : goodThingData.emotions.split(',')
                        ).map((emotion, idx) => (
                          <View key={idx} style={styles.emotionTag}>
                            <Text style={styles.emotionTagText}>{emotion.trim()}</Text>
                          </View>
                        ))}
                      </View>
                    </LinearGradient>
                  )}

                  {/* 為什麼好 */}
                  {goodThingData.reason && (
                    <LinearGradient
                      colors={['#FFFBEB', '#FEF3C7']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.goodThingCard}
                    >
                      <View style={styles.goodThingHeader}>
                        <View style={styles.goodThingIconCircle}>
                          <Text style={styles.goodThingEmoji}>💡</Text>
                        </View>
                        <Text style={styles.goodThingLabel}>為什麼覺得這件事很好</Text>
                      </View>
                      <Text style={styles.goodThingText}>{goodThingData.reason}</Text>
                    </LinearGradient>
                  )}

                  {/* 如何重複 */}
                  {goodThingData.howToRepeat && (
                    <LinearGradient
                      colors={['#ECFDF5', '#D1FAE5']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.goodThingCard}
                    >
                      <View style={styles.goodThingHeader}>
                        <View style={styles.goodThingIconCircle}>
                          <Text style={styles.goodThingEmoji}>🔄</Text>
                        </View>
                        <Text style={styles.goodThingLabel}>如何讓好事再次發生</Text>
                      </View>
                      <Text style={styles.goodThingText}>{goodThingData.howToRepeat}</Text>
                    </LinearGradient>
                  )}

                  {/* 未來行動 */}
                  {goodThingData.futureAction && (
                    <LinearGradient
                      colors={['#EFF6FF', '#DBEAFE']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.goodThingCard}
                    >
                      <View style={styles.goodThingHeader}>
                        <View style={styles.goodThingIconCircle}>
                          <Text style={styles.goodThingEmoji}>🎯</Text>
                        </View>
                        <Text style={styles.goodThingLabel}>未來的行動</Text>
                      </View>
                      <Text style={styles.goodThingText}>{goodThingData.futureAction}</Text>
                    </LinearGradient>
                  )}

                  {/* 正向感受程度 */}
                  {goodThingData.positiveLevel && (
                    <LinearGradient
                      colors={['#FEF3C7', '#FDE68A']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.goodThingCard}
                    >
                      <View style={styles.goodThingHeader}>
                        <View style={styles.goodThingIconCircle}>
                          <Text style={styles.goodThingEmoji}>⭐</Text>
                        </View>
                        <Text style={styles.goodThingLabel}>正向感受程度</Text>
                      </View>
                      <View style={styles.ratingContainer}>
                        <Text style={styles.ratingNumber}>{goodThingData.positiveLevel}</Text>
                        <Text style={styles.ratingMax}>/ 10</Text>
                        <View style={styles.ratingBar}>
                          <View 
                            style={[
                              styles.ratingFill, 
                              { width: `${(goodThingData.positiveLevel / 10) * 100}%` }
                            ]} 
                          />
                        </View>
                      </View>
                    </LinearGradient>
                  )}

                  {/* 書寫後心情 */}
                  {goodThingData.moodNotes && (
                    <LinearGradient
                      colors={['#FAF5FF', '#F3E8FF']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.goodThingCard}
                    >
                      <View style={styles.goodThingHeader}>
                        <View style={styles.goodThingIconCircle}>
                          <Text style={styles.goodThingEmoji}>📝</Text>
                        </View>
                        <Text style={styles.goodThingLabel}>書寫後的感想</Text>
                      </View>
                      <Text style={styles.goodThingText}>{goodThingData.moodNotes}</Text>
                    </LinearGradient>
                  )}
                </View>
              )}

              {/* ⭐⭐⭐ 一般練習的筆記 ⭐⭐⭐ */}
              {!isGoodThingsPractice && journalEntry && (
                <View style={styles.journalSection}>
                  <View style={styles.journalHeader}>
                    <View style={styles.iconCircle}>
                      <BookOpen color="#6B7280" size={18} strokeWidth={2} />
                    </View>
                    <Text style={styles.journalTitle}>練習筆記</Text>
                  </View>
                  <Text style={styles.journalText}>
                    {journalEntry}
                  </Text>
                </View>
              )}

              <View style={styles.bottomPadding} />
            </ScrollView>
          </View>
        </View>
      </Modal>
    );
  };

  if (loading) {
    return (
      <View
        style={[
          styles.container,
          { justifyContent: 'center', alignItems: 'center' },
        ]}
      >
        <ActivityIndicator size="large" color="#166CB5" />
        <Text style={{ marginTop: 16, color: '#6B7280' }}>載入中...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#166CB5" />

      <AppHeader navigation={navigation} />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.statsCard}>
          <View style={styles.monthSelector}>
            <TouchableOpacity onPress={handlePrevMonth}>
              <LinearGradient
                colors={['#166CB5', '#31C6FE']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.monthButton}
              >
                <ChevronLeft color="#FFFFFF" size={20} strokeWidth={2.5} />
              </LinearGradient>
            </TouchableOpacity>

            <Text style={styles.monthText}>
              {currentMonth.getFullYear()} 年 {currentMonth.getMonth() + 1} 月
            </Text>

            <TouchableOpacity onPress={handleNextMonth}>
              <LinearGradient
                colors={['#166CB5', '#31C6FE']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.monthButton}
              >
                <ChevronRight color="#FFFFFF" size={20} strokeWidth={2.5} />
              </LinearGradient>
            </TouchableOpacity>
          </View>

          <View style={styles.statsGrid}>
            <TouchableOpacity
              style={{ flex: 1 }}
              onPress={() =>
                setShowInfoCard(showInfoCard === 'practice' ? null : 'practice')
              }
              activeOpacity={0.7}
            >
              <LinearGradient
                colors={['#EFF6FF', '#DBEAFE']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.statBox}
              >
                <View style={styles.infoButtonTop}>
                  <Info color="#166CB5" size={12} strokeWidth={2} />
                </View>

                <View style={styles.statContent}>
                  <TrendingUp color="#166CB5" size={16} strokeWidth={2} />
                  <Text style={styles.statValue}>{stats.totalPractices}</Text>
                  <Text style={styles.statLabel}>月累計練習</Text>
                </View>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={{ flex: 1 }}
              onPress={() =>
                setShowInfoCard(showInfoCard === 'mental' ? null : 'mental')
              }
              activeOpacity={0.7}
            >
              <LinearGradient
                colors={['#FAF5FF', '#F3E8FF']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[styles.statBox, styles.statBoxMental]}
              >
                <View style={styles.infoButtonTop}>
                  <Info color="#9333EA" size={12} strokeWidth={2} />
                </View>

                <View style={styles.statContent}>
                  <Sparkles color="#9333EA" size={16} strokeWidth={2} />
                  <Text style={[styles.statValue, { color: '#9333EA' }]}>
                    {stats.mentalMuscle}
                  </Text>
                  <Text style={styles.statLabel}>心理肌力分數</Text>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {(showInfoCard === 'practice' || showInfoCard === 'mental') && (
            <View style={styles.infoCardContainer}>
              {showInfoCard === 'practice' && (
                <View style={[styles.infoCard, { borderColor: '#DBEAFE' }]}>
                  <View style={styles.infoCardHeader}>
                    <TrendingUp color="#166CB5" size={14} strokeWidth={2} />
                    <Text style={styles.infoCardTitle}>月累計練習</Text>
                  </View>
                  <Text style={styles.infoCardText}>
                    統計本月完成的所有練習模組次數,包含呼吸練習、好事書寫等。
                  </Text>
                </View>
              )}

              {showInfoCard === 'mental' && (
                <View style={[styles.infoCard, { borderColor: '#F3E8FF' }]}>
                  <View style={styles.infoCardHeader}>
                    <Sparkles color="#9333EA" size={14} strokeWidth={2} />
                    <Text style={styles.infoCardTitle}>心理肌力分數</Text>
                  </View>
                  <Text style={styles.infoCardText}>
                    根據練習後的紀錄評分做平均計算,1-10分,分數越高心理肌力越強大。
                  </Text>
                </View>
              )}
            </View>
          )}

          {/* ⭐⭐⭐ 新增：本月心情快照 ⭐⭐⭐ */}
          {emotionDiaryStats.length > 0 && (
            <>
              <TouchableOpacity
                onPress={() =>
                  setShowInfoCard(showInfoCard === 'mood' ? null : 'mood')
                }
                activeOpacity={0.7}
              >
                <LinearGradient
                  colors={['#FFF7ED', '#FFEDD5']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.moodSnapshot}
                >
                  <View style={styles.infoButtonTop}>
                    <Info color="#F59E0B" size={12} strokeWidth={2} />
                  </View>

                  <View style={styles.moodSnapshotHeader}>
                    <Smile color="#F59E0B" size={16} strokeWidth={2} />
                    <Text style={styles.moodSnapshotTitle}>本月心情快照</Text>
                  </View>

                  <View style={styles.moodTags}>
                    {emotionDiaryStats.map(({ emotion, count }) => (
                      <View
                        key={emotion}
                        style={[
                          styles.moodTag,
                          { backgroundColor: getMoodColor(emotion) },
                        ]}
                      >
                        <Text style={styles.moodTagText}>{emotion}</Text>
                        <View style={styles.moodCountBadge}>
                          <Text style={styles.moodCountText}>{count}</Text>
                        </View>
                      </View>
                    ))}
                  </View>
                </LinearGradient>
              </TouchableOpacity>

              {showInfoCard === 'mood' && (
                <View style={styles.infoCardContainer}>
                  <View style={[styles.infoCard, { borderColor: '#FFEDD5' }]}>
                    <View style={styles.infoCardHeader}>
                      <Smile color="#F59E0B" size={14} strokeWidth={2} />
                      <Text style={styles.infoCardTitle}>本月心情快照</Text>
                    </View>
                    <Text style={styles.infoCardText}>
                      統計本月心情記錄中最常出現的情緒狀態(Top 3),數字代表記錄次數。
                    </Text>
                  </View>
                </View>
              )}
            </>
          )}
          {/* ⭐⭐⭐ 新增結束 ⭐⭐⭐ */}
        </View>

        <View style={styles.viewModeToggle}>
          <TouchableOpacity
            onPress={() => setViewMode('list')}
            style={styles.viewModeButtonContainer}
          >
            {viewMode === 'list' ? (
              <LinearGradient
                colors={['#166CB5', '#31C6FE']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.viewModeButtonActive}
              >
                <List color="#FFFFFF" size={16} strokeWidth={2} />
                <Text style={styles.viewModeTextActive}>列表</Text>
              </LinearGradient>
            ) : (
              <View style={styles.viewModeButtonInactive}>
                <List color="#6B7280" size={16} strokeWidth={2} />
                <Text style={styles.viewModeTextInactive}>列表</Text>
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setViewMode('calendar')}
            style={styles.viewModeButtonContainer}
          >
            {viewMode === 'calendar' ? (
              <LinearGradient
                colors={['#166CB5', '#31C6FE']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.viewModeButtonActive}
              >
                <Grid3X3 color="#FFFFFF" size={16} strokeWidth={2} />
                <Text style={styles.viewModeTextActive}>日曆</Text>
              </LinearGradient>
            ) : (
              <View style={styles.viewModeButtonInactive}>
                <Grid3X3 color="#6B7280" size={16} strokeWidth={2} />
                <Text style={styles.viewModeTextInactive}>日曆</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {viewMode === 'calendar' && (
          <View style={styles.calendarView}>
            <View style={styles.calendarGrid}>
              {['日', '一', '二', '三', '四', '五', '六'].map((day) => (
                <View key={day} style={styles.calendarWeekday}>
                  <Text style={styles.calendarWeekdayText}>{day}</Text>
                </View>
              ))}

              {days.map((day, index) => {
                if (!day) {
                  return <View key={`empty-${index}`} style={styles.calendarDay} />;
                }

                const hasRecord = hasRecordOnDate(day);
                const record = getRecordForDate(day);

                return (
                  <TouchableOpacity
                    key={day}
                    onPress={() => handleDayClick(day)}
                    disabled={!hasRecord}
                    style={[
                      styles.calendarDay,
                      hasRecord && {
                        backgroundColor: getMoodColor(
                          record?.post_mood || record?.mood || '平靜'
                        ),
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.15,
                        shadowRadius: 4,
                        elevation: 3,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.calendarDayText,
                        hasRecord && styles.calendarDayTextActive,
                      ]}
                    >
                      {day}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={styles.calendarLegend}>
              <View style={styles.legendItem}>
                <LinearGradient
                  colors={['#FF9A6C', '#31C6FE']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.legendColor}
                />
                <Text style={styles.legendText}>有練習記錄</Text>
              </View>
            </View>
          </View>
        )}

        {viewMode === 'list' && (
          <View style={styles.listView}>
            {displayData.length > 0 ? (
              displayData.map((record, index) => {
                const { day, weekday } = formatDate(record.completed_at);
                const totalSeconds = parseInt(record.duration_seconds) || 0;
                const mood = record.post_mood || record.mood || '平靜';

                return (
                  <TouchableOpacity
                    key={index}
                    style={styles.recordCard}
                    onPress={() => openDetailModal(record)}
                    activeOpacity={0.7}
                  >
                    <View
                      style={[
                        styles.recordDateCircle,
                        { backgroundColor: getMoodColor(mood) },
                      ]}
                    >
                      <Text style={styles.recordDay}>{day}</Text>
                      <Text style={styles.recordWeekday}>週{weekday}</Text>
                    </View>

                    <View style={styles.recordContent}>
                      <Text style={styles.recordTitle} numberOfLines={1}>
                        {record.practice_type}
                      </Text>
                      <View style={styles.recordMeta}>
                        <View
                          style={[
                            styles.moodDot,
                            { backgroundColor: getMoodColor(mood) },
                          ]}
                        />
                        <Text style={styles.recordMood}>{mood}</Text>
                      </View>

                      <View style={styles.recordFooter}>
                        <TrendingUp
                          color="#31C6FE"
                          size={14}
                          strokeWidth={2}
                        />
                        <Text style={styles.recordDuration}>
                          {formatDuration(totalSeconds)}
                        </Text>
                        {record.journal_entry && (
                          <>
                            <BookOpen
                              color="#9CA3AF"
                              size={12}
                              strokeWidth={2}
                            />
                            <Text style={styles.recordHasNote}>有筆記</Text>
                          </>
                        )}
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })
            ) : (
              <View style={styles.emptyState}>
                <CalendarIcon color="#D1D5DB" size={48} strokeWidth={1.5} />
                <Text style={styles.emptyText}>本月尚無練習記錄</Text>
                <Text style={styles.emptySubtext}>開始你的第一次練習吧!</Text>
              </View>
            )}
          </View>
        )}

        <View style={styles.bottomPadding} />
      </ScrollView>

      {renderDetailModal()}
      <BottomNavigation navigation={navigation} currentRoute="Daily" />

      {/* 🔒 鎖定遮罩 - 添加調試信息 */}
      {!isLoggedIn && (
        <>
          {console.log('🔒 [DailyScreen] 顯示登入遮罩')}
          <LockedOverlay 
            navigation={navigation} 
            reason="login"
            message="登入後查看你的練習日記"
          />
        </>
      )}
      
      {isLoggedIn && !hasEnterpriseCode && (
        <>
          {console.log('🔒 [DailyScreen] 顯示引薦碼遮罩')}
          <LockedOverlay 
            navigation={navigation} 
            reason="enterprise-code"
            message="輸入企業引薦碼以解鎖日記功能"
          />
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  statsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    margin: 16,
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  monthSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  monthButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  monthText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  statBox: {
    borderRadius: 16,
    padding: 16,
    position: 'relative',
    borderWidth: 1,
    borderColor: '#E0F2FE',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  statBoxMental: {
    borderColor: '#e9d5ff6a',
  },
  infoButtonTop: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  statContent: {
    alignItems: 'center',
    gap: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#166CB5',
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  infoCardContainer: {
    marginTop: 8,
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  infoCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  infoCardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  infoCardText: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 20,
  },
  // ⭐⭐⭐ 新增：心情快照樣式 ⭐⭐⭐
  moodSnapshot: {
    borderRadius: 16,
    padding: 16,
    position: 'relative',
    borderWidth: 1,
    borderColor: '#FFECD9',
    marginTop: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  moodSnapshotHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  moodSnapshotTitle: {
    fontSize: 12,
    color: '#6B7280',
  },
  moodTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  moodTag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  moodTagText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  moodCountBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  moodCountText: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  // ⭐⭐⭐ 新增結束 ⭐⭐⭐
  viewModeToggle: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 6,
    marginHorizontal: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  viewModeButtonContainer: {
    flex: 1,
  },
  viewModeButtonActive: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 12,
  },
  viewModeButtonInactive: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 12,
  },
  viewModeTextActive: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  viewModeTextInactive: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  calendarView: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    marginHorizontal: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  calendarWeekday: {
    width: `${100 / 7}%`,
    paddingVertical: 8,
    alignItems: 'center',
  },
  calendarWeekdayText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  calendarDay: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    marginBottom: 4,
  },
  calendarDayText: {
    fontSize: 14,
    color: '#D1D5DB',
  },
  calendarDayTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  calendarLegend: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendColor: {
    width: 16,
    height: 16,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 12,
    color: '#6B7280',
  },
  listView: {
    paddingHorizontal: 16,
  },
  recordCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  recordDateCircle: {
    width: 64,
    height: 64,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 3,
  },
  recordDay: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  recordWeekday: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  recordContent: {
    flex: 1,
  },
  recordTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  recordMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  moodDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  recordMood: {
    fontSize: 12,
    color: '#6B7280',
  },
  recordFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  recordDuration: {
    fontSize: 13,
    color: '#31C6FE',
    fontWeight: '600',
  },
  recordHasNote: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  emptyText: {
    fontSize: 16,
    color: '#9CA3AF',
    marginTop: 16,
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#D1D5DB',
  },
  bottomPadding: {
    height: 100,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  modalDate: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  modalCloseButton: {
    marginLeft: 16,
  },
  closeIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalContent: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  moodCard: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    alignItems: 'center',
  },
  moodCardLabel: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 16,
  },
  moodBadgeContainer: {
    alignItems: 'center',
  },
  moodBadge: {
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 20,
    minWidth: 100,
    alignItems: 'center',
  },
  moodBadgeText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  infoSection: {
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F9FAFB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoTextBlock: {
    flex: 1,
    marginLeft: 16,
  },
  infoLabel: {
    fontSize: 13,
    color: '#9CA3AF',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    color: '#111827',
    fontWeight: '600',
  },
  infoDivider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginVertical: 8,
  },
  journalSection: {
    marginBottom: 20,
  },
  journalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  journalTitle: {
    fontSize: 15,
    color: '#111827',
    fontWeight: '600',
    marginLeft: 12,
  },
  journalText: {
    fontSize: 15,
    color: '#4B5563',
    lineHeight: 24,
  },
  // ⭐⭐⭐ 好事練習樣式 - 精美設計 ⭐⭐⭐
  goodThingsContent: {
    marginBottom: 20,
  },
  goodThingCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  goodThingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  goodThingIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  goodThingEmoji: {
    fontSize: 18,
  },
  goodThingLabel: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '600',
  },
  goodThingText: {
    fontSize: 15,
    color: '#1F2937',
    lineHeight: 24,
  },
  emotionTagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  emotionTag: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  emotionTagText: {
    fontSize: 13,
    color: '#374151',
    fontWeight: '500',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  ratingNumber: {
    fontSize: 32,
    fontWeight: '700',
    color: '#F59E0B',
  },
  ratingMax: {
    fontSize: 18,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  ratingBar: {
    flex: 1,
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderRadius: 4,
    overflow: 'hidden',
    marginLeft: 12,
  },
  ratingFill: {
    height: '100%',
    backgroundColor: '#F59E0B',
    borderRadius: 4,
  },
});

export default DailyScreen;