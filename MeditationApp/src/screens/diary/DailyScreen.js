// ==========================================
// DailyScreen.js - 完整修正版（使用 API 獲取情緒統計）
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
  Users,
  Lightbulb,
  Target,
  Heart,
} from 'lucide-react-native';
import ApiService from '../../../api';
import BottomNavigation from '../../navigation/BottomNavigation';
import AppHeader from '../../navigation/AppHeader';

const { width } = Dimensions.get('window');

// ⭐ 只使用四種情緒顏色
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
  
  // ⭐ 新增：情緒統計狀態
  const [topEmotions, setTopEmotions] = useState([]);

  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedPractice, setSelectedPractice] = useState(null);

  const hasLoadedData = useRef(false);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchAllData();
    });

    if (!hasLoadedData.current) {
      fetchAllData();
    }

    return unsubscribe;
  }, [navigation]);

  useEffect(() => {
    filterDataForCurrentMonth(allPracticeData);
    // ⭐ 當月份改變時，重新獲取情緒統計
    fetchEmotionStats();
  }, [currentMonth]);

  const fetchAllData = async () => {
    try {
      setLoading(true);

      const practiceResponse = await ApiService.getPracticeHistory();

      if (practiceResponse.practices) {
        setAllPracticeData(practiceResponse.practices);
        hasLoadedData.current = true;
        filterDataForCurrentMonth(practiceResponse.practices);
      }
      
      // ⭐ 獲取情緒統計
      await fetchEmotionStats();
      
    } catch (error) {
      console.error('❌ 獲取數據失敗:', error);
    } finally {
      setLoading(false);
    }
  };

  // ⭐ 新增：從 API 獲取情緒統計
  const fetchEmotionStats = async () => {
    try {
      const year = currentMonth.getFullYear();
      const month = currentMonth.getMonth() + 1;
      
      const response = await ApiService.getEmotionStats(year, month);
      
      if (response.success && response.emotions) {
        setTopEmotions(response.emotions);
        
        // 如果 API 有返回 averageScore，也更新心理肌力分數
        if (response.averageScore !== undefined) {
          setStats(prev => ({
            ...prev,
            mentalMuscle: Math.round(response.averageScore),
          }));
        }
      }
    } catch (error) {
      console.error('❌ 獲取情緒統計失敗:', error);
      // 如果 API 失敗，退回到本地計算
      calculateEmotionsFromData();
    }
  };
  
  // ⭐ 備用方案：從本地數據計算情緒統計
  const calculateEmotionsFromData = () => {
    if (displayData.length === 0) {
      setTopEmotions([]);
      return;
    }

    const emotionCount = {};
    displayData.forEach((record) => {
      const mood = record.post_mood || record.mood || '平靜';
      emotionCount[mood] = (emotionCount[mood] || 0) + 1;
    });

    const emotions = Object.entries(emotionCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([emotion, count]) => ({ emotion, count }));
    
    setTopEmotions(emotions);
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

  // 日曆相關
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

  // ⭐ 判斷練習類型
  const getPracticeType = (practiceTypeName) => {
    if (practiceTypeName?.includes('好事') || practiceTypeName?.includes('感恩')) {
      return 'good-things';
    }
    if (practiceTypeName?.includes('呼吸') || practiceTypeName?.includes('4-6') || practiceTypeName?.includes('屏息')) {
      return 'breathing';
    }
    return 'breathing';
  };

  // ⭐ 渲染詳情 Modal - 完整還原設計稿
  const renderDetailModal = () => {
    if (!selectedPractice) return null;

    const totalSeconds = parseInt(selectedPractice.duration_seconds) || 0;
    const mood = selectedPractice.post_mood || selectedPractice.mood || '平靜';
    const practiceType = getPracticeType(selectedPractice.practice_type);

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

              {/* 基本資訊 - 完成日期 + 投入時間 */}
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

              {/* ===== 呼吸練習專屬欄位 ===== */}
              {practiceType === 'breathing' && (
                <>
                  {/* 練習前情緒 */}
                  {selectedPractice.pre_mood && (
                    <View style={styles.preMoodSection}>
                      <View style={styles.sectionHeader}>
                        <Heart color="#F59E0B" size={16} strokeWidth={2} />
                        <Text style={styles.sectionTitle}>練習前的狀態</Text>
                      </View>
                      <View style={[styles.contentCard, styles.amberCard]}>
                        <Text style={styles.contentText}>
                          {selectedPractice.pre_mood}
                        </Text>
                      </View>
                    </View>
                  )}

                  {/* 放鬆程度 */}
                  {selectedPractice.relax_level && (
                    <View style={styles.metricSection}>
                      <View style={styles.metricHeader}>
                        <Sparkles color="#31C6FE" size={18} strokeWidth={2} />
                        <Text style={styles.metricTitle}>
                          {selectedPractice.practice_type?.includes('4-6') 
                            ? '放鬆程度' 
                            : '呼吸穩定程度'}
                        </Text>
                      </View>
                      <View style={styles.metricBarContainer}>
                        <View style={styles.metricBarBg}>
                          <LinearGradient
                            colors={['#166CB5', '#31C6FE']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={[
                              styles.metricBarFill,
                              {
                                width: `${
                                  (parseFloat(selectedPractice.relax_level) / 10) *
                                  100
                                }%`,
                              },
                            ]}
                          />
                        </View>
                        <Text style={styles.metricScore}>
                          {selectedPractice.relax_level}/10
                        </Text>
                      </View>
                    </View>
                  )}

                  {/* 練習後的感受 - 顯示為標籤 */}
                  {selectedPractice.post_feelings && (
                    <View style={styles.postFeelingsSection}>
                      <View style={styles.sectionHeader}>
                        <Smile color="#10B981" size={16} strokeWidth={2} />
                        <Text style={styles.sectionTitle}>練習後的感受</Text>
                      </View>
                      <View style={styles.feelingTags}>
                        {selectedPractice.post_feelings.split(',').map((feeling, index) => (
                          <View key={index} style={styles.feelingTag}>
                            <Text style={styles.feelingTagText}>{feeling.trim()}</Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  )}
                </>
              )}

              {/* ===== 好事書寫專屬欄位 ===== */}
              {practiceType === 'good-things' && (
                <>
                  {/* 好事內容 - 合併三個問題 */}
                  {(selectedPractice.good_thing || selectedPractice.who_with || selectedPractice.feelings) && (
                    <View style={styles.goodThingSection}>
                      <View style={styles.sectionHeader}>
                        <Sparkles color="#31C6FE" size={16} strokeWidth={2} />
                        <Text style={styles.sectionTitle}>今天的好事</Text>
                      </View>
                      <View style={styles.contentCard}>
                        {selectedPractice.good_thing && (
                          <View style={styles.goodThingItem}>
                            <Text style={styles.goodThingLabel}>發生了什麼</Text>
                            <Text style={styles.contentText}>
                              {selectedPractice.good_thing}
                            </Text>
                          </View>
                        )}
                        
                        {selectedPractice.who_with && (
                          <View style={styles.goodThingItem}>
                            <Text style={styles.goodThingLabel}>當時和誰在一起</Text>
                            <Text style={styles.contentText}>
                              {selectedPractice.who_with}
                            </Text>
                          </View>
                        )}
                        
                        {selectedPractice.feelings && (
                          <View style={styles.goodThingItem}>
                            <Text style={styles.goodThingLabel}>當下的想法</Text>
                            <Text style={styles.contentText}>
                              {selectedPractice.feelings}
                            </Text>
                          </View>
                        )}
                      </View>
                    </View>
                  )}

                  {/* 我的感受 - 情緒標籤 */}
                  {selectedPractice.emotions && (
                    <View style={styles.emotionsSection}>
                      <View style={styles.sectionHeader}>
                        <Heart color="#FF6B9D" size={16} strokeWidth={2} />
                        <Text style={styles.sectionTitle}>這件事讓我感覺</Text>
                      </View>
                      <View style={styles.emotionTags}>
                        {selectedPractice.emotions.split(',').map((emotion, index) => (
                          <View key={index} style={styles.emotionTag}>
                            <Text style={styles.emotionTagText}>{emotion.trim()}</Text>
                          </View>
                        ))}
                      </View>
                      {selectedPractice.other_emotion && (
                        <View style={[styles.contentCard, styles.pinkCard, { marginTop: 12 }]}>
                          <Text style={styles.contentText}>
                            {selectedPractice.other_emotion}
                          </Text>
                        </View>
                      )}
                    </View>
                  )}

                  {/* 為什麼是好事 */}
                  {selectedPractice.reason && (
                    <View style={styles.reasonSection}>
                      <View style={styles.sectionHeader}>
                        <Lightbulb color="#9333EA" size={16} strokeWidth={2} />
                        <Text style={styles.sectionTitle}>為什麼是好事</Text>
                      </View>
                      <View style={[styles.contentCard, styles.purpleCard]}>
                        <Text style={styles.contentText}>
                          {selectedPractice.reason}
                        </Text>
                      </View>
                    </View>
                  )}

                  {/* 如何讓好事更常出現 */}
                  {selectedPractice.how_to_repeat && (
                    <View style={styles.howToRepeatSection}>
                      <View style={styles.sectionHeader}>
                        <TrendingUp color="#10B981" size={16} strokeWidth={2} />
                        <Text style={styles.sectionTitle}>如何讓好事更常出現</Text>
                      </View>
                      <View style={[styles.contentCard, styles.greenCard]}>
                        <Text style={styles.contentText}>
                          {selectedPractice.how_to_repeat}
                        </Text>
                      </View>
                    </View>
                  )}

                  {/* 未來可以做的小行動 */}
                  {selectedPractice.future_action && (
                    <View style={styles.futureSection}>
                      <View style={styles.sectionHeader}>
                        <Target color="#F59E0B" size={16} strokeWidth={2} />
                        <Text style={styles.sectionTitle}>好事複製小行動</Text>
                      </View>
                      <View style={[styles.contentCard, styles.amberCard]}>
                        <Text style={styles.contentText}>
                          {selectedPractice.future_action}
                        </Text>
                      </View>
                    </View>
                  )}

                  {/* 正向感受程度 */}
                  {selectedPractice.positive_level && (
                    <View style={styles.metricSection}>
                      <View style={styles.metricHeader}>
                        <Sparkles color="#FFD93D" size={18} strokeWidth={2} />
                        <Text style={styles.metricTitle}>正向感受程度</Text>
                      </View>
                      <View style={styles.metricBarContainer}>
                        <View style={styles.metricBarBg}>
                          <LinearGradient
                            colors={['#FF6B9D', '#FFD93D']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={[
                              styles.metricBarFill,
                              {
                                width: `${
                                  (parseFloat(selectedPractice.positive_level) / 10) *
                                  100
                                }%`,
                              },
                            ]}
                          />
                        </View>
                        <Text style={[styles.metricScore, { color: '#FF6B9D' }]}>
                          {selectedPractice.positive_level}/10
                        </Text>
                      </View>
                    </View>
                  )}

                  {/* 書寫後心情 - 標籤形式 */}
                  {selectedPractice.mood_after_writing && (
                    <View style={styles.moodAfterSection}>
                      <View style={styles.sectionHeader}>
                        <Smile color="#06B6D4" size={16} strokeWidth={2} />
                        <Text style={styles.sectionTitle}>書寫後的心情</Text>
                      </View>
                      <View style={styles.moodAfterTags}>
                        {selectedPractice.mood_after_writing.split(',').map((mood, index) => (
                          <View key={index} style={styles.moodAfterTag}>
                            <Text style={styles.moodAfterTagText}>{mood.trim()}</Text>
                          </View>
                        ))}
                      </View>
                      {selectedPractice.mood_notes && (
                        <View style={[styles.contentCard, styles.cyanCard, { marginTop: 12 }]}>
                          <Text style={styles.contentText}>
                            {selectedPractice.mood_notes}
                          </Text>
                        </View>
                      )}
                    </View>
                  )}
                </>
              )}

              {/* 筆記 */}
              {selectedPractice.journal_entry && (
                <View style={styles.journalSection}>
                  <View style={styles.journalHeader}>
                    <View style={styles.iconCircle}>
                      <BookOpen color="#6B7280" size={18} strokeWidth={2} />
                    </View>
                    <Text style={styles.journalTitle}>練習筆記</Text>
                  </View>
                  <Text style={styles.journalText}>
                    {selectedPractice.journal_entry}
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
        {/* 月份導航 & 統計卡片 */}
        <View style={styles.statsCard}>
          {/* 月份選擇器 */}
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

          {/* 統計指標 */}
          <View style={styles.statsGrid}>
            {/* 月累計練習 */}
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

            {/* 心理肌力分數 */}
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

          {/* 月累計練習和心理肌力分數的介紹卡片 */}
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

          {/* 本月心情快照 */}
          {topEmotions.length > 0 && (
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
                    {topEmotions.map(({ emotion, count }) => (
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

              {/* 本月心情快照的介紹卡片 */}
              {showInfoCard === 'mood' && (
                <View style={styles.infoCardContainer}>
                  <View style={[styles.infoCard, { borderColor: '#FFEDD5' }]}>
                    <View style={styles.infoCardHeader}>
                      <Smile color="#F59E0B" size={14} strokeWidth={2} />
                      <Text style={styles.infoCardTitle}>本月心情快照</Text>
                    </View>
                    <Text style={styles.infoCardText}>
                      統計練習後最常出現的情緒狀態(Top 3),數字代表出現次數。
                    </Text>
                  </View>
                </View>
              )}
            </>
          )}
        </View>

        {/* 視圖模式切換 */}
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

        {/* 日曆視圖 */}
        {viewMode === 'calendar' && (
          <View style={styles.calendarView}>
            <View style={styles.calendarGrid}>
              {/* 星期標題 */}
              {['日', '一', '二', '三', '四', '五', '六'].map((day) => (
                <View key={day} style={styles.calendarWeekday}>
                  <Text style={styles.calendarWeekdayText}>{day}</Text>
                </View>
              ))}

              {/* 日期格子 */}
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

            {/* 圖例 */}
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

        {/* 列表視圖 */}
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
                    {/* 日期圓圈 */}
                    <View
                      style={[
                        styles.recordDateCircle,
                        { backgroundColor: getMoodColor(mood) },
                      ]}
                    >
                      <Text style={styles.recordDay}>{day}</Text>
                      <Text style={styles.recordWeekday}>週{weekday}</Text>
                    </View>

                    {/* 內容 */}
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
    </View>
  );
};

// ⭐ 樣式保持不變...
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },

  // 統計卡片
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

  // 視圖模式切換
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

  // 日曆視圖
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

  // 列表視圖
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

  // 空狀態
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

  // Modal 樣式
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

  // 基本資訊區塊
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

  // 呼吸練習專屬樣式
  preMoodSection: {
    marginBottom: 20,
  },
  amberCard: {
    backgroundColor: '#FFF7ED',
    borderColor: '#FFEDD5',
  },
  postFeelingsSection: {
    marginBottom: 20,
  },
  feelingTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  feelingTag: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#D1FAE5',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  feelingTagText: {
    fontSize: 12,
    color: '#065F46',
    fontWeight: '500',
  },

  // 好事書寫專屬樣式
  goodThingSection: {
    marginBottom: 20,
  },
  goodThingItem: {
    marginBottom: 16,
  },
  goodThingLabel: {
    fontSize: 14,
    color: '#23272fff',
    marginBottom: 16,
    fontWeight: '700',
  },
  emotionsSection: {
    marginBottom: 20,
  },
  emotionTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  emotionTag: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#FCE7F3',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#FBCFE8',
  },
  emotionTagText: {
    fontSize: 12,
    color: '#9F1239',
    fontWeight: '500',
  },
  pinkCard: {
    backgroundColor: '#FFF1F2',
    borderColor: '#FFE4E6',
  },
  reasonSection: {
    marginBottom: 20,
  },
  howToRepeatSection: {
    marginBottom: 20,
  },
  futureSection: {
    marginBottom: 20,
  },
  moodAfterSection: {
    marginBottom: 20,
  },
  moodAfterTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  moodAfterTag: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#E0F2FE',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#BAE6FD',
  },
  moodAfterTagText: {
    fontSize: 12,
    color: '#075985',
    fontWeight: '500',
  },
  cyanCard: {
    backgroundColor: '#ECFEFF',
    borderColor: '#CFFAFE',
  },

  // 放鬆程度/正向感受區塊
  metricSection: {
    marginBottom: 20,
  },
  metricHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  metricTitle: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '600',
  },
  metricBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  metricBarBg: {
    flex: 1,
    height: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 4,
    overflow: 'hidden',
  },
  metricBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  metricScore: {
    fontSize: 14,
    color: '#166CB5',
    fontWeight: '600',
  },

  // 共用內容卡片樣式
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '600',
  },
  contentCard: {
    backgroundColor: '#EFF6FF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  contentText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 22,
  },
  purpleCard: {
    backgroundColor: '#FAF5FF',
    borderColor: '#F3E8FF',
  },
  greenCard: {
    backgroundColor: '#ECFDF5',
    borderColor: '#D1FAE5',
  },

  // 筆記區塊
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
});

export default DailyScreen;