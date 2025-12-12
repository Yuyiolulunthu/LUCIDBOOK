// ==========================================
// 檔案名稱: src/screens/home/components/PlanDetailsModal.js
// 計劃詳情彈窗 - 完整修復滑動問題
// 版本: V4.0 - 徹底解決滑動卡頓
// ==========================================

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  X,
  Heart,
  Calendar,
  Clock,
  RefreshCw,
  TrendingUp,
  Target,
  Medal,
  User,
  ClipboardCheck,
} from 'lucide-react-native';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const PlanDetailsModal = ({ isOpen, onClose, onStartPlan }) => {
  if (!isOpen) return null;

  return (
    <Modal
      visible={isOpen}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.backdrop}>
        {/* ⭐ 背景遮罩 - 點擊關閉 */}
        <TouchableOpacity 
          style={StyleSheet.absoluteFill}
          activeOpacity={1}
          onPress={onClose}
        />

        {/* ⭐ Modal 內容 - 不處理觸控事件 */}
        <View style={styles.modalContainer} pointerEvents="box-none">
          <View style={styles.modalContent}>
            
            {/* 關閉按鈕 */}
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={onClose}
              activeOpacity={0.7}
            >
              <X color="#FFFFFF" size={20} />
            </TouchableOpacity>

            {/* ⭐ 優化：移除所有嵌套的 TouchableWithoutFeedback */}
            <ScrollView
              style={styles.scrollView}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={true}
              bounces={true}
              scrollEnabled={true}
              nestedScrollEnabled={true}
              removeClippedSubviews={false}
              scrollEventThrottle={16}
              keyboardShouldPersistTaps="handled"
              overScrollMode="always"
            >
              
              {/* Hero Section */}
              <LinearGradient
                colors={['#7F56D9', '#4880EC', '#2CB3F0']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.heroSection}
              >
                <View style={styles.heroTag}>
                  <Heart size={12} color="#FFFFFF" fill="#FFFFFF" />
                  <Text style={styles.heroTagText}>訓練計畫</Text>
                </View>
                
                <Text style={styles.heroTitle}>情緒抗壓力計畫</Text>
                <Text style={styles.heroSubtitle}>Anti-Burnout Training Program</Text>
                
                {/* 裝飾球 */}
                <View style={styles.decorBall1} />
                <View style={styles.decorBall2} />
              </LinearGradient>

              <View style={styles.contentSection}>
                
                {/* 計畫介紹 */}
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>計畫介紹</Text>
                  <Text style={styles.sectionSubtitle}>你有這些「心累瞬間」嗎？</Text>
                  
                  <View style={styles.bulletList}>
                    {[
                      '專案臨時變動，焦慮爆表，工作節奏全亂？',
                      '追求完美、擔心不夠好，耗掉大半精神與時間？',
                      '他人一句建議，讓你自我懷疑停不下來？',
                    ].map((item, index) => (
                      <View key={index} style={styles.bulletItem}>
                        <View style={styles.bullet} />
                        <Text style={styles.bulletText}>{item}</Text>
                      </View>
                    ))}
                  </View>

                  <Text style={styles.descText}>
                    其實，有這些感受的你，很正常。{'\n'}
                    你不孤單。
                  </Text>
                  
                  <Text style={styles.descText}>
                    能觀察到自己有這些感受，也代表你已踏出改變的第一步：覺察。
                  </Text>
                  
                  <Text style={styles.descText}>
                    這份訓練計畫，你將學會科學實證與心理師認可的「心理肌力訓練」方法，幫助你在高壓與變動下，仍能快速調整心態，維持穩定輸出。
                  </Text>
                </View>

                {/* 訓練內容 */}
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>訓練內容</Text>
                  
                  <View style={styles.contentCards}>
                    {[
                      { icon: Calendar, text: '四個訓練單元', color: '#3B82F6', bg: '#EFF6FF' },
                      { icon: ClipboardCheck, text: '一個情緒壓力自我檢測', color: '#A855F7', bg: '#F5F3FF' },
                      { icon: Clock, text: '每次練習1-10分鐘', color: '#10B981', bg: '#D1FAE5' },
                      { icon: RefreshCw, text: '建議一個單元練習三次', color: '#F97316', bg: '#FFEDD5' },
                    ].map((item, index) => (
                      <View key={index} style={styles.contentCard}>
                        <View style={[styles.contentIcon, { backgroundColor: item.bg }]}>
                          <item.icon size={20} color={item.color} />
                        </View>
                        <Text style={styles.contentText}>{item.text}</Text>
                      </View>
                    ))}
                  </View>
                </View>

                {/* 你將獲得 */}
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>你將獲得</Text>
                  
                  <View style={styles.benefitGrid}>
                    {[
                      { icon: TrendingUp, label: '提升情緒調節能力' },
                      { icon: Target, label: '降低工作內耗' },
                      { icon: Medal, label: '增強心理韌性' },
                      { icon: User, label: '改善壓力應對' },
                    ].map((item, index) => (
                      <View key={index} style={styles.benefitCard}>
                        <View style={styles.benefitIcon}>
                          <item.icon size={20} color="#166CB5" />
                        </View>
                        <Text style={styles.benefitText}>{item.label}</Text>
                      </View>
                    ))}
                  </View>
                </View>

                {/* 適合對象 */}
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>適合對象</Text>
                  
                  <View style={styles.audienceCard}>
                    {[
                      '想提升心理素質',
                      '工作壓力大、焦慮緊繃',
                      '難放鬆、失眠困擾',
                      '自律神經失調',
                    ].map((item, index) => (
                      <View key={index} style={styles.audienceItem}>
                        <View style={styles.audienceBullet} />
                        <Text style={styles.audienceText}>{item}</Text>
                      </View>
                    ))}
                  </View>
                </View>

              </View>
            </ScrollView>

            {/* 底部 CTA 按鈕 */}
            <View style={styles.footer}>
              <TouchableOpacity 
                style={styles.ctaButton}
                onPress={onStartPlan}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={['#166CB5', '#31C6FE']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.ctaGradient}
                >
                  <Text style={styles.ctaText}>開始計畫</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>

          </View>
        </View>
      </View>
    </Modal>
  );
};

// ==========================================
// 樣式定義
// ==========================================
const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 440,
    height: SCREEN_HEIGHT * 0.85,
  },
  modalContent: {
    flex: 1,
    backgroundColor: '#FDFDFD',
    borderRadius: 32,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.25,
    shadowRadius: 40,
    elevation: 24,
  },
  
  // 關閉按鈕
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 10,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // ScrollView 優化
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 100,
  },

  // Hero Section
  heroSection: {
    paddingTop: 48,
    paddingBottom: 32,
    paddingHorizontal: 24,
    position: 'relative',
    overflow: 'hidden',
  },
  heroTag: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 100,
    marginBottom: 16,
    gap: 6,
  },
  heroTagText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  heroSubtitle: {
    fontSize: 14,
    fontWeight: '300',
    color: 'rgba(255, 255, 255, 0.9)',
  },
  decorBall1: {
    position: 'absolute',
    top: -20,
    right: -20,
    width: 128,
    height: 128,
    borderRadius: 64,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  decorBall2: {
    position: 'absolute',
    bottom: -20,
    left: -10,
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(100, 149, 237, 0.2)',
  },

  // 內容區域
  contentSection: {
    paddingHorizontal: 24,
    paddingTop: 32,
  },
  section: {
    marginBottom: 40,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333333',
    marginBottom: 16,
  },
  sectionSubtitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4B5563',
    marginBottom: 12,
  },

  // 項目符號列表
  bulletList: {
    marginBottom: 24,
    gap: 12,
  },
  bulletItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  bullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#93C5FD',
    marginTop: 6,
  },
  bulletText: {
    flex: 1,
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 22,
  },
  descText: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 22,
    marginBottom: 16,
    textAlign: 'justify',
  },

  // 訓練內容卡片
  contentCards: {
    gap: 12,
  },
  contentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F3F4F6',
    borderRadius: 16,
    padding: 16,
    gap: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  contentIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },

  // 你將獲得網格
  benefitGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  benefitCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F3F4F6',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  benefitIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  benefitText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1F2937',
    textAlign: 'center',
  },

  // 適合對象
  audienceCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F3F4F6',
    borderRadius: 16,
    padding: 24,
    gap: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  audienceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  audienceBullet: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#166CB5',
  },
  audienceText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: '#1F2937',
  },

  // 底部按鈕
  footer: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  ctaButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#166CB5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  ctaGradient: {
    paddingVertical: 14,
    alignItems: 'center',
  },
  ctaText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});

export default PlanDetailsModal;