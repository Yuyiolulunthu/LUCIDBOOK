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
} from 'react-native';
import { Audio } from 'expo-av';

export default function PracticeScreen({ practiceType = "呼吸覺定力練習", onBack }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [sound, setSound] = useState(null);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  
  const [formData, setFormData] = useState({
    feeling: '',
    noticed: '',
    reflection: ''
  });

  const getAudioFile = () => {
    try {
      const audioFiles = {
        "呼吸覺定力練習": require('./assets/audio/breathing-meditation.mp3'),
        "五感察覺練習": require('./assets/audio/five-senses.wav'),
        "情緒舒緩練習": require('./assets/audio/emotion-relief.wav'),
      };
      return audioFiles[practiceType] || audioFiles["呼吸覺定力練習"];
    } catch (error) {
      console.log('音频文件路径错误:', error);
      return null;
    }
  };

  const loadAudio = async () => {
    if (sound) {
      await sound.unloadAsync();
    }
    
    try {
      const audioFile = getAudioFile();
      if (!audioFile) {
        console.log('音频文件不存在');
        return;
      }
      
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
      console.log('音频载入错误:', error);
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
      console.log('播放错误:', error);
    }
  };

  useEffect(() => {
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [sound]);

  const getPracticeContent = () => {
    const practices = {
      "呼吸覺定力練習": {
        steps: [
          {
            title: "準備好來開始\n今天的《呼吸穩定力練習》了嗎？",
            content: "",
            hasImage: true,
            imageType: "welcome",
            imageName: "呼吸穩定.png"
          },
          {
            title: "嗨！歡迎你開始今天的\n《呼吸穩定力》練習",
            content: "",
            icon: "Hi",
            showGreeting: true
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
        ]
      },
      "五感察覺練習": {
        steps: [
          {
            title: "準備好來開始\n今天的《五感察覺練習》了嗎？",
            content: "",
            hasImage: true,
            imageType: "welcome",
            imageName: "五感察覺.png"
          },
          {
            title: "嗨！歡迎你開始今天的\n《五感察覺》練習",
            content: "",
            icon: "Hi",
            showGreeting: true
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
            title: "很好，再接下來的8分鐘，\n邀請你跟著聲音指示\n進行五感察覺～",
            content: ""
          },
          {
            title: "",
            content: "讓我們開始進行練習。",
            hasAudio: true
          },
          {
            title: "你做得很好，",
            content: "今天你練習了8分鐘的五感察覺\n請利用以下空間記錄下今日的練習",
            hasForm: true
          },
          {
            title: "恭喜你完成了今天的",
            content: "《五感察覺練習》，\n讓我們來整理你的回饋吧！",
            hasSummary: true
          }
        ]
      },
      "情緒舒緩練習": {
        steps: [
          {
            title: "準備好來開始\n今天的《情緒舒緩練習》了嗎？",
            content: "",
            hasImage: true,
            imageType: "welcome",
            imageName: "情緒理解.png"
          },
          {
            title: "嗨！歡迎你開始今天的\n《情緒舒緩》練習",
            content: "",
            icon: "Hi",
            showGreeting: true
          },
          {
            title: "這個練習能協助你\n舒緩情緒壓力，\n找到內心的平靜",
            content: ""
          },
          {
            title: "請你找個舒服的位置，",
            content: "坐下，或躺下",
            hasImage: true,
            imageType: "positions"
          },
          {
            title: "很好，再接下來的10分鐘，\n邀請你跟著聲音指示\n進行情緒舒緩～",
            content: ""
          },
          {
            title: "",
            content: "讓我們開始進行練習。",
            hasAudio: true
          },
          {
            title: "你做得很好，",
            content: "今天你練習了10分鐘的情緒舒緩\n請利用以下空間記錄下今日的練習",
            hasForm: true
          },
          {
            title: "恭喜你完成了今天的",
            content: "《情緒舒緩練習》，\n讓我們來整理你的回饋吧！",
            hasSummary: true
          }
        ]
      }
    };
    return practices[practiceType] || practices["呼吸覺定力練習"];
  };

  const practiceData = getPracticeContent();
  const currentStepData = practiceData.steps[currentStep];
  const totalSteps = practiceData.steps.length;
  const progressPercentage = ((currentStep + 1) / totalSteps) * 100;

  useEffect(() => {
    if (currentStepData.hasAudio && !sound) {
      loadAudio();
    }
  }, [currentStep]);

  const formatTime = (milliseconds) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const nextStep = () => {
    if (currentStep < practiceData.steps.length - 1) {
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

  const renderStepContent = () => {
    if (currentStepData.hasForm) {
      return (
        <View style={styles.formSection}>
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
            <Text style={styles.inputLabel}>我想對情緒有自己一點時間，{'\n'}好好呼吸、與自己共處的自己說：</Text>
            <TextInput 
              style={styles.largeInputBox} 
              multiline 
              placeholder="寫下想對自己說的話"
              placeholderTextColor="rgba(0, 0, 0, 0.4)"
              value={formData.reflection}
              onChangeText={(text) => updateFormData('reflection', text)}
            />
          </View>
        </View>
      );
    }

    if (currentStepData.hasSummary) {
      return (
        <View style={styles.summarySection}>
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
          
          <TouchableOpacity style={styles.finishButton} onPress={onBack}>
            <Text style={styles.finishButtonText}>結束今日練習</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (currentStepData.hasAudio) {
      return (
        <View style={styles.audioPlayer}>
          <View style={styles.audioCard}>
            <View style={styles.albumCover}>
              <Image 
                source={require('./assets/images/ocean-breathe.png')}
                style={styles.albumCoverImage}
                resizeMode="cover"
              />
              <View style={styles.albumOverlay}>
              </View>
            </View>
            
            <View style={styles.timeContainer}>
              <Text style={styles.timeText}>{formatTime(position)}</Text>
              <View style={styles.progressSlider}>
                <View style={[styles.progressBar, { width: duration > 0 ? `${(position / duration) * 100}%` : '40%' }]} />
                <View style={[styles.progressHandle, { left: duration > 0 ? `${(position / duration) * 100}%` : '40%' }]} />
              </View>
              <Text style={styles.timeText}>{formatTime(duration) || '5:50'}</Text>
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
                  source={require('./assets/images/呼吸穩定.png')}
                  style={styles.welcomeImage}
                  resizeMode="contain"
                />
              </View>
            </View>
          ) : currentStepData.imageType === "positions" ? (
            <View style={styles.positionImagesContainer}>
              <View style={styles.positionImageTop}>
                <Image 
                  source={require('./assets/images/lying-position.png')}
                  style={styles.positionImageFile}
                  resizeMode="contain"
                />
              </View>
              <View style={styles.positionImageBottom}>
                <Image 
                  source={require('./assets/images/sitting-position.png')}
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
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="rgba(46, 134, 171, 0.7)" />
        
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack}>
            <Text style={styles.closeButton}>✕</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>《{practiceType}》</Text>
          <TouchableOpacity>
            <Text style={styles.menuButton}>⋯</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.progressContainer}>
          <View style={styles.progressBarContainer}>
            <View style={[styles.progressBarFill, { width: `${progressPercentage}%` }]} />
          </View>
        </View>

        <View style={styles.contentContainer}>
          <View style={styles.stepHeader}>
            <Text style={styles.stepTitle}>{currentStepData.title}</Text>
          </View>

          {renderStepContent()}
        </View>

        <View style={styles.bottomNav}>
          <TouchableOpacity 
            onPress={prevStep}
            disabled={currentStep === 0}
            style={[styles.navButton, currentStep === 0 && styles.navButtonDisabled]}
          >
            <Text style={styles.navButtonText}>〈</Text>
          </TouchableOpacity>
          
          <View style={styles.progressIndicator}>
            {practiceData.steps.map((_, index) => (
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
            disabled={currentStep === practiceData.steps.length - 1}
            style={[styles.navButton, currentStep === practiceData.steps.length - 1 && styles.navButtonDisabled]}
          >
            <Text style={styles.navButtonText}>〉</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(46, 134, 171, 0.7)',
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
    justifyContent: 'center',
  },
  stepHeader: {
    alignItems: 'center',
    marginBottom: 40,
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
    marginBottom: 30,
  },
  
  // Greeting section
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
  
  // Image sections
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

  // Audio player
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
    position: 'relative',
  },
  albumCoverImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  albumOverlay: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    zIndex: 1,
  },
  albumText: {
    fontSize: 14,
    color: '#FFFFFF',
    textAlign: 'left',
    fontStyle: 'italic',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  audioControls: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    justifyContent: 'center',
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
    opacity: 0.8,
  },

  // Form styles
  formSection: {
    marginBottom: 30,
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
    backgroundColor: '#DBDBDB',
    marginVertical: 15,
  },

  // Summary styles
  summarySection: {
    marginBottom: 30,
  },
  summaryCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
  },
  summaryTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'rgba(0, 0, 0, 0.6)',
    marginBottom: 8,
  },
  summaryContent: {
    fontSize: 14,
    color: 'rgba(0, 0, 0, 0.6)',
    lineHeight: 20,
  },
  finishButton: {
    backgroundColor: 'rgba(46, 134, 171, 0.8)',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
    alignSelf: 'center',
    marginTop: 15,
  },
  finishButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },

  // Bottom navigation
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 30,
    paddingVertical: 20,
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
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    width: 12,
    height: 12,
    borderRadius: 6,
  },
});