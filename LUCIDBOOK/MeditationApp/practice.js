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

export default function PracticeScreen({ practiceType = "呼吸覺定力練習", onBack }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [sound, setSound] = useState(null);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  
  const [formData, setFormData] = useState({
    feeling: '',
    noticed: '',
    reflection: '',
    // 情緒理解力練習的欄位
    moment: '',
    whatHappened: '',
    selectedEmotions: [],
    bodyFeeling: '',
    meaningChoice: '',
    meaningText: '',
    copingChoice: '',
    // 流程3的新欄位
    enjoyMessage: '',
    acceptReminder: '',
    regulateChoice: '',
    selfTalkText: '',
    exerciseText: '',
    happyThingText: '',
  });

  // 情緒詞彙列表
  const emotionsList = [
    '開心', '興奮', '滿足', '感恩', '平靜',
    '悲傷', '失望', '沮喪', '孤單', '無助',
    '生氣', '憤怒', '煩躁', '不耐煩', '受傷',
    '焦慮', '擔心', '緊張', '害怕', '恐懼',
    '羞愧', '內疚', '後悔', '尷尬', '無力',
    '困惑', '迷茫', '麻木', '空虛', '厭煩'
  ];

  const getAudioFile = () => {
    try {
      const audioFiles = {
        "呼吸覺定力練習": require('./assets/audio/breathing-meditation.mp3'),
        "五感察覺練習": require('./assets/audio/five-senses.wav'),
        "情緒理解力練習": require('./assets/audio/emotion-relief.wav'),
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
      "情緒理解力練習": {
        steps: [
          {
            title: "準備好來開始\n今天的《情緒理解力練習》了嗎？",
            content: "",
            hasImage: true,
            imageType: "welcome",
            imageName: "情緒理解.png"
          },
          {
            title: "嗨！歡迎你開始今天的\n《情緒理解力》練習",
            content: "",
            icon: "Hi",
            showGreeting: true
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
            formType: "copingFollow"
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
    // 如果當前步驟有 showOnlyFor 限制，檢查是否應該跳過
    const nextStepIndex = currentStep + 1;
    if (nextStepIndex < practiceData.steps.length) {
      const nextStepData = practiceData.steps[nextStepIndex];
      if (nextStepData.showOnlyFor && !nextStepData.showOnlyFor.includes(formData.copingChoice)) {
        // 跳過這個步驟
        setCurrentStep(nextStepIndex + 1);
      } else {
        setCurrentStep(nextStepIndex);
      }
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

  const renderEmotionForm = () => {
    const { formType } = currentStepData;

    if (formType === 'moment') {
      return (
        <View style={styles.emotionFormContainer}>
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
        </View>
      );
    }

    if (formType === 'emotions') {
      return (
        <View style={styles.emotionFormContainer}>
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
        </View>
      );
    }

    if (formType === 'bodyFeeling') {
      return (
        <View style={styles.emotionFormContainer}>
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
        </View>
      );
    }

    if (formType === 'meaning') {
      return (
        <View style={styles.emotionFormContainer}>
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
        </View>
      );
    }

    if (formType === 'coping') {
      return (
        <View style={styles.emotionFormContainer}>
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
        </View>
      );
    }

    if (formType === 'copingFollow') {
      // 根據之前的選擇顯示不同的後續問題
      if (formData.copingChoice === 'enjoy') {
        return (
          <View style={styles.emotionFormContainer}>
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
          </View>
        );
      }

      if (formData.copingChoice === 'accept') {
        return (
          <View style={styles.emotionFormContainer}>
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
          </View>
        );
      }

      if (formData.copingChoice === 'regulate') {
        return (
          <View style={styles.emotionFormContainer}>
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
                      onPress={() => {
                        // 這裡可以觸發音檔播放或跳轉到呼吸練習
                        console.log('開始腹式呼吸練習');
                      }}
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
          </View>
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
        bounces={true}
        scrollEnabled={true}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.diaryHeader}>
          <Text style={styles.diaryDate}>{getCurrentDate()}</Text>
          <Text style={styles.diaryWeather}>☁️ 心情天氣</Text>
        </View>

        <View style={styles.diarySection}>
          <Text style={styles.diarySectionTitle}>📍 那個時刻</Text>
          <Text style={styles.diaryText}>
            {formData.moment && `${formData.moment}，`}
            {formData.whatHappened || '今天發生了一些事...'}
          </Text>
        </View>

        <View style={styles.diarySection}>
          <Text style={styles.diarySectionTitle}>💭 我的情緒</Text>
          {formData.selectedEmotions.length > 0 ? (
            <View style={styles.diaryEmotionsContainer}>
              {formData.selectedEmotions.map((emotion, index) => (
                <View key={index} style={styles.diaryEmotionTag}>
                  <Text style={styles.diaryEmotionText}>{emotion}</Text>
                </View>
              ))}
            </View>
          ) : (
            <Text style={styles.diaryText}>還沒記錄情緒</Text>
          )}
        </View>

        <View style={styles.diarySection}>
          <Text style={styles.diarySectionTitle}>🫀 身體的感覺</Text>
          <Text style={styles.diaryText}>
            {formData.bodyFeeling || '沒有特別的身體感覺'}
          </Text>
        </View>

        <View style={styles.diarySection}>
          <Text style={styles.diarySectionTitle}>🔍 情緒的意義</Text>
          <Text style={styles.diaryQuestionText}>{getMeaningPrompt()}</Text>
          <Text style={styles.diaryText}>
            {formData.meaningText || '還在思考中...'}
          </Text>
        </View>

        <View style={styles.diarySection}>
          <Text style={styles.diarySectionTitle}>🌟 我的選擇</Text>
          <Text style={styles.diaryHighlight}>
            {formData.copingChoice === 'enjoy' && '我喜歡，要享受它！'}
            {formData.copingChoice === 'accept' && '我雖然不喜歡，但我接納它'}
            {formData.copingChoice === 'regulate' && '我不喜歡，想調節它'}
          </Text>
          
          {formData.copingChoice === 'enjoy' && formData.enjoyMessage && (
            <View style={styles.diaryQuoteBox}>
              <Text style={styles.diaryQuoteText}>{formData.enjoyMessage}</Text>
            </View>
          )}
          
          {formData.copingChoice === 'accept' && formData.acceptReminder && (
            <View style={styles.diaryQuoteBox}>
              <Text style={styles.diaryQuoteText}>{formData.acceptReminder}</Text>
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
            </>
          )}
        </View>

        <View style={styles.diaryFooter}>
          <Text style={styles.diaryFooterText}>
            ✨ 每一次的覺察，都是成長的開始
          </Text>
        </View>

        <TouchableOpacity style={styles.finishButton} onPress={onBack}>
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

    if (currentStepData.hasForm) {
      return (
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
        </ScrollView>
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
          
          <TouchableOpacity style={styles.finishButton} onPress={onBack}>
            <Text style={styles.finishButtonText}>結束今日練習</Text>
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
                source={require('./assets/images/ocean-breathe.png')}
                style={styles.albumCoverImage}
                resizeMode="cover"
              />
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

        {currentStepData.hasEmotionSummary ? (
          // 日記頁面 - 直接渲染 ScrollView，不包裹在 View 中
          renderStepContent()
        ) : (
          // 其他頁面 - 使用 contentContainer
          <View style={styles.contentContainer}>
            <View style={styles.stepHeader}>
              <Text style={styles.stepTitle}>{currentStepData.title}</Text>
              {currentStepData.content && !currentStepData.hasEmotionForm && (
                <Text style={styles.contentText}>{currentStepData.content}</Text>
              )}
            </View>

            {renderStepContent()}
          </View>
        )}

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
    paddingBottom: 100,
  },
  // Diary ScrollView styles
  diaryScrollView: {
    flex: 1,
  },
  diaryScrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 150,
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

  // Emotion form styles
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
    backgroundColor: 'rgba(46, 134, 171, 0.25)',
    borderColor: 'rgba(46, 134, 171, 1)',
  },
  emotionChipText: {
    fontSize: 14,
    color: 'rgba(0, 0, 0, 0.65)',
    fontWeight: '500',
  },
  emotionChipTextSelected: {
    fontWeight: 'bold',
    color: 'rgba(46, 134, 171, 1)',
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
    backgroundColor: 'rgba(46, 134, 171, 0.15)',
    borderColor: 'rgba(46, 134, 171, 0.8)',
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
    color: 'rgba(46, 134, 171, 1)',
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
    color: 'rgba(46, 134, 171, 1)',
    marginBottom: 12,
    textAlign: 'center',
  },
  copingFeedbackText: {
    fontSize: 15,
    color: 'rgba(0, 0, 0, 0.65)',
    lineHeight: 24,
    textAlign: 'center',
  },

  // Follow-up question styles
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
    borderLeftColor: 'rgba(46, 134, 171, 0.6)',
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
    borderColor: 'rgba(46, 134, 171, 0.8)',
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
    color: 'rgba(46, 134, 171, 1)',
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
    color: 'rgba(46, 134, 171, 1)',
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
    backgroundColor: 'rgba(46, 134, 171, 0.9)',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 25,
  },
  breathingButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },

  // Summary styles
  summarySection: {
    flex: 1,
    marginBottom: 20,
  },
  summaryCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    padding: 16,
    borderRadius: 10,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  summaryTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: 'rgba(0, 0, 0, 0.75)',
    marginBottom: 8,
  },
  summarySubtitle: {
    fontSize: 13,
    color: 'rgba(0, 0, 0, 0.5)',
    marginBottom: 6,
    fontStyle: 'italic',
  },
  summaryContent: {
    fontSize: 14,
    color: 'rgba(0, 0, 0, 0.65)',
    lineHeight: 22,
  },
  summarySubSection: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
  },

  // Mood Message styles
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
    color: 'rgba(46, 134, 171, 1)',
    marginBottom: 20,
  },
  moodMessageText: {
    fontSize: 16,
    color: 'rgba(0, 0, 0, 0.7)',
    lineHeight: 26,
    textAlign: 'center',
    marginBottom: 12,
  },

  // Diary styles
  diaryHeader: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    alignItems: 'center',
    borderLeftWidth: 4,
    borderLeftColor: 'rgba(46, 134, 171, 0.8)',
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
    color: 'rgba(46, 134, 171, 1)',
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
    color: 'rgba(46, 134, 171, 1)',
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
    color: 'rgba(46, 134, 171, 1)',
    fontWeight: '500',
  },
  diaryQuoteBox: {
    backgroundColor: 'rgba(46, 134, 171, 0.08)',
    padding: 14,
    borderRadius: 10,
    marginTop: 10,
    borderLeftWidth: 3,
    borderLeftColor: 'rgba(46, 134, 171, 0.6)',
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
    backgroundColor: 'rgba(46, 134, 171, 0.9)',
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

  // Bottom navigation
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