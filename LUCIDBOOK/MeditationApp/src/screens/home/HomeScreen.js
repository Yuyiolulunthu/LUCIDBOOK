// ==========================================
// 檔案名稱: src/screens/home/HomeScreen.js
// 首頁畫面 - 包含心情記錄、每日練習、探索主題
// ==========================================

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Dimensions,
  StatusBar,
  Image,
  Alert,
} from 'react-native';
import ApiService from '../../../api';
import BottomNavigation from '../../navigation/BottomNavigation';

const { width } = Dimensions.get('window');

// ==========================================
// 主畫面組件 (Home - 單個練習)
// ==========================================
const HomeScreen = ({ navigation }) => {
  // ========== 狀態管理 ==========
  const [selectedMood, setSelectedMood] = useState(null);
  const [todayMoodRecord, setTodayMoodRecord] = useState(null);
  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [todayPracticeStatus, setTodayPracticeStatus] = useState({});
  const [practiceProgress, setPracticeProgress] = useState({ completed: 0, total: 4 });

  // ========== 資料定義 ==========
  
  // 心情選項
  const moods = [
    { name: '超讚!', image: require('../../../assets/images/perfect.png'), color: 'rgba(199, 239, 238, 0.15)', level: 5 },
    { name: '還不錯', image: require('../../../assets/images/not bad.png'), color: 'rgba(199, 239, 238, 0.15)', level: 4 },
    { name: '普普通通', image: require('../../../assets/images/normal.png'), color: 'rgba(199, 239, 238, 0.15)', level: 3 },
    { name: '不太好', image: require('../../../assets/images/not good.png'), color: 'rgba(199, 239, 238, 0.15)', level: 2 },
    { name: '很糟!', image: require('../../../assets/images/terrible.png'), color: 'rgba(199, 239, 238, 0.15)', level: 1 }
  ];

  // 每日練習列表
  const dailyPractices = [
    { 
      name: '呼吸穩定力練習', 
      description: '邀請你給自己一段時間，讓我們陪你，一步一步讓我們一起靜下來慢呼吸',
      duration: '5分鐘', 
      practiceType: '呼吸穩定力練習',
      backgroundColor: '#FFFFFF',
      completedBadgeColor: 'rgba(90, 206, 135, 0.8)',
      uncompletedBadgeColor: 'rgba(0, 232, 227, 0.2)',
      image: require('../../../assets/images/呼吸穩定.png'),
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
      image: require('../../../assets/images/情緒理解.png'),
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
      image: require('../../../assets/images/自我覺察.png'),
      practiceNumber: 3,
    },
    { 
      name: '正念安定力練習',
      description: '立刻幫助平復焦慮、放鬆身體與心情，也在長期中深入觀察自己的內在狀態',
      duration: '10分鐘',
      practiceType: '正念安定力練習',
      backgroundColor: '#FFFFFF',
      completedBadgeColor: 'rgba(90, 206, 135, 0.8)',
      uncompletedBadgeColor: 'rgba(0, 232, 227, 0.2)',
      image: require('../../../assets/images/正念安定.png'),
      practiceNumber: 4,
    },
    { 
      name: '好事書寫練習', 
      description: '記住做不好的事情是大腦的原廠設定，用好事書寫改變負向對話的神經迴路',
      duration: '10分鐘', 
      practiceType: '好事書寫',
      backgroundColor: '#FFFFFF',
      completedBadgeColor: 'rgba(90, 206, 135, 0.8)',
      uncompletedBadgeColor: 'rgba(0, 232, 227, 0.2)',
      image: require('../../../assets/images/好事發生.png'),
      practiceNumber: 5,
    },
  ];

  // 探索主題
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

  // ========== 生命週期 ==========
  
  // 組件初始載入時檢查登入狀態
  useEffect(() => {
    checkLoginStatus();
  }, []);

  // 當頁面獲得焦點時重新載入數據
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      checkLoginStatus();
      if (isLoggedIn) {
        loadTodayData();
      }
    });
    return unsubscribe;
  }, [navigation, isLoggedIn]);

  // 登入狀態改變時載入數據
  useEffect(() => {
    if (isLoggedIn && user && !user.isGuest) {
      loadTodayData();
    }
  }, [isLoggedIn, user]);

  // ========== 核心功能函數 ==========
  
  /**
   * 檢查用戶登入狀態
   */
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

  /**
   * 載入今日數據（心情記錄 + 練習狀態）
   */
  const loadTodayData = async () => {
    try {
      // 載入今日心情記錄
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
        
        // 計算完成的練習數量
        const completedPractices = Object.values(practiceResponse.practices || {}).filter(
          p => p.completed === true
        );
        setPracticeProgress({ completed: completedPractices.length, total: 4 });
      }
    } catch (error) {
      console.error('載入今日數據失敗:', error);
    }
  };

  /**
   * 顯示登入提示（用於未登入用戶）
   */
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

  /**
   * 處理登出
   */
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

  /**
   * 處理心情選擇
   */
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
      // 恢復原始選擇
      if (todayMoodRecord) {
        const originalIndex = moods.findIndex(m => m.name === todayMoodRecord.mood_name);
        setSelectedMood(originalIndex !== -1 ? originalIndex : null);
      } else {
        setSelectedMood(null);
      }
    }
  };

  /**
   * 導航到練習頁面
   */
  const navigateToPractice = (practice) => {
    if (showLoginPrompt()) return;
    
    navigation.navigate('PracticeNavigator', { 
      practiceType: practice.practiceType,
      onPracticeComplete: async (practiceType) => {
        console.log('✅ 練習完成，重新載入數據');
        await loadTodayData();
      }
    });
  };

  /**
   * 檢查練習是否已完成
   */
  const isPracticeCompleted = (practiceType) => {
    const practice = todayPracticeStatus[practiceType];
    return practice && practice.completed === true;
  };

  /**
   * 獲取練習進度百分比
   */
  const getPracticeProgress = (practiceType) => {
    const practice = todayPracticeStatus[practiceType];
    if (!practice) return 0;
    if (practice.completed) return 100;
    return practice.progress || 0;
  };

  // ========== 子組件 ==========
  
  /**
   * 心情按鈕組件
   */
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

  /**
   * 練習卡片組件
   */
  const PracticeCard = ({ practice, onPress }) => {
    const isCompleted = isPracticeCompleted(practice.practiceType);
    const progress = getPracticeProgress(practice.practiceType);

    return (
      <View style={styles.practiceCardContainer}>
        <View style={styles.practiceRow}>
          {/* 練習編號徽章 */}
          <View 
            style={[
              styles.practiceNumberBadge,
              { backgroundColor: isCompleted ? practice.completedBadgeColor : practice.uncompletedBadgeColor }
            ]}
          >
            <Text style={styles.practiceNumberText}>{practice.practiceNumber}</Text>
          </View>
          
          {/* 右側內容 */}
          <View style={styles.practiceRightContent}>
            {/* 練習描述 */}
            <View style={styles.practiceDescription}>
              <Text style={styles.practiceDescriptionText}>{practice.description}</Text>
            </View>
            
            {/* 練習卡片主體 */}
            <TouchableOpacity
              onPress={onPress}
              style={[styles.practiceCard, { backgroundColor: practice.backgroundColor }]}
            >
              {/* 練習圖標 */}
              <View style={styles.practiceImageContainer}>
                <Image 
                  source={practice.image}
                  style={styles.practiceImage}
                  resizeMode="contain"
                />
              </View>
              
              {/* 練習內容 */}
              <View style={styles.practiceContent}>
                <View style={styles.practiceHeader}>
                  <Text style={styles.practiceName}>{practice.name}</Text>
                </View>
                
                {/* 根據狀態顯示不同內容 */}
                {isCompleted ? (
                  // 已完成
                  <View style={styles.completedContainer}>
                    <Text style={styles.completedIcon}>✓</Text>
                    <Text style={styles.completedText}>已完成</Text>
                  </View>
                ) : progress > 0 ? (
                  // 進行中
                  <View style={styles.progressContainer}>
                    <View style={styles.progressBarBackground}>
                      <View style={[styles.progressBarForeground, { width: `${progress}%` }]} />
                    </View>
                    <Text style={styles.progressPercentText}>{progress}%</Text>
                  </View>
                ) : (
                  // 未開始
                  <View style={styles.durationContainer}>
                    <Text style={styles.durationIcon}>⏱</Text>
                    <Text style={styles.durationText}>{practice.duration}</Text>
                  </View>
                )}
              </View>
              
              {/* 播放按鈕 */}
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

  // ========== 主渲染 ==========
  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <ScrollView style={styles.scrollView}>
        {/* ========== 頁首區域 ========== */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <Text style={styles.greeting}>早安</Text>
            <TouchableOpacity 
              style={styles.profileButton}
              onPress={() => {
                if (isLoggedIn) {
                  navigation.navigate('Profile', {
                    user: user,
                    onLogout: handleLogout
                  });
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
              <Text style={styles.profileIcon}>👤</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.username}>
            {isLoggedIn && user ? user.name : '訪客'}
          </Text>
        </View>

        {/* ========== 心情記錄區域 ========== */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>今天感覺如何？</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false} 
            style={styles.moodScroll}
          >
            {moods.map((mood, index) => (
              <MoodButton
                key={index}
                mood={mood}
                index={index}
                isSelected={selectedMood === index}
                onPress={() => handleMoodSelect(mood, index)}
              />
            ))}
          </ScrollView>
        </View>

        {/* ========== 每日練習區域 ========== */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>每日練習</Text>
          <Text style={styles.sectionSubtitle}>
            完成 {practiceProgress.completed} / {practiceProgress.total} 個練習
          </Text>
          <View style={styles.practiceList}>
            {dailyPractices.map((practice, index) => (
              <PracticeCard
                key={index}
                practice={practice}
                onPress={() => navigateToPractice(practice)}
              />
            ))}
          </View>
        </View>

        {/* ========== 探索主題區域 ========== */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>探索主題</Text>
          <View style={styles.topicsScrollContainer}>
            <View style={styles.topicsGrid}>
              {[0, 1].map(rowIndex => (
                <View key={rowIndex} style={styles.topicsRow}>
                  {topics.slice(rowIndex * 4, (rowIndex + 1) * 4).map((topic, index) => (
                    <TouchableOpacity
                      key={index}
                      style={[styles.topicButton, { backgroundColor: topic.color }]}
                    >
                      <Text style={styles.topicText}>{topic.name}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* 底部留白（避免被底部導航遮擋） */}
        <View style={styles.bottomPadding} />
      </ScrollView>
      
      {/* 底部導航 */}
      <BottomNavigation navigation={navigation} activeTab="home" />
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
  
  // ===== 頁首樣式 =====
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 24,
    backgroundColor: '#FFFFFF',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  greeting: {
    fontSize: 16,
    color: '#6B7280',
  },
  username: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  profileButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileIcon: {
    fontSize: 20,
  },
  
  // ===== 區塊樣式 =====
  section: {
    paddingHorizontal: 20,
    paddingVertical: 16,
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
  
  // ===== 心情選擇樣式 =====
  moodScroll: {
    marginTop: 8,
  },
  moodContainer: {
    alignItems: 'center',
    marginRight: 16,
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
    transform: [{ scale: 0.95 }],
    borderWidth: 3,
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
  
  // ===== 練習卡片樣式 =====
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
  
  // 已完成狀態
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
  
  // 進度條
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
  
  // 時長顯示
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
  
  // 播放按鈕
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
  
  // ===== 探索主題樣式 =====
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
  
  // ===== 其他 =====
  bottomPadding: {
    height: 100,
  },
});

export default HomeScreen;