// ==========================================
// 檔案名稱: PrivacyPolicyScreen.js
// 功能: 隱私權政策頁面
// 🎨 統一設計風格
// ✅ 顯示隱私權政策內容
// ✅ 「我已了解」按鈕返回註冊頁並自動打勾
// ==========================================

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const PrivacyPolicyScreen = ({ navigation, route }) => {
  const { fromRegister, savedFormData } = route.params || {};
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);

  // 檢測是否滾動到底部
  const handleScroll = (event) => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    const paddingToBottom = 50;
    if (layoutMeasurement.height + contentOffset.y >= contentSize.height - paddingToBottom) {
      setHasScrolledToBottom(true);
    }
  };

  // 點擊「我已了解」按鈕
  const handleAgree = () => {
    if (fromRegister) {
      // 返回註冊頁面，並帶入同意狀態
      navigation.navigate('Register', {
        agreedFromPrivacy: true,
        savedFormData: savedFormData,
      });
    } else {
      navigation.goBack();
    }
  };

  // 返回按鈕
  const handleGoBack = () => {
    if (fromRegister && savedFormData) {
      navigation.navigate('Register', {
        savedFormData: savedFormData,
        agreedFromPrivacy: false,
      });
    } else {
      navigation.goBack();
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#166CB5" />
      
      {/* Header */}
      <LinearGradient
        colors={['#166CB5', '#31C6FE']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>隱私權政策</Text>
        <View style={styles.headerPlaceholder} />
      </LinearGradient>

      {/* 內容區域 */}
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
        showsVerticalScrollIndicator={true}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        <View style={styles.contentCard}>
          {/* 標題區 */}
          <View style={styles.titleSection}>
            <View style={styles.iconContainer}>
              <Ionicons name="shield-checkmark" size={32} color="#166CB5" />
            </View>
            <Text style={styles.title}>LUCIDBOOK 隱私權政策</Text>
            <Text style={styles.lastUpdated}>最後更新日期：2024 年 1 月</Text>
          </View>

          {/* 政策內容 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>1. 資料收集</Text>
            <Text style={styles.sectionContent}>
              我們收集您提供的個人資訊，包括但不限於：姓名、電子郵件地址、使用習慣數據。
              這些資訊用於提供更好的服務體驗和個人化功能。
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>2. 資料使用</Text>
            <Text style={styles.sectionContent}>
              我們使用收集的資訊來：{'\n'}
              • 提供、維護和改進我們的服務{'\n'}
              • 個人化您的使用體驗{'\n'}
              • 與您溝通有關服務的更新{'\n'}
              • 確保服務的安全性
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>3. 資料保護</Text>
            <Text style={styles.sectionContent}>
              我們採用業界標準的安全措施來保護您的個人資訊，包括加密傳輸、安全存儲和訪問控制。
              我們不會將您的資料出售給第三方。
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>4. 資料存取與刪除</Text>
            <Text style={styles.sectionContent}>
              您有權隨時存取、更正或刪除您的個人資料。如需行使這些權利，請聯繫我們的客戶服務團隊。
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>5. Cookie 政策</Text>
            <Text style={styles.sectionContent}>
              我們使用 Cookie 和類似技術來改善您的使用體驗、分析服務使用情況，並提供個人化內容。
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>6. 第三方服務</Text>
            <Text style={styles.sectionContent}>
              我們的服務可能包含第三方服務的連結或整合。這些第三方服務有其自己的隱私政策，
              我們建議您在使用前閱讀相關政策。
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>7. 兒童隱私</Text>
            <Text style={styles.sectionContent}>
              我們的服務不針對 13 歲以下的兒童。我們不會故意收集 13 歲以下兒童的個人資訊。
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>8. 政策更新</Text>
            <Text style={styles.sectionContent}>
              我們可能會不時更新本隱私權政策。更新後的政策將在本頁面公布，
              重大變更時我們會透過電子郵件或應用程式通知您。
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>9. 聯繫我們</Text>
            <Text style={styles.sectionContent}>
              如果您對本隱私權政策有任何疑問，請透過以下方式聯繫我們：{'\n'}
              電子郵件：privacy@lucidbook.tw{'\n'}
              服務時間：週一至週五 9:00-18:00
            </Text>
          </View>

          {/* 滾動提示 */}
          {!hasScrolledToBottom && (
            <View style={styles.scrollHint}>
              <Ionicons name="chevron-down" size={20} color="#9CA3AF" />
              <Text style={styles.scrollHintText}>向下滾動閱讀完整內容</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* 底部按鈕區 */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity 
          style={styles.agreeButtonContainer}
          onPress={handleAgree}
          activeOpacity={0.9}
        >
          <LinearGradient
            colors={['#166CB5', '#31C6FE']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.agreeButton}
          >
            <Ionicons name="checkmark-circle" size={22} color="#FFFFFF" />
            <Text style={styles.agreeButtonText}>我已了解</Text>
          </LinearGradient>
        </TouchableOpacity>
        
        {fromRegister && (
          <Text style={styles.bottomHint}>
            點擊「我已了解」即表示您同意本隱私權政策
          </Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  headerPlaceholder: {
    width: 40,
  },

  // ScrollView
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    padding: 20,
    paddingBottom: 40,
  },

  // Content Card
  contentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 4,
  },

  // Title Section
  titleSection: {
    alignItems: 'center',
    marginBottom: 24,
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  lastUpdated: {
    fontSize: 13,
    color: '#9CA3AF',
  },

  // Sections
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
  },
  sectionContent: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 22,
  },

  // Scroll Hint
  scrollHint: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  scrollHintText: {
    fontSize: 13,
    color: '#9CA3AF',
    marginLeft: 6,
  },

  // Bottom Container
  bottomContainer: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 34,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 8,
  },
  agreeButtonContainer: {
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#166CB5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  agreeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  agreeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  bottomHint: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: 12,
  },
});

export default PrivacyPolicyScreen;