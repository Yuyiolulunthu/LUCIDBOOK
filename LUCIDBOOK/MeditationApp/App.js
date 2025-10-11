// ==========================================
// 檔案名稱: App.js
// ==========================================

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Dimensions,
  StatusBar,
  Image,
  Alert,
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from './LoginScreen';
import RegisterScreen from './RegisterScreen';
import PracticeScreen from './practice';
import ApiService from './api';

const { width } = Dimensions.get('window');
const Stack = createNativeStackNavigator();

// ==========================================
// 主畫面組件
// ==========================================
const HomeScreen = ({ navigation }) => {
  const [selectedMood, setSelectedMood] = useState(null);
  const [activeTab, setActiveTab] = useState('home');
  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // 🔥 在 App 啟動時檢查是否已登入
  useEffect(() => {
    checkLoginStatus();
  }, []);

  // 🔥 監聽 navigation focus 事件，回到此頁面時重新檢查登入狀態
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      checkLoginStatus();
    });
    return unsubscribe;
  }, [navigation]);

  const checkLoginStatus = async () => {
    try {
      const loggedIn = await ApiService.isLoggedIn();
      if (loggedIn) {
        const response = await ApiService.getUserProfile();
        setUser({
          id: response.user.id,
          name: response.user.name,
          email: response.user.email
        });
        setIsLoggedIn(true);
      }
    } catch (error) {
      console.log('未登入或 Token 已過期');
    }
  };

  const moods = [
    { name: '超讚!', image: require('./assets/images/perfect.png'), color: 'rgba(199, 239, 238, 0.15)' },
    { name: '還不錯', image: require('./assets/images/not bad.png'), color: 'rgba(199, 239, 238, 0.15)' },
    { name: '普普通通', image: require('./assets/images/normal.png'), color: 'rgba(199, 239, 238, 0.15)' },
    { name: '不太好', image: require('./assets/images/not good.png'), color: 'rgba(199, 239, 238, 0.15)' },
    { name: '很糟!', image: require('./assets/images/terrible.png'), color: 'rgba(199, 239, 238, 0.15)' }
  ];

  const dailyPractices = [
    { 
      name: '呼吸穩定力練習', 
      description: '邀請你給自己一段時間，讓我們陪你，一步一步讓我們一起靜下來慢呼吸',
      completed: false, 
      duration: '5分鐘', 
      practiceType: '呼吸穩定力練習',
      backgroundColor: '#FFFFFF',
      badgeColor: 'rgba(90, 206, 135, 0.8)',
      image: require('./assets/images/呼吸穩定.png'),
      practiceNumber: 1,
      progressValue: 0.0
    },
    { 
      name: '情緒理解力練習', 
      description: '傾聽內心的聲音，溫柔地與自己對話，找回平靜與力量',
      completed: false, 
      duration: '3 ~ 5 min', 
      practiceType: '情緒理解力練習',
      backgroundColor: '#FFFFFF',
      badgeColor: 'rgba(0, 232, 227, 0.2)',
      image: require('./assets/images/情緒理解.png'),
      practiceNumber: 2,
      progressValue: 0.0
    },
    { 
      name: '五感覺察力練習', 
      description: '「五感覺察」是一個簡單卻重要的情緒調節技巧，也是改變內在的基礎',
      completed: false, 
      duration: '3 ~ 5 min', 
      practiceType: '五感察覺練習',
      backgroundColor: '#FFFFFF',
      badgeColor: 'rgba(0, 232, 227, 0.2)',
      image: require('./assets/images/五感察覺.png'),
      practiceNumber: 3,
      progressValue: 0.0
    }
  ];

  const topics = [
    { name: '拖延症', color: 'rgba(103, 169, 224, 0.95)' },
    { name: '感情問題', color: 'rgba(103, 169, 224, 0.95)' },
    { name: '課業焦慮', color: 'rgba(103, 169, 224, 0.95)' },
    { name: '社交恐懼', color: 'rgba(103, 169, 224, 0.95)' },
    { name: '睡眠改善', color: 'rgba(103, 169, 224, 0.95)' },
    { name: '專注提升', color: 'rgba(103, 169, 224, 0.95)' },
    { name: '壓力管理', color: 'rgba(103, 169, 224, 0.95)' },
    { name: '情緒平衡', color: 'rgba(103, 169, 224, 0.95)' }
  ];

  const showLoginPrompt = () => {
    if (!isLoggedIn || (user && user.isGuest)) {
      Alert.alert(
        '需要登入',
        '請登入以享受完整的冥想體驗',
        [
          { text: '取消', style: 'cancel' },
          { text: '登入', onPress: () => navigation.navigate('Login', {
            onLoginSuccess: (userData) => {
              setUser(userData);
              setIsLoggedIn(true);
            }
          })}
        ]
      );
      return true;
    }
    return false;
  };

  const handleLogout = () => {
    Alert.alert('確認登出', '您確定要登出嗎？', [
      { text: '取消', style: 'cancel' },
      { 
        text: '登出', 
        style: 'destructive',
        onPress: async () => {
          await ApiService.logout();
          setUser(null);
          setIsLoggedIn(false);
          Alert.alert('已登出', '期待下次再見！');
        }
      }
    ]);
  };

  const navigateToPractice = (type) => {
    if (showLoginPrompt()) return;
    
    navigation.navigate('Practice', { 
      practiceType: type,
      onPracticeComplete: async (practiceType, duration = 5) => {
        if (isLoggedIn && !user?.isGuest) {
          try {
            await ApiService.completePractice(practiceType, duration);
            console.log('✅ 練習記錄已儲存');
          } catch (error) {
            console.error('記錄練習失敗:', error);
          }
        }
      }
    });
  };

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
        <Image 
          source={mood.image}
          style={styles.moodImage}
          resizeMode="contain"
        />
      </TouchableOpacity>
      <Text style={styles.moodText}>{mood.name}</Text>
    </View>
  );

  const PracticeCard = ({ practice }) => (
    <View style={styles.practiceCardContainer}>
      <View style={styles.practiceRow}>
        <View style={[styles.practiceNumberBadge, { backgroundColor: practice.badgeColor }]}>
          <Text style={styles.practiceNumberText}>練習{practice.practiceNumber}</Text>
        </View>
        
        <View style={styles.practiceRightContent}>
          <View style={styles.practiceDescription}>
            <Text style={styles.practiceDescriptionText}>{practice.description}</Text>
          </View>
          <TouchableOpacity 
            style={[styles.practiceCard, { backgroundColor: practice.backgroundColor }]}
            onPress={() => navigateToPractice(practice.practiceType)}
          >
            <View style={styles.practiceImageContainer}>
              <Image 
                source={practice.image}
                style={styles.practiceImage}
                resizeMode="contain"
              />
            </View>
            <View style={styles.practiceContent}>
              <Text style={styles.practiceName}>《{practice.name}》</Text>
              {practice.completed ? (
                <View style={styles.completedContainer}>
                  <Text style={styles.completedIcon}>✓</Text>
                  <Text style={styles.completedText}>完成！</Text>
                </View>
              ) : (
                <>
                  <View style={styles.progressContainer}>
                    <View style={styles.progressBarBackground}>
                      <View style={[styles.progressBarForeground, { width: `${practice.progressValue * 100}%` }]} />
                    </View>
                  </View>
                  <View style={styles.durationContainer}>
                    <Text style={styles.durationIcon}>🕐</Text>
                    <Text style={styles.durationText}>{practice.duration}</Text>
                  </View>
                </>
              )}
            </View>
            <View style={styles.playButtonContainer}>
              <View style={styles.playButton}>
                <Text style={styles.playButtonText}>▶</Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const TopicButton = ({ topic }) => (
    <TouchableOpacity style={[styles.topicButton, { backgroundColor: topic.color }]}>
      <Text style={styles.topicText}>{topic.name}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="rgba(22, 109, 181, 0.95)" />
      
      <View style={styles.headerContainer}>
        <View style={styles.searchContainer}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="搜尋"
            placeholderTextColor="#9CA3AF"
          />
        </View>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <View style={styles.greetingRow}>
            <Text style={styles.greeting}>
              哈囉！{isLoggedIn ? user?.name : 'Guest'} player
            </Text>
            {isLoggedIn && !user?.isGuest && (
              <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
                <Text style={styles.logoutText}>登出</Text>
              </TouchableOpacity>
            )}
          </View>
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

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>每日練習</Text>
          <Text style={styles.sectionSubtitle}>今日練習進度 (0/3)</Text>
          
          <View style={styles.practiceList}>
            {dailyPractices.map((practice, index) => (
              <PracticeCard key={index} practice={practice} />
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>推薦練習課程</Text>
          <Text style={styles.sectionSubtitle}>熱門主題</Text>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.topicsScrollContainer}>
            <View style={styles.topicsGrid}>
              <View style={styles.topicsRow}>
                {topics.slice(0, 2).map((topic, index) => (
                  <TopicButton key={index} topic={topic} />
                ))}
              </View>
              <View style={styles.topicsRow}>
                {topics.slice(2, 4).map((topic, index) => (
                  <TopicButton key={index + 2} topic={topic} />
                ))}
              </View>
            </View>
            
            <View style={styles.topicsGrid}>
              <View style={styles.topicsRow}>
                {topics.slice(4, 6).map((topic, index) => (
                  <TopicButton key={index + 4} topic={topic} />
                ))}
              </View>
              <View style={styles.topicsRow}>
                {topics.slice(6, 8).map((topic, index) => (
                  <TopicButton key={index + 6} topic={topic} />
                ))}
              </View>
            </View>
          </ScrollView>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.journeyScrollContainer}>
            <View style={styles.journeyCardWrapper}>
              <View style={styles.journeyImageSection}>
                <Image 
                  source={require('./assets/images/植物.png')}
                  style={styles.journeyMainImage}
                  resizeMode="cover"
                />
              </View>
              <View style={styles.journeyTextSection}>
                <Text style={styles.journeyTitle}>繼續你的探索旅途</Text>
                <View style={styles.progressBarContainer}>
                  <View style={styles.progressBar}>
                    <View style={styles.progressFill} />
                  </View>
                  <Text style={styles.progressText}>50%</Text>
                </View>
              </View>
            </View>
            
            <TouchableOpacity style={styles.independentAddButton}>
              <Text style={styles.independentAddIcon}>+</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>

      <View style={styles.bottomNav}>
        <TouchableOpacity
          style={[styles.navButton, activeTab === 'home' && styles.navButtonActive]}
          onPress={() => setActiveTab('home')}
        >
          <Image 
            source={require('./assets/images/home.png')}
            style={styles.navIcon}
            resizeMode="contain"
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.navButton, activeTab === 'courses' && styles.navButtonActive]}
          onPress={() => setActiveTab('courses')}
        >
          <Image 
            source={require('./assets/images/explore.png')}
            style={styles.navIcon}
            resizeMode="contain"
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.navButton, activeTab === 'tasks' && styles.navButtonActive]}
          onPress={() => setActiveTab('tasks')}
        >
          <Image 
            source={require('./assets/images/daily.png')}
            style={styles.navIcon}
            resizeMode="contain"
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.navButton, activeTab === 'profile' && styles.navButtonActive]}
          onPress={() => {
            if (isLoggedIn && !user?.isGuest) {
              setActiveTab('profile');
            } else {
              showLoginPrompt();
            }
          }}
        >
          <Image 
            source={require('./assets/images/profile.png')}
            style={styles.navIcon}
            resizeMode="contain"
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

// ==========================================
// 練習畫面包裝組件
// ==========================================
const PracticeScreenWrapper = ({ route, navigation }) => {
  const { practiceType, onPracticeComplete } = route.params;

  const handleBack = () => {
    if (onPracticeComplete) {
      onPracticeComplete(practiceType);
    }
    navigation.goBack();
  };

  return <PracticeScreen practiceType={practiceType} onBack={handleBack} />;
};

// ==========================================
// 主應用程式（包含導航）
// ==========================================
export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator 
        initialRouteName="Home"
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="Practice" component={PracticeScreenWrapper} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

// ==========================================
// 樣式
// ==========================================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    paddingTop: 0,
  },
  headerContainer: {
    backgroundColor: 'rgba(22, 109, 181, 0.95)',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 16,
  },
  scrollView: {
    flex: 1,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  searchIcon: {
    fontSize: 14,
    marginRight: 8,
    color: '#9CA3AF',
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#374151',
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  greetingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    marginTop: 16,
  },
  greeting: {
    fontSize: 20,
    fontWeight: '500',
    color: '#111827',
  },
  logoutButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: 6,
  },
  logoutText: {
    fontSize: 14,
    color: '#EF4444',
    fontWeight: '500',
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
    marginBottom: 8,
  },
  moodContainer: {
    alignItems: 'center',
    width: (width - 32 - 40) / 5,
    marginBottom: 12,
  },
  moodButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  moodButtonSelected: {
    transform: [{ scale: 1.1 }],
    borderWidth: 2,
    borderColor: '#3B82F6',
  },
  moodImage: {
    width: 45,
    height: 45,
  },
  moodText: {
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
    fontWeight: '500',
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
  practiceCardContainer: {
    marginBottom: 20,
  },
  practiceRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  practiceNumberBadge: {
    borderRadius: 15,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 12,
    marginTop: 8,
  },
  practiceNumberText: {
    color: 'rgba(37, 37, 37, 0.25)',
    fontSize: 12,
    fontWeight: 'bold',
  },
  practiceRightContent: {
    flex: 1,
  },
  practiceDescription: {
    marginBottom: 12,
  },
  practiceDescriptionText: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  practiceCard: {
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  practiceImageContainer: {
    width: 60,
    height: 60,
    backgroundColor: 'white',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  practiceImage: {
    width: 75,
    height: 75,
  },
  practiceContent: {
    flex: 1,
  },
  completedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  completedIcon: {
    color: '#10B981',
    fontSize: 16,
    marginRight: 6,
  },
  completedText: {
    color: '#10B981',
    fontSize: 14,
    fontWeight: '500',
  },
  progressContainer: {
    marginTop: 8,
    marginBottom: 8,
  },
  progressBarBackground: {
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBarForeground: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 2,
  },
  practiceName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 4,
  },
  durationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  durationIcon: {
    fontSize: 12,
    marginRight: 4,
  },
  durationText: {
    fontSize: 14,
    color: '#6B7280',
  },
  playButtonContainer: {
    alignItems: 'center',
  },
  playButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  playButtonText: {
    fontSize: 14,
    color: '#111827',
    marginLeft: 2,
  },
  topicsScrollContainer: {
    marginBottom: 16,
  },
  topicsGrid: {
    paddingRight: 2,
  },
  topicsRow: {
    flexDirection: 'row',
    marginBottom: 8,
    justifyContent: 'space-between',
  },
  topicButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    minWidth: 80,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 4,
  },
  topicText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  journeyScrollContainer: {
    marginBottom: 16,
  },
  journeyCardWrapper: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    overflow: 'hidden',
    height: 100,
    width: 280,
    flexDirection: 'row',
    marginRight: 20,
  },
  journeyImageSection: {
    width: 140,
    height: '100%',
  },
  journeyMainImage: {
    width: '100%',
    height: '100%',
  },
  journeyTextSection: {
    position: 'absolute',
    left: 150,
    top: 25,
    alignItems: 'flex-start',
  },
  journeyTitle: {
    fontSize: 12,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 4,
    textAlign: 'right',
  },
  progressBarContainer: {
    alignItems: 'flex-end',
    marginTop: 4,
  },
  progressBar: {
    width: 80,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: 2,
    marginBottom: 2,
  },
  progressFill: {
    width: '50%',
    height: '100%',
    backgroundColor: '#3B82F6',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 10,
    color: '#374151',
  },
  independentAddButton: {
    width: 80,
    height: 100,
    backgroundColor: '#E5E7EB',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  independentAddIcon: {
    fontSize: 32,
    color: '#9CA3AF',
    fontWeight: '300',
  },
  bottomPadding: {
    height: 80,
  },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(22, 109, 181, 0.95)',
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 8,
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  navButton: {
    padding: 8,
    borderRadius: 8,
  },
  navButtonActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  navIcon: {
    width: 34,
    height: 34,
    tintColor: '#FFFFFF',
  },
});