// ==========================================
// 檔案名稱: src/screens/home/series/WorkplaceCommunicationSeries.js
// 職場溝通力計劃系列組件
// 版本: V6.0 - 計畫完成度(A方案)全套修正版
// 內容包含：
// 1) 圓環中心顯示「完成 X%」(用後端 plans.progress)
// 2) 顯示「單元完成數」(4 模組各最多 3 次 → 12)
// 3) useFocusEffect：從練習頁返回自動刷新
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
} from 'lucide-react-native';
import { useFocusEffect } from '@react-navigation/native';
import ApiService from '../../../services/index'; // ⭐ API Service

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

  // ✅ 計畫：以「次數」為主（後端 plans.totalSessions / plans.progress）
  const [currentProgress, setCurrentProgress] = useState(0); // 已完成次數
  const [targetProgress] = useState(28); // ✅ 計畫目標：28 次
  const [planPercent, setPlanPercent] = useState(0); // ✅ 圓環顯示：完成 X%
  const [moduleCompletedTotal, setModuleCompletedTotal] = useState(0); // ✅ 4模組(各3次) → 12

  const [practiceModules, setPracticeModules] = useState([
    {
      id: 'stop-internal-friction',
      title: '內耗終止鍵',
      icon: RotateCcw,
      iconBg: '#F3E8FF',
      iconColor: '#A855F7',
      duration: '5分鐘',
      progress: '0/3',
      tags: ['焦慮', '在乎他人反應', '情緒調節力'],
      description:
        '當他人的反應令你內耗不適，或是懷疑自己被針對，陷入焦慮，那麼這個練習很適合你一探究竟',
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
      description:
        '如果因為他人的反應而感到難受，或是想要敞下敵意，修復與對方的關係，請點擊練習',
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
    {
      id: 'emotional-resilience',
      title: '理智回穩力',
      icon: Snowflake,
      iconBg: '#DBEAFE',
      iconColor: '#3B82F6',
      duration: '4分鐘',
      progress: '0/3',
      tags: ['理智斷線', '情緒降溫', '憤怒難耐'],
      description:
        '當你覺得情緒焦慮、理智快要斷掉，或是被激怒、想立刻反擊的時候，先進來靜靜吧',
      screen: null,
      practiceType: '理智回穩力',
    },
  ]);

  // ⭐ 初次載入
  useEffect(() => {
    loadStatistics(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ⭐ 回到本頁自動刷新（從練習頁返回也會更新）
  useFocusEffect(
    React.useCallback(() => {
      loadStatistics(true); // silent refresh
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])
  );

  // ⭐ 下拉刷新
  const onRefresh = async () => {
    setRefreshing(true);
    await loadStatistics(false);
    setRefreshing(false);
  };

  // ⭐ 載入統計數據
  // silent=true：不要整頁 Loading，只更新數據（回到頁面更順）
  const loadStatistics = async (silent = false) => {
    try {
      console.log('📊 [職場溝通力] 載入統計數據...');
      if (!refreshing && !silent) setIsLoading(true);

      const response = await ApiService.getPracticeStats();

      if (response?.success && response?.stats) {
        console.log('✅ [職場溝通力] 統計數據:', response.stats);

        // 1️⃣ 計畫總進度（次數 + 百分比）
        const plan = response.stats?.plans?.['workplace-communication'];
        if (plan) {
          const totalSessions = plan.totalSessions || 0; // ✅ 後端有
          const percent = plan.progress || 0; // ✅ 後端有

          setCurrentProgress(totalSessions);
          setPlanPercent(percent);

          console.log('📈 [職場溝通] 已完成次數:', totalSessions);
          console.log('📈 [職場溝通] 計畫完成度:', percent, '%');
        } else {
          setCurrentProgress(0);
          setPlanPercent(0);
        }

        // 2️⃣ 更新本週練習數據
        if (response.stats.weeklyPractices) {
          processWeeklyPractices(response.stats.weeklyPractices);
        }

        // 3️⃣ 更新練習模組進度（同時計算「單元完成總數 / 12」）
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

  // ⭐ 處理本週練習數據
  const processWeeklyPractices = (weeklyPractices) => {
    try {
      const weekData = Array(7).fill(0);

      // 計算本週一的日期
      const today = new Date();
      const currentDay = today.getDay();
      const mondayOffset = currentDay === 0 ? -6 : 1 - currentDay;
      const monday = new Date(today);
      monday.setDate(today.getDate() + mondayOffset);
      monday.setHours(0, 0, 0, 0);

      weeklyPractices.forEach((practice) => {
        const practiceDate = new Date(practice.created_at);
        const daysDiff = Math.floor((practiceDate - monday) / (1000 * 60 * 60 * 24));
        if (daysDiff >= 0 && daysDiff < 7) {
          weekData[daysDiff] += practice.duration || 0;
        }
      });

      const labels = ['一', '二', '三', '四', '五', '六', '日'];
      const newWeeklyProgress = weekData.map((duration, index) => ({
        day: labels[index],
        duration: Math.round(duration),
      }));

      setWeeklyProgress(newWeeklyProgress);
      console.log('📅 本週數據:', newWeeklyProgress);
    } catch (error) {
      console.error('❌ 處理本週數據失敗:', error);
    }
  };

  // ⭐ 更新練習模組進度 + 計算完成總數(最多12)
  const updateModuleProgress = (categoryStats) => {
    try {
      // 先算完成總數
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
              progress: `${completedSessions}/${targetSessions}`,
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

  // ✅ 圓形進度：直接用後端算好的 planPercent（有保底）
  const progressPercentage = Math.min(planPercent, 100);

  // 圓形進度條參數
  const size = 140;
  const strokeWidth = 16;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (circumference * progressPercentage) / 100;

  // 處理練習點擊
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

  // ⭐ Loading 畫面
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
      {/* 標題區 */}
      <View style={styles.header}>
        <Text style={styles.companyTitle}>{userName || 'OO'}的</Text>
        <Text style={styles.companyName}>職場溝通力計劃</Text>
        <Text style={styles.subtitle}>幫助你提升職場溝通效率，建立良好人際關係！</Text>
      </View>

      {/* 計畫目標區域 */}
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
          <Text style={styles.goalCardTitle}>計畫累積</Text>
          <View style={styles.goalNumberWrapper}>
            <Text style={styles.goalNumber}>{currentProgress}</Text>
            <Text style={styles.goalTarget}> / {targetProgress}次</Text>
          </View>
          <Text style={styles.goalEncouragement}>每完成一次練習，就完成計畫的一步！</Text>
          <Text style={styles.goalEncouragement}>單元完成度：{moduleCompletedTotal} / 12</Text>
        </View>
      </View>

      {/* 本週練習概況 */}
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

      {/* 計劃介紹按鈕 */}
      <TouchableOpacity onPress={handleShowPlanIntro} style={styles.planIntroButton} activeOpacity={0.8}>
        <Text style={styles.planIntroText}>職場溝通力 計劃介紹</Text>
      </TouchableOpacity>

      {/* 練習單元 */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>練習單元</Text>
      </View>

      <View style={styles.modulesContainer}>
        {practiceModules.map((module) => (
          <PracticeModuleCard key={module.id} module={module} onStartPractice={handleStartPractice} />
        ))}
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
    minHeight: 200,
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
  bottomPadding: {
    height: 40,
  },
});

export default WorkplaceCommunicationSeries;
