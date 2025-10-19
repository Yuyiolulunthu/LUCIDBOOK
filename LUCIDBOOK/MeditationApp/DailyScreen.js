import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Dimensions,
  Image,
  ActivityIndicator,
  TextInput,
  StatusBar,
  Modal,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import ApiService from './api';

const { width } = Dimensions.get('window');

const DailyScreen = ({ navigation }) => {
  const [timeRange, setTimeRange] = useState('weeks');
  const [practiceData, setPracticeData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('tasks');
  const [todayMood, setTodayMood] = useState(null);
  const [todayCompletedPractices, setTodayCompletedPractices] = useState(0);
  const [todayStatus, setTodayStatus] = useState({});
  const [stats, setStats] = useState({
    completionRate: 0,
    totalPractices: 0,
    totalSeconds: 0,
    practiceTypes: 0,
  });
  
  // ⭐ 新增：詳情模態框狀態
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedPractice, setSelectedPractice] = useState(null);

  useEffect(() => {
    fetchAllData();
  }, [timeRange]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchAllData();
    });
    return unsubscribe;
  }, [navigation, timeRange]);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      
      const [practiceResponse, moodResponse, statusResponse] = await Promise.all([
        ApiService.getPracticeHistory(),
        ApiService.getTodayMood(),
        ApiService.getTodayPracticeStatus(),
      ]);
      
      console.log('📊 API 返回的練習記錄:', practiceResponse);
      console.log('✅ API 返回的今日狀態:', statusResponse);
      
      if (practiceResponse.practices) {
        const filteredData = filterByTimeRange(practiceResponse.practices);
        console.log('📊 過濾後的記錄:', filteredData);
        setPracticeData(filteredData);
        calculateStats(filteredData);
        calculateTodayProgress(practiceResponse.practices);
      }
      
      if (moodResponse && moodResponse.mood) {
        setTodayMood(moodResponse.mood);
      }
      
      if (statusResponse && statusResponse.practices) {
        setTodayStatus(statusResponse.practices);
      }
      
    } catch (error) {
      console.error('❌ 獲取數據失敗:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateTodayProgress = (practices) => {
    const requiredPractices = ['呼吸穩定力練習', '情緒理解力練習', '五感覺察練習'];
    
    const now = new Date();
    const offset = 8 * 60;
    const localTime = new Date(now.getTime() + offset * 60 * 1000);
    const today = localTime.toISOString().split('T')[0];
    
    console.log('📅 今天的日期（台灣時區）:', today);
    
    const completedTypes = new Set();
    
    practices.forEach(practice => {
      const isCompleted = String(practice.completed) === '1' || practice.completed === 1;
      if (!isCompleted) {
        return;
      }
      
      const practiceDate = practice.completed_at ? 
        practice.completed_at.split(' ')[0] : null;
      
      console.log('🔍 檢查練習:', {
        type: practice.practice_type,
        practiceDate,
        today,
        isToday: practiceDate === today,
        isRequired: requiredPractices.includes(practice.practice_type)
      });
      
      if (practiceDate === today && requiredPractices.includes(practice.practice_type)) {
        completedTypes.add(practice.practice_type);
        console.log('✅ 加入今日完成:', practice.practice_type);
      }
    });
    
    const completedCount = completedTypes.size;
    console.log(`✅ 今日完成的必要練習: ${completedCount}/3`, Array.from(completedTypes));
    setTodayCompletedPractices(completedCount);
  };

  const filterByTimeRange = (practices) => {
    const now = new Date();
    let startDate;

    switch (timeRange) {
      case 'weeks':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'months':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case 'years':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    }

    const filtered = practices.filter(practice => {
      const practiceDate = new Date(practice.completed_at);
      const isInRange = practiceDate >= startDate;
      const isCompleted = String(practice.completed) === '1' || practice.completed === 1;
      
      return isInRange && isCompleted;
    }).sort((a, b) => new Date(b.completed_at + 'Z') - new Date(a.completed_at + 'Z'));
    
    return filtered;
  };

  const calculateStats = (practices) => {
    const now = new Date();
    let daysInRange;

    switch (timeRange) {
      case 'weeks':
        daysInRange = 7;
        break;
      case 'months':
        daysInRange = 30;
        break;
      case 'years':
        daysInRange = 365;
        break;
      default:
        daysInRange = 7;
    }

    const expectedPractices = daysInRange * 3;
    const completedPractices = practices.length;
    const completionRate = Math.min((completedPractices / expectedPractices) * 100, 100);

    const totalSeconds = practices.reduce((sum, p) => {
      return sum + (parseInt(p.duration_seconds) || parseInt(p.duration) * 60 || 0);
    }, 0);

    const uniqueTypes = new Set(practices.map(p => p.practice_type));
    const practiceTypes = uniqueTypes.size;

    setStats({
      completionRate: Math.round(completionRate),
      totalPractices: completedPractices,
      totalSeconds,
      practiceTypes,
    });
  };

  const formatDateToLocal = (dateString) => {
    if (!dateString) return '';
    
    const parts = dateString.split(/[- :]/);
    const year = parseInt(parts[0]);
    const month = parseInt(parts[1]) - 1;
    const day = parseInt(parts[2]);
    const hours = parseInt(parts[3]);
    const minutes = parseInt(parts[4]);
    
    const period = hours >= 12 ? '下午' : '上午';
    const displayHours = hours % 12 || 12;
    
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')} ${period}${displayHours}:${String(minutes).padStart(2, '0')}`;
  };

  const formatDate = (dateString) => {
    const localTime = formatDateToLocal(dateString);
    const [datePart, timePart] = localTime.split(' ');
    const [year, month, day] = datePart.split('-');
    
    return `${parseInt(month)}月${parseInt(day)}日, ${year} ${timePart}`;
  };

  const formatTotalTime = (seconds) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (days === 0) {
      let result = '';
      if (hours > 0) result += `${hours}小時`;
      if (minutes > 0) result += `${minutes}分`;
      if (secs > 0 || (hours === 0 && minutes === 0)) result += `${secs}秒`;
      return result || '0秒';
    } else {
      let result = '';
      if (days > 0) result += `${days}天`;
      if (hours > 0) result += `${hours}小時`;
      if (minutes > 0) result += `${minutes}分`;
      return result;
    }
  };

  // ⭐ 修改：根據練習類型和優先順序提取摘要
  const extractReflectionSnippet = (practice) => {
    let summary = '';
    
    if (practice.practice_type === '呼吸穩定力練習') {
      // 優先順序: reflection > noticed > feeling > "空"
      if (practice.reflection && practice.reflection.trim()) {
        summary = practice.reflection.trim();
      } else if (practice.noticed && practice.noticed.trim()) {
        summary = practice.noticed.trim();
      } else if (practice.feeling && practice.feeling.trim()) {
        summary = practice.feeling.trim();
      } else {
        return '暫無記錄';
      }
    } else if (practice.practice_type === '情緒理解力練習') {
      // 解析 emotion_data
      let emotionData = null;
      if (practice.emotion_data) {
        try {
          emotionData = typeof practice.emotion_data === 'string' 
            ? JSON.parse(practice.emotion_data) 
            : practice.emotion_data;
        } catch (e) {
          console.log('解析 emotion_data 失敗:', e);
        }
      }
      
      // 優先順序: what_happened > body_feeling > coping_choice > "空"
      if (emotionData?.what_happened && emotionData.what_happened.trim()) {
        summary = emotionData.what_happened.trim();
      } else if (emotionData?.body_feeling && emotionData.body_feeling.trim()) {
        summary = emotionData.body_feeling.trim();
      } else if (emotionData?.coping_choice) {
        const copingMap = {
          'enjoy': '我喜歡，要享受它！',
          'accept': '我雖然不喜歡，但我接納它',
          'regulate': '我不喜歡，想調節它'
        };
        summary = copingMap[emotionData.coping_choice] || emotionData.coping_choice;
      } else {
        return '暫無記錄';
      }
    } else {
      // 其他練習類型
      if (practice.reflection && practice.reflection.trim()) {
        summary = practice.reflection.trim();
      } else if (practice.noticed && practice.noticed.trim()) {
        summary = practice.noticed.trim();
      } else {
        return '暫無記錄';
      }
    }
    
    // 截斷長文本
    const cleaned = summary.trim();
    const sentences = cleaned.split(/[。！？]/);
    const firstSentence = sentences[0].trim();
    
    if (firstSentence.length > 30) {
      return firstSentence.substring(0, 30) + '...';
    }
    
    return firstSentence;
  };

  // ⭐ 新增：點擊記錄卡片，顯示詳情
  const handlePracticeCardPress = (practice) => {
    setSelectedPractice(practice);
    setDetailModalVisible(true);
  };

  // ⭐ 新增：渲染練習詳情模態框
  const renderPracticeDetailModal = () => {
    if (!selectedPractice) return null;
    
    const isBreathing = selectedPractice.practice_type === '呼吸穩定力練習';
    const isEmotion = selectedPractice.practice_type === '情緒理解力練習';
    
    // 顏色配置
    const primaryColor = isBreathing ? 'rgba(46, 134, 171, 0.75)' : 'rgba(150, 134, 118, 1)';
    const lightBg = isBreathing ? 'rgba(46, 134, 171, 0.1)' : 'rgba(150, 134, 118, 0.1)';
    
    // 解析情緒數據
    let emotionData = null;
    if (isEmotion && selectedPractice.emotion_data) {
      try {
        emotionData = typeof selectedPractice.emotion_data === 'string'
          ? JSON.parse(selectedPractice.emotion_data)
          : selectedPractice.emotion_data;
      } catch (e) {
        console.log('解析 emotion_data 失敗:', e);
        emotionData = {}; // 確保有一個空對象
      }
    }
    
    // 格式化時間
    const formatDuration = (durationSeconds) => {
      const seconds = parseInt(durationSeconds) || 0;
      if (seconds === 0) {
        const mins = parseInt(selectedPractice.duration) || 0;
        return `${mins}分`;
      }
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      if (mins === 0) return `${secs}秒`;
      return `${mins}分${secs}秒`;
    };
    
    return (
      <Modal
        visible={detailModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setDetailModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={[styles.modalHeader, { backgroundColor: primaryColor }]}>
              <Text style={styles.modalTitle}>{selectedPractice.practice_type}</Text>
              <TouchableOpacity 
                onPress={() => setDetailModalVisible(false)}
                style={styles.modalCloseButton}
              >
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
              {/* 基本資訊 */}
              <View style={styles.detailSection}>
                <Text style={styles.detailLabel}>📅 完成日期</Text>
                <Text style={styles.detailValue}>{formatDate(selectedPractice.completed_at)}</Text>
              </View>
              
              <View style={styles.detailSection}>
                <Text style={styles.detailLabel}>⏱️ 投入時間</Text>
                <Text style={styles.detailValue}>{formatDuration(selectedPractice.duration_seconds)}</Text>
              </View>
              
              <View style={styles.detailSection}>
                <Text style={styles.detailLabel}>💭 當天心情</Text>
                <Text style={styles.detailValue}>{selectedPractice.feeling || '無記錄'}</Text>
              </View>
              
              {/* ⭐ 呼吸穩定力練習的記錄 - 所有卡片都顯示 */}
              {isBreathing && (
                <>
                  <View style={[styles.detailCard, { backgroundColor: lightBg }]}>
                    <Text style={styles.detailCardTitle}>練習後的感覺</Text>
                    <Text style={styles.detailCardContent}>
                      {selectedPractice.feeling || '無記錄'}
                    </Text>
                  </View>
                  
                  <View style={[styles.detailCard, { backgroundColor: lightBg }]}>
                    <Text style={styles.detailCardTitle}>練習中的發現</Text>
                    <Text style={styles.detailCardContent}>
                      {selectedPractice.noticed || '無記錄'}
                    </Text>
                  </View>
                  
                  <View style={[styles.detailCard, { backgroundColor: lightBg }]}>
                    <Text style={styles.detailCardTitle}>想對自己說的話</Text>
                    <Text style={styles.detailCardContent}>
                      {selectedPractice.reflection || '無記錄'}
                    </Text>
                  </View>
                </>
              )}
              
              {/* ⭐ 情緒理解力練習的記錄 - 所有卡片都顯示 */}
              {isEmotion && (
                <>
                  <View style={[styles.detailCard, { backgroundColor: lightBg }]}>
                    <Text style={styles.detailCardTitle}>📍 那個時刻</Text>
                    <Text style={styles.detailCardContent}>
                      {emotionData?.moment || emotionData?.what_happened
                        ? `${emotionData.moment || ''}${emotionData.moment && emotionData.what_happened ? '，' : ''}${emotionData.what_happened || ''}`
                        : '無記錄'}
                    </Text>
                  </View>
                  
                  <View style={[styles.detailCard, { backgroundColor: lightBg }]}>
                    <Text style={styles.detailCardTitle}>💭 我的情緒</Text>
                    {emotionData?.selected_emotions && emotionData.selected_emotions.length > 0 ? (
                      <View style={styles.emotionTagsContainer}>
                        {emotionData.selected_emotions.map((emotion, index) => (
                          <View key={index} style={[styles.emotionTag, { borderColor: primaryColor }]}>
                            <Text style={[styles.emotionTagText, { color: primaryColor }]}>{emotion}</Text>
                          </View>
                        ))}
                      </View>
                    ) : (
                      <Text style={styles.detailCardContent}>無記錄</Text>
                    )}
                  </View>
                  
                  <View style={[styles.detailCard, { backgroundColor: lightBg }]}>
                    <Text style={styles.detailCardTitle}>🫀 身體的感覺</Text>
                    <Text style={styles.detailCardContent}>
                      {emotionData?.body_feeling || '無記錄'}
                    </Text>
                  </View>
                  
                  <View style={[styles.detailCard, { backgroundColor: lightBg }]}>
                    <Text style={styles.detailCardTitle}>🔍 情緒的意義</Text>
                    <Text style={styles.detailCardContent}>
                      {emotionData?.meaning_text || '無記錄'}
                    </Text>
                  </View>
                  
                  <View style={[styles.detailCard, { backgroundColor: lightBg }]}>
                    <Text style={styles.detailCardTitle}>🌟 我的選擇</Text>
                    {emotionData?.coping_choice ? (
                      <>
                        <Text style={[styles.detailCardContent, { fontWeight: '600', color: primaryColor, marginBottom: 8 }]}>
                          {emotionData.coping_choice === 'enjoy' && '我喜歡，要享受它！'}
                          {emotionData.coping_choice === 'accept' && '我雖然不喜歡，但我接納它'}
                          {emotionData.coping_choice === 'regulate' && '我不喜歡，想調節它'}
                        </Text>
                        <Text style={styles.detailCardContent}>
                          {emotionData.enjoy_message || emotionData.accept_reminder || emotionData.regulate_text || '無記錄'}
                        </Text>
                      </>
                    ) : (
                      <Text style={styles.detailCardContent}>無記錄</Text>
                    )}
                  </View>
                </>
              )}
              
              <View style={{ height: 40 }} />
            </ScrollView>
          </View>
        </View>
      </Modal>
    );
  };

  const SemiCircleProgress = ({ completedCount }) => {
    const size = 200;
    const strokeWidth = 16;
    const radius = (size - strokeWidth) / 2;
    const center = size / 2;

    const startAngle = 270;
    const endAngle = 90;
    
    const percentage = (completedCount / 3) * 100;
    const progressAngle = startAngle + (180 * percentage / 100);

    return (
      <View style={styles.semiCircleContainer}>
        <Svg width={size} height={size / 2 + strokeWidth / 2 + 10}>
          <Path
            d={describeArc(center, center, radius, startAngle, endAngle)}
            fill="none"
            stroke="rgba(97, 156, 206, 0.3)"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
          {percentage > 0 && (
            <Path
              d={describeArc(center, center, radius, startAngle, Math.min(progressAngle, endAngle))}
              fill="none"
              stroke="rgba(22, 109, 181, 0.95)"
              strokeWidth={strokeWidth}
              strokeLinecap="round"
            />
          )}
        </Svg>
        <View style={styles.semiCircleContent}>
          <Image 
            source={require('./assets/images/champion.png')}
            style={styles.championImage}
            resizeMode="contain"
          />
        </View>
      </View>
    );
  };

  const describeArc = (x, y, radius, startAngle, endAngle) => {
    const start = polarToCartesian(x, y, radius, startAngle);
    const end = polarToCartesian(x, y, radius, endAngle);
    
    let angleDiff = endAngle - startAngle;
    if (angleDiff < 0) angleDiff += 360;
    
    const largeArcFlag = angleDiff > 180 ? "1" : "0";
    
    return [
      "M", start.x, start.y,
      "A", radius, radius, 0, largeArcFlag, 1, end.x, end.y
    ].join(" ");
  };

  const polarToCartesian = (centerX, centerY, radius, angleInDegrees) => {
    const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
    return {
      x: centerX + (radius * Math.cos(angleInRadians)),
      y: centerY + (radius * Math.sin(angleInRadians))
    };
  };

  const TimeRangeButton = ({ label, value }) => (
    <TouchableOpacity
      style={[
        styles.timeButton,
        timeRange === value && styles.timeButtonActive
      ]}
      onPress={() => setTimeRange(value)}
    >
      <Text style={[
        styles.timeButtonText,
        timeRange === value && styles.timeButtonTextActive
      ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  const PracticeRecordCard = ({ practice }) => {
    const localDate = formatDateToLocal(practice.completed_at);
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    const practiceDate = localDate.split(' ')[0];
    const isToday = practiceDate === todayStr;

    const formatDuration = (durationSeconds) => {
      const seconds = parseInt(durationSeconds) || 0;
      
      if (seconds === 0) {
        const mins = parseInt(practice.duration) || 0;
        return `${mins}分`;
      }
      
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      
      if (mins === 0) {
        return `${secs}秒`;
      }
      
      return `${mins}分${secs}秒`;
    };
    
    return (
      <TouchableOpacity 
        style={styles.recordCard}
        onPress={() => handlePracticeCardPress(practice)}
        activeOpacity={0.7}
      >
        <View style={styles.recordHeader}>
          <Text style={styles.practiceTypeName}>{practice.practice_type}</Text>
          <Text style={styles.practiceDuration}>
            {formatDuration(practice.duration_seconds)}
          </Text>
        </View>
        
        <View style={styles.recordInfo}>
          <Text style={styles.recordDate}>
            {formatDate(practice.completed_at)}
            {isToday && todayMood && `, 心情: ${todayMood.mood_name}`}
            {!isToday && practice.feeling && `, 心情: ${practice.feeling}`}
          </Text>
        </View>

        <View style={styles.recordReflection}>
          <Text style={styles.reflectionText}>
            {extractReflectionSnippet(practice)}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="rgba(22, 109, 181, 0.95)" />
        <Text style={styles.loadingText}>載入中...</Text>
      </View>
    );
  }

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

      <View style={styles.titleContainer}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.pageTitle}>日記成果</Text>
        <TouchableOpacity style={styles.menuButton}>
          <View style={styles.menuLine} />
          <View style={styles.menuLine} />
          <View style={styles.menuLine} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.progressSection}>
          <SemiCircleProgress completedCount={todayCompletedPractices} />
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{stats.totalPractices}</Text>
            <Text style={styles.statLabel}>總練心數</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>
              {formatTotalTime(stats.totalSeconds)}
            </Text>
            <Text style={styles.statLabel}>練心時間</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{stats.practiceTypes}</Text>
            <Text style={styles.statLabel}>心理能力</Text>
          </View>
        </View>

        <View style={styles.timeRangeContainer}>
          <View style={styles.timeRangeBackground}>
            <TimeRangeButton label="Weeks" value="weeks" />
            <TimeRangeButton label="Months" value="months" />
            <TimeRangeButton label="Years" value="years" />
          </View>
        </View>

        <View style={styles.recordsSection}>
          <Text style={styles.recordsTitle}>練習紀錄</Text>
          
          {practiceData.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>
                {timeRange === 'weeks' ? '本週' : timeRange === 'months' ? '本月' : '今年'}尚無練習記錄
              </Text>
            </View>
          ) : (
            practiceData.map((practice, index) => (
              <PracticeRecordCard key={practice.id || index} practice={practice} />
            ))
          )}
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* ⭐ 詳情模態框 */}
      {renderPracticeDetailModal()}

      <View style={styles.bottomNav}>
        <TouchableOpacity
          style={[styles.navButton, activeTab === 'home' && styles.navButtonActive]}
          onPress={() => {
            setActiveTab('home');
            navigation.navigate('Home');
          }}
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
          onPress={() => setActiveTab('profile')}
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
    paddingTop: 0,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6B7280',
  },
  headerContainer: {
    backgroundColor: 'rgba(22, 109, 181, 0.95)',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 16,
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
  titleContainer: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  backButtonText: {
    fontSize: 24,
    color: '#111827',
    fontWeight: '300',
  },
  pageTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
    textAlign: 'center',
  },
  menuButton: {
    width: 24,
    height: 24,
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  menuLine: {
    width: 24,
    height: 2,
    backgroundColor: '#111827',
    borderRadius: 1,
  },
  scrollView: {
    flex: 1,
  },
  progressSection: {
    alignItems: 'center',
    paddingVertical: 30,
    paddingTop: 30,
    backgroundColor: '#FFFFFF',
  },
  semiCircleContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'flex-start',
    height: 120,
    marginTop: 10,
  },
  semiCircleContent: {
    position: 'absolute',
    bottom: -5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  championImage: {
    width: 70,
    height: 70,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 16,
    paddingVertical: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  statBox: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#484848',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  timeRangeContainer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
  },
  timeRangeBackground: {
    flexDirection: 'row',
    backgroundColor: 'rgba(97, 156, 206, 0.3)',
    borderRadius: 8,
    padding: 4,
  },
  timeButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  timeButtonActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
  },
  timeButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  timeButtonTextActive: {
    color: '#111827',
    fontWeight: '600',
  },
  recordsSection: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  recordsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#9CA3AF',
  },
  recordCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  recordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  practiceTypeName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
  },
  practiceDuration: {
    fontSize: 14,
    fontWeight: '600',
    color: '#386de9ff',
  },
  recordInfo: {
    marginBottom: 12,
  },
  recordDate: {
    fontSize: 13,
    color: '#646464',
    lineHeight: 18,
  },
  recordReflection: {
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 6,
  },
  reflectionText: {
    fontSize: 13,
    color: '#374151',
    lineHeight: 20,
  },
  bottomPadding: {
    height: 100,
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
  // ⭐ 新增：詳情模態框樣式
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#f5f5f5',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '85%',
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    flex: 1,
  },
  modalCloseButton: {
    padding: 4,
  },
  modalCloseText: {
    fontSize: 24,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  modalContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  detailSection: {
    marginBottom: 16,
  },
  detailLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 16,
    color: '#111827',
    fontWeight: '600',
  },
  detailCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  detailCardTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  detailCardContent: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 22,
  },
  emotionTagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  emotionTag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1.5,
    marginRight: 8,
    marginBottom: 8,
  },
  emotionTagText: {
    fontSize: 13,
    fontWeight: '500',
  },
});

export default DailyScreen;