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
  Image,
  Alert,
} from 'react-native';
import PracticeScreen from './practice';

const { width, height } = Dimensions.get('window');

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
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="rgba(22, 109, 181, 0.95)" />
      
      <View style={styles.loginHeaderContainer}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>← 返回</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.loginContainer}>
          <View style={styles.logoContainer}>
            <Image 
              source={require('./assets/images/lucidbook.png')}
              style={styles.logoImage}
              resizeMode="contain"
            />
            <Text style={styles.logoText}>LucidBook</Text>
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
    </View>
  );
};

const MeditationApp = () => {
  const [selectedMood, setSelectedMood] = useState(null);
  const [activeTab, setActiveTab] = useState('home');
  const [currentView, setCurrentView] = useState('home');
  const [practiceType, setPracticeType] = useState('');
  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

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
      completed: true, 
      duration: '5分鐘', 
      practiceType: '呼吸覺定力練習',
      backgroundColor: '#FFFFFF',
      badgeColor: 'rgba(90, 206, 135, 0.8)',
      image: require('./assets/images/呼吸穩定.png'),
      practiceNumber: 1,
      progressValue: 1.0
    },
    { 
      name: '情緒理解力練習', 
      description: '傾聽內心的聲音，溫柔地與自己對話，找回平靜與力量',
      completed: false, 
      duration: '3 ~ 5 min', 
      practiceType: '情緒舒緩練習',
      backgroundColor: '#FFFFFF',
      badgeColor: 'rgba(0, 232, 227, 0.2)',
      image: require('./assets/images/情緒理解.png'),
      practiceNumber: 2,
      progressValue: 0.4
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
      progressValue: 0.2
    }
  ];

  // 更多主題按鈕，支持水平滑動
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

  // 登入相關函數 - 只在Guest時顯示彈窗
  const showLoginPrompt = () => {
    if (!isLoggedIn || (user && user.name === 'Guest')) {
      Alert.alert(
        '需要登入',
        '請登入以享受完整的冥想體驗',
        [
          { text: '取消', style: 'cancel' },
          { text: '登入', onPress: () => setCurrentView('login') }
        ]
      );
    }
  };

  const handleLogin = (userData) => {
    setUser(userData);
    setIsLoggedIn(true);
    setCurrentView('home');
    Alert.alert('登入成功', `歡迎回來，${userData.name}！`);
  };

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

  const navigateToPractice = (type) => {
    if (!isLoggedIn || (user && user.name === 'Guest')) {
      showLoginPrompt();
      return;
    }
    setPracticeType(type);
    setCurrentView('practice');
  };

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

  // 如果當前視圖是練習頁面
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
        <Image 
          source={mood.image}
          style={styles.moodImage}
          resizeMode="contain"
        />
      </TouchableOpacity>
      <Text style={styles.moodText}>{mood.name}</Text>
    </View>
  );

  const PracticeCard = ({ practice, index }) => (
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
      
      {/* Header - 移除SafeAreaView，直接擴展到頂部 */}
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
          
          {/* 垂直排列的主題按鈕，支持水平滑動 */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.topicsScrollContainer}>
            <View style={styles.topicsGrid}>
              {/* 第一列 */}
              <View style={styles.topicsRow}>
                {topics.slice(0, 2).map((topic, index) => (
                  <TopicButton key={index} topic={topic} />
                ))}
              </View>
              {/* 第二列 */}
              <View style={styles.topicsRow}>
                {topics.slice(2, 4).map((topic, index) => (
                  <TopicButton key={index + 2} topic={topic} />
                ))}
              </View>
            </View>
            
            {/* 更多主題按鈕 */}
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

          {/* Journey Progress Card 和 加號按鈕的容器 */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.journeyScrollContainer}>
            {/* 繼續探索旅途卡片 - 更小尺寸 */}
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
            
            {/* 獨立的加號按鈕 */}
            <TouchableOpacity style={styles.independentAddButton}>
              <Text style={styles.independentAddIcon}>+</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Bottom Navigation */}
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
            if (isLoggedIn && user?.name !== 'Guest') {
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    paddingTop: 0, // 移除頂部間距，讓內容延伸到狀態欄
  },
  // Header 擴展到頂部，移除白色空白
  headerContainer: {
    backgroundColor: 'rgba(22, 109, 181, 0.95)',
    paddingHorizontal: 16,
    paddingTop: 50, // 為狀態欄留出空間
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
  // Login Screen 縮小版Header
  loginHeaderContainer: {
    backgroundColor: 'rgba(22, 109, 181, 0.95)',
    paddingHorizontal: 16,
    paddingTop: 50, // 為狀態欄留出空間
    paddingBottom: 8,  // 縮小底部間距
  },
  // Login Screen Styles
  backButton: {
    alignSelf: 'flex-start',
    paddingVertical: 8,
  },
  backButtonText: {
    fontSize: 16,
    color: 'white',
    fontWeight: '500',
  },
  loginContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 20,    // 縮小頂部間距
    marginBottom: 30, // 縮小底部間距
  },
  logoImage: {
    width: 80,        // 圖片寬度
    height: 80,       // 圖片高度
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
    color: 'rgba(22, 109, 181, 0.95)',
  },
  loginButton: {
    backgroundColor: 'rgba(22, 109, 181, 0.95)',
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
    color: 'rgba(22, 109, 181, 0.95)',
    fontWeight: '500',
  },
  // 主要內容樣式
  section: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  greeting: {
    fontSize: 20,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 8,
    marginTop: 16,
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
    width: (width - 32 - 40) / 5,  // 調整寬度計算
    marginBottom: 12,
  },
  moodButton: {
    width: 60,   // 放大按鈕
    height: 60,  // 放大按鈕
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
    width: 45,   // 放大表情符號圖片
    height: 45,  // 放大表情符號圖片
  },
  moodText: {
    fontSize: 13,  // 放大文字
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
  // 新的主題按鈕布局 - 垂直排列，支持水平滑動
  topicsScrollContainer: {
    marginBottom: 16,
  },
  topicsGrid: {
    paddingRight: 2,
  },
  topicsRow: {
    flexDirection: 'row',
    marginBottom: 8,
    justifyContent: 'space-between',  // 統一間距
  },
  topicButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    minWidth: 80,
    alignItems: 'center',
    flex: 1,           // 平均分配空間
    marginHorizontal: 4, // 統一橫向間距
  },
  topicText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  // 探索旅途區域 - 支持水平滑動
  journeyScrollContainer: {
    marginBottom: 16,
  },
  // 更小的繼續探索旅途卡片
  journeyCardWrapper: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    overflow: 'hidden',
    height: 100,  // 進一步縮小高度
    width: 280,   // 縮小寬度
    flexDirection: 'row',
    marginRight: 20,
  },
  journeyImageSection: {
    width: 140,   // 放大圖片區域寬度
    height: '100%',
  },
  journeyMainImage: {
    width: '100%',
    height: '100%',
  },
  journeyTextSection: {
    position: 'absolute',
    left: 150,   // 改為左側位置，在圖片右邊
    top: 25,     // 垂直居中
    alignItems: 'flex-start',  // 改為左對齊
  },
  journeyTitle: {
    fontSize: 12,   // 進一步縮小字體
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
    width: 80,    // 縮小進度條
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
    fontSize: 10,   // 縮小字體
    color: '#374151',
  },
  // 獨立的加號按鈕
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
    width: 34,    // 圖片寬度
    height: 34,   // 圖片高度
    tintColor: '#FFFFFF',  // 白色色調
  },
});

export default MeditationApp;