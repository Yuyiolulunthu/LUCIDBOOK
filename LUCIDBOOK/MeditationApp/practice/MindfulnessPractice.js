// MindfulnessPractice.js - 正念安定力練習
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

export default function MindfulnessPractice({ onBack, navigation }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [sound, setSound] = useState(null);
  const [breathingSound, setBreathingSound] = useState(null);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [breathingPosition, setBreathingPosition] = useState(0);
  const [breathingDuration, setBreathingDuration] = useState(0);
  const [isBreathingPlaying, setIsBreathingPlaying] = useState(false);
  const [practiceId, setPracticeId] = useState(null);
  
  const [startTime, setStartTime] = useState(null);
  const [pauseTime, setPauseTime] = useState(null);
  const [accumulatedTime, setAccumulatedTime] = useState(0);
  const isFocused = useRef(true);
  
  const [formData, setFormData] = useState({
    noticed: '',
    attention: '',
    reflection: '',
  });

  const scrollViewRef = useRef(null);

  const steps = [
    {
      title: "準備好來開始\n今天的《正念安定力練習》了嗎？",
      content: "",
      hasImage: true,
      imageType: "welcome",
    },
    {
      title: "嗨，歡迎你來到\n《正念安定力》練習。",
      content: "",
      showGreeting: true,
    },
    {
      title: "接下來我們會帶你利用\n8分鐘的身體掃描",
      content: "體驗一套基礎的正念\n從內提升覺察，建立安定的力量。",
    },
    {
      title: "請你找個舒服的位置，",
      content: "坐下，或躺下",
      hasImage: true,
      imageType: "positions",
      hasBreathingAudio: true,
    },
    {
      title: "請進行3組，深深的呼吸，",
      content: "讓身體心靈慢下來",
      hasBreathingAudio: true,
      showCompleteButton: true,
    },
    {
      title: "很好... 接著跟著音檔的引導，",
      content: "開始正念...",
    },
    {
      title: "讓我們開始進行身體掃描練習",
      content: "",
      hasAudio: true
    },
    {
      title: "身體掃描結束，",
      content: "你感覺怎麼樣呢？\n讓我們利用書寫，分享自己的身體與心靈感受",
      hasForm: true,
    },
    {
      title: "你做得很好，",
      content: "今天你練習了8分鐘的正念\n請利用以下空間記錄下今日的練習",
      hasSummary: true
    }
  ];

  const totalSteps = steps.length;
  const currentStepData = steps[currentStep] || {};
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
      if (breathingSound) {
        breathingSound.unloadAsync();
      }
    };
  }, [navigation]);

  const initializePractice = async () => {
    try {
      const response = await ApiService.startPractice('正念安定力練習');
      
      if (response.practiceId) {
        setPracticeId(response.practiceId);
        
        if (response.currentPage && response.currentPage > 0) {
          const validPage = Math.min(response.currentPage, steps.length - 1);
          setCurrentStep(validPage);
        }
        
        if (response.formData) {
          try {
            const parsedData = typeof response.formData === 'string' 
              ? JSON.parse(response.formData) 
              : response.formData;
            setFormData(parsedData);
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

  // 呼吸音檔
  const loadBreathingAudio = async () => {
    if (breathingSound) {
      await breathingSound.unloadAsync();
    }
    
    try {
      const audioFile = require('../assets/audio/breathing-meditation.mp3');
      const { sound: newSound } = await Audio.Sound.createAsync(audioFile);
      setBreathingSound(newSound);
      
      const status = await newSound.getStatusAsync();
      if (status.isLoaded) {
        setBreathingDuration(status.durationMillis || 0);
      }
      
      newSound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded) {
          setBreathingPosition(status.positionMillis || 0);
          setIsBreathingPlaying(status.isPlaying || false);
        }
      });
    } catch (error) {
      console.log('呼吸音頻載入錯誤:', error);
    }
  };

  const toggleBreathingPlayback = async () => {
    if (!breathingSound) {
      await loadBreathingAudio();
      return;
    }

    try {
      const status = await breathingSound.getStatusAsync();
      if (status.isLoaded) {
        if (isBreathingPlaying) {
          await breathingSound.pauseAsync();
        } else {
          await breathingSound.playAsync();
        }
      }
    } catch (error) {
      console.log('呼吸播放錯誤:', error);
    }
  };

  // 身體掃描音檔
  const loadAudio = async () => {
    if (sound) {
      await sound.unloadAsync();
    }
    
    try {
      const audioFile = require('../assets/audio/BodyScanner.mp3');
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
    if (currentStepData.hasBreathingAudio && !breathingSound) {
      loadBreathingAudio();
    }
  }, [currentStep]);

  useEffect(() => {
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
      if (breathingSound) {
        breathingSound.unloadAsync();
      }
    };
  }, [sound, breathingSound]);

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
        noticed: formData.noticed,
        attention: formData.attention,
        reflection: formData.reflection,
      });

      const mins = Math.floor(totalSeconds / 60);
      const secs = totalSeconds % 60;
      let timeStr = '';
      if (mins > 0) {
        timeStr = `${mins}分鐘`;
      }
      if (secs > 0 || mins === 0) {
        timeStr += `${secs}秒`;
      }

      Alert.alert('完成', `恭喜完成練習！總時間：${timeStr}`, [
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

  // 小型音頻播放器
  const renderMiniAudioPlayer = () => {
    return (
      <View style={styles.miniPlayerContainer}>
        <View style={styles.miniPlayerCard}>
          <Text style={styles.miniLabel}>呼吸穩定</Text>
          
          <View style={styles.miniTimeRow}>
            <Text style={styles.miniTimeText}>{formatTime(breathingPosition)}</Text>
            <View style={styles.miniProgressSlider}>
              <View 
                style={[
                  styles.miniProgressBar, 
                  { width: `${breathingDuration > 0 ? (breathingPosition / breathingDuration) * 100 : 0}%` }
                ]} 
              />
              <View 
                style={[
                  styles.miniProgressHandle,
                  { left: `${breathingDuration > 0 ? (breathingPosition / breathingDuration) * 100 : 0}%` }
                ]}
              />
            </View>
            <Text style={styles.miniTimeText}>{formatTime(breathingDuration)}</Text>
          </View>
          
          <View style={styles.miniControls}>
            <TouchableOpacity 
              style={styles.miniControlButton}
              onPress={async () => {
                if (breathingSound) {
                  await breathingSound.setPositionAsync(Math.max(0, breathingPosition - 10000));
                }
              }}
            >
              <Image 
                source={require('../assets/images/backward.png')}
                style={styles.miniControlImage}
                resizeMode="contain"
              />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.miniPlayButton}
              onPress={toggleBreathingPlayback}
            >
              <Image 
                source={isBreathingPlaying ? require('../assets/images/stop.png') : require('../assets/images/start.png')}
                style={styles.miniPlayImage}
                resizeMode="contain"
              />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.miniControlButton}
              onPress={async () => {
                if (breathingSound) {
                  await breathingSound.setPositionAsync(Math.min(breathingDuration, breathingPosition + 10000));
                }
              }}
            >
              <Image 
                source={require('../assets/images/forward.png')}
                style={styles.miniControlImage}
                resizeMode="contain"
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  const renderStepContent = () => {
    // 表單頁面
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
            <View style={styles.stepHeader}>
              {currentStepData.title && (
                <Text style={styles.stepTitle}>{currentStepData.title}</Text>
              )}
              {currentStepData.content && (
                <Text style={styles.contentText}>{currentStepData.content}</Text>
              )}
            </View>
            <View style={styles.inputField}>
              <Text style={styles.inputLabel}>今天在身體掃描中，我觀察到什麼過去沒有發現到的？哪些部位讓我感到緊張、放鬆、或有特別的感受？</Text>
              <TextInput 
                style={styles.inputBox} 
                multiline 
                placeholder="在此分享你的經驗..."
                placeholderTextColor="rgba(0, 0, 0, 0.4)"
                value={formData.noticed}
                onChangeText={(text) => updateFormData('noticed', text)}
              />
            </View>
            
            <View style={styles.inputField}>
              <Text style={styles.inputLabel}>我的注意力有沒有飄走？我是怎麼把它帶回來的？</Text>
              <TextInput 
                style={styles.inputBox} 
                multiline 
                placeholder="在此分享你的經驗..."
                placeholderTextColor="rgba(0, 0, 0, 0.4)"
                value={formData.attention}
                onChangeText={(text) => updateFormData('attention', text)}
              />
            </View>
            
            <View style={styles.separator} />
            
            <View style={styles.inputField}>
              <Text style={styles.inputLabel}>還有沒有什麼發現？感受？與疑惑</Text>
              <TextInput 
                style={styles.largeInputBox} 
                multiline 
                placeholder="在此分享你的想法..."
                placeholderTextColor="rgba(0, 0, 0, 0.4)"
                value={formData.reflection}
                onChangeText={(text) => updateFormData('reflection', text)}
              />
            </View>
            
            <TouchableOpacity 
              style={styles.completeButton}
              onPress={nextStep}
            >
              <Text style={styles.completeButtonText}>我完成練習了！</Text>
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      );
    }

    // 總結頁面
    if (currentStepData.hasSummary) {
      return (
        <ScrollView 
          style={styles.summarySection}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 40 }}
        >
          <View style={styles.stepHeader}>
            {currentStepData.title && (
              <Text style={styles.stepTitle}>{currentStepData.title}</Text>
            )}
            {currentStepData.content && (
              <Text style={styles.contentText}>{currentStepData.content}</Text>
            )}
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>你的觀察：</Text>
            <Text style={styles.summaryContent}>{formData.noticed || '未填寫'}</Text>
          </View>
          
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>你的注意力：</Text>
            <Text style={styles.summaryContent}>{formData.attention || '未填寫'}</Text>
          </View>
          
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>你的反思：</Text>
            <Text style={styles.summaryContent}>{formData.reflection || '未填寫'}</Text>
          </View>
          
          <TouchableOpacity 
            style={styles.finishButton}
            onPress={handleComplete}
          >
            <Text style={styles.finishButtonText}>完成練習</Text>
          </TouchableOpacity>
        </ScrollView>
      );
    }

    // 大型音頻播放器頁面
    if (currentStepData.hasAudio) {
      return (
      <>
        <View style={styles.stepHeader}>
          {currentStepData.title && (
            <Text style={styles.stepTitle}>{currentStepData.title}</Text>
          )}
          {currentStepData.content && (
            <Text style={styles.contentText}>{currentStepData.content}</Text>
          )}
        </View>
        <View style={styles.audioPlayer}>
          <View style={styles.audioCard}>
            <View style={styles.albumCover}>
              <Image 
                source={require('../assets/images/正念安定.png')}
                style={styles.albumCoverImage}
                resizeMode="cover"
              />
            </View>
            
            <View style={styles.timeContainer}>
              <Text style={styles.timeText}>{formatTime(position)}</Text>
              <View style={styles.progressSlider}>
                <View 
                  style={[
                    styles.progressBar, 
                    { width: `${duration > 0 ? (position / duration) * 100 : 0}%` }
                  ]} 
                />
                <View 
                  style={[
                    styles.progressHandle,
                    { left: `${duration > 0 ? (position / duration) * 100 : 0}%` }
                  ]}
                />
              </View>
              <Text style={styles.timeText}>{formatTime(duration)}</Text>
            </View>
            
            <View style={styles.audioControls}>
              <TouchableOpacity 
                style={styles.controlButtonContainer}
                onPress={async () => {
                  if (sound) {
                    const newPosition = Math.max(0, position - 10000);
                    await sound.setPositionAsync(newPosition);
                  }
                }}
              >
                <Image 
                  source={require('../assets/images/backward.png')}
                  style={styles.controlButtonImage}
                  resizeMode="contain"
                />
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.playButtonContainer}
                onPress={togglePlayback}
              >
                <Image 
                  source={isPlaying ? require('../assets/images/stop.png') : require('../assets/images/start.png')}
                  style={styles.playButtonImage}
                  resizeMode="contain"
                />
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.controlButtonContainer}
                onPress={async () => {
                  if (sound) {
                    const newPosition = Math.min(duration, position + 10000);
                    await sound.setPositionAsync(newPosition);
                  }
                }}
              >
                <Image 
                  source={require('../assets/images/forward.png')}
                  style={styles.controlButtonImage}
                  resizeMode="contain"
                />
              </TouchableOpacity>
            </View>
            
            <Text style={styles.audioDescription}>
              跟著音檔的引導，開始正念...
            </Text>
          </View>
        </View>
        </>
      );
    }

    // 一般內容頁面
    return (
      <>
        <View style={styles.stepHeader}>
          <Text style={styles.stepTitle}>{currentStepData.title}</Text>
          {currentStepData.content ? (
            <Text style={styles.contentText}>{currentStepData.content}</Text>
          ) : null}
        </View>

        {currentStepData.showGreeting && (
          <View style={styles.greetingSection}>
            <View style={styles.greetingCircle}>
              <Text style={styles.greetingText}>👋</Text>
            </View>
          </View>
        )}

        {currentStepData.hasImage && currentStepData.imageType === "welcome" && (
          <View style={styles.imageSection}>
            <View style={styles.welcomeImageContainer}>
              <View style={styles.welcomeImageWhiteBox}>
                <Image 
                  source={require('../assets/images/正念安定.png')}
                  style={styles.welcomeImage}
                  resizeMode="contain"
                />
              </View>
            </View>
          </View>
        )}

        {currentStepData.hasImage && currentStepData.imageType === "positions" && (
          <View style={styles.imageSection}>
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
          </View>
        )}

        {currentStepData.hasBreathingAudio && renderMiniAudioPlayer()}

        {currentStepData.showCompleteButton && (
          <TouchableOpacity 
            style={styles.completeBreathingButton}
            onPress={async () => {
              // 暫停呼吸音檔（而不是停止）
              if (breathingSound) {
                try {
                  const status = await breathingSound.getStatusAsync();
                  if (status.isLoaded && status.isPlaying) {
                    await breathingSound.pauseAsync();
                  }
                } catch (error) {
                  console.log('暫停音頻錯誤:', error);
                }
              }
              // 然後進入下一步
              nextStep();
            }}
          >
            <Text style={styles.completeBreathingButtonText}>完成呼吸</Text>
          </TouchableOpacity>
        )}
      </>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      <TouchableWithoutFeedback onPress={dismissKeyboard}>
        <View style={{ flex: 1 }}>

          {/* 標題列 */}
          <View style={styles.header}>
            <TouchableOpacity 
              style={styles.backButton} 
              onPress={() => {
                if (onBack) {
                  onBack();
                } else if (navigation) {
                  navigation.goBack();
                }
              }}
            >
              <Text style={styles.backButtonText}>✕</Text>
            </TouchableOpacity>
            
            <Text style={styles.headerTitle}>《正念安定力練習》</Text>
            
            <TouchableOpacity style={styles.menuButton}>
              <Text style={styles.menuButtonText}>⋯</Text>
            </TouchableOpacity>
          </View>

          {/* 進度條 */}
          <View style={styles.progressContainer}>
            <View style={styles.progressBarContainer}>
              <View 
                style={[styles.progressBarFill, { width: `${progressPercentage}%` }]} 
              />
            </View>
          </View>

          {/* 主要內容 */}
          <View style={styles.contentContainer}>
            {renderStepContent()}
          </View>

        {!currentStepData.hasSummary && (
          <View style={styles.bottomNav}>
            <TouchableOpacity 
              style={[
                styles.navArrowButton,
                currentStep === 0 && styles.navButtonDisabled
              ]}
              onPress={prevStep}
              disabled={currentStep === 0}
            >
              <Text style={styles.navArrowText}>‹</Text>
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

            {!currentStepData.hasForm ? (
              <TouchableOpacity 
                style={[
                  styles.navArrowButton,
                  currentStep === steps.length - 1 && styles.navButtonDisabled
                ]}
                onPress={nextStep}
                disabled={currentStep === steps.length - 1}
              >
                <Text style={styles.navArrowText}>›</Text>
              </TouchableOpacity>
            ) : (
              <View style={[styles.navArrowButton, { opacity: 0 }]} />
            )}
          </View>
        )}
        </View>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ede0dc',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 28,
    color: 'rgba(0, 0, 0, 0.6)',
  },
  headerTitle: {
    fontSize: 18,
    color: 'rgba(0, 0, 0, 0.6)',
    fontWeight: 'bold',
  },
  menuButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuButtonText: {
    fontSize: 24,
    color: 'rgba(0, 0, 0, 0.6)',
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
    fontSize: 18,
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  positionImageFile: {
    width: '100%',
    height: '100%',
  },
  // 小型播放器
  miniPlayerContainer: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  miniPlayerCard: {
    width: '90%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  miniTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: 12,
  },
  miniTimeText: {
    fontSize: 12,
    color: 'rgba(0, 0, 0, 0.6)',
    width: 35,
    fontWeight: '500',
  },
  miniProgressSlider: {
    flex: 1,
    height: 4,
    backgroundColor: 'rgba(177, 151, 158, 0.3)',
    borderRadius: 2,
    marginHorizontal: 10,
    position: 'relative',
  },
  miniProgressBar: {
    height: '100%',
    backgroundColor: '#b1979e',
    borderRadius: 2,
  },
  miniProgressHandle: {
    position: 'absolute',
    top: -4,
    width: 12,
    height: 12,
    backgroundColor: '#b1979e',
    borderRadius: 6,
    marginLeft: -6,
  },
  miniControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  miniControlButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  miniControlIcon: {
    fontSize: 20,
    color: '#b1979e',
  },
  miniPlayButton: {
    width: 45,
    height: 45,
    borderRadius: 25,
    backgroundColor: '#b1979e',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  miniPlayIcon: {
    fontSize: 22,
    color: '#FFFFFF',
  },
  miniLabel: {
    fontSize: 14,
    color: '#b1979e',
    fontWeight: '600',
    marginBottom: 8,
  },
  miniControlImage: {
    width: 25,
    height: 25,
    tintColor: '#b1979e',
  },
  miniPlayImage: {
    width: 27,
    height: 27,
    tintColor: '#FFFFFF',
  },
  completeBreathingButton: {
    backgroundColor: '#b1979e',
    paddingVertical: 14,
    paddingHorizontal: 25,
    borderRadius: 25,
    alignSelf: 'center',
    marginTop: 30,
    borderWidth: 2,
    borderColor: '#b1979e',
  },
  completeBreathingButtonText: {
    color: '#f5f5f5',
    fontSize: 16,
    fontWeight: 'bold',
  },
  // 大型播放器
  audioPlayer: {
    marginBottom: 30,
  },
  audioCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 40,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  albumCover: {
    width: 240,
    height: 250,
    borderRadius: 5,
    backgroundColor: '#ede0dc',
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
    backgroundColor: '#e6cbd2ff',
    borderRadius: 3,
    marginHorizontal: 15,
    position: 'relative',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#b1979e',
    borderRadius: 3,
  },
  progressHandle: {
    position: 'absolute',
    top: -6,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#b1979e',
  },
  audioControls: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  controlButtonImage: {
    width: 25,
    height: 25,
    tintColor: '#b1979e',
  },
  playButtonImage: {
    width: 34,
    height: 34,
    tintColor: '#b1979e',
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
  // 表單
  formSection: {
    flex: 1,
    marginBottom: 20,
  },
  inputField: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    color: '#776368ff',
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
    backgroundColor: 'rgba(177, 151, 158, 0.3)',
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
    borderColor: '#b1979e',
  },
  completeButtonText: {
    color: '#b1979e',
    fontSize: 16,
    fontWeight: 'bold',
  },
  // 總結
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
    backgroundColor: '#b1979e',
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
  // 底部導航
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
    color: '#b1979e',
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
    backgroundColor: '#b1979e',
    width: 12,
    height: 12,
    borderRadius: 6,
  },
});