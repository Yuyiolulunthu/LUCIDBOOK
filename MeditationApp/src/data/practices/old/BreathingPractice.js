// BreathingPractice.js - 完整修正版（總結頁面顯示實際連續天數）
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Animated,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import ApiService from '../../../../api';

// ⭐ 統一練習類型名稱
const PRACTICE_TYPE = '呼吸穩定力練習';

const BreathingPractice = ({ navigation, route }) => {
  // ============================================
  // 狀態管理
  // ============================================
  
  // 練習流程控制
  const [currentStep, setCurrentStep] = useState(0);
  const scrollViewRef = useRef(null);

  // ⭐ API 串接狀態
  const [practiceId, setPracticeId] = useState(null);
  const [startTime, setStartTime] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const hasInitialized = useRef(false);

  // 表單數據
  const [formData, setFormData] = useState({
    feeling: '',
    noticed: '',
    reflection: '',
  });

  // 關鍵詞追蹤
  const [noticedKeywords, setNoticedKeywords] = useState([]);
  const [noticedText, setNoticedText] = useState('');

  // ⭐ 練習統計狀態（新增）
  const [practiceStats, setPracticeStats] = useState({
    currentStreak: 0,
    totalDays: 0,
    loading: false,
  });

  // 動畫值
  const breatheAnim = useRef(new Animated.Value(1)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  const previousScreen = route?.params?.from;

  // ============================================
  // 練習步驟定義
  // ============================================

  const steps = [
    {
      id: 'intro',
      title: '呼吸練習',
      description: '透過簡單的呼吸練習，\n幫助你穩定情緒、找回平靜',
      showProgress: false,
    },
    {
      id: 'guide',
      title: '練習指引',
      content: [
        '找一個舒適的姿勢坐下',
        '閉上眼睛，專注在呼吸上',
        '深深吸氣，慢慢吐氣',
        '重複這個過程，讓心靜下來',
      ],
      showProgress: true,
    },
    {
      id: 'breathing',
      title: '開始呼吸',
      instruction: '跟著圓圈的節奏\n深呼吸',
      showProgress: true,
    },
    {
      id: 'form',
      title: '練習後的感受',
      fields: [
        {
          key: 'feeling',
          label: '練習後，你的感受如何？',
          placeholder: '例如：感覺比較平靜了、身體放鬆了...',
          multiline: true,
        },
        {
          key: 'noticed',
          label: '在練習中，你注意到什麼？',
          placeholder: '例如：注意到呼吸的節奏、身體的緊繃感...',
          multiline: true,
          trackKeywords: true,
        },
        {
          key: 'reflection',
          label: '有什麼想記錄的嗎？（選填）',
          placeholder: '記錄你的想法...',
          multiline: true,
          optional: true,
        },
      ],
      showProgress: true,
    },
    {
      id: 'summary',
      title: '完成練習',
      hasSummary: true,
      showProgress: true,
    },
  ];

  // ============================================
  // ⭐ API 串接函數
  // ============================================

  // 初始化練習
  const initializePractice = async () => {
    if (hasInitialized.current) {
      console.log('⚠️ [呼吸練習] 已經初始化過，跳過');
      return;
    }

    hasInitialized.current = true;
    console.log('🚀 [呼吸練習] 開始初始化...');

    try {
      const response = await ApiService.startPractice(PRACTICE_TYPE);
      console.log('📥 [呼吸練習] 後端回應:', JSON.stringify(response, null, 2));

      if (response && response.practiceId) {
        console.log('🔑 [呼吸練習] 成功拿到 practiceId:', response.practiceId);
        setPracticeId(response.practiceId);

        const restoredSeconds = response.accumulatedSeconds ? Number(response.accumulatedSeconds) : 0;
        setElapsedTime(restoredSeconds);
        console.log(`⏱️ [呼吸練習] 恢復累積時間: ${restoredSeconds} 秒`);

        if (response.currentStep !== undefined && response.currentStep !== null) {
          const stepToRestore = Number(response.currentStep);
          if (stepToRestore > 0 && stepToRestore < steps.length) {
            console.log(`📍 [呼吸練習] 恢復到步驟 ${stepToRestore}`);
            setCurrentStep(stepToRestore);
          }
        }

        if (response.formData) {
          try {
            const parsed = typeof response.formData === 'string' ? JSON.parse(response.formData) : response.formData;
            console.log('📝 [呼吸練習] 恢復表單數據:', parsed);
            setFormData({
              feeling: parsed.feeling || '',
              noticed: parsed.noticed || '',
              reflection: parsed.reflection || '',
            });
            setNoticedKeywords(parsed.noticedKeywords || []);
            setNoticedText(parsed.noticedText || '');
          } catch (e) {
            console.log('⚠️ [呼吸練習] 解析表單數據失敗:', e);
          }
        }
      } else {
        console.error('❌ [呼吸練習] 未收到 practiceId，後端回應:', response);
        hasInitialized.current = false;
      }
    } catch (error) {
      console.error('❌ [呼吸練習] 初始化失敗:', error);
      hasInitialized.current = false;
    } finally {
      setStartTime(Date.now());
      console.log('✅ [呼吸練習] 開始前端計時');
    }
  };

  // 保存進度
  const saveProgress = async () => {
    if (!practiceId) {
      console.log('⚠️ [呼吸練習] practiceId 是空的，無法保存進度');
      return;
    }

    console.log('💾 [呼吸練習] 準備保存進度...', {
      practiceId,
      currentStep,
      elapsedTime,
      formData,
    });

    try {
      await ApiService.updatePracticeProgress(
        practiceId,
        currentStep,
        steps.length,
        { ...formData, noticedKeywords, noticedText },
        elapsedTime
      );
      console.log('✅ [呼吸練習] 進度保存成功！');
    } catch (error) {
      console.error('❌ [呼吸練習] 保存進度失敗:', error);
    }
  };

  // ⭐⭐⭐ 新增：完成練習並獲取最新統計 ⭐⭐⭐
  const completeAndLoadStats = async () => {
    console.log('🎯 [呼吸練習] 準備完成練習並獲取統計...');
    
    if (!practiceId) {
      console.error('❌ [呼吸練習] practiceId 不存在！');
      return;
    }

    try {
      setPracticeStats(prev => ({ ...prev, loading: true }));

      // 計算練習時間
      let totalSeconds = elapsedTime || 0;
      if (!totalSeconds && startTime) {
        totalSeconds = Math.floor((Date.now() - startTime) / 1000);
      }
      if (!totalSeconds) totalSeconds = 60;

      const totalMinutes = Math.max(1, Math.ceil(totalSeconds / 60));

      console.log('📊 [呼吸練習] 練習統計:', {
        totalSeconds,
        totalMinutes,
        elapsedTime,
      });

      // 保存最後進度
      await saveProgress();

      // 完成練習
      const completePayload = {
        practice_id: practiceId,
        practice_type: PRACTICE_TYPE,
        duration: totalMinutes,
        duration_seconds: totalSeconds,
        feeling: formData.feeling || '',
        noticed: formData.noticed || '',
        reflection: formData.reflection || '',
        emotion_data: { noticedKeywords, noticedText },
        formData: { ...formData, noticedKeywords, noticedText },
      };

      console.log('📤 [呼吸練習] 準備送出 completePractice，payload:', JSON.stringify(completePayload, null, 2));

      await ApiService.completePractice(practiceId, completePayload);
      console.log('✅ [呼吸練習] completePractice 成功！');

      // 等待後端更新完成
      await new Promise(resolve => setTimeout(resolve, 500));

      // 獲取最新統計
      console.log('📊 [呼吸練習] 獲取最新統計數據...');
      const statsResponse = await ApiService.getPracticeStats();
      
      console.log('📊 [呼吸練習] 統計數據回應:', statsResponse);

      const stats = statsResponse?.stats || statsResponse;
      
      // 更新狀態
      setPracticeStats({
        currentStreak: stats.currentStreak || 0,
        totalDays: stats.totalDays || 0,
        loading: false,
      });

      console.log('✅ [呼吸練習] 統計數據載入成功:', {
        currentStreak: stats.currentStreak,
        totalDays: stats.totalDays,
      });

    } catch (error) {
      console.error('❌ [呼吸練習] 完成練習或獲取統計失敗:', error);
      setPracticeStats(prev => ({ ...prev, loading: false }));
    }
  };

  // ============================================
  // ⭐ useEffect - API 相關
  // ============================================

  // 組件掛載時初始化
  useEffect(() => {
    initializePractice();
  }, []);

  // 每秒累加 elapsedTime
  useEffect(() => {
    let timer;
    if (startTime) {
      timer = setInterval(() => {
        setElapsedTime((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [startTime]);

  // 自動保存（10 秒一次）
  useEffect(() => {
    if (!practiceId) {
      console.log('⏸️ [呼吸練習] 等待 practiceId，暫不啟動自動保存');
      return;
    }

    console.log('▶️ [呼吸練習] 啟動 10 秒自動保存，practiceId:', practiceId);

    const autoSaveInterval = setInterval(() => {
      console.log('🔄 [呼吸練習] 觸發自動保存...');
      saveProgress();
    }, 10000);

    return () => {
      console.log('⏹️ [呼吸練習] 停止自動保存');
      clearInterval(autoSaveInterval);
    };
  }, [practiceId, currentStep, formData, elapsedTime]);

  // ============================================
  // 動畫 useEffect
  // ============================================

  // 呼吸動畫
  useEffect(() => {
    if (currentStep === 2) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(breatheAnim, {
            toValue: 1.5,
            duration: 4000,
            useNativeDriver: true,
          }),
          Animated.timing(breatheAnim, {
            toValue: 1,
            duration: 4000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [currentStep]);

  // 進度條動畫
  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: currentStep,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [currentStep]);

  // ============================================
  // 事件處理函數
  // ============================================

  // ⭐⭐⭐ 修改：下一步處理（在進入最後一步前完成練習並獲取統計）⭐⭐⭐
  const nextStep = async () => {
    if (currentStep < steps.length - 1) {
      // ⭐ 如果即將進入最後一步（總結頁），先完成練習並獲取統計
      if (currentStep === steps.length - 2) {
        await completeAndLoadStats();
      }
      
      setCurrentStep((prev) => prev + 1);
      scrollViewRef.current?.scrollTo({ y: 0, animated: false });
      saveProgress();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
      scrollViewRef.current?.scrollTo({ y: 0, animated: false });
    }
  };

  const handleInputChange = (key, value) => {
    setFormData((prev) => ({
      ...prev,
      [key]: value,
    }));

    if (key === 'noticed') {
      setNoticedText(value);
      const words = value
        .split(/[\s,，、]+/)
        .filter((word) => word.length > 1)
        .slice(0, 5);
      setNoticedKeywords(words);
    }
  };

  const canProceed = () => {
    const currentStepData = steps[currentStep];

    if (currentStepData.id === 'form') {
      const requiredFields = currentStepData.fields.filter((f) => !f.optional);
      return requiredFields.every((field) => formData[field.key]?.trim());
    }

    return true;
  };

  const handleClose = () => {
    if (navigation) {
      if (previousScreen) {
        navigation.navigate(previousScreen);
      } else {
        navigation.goBack();
      }
    }
  };

  const handleComplete = () => {
    if (navigation) {
      navigation.navigate('Home');
    }
  };

  // ============================================
  // 渲染函數
  // ============================================

  const renderProgressBar = () => {
    const currentStepData = steps[currentStep];
    if (!currentStepData.showProgress) return null;

    const progressSteps = steps.filter((s) => s.showProgress);
    const currentProgressIndex = progressSteps.findIndex(
      (s) => s.id === currentStepData.id
    );
    const totalProgressSteps = progressSteps.length;

    return (
      <View style={styles.progressBarContainer}>
        <View style={styles.progressBar}>
          {Array.from({ length: totalProgressSteps }).map((_, index) => (
            <View
              key={index}
              style={[
                styles.progressDot,
                index <= currentProgressIndex && styles.progressDotActive,
              ]}
            />
          ))}
        </View>
      </View>
    );
  };

  const renderContent = () => {
    const currentStepData = steps[currentStep];

    // 介紹頁
    if (currentStepData.id === 'intro') {
      return (
        <View style={styles.centerContent}>
          <View style={styles.iconContainer}>
            <Ionicons name="leaf-outline" size={64} color="#4CAF50" />
          </View>
          <Text style={styles.title}>{currentStepData.title}</Text>
          <Text style={styles.description}>{currentStepData.description}</Text>
        </View>
      );
    }

    // 指引頁
    if (currentStepData.id === 'guide') {
      return (
        <View style={styles.contentContainer}>
          <Text style={styles.stepTitle}>{currentStepData.title}</Text>
          <View style={styles.guideList}>
            {currentStepData.content.map((item, index) => (
              <View key={index} style={styles.guideItem}>
                <View style={styles.guideBullet}>
                  <Text style={styles.guideBulletText}>{index + 1}</Text>
                </View>
                <Text style={styles.guideText}>{item}</Text>
              </View>
            ))}
          </View>
        </View>
      );
    }

    // 呼吸動畫頁
    if (currentStepData.id === 'breathing') {
      return (
        <View style={styles.centerContent}>
          <Animated.View
            style={[
              styles.breatheCircle,
              {
                transform: [{ scale: breatheAnim }],
              },
            ]}
          >
            <LinearGradient
              colors={['#4CAF50', '#81C784']}
              style={styles.breatheGradient}
            />
          </Animated.View>
          <Text style={styles.breatheInstruction}>
            {currentStepData.instruction}
          </Text>
        </View>
      );
    }

    // 表單頁
    if (currentStepData.id === 'form') {
      return (
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.formContainer}
        >
          <ScrollView
            ref={scrollViewRef}
            style={styles.formScroll}
            showsVerticalScrollIndicator={false}
          >
            <Text style={styles.stepTitle}>{currentStepData.title}</Text>

            {currentStepData.fields.map((field) => (
              <View key={field.key} style={styles.fieldContainer}>
                <Text style={styles.fieldLabel}>
                  {field.label}
                  {field.optional && (
                    <Text style={styles.optionalText}> (選填)</Text>
                  )}
                </Text>
                <TextInput
                  style={[styles.input, field.multiline && styles.textArea]}
                  placeholder={field.placeholder}
                  value={formData[field.key]}
                  onChangeText={(value) => handleInputChange(field.key, value)}
                  multiline={field.multiline}
                  numberOfLines={field.multiline ? 4 : 1}
                />
              </View>
            ))}
          </ScrollView>
        </KeyboardAvoidingView>
      );
    }

    // ⭐⭐⭐ 修改：總結頁（顯示實際統計數據）⭐⭐⭐
    if (currentStepData.hasSummary) {
      return (
        <ScrollView style={styles.summarySection} showsVerticalScrollIndicator={false}>
          {/* ⭐ 新增：練習成就卡片 */}
          <View style={styles.achievementCard}>
            {practiceStats.loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color="rgba(0, 0, 0, 0.6)" />
                <Text style={styles.loadingText}>正在更新統計...</Text>
              </View>
            ) : (
              <>
                <Text style={styles.achievementTitle}>🎉 太棒了！</Text>
                <View style={styles.statsRow}>
                  <View style={styles.statItem}>
                    <Text style={styles.statNumber}>{practiceStats.currentStreak}</Text>
                    <Text style={styles.statLabel}>連續天數</Text>
                  </View>
                  <View style={styles.statDivider} />
                  <View style={styles.statItem}>
                    <Text style={styles.statNumber}>{practiceStats.totalDays}</Text>
                    <Text style={styles.statLabel}>累積總天數</Text>
                  </View>
                </View>
                <Text style={styles.encouragementText}>
                  {practiceStats.currentStreak >= 7 
                    ? '已經連續一週了！繼續保持 💪' 
                    : practiceStats.currentStreak >= 3
                    ? '很棒的開始！持續下去 ✨'
                    : '每一天的練習都很珍貴 🌟'}
                </Text>
              </>
            )}
          </View>

          {/* 原有的總結內容 */}
          <View style={styles.summaryCard}>
            <View style={styles.summaryHeader}>
              <Ionicons name="checkmark-circle" size={32} color="#4CAF50" />
              <Text style={styles.summaryTitle}>練習完成</Text>
            </View>
            
            <Text style={styles.summaryText}>
              你完成了今天的呼吸練習！{'\n'}
              記得每天持續練習，讓心靈保持平靜。
            </Text>
          </View>

          {formData.feeling && (
            <View style={styles.summaryCard}>
              <Text style={styles.summaryLabel}>練習後的感受</Text>
              <Text style={styles.summaryContent}>{formData.feeling}</Text>
            </View>
          )}

          {formData.noticed && (
            <View style={styles.summaryCard}>
              <Text style={styles.summaryLabel}>注意到的事物</Text>
              <Text style={styles.summaryContent}>{formData.noticed}</Text>
              {noticedKeywords.length > 0 && (
                <View style={styles.keywordsContainer}>
                  {noticedKeywords.map((keyword, index) => (
                    <View key={index} style={styles.keyword}>
                      <Text style={styles.keywordText}>{keyword}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          )}

          {formData.reflection && (
            <View style={styles.summaryCard}>
              <Text style={styles.summaryLabel}>其他記錄</Text>
              <Text style={styles.summaryContent}>{formData.reflection}</Text>
            </View>
          )}
        </ScrollView>
      );
    }

    return null;
  };

  // ============================================
  // 主渲染
  // ============================================

  return (
    <View style={styles.container}>
      {/* 頂部導航 */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
          <Ionicons name="close" size={24} color="#333" />
        </TouchableOpacity>
        {renderProgressBar()}
      </View>

      {/* 內容區域 */}
      <View style={styles.content}>{renderContent()}</View>

      {/* 底部按鈕 */}
      <View style={styles.footer}>
        {currentStep > 0 && currentStep < steps.length - 1 && (
          <TouchableOpacity
            onPress={prevStep}
            style={[styles.button, styles.secondaryButton]}
          >
            <Text style={styles.secondaryButtonText}>上一步</Text>
          </TouchableOpacity>
        )}

        {currentStep < steps.length - 1 ? (
          <TouchableOpacity
            onPress={nextStep}
            style={[
              styles.button,
              styles.primaryButton,
              !canProceed() && styles.buttonDisabled,
            ]}
            disabled={!canProceed()}
          >
            <Text style={styles.primaryButtonText}>
              {currentStep === 0 ? '開始練習' : '下一步'}
            </Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            onPress={handleComplete}
            style={[styles.button, styles.primaryButton]}
          >
            <Text style={styles.primaryButtonText}>完成</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

// ============================================
// 樣式
// ============================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 48,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  closeButton: {
    padding: 8,
  },
  progressBarContainer: {
    flex: 1,
    alignItems: 'center',
    marginLeft: 16,
  },
  progressBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E0E0E0',
  },
  progressDotActive: {
    backgroundColor: '#4CAF50',
  },
  content: {
    flex: 1,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 32,
  },
  iconContainer: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 24,
  },
  guideList: {
    gap: 16,
  },
  guideItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  guideBullet: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
  },
  guideBulletText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  guideText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
    paddingTop: 4,
  },
  breatheCircle: {
    width: 200,
    height: 200,
    borderRadius: 100,
    marginBottom: 48,
    overflow: 'hidden',
  },
  breatheGradient: {
    flex: 1,
  },
  breatheInstruction: {
    fontSize: 20,
    color: '#333',
    textAlign: 'center',
    lineHeight: 28,
  },
  formContainer: {
    flex: 1,
  },
  formScroll: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 32,
  },
  fieldContainer: {
    marginBottom: 24,
  },
  fieldLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  optionalText: {
    fontSize: 14,
    fontWeight: '400',
    color: '#999',
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#333',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  textArea: {
    minHeight: 120,
    textAlignVertical: 'top',
  },
  summarySection: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 32,
  },
  // ⭐ 新增：成就卡片樣式
  achievementCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    padding: 24,
    borderRadius: 16,
    marginBottom: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: 'rgba(0, 0, 0, 0.6)',
  },
  achievementTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 24,
    marginBottom: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#4F7F96',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#E0E0E0',
  },
  encouragementText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  // 原有的總結樣式
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  summaryTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  summaryText: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
  },
  summaryLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4CAF50',
    marginBottom: 8,
  },
  summaryContent: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
  },
  keywordsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  keyword: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#E8F5E9',
  },
  keywordText: {
    fontSize: 14,
    color: '#4CAF50',
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  button: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButton: {
    backgroundColor: '#4CAF50',
  },
  secondaryButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  buttonDisabled: {
    backgroundColor: '#E0E0E0',
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
});

export default BreathingPractice;