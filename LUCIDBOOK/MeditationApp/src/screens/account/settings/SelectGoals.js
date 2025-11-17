// ==========================================
// 檔案名稱: SelectGoals.js
// 功能: 練習目標設置頁面
// 
// ✅ 多選目標功能
// ✅ 保存目標到本地和後端
// ✅ 可跳過此步驟
// ✅ 精美的卡片設計
// ==========================================

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  StatusBar,
  Alert,
  ActivityIndicator,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ApiService from '../../../../api';

const SelectGoals = ({ navigation, route }) => {
  const [selectedGoals, setSelectedGoals] = useState([]);
  const [loading, setLoading] = useState(false);
  const { fromLogin, fromSettings } = route?.params || {};

  // 預設目標選項
  const goals = [
    {
      id: 'stress',
      title: '減輕壓力',
      description: '透過正念練習釋放日常壓力',
      icon: 'cloud-outline',
      color: '#4A90E2',
      bgColor: '#E3F2FD',
    },
    {
      id: 'focus',
      title: '提升專注力',
      description: '增強注意力與工作效率',
      icon: 'bulb-outline',
      color: '#F59E0B',
      bgColor: '#FFF3E0',
    },
    {
      id: 'sleep',
      title: '改善睡眠',
      description: '建立健康的睡眠習慣',
      icon: 'moon-outline',
      color: '#8B5CF6',
      bgColor: '#F3E5F5',
    },
    {
      id: 'emotion',
      title: '情緒管理',
      description: '培養情緒覺察與調節能力',
      icon: 'heart-outline',
      color: '#EF4444',
      bgColor: '#FEE2E2',
    },
    {
      id: 'confidence',
      title: '建立自信',
      description: '提升自我價值感與信心',
      icon: 'trophy-outline',
      color: '#10B981',
      bgColor: '#D1FAE5',
    },
    {
      id: 'relationship',
      title: '改善人際關係',
      description: '增進同理心與溝通能力',
      icon: 'people-outline',
      color: '#06B6D4',
      bgColor: '#CFFAFE',
    },
    {
      id: 'mindfulness',
      title: '培養正念',
      description: '活在當下，提升生活品質',
      icon: 'flower-outline',
      color: '#EC4899',
      bgColor: '#FCE7F3',
    },
    {
      id: 'energy',
      title: '增加活力',
      description: '提升身心能量與動力',
      icon: 'flash-outline',
      color: '#F97316',
      bgColor: '#FFEDD5',
    },
  ];

  // 切換目標選擇
  const toggleGoal = (goalId) => {
    if (selectedGoals.includes(goalId)) {
      setSelectedGoals(selectedGoals.filter(id => id !== goalId));
    } else {
      setSelectedGoals([...selectedGoals, goalId]);
    }
  };

  // 保存目標
  const handleSaveGoals = async () => {
    if (selectedGoals.length === 0) {
      Alert.alert('提示', '請至少選擇一個練習目標', [
        { text: '確定' }
      ]);
      return;
    }

    setLoading(true);
    try {
      // 保存到本地
      await AsyncStorage.setItem('userGoals', JSON.stringify(selectedGoals));

      // 嘗試同步到後端（如果已登入）
      try {
        const isLoggedIn = await ApiService.isLoggedIn();
        if (isLoggedIn) {
          await ApiService.updateUserGoals(selectedGoals);
        }
      } catch (error) {
        console.log('同步目標到後端失敗，但本地已保存:', error);
      }

      // 顯示成功訊息
      Alert.alert(
        '設置成功！',
        `已選擇 ${selectedGoals.length} 個練習目標`,
        [
          {
            text: '開始探索',
            onPress: () => handleNavigation(),
          }
        ]
      );
    } catch (error) {
      console.error('保存目標失敗:', error);
      Alert.alert('錯誤', '保存失敗，請稍後再試');
    } finally {
      setLoading(false);
    }
  };

  // 跳過設置
  const handleSkip = () => {
    Alert.alert(
      '跳過設置',
      '您可以稍後在設定中更改練習目標',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '確定跳過',
          onPress: () => handleNavigation(),
        }
      ]
    );
  };

  // 處理導航
  const handleNavigation = () => {
    if (fromSettings) {
      // 從設定頁進入，返回設定
      navigation.goBack();
    } else if (fromLogin) {
      // 從登入進入，導航到主頁面
      // 根據你的 App 結構，可能是 Home、Explore 或 MainTabs
      navigation.reset({
        index: 0,
        routes: [{ name: 'MainTabs' }], // 或 'Home', 'Explore' 等
      });
    } else {
      // 其他情況，返回
      navigation.goBack();
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#166CB5" />
      
      {/* Header */}
      <LinearGradient
        colors={['#166CB5', '#31C6FE']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.headerTitle}>設定你的練習目標</Text>
            <Text style={styles.headerSubtitle}>
              選擇你想要改善的方向（可多選）
            </Text>
          </View>
          {!fromLogin && (
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={handleSkip}
            >
              <Ionicons name="close" size={24} color="#FFF" />
            </TouchableOpacity>
          )}
        </View>
      </LinearGradient>

      {/* Content */}
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* 進度指示 */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { width: `${(selectedGoals.length / goals.length) * 100}%` }
              ]} 
            />
          </View>
          <Text style={styles.progressText}>
            已選擇 {selectedGoals.length} / {goals.length}
          </Text>
        </View>

        {/* 目標卡片 */}
        <View style={styles.goalsGrid}>
          {goals.map((goal) => {
            const isSelected = selectedGoals.includes(goal.id);
            return (
              <TouchableOpacity
                key={goal.id}
                style={[
                  styles.goalCard,
                  { backgroundColor: goal.bgColor },
                  isSelected && styles.goalCardSelected,
                ]}
                onPress={() => toggleGoal(goal.id)}
                activeOpacity={0.7}
              >
                {/* 選中標記 */}
                {isSelected && (
                  <View style={[styles.selectedBadge, { backgroundColor: goal.color }]}>
                    <Ionicons name="checkmark" size={16} color="#FFF" />
                  </View>
                )}

                {/* 圖標 */}
                <View style={[styles.iconContainer, { backgroundColor: goal.color }]}>
                  <Ionicons name={goal.icon} size={28} color="#FFF" />
                </View>

                {/* 內容 */}
                <Text style={styles.goalTitle}>{goal.title}</Text>
                <Text style={styles.goalDescription}>{goal.description}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* 提示文字 */}
        <View style={styles.tipContainer}>
          <Ionicons name="information-circle-outline" size={20} color="#6B7280" />
          <Text style={styles.tipText}>
            根據你選擇的目標，我們會為你推薦適合的練習內容
          </Text>
        </View>
      </ScrollView>

      {/* 底部按鈕 */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity 
          style={styles.skipButton}
          onPress={handleSkip}
          disabled={loading}
        >
          <Text style={styles.skipButtonText}>稍後再說</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[
            styles.saveButton,
            selectedGoals.length === 0 && styles.saveButtonDisabled,
          ]}
          onPress={handleSaveGoals}
          disabled={loading || selectedGoals.length === 0}
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <>
              <Text style={styles.saveButtonText}>完成設置</Text>
              <Ionicons name="arrow-forward" size={20} color="#FFF" />
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },

  // Header
  header: {
    paddingTop: 50,
    paddingBottom: 24,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 20,
  },
  closeButton: {
    padding: 4,
  },

  // Scroll View
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },

  // Progress
  progressContainer: {
    marginBottom: 24,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#166CB5',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
  },

  // Goals Grid
  goalsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginHorizontal: -6,
  },
  goalCard: {
    width: '48%',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 6,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    position: 'relative',
  },
  goalCardSelected: {
    borderWidth: 2,
    borderColor: '#166CB5',
  },
  selectedBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  goalTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 6,
  },
  goalDescription: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 18,
  },

  // Tip
  tipContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
    gap: 10,
  },
  tipText: {
    flex: 1,
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 20,
  },

  // Bottom Buttons
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    padding: 20,
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 5,
  },
  skipButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  skipButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  saveButton: {
    flex: 2,
    flexDirection: 'row',
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: '#166CB5',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  saveButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
});

export default SelectGoals;