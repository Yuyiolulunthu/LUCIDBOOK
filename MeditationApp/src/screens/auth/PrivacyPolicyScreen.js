// ==========================================
// 檔案名稱: PrivacyPolicyScreen.js
// 功能: 隱私權政策頁面
// ✅ 超嚴格「必須滑到底」才可同意（修正版）
// ✅ 不再使用 measure()，改用 onLayout + onContentSizeChange（更準）
// ✅ 多事件檢查：onScroll + onScrollEndDrag + onMomentumScrollEnd
// ✅ 追蹤 maxOffsetReached，避免 throttle/momentum 漏判
// ✅ Button 真正 disabled（不只顏色）
// ==========================================

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  StatusBar,
  Animated,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const PrivacyPolicyScreen = ({ navigation, route }) => {
  const { fromRegister, savedFormData } = route.params || {};

  // ====== 可調參數（越嚴格越不容易誤判） ======
  const BOTTOM_THRESHOLD_PX = 6;  // 距離底部 <= 6px 才算到底（可再縮到 3）
  const MIN_SCROLL_PX = 120;      // 至少真的滑動超過 120px 才算「有閱讀行為」

  // 狀態管理
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
  const [readingProgress, setReadingProgress] = useState(0);
  const [canAgree, setCanAgree] = useState(false);

  // ScrollView 尺寸（取代 measure）
  const [layoutHeight, setLayoutHeight] = useState(0);    // 可視高度
  const [contentHeight, setContentHeight] = useState(0);  // 內容高度

  const progressAnim = useRef(new Animated.Value(0)).current;
  const buttonAnim = useRef(new Animated.Value(0.5)).current;

  // 用 ref 追蹤「使用者真的滑過」以及「到過的最深 offset」
  const hasUserScrolled = useRef(false);
  const maxOffsetReached = useRef(0);

  // 只要內容/版面變動，就重置狀態（避免切頁/字體縮放造成誤啟用）
  useEffect(() => {
    setHasScrolledToBottom(false);
    setCanAgree(false);
    buttonAnim.setValue(0.5);
    hasUserScrolled.current = false;
    maxOffsetReached.current = 0;
  }, [layoutHeight, contentHeight]);

  // 取得 ScrollView 可視高度
  const handleLayout = (e) => {
    const h = e.nativeEvent.layout.height || 0;
    setLayoutHeight(h);
  };

  // 取得內容高度
  const handleContentSizeChange = (w, h) => {
    setContentHeight(h);
  };

  // 計算 maxScroll（真正可滑到底的距離）
  const getMaxScroll = () => {
    const maxScroll = Math.max(contentHeight - layoutHeight, 0);
    return maxScroll;
  };

  // 統一的底部檢查（可在多事件呼叫）
  const checkBottomAndMaybeEnable = (offsetY) => {
    const maxScroll = getMaxScroll();

    // 內容還沒 ready 或根本不能滑（maxScroll=0）時：你可以選擇要不要自動允許
    // 如果你「堅持永不自動啟用」，那這裡就直接 return。
    // 但若內容比螢幕短，使用者根本無法滑到底，會卡死。
    // 所以我採用：maxScroll === 0 -> 直接允許（合理 UX）
    if (layoutHeight <= 0 || contentHeight <= 0) return;

    if (maxScroll === 0) {
      // 無法滾動時，視為已完整閱讀
      if (!hasScrolledToBottom) enableAgreement();
      return;
    }

    // 追蹤最深位置（避免 throttle/momentum 漏掉最後 onScroll）
    maxOffsetReached.current = Math.max(maxOffsetReached.current, offsetY);

    // 使用者是否真的滾動過一定距離
    if (maxOffsetReached.current >= Math.min(MIN_SCROLL_PX, maxScroll * 0.25)) {
      hasUserScrolled.current = true;
    }

    // 是否真的到底：maxOffsetReached >= maxScroll - threshold
    const isAtBottom =
      hasUserScrolled.current &&
      maxOffsetReached.current >= (maxScroll - BOTTOM_THRESHOLD_PX);

    // 進度計算（用 maxOffsetReached 比用 offsetY 穩定）
    const progress = maxScroll > 0 ? (Math.min(maxOffsetReached.current, maxScroll) / maxScroll) : 1;
    const progressPercent = Math.min(Math.max(progress * 100, 0), 100);
    setReadingProgress(progressPercent);

    Animated.timing(progressAnim, {
      toValue: progressPercent / 100,
      duration: 80,
      useNativeDriver: false,
    }).start();

    // Debug（必要時再打開）
    // console.log('📊 [隱私政策] check:', {
    //   offsetY,
    //   maxScroll,
    //   maxOffsetReached: maxOffsetReached.current,
    //   hasUserScrolled: hasUserScrolled.current,
    //   isAtBottom,
    //   progressPercent,
    // });

    if (isAtBottom && !hasScrolledToBottom) {
      enableAgreement();
    }
  };

  // onScroll：持續更新
  const handleScroll = (event) => {
    const { contentOffset } = event.nativeEvent;
    const offsetY = contentOffset?.y ?? 0;

    // iOS 可能有負值（拉回彈），忽略負值
    checkBottomAndMaybeEnable(Math.max(offsetY, 0));
  };

  // onScrollEndDrag / onMomentumScrollEnd：補抓最後停下來那一下
  const handleScrollEnd = (event) => {
    const { contentOffset } = event.nativeEvent;
    const offsetY = contentOffset?.y ?? 0;
    checkBottomAndMaybeEnable(Math.max(offsetY, 0));
  };

  // 啟用同意按鈕
  const enableAgreement = () => {
    setHasScrolledToBottom(true);
    setCanAgree(true);

    Animated.spring(buttonAnim, {
      toValue: 1,
      friction: 5,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  // 點擊「我已了解」
  const handleAgree = () => {
    // 再保險：即使 UI 被點到，也不讓過
    if (!canAgree) {
      Alert.alert(
        '請閱讀完整內容',
        '您需要滾動到最底部閱讀完整的隱私權政策',
        [{ text: '了解' }]
      );
      return;
    }

    if (fromRegister) {
      navigation.navigate({
        name: 'Register',
        params: {
          savedFormData,
          agreedFromPrivacy: true,
        },
        merge: true,
      });
    } else {
      navigation.goBack();
    }
  };

  // 返回按鈕
  const handleGoBack = () => {
    if (fromRegister && savedFormData) {
      navigation.navigate({
        name: 'Register',
        params: {
          savedFormData,
          agreedFromPrivacy: false,
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

      {/* 閱讀進度條 */}
      <View style={styles.progressBarContainer}>
        <Animated.View
          style={[
            styles.progressBar,
            {
              width: progressAnim.interpolate({
                inputRange: [0, 1],
                outputRange: ['0%', '100%'],
              }),
            },
          ]}
        />
      </View>

      {/* 內容區域 */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
        showsVerticalScrollIndicator={true}
        onLayout={handleLayout}
        onContentSizeChange={handleContentSizeChange}
        onScroll={handleScroll}
        onScrollEndDrag={handleScrollEnd}
        onMomentumScrollEnd={handleScrollEnd}
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

          {/* 閱讀狀態提示 */}
          {!canAgree && (
            <View style={styles.scrollHint}>
              <Ionicons name="arrow-down-circle" size={24} color="#F59E0B" />
              <Text style={styles.scrollHintText}>
                請向下滾動閱讀完整內容 ({Math.round(readingProgress)}%)
              </Text>
            </View>
          )}

          {canAgree && (
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
        {!canAgree && (
          <View style={styles.progressInfo}>
            <Text style={styles.progressText}>
              閱讀進度：{Math.round(readingProgress)}%
            </Text>
            <Text style={styles.progressHint}>滾動到底部以繼續</Text>
          </View>
        )}

        <Animated.View style={{ transform: [{ scale: buttonAnim }] }}>
          <TouchableOpacity
            style={styles.agreeButtonContainer}
            onPress={handleAgree}
            activeOpacity={0.9}
            disabled={!canAgree}                 // ✅ 真正禁用
          >
            <LinearGradient
              colors={
                canAgree ? ['#166CB5', '#31C6FE'] : ['#D1D5DB', '#D1D5DB']
              }
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.agreeButton}
            >
              <Ionicons
                name={canAgree ? 'checkmark-circle' : 'lock-closed-outline'}
                size={22}
                color={canAgree ? '#FFFFFF' : '#9CA3AF'}
              />
              <Text
                style={[
                  styles.agreeButtonText,
                  !canAgree && styles.agreeButtonTextDisabled,
                ]}
              >
                {canAgree ? '我已了解' : '請先閱讀完整內容'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>

        {fromRegister && canAgree && (
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

  // 進度條
  progressBarContainer: {
    height: 3,
    backgroundColor: '#E5E7EB',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#166CB5',
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
    paddingVertical: 16,
    backgroundColor: '#FFFBEB',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FEF3C7',
    gap: 12,
  },
  scrollHintText: {
    fontSize: 14,
    color: '#92400E',
    fontWeight: '600',
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

  progressInfo: {
    marginBottom: 12,
    alignItems: 'center',
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#166CB5',
    marginBottom: 4,
  },
  progressHint: {
    fontSize: 12,
    color: '#9CA3AF',
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
