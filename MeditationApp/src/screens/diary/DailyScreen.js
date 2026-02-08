// ==========================================
// DailyScreen.js
// 版本: V2.5 - 新增同理讀心術支持，完整顯示內耗與思維調節練習
// 更新日期: 2026/02/04
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
  Calendar as CalendarIcon,
  X,
  Heart,
  Lightbulb,
  RefreshCw,
  Clock,
  FileText,
  Brain,
  Mail,
  BookOpen,
  Gift,
  AlertCircle,
  Target,
  Eye,
  Scale,
  PenTool,
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
const WORKPLACE_PLAN_TYPES = [
  '內耗終止鍵', '內耗覺察', '同理讀心術', '溝通轉譯器', '理智回穩力', '心情溫度計-職場溝通力'];

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
      console.log('🔄 [日記] 收到強制刷新信號');
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
    if (practiceType.includes('心情溫度計-職場溝通力')) {
      return false;
    }
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

    if (selectedPlan === 'emotional') {
      filtered = filtered.filter(p => isEmotionalPlanPractice(p.practice_type));
    } else if (selectedPlan === 'workplace') {
      filtered = filtered.filter(p => isWorkplacePlanPractice(p.practice_type));
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

  const getRecordsForDate = (day) => {
    const dateStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return displayData.filter((r) => r.completed_at?.startsWith(dateStr));
  };

  const hasRecordOnDate = (day) => {
    return getRecordsForDate(day).length > 0;
  };

  const getRecordDotColor = (day) => {
    const records = getRecordsForDate(day);
    if (records.length === 0) return null;
    
    const sortedRecords = records.sort((a, b) => {
      return new Date(a.completed_at) - new Date(b.completed_at);
    });
    
    const firstRecord = sortedRecords[0];
    
    if (isWorkplacePlanPractice(firstRecord.practice_type)) {
      return '#FF8C42';
    }
    
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
    if (name.includes('同理讀心術')) return 'empathy';
    if (name.includes('溝通轉譯器')) return 'communication';
    if (name.includes('感恩') || name.includes('感謝信') || name.includes('如果練習')) return 'gratitude';
    if (name.includes('心情溫度計')) return 'thermometer';
    return 'other';
  };

  const getPlanName = (type) => {
    return '情緒抗壓力';
  };

  const getDisplayPracticeName = (practiceType) => {
    if (practiceType?.includes('心情溫度計')) {
      return '心情溫度計';
    }
    return practiceType;
  };

  const extractBreathingData = (practice) => {
    let data = { 
      relaxLevel: null, 
      postFeelings: null,
      postMood: null,
    };

    data.relaxLevel = practice.relax_level || practice.relaxLevel || practice.positive_level || null;
    data.postFeelings = practice.post_feelings || practice.postFeelings || practice.feelings || null;
    data.postMood = practice.post_mood || practice.postMood || null;

    if (practice.form_data) {
      try {
        const fd = typeof practice.form_data === 'string' ? JSON.parse(practice.form_data) : practice.form_data;
        if (fd) {
          data.relaxLevel = data.relaxLevel || fd.relax_level || fd.relaxLevel || null;
          data.postFeelings = data.postFeelings || fd.post_feelings || fd.postFeelings || null;

          if (!data.postFeelings && fd.feelings && Array.isArray(fd.feelings)) {
            data.postFeelings = fd.feelings.join('、');
          }

          data.postMood = data.postMood || fd.post_mood || fd.postMood || null;

          if (!data.postMood && fd.feelings && Array.isArray(fd.feelings) && fd.feelings.length > 0) {
            data.postMood = fd.feelings[0];
          }
        }
      } catch (e) {
        console.warn('[DailyScreen] 解析呼吸練習 form_data 失敗:', e);
      }
    }

    console.log('[DailyScreen] 呼吸練習數據:', data);
    return data;
  };

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

  // ✅✅✅ 修正版：思維調節完整欄位解析 ✅✅✅
  const extractCognitiveData = (practice) => {
    let data = {
      event: null,
      originalThought: null,
      emotions: [],
      bodyReactions: [],
      behaviors: [],
      emotionIntensity: null,
      
      // ✅ 新增：後半段欄位
      newThought: null,
      newPerspective: null,
      selectedCard: null,
      selectedAction: null,
      customAction: null,
      postScore: null,
      
      postMood: null,
      hasCustomOptions: false,
      
      situation: null,
      thoughts: null,
      needs: [],
      moodScore: null,
      
      supportingEvidence: null,   
      opposingEvidence: null,    
      habitPattern: null,         
      empathyPerspective: null,    
      controllable: null,          
      uncontrollable: null,     
      alternativeThinking: null,
      actionableSteps: null,   
    };

    const splitMaybe = (v) => {
      if (!v) return [];
      if (Array.isArray(v)) return v;
      if (typeof v === 'string') {
        return v.split(/[，,、]/).map(s => s.trim()).filter(Boolean);
      }
      return [String(v)];
    };

    if (practice.form_data) {
      try {
        const fd = typeof practice.form_data === 'string' ? JSON.parse(practice.form_data) : practice.form_data;
        if (fd) {
          // A：事件 / 情境
          data.event = fd.event || fd.activatingEvent || fd.trigger || fd.situation || null;
          data.situation = fd.situation || null;

          // B：原本想法
          data.originalThought =
            fd.originalThought ||
            fd.original_thought ||
            fd.automaticThought ||
            fd.thought ||
            fd.thoughts ||
            null;
          data.thoughts = fd.thoughts || fd.thought || null;

          // ✅ D：轉念後的觀點（新增）
          data.newPerspective = fd.newPerspective || fd.new_perspective || null;
          data.newThought = fd.newPerspective || fd.newThought || fd.new_thought || fd.balancedThought || fd.alternativeThought || null;
          
          // ✅ 靈感小卡（新增）
          data.selectedCard = fd.selectedCard || null;
          
          // ✅ 微小行動（新增）
          data.selectedAction = fd.selectedAction || fd.selected_action || null;
          data.customAction = fd.customAction || fd.custom_action || null;

          // 強度 / 分數
          data.emotionIntensity = fd.emotionIntensity || fd.emotion_intensity || fd.intensity || null;
          
          // ✅ 情緒減緩程度（新增）
          data.postScore = fd.postScore ?? fd.post_score ?? fd.moodScore ?? null;
          data.moodScore = fd.moodScore ?? fd.postScore ?? null;

          data.postMood = fd.postMood || fd.post_mood || null;

          // 反應資料：fullReactions
          if (fd.fullReactions) {
            data.emotions = Array.isArray(fd.fullReactions.emotions) ? fd.fullReactions.emotions : [];
            data.bodyReactions = Array.isArray(fd.fullReactions.bodyReactions) ? fd.fullReactions.bodyReactions : [];
            data.behaviors = Array.isArray(fd.fullReactions.behaviors) ? fd.fullReactions.behaviors : [];
            data.hasCustomOptions =
              (fd.customEmotions?.length > 0) ||
              (fd.customBodyReactions?.length > 0) ||
              (fd.customBehaviors?.length > 0);
          } else {
            if (Array.isArray(fd.emotionReactions)) data.emotions = fd.emotionReactions;
            else if (Array.isArray(fd.emotions)) data.emotions = fd.emotions;
            else if (fd.emotion) data.emotions = Array.isArray(fd.emotion) ? fd.emotion : [fd.emotion];

            if (Array.isArray(fd.physicalReactions)) data.bodyReactions = fd.physicalReactions;
            else if (Array.isArray(fd.bodyReactions)) data.bodyReactions = fd.bodyReactions;

            if (Array.isArray(fd.behaviorReactions)) data.behaviors = fd.behaviorReactions;
            else if (Array.isArray(fd.behaviors)) data.behaviors = fd.behaviors;

            const hasCustomStr =
              (typeof fd.customEmotions === 'string' && fd.customEmotions.trim().length > 0) ||
              (typeof fd.customPhysical === 'string' && fd.customPhysical.trim().length > 0) ||
              (typeof fd.customBehavior === 'string' && fd.customBehavior.trim().length > 0);

            const hasCustomArr =
              (Array.isArray(fd.customEmotions) && fd.customEmotions.length > 0) ||
              (Array.isArray(fd.customBodyReactions) && fd.customBodyReactions.length > 0) ||
              (Array.isArray(fd.customBehaviors) && fd.customBehaviors.length > 0);

            data.hasCustomOptions = hasCustomStr || hasCustomArr;
          }

          data.needs = splitMaybe(fd.needs);

          data.supportingEvidence = fd.supportingEvidence || null;
          data.opposingEvidence = fd.opposingEvidence || null;
          data.habitPattern = fd.habitPattern || null;
          data.empathyPerspective = fd.empathyPerspective || null;
          data.controllable = fd.controllable || null;
          data.uncontrollable = fd.uncontrollable || null;
          data.alternativeThinking = fd.alternativeThinking || fd.alternative_thinking || null;
          data.actionableSteps = fd.actionableSteps || fd.actionable_steps || fd.smallActions || null;

          if (!data.postMood && data.emotions.length > 0) {
            data.postMood = data.emotions[0];
          }
        }
      } catch (e) {
        console.warn('[DailyScreen] 解析內耗/思維 form_data 失敗:', e);
      }
    }

    console.log('[DailyScreen] 內耗/思維解析結果:', data);
    return data;
  };

  const extractGratitudeData = (practice) => {
    let data = {
      practiceType: null,
      gratitudeItems: null,
      gratitudeFeeling: null,
      recipient: null,
      thankMessage: null,
      ifImagine: null,
      ifAppreciate: null,
      postScore: null,
      relatedEmotions: [],
    };

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
          data.practiceType = fd.practiceType || fd.practice_type || fd.subType || data.practiceType || 'diary';
          data.gratitudeItems = fd.gratitudeItems || fd.gratitude_items || fd.gratitudeContent || fd.content || fd.goodThings || null;
          data.gratitudeFeeling = fd.gratitudeFeeling || fd.gratitude_feeling || fd.feeling || fd.reflection || null;
          data.recipient = fd.recipient || fd.to || fd.thankTo || fd.letterTo || null;
          data.thankMessage = fd.thankMessage || fd.thank_message || fd.message || fd.letterContent || fd.thankContent || null;
          data.ifImagine = fd.ifImagine || fd.if_imagine || fd.imagineWithout || fd.withoutIt || null;
          data.ifAppreciate = fd.ifAppreciate || fd.if_appreciate || fd.appreciateHaving || fd.nowAppreciate || null;
          data.postScore = fd.postScore ?? fd.post_score ?? fd.happinessLevel ?? fd.positiveLevel ?? fd.happiness ?? null;

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

  // ✅ 新增：同理讀心術數據提取
  const extractEmpathyData = (practice) => {
    let data = {
      situation: null,
      emotions: [],
      needs: null,
      limitations: null,
      translation: null,
      moodScore: null,
    };

    if (practice.form_data) {
      try {
        const fd = typeof practice.form_data === 'string' ? JSON.parse(practice.form_data) : practice.form_data;
        if (fd) {
          data.situation = fd.situation || fd.event || null;
          
          if (Array.isArray(fd.emotions)) {
            data.emotions = fd.emotions;
          } else if (fd.emotion) {
            data.emotions = Array.isArray(fd.emotion) ? fd.emotion : [fd.emotion];
          }
          
          data.needs = fd.needs || fd.otherNeeds || null;
          data.limitations = fd.limitations || fd.otherLimitations || null;
          data.translation = fd.translation || fd.empathyTranslation || null;
          data.moodScore = fd.moodScore ?? fd.postScore ?? fd.post_score ?? null;
        }
      } catch (e) {
        console.warn('[DailyScreen] 解析同理讀心術 form_data 失敗:', e);
      }
    }

    console.log('[DailyScreen] 同理讀心術解析結果:', data);
    return data;
  };

  const extractCommunicationData = (practice) => {
    let data = {
      facts: null,        // ✅ 新增
      situation: null,
      emotions: [],
      needs: null,
      request: null,      // ✅ 修正
      limitations: null,
      translation: null,
      moodScore: null,
    };

    if (practice.form_data) {
      try {
        const fd = typeof practice.form_data === 'string' 
          ? JSON.parse(practice.form_data) 
          : practice.form_data;
        
        if (fd) {
          // ✅ 新增facts欄位
          data.facts = fd.facts || fd.fact || null;
          
          data.situation = fd.situation || fd.event || null;
          
          if (Array.isArray(fd.emotions)) {
            data.emotions = fd.emotions;
          } else if (fd.emotion) {
            data.emotions = Array.isArray(fd.emotion) ? fd.emotion : [fd.emotion];
          }
          
          data.needs = fd.needs || fd.need || null;
          
          // ✅ 修正request欄位
          data.request = fd.request || null;
          
          data.limitations = fd.limitations || fd.otherLimitations || null;
          data.translation = fd.translation || fd.translatedMessage || fd.translated_message || fd.finalMessage || null;
          data.moodScore = fd.moodScore ?? fd.postScore ?? fd.post_score ?? null;
        }
      } catch (e) {
        console.warn('[DailyScreen] 解析溝通轉譯器 form_data 失敗:', e);
      }
    }

    console.log('[DailyScreen] 溝通轉譯器解析結果:', data);
    return data;
  };

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

  // ✅ 取得微小行動文字
  const getActionText = (selectedAction, customAction) => {
    if (customAction && customAction.trim()) {
      return customAction.trim();
    }
    
    const actionMap = {
      'talk': '找人聊聊',
      'breathe': '4-6 呼吸',
      'move': '站起來動一動',
      'write': '寫下此事我的努力',
    };
    
    return actionMap[selectedAction] || selectedAction || '未記錄';
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
    const isMoodThermometer = practiceType === 'thermometer';
    const isEmpathy = practiceType === 'empathy';
    const isCommunication = practiceType === 'communication';

    const breathingData = isBreathing ? extractBreathingData(selectedPractice) : null;
    const goodThingData = isGoodThings ? extractGoodThingData(selectedPractice) : null;
    const cognitiveData = isCognitive ? extractCognitiveData(selectedPractice) : null;
    const gratitudeData = isGratitude ? extractGratitudeData(selectedPractice) : null;
    const emotionThermometerData = isMoodThermometer ? extractEmotionThermometerData(selectedPractice) : null;
    const empathyData = isEmpathy ? extractEmpathyData(selectedPractice) : null;
    const communicationData = isCommunication ? extractCommunicationData(selectedPractice) : null;

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

    const getThemeColor = () => {
      if (isCognitive && selectedPractice.practice_type?.includes('內耗')) {
        return { 
          primary: '#FF8C42', 
          light: '#FFF4ED', 
          accent: '#FFE8DB', 
          gradient: ['#FF8C42', '#FF6B6B'] 
        };
      }
      
      // ✅ 同理讀心術使用粉色系
      if (isEmpathy) {
        return { 
          primary: '#EC4899', 
          light: '#FDF2F8', 
          accent: '#FCE7F3', 
          gradient: ['#EC4899', '#F472B6'] 
        };
      }

      if (isCommunication) {
        return { 
          primary: '#F59E0B', 
          light: '#FFFBEB', 
          accent: '#FEF3C7', 
          gradient: ['#F59E0B', '#FBBF24'] 
        };
      }
      
      if (isMoodThermometer) {
        const isWorkplaceMoodThermometer = selectedPractice.practice_type?.includes('職場溝通力');
        
        if (isWorkplaceMoodThermometer) {
          return { 
            primary: '#FF8C42', 
            light: '#FFF7ED', 
            accent: '#FFE8DB', 
            gradient: ['#FF8C42', '#FF6B6B'] 
          };
        }
        
        return { 
          primary: '#8B5CF6', 
          light: '#F5F3FF', 
          accent: '#EDE9FE', 
          gradient: ['#8B5CF6', '#A78BFA'] 
        };
      }
      
      if (isCognitive) return { primary: '#3B82F6', light: '#EFF6FF', accent: '#DBEAFE', gradient: ['#3B82F6', '#60A5FA'] };
      if (isGratitude) return { primary: '#EC4899', light: '#FDF2F8', accent: '#FCE7F3', gradient: ['#EC4899', '#F472B6'] };
      if (isBreathing) return { primary: '#10B981', light: '#ECFDF5', accent: '#D1FAE5', gradient: ['#10B981', '#34D399'] };
      if (isGoodThings) return { primary: '#F59E0B', light: '#FFFBEB', accent: '#FEF3C7', gradient: ['#F59E0B', '#FBBF24'] };
      return { primary: '#166CB5', light: '#EBF5FF', accent: '#DBEAFE', gradient: ['#166CB5', '#3B82F6'] };
    };

    const theme = getThemeColor();

    return (
      <Modal visible={detailModalVisible} transparent animationType="fade" onRequestClose={closeDetailModal}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <LinearGradient colors={theme.gradient} style={styles.modalTopAccent} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} />

            <TouchableOpacity style={styles.modalCloseBtn} onPress={closeDetailModal}>
              <View style={styles.modalCloseBtnCircle}>
                <X color="#64748B" size={16} strokeWidth={2.5} />
              </View>
            </TouchableOpacity>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.modalScrollContent}>
              <View style={styles.modalHeaderSection}>
                <Text style={styles.modalTitle}>
                  {isCognitive 
                    ? (selectedPractice.practice_type?.includes('內耗') ? '內耗終止鍵' : '思維調節') 
                    : isGratitude 
                    ? getGratitudeTitle() 
                    : isMoodThermometer && selectedPractice.practice_type?.includes('職場溝通力')
                    ? '心情溫度計'
                    : isEmpathy
                    ? '同理讀心術'
                    : selectedPractice.practice_type
                  }
                </Text>
                <Text style={styles.modalDate}>{formatModalDate(selectedPractice.completed_at)}</Text>
              </View>

              <View style={styles.modalMetaRow}>
                <View style={[styles.modalMetaTag, { backgroundColor: theme.light }]}>
                  <Clock color={theme.primary} size={12} strokeWidth={2.5} />
                  <Text style={[styles.modalMetaText, { color: theme.primary }]}>{formatModalDuration(totalSeconds)}</Text>
                </View>
                <View style={styles.modalMetaTagGray}>
                  <FileText color="#64748B" size={12} strokeWidth={2} />
                  <Text style={styles.modalMetaTextGray}>
                    {selectedPractice.practice_type?.includes('內耗') || isEmpathy || isCommunication
                      ? '職場溝通力' 
                      : '情緒抗壓力'}
                  </Text>
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

              {/* ========== ✅ 思維調節完整顯示（包含後半段） ========== */}
              {isCognitive && cognitiveData && (
                <>
                  {/* 事件 */}
                  {(cognitiveData.event || cognitiveData.situation) && (
                    <View style={[styles.abcdCard, { 
                      backgroundColor: theme.light, 
                      borderLeftWidth: 4, 
                      borderLeftColor: theme.primary 
                    }]}>
                      <View style={styles.abcdLabelRow}>
                        <View style={[styles.sectionIconBadge, { backgroundColor: theme.accent }]}>
                          <AlertCircle color={theme.primary} size={16} strokeWidth={2.5} />
                        </View>
                        <Text style={[styles.abcdLabel, { color: theme.primary, fontSize: 15 }]}>事件</Text>
                      </View>
                      <Text style={styles.abcdContent}>
                        {cognitiveData.event || cognitiveData.situation}
                      </Text>
                    </View>
                  )}

                  {/* 原本的想法 */}
                  {cognitiveData.originalThought && (
                    <View style={[styles.abcdCard, styles.abcdCardNegative]}>
                      <View style={styles.abcdLabelRow}>
                        <View style={[styles.sectionIconBadge, { backgroundColor: '#FEE2E2' }]}>
                          <Brain color="#DC2626" size={16} strokeWidth={2.5} />
                        </View>
                        <Text style={[styles.abcdLabel, { color: '#DC2626', fontSize: 15 }]}>原本的想法</Text>
                      </View>
                      
                      <Text style={styles.abcdContent}>{cognitiveData.originalThought}</Text>

                      {/* 情緒反應 */}
                      {(cognitiveData.emotions.length > 0 || 
                        cognitiveData.bodyReactions.length > 0 || 
                        cognitiveData.behaviors.length > 0 ||
                        (cognitiveData.needs && cognitiveData.needs.length > 0)) && (
                        <View style={{ marginTop: 16 }}>
                          {cognitiveData.emotions.length > 0 && (
                            <View style={{ marginBottom: 12 }}>
                              <Text style={styles.reactionSubLabel}>情緒：</Text>
                              <View style={styles.tagsRow}>
                                {cognitiveData.emotions.map((emotion, i) => (
                                  <View key={i} style={styles.emotionTagNegative}>
                                    <Text style={styles.emotionTagNegativeText}>{emotion}</Text>
                                  </View>
                                ))}
                              </View>
                            </View>
                          )}

                          {cognitiveData.bodyReactions.length > 0 && (
                            <View style={{ marginBottom: 12 }}>
                              <Text style={styles.reactionSubLabel}>身體：</Text>
                              <View style={styles.tagsRow}>
                                {cognitiveData.bodyReactions.map((reaction, i) => (
                                  <View key={i} style={styles.emotionTagNegative}>
                                    <Text style={styles.emotionTagNegativeText}>{reaction}</Text>
                                  </View>
                                ))}
                              </View>
                            </View>
                          )}

                          {cognitiveData.behaviors.length > 0 && (
                            <View style={{ marginBottom: 12 }}>
                              <Text style={styles.reactionSubLabel}>行為：</Text>
                              <View style={styles.tagsRow}>
                                {cognitiveData.behaviors.map((behavior, i) => (
                                  <View key={i} style={styles.emotionTagNegative}>
                                    <Text style={styles.emotionTagNegativeText}>{behavior}</Text>
                                  </View>
                                ))}
                              </View>
                            </View>
                          )}

                          {cognitiveData.needs && cognitiveData.needs.length > 0 && (
                            <View>
                              <Text style={styles.reactionSubLabel}>我需要什麼：</Text>
                              <View style={styles.tagsRow}>
                                {cognitiveData.needs.map((need, i) => (
                                  <View key={i} style={styles.emotionTagNegative}>
                                    <Text style={styles.emotionTagNegativeText}>{need}</Text>
                                  </View>
                                ))}
                              </View>
                            </View>
                          )}
                        </View>
                      )}
                    </View>
                  )}

                  {/* 尋找證據 */}
                  {(cognitiveData.supportingEvidence || cognitiveData.opposingEvidence) && (
                    <View style={[styles.abcdCard, { backgroundColor: '#F8FAFC' }]}>
                      <View style={styles.abcdLabelRow}>
                        <View style={[styles.sectionIconBadge, { backgroundColor: '#E2E8F0' }]}>
                          <Scale color="#64748B" size={16} strokeWidth={2.5} />
                        </View>
                        <Text style={[styles.abcdLabel, { color: '#64748B', fontSize: 15 }]}>尋找證據</Text>
                      </View>

                      {cognitiveData.supportingEvidence && (
                        <View style={{ marginBottom: 12 }}>
                          <Text style={[styles.reactionSubLabel, { color: '#64748B' }]}>
                            支持這個想法的證據
                          </Text>
                          <Text style={styles.abcdContent}>{cognitiveData.supportingEvidence}</Text>
                        </View>
                      )}

                      {cognitiveData.opposingEvidence && (
                        <View>
                          <Text style={[styles.reactionSubLabel, { color: '#64748B' }]}>
                            反對這個想法的證據
                          </Text>
                          <Text style={styles.abcdContent}>{cognitiveData.opposingEvidence}</Text>
                        </View>
                      )}
                    </View>
                  )}

                  {/* 轉換視角 */}
                  {(cognitiveData.habitPattern || cognitiveData.empathyPerspective) && (
                    <View style={[styles.abcdCard, { backgroundColor: '#F8FAFC' }]}>
                      <View style={styles.abcdLabelRow}>
                        <View style={[styles.sectionIconBadge, { backgroundColor: '#E2E8F0' }]}>
                          <Eye color="#64748B" size={16} strokeWidth={2.5} />
                        </View>
                        <Text style={[styles.abcdLabel, { color: '#64748B', fontSize: 15 }]}>轉換視角</Text>
                      </View>

                      {cognitiveData.habitPattern && (
                        <View style={{ marginBottom: 12 }}>
                          <Text style={[styles.reactionSubLabel, { color: '#64748B' }]}>
                            這是他平常的習慣還是只有針對我呢？
                          </Text>
                          <Text style={styles.abcdContent}>{cognitiveData.habitPattern}</Text>
                        </View>
                      )}

                      {cognitiveData.empathyPerspective && (
                        <View>
                          <Text style={[styles.reactionSubLabel, { color: '#64748B' }]}>
                            如果我是他，我當下可能會...
                          </Text>
                          <Text style={styles.abcdContent}>{cognitiveData.empathyPerspective}</Text>
                        </View>
                      )}
                    </View>
                  )}

                  {/* 專注可控 */}
                  {(cognitiveData.controllable || cognitiveData.uncontrollable) && (
                    <View style={[styles.abcdCard, { backgroundColor: '#F8FAFC' }]}>
                      <View style={styles.abcdLabelRow}>
                        <View style={[styles.sectionIconBadge, { backgroundColor: '#E2E8F0' }]}>
                          <Target color="#64748B" size={16} strokeWidth={2.5} />
                        </View>
                        <Text style={[styles.abcdLabel, { color: '#64748B', fontSize: 15 }]}>專注可控</Text>
                      </View>

                      {cognitiveData.controllable && (
                        <View style={{ marginBottom: 12 }}>
                          <Text style={[styles.reactionSubLabel, { color: '#64748B' }]}>
                            這件事有哪些可控的部分嗎？
                          </Text>
                          <Text style={styles.abcdContent}>{cognitiveData.controllable}</Text>
                        </View>
                      )}

                      {cognitiveData.uncontrollable && (
                        <View>
                          <Text style={[styles.reactionSubLabel, { color: '#64748B' }]}>
                            又有哪些不可控的部分呢？
                          </Text>
                          <Text style={styles.abcdContent}>{cognitiveData.uncontrollable}</Text>
                        </View>
                      )}
                    </View>
                  )}

                  {/* 試著換個角度想 */}
                  {cognitiveData.alternativeThinking && (
                    <View style={[styles.abcdCard, { backgroundColor: '#F8FAFC' }]}>
                      <View style={styles.abcdLabelRow}>
                        <View style={[styles.sectionIconBadge, { backgroundColor: '#E2E8F0' }]}>
                          <RefreshCw color="#64748B" size={16} strokeWidth={2.5} />
                        </View>
                        <Text style={[styles.abcdLabel, { color: '#64748B', fontSize: 15 }]}>試著換個角度想</Text>
                      </View>
                      <Text style={styles.abcdContent}>{cognitiveData.alternativeThinking}</Text>
                    </View>
                  )}

                  {/* 現在可以做的小行動 */}
                  {cognitiveData.actionableSteps && (
                    <View style={[styles.abcdCard, { backgroundColor: '#F8FAFC' }]}>
                      <View style={styles.abcdLabelRow}>
                        <View style={[styles.sectionIconBadge, { backgroundColor: '#E2E8F0' }]}>
                          <Target color="#64748B" size={16} strokeWidth={2.5} />
                        </View>
                        <Text style={[styles.abcdLabel, { color: '#64748B', fontSize: 15 }]}>現在可以做的小行動</Text>
                      </View>
                      <Text style={styles.abcdContent}>{cognitiveData.actionableSteps}</Text>
                    </View>
                  )}

                  {/* ✅ 轉念後的觀點（綠色卡片）*/}
                  {(cognitiveData.newPerspective || cognitiveData.newThought) && (
                    <View style={[styles.abcdCard, styles.abcdCardPositive]}>
                      <View style={styles.abcdLabelRow}>
                        <View style={[styles.sectionIconBadge, { backgroundColor: '#D1FAE5' }]}>
                          <Lightbulb color="#10B981" size={16} strokeWidth={2.5} />
                        </View>
                        <Text style={[styles.abcdLabel, { color: '#10B981', fontSize: 15 }]}>轉念後的觀點</Text>
                      </View>
                      <Text style={styles.abcdContent}>
                        {cognitiveData.newPerspective || cognitiveData.newThought}
                      </Text>
                    </View>
                  )}

                  {/* ✅ 微小行動（綠色卡片）*/}
                  {(cognitiveData.selectedAction || cognitiveData.customAction) && (
                    <View style={[styles.abcdCard, styles.abcdCardPositive]}>
                      <View style={styles.abcdLabelRow}>
                        <View style={[styles.sectionIconBadge, { backgroundColor: '#D1FAE5' }]}>
                          <PenTool color="#10B981" size={16} strokeWidth={2.5} />
                        </View>
                        <Text style={[styles.abcdLabel, { color: '#10B981', fontSize: 15 }]}>微小行動</Text>
                      </View>
                      <Text style={styles.abcdContent}>
                        {getActionText(cognitiveData.selectedAction, cognitiveData.customAction)}
                      </Text>
                    </View>
                  )}

                  {/* ✅ 情緒減緩程度（綠色成效卡）*/}
                  {(cognitiveData.moodScore !== null || cognitiveData.postScore !== null) && (
                    <View style={[styles.resultCard, { 
                      backgroundColor: '#ECFDF5', 
                      borderColor: '#D1FAE5',
                      marginTop: 8
                    }]}>
                      <View style={styles.resultCardHeader}>
                        <View style={[styles.resultIconBadge, { backgroundColor: '#D1FAE5' }]}>
                          <TrendingUp color="#10B981" size={14} />
                        </View>
                        <Text style={[styles.resultCardTitle, { color: '#10B981' }]}>練習成效</Text>
                      </View>
                      <View style={styles.scoreDisplayRow}>
                        <Text style={styles.scoreLabel}>情緒減緩程度</Text>
                        <View style={styles.scoreValueBox}>
                          <Text style={[styles.scoreValue, { color: '#10B981' }]}>
                            {cognitiveData.postScore ?? cognitiveData.moodScore}
                          </Text>
                          <Text style={styles.scoreMax}>/10</Text>
                        </View>
                      </View>
                    </View>
                  )}
                </>
              )}

              {/* ========== 感恩練習 ========== */}
              {isGratitude && gratitudeData && (
                <>
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

              {/* ========== 心情溫度計 ========== */}
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
                        colors={
                          selectedPractice.practice_type?.includes('職場溝通力')
                            ? ['#dd996f', '#ff3835', '#f97313']
                            : ['#93C5FD', '#A78BFA', '#F472B6']
                        }
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

              {/* ========== ✅ 同理讀心術 ========== */}
              {isEmpathy && empathyData && (
                <>
                  {/* 情境 */}
                  {empathyData.situation && (
                    <View style={[styles.abcdCard, { 
                      backgroundColor: theme.light, 
                      borderLeftWidth: 4, 
                      borderLeftColor: theme.primary 
                    }]}>
                      <View style={styles.abcdLabelRow}>
                        <View style={[styles.sectionIconBadge, { backgroundColor: theme.accent }]}>
                          <AlertCircle color={theme.primary} size={16} strokeWidth={2.5} />
                        </View>
                        <Text style={[styles.abcdLabel, { color: theme.primary, fontSize: 15 }]}>情境</Text>
                      </View>
                      <Text style={styles.abcdContent}>{empathyData.situation}</Text>
                    </View>
                  )}

                  {/* 辨識情緒 */}
                  {empathyData.emotions.length > 0 && (
                    <View style={styles.sectionCard}>
                      <Text style={styles.sectionLabel}>辨識情緒</Text>
                      <View style={styles.tagsRow}>
                        {empathyData.emotions.map((e, i) => (
                          <View key={i} style={[styles.emotionTagFilled, { backgroundColor: theme.primary }]}>
                            <Text style={styles.emotionTagFilledText}>{e}</Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  )}

                  {/* 理解需求 */}
                  {empathyData.needs && (
                    <View style={[styles.abcdCard, { backgroundColor: '#F8FAFC' }]}>
                      <View style={styles.abcdLabelRow}>
                        <View style={[styles.sectionIconBadge, { backgroundColor: '#E2E8F0' }]}>
                          <Heart color="#64748B" size={16} strokeWidth={2.5} />
                        </View>
                        <Text style={[styles.abcdLabel, { color: '#64748B', fontSize: 15 }]}>理解需求</Text>
                      </View>
                      <Text style={styles.abcdContent}>{empathyData.needs}</Text>
                    </View>
                  )}

                  {/* 考量限制 */}
                  {empathyData.limitations && (
                    <View style={[styles.abcdCard, { backgroundColor: '#F8FAFC' }]}>
                      <View style={styles.abcdLabelRow}>
                        <View style={[styles.sectionIconBadge, { backgroundColor: '#E2E8F0' }]}>
                          <Scale color="#64748B" size={16} strokeWidth={2.5} />
                        </View>
                        <Text style={[styles.abcdLabel, { color: '#64748B', fontSize: 15 }]}>考量限制</Text>
                      </View>
                      <Text style={styles.abcdContent}>{empathyData.limitations}</Text>
                    </View>
                  )}

                  {/* 同理翻譯（綠色成功卡）*/}
                  {empathyData.translation && (
                    <View style={[styles.abcdCard, styles.abcdCardPositive]}>
                      <View style={styles.abcdLabelRow}>
                        <View style={[styles.sectionIconBadge, { backgroundColor: '#D1FAE5' }]}>
                          <Lightbulb color="#10B981" size={16} strokeWidth={2.5} />
                        </View>
                        <Text style={[styles.abcdLabel, { color: '#10B981', fontSize: 15 }]}>同理翻譯</Text>
                      </View>
                      <Text style={styles.abcdContent}>{empathyData.translation}</Text>
                    </View>
                  )}

                  {/* 張力改善程度 */}
                  {empathyData.moodScore !== null && (
                    <View style={[styles.resultCard, { 
                      backgroundColor: '#ECFDF5', 
                      borderColor: '#D1FAE5',
                      marginTop: 8
                    }]}>
                      <View style={styles.resultCardHeader}>
                        <View style={[styles.resultIconBadge, { backgroundColor: '#D1FAE5' }]}>
                          <TrendingUp color="#10B981" size={14} />
                        </View>
                        <Text style={[styles.resultCardTitle, { color: '#10B981' }]}>練習成效</Text>
                      </View>
                      <View style={styles.scoreDisplayRow}>
                        <Text style={styles.scoreLabel}>張力改善程度</Text>
                        <View style={styles.scoreValueBox}>
                          <Text style={[styles.scoreValue, { color: '#10B981' }]}>{empathyData.moodScore}</Text>
                          <Text style={styles.scoreMax}>/10</Text>
                        </View>
                      </View>
                    </View>
                  )}
                </>
              )}

              {/* ========== 溝通轉譯器 ========== */}
              {isCommunication && communicationData && (
                <>
                  {/* ✅ 新增：客觀描述 */}
                  {communicationData.facts && (
                    <View style={[styles.abcdCard, { 
                      backgroundColor: theme.light, 
                      borderLeftWidth: 4, 
                      borderLeftColor: theme.primary 
                    }]}>
                      <View style={styles.abcdLabelRow}>
                        <View style={[styles.sectionIconBadge, { backgroundColor: theme.accent }]}>
                          <AlertCircle color={theme.primary} size={16} strokeWidth={2.5} />
                        </View>
                        <Text style={[styles.abcdLabel, { color: theme.primary, fontSize: 15 }]}>客觀描述</Text>
                      </View>
                      <Text style={styles.abcdContent}>{communicationData.facts}</Text>
                    </View>
                  )}

                  {/* 情境（如果沒有facts才顯示situation） */}
                  {!communicationData.facts && communicationData.situation && (
                    <View style={[styles.abcdCard, { 
                      backgroundColor: theme.light, 
                      borderLeftWidth: 4, 
                      borderLeftColor: theme.primary 
                    }]}>
                      <View style={styles.abcdLabelRow}>
                        <View style={[styles.sectionIconBadge, { backgroundColor: theme.accent }]}>
                          <AlertCircle color={theme.primary} size={16} strokeWidth={2.5} />
                        </View>
                        <Text style={[styles.abcdLabel, { color: theme.primary, fontSize: 15 }]}>情境</Text>
                      </View>
                      <Text style={styles.abcdContent}>{communicationData.situation}</Text>
                    </View>
                  )}

                  {/* 辨識感受 */}
                  {communicationData.emotions.length > 0 && (
                    <View style={styles.sectionCard}>
                      <Text style={styles.sectionLabel}>辨識感受</Text>
                      <View style={styles.tagsRow}>
                        {communicationData.emotions.map((e, i) => (
                          <View key={i} style={[styles.emotionTagFilled, { backgroundColor: theme.primary }]}>
                            <Text style={styles.emotionTagFilledText}>{e}</Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  )}

                  {/* 理解需求 */}
                  {communicationData.needs && (
                    <View style={[styles.abcdCard, { backgroundColor: '#F8FAFC' }]}>
                      <View style={styles.abcdLabelRow}>
                        <View style={[styles.sectionIconBadge, { backgroundColor: '#E2E8F0' }]}>
                          <Heart color="#64748B" size={16} strokeWidth={2.5} />
                        </View>
                        <Text style={[styles.abcdLabel, { color: '#64748B', fontSize: 15 }]}>理解需求</Text>
                      </View>
                      <Text style={styles.abcdContent}>{communicationData.needs}</Text>
                    </View>
                  )}

                  {/* ✅ 新增：提出請求 */}
                  {communicationData.request && (
                    <View style={[styles.abcdCard, { backgroundColor: '#F8FAFC' }]}>
                      <View style={styles.abcdLabelRow}>
                        <View style={[styles.sectionIconBadge, { backgroundColor: '#E2E8F0' }]}>
                          <Scale color="#64748B" size={16} strokeWidth={2.5} />
                        </View>
                        <Text style={[styles.abcdLabel, { color: '#64748B', fontSize: 15 }]}>提出請求</Text>
                      </View>
                      <Text style={styles.abcdContent}>{communicationData.request}</Text>
                    </View>
                  )}

                  {communicationData.translation && (
                    <View style={[styles.abcdCard, styles.abcdCardPositive]}>
                      <View style={styles.abcdLabelRow}>
                        <View style={[styles.sectionIconBadge, { backgroundColor: '#D1FAE5' }]}>
                          <Lightbulb color="#10B981" size={16} strokeWidth={2.5} />
                        </View>
                        <Text style={[styles.abcdLabel, { color: '#10B981', fontSize: 15 }]}>翻譯後的訊息</Text>
                      </View>
                      <Text style={styles.abcdContent}>{communicationData.translation}</Text>
                    </View>
                  )}

                  {/* 溝通效果 */}
                  {communicationData.moodScore !== null && (
                    <View style={[styles.resultCard, { 
                      backgroundColor: '#ECFDF5', 
                      borderColor: '#D1FAE5',
                      marginTop: 8
                    }]}>
                      <View style={styles.resultCardHeader}>
                        <View style={[styles.resultIconBadge, { backgroundColor: '#D1FAE5' }]}>
                          <TrendingUp color="#10B981" size={14} />
                        </View>
                        <Text style={[styles.resultCardTitle, { color: '#10B981' }]}>練習成效</Text>
                      </View>
                      <View style={styles.scoreDisplayRow}>
                        <Text style={styles.scoreLabel}>溝通效果</Text>
                        <View style={styles.scoreValueBox}>
                          <Text style={[styles.scoreValue, { color: '#10B981' }]}>{communicationData.moodScore}</Text>
                          <Text style={styles.scoreMax}>/10</Text>
                        </View>
                      </View>
                    </View>
                  )}
                </>
              )}

              {currentDayRecords.length > 1 && (
                <View style={styles.recordNavigatorBottom}>
                  <TouchableOpacity
                    onPress={handlePrevRecord}
                    disabled={currentRecordIndex === 0}
                    style={[styles.navButtonBottom, currentRecordIndex === 0 && styles.navButtonDisabled]}
                    activeOpacity={0.7}
                  >
                    <ChevronLeft color={currentRecordIndex === 0 ? '#CBD5E1' : '#76787aff'} size={20} strokeWidth={2.5} />
                  </TouchableOpacity>

                  <Text style={styles.recordCounterBottom}>
                    {currentRecordIndex + 1} / {currentDayRecords.length}
                  </Text>

                  <TouchableOpacity
                    onPress={handleNextRecord}
                    disabled={currentRecordIndex === currentDayRecords.length - 1}
                    style={[styles.navButtonBottom, currentRecordIndex === currentDayRecords.length - 1 && styles.navButtonDisabled]}
                    activeOpacity={0.7}
                  >
                    <ChevronRight color={currentRecordIndex === currentDayRecords.length - 1 ? '#CBD5E1' : '#76787aff'} size={20} strokeWidth={2.5} />
                  </TouchableOpacity>
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
              <TrendingUp color="#2563EB" size={24} strokeWidth={2} />
              <View style={styles.statValueContainer}>
                <Text style={styles.statValueBlue} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.5}>
                  {stats.totalPractices}
                </Text>
              </View>
              <Text style={styles.statLabel}>本月練習次數</Text>
            </View>

            <View style={styles.statBoxPurple}>
              <Clock color="#9333EA" size={24} strokeWidth={2} />
              <View style={styles.statValueContainer}>
                <Text style={styles.statValuePurple} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.4}>
                  {formatStatsDuration(stats.totalDuration)}
                </Text>
              </View>
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
              <FileText color={viewMode === 'list' ? '#166CB5' : '#C4C4C4'} size={20} strokeWidth={2} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setViewMode('calendar')} style={[styles.viewToggleBtn, viewMode === 'calendar' && styles.viewToggleBtnActive]}>
              <CalendarIcon color={viewMode === 'calendar' ? '#166CB5' : '#C4C4C4'} size={20} strokeWidth={2} />
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
            
            <TouchableOpacity onPress={() => setSelectedPlan('workplace')} activeOpacity={0.8}>
              <View style={selectedPlan === 'workplace' ? styles.filterPillWorkplace : styles.filterPillInactive}>
                <Text style={selectedPlan === 'workplace' ? styles.filterPillWorkplaceText : styles.filterPillInactiveText}>職場溝通力</Text>
              </View>
            </TouchableOpacity>
          </View>
        </ScrollView>

        {viewMode === 'calendar' && (
          <View style={styles.calendarCard}>
            <View style={styles.calendarGrid}>
              {['日', '一', '二', '三', '四', '五', '六'].map((d) => (
                <View key={d} style={styles.calendarWeekday}><Text style={styles.calendarWeekdayText}>{d}</Text></View>
              ))}
              {days.map((day, idx) => {
                if (!day) return <View key={`e-${idx}`} style={styles.calendarDay} />;
                const hasRecord = hasRecordOnDate(day);
                const dotColor = getRecordDotColor(day);
                
                return (
                  <TouchableOpacity
                    key={day}
                    onPress={() => handleDayClick(day)}
                    disabled={!hasRecord}
                    style={styles.calendarDay}
                  >
                    <Text style={[styles.calendarDayText, hasRecord && styles.calendarDayTextActive]}>
                      {day}
                    </Text>
                    {hasRecord && <View style={[styles.calendarDot, { backgroundColor: dotColor }]} />}
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
                    if (secs === 0) return `${String(mins).padStart(2, '0')}:00 `;
                    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')} `;
                  };

                  return (
                    <TouchableOpacity key={index} style={styles.recordCard} onPress={() => openDetailModal(record)} activeOpacity={0.7}>
                      <View style={styles.recordHeader}><Text style={styles.recordDate}>{formatRecordDate(record.completed_at)}</Text></View>
                      <Text style={styles.recordTitle}>{getDisplayPracticeName(record.practice_type)}</Text>
                      <View style={styles.recordFooter}>
                        <View style={styles.recordFooterItem}>
                          <Clock color="#9CA3AF" size={14} strokeWidth={1.5} />
                          <Text style={styles.recordFooterText}>{formatRecordDuration(totalSeconds)}</Text>
                        </View>
                        <View style={styles.recordFooterItem}>
                          <FileText color="#9CA3AF" size={14} strokeWidth={1.5} />
                          <Text style={styles.recordFooterText}>
                            {isWorkplacePlanPractice(record.practice_type) ? '職場溝通力' : planName}
                          </Text>
                        </View>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            ) : (
              <View style={styles.contentCardOuter}>
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
    elevation: 3
  },
  statsRow: { flexDirection: 'row', gap: 12 },

  statBoxBlue: {
    flex: 1,
    backgroundColor: '#E8F4FD',
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 16,
    alignItems: 'center',
    position: 'relative'
  },
  statBoxPurple: {
    flex: 1,
    backgroundColor: '#F3E8FF',
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 16,
    alignItems: 'center',
    position: 'relative'
  },
  statValueContainer: {
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 8,
    width: '100%',
  },
  statValueBlue: {
    fontSize: 40,
    fontWeight: '700',
    color: '#2563EB',
    textAlign: 'center',
    width: '100%',
  },
  statValuePurple: {
    fontSize: 28,
    fontWeight: '700',
    color: '#9333EA',
    textAlign: 'center',
    width: '100%',
    paddingHorizontal: 4,
  },
  statLabel: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 4,
    textAlign: 'center',
  },

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
  filterPillWorkplace: { 
    paddingHorizontal: 24, 
    paddingVertical: 12, 
    borderRadius: 25, 
    backgroundColor: '#FF8C42' 
  },
  filterPillWorkplaceText: { 
    fontSize: 14, 
    fontWeight: '600', 
    color: '#FFFFFF' 
  },

  contentCardOuter: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    marginHorizontal: 16,
    marginTop: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3
  },

  calendarCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    marginHorizontal: 16,
    marginTop: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3
  },

  emptyContent: { alignItems: 'center', paddingVertical: 50 },
  emptyTitle: { fontSize: 16, color: '#9CA3AF', marginTop: 20, fontWeight: '500' },
  emptySubtitle: { fontSize: 14, color: '#D1D5DB', marginTop: 6 },

  calendarGrid: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -2 },
  calendarWeekday: { width: `${100 / 7}%`, paddingVertical: 8, alignItems: 'center' },
  calendarWeekdayText: { fontSize: 13, color: '#9CA3AF', fontWeight: '600' },
  calendarDay: {
    flexBasis: `${100 / 7}%`,
    maxWidth: `${100 / 7}%`,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 8,
    paddingHorizontal: 0,
  },
  calendarDayText: { fontSize: 15, color: '#6B7280', fontWeight: '500' },
  calendarDayTextActive: { color: '#1F2937', fontWeight: '600' },
  calendarDot: { width: 5, height: 5, borderRadius: 2.5, marginTop: 4 },

  listContainer: { paddingHorizontal: 16, marginTop: 16 },
  recordCard: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 20, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 3 },
  recordHeader: { marginBottom: 6 },
  recordDate: { fontSize: 12, color: '#9CA3AF' },
  recordTitle: { fontSize: 18, fontWeight: '600', color: '#1F2937', marginBottom: 12 },
  recordFooter: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  recordFooterItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  recordFooterText: { fontSize: 12, color: '#9CA3AF' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalContainer: { backgroundColor: '#FFFFFF', borderRadius: 24, width: '100%', maxWidth: 360, maxHeight: '85%', position: 'relative', overflow: 'hidden' },
  modalTopAccent: { height: 4, width: '100%' },
  modalScrollContent: { padding: 24, paddingTop: 20 },
  modalCloseBtn: { position: 'absolute', top: 16, right: 16, zIndex: 10 },
  modalCloseBtnCircle: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#F1F5F9', justifyContent: 'center', alignItems: 'center' },
  modalHeaderSection: { alignItems: 'center', marginBottom: 16 },

  recordNavigatorBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 32,
    marginBottom: -15,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  reactionSubLabel: {
    fontSize: 12,
    color: '#DC2626',
    fontWeight: '600',
    marginBottom: 8
  },
  navButtonBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    gap: 8,
  },
  navButtonDisabled: { opacity: 0.4 },
  recordCounterBottom: { fontSize: 16, fontWeight: '700', color: '#76787aff' },

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
  sectionIconBadge: { width: 28, height: 28, borderRadius: 8, justifyContent: 'center', alignItems: 'center',marginRight: 2 },
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