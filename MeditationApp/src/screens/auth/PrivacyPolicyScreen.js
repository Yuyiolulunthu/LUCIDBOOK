// ==========================================
// 檔案名稱: PrivacyPolicyScreen.js
// 功能: 隱私權政策頁面
// 🎨 統一設計風格
// ✅ 顯示隱私權政策內容
// ✅✅✅ 終極修正版：絕對嚴格的滾動檢測 ✅✅✅
// 核心改進:
// 1. 降低自動啟用閾值 (200px → 50px)
// 2. 添加安全檢查，防止誤判
// 3. 更詳細的 console.log 調試信息
// 4. 確保初始狀態正確
// ==========================================

import React, { useState, useRef, useEffect } from 'react';
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
  
  // 狀態管理
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
  const [scrollViewHeight, setScrollViewHeight] = useState(0);
  const [contentHeight, setContentHeight] = useState(0);
  const [isScrollable, setIsScrollable] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false); // ⭐ 新增：追蹤初始化狀態
  
  const scrollViewRef = useRef(null);

  // ⭐ 新增：組件掛載時記錄
  useEffect(() => {
    console.log('🎬 [隱私條款] 頁面載入');
    console.log('   fromRegister:', fromRegister);
    console.log('   savedFormData:', savedFormData ? 'exists' : 'null');
    
    return () => {
      console.log('👋 [隱私條款] 頁面卸載');
    };
  }, []);

  // ✅ 當 ScrollView 布局完成時記錄高度
  const handleScrollViewLayout = (event) => {
    const { height } = event.nativeEvent.layout;
    
    console.log('📐 [隱私條款] ScrollView 高度變化:', {
      新高度: height,
      舊高度: scrollViewHeight,
      首次設定: scrollViewHeight === 0,
    });
    
    setScrollViewHeight(height);
  };

  // ✅ 當內容大小改變時檢查是否需要滾動
  const handleContentSizeChange = (width, height) => {
    console.log('\n📏 [隱私條款] 內容大小變化:', {
      內容高度: height,
      視窗高度: scrollViewHeight,
      高度差: height - scrollViewHeight,
      是否已初始化: isInitialized,
    });

    setContentHeight(height);
    
    // ⭐⭐⭐ 關鍵修改 1: 降低閾值從 200px 到 50px
    // 只有當內容高度「明顯」大於視窗時才需要滾動
    const threshold = 50; // 降低閾值，更嚴格判斷
    const heightDifference = height - scrollViewHeight;
    const needsScroll = heightDifference > threshold;
    
    console.log('🔍 [隱私條款] 滾動需求判斷:', {
      內容高度: height,
      視窗高度: scrollViewHeight,
      高度差: heightDifference,
      閾值: threshold,
      需要滾動: needsScroll,
      判斷依據: needsScroll ? '內容超出視窗' : '內容完全可見',
    });
    
    setIsScrollable(needsScroll);
    
    // ⭐⭐⭐ 關鍵修改 2: 添加多重安全檢查
    if (!needsScroll && scrollViewHeight > 0) {
      // 只有在確定不需要滾動時才自動啟用
      console.log('✅ [隱私條款] 內容完全可見，自動啟用按鈕');
      setHasScrolledToBottom(true);
    } else if (needsScroll) {
      // 如果需要滾動，確保按鈕是禁用的
      console.log('🔒 [隱私條款] 需要滾動，按鈕保持禁用');
      setHasScrolledToBottom(false);
    }
    
    // ⭐ 標記為已初始化
    if (!isInitialized && scrollViewHeight > 0) {
      setIsInitialized(true);
      console.log('✅ [隱私條款] 初始化完成');
    }
  };

  // ✅ 滾動事件處理
  const handleScroll = (event) => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    
    // ⭐⭐⭐ 關鍵修改 3: 更精確的底部檢測 (只允許 3px 誤差)
    const paddingToBottom = 3; // 從 5px 降低到 3px
    const distanceToBottom = contentSize.height - (layoutMeasurement.height + contentOffset.y);
    const isAtBottom = distanceToBottom <= paddingToBottom;
    
    // ⭐ 只在必要時輸出日誌 (避免刷屏)
    if (Math.abs(contentOffset.y) % 50 < 10) { // 每 50px 輸出一次
      console.log('📊 [隱私條款] 滾動位置:', {
        當前位置: Math.round(contentOffset.y),
        視窗高度: Math.round(layoutMeasurement.height),
        內容總高度: Math.round(contentSize.height),
        距離底部: Math.round(distanceToBottom),
        到達底部: isAtBottom,
        需要滾動: isScrollable,
        按鈕狀態: hasScrolledToBottom ? '已啟用' : '禁用中',
      });
    }
    
    // ✅✅✅ 最終判斷：必須同時滿足三個條件
    if (isScrollable && isAtBottom && !hasScrolledToBottom) {
      console.log('\n✅✅✅ [隱私條款] 達成啟用條件:');
      console.log('   ✓ 需要滾動: true');
      console.log('   ✓ 到達底部: true');
      console.log('   ✓ 尚未啟用: true');
      console.log('   → 啟用「我已了解」按鈕\n');
      setHasScrolledToBottom(true);
    }
  };

  // 點擊「我已了解」按鈕
  const handleAgree = () => {
    console.log('🎯 [隱私條款] 用戶點擊「我已了解」');
    console.log('   hasScrolledToBottom:', hasScrolledToBottom);
    console.log('   isScrollable:', isScrollable);
    
    if (!hasScrolledToBottom) {
      console.warn('⚠️ [隱私條款] 按鈕應該是禁用的，但被點擊了！');
      return;
    }
    
    if (fromRegister) {
      console.log('   → 返回註冊頁面，傳遞 agreedFromPrivacy=true');
      navigation.navigate({
        name: 'Register',
        params: {
          savedFormData: savedFormData,
          agreedFromPrivacy: true, // ⭐ 關鍵參數
        },
        merge: true,
      });
    } else {
      console.log('   → 返回上一頁');
      navigation.goBack();
    }
  };

  // 返回按鈕
  const handleGoBack = () => {
    console.log('◀️ [隱私條款] 用戶點擊返回');
    
    if (fromRegister && savedFormData) {
      navigation.navigate({
        name: 'Register',
        params: {
          savedFormData: savedFormData,
          agreedFromPrivacy: false, // 未同意
        },
        merge: true,
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

      {/* ⭐ 調試信息面板 (開發時可見，正式版可移除) */}
      {__DEV__ && (
        <View style={styles.debugPanel}>
          <Text style={styles.debugText}>
            🔧 調試: {isScrollable ? '需滾動' : '無需滾動'} | 
            按鈕: {hasScrolledToBottom ? '✅啟用' : '🔒禁用'} | 
            高度差: {Math.round(contentHeight - scrollViewHeight)}px
          </Text>
        </View>
      )}

      {/* 內容區域 */}
      <ScrollView 
        ref={scrollViewRef}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
        showsVerticalScrollIndicator={true}
        onScroll={handleScroll}
        onContentSizeChange={handleContentSizeChange}
        onLayout={handleScrollViewLayout}
        scrollEventThrottle={16}
      >
        <View style={styles.contentCard}>
          {/* 標題區 */}
          <View style={styles.titleSection}>
            <View style={styles.iconContainer}>
              <Ionicons name="shield-checkmark" size={32} color="#166CB5" />
            </View>
            <Text style={styles.title}>LUCIDBOOK 隱私權政策</Text>
            <Text style={styles.lastUpdated}>最後更新日期：2025 年 1 月 19 日</Text>
          </View>

          {/* 政策內容 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>您的心理健康值得被認真對待</Text>
            <Text style={styles.sectionContent}>
              您在本 App 中留下的每一份記錄—無論是一行反思、一次深呼吸、或是一個自我評分—都屬於您自己。
              {'\n\n'}
              我們承諾，以透明、友善、穩固的方式守護您的每一份資料。
              請花一點時間閱讀這份政策，它會告訴您，我們如何收集、保護、使用、與分享您的資訊。
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>1. 資料收集</Text>
            <Text style={styles.sectionContent}>
              我們收集您提供的個人資訊，包括但不限於：姓名、電子郵件地址、使用習慣數據。
              這些資訊用於提供更好的服務體驗和個人化功能。
              {'\n\n'}
              我們也會記錄您的練習歷程、心情記錄等資料，以便為您提供更精準的分析和建議。
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>2. 資料使用</Text>
            <Text style={styles.sectionContent}>
              我們使用收集的資訊來：{'\n'}
              • 提供、維護和改進我們的服務{'\n'}
              • 個人化您的使用體驗{'\n'}
              • 與您溝通有關服務的更新{'\n'}
              • 確保服務的安全性{'\n'}
              • 進行匿名化的統計分析以改善產品
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>3. 資料保護</Text>
            <Text style={styles.sectionContent}>
              我們採用業界標準的安全措施來保護您的個人資訊，包括加密傳輸、安全存儲和訪問控制。
              我們不會將您的資料出售給第三方。
              {'\n\n'}
              所有敏感資料都經過加密處理，並且只有經過授權的人員才能訪問。
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>4. 資料存取與刪除</Text>
            <Text style={styles.sectionContent}>
              您有權隨時存取、更正或刪除您的個人資料。如需行使這些權利，請聯繫我們的客戶服務團隊。
              {'\n\n'}
              您可以隨時在 App 內的設定頁面中，查看和管理您的個人資料。
              如果您選擇刪除帳號，我們會在 30 天內完全刪除您的所有資料。
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>5. Cookie 政策</Text>
            <Text style={styles.sectionContent}>
              我們使用 Cookie 和類似技術來改善您的使用體驗、分析服務使用情況，並提供個人化內容。
              {'\n\n'}
              您可以在瀏覽器設定中選擇拒絕 Cookie，但這可能會影響某些功能的正常使用。
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>6. 第三方服務</Text>
            <Text style={styles.sectionContent}>
              我們的服務可能包含第三方服務的連結或整合。這些第三方服務有其自己的隱私政策，
              我們建議您在使用前閱讀相關政策。
              {'\n\n'}
              我們會謹慎選擇合作夥伴，確保他們也遵守嚴格的資料保護標準。
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>7. 兒童隱私</Text>
            <Text style={styles.sectionContent}>
              我們的服務不針對 13 歲以下的兒童。我們不會故意收集 13 歲以下兒童的個人資訊。
              {'\n\n'}
              如果我們發現不慎收集了兒童的個人資訊，我們會立即刪除相關資料。
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>8. 政策更新</Text>
            <Text style={styles.sectionContent}>
              我們可能會不時更新本隱私權政策。更新後的政策將在本頁面公布，
              重大變更時我們會透過電子郵件或應用程式通知您。
              {'\n\n'}
              我們建議您定期查看本頁面，以了解最新的隱私權政策。
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>9. 聯繫我們</Text>
            <Text style={styles.sectionContent}>
              如果您對本隱私權政策有任何疑問，或對您的資料有任何疑慮，
              請透過以下方式聯繫我們：{'\n\n'}
              📧 電子郵件：privacy@lucidbook.tw{'\n'}
              🕐 服務時間：週一至週五 9:00-18:00{'\n\n'}
              我們會在收到您的訊息後 3 個工作天內回覆。
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>10. 您的權利</Text>
            <Text style={styles.sectionContent}>
              根據相關法律法規，您對您的個人資料擁有以下權利：{'\n\n'}
              • 知情權：了解我們如何處理您的資料{'\n'}
              • 更正權：更正不正確的個人資料{'\n'}
              • 刪除權：要求刪除您的個人資料{'\n'}
              • 限制處理權：限制我們處理您的資料{'\n'}
              • 資料可攜權：以結構化格式獲取您的資料{'\n'}
              • 反對權：反對我們處理您的資料
            </Text>
          </View>

          {/* ⭐ 額外內容確保需要滾動 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>11. 資料保存期限</Text>
            <Text style={styles.sectionContent}>
              我們僅在必要的期限內保存您的個人資料。具體保存期限取決於：{'\n\n'}
              • 服務提供需求{'\n'}
              • 法律法規要求{'\n'}
              • 爭議解決需求{'\n'}
              • 合法商業需求{'\n\n'}
              當資料不再需要時，我們會安全地刪除或匿名化處理。
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>12. 跨境數據傳輸</Text>
            <Text style={styles.sectionContent}>
              您的資料可能會被傳輸到您所在司法管轄區以外的地方進行處理。
              在這種情況下，我們會確保適當的保護措施，以保護您的資料安全。
            </Text>
          </View>

          {/* ✅ 滾動提示 - 只在需要滾動且未啟用時顯示 */}
          {isScrollable && !hasScrolledToBottom && (
            <View style={styles.scrollHint}>
              <Ionicons name="arrow-down-circle" size={24} color="#F59E0B" />
              <Text style={styles.scrollHintText}>
                ⚠️ 請向下滾動閱讀完整內容
              </Text>
            </View>
          )}

          {/* ✅ 已讀完提示 */}
          {hasScrolledToBottom && (
            <View style={styles.completionHint}>
              <Ionicons name="checkmark-circle" size={24} color="#10B981" />
              <Text style={styles.completionHintText}>
                ✓ 您已閱讀完整的隱私權政策
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* 底部按鈕區 */}
      <View style={styles.bottomContainer}>
        {/* ✅ 需要滾動但未完成時顯示警告 */}
        {isScrollable && !hasScrolledToBottom && (
          <View style={styles.scrollWarning}>
            <Ionicons name="alert-circle" size={18} color="#DC2626" />
            <Text style={styles.scrollWarningText}>
              您必須滾動到底部才能繼續
            </Text>
          </View>
        )}

        {/* ✅ 按鈕 */}
        <TouchableOpacity 
          style={styles.agreeButtonContainer}
          onPress={handleAgree}
          activeOpacity={hasScrolledToBottom ? 0.9 : 1}
          disabled={!hasScrolledToBottom}
        >
          <LinearGradient
            colors={hasScrolledToBottom 
              ? ['#166CB5', '#31C6FE']
              : ['#D1D5DB', '#D1D5DB']
            }
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.agreeButton}
          >
            <Ionicons 
              name={hasScrolledToBottom ? "checkmark-circle" : "lock-closed"} 
              size={22} 
              color={hasScrolledToBottom ? "#FFFFFF" : "#9CA3AF"} 
            />
            <Text style={[
              styles.agreeButtonText,
              !hasScrolledToBottom && styles.agreeButtonTextDisabled
            ]}>
              {hasScrolledToBottom ? "我已了解" : "尚未讀完"}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
        
        {/* ✅ 底部提示 */}
        {fromRegister && hasScrolledToBottom && (
          <Text style={styles.bottomHint}>
            點擊「我已了解」即表示您同意本隱私權政策
          </Text>
        )}
        
        {!hasScrolledToBottom && (
          <Text style={styles.bottomHint}>
            {isInitialized 
              ? (isScrollable ? '📜 請閱讀完整內容' : '⏳ 正在加載...')
              : '⏳ 正在初始化...'}
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

  // ⭐ 調試面板
  debugPanel: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#FDE68A',
  },
  debugText: {
    fontSize: 11,
    color: '#92400E',
    fontFamily: 'monospace',
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
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 12,
  },
  sectionContent: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 24,
  },

  // Scroll Hint
  scrollHint: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    paddingTop: 24,
    paddingVertical: 16,
    borderTopWidth: 2,
    borderTopColor: '#FEF3C7',
    backgroundColor: '#FFFBEB',
    borderRadius: 12,
    gap: 12,
  },
  scrollHintText: {
    fontSize: 14,
    color: '#92400E',
    fontWeight: '700',
  },

  // Completion Hint
  completionHint: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    paddingVertical: 16,
    backgroundColor: '#F0FDF4',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#BBF7D0',
    gap: 12,
  },
  completionHintText: {
    fontSize: 14,
    color: '#15803D',
    fontWeight: '600',
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

  // 滾動警告樣式
  scrollWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  scrollWarningText: {
    fontSize: 13,
    color: '#991B1B',
    marginLeft: 8,
    flex: 1,
    fontWeight: '600',
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
  agreeButtonTextDisabled: {
    color: '#9CA3AF',
  },

  bottomHint: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: 12,
  },
});

export default PrivacyPolicyScreen;