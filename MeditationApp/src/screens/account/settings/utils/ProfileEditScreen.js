// ==========================================
// 檔案名稱: ProfileEditScreen.js
// 功能: 個人資料編輯頁面（完整串接 API 版）
// 
// ✅ 從後端 API 獲取用戶資料
// ✅ 更新用戶資料到資料庫
// ✅ 上傳頭像到伺服器
// ✅ 本地備份（離線支援）
// 🎨 統一設計風格
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
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ApiService from '../../../../services'; // 根據你的目錄結構

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
  });

  // 表單資料
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    bio: '',
    avatar: null,
  });

  const [avatarChanged, setAvatarChanged] = useState(false);
  const [newAvatarUri, setNewAvatarUri] = useState(null); // 新頭像的本地 URI

  useEffect(() => {
    loadUserProfile();
    requestPermissions();
  }, []);

  // 請求權限
  const requestPermissions = async () => {
    if (Platform.OS !== 'web') {
      await ImagePicker.requestCameraPermissionsAsync();
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    }
  };

  // 載入用戶資料
  const loadUserProfile = async () => {
    try {
      console.log('📱 開始載入用戶資料...');
      
      // 從 API 獲取用戶資料
      const response = await ApiService.getUserProfile();
      console.log('✅ API 回應:', response);
      
      // 處理不同的 API 回應格式
      let data;
      if (response.user) {
        // 格式: {"user": {...}}
        data = response.user;
      } else if (response.data) {
        // 格式: {"data": {...}}
        data = response.data;
      } else {
        // 直接格式: {...}
        data = response;
      }
      
      const profileData = {
        name: data.name || data.username || '',
        email: data.email || '',
        phone: data.phone || data.phone_number || '',
        company: data.company || data.company_name || '',
        bio: data.bio || data.description || '',
        avatar: data.avatar || data.avatar_url || data.profile_image || null,
      };
      
      console.log('📦 處理後的資料:', profileData);
      
      setUserData(profileData);
      setFormData(profileData);
      
      // 同時保存到本地（備份）
      await AsyncStorage.setItem('userProfile', JSON.stringify(profileData));
      
    } catch (error) {
      console.error('❌ 載入用戶資料失敗:', error);
      
      // 如果 API 失敗，嘗試從本地載入
      try {
        const savedProfile = await AsyncStorage.getItem('userProfile');
        if (savedProfile) {
          const data = JSON.parse(savedProfile);
          setUserData(data);
          setFormData(data);
          console.log('📱 已從本地載入備份資料');
        } else {
          // 使用預設值
          const defaultData = {
            name: '',
            email: '',
            phone: '',
            company: '',
            bio: '',
            avatar: null,
          };
          setUserData(defaultData);
          setFormData(defaultData);
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
        {
          text: '拍照',
          onPress: handleTakePhoto,
        },
        {
          text: '從相簿選擇',
          onPress: handlePickImage,
        },
        {
          text: '取消',
          style: 'cancel',
        },
      ]
    );
  };

  // 拍照
  const handleTakePhoto = async () => {
    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled) {
        setFormData(prev => ({
          ...prev,
          avatar: result.assets[0].uri
        }));
        setNewAvatarUri(result.assets[0].uri);
        setAvatarChanged(true);
        console.log('📸 已選擇新頭像（拍照）:', result.assets[0].uri);
      }
    } catch (error) {
      console.error('拍照失敗:', error);
      Alert.alert('錯誤', '拍照失敗，請稍後再試');
    }
  };

  // 從相簿選擇
  const handlePickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled) {
        setFormData(prev => ({
          ...prev,
          avatar: result.assets[0].uri
        }));
        setNewAvatarUri(result.assets[0].uri);
        setAvatarChanged(true);
        console.log('🖼️ 已選擇新頭像（相簿）:', result.assets[0].uri);
      }
    } catch (error) {
      console.error('選擇圖片失敗:', error);
      Alert.alert('錯誤', '選擇圖片失敗，請稍後再試');
    }
  };

  // 驗證表單
  const validateForm = () => {
    if (!formData || !formData.name || !formData.name.trim()) {
      Alert.alert('錯誤', '請輸入姓名');
      return false;
    }

    if (!formData.email || !formData.email.trim()) {
      Alert.alert('錯誤', '請輸入電子郵件');
      return false;
    }

    // Email 驗證
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      Alert.alert('錯誤', '請輸入有效的電子郵件地址');
      return false;
    }

    // 個人簡介長度限制
    if (formData.bio && formData.bio.length > 200) {
      Alert.alert('錯誤', '個人簡介不能超過 200 字');
      return false;
    }

    return true;
  };

  // 檢查是否有變更
  const hasChanges = () => {
    if (!formData || !userData) return false;
    
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

    setIsSaving(true);

    try {
      console.log('💾 開始保存用戶資料...');
      
      // 準備要更新的資料
      const updateData = {
        name: formData?.name || '',
        email: formData?.email || '',
        phone: formData?.phone || '',
        company: formData?.company || '',
        bio: formData?.bio || '',
        avatar: formData?.avatar || null,
      };

      let result;

      // 如果有上傳新頭像
      if (avatarChanged && newAvatarUri) {
        console.log('🖼️ 偵測到新頭像，使用整合上傳方法...');
        result = await ApiService.updateProfileWithAvatar(updateData, newAvatarUri);
      } else {
        // 只更新文字資料
        console.log('📝 更新文字資料...');
        result = await ApiService.updateUserProfile(updateData);
      }

      console.log('✅ API 更新成功:', result);
      
      // 更新成功後的資料（從 API 回應中取得）
      let updatedData;
      if (result.user) {
        // 格式: {"user": {...}}
        updatedData = result.user;
      } else if (result.data) {
        // 格式: {"data": {...}}
        updatedData = result.data;
      } else {
        // 直接格式: {...}
        updatedData = result;
      }
      
      const finalData = {
        name: updatedData.name || updateData.name,
        email: updatedData.email || updateData.email,
        phone: updatedData.phone || updateData.phone,
        company: updatedData.company || updateData.company,
        bio: updatedData.bio || updateData.bio,
        avatar: updatedData.avatar || updatedData.avatar_url || updateData.avatar,
      };
      
      // 保存到本地（備份）
      await AsyncStorage.setItem('userProfile', JSON.stringify(finalData));
      console.log('💾 已備份到本地');

      // 更新原始資料
      setUserData(finalData);
      setFormData(finalData);
      setAvatarChanged(false);
      setNewAvatarUri(null);

      // 顯示成功動畫
      setIsSaving(false);
      setShowSuccess(true);

      setTimeout(() => {
        setShowSuccess(false);
        Alert.alert('成功', '個人資料已更新', [
          { text: '確定', onPress: () => navigation.goBack() }
        ]);
      }, 1000);

    } catch (error) {
      console.error('❌ 保存失敗:', error);
      setIsSaving(false);
      
      // 顯示更詳細的錯誤訊息
      let errorMessage = '保存失敗，請稍後再試';
      if (error.message) {
        errorMessage = error.message;
      }
      
      Alert.alert('錯誤', errorMessage);
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
          {
            text: '離開',
            style: 'destructive',
            onPress: () => navigation.goBack()
          }
        ]
      );
    } else {
      navigation.goBack();
    }
  };

  // 渲染頭像
  const renderAvatar = () => {
    if (formData && formData.avatar) {
      return (
        <Image 
          source={{ uri: formData.avatar }} 
          style={styles.avatarImage}
        />
      );
    } else {
      const displayName = formData && formData.name ? formData.name : 'U';
      return (
        <LinearGradient
          colors={['#166CB5', '#31C6FE']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.avatar}
        >
          <Text style={styles.avatarText}>
            {displayName.charAt(0).toUpperCase()}
          </Text>
        </LinearGradient>
      );
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#166CB5" />
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
              <Text style={styles.inputLabel}>姓名 *</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="person-outline" size={20} color="#9CA3AF" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={formData?.name || ''}
                  onChangeText={(value) => handleInputChange('name', value)}
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
                  value={formData?.email || ''}
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
                  value={formData?.phone || ''}
                  onChangeText={(value) => handleInputChange('phone', value)}
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
                  value={formData?.company || ''}
                  onChangeText={(value) => handleInputChange('company', value)}
                  placeholder="請輸入公司名稱"
                  placeholderTextColor="#9CA3AF"
                />
              </View>
            </View>

            {/* Bio */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>個人簡介</Text>
              <View style={[styles.inputWrapper, styles.textAreaWrapper]}>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={formData?.bio || ''}
                  onChangeText={(value) => handleInputChange('bio', value)}
                  placeholder="介紹一下自己..."
                  placeholderTextColor="#9CA3AF"
                  multiline
                  numberOfLines={4}
                  maxLength={200}
                  textAlignVertical="top"
                />
              </View>
              <Text style={styles.charCount}>
                {(formData && formData.bio) ? formData.bio.length : 0}/200 字
              </Text>
            </View>

            {/* Info Box */}
            <View style={styles.infoBox}>
              <Ionicons name="information-circle" size={20} color="#3B82F6" />
              <Text style={styles.infoText}>
                💡 您的個人資料會即時同步到伺服器，並自動備份到本地裝置。
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
            activeOpacity={0.9}
          >
            <LinearGradient
              colors={
                isSaving || !hasChanges() 
                  ? ['#9CA3AF', '#9CA3AF'] 
                  : ['#166CB5', '#31C6FE']
              }
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.saveButton}
            >
              {isSaving ? (
                <>
                  <ActivityIndicator color="#FFF" size="small" />
                  <Text style={styles.saveButtonText}>儲存中...</Text>
                </>
              ) : showSuccess ? (
                <>
                  <Ionicons name="checkmark-circle" size={20} color="#FFF" />
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
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 8,
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
  avatarImage: {
    width: 96,
    height: 96,
    borderRadius: 48,
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
  textAreaWrapper: {
    alignItems: 'flex-start',
    minHeight: 100,
    paddingVertical: 12,
  },
  textArea: {
    paddingTop: 0,
    paddingBottom: 0,
  },
  charCount: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'right',
    marginTop: 4,
    paddingHorizontal: 8,
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