import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const TrainingPlanProgressScreen = ({ route, navigation }) => {
  const { plan } = route.params;
  const [currentWeek, setCurrentWeek] = useState(1);

  // 訓練週次數據
  const weeks = [
    {
      week: 1,
      title: '基礎覺察',
      sessions: [
        {
          id: 1,
          title: '呼吸穩定力練習',
          duration: '5 minutes',
          description: '學習基礎呼吸技巧，建立身心連結的第一步。透過專注呼吸，提升當下覺察力。',
          completed: false,
          practiceType: '呼吸穩定力練習',
        },
      ],
    },
    {
      week: 2,
      title: '情緒理解',
      sessions: [
        {
          id: 2,
          title: '情緒理解力練習',
          duration: '7 minutes',
          description: '認識情緒的本質，學習辨識和命名自己的情緒狀態。',
          completed: false,
          practiceType: '情緒理解力練習',
        },
      ],
    },
    {
      week: 3,
      title: '正念培養',
      sessions: [
        {
          id: 3,
          title: '正念安定力練習',
          duration: '6 minutes',
          description: '培養正念態度，學習以不評判的方式觀察當下。',
          completed: false,
          practiceType: '正念安定力練習',
        },
      ],
    },
    {
      week: 4,
      title: '自我整合',
      sessions: [
        {
          id: 4,
          title: '自我覺察力練習',
          duration: '8 minutes',
          description: '整合所學技巧，深化自我覺察，建立穩定的心理素質。',
          completed: false,
          practiceType: '自我覺察力練習',
        },
      ],
    },
  ];

  const currentWeekData = weeks[currentWeek - 1];
  const totalWeeks = weeks.length;

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

  const handleStartSession = (session) => {
    // 導航到對應的練習頁面
    navigation.navigate('PracticeNavigator', {
      practiceType: session.practiceType,
      onPracticeComplete: () => {
        // 練習完成後的回調
        navigation.goBack();
      },
    });
  };

  const handleViewOverview = () => {
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      {/* 頂部導航 */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{plan.title}</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons name="share-outline" size={24} color="#333" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons name="settings-outline" size={24} color="#333" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* 封面圖 */}
        {plan.image && (
          <View style={styles.imageContainer}>
            <Image source={plan.image} style={styles.coverImage} />
            <View style={styles.imageOverlay}>
              <View style={styles.badge}>
                <Ionicons name="layers-outline" size={16} color="#FFF" />
                <Text style={styles.badgeText}>訓練中</Text>
              </View>
            </View>
          </View>
        )}

        {/* 查看計畫概覽 */}
        <TouchableOpacity
          style={styles.overviewButton}
          onPress={handleViewOverview}
        >
          <Text style={styles.overviewText}>查看計畫概覽</Text>
          <Ionicons name="chevron-forward" size={20} color="#4A90E2" />
        </TouchableOpacity>

        {/* 週次導航 */}
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
              color={currentWeek === 1 ? '#CCC' : '#4A90E2'}
            />
          </TouchableOpacity>
          <View style={styles.weekInfo}>
            <Text style={styles.weekNumber}>Week {currentWeek}</Text>
            <Text style={styles.weekTitle}>{currentWeekData.title}</Text>
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
              color={currentWeek === totalWeeks ? '#CCC' : '#4A90E2'}
            />
          </TouchableOpacity>
        </View>

        {/* 進度指示器 */}
        <View style={styles.progressContainer}>
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

        {/* 訓練單元列表 */}
        <View style={styles.sessionsContainer}>
          {currentWeekData.sessions.map((session) => (
            <View key={session.id} style={styles.sessionCard}>
              <View style={styles.sessionHeader}>
                <View style={styles.sessionTitleContainer}>
                  <View style={styles.sessionIcon}>
                    <Ionicons name="timer-outline" size={20} color="#4A90E2" />
                  </View>
                  <View style={styles.sessionInfo}>
                    <Text style={styles.sessionTitle}>{session.title}</Text>
                    <Text style={styles.sessionDuration}>{session.duration}</Text>
                  </View>
                </View>
                <View
                  style={[
                    styles.completionIndicator,
                    session.completed && styles.completionIndicatorCompleted,
                  ]}
                >
                  {session.completed && (
                    <Ionicons name="checkmark" size={16} color="#FFF" />
                  )}
                </View>
              </View>

              <Text style={styles.sessionDescription}>
                {session.description}
              </Text>

              <TouchableOpacity
                style={styles.startButton}
                onPress={() => handleStartSession(session)}
              >
                <Text style={styles.startButtonText}>
                  {session.completed ? '重新練習' : '開始練習'}
                </Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
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
    borderBottomColor: '#F0F0F0',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 10,
  },
  headerRight: {
    flexDirection: 'row',
    gap: 10,
  },
  iconButton: {
    padding: 8,
  },
  content: {
    flex: 1,
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: 200,
  },
  coverImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imageOverlay: {
    position: 'absolute',
    top: 20,
    left: 20,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(74, 144, 226, 0.9)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  badgeText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  overviewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginTop: 20,
    padding: 15,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  overviewText: {
    fontSize: 14,
    color: '#4A90E2',
    fontWeight: '600',
  },
  weekNavigation: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginTop: 20,
    padding: 15,
    borderRadius: 12,
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
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  weekTitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginTop: 15,
    marginBottom: 10,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E0E0E0',
  },
  progressDotActive: {
    width: 24,
    backgroundColor: '#4A90E2',
  },
  progressDotCompleted: {
    backgroundColor: '#81C784',
  },
  sessionsContainer: {
    padding: 20,
  },
  sessionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  sessionTitleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  sessionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E3F2FD',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  sessionInfo: {
    flex: 1,
  },
  sessionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  sessionDuration: {
    fontSize: 12,
    color: '#999',
  },
  completionIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  completionIndicatorCompleted: {
    backgroundColor: '#81C784',
    borderColor: '#81C784',
  },
  sessionDescription: {
    fontSize: 13,
    color: '#666',
    lineHeight: 20,
    marginBottom: 15,
  },
  startButton: {
    backgroundColor: '#4A90E2',
    borderRadius: 25,
    paddingVertical: 12,
    alignItems: 'center',
  },
  startButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  bottomSpacing: {
    height: 50,
  },
});

export default TrainingPlanProgressScreen;
