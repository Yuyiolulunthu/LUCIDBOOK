// ==========================================
// DailyScreen.js
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
  X,
  Heart,
  Lightbulb,
  RefreshCw,
  Target,
  Clock,
  FileText,
  Brain,
  MessageCircle,
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

const PLAN_CATEGORIES = {
  all: '全部',
  emotional: '情緒抗壓力',
};

const EMOTIONAL_PLAN_TYPES = ['呼吸', '好事', '思維', '感恩', '心情溫度計', '4-6', '屏息'];

const DailyScreen = ({ navigation }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [allPracticeData, setAllPracticeData] = useState([]);
  const [displayData, setDisplayData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalPractices: 0, totalDuration: 0 });
  const [viewMode, setViewMode] = useState('list');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [hasEnterpriseCode, setHasEnterpriseCode] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedPractice, setSelectedPractice] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState('all');
  const hasLoadedData = useRef(false);

  useFocusEffect(
    React.useCallback(() => {
      checkAccess();
      if (!hasLoadedData.current) fetchAllData();
      return () => {};
    }, [])
  );

  useEffect(() => {
    filterDataForCurrentMonth(allPracticeData);
  }, [currentMonth, selectedPlan]);

  const checkAccess = async () => {
    try {
      const loggedIn = await ApiService.isLoggedIn();
      setIsLoggedIn(loggedIn);
      if (loggedIn) {
        const profile = await ApiService.getUserProfile();
        setHasEnterpriseCode(!!profile.user.enterprise_code);
      } else {
        setHasEnterpriseCode(false);
      }
    } catch (error) {
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
    } catch (error) {
      console.error('獲取數據失敗:', error);
    } finally {
      setLoading(false);
    }
  };

  const isEmotionalPlanPractice = (practiceType) => {
    if (!practiceType) return false;
    return EMOTIONAL_PLAN_TYPES.some(type => practiceType.includes(type));
  };

  const filterDataForCurrentMonth = (practices) => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    let filtered = practices.filter((practice) => {
      const practiceDate = new Date(practice.completed_at);
      const isCompleted = String(practice.completed) === '1' || practice.completed === 1;
      return isCompleted && practiceDate.getFullYear() === year && practiceDate.getMonth() === month;
    });

    if (selectedPlan === 'emotional') {
      filtered = filtered.filter(p => isEmotionalPlanPractice(p.practice_type));
    }

    setDisplayData(filtered);
    calculateStats(filtered);
  };

  const calculateStats = (practices) => {
    const totalPractices = practices.length;
    let totalDuration = 0;
    practices.forEach((p) => {
      if (p.duration_seconds) totalDuration += parseInt(p.duration_seconds) || 0;
    });
    setStats({ totalPractices, totalDuration });
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
    if (mins > 0 && secs > 0) return `${mins}分${secs}秒`;
    if (mins > 0) return `${mins}分鐘`;
    return `${secs}秒`;
  };

  const formatStatsDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hours > 0) return `${hours}時${mins}分`;
    if (mins > 0) return `${mins}分${secs}秒`;
    return `${secs}秒`;
  };

  const getMoodColor = (mood) => moodColors[mood] || '#9CA3AF';

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const generateCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    const days = [];
    for (let i = 0; i < startingDayOfWeek; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(i);
    return days;
  };

  const days = generateCalendarDays();

  const getRecordForDate = (day) => {
    const dateStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return displayData.find((r) => r.completed_at?.startsWith(dateStr));
  };

  const hasRecordOnDate = (day) => !!getRecordForDate(day);

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

  const getPracticeType = (name) => {
    if (!name) return 'other';
    if (name.includes('好事') || name.includes('感恩書寫')) return 'good-things';
    if (name.includes('呼吸') || name.includes('4-6') || name.includes('屏息')) return 'breathing';
    if (name.includes('思維') || name.includes('調節')) return 'cognitive';
    if (name.includes('感恩')) return 'gratitude';
    return 'other';
  };

  const getPlanName = (type) => isEmotionalPlanPractice(type) ? '情緒抗壓力' : '其他';

  const extractBreathingData = (practice) => {
    let data = { relaxLevel: practice.relax_level || practice.positive_level || null, postFeelings: practice.post_feelings || practice.feelings || null };
    if (practice.form_data) {
      try {
        const fd = typeof practice.form_data === 'string' ? JSON.parse(practice.form_data) : practice.form_data;
        if (fd) {
          data.relaxLevel = data.relaxLevel || fd.relax_level || fd.relaxLevel || null;
          data.postFeelings = data.postFeelings || fd.post_feelings || fd.postFeelings || null;
        }
      } catch (e) {}
    }
    return data;
  };

  const extractGoodThingData = (practice) => {
    let data = { goodThing: null, reason: null, futureAction: null, newDiscovery: null };
    if (practice.form_data) {
      try {
        const fd = typeof practice.form_data === 'string' ? JSON.parse(practice.form_data) : practice.form_data;
        if (fd) data = { goodThing: fd.goodThing || fd.good_thing, reason: fd.reason, futureAction: fd.futureAction || fd.future_action, newDiscovery: fd.newDiscovery || fd.new_discovery };
      } catch (e) {}
    }
    return data;
  };

  const extractCognitiveData = (practice) => {
    let data = { event: null, originalThought: null, reaction: null, newThought: null };
    if (practice.form_data) {
      try {
        const fd = typeof practice.form_data === 'string' ? JSON.parse(practice.form_data) : practice.form_data;
        if (fd) data = { event: fd.event || fd.situation, originalThought: fd.originalThought || fd.original_thought, reaction: fd.reaction || fd.emotion, newThought: fd.newThought || fd.new_thought };
      } catch (e) {}
    }
    return data;
  };

  const extractGratitudeData = (practice) => {
    let data = { gratitudeContent: null, happinessLevel: null, relatedEmotions: null };
    if (practice.form_data) {
      try {
        const fd = typeof practice.form_data === 'string' ? JSON.parse(practice.form_data) : practice.form_data;
        if (fd) data = { gratitudeContent: fd.gratitudeContent || fd.content, happinessLevel: fd.happinessLevel || fd.positiveLevel, relatedEmotions: fd.relatedEmotions || fd.emotions };
      } catch (e) {}
    }
    return data;
  };

  const renderDetailModal = () => {
    if (!selectedPractice) return null;
    const totalSeconds = parseInt(selectedPractice.duration_seconds) || 0;
    const practiceType = getPracticeType(selectedPractice.practice_type);
    const planName = getPlanName(selectedPractice.practice_type);
    const isBreathing = practiceType === 'breathing';
    const isGoodThings = practiceType === 'good-things';
    const isCognitive = practiceType === 'cognitive';
    const isGratitude = practiceType === 'gratitude';
    const isMoodThermometer = selectedPractice.practice_type?.includes('心情溫度計');
    const breathingData = isBreathing ? extractBreathingData(selectedPractice) : null;
    const goodThingData = isGoodThings ? extractGoodThingData(selectedPractice) : null;
    const cognitiveData = isCognitive ? extractCognitiveData(selectedPractice) : null;
    const gratitudeData = isGratitude ? extractGratitudeData(selectedPractice) : null;

    // 格式化日期
    const formatModalDate = (dateStr) => {
      const date = new Date(dateStr);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const weekdays = ['週日', '週一', '週二', '週三', '週四', '週五', '週六'];
      const weekday = weekdays[date.getDay()];
      return `${year}/${month}/${day} (${weekday})`;
    };

    // 格式化時長
    const formatModalDuration = (seconds) => {
      const mins = Math.floor(seconds / 60);
      return `${mins} 分鐘`;
    };

    return (
      <Modal visible={detailModalVisible} transparent animationType="fade" onRequestClose={closeDetailModal}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            {/* 關閉按鈕 */}
            <TouchableOpacity style={styles.modalCloseBtn} onPress={closeDetailModal}>
              <X color="#9CA3AF" size={20} strokeWidth={2} />
            </TouchableOpacity>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* 標題區塊 */}
              <Text style={styles.modalTitle}>{selectedPractice.practice_type}</Text>
              <Text style={styles.modalDate}>{formatModalDate(selectedPractice.completed_at)}</Text>
              
              <View style={styles.modalInfoRow}>
                <View style={styles.modalInfoItem}>
                  <Clock color="#9CA3AF" size={14} strokeWidth={1.5} />
                  <Text style={styles.modalInfoText}>{formatModalDuration(totalSeconds)}</Text>
                </View>
                <View style={styles.modalInfoItem}>
                  <FileText color="#9CA3AF" size={14} strokeWidth={1.5} />
                  <Text style={styles.modalInfoText}>{planName}</Text>
                </View>
              </View>

              {/* 呼吸練習成效 */}
              {isBreathing && breathingData && (breathingData.relaxLevel !== null || breathingData.postFeelings) && (
                <View style={styles.modalSection}>
                  <View style={styles.modalSectionHeader}>
                    <Sparkles color="#166CB5" size={14} />
                    <Text style={styles.modalSectionTitle}>練習成效</Text>
                  </View>
                  {breathingData.relaxLevel !== null && (
                    <View style={styles.relaxLevelRow}>
                      <Text style={styles.relaxLevelLabel}>放鬆程度</Text>
                      <Text style={styles.relaxLevelValue}>{breathingData.relaxLevel}</Text>
                      <Text style={styles.relaxLevelMax}>/10</Text>
                    </View>
                  )}
                  {breathingData.postFeelings && (
                    <View style={styles.feelingsRow}>
                      {(Array.isArray(breathingData.postFeelings) ? breathingData.postFeelings : breathingData.postFeelings.split(',')).map((f, i) => (
                        <View key={i} style={styles.feelingTag}><Text style={styles.feelingTagText}>{f.trim()}</Text></View>
                      ))}
                    </View>
                  )}
                </View>
              )}

              {/* 好事書寫 */}
              {isGoodThings && goodThingData && (
                <>
                  {goodThingData.goodThing && (
                    <View style={styles.modalSectionBlue}>
                      <View style={styles.modalSectionHeader}>
                        <Sparkles color="#166CB5" size={14} />
                        <Text style={styles.modalSectionTitleBlue}>好事紀錄</Text>
                      </View>
                      <Text style={styles.modalSectionContent}>{goodThingData.goodThing}</Text>
                    </View>
                  )}
                  {goodThingData.reason && (
                    <View style={styles.modalSectionGray}>
                      <Text style={styles.modalSectionLabelGray}>發生原因</Text>
                      <Text style={styles.modalSectionContent}>{goodThingData.reason}</Text>
                    </View>
                  )}
                  {goodThingData.futureAction && (
                    <View style={styles.modalSectionGray}>
                      <Text style={styles.modalSectionLabelGray}>下一步行動</Text>
                      <Text style={styles.modalSectionContent}>{goodThingData.futureAction}</Text>
                    </View>
                  )}
                  {goodThingData.newDiscovery && (
                    <View style={styles.modalSectionGray}>
                      <Text style={styles.modalSectionLabelGray}>新發現</Text>
                      <Text style={styles.modalSectionContent}>{goodThingData.newDiscovery}</Text>
                    </View>
                  )}
                </>
              )}

              {/* 思維調節 */}
              {isCognitive && cognitiveData && (
                <>
                  {cognitiveData.event && (
                    <View style={styles.modalSectionGray}>
                      <Text style={styles.modalSectionLabelGray}>事件 (A)</Text>
                      <Text style={styles.modalSectionContent}>{cognitiveData.event}</Text>
                    </View>
                  )}
                  {cognitiveData.originalThought && (
                    <View style={styles.modalSectionRed}>
                      <Text style={styles.modalSectionLabelRed}>原本的想法 (B)</Text>
                      <Text style={styles.modalSectionContent}>{cognitiveData.originalThought}</Text>
                      {cognitiveData.reaction && (
                        <View style={styles.emotionTags}>
                          <View style={styles.emotionTagRed}><Text style={styles.emotionTagRedText}>失落</Text></View>
                          <View style={styles.emotionTagRed}><Text style={styles.emotionTagRedText}>羞愧</Text></View>
                        </View>
                      )}
                    </View>
                  )}
                  {cognitiveData.newThought && (
                    <View style={styles.modalSectionGreen}>
                      <Text style={styles.modalSectionLabelGreen}>轉念後 (D)</Text>
                      <Text style={styles.modalSectionContent}>{cognitiveData.newThought}</Text>
                    </View>
                  )}
                </>
              )}

              {/* 感恩練習 */}
              {isGratitude && gratitudeData && (
                <>
                  {gratitudeData.gratitudeContent && (
                    <View style={styles.modalSectionPink}>
                      <View style={styles.modalSectionHeader}>
                        <Heart color="#EC4899" size={14} />
                        <Text style={styles.modalSectionTitlePink}>感恩日記內容</Text>
                      </View>
                      <Text style={styles.modalSectionContent}>{gratitudeData.gratitudeContent}</Text>
                    </View>
                  )}
                  <View style={styles.gratitudeRow}>
                    {gratitudeData.happinessLevel !== null && (
                      <View style={styles.gratitudeBox}>
                        <Text style={styles.gratitudeLabel}>幸福感指數</Text>
                        <View style={styles.gratitudeValueRow}>
                          <Text style={styles.gratitudeValue}>{gratitudeData.happinessLevel}</Text>
                          <Text style={styles.gratitudeMax}>/10</Text>
                        </View>
                      </View>
                    )}
                    {gratitudeData.relatedEmotions && (
                      <View style={styles.gratitudeBox}>
                        <Text style={styles.gratitudeLabel}>相關情緒</Text>
                        <View style={styles.emotionTagsSmall}>
                          {(Array.isArray(gratitudeData.relatedEmotions) ? gratitudeData.relatedEmotions : gratitudeData.relatedEmotions.split(',')).slice(0, 2).map((e, i) => (
                            <View key={i} style={styles.emotionTagBlue}><Text style={styles.emotionTagBlueText}>{e.trim()}</Text></View>
                          ))}
                        </View>
                      </View>
                    )}
                  </View>
                </>
              )}

              <View style={{ height: 20 }} />
            </ScrollView>
          </View>
        </View>
      </Modal>
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
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
        
        {/* ===== 上半部：兩個統計框 ===== */}
        <View style={styles.statsCard}>
          <View style={styles.statsRow}>
            {/* 本月練習次數 - 淺藍背景 #E8F4FD */}
            <View style={styles.statBoxBlue}>
              <View style={styles.statInfoIcon}>
                <Info color="#2563EB" size={14} strokeWidth={2} />
              </View>
              <TrendingUp color="#2563EB" size={24} strokeWidth={2} />
              <Text style={styles.statValueBlue}>{stats.totalPractices}</Text>
              <Text style={styles.statLabel}>本月練習次數</Text>
            </View>

            {/* 本月練習時間 - 淺紫背景 #F3E8FF */}
            <View style={styles.statBoxPurple}>
              <View style={styles.statInfoIcon}>
                <Info color="#9333EA" size={14} strokeWidth={2} />
              </View>
              <Clock color="#9333EA" size={24} strokeWidth={2} />
              <Text style={styles.statValuePurple}>{formatStatsDuration(stats.totalDuration)}</Text>
              <Text style={styles.statLabel}>本月練習時間</Text>
            </View>
          </View>
        </View>

        {/* ===== 下半部：100% Figma 設計 ===== */}

        {/* 月份選擇器 + 列表/日曆切換（同一行） */}
        <View style={styles.monthAndToggleRow}>
          {/* 月份選擇器 - 白色圓角卡片 */}
          <View style={styles.monthSelector}>
            <TouchableOpacity onPress={handlePrevMonth} style={styles.monthArrow}>
              <ChevronLeft color="#C4C4C4" size={24} strokeWidth={2} />
            </TouchableOpacity>
            <Text style={styles.monthText}>{currentMonth.getFullYear()}年{currentMonth.getMonth() + 1}月</Text>
            <TouchableOpacity onPress={handleNextMonth} style={styles.monthArrow}>
              <ChevronRight color="#C4C4C4" size={24} strokeWidth={2} />
            </TouchableOpacity>
          </View>

          {/* 列表/日曆切換 - 白色圓角 */}
          <View style={styles.viewToggle}>
            <TouchableOpacity
              onPress={() => setViewMode('list')}
              style={[styles.viewToggleBtn, viewMode === 'list' && styles.viewToggleBtnActive]}
            >
              <List color={viewMode === 'list' ? '#166CB5' : '#C4C4C4'} size={20} strokeWidth={2} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setViewMode('calendar')}
              style={[styles.viewToggleBtn, viewMode === 'calendar' && styles.viewToggleBtnActive]}
            >
              <Grid3X3 color={viewMode === 'calendar' ? '#166CB5' : '#C4C4C4'} size={20} strokeWidth={2} />
            </TouchableOpacity>
          </View>
        </View>

        {/* 篩選按鈕（獨立膠囊形狀） */}
        <View style={styles.filterRow}>
          <TouchableOpacity onPress={() => setSelectedPlan('all')} activeOpacity={0.8}>
            <View style={selectedPlan === 'all' ? styles.filterPillActive : styles.filterPillInactive}>
              <Text style={selectedPlan === 'all' ? styles.filterPillActiveText : styles.filterPillInactiveText}>全部</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setSelectedPlan('emotional')} activeOpacity={0.8}>
            <View style={selectedPlan === 'emotional' ? styles.filterPillActive : styles.filterPillInactive}>
              <Text style={selectedPlan === 'emotional' ? styles.filterPillActiveText : styles.filterPillInactiveText}>情緒抗壓力</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* 日曆視圖 */}
        {viewMode === 'calendar' && (
          <View style={styles.contentCard}>
            <View style={styles.calendarGrid}>
              {['日', '一', '二', '三', '四', '五', '六'].map((d) => (
                <View key={d} style={styles.calendarWeekday}><Text style={styles.calendarWeekdayText}>{d}</Text></View>
              ))}
              {days.map((day, idx) => {
                if (!day) return <View key={`e-${idx}`} style={styles.calendarDay} />;
                const hasRecord = hasRecordOnDate(day);
                return (
                  <TouchableOpacity key={day} onPress={() => handleDayClick(day)} disabled={!hasRecord} style={styles.calendarDay}>
                    <Text style={[styles.calendarDayText, hasRecord && styles.calendarDayTextActive]}>{day}</Text>
                    {hasRecord && <View style={styles.calendarDot} />}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

        {/* 列表視圖 / 空狀態 */}
        {viewMode === 'list' && (
          <>
            {displayData.length > 0 ? (
              <View style={styles.listContainer}>
                {displayData.map((record, index) => {
                  const totalSeconds = parseInt(record.duration_seconds) || 0;
                  const planName = getPlanName(record.practice_type);
                  const practiceType = getPracticeType(record.practice_type);
                  

                  
                  // 格式化日期為 2025/11/08 (週六) 格式
                  const formatRecordDate = (dateStr) => {
                    const date = new Date(dateStr);
                    const year = date.getFullYear();
                    const month = String(date.getMonth() + 1).padStart(2, '0');
                    const day = String(date.getDate()).padStart(2, '0');
                    const weekdays = ['週日', '週一', '週二', '週三', '週四', '週五', '週六'];
                    const weekday = weekdays[date.getDay()];
                    return `${year}/${month}/${day} (${weekday})`;
                  };

                  // 格式化時長
                  const formatRecordDuration = (seconds) => {
                    const mins = Math.floor(seconds / 60);
                    const secs = seconds % 60;
                    if (secs === 0) return `${String(mins).padStart(2, '0')}:00 分鐘`;
                    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')} 分鐘`;
                  };

                  return (
                    <TouchableOpacity key={index} style={styles.recordCard} onPress={() => openDetailModal(record)} activeOpacity={0.7}>
    
    
                      <Text style={styles.recordTitle}>{record.practice_type}</Text>
                      <View style={styles.recordFooter}>
                        <View style={styles.recordFooterItem}>
                          <Clock color="#9CA3AF" size={14} strokeWidth={1.5} />
                          <Text style={styles.recordFooterText}>{formatRecordDuration(totalSeconds)}</Text>
                        </View>
                        <View style={styles.recordFooterItem}>
                          <FileText color="#9CA3AF" size={14} strokeWidth={1.5} />
                          <Text style={styles.recordFooterText}>所屬計畫：{planName}</Text>
                        </View>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            ) : (
              <View style={styles.contentCard}>
                <View style={styles.emptyContent}>
                  <CalendarIcon color="#D1D5DB" size={56} strokeWidth={1.2} />
                  <Text style={styles.emptyTitle}>本月尚無符合篩選的紀錄</Text>
                  <Text style={styles.emptySubtitle}>開始您的第一次練習吧！</Text>
                </View>
              </View>
            )}
          </>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {renderDetailModal()}
      <BottomNavigation navigation={navigation} currentRoute="Daily" />
      {!isLoggedIn && <LockedOverlay navigation={navigation} reason="login" message="登入後查看你的練習日記" />}
      {isLoggedIn && !hasEnterpriseCode && <LockedOverlay navigation={navigation} reason="enterprise-code" message="輸入企業引薦碼以解鎖日記功能" />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6' },
  scrollView: { flex: 1 },

  // ===== 上半部統計區塊 =====
  statsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    marginHorizontal: 16,
    marginTop: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  // 本月練習次數 - 淺藍背景 #E8F4FD
  statBoxBlue: {
    flex: 1,
    backgroundColor: '#E8F4FD',
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 16,
    alignItems: 'center',
    position: 'relative',
  },
  // 本月練習時間 - 淺紫背景 #F3E8FF
  statBoxPurple: {
    flex: 1,
    backgroundColor: '#F3E8FF',
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 16,
    alignItems: 'center',
    position: 'relative',
  },
  statInfoIcon: {
    position: 'absolute',
    top: 12,
    right: 12,
  },
  statValueBlue: {
    fontSize: 40,
    fontWeight: '700',
    color: '#2563EB',
    marginTop: 8,
  },
  statValuePurple: {
    fontSize: 28,
    fontWeight: '700',
    color: '#9333EA',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 4,
  },

  // ===== 下半部 Figma 設計 =====

  // 月份選擇器 + 切換（同一行）
  monthAndToggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 16,
    marginTop: 16,
  },
  monthSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 25,
    paddingVertical: 12,
    paddingHorizontal: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  monthArrow: {
    padding: 4,
  },
  monthText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginHorizontal: 16,
  },
  viewToggle: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  viewToggleBtn: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewToggleBtnActive: {
    backgroundColor: '#D6EEFF',
  },

  // 篩選按鈕（獨立膠囊形狀）
  filterRow: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginTop: 12,
    gap: 10,
  },
  filterPillActive: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    backgroundColor: '#166CB5',
  },
  filterPillInactive: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  filterPillActiveText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  filterPillInactiveText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },

  // 內容卡片
  contentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    marginHorizontal: 16,
    marginTop: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  emptyContent: {
    alignItems: 'center',
    paddingVertical: 50,
  },
  emptyTitle: {
    fontSize: 16,
    color: '#9CA3AF',
    marginTop: 20,
    fontWeight: '500',
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#D1D5DB',
    marginTop: 6,
  },

  // 日曆
  calendarGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  calendarWeekday: { width: `${100 / 7}%`, paddingVertical: 8, alignItems: 'center' },
  calendarWeekdayText: { fontSize: 13, color: '#9CA3AF', fontWeight: '600' },
  calendarDay: { 
    width: `${100 / 7}%`, 
    height: 48,
    alignItems: 'center', 
    justifyContent: 'center',
    paddingBottom: 8,
  },
  calendarDayText: { fontSize: 15, color: '#6B7280', fontWeight: '500' },
  calendarDayTextActive: { color: '#1F2937', fontWeight: '600' },
  calendarDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#166CB5',
    marginTop: 4,
  },

  // 列表
  listContainer: { paddingHorizontal: 16, marginTop: 16 },
  recordCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  recordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  recordDate: {
    fontSize: 13,
    color: '#9CA3AF',
  },
  recordRelaxLevel: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  recordTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  recordFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  recordFooterItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  recordFooterText: {
    fontSize: 12,
    color: '#9CA3AF',
  },

  // Modal - 居中彈出
  modalOverlay: { 
    flex: 1, 
    backgroundColor: 'rgba(0,0,0,0.4)', 
    justifyContent: 'center', 
    alignItems: 'center',
    padding: 24,
  },
  modalContainer: { 
    backgroundColor: '#FFFFFF', 
    borderRadius: 16, 
    width: '100%',
    maxHeight: '80%', 
    padding: 24,
    position: 'relative',
  },
  modalCloseBtn: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 8,
    marginTop: 8,
  },
  modalDate: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    marginBottom: 16,
  },
  modalInfoRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
    marginBottom: 20,
  },
  modalInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  modalInfoText: {
    fontSize: 13,
    color: '#9CA3AF',
  },

  // Modal 區塊樣式
  modalSection: {
    backgroundColor: '#EBF5FF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  modalSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  modalSectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#166CB5',
  },
  relaxLevelRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 12,
  },
  relaxLevelLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginRight: 8,
  },
  relaxLevelValue: {
    fontSize: 32,
    fontWeight: '700',
    color: '#166CB5',
  },
  relaxLevelMax: {
    fontSize: 16,
    color: '#9CA3AF',
  },
  feelingsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  feelingTag: {
    backgroundColor: '#166CB5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
  },
  feelingTagText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '500',
  },

  // 好事書寫區塊
  modalSectionBlue: {
    backgroundColor: '#EBF5FF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  modalSectionTitleBlue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#166CB5',
  },
  modalSectionGray: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  modalSectionLabelGray: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 8,
  },
  modalSectionContent: {
    fontSize: 14,
    color: '#1F2937',
    lineHeight: 22,
  },

  // 思維調節區塊
  modalSectionRed: {
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  modalSectionLabelRed: {
    fontSize: 12,
    color: '#DC2626',
    marginBottom: 8,
  },
  emotionTags: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  emotionTagRed: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  emotionTagRedText: {
    fontSize: 12,
    color: '#DC2626',
  },
  modalSectionGreen: {
    backgroundColor: '#ECFDF5',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  modalSectionLabelGreen: {
    fontSize: 12,
    color: '#059669',
    marginBottom: 8,
  },

  // 感恩練習區塊
  modalSectionPink: {
    backgroundColor: '#FDF2F8',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  modalSectionTitlePink: {
    fontSize: 13,
    fontWeight: '600',
    color: '#EC4899',
  },
  gratitudeRow: {
    flexDirection: 'row',
    gap: 12,
  },
  gratitudeBox: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 12,
  },
  gratitudeLabel: {
    fontSize: 11,
    color: '#9CA3AF',
    marginBottom: 8,
  },
  gratitudeValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  gratitudeValue: {
    fontSize: 28,
    fontWeight: '700',
    color: '#EC4899',
  },
  gratitudeMax: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  emotionTagsSmall: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  emotionTagBlue: {
    backgroundColor: '#DBEAFE',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  emotionTagBlueText: {
    fontSize: 11,
    color: '#2563EB',
  },
  
  // 練習內容區塊
  section: { marginBottom: 20 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12 },
  sectionTitle: { fontSize: 14, fontWeight: '600', color: '#6B7280' },
});

export default DailyScreen;