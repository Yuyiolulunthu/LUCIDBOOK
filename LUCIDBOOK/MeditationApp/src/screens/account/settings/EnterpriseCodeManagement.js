// ==========================================
// 檔案名稱: EnterpriseCodeManagement.js
// 功能: 企業引薦碼管理頁面
// 
// ✅ 顯示當前引薦碼
// ✅ 顯示效期資訊
// ✅ 修改/刪除引薦碼
// ✅ 顯示企業專屬福利
// ==========================================

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Alert,
  ActivityIndicator,
  ScrollView,
  RefreshControl,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';
import {
  getEnterpriseCodeInfo,
  clearEnterpriseCode,
  formatExpiryDate,
  getEnterpriseFeatures,
} from './utils/enterpriseCodeUtils';

const EnterpriseCodeManagement = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [codeInfo, setCodeInfo] = useState({
    code: null,
    enterpriseName: null,
    expiryDate: null,
    daysRemaining: null,
  });
  const [features, setFeatures] = useState([]);

  // 載入企業引薦碼資訊
  const loadCodeInfo = async () => {
    try {
      const info = await getEnterpriseCodeInfo();
      setCodeInfo(info);
      
      if (info.code) {
        const enterpriseFeatures = await getEnterpriseFeatures();
        setFeatures(enterpriseFeatures);
      } else {
        setFeatures([]);
      }
    } catch (error) {
      console.error('載入企業引薦碼資訊失敗:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadCodeInfo();
  }, []);

  // 當頁面獲得焦點時重新載入
  useFocusEffect(
    useCallback(() => {
      loadCodeInfo();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadCodeInfo();
  };

  const handleModifyCode = () => {
    navigation.navigate('EnterpriseCode', { fromManagement: true });
  };

  const handleDeleteCode = () => {
    Alert.alert(
      '確認刪除',
      '刪除後將無法存取企業專屬功能，確定要刪除引薦碼嗎？',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '刪除',
          style: 'destructive',
          onPress: async () => {
            const success = await clearEnterpriseCode();
            if (success) {
              Alert.alert('成功', '已刪除企業引薦碼', [
                { text: '確定', onPress: () => loadCodeInfo() }
              ]);
            } else {
              Alert.alert('錯誤', '刪除失敗，請稍後再試');
            }
          }
        }
      ]
    );
  };

  const renderFeatureItem = (feature) => (
    <View key={feature.id} style={styles.featureItem}>
      <Ionicons 
        name={feature.enabled ? 'checkmark-circle' : 'close-circle'} 
        size={20} 
        color={feature.enabled ? '#10B981' : '#9CA3AF'} 
      />
      <Text style={[
        styles.featureText,
        !feature.enabled && styles.featureTextDisabled
      ]}>
        {feature.name}
      </Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#166CB5" />
        <LinearGradient
          colors={['#166CB5', '#31C6FE']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>企業引薦碼</Text>
          <View style={{ width: 40 }} />
        </LinearGradient>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#166CB5" />
        </View>
      </View>
    );
  }

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
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>企業引薦碼</Text>
        
        <View style={{ width: 40 }} />
      </LinearGradient>

      {/* Subtitle */}
      <View style={styles.subtitleContainer}>
        <Text style={styles.subtitle}>管理您的企業引薦碼設定</Text>
      </View>

      {/* Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {codeInfo.code ? (
          <>
            {/* Current Code Card */}
            <View style={styles.codeCard}>
              <View style={styles.codeHeader}>
                <View style={styles.iconContainer}>
                  <Ionicons name="briefcase" size={24} color="#166CB5" />
                </View>
                <View style={styles.codeInfo}>
                  <Text style={styles.codeLabel}>目前引薦碼</Text>
                  <Text style={styles.codeValue}>{codeInfo.code}</Text>
                  {codeInfo.enterpriseName && (
                    <Text style={styles.enterpriseName}>
                      {codeInfo.enterpriseName}
                    </Text>
                  )}
                </View>
              </View>

              {/* Expiry Info */}
              {codeInfo.expiryDate && (
                <View style={[
                  styles.expiryContainer,
                  codeInfo.daysRemaining <= 7 && styles.expiryWarning
                ]}>
                  <Ionicons 
                    name="time-outline" 
                    size={16} 
                    color={codeInfo.daysRemaining <= 7 ? '#EF4444' : '#6B7280'} 
                  />
                  <Text style={[
                    styles.expiryText,
                    codeInfo.daysRemaining <= 7 && styles.expiryTextWarning
                  ]}>
                    有效期限：{formatExpiryDate(codeInfo.expiryDate)}
                  </Text>
                </View>
              )}

              {codeInfo.daysRemaining !== null && (
                <View style={styles.daysRemainingContainer}>
                  <Text style={[
                    styles.daysRemainingText,
                    codeInfo.daysRemaining <= 7 && styles.daysRemainingWarning
                  ]}>
                    剩餘 {codeInfo.daysRemaining} 天
                  </Text>
                </View>
              )}

              {/* Action Buttons */}
              <View style={styles.actionButtons}>
                <TouchableOpacity 
                  style={styles.modifyButton}
                  onPress={handleModifyCode}
                >
                  <Text style={styles.modifyButtonText}>修改引薦碼</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.deleteButton}
                  onPress={handleDeleteCode}
                >
                  <Ionicons name="trash-outline" size={20} color="#EF4444" />
                </TouchableOpacity>
              </View>
            </View>

            {/* About Enterprise Code */}
            <View style={styles.infoCard}>
              <Text style={styles.infoTitle}>關於企業引薦碼</Text>
              <View style={styles.infoContent}>
                <View style={styles.infoItem}>
                  <Ionicons name="ellipse" size={6} color="#6B7280" />
                  <Text style={styles.infoText}>
                    企業引薦碼由您的公司或組織提供
                  </Text>
                </View>
                <View style={styles.infoItem}>
                  <Ionicons name="ellipse" size={6} color="#6B7280" />
                  <Text style={styles.infoText}>
                    使用引薦碼可享有專屬功能和優惠
                  </Text>
                </View>
                <View style={styles.infoItem}>
                  <Ionicons name="ellipse" size={6} color="#6B7280" />
                  <Text style={styles.infoText}>
                    您可以隨時修改或移除引薦碼
                  </Text>
                </View>
                <View style={styles.infoItem}>
                  <Ionicons name="ellipse" size={6} color="#6B7280" />
                  <Text style={styles.infoText}>
                    如有疑問，請聯絡您的企業管理員
                  </Text>
                </View>
              </View>
            </View>

            {/* Enterprise Benefits */}
            {features.length > 0 && (
              <View style={styles.benefitsCard}>
                <Text style={styles.benefitsTitle}>企業專屬福利</Text>
                <View style={styles.featuresList}>
                  {features.map(renderFeatureItem)}
                </View>
              </View>
            )}
          </>
        ) : (
          // No Code State
          <View style={styles.noCodeContainer}>
            <View style={styles.noCodeIcon}>
              <Ionicons name="business-outline" size={48} color="#9CA3AF" />
            </View>
            <Text style={styles.noCodeTitle}>尚未設定企業引薦碼</Text>
            <Text style={styles.noCodeDescription}>
              輸入企業提供的引薦碼即可解鎖專屬練習模組和進階功能
            </Text>
            
            <TouchableOpacity 
              style={styles.addCodeButton}
              onPress={() => navigation.navigate('EnterpriseCode')}
            >
              <Ionicons name="add-circle-outline" size={20} color="#FFF" />
              <Text style={styles.addCodeButtonText}>輸入引薦碼</Text>
            </TouchableOpacity>

            {/* Benefits Preview */}
            <View style={styles.previewCard}>
              <Text style={styles.previewTitle}>企業專屬福利包含：</Text>
              <View style={styles.featuresList}>
                <View style={styles.featureItem}>
                  <Ionicons name="star-outline" size={18} color="#6B7280" />
                  <Text style={styles.featureTextPreview}>免費進階功能存取</Text>
                </View>
                <View style={styles.featureItem}>
                  <Ionicons name="book-outline" size={18} color="#6B7280" />
                  <Text style={styles.featureTextPreview}>專屬企業練習課程</Text>
                </View>
                <View style={styles.featureItem}>
                  <Ionicons name="analytics-outline" size={18} color="#6B7280" />
                  <Text style={styles.featureTextPreview}>團隊統計報告</Text>
                </View>
                <View style={styles.featureItem}>
                  <Ionicons name="headset-outline" size={18} color="#6B7280" />
                  <Text style={styles.featureTextPreview}>優先客服支援</Text>
                </View>
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
  },

  // Subtitle
  subtitleContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#166CB5',
  },
  subtitle: {
    fontSize: 14,
    color: '#FFF',
    opacity: 0.9,
  },

  // Loading
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Scroll View
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },

  // Code Card
  codeCard: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  codeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  codeInfo: {
    flex: 1,
  },
  codeLabel: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 4,
  },
  codeValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#166CB5',
    letterSpacing: 2,
  },
  enterpriseName: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 2,
  },

  // Expiry
  expiryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    marginBottom: 8,
  },
  expiryWarning: {
    backgroundColor: '#FEF2F2',
  },
  expiryText: {
    fontSize: 13,
    color: '#6B7280',
  },
  expiryTextWarning: {
    color: '#EF4444',
    fontWeight: '500',
  },
  daysRemainingContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  daysRemainingText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#10B981',
  },
  daysRemainingWarning: {
    color: '#EF4444',
  },

  // Action Buttons
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modifyButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
  },
  modifyButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#166CB5',
  },
  deleteButton: {
    width: 48,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#FEF2F2',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Info Card
  infoCard: {
    backgroundColor: '#EFF6FF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  infoContent: {
    gap: 10,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    paddingLeft: 4,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },

  // Benefits Card
  benefitsCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  benefitsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  featuresList: {
    gap: 12,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  featureText: {
    fontSize: 15,
    color: '#1F2937',
  },
  featureTextDisabled: {
    color: '#9CA3AF',
  },
  featureTextPreview: {
    fontSize: 14,
    color: '#6B7280',
  },

  // No Code State
  noCodeContainer: {
    alignItems: 'center',
    paddingTop: 40,
  },
  noCodeIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  noCodeTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  noCodeDescription: {
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  addCodeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 16,
    backgroundColor: '#166CB5',
    marginBottom: 32,
  },
  addCodeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },

  // Preview Card
  previewCard: {
    width: '100%',
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  previewTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
});

export default EnterpriseCodeManagement;