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
  Modal,
} from 'react-native';
import ApiService from '../api';

export default function SelfAwarenessPractice({ onBack, navigation }) {
  const [practiceId, setPracticeId] = useState(null);
  const [startTime, setStartTime] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [showExamples, setShowExamples] = useState(false);
  
  const [formData, setFormData] = useState({
    event: '',
    thought: '',
    mood: '',
    thoughtOrigin: '',
    thoughtValidity: '',
    thoughtImpact: '',
    responseMethod: '',
    newResponse: '',
    finalFeeling: '',
  });

  const scrollViewRef = useRef(null);

  const responseExamples = [
    '我知道你是因為在意才會這麼罵自己，但犯錯是學習的一部分，沒有人是完美的。',
    '這件事，我已經盡我最大的努力了，我看見自己的努力就夠了。',
    '我會避免下次再犯同樣的錯誤，發揮自責最大的功能，然後，自責到此刻就夠了。',
    '失敗並不代表我不好，也不代表我沒價值，它只是一個過程。',
    '我正在努力，這本身就值得被肯定，就夠讚了。',
    '不是所有事情都能被我掌控，給自己一點餘裕與空間吧。',
    '謝謝內心提醒我注意自己的行為，但我更需要鼓勵自己，才能繼續前進。',
  ];

  const steps = [
    {
      title: "準備好來開始\n今天的《自我覺察力練習》了嗎？",
      content: "",
      hasImage: true,
      imageType: "welcome",
    },
    {
      title: "嗨！歡迎你開始今天的\n《自我覺察力》練習",
      content: "",
      showGreeting: true,
    },
    {
      title: "這個練習協助你\n從錯誤與自責中平復",
      content: ""
    },
    {
      title: "在開始之前",
      content: "請先進行 3 次深深的呼吸 💨\n放鬆自己的身體與心靈",
      hasBreathing: true,
    },
    {
      title: "回想經驗",
      content: "請回想今天（或最近）曾在心裡\n責怪、懷疑自己，或覺得自己不如他人的時刻？",
      hasSupplementary: true, 
      supplementaryText: "(若今天沒有，也可以找一個困擾自己許久的自責經驗)",  
    },
    {
      title: "接下來我們將透過\n幾題自我對話，\n幫助自己調整思緒",
      content: "",
    },
    {
      title: "記錄那個時刻",
      content: "",
      hasForm: true,
      formType: "event"
    },
    {
      title: "探索想法來源",
      content: "這個想法可能是怎麼來的呢？",
      hasForm: true,
      formType: "exploration"
    },
    {
      title: "重新回應",
      content: "我可以用什麼方式重新回應這個想法",
      hasForm: true,
      formType: "response"
    },
    {
      title: "練習回顧",
      content: "寫完以上的練習，你現在的感覺如何？",
      hasForm: true,
      formType: "reflection",
      isSecondToLast: true
    },
    {
      title: "恭喜你完成了今天的",
      content: "《自我覺察力練習》",
      hasSummary: true
    }
  ];

  const totalSteps = steps.length;
  const currentStepData = steps[currentStep];
  const progressPercentage = ((currentStep + 1) / totalSteps) * 100;

  useEffect(() => {
    initializePractice();
  }, []);

  const initializePractice = async () => {
    try {
      const response = await ApiService.startPractice('自我覺察力練習');
      
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
        if (response.accumulatedSeconds && response.accumulatedSeconds > 0) {
          setElapsedTime(response.accumulatedSeconds);
          console.log(`✅ 恢復累積時間: ${response.accumulatedSeconds} 秒`);
        }

        setStartTime(Date.now());
      }
    } catch (error) {
      console.error('初始化練習失敗:', error);
    }
  };

  useEffect(() => {
    let timer;
    if (startTime) {
      timer = setInterval(() => {
        setElapsedTime(prev => prev + 1);
      }, 1000);
    }
    
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [startTime]);

  useEffect(() => {
    saveProgress();
  }, [currentStep, formData]);

  useEffect(() => {
    if (!practiceId) return;
    
    const autoSaveInterval = setInterval(() => {
      saveProgress();
    }, 1000); // 每 1 秒自動保存一次
    
    return () => clearInterval(autoSaveInterval);
  }, [practiceId, currentStep, formData, elapsedTime]);

  const saveProgress = async () => {
    if (!practiceId) return;
    
    try {
      await ApiService.updatePracticeProgress(
        practiceId,
        currentStep,
        totalSteps,
        formData,
        elapsedTime  
      );
    } catch (error) {
      console.log('儲存進度失敗:', error);
    }
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
    try {
      const totalSeconds = elapsedTime;
      const totalMinutes = Math.max(1, Math.ceil(totalSeconds / 60));
      
      // 獲取今日心情
      let todayMoodName = null;
      try {
        const moodResponse = await ApiService.getTodayMood();
        if (moodResponse && moodResponse.mood) {
          todayMoodName = moodResponse.mood.mood_name;
        }
      } catch (e) {
        console.log('獲取今日心情失敗:', e);
      }

      await ApiService.completePractice(practiceId, {
        duration: totalMinutes,
        duration_seconds: totalSeconds,
        feeling: todayMoodName || formData.mood,
        noticed: formData.event,
        reflection: formData.newResponse || formData.finalFeeling,
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
            if (navigation && navigation.canGoBack && navigation.canGoBack()) {
              navigation.goBack();
            } else if (onBack) {
              onBack();
            } else {
              // ⭐ 如果都沒有，嘗試 navigate 到首頁
              if (navigation && navigation.navigate) {
                navigation.navigate('Home');
              }
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

  const renderForm = () => {
    const { formType } = currentStepData;

    if (formType === 'event') {
      return (
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
          keyboardVerticalOffset={100}
        >
          <ScrollView 
            ref={scrollViewRef}
            style={styles.formContainer}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 40 }}
            keyboardShouldPersistTaps="handled"  
            scrollEnabled={true}
            bounces={true}
            nestedScrollEnabled={true}
          >
            <View style={styles.formCard}>
              <Text style={styles.formCardTitle}>
                今天（或最近）我對自己有哪些{'\n'}
                自我懷疑、否定、覺得自己不夠好的時刻？
              </Text>
              <Text style={styles.formCardDesc}>
                請寫下那時發生了什麼事件（客觀事實）、當下的想法（腦中的聲音）、以及心情（感受）
              </Text>

              <View style={styles.inputField}>
                <Text style={styles.inputLabel}>是什麼樣的事件：</Text>
                <TextInput 
                  style={styles.inputBox} 
                  multiline 
                  placeholder="例：同事提醒我，文件有兩個錯字。"
                  placeholderTextColor="rgba(0, 0, 0, 0.4)"
                  value={formData.event}
                  onChangeText={(text) => updateFormData('event', text)}
                />
              </View>

              <View style={styles.inputField}>
                <Text style={styles.inputLabel}>你當下的想法是什麼？</Text>
                <TextInput 
                  style={styles.largeInputBox} 
                  multiline 
                  placeholder="例：我真是太沒用了，居然有錯字，還被同事發現，好丟臉、好想離職。"
                  placeholderTextColor="rgba(0, 0, 0, 0.4)"
                  value={formData.thought}
                  onChangeText={(text) => updateFormData('thought', text)}
                />
              </View>

              <View style={styles.inputField}>
                <Text style={styles.inputLabel}>心情：</Text>
                <TextInput 
                  style={styles.inputBox} 
                  multiline 
                  placeholder="例：丟臉、難過"
                  placeholderTextColor="rgba(0, 0, 0, 0.4)"
                  value={formData.mood}
                  onChangeText={(text) => updateFormData('mood', text)}
                />
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      );
    }

    if (formType === 'exploration') {
      return (
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
          keyboardVerticalOffset={100}
        >
          <ScrollView 
            ref={scrollViewRef}
            style={styles.formContainer}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 40 }}
            keyboardShouldPersistTaps="handled"  
            scrollEnabled={true}                 
            bounces={true}                       
            nestedScrollEnabled={true}
          >
            <View style={styles.formCard}>
              <View style={styles.inputField}>
                <Text style={styles.inputLabel}>
                  這個想法是從何而來的？從什麼時候開始？{'\n'}
                  是誰跟我說過類似的話嗎？
                </Text>
                <View style={styles.answerDisplayBox}>
                  <Text style={styles.answerDisplayText}>
                    {formData.thoughtOrigin || '請寫下你的想法...'}
                  </Text>
                </View>
              </View>

              <View style={styles.separator} />

              <View style={styles.inputField}>
                <Text style={styles.inputLabel}>
                  這個想法有多大程度是真實的？{'\n'}
                  是否有客觀證據反對這個想法？
                </Text>
                <View style={styles.answerDisplayBox}>
                  <Text style={styles.answerDisplayText}>
                    {formData.thoughtValidity || '請寫下你的想法...'}
                  </Text>
                </View>
              </View>

              <View style={styles.separator} />

              <View style={styles.inputField}>
                <Text style={styles.inputLabel}>
                  這個想法對我的正向與負向的影響是什麼？
                </Text>
                <View style={styles.answerDisplayBox}>
                  <Text style={styles.answerDisplayText}>
                    {formData.thoughtImpact || '請寫下你的想法...'}
                  </Text>
                </View>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      );
    }

    if (formType === 'response') {
      return (
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
          keyboardVerticalOffset={100}
        >
          <ScrollView 
            ref={scrollViewRef}
            style={styles.formContainer}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 40 }}
          >
            <View style={styles.formCard}>
              <Text style={styles.choicePrompt}>選擇一個回應方式：</Text>
              
              <TouchableOpacity
                style={[
                  styles.methodButton,
                  formData.responseMethod === 'friend' && styles.methodButtonSelected
                ]}
                onPress={() => updateFormData('responseMethod', 'friend')}
              >
                <Text style={[
                  styles.methodButtonText,
                  formData.responseMethod === 'friend' && styles.methodButtonTextSelected
                ]}>
                  如果我的朋友有這樣的想法，我會怎麼回應他？
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.methodButton,
                  formData.responseMethod === 'inner' && styles.methodButtonSelected
                ]}
                onPress={() => updateFormData('responseMethod', 'inner')}
              >
                <Text style={[
                  styles.methodButtonText,
                  formData.responseMethod === 'inner' && styles.methodButtonTextSelected
                ]}>
                  如果你的內在有一個支持你的聲音，它現在會說什麼？
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.methodButton,
                  formData.responseMethod === 'future' && styles.methodButtonSelected
                ]}
                onPress={() => updateFormData('responseMethod', 'future')}
              >
                <Text style={[
                  styles.methodButtonText,
                  formData.responseMethod === 'future' && styles.methodButtonTextSelected
                ]}>
                  你希望自己未來如何回應這個想法？
                </Text>
              </TouchableOpacity>

              <View style={styles.responseInputSection}>
                <TextInput 
                  style={styles.largeInputBox} 
                  multiline 
                  placeholder="寫下你的回應..."
                  placeholderTextColor="rgba(0, 0, 0, 0.4)"
                  value={formData.newResponse}
                  onChangeText={(text) => updateFormData('newResponse', text)}
                />
              </View>

              <TouchableOpacity
                style={styles.exampleButton}
                onPress={() => setShowExamples(true)}
              >
                <Text style={styles.exampleButtonText}>💡 查看回應範例</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      );
    }

    if (formType === 'reflection') {
      return (
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
          keyboardVerticalOffset={100}
        >
          <ScrollView 
            ref={scrollViewRef}
            style={styles.formContainer}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 40 }}
          >
            <View style={styles.formCard}>
              <Text style={styles.reflectionPrompt}>
                與練習前有什麼不同嗎？
              </Text>
              
              <View style={styles.inputField}>
                <TextInput 
                  style={styles.largeInputBox} 
                  multiline 
                  placeholder="請分享你現在的感受..."
                  placeholderTextColor="rgba(0, 0, 0, 0.4)"
                  value={formData.finalFeeling}
                  onChangeText={(text) => updateFormData('finalFeeling', text)}
                />
              </View>

              <TouchableOpacity 
                style={styles.completeButton} 
                onPress={nextStep}
              >
                <Text style={styles.completeButtonText}>我完成練習了！</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      );
    }

    return null;
  };

  const renderSummary = () => {
    return (
      <ScrollView 
        style={styles.summaryScrollView}
        contentContainerStyle={styles.summaryScrollContent}
        showsVerticalScrollIndicator={true}
      >
        {/* 第一部分：那個時刻 */}
        <View style={styles.summaryCard}>
          <Text style={styles.summarySectionTitle}>📍 發生了甚麼</Text>
          
          <View style={styles.summaryItemContainer}>
            <Text style={styles.summaryItemLabel}>事件</Text>
            <View style={styles.summaryAnswerBox}>
              <Text style={styles.summaryAnswerText}>
                {formData.event || '無紀錄'}
              </Text>
            </View>
          </View>

          <View style={styles.summaryItemContainer}>
            <Text style={styles.summaryItemLabel}>想法</Text>
            <View style={styles.summaryAnswerBox}>
              <Text style={styles.summaryAnswerText}>
                {formData.thought || '無紀錄'}
              </Text>
            </View>
          </View>

          <View style={styles.summaryItemContainer}>
            <Text style={styles.summaryItemLabel}>心情</Text>
            <View style={styles.summaryAnswerBox}>
              <Text style={styles.summaryAnswerText}>
                {formData.mood || '無紀錄'}
              </Text>
            </View>
          </View>
        </View>

        {/* 第二部分：探索想法 - 移除條件判斷，全部顯示 */}
        <View style={styles.summaryCard}>
          <Text style={styles.summarySectionTitle}>🔍 探索想法</Text>
          
          <View style={styles.summaryItemContainer}>
            <Text style={styles.summaryItemLabel}>想法來源</Text>
            <View style={styles.summaryAnswerBox}>
              <Text style={styles.summaryAnswerText}>
                {formData.thoughtOrigin || '無紀錄'}
              </Text>
            </View>
          </View>

          <View style={styles.summaryItemContainer}>
            <Text style={styles.summaryItemLabel}>真實性檢驗</Text>
            <View style={styles.summaryAnswerBox}>
              <Text style={styles.summaryAnswerText}>
                {formData.thoughtValidity || '無紀錄'}
              </Text>
            </View>
          </View>

          <View style={styles.summaryItemContainer}>
            <Text style={styles.summaryItemLabel}>影響</Text>
            <View style={styles.summaryAnswerBox}>
              <Text style={styles.summaryAnswerText}>
                {formData.thoughtImpact || '無紀錄'}
              </Text>
            </View>
          </View>
        </View>

        {/* 第三部分：我的回應 - 移除條件判斷 */}
        <View style={styles.summaryCard}>
          <Text style={styles.summarySectionTitle}>💭 我的回應</Text>
          
          <View style={styles.summaryItemContainer}>
            <Text style={styles.summaryMethodLabel}>回應方式：</Text>
            <View style={styles.summaryMethodTag}>
              <Text style={styles.summaryMethodText}>
                {formData.responseMethod === 'friend' && '以朋友的角度'}
                {formData.responseMethod === 'inner' && '內在支持的聲音'}
                {formData.responseMethod === 'future' && '未來的回應方式'}
                {!formData.responseMethod && '無紀錄'}
              </Text>
            </View>
          </View>

          <View style={styles.summaryItemContainer}>
            <Text style={styles.summaryItemLabel}>新的回應</Text>
            <View style={styles.summaryHighlightBox}>
              <Text style={styles.summaryHighlightText}>
                {formData.newResponse || '無紀錄'}
              </Text>
            </View>
          </View>
        </View>

        {/* 第四部分：練習後的感受 */}
        <View style={styles.summaryCard}>
          <Text style={styles.summarySectionTitle}>✨ 練習後的感受</Text>
          
          <View style={styles.summaryItemContainer}>
            <View style={styles.summaryAnswerBox}>
              <Text style={styles.summaryAnswerText}>
                {formData.finalFeeling || '無紀錄'}
              </Text>
            </View>
          </View>
        </View>

        {/* 結語 */}
        <View style={styles.summaryFooter}>
          <Text style={styles.summaryFooterText}>
            🌟 透過覺察和重新回應內在的聲音，{'\n'}
            你正在學習以更溫暖、接納的方式對待自己
          </Text>
        </View>

        <TouchableOpacity style={styles.finishButton} onPress={handleComplete}>
          <Text style={styles.finishButtonText}>完成今日練習</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  };

  const renderStepContent = () => {
    if (currentStepData.hasSummary) {
      return renderSummary();
    }

    if (currentStepData.hasForm) {
      return renderForm();
    }

    if (currentStepData.hasImage) {
      return (
        <View style={styles.imageSection}>
          <View style={styles.welcomeImageContainer}>
            <View style={styles.welcomeImageWhiteBox}>
              <Image 
                source={require('../assets/images/自我覺察.png')}
                style={styles.welcomeImage}
                resizeMode="contain"
              />
            </View>
          </View>
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

    if (currentStepData.hasBreathing) {
      return (
        <View style={styles.breathingSection}>
          <View style={styles.breathingCard}>
            <Image 
              source={require('../assets/images/DeepBreathe.png')}
              style={styles.breathingImage}
              resizeMode="contain"
            />
            <Text style={styles.breathingText}>深呼吸 3 次</Text>
          </View>
        </View>
      );
    }

    if (currentStepData.content) {
      return (
        <View>
          <Text style={styles.contentText}>{currentStepData.content}</Text>
          {currentStepData.hasSupplementary && (
            <Text style={styles.supplementaryText}>
              {currentStepData.supplementaryText}
            </Text>
          )}
        </View>
      );
    }

    return null;
  };

  const isLastStep = currentStep === steps.length - 1;
  const isSecondToLast = currentStepData.isSecondToLast;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F1EAE4" />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack || (() => navigation?.goBack())}>
          <Text style={styles.closeButton}>✕</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>《自我覺察力練習》</Text>
        <TouchableOpacity>
          <Text style={styles.menuButton}>⋯</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.progressContainer}>
        <View style={styles.progressBarContainer}>
          <View style={[styles.progressBarFill, { width: `${progressPercentage}%` }]} />
        </View>
      </View>

      {currentStepData.hasSummary ? (
        renderStepContent()
      ) : currentStepData.hasForm ? (  
        <View style={styles.contentContainer}>
          <View style={styles.stepHeader}>
            <Text style={styles.stepTitle}>{currentStepData.title}</Text>
            {currentStepData.content && (
              <Text style={styles.contentSubtitle}>{currentStepData.content}</Text>
            )}
          </View>
          {renderStepContent()}
        </View>
      ) : (
        <TouchableWithoutFeedback onPress={dismissKeyboard}>
          <View style={styles.contentContainer}>
            <View style={styles.stepHeader}>
              <Text style={styles.stepTitle}>{currentStepData.title}</Text>
            </View>
            {renderStepContent()}
          </View>
        </TouchableWithoutFeedback>
      )}

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
          
          <TouchableOpacity 
            onPress={nextStep}
            disabled={isSecondToLast}
            style={[
              styles.navArrowButton,
              isSecondToLast && styles.navButtonDisabled
            ]}
          >
            <Text style={styles.navArrowText}>›</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* 範例彈窗 */}
      <Modal
        visible={showExamples}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowExamples(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>💡 回應範例</Text>
            <ScrollView style={styles.examplesList} showsVerticalScrollIndicator={true}>
              {responseExamples.map((example, index) => (
                <View key={index} style={styles.exampleItem}>
                  <Text style={styles.exampleBullet}>•</Text>
                  <Text style={styles.exampleText}>{example}</Text>
                </View>
              ))}
            </ScrollView>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowExamples(false)}
            >
              <Text style={styles.modalCloseText}>關閉</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F1EAE4',
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
    backgroundColor: '#D49650',
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
    color: 'rgba(0, 0, 0, 0.75)',
    fontWeight: 'bold',
    textAlign: 'center',
    lineHeight: 28,
  },
  contentSubtitle: {  
    fontSize: 16,
    color: 'rgba(0, 0, 0, 0.65)',
    textAlign: 'center',
    marginTop: 10,
    lineHeight: 24,
  },
  contentText: {
    fontSize: 16,
    color: 'rgba(0, 0, 0, 0.65)',
    lineHeight: 24,
    textAlign: 'center',
    marginTop: 10,
  },
  supplementaryText: {
    fontSize: 14,
    color: 'rgba(0, 0, 0, 0.35)',  // 更淡的顏色
    lineHeight: 22,
    textAlign: 'center',
    marginTop: 12,
    fontStyle: 'italic',  // 斜體
    backgroundColor: 'rgba(212, 150, 80, 0.08)',  // 淡淡的背景色
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginHorizontal: 20,
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
    color: '#D49650',
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
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  welcomeImage: {
    width: '90%',
    height: '90%',
  },
  breathingSection: {
    alignItems: 'center',
    marginTop: 20,
  },
  breathingCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 16,
    padding: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  breathingImage: {
    width: 120,
    height: 120,
    marginBottom: 15,
  },
  breathingText: {
    fontSize: 18,
    color: '#D49650',
    fontWeight: '600',
  },
  formContainer: {
    flex: 1,
    marginBottom: 20,
  },
  formCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  formCardTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: 'rgba(0, 0, 0, 0.75)',
    marginBottom: 12,
    lineHeight: 24,
  },
  formCardDesc: {
    fontSize: 14,
    color: 'rgba(0, 0, 0, 0.55)',
    marginBottom: 20,
    lineHeight: 20,
  },
  inputField: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 15,
    color: 'rgba(0, 0, 0, 0.7)',
    marginBottom: 8,
    lineHeight: 22,
    fontWeight: '500',
  },
  inputBox: {
    backgroundColor: 'rgba(241, 234, 228, 0.5)',
    borderWidth: 1,
    borderColor: 'rgba(212, 150, 80, 0.3)',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: 'rgba(0, 0, 0, 0.75)',
    minHeight: 60,
    textAlignVertical: 'top',
  },
  largeInputBox: {
    backgroundColor: 'rgba(241, 234, 228, 0.5)',
    borderWidth: 1,
    borderColor: 'rgba(212, 150, 80, 0.3)',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: 'rgba(0, 0, 0, 0.75)',
    minHeight: 100,
    textAlignVertical: 'top',
  },
  separator: {
    height: 1,
    backgroundColor: 'rgba(212, 150, 80, 0.2)',
    marginVertical: 15,
  },
  choicePrompt: {
    fontSize: 16,
    fontWeight: '600',
    color: 'rgba(0, 0, 0, 0.75)',
    marginBottom: 16,
  },
  methodButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderWidth: 2,
    borderColor: 'rgba(212, 150, 80, 0.3)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  methodButtonSelected: {
    backgroundColor: 'rgba(212, 150, 80, 0.15)',
    borderColor: '#D49650',
  },
  methodButtonText: {
    fontSize: 15,
    color: 'rgba(0, 0, 0, 0.65)',
    textAlign: 'center',
    lineHeight: 22,
    fontWeight: '500',
  },
  methodButtonTextSelected: {
    color: '#D49650',
    fontWeight: '600',
  },
  responseInputSection: {
    marginTop: 20,
    marginBottom: 10,
  },
  exampleButton: {
    alignSelf: 'center',
    backgroundColor: 'rgba(212, 150, 80, 0.1)',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginTop: 10,
  },
  exampleButtonText: {
    color: '#D49650',
    fontSize: 14,
    fontWeight: '500',
  },
  reflectionPrompt: {
    fontSize: 15,
    color: 'rgba(0, 0, 0, 0.65)',
    marginBottom: 16,
    lineHeight: 22,
  },
  completeButton: {
    backgroundColor: '#ffffffff',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 25,
    alignSelf: 'center',
    marginTop: 20,
    borderWidth: 2,
    borderColor: '#D49650',
  },
  completeButtonText: {
    color: '#D49650',
    fontSize: 16,
    fontWeight: 'bold',
  },
  summaryScrollView: {
    flex: 1,
  },
  summaryScrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 150,
  },
  summaryCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 12,
    padding: 18,
    marginBottom: 16,
    shadowColor: '#000000ff',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  summarySectionTitle: {
    fontSize: 19,  // 增大
    fontWeight: 'bold',  // 加粗
    color: '#D49650',
    marginBottom: 16,
    paddingBottom: 8,
    borderBottomWidth: 2,  // 新增底線
    borderBottomColor: 'rgba(212, 150, 80, 0.2)',
  },
  summaryItemContainer: {
    marginBottom: 16,
  },
  summaryItemLabel: {
    fontSize: 16.5,
    fontWeight: '600',
    color: '#D49650',  // 使用主題色
    marginBottom: 6,
    textTransform: 'uppercase',  // 大寫（可選）
    letterSpacing: 0.5,
  },
  summaryAnswerBox: {
    backgroundColor: 'rgba(244, 238, 233, 0.4)',  // 淡背景
    borderLeftWidth: 3,
    borderLeftColor: '#ebd6a9ff',
    /*backgroundColor: 'rgba(241, 234, 228, 0.4)',
    borderWidth: 1,
    borderColor: 'rgba(212, 150, 80, 0.3)',*/
    borderRadius: 8,
    padding: 12,
    minHeight: 40,
  },
  summaryAnswerText: {
    fontSize: 15,
    color: 'rgba(86, 86, 86, 0.75)',
    lineHeight: 22,
  },
  summaryHighlightBox: {
    backgroundColor: 'rgba(241, 234, 228, 0.4)',
    borderWidth: 1,
    borderColor: 'rgba(212, 150, 80, 0.3)',
    borderRadius: 10,
    padding: 14,
    minHeight: 60,
  },
  summaryHighlightText: {
    fontSize: 15,
    color: 'rgba(86, 86, 86, 0.75)',
    lineHeight: 24,
    fontStyle: 'italic',
  },
  summaryMethodLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(0, 0, 0, 0.65)',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  summaryMethodTag: {
    backgroundColor: 'rgba(212, 150, 80, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'rgba(212, 150, 80, 0.3)',
    alignSelf: 'flex-start', 
  },
  summaryMethodText: {
    fontSize: 13,
    color: '#D49650',
    fontWeight: '600',
  },
  summaryFooter: {
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'rgba(212, 150, 80, 0.08)',
    borderRadius: 12,
  },
  summaryFooterText: {
    fontSize: 14,
    color: 'rgba(0, 0, 0, 0.6)',
    textAlign: 'center',
    lineHeight: 22,
  },
  answerDisplayBox: {
    backgroundColor: 'rgba(241, 234, 228, 0.5)',
    borderWidth: 1,
    borderColor: 'rgba(212, 150, 80, 0.3)',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    minHeight: 60,
  },
  answerDisplayText: {
    fontSize: 15,
    color: 'rgba(0, 0, 0, 0.75)',
    lineHeight: 22,
  },
  finishButton: {
    backgroundColor: '#D49650',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 25,
    alignSelf: 'center',
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
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
    color: '#D49650',
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
    backgroundColor: 'rgba(212, 150, 80, 0.3)',
    marginHorizontal: 4,
  },
  progressDotActive: {
    backgroundColor: '#D49650',
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '70%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#D49650',
    marginBottom: 15,
    textAlign: 'center',
  },
  examplesList: {
    maxHeight: 400,
  },
  exampleItem: {
    flexDirection: 'row',
    marginBottom: 15,
    paddingHorizontal: 10,
  },
  exampleBullet: {
    color: '#D49650',
    marginRight: 10,
    fontSize: 16,
  },
  exampleText: {
    flex: 1,
    fontSize: 14,
    color: 'rgba(0, 0, 0, 0.7)',
    lineHeight: 20,
  },
  modalCloseButton: {
    marginTop: 20,
    paddingVertical: 12,
    backgroundColor: '#D49650',
    borderRadius: 8,
  },
  modalCloseText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
});