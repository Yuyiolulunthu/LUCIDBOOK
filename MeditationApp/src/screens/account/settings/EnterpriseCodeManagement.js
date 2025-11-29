// ==========================================
// 檔案名稱: EnterpriseCodeManagement.js
// 功能: 企業引薦碼管理頁面
// 
// ✅ 顯示當前引薦碼
// ✅ 顯示效期資訊
// ✅ 修改/刪除引薦碼
// ✅ 顯示企業專屬福利
// ✅ 刪除確認 Modal
// 🎨 依照設計程式風格更新
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
  TextInput,
  Modal,
  Animated,
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
import ApiService from '../../../../api';

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
  
  // 編輯狀態
  const [isEditing, setIsEditing] = useState(false);
  const [newCode, setNewCode] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);
  const [error, setError] = useState('');

  // 載入企業引薦碼資訊
  const loadCodeInfo = async () => {
    try {
      console.log('🔍 [EnterpriseCodeManagement] 開始載入引薦碼資訊...');
      
      // ⭐ 從 API 獲取用戶資料（包含企業引薦碼）
      const response = await ApiService.getUserProfile();
      
      if (response && response.user) {
        const enterpriseCode = response.user.enterprise_code;
        console.log('📋 [EnterpriseCodeManagement] 企業引薦碼:', enterpriseCode);
        
        if (enterpriseCode) {
          // 有企業引薦碼
          setCodeInfo({
            code: enterpriseCode,
            enterpriseName: response.user.enterprise_name || '企業用戶',
            expiryDate: null, // 如果後端有效期資料，從這裡獲取
            daysRemaining: null,
          });
          
          // 獲取企業功能列表
          const enterpriseFeatures = await getEnterpriseFeatures();
          setFeatures(enterpriseFeatures);
        } else {
          // 沒有企業引薦碼
          console.log('⚠️ [EnterpriseCodeManagement] 用戶沒有企業引薦碼');
          setCodeInfo({
            code: null,
            enterpriseName: null,
            expiryDate: null,
            daysRemaining: null,
          });
          setFeatures([]);
        }
      } else {
        console.log('⚠️ [EnterpriseCodeManagement] 無法獲取用戶資料');
        setCodeInfo({
          code: null,
          enterpriseName: null,
          expiryDate: null,
          daysRemaining: null,
        });
        setFeatures([]);
      }
    } catch (error) {
      console.error('❌ [EnterpriseCodeManagement] 載入企業引薦碼資訊失敗:', error);
      setCodeInfo({
        code: null,
        enterpriseName: null,
        expiryDate: null,
        daysRemaining: null,
      });
      setFeatures([]);
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
    setIsEditing(true);
    setNewCode('');
    setError('');
  };

  const handleSaveCode = async () => {
    setError('');

    if (!newCode.trim()) {
      setError('請輸入引薦碼');
      return;
    }

    if (newCode.length < 4) {
      setError('引薦碼長度至少需要 4 個字元');
      return;
    }

    setIsSaving(true);
    
    try {
      console.log('💾 [EnterpriseCodeManagement] 開始驗證新引薦碼:', newCode);
      
      // ⭐ 呼叫 API 驗證引薦碼
      const response = await ApiService.verifyEnterpriseCode(newCode.toUpperCase());
      
      if (response && response.success) {
        console.log('✅ [EnterpriseCodeManagement] 引薦碼驗證成功');
        
        setIsSaving(false);
        setNewCode('');
        setIsEditing(false);
        setShowSuccess(true);

        setTimeout(() => {
          setShowSuccess(false);
          loadCodeInfo(); // 重新載入
        }, 2000);
      } else {
        console.error('❌ [EnterpriseCodeManagement] 引薦碼無效');
        setError(response.message || '引薦碼無效或已過期');
        setIsSaving(false);
      }
    } catch (error) {
      console.error('❌ [EnterpriseCodeManagement] 驗證失敗:', error);
      setError('驗證失敗，請稍後再試');
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setNewCode('');
    setError('');
  };

  const handleDeleteCode = () => {
    setShowRemoveConfirm(true);
  };

  const confirmDeleteCode = async () => {
    setIsSaving(true);
    
    try {
      console.log('🗑️ [EnterpriseCodeManagement] 開始刪除引薦碼...');
      
      // ⭐ 呼叫 API 清除資料庫中的引薦碼
      // 假設你有一個 API 端點可以清除引薦碼
      // 如果沒有，需要在後端創建一個
      const response = await ApiService.clearEnterpriseCode();
      
      if (response && response.success) {
        console.log('✅ [EnterpriseCodeManagement] 引薦碼已刪除');
        
        // 同時清除本地 AsyncStorage
        await clearEnterpriseCode();
        
        setShowRemoveConfirm(false);
        setShowSuccess(true);
        
        setTimeout(() => {
          setShowSuccess(false);
          loadCodeInfo(); // 重新載入
        }, 2000);
      } else {
        console.error('❌ [EnterpriseCodeManagement] API 返回失敗');
        Alert.alert('錯誤', '刪除失敗，請稍後再試');
      }
    } catch (error) {
      console.error('❌ [EnterpriseCodeManagement] 刪除失敗:', error);
      Alert.alert('錯誤', '刪除失敗，請稍後再試');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddCode = () => {
    navigation.navigate('EnterpriseCode', { fromManagement: true });
  };

  // Loading 狀態
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
          <View style={styles.headerTop}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="arrow-back" size={20} color="#FFF" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>企業引薦碼</Text>
            <View style={styles.headerPlaceholder} />
          </View>
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
        <View style={styles.headerTop}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={20} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>企業引薦碼</Text>
          <View style={styles.headerPlaceholder} />
        </View>
        <Text style={styles.headerSubtitle}>管理您的企業引薦碼設定</Text>
      </LinearGradient>

      {/* Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Success Message */}
        {showSuccess && (
          <View style={styles.successMessage}>
            <Ionicons name="checkmark-circle" size={20} color="#059669" />
            <Text style={styles.successText}>變更已儲存</Text>
          </View>
        )}

        {/* Error Message */}
        {error ? (
          <View style={styles.errorMessage}>
            <Ionicons name="alert-circle" size={20} color="#DC2626" />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        {codeInfo.code ? (
          <>
            {/* Current Code Card */}
            <View style={styles.codeCard}>
              <View style={styles.codeHeader}>
                <LinearGradient
                  colors={['#166CB5', '#31C6FE']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.codeIconContainer}
                >
                  <Ionicons name="business" size={24} color="#FFF" />
                </LinearGradient>
                <View style={styles.codeInfo}>
                  <Text style={styles.codeLabel}>目前引薦碼</Text>
                  {codeInfo.code ? (
                    <Text style={styles.codeValue}>{codeInfo.code}</Text>
                  ) : (
                    <Text style={styles.codeEmpty}>尚未設定</Text>
                  )}
                </View>
              </View>

              {/* Action Buttons - 只在非編輯模式顯示 */}
              {!isEditing && (
                <View style={styles.actionButtons}>
                  <TouchableOpacity 
                    style={styles.modifyButton}
                    onPress={handleModifyCode}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.modifyButtonText}>修改引薦碼</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={styles.deleteButton}
                    onPress={handleDeleteCode}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="trash-outline" size={20} color="#EF4444" />
                  </TouchableOpacity>
                </View>
              )}
            </View>

            {/* Edit Form */}
            {isEditing && (
              <View style={styles.editCard}>
                <View style={styles.editSection}>
                  <Text style={styles.editLabel}>新的引薦碼</Text>
                  <TextInput
                    style={styles.editInput}
                    value={newCode}
                    onChangeText={(text) => setNewCode(text.toUpperCase())}
                    placeholder="ABC123"
                    placeholderTextColor="#9CA3AF"
                    maxLength={10}
                    autoCapitalize="characters"
                  />
                  <Text style={styles.editHint}>請輸入您的企業提供的引薦碼</Text>
                </View>

                <View style={styles.editButtons}>
                  <TouchableOpacity 
                    style={[
                      styles.saveButton,
                      (!newCode.trim() || isSaving) && styles.saveButtonDisabled
                    ]}
                    onPress={handleSaveCode}
                    disabled={!newCode.trim() || isSaving}
                    activeOpacity={0.8}
                  >
                    {isSaving ? (
                      <ActivityIndicator color="#FFF" size="small" />
                    ) : (
                      <Text style={[
                        styles.saveButtonText,
                        (!newCode.trim()) && styles.saveButtonTextDisabled
                      ]}>更新引薦碼</Text>
                    )}
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={styles.cancelButton}
                    onPress={handleCancelEdit}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.cancelButtonText}>取消</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* Info Card */}
            <View style={styles.infoCard}>
              <Text style={styles.infoTitle}>關於企業引薦碼</Text>
              <View style={styles.infoList}>
                <View style={styles.infoItem}>
                  <Text style={styles.infoBullet}>•</Text>
                  <Text style={styles.infoText}>企業引薦碼由您的公司或組織提供</Text>
                </View>
                <View style={styles.infoItem}>
                  <Text style={styles.infoBullet}>•</Text>
                  <Text style={styles.infoText}>使用引薦碼可享有專屬功能和優惠</Text>
                </View>
                <View style={styles.infoItem}>
                  <Text style={styles.infoBullet}>•</Text>
                  <Text style={styles.infoText}>您可以隨時修改或移除引薦碼</Text>
                </View>
                <View style={styles.infoItem}>
                  <Text style={styles.infoBullet}>•</Text>
                  <Text style={styles.infoText}>如有疑問，請聯絡您的企業管理員</Text>
                </View>
              </View>
            </View>

            {/* Benefits Card */}
            <View style={styles.benefitsCard}>
              <Text style={styles.benefitsTitle}>企業專屬福利</Text>
              <View style={styles.benefitsList}>
                {[
                  '免費進階功能存取',
                  '專屬企業練習課程',
                  '團隊統計報告',
                  '優先客服支援',
                ].map((benefit, index) => (
                  <View key={index} style={styles.benefitItem}>
                    <Ionicons name="checkmark" size={16} color="#059669" />
                    <Text style={styles.benefitText}>{benefit}</Text>
                  </View>
                ))}
              </View>
            </View>
          </>
        ) : (
          /* No Code State */
          <>
            {/* Empty State Card */}
            <View style={styles.emptyCard}>
              <View style={styles.emptyIconContainer}>
                <Ionicons name="business-outline" size={48} color="#9CA3AF" />
              </View>
              <Text style={styles.emptyTitle}>尚未設定企業引薦碼</Text>
              <Text style={styles.emptyDescription}>
                輸入企業提供的引薦碼即可解鎖專屬練習模組和進階功能
              </Text>
              
              <TouchableOpacity 
                style={styles.addCodeButton}
                onPress={handleAddCode}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={['#166CB5', '#31C6FE']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.addCodeButtonGradient}
                >
                  <Ionicons name="add-circle-outline" size={20} color="#FFF" />
                  <Text style={styles.addCodeButtonText}>輸入引薦碼</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>

            {/* Info Card */}
            <View style={styles.infoCard}>
              <Text style={styles.infoTitle}>關於企業引薦碼</Text>
              <View style={styles.infoList}>
                <View style={styles.infoItem}>
                  <Text style={styles.infoBullet}>•</Text>
                  <Text style={styles.infoText}>企業引薦碼由您的公司或組織提供</Text>
                </View>
                <View style={styles.infoItem}>
                  <Text style={styles.infoBullet}>•</Text>
                  <Text style={styles.infoText}>使用引薦碼可享有專屬功能和優惠</Text>
                </View>
                <View style={styles.infoItem}>
                  <Text style={styles.infoBullet}>•</Text>
                  <Text style={styles.infoText}>您可以隨時修改或移除引薦碼</Text>
                </View>
                <View style={styles.infoItem}>
                  <Text style={styles.infoBullet}>•</Text>
                  <Text style={styles.infoText}>如有疑問，請聯絡您的企業管理員</Text>
                </View>
              </View>
            </View>

            {/* Preview Benefits */}
            <View style={styles.previewCard}>
              <Text style={styles.previewTitle}>企業專屬福利包含：</Text>
              <View style={styles.benefitsList}>
                {[
                  { icon: 'star-outline', text: '免費進階功能存取' },
                  { icon: 'book-outline', text: '專屬企業練習課程' },
                  { icon: 'analytics-outline', text: '團隊統計報告' },
                  { icon: 'headset-outline', text: '優先客服支援' },
                ].map((item, index) => (
                  <View key={index} style={styles.previewBenefitItem}>
                    <Ionicons name={item.icon} size={18} color="#6B7280" />
                    <Text style={styles.previewBenefitText}>{item.text}</Text>
                  </View>
                ))}
              </View>
            </View>
          </>
        )}
      </ScrollView>

      {/* Remove Confirmation Modal */}
      <Modal
        visible={showRemoveConfirm}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowRemoveConfirm(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalIconContainer}>
              <Ionicons name="alert-circle" size={32} color="#DC2626" />
            </View>
            <Text style={styles.modalTitle}>確定要移除引薦碼嗎？</Text>
            <Text style={styles.modalDescription}>
              移除後將失去企業專屬福利，您可以隨時重新設定
            </Text>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={styles.modalCancelButton}
                onPress={() => setShowRemoveConfirm(false)}
                activeOpacity={0.7}
              >
                <Text style={styles.modalCancelText}>取消</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.modalConfirmButton}
                onPress={confirmDeleteCode}
                activeOpacity={0.7}
              >
                {isSaving ? (
                  <ActivityIndicator color="#FFF" size="small" />
                ) : (
                  <Text style={styles.modalConfirmText}>確定移除</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    paddingBottom: 24,
    paddingHorizontal: 20,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
  },
  headerPlaceholder: {
    width: 40,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    paddingHorizontal: 8,
    textAlign: 'center',
  },

  // Loading
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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

  // Success/Error Messages
  successMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
  },
  successText: {
    fontSize: 14,
    color: '#065F46',
  },
  errorMessage: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
  },
  errorText: {
    flex: 1,
    fontSize: 14,
    color: '#991B1B',
  },

  // Code Card
  codeCard: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 24,
    padding: 24,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.6)',
  },
  codeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  codeIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  codeInfo: {
    flex: 1,
  },
  codeLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  codeValue: {
    fontSize: 24,
    fontWeight: '600',
    color: '#166CB5',
    letterSpacing: 2,
  },
  codeEmpty: {
    fontSize: 16,
    color: '#9CA3AF',
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
    backgroundColor: 'rgba(22,108,181,0.1)',
    alignItems: 'center',
  },
  modifyButtonText: {
    fontSize: 15,
    fontWeight: '500',
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

  // Edit Card
  editCard: {
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(229,231,235,0.5)',
  },
  editSection: {
    marginBottom: 16,
  },
  editLabel: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 8,
    paddingHorizontal: 8,
  },
  editInput: {
    backgroundColor: '#FFF',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 18,
    color: '#1F2937',
    textAlign: 'center',
    letterSpacing: 2,
  },
  editHint: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 8,
    paddingHorizontal: 8,
  },
  editButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  saveButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#166CB5',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#166CB5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  saveButtonDisabled: {
    backgroundColor: '#E5E7EB',
    shadowOpacity: 0,
    elevation: 0,
  },
  saveButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFF',
  },
  saveButtonTextDisabled: {
    color: '#9CA3AF',
  },
  cancelButton: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#374151',
  },

  // Info Card
  infoCard: {
    backgroundColor: 'linear-gradient(135deg, #EFF6FF 0%, #ECFEFF 100%)',
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(191,219,254,0.5)',
    backgroundColor: '#EFF6FF',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937',
    marginBottom: 16,
  },
  infoList: {
    gap: 12,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  infoBullet: {
    color: '#166CB5',
    fontSize: 14,
    marginTop: 2,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20,
  },

  // Benefits Card
  benefitsCard: {
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(229,231,235,0.5)',
  },
  benefitsTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937',
    marginBottom: 16,
  },
  benefitsList: {
    gap: 12,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  benefitText: {
    fontSize: 14,
    color: '#4B5563',
  },

  // Empty State
  emptyCard: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 24,
    padding: 32,
    marginBottom: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.6)',
  },
  emptyIconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyDescription: {
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  addCodeButton: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  addCodeButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 32,
    paddingVertical: 16,
  },
  addCodeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },

  // Preview Card
  previewCard: {
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(229,231,235,0.5)',
  },
  previewTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937',
    marginBottom: 16,
  },
  previewBenefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  previewBenefitText: {
    fontSize: 14,
    color: '#6B7280',
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#FFF',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
  },
  modalIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  modalDescription: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  modalCancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
  },
  modalCancelText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#374151',
  },
  modalConfirmButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#DC2626',
    alignItems: 'center',
  },
  modalConfirmText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#FFF',
  },
});

export default EnterpriseCodeManagement;