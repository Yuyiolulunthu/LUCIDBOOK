import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  Dimensions,
  StatusBar,
} from 'react-native';

const { width } = Dimensions.get('window');

const MeditationApp = () => {
  const [selectedMood, setSelectedMood] = useState(null);
  const [activeTab, setActiveTab] = useState('home');

  const moods = [
    { name: 'Good', emoji: '😊', color: '#fecaca' },
    { name: 'Ecstatic', emoji: '😸', color: '#e5e7eb' },
    { name: 'Depressed', emoji: '😔', color: '#fef3c7' },
    { name: 'Normal', emoji: '😐', color: '#fca5a5' },
    { name: 'Tearful', emoji: '😢', color: '#d1d5db' },
    { name: 'Annoyed', emoji: '😤', color: '#f87171' }
  ];

  const dailyPractices = [
    { name: '呼吸穩定力練習', completed: true, duration: '', icon: '🧘‍♀️' },
    { name: '五感察覺練習', completed: false, duration: '3~5 分鐘', icon: '🤱' },
    { name: '情緒傾聽練習', completed: false, duration: '3~5 分鐘', icon: '🎵' }
  ];

  const topics = [
    { name: '拖延症', color: '#f0fdfa', icon: '⏰' },
    { name: '感情問題', color: '#fdf2f8', icon: '💕' },
    { name: '課業焦慮', color: '#f9fafb', icon: '📚' },
    { name: '社交恐懼', color: '#eff6ff', icon: '❄️' }
  ];

  const MoodButton = ({ mood, index, isSelected, onPress }) => (
    <View style={styles.moodContainer}>
      <TouchableOpacity
        onPress={onPress}
        style={[
          styles.moodButton,
          { backgroundColor: mood.color },
          isSelected && styles.moodButtonSelected
        ]}
      >
        <Text style={styles.moodEmoji}>{mood.emoji}</Text>
      </TouchableOpacity>
      <Text style={styles.moodText}>{mood.name}</Text>
    </View>
  );

  const PracticeCard = ({ practice, index }) => (
    <TouchableOpacity style={styles.practiceCard}>
      <View style={styles.practiceIcon}>
        <Text style={styles.practiceIconText}>{practice.icon}</Text>
      </View>
      <View style={styles.practiceContent}>
        <Text style={styles.practiceName}>{practice.name}</Text>
        {practice.completed ? (
          <View style={styles.completedContainer}>
            <Text style={styles.completedText}>✓ 完成！</Text>
          </View>
        ) : (
          <View style={styles.durationContainer}>
            <Text style={styles.durationText}>🕐 {practice.duration}</Text>
          </View>
        )}
      </View>
      <Text style={styles.arrow}>›</Text>
    </TouchableOpacity>
  );

  const TopicButton = ({ topic }) => (
    <TouchableOpacity style={[styles.topicButton, { backgroundColor: topic.color }]}>
      <Text style={styles.topicIcon}>{topic.icon}</Text>
      <Text style={styles.topicText}>{topic.name}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F9FAFB" />
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.searchContainer}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="搜尋"
              placeholderTextColor="#9CA3AF"
            />
          </View>
        </View>

        {/* Greeting and Mood Section */}
        <View style={styles.section}>
          <Text style={styles.greeting}>哈囉！XXX player</Text>
          <Text style={styles.subGreeting}>想來紀錄一下你目前的心情嗎？</Text>
          
          <View style={styles.moodGrid}>
            {moods.map((mood, index) => (
              <MoodButton
                key={index}
                mood={mood}
                index={index}
                isSelected={selectedMood === index}
                onPress={() => setSelectedMood(index)}
              />
            ))}
          </View>
        </View>

        {/* Daily Practice Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>每日練習</Text>
          <Text style={styles.sectionSubtitle}>今日練習進度 (1/3)</Text>
          
          <View style={styles.practiceList}>
            {dailyPractices.map((practice, index) => (
              <PracticeCard key={index} practice={practice} index={index} />
            ))}
          </View>
        </View>

        {/* Recommended Courses */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>推薦練習課程</Text>
          <Text style={styles.sectionSubtitle}>熱門主題</Text>
          
          <View style={styles.topicsContainer}>
            {topics.map((topic, index) => (
              <TopicButton key={index} topic={topic} />
            ))}
          </View>

          {/* Journey Progress */}
          <View style={styles.journeyCard}>
            <Text style={styles.journeyTitle}>編織你的探索旅途</Text>
            <View style={styles.progressBar}>
              <View style={styles.progressFill} />
            </View>
            <Text style={styles.progressText}>50%</Text>
            <Text style={styles.journeyEmoji}>🌊</Text>
          </View>

          {/* Explore More */}
          <View style={styles.exploreContainer}>
            <TouchableOpacity style={styles.exploreButton}>
              <Text style={styles.exploreIcon}>+</Text>
              <Text style={styles.exploreText}>探索更多旅途</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity
          style={[styles.navButton, activeTab === 'home' && styles.navButtonActive]}
          onPress={() => setActiveTab('home')}
        >
          <Text style={styles.navIcon}>🏠</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.navButton, activeTab === 'courses' && styles.navButtonActive]}
          onPress={() => setActiveTab('courses')}
        >
          <Text style={styles.navIcon}>📚</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.navButton, activeTab === 'tasks' && styles.navButtonActive]}
          onPress={() => setActiveTab('tasks')}
        >
          <Text style={styles.navIcon}>✅</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.navButton, activeTab === 'profile' && styles.navButtonActive]}
          onPress={() => setActiveTab('profile')}
        >
          <Text style={styles.navIcon}>👤</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 16,
    paddingTop: 8,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 25,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 8,
    color: '#9CA3AF',
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#374151',
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  greeting: {
    fontSize: 20,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 8,
  },
  subGreeting: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 16,
  },
  moodGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  moodContainer: {
    alignItems: 'center',
    width: (width - 32 - 50) / 6,
    marginBottom: 8,
  },
  moodButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  moodButtonSelected: {
    transform: [{ scale: 1.1 }],
    borderWidth: 2,
    borderColor: '#3B82F6',
  },
  moodEmoji: {
    fontSize: 20,
  },
  moodText: {
    fontSize: 10,
    color: '#6B7280',
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
  },
  practiceList: {
    gap: 12,
  },
  practiceCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    marginBottom: 12,
  },
  practiceIcon: {
    width: 64,
    height: 64,
    backgroundColor: '#FED7AA',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  practiceIconText: {
    fontSize: 24,
  },
  practiceContent: {
    flex: 1,
  },
  practiceName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 4,
  },
  completedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  completedText: {
    fontSize: 14,
    color: '#10B981',
  },
  durationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  durationText: {
    fontSize: 14,
    color: '#6B7280',
  },
  arrow: {
    fontSize: 24,
    color: '#9CA3AF',
  },
  topicsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  topicButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginRight: 8,
    marginBottom: 8,
  },
  topicIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  topicText: {
    fontSize: 14,
    color: '#374151',
  },
  journeyCard: {
    backgroundColor: '#A7F3D0',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    position: 'relative',
    overflow: 'hidden',
  },
  journeyTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 8,
  },
  progressBar: {
    width: '100%',
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: 4,
    marginBottom: 8,
  },
  progressFill: {
    width: '50%',
    height: '100%',
    backgroundColor: '#059669',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    color: '#374151',
  },
  journeyEmoji: {
    position: 'absolute',
    right: 16,
    top: 16,
    fontSize: 48,
    opacity: 0.3,
  },
  exploreContainer: {
    alignItems: 'center',
  },
  exploreButton: {
    backgroundColor: 'white',
    borderRadius: 50,
    width: 100,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  exploreIcon: {
    fontSize: 32,
    color: '#D1D5DB',
    marginBottom: 4,
  },
  exploreText: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  bottomPadding: {
    height: 100,
  },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FEF3C7',
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    paddingHorizontal: 16,
    paddingBottom: 34, // For iPhone safe area
  },
  navButton: {
    padding: 12,
    borderRadius: 8,
  },
  navButtonActive: {
    backgroundColor: '#FDE68A',
  },
  navIcon: {
    fontSize: 24,
  },
});

export default MeditationApp;