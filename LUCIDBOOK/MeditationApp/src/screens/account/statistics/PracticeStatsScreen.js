// ==========================================
// 檔案名稱: PracticeStatsScreen.js
// 練習統計詳細頁面
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
import ApiService from '../../../../api';

const { width } = Dimensions.get('window');

const PracticeStatsScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState('overview'); // 'overview' | 'details'
  const [stats, setStats] = useState(null);
  const [categoryStats, setCategoryStats] = useState([]);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const response = await ApiService.getPracticeStats();
      if (response.success) {
        setStats(response.stats);
        // 模擬分類統計（後續可以從後端獲取）
        generateCategoryStats(response.stats);
      }
    } catch (error) {
      console.error('載入統計失敗:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateCategoryStats = (statsData) => {
    // 這裡是模擬數據，實際應該從後端獲取
    const categories = [
      {
        id: 'breathing',
        name: '呼吸穩定力',
        icon: 'wind',
        color: '#166CB5',
        sessions: Math.floor(statsData.totalPractices * 0.4),
        minutes: Math.floor(statsData.totalMinutes * 0.4),
        satisfaction: 88,
        lastPracticed: statsData.lastPracticeDate,
      },
      {
        id: 'self-awareness',
        name: '自我覺察力',
        icon: 'eye',
        color: '#10B981',
        sessions: Math.floor(statsData.totalPractices * 0.25),
        minutes: Math.floor(statsData.totalMinutes * 0.25),
        satisfaction: 85,
        lastPracticed: statsData.lastPracticeDate,
      },
      {
        id: 'emotion',
        name: '情緒理解力',
        icon: 'heart',
        color: '#F59E0B',
        sessions: Math.floor(statsData.totalPractices * 0.2),
        minutes: Math.floor(statsData.totalMinutes * 0.2),
        satisfaction: 90,
        lastPracticed: statsData.lastPracticeDate,
      },
      {
        id: 'mindfulness',
        name: '正念安定力',
        icon: 'scan',
        color: '#A855F7',
        sessions: Math.floor(statsData.totalPractices * 0.15),
        minutes: Math.floor(statsData.totalMinutes * 0.15),
        satisfaction: 86,
        lastPracticed: statsData.lastPracticeDate,
      },
    ];
    setCategoryStats(categories);
  };

  const weeklyActivity = [
    { day: '日', active: false },
    { day: '一', active: true },
    { day: '二', active: true },
    { day: '三', active: true },
    { day: '四', active: false },
    { day: '五', active: true },
    { day: '六', active: true },
  ];

  const monthlyProgress = [
    { month: '8月', sessions: 8, minutes: 52 },
    { month: '9月', sessions: 12, minutes: 78 },
    { month: '10月', sessions: 18, minutes: 117 },
    { month: '11月', sessions: stats?.totalPractices || 24, minutes: stats?.totalMinutes || 156 },
  ];

  const maxSessions = Math.max(...monthlyProgress.map(m => m.sessions));

  if (loading) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#166CB5" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#40A1DD" />
          <Text style={styles.loadingText}>載入統計中...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#166CB5" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>

        <View style={styles.headerContent}>
          <View style={styles.headerIcon}>
            <MaterialCommunityIcons name="chart-line" size={24} color="#166CB5" />
          </View>
          <View>
            <Text style={styles.headerTitle}>練習統計</Text>
            <Text style={styles.headerSubtitle}>追蹤你的成長軌跡</Text>
          </View>
        </View>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <View style={styles.tabBackground}>
          <TouchableOpacity
            style={[styles.tab, selectedTab === 'overview' && styles.tabActive]}
            onPress={() => setSelectedTab('overview')}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons 
              name="view-dashboard" 
              size={16} 
              color={selectedTab === 'overview' ? '#FFF' : '#6B7280'} 
            />
            <Text style={[styles.tabText, selectedTab === 'overview' && styles.tabTextActive]}>
              總覽
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.tab, selectedTab === 'details' && styles.tabActive]}
            onPress={() => setSelectedTab('details')}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons 
              name="chart-bar" 
              size={16} 
              color={selectedTab === 'details' ? '#FFF' : '#6B7280'} 
            />
            <Text style={[styles.tabText, selectedTab === 'details' && styles.tabTextActive]}>
              詳細數據
            </Text>
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
            {/* Key Stats Grid */}
            <View style={styles.statsGrid}>
              <View style={[styles.statCard, { backgroundColor: '#EFF6FF' }]}>
                <View style={[styles.statIconContainer, { backgroundColor: '#DBEAFE' }]}>
                  <MaterialCommunityIcons name="target" size={24} color="#166CB5" />
                </View>
                <Text style={[styles.statValue, { color: '#166CB5' }]}>
                  {stats?.totalPractices || 0}
                </Text>
                <Text style={styles.statLabel}>總練習次數</Text>
              </View>

              <View style={[styles.statCard, { backgroundColor: '#FAF5FF' }]}>
                <View style={[styles.statIconContainer, { backgroundColor: '#F3E8FF' }]}>
                  <Ionicons name="time-outline" size={24} color="#A855F7" />
                </View>
                <Text style={[styles.statValue, { color: '#A855F7' }]}>
                  {stats?.totalMinutes || 0}
                </Text>
                <Text style={styles.statLabel}>總練習分鐘</Text>
              </View>

              <View style={[styles.statCard, { backgroundColor: '#FEF3C7' }]}>
                <View style={[styles.statIconContainer, { backgroundColor: '#FDE68A' }]}>
                  <Ionicons name="flame" size={24} color="#F59E0B" />
                </View>
                <Text style={[styles.statValue, { color: '#F59E0B' }]}>
                  {stats?.currentStreak || 0}
                </Text>
                <Text style={styles.statLabel}>當前連續天</Text>
              </View>

              <View style={[styles.statCard, { backgroundColor: '#D1FAE5' }]}>
                <View style={[styles.statIconContainer, { backgroundColor: '#A7F3D0' }]}>
                  <Ionicons name="trophy" size={24} color="#10B981" />
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
                {weeklyActivity.map((day, index) => (
                  <View key={index} style={styles.weeklyBarContainer}>
                    <View style={styles.weeklyBar}>
                      <View 
                        style={[
                          styles.weeklyBarFill,
                          { 
                            height: day.active ? '60%' : '10%',
                            backgroundColor: day.active ? '#166CB5' : '#E5E7EB'
                          }
                        ]}
                      />
                    </View>
                    <Text style={[styles.weeklyDay, day.active && styles.weeklyDayActive]}>
                      {day.day}
                    </Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Monthly Progress */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <MaterialCommunityIcons name="chart-line" size={20} color="#166CB5" />
                <Text style={styles.sectionTitle}>月度進展</Text>
              </View>

              <View style={styles.monthlyChart}>
                {monthlyProgress.map((month, index) => (
                  <View key={index} style={styles.monthlyItem}>
                    <View style={styles.monthlyHeader}>
                      <Text style={styles.monthLabel}>{month.month}</Text>
                    </View>
                    <View style={styles.monthlyBarTrack}>
                      <View 
                        style={[
                          styles.monthlyBarFill,
                          { width: `${(month.sessions / maxSessions) * 100}%` }
                        ]}
                      >
                        <Text style={styles.monthlyBarText}>{month.sessions}</Text>
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
            {/* Category Breakdown */}
            {categoryStats.map((category) => (
              <View key={category.id} style={styles.categoryCard}>
                <View style={[styles.categoryHeader, { backgroundColor: category.color }]}>
                  <View style={styles.categoryHeaderContent}>
                    <View style={styles.categoryIconContainer}>
                      <Ionicons name={category.icon} size={24} color={category.color} />
                    </View>
                    <Text style={styles.categoryName}>{category.name}</Text>
                  </View>
                </View>

                <View style={styles.categoryBody}>
                  <View style={styles.categoryStatsGrid}>
                    <View style={styles.categoryStatItem}>
                      <Text style={[styles.categoryStatValue, { color: category.color }]}>
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

                  {category.lastPracticed && (
                    <View style={styles.categoryFooter}>
                      <Text style={styles.categoryFooterLabel}>最後練習</Text>
                      <Text style={styles.categoryFooterValue}>
                        {new Date(category.lastPracticed).toLocaleDateString('zh-TW')}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            ))}

            {/* Summary Card */}
            <View style={styles.summaryCard}>
              <Text style={styles.summaryTitle}>練習分布</Text>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>本週練習</Text>
                <Text style={[styles.summaryValue, { color: '#166CB5' }]}>
                  {weeklyActivity.filter(d => d.active).length} 次
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

        {/* Bottom Tip */}
        <View style={styles.tipCard}>
          <Text style={styles.tipText}>
            🎯 持續練習是成長的關鍵，保持每日打卡習慣
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6B7280',
  },
  header: {
    backgroundColor: '#166CB5',
    paddingTop: 50,
    paddingBottom: 24,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  headerContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 6,
  },
  tabActive: {
    backgroundColor: '#166CB5',
    shadowColor: '#166CB5',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  tabTextActive: {
    color: '#FFF',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    gap: 12,
  },
  statCard: {
    width: (width - 52) / 2,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
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
  section: {
    marginTop: 8,
    marginHorizontal: 20,
    backgroundColor: '#FFF',
    borderRadius: 16,
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
  },
  weeklyChart: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    height: 120,
  },
  weeklyBarContainer: {
    flex: 1,
    alignItems: 'center',
    gap: 8,
  },
  weeklyBar: {
    flex: 1,
    width: '60%',
    justifyContent: 'flex-end',
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
  monthlyChart: {
    gap: 12,
  },
  monthlyItem: {
    gap: 4,
  },
  monthlyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  monthLabel: {
    fontSize: 14,
    color: '#6B7280',
    width: 48,
  },
  monthlyBarTrack: {
    height: 32,
    backgroundColor: '#F3F4F6',
    borderRadius: 16,
    overflow: 'hidden',
  },
  monthlyBarFill: {
    height: '100%',
    backgroundColor: '#166CB5',
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
  categoryCard: {
    marginTop: 12,
    marginHorizontal: 20,
    backgroundColor: '#FFF',
    borderRadius: 16,
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
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#FFF',
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
    marginTop: 16,
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
  },
  summaryCard: {
    marginTop: 12,
    marginHorizontal: 20,
    backgroundColor: '#EFF6FF',
    borderRadius: 16,
    padding: 20,
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