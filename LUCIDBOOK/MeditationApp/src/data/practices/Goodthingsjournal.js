// GoodThingsjournal.js
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  Image,
  TextInput,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';
import Slider from '@react-native-community/slider';
import { LinearGradient } from 'expo-linear-gradient';

export default function GoodThingsJournal({ onBack, navigation, route }) {
  // 頁面狀態：'intro' (第一頁) -> 'writing1' (第二頁) -> 'writing2' (第三頁) -> 'reflection' (第四頁) -> 'completion' (第五頁)
  const [currentPage, setCurrentPage] = useState('intro');
  
  // 第二頁狀態
  const [question1Answer, setQuestion1Answer] = useState(''); // 那是什麼時刻、情景、與誰一起？
  const [question2Answer, setQuestion2Answer] = useState(''); // 你當時的想法是什麼？
  const [selectedFeelings, setSelectedFeelings] = useState([]); // 這件事讓你有什麼感受？
  const [otherFeeling, setOtherFeeling] = useState(''); // 其他感受
  const [showQuestion2, setShowQuestion2] = useState(false);
  const [showQuestion3, setShowQuestion3] = useState(false);
  const [activeInspiration, setActiveInspiration] = useState(null); // 'q1' or 'q2'
  
  // 第三頁狀態
  const [question4Answer, setQuestion4Answer] = useState(''); // 你或他人做了什麼
  const [question5Answer, setQuestion5Answer] = useState(''); // 你可以怎麼做
  const [selectedActions, setSelectedActions] = useState([]); // 選擇想嘗試的小行動
  const [otherAction, setOtherAction] = useState(''); // 其他行動
  const [showQuestion5, setShowQuestion5] = useState(false);
  const [showQuestion6, setShowQuestion6] = useState(false);
  const [activeInspirationPage2, setActiveInspirationPage2] = useState(null); // 'q4' or 'q5'
  
  // 第四頁狀態
  const [positiveLevel, setPositiveLevel] = useState(5); // 正向感受程度 0-10
  const [selectedMoods, setSelectedMoods] = useState([]); // 書寫完後的心情
  const [moodNote, setMoodNote] = useState(''); // 心情記錄
  
  const scrollViewRef = useRef(null);
  const previousScreen = route?.params?.from;

  // 第二頁：感受選項
  const feelingOptions = [
    { id: 1, label: '放鬆' },
    { id: 2, label: '平靜' },
    { id: 3, label: '被理解' },
    { id: 4, label: '被支持' },
    { id: 5, label: '感到貼心' },
    { id: 6, label: '幸福' },
    { id: 7, label: '開心' },
    { id: 8, label: '被照顧' },
    { id: 9, label: '覺得被看見' },
    { id: 10, label: '其他', isOther: true },
  ];

  // 第三頁：小行動選項
  const actionOptions = [
    { id: 1, label: '明天提早 10 分鐘出門' },
    { id: 2, label: '下次主動跟同事聊天' },
    { id: 3, label: '明天起床先不要滑手機' },
    { id: 4, label: '做 5 次深呼吸' },
    { id: 5, label: '走慢一點、感受身體狀態' },
    { id: 6, label: '其他', isOther: true },
  ];

  // 第四頁：心情選項
  const moodOptions = [
    { id: 1, label: '平靜安定' },
    { id: 2, label: '原本不舒服的情緒緩和了些' },
    { id: 3, label: '滿足' },
    { id: 4, label: '有趣' },
    { id: 5, label: '溫暖' },
    { id: 6, label: '沒特別感受' },
    { id: 7, label: '其他', isOther: true },
  ];

  // 第二頁：靈感提示內容
  const inspirationContentQ1 = [
    '與他人的互動（家人、朋友、同事）',
    '個人的成就或進步',
    '生活中的小確幸',
    '美好的感官體驗（美食、音樂、風景）',
  ];

  const inspirationContentQ2 = [
    '原因：',
    '昨晚早睡、早上沒滑手機，所以有心情陪貓。',
    '可複製條件：',
    '早點休息就會有更多早晨的餘裕。',
    '明日可做行動：',
    '明早醒來先放下手機 5 分鐘，感受身體狀態。',
  ];

  // 第三頁：靈感提示內容
  const inspirationContentQ4 = inspirationContentQ1;
  
  const inspirationContentQ5 = inspirationContentQ2;

  // 監聽第一個問題的輸入，顯示第二個問題
  useEffect(() => {
    if (currentPage === 'writing1' && question1Answer.length > 0 && !showQuestion2) {
      setShowQuestion2(true);
    }
  }, [question1Answer, currentPage, showQuestion2]);

  // 監聽第二個問題的輸入，顯示第三個問題
  useEffect(() => {
    if (currentPage === 'writing1' && question2Answer.length > 0 && !showQuestion3) {
      setShowQuestion3(true);
    }
  }, [question2Answer, currentPage, showQuestion3]);

  // 監聽第四個問題的輸入（第三頁），顯示第五個問題
  useEffect(() => {
    if (currentPage === 'writing2' && question4Answer.length > 0 && !showQuestion5) {
      setShowQuestion5(true);
    }
  }, [question4Answer, currentPage, showQuestion5]);

  // 監聽第五個問題的輸入，顯示第六個問題
  useEffect(() => {
    if (currentPage === 'writing2' && question5Answer.length > 0 && !showQuestion6) {
      setShowQuestion6(true);
    }
  }, [question5Answer, currentPage, showQuestion6]);

  // 處理返回按鈕
  const handleBack = () => {
    if (currentPage === 'completion') {
      setCurrentPage('reflection');
    } else if (currentPage === 'reflection') {
      setCurrentPage('writing2');
    } else if (currentPage === 'writing2') {
      setCurrentPage('writing1');
    } else if (currentPage === 'writing1') {
      setCurrentPage('intro');
    } else {
      // 在第一頁，返回上一個畫面
      if (onBack) {
        onBack();
      } else if (navigation) {
        if (previousScreen) {
          navigation.navigate(previousScreen);
        } else {
          navigation.goBack();
        }
      }
    }
  };

  // 處理 Home 按鈕
  const handleHome = () => {
    // 重置所有狀態
    setCurrentPage('intro');
    if (navigation) {
      navigation.navigate('Home');
    }
  };

  // 切換感受選項
  const toggleFeeling = (feelingId) => {
    const selectedFeeling = feelingOptions.find(f => f.id === feelingId);
    
    if (selectedFeeling?.isOther) {
      if (selectedFeelings.includes(feelingId)) {
        setSelectedFeelings(selectedFeelings.filter(id => id !== feelingId));
        setOtherFeeling('');
      } else {
        setSelectedFeelings([...selectedFeelings, feelingId]);
      }
    } else {
      if (selectedFeelings.includes(feelingId)) {
        setSelectedFeelings(selectedFeelings.filter(id => id !== feelingId));
      } else {
        setSelectedFeelings([...selectedFeelings, feelingId]);
      }
    }
  };

  // 切換行動選項
  const toggleAction = (actionId) => {
    const selectedAction = actionOptions.find(a => a.id === actionId);
    
    if (selectedAction?.isOther) {
      if (selectedActions.includes(actionId)) {
        setSelectedActions(selectedActions.filter(id => id !== actionId));
        setOtherAction('');
      } else {
        setSelectedActions([...selectedActions, actionId]);
      }
    } else {
      if (selectedActions.includes(actionId)) {
        setSelectedActions(selectedActions.filter(id => id !== actionId));
      } else {
        setSelectedActions([...selectedActions, actionId]);
      }
    }
  };

  // 切換心情選項
  const toggleMood = (moodId) => {
    const selectedMood = moodOptions.find(m => m.id === moodId);
    
    if (selectedMood?.isOther) {
      if (selectedMoods.includes(moodId)) {
        setSelectedMoods(selectedMoods.filter(id => id !== moodId));
        setMoodNote('');
      } else {
        setSelectedMoods([...selectedMoods, moodId]);
      }
    } else {
      if (selectedMoods.includes(moodId)) {
        setSelectedMoods(selectedMoods.filter(id => id !== moodId));
      } else {
        setSelectedMoods([...selectedMoods, moodId]);
      }
    }
  };

  // 切換靈感提示（第二頁）
  const toggleInspiration = (questionId) => {
    if (activeInspiration === questionId) {
      setActiveInspiration(null);
    } else {
      setActiveInspiration(questionId);
    }
  };

  // 切換靈感提示（第三頁）
  const toggleInspirationPage2 = (questionId) => {
    if (activeInspirationPage2 === questionId) {
      setActiveInspirationPage2(null);
    } else {
      setActiveInspirationPage2(questionId);
    }
  };

  // 渲染第一頁（介紹頁）
  const renderIntroPage = () => (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.introContainer}>
        <ScrollView 
          contentContainerStyle={styles.introScrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* 圖標 */}
          <View style={styles.introIconContainer}>
            <Image 
              source={require('../../../assets/images/Heart_shine.png')}
              style={styles.introIcon}
              resizeMode="contain"
            />
          </View>

          {/* 標題 */}
          <Text style={styles.introTitle}>心理亮點雷達</Text>
          
          {/* 時間 */}
          <View style={styles.introTimeContainer}>
            <Image 
              source={require('../../../assets/images/sample_clock.png')}
              style={styles.clockIcon}
              resizeMode="contain"
            />
            <Text style={styles.introTimeText}>10 分鐘</Text>
          </View>

          {/* 說明文字 */}
          <Text style={styles.introDescription}>
            記住做不好的事情是大腦的原廠設定{'\n'}用好事書寫改變負向對話的神經迴路
          </Text>

          {/* 開始按鈕 */}
          <TouchableOpacity 
            style={styles.startJournalButton}
            onPress={() => setCurrentPage('writing1')}
          >
            <Text style={styles.startJournalButtonText}>記錄那些小小的好事</Text>
            <Text style={styles.startJournalArrow}>›</Text>
          </TouchableOpacity>
        </ScrollView>

        {/* 底部 Home 按鈕 */}
        <View style={styles.bottomNav}>
          <TouchableOpacity 
            onPress={handleHome}
            style={styles.homeButtonContainer}
          >
            <View style={styles.homeButtonBackground}>
              <Image 
                source={require('../../../assets/images/Home_icon.png')}
                style={styles.bottomHomeIcon}
                resizeMode="contain"
              />
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );

  // 渲染第二頁（書寫頁面1）
  const renderWriting1Page = () => {
    const isOtherFeelingSelected = selectedFeelings.includes(10);
    // 靈感按鈕始終顯示，位置根據第二題是否出現而定
    const inspirationPosition = showQuestion2 ? 'q2' : 'q1';

    return (
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.writingContainer}>
          <ScrollView 
            ref={scrollViewRef}
            contentContainerStyle={styles.writingScrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* 標題 */}
            <Text style={styles.writingMainTitle}>今天發生了什麼好事</Text>
            <Text style={styles.writingSubtitle}>
              任何讓你覺得舒服、安心、{'\n'}快樂的小事
            </Text>

            {/* 問題1 */}
            <Text style={styles.questionLabel}>那是什麼時刻、情景、與誰一起？</Text>
            <TextInput
              style={styles.questionInput}
              multiline
              placeholder="例如：跟同事邊吃便當邊聊發，突然覺得被理解"
              placeholderTextColor="#B0B0B0"
              value={question1Answer}
              onChangeText={setQuestion1Answer}
              textAlignVertical="top"
            />

            {/* 問題2 - 條件顯示 */}
            {showQuestion2 && (
              <>
                <Text style={styles.questionLabel}>你當時的想法是什麼？</Text>
                <TextInput
                  style={styles.questionInput}
                  multiline
                  placeholder="例如：原來小事也可以讓我心情變好"
                  placeholderTextColor="#B0B0B0"
                  value={question2Answer}
                  onChangeText={setQuestion2Answer}
                  textAlignVertical="top"
                />
              </>
            )}

            {/* 靈感提示 - 始終顯示，根據位置切換 */}
            <TouchableOpacity 
              style={styles.inspirationTrigger}
              onPress={() => toggleInspiration(inspirationPosition)}
            >
              <Image 
                source={require('../../../assets/images/Fresh_idea.png')}
                style={[
                  styles.inspirationIcon,
                  activeInspiration === inspirationPosition && styles.inspirationIconActive
                ]}
                resizeMode="contain"
              />
              <Text 
                style={[
                  styles.inspirationText,
                  activeInspiration !== inspirationPosition && styles.inspirationTextInactive
                ]}
              >
                需要靈感嗎？
              </Text>
            </TouchableOpacity>

            {/* 靈感內容 - 根據當前問題顯示 */}
            {activeInspiration === 'q1' && (
              <View style={styles.inspirationBox}>
                <Text style={styles.inspirationBoxTitle}>可以試試這些方向：</Text>
                {inspirationContentQ1.map((item, index) => (
                  <Text key={index} style={styles.inspirationBoxItem}>• {item}</Text>
                ))}
              </View>
            )}

            {activeInspiration === 'q2' && (
              <View style={styles.inspirationBox}>
                <Text style={styles.inspirationBoxTitle}>可以試試這些方向：</Text>
                {inspirationContentQ2.map((item, index) => (
                  <Text key={index} style={styles.inspirationBoxItem}>
                    {item.startsWith('•') ? item : `${item}`}
                  </Text>
                ))}
              </View>
            )}

            {/* 問題3 - 條件顯示 */}
            {showQuestion3 && (
              <>
                <Text style={styles.questionLabel}>這件事讓你有什麼感受？</Text>
                <View style={styles.tagsContainer}>
                  {feelingOptions.map((feeling) => {
                    const isSelected = selectedFeelings.includes(feeling.id);
                    const isOther = feeling.isOther;
                    
                    return (
                      <TouchableOpacity
                        key={feeling.id}
                        style={[
                          styles.feelingTag,
                          isOther && !isSelected && styles.feelingTagOutline,
                          isOther && isSelected && styles.feelingTagFilled,
                          !isOther && isSelected && styles.feelingTagSelected,
                        ]}
                        onPress={() => toggleFeeling(feeling.id)}
                      >
                        <Text 
                          style={[
                            styles.feelingTagText,
                            isOther && isSelected && styles.feelingTagTextFilled,
                            !isOther && isSelected && styles.feelingTagTextSelected,
                          ]}
                        >
                          {feeling.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {/* 其他感受輸入框 */}
                {isOtherFeelingSelected && (
                  <>
                    <Text style={styles.recordPrompt}>記錄下來</Text>
                    <TextInput
                      style={styles.recordInput}
                      multiline
                      placeholder="在這裡寫下你的感受..."
                      placeholderTextColor="#B0B0B0"
                      value={otherFeeling}
                      onChangeText={setOtherFeeling}
                      textAlignVertical="top"
                    />
                  </>
                )}
              </>
            )}

            {/* 好事花生按鈕 - 放在內容底部 */}
            <TouchableOpacity 
              style={styles.nextPageButton}
              onPress={() => setCurrentPage('writing2')}
            >
              <Text style={styles.nextPageButtonText}>好事花生</Text>
              <Text style={styles.nextPageArrow}>›</Text>
            </TouchableOpacity>

            {/* 底部間距 */}
            <View style={{ height: 100 }} />
          </ScrollView>

          {/* 底部 Home 按鈕 */}
          <View style={styles.bottomNav}>
            <TouchableOpacity 
              onPress={handleHome}
              style={styles.homeButtonContainer}
            >
              <View style={styles.homeButtonBackground}>
                <Image 
                  source={require('../../../assets/images/Home_icon.png')}
                  style={styles.bottomHomeIcon}
                  resizeMode="contain"
                />
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableWithoutFeedback>
    );
  };

  // 渲染第三頁（書寫頁面2）
  const renderWriting2Page = () => {
    const isOtherActionSelected = selectedActions.includes(6);
    // 靈感按鈕始終顯示，位置根據第五題是否出現而定
    const inspirationPosition = showQuestion5 ? 'q5' : 'q4';

    return (
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.writingContainer}>
          <ScrollView 
            ref={scrollViewRef}
            contentContainerStyle={styles.writingScrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* 標題 */}
            <Text style={styles.writingMainTitle}>好事可以再發生</Text>
            <Text style={styles.writingSubtitle}>
              找出讓好事發生的原因{'\n'}讓複製好心情更容易
            </Text>

            {/* 問題4 */}
            <Text style={styles.questionLabel}>你或他人做了什麼，讓這件好事得以發生？</Text>
            <TextInput
              style={styles.questionInput}
              multiline
              placeholder="例如：我跟早出門，所以能夠慢慢散步"
              placeholderTextColor="#B0B0B0"
              value={question4Answer}
              onChangeText={setQuestion4Answer}
              textAlignVertical="top"
            />

            {/* 問題5 - 條件顯示 */}
            {showQuestion5 && (
              <>
                <Text style={styles.questionLabel}>你可以怎麼做，讓這件事有機會再發生？</Text>
                <TextInput
                  style={styles.questionInput}
                  multiline
                  placeholder="例如：明天也提早 10 分鐘出門"
                  placeholderTextColor="#B0B0B0"
                  value={question5Answer}
                  onChangeText={setQuestion5Answer}
                  textAlignVertical="top"
                />
              </>
            )}

            {/* 靈感提示 - 始終顯示，根據位置切換 */}
            <TouchableOpacity 
              style={styles.inspirationTrigger}
              onPress={() => toggleInspirationPage2(inspirationPosition)}
            >
              <Image 
                source={require('../../../assets/images/Fresh_idea.png')}
                style={[
                  styles.inspirationIcon,
                  activeInspirationPage2 === inspirationPosition && styles.inspirationIconActive
                ]}
                resizeMode="contain"
              />
              <Text 
                style={[
                  styles.inspirationText,
                  activeInspirationPage2 !== inspirationPosition && styles.inspirationTextInactive
                ]}
              >
                需要靈感嗎？
              </Text>
            </TouchableOpacity>

            {/* 靈感內容 */}
            {activeInspirationPage2 === 'q4' && (
              <View style={styles.inspirationBox}>
                <Text style={styles.inspirationBoxTitle}>可以試試這些方向：</Text>
                {inspirationContentQ4.map((item, index) => (
                  <Text key={index} style={styles.inspirationBoxItem}>• {item}</Text>
                ))}
              </View>
            )}

            {activeInspirationPage2 === 'q5' && (
              <View style={styles.inspirationBox}>
                <Text style={styles.inspirationBoxTitle}>可以試試這些方向：</Text>
                {inspirationContentQ5.map((item, index) => (
                  <Text key={index} style={styles.inspirationBoxItem}>
                    {item.startsWith('•') ? item : `${item}`}
                  </Text>
                ))}
              </View>
            )}

            {/* 問題6 - 條件顯示 */}
            {showQuestion6 && (
              <>
                <Text style={styles.actionPrompt}>選擇想嘗試的小行動</Text>
                <View style={styles.tagsContainer}>
                  {actionOptions.map((action) => {
                    const isSelected = selectedActions.includes(action.id);
                    const isOther = action.isOther;
                    
                    return (
                      <TouchableOpacity
                        key={action.id}
                        style={[
                          styles.actionTag,
                          isOther && !isSelected && styles.actionTagOutline,
                          isOther && isSelected && styles.actionTagFilled,
                          !isOther && isSelected && styles.actionTagSelected,
                        ]}
                        onPress={() => toggleAction(action.id)}
                      >
                        <Text 
                          style={[
                            styles.actionTagText,
                            isOther && isSelected && styles.actionTagTextFilled,
                            !isOther && isSelected && styles.actionTagTextSelected,
                          ]}
                        >
                          {action.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {/* 其他行動輸入框 */}
                {isOtherActionSelected && (
                  <>
                    <Text style={styles.recordPrompt}>記錄下來</Text>
                    <TextInput
                      style={styles.recordInput}
                      multiline
                      placeholder="在這裡寫下你想嘗試的行動..."
                      placeholderTextColor="#B0B0B0"
                      value={otherAction}
                      onChangeText={setOtherAction}
                      textAlignVertical="top"
                    />
                  </>
                )}
              </>
            )}

            {/* 好事再花生按鈕 - 放在內容底部 */}
            <TouchableOpacity 
              style={styles.nextPageButton}
              onPress={() => setCurrentPage('reflection')}
            >
              <Text style={styles.nextPageButtonText}>好事再花生</Text>
              <Text style={styles.nextPageArrow}>›</Text>
            </TouchableOpacity>

            {/* 底部間距 */}
            <View style={{ height: 100 }} />
          </ScrollView>

          {/* 底部 Home 按鈕 */}
          <View style={styles.bottomNav}>
            <TouchableOpacity 
              onPress={handleHome}
              style={styles.homeButtonContainer}
            >
              <View style={styles.homeButtonBackground}>
                <Image 
                  source={require('../../../assets/images/Home_icon.png')}
                  style={styles.bottomHomeIcon}
                  resizeMode="contain"
                />
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableWithoutFeedback>
    );
  };

  // 渲染第四頁（感受覺察）
  const renderReflectionPage = () => {
    const isOtherMoodSelected = selectedMoods.includes(7);

    return (
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.reflectionContainer}>
          <ScrollView 
            contentContainerStyle={styles.reflectionScrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* 標題 */}
            <Text style={styles.reflectionMainTitle}>感受覺察</Text>
            <Text style={styles.reflectionSubtitle}>花1分鐘看今天的心情</Text>

            {/* 正向感受程度區塊 */}
            <View style={styles.sliderSection}>
              <Text style={styles.sliderTitle}>對自己或生活的正向感受</Text>
              
              {/* Slider 容器 */}
              <View style={styles.sliderContainer}>
                <Slider
                  style={styles.slider}
                  minimumValue={0}
                  maximumValue={10}
                  step={0.1}
                  value={positiveLevel}
                  onValueChange={setPositiveLevel}
                  minimumTrackTintColor="#31C6FF"
                  maximumTrackTintColor="rgba(255, 255, 255, 0.40)"
                  thumbTintColor="#FFFFFF"
                />
              </View>

              {/* 刻度標籤 */}
              <View style={styles.sliderLabels}>
                <Text style={styles.sliderLabelText}>0 完全沒有</Text>
                <Text style={styles.sliderLabelText}>10 踏實愉悅</Text>
              </View>
            </View>

            {/* 心情選擇 */}
            <Text style={styles.moodPrompt}>書寫完後，今天的心情是</Text>
            
            <View style={styles.moodTagsContainer}>
              {moodOptions.map((mood) => {
                const isSelected = selectedMoods.includes(mood.id);
                const isOther = mood.isOther;
                
                return (
                  <TouchableOpacity
                    key={mood.id}
                    style={[
                      styles.moodTag,
                      isOther && !isSelected && styles.moodTagOutline,
                      isOther && isSelected && styles.moodTagFilled,
                      !isOther && isSelected && styles.moodTagSelected,
                    ]}
                    onPress={() => toggleMood(mood.id)}
                  >
                    <Text 
                      style={[
                        styles.moodTagText,
                        isOther && isSelected && styles.moodTagTextFilled,
                        !isOther && isSelected && styles.moodTagTextSelected,
                      ]}
                    >
                      {mood.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* 其他心情輸入框 */}
            {isOtherMoodSelected && (
              <>
                <Text style={styles.recordPrompt}>記錄下來</Text>
                <TextInput
                  style={styles.recordInput}
                  multiline
                  placeholder="在這裡寫下你的感受..."
                  placeholderTextColor="#B0B0B0"
                  value={moodNote}
                  onChangeText={setMoodNote}
                  textAlignVertical="top"
                />
              </>
            )}

            {/* 記錄此刻的感受按鈕 - 放在內容底部 */}
            <TouchableOpacity 
              style={styles.submitButton}
              onPress={() => {
                // TODO: 保存數據到後端
                console.log('保存好事書寫數據');
                setCurrentPage('completion');
              }}
            >
              <Text style={styles.submitButtonText}>記錄此刻的感受</Text>
              <LinearGradient
                colors={['rgba(0, 0, 0, 0.00)', 'rgba(49, 198, 254, 0.20)', 'rgba(0, 0, 0, 0.00)']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.submitButtonGradient}
                pointerEvents="none"
              />
            </TouchableOpacity>

            {/* 底部間距 */}
            <View style={{ height: 100 }} />
          </ScrollView>

          {/* 底部 Home 按鈕 */}
          <View style={styles.bottomNav}>
            <TouchableOpacity 
              onPress={handleHome}
              style={styles.homeButtonContainer}
            >
              <View style={styles.homeButtonBackground}>
                <Image 
                  source={require('../../../assets/images/Home_icon.png')}
                  style={styles.bottomHomeIcon}
                  resizeMode="contain"
                />
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableWithoutFeedback>
    );
  };

  // 渲染第五頁（完成頁面）
  const renderCompletionPage = () => (
    <View style={styles.completionContainer}>
      <ScrollView 
        contentContainerStyle={styles.completionScrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 標題 */}
        <Text style={styles.completionTitle}>太棒了！</Text>
        
        {/* 副標題 */}
        <Text style={styles.completionSubtitle}>
          你完成了今天的好事書寫，{'\n'}繼續保持這個美好的習慣吧！
        </Text>

        {/* 連續天數卡片 */}
        <View style={styles.streakCard}>
          {/* 慶祝 Emoji */}
          <Text style={styles.celebrationEmoji}>🎉</Text>
          
          <Text style={styles.streakLabel}>你已經連續練習</Text>
          <Text style={styles.streakDays}>3 天</Text>
        </View>

        {/* 查看日記按鈕 */}
        <TouchableOpacity 
          style={styles.viewDiaryButton}
          onPress={() => {
            console.log('導航到日記頁面');
            if (navigation) {
              navigation.navigate('Daily');
            } else {
              handleHome();
            }
          }}
        >
          <Text style={styles.viewDiaryButtonText}>查看日記</Text>
          <LinearGradient
            colors={['rgba(0, 0, 0, 0.00)', 'rgba(49, 198, 254, 0.20)', 'rgba(0, 0, 0, 0.00)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.viewDiaryButtonGradient}
            pointerEvents="none"
          />
        </TouchableOpacity>

        {/* 底部間距 */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* 底部 Home 按鈕 */}
      <View style={styles.bottomNav}>
        <TouchableOpacity 
          onPress={handleHome}
          style={styles.homeButtonContainer}
        >
          <View style={styles.homeButtonBackground}>
            <Image 
              source={require('../../../assets/images/Home_icon.png')}
              style={styles.bottomHomeIcon}
              resizeMode="contain"
            />
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#E9EFF6" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Image 
            source={require('../../../assets/images/Left_arrow.png')}
            style={styles.backArrowIcon}
            resizeMode="contain"
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>好事書寫</Text>
        <View style={styles.headerRight} />
      </View>

      {/* 根據當前頁面渲染不同內容 */}
      {currentPage === 'intro' 
        ? renderIntroPage() 
        : currentPage === 'writing1' 
        ? renderWriting1Page()
        : currentPage === 'writing2'
        ? renderWriting2Page()
        : currentPage === 'reflection'
        ? renderReflectionPage()
        : renderCompletionPage()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E9EFF6',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 12,
    backgroundColor: '#E9EFF6',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backArrowIcon: {
    width: 18,
    height: 24,
    tintColor: '#31C6FE',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#606060',
    flex: 1,
    textAlign: 'center',
  },
  headerRight: {
    width: 40,
  },
  
  // 第一頁樣式
  introContainer: {
    flex: 1,
    backgroundColor: '#E9EFF6',
  },
  introScrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 150,
    alignItems: 'center',
  },
  introIconContainer: {
    width: 64,
    height: 64,
    marginBottom: 24,
  },
  introIcon: {
    width: 64,
    height: 64,
  },
  introTitle: {
    fontSize: 33,
    fontWeight: '400',
    color: '#2B2B2B',
    textAlign: 'center',
    fontFamily: 'Inter',
    marginBottom: 16,
  },
  introTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  clockIcon: {
    width: 16,
    height: 16,
    marginRight: 6,
  },
  introTimeText: {
    fontSize: 14,
    fontWeight: '400',
    color: '#4A5565',
    fontFamily: 'Inter',
  },
  introDescription: {
    fontSize: 17,
    fontWeight: '400',
    color: '#2B2B2B',
    textAlign: 'center',
    lineHeight: 29.25,
    fontFamily: 'Inter',
    marginBottom: 60,
  },
  startJournalButton: {
    width: 340,
    height: 56,
    backgroundColor: 'rgba(255, 255, 255, 0.60)',
    borderRadius: 100,
    borderWidth: 1,
    borderColor: '#31C6FE',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  startJournalButtonText: {
    fontSize: 18,
    fontWeight: '400',
    color: '#166CB5',
    fontFamily: 'Inter',
  },
  startJournalArrow: {
    fontSize: 22,
    color: '#31C6FE',
    fontWeight: '300',
    position: 'absolute',
    right: 24,
  },
  
  // 第二、三頁共用樣式
  writingContainer: {
    flex: 1,
    backgroundColor: '#E9EFF6',
  },
  writingScrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 150,
  },
  writingMainTitle: {
    fontSize: 30,
    fontWeight: '400',
    color: '#2B2B2B',
    textAlign: 'center',
    fontFamily: 'Inter',
    marginBottom: 8,
  },
  writingSubtitle: {
    fontSize: 17,
    fontWeight: '400',
    color: '#2B2B2B',
    textAlign: 'center',
    lineHeight: 29.25,
    fontFamily: 'Inter',
    marginBottom: 32,
  },
  questionLabel: {
    fontSize: 14,
    fontWeight: '400',
    color: '#5c5c5cff',
    fontFamily: 'Inter',
    marginBottom: 12,
  },
  questionInput: {
    width: '100%',
    minHeight: 155,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 0.732,
    borderColor: 'rgba(0, 0, 0, 0.00)',
    padding: 16,
    fontSize: 14,
    fontFamily: 'Inter',
    color: '#808080',
    marginBottom: 24,
  },
  inspirationTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  inspirationIcon: {
    width: 16,
    height: 16,
    marginRight: 6,
    tintColor: '#B0B0B0',
  },
  inspirationIconActive: {
    tintColor: '#31C6FF',
  },
  inspirationText: {
    fontSize: 14,
    fontWeight: '400',
    color: '#31C6FF',
    fontFamily: 'Inter',
  },
  inspirationTextInactive: {
    color: '#B0B0B0',
  },
  inspirationBox: {
    backgroundColor: 'rgba(49, 198, 254, 0.10)',
    borderRadius: 10,
    borderWidth: 0.732,
    borderColor: 'rgba(49, 198, 254, 0.20)',
    padding: 22,
    marginBottom: 24,
  },
  inspirationBoxTitle: {
    fontSize: 19.25,
    fontWeight: '400',
    color: '#1A2633',
    fontFamily: 'Inter',
    marginBottom: 16,
  },
  inspirationBoxItem: {
    fontSize: 19.25,
    fontWeight: '400',
    color: '#5B6B7F',
    fontFamily: 'Noto Sans TC',
    lineHeight: 27.5,
    marginBottom: 4,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 24,
  },
  feelingTag: {
    height: 48,
    paddingHorizontal: 14,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: '#31C6FF',
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  feelingTagOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#31C6FF',
  },
  feelingTagFilled: {
    backgroundColor: '#31C6FF',
  },
  feelingTagSelected: {
    backgroundColor: 'rgba(49, 198, 255, 0.70)',
  },
  feelingTagText: {
    fontSize: 14,
    fontWeight: '400',
    color: '#31C6FF',
    fontFamily: 'Inter',
  },
  feelingTagTextFilled: {
    color: '#FFFFFF',
  },
  feelingTagTextSelected: {
    color: '#FFFFFF',
  },
  actionTag: {
    height: 48,
    paddingHorizontal: 14,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: '#31C6FF',
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionTagOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#31C6FF',
  },
  actionTagFilled: {
    backgroundColor: '#31C6FF',
  },
  actionTagSelected: {
    backgroundColor: 'rgba(49, 198, 255, 0.70)',
  },
  actionTagText: {
    fontSize: 14,
    fontWeight: '400',
    color: '#31C6FF',
    fontFamily: 'Inter',
  },
  actionTagTextFilled: {
    color: '#FFFFFF',
  },
  actionTagTextSelected: {
    color: '#FFFFFF',
  },
  actionPrompt: {
    fontSize: 14,
    fontWeight: '400',
    color: '#31C6FF',
    fontFamily: 'Inter',
    marginBottom: 16,
  },
  recordPrompt: {
    fontSize: 14,
    fontWeight: '400',
    color: '#31C6FF',
    fontFamily: 'Inter',
    marginBottom: 12,
  },
  recordInput: {
    width: '100%',
    height: 161,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1.464,
    borderColor: 'rgba(0, 0, 0, 0.00)',
    padding: 16,
    fontSize: 14,
    fontFamily: 'Inter',
    marginBottom: 32,
  },
  // 第二、三頁按鈕 - 淺藍色邊框、白色背景、淺藍色文字
  nextPageButton: {
    width: '100%',
    maxWidth: 361,
    height: 48,
    backgroundColor: '#FFFFFF',
    borderRadius: 100,
    borderWidth: 1,
    borderColor: '#31C6FF',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginTop: 24,
  },
  nextPageButtonText: {
    fontSize: 18,
    fontWeight: '400',
    color: '#31C6FE',
    fontFamily: 'Inter',
  },
  nextPageArrow: {
    fontSize: 22,
    color: '#31C6FE',
    fontWeight: '300',
    position: 'absolute',
    right: 24,
  },
  
  // 第四頁樣式
  reflectionContainer: {
    flex: 1,
    backgroundColor: '#E9EFF6',
  },
  reflectionScrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 150,
  },
  reflectionMainTitle: {
    fontSize: 30,
    fontWeight: '400',
    color: '#2B2B2B',
    textAlign: 'center',
    fontFamily: 'Inter',
    marginBottom: 8,
  },
  reflectionSubtitle: {
    fontSize: 17,
    fontWeight: '400',
    color: '#2B2B2B',
    textAlign: 'center',
    lineHeight: 29.25,
    fontFamily: 'Inter',
    marginBottom: 32,
  },
  sliderSection: {
    width: '100%',
    maxWidth: 361,
    backgroundColor: 'rgba(255, 255, 255, 0.60)',
    borderRadius: 24,
    padding: 24,
    marginBottom: 24,
    alignSelf: 'center',
  },
  sliderTitle: {
    fontSize: 18,
    fontWeight: '400',
    color: '#0A0A0A',
    fontFamily: 'Inter',
    marginBottom: 16,
  },
  sliderContainer: {
    height: 9.5,
    marginBottom: 8,
  },
  slider: {
    width: '100%',
    height: 9.5,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sliderLabelText: {
    fontSize: 12,
    fontWeight: '400',
    color: '#4A5565',
    fontFamily: 'Inter',
  },
  moodPrompt: {
    fontSize: 14,
    fontWeight: '400',
    color: '#4A5565',
    fontFamily: 'Inter',
    marginBottom: 16,
  },
  moodTagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 24,
  },
  moodTag: {
    height: 48,
    paddingHorizontal: 14,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: '#31C6FF',
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  moodTagOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#31C6FF',
  },
  moodTagFilled: {
    backgroundColor: '#31C6FF',
  },
  moodTagSelected: {
    backgroundColor: 'rgba(49, 198, 255, 0.70)',
  },
  moodTagText: {
    fontSize: 14,
    fontWeight: '400',
    color: '#31C6FF',
    fontFamily: 'Inter',
  },
  moodTagTextFilled: {
    color: '#FFFFFF',
  },
  moodTagTextSelected: {
    color: '#FFFFFF',
  },
  // 第四頁按鈕 - 白色背景、漸層效果
  submitButton: {
    width: '100%',
    maxWidth: 361,
    height: 62,
    backgroundColor: '#FFFFFF',
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
    marginTop: 24,
  },
  submitButtonText: {
    fontSize: 18,
    fontWeight: '400',
    color: '#166CB5',
    fontFamily: 'Inter',
    zIndex: 1,
  },
  submitButtonGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 100,
    opacity: 0.4702,
  },
  
  // 第五頁樣式 - 根據設計圖優化
  completionContainer: {
    flex: 1,
    backgroundColor: '#E9EFF6',
  },
  completionScrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 150,
    alignItems: 'center',
  },
  completionTitle: {
    fontSize: 32,
    fontWeight: '400',
    color: '#2B2B2B',
    textAlign: 'center',
    fontFamily: 'Inter',
    marginBottom: 24,
  },
  completionSubtitle: {
    fontSize: 18,
    fontWeight: '400',
    color: '#4A5565',
    textAlign: 'center',
    lineHeight: 29.25,
    fontFamily: 'Inter',
    marginBottom: 40,
  },
  streakCard: {
    width: '100%',
    maxWidth: 361,
    backgroundColor: 'rgba(255, 255, 255, 0.60)',
    borderRadius: 24,
    padding: 22,
    alignItems: 'center',
    marginBottom: 32,
  },
  celebrationEmoji: {
    fontSize: 50,
    textAlign: 'center',
    marginBottom: 16,
  },
  streakLabel: {
    fontSize: 14,
    fontWeight: '400',
    color: '#4A5565',
    fontFamily: 'Inter',
    marginBottom: 8,
  },
  streakDays: {
    fontSize: 24,
    fontWeight: '400',
    color: '#31C6FF',
    fontFamily: 'Inter',
  },
  // 第五頁按鈕 - 白色背景、漸層效果
  viewDiaryButton: {
    width: '100%',
    maxWidth: 361,
    height: 62,
    backgroundColor: '#FFFFFF',
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
    marginBottom: 40,
  },
  viewDiaryButtonText: {
    fontSize: 18,
    fontWeight: '400',
    color: '#166CB5',
    fontFamily: 'Inter',
    zIndex: 1,
  },
  viewDiaryButtonGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 100,
    opacity: 0.4702,
  },
  
  // 共用底部樣式
  bottomNav: {
    position: 'absolute',
    bottom: 50,
    left: 0,
    right: 0,
    height: 80,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 20,
  },
  homeButtonContainer: {
    width: 56,
    height: 56,
    alignSelf: 'center',
  },
  homeButtonBackground: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  bottomHomeIcon: {
    width: 32,
    height: 32,
    tintColor: '#31C6FE',
  },
});