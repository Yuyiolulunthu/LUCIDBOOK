//EmotionPractice
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
import ApiService from '../../../../api';

export default function EmotionPractice({ onBack, navigation }) {
  const [practiceId, setPracticeId] = useState(null);
  const [startTime, setStartTime] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  
  const [formData, setFormData] = useState({
    moment: '',
    whatHappened: '',
    selectedEmotions: [],
    bodyFeeling: '',
    meaningChoice: '',
    meaningText: '',
    copingChoice: '',
    enjoyMessage: '',
    acceptReminder: '',
    regulateChoice: '',
    selfTalkText: '',
    exerciseText: '',
    happyThingText: '',
  });

  const scrollViewRef = useRef(null);

  const emotionsList = [
    '開心', '興奮', '滿足', '感恩', '平靜',
    '悲傷', '失望', '沮喪', '孤單', '無助',
    '生氣', '憤怒', '煩躁', '不耐煩', '受傷',
    '焦慮', '擔心', '緊張', '害怕', '恐懼',
    '羞愧', '內疚', '後悔', '尷尬', '無力',
    '困惑', '迷茫', '麻木', '空虛', '厭煩'
  ];

  const steps = [
    {
      title: "準備好來開始\n今天的《情緒理解力練習》了嗎？",
      content: "",
      hasImage: true,
      imageType: "welcome",
    },
    {
      title: "嗨！歡迎你開始今天的\n《情緒理解力》練習",
      content: "",
      showGreeting: true,
    },
    {
      title: "這個練習能協助你\n覺察與理解自己的情緒，\n找到情緒背後的訊息",
      content: ""
    },
    {
      title: "是什麼時刻？",
      content: "發生了什麼事呢？",
      hasEmotionForm: true,
      formType: "moment"
    },
    {
      title: "印象中，我當時的情緒是？",
      content: "可以選擇多個情緒",
      hasEmotionForm: true,
      formType: "emotions"
    },
    {
      title: "當時我的身體有什麼感覺？",
      content: "",
      hasEmotionForm: true,
      formType: "bodyFeeling"
    },
    {
      title: "試著想想這些情緒、感受代表著什麼？",
      content: "",
      hasEmotionForm: true,
      formType: "meaning"
    },
    {
      title: "我選擇怎樣面對這些情緒？",
      content: "",
      hasEmotionForm: true,
      formType: "coping"
    },
    {
      title: formData.copingChoice === 'enjoy' ? "我喜歡，要享受它！" :
             formData.copingChoice === 'accept' ? "我雖然不喜歡，但我接納它" :
             formData.copingChoice === 'regulate' ? "我不喜歡，想調節它" : "",
      content: "",
      hasEmotionForm: true,
      formType: "copingFollow",
      isSecondToLast: true
    },
    {
      title: "",
      content: "",
      hasMoodMessage: true,
      showOnlyFor: ['accept', 'regulate']
    },
    {
      title: "你的情緒日記",
      content: "",
      hasEmotionSummary: true
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
      const response = await ApiService.startPractice('情緒理解力練習');
      
      if (response.practiceId) {
        setPracticeId(response.practiceId);
        
        if (response.isNewPractice) {
          // 🔥 這是新練習，確保從頭開始
          console.log('✅ 開始新練習，重置所有狀態');
          setCurrentStep(0);  // 明確設為第0頁
          setFormData({        // 重置表單數據
            moment: '',
            whatHappened: '',
            selectedEmotions: [],
            bodyFeeling: '',
            meaningChoice: '',
            meaningText: '',
            copingChoice: '',
            enjoyMessage: '',
            acceptReminder: '',
            regulateChoice: '',
            selfTalkText: '',
            exerciseText: '',
            happyThingText: '',
          });
          setElapsedTime(0);   // 重置時間
          setStartTime(Date.now());
          
        } else if (response.currentPage !== undefined && response.currentPage !== null) {
          console.log(`✅ 恢復練習進度到第 ${response.currentPage} 頁`);
          
          const validPage = Math.max(0, Math.min(response.currentPage, steps.length - 1));
          
          if (validPage !== response.currentPage) {
            console.warn(`⚠️ 頁碼 ${response.currentPage} 超出範圍，調整為 ${validPage}`);
          }
          
          setCurrentStep(validPage);
          
          // 恢復表單數據
          if (response.formData) {
            try {
              const parsedData = typeof response.formData === 'string' 
                ? JSON.parse(response.formData) 
                : response.formData;
              
              console.log('✅ 恢復表單數據:', parsedData);
              setFormData(parsedData);
            } catch (e) {
              console.log('⚠️ 解析表單數據失敗:', e);
              // 解析失敗時使用空數據
              setFormData({
                moment: '',
                whatHappened: '',
                selectedEmotions: [],
                bodyFeeling: '',
                meaningChoice: '',
                meaningText: '',
                copingChoice: '',
                enjoyMessage: '',
                acceptReminder: '',
                regulateChoice: '',
                selfTalkText: '',
                exerciseText: '',
                happyThingText: '',
              });
            }
          }
          
          // 恢復累積時間
          const restoredTime = response.accumulatedSeconds || 0;
          setElapsedTime(restoredTime);
          console.log(`✅ 恢復累積時間: ${restoredTime} 秒`);
          
          setStartTime(Date.now());
          
        } else {
          // 🔥 沒有明確的 currentPage，視為新練習
          console.log('✅ 無進度記錄，從第0頁開始');
          setCurrentStep(0);
          setElapsedTime(0);
          setStartTime(Date.now());
        }
      } else {
        console.error('❌ 未收到 practiceId');
        Alert.alert('錯誤', '無法開始練習，請重試');
      }
    } catch (error) {
      console.error('❌ 初始化練習失敗:', error);
      Alert.alert('錯誤', '無法連接伺服器，請檢查網路連線');
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
    let nextStepIndex = currentStep + 1;
    
    if (nextStepIndex >= steps.length) return;
    
    while (nextStepIndex < steps.length) {
      const nextStepData = steps[nextStepIndex];
      
      if (nextStepData.showOnlyFor) {
        if (nextStepData.showOnlyFor.includes(formData.copingChoice)) {
          break;
        } else {
          nextStepIndex++;
          continue;
        }
      }
      
      break;
    }
    
    if (nextStepIndex < steps.length) {
      setCurrentStep(nextStepIndex);
      scrollViewRef.current?.scrollTo({ y: 0, animated: false });
    }
  };

  const prevStep = () => {
    if (currentStep === 0) return;
    
    let prevStepIndex = currentStep - 1;
    
    while (prevStepIndex >= 0) {
      const prevStepData = steps[prevStepIndex];
      
      if (prevStepData.showOnlyFor) {
        if (prevStepData.showOnlyFor.includes(formData.copingChoice)) {
          break;
        } else {
          prevStepIndex--;
          continue;
        }
      }
      
      break;
    }
    
    if (prevStepIndex >= 0) {
      setCurrentStep(prevStepIndex);
      scrollViewRef.current?.scrollTo({ y: 0, animated: false });
    }
  };

  const updateFormData = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const toggleEmotion = (emotion) => {
    setFormData(prev => {
      const newEmotions = prev.selectedEmotions.includes(emotion)
        ? prev.selectedEmotions.filter(e => e !== emotion)
        : [...prev.selectedEmotions, emotion];
      return {
        ...prev,
        selectedEmotions: newEmotions
      };
    });
  };

  const getMeaningPrompt = () => {
    const prompts = {
      'why': '這個情緒為什麼會出現？',
      'need': '這個情緒反映我有什麼需求、期待沒被滿足嗎？',
      'message': '它是否想告訴我一些訊息？或提醒我什麼？'
    };
    return prompts[formData.meaningChoice] || '';
  };

  const getCopingContent = () => {
    const content = {
      'enjoy': {
        title: '太好了！',
        text: '既然你喜歡這個情緒，那就好好享受它吧！\n讓自己沉浸在這份感受中。'
      },
      'accept': {
        title: '很棒的覺察！',
        text: '接納情緒是很重要的一步。\n雖然不喜歡，但願意與它共處，\n這需要很大的勇氣。'
      },
      'regulate': {
        title: '理解你的需要',
        text: '想要調節情緒是很自然的。\n讓我們一起找到適合的方式\n來照顧自己的感受。'
      }
    };
    return content[formData.copingChoice] || content['accept'];
  };

  const handleComplete = async () => {
    try {
      const totalSeconds = elapsedTime;
      const totalMinutes = Math.max(1, Math.ceil(totalSeconds / 60));
      
      // ⭐ 新增：獲取今日心情
      let todayMoodName = null;
      try {
        const moodResponse = await ApiService.getTodayMood();
        if (moodResponse && moodResponse.mood) {
          todayMoodName = moodResponse.mood.mood_name;
        }
      } catch (e) {
        console.log('獲取今日心情失敗:', e);
      }

      let regulateText = '';
      if (formData.regulateChoice === 'selfTalk') {
        regulateText = formData.selfTalkText;
      } else if (formData.regulateChoice === 'exercise') {
        regulateText = formData.exerciseText;
      } else if (formData.regulateChoice === 'happyThing') {
        regulateText = formData.happyThingText;
      }

      const emotionData = {
        moment: formData.moment,
        what_happened: formData.whatHappened,
        selected_emotions: formData.selectedEmotions,
        body_feeling: formData.bodyFeeling,
        meaning_choice: formData.meaningChoice,
        meaning_text: formData.meaningText,
        coping_choice: formData.copingChoice,
        enjoy_message: formData.enjoyMessage,
        accept_reminder: formData.acceptReminder,
        regulate_choice: formData.regulateChoice,
        regulate_text: regulateText,
      };

      await ApiService.completePractice(practiceId, {
        duration: totalMinutes,
        duration_seconds: totalSeconds,
        feeling: todayMoodName,
        emotion_data: emotionData,
        reflection: regulateText || formData.acceptReminder || formData.enjoyMessage || '完成情緒理解力練習',
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
      console.error('儲存情緒日記失敗:', error);
      Alert.alert('錯誤', '無法保存練習記錄');
    }
  };

  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  const renderEmotionForm = () => {
    const { formType } = currentStepData;

    if (formType === 'moment') {
      return (
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
          keyboardVerticalOffset={100}
        >
          <ScrollView 
            ref={scrollViewRef}
            style={styles.emotionFormContainer}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 40 }}
          >
            <View style={styles.emotionInputField}>
              <Text style={styles.emotionInputLabel}>是什麼時刻？</Text>
              <TextInput 
                style={styles.emotionInputBox} 
                multiline 
                placeholder="例如：今天早上、昨天下午..."
                placeholderTextColor="rgba(0, 0, 0, 0.4)"
                value={formData.moment}
                onChangeText={(text) => updateFormData('moment', text)}
              />
            </View>
            
            <View style={styles.emotionInputField}>
              <Text style={styles.emotionInputLabel}>發生了什麼事呢？</Text>
              <TextInput 
                style={styles.emotionLargeInputBox} 
                multiline 
                placeholder="寫下當時發生的事情..."
                placeholderTextColor="rgba(0, 0, 0, 0.4)"
                value={formData.whatHappened}
                onChangeText={(text) => updateFormData('whatHappened', text)}
              />
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      );
    }

    if (formType === 'emotions') {
      return (
        <ScrollView 
          ref={scrollViewRef}
          style={styles.emotionFormContainer} 
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.emotionsGrid}>
            {emotionsList.map((emotion, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.emotionChip,
                  formData.selectedEmotions.includes(emotion) && styles.emotionChipSelected
                ]}
                onPress={() => toggleEmotion(emotion)}
              >
                <Text style={[
                  styles.emotionChipText,
                  formData.selectedEmotions.includes(emotion) && styles.emotionChipTextSelected
                ]}>
                  {emotion}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          {formData.selectedEmotions.length > 0 && (
            <View style={styles.selectedEmotionsContainer}>
              <Text style={styles.selectedEmotionsLabel}>
                已選擇 {formData.selectedEmotions.length} 個情緒
              </Text>
              <Text style={styles.selectedEmotionsText}>
                {formData.selectedEmotions.join('、')}
              </Text>
            </View>
          )}
        </ScrollView>
      );
    }

    if (formType === 'bodyFeeling') {
      return (
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
          keyboardVerticalOffset={100}
        >
          <ScrollView 
            ref={scrollViewRef}
            style={styles.emotionFormContainer}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 40 }}
          >
            <View style={styles.emotionInputField}>
              <TextInput 
                style={styles.emotionLargeInputBox} 
                multiline 
                placeholder="例如：胸口悶悶的、肩膀緊繃、胃不舒服..."
                placeholderTextColor="rgba(0, 0, 0, 0.4)"
                value={formData.bodyFeeling}
                onChangeText={(text) => updateFormData('bodyFeeling', text)}
              />
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      );
    }

    if (formType === 'meaning') {
      return (
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
          keyboardVerticalOffset={100}
        >
          <ScrollView 
            ref={scrollViewRef}
            style={styles.emotionFormContainer} 
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 40 }}
          >
            <View style={styles.choiceContainer}>
              <TouchableOpacity
                style={[
                  styles.choiceButton,
                  formData.meaningChoice === 'why' && styles.choiceButtonSelected
                ]}
                onPress={() => updateFormData('meaningChoice', 'why')}
              >
                <Text style={[
                  styles.choiceButtonText,
                  formData.meaningChoice === 'why' && styles.choiceButtonTextSelected
                ]}>
                  這個情緒為什麼會出現？
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.choiceButton,
                  formData.meaningChoice === 'need' && styles.choiceButtonSelected
                ]}
                onPress={() => updateFormData('meaningChoice', 'need')}
              >
                <Text style={[
                  styles.choiceButtonText,
                  formData.meaningChoice === 'need' && styles.choiceButtonTextSelected
                ]}>
                  這個情緒反映我有什麼需求、期待沒被滿足嗎？
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.choiceButton,
                  formData.meaningChoice === 'message' && styles.choiceButtonSelected
                ]}
                onPress={() => updateFormData('meaningChoice', 'message')}
              >
                <Text style={[
                  styles.choiceButtonText,
                  formData.meaningChoice === 'message' && styles.choiceButtonTextSelected
                ]}>
                  它是否想告訴我一些訊息？或提醒我什麼？
                </Text>
              </TouchableOpacity>
            </View>

            {formData.meaningChoice && (
              <View style={styles.emotionInputField}>
                <Text style={styles.emotionInputLabel}>{getMeaningPrompt()}</Text>
                <TextInput 
                  style={styles.emotionLargeInputBox} 
                  multiline 
                  placeholder="寫下你的想法..."
                  placeholderTextColor="rgba(0, 0, 0, 0.4)"
                  value={formData.meaningText}
                  onChangeText={(text) => updateFormData('meaningText', text)}
                />
              </View>
            )}
          </ScrollView>
        </KeyboardAvoidingView>
      );
    }

    if (formType === 'coping') {
      return (
        <ScrollView 
          ref={scrollViewRef}
          style={styles.emotionFormContainer} 
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.choiceContainer}>
            <TouchableOpacity
              style={[
                styles.choiceButton,
                formData.copingChoice === 'enjoy' && styles.choiceButtonSelected
              ]}
              onPress={() => updateFormData('copingChoice', 'enjoy')}
            >
              <Text style={[
                styles.choiceButtonText,
                formData.copingChoice === 'enjoy' && styles.choiceButtonTextSelected
              ]}>
                我喜歡，要享受它！
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.choiceButton,
                formData.copingChoice === 'accept' && styles.choiceButtonSelected
              ]}
              onPress={() => updateFormData('copingChoice', 'accept')}
            >
              <Text style={[
                styles.choiceButtonText,
                formData.copingChoice === 'accept' && styles.choiceButtonTextSelected
              ]}>
                我雖然不喜歡，但我接納它
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.choiceButton,
                formData.copingChoice === 'regulate' && styles.choiceButtonSelected
              ]}
              onPress={() => updateFormData('copingChoice', 'regulate')}
            >
              <Text style={[
                styles.choiceButtonText,
                formData.copingChoice === 'regulate' && styles.choiceButtonTextSelected
              ]}>
                我不喜歡，想調節它
              </Text>
            </TouchableOpacity>
          </View>

          {formData.copingChoice && (
            <View style={styles.copingFeedback}>
              <Text style={styles.copingFeedbackTitle}>
                {getCopingContent().title}
              </Text>
              <Text style={styles.copingFeedbackText}>
                {getCopingContent().text}
              </Text>
            </View>
          )}
        </ScrollView>
      );
    }

    if (formType === 'copingFollow') {
      if (formData.copingChoice === 'enjoy') {
        return (
          <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{ flex: 1 }}
            keyboardVerticalOffset={100}
          >
            <ScrollView 
              ref={scrollViewRef}
              style={styles.emotionFormContainer}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 40 }}
            >
              <View style={styles.followUpCard}>
                <Text style={styles.followUpTitle}>我想跟這個好的感覺說什麼：</Text>
                <TextInput 
                  style={styles.emotionLargeInputBox} 
                  multiline 
                  placeholder="寫下你想對這份美好感受說的話..."
                  placeholderTextColor="rgba(0, 0, 0, 0.4)"
                  value={formData.enjoyMessage}
                  onChangeText={(text) => updateFormData('enjoyMessage', text)}
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

      if (formData.copingChoice === 'accept') {
        return (
          <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{ flex: 1 }}
            keyboardVerticalOffset={100}
          >
            <ScrollView 
              ref={scrollViewRef}
              style={styles.emotionFormContainer} 
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 40 }}
            >
              <View style={styles.followUpCard}>
                <Text style={styles.followUpTitle}>用一句話，提醒自己：</Text>
                <View style={styles.exampleBox}>
                  <Text style={styles.exampleTitle}>💡 參考例句：</Text>
                  <Text style={styles.exampleText}>「我有這個感覺是 OK 的，很正常」</Text>
                  <Text style={styles.exampleText}>「我允許自己有這個感覺」</Text>
                  <Text style={styles.exampleText}>「沒關係，EMO一下也OK，不舒服的感覺會慢慢過去的」</Text>
                </View>
                <TextInput 
                  style={styles.emotionLargeInputBox} 
                  multiline 
                  placeholder="寫下你想提醒自己的話..."
                  placeholderTextColor="rgba(0, 0, 0, 0.4)"
                  value={formData.acceptReminder}
                  onChangeText={(text) => updateFormData('acceptReminder', text)}
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

      if (formData.copingChoice === 'regulate') {
        return (
          <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{ flex: 1 }}
            keyboardVerticalOffset={100}
          >
            <ScrollView 
              ref={scrollViewRef}
              style={styles.emotionFormContainer} 
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 40 }}
            >
              <View style={styles.followUpCard}>
                <Text style={styles.followUpTitle}>選擇一個調節方式：</Text>
                
                <View style={styles.regulateChoiceContainer}>
                  <TouchableOpacity
                    style={[
                      styles.regulateChoiceButton,
                      formData.regulateChoice === 'selfTalk' && styles.regulateChoiceButtonSelected
                    ]}
                    onPress={() => updateFormData('regulateChoice', 'selfTalk')}
                  >
                    <Text style={styles.regulateChoiceEmoji}>💬</Text>
                    <Text style={[
                      styles.regulateChoiceText,
                      formData.regulateChoice === 'selfTalk' && styles.regulateChoiceTextSelected
                    ]}>
                      自我對話
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.regulateChoiceButton,
                      formData.regulateChoice === 'breathing' && styles.regulateChoiceButtonSelected
                    ]}
                    onPress={() => updateFormData('regulateChoice', 'breathing')}
                  >
                    <Text style={styles.regulateChoiceEmoji}>🫁</Text>
                    <Text style={[
                      styles.regulateChoiceText,
                      formData.regulateChoice === 'breathing' && styles.regulateChoiceTextSelected
                    ]}>
                      腹式呼吸
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.regulateChoiceButton,
                      formData.regulateChoice === 'exercise' && styles.regulateChoiceButtonSelected
                    ]}
                    onPress={() => updateFormData('regulateChoice', 'exercise')}
                  >
                    <Text style={styles.regulateChoiceEmoji}>🏃</Text>
                    <Text style={[
                      styles.regulateChoiceText,
                      formData.regulateChoice === 'exercise' && styles.regulateChoiceTextSelected
                    ]}>
                      做做運動
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.regulateChoiceButton,
                      formData.regulateChoice === 'happyThing' && styles.regulateChoiceButtonSelected
                    ]}
                    onPress={() => updateFormData('regulateChoice', 'happyThing')}
                  >
                    <Text style={styles.regulateChoiceEmoji}>✨</Text>
                    <Text style={[
                      styles.regulateChoiceText,
                      formData.regulateChoice === 'happyThing' && styles.regulateChoiceTextSelected
                    ]}>
                      讓心情變好的事
                    </Text>
                  </TouchableOpacity>
                </View>

                {formData.regulateChoice === 'selfTalk' && (
                  <View style={styles.regulateInputSection}>
                    <Text style={styles.regulatePrompt}>
                      如果你的內在有一個支持你的聲音，它現在會說什麼？
                    </Text>
                    <TextInput 
                      style={styles.emotionLargeInputBox} 
                      multiline 
                      placeholder="寫下那個支持你的聲音會說的話..."
                      placeholderTextColor="rgba(0, 0, 0, 0.4)"
                      value={formData.selfTalkText}
                      onChangeText={(text) => updateFormData('selfTalkText', text)}
                    />
                  </View>
                )}

                {formData.regulateChoice === 'breathing' && (
                  <View style={styles.regulateInputSection}>
                    <View style={styles.breathingCard}>
                      <Text style={styles.breathingTitle}>腹式呼吸練習</Text>
                      <Text style={styles.breathingDesc}>
                        讓我們一起進行腹式呼吸，調節自律神經，幫助你平靜下來。
                      </Text>
                      <TouchableOpacity 
                        style={styles.breathingButton}
                        onPress={() => console.log('開始腹式呼吸練習')}
                      >
                        <Text style={styles.breathingButtonText}>開始練習</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}

                {formData.regulateChoice === 'exercise' && (
                  <View style={styles.regulateInputSection}>
                    <Text style={styles.regulatePrompt}>你想做什麼運動？</Text>
                    <TextInput 
                      style={styles.emotionLargeInputBox} 
                      multiline 
                      placeholder="例如：散步、伸展、跑步、瑜伽..."
                      placeholderTextColor="rgba(0, 0, 0, 0.4)"
                      value={formData.exerciseText}
                      onChangeText={(text) => updateFormData('exerciseText', text)}
                    />
                  </View>
                )}

                {formData.regulateChoice === 'happyThing' && (
                  <View style={styles.regulateInputSection}>
                    <Text style={styles.regulatePrompt}>
                      做一件讓自己心情變好的事情，是什麼呢？
                    </Text>
                    <TextInput 
                      style={styles.emotionLargeInputBox} 
                      multiline 
                      placeholder="例如：聽音樂、看喜劇、吃美食、聯絡朋友..."
                      placeholderTextColor="rgba(0, 0, 0, 0.4)"
                      value={formData.happyThingText}
                      onChangeText={(text) => updateFormData('happyThingText', text)}
                    />
                  </View>
                )}
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

      return null;
    }

    return null;
  };

  const renderEmotionSummary = () => {
    const getCurrentDate = () => {
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const weekdays = ['日', '一', '二', '三', '四', '五', '六'];
      const weekday = weekdays[now.getDay()];
      return `${year}年${month}月${day}日 星期${weekday}`;
    };

    return (
      <ScrollView 
        style={styles.diaryScrollView}
        contentContainerStyle={styles.diaryScrollContent}
        showsVerticalScrollIndicator={true}
      >
        <View style={styles.diaryHeader}>
          <Text style={styles.diaryDate}>{getCurrentDate()}</Text>
          <Text style={styles.diaryWeather}>☁️ 心情天氣</Text>
        </View>

        <View style={styles.diarySection}>
          <Text style={styles.diarySectionTitle}>📍 那個時刻</Text>
          <Text style={styles.diaryText}>
            {formData.moment || formData.whatHappened 
              ? `${formData.moment ? formData.moment + '，' : ''}${formData.whatHappened || ''}`
              : '無記錄'}
          </Text>
        </View>

        <View style={styles.diarySection}>
          <Text style={styles.diarySectionTitle}>💭 我的情緒</Text>
          {formData.selectedEmotions && formData.selectedEmotions.length > 0 ? (
            <View style={styles.diaryEmotionsContainer}>
              {formData.selectedEmotions.map((emotion, index) => (
                <View key={index} style={styles.diaryEmotionTag}>
                  <Text style={styles.diaryEmotionText}>{emotion}</Text>
                </View>
              ))}
            </View>
          ) : (
            <Text style={styles.diaryText}>無記錄</Text>
          )}
        </View>

        <View style={styles.diarySection}>
          <Text style={styles.diarySectionTitle}>🫀 身體的感覺</Text>
          <Text style={styles.diaryText}>
            {formData.bodyFeeling || '無記錄'}
          </Text>
        </View>

        <View style={styles.diarySection}>
          <Text style={styles.diarySectionTitle}>🔍 情緒的意義</Text>
          {formData.meaningChoice && (
            <Text style={styles.diaryQuestionText}>{getMeaningPrompt()}</Text>
          )}
          <Text style={styles.diaryText}>
            {formData.meaningText || '無記錄'}
          </Text>
        </View>

        <View style={styles.diarySection}>
          <Text style={styles.diarySectionTitle}>🌟 我的選擇</Text>
          {formData.copingChoice ? (
            <>
              <Text style={styles.diaryHighlight}>
                {formData.copingChoice === 'enjoy' && '我喜歡，要享受它！'}
                {formData.copingChoice === 'accept' && '我雖然不喜歡，但我接納它'}
                {formData.copingChoice === 'regulate' && '我不喜歡，想調節它'}
              </Text>
              
              {formData.copingChoice === 'enjoy' && (
                <View style={styles.diaryQuoteBox}>
                  <Text style={styles.diaryQuoteText}>
                    {formData.enjoyMessage || '無記錄'}
                  </Text>
                </View>
              )}
              
              {formData.copingChoice === 'accept' && (
                <View style={styles.diaryQuoteBox}>
                  <Text style={styles.diaryQuoteText}>
                    {formData.acceptReminder || '無記錄'}
                  </Text>
                </View>
              )}
              
              {formData.copingChoice === 'regulate' && (
                <>
                  <Text style={styles.diaryMethodText}>
                    調節方式：
                    {formData.regulateChoice === 'selfTalk' && '自我對話'}
                    {formData.regulateChoice === 'breathing' && '腹式呼吸'}
                    {formData.regulateChoice === 'exercise' && '運動'}
                    {formData.regulateChoice === 'happyThing' && '做讓心情變好的事'}
                    {!formData.regulateChoice && '無記錄'}
                  </Text>
                  {formData.selfTalkText && (
                    <View style={styles.diaryQuoteBox}>
                      <Text style={styles.diaryQuoteText}>{formData.selfTalkText}</Text>
                    </View>
                  )}
                  {formData.exerciseText && (
                    <Text style={styles.diaryText}>運動計畫：{formData.exerciseText}</Text>
                  )}
                  {formData.happyThingText && (
                    <Text style={styles.diaryText}>開心的事：{formData.happyThingText}</Text>
                  )}
                  {!formData.selfTalkText && !formData.exerciseText && !formData.happyThingText && (
                    <Text style={styles.diaryText}>無記錄</Text>
                  )}
                </>
              )}
            </>
          ) : (
            <Text style={styles.diaryText}>無記錄</Text>
          )}
        </View>

        <View style={styles.diaryFooter}>
          <Text style={styles.diaryFooterText}>
            ✨ 每一次的覺察，都是成長的開始
          </Text>
        </View>

        <TouchableOpacity style={styles.finishButton} onPress={handleComplete}>
          <Text style={styles.finishButtonText}>完成今日練習</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  };

  const renderStepContent = () => {
    if (currentStepData.hasMoodMessage) {
      return (
        <View style={styles.moodMessageContainer}>
          <View style={styles.moodMessageCard}>
            <View style={styles.moodMessageIcon}>
              <Text style={styles.moodMessageEmoji}>💭</Text>
            </View>
            <Text style={styles.moodMessageTitle}>心情小語</Text>
            <Text style={styles.moodMessageText}>
              情緒是生而為人的自然反應，沒有對錯，它只是真實反映了你所重視的、你受傷的、你期待的…
            </Text>
            <Text style={styles.moodMessageText}>
              會破壞關係、傷害自己或他人的，往往是情緒的表達方式，而不是情緒本身。
            </Text>
          </View>
        </View>
      );
    }

    if (currentStepData.hasEmotionForm) {
      return renderEmotionForm();
    }

    if (currentStepData.hasEmotionSummary) {
      return renderEmotionSummary();
    }

    if (currentStepData.hasImage) {
      return (
        <View style={styles.imageSection}>
          <View style={styles.welcomeImageContainer}>
            <View style={styles.welcomeImageWhiteBox}>
              <Image 
                source={require('../../../../assets/images/情緒理解.png')}
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
        <Text style={styles.headerTitle}>《情緒理解力練習》</Text>
        <TouchableOpacity>
          <Text style={styles.menuButton}>⋯</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.progressContainer}>
        <View style={styles.progressBarContainer}>
          <View style={[styles.progressBarFill, { width: `${progressPercentage}%` }]} />
        </View>
      </View>

      {currentStepData.hasEmotionSummary ? (
        renderStepContent()
      ) : (
        <TouchableWithoutFeedback onPress={dismissKeyboard}>
          <View style={styles.contentContainer}>
            <View style={styles.stepHeader}>
              <Text style={styles.stepTitle}>{currentStepData.title}</Text>
              {currentStepData.content && !currentStepData.hasEmotionForm && (
                <Text style={styles.contentText}>{currentStepData.content}</Text>
              )}
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#e3d6caff',
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
  emotionFormContainer: {
    flex: 1,
    marginBottom: 20,
  },
  emotionInputField: {
    marginBottom: 20,
  },
  emotionInputLabel: {
    fontSize: 14,
    color: 'rgba(0, 0, 0, 0.6)',
    marginBottom: 8,
    lineHeight: 20,
    fontWeight: '500',
  },
  emotionInputBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    height: 60,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: 'rgba(0, 0, 0, 0.6)',
    textAlignVertical: 'top',
    fontSize: 15,
  },
  emotionLargeInputBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    height: 120,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: 'rgba(0, 0, 0, 0.6)',
    textAlignVertical: 'top',
    fontSize: 15,
  },
  emotionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    marginTop: 10,
  },
  emotionChip: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 20,
    margin: 4,
    borderWidth: 2,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  emotionChipSelected: {
    backgroundColor: 'rgba(143, 122, 18, 0.25)',
    borderColor: '#ab9e8dff',
  },
  emotionChipText: {
    fontSize: 14,
    color: 'rgba(0, 0, 0, 0.65)',
    fontWeight: '500',
  },
  emotionChipTextSelected: {
    fontWeight: 'bold',
    color: '#ab9e8dff',
  },
  selectedEmotionsContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    padding: 16,
    borderRadius: 10,
    marginTop: 20,
    borderWidth: 1,
    borderColor: 'rgba(46, 134, 171, 0.2)',
  },
  selectedEmotionsLabel: {
    fontSize: 14,
    color: 'rgba(0, 0, 0, 0.6)',
    fontWeight: 'bold',
    marginBottom: 8,
  },
  selectedEmotionsText: {
    fontSize: 15,
    color: 'rgba(0, 0, 0, 0.7)',
    lineHeight: 22,
  },
  choiceContainer: {
    marginTop: 10,
    marginBottom: 20,
  },
  choiceButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: 18,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  choiceButtonSelected: {
    backgroundColor: 'rgba(210, 170, 109, 0.27)',
    borderColor: '#ab9e8dff',
  },
  choiceButtonText: {
    fontSize: 15,
    color: 'rgba(0, 0, 0, 0.65)',
    textAlign: 'center',
    lineHeight: 22,
    fontWeight: '500',
  },
  choiceButtonTextSelected: {
    fontWeight: 'bold',
    color: '#ab9e8dff',
  },
  copingFeedback: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    padding: 20,
    borderRadius: 12,
    marginTop: 10,
    borderWidth: 1,
    borderColor: 'rgba(46, 134, 171, 0.2)',
  },
  copingFeedbackTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ab9e8dff',
    marginBottom: 12,
    textAlign: 'center',
  },
  copingFeedbackText: {
    fontSize: 15,
    color: 'rgba(0, 0, 0, 0.65)',
    lineHeight: 24,
    textAlign: 'center',
  },
  followUpCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    padding: 20,
    borderRadius: 12,
    marginTop: 10,
  },
  followUpTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: 'rgba(0, 0, 0, 0.75)',
    marginBottom: 16,
  },
  exampleBox: {
    backgroundColor: 'rgba(46, 134, 171, 0.08)',
    padding: 14,
    borderRadius: 10,
    marginBottom: 16,
    borderLeftWidth: 3,
    borderLeftColor: 'rgba(213, 157, 83, 0.6)',
  },
  exampleTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(0, 0, 0, 0.7)',
    marginBottom: 8,
  },
  exampleText: {
    fontSize: 13,
    color: 'rgba(0, 0, 0, 0.6)',
    lineHeight: 20,
    marginBottom: 4,
  },
  regulateChoiceContainer: {
    marginTop: 16,
    marginBottom: 20,
  },
  regulateChoiceButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'rgba(0, 0, 0, 0.1)',
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  regulateChoiceButtonSelected: {
    backgroundColor: 'rgba(46, 134, 171, 0.15)',
    borderColor: 'rgba(171, 113, 46, 0.8)',
  },
  regulateChoiceEmoji: {
    fontSize: 24,
    marginRight: 12,
  },
  regulateChoiceText: {
    fontSize: 16,
    color: 'rgba(0, 0, 0, 0.65)',
    fontWeight: '500',
  },
  regulateChoiceTextSelected: {
    fontWeight: 'bold',
    color: '#8C8275',
  },
  regulateInputSection: {
    marginTop: 16,
  },
  regulatePrompt: {
    fontSize: 14,
    color: 'rgba(0, 0, 0, 0.7)',
    marginBottom: 12,
    lineHeight: 20,
    fontWeight: '500',
  },
  breathingCard: {
    backgroundColor: 'rgba(46, 134, 171, 0.1)',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  breathingTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ab9e8dff',
    marginBottom: 12,
  },
  breathingDesc: {
    fontSize: 14,
    color: 'rgba(0, 0, 0, 0.65)',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 16,
  },
  breathingButton: {
    backgroundColor: '#8C8275',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 25,
  },
  breathingButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  moodMessageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  moodMessageCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 16,
    padding: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  moodMessageIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(46, 134, 171, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  moodMessageEmoji: {
    fontSize: 40,
  },
  moodMessageTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ab9e8dff',
    marginBottom: 20,
  },
  moodMessageText: {
    fontSize: 16,
    color: 'rgba(0, 0, 0, 0.7)',
    lineHeight: 26,
    textAlign: 'center',
    marginBottom: 12,
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
    borderColor: '#ab9e8dff',
  },
  completeButtonText: {
    color: '#ab9e8dff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  diaryScrollView: {
    flex: 1,
  },
  diaryScrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 150,
  },
  diaryHeader: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    alignItems: 'center',
    borderLeftWidth: 4,
    borderLeftColor: '#ab9e8dff',
  },
  diaryDate: {
    fontSize: 18,
    fontWeight: '600',
    color: 'rgba(0, 0, 0, 0.75)',
    marginBottom: 8,
  },
  diaryWeather: {
    fontSize: 14,
    color: 'rgba(0, 0, 0, 0.5)',
  },
  diarySection: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    padding: 18,
    borderRadius: 12,
    marginBottom: 16,
  },
  diarySectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: 'rgba(171, 121, 46, 1)',
    marginBottom: 12,
  },
  diaryText: {
    fontSize: 15,
    color: 'rgba(0, 0, 0, 0.7)',
    lineHeight: 24,
  },
  diaryQuestionText: {
    fontSize: 13,
    color: 'rgba(0, 0, 0, 0.5)',
    fontStyle: 'italic',
    marginBottom: 8,
  },
  diaryHighlight: {
    fontSize: 16,
    fontWeight: '600',
    color: 'rgba(171, 121, 46, 1)',
    marginBottom: 12,
  },
  diaryEmotionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 4,
  },
  diaryEmotionTag: {
    backgroundColor: 'rgba(46, 134, 171, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  diaryEmotionText: {
    fontSize: 14,
    color: '#ab9e8dff',
    fontWeight: '500',
  },
  diaryQuoteBox: {
    backgroundColor: 'rgba(46, 134, 171, 0.08)',
    padding: 14,
    borderRadius: 10,
    marginTop: 10,
    borderLeftWidth: 3,
    borderLeftColor: 'rgba(171, 123, 46, 0.6)',
  },
  diaryQuoteText: {
    fontSize: 15,
    color: 'rgba(0, 0, 0, 0.7)',
    lineHeight: 24,
    fontStyle: 'italic',
  },
  diaryMethodText: {
    fontSize: 14,
    color: 'rgba(0, 0, 0, 0.6)',
    marginTop: 8,
    marginBottom: 8,
  },
  diaryFooter: {
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  diaryFooterText: {
    fontSize: 14,
    color: 'rgba(0, 0, 0, 0.5)',
    fontStyle: 'italic',
  },
  finishButton: {
    backgroundColor: '#ab9e8dff',
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
    color: '#ab9e8dff',
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