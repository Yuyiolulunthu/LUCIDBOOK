// ==========================================
// 檔案名稱: TermsOfServiceScreen.js
// 版本: V2.0 - 新設計風格
// 功能: 使用者條款頁面
// ==========================================

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';

const TermsOfServiceScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
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
          
          <Text style={styles.headerTitle}>使用者條款</Text>
          
          <View style={styles.headerSpacer} />
        </View>
      </LinearGradient>

      {/* Content */}
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header Section */}
        <View style={styles.headerSection}>
          <Text style={styles.mainTitle}>路晰書 APP 使用者條款</Text>
          <Text style={styles.updateDate}>最後更新日期：2025年11月18日</Text>
          
          <View style={styles.introCard}>
            <Text style={styles.introText}>
              歡迎使用「路晰書心理肌力訓練 APP」（以下稱「本服務」或「本 APP」），本服務由 路晰書股份有限公司（以下稱「本公司」或「路晰書」）所提供與經營。
              為保障您的權益，請您在使用本服務前，務必詳細閱讀本使用者條款（以下稱「本條款」）。當您下載、安裝、註冊、登入或開始使用本服務時，即表示您已閱讀、理解並同意受本條款之拘束。
              若您不同意本條款全部或一部分，請勿使用本服務。
            </Text>
          </View>
        </View>

        {/* Terms Sections */}
        <View style={styles.termsContainer}>
          {/* 一、適用範圍與身分 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>一、適用範圍與身分</Text>
            <View style={styles.contentCard}>
              <Text style={styles.contentText}>
                本條款適用於所有使用本 APP 者，包括一般個人使用者，以及透過合作企業或機構取得授權之員工或成員（以下統稱「使用者」或「您」）。
              </Text>
              <Text style={styles.contentText}>
                若您為未成年人，您應在法定代理人或監護人閱讀、理解並同意本條款之全部內容後，方得使用本服務。當您使用本服務時，視為您的法定代理人或監護人已閱讀、了解並同意本條款。
              </Text>
            </View>
          </View>

          {/* 二、服務內容簡介與性質 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>二、服務內容簡介與性質</Text>
            <View style={styles.contentCard}>
              <Text style={styles.contentText}>
                本服務為一款「心理肌力訓練 APP」，提供多種由專業心理師設計之心理練習內容，包括但不限於：
              </Text>
              <View style={styles.bulletList}>
                <Text style={styles.bulletItem}>• 呼吸引導、放鬆練習</Text>
                <Text style={styles.bulletItem}>• 正念練習與覺察引導</Text>
                <Text style={styles.bulletItem}>• 自我書寫、自我對話與情緒紀錄</Text>
                <Text style={styles.bulletItem}>• 情緒標記、自我評估與心理狀態追蹤等</Text>
              </View>
              <Text style={styles.contentText}>
                本服務可能會提供自我評估量表、心理狀態紀錄與進展回顧等功能，協助您了解自身的心理狀態與變化。
              </Text>
              <Text style={styles.contentText}>
                本公司保留隨時新增、調整或停止部分功能與內容之權利。
              </Text>
            </View>
          </View>

          {/* 三、非醫療、非諮商之聲明 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>三、非醫療、非諮商之聲明</Text>
            <View style={styles.contentCard}>
              <Text style={styles.contentText}>
                本服務所提供之所有內容，包括文字、語音、引導、練習、自我評估結果與任何說明，皆不構成醫療行為、心理治療或個別諮商。
              </Text>
              <Text style={styles.contentText}>本服務不提供且不取代：</Text>
              <View style={styles.bulletList}>
                <Text style={styles.bulletItem}>• 醫師診斷、治療或開立處方</Text>
                <Text style={styles.bulletItem}>• 心理師、諮商師之面談諮商與心理治療</Text>
                <Text style={styles.bulletItem}>• 緊急醫療或心理危機處置服務</Text>
              </View>
              <Text style={styles.contentText}>
                若您目前有下列任一情況，強烈建議您優先諮詢醫療或心理專業人員：
              </Text>
              <View style={styles.bulletList}>
                <Text style={styles.bulletItem}>• 正在接受精神科或身心科治療、服用相關藥物</Text>
                <Text style={styles.bulletItem}>• 有自傷、他傷、或自殺意念與計畫</Text>
                <Text style={styles.bulletItem}>• 有重大身心症狀、功能嚴重受損或生活難以維持</Text>
              </View>
              <Text style={styles.contentText}>
                本服務之任何內容，如與醫師或心理專業人員之建議不一致，請以專業人員之建議為優先，並可依自身狀況調整是否繼續使用本服務。
              </Text>
            </View>
          </View>

          {/* 四、使用者自我照顧義務 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>四、使用者自我照顧義務</Text>
            <View style={styles.contentCard}>
              <Text style={styles.contentText}>
                在使用本服務進行任何心理肌力訓練、自我書寫、自我探索或評估時，請隨時留意自己的身心狀態。
              </Text>
              <Text style={styles.contentText}>
                若您在練習過程中出現下列任一情況，建議您：
              </Text>
              <View style={styles.bulletList}>
                <Text style={styles.bulletItem}>• 立刻暫停或停止練習</Text>
                <Text style={styles.bulletItem}>• 視需要暫時離開螢幕、休息或做其他放鬆活動</Text>
                <Text style={styles.bulletItem}>• 視情況尋求醫師、心理師或其他專業人員之協助</Text>
              </View>
              <Text style={styles.contentText}>
                若您在使用過程中出現強烈不適感（例如：強烈焦慮、恐慌、解離感、自我傷害衝動等），請立即停止使用本服務，並及時尋求專業協助；如有緊急狀況，請立即聯絡當地緊急救護或醫療資源。
              </Text>
              <Text style={styles.contentText}>
                您同意，您對自己使用本服務之方式、自身身心狀況之評估，以及是否尋求專業協助，負有最終責任。
              </Text>
            </View>
          </View>

          {/* 五、帳號使用與安全 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>五、帳號使用與安全</Text>
            <View style={styles.contentCard}>
              <Text style={styles.contentText}>
                您在註冊帳號時，應提供真實且有效之基本資料，並維持資料之正確性與即時更新。
              </Text>
              <Text style={styles.contentText}>
                您有責任妥善保管帳號與密碼，不得轉讓、出租、借用或以其他方式提供第三人使用。
              </Text>
              <Text style={styles.contentText}>
                任何透過您的帳號所進行之操作，均視為您本人之行為，並由您負其相關責任。若您發現帳號有遭他人未經授權使用或其他安全疑慮時，請儘速通知本公司。
              </Text>
              <Text style={styles.contentText}>
                本公司得於合理懷疑有違法使用或違反本條款之情形時，暫時限制或終止該帳號之使用。
              </Text>
            </View>
          </View>

          {/* 六、使用者內容與隱私 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>六、使用者內容與隱私</Text>
            <View style={styles.contentCard}>
              <Text style={styles.contentText}>
                本服務中之自我書寫、情緒紀錄、個人反思與其他文字內容（以下稱「使用者內容」），主要目的為協助您進行自我探索與心理練習。
              </Text>
              <Text style={styles.contentText}>
                本公司將依「隱私權政策」之規範處理與保護您的個人資料與使用紀錄，並採取合理且適當之技術與管理措施，以保障資料安全。
              </Text>
              <Text style={styles.contentText}>書寫內容部分：</Text>
              <View style={styles.bulletList}>
                <Text style={styles.bulletItem}>
                  • 本公司將以加密技術方式加以保護與限制存取權限，任何人無法以任何方式閱讀您的個人書寫內容。
                </Text>
                <Text style={styles.bulletItem}>
                  • 在合理範圍內，本公司可能使用匿名化或統計化之資料，以改善產品功能、進行服務分析或研究，但不會識別個別使用者。
                </Text>
              </View>
              <Text style={styles.contentText}>
                您應理解並同意，即使本公司採取保護措施，任何網路服務皆無法保證百分之百安全。本公司將在法律允許範圍內盡力保護您的資料，但無法承擔因不可抗力或第三方惡意攻擊等因素所造成之全部損害責任。
              </Text>
            </View>
          </View>

          {/* 七、智慧財產權 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>七、智慧財產權</Text>
            <View style={styles.contentCard}>
              <Text style={styles.contentText}>
                本服務中所有內容，包括但不限於：程式碼、系統設計、介面設計、圖像、圖標、文字、影音、引導腳本、心理肌力訓練流程、評估工具、題目設計、品牌名稱與標識等，均由本公司或合法授權人享有著作權、專利權、商標權及其他相關智慧財產權。
              </Text>
              <Text style={styles.contentText}>
                除法律明文許可或本公司事前書面同意外，您不得對本服務內容進行任何形式之：
              </Text>
              <View style={styles.bulletList}>
                <Text style={styles.bulletItem}>
                  • 重製、修改、翻譯、轉載、散佈、公開播送、公開傳輸
                </Text>
                <Text style={styles.bulletItem}>• 逆向工程、反向組譯或反向編譯</Text>
                <Text style={styles.bulletItem}>
                  • 銷售、轉售、出租、出借或以其他方式供第三人使用
                </Text>
              </View>
              <Text style={styles.contentText}>
                本條款並未授與您任何本公司智慧財產權之授權或移轉，您僅取得依本條款使用本服務之有限、非專屬、不可轉讓之使用權。
              </Text>
            </View>
          </View>

          {/* 八、禁止行為 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>八、禁止行為</Text>
            <View style={styles.contentCard}>
              <Text style={styles.contentText}>
                為維護本服務之正常運作與其他使用者之權益，您同意不從事下列行為：
              </Text>
              <View style={styles.bulletList}>
                <Text style={styles.bulletItem}>
                  • 未經授權，擷取、重製、改作、散佈、公開傳輸、販售或以任何方式利用本服務之內容或心理練習設計。
                </Text>
                <Text style={styles.bulletItem}>
                  • 將本服務之帳號、內容或授權轉售、出租、出借或提供給任何第三人使用，或以團購、代購等方式違反本公司授權範圍。
                </Text>
                <Text style={styles.bulletItem}>
                  • 企圖或實際進行破解、繞過、破壞本服務之技術防護措施，包括但不限於：逆向工程、反組譯、反編譯；以機器人、爬蟲、外掛程式等方式大量存取或擷取內容。
                </Text>
                <Text style={styles.bulletItem}>
                  • 故意干擾或破壞本服務之伺服器、系統或網路安全，或進行任何可能影響服務穩定性之行為。
                </Text>
                <Text style={styles.bulletItem}>
                  • 於本服務中傳送或儲存含有違法、侵權、誹謗、歧視、暴力、色情、仇恨言論等內容。
                </Text>
                <Text style={styles.bulletItem}>• 其他違反中華民國法律或公序良俗之行為。</Text>
              </View>
              <Text style={styles.contentText}>
                如本公司發現上述情形，有權視情節輕重採取包括但不限於：警示、限制功能、暫停或終止帳號、追究相關法律責任等措施。
              </Text>
            </View>
          </View>

          {/* 九、費用、訂閱與退款 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>九、費用、訂閱與退款</Text>
            <View style={styles.contentCard}>
              <Text style={styles.contentText}>
                本服務得提供免費內容與付費內容，具體方案與價格以本 APP 內實際顯示為準。
              </Text>
              <Text style={styles.contentText}>
                若您透過 App Store、Google Play 或其他平台進行訂閱或付費，相關付款流程與退款規則，亦適用該平台之使用條款與政策。
              </Text>
              <Text style={styles.contentText}>
                除法律強制規定或平台政策另有要求外，已支付之費用原則上不予退還。
              </Text>
            </View>
          </View>

          {/* 十、服務變更、中斷與終止 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>十、服務變更、中斷與終止</Text>
            <View style={styles.contentCard}>
              <Text style={styles.contentText}>
                本公司得基於營運、技術、安全或法令要求等理由，隨時調整、暫停或終止本服務之全部或一部分，並以合適方式（如 APP 公告、官網公告等）通知使用者。
              </Text>
              <Text style={styles.contentText}>
                因下列情形導致本服務無法正常運作時，本公司不負損害賠償責任：
              </Text>
              <View style={styles.bulletList}>
                <Text style={styles.bulletItem}>• 不可抗力事件（如天災、戰爭、政府命令等）</Text>
                <Text style={styles.bulletItem}>• 電信或網路服務障礙</Text>
                <Text style={styles.bulletItem}>• 第三方系統或服務故障</Text>
                <Text style={styles.bulletItem}>• 非可歸責於本公司之其他事由</Text>
              </View>
              <Text style={styles.contentText}>
                如因使用者違反本條款或法律，本公司得暫停或終止其帳號使用權，並得視情況保留相關紀錄，以符合法律或權益維護之需要。
              </Text>
            </View>
          </View>

          {/* 十一、責任限制與免責聲明 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>十一、責任限制與免責聲明</Text>
            <View style={styles.contentCard}>
              <Text style={styles.contentText}>
                本公司將以合理之技術與管理努力維持本服務之正常運作與內容品質，但不保證本服務絕對無錯誤、不中斷或完全符合您的期待。
              </Text>
              <Text style={styles.contentText}>
                在法律允許之範圍內，本公司對於因使用或無法使用本服務所致之任何直接、間接、附帶、特別或衍生性損害，不負賠償責任。
              </Text>
              <Text style={styles.contentText}>
                您了解並同意，心理練習之效果與感受因人而異，本服務無法保證任何特定療效、改善程度或結果。
              </Text>
              <Text style={styles.contentText}>
                如有醫療、精神健康或法律相關問題，請諮詢適當之專業人員，本服務不提供專業診斷或法律意見。
              </Text>
            </View>
          </View>

          {/* 十二、條款修改 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>十二、條款修改</Text>
            <View style={styles.contentCard}>
              <Text style={styles.contentText}>
                本公司得視需要不時修訂本條款，並於本服務介面或官網公告更新版本及生效日期。
              </Text>
              <Text style={styles.contentText}>
                除法令另有規定外，更新條款一經公告即自生效日起適用。如您於條款修訂後仍繼續使用本服務，即視為您已閱讀、了解並同意修訂後之條款。
              </Text>
            </View>
          </View>

          {/* 十三、準據法與管轄法院 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>十三、準據法與管轄法院</Text>
            <View style={styles.contentCard}>
              <Text style={styles.contentText}>
                本條款之解釋與適用，以中華民國法律為準據法。
              </Text>
              <Text style={styles.contentText}>
                因本條款或本服務所生之爭議，如無法協商解決，雙方同意以台灣台北地方法院為第一審管轄法院。
              </Text>
            </View>
          </View>

          {/* 十四、聯絡方式 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>十四、聯絡方式</Text>
            <View style={styles.contentCard}>
              <Text style={styles.contentText}>
                如您對本條款或本服務有任何疑問，歡迎透過以下方式聯繫我們：
              </Text>
              <Text style={styles.contentText}>公司名稱：路晰書股份有限公司</Text>
              <Text style={styles.contentText}>聯絡信箱：team@lucidbook.tw</Text>
            </View>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            © 2025 路晰書股份有限公司. All rights reserved.
          </Text>
          <TouchableOpacity 
            style={styles.privacyLink}
            onPress={() => navigation.navigate('PrivacyPolicy')}
          >
            <Text style={styles.privacyLinkText}>隱私權政策</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
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
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
  },
  headerSpacer: {
    width: 40,
  },
  
  // ScrollView
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 80,
  },
  
  // Header Section
  headerSection: {
    marginBottom: 32,
  },
  mainTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2D3748',
    marginBottom: 8,
  },
  updateDate: {
    fontSize: 12,
    color: '#718096',
    marginBottom: 16,
  },
  introCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  introText: {
    fontSize: 14,
    color: '#4A5568',
    lineHeight: 22,
  },
  
  // Terms Container
  termsContainer: {
    gap: 32,
  },
  
  // Section
  section: {
    marginBottom: 0,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2D3748',
    marginBottom: 12,
  },
  contentCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  contentText: {
    fontSize: 14,
    color: '#4A5568',
    lineHeight: 22,
    marginBottom: 12,
  },
  bulletList: {
    marginBottom: 12,
  },
  bulletItem: {
    fontSize: 14,
    color: '#4A5568',
    lineHeight: 22,
    marginBottom: 6,
  },
  
  // Footer
  footer: {
    alignItems: 'center',
    paddingTop: 32,
    paddingBottom: 20,
  },
  footerText: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 12,
  },
  privacyLink: {
    marginTop: 8,
  },
  privacyLinkText: {
    fontSize: 12,
    color: '#166CB5',
    textDecorationLine: 'underline',
  },
});

export default TermsOfServiceScreen;