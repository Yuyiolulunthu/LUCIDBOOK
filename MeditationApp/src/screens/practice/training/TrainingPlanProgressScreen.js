// ==========================================
// 檔案名稱: TrainingPlanProgressScreen.js
// 訓練計畫進度頁 - 串接後端 API 版本
// ==========================================

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Wind, PenLine, CheckCircle2 } from 'lucide-react-native';
import ApiService from '../../../../api';

const TrainingPlanProgressScreen = ({ route, navigation }) => {
  const { plan } = route.params;
  const planId = 'stress-resistance'; // 訓練計劃 ID
  
  const [currentWeek, setCurrentWeek] = useState(1);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // ⭐ 訓練週次數據 - 初始結構
  const [weeks, setWeeks] = useState([
    {
      week: 1,
      title: '呼吸練習',
      subtitle: '建立身心連結的基礎',
      icon: Wind,
      gradient: ['#166CB5', '#31C6FE'],
      accentColor: '#166CB5',
      backgroundColor: '#EFF6FF',
      sessions: [
        {
          id: 1,
          title: '呼吸練習',
          duration: '5 分鐘',
          description: '學習基礎呼吸技巧，建立身心連結的第一步。透過專注呼吸,提升當下覺察力。',
          completedCount: 0,
          recommendedCount: 3,
          practiceType: '呼吸穩定力練習',
          lastCompletedAt: null,
        },
      ],
    },
    {
      week: 2,
      title: '好事書寫',
      subtitle: '培養正向心理資本',
      icon: PenLine,
      gradient: ['#FFBC42', '#FF8C42'],
      accentColor: '#FF8C42',
      backgroundColor: '#FFF7ED',
      sessions: [
        {
          id: 2,
          title: '好事書寫',
          duration: '10 分鐘',
          description: '記住做不好的事情是大腦的原廠設定，用好事書寫改變負向對話的神經迴路。',
          completedCount: 0,
          recommendedCount: 3,
          practiceType: '好事書寫',
          lastCompletedAt: null,
        },
      ],
    },
  ]);

  const currentWeekData = weeks[currentWeek - 1];
  const totalWeeks = weeks.length;

  // ⭐ 載入訓練進度
  const loadTrainingProgress = async () => {
    try {
      setLoading(true);
      console.log('🔄 開始載入訓練進度...');
      
      const response = await ApiService.getTrainingProgress(planId);
      
      if (response.success) {
        console.log('✅ 訓練進度載入成功:', response.progress);
        
        // 更新 weeks 中的 completedCount
        setWeeks(prevWeeks => {
          const newWeeks = prevWeeks.map(week => {
            const weekProgress = response.progress[week.week] || {};
            
            const updatedSessions = week.sessions.map(session => {
              const sessionProgress = weekProgress[session.id] || {};
              
              return {
                ...session,
                completedCount: sessionProgress.completed_count || 0,
                lastCompletedAt: sessionProgress.last_completed_at || null,
              };
            });
            
            return {
              ...week,
              sessions: updatedSessions,
            };
          });
          
          return newWeeks;
        });
      }
    } catch (error) {
      console.error('❌ 載入訓練進度失敗:', error);
      // 不顯示錯誤，使用預設值（0次）
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // ⭐ 首次載入
  useEffect(() => {
    loadTrainingProgress();
  }, []);

  // ⭐ 當頁面獲得焦點時重新載入（從練習頁返回時）
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      if (!loading) {
        loadTrainingProgress();
      }
    });
    return unsubscribe;
  }, [navigation, loading]);

  // ⭐ 手動刷新
  const handleRefresh = () => {
    setRefreshing(true);
    loadTrainingProgress();
  };

  const handlePreviousWeek = () => {
    if (currentWeek > 1) {
      setCurrentWeek(currentWeek - 1);
    }
  };

  const handleNextWeek = () => {
    if (currentWeek < totalWeeks) {
      setCurrentWeek(currentWeek + 1);
    }
  };

  const handleStartSession = async (session) => {
    navigation.navigate('PracticeNavigator', {
      practiceType: session.practiceType,
      onPracticeComplete: async () => {
        try {
          console.log('🔄 練習完成，更新進度...');
          
          // ⭐ 調用 API 更新進度
          const response = await ApiService.updateTrainingProgress(
            planId,
            currentWeek,
            session.id
          );
          
          if (response.success) {
            console.log('✅ 進度更新成功:', response.completed_count);
            
            // 立即更新本地狀態
            setWeeks(prevWeeks => {
              const newWeeks = [...prevWeeks];
              const weekIndex = newWeeks.findIndex(w => w.week === currentWeek);
              const sessionIndex = newWeeks[weekIndex].sessions.findIndex(
                s => s.id === session.id
              );
              
              newWeeks[weekIndex].sessions[sessionIndex] = {
                ...newWeeks[weekIndex].sessions[sessionIndex],
                completedCount: response.completed_count,
                lastCompletedAt: response.last_completed_at,
              };
              
              return newWeeks;
            });
          }
        } catch (error) {
          console.error('❌ 更新進度失敗:', error);
          Alert.alert('提示', '練習進度更新失敗，請稍後重試');
        }
        
        navigation.goBack();
      },
    });
  };

  const handleViewOverview = () => {
    navigation.goBack();
  };

  const handleFeedback = () => {
    Alert.alert(
      '問題回報',
      '要前往問題回報頁面嗎？',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '前往',
          onPress: () => navigation.navigate('Feedback'),
        },
      ]
    );
  };

  // ⭐ 計算總進度
  const getTotalProgress = () => {
    let totalCompleted = 0;
    let totalRecommended = 0;
    weeks.forEach(week => {
      week.sessions.forEach(session => {
        totalCompleted += session.completedCount;
        totalRecommended += session.recommendedCount;
      });
    });
    return { completed: totalCompleted, recommended: totalRecommended };
  };

  const totalProgress = getTotalProgress();
  const IconComponent = currentWeekData.icon;

  // ⭐ 載入中畫面
  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="chevron-back" size={24} color="#1F2937" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>情緒抗壓力計畫</Text>
          <View style={styles.iconButton} />
        </View>
        
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#166CB5" />
          <Text style={styles.loadingText}>載入訓練進度...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* 頂部導航 */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>情緒抗壓力計畫</Text>
        <TouchableOpacity style={styles.iconButton} onPress={handleFeedback}>
          <Ionicons name="help-circle-outline" size={24} color="#6B7280" />
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#166CB5"
            colors={['#166CB5']}
          />
        }
      >
        {/* 總進度卡片 */}
        <View style={styles.progressCard}>
          <LinearGradient
            colors={['#166CB5', '#31C6FE']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.progressGradient}
          >
            <Text style={styles.progressLabel}>總訓練進度</Text>
            <View style={styles.progressNumbers}>
              <Text style={styles.progressNumberLarge}>{totalProgress.completed}</Text>
              <Text style={styles.progressNumberDivider}>/</Text>
              <Text style={styles.progressNumberSmall}>{totalProgress.recommended}</Text>
            </View>
            <Text style={styles.progressSubtext}>已完成 / 建議完成次數</Text>
            
            {/* 進度條 */}
            <View style={styles.progressBarContainer}>
              <View style={styles.progressBarBg}>
                <View
                  style={[
                    styles.progressBarFill,
                    { width: `${Math.min((totalProgress.completed / totalProgress.recommended) * 100, 100)}%` },
                  ]}
                />
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* 查看計畫概覽按鈕 */}
        <TouchableOpacity
          style={styles.overviewButton}
          onPress={handleViewOverview}
        >
          <Ionicons name="document-text-outline" size={20} color="#166CB5" />
          <Text style={styles.overviewText}>查看計畫概覽</Text>
          <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
        </TouchableOpacity>

        {/* 週次導航 */}
        <View style={styles.weekNavigationCard}>
          <View style={styles.weekNavigation}>
            <TouchableOpacity
              style={[
                styles.weekNavButton,
                currentWeek === 1 && styles.weekNavButtonDisabled,
              ]}
              onPress={handlePreviousWeek}
              disabled={currentWeek === 1}
            >
              <Ionicons
                name="chevron-back"
                size={24}
                color={currentWeek === 1 ? '#D1D5DB' : '#166CB5'}
              />
            </TouchableOpacity>
            
            <View style={styles.weekInfo}>
              <Text style={styles.weekNumber}>Week {currentWeek}</Text>
              <Text style={styles.weekTitle}>{currentWeekData.title}</Text>
              <Text style={styles.weekSubtitle}>{currentWeekData.subtitle}</Text>
            </View>
            
            <TouchableOpacity
              style={[
                styles.weekNavButton,
                currentWeek === totalWeeks && styles.weekNavButtonDisabled,
              ]}
              onPress={handleNextWeek}
              disabled={currentWeek === totalWeeks}
            >
              <Ionicons
                name="chevron-forward"
                size={24}
                color={currentWeek === totalWeeks ? '#D1D5DB' : '#166CB5'}
              />
            </TouchableOpacity>
          </View>

          {/* 進度指示器 */}
          <View style={styles.progressDots}>
            {weeks.map((week, index) => (
              <View
                key={index}
                style={[
                  styles.progressDot,
                  index + 1 === currentWeek && styles.progressDotActive,
                  index + 1 < currentWeek && styles.progressDotCompleted,
                ]}
              />
            ))}
          </View>
        </View>

        {/* 訓練單元列表 */}
        <View style={styles.sessionsContainer}>
          {currentWeekData.sessions.map((session) => {
            const isCompleted = session.completedCount >= session.recommendedCount;
            const progressPercentage = Math.min((session.completedCount / session.recommendedCount) * 100, 100);
            
            return (
              <View key={session.id} style={styles.sessionCard}>
                {/* 頭部 */}
                <View style={styles.sessionHeader}>
                  <View style={[styles.sessionIconCircle, { backgroundColor: currentWeekData.backgroundColor }]}>
                    <IconComponent size={28} color={currentWeekData.accentColor} strokeWidth={2} />
                  </View>
                  <View style={styles.sessionInfo}>
                    <Text style={styles.sessionTitle}>{session.title}</Text>
                    <View style={styles.sessionMeta}>
                      <Ionicons name="time-outline" size={14} color="#6B7280" />
                      <Text style={styles.sessionDuration}>{session.duration}</Text>
                    </View>
                  </View>
                  {isCompleted && (
                    <View style={styles.completionBadge}>
                      <CheckCircle2 size={20} color="#10B981" strokeWidth={2.5} />
                    </View>
                  )}
                </View>

                {/* 描述 */}
                <Text style={styles.sessionDescription}>
                  {session.description}
                </Text>

                {/* ⭐ 完成次數進度 */}
                <View style={styles.completionProgress}>
                  <View style={styles.completionHeader}>
                    <Text style={styles.completionLabel}>完成進度</Text>
                    <Text style={[
                      styles.completionCount,
                      isCompleted && styles.completionCountCompleted
                    ]}>
                      {session.completedCount} / {session.recommendedCount} 次
                    </Text>
                  </View>
                  <View style={styles.completionBarBg}>
                    <LinearGradient
                      colors={currentWeekData.gradient}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={[
                        styles.completionBarFill,
                        { width: `${progressPercentage}%` }
                      ]}
                    />
                  </View>
                  
                  {/* ⭐ 顯示最後完成時間 */}
                  {session.lastCompletedAt && (
                    <Text style={styles.lastCompletedText}>
                      最後練習：{new Date(session.lastCompletedAt).toLocaleString('zh-TW', {
                        month: 'numeric',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </Text>
                  )}
                </View>

                {/* 開始按鈕 */}
                <TouchableOpacity
                  style={styles.startButtonContainer}
                  onPress={() => handleStartSession(session)}
                  activeOpacity={0.9}
                >
                  <LinearGradient
                    colors={currentWeekData.gradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.startButton}
                  >
                    <Text style={styles.startButtonText}>
                      {isCompleted ? '繼續練習' : '開始練習'}
                    </Text>
                    <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            );
          })}
        </View>

        {/* 提示卡片 */}
        <View style={styles.tipCard}>
          <View style={styles.tipIconCircle}>
            <Ionicons name="bulb-outline" size={20} color="#FF8C42" />
          </View>
          <Text style={styles.tipText}>
            每個練習建議完成 3 次，以建立穩定的心理習慣。下拉可以刷新進度。
          </Text>
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6B7280',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 15,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    textAlign: 'center',
  },
  iconButton: {
    padding: 8,
  },
  content: {
    flex: 1,
  },

  // 總進度卡片
  progressCard: {
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#166CB5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  progressGradient: {
    padding: 24,
    alignItems: 'center',
  },
  progressLabel: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '600',
    marginBottom: 12,
  },
  progressNumbers: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 8,
  },
  progressNumberLarge: {
    fontSize: 48,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  progressNumberDivider: {
    fontSize: 32,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.7)',
    marginHorizontal: 8,
  },
  progressNumberSmall: {
    fontSize: 32,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.9)',
  },
  progressSubtext: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 16,
  },
  progressBarContainer: {
    width: '100%',
  },
  progressBarBg: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 4,
  },

  // 查看概覽按鈕
  overviewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginTop: 16,
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  overviewText: {
    flex: 1,
    fontSize: 14,
    color: '#166CB5',
    fontWeight: '600',
    marginLeft: 12,
  },

  // 週次導航卡片
  weekNavigationCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  weekNavigation: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  weekNavButton: {
    padding: 8,
  },
  weekNavButtonDisabled: {
    opacity: 0.3,
  },
  weekInfo: {
    flex: 1,
    alignItems: 'center',
  },
  weekNumber: {
    fontSize: 16,
    fontWeight: '700',
    color: '#166CB5',
    marginBottom: 4,
  },
  weekTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 2,
  },
  weekSubtitle: {
    fontSize: 12,
    color: '#6B7280',
  },
  progressDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginTop: 16,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E5E7EB',
  },
  progressDotActive: {
    width: 24,
    backgroundColor: '#166CB5',
  },
  progressDotCompleted: {
    backgroundColor: '#10B981',
  },

  // 訓練單元列表
  sessionsContainer: {
    padding: 20,
  },
  sessionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  sessionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sessionIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sessionInfo: {
    flex: 1,
    marginLeft: 12,
  },
  sessionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  sessionMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  sessionDuration: {
    fontSize: 12,
    color: '#6B7280',
  },
  completionBadge: {
    marginLeft: 8,
  },
  sessionDescription: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 16,
  },

  // ⭐ 完成次數進度
  completionProgress: {
    marginBottom: 16,
  },
  completionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  completionLabel: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '600',
  },
  completionCount: {
    fontSize: 14,
    color: '#166CB5',
    fontWeight: '700',
  },
  completionCountCompleted: {
    color: '#10B981',
  },
  completionBarBg: {
    height: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 4,
    overflow: 'hidden',
  },
  completionBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  lastCompletedText: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 6,
  },

  // 開始按鈕
  startButtonContainer: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 8,
  },
  startButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },

  // 提示卡片
  tipCard: {
    flexDirection: 'row',
    backgroundColor: '#FFF7ED',
    marginHorizontal: 20,
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FFEDD5',
  },
  tipIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  tipText: {
    flex: 1,
    fontSize: 13,
    color: '#78350F',
    lineHeight: 20,
    fontWeight: '500',
  },

  bottomSpacing: {
    height: 80,
  },
});

export default TrainingPlanProgressScreen;