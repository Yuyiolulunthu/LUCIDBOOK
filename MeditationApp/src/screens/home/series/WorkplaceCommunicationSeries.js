// ==========================================
// 檔案名稱: src/screens/home/series/WorkplaceCommunicationSeries.js
// 職場溝通力計劃系列組件
// 版本: V8.0 - 更新練習單元順序和新增卡片
// ==========================================

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Animated,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import {
  RotateCcw,
  Ear,
  Languages,
  Snowflake,
  Clock,
  ArrowRight,
  Thermometer,
  RefreshCw,
} from 'lucide-react-native';
import { useFocusEffect } from '@react-navigation/native';
import ApiService from '../../../services/index';

// ==========================================
// ⭐ 心情溫度計卡片組件（特殊樣式）
// ==========================================
const MoodThermometerCard = ({ module }) => {
  const Icon = module.icon;

  return (
    <View style={styles.moodCard}>
      <View style={[styles.moodIconContainer, { backgroundColor: module.iconBg }]}>
        <Icon color={module.iconColor} size={24} strokeWidth={2} />
      </View>
      <View style={styles.moodContent}>
        <Text style={styles.moodTitle}>{module.title}</Text>
        <Text style={styles.moodDescription}>{module.description}</Text>
      </View>
    </View>
  );
};

// ==========================================
// 練習單元卡片組件
// ==========================================
const PracticeModuleCard = ({ module, onStartPractice }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const Icon = module.icon;

  return (
    <View style={styles.moduleCard}>
      <View style={styles.moduleContentWrapper}>
        <View style={styles.moduleHeaderRow}>
          <View style={styles.moduleTitleSection}>
            <View style={[styles.moduleIconSmall, { backgroundColor: module.iconBg }]}>
              <Icon color={module.iconColor} size={20} strokeWidth={2} />
            </View>
            <Text style={styles.moduleTitle}>{module.title}</Text>
          </View>

          <View style={styles.moduleMetaGroup}>
            <View style={styles.moduleMetaTag}>
              <Clock color="#9CA3AF" size={12} />
              <Text style={styles.moduleDuration}>{module.duration}</Text>
            </View>

            <View style={styles.moduleProgressTag}>
              <Text style={styles.moduleProgressText}>{module.progress}</Text>
            </View>
          </View>
        </View>

        {!isExpanded && (
          <View style={styles.tagsContainer}>
            {module.tags.map((tag, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>#{tag}</Text>
              </View>
            ))}
          </View>
        )}

        {isExpanded && (
          <Animated.View style={styles.descriptionContainer}>
            <Text style={styles.descriptionText}>{module.description}</Text>
          </Animated.View>
        )}
      </View>

      <View style={styles.buttonRow}>
        <TouchableOpacity
          onPress={() => setIsExpanded(!isExpanded)}
          style={[styles.detailButton, isExpanded && styles.detailButtonActive]}
          activeOpacity={0.8}
        >
          <Text style={[styles.detailButtonText, isExpanded && styles.detailButtonTextActive]}>
            練習內涵
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => onStartPractice(module.id)}
          style={styles.startButton}
          activeOpacity={0.8}
        >
          <Text style={styles.startButtonText}>開始練習</Text>
          <ArrowRight color="#FF8C42" size={16} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const WorkplaceCommunicationSeries = ({ navigation, userName }) => {
  // ⭐ 狀態管理
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [weeklyProgress, setWeeklyProgress] = useState([
    { day: '一', duration: 0 },
    { day: '二', duration: 0 },
    { day: '三', duration: 0 },
    { day: '四', duration: 0 },
    { day: '五', duration: 0 },
    { day: '六', duration: 0 },
    { day: '日', duration: 0 },
  ]);

  const [completedUnits, setCompletedUnits] = useState(0);
  const [totalUnits] = useState(6);
  const [planPercent, setPlanPercent] = useState(0);
  const [currentProgress, setCurrentProgress] = useState(0);
  const [targetProgress] = useState(30);
  const [moduleCompletedTotal, setModuleCompletedTotal] = useState(0);

  // ⭐ 更新後的練習模組（新順序）
  const [practiceModules, setPracticeModules] = useState([
    {
      id: 'emotional-resilience',
      title: '理智回穩力',
      icon: Snowflake,
      iconBg: '#FFF5E6',
      iconColor: '#FF8C42',
      duration: '4分鐘',
      progress: '0/3',
      tags: ['理智斷線', '情緒降溫', '憤怒難耐'],
      description: '當你覺得憤怒焦慮、理智快要斷掉，或是被激怒，想立刻反擊的時候，先進來靜靜吧',
      screen: null,
      practiceType: '理智回穩力',
    },
    {
      id: 'internal-observation',
      title: '內耗覺察',
      icon: RefreshCw,
      iconBg: '#F3E8FF',
      iconColor: '#A855F7',
      duration: '5分鐘',
      progress: '0/3',
      tags: ['焦慮', '自我覺察', '辨識需求'],
      description: '當他人的反應令你內耗不適,或是懷疑自己被針對,陷入焦慮,那麼這個練習很適合你一探究竟',
      screen: null,
      practiceType: '內耗覺察',
    },
    {
      id: 'stop-internal-friction',
      title: '內耗終止鍵',
      icon: RotateCcw,
      iconBg: '#F3E8FF',
      iconColor: '#A855F7',
      duration: '5分鐘',
      progress: '0/3',
      tags: ['焦慮', '在乎他人反應', '情緒調節力'],
      description: '當他人的反應令你內耗不適,或是懷疑自己被針對,陷入焦慮,那麼這個練習很適合你一探究竟',
      screen: 'InternalConflictPractice',
      practiceType: '內耗終止鍵',
    },
    {
      id: 'empathy-mind-reading',
      title: '同理讀心術',
      icon: Ear,
      iconBg: '#FCE7F3',
      iconColor: '#EC4899',
      duration: '7分鐘',
      progress: '0/3',
      tags: ['關係卡關', '覺得被針對', '同理心', '關係提升'],
      description: '如果因為他人的反應而感到難受,或是想要放下敵意,修復與對方的關係,請點擊練習',
      screen: null,
      practiceType: '同理讀心術',
    },
    {
      id: 'communication-translator',
      title: '溝通轉譯器',
      icon: Languages,
      iconBg: '#FEF3C7',
      iconColor: '#F59E0B',
      duration: '8分鐘',
      progress: '0/3',
      tags: ['委屈', '非暴力溝通', '開不了口', '怕衝突'],
      description: '覺得委屈卻又不知道如何開口嗎？想提要求卻又怕與人起衝突？來這裡就對了',
      screen: null,
      practiceType: '溝通轉譯器',
    },
  ]);

  // ⭐ 心情溫度計（特殊卡片）
  const moodThermometer = {
    id: 'mood-thermometer',
    title: '心情溫度計',
    icon: Thermometer,
    iconBg: '#FEE2E2',
    iconColor: '#EF4444',
    description: '用1分鐘快速瞭解自己的情緒狀態',
  };

  useEffect(() => {
    loadStatistics(false);
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      loadStatistics(true);
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadStatistics(false);
    setRefreshing(false);
  };

  const loadStatistics = async (silent = false) => {
    try {
      console.log('📊 [職場溝通力] 載入統計數據...');
      if (!refreshing && !silent) setIsLoading(true);

      const response = await ApiService.getPracticeStats();

      if (response?.success && response?.stats) {
        console.log('✅ [職場溝通力] 統計數據:', response.stats);

        const plan = response.stats?.plans?.['workplace-communication'];
        if (plan) {
          const progress = plan.progress || 0;
          const units = plan.completedUnits || 0;

          setPlanPercent(progress);
          setCompletedUnits(units);

          const weeklyMinutes = plan.weeklyMinutes || 0;
          setCurrentProgress(weeklyMinutes);

          console.log('📈 [職場溝通] 單元完成度:', progress, '%（', units, '/', totalUnits, '單元）');
          console.log('📈 [職場溝通] 本週分鐘數:', weeklyMinutes, '/', targetProgress, '分鐘');
        } else {
          setCompletedUnits(0);
          setPlanPercent(0);
          setCurrentProgress(0);
        }

        if (response.stats.weeklyPractices) {
          processWeeklyPractices(response.stats.weeklyPractices);
        }

        if (response.stats.categoryStats) {
          updateModuleProgress(response.stats.categoryStats);
        }
      } else {
        console.warn('⚠️ [職場溝通力] 統計數據異常', response);
      }
    } catch (error) {
      console.error('❌ [職場溝通力] 載入統計失敗:', error);
    } finally {
      if (!silent) setIsLoading(false);
    }
  };

  const processWeeklyPractices = (weeklyPractices) => {
    try {
      const weekData = Array(7).fill(0);

      const today = new Date();
      const currentDay = today.getDay();
      const mondayOffset = currentDay === 0 ? -6 : 1 - currentDay;
      const monday = new Date(today);
      monday.setDate(today.getDate() + mondayOffset);
      monday.setHours(0, 0, 0, 0);

      Object.keys(weeklyPractices).forEach((dateStr) => {
        const practiceDate = new Date(dateStr);
        const daysDiff = Math.floor((practiceDate - monday) / (1000 * 60 * 60 * 24));
        if (daysDiff >= 0 && daysDiff < 7) {
          weekData[daysDiff] = Math.round(weeklyPractices[dateStr] / 60);
        }
      });

      const labels = ['一', '二', '三', '四', '五', '六', '日'];
      const newWeeklyProgress = weekData.map((duration, index) => ({
        day: labels[index],
        duration: duration,
      }));

      setWeeklyProgress(newWeeklyProgress);
      console.log('📅 本週數據:', newWeeklyProgress);
    } catch (error) {
      console.error('❌ 處理本週數據失敗:', error);
    }
  };

  const updateModuleProgress = (categoryStats) => {
    try {
      let completedSum = 0;

      setPracticeModules((prevModules) => {
        const next = prevModules.map((module) => {
          const stat = categoryStats.find(
            (s) => s.type === module.practiceType || s.name === module.practiceType
          );

          if (stat) {
            const sessions = stat.sessions || 0;
            const targetSessions = 3;
            const completedSessions = Math.min(sessions, targetSessions);

            completedSum += completedSessions;

            return {
              ...module,
              progress: `${sessions}/${targetSessions}`,
            };
          }

          return module;
        });

        return next;
      });

      setModuleCompletedTotal(completedSum);
      console.log('🧩 單元完成度:', completedSum, '/ 12');
    } catch (error) {
      console.error('❌ 更新進度失敗:', error);
    }
  };

  const progressPercentage = Math.min(planPercent, 100);
  const size = 140;
  const strokeWidth = 16;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (circumference * progressPercentage) / 100;

  const handleStartPractice = (practiceId) => {
    console.log('🎯 [職場溝通] 開始練習:', practiceId);

    const practiceModule = practiceModules.find((module) => module.id === practiceId);

    if (!practiceModule) {
      console.error('❌ 找不到練習:', practiceId);
      return;
    }

    if (practiceModule.screen) {
      console.log('✅ 導航到:', practiceModule.screen);
      navigation.navigate(practiceModule.screen);
    } else {
      console.log('⚠️ 練習尚未開放');
      Alert.alert(practiceModule.title, '此練習即將推出，敬請期待！', [
        { text: '確定', style: 'default' },
      ]);
    }
  };

  const handleShowPlanIntro = () => {
    console.log('📋 [職場溝通] 查看介紹');
    navigation.navigate('WorkplaceCommunicationPlanIntro');
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF8C42" />
        <Text style={styles.loadingText}>載入統計數據中...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={styles.header}>
        <Text style={styles.companyTitle}>{userName || 'OO'}的</Text>
        <Text style={styles.companyName}>職場溝通力計劃</Text>
        <Text style={styles.subtitle}>幫助你提升職場溝通效率，建立良好人際關係！</Text>
      </View>

      <View style={styles.goalSection}>
        <View style={styles.progressCircleWrapper}>
          <Svg width={size} height={size}>
            <Circle
              stroke="#FEF3C7"
              fill="none"
              cx={size / 2}
              cy={size / 2}
              r={radius}
              strokeWidth={strokeWidth}
            />
            <Circle
              stroke="#FFD6A7"
              fill="none"
              cx={size / 2}
              cy={size / 2}
              r={radius}
              strokeWidth={strokeWidth}
              strokeDasharray={`${circumference} ${circumference}`}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              rotation="-90"
              origin={`${size / 2}, ${size / 2}`}
            />
          </Svg>

          <View style={styles.progressCircleCenter}>
            <Text style={styles.progressCircleLabelSmall}>完成</Text>
            <Text style={styles.progressCirclePercent}>{planPercent}%</Text>
          </View>
        </View>

        <View style={styles.goalCard}>
          <Text style={styles.goalCardTitle}>本週目標</Text>
          <View style={styles.goalNumberWrapper}>
            <Text style={styles.goalNumber}>{currentProgress}</Text>
            <Text style={styles.goalTarget}> / {targetProgress}分鐘</Text>
          </View>
          <Text style={styles.goalEncouragement}>每天7分鐘！加油！</Text>
        </View>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>本週練習概況</Text>
      </View>

      <View style={styles.chartCard}>
        <View style={styles.chartContainer}>
          {weeklyProgress.map((day, index) => {
            const maxDuration = Math.max(...weeklyProgress.map((d) => d.duration), 5);
            const barHeight = day.duration > 0 ? (day.duration / maxDuration) * 60 : 4;

            return (
              <View key={index} style={styles.barWrapper}>
                <View style={styles.minuteLabelContainer}>
                  {day.duration > 0 && <Text style={styles.minuteLabel}>{day.duration}分鐘</Text>}
                </View>

                <View
                  style={[
                    styles.bar,
                    {
                      height: barHeight,
                      backgroundColor: day.duration > 0 ? '#FFD6A7' : '#F3F4F6',
                    },
                  ]}
                />

                <Text style={styles.dayLabel}>{day.day}</Text>
              </View>
            );
          })}
        </View>
      </View>

      <TouchableOpacity onPress={handleShowPlanIntro} style={styles.planIntroButton} activeOpacity={0.8}>
        <Text style={styles.planIntroText}>職場溝通力 計劃介紹</Text>
      </TouchableOpacity>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>練習單元</Text>
      </View>

      <View style={styles.modulesContainer}>
        {practiceModules.map((module) => (
          <PracticeModuleCard key={module.id} module={module} onStartPractice={handleStartPractice} />
        ))}
        
        {/* ⭐ 心情溫度計特殊卡片 */}
        <MoodThermometerCard module={moodThermometer} />
      </View>

      <View style={styles.bottomPadding} />
    </ScrollView>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 14,
    color: '#6B7280',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 2,
    paddingBottom: 20,
  },
  companyTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
  },
  companyName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  goalSection: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 24,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  goalCard: {
    flex: 1,
    marginLeft: 12,
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  goalCardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },
  goalNumberWrapper: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 8,
  },
  goalNumber: {
    fontSize: 36,
    fontWeight: '700',
    color: '#FF8C42',
  },
  goalTarget: {
    fontSize: 16,
    color: '#9CA3AF',
  },
  goalEncouragement: {
    fontSize: 13,
    color: '#9CA3AF',
    marginTop: 2,
  },
  progressCircleWrapper: {
    position: 'relative',
    marginRight: 12,
  },
  progressCircleCenter: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressCircleLabelSmall: {
    fontSize: 12,
    color: '#F59E0B',
    fontWeight: '600',
    lineHeight: 16,
  },
  progressCirclePercent: {
    fontSize: 22,
    fontWeight: '800',
    color: '#F59E0B',
    lineHeight: 28,
  },
  sectionHeader: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  chartCard: {
    marginHorizontal: 20,
    marginBottom: 24,
    padding: 20,
    paddingTop: 32,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  chartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 90,
  },
  barWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  minuteLabelContainer: {
    height: 16,
    marginBottom: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  minuteLabel: {
    fontSize: 10,
    color: '#99A1AF',
    fontWeight: '400',
  },
  bar: {
    width: 36,
    borderRadius: 6,
    minHeight: 4,
  },
  dayLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 8,
    fontWeight: '500',
  },
  planIntroButton: {
    marginHorizontal: 20,
    marginBottom: 32,
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#FF8C42',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  planIntroText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF8C42',
  },
  modulesContainer: {
    paddingHorizontal: 20,
  },
  moduleCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    minHeight: 210,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    justifyContent: 'space-between',
  },
  moduleContentWrapper: {
    flex: 1,
  },
  moduleHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  moduleTitleSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  moduleIconSmall: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  moduleTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    flex: 1,
  },
  moduleMetaGroup: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
  },
  moduleMetaTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  moduleDuration: {
    fontSize: 11,
    color: '#6B7280',
    fontWeight: '500',
  },
  moduleProgressTag: {
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  moduleProgressText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#374151',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 18,
    alignItems: 'flex-start',
  },
  tag: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 100,
  },
  tagText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '400',
  },
  descriptionContainer: {
    marginBottom: 18,
  },
  descriptionText: {
    fontSize: 13,
    color: '#374151',
    lineHeight: 20,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  detailButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#FF8C42',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
  },
  detailButtonActive: {
    backgroundColor: '#FF8C42',
  },
  detailButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FF8C42',
  },
  detailButtonTextActive: {
    color: '#FFFFFF',
  },
  startButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#FF8C42',
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  startButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FF8C42',
  },
  // ⭐ 心情溫度計卡片樣式
  moodCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  moodIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  moodContent: {
    flex: 1,
  },
  moodTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  moodDescription: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 20,
  },
  bottomPadding: {
    height: 40,
  },
});

export default WorkplaceCommunicationSeries;