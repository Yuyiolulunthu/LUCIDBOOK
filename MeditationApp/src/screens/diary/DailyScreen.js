// ==========================================
// DailyScreen.js
// 版本: V2.7 - 完美還原內耗終止鍵顯示 & 修正同理心紀錄
// ==========================================

import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, StyleSheet, Dimensions,
  ActivityIndicator, StatusBar, Modal
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ChevronLeft, ChevronRight, TrendingUp, Sparkles, Smile,
  Calendar as CalendarIcon, X, Heart, Lightbulb, RefreshCw,
  Clock, FileText, Brain, Mail, BookOpen, Gift, AlertCircle,
  Target, Eye, Scale, PenTool, Ear, Activity
} from 'lucide-react-native';
import ApiService from '../../../api';
import BottomNavigation from '../../navigation/BottomNavigation';
import AppHeader from '../../navigation/AppHeader';
import LockedOverlay from '../../navigation/LockedOverlay';
import { useFocusEffect } from '@react-navigation/native';

const { width } = Dimensions.get('window');

const EMOTIONAL_PLAN_TYPES = ['呼吸', '好事', '思維', '感恩', '心情溫度計', '4-6', '屏息', '感謝信', '如果練習'];
const WORKPLACE_PLAN_TYPES = ['內耗終止鍵', '內耗覺察', '同理讀心術', '溝通轉譯器', '理智回穩力', '心情溫度計-職場溝通力'];

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
  const [currentDayRecords, setCurrentDayRecords] = useState([]);
  const [currentRecordIndex, setCurrentRecordIndex] = useState(0);
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
    if (route?.params?.forceRefresh) {
      fetchAllData();
      navigation.setParams({ forceRefresh: false });
    }
  }, [route?.params?.forceRefresh]);

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
    if (practiceType.includes('心情溫度計-職場溝通力')) return false;
    return EMOTIONAL_PLAN_TYPES.some(type => practiceType.includes(type));
  };

  const isWorkplacePlanPractice = (practiceType) => {
    if (!practiceType) return false;
    return WORKPLACE_PLAN_TYPES.some(type => practiceType.includes(type));
  };

  const filterDataForCurrentMonth = (practices) => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    let filtered = practices.filter((practice) => {
      const practiceDate = new Date(practice.completed_at);
      const isCompleted = String(practice.completed) === '1' || practice.completed === 1;
      return isCompleted && practiceDate.getFullYear() === year && practiceDate.getMonth() === month;
    });
    if (selectedPlan === 'emotional') filtered = filtered.filter(p => isEmotionalPlanPractice(p.practice_type));
    else if (selectedPlan === 'workplace') filtered = filtered.filter(p => isWorkplacePlanPractice(p.practice_type));
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

  const handlePrevMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  const handleNextMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));

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
  const getRecordsForDate = (day) => {
    const dateStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return displayData.filter((r) => r.completed_at?.startsWith(dateStr));
  };
  const hasRecordOnDate = (day) => getRecordsForDate(day).length > 0;
  const getRecordDotColor = (day) => {
    const records = getRecordsForDate(day);
    if (records.length === 0) return null;
    const sortedRecords = records.sort((a, b) => new Date(a.completed_at) - new Date(b.completed_at));
    const firstRecord = sortedRecords[0];
    if (isWorkplacePlanPractice(firstRecord.practice_type)) return '#FF8C42';
    return '#166CB5';
  };

  const handleDayClick = (day) => {
    const records = getRecordsForDate(day);
    if (records.length > 0) {
      setCurrentDayRecords(records);
      setCurrentRecordIndex(0);
      setSelectedPractice(records[0]);
      setDetailModalVisible(true);
    }
  };

  const handlePrevRecord = () => {
    if (currentRecordIndex > 0) {
      const newIndex = currentRecordIndex - 1;
      setCurrentRecordIndex(newIndex);
      setSelectedPractice(currentDayRecords[newIndex]);
    }
  };

  const handleNextRecord = () => {
    if (currentRecordIndex < currentDayRecords.length - 1) {
      const newIndex = currentRecordIndex + 1;
      setCurrentRecordIndex(newIndex);
      setSelectedPractice(currentDayRecords[newIndex]);
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
    if (name.includes('思維') || name.includes('調節') || name.includes('認知') || name.includes('內耗')) return 'cognitive';
    if (name.includes('感恩') || name.includes('感謝信') || name.includes('如果練習')) return 'gratitude';
    if (name.includes('心情溫度計')) return 'thermometer';
    if (name.includes('同理讀心術')) return 'empathy';
    return 'other';
  };

  const getPlanName = (type) => '情緒抗壓力';
  const getDisplayPracticeName = (practiceType) => practiceType?.includes('心情溫度計') ? '心情溫度計' : practiceType;

  // ========== 資料提取 ==========
  const extractBreathingData = (practice) => {
    let data = { relaxLevel: null, postFeelings: null, postMood: null };
    data.relaxLevel = practice.relax_level || practice.relaxLevel || null;
    data.postFeelings = practice.post_feelings || practice.postFeelings || null;
    if (practice.form_data) {
      try {
        const fd = typeof practice.form_data === 'string' ? JSON.parse(practice.form_data) : practice.form_data;
        if (fd) {
          data.relaxLevel = data.relaxLevel || fd.relax_level || null;
          data.postFeelings = data.postFeelings || fd.post_feelings || (Array.isArray(fd.feelings) ? fd.feelings.join('、') : null);
        }
      } catch (e) {}
    }
    return data;
  };

  const extractGoodThingData = (practice) => {
    let data = { goodThing: null, emotions: [], reason: null, postScore: null };
    if (practice.form_data) {
      try {
        const fd = typeof practice.form_data === 'string' ? JSON.parse(practice.form_data) : practice.form_data;
        if (fd) {
          data.goodThing = fd.goodThing || fd.good_thing || null;
          data.emotions = fd.emotions || [];
          data.reason = fd.reason || fd.how_to_repeat || null;
          data.postScore = fd.postScore ?? fd.positive_level ?? null;
        }
      } catch (e) {}
    }
    return data;
  };

  const extractCognitiveData = (practice) => {
    let data = {
      event: null, situation: null, originalThought: null, thoughts: null,
      emotions: [], bodyReactions: [], behaviors: [], needs: [], reaction: null,
      supportingEvidence: null, opposingEvidence: null, habitPattern: null, empathyPerspective: null,
      controllable: null, uncontrollable: null, alternativeThinking: null,
      newPerspective: null, newThought: null, actionableSteps: null,
      selectedAction: null, customAction: null, moodScore: null, postScore: null
    };
    const splitMaybe = (v) => Array.isArray(v) ? v : (typeof v === 'string' ? v.split(/[，,、]/).map(s=>s.trim()).filter(Boolean) : []);
    
    if (practice.form_data) {
      try {
        const fd = typeof practice.form_data === 'string' ? JSON.parse(practice.form_data) : practice.form_data;
        if (fd) {
          data.event = fd.event || fd.activatingEvent || null;
          data.situation = fd.situation || fd.trigger || null;
          data.originalThought = fd.originalThought || fd.original_thought || fd.automaticThought || null;
          data.thoughts = fd.thoughts || fd.thought || null;
          
          if (Array.isArray(fd.emotions)) data.emotions = fd.emotions;
          else if (fd.emotion) data.emotions = [fd.emotion];
          
          data.reaction = fd.reaction || null; // 身體反應
          data.needs = splitMaybe(fd.needs);
          
          data.supportingEvidence = fd.supportingEvidence || null;
          data.opposingEvidence = fd.opposingEvidence || null;
          data.habitPattern = fd.habitPattern || null;
          data.empathyPerspective = fd.empathyPerspective || null;
          data.controllable = fd.controllable || null;
          data.uncontrollable = fd.uncontrollable || null;
          data.alternativeThinking = fd.alternativeThinking || fd.alternative_thinking || null;
          data.newPerspective = fd.newPerspective || fd.new_perspective || null;
          data.newThought = fd.newThought || fd.new_thought || fd.balancedThought || null;
          data.actionableSteps = fd.actionableSteps || fd.actionable_steps || fd.smallActions || null;
          data.selectedAction = fd.selectedAction || null;
          data.customAction = fd.customAction || null;
          data.moodScore = fd.moodScore ?? fd.postScore ?? null;
          data.postScore = fd.postScore ?? fd.moodScore ?? null;
        }
      } catch (e) {}
    }
    return data;
  };

  const extractEmpathyData = (practice) => {
    let data = { situation: null, emotions: [], needs: null, limitations: null, translation: null, moodScore: null, understandingScore: null };
    if (practice.form_data) {
      try {
        const fd = typeof practice.form_data === 'string' ? JSON.parse(practice.form_data) : practice.form_data;
        if (fd) {
          data.situation = fd.situation || null;
          data.emotions = Array.isArray(fd.emotions) ? fd.emotions : [];
          data.needs = fd.needs || null;
          data.limitations = fd.limitations || null;
          data.translation = fd.translation || null;
          data.moodScore = fd.moodScore ?? fd.score1 ?? null;
          data.understandingScore = fd.understandingScore ?? fd.score2 ?? null;
        }
      } catch (e) {}
    }
    return data;
  };

  const getActionText = (selectedAction, customAction) => {
    if (customAction && customAction.trim()) return customAction.trim();
    const actionMap = { 'talk': '找人聊聊', 'breathe': '4-6 呼吸', 'move': '站起來動一動', 'write': '寫下此事我的努力' };
    return actionMap[selectedAction] || selectedAction || '未記錄';
  };

  const renderDetailModal = () => {
    if (!selectedPractice) return null;
    const totalSeconds = parseInt(selectedPractice.duration_seconds) || 0;
    const practiceType = getPracticeType(selectedPractice.practice_type);
    
    const isBreathing = practiceType === 'breathing';
    const isGoodThings = practiceType === 'good-things';
    const isCognitive = practiceType === 'cognitive';
    const isGratitude = practiceType === 'gratitude';
    const isMoodThermometer = practiceType === 'thermometer';
    const isEmpathy = practiceType === 'empathy';

    const breathingData = isBreathing ? extractBreathingData(selectedPractice) : null;
    const goodThingData = isGoodThings ? extractGoodThingData(selectedPractice) : null;
    const cognitiveData = isCognitive ? extractCognitiveData(selectedPractice) : null;
    const empathyData = isEmpathy ? extractEmpathyData(selectedPractice) : null;

    const formatModalDate = (dateStr) => {
      const d = new Date(dateStr);
      return `${d.getFullYear()}/${String(d.getMonth()+1).padStart(2,'0')}/${String(d.getDate()).padStart(2,'0')} (${['週日','週一','週二','週三','週四','週五','週六'][d.getDay()]})`;
    };
    const formatModalDuration = (s) => `${Math.floor(s/60)} 分鐘` || '少於 1 分鐘';

    const getThemeColor = () => {
      if (isCognitive && selectedPractice.practice_type?.includes('內耗')) return { primary: '#FF8C42', light: '#FFF4ED', accent: '#FFE8DB', gradient: ['#FF8C42', '#FF6B6B'] };
      if (isEmpathy) return { primary: '#EC4899', light: '#FDF2F8', accent: '#FCE7F3', gradient: ['#EC4899', '#F472B6'] }; // 粉色系
      return { primary: '#166CB5', light: '#EBF5FF', accent: '#DBEAFE', gradient: ['#166CB5', '#3B82F6'] };
    };
    const theme = getThemeColor();

    return (
      <Modal visible={detailModalVisible} transparent animationType="fade" onRequestClose={closeDetailModal}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <LinearGradient colors={theme.gradient} style={styles.modalTopAccent} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} />
            <TouchableOpacity style={styles.modalCloseBtn} onPress={closeDetailModal}><View style={styles.modalCloseBtnCircle}><X color="#64748B" size={16} strokeWidth={2.5} /></View></TouchableOpacity>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.modalScrollContent}>
              <View style={styles.modalHeaderSection}>
                <Text style={styles.modalTitle}>{selectedPractice.practice_type}</Text>
                <Text style={styles.modalDate}>{formatModalDate(selectedPractice.completed_at)}</Text>
              </View>
              <View style={styles.modalMetaRow}>
                <View style={[styles.modalMetaTag, { backgroundColor: theme.light }]}><Clock color={theme.primary} size={12} strokeWidth={2.5} /><Text style={[styles.modalMetaText, { color: theme.primary }]}>{formatModalDuration(totalSeconds)}</Text></View>
                <View style={styles.modalMetaTagGray}><FileText color="#64748B" size={12} strokeWidth={2} /><Text style={styles.modalMetaTextGray}>{selectedPractice.practice_type?.includes('內耗') || isEmpathy ? '職場溝通力' : '情緒抗壓力'}</Text></View>
              </View>

              {/* 呼吸與好事 (省略部分，保持原樣) */}
              {isBreathing && breathingData && (<View style={[styles.resultCard, { backgroundColor: theme.light, borderColor: theme.accent }]}><View style={styles.resultCardHeader}><Sparkles color={theme.primary} size={14} /><Text style={[styles.resultCardTitle, { color: theme.primary, marginLeft:8 }]}>練習成效</Text></View><Text style={[styles.scoreValue, {color: theme.primary}]}>{breathingData.relaxLevel}/10</Text></View>)}
              {isGoodThings && goodThingData && (<View style={[styles.contentCard, { backgroundColor: theme.light, borderColor: theme.accent }]}><Text style={[styles.contentCardTitle, { color: theme.primary }]}>好事紀錄</Text><Text style={styles.contentCardText}>{goodThingData.goodThing}</Text></View>)}

              {/* ✅✅✅ 內耗/思維練習 (完整修復) ✅✅✅ */}
              {isCognitive && cognitiveData && (
                <>
                  {/* 事件 */}
                  {(cognitiveData.event || cognitiveData.situation) && (
                    <View style={[styles.abcdCard, { backgroundColor: theme.light, borderLeftWidth: 4, borderLeftColor: theme.primary }]}>
                      <View style={styles.abcdLabelRow}><AlertCircle color={theme.primary} size={16} /><Text style={[styles.abcdLabel, { color: theme.primary }]}>事件</Text></View>
                      <Text style={styles.abcdContent}>{cognitiveData.event || cognitiveData.situation}</Text>
                    </View>
                  )}
                  {/* 原本想法 (紅色警戒) */}
                  {(cognitiveData.originalThought || cognitiveData.thoughts) && (
                    <View style={[styles.abcdCard, styles.abcdCardNegative]}>
                      <View style={styles.abcdLabelRow}><Brain color="#DC2626" size={16} /><Text style={[styles.abcdLabel, { color: '#DC2626' }]}>原本的想法</Text></View>
                      <Text style={styles.abcdContent}>{cognitiveData.originalThought || cognitiveData.thoughts}</Text>
                      {/* 反應與需求 */}
                      {(cognitiveData.emotions.length > 0 || cognitiveData.reaction || cognitiveData.needs.length > 0) && (
                        <View style={{ marginTop: 12 }}>
                          {cognitiveData.emotions.length > 0 && <View style={styles.tagsRow}>{cognitiveData.emotions.map((e,i)=><View key={i} style={styles.emotionTagNegative}><Text style={styles.emotionTagNegativeText}>{e}</Text></View>)}</View>}
                          {cognitiveData.reaction && <Text style={[styles.sectionText, {marginTop:8}]}>反應：{cognitiveData.reaction}</Text>}
                          {cognitiveData.needs.length > 0 && <View style={{marginTop:8}}><Text style={styles.reactionSubLabel}>需求：</Text><View style={styles.tagsRow}>{cognitiveData.needs.map((n,i)=><View key={i} style={styles.tagOutline}><Text style={styles.tagOutlineText}>{n}</Text></View>)}</View></View>}
                        </View>
                      )}
                    </View>
                  )}
                  {/* 證據/視角 (7步驟) */}
                  {(cognitiveData.supportingEvidence || cognitiveData.opposingEvidence) && <View style={[styles.abcdCard, {backgroundColor:'#F8FAFC'}]}><Text style={styles.abcdLabel}>證據檢視</Text><Text style={styles.abcdContent}>支持：{cognitiveData.supportingEvidence}</Text><Text style={styles.abcdContent}>反對：{cognitiveData.opposingEvidence}</Text></View>}
                  {(cognitiveData.habitPattern || cognitiveData.empathyPerspective) && <View style={[styles.abcdCard, {backgroundColor:'#F8FAFC'}]}><Text style={styles.abcdLabel}>轉換視角</Text><Text style={styles.abcdContent}>習慣：{cognitiveData.habitPattern}</Text><Text style={styles.abcdContent}>同理：{cognitiveData.empathyPerspective}</Text></View>}
                  {(cognitiveData.controllable || cognitiveData.uncontrollable) && <View style={[styles.abcdCard, {backgroundColor:'#F8FAFC'}]}><Text style={styles.abcdLabel}>控制觀</Text><Text style={styles.abcdContent}>可控：{cognitiveData.controllable}</Text><Text style={styles.abcdContent}>不可控：{cognitiveData.uncontrollable}</Text></View>}
                  {/* 轉念與行動 (綠色成功) */}
                  {(cognitiveData.newPerspective || cognitiveData.newThought) && <View style={[styles.abcdCard, styles.abcdCardPositive]}><View style={styles.abcdLabelRow}><Lightbulb color="#10B981" size={16} /><Text style={[styles.abcdLabel, { color: '#10B981' }]}>轉念觀點</Text></View><Text style={styles.abcdContent}>{cognitiveData.newPerspective || cognitiveData.newThought}</Text></View>}
                  {(cognitiveData.selectedAction || cognitiveData.actionableSteps) && <View style={[styles.abcdCard, styles.abcdCardPositive]}><View style={styles.abcdLabelRow}><Target color="#10B981" size={16} /><Text style={[styles.abcdLabel, { color: '#10B981' }]}>行動</Text></View><Text style={styles.abcdContent}>{getActionText(cognitiveData.selectedAction, cognitiveData.customAction) || cognitiveData.actionableSteps}</Text></View>}
                  {/* 成效 */}
                  {(cognitiveData.moodScore !== null) && <View style={[styles.resultCard, {backgroundColor:'#ECFDF5', borderColor:'#D1FAE5'}]}><Text style={[styles.resultCardTitle, {color:'#10B981'}]}>情緒減緩：{cognitiveData.moodScore}/10</Text></View>}
                </>
              )}

              {/* ✅✅✅ 同理讀心術 (粉色系) ✅✅✅ */}
              {isEmpathy && empathyData && (
                <>
                  {empathyData.situation && <View style={[styles.abcdCard, { backgroundColor: theme.light, borderLeftWidth: 4, borderLeftColor: theme.primary }]}><View style={styles.abcdLabelRow}><AlertCircle color={theme.primary} size={16} /><Text style={[styles.abcdLabel, { color: theme.primary }]}>情境</Text></View><Text style={styles.abcdContent}>{empathyData.situation}</Text></View>}
                  {empathyData.emotions.length > 0 && <View style={styles.sectionCard}><Text style={styles.sectionLabel}>辨識情緒</Text><View style={styles.tagsRow}>{empathyData.emotions.map((e,i)=><View key={i} style={styles.emotionTagNegative}><Text style={styles.emotionTagNegativeText}>{e}</Text></View>)}</View></View>}
                  {empathyData.needs && <View style={[styles.abcdCard, {backgroundColor:'#F8FAFC'}]}><Text style={styles.abcdLabel}>理解需求</Text><Text style={styles.abcdContent}>{empathyData.needs}</Text></View>}
                  {empathyData.limitations && <View style={[styles.abcdCard, {backgroundColor:'#F8FAFC'}]}><Text style={styles.abcdLabel}>考量限制</Text><Text style={styles.abcdContent}>{empathyData.limitations}</Text></View>}
                  {empathyData.translation && <View style={[styles.abcdCard, styles.abcdCardPositive]}><View style={styles.abcdLabelRow}><Ear color="#10B981" size={16} /><Text style={[styles.abcdLabel, {color:'#10B981'}]}>同理翻譯</Text></View><Text style={styles.abcdContent}>{empathyData.translation}</Text></View>}
                  {(empathyData.moodScore !== null) && <View style={[styles.resultCard, {backgroundColor:'#ECFDF5', borderColor:'#D1FAE5'}]}><Text style={[styles.resultCardTitle, {color:'#10B981'}]}>張力改善：{empathyData.moodScore}/10</Text></View>}
                </>
              )}

              <View style={{ height: 24 }} />
            </ScrollView>
          </View>
        </View>
      </Modal>
    );
  };

  if (loading) return <View style={styles.container}><ActivityIndicator size="large" color="#166CB5" /></View>;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#166CB5" />
      <AppHeader navigation={navigation} />
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.statsCard}>
          <View style={styles.statsRow}>
            <View style={styles.statBoxBlue}><TrendingUp color="#2563EB" size={24} /><View style={styles.statValueContainer}><Text style={styles.statValueBlue}>{stats.totalPractices}</Text></View><Text style={styles.statLabel}>本月練習次數</Text></View>
            <View style={styles.statBoxPurple}><Clock color="#9333EA" size={24} /><View style={styles.statValueContainer}><Text style={styles.statValuePurple}>{formatStatsDuration(stats.totalDuration)}</Text></View><Text style={styles.statLabel}>本月練習時間</Text></View>
          </View>
        </View>
        <View style={styles.monthAndToggleRow}>
          <View style={styles.monthSelector}><TouchableOpacity onPress={handlePrevMonth} style={styles.monthArrow}><ChevronLeft color="#C4C4C4" size={24} /></TouchableOpacity><Text style={styles.monthText}>{currentMonth.getFullYear()}年{currentMonth.getMonth() + 1}月</Text><TouchableOpacity onPress={handleNextMonth} style={styles.monthArrow}><ChevronRight color="#C4C4C4" size={24} /></TouchableOpacity></View>
          <View style={styles.viewToggle}><TouchableOpacity onPress={() => setViewMode('list')} style={[styles.viewToggleBtn, viewMode === 'list' && styles.viewToggleBtnActive]}><FileText color={viewMode === 'list' ? '#166CB5' : '#C4C4C4'} size={20} /></TouchableOpacity><TouchableOpacity onPress={() => setViewMode('calendar')} style={[styles.viewToggleBtn, viewMode === 'calendar' && styles.viewToggleBtnActive]}><CalendarIcon color={viewMode === 'calendar' ? '#166CB5' : '#C4C4C4'} size={20} /></TouchableOpacity></View>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScrollView}>
          <View style={styles.filterRow}>
            <TouchableOpacity onPress={() => setSelectedPlan('all')}><View style={selectedPlan === 'all' ? styles.filterPillActive : styles.filterPillInactive}><Text style={selectedPlan === 'all' ? styles.filterPillActiveText : styles.filterPillInactiveText}>全部</Text></View></TouchableOpacity>
            <TouchableOpacity onPress={() => setSelectedPlan('emotional')}><View style={selectedPlan === 'emotional' ? styles.filterPillActive : styles.filterPillInactive}><Text style={selectedPlan === 'emotional' ? styles.filterPillActiveText : styles.filterPillInactiveText}>情緒抗壓力</Text></View></TouchableOpacity>
            <TouchableOpacity onPress={() => setSelectedPlan('workplace')}><View style={selectedPlan === 'workplace' ? styles.filterPillWorkplace : styles.filterPillInactive}><Text style={selectedPlan === 'workplace' ? styles.filterPillWorkplaceText : styles.filterPillInactiveText}>職場溝通力</Text></View></TouchableOpacity>
          </View>
        </ScrollView>
        {viewMode === 'list' && (
          <View style={styles.listContainer}>
            {displayData.map((record, index) => (
              <TouchableOpacity key={index} style={styles.recordCard} onPress={() => openDetailModal(record)}>
                <View style={styles.recordHeader}><Text style={styles.recordDate}>{new Date(record.completed_at).toLocaleDateString()}</Text></View>
                <Text style={styles.recordTitle}>{getDisplayPracticeName(record.practice_type)}</Text>
                <View style={styles.recordFooter}><View style={styles.recordFooterItem}><Clock color="#9CA3AF" size={14} /><Text style={styles.recordFooterText}>{Math.floor(record.duration_seconds/60)} 分鐘</Text></View></View>
              </TouchableOpacity>
            ))}
          </View>
        )}
        <View style={{ height: 100 }} />
      </ScrollView>
      {renderDetailModal()}
      <BottomNavigation navigation={navigation} currentRoute="Daily" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6' },
  scrollView: { flex: 1 },
  statsCard: { backgroundColor: '#FFFFFF', borderRadius: 20, margin: 16, padding: 16, elevation: 3 },
  statsRow: { flexDirection: 'row', gap: 12 },
  statBoxBlue: { flex: 1, backgroundColor: '#E8F4FD', borderRadius: 16, padding: 16, alignItems: 'center' },
  statBoxPurple: { flex: 1, backgroundColor: '#F3E8FF', borderRadius: 16, padding: 16, alignItems: 'center' },
  statValueContainer: { height: 50, justifyContent: 'center' },
  statValueBlue: { fontSize: 36, fontWeight: '700', color: '#2563EB' },
  statValuePurple: { fontSize: 26, fontWeight: '700', color: '#9333EA' },
  statLabel: { fontSize: 13, color: '#6B7280', marginTop: 4 },
  monthAndToggleRow: { flexDirection: 'row', justifyContent: 'space-between', margin: 16, alignItems: 'center' },
  monthSelector: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', borderRadius: 25, padding: 10, elevation: 2 },
  monthArrow: { padding: 4 },
  monthText: { fontSize: 16, fontWeight: '600', marginHorizontal: 16 },
  viewToggle: { flexDirection: 'row', backgroundColor: '#FFF', borderRadius: 12, padding: 4, elevation: 2 },
  viewToggleBtn: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  viewToggleBtnActive: { backgroundColor: '#D6EEFF' },
  filterScrollView: { marginTop: 10 },
  filterRow: { flexDirection: 'row', paddingHorizontal: 16, gap: 10 },
  filterPillActive: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 25, backgroundColor: '#166CB5' },
  filterPillInactive: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 25, backgroundColor: '#FFF', borderWidth: 1, borderColor: '#E5E7EB' },
  filterPillWorkplace: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 25, backgroundColor: '#FF8C42' },
  filterPillActiveText: { color: '#FFF', fontWeight: '600' },
  filterPillWorkplaceText: { color: '#FFF', fontWeight: '600' },
  filterPillInactiveText: { color: '#6B7280' },
  listContainer: { padding: 16 },
  recordCard: { backgroundColor: '#FFF', borderRadius: 16, padding: 20, marginBottom: 12, elevation: 2 },
  recordHeader: { marginBottom: 6 },
  recordDate: { fontSize: 12, color: '#9CA3AF' },
  recordTitle: { fontSize: 18, fontWeight: '600', marginBottom: 10 },
  recordFooter: { flexDirection: 'row', gap: 16 },
  recordFooterItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  recordFooterText: { fontSize: 12, color: '#9CA3AF' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  modalContainer: { backgroundColor: '#FFF', borderRadius: 24, maxHeight: '85%', width: '100%', overflow: 'hidden' },
  modalTopAccent: { height: 4, width: '100%' },
  modalScrollContent: { padding: 24 },
  modalCloseBtn: { position: 'absolute', top: 16, right: 16, zIndex: 10 },
  modalCloseBtnCircle: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#F1F5F9', alignItems: 'center', justifyContent: 'center' },
  modalHeaderSection: { alignItems: 'center', marginBottom: 16 },
  modalTitle: { fontSize: 22, fontWeight: '700', color: '#1E293B', marginBottom: 6 },
  modalDate: { fontSize: 14, color: '#94A3B8' },
  modalMetaRow: { flexDirection: 'row', justifyContent: 'center', gap: 12, marginBottom: 20 },
  modalMetaTag: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  modalMetaTagGray: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, backgroundColor: '#F8FAFC' },
  modalMetaText: { fontSize: 13, fontWeight: '600' },
  modalMetaTextGray: { fontSize: 13, color: '#64748B' },
  resultCard: { borderRadius: 16, padding: 18, marginBottom: 14, borderWidth: 1 },
  resultCardHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 14 },
  resultIconBadge: { width: 28, height: 28, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  resultCardTitle: { fontSize: 14, fontWeight: '600' },
  scoreDisplayRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  scoreValueBox: { flexDirection: 'row', alignItems: 'baseline' },
  scoreValue: { fontSize: 36, fontWeight: '700' },
  scoreMax: { fontSize: 16, color: '#94A3B8', marginLeft: 2 },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4 },
  emotionTagFilled: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 16 },
  emotionTagFilledText: { color: '#FFF', fontWeight: '600', fontSize: 13 },
  contentCard: { borderRadius: 16, padding: 18, marginBottom: 14, borderWidth: 1 },
  contentCardHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 14 },
  contentCardTitle: { fontSize: 14, fontWeight: '600' },
  contentCardText: { fontSize: 15, color: '#334155', lineHeight: 24 },
  abcdCard: { backgroundColor: '#F8FAFC', borderRadius: 16, padding: 16, marginBottom: 12 },
  abcdCardNegative: { backgroundColor: '#FEF2F2', borderLeftWidth: 4, borderLeftColor: '#F87171' },
  abcdCardPositive: { backgroundColor: '#ECFDF5', borderLeftWidth: 4, borderLeftColor: '#34D399' },
  abcdLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  sectionIconBadge: { width: 28, height: 28, borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginRight: 2 },
  abcdLabel: { fontSize: 13, fontWeight: '600' },
  abcdContent: { fontSize: 15, color: '#334155', lineHeight: 24 },
  emotionTagNegative: { backgroundColor: '#FFF', borderWidth: 1.5, borderColor: '#FECACA', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 14 },
  emotionTagNegativeText: { color: '#DC2626', fontWeight: '600', fontSize: 12 },
  reactionSubLabel: { fontSize: 12, fontWeight: '600', color: '#DC2626', marginBottom: 4 },
  tagOutline: { backgroundColor: '#FFF', borderWidth: 1.5, borderColor: '#E2E8F0', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 14 },
  tagOutlineText: { color: '#475569', fontWeight: '500', fontSize: 13 },
});

export default DailyScreen;