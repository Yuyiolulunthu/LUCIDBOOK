import React, {useState, useEffect } from 'react';

import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Image,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Modal,
} from 'react-native';
import ApiService from '../api'
;

const SelfAwarenessPractice = ({ onBack }) => {
  const [practiceId, setPracticeId] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState({
    event: '',
    thought: '',
    mood: '',
    thoughtOrigin: '',
    thoughtValidity: '',
    thoughtImpact: '',
    responseMethod: 'friend',
    newResponse: '',
    finalFeeling: '',
  });
  const [showExamples, setShowExamples] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  // 練習步驟定義
  const steps = [
    {
      type: 'intro',
      title: '自我覺察力練習',
      content: '嗨，歡迎你開始今天的《自我覺察力》練習。',
      image: require('../assets/images/自我覺察.png'),
    },
    {
      type: 'intro',
      content: '這個練習協助你從錯誤與自責中平復。',
    },
    {
      type: 'action',
      title: '放鬆身心',
      content: '在開始之前，請先進行 3 次深深的呼吸 💨 放鬆自己的身體與心靈。',
      action: 'breathing',
    },
    {
      type: 'action',
      title: '回想經驗',
      content: '請回想今天（或最近）曾在心裡責怪、懷疑自己，或覺得自己不如他人的時刻？\n\n(若今天沒有，也可以找一個困擾自己許久的自責經驗)',
    },
    {
      type: 'intro',
      content: '接下來我們將透過幾題自我對話，幫助自己調整思緒。',
    },
    {
      type: 'writing',
      title: '記錄事件',
      subtitle: '今天（或最近）我對自己有哪些自我懷疑、否定、覺得自己不夠好的時刻？',
      description: '請寫下那時發生了什麼事件（客觀事實）、當下的想法（腦中的聲音）、以及心情（感受）。',
      fields: [
        {
          key: 'event',
          label: '是什麼樣的事件：',
          placeholder: '例：同事提醒我，文件有兩個錯字。',
          multiline: true,
        },
        {
          key: 'thought',
          label: '你的想法是什麼？',
          placeholder: '例：我真是太沒用了，居然有錯字，還被同事發現，好丟臉、好想離職。',
          multiline: true,
        },
        {
          key: 'mood',
          label: '心情：',
          placeholder: '例：丟臉、難過',
          multiline: true,
        },
      ],
    },
    {
      type: 'selection',
      title: '探索想法來源',
      subtitle: '這個想法可能是怎麼來的呢？',
      options: [
        {
          key: 'thoughtOrigin',
          label: '這個想法是從何而來的？從什麼時候開始？是誰跟我說過類似的話嗎？',
          placeholder: '例：我想到曾經被爸爸說過我很沒用，而且很多次…',
        },
        {
          key: 'thoughtValidity',
          label: '這個想法有多大程度是真實的？是否有客觀證據反對這個想法？',
          placeholder: '例：客觀來看，這份文件是在很短的時間內臨時被交辦，加班趕出來的...',
        },
        {
          key: 'thoughtImpact',
          label: '這個想法對我的正向與負向的影響是什麼？',
          placeholder: '請寫下你的想法...',
        },
      ],
    },
    {
      type: 'response',
      title: '重新回應',
      subtitle: '我可以用什麼方式重新回應這個想法：',
      methods: [
        {
          key: 'friend',
          label: '如果我的朋友有這樣的想法，我會怎麼回應他？',
        },
        {
          key: 'inner',
          label: '如果你的內在有一個支持你的聲音，它現在會說什麼？',
        },
        {
          key: 'future',
          label: '你希望自己未來如何回應這個想法？',
        },
      ],
      examples: [
        '我知道你是因為在意才會這麼罵自己，但犯錯是學習的一部分，沒有人是完美的。',
        '這件事，我已經盡我最大的努力了，我看見自己的努力就夠了。',
        '我會避免下次再犯同樣的錯誤，發揮自責最大的功能，然後，自責到此刻就夠了。',
        '失敗並不代表我不好，也不代表我沒價值，它只是一個過程。',
        '我正在努力，這本身就值得被肯定，就夠讚了。',
        '不是所有事情都能被我掌控，給自己一點餘裕與空間吧。',
        '謝謝內心提醒我注意自己的行為，但我更需要鼓勵自己，才能繼續前進。',
      ],
    },
    {
      type: 'reflection',
      title: '練習回顧',
      subtitle: '寫完以上的練習，你現在的感覺如何？',
      description: '與練習前有什麼不同嗎？',
      field: {
        key: 'finalFeeling',
        placeholder: '請分享你現在的感受...',
      },
    },
    {
      type: 'completion',
      title: '練習完成',
      content: '恭喜你完成了今天的自我覺察力練習！\n\n透過覺察和重新回應內在的聲音，你正在學習以更溫暖、接納的方式對待自己。\n\n記住，自我成長是一個過程，請給自己時間和空間。',
    },
  ];

  useEffect(() => {
    recordStartTime();
  }, []);
  
useEffect(() => {
  startPractice();
}, []);


const startPractice = async () => {
  try {
    const response = await ApiService.startPractice('自我覺察力練習');
    console.log('🧩 startPractice 回傳內容:', response);

    if (response.practiceId) {
      setPracticeId(response.practiceId);
      console.log('✅ 已設定練習 ID:', response.practiceId);
    } else {
      console.warn('⚠️ 沒有拿到 practiceId，後端回傳:', response);
    }
  } catch (error) {
    console.error('❌ 啟動練習失敗:', error);
  }
};

const completePractice = async () => {
  try {
    console.log('🚀 準備完成練習，practiceId =', practiceId);

    if (!practiceId) {
      Alert.alert('錯誤', '尚未建立練習記錄，請重新進入此頁。');
      return;
    }

    const result = await ApiService.completePractice(practiceId, {
      duration: 10,
      feeling: '放鬆',
      noticed: '更能觀察自己的思緒',
      reflection: '覺察讓我平靜',
    });

    console.log('🎯 完成練習回傳:', result);

    if (result.success) {
      Alert.alert('完成', '已成功記錄練習結果！');
    }
  } catch (error) {
    console.error('❌ 完成練習失敗:', error);
    Alert.alert('錯誤', `完成練習失敗：${error.message}`);
  }
};

  const recordStartTime = async () => {
  try {
    const response = await ApiService.startPractice('自我覺察力練習');
    const pid = response.practiceId || response.id || response.practice_id || 9999; // fallback
    setPracticeId(pid);
    console.log('✅ 練習開始 ID:', pid);
  } catch (error) {
    console.error('記錄練習開始失敗:', error);
  }
};



  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      completePractice();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

      //   const completePractice = async () => {
      //   try {
      //     if (!practiceId) {
      //       Alert.alert('錯誤', '尚未建立練習記錄，請重新開始。');
      //       return;
      //     }

      //     const response = await ApiService.completePractice(practiceId, {
      //       duration: 10,  // 可改成實際時間
      //       feeling: answers.finalFeeling || '',
      //       noticed: answers.event || '',
      //       reflection: answers.newResponse || '',
      //     });

      //     if (response.success) {
      //       setIsCompleted(true);
      //       Alert.alert(
      //         '練習完成',
      //         '你已經完成了今天的自我覺察力練習！',
      //         [{ text: '返回', onPress: onBack }]
      //       );
      //     } else {
      //       throw new Error(response.message || '伺服器未回傳 success');
      //     }
      //   } catch (error) {
      //     console.error('完成練習失敗:', error);
      //     Alert.alert('錯誤', '無法保存練習記錄，請稍後再試');
      //   }
      // };


  const updateAnswer = (key, value) => {
    setAnswers(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const renderStepContent = () => {
    const step = steps[currentStep];

    switch (step.type) {
      case 'intro':
        return (
          <View style={styles.introContainer}>
            {step.image && (
              <Image source={step.image} style={styles.introImage} resizeMode="contain" />
            )}
            {step.title && <Text style={styles.introTitle}>{step.title}</Text>}
            <Text style={styles.introText}>{step.content}</Text>
          </View>
        );

      case 'action':
        return (
          <View style={styles.actionContainer}>
            <Text style={styles.actionTitle}>{step.title}</Text>
            <Text style={styles.actionText}>{step.content}</Text>
            {step.action === 'breathing' && (
              <View style={styles.breathingIndicator}>
                <Text style={styles.breathingEmoji}>💨</Text>
                <Text style={styles.breathingText}>深呼吸 3 次</Text>
              </View>
            )}
          </View>
        );

      case 'writing':
        return (
          <ScrollView style={styles.writingContainer}>
            <Text style={styles.writingTitle}>{step.title}</Text>
            <Text style={styles.writingSubtitle}>{step.subtitle}</Text>
            <Text style={styles.writingDescription}>{step.description}</Text>
            
            {step.fields.map((field, index) => (
              <View key={field.key} style={styles.fieldContainer}>
                <Text style={styles.fieldLabel}>{field.label}</Text>
                <TextInput
                  style={[styles.fieldInput, field.multiline && styles.multilineInput]}
                  placeholder={field.placeholder}
                  placeholderTextColor="#9CA3AF"
                  value={answers[field.key]}
                  onChangeText={(text) => updateAnswer(field.key, text)}
                  multiline={field.multiline}
                  numberOfLines={field.multiline ? 4 : 1}
                />
              </View>
            ))}
          </ScrollView>
        );

      case 'selection':
        return (
          <ScrollView style={styles.selectionContainer}>
            <Text style={styles.selectionTitle}>{step.title}</Text>
            <Text style={styles.selectionSubtitle}>{step.subtitle}</Text>
            
            {step.options.map((option, index) => (
              <View key={option.key} style={styles.optionContainer}>
                <Text style={styles.optionLabel}>{option.label}</Text>
                <TextInput
                  style={styles.optionInput}
                  placeholder={option.placeholder}
                  placeholderTextColor="#9CA3AF"
                  value={answers[option.key]}
                  onChangeText={(text) => updateAnswer(option.key, text)}
                  multiline={true}
                  numberOfLines={3}
                />
              </View>
            ))}
          </ScrollView>
        );

      case 'response':
        return (
          <ScrollView style={styles.responseContainer}>
            <Text style={styles.responseTitle}>{step.title}</Text>
            <Text style={styles.responseSubtitle}>{step.subtitle}</Text>
            
            <View style={styles.methodsContainer}>
              {step.methods.map((method) => (
                <TouchableOpacity
                  key={method.key}
                  style={[
                    styles.methodButton,
                    answers.responseMethod === method.key && styles.methodButtonActive,
                  ]}
                  onPress={() => updateAnswer('responseMethod', method.key)}
                >
                  <Text style={[
                    styles.methodText,
                    answers.responseMethod === method.key && styles.methodTextActive,
                  ]}>
                    {method.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TextInput
              style={styles.responseInput}
              placeholder="寫下你的回應..."
              placeholderTextColor="#9CA3AF"
              value={answers.newResponse}
              onChangeText={(text) => updateAnswer('newResponse', text)}
              multiline={true}
              numberOfLines={5}
            />

            <TouchableOpacity
              style={styles.exampleButton}
              onPress={() => setShowExamples(true)}
            >
              <Text style={styles.exampleButtonText}>查看回應範例 💡</Text>
            </TouchableOpacity>
          </ScrollView>
        );

      case 'reflection':
        return (
          <View style={styles.reflectionContainer}>
            <Text style={styles.reflectionTitle}>{step.title}</Text>
            <Text style={styles.reflectionSubtitle}>{step.subtitle}</Text>
            <Text style={styles.reflectionDescription}>{step.description}</Text>
            
            <TextInput
              style={styles.reflectionInput}
              placeholder={step.field.placeholder}
              placeholderTextColor="#9CA3AF"
              value={answers[step.field.key]}
              onChangeText={(text) => updateAnswer(step.field.key, text)}
              multiline={true}
              numberOfLines={6}
            />
          </View>
        );

      case 'completion':
        return (
          <View style={styles.completionContainer}>
            {/* 嘗試載入完成圖片，若失敗則顯示 fallback emoji */}
            <Text style={styles.completionTitle}>{step.title}</Text>
            <Text style={styles.completionText}>{step.content}</Text>

            {/* fallback 區塊（若圖片載入失敗時仍會顯示） */}
            <View style={{ marginTop: 20, alignItems: 'center' }}>
              <Text style={{ fontSize: 48, color: '#10B981' }}>🌿</Text>
              <Text style={{ fontSize: 16, color: '#374151', marginTop: 10 }}>
                恭喜完成今日練習！
              </Text>
            </View>
          </View>
        );


      default:
        return null;
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { width: `${((currentStep + 1) / steps.length) * 100}%` }
              ]} 
            />
          </View>
          <Text style={styles.progressText}>
            {currentStep + 1} / {steps.length}
          </Text>
        </View>
      </View>

      <View style={styles.content}>
        {renderStepContent()}
      </View>

      <View style={styles.footer}>
        {currentStep > 0 && (
          <TouchableOpacity 
            style={styles.previousButton} 
            onPress={handlePrevious}
          >
            <Text style={styles.previousButtonText}>上一步</Text>
          </TouchableOpacity>
        )}
        
        <TouchableOpacity 
          style={styles.nextButton} 
          onPress={handleNext}
        >
          <Text style={styles.nextButtonText}>
            {currentStep === steps.length - 1 ? '完成' : '下一步'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* 範例彈窗 */}
      <Modal
        visible={showExamples}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowExamples(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>回應範例</Text>
            <ScrollView style={styles.examplesList}>
              {steps[7].examples.map((example, index) => (
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
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: 'rgba(103, 169, 224, 0.95)',
  },
  backButton: {
    padding: 10,
  },
  backText: {
    fontSize: 24,
    color: '#FFFFFF',
  },
  progressContainer: {
    flex: 1,
    marginLeft: 20,
  },
  progressBar: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 3,
  },
  progressText: {
    color: '#FFFFFF',
    fontSize: 12,
    marginTop: 5,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  previousButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  previousButtonText: {
    color: '#6B7280',
    fontSize: 16,
  },
  nextButton: {
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 8,
    backgroundColor: 'rgba(103, 169, 224, 0.95)',
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },

  // Intro styles
  introContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  introImage: {
    width: 150,
    height: 150,
    marginBottom: 30,
  },
  introTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 20,
  },
  introText: {
    fontSize: 16,
    color: '#4B5563',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },

  // Action styles
  actionContainer: {
    paddingVertical: 30,
  },
  actionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 15,
  },
  actionText: {
    fontSize: 16,
    color: '#4B5563',
    lineHeight: 24,
    marginBottom: 20,
  },
  breathingIndicator: {
    alignItems: 'center',
    marginTop: 30,
    padding: 20,
    backgroundColor: 'rgba(103, 169, 224, 0.1)',
    borderRadius: 12,
  },
  breathingEmoji: {
    fontSize: 48,
    marginBottom: 10,
  },
  breathingText: {
    fontSize: 18,
    color: '#374151',
    fontWeight: '500',
  },

  // Writing styles
  writingContainer: {
    flex: 1,
  },
  writingTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 10,
  },
  writingSubtitle: {
    fontSize: 16,
    color: '#374151',
    marginBottom: 10,
    lineHeight: 24,
  },
  writingDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 20,
    lineHeight: 20,
  },
  fieldContainer: {
    marginBottom: 20,
  },
  fieldLabel: {
    fontSize: 15,
    color: '#374151',
    marginBottom: 8,
    fontWeight: '500',
  },
  fieldInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    color: '#111827',
    backgroundColor: '#FFFFFF',
  },
  multilineInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },

  // Selection styles
  selectionContainer: {
    flex: 1,
  },
  selectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 10,
  },
  selectionSubtitle: {
    fontSize: 16,
    color: '#374151',
    marginBottom: 20,
  },
  optionContainer: {
    marginBottom: 25,
  },
  optionLabel: {
    fontSize: 15,
    color: '#374151',
    marginBottom: 10,
    fontWeight: '500',
    lineHeight: 22,
  },
  optionInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    color: '#111827',
    backgroundColor: '#FFFFFF',
    minHeight: 70,
    textAlignVertical: 'top',
  },

  // Response styles
  responseContainer: {
    flex: 1,
  },
  responseTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 10,
  },
  responseSubtitle: {
    fontSize: 16,
    color: '#374151',
    marginBottom: 20,
  },
  methodsContainer: {
    marginBottom: 20,
  },
  methodButton: {
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    backgroundColor: '#FFFFFF',
    marginBottom: 10,
  },
  methodButtonActive: {
    backgroundColor: 'rgba(103, 169, 224, 0.1)',
    borderColor: 'rgba(103, 169, 224, 0.95)',
  },
  methodText: {
    fontSize: 15,
    color: '#374151',
    lineHeight: 22,
  },
  methodTextActive: {
    color: 'rgba(103, 169, 224, 0.95)',
    fontWeight: '500',
  },
  responseInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    color: '#111827',
    backgroundColor: '#FFFFFF',
    minHeight: 120,
    textAlignVertical: 'top',
    marginBottom: 20,
  },
  exampleButton: {
    alignSelf: 'center',
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(103, 169, 224, 0.1)',
    borderRadius: 20,
  },
  exampleButtonText: {
    color: 'rgba(103, 169, 224, 0.95)',
    fontSize: 14,
    fontWeight: '500',
  },

  // Reflection styles
  reflectionContainer: {
    paddingVertical: 20,
  },
  reflectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 10,
  },
  reflectionSubtitle: {
    fontSize: 16,
    color: '#374151',
    marginBottom: 10,
  },
  reflectionDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 20,
  },
  reflectionInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    color: '#111827',
    backgroundColor: '#FFFFFF',
    minHeight: 150,
    textAlignVertical: 'top',
  },

  // Completion styles
  completionContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  completionImage: {
    width: 120,
    height: 120,
    marginBottom: 30,
  },
  completionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#10B981',
    marginBottom: 20,
  },
  completionText: {
    fontSize: 16,
    color: '#4B5563',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 30,
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
    color: '#111827',
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
    color: 'rgba(103, 169, 224, 0.95)',
    marginRight: 10,
    fontSize: 16,
  },
  exampleText: {
    flex: 1,
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20,
  },
  modalCloseButton: {
    marginTop: 20,
    paddingVertical: 12,
    backgroundColor: 'rgba(103, 169, 224, 0.95)',
    borderRadius: 8,
  },
  modalCloseText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
});

export default SelfAwarenessPractice;