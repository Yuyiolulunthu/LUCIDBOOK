// ==========================================
// 檔案名稱: TrainingPlanDetailScreen.js
// 訓練計畫詳情頁 - 統一設計風格
// ==========================================

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Wind, PenLine, Target, TrendingUp, Users, Award } from 'lucide-react-native';

const TrainingPlanDetailScreen = ({ route, navigation }) => {
  const { plan } = route.params;

  const trainingDetails = {
    introduction: `你有這些「心累瞬間」嗎？

- 專案臨時變動，情緒轉不過來，工作節奏全亂？
- 凡事追求完美，執著很多細節，耗掉大半精神與時間？
- 一句批評或建議，就讓你懷疑自己、壓力瞬間飆高？

其實，有這些感受的你，真的很正常！

能觀察到自己有這些感受，也代表你已踏出改變的第一步：覺察。

這份訓練計畫，你將學會身心科醫師與心理師都認可的「心理肌力訓練」方法，幫助你在工作高壓、情緒高張力的情境下，仍能快速調整心態、降低內耗、維持穩定輸出與表現！`,
    whatToExpect: [
      { icon: 'calendar-outline', text: '2 個訓練單元', color: '#166CB5' },
      { icon: 'time-outline', text: '每單元 5-10 分鐘', color: '#10B981' },
      { icon: 'repeat-outline', text: '建議每單元完成 3 次', color: '#FF8C42' },
    ],
    whatYouGain: [
      { text: '提升情緒調節能力', icon: TrendingUp },
      { text: '降低工作內耗', icon: Target },
      { text: '增強心理韌性', icon: Award },
      { text: '改善壓力應對', icon: Users },
    ],
    targetAudience: [
      '工作壓力大的上班族',
      '容易焦慮的人',
      '追求完美的人',
      '想提升心理素質的人',
    ],
  };

  const handleJoinNow = () => {
    navigation.navigate('TrainingPlanProgress', { plan });
  };

  const handleFeedback = () => {
    Alert.alert(
      '問題回報',
      '要前往問題回報頁面嗎？',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '前往',
          onPress: () => navigation.navigate('Feedback'),
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* 頂部導航 */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>計畫概覽</Text>
        <TouchableOpacity style={styles.iconButton} onPress={handleFeedback}>
          <Ionicons name="help-circle-outline" size={24} color="#6B7280" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* 標題卡片 */}
        <View style={styles.titleCard}>
          <LinearGradient
            colors={['#8B5CF6', '#31C6FE']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.titleGradient}
          >
            <View style={styles.titleBadge}>
              <Ionicons name="fitness-outline" size={16} color="#FFFFFF" />
              <Text style={styles.titleBadgeText}>訓練計畫</Text>
            </View>
            <Text style={styles.title}>情緒抗壓力計畫</Text>
            <Text style={styles.subtitle}>Anti-Burnout Training Program</Text>
          </LinearGradient>
        </View>

        {/* 簡介 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>計畫介紹</Text>
          <Text style={styles.introText}>{trainingDetails.introduction}</Text>
        </View>

        {/* 訓練內容 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>訓練內容</Text>
          <View style={styles.infoGrid}>
            {trainingDetails.whatToExpect.map((item, index) => (
              <View key={index} style={styles.infoCard}>
                <View style={[styles.infoIconCircle, { backgroundColor: `${item.color}15` }]}>
                  <Ionicons name={item.icon} size={24} color={item.color} />
                </View>
                <Text style={styles.infoText}>{item.text}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* 你將獲得 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>你將獲得</Text>
          <View style={styles.gainGrid}>
            {trainingDetails.whatYouGain.map((item, index) => {
              const IconComponent = item.icon;
              return (
                <View key={index} style={styles.gainCard}>
                  <View style={styles.gainIconCircle}>
                    <IconComponent size={20} color="#166CB5" strokeWidth={2} />
                  </View>
                  <Text style={styles.gainText}>{item.text}</Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* 適合對象 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>適合對象</Text>
          <View style={styles.audienceContainer}>
            {trainingDetails.targetAudience.map((audience, index) => (
              <View key={index} style={styles.audienceItem}>
                <View style={styles.bulletDot} />
                <Text style={styles.audienceText}>{audience}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* 訓練單元列表 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>訓練單元</Text>
          
          {/* 單元 1: 呼吸練習 */}
          <View style={styles.unitCard}>
            <View style={styles.unitHeader}>
              <View style={styles.unitIconCircle}>
                <Wind size={24} color="#166CB5" strokeWidth={2} />
              </View>
              <View style={styles.unitInfo}>
                <Text style={styles.unitTitle}>Week 1 - 呼吸練習</Text>
                <Text style={styles.unitSubtitle}>建立身心連結的基礎</Text>
              </View>
              <View style={styles.unitBadge}>
                <Text style={styles.unitBadgeText}>W1</Text>
              </View>
            </View>
            <View style={styles.unitDivider} />
            <View style={styles.unitFooter}>
              <View style={styles.unitMeta}>
                <Ionicons name="time-outline" size={14} color="#6B7280" />
                <Text style={styles.unitMetaText}>5 分鐘</Text>
              </View>
              <View style={styles.unitMeta}>
                <Ionicons name="repeat-outline" size={14} color="#6B7280" />
                <Text style={styles.unitMetaText}>建議完成 3 次</Text>
              </View>
            </View>
          </View>

          {/* 單元 2: 好事書寫 */}
          <View style={styles.unitCard}>
            <View style={styles.unitHeader}>
              <View style={[styles.unitIconCircle, { backgroundColor: '#FFF7ED' }]}>
                <PenLine size={24} color="#FF8C42" strokeWidth={2} />
              </View>
              <View style={styles.unitInfo}>
                <Text style={styles.unitTitle}>Week 2 - 好事書寫</Text>
                <Text style={styles.unitSubtitle}>培養正向心理資本</Text>
              </View>
              <View style={[styles.unitBadge, { backgroundColor: '#FFF7ED' }]}>
                <Text style={[styles.unitBadgeText, { color: '#FF8C42' }]}>W2</Text>
              </View>
            </View>
            <View style={styles.unitDivider} />
            <View style={styles.unitFooter}>
              <View style={styles.unitMeta}>
                <Ionicons name="time-outline" size={14} color="#6B7280" />
                <Text style={styles.unitMetaText}>10 分鐘</Text>
              </View>
              <View style={styles.unitMeta}>
                <Ionicons name="repeat-outline" size={14} color="#6B7280" />
                <Text style={styles.unitMetaText}>建議完成 3 次</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* 底部按鈕 */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity
          style={styles.joinButtonContainer}
          onPress={handleJoinNow}
          activeOpacity={0.9}
        >
          <LinearGradient
            colors={['#166CB5', '#31C6FE']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.joinButton}
          >
            <Text style={styles.joinButtonText}>開始訓練</Text>
            <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 15,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    textAlign: 'center',
  },
  iconButton: {
    padding: 8,
  },
  content: {
    flex: 1,
  },

  // 標題卡片
  titleCard: {
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#166CB5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  titleGradient: {
    padding: 24,
  },
  titleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 12,
    gap: 6,
  },
  titleBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 6,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500',
  },

  // 區塊
  section: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 16,
  },
  introText: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 24,
  },

  // 訓練內容網格
  infoGrid: {
    gap: 12,
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  infoIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#1F2937',
    fontWeight: '600',
  },

  // 獲得內容網格
  gainGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  gainCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  gainIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  gainText: {
    fontSize: 13,
    color: '#1F2937',
    fontWeight: '600',
    textAlign: 'center',
  },

  // 適合對象
  audienceContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  audienceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  bulletDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#166CB5',
    marginRight: 12,
  },
  audienceText: {
    fontSize: 14,
    color: '#4B5563',
    fontWeight: '500',
  },

  // 訓練單元卡片
  unitCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  unitHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  unitIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  unitInfo: {
    flex: 1,
    marginLeft: 12,
  },
  unitTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 2,
  },
  unitSubtitle: {
    fontSize: 12,
    color: '#6B7280',
  },
  unitBadge: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  unitBadgeText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#166CB5',
  },
  unitDivider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginVertical: 12,
  },
  unitFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  unitMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  unitMetaText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },

  bottomSpacing: {
    height: 100,
  },

  // 底部按鈕
  bottomContainer: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  joinButtonContainer: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#166CB5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  joinButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  joinButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});

export default TrainingPlanDetailScreen;