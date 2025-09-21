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

// 练习课程组件
export default function PracticeScreen({ practiceType = "呼吸覺定力練習", onBack }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [sound, setSound] = useState(null);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  
  // 表单数据状态
  const [formData, setFormData] = useState({
    feeling: '',
    noticed: '',
    reflection: ''
  });

  // 本地音频文件路径
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

  // 载入音频文件
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
      
      // 获取音频长度
      const status = await newSound.getStatusAsync();
      if (status.isLoaded) {
        setDuration(status.durationMillis || 0);
      }
      
      // 设置播放状态更新监听
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

  // 播放/暂停音频
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

  // 清理音频资源
  useEffect(() => {
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [sound]);

  // 根据练习类型获取内容
  const getPracticeContent = () => {
    const practices = {
      "呼吸覺定力練習": {
        steps: [
          {
            title: "準備好來開始\n 今天的《呼吸穩定力練習》了嗎？",
            content: "",
            icon: "",
            hasImage: true,
            imageType: "meditation"
          },
          {
            title: "嗨！歡迎你開始今天的\n《呼吸穩定力》練習",
            content: "",
            icon: "Hi"
          },
          {
            title: "這個練習能協助你\n 平靜、專注，\n也是提升覺察力的重要基礎",
            content: ""
          },
          {
            title: "請你找個舒服的位置，",
            content: "坐下，或躺下",
            hasImage: true,
            imageType: "position"
          },
          {
            title: "很好，再接下來的分鐘，\n 邀請你跟著聲音指示\n一起呼吸～",
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
            title: "五感察覺",
            content: "準備開始五感察覺練習",
            icon: "👁️"
          },
          {
            title: "觀察練習",
            content: "用眼睛觀察周圍的環境，注意顏色、形狀、光線的變化。",
            icon: "👁️"
          },
          {
            title: "聆聽練習", 
            content: "閉上眼睛，仔細聆聽周圍的聲音，包括遠近不同的聲響。",
            icon: "👂"
          },
          {
            title: "觸覺練習",
            content: "感受身體與座椅、衣物的接觸，注意溫度和質感。",
            icon: "✋"
          },
          {
            title: "整合練習",
            content: "將五感的察覺整合在一起，保持當下的覺知。",
            icon: "🌟"
          },
          {
            title: "音頻練習",
            content: "跟隨音頻進行五感整合練習",
            hasAudio: true
          },
          {
            title: "記錄感受",
            content: "請記錄你在五感察覺練習中的體驗",
            hasForm: true
          },
          {
            title: "練習完成",
            content: "五感察覺練習已完成，查看你的記錄",
            hasSummary: true
          }
        ]
      },
      "情緒舒緩練習": {
        steps: [
          {
            title: "情緒舒緩",
            content: "準備開始情緒舒緩練習",
            icon: "💭"
          },
          {
            title: "情緒識別",
            content: "溫和地觀察目前的情緒狀態，不要評判，只是單純地覺察。",
            icon: "💭"
          },
          {
            title: "身體掃描",
            content: "從頭到腳感受身體各部位的緊張或放鬆，釋放累積的壓力。",
            icon: "🧘"
          },
          {
            title: "釋放練習",
            content: "想像將負面情緒隨著呼氣釋放出去，感受內心的平靜。",
            icon: "🌬️"
          },
          {
            title: "正念結束",
            content: "帶著平靜和接納的心境結束練習，感謝自己的努力。",
            icon: "🕯️"
          },
          {
            title: "引導音頻",
            content: "跟隨音頻進行情緒舒緩練習",
            hasAudio: true
          },
          {
            title: "情緒記錄",
            content: "請記錄你的情緒變化和感受",
            hasForm: true
          },
          {
            title: "練習總結",
            content: "情緒舒緩練習已完成，回顧你的記錄",
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

  // 当进入音频步骤时载入音频
  useEffect(() => {
    if (currentStepData.hasAudio && !sound) {
      loadAudio();
    }
  }, [currentStep]);

  // 格式化时间显示
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
              placeholderTextColor="#2E86AB"
              value={formData.feeling}
              onChangeText={(text) => updateFormData('feeling', text)}
            />
          </View>
          <View style={styles.inputField}>
            <Text style={styles.inputLabel}>練習中的發現，我發現：</Text>
            <TextInput 
              style={styles.inputBox} 
              multiline 
              placeholder="記錄練習時的發現"
              placeholderTextColor="#2E86AB"
              value={formData.noticed}
              onChangeText={(text) => updateFormData('noticed', text)}
            />
          </View>
          <View style={styles.inputField}>
            <Text style={styles.inputLabel}>我想對情緒有自己一點時間，{'\n'}好好呼吸、與自己共處的自己說：</Text>
            <TextInput 
              style={styles.largeInputBox} 
              multiline 
              placeholder="寫下想對自己說的話"
              placeholderTextColor="#2E86AB"
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
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>練習中的發現：</Text>
            <Text style={styles.summaryContent}>{formData.noticed || "未填寫內容"}</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>想和自己說的話：</Text>
            <Text style={styles.summaryContent}>{formData.reflection || "未填寫內容"}</Text>
          </View>
          <TouchableOpacity style={styles.exportButton} onPress={onBack}>
            <Text style={styles.exportButtonText}>結束今日練習</Text>
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
                <Text style={styles.albumText}>{'\n'}</Text>
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
          {currentStepData.imageType === "meditation" ? (
            <View style={styles.meditationImage}>
              <Image 
                source={require('./assets/images/meditation-pose.png')}
                style={styles.meditationImageFile}
                resizeMode="contain"
              />
            </View>
          ) : currentStepData.imageType === "position" ? (
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
        <StatusBar barStyle="light-content" backgroundColor="#2E86AB" />
        
        {/* 顶部导航 */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack}>
            <Text style={styles.closeButton}>✕</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>《{practiceType}》</Text>
          <TouchableOpacity>
            <Text style={styles.menuButton}>⋯</Text>
          </TouchableOpacity>
        </View>

        {/* 进度条 */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBarContainer}>
            <View style={[styles.progressBarFill, { width: `${progressPercentage}%` }]} />
          </View>
        </View>

        {/* 主要内容区域 */}
        <View style={styles.contentContainer}>
          
          {/* 步骤图示和标题 */}
          <View style={styles.stepHeader}>
            {currentStepData.icon && (
              <View style={styles.iconContainer}>
                <Text style={styles.stepIcon}>{currentStepData.icon}</Text>
              </View>
            )}
            <Text style={styles.stepTitle}>{currentStepData.title}</Text>
            {currentStepData.duration && (
              <Text style={styles.stepDuration}>{currentStepData.duration}</Text>
            )}
          </View>

          {/* 动态内容 */}
          {renderStepContent()}
        </View>

        {/* 底部导航 */}
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

// 样式定义
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2E86AB',
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
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  menuButton: {
    fontSize: 20,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  progressContainer: {
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  progressBarContainer: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 2,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  stepHeader: {
    alignItems: 'center',
    marginBottom: 60,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  stepIcon: {
    fontSize: 32,
  },
  stepTitle: {
    fontSize: 20,
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginBottom: 5,
    textAlign: 'center',
  },
  stepDuration: {
    fontSize: 14,
    color: '#E8E0D6',
  },
  contentText: {
    fontSize: 16,
    color: '#FFFFFF',
    lineHeight: 24,
    textAlign: 'center',
    marginBottom: 30,
  },
  
  // 图片相关样式
  imageSection: {
    alignItems: 'center',
    marginBottom: 30,
  },
  meditationImage: {
    width: 200,
    height: 200,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  meditationImageFile: {
    width: '100%',
    height: '100%',
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

  // 音频播放器样式
  audioPlayer: {
    marginBottom: 30,
  },
  audioCard: {
    backgroundColor: '#FFFFFF',
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
    color: '#2E86AB',
    width: 40,
    fontWeight: '500',
  },
  progressSlider: {
    flex: 1,
    height: 6,
    backgroundColor: '#E8E0D6',
    borderRadius: 3,
    marginHorizontal: 15,
    position: 'relative',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#2E86AB',
    borderRadius: 3,
  },
  progressHandle: {
    position: 'absolute',
    top: -6,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#2E86AB',
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
    color: '#2E86AB',
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
    color: '#2E86AB',
  },
  audioDescription: {
    fontSize: 12,
    color: '#2E86AB',
    textAlign: 'center',
    lineHeight: 18,
    opacity: 0.8,
  },

  // 表单样式
  formSection: {
    marginBottom: 30,
  },
  inputField: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    color: '#FFFFFF',
    marginBottom: 8,
    lineHeight: 20,
  },
  inputBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    height: 60,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    color: '#8B6F47',
    textAlignVertical: 'top',
  },
  largeInputBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    height: 100,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    color: '#8B6F47',
    textAlignVertical: 'top',
  },

  // 总结页面样式
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
    color: '#8B6F47',
    marginBottom: 8,
  },
  summaryContent: {
    fontSize: 14,
    color: '#6B5B47',
    lineHeight: 20,
  },
  exportButton: {
    backgroundColor: '#D4A574',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
    alignSelf: 'center',
    marginTop: 15,
  },
  exportButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },

  // 底部导航样式
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
    color: '#FFFFFF',
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