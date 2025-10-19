//BreathingPractice
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
  KeyboardAvoidingView,
  Platform,
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
  
  const [startTime, setStartTime] = useState(null);
  const [pauseTime, setPauseTime] = useState(null);
  const [accumulatedTime, setAccumulatedTime] = useState(0);
  const isFocused = useRef(true);
  
  const [formData, setFormData] = useState({
    feeling: '',
    noticed: '',
    reflection: '',
  });

  const scrollViewRef = useRef(null);

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
      hasForm: true,
      isSecondToLast: true
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

  useEffect(() => {
    initializePractice();
    
    const unsubscribeFocus = navigation?.addListener('focus', () => {
      isFocused.current = true;
      if (pauseTime) {
        setStartTime(Date.now());
        setPauseTime(null);
      }
    });

    const unsubscribeBlur = navigation?.addListener('blur', () => {
      isFocused.current = false;
      if (startTime && !pauseTime) {
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
      const response = await ApiService.startPractice('呼吸穩定力練習');
      
      if (response.practiceId) {
        setPracticeId(response.practiceId);
        
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

  const calculateTotalTime = () => {
    let total = accumulatedTime;
    if (startTime && !pauseTime && isFocused.current) {
      total += Math.floor((Date.now() - startTime) / 1000);
    }
    return total;
  };

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

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
      scrollViewRef.current?.scrollTo({ y: 0, animated: false });
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      scrollViewRef.current?.scrollTo({ y: 0, animated: false });
    }
  };

  const updateFormData = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleComplete = async () => {
    if (!practiceId) {
      Alert.alert('錯誤', '練習記錄不存在');
      return;
    }

    try {
      const totalSeconds = calculateTotalTime();
      const totalMinutes = Math.max(1, Math.ceil(totalSeconds / 60));

      await ApiService.completePractice(practiceId, {
        duration: totalMinutes,
        duration_seconds: totalSeconds, 
        feeling: formData.feeling,
        noticed: formData.noticed,
        reflection: formData.reflection,
      });

      // ⭐ 修正：正確顯示時間
      const mins = Math.floor(totalSeconds / 60);
      const secs = totalSeconds % 60;
      let timeStr = '';
      if (mins > 0) {
        timeStr = `${mins}分鐘`;
      }
      if (secs > 0 || mins === 0) {
        timeStr += `${secs}秒`;
      }

      Alert.alert('完成', `恭喜完成練習！總時間：${timeStr}分鐘${totalSeconds % 60}秒`, [
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

  const renderStepContent = () => {
    if (currentStepData.hasForm) {
      return (
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
          keyboardVerticalOffset={100}
        >
          <ScrollView 
            ref={scrollViewRef}
            style={styles.formSection} 
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 40 }}
          >
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

            {currentStepData.isSecondToLast && (
              <TouchableOpacity 
                style={styles.completeButton} 
                onPress={nextStep}
              >
                <Text style={styles.completeButtonText}>我完成練習了！</Text>
              </TouchableOpacity>
            )}
          </ScrollView>
        </KeyboardAvoidingView>
      );
    }

    if (currentStepData.hasSummary) {
      return (
        <ScrollView style={styles.summarySection} showsVerticalScrollIndicator={false}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>練習的感覺：</Text>
            <Text style={styles.summaryContent}>{formData.feeling || "無記錄"}</Text>
          </View>
          
          <View style={styles.separator} />
          
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>練習中的發現：</Text>
            <Text style={styles.summaryContent}>{formData.noticed || "無記錄"}</Text>
          </View>
          
          <View style={styles.separator} />
          
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>想和自己說的話：</Text>
            <Text style={styles.summaryContent}>{formData.reflection || "無記錄"}</Text>
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

  const isLastStep = currentStep === steps.length - 1;
  const isSecondToLast = currentStepData.isSecondToLast;

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
          <View style={styles.stepHeader}>
            <Text style={styles.stepTitle}>{currentStepData.title}</Text>
            {currentStepData.content && !currentStepData.hasAudio && !currentStepData.hasImage && (
              <Text style={styles.contentText}>{currentStepData.content}</Text>
            )}
          </View>

          {renderStepContent()}
        </View>
      </TouchableWithoutFeedback>

      {!isLastStep && (
        <View style={styles.bottomNav}>
          <TouchableOpacity 
            onPress={prevStep}
            disabled={currentStep === 0}
            style={[
              styles.navArrowButton,
              currentStep === 0 && styles.navButtonDisabled
            ]}
          >
            <Text style={styles.navArrowText}>〈</Text>
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
            disabled={isSecondToLast}
            style={[
              styles.navArrowButton,
              isSecondToLast && styles.navButtonDisabled
            ]}
          >
            <Text style={styles.navArrowText}>〉</Text>
          </TouchableOpacity>
        </View>
      )}
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
    justifyContent: 'center',
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
  completeButton: {
    backgroundColor: '#f5f5f5',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 25,
    alignSelf: 'center',
    marginTop: 30,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#4F7F96',
  },
  completeButtonText: {
    color: '#4F7F96',
    fontSize: 16,
    fontWeight: 'bold',
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
    backgroundColor: 'transparent',
  },
  navArrowButton: {
    width: 50,
    height: 50,
    backgroundColor: '#f5f5f5',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  navButtonDisabled: {
    opacity: 0.3,
  },
  navArrowText: {
    fontSize: 24,
    color: '#4F7F96',
    fontWeight: 'bold',
  },
  progressIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    marginHorizontal: 4,
  },
  progressDotActive: {
    backgroundColor: '#FFFFFF',
    width: 12,
    height: 12,
    borderRadius: 6,
  },
});