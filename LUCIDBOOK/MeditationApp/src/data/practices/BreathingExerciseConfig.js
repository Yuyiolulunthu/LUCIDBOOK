// BreathingExerciseCard 設計常量配置

export const COLORS = {
  // 主要顏色
  background: '#E9EFF6',
  primary: '#31C6FE',
  primaryDark: '#1BA5D8',
  gradientStart: '#166CB5',
  gradientEnd: '#31C6FE',
  
  // 文字顏色
  textPrimary: '#606060',
  textSecondary: '#4A5565',
  textWhite: '#FFFFFF',
  textTagUnselected: 'rgba(255, 255, 255, 0.60)',
  
  // 卡片顏色
  cardBackground: '#FFFFFF',
  cardShadow: '#000000',
  cardBorder: '#E5E7EB',
  
  // 按鈕顏色
  buttonTransparent: 'rgba(255, 255, 255, 0.60)',
  buttonBackTransparent: 'rgba(255, 255, 255, 0.8)',
  buttonBorder: '#31C6FE',
  buttonDisabled: '#A0A0C0',
  
  // 情緒顏色
  anxiety: '#FF9A8B',
  tired: '#A8C5DD',
  relaxed: '#7FC8A9',
  angry: '#FF6B6B',
  depressed: '#A0A0C0',
  satisfied: '#FFD93D',
};

export const SIZES = {
  // 字體大小
  headerTitle: 24,
  cardTitle: 18,
  buttonText: 18,
  bodyText: 14,
  smallIcon: 16,
  backArrow: 24,
  arrow: 24,
  breathIcon: 20,
  emotionIcon: 24,
  
  // 元件尺寸
  headerHeight: 72,
  bottomNavHeight: 80,
  backButtonSize: 40,
  homeIconSize: 32,
  homeButtonSize: 56,
  startButtonHeight: 46,
  stateCardAspectRatio: 1.4,
  
  // 圓角
  cardRadius: 16,
  stateCardRadius: 24,
  buttonRadius: 100,
  backButtonRadius: 20,
  homeButtonRadius: 28,
  titleGradientRadius: 8,
  iconContainerRadius: 14,
  
  // 間距
  paddingHorizontal: 24,
  paddingVertical: 16,
  cardPadding: 24,
  cardMargin: 20,
  stateCardPadding: 17,
  tagGap: 12,
  stateGap: 16,
  elementGap: 10,
  
  // 陰影
  shadowRadius: 8,
  shadowOpacity: 0.08,
  shadowOffset: { width: 0, height: 2 },
  elevation: 3,
  
  // 情緒卡片陰影
  stateCardShadowOpacity: 0.05,
  stateCardShadowRadius: 4,
  
  // Home 按鈕陰影
  homeButtonShadowOpacity: 0.1,
  homeButtonShadowRadius: 4,
};

export const FONTS = {
  header: {
    fontFamily: 'System',
    fontWeight: '600',
  },
  title: {
    fontFamily: 'System',
    fontWeight: '400',
  },
  body: {
    fontFamily: 'System',
    fontWeight: '400',
  },
  tagSelected: {
    fontFamily: 'System',
    fontWeight: '400',
  },
};

export const IMAGES = {
  // 圖片資源路徑配置
  homeIcon: '../../../assets/images/Home_icon.png',
  leftArrow: '../../../assets/images/Left_arrow.png',
  clockIcon: '../../../assets/images/sample_clock.png',
  starsIcon: '../../../assets/images/stars.png',
  
  // 音頻控制圖標
  playIcon: '../../../assets/images/start.png',
  stopIcon: '../../../assets/images/stop.png',
  forwardIcon: '../../../assets/images/forward.png',
  backwardIcon: '../../../assets/images/backward.png',
  
  // 其他圖示
  sittingPosition: '../../../assets/images/sitting-position.png',
};

// 預設練習資料結構
export const DEFAULT_EXERCISES = [
  {
    id: 1,
    title: '4-6呼吸練習',
    duration: '5 分鐘',
    description: '適合放鬆、減壓',
    tags: ['減壓', '助眠', '平靜'],
    gradientColors: ['#166CB5', '#31C6FE'],
    type: '4-6-breathing',
    audioFile: null,
  },
  {
    id: 2,
    title: '屏息呼吸練習',
    duration: '5 分鐘',
    description: '適合提升專注與穩定',
    tags: ['專注', '穩態', '覺察'],
    gradientColors: ['#166CB5', '#31C6FE'],
    type: 'breath-holding',
    audioFile: null,
  },
];

// 情緒狀態資料結構
export const EMOTIONAL_STATES = [
  {
    id: 1,
    name: '焦慮緊張',
    key: 'anxiety',
    color: '#FF9A8B',
    bgColor: 'rgba(255, 154, 139, 0.08)',
  },
  {
    id: 2,
    name: '疲憊困倦',
    key: 'tired',
    color: '#A8C5DD',
    bgColor: 'rgba(168, 197, 221, 0.08)',
  },
  {
    id: 3,
    name: '平靜放鬆',
    key: 'relaxed',
    color: '#7FC8A9',
    bgColor: 'rgba(127, 200, 169, 0.08)',
  },
  {
    id: 4,
    name: '憤怒不快',
    key: 'angry',
    color: '#FF6B6B',
    bgColor: 'rgba(255, 107, 107, 0.08)',
  },
  {
    id: 5,
    name: '悲傷低落',
    key: 'depressed',
    color: '#A0A0C0',
    bgColor: 'rgba(160, 160, 192, 0.08)',
  },
  {
    id: 6,
    name: '滿足愉悅',
    key: 'satisfied',
    color: '#FFD93D',
    bgColor: 'rgba(255, 217, 61, 0.08)',
  },
];

// 漸層配置
export const GRADIENTS = {
  titleGradient: {
    colors: ['#166CB5', '#31C6FE'],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 0 },
  },
};