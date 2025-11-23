// ==========================================
// 檔案名稱: src/screens/home/EmotionalResiliencePlanScreen.js
// 情緒抗壓力計畫頁面（完整修正版 - 背景模糊）
// ==========================================

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  StatusBar,
  Animated,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Svg, { Circle } from 'react-native-svg';
import {
  ArrowLeft,
  Info,
  Wind,
  PenLine,
  Zap,
  Clock,
  ChevronRight,
} from 'lucide-react-native';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

// ==========================================
// 練習模組資料
// ==========================================
const planModules = [
  {
    id: 'breathing',
    title: '呼吸練習',
    subtitle: '快速調節神經系統',
    description: '運用呼吸調節副交感神經，快速降低焦慮與壓力反應。',
    icon: Wind,
    iconBgColor: '#EFF6FF',
    iconColor: '#3B82F6',
    gradientColors: ['#60A5FA', '#3B82F6'],
    frequency: '每日 1 次',
    progress: 0,
    target: 7,
    duration: '3-5 分鐘',
  },
  {
    id: 'goodthings',
    title: '好事書寫',
    subtitle: '強化自我效能',
    description: '紀錄生活中的微小成就與好事，累積正向心理資本。',
    icon: PenLine,
    iconBgColor: '#FFF7ED',
    iconColor: '#F97316',
    gradientColors: ['#FB923C', '#F97316'],
    frequency: '每週 3 次',
    progress: 0,
    target: 3,
    duration: '5 分鐘',
  },
];

// ==========================================
// 主組件
// ==========================================
const EmotionalResiliencePlanScreen = ({ navigation }) => {
  const [showInfo, setShowInfo] = useState(false);
  const progressAnim = useRef(new Animated.Value(0)).current;

  // 計算整體進度 - 假設 30%
  const overallPercentage = 30;

  useEffect(() => {
    // 進度圓圈動畫
    Animated.timing(progressAnim, {
      toValue: overallPercentage,
      duration: 1500,
      useNativeDriver: true,
    }).start();
  }, []);

  // 導航到練習頁面
  const handleStartPractice = (practiceId) => {
    if (practiceId === 'breathing') {
      navigation.navigate('PracticeNavigator', {
        practiceType: '呼吸穩定力練習',
      });
    } else if (practiceId === 'goodthings') {
      navigation.navigate('PracticeNavigator', {
        practiceType: '好事書寫',
      });
    }
  };

  // 圓形進度條參數
  const size = 128;
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (circumference * overallPercentage) / 100;

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="rgba(255, 255, 255, 0.8)"
        translucent
      />

      {/* Custom Header - 加高度避免被系統狀態欄遮擋 */}
      <BlurView intensity={80} tint="light" style={styles.headerBlur}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.headerButton}
          >
            <ArrowLeft color="#6B7280" size={24} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>情緒抗壓力計畫</Text>
          <TouchableOpacity
            onPress={() => setShowInfo(!showInfo)}
            style={styles.headerButton}
          >
            <Info color="#6B7280" size={24} />
          </TouchableOpacity>
        </View>
      </BlurView>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Section with Aurora Effect */}
        <View style={styles.heroSection}>
          <LinearGradient
            colors={['#1e293b', '#0f172a']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.heroGradient}
          >
            {/* Aurora Background Effects - 彩色圓圈 + 模糊層 */}
            <View style={styles.auroraContainer}>
              {/* 三個彩色圓圈 */}
              <View style={[styles.auroraBlob, styles.auroraBlob1]} />
              <View style={[styles.auroraBlob, styles.auroraBlob2]} />
              <View style={[styles.auroraBlob, styles.auroraBlob3]} />
              
              {/* 模糊層覆蓋在彩色圓圈上方 */}
              <BlurView intensity={50} tint="dark" style={StyleSheet.absoluteFill} />
            </View>

            {/* Content */}
            <View style={styles.heroContent}>
              {/* Badge */}
              <BlurView intensity={20} tint="dark" style={styles.badge}>
                <View style={styles.badgeContent}>
                  <Zap color="#93C5FD" size={12} fill="#93C5FD" />
                  <Text style={styles.badgeText}>心理肌力訓練</Text>
                </View>
              </BlurView>

              {/* Title */}
              <Text style={styles.heroTitle}>打造強韌的心理素質</Text>
              <Text style={styles.heroDescription}>
                這是一套基於認知行為治療 (CBT) 與正念減壓 (MBSR)
                的整合計畫，每天一點練習，累積面對挑戰的勇氣。
              </Text>

              {/* Overall Progress Ring - 使用 SVG 繪製圓弧 */}
              <View style={styles.progressRingContainer}>
                <Svg width={size} height={size} style={styles.progressSvg}>
                  {/* 背景圓圈 */}
                  <Circle
                    stroke="rgba(255, 255, 255, 0.1)"
                    fill="none"
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    strokeWidth={strokeWidth}
                  />
                  
                  {/* 進度圓圈 - 帶圓弧頭尾 */}
                  <AnimatedCircle
                    stroke="#5EEAD4"
                    fill="none"
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    strokeWidth={strokeWidth}
                    strokeDasharray={`${circumference} ${circumference}`}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round" // 圓弧頭尾
                    rotation="-90"
                    origin={`${size / 2}, ${size / 2}`}
                  />
                </Svg>

                {/* Center Text */}
                <View style={styles.progressRingCenter}>
                  <Text style={styles.progressPercentage}>
                    {overallPercentage}%
                  </Text>
                  <Text style={styles.progressLabel}>PLAN PROGRESS</Text>
                </View>
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* Info Card */}
        {showInfo && (
          <View style={styles.infoCard}>
            <View style={styles.infoHeader}>
              <Info color="#3B82F6" size={20} />
              <Text style={styles.infoTitle}>計畫說明</Text>
            </View>

            <View style={styles.infoSection}>
              <Text style={styles.infoSectionTitle}>🎯 計畫目的</Text>
              <Text style={styles.infoSectionText}>
                增強情緒調節能力，減少焦慮與壓力反應，並建立正向的思考習慣。
              </Text>
            </View>

            <View style={styles.infoSection}>
              <Text style={styles.infoSectionTitle}>💡 為什麼有效？</Text>
              <Text style={styles.infoSectionText}>
                透過「覺察」、「轉念」與「正向聚焦」的循環練習，能改變大腦的神經迴路，從生理與心理層面雙管齊下。
              </Text>
            </View>
          </View>
        )}

        {/* Modules Section */}
        <View style={styles.modulesSection}>
          <View style={styles.modulesSectionHeader}>
            <Text style={styles.modulesSectionTitle}>練習單元</Text>
            <View style={styles.modulesCountBadge}>
              <Text style={styles.modulesCountText}>共 2 個單元</Text>
            </View>
          </View>

          {/* Module Cards */}
          {planModules.map((module, index) => {
            const Icon = module.icon;
            const progressPercentage = Math.min(
              (module.progress / module.target) * 100,
              100
            );

            return (
              <View key={module.id} style={styles.moduleCard}>
                {/* Highlight Line */}
                <LinearGradient
                  colors={module.gradientColors}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 0, y: 1 }}
                  style={styles.moduleHighlight}
                />

                <View style={styles.moduleContent}>
                  {/* Icon */}
                  <View
                    style={[
                      styles.moduleIconContainer,
                      { backgroundColor: module.iconBgColor },
                    ]}
                  >
                    <Icon color={module.iconColor} size={24} />
                  </View>

                  {/* Details */}
                  <View style={styles.moduleDetails}>
                    {/* Header */}
                    <View style={styles.moduleHeader}>
                      <Text style={styles.moduleTitle}>{module.title}</Text>
                      <View style={styles.moduleDurationBadge}>
                        <Clock color="#9CA3AF" size={12} />
                        <Text style={styles.moduleDurationText}>
                          {module.duration}
                        </Text>
                      </View>
                    </View>

                    {/* Subtitle */}
                    <Text style={styles.moduleSubtitle}>
                      {module.subtitle}
                    </Text>

                    {/* Description */}
                    <Text
                      style={styles.moduleDescription}
                      numberOfLines={2}
                      ellipsizeMode="tail"
                    >
                      {module.description}
                    </Text>

                    {/* Progress Section */}
                    <View style={styles.moduleProgressSection}>
                      <View style={styles.moduleProgressHeader}>
                        <Text style={styles.moduleFrequency}>
                          建議頻率：{module.frequency}
                        </Text>
                        <View style={styles.moduleProgressStats}>
                          <Text style={styles.moduleProgressCount}>
                            {module.progress}/{module.target}
                          </Text>
                          <Text style={styles.moduleProgressLabel}>本週</Text>
                        </View>
                      </View>

                      {/* Progress Bar */}
                      <View style={styles.moduleProgressBarBg}>
                        <LinearGradient
                          colors={module.gradientColors}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 0 }}
                          style={[
                            styles.moduleProgressBarFill,
                            { width: `${progressPercentage}%` },
                          ]}
                        />
                      </View>
                    </View>

                    {/* Action Button */}
                    <TouchableOpacity
                      onPress={() => handleStartPractice(module.id)}
                      style={styles.moduleButton}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.moduleButtonText}>開始練習</Text>
                      <ChevronRight color="#FFFFFF" size={16} />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            );
          })}
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </View>
  );
};

// ==========================================
// 樣式定義
// ==========================================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollView: {
    flex: 1,
  },

  // Header - 加高避免被狀態欄遮擋
  headerBlur: {
    paddingTop: Platform.OS === 'ios' ? 44 : StatusBar.currentHeight || 24,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
  },

  // Hero Section
  heroSection: {
    marginBottom: 24,
  },
  heroGradient: {
    paddingVertical: 40,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    overflow: 'hidden',
  },
  auroraContainer: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  auroraBlob: {
    position: 'absolute',
    borderRadius: 9999,
    opacity: 0.4, // 增加一點透明度讓模糊效果更明顯
  },
  auroraBlob1: {
    top: '-50%',
    left: '-20%',
    width: '80%',
    height: '80%',
    backgroundColor: '#A855F7',
  },
  auroraBlob2: {
    bottom: '-20%',
    right: '-10%',
    width: '60%',
    height: '80%',
    backgroundColor: '#3B82F6',
  },
  auroraBlob3: {
    top: '20%',
    right: '20%',
    width: '40%',
    height: '40%',
    backgroundColor: '#14B8A6',
  },
  heroContent: {
    alignItems: 'center',
    zIndex: 10,
  },
  badge: {
    borderRadius: 100,
    overflow: 'hidden',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  badgeContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#BFDBFE',
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  heroDescription: {
    fontSize: 14,
    color: '#BFDBFE',
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 280,
    opacity: 0.9,
  },
  progressRingContainer: {
    marginTop: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressSvg: {
    transform: [{ rotate: '0deg' }],
  },
  progressRingCenter: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressPercentage: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  progressLabel: {
    fontSize: 10,
    color: '#BFDBFE',
    letterSpacing: 1,
    marginTop: 2,
  },

  // Info Card
  infoCard: {
    marginHorizontal: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#DBEAFE',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
  },
  infoSection: {
    marginBottom: 16,
  },
  infoSectionTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 4,
  },
  infoSectionText: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },

  // Modules Section
  modulesSection: {
    paddingHorizontal: 20,
  },
  modulesSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modulesSectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  modulesCountBadge: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  modulesCountText: {
    fontSize: 12,
    color: '#6B7280',
  },

  // Module Card
  moduleCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#F3F4F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  moduleHighlight: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 6,
  },
  moduleContent: {
    flexDirection: 'row',
    padding: 20,
    gap: 16,
  },
  moduleIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  moduleDetails: {
    flex: 1,
  },
  moduleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  moduleTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  moduleDurationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  moduleDurationText: {
    fontSize: 10,
    fontWeight: '500',
    color: '#9CA3AF',
  },
  moduleSubtitle: {
    fontSize: 12,
    fontWeight: '500',
    color: '#3B82F6',
    marginBottom: 8,
  },
  moduleDescription: {
    fontSize: 12,
    color: '#6B7280',
    lineHeight: 18,
    marginBottom: 16,
  },
  moduleProgressSection: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    marginBottom: 16,
  },
  moduleProgressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  moduleFrequency: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6B7280',
  },
  moduleProgressStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  moduleProgressCount: {
    fontSize: 12,
    fontWeight: '500',
    color: '#374151',
  },
  moduleProgressLabel: {
    fontSize: 10,
    color: '#9CA3AF',
  },
  moduleProgressBarBg: {
    height: 6,
    backgroundColor: '#E5E7EB',
    borderRadius: 3,
    overflow: 'hidden',
  },
  moduleProgressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  moduleButton: {
    backgroundColor: '#111827',
    borderRadius: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  moduleButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
  },

  bottomPadding: {
    height: 40,
  },
});

export default EmotionalResiliencePlanScreen;