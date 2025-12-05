// ==========================================
// 檔案名稱: DeleteAccountScreen.js
// 版本: V3.0 - 修正導航錯誤
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
  ActivityIndicator,
  Modal,
} from 'react-native';
import { CommonActions } from '@react-navigation/native'; // ⭐ 新增
import Ionicons from 'react-native-vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import ApiService from '../../../../../api';

const DeleteAccountScreen = ({ navigation }) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const handleConfirmDelete = () => {
    Alert.alert(
      '最後確認',
      '您真的確定要刪除帳號嗎？此操作無法復原！',
      [
        { text: '我再想想', style: 'cancel' },
        {
          text: '確認刪除',
          style: 'destructive',
          onPress: handleDeleteAccount,
        },
      ]
    );
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    
    try {
      // 呼叫真實的刪除帳號 API
      await ApiService.deleteAccount();
      
      // 顯示成功 Modal
      setShowSuccessModal(true);
      
    } catch (error) {
      console.error('刪除帳號失敗:', error);
      Alert.alert('錯誤', error.message || '刪除帳號失敗，請稍後再試');
      setIsDeleting(false);
    }
  };

  const handleNavigateToLogin = () => {
    setShowSuccessModal(false);
    
    // ⭐ 使用 reset 清空導航堆疊
    setTimeout(() => {
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: 'Login' }],
        })
      );
    }, 100);
  };

  // ⭐ 安全的返回函數
  const handleGoBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      // 如果沒有可返回的頁面,導航到設定頁
      navigation.navigate('Settings');
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={handleGoBack} // ⭐ 使用安全的返回函數
          activeOpacity={0.7}
          disabled={isDeleting}
        >
          <Ionicons name="chevron-back" size={24} color="#6B7280" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>刪除帳號</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Warning Icon */}
        <View style={styles.iconContainer}>
          <View style={styles.iconCircle}>
            <Ionicons name="alert-circle" size={64} color="#EF4444" />
          </View>
        </View>

        {/* Title */}
        <Text style={styles.title}>您確定要刪除帳號嗎？</Text>

        {/* Description */}
        <Text style={styles.description}>
          此動作無法復原。您的所有個人資料、練習記錄、情緒追蹤數據將會被
          <Text style={styles.dangerText}>永久刪除</Text>。
        </Text>

        {/* Warning Card */}
        <View style={styles.warningCard}>
          <Text style={styles.warningCardTitle}>您將失去以下內容：</Text>
          
          <View style={styles.warningItem}>
            <View style={styles.bullet} />
            <Text style={styles.warningItemText}>
              所有的心理肌力練習記錄
            </Text>
          </View>

          <View style={styles.warningItem}>
            <View style={styles.bullet} />
            <Text style={styles.warningItemText}>
              心情溫度計與日記歷史數據
            </Text>
          </View>

          <View style={styles.warningItem}>
            <View style={styles.bullet} />
            <Text style={styles.warningItemText}>
              個人化設定與偏好
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Footer Buttons */}
      <View style={styles.footer}>
        {/* Delete Button */}
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={handleConfirmDelete}
          disabled={isDeleting}
          activeOpacity={0.8}
        >
          <View style={styles.deleteButtonContent}>
            {isDeleting ? (
              <>
                <ActivityIndicator color="#FFF" size="small" />
                <Text style={styles.deleteButtonText}>刪除中...</Text>
              </>
            ) : (
              <>
                <Ionicons name="trash-outline" size={20} color="#FFF" />
                <Text style={styles.deleteButtonText}>確認刪除帳號</Text>
              </>
            )}
          </View>
        </TouchableOpacity>

        {/* Cancel Button */}
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={handleGoBack} // ⭐ 使用安全的返回函數
          disabled={isDeleting}
          activeOpacity={0.8}
        >
          <Text style={styles.cancelButtonText}>暫不刪除</Text>
        </TouchableOpacity>
      </View>

      {/* Success Modal */}
      <Modal
        visible={showSuccessModal}
        transparent={true}
        animationType="fade"
        onRequestClose={handleNavigateToLogin}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.successModal}>
            {/* Success Icon */}
            <View style={styles.successIconCircle}>
              <Ionicons name="checkmark-circle" size={80} color="#10B981" />
            </View>

            {/* Success Title */}
            <Text style={styles.successTitle}>帳號已成功刪除</Text>

            {/* Success Message */}
            <Text style={styles.successMessage}>
              您的所有資料已被永久刪除。{'\n'}
              感謝您使用路晰書，期待未來再次相見！
            </Text>

            {/* Login Button */}
            <TouchableOpacity
              style={styles.loginButtonContainer}
              onPress={handleNavigateToLogin}
              activeOpacity={0.9}
            >
              <LinearGradient
                colors={['#166CB5', '#31C6FE']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.loginButton}
              >
                <Text style={styles.loginButtonText}>立即登入</Text>
              </LinearGradient>
            </TouchableOpacity>
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
    backgroundColor: '#FFF',
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
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
    paddingTop: 40,
    paddingBottom: 200,
    alignItems: 'center',
  },

  // Icon
  iconContainer: {
    marginBottom: 24,
  },
  iconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Title & Description
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 16,
  },
  description: {
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  dangerText: {
    fontWeight: 'bold',
    color: '#EF4444',
  },

  // Warning Card
  warningCard: {
    width: '100%',
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  warningCardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
  },
  warningItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  bullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#9CA3AF',
    marginTop: 6,
    marginRight: 12,
  },
  warningItemText: {
    flex: 1,
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },

  // Footer
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 24,
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },

  // Delete Button
  deleteButton: {
    backgroundColor: '#EF4444',
    borderRadius: 12,
    paddingVertical: 14,
    marginBottom: 12,
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  deleteButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  deleteButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF',
  },

  // Cancel Button
  cancelButton: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingVertical: 14,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#6B7280',
    textAlign: 'center',
  },

  // Success Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  successModal: {
    backgroundColor: '#FFF',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.3,
    shadowRadius: 40,
    elevation: 20,
  },
  successIconCircle: {
    marginBottom: 24,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
    textAlign: 'center',
  },
  successMessage: {
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  loginButtonContainer: {
    width: '100%',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#166CB5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  loginButton: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  loginButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF',
  },
});

export default DeleteAccountScreen;