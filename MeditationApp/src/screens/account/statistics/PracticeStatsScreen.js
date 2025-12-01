import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { CheckCircle, Clock, Flame, Award, TrendingUp, Calendar } from 'lucide-react-native';
import ApiService from '../../../../api';

const { width } = Dimensions.get('window');

const PracticeStatsScreen = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
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
      console.log('📊 開始載入練習統計...');
      
      const response = await ApiService.getPracticeStats();
      console.log('✅ API 響應:', response);
      
      if (response.success) {
        setStats(response.stats);
        
        // ⭐ API 已經返回 categoryStats，直接使用
        if (response.stats.categoryStats) {
          console.log('📋 分類統計:', response.stats.categoryStats);
          setCategoryStats(response.stats.categoryStats);
        }
        
        // 處理週數據
        if (response.stats.weeklyPractices) {
          console.log('📅 週數據:', response.stats.weeklyPractices.length, '筆');
          generateWeeklyData(response.stats.weeklyPractices);
        }
        
        // 處理月數據
        if (response.stats.monthlyPractices) {
          console.log('📈 月數據:', response.stats.monthlyPractices.length, '筆');
          generateMonthlyData(response.stats.monthlyPractices);
        }
        
        console.log('✅ 統計數據載入完成');
      } else {
        console.warn('⚠️ API 返回失敗:', response.error);
      }
    } catch (error) {
      console.error('❌ 載入統計失敗:', error);
    } finally {
      setLoading(false);
    }
  };

  // 生成週數據（過去 7 天）
  const generateWeeklyData = (practices) => {
    const days = ['週一', '週二', '週三', '週四', '週五', '週六', '週日'];
    const today = new Date();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay() + 1); // 本週一

    const weekData = days.map((day, index) => {
      const date = new Date(weekStart);
      date.setDate(weekStart.getDate() + index);
      const dateStr = date.toISOString().split('T')[0];

      // 計算當天的練習次數
      const dayPractices = practices.filter(p => {
        const practiceDate = new Date(p.created_at).toISOString().split('T')[0];
        return practiceDate === dateStr;
      });

      return {
        day,
        count: dayPractices.length,
        minutes: dayPractices.reduce((sum, p) => sum + (p.duration || 0), 0),
      };
    });

    setWeeklyData(weekData);
  };

  // 生成月數據（過去 4 個月）
  const generateMonthlyData = (practices) => {
    const months = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];
    const currentMonth = new Date().getMonth();
    
    const last4Months = [];
    for (let i = 3; i >= 0; i--) {
      const monthIndex = (currentMonth - i + 12) % 12;
      last4Months.push(months[monthIndex]);
    }

    const monthData = last4Months.map((month, index) => {
      const targetMonth = (currentMonth - (3 - index) + 12) % 12 + 1;
      
      const monthPractices = practices.filter(p => {
        const practiceMonth = new Date(p.created_at).getMonth() + 1;
        return practiceMonth === targetMonth;
      });

      return {
        month,
        count: monthPractices.length,
        minutes: monthPractices.reduce((sum, p) => sum + (p.duration || 0), 0),
      };
    });

    setMonthlyData(monthData);
  };

  // 統計卡片
  const StatCard = ({ icon: Icon, label, value, color }) => (
    <View style={styles.statCard}>
      <View style={[styles.statIconContainer, { backgroundColor: color + '20' }]}>
        <Icon size={24} color={color} />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );

  // 週活動柱狀圖
  const WeeklyChart = () => {
    const maxCount = Math.max(...weeklyData.map(d => d.count), 1);

    return (
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>本週活動</Text>
        <View style={styles.barChartContainer}>
          {weeklyData.map((data, index) => (
            <View key={index} style={styles.barWrapper}>
              <View style={styles.barContainer}>
                <View
                  style={[
                    styles.bar,
                    {
                      height: `${(data.count / maxCount) * 100}%`,
                      backgroundColor: data.count > 0 ? '#31C6FE' : '#E0E0E0',
                    },
                  ]}
                />
              </View>
              <Text style={styles.barLabel}>{data.day}</Text>
            </View>
          ))}
        </View>
      </View>
    );
  };

  // 月度進展趨勢圖
  const MonthlyChart = () => {
    const maxMinutes = Math.max(...monthlyData.map(d => d.minutes), 1);

    return (
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>月度進展</Text>
        <View style={styles.lineChartContainer}>
          {monthlyData.map((data, index) => (
            <View key={index} style={styles.linePointWrapper}>
              <View style={styles.linePointContainer}>
                <View
                  style={[
                    styles.linePoint,
                    {
                      bottom: `${(data.minutes / maxMinutes) * 80}%`,
                      backgroundColor: '#31C6FE',
                    },
                  ]}
                />
              </View>
              <Text style={styles.lineLabel}>{data.month}</Text>
              <Text style={styles.lineValue}>{data.minutes}分</Text>
            </View>
          ))}
        </View>
      </View>
    );
  };

  // 分類詳細統計
  const CategoryDetail = ({ category }) => {
    // 練習類型圖標映射
    const typeIcons = {
      breathing: '🫁',
      'good-things': '✍️',
      'emotion-understanding': '🧠',
      meditation: '🧘',
      default: '⭐',
    };

    const icon = typeIcons[category.type] || typeIcons.default;

    return (
      <View style={styles.categoryCard}>
        <View style={styles.categoryHeader}>
          <Text style={styles.categoryIcon}>{icon}</Text>
          <View style={styles.categoryInfo}>
            <Text style={styles.categoryName}>{category.name}</Text>
            <Text style={styles.categoryLastPracticed}>
              最近練習：{category.lastPracticed ? new Date(category.lastPracticed).toLocaleDateString('zh-TW') : '尚未練習'}
            </Text>
          </View>
        </View>
        <View style={styles.categoryStats}>
          <View style={styles.categoryStatItem}>
            <Text style={styles.categoryStatValue}>{category.sessions}</Text>
            <Text style={styles.categoryStatLabel}>次數</Text>
          </View>
          <View style={styles.categoryStatItem}>
            <Text style={styles.categoryStatValue}>{category.minutes}</Text>
            <Text style={styles.categoryStatLabel}>分鐘</Text>
          </View>
          <View style={styles.categoryStatItem}>
            <Text style={styles.categoryStatValue}>{category.satisfaction || 0}</Text>
            <Text style={styles.categoryStatLabel}>心理肌力</Text>
          </View>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#31C6FE" />
        <Text style={styles.loadingText}>載入統計數據中...</Text>
      </View>
    );
  }

  if (!stats) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>暫無統計數據</Text>
        <Text style={styles.emptySubText}>完成練習後即可查看統計</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#166CB5', '#31C6FE']} style={styles.header}>
        <Text style={styles.headerTitle}>練習統計</Text>
        <Text style={styles.headerSubtitle}>追蹤你的成長軌跡</Text>
      </LinearGradient>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'overview' && styles.activeTab]}
          onPress={() => setActiveTab('overview')}
        >
          <Text style={[styles.tabText, activeTab === 'overview' && styles.activeTabText]}>
            總覽
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'details' && styles.activeTab]}
          onPress={() => setActiveTab('details')}
        >
          <Text style={[styles.tabText, activeTab === 'details' && styles.activeTabText]}>
            詳細數據
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {activeTab === 'overview' ? (
          <>
            {/* 統計卡片 */}
            <View style={styles.statsGrid}>
              <StatCard
                icon={CheckCircle}
                label="總練習次數"
                value={stats.totalPractices || 0}
                color="#4CAF50"
              />
              <StatCard
                icon={Clock}
                label="總練習分鐘"
                value={stats.totalMinutes || 0}
                color="#2196F3"
              />
              <StatCard
                icon={Flame}
                label="當前連續天"
                value={stats.currentStreak || 0}
                color="#FF9800"
              />
              <StatCard
                icon={Award}
                label="心理肌力分數"
                value={stats.averageSatisfaction || 0}
                color="#9C27B0"
              />
            </View>

            {/* 週活動圖表 */}
            {weeklyData.length > 0 && <WeeklyChart />}

            {/* 月度進展圖表 */}
            {monthlyData.length > 0 && <MonthlyChart />}

            {/* 額外統計信息 */}
            <View style={styles.additionalStats}>
              <View style={styles.additionalStatRow}>
                <Text style={styles.additionalStatLabel}>總練習天數</Text>
                <Text style={styles.additionalStatValue}>{stats.totalDays || 0} 天</Text>
              </View>
              <View style={styles.additionalStatRow}>
                <Text style={styles.additionalStatLabel}>最長連續天</Text>
                <Text style={styles.additionalStatValue}>{stats.longestStreak || 0} 天</Text>
              </View>
              <View style={styles.additionalStatRow}>
                <Text style={styles.additionalStatLabel}>最愛練習</Text>
                <Text style={styles.additionalStatValue}>{stats.favoriteExercise || '尚未開始'}</Text>
              </View>
              <View style={styles.additionalStatRow}>
                <Text style={styles.additionalStatLabel}>最後練習</Text>
                <Text style={styles.additionalStatValue}>
                  {stats.lastPracticeDate ? new Date(stats.lastPracticeDate).toLocaleDateString('zh-TW') : '尚未練習'}
                </Text>
              </View>
            </View>
          </>
        ) : (
          <>
            {/* 分類詳細統計 */}
            <View style={styles.detailsContainer}>
              <Text style={styles.detailsTitle}>練習分類統計</Text>
              {categoryStats.length > 0 ? (
                categoryStats.map((category, index) => (
                  <CategoryDetail key={index} category={category} />
                ))
              ) : (
                <View style={styles.emptyCategory}>
                  <Text style={styles.emptyCategoryText}>暫無分類數據</Text>
                  <Text style={styles.emptyCategorySubText}>完成練習後即可查看</Text>
                </View>
              )}
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#31C6FE',
  },
  tabText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#31C6FE',
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
    gap: 12,
  },
  statCard: {
    width: (width - 52) / 2,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  chartContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  barChartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: 150,
  },
  barWrapper: {
    alignItems: 'center',
    flex: 1,
  },
  barContainer: {
    height: 120,
    justifyContent: 'flex-end',
    marginBottom: 8,
  },
  bar: {
    width: 20,
    borderRadius: 4,
    minHeight: 4,
  },
  barLabel: {
    fontSize: 10,
    color: '#666',
    marginTop: 4,
  },
  lineChartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    height: 150,
  },
  linePointWrapper: {
    alignItems: 'center',
    flex: 1,
  },
  linePointContainer: {
    height: 100,
    justifyContent: 'flex-end',
    position: 'relative',
    marginBottom: 8,
  },
  linePoint: {
    width: 12,
    height: 12,
    borderRadius: 6,
    position: 'absolute',
  },
  lineLabel: {
    fontSize: 10,
    color: '#666',
    marginTop: 4,
  },
  lineValue: {
    fontSize: 10,
    color: '#999',
    marginTop: 2,
  },
  additionalStats: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  additionalStatRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  additionalStatLabel: {
    fontSize: 14,
    color: '#666',
  },
  additionalStatValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  detailsContainer: {
    marginBottom: 20,
  },
  detailsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  categoryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  categoryLastPracticed: {
    fontSize: 12,
    color: '#999',
  },
  categoryStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  categoryStatItem: {
    alignItems: 'center',
  },
  categoryStatValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#31C6FE',
    marginBottom: 4,
  },
  categoryStatLabel: {
    fontSize: 12,
    color: '#666',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  emptySubText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  emptyCategory: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyCategoryText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  emptyCategorySubText: {
    fontSize: 14,
    color: '#999',
  },
});

export default PracticeStatsScreen;