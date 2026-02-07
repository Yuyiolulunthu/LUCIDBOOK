// @ts-nocheck
// ==========================================
// 檔案名稱: EmpathyPractice.js
// 同理讀心術 - CBT與同理心練習
// 版本: V4.0 - 全面修正版
// 修正內容：
// 1. [Fix] 考量限制頁P8 新增「跳過」按鈕（僅P8可跳過）
// 2. [Fix] 按【確定退出】無法退出 — 加入 fallback 邏輯
// 3. [Fix] 理解需求頁P7 書寫靈感標籤可點擊插入文字
// 4. [Fix] 順序調整：先紀錄統整(日記) → 再狀態核對(心情拉桿)
// 5. [Fix] 點點數量(頁數)修正：引導頁4點、練習頁5點
// 6. [Fix] Android icon 切痕問題 — needsOffscreenAlphaCompositing
// 7. [Fix] 前三頁愛心圓圈與三個點固定在相同高度
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
} from 'lucide-react-native';
import ApiService from '../../../api';

// ==================== 共用 Header ====================
const Header = ({ onBack, title, onExit }) => (
  <View style={styles.header}>
    <TouchableOpacity onPress={onBack} style={styles.navBtn}>
      <ArrowLeft size={24} color="#FF8C42" />
    </TouchableOpacity>
    {title ? <Text style={styles.headerTitle}>{title}</Text> : <View style={{ width: 24 }} />}
    {onExit ? (
      <TouchableOpacity onPress={onExit} style={styles.navBtn}>
        <X size={24} color="#FF8C42" />
      </TouchableOpacity>
    ) : (
      <View style={{ width: 40 }} />
    )}
  </View>
);

const ProgressDots = ({ currentStep, totalSteps = 5 }) => (
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

// ==================== 修正版 CustomSlider ====================
const CustomSlider = ({ value, onValueChange, min = 0, max = 10 }) => {
  const [containerWidth, setContainerWidth] = useState(Dimensions.get('window').width - 80);
  const SLIDER_WIDTH = containerWidth;
  const THUMB_SIZE = 36;
  const TRACK_HEIGHT = 16;

  const position = useRef(
    new Animated.Value(((value - min) / (max - min)) * SLIDER_WIDTH)
  ).current;

  const isDragging = useRef(false);
  const startPosition = useRef(0);
  const onValueChangeRef = useRef(onValueChange);
  const valueRef = useRef(value);

  useEffect(() => { onValueChangeRef.current = onValueChange; }, [onValueChange]);
  useEffect(() => { valueRef.current = value; }, [value]);

  useEffect(() => {
    if (!isDragging.current) {
      Animated.timing(position, {
        toValue: ((value - min) / (max - min)) * SLIDER_WIDTH,
        duration: 200,
        useNativeDriver: false,
      }).start();
    }
  }, [value, min, max, SLIDER_WIDTH]);

  const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, n));
  const posToValue = (pos) => Math.round((pos / SLIDER_WIDTH) * (max - min) + min);
  const valueToPos = (v) => ((v - min) / (max - min)) * SLIDER_WIDTH;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        isDragging.current = true;
        // @ts-ignore
        startPosition.current = position._value;
      },
      onPanResponderMove: (_, gestureState) => {
        let newPos = startPosition.current + gestureState.dx;
        newPos = clamp(newPos, 0, SLIDER_WIDTH);
        position.setValue(newPos);
        const newValue = posToValue(newPos);
        if (newValue !== valueRef.current && onValueChangeRef.current) {
          onValueChangeRef.current(newValue);
        }
      },
      onPanResponderRelease: () => {
        const snapPos = valueToPos(valueRef.current);
        Animated.spring(position, {
          toValue: snapPos,
          damping: 15,
          stiffness: 150,
          useNativeDriver: false,
        }).start(() => {
          isDragging.current = false;
        });
      },
      onPanResponderTerminate: () => {
        const snapPos = valueToPos(valueRef.current);
        Animated.spring(position, {
          toValue: snapPos,
          damping: 15,
          stiffness: 150,
          useNativeDriver: false,
        }).start(() => {
          isDragging.current = false;
        });
      },
    })
  ).current;

  return (
    <View
      style={sliderStyles.container}
      onLayout={(event) => {
        const { width } = event.nativeEvent.layout;
        if (width > 0 && Math.abs(width - containerWidth) > 1) {
          setContainerWidth(width);
        }
      }}
    >
      <View style={[sliderStyles.track, { height: TRACK_HEIGHT }]} />
      <Animated.View
        style={[
          sliderStyles.fill,
          {
            height: TRACK_HEIGHT,
            width: position.interpolate({
              inputRange: [0, SLIDER_WIDTH],
              outputRange: [THUMB_SIZE / 2, SLIDER_WIDTH + THUMB_SIZE / 2],
              extrapolate: 'clamp',
            }),
          },
        ]}
      />
      <Animated.View
        {...panResponder.panHandlers}
        style={[
          sliderStyles.thumb,
          {
            width: THUMB_SIZE,
            height: THUMB_SIZE,
            borderRadius: THUMB_SIZE / 2,
            left: -THUMB_SIZE / 2,
            transform: [
              {
                translateX: position.interpolate({
                  inputRange: [0, SLIDER_WIDTH],
                  outputRange: [0, SLIDER_WIDTH],
                  extrapolate: 'clamp',
                }),
              },
            ],
          },
        ]}
      />
    </View>
  );
};

// ==================== 頁面組件 ====================

const FactStep = ({ data, onChange, onNext, onBack, onExit }) => (
  <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{flex: 1}}>
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <LinearGradient colors={['#FFF4ED', '#FFE8DB']} style={styles.fullScreen}>
        <Header onBack={onBack} title="還原事實" onExit={onExit} />
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <ProgressDots currentStep={0} totalSteps={5} />
          <Text style={styles.instrText}>
            回想一個最近讓你覺得{"\n"}<Text style={{color:'#FF8C42'}}>不舒服或難以理解的對話</Text>
          </Text>
          <Text style={styles.subInstr}>
            試著用<Text style={{color: '#FF8C42', fontWeight: '700'}}>客觀的角度</Text>描寫發生了什麼事，{"\n"}
            先不要加入形容詞與評價。
          </Text>
          <View style={styles.inputCard}>
            <TextInput 
              multiline 
              style={styles.textArea} 
              placeholder="試著寫下這件事..." 
              placeholderTextColor="#cbd5e1"
              value={data} 
              onChangeText={onChange} 
              textAlignVertical="top" 
            />
          </View>
          <View style={styles.exampleBox}>
            <Star size={14} color="#fbbf24" fill="#fbbf24" />
            <Text style={styles.exampleText}>
              例如：「同事說：『我現在很忙，沒事不要一直打擾。』」
            </Text>
          </View>
        </ScrollView>
        <View style={styles.footer}>
          <TouchableOpacity 
            disabled={!data.trim()} 
            style={[styles.primaryBtn, !data.trim() && {opacity: 0.5}]} 
            onPress={onNext}
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

const EmotionsStep = ({ selectedEmotions, onToggle, onNext, onBack, onExit }) => {
  const cats = {
    '壓力類': ['焦慮', '緊繃', '疲憊', '不知所措', '煩躁'],
    '脆弱類': ['受傷', '委屈', '害怕', '尷尬', '丟臉'],
    '防衛類': ['生氣', '厭惡', '不耐煩', '嫉妒', '鄙視'],
    '失落類': ['失望', '灰心', '孤單', '不被理解', '無助']
  };

  return (
    <LinearGradient colors={['#FFF4ED', '#FFE8DB']} style={styles.fullScreen}>
      <Header onBack={onBack} title="辨識情緒" onExit={onExit} />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <ProgressDots currentStep={1} totalSteps={5} />
        <Text style={styles.instrText}>
          試著從<Text style={{color:'#FF8C42', fontWeight: '700'}}>對方的立場</Text>{"\n"}
          選出 1~3 個最接近的情緒
        </Text>
        {Object.entries(cats).map(([name, list]) => (
          <View key={name} style={{marginTop: 20}}>
            <Text style={styles.catTitle}>{name}</Text>
            <View style={styles.chipGrid}>{list.map(emo => (
              <TouchableOpacity 
                key={emo} 
                style={[styles.chip, selectedEmotions.includes(emo) && styles.chipActive]} 
                onPress={() => onToggle(emo)}
              >
                <Text style={[styles.chipText, selectedEmotions.includes(emo) && styles.chipTextActive]}>{emo}</Text>
              </TouchableOpacity>
            ))}</View>
          </View>
        ))}
      </ScrollView>
      <View style={styles.footer}>
        <TouchableOpacity style={styles.primaryBtn} onPress={onNext}>
          <LinearGradient colors={['#FF8C42', '#FF6B6B']} style={styles.btnGrad}>
            <Text style={styles.btnText}>下一步</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
};

const TranslationStep = ({ situation, emotion, translation, onChange, onNext, onBack, onExit }) => {
  const applyFormula = () => {
    const emoText = emotion || '(情緒)';
    onChange(`他當時可能感到${emoText}，是因為他在意(需求)。`);
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{flex: 1}}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <LinearGradient colors={['#FFF4ED', '#FFE8DB']} style={styles.fullScreen}>
          <Header onBack={onBack} title="同理翻譯" onExit={onExit} />
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <ProgressDots currentStep={4} totalSteps={5} />
            <Text style={styles.instrText}>試著把對方的言行翻譯成感受與需求</Text>
            <Text style={styles.subInstr}>
              試著用『他/她』告訴句子的開頭{"\n"}
              這能幫助你保持客觀距離
            </Text>
            <Text style={styles.subInstr}>
              即便你不同意他的表達方式{"\n"}
              你也可以試著理解他的「感受」與其的
            </Text>
            <View style={styles.quoteBox}>
              <Info size={16} color="#FF8C42" />
              <View style={{flex:1}}>
                <Text style={styles.quoteLabel}>對方的原話：</Text>
                <Text style={styles.quoteText}>「{situation || '...' }」</Text>
              </View>
            </View>
            <View style={styles.inputCard}>
              <TextInput 
                multiline 
                style={styles.textArea} 
                placeholder="我的同理翻譯是..." 
                placeholderTextColor="#cbd5e1"
                value={translation} 
                onChangeText={onChange} 
                textAlignVertical="top" 
              />
            </View>
            <Text style={styles.formulaHint}>✨ 翻譯公式 (點擊套用)</Text>
            <TouchableOpacity style={styles.formulaCard} onPress={applyFormula}>
              <Text style={styles.formulaType}>因果句型</Text>
              <Text style={styles.formulaMain}>「他當時可能感到(情緒)，是因為他在意(需求)。」</Text>
            </TouchableOpacity>
          </ScrollView>
          <View style={styles.footer}>
            <TouchableOpacity style={styles.primaryBtn} onPress={onNext}>
              <LinearGradient colors={['#FF8C42', '#FF6B6B']} style={styles.btnGrad}>
                <Text style={styles.btnText}>下一步</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

// 評分頁面
const AssessmentStep = ({ moodScore, onMoodChange, understandingScore, onUndChange, onNext, onBack, onExit }) => (
  <LinearGradient colors={['#FFF4ED', '#FFE8DB']} style={styles.fullScreen}>
    <Header onBack={onBack} onExit={onExit} />
    <View style={styles.centerContent}>
      <View style={styles.assessmentCard}>
        <Text style={styles.assessTitle}>練習後的狀態核對</Text>
        
        <Text style={styles.sliderLabel}>原本情緒張力的改善程度？</Text>
        <View style={styles.scoreRow}>
          <Text style={styles.scoreNum}>{moodScore}</Text>
          <Text style={styles.scoreMax}>/10</Text>
        </View>
        <CustomSlider value={moodScore} onValueChange={onMoodChange} />
        <View style={styles.sliderLabels}>
          <Text style={styles.sliderLabelSmall}>完全沒有</Text>
          <Text style={styles.sliderLabelSmall}>顯著改善</Text>
        </View>

        <View style={{height: 32}} />

        <Text style={styles.sliderLabel}>對對方與情境的了解程度？</Text>
        <View style={styles.scoreRow}>
          <Text style={styles.scoreNum}>{understandingScore}</Text>
          <Text style={styles.scoreMax}>/10</Text>
        </View>
        <CustomSlider value={understandingScore} onValueChange={onUndChange} />
        <View style={styles.sliderLabels}>
          <Text style={styles.sliderLabelSmall}>仍不理解</Text>
          <Text style={styles.sliderLabelSmall}>非常理解</Text>
        </View>

        <TouchableOpacity style={[styles.primaryBtn, {marginTop: 32}]} onPress={onNext}>
          <LinearGradient colors={['#FF8C42', '#FF6B6B']} style={styles.btnGrad}>
            <Text style={styles.btnText}>下一步</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  </LinearGradient>
);

// [Fix #6] 紀錄統整 → 下一步文字改為「下一步」（接狀態核對）
const SummaryStep = ({ formData, onNext, onBack, onExit }) => (
  <LinearGradient colors={['#FFF4ED', '#FFE8DB']} style={styles.fullScreen}>
    <Header onBack={onBack} title="記錄統整" onExit={onExit} />
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
      <TouchableOpacity style={styles.primaryBtn} onPress={onNext}>
        <LinearGradient colors={['#FF8C42', '#FF6B6B']} style={styles.btnGrad}>
          <Text style={styles.btnText}>下一步</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  </LinearGradient>
);

// ==================== 新增/修正頁面 ====================

// [Fix #9] 前三頁共用的固定高度佈局 — icon 和 dots 固定位置
const IntroLayout = ({ children, iconComponent, currentStep, totalSteps, onExit, showCloseBtn }) => (
  <LinearGradient colors={['#FFF4ED', '#FFE8DB']} style={styles.fullScreen}>
    {showCloseBtn && (
      <TouchableOpacity style={styles.closeBtnAbs} onPress={onExit}>
        <X size={24} color="#FF8C42" />
      </TouchableOpacity>
    )}
    <View style={styles.fullScreen}>
      {/* 固定高度的 icon + dots 區域 */}
      <View style={styles.introFixedTop}>
        <View
          style={styles.iconCircle}
          needsOffscreenAlphaCompositing={Platform.OS === 'android'}
          renderToHardwareTextureAndroid={Platform.OS === 'android'}
        >
          {iconComponent}
        </View>
        <ProgressDots currentStep={currentStep} totalSteps={totalSteps} />
      </View>
      {/* 彈性內容區 */}
      <View style={styles.introContentArea}>
        {children}
      </View>
    </View>
  </LinearGradient>
);

const SituationRecallPage = ({ onNext, onBack, onExit }) => (
  <LinearGradient colors={['#FFF4ED', '#FFE8DB']} style={styles.fullScreen}>
    <Header onBack={onBack} onExit={onExit} />
    <View style={styles.fullScreen}>
      <View style={styles.introFixedTopWithHeader}>
        <View
          style={[styles.iconCircle, {backgroundColor:'rgba(255,140,66,0.1)'}]}
          needsOffscreenAlphaCompositing={Platform.OS === 'android'}
          renderToHardwareTextureAndroid={Platform.OS === 'android'}
        >
          <Heart size={48} color="#FF8C42" />
        </View>
        <ProgressDots currentStep={2} totalSteps={3} />
      </View>
      <View style={styles.introContentArea}>
        <Text style={styles.welcomeTitle}>情境回想</Text>
        <Text style={styles.welcomeDesc}>
          請先想出一個最近讓你感到{"\n"}
          <Text style={{color: '#FF8C42', fontWeight: '700'}}>『不舒服或難以理解』</Text>
          {"\n"}的互動場景
        </Text>
        <TouchableOpacity style={styles.primaryBtn} onPress={onNext}>
          <LinearGradient colors={['#FF8C42', '#FF6B6B']} style={styles.btnGrad}>
            <Text style={styles.btnText}>下一頁</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  </LinearGradient>
);

const EncouragementPage = ({ onNext, onBack, onExit }) => (
  <LinearGradient colors={['#FFF4ED', '#FFE8DB']} style={styles.fullScreen}>
    <Header onBack={onBack} onExit={onExit} />
    <View style={styles.centerContent}>
      <View
        style={styles.iconCircle}
        needsOffscreenAlphaCompositing={Platform.OS === 'android'}
        renderToHardwareTextureAndroid={Platform.OS === 'android'}
      >
        <Heart size={48} color="#FF8C42" />
      </View>
      <Text style={styles.encouragementTitle}>你很厲害！</Text>
      <Text style={styles.encouragementDesc}>
        你願意不帶批判，嘗試站在對方的角度思考，{"\n"}
        而這正是同理能力的展現。
      </Text>
      <Text style={styles.encouragementDesc2}>
        同理不代表同意或認同對方的想法，{"\n"}
        而是理解對方的感受與需求，{"\n"}
        進而決定你打算如何應對。
      </Text>
      <TouchableOpacity style={[styles.primaryBtn, {marginTop: 32}]} onPress={onNext}>
        <LinearGradient colors={['#FF8C42', '#FF6B6B']} style={styles.btnGrad}>
          <Text style={styles.btnText}>下一步</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  </LinearGradient>
);

// [Fix #5] 理解需求頁 — 書寫靈感標籤可點擊插入
const NeedsStepDetailed = ({ value, onChange, onNext, onBack, onExit }) => {
  const handleTagPress = useCallback((tag) => {
    const current = value || '';
    const newVal = current ? `${current}\n• ${tag}` : `• ${tag}`;
    onChange(newVal);
  }, [value, onChange]);

  const handleReflectionPress = useCallback((template) => {
    const current = value || '';
    const newVal = current ? `${current}\n${template}` : template;
    onChange(newVal);
  }, [value, onChange]);

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{flex: 1}}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <LinearGradient colors={['#FFF4ED', '#FFE8DB']} style={styles.fullScreen}>
          <Header onBack={onBack} title="理解需求" onExit={onExit} />
          <ScrollView contentContainerStyle={[styles.scrollContent, {paddingBottom: 220}]} showsVerticalScrollIndicator={true}>
            <ProgressDots currentStep={2} totalSteps={5} />
            <Text style={styles.instrText}>對方真正在意的重點{"\n"}是什麼需求或期待沒有被滿足呢？</Text>
            
            <View style={styles.inputCard}>
              <TextInput 
                multiline 
                style={styles.textArea} 
                value={value} 
                onChangeText={onChange} 
                placeholder="對方在意的點是..." 
                placeholderTextColor="#cbd5e1" 
                textAlignVertical="top" 
              />
            </View>

            <View style={styles.exampleBox}>
              <Star size={14} color="#fbbf24" fill="#fbbf24" />
              <Text style={styles.exampleText}>
                例如：{"\n"}
                (1) 他可能需要安穩的空間來處理壓力{"\n"}
                (2) 另一半可能需要安全感、想要被安慰
              </Text>
            </View>

            <Text style={styles.commonCluesTitle}>常見端倪</Text>
            
            <View style={styles.clueSection}>
              <Text style={styles.clueSectionTitle}>• 智慧模式</Text>
              <Text style={styles.clueSectionText}>
                這是他長期以來應對外界的習慣嗎？（例如：選擇讓力壓抑起來、習慣先指責別人以保護自己）。
              </Text>
            </View>

            <View style={styles.clueSection}>
              <Text style={styles.clueSectionTitle}>• 身心狀態</Text>
              <Text style={styles.clueSectionText}>
                他當時的身體狀況或睡眠狀況嗎？（例如：睡眠不足、焦慮主管系、正好感冒不適造成的焦慮中）。
              </Text>
            </View>

            <View style={styles.clueSection}>
              <Text style={styles.clueSectionTitle}>• 角色壓力</Text>
              <Text style={styles.clueSectionText}>
                身為那個角色（上司、父母、伴侶），他是否正承受某些形象的壓力或責任？
              </Text>
            </View>

            {/* [Fix #5] 書寫靈感 — 點擊插入文字到輸入框 */}
            <Text style={styles.inspirationTitle}>💡 書寫靈感（點擊插入）</Text>

            <TouchableOpacity style={styles.reflectionBox} onPress={() => handleReflectionPress('如果我是他，在同樣的處境或壓力漩渦中，我可能會覺得...')}>
              <Text style={styles.reflectionIcon}>👤</Text>
              <Text style={styles.reflectionText}>
                如果我是他，在同樣的處境或壓力漩渦中，我可能會覺得...
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.reflectionBox} onPress={() => handleReflectionPress('我發現，他的反應可能不完全是因為我，而是因為...')}>
              <Text style={styles.reflectionIcon}>🌿</Text>
              <Text style={styles.reflectionText}>
                我發現，他的反應可能不完全是因為我，而是因為...
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.reflectionBox} onPress={() => handleReflectionPress('根據過往經驗，他好像會在極度焦慮的時候，會用...')}>
              <Text style={styles.reflectionIcon}>💭</Text>
              <Text style={styles.reflectionText}>
                根據過往經驗，他好像會在極度焦慮的時候，會用...
              </Text>
            </TouchableOpacity>

            <Text style={styles.tagSectionTitle}>快速標記需求</Text>
            <View style={styles.tagRow}>
              <TouchableOpacity style={styles.tagBtn} onPress={() => handleTagPress('被理解')}><Text style={styles.tagText}>+ 被理解</Text></TouchableOpacity>
              <TouchableOpacity style={styles.tagBtn} onPress={() => handleTagPress('被尊重')}><Text style={styles.tagText}>+ 被尊重</Text></TouchableOpacity>
              <TouchableOpacity style={styles.tagBtn} onPress={() => handleTagPress('安全感')}><Text style={styles.tagText}>+ 安全感</Text></TouchableOpacity>
            </View>

            <View style={styles.tagRow}>
              <TouchableOpacity style={styles.tagBtn} onPress={() => handleTagPress('效率與節奏')}><Text style={styles.tagText}>+ 效率與節奏</Text></TouchableOpacity>
              <TouchableOpacity style={styles.tagBtn} onPress={() => handleTagPress('空間與自由')}><Text style={styles.tagText}>+ 空間與自由</Text></TouchableOpacity>
            </View>

            <View style={styles.tagRow}>
              <TouchableOpacity style={styles.tagBtn} onPress={() => handleTagPress('認同與價值')}><Text style={styles.tagText}>+ 認同與價值</Text></TouchableOpacity>
              <TouchableOpacity style={styles.tagBtn} onPress={() => handleTagPress('連結與親密')}><Text style={styles.tagText}>+ 連結與親密</Text></TouchableOpacity>
            </View>
          </ScrollView>
          <View style={styles.footer}>
            <TouchableOpacity style={styles.primaryBtn} onPress={onNext}>
              <LinearGradient colors={['#FF8C42', '#FF6B6B']} style={styles.btnGrad}>
                <Text style={styles.btnText}>下一步</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

// [Fix #1] 考量限制頁 — 新增「跳過」按鈕（僅此頁可跳過）
const LimitationsStepDetailed = ({ value, onChange, onNext, onSkip, onBack, onExit }) => (
  <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{flex: 1}}>
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <LinearGradient colors={['#FFF4ED', '#FFE8DB']} style={styles.fullScreen}>
        <Header onBack={onBack} title="考量限制" onExit={onExit} />
        <ScrollView contentContainerStyle={[styles.scrollContent, {paddingBottom: 220}]} showsVerticalScrollIndicator={true}>
          <ProgressDots currentStep={3} totalSteps={5} />
          <Text style={styles.instrText}>
            他的表達方式或許受到某些情境壓力影響{"\n"}
            或許一些話會想表{"\n"}
            如果這句話不是在針對我{"\n"}
            還會有哪些可能性
          </Text>
          
          <View style={styles.inputCard}>
            <TextInput 
              multiline 
              style={styles.textArea} 
              value={value} 
              onChangeText={onChange} 
              placeholder="他會這麼說或許是因為..." 
              placeholderTextColor="#cbd5e1" 
              textAlignVertical="top" 
            />
          </View>

          <Text style={styles.commonCluesTitle}>常見提示</Text>
          
          <View style={styles.clueSection}>
            <Text style={styles.clueSectionTitle}>• 智慧模式</Text>
            <Text style={styles.clueSectionText}>
              這是他長期以來應對外界的習慣嗎？（例如：選擇讓力壓抑起來、習慣先指責別人以保護自己）。
            </Text>
          </View>

          <View style={styles.clueSection}>
            <Text style={styles.clueSectionTitle}>• 身心狀態</Text>
            <Text style={styles.clueSectionText}>
              他當時的身體狀況或睡眠狀況嗎？（例如：睡眠不足、焦慮主管系、正好感冒不適造成的焦慮中）。
            </Text>
          </View>

          <View style={styles.clueSection}>
            <Text style={styles.clueSectionTitle}>• 角色壓力</Text>
            <Text style={styles.clueSectionText}>
              身為那個角色（上司、父母、伴侶），他是否正承受某些形象的壓力或責任？
            </Text>
          </View>
        </ScrollView>
        <View style={styles.footer}>
          {/* [Fix #1] 跳過按鈕 — 僅限考量限制頁 */}
          <TouchableOpacity style={styles.skipBtn} onPress={onSkip}>
            <Text style={styles.skipBtnText}>跳過此步驟</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.primaryBtn} onPress={onNext}>
            <LinearGradient colors={['#FF8C42', '#FF6B6B']} style={styles.btnGrad}>
              <Text style={styles.btnText}>下一步</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </TouchableWithoutFeedback>
  </KeyboardAvoidingView>
);

// ==================== 主組件 (Controller) ====================
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
  }, [practiceId, formData, elapsedTime, currentPage]);

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

  const handleExit = () => setShowExitWarning(true);

  // [Fix #4] 確定退出 — 加入 fallback 邏輯
  const handleConfirmExit = useCallback(() => {
    setShowExitWarning(false);
    setIsTiming(false);
    if (onHome) {
      onHome();
    } else if (onBack) {
      onBack();
    } else if (navigation) {
      try {
        navigation.navigate('MainTabs', { screen: 'Daily' });
      } catch (_e) {
        navigation.goBack();
      }
    }
  }, [onHome, onBack, navigation]);

  const updateForm = (key, value) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const renderContent = () => {
    switch(currentPage) {
      case 'welcome':
        return <WelcomePage onNext={() => setCurrentPage('intro')} onExit={handleExit} />;
      case 'intro':
        return <IntroPage onNext={() => setCurrentPage('situation-recall')} onBack={() => setCurrentPage('welcome')} onExit={handleExit} />;
      case 'situation-recall':
        return <SituationRecallPage onNext={() => setCurrentPage('breathing')} onBack={() => setCurrentPage('intro')} onExit={handleExit} />;
      case 'breathing':
        return <BreathingPage onNext={() => setCurrentPage('fact')} onBack={() => setCurrentPage('situation-recall')} onExit={handleExit} />;
      case 'fact':
        return <FactStep data={formData.situation} onChange={(v) => updateForm('situation', v)} onNext={() => setCurrentPage('emotions')} onBack={() => setCurrentPage('breathing')} onExit={handleExit} />;
      case 'emotions':
        return <EmotionsStep selectedEmotions={formData.emotions} onToggle={(emo) => setFormData(p => ({...p, emotions: p.emotions.includes(emo) ? p.emotions.filter(e=>e!==emo) : [...p.emotions, emo].slice(0,3)}))} onNext={() => setCurrentPage('needs')} onBack={() => setCurrentPage('fact')} onExit={handleExit} />;
      case 'needs':
        return <NeedsStepDetailed value={formData.needs} onChange={(v) => updateForm('needs', v)} onNext={() => setCurrentPage('limitations')} onBack={() => setCurrentPage('emotions')} onExit={handleExit} />;
      case 'limitations':
        return (
          <LimitationsStepDetailed 
            value={formData.limitations} 
            onChange={(v) => updateForm('limitations', v)} 
            onNext={() => setCurrentPage('translation')} 
            onSkip={() => setCurrentPage('translation')}  // [Fix #1] 跳過直接到下一步
            onBack={() => setCurrentPage('needs')} 
            onExit={handleExit} 
          />
        );
      case 'translation':
        return <TranslationStep situation={formData.situation} emotion={formData.emotions[0]} translation={formData.translation} onChange={(v) => updateForm('translation', v)} onNext={() => setCurrentPage('encouragement')} onBack={() => setCurrentPage('limitations')} onExit={handleExit} />;
      case 'encouragement':
        // [Fix #6] encouragement → summary（先紀錄統整）
        return <EncouragementPage onNext={() => setCurrentPage('summary')} onBack={() => setCurrentPage('translation')} onExit={handleExit} />;
      case 'summary':
        // [Fix #6] summary → assessment（再狀態核對）
        return <SummaryStep formData={formData} onNext={() => setCurrentPage('assessment')} onBack={() => setCurrentPage('encouragement')} onExit={handleExit} />;
      case 'assessment':
        // [Fix #6] assessment → recommendations
        return <AssessmentStep moodScore={formData.moodScore} onMoodChange={(v) => updateForm('moodScore', v)} understandingScore={formData.understandingScore} onUndChange={(v) => updateForm('understandingScore', v)} onNext={() => setCurrentPage('recommendations')} onBack={() => setCurrentPage('summary')} onExit={handleExit} />;
      case 'recommendations':
        return <RecPage onNext={() => setCurrentPage('final')} onBack={() => setCurrentPage('assessment')} onExit={handleExit} />;
      case 'final':
        return <FinalPage onComplete={handleComplete} iconScale={iconScale} />;
      default:
        return null;
    }
  };

  return (
    // [Fix #8] Android icon 切痕修正
    <Animated.View 
      style={{flex: 1, opacity: fadeAnim}} 
      needsOffscreenAlphaCompositing={Platform.OS === 'android'}
      renderToHardwareTextureAndroid={Platform.OS === 'android'}
    >
      <StatusBar barStyle="dark-content" />
      {renderContent()}
      {/* [Fix #4] 使用 handleConfirmExit 取代 onHome */}
      <ExitWarningModal visible={showExitWarning} onCancel={() => setShowExitWarning(false)} onConfirm={handleConfirmExit} />
    </Animated.View>
  );
}

// ==================== 靜態頁面組件 ====================

// [Fix #9] WelcomePage — 固定 icon+dots 高度
const WelcomePage = ({ onNext, onExit }) => (
  <LinearGradient colors={['#FFF4ED', '#FFE8DB']} style={styles.fullScreen}>
    <TouchableOpacity style={styles.closeBtnAbs} onPress={onExit}>
      <X size={24} color="#FF8C42" />
    </TouchableOpacity>
    <View style={styles.fullScreen}>
      <View style={styles.introFixedTop}>
        <View
          style={styles.iconCircle}
          needsOffscreenAlphaCompositing={Platform.OS === 'android'}
          renderToHardwareTextureAndroid={Platform.OS === 'android'}
        >
          <Heart size={48} color="#FF8C42" />
        </View>
        <ProgressDots currentStep={0} totalSteps={3} />
      </View>
      <View style={styles.introContentArea}>
        <Text style={styles.welcomeTitle}>哈囉！{"\n"}歡迎來到同理讀心術</Text>
        <Text style={styles.welcomeDesc}>
          無法清晰表達的需求，往往是人際衝突的來源。{"\n\n"}
          透過這個練習，我們將能解讀對方話語中的真實感受與需求。
        </Text>
        <TouchableOpacity style={styles.primaryBtn} onPress={onNext}>
          <LinearGradient colors={['#FF8C42', '#FF6B6B']} style={styles.btnGrad}>
            <Text style={styles.btnText}>下一頁</Text>
            <ArrowRight size={20} color="#fff" />
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  </LinearGradient>
);

// [Fix #9] IntroPage — 固定 icon+dots 高度
const IntroPage = ({ onNext, onBack, onExit }) => (
  <LinearGradient colors={['#FFF4ED', '#FFE8DB']} style={styles.fullScreen}>
    <Header onBack={onBack} onExit={onExit} />
    <View style={styles.fullScreen}>
      <View style={styles.introFixedTopWithHeader}>
        <View
          style={styles.iconCircle}
          needsOffscreenAlphaCompositing={Platform.OS === 'android'}
          renderToHardwareTextureAndroid={Platform.OS === 'android'}
        >
          <Heart size={48} color="#FF8C42" />
        </View>
        <ProgressDots currentStep={1} totalSteps={3} />
      </View>
      <View style={styles.introContentArea}>
        <Text style={styles.welcomeTitle}>接下來我們一起{"\n"}走過這些練習步驟</Text>
        <View style={styles.stepList}>
          <Text style={styles.stepHighlight}>
            還原事實 • 辨識情緒 • 理解需求{"\n"}
            考量限制 • 同理翻譯
          </Text>
        </View>
        <TouchableOpacity style={styles.primaryBtn} onPress={onNext}>
          <LinearGradient colors={['#FF8C42', '#FF6B6B']} style={styles.btnGrad}>
            <Text style={styles.btnText}>下一頁</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  </LinearGradient>
);

const BreathingPage = ({ onNext, onBack, onExit }) => (
  <LinearGradient colors={['#FFF4ED', '#FFE8DB']} style={styles.fullScreen}>
    <Header onBack={onBack} onExit={onExit} />
    <View style={styles.centerContent}>
      <View
        style={[styles.iconCircle, {backgroundColor:'rgba(255,140,66,0.1)'}]}
        needsOffscreenAlphaCompositing={Platform.OS === 'android'}
        renderToHardwareTextureAndroid={Platform.OS === 'android'}
      >
        <Wind size={48} color="#FF8C42" />
      </View>
      <Text style={styles.welcomeTitle}>深呼吸 放鬆</Text>
      <Text style={styles.welcomeDesc}>
        進行3-5次腹式呼吸{"\n"}
        吸氣4秒，閉氣4秒，呼氣6秒{"\n"}
        讓理性腦回歸主宰{"\n"}
        幫助後面的練習更加順利
      </Text>
      <TouchableOpacity style={styles.primaryBtn} onPress={onNext}>
        <LinearGradient colors={['#FF8C42', '#FF6B6B']} style={styles.btnGrad}>
          <Text style={styles.btnText}>開始練習</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  </LinearGradient>
);

const RecPage = ({ onNext, onBack, onExit }) => (
  <LinearGradient colors={['#FFF4ED', '#FFE8DB']} style={styles.fullScreen}>
    <Header onBack={onBack} title="推薦建議" onExit={onExit} />
    <ScrollView contentContainerStyle={styles.scrollContent}>
      <Text style={styles.pageTitle}>接下來，你可以...</Text>
      
      <View style={styles.recItem}>
        <View style={styles.recIconCircle}>
          <MessageCircle color="#FF8C42" size={20} />
        </View>
        <View style={{flex:1}}>
          <Text style={styles.recT}>找人聊聊</Text>
          <Text style={styles.recD}>
            找個時機和他問他：「你那天是不是壓力太大？我很關心的容易度，想協在意工作進度呢？」
          </Text>
        </View>
      </View>

      <View style={styles.recItem}>
        <View style={styles.recIconCircle}>
          <ShieldCheck color="#FF8C42" size={20} />
        </View>
        <View style={{flex:1}}>
          <Text style={styles.recT}>設定界線</Text>
          <Text style={styles.recD}>
            嘗試理解他的壓力來源，但若你感到受傷，試著告訴他：「我理解你當下很忙，但你那天說話的語氣讓我有點難過。」
          </Text>
        </View>
      </View>

      <View style={styles.recItem}>
        <View style={styles.recIconCircle}>
          <Wind color="#FF8C42" size={20} />
        </View>
        <View style={{flex:1}}>
          <Text style={styles.recT}>4-6 呼吸練習</Text>
          <Text style={styles.recD}>
            如果進度壓力讓你持續焦慮，充滿壓力，{"\n"}
            建議找你信任的人協助，獲得幫助
          </Text>
        </View>
      </View>

      <Image 
        source={{uri:'https://curiouscreate.com/api/asserts/image/EmpathyPractice_image.jpg'}} 
        style={styles.recImg} 
        resizeMode="cover"
      />
    </ScrollView>
    <View style={styles.footer}>
      <TouchableOpacity style={styles.primaryBtn} onPress={onNext}>
        <LinearGradient colors={['#FF8C42', '#FF6B6B']} style={styles.btnGrad}>
          <Text style={styles.btnText}>完成練習</Text>
          <ArrowRight size={20} color="#fff" />
        </LinearGradient>
      </TouchableOpacity>
    </View>
  </LinearGradient>
);

const FinalPage = ({ onComplete, iconScale }) => (
  <LinearGradient colors={['#FFF4ED', '#FFE8DB']} style={styles.fullScreen}>
    <View style={styles.centerContent}>
      <Animated.View
        style={[styles.finalIcon, {transform:[{scale: iconScale}]}]}
        needsOffscreenAlphaCompositing={Platform.OS === 'android'}
        renderToHardwareTextureAndroid={Platform.OS === 'android'}
      >
        <View style={styles.iconCircle}>
          <Heart size={48} color="#FF8C42" />
          <View style={styles.starBadge}>
            <Star size={16} color="#fff" fill="#fff" />
          </View>
        </View>
      </Animated.View>
      <Text style={styles.finalTitle}>你做得很好</Text>
      <Text style={styles.finalDesc}>
        每一次練習都讓你對溝通情境有更強的同理，{"\n"}
        也讓你具備選擇更適當溝通策略的能力。
      </Text>
      <TouchableOpacity style={[styles.primaryBtn, {marginTop: 40}]} onPress={onComplete}>
        <LinearGradient colors={['#FF8C42', '#FF6B6B']} style={styles.btnGrad}>
          <Text style={styles.btnText}>完成練習</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  </LinearGradient>
);

const ExitWarningModal = ({ visible, onCancel, onConfirm }) => (
  <Modal transparent visible={visible} animationType="fade">
    <View style={styles.modalBg}>
      <View style={styles.modalBox}>
        <Text style={styles.modalT}>確定要退出練習嗎</Text>
        <Text style={styles.modalM}>本次練習將不會被記錄</Text>
        <TouchableOpacity style={styles.modalExit} onPress={onConfirm}>
          <Text style={{color:'#DC2626', fontWeight:'700'}}>確定退出</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.modalStay} onPress={onCancel}>
          <Text style={{fontWeight:'700'}}>繼續練習</Text>
        </TouchableOpacity>
      </View>
    </View>
  </Modal>
);

// ==================== 樣式定義 ====================
const styles = StyleSheet.create({
  fullScreen: { flex: 1 },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems:'center', 
    paddingTop: 60, 
    paddingHorizontal: 20, 
    zIndex:10 
  },
  headerTitle: { 
    fontSize: 18, 
    fontWeight: '700', 
    color: '#1e293b' 
  },
  navBtn: { 
    width: 40, 
    height: 40, 
    borderRadius: 20, 
    backgroundColor: '#fff', 
    justifyContent: 'center', 
    alignItems: 'center', 
    shadowColor: '#000', 
    shadowOffset: {width:0,height:2}, 
    shadowOpacity:0.05, 
    elevation:2 
  },
  
  centerContent: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    paddingHorizontal: 40 
  },

  // [Fix #9] 前三頁（含 breathing）固定 icon+dots 區域 — 無 Header 版
  introFixedTop: {
    alignItems: 'center',
    paddingTop: 120,
    paddingBottom: 8,
  },

  // [Fix #9] 有 Header 的版本（intro, situation-recall, breathing 有 header）
  introFixedTopWithHeader: {
    alignItems: 'center',
    paddingTop: 24,
    paddingBottom: 8,
  },

  // [Fix #9] 內容區：填滿剩餘空間、垂直居中
  introContentArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingBottom: 60,
  },

  welcomeContent: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    paddingHorizontal: 32 
  },
  
  iconCircle: { 
    width: 96, 
    height: 96, 
    borderRadius: 48, 
    backgroundColor: '#fff', 
    justifyContent: 'center', 
    alignItems: 'center', 
    elevation: 8, 
    shadowColor: '#FF8C42', 
    shadowOffset: {width:0,height:4}, 
    shadowOpacity:0.2, 
    marginBottom: 24,
    // [Fix #8] Android 防止切痕
    overflow: 'visible',
  },
  welcomeTitle: { 
    fontSize: 24, 
    fontWeight: '700', 
    color: '#1e293b', 
    textAlign: 'center', 
    marginBottom: 16 
  },
  welcomeDesc: { 
    fontSize: 15, 
    color: '#64748b', 
    textAlign: 'center', 
    lineHeight: 24, 
    marginBottom: 32 
  },
  
  encouragementTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1e293b',
    textAlign: 'center',
    marginBottom: 20,
    marginTop: 16,
  },
  encouragementDesc: {
    fontSize: 15,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  encouragementDesc2: {
    fontSize: 15,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  
  primaryBtn: { 
    width: '100%', 
    height: 56, 
    borderRadius: 28, 
    overflow: 'hidden', 
    shadowColor: '#FF8C42', 
    shadowOffset: {width:0,height:4}, 
    shadowOpacity:0.3, 
    elevation: 4 
  },
  btnGrad: { 
    flex: 1, 
    flexDirection: 'row', 
    justifyContent: 'center', 
    alignItems: 'center', 
    gap: 8 
  },
  btnText: { 
    color: '#fff', 
    fontSize: 17, 
    fontWeight: '700' 
  },

  // [Fix #1] 跳過按鈕樣式
  skipBtn: {
    width: '100%',
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  skipBtnText: {
    fontSize: 15,
    color: '#94a3b8',
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  
  scrollContent: { 
    paddingHorizontal: 24, 
    paddingTop: 10, 
    paddingBottom: 140 
  },
  pageTitle: { 
    fontSize: 22, 
    fontWeight: '700', 
    color: '#1e293b', 
    textAlign: 'center', 
    marginBottom: 24,
    marginTop: 8,
  },
  instrText: { 
    fontSize: 16, 
    fontWeight: '700', 
    color:'#1e293b', 
    textAlign: 'center', 
    marginBottom: 12, 
    lineHeight: 24 
  },
  subInstr: { 
    fontSize: 14, 
    color: '#64748b', 
    textAlign: 'center', 
    marginBottom: 20 
  },
  
  inputCard: { 
    backgroundColor: '#fff', 
    borderRadius: 20, 
    padding: 20, 
    minHeight: 180, 
    elevation: 3, 
    shadowColor: '#000', 
    shadowOpacity: 0.05, 
    shadowRadius: 10, 
    shadowOffset: {width:0, height:4} 
  },
  textArea: { 
    fontSize: 16, 
    color: '#334155', 
    lineHeight: 24, 
    flex:1 
  },
  
  exampleBox: { 
    flexDirection: 'row', 
    gap: 8, 
    marginTop: 16, 
    paddingHorizontal: 4 
  },
  exampleText: { 
    flex: 1, 
    fontSize: 13, 
    color: '#64748b', 
    lineHeight: 18 
  },
  
  footer: { 
    position: 'absolute', 
    bottom: 40, 
    left: 0, 
    right: 0, 
    paddingHorizontal: 24 
  },
  closeBtnAbs: { 
    position: 'absolute', 
    top: 60, 
    right: 20, 
    width: 40, 
    height: 40, 
    backgroundColor: '#fff', 
    borderRadius: 20, 
    justifyContent: 'center', 
    alignItems: 'center', 
    zIndex: 10 
  },
  
  progressDotsContainer: { 
    flexDirection: 'row', 
    justifyContent: 'center', 
    gap: 8, 
    marginBottom: 24 
  },
  dot: { 
    width: 8, 
    height: 8, 
    borderRadius: 4 
  },
  dotActive: { 
    backgroundColor: '#FF8C42' 
  },
  dotInactive: { 
    backgroundColor: '#E5E7EB' 
  },
  
  chipGrid: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    gap: 10 
  },
  chip: { 
    backgroundColor: '#fff', 
    paddingHorizontal: 16, 
    paddingVertical: 10, 
    borderRadius: 20, 
    borderWidth: 1.5, 
    borderColor: '#e2e8f0' 
  },
  chipActive: { 
    backgroundColor: '#FF8C42', 
    borderColor: '#FF8C42' 
  },
  chipText: { 
    color: '#64748b', 
    fontSize: 14 
  },
  chipTextActive: { 
    color: '#fff', 
    fontWeight: '700' 
  },
  catTitle: { 
    fontSize: 14, 
    color: '#94a3b8', 
    marginBottom: 10, 
    fontWeight:'600' 
  },
  
  quoteBox: { 
    flexDirection:'row', 
    gap:10, 
    backgroundColor: 'rgba(255,140,66,0.05)', 
    padding: 16, 
    borderRadius: 12, 
    marginBottom: 16, 
    borderWidth: 1, 
    borderColor: '#FFE8DB' 
  },
  quoteLabel: { 
    fontSize: 12, 
    color: '#FF8C42', 
    fontWeight: '700' 
  },
  quoteText: { 
    fontSize: 14, 
    color: '#64748b', 
    marginTop: 4, 
    fontStyle: 'italic' 
  },
  
  formulaHint: { 
    fontSize: 14, 
    fontWeight: '700', 
    color: '#FF8C42', 
    marginTop: 24, 
    marginBottom: 12 
  },
  formulaCard: { 
    backgroundColor: '#fff', 
    padding: 16, 
    borderRadius: 12, 
    borderWidth: 1, 
    borderColor: '#FFE8DB', 
    shadowColor: '#FF8C42', 
    shadowOpacity: 0.1, 
    elevation: 2 
  },
  formulaType: { 
    fontSize: 12, 
    fontWeight: '800', 
    color: '#FF8C42' 
  },
  formulaMain: { 
    fontSize: 14, 
    color: '#64748b', 
    marginTop: 6 
  },
  
  commonCluesTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FF8C42',
    marginTop: 24,
    marginBottom: 12,
  },

  clueSection: {
    marginBottom: 16,
  },
  clueSectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 6,
  },
  clueSectionText: {
    fontSize: 13,
    color: '#64748b',
    lineHeight: 20,
  },

  // [Fix #5] 書寫靈感標題
  inspirationTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FF8C42',
    marginTop: 24,
    marginBottom: 12,
  },

  reflectionBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  reflectionIcon: {
    fontSize: 18,
  },
  reflectionText: {
    flex: 1,
    fontSize: 13,
    color: '#64748b',
    lineHeight: 20,
  },

  // [Fix #5] 標籤區標題
  tagSectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#94a3b8',
    marginTop: 16,
    marginBottom: 10,
  },

  tagRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
    flexWrap: 'wrap',
  },
  tagBtn: {
    backgroundColor: '#fff',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  tagText: {
    fontSize: 13,
    color: '#64748b',
  },

  footerHint: {
    fontSize: 12,
    color: '#94a3b8',
    textAlign: 'center',
    marginBottom: 12,
  },
  
  assessmentCard: { 
    backgroundColor: '#fff', 
    borderRadius: 28, 
    padding: 28, 
    width: '100%', 
    elevation: 12, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 8 }, 
    shadowOpacity: 0.1, 
    shadowRadius: 20 
  },
  assessTitle: { 
    fontSize: 20, 
    fontWeight: '700', 
    textAlign: 'center', 
    marginBottom: 30, 
    color:'#1e293b' 
  },
  sliderLabel: { 
    fontSize: 15, 
    fontWeight: '700', 
    color: '#334155', 
    marginBottom: 8 
  },
  scoreRow: { 
    flexDirection: 'row', 
    justifyContent: 'center', 
    alignItems: 'baseline', 
    marginBottom: 10 
  },
  scoreNum: { 
    fontSize: 48, 
    fontWeight: '800', 
    color: '#FF6B35' 
  },
  scoreMax: { 
    fontSize: 18, 
    color: '#94a3b8', 
    marginLeft: 4 
  },
  sliderLabels: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    marginTop: 8 
  },
  sliderLabelSmall: { 
    fontSize: 12, 
    color: '#94a3b8' 
  },

  sumCard: { 
    backgroundColor: '#fff', 
    padding: 16, 
    borderRadius: 16, 
    marginBottom: 12, 
    elevation: 2 
  },
  sumL: { 
    fontSize: 13, 
    color: '#94a3b8', 
    marginBottom: 4, 
    fontWeight:'600' 
  },
  sumV: { 
    fontSize: 15, 
    color: '#334155', 
    lineHeight: 22 
  },
  
  recItem: { 
    flexDirection: 'row', 
    gap: 12, 
    backgroundColor: '#fff', 
    padding: 16, 
    borderRadius: 16, 
    marginBottom: 12, 
    elevation: 2,
    alignItems: 'flex-start',
  },
  recIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,140,66,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  recT: { 
    fontSize: 16, 
    fontWeight: '700', 
    color:'#1e293b' 
  },
  recD: { 
    fontSize: 14, 
    color: '#64748b', 
    marginTop: 4,
    lineHeight: 20,
  },
  recImg: { 
    width: '100%', 
    height: 200, 
    borderRadius: 16, 
    marginTop: 12 
  },
  
  modalBg: { 
    flex: 1, 
    backgroundColor: 'rgba(0,0,0,0.5)', 
    justifyContent: 'center', 
    padding: 32 
  },
  modalBox: { 
    backgroundColor: '#fff', 
    borderRadius: 24, 
    padding: 32, 
    alignItems: 'center' 
  },
  modalT: { 
    fontSize: 20, 
    fontWeight: '700', 
    marginBottom: 10 
  },
  modalM: { 
    color: '#64748b', 
    marginBottom: 30 
  },
  modalExit: { 
    backgroundColor: '#FFE8E8', 
    width: '100%', 
    height: 52, 
    borderRadius: 26, 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginBottom: 12 
  },
  modalStay: { 
    width: '100%', 
    height: 52, 
    borderRadius: 26, 
    justifyContent: 'center', 
    alignItems: 'center', 
    borderWidth: 1.5, 
    borderColor: '#e2e8f0' 
  },
  
  stepHighlight: { 
    fontSize: 15, 
    fontWeight: '600', 
    color: '#FF8C42', 
    textAlign: 'center', 
    lineHeight: 28, 
    marginBottom: 30 
  },
  stepList: { 
    marginBottom: 32 
  },
  finalIcon: { 
    marginBottom: 24 
  },
  finalTitle: { 
    fontSize: 24, 
    fontWeight: '700', 
    color: '#1e293b', 
    marginBottom: 16 
  },
  finalDesc: { 
    fontSize: 15, 
    color: '#64748b', 
    textAlign: 'center', 
    lineHeight: 24, 
    paddingHorizontal: 10 
  },
  starBadge: { 
    position:'absolute', 
    top:-6, 
    right:-6, 
    backgroundColor:'#FF8C42', 
    width:32, 
    height:32, 
    borderRadius:16, 
    justifyContent:'center', 
    alignItems:'center', 
    borderWidth:3, 
    borderColor:'#fff' 
  },
});

const sliderStyles = StyleSheet.create({
  container: {
    width: '100%',
    maxWidth: 400,
    height: 60,
    justifyContent: 'center',
    position: 'relative',
    alignSelf: 'center',
  },
  track: {
    position: 'absolute',
    left: 0,
    right: 0,
    backgroundColor: '#F5E6DC',
    borderRadius: 8,
  },
  fill: {
    position: 'absolute',
    left: 0,
    backgroundColor: '#FF8C42',
    borderRadius: 8,
    ...Platform.select({
      ios: {
        shadowColor: '#FF8C42',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.4,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  thumb: {
    position: 'absolute',
    top: 12,
    backgroundColor: '#FF6B35',
    borderWidth: 4,
    borderColor: '#FFFFFF',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
});