// ==========================================
// 檔案名稱: PracticeStatsScreen.js
// 版本: V3.0 - 設計完整修正版
// 
// ✅ Header 標題不與返回按鈕平行（垂直排列）
// ✅ 總覽 4 卡片：白色底 + 彩色淺色圖標背景
// ✅ 總覽圖標：靶心、時鐘（加粗）、火焰、獎牌
// ✅ 詳細數據：線條感圖標（風、眼睛、心、冥想）
// ✅ 黃色提示卡：純色無漸層
// ✅ 月度進展：實際資料庫數據
// ==========================================

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  StatusBar,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { LinearGradient } from 'expo-linear-gradient';
import ApiService from '../../../../api';

const { width } = Dimensions.get('window');

const PracticeStatsScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [categoryStats, setCategoryStats] = useState([]);
  const [weeklyData, setWeeklyData] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const response = await ApiService.getPracticeStats();
      
      if (response.success) {
        setStats(response.stats);
        generateCategoryStats(response.stats);
        generateWeeklyData(response.stats.weeklyPractices || []);
        generateMonthlyData(response.stats.monthlyPractices || []);
      }
    } catch (error) {
      console.error('載入統計失敗:', error);
      
      // 模擬數據
      const mockStats = {
        totalPractices: 24,
        totalMinutes: 156,
        currentStreak: 5,
        longestStreak: 8,
        totalDays: 18,
        averageSatisfaction: 87,
        weeklyPractices: [],
        monthlyPractices: [],
      };
      setStats(mockStats);
      generateCategoryStats(mockStats);
      generateWeeklyData([]);
      generateMonthlyData([]);
    } finally {
      setLoading(false);
    }
  };

  const generateCategoryStats = (statsData) => {
    const categories = [
      {
        id: 'breathing',
        name: '呼吸穩定力',
        icon: 'leaf-outline',
        iconType: 'ionicons',
        gradient: ['#166CB5', '#31C6FE'],
        sessions: Math.floor(statsData.totalPractices * 0.4) || 10,
        minutes: Math.floor(statsData.totalMinutes * 0.4) || 50,
        satisfaction: 88,
        lastPracticed: statsData.lastPracticeDate || '2025-11-06',
      },
      {
        id: 'self-awareness',
        name: '自我覺察力',
        icon: 'eye-outline',
        iconType: 'ionicons',
        gradient: ['#10B981', '#34D399'],
        sessions: Math.floor(statsData.totalPractices * 0.25) || 6,
        minutes: Math.floor(statsData.totalMinutes * 0.25) || 42,
        satisfaction: 85,
        lastPracticed: statsData.lastPracticeDate || '2025-11-05',
      },
      {
        id: 'emotion',
        name: '情緒理解力',
        icon: 'heart-outline',
        iconType: 'ionicons',
        gradient: ['#F59E0B', '#FBBF24'],
        sessions: Math.floor(statsData.totalPractices * 0.2) || 5,
        minutes: Math.floor(statsData.totalMinutes * 0.2) || 35,
        satisfaction: 90,
        lastPracticed: statsData.lastPracticeDate || '2025-11-04',
      },
      {
        id: 'mindfulness',
        name: '正念安定力',
        icon: 'body-outline',
        iconType: 'ionicons',
        gradient: ['#8B5CF6', '#A78BFA'],
        sessions: Math.floor(statsData.totalPractices * 0.15) || 3,
        minutes: Math.floor(statsData.totalMinutes * 0.15) || 29,
        satisfaction: 86,
        lastPracticed: statsData.lastPracticeDate || '2025-11-03',
      },
    ];
    setCategoryStats(categories);
  };

  const generateWeeklyData = (practices) => {
    const weekDays = ['日', '一', '二', '三', '四', '五', '六'];
    const today = new Date();
    const currentDay = today.getDay();
    
    const weeklyActivity = weekDays.map((day, index) => {
      const sessionsCount = practices.filter(p => {
        const practiceDate = new Date(p.created_at);
        return practiceDate.getDay() === index;
      }).length;
      
      return {
        day,
        sessions: sessionsCount,
        active: sessionsCount > 0,
        isToday: index === currentDay,
      };
    });
    
    setWeeklyData(weeklyActivity);
  };

  const generateMonthlyData = (practices) => {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();
    
    // 生成最近 4 個月的數據
    const months = [];
    for (let i = 3; i >= 0; i--) {
      const targetMonth = currentMonth - i;
      const monthDate = new Date(currentYear, targetMonth, 1);
      months.push({
        month: `${monthDate.getMonth() + 1}月`,
        monthIndex: monthDate.getMonth(),
        year: monthDate.getFullYear(),
      });
    }
    
    const monthlyProgress = months.map(({ month, monthIndex, year }) => {
      // 計算該月的練習次數
      const sessionsCount = practices.filter(p => {
        const practiceDate = new Date(p.created_at);
        return practiceDate.getMonth() === monthIndex && 
               practiceDate.getFullYear() === year;
      }).length;
      
      // 計算該月的總分鐘數
      const totalMinutes = practices
        .filter(p => {
          const practiceDate = new Date(p.created_at);
          return practiceDate.getMonth() === monthIndex && 
                 practiceDate.getFullYear() === year;
        })
        .reduce((sum, p) => sum + (parseInt(p.duration) || 0), 0);
      
      return {
        month,
        sessions: sessionsCount,
        minutes: totalMinutes,
      };
    });
    
    setMonthlyData(monthlyProgress);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '--';
    const date = new Date(dateStr);
    return `${date.getMonth() + 1}月${date.getDate()}日`;
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#166CB5" />
        <LinearGradient
          colors={['#166CB5', '#31C6FE']}
          style={styles.loadingGradient}
        >
          <ActivityIndicator size="large" color="#FFF" />
          <Text style={styles.loadingText}>載入統計中...</Text>
        </LinearGradient>
      </View>
    );
  }

  const maxMonthSessions = Math.max(...monthlyData.map(m => m.sessions), 1);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#166CB5" />
      
      {/* Header with Gradient - 修改為垂直排列 */}
      <LinearGradient
        colors={['#166CB5', '#31C6FE']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.header}
      >
        {/* 返回按鈕獨立一行 */}
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>

        {/* 標題容器 */}
        <View style={styles.headerTitleContainer}>
          <View style={styles.headerIcon}>
            <MaterialCommunityIcons name="chart-line" size={24} color="#166CB5" />
          </View>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>練習統計</Text>
            <Text style={styles.headerSubtitle}>追蹤你的成長軌跡</Text>
          </View>
        </View>
      </LinearGradient>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <View style={styles.tabBackground}>
          <TouchableOpacity
            style={[styles.tab, selectedTab === 'overview' && styles.tabActive]}
            onPress={() => setSelectedTab('overview')}
            activeOpacity={0.8}
          >
            {selectedTab === 'overview' && (
              <LinearGradient
                colors={['#166CB5', '#31C6FE']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.tabGradient}
              >
                <MaterialCommunityIcons name="view-dashboard" size={16} color="#FFF" />
                <Text style={styles.tabTextActive}>總覽</Text>
              </LinearGradient>
            )}
            {selectedTab !== 'overview' && (
              <View style={{ 
                    flexDirection: 'row', 
                    alignItems: 'center', 
                    justifyContent: 'center',  // ← 添加這行
                    gap: 6,
                    paddingVertical: 10,        // ← 添加這行
                    paddingHorizontal: 12,      // ← 添加這行
                }}>
                <MaterialCommunityIcons name="view-dashboard" size={16} color="#6B7280" />
                <Text style={styles.tabText}>總覽</Text>
              </View>
            )}
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.tab, selectedTab === 'details' && styles.tabActive]}
            onPress={() => setSelectedTab('details')}
            activeOpacity={0.8}
          >
            {selectedTab === 'details' && (
              <LinearGradient
                colors={['#166CB5', '#31C6FE']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.tabGradient}
              >
                <MaterialCommunityIcons name="chart-bar" size={16} color="#FFF" />
                <Text style={styles.tabTextActive}>詳細數據</Text>
              </LinearGradient>
            )}
            {selectedTab !== 'details' && (
              <View style={{ 
                    flexDirection: 'row', 
                    alignItems: 'center', 
                    justifyContent: 'center',  // ← 添加這行
                    gap: 6,
                    paddingVertical: 10,        // ← 添加這行
                    paddingHorizontal: 12,      // ← 添加這行
                }}>
                <MaterialCommunityIcons name="chart-bar" size={16} color="#6B7280" />
                <Text style={styles.tabText}>詳細數據</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {selectedTab === 'overview' ? (
          <>
            {/* Key Stats Grid - 白色底 + 彩色圖標背景 */}
            <View style={styles.statsGrid}>
              {/* 總練習次數 - 藍色 */}
              <View style={styles.statCard}>
                <View style={[styles.statIconBg, { backgroundColor: '#DBEAFE' }]}>
                  <Ionicons name="checkmark-done-outline" size={28} color="#166CB5" />
                </View>
                <Text style={[styles.statValue, { color: '#166CB5' }]}>
                  {stats?.totalPractices || 0}
                </Text>
                <Text style={styles.statLabel}>總練習次數</Text>
              </View>

              {/* 總練習分鐘 - 紫色 */}
              <View style={styles.statCard}>
                <View style={[styles.statIconBg, { backgroundColor: '#F3E8FF' }]}>
                  <Ionicons name="time-outline" size={28} color="#A855F7" strokeWidth={3} />
                </View>
                <Text style={[styles.statValue, { color: '#A855F7' }]}>
                  {stats?.totalMinutes || 0}
                </Text>
                <Text style={styles.statLabel}>總練習分鐘</Text>
              </View>

              {/* 當前連續天 - 橙色 */}
              <View style={styles.statCard}>
                <View style={[styles.statIconBg, { backgroundColor: '#FEF3C7' }]}>
                  <Ionicons name="flame-outline" size={28} color="#F59E0B" />
                </View>
                <Text style={[styles.statValue, { color: '#F59E0B' }]}>
                  {stats?.currentStreak || 0}
                </Text>
                <Text style={styles.statLabel}>當前連續天</Text>
              </View>

              {/* 平均滿意度 - 綠色 */}
              <View style={styles.statCard}>
                <View style={[styles.statIconBg, { backgroundColor: '#D1FAE5' }]}>
                  <Ionicons name="ribbon-outline" size={28} color="#10B981" />
                </View>
                <Text style={[styles.statValue, { color: '#10B981' }]}>
                  {stats?.averageSatisfaction || 0}%
                </Text>
                <Text style={styles.statLabel}>平均滿意度</Text>
              </View>
            </View>

            {/* Weekly Activity */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="calendar-outline" size={20} color="#166CB5" />
                <Text style={styles.sectionTitle}>本週活動</Text>
              </View>

              <View style={styles.weeklyChart}>
                {weeklyData.map((day, index) => (
                  <View key={index} style={styles.weeklyBarContainer}>
                    <View style={styles.weeklyBar}>
                      <LinearGradient
                        colors={day.active ? ['#166CB5', '#31C6FE'] : ['#E5E7EB', '#E5E7EB']}
                        start={{ x: 0, y: 1 }}
                        end={{ x: 0, y: 0 }}
                        style={[
                          styles.weeklyBarFill,
                          { 
                            height: day.sessions > 0 ? `${Math.min((day.sessions / 3) * 100, 100)}%` : '8%',
                          }
                        ]}
                      />
                    </View>
                    <Text style={[
                      styles.weeklyDay,
                      day.active && styles.weeklyDayActive,
                      day.isToday && styles.weeklyDayToday
                    ]}>
                      {day.day}
                    </Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Monthly Progress - 實際資料庫數據 */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <MaterialCommunityIcons name="chart-line" size={20} color="#166CB5" />
                <Text style={styles.sectionTitle}>月度進展</Text>
                <Text style={styles.sectionSubtitle}>練習次數</Text>
              </View>

              <View style={styles.monthlyChart}>
                {monthlyData.map((month, index) => (
                  <View key={index} style={styles.monthlyItem}>
                    <View style={styles.monthlyRow}>
                      <Text style={styles.monthLabel}>{month.month}</Text>
                      <View style={styles.monthlyBarTrack}>
                        <LinearGradient
                          colors={['#166CB5', '#31C6FE']}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 0 }}
                          style={[
                            styles.monthlyBarFill,
                            { 
                              width: month.sessions > 0 
                                ? `${Math.max((month.sessions / maxMonthSessions) * 100, 15)}%` 
                                : '15%'
                            }
                          ]}
                        >
                          <Text style={styles.monthlyBarText}>{month.sessions}</Text>
                        </LinearGradient>
                      </View>
                    </View>
                    <Text style={styles.monthlyMinutes}>{month.minutes} 分鐘</Text>
                  </View>
                ))}
              </View>
            </View>
          </>
        ) : (
          <>
            {/* Category Breakdown - 線條感圖標 */}
            <View style={styles.categoryContainer}>
              {categoryStats.map((category, index) => (
                <View key={category.id} style={styles.categoryCard}>
                  {/* Header with Gradient */}
                  <LinearGradient
                    colors={category.gradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.categoryHeader}
                  >
                    <View style={styles.categoryHeaderContent}>
                      <View style={styles.categoryIconContainer}>
                        <Ionicons 
                          name={category.icon} 
                          size={28} 
                          color={category.gradient[0]} 
                        />
                      </View>
                      <Text style={styles.categoryName}>{category.name}</Text>
                    </View>
                  </LinearGradient>

                  {/* Body */}
                  <View style={styles.categoryBody}>
                    <View style={styles.categoryStatsGrid}>
                      <View style={styles.categoryStatItem}>
                        <Text style={[styles.categoryStatValue, { color: category.gradient[0] }]}>
                          {category.sessions}
                        </Text>
                        <Text style={styles.categoryStatLabel}>次數</Text>
                      </View>
                      <View style={styles.categoryStatItem}>
                        <Text style={[styles.categoryStatValue, { color: '#A855F7' }]}>
                          {category.minutes}
                        </Text>
                        <Text style={styles.categoryStatLabel}>分鐘</Text>
                      </View>
                      <View style={styles.categoryStatItem}>
                        <Text style={[styles.categoryStatValue, { color: '#10B981' }]}>
                          {category.satisfaction}%
                        </Text>
                        <Text style={styles.categoryStatLabel}>滿意度</Text>
                      </View>
                    </View>

                    <View style={styles.categoryFooter}>
                      <Text style={styles.categoryFooterLabel}>最後練習</Text>
                      <Text style={styles.categoryFooterValue}>
                        {formatDate(category.lastPracticed)}
                      </Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>

            {/* Summary Card */}
            <View style={styles.summaryCard}>
              <Text style={styles.summaryTitle}>練習分布</Text>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>本週練習</Text>
                <Text style={[styles.summaryValue, { color: '#166CB5' }]}>
                  {weeklyData.filter(d => d.active).length} 次
                </Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>本月練習</Text>
                <Text style={[styles.summaryValue, { color: '#166CB5' }]}>
                  {stats?.totalPractices || 0} 次
                </Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>最長連續</Text>
                <Text style={[styles.summaryValue, { color: '#F59E0B' }]}>
                  {stats?.longestStreak || 0} 天
                </Text>
              </View>
            </View>
          </>
        )}

        {/* Bottom Tip - 純色無漸層 */}
        <View style={styles.tipCard}>
          <Text style={styles.tipText}>
            🎯 持續練習是成長的關鍵,保持每日打卡習慣
          </Text>
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  
  // === Loading ===
  loadingGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#FFF',
  },
  
  // === Header - 修改為垂直排列 ===
  header: {
    paddingTop: 50,
    paddingBottom: 24,
    paddingHorizontal: 20,
  },
  backButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,  // 與標題容器的間距
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 2,
  },
  
  // === Tab Navigation ===
  tabContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  tabBackground: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  tab: {
    flex: 1,
    borderRadius: 8,
    overflow: 'hidden',
  },
  tabActive: {
    shadowColor: '#166CB5',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  tabGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    gap: 6,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  tabTextActive: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFF',
  },
  
  // === ScrollView ===
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  
  // === Stats Grid - 白色底 + 彩色圖標背景 ===
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    gap: 12,
  },
  statCard: {
    width: (width - 52) / 2,
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statIconBg: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  
  // === Section ===
  section: {
    marginTop: 8,
    marginHorizontal: 20,
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginLeft: 8,
    flex: 1,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: '#6B7280',
  },
  
  // === Weekly Chart ===
  weeklyChart: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    height: 120,
    gap: 8,
  },
  weeklyBarContainer: {
    flex: 1,
    alignItems: 'center',
    gap: 8,
  },
  weeklyBar: {
    flex: 1,
    width: '100%',
    justifyContent: 'flex-end',
    borderRadius: 8,
    overflow: 'hidden',
  },
  weeklyBarFill: {
    width: '100%',
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  weeklyDay: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  weeklyDayActive: {
    color: '#166CB5',
    fontWeight: '600',
  },
  weeklyDayToday: {
    color: '#F59E0B',
    fontWeight: 'bold',
  },
  
  // === Monthly Chart ===
  monthlyChart: {
    gap: 12,
  },
  monthlyItem: {
    gap: 6,
  },
  monthlyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  monthLabel: {
    fontSize: 14,
    color: '#6B7280',
    width: 40,
  },
  monthlyBarTrack: {
    flex: 1,
    height: 32,
    backgroundColor: '#F3F4F6',
    borderRadius: 16,
    overflow: 'hidden',
  },
  monthlyBarFill: {
    height: '100%',
    borderRadius: 16,
    justifyContent: 'center',
    paddingRight: 12,
    alignItems: 'flex-end',
  },
  monthlyBarText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFF',
  },
  monthlyMinutes: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 52,
  },
  
  // === Category Cards ===
  categoryContainer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    gap: 20,
  },
  categoryCard: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  categoryHeader: {
    height: 80,
    padding: 20,
    justifyContent: 'center',
  },
  categoryHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  categoryName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFF',
  },
  categoryBody: {
    padding: 20,
  },
  categoryStatsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  categoryStatItem: {
    alignItems: 'center',
  },
  categoryStatValue: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  categoryStatLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  categoryFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  categoryFooterLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  categoryFooterValue: {
    fontSize: 12,
    color: '#111827',
    fontWeight: '500',
  },
  
  // === Summary Card - 白色背景 ===
  summaryCard: {
    marginTop: 12,
    marginHorizontal: 20,
    backgroundColor: '#EFF6FF',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  summaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  
  // === Tip Card - 純色無漸層 ===
  tipCard: {
    marginTop: 12,
    marginHorizontal: 20,
    backgroundColor: '#FEF3C7',
    borderRadius: 16,
    padding: 16,
  },
  tipText: {
    fontSize: 14,
    color: '#78350F',
    textAlign: 'center',
    lineHeight: 20,
  },
  
  bottomPadding: {
    height: 20,
  },
});

export default PracticeStatsScreen;