// ==========================================
// 檔案名稱: ProfileEditScreen.js
// 功能: 個人資料編輯頁面
// 🎨 統一設計風格
// ==========================================

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  StatusBar,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const ProfileEditScreen = ({ navigation }) => {
  const [name, setName] = useState('Jennifer');
  const [email, setEmail] = useState('jennifer@example.com');
  const [phone, setPhone] = useState('+886 912 345 678');
  const [company, setCompany] = useState('ABC 科技公司');
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSave = async () => {
    if (!name || !email) {
      Alert.alert('錯誤', '請填寫必填欄位（姓名和電子郵件）');
      return;
    }

    setIsSaving(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setIsSaving(false);
    setShowSuccess(true);

    setTimeout(() => {
      setShowSuccess(false);
      Alert.alert('成功', '個人資料已更新', [
        { text: '確定', onPress: () => navigation.goBack() }
      ]);
    }, 1000);
  };

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
            <Ionicons name="arrow-back" size={24} color="#FFF" />
          </TouchableOpacity>
          
          <Text style={styles.headerTitle}>個人資料</Text>
          
          <View style={styles.headerSpacer} />
        </View>
      </LinearGradient>

      <KeyboardAvoidingView 
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView 
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Avatar Section */}
          <View style={styles.avatarSection}>
            <View style={styles.avatarCard}>
              <View style={styles.avatarContainer}>
                <LinearGradient
                  colors={['#166CB5', '#31C6FE']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.avatar}
                >
                  <Text style={styles.avatarText}>{name.charAt(0)}</Text>
                </LinearGradient>
                <TouchableOpacity style={styles.cameraButton}>
                  <Ionicons name="camera" size={16} color="#166CB5" />
                </TouchableOpacity>
              </View>
              <Text style={styles.avatarHint}>點擊相機圖示更換大頭貼</Text>
            </View>
          </View>

          {/* Form Fields */}
          <View style={styles.formContainer}>
            {/* Name */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>姓名 *</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="person-outline" size={20} color="#9CA3AF" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={name}
                  onChangeText={setName}
                  placeholder="請輸入姓名"
                  placeholderTextColor="#9CA3AF"
                />
              </View>
            </View>

            {/* Email */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>電子郵件 *</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="mail-outline" size={20} color="#9CA3AF" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="請輸入電子郵件"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
            </View>

            {/* Phone */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>電話號碼</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="call-outline" size={20} color="#9CA3AF" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={phone}
                  onChangeText={setPhone}
                  placeholder="請輸入電話號碼"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="phone-pad"
                />
              </View>
            </View>

            {/* Company */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>公司名稱</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="briefcase-outline" size={20} color="#9CA3AF" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={company}
                  onChangeText={setCompany}
                  placeholder="請輸入公司名稱"
                  placeholderTextColor="#9CA3AF"
                />
              </View>
            </View>

            {/* Info Box */}
            <View style={styles.infoBox}>
              <Ionicons name="information-circle" size={20} color="#3B82F6" />
              <Text style={styles.infoText}>
                💡 您的個人資料僅用於提供更好的服務體驗，我們會妥善保護您的隱私。
              </Text>
            </View>
          </View>
        </ScrollView>

        {/* Save Button */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={styles.saveButtonWrapper}
            onPress={handleSave}
            disabled={isSaving}
            activeOpacity={0.9}
          >
            <LinearGradient
              colors={isSaving ? ['#9CA3AF', '#9CA3AF'] : ['#166CB5', '#31C6FE']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.saveButton}
            >
              {isSaving ? (
                <ActivityIndicator color="#FFF" />
              ) : showSuccess ? (
                <>
                  <Ionicons name="checkmark-circle" size={20} color="#FFF" />
                  <Text style={styles.saveButtonText}>儲存成功！</Text>
                </>
              ) : (
                <Text style={styles.saveButtonText}>儲存變更</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
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
  
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  
  // Avatar Section
  avatarSection: {
    paddingHorizontal: 20,
    marginTop: -30,
    marginBottom: 20,
  },
  avatarCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.6)',
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#166CB5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  avatarText: {
    fontSize: 36,
    fontWeight: '700',
    color: '#FFF',
  },
  cameraButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 2,
    borderColor: '#FFF',
  },
  avatarHint: {
    fontSize: 12,
    color: '#6B7280',
  },
  
  // Form
  formContainer: {
    paddingHorizontal: 20,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
    paddingHorizontal: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    paddingHorizontal: 16,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 15,
    color: '#1F2937',
  },
  
  // Info Box
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    borderRadius: 16,
    padding: 14,
    marginTop: 8,
    gap: 12,
    alignItems: 'flex-start',
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: '#1E40AF',
    lineHeight: 19,
  },
  
  // Button
  buttonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  saveButtonWrapper: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#166CB5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  saveButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
});

export default ProfileEditScreen;