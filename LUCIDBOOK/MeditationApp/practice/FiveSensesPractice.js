import React, { useState, useEffect } from 'react';
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
} from 'react-native';
import { Audio } from 'expo-av';
import ApiService from '../api';

export default function FiveSensesPractice({ onBack }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [sound, setSound] = useState(null);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  
  const [formData, setFormData] = useState({
    feeling: '',
    noticed: '',
    reflection: '',
  });

  const steps = [
    {
      title: "準備好來開始\n今天的《五感覺察練習》了嗎？",
      content: "",
      hasImage: true,
      imageType: "welcome",
    },
    {
      title: "嗨！歡迎你開始今天的\n《五感覺察》練習",
      content: "",
      showGreeting: true,
    },
    {
      title: "這個練習能協助你\n提升感官覺察力，\n連結當下的體驗",
      content: ""
    },
    {
      title: "請你找個舒服的位置，",
      content: "坐下，或躺下",
      hasImage: true,
      imageType: "positions"
    },
    {
      title: "很好，再接下來的8分鐘，\n邀請你跟著聲音指示\n進行五感覺察～",
      content: ""
    },
    {
      title: "",
      content: "讓我們開始進行練習。",
      hasAudio: true
    },
    {
      title: "你做得很好，",
      content: "今天你練習了8分鐘的五感覺察\n請利用以下空間記錄下今日的練習",
      hasForm: true
    },
    {
      title: "恭喜你完成了今天的",
      content: "《五感覺察練習》，\n讓我們來整理你的回饋吧！",
      hasSummary: true
    }
  ];

  const totalSteps = steps.length;
  const currentStepData = steps[currentStep];
  const progressPercentage = ((currentStep + 1) / totalSteps) * 100;

  // 自動儲存進度
  useEffect(() => {
    saveProgress();
  }, [currentStep, formData]);

  const saveProgress = async () => {
    try {
      await ApiService.savePracticeProgress(
        '五感察覺練習',
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
      const audioFile = require('../assets/audio/five-senses.wav');
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

  const handleComplete = async () => {
    try {
      await ApiService.completePracticeWithData(
        '五感察覺練習',
        8,
        formData
      );
      onBack();
    } catch (error) {
      console.error('完成練習失敗:', error);
      onBack();
    }
  };

  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  const renderStepContent = () => {
    // 與 BreathingPractice 相同的邏輯
    // 複製 BreathingPractice 的 renderStepContent 函數內容
    // 為了節省空間，這裡省略，與 BreathingPractice 完全相同
    
    // 唯一差異是圖片路徑改成：
    // require('../assets/images/五感察覺.png')
    
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
              <Text style={styles.timeText}>{formatTime(duration) || '8:00'}</Text>
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
              五感覺察，貼近當下的體驗，{'\n'}邀請你跟著聲音指示{'\n'}一起感受～
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
                  source={require('../assets/images/五感察覺.png')}
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
        <TouchableOpacity onPress={onBack}>
          <Text style={styles.closeButton}>✕</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>《五感覺察練習》</Text>
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
    backgroundColor: 'rgba(46, 134, 171, 0.95)',
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
    color: 'rgba(0, 0, 0, 0.6)',
  },
  progressIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    marginHorizontal: 4,
  },
  progressDotActive: {
    backgroundColor: 'rgba(46, 134, 171, 1)',
    width: 12,
    height: 12,
    borderRadius: 6,
  },
});