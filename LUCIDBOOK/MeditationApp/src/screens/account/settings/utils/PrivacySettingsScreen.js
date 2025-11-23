// ==========================================
// 檔案名稱: PrivacySettingsScreen.js
// 功能: 隱私設定頁面
// 
// ✅ 漸層開關按鈕設計
// ✅ 隱私保護承諾卡片
// ✅ 4個隱私設定項目
// ✅ 資料管理功能
// 🎨 統一設計風格
// ==========================================

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  StatusBar,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';

const PrivacySettingsScreen = ({ navigation }) => {
  const [shareData, setShareData] = useState(true);
  const [showProfile, setShowProfile] = useState(true);
  const [allowAnalytics, setAllowAnalytics] = useState(true);
  const [marketingEmails, setMarketingEmails] = useState(false);

  const privacySettings = [
    {
      id: 'share-data',
      title: '分享匿名使用數據',
      description: '幫助我們改善應用程式，您的個人資料會被加密處理',
      icon: 'help-circle-outline',
      value: shareData,
      onChange: setShareData,
    },
    {
      id: 'show-profile',
      title: '顯示個人資料',
      description: '讓其他使用者看到您的名稱和頭貼',
      icon: 'eye-outline',
      value: showProfile,
      onChange: setShowProfile,
    },
    {
      id: 'analytics',
      title: '使用分析',
      description: '允許我們收集使用情況分析以改善服務',
      icon: 'analytics-outline',
      value: allowAnalytics,
      onChange: setAllowAnalytics,
    },
    {
      id: 'marketing',
      title: '接收行銷訊息',
      description: '接收最新功能、活動和優惠資訊',
      icon: 'mail-outline',
      value: marketingEmails,
      onChange: setMarketingEmails,
    },
  ];

  const handleDownloadData = () => {
    Alert.alert('下載資料', '您的資料將會在24小時內準備完成，我們會透過電子郵件通知您。');
  };

  const handleClearCache = () => {
    Alert.alert(
      '清除快取',
      '確定要清除快取資料嗎？',
      [
        { text: '取消', style: 'cancel' },
        { text: '確定', onPress: () => Alert.alert('成功', '快取已清除') }
      ]
    );
  };

  const handleDeleteData = () => {
    Alert.alert(
      '刪除所有資料',
      '⚠️ 此操作無法復原！確定要刪除所有個人資料嗎？',
      [
        { text: '取消', style: 'cancel' },
        { 
          text: '確定刪除', 
          style: 'destructive',
          onPress: () => Alert.alert('已刪除', '您的資料已被刪除')
        }
      ]
    );
  };

  // 渲染漸層開關
  const renderGradientToggle = (value, onChange) => (
    <TouchableOpacity
      style={styles.toggleButton}
      onPress={() => onChange(!value)}
      activeOpacity={0.8}
    >
      {value ? (
        <LinearGradient
          colors={['#166CB5', '#31C6FE']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.toggleButtonGradient}
        >
          <View style={[styles.toggleKnob, styles.toggleKnobActive]} />
        </LinearGradient>
      ) : (
        <View style={styles.toggleButtonInactive}>
          <View style={styles.toggleKnob} />
        </View>
      )}
    </TouchableOpacity>
  );

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
          
          <Text style={styles.headerTitle}>隱私設定</Text>
          
          <View style={styles.headerSpacer} />
        </View>
        
        <Text style={styles.headerSubtitle}>
          管理您的隱私偏好和資料分享設定
        </Text>
      </LinearGradient>

      {/* Content */}
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Privacy Info */}
        <View style={styles.infoCard}>
          <View style={styles.infoIconContainer}>
            <LinearGradient
              colors={['#166CB5', '#31C6FE']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.infoIconGradient}
            >
              <Ionicons name="shield-checkmark" size={20} color="#FFF" />
            </LinearGradient>
          </View>
          <View style={styles.infoTextContainer}>
            <Text style={styles.infoTitle}>隱私保護承諾</Text>
            <Text style={styles.infoText}>
              我們致力於保護您的隱私。您的個人資料採用高級加密技術儲存，絕不會在未經您同意的情況下分享給第三方。
            </Text>
          </View>
        </View>

        {/* Privacy Settings */}
        <View style={styles.settingsSection}>
          {privacySettings.map((setting) => (
            <View key={setting.id} style={styles.settingCard}>
              <View style={styles.settingIconContainer}>
                <Ionicons name={setting.icon} size={24} color="#166CB5" />
              </View>
              <View style={styles.settingContent}>
                <Text style={styles.settingTitle}>{setting.title}</Text>
                <Text style={styles.settingDescription}>{setting.description}</Text>
              </View>
              {renderGradientToggle(setting.value, setting.onChange)}
            </View>
          ))}
        </View>

        {/* Data Management */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>資料管理</Text>
          
          <TouchableOpacity 
            style={styles.actionButtonBlue}
            onPress={handleDownloadData}
            activeOpacity={0.7}
          >
            <Text style={styles.actionButtonTextBlue}>下載我的資料</Text>
            <Ionicons name="cloud-download-outline" size={20} color="#166CB5" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionButtonYellow}
            onPress={handleClearCache}
            activeOpacity={0.7}
          >
            <Text style={styles.actionButtonTextYellow}>清除快取資料</Text>
            <Ionicons name="trash-outline" size={20} color="#92400E" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionButtonRed}
            onPress={handleDeleteData}
            activeOpacity={0.7}
          >
            <Text style={styles.actionButtonTextRed}>刪除所有個人資料</Text>
            <Ionicons name="warning-outline" size={20} color="#991B1B" />
          </TouchableOpacity>
        </View>

        {/* Footer Note */}
        <View style={styles.footerNote}>
          <Text style={styles.footerText}>
            更改隱私設定可能影響應用程式的某些功能。如需了解更多資訊，請參閱我們的
            <Text style={styles.footerLink}> 隱私權政策</Text>。
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
  
  // Header
  header: {
    paddingTop: 50,
    paddingBottom: 24,
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
    marginBottom: 12,
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
  headerSubtitle: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.8)',
    paddingHorizontal: 8,
    textAlign: 'center',
  },
  
  // ScrollView
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  
  // Info Card
  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#EFF6FF',
    borderRadius: 20,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  infoIconContainer: {
    marginRight: 12,
  },
  infoIconGradient: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoTextContainer: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 6,
  },
  infoText: {
    fontSize: 13,
    color: '#4B5563',
    lineHeight: 19,
  },
  
  // Settings Section
  settingsSection: {
    marginBottom: 24,
  },
  settingCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  settingIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingContent: {
    flex: 1,
    marginRight: 12,
  },
  settingTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 18,
  },

  // Toggle Button - 漸層設計
  toggleButton: {
    width: 52,
    height: 30,
    borderRadius: 15,
    overflow: 'hidden',
  },
  toggleButtonGradient: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingHorizontal: 3,
  },
  toggleButtonInactive: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingHorizontal: 3,
    backgroundColor: '#D1D5DB',
    borderRadius: 15,
  },
  toggleKnob: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  toggleKnobActive: {
    // 位置由父容器控制
  },
  
  // Section
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 12,
  },
  
  // Action Buttons
  actionButtonBlue: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#DBEAFE',
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
  },
  actionButtonTextBlue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1f3984ff',
  },
  actionButtonYellow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FEF3C7',
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
  },
  actionButtonTextYellow: {
    fontSize: 15,
    fontWeight: '600',
    color: '#92400E',
  },
  actionButtonRed: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FEE2E2',
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
  },
  actionButtonTextRed: {
    fontSize: 15,
    fontWeight: '600',
    color: '#991B1B',
  },
  
  // Footer Note
  footerNote: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 16,
  },
  footerText: {
    fontSize: 12,
    color: '#6B7280',
    lineHeight: 18,
  },
  footerLink: {
    color: '#166CB5',
    textDecorationLine: 'underline',
  },

  bottomPadding: {
    height: 40,
  },
});

export default PrivacySettingsScreen;