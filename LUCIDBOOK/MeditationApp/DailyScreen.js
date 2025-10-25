// ==========================================
// 檔案名稱: DailyScreen.js (優化版)
// 放置位置: 專案根目錄
// ==========================================

import React, { useState, useEffect, useRef } from 'react';
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
import BottomNavigation from './BottomNavigation';

const { width } = Dimensions.get('window');

const DailyScreen = ({ navigation }) => {
  const [timeRange, setTimeRange] = useState('weeks');
  const [allPracticeData, setAllPracticeData] = useState([]); // 存儲所有數據
  const [displayData, setDisplayData] = useState([]); // 顯示的過濾數據
  const [loading, setLoading] = useState(true);
  const [todayMood, setTodayMood] = useState(null);
  const [todayCompletedPractices, setTodayCompletedPractices] = useState(0);
  const [todayStatus, setTodayStatus] = useState({});
  const [user, setUser] = useState(null); // 添加用戶狀態
  const [stats, setStats] = useState({
    completionRate: 0,
    totalPractices: 0,
    totalSeconds: 0,
    practiceTypes: 0,
  });
  
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedPractice, setSelectedPractice] = useState(null);
  
  // 使用 ref 來追蹤是否已經載入過數據
  const hasLoadedData = useRef(false);

  // 初始載入和頁面聚焦時載入數據
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchAllData();
    });
    
    // 首次載入
    if (!hasLoadedData.current) {
      fetchAllData();
    }
    
    return unsubscribe;
  }, [navigation]);

  // 當時間範圍改變時，只重新過濾數據，不重新請求 API
  useEffect(() => {
    if (hasLoadedData.current && allPracticeData.length > 0) {
      filterAndUpdateData();
    }
  }, [timeRange]);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      
      const [practiceResponse, moodResponse, statusResponse, userResponse] = await Promise.all([
        ApiService.getPracticeHistory(),
        ApiService.getTodayMood(),
        ApiService.getTodayPracticeStatus(),
        ApiService.getUserProfile(), // 添加獲取用戶資料
      ]);
      
      console.log('📊 API 返回的練習記錄:', practiceResponse);
      console.log('✅ API 返回的今日狀態:', statusResponse);
      console.log('👤 API 返回的用戶資料:', userResponse);
      
      if (practiceResponse.practices) {
        // 儲存完整的數據
        setAllPracticeData(practiceResponse.practices);
        hasLoadedData.current = true;
        
        // 過濾並顯示當前時間範圍的數據
        const filteredData = filterByTimeRange(practiceResponse.practices, timeRange);
        console.log('📊 過濾後的記錄:', filteredData);
        setDisplayData(filteredData);
        calculateStats(filteredData);
        calculateTodayProgress(practiceResponse.practices);
      }
      
      if (moodResponse && moodResponse.mood) {
        setTodayMood(moodResponse.mood);
      }
      
      if (statusResponse && statusResponse.practices) {
        setTodayStatus(statusResponse.practices);
      }
      
      if (userResponse && userResponse.user) {
        setUser(userResponse.user); // 設置用戶資料
      }
      
    } catch (error) {
      console.error('❌ 獲取數據失敗:', error);
    } finally {
      setLoading(false);
    }
  };

  // 快速過濾和更新數據（不需要 API 請求）
  const filterAndUpdateData = () => {
    const filteredData = filterByTimeRange(allPracticeData, timeRange);
    setDisplayData(filteredData);
    calculateStats(filteredData);
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

  const filterByTimeRange = (practices, range) => {
    const now = new Date();
    let startDate;

    switch (range) {
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

  const extractReflectionSnippet = (practice) => {
    let summary = '';
    
    if (practice.practice_type === '呼吸穩定力練習') {
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
      
      if (emotionData?.what_happened && emotionData.what_happened.trim()) {
        summary = emotionData.what_happened.trim();
      } else if (emotionData?.body_feeling && emotionData.body_feeling.trim()) {
        summary = emotionData.body_feeling.trim();
      } else if (emotionData?.coping_choice) {
        const copingMap = {
          'enjoy': '我喜歡，要享受它！',
          'accept': '我雖然不喜歡，但我接納它',
          'regulate': '我不喜歡,想調節它'
        };
        summary = copingMap[emotionData.coping_choice] || emotionData.coping_choice;
      } else {
        return '暫無記錄';
      }
    } else if (practice.practice_type === '正念安定力練習') {
      // 優先順序：2, 1, 3
      if (practice.noticed && practice.noticed.trim()) {
        summary = practice.noticed.trim();
      } else if (practice.attention && practice.attention.trim()) {
        summary = practice.attention.trim();
      } else if (practice.reflection && practice.reflection.trim()) {
        summary = practice.reflection.trim();
      } else {
        return '暫無記錄';
      }
    } else {
      if (practice.reflection && practice.reflection.trim()) {
        summary = practice.reflection.trim();
      } else if (practice.noticed && practice.noticed.trim()) {
        summary = practice.noticed.trim();
      } else {
        return '暫無記錄';
      }
    }
    
    const cleaned = summary.trim();
    const sentences = cleaned.split(/[。！？]/);
    const firstSentence = sentences[0].trim();
    
    if (firstSentence.length > 30) {
      return firstSentence.substring(0, 30) + '...';
    }
    
    return firstSentence || '暫無記錄';
  };

  const openDetailModal = (practice) => {
    setSelectedPractice(practice);
    setDetailModalVisible(true);
  };

  const closeDetailModal = () => {
    setDetailModalVisible(false);
    setSelectedPractice(null);
  };

  const renderDetailModal = () => {
    if (!selectedPractice) return null;

    const durationMinutes = Math.round(
      (parseInt(selectedPractice.duration_seconds) || 
       parseInt(selectedPractice.duration) * 60 || 0) / 60
    );

    let emotionData = null;
    if (selectedPractice.emotion_data) {
      try {
        emotionData = typeof selectedPractice.emotion_data === 'string'
          ? JSON.parse(selectedPractice.emotion_data)
          : selectedPractice.emotion_data;
      } catch (e) {
        console.log('解析 emotion_data 失敗:', e);
      }
    }

    const getModalHeaderColor = () => {
      if (selectedPractice.practice_type === '呼吸穩定力練習') return '#619CCE';
      if (selectedPractice.practice_type === '情緒理解力練習') return '#8BC78A';
      if (selectedPractice.practice_type === '正念安定力練習') return '#E5A569';
      return '#619CCE';
    };

    const getEmotionColor = (emotion) => {
      const colorMap = {
        '快樂': '#FFE66D',
        '信任': '#A8DADC',
        '期待': '#F4A261',
        '警覺': '#FF6B6B',
        '悲傷': '#457B9D',
        '厭惡': '#2A9D8F',
        '生氣': '#E76F51',
        '害怕': '#264653',
      };
      return colorMap[emotion] || '#E5E7EB';
    };

    return (
      <Modal
        visible={detailModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={closeDetailModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={[styles.modalHeader, { backgroundColor: getModalHeaderColor() }]}>
              <Text style={styles.modalTitle}>{selectedPractice.practice_type}</Text>
              <TouchableOpacity onPress={closeDetailModal} style={styles.modalCloseButton}>
                <Text style={styles.modalCloseText}>×</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent}>
              <View style={styles.detailSection}>
                <Text style={styles.detailLabel}>完成時間</Text>
                <Text style={styles.detailValue}>
                  {formatDate(selectedPractice.completed_at)}
                </Text>
              </View>

              <View style={styles.detailSection}>
                <Text style={styles.detailLabel}>練習時長</Text>
                <Text style={styles.detailValue}>{durationMinutes} 分鐘</Text>
              </View>

              {selectedPractice.practice_type === '呼吸穩定力練習' && (
                <>
                  {selectedPractice.attention && (
                    <View style={[styles.detailCard, { backgroundColor: '#F0F9FF' }]}>
                      <Text style={styles.detailCardTitle}>1. 注意力放在哪裡？</Text>
                      <Text style={styles.detailCardContent}>{selectedPractice.attention}</Text>
                    </View>
                  )}

                  {selectedPractice.noticed && (
                    <View style={[styles.detailCard, { backgroundColor: '#F0FDF4' }]}>
                      <Text style={styles.detailCardTitle}>2. 你注意到了什麼？</Text>
                      <Text style={styles.detailCardContent}>{selectedPractice.noticed}</Text>
                    </View>
                  )}

                  {selectedPractice.feeling && (
                    <View style={[styles.detailCard, { backgroundColor: '#FFF7ED' }]}>
                      <Text style={styles.detailCardTitle}>3. 身體感覺</Text>
                      <Text style={styles.detailCardContent}>{selectedPractice.feeling}</Text>
                    </View>
                  )}

                  {selectedPractice.reflection && (
                    <View style={[styles.detailCard, { backgroundColor: '#FEF3C7' }]}>
                      <Text style={styles.detailCardTitle}>4. 練習後的想法</Text>
                      <Text style={styles.detailCardContent}>{selectedPractice.reflection}</Text>
                    </View>
                  )}
                </>
              )}

              {selectedPractice.practice_type === '情緒理解力練習' && emotionData && (
                <>
                  {emotionData.what_happened && (
                    <View style={[styles.detailCard, { backgroundColor: '#F0F9FF' }]}>
                      <Text style={styles.detailCardTitle}>1. 發生了什麼事？</Text>
                      <Text style={styles.detailCardContent}>{emotionData.what_happened}</Text>
                    </View>
                  )}

                  {emotionData.emotions && emotionData.emotions.length > 0 && (
                    <View style={[styles.detailCard, { backgroundColor: '#F0FDF4' }]}>
                      <Text style={styles.detailCardTitle}>2. 你的情緒</Text>
                      <View style={styles.emotionTagsContainer}>
                        {emotionData.emotions.map((emotion, index) => (
                          <View
                            key={index}
                            style={[
                              styles.emotionTag,
                              {
                                backgroundColor: getEmotionColor(emotion),
                                borderColor: getEmotionColor(emotion),
                              },
                            ]}
                          >
                            <Text style={[styles.emotionTagText, { color: '#1F2937' }]}>
                              {emotion}
                            </Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  )}

                  {emotionData.body_feeling && (
                    <View style={[styles.detailCard, { backgroundColor: '#FFF7ED' }]}>
                      <Text style={styles.detailCardTitle}>3. 身體的感覺</Text>
                      <Text style={styles.detailCardContent}>{emotionData.body_feeling}</Text>
                    </View>
                  )}

                  {emotionData.coping_choice && (
                    <View style={[styles.detailCard, { backgroundColor: '#FEF3C7' }]}>
                      <Text style={styles.detailCardTitle}>4. 你的選擇</Text>
                      <Text style={styles.detailCardContent}>
                        {emotionData.coping_choice === 'enjoy' && '我喜歡，要享受它！'}
                        {emotionData.coping_choice === 'accept' && '我雖然不喜歡，但我接納它'}
                        {emotionData.coping_choice === 'regulate' && '我不喜歡，想調節它'}
                      </Text>
                    </View>
                  )}

                  {emotionData.coping_strategy && (
                    <View style={[styles.detailCard, { backgroundColor: '#FCE7F3' }]}>
                      <Text style={styles.detailCardTitle}>5. 調節策略</Text>
                      <Text style={styles.detailCardContent}>{emotionData.coping_strategy}</Text>
                    </View>
                  )}
                </>
              )}

              {selectedPractice.practice_type === '正念安定力練習' && (
                <>
                  {selectedPractice.attention && (
                    <View style={[styles.detailCard, { backgroundColor: '#F0F9FF' }]}>
                      <Text style={styles.detailCardTitle}>1. 注意力放在哪裡？</Text>
                      <Text style={styles.detailCardContent}>{selectedPractice.attention}</Text>
                    </View>
                  )}

                  {selectedPractice.noticed && (
                    <View style={[styles.detailCard, { backgroundColor: '#F0FDF4' }]}>
                      <Text style={styles.detailCardTitle}>2. 你注意到了什麼？</Text>
                      <Text style={styles.detailCardContent}>{selectedPractice.noticed}</Text>
                    </View>
                  )}

                  {selectedPractice.reflection && (
                    <View style={[styles.detailCard, { backgroundColor: '#FEF3C7' }]}>
                      <Text style={styles.detailCardTitle}>3. 練習後的想法</Text>
                      <Text style={styles.detailCardContent}>{selectedPractice.reflection}</Text>
                    </View>
                  )}
                </>
              )}

              <View style={styles.bottomPadding} />
            </ScrollView>
          </View>
        </View>
      </Modal>
    );
  };

  const renderSemiCircle = () => {
    const percentage = todayCompletedPractices / 3;
    const angle = Math.PI * percentage;

    const radius = 100;
    const centerX = 120;
    const centerY = 120;

    const startX = centerX - radius;
    const startY = centerY;

    const endX = centerX + radius * Math.cos(Math.PI - angle);
    const endY = centerY - radius * Math.sin(Math.PI - angle);

    const largeArcFlag = angle > Math.PI / 2 ? 1 : 0;

    let strokeColor;
    if (todayCompletedPractices === 3) {
      strokeColor = '#FFD700';
    } else if (todayCompletedPractices === 2) {
      strokeColor = '#FFA500';
    } else if (todayCompletedPractices === 1) {
      strokeColor = '#87CEEB';
    } else {
      strokeColor = '#E0E0E0';
    }

    return (
      <View style={styles.semiCircleContainer}>
        <Svg height="120" width="240" viewBox="0 0 240 120">
          <Path
            d={`M ${startX} ${startY} A ${radius} ${radius} 0 0 1 ${centerX + radius} ${startY}`}
            fill="none"
            stroke="#E0E0E0"
            strokeWidth="16"
            strokeLinecap="round"
          />
          {angle > 0 && (
            <Path
              d={`M ${startX} ${startY} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${endX} ${endY}`}
              fill="none"
              stroke={strokeColor}
              strokeWidth="16"
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

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#619CCE" />
        <Text style={{ marginTop: 16, color: '#6B7280' }}>載入中...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#619CCE" />

      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Image
            source={require('./assets/images/person.png')}
            style={styles.profileAvatar}
            resizeMode="cover"
          />
          <View style={styles.headerTextContainer}>
            <Text style={styles.greetingText}>你好</Text>
            <Text style={styles.userName}>{user?.name || '張三'} player</Text>
          </View>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.headerIconButton}>
            <Image
              source={require('./assets/images/new_notify.png')}
              style={styles.headerIconLarge}
              resizeMode="contain"
            />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerIconButton}>
            <Image
              source={require('./assets/images/setting.png')}
              style={styles.headerIconLarge}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.progressSection}>
          {renderSemiCircle()}
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{stats.completionRate}%</Text>
            <Text style={styles.statLabel}>完成率</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{stats.totalPractices}</Text>
            <Text style={styles.statLabel}>總練習</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{formatTotalTime(stats.totalSeconds)}</Text>
            <Text style={styles.statLabel}>總時長</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{stats.practiceTypes}</Text>
            <Text style={styles.statLabel}>練習種類</Text>
          </View>
        </View>

        <View style={styles.timeRangeContainer}>
          <View style={styles.timeRangeBackground}>
            <TouchableOpacity
              style={[styles.timeButton, timeRange === 'weeks' && styles.timeButtonActive]}
              onPress={() => setTimeRange('weeks')}
            >
              <Text
                style={[
                  styles.timeButtonText,
                  timeRange === 'weeks' && styles.timeButtonTextActive,
                ]}
              >
                7天
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.timeButton, timeRange === 'months' && styles.timeButtonActive]}
              onPress={() => setTimeRange('months')}
            >
              <Text
                style={[
                  styles.timeButtonText,
                  timeRange === 'months' && styles.timeButtonTextActive,
                ]}
              >
                30天
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.timeButton, timeRange === 'years' && styles.timeButtonActive]}
              onPress={() => setTimeRange('years')}
            >
              <Text
                style={[
                  styles.timeButtonText,
                  timeRange === 'years' && styles.timeButtonTextActive,
                ]}
              >
                365天
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.recordsSection}>
          <Text style={styles.recordsTitle}>練習記錄</Text>
          {displayData.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>此時間範圍內暫無記錄</Text>
            </View>
          ) : (
            displayData.map((practice, index) => {
              const durationMinutes = Math.round(
                (parseInt(practice.duration_seconds) || 
                 parseInt(practice.duration) * 60 || 0) / 60
              );

              return (
                <TouchableOpacity
                  key={index}
                  style={styles.recordCard}
                  onPress={() => openDetailModal(practice)}
                >
                  <View style={styles.recordHeader}>
                    <Text style={styles.practiceTypeName}>{practice.practice_type}</Text>
                    <Text style={styles.practiceDuration}>{durationMinutes} 分鐘</Text>
                  </View>

                  <View style={styles.recordInfo}>
                    <Text style={styles.recordDate}>
                      {formatDate(practice.completed_at)}
                    </Text>
                  </View>

                  <View style={styles.recordReflection}>
                    <Text style={styles.reflectionText} numberOfLines={2}>
                      {extractReflectionSnippet(practice)}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })
          )}
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>

      {renderDetailModal()}
      <BottomNavigation navigation={navigation} currentRoute="Daily" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    backgroundColor: '#619CCE',
    paddingTop: 48,
    paddingBottom: 16,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
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
  headerIconLarge: {
    width: 32,
    height: 32,
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