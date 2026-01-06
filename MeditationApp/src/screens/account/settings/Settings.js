// ==========================================
// 檔案名稱: Settings.js
// 版本: V2.1 - 修復 Android 白色方框問題
// 
// ✅ 簡化為兩大區塊：帳號管理、支援
// ✅ 底部顯示：登出、服務條款、隱私權政策、版本
// ✅ 新增刪除帳號功能
// ✅ 修復 Android 白色方框問題（統一 iOS/Android 顯示）
// ==========================================

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  StatusBar,
  Alert,
  Platform,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import ApiService from '../../../../api';

const Settings = ({ navigation }) => {

  const handleNavigateToProfile = () => {
    navigation.navigate('ProfileEdit');
  };

  const handleNavigateToPassword = () => {
    navigation.navigate('ResetPassword');
  };

  const handleNavigateToDeleteAccount = () => {
    navigation.navigate('DeleteAccount');
  };

  const handleNavigateToHelp = () => {
    navigation.navigate('HelpCenter');
  };

  const handleNavigateToTerms = () => {
    navigation.navigate('TermsOfService');
  };

  const handleNavigateToPrivacyPolicy = () => {
    navigation.navigate('PrivacyPolicy');
  };

  const handleLogout = () => {
    Alert.alert(
      '登出確認',
      '確定要登出嗎？',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '登出',
          style: 'destructive',
          onPress: async () => {
            try {
              await ApiService.logout();
              navigation.reset({
                index: 0,
                routes: [{ name: 'Login' }],
              });
            } catch (error) {
              console.error('登出失敗:', error);
            }
          }
        }
      ]
    );
  };

  const renderMenuItem = (icon, label, subLabel, onPress, isDanger = false) => (
    <TouchableOpacity
      style={styles.menuItem}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.menuItemLeft}>
        <View style={[
          styles.iconContainer,
          { backgroundColor: isDanger ? 'rgba(239, 68, 68, 0.1)' : 'rgba(22, 108, 181, 0.1)' }
        ]}>
          <Ionicons 
            name={icon} 
            size={24} 
            color={isDanger ? '#EF4444' : '#166CB5'} 
          />
        </View>
        <View style={styles.menuItemTextContainer}>
          <Text style={[
            styles.menuItemLabel,
            isDanger && { color: '#EF4444' }
          ]}>
            {label}
          </Text>
          {subLabel && (
            <Text style={styles.menuItemSubLabel}>{subLabel}</Text>
          )}
        </View>
      </View>
      <Ionicons 
        name="chevron-forward" 
        size={20} 
        color={isDanger ? 'rgba(239, 68, 68, 0.3)' : '#D1D5DB'} 
      />
    </TouchableOpacity>
  );

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
          <Text style={styles.headerTitle}>設定</Text>
          <View style={styles.headerSpacer} />
        </View>
      </LinearGradient>

      {/* Content */}
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 帳號管理 */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionIndicator} />
            <Text style={styles.sectionTitle}>帳號管理</Text>
          </View>
          <View style={styles.sectionCard}>
            {renderMenuItem(
              'person-outline',
              '個人資料',
              '包含頭像、姓名、所屬公司顯示',
              handleNavigateToProfile
            )}
            <View style={styles.divider} />
            {renderMenuItem(
              'lock-closed-outline',
              '修改密碼',
              null,
              handleNavigateToPassword
            )}
            <View style={styles.divider} />
            {renderMenuItem(
              'trash-outline',
              '刪除帳號',
              null,
              handleNavigateToDeleteAccount,
              true
            )}
          </View>
        </View>

        {/* 支援 */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionIndicator} />
            <Text style={styles.sectionTitle}>支援</Text>
          </View>
          <View style={styles.sectionCard}>
            {renderMenuItem(
              'help-circle-outline',
              '幫助中心',
              '聯絡客服',
              handleNavigateToHelp
            )}
          </View>
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <View style={styles.footerLinks}>
          <TouchableOpacity onPress={handleLogout}>
            <Text style={styles.footerLink}>登出</Text>
          </TouchableOpacity>
          
          <View style={styles.footerDivider} />
          
          <TouchableOpacity onPress={handleNavigateToTerms}>
            <Text style={styles.footerLink}>服務條款</Text>
          </TouchableOpacity>
          
          <View style={styles.footerDivider} />
          
          <TouchableOpacity onPress={handleNavigateToPrivacyPolicy}>
            <Text style={styles.footerLink}>隱私權政策</Text>
          </TouchableOpacity>
          
          <View style={styles.footerDivider} />
          
          <Text style={styles.footerVersion}>v1.0.0</Text>
        </View>
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
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
    }),
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
    fontWeight: '600',
    color: '#FFF',
  },
  headerSpacer: {
    width: 40,
  },

  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 100,
  },

  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  sectionIndicator: {
    width: 4,
    height: 16,
    backgroundColor: '#166CB5',
    borderRadius: 2,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  // ⭐ 修復：Android 白色方框問題
  sectionCard: {
    backgroundColor: '#FFFFFF',  // ⭐ 改為不透明背景
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F3F4F6',  // ⭐ 添加邊框增強視覺
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,  // ⭐ Android 使用 elevation
      },
    }),
  },

  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 20,
    paddingHorizontal: 16,
    backgroundColor: 'transparent',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  menuItemTextContainer: {
    flex: 1,
  },
  menuItemLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
  },
  menuItemSubLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },

  divider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginHorizontal: 16,  // ⭐ 添加左右邊距讓分隔線不碰到邊緣
  },

  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingVertical: 32,
    backgroundColor: '#F5F7FA',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  footerLinks: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingHorizontal: 16,
  },
  footerLink: {
    fontSize: 12,
    fontWeight: '500',
    color: '#9CA3AF',
  },
  footerDivider: {
    width: 1,
    height: 12,
    backgroundColor: '#D1D5DB',
  },
  footerVersion: {
    fontSize: 12,
    color: '#9CA3AF',
  },
});

export default Settings;