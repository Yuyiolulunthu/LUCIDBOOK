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
  Alert,
} from 'react-native';
import PracticeScreen from './practice';

const { width } = Dimensions.get('window');

// 登入頁面組件
const LoginScreen = ({ onLogin, onBack }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('錯誤', '請輸入電子郵件和密碼');
      return;
    }

    setIsLoading(true);
    // 模擬登入延遲
    setTimeout(() => {
      setIsLoading(false);
      if (email && password) {
        onLogin({ email, name: email.split('@')[0] });
      } else {
        Alert.alert('登入失敗', '請檢查您的電子郵件和密碼');
      }
    }, 1000);
  };

  const handleGuestLogin = () => {
    onLogin({ email: 'guest@example.com', name: 'Guest' });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F9FAFB" />
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header with back button */}
        <View style={styles.loginHeader}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Text style={styles.backButtonText}>← 返回</Text>
          </TouchableOpacity>
        </View>

        {/* Login Content */}
        <View style={styles.loginContainer}>
          <View style={styles.logoContainer}>
            <Text style={styles.logoEmoji}>🧘‍♀️</Text>
            <Text style={styles.logoText}>心靈冥想</Text>
            <Text style={styles.logoSubtext}>找到內心的平靜</Text>
          </View>

          <View style={styles.formContainer}>
            <Text style={styles.formTitle}>登入您的帳戶</Text>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>電子郵件</Text>
              <TextInput
                style={styles.textInput}
                value={email}
                onChangeText={setEmail}
                placeholder="請輸入您的電子郵件"
                placeholderTextColor="#9CA3AF"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>密碼</Text>
              <TextInput
                style={styles.textInput}
                value={password}
                onChangeText={setPassword}
                placeholder="請輸入您的密碼"
                placeholderTextColor="#9CA3AF"
                secureTextEntry
              />
            </View>

            <TouchableOpacity style={styles.forgotPassword}>
              <Text style={styles.forgotPasswordText}>忘記密碼？</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
              onPress={handleLogin}
              disabled={isLoading}
            >
              <Text style={styles.loginButtonText}>
                {isLoading ? '登入中...' : '登入'}
              </Text>
            </TouchableOpacity>

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>或</Text>
              <View style={styles.dividerLine} />
            </View>

            <TouchableOpacity 
              style={styles.guestButton}
              onPress={handleGuestLogin}
            >
              <Text style={styles.guestButtonText}>以訪客身份繼續</Text>
            </TouchableOpacity>

            <View style={styles.signupContainer}>
              <Text style={styles.signupText}>還沒有帳戶？</Text>
              <TouchableOpacity>
                <Text style={styles.signupLink}>立即註冊</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const MeditationApp = () => {
  const [selectedMood, setSelectedMood] = useState(null);
  const [activeTab, setActiveTab] = useState('home');
  const [currentView, setCurrentView] = useState('home'); // 'home', 'practice', 'login'
  const [practiceType, setPracticeType] = useState('');
  const [user, setUser] = useState(null); // 用戶狀態
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const moods = [
    { name: 'Good', emoji: '😊', color: '#E0F2FE' },
    { name: 'Ecstatic', emoji: '😸', color: '#FEF3C7' },
    { name: 'Depressed', emoji: '😔', color: '#FEF3C7' },
    { name: 'Normal', emoji: '😐', color: '#E0F2FE' },
    { name: 'Tearful', emoji: '😢', color: '#F1F5F9' },
    { name: 'Annoyed', emoji: '😤', color: '#E6FFFA' }
  ];

  const dailyPractices = [
    { 
      name: '呼吸覺定力練習', 
      completed: true, 
      duration: '5分鐘', 
      icon: '🧘‍♀️',
      practiceType: '呼吸覺定力練習',
      iconBg: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    },
    { 
      name: '五感察覺練習', 
      completed: false, 
      duration: '8分鐘', 
      icon: '🌟',
      practiceType: '五感察覺練習',
      iconBg: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
    },
    { 
      name: '情緒舒緩練習', 
      completed: false, 
      duration: '10分鐘', 
      icon: '💆‍♀️',
      practiceType: '情緒舒緩練習',
      iconBg: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
    }
  ];

  const topics = [
    { name: '拖延症', color: '#FEF3C7', icon: '⏰' },
    { name: '感情問題', color: '#FCE7F3', icon: '💕' },
    { name: '課業焦慮', color: '#EFF6FF', icon: '📚' },
    { name: '社交恐懼', color: '#F0F9FF', icon: '❄️' }
  ];

  // 導航到登入頁面
  const navigateToLogin = () => {
    setCurrentView('login');
  };

  // 導航到練習頁面
  const navigateToPractice = (type) => {
    if (!isLoggedIn) {
      Alert.alert('請先登入', '您需要登入才能開始練習', [
        { text: '取消', style: 'cancel' },
        { text: '登入', onPress: navigateToLogin }
      ]);
      return;
    }
    setPracticeType(type);
    setCurrentView('practice');
  };

  // 處理登入
  const handleLogin = (userData) => {
    setUser(userData);
    setIsLoggedIn(true);
    setCurrentView('home');
    Alert.alert('登入成功', `歡迎回來，${userData.name}！`);
  };

  // 處理登出
  const handleLogout = () => {
    Alert.alert('確認登出', '您確定要登出嗎？', [
      { text: '取消', style: 'cancel' },
      { 
        text: '登出', 
        style: 'destructive',
        onPress: () => {
          setUser(null);
          setIsLoggedIn(false);
          setCurrentView('home');
        }
      }
    ]);
  };

  // 返回主頁
  const navigateToHome = () => {
    setCurrentView('home');
    setPracticeType('');
  };

  // 如果當前視圖是登入頁面
  if (currentView === 'login') {
    return (
      <LoginScreen 
        onLogin={handleLogin}
        onBack={navigateToHome}
      />
    );
  }

  // 如果當前視圖是練習頁面，顯示練習組件
  if (currentView === 'practice') {
    return (
      <PracticeScreen 
        practiceType={practiceType}
        onBack={navigateToHome}
      />
    );
  }

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
    <View style={styles.practiceCardContainer}>
      {/* Progress Indicator */}
      <View style={styles.progressIndicator}>
        <View style={[styles.progressDot, practice.completed && styles.progressDotCompleted]} />
        {index < dailyPractices.length - 1 && <View style={styles.progressLine} />}
      </View>
      
      {/* Practice Card */}
      <TouchableOpacity 
        style={styles.practiceCard}
        onPress={() => navigateToPractice(practice.practiceType)}
      >
        <View style={[styles.practiceIcon, { backgroundColor: practice.completed ? '#10B981' : '#E0F2FE' }]}>
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
    </View>
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
          
          {/* Login/Logout Button */}
          <View style={styles.userSection}>
            {isLoggedIn ? (
              <View style={styles.userInfo}>
                <Text style={styles.userName}>歡迎，{user?.name}</Text>
                <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
                  <Text style={styles.logoutButtonText}>登出</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity onPress={navigateToLogin} style={styles.loginPromptButton}>
                <Text style={styles.loginPromptText}>登入</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Greeting and Mood Section */}
        <View style={styles.section}>
          <Text style={styles.greeting}>
            哈囉！{isLoggedIn ? user?.name : 'Guest'} player
          </Text>
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
          <Text style={styles.sectionSubtitle}>今日練習進度 (0/3)</Text>
          
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
          onPress={() => {
            if (isLoggedIn) {
              setActiveTab('profile');
            } else {
              navigateToLogin();
            }
          }}
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
    marginBottom: 12,
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
  userSection: {
    alignItems: 'center',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    backgroundColor: 'white',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  userName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
  },
  logoutButton: {
    backgroundColor: '#EF4444',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  logoutButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  loginPromptButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  loginPromptText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  // Login Screen Styles
  loginHeader: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  backButton: {
    alignSelf: 'flex-start',
  },
  backButtonText: {
    fontSize: 16,
    color: '#3B82F6',
  },
  loginContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 40,
  },
  logoEmoji: {
    fontSize: 80,
    marginBottom: 16,
  },
  logoText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  logoSubtext: {
    fontSize: 16,
    color: '#6B7280',
  },
  formContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 24,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#111827',
    backgroundColor: '#F9FAFB',
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
  forgotPasswordText: {
    fontSize: 14,
    color: '#3B82F6',
  },
  loginButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 24,
  },
  loginButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  loginButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  dividerText: {
    paddingHorizontal: 16,
    fontSize: 14,
    color: '#6B7280',
  },
  guestButton: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 24,
  },
  guestButtonText: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '500',
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signupText: {
    fontSize: 14,
    color: '#6B7280',
    marginRight: 4,
  },
  signupLink: {
    fontSize: 14,
    color: '#3B82F6',
    fontWeight: '500',
  },
  // Original styles continue...
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
    paddingLeft: 24,
  },
  practiceCardContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  progressIndicator: {
    alignItems: 'center',
    marginRight: 16,
    marginTop: 32,
  },
  progressDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#93C5FD',
    marginBottom: 8,
  },
  progressDotCompleted: {
    backgroundColor: '#10B981',
  },
  progressLine: {
    width: 2,
    height: 60,
    backgroundColor: '#E0F2FE',
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
    flex: 1,
  },
  practiceIcon: {
    width: 64,
    height: 64,
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
    backgroundColor: '#9cc1e0',
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    paddingHorizontal: 16,
    paddingBottom: 34,
  },
  navButton: {
    padding: 12,
    borderRadius: 8,
  },
  navButtonActive: {
    backgroundColor: '#9cc1e0',
  },
  navIcon: {
    fontSize: 24,
  },
});

export default MeditationApp;