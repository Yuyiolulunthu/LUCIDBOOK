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
import DailyScreen from './DailyScreen';
import ForgotPasswordScreen from './ForgotPasswordScreen';

import ApiService from './api';
import BreathingPractice from './practice/BreathingPractice';
import EmotionPractice from './practice/EmotionPractice';
import FiveSensesPractice from './practice/FiveSensesPractice';
import SelfAwarenessPractice from './practice/SelfAwarenessPractice';

const { width } = Dimensions.get('window');
const Stack = createNativeStackNavigator();

// ==========================================
// 主畫面組件
// ==========================================
const HomeScreen = ({ navigation }) => {
  const [selectedMood, setSelectedMood] = useState(null);
  const [todayMoodRecord, setTodayMoodRecord] = useState(null);
  const [activeTab, setActiveTab] = useState('home');
  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [todayPracticeStatus, setTodayPracticeStatus] = useState({});
  const [practiceProgress, setPracticeProgress] = useState({ completed: 0, total: 4 }); // 改為 4 個練習

  // 心情定義
  const moods = [
    { name: '超讚!', image: require('./assets/images/perfect.png'), color: 'rgba(199, 239, 238, 0.15)', level: 5 },
    { name: '還不錯', image: require('./assets/images/not bad.png'), color: 'rgba(199, 239, 238, 0.15)', level: 4 },
    { name: '普普通通', image: require('./assets/images/normal.png'), color: 'rgba(199, 239, 238, 0.15)', level: 3 },
    { name: '不太好', image: require('./assets/images/not good.png'), color: 'rgba(199, 239, 238, 0.15)', level: 2 },
    { name: '很糟!', image: require('./assets/images/terrible.png'), color: 'rgba(199, 239, 238, 0.15)', level: 1 }
  ];

  // 每日練習定義（加入第四個練習）
  const dailyPractices = [
    { 
      name: '呼吸穩定力練習', 
      description: '邀請你給自己一段時間，讓我們陪你，一步一步讓我們一起靜下來慢呼吸',
      duration: '5分鐘', 
      practiceType: '呼吸穩定力練習',
      backgroundColor: '#FFFFFF',
      completedBadgeColor: 'rgba(90, 206, 135, 0.8)',
      uncompletedBadgeColor: 'rgba(0, 232, 227, 0.2)',
      image: require('./assets/images/呼吸穩定.png'),
      practiceNumber: 1,
    },
    { 
      name: '情緒理解力練習', 
      description: '傾聽內心的聲音，溫柔地與自己對話，找回平靜與力量',
      duration: '3 ~ 5 min', 
      practiceType: '情緒理解力練習',
      backgroundColor: '#FFFFFF',
      completedBadgeColor: 'rgba(90, 206, 135, 0.8)',
      uncompletedBadgeColor: 'rgba(0, 232, 227, 0.2)',
      image: require('./assets/images/情緒理解.png'),
      practiceNumber: 2,
    },
    { 
      name: '自我覺察力練習', 
      description: '適度的自我批評可以讓我們進步，但過度會造成內耗。這個練習幫你以溫暖的方式回應內在聲音',
      duration: '7分鐘', 
      practiceType: '自我覺察力練習',
      backgroundColor: '#FFFFFF',
      completedBadgeColor: 'rgba(90, 206, 135, 0.8)',
      uncompletedBadgeColor: 'rgba(0, 232, 227, 0.2)',
      image: require('./assets/images/自我覺察.png'),
      practiceNumber: 3,
      // tags: ['自責', '自我懷疑', '內耗'], // 適用時機標籤
    },
    { 
      name: '五感練習', 
      description: '「五感覺察」是一個簡單卻重要的情緒調節技巧，也是改變內在的基礎',
      duration: '3 ~ 5 min', 
      practiceType: '五感察覺練習',
      backgroundColor: '#FFFFFF',
      completedBadgeColor: 'rgba(90, 206, 135, 0.8)',
      uncompletedBadgeColor: 'rgba(0, 232, 227, 0.2)',
      image: require('./assets/images/五感察覺.png'),
      practiceNumber: 4,
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

  // 在 App 啟動時檢查登入狀態
  useEffect(() => {
    checkLoginStatus();
  }, []);

  // 監聽 navigation focus 事件
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      checkLoginStatus();
      if (isLoggedIn) {
        loadTodayData();
      }
    });
    return unsubscribe;
  }, [navigation, isLoggedIn]);

  // 登入後載入今日數據
  useEffect(() => {
    if (isLoggedIn && user && !user.isGuest) {
      loadTodayData();
    }
  }, [isLoggedIn, user]);

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
      } else {
        setIsLoggedIn(false);
        setUser(null);
      }
    } catch (error) {
      console.log('未登入或 Token 已過期');
      setIsLoggedIn(false);
      setUser(null);
    }
  };

  // 載入今日數據（心情 + 練習狀態）
  const loadTodayData = async () => {
    try {
      // 載入今日心情
      const moodResponse = await ApiService.getTodayMood();
      if (moodResponse.success && moodResponse.mood) {
        setTodayMoodRecord(moodResponse.mood);
        const moodIndex = moods.findIndex(m => m.name === moodResponse.mood.mood_name);
        if (moodIndex !== -1) {
          setSelectedMood(moodIndex);
        }
      } else {
        setTodayMoodRecord(null);
        setSelectedMood(null);
      }

      // 載入今日練習狀態
      const practiceResponse = await ApiService.getTodayPracticeStatus();
      if (practiceResponse.success) {
        setTodayPracticeStatus(practiceResponse.practices || {});
        
        // 計算完成進度（只計算 completed = true 的練習）
        const completedPractices = Object.values(practiceResponse.practices || {}).filter(
          p => p.completed === true
        );
        setPracticeProgress({ completed: completedPractices.length, total: 4 }); // 總共 4 個練習
      }
    } catch (error) {
      console.error('載入今日數據失敗:', error);
    }
  };

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
          }) }
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
          setSelectedMood(null);
          setTodayMoodRecord(null);
          setTodayPracticeStatus({});
          setPracticeProgress({ completed: 0, total: 4 });
          Alert.alert('已登出', '期待下次再見！');
        }
      }
    ]);
  };

  // 處理心情選擇
  const handleMoodSelect = async (mood, index) => {
    if (showLoginPrompt()) return;

    try {
      setSelectedMood(index);
      
      const response = await ApiService.recordMood(mood.level, mood.name, '');
      
      if (response.success) {
        setTodayMoodRecord({
          mood_level: mood.level,
          mood_name: mood.name,
          recorded_at: new Date().toISOString()
        });
        console.log('✅ 心情記錄成功');
      }
    } catch (error) {
      console.error('記錄心情失敗:', error);
      Alert.alert('錯誤', '心情記錄失敗，請稍後再試');
      if (todayMoodRecord) {
        const originalIndex = moods.findIndex(m => m.name === todayMoodRecord.mood_name);
        setSelectedMood(originalIndex !== -1 ? originalIndex : null);
      } else {
        setSelectedMood(null);
      }
    }
  };

  const navigateToPractice = (practice) => {
    if (showLoginPrompt()) return;
    
    navigation.navigate('Practice', { 
      practiceType: practice.practiceType,
      onPracticeComplete: async (practiceType) => {
        // 練習完成後重新載入今日數據
        console.log('✅ 練習完成，重新載入數據');
        await loadTodayData();
      }
    });
  };

  // 判斷練習是否已完成（只有 completed = true 才算完成）
  const isPracticeCompleted = (practiceType) => {
    const practice = todayPracticeStatus[practiceType];
    return practice && practice.completed === true;
  };

  // 獲取練習進度百分比
  const getPracticeProgress = (practiceType) => {
    const practice = todayPracticeStatus[practiceType];
    if (!practice) return 0;
    if (practice.completed) return 100;
    return practice.progress || 0;
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

  const PracticeCard = ({ practice }) => {
    const isCompleted = isPracticeCompleted(practice.practiceType);
    const progress = getPracticeProgress(practice.practiceType);
    return (
      <View style={styles.practiceCardContainer}>
        <View style={styles.practiceRow}>
          <View
            style={[
              styles.practiceNumberBadge,
              { backgroundColor: isCompleted ? practice.completedBadgeColor : practice.uncompletedBadgeColor }
            ]}
          >
            <Text style={styles.practiceNumberText}>練習{practice.practiceNumber}</Text>
          </View>

          <View style={styles.practiceRightContent}>
            <View style={styles.practiceDescription}>
              <Text style={styles.practiceDescriptionText}>{practice.description}</Text>
              {practice.tags && (
                <View style={styles.tagsContainer}>
                  {practice.tags.map((tag, index) => (
                    <View key={index} style={styles.tagBadge}>
                      <Text style={styles.tagText}>{tag}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>

            <TouchableOpacity
              style={[styles.practiceCard, { backgroundColor: practice.backgroundColor }]}
              onPress={() => navigateToPractice(practice)}
            >
              <View style={styles.practiceImageContainer}>
                <Image source={practice.image} style={styles.practiceImage} resizeMode="contain" />
              </View>

              <View style={styles.practiceContent}>
                <View style={styles.practiceHeader}>
                  <Text style={styles.practiceName}>《{practice.name}》</Text>
                  {practice.difficulty && (
                    <View style={styles.difficultyContainer}>
                      {[...Array(practice.difficulty)].map((_, i) => (
                        <Text key={i} style={styles.difficultyStar}>⭐</Text>
                      ))}
                    </View>
                  )}
                </View>

                {isCompleted ? (
                  <View style={styles.completedContainer}>
                    <Text style={styles.completedIcon}>✓</Text>
                    <Text style={styles.completedText}>完成！</Text>
                  </View>
                ) : (
                  <>
                    <View style={styles.progressContainer}>
                      <View style={styles.progressBarBackground}>
                        <View style={[styles.progressBarForeground, { width: `${progress}%` }]} />
                      </View>
                      {progress > 0 ? (
                        <Text style={styles.progressPercentText}>{progress}%</Text>
                      ) : null}
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
  };

  const TopicButton = ({ topic }) => (
    <TouchableOpacity style={[styles.topicButton, { backgroundColor: topic.color }]}>
      <Text style={styles.topicText}>{topic.name}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="rgba(22, 109, 181, 0.95)" />

      {/* ⭐ 上選單 - 藍色背景 */}
      <View style={styles.blueHeader}>
        <View style={styles.headerLeft}>
          <View style={styles.avatarContainer}>
            <Image 
              source={require('./assets/images/person.png')}
              style={styles.profileAvatar}
              resizeMode="cover"
            />
          </View>
          <View style={styles.headerTextContainer}>
            <Text style={styles.greetingText}>早安！祝您有美好的一天</Text>
            <Text style={styles.userName}>{user?.name || '張三'} player</Text>
          </View>
        </View>
        <View style={styles.headerRight}>
          {/* ⭐ 通知圖標 - 保留原始圖片（含紅點），放大到 32x32 */}
          <TouchableOpacity style={styles.headerIconButton}>
            <Image 
              source={require('./assets/images/new_notify.png')}
              style={styles.headerIconLarge}
              resizeMode="contain"
            />
          </TouchableOpacity>
          {/* ⭐ 設定圖標 - 放大到 32x32 */}
          <TouchableOpacity 
            style={styles.headerIconButton}
            onPress={() => {
              Alert.alert('設定', '設定功能開發中');
            }}
          >
            <Image 
              source={require('./assets/images/setting.png')}
              style={styles.headerIconLarge}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* ⭐ 心情選擇區 - 保持原樣 */}
        <View style={styles.section}>
          <Text style={styles.subGreeting}>來記錄一下目前的心情吧？</Text>

          <View style={styles.moodGrid}>
            {moods.map((mood, index) => (
              <MoodButton
                key={index}
                mood={mood}
                index={index}
                isSelected={selectedMood === index}
                onPress={() => handleMoodSelect(mood, index)}
              />
            ))}
          </View>
        </View>

        {/* ⭐ 每日練習 - 保持舊版樣式 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>每日練習</Text>
          <Text style={styles.sectionSubtitle}>
            今日練習進度 ({practiceProgress.completed}/{practiceProgress.total})
          </Text>

          <View style={styles.practiceList}>
            {dailyPractices.map((practice, index) => (
              <PracticeCard key={index} practice={practice} />
            ))}
          </View>
        </View>

        {/* ⭐ 推薦練習課程 - 保持舊版樣式 */}
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

      {/* ⭐ 底部導航欄 - 使用原始 menu.png，占滿寬度，圖標顏色修正 */}
      <View style={styles.bottomNavContainer}>
        <Image 
          source={require('./assets/images/menu.png')}
          style={styles.menuImage}
          resizeMode="stretch"
        />
        <View style={styles.bottomNav}>
          <TouchableOpacity 
            style={styles.navButton}
            onPress={() => setActiveTab('home')}
          >
            <Image 
              source={require('./assets/images/new_home.png')}
              style={[
                styles.navIcon,
                activeTab === 'home' && styles.navIconActive
              ]}
              resizeMode="contain"
            />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.navButton}
            onPress={() => setActiveTab('explore')}
          >
            <Image 
              source={require('./assets/images/new_explore.png')}
              style={[
                styles.navIcon,
                activeTab === 'explore' && styles.navIconActive
              ]}
              resizeMode="contain"
            />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.centerNavButton}
            onPress={() => {
              Alert.alert('每日打卡', '功能開發中');
            }}
          >
            <Image 
              source={require('./assets/images/daily_clock.png')}
              style={styles.centerNavIcon}
              resizeMode="contain"
            />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.navButton}
            onPress={() => navigation.navigate('Daily')}
          >
            <Image 
              source={require('./assets/images/record.png')}
              style={[
                styles.navIcon,
                activeTab === 'record' && styles.navIconActive
              ]}
              resizeMode="contain"
            />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.navButton}
            onPress={() => {
              if (isLoggedIn && user && !user.isGuest) {
                handleLogout();
              } else {
                navigation.navigate('Login', {
                  onLoginSuccess: (userData) => {
                    setUser(userData);
                    setIsLoggedIn(true);
                  }
                });
              }
            }}
          >
            <Image 
              source={require('./assets/images/new_profile.png')}
              style={[
                styles.navIcon,
                activeTab === 'profile' && styles.navIconActive
              ]}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

// ==========================================
// 練習路由容器
// ==========================================
const PracticeNavigator = ({ route, navigation }) => {
  const { practiceType, onPracticeComplete } = route.params;

  switch (practiceType) {
    case '呼吸穩定力練習':
      return <BreathingPractice navigation={navigation} onComplete={onPracticeComplete} />;
    case '情緒理解力練習':
      return <EmotionPractice navigation={navigation} onComplete={onPracticeComplete} />;
    case '五感察覺練習':
      return <FiveSensesPractice navigation={navigation} onComplete={onPracticeComplete} />;
    case '自我覺察力練習':
      return <SelfAwarenessPractice navigation={navigation} onComplete={onPracticeComplete} />;
    default:
      return <View><Text>未知的練習類型</Text></View>;
  }
};

// ==========================================
// 主應用程式入口
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
        <Stack.Screen name="Practice" component={PracticeScreen} />
        <Stack.Screen name="Daily" component={DailyScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

// ==========================================
// 樣式定義
// ==========================================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  // ⭐ 藍色上選單
  blueHeader: {
    backgroundColor: 'rgba(22, 109, 181, 0.95)',
    paddingHorizontal: 16,
    paddingTop: 45,
    paddingBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarContainer: {
    borderWidth: 2,
    borderColor: '#FFFFFF',
    borderRadius: 8,
    overflow: 'hidden',
  },
  profileAvatar: {
    width: 48,
    height: 48,
  },
  headerTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  greetingText: {
    fontSize: 13,
    color: '#FFFFFF',
    marginBottom: 2,
  },
  userName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIconButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 4,
  },
  // ⭐ 放大的圖標 - 32x32，不加 tintColor（保留原始顏色）
  headerIconLarge: {
    width: 32,
    height: 32,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
    backgroundColor: '#FFFFFF',
    marginBottom: 8,
  },
  subGreeting: {
    fontSize: 16,
    color: '#374151',
    marginBottom: 16,
  },
  moodGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  moodContainer: {
    alignItems: 'center',
  },
  moodButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  moodButtonSelected: {
    transform: [{ scale: 1.1 }],
    borderWidth: 2,
    borderColor: '#3B82F6',
  },
  moodImage: {
    width: 40,
    height: 40,
  },
  moodText: {
    fontSize: 12,
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
    paddingHorizontal: 8,
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
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  tagBadge: {
    backgroundColor: 'rgba(103, 169, 224, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 6,
    marginBottom: 4,
  },
  tagText: {
    fontSize: 11,
    color: 'rgba(103, 169, 224, 0.95)',
    fontWeight: '500',
  },
  practiceCard: {
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3
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
  practiceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  practiceName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
    flex: 1,
  },
  difficultyContainer: {
    flexDirection: 'row',
    marginLeft: 8,
  },
  difficultyStar: {
    fontSize: 10,
    marginLeft: 2,
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
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressBarBackground: {
    flex: 1,
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
  progressPercentText: {
    fontSize: 12,
    color: '#10B981',
    marginLeft: 8,
    fontWeight: '500',
    minWidth: 35,
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
  // ⭐ 底部導航欄 - 使用 menu.png 占滿寬度
  bottomNavContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 94,
  },
  menuImage: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    width: '100%',
    height: 115,
    opacity: 0.90,        
    shadowColor: '#000',   
    shadowOffset: { width: 0, height: -3 }, 
    shadowOpacity: 0.15,   
    shadowRadius: 5,       
    elevation: 8,        
  },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  navButton: {
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // ⭐ 圖標顏色修正：默認藍色，激活時加 40% 透明度的 #40A1DD
  navIcon: {
    width: 34,
    height: 34,
    // 不加 tintColor，保留原始圖片顏色（藍色）
  },
  navIconActive: {
    opacity: 0.4,
    tintColor: '#40A1DD',
  },
  centerNavButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  centerNavIcon: {
    width: 60,
    height: 60,
    bottom: 16,
    left: 2.5,
  },
});