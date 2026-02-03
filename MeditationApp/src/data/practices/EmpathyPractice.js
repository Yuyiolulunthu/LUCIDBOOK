// @ts-nocheck
// ==========================================
// 檔案名稱: EmpathyPractice.js
// 同理讀心術 - CBT與同理心練習
// 版本: V3.3 - 滑桿邊界修正版
// 修正內容：
// 1. 修正滑桿(CustomSlider)邊界計算：加入 paddingHorizontal 與寬度扣除，確保拉到 10 時按鈕不會跑出畫面
// 2. 保持 React.memo 優化，解決兩個滑桿互相連動與閃爍問題
// 3. 完整保留同理心練習邏輯與 ApiService 串接
// ==========================================

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  TextInput,
  Keyboard,
  TouchableWithoutFeedback,
  Animated,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  PanResponder,
  Modal,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  X,
  ArrowRight,
  ArrowLeft,
  Star,
  Heart,
  Wind,
  MessageCircle,
  ShieldCheck,
  Info,
  ChevronDown,
  ChevronUp,
} from 'lucide-react-native';
import ApiService from '../../../api';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ==================== 進度點組件 ====================
const ProgressDots = ({ currentStep, totalSteps = 6 }) => {
  return (
    <View style={styles.progressDotsContainer}>
      {[...Array(totalSteps)].map((_, index) => (
        <View
          key={index}
          style={[
            styles.dot,
            index === currentStep ? styles.dotActive : styles.dotInactive,
          ]}
        />
      ))}
    </View>
  );
};

// ==================== 優化版滑桿組件 (邊界修正 + 獨立渲染) ====================
const CustomSlider = React.memo(({ value, onValueChange, min = 0, max = 10 }) => {
  const [containerWidth, setContainerWidth] = useState(SCREEN_WIDTH - 80);
  const THUMB_SIZE = 36;
  // ⭐ 修正：滑動軌道寬度 = 容器寬度 - 按鈕大小 (預留左右空間)
  const SLIDER_WIDTH = containerWidth - THUMB_SIZE; 
  const TRACK_HEIGHT = 16;

  const position = useRef(new Animated.Value(0)).current;
  const panResponder = useRef(null);
  const valueRef = useRef(value);

  // 當容器寬度改變或初始化時，設定正確位置
  useEffect(() => {
    if (SLIDER_WIDTH > 0) {
      const initialPos = ((value - min) / (max - min)) * SLIDER_WIDTH;
      position.setValue(initialPos);
      valueRef.current = value;
    }
  }, [SLIDER_WIDTH, min, max]); 

  // 監聽外部 value 變化 (非拖動時更新)
  useEffect(() => {
    if (value !== valueRef.current && SLIDER_WIDTH > 0) {
      valueRef.current = value;
      const newPos = ((value - min) / (max - min)) * SLIDER_WIDTH;
      Animated.timing(position, {
        toValue: newPos,
        duration: 200,
        useNativeDriver: false,
      }).start();
    }
  }, [value, min, max, SLIDER_WIDTH]);

  if (!panResponder.current) {
    panResponder.current = PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        // @ts-ignore
        const currentPos = position._value; 
        position.setOffset(currentPos);
        position.setValue(0);
      },
      onPanResponderMove: (_, gestureState) => {
        // @ts-ignore
        const currentOffset = position._offset;
        let newPos = currentOffset + gestureState.dx;
        
        // 邊界檢查
        if (newPos < 0) newPos = 0;
        if (newPos > SLIDER_WIDTH) newPos = SLIDER_WIDTH;

        const rawValue = (newPos / SLIDER_WIDTH) * (max - min) + min;
        const roundedValue = Math.round(rawValue);

        // 數值改變才通知父組件，減少渲染
        if (roundedValue !== valueRef.current) {
          valueRef.current = roundedValue;
          onValueChange && onValueChange(roundedValue);
        }

        position.setValue(gestureState.dx);
      },
      onPanResponderRelease: (_, gestureState) => {
        position.flattenOffset();
        
        const finalValue = valueRef.current;
        const snapPos = ((finalValue - min) / (max - min)) * SLIDER_WIDTH;
        
        Animated.spring(position, {
          toValue: snapPos,
          damping: 15,
          stiffness: 150,
          useNativeDriver: false,
        }).start();
      },
    });
  }

  return (
    <View 
      style={[sliderStyles.container, { paddingHorizontal: THUMB_SIZE / 2 }]} // ⭐ 修正：加入內距
      onLayout={(event) => {
        const { width } = event.nativeEvent.layout;
        if (width > 0 && Math.abs(width - containerWidth) > 1) {
          setContainerWidth(width);
        }
      }}
    >
      <View style={{ position: 'relative', width: '100%', height: TRACK_HEIGHT, justifyContent: 'center' }}>
        {/* Track */}
        <View style={[sliderStyles.track, { height: TRACK_HEIGHT }]} />
        {/* Fill */}
        <Animated.View
          style={[
            sliderStyles.fill,
            {
              height: TRACK_HEIGHT,
              width: position.interpolate({
                inputRange: [0, SLIDER_WIDTH],
                outputRange: [THUMB_SIZE/2, SLIDER_WIDTH + THUMB_SIZE/2], // ⭐ 修正：填充寬度補償
                extrapolate: 'clamp',
              }),
            },
          ]}
        />
        {/* Thumb */}
        <Animated.View
          {...panResponder.current.panHandlers}
          style={[
            sliderStyles.thumb,
            {
              width: THUMB_SIZE,
              height: THUMB_SIZE,
              borderRadius: THUMB_SIZE / 2,
              left: -THUMB_SIZE / 2, // 置中校正
              transform: [{ translateX: position }],
            },
          ]}
        />
      </View>
    </View>
  );
});

// ==================== 主組件 ====================
export default function EmpathyPractice({ onBack, navigation, onHome }) {
  const [currentPage, setCurrentPage] = useState('welcome');
  const [formData, setFormData] = useState({
    situation: '', emotions: [], needs: '', limitations: '', translation: '', moodScore: 5, understandingScore: 5
  });
  
  const [showExitWarning, setShowExitWarning] = useState(false);
  const [practiceId, setPracticeId] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isTiming, setIsTiming] = useState(false);
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const iconScale = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    fadeAnim.setValue(0);
    Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }).start();
  }, [currentPage]);

  useEffect(() => {
    if (currentPage === 'intro') {
      const init = async () => {
        try {
          const res = await ApiService.startPractice('同理讀心術');
          if (res?.practiceId) setPracticeId(res.practiceId);
        } catch (e) { console.log('Init error', e); }
        setElapsedTime(0);
        setIsTiming(true);
      };
      init();
    }
  }, [currentPage]);

  useEffect(() => {
    let timer;
    if (isTiming) timer = setInterval(() => setElapsedTime(p => p + 1), 1000);
    return () => clearInterval(timer);
  }, [isTiming]);

  useEffect(() => {
    if (practiceId && !['welcome', 'final'].includes(currentPage)) {
      const saver = setInterval(() => {
        ApiService.updatePracticeProgress(practiceId, 1, 9, formData, elapsedTime);
      }, 10000);
      return () => clearInterval(saver);
    }
  }, [practiceId, formData, elapsedTime]);

  const handleComplete = async () => {
    try {
      setIsTiming(false);
      await ApiService.completePractice(practiceId, {
        practice_type: '同理讀心術',
        duration: Math.max(1, Math.ceil(elapsedTime / 60)),
        duration_seconds: elapsedTime,
        form_data: { ...formData, timestamp: Date.now() },
      });
      navigation.navigate('MainTabs', { screen: 'Daily', params: { highlightPracticeId: practiceId } });
    } catch (e) {
      console.log(e);
      navigation.navigate('MainTabs', { screen: 'Daily' });
    }
  };

  useEffect(() => {
    if (currentPage === 'final') {
      Animated.spring(iconScale, { toValue: 1, tension: 100, friction: 15, useNativeDriver: true }).start();
    } else {
      iconScale.setValue(0);
    }
  }, [currentPage]);

  // ⭐ 使用 useCallback 避免滑桿函數重新建立，解決連動感
  const handleMoodScoreChange = useCallback((v) => {
    setFormData(prev => ({ ...prev, moodScore: v }));
  }, []);

  const handleUnderstandingScoreChange = useCallback((v) => {
    setFormData(prev => ({ ...prev, understandingScore: v }));
  }, []);

  // ==================== 頁面渲染 ====================

  const renderHeader = (backPage, title = "") => (
    <View style={styles.header}>
      <TouchableOpacity onPress={() => setCurrentPage(backPage)} style={styles.navBtn}>
        <ArrowLeft size={24} color="#FF8C42" />
      </TouchableOpacity>
      {title ? <Text style={styles.headerTitle}>{title}</Text> : <View style={{width: 24}} />}
      <TouchableOpacity onPress={() => setShowExitWarning(true)} style={styles.navBtn}>
        <X size={24} color="#FF8C42" />
      </TouchableOpacity>
    </View>
  );

  // 1. 歡迎頁
  const renderWelcome = () => (
    <LinearGradient colors={['#FFF4ED', '#FFE8DB']} style={styles.fullScreen}>
      <TouchableOpacity style={styles.closeBtnAbs} onPress={() => setShowExitWarning(true)}>
        <X size={24} color="#FF8C42" />
      </TouchableOpacity>
      <View style={styles.welcomeContent}>
        <View style={styles.iconCircle}><Heart size={48} color="#FF8C42" /></View>
        <ProgressDots currentStep={0} totalSteps={3} />
        <Text style={styles.welcomeTitle}>哈囉！{"\n"}歡迎來到同理讀心術</Text>
        <Text style={styles.welcomeDesc}>
          無法清晰表達的需求，往往是人際衝突的來源。{"\n"}
          透過這個練習，我們將能解讀對方話語中的真實感受與需求。
        </Text>
        <TouchableOpacity style={styles.primaryBtn} onPress={() => setCurrentPage('intro')}>
          <LinearGradient colors={['#FF8C42', '#FF6B6B']} style={styles.btnGrad}>
            <Text style={styles.btnText}>下一頁</Text>
            <ArrowRight size={20} color="#fff" />
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );

  // 5. 還原事實
  const renderFact = () => (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{flex: 1}}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <LinearGradient colors={['#FFF4ED', '#FFE8DB']} style={styles.fullScreen}>
          {renderHeader('breathing', '還原事實')}
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <ProgressDots currentStep={0} totalSteps={5} />
            <Text style={styles.instrText}>
              回想一個最近讓你覺得{"\n"}<Text style={{color:'#FF8C42'}}>不舒服或難以理解的對話</Text>
            </Text>
            <Text style={styles.subInstr}>試著用客觀的角度描寫發生了什麼，先不要加入形容詞與評價。</Text>
            <View style={styles.inputCard}>
              <TextInput 
                multiline 
                style={styles.textArea} 
                placeholder="試著寫下這件事..." 
                placeholderTextColor="#cbd5e1"
                value={formData.situation} 
                onChangeText={(t)=>setFormData({...formData, situation:t})} 
                textAlignVertical="top" 
              />
            </View>
            <View style={styles.exampleBox}>
              <Star size={14} color="#fbbf24" fill="#fbbf24" />
              <Text style={styles.exampleText}>例如：「同事說：『我現在很忙，沒事不要一直打擾。』」</Text>
            </View>
          </ScrollView>
          <View style={styles.footer}>
            <TouchableOpacity 
              disabled={!formData.situation.trim()} 
              style={[styles.primaryBtn, !formData.situation.trim() && {opacity: 0.5}]} 
              onPress={() => setCurrentPage('emotions')}
            >
              <LinearGradient colors={['#FF8C42', '#FF6B6B']} style={styles.btnGrad}>
                <Text style={styles.btnText}>下一步</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );

  // 6. 辨識情緒
  const renderEmotions = () => {
    const cats = {
      '壓力類': ['焦慮', '緊繃', '疲憊', '不知所措', '煩躁'],
      '脆弱類': ['受傷', '委屈', '害怕', '尷尬', '丟臉'],
      '防衛類': ['生氣', '厭惡', '不耐煩', '嫉妒', '鄙視'],
      '失落類': ['失望', '灰心', '孤單', '不被理解', '無助']
    };
    return (
      <LinearGradient colors={['#FFF4ED', '#FFE8DB']} style={styles.fullScreen}>
        {renderHeader('fact', '辨識情緒')}
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <ProgressDots currentStep={1} totalSteps={5} />
          <Text style={styles.instrText}>試著從<Text style={{color:'#FF8C42'}}>對方的立場</Text>選出{"\n"}1~3 個最接近的情緒</Text>
          {Object.entries(cats).map(([name, list]) => (
            <View key={name} style={{marginTop: 20}}>
              <Text style={styles.catTitle}>{name}</Text>
              <View style={styles.chipGrid}>{list.map(emo => (
                <TouchableOpacity 
                  key={emo} 
                  style={[styles.chip, formData.emotions.includes(emo) && styles.chipActive]} 
                  onPress={() => {
                    const next = formData.emotions.includes(emo) 
                      ? formData.emotions.filter(e => e !== emo) 
                      : [...formData.emotions, emo].slice(0,3);
                    setFormData({...formData, emotions: next});
                  }}
                >
                  <Text style={[styles.chipText, formData.emotions.includes(emo) && styles.chipTextActive]}>{emo}</Text>
                </TouchableOpacity>
              ))}</View>
            </View>
          ))}
        </ScrollView>
        <View style={styles.footer}>
          <TouchableOpacity style={styles.primaryBtn} onPress={() => setCurrentPage('needs')}>
            <LinearGradient colors={['#FF8C42', '#FF6B6B']} style={styles.btnGrad}>
              <Text style={styles.btnText}>下一步</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    );
  };

  // 9. 同理翻譯
  const renderTranslation = () => (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{flex: 1}}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <LinearGradient colors={['#FFF4ED', '#FFE8DB']} style={styles.fullScreen}>
          {renderHeader('limitations', '同理翻譯')}
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <ProgressDots currentStep={4} totalSteps={5} />
            <Text style={styles.instrText}>試著把對方的言行{"\n"}翻譯成感受與需求</Text>
            <View style={styles.quoteBox}>
              <Info size={16} color="#FF8C42" />
              <View style={{flex:1}}>
                <Text style={styles.quoteLabel}>對方的原話：</Text>
                <Text style={styles.quoteText}>「{formData.situation || '...' }」</Text>
              </View>
            </View>
            <View style={styles.inputCard}>
              <TextInput 
                multiline 
                style={styles.textArea} 
                placeholder="我的同理翻譯是..." 
                placeholderTextColor="#cbd5e1"
                value={formData.translation} 
                onChangeText={(t)=>setFormData({...formData, translation:t})} 
                textAlignVertical="top" 
              />
            </View>
            <Text style={styles.formulaHint}>✨ 翻譯公式 (點擊套用)</Text>
            <TouchableOpacity 
              style={styles.formulaCard} 
              onPress={() => setFormData({...formData, translation: `他當時可能感到${formData.emotions[0] || '(情緒)'}，是因為他在意(需求)。`})}
            >
              <Text style={styles.formulaType}>因果句型</Text>
              <Text style={styles.formulaMain}>「他當時可能感到(情緒)，是因為他在意(需求)。」</Text>
            </TouchableOpacity>
          </ScrollView>
          <View style={styles.footer}>
            <TouchableOpacity style={styles.primaryBtn} onPress={() => setCurrentPage('assessment')}>
              <LinearGradient colors={['#FF8C42', '#FF6B6B']} style={styles.btnGrad}>
                <Text style={styles.btnText}>下一步</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );

  // 11. 評分頁
  const renderAssessment = () => (
    <LinearGradient colors={['#FFF4ED', '#FFE8DB']} style={styles.fullScreen}>
      {renderHeader('translation', '')}
      <View style={styles.centerContent}>
        <View style={styles.assessmentCard}>
          <Text style={styles.assessTitle}>練習後的狀態核對</Text>
          
          {/* 滑桿 1 */}
          <Text style={styles.sliderLabel}>原本情緒張力的改善程度？</Text>
          <View style={styles.scoreRow}>
            <Text style={styles.scoreNum}>{formData.moodScore}</Text>
            <Text style={styles.scoreMax}>/10</Text>
          </View>
          <CustomSlider 
            value={formData.moodScore} 
            onValueChange={handleMoodScoreChange} 
          />
          <View style={styles.sliderLabels}>
            <Text style={styles.sliderLabelSmall}>完全沒有</Text>
            <Text style={styles.sliderLabelSmall}>顯著改善</Text>
          </View>

          <View style={{height: 32}} />

          {/* 滑桿 2 */}
          <Text style={styles.sliderLabel}>對對方與情境的了解程度？</Text>
          <View style={styles.scoreRow}>
            <Text style={styles.scoreNum}>{formData.understandingScore}</Text>
            <Text style={styles.scoreMax}>/10</Text>
          </View>
          <CustomSlider 
            value={formData.understandingScore} 
            onValueChange={handleUnderstandingScoreChange} 
          />
          <View style={styles.sliderLabels}>
            <Text style={styles.sliderLabelSmall}>仍不理解</Text>
            <Text style={styles.sliderLabelSmall}>非常理解</Text>
          </View>

          <TouchableOpacity style={[styles.primaryBtn, {marginTop: 32}]} onPress={() => setCurrentPage('summary')}>
            <LinearGradient colors={['#FF8C42', '#FF6B6B']} style={styles.btnGrad}>
              <Text style={styles.btnText}>查看總結</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </LinearGradient>
  );

  // 12. 記錄統整
  const renderSummary = () => (
    <LinearGradient colors={['#FFF4ED', '#FFE8DB']} style={styles.fullScreen}>
      {renderHeader('assessment', '記錄統整')}
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {[
          {l:'還原事實', v:formData.situation},
          {l:'辨識情緒', v:formData.emotions.join('、')},
          {l:'理解需求', v:formData.needs},
          {l:'考量限制', v:formData.limitations},
          {l:'同理翻譯', v:formData.translation}
        ].map((x,i)=>(
          <View key={i} style={styles.sumCard}>
            <Text style={styles.sumL}>{x.l}</Text>
            <Text style={styles.sumV}>{x.v || '無紀錄'}</Text>
          </View>
        ))}
      </ScrollView>
      <View style={styles.footer}>
        <TouchableOpacity style={styles.primaryBtn} onPress={() => setCurrentPage('recommendations')}>
          <LinearGradient colors={['#FF8C42', '#FF6B6B']} style={styles.btnGrad}>
            <Text style={styles.btnText}>下一步</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );

  // 14. 完成頁
  const renderFinal = () => (
    <LinearGradient colors={['#FFF4ED', '#FFE8DB']} style={styles.fullScreen}>
      <View style={styles.centerContent}>
        <Animated.View style={[styles.finalIcon, {transform:[{scale: iconScale}]}]}>
          <View style={styles.iconCircle}>
            <Heart size={48} color="#FF8C42" />
            <View style={styles.starBadge}><Star size={16} color="#fff" fill="#fff" /></View>
          </View>
        </Animated.View>
        <Text style={styles.finalTitle}>你做得很好</Text>
        <Text style={styles.finalDesc}>
          每一次練習都讓你對溝通情境有更強的同理，{"\n"}也讓你具備選擇更適當溝通策略的能力。
        </Text>
        <TouchableOpacity style={[styles.primaryBtn, {marginTop: 40}]} onPress={handleComplete}>
          <LinearGradient colors={['#FF8C42', '#FF6B6B']} style={styles.btnGrad}>
            <Text style={styles.btnText}>完成練習</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );

  return (
    <Animated.View style={{flex: 1, opacity: fadeAnim}}>
      <StatusBar barStyle="dark-content" />
      {currentPage === 'welcome' && renderWelcome()}
      {currentPage === 'intro' && <IntroPage onNext={()=>setCurrentPage('breathing')} onBack={()=>setCurrentPage('welcome')} />}
      {currentPage === 'breathing' && <BreathingPage onNext={()=>setCurrentPage('fact')} onBack={()=>setCurrentPage('intro')} />}
      {currentPage === 'fact' && renderFact()}
      {currentPage === 'emotions' && renderEmotions()}
      {currentPage === 'needs' && <GenericInputPage title="理解需求" step={2} hint="對方真正在意的是什麼需求？" value={formData.needs} onChange={(v)=>setFormData({...formData, needs:v})} onNext={()=>setCurrentPage('limitations')} onBack={()=>setCurrentPage('emotions')} />}
      {currentPage === 'limitations' && <GenericInputPage title="考量限制" step={3} hint="對方的表達可能受壓力影響嗎？" value={formData.limitations} onChange={(v)=>setFormData({...formData, limitations:v})} onNext={()=>setCurrentPage('translation')} onBack={()=>setCurrentPage('needs')} />}
      {currentPage === 'translation' && renderTranslation()}
      {currentPage === 'assessment' && renderAssessment()}
      {currentPage === 'summary' && renderSummary()}
      {currentPage === 'recommendations' && <RecPage onNext={()=>setCurrentPage('final')} onBack={()=>setCurrentPage('summary')} />}
      {currentPage === 'final' && renderFinal()}
      
      <ExitWarningModal visible={showExitWarning} onCancel={()=>setShowExitWarning(false)} onConfirm={onHome} />
    </Animated.View>
  );
}

// ==================== 子頁面組件 ====================
const IntroPage = ({onNext, onBack}) => (
  <LinearGradient colors={['#FFF4ED', '#FFE8DB']} style={styles.fullScreen}>
    <View style={styles.header}>
       <TouchableOpacity onPress={onBack} style={styles.navBtn}><ArrowLeft size={24} color="#FF8C42" /></TouchableOpacity>
    </View>
    <View style={styles.centerContent}>
      <View style={styles.iconCircle}><Heart size={48} color="#FF8C42" /></View>
      <ProgressDots currentStep={1} totalSteps={3} />
      <Text style={styles.welcomeTitle}>接下來我們一起{"\n"}走過這些練習步驟</Text>
      <View style={styles.stepList}>
        <Text style={styles.stepHighlight}>還原事實 • 辨識情緒 • 理解需求{"\n"}考量限制 • 同理翻譯</Text>
      </View>
      <TouchableOpacity style={styles.primaryBtn} onPress={onNext}><LinearGradient colors={['#FF8C42', '#FF6B6B']} style={styles.btnGrad}><Text style={styles.btnText}>下一頁</Text></LinearGradient></TouchableOpacity>
    </View>
  </LinearGradient>
);

const BreathingPage = ({onNext, onBack}) => (
  <LinearGradient colors={['#FFF4ED', '#FFE8DB']} style={styles.fullScreen}>
    <View style={styles.header}>
       <TouchableOpacity onPress={onBack} style={styles.navBtn}><ArrowLeft size={24} color="#FF8C42" /></TouchableOpacity>
    </View>
    <View style={styles.centerContent}>
      <View style={[styles.iconCircle, {backgroundColor:'rgba(255,140,66,0.1)'}]}><Wind size={48} color="#FF8C42" /></View>
      <ProgressDots currentStep={2} totalSteps={3} />
      <Text style={styles.welcomeTitle}>深呼吸 放鬆</Text>
      <Text style={styles.welcomeDesc}>吸氣4秒，閉氣4秒，呼氣6秒。{"\n"}讓理性腦回歸主宰。</Text>
      <TouchableOpacity style={styles.primaryBtn} onPress={onNext}><LinearGradient colors={['#FF8C42', '#FF6B6B']} style={styles.btnGrad}><Text style={styles.btnText}>開始練習</Text></LinearGradient></TouchableOpacity>
    </View>
  </LinearGradient>
);

const GenericInputPage = ({title, hint, value, onChange, onNext, onBack, step}) => (
  <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{flex: 1}}>
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <LinearGradient colors={['#FFF4ED', '#FFE8DB']} style={styles.fullScreen}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.navBtn}><ArrowLeft size={24} color="#FF8C42" /></TouchableOpacity>
          <Text style={styles.headerTitle}>{title}</Text>
          <View style={{width:40}} />
        </View>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <ProgressDots currentStep={step} totalSteps={5} />
          <Text style={styles.instrText}>{hint}</Text>
          <View style={styles.inputCard}><TextInput multiline style={styles.textArea} value={value} onChangeText={onChange} placeholder="寫下你的觀察..." placeholderTextColor="#cbd5e1" textAlignVertical="top" /></View>
        </ScrollView>
        <View style={styles.footer}><TouchableOpacity style={styles.primaryBtn} onPress={onNext}><LinearGradient colors={['#FF8C42', '#FF6B6B']} style={styles.btnGrad}><Text style={styles.btnText}>下一步</Text></LinearGradient></TouchableOpacity></View>
      </LinearGradient>
    </TouchableWithoutFeedback>
  </KeyboardAvoidingView>
);

const RecPage = ({onNext, onBack}) => (
  <LinearGradient colors={['#FFF4ED', '#FFE8DB']} style={styles.fullScreen}>
    <View style={styles.header}>
      <TouchableOpacity onPress={onBack} style={styles.navBtn}><ArrowLeft size={24} color="#FF8C42" /></TouchableOpacity>
      <Text style={styles.headerTitle}>推薦建議</Text>
      <View style={{width: 40}} />
    </View>
    <ScrollView contentContainerStyle={styles.scrollContent}>
      <Text style={styles.pageTitle}>接下來，你可以...</Text>
      <View style={styles.recItem}><MessageCircle color="#FF8C42" /><View style={{flex:1}}><Text style={styles.recT}>找人聊聊</Text><Text style={styles.recD}>詢問對方當天是否壓力很大？</Text></View></View>
      <View style={styles.recItem}><ShieldCheck color="#FF8C42" /><View style={{flex:1}}><Text style={styles.recT}>設定界線</Text><Text style={styles.recD}>試著告訴他：「我理解你當下很忙，但你那天說話的語氣讓我有點難過。」</Text></View></View>
      <Image source={{uri:'https://curiouscreate.com/api/asserts/image/InternalConflictPractice_image.jpg'}} style={styles.recImg} />
    </ScrollView>
    <View style={styles.footer}><TouchableOpacity style={styles.primaryBtn} onPress={onNext}><LinearGradient colors={['#FF8C42', '#FF6B6B']} style={styles.btnGrad}><Text style={styles.btnText}>完成練習</Text></LinearGradient></TouchableOpacity></View>
  </LinearGradient>
);

const ExitWarningModal = ({visible, onCancel, onConfirm}) => (
  <Modal transparent visible={visible} animationType="fade">
    <View style={styles.modalBg}><View style={styles.modalBox}>
      <Text style={styles.modalT}>確定要退出練習嗎</Text>
      <Text style={styles.modalM}>本次練習將不會被記錄</Text>
      <TouchableOpacity style={styles.modalExit} onPress={onConfirm}><Text style={{color:'#DC2626', fontWeight:'700'}}>確定退出</Text></TouchableOpacity>
      <TouchableOpacity style={styles.modalStay} onPress={onCancel}><Text style={{fontWeight:'700'}}>繼續練習</Text></TouchableOpacity>
    </View></View>
  </Modal>
);

// ==================== 樣式定義 (CSS) ====================
const styles = StyleSheet.create({
  fullScreen: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems:'center', paddingTop: 60, paddingHorizontal: 20, zIndex:10 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#1e293b' },
  navBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: {width:0,height:2}, shadowOpacity:0.05, elevation:2 },
  
  centerContent: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40 },
  welcomeContent: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 32 },
  
  iconCircle: { width: 96, height: 96, borderRadius: 48, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center', elevation: 8, shadowColor: '#FF8C42', shadowOffset: {width:0,height:4}, shadowOpacity:0.2, marginBottom: 24 },
  welcomeTitle: { fontSize: 24, fontWeight: '700', color: '#1e293b', textAlign: 'center', marginBottom: 16 },
  welcomeDesc: { fontSize: 15, color: '#64748b', textAlign: 'center', lineHeight: 24, marginBottom: 32 },
  
  primaryBtn: { width: '100%', height: 56, borderRadius: 28, overflow: 'hidden', shadowColor: '#FF8C42', shadowOffset: {width:0,height:4}, shadowOpacity:0.3, elevation: 4 },
  btnGrad: { flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8 },
  btnText: { color: '#fff', fontSize: 17, fontWeight: '700' },
  
  scrollContent: { paddingHorizontal: 24, paddingTop: 10, paddingBottom: 140 },
  pageTitle: { fontSize: 22, fontWeight: '700', color: '#1e293b', textAlign: 'center', marginBottom: 20 },
  instrText: { fontSize: 16, fontWeight: '700', color:'#1e293b', textAlign: 'center', marginBottom: 12, lineHeight: 24 },
  subInstr: { fontSize: 14, color: '#64748b', textAlign: 'center', marginBottom: 20 },
  
  inputCard: { backgroundColor: '#fff', borderRadius: 20, padding: 20, minHeight: 180, elevation: 3, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, shadowOffset: {width:0, height:4} },
  textArea: { fontSize: 16, color: '#334155', lineHeight: 24, flex:1 },
  
  exampleBox: { flexDirection: 'row', gap: 8, marginTop: 16, paddingHorizontal: 4 },
  exampleText: { flex: 1, fontSize: 13, color: '#64748b', lineHeight: 18 },
  
  footer: { position: 'absolute', bottom: 40, left: 0, right: 0, paddingHorizontal: 24 },
  closeBtnAbs: { position: 'absolute', top: 60, right: 20, width: 40, height: 40, backgroundColor: '#fff', borderRadius: 20, justifyContent: 'center', alignItems: 'center', zIndex: 10 },
  
  progressDotsContainer: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: 24 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  dotActive: { backgroundColor: '#FF8C42' },
  dotInactive: { backgroundColor: '#E5E7EB' },
  
  chipGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  chip: { backgroundColor: '#fff', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, borderWidth: 1.5, borderColor: '#e2e8f0' },
  chipActive: { backgroundColor: '#FF8C42', borderColor: '#FF8C42' },
  chipText: { color: '#64748b', fontSize: 14 },
  chipTextActive: { color: '#fff', fontWeight: '700' },
  catTitle: { fontSize: 14, color: '#94a3b8', marginBottom: 10, fontWeight:'600' },
  
  quoteBox: { flexDirection:'row', gap:10, backgroundColor: 'rgba(255,140,66,0.05)', padding: 16, borderRadius: 12, marginBottom: 16, borderWidth: 1, borderColor: '#FFE8DB' },
  quoteLabel: { fontSize: 12, color: '#FF8C42', fontWeight: '700' },
  quoteText: { fontSize: 14, color: '#64748b', marginTop: 4, fontStyle: 'italic' },
  
  formulaHint: { fontSize: 14, fontWeight: '700', color: '#FF8C42', marginTop: 24, marginBottom: 12 },
  formulaCard: { backgroundColor: '#fff', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#FFE8DB', shadowColor: '#FF8C42', shadowOpacity: 0.1, elevation: 2 },
  formulaType: { fontSize: 12, fontWeight: '800', color: '#FF8C42' },
  formulaMain: { fontSize: 14, color: '#64748b', marginTop: 6 },
  
  assessmentCard: { backgroundColor: '#fff', borderRadius: 28, padding: 28, width: '100%', elevation: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.1, shadowRadius: 20 },
  assessTitle: { fontSize: 20, fontWeight: '700', textAlign: 'center', marginBottom: 30, color:'#1e293b' },
  sliderLabel: { fontSize: 15, fontWeight: '700', color: '#334155', marginBottom: 8 },
  scoreRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'baseline', marginBottom: 10 },
  scoreNum: { fontSize: 48, fontWeight: '800', color: '#FF6B35' },
  scoreMax: { fontSize: 18, color: '#94a3b8', marginLeft: 4 },
  sliderLabels: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  sliderLabelSmall: { fontSize: 12, color: '#94a3b8' },

  sumCard: { backgroundColor: '#fff', padding: 16, borderRadius: 16, marginBottom: 12, elevation: 2 },
  sumL: { fontSize: 13, color: '#94a3b8', marginBottom: 4, fontWeight:'600' },
  sumV: { fontSize: 15, color: '#334155', lineHeight: 22 },
  
  recItem: { flexDirection: 'row', gap: 12, backgroundColor: '#fff', padding: 16, borderRadius: 16, marginBottom: 12, elevation: 2 },
  recT: { fontSize: 16, fontWeight: '700', color:'#1e293b' },
  recD: { fontSize: 14, color: '#64748b', marginTop: 4 },
  recImg: { width: '100%', height: 200, borderRadius: 16, marginTop: 12 },
  
  modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 32 },
  modalBox: { backgroundColor: '#fff', borderRadius: 24, padding: 32, alignItems: 'center' },
  modalT: { fontSize: 20, fontWeight: '700', marginBottom: 10 },
  modalM: { color: '#64748b', marginBottom: 30 },
  modalExit: { backgroundColor: '#FFE8E8', width: '100%', height: 52, borderRadius: 26, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  modalStay: { width: '100%', height: 52, borderRadius: 26, justifyContent: 'center', alignItems: 'center', borderWidth: 1.5, borderColor: '#e2e8f0' },
  
  stepHighlight: { fontSize: 15, fontWeight: '600', color: '#FF8C42', textAlign: 'center', lineHeight: 28, marginBottom: 30 },
  stepList: { marginBottom: 32 },
  finalIcon: { marginBottom: 24 },
  finalTitle: { fontSize: 24, fontWeight: '700', color: '#1e293b', marginBottom: 16 },
  finalDesc: { fontSize: 15, color: '#64748b', textAlign: 'center', lineHeight: 24, paddingHorizontal: 10 },
  starBadge: { position:'absolute', top:-6, right:-6, backgroundColor:'#FF8C42', width:32, height:32, borderRadius:16, justifyContent:'center', alignItems:'center', borderWidth:3, borderColor:'#fff' },
});

// ==================== 滑桿專用樣式 ====================
const sliderStyles = StyleSheet.create({
  container: { width: '100%', height: 40, justifyContent: 'center', marginVertical: 8 },
  track: { position: 'absolute', left: 0, right: 0, backgroundColor: '#F5E6DC', borderRadius: 8 },
  fill: { position: 'absolute', left: 0, backgroundColor: '#FF8C42', borderRadius: 8 },
  thumb: { 
    position: 'absolute', 
    backgroundColor: '#FF6B35', 
    borderWidth: 4, 
    borderColor: '#FFFFFF', 
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 6
  },
});