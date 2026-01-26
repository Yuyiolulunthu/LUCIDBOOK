// ==========================================
// 檔案名稱: src/screens/home/WorkplaceCommunicationPlanIntroScreen.js
// 職場溝通力計劃介紹頁面
// 版本: V2.0 - 更新 Header 和圖片樣式，採用主頁練習單元設計
// ==========================================

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  StatusBar,
  Image,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  ArrowLeft, 
  Calendar, 
  ClipboardList, 
  Clock, 
  RotateCw,
  ArrowRight,
} from 'lucide-react-native';
import {
  RotateCcw,
  Ear,
  Languages,
  Snowflake,
  TrendingUp,
  Target,
  Users,
  MessageCircle,
} from 'lucide-react-native';

// ==========================================
// 練習單元卡片組件（完全照搬主頁設計）
// ==========================================
const PracticeModuleCard = ({ module, onStartPractice }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const Icon = module.icon;

  return (
    <View style={styles.moduleCard}>
      {/* 上半部：內容區域 */}
      <View style={styles.moduleContentWrapper}>
        {/* 頂部：Icon + 標題 + 標籤 */}
        <View style={styles.moduleHeaderRow}>
          {/* 左側：Icon + 標題 */}
          <View style={styles.moduleTitleSection}>
            <View style={[styles.moduleIconSmall, { backgroundColor: module.iconBg }]}>
              <Icon color={module.iconColor} size={20} strokeWidth={2} />
            </View>
            <Text style={styles.moduleTitle}>{module.title}</Text>
          </View>
          
          {/* 右側：時間和進度標籤 */}
          <View style={styles.moduleMetaGroup}>
            <View style={styles.moduleMetaTag}>
              <Clock color="#9CA3AF" size={12} />
              <Text style={styles.moduleDuration}>{module.duration}</Text>
            </View>
            <View style={styles.moduleProgressTag}>
              <Text style={styles.moduleProgressText}>{module.progress}</Text>
            </View>
          </View>
        </View>

        {/* 標籤（未展開時顯示）*/}
        {!isExpanded && (
          <View style={styles.tagsContainer}>
            {module.tags.map((tag, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>#{tag}</Text>
              </View>
            ))}
          </View>
        )}

        {/* 展開的描述 */}
        {isExpanded && (
          <Animated.View style={styles.descriptionContainer}>
            <Text style={styles.descriptionText}>{module.description}</Text>
          </Animated.View>
        )}
      </View>

      {/* 下半部：按鈕組 */}
      <View style={styles.buttonRow}>
        <TouchableOpacity
          onPress={() => setIsExpanded(!isExpanded)}
          style={[
            styles.detailButton,
            isExpanded && styles.detailButtonActive,
          ]}
          activeOpacity={0.8}
        >
          <Text
            style={[
              styles.detailButtonText,
              isExpanded && styles.detailButtonTextActive,
            ]}
          >
            練習內涵
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => onStartPractice(module.id)}
          style={styles.startButton}
          activeOpacity={0.8}
        >
          <Text style={styles.startButtonText}>開始練習</Text>
          <ArrowRight color="#FF8C42" size={16} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

// ==========================================
// 主組件
// ==========================================
const WorkplaceCommunicationPlanIntroScreen = ({ navigation }) => {
  // 問題卡片數據
  const problemCards = [
    {
      id: 1,
      title: '害怕衝突',
      description: '總是把話吞回去',
      image: require('../../../assets/images/workplace1.png'),
    },
    {
      id: 2,
      title: '溝通困境',
      description: '覺得別人聽不懂你的重點,反覆解釋很心累',
      image: require('../../../assets/images/workplace2.png'),
    },
    {
      id: 3,
      title: '過度內耗',
      description: '對於負面回應過度在意,結果影響工作心情',
      image: require('../../../assets/images/workplace3.png'),
    },
  ];

  // 訓練內容卡片
  const trainingContent = [
    {
      icon: Calendar,
      iconBg: '#FFF5E6',
      iconColor: '#FF8C42',
      title: '四個訓練單元',
    },
    {
      icon: ClipboardList,
      iconBg: '#FFE8E8',
      iconColor: '#FF6B6B',
      title: '溝通風格自我覺察',
    },
    {
      icon: Clock,
      iconBg: '#E8F5E8',
      iconColor: '#4CAF50',
      title: '每次練習3-15分鐘',
    },
    {
      icon: RotateCw,
      iconBg: '#E8F0FF',
      iconColor: '#4A90E2',
      title: '建議每週練習兩次',
    },
  ];

  // 你將獲得卡片
  const benefits = [
    {
      icon: TrendingUp,
      iconBg: '#F9FAFB',
      iconColor: '#4A5565',
      title: '提升溝通自信',
    },
    {
      icon: Target,
      iconBg: '#F9FAFB',
      iconColor: '#4A5565',
      title: '化解職場衝突',
    },
    {
      icon: Users,
      iconBg: '#F9FAFB',
      iconColor: '#4A5565',
      title: '建立信任關係',
    },
    {
      icon: MessageCircle,
      iconBg: '#F9FAFB',
      iconColor: '#4A5565',
      title: '清晰表達想法',
    },
  ];

  // 適合對象標籤
  const targetAudience = [
    '害怕公開發言',
    '容易與同事起衝突',
    '覺得自己說話沒份量',
    '希望提升領導力',
  ];

  // 練習單元
  const practiceModules = [
    {
      id: 'stop-internal-friction',
      title: '內耗終止鍵',
      icon: RotateCcw,
      iconBg: '#F3E8FF',
      iconColor: '#A855F7',
      duration: '5分鐘',
      progress: '0/3',
      tags: ['焦慮', '在乎他人反應', '情緒調節力'],
      description: '當他人的反應令你內耗不適，或是懷疑自己被針對，陷入焦慮，那麼這個練習很適合你一探究竟',
    },
    {
      id: 'empathy-mind-reading',
      title: '同理讀心術',
      icon: Ear,
      iconBg: '#FCE7F3',
      iconColor: '#EC4899',
      duration: '7分鐘',
      progress: '0/3',
      tags: ['關係卡關', '覺得被針對', '同理心', '關係提升'],
      description: '如果因為他人的反應而感到難受，或是想要敞下敵意，修復與對方的關係，請點擊練習',
    },
    {
      id: 'communication-translator',
      title: '溝通轉譯器',
      icon: Languages,
      iconBg: '#FEF3C7',
      iconColor: '#F59E0B',
      duration: '8分鐘',
      progress: '0/3',
      tags: ['委屈', '非暴力溝通', '開不了口', '怕衝突'],
      description: '覺得委屈卻又不知道如何開口嗎？想提要求卻又怕與人起衝突？來這裡就對了',
    },
    {
      id: 'emotional-resilience',
      title: '理智回穩力',
      icon: Snowflake,
      iconBg: '#DBEAFE',
      iconColor: '#3B82F6',
      duration: '4分鐘',
      progress: '0/3',
      tags: ['理智斷線', '情緒降溫', '憤怒難耐'],
      description: '當你覺得情緒焦慮、理智快要斷掉，或是被激怒、想立刻反擊的時候，先進來靜靜吧',
    },
  ];

  const handleStartPractice = (practiceId) => {
    console.log('🎯 [職場溝通介紹] 開始練習:', practiceId);
    // TODO: 導航到對應練習
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#166CB5" />

      {/* ⭐ 自定義 Header - 藍色漸層 + 返回按鈕 */}
      <LinearGradient
        colors={['#166CB5', '#31C6FE']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          {/* 左側：返回按鈕 */}
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
            activeOpacity={0.8}
          >
            <ArrowLeft color="#FFFFFF" size={24} />
          </TouchableOpacity>

          {/* 中間：Logo */}
          <View style={styles.logoContainer}>
            <Image
              source={require('../../../assets/images/lucidlogo.png')}
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={styles.logoText}>LUCIDBOOK</Text>
          </View>

          {/* 右側：佔位符（保持對稱）*/}
          <View style={styles.headerPlaceholder} />
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* 主標題區域 */}
        <View style={styles.titleSection}>
          <Text style={styles.mainTitle}>職場溝通力計劃 計劃介紹</Text>
          <Text style={styles.subtitle}>經常在職場溝通中感到困擾嗎?</Text>
        </View>

        {/* 問題卡片區域 */}
        <View style={styles.problemCardsSection}>
          {problemCards.map((card) => (
            // ⭐ 外層：負責陰影
            <View key={card.id} style={styles.problemCardShadowWrapper}>
              {/* ⭐ 內層：負責內容和裁切 */}
              <View style={styles.problemCard}>
                <View style={styles.problemCardContent}>
                  <Text style={styles.problemCardTitle}>{card.title}</Text>
                  <Text style={styles.problemCardDescription}>
                    {card.description}
                  </Text>
                </View>
                <Image source={card.image} style={styles.problemCardImage} />
              </View>
            </View>
          ))}
        </View>

        {/* 說明文字 */}
        <View style={styles.descriptionSection}>
          <Text style={styles.descriptionText}>
            溝通不僅是說話的技巧,更是心理素質的展現。
          </Text>
          <Text style={styles.descriptionText}>
            這份計畫將幫助你建立穩定的溝通心態,學會如何「好好說話」與「深度傾聽」。
          </Text>
          <Text style={styles.descriptionText}>
            透過練習,你將能更有自信地表達想法,並在衝突中保持冷靜,建立良好的職場人際關係。
          </Text>
        </View>

        {/* 訓練內容 */}
        <Text style={styles.sectionTitle}>訓練內容</Text>
        <View style={styles.trainingContentSection}>
          {trainingContent.map((item, index) => {
            const Icon = item.icon;
            return (
              <View key={index} style={styles.trainingContentCard}>
                <View
                  style={[
                    styles.trainingContentIcon,
                    { backgroundColor: item.iconBg },
                  ]}
                >
                  <Icon color={item.iconColor} size={24} strokeWidth={2} />
                </View>
                <Text style={styles.trainingContentTitle}>{item.title}</Text>
              </View>
            );
          })}
        </View>

        {/* 你將獲得 */}
        <Text style={styles.sectionTitle}>你將獲得</Text>
        <View style={styles.benefitsSection}>
          {benefits.map((item, index) => {
            const Icon = item.icon;
            return (
              <View key={index} style={styles.benefitCard}>
                <View
                  style={[styles.benefitIcon, { backgroundColor: item.iconBg }]}
                >
                  <Icon color={item.iconColor} size={25} strokeWidth={2} />
                </View>
                <Text style={styles.benefitTitle}>{item.title}</Text>
              </View>
            );
          })}
        </View>

        {/* 適合對象 */}
        <Text style={styles.sectionTitle}>適合對象</Text>
        <View style={styles.targetAudienceSection}>
          {targetAudience.map((tag, index) => (
            <View key={index} style={styles.targetAudienceCard}>
              <View style={styles.bulletPoint} />
              <Text style={styles.targetAudienceText}>{tag}</Text>
            </View>
          ))}
        </View>

        {/* ⭐ 練習單元 - 使用主頁設計 */}
        <Text style={styles.sectionTitle}>練習單元</Text>
        <View style={styles.practiceModulesSection}>
          {practiceModules.map((module) => (
            <PracticeModuleCard
              key={module.id}
              module={module}
              onStartPractice={handleStartPractice}
            />
          ))}
        </View>

        {/* 底部間距 */}
        <View style={styles.bottomPadding} />
      </ScrollView>
    </View>
  );
};

// ==========================================
// 樣式定義
// ==========================================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  // ========== ⭐ 自定義 Header ==========
  header: {
    paddingTop: 55,
    paddingBottom: 12,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    position: 'absolute',
    left: 0,
    right: 0,
    justifyContent: 'center',
  },
  logo: {
    width: 28,
    height: 28,
  },
  logoText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#FFFFFF',
    letterSpacing: 2,
  },
  headerPlaceholder: {
    width: 40,
  },

  // ========== ScrollView ==========
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
  },

  // ========== 主標題區域 ==========
  titleSection: {
    paddingTop: 24,
    marginBottom: 24,
  },
  mainTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    lineHeight: 24,
  },

  // ========== ⭐ 問題卡片區域（圖片上下右貼合）==========
  problemCardsSection: {
    marginBottom: 24,
    gap: 12,
  },
  // ⭐ 外層：負責陰影（不設置 overflow）
  problemCardShadowWrapper: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    // ⭐ 陰影效果（與訓練內容相同）
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  // ⭐ 內層：負責內容和裁切圖片
  problemCard: {
    flexDirection: 'row',
    borderRadius: 20,
    padding: 24,
    paddingRight: 0,
    minHeight: 130,
    overflow: 'hidden',  // ⭐ 只在內層裁切圖片
  },
  problemCardContent: {
    flex: 1,
    justifyContent: 'center',
    paddingRight: 20,
  },
  problemCardTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 10,
  },
  problemCardDescription: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 22,
  },
  // ⭐ 圖片：增大尺寸，右上和右下圓角，左邊直線，上下貼合
  problemCardImage: {
    width: 180,
    height: 130,
    borderTopRightRadius: 20,
    borderBottomRightRadius: 20,
    marginRight: -24,
    marginTop: -24,
    marginBottom: -24,
  },

  // ========== 說明文字 ==========
  descriptionSection: {
    marginBottom: 32,
    gap: 12,
  },
  descriptionText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 22,
  },

  // ========== 區段標題 ==========
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
  },

  // ========== 訓練內容 ==========
  trainingContentSection: {
    marginBottom: 32,
    gap: 12,
  },
  trainingContentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  trainingContentIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  trainingContentTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
  },

  // ========== 你將獲得 ==========
  benefitsSection: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 32,
    gap: 12,
  },
  benefitCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  benefitIcon: {
    width: 60,
    height: 60,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  benefitTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    textAlign: 'center',
  },

  // ========== 適合對象 ==========
  targetAudienceSection: {
    marginBottom: 32,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    borderTopWidth: 1.38,
    borderTopColor: '#F3F4F6',
    gap: 16,
  },
  targetAudienceCard: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bulletPoint: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#9CA3AF',
    marginRight: 12,
  },
  targetAudienceText: {
    fontSize: 14,
    color: '#374151',
    flex: 1,
  },

  // ========== ⭐ 練習單元（照搬主頁設計）==========
  practiceModulesSection: {
    marginBottom: 32,
  },
  moduleCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    minHeight: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    justifyContent: 'space-between',
  },
  moduleContentWrapper: {
    flex: 1,
  },
  moduleHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  moduleTitleSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  moduleIconSmall: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  moduleTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    flex: 1,
  },
  moduleMetaGroup: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
  },
  moduleMetaTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  moduleDuration: {
    fontSize: 11,
    color: '#6B7280',
    fontWeight: '500',
  },
  moduleProgressTag: {
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  moduleProgressText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#374151',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 18,
    alignItems: 'flex-start',
  },
  tag: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 100,
  },
  tagText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '400',
  },
  descriptionContainer: {
    marginBottom: 18,
  },
  descriptionText: {
    fontSize: 13,
    color: '#374151',
    lineHeight: 20,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  detailButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#FF8C42',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
  },
  detailButtonActive: {
    backgroundColor: '#FF8C42',
  },
  detailButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FF8C42',
  },
  detailButtonTextActive: {
    color: '#FFFFFF',
  },
  startButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#FF8C42',
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  startButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FF8C42',
  },

  // 底部間距
  bottomPadding: {
    height: 40,
  },
});

export default WorkplaceCommunicationPlanIntroScreen;