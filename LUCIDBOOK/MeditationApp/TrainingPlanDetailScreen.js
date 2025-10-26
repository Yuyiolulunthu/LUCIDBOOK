import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const TrainingPlanDetailScreen = ({ route, navigation }) => {
  const { plan } = route.params;

  const trainingDetails = {
    introduction: `你有這些「心累瞬間」嗎？

• 專案臨時變動，情緒轉不過來，工作節奏全亂？
• 凡事追求完美，執著很多細節，耗掉大半精神與時間？
• 一句批評或建議，就讓你懷疑自己、壓力瞬間飆高？

其實，有這些感受的你，真的很正常！

能觀察到自己有這些感受，也代表你已踏出改變的第一步：覺察。

這份訓練計畫，你將學會身心科醫師與心理師都認可的「心理肌力訓練」方法，幫助你在工作高壓、情緒高張力的情境下，仍能快速調整心態、降低內耗、維持穩定輸出與表現！`,
    whatToExpect: [
      { icon: 'calendar-outline', text: `${plan.unitCount} 個訓練單元` },
      { icon: 'time-outline', text: '每單元 5-10 分鐘' },
      { icon: 'trending-up-outline', text: '循序漸進的訓練' },
    ],
    whatYouGain: [
      '提升情緒調節能力',
      '降低工作內耗',
      '增強心理韌性',
      '改善壓力應對',
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

  return (
    <View style={styles.container}>
      {/* 頂部導航 */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>計畫概覽</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons name="share-outline" size={24} color="#333" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons name="settings-outline" size={24} color="#333" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* 封面圖 */}
        {plan.image && (
          <View style={styles.imageContainer}>
            <Image source={plan.image} style={styles.coverImage} />
            <View style={styles.imageOverlay}>
              <View style={styles.badge}>
                <Ionicons name="layers-outline" size={16} color="#FFF" />
                <Text style={styles.badgeText}>訓練計畫</Text>
              </View>
            </View>
          </View>
        )}

        {/* 標題區 */}
        <View style={styles.titleSection}>
          <Text style={styles.title}>{plan.title}</Text>
          <View style={styles.levelBadge}>
            <Text style={styles.levelText}>{plan.level}</Text>
          </View>
        </View>

        {/* 簡介 */}
        <View style={styles.section}>
          <Text style={styles.introText}>{trainingDetails.introduction}</Text>
        </View>

        {/* 訓練內容 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>訓練內容</Text>
          {trainingDetails.whatToExpect.map((item, index) => (
            <View key={index} style={styles.infoRow}>
              <Ionicons name={item.icon} size={20} color="#4A90E2" />
              <Text style={styles.infoText}>{item.text}</Text>
              <Ionicons name="chevron-forward" size={20} color="#CCC" />
            </View>
          ))}
        </View>

        {/* 你將獲得 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>你將獲得</Text>
          {trainingDetails.whatYouGain.map((gain, index) => (
            <View key={index} style={styles.gainItem}>
              <Ionicons name="trophy-outline" size={20} color="#4A90E2" />
              <Text style={styles.gainText}>{gain}</Text>
            </View>
          ))}
        </View>

        {/* 適合對象 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>適合對象</Text>
          {trainingDetails.targetAudience.map((audience, index) => (
            <View key={index} style={styles.audienceItem}>
              <View style={styles.bullet} />
              <Text style={styles.audienceText}>{audience}</Text>
            </View>
          ))}
        </View>

        {/* 訓練單元列表 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>訓練單元</Text>
          {plan.units.map((unit, index) => (
            <View key={index} style={styles.unitItem}>
              <View style={styles.unitNumber}>
                <Text style={styles.unitNumberText}>{index + 1}</Text>
              </View>
              <Text style={styles.unitText}>{unit}</Text>
            </View>
          ))}
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* 底部按鈕 */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity style={styles.joinButton} onPress={handleJoinNow}>
          <Text style={styles.joinButtonText}>加入訓練</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
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
    borderBottomColor: '#F0F0F0',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  headerRight: {
    flexDirection: 'row',
    gap: 10,
  },
  iconButton: {
    padding: 8,
  },
  content: {
    flex: 1,
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: 250,
  },
  coverImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imageOverlay: {
    position: 'absolute',
    top: 20,
    left: 20,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(74, 144, 226, 0.9)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  badgeText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  titleSection: {
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  title: {
    flex: 1,
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginRight: 10,
  },
  levelBadge: {
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  levelText: {
    fontSize: 12,
    color: '#4A90E2',
    fontWeight: '600',
  },
  section: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  introText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    marginLeft: 12,
  },
  gainItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  gainText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 12,
  },
  audienceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  bullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#4A90E2',
    marginRight: 10,
  },
  audienceText: {
    fontSize: 14,
    color: '#666',
  },
  unitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  unitNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E3F2FD',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  unitNumberText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#4A90E2',
  },
  unitText: {
    flex: 1,
    fontSize: 14,
    color: '#333',
  },
  bottomSpacing: {
    height: 100,
  },
  bottomContainer: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  joinButton: {
    backgroundColor: '#4A90E2',
    borderRadius: 25,
    paddingVertical: 15,
    alignItems: 'center',
  },
  joinButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default TrainingPlanDetailScreen;
