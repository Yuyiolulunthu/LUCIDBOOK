// ==========================================
// 檔案名稱: AboutUs.js
// 功能: 關於我們頁面
// 
// ✅ 漸層 Header
// ✅ Hero 區塊 + 圖片
// ✅ 品牌介紹
// ✅ 我們的相信 (4個卡片)
// ✅ 我們想陪你做的事 (6個功能)
// ✅ 練習哲學 (漸層區塊)
// ✅ 給你的承諾
// ✅ Logo 結尾
// 🎨 依照設計程式風格
// ==========================================

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  StatusBar,
  Image,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const BELIEFS = [
  {
    icon: 'heart',
    title: '每個人都值得被好好照顧',
    description: '包含那些不敢說出口的疲憊與脆弱。',
    color: '#FF9A8B',
    bgColor: 'rgba(255, 154, 139, 0.08)',
  },
  {
    icon: 'leaf',
    title: '成長可以輕柔、不急不躁',
    description: '心理肌力是慢慢練出來的。',
    color: '#7FC8A9',
    bgColor: 'rgba(127, 200, 169, 0.08)',
  },
  {
    icon: 'hand-left',
    title: '不需要完美，也不需要一次做到很多',
    description: '今天的三分鐘，也是禮物。',
    color: '#A8C5DD',
    bgColor: 'rgba(168, 197, 221, 0.08)',
  },
  {
    icon: 'compass',
    title: '向前的一小步，都算進步',
    description: '我們陪你走得輕一點、慢一點。',
    color: '#FFD93D',
    bgColor: 'rgba(255, 217, 61, 0.08)',
  },
];

const HELPS = [
  { icon: 'water', label: '調節情緒', color: '#31C6FE' },
  { icon: 'bulb', label: '緩和壓力', color: '#7FC8A9' },
  { icon: 'moon', label: '改善睡眠', color: '#A8C5DD' },
  { icon: 'eye', label: '找回專注', color: '#FFD93D' },
  { icon: 'happy', label: '在關係與工作中更自在', color: '#FF9A8B' },
  { icon: 'people', label: '重建與自己的連結', color: '#95E1D3' },
];

const AboutUs = ({ navigation }) => {

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar barStyle="light-content" backgroundColor="#166CB5" />
      
      {/* Header */}
      <LinearGradient
        colors={['#166CB5', '#31C6FE']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <Ionicons name="chevron-back" size={24} color="#FFF" />
          </TouchableOpacity>
          
          <Text style={styles.headerTitle}>關於我們</Text>
          
          <View style={styles.headerPlaceholder} />
        </View>
      </LinearGradient>

      {/* Content */}
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 1. Hero Section */}
        <View style={styles.heroSection}>
          {/* Hero Image */}
          <View style={styles.heroImageContainer}>
            <Image
              source={{ uri: 'https://images.unsplash.com/photo-1727518701131-4182a21562e9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080' }}
              style={styles.heroImage}
              resizeMode="cover"
            />
            <LinearGradient
              colors={['transparent', 'rgba(22,108,181,0.3)']}
              style={styles.heroOverlay}
            />
          </View>

          {/* Hero Text */}
          <View style={styles.heroTextContainer}>
            <Text style={styles.heroTitle}>讓心慢下來的地方</Text>
            <Text style={styles.heroSubtitle}>
              路晰書 LucidBook 陪你一點一點，{'\n'}練出心理肌力。
            </Text>
          </View>
        </View>

        {/* 2. Brand Introduction */}
        <View style={styles.brandSection}>
          <View style={styles.brandCard}>
            {/* Image */}
            <View style={styles.brandImageContainer}>
              <Image
                source={{ uri: 'https://images.unsplash.com/photo-1580380151156-f3262074ffa0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080' }}
                style={styles.brandImage}
                resizeMode="cover"
              />
              <LinearGradient
                colors={['transparent', 'rgba(49,198,254,0.2)']}
                style={styles.brandImageOverlay}
              />
            </View>

            {/* Text */}
            <View style={styles.brandTextContainer}>
              <Text style={styles.brandTitle}>
                我們是 <Text style={styles.brandHighlight}>路晰書</Text>
              </Text>
              <Text style={styles.brandText}>
                路晰書相信，心理力量不是靠一次突破，而是每天一點點的溫柔累積。
              </Text>
              <Text style={styles.brandText}>
                透過呼吸、書寫與情緒調節的練習，引導使用者在忙碌的生活裡重新找到節奏與安定。
              </Text>
              <Text style={styles.brandTextHighlight}>
                我們希望在你的生活裡，留下一個可以慢下來、和自己好好相處的小空間。
              </Text>
            </View>
          </View>
        </View>

        {/* 3. Our Beliefs */}
        <View style={styles.beliefsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>我們的相信</Text>
            <Text style={styles.sectionSubtitle}>每一份信念，都是陪伴你的力量</Text>
          </View>

          <View style={styles.beliefsGrid}>
            {BELIEFS.map((belief, index) => (
              <View key={index} style={styles.beliefCard}>
                <View style={[styles.beliefIconContainer, { backgroundColor: belief.bgColor }]}>
                  <Ionicons name={belief.icon} size={28} color={belief.color} />
                </View>
                <Text style={styles.beliefTitle}>{belief.title}</Text>
                <Text style={styles.beliefDescription}>{belief.description}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* 4. What We Help You Do */}
        <View style={styles.helpsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>我們想陪你做的事</Text>
            <Text style={styles.sectionSubtitle}>從小練習開始，重新找回內在的節奏</Text>
          </View>

          <View style={styles.helpsGrid}>
            {HELPS.map((help, index) => (
              <View key={index} style={styles.helpCard}>
                <View style={styles.helpIconContainer}>
                  <Ionicons name={help.icon} size={24} color={help.color} />
                </View>
                <Text style={styles.helpLabel}>{help.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* 5. Daily Practice Philosophy */}
        <View style={styles.philosophySection}>
          <LinearGradient
            colors={['#166CB5', '#31C6FE']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.philosophyCard}
          >
            {/* Image */}
            <View style={styles.philosophyImageContainer}>
              <Image
                source={{ uri: 'https://images.unsplash.com/photo-1630997065202-afb8c444da0a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080' }}
                style={styles.philosophyImage}
                resizeMode="cover"
              />
              <LinearGradient
                colors={['rgba(22,108,181,0.4)', 'transparent']}
                style={styles.philosophyImageOverlay}
              />
            </View>

            {/* Text */}
            <View style={styles.philosophyTextContainer}>
              <Text style={styles.philosophyTitle}>練習哲學</Text>
              <Text style={styles.philosophyText}>
                在路晰書，我們相信「心理肌力」是透過一點一點的日常練習累積而來的。
              </Text>
              <Text style={styles.philosophyText}>
                不需要勉強、不需要一次完成所有事情。
              </Text>
              <Text style={styles.philosophyTextBold}>
                我們陪你，把那些被忽略的感受重新接住。
              </Text>
            </View>
          </LinearGradient>
        </View>

        {/* 6. Our Promise */}
        <View style={styles.promiseSection}>
          <View style={styles.promiseCard}>
            <View style={styles.promiseIconContainer}>
              <LinearGradient
                colors={['#166CB5', '#31C6FE']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.promiseIconGradient}
              >
                <Ionicons name="heart" size={32} color="#FFF" />
              </LinearGradient>
            </View>
            
            <Text style={styles.promiseTitle}>給你的承諾</Text>
            
            <View style={styles.promiseTextContainer}>
              <Text style={styles.promiseText}>你準備好的時候，我們就在這裡</Text>
              <Text style={styles.promiseText}>我們會陪你一起練習</Text>
              <Text style={styles.promiseText}>讓你的每一步都更安定、更踏實</Text>
              <Text style={styles.promiseTextHighlight}>
                路晰書是你心裡的一座安穩據點
              </Text>
            </View>
          </View>
        </View>

        {/* 7. Logo + Signature Closing */}
        <View style={styles.closingSection}>
          {/* Logo */}
          <View style={styles.logoContainer}>
            <LinearGradient
              colors={['#166CB5', '#31C6FE']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.logoGradient}
            >
              <Ionicons name="book" size={36} color="#FFF" />
            </LinearGradient>
          </View>

          <Text style={styles.closingTitle}>路晰書 LucidBook</Text>
          <Text style={styles.closingSubtitle}>
            陪你一起練習，{'\n'}一起變得更舒適、更踏實。
          </Text>

          {/* Version Info */}
          <View style={styles.versionContainer}>
            <Text style={styles.versionText}>路晰書 LucidBook v1.0.0</Text>
            <Text style={styles.versionText}>© 2025 LucidBook. All rights reserved.</Text>
          </View>
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E9EFF6',
  },

  // Header
  header: {
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 20,
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
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFF',
  },
  headerPlaceholder: {
    width: 40,
  },

  // ScrollView
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },

  // Hero Section
  heroSection: {
    paddingHorizontal: 20,
    paddingTop: 24,
    alignItems: 'center',
  },
  heroImageContainer: {
    width: '100%',
    aspectRatio: 4 / 3,
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 10,
    marginBottom: 24,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  heroTextContainer: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: '300',
    color: '#2D3748',
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  heroSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
  },

  // Brand Section
  brandSection: {
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  brandCard: {
    backgroundColor: 'rgba(255,255,255,0.6)',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  brandImageContainer: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  brandImage: {
    width: '100%',
    height: '100%',
  },
  brandImageOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  brandTextContainer: {
    gap: 12,
  },
  brandTitle: {
    fontSize: 24,
    fontWeight: '300',
    color: '#2D3748',
    marginBottom: 8,
  },
  brandHighlight: {
    fontWeight: '600',
    color: '#166CB5',
  },
  brandText: {
    fontSize: 15,
    color: '#4A5568',
    lineHeight: 24,
  },
  brandTextHighlight: {
    fontSize: 15,
    color: '#166CB5',
    lineHeight: 24,
  },

  // Beliefs Section
  beliefsSection: {
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  sectionHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '300',
    color: '#2D3748',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  beliefsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  beliefCard: {
    width: (SCREEN_WIDTH - 52) / 2,
    backgroundColor: 'rgba(255,255,255,0.6)',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  beliefIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  beliefTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: '#2D3748',
    marginBottom: 8,
    lineHeight: 22,
  },
  beliefDescription: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 20,
  },

  // Helps Section
  helpsSection: {
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  helpsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  helpCard: {
    width: (SCREEN_WIDTH - 64) / 3,
    backgroundColor: 'rgba(255,255,255,0.6)',
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  helpIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(22,108,181,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  helpLabel: {
    fontSize: 12,
    color: '#4A5568',
    textAlign: 'center',
    lineHeight: 18,
  },

  // Philosophy Section
  philosophySection: {
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  philosophyCard: {
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 10,
  },
  philosophyImageContainer: {
    width: '100%',
    aspectRatio: 1,
  },
  philosophyImage: {
    width: '100%',
    height: '100%',
  },
  philosophyImageOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  philosophyTextContainer: {
    padding: 24,
    gap: 12,
  },
  philosophyTitle: {
    fontSize: 24,
    fontWeight: '300',
    color: '#FFF',
    marginBottom: 8,
  },
  philosophyText: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.95)',
    lineHeight: 24,
  },
  philosophyTextBold: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFF',
    lineHeight: 24,
  },

  // Promise Section
  promiseSection: {
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  promiseCard: {
    backgroundColor: 'rgba(255,255,255,0.6)',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  promiseIconContainer: {
    marginBottom: 16,
  },
  promiseIconGradient: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#166CB5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  promiseTitle: {
    fontSize: 24,
    fontWeight: '300',
    color: '#2D3748',
    marginBottom: 20,
  },
  promiseTextContainer: {
    alignItems: 'center',
    gap: 8,
  },
  promiseText: {
    fontSize: 16,
    color: '#4A5568',
    textAlign: 'center',
    lineHeight: 24,
  },
  promiseTextHighlight: {
    fontSize: 18,
    color: '#166CB5',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 26,
  },

  // Closing Section
  closingSection: {
    paddingHorizontal: 20,
    paddingTop: 40,
    alignItems: 'center',
  },
  logoContainer: {
    marginBottom: 16,
  },
  logoGradient: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#166CB5',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
  },
  closingTitle: {
    fontSize: 24,
    fontWeight: '500',
    color: '#166CB5',
    marginBottom: 12,
  },
  closingSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  versionContainer: {
    alignItems: 'center',
    gap: 4,
  },
  versionText: {
    fontSize: 12,
    color: '#9CA3AF',
  },

  bottomPadding: {
    height: 40,
  },
});

export default AboutUs;