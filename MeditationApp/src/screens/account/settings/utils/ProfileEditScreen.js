// ==========================================
// 檔案名稱: ProfileEditScreen.js
// 版本: V6.0 - 背景色塊 + 頭像卡片浮動效果
// 
// ✅ Header + 背景色塊設計
// ✅ 頭像卡片浮在背景色塊上
// ✅ 企業引薦碼鎖定公司欄位
// ✅ 完整 API 串接
// ==========================================

import React, { useState, useEffect } from 'react';
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
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ApiService from '../../../../../api';

const ProfileEditScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // 用戶資料
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    bio: '',
    avatar: null,
    enterprise_code: null,
    enterprise_name: null,
  });

  // 表單資料
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    bio: '',
  });

  const [avatarUri, setAvatarUri] = useState(null);
  const [newAvatarUri, setNewAvatarUri] = useState(null);
  const [avatarChanged, setAvatarChanged] = useState(false);

  // ⭐ 是否有企業引薦碼（鎖定公司欄位）
  const [hasEnterpriseCode, setHasEnterpriseCode] = useState(false);

  useEffect(() => {
    loadUserProfile();
  }, []);

  // 注意：Android 13+ 會自動使用 Photo Picker，不需要權限
  // 舊版 Android 會在需要時自動請求權限

  // 載入用戶資料
  const loadUserProfile = async () => {
    try {
      console.log('📱 開始載入用戶資料...');
      
      const response = await ApiService.getUserProfile();
      console.log('✅ API 回應:', response);
      
      const user = response.user || response.data || response;
      
      // ⭐ 檢查是否有企業引薦碼
      const hasCode = !!user.enterprise_code;
      const displayCompany = user.enterprise_name || user.company || '';
      
      const profileData = {
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        company: displayCompany,
        bio: user.bio || '',
        avatar: user.avatar || null,
        enterprise_code: user.enterprise_code || null,
        enterprise_name: user.enterprise_name || null,
      };
      
      console.log('📦 處理後的資料:', profileData);
      console.log('🏢 企業引薦碼狀態:', hasCode ? '已綁定' : '未綁定');
      
      setUserData(profileData);
      setFormData({
        name: profileData.name,
        email: profileData.email,
        phone: profileData.phone,
        company: profileData.company,
        bio: profileData.bio,
      });
      setAvatarUri(profileData.avatar);
      setHasEnterpriseCode(hasCode);
      
      await AsyncStorage.setItem('userProfile', JSON.stringify(profileData));
      
    } catch (error) {
      console.error('❌ 載入用戶資料失敗:', error);
      
      try {
        const savedProfile = await AsyncStorage.getItem('userProfile');
        if (savedProfile) {
          const data = JSON.parse(savedProfile);
          setUserData(data);
          setFormData({
            name: data.name,
            email: data.email,
            phone: data.phone,
            company: data.company,
            bio: data.bio,
          });
          setAvatarUri(data.avatar);
          setHasEnterpriseCode(!!data.enterprise_code);
          console.log('📱 已從本地載入備份資料');
        }
      } catch (localError) {
        console.error('從本地載入失敗:', localError);
      }
    } finally {
      setLoading(false);
    }
  };

  // 處理輸入變更
  const handleInputChange = (field, value) => {
    // ⭐ 如果有企業引薦碼，禁止修改公司名稱
    if (field === 'company' && hasEnterpriseCode) {
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // 選擇圖片來源
  const handleSelectImageSource = () => {
    Alert.alert(
      '更換大頭貼',
      '請選擇圖片來源',
      [
        { text: '拍照', onPress: handleTakePhoto },
        { text: '從相簿選擇', onPress: handlePickImage },
        { text: '取消', style: 'cancel' },
      ]
    );
  };

  // 拍照
  const handleTakePhoto = async () => {
    try {
      // 請求相機權限
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('需要權限', '請允許使用相機以拍攝大頭貼');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled) {
        setAvatarUri(result.assets[0].uri);
        setNewAvatarUri(result.assets[0].uri);
        setAvatarChanged(true);
        console.log('📸 已選擇新頭像（拍照）');
      }
    } catch (error) {
      console.error('拍照失敗:', error);
      Alert.alert('錯誤', '拍照失敗，請稍後再試');
    }
  };

  // 從相簿選擇 (Android 13+ 使用 Photo Picker，無需權限)
  const handlePickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled) {
        setAvatarUri(result.assets[0].uri);
        setNewAvatarUri(result.assets[0].uri);
        setAvatarChanged(true);
        console.log('🖼️ 已選擇新頭像（相簿）');
      }
    } catch (error) {
      console.error('選擇圖片失敗:', error);
      Alert.alert('錯誤', '選擇圖片失敗，請稍後再試');
    }
  };

  // 驗證表單
  const validateForm = () => {
    if (!formData.name.trim()) {
      Alert.alert('錯誤', '請輸入姓名');
      return false;
    }

    if (!formData.email.trim()) {
      Alert.alert('錯誤', '請輸入電子郵件');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      Alert.alert('錯誤', '請輸入有效的電子郵件地址');
      return false;
    }

    if (formData.bio && formData.bio.length > 200) {
      Alert.alert('錯誤', '個人簡介不能超過 200 字');
      return false;
    }

    return true;
  };

  // 檢查是否有變更
  const hasChanges = () => {
    return (
      formData.name !== userData.name ||
      formData.email !== userData.email ||
      formData.phone !== userData.phone ||
      formData.company !== userData.company ||
      formData.bio !== userData.bio ||
      avatarChanged
    );
  };

  // 保存變更
  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    if (!hasChanges()) {
      Alert.alert('提示', '沒有任何變更');
      return;
    }

    setIsSaving(true);

    try {
      console.log('💾 開始保存用戶資料...');
      
      let result;

      if (avatarChanged && newAvatarUri) {
        console.log('🖼️ 偵測到新頭像，使用整合上傳方法...');
        result = await ApiService.updateProfileWithAvatar(formData, newAvatarUri);
      } else {
        console.log('📝 更新文字資料...');
        result = await ApiService.updateUserProfile(formData);
      }

      console.log('✅ API 更新成功:', result);
      
      const updatedUser = result.user || result.data || result;
      
      const finalData = {
        name: updatedUser.name || formData.name,
        email: updatedUser.email || formData.email,
        phone: updatedUser.phone || formData.phone,
        company: updatedUser.company || formData.company,
        bio: updatedUser.bio || formData.bio,
        avatar: updatedUser.avatar || avatarUri,
        enterprise_code: userData.enterprise_code,
        enterprise_name: userData.enterprise_name,
      };
      
      await AsyncStorage.setItem('userProfile', JSON.stringify(finalData));
      console.log('💾 已備份到本地');

      setUserData(finalData);
      setFormData({
        name: finalData.name,
        email: finalData.email,
        phone: finalData.phone,
        company: finalData.company,
        bio: finalData.bio,
      });
      setAvatarUri(finalData.avatar);
      setAvatarChanged(false);
      setNewAvatarUri(null);

      setIsSaving(false);
      setShowSuccess(true);

      setTimeout(() => {
        setShowSuccess(false);
        navigation.goBack();
      }, 1500);

    } catch (error) {
      console.error('❌ 保存失敗:', error);
      setIsSaving(false);
      
      Alert.alert(
        '錯誤', 
        error.message || '保存失敗，請稍後再試'
      );
    }
  };

  // 取消編輯
  const handleCancel = () => {
    if (hasChanges()) {
      Alert.alert(
        '確認離開',
        '您有未保存的變更，確定要離開嗎？',
        [
          { text: '繼續編輯', style: 'cancel' },
          { text: '離開', style: 'destructive', onPress: () => navigation.goBack() }
        ]
      );
    } else {
      navigation.goBack();
    }
  };

  // 渲染頭像
  const renderAvatar = () => {
    if (avatarUri) {
      return (
        <Image 
          source={{ uri: avatarUri }} 
          style={styles.avatarImage}
        />
      );
    } else {
      return (
        <LinearGradient
          colors={['#31C6FE', '#166CB5']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.avatarGradient}
        >
          <Text style={styles.avatarText}>
            {formData.name ? formData.name.charAt(0).toUpperCase() : 'U'}
          </Text>
        </LinearGradient>
      );
    }
  };

  if (loading) {
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
              activeOpacity={0.8}
            >
              <Ionicons name="arrow-back" size={24} color="#FFF" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>個人資料</Text>
            <View style={styles.headerSpacer} />
          </View>
        </LinearGradient>

        {/* ⭐ 背景色塊 - 漸層 */}
        <LinearGradient
          colors={['#166CB5', '#31C6FE']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.backgroundBlock}
        />

        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#166CB5" />
          <Text style={styles.loadingText}>載入中...</Text>
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
        end={{ x: 1, y: 0 }}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={handleCancel}
            activeOpacity={0.8}
          >
            <Ionicons name="arrow-back" size={24} color="#FFF" />
          </TouchableOpacity>
          
          <Text style={styles.headerTitle}>個人資料</Text>
          
          <View style={styles.headerSpacer} />
        </View>
      </LinearGradient>

      {/* ⭐ 背景色塊 - 被 Header 遮住 */}
      <LinearGradient
          colors={['#166CB5', '#31C6FE']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.backgroundBlock}
        />

      <KeyboardAvoidingView 
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView 
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* ⭐ Avatar Section - 浮在背景色塊上 */}
          <View style={styles.avatarSectionWrapper}>
            <View style={styles.avatarCard}>
              <TouchableOpacity 
                style={styles.avatarContainer}
                onPress={handleSelectImageSource}
                activeOpacity={0.8}
              >
                {renderAvatar()}
                <View style={styles.cameraButton}>
                  <Ionicons name="camera" size={16} color="#166CB5" />
                </View>
              </TouchableOpacity>
              <Text style={styles.avatarHint}>點擊相機圖示更換大頭貼</Text>
            </View>
          </View>

          {/* Form Fields */}
          <View style={styles.formContainer}>
            {/* Name */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>姓名</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="person-outline" size={20} color="#9CA3AF" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={formData.name}
                  onChangeText={(value) => handleInputChange('name', value)}
                  placeholder="請輸入姓名"
                  placeholderTextColor="#9CA3AF"
                />
              </View>
            </View>

            {/* Email */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>電子郵件</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="mail-outline" size={20} color="#9CA3AF" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={formData.email}
                  onChangeText={(value) => handleInputChange('email', value)}
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
                  value={formData.phone}
                  onChangeText={(value) => handleInputChange('phone', value)}
                  placeholder="請輸入電話號碼"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="phone-pad"
                />
              </View>
            </View>

            {/* Company - ⭐ 企業引薦碼鎖定 */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>公司名稱</Text>
              <View style={[
                styles.inputWrapper,
                hasEnterpriseCode && styles.inputWrapperDisabled
              ]}>
                <Ionicons 
                  name="briefcase-outline" 
                  size={20} 
                  color={hasEnterpriseCode ? "#D1D5DB" : "#9CA3AF"} 
                  style={styles.inputIcon} 
                />
                <TextInput
                  style={[
                    styles.input,
                    hasEnterpriseCode && styles.inputDisabled
                  ]}
                  value={formData.company}
                  onChangeText={(value) => handleInputChange('company', value)}
                  placeholder={hasEnterpriseCode ? "由企業引薦碼自動填入" : "請輸入公司名稱"}
                  placeholderTextColor="#828892ff"
                  editable={!hasEnterpriseCode}
                />
                {hasEnterpriseCode && (
                  <Ionicons name="lock-closed" size={16} color="#878d98ff" />
                )}
              </View>
              {hasEnterpriseCode && (
                <Text style={styles.lockedHint}>
                  此欄位由企業引薦碼自動填入，無法修改
                </Text>
              )}
            </View>

            {/* Info Box */}
            <View style={styles.infoBox}>
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
            disabled={isSaving || !hasChanges()}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={
                isSaving || !hasChanges() 
                  ? ['#D1D5DB', '#9CA3AF'] 
                  : ['#166CB5', '#31C6FE']
              }
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.saveButton}
            >
              {isSaving ? (
                <>
                  <ActivityIndicator color="#FFF" size="small" style={{ marginRight: 8 }} />
                  <Text style={styles.saveButtonText}>儲存中...</Text>
                </>
              ) : showSuccess ? (
                <>
                  <Ionicons name="checkmark-circle" size={20} color="#FFF" style={{ marginRight: 8 }} />
                  <Text style={styles.saveButtonText}>儲存成功！</Text>
                </>
              ) : (
                <Text style={styles.saveButtonText}>
                  {hasChanges() ? '儲存變更' : '沒有變更'}
                </Text>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6B7280',
  },
  
  // ⭐ Header - 正常高度
  header: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    zIndex: 2, // ⭐ 確保在背景色塊上方
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
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
  },
  headerSpacer: {
    width: 40,
  },
  
  // ⭐ 背景色塊 - 被 Header 遮住一部分
  backgroundBlock: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 200,
    zIndex: 1,
  },
  
  keyboardView: {
    flex: 1,
    zIndex: 3, // ⭐ 確保內容在最上方
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 20, // ⭐ 距離 Header 的間距
    paddingBottom: 100,
  },
  
  // ⭐ Avatar Section - 浮在背景色塊上
  avatarSectionWrapper: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  avatarCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatarGradient: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#93C5FD',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 5,
  },
  avatarImage: {
    width: 96,
    height: 96,
    borderRadius: 48,
  },
  avatarText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFFFFF',
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
    color: '#9CA3AF',
  },
  
  // Form
  formContainer: {
    paddingHorizontal: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    paddingHorizontal: 16,
    height: 52,
  },
  inputWrapperDisabled: {
    backgroundColor: '#F9FAFB',
    borderColor: '#E5E7EB',
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#1F2937',
  },
  inputDisabled: {
    color: '#9CA3AF',
  },
  lockedHint: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 6,
    paddingHorizontal: 4,
  },
  
  // Info Box
  infoBox: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    borderRadius: 16,
    padding: 16,
    marginTop: 8,
  },
  infoText: {
    fontSize: 13,
    color: '#1E40AF',
    lineHeight: 20,
  },
  
  // Button
  buttonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  saveButtonWrapper: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  saveButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ProfileEditScreen;