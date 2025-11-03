// ==========================================
// DailyScreen.js (最終修正版)
// 修改：1. 簡化Modal風格 2. 所有欄位都顯示 3. 優化配色
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
  StatusBar,
  Modal,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import ApiService from './api';
import BottomNavigation from './BottomNavigation';

const { width } = Dimensions.get('window');

const DailyScreen = ({ navigation }) => {
  const [timeRange, setTimeRange] = useState('weeks');
  const [allPracticeData, setAllPracticeData] = useState([]);
  const [displayData, setDisplayData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [todayMood, setTodayMood] = useState(null);
  const [todayCompletedPractices, setTodayCompletedPractices] = useState(0);
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    totalPractices: 0,
    totalSeconds: 0,
    practiceTypes: 0,
  });
  
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedPractice, setSelectedPractice] = useState(null);
  
  const hasLoadedData = useRef(false);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchAllData();
    });
    
    if (!hasLoadedData.current) {
      fetchAllData();
    }
    
    return unsubscribe;
  }, [navigation]);

  useEffect(() => {
    if (hasLoadedData.current && allPracticeData.length > 0) {
      filterAndUpdateData();
    }
  }, [timeRange]);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      
      const [practiceResponse, moodResponse, userResponse] = await Promise.all([
        ApiService.getPracticeHistory(),
        ApiService.getTodayMood(),
        ApiService.getUserProfile(),
      ]);
      
      if (practiceResponse.practices) {
        setAllPracticeData(practiceResponse.practices);
        hasLoadedData.current = true;
        
        const filteredData = filterByTimeRange(practiceResponse.practices, timeRange);
        setDisplayData(filteredData);
        calculateStats(filteredData);
        calculateTodayProgress(practiceResponse.practices);
      }
      
      if (moodResponse && moodResponse.mood) {
        setTodayMood(moodResponse.mood);
      }
      
      if (userResponse && userResponse.user) {
        setUser(userResponse.user);
      }
      
    } catch (error) {
      console.error('❌ 獲取數據失敗:', error);
    } finally {
      setLoading(false);
    }
  };

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
    
    const completedTypes = new Set();
    
    practices.forEach(practice => {
      const isCompleted = String(practice.completed) === '1' || practice.completed === 1;
      if (!isCompleted) return;
      
      const practiceDate = practice.completed_at ? 
        practice.completed_at.split(' ')[0] : null;
      
      if (practiceDate === today && requiredPractices.includes(practice.practice_type)) {
        completedTypes.add(practice.practice_type);
      }
    });
    
    setTodayCompletedPractices(completedTypes.size);
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
    const completedPractices = practices.length;
    const totalSeconds = practices.reduce((sum, p) => {
      return sum + (parseInt(p.duration_seconds) || parseInt(p.duration) * 60 || 0);
    }, 0);

    const uniqueTypes = new Set(practices.map(p => p.practice_type));
    const practiceTypes = uniqueTypes.size;

    setStats({
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

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    
    if (mins > 0 && secs > 0) {
      return `${mins}分${secs}秒`;
    } else if (mins > 0) {
      return `${mins}分鐘`;
    } else {
      return `${secs}秒`;
    }
  };

  const formatTotalTime = (seconds) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (days > 0) {
      return `${days}天${hours}小時`;
    } else if (hours > 0) {
      return `${hours}小時${minutes}分`;
    } else if (minutes > 0) {
      return `${minutes}分${secs}秒`;
    } else {
      return `${secs}秒`;
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
      if (practice.reflection && practice.reflection.trim()) {
        summary = practice.reflection.trim();
      } else if (practice.noticed && practice.noticed.trim()) {
        summary = practice.noticed.trim();
      } else if (practice.attention && practice.attention.trim()) {
        summary = practice.attention.trim();
      } else {
        return '暫無記錄';
      }
    } else if (practice.practice_type === '自我覺察力練習') {
      // ⭐ 優先從資料庫欄位讀取，如果沒有才從 form_data 讀取
      let formData = {
        event: practice.noticed || null,  // ✅ 改成 practice
        thought: practice.thought || null,
        mood: practice.feeling || null,
        thoughtOrigin: practice.thought_origin || null,
        thoughtValidity: practice.thought_validity || null,
        thoughtImpact: practice.thought_impact || null,
        responseMethod: practice.response_method || null,
        newResponse: practice.new_response || null,
        finalFeeling: practice.reflection || null,
      };

      // 如果資料庫欄位都是空的，才嘗試從 form_data 讀取
      if (!formData.thought && !formData.event && practice.form_data) {
        try {
          const parsedFormData = typeof practice.form_data === 'string'
            ? JSON.parse(practice.form_data)
            : practice.form_data;
          
          formData = {
            event: parsedFormData.event || formData.event,
            thought: parsedFormData.thought || formData.thought,
            mood: parsedFormData.mood || formData.mood,
            thoughtOrigin: parsedFormData.thoughtOrigin || formData.thoughtOrigin,
            thoughtValidity: parsedFormData.thoughtValidity || formData.thoughtValidity,
            thoughtImpact: parsedFormData.thoughtImpact || formData.thoughtImpact,
            responseMethod: parsedFormData.responseMethod || formData.responseMethod,
            newResponse: parsedFormData.newResponse || formData.newResponse,
            finalFeeling: parsedFormData.finalFeeling || formData.finalFeeling,
          };
        } catch (e) {
          console.log('解析 form_data 失敗:', e);
        }
      }
      
      if (formData?.finalFeeling && formData.finalFeeling.trim()) {
        summary = formData.finalFeeling.trim();
      } else if (formData?.thought && formData.thought.trim()) {
        summary = formData.thought.trim();
      } else if (formData?.event && formData.event.trim()) {
        summary = formData.event.trim();
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

  // ⭐ 完全重新設計的 Modal（簡化風格）
  const renderDetailModal = () => {
    if (!selectedPractice) return null;

    const totalSeconds = parseInt(selectedPractice.duration_seconds) || 
                        parseInt(selectedPractice.duration) * 60 || 0;

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

    // ⭐ 優先從資料庫欄位讀取，如果沒有才從 form_data 讀取
    let formData = {
      event: selectedPractice.noticed || null,
      thought: selectedPractice.thought || null,
      mood: selectedPractice.feeling || null,
      thoughtOrigin: selectedPractice.thought_origin || null,
      thoughtValidity: selectedPractice.thought_validity || null,
      thoughtImpact: selectedPractice.thought_impact || null,
      responseMethod: selectedPractice.response_method || null,
      newResponse: selectedPractice.new_response || null,
      finalFeeling: selectedPractice.reflection || null,
    };

    // 如果資料庫欄位都是空的，才嘗試從 form_data 讀取
    if (!formData.thought && !formData.event && selectedPractice.form_data) {
      try {
        const parsedFormData = typeof selectedPractice.form_data === 'string'
          ? JSON.parse(selectedPractice.form_data)
          : selectedPractice.form_data;
        
        formData = {
          event: parsedFormData.event || formData.event,
          thought: parsedFormData.thought || formData.thought,
          mood: parsedFormData.mood || formData.mood,
          thoughtOrigin: parsedFormData.thoughtOrigin || formData.thoughtOrigin,
          thoughtValidity: parsedFormData.thoughtValidity || formData.thoughtValidity,
          thoughtImpact: parsedFormData.thoughtImpact || formData.thoughtImpact,
          responseMethod: parsedFormData.responseMethod || formData.responseMethod,
          newResponse: parsedFormData.newResponse || formData.newResponse,
          finalFeeling: parsedFormData.finalFeeling || formData.finalFeeling,
        };
      } catch (e) {
        console.log('解析 form_data 失敗:', e);
      }
    }

    // ⭐ 配色方案
    const getColors = () => {
      if (selectedPractice.practice_type === '呼吸穩定力練習') {
        return { primary: '#92C3D8', secondary: '#4F7F96', light: '#E8F4F8' };
      }
      if (selectedPractice.practice_type === '情緒理解力練習') {
        return { primary: '#e3d6ca', secondary: '#8C8275', light: '#F5F0EB' };
      }
      if (selectedPractice.practice_type === '自我覺察力練習') {
        return { primary: '#F1EAE4', secondary: '#D49650', light: '#FAF6F3' };
      }
      if (selectedPractice.practice_type === '正念安定力練習') {
        return { primary: '#ede0dc', secondary: '#b1979e', light: '#F7F2F0' };
      }
      return { primary: '#92C3D8', secondary: '#4F7F96', light: '#E8F4F8' };
    };

    const colors = getColors();

    return (
      <Modal
        visible={detailModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={closeDetailModal}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, { backgroundColor: colors.light }]}>
            {/* Header */}
            <View style={[styles.modalHeader, { backgroundColor: colors.secondary }]}>
              <Text style={styles.modalTitle}>{selectedPractice.practice_type}</Text>
              <TouchableOpacity onPress={closeDetailModal} style={styles.modalCloseButton}>
                <Text style={styles.modalCloseText}>×</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
              {/* 基本資訊 */}
              <View style={styles.simpleInfoSection}>
                <View style={styles.simpleInfoRow}>
                  <Text style={styles.simpleInfoIcon}>📅</Text>
                  <View style={styles.simpleInfoTextBlock}>
                    <Text style={styles.simpleInfoLabel}>完成日期</Text>
                    <Text style={styles.simpleInfoValue}>
                      {formatDate(selectedPractice.completed_at)}
                    </Text>
                  </View>
                </View>

                <View style={styles.simpleDivider} />

                <View style={styles.simpleInfoRow}>
                  <Text style={styles.simpleInfoIcon}>⏱️</Text>
                  <View style={styles.simpleInfoTextBlock}>
                    <Text style={styles.simpleInfoLabel}>投入時間</Text>
                    <Text style={styles.simpleInfoValue}>
                      {formatDuration(totalSeconds)}
                    </Text>
                  </View>
                </View>

                {todayMood && (
                  <>
                    <View style={styles.simpleDivider} />
                    <View style={styles.simpleInfoRow}>
                      <Text style={styles.simpleInfoIcon}>😊</Text>
                      <View style={styles.simpleInfoTextBlock}>
                        <Text style={styles.simpleInfoLabel}>當天心情</Text>
                        <Text style={styles.simpleInfoValue}>{todayMood?.mood_name || '無記錄'}</Text>
                      </View>
                    </View>
                  </>
                )}
              </View>

              {/* ⭐ 呼吸穩定力練習（按順序，所有欄位都顯示） */}
              {selectedPractice.practice_type === '呼吸穩定力練習' && (
                <>
                  <View style={styles.simpleContentCard}>
                    <Text style={styles.simpleContentTitle}>💭 練習的感覺：</Text>
                    <Text style={styles.simpleContentText}>
                      {selectedPractice.feeling || '無記錄'}
                    </Text>
                  </View>

                  <View style={styles.simpleContentCard}>
                    <Text style={styles.simpleContentTitle}>🎨 練習中的發現：</Text>
                    <Text style={styles.simpleContentText}>
                      {selectedPractice.noticed || '無記錄'}
                    </Text>
                  </View>

                  <View style={styles.simpleContentCard}>
                    <Text style={styles.simpleContentTitle}>🎧 想和自己說的話：</Text>
                    <Text style={styles.simpleContentText}>
                      {selectedPractice.reflection || '無記錄'}
                    </Text>
                  </View>
                </>
              )}

              {/* ⭐ 情緒理解力練習（按順序，所有欄位都顯示） */}
              {selectedPractice.practice_type === '情緒理解力練習' && (
                <>
                  <View style={styles.simpleContentCard}>
                    <Text style={styles.simpleContentTitle}>📍 那個時刻</Text>
                    <Text style={styles.simpleContentText}>
                      {emotionData?.what_happened || '無記錄'}
                    </Text>
                  </View>

                  <View style={styles.simpleContentCard}>
                    <Text style={styles.simpleContentTitle}>💭 我的情緒</Text>
                    {emotionData?.selected_emotions && emotionData.selected_emotions.length > 0 ? (
                      <View style={styles.emotionTagsContainer}>
                        {emotionData.selected_emotions.map((emotion, index) => (
                          <View key={index} style={styles.emotionTagSimple}>
                            <Text style={styles.emotionTagTextSimple}>{emotion}</Text>
                          </View>
                        ))}
                      </View>
                    ) : (
                      <Text style={styles.simpleContentText}>無記錄</Text>
                    )}
                  </View>

                  <View style={styles.simpleContentCard}>
                    <Text style={styles.simpleContentTitle}>🫀 身體的感覺</Text>
                    <Text style={styles.simpleContentText}>
                      {emotionData?.body_feeling || '無記錄'}
                    </Text>
                  </View>

                  <View style={styles.simpleContentCard}>
                    <Text style={styles.simpleContentTitle}>🔍 情緒的意義</Text>
                    <Text style={styles.simpleContentText}>
                      {emotionData?.meaning_text || '無記錄'}
                    </Text>
                  </View>

                  <View style={styles.simpleContentCard}>
                    <Text style={styles.simpleContentTitle}>🌟 我的選擇</Text>
                    <Text style={styles.simpleContentText}>
                      {emotionData?.coping_choice ? (
                        emotionData.coping_choice === 'enjoy' ? '我喜歡，要享受它！' :
                        emotionData.coping_choice === 'accept' ? '我雖然不喜歡，但我接納它' :
                        emotionData.coping_choice === 'regulate' ? '我不喜歡，想調節它' : '無記錄'
                      ) : '無記錄'}
                    </Text>
                  </View>
                </>
              )}

              {/* ⭐ 自我覺察力練習（按順序，所有欄位都顯示） */}
              {selectedPractice.practice_type === '自我覺察力練習' && (
                <>
                  {/* 第一部分：那個時刻 */}
                  <View style={styles.simpleContentCard}>
                    <Text style={styles.simpleContentTitle}>📍 那個時刻</Text>
                    
                    <View style={styles.modalSubSection}>
                      <Text style={styles.modalSubLabel}>發生的事件</Text>
                      <Text style={styles.simpleContentText}>
                        {formData?.event || '無記錄'}
                      </Text>
                    </View>

                    <View style={styles.modalSubSection}>
                      <Text style={styles.modalSubLabel}>當下的想法</Text>
                      <Text style={styles.simpleContentText}>
                        {formData?.thought || '無記錄'}
                      </Text>
                    </View>

                    <View style={styles.modalSubSection}>
                      <Text style={styles.modalSubLabel}>心情</Text>
                      <Text style={styles.simpleContentText}>
                        {formData?.mood || '無記錄'}
                      </Text>
                    </View>
                  </View>

                  {/* 第二部分：探索想法 */}
                  <View style={styles.simpleContentCard}>
                    <Text style={styles.simpleContentTitle}>🔍 探索想法</Text>
                    
                    <View style={styles.modalSubSection}>
                      <Text style={styles.modalSubLabel}>想法來源</Text>
                      <Text style={styles.simpleContentText}>
                        {formData?.thoughtOrigin || '無記錄'}
                      </Text>
                    </View>

                    <View style={styles.modalSubSection}>
                      <Text style={styles.modalSubLabel}>真實性檢驗</Text>
                      <Text style={styles.simpleContentText}>
                        {formData?.thoughtValidity || '無記錄'}
                      </Text>
                    </View>

                    <View style={styles.modalSubSection}>
                      <Text style={styles.modalSubLabel}>想法的影響</Text>
                      <Text style={styles.simpleContentText}>
                        {formData?.thoughtImpact || '無記錄'}
                      </Text>
                    </View>
                  </View>

                  {/* 第三部分：我的回應 */}
                  <View style={styles.simpleContentCard}>
                    <Text style={styles.simpleContentTitle}>💭 我的回應</Text>
                    
                    <View style={styles.modalSubSection}>
                      <Text style={styles.modalSubLabel}>回應方式</Text>
                      <View style={styles.responseMethodTag}>
                        <Text style={styles.responseMethodText}>
                          {formData?.responseMethod === 'friend' && '以朋友的角度'}
                          {formData?.responseMethod === 'inner' && '內在支持的聲音'}
                          {formData?.responseMethod === 'future' && '未來的回應方式'}
                          {!formData?.responseMethod && '無記錄'}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.modalSubSection}>
                      <Text style={styles.modalSubLabel}>新的回應</Text>
                      <View style={styles.highlightResponseBox}>
                        <Text style={styles.highlightResponseText}>
                          {formData?.newResponse || '無記錄'}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* 第四部分：練習後的感受 */}
                  <View style={styles.simpleContentCard}>
                    <Text style={styles.simpleContentTitle}>✨ 練習後的感受</Text>
                    <Text style={styles.simpleContentText}>
                      {formData?.finalFeeling || '無記錄'}
                    </Text>
                  </View>
                </>
              )}

              {/* ⭐ 正念安定力練習（按順序，所有欄位都顯示） */}
              {selectedPractice.practice_type === '正念安定力練習' && (
                <>
                  <View style={styles.simpleContentCard}>
                    <Text style={styles.simpleContentTitle}>🌱 練習的觀察：</Text>
                    <Text style={styles.simpleContentText}>
                      {selectedPractice.feeling || '無記錄'}
                    </Text>
                  </View>

                  <View style={styles.simpleContentCard}>
                    <Text style={styles.simpleContentTitle}>🌿 練習中的注意力：</Text>
                    <Text style={styles.simpleContentText}>
                      {selectedPractice.noticed || '無記錄'}
                    </Text>
                  </View>

                  <View style={styles.simpleContentCard}>
                    <Text style={styles.simpleContentTitle}>🌳 練習中的反應：</Text>
                    <Text style={styles.simpleContentText}>
                      {selectedPractice.reflection || '無記錄'}
                    </Text>
                  </View>
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
    const percentage = Math.min(todayCompletedPractices / 3, 1);
    
    // 根據完成數量決定顏色
    let strokeColor = '#E0E0E0'; // 預設灰色
    if (todayCompletedPractices >= 3) {
      strokeColor = '#FFD700'; // 金色
    } else if (todayCompletedPractices === 2) {
      strokeColor = '#FFA500'; // 橙色
    } else if (todayCompletedPractices === 1) {
      strokeColor = '#87CEEB'; // 天藍色
    }

    const radius = 100;
    const centerX = 120;
    const centerY = 120;
    
    // 起點（左邊）
    const startX = centerX - radius;
    const startY = centerY;
    
    // 終點（右邊）
    const endX = centerX + radius;
    const endY = centerY;

    // 計算進度終點位置
    const progressAngle = Math.PI * percentage; // 0 到 π
    const progressEndX = centerX - radius * Math.cos(progressAngle);
    const progressEndY = centerY - radius * Math.sin(progressAngle);
    
    const largeArcFlag = percentage > 0.5 ? 1 : 0;

    return (
      <View style={styles.semiCircleContainer}>
        <Svg height="120" width="240" viewBox="0 0 240 120">
          {/* 背景灰色半圓（完整的半圓） */}
          <Path
            d={`M ${startX},${startY} A ${radius},${radius} 0 0,1 ${endX},${endY}`}
            fill="none"
            stroke="#E0E0E0"
            strokeWidth="16"
            strokeLinecap="round"
          />
          
          {/* 進度彩色半圓（只在有進度時顯示） */}
          {todayCompletedPractices > 0 && (
            <Path
              d={`M ${startX},${startY} A ${radius},${radius} 0 ${largeArcFlag},1 ${progressEndX},${progressEndY}`}
              fill="none"
              stroke={strokeColor}
              strokeWidth="16"
              strokeLinecap="round"
            />
          )}
        </Svg>

        {/* 獎杯圖標 */}
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
            <Text style={styles.statValue}>{stats.totalPractices}</Text>
            <Text style={styles.statLabel}>總練習</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={[styles.statValue, styles.statValueSmaller]} numberOfLines={1} adjustsFontSizeToFit>
              {formatTotalTime(stats.totalSeconds)}
            </Text>
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
                Weeks
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
                Months
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
                Years
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
              const totalSeconds = parseInt(practice.duration_seconds) || 
                                  parseInt(practice.duration) * 60 || 0;

              return (
                <TouchableOpacity
                  key={index}
                  style={styles.recordCard}
                  onPress={() => openDetailModal(practice)}
                >
                  <View style={styles.recordHeader}>
                    <Text style={styles.practiceTypeName}>{practice.practice_type}</Text>
                    <Text style={styles.practiceDuration}>{formatDuration(totalSeconds)}</Text>
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
  statValueSmaller: {
    fontSize: 16,
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
    color: '#386de9',
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
  
  // ==========================================
  // ⭐ Modal 樣式（簡化版 - 參考圖4、5）
  // ==========================================
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
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
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  
  // ⭐ 簡化的基本資訊區域
  simpleInfoSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  simpleInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  simpleInfoIcon: {
    fontSize: 24,
    marginRight: 12,
    width: 30,
  },
  simpleInfoTextBlock: {
    flex: 1,
  },
  simpleInfoLabel: {
    fontSize: 12,
    color: 'rgba(0, 0, 0, 0.5)',
    marginBottom: 4,
  },
  simpleInfoValue: {
    fontSize: 16,
    color: 'rgba(0, 0, 0, 0.85)',
    fontWeight: '600',
  },
  simpleDivider: {
    height: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.08)',
    marginVertical: 8,
  },
  
  // ⭐ 簡化的內容卡片
  simpleContentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  simpleContentTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(0, 0, 0, 0.6)',
    marginBottom: 8,
  },
  simpleContentText: {
    fontSize: 15,
    color: 'rgba(0, 0, 0, 0.8)',
    lineHeight: 24,
  },
  
  // ⭐ 情緒標籤（簡化版）
  emotionTagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  emotionTagSimple: {
    backgroundColor: 'rgba(140, 130, 117, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  emotionTagTextSimple: {
    fontSize: 13,
    color: '#8C8275',
    fontWeight: '500',
  },
  modalSubSection: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.05)',
  },
  modalSubLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(0, 0, 0, 0.5)',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  responseMethodTag: {
    backgroundColor: 'rgba(212, 150, 80, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(212, 150, 80, 0.3)',
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  responseMethodText: {
    fontSize: 13,
    color: '#D49650',
    fontWeight: '600',
  },
  highlightResponseBox: {
    backgroundColor: 'rgba(212, 150, 80, 0.08)',
    borderLeftWidth: 3,
    borderLeftColor: '#D49650',
    borderRadius: 8,
    padding: 12,
    marginTop: 4,
  },
  highlightResponseText: {
    fontSize: 15,
    color: 'rgba(0, 0, 0, 0.8)',
    lineHeight: 22,
    fontStyle: 'italic',
  },
});

export default DailyScreen;