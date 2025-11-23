// ==========================================
// 檔案名稱: TermsOfServiceScreen.js
// 功能: 使用者條款頁面
// 🎨 統一設計風格
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
import { Ionicons } from '@expo/vector-icons';

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
        <View style={styles.section}>
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
          </View>
        </View>

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
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>五、帳號使用與安全</Text>
          <View style={styles.contentCard}>
            <Text style={styles.contentText}>
              您在註冊帳號時，應提供真實且有效之基本資料，並維持資料之正確性與即時更新。
            </Text>
            <Text style={styles.contentText}>
              您有責任妥善保管帳號與密碼，不得轉讓、出租、借用或以其他方式提供第三人使用。
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>六、使用者內容與隱私</Text>
          <View style={styles.contentCard}>
            <Text style={styles.contentText}>
              本服務中之自我書寫、情緒紀錄、個人反思與其他文字內容（以下稱「使用者內容」），主要目的為協助您進行自我探索與心理練習。
            </Text>
            <Text style={styles.contentText}>
              本公司將依「隱私權政策」之規範處理與保護您的個人資料與使用紀錄，並採取合理且適當之技術與管理措施，以保障資料安全。
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>七、智慧財產權</Text>
          <View style={styles.contentCard}>
            <Text style={styles.contentText}>
              本服務中所有內容，包括但不限於：程式碼、系統設計、介面設計、圖像、圖標、文字、影音、引導腳本、心理肌力訓練流程、評估工具、題目設計、品牌名稱與標識等，均由本公司或合法授權人享有著作權、專利權、商標權及其他相關智慧財產權。
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>八、禁止行為</Text>
          <View style={styles.contentCard}>
            <Text style={styles.contentText}>
              為維護本服務之正常運作與其他使用者之權益，您同意不從事下列行為：
            </Text>
            <View style={styles.bulletList}>
              <Text style={styles.bulletItem}>• 未經授權擷取、重製、改作、散佈本服務內容</Text>
              <Text style={styles.bulletItem}>• 將帳號轉售、出租或提供第三人使用</Text>
              <Text style={styles.bulletItem}>• 破解、繞過技術防護措施</Text>
              <Text style={styles.bulletItem}>• 干擾或破壞服務系統或網路安全</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>九、聯絡方式</Text>
          <View style={styles.contentCard}>
            <Text style={styles.contentText}>
              如您對本條款或本服務有任何疑問，歡迎透過以下方式聯繫我們：
            </Text>
            <Text style={styles.contentText}>
              公司名稱：路晰書股份有限公司
            </Text>
            <Text style={styles.contentText}>
              聯絡信箱：team@lucidbook.tw
            </Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            © 2025 路晰書股份有限公司. All rights reserved.
          </Text>
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
    paddingBottom: 20,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
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
    fontWeight: '700',
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
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  
  // Sections
  section: {
    marginBottom: 24,
  },
  mainTitle: {
    fontSize: 24,
    fontWeight: '700',
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
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  introText: {
    fontSize: 13,
    color: '#4A5568',
    lineHeight: 20,
  },
  
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2D3748',
    marginBottom: 12,
  },
  contentCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  contentText: {
    fontSize: 13,
    color: '#4A5568',
    lineHeight: 20,
    marginBottom: 12,
  },
  bulletList: {
    marginBottom: 12,
  },
  bulletItem: {
    fontSize: 13,
    color: '#4A5568',
    lineHeight: 20,
    marginBottom: 4,
  },
  
  // Footer
  footer: {
    alignItems: 'center',
    paddingTop: 24,
    paddingBottom: 20,
  },
  footerText: {
    fontSize: 11,
    color: '#9CA3AF',
  },
});

export default TermsOfServiceScreen;