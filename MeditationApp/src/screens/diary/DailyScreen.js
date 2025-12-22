// ==========================================
// DailyScreen.js
// 版本: V2.2 - 修正感恩練習三子類型識別
// 更新日期: 2025/12/22
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
  Mail,
  BookOpen,
  Gift,
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
  被愛: '#EC4899',
  羞愧: '#F87171',
  失落: '#6B7280',
};

const PLAN_CATEGORIES = {
  all: '全部',
  emotional: '情緒抗壓力',
  workplace: '職場溝通',
  positive: '正向心理',
};

const EMOTIONAL_PLAN_TYPES = ['呼吸', '好事', '思維', '感恩', '心情溫度計', '4-6', '屏息', '感謝信', '如果練習'];

const DailyScreen = ({ navigation, route }) => {
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
  const highlightPracticeId = route?.params?.highlightPracticeId;
  const hasLoadedData = useRef(false);

  useFocusEffect(
    React.useCallback(() => {
      checkAccess();
      if (!hasLoadedData.current) fetchAllData();
      return () => {};
    }, [])
  );

  useEffect(() => {
    if (highlightPracticeId && displayData.length > 0) {
      const practice = displayData.find(p => p.id === highlightPracticeId);
      if (practice) {
        setSelectedPractice(practice);
        setDetailModalVisible(true);
        navigation.setParams({ highlightPracticeId: undefined });
      }
    }
  }, [highlightPracticeId, displayData]);

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

  const formatStatsDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hours > 0) return `${hours}時${mins}分`;
    if (mins > 0) return `${mins}分${secs}秒`;
    return `${secs}秒`;
  };

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

  // ⭐ 練習類型判斷（修正版 - 支援感恩三子練習）
  const getPracticeType = (name) => {
    if (!name) return 'other';
    if (name.includes('好事') || name.includes('感恩書寫')) return 'good-things';
    if (name.includes('呼吸') || name.includes('4-6') || name.includes('屏息')) return 'breathing';
    if (name.includes('思維') || name.includes('調節') || name.includes('認知')) return 'cognitive';
    // ⭐ 修正：加入「感謝信」和「如果練習」的判斷
    if (name.includes('感恩') || name.includes('感謝信') || name.includes('如果練習')) return 'gratitude';
    if (name.includes('心情溫度計')) return 'thermometer';
    return 'other';
  };

  // ⭐ 所屬計畫判斷（更新版 - 支援感恩三子練習）
  const getPlanName = (type) => {
    if (!type) return '其他';
    if (type.includes('思維') || type.includes('調節') || type.includes('認知')) return '認知行為';
    if (type.includes('感恩') || type.includes('感謝信') || type.includes('如果練習')) return '幸福感提升';
    if (type.includes('好事')) return '正向心理';
    if (isEmotionalPlanPractice(type)) return '情緒抗壓力';
    return '其他';
  };

  // ⭐ 呼吸練習資料解析
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

  // ⭐ 好事書寫資料解析
  const extractGoodThingData = (practice) => {
    let data = {
      goodThing: null,
      emotions: [],
      reason: null,
      postScore: null,
    };

    if (practice.form_data) {
      try {
        const fd = typeof practice.form_data === 'string' ? JSON.parse(practice.form_data) : practice.form_data;
        if (fd) {
          data.goodThing = fd.goodThing || fd.good_thing || null;
          data.emotions = fd.emotions || [];
          data.reason = fd.reason || fd.how_to_repeat || null;
          data.postScore = fd.postScore ?? fd.positive_level ?? null;
        }
      } catch (e) {
        console.warn('parse goodThing form_data failed', e);
      }
    }
    return data;
  };

  // ⭐⭐⭐ 思維調節練習資料解析（完整版 - 修正欄位名稱）⭐⭐⭐
  const extractCognitiveData = (practice) => {
    let data = {
      event: null,           // 事件 (A)
      originalThought: null, // 原本的想法 (B)
      emotions: [],          // 情緒標籤
      emotionIntensity: null,// 情緒強度
      newThought: null,      // 轉念後 (D)
      postScore: null,       // 練習後正向程度
    };

    if (practice.form_data) {
      try {
        const fd = typeof practice.form_data === 'string' ? JSON.parse(practice.form_data) : practice.form_data;
        if (fd) {
          // 事件 (A) - 支援多種欄位名
          data.event = fd.event || fd.situation || fd.activatingEvent || fd.trigger || null;
          
          // ⭐ 原本的想法 (B) - 加入 thought 欄位（CognitiveReframingPractice 實際使用的欄位名）
          data.originalThought = fd.thought || fd.originalThought || fd.original_thought || fd.belief || fd.negativeThought || fd.automaticThought || null;
          
          // 情緒標籤 - 支援多種格式
          if (fd.emotions && Array.isArray(fd.emotions)) {
            data.emotions = fd.emotions;
          } else if (fd.emotion) {
            data.emotions = Array.isArray(fd.emotion) ? fd.emotion : [fd.emotion];
          } else if (fd.selectedEmotions) {
            data.emotions = Array.isArray(fd.selectedEmotions) ? fd.selectedEmotions : [fd.selectedEmotions];
          } else if (fd.emotionTags) {
            data.emotions = Array.isArray(fd.emotionTags) ? fd.emotionTags : fd.emotionTags.split(',').map(e => e.trim());
          }
          
          // 情緒強度
          data.emotionIntensity = fd.emotionIntensity || fd.emotion_intensity || fd.intensity || null;
          
          // ⭐ 轉念後的想法 (D) - 加入 newPerspective 欄位（CognitiveReframingPractice 實際使用的欄位名）
          data.newThought = fd.newPerspective || fd.newThought || fd.new_thought || fd.dispute || fd.reframedThought || fd.alternativeThought || fd.balancedThought || null;
          
          // 練習後評分
          data.postScore = fd.postScore ?? fd.post_score ?? fd.positiveLevel ?? fd.positive_level ?? null;
        }
      } catch (e) {
        console.warn('parse cognitive form_data failed', e);
      }
    }
    return data;
  };

  // ⭐⭐⭐ 感恩練習資料解析（完整版 - 支援三種子練習）⭐⭐⭐
  const extractGratitudeData = (practice) => {
    let data = {
      practiceType: null,      // 子練習類型：diary / letter / if
      gratitudeItems: null,    // 感恩日記
      gratitudeFeeling: null,  // 感受
      recipient: null,         // 收件人
      thankMessage: null,      // 感謝內容
      ifImagine: null,         // 想像沒有它
      ifAppreciate: null,      // 轉念看見擁有
      postScore: null,         // 幸福感程度
      relatedEmotions: [],     // 相關情緒
    };

    // ⭐ 先根據 practice_type 名稱推斷子類型
    if (practice.practice_type) {
      if (practice.practice_type.includes('感謝信')) {
        data.practiceType = 'letter';
      } else if (practice.practice_type.includes('如果練習')) {
        data.practiceType = 'if';
      } else if (practice.practice_type.includes('感恩日記')) {
        data.practiceType = 'diary';
      }
    }

    if (practice.form_data) {
      try {
        const fd = typeof practice.form_data === 'string' ? JSON.parse(practice.form_data) : practice.form_data;
        if (fd) {
          // 子類型（優先使用 form_data 中的值）
          data.practiceType = fd.practiceType || fd.practice_type || fd.subType || data.practiceType || 'diary';
          
          // 感恩日記欄位
          data.gratitudeItems = fd.gratitudeItems || fd.gratitude_items || fd.gratitudeContent || fd.content || fd.goodThings || null;
          data.gratitudeFeeling = fd.gratitudeFeeling || fd.gratitude_feeling || fd.feeling || fd.reflection || null;
          
          // 迷你感謝信欄位
          data.recipient = fd.recipient || fd.to || fd.thankTo || fd.letterTo || null;
          data.thankMessage = fd.thankMessage || fd.thank_message || fd.message || fd.letterContent || fd.thankContent || null;
          
          // 如果練習欄位
          data.ifImagine = fd.ifImagine || fd.if_imagine || fd.imagineWithout || fd.withoutIt || null;
          data.ifAppreciate = fd.ifAppreciate || fd.if_appreciate || fd.appreciateHaving || fd.nowAppreciate || null;
          
          // 幸福感評分
          data.postScore = fd.postScore ?? fd.post_score ?? fd.happinessLevel ?? fd.positiveLevel ?? fd.happiness ?? null;
          
          // 相關情緒
          if (fd.relatedEmotions && Array.isArray(fd.relatedEmotions)) {
            data.relatedEmotions = fd.relatedEmotions;
          } else if (fd.emotions && Array.isArray(fd.emotions)) {
            data.relatedEmotions = fd.emotions;
          } else if (fd.relatedEmotions && typeof fd.relatedEmotions === 'string') {
            data.relatedEmotions = fd.relatedEmotions.split(',').map(e => e.trim());
          } else if (fd.feelings && Array.isArray(fd.feelings)) {
            data.relatedEmotions = fd.feelings;
          }
        }
      } catch (e) {
        console.warn('parse gratitude form_data failed', e);
      }
    }
    return data;
  };

  // ⭐ 心情溫度計資料解析
  const extractEmotionThermometerData = (practice) => {
    let data = { scores: null, totalScore: null, riskScore: null };
    if (practice.form_data) {
      try {
        const fd = typeof practice.form_data === 'string' ? JSON.parse(practice.form_data) : practice.form_data;
        if (fd) {
          data.scores = fd.scores || null;
          data.totalScore = fd.totalScore || fd.total_score || null;
          data.riskScore = fd.riskScore || fd.risk_score || null;
        }
      } catch (e) {}
    }
    return data;
  };

  // ⭐⭐⭐ 渲染詳細 Modal（完整更新版）⭐⭐⭐
  const renderDetailModal = () => {
    if (!selectedPractice) return null;
    
    const totalSeconds = parseInt(selectedPractice.duration_seconds) || 0;
    const practiceType = getPracticeType(selectedPractice.practice_type);
    const planName = getPlanName(selectedPractice.practice_type);
    
    const isBreathing = practiceType === 'breathing';
    const isGoodThings = practiceType === 'good-things';
    const isCognitive = practiceType === 'cognitive';
    const isGratitude = practiceType === 'gratitude';
    const isMoodThermometer = practiceType === 'thermometer';
    
    const breathingData = isBreathing ? extractBreathingData(selectedPractice) : null;
    const goodThingData = isGoodThings ? extractGoodThingData(selectedPractice) : null;
    const cognitiveData = isCognitive ? extractCognitiveData(selectedPractice) : null;
    const gratitudeData = isGratitude ? extractGratitudeData(selectedPractice) : null;
    const emotionThermometerData = isMoodThermometer ? extractEmotionThermometerData(selectedPractice) : null;

    const formatModalDate = (dateStr) => {
      const date = new Date(dateStr);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const weekdays = ['週日', '週一', '週二', '週三', '週四', '週五', '週六'];
      return `${year}/${month}/${day} (${weekdays[date.getDay()]})`;
    };

    const formatModalDuration = (seconds) => {
      const mins = Math.floor(seconds / 60);
      return mins > 0 ? `${mins} 分鐘` : '少於 1 分鐘';
    };

    const getGratitudeTitle = () => {
      if (!gratitudeData) return '感恩練習';
      switch (gratitudeData.practiceType) {
        case 'diary': return '感恩日記';
        case 'letter': return '迷你感謝信';
        case 'if': return '如果練習';
        default: return selectedPractice.practice_type || '感恩練習';
      }
    };

    const getGratitudeContent = () => {
      if (!gratitudeData) return null;
      switch (gratitudeData.practiceType) {
        case 'diary': return gratitudeData.gratitudeItems || gratitudeData.gratitudeFeeling;
        case 'letter': return gratitudeData.thankMessage;
        case 'if': return gratitudeData.ifAppreciate || gratitudeData.ifImagine;
        default: return gratitudeData.gratitudeItems || gratitudeData.thankMessage || gratitudeData.ifAppreciate;
      }
    };

    // 獲取練習類型對應的主題色
    const getThemeColor = () => {
      if (isCognitive) return { primary: '#3B82F6', light: '#EFF6FF', accent: '#DBEAFE', gradient: ['#3B82F6', '#60A5FA'] };
      if (isGratitude) return { primary: '#EC4899', light: '#FDF2F8', accent: '#FCE7F3', gradient: ['#EC4899', '#F472B6'] };
      if (isBreathing) return { primary: '#10B981', light: '#ECFDF5', accent: '#D1FAE5', gradient: ['#10B981', '#34D399'] };
      if (isGoodThings) return { primary: '#F59E0B', light: '#FFFBEB', accent: '#FEF3C7', gradient: ['#F59E0B', '#FBBF24'] };
      if (isMoodThermometer) return { primary: '#8B5CF6', light: '#F5F3FF', accent: '#EDE9FE', gradient: ['#8B5CF6', '#A78BFA'] };
      return { primary: '#166CB5', light: '#EBF5FF', accent: '#DBEAFE', gradient: ['#166CB5', '#3B82F6'] };
    };

    const theme = getThemeColor();

    return (
      <Modal visible={detailModalVisible} transparent animationType="fade" onRequestClose={closeDetailModal}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            {/* 頂部裝飾條 */}
            <LinearGradient colors={theme.gradient} style={styles.modalTopAccent} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} />
            
            {/* 關閉按鈕 */}
            <TouchableOpacity style={styles.modalCloseBtn} onPress={closeDetailModal}>
              <View style={styles.modalCloseBtnCircle}>
                <X color="#64748B" size={16} strokeWidth={2.5} />
              </View>
            </TouchableOpacity>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.modalScrollContent}>
              {/* 標題區域 */}
              <View style={styles.modalHeaderSection}>
                <Text style={styles.modalTitle}>
                  {isCognitive ? '思維調節' : isGratitude ? getGratitudeTitle() : selectedPractice.practice_type}
                </Text>
                <Text style={styles.modalDate}>{formatModalDate(selectedPractice.completed_at)}</Text>
              </View>

              {/* 練習資訊標籤 */}
              <View style={styles.modalMetaRow}>
                <View style={[styles.modalMetaTag, { backgroundColor: theme.light }]}>
                  <Clock color={theme.primary} size={12} strokeWidth={2.5} />
                  <Text style={[styles.modalMetaText, { color: theme.primary }]}>{formatModalDuration(totalSeconds)}</Text>
                </View>
                <View style={styles.modalMetaTagGray}>
                  <FileText color="#64748B" size={12} strokeWidth={2} />
                  <Text style={styles.modalMetaTextGray}>{planName}</Text>
                </View>
              </View>

              {/* ========== 呼吸練習成效 ========== */}
              {isBreathing && breathingData && (breathingData.relaxLevel !== null || breathingData.postFeelings) && (
                <View style={[styles.resultCard, { backgroundColor: theme.light, borderColor: theme.accent }]}>
                  <View style={styles.resultCardHeader}>
                    <View style={[styles.resultIconBadge, { backgroundColor: theme.accent }]}>
                      <Sparkles color={theme.primary} size={14} />
                    </View>
                    <Text style={[styles.resultCardTitle, { color: theme.primary }]}>練習成效</Text>
                  </View>
                  {breathingData.relaxLevel !== null && (
                    <View style={styles.scoreDisplayRow}>
                      <Text style={styles.scoreLabel}>放鬆程度</Text>
                      <View style={styles.scoreValueBox}>
                        <Text style={[styles.scoreValue, { color: theme.primary }]}>{breathingData.relaxLevel}</Text>
                        <Text style={styles.scoreMax}>/10</Text>
                      </View>
                    </View>
                  )}
                  {breathingData.postFeelings && (
                    <View style={styles.tagsRow}>
                      {(Array.isArray(breathingData.postFeelings) ? breathingData.postFeelings : breathingData.postFeelings.split(',')).map((f, i) => (
                        <View key={i} style={[styles.emotionTagFilled, { backgroundColor: theme.primary }]}>
                          <Text style={styles.emotionTagFilledText}>{f.trim()}</Text>
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              )}

              {/* ========== 好事書寫 ========== */}
              {isGoodThings && goodThingData && (
                <>
                  {goodThingData.goodThing && (
                    <View style={[styles.contentCard, { backgroundColor: theme.light, borderColor: theme.accent }]}>
                      <View style={styles.contentCardHeader}>
                        <View style={[styles.resultIconBadge, { backgroundColor: theme.accent }]}>
                          <Gift color={theme.primary} size={14} />
                        </View>
                        <Text style={[styles.contentCardTitle, { color: theme.primary }]}>好事紀錄</Text>
                      </View>
                      <Text style={styles.contentCardText}>{goodThingData.goodThing}</Text>
                    </View>
                  )}
                  {goodThingData.emotions?.length > 0 && (
                    <View style={styles.sectionCard}>
                      <Text style={styles.sectionLabel}>當時感受</Text>
                      <View style={styles.tagsRow}>
                        {goodThingData.emotions.map((e, i) => (
                          <View key={i} style={styles.tagOutline}>
                            <Text style={styles.tagOutlineText}>{e}</Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  )}
                  {goodThingData.reason && (
                    <View style={styles.sectionCard}>
                      <Text style={styles.sectionLabel}>好事再發生</Text>
                      <Text style={styles.sectionText}>{goodThingData.reason}</Text>
                    </View>
                  )}
                  {goodThingData.postScore !== null && (
                    <View style={[styles.resultCard, { backgroundColor: theme.light, borderColor: theme.accent }]}>
                      <View style={styles.resultCardHeader}>
                        <View style={[styles.resultIconBadge, { backgroundColor: theme.accent }]}>
                          <Smile color={theme.primary} size={14} />
                        </View>
                        <Text style={[styles.resultCardTitle, { color: theme.primary }]}>練習成效</Text>
                      </View>
                      <View style={styles.scoreDisplayRow}>
                        <Text style={styles.scoreLabel}>心情愉悅程度</Text>
                        <View style={styles.scoreValueBox}>
                          <Text style={[styles.scoreValue, { color: theme.primary }]}>{goodThingData.postScore}</Text>
                          <Text style={styles.scoreMax}>/10</Text>
                        </View>
                      </View>
                    </View>
                  )}
                </>
              )}

              {/* ========== ⭐ 思維調節練習（精緻版）========== */}
              {isCognitive && cognitiveData && (
                <>
                  {cognitiveData.event && (
                    <View style={styles.abcdCard}>
                      <View style={styles.abcdLabelRow}>
                        <View style={[styles.abcdBadge, { backgroundColor: '#94A3B8' }]}>
                          <Text style={styles.abcdBadgeText}>A</Text>
                        </View>
                        <Text style={styles.abcdLabel}>事件</Text>
                      </View>
                      <Text style={styles.abcdContent}>{cognitiveData.event}</Text>
                    </View>
                  )}

                  {cognitiveData.originalThought && (
                    <View style={[styles.abcdCard, styles.abcdCardNegative]}>
                      <View style={styles.abcdLabelRow}>
                        <View style={[styles.abcdBadge, { backgroundColor: '#F87171' }]}>
                          <Text style={styles.abcdBadgeText}>B</Text>
                        </View>
                        <Text style={[styles.abcdLabel, { color: '#DC2626' }]}>原本的想法</Text>
                      </View>
                      <Text style={styles.abcdContent}>{cognitiveData.originalThought}</Text>
                      {cognitiveData.emotions && cognitiveData.emotions.length > 0 && (
                        <View style={[styles.tagsRow, { marginTop: 12 }]}>
                          {cognitiveData.emotions.map((emotion, i) => (
                            <View key={i} style={styles.emotionTagNegative}>
                              <Text style={styles.emotionTagNegativeText}>{emotion}</Text>
                            </View>
                          ))}
                        </View>
                      )}
                    </View>
                  )}

                  {/* 箭頭轉換分隔 */}
                  {cognitiveData.originalThought && cognitiveData.newThought && (
                    <View style={styles.transitionDivider}>
                      <View style={styles.dividerLine} />
                      <View style={styles.transitionCircle}>
                        <RefreshCw color="#10B981" size={16} />
                      </View>
                      <View style={styles.dividerLine} />
                    </View>
                  )}

                  {cognitiveData.newThought && (
                    <View style={[styles.abcdCard, styles.abcdCardPositive]}>
                      <View style={styles.abcdLabelRow}>
                        <View style={[styles.abcdBadge, { backgroundColor: '#34D399' }]}>
                          <Text style={styles.abcdBadgeText}>D</Text>
                        </View>
                        <Text style={[styles.abcdLabel, { color: '#059669' }]}>轉念後</Text>
                      </View>
                      <Text style={styles.abcdContent}>{cognitiveData.newThought}</Text>
                    </View>
                  )}

                  {cognitiveData.postScore !== null && (
                    <View style={[styles.resultCard, { backgroundColor: '#ECFDF5', borderColor: '#D1FAE5' }]}>
                      <View style={styles.resultCardHeader}>
                        <View style={[styles.resultIconBadge, { backgroundColor: '#D1FAE5' }]}>
                          <TrendingUp color="#10B981" size={14} />
                        </View>
                        <Text style={[styles.resultCardTitle, { color: '#10B981' }]}>練習成效</Text>
                      </View>
                      <View style={styles.scoreDisplayRow}>
                        <Text style={styles.scoreLabel}>情緒減緩程度</Text>
                        <View style={styles.scoreValueBox}>
                          <Text style={[styles.scoreValue, { color: '#10B981' }]}>{cognitiveData.postScore}</Text>
                          <Text style={styles.scoreMax}>/10</Text>
                        </View>
                      </View>
                    </View>
                  )}
                </>
              )}

              {/* ========== ⭐ 感恩練習（精緻版）========== */}
              {isGratitude && gratitudeData && (
                <>
                  {/* 感恩日記 */}
                  {gratitudeData.practiceType === 'diary' && (
                    <View style={[styles.contentCard, { backgroundColor: theme.light, borderColor: theme.accent }]}>
                      <View style={styles.contentCardHeader}>
                        <View style={[styles.resultIconBadge, { backgroundColor: theme.accent }]}>
                          <BookOpen color={theme.primary} size={14} />
                        </View>
                        <Text style={[styles.contentCardTitle, { color: theme.primary }]}>感恩日記內容</Text>
                      </View>
                      
                      {gratitudeData.gratitudeItems && (
                        <Text style={styles.contentCardText}>{gratitudeData.gratitudeItems}</Text>
                      )}
                      
                      {gratitudeData.gratitudeFeeling && (
                        <View style={styles.contentSubSection}>
                          <Text style={[styles.contentSubLabel, { color: theme.primary }]}>這件事帶給我的感受</Text>
                          <Text style={styles.contentSubText}>{gratitudeData.gratitudeFeeling}</Text>
                        </View>
                      )}
                    </View>
                  )}

                  {/* 迷你感謝信 */}
                  {gratitudeData.practiceType === 'letter' && (
                    <View style={[styles.contentCard, { backgroundColor: theme.light, borderColor: theme.accent }]}>
                      <View style={styles.contentCardHeader}>
                        <View style={[styles.resultIconBadge, { backgroundColor: theme.accent }]}>
                          <Mail color={theme.primary} size={14} />
                        </View>
                        <Text style={[styles.contentCardTitle, { color: theme.primary }]}>感謝信內容</Text>
                      </View>
                      
                      {gratitudeData.recipient && (
                        <View style={[styles.recipientBadge, { backgroundColor: theme.accent }]}>
                          <Heart color={theme.primary} size={11} fill={theme.primary} />
                          <Text style={[styles.recipientText, { color: theme.primary }]}>寫給：{gratitudeData.recipient}</Text>
                        </View>
                      )}
                      
                      {gratitudeData.thankMessage && (
                        <Text style={styles.contentCardText}>{gratitudeData.thankMessage}</Text>
                      )}
                    </View>
                  )}

                  {/* 如果練習 */}
                  {gratitudeData.practiceType === 'if' && (
                    <View style={[styles.contentCard, { backgroundColor: theme.light, borderColor: theme.accent }]}>
                      <View style={styles.contentCardHeader}>
                        <View style={[styles.resultIconBadge, { backgroundColor: theme.accent }]}>
                          <Lightbulb color={theme.primary} size={14} />
                        </View>
                        <Text style={[styles.contentCardTitle, { color: theme.primary }]}>如果練習內容</Text>
                      </View>
                      
                      {gratitudeData.ifImagine && (
                        <View style={styles.contentSubSection}>
                          <Text style={[styles.contentSubLabel, { color: theme.primary }]}>想像如果沒有它...</Text>
                          <Text style={styles.contentSubText}>{gratitudeData.ifImagine}</Text>
                        </View>
                      )}
                      
                      {gratitudeData.ifAppreciate && (
                        <View style={[styles.contentSubSection, { marginTop: 16 }]}>
                          <Text style={[styles.contentSubLabel, { color: theme.primary }]}>轉念看見擁有的美好</Text>
                          <Text style={styles.contentSubText}>{gratitudeData.ifAppreciate}</Text>
                        </View>
                      )}
                    </View>
                  )}

                  {/* 通用內容（當 practiceType 不明確時的 fallback） */}
                  {!gratitudeData.practiceType && getGratitudeContent() && (
                    <View style={[styles.contentCard, { backgroundColor: theme.light, borderColor: theme.accent }]}>
                      <View style={styles.contentCardHeader}>
                        <View style={[styles.resultIconBadge, { backgroundColor: theme.accent }]}>
                          <Heart color={theme.primary} size={14} fill={theme.primary} />
                        </View>
                        <Text style={[styles.contentCardTitle, { color: theme.primary }]}>感恩內容</Text>
                      </View>
                      <Text style={styles.contentCardText}>{getGratitudeContent()}</Text>
                    </View>
                  )}

                  {/* 幸福感評分 */}
                  {gratitudeData.postScore !== null && (
                    <View style={[styles.resultCard, { backgroundColor: theme.light, borderColor: theme.accent }]}>
                      <View style={styles.resultCardHeader}>
                        <View style={[styles.resultIconBadge, { backgroundColor: theme.accent }]}>
                          <Heart color={theme.primary} size={14} fill={theme.primary} />
                        </View>
                        <Text style={[styles.resultCardTitle, { color: theme.primary }]}>練習成效</Text>
                      </View>
                      <View style={styles.scoreDisplayRow}>
                        <Text style={styles.scoreLabel}>幸福感指數</Text>
                        <View style={styles.scoreValueBox}>
                          <Text style={[styles.scoreValue, { color: theme.primary }]}>{gratitudeData.postScore}</Text>
                          <Text style={styles.scoreMax}>/10</Text>
                        </View>
                      </View>
                    </View>
                  )}
                </>
              )}

              {/* ========== 心情溫度計（精緻版）========== */}
              {isMoodThermometer && emotionThermometerData && (
                <View style={[styles.thermometerCard, { backgroundColor: theme.light, borderColor: theme.accent }]}>
                  <View style={styles.resultCardHeader}>
                    <View style={[styles.resultIconBadge, { backgroundColor: theme.accent }]}>
                      <TrendingUp color={theme.primary} size={14} />
                    </View>
                    <Text style={[styles.resultCardTitle, { color: theme.primary }]}>情緒溫度總分</Text>
                  </View>
                  <View style={styles.thermometerScoreContainer}>
                    <Text style={[styles.thermometerScoreBig, { color: theme.primary }]}>{emotionThermometerData.totalScore ?? 0}</Text>
                    <Text style={styles.thermometerScoreUnit}>/20</Text>
                  </View>
                  <View style={styles.thermometerBarWrapper}>
                    <View style={styles.thermometerBarBg}>
                      <LinearGradient
                        colors={['#93C5FD', '#A78BFA', '#F472B6']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={[styles.thermometerBarFill, { width: `${Math.min(((emotionThermometerData.totalScore ?? 0) / 20) * 100, 100)}%` }]}
                      />
                    </View>
                    <View style={styles.thermometerBarLabels}>
                      <Text style={styles.thermometerBarLabel}>低強度</Text>
                      <Text style={styles.thermometerBarLabel}>高強度</Text>
                    </View>
                  </View>
                </View>
              )}

              <View style={{ height: 24 }} />
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
        <View style={styles.statsCard}>
          <View style={styles.statsRow}>
            <View style={styles.statBoxBlue}>
              <View style={styles.statInfoIcon}><Info color="#2563EB" size={14} strokeWidth={2} /></View>
              <TrendingUp color="#2563EB" size={24} strokeWidth={2} />
              <Text style={styles.statValueBlue}>{stats.totalPractices}</Text>
              <Text style={styles.statLabel}>本月練習次數</Text>
            </View>
            <View style={styles.statBoxPurple}>
              <View style={styles.statInfoIcon}><Info color="#9333EA" size={14} strokeWidth={2} /></View>
              <Clock color="#9333EA" size={24} strokeWidth={2} />
              <Text style={styles.statValuePurple}>{formatStatsDuration(stats.totalDuration)}</Text>
              <Text style={styles.statLabel}>本月練習時間</Text>
            </View>
          </View>
        </View>

        <View style={styles.monthAndToggleRow}>
          <View style={styles.monthSelector}>
            <TouchableOpacity onPress={handlePrevMonth} style={styles.monthArrow}>
              <ChevronLeft color="#C4C4C4" size={24} strokeWidth={2} />
            </TouchableOpacity>
            <Text style={styles.monthText}>{currentMonth.getFullYear()}年{currentMonth.getMonth() + 1}月</Text>
            <TouchableOpacity onPress={handleNextMonth} style={styles.monthArrow}>
              <ChevronRight color="#C4C4C4" size={24} strokeWidth={2} />
            </TouchableOpacity>
          </View>
          <View style={styles.viewToggle}>
            <TouchableOpacity onPress={() => setViewMode('list')} style={[styles.viewToggleBtn, viewMode === 'list' && styles.viewToggleBtnActive]}>
              <List color={viewMode === 'list' ? '#166CB5' : '#C4C4C4'} size={20} strokeWidth={2} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setViewMode('calendar')} style={[styles.viewToggleBtn, viewMode === 'calendar' && styles.viewToggleBtnActive]}>
              <Grid3X3 color={viewMode === 'calendar' ? '#166CB5' : '#C4C4C4'} size={20} strokeWidth={2} />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScrollView}>
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
        </ScrollView>

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

        {viewMode === 'list' && (
          <>
            {displayData.length > 0 ? (
              <View style={styles.listContainer}>
                {displayData.map((record, index) => {
                  const totalSeconds = parseInt(record.duration_seconds) || 0;
                  const planName = getPlanName(record.practice_type);
                  const formatRecordDate = (dateStr) => {
                    const date = new Date(dateStr);
                    const year = date.getFullYear();
                    const month = String(date.getMonth() + 1).padStart(2, '0');
                    const day = String(date.getDate()).padStart(2, '0');
                    const weekdays = ['週日', '週一', '週二', '週三', '週四', '週五', '週六'];
                    return `${year}/${month}/${day} (${weekdays[date.getDay()]})`;
                  };
                  const formatRecordDuration = (seconds) => {
                    const mins = Math.floor(seconds / 60);
                    const secs = seconds % 60;
                    if (secs === 0) return `${String(mins).padStart(2, '0')}:00 分鐘`;
                    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')} 分鐘`;
                  };

                  return (
                    <TouchableOpacity key={index} style={styles.recordCard} onPress={() => openDetailModal(record)} activeOpacity={0.7}>
                      <View style={styles.recordHeader}><Text style={styles.recordDate}>{formatRecordDate(record.completed_at)}</Text></View>
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
  statsCard: { backgroundColor: '#FFFFFF', borderRadius: 20, marginHorizontal: 16, marginTop: 16, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 3 },
  statsRow: { flexDirection: 'row', gap: 12 },
  statBoxBlue: { flex: 1, backgroundColor: '#E8F4FD', borderRadius: 16, paddingVertical: 20, paddingHorizontal: 16, alignItems: 'center', position: 'relative' },
  statBoxPurple: { flex: 1, backgroundColor: '#F3E8FF', borderRadius: 16, paddingVertical: 20, paddingHorizontal: 16, alignItems: 'center', position: 'relative' },
  statInfoIcon: { position: 'absolute', top: 12, right: 12 },
  statValueBlue: { fontSize: 40, fontWeight: '700', color: '#2563EB', marginTop: 8 },
  statValuePurple: { fontSize: 28, fontWeight: '700', color: '#9333EA', marginTop: 8 },
  statLabel: { fontSize: 13, color: '#6B7280', marginTop: 4 },
  monthAndToggleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginHorizontal: 16, marginTop: 16 },
  monthSelector: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 25, paddingVertical: 12, paddingHorizontal: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 2 },
  monthArrow: { padding: 4 },
  monthText: { fontSize: 16, fontWeight: '600', color: '#1F2937', marginHorizontal: 16 },
  viewToggle: { flexDirection: 'row', backgroundColor: '#FFFFFF', borderRadius: 12, padding: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 2 },
  viewToggleBtn: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  viewToggleBtnActive: { backgroundColor: '#D6EEFF' },
  filterScrollView: { marginTop: 12 },
  filterRow: { flexDirection: 'row', paddingHorizontal: 16, gap: 10 },
  filterPillActive: { paddingHorizontal: 24, paddingVertical: 12, borderRadius: 25, backgroundColor: '#166CB5' },
  filterPillInactive: { paddingHorizontal: 24, paddingVertical: 12, borderRadius: 25, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E5E7EB' },
  filterPillActiveText: { fontSize: 14, fontWeight: '600', color: '#FFFFFF' },
  filterPillInactiveText: { fontSize: 14, fontWeight: '500', color: '#6B7280' },
  contentCard: { backgroundColor: '#FFFFFF', borderRadius: 20, marginHorizontal: 16, marginTop: 16, padding: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 3 },
  emptyContent: { alignItems: 'center', paddingVertical: 50 },
  emptyTitle: { fontSize: 16, color: '#9CA3AF', marginTop: 20, fontWeight: '500' },
  emptySubtitle: { fontSize: 14, color: '#D1D5DB', marginTop: 6 },
  calendarGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  calendarWeekday: { width: `${100 / 7}%`, paddingVertical: 8, alignItems: 'center' },
  calendarWeekdayText: { fontSize: 13, color: '#9CA3AF', fontWeight: '600' },
  calendarDay: { width: `${100 / 7}%`, height: 48, alignItems: 'center', justifyContent: 'center', paddingBottom: 8 },
  calendarDayText: { fontSize: 15, color: '#6B7280', fontWeight: '500' },
  calendarDayTextActive: { color: '#1F2937', fontWeight: '600' },
  calendarDot: { width: 5, height: 5, borderRadius: 2.5, backgroundColor: '#166CB5', marginTop: 4 },
  listContainer: { paddingHorizontal: 16, marginTop: 16 },
  recordCard: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 20, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 3 },
  recordHeader: { marginBottom: 6 },
  recordDate: { fontSize: 12, color: '#9CA3AF' },
  recordTitle: { fontSize: 18, fontWeight: '600', color: '#1F2937', marginBottom: 12 },
  recordFooter: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  recordFooterItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  recordFooterText: { fontSize: 12, color: '#9CA3AF' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalContainer: { backgroundColor: '#FFFFFF', borderRadius: 24, width: '100%', maxHeight: '85%', position: 'relative', overflow: 'hidden' },
  modalTopAccent: { height: 4, width: '100%' },
  modalScrollContent: { padding: 24, paddingTop: 20 },
  modalCloseBtn: { position: 'absolute', top: 16, right: 16, zIndex: 10 },
  modalCloseBtnCircle: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#F1F5F9', justifyContent: 'center', alignItems: 'center' },
  modalHeaderSection: { alignItems: 'center', marginBottom: 16 },
  modalTitle: { fontSize: 22, fontWeight: '700', color: '#1E293B', textAlign: 'center', marginBottom: 6, letterSpacing: 0.3 },
  modalDate: { fontSize: 14, color: '#94A3B8', textAlign: 'center', fontWeight: '500' },
  modalMetaRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 12, marginBottom: 20 },
  modalMetaTag: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  modalMetaText: { fontSize: 13, fontWeight: '600' },
  modalMetaTagGray: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, backgroundColor: '#F8FAFC' },
  modalMetaTextGray: { fontSize: 13, color: '#64748B', fontWeight: '500' },
  resultCard: { borderRadius: 16, padding: 18, marginBottom: 14, borderWidth: 1 },
  resultCardHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 14 },
  resultIconBadge: { width: 28, height: 28, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  resultCardTitle: { fontSize: 14, fontWeight: '600' },
  scoreDisplayRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  scoreLabel: { fontSize: 14, color: '#64748B', fontWeight: '500' },
  scoreValueBox: { flexDirection: 'row', alignItems: 'baseline' },
  scoreValue: { fontSize: 36, fontWeight: '700' },
  scoreMax: { fontSize: 16, color: '#94A3B8', marginLeft: 2 },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4 },
  emotionTagFilled: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 16 },
  emotionTagFilledText: { fontSize: 13, color: '#FFFFFF', fontWeight: '600' },
  contentCard: { borderRadius: 16, padding: 18, marginBottom: 14, borderWidth: 1 },
  contentCardHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 14 },
  contentCardTitle: { fontSize: 14, fontWeight: '600' },
  contentCardText: { fontSize: 15, color: '#334155', lineHeight: 24 },
  contentSubSection: { paddingTop: 14, borderTopWidth: 1, borderTopColor: 'rgba(0,0,0,0.06)' },
  contentSubLabel: { fontSize: 12, fontWeight: '600', marginBottom: 6, opacity: 0.8 },
  contentSubText: { fontSize: 14, color: '#475569', lineHeight: 22 },
  sectionCard: { backgroundColor: '#F8FAFC', borderRadius: 14, padding: 16, marginBottom: 12 },
  sectionLabel: { fontSize: 12, color: '#94A3B8', fontWeight: '600', marginBottom: 10 },
  sectionText: { fontSize: 15, color: '#334155', lineHeight: 24 },
  tagOutline: { backgroundColor: '#FFFFFF', borderWidth: 1.5, borderColor: '#E2E8F0', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 14 },
  tagOutlineText: { fontSize: 13, color: '#475569', fontWeight: '500' },
  abcdCard: { backgroundColor: '#F8FAFC', borderRadius: 16, padding: 16, marginBottom: 12 },
  abcdCardNegative: { backgroundColor: '#FEF2F2', borderLeftWidth: 4, borderLeftColor: '#F87171' },
  abcdCardPositive: { backgroundColor: '#ECFDF5', borderLeftWidth: 4, borderLeftColor: '#34D399' },
  abcdLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  abcdBadge: { width: 24, height: 24, borderRadius: 6, justifyContent: 'center', alignItems: 'center' },
  abcdBadgeText: { fontSize: 12, fontWeight: '700', color: '#FFFFFF' },
  abcdLabel: { fontSize: 13, fontWeight: '600', color: '#64748B' },
  abcdContent: { fontSize: 15, color: '#334155', lineHeight: 24 },
  emotionTagNegative: { backgroundColor: '#FFFFFF', borderWidth: 1.5, borderColor: '#FECACA', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 14 },
  emotionTagNegativeText: { fontSize: 12, color: '#DC2626', fontWeight: '600' },
  transitionDivider: { flexDirection: 'row', alignItems: 'center', marginVertical: 8, paddingHorizontal: 20 },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#E2E8F0' },
  transitionCircle: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#ECFDF5', justifyContent: 'center', alignItems: 'center', marginHorizontal: 12, borderWidth: 2, borderColor: '#D1FAE5' },
  recipientBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, alignSelf: 'flex-start', marginBottom: 14, gap: 6 },
  recipientText: { fontSize: 13, fontWeight: '600' },
  thermometerCard: { borderRadius: 16, padding: 20, marginBottom: 14, borderWidth: 1, alignItems: 'center' },
  thermometerScoreContainer: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'center', marginTop: 8, marginBottom: 20 },
  thermometerScoreBig: { fontSize: 56, fontWeight: '700', lineHeight: 64 },
  thermometerScoreUnit: { fontSize: 20, color: '#94A3B8', marginLeft: 4 },
  thermometerBarWrapper: { width: '100%', paddingHorizontal: 4 },
  thermometerBarBg: { height: 10, backgroundColor: '#F1F5F9', borderRadius: 5, overflow: 'hidden', marginBottom: 8 },
  thermometerBarFill: { height: '100%', borderRadius: 5 },
  thermometerBarLabels: { flexDirection: 'row', justifyContent: 'space-between' },
  thermometerBarLabel: { fontSize: 11, color: '#94A3B8', fontWeight: '500' },
});

export default DailyScreen;