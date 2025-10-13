import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  StatusBar,
  TextInput,
  TouchableWithoutFeedback,
  Keyboard,
  Image,
  ScrollView,
  Alert,
} from 'react-native';
import { Audio } from 'expo-av';
import ApiService from '../api';

export default function BreathingPractice({ onBack, navigation }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [sound, setSound] = useState(null);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [practiceId, setPracticeId] = useState(null);
  
  // 時間追蹤
  const [startTime, setStartTime] = useState(null);
  const [pauseTime, setPauseTime] = useState(null);
  const [accumulatedTime, setAccumulatedTime] = useState(0);
  const isFocused = useRef(true);
  
  const [formData, setFormData] = useState({
    feeling: '',
    noticed: '',
    reflection: '',
  });

  const steps = [
    {
      title: "準備好來開始\n今天的《呼吸穩定力練習》了嗎？",
      content: "",
      hasImage: true,
      imageType: "welcome",
    },
    {
      title: "嗨！歡迎你開始今天的\n《呼吸穩定力》練習",
      content: "",
      showGreeting: true,
    },
    {
      title: "這個練習能協助你\n平靜、專注，\n也是提升覺察力的重要基礎",
      content: ""
    },
    {
      title: "請你找個舒服的位置，",
      content: "坐下，或躺下",
      hasImage: true,
      imageType: "positions"
    },
    {
      title: "很好，再接下來的5分鐘，\n邀請你跟著聲音指示\n一起呼吸～",
      content: ""
    },
    {
      title: "",
      content: "讓我們開始進行練習。",
      hasAudio: true
    },
    {
      title: "你做得很好，",
      content: "今天你練習了5分鐘的呼吸\n請利用以下空間記錄下今日的練習",
      hasForm: true
    },
    {
      title: "恭喜你完成了今天的",
      content: "《呼吸穩定力練習》，\n讓我們來整理你的回饋吧！",
      hasSummary: true
    }
  ];

  const totalSteps = steps.length;
  const currentStepData = steps[currentStep];
  const progressPercentage = ((currentStep + 1) / totalSteps) * 100;

  // ========================================
  // 初始化練習
  // ========================================
  useEffect(() => {
    initializePractice();
    
    // 監聽畫面焦點變化（用於暫停/恢復計時）
    const unsubscribeFocus = navigation?.addListener('focus', () => {
      isFocused.current = true;
      if (pauseTime) {
        // 恢復計時
        setStartTime(Date.now());
        setPauseTime(null);
      }
    });

    const unsubscribeBlur = navigation?.addListener('blur', () => {
      isFocused.current = false;
      if (startTime && !pauseTime) {
        // 暫停計時
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        setAccumulatedTime(prev => prev + elapsed);
        setPauseTime(Date.now());
      }
    });

    return () => {
      if (unsubscribeFocus) unsubscribeFocus();
      if (unsubscribeBlur) unsubscribeBlur();
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [navigation]);

  const initializePractice = async () => {
    try {
      // 檢查是否有未完成的同天同類型練習
      const response = await ApiService.startPractice('呼吸穩定力練習');
      
      if (response.practiceId) {
      setPracticeId(response.practiceId);
      ``
            // ⭐ 恢復進度
            if (response.currentPage && response.currentPage > 0) {
                console.log(`✅ 恢復進度到第 ${response.currentPage} 頁`);
                setCurrentStep(response.currentPage);
            }
            
            if (response.formData) {
                try {
                const parsedData = typeof response.formData === 'string' 
                    ? JSON.parse(response.formData) 
                    : response.formData;
                setFormData(parsedData);
                console.log('✅ 恢復表單數據:', parsedData);
                } catch (e) {
                console.log('⚠️ 解析表單數據失敗:', e);
                }
            }
            
            setStartTime(Date.now());
            }
        } catch (error) {
            console.error('初始化練習失敗:', error);
        }
    };
  // ========================================
  // 計算總投入時間（秒）
  // ========================================
  const calculateTotalTime = () => {
    let total = accumulatedTime;
    if (startTime && !pauseTime && isFocused.current) {
      total += Math.floor((Date.now() - startTime) / 1000);
    }
    return total;
  };

  // ========================================
  // 自動儲存進度
  // ========================================
  useEffect(() => {
    saveProgress();
  }, [currentStep, formData]);

  const saveProgress = async () => {
    if (!practiceId) return;
    
    try {
      await ApiService.updatePracticeProgress(
        practiceId,
        currentStep,
        totalSteps,
        formData
      );
    } catch (error) {
      console.log('儲存進度失敗:', error);
    }
  };

  // ========================================
  // 音頻相關
  // ========================================
  const loadAudio = async () => {
    if (sound) {
      await sound.unloadAsync();
    }
    
    try {
      const audioFile = require('../assets/audio/breathing-meditation.mp3');
      const { sound: newSound } = await Audio.Sound.createAsync(audioFile);
      setSound(newSound);
      
      const status = await newSound.getStatusAsync();
      if (status.isLoaded) {
        setDuration(status.durationMillis || 0);
      }
      
      newSound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded) {
          setPosition(status.positionMillis || 0);
          setIsPlaying(status.isPlaying || false);
        }
      });
    } catch (error) {
      console.log('音頻載入錯誤:', error);
    }
  };

  const togglePlayback = async () => {
    if (!sound) {
      await loadAudio();
      return;
    }

    try {
      const status = await sound.getStatusAsync();
      if (status.isLoaded) {
        if (isPlaying) {
          await sound.pauseAsync();
        } else {
          await sound.playAsync();
        }
      }
    } catch (error) {
      console.log('播放錯誤:', error);
    }
  };

  useEffect(() => {
    if (currentStepData.hasAudio && !sound) {
      loadAudio();
    }
  }, [currentStep]);

  useEffect(() => {
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [sound]);

  const formatTime = (milliseconds) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // ========================================
  // 導航控制
  // ========================================
  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const updateFormData = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // ========================================
  // 完成練習
  // ========================================
  const handleComplete = async () => {
    if (!practiceId) {
      Alert.alert('錯誤', '練習記錄不存在');
      return;
    }

    try {
    
    const totalSeconds = calculateTotalTime();
    const totalMinutes = Math.max(1, Math.ceil(totalSeconds / 60));

      // 完成練習
      await ApiService.completePractice(practiceId, {
        duration: totalMinutes,
        duration_seconds: totalSeconds, 
        feeling: formData.feeling,
        noticed: formData.noticed,
        reflection: formData.reflection,
      });

      Alert.alert('完成', `恭喜完成練習！總時間：${totalMinutes}分鐘${totalSeconds % 60}秒`, [
        {
          text: '確定',
          onPress: () => {
            if (onBack) {
              onBack();
            } else if (navigation) {
              navigation.goBack();
            }
          }
        }
      ]);
    } catch (error) {
      console.error('完成練習失敗:', error);
      Alert.alert('錯誤', '無法保存練習記錄');
    }
  };

  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  // ========================================
  // 渲染步驟內容
  // ========================================
  const renderStepContent = () => {
    if (currentStepData.hasForm) {
      return (
        <TouchableWithoutFeedback onPress={dismissKeyboard}>
          <ScrollView style={styles.formSection} showsVerticalScrollIndicator={false}>
            <View style={styles.inputField}>
              <Text style={styles.inputLabel}>練習後，我感覺：</Text>
              <TextInput 
                style={styles.inputBox} 
                multiline 
                placeholder="寫下你的感受內容"
                placeholderTextColor="rgba(0, 0, 0, 0.4)"
                value={formData.feeling}
                onChangeText={(text) => updateFormData('feeling', text)}
              />
            </View>
            
            <View style={styles.separator} />
            
            <View style={styles.inputField}>
              <Text style={styles.inputLabel}>練習中的發現，我發現：</Text>
              <TextInput 
                style={styles.inputBox} 
                multiline 
                placeholder="記錄練習時的發現"
                placeholderTextColor="rgba(0, 0, 0, 0.4)"
                value={formData.noticed}
                onChangeText={(text) => updateFormData('noticed', text)}
              />
            </View>
            
            <View style={styles.separator} />
            
            <View style={styles.inputField}>
              <Text style={styles.inputLabel}>我想對願意給自己一點時間，{'\n'}好好呼吸、與自己共處的自己說：</Text>
              <TextInput 
                style={styles.largeInputBox} 
                multiline 
                placeholder="寫下想對自己說的話"
                placeholderTextColor="rgba(0, 0, 0, 0.4)"
                value={formData.reflection}
                onChangeText={(text) => updateFormData('reflection', text)}
              />
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      );
    }

    if (currentStepData.hasSummary) {
      return (
        <ScrollView style={styles.summarySection} showsVerticalScrollIndicator={false}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>練習的感覺：</Text>
            <Text style={styles.summaryContent}>{formData.feeling || "未填寫內容"}</Text>
          </View>
          
          <View style={styles.separator} />
          
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>練習中的發現：</Text>
            <Text style={styles.summaryContent}>{formData.noticed || "未填寫內容"}</Text>
          </View>
          
          <View style={styles.separator} />
          
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>想和自己說的話：</Text>
            <Text style={styles.summaryContent}>{formData.reflection || "未填寫內容"}</Text>
          </View>
          
          <TouchableOpacity style={styles.finishButton} onPress={handleComplete}>
            <Text style={styles.finishButtonText}>完成今日練習</Text>
          </TouchableOpacity>
        </ScrollView>
      );
    }

    if (currentStepData.hasAudio) {
      return (
        <View style={styles.audioPlayer}>
          <View style={styles.audioCard}>
            <View style={styles.albumCover}>
              <Image 
                source={require('../assets/images/ocean-breathe.png')}
                style={styles.albumCoverImage}
                resizeMode="cover"
              />
            </View>
            
            <View style={styles.timeContainer}>
              <Text style={styles.timeText}>{formatTime(position)}</Text>
              <View style={styles.progressSlider}>
                <View style={[styles.progressBar, { width: duration > 0 ? `${(position / duration) * 100}%` : '0%' }]} />
                <View style={[styles.progressHandle, { left: duration > 0 ? `${(position / duration) * 100}%` : '0%' }]} />
              </View>
              <Text style={styles.timeText}>{formatTime(duration) || '5:00'}</Text>
            </View>
            
            <View style={styles.audioControls}>
              <TouchableOpacity style={styles.controlButtonContainer}>
                <Text style={styles.controlButton}>⏮</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={togglePlayback} style={styles.playButtonContainer}>
                <Text style={styles.playButton}>{isPlaying ? '⏸️' : '▶️'}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.controlButtonContainer}>
                <Text style={styles.controlButton}>⏭</Text>
              </TouchableOpacity>
            </View>
            
            <Text style={styles.audioDescription}>
              呼吸，貼近下意識的節拍，{'\n'}邀請你跟著聲音指示{'\n'}一起呼吸～
            </Text>
          </View>
        </View>
      );
    }

    if (currentStepData.hasImage) {
      return (
        <View style={styles.imageSection}>
          {currentStepData.imageType === "welcome" ? (
            <View style={styles.welcomeImageContainer}>
              <View style={styles.welcomeImageWhiteBox}>
                <Image 
                  source={require('../assets/images/呼吸穩定.png')}
                  style={styles.welcomeImage}
                  resizeMode="contain"
                />
              </View>
            </View>
          ) : currentStepData.imageType === "positions" ? (
            <View style={styles.positionImagesContainer}>
              <View style={styles.positionImageTop}>
                <Image 
                  source={require('../assets/images/lying-position.png')}
                  style={styles.positionImageFile}
                  resizeMode="contain"
                />
              </View>
              <View style={styles.positionImageBottom}>
                <Image 
                  source={require('../assets/images/sitting-position.png')}
                  style={styles.positionImageFile}
                  resizeMode="contain"
                />
              </View>
            </View>
          ) : null}
        </View>
      );
    }

    if (currentStepData.showGreeting) {
      return (
        <View style={styles.greetingSection}>
          <View style={styles.greetingCircle}>
            <Text style={styles.greetingText}>Hi</Text>
          </View>
        </View>
      );
    }

    if (currentStepData.content) {
      return (
        <Text style={styles.contentText}>{currentStepData.content}</Text>
      );
    }

    return null;
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="rgba(46, 134, 171, 0.7)" />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack || (() => navigation?.goBack())}>
          <Text style={styles.closeButton}>✕</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>《呼吸穩定力練習》</Text>
        <TouchableOpacity>
          <Text style={styles.menuButton}>⋯</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.progressContainer}>
        <View style={styles.progressBarContainer}>
          <View style={[styles.progressBarFill, { width: `${progressPercentage}%` }]} />
        </View>
      </View>

      <TouchableWithoutFeedback onPress={dismissKeyboard}>
        <View style={styles.contentContainer}>
          {/* 左右區域點擊導航 */}
          {currentStep > 0 && !currentStepData.hasForm && (
            <TouchableOpacity 
              style={styles.leftTapArea}
              onPress={prevStep}
              activeOpacity={1}
            />
          )}
          {currentStep < steps.length - 1 && !currentStepData.hasForm && (
            <TouchableOpacity 
              style={styles.rightTapArea}
              onPress={nextStep}
              activeOpacity={1}
            />
          )}

          <View style={styles.stepHeader}>
            <Text style={styles.stepTitle}>{currentStepData.title}</Text>
            {currentStepData.content && !currentStepData.hasAudio && !currentStepData.hasImage && (
              <Text style={styles.contentText}>{currentStepData.content}</Text>
            )}
          </View>

          {renderStepContent()}
        </View>
      </TouchableWithoutFeedback>

      {/* 底部導航欄 - 顏色改為 #4F7F96 */}
      <View style={styles.bottomNav}>
        <TouchableOpacity 
          onPress={prevStep}
          disabled={currentStep === 0}
          style={[styles.navButton, currentStep === 0 && styles.navButtonDisabled]}
        >
          <Text style={styles.navButtonText}>〈</Text>
        </TouchableOpacity>
        
        <View style={styles.progressIndicator}>
          {steps.map((_, index) => (
            <View 
              key={index}
              style={[
                styles.progressDot,
                index === currentStep && styles.progressDotActive
              ]}
            />
          ))}
        </View>
        
        <TouchableOpacity 
          onPress={nextStep}
          disabled={currentStep === steps.length - 1}
          style={[styles.navButton, currentStep === steps.length - 1 && styles.navButtonDisabled]}
        >
          <Text style={styles.navButtonText}>〉</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#92C3D8',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  closeButton: {
    fontSize: 20,
    color: 'rgba(0, 0, 0, 0.6)',
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 16,
    color: 'rgba(0, 0, 0, 0.6)',
    fontWeight: 'bold',
  },
  menuButton: {
    fontSize: 20,
    color: 'rgba(0, 0, 0, 0.6)',
    fontWeight: 'bold',
  },
  progressContainer: {
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  progressBarContainer: {
    height: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: 2,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 2,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: 100,
    position: 'relative',
    justifyContent: 'center',
  },
  leftTapArea: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: '40%',
    zIndex: 10,
  },
  rightTapArea: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: '40%',
    zIndex: 10,
  },
  stepHeader: {
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 20,
  },
  stepTitle: {
    fontSize: 20,
    color: 'rgba(0, 0, 0, 0.6)',
    fontWeight: 'bold',
    textAlign: 'center',
    lineHeight: 28,
  },
  contentText: {
    fontSize: 16,
    color: 'rgba(0, 0, 0, 0.6)',
    lineHeight: 24,
    textAlign: 'center',
    marginTop: 10,
  },
  greetingSection: {
    alignItems: 'center',
    marginBottom: 30,
  },
  greetingCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  greetingText: {
    fontSize: 24,
    color: 'rgba(0, 0, 0, 0.6)',
    fontWeight: 'bold',
  },
  imageSection: {
    alignItems: 'center',
    marginBottom: 30,
  },
  welcomeImageContainer: {
    alignItems: 'center',
  },
  welcomeImageWhiteBox: {
    width: 200,
    height: 150,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  welcomeImage: {
    width: '90%',
    height: '90%',
  },
  positionImagesContainer: {
    width: 280,
    height: 200,
    position: 'relative',
  },
  positionImageTop: {
    position: 'absolute',
    top: 0,
    left: 20,
    width: 140,
    height: 140,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
    zIndex: 2,
  },
  positionImageBottom: {
    position: 'absolute',
    bottom: 0,
    right: 20,
    width: 140,
    height: 140,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
    zIndex: 1,
  },
  positionImageFile: {
    width: '100%',
    height: '100%',
  },
  audioPlayer: {
    marginBottom: 30,
  },
  audioCard: {
    backgroundColor: 'rgba(230, 230, 230, 1.0)',
    borderRadius: 16,
    padding: 40,
    alignItems: 'center',
  },
  albumCover: {
    width: 240,
    height: 250,
    borderRadius: 5,
    backgroundColor: '#87CEEB',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    overflow: 'hidden',
  },
  albumCoverImage: {
    width: '100%',
    height: '100%',
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: 20,
  },
  timeText: {
    fontSize: 14,
    color: 'rgba(0, 0, 0, 0.6)',
    width: 40,
    fontWeight: '500',
  },
  progressSlider: {
    flex: 1,
    height: 6,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: 3,
    marginHorizontal: 15,
    position: 'relative',
  },
  progressBar: {
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 3,
  },
  progressHandle: {
    position: 'absolute',
    top: -6,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  audioControls: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  controlButtonContainer: {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  controlButton: {
    fontSize: 28,
    color: 'rgba(0, 0, 0, 0.6)',
  },
  playButtonContainer: {
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 20,
  },
  playButton: {
    fontSize: 36,
    color: 'rgba(0, 0, 0, 0.6)',
  },
  audioDescription: {
    fontSize: 12,
    color: 'rgba(0, 0, 0, 0.6)',
    textAlign: 'center',
    lineHeight: 18,
  },
  formSection: {
    flex: 1,
    marginBottom: 20,
  },
  inputField: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    color: 'rgba(0, 0, 0, 0.6)',
    marginBottom: 8,
    lineHeight: 20,
  },
  inputBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    height: 60,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    color: 'rgba(0, 0, 0, 0.6)',
    textAlignVertical: 'top',
  },
  largeInputBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    height: 100,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    color: 'rgba(0, 0, 0, 0.6)',
    textAlignVertical: 'top',
  },
  separator: {
    height: 1,
    backgroundColor: 'rgba(219, 219, 219, 0.5)',
    marginVertical: 15,
  },
  summarySection: {
    flex: 1,
    marginBottom: 20,
  },
  summaryCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    padding: 16,
    borderRadius: 10,
    marginBottom: 15,
  },
  summaryTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: 'rgba(0, 0, 0, 0.75)',
    marginBottom: 8,
  },
  summaryContent: {
    fontSize: 14,
    color: 'rgba(0, 0, 0, 0.65)',
    lineHeight: 22,
  },
  finishButton: {
    backgroundColor: 'rgba(46, 134, 171, 0.9)',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 25,
    alignSelf: 'center',
    marginTop: 20,
  },
  finishButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  // ⭐ 底部導航欄 - 顏色改為 #4F7F96, 100%
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 30,
    paddingVertical: 20,
    paddingBottom: 36,
    backgroundColor: '#4F7F96', // ⭐ 修改顏色
  },
  navButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  navButtonDisabled: {
    opacity: 0.3,
  },
  navButtonText: {
    fontSize: 24,
    color: '#FFFFFF', // 修改為白色以配合深色背景
  },
  progressIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)', // 修改為白色半透明
    marginHorizontal: 4,
  },
  progressDotActive: {
    backgroundColor: '#FFFFFF', // 當前點改為白色
    width: 12,
    height: 12,
    borderRadius: 6,
  },
});