// ==========================================
// DailyScreen.js - 完全修正版本
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
  Heart,
  Lightbulb,
  RefreshCw,
  Target,
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
  焦慮緊張: '#FF6B6B',
  平靜安定: '#4ECDC4',
  平靜放鬆: '#4ECDC4',
  平靜舒適: '#4ECDC4',
  負面情緒緩和了些: '#9CA3AF',
  滿足: '#4ECDC4',
  溫暖: '#FFBC42',
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
  const [emotionDiaryStats, setEmotionDiaryStats] = useState([]);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedPractice, setSelectedPractice] = useState(null);
  const hasLoadedData = useRef(false);

  useFocusEffect(
    React.useCallback(() => {
      console.log('📱 [DailyScreen] 頁面獲得焦點');
      checkAccess();
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
    fetchEmotionDiaryStats();
  }, [currentMonth]);

  const checkAccess = async () => {
    try {
      console.log('🔍 [DailyScreen] 開始檢查權限...');
      const loggedIn = await ApiService.isLoggedIn();
      console.log('📋 [DailyScreen] 登入狀態:', loggedIn);
      setIsLoggedIn(loggedIn);

      if (loggedIn) {
        const profile = await ApiService.getUserProfile();
        const hasCode = !!profile.user.enterprise_code;
        console.log('📋 [DailyScreen] 企業引薦碼:', hasCode);
        setHasEnterpriseCode(hasCode);
      } else {
        setHasEnterpriseCode(false);
      }
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
      await fetchEmotionDiaryStats();
    } catch (error) {
      console.error('❌ 獲取數據失敗:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchEmotionDiaryStats = async () => {
    try {
      const year = currentMonth.getFullYear();
      const month = currentMonth.getMonth() + 1;

      if (typeof ApiService.getEmotionDiaryMonthly !== 'function') {
        setEmotionDiaryStats([]);
        return;
      }

      const response = await ApiService.getEmotionDiaryMonthly(year, month);

      if (!response || response.error) {
        setEmotionDiaryStats([]);
        return;
      }

      if (response.success && response.diaries && response.diaries.length > 0) {
        const emotionCount = {};
        response.diaries.forEach((diary) => {
          const emotion = diary.emotion || diary.mood;
          if (emotion) {
            emotionCount[emotion] = (emotionCount[emotion] || 0) + 1;
          }
        });

        const topEmotions = Object.entries(emotionCount)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 3)
          .map(([emotion, count]) => ({ emotion, count }));

        setEmotionDiaryStats(topEmotions);
      } else {
        setEmotionDiaryStats([]);
      }
    } catch (error) {
      setEmotionDiaryStats([]);
    }
  };

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
    if (!mood) return '#9CA3AF';
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

  // 資料提取函數
  const extractBreathingData = (practice) => {
    let data = {
      preMood: practice.pre_mood || practice.mood || null,
      preMoodNote: practice.pre_mood_note || null,
      relaxLevel: practice.relax_level || practice.positive_level || null,
      postFeelings: practice.post_feelings || practice.feelings || null,
      postMood: practice.post_mood || practice.mood || null,
      journalEntry: null, // 預設為 null
    };

    if (practice.form_data) {
      try {
        const formData = typeof practice.form_data === 'string' 
          ? JSON.parse(practice.form_data)
          : practice.form_data;
        
        if (formData && typeof formData === 'object') {
          data = {
            preMood: data.preMood || formData.pre_mood || formData.preMood || formData.mood || null,
            preMoodNote: data.preMoodNote || formData.pre_mood_note || formData.preMoodNote || null,
            relaxLevel: data.relaxLevel || formData.relax_level || formData.relaxLevel || formData.positive_level || formData.positiveLevel || null,
            postFeelings: data.postFeelings || formData.post_feelings || formData.postFeelings || formData.feelings || null,
            postMood: data.postMood || formData.post_mood || formData.postMood || null,
            // 只有當 other_emotion 有值時才顯示
            journalEntry: formData.other_emotion || formData.otherEmotion || null,
          };
        }
      } catch (e) {
        console.log('解析 form_data 失敗:', e);
      }
    }

    return data;
  };

  const extractGoodThingData = (practice) => {
    let data = {
      goodThing: null,
      whoWith: null,
      feelings: null,
      emotions: null,
      otherEmotion: null,
      reason: null,
      howToRepeat: null,
      futureAction: null,
      positiveLevel: null,
      moodAfterWriting: null,
      moodNotes: null,
    };

    if (practice.form_data) {
      try {
        const formData = typeof practice.form_data === 'string' 
          ? JSON.parse(practice.form_data)
          : practice.form_data;
        
        if (formData && typeof formData === 'object') {
          data = {
            goodThing: formData.goodThing || formData.good_thing || null,
            whoWith: formData.whoWith || formData.who_with || null,
            feelings: formData.feelings || null,
            emotions: formData.emotions || null,
            otherEmotion: formData.otherEmotion || formData.other_emotion || null,
            reason: formData.reason || null,
            howToRepeat: formData.howToRepeat || formData.how_to_repeat || null,
            futureAction: formData.futureAction || formData.future_action || null,
            positiveLevel: formData.positiveScore || formData.positive_score || formData.positiveLevel || formData.positive_level || null,
            moodAfterWriting: formData.moodEmotions || formData.mood_emotions || formData.moodAfterWriting || formData.mood_after_writing || null,
            moodNotes: formData.moodNotes || formData.mood_notes || null,
          };
          
          console.log('📊 好事書寫資料:', {
            goodThing: data.goodThing,
            positiveLevel: data.positiveLevel,
            moodAfterWriting: data.moodAfterWriting,
          });
        }
      } catch (e) {
        console.log('解析好事練習 form_data 失敗:', e);
      }
    }

    return {
      goodThing: data.goodThing || practice.good_thing || null,
      whoWith: data.whoWith || practice.who_with || null,
      feelings: data.feelings || practice.feelings || null,
      emotions: data.emotions || practice.emotions || null,
      otherEmotion: data.otherEmotion || practice.other_emotion || null,
      reason: data.reason || practice.reason || null,
      howToRepeat: data.howToRepeat || practice.how_to_repeat || null,
      futureAction: data.futureAction || practice.future_action || null,
      positiveLevel: data.positiveLevel || practice.positive_level || practice.positive_score || null,
      moodAfterWriting: data.moodAfterWriting || practice.mood_after_writing || practice.mood_emotions || null,
      moodNotes: data.moodNotes || practice.mood_notes || null,
    };
  };

  const renderDetailModal = () => {
    if (!selectedPractice) return null;

    const totalSeconds = parseInt(selectedPractice.duration_seconds) || 0;
    const mood = selectedPractice.post_mood || selectedPractice.mood || '平靜';
    const practiceType = getPracticeType(selectedPractice.practice_type);
    const isGoodThingsPractice = practiceType === 'good-things' || 
                                  selectedPractice.practice_type?.includes('好事') ||
                                  selectedPractice.practice_type?.includes('感恩');

    const breathingData = !isGoodThingsPractice ? extractBreathingData(selectedPractice) : null;
    const goodThingData = isGoodThingsPractice ? extractGoodThingData(selectedPractice) : null;

    return (
      <Modal
        visible={detailModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={closeDetailModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            {/* Header */}
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
              {/* 練習後情緒卡片 */}
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

              {/* 完成日期 + 投入時間 */}
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

              {/* 呼吸練習內容 */}
              {!isGoodThingsPractice && breathingData && (
                <View style={styles.practiceContent}>
                  {/* 練習前狀態 */}
                  {breathingData.preMood && (
                    <View style={styles.section}>
                      <View style={styles.sectionHeader}>
                        <Heart color="#F59E0B" size={16} strokeWidth={2} />
                        <Text style={styles.sectionTitle}>練習前的狀態</Text>
                      </View>
                      <View style={styles.lightBox}>
                        <Text style={breathingData.preMood ? styles.contentText : styles.emptyContentText}>
                          {breathingData.preMood || '暫無紀錄'}
                        </Text>
                      </View>
                    </View>
                  )}

                  {/* 放鬆程度 */}
                  {breathingData.relaxLevel !== null && breathingData.relaxLevel !== undefined && (
                    <View style={styles.section}>
                      <View style={styles.sectionHeader}>
                        <Sparkles color="#31C6FE" size={16} strokeWidth={2} />
                        <Text style={styles.sectionTitle}>放鬆程度</Text>
                      </View>
                      <View style={styles.progressBarContainer}>
                        <View style={styles.blueGradientProgressBarWrapper}>
                          <LinearGradient
                            colors={['#166CB5', '#31C6FE']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.blueGradientProgressBar}
                          />
                          <View 
                            style={[
                              styles.blueGradientProgressMask, 
                              { width: `${100 - (breathingData.relaxLevel / 10) * 100}%` }
                            ]} 
                          />
                        </View>
                        <Text style={styles.blueProgressText}>{breathingData.relaxLevel}/10</Text>
                      </View>
                    </View>
                  )}

                  {/* 練習後感受 */}
                  {breathingData.postFeelings && (
                    <View style={styles.section}>
                      <View style={styles.sectionHeader}>
                        <Smile color="#10B981" size={16} strokeWidth={2} />
                        <Text style={styles.sectionTitle}>練習後的感受</Text>
                      </View>
                      <View style={styles.tagContainer}>
                        {(Array.isArray(breathingData.postFeelings) 
                          ? breathingData.postFeelings 
                          : breathingData.postFeelings.split(',')
                        ).map((feeling, idx) => (
                          <View key={idx} style={styles.greenTag}>
                            <Text style={styles.greenTagText}>{feeling.trim()}</Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  )}

                  {/* 練習筆記 - 只有 other_emotion 有值時才顯示 */}
                  {breathingData.journalEntry && (
                    <View style={styles.section}>
                      <View style={styles.sectionHeader}>
                        <BookOpen color="#6B7280" size={16} strokeWidth={2} />
                        <Text style={styles.sectionTitle}>練習筆記</Text>
                      </View>
                      <Text style={styles.noteText}>{breathingData.journalEntry}</Text>
                    </View>
                  )}
                </View>
              )}

              {/* 好事書寫內容 */}
              {isGoodThingsPractice && goodThingData && (
                <View style={styles.practiceContent}>
                  {/* 今天的好事 */}
                  {(goodThingData.goodThing || goodThingData.whoWith || goodThingData.feelings) && (
                    <View style={styles.section}>
                      <View style={styles.sectionHeader}>
                        <Sparkles color="#31C6FE" size={16} strokeWidth={2} />
                        <Text style={styles.sectionTitle}>今天的好事</Text>
                      </View>
                      <View style={styles.lightBlueBox}>
                        <Text style={styles.goodThingSubTitle}>發生了什麼</Text>
                        <Text style={goodThingData.goodThing ? styles.goodThingContent : styles.emptyContentText}>
                          {goodThingData.goodThing || '暫無紀錄'}
                        </Text>
                        
                        <Text style={[styles.goodThingSubTitle, { marginTop: 16 }]}>當時和誰在一起</Text>
                        <Text style={goodThingData.whoWith ? styles.goodThingContent : styles.emptyContentText}>
                          {goodThingData.whoWith || '暫無紀錄'}
                        </Text>
                        
                        <Text style={[styles.goodThingSubTitle, { marginTop: 16 }]}>當下的想法</Text>
                        <Text style={goodThingData.feelings ? styles.goodThingContent : styles.emptyContentText}>
                          {goodThingData.feelings || '暫無紀錄'}
                        </Text>
                      </View>
                    </View>
                  )}

                  {/* 這件事讓我感覺 */}
                  {goodThingData.emotions && (
                    <View style={styles.section}>
                      <View style={styles.sectionHeader}>
                        <Heart color="#EC4899" size={16} strokeWidth={2} />
                        <Text style={styles.sectionTitle}>這件事讓我感覺</Text>
                      </View>
                      {goodThingData.emotions ? (
                        <View style={styles.tagContainer}>
                          {(Array.isArray(goodThingData.emotions) 
                            ? goodThingData.emotions 
                            : goodThingData.emotions.split(',')
                          ).map((emotion, idx) => (
                            <View key={idx} style={styles.pinkTag}>
                              <Text style={styles.pinkTagText}>{emotion.trim()}</Text>
                            </View>
                          ))}
                        </View>
                      ) : (
                        <Text style={styles.emptyContentText}>暫無紀錄</Text>
                      )}
                    </View>
                  )}

                  {/* 為什麼是好事 */}
                  {goodThingData.reason && (
                    <View style={styles.section}>
                      <View style={styles.sectionHeader}>
                        <Lightbulb color="#9333EA" size={16} strokeWidth={2} />
                        <Text style={styles.sectionTitle}>為什麼是好事</Text>
                      </View>
                      <View style={styles.lightPurpleBox}>
                        <Text style={goodThingData.reason ? styles.contentText : styles.emptyContentText}>
                          {goodThingData.reason || '暫無紀錄'}
                        </Text>
                      </View>
                    </View>
                  )}

                  {/* 如何讓好事更常出現 */}
                  {goodThingData.howToRepeat && (
                    <View style={styles.section}>
                      <View style={styles.sectionHeader}>
                        <RefreshCw color="#10B981" size={16} strokeWidth={2} />
                        <Text style={styles.sectionTitle}>如何讓好事更常出現</Text>
                      </View>
                      <View style={styles.lightGreenBox}>
                        <Text style={goodThingData.howToRepeat ? styles.contentText : styles.emptyContentText}>
                          {goodThingData.howToRepeat || '暫無紀錄'}
                        </Text>
                      </View>
                    </View>
                  )}

                  {/* 好事複製小行動 */}
                  {goodThingData.futureAction && (
                    <View style={styles.section}>
                      <View style={styles.sectionHeader}>
                        <Target color="#F97316" size={16} strokeWidth={2} />
                        <Text style={styles.sectionTitle}>好事複製小行動</Text>
                      </View>
                      <View style={styles.lightOrangeBox}>
                        <Text style={goodThingData.futureAction ? styles.contentText : styles.emptyContentText}>
                          {goodThingData.futureAction || '暫無紀錄'}
                        </Text>
                      </View>
                    </View>
                  )}

                  {/* 正向感受程度 */}
                  {goodThingData.positiveLevel !== null && goodThingData.positiveLevel !== undefined && (
                    <View style={styles.section}>
                      <View style={styles.sectionHeader}>
                        <Sparkles color="#fac915ff" size={16} strokeWidth={2} />
                        <Text style={styles.sectionTitle}>正向感受程度</Text>
                      </View>
                      <View style={styles.progressBarContainer}>
                        <View style={styles.gradientProgressBarWrapper}>
                          <LinearGradient
                            colors={['#EC4899', '#F97316', '#FBBF24']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.gradientProgressBar}
                          />
                          <View 
                            style={[
                              styles.gradientProgressMask, 
                              { width: `${100 - (goodThingData.positiveLevel / 10) * 100}%` }
                            ]} 
                          />
                        </View>
                        <Text style={styles.gradientProgressText}>{goodThingData.positiveLevel}/10</Text>
                      </View>
                    </View>
                  )}

                  {/* 書寫後的心情 */}
                  {goodThingData.moodAfterWriting && (
                    <View style={styles.section}>
                      <View style={styles.sectionHeader}>
                        <Smile color="#3B82F6" size={16} strokeWidth={2} />
                        <Text style={styles.sectionTitle}>書寫後的心情</Text>
                      </View>
                      {goodThingData.moodAfterWriting ? (
                        <View style={styles.tagContainer}>
                          {(Array.isArray(goodThingData.moodAfterWriting) 
                            ? goodThingData.moodAfterWriting 
                            : goodThingData.moodAfterWriting.split(',')
                          ).map((mood, idx) => (
                            <View key={idx} style={styles.lightBlueTag}>
                              <Text style={styles.lightBlueTagText}>{mood.trim()}</Text>
                            </View>
                          ))}
                        </View>
                      ) : (
                        <Text style={styles.emptyContentText}>暫無紀錄</Text>
                      )}
                    </View>
                  )}

                  {/* 練習筆記 */}
                  {goodThingData.moodNotes && (
                    <View style={styles.section}>
                      <View style={styles.sectionHeader}>
                        <BookOpen color="#6B7280" size={16} strokeWidth={2} />
                        <Text style={styles.sectionTitle}>練習筆記</Text>
                      </View>
                      <Text style={styles.noteText}>{goodThingData.moodNotes}</Text>
                    </View>
                  )}
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

      {!isLoggedIn && (
        <LockedOverlay 
          navigation={navigation} 
          reason="login"
          message="登入後查看你的練習日記"
        />
      )}
      
      {isLoggedIn && !hasEnterpriseCode && (
        <LockedOverlay 
          navigation={navigation} 
          reason="enterprise-code"
          message="輸入企業引薦碼以解鎖日記功能"
        />
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
  emptyContentText: {
    fontSize: 15,
    color: '#D1D5DB',  // 淺灰色
    lineHeight: 24,
    fontStyle: 'italic',  // 斜體（可選）
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
  // ===== Modal Styles =====
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
  // 練習後情緒卡片
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
  // 完成日期 + 投入時間
  infoSection: {
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 12,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoDivider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 4,
  },
  infoTextBlock: {
    flex: 1,
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
  // 練習內容區
  practiceContent: {
    marginBottom: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#707680ff',
  },
  // 彩色背景框
  lightBox: {
    backgroundColor: '#fdf7eaff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#faebc9ff',
  },
  lightBlueBox: {
    backgroundColor: '#F0F9FF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#dbeafcff',
  },
  lightPurpleBox: {
    backgroundColor: '#FAF5FF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#f1e7fcff',
  },
  lightGreenBox: {
    backgroundColor: '#ECFDF5',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#def8ecff',
  },
  lightOrangeBox: {
    backgroundColor: '#FFF7ED',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#fdebd7ff',
  },
  goodThingSubTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 14,
  },
  goodThingContent: {
    fontSize: 15,
    color: '#424852ff',
    lineHeight: 22,
  },
  contentText: {
    fontSize: 15,
    color: '#111827',
    lineHeight: 24,
  },
  noteText: {
    fontSize: 15,
    color: '#374151',
    lineHeight: 24,
  },
  // 進度條樣式
  progressBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  // 藍色漸層進度條 (呼吸練習)
  blueGradientProgressBarWrapper: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    position: 'relative',
  },
  blueGradientProgressBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    height: 8,
    borderRadius: 4,
  },
  blueGradientProgressMask: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: '#E5E7EB',
    height: 8,
  },
  blueProgressText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3B82F6',
  },
  // 彩色漸層進度條 (好事書寫)
  gradientProgressBarWrapper: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    position: 'relative',
  },
  gradientProgressBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    height: 8,
    borderRadius: 4,
  },
  gradientProgressMask: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: '#E5E7EB',
    height: 8,
  },
  gradientProgressText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#EC4899',
  },
  // 標籤樣式
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  greenTag: {
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#bbfde2ff',
  },
  greenTagText: {
    fontSize: 14,
    color: '#047857',
    fontWeight: '500',
  },
  pinkTag: {
    backgroundColor: '#FCE7F3',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#facde6ff',
  },
  pinkTagText: {
    fontSize: 14,
    color: '#BE185D',
    fontWeight: '500',
  },
  lightBlueTag: {
    backgroundColor: '#e8f5faff',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#d3eef9ff',
  },
  lightBlueTagText: {
    fontSize: 14,
    color: '#188abbff',
    fontWeight: '500',
  },
});

export default DailyScreen;