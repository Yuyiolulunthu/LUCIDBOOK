// ==========================================
// 檔案名稱: PrivacyPolicy.js
// 功能: 隱私權政策頁面 (更新版樣式)
// 
// ✅ 現代化漸層 Header
// ✅ 卡片式內容設計
// ✅ 優化表格呈現
// ✅ 視覺化承諾卡片
// ✅ 改進的排版與間距
// 🎨 符合最新設計規範
// ==========================================

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  StatusBar,
  Linking,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';

const PrivacyPolicy = ({ navigation }) => {

  const handleEmailPress = () => {
    Linking.openURL('mailto:team@lucidbook.tw');
  };

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
          
          <Text style={styles.headerTitle}>隱私權政策</Text>
          
          <View style={styles.headerPlaceholder} />
        </View>
      </LinearGradient>

      {/* Content */}
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Intro Section */}
        <View style={styles.section}>
          <Text style={styles.updateDate}>最後更新日期：2025年11月13日</Text>
          
          <View style={styles.introCard}>
            <Text style={styles.introTitle}>
              您的心理健康值得被認真對待,您在本App中留下的每一份紀錄—無論是一行反思、一次深呼吸、或是一個自我評分—都屬於您自己。
            </Text>
            <Text style={styles.introText}>
              我們承諾，以透明、友善、穩固的方式守護您的每一份資料。請花一點時間閱讀這份政策，它會告訴您，我們如何收集、保護、使用、與分享您的資料。
            </Text>
          </View>
        </View>

        {/* Section 1 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>一、這份政策適用於誰與哪些情境？</Text>
          <View style={styles.contentCard}>
            <Text style={styles.cardText}>這份隱私權政策適用於您使用路晰書所提供的各類服務，包括但不限於：</Text>
            <View style={styles.bulletList}>
              <Text style={styles.bulletItem}>• 註冊與登入帳號</Text>
              <Text style={styles.bulletItem}>• 進行心理練習、書寫日記或紀錄狀態</Text>
              <Text style={styles.bulletItem}>• 回答心理自評問卷（如壓力、情緒、自我覺察等測驗）</Text>
              <Text style={styles.bulletItem}>• 使用企業授權帳戶、參與團體訓練方案</Text>
              <Text style={styles.bulletItem}>• 遞交客服問題或回饋內容</Text>
            </View>
            <Text style={styles.cardText}>若您透過本App連結至其他網站、平台或合作服務，請同時查閱該服務的隱私權政策。</Text>
          </View>
        </View>

        {/* Section 2 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>二、我們蒐集哪些資料？為什麼需要它們？</Text>
          <View style={styles.contentCard}>
            <Text style={styles.subTitle}>1️⃣ 您主動提供給我們的資料</Text>
            
            {/* Table 1 */}
            <View style={styles.table}>
              <View style={styles.tableHeader}>
                <Text style={[styles.tableHeaderCell, { flex: 1 }]}>資料類型</Text>
                <Text style={[styles.tableHeaderCell, { flex: 1 }]}>描述</Text>
                <Text style={[styles.tableHeaderCell, { flex: 1 }]}>目的</Text>
              </View>
              <View style={styles.tableRow}>
                <Text style={[styles.tableCell, styles.tableCellBold, { flex: 1 }]}>Email、密碼或登入方式</Text>
                <Text style={[styles.tableCell, { flex: 1 }]}>註冊或登入使用者帳號</Text>
                <Text style={[styles.tableCell, { flex: 1 }]}>保存使用進度與建立個人化內容</Text>
              </View>
              <View style={styles.tableRow}>
                <Text style={[styles.tableCell, styles.tableCellBold, { flex: 1 }]}>心理練習紀錄</Text>
                <Text style={[styles.tableCell, { flex: 1 }]}>您在App內完成與書寫的內容</Text>
                <Text style={[styles.tableCell, { flex: 1 }]}>讓您自行回顧狀態與成長</Text>
              </View>
              <View style={styles.tableRow}>
                <Text style={[styles.tableCell, styles.tableCellBold, { flex: 1 }]}>心理自評資料</Text>
                <Text style={[styles.tableCell, { flex: 1 }]}>心理師設計的自我測驗題目與您的作答結果</Text>
                <Text style={[styles.tableCell, { flex: 1 }]}>記錄成長趨勢、生成個人歷程或匿名統計用</Text>
              </View>
            </View>

            {/* Commitment Box */}
            <View style={styles.commitmentBox}>
              <View style={styles.commitmentHeader}>
                <Text style={styles.commitmentIcon}>✨</Text>
                <Text style={styles.commitmentTitle}>關於心理練習的承諾</Text>
              </View>
              <Text style={styles.commitmentText}>
                🌿 您在 App 裡寫的每一段思考、情緒文字，只有您能看到，我們無法查看這些內容。
              </Text>
            </View>

            <Text style={[styles.subTitle, { marginTop: 20 }]}>2️⃣ 系統自動產生的資料（非個資化）</Text>
            
            {/* Table 2 */}
            <View style={styles.table}>
              <View style={styles.tableHeader}>
                <Text style={[styles.tableHeaderCell, { flex: 1 }]}>資料類型</Text>
                <Text style={[styles.tableHeaderCell, { flex: 1.5 }]}>用途</Text>
              </View>
              <View style={styles.tableRow}>
                <Text style={[styles.tableCell, styles.tableCellBold, { flex: 1 }]}>App 操作紀錄</Text>
                <Text style={[styles.tableCell, { flex: 1.5 }]}>提供個人使用介面與回顧資料</Text>
              </View>
              <View style={styles.tableRow}>
                <Text style={[styles.tableCell, styles.tableCellBold, { flex: 1 }]}>裝置資訊</Text>
                <Text style={[styles.tableCell, { flex: 1.5 }]}>用於提升相容性與使用體驗</Text>
              </View>
              <View style={styles.tableRow}>
                <Text style={[styles.tableCell, styles.tableCellBold, { flex: 1 }]}>服務使用統計</Text>
                <Text style={[styles.tableCell, { flex: 1.5 }]}>用於優化服務品質或產生匿名報表</Text>
              </View>
            </View>
            
            <Text style={styles.smallNote}>我們不會藉由這些資料追蹤您在其他網站或App上的活動。</Text>
          </View>
        </View>

        {/* Section 3 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>三、我們如何使用您的資料？</Text>
          <View style={styles.contentCard}>
            <View style={styles.checkList}>
              <View style={styles.checkItem}>
                <Ionicons name="checkmark-circle" size={20} color="#10B981" style={styles.checkIcon} />
                <View style={styles.checkContent}>
                  <Text style={styles.checkTitle}>提供路晰書App的心理練習、紀錄與追蹤服務</Text>
                  <Text style={styles.checkDesc}>讓您能安全儲存並查看個人成長內容</Text>
                </View>
              </View>
              <View style={styles.checkItem}>
                <Ionicons name="checkmark-circle" size={20} color="#10B981" style={styles.checkIcon} />
                <View style={styles.checkContent}>
                  <Text style={styles.checkTitle}>幫助您回顧與理解狀態變化</Text>
                  <Text style={styles.checkDesc}>顯示個人成長圖表與歷程紀錄</Text>
                </View>
              </View>
              <View style={styles.checkItem}>
                <Ionicons name="checkmark-circle" size={20} color="#10B981" style={styles.checkIcon} />
                <View style={styles.checkContent}>
                  <Text style={styles.checkTitle}>改善產品、測試功能或排除錯誤</Text>
                  <Text style={styles.checkDesc}>分析服務流程並持續優化品質與效能</Text>
                </View>
              </View>
              <View style={styles.checkItem}>
                <Ionicons name="checkmark-circle" size={20} color="#10B981" style={styles.checkIcon} />
                <View style={styles.checkContent}>
                  <Text style={styles.checkTitle}>為企業方案產出匿名整體統計報告</Text>
                  <Text style={styles.checkDesc}>協助企業了解訓練成果與心理支持成效（不含個人資料）</Text>
                </View>
              </View>
              <View style={styles.checkItem}>
                <Ionicons name="checkmark-circle" size={20} color="#10B981" style={styles.checkIcon} />
                <View style={styles.checkContent}>
                  <Text style={styles.checkTitle}>用於未來心理模型與內容設計</Text>
                  <Text style={styles.checkDesc}>僅使用匿名化後資料做統計或內部研究</Text>
                </View>
              </View>
            </View>

            <View style={styles.infoBox}>
              <Text style={styles.infoBoxText}>
                🔔 我們永遠不會出售您的個資，也不會將個人資料拿去做廣告或分享給非必要的第三方。
              </Text>
            </View>
          </View>
        </View>

        {/* Section 4 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>四、企業端使用與匿名統計資料說明</Text>
          <View style={styles.contentCard}>
            <Text style={styles.cardText}>
              若您使用的是企業授權帳號，我們可能向該企業提供匿名化的整體數據報告，用於評估心理訓練成果。然而，企業端無法看到任何個別使用者的心理內容、個資或測評紀錄。
            </Text>

            {/* Can See */}
            <View style={styles.canSeeSection}>
              <View style={styles.canSeeHeader}>
                <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                <Text style={styles.canSeeTitle}>企業端可以看到的內容（僅限整體統計資料）</Text>
              </View>
              <View style={styles.bulletList}>
                <Text style={styles.bulletItem}>
                  • <Text style={styles.boldText}>使用活躍比例：</Text>例如 80% 員工本月登入並使用 App
                </Text>
                <Text style={styles.bulletItem}>
                  • <Text style={styles.boldText}>訓練完成率：</Text>例如平均完成率達 12 天／14 天
                </Text>
                <Text style={styles.bulletItem}>
                  • <Text style={styles.boldText}>自評平均結果趨勢：</Text>例如壓力自評平均下降 15%
                </Text>
                <Text style={styles.bulletItem}>
                  • <Text style={styles.boldText}>整體滿意度或回饋（匿名）：</Text>如「90% 參加者認為心情有改善」
                </Text>
              </View>
            </View>

            {/* Cannot See */}
            <View style={styles.cannotSeeSection}>
              <View style={styles.cannotSeeHeader}>
                <Ionicons name="close-circle" size={20} color="#EF4444" />
                <Text style={styles.cannotSeeTitle}>企業端無法看到的內容</Text>
              </View>
              <View style={styles.bulletList}>
                <Text style={styles.bulletItem}>
                  • <Text style={styles.boldText}>個別使用者的心理日記或練習內容：</Text>企業無法查看任何文字、情緒或行動紀錄
                </Text>
                <Text style={styles.bulletItem}>
                  • <Text style={styles.boldText}>單一使用者的心理自評結果：</Text>不會顯示個別人員分數或回答
                </Text>
                <Text style={styles.bulletItem}>
                  • <Text style={styles.boldText}>所有個人身份資料：</Text>包含Email、姓名、打卡紀錄等
                </Text>
              </View>
            </View>

            <View style={styles.promiseBox}>
              <Text style={styles.promiseText}>
                🔒 我們承諾：無論是誰為您購買帳號，您對個人心理資料與狀態紀錄的擁有權，都不會被影響或繞過。
              </Text>
            </View>
          </View>
        </View>

        {/* Section 5 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>五、我們如何保護您的資料？</Text>
          <View style={styles.contentCard}>
            <Text style={styles.cardText}>我們透過以下方式保護您的資料安全：</Text>
            <View style={styles.bulletList}>
              <Text style={styles.bulletItem}>• 全程採用傳輸加密（HTTPS/TLS）與資料庫加密儲存</Text>
              <Text style={styles.bulletItem}>• 心理練習文字採不可讀取設計，保障最敏感內容</Text>
              <Text style={styles.bulletItem}>• 心理自評資料採「權限分層、用途限制」方式管理</Text>
              <Text style={styles.bulletItem}>• 僅有限制權限之工作人員可存取相關資料</Text>
              <Text style={styles.bulletItem}>• 若發生資料安全外洩事件，我們會於72小時內通知受影響者</Text>
            </View>
          </View>
        </View>

        {/* Section 6 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>六、資料保存、刪除與您的選擇權</Text>
          <View style={styles.contentCard}>
            <View style={styles.bulletList}>
              <Text style={styles.bulletItem}>• 您可以隨時聯繫我們刪除帳號，我們會一併清除與您相關的所有個人資料</Text>
              <Text style={styles.bulletItem}>• 若您屬企業授權用戶，已納入統計的匿名報表不會被回溯修改</Text>
              <Text style={styles.bulletItem}>• 若未來增加「資料匯出」功能，您可下載自己的練習紀錄與自評紀錄</Text>
            </View>
            <Text style={styles.cardText}>
              您可透過：<Text style={styles.linkText} onPress={handleEmailPress}>team@lucidbook.tw</Text> 與我們聯繫帳務或資料權益事宜。
            </Text>
          </View>
        </View>

        {/* Section 7 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>七、第三方工具或外部服務</Text>
          <View style={styles.contentCard}>
            <Text style={styles.cardText}>目前我們尚未使用第三方調查、廣告、分析或登錄工具。</Text>
            <Text style={styles.cardText}>若未來引入 Firebase、Mixpanel 或其他必要工具，我們會：</Text>
            <View style={styles.bulletList}>
              <Text style={styles.bulletItem}>• 於引入前更新政策並明確載明用途</Text>
              <Text style={styles.bulletItem}>• 不會加入會跨平台追蹤您的工具</Text>
              <Text style={styles.bulletItem}>• 不會與廣告網路分享資料</Text>
            </View>
          </View>
        </View>

        {/* Section 8 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>八、您的權利</Text>
          <View style={styles.contentCard}>
            <Text style={styles.cardText}>依據台灣《個資保護法》與 GDPR 等法規，您有權：</Text>
            <View style={styles.bulletList}>
              <Text style={styles.bulletItem}>• 查詢、請求閱覽或下載您的資料</Text>
              <Text style={styles.bulletItem}>• 更正、刪除您的個人紀錄</Text>
              <Text style={styles.bulletItem}>• 撤回同意或停止使用（同時停止相關功能）</Text>
            </View>
            <Text style={styles.cardText}>
              請聯繫：<Text style={styles.linkText} onPress={handleEmailPress}>team@lucidbook.tw</Text>
            </Text>
          </View>
        </View>

        {/* Section 9 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>九、政策更新</Text>
          <View style={styles.contentCard}>
            <Text style={styles.cardText}>
              當我們因應法規或服務內容變更時，將適時更新本政策。若是重大變動，我們將於 App 內或以 Email 通知您。
            </Text>
            <Text style={styles.cardText}>更新後的政策自發布日起立即生效。</Text>
          </View>
        </View>

        {/* Contact Footer */}
        <View style={styles.contactFooter}>
          <Text style={styles.contactTitle}>聯絡我們</Text>
          <Text style={styles.contactText}>路晰書股份有限公司</Text>
          <Text style={styles.contactText}>
            個資保護窗口：<Text style={styles.linkText} onPress={handleEmailPress}>team@lucidbook.tw</Text>
          </Text>
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },

  // ========== Header ==========
  header: {
    paddingTop: Platform.OS === 'ios' ? 50 : 40,
    paddingBottom: 16,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
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
    backdropFilter: 'blur(10px)',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  headerPlaceholder: {
    width: 40,
  },

  // ========== ScrollView ==========
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 24,
  },

  // ========== Sections ==========
  section: {
    marginBottom: 32,
  },
  updateDate: {
    fontSize: 14,
    color: '#718096',
    marginBottom: 16,
    fontWeight: '500',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2D3748',
    marginBottom: 12,
    letterSpacing: 0.3,
  },

  // ========== Intro Card ==========
  introCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  introTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2D3748',
    lineHeight: 24,
    marginBottom: 12,
  },
  introText: {
    fontSize: 14,
    color: '#4A5568',
    lineHeight: 24,
  },

  // ========== Content Card ==========
  contentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  cardText: {
    fontSize: 14,
    color: '#4A5568',
    lineHeight: 24,
    marginBottom: 12,
  },
  subTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#166CB5',
    marginBottom: 16,
    marginTop: 4,
  },

  // ========== Bullet List ==========
  bulletList: {
    marginBottom: 12,
  },
  bulletItem: {
    fontSize: 14,
    color: '#4A5568',
    lineHeight: 24,
    marginBottom: 6,
    paddingLeft: 4,
  },
  boldText: {
    fontWeight: '600',
    color: '#2D3748',
  },

  // ========== Table ==========
  table: {
    marginBottom: 20,
    marginTop: 4,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#F9FAFB',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  tableHeaderCell: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  tableCell: {
    fontSize: 12,
    color: '#4A5568',
    lineHeight: 18,
    paddingRight: 8,
  },
  tableCellBold: {
    fontWeight: '600',
    color: '#2D3748',
  },

  // ========== Commitment Box ==========
  commitmentBox: {
    backgroundColor: '#F0F9F4',
    borderWidth: 1,
    borderColor: '#C6F6D5',
    borderRadius: 12,
    padding: 16,
    marginTop: 12,
    marginBottom: 8,
  },
  commitmentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  commitmentIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  commitmentTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2F855A',
    flex: 1,
  },
  commitmentText: {
    fontSize: 14,
    color: '#276749',
    lineHeight: 22,
  },

  // ========== Small Note ==========
  smallNote: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 8,
    fontStyle: 'italic',
  },

  // ========== Check List ==========
  checkList: {
    marginBottom: 16,
  },
  checkItem: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'flex-start',
  },
  checkIcon: {
    marginRight: 10,
    marginTop: 2,
  },
  checkContent: {
    flex: 1,
  },
  checkTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2D3748',
    marginBottom: 4,
    lineHeight: 20,
  },
  checkDesc: {
    fontSize: 12,
    color: '#6B7280',
    lineHeight: 18,
  },

  // ========== Info Box ==========
  infoBox: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    borderRadius: 12,
    padding: 12,
    marginTop: 4,
  },
  infoBoxText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1E40AF',
    lineHeight: 22,
  },

  // ========== Can/Cannot See Sections ==========
  canSeeSection: {
    marginTop: 20,
    marginBottom: 16,
  },
  canSeeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  canSeeTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#10B981',
    marginLeft: 8,
    flex: 1,
  },
  cannotSeeSection: {
    marginBottom: 16,
  },
  cannotSeeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  cannotSeeTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#EF4444',
    marginLeft: 8,
    flex: 1,
  },

  // ========== Promise Box ==========
  promiseBox: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
  },
  promiseText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    textAlign: 'center',
    lineHeight: 22,
  },

  // ========== Link Text ==========
  linkText: {
    color: '#166CB5',
    textDecorationLine: 'underline',
    fontWeight: '600',
  },

  // ========== Contact Footer ==========
  contactFooter: {
    backgroundColor: '#F5F7FA',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  contactTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2D3748',
    marginBottom: 12,
  },
  contactText: {
    fontSize: 14,
    color: '#4A5568',
    marginBottom: 6,
    textAlign: 'center',
  },

  bottomPadding: {
    height: 60,
  },
});

export default PrivacyPolicy;