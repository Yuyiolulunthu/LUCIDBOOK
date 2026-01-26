// ==========================================
// 檔案名稱: src/screens/home/series/WorkplaceCommunicationSeries.js
// 職場溝通力計劃系列組件 - 完整修正版
// 版本: V4.0 - 修正布局和顯示問題
// ==========================================

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle } from 'react-native-svg';
import {
  RotateCcw,
  Ear,
  Languages,
  Snowflake,
  Clock,
  ArrowRight,
} from 'lucide-react-native';

const PracticeModuleCard = ({ module, onStartPractice }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const Icon = module.icon;

  return (
    <View style={styles.moduleCard}>
      {/* ⭐ 上半部：內容區域（會自動伸縮）*/}
      <View style={styles.moduleContentWrapper}>
        {/* 頂部：Icon + 標題 + 標籤（同一行）*/}
        <View style={styles.moduleHeaderRow}>
          {/* 左側：Icon + 標題 */}
          <View style={styles.moduleTitleSection}>
            {/* 小 Icon */}
            <View style={[styles.moduleIconSmall, { backgroundColor: module.iconBg }]}>
              <Icon color={module.iconColor} size={20} strokeWidth={2} />
            </View>
            {/* 標題 */}
            <Text style={styles.moduleTitle}>{module.title}</Text>
          </View>
          
          {/* 右側：時間和進度標籤 */}
          <View style={styles.moduleMetaGroup}>
            {/* 時間標籤 */}
            <View style={styles.moduleMetaTag}>
              <Clock color="#9CA3AF" size={12} />
              <Text style={styles.moduleDuration}>{module.duration}</Text>
            </View>
            
            {/* 進度標籤 */}
            <View style={styles.moduleProgressTag}>
              <Text style={styles.moduleProgressText}>{module.progress}</Text>
            </View>
          </View>
        </View>

        {/* 標籤（未展開時顯示）*/}
        {!isExpanded && (
          <View style={styles.tagsContainer}>
            {module.tags.map((tag, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>#{tag}</Text>
              </View>
            ))}
          </View>
        )}

        {/* 展開的描述（無黃色底框）*/}
        {isExpanded && (
          <Animated.View style={styles.descriptionContainer}>
            <Text style={styles.descriptionText}>{module.description}</Text>
          </Animated.View>
        )}
      </View>

      {/* ⭐ 下半部：按鈕組（固定在底部）*/}
      <View style={styles.buttonRow}>
        <TouchableOpacity
          onPress={() => setIsExpanded(!isExpanded)}
          style={[
            styles.detailButton,
            isExpanded && styles.detailButtonActive,
          ]}
          activeOpacity={0.8}
        >
          <Text
            style={[
              styles.detailButtonText,
              isExpanded && styles.detailButtonTextActive,
            ]}
          >
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
  const [weeklyProgress] = useState([
    { day: '一', duration: 3 },
    { day: '二', duration: 5 },
    { day: '三', duration: 2 },
    { day: '四', duration: 0 },
    { day: '五', duration: 0 },
    { day: '六', duration: 0 },
    { day: '日', duration: 0 },
  ]);

  const [practiceModules] = useState([
    {
      id: 'stop-internal-friction',
      title: '內耗終止鍵',
      icon: RotateCcw,
      iconBg: '#F3E8FF',
      iconColor: '#A855F7',
      duration: '5分鐘',
      progress: '0/3',
      tags: ['焦慮', '在乎他人反應', '情緒調節力'],
      description: '當他人的反應令你內耗不適，或是懷疑自己被針對，陷入焦慮，那麼這個練習很適合你一探究竟',
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
      description: '如果因為他人的反應而感到難受，或是想要敞下敵意，修復與對方的關係，請點擊練習',
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
      description: '當你覺得情緒焦慮、理智快要斷掉，或是被激怒、想立刻反擊的時候，先進來靜靜吧',
    },
  ]);

  const currentProgress = 10;
  const targetProgress = 30;
  const progressPercentage = (currentProgress / targetProgress) * 100;

  // 圓形進度條參數 - 加大圓環寬度
  const size = 140;
  const strokeWidth = 16;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (circumference * progressPercentage) / 100;

  const handleStartPractice = (practiceId) => {
    console.log('🎯 [職場溝通] 開始練習:', practiceId);
    // TODO: 導航到對應練習
  };

  const handleShowPlanIntro = () => {
    console.log('📋 [職場溝通] 查看計劃介紹');
    // TODO: 顯示計劃介紹 Modal
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* 標題區 */}
      <View style={styles.header}>
        <Text style={styles.companyTitle}>
          {userName || 'OO'}的
        </Text>
        <Text style={styles.companyName}>職場溝通力計劃</Text>
        <Text style={styles.subtitle}>
          幫助你提升職場溝通效率，建立良好人際關係！
        </Text>
      </View>

      {/* ⭐ 本週目標區域 - 左右對稱布局 */}
        <View style={styles.goalSection}>
        {/* 左側：圓圈進度條（無背景卡片）*/}
        <View style={styles.progressCircleWrapper}>
            <Svg width={size} height={size}>
            {/* 背景圓 */}
            <Circle
                stroke="#FEF3C7"
                fill="none"
                cx={size / 2}
                cy={size / 2}
                r={radius}
                strokeWidth={strokeWidth}
            />
            {/* 進度圓 */}
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

            {/* 中心文字 */}
            <View style={styles.progressCircleCenter}>
            <Text style={styles.progressCircleLabelSmall}>計畫累積</Text>
            <Text style={styles.progressCircleLabelSmall}>完成度</Text>
            </View>
        </View>

        {/* 右側：本週目標卡片 */}
        <View style={styles.goalCard}>
            <Text style={styles.goalCardTitle}>本週目標</Text>
            <View style={styles.goalNumberWrapper}>
            <Text style={styles.goalNumber}>{currentProgress}</Text>
            <Text style={styles.goalTarget}> / {targetProgress}分鐘</Text>
            </View>
            <Text style={styles.goalEncouragement}>每天7分鐘！加油！</Text>
        </View>
        </View>

      {/* 本週練習概況 - 標題 */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>本週練習概況</Text>
      </View>

      {/* ⭐ 柱狀圖 - 獨立卡片（顯示分鐘數）*/}
      <View style={styles.chartCard}>
        <View style={styles.chartContainer}>
          {weeklyProgress.map((day, index) => {
            const maxDuration = Math.max(...weeklyProgress.map(d => d.duration));
            const barHeight = day.duration > 0 ? (day.duration / (maxDuration || 5)) * 60 : 4;
            
            return (
              <View key={index} style={styles.barWrapper}>
                {/* ⭐ 分鐘標籤 - 顯示在柱子上方 */}
                <View style={styles.minuteLabelContainer}>
                  {day.duration > 0 && (
                    <Text style={styles.minuteLabel}>{day.duration}分鐘</Text>
                  )}
                </View>
                
                {/* 柱子 */}
                <View
                  style={[
                    styles.bar,
                    {
                      height: barHeight,
                      backgroundColor: day.duration > 0 ? '#FFD6A7' : '#F3F4F6',
                    },
                  ]}
                />
                
                {/* 星期標籤 */}
                <Text style={styles.dayLabel}>{day.day}</Text>
              </View>
            );
          })}
        </View>
      </View>

      {/* 職場溝通力計劃介紹按鈕 */}
      <TouchableOpacity
        onPress={handleShowPlanIntro}
        style={styles.planIntroButton}
        activeOpacity={0.8}
      >
        <Text style={styles.planIntroText}>職場溝通力 計劃介紹</Text>
      </TouchableOpacity>

      {/* 練習單元 - 標題 */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>練習單元</Text>
      </View>

      {/* 練習單元卡片 */}
      <View style={styles.modulesContainer}>
        {practiceModules.map((module) => (
          <PracticeModuleCard
            key={module.id}
            module={module}
            onStartPractice={handleStartPractice}
          />
        ))}
      </View>

      {/* 底部間距 */}
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

  // ========== 標題區 ==========
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

  // ========== ⭐ 本週目標區域 - 左右對稱布局 ==========
  goalSection: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 24,
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  // 左側：本週目標卡片
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
  },

  // 右側：圓圈進度條（無背景卡片）
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
    fontWeight: '500',
    lineHeight: 16,
  },

  // 區塊標題
  sectionHeader: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },

  // ========== ⭐ 柱狀圖卡片（顯示分鐘數）==========
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
  
  // ⭐ 分鐘標籤容器 - 固定高度確保顯示
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

  // ========== 計劃介紹按鈕 ==========
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

  // ========== ⭐ 練習單元（拉長卡片）==========
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
    flex: 1,  // ⭐ 讓內容區域佔用剩餘空間
  },
  // ⭐ 頂部行：Icon + 標題 + 標籤
  moduleHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    },

    // 左側：Icon + 標題區域
  moduleTitleSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },

  // 小 Icon
  moduleIconSmall: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  // 標題
  moduleTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    flex: 1,
  },

  // ⭐ 右側：時間和進度標籤組（靠右）
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
  moduleTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    flex: 1,
    marginRight: 12,
  },

  // ========== 右上角標籤組 ==========
  moduleMetaGroup: {
    flexDirection: 'row',
    gap: 6,
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

  // 標籤 - 靠上對齊
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

  // ========== 描述區（無黃色底框）==========
  descriptionContainer: {
    marginBottom: 18,
  },
  descriptionText: {
    fontSize: 13,
    color: '#374151',
    lineHeight: 20,
  },

  // 按鈕組
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

  // 底部間距
  bottomPadding: {
    height: 40,
  },
});

export default WorkplaceCommunicationSeries;